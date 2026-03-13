import type { ColorInfo, ColorRecord, EmotionResult } from '../types';
import ColorPicker from './ColorPicker';

interface Props {
  date: string;
  existingRecord?: ColorRecord;
  onSave: (record: ColorRecord) => void;
  onDelete?: () => void;
  onClose: () => void;
}

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-');
  return `${y}년 ${parseInt(m)}월 ${parseInt(d)}일`;
}

export default function EditRecordModal({ date, existingRecord, onSave, onDelete, onClose }: Props) {
  const handleSave = (color: ColorInfo, emotion: EmotionResult, memo: string) => {
    onSave({ date, color, memo, emotion });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-full" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <button className="btn-text" onClick={onClose}>✕ 닫기</button>
          <span className="modal-title">{formatDate(date)}</span>
          {existingRecord && onDelete && (
            <button className="btn-text-danger" onClick={onDelete}>삭제</button>
          )}
          {!existingRecord && <span />}
        </div>

        <ColorPicker
          onSave={handleSave}
          initialColor={existingRecord?.color}
        />
      </div>
    </div>
  );
}
