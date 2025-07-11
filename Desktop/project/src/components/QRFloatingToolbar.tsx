import React, { useRef, useEffect, useState } from 'react';
import { 
  QrCode,
  Palette,
  Edit3,
  Layers, 
  MoreHorizontal,
  Copy,
  Trash2,
  RotateCw,
  Lock,
  Eye,
  Download,
  ExternalLink,
  AlertTriangle,
  Scissors,
  X,
  Globe,
  Settings
} from 'lucide-react';
import { useQRContext } from '../context/QRContext';
import FloatingPanel, { SliderControl, ButtonGroupControl, DropdownControl } from './FloatingPanel';

interface QRFloatingToolbarProps {
  isVisible: boolean;
  selectedQRId: string | null;
}

const QRFloatingToolbar: React.FC<QRFloatingToolbarProps> = ({ 
  isVisible, 
  selectedQRId
}) => {
  const { qrElements, updateQRElement, deleteQRElement, duplicateQRElement } = useQRContext();
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showEditUrlPanel, setShowEditUrlPanel] = useState(false);
  const [editUrl, setEditUrl] = useState('');
  const [urlError, setUrlError] = useState('');
  
  // QR adjustment states
  const [foregroundColor, setForegroundColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [errorCorrection, setErrorCorrection] = useState<'L' | 'M' | 'Q' | 'H'>('M');
  const [opacity, setOpacity] = useState(100);
  const [rotation, setRotation] = useState(0);
  
  // Refs for panel positioning
  const fillColorRef = useRef<HTMLButtonElement>(null);
  const styleRef = useRef<HTMLButtonElement>(null);
  const editUrlRef = useRef<HTMLButtonElement>(null);
  const opacityRef = useRef<HTMLButtonElement>(null);
  const layerRef = useRef<HTMLButtonElement>(null);
  const moreRef = useRef<HTMLButtonElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  const selectedElement = qrElements.find(el => el.id === selectedQRId);

  // Initialize values from selected element
  useEffect(() => {
    if (selectedElement) {
      setForegroundColor(selectedElement.foregroundColor || '#000000');
      setBackgroundColor(selectedElement.backgroundColor || '#FFFFFF');
      setErrorCorrection(selectedElement.errorCorrectionLevel || 'M');
      setOpacity(selectedElement.opacity || 100);
      setRotation(selectedElement.rotation || 0);
      setEditUrl(selectedElement.url || '');
    }
  }, [selectedElement]);

  if (!isVisible || !selectedElement) {
    return null;
  }

  const openPanel = (panelName: string) => {
    setActivePanel(activePanel === panelName ? null : panelName);
    setShowMoreMenu(false);
    setShowEditUrlPanel(false);
  };

  const closePanel = () => {
    setActivePanel(null);
    setShowEditUrlPanel(false);
  };

  const validateUrl = (url: string): boolean => {
    try {
      const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      return urlPattern.test(url);
    } catch {
      return false;
    }
  };

  const normalizeUrl = (url: string): string => {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    return url;
  };

  const handleForegroundColorChange = (color: string) => {
    setForegroundColor(color);
    if (selectedElement) {
      updateQRElement(selectedElement.id, { foregroundColor: color });
    }
  };

  const handleFillColorClick = () => {
    // Trigger the sidebar to show QR fill color panel
    const event = new CustomEvent('openQRFillColorPanel', {
      detail: { qrId: selectedElement?.id, currentColor: foregroundColor }
    });
    window.dispatchEvent(event);
    setShowMoreMenu(false);
    setActivePanel(null);
    setShowEditUrlPanel(false);
  };

  const handleBackgroundColorChange = (color: string) => {
    setBackgroundColor(color);
    if (selectedElement) {
      updateQRElement(selectedElement.id, { backgroundColor: color });
    }
  };

  const handleErrorCorrectionChange = (level: string) => {
    setErrorCorrection(level as 'L' | 'M' | 'Q' | 'H');
    if (selectedElement) {
      updateQRElement(selectedElement.id, { errorCorrectionLevel: level as 'L' | 'M' | 'Q' | 'H' });
    }
  };

  const handleOpacityChange = (value: number) => {
    setOpacity(value);
    if (selectedElement) {
      updateQRElement(selectedElement.id, { opacity: value });
    }
  };

  const handleRotationChange = (value: number) => {
    setRotation(value);
    if (selectedElement) {
      updateQRElement(selectedElement.id, { rotation: value });
    }
  };

  const handleEditUrl = () => {
    setShowEditUrlPanel(true);
    setActivePanel(null);
    setShowMoreMenu(false);
  };

  const handleStyleClick = () => {
    // Trigger the sidebar to show QR style panel
    const event = new CustomEvent('openQRStylePanel', {
      detail: { qrId: selectedElement?.id }
    });
    window.dispatchEvent(event);
    setShowMoreMenu(false);
    setActivePanel(null);
    setShowEditUrlPanel(false);
  };

  const handleUrlSubmit = () => {
    if (!editUrl.trim()) {
      setUrlError('URL cannot be empty');
      return;
    }

    if (!validateUrl(editUrl)) {
      setUrlError('Please enter a valid URL');
      return;
    }

    const normalizedUrl = normalizeUrl(editUrl);
    if (selectedElement) {
      updateQRElement(selectedElement.id, { url: normalizedUrl });
    }
    
    setUrlError('');
    setShowEditUrlPanel(false);
  };

  const handleUrlCancel = () => {
    setEditUrl(selectedElement?.url || '');
    setUrlError('');
    setShowEditUrlPanel(false);
  };

  const handleDuplicate = () => {
    if (selectedElement) {
      duplicateQRElement(selectedElement.id);
    }
    setShowMoreMenu(false);
  };

  const handleDelete = () => {
    if (selectedElement) {
      deleteQRElement(selectedElement.id);
    }
    setShowMoreMenu(false);
  };

  const handleLock = () => {
    if (selectedElement) {
      updateQRElement(selectedElement.id, { locked: !selectedElement.locked });
    }
    setShowMoreMenu(false);
  };

  const handleExport = () => {
    // Create a temporary canvas to export the QR code
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx && selectedElement) {
      canvas.width = selectedElement.width;
      canvas.height = selectedElement.height;
      
      // Find the QR element in the DOM and get its image
      const qrElement = document.querySelector(`[title="QR Code: ${selectedElement.url}"] img`) as HTMLImageElement;
      if (qrElement) {
        ctx.drawImage(qrElement, 0, 0, canvas.width, canvas.height);
        
        // Download the image
        const link = document.createElement('a');
        link.download = `qr-code-${Date.now()}.png`;
        link.href = canvas.toDataURL();
        link.click();
      }
    }
    setShowMoreMenu(false);
  };

  const handleVisitUrl = () => {
    if (selectedElement?.url) {
      window.open(selectedElement.url, '_blank', 'noopener,noreferrer');
    }
    setShowMoreMenu(false);
  };

  const errorCorrectionOptions = [
    { value: 'L', label: 'Low (7%)' },
    { value: 'M', label: 'Medium (15%)' },
    { value: 'Q', label: 'Quartile (25%)' },
    { value: 'H', label: 'High (30%)' }
  ];

  const presetColors = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
    '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#008000', '#FFC0CB'
  ];

  const ColorPickerPanel = ({ title, currentColor, onColorChange }: { 
    title: string; 
    currentColor: string; 
    onColorChange: (color: string) => void; 
  }) => (
    <div className="w-80 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        <button
          onClick={closePanel}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Color input */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <input
            type="color"
            value={currentColor}
            onChange={(e) => onColorChange(e.target.value)}
            className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer"
          />
          <input
            type="text"
            value={currentColor}
            onChange={(e) => onColorChange(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="#000000"
          />
        </div>
      </div>

      {/* Preset colors */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">Preset colors</h4>
        <div className="grid grid-cols-6 gap-2">
          {presetColors.map((color, index) => (
            <button
              key={index}
              onClick={() => onColorChange(color)}
              className={`w-8 h-8 rounded-lg border-2 transition-all hover:scale-110 ${
                currentColor === color ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-400'
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div 
        ref={toolbarRef}
        className="qr-toolbar fixed bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 px-4 py-3"
        style={{
          top: '120px',
          left: 'calc(50% + 4cm)',
          transform: 'translateX(-50%)',
          pointerEvents: 'auto'
        }}
      >
        {/* Main Toolbar */}
        <div className="flex items-center space-x-2">
          {/* QR Fill Color */}
          <div className="relative">
            <button
              ref={fillColorRef}
              onClick={handleFillColorClick}
              className="w-10 h-10 rounded-full border-2 border-gray-300 cursor-pointer hover:border-gray-400 transition-colors shadow-sm"
              style={{ backgroundColor: foregroundColor }}
              title="QR Fill Color"
            />
          </div>

          {/* QR Style Settings - Updated to trigger sidebar panel */}
          <button
            ref={styleRef}
            onClick={handleStyleClick}
            className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            title="QR Style Settings"
          >
            <QrCode className="w-4 h-4" />
            <span className="text-sm font-medium">Style</span>
          </button>

          {/* Edit URL */}
          <button
            ref={editUrlRef}
            onClick={handleEditUrl}
            className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            title="Edit URL"
          >
            <Edit3 className="w-4 h-4" />
            <span className="text-sm font-medium">Edit URL</span>
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-300"></div>

          {/* Opacity Control */}
          <button
            ref={opacityRef}
            onClick={() => openPanel('opacity')}
            className={`p-2 rounded-md transition-colors ${
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

          {/* Rotation Control */}
          <button
            onClick={() => {
              const newRotation = (rotation + 90) % 360;
              handleRotationChange(newRotation);
            }}
            className="p-2 hover:bg-gray-50 rounded-md transition-colors"
            title="Rotate 90°"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          {/* Layer Control */}
          <button
            ref={layerRef}
            onClick={() => openPanel('layer')}
            className={`p-2 rounded-md transition-colors ${
              activePanel === 'layer' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
            }`}
            title="Layer Order"
          >
            <Layers className="w-4 h-4" />
          </button>
          
          <FloatingPanel
            isOpen={activePanel === 'layer'}
            onClose={closePanel}
            title="Layer Order"
            anchorRef={layerRef}
          >
            <ButtonGroupControl
              label="Position"
              options={[
                { value: 'front', label: 'Front' },
                { value: 'back', label: 'Back' }
              ]}
              value="front"
              onChange={(value) => {
                console.log('Layer order:', value);
              }}
            />
          </FloatingPanel>

          {/* More Options */}
          <div className="relative">
            <button 
              ref={moreRef}
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className={`p-2 rounded-md transition-colors ${
                showMoreMenu ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
              }`}
              title="More Options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            
            {showMoreMenu && (
              <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-10 min-w-[160px]">
                <button 
                  onClick={handleVisitUrl}
                  className="flex items-center space-x-3 w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Visit URL</span>
                </button>
                
                <button 
                  onClick={handleExport}
                  className="flex items-center space-x-3 w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Export QR</span>
                </button>
                
                <div className="border-t border-gray-100"></div>
                
                <button 
                  onClick={handleDuplicate}
                  className="flex items-center space-x-3 w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  <span>Duplicate</span>
                </button>
                
                <button 
                  onClick={handleLock}
                  className="flex items-center space-x-3 w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors"
                >
                  <Lock className="w-4 h-4" />
                  <span>{selectedElement?.locked ? 'Unlock' : 'Lock'}</span>
                </button>
                
                <div className="border-t border-gray-100"></div>
                
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

      {/* Edit URL Panel */}
      {showEditUrlPanel && (
        <div 
          className="fixed bg-white rounded-xl shadow-2xl border border-gray-200 z-40 p-6"
          style={{
            top: '180px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '400px'
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Edit QR Code URL</h3>
            <button
              onClick={handleUrlCancel}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Website URL</label>
              <div className="relative">
                <input
                  type="url"
                  value={editUrl}
                  onChange={(e) => {
                    setEditUrl(e.target.value);
                    setUrlError('');
                  }}
                  placeholder="https://www.example.com/"
                  className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                    urlError 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                />
                <Globe className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
              {urlError && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  {urlError}
                </p>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleUrlCancel}
                className="flex-1 py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUrlSubmit}
                className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Update QR Code
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close panels */}
      {(showMoreMenu || showEditUrlPanel) && (
        <div 
          className="fixed inset-0 z-30"
          onClick={() => {
            setShowMoreMenu(false);
            setShowEditUrlPanel(false);
          }}
        />
      )}
    </>
  );
};

export default QRFloatingToolbar;