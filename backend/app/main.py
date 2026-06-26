from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.api import documents, query, health
from app.core.config import settings
from app.core.vectorstore import init_vectorstore


app = FastAPI()

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_vectorstore()
    yield


app = FastAPI(
    title="RAG Document Assistant API",
    version="1.0.0",
    description="Production-grade RAG pipeline with LangChain + ChromaDB",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, tags=["health"])
app.include_router(documents.router, prefix="/api/v1/documents", tags=["documents"])
app.include_router(query.router, prefix="/api/v1/query", tags=["query"])
