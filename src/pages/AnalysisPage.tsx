import EmotionReport from '../components/EmotionReport';
import AIAnalysis from '../components/AIAnalysis';
import { useColorHistory } from '../hooks/useColorHistory';
import { generateInsights } from '../utils/insights';
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

export default function AnalysisPage() {
  const { records } = useColorHistory();
  const insights = generateInsights(records);

  return (
    <div className="page">
      <h1 className="page-title">감정 분석 🧠</h1>

      {insights.length > 0 && (
        <div className="stat-card">
          <h3>💡 인사이트</h3>
          {insights.map((insight, i) => (
            <InsightCard key={i} insight={insight} />
          ))}
        </div>
      )}

      <EmotionReport records={records} />
      <AIAnalysis records={records} />
    </div>
  );
}
