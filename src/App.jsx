import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { UserProvider } from './contexts/UserContext'
import { PetProvider } from './contexts/PetContext'
import { DataProvider } from './contexts/DataContext'
import ProtectedLayout from './components/layout/ProtectedLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import CalendarPage from './pages/CalendarPage'
import SummaryPage from './pages/SummaryPage'
import Settings from './pages/Settings'

function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <PetProvider>
            <DataProvider>
                <Routes>
                <Route path="/login" element={<Login />} />
                
                <Route element={<ProtectedLayout />}>
                    <Route path="/" element={<CalendarPage />} />
                    <Route path="/my-cat" element={<Dashboard />} />
                    <Route path="/summary" element={<SummaryPage />} />
                    <Route path="/settings" element={<Settings />} />
                </Route>
                
                <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </DataProvider>
        </PetProvider>
      </UserProvider>
    </BrowserRouter>
  )
}

export default App
