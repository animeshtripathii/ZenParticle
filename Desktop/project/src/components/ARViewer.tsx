import React, { useEffect, useRef, useState, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Html } from '@react-three/drei';
import { X, ArrowLeft, Download, Share2, RotateCcw, AlertTriangle, Smartphone } from 'lucide-react';
import * as THREE from 'three';
import { useTextContext } from '../context/TextContext';
import { useImageContext } from '../context/ImageContext';
import { useGraphicsContext } from '../context/GraphicsContext';
import { useQRContext } from '../context/QRContext';
import { useCanvasContext } from '../context/CanvasContext';
import { createCanvasFromImage } from '../utils/canvasImageLoader';

interface ARViewerProps {
  isOpen: boolean;
  onClose: () => void;
}

// AR Mug Model Component
function ARMugModel() {
  const gltf = useGLTF('/mug/scene.gltf');
  const meshRef = useRef<THREE.Group>(null);
  const { textElements } = useTextContext();
  const { imageElements } = useImageContext();
  const { graphicElements } = useGraphicsContext();
  const { qrElements } = useQRContext();
  const { canvasSize, canvasBackgroundColor } = useCanvasContext();
  
  const [dynamicTexture, setDynamicTexture] = useState<THREE.Texture | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle rotation for AR preview
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  // Generate dynamic texture from canvas elements
  useEffect(() => {
    const updateTexture = async () => {
      try {
        setIsLoading(true);
        console.log('Generating AR texture...');
        
        const dataUrl = await createCanvasFromImage({
          textElements,
          imageElements,
          graphicElements,
          qrElements,
          canvasSize,
          canvasBackgroundColor
        });
        
        if (dataUrl) {
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
            setIsLoading(false);
            console.log('AR texture generated successfully');
          };
          img.onerror = () => {
            console.error('Failed to load texture image');
            setIsLoading(false);
          };
          img.src = dataUrl;
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error generating AR texture:', error);
        setIsLoading(false);
      }
    };
    
    updateTexture();
  }, [textElements, imageElements, graphicElements, qrElements, canvasSize, canvasBackgroundColor]);

  // Apply the dynamic texture to the mug materials
  useEffect(() => {
    if (!dynamicTexture || !gltf.scene) return;
    
    gltf.scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        
        materials.forEach((material) => {
          if (material.name === 'image_texture' || 
              (material.map && material.map.image && 
               (material.map.image.src?.includes('canvas_export') || 
                material.map.image.currentSrc?.includes('canvas_export')))) {
            
            material.map = dynamicTexture;
            material.colorSpace = THREE.SRGBColorSpace;
            material.transparent = false;
            material.alphaTest = 0;
            material.needsUpdate = true;
          }
        });
      }
    });
  }, [dynamicTexture, gltf.scene]);

  if (isLoading) {
    return (
      <Html center>
        <div className="text-white text-center">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <div>Loading mug...</div>
        </div>
      </Html>
    );
  }

  const clonedScene = gltf.scene.clone();

  return (
    <primitive 
      ref={meshRef}
      object={clonedScene} 
      scale={[12, 12, 12]}
      position={[0, -1, 0]}
    />
  );
}

// Loading component
function ARLoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-full bg-black">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        <p className="text-white font-medium">Loading AR experience...</p>
      </div>
    </div>
  );
}

// Error component
function ARError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex items-center justify-center h-full bg-black text-white p-8">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-semibold mb-2">AR Not Available</h2>
        <p className="text-gray-300 mb-6">{message}</p>
        <div className="space-y-3">
          <button
            onClick={onRetry}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
          <p className="text-xs text-gray-400">
            For best AR experience, use Chrome on Android or Safari on iOS
          </p>
        </div>
      </div>
    </div>
  );
}

