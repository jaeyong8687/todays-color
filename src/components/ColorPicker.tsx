import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import type { ColorInfo, EmotionResult } from '../types';
import { createColorFromHSV, getColorDisplayName } from '../utils/colors';
import { getSuggestedEmotions, analyzeEmotion } from '../utils/emotions';
import { useI18n } from '../i18n';

interface Props {
  onSave: (color: ColorInfo, emotion: EmotionResult, memo: string) => void;
  initialColor?: ColorInfo;
}

function drawSpectrum(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')!;
  const w = canvas.width;
  const h = canvas.height;

  // X = Hue (rainbow), Y = top:white → middle:vivid → bottom:black
  // Top third: white → vivid (saturation 0→100, brightness 100)
  // Middle: vivid (saturation 100, brightness 100)
  // Bottom third: vivid → black (saturation 100, brightness 100→0)
  for (let x = 0; x < w; x++) {
    const hue = (x / w) * 360;
    for (let y = 0; y < h; y++) {
      const ratio = y / h;
      let s: number, v: number;
      if (ratio < 0.4) {
        // White → vivid: saturation ramps up, brightness stays 100
        s = (ratio / 0.4) * 100;
        v = 100;
      } else {
        // Vivid → black: saturation stays 100, brightness drops
        s = 100;
        v = (1 - (ratio - 0.4) / 0.6) * 100;
      }
      const sN = s / 100, vN = v / 100;
      const c = vN * sN;
      const x2 = c * (1 - Math.abs(((hue / 60) % 2) - 1));
      const m = vN - c;
      let r = 0, g = 0, b = 0;
      if (hue < 60) { r = c; g = x2; }
      else if (hue < 120) { r = x2; g = c; }
      else if (hue < 180) { g = c; b = x2; }
      else if (hue < 240) { g = x2; b = c; }
      else if (hue < 300) { r = x2; b = c; }
      else { r = c; b = x2; }
      ctx.fillStyle = `rgb(${Math.round((r + m) * 255)},${Math.round((g + m) * 255)},${Math.round((b + m) * 255)})`;
      ctx.fillRect(x, y, 1, 1);
    }
  }
}

function getHSV(x: number, y: number, w: number, h: number) {
  const hue = Math.round((x / w) * 360) % 360;
  const ratio = y / h;
  let s: number, v: number;
  if (ratio < 0.4) {
    s = Math.round((ratio / 0.4) * 100);
    v = 100;
  } else {
    s = 100;
    v = Math.round((1 - (ratio - 0.4) / 0.6) * 100);
  }
  return { h: hue, s, v };
}

export default function ColorPicker({ onSave, initialColor }: Props) {
  const { t } = useI18n();
  const [selected, setSelected] = useState<ColorInfo | null>(null);
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionResult | null>(null);
  const [memo, setMemo] = useState('');
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const activeColor = selected;
  const suggestions = useMemo(
    () => activeColor ? getSuggestedEmotions(activeColor) : [],
    [activeColor]
  );

  const getEmotionDisplay = (e: EmotionResult) => {
    const emotionData = t.emotions[e.primary] || t.lightEmotions[e.primary];
    return emotionData ? emotionData.primary : e.primary;
  };

  // Draw canvas to fill wrapper
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;
    const w = wrapper.clientWidth;
    const h = wrapper.clientHeight;
    if (w === 0 || h === 0) return;
    canvas.width = w;
    canvas.height = h;
    drawSpectrum(canvas);
  }, []);

  useEffect(() => {
    drawCanvas();
    window.addEventListener('resize', drawCanvas);
    return () => window.removeEventListener('resize', drawCanvas);
  }, [drawCanvas]);

  // Redraw after first paint (wrapper may not have height yet)
  useEffect(() => {
    const timer = setTimeout(drawCanvas, 100);
    return () => clearTimeout(timer);
  }, [drawCanvas]);

  const pickColor = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width - 1));
    const y = Math.max(0, Math.min(clientY - rect.top, rect.height - 1));
    const canvasX = (x / rect.width) * canvas.width;
    const canvasY = (y / rect.height) * canvas.height;
    const hsv = getHSV(canvasX, canvasY, canvas.width, canvas.height);
    const color = createColorFromHSV(hsv.h, hsv.s, hsv.v);
    setSelected(color);
    setSelectedEmotion(null);
    setCursorPos({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 });
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    pickColor(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (e.buttons > 0) pickColor(e.clientX, e.clientY);
  };

  const handleSave = () => {
    if (!activeColor) return;
    const emotion = selectedEmotion || analyzeEmotion(activeColor);
    onSave(activeColor, emotion, memo);
    setShowDetails(false);
  };

  return (
    <div className="picker-fullscreen">
      {/* Gradient canvas — fills all available space */}
      <div className="spectrum-fill" ref={wrapperRef}>
        <canvas
          ref={canvasRef}
          className="spectrum-canvas-full"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
        />
        {cursorPos && (
          <div
            className="spectrum-cursor-full"
            style={{
              left: `${cursorPos.x}%`,
              top: `${cursorPos.y}%`,
              borderColor: activeColor && activeColor.lightness > 50 ? '#000' : '#fff',
            }}
          />
        )}
      </div>

      {/* Bottom bar — color preview + save */}
      {activeColor && (
        <div className="picker-bottom-bar">
          <div
            className="picker-color-pill"
            style={{
              backgroundColor: activeColor.hsl,
              color: activeColor.lightness > 55 ? '#111' : '#fff',
            }}
            onClick={() => setShowDetails(!showDetails)}
          >
            <span className="pill-name">{getColorDisplayName(activeColor, t)}</span>
            <span className="pill-hex">{activeColor.hex.toUpperCase()}</span>
            <span className="pill-arrow">{showDetails ? '▼' : '▲'}</span>
          </div>
          <button className="btn-save" onClick={handleSave}>
            {t.saveColor}
          </button>
        </div>
      )}

      {/* Memo — always visible when color selected */}
      {activeColor && (
        <textarea
          className="memo-input memo-compact"
          placeholder={t.memoPlaceholder}
          rows={1}
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
        />
      )}

      {/* Expandable details — mood chips */}
      {showDetails && activeColor && (
        <div className="picker-details-sheet">
          <p className="mood-question-optional">{t.moodQuestion} <span className="optional-tag">optional</span></p>
          <div className="mood-chips">
            {suggestions.map((e) => (
              <button
                key={e.primary}
                className={`mood-chip ${selectedEmotion?.primary === e.primary ? 'active' : ''}`}
                onClick={() => setSelectedEmotion(
                  selectedEmotion?.primary === e.primary ? null : e
                )}
              >
                <span className="mood-chip-emoji">{e.emoji}</span>
                <span>{getEmotionDisplay(e)}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
