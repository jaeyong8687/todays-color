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

  // Draw sector backgrounds (outer ring)
  const ringWidth = 18;
  for (const sector of HUE_SECTORS) {
    const startAngle = ((sector.start - 90) * Math.PI) / 180;
    const endAngle = ((sector.end - 90) * Math.PI) / 180;
    const midHue = (sector.start + sector.end) / 2;

    // Outer colored ring
    ctx.beginPath();
    ctx.arc(cx, cy, maxR + ringWidth / 2, startAngle, endAngle);
    ctx.strokeStyle = `hsl(${midHue}, 70%, 50%)`;
    ctx.lineWidth = ringWidth;
    ctx.stroke();

    // Label
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

  // Draw chroma rings (concentric circles)
  const rings = [0.25, 0.5, 0.75, 1.0];
  for (const frac of rings) {
    const r = innerR + (maxR - innerR) * frac;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = VIZ.gridColor;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Draw radial grid lines per sector
  for (const sector of HUE_SECTORS) {
    const angle = ((sector.start - 90) * Math.PI) / 180;
    ctx.beginPath();
    ctx.moveTo(cx + innerR * Math.cos(angle), cy + innerR * Math.sin(angle));
    ctx.lineTo(cx + maxR * Math.cos(angle), cy + maxR * Math.sin(angle));
    ctx.strokeStyle = VIZ.gridColor;
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }

  // Plot dots: angle = hue, radius = saturation (chroma)
  const dots: PlottedDot[] = records.map((r) => {
    const hue = r.color.hue;
    const sat = r.color.saturation; // 0-100
    const angle = ((hue - 90) * Math.PI) / 180;
    const radius = innerR + (maxR - innerR) * (sat / 100);
    const dotCx = cx + radius * Math.cos(angle);
    const dotCy = cy + radius * Math.sin(angle);

    return {
      cx: dotCx,
      cy: dotCy,
      hex: r.color.hex,
      date: r.date,
      name: r.color.name,
      memo: r.memo,
      hue,
      saturation: sat,
    };
  });

  // Draw dots
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
  const [tooltip, setTooltip] = useState<{ x: number; y: number; dot: PlottedDot } | null>(null);
  const dotsRef = useRef<PlottedDot[]>([]);
  const { t } = useI18n();

  const size = 340;

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
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    let found = -1;
    for (let i = dotsRef.current.length - 1; i >= 0; i--) {
      const d = dotsRef.current[i];
      const dist = Math.sqrt((mx - d.cx) ** 2 + (my - d.cy) ** 2);
      if (dist <= VIZ.dotRadiusHover + 2) {
        found = i;
        break;
      }
    }

    if (found >= 0) {
      setHoveredIdx(found);
      setTooltip({ x: e.clientX, y: e.clientY, dot: dotsRef.current[found] });
    } else {
      setHoveredIdx(null);
      setTooltip(null);
    }
  };

  if (records.length === 0) return null;

  return (
    <div className="stat-card">
      <h3>{t.colorRadialMap || '🌈 색상 분포 맵'}</h3>
      <div
        ref={containerRef}
        style={{ position: 'relative', display: 'flex', justifyContent: 'center', padding: '12px 0' }}
      >
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => { setHoveredIdx(null); setTooltip(null); }}
          style={{ cursor: hoveredIdx !== null ? 'pointer' : 'default' }}
        />
        {tooltip && (
          <div
            style={{
              position: 'fixed',
              left: tooltip.x + 12,
              top: tooltip.y - 40,
              background: VIZ.tooltipBg,
              color: VIZ.tooltipText,
              border: `1px solid ${VIZ.tooltipBorder}`,
              borderRadius: 8,
              padding: '8px 12px',
              fontSize: 12,
              pointerEvents: 'none',
              zIndex: 100,
              maxWidth: 200,
              lineHeight: 1.5,
            }}
          >
            <div style={{ fontWeight: 600 }}>{tooltip.dot.date}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
              <span style={{
                display: 'inline-block',
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: tooltip.dot.hex,
                border: '1px solid rgba(255,255,255,0.2)',
              }} />
              {tooltip.dot.name} {tooltip.dot.hex}
            </div>
            {tooltip.dot.memo && (
              <div style={{ marginTop: 4, color: VIZ.labelColor }}>
                💬 {tooltip.dot.memo.slice(0, 40)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
