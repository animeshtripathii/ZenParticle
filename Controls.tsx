import React from 'react';
import { ShapeType, THEME_COLORS, ParticleConfig } from '../types';
import { Layers, Activity, Heart, Circle, Disc, Zap, Flower } from 'lucide-react';

interface ControlsProps {
  config: ParticleConfig;
  setConfig: React.Dispatch<React.SetStateAction<ParticleConfig>>;
  currentTension: number;
}

const Controls: React.FC<ControlsProps> = ({ config, setConfig, currentTension }) => {

  const getIcon = (type: ShapeType) => {
    switch (type) {
      case ShapeType.SPHERE: return <Circle size={16} />;
      case ShapeType.HEART: return <Heart size={16} />;
      case ShapeType.FLOWER: return <Flower size={16} />;
      case ShapeType.SATURN: return <Disc size={16} />;
      case ShapeType.FIREWORKS: return <Zap size={16} />;
      case ShapeType.BUDDHA: return <Layers size={16} />;
      default: return <Circle size={16} />;
    }
  };

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center gap-4 w-full max-w-2xl px-4 pointer-events-none">
      
      {/* Tension Visualization Bar */}
      <div className="w-64 h-2 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm border border-white/10 relative">
        <div 
          className="absolute top-0 left-0 h-full transition-all duration-100 ease-linear bg-gradient-to-r from-cyan-400 to-purple-500"
          style={{ width: `${currentTension * 100}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[8px] font-bold text-white/60 tracking-widest uppercase mix-blend-difference">
                Vis Tension
            </span>
        </div>
      </div>

      {/* Main Glass Panel */}
      <div className="pointer-events-auto bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl flex flex-col md:flex-row gap-6 items-center">
        
        {/* Shape Selector */}
        <div className="flex gap-2">
          {Object.values(ShapeType).map((type) => (
            <button
              key={type}
              onClick={() => setConfig(prev => ({ ...prev, shape: type }))}
              className={`
                group relative p-3 rounded-xl transition-all duration-300
                ${config.shape === type 
                  ? 'bg-white/20 text-white shadow-[0_0_15px_rgba(255,255,255,0.3)] scale-110' 
                  : 'bg-transparent text-white/50 hover:bg-white/10 hover:text-white'}
              `}
              title={type}
            >
              {getIcon(type)}
              {config.shape === type && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-cyan-400 rounded-full animate-pulse" />
              )}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px h-8 bg-white/10" />

        {/* Color Picker */}
        <div className="flex gap-2">
          {THEME_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => setConfig(prev => ({ ...prev, color: color }))}
              className={`
                w-6 h-6 rounded-full border border-white/10 transition-transform duration-200
                hover:scale-125 focus:outline-none
                ${config.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-110' : ''}
              `}
              style={{ backgroundColor: color, boxShadow: config.color === color ? `0 0 10px ${color}` : 'none' }}
            />
          ))}
        </div>

      </div>
      
    </div>
  );
};

export default Controls;