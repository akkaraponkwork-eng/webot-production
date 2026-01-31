import React, { useState, useEffect } from 'react'
import { useUser } from '../contexts/UserContext'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'
import { clsx } from 'clsx'

export default function Settings() {
  const { user, updateProfile, signOut } = useUser()
  const navigate = useNavigate()
  const [baseSalary, setBaseSalary] = useState(25000)
  const [workDays, setWorkDays] = useState(30)
  const [startTime, setStartTime] = useState('08:00')
  const [endTime, setEndTime] = useState('17:00')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user?.base_salary) setBaseSalary(user.base_salary)
    if (user?.work_days_per_month) setWorkDays(user.work_days_per_month)
    if (user?.work_start_time) setStartTime(user.work_start_time)
    if (user?.work_end_time) setEndTime(user.work_end_time)
  }, [user])

  const handleSave = async () => {
    setSaving(true)
    
    // Use context method to ensure local state updates immediately
    const result = await updateProfile({ 
        base_salary: parseFloat(baseSalary),
        work_days_per_month: parseInt(workDays),
        work_start_time: startTime,
        work_end_time: endTime
    })
    
    if (result.success) {
        setTimeout(() => navigate(-1), 500) // Close after save
    } else {
        alert("Error saving settings: " + result.error?.message)
    }
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black text-slate-800">Settings</h2>
            <button 
                onClick={() => navigate(-1)}
                className="w-10 h-10 bg-slate-50 hover:bg-slate-100 rounded-full flex items-center justify-center text-slate-400 transition-colors"
            >
                <X strokeWidth={2.5} size={20} />
            </button>
        </div>

        {/* Input Card */}
        <div className="bg-[#fffbf5] rounded-[2rem] p-8 mb-8 border border-orange-50 flex flex-col items-center space-y-6">
            
            <div className="w-full">
                <label className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-2 block text-center">Base Salary (THB)</label>
                <input 
                    type="number"
                    value={baseSalary}
                    onChange={(e) => setBaseSalary(e.target.value)}
                    className="w-full bg-transparent text-center text-4xl font-black text-slate-800 outline-none placeholder-slate-200"
                    placeholder="0"
                />
            </div>

            <div className="w-full flex items-center justify-between border-t border-orange-100 pt-6">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Work Days / Month</label>
                <input 
                    type="number"
                    value={workDays}
                    onChange={(e) => setWorkDays(e.target.value)}
                    className="w-16 bg-white rounded-lg p-2 text-center text-sm font-bold text-slate-700 outline-none ring-1 ring-orange-100 focus:ring-orange-300"
                />
            </div>

            <div className="w-full grid grid-cols-2 gap-4 pt-4 border-t border-orange-100">
                 <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block text-center">Start Time</label>
                    <input 
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full bg-white rounded-xl p-3 text-center text-lg font-bold text-slate-700 outline-none ring-1 ring-orange-100 focus:ring-orange-300"
                    />
                 </div>
                 <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block text-center">End Time</label>
                    <input 
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full bg-white rounded-xl p-3 text-center text-lg font-bold text-slate-700 outline-none ring-1 ring-orange-100 focus:ring-orange-300"
                    />
                 </div>
            </div>
        </div>

        {/* Action Button */}
        <button 
            onClick={handleSave}
            disabled={saving}
            className={clsx(
                "w-full py-4 rounded-2xl font-black text-white text-lg tracking-wide shadow-lg transition-all active:scale-95",
                saving ? "bg-slate-700" : "bg-[#1e293b] hover:bg-slate-800 shadow-slate-200"
            )}
        >
            {saving ? 'Saving...' : 'Meow Update'}
        </button>

        <button 
            onClick={signOut}
            className="w-full mt-4 py-3 rounded-2xl font-bold text-red-400 text-sm tracking-wide hover:bg-red-50 transition-colors"
        >
            Sign Out
        </button>

      </div>
    </div>
  )
}
