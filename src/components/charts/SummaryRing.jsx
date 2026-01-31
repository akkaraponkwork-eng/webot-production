import React from 'react'
import { Cat } from 'lucide-react'

export default function SummaryRing({ percentage = 1 }) {
  const radius = 70
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative flex items-center justify-center w-64 h-64">
      {/* Background Circle */}
      <div className="absolute inset-0 rounded-full border-[1.5rem] border-orange-50"></div>
      
      {/* SVG Progress */}
      <svg className="absolute inset-0 w-full h-full rotate-[-90deg]" viewBox="0 0 200 200">
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="#fed7aa" // or darker orange depending on design
          strokeWidth="24"
          strokeDasharray={circumference}
          strokeDashoffset={circumference} // Start empty
          strokeLinecap="round"
          className="opacity-20"
        />
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="#f97316"
          strokeWidth="24"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
        {/* Dot at start/end? Reference has a dot. */}
        {/* Skipping complex dot geometry for now, sticking to clean stroke */}
      </svg>

      {/* Center Content */}
      <div className="relative z-10 flex flex-col items-center">
         {/* Small Cat Icon using Lucide or Custom SVG */}
         <div className="text-orange-400 mb-1">
             <Cat size={48} strokeWidth={1.5} />
         </div>
         <span className="text-4xl font-black text-slate-800">{percentage}%</span>
      </div>
    </div>
  )
}
