import React, { useState } from 'react';
import { Heart, Bookmark } from 'lucide-react';
import { oklchToHex } from '../utils/colorUtils';

// Curated palette collection
const CURATED_PALETTES = [
  {
    id: 'sunset',
    name: 'Sunset Glow',
    category: 'warm',
    colors: [
      { mode: 'oklch', l: 0.6, c: 0.22, h: 25 },
      { mode: 'oklch', l: 0.7, c: 0.18, h: 45 },
      { mode: 'oklch', l: 0.8, c: 0.15, h: 60 },
      { mode: 'oklch', l: 0.5, c: 0.2, h: 350 },
      { mode: 'oklch', l: 0.35, c: 0.12, h: 280 },
    ]
  },
  {
    id: 'ocean',
    name: 'Ocean Depths',
    category: 'cool',
    colors: [
      { mode: 'oklch', l: 0.55, c: 0.15, h: 220 },
      { mode: 'oklch', l: 0.65, c: 0.12, h: 200 },
      { mode: 'oklch', l: 0.75, c: 0.08, h: 190 },
      { mode: 'oklch', l: 0.45, c: 0.18, h: 240 },
      { mode: 'oklch', l: 0.25, c: 0.1, h: 230 },
    ]
  },
  {
    id: 'forest',
    name: 'Forest Walk',
    category: 'nature',
    colors: [
      { mode: 'oklch', l: 0.5, c: 0.14, h: 140 },
      { mode: 'oklch', l: 0.6, c: 0.12, h: 120 },
      { mode: 'oklch', l: 0.4, c: 0.08, h: 80 },
      { mode: 'oklch', l: 0.7, c: 0.06, h: 100 },
      { mode: 'oklch', l: 0.3, c: 0.1, h: 150 },
    ]
  },
  {
    id: 'neon',
    name: 'Neon Nights',
    category: 'vibrant',
    colors: [
      { mode: 'oklch', l: 0.65, c: 0.28, h: 320 },
      { mode: 'oklch', l: 0.7, c: 0.25, h: 280 },
      { mode: 'oklch', l: 0.6, c: 0.22, h: 200 },
      { mode: 'oklch', l: 0.15, c: 0.02, h: 280 },
      { mode: 'oklch', l: 0.75, c: 0.2, h: 340 },
    ]
  },
  {
    id: 'minimal',
    name: 'Minimal Clean',
    category: 'neutral',
    colors: [
      { mode: 'oklch', l: 0.98, c: 0.005, h: 0 },
      { mode: 'oklch', l: 0.85, c: 0.01, h: 0 },
      { mode: 'oklch', l: 0.6, c: 0.02, h: 0 },
      { mode: 'oklch', l: 0.25, c: 0.015, h: 0 },
      { mode: 'oklch', l: 0.55, c: 0.18, h: 220 },
    ]
  },
  {
    id: 'retro',
    name: 'Retro Pop',
    category: 'vibrant',
    colors: [
      { mode: 'oklch', l: 0.65, c: 0.22, h: 45 },
      { mode: 'oklch', l: 0.6, c: 0.2, h: 170 },
      { mode: 'oklch', l: 0.55, c: 0.18, h: 25 },
      { mode: 'oklch', l: 0.9, c: 0.04, h: 90 },
      { mode: 'oklch', l: 0.35, c: 0.08, h: 280 },
    ]
  },
  {
    id: 'elegant',
    name: 'Elegant Dark',
    category: 'neutral',
    colors: [
      { mode: 'oklch', l: 0.12, c: 0.01, h: 260 },
      { mode: 'oklch', l: 0.75, c: 0.15, h: 45 },
      { mode: 'oklch', l: 0.4, c: 0.03, h: 260 },
      { mode: 'oklch', l: 0.95, c: 0.01, h: 45 },
      { mode: 'oklch', l: 0.55, c: 0.12, h: 30 },
    ]
  },
  {
    id: 'spring',
    name: 'Spring Bloom',
    category: 'nature',
    colors: [
      { mode: 'oklch', l: 0.7, c: 0.18, h: 340 },
      { mode: 'oklch', l: 0.65, c: 0.15, h: 130 },
      { mode: 'oklch', l: 0.8, c: 0.12, h: 90 },
      { mode: 'oklch', l: 0.75, c: 0.08, h: 60 },
      { mode: 'oklch', l: 0.6, c: 0.2, h: 300 },
    ]
  },
];

const CATEGORIES = ['all', 'warm', 'cool', 'nature', 'vibrant', 'neutral'];

export default function CuratedPalettes({ baseColor, onSelectPalette }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [savedPalettes, setSavedPalettes] = useState([]);

  const filteredPalettes = activeCategory === 'all' 
    ? CURATED_PALETTES 
    : CURATED_PALETTES.filter(p => p.category === activeCategory);

  const toggleSave = (paletteId) => {
    setSavedPalettes(prev => 
      prev.includes(paletteId) 
        ? prev.filter(id => id !== paletteId)
        : [...prev, paletteId]
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xs text-[#8888a0] uppercase tracking-wider font-medium">
        Curated Palettes
      </h3>

      {/* Category filter */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`
              px-3 py-1.5 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-colors
              ${activeCategory === cat 
                ? 'bg-[#ff6b4a]/20 text-[#ff6b4a]' 
                : 'bg-[#12121a] text-[#8888a0] hover:bg-[#1a1a24]'
              }
            `}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Palette grid */}
      <div className="space-y-3">
        {filteredPalettes.map((palette) => {
          const isSaved = savedPalettes.includes(palette.id);
          
          return (
            <div 
              key={palette.id}
              className="bg-[#12121a] rounded-xl p-3 border border-[#1a1a24] hover:border-[#252530] transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#f0f0f5] font-medium">
                  {palette.name}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => toggleSave(palette.id)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isSaved ? 'text-[#ff6b4a]' : 'text-[#55556a] hover:text-[#8888a0]'
                    }`}
                  >
                    <Heart size={14} className={isSaved ? 'fill-current' : ''} />
                  </button>
                </div>
              </div>
              
              {/* Color swatches */}
              <button
                onClick={() => onSelectPalette(palette.colors)}
                className="w-full flex gap-1 h-12 rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
              >
                {palette.colors.map((color, i) => (
                  <div 
                    key={i}
                    className="flex-1"
                    style={{ backgroundColor: oklchToHex(color) }}
                  />
                ))}
              </button>
              
              <span className="text-[10px] text-[#55556a] capitalize mt-2 block">
                {palette.category}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}