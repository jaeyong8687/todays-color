import { useState } from 'react';
import type { ColorRecord } from '../types';
import { formatRecordsForAI } from '../utils/insights';
import { callAI, getApiKey, setApiKey as saveApiKey, hasApiKey } from '../utils/ai';
import { useI18n } from '../i18n';

interface Props {
  records: ColorRecord[];
}

export default function AIAnalysis({ records }: Props) {
  const { t } = useI18n();
  const [report, setReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKeyLocal] = useState(getApiKey);
  const [showKeyInput, setShowKeyInput] = useState(false);

  const runAnalysis = async () => {
    if (!hasApiKey()) {
      setShowKeyInput(true);
      return;
    }

    setLoading(true);
    setError(null);
    setReport(null);

    const data = formatRecordsForAI(records);

    try {
      const result = await callAI(t.aiSystemPrompt, data, 1000);
      setReport(result || t.aiNoResult);
    } catch (err) {
      const msg = err instanceof Error ? err.message : t.aiUnknownError;
      if (msg === 'NO_KEY') {
        setShowKeyInput(true);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const saveKey = () => {
    saveApiKey(apiKey.trim());
    setShowKeyInput(false);
    runAnalysis();
  };

  if (records.length === 0) return null;

  return (
    <div className="stat-card">
      <h3>{t.aiTitle}</h3>

      {!report && !loading && !showKeyInput && (
        <div>
          <p style={{ fontSize: 14, color: 'var(--text-dim)', marginBottom: 12 }}>
            {t.aiDescription(records.length)}
          </p>
          <button className="btn-primary" onClick={runAnalysis}>
            {t.aiStart}
          </button>
          {!hasApiKey() && (
            <p style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 8, textAlign: 'center' }}>
              {t.aiTokenNeeded}
            </p>
          )}
        </div>
      )}

      {showKeyInput && (
        <div className="ai-key-setup">
          <p style={{ fontSize: 14, marginBottom: 8 }}>
            {t.aiTokenNeeded}:
          </p>
          <ol style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 12, paddingLeft: 20 }}>
            {t.aiTokenInstructions.map((instruction, i) => (
              <li key={i}>
                {i === 0 ? (
                  <a href="https://github.com/settings/tokens" target="_blank" rel="noopener" style={{ color: 'var(--accent)' }}>
                    {instruction}
                  </a>
                ) : instruction}
              </li>
            ))}
          </ol>
          <input
            className="profile-name-input"
            type="password"
            placeholder={t.aiTokenPlaceholder}
            value={apiKey}
            onChange={(e) => setApiKeyLocal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && saveKey()}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button className="btn-primary" onClick={saveKey} style={{ flex: 1 }}>
              {t.aiSaveAndStart}
            </button>
            <button className="btn-secondary" onClick={() => setShowKeyInput(false)} style={{ flex: 0, padding: '12px 16px' }}>
              {t.aiCancel}
            </button>
          </div>
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
          <button className="btn-secondary" onClick={() => { setError(null); setShowKeyInput(true); }}>
            {t.aiRetryToken}
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
