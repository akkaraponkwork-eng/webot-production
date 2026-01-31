import React, { createContext, useContext, useState, useEffect } from 'react'
import { useUser } from './UserContext'
import { supabase } from '../lib/supabase'
import { GAME_CONSTANTS } from '../lib/constants'

const PetContext = createContext({})

export const usePet = () => useContext(PetContext)

export const PetProvider = ({ children }) => {
  const { user } = useUser()
  const [petState, setPetState] = useState({
    level: 1,
    exp: 0,
    points: 0,
    totalExpToLevel: 100, // Initial requirement
    status: 'happy',
  })
  
  // Load pet data
  useEffect(() => {
    if (!user) return
    
    const loadPetData = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('pet_level, pet_exp, meow_points')
        .eq('id', user.id)
        .single()
        
      if (data) {
        // Recalculate totalExpToLevel based on current level
        // Formula: 100 * (1.5 ^ (level - 1))
        let reqExp = 100
        for (let i = 1; i < (data.pet_level || 1); i++) {
            reqExp = Math.round(reqExp * 1.5)
        }

        setPetState({
            level: data.pet_level || 1,
            exp: data.pet_exp || 0,
            points: data.meow_points || 0,
            totalExpToLevel: reqExp,
            status: 'happy'
        })
      }
    }
    
    loadPetData()
  }, [user])

  const buyItem = async (cost, expGained) => {
      if (petState.points < cost) return false

      // Deduct Points
      const newPoints = petState.points - cost
      
      // Add EXP & Level Up Logic
      let newExp = petState.exp + expGained
      let newLevel = petState.level
      let newExpToLevel = petState.totalExpToLevel

      while (newExp >= newExpToLevel) {
          newExp -= newExpToLevel
          newLevel += 1
          newExpToLevel = Math.round(newExpToLevel * 1.5)
      }

      setPetState(prev => ({ 
          ...prev, 
          points: newPoints, 
          exp: newExp, 
          level: newLevel,
          totalExpToLevel: newExpToLevel 
      }))

      // Sync DB
      await supabase.from('profiles').update({
          meow_points: newPoints,
          pet_exp: newExp,
          pet_level: newLevel
      }).eq('id', user.id)

      return true
  }

  const addExp = async (amount) => {
    // Legacy support or direct exp gain
    if (!user) return
    
    // Use same logic logic as buyItem but without cost
    // ... we can refactor later but for now let's just reuse logic manually
    let newExp = petState.exp + amount
    let newLevel = petState.level
    let newExpToLevel = petState.totalExpToLevel

    while (newExp >= newExpToLevel) {
        newExp -= newExpToLevel
        newLevel += 1
        newExpToLevel = Math.round(newExpToLevel * 1.5)
    }
    
    setPetState(prev => ({ ...prev, exp: newExp, level: newLevel, totalExpToLevel: newExpToLevel }))

    await supabase.from('profiles').update({
        pet_exp: newExp,
        pet_level: newLevel
    }).eq('id', user.id)
  }

  const earnPoints = async (amount) => {
      const newPoints = petState.points + amount
      setPetState(prev => ({ ...prev, points: newPoints }))
       await supabase.from('profiles').update({
        meow_points: newPoints
    }).eq('id', user.id)
  }

  return (
    <PetContext.Provider value={{ ...petState, addExp, buyItem, earnPoints }}>
      {children}
    </PetContext.Provider>
  )
}
