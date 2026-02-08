import React, { useState } from 'react';
import { Copy, Check, Lock, Unlock, RefreshCw } from 'lucide-react';
import { oklchToHex } from '../utils/colorUtils';
import { generateColorName } from '../utils/colorNames';

export default function PaletteDisplay({ 
  colors, 
  title, 
  format = 'hex', 
  onColorClick, 
  onRegenerate,
  lockedIndices = [],
  onLockToggle
}) {
  const [copiedIndex, setCopiedIndex] = useState(null);

  const formatColor = (color) => {
    switch (format) {
      case 'rgb':
        const hex = oklchToHex(color);
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgb(${r}, ${g}, ${b})`;
      case 'hsl':
        return `hsl(${Math.round(color.h || 0)}, ${Math.round((color.c || 0) * 100)}%, ${Math.round((color.l || 0) * 100)}%)`;
      case 'oklch':
        return `oklch(${(color.l || 0).toFixed(2)} ${(color.c || 0).toFixed(2)} ${Math.round(color.h || 0)})`;
      default:
        return oklchToHex(color);
    }
  };

  const copyToClipboard = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!colors || colors.length === 0) {
    return (
      <div className="p-4 border border-dashed border-[#1a1a24] text-[#55556a] rounded-lg text-center text-xs">
        No colors to display
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs text-[#8888a0] uppercase tracking-wider font-medium">
          {title || 'Palette'}
        </h3>
        {onRegenerate && (
          <button
            onClick={onRegenerate}
            className="p-1.5 rounded-lg hover:bg-[#1a1a24] transition-colors"
            title="Regenerate palette"
          >
            <RefreshCw size={14} className="text-[#55556a]" />
          </button>
        )}
      </div>

      <div className="space-y-2">
        {colors.map((color, index) => {
          const hex = oklchToHex(color);
          const formattedColor = formatColor(color);
          const isLocked = lockedIndices.includes(index);
          const isCopied = copiedIndex === index;
          const name = generateColorName(color);

          return (
            <div 
              key={index}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#1a1a24] transition-colors group"
            >
              {/* Color swatch */}
              <div 
                className="w-10 h-10 rounded-lg shadow-lg cursor-pointer transition-transform hover:scale-105"
                style={{ backgroundColor: hex }}
                onClick={() => onColorClick && onColorClick(color)}
                title="Click to select"
              />

              {/* Color info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-[#f0f0f5]">
                    {formattedColor}
                  </span>
                  <button
                    onClick={() => copyToClipboard(formattedColor, index)}
                    className="p-1 rounded hover:bg-[#252530] transition-colors opacity-0 group-hover:opacity-100"
                    title="Copy to clipboard"
                  >
                    {isCopied ? (
                      <Check size={12} className="text-green-400" />
                    ) : (
                      <Copy size={12} className="text-[#55556a]" />
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-[#55556a] truncate">{name}</p>
              </div>

              {/* Lock toggle */}
              {onLockToggle && (
                <button
                  onClick={() => onLockToggle(index)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isLocked 
                      ? 'bg-[#ff6b4a]/20 text-[#ff6b4a]' 
                      : 'hover:bg-[#1a1a24] text-[#55556a] opacity-0 group-hover:opacity-100'
                  }`}
                  title={isLocked ? 'Unlock color' : 'Lock color'}
                >
                  {isLocked ? <Lock size={14} /> : <Unlock size={14} />}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}