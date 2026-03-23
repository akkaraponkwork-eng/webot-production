import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiCall } from '../lib/api'
import TopBar from '../components/layout/TopBar'
import { ShieldAlert, LogOut, KeyRound } from 'lucide-react'

export default function Admin() {
  const queryClient = useQueryClient()
  
  // Use React Query (Tanstack) for fetching standard admin users list
  const { data: users, isLoading } = useQuery({
      queryKey: ['adminUsers'],
      queryFn: async () => {
          const res = await apiCall('adminGetUsers')
          return res
      }
  })

  // Force Logout Mutation
  const forceLogoutMutation = useMutation({
      mutationFn: (email) => apiCall('adminForceLogout', { email }),
      onSuccess: () => {
          alert('User has been forcibly logged out. Token revoked.')
          queryClient.invalidateQueries(['adminUsers'])
      },
      onError: (err) => alert(err.message)
  })

  // Change Password Mutation
  const changePasswordMutation = useMutation({
      mutationFn: ({ email, newPassword }) => apiCall('adminUpdateUser', { email, newPassword }),
      onSuccess: () => {
          alert('Password successfully changed!')
      },
      onError: (err) => alert(err.message)
  })

  const handleForceLogout = (email) => {
      if (confirm(`Are you sure you want to force logout ${email}?`)) {
          forceLogoutMutation.mutate(email)
      }
  }

  const handleChangePassword = (email) => {
      const newPassword = prompt(`Enter new password for ${email}:`)
      if (newPassword && newPassword.length >= 4) {
          changePasswordMutation.mutate({ email, newPassword })
      } else if (newPassword) {
          alert("Password too short.")
      }
  }

  return (
    <div className="h-full flex flex-col bg-slate-50">
      <TopBar />
      
      <div className="flex-1 overflow-y-auto px-6 mt-4 space-y-6 pb-32">
        <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center">
                <ShieldAlert size={28} />
            </div>
            <div>
                <h1 className="text-2xl font-black text-slate-800">Admin Panel</h1>
                <p className="text-slate-500 text-sm">Manage users and security</p>
            </div>
        </div>

        {isLoading ? (
            <div className="text-center py-10 text-slate-500">Loading users...</div>
        ) : (
            <div className="grid gap-4">
                {users?.map(u => (
                    <div key={u.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-slate-800 text-lg">{u.full_name}</h3>
                                {u.role === 'admin' && (
                                    <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded text-xs font-bold uppercase">Admin</span>
                                )}
                            </div>
                            <p className="text-slate-500 text-sm">{u.email}</p>
                            <p className="text-slate-400 text-xs mt-1">
                                LV.{u.pet_level} • {u.meow_points} PTS 
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <button 
                                onClick={() => handleChangePassword(u.email)}
                                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-colors"
                            >
                                <KeyRound size={16} /> New Password
                            </button>
                            {u.role !== 'admin' && (
                                <button 
                                    onClick={() => handleForceLogout(u.email)}
                                    className="flex items-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-bold transition-colors"
                                >
                                    <LogOut size={16} /> Force Logout
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                
                {(!users || users.length === 0) && (
                    <div className="text-center text-slate-400 py-8 border-2 border-dashed border-slate-200 rounded-2xl">
                        No users found
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  )
}
