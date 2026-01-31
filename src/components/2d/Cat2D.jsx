import React, { useState, useEffect } from 'react'
import { clsx } from 'clsx'

export default function Cat2D({ className }) {
  const [blink, setBlink] = useState(false)
  const [happy, setHappy] = useState(false)

  // Floating & Blinking logic (similar to 3D but for CSS)
  useEffect(() => {
    // Random blink
    const blinkInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        setBlink(true)
        setTimeout(() => setBlink(false), 200)
      }
    }, 2000)

    return () => clearInterval(blinkInterval)
  }, [])

  const handleInteraction = () => {
    setHappy(true)
    setTimeout(() => setHappy(false), 1000)
  }

  return (
    <div 
        className={clsx("relative w-64 h-64 animate-float cursor-pointer transition-transform active:scale-95", className)} 
        onClick={handleInteraction}
    >
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-2xl">
        {/* Tail */}
        <path d="M150 150 C 180 150, 180 100, 150 110" stroke="#ea580c" strokeWidth="12" fill="none" className="animate-pulse" />

        {/* Body */}
        <ellipse cx="100" cy="140" rx="50" ry="40" fill="#f97316" />
        <ellipse cx="100" cy="140" rx="30" ry="25" fill="#fff7ed" opacity="0.8" />

        {/* Head */}
        <circle cx="100" cy="90" r="45" fill="#f97316" />

        {/* Ears */}
        <path d="M65 70 L 60 40 L 90 60 Z" fill="#f97316" />
        <path d="M135 70 L 140 40 L 110 60 Z" fill="#f97316" />
        <path d="M68 68 L 65 50 L 85 62 Z" fill="#fed7aa" />
        <path d="M132 68 L 135 50 L 115 62 Z" fill="#fed7aa" />

        {/* Eyes (Blinking) */}
        {blink ? (
            <>
                <line x1="80" y1="90" x2="95" y2="90" stroke="#451a03" strokeWidth="3" strokeLinecap="round" />
                <line x1="105" y1="90" x2="120" y2="90" stroke="#451a03" strokeWidth="3" strokeLinecap="round" />
            </>
        ) : (
            <>
                <circle cx="87" cy="90" r="5" fill="#451a03" />
                <circle cx="113" cy="90" r="5" fill="#451a03" />
                <circle cx="89" cy="88" r="2" fill="white" />
                <circle cx="115" cy="88" r="2" fill="white" />
            </>
        )}

        {/* Mouth/Nose */}
        <circle cx="100" cy="100" r="2" fill="#451a03" />
        <path d="M95 105 Q 100 110 105 105" stroke="#451a03" strokeWidth="2" fill="none" />
        
        {/* Cheeks */}
        {happy && (
            <>
                <circle cx="75" cy="100" r="5" fill="#fda4af" opacity="0.6" />
                <circle cx="125" cy="100" r="5" fill="#fda4af" opacity="0.6" />
            </>
        )}

        {/* Speech Bubble */}
        {happy && (
            <g transform="translate(140, 40)">
                <path d="M0 0 Q 10 -10 20 0 T 40 0 V 20 H 0 Z" fill="white" stroke="#e2e8f0" strokeWidth="1"/>
                <text x="10" y="15" fontSize="12" fill="#ea580c" fontWeight="bold">Meow!</text>
            </g>
        )}
      </svg>
    </div>
  )
}
