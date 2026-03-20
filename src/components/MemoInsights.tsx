import { useState, useMemo } from 'react';
import type { ColorRecord } from '../types';
import { callAI } from '../utils/ai';
import { getColorDisplayName } from '../utils/colors';
import { useI18n } from '../i18n';

interface Props {
  records: ColorRecord[];
}

export default function MemoInsights({ records }: Props) {
  const { t, lang } = useI18n();
  const [report, setReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recordsWithMemo = useMemo(
    () => records.filter((r) => r.memo && r.memo.trim().length > 0),
    [records]
  );

  const memoStats = useMemo(() => {
    const total = records.length;
    const withMemo = recordsWithMemo.length;
    const avgLen = withMemo > 0
      ? Math.round(recordsWithMemo.reduce((s, r) => s + r.memo.length, 0) / withMemo)
      : 0;
    return { total, withMemo, avgLen };
  }, [records, recordsWithMemo]);

  const formatMemoData = (recs: ColorRecord[]) =>
    recs
      .filter((r) => r.memo && r.memo.trim())
      .map((r) => `${r.date} [${getColorDisplayName(r.color, t)}, ${r.color.hex}]: "${r.memo}"`)
      .join('\n');

  const runEmotionAnalysis = async () => {
    setLoading(true);
    setError(null);
    setReport(null);

    const memoData = formatMemoData(recordsWithMemo);
    const systemPrompt = lang === 'ko'
      ? `당신은 감정 분석 전문가입니다. 사용자가 매일 쓴 메모를 분석하세요.

다음 형식으로 답변:
## 감정 흐름 요약
(전체적인 흐름 2-3문장)

## 감정 키워드
(메모에서 읽히는 실제 감정들, 빈도순, 이모지와 함께)

## 패턴
(발견한 패턴 2-3개)

## 조언
(구체적인 한 마디)

중요: 색상은 참고만. 감정 분석은 메모 텍스트 기반으로만. 따뜻하고 공감적 톤.`
      : `You are an emotion analysis expert. Analyze the user's daily memos.

Format:
## Emotion Flow Summary
(Overall flow in 2-3 sentences)

## Emotion Keywords
(Real emotions from memos, by frequency, with emojis)

## Patterns
(2-3 discovered patterns)

## Advice
(One specific piece of advice)

Important: Colors are reference only. Analyze ONLY memo text. Warm, empathetic tone.`;

    try {
      const result = await callAI(systemPrompt, `${memoStats.withMemo}개 메모:\n\n${memoData}`, 800);
      setReport(result || (lang === 'ko' ? '결과를 받지 못했습니다.' : 'No result received.'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  };
  const title = lang === 'ko' ? '메모 AI 분석' : 'Memo AI Analysis';
  const retryText = lang === 'ko' ? '다시 분석' : 'Analyze again';
  const noMemoMsg = lang === 'ko'
    ? '메모가 있는 기록이 3개 이상 필요해요.\n색을 기록할 때 메모를 남겨보세요'
    : 'Need at least 3 records with memos.\nTry writing a note when you pick a color';

  const canRunEmotion = recordsWithMemo.length >= 3;

  return (
    <div className="stat-card">
      <h3>{title}</h3>

      {/* Stats bar */}
      <div style={{
        display: 'flex', gap: 16, marginBottom: 16, fontSize: 12, color: 'var(--text-dim)',
        flexWrap: 'wrap',
      }}>
        <span>{memoStats.withMemo}/{memoStats.total} {lang === 'ko' ? '메모' : 'memos'}</span>
        <span>{lang === 'ko' ? '평균' : 'avg'} {memoStats.avgLen}{lang === 'ko' ? '자' : ' chars'}</span>
      </div>

      {!report && !loading && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            className="btn-primary"
            onClick={runEmotionAnalysis}
            disabled={!canRunEmotion}
            style={{ opacity: canRunEmotion ? 1 : 0.4, width: '100%' }}
          >
            {lang === 'ko' ? `감정 분석 (${memoStats.withMemo}개 메모)` : `Emotion (${memoStats.withMemo} memos)`}
          </button>
        </div>
      )}

      {!canRunEmotion && !report && !loading && (
        <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--text-dim)', fontSize: 13 }}>
          {noMemoMsg.split('\n').map((line, i) => <p key={i}>{line}</p>)}
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
          <p>{error}</p>
          <button className="btn-secondary" onClick={runEmotionAnalysis}>
            {retryText}
          </button>
        </div>
      )}

      {report && (
        <div className="ai-report">
          {report.split('\n').map((line, i) => {
            if (line.startsWith('## ')) {
              return <h4 key={i} style={{ marginTop: 16, marginBottom: 6, fontSize: 15 }}>{line.replace('## ', '')}</h4>;
            }
            return line.trim()
              ? <p key={i} className="ai-report-line">{line}</p>
              : <br key={i} />;
          })}
          <button
            className="btn-secondary"
            onClick={() => { setReport(null); }}
            style={{ marginTop: 12 }}
          >
            {retryText}
          </button>
        </div>
      )}
    </div>
  );
}
