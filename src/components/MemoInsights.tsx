import { useState, useMemo } from 'react';
import type { ColorRecord } from '../types';
import { callAI } from '../utils/ai';
import { useI18n } from '../i18n';

interface Props {
  records: ColorRecord[];
}

interface MemoAnalysis {
  summary: string;
  emotions: { label: string; count: number; emoji: string }[];
  patterns: string[];
  advice: string;
}

export default function MemoInsights({ records }: Props) {
  const { t, lang } = useI18n();
  const [analysis, setAnalysis] = useState<MemoAnalysis | null>(null);
  const [rawReport, setRawReport] = useState<string | null>(null);
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

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);

    const memoData = recordsWithMemo
      .map((r) => `${r.date} [${r.color.name}, ${r.color.hex}]: "${r.memo}"`)
      .join('\n');

    const systemPrompt = lang === 'ko'
      ? `당신은 감정 분석 전문가입니다. 사용자가 매일 쓴 메모를 분석하세요.

반드시 다음 형식으로 답변하세요:

## 요약
(전체적인 감정 흐름을 2-3문장으로)

## 감정 키워드
(메모에서 읽히는 실제 감정들을 빈도순으로, 이모지와 함께)

## 패턴
(발견한 패턴 2-3개, 불릿으로)

## 조언
(구체적인 한 마디)

중요: 색상 이름은 참고만 하세요. 감정 분석은 반드시 메모 텍스트 내용 기반으로만 하세요. 따뜻하고 공감적인 톤으로.`
      : `You are an emotion analysis expert. Analyze the user's daily memos.

Respond in this format:

## Summary
(Overall emotional flow in 2-3 sentences)

## Emotion Keywords
(Real emotions found in memos, by frequency, with emojis)

## Patterns
(2-3 discovered patterns, as bullets)

## Advice
(One specific piece of advice)

Important: Color names are reference only. Analyze emotions based ONLY on memo text content. Warm, empathetic tone.`;

    try {
      const result = await callAI(
        systemPrompt,
        `${memoStats.withMemo}개의 메모 기록:\n\n${memoData}`,
        800
      );
      setRawReport(result);
      setAnalysis(null); // raw report is the primary display
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  };

  const title = lang === 'ko' ? '💬 메모 기반 감정 분석' : '💬 Memo-based Emotion Analysis';
  const btnText = lang === 'ko'
    ? `메모 분석하기 (${memoStats.withMemo}개)`
    : `Analyze memos (${memoStats.withMemo})`;
  const retryText = lang === 'ko' ? '🔄 다시 분석' : '🔄 Analyze again';
  const noMemoMsg = lang === 'ko'
    ? '메모가 있는 기록이 3개 이상 필요해요.\n색을 기록할 때 메모를 남겨보세요 ✏️'
    : 'Need at least 3 records with memos.\nTry writing a note when you pick a color ✏️';

  if (recordsWithMemo.length < 3) {
    return (
      <div className="stat-card">
        <h3>{title}</h3>
        <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-dim)', fontSize: 14 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>✏️</div>
          {noMemoMsg.split('\n').map((line, i) => (
            <p key={i}>{line}</p>
          ))}
          <div style={{ marginTop: 12, fontSize: 12 }}>
            {lang === 'ko'
              ? `현재: ${memoStats.total}개 기록 중 ${memoStats.withMemo}개에 메모 있음`
              : `Current: ${memoStats.withMemo} of ${memoStats.total} records have memos`}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="stat-card">
      <h3>{title}</h3>

      {/* Stats bar */}
      <div style={{
        display: 'flex', gap: 16, marginBottom: 16, fontSize: 12, color: 'var(--text-dim)'
      }}>
        <span>📝 {memoStats.withMemo}/{memoStats.total} {lang === 'ko' ? '메모' : 'memos'}</span>
        <span>📏 {lang === 'ko' ? '평균' : 'avg'} {memoStats.avgLen}{lang === 'ko' ? '자' : ' chars'}</span>
      </div>

      {!rawReport && !loading && (
        <button className="btn-primary" onClick={runAnalysis}>
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
          <button className="btn-secondary" onClick={runAnalysis}>
            {retryText}
          </button>
        </div>
      )}

      {rawReport && (
        <div className="ai-report">
          {rawReport.split('\n').map((line, i) => {
            if (line.startsWith('## ')) {
              return <h4 key={i} style={{ marginTop: 16, marginBottom: 6, fontSize: 15 }}>{line.replace('## ', '')}</h4>;
            }
            return line.trim()
              ? <p key={i} className="ai-report-line">{line}</p>
              : <br key={i} />;
          })}
          <button
            className="btn-secondary"
            onClick={() => { setRawReport(null); setAnalysis(null); }}
            style={{ marginTop: 12 }}
          >
            {retryText}
          </button>
        </div>
      )}
    </div>
  );
}
