import React, { useState, useRef, useEffect } from 'react';
import { Move, RotateCw } from 'lucide-react';
import { GraphicElement as GraphicElementType } from '../types/GraphicElement';
import { useGraphicsContext } from '../context/GraphicsContext';
import GraphicsFloatingToolbar from './GraphicsFloatingToolbar';

interface GraphicElementProps {
  element: GraphicElementType;
  onSelect?: (id: string) => void;
}

const GraphicElement: React.FC<GraphicElementProps> = ({ element, onSelect }) => {
  const { updateGraphicElement, selectGraphicElement, selectedGraphicId } = useGraphicsContext();
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string>('');
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, elementX: 0, elementY: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0, elementX: 0, elementY: 0 });
  const elementRef = useRef<HTMLDivElement>(null);

  const isSelected = element.id === selectedGraphicId;

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Graphic element clicked, selecting:', element.id);
    
    // Use the onSelect callback if provided, otherwise use context method
    if (onSelect) {
      onSelect(element.id);
    } else {
      selectGraphicElement(element.id);
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

      updateGraphicElement(element.id, { x: newX, y: newY });
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

      updateGraphicElement(element.id, { 
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
    transform: `rotate(${element.rotation || 0}deg)`,
    zIndex: isSelected ? 10 : 1,
    backgroundColor: 'transparent',
  };

  const renderShape = () => {
    const commonProps = {
      width: '100%',
      height: '100%',
      fill: element.fillColor || '#000000',
      stroke: (element.strokeWidth && element.strokeWidth > 0) ? (element.strokeColor || '#000000') : 'none',
      strokeWidth: element.strokeWidth || 0,
      strokeDasharray: element.strokeStyle === 'dashed' ? '5,5' : element.strokeStyle === 'dotted' ? '2,2' : 'none',
    };

    // Handle icons
    if (element.isIcon && element.iconType) {
      return (
        <div className="w-full h-full flex items-center justify-center text-4xl" style={{ color: element.fillColor }}>
          {getIconForType(element.iconType)}
        </div>
      );
    }

    // Handle clipart
    if (element.isClipart && element.emoji) {
      return (
        <div className="w-full h-full flex items-center justify-center text-4xl">
          {element.emoji}
        </div>
      );
    }

    switch (element.type) {
      case 'circle':
        return (
          <svg width="100%" height="100%" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" {...commonProps} />
          </svg>
        );
      case 'rectangle':
        return (
          <svg width="100%" height="100%" viewBox="0 0 100 100">
            <rect x="5" y="5" width="90" height="90" {...commonProps} />
          </svg>
        );
      case 'triangle':
        return (
          <svg width="100%" height="100%" viewBox="0 0 100 100">
            <polygon points="50,5 95,95 5,95" {...commonProps} />
          </svg>
        );
      case 'pentagon':
        return (
          <svg width="100%" height="100%" viewBox="0 0 100 100">
            <polygon points="25,5 75,5 95,50 75,95 25,95 5,50" {...commonProps} />
          </svg>
        );
      case 'star':
        return (
          <svg width="100%" height="100%" viewBox="0 0 100 100">
            <polygon points="50,5 61,35 98,35 68,57 79,91 50,70 21,91 32,57 2,35 39,35" {...commonProps} />
          </svg>
        );
      case 'heart':
        return (
          <svg width="100%" height="100%" viewBox="0 0 100 100">
            <path d="M50,85 C50,85 20,65 20,40 C20,25 30,15 45,15 C47,15 50,20 50,20 C50,20 53,15 55,15 C70,15 80,25 80,40 C80,65 50,85 50,85 Z" {...commonProps} />
          </svg>
        );
      case 'diamond':
        return (
          <svg width="100%" height="100%" viewBox="0 0 100 100">
            <polygon points="50,5 95,50 50,95 5,50" {...commonProps} />
          </svg>
        );
      case 'pentagon':
        return (
          <svg width="100%" height="100%" viewBox="0 0 100 100">
            <polygon points="50,5 95,35 80,85 20,85 5,35" {...commonProps} />
          </svg>
        );
      case 'octagon':
        return (
          <svg width="100%" height="100%" viewBox="0 0 100 100">
            <polygon points="30,5 70,5 95,30 95,70 70,95 30,95 5,70 5,30" {...commonProps} />
          </svg>
        );
      case 'oval':
        return (
          <svg width="100%" height="100%" viewBox="0 0 100 100">
            <ellipse cx="50" cy="50" rx="45" ry="30" {...commonProps} />
          </svg>
        );
      case 'line':
        return (
          <svg width="100%" height="100%" viewBox="0 0 100 100">
            <line 
              x1="5" 
              y1="50" 
              x2="95" 
              y2="50" 
              stroke={element.fillColor || '#000000'} 
              strokeWidth={Math.max(4, element.strokeWidth || 4)}
              strokeDasharray={element.strokeStyle === 'dashed' ? '8,4' : element.strokeStyle === 'dotted' ? '2,2' : 'none'}
            />
          </svg>
        );
      case 'arrow':
        return (
          <svg width="100%" height="100%" viewBox="0 0 100 100">
            <polygon points="5,40 5,60 70,60 70,80 95,50 70,20 70,40" {...commonProps} />
          </svg>
        );
      case 'plus':
        return (
          <svg width="100%" height="100%" viewBox="0 0 100 100">
            <polygon points="40,5 60,5 60,40 95,40 95,60 60,60 60,95 40,95 40,60 5,60 5,40 40,40" {...commonProps} />
          </svg>
        );
      case 'cross':
        return (
          <svg width="100%" height="100%" viewBox="0 0 100 100">
            <polygon points="30,5 70,5 95,30 70,50 95,70 70,95 30,95 5,70 30,50 5,30" {...commonProps} />
          </svg>
        );
      case 'lightning':
        return (
          <svg width="100%" height="100%" viewBox="0 0 100 100">
            <polygon points="60,5 25,45 45,45 40,95 75,55 55,55" {...commonProps} />
          </svg>
        );
      default:
        return (
          <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 text-xs">
            {element.type}
          </div>
        );
    }
  };

  const getIconForType = (iconType: string) => {
    const iconMap: { [key: string]: string } = {
      'sun': '☀️',
      'moon': '🌙',
      'cloud': '☁️',
      'umbrella': '☂️',
      'tree': '🌳',
      'flower': '🌸',
      'leaf': '🍃',
      'apple': '🍎',
      'phone': '📱',
      'mail': '✉️',
      'camera': '📷',
      'music': '🎵',
      'lightbulb': '💡',
      'rocket': '🚀',
      'globe': '🌍',
      'compass': '🧭',
      'home': '🏠',
      'coffee': '☕',
      'gift': '🎁',
      'crown': '👑',
      'key': '🔑',
      'lock': '🔒',
      'bell': '🔔',
      'clock': '🕐',
      'car': '🚗',
      'plane': '✈️',
      'ship': '🚢',
      'bike': '🚲',
      'anchor': '⚓',
      'calendar': '📅',
      'book': '📚',
      'pen': '✏️',
      'scissors': '✂️',
      'palette': '🎨',
      'brush': '🖌️',
      'target': '🎯',
      'flag': '🚩',
      'trophy': '🏆',
      'medal': '🏅',
      'shield': '🛡️',
      'cat': '🐱',
      'dog': '🐶',
      'bird': '🐦',
      'fish': '🐟',
      'butterfly': '🦋',
    };
    return iconMap[iconType] || '❓';
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
        className="graphic-element"
      >
        {renderShape()}
        
        {isSelected && <ResizeHandles />}
      </div>

      {/* Element Controls - positioned below the shape */}
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
        <GraphicsFloatingToolbar 
          isVisible={true} 
          selectedGraphicId={element.id}
        />
      )}
    </>
  );
};

export default GraphicElement;