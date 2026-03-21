import { useState } from 'react';
import type { ColorInfo, ColorRecord, EmotionResult } from '../types';
import ColorPicker from '../components/ColorPicker';
import SaveBridgeCard from '../components/SaveBridgeCard';
import { useColorHistory } from '../hooks/useColorHistory';
import { getTodayString } from '../utils/storage';
import { useI18n } from '../i18n';

export default function HomePage() {
  const { records, save, getByDate } = useColorHistory();
  const { t } = useI18n();
  const [showBridge, setShowBridge] = useState(false);
  const [savedColor, setSavedColor] = useState<string | null>(null);

  const today = getTodayString();
  const todayRecord = getByDate(today);

  const handleSave = (color: ColorInfo, emotion: EmotionResult, memo: string) => {
    const record: ColorRecord = {
      date: getTodayString(),
      color,
      memo,
      emotion,
    };
    save(record);
    setSavedColor(color.hsl);
    setShowBridge(true);
  };

  return (
    <div className="page home-page">
      <p className="home-prompt-text">{t.homePrompt}</p>
      <ColorPicker
        onSave={handleSave}
        initialColor={todayRecord?.color}
        initialMemo={todayRecord?.memo}
      />

      {showBridge && savedColor && (
        <SaveBridgeCard
          records={records}
          savedColor={savedColor}
          onDismiss={() => setShowBridge(false)}
        />
      )}
    </div>
  );
}
