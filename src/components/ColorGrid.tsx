import { useState, useMemo } from 'react';
import type { ColorInfo } from '../types';
import { ALL_COLORS, COLOR_FAMILIES, filterByFamily, getHueCountForFamily, HUE_COUNT } from '../utils/colors';

interface Props {
  onSelect: (color: ColorInfo) => void;
  selectedId?: number;
}

export default function ColorGrid({ onSelect, selectedId }: Props) {
  const [family, setFamily] = useState('전체');

  const colors = useMemo(() => filterByFamily(family), [family]);
  const hueCount = useMemo(() => getHueCountForFamily(family), [family]);

  return (
    <div>
      <div className="filter-bar">
        <button
          className={`filter-chip ${family === '전체' ? 'active' : ''}`}
          onClick={() => setFamily('전체')}
        >
          전체 ({ALL_COLORS.length})
        </button>
        {COLOR_FAMILIES.map((f) => (
          <button
            key={f}
            className={`filter-chip ${family === f ? 'active' : ''}`}
            onClick={() => setFamily(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <div
        className="color-grid"
        style={{ '--hue-count': hueCount } as React.CSSProperties}
      >
        {colors.map((color) => (
          <div
            key={color.id}
            className={`color-cell ${selectedId === color.id ? 'selected' : ''}`}
            style={{ backgroundColor: color.hsl }}
            onClick={() => onSelect(color)}
            title={color.name}
          />
        ))}
      </div>
    </div>
  );
}
