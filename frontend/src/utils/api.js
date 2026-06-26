import axios from 'axios';

const API_BASE = 'http://127.0.0.1:8000/api/v1';

const client = axios.create({ baseURL: API_BASE, timeout: 60000 });

export const uploadDocument = async (file, onProgress) => {
  const form = new FormData();
  form.append('file', file);
  const { data } = await client.post('/documents/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => onProgress?.(Math.round((e.loaded / e.total) * 100)),
  });
  return data;
};

export const listDocuments = async () => {
  const { data } = await client.get('/documents/');
  return data;
};

export const deleteDocument = async (filename) => {
  const { data } = await client.delete(`/documents/${encodeURIComponent(filename)}`);
  return data;
};

export const queryDocuments = async (question, sessionId) => {
  const { data } = await client.post('/query/', { question, session_id: sessionId });
  return data;
};

export const clearSession = async (sessionId) => {
  await client.delete(`/query/session/${sessionId}`);
};

export const getHealth = async () => {
  const { data } = await axios.get('http://127.0.0.1:8000/health');
  return data;
};