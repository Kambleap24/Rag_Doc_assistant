from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class QueryRequest(BaseModel):
    question: str = Field(..., min_length=3, max_length=1000)
    session_id: str = Field(default="default", max_length=64)


class SourceChunk(BaseModel):
    source: str
    page: int
    chunk_index: int
    excerpt: str


class QueryResponse(BaseModel):
    answer: str
    sources: List[SourceChunk]
    latency_ms: int
    session_id: str


class DocumentInfo(BaseModel):
    filename: str
    chunks: int
    doc_hash: str


class IngestResponse(BaseModel):
    filename: str
    pages: int
    chunks: int
    doc_hash: str
    ingest_time_s: float


class DeleteResponse(BaseModel):
    deleted: int
    filename: str


class HealthResponse(BaseModel):
    status: str
    version: str
    vectorstore_docs: int
    timestamp: str
