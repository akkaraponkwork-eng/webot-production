import React, { useState, useEffect } from 'react'

export default function CatMinimal({ className }) {
  const [zzz, setZzz] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setZzz(prev => (prev + 1) % 4)
    }, 800)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className={`relative w-48 h-48 animate-float ${className}`}>
        {/* Lucide Cat Icon (User Provided) */}
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="w-full h-full text-orange-500 drop-shadow-sm"
        >
            <path d="M12 5c.67 0 1.35.09 2 .26 1.78-2 5.03-2.84 6.42-2.26 1.4.58-.42 7-.42 7 .57 1.07 1 2.24 1 3.44C21 17.9 16.97 21 12 21s-9-3-9-7.56c0-1.25.5-2.4 1-3.44 0 0-1.89-6.42-.5-7 1.39-.58 4.72.23 6.5 2.23A9.04 9.04 0 0 1 12 5Z" />
            <path d="M8 14v.5" />
            <path d="M16 14v.5" />
            <path d="M11.25 16.25h1.5L12 17l-.75-.75Z" />
        </svg>

        {/* Sleep Bubble */}
        <div className="absolute top-0 right-0 z-10 bg-white shadow-lg rounded-full w-12 h-12 flex items-center justify-center border border-orange-50 animate-pulse">
            <span className="text-blue-400 font-bold text-lg select-none">
                {zzz === 0 && 'z'}
                {zzz === 1 && 'zz'}
                {zzz === 2 && 'zzz'}
                {zzz === 3 && 'z'}
            </span>
        </div>
    </div>
  )
}