const ARViewer: React.FC<ARViewerProps> = ({ isOpen, onClose }) => {
  const [isARSupported, setIsARSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(true);

  useEffect(() => {
    if (isOpen) {
      console.log('AR Viewer opened');
      
      // Check for AR support
      const checkARSupport = async () => {
        try {
          setIsLoading(true);
          setError(null);
          
          // Check for WebXR AR support
          if ('xr' in navigator) {
            try {
              const supported = await (navigator as any).xr.isSessionSupported('immersive-ar');
              console.log('WebXR AR supported:', supported);
              setIsARSupported(supported);
            } catch (xrError) {
              console.log('WebXR check failed:', xrError);
              setIsARSupported(false);
            }
          } else {
            // Fallback: Check user agent for mobile devices
            const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            console.log('Mobile device detected:', isMobile);
            setIsARSupported(isMobile);
          }
          
          setIsLoading(false);
        } catch (err) {
          console.error('Error checking AR support:', err);
          setError('Failed to check AR capabilities');
          setIsLoading(false);
        }
      };

      checkARSupport();
      document.body.style.overflow = 'hidden';
      
      // Hide instructions after 3 seconds
      const timer = setTimeout(() => {
        setShowInstructions(false);
      }, 3000);
      
      return () => {
        clearTimeout(timer);
      };
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleStartAR = async () => {
    try {
      if ('xr' in navigator) {
        const session = await (navigator as any).xr.requestSession('immersive-ar', {
          requiredFeatures: ['local', 'hit-test'],
          optionalFeatures: ['dom-overlay'],
          domOverlay: { root: document.body }
        });
        
        console.log('AR session started:', session);
        setShowInstructions(false);
      } else {
        setError('WebXR not supported. Showing 3D preview instead.');
      }
    } catch (err) {
      console.error('Failed to start AR session:', err);
      setError('Failed to start AR. Make sure you\'re using a compatible browser and device.');
    }
  };

  const handleShare = async () => {
    const currentUrl = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'View my custom mug in AR',
          text: 'Check out this awesome custom mug design in augmented reality!',
          url: currentUrl
        });
      } catch (err) {
        console.log('Share cancelled or failed');
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(currentUrl);
        alert('Link copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy to clipboard');
      }
    }
  };

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    // Trigger re-check
    window.location.reload();
  };

  if (!isOpen) return null;

  if (error) {
    return <ARError message={error} onRetry={handleRetry} />;
  }

  if (isLoading) {
    return <ARLoadingSpinner />;
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black bg-opacity-50 text-white z-10 relative">
        <div className="flex items-center space-x-3">
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold">AR Preview</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleShare}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
          >
            <Share2 className="w-5 h-5" />
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Instructions Overlay */}
      {showInstructions && (
        <div className="absolute inset-0 bg-black bg-opacity-75 z-20 flex items-center justify-center">
          <div className="text-center text-white p-8 max-w-md">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Smartphone className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Welcome to AR View</h2>
            <p className="text-lg mb-6">
              You can now see your custom mug design in 3D. 
              {isARSupported ? ' Tap the AR button below to place it in your real environment.' : ' This preview shows how your mug will look.'}
            </p>
            <button
              onClick={() => setShowInstructions(false)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 relative">
        {/* 3D Preview */}
        <Suspense fallback={<ARLoadingSpinner />}>
          <Canvas
            camera={{ position: [0, 0, 5], fov: 50 }}
            style={{ width: '100%', height: '100%' }}
            gl={{ antialias: true, alpha: true }}
          >
            <ambientLight intensity={0.8} />
            <directionalLight 
              position={[10, 10, 5]} 
              intensity={1.2} 
              castShadow
            />
            <pointLight position={[-10, -10, -5]} intensity={0.4} />
            
            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={2}
              maxDistance={10}
            />
            
            <ARMugModel />
            <Environment preset="sunset" />
          </Canvas>
        </Suspense>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6 text-white">
          <div className="max-w-md mx-auto text-center">
            <h3 className="text-lg font-semibold mb-2">
              {isARSupported ? 'Ready for AR' : '3D Preview'}
            </h3>
            <p className="text-sm text-gray-300 mb-4">
              {isARSupported 
                ? "Tap the AR button to place this mug in your real environment"
                : "This preview shows how your mug will look. For full AR experience, use a compatible mobile device."
              }
            </p>
            
            <div className="space-y-3">
              {isARSupported ? (
                <button
                  onClick={handleStartAR}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2"
                >
                  <span>Start AR Experience</span>
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="text-xs text-gray-400">
                    For AR: Use Chrome/Safari on iOS 12+ or Android 7+
                  </div>
                  <button
                    onClick={handleShare}
                    className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    Share AR Link
                  </button>
                </div>
              )}
              
              <button
                onClick={onClose}
                className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Back to Editor
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ARViewer;