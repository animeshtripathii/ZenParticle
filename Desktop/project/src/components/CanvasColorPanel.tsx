import React, { useState } from 'react';
import { Palette, RotateCcw, Maximize2, Minimize2 } from 'lucide-react';
import { useCanvasContext } from '../context/CanvasContext';

interface CanvasColorPanelProps {
  isActive?: boolean;
}

const CanvasColorPanel: React.FC<CanvasColorPanelProps> = ({ isActive = false }) => {
  const { canvasBackgroundColor, setCanvasBackgroundColor, canvasSize, setCanvasSize, canvasScale, setCanvasScale } = useCanvasContext();
  const [activeTab, setActiveTab] = useState<'swatches' | 'cmyk'>('swatches');
  const [customColor, setCustomColor] = useState(canvasBackgroundColor);
  const [cmykValues, setCmykValues] = useState({ c: 0, m: 0, y: 0, k: 0 });
  const [hsvValues, setHsvValues] = useState({ h: 0, s: 0, v: 100 });

  if (!isActive) return null;

  // Recent colors
  const recentColors = [
    '#FFFFFF', '#F8F9FA', '#E9ECEF', '#DEE2E6', '#CED4DA', '#ADB5BD'
  ];

  // Pre-set colors organized in rows
  const presetColors = [
    // Row 1 - Whites and Light Grays
    ['#FFFFFF', '#F8F9FA', '#F1F3F4', '#E8EAED', '#DADCE0', '#BDC1C6'],
    // Row 2 - Light Colors
    ['#E3F2FD', '#E8F5E8', '#FFF9E6', '#FCE4EC', '#F3E5F5', '#E0F2F1'],
    // Row 3 - Medium Colors  
    ['#BBDEFB', '#C8E6C9', '#FFF176', '#F8BBD9', '#E1BEE7', '#B2DFDB'],
    // Row 4 - Vibrant Colors
    ['#2196F3', '#4CAF50', '#FFEB3B', '#E91E63', '#9C27B0', '#009688'],
    // Row 5 - Dark Colors
    ['#1565C0', '#2E7D32', '#F57F17', '#AD1457', '#6A1B9A', '#00695C']
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

  const handleColorChange = (color: string) => {
    setCustomColor(color);
    setCanvasBackgroundColor(color);
    setHsvValues(hexToHsv(color));
    setCmykValues(hexToCmyk(color));
  };

  const resetToDefault = () => {
    const defaultColor = '#FFFFFF';
    handleColorChange(defaultColor);
  };

  const handleSizeChange = (dimension: 'width' | 'height', value: number) => {
    setCanvasSize(prev => ({
      ...prev,
      [dimension]: Math.max(200, Math.min(2000, value))
    }));
  };

  const resetCanvasSize = () => {
    setCanvasSize({ width: 688, height: 280 });
    setCanvasScale(100);
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 h-full overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Palette className="w-5 h-5 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Canvas Color</h2>
        </div>
        <p className="text-sm text-gray-600">
          Choose a background color for your canvas design area.
        </p>
      </div>

      {/* Current Color Preview */}
      <div className="mb-6">
        <div className="flex items-center space-x-3">
          <div 
            className="w-16 h-16 rounded-lg border-2 border-gray-300 shadow-sm"
            style={{ backgroundColor: canvasBackgroundColor }}
          />
          <div>
            <p className="text-sm font-medium text-gray-700">Current Color</p>
            <p className="text-xs text-gray-500 font-mono">{canvasBackgroundColor}</p>
          </div>
          <button
            onClick={resetToDefault}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Reset to white"
          >
            <RotateCcw className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Canvas Size Controls */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-medium text-gray-900">Canvas Size</h4>
          <button
            onClick={resetCanvasSize}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
            title="Reset to default size"
          >
            <RotateCcw className="w-3 h-3 text-gray-600" />
          </button>
        </div>
        
        <div className="space-y-3">
          {/* Width Control */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Width</label>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleSizeChange('width', canvasSize.width - 50)}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
              >
                <Minimize2 className="w-3 h-3 text-gray-600" />
              </button>
              <input
                type="number"
                value={canvasSize.width}
                onChange={(e) => handleSizeChange('width', Number(e.target.value))}
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                min="200"
                max="2000"
              />
              <button
                onClick={() => handleSizeChange('width', canvasSize.width + 50)}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
              >
                <Maximize2 className="w-3 h-3 text-gray-600" />
              </button>
              <span className="text-xs text-gray-500">px</span>
            </div>
          </div>
          
          {/* Height Control */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Height</label>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleSizeChange('height', canvasSize.height - 50)}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
              >
                <Minimize2 className="w-3 h-3 text-gray-600" />
              </button>
              <input
                type="number"
                value={canvasSize.height}
                onChange={(e) => handleSizeChange('height', Number(e.target.value))}
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                min="200"
                max="2000"
              />
              <button
                onClick={() => handleSizeChange('height', canvasSize.height + 50)}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
              >
                <Maximize2 className="w-3 h-3 text-gray-600" />
              </button>
              <span className="text-xs text-gray-500">px</span>
            </div>
          </div>
          
          {/* Scale Control */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Scale</label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="25"
                max="300"
                step="25"
                value={canvasScale}
                onChange={(e) => setCanvasScale(Number(e.target.value))}
                className="flex-1 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-xs text-gray-600 min-w-[40px]">{canvasScale}%</span>
            </div>
          </div>
          
          {/* Current Dimensions Display */}
          <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-200">
            Actual: {Math.round((canvasSize.width * canvasScale) / 100)} × {Math.round((canvasSize.height * canvasScale) / 100)} px
          </div>
        </div>
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
            
            const h = Math.floor(x * 360);
            const s = Math.floor((1 - y) * 100);
            const v = Math.floor(50 + (y - 0.5) * 50);
            
            const newColor = hsvToHex(h, s, v);
            handleColorChange(newColor);
          }}
        >
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

        {/* Color input */}
        <div className="flex items-center space-x-3">
          <input
            type="text"
            value={customColor}
            onChange={(e) => handleColorChange(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            placeholder="#FFFFFF"
          />
          <input
            type="color"
            value={customColor}
            onChange={(e) => handleColorChange(e.target.value)}
            className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
          />
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
                    canvasBackgroundColor === color ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-400'
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
                      className={`w-8 h-8 rounded-lg border-2 transition-all hover:scale-110 ${
                        canvasBackgroundColor === color ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-400'
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
    </div>
  );
};

export default CanvasColorPanel;