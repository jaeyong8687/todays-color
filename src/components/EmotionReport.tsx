import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import type { ColorRecord } from '../types';
import { getEmotionSummary, EMOTION_COLORS } from '../utils/emotions';
import { useI18n } from '../i18n';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface Props {
  records: ColorRecord[];
}

export default function EmotionReport({ records }: Props) {
  const { t } = useI18n();

  const getEmotionDisplay = (key: string) => {
    const emotionData = t.emotions[key] || t.lightEmotions[key];
    return emotionData ? emotionData.primary : key;
  };

  const summary = useMemo(() => {
    return getEmotionSummary(records.map((r) => r.emotion));
  }, [records]);

  const sorted = useMemo(() => {
    return Object.entries(summary).sort((a, b) => b[1] - a[1]);
  }, [summary]);

  const maxCount = sorted.length > 0 ? sorted[0][1] : 1;

  const chartData = useMemo(() => ({
    labels: sorted.map(([name]) => getEmotionDisplay(name)),
    datasets: [{
      label: t.recordCount,
      data: sorted.map(([, count]) => count),
      backgroundColor: sorted.map(([name]) => EMOTION_COLORS[name] || '#888'),
      borderRadius: 6,
    }],
  }), [sorted, t]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        ticks: { color: '#8888aa', font: { family: 'Noto Sans KR' } },
        grid: { display: false },
      },
      y: {
        ticks: { color: '#8888aa', stepSize: 1 },
        grid: { color: 'rgba(255,255,255,0.05)' },
      },
    },
  } as const;

  if (records.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📊</div>
        <p>{t.emptyState.split('\n').map((line, i, arr) => (
          <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
        ))}</p>
      </div>
    );
  }

  const dominantEmotion = sorted[0];

  return (
    <div>
      <div className="stat-card">
        <h3>{t.topEmotion}</h3>
        <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 4 }}>
          {getEmotionDisplay(dominantEmotion[0])}
        </div>
        <div style={{ fontSize: 14, color: 'var(--text-dim)' }}>
          {t.totalOfRecords(records.length, dominantEmotion[1])}
        </div>
      </div>

      <div className="stat-card">
        <h3>{t.emotionDist}</h3>
        {sorted.map(([name, count]) => (
          <div key={name} className="emotion-bar-row">
            <span className="emotion-bar-label">{getEmotionDisplay(name)}</span>
            <div className="emotion-bar-track">
              <div
                className="emotion-bar-fill"
                style={{
                  width: `${(count / maxCount) * 100}%`,
                  backgroundColor: EMOTION_COLORS[name] || '#888',
                }}
              />
            </div>
            <span className="emotion-bar-count">{count}</span>
          </div>
        ))}
      </div>

      <div className="stat-card">
        <h3>{t.emotionChart}</h3>
        <div className="chart-container">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}
