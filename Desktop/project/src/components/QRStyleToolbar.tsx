import React, { useState, useRef, useEffect } from 'react';
import { X, Check, QrCode } from 'lucide-react';
import { useQRContext } from '../context/QRContext';

interface QRStyleToolbarProps {
  isVisible: boolean;
  onClose: () => void;
  selectedQRId: string | null;
}

const QRStyleToolbar: React.FC<QRStyleToolbarProps> = ({ 
  isVisible, 
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

  if (!isVisible) return null;

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

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-20 z-40"
        onClick={onClose}
      />
      
      {/* QR Style Toolbar */}
      <div 
        className="fixed bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 p-6"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90vw',
          maxWidth: '1000px',
          maxHeight: '80vh',
          overflowY: 'auto'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <QrCode className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">QR Code Style</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Style Options Container */}
        <div className="space-y-8">
          {/* Corners Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Corners</h3>
            <div className="flex space-x-4">
              {cornerStyles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => handleCornerStyleChange(style.id)}
                  className={`relative w-20 h-20 border-2 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-all duration-200 ${
                    selectedCornerStyle === style.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  title={style.name}
                >
                  <span className="text-2xl">{style.icon}</span>
                  
                  {/* Selected indicator */}
                  {selectedCornerStyle === style.id && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Dots Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Dots</h3>
            <div className="flex space-x-4">
              {dotStyles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => handleDotStyleChange(style.id)}
                  className={`relative w-20 h-20 border-2 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-all duration-200 ${
                    selectedDotStyle === style.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  title={style.name}
                >
                  <span className="text-2xl">{style.icon}</span>
                  
                  {/* Selected indicator */}
                  {selectedDotStyle === style.id && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Icon Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Icon</h3>
              
              {/* Add icon toggle */}
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={addIcon}
                  onChange={handleIconToggle}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700 font-medium">Add icon to QR Code</span>
              </label>
            </div>

            {/* Icon selection */}
            <div className="flex space-x-4 flex-wrap gap-y-4">
              {iconOptions.map((icon) => (
                <button
                  key={icon.id}
                  onClick={() => handleIconChange(icon.id)}
                  disabled={!addIcon && icon.id !== 'none'}
                  className={`relative w-20 h-20 border-2 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-all duration-200 ${
                    selectedIcon === icon.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  } ${
                    !addIcon && icon.id !== 'none' ? 'opacity-50 cursor-not-allowed' : ''
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
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Apply Style
          </button>
        </div>
      </div>
    </>
  );
};

export default QRStyleToolbar;