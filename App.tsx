import React, { useState, useCallback, useRef } from 'react';
import ParticleSystem from './ParticleSystem';
import HandTracker from './HandTracker';
import Controls from './Controls';
import { HandData, ParticleConfig, ShapeType } from './types';

const App: React.FC = () => {
  // State
  const [handData, setHandData] = useState<HandData>({
    tension: 0,
    isPresent: false,
    x: 0.5,
    y: 0.5
  });

  const [config, setConfig] = useState<ParticleConfig>({
    shape: ShapeType.SPHERE,
    color: '#00f3ff',
  });

  const [triggerExplosion, setTriggerExplosion] = useState(false);
  
  // Audio Context Ref
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Sound Generator
  const playClapSound = useCallback(() => {
    // Initialize AudioContext on user interaction if needed
    if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
            audioCtxRef.current = new AudioContextClass();
        }
    }
    
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    if (ctx.state === 'suspended') {
        ctx.resume().catch(err => console.warn("Audio resume failed:", err));
    }

    const t = ctx.currentTime;

    // 1. Noise Burst (High frequency snap)
    const bufferSize = ctx.sampleRate * 0.3; // 300ms
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Generate pink/white noise with exponential decay
    for (let i = 0; i < bufferSize; i++) {
        const decay = Math.exp(-i / (ctx.sampleRate * 0.05)); // Fast decay
        data[i] = (Math.random() * 2 - 1) * decay;
    }

    const noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = buffer;
    
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.setValueAtTime(800, t);
    noiseFilter.frequency.linearRampToValueAtTime(100, t + 0.1);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.8, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

    noiseSrc.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noiseSrc.start(t);

    // 2. Low Thump (Body of the clap)
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.1);

    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(1, t);
    oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.2);

  }, []);

  // Handlers
  const handleHandUpdate = useCallback((data: HandData) => {
    setHandData(data);
  }, []);

  const handleClap = useCallback(() => {
    // Play Sound
    playClapSound();

    // Trigger explosion state
    setTriggerExplosion(true);
    
    // Reset trigger after a short delay
    setTimeout(() => {
      setTriggerExplosion(false);
    }, 200);
  }, [playClapSound]);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden select-none">
      
      {/* Background Title */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center pointer-events-none z-10">
        <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white/20 to-transparent tracking-[0.2em] blur-[1px]">
          ZEN PARTICLES
        </h1>
        <p className="mt-2 text-xs md:text-sm text-cyan-500/50 uppercase tracking-widest font-mono">
          Open Hand to Expand &bull; Fist to Contract &bull; Rapid Clench to Explode
        </p>
      </div>

      {/* 3D Scene */}
      <ParticleSystem 
        handData={handData} 
        config={config} 
        triggerExplosion={triggerExplosion}
      />

      {/* Computer Vision Layer */}
      <HandTracker 
        onHandUpdate={handleHandUpdate} 
        onClap={handleClap} 
      />

      {/* UI Overlay */}
      <Controls 
        config={config} 
        setConfig={setConfig} 
        currentTension={handData.tension} 
      />

      {/* Overlay Vignette for cinematic look */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)] z-10" />
      
    </div>
  );
};

export default App;