import { useMemo } from 'react';
import { useI18n } from '../i18n';
import type { ColorRecord } from '../types';

interface Props {
  records: ColorRecord[];
  focusDate: string;
}

interface DayEntry {
  date: string;
  dayLabel: string;
  weekdayName: string;
  record?: ColorRecord;
}

function parseLocalDate(dateStr: string) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, 12);
}

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function getStartOfWeek(date: Date) {
  const start = new Date(date);
  const mondayBasedDay = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - mondayBasedDay);
  return start;
}

function getWeekOfMonth(date: Date) {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1, 12);
  const offset = (firstDay.getDay() + 6) % 7;
  return Math.floor((date.getDate() + offset - 1) / 7) + 1;
}


export default function WeeklyReviewCard({ records, focusDate }: Props) {
  const { t } = useI18n();

  const summary = useMemo(() => {
    const baseDate = parseLocalDate(focusDate);
    const weekStart = getStartOfWeek(baseDate);
    const recordMap = new Map(records.map((record) => [record.date, record]));
    const shortWeekdays = [...t.weekdays.slice(1), t.weekdays[0]];
    const fullWeekdays = [...t.weekdayNames.slice(1), t.weekdayNames[0]];

    const days: DayEntry[] = Array.from({ length: 7 }, (_, index) => {
      const currentDate = addDays(weekStart, index);
      const dateKey = formatDateKey(currentDate);
      return {
        date: dateKey,
        dayLabel: shortWeekdays[index],
        weekdayName: fullWeekdays[index],
        record: recordMap.get(dateKey),
      };
    });

    const tagCounts = new Map<string, { label: string; count: number }>();
    for (const day of days) {
      for (const tag of day.record?.tags ?? []) {
        const normalized = tag.trim().toLowerCase();
        if (!normalized) continue;
        const current = tagCounts.get(normalized);
        tagCounts.set(normalized, {
          label: current?.label ?? tag.trim(),
          count: (current?.count ?? 0) + 1,
        });
      }
    }

    const topTag = [...tagCounts.values()].sort((a, b) => b.count - a.count)[0];

    const mostVividDay = days
      .filter((day): day is DayEntry & { record: ColorRecord } => Boolean(day.record))
      .sort((a, b) => b.record.color.saturation - a.record.color.saturation)[0];

    const weekLabel = t.reviewWeekLabel(baseDate.getFullYear(), baseDate.getMonth() + 1, getWeekOfMonth(baseDate));

    return { weekLabel, days, topTag, mostVividDay };
  }, [focusDate, records, t]);


  return (
    <section className="weekly-review-section">
      <div className="weekly-review-heading">{t.weeklyReview}</div>
      <div className="weekly-review-card">
        <div className="weekly-review-title">{t.weeklyReviewCardTitle(summary.weekLabel)}</div>

        <div className="weekly-review-swatches">
          {summary.days.map((day) => (
            <div key={day.date} className="weekly-review-day">
              <div
                className={`weekly-review-swatch ${day.record ? 'filled' : 'empty'}`}
                style={day.record ? { background: day.record.color.hsl } : undefined}
                aria-label={day.weekdayName}
              />
              <span className="weekly-review-day-label">{day.dayLabel}</span>
            </div>
          ))}
        </div>

        <div className="weekly-review-summary">
          {summary.topTag && (
            <p>{t.weeklyTagSummary(summary.topTag.label, summary.topTag.count)}</p>
          )}
          {summary.mostVividDay && (
            <p>{t.weeklyVividSummary(summary.mostVividDay.weekdayName)}</p>
          )}
        </div>


      </div>
    </section>
  );
}
