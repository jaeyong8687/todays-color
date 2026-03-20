import type { ColorInfo, ColorRecord, EmotionResult } from '../types';
import ColorPicker from './ColorPicker';
import { useI18n } from '../i18n';

interface Props {
  date: string;
  existingRecord?: ColorRecord;
  onSave: (record: ColorRecord) => void;
  onDelete?: () => void;
  onClose: () => void;
}

export default function EditRecordModal({ date, existingRecord, onSave, onDelete, onClose }: Props) {
  const { t } = useI18n();

  const formatDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-');
    return t.dateFormat(y, m, d);
  };

  const handleSave = (color: ColorInfo, emotion: EmotionResult, memo: string, tags?: string[]) => {
    onSave({ date, color, memo, emotion, tags });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-full" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <button className="btn-text" onClick={onClose}>{t.close}</button>
          <span className="modal-title">{formatDate(date)}</span>
          {existingRecord && onDelete && (
            <button className="btn-text-danger" onClick={onDelete}>{t.deleteBtn}</button>
          )}
          {!existingRecord && <span />}
        </div>

        <ColorPicker
          onSave={handleSave}
          initialColor={existingRecord?.color}
          initialEmotion={existingRecord?.emotion}
          initialMemo={existingRecord?.memo}
          initialTags={existingRecord?.tags}
        />
      </div>
    </div>
  );
}
