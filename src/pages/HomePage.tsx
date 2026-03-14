import { useState } from 'react';
import type { ColorInfo, ColorRecord, EmotionResult } from '../types';
import ColorPicker from '../components/ColorPicker';
import DailyAIComment from '../components/DailyAIComment';
import { useColorHistory } from '../hooks/useColorHistory';
import { getTodayString } from '../utils/storage';
import { getColorDisplayName } from '../utils/colors';
import { useI18n } from '../i18n';

export default function HomePage() {
  const { records, save, getByDate } = useColorHistory();
  const { t } = useI18n();
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
        <h1 className="page-title">{t.homeTitle}</h1>
        {todayRecord ? (
          <>
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
              {t.todayColor}: {getColorDisplayName(todayRecord.color, t)} {todayRecord.emotion.emoji}
            </div>
            <DailyAIComment record={todayRecord} recentRecords={records} />
          </>
        ) : (
          <p style={{ fontSize: 14, color: 'var(--text-dim)' }}>
            {t.homePrompt}
          </p>
        )}
      </div>

      <ColorPicker
        onSave={handleSave}
        initialColor={todayRecord?.color}
      />

      {saved && (
        <div className="save-toast">
          {t.savedToast}
        </div>
      )}
    </div>
  );
}
