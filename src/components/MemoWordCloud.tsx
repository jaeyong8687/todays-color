import { useRef, useEffect, useMemo, useState, useCallback } from 'react';
import type { ColorRecord } from '../types';
import { useI18n } from '../i18n';
import { VIZ } from './vizTokens';

interface Props {
  records: ColorRecord[];
}

interface WordEntry {
  text: string;
  count: number;
  fontSize: number;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

const STOP_WORDS = new Set([
  '그', '이', '저', '것', '수', '등', '때', '중', '좀', '더', '안', '못', '잘',
  '너무', '아주', '매우', '정말', '진짜', '되게', '완전',
  '하다', '했다', '한다', '하고', '해서', '하는', '했는데', '하면',
  '있다', '없다', '있는', '없는', '있어', '없어', '있었', '없었',
  '되다', '된다', '되는', '되어', '돼서',
  '나는', '나도', '내가', '나의', '우리',
  '오늘', '어제', '내일', '오전', '오후',
  '그래서', '그런데', '그리고', '하지만', '그래도', '근데',
  'the', 'a', 'an', 'is', 'was', 'are', 'were', 'be', 'been',
  'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from',
  'and', 'or', 'but', 'not', 'so', 'if', 'it', 'my', 'me',
  'this', 'that', 'just', 'very', 'really', 'too', 'also',
  'i', 'im', "i'm", 'do', 'did', 'had', 'have', 'has',
]);

function extractWords(records: ColorRecord[]): Map<string, { count: number; colors: string[] }> {
  const wordMap = new Map<string, { count: number; colors: string[] }>();
  for (const r of records) {
    if (!r.memo || !r.memo.trim()) continue;
    const words = r.memo
      .toLowerCase()
      .replace(/[^\w\sㄱ-ㅎㅏ-ㅣ가-힣]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length >= 2 && !STOP_WORDS.has(w));
    for (const word of words) {
      const existing = wordMap.get(word);
      if (existing) {
        existing.count++;
        if (!existing.colors.includes(r.color.hex)) existing.colors.push(r.color.hex);
      } else {
        wordMap.set(word, { count: 1, colors: [r.color.hex] });
      }
    }
  }
  return wordMap;
}

const DPR = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;


function ensureVisible(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  if (luminance > 0.35) return hex;
  // Boost brightness: blend toward white
  const boost = 0.5;
  const nr = Math.round(r + (255 - r) * boost);
  const ng = Math.round(g + (255 - g) * boost);
  const nb = Math.round(b + (255 - b) * boost);
  return '#' + [nr, ng, nb].map(c => c.toString(16).padStart(2, '0')).join('');
}

function layoutWords(
  wordMap: Map<string, { count: number; colors: string[] }>,
  width: number,
  height: number,
): WordEntry[] {
  const sorted = [...wordMap.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 40);
  if (sorted.length === 0) return [];

  const maxCount = sorted[0][1].count;
  const minSize = 12;
  const maxSize = 36;
  const placed: WordEntry[] = [];
  const cx = width / 2;
  const cy = height / 2;

  for (const [text, { count, colors }] of sorted) {
    const fontSize = minSize + ((count / maxCount) * (maxSize - minSize));
    const color = ensureVisible(colors[Math.floor(Math.random() * colors.length)]);
    const estWidth = text.length * fontSize * 0.65;
    const estHeight = fontSize * 1.3;

    let didPlace = false;
    for (let t = 0; t < 500; t++) {
      const angle = t * 0.15;
      const radius = t * 0.8;
      const x = cx + radius * Math.cos(angle) - estWidth / 2;
      const y = cy + radius * Math.sin(angle) - estHeight / 2;
      if (x < 4 || y < 4 || x + estWidth > width - 4 || y + estHeight > height - 4) continue;

      const overlaps = placed.some((p) =>
        x < p.x + p.width + 4 && x + estWidth + 4 > p.x &&
        y < p.y + p.height + 2 && y + estHeight + 2 > p.y
      );

      if (!overlaps) {
        placed.push({ text, count, fontSize, color, x, y, width: estWidth, height: estHeight });
        didPlace = true;
        break;
      }
    }

    if (!didPlace && placed.length < 10) {
      placed.push({
        text, count, fontSize: minSize, color,
        x: Math.random() * (width - 60) + 4,
        y: Math.random() * (height - 20) + 4,
        width: text.length * minSize * 0.6,
        height: minSize * 1.3,
      });
    }
  }
  // Center the bounding box of all words within the canvas
  if (placed.length > 0) {
    const minX = Math.min(...placed.map(w => w.x));
    const maxX = Math.max(...placed.map(w => w.x + w.width));
    const minY = Math.min(...placed.map(w => w.y));
    const maxY = Math.max(...placed.map(w => w.y + w.height));
    const dx = (width - (minX + maxX)) / 2;
    const dy = (height - (minY + maxY)) / 2;
    for (const w of placed) {
      w.x += dx;
      w.y += dy;
    }
  }

  return placed;
}

export default function MemoWordCloud({ records }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [containerNode, setContainerNode] = useState<HTMLDivElement | null>(null);
  const containerRef = useCallback((node: HTMLDivElement | null) => {
    setContainerNode(node);
  }, []);
  const observerRef = useRef<ResizeObserver | null>(null);
  const [hoveredWord, setHoveredWord] = useState<WordEntry | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const wordsRef = useRef<WordEntry[]>([]);
  const { lang } = useI18n();

  const recordsWithMemo = useMemo(
    () => records.filter((r) => r.memo && r.memo.trim().length > 0),
    [records]
  );
  const wordMap = useMemo(() => extractWords(recordsWithMemo), [recordsWithMemo]);

  const [size, setSize] = useState({ w: 340, h: 260 });

  useEffect(() => {
    if (!containerNode) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const w = Math.round(entry.contentRect.width);
        const h = Math.round(entry.contentRect.height);
        if (w > 100 && h > 100) {
          setSize((prev) => (prev.w === w && prev.h === h) ? prev : { w, h });
        }
      }
    });
    observerRef.current = observer;
    observer.observe(containerNode);
    return () => observer.disconnect();
  }, [containerNode]);

  // Memoize layout so hover doesn't re-randomize positions/colors
  const words = useMemo(
    () => wordMap.size > 0 ? layoutWords(wordMap, size.w, size.h) : [],
    [wordMap, size.w, size.h]
  );

  useEffect(() => {
    wordsRef.current = words;
  }, [words]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || words.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = size.w * DPR;
    canvas.height = size.h * DPR;
    canvas.style.width = `${size.w}px`;
    canvas.style.height = `${size.h}px`;
    ctx.scale(DPR, DPR);
    ctx.clearRect(0, 0, size.w, size.h);

    for (const w of words) {
      ctx.font = `${w.fontSize >= 24 ? '700' : '500'} ${w.fontSize}px "Noto Sans KR", sans-serif`;
      ctx.fillStyle = w.color;
      ctx.globalAlpha = hoveredWord && w !== hoveredWord ? 0.3 : 0.85;
      ctx.fillText(w.text, w.x, w.y + w.fontSize);
    }
    ctx.globalAlpha = 1;
  }, [words, hoveredWord, size.w, size.h]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas || !containerNode) return;

    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (size.w / rect.width);
    const my = (e.clientY - rect.top) * (size.h / rect.height);

    const found = wordsRef.current.find((w) =>
      mx >= w.x && mx <= w.x + w.width && my >= w.y && my <= w.y + w.height
    );

    if (found && found !== hoveredWord) {
      setHoveredWord(found);
      const cRect = containerNode.getBoundingClientRect();
      setTooltipPos({
        x: e.clientX - cRect.left + 12,
        y: e.clientY - cRect.top - 30,
      });
    } else {
      setHoveredWord(null);
      setTooltipPos(null);
    }
  };

  const title = lang === 'ko' ? '메모 워드클라우드' : 'Memo Word Cloud';
  const noDataMsg = lang === 'ko' ? '메모가 있는 기록이 필요해요' : 'Need records with memos';

  if (recordsWithMemo.length < 2 || wordMap.size < 3) {
    return (
      <div className="stat-card">
        <h3>{title}</h3>
        <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-dim)', fontSize: 13 }}>
          {noDataMsg}
        </div>
      </div>
    );
  }

  return (
    <div className="stat-card">
      <h3>{title}</h3>
      <div
        ref={containerRef}
        className="wc-canvas-container" style={{ position: 'relative' }}
      >
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => { setHoveredWord(null); setTooltipPos(null); }}
          style={{ cursor: hoveredWord ? 'pointer' : 'default' }}
        />
        {hoveredWord && tooltipPos && (
          <div style={{
            position: 'absolute',
            left: tooltipPos.x,
            top: tooltipPos.y,
            background: VIZ.tooltipBg,
            color: VIZ.tooltipText,
            border: `1px solid ${VIZ.tooltipBorder}`,
            borderRadius: 8,
            padding: '6px 10px',
            fontSize: 12,
            pointerEvents: 'none',
            zIndex: 10,
            whiteSpace: 'nowrap',
          }}>
            <strong>{hoveredWord.text}</strong>
            <span style={{ marginLeft: 8, color: VIZ.labelColor }}>×{hoveredWord.count}</span>
          </div>
        )}
      </div>
    </div>
  );
}
