import { useState } from 'react';
import MemoWordCloud from '../components/MemoWordCloud';
import MemoInsights from '../components/MemoInsights';
import WeeklyAIReport from '../components/WeeklyAIReport';
import ColorCharts from '../components/ColorCharts';
import { useColorHistory } from '../hooks/useColorHistory';
import { useI18n } from '../i18n';

export default function CalendarPage() {
  const { records } = useColorHistory();
  const { lang } = useI18n();
  const [fullscreenCard, setFullscreenCard] = useState<string | null>(null);

  const toggleFullscreen = (id: string) => {
    setFullscreenCard(prev => prev === id ? null : id);
  };

  return (
    <div className="page analysis-dashboard">
      {/* LEFT: Color Charts */}
      <section className={`dash-section dash-charts ${fullscreenCard === 'charts' ? 'card-fullscreen' : ''} ${fullscreenCard && fullscreenCard !== 'charts' ? 'card-hidden' : ''}`}>
        <div className="stat-card-wrap">
          <button className="card-expand-btn" onClick={() => toggleFullscreen('charts')} title={fullscreenCard === 'charts' ? 'Exit' : 'Fullscreen'}>
            {fullscreenCard === 'charts' ? '⊖' : '⊕'}
          </button>
          <ColorCharts records={records} />
        </div>
      </section>

      {/* RIGHT: Analysis tiles */}
      <section className={`dash-section dash-sidebar ${fullscreenCard && fullscreenCard !== 'memo' && fullscreenCard !== 'ai' ? 'card-hidden' : ''}`}>
        {/* Memo Word Cloud + AI Analysis */}
        <div className={`combined-card ${fullscreenCard === 'memo' ? 'card-fullscreen' : ''} ${fullscreenCard && fullscreenCard !== 'memo' ? 'card-hidden' : ''}`}>
          <button className="card-expand-btn" onClick={() => toggleFullscreen('memo')} title={fullscreenCard === 'memo' ? 'Exit' : 'Fullscreen'}>
            {fullscreenCard === 'memo' ? '⊖' : '⊕'}
          </button>
          <MemoWordCloud records={records} />
          <div className="ai-trigger-row">
            <MemoInsights records={records} />
            <WeeklyAIReport records={records} />
          </div>
        </div>
      </section>
    </div>
  );
}
