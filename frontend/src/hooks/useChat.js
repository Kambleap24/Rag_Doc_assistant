import { useState, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { queryDocuments, clearSession } from '../utils/api';

export function useChat() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const sessionId = useRef(uuidv4());

  const sendMessage = useCallback(async (question) => {
    setError(null);
    const userMsg = { id: uuidv4(), role: 'user', content: question, ts: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const result = await queryDocuments(question, sessionId.current);
      const assistantMsg = {
        id: uuidv4(),
        role: 'assistant',
        content: result.answer,
        sources: result.sources,
        latency: result.latency_ms,
        ts: Date.now(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      setError(err.response?.data?.detail || 'Query failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const resetChat = useCallback(async () => {
    await clearSession(sessionId.current).catch(() => {});
    sessionId.current = uuidv4();
    setMessages([]);
    setError(null);
  }, []);

  return { messages, loading, error, sendMessage, resetChat, sessionId: sessionId.current };
}
