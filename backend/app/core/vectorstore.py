import os
import logging
import chromadb
from chromadb.config import Settings as ChromaSettings
from langchain_chroma import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from app.core.config import settings


logging.getLogger("chromadb.telemetry").setLevel(logging.ERROR)

_vectorstore: Chroma | None = None


async def init_vectorstore():
    global _vectorstore
    os.makedirs(settings.CHROMA_PERSIST_DIR, exist_ok=True)

    embeddings = GoogleGenerativeAIEmbeddings(
        model="models/gemini-embedding-001",
        google_api_key=settings.GOOGLE_API_KEY,
    
    )

    client = chromadb.PersistentClient(
        path=settings.CHROMA_PERSIST_DIR,
        settings=ChromaSettings(anonymized_telemetry=False),
    )

    _vectorstore = Chroma(
        client=client,
        collection_name=settings.CHROMA_COLLECTION,
        embedding_function=embeddings,
    )
    return _vectorstore


def get_vectorstore() -> Chroma:
    if _vectorstore is None:
        raise RuntimeError("Vectorstore not initialized")
    return _vectorstore