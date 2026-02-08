import React from 'react';
import { 
  Sun, 
  Moon, 
  Zap, 
  Briefcase, 
  Heart,
  Sparkles,
  Leaf,
  Flame
} from 'lucide-react';
import { oklchToHex, generateMoodPalette } from '../utils/colorUtils';

const MOODS = [
  { 
    id: 'happy', 
    name: 'Happy', 
    icon: Sun,
    color: '#fbbf24',
    description: 'Warm, bright, optimistic'
  },
  { 
    id: 'calm', 
    name: 'Calm', 
    icon: Moon,
    color: '#60a5fa',
    description: 'Cool, serene, peaceful'
  },
  { 
    id: 'energetic', 
    name: 'Energetic', 
    icon: Zap,
    color: '#f97316',
    description: 'Vibrant, dynamic, bold'
  },
  { 
    id: 'professional', 
    name: 'Professional', 
    icon: Briefcase,
    color: '#64748b',
    description: 'Neutral, trustworthy'
  },
  { 
    id: 'romantic', 
    name: 'Romantic', 
    icon: Heart,
    color: '#ec4899',
    description: 'Soft, warm, intimate'
  },
  { 
    id: 'playful', 
    name: 'Playful', 
    icon: Sparkles,
    color: '#a855f7',
    description: 'Fun, creative, whimsical'
  },
  { 
    id: 'natural', 
    name: 'Natural', 
    icon: Leaf,
    color: '#22c55e',
    description: 'Earthy, organic, fresh'
  },
  { 
    id: 'passionate', 
    name: 'Passionate', 
    icon: Flame,
    color: '#ef4444',
    description: 'Intense, powerful, dramatic'
  },
];

export default function MoodSelector({ onMoodSelect, selectedMood, baseColor }) {
  const handleSelect = (mood) => {
    onMoodSelect(mood.id);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-xs text-[#8888a0] uppercase tracking-wider font-medium">
        Mood / Theme
      </h3>
      
      <div className="grid grid-cols-4 gap-2">
        {MOODS.map((mood) => {
          const Icon = mood.icon;
          const isSelected = selectedMood === mood.id;
          
          return (
            <button
              key={mood.id}
              onClick={() => handleSelect(mood)}
              className={`
                group flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all
                ${isSelected 
                  ? 'bg-[#ff6b4a]/10 border-[#ff6b4a]/40' 
                  : 'bg-[#12121a] border-[#1a1a24] hover:border-[#252530]'
                }
              `}
              title={mood.description}
            >
              <div 
                className={`
                  w-8 h-8 rounded-lg flex items-center justify-center transition-all
                  ${isSelected ? 'scale-110' : 'group-hover:scale-105'}
                `}
                style={{ backgroundColor: `${mood.color}20` }}
              >
                <Icon 
                  size={16} 
                  style={{ color: mood.color }}
                />
              </div>
              <span className={`text-[10px] font-medium ${isSelected ? 'text-[#ff6b4a]' : 'text-[#8888a0]'}`}>
                {mood.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected mood description */}
      {selectedMood && (
        <div className="bg-[#12121a] rounded-lg p-3 border border-[#1a1a24]">
          <p className="text-xs text-[#8888a0]">
            {MOODS.find(m => m.id === selectedMood)?.description}
          </p>
        </div>
      )}
    </div>
  );
}