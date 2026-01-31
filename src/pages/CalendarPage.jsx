import React, { useState } from 'react'
import { useData } from '../contexts/DataContext'
import { ChevronLeft, ChevronRight, X, ChevronUp, ChevronDown, Trash2, CheckSquare, Square } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { clsx } from 'clsx'
import { GAME_CONSTANTS } from '../lib/constants'

import TopBar from '../components/layout/TopBar'

export default function CalendarPage() {
  const { records, addRecord, deleteRecord } = useData()
  const [currentDate, setCurrentDate] = useState(new Date())
  
  // Single Selection State
  const [selectedDate, setSelectedDate] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [hours, setHours] = useState('')
  const [multiplier, setMultiplier] = useState(1.5)

  // Calendar Logic
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()
  
  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))

  const handleDateClick = (day) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    setSelectedDate(clickedDate)
    setHours('')
    setIsModalOpen(true)
  }

  const handleSave = async () => {
      if (!hours || !selectedDate) return
      
      await addRecord(selectedDate, parseFloat(hours), multiplier)
      
      setIsModalOpen(false)
      setSelectedDate(null)
  }

  return (
    <div className="h-full flex flex-col bg-[#fffbf5] relative">
      <TopBar />
      
      <div className="flex-1 overflow-y-auto px-4 md:px-6 pt-4 pb-32">
      
      {/* Split Summary Cards */}
      <div className="flex gap-3 md:gap-4 mb-6">
          {/* Earnings Card (Orange) */}
          <div className="flex-1 bg-orange-500 rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-5 text-white shadow-lg shadow-orange-200 relative overflow-hidden">
              <div className="relative z-10">
                  <div className="flex items-center gap-1 opacity-90 mb-1 md:mb-2">
                       <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest">OT THIS MONTH</span>
                       <span className="text-xs">💸</span>
                  </div>
                  <div className="text-xl md:text-3xl font-black truncate relative">
                      <span className="text-sm align-top opacity-80 mr-0.5">$</span>
                      {records
                        .filter(r => new Date(r.date).getMonth() === currentDate.getMonth())
                        .reduce((acc, r) => acc + Number(r.total_income), 0)
                        .toLocaleString()
                      }
                  </div>
              </div>
              {/* Decoration Bubbles */}
              <div className="absolute top-2 right-2 w-6 h-6 bg-white/20 rounded-full"></div>
              <div className="absolute top-6 right-6 w-10 h-10 bg-white/10 rounded-full"></div>
          </div>

          {/* Hours Card (White) */}
          <div className="flex-1 bg-white rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-5 text-slate-700 shadow-sm relative overflow-hidden">
             <div className="relative z-10">
                  <div className="flex items-center gap-1 text-slate-400 mb-1 md:mb-2">
                      <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest">TOTAL HOURS</span>
                      <span className="text-xs">🐈</span>
                  </div>
                  <div className="text-xl md:text-3xl font-black text-orange-500 flex items-baseline gap-1">
                      {records
                        .filter(r => new Date(r.date).getMonth() === currentDate.getMonth())
                        .reduce((acc, r) => acc + Number(r.hours), 0)
                      } <span className="text-xs md:text-sm font-bold text-slate-400">hrs</span>
                  </div>
              </div>
          </div>
      </div>

      {/* Calendar Card (With Selector + Grid) */}
      <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-4 md:p-6 shadow-sm mb-4 min-h-[360px] relative transition-all duration-300">
         
         {/* Month Selector inside Card */}
         <div className="flex justify-between items-center mb-4 md:mb-6 relative z-10">
            <button onClick={handlePrevMonth} className="p-2 hover:bg-orange-50 rounded-full text-orange-400 transition-colors"><ChevronLeft className="w-5 h-5"/></button>
            <div className="flex flex-col items-center">
                <span className="text-lg md:text-xl font-black text-slate-800 tracking-tight">
                    {currentDate.toLocaleString('default', { month: 'long' })}
                </span>
                <span className="text-[10px] md:text-xs font-bold text-orange-400 tracking-widest">
                    {currentDate.getFullYear()}
                </span>
            </div>
            <button onClick={handleNextMonth} className="p-2 hover:bg-orange-50 rounded-full text-orange-400 transition-colors"><ChevronRight className="w-5 h-5"/></button>
         </div>

         <div className="grid grid-cols-7 mb-2 md:mb-4 text-center text-[10px] md:text-xs font-black text-orange-200 uppercase tracking-widest relative z-10">
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <div key={d}>{d}</div>)}
         </div>
         <div className="grid grid-cols-7 gap-y-2 md:gap-y-4 gap-x-1 md:gap-x-2 relative z-10">
            {[...Array(firstDay)].map((_, i) => <div key={`empty-${i}`} />)}
             {[...Array(daysInMonth)].map((_, i) => {
                const day = i + 1
                const dayDateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
                const dayDateStr = dayDateObj.toLocaleDateString('en-CA') // YYYY-MM-DD format based on local time
                
                const dayRecords = records.filter(r => {
                    // Safe string comparison
                    return r.date.split('T')[0] === dayDateStr
                })
                
                const totalHours = dayRecords.reduce((acc, r) => acc + Number(r.hours), 0)
                const isToday = new Date().toDateString() === dayDateObj.toDateString()
                
                return (
                    <button 
                        key={day}
                        onClick={() => handleDateClick(day)}
                        className={clsx(
                            "aspect-square rounded-lg md:rounded-xl flex flex-col items-center justify-center relative transition-all duration-200 border-2",
                            isToday 
                                ? "bg-orange-50 border-orange-200" 
                                : "bg-white border-transparent hover:bg-slate-50",
                            dayRecords.length > 0 && "bg-orange-400/20 border-orange-200", // Soft orange background for entries to keep text readable
                            "active:scale-95"
                        )}
                    >
                        {/* Date Number */}
                        <span className={clsx(
                            "text-xs md:text-sm font-black z-10",
                            dayRecords.length > 0 ? "text-slate-900" : "text-slate-600"
                        )}>{day}</span>

                        {/* Cat Emoji - Top Center */}
                        {dayRecords.length > 0 && (
                            <div className="absolute top-0 md:top-0.5 left-1/2 transform -translate-x-1/2 text-[8px] md:text-[10px]">🐱</div>
                        )}
                        
                        {/* Hours - Bottom */}
                        {dayRecords.length > 0 && (
                             <div className="text-[8px] md:text-[9px] font-bold text-orange-600 -mt-0.5 md:-mt-1">{totalHours}h</div>
                        )}
                    </button>
                )
            })}

         </div>
      </div>
      
      {/* Quick Log Modal Overlay */}
      {isModalOpen && selectedDate && (
          <div className="fixed inset-0 bg-slate-900/60 z-[60] overflow-y-auto backdrop-blur-sm animate-in fade-in duration-200">
              <div className="flex min-h-full items-center justify-center p-4">
                  <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-sm animate-in zoom-in-95 duration-300 relative shadow-2xl my-auto">
                  
                  {/* Header */}
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-2xl font-black text-slate-800 tracking-tight">Add OT Hours</h3>
                      <button 
                        onClick={() => setIsModalOpen(false)}
                        className="w-10 h-10 bg-slate-50 hover:bg-slate-100 rounded-full flex items-center justify-center text-slate-400 transition-colors"
                      >
                          <X className="w-5 h-5" /> 
                      </button>
                  </div>

                  {/* Date Context */}
                  <div className="text-center mb-8">
                       <div className="text-slate-500 font-bold">
                           {selectedDate.toLocaleDateString('default', { weekday: 'long', day: 'numeric', month: 'long' })}
                       </div>
                  </div>
                  
                  {/* Input Display */}
                  <div className="flex flex-col items-center mb-10">
                      <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mb-4 flex items-center gap-1">
                        HOURS LOGGED <span className="text-xs">🕒</span>
                      </span>
                      
                      <div className="relative flex items-center justify-center w-full bg-[#fffbf5] rounded-[2rem] h-32">
                          {/* Input */}
                          <input 
                            type="number" 
                            value={hours} 
                            onChange={e => setHours(e.target.value)}
                            className="w-full bg-transparent text-center text-6xl font-black text-slate-600 outline-none placeholder-slate-200 z-10"
                            placeholder="0.0"
                            step="0.5"
                            autoFocus
                          />
                          {/* Custom Spinners (Visual) */}
                          <div className="absolute right-6 flex flex-col gap-1">
                              <button onClick={() => setHours(prev => (parseFloat(prev || 0) + 0.5).toString())} className="text-slate-300 hover:text-orange-500 transition-colors bg-white rounded-full p-1 shadow-sm"><ChevronUp className="w-5 h-5" /></button>
                              <button onClick={() => setHours(prev => Math.max(0, (parseFloat(prev || 0) - 0.5)).toString())} className="text-slate-300 hover:text-orange-500 transition-colors bg-white rounded-full p-1 shadow-sm"><ChevronDown className="w-5 h-5" /></button>
                          </div>
                      </div>
                  </div>

                  {/* Multiplier Selection */}
                  <div className="flex justify-center gap-4 mb-8">
                      {[1.5, 2.0, 3.0].map(m => (
                          <button
                            key={m}
                            onClick={() => setMultiplier(m)}
                            className={clsx(
                                "w-20 h-20 rounded-3xl font-black text-lg transition-all flex items-center justify-center border-2",
                                multiplier === m 
                                    ? "border-orange-500 text-orange-600 bg-orange-50 shadow-lg shadow-orange-100 scale-105" 
                                    : "border-slate-100 text-slate-300 hover:border-orange-200 hover:text-orange-300 bg-white"
                            )}
                          >
                              {m}x
                          </button>
                      ))}
                  </div>

                  <button 
                    onClick={handleSave}
                    className="w-full py-5 rounded-[1.5rem] font-black text-white text-xl tracking-wide shadow-xl shadow-orange-200 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 active:scale-95 transition-all mb-8"
                  >
                      Save Entry
                  </button>

                  <div className="border-t border-slate-100 pt-6">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Today's Entries</h4>
                      <div className="space-y-3 max-h-40 overflow-y-auto">
                          {records.filter(r => {
                                const rDate = new Date(r.date)
                                return rDate.toDateString() === selectedDate.toDateString()
                          }).length === 0 && (
                              <p className="text-center text-slate-300 text-sm py-2">No entries yet</p>
                          )}
                          
                          {records.filter(r => {
                                const rDate = new Date(r.date)
                                return rDate.toDateString() === selectedDate.toDateString()
                          }).map(record => (
                              <div key={record.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl">
                                  <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-black text-xs">
                                          {record.rate_multiplier}x
                                      </div>
                                      <div>
                                          <div className="font-black text-slate-700">{record.hours} hrs</div>
                                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">+${Number(record.total_income).toFixed(0)}</div>
                                      </div>
                                  </div>
                                  <button 
                                    onClick={() => deleteRecord(record.id)}
                                    className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                  >
                                      <Trash2 className="w-4 h-4" />
                                  </button>
                              </div>
                          ))}
                      </div>
                  </div>

              </div>
              </div>
          </div>
      )}
      </div>
    </div>
  )
}
