import React, { useMemo } from 'react';
import { formatHex, oklch } from 'culori';

const ColorSliders = ({ color, onChange }) => {
  // Safely extract OKLCH values with defaults
  const l = color?.l ?? 0.65;
  const c = color?.c ?? 0.18;
  const h = color?.h ?? 0;

  // Generate gradient backgrounds for sliders
  const lightnessGradient = useMemo(() => {
    const stops = [];
    for (let i = 0; i <= 10; i++) {
      const lightness = i / 10;
      const col = oklch({ l: lightness, c: c, h: h });
      try {
        const hex = formatHex(col) || '#888';
        stops.push(hex);
      } catch {
        stops.push('#888');
      }
    }
    return `linear-gradient(to right, ${stops.join(', ')})`;
  }, [c, h]);

  const chromaGradient = useMemo(() => {
    const stops = [];
    for (let i = 0; i <= 10; i++) {
      const chroma = (i / 10) * 0.4; // Max chroma ~0.4
      const col = oklch({ l: l, c: chroma, h: h });
      try {
        const hex = formatHex(col) || '#888';
        stops.push(hex);
      } catch {
        stops.push('#888');
      }
    }
    return `linear-gradient(to right, ${stops.join(', ')})`;
  }, [l, h]);

  const hueGradient = useMemo(() => {
    const stops = [];
    for (let i = 0; i <= 12; i++) {
      const hue = (i / 12) * 360;
      const col = oklch({ l: l, c: Math.max(c, 0.15), h: hue });
      try {
        const hex = formatHex(col) || '#888';
        stops.push(hex);
      } catch {
        stops.push('#888');
      }
    }
    return `linear-gradient(to right, ${stops.join(', ')})`;
  }, [l, c]);

  const handleChange = (property, value) => {
    if (onChange) {
      onChange({
        mode: 'oklch',
        l: property === 'l' ? value : l,
        c: property === 'c' ? value : c,
        h: property === 'h' ? value : h,
      });
    }
  };

  const sliderStyle = (gradient, position) => ({
    background: gradient,
    WebkitAppearance: 'none',
    appearance: 'none',
    height: '12px',
    borderRadius: '6px',
    outline: 'none',
    cursor: 'pointer',
  });

  return (
    <div className="space-y-4">
      {/* Lightness Slider */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs text-[#8888a0] font-medium uppercase tracking-wider">
            Lightness
          </label>
          <input
            type="number"
            value={Math.round(l * 100)}
            onChange={(e) => handleChange('l', Math.max(0, Math.min(100, parseInt(e.target.value) || 0)) / 100)}
            className="w-14 bg-[#0a0a0f] border border-[#1a1a24] rounded px-2 py-0.5 text-xs text-right font-mono text-[#f0f0f5] focus:outline-none focus:border-[#ff6b4a]/50"
            min="0"
            max="100"
          />
        </div>
        <div className="relative">
          <input
            type="range"
            min="0"
            max="100"
            value={Math.round(l * 100)}
            onChange={(e) => handleChange('l', parseInt(e.target.value) / 100)}
            className="w-full slider-thumb"
            style={sliderStyle(lightnessGradient)}
          />
        </div>
      </div>

      {/* Chroma (Saturation) Slider */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs text-[#8888a0] font-medium uppercase tracking-wider">
            Chroma
          </label>
          <input
            type="number"
            value={Math.round(c * 100)}
            onChange={(e) => handleChange('c', Math.max(0, Math.min(40, parseInt(e.target.value) || 0)) / 100)}
            className="w-14 bg-[#0a0a0f] border border-[#1a1a24] rounded px-2 py-0.5 text-xs text-right font-mono text-[#f0f0f5] focus:outline-none focus:border-[#ff6b4a]/50"
            min="0"
            max="40"
          />
        </div>
        <div className="relative">
          <input
            type="range"
            min="0"
            max="40"
            value={Math.round(c * 100)}
            onChange={(e) => handleChange('c', parseInt(e.target.value) / 100)}
            className="w-full slider-thumb"
            style={sliderStyle(chromaGradient)}
          />
        </div>
      </div>

      {/* Hue Slider */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs text-[#8888a0] font-medium uppercase tracking-wider">
            Hue
          </label>
          <input
            type="number"
            value={Math.round(h)}
            onChange={(e) => handleChange('h', Math.max(0, Math.min(360, parseInt(e.target.value) || 0)))}
            className="w-14 bg-[#0a0a0f] border border-[#1a1a24] rounded px-2 py-0.5 text-xs text-right font-mono text-[#f0f0f5] focus:outline-none focus:border-[#ff6b4a]/50"
            min="0"
            max="360"
          />
        </div>
        <div className="relative">
          <input
            type="range"
            min="0"
            max="360"
            value={Math.round(h)}
            onChange={(e) => handleChange('h', parseInt(e.target.value))}
            className="w-full slider-thumb"
            style={sliderStyle(hueGradient)}
          />
        </div>
      </div>

      {/* Custom slider thumb styles */}
      <style>{`
        .slider-thumb::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: white;
          border: 2px solid rgba(0, 0, 0, 0.3);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
          cursor: pointer;
          margin-top: -3px;
        }
        
        .slider-thumb::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: white;
          border: 2px solid rgba(0, 0, 0, 0.3);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
          cursor: pointer;
        }
        
        .slider-thumb::-webkit-slider-thumb:hover {
          transform: scale(1.1);
        }
        
        .slider-thumb::-webkit-slider-thumb:active {
          transform: scale(0.95);
        }
      `}</style>
    </div>
  );
};

export default ColorSliders;