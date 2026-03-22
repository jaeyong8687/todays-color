import { useState } from 'react';
import MemoWordCloud from '../components/MemoWordCloud';
import MemoInsights from '../components/MemoInsights';
import WeeklyAIReport from '../components/WeeklyAIReport';
import ColorCharts from '../components/ColorCharts';
import ColorAnalysis from '../components/ColorAnalysis';
import { useColorHistory } from '../hooks/useColorHistory';

export default function CalendarPage() {
  const { records } = useColorHistory();
  const [fullscreenCard, setFullscreenCard] = useState<string | null>(null);

  const toggleFullscreen = (id: string) => {
    setFullscreenCard(prev => prev === id ? null : id);
  };

  return (
    <div className="page analysis-dashboard">
      {/* LEFT: Color Charts */}
      <section className={`dash-section dash-charts ${fullscreenCard === 'charts' ? 'card-fullscreen' : ''} ${fullscreenCard && fullscreenCard !== 'charts' ? 'card-hidden' : ''}`}>
        <div className="dash-card-inner">
          <button className="card-expand-btn" onClick={() => toggleFullscreen('charts')}>
            {fullscreenCard === 'charts' ? '⊖' : '⊕'}
          </button>
          <div className="dash-card-content">
            <ColorCharts records={records} />
          </div>
          <div className="ai-trigger-row">
            <ColorAnalysis records={records} />
          </div>
        </div>
      </section>

      {/* RIGHT: Word Cloud + AI */}
      <section className={`dash-section dash-sidebar ${fullscreenCard && fullscreenCard !== 'memo' ? 'card-hidden' : ''}`}>
        <div className={`dash-card-inner ${fullscreenCard === 'memo' ? 'card-fullscreen' : ''}`}>
          <button className="card-expand-btn" onClick={() => toggleFullscreen('memo')}>
            {fullscreenCard === 'memo' ? '⊖' : '⊕'}
          </button>
          <div className="dash-card-content">
            <MemoWordCloud records={records} />
          </div>
          <div className="ai-trigger-row">
            <MemoInsights records={records} />
            <WeeklyAIReport records={records} />
          </div>
        </div>
      </section>
    </div>
  );
}
