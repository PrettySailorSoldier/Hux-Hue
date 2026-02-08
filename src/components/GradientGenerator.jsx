import React, { useState, useMemo } from 'react';
import { Copy, Check, RotateCcw } from 'lucide-react';
import { oklchToHex } from '../utils/colorUtils';

export default function GradientGenerator({ initialColors, onColorSelect }) {
  const [colors, setColors] = useState(initialColors || []);
  const [gradientType, setGradientType] = useState('linear');
  const [angle, setAngle] = useState(90);
  const [copied, setCopied] = useState(false);

  // Update colors when initialColors change
  React.useEffect(() => {
    if (initialColors?.length > 0) {
      setColors(initialColors);
    }
  }, [initialColors]);

  const gradientCSS = useMemo(() => {
    if (colors.length < 2) return '';
    
    const colorStops = colors.map((c, i) => {
      const hex = oklchToHex(c);
      const percent = (i / (colors.length - 1)) * 100;
      return `${hex} ${percent.toFixed(0)}%`;
    }).join(', ');

    if (gradientType === 'linear') {
      return `linear-gradient(${angle}deg, ${colorStops})`;
    } else if (gradientType === 'radial') {
      return `radial-gradient(circle, ${colorStops})`;
    } else {
      return `conic-gradient(from ${angle}deg, ${colorStops})`;
    }
  }, [colors, gradientType, angle]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(`background: ${gradientCSS};`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!colors || colors.length < 2) {
    return (
      <div className="p-4 border border-dashed border-[#1a1a24] text-[#55556a] rounded-lg text-center text-xs">
        Need at least 2 colors to generate gradient
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xs text-[#8888a0] uppercase tracking-wider font-medium">
        Gradient Generator
      </h3>

      {/* Gradient preview */}
      <div 
        className="h-32 rounded-xl shadow-lg"
        style={{ background: gradientCSS }}
      />

      {/* Controls */}
      <div className="flex gap-2">
        {['linear', 'radial', 'conic'].map((type) => (
          <button
            key={type}
            onClick={() => setGradientType(type)}
            className={`
              flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-colors capitalize
              ${gradientType === type 
                ? 'bg-[#ff6b4a]/20 text-[#ff6b4a]' 
                : 'bg-[#12121a] text-[#8888a0] hover:bg-[#1a1a24]'
              }
            `}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Angle slider */}
      {(gradientType === 'linear' || gradientType === 'conic') && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs text-[#8888a0]">Angle</label>
            <span className="text-xs text-[#55556a] font-mono">{angle}°</span>
          </div>
          <input
            type="range"
            min="0"
            max="360"
            value={angle}
            onChange={(e) => setAngle(parseInt(e.target.value))}
            className="w-full"
          />
        </div>
      )}

      {/* Color stops */}
      <div className="flex gap-1.5">
        {colors.map((color, i) => (
          <button
            key={i}
            onClick={() => onColorSelect && onColorSelect(color)}
            className="flex-1 h-8 rounded-lg transition-transform hover:scale-105"
            style={{ backgroundColor: oklchToHex(color) }}
            title={oklchToHex(color)}
          />
        ))}
      </div>

      {/* CSS output */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs text-[#8888a0]">CSS</label>
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-1 p-1.5 rounded-lg hover:bg-[#1a1a24] text-[#55556a] transition-colors"
          >
            {copied ? (
              <>
                <Check size={12} className="text-green-400" />
                <span className="text-[10px] text-green-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy size={12} />
                <span className="text-[10px]">Copy</span>
              </>
            )}
          </button>
        </div>
        <div className="bg-[#0a0a0f] border border-[#1a1a24] rounded-lg p-3">
          <code className="text-[11px] text-[#f0f0f5] font-mono break-all">
            background: {gradientCSS};
          </code>
        </div>
      </div>
    </div>
  );
}