import React, { useState, useRef, useEffect } from 'react';
import { TextElement as TextElementType } from '../types/TextElement';
import { useTextContext } from '../context/TextContext';
import TextFloatingToolbar from './TextFloatingToolbar';

interface TextElementProps {
  element: TextElementType;
  highlightEmpty?: boolean;
  onSelect?: (id: string) => void;
}

const TextElement: React.FC<TextElementProps> = ({ element, highlightEmpty = false, onSelect }) => {
  const { updateTextElement, selectTextElement, selectedTextId } = useTextContext();
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(element.text);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, elementX: 0, elementY: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0, elementX: 0, elementY: 0 });
  const elementRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isSelected = element.id === selectedTextId;
  const isEmpty = !element.text || element.text.trim() === '' || element.text === 'Your Text Here';
  const shouldHighlight = highlightEmpty && isEmpty;

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Text element clicked, selecting:', element.id);
    
    // Use the onSelect callback if provided, otherwise use context method
    if (onSelect) {
      onSelect(element.id);
    } else {
      selectTextElement(element.id);
    }
    
    if (e.detail === 2) { // Double click
      setIsEditing(true);
      return;
    }

    // Get canvas bounds for proper constraint calculation
    const canvasElement = document.querySelector('.canvas-area');
    if (!canvasElement) return;

    const canvasRect = canvasElement.getBoundingClientRect();
    
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
      width: element.width || 200,
      height: element.height || 50,
      elementX: element.x,
      elementY: element.y,
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const canvasElement = document.querySelector('.canvas-area');
      if (!canvasElement) return;

      const canvasRect = canvasElement.getBoundingClientRect();

      // Calculate the movement delta
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      // Calculate new position based on original position + delta
      let newX = dragStart.elementX + deltaX;
      let newY = dragStart.elementY + deltaY;

      // Get current element dimensions
      const elementWidth = element.width || 200;
      const elementHeight = element.height || 50;

      // Constrain to canvas boundaries
      newX = Math.max(0, Math.min(canvasRect.width - elementWidth, newX));
      newY = Math.max(0, Math.min(canvasRect.height - elementHeight, newY));

      updateTextElement(element.id, { x: newX, y: newY });
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
      const minWidth = 50;
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

      // Ensure the element doesn't go outside canvas bounds
      if (newX + newWidth > canvasRect.width) {
        newWidth = canvasRect.width - newX;
      }
      if (newY + newHeight > canvasRect.height) {
        newHeight = canvasRect.height - newY;
      }

      updateTextElement(element.id, { 
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

  const handleTextSubmit = () => {
    updateTextElement(element.id, { text: editText || 'Your Text Here' });
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTextSubmit();
    } else if (e.key === 'Escape') {
      setEditText(element.text);
      setIsEditing(false);
    }
  };

  const formatText = (text: string) => {
    let formattedText = text;
    
    // Apply text case transformation
    if (element.textCase === 'lowercase') {
      formattedText = formattedText.toLowerCase();
    } else if (element.textCase === 'uppercase') {
      formattedText = formattedText.toUpperCase();
    }
    
    // Apply list formatting
    if (element.isBulletList) {
      return formattedText.split('\n').map(line => line.trim() ? `• ${line}` : line).join('\n');
    } else if (element.isNumberedList) {
      return formattedText.split('\n').map((line, index) => line.trim() ? `${index + 1}. ${line}` : line).join('\n');
    }
    
    return formattedText;
  };

  // Generate SVG path for curved text
  const getCurvePath = (curveType: string, width: number) => {
    const height = 40;
    const midX = width / 2;
    
    switch (curveType) {
      case 'full-up':
        return `M 0 ${height} Q ${midX} 0 ${width} ${height}`;
      case 'slight-up':
        return `M 0 ${height * 0.8} Q ${midX} ${height * 0.4} ${width} ${height * 0.8}`;
      case 'none':
        return `M 0 ${height / 2} L ${width} ${height / 2}`;
      case 'slight-down':
        return `M 0 ${height * 0.2} Q ${midX} ${height * 0.6} ${width} ${height * 0.2}`;
      case 'full-down':
        return `M 0 0 Q ${midX} ${height} ${width} 0`;
      default:
        return `M 0 ${height / 2} L ${width} ${height / 2}`;
    }
  };

  const getBorderStyle = () => {
    if (isSelected) {
      return '2px dashed #3b82f6';
    } else if (shouldHighlight) {
      return '2px dashed #ef4444'; // Red dashed border for empty text
    } else {
      return '2px dashed transparent';
    }
  };

  const getBackgroundColor = () => {
    if (isSelected) {
      return 'rgba(59, 130, 246, 0.1)';
    } else if (shouldHighlight) {
      return 'rgba(239, 68, 68, 0.1)'; // Light red background for empty text
    } else {
      return 'transparent';
    }
  };

  const textStyle: React.CSSProperties = {
    position: 'absolute',
    left: element.x,
    top: element.y,
    width: element.width || 200,
    height: element.height || 'auto',
    minHeight: element.height || 50,
    cursor: isDragging ? 'grabbing' : (isSelected ? 'grab' : 'pointer'),
    userSelect: 'none',
    padding: '8px 12px',
    border: getBorderStyle(),
    borderRadius: '4px',
    backgroundColor: getBackgroundColor(),
    transition: isDragging || isResizing ? 'none' : 'all 0.2s ease',
    opacity: (element.opacity || 100) / 100,
    transform: `rotate(${element.rotation || 0}deg)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: element.alignment === 'center' ? 'center' : element.alignment === 'right' ? 'flex-end' : 'flex-start',
    overflow: 'hidden',
    zIndex: isSelected ? 10 : 1,
    wordWrap: 'break-word',
    wordBreak: 'break-word',
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

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={editText}
        onChange={(e) => setEditText(e.target.value)}
        onBlur={handleTextSubmit}
        onKeyDown={handleKeyDown}
        style={{
          ...textStyle,
          cursor: 'text',
          background: 'white',
          border: '2px solid #3b82f6',
          outline: 'none',
          fontSize: `${element.fontSize}px`,
          fontFamily: element.fontFamily,
          color: element.color,
          fontWeight: element.isBold ? 'bold' : 'normal',
          fontStyle: element.isItalic ? 'italic' : 'normal',
          textDecoration: element.isUnderline ? 'underline' : 'none',
          textAlign: element.alignment,
          lineHeight: element.lineHeight || 1.2,
          letterSpacing: `${element.letterSpacing || 0}px`,
          transform: `rotate(${element.rotation || 0}deg)`,
        }}
      />
    );
  }

  // Render curved text using SVG
  if (element.curveStyle && element.curveStyle !== 'none') {
    const width = element.width || 200;
    const height = Math.max(element.height || 50, 60); // Ensure enough height for curves
    
    return (
      <>
        <div
          ref={elementRef}
          style={textStyle}
          onMouseDown={handleMouseDown}
          className="text-element"
        >
          <svg 
            width={width} 
            height={height} 
            viewBox={`0 0 ${width} ${height}`}
            style={{ overflow: 'visible' }}
          >
            <defs>
              <path
                id={`curve-${element.id}`}
                d={getCurvePath(element.curveStyle, width)}
                fill="none"
                stroke="none"
              />
            </defs>
            <text
              fontSize={element.fontSize}
              fontFamily={element.fontFamily}
              fontWeight={element.isBold ? 'bold' : 'normal'}
              fontStyle={element.isItalic ? 'italic' : 'normal'}
              textDecoration={element.isUnderline ? 'underline' : 'none'}
              fill={element.color}
              letterSpacing={`${element.letterSpacing || 0}px`}
              textAnchor="middle"
            >
              <textPath href={`#curve-${element.id}`} startOffset="50%">
                {formatText(element.text)}
              </textPath>
            </text>
          </svg>
          
          {isSelected && <ResizeHandles />}
        </div>
      </>
    );
  }

  // Render normal text
  return (
    <>
      <div
        ref={elementRef}
        style={{
          ...textStyle,
          fontSize: `${element.fontSize}px`,
          fontFamily: element.fontFamily,
          color: element.color,
          fontWeight: element.isBold ? 'bold' : 'normal',
          fontStyle: element.isItalic ? 'italic' : 'normal',
          textDecoration: element.isUnderline ? 'underline' : 'none',
          textAlign: element.alignment,
          lineHeight: element.lineHeight || 1.2,
          letterSpacing: `${element.letterSpacing || 0}px`,
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
        }}
        onMouseDown={handleMouseDown}
        className="text-element"
      >
        {formatText(element.text)}
        {isSelected && <ResizeHandles />}
      </div>

      {/* Floating Toolbar - Always render when selected */}
      {isSelected && (
        <TextFloatingToolbar 
          isVisible={true} 
          selectedTextId={element.id}
        />
      )}
    </>
  );
};

export default TextElement;