import type { ColorInfo } from '../types';

const COLOR_FAMILY_NAMES: Record<string, [number, number]> = {
  '빨강': [0, 10],
  '주황': [11, 40],
  '노랑': [41, 65],
  '연두': [66, 80],
  '초록': [81, 155],
  '청록': [156, 185],
  '파랑': [186, 250],
  '남색': [251, 270],
  '보라': [271, 300],
  '자주': [301, 330],
  '분홍': [331, 350],
};

function getColorFamilyName(hue: number): string {
  for (const [name, [min, max]] of Object.entries(COLOR_FAMILY_NAMES)) {
    if (hue >= min && hue <= max) return name;
  }
  return '빨강';
}

function getLightnessDesc(l: number): string {
  if (l <= 20) return '아주 어두운';
  if (l <= 35) return '어두운';
  if (l <= 50) return '';
  if (l <= 65) return '밝은';
  return '아주 밝은';
}

function getSaturationDesc(s: number): string {
  if (s <= 25) return '회색빛';
  if (s <= 50) return '흐린';
  if (s <= 75) return '';
  return '선명한';
}

// HSV → HSL conversion
export function hsvToHsl(h: number, s: number, v: number): { h: number; s: number; l: number } {
  const sNorm = s / 100;
  const vNorm = v / 100;
  const l = vNorm * (1 - sNorm / 2);
  let sl = 0;
  if (l > 0 && l < 1) {
    sl = (vNorm - l) / Math.min(l, 1 - l);
  }
  return { h, s: Math.round(sl * 100), l: Math.round(l * 100) };
}

function hslToHex(h: number, s: number, l: number): string {
  const sNorm = s / 100;
  const lNorm = l / 100;
  const a = sNorm * Math.min(lNorm, 1 - lNorm);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = lNorm - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

// Create a ColorInfo from HSV values (what the picker uses)
export function createColorFromHSV(h: number, s: number, v: number): ColorInfo {
  const hsl = hsvToHsl(h, s, v);
  const family = getColorFamilyName(h);
  const lDesc = getLightnessDesc(hsl.l);
  const sDesc = getSaturationDesc(hsl.s);
  const name = [lDesc, sDesc, family].filter(Boolean).join(' ');

  return {
    hex: hslToHex(hsl.h, hsl.s, hsl.l),
    hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
    hue: h,
    saturation: hsl.s,
    lightness: hsl.l,
    name,
    emotionGroup: family,
  };
}

export const COLOR_FAMILIES = Object.keys(COLOR_FAMILY_NAMES);

