import { useState } from 'react';
import CalendarComponent from '../components/Calendar';
import EditRecordModal from '../components/EditRecordModal';
import { useColorHistory } from '../hooks/useColorHistory';
import { isFutureDate } from '../utils/storage';
import type { ColorRecord } from '../types';

export default function CalendarPage() {
  const { records, save, getByDate, remove } = useColorHistory();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  const selectedRecord = selectedDate ? getByDate(selectedDate) : null;

  const formatDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-');
    return `${y}년 ${parseInt(m)}월 ${parseInt(d)}일`;
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
      <h1 className="page-title">나의 색 캘린더 📅</h1>

      <CalendarComponent
        records={records}
        onSelectDate={handleSelectDate}
        selectedDate={selectedDate}
      />

      {selectedDate && !editing && selectedRecord && (
        <div className="record-detail">
          <div className="record-color-strip" style={{ background: selectedRecord.color.hsl }} />
          <div className="record-date">{formatDate(selectedDate)}</div>
          <div className="color-name">{selectedRecord.color.name}</div>
          <div className="emotion-badge">
            <span>{selectedRecord.emotion.emoji}</span>
            <span>{selectedRecord.emotion.primary} · {selectedRecord.emotion.secondary}</span>
          </div>
          {selectedRecord.memo && (
            <div className="record-memo">📝 {selectedRecord.memo}</div>
          )}
          <button className="btn-secondary" onClick={() => setEditing(true)}>
            ✏️ 수정하기
          </button>
        </div>
      )}

      {selectedDate && !editing && !selectedRecord && (
        <div className="record-detail">
          <div className="record-date">{formatDate(selectedDate)}</div>
          <p style={{ color: 'var(--text-dim)', fontSize: 14, marginBottom: 12 }}>
            이 날은 색을 기록하지 않았어요.
          </p>
          <button className="btn-secondary" onClick={() => setEditing(true)}>
            🎨 이 날의 색 추가하기
          </button>
        </div>
      )}

      {!selectedDate && (
        <div style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-dim)', fontSize: 14 }}>
          날짜를 눌러 기록을 확인하세요<br/>
          <span style={{ fontSize: 12 }}>미래 날짜는 선택할 수 없어요</span>
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
