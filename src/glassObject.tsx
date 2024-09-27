import { Suspense } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { useRef, useEffect } from "react";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { OrbitControls, Environment } from '@react-three/drei';
import { Html } from '@react-three/drei';
import * as THREE from "three";

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
          <meshPhysicalMaterial
            color={'#ffffff'} // Keep base color white
            transparent={true} // Enable transparency
            opacity={0.9} // Make it slightly transparent
            roughness={0.05} // Low roughness for smooth reflections
            metalness={0.8} // High metalness for metallic glass effect
            transmission={1} // Full transmission for glass
            ior={1.5} // Refraction index for glass
            reflectivity={1} // High reflectivity for glass effect
            clearcoat={1} // Add clearcoat for glossy finish
            clearcoatRoughness={0} // Smooth clearcoat
            envMapIntensity={2} // Increase the intensity of environment reflections
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
          <Environment preset="sunset" /> {/* Use HDR environment for better reflections */}
        </Suspense>
        <OrbitControls />
      </Canvas>
    </div>
  );
}
