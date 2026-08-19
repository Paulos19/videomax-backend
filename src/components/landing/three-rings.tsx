'use client'

import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const fragmentShader = `
uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
varying vec2 vUv;

// Simplex 2D noise
vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
  + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
    dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
  // Normalize UV and center it
  vec2 uv = vUv * 2.0 - 1.0;
  
  // Adjust aspect ratio
  uv.x *= uResolution.x / uResolution.y;

  // Mouse interaction: calculate distance from mouse
  vec2 mouseUv = uMouse * 2.0 - 1.0;
  mouseUv.x *= uResolution.x / uResolution.y;
  
  float distToMouse = distance(uv, mouseUv);
  
  // Create a ripple/water effect pushing UVs away from mouse
  // Only applies if the mouse is close enough
  float ripple = smoothstep(0.6, 0.0, distToMouse);
  vec2 dir = normalize(uv - mouseUv + 0.0001); // avoid div by zero
  
  // Add noise for organic water feel, but multiply by ripple so it ONLY deforms near the mouse
  float noise = snoise(uv * 3.0 - uTime * 0.5) * 0.15 * ripple;
  
  // Apply deformation
  vec2 deformedUv = uv + dir * ripple * 0.15 + noise;
  
  // Create rings
  float dist = length(deformedUv);
  
  // Rotate smoothly over time - apply rotation matrix
  float s = sin(uTime * 0.2);
  float c = cos(uTime * 0.2);
  vec2 rotatedUv = vec2(
    deformedUv.x * c - deformedUv.y * s,
    deformedUv.x * s + deformedUv.y * c
  );
  
  float distRotated = length(rotatedUv);
  
  // 3 Concentric rings
  float ring1 = smoothstep(0.04, 0.0, abs(distRotated - 0.4));
  float ring2 = smoothstep(0.03, 0.0, abs(distRotated - 0.6));
  float ring3 = smoothstep(0.02, 0.0, abs(distRotated - 0.8));
  
  float rings = ring1 + ring2 + ring3;
  
  // Color the rings (fiery orange/red)
  vec3 color = vec3(1.0, 0.35, 0.0) * ring1 * 1.5; // inner ring more orange
  color += vec3(1.0, 0.2, 0.0) * ring2 * 1.2; // middle ring
  color += vec3(0.8, 0.1, 0.0) * ring3 * 1.0; // outer ring more red
  
  // Add global glow / radial falloff
  float glow = smoothstep(1.5, 0.0, dist) * 0.15;
  color += vec3(1.0, 0.3, 0.0) * glow;
  
  // Fade out at edges to avoid sharp cuts
  float edgeFade = smoothstep(1.2, 0.8, dist);
  
  gl_FragColor = vec4(color, (rings + glow) * edgeFade);
}
`

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

function RingsShader() {
  const meshRef = useRef<THREE.Mesh>(null)
  const { size, viewport } = useThree()
  
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(-10.0, -10.0) }, // Start off-screen
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
    }),
    [size]
  )

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (meshRef.current) {
        const mat = meshRef.current.material as THREE.ShaderMaterial
        // Update mouse uniform based on window coordinates
        mat.uniforms.uMouse.value.set(
          e.clientX / window.innerWidth,
          1.0 - (e.clientY / window.innerHeight) // WebGL Y is flipped
        )
      }
    }
    
    // Global listener so we don't rely on canvas pointer events
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useFrame((state) => {
    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.ShaderMaterial
      mat.uniforms.uTime.value = state.clock.elapsedTime
      mat.uniforms.uResolution.value.set(size.width, size.height)
    }
  })

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[viewport.width, viewport.height]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  )
}

export function ThreeRings() {
  return (
    // Removed pointer-events-none so it doesn't suppress tracking if used
    // but relies on window listener anyway.
    <div className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 1] }}
        style={{ width: '100%', height: '100%' }}
        gl={{ alpha: true, antialias: true }}
      >
        <RingsShader />
      </Canvas>
    </div>
  )
}
