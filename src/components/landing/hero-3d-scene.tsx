"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Sparkles, Environment, Lightformer, RoundedBox } from "@react-three/drei";
import { useRef, useMemo, useCallback, useEffect, useState } from "react";
import * as THREE from "three";

/* ─────────────────────────────────────────────
   MOUSE TRACKER — shared normalized position
   ───────────────────────────────────────────── */
const mouseState = { x: 0, y: 0 };

function useMouseTracker() {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      mouseState.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseState.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);
}

/* ─────────────────────────────────────────────
   CINEMATIC SCREEN — the floating 16:9 portal
   that tilts toward the cursor
   ───────────────────────────────────────────── */
function CinemaScreen() {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  const shaderData = useMemo(() => ({
    uniforms: {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec2 uMouse;
      varying vec2 vUv;
      
      // Simplex-like hash for procedural noise
      vec3 hash3(vec2 p) {
        vec3 q = vec3(
          dot(p, vec2(127.1, 311.7)),
          dot(p, vec2(269.5, 183.3)),
          dot(p, vec2(419.2, 371.9))
        );
        return fract(sin(q) * 43758.5453);
      }
      
      float voronoi(vec2 x, float t) {
        vec2 n = floor(x);
        vec2 f = fract(x);
        float md = 8.0;
        for (int j = -1; j <= 1; j++) {
          for (int i = -1; i <= 1; i++) {
            vec2 g = vec2(float(i), float(j));
            vec2 o = hash3(n + g).xy;
            o = 0.5 + 0.5 * sin(t + 6.2831 * o);
            vec2 r = g + o - f;
            float d = dot(r, r);
            if (d < md) md = d;
          }
        }
        return sqrt(md);
      }
      
      void main() {
        vec2 uv = vUv;
        
        // Mouse influence on the content
        vec2 mouseOffset = uMouse * 0.08;
        uv += mouseOffset;
        
        float t = uTime * 0.4;
        
        // Layered voronoi for organic "video content" shimmer
        float v1 = voronoi(uv * 3.0, t);
        float v2 = voronoi(uv * 5.0 + 3.7, t * 1.3);
        float v3 = voronoi(uv * 8.0 + 7.1, t * 0.7);
        
        // Brand colors: deep obsidian to ember
        vec3 colorDeep = vec3(0.02, 0.02, 0.03);
        vec3 colorRed = vec3(0.937, 0.125, 0.125);   // #EF2020
        vec3 colorOrange = vec3(1.0, 0.353, 0.0);     // #FF5A00
        vec3 colorAmber = vec3(1.0, 0.722, 0.0);      // #FFB800
        
        // Compose the "content" — living, breathing cinema
        float pattern = v1 * 0.5 + v2 * 0.3 + v3 * 0.2;
        
        vec3 color = mix(colorDeep, colorRed, smoothstep(0.2, 0.5, pattern));
        color = mix(color, colorOrange, smoothstep(0.4, 0.7, pattern));
        color = mix(color, colorAmber, smoothstep(0.65, 0.9, pattern) * 0.5);
        
        // Vignette — darkened edges for screen depth
        float vignette = 1.0 - length((vUv - 0.5) * 1.8);
        vignette = smoothstep(0.0, 0.6, vignette);
        color *= vignette;
        
        // Subtle scan-line effect
        float scanline = sin(vUv.y * 400.0 + uTime * 2.0) * 0.03 + 1.0;
        color *= scanline;
        
        gl_FragColor = vec4(color, 1.0);
      }
    `,
  }), []);

  useFrame((state) => {
    if (!groupRef.current) return;
    
    // Smooth tilt toward cursor
    const targetRotY = mouseState.x * 0.15;
    const targetRotX = -mouseState.y * 0.08;
    
    groupRef.current.rotation.y += (targetRotY - groupRef.current.rotation.y) * 0.04;
    groupRef.current.rotation.x += (targetRotX - groupRef.current.rotation.x) * 0.04;
    
    // Update shader uniforms
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      materialRef.current.uniforms.uMouse.value.set(mouseState.x, mouseState.y);
    }
  });

  return (
    <group ref={groupRef} position={[1.8, 0.2, 0]}>
      {/* The Screen — 16:9 aspect */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[4.2, 2.36]} />
        <shaderMaterial 
          ref={materialRef}
          {...shaderData}
        />
      </mesh>
      
      {/* Screen bezel — visible border with subtle reflective edge */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[4.5, 2.6]} />
        <meshPhysicalMaterial 
          color="#111111"
          emissive="#1a1a1a"
          emissiveIntensity={0.5}
          metalness={0.95}
          roughness={0.05}
          clearcoat={1}
          clearcoatRoughness={0.05}
        />
      </mesh>
      
      {/* Outer glow frame — thin emissive border */}
      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[4.6, 2.7]} />
        <meshBasicMaterial 
          color="#ff5a00"
          transparent
          opacity={0.06}
        />
      </mesh>
      
      {/* Screen glow — volumetric light spill */}
      <pointLight color="#ff5a00" intensity={6} distance={8} position={[0, 0, 1.5]} />
      <pointLight color="#ef2020" intensity={3} distance={6} position={[-2.2, 0, 0.5]} />
      <pointLight color="#ffb800" intensity={2} distance={5} position={[2.2, 0, 0.5]} />
      
      {/* Backlight for dramatic rim effect */}
      <pointLight color="#ff5a00" intensity={4} distance={10} position={[0, 0, -2]} />
    </group>
  );
}

/* ─────────────────────────────────────────────
   VIEWER PRESENCES — orbiting spheres
   representing connected watchers
   ───────────────────────────────────────────── */
function ViewerPresences() {
  const groupRef = useRef<THREE.Group>(null);
  
  const viewers = useMemo(() => {
    const colors = ["#ef2020", "#ff5a00", "#ffb800", "#22c55e", "#ffffff", "#ff5a00", "#ef2020", "#ffb800", "#ffffff", "#22c55e"];
    return Array.from({ length: 10 }, (_, i) => ({
      angle: (i / 10) * Math.PI * 2,
      radius: 2.6 + Math.random() * 0.8,
      speed: 0.12 + Math.random() * 0.08,
      yOffset: (Math.random() - 0.5) * 1.4,
      size: 0.03 + Math.random() * 0.03,
      color: colors[i % colors.length],
    }));
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    
    groupRef.current.children.forEach((child, i) => {
      const v = viewers[i];
      if (!v) return;
      const angle = v.angle + t * v.speed;
      child.position.x = Math.cos(angle) * v.radius;
      child.position.z = Math.sin(angle) * v.radius * 0.4;
      child.position.y = v.yOffset + Math.sin(t * 0.5 + i) * 0.2;
    });
  });

  return (
    <group ref={groupRef} position={[1.8, 0.2, 0]}>
      {viewers.map((v, i) => (
        <group key={i}>
          <mesh>
            <sphereGeometry args={[v.size, 16, 16]} />
            <meshStandardMaterial 
              color={v.color}
              emissive={v.color}
              emissiveIntensity={6}
            />
          </mesh>
          {/* Per-viewer halo light */}
          <pointLight color={v.color} intensity={0.8} distance={1.5} />
        </group>
      ))}
    </group>
  );
}

/* ─────────────────────────────────────────────
   PROJECTOR BEAM — volumetric cone from cursor
   ───────────────────────────────────────────── */
function ProjectorBeam() {
  const coneRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (!coneRef.current) return;
    // Beam follows cursor subtly
    coneRef.current.rotation.x = -0.3 + mouseState.y * 0.05;
    coneRef.current.rotation.z = mouseState.x * 0.08;
  });
  
  return (
    <mesh ref={coneRef} position={[1.8, 2.8, -3]} rotation={[0, 0, 0]}>
      <coneGeometry args={[2.8, 5, 32, 1, true]} />
      <meshBasicMaterial 
        color="#ff5a00"
        transparent
        opacity={0.015}
        side={THREE.DoubleSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

/* ─────────────────────────────────────────────
   SCENE ORCHESTRATOR — the full canvas
   ───────────────────────────────────────────── */
function SceneContent() {
  useMouseTracker();
  
  return (
    <>
      <color attach="background" args={["#050505"]} />
      <fog attach="fog" args={["#050505", 6, 18]} />
      
      {/* Ambient — very dark room */}
      <ambientLight intensity={0.08} color="#ffffff" />
      
      {/* Key light — subtle directional */}
      <directionalLight position={[-4, 3, 2]} intensity={0.3} color="#ffffff" />
      
      <CinemaScreen />
      <ViewerPresences />
      <ProjectorBeam />
      
      {/* Atmospheric ember particles */}
      <Sparkles 
        count={80} 
        scale={12} 
        size={1.2} 
        speed={0.2} 
        opacity={0.3} 
        color="#ff5a00" 
      />
      
      {/* Synthetic environment */}
      <Environment resolution={128}>
        <group rotation={[-Math.PI / 2, 0, 0]}>
          <Lightformer intensity={0.4} rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={[10, 10, 1]} />
          <Lightformer intensity={0.2} rotation-y={Math.PI / 2} position={[-5, 1, -1]} scale={[50, 2, 1]} />
        </group>
      </Environment>
    </>
  );
}

export function Hero3DScene() {
  return (
    <div className="absolute inset-0 z-0" style={{ pointerEvents: "auto" }}>
      <Canvas
        camera={{ position: [0, 0, 7], fov: 45 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        dpr={[1, 1.5]}
        style={{ pointerEvents: "none" }}
      >
        <SceneContent />
      </Canvas>
      
      {/* Bottom fade for section transition */}
      <div 
        className="absolute inset-x-0 bottom-0 h-56 z-10 pointer-events-none" 
        style={{ background: "linear-gradient(to top, #050505 0%, #050505 10%, transparent 100%)" }} 
      />
    </div>
  );
}
