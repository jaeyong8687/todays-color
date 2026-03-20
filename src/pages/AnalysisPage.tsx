import { useState } from 'react';
import MemoInsights from '../components/MemoInsights';
import MemoWordCloud from '../components/MemoWordCloud';
import HueDotChart from '../components/HueDotChart';
import RadialHueMap from '../components/RadialHueMap';
import AIAnalysis from '../components/AIAnalysis';
import WeeklyAIReport from '../components/WeeklyAIReport';
import { useColorHistory } from '../hooks/useColorHistory';
import { useI18n } from '../i18n';

type Tab = 'memo' | 'color' | 'ai';

export default function AnalysisPage() {
  const { records } = useColorHistory();
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<Tab>('memo');

  const tabs: { key: Tab; label: string }[] = [
    { key: 'memo', label: t.tabMemo || '💬 메모' },
    { key: 'color', label: t.tabColor || '🎨 색상' },
    { key: 'ai', label: t.tabAI || '🤖 AI' },
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
          </>
        )}

        {activeTab === 'color' && (
          <div className="analysis-grid">
            <HueDotChart records={records} />
            <RadialHueMap records={records} />
          </div>
        )}

        {activeTab === 'ai' && (
          <>
            <WeeklyAIReport records={records} />
            <AIAnalysis records={records} />
          </>
        )}
      </div>
    </div>
  );
}
