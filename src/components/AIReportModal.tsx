import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useI18n } from '../i18n';

interface Props {
  title: string;
  report: string | null;
  loading: boolean;
  error: string | null;
  onGenerate: () => void;
  onClose: () => void;
  generateLabel: string;
  retryLabel: string;
}

export default function AIReportModal({
  title, report, loading, error,
  onGenerate, onClose, generateLabel, retryLabel,
}: Props) {
  const { t } = useI18n();
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  useEffect(() => {
    if (!report && !loading && !error) {
      onGenerate();
    }
  }, []);

  const modal = (
    <div
      className="ai-modal-backdrop"
      ref={backdropRef}
      onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
    >
      <div className="ai-modal">
        <div className="ai-modal-header">
          <h3>{title}</h3>
          <button className="ai-modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="ai-modal-body">
          {loading && (
            <div className="ai-loading">
              <div className="ai-loading-spinner" />
              <p>{t.aiLoading}</p>
            </div>
          )}

          {error && (
            <div className="ai-error">
              <p>{error}</p>
              <button className="btn-secondary" onClick={onGenerate} style={{ marginTop: 8 }}>
                {retryLabel}
              </button>
            </div>
          )}

          {report && !loading && (
            <div className="ai-report">
              {report.split('\n').map((line, i) => {
                if (line.startsWith('## ')) {
                  return <h4 key={i} style={{ marginTop: 16, marginBottom: 6, fontSize: 15 }}>{line.replace('## ', '')}</h4>;
                }
                return line.trim()
                  ? <p key={i} className="ai-report-line">{line}</p>
                  : <br key={i} />;
              })}
              <button className="btn-secondary" onClick={onGenerate} style={{ marginTop: 12 }}>
                {retryLabel}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
