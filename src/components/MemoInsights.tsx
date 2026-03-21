import { useState, useMemo } from 'react';
import type { ColorRecord } from '../types';
import { callAI } from '../utils/ai';
import { getColorDisplayName } from '../utils/colors';
import { useI18n } from '../i18n';
import AIReportModal from './AIReportModal';

interface Props {
  records: ColorRecord[];
}

export default function MemoInsights({ records }: Props) {
  const { t, lang } = useI18n();
  const [report, setReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

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

  const canRunEmotion = recordsWithMemo.length >= 3;
  const title = lang === 'ko' ? '메모 감정 AI 분석' : 'Memo Emotion AI Analysis';
  const retryText = lang === 'ko' ? '다시 분석' : 'Analyze again';
  const btnLabel = lang === 'ko'
    ? `💬 감정 분석 (${memoStats.withMemo}개)`
    : `💬 Emotion (${memoStats.withMemo})`;

  if (!canRunEmotion) return null;

  return (
    <>
      <div className="ai-trigger-row">
        <button
          className="btn-ai-trigger"
          onClick={() => setShowModal(true)}
        >
          {btnLabel}
        </button>
      </div>

      {showModal && (
        <AIReportModal
          title={title}
          report={report}
          loading={loading}
          error={error}
          onGenerate={runEmotionAnalysis}
          onClose={() => setShowModal(false)}
          generateLabel={btnLabel}
          retryLabel={retryText}
        />
      )}
    </>
  );
}
