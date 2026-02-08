import React, { useState, useCallback } from 'react';
import { Shuffle, Sparkles } from 'lucide-react';
import { oklchToHex, getTriadic, getAnalogous, getComplementary } from '../utils/colorUtils';

const HARMONY_WEIGHTS = [
  { id: 'triadic', name: 'Triadic', weight: 0 },
  { id: 'analogous', name: 'Analogous', weight: 0 },
  { id: 'complementary', name: 'Complementary', weight: 0 },
];

export default function HarmonyMixer({ baseColor, onPaletteGenerate }) {
  const [weights, setWeights] = useState(
    HARMONY_WEIGHTS.reduce((acc, h) => ({ ...acc, [h.id]: 33 }), {})
  );

  const generateMixedPalette = useCallback(() => {
    if (!baseColor) return;

    const triadic = getTriadic(baseColor);
    const analogous = getAnalogous(baseColor, 5, 30);
    const complementary = getComplementary(baseColor);

    // Mix colors based on weights
    const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
    const normalized = {
      triadic: weights.triadic / totalWeight,
      analogous: weights.analogous / totalWeight,
      complementary: weights.complementary / totalWeight,
    };

    // Create mixed palette by blending
    const mixedPalette = [];
    
    // Always include base color
    mixedPalette.push(baseColor);

    // Add weighted contributions from each harmony
    if (normalized.triadic > 0.2 && triadic.length > 1) {
      mixedPalette.push(triadic[1]);
    }
    if (normalized.analogous > 0.2 && analogous.length > 2) {
      mixedPalette.push(analogous[2]);
    }
    if (normalized.complementary > 0.2 && complementary.length > 1) {
      mixedPalette.push(complementary[1]);
    }
    if (normalized.triadic > 0.3 && triadic.length > 2) {
      mixedPalette.push(triadic[2]);
    }
    if (normalized.analogous > 0.3 && analogous.length > 3) {
      mixedPalette.push(analogous[3]);
    }

    // Ensure at least 4 colors
    while (mixedPalette.length < 4 && analogous.length > mixedPalette.length) {
      mixedPalette.push(analogous[mixedPalette.length]);
    }

    onPaletteGenerate(mixedPalette.slice(0, 6));
  }, [baseColor, weights, onPaletteGenerate]);

  const randomizeWeights = useCallback(() => {
    const newWeights = {};
    HARMONY_WEIGHTS.forEach(h => {
      newWeights[h.id] = Math.floor(Math.random() * 100);
    });
    setWeights(newWeights);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs text-[#8888a0] uppercase tracking-wider font-medium">
          Harmony Mixer
        </h3>
        <button
          onClick={randomizeWeights}
          className="p-1.5 rounded-lg hover:bg-[#1a1a24] transition-colors"
          title="Randomize"
        >
          <Shuffle size={14} className="text-[#55556a]" />
        </button>
      </div>

      {/* Weight sliders */}
      <div className="space-y-3">
        {HARMONY_WEIGHTS.map(({ id, name }) => (
          <div key={id} className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs text-[#8888a0]">{name}</label>
              <span className="text-xs text-[#55556a] font-mono">{weights[id]}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={weights[id]}
              onChange={(e) => setWeights(prev => ({ ...prev, [id]: parseInt(e.target.value) }))}
              className="w-full"
            />
          </div>
        ))}
      </div>

      {/* Generate button */}
      <button
        onClick={generateMixedPalette}
        className="w-full flex items-center justify-center gap-2 py-3 bg-[#ff6b4a] hover:bg-[#ff6b4a]/80 rounded-xl transition-colors"
      >
        <Sparkles size={16} />
        <span className="text-sm font-medium">Generate Mixed Palette</span>
      </button>

      {/* Visual weight representation */}
      <div className="flex gap-0.5 h-3 rounded overflow-hidden">
        <div 
          className="transition-all"
          style={{ 
            flex: weights.triadic, 
            backgroundColor: oklchToHex({ ...baseColor, h: ((baseColor?.h || 0) + 120) % 360 })
          }}
        />
        <div 
          className="transition-all"
          style={{ 
            flex: weights.analogous, 
            backgroundColor: oklchToHex({ ...baseColor, h: ((baseColor?.h || 0) + 30) % 360 })
          }}
        />
        <div 
          className="transition-all"
          style={{ 
            flex: weights.complementary, 
            backgroundColor: oklchToHex({ ...baseColor, h: ((baseColor?.h || 0) + 180) % 360 })
          }}
        />
      </div>
    </div>
  );
}