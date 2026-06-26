from fastapi import APIRouter
from datetime import datetime
from app.models.schemas import HealthResponse
from app.core.vectorstore import get_vectorstore

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check():
    try:
        vs = get_vectorstore()
        count = vs._collection.count()
    except Exception:
        count = 0

    return {
        "status": "healthy",
        "version": "1.0.0",
        "vectorstore_docs": count,
        "timestamp": datetime.utcnow().isoformat(),
    }
