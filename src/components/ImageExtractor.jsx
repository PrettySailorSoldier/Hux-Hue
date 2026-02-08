import React, { useState, useCallback, useRef } from 'react';
import { Upload, Image, X, Loader } from 'lucide-react';
import { toOklch, oklchToHex } from '../utils/colorUtils';

export default function ImageExtractor({ onColorsExtracted, onColorSelect }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [extractedColors, setExtractedColors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);
  const canvasRef = useRef(null);

  const extractColors = useCallback((imageElement) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Scale image to manageable size for sampling
    const maxSize = 100;
    const scale = Math.min(maxSize / imageElement.width, maxSize / imageElement.height);
    canvas.width = imageElement.width * scale;
    canvas.height = imageElement.height * scale;
    
    ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    
    // Simple color quantization using color buckets
    const colorMap = new Map();
    
    for (let i = 0; i < pixels.length; i += 4) {
      const r = Math.round(pixels[i] / 32) * 32;
      const g = Math.round(pixels[i + 1] / 32) * 32;
      const b = Math.round(pixels[i + 2] / 32) * 32;
      const key = `${r},${g},${b}`;
      
      colorMap.set(key, (colorMap.get(key) || 0) + 1);
    }
    
    // Sort by frequency and get top colors
    const sortedColors = [...colorMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([key]) => {
        const [r, g, b] = key.split(',').map(Number);
        return toOklch({ mode: 'rgb', r: r / 255, g: g / 255, b: b / 255 });
      });
    
    // Filter out very similar colors
    const uniqueColors = [];
    for (const color of sortedColors) {
      const isDuplicate = uniqueColors.some(existing => {
        const hDiff = Math.abs((existing.h || 0) - (color.h || 0));
        const lDiff = Math.abs(existing.l - color.l);
        const cDiff = Math.abs(existing.c - color.c);
        return hDiff < 30 && lDiff < 0.15 && cDiff < 0.08;
      });
      
      if (!isDuplicate) {
        uniqueColors.push(color);
        if (uniqueColors.length >= 5) break;
      }
    }
    
    setExtractedColors(uniqueColors);
    if (onColorsExtracted) onColorsExtracted(uniqueColors);
  }, [onColorsExtracted]);

  const handleFile = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) return;
    
    setIsLoading(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      setImageUrl(e.target.result);
      
      const img = new window.Image();
      img.onload = () => {
        extractColors(img);
        setIsLoading(false);
      };
      img.src = e.target.result;
    };
    
    reader.readAsDataURL(file);
  }, [extractColors]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragActive(false);
    
    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const clearImage = useCallback(() => {
    setImageUrl(null);
    setExtractedColors([]);
    if (inputRef.current) inputRef.current.value = '';
  }, []);

  return (
    <div className="space-y-4">
      <h3 className="text-xs text-[#8888a0] uppercase tracking-wider font-medium">
        Extract from Image
      </h3>

      <canvas ref={canvasRef} className="hidden" />

      {!imageUrl ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
            ${dragActive 
              ? 'border-[#ff6b4a] bg-[#ff6b4a]/5' 
              : 'border-[#1a1a24] hover:border-[#252530]'
            }
          `}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFile(e.target.files?.[0])}
            className="hidden"
          />
          <Upload size={32} className="mx-auto mb-3 text-[#55556a]" />
          <p className="text-sm text-[#8888a0]">
            Drop an image or click to upload
          </p>
          <p className="text-xs text-[#55556a] mt-1">
            PNG, JPG, GIF up to 10MB
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative group">
            <img
              src={imageUrl}
              alt="Uploaded"
              className="w-full h-40 object-cover rounded-xl"
            />
            <button
              onClick={clearImage}
              className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={14} className="text-white" />
            </button>
            {isLoading && (
              <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                <Loader size={24} className="text-white animate-spin" />
              </div>
            )}
          </div>

          {extractedColors.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-[10px] text-[#55556a] uppercase tracking-wider">
                Extracted Colors
              </h4>
              <div className="flex gap-2">
                {extractedColors.map((color, i) => (
                  <button
                    key={i}
                    onClick={() => onColorSelect && onColorSelect(color)}
                    className="w-12 h-12 rounded-lg shadow-lg transition-transform hover:scale-110"
                    style={{ backgroundColor: oklchToHex(color) }}
                    title={oklchToHex(color)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}