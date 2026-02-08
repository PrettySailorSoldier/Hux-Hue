import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { oklchToHex, wcagContrast } from '../utils/colorUtils';
import { generateColorName } from '../utils/colorNames';

export default function ColorInfoPanel({ color }) {
  const [copiedFormat, setCopiedFormat] = useState(null);

  if (!color) {
    return (
      <div className="text-center text-[#55556a] py-4">
        <p className="text-sm">Select a color to view details</p>
      </div>
    );
  }

  const hex = oklchToHex(color);
  const name = generateColorName(color);
  
  // Calculate RGB
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  // Calculate contrast ratios
  const contrastWithWhite = wcagContrast(color, { mode: 'oklch', l: 1, c: 0, h: 0 });
  const contrastWithBlack = wcagContrast(color, { mode: 'oklch', l: 0, c: 0, h: 0 });

  const formats = [
    { label: 'HEX', value: hex },
    { label: 'RGB', value: `rgb(${r}, ${g}, ${b})` },
    { label: 'HSL', value: `hsl(${Math.round(color.h || 0)}, ${Math.round((color.c || 0) * 100)}%, ${Math.round((color.l || 0) * 100)}%)` },
    { label: 'OKLCH', value: `oklch(${(color.l || 0).toFixed(2)} ${(color.c || 0).toFixed(3)} ${Math.round(color.h || 0)})` },
  ];

  const copyToClipboard = async (text, format) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedFormat(format);
      setTimeout(() => setCopiedFormat(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getContrastLabel = (ratio) => {
    if (ratio >= 7) return { text: 'AAA', color: '#4ade80' };
    if (ratio >= 4.5) return { text: 'AA', color: '#fbbf24' };
    if (ratio >= 3) return { text: 'AA Large', color: '#f97316' };
    return { text: 'Fail', color: '#f87171' };
  };

  const whiteContrast = getContrastLabel(contrastWithWhite);
  const blackContrast = getContrastLabel(contrastWithBlack);

  return (
    <div className="space-y-4">
      <h3 className="text-xs text-[#8888a0] uppercase tracking-wider font-medium">
        Color Details
      </h3>

      {/* Color preview + name */}
      <div className="flex items-center gap-3">
        <div 
          className="w-12 h-12 rounded-xl shadow-lg"
          style={{ backgroundColor: hex }}
        />
        <div>
          <p className="text-sm font-medium text-[#f0f0f5]">{name}</p>
          <p className="text-xs text-[#55556a] font-mono">{hex}</p>
        </div>
      </div>

      {/* Color formats */}
      <div className="space-y-2">
        {formats.map(({ label, value }) => (
          <div 
            key={label}
            className="flex items-center justify-between p-2 bg-[#0a0a0f] rounded-lg border border-[#1a1a24] group"
          >
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#55556a] uppercase w-10">{label}</span>
              <span className="text-xs font-mono text-[#f0f0f5]">{value}</span>
            </div>
            <button
              onClick={() => copyToClipboard(value, label)}
              className="p-1 rounded hover:bg-[#1a1a24] transition-colors opacity-0 group-hover:opacity-100"
            >
              {copiedFormat === label ? (
                <Check size={12} className="text-green-400" />
              ) : (
                <Copy size={12} className="text-[#55556a]" />
              )}
            </button>
          </div>
        ))}
      </div>

      {/* WCAG Contrast */}
      <div className="space-y-2">
        <h4 className="text-[10px] text-[#55556a] uppercase tracking-wider">
          WCAG Contrast
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 bg-white rounded-lg text-center">
            <div 
              className="text-lg font-bold" 
              style={{ color: hex }}
            >
              Aa
            </div>
            <div className="flex items-center justify-center gap-1 mt-1">
              <span className="text-[10px] text-gray-600">{contrastWithWhite.toFixed(1)}:1</span>
              <span 
                className="text-[9px] px-1 rounded font-medium"
                style={{ backgroundColor: whiteContrast.color, color: 'black' }}
              >
                {whiteContrast.text}
              </span>
            </div>
          </div>
          <div className="p-2 bg-black rounded-lg text-center">
            <div 
              className="text-lg font-bold" 
              style={{ color: hex }}
            >
              Aa
            </div>
            <div className="flex items-center justify-center gap-1 mt-1">
              <span className="text-[10px] text-gray-400">{contrastWithBlack.toFixed(1)}:1</span>
              <span 
                className="text-[9px] px-1 rounded font-medium"
                style={{ backgroundColor: blackContrast.color, color: 'black' }}
              >
                {blackContrast.text}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}