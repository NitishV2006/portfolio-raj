"use client";

import React, { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';

interface PixelBlastProps {
  variant?: 'square' | 'circle';
  pixelSize?: number;
  color?: string;
  patternScale?: number;
  patternDensity?: number;
  pixelSizeJitter?: number;
  enableRipples?: boolean;
  rippleSpeed?: number;
  rippleThickness?: number;
  rippleIntensityScale?: number;
  liquid?: boolean;
  liquidStrength?: number;
  liquidRadius?: number;
  liquidWobbleSpeed?: number;
  speed?: number;
  edgeFade?: number;
  transparent?: boolean;
  className?: string;
}

const PixelBlast: React.FC<PixelBlastProps> = ({
  variant = 'square',
  pixelSize = 4,
  color = '#cac6d7',
  patternScale = 2,
  patternDensity = 1,
  pixelSizeJitter = 0,
  enableRipples = true,
  rippleSpeed = 0.4,
  rippleThickness = 0.12,
  rippleIntensityScale = 1.5,
  liquid = false,
  liquidStrength = 0.12,
  liquidRadius = 1.2,
  liquidWobbleSpeed = 5,
  speed = 0.5,
  edgeFade = 0.25,
  transparent = true,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef(new THREE.Vector2(0, 0));
  const timeRef = useRef(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ 
      alpha: transparent,
      antialias: true 
    });
    
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const geometry = new THREE.PlaneGeometry(2, 2);

    const parsedColor = new THREE.Color(color);

    const shaderMaterial = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(width, height) },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uColor: { value: new THREE.Vector3(parsedColor.r, parsedColor.g, parsedColor.b) },
        uPixelSize: { value: pixelSize },
        uPatternScale: { value: patternScale },
        uPatternDensity: { value: patternDensity },
        uRippleSpeed: { value: rippleSpeed },
        uRippleThickness: { value: rippleThickness },
        uRippleIntensity: { value: rippleIntensityScale },
        uLiquidStrength: { value: liquidStrength },
        uLiquidRadius: { value: liquidRadius },
        uLiquidWobble: { value: liquidWobbleSpeed },
        uSpeed: { value: speed },
        uEdgeFade: { value: edgeFade },
        uVariant: { value: variant === 'circle' ? 1.0 : 0.0 },
        uEnableRipples: { value: enableRipples ? 1.0 : 0.0 },
        uLiquid: { value: liquid ? 1.0 : 0.0 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec2 uResolution;
        uniform vec2 uMouse;
        uniform vec3 uColor;
        uniform float uPixelSize;
        uniform float uPatternScale;
        uniform float uPatternDensity;
        uniform float uRippleSpeed;
        uniform float uRippleThickness;
        uniform float uRippleIntensity;
        uniform float uLiquidStrength;
        uniform float uLiquidRadius;
        uniform float uLiquidWobble;
        uniform float uSpeed;
        uniform float uEdgeFade;
        uniform float uVariant;
        uniform float uEnableRipples;
        uniform float uLiquid;

        varying vec2 vUv;

        float getBayer(vec2 p) {
          vec2 q = floor(mod(p, 4.0));
          int x = int(q.x);
          int y = int(q.y);
          int index = x + y * 4;
          
          if (index == 0) return 0.0/16.0;
          if (index == 1) return 8.0/16.0;
          if (index == 2) return 2.0/16.0;
          if (index == 3) return 10.0/16.0;
          if (index == 4) return 12.0/16.0;
          if (index == 5) return 4.0/16.0;
          if (index == 6) return 14.0/16.0;
          if (index == 7) return 6.0/16.0;
          if (index == 8) return 3.0/16.0;
          if (index == 9) return 11.0/16.0;
          if (index == 10) return 1.0/16.0;
          if (index == 11) return 9.0/16.0;
          if (index == 12) return 15.0/16.0;
          if (index == 13) return 7.0/16.0;
          if (index == 14) return 13.0/16.0;
          if (index == 15) return 5.0/16.0;
          return 0.0;
        }

        void main() {
          vec2 uv = vUv;
          vec2 pixelatedUv = floor(uv * uResolution / uPixelSize) * uPixelSize / uResolution;
          
          vec2 center = pixelatedUv - 0.5;
          center.x *= uResolution.x / uResolution.y;
          
          vec2 mouse = uMouse - 0.5;
          mouse.x *= uResolution.x / uResolution.y;
          
          float dist = length(center - mouse);
          
          // Ripples
          float ripple = 0.0;
          if (uEnableRipples > 0.5) {
            float r = length(center - mouse);
            ripple = sin(r * 20.0 - uTime * uRippleSpeed * 10.0) * uRippleIntensity;
            ripple *= exp(-r * 3.0);
          }
          
          // Liquid
          if (uLiquid > 0.5) {
            pixelatedUv += sin(pixelatedUv.yx * 10.0 + uTime * uLiquidWobble) * uLiquidStrength * exp(-length(center-mouse)/uLiquidRadius);
          }

          // Dither Pattern
          vec2 ditherP = vUv * uResolution / uPatternScale;
          float b = getBayer(ditherP);
          
          float intensity = 0.5 + 0.5 * sin(uTime * uSpeed + length(center) * 5.0);
          intensity += ripple;
          
          float final = step(b, intensity * uPatternDensity);
          
          // Edge Fade
          float edge = 1.0 - smoothstep(0.5 - uEdgeFade, 0.5, length(vUv - 0.5));
          
          // Shape variant
          if (uVariant > 0.5) {
            float circle = 1.0 - step(0.4, length(fract(vUv * uResolution / uPixelSize) - 0.5));
            final *= circle;
          }

          gl_FragColor = vec4(uColor, final * edge);
        }
      `
    });

    const mesh = new THREE.Mesh(geometry, shaderMaterial);
    scene.add(mesh);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current.x = (e.clientX - rect.left) / rect.width;
      mouseRef.current.y = 1.0 - (e.clientY - rect.top) / rect.height;
    };

    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      shaderMaterial.uniforms.uResolution.value.set(w, h);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    const animate = () => {
      timeRef.current += 0.016;
      shaderMaterial.uniforms.uTime.value = timeRef.current;
      shaderMaterial.uniforms.uMouse.value.copy(mouseRef.current);
      renderer.render(scene, camera);
      animationRef.current = requestAnimationFrame(animate);
    };

    let animationRef = { current: requestAnimationFrame(animate) };

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationRef.current);
      renderer.dispose();
      geometry.dispose();
      shaderMaterial.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [variant, pixelSize, color, patternScale, patternDensity, pixelSizeJitter, enableRipples, rippleSpeed, rippleThickness, rippleIntensityScale, liquid, liquidStrength, liquidRadius, liquidWobbleSpeed, speed, edgeFade, transparent]);

  return (
    <div 
      ref={containerRef} 
      className={`w-full h-full overflow-hidden ${className}`}
      style={{ position: 'absolute', top: 0, left: 0 }}
    />
  );
};

export default PixelBlast;
