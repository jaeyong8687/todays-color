import { useMemo, useState } from 'react';
import type { ColorRecord } from '../types';
import { callAI, hasApiKey } from '../utils/ai';
import { getColorDisplayName } from '../utils/colors';
import { useI18n } from '../i18n';

interface Props {
  records: ColorRecord[];
}

export default function WeeklyAIReport({ records }: Props) {
  const { t, lang } = useI18n();
  const [report, setReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const weekRecords = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    return records.filter((r) => r.date >= cutoffStr);
  }, [records]);

  if (weekRecords.length < 3 || !hasApiKey()) return null;

  const generateReport = async () => {
    setLoading(true);
    setError(null);

    const data = weekRecords.map((r) =>
      `${r.date}: ${getColorDisplayName(r.color, t)} (${r.color.hex}) → ${r.emotion.emoji} ${r.emotion.primary}/${r.emotion.secondary}${r.memo ? ` | "${r.memo}"` : ''}`
    ).join('\n');

    const systemPrompt = lang === 'ko'
      ? `당신은 색채심리학 전문 상담사입니다. 사용자의 이번 주 색/감정 기록을 보고 주간 리포트를 작성하세요.

포함할 것:
- 📊 이번 주 감정 요약 (한 문장)
- 🎨 색 선택 패턴에서 읽히는 심리
- 💡 하나의 구체적 조언
- ⭐ 격려의 한 마디

따뜻하고 친근한 톤, 한국어로 간결하게. 이모지 사용.`
      : `You are a color psychology counselor. Write a weekly report based on the user's color/emotion records this week.

Include:
- 📊 This week's emotion summary (one sentence)
- 🎨 Psychology behind color choices
- 💡 One specific piece of advice
- ⭐ A word of encouragement

Warm, friendly tone, concise English. Use emojis.`;

    try {
      const result = await callAI(systemPrompt, `This week's records (${weekRecords.length} days):\n${data}`, 600);
      setReport(result || (lang === 'ko' ? '결과를 받지 못했습니다.' : 'No result received.'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  };

  const title = lang === 'ko' ? '📋 주간 AI 리포트' : '📋 Weekly AI Report';
  const btnText = lang === 'ko'
    ? `이번 주 리포트 생성 (${weekRecords.length}일)`
    : `Generate weekly report (${weekRecords.length} days)`;
  const retryText = lang === 'ko' ? '🔄 다시 생성' : '🔄 Generate again';

  return (
    <div className="stat-card">
      <h3>{title}</h3>

      {!report && !loading && (
        <button className="btn-primary" onClick={generateReport}>
          {btnText}
        </button>
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
        </div>
      )}

      {report && (
        <div className="ai-report">
          {report.split('\n').map((line, i) => (
            line.trim() ? <p key={i} className="ai-report-line">{line}</p> : <br key={i} />
          ))}
          <button className="btn-secondary" onClick={() => { setReport(null); }} style={{ marginTop: 12 }}>
            {retryText}
          </button>
        </div>
      )}
    </div>
  );
}
