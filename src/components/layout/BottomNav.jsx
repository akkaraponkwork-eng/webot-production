import React from 'react'
import { NavLink } from 'react-router-dom'
import { CalendarDays, PieChart, Cat } from 'lucide-react'
import { clsx } from 'clsx'

export default function BottomNav() {
  // New Layout: Schedule | My Cat | Summary 
  // (Home/Dashboard acts as "My Cat" tab)
  
  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white pt-2 px-6 flex justify-around items-end z-50 rounded-t-[2.5rem] shadow-[0_-8px_30px_rgba(249,115,22,0.15)] h-[calc(6rem+env(safe-area-inset-bottom))] pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
      
      {/* Schedule Tab */}
      <NavLink
        to="/"
        className={({ isActive }) => clsx(
            "flex flex-col items-center mb-2 transition-all duration-300 w-20",
            isActive ? "text-orange-500" : "text-orange-200 hover:text-orange-300"
        )}
      >
        <CalendarDays strokeWidth={2.5} className="w-7 h-7" />
        <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">Schedule</span>
      </NavLink>

      {/* Center Floating Button (My Cat / Home) */}
      <NavLink
        to="/my-cat"
        className={({ isActive }) => clsx(
            "relative -top-6 flex flex-col items-center justify-center w-20 h-20 rounded-full shadow-[0_8px_20px_rgba(249,115,22,0.4)] transition-transform duration-300 active:scale-95 border-4 border-[#fffbf5]",
            isActive ? "bg-orange-500 text-white" : "bg-orange-400 text-orange-50 hover:bg-orange-500"
        )}
      >
        <Cat strokeWidth={2.5} className="w-9 h-9" />
        <span className="text-[10px] font-bold mt-1 absolute -bottom-6 text-orange-500 uppercase tracking-widest">My Cat</span>
      </NavLink>

      {/* Summary Tab (Charts) */}
      <NavLink
        to="/summary" 
        className={({ isActive }) => clsx(
            "flex flex-col items-center mb-2 transition-all duration-300 w-20",
            isActive ? "text-orange-500" : "text-orange-200 hover:text-orange-300"
        )}
      >
        <PieChart strokeWidth={2.5} className="w-7 h-7" />
        <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">Summary</span>
      </NavLink>

    </nav>
  )
}
