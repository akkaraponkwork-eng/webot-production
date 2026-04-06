import React from 'react'
import { NavLink } from 'react-router-dom'
import { CalendarDays, PieChart, Cat, MessageCircle } from 'lucide-react'
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

      {/* My Cat Tab (Dashboard) */}
      <NavLink
        to="/my-cat"
        className={({ isActive }) => clsx(
            "flex flex-col items-center mb-2 transition-all duration-300 w-20",
            isActive ? "text-orange-500" : "text-orange-200 hover:text-orange-300"
        )}
      >
        <Cat strokeWidth={2.5} className="w-7 h-7" />
        <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">My Cat</span>
      </NavLink>

      {/* Chat Tab */}
      <NavLink
        to="/chat" 
        className={({ isActive }) => clsx(
            "flex flex-col items-center mb-2 transition-all duration-300 w-20",
            isActive ? "text-orange-500" : "text-orange-200 hover:text-orange-300"
        )}
      >
        <MessageCircle strokeWidth={2.5} className="w-7 h-7" />
        <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">Chat</span>
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
