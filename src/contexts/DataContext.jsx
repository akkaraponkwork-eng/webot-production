import React, { createContext, useContext, useState, useEffect } from 'react'
import { useUser } from './UserContext'
import { apiCall } from '../lib/api'
import { usePet } from './PetContext'
import toast from 'react-hot-toast'

const DataContext = createContext({})

export const useData = () => useContext(DataContext)

export const DataProvider = ({ children }) => {
  const { user } = useUser()
  const { earnPoints } = usePet()
  const [records, setRecords] = useState([])
  const [stats, setStats] = useState({ totalIncome: 0, totalHours: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
        setRecords([])
        setStats({ totalIncome: 0, totalHours: 0 })
        setLoading(false)
        return
    }

    const fetchData = async () => {
      let isCached = false;
      try {
          const cached = localStorage.getItem(`ot_records_${user.id}`)
          if (cached) {
              const parsed = JSON.parse(cached)
              setRecords(parsed)
              calculateStats(parsed)
              setLoading(false)
              isCached = true
          } else {
              setLoading(true)
          }
      } catch(e) {}

      try {
        const data = await apiCall('getOTRecords', {}, !isCached) // Don't show loading popup if we already have cache
        setRecords(data || [])
        calculateStats(data || [])
        localStorage.setItem(`ot_records_${user.id}`, JSON.stringify(data || []))
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

      let hoursPerDay = 8
      if (user.work_start_time && user.work_end_time) {
          const safeStart = user.work_start_time.includes('T') ? '08:00' : user.work_start_time.substring(0, 5)
          const safeEnd = user.work_end_time.includes('T') ? '17:00' : user.work_end_time.substring(0, 5)
          
          const [startH, startM] = safeStart.split(':').map(Number)
          const [endH, endM] = safeEnd.split(':').map(Number)
          const startDecimal = startH + (startM / 60)
          const endDecimal = endH + (endM / 60)
          const span = endDecimal - startDecimal
          hoursPerDay = span > 0 ? (span - 1) : 8
      }

      const hourlyRate = (user.base_salary || 15000) / (user.work_days_per_month || 30) / hoursPerDay
      const income = hourlyRate * hours * multiplier

      const offsetDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
      
      try {
         const newRecord = await apiCall('addOTRecord', {
            date: offsetDate.toISOString(), 
            hours,
            rate_multiplier: multiplier,
            total_income: Math.round(income)
         })
         
         const newRecords = [newRecord, ...records]
         setRecords(newRecords)
         calculateStats(newRecords)
         localStorage.setItem(`ot_records_${user.id}`, JSON.stringify(newRecords))
         
         if (earnPoints) earnPoints(Math.floor(hours * 100))
      } catch (e) {
          console.error("Failed to add OT", e)
          toast.error('Failed to add OT: ' + e.message)
      }
  }

  const deleteRecord = async (id) => {
      if (!user) return
      try {
         await apiCall('deleteOTRecord', { id })
         const newRecords = records.filter(r => r.id !== id)
         setRecords(newRecords)
         calculateStats(newRecords)
         localStorage.setItem(`ot_records_${user.id}`, JSON.stringify(newRecords))
      } catch (e) {
          console.error("Failed to delete OT", e)
          toast.error('Failed to delete: ' + e.message)
      }
  }

  const value = React.useMemo(() => ({
    records,
    stats,
    addRecord,
    deleteRecord,
    loading
  }), [records, stats, loading, addRecord, deleteRecord])

  return (
    <DataContext.Provider value={value}>
        {children}
    </DataContext.Provider>
  )
}
