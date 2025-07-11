import React, { useState, useRef, useEffect } from 'react';
import { Move, RotateCw } from 'lucide-react';
import { ImageElement as ImageElementType } from '../types/ImageElement';
import { useImageContext } from '../context/ImageContext';
import ImageFloatingToolbar from './ImageFloatingToolbar';

interface ImageElementProps {
  element: ImageElementType;
  onSelect?: (id: string) => void;
}

const ImageElement: React.FC<ImageElementProps> = ({ element, onSelect }) => {
  const { updateImageElement, selectImageElement, selectedImageId } = useImageContext();
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string>('');
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, elementX: 0, elementY: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0, elementX: 0, elementY: 0 });
  const elementRef = useRef<HTMLDivElement>(null);

  const isSelected = element.id === selectedImageId;

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Image element clicked, selecting:', element.id);
    
    // Use the onSelect callback if provided, otherwise use context method
    if (onSelect) {
      onSelect(element.id);
    } else {
      selectImageElement(element.id);
    }
    
    const canvasElement = document.querySelector('.canvas-area');
    if (!canvasElement) return;

    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      elementX: element.x,
      elementY: element.y,
    });
  };

  const handleResizeMouseDown = (e: React.MouseEvent, handle: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsResizing(true);
    setResizeHandle(handle);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: element.width,
      height: element.height,
      elementX: element.x,
      elementY: element.y,
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const canvasElement = document.querySelector('.canvas-area');
      if (!canvasElement) return;

      const canvasRect = canvasElement.getBoundingClientRect();
      const elementWidth = element.width;
      const elementHeight = element.height;

      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      let newX = dragStart.elementX + deltaX;
      let newY = dragStart.elementY + deltaY;

      newX = Math.max(0, Math.min(canvasRect.width - elementWidth, newX));
      newY = Math.max(0, Math.min(canvasRect.height - elementHeight, newY));

      updateImageElement(element.id, { x: newX, y: newY });
    } else if (isResizing) {
      const canvasElement = document.querySelector('.canvas-area');
      if (!canvasElement) return;

      const canvasRect = canvasElement.getBoundingClientRect();
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      
      let newWidth = resizeStart.width;
      let newHeight = resizeStart.height;
      let newX = resizeStart.elementX;
      let newY = resizeStart.elementY;

      // Minimum dimensions
      const minWidth = 20;
      const minHeight = 20;

      switch (resizeHandle) {
        case 'nw':
          newWidth = Math.max(minWidth, resizeStart.width - deltaX);
          newHeight = Math.max(minHeight, resizeStart.height - deltaY);
          newX = resizeStart.elementX + (resizeStart.width - newWidth);
          newY = resizeStart.elementY + (resizeStart.height - newHeight);
          break;
        case 'n':
          newHeight = Math.max(minHeight, resizeStart.height - deltaY);
          newY = resizeStart.elementY + (resizeStart.height - newHeight);
          break;
        case 'ne':
          newWidth = Math.max(minWidth, resizeStart.width + deltaX);
          newHeight = Math.max(minHeight, resizeStart.height - deltaY);
          newY = resizeStart.elementY + (resizeStart.height - newHeight);
          break;
        case 'e':
          newWidth = Math.max(minWidth, resizeStart.width + deltaX);
          break;
        case 'se':
          newWidth = Math.max(minWidth, resizeStart.width + deltaX);
          newHeight = Math.max(minHeight, resizeStart.height + deltaY);
          break;
        case 's':
          newHeight = Math.max(minHeight, resizeStart.height + deltaY);
          break;
        case 'sw':
          newWidth = Math.max(minWidth, resizeStart.width - deltaX);
          newHeight = Math.max(minHeight, resizeStart.height + deltaY);
          newX = resizeStart.elementX + (resizeStart.width - newWidth);
          break;
        case 'w':
          newWidth = Math.max(minWidth, resizeStart.width - deltaX);
          newX = resizeStart.elementX + (resizeStart.width - newWidth);
          break;
      }

      // Constrain to canvas boundaries
      newX = Math.max(0, Math.min(canvasRect.width - newWidth, newX));
      newY = Math.max(0, Math.min(canvasRect.height - newHeight, newY));

      if (newX + newWidth > canvasRect.width) {
        newWidth = canvasRect.width - newX;
      }
      if (newY + newHeight > canvasRect.height) {
        newHeight = canvasRect.height - newY;
      }

      updateImageElement(element.id, { 
        x: newX, 
        y: newY, 
        width: newWidth, 
        height: newHeight 
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle('');
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart, resizeStart, element.x, element.y, element.width, element.height]);

  const elementStyle: React.CSSProperties = {
    position: 'absolute',
    left: element.x,
    top: element.y,
    width: element.width,
    height: element.height,
    cursor: isDragging ? 'grabbing' : (isSelected ? 'grab' : 'pointer'),
    userSelect: 'none',
    border: isSelected ? '2px dashed #3b82f6' : '2px dashed transparent',
    borderRadius: '4px',
    transition: isDragging || isResizing ? 'none' : 'all 0.2s ease',
    opacity: (element.opacity || 100) / 100,
    transform: `rotate(${element.rotation || 0}deg) ${element.transform || ''}`,
    zIndex: isSelected ? 10 : 1,
    filter: element.filter || 'none',
    clipPath: element.clipPath || 'none',
  };

  // 8 Anchor Resize Handles Component
  const ResizeHandles = () => (
    <>
      {/* Corner handles */}
      <div 
        className="absolute w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-nw-resize hover:bg-blue-600 transition-all duration-200 shadow-lg hover:scale-110"
        style={{ top: -8, left: -8 }}
        onMouseDown={(e) => handleResizeMouseDown(e, 'nw')}
      ></div>
      <div 
        className="absolute w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-ne-resize hover:bg-blue-600 transition-all duration-200 shadow-lg hover:scale-110"
        style={{ top: -8, right: -8 }}
        onMouseDown={(e) => handleResizeMouseDown(e, 'ne')}
      ></div>
      <div 
        className="absolute w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-sw-resize hover:bg-blue-600 transition-all duration-200 shadow-lg hover:scale-110"
        style={{ bottom: -8, left: -8 }}
        onMouseDown={(e) => handleResizeMouseDown(e, 'sw')}
      ></div>
      <div 
        className="absolute w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-se-resize hover:bg-blue-600 transition-all duration-200 shadow-lg hover:scale-110"
        style={{ bottom: -8, right: -8 }}
        onMouseDown={(e) => handleResizeMouseDown(e, 'se')}
      ></div>
      
      {/* Side handles */}
      <div 
        className="absolute w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-n-resize hover:bg-blue-600 transition-all duration-200 shadow-lg hover:scale-110"
        style={{ top: -8, left: '50%', transform: 'translateX(-50%)' }}
        onMouseDown={(e) => handleResizeMouseDown(e, 'n')}
      ></div>
      <div 
        className="absolute w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-s-resize hover:bg-blue-600 transition-all duration-200 shadow-lg hover:scale-110"
        style={{ bottom: -8, left: '50%', transform: 'translateX(-50%)' }}
        onMouseDown={(e) => handleResizeMouseDown(e, 's')}
      ></div>
      <div 
        className="absolute w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-w-resize hover:bg-blue-600 transition-all duration-200 shadow-lg hover:scale-110"
        style={{ top: '50%', left: -8, transform: 'translateY(-50%)' }}
        onMouseDown={(e) => handleResizeMouseDown(e, 'w')}
      ></div>
      <div 
        className="absolute w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-e-resize hover:bg-blue-600 transition-all duration-200 shadow-lg hover:scale-110"
        style={{ top: '50%', right: -8, transform: 'translateY(-50%)' }}
        onMouseDown={(e) => handleResizeMouseDown(e, 'e')}
      ></div>
    </>
  );

  return (
    <>
      <div
        ref={elementRef}
        style={elementStyle}
        onMouseDown={handleMouseDown}
        className="image-element"
        title={`Image: ${element.src.split('/').pop()}`}
      >
        <img
          src={element.src}
          alt="Design element"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            pointerEvents: 'none',
            userSelect: 'none',
            filter: element.filter || 'none',
            clipPath: element.clipPath || 'none',
          }}
          draggable={false}
          onError={(e) => {
            console.error('Image failed to load:', element.src);
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        
        {isSelected && <ResizeHandles />}
      </div>

      {/* Element Controls - positioned below the image */}
      {isSelected && (
        <div 
          className="absolute bg-white rounded-lg shadow-lg border border-gray-200 px-3 py-2 z-20"
          style={{
            left: element.x + element.width / 2 - 40,
            top: element.y + element.height + 10,
          }}
        >
          <div className="flex items-center space-x-2">
            {/* Move tool */}
            <button
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="Move"
            >
              <Move className="w-4 h-4 text-gray-600" />
            </button>
            
            {/* Rotate tool */}
            <button
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="Rotate"
            >
              <RotateCw className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Toolbar - Always render when selected */}
      {isSelected && (
        <ImageFloatingToolbar 
          isVisible={true} 
          selectedImageId={element.id}
        />
      )}
    </>
  );
};

export default ImageElement;