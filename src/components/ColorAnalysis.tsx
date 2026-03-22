import { useState, useMemo } from 'react';
import type { ColorRecord } from '../types';
import { callAI, hasApiKey } from '../utils/ai';
import { getColorDisplayName } from '../utils/colors';
import { useI18n } from '../i18n';
import AIReportModal from './AIReportModal';
import AISparkle from './AISparkle';

interface Props {
  records: ColorRecord[];
}

export default function ColorAnalysis({ records }: Props) {
  const { t, lang } = useI18n();
  const [showAI, setShowAI] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canAnalyze = records.length >= 3 && hasApiKey();

  const colorStats = useMemo(() => {
    if (records.length === 0) return '';
    const hueGroups: Record<string, number> = {};
    const satSum = records.reduce((s, r) => s + r.color.saturation, 0);
    const lightSum = records.reduce((s, r) => s + r.color.lightness, 0);
    records.forEach((r) => {
      const name = getColorDisplayName(r.color, t);
      hueGroups[name] = (hueGroups[name] || 0) + 1;
    });
    const sorted = Object.entries(hueGroups).sort((a, b) => b[1] - a[1]);
    const top5 = sorted.slice(0, 5).map(([name, cnt]) => `${name}: ${cnt}회`).join(', ');
    return `총 ${records.length}개 기록\n자주 쓴 색: ${top5}\n평균 채도: ${Math.round(satSum / records.length)}%, 평균 명도: ${Math.round(lightSum / records.length)}%`;
  }, [records, t]);

  const generate = async () => {
    setLoading(true);
    setError(null);
    const data = records.map((r) =>
      `${r.date}: ${getColorDisplayName(r.color, t)} (H${r.color.hue} S${r.color.saturation} L${r.color.lightness})${r.memo ? ` | "${r.memo}"` : ''}`
    ).join('\n');

    const systemPrompt = lang === 'ko'
      ? `당신은 색채심리학 전문가입니다. 사용자의 색상 기록 데이터를 분석하세요.\n\n## 색상 패턴\n(자주 선택한 색상 계열과 심리적 의미)\n\n## 채도·명도 경향\n(전체적 경향과 감정 상태)\n\n## 시간별 변화\n(날짜별 색상 변화 패턴)\n\n## 인사이트\n(흥미로운 점 1~2개)\n\n통계:\n${colorStats}\n\n따뜻하고 간결하게. 이모지 활용.`
      : `You are a color psychology expert. Analyze color data.\n\n## Color Patterns\n## Saturation & Brightness\n## Temporal Changes\n## Insights\n\nStats:\n${colorStats}\n\nWarm, concise. Use emojis.`;

    try {
      const result = await callAI(systemPrompt, `${records.length}개 색상 기록:\n\n${data}`, 800);
      setReport(result || (lang === 'ko' ? '결과를 받지 못했습니다.' : 'No result received.'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  };

  if (!canAnalyze) return null;

  const label = lang === 'ko' ? '색상 분석' : 'Color Analysis';
  const title = lang === 'ko' ? '색상 패턴 AI 분석' : 'Color Pattern AI Analysis';
  const retry = lang === 'ko' ? '다시 분석' : 'Analyze again';

  return (
    <>
      <button className="btn-ai-trigger" onClick={() => setShowAI(true)}>
        <AISparkle />{label}
      </button>
      {showAI && (
        <AIReportModal title={title} report={report} loading={loading} error={error}
          onGenerate={generate} onClose={() => setShowAI(false)}
          generateLabel={label} retryLabel={retry} />
      )}
    </>
  );
}
