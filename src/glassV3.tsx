"use client"

import { Canvas, useLoader, useFrame } from "@react-three/fiber"
import { OBJLoader } from "three-stdlib"
import { Environment, OrbitControls, useGLTF } from "@react-three/drei"
import * as THREE from "three"
import React, { useRef, Suspense } from "react"

function IridescentObject() {
  const objRef = useRef<THREE.Group>()
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null)

  // Load the OBJ file
  const obj = useLoader(OBJLoader, "/model.obj")

  // Clone the geometry to ensure we're not modifying the original
  const clonedObj = obj.clone()

  // Apply material to all meshes in the object
  clonedObj.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.material = materialRef.current
    }
  })

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.iridescenceIOR = 1.5 + Math.sin(clock.getElapsedTime()) * 0.2
      materialRef.current.iridescenceThicknessRange = [200 + Math.sin(clock.getElapsedTime() * 0.5) * 100, 800 + Math.cos(clock.getElapsedTime() * 0.5) * 200]
    }
    if (objRef.current) {
      objRef.current.rotation.y += 0.005
    }
  })

  return (
    <primitive object={clonedObj} ref={objRef} scale={[0.1, 0.1, 0.1]}>
      <meshPhysicalMaterial
        ref={materialRef}
        roughness={0.1}
        transmission={0.9}
        thickness={0.5}
        ior={2.5}
        iridescence={1}
        iridescenceIOR={2.5}
        iridescenceThicknessRange={[200, 1600]}
        clearcoat={1}
        clearcoatRoughness={0.1}
        metalness={0.4}
        color="#000000"
        emissive="#111111"
        side={THREE.DoubleSide}
        transparent={true}
        opacity={0.9}
        attenuationColor="#ff00ff"
        attenuationDistance={0.5}
      />
    </primitive>
  )
}

function Fallback() {
  return (
    <mesh>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial color="hotpink" />
    </mesh>
  )
}

export default function Component() {
    return (
      <div className="w-full h-screen" style={{ width: '100%', height: '100%', backgroundColor: "#151519" }}>
        <Canvas camera={{ position: [0, 0, 5] }}>
          <color attach="background" args={["#141418"]} />
          {/* Brighter ambient light to enhance iridescent effect */}
          <ambientLight intensity={1.0} color="#ffffff" />
            
            {/* Additional colored ambient lights to create an iridescent look */}
          <ambientLight intensity={0.6} color="#ff66ff" />
          <ambientLight intensity={0.6} color="#00ffff" />
  
          {/* Soft, indirect lighting to add color without being harsh */}
          <spotLight position={[10, 10, 10]} angle={0.3} penumbra={0.7} intensity={0.5} color="#ff00ff" />
          <spotLight position={[-10, 5, 10]} angle={0.3} penumbra={0.7} intensity={0.5} color="#00ffff" />
  
          {/* Very soft fill lights for colored reflection on surfaces */}
          <pointLight position={[5, 5, 5]} intensity={0.3} color="#ff6600" />
          <pointLight position={[-5, -5, -5]} intensity={0.3} color="#66ff33" />
  
          <Suspense fallback={<Fallback />}>
            <IridescentObject />
          </Suspense>
          
          {/* Environment lighting to add subtle global illumination */}
          <Environment preset="studio" background={false} />
          <OrbitControls autoRotate />
        </Canvas>
      </div>
    );
  }
  