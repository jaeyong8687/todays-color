import { useState } from 'react';
import type { ColorRecord } from '../types';
import { formatRecordsForAI } from '../utils/insights';
import { useI18n } from '../i18n';

interface Props {
  records: ColorRecord[];
}

export default function AIAnalysis({ records }: Props) {
  const { t } = useI18n();
  const [report, setReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('todays-color-ai-key') || '');
  const [showKeyInput, setShowKeyInput] = useState(false);

  const canAnalyze = records.length >= 7;

  const runAnalysis = async () => {
    if (!apiKey.trim()) {
      setShowKeyInput(true);
      return;
    }

    setLoading(true);
    setError(null);
    setReport(null);

    const data = formatRecordsForAI(records);

    try {
      const res = await fetch('https://models.inference.ai.azure.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey.trim()}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: t.aiSystemPrompt },
            { role: 'user', content: data },
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error?.message || t.aiApiError(res.status));
      }

      const result = await res.json();
      setReport(result.choices?.[0]?.message?.content || t.aiNoResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.aiUnknownError);
    } finally {
      setLoading(false);
    }
  };

  const saveKey = () => {
    localStorage.setItem('todays-color-ai-key', apiKey.trim());
    setShowKeyInput(false);
    runAnalysis();
  };

  return (
    <div className="stat-card">
      <h3>{t.aiTitle}</h3>

      {!canAnalyze && (
        <div className="ai-locked">
          <span className="ai-locked-icon">🔒</span>
          <p>{t.aiLocked(7 - records.length)}</p>
          <div className="ai-progress-bar">
            <div
              className="ai-progress-fill"
              style={{ width: `${(records.length / 7) * 100}%` }}
            />
          </div>
          <span className="ai-progress-text">{t.aiProgress(records.length)}</span>
        </div>
      )}

      {canAnalyze && !report && !loading && !showKeyInput && (
        <div>
          <p style={{ fontSize: 14, color: 'var(--text-dim)', marginBottom: 12 }}>
            {t.aiDescription(records.length)}
          </p>
          <button className="btn-primary" onClick={runAnalysis}>
            {t.aiStart}
          </button>
          <p style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 8, textAlign: 'center' }}>
            {t.aiTokenNeeded}
          </p>
        </div>
      )}

      {showKeyInput && (
        <div className="ai-key-setup">
          <p style={{ fontSize: 14, marginBottom: 8 }}>
            GitHub Personal Access Token이 필요해요 (무료):
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
            onChange={(e) => setApiKey(e.target.value)}
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
