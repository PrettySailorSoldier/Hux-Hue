import React, { useEffect, useRef } from 'react';
import { formatHex, oklch } from 'culori';
import { oklchToHex } from '../utils/colorUtils';

export default function HarmonyVisualizer({ colors, harmonyType, size = 160 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !colors || colors.length === 0) return;

    const ctx = canvas.getContext('2d');
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 25;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Draw hue ring background
    const ringWidth = 12;
    for (let angle = 0; angle < 360; angle++) {
      const startAngle = (angle - 90) * (Math.PI / 180);
      const endAngle = (angle + 1 - 90) * (Math.PI / 180);
      
      const color = oklch({ l: 0.65, c: 0.18, h: angle });
      let hex;
      try {
        hex = formatHex(color) || '#888';
      } catch {
        hex = '#888';
      }
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.arc(centerX, centerY, radius - ringWidth, endAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = hex;
      ctx.fill();
    }

    // Draw center circle (dark background)
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - ringWidth - 2, 0, 2 * Math.PI);
    ctx.fillStyle = '#0a0a0f';
    ctx.fill();

    // Draw lines connecting colors (harmony relationship)
    if (colors.length >= 2) {
      ctx.beginPath();
      colors.forEach((color, i) => {
        const hue = color.h || 0;
        const angle = (hue - 90) * (Math.PI / 180);
        const x = centerX + Math.cos(angle) * (radius - ringWidth / 2);
        const y = centerY + Math.sin(angle) * (radius - ringWidth / 2);
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.closePath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.fill();
    }

    // Draw color indicators on the ring
    colors.forEach((color, i) => {
      const hue = color.h || 0;
      const angle = (hue - 90) * (Math.PI / 180);
      const x = centerX + Math.cos(angle) * (radius - ringWidth / 2);
      const y = centerY + Math.sin(angle) * (radius - ringWidth / 2);
      
      // Outer glow
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.fill();
      
      // Main dot
      ctx.beginPath();
      ctx.arc(x, y, 7, 0, 2 * Math.PI);
      ctx.fillStyle = oklchToHex(color);
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Draw harmony type label in center
    ctx.fillStyle = '#8888a0';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const label = harmonyType ? harmonyType.replace('-', ' ') : 'harmony';
    ctx.fillText(label.toUpperCase(), centerX, centerY);

  }, [colors, harmonyType, size]);

  if (!colors || colors.length === 0) {
    return (
      <div 
        className="flex items-center justify-center bg-[#12121a] rounded-full border border-[#1a1a24]"
        style={{ width: size, height: size }}
      >
        <span className="text-xs text-[#55556a]">Select a harmony</span>
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className="rounded-full"
      style={{ filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3))' }}
    />
  );
}