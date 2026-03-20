import { useEffect, useMemo, useState } from 'react';
import type { ColorRecord } from '../types';
import { getTodayString, isFutureDate } from '../utils/storage';
import { useI18n } from '../i18n';

interface Props {
  records: ColorRecord[];
  onSelectDate: (date: string) => void;
  selectedDate?: string | null;
  onViewChange?: (year: number, month: number) => void;
}

export default function Calendar({ records, onSelectDate, selectedDate, onViewChange }: Props) {
  const { t } = useI18n();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);

  const todayStr = getTodayString();

  const recordMap = useMemo(() => {
    const map: Record<string, ColorRecord> = {};
    for (const r of records) {
      map[r.date] = r;
    }
    return map;
  }, [records]);

  const days = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();
    const cells: (number | null)[] = [];

    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  }, [year, month]);

  const prevMonth = () => {
    if (month === 1) { setYear(year - 1); setMonth(12); }
    else setMonth(month - 1);
  };

  const nextMonth = () => {
    if (month === 12) { setYear(year + 1); setMonth(1); }
    else setMonth(month + 1);
  };

  // Count records this month
  const monthRecordCount = useMemo(() => {
    const prefix = `${year}-${String(month).padStart(2, '0')}`;
    return records.filter((r) => r.date.startsWith(prefix)).length;
  }, [records, year, month]);

  useEffect(() => {
    onViewChange?.(year, month);
  }, [month, onViewChange, year]);

  return (
    <div className="calendar-large">
      <div className="calendar-header">
        <button className="calendar-nav" onClick={prevMonth}>◀</button>
        <div className="calendar-header-center">
          <span className="calendar-month">{t.yearMonth(year, month)}</span>
          {monthRecordCount > 0 && (
            <span className="calendar-count">{t.dayRecords(monthRecordCount)}</span>
          )}
        </div>
        <button className="calendar-nav" onClick={nextMonth}>▶</button>
      </div>

      <div className="calendar-weekdays-large">
        {t.weekdays.map((d) => (
          <div key={d} className="calendar-weekday">{d}</div>
        ))}
      </div>

      <div className="calendar-days-large">
        {days.map((day, i) => {
          if (day === null) return <div key={i} className="calendar-day-large empty" />;

          const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const record = recordMap[dateStr];
          const isToday = dateStr === todayStr;
          const isFuture = isFutureDate(dateStr);
          const isSelected = dateStr === selectedDate;

          return (
            <div
              key={i}
              className={[
                'calendar-day-large',
                record ? 'has-color' : '',
                isToday ? 'today' : '',
                isFuture ? 'future' : '',
                isSelected ? 'selected' : '',
              ].filter(Boolean).join(' ')}
              style={record ? {
                backgroundColor: record.color.hsl,
                boxShadow: `0 2px 8px ${record.color.hsl.replace('hsl', 'hsla').replace(')', ', 0.3)')}`,
                outline: '1.5px solid rgba(255,255,255,0.15)',
              } : undefined}
              onClick={() => onSelectDate(dateStr)}
            >
              <span className="calendar-day-num">{day}</span>

            </div>
          );
        })}
      </div>
    </div>
  );
}
