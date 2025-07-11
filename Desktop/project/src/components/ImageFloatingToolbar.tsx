import React, { useRef, useEffect, useState } from 'react';
import { 
  RefreshCw, 
  Crop,
  Sliders, 
  Layers, 
  FlipHorizontal, 
  MoreHorizontal,
  Copy,
  Trash2,
  RotateCw,
  Lock,
  Eye,
  Zap,
  Scissors
} from 'lucide-react';
import { useImageContext } from '../context/ImageContext';
import FloatingPanel, { SliderControl, ButtonGroupControl } from './FloatingPanel';

interface ImageFloatingToolbarProps {
  isVisible: boolean;
  selectedImageId: string | null;
}

const ImageFloatingToolbar: React.FC<ImageFloatingToolbarProps> = ({ 
  isVisible, 
  selectedImageId
}) => {
  const { imageElements, updateImageElement, deleteImageElement, duplicateImageElement } = useImageContext();
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isCropMode, setIsCropMode] = useState(false);
  
  // Image adjustment states
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(1);
  const [brightness, setBrightness] = useState(1);
  const [contrast, setContrast] = useState(1);
  
  // Refs for panel positioning
  const rotationRef = useRef<HTMLButtonElement>(null);
  const opacityRef = useRef<HTMLButtonElement>(null);
  const adjustRef = useRef<HTMLButtonElement>(null);
  const layerRef = useRef<HTMLButtonElement>(null);
  const flipRef = useRef<HTMLButtonElement>(null);
  const moreRef = useRef<HTMLButtonElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  const selectedElement = imageElements.find(el => el.id === selectedImageId);

  // Initialize adjustment values from selected element
  useEffect(() => {
    if (selectedElement && selectedElement.filter) {
      // Parse existing filter values more accurately
      const hueMatch = selectedElement.filter.match(/hue-rotate\(([^)]+)\)/);
      const satMatch = selectedElement.filter.match(/saturate\(([^)]+)\)/);
      const brightMatch = selectedElement.filter.match(/brightness\(([^)]+)\)/);
      const contrastMatch = selectedElement.filter.match(/contrast\(([^)]+)\)/);
      
      if (hueMatch) {
        const value = parseFloat(hueMatch[1].replace('deg', ''));
        setHue(isNaN(value) ? 0 : value);
      }
      if (satMatch) {
        const value = parseFloat(satMatch[1]);
        setSaturation(isNaN(value) ? 1 : value);
      }
      if (brightMatch) {
        const value = parseFloat(brightMatch[1]);
        setBrightness(isNaN(value) ? 1 : value);
      }
      if (contrastMatch) {
        const value = parseFloat(contrastMatch[1]);
        setContrast(isNaN(value) ? 1 : value);
      }
    } else {
      // Reset to defaults
      setHue(0);
      setSaturation(1);
      setBrightness(1);
      setContrast(1);
    }
  }, [selectedElement]);

  if (!isVisible || !selectedElement || isCropMode) {
    return null;
  }

  const openPanel = (panelName: string) => {
    setActivePanel(activePanel === panelName ? null : panelName);
    setShowMoreMenu(false);
  };

  const closePanel = () => {
    setActivePanel(null);
  };

  const applyFilter = (newHue = hue, newSaturation = saturation, newBrightness = brightness, newContrast = contrast) => {
    if (selectedElement) {
      // Ensure values are within reasonable bounds
      const clampedHue = Math.max(-180, Math.min(180, newHue));
      const clampedSaturation = Math.max(0, Math.min(3, newSaturation));
      const clampedBrightness = Math.max(0, Math.min(3, newBrightness));
      const clampedContrast = Math.max(0, Math.min(3, newContrast));
      
      const filterString = `hue-rotate(${clampedHue}deg) saturate(${clampedSaturation}) brightness(${clampedBrightness}) contrast(${clampedContrast})`;
      updateImageElement(selectedElement.id, { filter: filterString });
      console.log('Applied filter:', filterString);
    }
  };

  const handleOpacityChange = (value: number) => {
    if (selectedElement) {
      updateImageElement(selectedElement.id, { opacity: value });
    }
  };

  const handleRotationChange = (value: number) => {
    if (selectedElement) {
      updateImageElement(selectedElement.id, { rotation: value });
    }
  };

  const handleHueChange = (value: number) => {
    setHue(value);
    applyFilter(value, saturation, brightness, contrast);
  };

  const handleSaturationChange = (value: number) => {
    setSaturation(value);
    console.log('Saturation changed to:', value);
    applyFilter(hue, value, brightness, contrast);
  };

  const handleBrightnessChange = (value: number) => {
    setBrightness(value);
    applyFilter(hue, saturation, value, contrast);
  };

  const handleContrastChange = (value: number) => {
    setContrast(value);
    console.log('Contrast changed to:', value);
    applyFilter(hue, saturation, brightness, value);
  };

  const resetImageAdjustments = () => {
    setHue(0);
    setSaturation(1);
    setBrightness(1);
    setContrast(1);
    if (selectedElement) {
      updateImageElement(selectedElement.id, { filter: 'none' });
    }
  };

  const handleFlipHorizontal = () => {
    if (selectedElement) {
      const currentRotation = selectedElement.rotation || 0;
      updateImageElement(selectedElement.id, { rotation: currentRotation + 180 });
    }
  };

  const handleFlipVertical = () => {
    if (selectedElement) {
      // Apply vertical flip using CSS transform
      const currentTransform = selectedElement.transform || '';
      const newTransform = currentTransform.includes('scaleY(-1)') 
        ? currentTransform.replace('scaleY(-1)', '') 
        : `${currentTransform} scaleY(-1)`;
      updateImageElement(selectedElement.id, { transform: newTransform.trim() });
    }
  };

  const handleDuplicate = () => {
    if (selectedElement) {
      duplicateImageElement(selectedElement.id);
    }
    setShowMoreMenu(false);
  };

  const handleDelete = () => {
    if (selectedElement) {
      deleteImageElement(selectedElement.id);
    }
    setShowMoreMenu(false);
  };

  const handleReplace = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && selectedElement) {
        const url = URL.createObjectURL(file);
        updateImageElement(selectedElement.id, { src: url });
      }
    };
    input.click();
  };

  const handleSharpen = () => {
    if (selectedElement) {
      const newContrast = Math.min(2, contrast + 0.2);
      const newBrightness = Math.min(1.5, brightness + 0.1);
      setContrast(newContrast);
      setBrightness(newBrightness);
      applyFilter(hue, saturation, newBrightness, newContrast);
    }
  };

  const handleRemoveBackground = () => {
    if (selectedElement) {
      // Simulate background removal with high contrast and saturation
      const newContrast = 1.5;
      const newSaturation = 1.3;
      const newBrightness = 1.2;
      setContrast(newContrast);
      setSaturation(newSaturation);
      setBrightness(newBrightness);
      applyFilter(hue, newSaturation, newBrightness, newContrast);
    }
  };

  const handleCrop = () => {
    setIsCropMode(true);
    // Trigger the sidebar to show crop interface
    const event = new CustomEvent('openCropInterface', {
      detail: { imageSrc: selectedElement?.src }
    });
    window.dispatchEvent(event);
  };

  const handleLock = () => {
    if (selectedElement) {
      updateImageElement(selectedElement.id, { locked: !selectedElement.locked });
    }
    setShowMoreMenu(false);
  };

  return (
    <>
      <div 
        ref={toolbarRef}
        className="image-toolbar fixed bg-white rounded-2xl shadow-2xl border border-gray-200 z-50"
        style={{
          top: '120px',
          left: 'calc(50% + 4cm)',
          transform: 'translateX(-50%)',
          pointerEvents: 'auto'
        }}
      >
        {/* Main Toolbar */}
        <div className="flex items-center">
          {/* Primary Tools */}
          <div className="flex items-center px-3 py-2 border-r border-gray-200">
            <button
              onClick={handleReplace}
              className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-sm font-medium"
              title="Replace"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Replace</span>
            </button>
          </div>

          {/* Sharpen Tool */}
          <div className="flex items-center px-3 py-2 border-r border-gray-200">
            <button
              onClick={handleSharpen}
              className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-sm font-medium"
              title="Sharpen"
            >
              <Zap className="w-4 h-4" />
              <span>Sharpen</span>
            </button>
          </div>

          {/* Remove Background Tool */}
          <div className="flex items-center px-3 py-2 border-r border-gray-200">
            <button
              onClick={handleRemoveBackground}
              className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-sm font-medium"
              title="Remove Background"
            >
              <Scissors className="w-4 h-4" />
              <span>Remove BG</span>
            </button>
          </div>

          {/* Crop Tool */}
          <div className="flex items-center px-3 py-2 border-r border-gray-200">
            <button
              onClick={handleCrop}
              className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-sm font-medium"
              title="Crop"
            >
              <Crop className="w-4 h-4" />
              <span>Crop</span>
            </button>
          </div>

          {/* Adjust Panel */}
          <div className="flex items-center px-3 py-2 border-r border-gray-200 relative">
            <button
              ref={adjustRef}
              onClick={() => openPanel('adjust')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                activePanel === 'adjust' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
              }`}
              title="Adjust"
            >
              <Sliders className="w-4 h-4" />
              <span>Adjust</span>
            </button>
            
            <FloatingPanel
              isOpen={activePanel === 'adjust'}
              onClose={closePanel}
              title="Adjust Image"
              anchorRef={adjustRef}
            >
              <div className="space-y-6 w-80">
                <SliderControl
                  label="Hue"
                  value={hue}
                  min={-180}
                  max={180}
                  step={1}
                  unit="°"
                  onChange={handleHueChange}
                  onReset={() => handleHueChange(0)}
                  defaultValue={0}
                />
                
                <SliderControl
                  label="Saturation"
                  value={saturation}
                  min={0}
                  max={3}
                  step={0.1}
                  onChange={handleSaturationChange}
                  onReset={() => handleSaturationChange(1)}
                  defaultValue={1}
                />
                
                <SliderControl
                  label="Brightness"
                  value={brightness}
                  min={0}
                  max={2}
                  step={0.1}
                  onChange={handleBrightnessChange}
                  onReset={() => handleBrightnessChange(1)}
                  defaultValue={1}
                />
                
                <SliderControl
                  label="Contrast"
                  value={contrast}
                  min={0}
                  max={3}
                  step={0.1}
                  onChange={handleContrastChange}
                  onReset={() => handleContrastChange(1)}
                  defaultValue={1}
                />

                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={resetImageAdjustments}
                    className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Reset All Adjustments
                  </button>
                </div>
              </div>
            </FloatingPanel>
          </div>

          {/* Icon Tools */}
          <div className="flex items-center px-2 py-2 space-x-1">
            {/* Layer Control */}
            <button
              ref={layerRef}
              onClick={() => openPanel('layer')}
              className={`p-2 rounded-lg transition-colors ${
                activePanel === 'layer' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
              }`}
              title="Layer"
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

            {/* Flip Control */}
            <button
              ref={flipRef}
              onClick={() => openPanel('flip')}
              className={`p-2 rounded-lg transition-colors ${
                activePanel === 'flip' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
              }`}
              title="Flip"
            >
              <FlipHorizontal className="w-4 h-4" />
            </button>
            
            <FloatingPanel
              isOpen={activePanel === 'flip'}
              onClose={closePanel}
              title="Flip Image"
              anchorRef={flipRef}
            >
              <ButtonGroupControl
                label="Direction"
                options={[
                  { value: 'horizontal', label: 'Horizontal', icon: FlipHorizontal },
                  { value: 'vertical', label: 'Vertical', icon: RotateCw }
                ]}
                value="horizontal"
                onChange={(value) => {
                  if (value === 'horizontal') {
                    handleFlipHorizontal();
                  } else {
                    handleFlipVertical();
                  }
                }}
              />
            </FloatingPanel>

            {/* Opacity Control */}
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
                value={selectedElement?.opacity || 100}
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
              ref={rotationRef}
              onClick={() => openPanel('rotation')}
              className={`p-2 rounded-lg transition-colors ${
                activePanel === 'rotation' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
              }`}
              title="Rotation"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            
            <FloatingPanel
              isOpen={activePanel === 'rotation'}
              onClose={closePanel}
              title="Rotation"
              anchorRef={rotationRef}
            >
              <SliderControl
                label="Angle"
                value={selectedElement?.rotation || 0}
                min={0}
                max={360}
                step={1}
                unit="°"
                onChange={handleRotationChange}
                onReset={() => handleRotationChange(0)}
                defaultValue={0}
              />
            </FloatingPanel>

            {/* More Options */}
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
                  
                  <button 
                    onClick={handleLock}
                    className="flex items-center space-x-3 w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors"
                  >
                    <Lock className="w-4 h-4" />
                    <span>{selectedElement?.locked ? 'Unlock' : 'Lock'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close more menu */}
      {showMoreMenu && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setShowMoreMenu(false)}
        />
      )}
    </>
  );
};

export default ImageFloatingToolbar;