import React, { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useUser } from '../../contexts/UserContext'
import BottomNav from './BottomNav'

export default function ProtectedLayout() {
  const { user, loading } = useUser()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login')
    }
  }, [user, loading, navigate])

  if (loading || !user) {
      // Little loading spinner or skeleton could go here
      return <div className="h-screen w-full flex items-center justify-center text-orange-500">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-orange-50 min-h-[100dvh] flex flex-col">
      <div className="flex-1 overflow-hidden relative">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  )
}
