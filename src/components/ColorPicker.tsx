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
  initialEmotion?: EmotionResult;
  initialMemo?: string;
  initialTags?: string[];
}

function drawSpectrum(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w = canvas.width;
  const h = canvas.height;
  const imageData = ctx.createImageData(w, h);
  const { data } = imageData;

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

    for (let x = 0; x < w; x++) {
      const hue = (x / w) * 360;
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

      const index = (y * w + x) * 4;
      data[index] = Math.round((r + m) * 255);
      data[index + 1] = Math.round((g + m) * 255);
      data[index + 2] = Math.round((b + m) * 255);
      data[index + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
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

export default function ColorPicker({
  onSave,
  initialColor,
  initialEmotion,
  initialMemo = '',
  initialTags,
}: Props) {
  const { t } = useI18n();
  const { activeProfile } = useProfile();
  const normalizedInitialTags = useMemo(() => normalizeTags(initialTags), [initialTags]);
  const [selected, setSelected] = useState<ColorInfo | null>(initialColor ?? null);
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionResult | null>(null);
  const [memo, setMemo] = useState(initialMemo);
  const [tags, setTags] = useState<string[]>(normalizedInitialTags);
  const [tagInput, setTagInput] = useState('');
  const [recentTags, setRecentTags] = useState<string[]>([]);
  const [showDetails, setShowDetails] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const pendingPointerRef = useRef<{ clientX: number; clientY: number } | null>(null);
  const interactionFrameRef = useRef<number | null>(null);
  const resizeFrameRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);
  const spectrumSizeRef = useRef<{ width: number; height: number }>({ width: 0, height: 0 });
  const latestSelectionRef = useRef<{
    color: ColorInfo;
    xRatio: number;
    yRatio: number;
  } | null>(null);

  const activeColor = selected;
  const suggestions = useMemo(
    () => activeColor ? getSuggestedEmotions(activeColor) : [],
    [activeColor]
  );

  useEffect(() => {
    setSelected(initialColor ?? null);
    setMemo(initialMemo);
    setTags(normalizedInitialTags);
    setSelectedEmotion(initialEmotion ?? null);
    setShowDetails(false);
  }, [initialColor, initialEmotion, initialMemo, normalizedInitialTags]);

  useEffect(() => {
    setRecentTags(getRecentTags(activeProfile.id));
  }, [activeProfile.id]);

  const getEmotionDisplay = (e: EmotionResult) => {
    const emotionData = t.emotions[e.primary] || t.lightEmotions[e.primary];
    return emotionData ? emotionData.primary : e.primary;
  };

  const updateCursor = useCallback((xRatio: number, yRatio: number, borderColor: string) => {
    const cursor = cursorRef.current;
    const wrapper = wrapperRef.current;
    if (!cursor || !wrapper) return;

    cursor.style.opacity = '1';
    cursor.style.borderColor = borderColor;
    cursor.style.transform = `translate3d(${xRatio * wrapper.clientWidth}px, ${yRatio * wrapper.clientHeight}px, 0) translate3d(-50%, -50%, 0)`;
  }, []);

  const drawCanvas = useCallback((width: number, height: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = Math.floor(width);
    const h = Math.floor(height);
    if (w === 0 || h === 0) return;
    if (spectrumSizeRef.current.width === w && spectrumSizeRef.current.height === h) return;

    spectrumSizeRef.current = { width: w, height: h };
    canvas.width = w;
    canvas.height = h;
    drawSpectrum(canvas);
  }, []);

  const getSelectionFromPoint = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width - 1));
    const y = Math.max(0, Math.min(clientY - rect.top, rect.height - 1));
    const canvasX = (x / rect.width) * canvas.width;
    const canvasY = (y / rect.height) * canvas.height;
    const hsv = getHSV(canvasX, canvasY, canvas.width, canvas.height);
    const color = createColorFromHSV(hsv.h, hsv.s, hsv.v);
    return {
      color,
      xRatio: x / rect.width,
      yRatio: y / rect.height,
    };
  }, []);

  const commitPendingInteraction = useCallback(() => {
    interactionFrameRef.current = null;

    const pendingPointer = pendingPointerRef.current;
    if (!pendingPointer) return;

    const selection = getSelectionFromPoint(pendingPointer.clientX, pendingPointer.clientY);
    if (!selection) return;

    latestSelectionRef.current = selection;
    updateCursor(
      selection.xRatio,
      selection.yRatio,
      selection.color.lightness > 50 ? '#000' : '#fff'
    );
    setSelected((prev) => prev?.hex === selection.color.hex ? prev : selection.color);
    setSelectedEmotion(null);
  }, [getSelectionFromPoint, updateCursor]);

  const scheduleInteraction = useCallback((clientX: number, clientY: number) => {
    pendingPointerRef.current = { clientX, clientY };
    if (interactionFrameRef.current !== null) return;

    interactionFrameRef.current = window.requestAnimationFrame(commitPendingInteraction);
  }, [commitPendingInteraction]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const scheduleDraw = () => {
      if (resizeFrameRef.current !== null) {
        window.cancelAnimationFrame(resizeFrameRef.current);
      }

      resizeFrameRef.current = window.requestAnimationFrame(() => {
        resizeFrameRef.current = null;
        drawCanvas(wrapper.clientWidth, wrapper.clientHeight);

        if (latestSelectionRef.current) {
          updateCursor(
            latestSelectionRef.current.xRatio,
            latestSelectionRef.current.yRatio,
            latestSelectionRef.current.color.lightness > 50 ? '#000' : '#fff'
          );
        }
      });
    };

    scheduleDraw();

    const resizeObserver = new ResizeObserver(scheduleDraw);
    resizeObserver.observe(wrapper);
    window.addEventListener('orientationchange', scheduleDraw, { passive: true });

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('orientationchange', scheduleDraw);
      if (resizeFrameRef.current !== null) {
        window.cancelAnimationFrame(resizeFrameRef.current);
      }
    };
  }, [drawCanvas, updateCursor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const passiveOptions: AddEventListenerOptions = { passive: true };

    const handleMouseDown = (event: MouseEvent) => {
      isDraggingRef.current = true;
      scheduleInteraction(event.clientX, event.clientY);
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!isDraggingRef.current) return;
      scheduleInteraction(event.clientX, event.clientY);
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      pendingPointerRef.current = null;
    };

    const handleTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;
      isDraggingRef.current = true;
      scheduleInteraction(touch.clientX, touch.clientY);
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!isDraggingRef.current) return;
      const touch = event.touches[0];
      if (!touch) return;
      scheduleInteraction(touch.clientX, touch.clientY);
    };

    const handleTouchEnd = () => {
      isDraggingRef.current = false;
      pendingPointerRef.current = null;
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove, passiveOptions);
    window.addEventListener('mouseup', handleMouseUp);

    canvas.addEventListener('touchstart', handleTouchStart, passiveOptions);
    window.addEventListener('touchmove', handleTouchMove, passiveOptions);
    window.addEventListener('touchend', handleTouchEnd, passiveOptions);
    window.addEventListener('touchcancel', handleTouchEnd, passiveOptions);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);

      canvas.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);

      if (interactionFrameRef.current !== null) {
        window.cancelAnimationFrame(interactionFrameRef.current);
      }
    };
  }, [scheduleInteraction]);

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
        />
        <div ref={cursorRef} className="spectrum-cursor-full" />
      </div>

      {activeColor && (
        <div className="picker-bottom-bar reveal-item" style={{ animationDelay: '0ms' }}>
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
        <textarea
          className="memo-input memo-prominent reveal-item"
          placeholder={t.memoPlaceholder}
          style={{ animationDelay: '80ms' }}
          rows={2}
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
        />

      )}

      {activeColor && (
        <div className="tag-section reveal-item" style={{ animationDelay: '160ms' }}>
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
                <span>{getEmotionDisplay(e)}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
