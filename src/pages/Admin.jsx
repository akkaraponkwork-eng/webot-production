import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { apiCall } from '../lib/api'
import TopBar from '../components/layout/TopBar'
import { ShieldAlert, LogOut, KeyRound, MessageCircle, Settings, Timer } from 'lucide-react'
import AdminChatView from '../components/chat/AdminChatView'

export default function Admin() {
  const queryClient = useQueryClient()
  const [activeChatUser, setActiveChatUser] = useState(null)
  const [systemPrompt, setSystemPrompt] = useState('You are Meow Chat. A helpful cat assistant.')
  const [countdownDate, setCountdownDate] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [botEnabled, setBotEnabled] = useState(true)
  
  // Schedule Form State
  const [newScheduleTime, setNewScheduleTime] = useState('08:00')
  const [newScheduleMessage, setNewScheduleMessage] = useState('')
  const [editingScheduleId, setEditingScheduleId] = useState(null)
  
  // Fetch Prompt query
  useQuery({
    queryKey: ['adminPrompt'],
    queryFn: async () => {
      const res = await apiCall('adminGetPrompt').catch(() => ({ prompt: 'You are Meow Chat. A helpful cat assistant.' }))
      if (res?.prompt) setSystemPrompt(res.prompt)
      return res
    }
  })

  // Fetch API Key
  useQuery({
    queryKey: ['adminApiKey'],
    queryFn: async () => {
      const res = await apiCall('adminGetApiKey').catch(() => ({ key: '' }))
      if (res?.key) setApiKey(res.key)
      return res
    }
  })
  
  // Fetch Bot Status
  useQuery({
    queryKey: ['adminBotStatus'],
    queryFn: async () => {
      const res = await apiCall('adminGetBotStatus').catch(() => ({ botEnabled: true }))
      if (res.hasOwnProperty('botEnabled')) setBotEnabled(res.botEnabled)
      return res
    }
  })

  // Fetch Schedules
  const { data: schedules } = useQuery({
    queryKey: ['adminSchedules'],
    queryFn: async () => {
      const res = await apiCall('adminGetSchedules').catch(() => ({ schedules: [] }))
      return res.schedules || []
    }
  })

  const updatePromptMutation = useMutation({
      mutationFn: (prompt) => apiCall('adminSetPrompt', { prompt }),
      onSuccess: () => toast.success('Prompt updated!'),
      onError: (err) => toast.error(err.message)
  })

  const updateApiKeyMutation = useMutation({
      mutationFn: (key) => apiCall('adminSetApiKey', { apiKey: key }),
      onSuccess: () => toast.success('API Key updated!'),
      onError: (err) => toast.error(err.message)
  })

  const updateBotStatusMutation = useMutation({
      mutationFn: (enabled) => apiCall('adminSetBotStatus', { enabled }),
      onSuccess: () => {
          toast.success('Bot status updated!');
          queryClient.invalidateQueries(['adminBotStatus']);
      },
      onError: (err, variables) => {
          toast.error(err.message);
          setBotEnabled(!variables); // Rollback to previous state
      }
  })

  const addScheduleMutation = useMutation({
      mutationFn: (payload) => apiCall('adminAddSchedule', payload),
      onSuccess: () => {
          setNewScheduleMessage('')
          queryClient.invalidateQueries(['adminSchedules'])
      },
      onError: (err) => toast.error(err.message)
  })

  const editScheduleMutation = useMutation({
      mutationFn: (payload) => apiCall('adminEditSchedule', payload),
      onSuccess: () => {
          setEditingScheduleId(null)
          setNewScheduleTime('08:00')
          setNewScheduleMessage('')
          queryClient.invalidateQueries(['adminSchedules'])
      },
      onError: (err) => toast.error(err.message)
  })

  const deleteScheduleMutation = useMutation({
      mutationFn: (id) => apiCall('adminDeleteSchedule', { id }),
      onSuccess: () => {
          queryClient.invalidateQueries(['adminSchedules'])
      },
      onError: (err) => toast.error(err.message)
  })

  // Start Edit Mode
  const handleEditSchedule = (sch) => {
      setEditingScheduleId(sch.id)
      setNewScheduleTime(sch.time)
      setNewScheduleMessage(sch.message)
      // scroll up
      window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Fetch Countdown query
  useQuery({
    queryKey: ['adminCountdownDate'],
    queryFn: async () => {
      const res = await apiCall('adminGetCountdownDate').catch(() => ({ targetDate: '' }))
      if (res?.targetDate) {
          try {
              // Convert any date string "2027-05-03 8:00" to "YYYY-MM-DDThh:mm"
              const d = new Date(res.targetDate);
              if (!isNaN(d.getTime())) {
                  const tzOffset = d.getTimezoneOffset() * 60000;
                  const localISOTime = (new Date(d.getTime() - tzOffset)).toISOString().slice(0, 16);
                  setCountdownDate(localISOTime);
              } else {
                  setCountdownDate(res.targetDate);
              }
          } catch(e) {
              setCountdownDate(res.targetDate);
          }
      }
      return res
    }
  })

  const updateCountdownMutation = useMutation({
      mutationFn: (dateStr) => apiCall('adminSetCountdownDate', { targetDate: dateStr }),
      onSuccess: () => toast.success('Countdown updated!'),
      onError: (err) => toast.error(err.message)
  })

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
          toast.success('User has been forcibly logged out.')
          queryClient.invalidateQueries(['adminUsers'])
      },
      onError: (err) => toast.error(err.message)
  })

  // Change Password Mutation
  const changePasswordMutation = useMutation({
      mutationFn: ({ email, newPassword }) => apiCall('adminUpdateUser', { email, newPassword }),
      onSuccess: () => toast.success('Password changed!'),
      onError: (err) => toast.error(err.message)
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
          toast.error('Password too short (min 4 chars)')
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
                <p className="text-slate-500 text-sm">Manage users, security, and bots</p>
            </div>
        </div>

        {/* Schedule Settings */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-orange-100 mb-6">
            <div className="flex items-center gap-2 mb-3 text-orange-600">
                <Timer size={20} />
                <h2 className="font-bold text-lg text-slate-800">Automated Broadcast Messages</h2>
            </div>
            <p className="text-sm text-slate-500 mb-4">Set specific times for the bot to automatically send messages to all users.</p>
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4 flex flex-col md:flex-row gap-3 items-end">
                <div className="w-full md:w-32">
                    <label className="block text-xs font-bold text-slate-500 mb-1">Time (HH:mm)</label>
                    <input 
                        type="time" 
                        value={newScheduleTime}
                        onChange={(e) => setNewScheduleTime(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-orange-500"
                    />
                </div>
                <div className="flex-1 w-full">
                    <label className="block text-xs font-bold text-slate-500 mb-1">Message Content</label>
                    <input 
                        type="text" 
                        value={newScheduleMessage}
                        onChange={(e) => setNewScheduleMessage(e.target.value)}
                        placeholder="e.g. Good morning! Don't forget your tasks."
                        className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-orange-500"
                    />
                </div>
                <button 
                  onClick={() => {
                      if (newScheduleTime && newScheduleMessage.trim()) {
                          if (editingScheduleId) {
                              editScheduleMutation.mutate({ id: editingScheduleId, newTime: newScheduleTime, newMessage: newScheduleMessage.trim() })
                          } else {
                              addScheduleMutation.mutate({ time: newScheduleTime, message: newScheduleMessage.trim() })
                          }
                      }
                  }}
                  disabled={addScheduleMutation.isPending || editScheduleMutation.isPending || !newScheduleTime || !newScheduleMessage.trim()}
                  className="w-full md:w-auto bg-orange-500 hover:bg-orange-600 px-6 py-2.5 rounded-lg text-white text-sm font-bold shadow-sm disabled:opacity-50 whitespace-nowrap transition-colors"
                >
                  {editingScheduleId 
                    ? (editScheduleMutation.isPending ? 'Saving...' : 'Update Schedule') 
                    : (addScheduleMutation.isPending ? 'Adding...' : 'Add Schedule')}
                </button>
                {editingScheduleId && (
                    <button 
                        onClick={() => {
                            setEditingScheduleId(null)
                            setNewScheduleMessage('')
                        }}
                        className="w-full md:w-auto bg-slate-200 hover:bg-slate-300 px-4 py-2.5 rounded-lg text-slate-700 text-sm font-bold shadow-sm transition-colors whitespace-nowrap"
                    >
                        Cancel
                    </button>
                )}
            </div>

            {schedules && schedules.length > 0 && (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {schedules.map((sch) => (
                        <div key={sch.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg shadow-sm gap-3 ${editingScheduleId === sch.id ? 'bg-orange-50 border-orange-200' : 'bg-white border-slate-100'}`}>
                            <div className="flex items-center gap-3">
                                <span className={`px-2 py-1 rounded text-xs font-black tracking-wider ${editingScheduleId === sch.id ? 'bg-orange-200 text-orange-700' : 'bg-orange-100 text-orange-600'}`}>
                                    {sch.time}
                                </span>
                                <span className="text-slate-700 text-sm">{sch.message}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => handleEditSchedule(sch)}
                                    className="text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-200 px-3 py-1.5 rounded-md text-xs font-bold transition-colors"
                                >
                                    Edit
                                </button>
                                <button 
                                    onClick={() => {
                                        if (confirm('Delete this scheduled message?')) {
                                            deleteScheduleMutation.mutate(sch.id)
                                        }
                                    }}
                                    disabled={deleteScheduleMutation.isPending}
                                    className="text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md text-xs font-bold transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* Bot Status Toggle */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-orange-100">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={botEnabled ? "w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center" : "w-10 h-10 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center"}>
                        <MessageCircle size={24} />
                    </div>
                    <div>
                        <h2 className="font-bold text-slate-800">Bot Auto-Reply</h2>
                        <p className="text-xs text-slate-500">{botEnabled ? 'Bot is currently replying to users' : 'Manual mode: Bot is paused'}</p>
                    </div>
                </div>
                <button 
                  onClick={() => {
                    const newStatus = !botEnabled;
                    setBotEnabled(newStatus);
                    updateBotStatusMutation.mutate(newStatus);
                  }}
                  disabled={updateBotStatusMutation.isPending}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${botEnabled ? 'bg-orange-500' : 'bg-slate-300'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${botEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
            </div>
        </div>

        {/* Prompt Settings */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-orange-100 mb-6">
            <div className="flex items-center gap-2 mb-3 text-orange-600">
                <Settings size={20} />
                <h2 className="font-bold text-lg text-slate-800">Meow Chat AI Prompt</h2>
            </div>
            <textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm min-h-[100px] mb-3 focus:outline-none focus:border-orange-500"
                placeholder="Enter instructions for the AI bot..."
            />
            <button 
                onClick={() => updatePromptMutation.mutate(systemPrompt)}
                disabled={updatePromptMutation.isPending}
                className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-xl text-white text-sm font-bold shadow-sm disabled:opacity-50"
            >
                {updatePromptMutation.isPending ? 'Saving...' : 'Save AI Configuration'}
            </button>
        </div>

        {/* API Key Settings */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 mb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <KeyRound size={120} />
            </div>
            <div className="flex items-center gap-2 mb-3 text-slate-700 relative z-10">
                <KeyRound size={20} />
                <h2 className="font-bold text-lg">Gemini API Key</h2>
            </div>
            <p className="text-sm text-slate-500 mb-3 relative z-10">Set your Google Gemini API Key. If left empty, it will use the hardcoded default in Apps Script.</p>
            <div className="flex flex-col sm:flex-row gap-3 relative z-10">
              <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-slate-400 flex-1 font-mono tracking-widest"
              />
              <button 
                  onClick={() => updateApiKeyMutation.mutate(apiKey)}
                  disabled={updateApiKeyMutation.isPending}
                  className="bg-slate-800 hover:bg-slate-900 px-6 py-3 rounded-xl text-white text-sm font-bold shadow-sm disabled:opacity-50 whitespace-nowrap"
              >
                  {updateApiKeyMutation.isPending ? 'Saving...' : 'Save API Key'}
              </button>
            </div>
        </div>

        {/* Countdown Settings */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-orange-100 mb-6">
            <div className="flex items-center gap-2 mb-3 text-orange-600">
                <Timer size={20} />
                <h2 className="font-bold text-lg text-slate-800">Global Countdown Timer Settings</h2>
            </div>
            <p className="text-sm text-slate-500 mb-3">Set a target date for the chat countdown (counts days, hours, mins, secs).</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                  type="datetime-local"
                  value={countdownDate}
                  onChange={(e) => setCountdownDate(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-orange-500 flex-1"
              />
              <button 
                  onClick={() => updateCountdownMutation.mutate(countdownDate)}
                  disabled={updateCountdownMutation.isPending}
                  className="bg-orange-500 hover:bg-orange-600 px-6 py-3 rounded-xl text-white text-sm font-bold shadow-sm disabled:opacity-50 whitespace-nowrap"
              >
                  {updateCountdownMutation.isPending ? 'Saving...' : 'Save Timer'}
              </button>
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
                                onClick={() => setActiveChatUser({ email: u.email, name: u.full_name })}
                                className="flex items-center gap-1.5 px-3 py-2 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-xl text-sm font-bold transition-colors"
                            >
                                <MessageCircle size={16} /> View Chat
                            </button>
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
      
      {activeChatUser && (
        <AdminChatView 
          userEmail={activeChatUser.email} 
          userName={activeChatUser.name} 
          onClose={() => setActiveChatUser(null)} 
        />
      )}
    </div>
  )
}
