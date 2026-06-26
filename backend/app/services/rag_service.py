import os
import time
from typing import List, Dict, Any

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferWindowMemory
from langchain_core.documents import Document

from app.core.config import settings
from app.core.vectorstore import get_vectorstore
from app.core.prompts import RAG_PROMPT_TEMPLATE


class RAGService:
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(
            model=settings.GEMINI_MODEL,
            google_api_key=settings.GOOGLE_API_KEY,
            max_output_tokens=settings.MAX_TOKENS,
            temperature=0.1,
            convert_system_message_to_human=True,
        )
        self._sessions: Dict[str, ConversationBufferWindowMemory] = {}

    def _get_memory(self, session_id: str) -> ConversationBufferWindowMemory:
        if session_id not in self._sessions:
            self._sessions[session_id] = ConversationBufferWindowMemory(
                k=5,
                memory_key="chat_history",
                return_messages=True,
                output_key="answer",
            )
        return self._sessions[session_id]

    def _format_sources(self, docs: List[Document]) -> List[Dict]:
        sources = []
        for doc in docs:
            sources.append({
                "source": doc.metadata.get("source", "unknown"),
                "page": doc.metadata.get("page", 0),
                "chunk_index": doc.metadata.get("chunk_index", 0),
                "excerpt": doc.page_content[:200] + "..." if len(doc.page_content) > 200 else doc.page_content,
            })
        return sources

    async def query(self, question: str, session_id: str = "default") -> Dict[str, Any]:
        start = time.time()
        vs = get_vectorstore()

        doc_count = vs._collection.count()
        fetch_k = max(1, min(20, doc_count))
        top_k = max(1, min(settings.TOP_K_RESULTS, doc_count))

        retriever = vs.as_retriever(
            search_type="mmr",
            search_kwargs={"k": top_k, "fetch_k": fetch_k},
        )
        memory = self._get_memory(session_id)

        chain = ConversationalRetrievalChain.from_llm(
            llm=self.llm,
            retriever=retriever,
            memory=memory,
            combine_docs_chain_kwargs={"prompt": RAG_PROMPT_TEMPLATE},
            return_source_documents=True,
            verbose=False,
        )

        result = await chain.ainvoke({"question": question})
        elapsed = time.time() - start

        return {
            "answer": result["answer"],
            "sources": self._format_sources(result.get("source_documents", [])),
            "latency_ms": round(elapsed * 1000),
            "session_id": session_id,
        }

    def clear_session(self, session_id: str):
        if session_id in self._sessions:
            del self._sessions[session_id]