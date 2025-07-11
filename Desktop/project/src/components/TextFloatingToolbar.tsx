import React, { useRef, useEffect, useState } from 'react';
import { 
  Bold, 
  Italic, 
  Underline,
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  List,
  ListOrdered,
  Type,
  Minus,
  Plus,
  ChevronDown,
  MoreHorizontal,
  Copy,
  Trash2,
  RotateCw,
  Layers,
  Eye,
  Move3D,
  Palette,
  AlignHorizontalJustifyCenter,
  AlignVerticalJustifyCenter,
  X
} from 'lucide-react';
import { useTextContext } from '../context/TextContext';
import FloatingPanel, { SliderControl, ButtonGroupControl, DropdownControl } from './FloatingPanel';

interface TextFloatingToolbarProps {
  isVisible: boolean;
  selectedTextId: string | null;
}

const TextFloatingToolbar: React.FC<TextFloatingToolbarProps> = ({ 
  isVisible, 
  selectedTextId
}) => {
  const { textElements, updateTextElement, deleteTextElement, duplicateTextElement, selectTextElement } = useTextContext();
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const [showSizeDropdown, setShowSizeDropdown] = useState(false);
  const [showAlignmentDropdown, setShowAlignmentDropdown] = useState(false);
  const [showFormatDropdown, setShowFormatDropdown] = useState(false);
  const [showRotationDropdown, setShowRotationDropdown] = useState(false);
  
  // Text formatting states
  const [fontSize, setFontSize] = useState(46);
  const [fontFamily, setFontFamily] = useState('Arimo');
  const [textColor, setTextColor] = useState('#000000');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [alignment, setAlignment] = useState<'left' | 'center' | 'right'>('left');
  const [lineSpacing, setLineSpacing] = useState(1.4);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [opacity, setOpacity] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [textCase, setTextCase] = useState<'normal' | 'lowercase' | 'uppercase'>('normal');
  const [curveStyle, setCurveStyle] = useState<'none' | 'slight-up' | 'medium-up' | 'full-up' | 'slight-down' | 'full-down'>('none');
  
  // Refs for panel positioning
  const fontRef = useRef<HTMLButtonElement>(null);
  const sizeRef = useRef<HTMLButtonElement>(null);
  const colorRef = useRef<HTMLButtonElement>(null);
  const alignRef = useRef<HTMLButtonElement>(null);
  const spacingRef = useRef<HTMLButtonElement>(null);
  const opacityRef = useRef<HTMLButtonElement>(null);
  const layerRef = useRef<HTMLButtonElement>(null);
  const moreRef = useRef<HTMLButtonElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const formatRef = useRef<HTMLButtonElement>(null);
  const rotationRef = useRef<HTMLButtonElement>(null);

  const selectedElement = textElements.find(el => el.id === selectedTextId);

  const fonts = [
    'Arimo', 'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 
    'Verdana', 'Courier New', 'Roboto', 'Open Sans', 'Lato', 
    'Montserrat', 'Poppins', 'Inter', 'Source Sans Pro'
  ];

  const fontSizes = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 42, 46, 52, 60, 72, 84, 96];

  // Initialize values from selected element
  useEffect(() => {
    console.log('TextFloatingToolbar: selectedElement changed:', selectedElement?.id);
    if (selectedElement) {
      setFontSize(selectedElement.fontSize);
      setFontFamily(selectedElement.fontFamily);
      setTextColor(selectedElement.color);
      setIsBold(selectedElement.isBold);
      setIsItalic(selectedElement.isItalic || false);
      setIsUnderline(selectedElement.isUnderline || false);
      setAlignment(selectedElement.alignment);
      setLineSpacing(selectedElement.lineHeight || 1.4);
      setLetterSpacing(selectedElement.letterSpacing || 0);
      setOpacity(selectedElement.opacity || 100);
      setRotation(selectedElement.rotation || 0);
      setTextCase(selectedElement.textCase || 'normal');
      setCurveStyle(selectedElement.curveStyle || 'none');
    }
  }, [selectedElement]);

  if (!isVisible || !selectedElement) {
    console.log('TextFloatingToolbar: not visible', { isVisible, hasSelectedElement: !!selectedElement });
    return null;
  }

  console.log('TextFloatingToolbar: rendering for element', selectedElement.id);

  const openPanel = (panelName: string) => {
    setActivePanel(activePanel === panelName ? null : panelName);
    setShowMoreMenu(false);
    setShowFontDropdown(false);
    setShowSizeDropdown(false);
    setShowAlignmentDropdown(false);
    setShowFormatDropdown(false);
    setShowRotationDropdown(false);
  };

  const closePanel = () => {
    setActivePanel(null);
    setShowFontDropdown(false);
    setShowSizeDropdown(false);
    setShowAlignmentDropdown(false);
    setShowFormatDropdown(false);
    setShowRotationDropdown(false);
  };

  const closeFormatDropdown = () => {
    setShowFormatDropdown(false);
    // Ensure the text element remains selected after format changes
    if (selectedElement) {
      console.log('Keeping text element selected after format change:', selectedElement.id);
      // Re-trigger selection to ensure toolbar stays visible
      setTimeout(() => {
        selectTextElement(selectedElement.id);
      }, 10);
    }
  };
  const handleFontChange = (font: string) => {
    setFontFamily(font);
    if (selectedElement) {
      updateTextElement(selectedElement.id, { fontFamily: font });
    }
    setShowFontDropdown(false);
  };

  const handleSizeChange = (size: number) => {
    setFontSize(size);
    if (selectedElement) {
      updateTextElement(selectedElement.id, { fontSize: size });
    }
    setShowSizeDropdown(false);
  };

  const adjustFontSize = (increment: number) => {
    const newSize = Math.max(8, Math.min(96, fontSize + increment));
    setFontSize(newSize);
    if (selectedElement) {
      updateTextElement(selectedElement.id, { fontSize: newSize });
    }
  };

  const handleColorChange = (color: string) => {
    setTextColor(color);
    if (selectedElement) {
      updateTextElement(selectedElement.id, { color });
    }
  };

  const handleBoldToggle = () => {
    const newBold = !isBold;
    setIsBold(newBold);
    if (selectedElement) {
      updateTextElement(selectedElement.id, { isBold: newBold });
    }
  };

  const handleItalicToggle = () => {
    const newItalic = !isItalic;
    setIsItalic(newItalic);
    if (selectedElement) {
      updateTextElement(selectedElement.id, { isItalic: newItalic });
    }
  };

  const handleUnderlineToggle = () => {
    const newUnderline = !isUnderline;
    setIsUnderline(newUnderline);
    if (selectedElement) {
      updateTextElement(selectedElement.id, { isUnderline: newUnderline });
    }
  };

  const handleAlignmentChange = (newAlignment: 'left' | 'center' | 'right') => {
    setAlignment(newAlignment);
    if (selectedElement) {
      updateTextElement(selectedElement.id, { alignment: newAlignment });
    }
    setShowAlignmentDropdown(false);
  };

  const handleLineSpacingChange = (value: number) => {
    setLineSpacing(value);
    if (selectedElement) {
      updateTextElement(selectedElement.id, { lineHeight: value });
    }
  };

  const handleLetterSpacingChange = (value: number) => {
    setLetterSpacing(value);
    if (selectedElement) {
      updateTextElement(selectedElement.id, { letterSpacing: value });
    }
  };

  const handleOpacityChange = (value: number) => {
    setOpacity(value);
    if (selectedElement) {
      updateTextElement(selectedElement.id, { opacity: value });
    }
  };

  const handleRotationChange = (value: number) => {
    setRotation(value);
    if (selectedElement) {
      updateTextElement(selectedElement.id, { rotation: value });
    }
  };

  const handleDuplicate = () => {
    if (selectedElement) {
      duplicateTextElement(selectedElement.id);
    }
    setShowMoreMenu(false);
  };

  const handleDelete = () => {
    if (selectedElement) {
      deleteTextElement(selectedElement.id);
    }
    setShowMoreMenu(false);
  };

  const handleTextCaseChange = (newCase: 'normal' | 'lowercase' | 'uppercase') => {
    setTextCase(newCase);
    if (selectedElement) {
      updateTextElement(selectedElement.id, { textCase: newCase });
    }
    // Keep the element selected and toolbar visible
    closeFormatDropdown();
  };

  const handleCurveStyleChange = (newCurve: 'none' | 'slight-up' | 'medium-up' | 'full-up' | 'slight-down' | 'full-down') => {
    setCurveStyle(newCurve);
    if (selectedElement) {
      updateTextElement(selectedElement.id, { curveStyle: newCurve });
    }
    // Keep the element selected and toolbar visible
    closeFormatDropdown();
  };

  const handleCenterAlign = () => {
    if (selectedElement) {
      const canvasWidth = 688;
      const elementWidth = selectedElement.width || 200;
      const centerX = (canvasWidth - elementWidth) / 2;
      updateTextElement(selectedElement.id, { x: centerX });
    }
  };

  const handleMiddleAlign = () => {
    if (selectedElement) {
      const canvasHeight = 280;
      const elementHeight = selectedElement.height || 50;
      const centerY = (canvasHeight - elementHeight) / 2;
      updateTextElement(selectedElement.id, { y: centerY });
    }
  };

  const resetLineSpacing = () => handleLineSpacingChange(1.4);
  const resetLetterSpacing = () => handleLetterSpacingChange(0);

  return (
    <>
      <div 
        ref={toolbarRef}
        className="text-toolbar fixed bg-white rounded-2xl shadow-2xl border border-gray-200 z-50"
        style={{
          top: '120px',
          left: 'calc(50% + 4cm)',
          transform: 'translateX(-50%)',
          pointerEvents: 'auto'
        }}
      >
        {/* Main Toolbar */}
        <div className="flex items-center">
          {/* Font Family */}
          <div className="flex items-center px-3 py-2 border-r border-gray-200 relative">
            <button
              ref={fontRef}
              onClick={() => setShowFontDropdown(!showFontDropdown)}
              className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors min-w-[120px]"
            >
              <span className="text-sm font-medium" style={{ fontFamily }}>{fontFamily}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            
            {showFontDropdown && (
              <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-10 min-w-[140px] max-h-48 overflow-y-auto">
                {fonts.map((font) => (
                  <button
                    key={font}
                    onClick={() => handleFontChange(font)}
                    className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                    style={{ fontFamily: font }}
                  >
                    {font}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Font Size Controls */}
          <div className="flex items-center px-3 py-2 border-r border-gray-200 space-x-1">
            <button
              onClick={() => adjustFontSize(-2)}
              className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
              title="Decrease font size"
            >
              <Minus className="w-4 h-4" />
            </button>

            <div className="relative">
              <button
                ref={sizeRef}
                onClick={() => setShowSizeDropdown(!showSizeDropdown)}
                className="flex items-center space-x-1 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors min-w-[60px]"
              >
                <span className="text-sm font-medium">{fontSize}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              
              {showSizeDropdown && (
                <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-10 max-h-48 overflow-y-auto">
                  {fontSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => handleSizeChange(size)}
                      className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                    >
                      {size}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => adjustFontSize(2)}
              className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
              title="Increase font size"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Color Picker */}
          <div className="flex items-center px-3 py-2 border-r border-gray-200">
            <button
              ref={colorRef}
              onClick={() => openPanel('color')}
              className="w-8 h-8 rounded-full border-2 border-gray-300 cursor-pointer hover:border-gray-400 transition-colors"
              style={{ backgroundColor: textColor }}
              title="Text Color"
            />
            
            <FloatingPanel
              isOpen={activePanel === 'color'}
              onClose={closePanel}
              title="Text Color"
              anchorRef={colorRef}
            >
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={textColor}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="#000000"
                  />
                </div>
              </div>
            </FloatingPanel>
          </div>

          {/* Text Formatting */}
          <div className="flex items-center px-2 py-2 border-r border-gray-200 space-x-1">
            <button
              onClick={handleBoldToggle}
              className={`p-2 rounded-lg transition-colors ${
                isBold ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-50'
              }`}
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </button>

            <button
              onClick={handleItalicToggle}
              className={`p-2 rounded-lg transition-colors ${
                isItalic ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-50'
              }`}
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </button>

            <button
              onClick={handleUnderlineToggle}
              className={`p-2 rounded-lg transition-colors ${
                isUnderline ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-50'
              }`}
              title="Underline"
            >
              <Underline className="w-4 h-4" />
            </button>
          </div>

          {/* Alignment */}
          <div className="flex items-center px-2 py-2 border-r border-gray-200 space-x-1">
            <button
              onClick={() => handleAlignmentChange('left')}
              className={`p-2 rounded-lg transition-colors ${
                alignment === 'left' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-50'
              }`}
              title="Align Left"
            >
              <AlignLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleAlignmentChange('center')}
              className={`p-2 rounded-lg transition-colors ${
                alignment === 'center' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-50'
              }`}
              title="Align Center"
            >
              <AlignCenter className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleAlignmentChange('right')}
              className={`p-2 rounded-lg transition-colors ${
                alignment === 'right' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-50'
              }`}
              title="Align Right"
            >
              <AlignRight className="w-4 h-4" />
            </button>
          </div>

          {/* Text Effects */}
          <div className="flex items-center px-2 py-2 border-r border-gray-200 space-x-1">
            <div className="relative">
              <button
                ref={formatRef}
                onClick={() => setShowFormatDropdown(!showFormatDropdown)}
                className={`px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                  showFormatDropdown ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                }`}
                title="Format Options"
              >
                Format
              </button>
              
              {showFormatDropdown && (
                <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-10 w-80 p-4">
                  {/* Case Section */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Case</h4>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleTextCaseChange('normal')}
                        className={`flex items-center justify-center w-12 h-10 border-2 rounded-lg transition-all ${
                          textCase === 'normal' 
                            ? 'border-blue-500 bg-blue-50 text-blue-600' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        title="Normal Case"
                      >
                        <span className="text-sm font-medium">Aa</span>
                      </button>
                      
                      <button
                        onClick={() => handleTextCaseChange('lowercase')}
                        className={`flex items-center justify-center w-12 h-10 border-2 rounded-lg transition-all ${
                          textCase === 'lowercase' 
                            ? 'border-blue-500 bg-blue-50 text-blue-600' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        title="Lowercase"
                      >
                        <span className="text-sm">a↓</span>
                      </button>
                      
                      <button
                        onClick={() => handleTextCaseChange('uppercase')}
                        className={`flex items-center justify-center w-12 h-10 border-2 rounded-lg transition-all ${
                          textCase === 'uppercase' 
                            ? 'border-blue-500 bg-blue-50 text-blue-600' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        title="Uppercase"
                      >
                        <span className="text-sm font-bold">A↑</span>
                      </button>
                    </div>
                  </div>

                  {/* Curve Text Section */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Curve text</h4>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleCurveStyleChange('none')}
                        className={`flex items-center justify-center w-12 h-10 border-2 rounded-lg transition-all ${
                          curveStyle === 'none' 
                            ? 'border-blue-500 bg-blue-50 text-blue-600' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        title="No Curve"
                      >
                        <div className="w-6 h-0.5 bg-current"></div>
                      </button>
                      
                      <button
                        onClick={() => handleCurveStyleChange('slight-up')}
                        className={`flex items-center justify-center w-12 h-10 border-2 rounded-lg transition-all ${
                          curveStyle === 'slight-up' 
                            ? 'border-blue-500 bg-blue-50 text-blue-600' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        title="Slight Curve Up"
                      >
                        <svg width="24" height="16" viewBox="0 0 24 16" className="text-current">
                          <path d="M2 12 Q12 4 22 12" stroke="currentColor" strokeWidth="2" fill="none"/>
                        </svg>
                      </button>
                      
                      <button
                        onClick={() => handleCurveStyleChange('medium-up')}
                        className={`flex items-center justify-center w-12 h-10 border-2 rounded-lg transition-all ${
                          curveStyle === 'medium-up' 
                            ? 'border-blue-500 bg-blue-50 text-blue-600' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        title="Medium Curve Up"
                      >
                        <svg width="24" height="16" viewBox="0 0 24 16" className="text-current">
                          <path d="M2 14 Q12 2 22 14" stroke="currentColor" strokeWidth="2" fill="none"/>
                        </svg>
                      </button>
                      
                      <button
                        onClick={() => handleCurveStyleChange('full-up')}
                        className={`flex items-center justify-center w-12 h-10 border-2 rounded-lg transition-all ${
                          curveStyle === 'full-up' 
                            ? 'border-blue-500 bg-blue-50 text-blue-600' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        title="Full Curve Up"
                      >
                        <svg width="24" height="16" viewBox="0 0 24 16" className="text-current">
                          <path d="M2 15 Q12 1 22 15" stroke="currentColor" strokeWidth="2" fill="none"/>
                        </svg>
                      </button>
                      
                      <button
                        onClick={() => handleCurveStyleChange('slight-down')}
                        className={`flex items-center justify-center w-12 h-10 border-2 rounded-lg transition-all ${
                          curveStyle === 'slight-down' 
                            ? 'border-blue-500 bg-blue-50 text-blue-600' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        title="Slight Curve Down"
                      >
                        <svg width="24" height="16" viewBox="0 0 24 16" className="text-current">
                          <path d="M2 4 Q12 12 22 4" stroke="currentColor" strokeWidth="2" fill="none"/>
                        </svg>
                      </button>
                      
                      <button
                        onClick={() => handleCurveStyleChange('full-down')}
                        className={`flex items-center justify-center w-12 h-10 border-2 rounded-lg transition-all ${
                          curveStyle === 'full-down' 
                            ? 'border-blue-500 bg-blue-50 text-blue-600' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        title="Full Curve Down"
                      >
                        <svg width="24" height="16" viewBox="0 0 24 16" className="text-current">
                          <path d="M2 1 Q12 15 22 1" stroke="currentColor" strokeWidth="2" fill="none"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Advanced Controls */}
          <div className="flex items-center px-2 py-2 space-x-1">
            <button
              ref={spacingRef}
              onClick={() => openPanel('spacing')}
              className={`p-2 rounded-lg transition-colors ${
                activePanel === 'spacing' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
              }`}
              title="Spacing"
            >
              <Layers className="w-4 h-4" />
            </button>
            
            <FloatingPanel
              isOpen={activePanel === 'spacing'}
              onClose={closePanel}
              title="Text Spacing"
              anchorRef={spacingRef}
            >
              <div className="space-y-6 w-80">
                <SliderControl
                  label="Line spacing"
                  value={lineSpacing}
                  min={0.5}
                  max={3}
                  step={0.1}
                  onChange={handleLineSpacingChange}
                  onReset={resetLineSpacing}
                  defaultValue={1.4}
                />
                
                <SliderControl
                  label="Letter spacing"
                  value={letterSpacing}
                  min={-5}
                  max={10}
                  step={0.5}
                  unit="px"
                  onChange={handleLetterSpacingChange}
                  onReset={resetLetterSpacing}
                  defaultValue={0}
                />
              </div>
            </FloatingPanel>

            <button
              ref={opacityRef}
              onClick={() => openPanel('opacity')}
              className={`p-2 rounded-lg transition-colors ${
                activePanel === 'opacity' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
              }`}
              title="Opacity"
            >
              <Eye className="w-4 h-4" />
            </button>
            
            <FloatingPanel
              isOpen={activePanel === 'opacity'}
              onClose={closePanel}
              title="Opacity"
              anchorRef={opacityRef}
            >
              <SliderControl
                label="Transparency"
                value={opacity}
                min={0}
                max={100}
                step={1}
                unit="%"
                onChange={handleOpacityChange}
                onReset={() => handleOpacityChange(100)}
                defaultValue={100}
              />
            </FloatingPanel>

            {/* Rotation Dropdown */}
            <div className="relative">
              <button
                ref={rotationRef}
                onClick={() => setShowRotationDropdown(!showRotationDropdown)}
                className={`flex items-center space-x-1 p-2 rounded-lg transition-colors ${
                  showRotationDropdown ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                }`}
                title="Rotation"
              >
                <RotateCw className="w-4 h-4" />
                <ChevronDown className="w-3 h-3" />
              </button>
              
              {showRotationDropdown && (
                <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-10 w-64 p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Rotation</h4>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="range"
                        min="0"
                        max="360"
                        value={rotation}
                        onChange={(e) => handleRotationChange(Number(e.target.value))}
                        className="flex-1 h-3 bg-gradient-to-r from-blue-200 via-blue-400 to-blue-600 rounded-lg appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, #dbeafe 0%, #60a5fa 50%, #2563eb 100%)`
                        }}
                      />
                      <input
                        type="number"
                        value={rotation}
                        onChange={(e) => handleRotationChange(Number(e.target.value))}
                        className="w-20 px-3 py-2 text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        max="360"
                      />
                      <span className="text-sm text-gray-500">°</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Align Dropdown */}
            <div className="relative">
              <button
                ref={alignRef}
                onClick={() => setShowAlignmentDropdown(!showAlignmentDropdown)}
                className={`flex items-center space-x-1 p-2 rounded-lg transition-colors ${
                  showAlignmentDropdown ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                }`}
                title="Align to Canvas"
              >
                <AlignHorizontalJustifyCenter className="w-4 h-4" />
                <ChevronDown className="w-3 h-3" />
              </button>
              
              {showAlignmentDropdown && (
                <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-10 w-48">
                  <button
                    onClick={handleCenterAlign}
                    className="flex items-center space-x-3 w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors"
                  >
                    <AlignHorizontalJustifyCenter className="w-4 h-4" />
                    <span>Center</span>
                  </button>
                  
                  <button
                    onClick={handleMiddleAlign}
                    className="flex items-center space-x-3 w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors"
                  >
                    <AlignVerticalJustifyCenter className="w-4 h-4" />
                    <span>Middle</span>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleDuplicate}
              className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
              title="Duplicate"
            >
              <Copy className="w-4 h-4" />
            </button>

            <button
              onClick={handleDelete}
              className="p-2 hover:bg-gray-50 rounded-lg transition-colors text-red-500"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <div className="relative">
              <button 
                ref={moreRef}
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className={`p-2 rounded-lg transition-colors ${
                  showMoreMenu ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                }`}
                title="More Options"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
              
              {showMoreMenu && (
                <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-10 min-w-[140px]">
                  <button 
                    onClick={handleDuplicate}
                    className="flex items-center space-x-3 w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Duplicate</span>
                  </button>
                  
                  <button 
                    onClick={handleDelete}
                    className="flex items-center space-x-3 w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close dropdowns and menus */}
      {(showFontDropdown || showSizeDropdown || showAlignmentDropdown || showMoreMenu || showFormatDropdown || showRotationDropdown) && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowFontDropdown(false);
            setShowSizeDropdown(false);
            setShowAlignmentDropdown(false);
            setShowMoreMenu(false);
            closeFormatDropdown();
            setShowRotationDropdown(false);
          }}
        />
      )}
    </>
  );
};

export default TextFloatingToolbar;