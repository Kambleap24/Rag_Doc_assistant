import os
import time
import hashlib
from pathlib import Path
from typing import List, Dict, Any

from langchain_community.document_loaders import PyPDFLoader, TextLoader, Docx2txtLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema import Document

from app.core.config import settings
from app.core.vectorstore import get_vectorstore


class DocumentService:
    def __init__(self):
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=settings.CHUNK_SIZE,
            chunk_overlap=settings.CHUNK_OVERLAP,
            separators=["\n\n", "\n", ". ", " ", ""],
        )

    def _get_loader(self, file_path: str):
        ext = Path(file_path).suffix.lower()
        if ext == ".pdf":
            return PyPDFLoader(file_path)
        elif ext == ".txt":
            return TextLoader(file_path)
        elif ext in [".doc", ".docx"]:
            return Docx2txtLoader(file_path)
        else:
            raise ValueError(f"Unsupported file type: {ext}")

    def _compute_hash(self, file_path: str) -> str:
        with open(file_path, "rb") as f:
            return hashlib.md5(f.read()).hexdigest()

    async def ingest_document(self, file_path: str, filename: str) -> Dict[str, Any]:
        start = time.time()

        loader = self._get_loader(file_path)
        raw_docs: List[Document] = loader.load()

        chunks = self.text_splitter.split_documents(raw_docs)
        doc_hash = self._compute_hash(file_path)

        for i, chunk in enumerate(chunks):
            chunk.metadata.update({
                "source": filename,
                "doc_hash": doc_hash,
                "chunk_index": i,
                "total_chunks": len(chunks),
            })

        vs = get_vectorstore()
        vs.add_documents(chunks)

        elapsed = time.time() - start
        return {
            "filename": filename,
            "pages": len(raw_docs),
            "chunks": len(chunks),
            "doc_hash": doc_hash,
            "ingest_time_s": round(elapsed, 2),
        }

    async def list_documents(self) -> List[Dict[str, Any]]:
        vs = get_vectorstore()
        collection = vs._collection
        result = collection.get(include=["metadatas"])
        
        seen = {}
        for meta in result["metadatas"]:
            src = meta.get("source", "unknown")
            if src not in seen:
                seen[src] = {
                    "filename": src,
                    "chunks": 0,
                    "doc_hash": meta.get("doc_hash", ""),
                }
            seen[src]["chunks"] += 1

        return list(seen.values())

    async def delete_document(self, filename: str) -> Dict[str, Any]:
        vs = get_vectorstore()
        collection = vs._collection
        result = collection.get(include=["metadatas"])

        ids_to_delete = [
            result["ids"][i]
            for i, meta in enumerate(result["metadatas"])
            if meta.get("source") == filename
        ]

        if ids_to_delete:
            collection.delete(ids=ids_to_delete)

        return {"deleted": len(ids_to_delete), "filename": filename}
