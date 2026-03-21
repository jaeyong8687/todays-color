import { useState } from 'react';
import HueDotChart from './HueDotChart';
import RadialHueMap from './RadialHueMap';
import type { ColorRecord } from '../types';
import { useI18n } from '../i18n';

interface Props {
  records: ColorRecord[];
}

export default function ColorCharts({ records }: Props) {
  const { lang } = useI18n();
  const [tab, setTab] = useState<'scatter' | 'radial'>('scatter');

  if (records.length === 0) return null;

  const tabs = [
    { key: 'scatter' as const, label: lang === 'ko' ? '분포 차트' : 'Distribution' },
    { key: 'radial' as const, label: lang === 'ko' ? '분포 맵' : 'Radial Map' },
  ];

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
      </div>
      <div className="chart-tab-content">
        {tab === 'scatter' && <HueDotChart records={records} />}
        {tab === 'radial' && <RadialHueMap records={records} />}
      </div>
    </div>
  );
}
