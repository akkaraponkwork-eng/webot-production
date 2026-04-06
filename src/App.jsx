import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { UserProvider, useUser } from './contexts/UserContext'
import { PetProvider } from './contexts/PetContext'
import { DataProvider } from './contexts/DataContext'
import ProtectedLayout from './components/layout/ProtectedLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import CalendarPage from './pages/CalendarPage'
import SummaryPage from './pages/SummaryPage'
import Settings from './pages/Settings'
import Admin from './pages/Admin'
import ChatPage from './pages/ChatPage'
import LoadingOverlay from './components/ui/LoadingOverlay'

const queryClient = new QueryClient()

// Admin Route Guard
function AdminGuard() {
  const { user } = useUser()
  if (user?.role !== 'admin') return <Navigate to="/" replace />
  return <Admin />
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LoadingOverlay />
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
                    <Route path="/chat" element={<ChatPage />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/admin" element={<AdminGuard />} />
                </Route>
                
                <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </DataProvider>
        </PetProvider>
      </UserProvider>
      </BrowserRouter>
      <Toaster 
        position="top-center" 
        toastOptions={{
          duration: 2500,
          style: { borderRadius: '1rem', padding: '12px 20px', fontSize: '14px', fontWeight: 600 },
          success: { iconTheme: { primary: '#f97316', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
    </QueryClientProvider>
  )
}

export default App
