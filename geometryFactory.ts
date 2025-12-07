import { ShapeType } from '../types';

/**
 * Generates a Float32Array of [x, y, z] coordinates based on shape type.
 * @param type The shape type to generate.
 * @param count The number of particles (base count, before trails).
 * @param radius Base radius for scaling.
 */
export const generateGeometry = (type: ShapeType, count: number, radius: number = 2.0): Float32Array => {
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    let x = 0, y = 0, z = 0;
    const i3 = i * 3;

    switch (type) {
      case ShapeType.SPHERE: {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        const r = radius * Math.cbrt(Math.random()); // Uniform distribution
        x = r * Math.sin(phi) * Math.cos(theta);
        y = r * Math.sin(phi) * Math.sin(theta);
        z = r * Math.cos(phi);
        break;
      }

      case ShapeType.HEART: {
        // Parametric Heart
        // x = 16sin^3(t)
        // y = 13cos(t) - 5cos(2t) - 2cos(3t) - cos(4t)
        // z varies for thickness
        const t = Math.random() * Math.PI * 2;
        const rScale = radius * 0.1;
        // Add some volume
        const vol = (Math.random() - 0.5) * radius * 0.5;
        
        x = (16 * Math.pow(Math.sin(t), 3)) * rScale;
        y = (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * rScale;
        z = vol;
        break;
      }

      case ShapeType.FLOWER: {
        // Phyllotaxis (Golden Angle)
        const goldenAngle = Math.PI * (3 - Math.sqrt(5));
        const r = radius * 0.05 * Math.sqrt(i);
        const theta = i * goldenAngle;
        
        // Map to 3D cup shape
        x = r * Math.cos(theta);
        z = r * Math.sin(theta);
        y = Math.sqrt(r) * 1.5 - radius;
        break;
      }

      case ShapeType.SATURN: {
        const isRing = Math.random() > 0.4;
        if (isRing) {
          // Ring
          const angle = Math.random() * Math.PI * 2;
          const dist = radius * (1.2 + Math.random() * 0.8); // 1.2 to 2.0 radius
          x = dist * Math.cos(angle);
          z = dist * Math.sin(angle);
          y = (Math.random() - 0.5) * 0.1; // Flat disk
        } else {
          // Central Planet
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos((Math.random() * 2) - 1);
          const r = radius * 0.6; 
          x = r * Math.sin(phi) * Math.cos(theta);
          y = r * Math.sin(phi) * Math.sin(theta);
          z = r * Math.cos(phi);
        }
        break;
      }

      case ShapeType.BUDDHA: {
        // Abstract approximation: Head (Sphere) + Body (Ellipsoid) + Base
        const part = Math.random();
        
        if (part < 0.2) {
          // Head
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos((Math.random() * 2) - 1);
          const r = radius * 0.35;
          x = r * Math.sin(phi) * Math.cos(theta);
          y = r * Math.sin(phi) * Math.sin(theta) + radius * 0.6;
          z = r * Math.cos(phi);
        } else if (part < 0.7) {
          // Body (Ellipsoid)
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos((Math.random() * 2) - 1);
          const r = radius * 0.6;
          x = r * Math.sin(phi) * Math.cos(theta);
          y = (r * 1.2) * Math.sin(phi) * Math.sin(theta) - radius * 0.2;
          z = r * Math.cos(phi);
        } else {
           // Base (Torus section)
           const u = Math.random() * Math.PI * 2;
           const v = Math.random() * Math.PI * 2;
           const R = radius * 0.5;
           const rTube = radius * 0.2;
           x = (R + rTube * Math.cos(v)) * Math.cos(u);
           z = (R + rTube * Math.cos(v)) * Math.sin(u);
           y = rTube * Math.sin(v) - radius * 0.8;
        }
        break;
      }

      case ShapeType.FIREWORKS: {
        // Volume sphere but pushed out
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        const r = radius * (0.1 + Math.random() * 2.0); // Spiky distribution
        x = r * Math.sin(phi) * Math.cos(theta);
        y = r * Math.sin(phi) * Math.sin(theta);
        z = r * Math.cos(phi);
        break;
      }
    }

    positions[i3] = x;
    positions[i3 + 1] = y;
    positions[i3 + 2] = z;
  }

  return positions;
};