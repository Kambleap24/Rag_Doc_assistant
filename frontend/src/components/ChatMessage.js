import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

const styles = {
  wrapper: { marginBottom: '20px', display: 'flex', flexDirection: 'column' },
  userWrapper: { alignItems: 'flex-end' },
  assistantWrapper: { alignItems: 'flex-start' },
  bubble: {
    maxWidth: '75%',
    padding: '12px 16px',
    borderRadius: 'var(--radius-md)',
    fontSize: '14px',
    lineHeight: '1.65',
  },
  userBubble: {
    background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
    color: '#fff',
    borderBottomRightRadius: '4px',
  },
  assistantBubble: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)',
    borderBottomLeftRadius: '4px',
  },
  meta: {
    display: 'flex', alignItems: 'center', gap: '8px',
    marginTop: '6px', fontSize: '10px', color: 'var(--text-muted)',
  },
  latency: {
    padding: '2px 6px',
    background: 'var(--bg-elevated)',
    borderRadius: '10px',
    color: 'var(--accent-success)',
    fontFamily: 'var(--font-mono)',
    fontSize: '10px',
  },
  sourcesToggle: {
    background: 'none', border: '1px solid var(--border)',
    borderRadius: '10px', padding: '2px 8px',
    cursor: 'pointer', color: 'var(--text-muted)',
    fontSize: '10px', fontFamily: 'var(--font-sans)',
    transition: 'all 0.15s',
  },
  sourcesPanel: {
    marginTop: '8px',
    maxWidth: '75%',
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    overflow: 'hidden',
  },
  sourceItem: {
    padding: '8px 12px',
    borderBottom: '1px solid var(--border)',
    fontSize: '11px',
  },
  sourceHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '3px',
  },
  sourceName: { color: 'var(--accent-primary)', fontWeight: '500' },
  sourcePage: { color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '10px' },
  sourceExcerpt: {
    color: 'var(--text-secondary)', lineHeight: '1.5',
    display: '-webkit-box', WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical', overflow: 'hidden',
  },
};

export default function ChatMessage({ message }) {
  const [showSources, setShowSources] = useState(false);
  const isUser = message.role === 'user';

  return (
    <div style={{ ...styles.wrapper, ...(isUser ? styles.userWrapper : styles.assistantWrapper) }}>
      <div style={{ ...styles.bubble, ...(isUser ? styles.userBubble : styles.assistantBubble) }}>
        {isUser ? (
          <span>{message.content}</span>
        ) : (
          <div className="markdown-body">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}
      </div>

      {!isUser && (
        <>
          <div style={styles.meta}>
            {message.latency && (
              <span style={styles.latency}>{message.latency}ms</span>
            )}
            {message.sources?.length > 0 && (
              <button
                style={styles.sourcesToggle}
                onClick={() => setShowSources(s => !s)}
                onMouseEnter={e => { e.target.style.borderColor = 'var(--accent-primary)'; e.target.style.color = 'var(--accent-primary)'; }}
                onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text-muted)'; }}
              >
                {showSources ? '▲' : '▼'} {message.sources.length} source{message.sources.length > 1 ? 's' : ''}
              </button>
            )}
          </div>

          {showSources && message.sources?.length > 0 && (
            <div style={styles.sourcesPanel}>
              {message.sources.map((src, i) => (
                <div key={i} style={{ ...styles.sourceItem, ...(i === message.sources.length - 1 ? { borderBottom: 'none' } : {}) }}>
                  <div style={styles.sourceHeader}>
                    <span style={styles.sourceName}>📄 {src.source}</span>
                    <span style={styles.sourcePage}>pg {src.page + 1} · chunk {src.chunk_index}</span>
                  </div>
                  <div style={styles.sourceExcerpt}>{src.excerpt}</div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
