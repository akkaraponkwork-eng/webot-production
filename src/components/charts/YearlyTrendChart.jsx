import React from 'react'
import { useData } from '../../contexts/DataContext'
import { clsx } from 'clsx'

export function YearlyTrendChart({ year }) {
  const { records } = useData()
  const selectedYear = year || new Date().getFullYear()

  // Generate 12 months data for the selected year
  const data = [...Array(12)].map((_, i) => {
    const d = new Date(selectedYear, i, 1) // Month i of selectedYear
    
    // Manually construct YYYY-MM to avoid UTC shifting issues
    const yearStr = d.getFullYear()
    const monthStr = String(d.getMonth() + 1).padStart(2, '0')
    const monthKey = `${yearStr}-${monthStr}`
    
    // Sum income for this month
    const amount = records
        .filter(r => r.date.startsWith(monthKey))
        .reduce((sum, r) => sum + Number(r.total_income), 0)

    return {
        name: d.toLocaleString('default', { month: 'short' }),
        amount,
        isCurrent: false // No need to highlight "current" in a yearly view, or could highlight if matches today
    }
  })

  // Find max for scaling
  const maxAmount = Math.max(...data.map(d => d.amount), 1)

  return (
    <div className="flex items-end justify-between h-full gap-2 px-2">
        {data.map((m, idx) => {
            // Calculate height percentage (min 10% for visibility)
            const heightPct = Math.max((m.amount / maxAmount) * 100, 10)
            
            return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                    <div className="relative w-full flex flex-col items-center justify-end h-[80%]">
                        <div 
                            className={clsx(
                                "w-full max-w-[16px] rounded-full transition-all duration-1000",
                                m.isCurrent ? "bg-orange-500 shadow-lg shadow-orange-200" : "bg-orange-100 group-hover:bg-orange-200"
                            )}
                            style={{ height: `${heightPct}%` }}
                        ></div>
                    </div>
                    <span className={clsx(
                        "text-[10px] font-black uppercase tracking-wider", 
                        m.isCurrent ? "text-orange-500" : "text-orange-200"
                    )}>
                        {m.name}
                    </span>
                </div>
            )
        })}
    </div>
  )
}
