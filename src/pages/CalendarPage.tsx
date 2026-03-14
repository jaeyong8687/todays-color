import { useState } from 'react';
import CalendarComponent from '../components/Calendar';
import EditRecordModal from '../components/EditRecordModal';
import { useColorHistory } from '../hooks/useColorHistory';
import { isFutureDate } from '../utils/storage';
import { getColorDisplayName } from '../utils/colors';
import { useI18n } from '../i18n';
import type { ColorRecord } from '../types';

export default function CalendarPage() {
  const { records, save, getByDate, remove } = useColorHistory();
  const { t } = useI18n();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  const selectedRecord = selectedDate ? getByDate(selectedDate) : null;

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
      <h1 className="page-title">{t.calendarTitle}</h1>

      <CalendarComponent
        records={records}
        onSelectDate={handleSelectDate}
        selectedDate={selectedDate}
      />

      {selectedDate && !editing && selectedRecord && (
        <div className="record-detail">
          <div className="record-color-strip" style={{ background: selectedRecord.color.hsl }} />
          <div className="record-date">{formatDate(selectedDate)}</div>
          <div className="color-name">{getColorDisplayName(selectedRecord.color, t)}</div>
          <div className="emotion-badge">
            <span>{selectedRecord.emotion.emoji}</span>
            <span>{getEmotionDisplay(selectedRecord.emotion.primary)} · {getSecondaryDisplay(selectedRecord.emotion.primary)}</span>
          </div>
          {selectedRecord.memo && (
            <div className="record-memo">📝 {selectedRecord.memo}</div>
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

      {!selectedDate && (
        <div style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-dim)', fontSize: 14 }}>
          {t.calendarHint}<br/>
          <span style={{ fontSize: 12 }}>{t.noFuture}</span>
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
    </div>
  );
}
