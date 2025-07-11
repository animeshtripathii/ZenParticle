import React, { useState, useEffect } from 'react';
import { X, ArrowLeft, Palette, RotateCcw, Pipette } from 'lucide-react';
import { useQRContext } from '../context/QRContext';

// Utility function to convert HSL to hex
const hslToHex = (h: number, s: number, l: number): string => {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

interface QRFillColorPanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedQRId: string | null;
  currentColor: string;
}

const QRFillColorPanel: React.FC<QRFillColorPanelProps> = ({ 
  isOpen, 
  onClose,
  selectedQRId,
  currentColor
}) => {
  const { qrElements, updateQRElement } = useQRContext();
  const [selectedColor, setSelectedColor] = useState(currentColor);
  const [customColor, setCustomColor] = useState(currentColor);
  const [activeTab, setActiveTab] = useState<'swatches' | 'cmyk'>('swatches');
  const [cmykValues, setCmykValues] = useState({ c: 0, m: 0, y: 0, k: 0 });
  const [hsvValues, setHsvValues] = useState({ h: 0, s: 100, v: 100 });

  const selectedElement = qrElements.find(el => el.id === selectedQRId);

  // Initialize color from selected element
  useEffect(() => {
    if (selectedElement) {
      setSelectedColor(selectedElement.foregroundColor || '#000000');
      setCustomColor(selectedElement.foregroundColor || '#000000');
      const hsv = hexToHsv(selectedElement.foregroundColor || '#000000');
      const cmyk = hexToCmyk(selectedElement.foregroundColor || '#000000');
      setHsvValues(hsv);
      setCmykValues(cmyk);
    }
  }, [selectedElement]);

  if (!isOpen) return null;

  // Recent colors (you could store these in localStorage)
  const recentColors = [
    '#FF0000', '#DC143C', '#8B0000', '#B22222', '#CD5C5C', '#F08080'
  ];

  // Color conversion utilities
  const hexToHsv = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    
    let h = 0;
    if (diff !== 0) {
      if (max === r) h = ((g - b) / diff) % 6;
      else if (max === g) h = (b - r) / diff + 2;
      else h = (r - g) / diff + 4;
    }
    h = Math.round(h * 60);
    if (h < 0) h += 360;
    
    const s = Math.round((max === 0 ? 0 : diff / max) * 100);
    const v = Math.round(max * 100);
    
    return { h, s, v };
  };

  const hsvToHex = (h: number, s: number, v: number) => {
    s /= 100;
    v /= 100;
    
    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;
    
    let r = 0, g = 0, b = 0;
    
    if (h >= 0 && h < 60) {
      r = c; g = x; b = 0;
    } else if (h >= 60 && h < 120) {
      r = x; g = c; b = 0;
    } else if (h >= 120 && h < 180) {
      r = 0; g = c; b = x;
    } else if (h >= 180 && h < 240) {
      r = 0; g = x; b = c;
    } else if (h >= 240 && h < 300) {
      r = x; g = 0; b = c;
    } else if (h >= 300 && h < 360) {
      r = c; g = 0; b = x;
    }
    
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  const hexToCmyk = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    
    const k = 1 - Math.max(r, g, b);
    const c = k === 1 ? 0 : (1 - r - k) / (1 - k);
    const m = k === 1 ? 0 : (1 - g - k) / (1 - k);
    const y = k === 1 ? 0 : (1 - b - k) / (1 - k);
    
    return {
      c: Math.round(c * 100),
      m: Math.round(m * 100),
      y: Math.round(y * 100),
      k: Math.round(k * 100)
    };
  };

  const cmykToHex = (c: number, m: number, y: number, k: number) => {
    c /= 100;
    m /= 100;
    y /= 100;
    k /= 100;
    
    const r = Math.round(255 * (1 - c) * (1 - k));
    const g = Math.round(255 * (1 - m) * (1 - k));
    const b = Math.round(255 * (1 - y) * (1 - k));
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  // Pre-set colors organized in rows
  const presetColors = [
    // Row 1 - Whites and Grays
    ['#FFFFFF', '#F5F5F5', '#DCDCDC', '#C0C0C0', '#A9A9A9', '#808080'],
    // Row 2 - Light Colors
    ['#87CEEB', '#98FB98', '#F0E68C', '#DDA0DD', '#F0A0A0', '#FFB6C1'],
    // Row 3 - Medium Colors  
    ['#4682B4', '#32CD32', '#FFD700', '#9370DB', '#CD5C5C', '#FF69B4'],
    // Row 4 - Dark Colors
    ['#191970', '#006400', '#B8860B', '#4B0082', '#8B0000', '#C71585'],
    // Row 5 - Very Dark
    ['#000080', '#013220', '#8B4513', '#2F4F4F', '#800000', '#000000']
  ];

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    setCustomColor(color);
    setHsvValues(hexToHsv(color));
    setCmykValues(hexToCmyk(color));
    if (selectedElement) {
      updateQRElement(selectedElement.id, { foregroundColor: color });
    }
  };

  const handleCustomColorChange = (color: string) => {
    setCustomColor(color);
    setSelectedColor(color);
    setHsvValues(hexToHsv(color));
    setCmykValues(hexToCmyk(color));
    if (selectedElement) {
      updateQRElement(selectedElement.id, { foregroundColor: color });
    }
  };

  const handleInvertColors = () => {
    if (selectedElement) {
      const currentFg = selectedElement.foregroundColor || '#000000';
      const currentBg = selectedElement.backgroundColor || '#FFFFFF';
      
      // Swap foreground and background colors
      updateQRElement(selectedElement.id, { 
        foregroundColor: currentBg,
        backgroundColor: currentFg
      });
      
      setSelectedColor(currentBg);
      setCustomColor(currentBg);
    }
  };

  const resetToDefault = () => {
    const defaultColor = '#000000';
    handleColorChange(defaultColor);
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
          <h2 className="text-2xl font-bold text-gray-900">Color</h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Invert Colors Button */}
      <div className="mb-6">
        <button
          onClick={handleInvertColors}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors w-full justify-center"
        >
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 bg-black rounded-full border border-gray-300"></div>
            <X className="w-3 h-3 text-gray-500" />
          </div>
          <span className="font-medium">Invert</span>
        </button>
      </div>

      {/* Color Gradient Picker */}
      <div className="mb-6">
        <div 
          className="w-full h-32 rounded-lg mb-4 relative cursor-crosshair border border-gray-200"
          style={{
            background: `linear-gradient(to bottom, 
              rgba(255,255,255,1) 0%, 
              rgba(255,255,255,0) 50%, 
              rgba(0,0,0,0) 50%, 
              rgba(0,0,0,1) 100%),
              linear-gradient(to right, 
              rgba(255,0,0,1) 0%, 
              rgba(255,255,0,1) 17%, 
              rgba(0,255,0,1) 33%, 
              rgba(0,255,255,1) 50%, 
              rgba(0,0,255,1) 67%, 
              rgba(255,0,255,1) 83%, 
              rgba(255,0,0,1) 100%)`
          }}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            
            // Calculate HSV values
            const h = Math.floor(x * 360);
            const s = Math.floor((1 - y) * 100);
            const v = Math.floor(50 + (y - 0.5) * 50);
            
            const newColor = hsvToHex(h, s, v);
            handleColorChange(newColor);
          }}
          onClick={(e) => {
            // Simple color picking - in a real implementation you'd calculate the exact color
            const rect = e.currentTarget.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            
            // Simple hue calculation based on x position
            const hue = Math.floor(x * 360);
            const saturation = Math.floor((1 - y) * 100);
            const lightness = Math.floor(50 + (y - 0.5) * 50);
            
            const color = hslToHex(hue, saturation, lightness);
            handleColorChange(color);
          }}
        >
          {/* Color picker circle indicator */}
          <div 
            className="absolute w-4 h-4 border-2 border-white rounded-full shadow-lg pointer-events-none"
            style={{ 
              left: `${(hsvValues.h / 360) * 100}%`, 
              top: `${100 - hsvValues.s}%`,
              transform: 'translate(-50%, -50%)'
            }}
          />
        </div>

        {/* Hue slider */}
        <div 
          className="w-full h-4 rounded-lg mb-4 relative cursor-pointer border border-gray-200"
          style={{
            background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)'
          }}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const h = Math.floor(x * 360);
            const newColor = hsvToHex(h, hsvValues.s, hsvValues.v);
            handleColorChange(newColor);
          }}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const hue = Math.floor(x * 360);
            const color = hslToHex(hue, 100, 50);
            handleColorChange(color);
          }}
        >
          <div 
            className="absolute w-4 h-4 border-2 border-white rounded-full shadow-lg pointer-events-none"
            style={{ 
              left: `${(hsvValues.h / 360) * 100}%`, 
              top: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          />
        </div>

        {/* Color input and eyedropper */}
        <div className="flex items-center space-x-3">
          <input
            type="text"
            value={customColor}
            onChange={(e) => handleCustomColorChange(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            placeholder="#000000"
          />
          <input
            type="color"
            value={customColor}
            onChange={(e) => {
              const newColor = e.target.value;
              handleCustomColorChange(newColor);
            }}
            className="w-10 h-10 border border-gray-300 rounded-lg cursor-pointer"
          />
          <button 
            onClick={resetToDefault}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title="Reset to default"
          >
            <RotateCcw className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex mb-4 border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('swatches')}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === 'swatches' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Swatches
        </button>
        <button 
          onClick={() => setActiveTab('cmyk')}
          className={`px-4 py-2 font-medium text-sm transition-colors ml-6 ${
            activeTab === 'cmyk' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          CMYK
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'swatches' ? (
        <div>
          {/* Recent colors */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Recent colors</h4>
            <div className="flex space-x-2">
              {recentColors.map((color, index) => (
                <button
                  key={index}
                  onClick={() => handleColorChange(color)}
                  className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                    selectedColor === color ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Pre-set colors */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Pre-set colors</h4>
            <div className="space-y-2">
              {presetColors.map((row, rowIndex) => (
                <div key={rowIndex} className="flex space-x-2">
                  {row.map((color, colorIndex) => (
                    <button
                      key={colorIndex}
                      onClick={() => handleColorChange(color)}
                      className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                        selectedColor === color ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div>
          {/* CMYK Controls */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cyan</label>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={cmykValues.c}
                  onChange={(e) => {
                    const newCmyk = { ...cmykValues, c: Number(e.target.value) };
                    setCmykValues(newCmyk);
                    const newColor = cmykToHex(newCmyk.c, newCmyk.m, newCmyk.y, newCmyk.k);
                    handleColorChange(newColor);
                  }}
                  className="flex-1 h-2 bg-gradient-to-r from-white to-cyan-500 rounded-lg appearance-none cursor-pointer"
                />
                <input
                  type="number"
                  value={cmykValues.c}
                  onChange={(e) => {
                    const newCmyk = { ...cmykValues, c: Number(e.target.value) };
                    setCmykValues(newCmyk);
                    const newColor = cmykToHex(newCmyk.c, newCmyk.m, newCmyk.y, newCmyk.k);
                    handleColorChange(newColor);
                  }}
                  className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
                  min="0"
                  max="100"
                />
                <span className="text-sm text-gray-500">%</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Magenta</label>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={cmykValues.m}
                  onChange={(e) => {
                    const newCmyk = { ...cmykValues, m: Number(e.target.value) };
                    setCmykValues(newCmyk);
                    const newColor = cmykToHex(newCmyk.c, newCmyk.m, newCmyk.y, newCmyk.k);
                    handleColorChange(newColor);
                  }}
                  className="flex-1 h-2 bg-gradient-to-r from-white to-pink-500 rounded-lg appearance-none cursor-pointer"
                />
                <input
                  type="number"
                  value={cmykValues.m}
                  onChange={(e) => {
                    const newCmyk = { ...cmykValues, m: Number(e.target.value) };
                    setCmykValues(newCmyk);
                    const newColor = cmykToHex(newCmyk.c, newCmyk.m, newCmyk.y, newCmyk.k);
                    handleColorChange(newColor);
                  }}
                  className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
                  min="0"
                  max="100"
                />
                <span className="text-sm text-gray-500">%</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Yellow</label>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={cmykValues.y}
                  onChange={(e) => {
                    const newCmyk = { ...cmykValues, y: Number(e.target.value) };
                    setCmykValues(newCmyk);
                    const newColor = cmykToHex(newCmyk.c, newCmyk.m, newCmyk.y, newCmyk.k);
                    handleColorChange(newColor);
                  }}
                  className="flex-1 h-2 bg-gradient-to-r from-white to-yellow-500 rounded-lg appearance-none cursor-pointer"
                />
                <input
                  type="number"
                  value={cmykValues.y}
                  onChange={(e) => {
                    const newCmyk = { ...cmykValues, y: Number(e.target.value) };
                    setCmykValues(newCmyk);
                    const newColor = cmykToHex(newCmyk.c, newCmyk.m, newCmyk.y, newCmyk.k);
                    handleColorChange(newColor);
                  }}
                  className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
                  min="0"
                  max="100"
                />
                <span className="text-sm text-gray-500">%</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Black</label>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={cmykValues.k}
                  onChange={(e) => {
                    const newCmyk = { ...cmykValues, k: Number(e.target.value) };
                    setCmykValues(newCmyk);
                    const newColor = cmykToHex(newCmyk.c, newCmyk.m, newCmyk.y, newCmyk.k);
                    handleColorChange(newColor);
                  }}
                  className="flex-1 h-2 bg-gradient-to-r from-white to-black rounded-lg appearance-none cursor-pointer"
                />
                <input
                  type="number"
                  value={cmykValues.k}
                  onChange={(e) => {
                    const newCmyk = { ...cmykValues, k: Number(e.target.value) };
                    setCmykValues(newCmyk);
                    const newColor = cmykToHex(newCmyk.c, newCmyk.m, newCmyk.y, newCmyk.k);
                    handleColorChange(newColor);
                  }}
                  className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
                  min="0"
                  max="100"
                />
                <span className="text-sm text-gray-500">%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Apply Button */}
      <div className="pt-4 border-t border-gray-200">
        <button
          onClick={onClose}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          Apply Color
        </button>
      </div>
    </div>
  );
};

export default QRFillColorPanel;