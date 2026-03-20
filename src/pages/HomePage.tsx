import { useState } from 'react';
import type { ColorInfo, ColorRecord, EmotionResult } from '../types';
import ColorPicker from '../components/ColorPicker';
import DailyAIComment from '../components/DailyAIComment';
import { useColorHistory } from '../hooks/useColorHistory';
import { getTodayString } from '../utils/storage';
import { useI18n } from '../i18n';

export default function HomePage() {
  const { records, save, getByDate } = useColorHistory();
  const { t } = useI18n();
  const [saved, setSaved] = useState(false);
  const [savedColor, setSavedColor] = useState<string | null>(null);

  const today = getTodayString();
  const todayRecord = getByDate(today);

  const handleSave = (color: ColorInfo, emotion: EmotionResult, memo: string, tags?: string[]) => {
    const record: ColorRecord = {
      date: getTodayString(),
      color,
      memo,
      emotion,
      tags,
    };
    save(record);
    setSavedColor(color.hsl);
    setSaved(true);
    setTimeout(() => setSaved(false), 2800);
  };

  return (
    <div className="page home-page">
      <p className="home-prompt-text">{t.homePrompt}</p>
      <ColorPicker
        onSave={handleSave}
        initialColor={todayRecord?.color}
        initialMemo={todayRecord?.memo}
        initialTags={todayRecord?.tags}
      />

      {saved && (
        <div className="save-celebration">
          <div className="save-celebration-inner" style={savedColor ? {
            borderColor: savedColor,
          } : undefined}>
            <span className="save-celebration-text">{t.savedToast}</span>
          </div>
        </div>
      )}

      {todayRecord && (
        <DailyAIComment
          record={todayRecord}
          recentRecords={records.filter((record) => record.date <= today)}
        />
      )}
    </div>
  );
}
