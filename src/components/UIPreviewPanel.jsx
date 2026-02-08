import React from 'react';
import { oklchToHex } from '../utils/colorUtils';

export default function UIPreviewPanel({ colors }) {
  if (!colors || colors.length < 3) {
    return (
      <div className="p-4 border border-dashed border-[#1a1a24] text-[#55556a] rounded-lg text-center text-xs">
        Need at least 3 colors for UI preview
      </div>
    );
  }

  const primary = oklchToHex(colors[0]);
  const secondary = oklchToHex(colors[1] || colors[0]);
  const accent = oklchToHex(colors[2] || colors[0]);
  const bg = colors[3] ? oklchToHex(colors[3]) : '#0a0a0f';
  const text = colors[4] ? oklchToHex(colors[4]) : '#f0f0f5';

  return (
    <div className="space-y-4">
      <h3 className="text-xs text-[#8888a0] uppercase tracking-wider font-medium">
        UI Preview
      </h3>

      {/* Mock UI */}
      <div 
        className="rounded-xl overflow-hidden border border-[#1a1a24]"
        style={{ backgroundColor: bg }}
      >
        {/* Header */}
        <div 
          className="px-4 py-3 border-b"
          style={{ borderColor: `${primary}30` }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div 
                className="w-6 h-6 rounded"
                style={{ backgroundColor: primary }}
              />
              <span style={{ color: text }} className="text-sm font-medium">
                App Name
              </span>
            </div>
            <div className="flex gap-2">
              <button
                className="px-3 py-1 rounded text-xs"
                style={{ backgroundColor: `${secondary}20`, color: secondary }}
              >
                Settings
              </button>
              <button
                className="px-3 py-1 rounded text-xs font-medium"
                style={{ backgroundColor: primary, color: bg }}
              >
                Action
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Card */}
          <div 
            className="p-4 rounded-lg"
            style={{ backgroundColor: `${primary}10` }}
          >
            <h4 style={{ color: text }} className="font-medium mb-2">
              Welcome Back
            </h4>
            <p style={{ color: `${text}80` }} className="text-sm">
              This is a preview of how your colors look in a UI.
            </p>
            <button
              className="mt-3 px-4 py-2 rounded-lg text-sm font-medium"
              style={{ backgroundColor: accent, color: bg }}
            >
              Get Started
            </button>
          </div>

          {/* Form elements */}
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Input field..."
              className="w-full px-3 py-2 rounded-lg text-sm"
              style={{ 
                backgroundColor: `${primary}10`,
                borderColor: `${primary}30`,
                color: text
              }}
            />
            
            <div className="flex gap-2">
              <button
                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium"
                style={{ backgroundColor: primary, color: bg }}
              >
                Primary
              </button>
              <button
                className="flex-1 px-4 py-2 rounded-lg text-sm"
                style={{ 
                  backgroundColor: 'transparent',
                  border: `1px solid ${secondary}`,
                  color: secondary
                }}
              >
                Secondary
              </button>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            <span 
              className="px-2 py-1 rounded text-xs"
              style={{ backgroundColor: `${primary}20`, color: primary }}
            >
              Tag 1
            </span>
            <span 
              className="px-2 py-1 rounded text-xs"
              style={{ backgroundColor: `${secondary}20`, color: secondary }}
            >
              Tag 2
            </span>
            <span 
              className="px-2 py-1 rounded text-xs"
              style={{ backgroundColor: `${accent}20`, color: accent }}
            >
              Tag 3
            </span>
          </div>
        </div>
      </div>

      {/* Color roles legend */}
      <div className="flex flex-wrap gap-2 text-[10px]">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: primary }} />
          <span className="text-[#55556a]">Primary</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: secondary }} />
          <span className="text-[#55556a]">Secondary</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: accent }} />
          <span className="text-[#55556a]">Accent</span>
        </div>
      </div>
    </div>
  );
}