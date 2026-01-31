import React from 'react'
import { Settings, Cat } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useUser } from '../../contexts/UserContext'
import { usePet } from '../../contexts/PetContext'

export default function TopBar() {
  const { user } = useUser()
  const { level, points } = usePet()

  return (
    <header className="px-6 pt-[calc(3.5rem+env(safe-area-inset-top))] pb-2 flex justify-between items-center bg-[#fffbf5]">
      {/* Brand / Level */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200">
            <Cat className="text-white w-6 h-6" />
        </div>
        <div className="flex flex-col">
            <h1 className="text-lg font-black text-orange-600 leading-none">Meow Tracker</h1>
            <span className="text-[10px] font-bold text-orange-300 uppercase tracking-widest mt-1">
                Level {level || 1} Explorer
            </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <div className="bg-orange-50 px-3 py-1.5 rounded-full flex items-center gap-1 border border-orange-100">
            <span className="text-xs font-bold text-orange-400">★</span>
            <span className="text-xs font-bold text-orange-600">{points || 0}</span>
        </div>
        <Link to="/settings" className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:text-orange-500 hover:bg-orange-50 transition-colors">
            <Settings className="w-5 h-5" />
        </Link>
      </div>
    </header>
  )
}
