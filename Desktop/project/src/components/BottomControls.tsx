import React, { useState, useEffect } from 'react';
import { ChevronDown, Settings, RotateCcw, Maximize2, Minimize2, Eye } from 'lucide-react';
import { useCanvasContext } from '../context/CanvasContext';
import { useViewContext } from '../context/ViewContext';
import ViewOptionsPanel from './ViewOptionsPanel';
import { useTextContext } from '../context/TextContext';
import { useImageContext } from '../context/ImageContext';
import { useGraphicsContext } from '../context/GraphicsContext';
import { useQRContext } from '../context/QRContext';

const BottomControls: React.FC = () => {
  const { canvasScale, setCanvasScale } = useCanvasContext();
  const { viewOptions, toggleViewOption } = useViewContext();
  const [showZoomDropdown, setShowZoomDropdown] = useState<boolean>(false);
  const [showViewPanel, setShowViewPanel] = useState<boolean>(false);

  // Get selection states to close view panel when preview is opened
  const { selectedTextId } = useTextContext();
  const { selectedImageId } = useImageContext();
  const { selectedGraphicId } = useGraphicsContext();
  const { selectedQRId } = useQRContext();

  const zoomOptions = [25, 50, 75, 100, 125, 150, 200, 300];

  const handleZoomChange = (newScale: number) => {
    setCanvasScale(newScale);
    setShowZoomDropdown(false);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCanvasScale(Number(e.target.value));
  };

  // Close view panel when all elements are deselected (happens when preview is opened)
  useEffect(() => {
    if (!selectedTextId && !selectedImageId && !selectedGraphicId && !selectedQRId) {
      setShowViewPanel(false);
    }
  }, [selectedTextId, selectedImageId, selectedGraphicId, selectedQRId]);

  return (
    <div className="bg-white border-t border-gray-200 px-6 py-3 relative">
      <div className="flex items-center justify-between">
        {/* Left side - Zoom Controls */}
        <div className="flex items-center space-x-4">
          {/* Zoom Slider */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setCanvasScale(Math.max(25, canvasScale - 25))}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Zoom out"
            >
              <Minimize2 className="w-4 h-4 text-gray-600" />
            </button>
            
            <input
              type="range"
              min="25"
              max="300"
              step="25"
              value={canvasScale}
              onChange={handleSliderChange}
              className="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((canvasScale - 25) / (300 - 25)) * 100}%, #e5e7eb ${((canvasScale - 25) / (300 - 25)) * 100}%, #e5e7eb 100%)`
              }}
            />
            
            <button
              onClick={() => setCanvasScale(Math.min(300, canvasScale + 25))}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Zoom in"
            >
              <Maximize2 className="w-4 h-4 text-gray-600" />
            </button>
            
            {/* Zoom Percentage Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowZoomDropdown(!showZoomDropdown)}
                className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-medium">{canvasScale}%</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {showZoomDropdown && (
                <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[120px]">
                  {zoomOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleZoomChange(option)}
                      className={`block w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                        canvasScale === option ? 'bg-blue-50 text-blue-600' : ''
                      }`}
                    >
                      {option}%
                    </button>
                  ))}
                  <div className="border-t border-gray-200"></div>
                  <button
                    onClick={() => handleZoomChange(100)}
                    className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors font-medium"
                  >
                    Fit to window
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right side - View Controls */}
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setShowViewPanel(!showViewPanel)}
            className={`flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md transition-colors ${
              showViewPanel ? 'bg-blue-50 border-blue-300 text-blue-700' : 'hover:bg-gray-50'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span className="text-sm font-medium">View</span>
          </button>
          
          {/* Reset/Refresh Button */}
          <button 
            onClick={() => setCanvasScale(100)}
            className="p-2 text-orange-500 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-colors" 
            title="Reset zoom to 100%"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* View Options Panel */}
      <ViewOptionsPanel
        isOpen={showViewPanel}
        onClose={() => setShowViewPanel(false)}
        viewOptions={viewOptions}
        onToggleOption={toggleViewOption}
      />
      
      {/* Click outside to close dropdowns */}
      {(showZoomDropdown || showViewPanel) && (
        <div 
          className="fixed inset-0 z-30"
          onClick={() => {
            setShowZoomDropdown(false);
            setShowViewPanel(false);
          }}
        />
      )}
    </div>
  );
};

export default BottomControls;