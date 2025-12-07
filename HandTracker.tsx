import React, { useEffect, useRef, useState, useCallback } from 'react';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { Camera, RefreshCcw, AlertCircle, Cpu } from 'lucide-react';
import { HandData } from '../types';

interface HandTrackerProps {
  onHandUpdate: (data: HandData) => void;
  onClap: () => void;
}

const HandTracker: React.FC<HandTrackerProps> = ({ onHandUpdate, onClap }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [usingCPU, setUsingCPU] = useState(false);
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const requestRef = useRef<number>(0);
  const lastTensionRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const lastVideoTimeRef = useRef<number>(-1);
  const isMounted = useRef(true);

  // Setup MediaPipe
  const setupMediaPipe = useCallback(async () => {
    try {
      if (!isMounted.current) return;
      setIsLoading(true);
      setError(null);

      // Initialize FilesetResolver
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
      );

      // Try GPU first
      try {
        handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1
        });
        setUsingCPU(false);
      } catch (gpuError) {
        console.warn("GPU Init failed, falling back to CPU", gpuError);
        // Fallback to CPU
        handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "CPU"
          },
          runningMode: "VIDEO",
          numHands: 1
        });
        setUsingCPU(true);
      }
      
      if (isMounted.current) {
        await startCamera();
      }
    } catch (err: any) {
      console.error("MediaPipe Init Error:", err);
      if (isMounted.current) {
        setError("Failed to load AI model. Check connection.");
        setIsLoading(false);
      }
    }
  }, []);

  const startCamera = async () => {
    if (!videoRef.current) return;

    // Check if browser supports mediaDevices
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
         if (isMounted.current) {
            setError("Camera API not supported in this browser");
            setIsLoading(false);
         }
         return;
    }

    try {
      // Constraints
      const constraints = {
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 30 },
          facingMode: "user" // Prefer front camera but allow fallback
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for metadata to load before playing to ensure dimensions are known
        videoRef.current.onloadedmetadata = async () => {
            try {
                if (!videoRef.current) return;
                await videoRef.current.play();
                if (isMounted.current) {
                    setIsLoading(false);
                    predictWebcam();
                }
            } catch (e) {
                console.error("Play error", e);
                if (isMounted.current) {
                    setError("Failed to play video stream");
                    setIsLoading(false);
                }
            }
        };
      }
      
    } catch (err: any) {
      console.error("Camera Error:", err);
      if (isMounted.current) {
        setIsLoading(false);
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
             setError("Permission denied. Please allow camera access in your browser settings.");
        } else if (err.name === 'NotFoundError') {
             setError("No camera device found.");
        } else if (err.name === 'NotReadableError') {
             setError("Camera is in use by another application.");
        } else {
             setError(`Camera access failed: ${err.message || 'Unknown error'}`);
        }
      }
    }
  };

  const predictWebcam = () => {
    requestRef.current = requestAnimationFrame(predictWebcam);

    const video = videoRef.current;
    const landmarker = handLandmarkerRef.current;

    if (!landmarker || !video) return;

    // --- CRITICAL CHECKS ---
    // 1. readyState check: Must be at least HAVE_CURRENT_DATA (2)
    if (video.readyState < 2) return;

    // 2. Video Playing check
    if (video.paused || video.ended) return;

    // 3. Duplicate Frame check
    // If the video time hasn't changed since the last frame, skip detection
    if (video.currentTime === lastVideoTimeRef.current) return;
    lastVideoTimeRef.current = video.currentTime;

    try {
      const startTimeMs = performance.now();
      const results = landmarker.detectForVideo(video, startTimeMs);

      if (results.landmarks && results.landmarks.length > 0) {
        const landmarks = results.landmarks[0];
        
        // --- Calculate Tension ---
        const wrist = landmarks[0];
        const middleMcp = landmarks[9];
        
        // Palm Size (Reference)
        const palmSize = Math.sqrt(
          Math.pow(wrist.x - middleMcp.x, 2) + 
          Math.pow(wrist.y - middleMcp.y, 2) + 
          Math.pow(wrist.z - middleMcp.z, 2)
        );

        // Average Tip Distance
        const tips = [4, 8, 12, 16, 20];
        let totalTipDistance = 0;
        tips.forEach(idx => {
          const tip = landmarks[idx];
          const dist = Math.sqrt(
            Math.pow(wrist.x - tip.x, 2) + 
            Math.pow(wrist.y - tip.y, 2) + 
            Math.pow(wrist.z - tip.z, 2)
          );
          totalTipDistance += dist;
        });
        const avgTipDist = totalTipDistance / 5;

        // Ratio logic:
        // Open Hand: Tips are far. Ratio ~2.0+
        // Fist: Tips are close. Ratio ~0.8
        const ratio = avgTipDist / (palmSize || 0.01); 
        
        // Adjusted mapping for better responsiveness
        // Map 2.0 (Open) -> 0.0 Tension
        // Map 0.9 (Fist) -> 1.0 Tension
        let tension = (2.0 - ratio) / (2.0 - 0.9);
        tension = Math.max(0, Math.min(1, tension));

        // --- Clap / Rapid Closure Detection ---
        const currentTime = performance.now();
        
        // Trigger if we go from relatively open (<0.4) to very closed (>0.7) quickly
        if (lastTensionRef.current < 0.4 && tension > 0.7) {
             // Debounce: 500ms
             if (currentTime - lastTimeRef.current > 500) {
                 onClap();
                 lastTimeRef.current = currentTime;
             }
        }
        
        lastTensionRef.current = tension;

        // --- Position ---
        const handX = 1.0 - wrist.x; // Mirror X
        const handY = 1.0 - wrist.y;

        onHandUpdate({
          tension,
          isPresent: true,
          x: handX,
          y: handY
        });

      } else {
        // No hand detected
        onHandUpdate({
          tension: 0,
          isPresent: false,
          x: 0.5,
          y: 0.5
        });
      }
    } catch (e) {
      console.warn("Detection warning:", e);
    }
  };

  useEffect(() => {
    isMounted.current = true;
    setupMediaPipe();
    
    return () => {
      isMounted.current = false;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      // Clean up MediaPipe if needed (though instance is managed in ref)
      if (handLandmarkerRef.current) {
        handLandmarkerRef.current.close();
        handLandmarkerRef.current = null;
      }
      // Stop video stream to release camera
      if (videoRef.current && videoRef.current.srcObject) {
         const stream = videoRef.current.srcObject as MediaStream;
         const tracks = stream.getTracks();
         tracks.forEach(track => track.stop());
         videoRef.current.srcObject = null;
      }
    };
  }, [setupMediaPipe]);

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col items-end pointer-events-none">
      <div className={`relative overflow-hidden rounded-xl border-2 transition-colors duration-300 ${error ? 'border-red-500' : 'border-white/20'}`}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-32 h-24 object-cover transform -scale-x-100 bg-black ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        />
        
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <RefreshCcw className="w-6 h-6 text-cyan-400 animate-spin" />
          </div>
        )}

        {!isLoading && !error && (
            <div className="absolute bottom-1 right-1 flex gap-1">
                {usingCPU && <div className="w-2 h-2 rounded-full bg-yellow-500" title="CPU Fallback Mode"></div>}
                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_#00ff00]"></div>
            </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 p-2 text-center pointer-events-auto">
            <AlertCircle className="w-6 h-6 text-red-500 mb-1" />
            <span className="text-[10px] text-red-200 leading-tight mb-2">{error}</span>
            <button 
                onClick={() => setupMediaPipe()}
                className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-xs text-white border border-white/20 transition-colors"
            >
                Retry
            </button>
          </div>
        )}
      </div>
      <div className="mt-2 text-[10px] text-white/50 uppercase tracking-widest flex items-center gap-2">
        <div className="flex items-center gap-1">
            <Camera className="w-3 h-3" />
            <span>Tracking</span>
        </div>
        {usingCPU && (
            <div className="flex items-center gap-1 text-yellow-500/80">
                <Cpu className="w-3 h-3" />
                <span>CPU</span>
            </div>
        )}
      </div>
    </div>
  );
};

export default HandTracker;