import React, { useState } from 'react'
import { YearlyTrendChart } from '../components/charts/YearlyTrendChart'
import { useUser } from '../contexts/UserContext'
import { useData } from '../contexts/DataContext'
import { ChevronLeft, ChevronRight, Wallet, BarChart3 } from 'lucide-react'
import SummaryRing from '../components/charts/SummaryRing'
import TopBar from '../components/layout/TopBar'

export default function SummaryPage() {
  const { user } = useUser()
  const { records } = useData() // Get raw records to filter locally
  const [year, setYear] = useState(new Date().getFullYear())

  const handlePrevYear = () => setYear(prev => prev - 1)
  const handleNextYear = () => setYear(prev => prev + 1)

  // Filter records for selected year
  const yearlyRecords = records.filter(r => new Date(r.date).getFullYear() === year)
  
  // Calculate stats for the year
  const yearlyOTIncome = yearlyRecords.reduce((acc, r) => acc + Number(r.total_income), 0)
  const totalYearlyIncome = yearlyOTIncome

  // Mock percentage for the ring (e.g., target 1M THB ?)
  // For now let's just make it relative to some goal or just visual
  const progressPercentage = Math.min(Math.round((totalYearlyIncome / 100000) * 100), 100) 

  return (
    <div className="h-full flex flex-col bg-[#fffbf5]">
      <TopBar />
      
      <div className="flex-1 overflow-y-auto px-6 pt-4 pb-32 space-y-6">
        
        {/* Header Year Selector */}
        <div className="flex justify-between items-center px-2">
            <button 
                onClick={handlePrevYear}
                className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-orange-300 shadow-sm hover:text-orange-500 active:scale-95 transition-all"
            >
                <ChevronLeft size={24} strokeWidth={2.5} />
            </button>
            <div className="flex flex-col items-center">
                <h1 className="text-2xl font-black text-slate-800 tracking-tight">Year {year}</h1>
                <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">Summary</span>
            </div>
            <button 
                onClick={handleNextYear}
                className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-orange-300 shadow-sm hover:text-orange-500 active:scale-95 transition-all"
            >
                <ChevronRight size={24} strokeWidth={2.5} />
            </button>
        </div>

        {/* Main Card: Ring + Payout */}
        <div className="bg-white rounded-[3rem] p-4 pt-10 pb-4 shadow-[0_20px_40px_-10px_rgba(249,115,22,0.08)] flex flex-col items-center relative overflow-hidden">
            
            {/* Circular Progress */}
            <div className="mb-10">
                <SummaryRing percentage={progressPercentage} />
            </div>

            {/* Dark Payout Pill */}
            <div className="bg-[#0f172a] w-full rounded-[2.5rem] p-6 text-white relative flex items-center justify-between">
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 opacity-80">Total OT Payout</p>
                    <h2 className="text-3xl font-black tracking-tight leading-none">
                        ${totalYearlyIncome.toLocaleString()}
                    </h2>
                </div>
                <div className="text-slate-600">
                    <Wallet size={40} strokeWidth={1.5} className="opacity-50" />
                </div>
            </div>
        </div>

        {/* Trend Section */}
        <div className="bg-white rounded-[3rem] p-6 shadow-sm min-h-[200px]">
             <div className="flex items-center gap-2 mb-6 ml-2">
                <BarChart3 className="text-orange-500" size={20} />
                <h3 className="text-lg font-black text-slate-800 tracking-tight">Yearly Trend</h3>
            </div>
            <div className="h-48">
                <YearlyTrendChart year={year} />
            </div>
        </div>

      </div>
    </div>
  )
}
