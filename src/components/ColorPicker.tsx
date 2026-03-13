import { useState, useRef, useCallback, useEffect } from 'react';
import type { ColorInfo, EmotionResult } from '../types';
import { createColorFromHSV } from '../utils/colors';
import { getSuggestedEmotions } from '../utils/emotions';

interface Props {
  onSave: (color: ColorInfo, emotion: EmotionResult, memo: string) => void;
  initialColor?: ColorInfo;
}

export default function ColorPicker({ onSave, initialColor }: Props) {
  const [hue, setHue] = useState(initialColor?.hue ?? 210);
  const [saturation, setSaturation] = useState(80);
  const [brightness, setBrightness] = useState(90);
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionResult | null>(null);
  const [memo, setMemo] = useState('');
  const [step, setStep] = useState<'color' | 'mood'>('color');

  const svPanelRef = useRef<HTMLDivElement>(null);
  const hueBarRef = useRef<HTMLDivElement>(null);
  const draggingSV = useRef(false);
  const draggingHue = useRef(false);

  const color = createColorFromHSV(hue, saturation, brightness);
  const suggestions = getSuggestedEmotions(color);

  const updateSV = useCallback((clientX: number, clientY: number) => {
    const el = svPanelRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(clientY - rect.top, rect.height));
    setSaturation(Math.round((x / rect.width) * 100));
    setBrightness(Math.round((1 - y / rect.height) * 100));
  }, []);

  const updateHue = useCallback((clientX: number) => {
    const el = hueBarRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setHue(Math.round((x / rect.width) * 360));
  }, []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (draggingSV.current) { e.preventDefault(); updateSV(e.clientX, e.clientY); }
      if (draggingHue.current) { e.preventDefault(); updateHue(e.clientX); }
    };
    const onUp = () => { draggingSV.current = false; draggingHue.current = false; };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [updateSV, updateHue]);

  const handleConfirmColor = () => {
    setSelectedEmotion(null);
    setMemo('');
    setStep('mood');
  };

  const handleSave = () => {
    if (!selectedEmotion) return;
    onSave(color, selectedEmotion, memo);
  };

  const textColor = brightness > 60 && saturation < 50 ? '#222' : '#fff';

  return (
    <div className="picker">
      {/* Color Picker */}
      <div
        ref={svPanelRef}
        className="picker-sv-panel"
        style={{ backgroundColor: `hsl(${hue}, 100%, 50%)` }}
        onPointerDown={(e) => {
          draggingSV.current = true;
          (e.target as HTMLElement).setPointerCapture(e.pointerId);
          updateSV(e.clientX, e.clientY);
        }}
      >
        <div className="picker-sv-white" />
        <div className="picker-sv-black" />
        <div
          className="picker-sv-cursor"
          style={{ left: `${saturation}%`, top: `${100 - brightness}%` }}
        />
      </div>

      <div
        ref={hueBarRef}
        className="picker-hue-bar"
        onPointerDown={(e) => {
          draggingHue.current = true;
          (e.target as HTMLElement).setPointerCapture(e.pointerId);
          updateHue(e.clientX);
        }}
      >
        <div className="picker-hue-cursor" style={{ left: `${(hue / 360) * 100}%` }} />
      </div>

      {/* Color Preview */}
      <div className="picker-result">
        <div className="picker-preview" style={{ backgroundColor: color.hsl, color: textColor }}>
          <span className="picker-preview-name">{color.name}</span>
          <span className="picker-preview-hex">{color.hex.toUpperCase()}</span>
        </div>

        {step === 'color' && (
          <button className="btn-primary" onClick={handleConfirmColor}>
            이 색으로 정하기
          </button>
        )}

        {/* Mood Selection Step */}
        {step === 'mood' && (
          <div className="mood-section">
            <p className="mood-question">오늘 기분이 어때요?</p>

            <div className="mood-chips">
              {suggestions.map((e) => (
                <button
                  key={e.primary}
                  className={`mood-chip ${selectedEmotion?.primary === e.primary ? 'active' : ''}`}
                  onClick={() => setSelectedEmotion(e)}
                >
                  <span className="mood-chip-emoji">{e.emoji}</span>
                  <span>{e.primary}</span>
                </button>
              ))}
            </div>

            <textarea
              className="memo-input"
              placeholder="더 이야기하고 싶다면 자유롭게 ✏️"
              rows={2}
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
            />

            <button
              className={`btn-primary ${!selectedEmotion ? 'btn-disabled' : ''}`}
              onClick={handleSave}
              disabled={!selectedEmotion}
            >
              오늘의 색 저장하기
            </button>

            <button className="btn-text" onClick={() => setStep('color')}>
              ← 색 다시 고르기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
