import { useState } from 'react';
import type { ColorRecord } from '../types';
import { formatRecordsForAI } from '../utils/insights';

interface Props {
  records: ColorRecord[];
}

const AI_PROMPT = `당신은 색채심리학과 감정 분석 전문가입니다. 사용자가 매일 선택한 색과 감정 기록을 분석해주세요.

분석해야 할 것:
1. 전반적인 감정 흐름과 패턴
2. 색상 선택에서 드러나는 심리 상태
3. 시간에 따른 감정 변화 트렌드
4. 주의가 필요한 패턴 (연속된 부정적 감정 등)
5. 긍정적인 점과 격려의 말

따뜻하고 공감적인 톤으로, 한국어로 3-5문단으로 답변해주세요. 이모지를 적절히 사용하세요.`;

export default function AIAnalysis({ records }: Props) {
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
            { role: 'system', content: AI_PROMPT },
            { role: 'user', content: data },
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error?.message || `API 오류 (${res.status})`);
      }

      const result = await res.json();
      setReport(result.choices?.[0]?.message?.content || '분석 결과를 받지 못했습니다.');
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
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
      <h3>🤖 AI 심층 분석</h3>

      {!canAnalyze && (
        <div className="ai-locked">
          <span className="ai-locked-icon">🔒</span>
          <p>{7 - records.length}일 더 기록하면 AI 분석을 받을 수 있어요!</p>
          <div className="ai-progress-bar">
            <div
              className="ai-progress-fill"
              style={{ width: `${(records.length / 7) * 100}%` }}
            />
          </div>
          <span className="ai-progress-text">{records.length}/7일</span>
        </div>
      )}

      {canAnalyze && !report && !loading && !showKeyInput && (
        <div>
          <p style={{ fontSize: 14, color: 'var(--text-dim)', marginBottom: 12 }}>
            {records.length}일의 기록을 AI가 분석하여 심층적인 감정 리포트를 만들어줍니다.
          </p>
          <button className="btn-primary" onClick={runAnalysis}>
            ✨ AI 분석 시작하기
          </button>
          <p style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 8, textAlign: 'center' }}>
            GitHub 토큰이 필요합니다 (무료)
          </p>
        </div>
      )}

      {showKeyInput && (
        <div className="ai-key-setup">
          <p style={{ fontSize: 14, marginBottom: 8 }}>
            GitHub Personal Access Token이 필요해요 (무료):
          </p>
          <ol style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 12, paddingLeft: 20 }}>
            <li><a href="https://github.com/settings/tokens" target="_blank" rel="noopener" style={{ color: 'var(--accent)' }}>github.com/settings/tokens</a> 방문</li>
            <li>"Generate new token (classic)" 클릭</li>
            <li>이름 입력, 권한은 아무것도 체크 안 해도 OK</li>
            <li>생성된 토큰 복사</li>
          </ol>
          <input
            className="profile-name-input"
            type="password"
            placeholder="ghp_xxxxxxxxxxxx"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && saveKey()}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button className="btn-primary" onClick={saveKey} style={{ flex: 1 }}>
              저장 & 분석 시작
            </button>
            <button className="btn-secondary" onClick={() => setShowKeyInput(false)} style={{ flex: 0, padding: '12px 16px' }}>
              취소
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="ai-loading">
          <div className="ai-loading-spinner" />
          <p>AI가 감정 패턴을 분석하고 있어요...</p>
        </div>
      )}

      {error && (
        <div className="ai-error">
          <p>❌ {error}</p>
          <button className="btn-secondary" onClick={() => { setError(null); setShowKeyInput(true); }}>
            토큰 다시 입력
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
            🔄 다시 분석하기
          </button>
        </div>
      )}
    </div>
  );
}
