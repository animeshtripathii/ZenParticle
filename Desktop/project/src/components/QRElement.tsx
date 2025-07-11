import React, { useState, useRef, useEffect } from 'react';
import { QRElement as QRElementType } from '../types/QRElement';
import { useQRContext } from '../context/QRContext';
import QRCode from 'qrcode';
import QRFloatingToolbar from './QRFloatingToolbar';

interface QRElementProps {
  element: QRElementType;
  onSelect?: (id: string) => void;
}

export const QRElement: React.FC<QRElementProps> = ({ element, onSelect }) => {
  const { updateQRElement, selectQRElement, selectedQRId } = useQRContext();
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string>('');
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, elementX: 0, elementY: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0, elementX: 0, elementY: 0 });
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const elementRef = useRef<HTMLDivElement>(null);

  const isSelected = element.id === selectedQRId;

  // Debug logging
  useEffect(() => {
    console.log('QRElement render:', { 
      elementId: element.id, 
      selectedQRId, 
      isSelected 
    });
  }, [element.id, selectedQRId, isSelected]);

  // Generate QR code image
  useEffect(() => {
    const generateQRCode = async () => {
      try {
        const dataUrl = await QRCode.toDataURL(element.url, {
          width: element.width,
          height: element.height,
          color: {
            dark: element.foregroundColor,
            light: element.backgroundColor,
          },
          errorCorrectionLevel: element.errorCorrectionLevel,
          margin: 1,
        });
        setQrDataUrl(dataUrl);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };

    generateQRCode();
  }, [element.url, element.width, element.height, element.foregroundColor, element.backgroundColor, element.errorCorrectionLevel]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('QR clicked, selecting:', element.id);
    
    // Use the onSelect callback if provided, otherwise use context method
    if (onSelect) {
      onSelect(element.id);
    } else {
      selectQRElement(element.id);
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

      // Calculate the movement delta
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      // Calculate new position based on original position + delta
      let newX = dragStart.elementX + deltaX;
      let newY = dragStart.elementY + deltaY;

      // Constrain to canvas boundaries
      newX = Math.max(0, Math.min(canvasRect.width - elementWidth, newX));
      newY = Math.max(0, Math.min(canvasRect.height - elementHeight, newY));

      updateQRElement(element.id, { x: newX, y: newY });
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
      const minSize = 50;

      switch (resizeHandle) {
        case 'nw':
          newWidth = Math.max(minSize, resizeStart.width - deltaX);
          newHeight = Math.max(minSize, resizeStart.height - deltaY);
          newX = resizeStart.elementX + (resizeStart.width - newWidth);
          newY = resizeStart.elementY + (resizeStart.height - newHeight);
          break;
        case 'n':
          newHeight = Math.max(minSize, resizeStart.height - deltaY);
          newY = resizeStart.elementY + (resizeStart.height - newHeight);
          break;
        case 'ne':
          newWidth = Math.max(minSize, resizeStart.width + deltaX);
          newHeight = Math.max(minSize, resizeStart.height - deltaY);
          newY = resizeStart.elementY + (resizeStart.height - newHeight);
          break;
        case 'e':
          newWidth = Math.max(minSize, resizeStart.width + deltaX);
          break;
        case 'se':
          newWidth = Math.max(minSize, resizeStart.width + deltaX);
          newHeight = Math.max(minSize, resizeStart.height + deltaY);
          break;
        case 's':
          newHeight = Math.max(minSize, resizeStart.height + deltaY);
          break;
        case 'sw':
          newWidth = Math.max(minSize, resizeStart.width - deltaX);
          newHeight = Math.max(minSize, resizeStart.height + deltaY);
          newX = resizeStart.elementX + (resizeStart.width - newWidth);
          break;
        case 'w':
          newWidth = Math.max(minSize, resizeStart.width - deltaX);
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

      updateQRElement(element.id, { 
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

  const qrStyle: React.CSSProperties = {
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

  // 8 Anchor Resize Handles Component for QR
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
        style={qrStyle}
        onMouseDown={handleMouseDown}
        className="qr-element"
        title={`QR Code: ${element.url}`}
      >
        {qrDataUrl ? (
          <img
            src={qrDataUrl}
            alt={`QR Code for ${element.url}`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              pointerEvents: 'none',
              borderRadius: '2px',
            }}
            draggable={false}
          />
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 rounded"
            style={{ pointerEvents: 'none' }}
          >
            <div className="text-center text-gray-500">
              <div className="text-2xl mb-2">⏳</div>
              <div className="text-xs">Generating QR...</div>
            </div>
          </div>
        )}
        
        {isSelected && <ResizeHandles />}
      </div>

      {/* Floating Toolbar - Always render when selected */}
      {isSelected && (
        <QRFloatingToolbar 
          isVisible={true} 
          selectedQRId={element.id}
        />
      )}
    </>
  );
};