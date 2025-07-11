import React, { useState, useEffect } from 'react';
import { 
  Bold, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  List, 
  ListOrdered,
  Type,
  Palette,
  Minus,
  Plus,
  ChevronDown,
  MoreHorizontal,
  Copy,
  Trash2,
  Move3D,
  Layers,
  Eye
} from 'lucide-react';
import { useTextContext } from '../context/TextContext';

interface TextPanelProps {
  isActive?: boolean;
}

const TextPanel: React.FC<TextPanelProps> = ({ isActive = false }) => {
  const { 
    textElements, 
    selectedTextId, 
    addTextElement, 
    updateTextElement, 
    selectTextElement,
    deleteTextElement 
  } = useTextContext();
  
  const [textValue, setTextValue] = useState('');
  const [showToolbar, setShowToolbar] = useState(false);
  const [fontSize, setFontSize] = useState(46);
  const [selectedFont, setSelectedFont] = useState('Arimo');
  const [isBold, setIsBold] = useState(false);
  const [alignment, setAlignment] = useState<'left' | 'center' | 'right'>('left');
  const [textColor, setTextColor] = useState('#000000');
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const [showSizeDropdown, setShowSizeDropdown] = useState(false);

  const fonts = ['Arimo', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins'];
  const fontSizes = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 42, 46, 52, 60, 72];

  const selectedElement = textElements.find(el => el.id === selectedTextId);

  // Update local state when a text element is selected
  useEffect(() => {
    if (selectedElement) {
      setTextValue(selectedElement.text);
      setFontSize(selectedElement.fontSize);
      setSelectedFont(selectedElement.fontFamily);
      setIsBold(selectedElement.isBold);
      setAlignment(selectedElement.alignment);
      setTextColor(selectedElement.color);
      setShowToolbar(true);
    } else {
      setShowToolbar(false);
    }
  }, [selectedElement]);

  const handleTextFocus = () => {
    if (selectedElement) {
      setShowToolbar(true);
    }
  };

  const handleTextBlur = () => {
    // Keep toolbar open if user is interacting with it
    setTimeout(() => {
      if (!document.activeElement?.closest('.text-toolbar')) {
        if (!selectedElement) {
          setShowToolbar(false);
        }
      }
    }, 100);
  };

  const handleTextChange = (value: string) => {
    setTextValue(value);
    if (selectedElement) {
      updateTextElement(selectedElement.id, { text: value });
    }
  };

  const handleNewTextField = () => {
    addTextElement(textValue || 'Your Text Here');
    setTextValue('');
  };

  const adjustFontSize = (increment: number) => {
    const newSize = Math.max(8, Math.min(72, fontSize + increment));
    setFontSize(newSize);
    if (selectedElement) {
      updateTextElement(selectedElement.id, { fontSize: newSize });
    }
  };

  const handleFontChange = (font: string) => {
    setSelectedFont(font);
    if (selectedElement) {
      updateTextElement(selectedElement.id, { fontFamily: font });
    }
  };

  const handleSizeChange = (size: number) => {
    setFontSize(size);
    if (selectedElement) {
      updateTextElement(selectedElement.id, { fontSize: size });
    }
  };

  const handleBoldToggle = () => {
    const newBold = !isBold;
    setIsBold(newBold);
    if (selectedElement) {
      updateTextElement(selectedElement.id, { isBold: newBold });
    }
  };

  const handleAlignmentChange = (newAlignment: 'left' | 'center' | 'right') => {
    setAlignment(newAlignment);
    if (selectedElement) {
      updateTextElement(selectedElement.id, { alignment: newAlignment });
    }
  };

  const handleColorChange = (color: string) => {
    setTextColor(color);
    if (selectedElement) {
      updateTextElement(selectedElement.id, { color });
    }
  };

  const handleDeleteText = () => {
    if (selectedElement) {
      deleteTextElement(selectedElement.id);
      setTextValue('');
    }
  };

  return (
    <div className="relative">
      {/* Main Text Panel Card */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Text</h2>
        
        <p className="text-gray-600 text-sm mb-6 leading-relaxed">
          {selectedElement 
            ? "Edit the selected text below, or double-click on text in your design to edit directly."
            : "Edit your text below, or click on the field you'd like to edit directly on your design."
          }
        </p>

        <div className="mb-6">
          <input
            type="text"
            placeholder={selectedElement ? "Edit selected text" : "Type text here"}
            value={textValue}
            onChange={(e) => handleTextChange(e.target.value)}
            onFocus={handleTextFocus}
            onBlur={handleTextBlur}
            className="w-full text-gray-700 text-lg bg-transparent border-0 border-b-2 border-gray-200 focus:border-blue-500 focus:outline-none pb-2 transition-colors placeholder-gray-400"
            style={{ 
              fontFamily: selectedFont,
              fontSize: `${Math.min(fontSize, 24)}px`,
              fontWeight: isBold ? 'bold' : 'normal'
            }}
          />
        </div>

        <button 
          onClick={handleNewTextField}
          className="w-full bg-cyan-400 hover:bg-cyan-500 text-black font-bold py-4 px-6 rounded-full transition-colors text-lg"
        >
          {selectedElement ? 'Add Another Text Field' : 'New Text Field'}
        </button>

        {selectedElement && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-2">Selected: "{selectedElement.text}"</p>
            <button
              onClick={handleDeleteText}
              className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
            >
              Delete Selected Text
            </button>
          </div>
        )}
      </div>

      {/* Floating Toolbar */}
      {showToolbar && (selectedElement || textValue) && (
        <div className="text-toolbar absolute top-0 left-full ml-4 bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-50 min-w-max">
          <div className="flex items-center space-x-2">
            {/* Font Selector */}
            <div className="relative">
              <button
                onClick={() => setShowFontDropdown(!showFontDropdown)}
                className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors min-w-[100px]"
              >
                <span className="text-sm font-medium">{selectedFont}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {showFontDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[120px]">
                  {fonts.map((font) => (
                    <button
                      key={font}
                      onClick={() => {
                        handleFontChange(font);
                        setShowFontDropdown(false);
                      }}
                      className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                      style={{ fontFamily: font }}
                    >
                      {font}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Font Size Controls */}
            <button
              onClick={() => adjustFontSize(-2)}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>

            <div className="relative">
              <button
                onClick={() => setShowSizeDropdown(!showSizeDropdown)}
                className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors min-w-[60px]"
              >
                <span className="text-sm font-medium">{fontSize}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              
              {showSizeDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                  {fontSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => {
                        handleSizeChange(size);
                        setShowSizeDropdown(false);
                      }}
                      className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                    >
                      {size}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => adjustFontSize(2)}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>

            {/* Divider */}
            <div className="w-px h-6 bg-gray-300"></div>

            {/* Color Picker */}
            <div className="relative">
              <input
                type="color"
                value={textColor}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-8 h-8 rounded-full border-2 border-gray-300 cursor-pointer"
                style={{ backgroundColor: textColor }}
              />
            </div>

            {/* Bold */}
            <button
              onClick={handleBoldToggle}
              className={`p-2 rounded-md transition-colors ${
                isBold ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
              }`}
            >
              <Bold className="w-4 h-4" />
            </button>

            {/* Divider */}
            <div className="w-px h-6 bg-gray-300"></div>

            {/* Alignment */}
            <button
              onClick={() => handleAlignmentChange('left')}
              className={`p-2 rounded-md transition-colors ${
                alignment === 'left' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
              }`}
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleAlignmentChange('center')}
              className={`p-2 rounded-md transition-colors ${
                alignment === 'center' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
              }`}
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleAlignmentChange('right')}
              className={`p-2 rounded-md transition-colors ${
                alignment === 'right' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
              }`}
            >
              <AlignRight className="w-4 h-4" />
            </button>

            {/* Lists */}
            <button className="p-2 hover:bg-gray-100 rounded-md transition-colors">
              <List className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-md transition-colors">
              <ListOrdered className="w-4 h-4" />
            </button>

            {/* Text Transform */}
            <button className="p-2 hover:bg-gray-100 rounded-md transition-colors">
              <Type className="w-4 h-4" />
            </button>

            {/* Format Menu */}
            <button className="px-3 py-2 hover:bg-gray-100 rounded-md transition-colors text-sm font-medium">
              Format
            </button>

            {/* Divider */}
            <div className="w-px h-6 bg-gray-300"></div>

            {/* Advanced Controls */}
            <button className="p-2 hover:bg-gray-100 rounded-md transition-colors" title="Transparency">
              <Eye className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-md transition-colors" title="Layer Order">
              <Layers className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-md transition-colors" title="Duplicate">
              <Copy className="w-4 h-4" />
            </button>
            <button 
              onClick={handleDeleteText}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors text-red-500" 
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-md transition-colors" title="More Options">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TextPanel;