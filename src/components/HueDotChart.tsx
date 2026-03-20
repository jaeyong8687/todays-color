import { useMemo } from 'react';
import { Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js';
import type { ColorRecord } from '../types';
import { useI18n } from '../i18n';
import { COLOR_FAMILIES } from '../utils/colors';
import { VIZ, HUE_SECTORS } from './vizTokens';

ChartJS.register(LinearScale, PointElement, Tooltip);

interface Props {
  records: ColorRecord[];
}

function getSectorIndex(hue: number): number {
  for (let i = 0; i < HUE_SECTORS.length; i++) {
    const s = HUE_SECTORS[i];
    if (hue >= s.start && hue <= s.end) return i;
  }
  return 0;
}

export default function HueDotChart({ records }: Props) {
  const { t } = useI18n();

  const { data, maxFreq } = useMemo(() => {
    // Count frequency per color family
    const freq: Record<string, number> = {};
    for (const f of COLOR_FAMILIES) freq[f] = 0;
    for (const r of records) {
      const family = r.color.emotionGroup;
      freq[family] = (freq[family] || 0) + 1;
    }

    // Build scatter points: one dot per record, stacked by frequency rank within its family
    const familyCounter: Record<string, number> = {};
    for (const f of COLOR_FAMILIES) familyCounter[f] = 0;

    const points = records.map((r) => {
      const family = r.color.emotionGroup;
      const sectorIdx = getSectorIndex(r.color.hue);
      familyCounter[family]++;
      return {
        x: sectorIdx + (Math.random() * 0.4 - 0.2), // jitter within sector
        y: familyCounter[family],
        hex: r.color.hex,
        date: r.date,
        name: r.color.name,
        memo: r.memo,
      };
    });

    const max = Math.max(...Object.values(freq), 1);
    return { data: points, maxFreq: max };
  }, [records]);


  const chartData = {
    datasets: [{
      data: data.map((p) => ({ x: p.x, y: p.y })),
      backgroundColor: data.map((p) => p.hex),
      borderColor: VIZ.dotStroke,
      borderWidth: VIZ.dotStrokeWidth,
      pointRadius: VIZ.dotRadius,
      pointHoverRadius: VIZ.dotRadiusHover,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: VIZ.tooltipBg,
        titleColor: VIZ.tooltipText,
        bodyColor: VIZ.tooltipText,
        borderColor: VIZ.tooltipBorder,
        borderWidth: 1,
        callbacks: {
          title: (items: any[]) => {
            const idx = items[0]?.dataIndex;
            if (idx == null) return '';
            return data[idx]?.date || '';
          },
          label: (item: any) => {
            const d = data[item.dataIndex];
            return d ? `${d.name} ${d.hex}` : '';
          },
          afterLabel: (item: any) => {
            const d = data[item.dataIndex];
            return d?.memo ? `💬 ${d.memo.slice(0, 30)}` : '';
          },
        },
      },
    },
    scales: {
      x: {
        type: 'linear' as const,
        min: -0.5,
        max: HUE_SECTORS.length - 0.5,
        ticks: {
          stepSize: 1,
          color: VIZ.labelColor,
          font: { family: 'Noto Sans KR', size: 10 },
          callback: (_: any, index: number) => {
            const sector = HUE_SECTORS[index];
            return sector ? `${sector.label}` : '';
          },
        },
        grid: { color: VIZ.gridColor },
      },
      y: {
        min: 0,
        max: maxFreq + 1,
        ticks: {
          stepSize: 1,
          color: VIZ.labelColor,
        },
        grid: { color: VIZ.gridColor },
        title: {
          display: true,
          text: t.colorMapFrequency || '빈도',
          color: VIZ.labelColor,
          font: { family: 'Noto Sans KR', size: 11 },
        },
      },
    },
  } as const;

  if (records.length === 0) return null;

  return (
    <div className="stat-card">
      <h3>{t.colorDotChart || '🎯 색상 분포 차트'}</h3>
      <div className="chart-container" style={{ height: 280 }}>
        <Scatter data={chartData} options={chartOptions as any} />
      </div>
    </div>
  );
}
