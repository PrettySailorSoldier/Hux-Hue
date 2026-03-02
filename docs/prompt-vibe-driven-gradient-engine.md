I need to upgrade the GradientGenerator component to use vibe-aware color intelligence 
instead of just dumping palette colors into CSS stops. Currently the gradient tab takes 
whatever colors are active and strings them together — this produces generic Pinterest 
gradients because there's no intelligence about how OKLCH color space behaves during 
interpolation.

=== THE CORE PROBLEMS TO SOLVE ===

1. CHROMA VALLEY: When you interpolate between two saturated colors in OKLCH, the 
   midpoint often passes through a low-chroma zone and turns muddy/gray. The fix is 
   to add a "chroma boost" stop at the midpoint that artificially lifts saturation.

2. HUE PATH CONTROL: Going from pink (h≈350) to teal (h≈180) can arc through 
   red-orange-yellow (warm path) OR through blue-violet (cool path). Same endpoints, 
   completely different result. Currently there's no control over which path is taken.

3. LIGHTNESS ARCING: Linear lightness interpolation looks flat. A gentle ease 
   (slight curve in the middle) makes gradients feel alive. This is separate from 
   the CSS easing — it's about where the actual color stops are placed.

4. NO VIBE AWARENESS: The gradient uses whatever colors happen to be in the palette, 
   but those colors weren't chosen for gradient behavior — they were chosen for 
   palette harmony. Gradients need different color relationships than palettes do.

=== WHAT NEEDS TO BE BUILT ===

**New utility file: src/utils/gradientEngine.js**

This file handles all gradient intelligence. It should export:
```js
// Generate a vibe-matched gradient from a single base color.
// This is the primary function — it doesn't just arrange existing colors,
// it GENERATES colors specifically optimized for gradient behavior.
export function generateVibeGradient(baseColor, options = {})

// Fix an existing array of OKLCH colors for gradient use:
// - Adds chroma boost stops at midpoints to prevent mud
// - Generates intermediate hue stops along the chosen path
// - Returns an expanded array of OKLCH stops
export function optimizeForGradient(colors, options = {})

// Given two OKLCH colors, return an array of N interpolated stops
// using the specified hue path ('warm', 'cool', 'short', 'long')
export function interpolateOKLCH(colorA, colorB, steps, options = {})
```

**generateVibeGradient implementation logic:**
```js
export function generateVibeGradient(baseColor, options = {}) {
  const {
    style = 'auto',     // 'auto' | 'atmospheric' | 'jewel' | 'earthy' | 
                         // 'dreamy' | 'pop' | 'noir' | 'botanical'
    stops = 3,          // number of key colors (browser interpolates between)
    huePath = 'auto'    // 'auto' | 'warm' | 'cool' | 'short' | 'long'
  } = options;

  // Import and use analyzeColorMood from vibeHarmony.js to read the base color
  const mood = analyzeColorMood(baseColor);
  
  // Use mood to determine gradient style if 'auto'
  const resolvedStyle = style === 'auto' ? mapMoodToGradientStyle(mood) : style;
  
  // Generate the key stops based on style
  // Each style has its own logic for what hues/chromas/lightnesses to pair with the input
  const keyStops = generateKeyStops(baseColor, mood, resolvedStyle, stops);
  
  // Expand stops to include midpoint chroma boosts
  const expandedStops = optimizeForGradient(keyStops, { huePath, mood });
  
  return {
    stops: expandedStops,          // OKLCH color objects
    style: resolvedStyle,
    mood: mood.mood,
    huePath: resolvedHuePath,
    description: getGradientDescription(resolvedStyle, mood)
  };
}
```

**Style definitions for generateKeyStops:**

Each style defines how to build the gradient stops around the base color:

- `atmospheric`: Base → desaturated midpoint → complementary at lower lightness. 
  Chroma drops in the middle intentionally. Feels like a sky at dusk.
  
- `jewel`: Base → near-analogous with higher chroma → complement at same depth.
  All stops stay in the deep/rich lightness range. Velvet-like.
  
- `earthy`: Base → warm analogous shift → neutral with base hue undertone.
  Hue stays in 30° range. Chroma gently decreases. Feels like natural pigment.
  
- `dreamy`: Base at reduced chroma → shift 60-80° toward blue-violet → very light 
  near-neutral. Lightness increases toward the end. Ethereal.
  
- `pop`: Base → complement at equal chroma → slight rotation away from complement.
  Keep chroma high throughout. Boost midpoint chroma. High energy.
  
- `noir`: Base (dark, muted) → near-black with base hue → dark complement.
  Lightness stays 0.1-0.4 throughout. Almost no chroma variation.
  
- `botanical`: Base → yellow-green shift → deep earthy anchor.
  Hue arcs through the green-yellow zone. Chroma stays in natural range.
  
- `chromatic-arc` (new, signature feature): Generates a gradient that arcs through 
  3-4 perceptually distinct hues while keeping chroma and lightness consistent.
  Think: a gradient that goes through rose → mauve → slate → teal while 
  maintaining the same "depth" throughout. This is the one that doesn't look like 
  anything on Pinterest.

