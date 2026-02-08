import React, { useState, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { parse } from 'culori';
import { toOklch, oklchToHex } from '../utils/colorUtils';

// Common color name mappings
const COLOR_NAMES = {
  red: '#ff0000',
  crimson: '#dc143c',
  coral: '#ff7f50',
  salmon: '#fa8072',
  orange: '#ffa500',
  gold: '#ffd700',
  yellow: '#ffff00',
  lime: '#00ff00',
  green: '#008000',
  emerald: '#50c878',
  teal: '#008080',
  cyan: '#00ffff',
  aqua: '#00ffff',
  sky: '#87ceeb',
  blue: '#0000ff',
  navy: '#000080',
  indigo: '#4b0082',
  purple: '#800080',
  violet: '#ee82ee',
  magenta: '#ff00ff',
  pink: '#ffc0cb',
  rose: '#ff007f',
  brown: '#8b4513',
  chocolate: '#d2691e',
  tan: '#d2b48c',
  beige: '#f5f5dc',
  ivory: '#fffff0',
  white: '#ffffff',
  silver: '#c0c0c0',
  gray: '#808080',
  grey: '#808080',
  charcoal: '#36454f',
  black: '#000000',
};

export default function ColorSearch({ onColorSelect }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState(null);

  const handleInputChange = useCallback((e) => {
    const value = e.target.value;
    setQuery(value);
    setError(null);

    if (value.length === 0) {
      setSuggestions([]);
      return;
    }

    // Search color names
    const matches = Object.entries(COLOR_NAMES)
      .filter(([name]) => name.toLowerCase().includes(value.toLowerCase()))
      .slice(0, 6)
      .map(([name, hex]) => ({ name, hex }));

    setSuggestions(matches);
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    
    if (!query.trim()) return;

    // Check if it's a color name
    const lowerQuery = query.toLowerCase().trim();
    if (COLOR_NAMES[lowerQuery]) {
      const parsed = parse(COLOR_NAMES[lowerQuery]);
      if (parsed) {
        const oklch = toOklch(parsed);
        onColorSelect(oklch);
        setQuery('');
        setSuggestions([]);
        return;
      }
    }

    // Try parsing as hex/rgb/hsl
    try {
      const parsed = parse(query.trim());
      if (parsed) {
        const oklch = toOklch(parsed);
        onColorSelect(oklch);
        setQuery('');
        setSuggestions([]);
        setError(null);
      } else {
        setError('Could not parse color');
      }
    } catch (err) {
      setError('Invalid color format');
    }
  }, [query, onColorSelect]);

  const handleSuggestionClick = useCallback((hex) => {
    const parsed = parse(hex);
    if (parsed) {
      const oklch = toOklch(parsed);
      onColorSelect(oklch);
      setQuery('');
      setSuggestions([]);
    }
  }, [onColorSelect]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setSuggestions([]);
    setError(null);
  }, []);

  return (
    <div className="space-y-2">
      <h3 className="text-xs text-[#8888a0] uppercase tracking-wider font-medium">
        Search Color
      </h3>

      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#55556a]" />
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Name, hex, rgb, hsl..."
            className="w-full bg-[#0a0a0f] border border-[#1a1a24] rounded-lg pl-9 pr-8 py-2 text-sm text-[#f0f0f5] placeholder-[#55556a] focus:outline-none focus:border-[#ff6b4a]/50"
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#55556a] hover:text-[#8888a0]"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {error && (
          <p className="text-xs text-red-400 mt-1">{error}</p>
        )}
      </form>

      {/* Suggestions dropdown */}
      {suggestions.length > 0 && (
        <div className="bg-[#12121a] border border-[#1a1a24] rounded-lg overflow-hidden">
          {suggestions.map(({ name, hex }) => (
            <button
              key={name}
              onClick={() => handleSuggestionClick(hex)}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[#1a1a24] transition-colors text-left"
            >
              <div 
                className="w-6 h-6 rounded shadow"
                style={{ backgroundColor: hex }}
              />
              <span className="text-sm text-[#f0f0f5] capitalize">{name}</span>
              <span className="text-xs text-[#55556a] font-mono ml-auto">{hex}</span>
            </button>
          ))}
        </div>
      )}

      {/* Quick picks */}
      <div className="flex flex-wrap gap-1.5 pt-2">
        {['#ff6b4a', '#4ade80', '#3b82f6', '#a855f7', '#f59e0b'].map((hex) => (
          <button
            key={hex}
            onClick={() => handleSuggestionClick(hex)}
            className="w-7 h-7 rounded-lg shadow transition-transform hover:scale-110"
            style={{ backgroundColor: hex }}
            title={hex}
          />
        ))}
      </div>
    </div>
  );
}