import React, { useState, useEffect } from 'react';
import { Type, Image, Shapes, QrCode, Palette } from 'lucide-react';
import EnhancedTextPanel from './EnhancedTextPanel';
import ImageUploadPanel from './ImageUploadPanel';
import GraphicsPanel from './GraphicsPanel';
import QRCodePanel from './QRCodePanel';
import CanvasColorPanel from './CanvasColorPanel';
import CropInterface from './CropInterface';
import QRStylePanel from './QRStylePanel';
import QRFillColorPanel from './QRFillColorPanel';
import TextColorPanel from './TextColorPanel';
import { useTextContext } from '../context/TextContext';
import { useImageContext } from '../context/ImageContext';
import { useGraphicsContext } from '../context/GraphicsContext';
import { useQRContext } from '../context/QRContext';


interface Tool {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

const tools: Tool[] = [
  { id: 'text', name: 'Text', icon: Type },
  { id: 'images', name: 'Images', icon: Image },
  { id: 'graphics', name: 'Graphics', icon: Shapes },
  { id: 'qr-codes', name: 'QR-codes', icon: QrCode },
  { id: 'canvas-color', name: 'Canvas Color', icon: Palette },
];

const EnhancedSidebar: React.FC = () => {
  const [activeTool, setActiveTool] = useState<string>('text');
  const [showCropInterface, setShowCropInterface] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string>('');
  const [showQRStylePanel, setShowQRStylePanel] = useState(false);
  const [selectedQRId, setSelectedQRId] = useState<string | null>(null);
  const [showQRFillColorPanel, setShowQRFillColorPanel] = useState(false);
  const [currentQRColor, setCurrentQRColor] = useState('#000000');
  const [showTextColorPanel, setShowTextColorPanel] = useState(false);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [currentTextColor, setCurrentTextColor] = useState('#000000');
  
  // Get context functions to detect when preview is opened
  const { selectedTextId: contextSelectedTextId } = useTextContext();
  const { selectedImageId } = useImageContext();
  const { selectedGraphicId } = useGraphicsContext();
  const { selectedQRId: contextSelectedQRId } = useQRContext();

  // Listen for crop interface events from the image toolbar
  useEffect(() => {
    const handleOpenCropInterface = (event: CustomEvent) => {
      console.log('Received crop interface event:', event.detail);
      setCropImageSrc(event.detail.imageSrc || '');
      setShowCropInterface(true);
      setActiveTool('images'); // Switch to images tab
    };

    window.addEventListener('openCropInterface', handleOpenCropInterface as EventListener);
    
    return () => {
      window.removeEventListener('openCropInterface', handleOpenCropInterface as EventListener);
    };
  }, []);

  // Listen for QR style panel events
  useEffect(() => {
    const handleOpenQRStylePanel = (event: CustomEvent) => {
      console.log('Received QR style panel event:', event.detail);
      setSelectedQRId(event.detail.qrId || null);
      setShowQRFillColorPanel(false); // Close color panel first
      setShowQRStylePanel(true);
      setActiveTool('qr-codes'); // Switch to QR codes tab
    };

    window.addEventListener('openQRStylePanel', handleOpenQRStylePanel as EventListener);
    
    return () => {
      window.removeEventListener('openQRStylePanel', handleOpenQRStylePanel as EventListener);
    };
  }, []);

  // Listen for QR fill color panel events
  useEffect(() => {
    const handleOpenQRFillColorPanel = (event: CustomEvent) => {
      console.log('Received QR fill color panel event:', event.detail);
      setSelectedQRId(event.detail.qrId || null);
      setCurrentQRColor(event.detail.currentColor || '#000000');
      setShowQRStylePanel(false); // Close style panel first
      setShowQRFillColorPanel(true);
      setActiveTool('qr-codes'); // Switch to QR codes tab
    };

    window.addEventListener('openQRFillColorPanel', handleOpenQRFillColorPanel as EventListener);
    
    return () => {
      window.removeEventListener('openQRFillColorPanel', handleOpenQRFillColorPanel as EventListener);
    };
  }, []);

  // Listen for text color panel events
  useEffect(() => {
    const handleOpenTextColorPanel = (event: CustomEvent) => {
      console.log('Received text color panel event:', event.detail);
      setSelectedTextId(event.detail.textId || null);
      setCurrentTextColor(event.detail.currentColor || '#000000');
      setShowQRStylePanel(false); // Close other panels
      setShowQRFillColorPanel(false);
      setShowCropInterface(false);
      setShowTextColorPanel(true);
      setActiveTool('text'); // Switch to text tab
    };

    window.addEventListener('openTextColorPanel', handleOpenTextColorPanel as EventListener);
    
    return () => {
      window.removeEventListener('openTextColorPanel', handleOpenTextColorPanel as EventListener);
    };
  }, []);

  // Close all panels when no elements are selected (happens when preview is opened)
  useEffect(() => {
    if (!contextSelectedTextId && !selectedImageId && !selectedGraphicId && !contextSelectedQRId) {
      setShowCropInterface(false);
      setShowQRStylePanel(false);
      setShowQRFillColorPanel(false);
      setShowTextColorPanel(false);
      setSelectedQRId(null);
      setSelectedTextId(null);
    }
  }, [contextSelectedTextId, selectedImageId, selectedGraphicId, contextSelectedQRId]);

  const handleCloseCropInterface = () => {
    setShowCropInterface(false);
    setCropImageSrc('');
  };

  const handleApplyCrop = () => {
    console.log('Applying crop...');
    setShowCropInterface(false);
    setCropImageSrc('');
  };

  const handleCloseQRStylePanel = () => {
    setShowQRStylePanel(false);
    setShowQRFillColorPanel(false); // Close color panel when style panel closes
    setSelectedQRId(null);
  };

  const handleCloseQRFillColorPanel = () => {
    setShowQRFillColorPanel(false);
    setShowQRStylePanel(false); // Close style panel when color panel closes
    setSelectedQRId(null);
  };

  const handleCloseTextColorPanel = () => {
    setShowTextColorPanel(false);
    setSelectedTextId(null);
  };

  return (
    <div className="w-96 bg-white border-r border-gray-200 flex">
      {/* Tool Icons */}
      <div className="w-20 bg-gray-50 border-r border-gray-200">
        <div className="flex flex-col py-4">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTool === tool.id;
            
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                className={`flex flex-col items-center p-3 mx-2 mb-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                }`}
              >
                <Icon className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">{tool.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tool Panel */}
      <div className="flex-1 p-4 relative overflow-x-auto">
        <div className="min-w-0">
          {activeTool === 'text' && (
            <>
              {showTextColorPanel ? (
                <TextColorPanel
                  isOpen={showTextColorPanel}
                  onClose={handleCloseTextColorPanel}
                  selectedTextId={selectedTextId}
                  currentColor={currentTextColor}
                />
              ) : (
                <EnhancedTextPanel isActive={true} />
              )}
            </>
          )}
          
          {activeTool === 'images' && (
            <>
              {showCropInterface ? (
                <CropInterface
                  isOpen={showCropInterface}
                  onClose={handleCloseCropInterface}
                  onApply={handleApplyCrop}
                  imageSrc={cropImageSrc}
                />
              ) : (
                <ImageUploadPanel isActive={true} />
              )}
            </>
          )}
          
          {activeTool === 'graphics' && (
            <GraphicsPanel isActive={true} />
          )}
          
          {activeTool === 'qr-codes' && (
            <>
              {showQRFillColorPanel ? (
                <QRFillColorPanel
                  isOpen={showQRFillColorPanel}
                  onClose={handleCloseQRFillColorPanel}
                  selectedQRId={selectedQRId}
                  currentColor={currentQRColor}
                />
              ) : showQRStylePanel ? (
                <QRStylePanel
                  isOpen={showQRStylePanel}
                  onClose={handleCloseQRStylePanel}
                  selectedQRId={selectedQRId}
                />
              ) : (
                <QRCodePanel isActive={true} />
              )}
            </>
          )}
          
          {activeTool === 'canvas-color' && (
            <CanvasColorPanel isActive={true} />
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedSidebar;