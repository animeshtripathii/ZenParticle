import React, { useState, useRef, useEffect } from 'react';
import { X, Check, QrCode, ArrowLeft, Upload } from 'lucide-react';
import { useQRContext } from '../context/QRContext';

interface QRStylePanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedQRId: string | null;
}

const QRStylePanel: React.FC<QRStylePanelProps> = ({ 
  isOpen, 
  onClose,
  selectedQRId
}) => {
  const { qrElements, updateQRElement } = useQRContext();
  const [selectedCornerStyle, setSelectedCornerStyle] = useState('square');
  const [selectedDotStyle, setSelectedDotStyle] = useState('square');
  const [addIcon, setAddIcon] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState('none');

  const selectedElement = qrElements.find(el => el.id === selectedQRId);

  // Initialize values from selected element
  useEffect(() => {
    if (selectedElement) {
      setSelectedCornerStyle(selectedElement.cornerStyle || 'square');
      setSelectedDotStyle(selectedElement.dotStyle || 'square');
      setAddIcon(selectedElement.hasIcon || false);
      setSelectedIcon(selectedElement.iconType || 'none');
    }
  }, [selectedElement]);

  if (!isOpen) return null;

  // Corner styles data
  const cornerStyles = [
    { id: 'square', name: 'Square', icon: '⬜' },
    { id: 'rounded', name: 'Rounded', icon: '▢' },
    { id: 'extra-rounded', name: 'Extra Rounded', icon: '◻' },
    { id: 'circle', name: 'Circle', icon: '⬭' }
  ];

  // Dot styles data
  const dotStyles = [
    { id: 'square', name: 'Square', icon: '■' },
    { id: 'rounded', name: 'Rounded', icon: '▣' },
    { id: 'dots', name: 'Dots', icon: '●' },
    { id: 'classy', name: 'Classy', icon: '◆' },
    { id: 'classy-rounded', name: 'Classy Rounded', icon: '◈' }
  ];

  // Icon options
  const iconOptions = [
    { id: 'none', name: 'No Icon', icon: '🚫' },
    { id: 'scan-me', name: 'Scan Me', icon: 'SCAN' },
    { id: 'star', name: 'Star', icon: '⭐' },
    { id: 'play', name: 'Play', icon: '▶' },
    { id: 'qr', name: 'QR', icon: '⊞' },
    { id: 'heart', name: 'Heart', icon: '❤' },
    { id: 'check', name: 'Check', icon: '✓' },
    { id: 'wifi', name: 'WiFi', icon: '📶' }
  ];

  const handleCornerStyleChange = (styleId: string) => {
    setSelectedCornerStyle(styleId);
    if (selectedElement) {
      updateQRElement(selectedElement.id, { cornerStyle: styleId });
    }
  };

  const handleDotStyleChange = (styleId: string) => {
    setSelectedDotStyle(styleId);
    if (selectedElement) {
      updateQRElement(selectedElement.id, { dotStyle: styleId });
    }
  };

  const handleIconToggle = () => {
    const newAddIcon = !addIcon;
    setAddIcon(newAddIcon);
    if (selectedElement) {
      updateQRElement(selectedElement.id, { 
        hasIcon: newAddIcon,
        iconType: newAddIcon ? selectedIcon : 'none'
      });
    }
  };

  const handleIconChange = (iconId: string) => {
    setSelectedIcon(iconId);
    if (selectedElement) {
      updateQRElement(selectedElement.id, { 
        iconType: iconId,
        hasIcon: iconId !== 'none'
      });
    }
    if (iconId !== 'none') {
      setAddIcon(true);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Handle custom icon upload
      console.log('Custom icon uploaded:', file.name);
      // In a real implementation, you would upload the file and get a URL
      // For now, we'll just set a custom icon type
      setSelectedIcon('custom');
      setAddIcon(true);
      if (selectedElement) {
        updateQRElement(selectedElement.id, { 
          iconType: 'custom',
          hasIcon: true
        });
      }
    }
    // Clear the input
    event.target.value = '';
  };

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
            <QrCode className="w-5 h-5 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">QR Code Style</h2>
          </div>
        </div>
      </div>

      {/* Corners Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Corners</h3>
        <div className="grid grid-cols-4 gap-3">
          {cornerStyles.map((style) => (
            <button
              key={style.id}
              onClick={() => handleCornerStyleChange(style.id)}
              className={`relative aspect-square border-2 rounded-lg p-3 flex items-center justify-center hover:bg-gray-50 transition-all duration-200 ${
                selectedCornerStyle === style.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              title={style.name}
            >
              <span className="text-2xl">{style.icon}</span>
              
              {/* Selected indicator */}
              {selectedCornerStyle === style.id && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Dots Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Dots</h3>
        <div className="grid grid-cols-4 gap-3 mb-4">
          {dotStyles.slice(0, 4).map((style) => (
            <button
              key={style.id}
              onClick={() => handleDotStyleChange(style.id)}
              className={`relative aspect-square border-2 rounded-lg p-3 flex items-center justify-center hover:bg-gray-50 transition-all duration-200 ${
                selectedDotStyle === style.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              title={style.name}
            >
              <span className="text-2xl">{style.icon}</span>
              
              {/* Selected indicator */}
              {selectedDotStyle === style.id && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
        
        {/* Additional dot style */}
        <div className="grid grid-cols-4 gap-3">
          <button
            onClick={() => handleDotStyleChange('classy-rounded')}
            className={`relative aspect-square border-2 rounded-lg p-3 flex items-center justify-center hover:bg-gray-50 transition-all duration-200 ${
              selectedDotStyle === 'classy-rounded' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            title="Classy Rounded"
          >
            <span className="text-2xl">{dotStyles[4].icon}</span>
            
            {/* Selected indicator */}
            {selectedDotStyle === 'classy-rounded' && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Icon Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Icon</h3>
        
        {/* Add icon toggle */}
        <label className="flex items-center space-x-3 cursor-pointer mb-6">
          <input
            type="checkbox"
            checked={addIcon}
            onChange={handleIconToggle}
            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-gray-700 font-medium">Add icon to QR Code</span>
        </label>

        {/* Icon selection grid */}
        {addIcon && (
          <>
            <div className="grid grid-cols-4 gap-3 mb-4">
              {iconOptions.slice(0, 4).map((icon) => (
                <button
                  key={icon.id}
                  onClick={() => handleIconChange(icon.id)}
                  className={`relative aspect-square border-2 rounded-lg p-3 flex items-center justify-center hover:bg-gray-50 transition-all duration-200 ${
                    selectedIcon === icon.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  title={icon.name}
                >
                  {icon.id === 'scan-me' ? (
                    <div className="text-xs font-bold text-center leading-tight">
                      <div>SCAN</div>
                      <div>ME</div>
                    </div>
                  ) : (
                    <span className="text-xl">{icon.icon}</span>
                  )}
                  
                  {/* Selected indicator */}
                  {selectedIcon === icon.id && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Additional icon row */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              {iconOptions.slice(4).map((icon) => (
                <button
                  key={icon.id}
                  onClick={() => handleIconChange(icon.id)}
                  className={`relative aspect-square border-2 rounded-lg p-3 flex items-center justify-center hover:bg-gray-50 transition-all duration-200 ${
                    selectedIcon === icon.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  title={icon.name}
                >
                  <span className="text-xl">{icon.icon}</span>
                  
                  {/* Selected indicator */}
                  {selectedIcon === icon.id && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Upload Custom Icon */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="flex flex-col items-center space-y-2">
                  <Upload className="w-8 h-8 text-gray-400" />
                  <div className="text-sm font-medium text-gray-700">Upload logo or image</div>
                  <div className="text-xs text-gray-500">
                    Accepted file types: PNG, JPEG, or SVG. Files must be under 7MB
                  </div>
                </div>
              </label>
            </div>
          </>
        )}
      </div>

      {/* Apply Button */}
      <div className="pt-4 border-t border-gray-200">
        <button
          onClick={onClose}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          Apply Style
        </button>
      </div>
    </div>
  );
};

export default QRStylePanel;