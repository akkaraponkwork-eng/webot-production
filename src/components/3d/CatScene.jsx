import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei'
import { CatModel } from './CatModel'

export default function CatScene() {
  return (
    <div className="w-full h-full relative">
      <Canvas shadows camera={{ position: [0, 1, 4], fov: 50 }}>
        <Suspense fallback={null}>
          <Environment preset="city" />
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} shadow-mapSize={2048} castShadow />
          
          <CatModel position={[0, -0.5, 0]} />
          
          <ContactShadows resolution={1024} scale={10} blur={2} opacity={0.25} far={10} color="#000000" />
          <OrbitControls 
            enablePan={false} 
            enableZoom={false} 
            minPolarAngle={Math.PI / 2.5} 
            maxPolarAngle={Math.PI / 2} 
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
