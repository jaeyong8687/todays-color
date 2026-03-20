// Shared visual tokens for color map visualizations
export const VIZ = {
  dotRadius: 6,
  dotRadiusHover: 9,
  dotOpacity: 0.85,
  dotStroke: 'rgba(255,255,255,0.3)',
  dotStrokeWidth: 1.5,
  gridColor: 'rgba(255,255,255,0.06)',
  labelColor: '#8888aa',
  labelFont: '11px "Noto Sans KR", sans-serif',
  tooltipBg: '#1a1a24',
  tooltipText: '#e8e8f0',
  tooltipBorder: 'rgba(255,255,255,0.1)',
  canvasBg: 'transparent',
} as const;

// Munsell-like hue sectors for radial map (angle ranges in degrees)
export const HUE_SECTORS = [
  { key: '빨강',  label: 'R',  start: 0,   end: 10  },
  { key: '주황',  label: 'YR', start: 11,  end: 40  },
  { key: '노랑',  label: 'Y',  start: 41,  end: 65  },
  { key: '연두',  label: 'GY', start: 66,  end: 80  },
  { key: '초록',  label: 'G',  start: 81,  end: 155 },
  { key: '청록',  label: 'BG', start: 156, end: 185 },
  { key: '파랑',  label: 'B',  start: 186, end: 250 },
  { key: '남색',  label: 'PB', start: 251, end: 270 },
  { key: '보라',  label: 'P',  start: 271, end: 300 },
  { key: '자주',  label: 'RP', start: 301, end: 330 },
  { key: '분홍',  label: 'Pk', start: 331, end: 360 },
] as const;

export type HueSector = typeof HUE_SECTORS[number];
