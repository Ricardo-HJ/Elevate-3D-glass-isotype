import React, { useRef, useEffect} from "react";
import { Suspense } from "react";
import { Canvas, useFrame, useLoader} from "@react-three/fiber";
import { OBJLoader } from "three-stdlib";
import { OrbitControls, Environment } from '@react-three/drei';
import { extend } from "@react-three/fiber";
import * as THREE from "three";
import { shaderMaterial } from "@react-three/drei";
import { Html } from "@react-three/drei";
import { Color } from "three";

// Define custom shader material for Fresnel and Chromatic Aberration
class FresnelMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        color: { value: new THREE.Color('#ffffff') },
        fresnelColor: { value: new THREE.Color('#ff00ff') },
        chromaticAberrationOffset: { value: new THREE.Vector3(0.01, 0.02, 0.03) },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewPosition = -mvPosition.xyz;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        uniform vec3 fresnelColor;
        uniform vec3 chromaticAberrationOffset;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        void main() {
          float fresnel = dot(normalize(vViewPosition), vNormal);
          fresnel = 1.0 - fresnel;
          fresnel = pow(fresnel, 3.0);
          vec3 finalColor = mix(color, fresnelColor, fresnel);
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
    });
  }
}

// Register the material with react-three-fiber
extend({ FresnelMaterial });

function Model({ url }) {
  const obj = useLoader(OBJLoader, url) as THREE.Group;
  const ref = useRef<THREE.Group>(null);

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
        <mesh key={index} geometry={(child as THREE.Mesh).geometry} castShadow receiveShadow>
          <primitive
            object={(() => {
              const material = new FresnelMaterial();
              material.uniforms.color.value = new THREE.Color('#ffffff'); // Base color of the object
              material.uniforms.fresnelColor.value = new THREE.Color('#ff00ff'); // Fresnel color for edge highlights
              material.uniforms.chromaticAberrationOffset.value = new THREE.Vector3(0.01, 0.02, 0.03); // Chromatic Aberration offset for RGB channels
              return material;
            })()}
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
          <Environment preset="sunset" /> {/* HDR for realistic reflections */}
        </Suspense>
        <OrbitControls />
      </Canvas>
    </div>
  );
}
