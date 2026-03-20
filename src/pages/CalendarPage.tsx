import { useEffect, useRef, useState } from 'react';
import CalendarComponent from '../components/Calendar';
import EditRecordModal from '../components/EditRecordModal';
import WeeklyReviewCard from '../components/WeeklyReviewCard';
import { useColorHistory } from '../hooks/useColorHistory';
import { getTodayString, isFutureDate } from '../utils/storage';
import { getColorDisplayName } from '../utils/colors';
import { useI18n } from '../i18n';
import type { ColorRecord } from '../types';

export default function CalendarPage() {
  const { records, save, getByDate, remove } = useColorHistory();
  const { t } = useI18n();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [showFutureToast, setShowFutureToast] = useState(false);
  const futureToastTimerRef = useRef<number | null>(null);
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth() + 1);

  const selectedRecord = selectedDate ? getByDate(selectedDate) : null;
  const currentMonthPrefix = `${viewYear}-${String(viewMonth).padStart(2, '0')}`;
  const todayStr = getTodayString();
  const weeklyFocusDate = selectedDate?.startsWith(currentMonthPrefix)
    ? selectedDate
    : todayStr.startsWith(currentMonthPrefix)
      ? todayStr
      : `${currentMonthPrefix}-01`;

  const formatDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-');
    return t.dateFormat(y, m, d);
  };

  const getEmotionDisplay = (key: string) => {
    const emotionData = t.emotions[key] || t.lightEmotions[key];
    return emotionData ? emotionData.primary : key;
  };

  const getSecondaryDisplay = (key: string) => {
    const emotionData = t.emotions[key] || t.lightEmotions[key];
    return emotionData ? emotionData.secondary : key;
  };

  const handleSelectDate = (date: string) => {
    if (isFutureDate(date)) return;
    setSelectedDate(date);
    setEditing(false);
  };

  const handleFutureDateClick = () => {
    setShowFutureToast(true);

    if (futureToastTimerRef.current !== null) {
      window.clearTimeout(futureToastTimerRef.current);
    }

    futureToastTimerRef.current = window.setTimeout(() => {
      setShowFutureToast(false);
      futureToastTimerRef.current = null;
    }, 1500);
  };

  useEffect(() => {
    return () => {
      if (futureToastTimerRef.current !== null) {
        window.clearTimeout(futureToastTimerRef.current);
      }
    };
  }, []);

  const handleSaveEdit = (record: ColorRecord) => {
    save(record);
    setEditing(false);
  };

  const handleDelete = () => {
    if (selectedDate) {
      remove(selectedDate);
      setEditing(false);
      setSelectedDate(null);
    }
  };

  return (
    <div className="page">

      <CalendarComponent
        records={records}
        onSelectDate={handleSelectDate}
        selectedDate={selectedDate}
        onFutureDateClick={handleFutureDateClick}
        onViewChange={(year, month) => {
          setViewYear(year);
          setViewMonth(month);
        }}
      />

      <WeeklyReviewCard records={records} focusDate={weeklyFocusDate} />

      {selectedDate && !editing && selectedRecord && (
        <div className="record-detail">
          <div className="record-color-strip" style={{ background: selectedRecord.color.hsl }} />
          <div className="record-date">{formatDate(selectedDate)}</div>
          <div className="color-name">{getColorDisplayName(selectedRecord.color, t)}</div>
          <div className="emotion-badge">
            <span>{getEmotionDisplay(selectedRecord.emotion.primary)} · {getSecondaryDisplay(selectedRecord.emotion.primary)}</span>
          </div>
          {selectedRecord.tags && selectedRecord.tags.length > 0 && (
            <div className="record-tags-section">
              <div className="record-tags-label">{t.emotionTags}</div>
              <div className="record-tags">
                {selectedRecord.tags.map((tag) => (
                  <span key={tag} className="record-tag-chip">#{tag}</span>
                ))}
              </div>
            </div>
          )}
          {selectedRecord.memo && (
            <div className="record-memo">{selectedRecord.memo}</div>
          )}
          <button className="btn-secondary" onClick={() => setEditing(true)}>
            {t.editRecord}
          </button>
        </div>
      )}

      {selectedDate && !editing && !selectedRecord && (
        <div className="record-detail">
          <div className="record-date">{formatDate(selectedDate)}</div>
          <p style={{ color: 'var(--text-dim)', fontSize: 14, marginBottom: 12 }}>
            {t.noRecord}
          </p>
          <button className="btn-secondary" onClick={() => setEditing(true)}>
            {t.addColor}
          </button>
        </div>
      )}

      {editing && selectedDate && (
        <EditRecordModal
          date={selectedDate}
          existingRecord={selectedRecord ?? undefined}
          onSave={handleSaveEdit}
          onDelete={selectedRecord ? handleDelete : undefined}
          onClose={() => setEditing(false)}
        />
      )}

      {showFutureToast && (
        <div className="future-date-toast" role="status" aria-live="polite">
          {t.noFuture}
        </div>
      )}
    </div>
  );
}
