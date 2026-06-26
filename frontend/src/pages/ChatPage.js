import React, { useEffect, useRef } from 'react';
import { useChat } from '../hooks/useChat';
import { useDocuments } from '../hooks/useDocuments';
import ChatMessage from '../components/ChatMessage';
import ChatInput from '../components/ChatInput';

const styles = {
  container: {
    flex: 1, display: 'flex', flexDirection: 'column',
    height: '100vh', overflow: 'hidden',
    background: 'var(--bg-base)',
  },
  topbar: {
    padding: '16px 24px',
    borderBottom: '1px solid var(--border)',
    background: 'var(--bg-surface)',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  topbarTitle: {
    fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)',
  },
  topbarActions: { display: 'flex', gap: '8px', alignItems: 'center' },
  chip: {
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '10px', fontWeight: '500',
    fontFamily: 'var(--font-mono)',
  },
  resetBtn: {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-secondary)',
    cursor: 'pointer', padding: '5px 12px',
    fontSize: '11px', fontFamily: 'var(--font-sans)',
    transition: 'all 0.15s',
  },
  messages: {
    flex: 1, overflowY: 'auto',
    padding: '24px',
    display: 'flex', flexDirection: 'column',
  },
  empty: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexDirection: 'column', gap: '12px', color: 'var(--text-muted)',
    padding: '40px',
  },
  emptyIcon: { fontSize: '48px', opacity: 0.4 },
  emptyTitle: { fontSize: '16px', fontWeight: '600', color: 'var(--text-secondary)' },
  emptyText: { fontSize: '13px', textAlign: 'center', lineHeight: '1.6', maxWidth: '320px' },
  suggestions: { display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginTop: '8px' },
  suggestionBtn: {
    padding: '6px 12px',
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: '20px',
    color: 'var(--text-secondary)',
    cursor: 'pointer', fontSize: '12px',
    fontFamily: 'var(--font-sans)',
    transition: 'all 0.15s',
  },
  error: {
    margin: '0 24px 12px',
    padding: '10px 14px',
    background: 'rgba(239,68,68,0.08)',
    border: '1px solid rgba(239,68,68,0.2)',
    borderRadius: 'var(--radius-sm)',
    color: '#ef4444', fontSize: '12px',
  },
  typing: {
    display: 'flex', gap: '4px', alignItems: 'center',
    padding: '12px 16px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    width: 'fit-content',
    marginBottom: '20px',
  },
  dot: {
    width: '6px', height: '6px',
    background: 'var(--accent-primary)',
    borderRadius: '50%',
    animation: 'pulse 1.2s ease-in-out infinite',
  },
};

const SUGGESTIONS = [
  'Summarize the main findings',
  'What are the key conclusions?',
  'List the important dates mentioned',
  'Explain the methodology used',
];

export default function ChatPage() {
  const { messages, loading, error, sendMessage, resetChat, sessionId } = useChat();
  const { documents } = useDocuments();
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const hasDocuments = documents.length > 0;

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes pulse {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
        .dot-2 { animation-delay: 0.16s !important; }
        .dot-3 { animation-delay: 0.32s !important; }
        .markdown-body p { margin-bottom: 8px; }
        .markdown-body p:last-child { margin-bottom: 0; }
        .markdown-body ul, .markdown-body ol { padding-left: 18px; margin-bottom: 8px; }
        .markdown-body li { margin-bottom: 3px; }
        .markdown-body code { background: rgba(255,255,255,0.07); padding: 1px 5px; border-radius: 4px; font-family: var(--font-mono); font-size: 12px; }
        .markdown-body strong { color: #fff; }
      `}</style>

      <div style={styles.topbar}>
        <div style={styles.topbarTitle}>
          Conversation
          {messages.length > 0 && (
            <span style={{ color: 'var(--text-muted)', fontWeight: '400', marginLeft: '8px', fontSize: '12px' }}>
              {messages.length} message{messages.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div style={styles.topbarActions}>
          <span style={{
            ...styles.chip,
            background: hasDocuments ? 'rgba(34,211,165,0.1)' : 'rgba(239,68,68,0.1)',
            color: hasDocuments ? 'var(--accent-success)' : '#ef4444',
          }}>
            {hasDocuments ? `${documents.length} doc${documents.length > 1 ? 's' : ''} loaded` : 'No docs'}
          </span>
          {messages.length > 0 && (
            <button
              style={styles.resetBtn}
              onClick={resetChat}
              onMouseEnter={e => e.target.style.color = 'var(--text-primary)'}
              onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
            >
              ↺ New chat
            </button>
          )}
        </div>
      </div>

      <div style={styles.messages}>
        {messages.length === 0 ? (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>🔍</div>
            <div style={styles.emptyTitle}>
              {hasDocuments ? 'Ready to answer questions' : 'No documents loaded'}
            </div>
            <div style={styles.emptyText}>
              {hasDocuments
                ? 'Ask anything about your uploaded documents. The RAG pipeline will retrieve the most relevant chunks and answer faithfully.'
                : 'Upload a PDF, DOCX, or TXT file from the sidebar to start querying your documents with AI.'}
            </div>
            {hasDocuments && (
              <div style={styles.suggestions}>
                {SUGGESTIONS.map(s => (
                  <button
                    key={s}
                    style={styles.suggestionBtn}
                    onClick={() => sendMessage(s)}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.color = 'var(--accent-primary)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                  >{s}</button>
                ))}
              </div>
            )}
          </div>
        ) : (
          messages.map(msg => <ChatMessage key={msg.id} message={msg} />)
        )}

        {loading && (
          <div style={styles.typing}>
            <div style={styles.dot} />
            <div style={{ ...styles.dot }} className="dot-2" />
            <div style={{ ...styles.dot }} className="dot-3" />
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {error && <div style={styles.error}>⚠ {error}</div>}

      <ChatInput onSend={sendMessage} loading={loading} disabled={!hasDocuments} />
    </div>
  );
}
