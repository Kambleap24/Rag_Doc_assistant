from fastapi import APIRouter, HTTPException
from app.models.schemas import QueryRequest, QueryResponse
from app.services.rag_service import RAGService

router = APIRouter()
_rag_service = None


def get_rag_service():
    global _rag_service
    if _rag_service is None:
        _rag_service = RAGService()
    return _rag_service


@router.post("/", response_model=QueryResponse)
async def query_documents(request: QueryRequest):
    try:
        service = get_rag_service()
        result = await service.query(request.question, request.session_id)
        return result
    except Exception as e:
        raise HTTPException(500, f"Query failed: {str(e)}")


@router.delete("/session/{session_id}")
async def clear_session(session_id: str):
    service = get_rag_service()
    service.clear_session(session_id)
    return {"message": f"Session {session_id} cleared"}