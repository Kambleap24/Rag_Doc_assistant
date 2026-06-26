import React, { useState, useRef, useEffect } from 'react';

const styles = {
  container: {
    padding: '16px 24px',
    borderTop: '1px solid var(--border)',
    background: 'var(--bg-surface)',
  },
  inputRow: {
    display: 'flex', gap: '10px', alignItems: 'flex-end',
  },
  textarea: {
    flex: 1,
    background: 'var(--bg-elevated)',
    border: '1.5px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    padding: '11px 14px',
    color: 'var(--text-primary)',
    fontSize: '14px',
    fontFamily: 'var(--font-sans)',
    resize: 'none',
    outline: 'none',
    lineHeight: '1.5',
    maxHeight: '120px',
    transition: 'border-color 0.2s',
  },
  sendBtn: {
    width: '42px', height: '42px',
    background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '18px',
    transition: 'opacity 0.2s, transform 0.1s',
    flexShrink: 0,
  },
  hint: {
    fontSize: '10px', color: 'var(--text-muted)',
    marginTop: '6px', textAlign: 'right',
  },
};

export default function ChatInput({ onSend, loading, disabled }) {
  const [value, setValue] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [value]);

  const handleSend = () => {
    const q = value.trim();
    if (!q || loading || disabled) return;
    onSend(q);
    setValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.inputRow}>
        <textarea
          ref={textareaRef}
          style={{
            ...styles.textarea,
            borderColor: value ? 'var(--border-active)' : 'var(--border)',
          }}
          placeholder={disabled ? 'Upload a document to start querying...' : 'Ask anything about your documents...'}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading || disabled}
          rows={1}
        />
        <button
          style={{ ...styles.sendBtn, opacity: (!value.trim() || loading || disabled) ? 0.4 : 1 }}
          onClick={handleSend}
          disabled={!value.trim() || loading || disabled}
          title="Send (Enter)"
        >
          {loading ? '⏳' : '↑'}
        </button>
      </div>
      <div style={styles.hint}>Enter to send · Shift+Enter for new line</div>
    </div>
  );
}
