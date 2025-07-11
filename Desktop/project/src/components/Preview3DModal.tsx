import React, { useState, useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, PresentationControls, Html } from '@react-three/drei';
import { X, Download, RotateCcw, ZoomIn, ZoomOut, Settings, ChevronLeft, ChevronRight, Smartphone, QrCode } from 'lucide-react';
import * as THREE from 'three';
import { useTextContext } from '../context/TextContext';
import { useImageContext } from '../context/ImageContext';
import { useGraphicsContext } from '../context/GraphicsContext';
import { useQRContext } from '../context/QRContext';
import { useCanvasContext } from '../context/CanvasContext';
import { createCanvasFromImage } from '../utils/canvasImageLoader';
import { generateARQRCode, getARInstructions } from '../utils/arUtils';
import QRCode from 'qrcode';

interface Preview3DModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// AR QR Modal Component
const ARQRModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      // Generate QR code for AR view with a proper AR-enabled URL
      // This should point to your actual AR viewer URL
      const arUrl = `${window.location.origin}/#ar-view`;
      
      QRCode.toDataURL(arUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'M',
      }).then(url => {
        setQrCodeUrl(url);
      }).catch(err => {
        console.error('Error generating QR code:', err);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">View in AR</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <div className="mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Smartphone className="w-8 h-8 text-blue-600" />
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">Scan with your phone</h4>
          <p className="text-sm text-gray-600 mb-6">
            Point your phone's camera at the QR code below to view this mug in augmented reality
          </p>
        </div>

        {qrCodeUrl && (
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <img 
              src={qrCodeUrl} 
              alt="AR QR Code" 
              className="w-48 h-48 mx-auto border border-gray-200 rounded-lg"
            />
          </div>
        )}

        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Works with iOS 12+ and Android 7+</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>No app download required</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Place the mug in your space</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

// Mug 3D Model Component
function MugModel({ rotation, autoRotate, currentSide }: { 
  rotation: [number, number, number], 
  autoRotate: boolean,
  currentSide: 'front' | 'back'
}) {
  const gltf = useGLTF('/mug/scene.gltf');
  const meshRef = useRef<THREE.Group>(null);
  const { textElements } = useTextContext();
  const { imageElements } = useImageContext();
  const { graphicElements } = useGraphicsContext();
  const { qrElements } = useQRContext();
  const { canvasSize, canvasBackgroundColor } = useCanvasContext();
  
  const [dynamicTexture, setDynamicTexture] = useState<THREE.Texture | null>(null);

  useFrame((state) => {
    if (meshRef.current) {
      if (autoRotate) {
        // When auto-rotating, ignore manual rotation and just rotate continuously
        meshRef.current.rotation.y = state.clock.elapsedTime * 0.1;
        meshRef.current.rotation.x = 0;
        meshRef.current.rotation.z = 0;
      } else {
        // When not auto-rotating, use the manual rotation values based on current side
        if (currentSide === 'front') {
          meshRef.current.rotation.x = 0;
          meshRef.current.rotation.y = 0;
          meshRef.current.rotation.z = 0;
        } else {
          // Back view - rotate 180 degrees around Y axis
          meshRef.current.rotation.x = 0;
          meshRef.current.rotation.y = Math.PI;
          meshRef.current.rotation.z = 0;
        }
      }
    }
  });

  // Generate dynamic texture from canvas elements
  useEffect(() => {
    const updateTexture = async () => {
      try {
        console.log('Generating dynamic texture from canvas elements...');
        
        const dataUrl = await createCanvasFromImage({
          textElements,
          imageElements,
          graphicElements,
          qrElements,
          canvasSize,
          canvasBackgroundColor
        });
        
        if (dataUrl) {
          // Create Three.js texture from data URL
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            const texture = new THREE.Texture(img);
            texture.needsUpdate = true;
            texture.flipY = false;
            texture.wrapS = THREE.ClampToEdgeWrapping;
            texture.wrapT = THREE.ClampToEdgeWrapping;
            texture.magFilter = THREE.LinearFilter;
            texture.minFilter = THREE.LinearMipmapLinearFilter;
            texture.generateMipmaps = true;
            texture.format = THREE.RGBAFormat;
            texture.type = THREE.UnsignedByteType;
            texture.colorSpace = THREE.SRGBColorSpace;
            setDynamicTexture(texture);
          };
          img.src = dataUrl;
          console.log('Dynamic texture created successfully');
        }
      } catch (error) {
        console.error('Error generating dynamic texture:', error);
      }
    };
    
    updateTexture();
  }, [textElements, imageElements, graphicElements, qrElements, canvasSize, canvasBackgroundColor]);

  // Apply the dynamic texture to the mug materials
  useEffect(() => {
    if (!dynamicTexture || !gltf.scene) return;
    
    console.log('Applying dynamic texture to mug materials');
    
    // Find and update materials that should use the dynamic canvas texture
    gltf.scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        
        materials.forEach((material) => {
          // Look for the material named "image_texture" which corresponds to canvas_export in scenev1.gltf
          if (material.name === 'image_texture' || 
              (material.map && material.map.image && 
               (material.map.image.src?.includes('canvas_export') || 
                material.map.image.currentSrc?.includes('canvas_export')))) {
            console.log('Replacing canvas_export texture with dynamic canvas texture');
            
            // Preserve material properties for accurate color reproduction
            const originalMap = material.map;
            
            material.map = dynamicTexture;
            
            // Ensure proper color space and material settings
            material.colorSpace = THREE.SRGBColorSpace;
            material.transparent = false;
            material.alphaTest = 0;
            
            // Copy any important properties from original material
            if (originalMap) {
              dynamicTexture.offset.copy(originalMap.offset);
              dynamicTexture.repeat.copy(originalMap.repeat);
              dynamicTexture.center.copy(originalMap.center);
              dynamicTexture.rotation = originalMap.rotation;
            }
            
            material.needsUpdate = true;
          }
        });
      }
    });
  }, [dynamicTexture, gltf.scene]);

  // Clone the scene to avoid modifying the original
  const clonedScene = gltf.scene.clone();

  return (
    <primitive 
      ref={meshRef}
      object={clonedScene} 
      scale={[25, 25, 25]}
      position={[0, -2, 0]}
    />
  );
}

