import React from 'react';
import { useTextContext } from '../context/TextContext';
import { useImageContext } from '../context/ImageContext';
import { useGraphicsContext } from '../context/GraphicsContext';
import { useQRContext } from '../context/QRContext';
import { useViewContext } from '../context/ViewContext';
import { useCanvasContext } from '../context/CanvasContext';
import TextElement from './TextElement';
import ImageElement from './ImageElement';
import GraphicElement from './GraphicElement';
import { QRElement } from './QRElement';


const Canvas: React.FC = () => {
  const { textElements, selectTextElement } = useTextContext();
  const { imageElements, selectImageElement, selectedImageId } = useImageContext();
  const { graphicElements, selectGraphicElement } = useGraphicsContext();
  const { qrElements, selectQRElement } = useQRContext();
  const { 
    isGridVisible, 
    isRulersVisible, 
    isSafetyAreaVisible, 
    isHighlightEmptyTextVisible 
  } = useViewContext();
  const { canvasBackgroundColor, canvasSize, canvasScale } = useCanvasContext();

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Only deselect if clicking on the canvas itself, not on elements
    if (e.target === e.currentTarget) {
      console.log('Canvas clicked, deselecting all elements');
      // Deselect all element types
      selectTextElement(null);
      selectImageElement(null);
      selectGraphicElement(null);
      selectQRElement(null);
    }
  };

  // Function to handle element selection and deselect others
  const handleElementSelection = (type: 'text' | 'image' | 'graphic' | 'qr', id: string) => {
    console.log(`Selecting ${type} element:`, id);
    
    // Deselect all other types first
    if (type !== 'text') selectTextElement(null);
    if (type !== 'image') selectImageElement(null);
    if (type !== 'graphic') selectGraphicElement(null);
    if (type !== 'qr') selectQRElement(null);
    
    // Then select the current element
    switch (type) {
      case 'text':
        selectTextElement(id);
        break;
      case 'image':
        selectImageElement(id);
        break;
      case 'graphic':
        selectGraphicElement(id);
        break;
      case 'qr':
        selectQRElement(id);
        break;
    }
  };
  
  const hasContent = textElements.length > 0 || imageElements.length > 0 || graphicElements.length > 0 || qrElements.length > 0;
  const selectedImage = selectedImageId ? imageElements.find(img => img.id === selectedImageId) : null;

  // Calculate scaled dimensions
  const scaledWidth = (canvasSize.width * canvasScale) / 100;
  const scaledHeight = (canvasSize.height * canvasScale) / 100;

  // Use the exact scaled dimensions to maintain proper aspect ratio
  const finalWidth = scaledWidth;
  const finalHeight = scaledHeight;

  return (
    <div className="flex-1 bg-gray-100 p-8 flex items-center justify-center overflow-auto canvas-area">
      <div className="relative">
        {/* Canvas Container */}
        <div className="relative bg-white shadow-lg">
          {/* Measurement Labels - only show if rulers are enabled */}
          {isRulersVisible && (
            <div className="absolute -top-8 left-0 right-0 flex justify-between items-center">
              <div className="flex items-center space-x-4">
                {isSafetyAreaVisible && (
                  <>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-teal-500 rounded-full opacity-60"></div>
                      <span className="text-sm text-gray-600">Safety Area</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full opacity-60"></div>
                      <span className="text-sm text-gray-600">Bleed</span>
                    </div>
                  </>
                )}
              </div>
              <span className="text-sm font-medium text-gray-700 bg-white px-2 py-1 rounded shadow-sm">Front</span>
            </div>
          )}

          {/* Top Measurement - only show if rulers are enabled */}
          {isRulersVisible && (
            <div className="absolute -top-6 left-0 right-0 flex justify-center">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-px bg-gray-500"></div>
                <span className="text-xs text-gray-600 bg-white px-1 rounded shadow-sm font-medium">17.2cm</span>
                <div className="w-4 h-px bg-gray-500"></div>
              </div>
            </div>
          )}

          {/* Left Measurement - only show if rulers are enabled */}
          {isRulersVisible && (
            <div className="absolute -left-12 top-0 bottom-0 flex items-center">
              <div className="flex flex-col items-center space-y-2 -rotate-90">
                <div className="w-4 h-px bg-gray-500"></div>
                <span className="text-xs text-gray-600 bg-white px-1 rounded shadow-sm font-medium">7cm</span>
                <div className="w-4 h-px bg-gray-500"></div>
              </div>
            </div>
          )}

          {/* Design Area */}
          <div 
            style={{ 
              backgroundColor: canvasBackgroundColor,
              width: `${finalWidth}px`,
              height: `${finalHeight}px`
            }}
            onClick={handleCanvasClick}
            className="relative"
          >
            {/* Safety Area Guide - only show if enabled */}
            {isSafetyAreaVisible && (
              <>
                <div className="absolute inset-4 border-2 border-dashed border-teal-500 opacity-60 pointer-events-none z-10"></div>
                {/* Bleed Guide - only show if enabled */}
                <div className="absolute inset-2 border-2 border-dashed border-blue-500 opacity-60 pointer-events-none z-10"></div>
              </>
            )}
            
            {/* Grid Pattern - only show if enabled */}
            {isGridVisible && (
              <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none z-10" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
                    <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#3b82f6" strokeWidth="1"/>
                  </pattern>
                  <pattern id="smallGrid" width="6" height="6" patternUnits="userSpaceOnUse">
                    <path d="M 6 0 L 0 0 0 6" fill="none" stroke="#3b82f6" strokeWidth="0.5" opacity="0.5"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#smallGrid)" />
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            )}
            
            {/* Upload Your Design Text - only show when no content */}
            {!hasContent && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <div 
                    className="font-light mb-2 transition-colors duration-300"
                    style={{ 
                      fontSize: `${Math.min(finalWidth / 12, 60)}px`,
                      color: canvasBackgroundColor === '#FFFFFF' ? '#9CA3AF' : 
                             canvasBackgroundColor === '#000000' ? '#FFFFFF' :
                             '#6B7280'
                    }}
                  >
                    Upload Your
                  </div>
                  <div 
                    className="font-light transition-colors duration-300"
                    style={{ 
                      fontSize: `${Math.min(finalWidth / 12, 60)}px`,
                      color: canvasBackgroundColor === '#FFFFFF' ? '#9CA3AF' : 
                             canvasBackgroundColor === '#000000' ? '#FFFFFF' :
                             '#6B7280'
                    }}
                  >
                    Design
                  </div>
                </div>
              </div>
            )}

            {/* Graphic Elements */}
            {graphicElements.map((element) => (
              <GraphicElement 
                key={element.id} 
                element={element} 
                onSelect={(id) => handleElementSelection('graphic', id)}
              />
            ))}

            {/* Image Elements */}
            {imageElements.map((element) => (
              <ImageElement 
                key={element.id} 
                element={element} 
                onSelect={(id) => handleElementSelection('image', id)}
              />
            ))}

            {/* Text Elements */}
            {textElements.map((element) => (
              <TextElement 
                key={element.id} 
                element={element} 
                highlightEmpty={isHighlightEmptyTextVisible}
                onSelect={(id) => handleElementSelection('text', id)}
              />
            ))}

            {/* QR Code Elements */}
            {qrElements.map((element) => (
              <QRElement 
                key={element.id} 
                element={element} 
                onSelect={(id) => handleElementSelection('qr', id)}
              />
            ))}

          </div>
        </div>

        {/* Corner Handles */}
        <div 
          className="absolute -top-2 -left-2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-nw-resize shadow-lg hover:scale-110 transition-transform"
          title="Resize canvas"
        ></div>
        <div 
          className="absolute -top-2 -right-2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-ne-resize shadow-lg hover:scale-110 transition-transform"
          title="Resize canvas"
        ></div>
        <div 
          className="absolute -bottom-2 -left-2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-sw-resize shadow-lg hover:scale-110 transition-transform"
          title="Resize canvas"
        ></div>
        <div 
          className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-se-resize shadow-lg hover:scale-110 transition-transform"
          title="Resize canvas"
        ></div>
      </div>
    </div>
  );
};

export default Canvas;