import React, { useState } from 'react'
import { useUser } from '../contexts/UserContext'
import { usePet } from '../contexts/PetContext'
import Cat2D from '../components/2d/Cat2D'
import CatMinimal from '../components/2d/CatMinimal'
import TopBar from '../components/layout/TopBar'
import { Fish, Coffee, Gamepad2, BedDouble, Star, PencilLine } from 'lucide-react'
import { clsx } from 'clsx'

export default function Dashboard() {
  const { user, updateProfile } = useUser()
  const { level, exp, points, totalExpToLevel, buyItem } = usePet()
  const [isEditingName, setIsEditingName] = useState(false)
  const [tempName, setTempName] = useState('')

  const handleSaveName = async () => {
      if (!tempName.trim()) return
      await updateProfile({ full_name: tempName })
      setIsEditingName(false)
  }
  
  // Shop items from reference
  const shopItems = [
    { id: 1, name: 'Fish Snack', cost: 100, exp: 40, icon: Fish, color: 'text-blue-400 bg-blue-50' },
    { id: 2, name: 'Hot Milk', cost: 250, exp: 120, icon: Coffee, color: 'text-amber-600 bg-amber-50' },
    { id: 3, name: 'Cat Toy', cost: 500, exp: 300, icon: Gamepad2, color: 'text-yellow-500 bg-yellow-50' },
    { id: 4, name: 'Luxury Bed', cost: 1000, exp: 700, icon: BedDouble, color: 'text-indigo-500 bg-indigo-50' },
  ]

  const handleBuy = async (item) => {
      if (points >= item.cost) {
          await buyItem(item.cost, item.exp)
          // Optional: Add visual feedback/toast here
      }
  }

  return (
    <div className="h-full flex flex-col bg-[#fffbf5]">
      <TopBar />

      {/* Main Content Scrollable */}
      <div className="flex-1 overflow-y-auto px-6 mt-4 space-y-6 pb-32">
        
        {/* Cat Card */}
        <div className="bg-white rounded-[3rem] p-8 shadow-[0_20px_40px_-10px_rgba(249,115,22,0.08)] flex flex-col relative overflow-hidden transition-all min-h-[400px]">
            
            {/* Header Info (Top Left) */}
            <div className="flex flex-col items-start gap-1 z-20 w-full">
                <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">
                    LV.{level}
                </span>
                
                {/* Editable Name Section */}
                {isEditingName ? (
                    <div className="flex items-center gap-2 w-full">
                        <input 
                            type="text" 
                            value={tempName}
                            onChange={(e) => setTempName(e.target.value)}
                            className="bg-orange-50 text-xl font-black text-slate-800 uppercase tracking-wide leading-none border-b-2 border-orange-500 outline-none w-full max-w-[200px]"
                            autoFocus
                        />
                        <button 
                            onClick={handleSaveName}
                            className="w-8 h-8 flex items-center justify-center bg-green-500 text-white rounded-full shadow-md active:scale-95 transition-all"
                        >
                            <span className="text-xs font-bold">✓</span>
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <h2 className="text-xl font-black text-slate-800 uppercase tracking-wide leading-none">
                            {user?.full_name || 'Orange Cloud'}
                        </h2>
                        <button 
                            onClick={() => {
                                setTempName(user?.full_name || 'Orange Cloud')
                                setIsEditingName(true)
                            }}
                            className="w-6 h-6 flex items-center justify-center text-slate-300 hover:text-orange-500 transition-colors"
                        >
                            <PencilLine size={14} />
                        </button>
                    </div>
                )}
            </div>
            
            {/* Center Cat */}
            <div className="flex-1 flex items-center justify-center py-4">
                <CatMinimal />
            </div>

            {/* EXP Bar (Bottom) - Bolder Style */}
            <div className="w-full relative z-10 mt-auto">
                <div className="flex justify-between text-[10px] font-black text-slate-400 mb-2 px-1 uppercase tracking-widest">
                    <span className="text-slate-400/80">EXP Progress</span>
                    <span className="text-slate-500 font-bold">{exp} / {totalExpToLevel}</span>
                </div>
                <div className="h-4 w-full bg-[#fae8d4] rounded-full p-[2px]">
                    <div 
                        className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all duration-700 ease-out relative shadow-[0_2px_10px_rgba(249,115,22,0.3)]" 
                        style={{ width: `${Math.min((exp / totalExpToLevel) * 100, 100)}%` }}
                    ></div>
                </div>
            </div>
        </div>

        {/* Shop Section */}
        <div>
            <div className="flex items-center gap-2 mb-4 px-2">
                <div className="w-1 h-4 bg-orange-500 rounded-full"></div>
                <h3 className="text-lg font-black text-slate-700">Meow Shop</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                {shopItems.map((item) => {
                    const canAfford = points >= item.cost
                    return (
                        <button 
                            key={item.id} 
                            onClick={() => handleBuy(item)}
                            disabled={!canAfford}
                            className={clsx(
                                "p-5 rounded-[2rem] flex flex-col items-center transition-all duration-200 border-2",
                                canAfford 
                                    ? "bg-white border-transparent shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] active:scale-95 hover:shadow-lg hover:shadow-orange-100/50 hover:border-orange-100" 
                                    : "bg-slate-50 border-transparent opacity-60 grayscale cursor-not-allowed"
                            )}
                        >
                            <div className={clsx("w-14 h-14 rounded-2xl flex items-center justify-center mb-3 text-lg transition-colors", item.color)}>
                                <item.icon size={26} strokeWidth={2.5} />
                            </div>
                            <h4 className="font-bold text-slate-600 text-sm text-center mb-1">{item.name}</h4>
                            <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-full">
                                <span className={clsx("text-[10px] font-black", canAfford ? "text-orange-500" : "text-slate-400")}>
                                    {item.cost} PTS
                                </span>
                            </div>
                        </button>
                    )
                })}
            </div>
        </div>

      </div>
    </div>
  )
}
