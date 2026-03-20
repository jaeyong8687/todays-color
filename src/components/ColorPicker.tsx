import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import type { ColorInfo, EmotionResult } from '../types';
import { createColorFromHSV, getColorDisplayName } from '../utils/colors';
import { getSuggestedEmotions, analyzeEmotion } from '../utils/emotions';
import { getRecentTags } from '../utils/storage';
import { useProfile } from '../hooks/useProfile';
import { useI18n } from '../i18n';

interface Props {
  onSave: (color: ColorInfo, emotion: EmotionResult, memo: string, tags?: string[]) => void;
  initialColor?: ColorInfo;
  initialMemo?: string;
  initialTags?: string[];
}

function drawSpectrum(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')!;
  const w = canvas.width;
  const h = canvas.height;

  for (let x = 0; x < w; x++) {
    const hue = (x / w) * 360;
    for (let y = 0; y < h; y++) {
      const ratio = y / h;
      let s: number, v: number;
      if (ratio < 0.4) {
        s = (ratio / 0.4) * 100;
        v = 100;
      } else {
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

function normalizeTags(tags?: string[]) {
  return (tags ?? [])
    .map((tag) => tag.trim())
    .filter(Boolean)
    .filter((tag, index, arr) => arr.findIndex((item) => item.toLowerCase() === tag.toLowerCase()) === index)
    .slice(0, 3);
}

export default function ColorPicker({ onSave, initialColor, initialMemo = '', initialTags }: Props) {
  const { t } = useI18n();
  const { activeProfile } = useProfile();
  const normalizedInitialTags = useMemo(() => normalizeTags(initialTags), [initialTags]);
  const [selected, setSelected] = useState<ColorInfo | null>(initialColor ?? null);
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionResult | null>(null);
  const [memo, setMemo] = useState(initialMemo);
  const [tags, setTags] = useState<string[]>(normalizedInitialTags);
  const [tagInput, setTagInput] = useState('');
  const [recentTags, setRecentTags] = useState<string[]>([]);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const activeColor = selected;
  const suggestions = useMemo(
    () => activeColor ? getSuggestedEmotions(activeColor) : [],
    [activeColor]
  );

  useEffect(() => {
    setSelected(initialColor ?? null);
    setMemo(initialMemo);
    setTags(normalizedInitialTags);
    setSelectedEmotion(null);
    setShowDetails(false);
  }, [initialColor, initialMemo, normalizedInitialTags]);

  useEffect(() => {
    setRecentTags(getRecentTags(activeProfile.id));
  }, [activeProfile.id]);

  const getEmotionDisplay = (e: EmotionResult) => {
    const emotionData = t.emotions[e.primary] || t.lightEmotions[e.primary];
    return emotionData ? emotionData.primary : e.primary;
  };

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

  const addTag = useCallback((rawTag: string) => {
    const nextTag = rawTag.trim();
    if (!nextTag) return;

    setTags((prev) => {
      if (prev.length >= 3) return prev;
      if (prev.some((tag) => tag.toLowerCase() === nextTag.toLowerCase())) return prev;
      return [...prev, nextTag];
    });
    setTagInput('');
  }, []);

  const removeTag = useCallback((targetTag: string) => {
    setTags((prev) => prev.filter((tag) => tag.toLowerCase() !== targetTag.toLowerCase()));
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
    const normalizedTags = normalizeTags(tags);
    onSave(activeColor, emotion, memo, normalizedTags.length > 0 ? normalizedTags : undefined);
    setShowDetails(false);
  };

  const availableRecentTags = recentTags.filter(
    (recentTag) => !tags.some((tag) => tag.toLowerCase() === recentTag.toLowerCase())
  );

  return (
    <div className="picker-fullscreen">
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

      {activeColor && (
        <div className="tag-section">
          <div className="tag-section-header">
            <span className="tag-label">{t.emotionTags}</span>
            <span className="tag-count">{tags.length}/3</span>
          </div>

          <div className="tag-input-wrap">
            <input
              className="tag-input"
              type="text"
              value={tagInput}
              maxLength={20}
              placeholder={t.tagPlaceholder}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag(tagInput);
                }
              }}
            />
          </div>

          {tags.length > 0 && (
            <div className="tag-chip-list">
              {tags.map((tag) => (
                <span key={tag} className="tag-chip">
                  <span>{tag}</span>
                  <button
                    type="button"
                    className="tag-chip-remove"
                    onClick={() => removeTag(tag)}
                    aria-label={t.removeTag(tag)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          {availableRecentTags.length > 0 && (
            <div className="recent-tags-section">
              <div className="recent-tags-label">{t.recentTags}</div>
              <div className="recent-tags-list">
                {availableRecentTags.slice(0, 6).map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className="recent-tag-chip"
                    onClick={() => addTag(tag)}
                    disabled={tags.length >= 3}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeColor && (
        <textarea
          className="memo-input memo-compact"
          placeholder={t.memoPlaceholder}
          rows={1}
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
        />
      )}

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
