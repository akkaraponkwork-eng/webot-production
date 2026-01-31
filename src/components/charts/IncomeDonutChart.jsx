import React from 'react'
import { useUser } from '../../contexts/UserContext'
import { useData } from '../../contexts/DataContext'

export function IncomeDonutChart() {
  const { user } = useUser()
  const { stats } = useData()

  const baseSalary = user?.base_salary || 0
  const otIncome = stats.totalIncome
  const total = baseSalary + otIncome
  
  const percentage = total > 0 ? (otIncome / total) * 100 : 0
  
  // SVG Props
  const strokeWidth = 12
  const radius = 50
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative flex items-center justify-center w-full h-full">
        <div className="relative w-40 h-40">
            <svg className="w-full h-full transform -rotate-90">
                {/* Background Circle */}
                <circle 
                    cx="80" cy="80" r={radius} 
                    stroke="currentColor" strokeWidth={strokeWidth} 
                    fill="transparent" 
                    className="text-orange-100" 
                />
                {/* Progress Circle (OT) */}
                <circle 
                    cx="80" cy="80" r={radius} 
                    stroke="currentColor" strokeWidth={strokeWidth} 
                    fill="transparent" 
                    strokeDasharray={circumference} 
                    strokeDashoffset={offset} 
                    strokeLinecap="round"
                    className="text-orange-500 transition-all duration-1000 ease-out"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-slate-800">{Math.round(percentage)}%</span>
                <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">OT RATIO</span>
            </div>
        </div>
    </div>
  )
}
