import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useDocuments } from '../hooks/useDocuments';

const styles = {
  sidebar: {
    width: '300px', minWidth: '300px', height: '100vh',
    background: 'var(--bg-surface)',
    borderRight: '1px solid var(--border)',
    display: 'flex', flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    padding: '20px',
    borderBottom: '1px solid var(--border)',
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: '10px',
    marginBottom: '4px',
  },
  logoIcon: {
    width: '32px', height: '32px',
    background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
    borderRadius: '8px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '16px',
  },
  logoText: {
    fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)',
    letterSpacing: '-0.3px',
  },
  logoSub: { fontSize: '11px', color: 'var(--text-muted)', marginLeft: '42px' },
  section: { padding: '16px 20px', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' },
  sectionTitle: {
    fontSize: '10px', fontWeight: '600', letterSpacing: '1.2px',
    color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px',
  },
  dropzone: {
    border: '1.5px dashed var(--border)',
    borderRadius: 'var(--radius-md)',
    padding: '20px 16px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginBottom: '16px',
  },
  dropzoneActive: {
    borderColor: 'var(--accent-primary)',
    background: 'var(--accent-glow)',
  },
  dropIcon: { fontSize: '24px', marginBottom: '8px' },
  dropText: { fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' },
  dropHint: { fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' },
  progressBar: {
    height: '3px', background: 'var(--bg-elevated)',
    borderRadius: '2px', marginBottom: '12px', overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))',
    transition: 'width 0.3s ease',
    borderRadius: '2px',
  },
  docList: { flex: 1, overflowY: 'auto' },
  docItem: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '10px 12px',
    background: 'var(--bg-elevated)',
    borderRadius: 'var(--radius-sm)',
    marginBottom: '6px',
    border: '1px solid var(--border)',
  },
  docIcon: {
    width: '28px', height: '28px', minWidth: '28px',
    background: 'rgba(79,142,247,0.12)',
    borderRadius: '6px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '13px',
  },
  docInfo: { flex: 1, minWidth: 0 },
  docName: {
    fontSize: '12px', fontWeight: '500', color: 'var(--text-primary)',
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  },
  docMeta: { fontSize: '10px', color: 'var(--text-muted)', marginTop: '1px' },
  deleteBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'var(--text-muted)', fontSize: '14px', padding: '2px',
    borderRadius: '4px', lineHeight: 1,
    transition: 'color 0.15s',
  },
  empty: {
    textAlign: 'center', padding: '20px',
    color: 'var(--text-muted)', fontSize: '12px',
  },
  error: {
    padding: '8px 12px', borderRadius: 'var(--radius-sm)',
    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
    color: '#ef4444', fontSize: '11px', marginBottom: '10px',
  },
  stats: {
    padding: '12px 20px',
    borderTop: '1px solid var(--border)',
    display: 'flex', gap: '16px',
  },
  stat: { textAlign: 'center' },
  statVal: { fontSize: '16px', fontWeight: '700', color: 'var(--accent-primary)' },
  statLabel: { fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px' },
};

export default function Sidebar() {
  const { documents, uploading, uploadProgress, error, upload, remove } = useDocuments();
  const [justUploaded, setJustUploaded] = useState(null);

  const onDrop = useCallback(async (accepted) => {
    for (const file of accepted) {
      try {
        const result = await upload(file);
        setJustUploaded(result.filename);
        setTimeout(() => setJustUploaded(null), 3000);
      } catch {}
    }
  }, [upload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'text/plain': ['.txt'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
    maxFiles: 5,
    disabled: uploading,
  });

  const totalChunks = documents.reduce((s, d) => s + d.chunks, 0);

  return (
    <aside style={styles.sidebar}>
      <div style={styles.header}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>📚</div>
          <span style={styles.logoText}>DocRAG</span>
        </div>
        <div style={styles.logoSub}>AI Document Assistant</div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>Documents</div>

        {error && <div style={styles.error}>{error}</div>}

        <div
          {...getRootProps()}
          style={{ ...styles.dropzone, ...(isDragActive ? styles.dropzoneActive : {}) }}
        >
          <input {...getInputProps()} />
          <div style={styles.dropIcon}>{uploading ? '⏳' : isDragActive ? '📂' : '📎'}</div>
          <div style={styles.dropText}>
            {uploading ? `Uploading... ${uploadProgress}%` : 'Drop PDF, TXT, or DOCX'}
          </div>
          <div style={styles.dropHint}>or click to browse • max 50MB</div>
        </div>

        {uploading && (
          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: `${uploadProgress}%` }} />
          </div>
        )}

        <div style={styles.docList}>
          {documents.length === 0 ? (
            <div style={styles.empty}>No documents yet.<br />Upload one to get started.</div>
          ) : (
            documents.map((doc) => (
              <div key={doc.filename} style={{
                ...styles.docItem,
                ...(justUploaded === doc.filename ? { borderColor: 'var(--accent-success)' } : {}),
              }}>
                <div style={styles.docIcon}>
                  {doc.filename.endsWith('.pdf') ? '📄' : doc.filename.endsWith('.docx') ? '📝' : '📃'}
                </div>
                <div style={styles.docInfo}>
                  <div style={styles.docName}>{doc.filename}</div>
                  <div style={styles.docMeta}>{doc.chunks} chunks indexed</div>
                </div>
                <button
                  style={styles.deleteBtn}
                  onClick={() => remove(doc.filename)}
                  title="Remove document"
                  onMouseEnter={e => e.target.style.color = '#ef4444'}
                  onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
                >✕</button>
              </div>
            ))
          )}
        </div>
      </div>

      <div style={styles.stats}>
        <div style={styles.stat}>
          <div style={styles.statVal}>{documents.length}</div>
          <div style={styles.statLabel}>Docs</div>
        </div>
        <div style={styles.stat}>
          <div style={styles.statVal}>{totalChunks}</div>
          <div style={styles.statLabel}>Chunks</div>
        </div>
        <div style={styles.stat}>
          <div style={{ ...styles.statVal, color: 'var(--accent-success)' }}>●</div>
          <div style={styles.statLabel}>Online</div>
        </div>
      </div>
    </aside>
  );
}
