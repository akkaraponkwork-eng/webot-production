import React, { createContext, useContext, useState, useEffect } from 'react'
import { useUser } from './UserContext'
import { supabase } from '../lib/supabase'
import { usePet } from './PetContext'

const DataContext = createContext({})

export const useData = () => useContext(DataContext)

export const DataProvider = ({ children }) => {
  const { user } = useUser()
  const { earnPoints } = usePet()
  const [records, setRecords] = useState([])
  const [stats, setStats] = useState({ totalIncome: 0, totalHours: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      try {
        // Fetch actual OT records from Supabase
        const { data: otData, error } = await supabase
            .from('ot_records')
            .select('*')
            .eq('user_id', user.id)
            .order('date', { ascending: false })
            
        if (error) throw error
        
        if (otData) {
            setRecords(otData)
            calculateStats(otData)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  const calculateStats = (data) => {
    const totalIncome = data.reduce((acc, curr) => acc + (Number(curr.total_income) || 0), 0)
    const totalHours = data.reduce((acc, curr) => acc + (Number(curr.hours) || 0), 0)
    setStats({ totalIncome, totalHours })
  }

  const addRecord = async (date, hours, multiplier) => {
      if (!user) return

      // Calculation logic
      // Calculation logic
      let hoursPerDay = 8 // Default
      if (user.work_start_time && user.work_end_time) {
          const [startH, startM] = user.work_start_time.split(':').map(Number)
          const [endH, endM] = user.work_end_time.split(':').map(Number)
          
          const startDecimal = startH + (startM / 60)
          const endDecimal = endH + (endM / 60)
          
          // Calculate pure span WITH break deduction (Restored)
          const span = endDecimal - startDecimal
          hoursPerDay = span > 0 ? (span - 1) : 8
      }

      const hourlyRate = (user.base_salary || 15000) / (user.work_days_per_month || 30) / hoursPerDay
      const income = hourlyRate * hours * multiplier

      // Fix Timezone Issue:
      // We want the saved "date" to match the calendar date selected by the user.
      // Since we slice 'T' off the ISO string for display, we must ensure the ISO string date part matches the local selection.
      // We shift the date object by the timezone offset so that .toISOString() yields the correct local date.
      const offsetDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
      
      const { data, error } = await supabase
        .from('ot_records')
        .insert({
            user_id: user.id,
            date: offsetDate.toISOString(), 
            hours,
            rate_multiplier: multiplier,
            total_income: income
        })
        .select()
        .single()

      if (data) {
          const newRecords = [data, ...records]
          setRecords(newRecords)
          calculateStats(newRecords)
          
          // Add Points (100 pts per hour)
          earnPoints(Math.floor(hours * 100))
      }
  }

  const deleteRecord = async (id) => {
      if (!user) return
      
      const { error } = await supabase
        .from('ot_records')
        .delete()
        .eq('id', id)
      
      if (!error) {
          const newRecords = records.filter(r => r.id !== id)
          setRecords(newRecords)
          calculateStats(newRecords)
      } else {
        console.error("Error deleting record:", error)
      }
  }

  return (
    <DataContext.Provider value={{ records, stats, addRecord, deleteRecord, loading }}>
        {children}
    </DataContext.Provider>
  )
}
