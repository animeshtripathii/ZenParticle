import React, { useState, useRef, useEffect } from 'react';
import { X, Check, RotateCw, Move, Crop, ArrowLeft } from 'lucide-react';
import { useImageContext } from '../context/ImageContext';

interface CropInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
  imageSrc: string;
}

const CropInterface: React.FC<CropInterfaceProps> = ({
  isOpen,
  onClose,
  onApply,
  imageSrc
}) => {
  const { selectedImageId, updateImageElement } = useImageContext();
  const [cropArea, setCropArea] = useState({ x: 10, y: 10, width: 80, height: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lockAspectRatio, setLockAspectRatio] = useState(true);
  const [selectedFrame, setSelectedFrame] = useState('none');
  const containerRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const deltaX = ((e.clientX - dragStart.x) / rect.width) * 100;
    const deltaY = ((e.clientY - dragStart.y) / rect.height) * 100;

    setCropArea(prev => ({
      ...prev,
      x: Math.max(0, Math.min(100 - prev.width, prev.x + deltaX)),
      y: Math.max(0, Math.min(100 - prev.height, prev.y + deltaY))
    }));

    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleFrameSelect = (frameId: string) => {
    setSelectedFrame(frameId);
    
    // Apply the clip-path to the selected image element immediately for preview
    if (selectedImageId) {
      const clipPath = getClipPathForFrame(frameId);
      updateImageElement(selectedImageId, { clipPath });
    }
  };

  const getClipPathForFrame = (frameId: string): string => {
    switch (frameId) {
      case 'circle':
        return 'circle(50% at 50% 50%)';
      case 'triangle':
        return 'polygon(50% 0%, 0% 100%, 100% 100%)';
      case 'heart':
        return 'path("M12,21.35l-1.45-1.32C5.4,15.36,2,12.28,2,8.5 C2,5.42,4.42,3,7.5,3c1.74,0,3.41,0.81,4.5,2.09C13.09,3.81,14.76,3,16.5,3 C19.58,3,22,5.42,22,8.5c0,3.78-3.4,6.86-8.55,11.54L12,21.35z")';
      case 'star':
        return 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)';
      case 'diamond':
        return 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)';
      case 'hexagon':
        return 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)';
      case 'pentagon':
        return 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)';
      case 'square':
        return 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)';
      case 'landscape':
        return 'polygon(0% 20%, 100% 20%, 100% 80%, 0% 80%)';
      case 'burst':
        return 'polygon(50% 0%, 59% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 41% 35%)';
      case 'gear':
        return 'polygon(50% 0%, 60% 35%, 100% 35%, 70% 57%, 85% 100%, 50% 75%, 15% 100%, 30% 57%, 0% 35%, 40% 35%)';
      case 'none':
      default:
        return 'none';
    }
  };

  const getPreviewStyle = (frameId: string) => {
    const clipPath = getClipPathForFrame(frameId);
    return {
      clipPath: clipPath !== 'none' ? clipPath : undefined,
      transition: 'clip-path 0.3s ease'
    };
  };

  const handleApplyClick = () => {
    // Apply final crop settings
    if (selectedImageId) {
      const clipPath = getClipPathForFrame(selectedFrame);
      updateImageElement(selectedImageId, { 
        clipPath,
        cropData: {
          x: cropArea.x,
          y: cropArea.y,
          width: cropArea.width,
          height: cropArea.height,
          shape: selectedFrame
        }
      });
    }
    onApply();
  };

  const handleRemoveCrop = () => {
    if (selectedImageId) {
      updateImageElement(selectedImageId, { 
        clipPath: 'none',
        cropData: null
      });
    }
    setSelectedFrame('none');
  };

  const frames = [
    { id: 'none', name: 'None', icon: '🚫' },
    { id: 'circle', name: 'Circle', icon: '🔵' },
    { id: 'triangle', name: 'Triangle', icon: '🔺' },
    { id: 'landscape', name: 'Landscape', icon: '🏔️' },
    { id: 'square', name: 'Square', icon: '⬜' },
    { id: 'heart', name: 'Heart', icon: '💚' },
    { id: 'star', name: 'Star', icon: '⭐' },
    { id: 'burst', name: 'Burst', icon: '💥' },
    { id: 'gear', name: 'Gear', icon: '⚙️' },
    { id: 'diamond', name: 'Diamond', icon: '💎' },
    { id: 'pentagon', name: 'Pentagon', icon: '⬟' },
    { id: 'hexagon', name: 'Hexagon', icon: '⬡' },
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 h-full overflow-y-auto">
      {/* Header with back button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-3"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <Crop className="w-5 h-5 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Crop</h2>
          </div>
        </div>
      </div>

      {/* Lock Aspect Ratio Toggle */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Lock aspect ratio</span>
          <button
            onClick={() => setLockAspectRatio(!lockAspectRatio)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              lockAspectRatio ? 'bg-blue-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform ${
                lockAspectRatio ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
            {lockAspectRatio && (
              <Check className="absolute left-1.5 w-3 h-3 text-blue-500" />
            )}
          </button>
        </div>
      </div>

      {/* Crop Preview */}
      <div className="mb-6">
        <div 
          ref={containerRef}
          className="relative w-full h-48 border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-100"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {imageSrc && (
            <img
              src={imageSrc}
              alt="Crop preview"
              className="w-full h-full object-cover transition-all duration-300"
              style={getPreviewStyle(selectedFrame)}
              draggable={false}
            />
          )}
          
          {/* Crop Overlay - only show when no shape is selected */}
          {selectedFrame === 'none' && (
            <div className="absolute inset-0 bg-black bg-opacity-40">
              <div
                className="absolute border-2 border-white border-dashed bg-transparent cursor-move"
                style={{
                  left: `${cropArea.x}%`,
                  top: `${cropArea.y}%`,
                  width: `${cropArea.width}%`,
                  height: `${cropArea.height}%`,
                }}
                onMouseDown={handleMouseDown}
              >
                {/* Corner handles */}
                <div className="absolute -top-1 -left-1 w-3 h-3 bg-white border border-gray-400 cursor-nw-resize"></div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-white border border-gray-400 cursor-ne-resize"></div>
                <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-white border border-gray-400 cursor-sw-resize"></div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white border border-gray-400 cursor-se-resize"></div>
                
                {/* Move icon in center */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Move className="w-4 h-4 text-white opacity-75" />
                </div>
              </div>
            </div>
          )}

          {/* Shape preview overlay */}
          {selectedFrame !== 'none' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white text-sm font-medium bg-black bg-opacity-50 px-3 py-1 rounded-full">
                {frames.find(f => f.id === selectedFrame)?.name} Preview
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Frames Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Frames</h3>
        <div className="grid grid-cols-3 gap-3">
          {frames.map((frame) => (
            <button
              key={frame.id}
              onClick={() => handleFrameSelect(frame.id)}
              className={`relative aspect-square border-2 rounded-lg p-3 flex items-center justify-center hover:bg-gray-50 transition-all duration-200 ${
                selectedFrame === frame.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              title={frame.name}
            >
              <span className="text-2xl">{frame.icon}</span>
              
              {/* Selected indicator */}
              {selectedFrame === frame.id && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Remove Crop Button */}
      <div className="mb-6">
        <button 
          onClick={handleRemoveCrop}
          className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
        >
          <X className="w-4 h-4" />
          <span>Remove crop</span>
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button
          onClick={onClose}
          className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleApplyClick}
          className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default CropInterface;