import React, { useEffect, useRef } from 'react';
import { X, Monitor } from 'lucide-react';

interface ViewOption {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

interface ViewOptionsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  viewOptions: ViewOption[];
  onToggleOption: (id: string) => void;
}

const ViewOptionsPanel: React.FC<ViewOptionsPanelProps> = ({
  isOpen,
  onClose,
  viewOptions,
  onToggleOption,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-20 z-40"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div 
        ref={panelRef}
        className="absolute bottom-full right-0 mb-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 w-80 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900">View</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Options */}
        <div className="p-6 space-y-6">
          {viewOptions.map((option) => (
            <div key={option.id} className="flex items-start justify-between">
              <div className="flex-1 pr-4">
                <h4 className="font-medium text-gray-900 mb-1">{option.label}</h4>
                <p className="text-sm text-gray-500 leading-relaxed">{option.description}</p>
              </div>
              
              {/* Custom Toggle Switch */}
              <button
                onClick={() => onToggleOption(option.id)}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  option.enabled ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform flex items-center justify-center ${
                    option.enabled ? 'translate-x-7' : 'translate-x-1'
                  }`}
                >
                  {option.enabled ? (
                    <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                </span>
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 p-6">
          <button className="flex items-center space-x-3 text-gray-700 hover:text-gray-900 transition-colors group w-full">
            <Monitor className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
            <span className="font-medium">See keyboard shortcuts</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default ViewOptionsPanel;