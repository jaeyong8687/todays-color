import { useState } from 'react';
import EmotionReport from '../components/EmotionReport';
import HueDotChart from '../components/HueDotChart';
import RadialHueMap from '../components/RadialHueMap';
import AIAnalysis from '../components/AIAnalysis';
import WeeklyAIReport from '../components/WeeklyAIReport';
import { useColorHistory } from '../hooks/useColorHistory';
import { generateInsights } from '../utils/insights';
import { useI18n } from '../i18n';
import type { Insight } from '../utils/insights';

function InsightCard({ insight }: { insight: Insight }) {
  const borderColor = insight.type === 'positive' ? '#4CAF50'
    : insight.type === 'concern' ? '#FF6B6B' : 'var(--border)';

  return (
    <div className="insight-card" style={{ borderLeftColor: borderColor }}>
      <div className="insight-header">
        <span className="insight-emoji">{insight.emoji}</span>
        <span className="insight-title">{insight.title}</span>
      </div>
      <p className="insight-body">{insight.body}</p>
    </div>
  );
}

type Tab = 'emotion' | 'color' | 'ai';

export default function AnalysisPage() {
  const { records } = useColorHistory();
  const { t } = useI18n();
  const insights = generateInsights(records, t);
  const [activeTab, setActiveTab] = useState<Tab>('emotion');

  const tabs: { key: Tab; label: string }[] = [
    { key: 'emotion', label: t.tabEmotion || '감정' },
    { key: 'color', label: t.tabColor || '색상' },
    { key: 'ai', label: t.tabAI || 'AI' },
  ];

  return (
    <div className="page">
      <h1 className="page-title">{t.analysisTitle}</h1>

      {/* Tab bar */}
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

      {/* Tab content */}
      <div className="analysis-content">
        {activeTab === 'emotion' && (
          <>
            {insights.length > 0 && (
              <div className="stat-card">
                <h3>{t.insights}</h3>
                {insights.map((insight, i) => (
                  <InsightCard key={i} insight={insight} />
                ))}
              </div>
            )}
            <EmotionReport records={records} />
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
