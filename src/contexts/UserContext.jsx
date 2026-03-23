import React, { createContext, useContext, useEffect, useState } from 'react'
import { apiCall } from '../lib/api'

const UserContext = createContext({})

export const useUser = () => useContext(UserContext)

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkToken = async () => {
        const token = localStorage.getItem('auth_token')
        if (!token) {
            setLoading(false)
            return
        }
        
        // Fast UI load from cache
        const cachedUser = localStorage.getItem('cached_user_profile')
        if (cachedUser) {
            try {
                setUser(JSON.parse(cachedUser))
                setLoading(false) // Give UI early
            } catch(e) {}
        }
        
        try {
            // Verify and refresh cache in background
            const res = await apiCall('checkToken', {}, !cachedUser)
            if (res.valid && res.user) {
                setUser(res.user)
                localStorage.setItem('cached_user_profile', JSON.stringify(res.user))
            } else {
                setUser(null)
                localStorage.removeItem('auth_token')
                localStorage.removeItem('cached_user_profile')
            }
        } catch (err) {
            console.error('Token verification failed:', err)
        } finally {
            setLoading(false)
        }
    }
    
    checkToken()
  }, [])

  const login = async (email, password) => {
      try {
          const res = await apiCall('login', { email, password })
          if (res.success) {
              localStorage.setItem('auth_token', res.token)
              setUser(res.user)
              localStorage.setItem('cached_user_profile', JSON.stringify(res.user))
              return { success: true }
          }
          return { success: false, error: res.error }
      } catch (err) {
          return { success: false, error: err.message }
      }
  }

  const register = async (email, password, full_name) => {
      try {
          const res = await apiCall('register', { email, password, full_name })
          if (res.success) {
              // Do not auto-login per user request to redirect to login explicitly
              return { success: true }
          }
          return { success: false, error: res.error }
      } catch (err) {
          return { success: false, error: err.message }
      }
  }

  const signOut = async () => {
      try {
          await apiCall('logout')
      } catch (e) {
          // Ignored if network fails, we still clear local state
      }
      localStorage.removeItem('auth_token')
      setUser(null)
      window.location.reload()
  }

  const updateProfile = async (updates) => {
      try {
          const res = await apiCall('updateProfile', updates)
          if (res.success) {
              setUser(prev => ({ ...prev, ...updates }))
              return { success: true }
          }
          throw new Error('Update failed')
      } catch (error) {
          return { success: false, error: error.message }
      }
  }

  const value = {
    user,
    loading,
    login,
    register,
    signOut,
    updateProfile
  }

  return (
    <UserContext.Provider value={value}>
      {loading ? (
        <div className="h-[100dvh] w-full flex items-center justify-center bg-orange-50">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <h2 className="text-xl font-bold text-orange-600 animate-pulse">Loading Meow...</h2>
            </div>
        </div>
      ) : children}
    </UserContext.Provider>
  )
}
