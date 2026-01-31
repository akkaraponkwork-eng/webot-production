import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui/Button'
import CatMinimal from '../components/2d/CatMinimal'
import { LogIn } from 'lucide-react'

export default function Login() {
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin
        }
      })
      if (error) throw error
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-[100dvh] w-full flex flex-col md:flex-row bg-orange-50 relative z-0 overflow-y-auto md:overflow-hidden">
      {/* 2D Section */}
      <div className="flex-1 h-[50%] md:h-full relative bg-gradient-to-b from-orange-100 to-orange-50 flex items-center justify-center">
        <div className="absolute top-[calc(3.5rem+env(safe-area-inset-top))] left-4 z-10 glass-panel px-4 py-2 rounded-full">
            <span className="text-orange-600 font-bold">Meow OT Tracker 🐈</span>
        </div>
        <CatMinimal />
      </div>

      {/* Login Section */}
      <div className="flex-1 h-[50%] md:h-full flex flex-col items-center justify-center p-8 bg-white rounded-t-[2rem] md:rounded-l-[2rem] md:rounded-tr-none shadow-2xl z-10 -mt-8 md:mt-0">
        <div className="max-w-md w-full space-y-8 text-center">
            <div>
                <h1 className="text-3xl font-black text-slate-800 mb-2">Welcome Back!</h1>
                <p className="text-slate-500">Track your OT, earn points, and feed your cat.</p>
            </div>

            <div className="space-y-4">
                <Button 
                    onClick={handleLogin} 
                    disabled={loading} 
                    className="w-full text-lg animate-float" // Add subtle float to button too
                    size="lg"
                >
                    <LogIn className="w-5 h-5" />
                    {loading ? 'Connecting...' : 'Continue with Google'}
                </Button>
                
                <p className="text-xs text-slate-400 mt-4">
                    By continuing, you agree to our Terms enabling us to feed virtual cats.
                </p>
            </div>
        </div>
      </div>
    </div>
  )
}
