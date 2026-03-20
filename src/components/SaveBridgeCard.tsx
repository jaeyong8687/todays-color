import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ColorRecord } from '../types';
import { useI18n } from '../i18n';

interface Props {
  records: ColorRecord[];
  savedColor: string;
  onDismiss: () => void;
}

export default function SaveBridgeCard({ records, savedColor, onDismiss }: Props) {
  const navigate = useNavigate();
  const { t } = useI18n();

  const weekRecords = useMemo(() => {
    const today = new Date();
    const days: { date: string; color?: string; isToday: boolean }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const rec = records.find((r) => r.date === dateStr);
      days.push({
        date: dateStr,
        color: rec?.color.hsl,
        isToday: i === 0,
      });
    }
    return days;
  }, [records]);

  const filledCount = weekRecords.filter((d) => d.color).length;
  const streakMsg = filledCount >= 5
    ? t.bridgeStreak5
    : filledCount >= 3
      ? t.bridgeStreak3
      : t.bridgeKeepGoing;

  return (
    <div className="bridge-card reveal-item" style={{ animationDelay: '100ms' }}>
      <div className="bridge-header">
        <div className="bridge-dot-current" style={{ background: savedColor }} />
        <span className="bridge-title">{t.bridgeSaved}</span>
        <button className="bridge-dismiss" onClick={onDismiss} aria-label="close">&times;</button>
      </div>

      <div className="bridge-week">
        {weekRecords.map((day) => (
          <div key={day.date} className={`bridge-day ${day.isToday ? 'today' : ''}`}>
            <div
              className="bridge-day-dot"
              style={day.color
                ? { background: day.color, border: '1px solid rgba(255,255,255,0.15)' }
                : undefined
              }
            />
            <span className="bridge-day-label">
              {['S','M','T','W','T','F','S'][new Date(day.date + 'T00:00:00').getDay()]}
            </span>
          </div>
        ))}
      </div>

      <p className="bridge-streak">{streakMsg} ({filledCount}/7)</p>

      <div className="bridge-actions">
        <button
          className="bridge-btn"
          onClick={() => { onDismiss(); navigate('/calendar'); }}
        >
          {t.navCalendar}
        </button>
        <button
          className="bridge-btn"
          onClick={() => { onDismiss(); navigate('/analysis'); }}
        >
          {t.navAnalysis}
        </button>
      </div>
    </div>
  );
}
