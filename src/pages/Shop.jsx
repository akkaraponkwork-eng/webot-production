import React from 'react'
import { usePet } from '../contexts/PetContext'
import { GAME_CONSTANTS } from '../lib/constants'
import { Button } from '../components/ui/Button'
import { ShoppingBag } from 'lucide-react'

export default function Shop() {
  const { points, spendPoints } = usePet()

  const handleBuy = async (item) => {
    if (points >= item.cost) {
        const success = await spendPoints(item.cost)
        if (success) {
            alert(`Bought ${item.name}! Meow loves it!`)
            // TODO: Trigger animation
        }
    } else {
        alert("Not enough Meow Points! Work more OT!")
    }
  }

  return (
    <div className="pb-24 pt-4 px-4 h-full overflow-auto">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-black text-slate-800">Meow Shop</h1>
        <div className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full font-bold flex items-center gap-1">
            <span>🪙</span> {points.toLocaleString()}
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4">
        {GAME_CONSTANTS.SHOP_ITEMS.map(item => (
            <div key={item.id} className="bg-white p-4 rounded-3xl shadow-sm flex flex-col items-center text-center">
                <div className="text-4xl mb-2">{item.icon}</div>
                <h3 className="font-bold text-slate-700">{item.name}</h3>
                <p className="text-xs text-slate-400 mb-3">+{item.exp} EXP</p>
                
                <Button 
                    size="sm" 
                    className="w-full" 
                    disabled={points < item.cost}
                    onClick={() => handleBuy(item)}
                >
                    {item.cost} Pts
                </Button>
            </div>
        ))}
      </div>
    </div>
  )
}
