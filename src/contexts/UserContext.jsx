import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const UserContext = createContext({})

export const useUser = () => useContext(UserContext)

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check active sessions and sets the user
    // Check active sessions and sets the user
    const getSession = async () => {
      try {
        // REMOVED TIMEOUT: Wait for Supabase to confirm session from LocalStorage/Network indefinitely.
        // This ensures we never auto-logout just because of a slow connection.
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
            console.warn("Session check skipped or failed:", error.message)
            setUser(null)
            return
        }
        
        if (session?.user) {
            // Fetch profile
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single()
            
            if (profileError) {
                if (profileError.code === 'PGRST116') {
                    // Profile not found? CREATE IT NOW (Fallback for missing trigger)
                    console.log("Profile missing. Creating fallback...")
                    const { data: newProfile, error: createError } = await supabase
                        .from('profiles')
                        .insert({
                            id: session.user.id,
                            email: session.user.email,
                            full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
                            meow_points: 0,
                            pet_exp: 0,
                            pet_level: 1
                        })
                        .select()
                        .single()
                    
                    if (createError) {
                         console.error("Failed to create profile fallback:", createError)
                    } else {
                         setUser({ ...session.user, ...newProfile })
                         return // Exit, we set the user
                    }
                } else {
                    console.error('Error fetching profile:', profileError)
                }
            }
            
            // If profile exists (or creation failed and we fallback to just session user), merge it
            setUser({ ...session.user, ...(profile || {}) })
        } else {
            setUser(null)
        }
      } catch (error) {
        console.error('Error getting session:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        if (session?.user) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single()
            
            if (!profile) {
                 // Fallback creation logic for Auth State Change
                 const { data: newProfile } = await supabase
                    .from('profiles')
                    .insert({
                        id: session.user.id,
                        email: session.user.email,
                        full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
                        meow_points: 0,
                        pet_exp: 0,
                        pet_level: 1
                    })
                    .select()
                    .single()
                 
                 setUser({ ...session.user, ...newProfile })
            } else {
                 setUser({ ...session.user, ...profile })
            }
        } else {
            setUser(null)
        }
      } catch (error) {
        console.error('Auth state change error:', error)
      } finally {
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const updateProfile = async (updates) => {
    try {
        const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', user.id)

        if (error) throw error
        
        // Update local state
        setUser(prev => ({ ...prev, ...updates }))
        return { success: true }
    } catch (error) {
        console.error('Error updating profile:', error)
        return { success: false, error }
    }
  }

  const value = {
    user,
    loading,
    signOut: () => supabase.auth.signOut(),
    updateProfile
  }

  return (
    <UserContext.Provider value={value}>
      {loading ? (
        <div className="h-screen w-full flex items-center justify-center bg-orange-50">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <h2 className="text-xl font-bold text-orange-600 animate-pulse">Loading Meow...</h2>
            </div>
        </div>
      ) : children}
    </UserContext.Provider>
  )
}
