import { useState, useEffect, useCallback } from 'react';
import { listDocuments, uploadDocument, deleteDocument } from '../utils/api';

export function useDocuments() {
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const docs = await listDocuments();
      setDocuments(docs);
    } catch (err) {
      setError('Failed to load documents');
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const upload = useCallback(async (file) => {
    setUploading(true);
    setUploadProgress(0);
    setError(null);
    try {
      const result = await uploadDocument(file, setUploadProgress);
      await refresh();
      return result;
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed');
      throw err;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [refresh]);

  const remove = useCallback(async (filename) => {
    setError(null);
    try {
      await deleteDocument(filename);
      await refresh();
    } catch (err) {
      setError(err.response?.data?.detail || 'Delete failed');
    }
  }, [refresh]);

  return { documents, uploading, uploadProgress, error, upload, remove, refresh };
}
