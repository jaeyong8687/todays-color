import { useState } from 'react';
import type { ColorRecord } from '../types';
import { formatRecordsForAI } from '../utils/insights';
import { callAI } from '../utils/ai';
import { useI18n } from '../i18n';

interface Props {
  records: ColorRecord[];
}

export default function AIAnalysis({ records }: Props) {
  const { t } = useI18n();
  const [report, setReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    setReport(null);

    const data = formatRecordsForAI(records);

    try {
      const result = await callAI(t.aiSystemPrompt, data, 1000);
      setReport(result || t.aiNoResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.aiUnknownError);
    } finally {
      setLoading(false);
    }
  };

  if (records.length === 0) return null;

  return (
    <div className="stat-card">
      <h3>{t.aiTitle}</h3>

      {!report && !loading && (
        <div>
          <p style={{ fontSize: 14, color: 'var(--text-dim)', marginBottom: 12 }}>
            {t.aiDescription(records.length)}
          </p>
          <button className="btn-primary" onClick={runAnalysis}>
            {t.aiStart}
          </button>
        </div>
      )}

      {loading && (
        <div className="ai-loading">
          <div className="ai-loading-spinner" />
          <p>{t.aiLoading}</p>
        </div>
      )}

      {error && (
        <div className="ai-error">
          <p>❌ {error}</p>
          <button className="btn-secondary" onClick={runAnalysis}>
            {t.aiRetry}
          </button>
        </div>
      )}

      {report && (
        <div className="ai-report">
          {report.split('\n').map((line, i) => (
            line.trim() ? <p key={i} className="ai-report-line">{line}</p> : <br key={i} />
          ))}
          <button
            className="btn-secondary"
            onClick={() => setReport(null)}
            style={{ marginTop: 12 }}
          >
            {t.aiRetry}
          </button>
        </div>
      )}
    </div>
  );
}
