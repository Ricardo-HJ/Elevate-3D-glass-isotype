import { Suspense } from "react";
import { Canvas, useFrame, useLoader, extend } from "@react-three/fiber";
import { useRef, useEffect } from "react";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from "three";
import { shaderMaterial } from "@react-three/drei";
import { Html } from "@react-three/drei";
import { Color } from "three";

// Define custom shader material for Fresnel and Chromatic Aberration
const FresnelMaterial = shaderMaterial(
  {
    color: new THREE.Color(0xffffff), // Base color for the material
    fresnelColor: new THREE.Color(0x00ffff), // Color for the Fresnel effect
    time: 0,
    chromaticAberrationOffset: new THREE.Vector3(0.005, 0.005, 0.005) // Simulated chromatic aberration
  },
  // Vertex Shader
  `
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      
      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
  `,
  // Fragment Shader (for Fresnel and Chromatic Aberration)
  `
    uniform vec3 color;
    uniform vec3 fresnelColor;
    uniform vec3 chromaticAberrationOffset;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;

    void main() {
      vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
      float fresnelFactor = pow(1.0 - dot(vNormal, viewDirection), 3.0);

      // Fresnel effect
      vec3 baseColor = mix(color, fresnelColor, fresnelFactor);

      // Simulate chromatic aberration by shifting color channels slightly
      vec3 redShift = vec3(1.0, 0.0, 0.0) * fresnelFactor * chromaticAberrationOffset.x;
      vec3 greenShift = vec3(0.0, 1.0, 0.0) * fresnelFactor * chromaticAberrationOffset.y;
      vec3 blueShift = vec3(0.0, 0.0, 1.0) * fresnelFactor * chromaticAberrationOffset.z;

      vec3 finalColor = baseColor + redShift + greenShift + blueShift;
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
);

// Extend Three.js with custom shader material
extend({ FresnelMaterial });

function Model({ url }) {
  const obj = useLoader(OBJLoader, url);
  const ref = useRef<THREE.Group>();

  useEffect(() => {
    if (ref.current) {
      const box = new THREE.Box3().setFromObject(ref.current);
      const center = box.getCenter(new THREE.Vector3());
      ref.current.position.sub(center);

      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      ref.current.scale.multiplyScalar(5 / maxDim);
    }
  }, [obj]);

  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.01; // Continuous rotation
    }
  });

  return (
    <group ref={ref}>
      {obj.children.map((child, index) => (
        <mesh key={index} geometry={child.geometry} castShadow receiveShadow>
          <fresnelMaterial
            color={new THREE.Color('#ffffff')} // Base color of the object
            fresnelColor={new THREE.Color('#ff00ff')} // Fresnel color for edge highlights
            chromaticAberrationOffset={new THREE.Vector3(0.01, 0.02, 0.03)} // Chromatic Aberration offset for RGB channels
          />
        </mesh>
      ))}
    </group>
  );
}

function LoadingMessage() {
  return (
    <Html center>
      <div className="text-white text-2xl">Loading model...</div>
    </Html>
  );
}

export default function Component() {
  return (
    <div className="w-full h-screen" style={{ width: '100%', height: '100%', backgroundColor: "#151519" }}>
      <Canvas style={{ width: '100%', height: '100%' }}>
        <Suspense fallback={<LoadingMessage />}>
          <Model url="model.obj" />
          <Environment preset="city" /> {/* HDR for realistic reflections */}
        </Suspense>
        <OrbitControls />
      </Canvas>
    </div>
  );
}
