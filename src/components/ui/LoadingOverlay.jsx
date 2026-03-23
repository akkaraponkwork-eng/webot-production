import React, { useEffect, useState } from 'react'

export default function LoadingOverlay() {
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const handleStart = () => setLoading(true)
        const handleEnd = () => setLoading(false)

        window.addEventListener('apiLoadStart', handleStart)
        window.addEventListener('apiLoadEnd', handleEnd)

        return () => {
            window.removeEventListener('apiLoadStart', handleStart)
            window.removeEventListener('apiLoadEnd', handleEnd)
        }
    }, [])

    if (!loading) return null

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white px-10 py-8 rounded-[2rem] shadow-2xl flex flex-col items-center gap-4 animate-in zoom-in-95 duration-300 border-2 border-orange-100">
                <div className="relative w-16 h-16 flex items-center justify-center">
                    <div className="absolute inset-0 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin"></div>
                    <span className="text-2xl">🐈</span>
                </div>
                <div className="text-orange-600 font-black uppercase tracking-widest text-xs animate-pulse">
                    Loading...
                </div>
            </div>
        </div>
    )
}
