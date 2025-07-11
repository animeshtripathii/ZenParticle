import React, { useEffect, useRef } from 'react';
import { RotateCcw } from 'lucide-react';

interface FloatingPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  anchorRef?: React.RefObject<HTMLElement>;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const FloatingPanel: React.FC<FloatingPanelProps> = ({
  isOpen,
  onClose,
  title,
  children,
  anchorRef,
  position = 'bottom',
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        anchorRef?.current &&
        !anchorRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose, anchorRef]);

  if (!isOpen) return null;

  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'bottom-full mb-2';
      case 'left':
        return 'right-full mr-2 top-0';
      case 'right':
        return 'left-full ml-2 top-0';
      default:
        return 'top-full mt-2';
    }
  };

  return (
    <div
      ref={panelRef}
      className={`absolute ${getPositionClasses()} bg-white rounded-lg shadow-xl border border-gray-200 z-50 min-w-[200px] animate-in fade-in-0 zoom-in-95 duration-200`}
    >
      {/* Arrow */}
      <div className={`absolute w-3 h-3 bg-white border-l border-t border-gray-200 transform rotate-45 ${
        position === 'bottom' ? '-top-1.5 left-4' :
        position === 'top' ? '-bottom-1.5 left-4' :
        position === 'right' ? '-left-1.5 top-4' :
        '-right-1.5 top-4'
      }`} />
      
      <div className="p-4">
        <h4 className="font-medium text-gray-900 mb-3">{title}</h4>
        {children}
      </div>
    </div>
  );
};

interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  onReset: () => void;
  defaultValue: number;
}

export const SliderControl: React.FC<SliderControlProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
  onReset,
  defaultValue,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <button
          onClick={onReset}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          title="Reset to default"
        >
          <RotateCcw className="w-3 h-3 text-gray-500" />
        </button>
      </div>
      
      <div className="flex items-center space-x-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, #e5e7eb 0%, #3b82f6 ${((value - min) / (max - min)) * 100}%, #e5e7eb ${((value - min) / (max - min)) * 100}%)`
          }}
        />
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          min={min}
          max={max}
          step={step}
        />
        {unit && <span className="text-sm text-gray-500">{unit}</span>}
      </div>
    </div>
  );
};

interface DropdownControlProps {
  label: string;
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
}

export const DropdownControl: React.FC<DropdownControlProps> = ({
  label,
  options,
  value,
  onChange,
}) => {
  return (
    <div className="space-y-2">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

interface ButtonGroupControlProps {
  label: string;
  options: Array<{ value: string; label: string; icon?: React.ComponentType<{ className?: string }> }>;
  value: string;
  onChange: (value: string) => void;
}

export const ButtonGroupControl: React.FC<ButtonGroupControlProps> = ({
  label,
  options,
  value,
  onChange,
}) => {
  return (
    <div className="space-y-2">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <div className="flex space-x-1">
        {options.map((option) => {
          const Icon = option.icon;
          return (
            <button
              key={option.value}
              onClick={() => onChange(option.value)}
              className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
                value === option.value
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-center space-x-1">
                {Icon && <Icon className="w-4 h-4" />}
                <span>{option.label}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FloatingPanel;