**optimizeForGradient implementation:**
```js
export function optimizeForGradient(colors, options = {}) {
  const { huePath = 'short', boostChroma = true } = options;
  const expanded = [];
  
  for (let i = 0; i < colors.length - 1; i++) {
    const a = colors[i];
    const b = colors[i + 1];
    
    expanded.push(a);
    
    // Add midpoint stop with chroma boost if both endpoints have chroma
    if (boostChroma && a.c > 0.05 && b.c > 0.05) {
      const midL = (a.l + b.l) / 2;
      const midC = Math.max(a.c, b.c) * 1.15; // Boost above both endpoints
      const midH = interpolateHue(a.h, b.h, 0.5, huePath);
      
      expanded.push({ mode: 'oklch', l: midL, c: midC, h: midH });
    }
  }
  
  expanded.push(colors[colors.length - 1]);
  return expanded;
}
```

**interpolateHue implementation:**
```js
function interpolateHue(h1, h2, t, path = 'short') {
  // Normalize both hues to 0-360
  h1 = ((h1 % 360) + 360) % 360;
  h2 = ((h2 % 360) + 360) % 360;
  
  let diff = h2 - h1;
  
  switch(path) {
    case 'short':
      // Shortest arc (default)
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;
      break;
    case 'long':
      // Longest arc (goes the "wrong way" around the wheel)
      if (diff > 0 && diff < 180) diff -= 360;
      if (diff < 0 && diff > -180) diff += 360;
      break;
    case 'warm':
      // Arc through warm hues (red-orange-yellow zone: 0-60)
      // If going from cool to cool, force path through warm
      // Implementation: if both h1 and h2 are in cool zone (170-280),
      // route through 60 (yellow) as intermediate
      break;
    case 'cool':
      // Arc through cool hues (blue-violet zone: 210-280)
      break;
  }
  
  return ((h1 + diff * t) % 360 + 360) % 360;
}
```

=== UPDATES TO GradientGenerator.jsx ===

The component needs significant new UI. Keep everything existing and add:

**New "Vibe Gradient" mode** — a separate tab or toggle from the existing "Custom" mode:

1. When "Vibe" mode is active:
   - Show style selector: atmospheric / jewel / earthy / dreamy / pop / noir / 
     botanical / chromatic-arc (with small 40x20px preview swatches for each)
   - Show hue path selector: short / long / warm / cool (4 small pill buttons)
   - Show number of stops slider: 2-5
   - "Regenerate" button (reruns with same settings, slight variation)
   - Generated gradient preview (full width, h-40)
   - Below preview: show the actual color stops as clickable swatches
   - Show the mood label ("Your color reads as: moody" etc.)
   
2. The style selector swatches should be live — generate a tiny gradient preview 
   for each style option using the current base color. These update when base color 
   changes.

3. Keep the existing "Custom" mode exactly as-is for people who want to arrange 
   their own colors.

**Props update:**
The component already receives `initialColors` and `onColorSelect`. 
Also add `baseColor` prop (the single selected OKLCH color from the color wheel) 
so the vibe mode can work from just the base color rather than needing a palette first.

**CSS output:**
When outputting CSS for the vibe gradient, output the full expanded stop list 
with oklch() color functions rather than hex, so modern browsers get the full 
benefit of OKLCH interpolation. Include a hex fallback comment.
```css
/* hex fallback */
background: linear-gradient(135deg, #c4836a, #a07891, #6b7fbd);
/* oklch — better color interpolation in modern browsers */
background: linear-gradient(135deg in oklch, 
  oklch(0.62 0.12 42), 
  oklch(0.58 0.11 320), 
  oklch(0.54 0.14 256)
);
```

=== COMPONENT IMPORT ===

In GradientGenerator.jsx, import from the new utility:
```js
import { generateVibeGradient, optimizeForGradient } from '../utils/gradientEngine';
import { analyzeColorMood } from '../utils/vibeHarmony';
```

=== FILE TO CREATE ===
- src/utils/gradientEngine.js (new)

=== FILES TO MODIFY ===
- src/components/GradientGenerator.jsx (add vibe mode UI + wire up engine)
- src/App.jsx — pass `baseColor={selectedColor}` prop to GradientGenerator 
  wherever it's rendered

=== STYLING ===
Match existing hex&hue dark theme exactly:
- bg-[#0a0a0f] / bg-[#12121a] / bg-[#1a1a24]  
- text-[#f0f0f5] / text-[#8888a0] / text-[#55556a]
- accent: #ff6b4a
- Active states: bg-[#ff6b4a]/20 text-[#ff6b4a]
- Rounded: rounded-xl for containers, rounded-lg for controls

The chromatic-arc style is the marquee feature — it should be the default when 
style='auto' maps to a 'balanced' or 'moderate' mood, and it should be visually 
highlighted in the style picker as the "signature" option.