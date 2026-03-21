import { useRef, useEffect, useState } from 'react';
import type { ColorRecord } from '../types';
import { useI18n } from '../i18n';
import { VIZ, HUE_SECTORS } from './vizTokens';

interface Props {
  records: ColorRecord[];
}

interface PlottedDot {
  cx: number;
  cy: number;
  hex: string;
  date: string;
  name: string;
  memo: string;
  hue: number;
  saturation: number;
}

const DPR = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;

function drawRadialMap(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  records: ColorRecord[],
  hoveredIdx: number | null,
): PlottedDot[] {
  const cx = width / 2;
  const cy = height / 2;
  const maxR = Math.min(cx, cy) - 40;
  const innerR = maxR * 0.15;

  ctx.clearRect(0, 0, width, height);

  const ringWidth = 18;
  for (const sector of HUE_SECTORS) {
    const startAngle = ((sector.start - 90) * Math.PI) / 180;
    const endAngle = ((sector.end - 90) * Math.PI) / 180;
    const midHue = (sector.start + sector.end) / 2;

    ctx.beginPath();
    ctx.arc(cx, cy, maxR + ringWidth / 2, startAngle, endAngle);
    ctx.strokeStyle = `hsl(${midHue}, 70%, 50%)`;
    ctx.lineWidth = ringWidth;
    ctx.stroke();

    const labelAngle = (startAngle + endAngle) / 2;
    const labelR = maxR + ringWidth + 14;
    const lx = cx + labelR * Math.cos(labelAngle);
    const ly = cy + labelR * Math.sin(labelAngle);
    ctx.save();
    ctx.fillStyle = VIZ.labelColor;
    ctx.font = VIZ.labelFont;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(sector.label, lx, ly);
    ctx.restore();
  }

  const rings = [0.25, 0.5, 0.75, 1.0];
  for (const frac of rings) {
    const r = innerR + (maxR - innerR) * frac;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = VIZ.gridColor;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  for (const sector of HUE_SECTORS) {
    const angle = ((sector.start - 90) * Math.PI) / 180;
    ctx.beginPath();
    ctx.moveTo(cx + innerR * Math.cos(angle), cy + innerR * Math.sin(angle));
    ctx.lineTo(cx + maxR * Math.cos(angle), cy + maxR * Math.sin(angle));
    ctx.strokeStyle = VIZ.gridColor;
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }

  const dots: PlottedDot[] = records.map((r) => {
    const hue = r.color.hue;
    const sat = r.color.saturation;
    const angle = ((hue - 90) * Math.PI) / 180;
    const radius = innerR + (maxR - innerR) * (sat / 100);
    return {
      cx: cx + radius * Math.cos(angle),
      cy: cy + radius * Math.sin(angle),
      hex: r.color.hex,
      date: r.date,
      name: r.color.name,
      memo: r.memo,
      hue,
      saturation: sat,
    };
  });

  dots.forEach((dot, i) => {
    const isHovered = hoveredIdx === i;
    const r = isHovered ? VIZ.dotRadiusHover : VIZ.dotRadius;
    ctx.beginPath();
    ctx.arc(dot.cx, dot.cy, r, 0, Math.PI * 2);
    ctx.fillStyle = dot.hex;
    ctx.globalAlpha = isHovered ? 1 : VIZ.dotOpacity;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = isHovered ? '#fff' : VIZ.dotStroke;
    ctx.lineWidth = isHovered ? 2 : VIZ.dotStrokeWidth;
    ctx.stroke();
  });

  return dots;
}

export default function RadialHueMap({ records }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const dotsRef = useRef<PlottedDot[]>([]);
  const { t } = useI18n();

  const [size, setSize] = useState(340);

  useEffect(() => {
    const updateSize = () => {
      const container = containerRef.current;
      if (container) {
        const w = Math.min(container.clientWidth - 24, 400);
        setSize(Math.max(w, 240));
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || records.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = size * DPR;
    canvas.height = size * DPR;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(DPR, DPR);
    dotsRef.current = drawRadialMap(ctx, size, size, records, hoveredIdx);
  }, [records, hoveredIdx, size]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (size / rect.width);
    const my = (e.clientY - rect.top) * (size / rect.height);

    let found = -1;
    for (let i = dotsRef.current.length - 1; i >= 0; i--) {
      const d = dotsRef.current[i];
      const dist = Math.sqrt((mx - d.cx) ** 2 + (my - d.cy) ** 2);
      if (dist <= VIZ.dotRadiusHover + 2) { found = i; break; }
    }

    if (found >= 0) {
      setHoveredIdx(found);
      const container = containerRef.current;
      if (container) {
        const cRect = container.getBoundingClientRect();
        setTooltipPos({
          x: e.clientX - cRect.left + 12,
          y: e.clientY - cRect.top - 40,
        });
      }
    } else {
      setHoveredIdx(null);
      setTooltipPos(null);
    }
  };

  if (records.length === 0) return null;

  const hovered = hoveredIdx !== null ? dotsRef.current[hoveredIdx] : null;

  return (
    <div className="stat-card">
      <h3>{t.colorRadialMap || '색상 분포 맵'}</h3>
      <div
        ref={containerRef}
        style={{ position: 'relative', display: 'flex', justifyContent: 'center', padding: '12px 0' }}
      >
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => { setHoveredIdx(null); setTooltipPos(null); }}
          style={{ cursor: hoveredIdx !== null ? 'pointer' : 'default' }}
        />
        {hovered && tooltipPos && (
          <div style={{
            position: 'absolute',
            left: tooltipPos.x,
            top: tooltipPos.y,
            background: VIZ.tooltipBg,
            color: VIZ.tooltipText,
            border: `1px solid ${VIZ.tooltipBorder}`,
            borderRadius: 8,
            padding: '10px 16px',
            fontSize: 14,
            pointerEvents: 'none',
            zIndex: 10,
            maxWidth: 260,
            lineHeight: 1.5,
            whiteSpace: 'nowrap',
          }}>
            <div style={{ fontWeight: 600 }}>{hovered.date}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
              <span style={{
                display: 'inline-block', width: 12, height: 12, borderRadius: '50%',
                background: hovered.hex, border: '1px solid rgba(255,255,255,0.2)',
              }} />
              {hovered.name}
            </div>
            {hovered.memo && (
              <div style={{ marginTop: 4, color: VIZ.labelColor }}>
                {hovered.memo.slice(0, 60)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
