import React, { useState, useMemo, useEffect } from 'react';
import { Copy, Check, RotateCcw, Sparkles, Sliders, Wand2 } from 'lucide-react';
import { oklchToHex } from '../utils/colorUtils';
import {
  generateVibeGradient,
  optimizeForGradient,
  getGradientStyles,
  generateStylePreview,
  stopsToCSS,
  generateFullCSS
} from '../utils/gradientEngine';
import { analyzeColorMood } from '../utils/vibeHarmony';

// ============================================================================
// STYLE SELECTOR — Live preview swatches for each gradient style
// ============================================================================

function StyleSelector({ baseColor, selectedStyle, onStyleSelect }) {
  const styles = getGradientStyles();

  return (
    <div className="space-y-2">
      <label className="text-xs text-[#8888a0] uppercase tracking-wider font-medium">
        Gradient Style
      </label>
      <div className="grid grid-cols-4 gap-2">
        {styles.map((style) => {
          const isSelected = selectedStyle === style.id;
          const previewCSS = baseColor
            ? generateStylePreview(baseColor, style.id)
            : 'linear-gradient(90deg, #333, #666)';

          return (
            <button
              key={style.id}
              onClick={() => onStyleSelect(style.id)}
              className={`
                relative p-1.5 rounded-lg border transition-all
                ${isSelected
                  ? 'border-[#ff6b4a] ring-1 ring-[#ff6b4a]/30'
                  : 'border-[#1a1a24] hover:border-[#252530]'
                }
                ${style.isSignature ? 'col-span-2' : ''}
              `}
            >
              {/* Live preview swatch */}
              <div
                className="h-5 rounded-md mb-1.5"
                style={{ background: previewCSS }}
              />
              <div className="text-left">
                <p className={`text-[10px] font-medium leading-tight ${
                  isSelected ? 'text-[#ff6b4a]' : 'text-[#f0f0f5]'
                }`}>
                  {style.name}
                  {style.isSignature && (
                    <span className="ml-1 text-[8px] px-1 py-0.5 bg-[#ff6b4a]/20 text-[#ff6b4a] rounded">
                      signature
                    </span>
                  )}
                </p>
                <p className="text-[9px] text-[#55556a] leading-tight">{style.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// HUE PATH SELECTOR — Control warm vs cool arc
// ============================================================================

function HuePathSelector({ selectedPath, onPathSelect }) {
  const paths = [
    { id: 'auto', label: 'Auto', description: 'Best for style' },
    { id: 'short', label: 'Short', description: 'Direct path' },
    { id: 'long', label: 'Long', description: 'Scenic route' },
    { id: 'warm', label: 'Warm', description: 'Through reds' },
    { id: 'cool', label: 'Cool', description: 'Through blues' }
  ];

  return (
    <div className="space-y-2">
      <label className="text-xs text-[#8888a0] uppercase tracking-wider font-medium">
        Hue Path
      </label>
      <div className="flex gap-1.5">
        {paths.map((path) => (
          <button
            key={path.id}
            onClick={() => onPathSelect(path.id)}
            className={`
              flex-1 py-1.5 px-2 rounded-lg text-center transition-colors
              ${selectedPath === path.id
                ? 'bg-[#ff6b4a]/20 text-[#ff6b4a]'
                : 'bg-[#12121a] text-[#8888a0] hover:bg-[#1a1a24]'
              }
            `}
            title={path.description}
          >
            <span className="text-[10px] font-medium">{path.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// STOPS SLIDER — Control number of key colors
// ============================================================================

function StopsSlider({ stops, onStopsChange }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs text-[#8888a0] uppercase tracking-wider font-medium">
          Key Colors
        </label>
        <span className="text-xs font-mono text-[#55556a]">{stops}</span>
      </div>
      <input
        type="range"
        min="2"
        max="5"
        value={stops}
        onChange={(e) => onStopsChange(parseInt(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-[#1a1a24]"
        style={{
          background: `linear-gradient(to right, #ff6b4a ${((stops - 2) / 3) * 100}%, #1a1a24 ${((stops - 2) / 3) * 100}%)`
        }}
      />
    </div>
  );
}

// ============================================================================
// MOOD INDICATOR — Show what the engine detected
// ============================================================================

function MoodIndicator({ mood, energy, temperature }) {
  if (!mood) return null;

  return (
    <div className="flex items-center gap-2 text-[10px]">
      <span className="text-[#55556a]">Your color reads as:</span>
      <span className="px-2 py-0.5 rounded bg-[#ff6b4a]/10 text-[#ff6b4a] font-medium capitalize">
        {mood}
      </span>
      <span className="px-1.5 py-0.5 rounded bg-[#1a1a24] text-[#8888a0] capitalize">
        {energy}
      </span>
      <span className="px-1.5 py-0.5 rounded bg-[#1a1a24] text-[#8888a0] capitalize">
        {temperature}
      </span>
    </div>
  );
}

// ============================================================================
// COLOR STOPS DISPLAY — Show clickable swatches
// ============================================================================

function ColorStopsDisplay({ stops, onColorSelect }) {
  return (
    <div className="space-y-2">
      <label className="text-xs text-[#8888a0] uppercase tracking-wider font-medium">
        Color Stops
      </label>
      <div className="flex gap-1.5">
        {stops.map((color, i) => (
          <button
            key={i}
            onClick={() => onColorSelect && onColorSelect(color)}
            className="flex-1 h-8 rounded-lg transition-transform hover:scale-105 shadow-sm"
            style={{ backgroundColor: oklchToHex(color) }}
            title={`${oklchToHex(color)} — L:${(color.l * 100).toFixed(0)} C:${(color.c * 100).toFixed(0)} H:${Math.round(color.h ?? 0)}°`}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function GradientGenerator({ initialColors, baseColor, onColorSelect }) {
  // Mode: 'vibe' (intelligent) or 'custom' (manual)
  const [mode, setMode] = useState('vibe');

  // Custom mode state (existing functionality)
  const [customColors, setCustomColors] = useState(initialColors || []);
  const [gradientType, setGradientType] = useState('linear');
  const [angle, setAngle] = useState(135);
  const [copied, setCopied] = useState(false);

  // Vibe mode state
  const [vibeStyle, setVibeStyle] = useState('chromatic-arc');
  const [huePath, setHuePath] = useState('auto');
  const [stops, setStops] = useState(3);
  const [vibeResult, setVibeResult] = useState(null);
  const [regenerateKey, setRegenerateKey] = useState(0);

  // Update custom colors when initialColors change
  useEffect(() => {
    if (initialColors?.length > 0) {
      setCustomColors(initialColors);
    }
  }, [initialColors]);

  // Generate vibe gradient when settings change
  useEffect(() => {
    if (mode === 'vibe' && baseColor) {
      const result = generateVibeGradient(baseColor, {
        style: vibeStyle,
        stops,
        huePath
      });
      setVibeResult(result);
    }
  }, [mode, baseColor, vibeStyle, stops, huePath, regenerateKey]);

  // Determine which colors to use for gradient
  const gradientColors = useMemo(() => {
    if (mode === 'vibe' && vibeResult) {
      return vibeResult.stops;
    }
    // Custom mode: optimize existing colors for gradient use
    if (customColors.length >= 2) {
      return optimizeForGradient(customColors, { boostChroma: true });
    }
    return [];
  }, [mode, vibeResult, customColors]);

  // Generate gradient CSS
  const gradientCSS = useMemo(() => {
    if (gradientColors.length < 2) return '';

    // Use oklch interpolation for modern browsers
    return stopsToCSS(gradientColors, angle, gradientType);
  }, [gradientColors, gradientType, angle]);

  // Hex fallback CSS
  const hexFallbackCSS = useMemo(() => {
    if (gradientColors.length < 2) return '';

    const colorStops = gradientColors.map((c, i) => {
      const hex = oklchToHex(c);
      const percent = (i / (gradientColors.length - 1)) * 100;
      return `${hex} ${percent.toFixed(0)}%`;
    }).join(', ');

    if (gradientType === 'linear') {
      return `linear-gradient(${angle}deg, ${colorStops})`;
    } else if (gradientType === 'radial') {
      return `radial-gradient(circle, ${colorStops})`;
    } else {
      return `conic-gradient(from ${angle}deg, ${colorStops})`;
    }
  }, [gradientColors, gradientType, angle]);

  const fullCSS = useMemo(() => {
    if (!gradientCSS || !hexFallbackCSS) return '';
    return `/* hex fallback */\nbackground: ${hexFallbackCSS};\n/* oklch — better color interpolation in modern browsers */\nbackground: ${gradientCSS};`;
  }, [gradientCSS, hexFallbackCSS]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(fullCSS);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleRegenerate = () => {
    setRegenerateKey(k => k + 1);
  };

  // Render empty state
  if (mode === 'custom' && (!customColors || customColors.length < 2)) {
    return (
      <div className="space-y-4">
        {/* Mode toggle */}
        <div className="flex gap-1 bg-[#0a0a0f] p-1 rounded-lg">
          <button
            onClick={() => setMode('vibe')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-colors ${
              mode === 'vibe'
                ? 'bg-[#ff6b4a]/20 text-[#ff6b4a]'
                : 'text-[#55556a] hover:text-[#8888a0]'
            }`}
          >
            <Wand2 size={12} />
            Vibe
          </button>
          <button
            onClick={() => setMode('custom')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-colors ${
              mode === 'custom'
                ? 'bg-[#ff6b4a]/20 text-[#ff6b4a]'
                : 'text-[#55556a] hover:text-[#8888a0]'
            }`}
          >
            <Sliders size={12} />
            Custom
          </button>
        </div>

        <div className="p-4 border border-dashed border-[#1a1a24] text-[#55556a] rounded-xl text-center text-xs">
          <p>Need at least 2 colors to generate custom gradient</p>
          <p className="mt-1 text-[#8888a0]">Try Vibe mode instead — it generates colors for you!</p>
        </div>
      </div>
    );
  }

  if (mode === 'vibe' && !baseColor) {
    return (
      <div className="space-y-4">
        {/* Mode toggle */}
        <div className="flex gap-1 bg-[#0a0a0f] p-1 rounded-lg">
          <button
            onClick={() => setMode('vibe')}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium bg-[#ff6b4a]/20 text-[#ff6b4a]"
          >
            <Wand2 size={12} />
            Vibe
          </button>
          <button
            onClick={() => setMode('custom')}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium text-[#55556a] hover:text-[#8888a0]"
          >
            <Sliders size={12} />
            Custom
          </button>
        </div>

        <div className="p-4 border border-dashed border-[#1a1a24] text-[#55556a] rounded-xl text-center text-xs">
          <Sparkles size={20} className="mx-auto mb-2 opacity-50" />
          <p>Select a color from the wheel to generate vibe gradients</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="flex gap-1 bg-[#0a0a0f] p-1 rounded-lg">
        <button
          onClick={() => setMode('vibe')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-colors ${
            mode === 'vibe'
              ? 'bg-[#ff6b4a]/20 text-[#ff6b4a]'
              : 'text-[#55556a] hover:text-[#8888a0]'
          }`}
        >
          <Wand2 size={12} />
          Vibe
        </button>
        <button
          onClick={() => setMode('custom')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-colors ${
            mode === 'custom'
              ? 'bg-[#ff6b4a]/20 text-[#ff6b4a]'
              : 'text-[#55556a] hover:text-[#8888a0]'
          }`}
        >
          <Sliders size={12} />
          Custom
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* VIBE MODE */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {mode === 'vibe' && vibeResult && (
        <>
          {/* Mood indicator */}
          <MoodIndicator
            mood={vibeResult.mood}
            energy={vibeResult.energy}
            temperature={vibeResult.temperature}
          />

          {/* Style selector with live previews */}
          <StyleSelector
            baseColor={baseColor}
            selectedStyle={vibeStyle}
            onStyleSelect={setVibeStyle}
          />

          {/* Hue path control */}
          <HuePathSelector
            selectedPath={huePath}
            onPathSelect={setHuePath}
          />

          {/* Stops slider */}
          <StopsSlider
            stops={stops}
            onStopsChange={setStops}
          />

          {/* Regenerate button */}
          <button
            onClick={handleRegenerate}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#12121a] hover:bg-[#1a1a24] border border-[#1a1a24] rounded-xl text-xs text-[#8888a0] transition-colors"
          >
            <RotateCcw size={12} />
            Regenerate
          </button>

          {/* Gradient preview */}
          <div
            className="h-40 rounded-xl shadow-lg"
            style={{ background: hexFallbackCSS }}
          />

          {/* Description */}
          <p className="text-[10px] text-[#55556a] leading-relaxed">
            {vibeResult.description}
          </p>

          {/* Color stops */}
          <ColorStopsDisplay
            stops={vibeResult.keyStops}
            onColorSelect={onColorSelect}
          />
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* CUSTOM MODE */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {mode === 'custom' && (
        <>
          {/* Gradient preview */}
          <div
            className="h-32 rounded-xl shadow-lg"
            style={{ background: hexFallbackCSS }}
          />

          {/* Gradient type selector */}
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
          <ColorStopsDisplay
            stops={customColors}
            onColorSelect={onColorSelect}
          />
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SHARED: Gradient type selector (for vibe mode too) */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {mode === 'vibe' && (
        <>
          {/* Gradient type selector */}
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
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* CSS OUTPUT */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
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
        <div className="bg-[#0a0a0f] border border-[#1a1a24] rounded-lg p-3 max-h-32 overflow-y-auto">
          <code className="text-[10px] text-[#f0f0f5] font-mono whitespace-pre-wrap break-all">
            {fullCSS}
          </code>
        </div>
      </div>
    </div>
  );
}
