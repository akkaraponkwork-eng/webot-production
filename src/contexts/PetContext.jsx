import React, { createContext, useContext, useState, useEffect } from 'react'
import { useUser } from './UserContext'

const PetContext = createContext({})

export const usePet = () => useContext(PetContext)

export const PetProvider = ({ children }) => {
  const { user, updateProfile } = useUser()
  const [petState, setPetState] = useState({
    level: 1,
    exp: 0,
    points: 0,
    totalExpToLevel: 100,
    status: 'happy',
  })
  
  useEffect(() => {
    if (!user) return
    
    let reqExp = 100
    for (let i = 1; i < (user.pet_level || 1); i++) {
        reqExp = Math.round(reqExp * 1.5)
    }

    setPetState({
        level: user.pet_level || 1,
        exp: user.pet_exp || 0,
        points: user.meow_points || 0,
        totalExpToLevel: reqExp,
        status: 'happy'
    })
  }, [user])

  const syncToDB = async (pts, xp, lvl) => {
       await updateProfile({
          meow_points: pts,
          pet_exp: xp,
          pet_level: lvl
       })
  }

  const buyItem = async (cost, expGained) => {
      if (petState.points < cost) return false

      const newPoints = petState.points - cost
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

      await syncToDB(newPoints, newExp, newLevel)
      return true
  }

  const addExp = async (amount) => {
    if (!user) return
    
    let newExp = petState.exp + amount
    let newLevel = petState.level
    let newExpToLevel = petState.totalExpToLevel

    while (newExp >= newExpToLevel) {
        newExp -= newExpToLevel
        newLevel += 1
        newExpToLevel = Math.round(newExpToLevel * 1.5)
    }
    
    setPetState(prev => ({ ...prev, exp: newExp, level: newLevel, totalExpToLevel: newExpToLevel }))
    await syncToDB(petState.points, newExp, newLevel)
  }

  const earnPoints = async (amount) => {
      if (!user) return
      const newPoints = petState.points + amount
      setPetState(prev => ({ ...prev, points: newPoints }))
      await syncToDB(newPoints, petState.exp, petState.level)
  }

  return (
    <PetContext.Provider value={{ ...petState, addExp, buyItem, earnPoints }}>
      {children}
    </PetContext.Provider>
  )
}
