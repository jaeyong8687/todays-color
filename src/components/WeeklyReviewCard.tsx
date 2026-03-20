import { useMemo, useState } from 'react';
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

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

export default function WeeklyReviewCard({ records, focusDate }: Props) {
  const { t } = useI18n();
  const [saving, setSaving] = useState(false);

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

  const handleSaveImage = async () => {
    try {
      setSaving(true);
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 900;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const { weekLabel, days, topTag, mostVividDay } = summary;
      const title = t.weeklyReviewCardTitle(weekLabel);

      const bg = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      bg.addColorStop(0, '#181824');
      bg.addColorStop(1, '#101018');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const glow = ctx.createRadialGradient(260, 180, 20, 260, 180, 400);
      glow.addColorStop(0, 'rgba(124, 111, 247, 0.24)');
      glow.addColorStop(1, 'rgba(124, 111, 247, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      roundedRect(ctx, 48, 48, 1104, 804, 34);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#f7f7ff';
      ctx.font = '700 54px system-ui, -apple-system, sans-serif';
      ctx.fillText(title, 84, 126, 1032);

      ctx.fillStyle = 'rgba(247, 247, 255, 0.66)';
      ctx.font = '500 26px system-ui, -apple-system, sans-serif';
      ctx.fillText(t.weeklyReview, 84, 172);

      const swatchY = 228;
      const swatchX = 84;
      const swatchGap = 16;
      const swatchWidth = 132;
      const swatchHeight = 176;

      days.forEach((day, index) => {
        const x = swatchX + index * (swatchWidth + swatchGap);
        roundedRect(ctx, x, swatchY, swatchWidth, swatchHeight, 24);
        ctx.fillStyle = day.record?.color.hsl ?? 'rgba(255, 255, 255, 0.12)';
        ctx.fill();
        ctx.strokeStyle = day.record ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 2;
        ctx.stroke();

        if (!day.record) {
          ctx.strokeStyle = 'rgba(255,255,255,0.16)';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(x + 30, swatchY + 30);
          ctx.lineTo(x + swatchWidth - 30, swatchY + swatchHeight - 30);
          ctx.stroke();
        }

        ctx.fillStyle = '#f7f7ff';
        ctx.font = '700 28px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(day.dayLabel, x + swatchWidth / 2, swatchY + swatchHeight + 42);
      });

      ctx.textAlign = 'left';
      const detailStartY = 534;
      ctx.fillStyle = '#f7f7ff';
      ctx.font = '600 34px system-ui, -apple-system, sans-serif';

      if (topTag) {
        ctx.fillText(t.weeklyTagSummary(topTag.label, topTag.count), 84, detailStartY);
      }

      if (mostVividDay) {
        ctx.fillText(t.weeklyVividSummary(mostVividDay.weekdayName), 84, topTag ? detailStartY + 72 : detailStartY);
      }

      ctx.fillStyle = 'rgba(247, 247, 255, 0.45)';
      ctx.font = '500 22px system-ui, -apple-system, sans-serif';
      ctx.fillText("Today's Color", 84, 804);

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) return;

      const fileName = `todays-color-${summary.weekLabel.replace(/\s+/g, '-').toLowerCase()}.png`;
      const file = typeof File !== 'undefined' ? new File([blob], fileName, { type: 'image/png' }) : null;
      const shareData = file ? { files: [file], title, text: title } : null;
      const nav = navigator as Navigator & {
        canShare?: (data?: ShareData) => boolean;
      };

      if (shareData && typeof nav.share === 'function' && (!nav.canShare || nav.canShare(shareData))) {
        try {
          await nav.share(shareData);
          return;
        } catch (error) {
          if (error instanceof DOMException && error.name === 'AbortError') return;
        }
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setSaving(false);
    }
  };

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

        <button className="weekly-review-action" onClick={handleSaveImage} disabled={saving}>
          {saving ? t.preparingImage : t.saveAsImage}
        </button>
      </div>
    </section>
  );
}
