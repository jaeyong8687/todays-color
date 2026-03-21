import { useState, useMemo } from 'react';
import HueDotChart from './HueDotChart';
import RadialHueMap from './RadialHueMap';
import AIReportModal from './AIReportModal';
import type { ColorRecord } from '../types';
import { callAI, hasApiKey } from '../utils/ai';
import { getColorDisplayName } from '../utils/colors';
import { useI18n } from '../i18n';

interface Props {
  records: ColorRecord[];
}

export default function ColorCharts({ records }: Props) {
  const { t, lang } = useI18n();
  const [tab, setTab] = useState<'scatter' | 'radial'>('radial');
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
    const avgSat = Math.round(satSum / records.length);
    const avgLight = Math.round(lightSum / records.length);

    return `총 ${records.length}개 기록\n자주 쓴 색: ${top5}\n평균 채도: ${avgSat}%, 평균 명도: ${avgLight}%`;
  }, [records, t]);

  const generateColorAnalysis = async () => {
    setLoading(true);
    setError(null);

    const data = records.map((r) =>
      `${r.date}: ${getColorDisplayName(r.color, t)} (H${r.color.hue} S${r.color.saturation} L${r.color.lightness})${r.memo ? ` | "${r.memo}"` : ''}`
    ).join('\n');

    const systemPrompt = lang === 'ko'
      ? `당신은 색채심리학 전문가입니다. 사용자의 색상 기록 데이터를 분석하세요.

포함할 것:
## 색상 패턴
(자주 선택한 색상 계열과 그 심리적 의미)

## 채도·명도 경향
(전체적인 채도/명도 경향과 감정 상태 연결)

## 시간별 변화
(날짜별 색상 변화에서 읽히는 패턴)

## 인사이트
(색 선택 습관에서 발견한 흥미로운 점 1~2개)

통계:\n${colorStats}

따뜻하고 친근한 톤. 이모지 활용. 간결하게.`
      : `You are a color psychology expert. Analyze the user's color data.

Include:
## Color Patterns
(Frequently chosen color families and their psychological meaning)

## Saturation & Brightness Trends
(Overall tendency and emotional connection)

## Temporal Changes
(Patterns from date-based color changes)

## Insights
(1-2 interesting findings from color habits)

Stats:\n${colorStats}

Warm, friendly tone. Use emojis. Be concise.`;

    try {
      const result = await callAI(systemPrompt, `${records.length}개 색상 기록:\n\n${data}`, 800);
      setReport(result || (lang === 'ko' ? '결과를 받지 못했습니다.' : 'No result received.'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  };

  if (records.length === 0) return null;

  const tabs = [
    { key: 'radial' as const, label: lang === 'ko' ? '컬러 휠' : 'Color Wheel' },
    { key: 'scatter' as const, label: lang === 'ko' ? '빈도 차트' : 'Frequency' },
  ];

  const aiLabel = lang === 'ko' ? '🎨 색상 분석' : '🎨 Color Analysis';
  const title = lang === 'ko' ? '색상 패턴 AI 분석' : 'Color Pattern AI Analysis';
  const retryText = lang === 'ko' ? '다시 분석' : 'Analyze again';

  return (
    <div className="stat-card color-charts-card">
      <div className="chart-tabs">
        {tabs.map((t) => (
          <button
            key={t.key}
            className={`chart-tab ${tab === t.key ? 'active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
        {canAnalyze && (
          <button
            className="chart-tab chart-tab-ai"
            onClick={() => setShowAI(true)}
          >
            {aiLabel}
          </button>
        )}
      </div>
      <div className="chart-tab-content">
        {tab === 'scatter' && <HueDotChart records={records} />}
        {tab === 'radial' && <RadialHueMap records={records} />}
      </div>

      {showAI && (
        <AIReportModal
          title={title}
          report={report}
          loading={loading}
          error={error}
          onGenerate={generateColorAnalysis}
          onClose={() => setShowAI(false)}
          generateLabel={aiLabel}
          retryLabel={retryText}
        />
      )}
    </div>
  );
}
