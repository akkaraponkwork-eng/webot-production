import React, { useState } from 'react'
import { useUser } from '../contexts/UserContext'
import { Navigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import CatMinimal from '../components/2d/CatMinimal'
import { LogIn, UserPlus } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Login() {
  const { user, login, register } = useUser()
  const [isRegister, setIsRegister] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')

  if (user) {
      return <Navigate to="/" replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const formattedEmail = email.toLowerCase().trim()
      
      if (isRegister) {
        if (!fullName) throw new Error("Please enter your name")
        const res = await register(formattedEmail, password, fullName)
        if (!res.success) throw new Error(res.error)
        
        toast.success('Registration successful! You can now log in.')
        setIsRegister(false)
        setPassword('')
      } else {
        const res = await login(formattedEmail, password)
        if (!res.success) throw new Error(res.error)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-[100dvh] w-full flex flex-col md:flex-row bg-orange-50 relative z-0 overflow-y-auto md:overflow-hidden">
      {/* 2D Section */}
      <div className="flex-1 min-h-[40%] md:h-full relative bg-gradient-to-b from-orange-100 to-orange-50 flex items-center justify-center">
        <div className="absolute top-[calc(3.5rem+env(safe-area-inset-top))] left-4 z-10 glass-panel px-4 py-2 rounded-full hidden md:block">
            <span className="text-orange-600 font-bold">Meow OT Tracker 🐈</span>
        </div>
        <CatMinimal />
      </div>

      {/* Login Section */}
      <div className="flex-1 min-h-[60%] md:h-full flex flex-col items-center justify-center p-8 bg-white rounded-t-[2rem] md:rounded-l-[2rem] md:rounded-tr-none shadow-2xl z-10 -mt-8 md:mt-0 pb-12">
        <div className="max-w-md w-full space-y-6 text-center">
            <div>
                <h1 className="text-3xl font-black text-slate-800 mb-2">{isRegister ? 'Create Account' : 'Welcome Back!'}</h1>
                <p className="text-slate-500">Track your OT, earn points, and feed your cat.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
                {isRegister && (
                    <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-600">Full Name</label>
                        <input 
                           type="text" 
                           required 
                           value={fullName}
                           onChange={e => setFullName(e.target.value)}
                           className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-orange-500 transition-colors"
                           placeholder="Orange Cloud"
                        />
                    </div>
                )}
                
                <div className="space-y-1">
                    <label className="text-sm font-bold text-slate-600">Email</label>
                    <input 
                       type="email" 
                       required 
                       value={email}
                       onChange={e => setEmail(e.target.value)}
                       className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-orange-500 transition-colors"
                       placeholder="meow@example.com"
                    />
                </div>
                
                <div className="space-y-1">
                    <label className="text-sm font-bold text-slate-600">Password</label>
                    <input 
                       type="password" 
                       required 
                       value={password}
                       onChange={e => setPassword(e.target.value)}
                       className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-orange-500 transition-colors"
                       placeholder="••••••••"
                    />
                </div>

                <div className="pt-2">
                    <Button 
                        type="submit"
                        disabled={loading} 
                        className="w-full text-lg shadow-lg shadow-orange-500/30"
                        size="lg"
                    >
                        {isRegister ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
                        {loading ? 'Please wait...' : isRegister ? 'Register' : 'Log In'}
                    </Button>
                </div>
            </form>

            <button 
                type="button" 
                onClick={() => setIsRegister(!isRegister)}
                className="text-sm text-slate-500 hover:text-orange-600 font-bold transition-colors"
            >
                {isRegister ? 'Already have an account? Log in' : "Don't have an account? Register"}
            </button>
        </div>
      </div>
    </div>
  )
}