// Loading component
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600 font-medium">Loading 3D preview...</p>
      </div>
    </div>
  );
}

const Preview3DModal: React.FC<Preview3DModalProps> = ({ isOpen, onClose }) => {
  const [currentSide, setCurrentSide] = useState<'front' | 'back'>('front');
  const [zoom, setZoom] = useState(100);
  const [autoRotate, setAutoRotate] = useState(true);
  const [rotation, setRotation] = useState<[number, number, number]>([0, 0, 0]);
  const [showARModal, setShowARModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  
  const { textElements } = useTextContext();
  const { imageElements } = useImageContext();
  const { graphicElements } = useGraphicsContext();
  const { qrElements } = useQRContext();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Generate AR QR code when modal opens
  useEffect(() => {
    if (isOpen) {
      // Generate QR code for AR view
      const arUrl = `${window.location.origin}${window.location.pathname}#ar-view`;
      console.log('Generating QR code for URL:', arUrl);
      
      QRCode.toDataURL(arUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'M',
      }).then(url => {
        console.log('QR code generated successfully');
        setQrCodeUrl(url);
      }).catch(err => {
        console.error('Error generating QR code:', err);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSideChange = (side: 'front' | 'back') => {
    setCurrentSide(side);
    setAutoRotate(false); // Stop auto rotation when manually changing sides
    
    // The rotation will be handled in the MugModel component based on currentSide
    console.log(`Switching to ${side} view`);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(200, prev + 10));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(50, prev - 10));
  };

  const handleReset = () => {
    setZoom(100);
    setRotation([0, 0, 0]);
    setCurrentSide('front');
    setAutoRotate(true);
  };

  const handleDownload = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = 'mug-preview.png';
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const totalElements = textElements.length + imageElements.length + graphicElements.length + qrElements.length;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Download className="w-5 h-5 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">3D Preview</h2>
              <span className="text-sm text-gray-500">({totalElements} elements mapped)</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Drag to rotate • Scroll to zoom</span>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex">
            {/* 3D Viewer */}
            <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 relative">
              <Suspense fallback={<LoadingSpinner />}>
                <Canvas
                  camera={{ position: [0, 0, 8], fov: 50 }}
                  style={{ width: '100%', height: '100%' }}
                  gl={{ antialias: true, alpha: true }}
                >
                  {/* Lighting */}
                  <ambientLight intensity={0.6} />
                  <directionalLight 
                    position={[10, 10, 5]} 
                    intensity={1.0} 
                    castShadow
                  />
                  <pointLight position={[-10, -10, -5]} intensity={0.3} />
                  
                  <PresentationControls
                    enabled={true}
                    global={false}
                    cursor={true}
                    snap={false}
                    speed={1}
                    zoom={zoom / 100}
                    rotation={rotation}
                    polar={[-Math.PI / 3, Math.PI / 3]}
                    azimuth={[-Math.PI / 1.4, Math.PI / 1.4]}
                  >
                    <MugModel 
                      rotation={rotation} 
                      autoRotate={autoRotate} 
                      currentSide={currentSide}
                    />
                  </PresentationControls>
                  
                  <Environment preset="apartment" />
                </Canvas>
              </Suspense>

              {/* Top Right Controls */}
              <div className="absolute top-4 right-4 flex flex-col space-y-2">
                {/* Front/Back Toggle */}
                <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-2 flex space-x-1">
                  <button
                    onClick={() => handleSideChange('front')}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors text-sm font-medium ${
                      currentSide === 'front' 
                        ? 'bg-blue-500 text-white' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    title="View front of mug"
                  >
                    <span>Front</span>
                  </button>
                  <button
                    onClick={() => handleSideChange('back')}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors text-sm font-medium ${
                      currentSide === 'back' 
                        ? 'bg-blue-500 text-white' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    title="View back of mug"
                  >
                    <span>Back</span>
                  </button>
                </div>

                {/* View in AR Button */}
                <button
                  onClick={() => setShowARModal(true)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-3 rounded-lg shadow-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center space-x-2 font-medium"
                >
                  <QrCode className="w-5 h-5" />
                  <span>View in AR</span>
                </button>
              </div>

              {/* Element Count Indicator */}
              {totalElements > 0 && (
                <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg px-3 py-2">
                  <div className="text-sm font-medium text-gray-900">Design Elements</div>
                  <div className="text-xs text-gray-600">
                    {textElements.length > 0 && `${textElements.length} text`}
                    {textElements.length > 0 && (imageElements.length > 0 || graphicElements.length > 0 || qrElements.length > 0) && ', '}
                    {imageElements.length > 0 && `${imageElements.length} image${imageElements.length !== 1 ? 's' : ''}`}
                    {imageElements.length > 0 && (graphicElements.length > 0 || qrElements.length > 0) && ', '}
                    {graphicElements.length > 0 && `${graphicElements.length} graphic${graphicElements.length !== 1 ? 's' : ''}`}
                    {graphicElements.length > 0 && qrElements.length > 0 && ', '}
                    {qrElements.length > 0 && `${qrElements.length} QR code${qrElements.length !== 1 ? 's' : ''}`}
                  </div>
                </div>
              )}
            </div>

            {/* AR QR Code Panel - Show when AR modal would be open */}
            {showARModal && (
              <div className="w-80 bg-white border-l border-gray-200 p-6 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">View in AR</h3>
                  <button
                    onClick={() => setShowARModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Smartphone className="w-8 h-8 text-blue-600" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2 text-center">Scan with your phone</h4>
                  <p className="text-sm text-gray-600 mb-6 text-center">
                    {getARInstructions()}
                  </p>

                  {qrCodeUrl && (
                    <div className="bg-gray-50 rounded-xl p-6 mb-6">
                      <img 
                        src={qrCodeUrl} 
                        alt="AR QR Code" 
                        className="w-48 h-48 mx-auto border border-gray-200 rounded-lg"
                      />
                    </div>
                  )}

                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Works with iOS 12+ and Android 7+</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>No app download required</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Place the mug in your space</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Controls */}
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="flex items-center justify-between">
              {/* Zoom Controls */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleZoomOut}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Zoom out"
                >
                  <ZoomOut className="w-4 h-4 text-gray-600" />
                </button>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 min-w-[3rem]">{zoom}%</span>
                  <input
                    type="range"
                    min="50"
                    max="200"
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
                
                <button
                  onClick={handleZoomIn}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Zoom in"
                >
                  <ZoomIn className="w-4 h-4 text-gray-600" />
                </button>

                {/* Auto Rotate and Reset Controls moved to bottom */}
                <div className="flex items-center space-x-2 ml-6">
                  <button
                    onClick={() => setAutoRotate(!autoRotate)}
                    className={`p-2 rounded-lg transition-colors ${
                      autoRotate ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                    title={autoRotate ? 'Stop auto rotation' : 'Start auto rotation'}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={handleReset}
                    className="p-2 bg-gray-200 text-gray-600 hover:bg-gray-300 rounded-lg transition-colors"
                    title="Reset view"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Current View Indicator */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  Currently viewing: <span className="font-medium capitalize">{currentSide}</span>
                </span>
              </div>

              {/* Info */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  {totalElements > 0 ? `All ${totalElements} canvas elements are now visible on the 3D mug` : 'Add elements to your design to see them on the 3D mug'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Preview3DModal;