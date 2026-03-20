import { useState, useMemo } from 'react';
import type { ColorRecord } from '../types';
import { callAI } from '../utils/ai';
import { getColorDisplayName } from '../utils/colors';
import { useI18n } from '../i18n';

interface Props {
  records: ColorRecord[];
}

type ReportType = 'emotion' | 'weekly';

export default function MemoInsights({ records }: Props) {
  const { t, lang } = useI18n();
  const [report, setReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeReport, setActiveReport] = useState<ReportType | null>(null);

  const recordsWithMemo = useMemo(
    () => records.filter((r) => r.memo && r.memo.trim().length > 0),
    [records]
  );

  // Last 7 days
  const weekRecords = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    return records.filter((r) => r.date >= cutoffStr);
  }, [records]);

  const weekMemoRecords = useMemo(
    () => weekRecords.filter((r) => r.memo && r.memo.trim().length > 0),
    [weekRecords]
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
    setActiveReport('emotion');

    const memoData = formatMemoData(recordsWithMemo);
    const systemPrompt = lang === 'ko'
      ? `당신은 감정 분석 전문가입니다. 사용자가 매일 쓴 메모를 분석하세요.

다음 형식으로 답변:
## 📊 감정 흐름 요약
(전체적인 흐름 2-3문장)

## 🏷️ 감정 키워드
(메모에서 읽히는 실제 감정들, 빈도순, 이모지와 함께)

## 🔍 패턴
(발견한 패턴 2-3개)

## 💡 조언
(구체적인 한 마디)

중요: 색상은 참고만. 감정 분석은 메모 텍스트 기반으로만. 따뜻하고 공감적 톤.`
      : `You are an emotion analysis expert. Analyze the user's daily memos.

Format:
## 📊 Emotion Flow Summary
(Overall flow in 2-3 sentences)

## 🏷️ Emotion Keywords
(Real emotions from memos, by frequency, with emojis)

## 🔍 Patterns
(2-3 discovered patterns)

## 💡 Advice
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

  const runWeeklyReport = async () => {
    setLoading(true);
    setError(null);
    setReport(null);
    setActiveReport('weekly');

    const data = weekRecords.map((r) =>
      `${r.date}: ${getColorDisplayName(r.color, t)} (${r.color.hex})${r.memo ? ` | "${r.memo}"` : ''}`
    ).join('\n');

    const systemPrompt = lang === 'ko'
      ? `당신은 색채심리 상담사입니다. 이번 주 기록을 보고 주간 리포트를 작성하세요.

포함할 것:
## 📋 이번 주 요약
(색 선택 + 메모 내용 기반 한 문장 요약)

## 🎨 색 패턴
(색 선택에서 읽히는 심리)

## 💬 메모에서 읽히는 것
(메모 내용 기반 감정 분석)

## 💡 이번 주 조언
(구체적 한 마디 + 격려)

따뜻하고 친근한 톤, 간결하게. 이모지 사용.`
      : `You are a color psychology counselor. Write a weekly report.

Include:
## 📋 This Week's Summary
(One-sentence summary based on colors + memos)

## 🎨 Color Patterns
(Psychology behind color choices)

## 💬 What Your Memos Reveal
(Emotion analysis from memo content)

## 💡 This Week's Advice
(Specific advice + encouragement)

Warm, friendly, concise. Use emojis.`;

    try {
      const result = await callAI(systemPrompt, `이번 주 ${weekRecords.length}일 기록:\n${data}`, 600);
      setReport(result || (lang === 'ko' ? '결과를 받지 못했습니다.' : 'No result received.'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  };

  const title = lang === 'ko' ? '🤖 AI 분석' : '🤖 AI Analysis';
  const retryText = lang === 'ko' ? '🔄 다시 분석' : '🔄 Analyze again';
  const noMemoMsg = lang === 'ko'
    ? '메모가 있는 기록이 3개 이상 필요해요.\n색을 기록할 때 메모를 남겨보세요 ✏️'
    : 'Need at least 3 records with memos.\nTry writing a note when you pick a color ✏️';

  const canRunEmotion = recordsWithMemo.length >= 3;
  const canRunWeekly = weekRecords.length >= 3;

  return (
    <div className="stat-card">
      <h3>{title}</h3>

      {/* Stats bar */}
      <div style={{
        display: 'flex', gap: 16, marginBottom: 16, fontSize: 12, color: 'var(--text-dim)',
        flexWrap: 'wrap',
      }}>
        <span>📝 {memoStats.withMemo}/{memoStats.total} {lang === 'ko' ? '메모' : 'memos'}</span>
        <span>📏 {lang === 'ko' ? '평균' : 'avg'} {memoStats.avgLen}{lang === 'ko' ? '자' : ' chars'}</span>
        <span>📅 {lang === 'ko' ? `이번 주 ${weekRecords.length}일` : `${weekRecords.length} days this week`}</span>
      </div>

      {!report && !loading && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            className="btn-primary"
            onClick={runEmotionAnalysis}
            disabled={!canRunEmotion}
            style={{ opacity: canRunEmotion ? 1 : 0.4, flex: 1, minWidth: 140 }}
          >
            {lang === 'ko' ? `💬 감정 분석 (${memoStats.withMemo}개 메모)` : `💬 Emotion (${memoStats.withMemo} memos)`}
          </button>
          <button
            className="btn-primary"
            onClick={runWeeklyReport}
            disabled={!canRunWeekly}
            style={{ opacity: canRunWeekly ? 1 : 0.4, flex: 1, minWidth: 140 }}
          >
            {lang === 'ko' ? `📋 주간 리포트 (${weekRecords.length}일)` : `📋 Weekly (${weekRecords.length} days)`}
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
          <p>❌ {error}</p>
          <button className="btn-secondary" onClick={activeReport === 'weekly' ? runWeeklyReport : runEmotionAnalysis}>
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
            onClick={() => { setReport(null); setActiveReport(null); }}
            style={{ marginTop: 12 }}
          >
            {retryText}
          </button>
        </div>
      )}
    </div>
  );
}
