import { useState, useMemo } from 'react';
import type { ColorInfo, EmotionResult } from '../types';
import { createColorFromHSV, getColorDisplayName } from '../utils/colors';
import { getSuggestedEmotions } from '../utils/emotions';
import { useI18n } from '../i18n';

interface Props {
  onSave: (color: ColorInfo, emotion: EmotionResult, memo: string) => void;
  initialColor?: ColorInfo;
}

// Full spectrum: 36 hues × 12 tones + 12 grays = 444 colors
const COLS = 18;
const PALETTE = (() => {
  const hues: number[] = [];
  for (let i = 0; i < COLS; i++) hues.push(Math.round((i / COLS) * 360));

  // [saturation, value/brightness] — 12 rows from bright pastels to dark vivids
  const tones: [number, number][] = [
    [30, 98],  // very light pastel
    [45, 95],  // pastel
    [60, 92],  // soft
    [75, 88],  // medium-soft
    [90, 85],  // vivid bright
    [100, 75], // vivid
    [100, 60], // vivid medium
    [90, 48],  // dark vivid
    [70, 38],  // dark muted
    [50, 30],  // very dark muted
    [30, 22],  // near-black tinted
    [15, 15],  // almost black tinted
  ];

  const colors: ColorInfo[] = [];
  for (const [s, v] of tones) {
    for (const h of hues) {
      colors.push(createColorFromHSV(h, s, v));
    }
  }

  // Grayscale row
  const graySteps = COLS;
  for (let i = 0; i < graySteps; i++) {
    const v = Math.round(100 - (i / (graySteps - 1)) * 100);
    colors.push(createColorFromHSV(0, 0, Math.max(v, 2)));
  }

  return colors;
})();

export default function ColorPicker({ onSave, initialColor }: Props) {
  const { t } = useI18n();
  const [selected, setSelected] = useState<ColorInfo | null>(null);
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionResult | null>(null);
  const [memo, setMemo] = useState('');

  const activeColor = selected;
  const suggestions = useMemo(
    () => activeColor ? getSuggestedEmotions(activeColor) : [],
    [activeColor]
  );

  const getEmotionDisplay = (e: EmotionResult) => {
    const emotionData = t.emotions[e.primary] || t.lightEmotions[e.primary];
    return emotionData ? emotionData.primary : e.primary;
  };

  const handleSelectColor = (color: ColorInfo) => {
    setSelected(color);
    setSelectedEmotion(null);
    setMemo('');
  };

  const handleSave = () => {
    if (!activeColor || !selectedEmotion) return;
    onSave(activeColor, selectedEmotion, memo);
  };

  return (
    <div className="picker">
      {/* Full Spectrum Grid */}
      <div
        className="palette-grid"
        style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
      >
        {PALETTE.map((color, i) => (
          <button
            key={i}
            className={`palette-tile ${selected?.hex === color.hex ? 'selected' : ''}`}
            style={{ backgroundColor: color.hsl }}
            onClick={() => handleSelectColor(color)}
          />
        ))}
      </div>

      {/* Selected Color Preview + Mood */}
      {activeColor && (
        <div className="picker-result">
          <div
            className="picker-preview"
            style={{
              backgroundColor: activeColor.hsl,
              color: activeColor.lightness > 60 ? '#222' : '#fff',
            }}
          >
            <span className="picker-preview-name">{getColorDisplayName(activeColor, t)}</span>
            <span className="picker-preview-hex">{activeColor.hex.toUpperCase()}</span>
          </div>

          <div className="mood-section">
            <p className="mood-question">{t.moodQuestion}</p>

            <div className="mood-chips">
              {suggestions.map((e) => (
                <button
                  key={e.primary}
                  className={`mood-chip ${selectedEmotion?.primary === e.primary ? 'active' : ''}`}
                  onClick={() => setSelectedEmotion(e)}
                >
                  <span className="mood-chip-emoji">{e.emoji}</span>
                  <span>{getEmotionDisplay(e)}</span>
                </button>
              ))}
            </div>

            <textarea
              className="memo-input"
              placeholder={t.memoPlaceholder}
              rows={2}
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
            />

            <button
              className={`btn-primary ${!selectedEmotion ? 'btn-disabled' : ''}`}
              onClick={handleSave}
              disabled={!selectedEmotion}
            >
              {t.saveColor}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
