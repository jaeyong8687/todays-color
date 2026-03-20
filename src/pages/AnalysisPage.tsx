import { useState } from 'react';
import MemoWordCloud from '../components/MemoWordCloud';
import MemoInsights from '../components/MemoInsights';
import WeeklyAIReport from '../components/WeeklyAIReport';
import HueDotChart from '../components/HueDotChart';
import RadialHueMap from '../components/RadialHueMap';
import { useColorHistory } from '../hooks/useColorHistory';
import { useI18n } from '../i18n';

type Tab = 'memo' | 'color';

export default function AnalysisPage() {
  const { records } = useColorHistory();
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<Tab>('memo');

  const tabs: { key: Tab; label: string }[] = [
    { key: 'memo', label: t.tabMemo || '메모' },
    { key: 'color', label: t.tabColor || '색상' },
  ];

  return (
    <div className="page">
      <h1 className="page-title">{t.analysisTitle}</h1>

      <div className="analysis-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`analysis-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="analysis-content">
        {activeTab === 'memo' && (
          <>
            <MemoWordCloud records={records} />
            <MemoInsights records={records} />
            <WeeklyAIReport records={records} />
          </>
        )}

        {activeTab === 'color' && (
          <div className="analysis-grid">
            <HueDotChart records={records} />
            <RadialHueMap records={records} />
          </div>
        )}
      </div>
    </div>
  );
}
