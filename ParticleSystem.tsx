import React, { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { generateGeometry } from '../utils/geometryFactory';
import { HandData, ParticleConfig, ShapeType } from '../types';

interface ParticleSystemProps {
  handData: HandData;
  config: ParticleConfig;
  triggerExplosion: boolean;
}

const ParticleSystem: React.FC<ParticleSystemProps> = ({ handData, config, triggerExplosion }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const geometryRef = useRef<THREE.BufferGeometry | null>(null);
  const animationFrameRef = useRef<number>(0);
  
  // Smooth out tension to avoid jitter
  const smoothedTension = useRef(0);
  const explosionFactor = useRef(0);

  // Configuration Constants
  const BASE_PARTICLE_COUNT = 4000;
  const TRAIL_LENGTH = 5;
  const TOTAL_VERTICES = BASE_PARTICLE_COUNT * TRAIL_LENGTH;

  // --- Shader Code ---
  
  const vertexShader = `
    uniform float uTime;
    uniform float uTension; // 0.0 (Open/Expanded) to 1.0 (Fist/Contracted)
    uniform float uExplosion;
    uniform float uPixelRatio;
    
    attribute vec3 targetPos;
    attribute float aRandomness;
    attribute float aPScale;
    attribute float aTrailIdx; // 0.0 to 4.0
    
    varying float vAlpha;
    varying float vDistance;
    varying float vExplosion;

    // Simplex Noise (Simplified 3D)
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
    
    float snoise(vec3 v) {
      const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
      const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
      
      vec3 i  = floor(v + dot(v, C.yyy) );
      vec3 x0 = v - i + dot(i, C.xxx) ;
      
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min( g.xyz, l.zxy );
      vec3 i2 = max( g.xyz, l.zxy );
      
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      
      i = mod289(i); 
      vec4 p = permute( permute( permute( 
                 i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
               + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
               + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
               
      float n_ = 0.142857142857;
      vec3  ns = n_ * D.wyz - D.xzx;
      
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
      
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_ );
      
      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      
      vec4 b0 = vec4( x.xy, y.xy );
      vec4 b1 = vec4( x.zw, y.zw );
      
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
      
      vec3 p0 = vec3(a0.xy,h.x);
      vec3 p1 = vec3(a0.zw,h.y);
      vec3 p2 = vec3(a1.xy,h.z);
      vec3 p3 = vec3(a1.zw,h.w);
      
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
      p0 *= norm.x;
      p1 *= norm.y;
      p2 *= norm.z;
      p3 *= norm.w;
      
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                    dot(p2,x2), dot(p3,x3) ) );
    }

    void main() {
      // Trail Lag Logic
      float lag = aTrailIdx * 0.08; 
      float t = uTime - lag;
      
      vec3 pos = targetPos;
      
      // -- Simulated Particle Collision & Response --
      
      // 1. Density Repulsion (Collision Prevention)
      // When particles are dense (Contracted/Tension=1), they repel each other.
      vec3 safePos = pos;
      if (length(safePos) < 0.001) safePos = vec3(0.001, 0.0, 0.0);
      vec3 centerDir = normalize(safePos);

      float densityPressure = pow(uTension, 2.0) * 0.8; // High pressure when fist closed
      
      // Use noise as a spatial hash to simulate neighbors pushing
      float neighborPush = snoise(pos * 3.0 + t);
      vec3 repulsion = centerDir * densityPressure * (0.5 + neighborPush * 0.5);
      
      // 2. Chaotic Bounce Response (During Explosion)
      // When exploding, particles "bounce" off each other violently.
      vec3 bounceDir = normalize(vec3(
         snoise(pos + vec3(0.0, 0.0, 0.0)),
         snoise(pos + vec3(10.0, 10.0, 10.0)),
         snoise(pos + vec3(20.0, 20.0, 20.0))
      ));
      
      vec3 bounceForce = bounceDir * uExplosion * 3.0;
      
      // Apply Collision Forces
      pos += repulsion;
      pos += bounceForce;

      // -- Base Movement --
      
      // Basic Breathing
      float breathe = sin(t * 1.5 + aRandomness * 10.0) * 0.1;
      
      // Noise Field Calculation
      float noiseVal = snoise(pos * 0.5 + t * 0.3);
      vec3 noiseDir = normalize(safePos); 
      
      // Expansion factor: When open (uTension -> 0), expand outwards.
      float expansion = mix(2.5, 0.5, uTension); 
      
      // Apply noise turbulence
      float turbulence = mix(0.5, 0.1, uTension); 
      
      vec3 finalPos = pos * (1.0 + breathe) * expansion + (noiseDir * noiseVal * turbulence);
      
      // Explosion Main Blast (Directional)
      vec3 blastDir = normalize(targetPos) * (1.0 + aRandomness);
      finalPos += blastDir * uExplosion * 5.0; // Main explosion expansion

      // Gravity-ish drift for trails
      finalPos.y -= aTrailIdx * 0.02 * (1.0 - uTension); 

      vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      
      // Size attenuation
      gl_PointSize = (40.0 * aPScale * uPixelRatio) / -mvPosition.z;
      
      // Fade out trails
      vAlpha = 1.0 - (aTrailIdx / 5.0);
      // Brighter during explosion
      vExplosion = uExplosion;
      
      vDistance = length(mvPosition.xyz);
    }
  `;

  const fragmentShader = `
    uniform vec3 uColor;
    varying float vAlpha;
    varying float vExplosion;
    
    void main() {
      // Create soft circle
      vec2 coord = gl_PointCoord - vec2(0.5);
      float dist = length(coord);
      
      if (dist > 0.5) discard;
      
      // Radial glow
      float strength = 1.0 - (dist * 2.0);
      strength = pow(strength, 1.5);
      
      // Hot center (white) -> Color edge
      // Flash white during explosion
      vec3 targetColor = mix(uColor, vec3(1.0), vExplosion * 0.8);
      vec3 finalColor = mix(targetColor, vec3(1.0), strength * 0.5);
      
      gl_FragColor = vec4(finalColor, strength * vAlpha);
    }
  `;

  // --- Initialization ---

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    // Camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 8;
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true,
        powerPreference: 'high-performance' 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Attributes Arrays
    const positions = new Float32Array(TOTAL_VERTICES * 3); // Current pos (not used much due to targetPos approach)
    const targetPos = new Float32Array(TOTAL_VERTICES * 3);
    const randomness = new Float32Array(TOTAL_VERTICES);
    const pScale = new Float32Array(TOTAL_VERTICES);
    const trailIdx = new Float32Array(TOTAL_VERTICES);

    // Initial Population
    // We generate base geometry for particle count, then replicate for trails
    const baseGeo = generateGeometry(config.shape, BASE_PARTICLE_COUNT);
    
    for (let i = 0; i < BASE_PARTICLE_COUNT; i++) {
        const x = baseGeo[i * 3];
        const y = baseGeo[i * 3 + 1];
        const z = baseGeo[i * 3 + 2];
        const rnd = Math.random();
        const scale = 0.5 + Math.random(); // 0.5 to 1.5

        for (let t = 0; t < TRAIL_LENGTH; t++) {
            const idx = (i * TRAIL_LENGTH) + t;
            
            // All trail segments share the same target position
            targetPos[idx * 3] = x;
            targetPos[idx * 3 + 1] = y;
            targetPos[idx * 3 + 2] = z;

            randomness[idx] = rnd;
            pScale[idx] = scale * (1.0 - (t * 0.15)); // Trails get smaller
            trailIdx[idx] = t;
        }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3)); // Placeholder
    geometry.setAttribute('targetPos', new THREE.BufferAttribute(targetPos, 3));
    geometry.setAttribute('aRandomness', new THREE.BufferAttribute(randomness, 1));
    geometry.setAttribute('aPScale', new THREE.BufferAttribute(pScale, 1));
    geometry.setAttribute('aTrailIdx', new THREE.BufferAttribute(trailIdx, 1));
    geometryRef.current = geometry;

    // Material
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uTension: { value: 0 },
        uColor: { value: new THREE.Color(config.color) },
        uExplosion: { value: 0 },
        uPixelRatio: { value: renderer.getPixelRatio() }
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    materialRef.current = material;

    // Points
    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // Animation Loop
    const clock = new THREE.Clock();

    const animate = () => {
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Smooth tension
      const targetTension = handData.isPresent ? handData.tension : 0.1; // Default low tension if no hand
      smoothedTension.current += (targetTension - smoothedTension.current) * 5.0 * delta;

      // Explosion decay
      if (explosionFactor.current > 0) {
          explosionFactor.current -= delta * 3.0; // Decay speed (snappy)
          if (explosionFactor.current < 0) explosionFactor.current = 0;
      }

      // Update uniforms
      if (materialRef.current) {
        materialRef.current.uniforms.uTime.value = elapsedTime;
        materialRef.current.uniforms.uTension.value = smoothedTension.current;
        materialRef.current.uniforms.uExplosion.value = explosionFactor.current;
      }

      // Slight rotation of whole system
      points.rotation.y = elapsedTime * 0.1;
      // Tilt based on hand Y position (optional parallax)
      const targetRotX = (handData.y - 0.5) * 0.5;
      const targetRotZ = (handData.x - 0.5) * 0.5;
      points.rotation.x += (targetRotX - points.rotation.x) * delta;
      points.rotation.z += (targetRotZ - points.rotation.z) * delta;

      renderer.render(scene, camera);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (cameraRef.current && rendererRef.current) {
        cameraRef.current.aspect = window.innerWidth / window.innerHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
        if(materialRef.current) {
            materialRef.current.uniforms.uPixelRatio.value = rendererRef.current.getPixelRatio();
        }
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (containerRef.current && rendererRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []); // Run once on mount

  // --- Updates for Props (Shape/Color/Explosion) ---

  // Update Geometry on Shape Change
  useEffect(() => {
    if (!geometryRef.current) return;
    
    const baseGeo = generateGeometry(config.shape, BASE_PARTICLE_COUNT);
    const targetPosAttr = geometryRef.current.attributes.targetPos as THREE.BufferAttribute;
    const array = targetPosAttr.array as Float32Array;

    for (let i = 0; i < BASE_PARTICLE_COUNT; i++) {
        const x = baseGeo[i * 3];
        const y = baseGeo[i * 3 + 1];
        const z = baseGeo[i * 3 + 2];

        for (let t = 0; t < TRAIL_LENGTH; t++) {
            const idx = (i * TRAIL_LENGTH) + t;
            array[idx * 3] = x;
            array[idx * 3 + 1] = y;
            array[idx * 3 + 2] = z;
        }
    }
    targetPosAttr.needsUpdate = true;
  }, [config.shape]);

  // Update Color
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uColor.value.set(config.color);
    }
  }, [config.color]);

  // Trigger Explosion
  useEffect(() => {
    if (triggerExplosion) {
        explosionFactor.current = 1.0;
    }
  }, [triggerExplosion]);

  return <div ref={containerRef} className="absolute inset-0 z-0" />;
};

export default ParticleSystem;