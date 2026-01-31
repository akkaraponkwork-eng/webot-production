import React, { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'

export function CatModel(props) {
  const group = useRef()
  const [hovered, setHover] = useState(false)
  const [active, setActive] = useState(false)

  const [blink, setBlink] = useState(false)

  // Floating & Blinking animation
  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    group.current.position.y = Math.sin(t * 1) * 0.2 // Float
    group.current.rotation.y = Math.sin(t * 0.5) * 0.1 // Rotate
    
    // Random Blink
    if (Math.random() > 0.995) setBlink(true)
    if (blink) setTimeout(() => setBlink(false), 150)
  })

  // Colors
  const ORANGE = "#fb923c"
  const WHITE = "#fff7ed"
  const DARK = "#451a03"

  const eyeScale = blink ? [1, 0.1, 1] : [1, 1, 1]

  return (
    <group ref={group} {...props} dispose={null} 
           onClick={() => setActive(!active)}
           onPointerOver={() => setHover(true)}
           onPointerOut={() => setHover(false)}>
      
      {/* Head */}
      <mesh position={[0, 0.8, 0]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color={ORANGE} />
      </mesh>

      {/* Ears */}
      <mesh position={[-0.35, 1.15, 0]} rotation={[0, 0, 0.2]}>
        <coneGeometry args={[0.15, 0.4, 32]} />
        <meshStandardMaterial color={ORANGE} />
      </mesh>
      <mesh position={[0.35, 1.15, 0]} rotation={[0, 0, -0.2]}>
        <coneGeometry args={[0.15, 0.4, 32]} />
        <meshStandardMaterial color={ORANGE} />
      </mesh>

      {/* Eyes */}
      <mesh position={[-0.15, 0.9, 0.4]} scale={eyeScale}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color={DARK} />
      </mesh>
      <mesh position={[0.15, 0.9, 0.4]} scale={eyeScale}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color={DARK} />
      </mesh>

      {/* Body */}
      <mesh position={[0, -0.2, 0]}>
        <capsuleGeometry args={[0.45, 1.2, 4, 8]} />
        <meshStandardMaterial color={ORANGE} />
      </mesh>

      {/* Belly (White patch) */}
      <mesh position={[0, -0.2, 0.35]} scale={[0.8, 0.8, 0.5]}>
         <sphereGeometry args={[0.4, 32, 32]} />
         <meshStandardMaterial color={WHITE} />
      </mesh>

      {/* Arms/Paws */}
      <mesh position={[-0.4, 0.2, 0.2]} rotation={[0, 0, 0.5]}>
        <capsuleGeometry args={[0.12, 0.5, 4, 8]} />
        <meshStandardMaterial color={WHITE} />
      </mesh>
      <mesh position={[0.4, 0.2, 0.2]} rotation={[0, 0, -0.5]}>
        <capsuleGeometry args={[0.12, 0.5, 4, 8]} />
        <meshStandardMaterial color={WHITE} />
      </mesh>

       {/* Chat Bubble if hovered */}
       {hovered && (
        <Html position={[0, 1.5, 0]} center>
          <div className="bg-white px-3 py-1 rounded-full shadow-lg text-sm font-bold text-orange-600 whitespace-nowrap">
            Meow! 🐈
          </div>
        </Html>
       )}
    </group>
  )
}
