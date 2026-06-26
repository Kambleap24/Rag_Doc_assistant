from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Gemini
    GOOGLE_API_KEY: str = "your-gemini-api-key"
    GEMINI_MODEL: str = "gemini-1.5-flash"
    EMBEDDING_MODEL: str = "models/embedding-001"

    # ChromaDB
    CHROMA_PERSIST_DIR: str = "/app/data/chroma"
    CHROMA_COLLECTION: str = "rag_documents"

    # RAG params
    CHUNK_SIZE: int = 1000
    CHUNK_OVERLAP: int = 200
    TOP_K_RESULTS: int = 5
    MAX_TOKENS: int = 1500

    # App
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://frontend:3000"]
    UPLOAD_DIR: str = "/app/data/uploads"
    MAX_FILE_SIZE_MB: int = 50

    class Config:
        env_file = ".env"


settings = Settings()