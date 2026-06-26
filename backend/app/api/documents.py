import os
import shutil
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from typing import List

from app.models.schemas import IngestResponse, DocumentInfo, DeleteResponse
from app.services.document_service import DocumentService
from app.core.config import settings

router = APIRouter()


def get_doc_service():
    return DocumentService()


@router.post("/upload", response_model=IngestResponse)
async def upload_document(
    file: UploadFile = File(...),
    service: DocumentService = Depends(get_doc_service),
):
    allowed = {".pdf", ".txt", ".docx", ".doc"}
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed:
        raise HTTPException(400, f"File type {ext} not supported. Allowed: {allowed}")

    size_mb = 0
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(settings.UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as f:
        while chunk := await file.read(1024 * 1024):
            size_mb += len(chunk) / (1024 * 1024)
            if size_mb > settings.MAX_FILE_SIZE_MB:
                raise HTTPException(413, f"File exceeds {settings.MAX_FILE_SIZE_MB}MB limit")
            f.write(chunk)

    try:
        result = await service.ingest_document(file_path, file.filename)
    except Exception as e:
        os.remove(file_path)
        raise HTTPException(500, f"Ingestion failed: {str(e)}")

    return result


@router.get("/", response_model=List[DocumentInfo])
async def list_documents(service: DocumentService = Depends(get_doc_service)):
    return await service.list_documents()


@router.delete("/{filename}", response_model=DeleteResponse)
async def delete_document(
    filename: str,
    service: DocumentService = Depends(get_doc_service),
):
    result = await service.delete_document(filename)
    if result["deleted"] == 0:
        raise HTTPException(404, f"Document '{filename}' not found")
    return result
