import { useState } from 'react';
import type { ColorInfo, ColorRecord, EmotionResult } from '../types';
import ColorPicker from '../components/ColorPicker';
import { useColorHistory } from '../hooks/useColorHistory';
import { getTodayString } from '../utils/storage';

export default function HomePage() {
  const { save, getByDate } = useColorHistory();
  const [saved, setSaved] = useState(false);

  const todayRecord = getByDate(getTodayString());

  const handleSave = (color: ColorInfo, emotion: EmotionResult, memo: string) => {
    const record: ColorRecord = {
      date: getTodayString(),
      color,
      memo,
      emotion,
    };
    save(record);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="page">
      <div style={{ marginBottom: 16, textAlign: 'center' }}>
        <h1 className="page-title">오늘의 색 🎨</h1>
        {todayRecord ? (
          <div className="today-badge" style={{ display: 'inline-flex' }}>
            <span
              style={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                background: todayRecord.color.hsl,
                display: 'inline-block',
              }}
            />
            오늘의 색: {todayRecord.color.name} {todayRecord.emotion.emoji}
          </div>
        ) : (
          <p style={{ fontSize: 14, color: 'var(--text-dim)' }}>
            오늘의 기분을 색으로 표현해보세요
          </p>
        )}
      </div>

      <ColorPicker
        onSave={handleSave}
        initialColor={todayRecord?.color}
      />

      {saved && (
        <div className="save-toast">
          ✨ 오늘의 색이 저장되었어요!
        </div>
      )}
    </div>
  );
}
