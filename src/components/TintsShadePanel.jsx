import React from 'react';
import { oklchToHex } from '../utils/colorUtils';

export default function TintsShadePanel({ baseColor, onColorSelect }) {
  if (!baseColor) {
    return (
      <div className="p-4 border border-dashed border-[#1a1a24] text-[#55556a] rounded-lg text-center text-xs">
        Select a base color
      </div>
    );
  }

  // Generate tints (lighter versions)
  const tints = Array.from({ length: 5 }, (_, i) => ({
    mode: 'oklch',
    l: Math.min(1, baseColor.l + (1 - baseColor.l) * ((i + 1) / 5)),
    c: baseColor.c * (1 - (i + 1) * 0.15),
    h: baseColor.h || 0
  }));

  // Generate shades (darker versions)
  const shades = Array.from({ length: 5 }, (_, i) => ({
    mode: 'oklch',
    l: Math.max(0, baseColor.l - baseColor.l * ((i + 1) / 5)),
    c: baseColor.c * (1 - (i + 1) * 0.1),
    h: baseColor.h || 0
  }));

  // Generate tones (mixed with gray)
  const tones = Array.from({ length: 5 }, (_, i) => ({
    mode: 'oklch',
    l: baseColor.l,
    c: Math.max(0, baseColor.c - (baseColor.c * ((i + 1) / 5))),
    h: baseColor.h || 0
  }));

  const ColorRow = ({ colors, label }) => (
    <div className="space-y-1.5">
      <h4 className="text-[10px] text-[#55556a] uppercase tracking-wider">{label}</h4>
      <div className="flex gap-1 h-10 rounded-lg overflow-hidden">
        {colors.map((color, i) => {
          const hex = oklchToHex(color);
          return (
            <div
              key={i}
              className="flex-1 cursor-pointer transition-transform hover:scale-105 hover:z-10"
              style={{ backgroundColor: hex }}
              onClick={() => onColorSelect && onColorSelect(color)}
              title={hex}
            />
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <h3 className="text-xs text-[#8888a0] uppercase tracking-wider font-medium">
        Tints & Shades
      </h3>

      {/* Base color indicator */}
      <div className="flex items-center gap-2">
        <div 
          className="w-8 h-8 rounded-lg shadow"
          style={{ backgroundColor: oklchToHex(baseColor) }}
        />
        <div>
          <p className="text-xs text-[#f0f0f5] font-mono">{oklchToHex(baseColor)}</p>
          <p className="text-[10px] text-[#55556a]">Base color</p>
        </div>
      </div>

      <ColorRow colors={tints} label="Tints (lighter)" />
      <ColorRow colors={shades} label="Shades (darker)" />
      <ColorRow colors={tones} label="Tones (desaturated)" />
    </div>
  );
}