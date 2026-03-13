import { useState } from 'react';
import type { ColorInfo, ColorRecord } from '../types';
import { analyzeEmotion } from '../utils/emotions';
import { getTodayString } from '../utils/storage';

interface Props {
  color: ColorInfo;
  existingRecord?: ColorRecord;
  onSave: (record: ColorRecord) => void;
  onClose: () => void;
}

export default function ColorDetail({ color, existingRecord, onSave, onClose }: Props) {
  const [memo, setMemo] = useState(existingRecord?.memo || '');
  const emotion = analyzeEmotion(color);

  const handleSave = () => {
    const record: ColorRecord = {
      date: getTodayString(),
      colorId: color.id,
      color,
      memo,
      emotion,
    };
    onSave(record);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="color-preview" style={{ background: color.hsl }} />
        <div className="color-name">{color.name}</div>
        <div className="color-hex">{color.hex.toUpperCase()}</div>

        <div className="emotion-badge">
          <span>{emotion.emoji}</span>
          <span>{emotion.primary} · {emotion.secondary}</span>
        </div>
        <div style={{ fontSize: 14, color: 'var(--text-dim)', marginBottom: 16 }}>
          {emotion.description}
        </div>

        <textarea
          className="memo-input"
          placeholder="오늘 이 색을 고른 이유가 있나요? ✏️"
          rows={3}
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
        />

        <button className="btn-primary" onClick={handleSave}>
          오늘의 색으로 저장하기
        </button>
      </div>
    </div>
  );
}
