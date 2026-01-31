import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.warn("Supabase URL or Anon Key is missing! Check .env file.")
}

// MOCK CLIENT FOR OFFLINE / INSTANT LOADING
const createMockClient = () => {
    console.log("⚠️ USING MOCK SUPABASE CLIENT (Offline Mode)")
    
    // Mock Data
    const mockUser = { id: 'mock-user-1', email: 'meow@owner.com', full_name: 'Meow Owner', pet_level: 5, pet_exp: 250 }
    
    // Helper to simulate network delay (fast)
    const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms))

    return {
        auth: {
            getSession: async () => {
                await delay()
                return { data: { session: { user: mockUser } }, error: null }
            },
            onAuthStateChange: (callback) => {
                callback('SIGNED_IN', { user: mockUser })
                return { data: { subscription: { unsubscribe: () => {} } } }
            },
            signInWithOAuth: async () => {
                await delay(500)
                window.location.reload() // Simulate redirect
                return { error: null }
            },
            signOut: async () => {
                window.location.reload()
                return { error: null }
            }
        },
        from: (table) => {
            return {
                select: () => ({
                    eq: () => ({
                        single: async () => ({ data: table === 'profiles' ? mockUser : null, error: null }),
                        order: async () => ({ data: [], error: null })
                    }),
                    order: async () => ({ data: [], error: null }),
                    single: async () => ({ data: null, error: null })
                }),
                insert: () => ({ select: () => ({ single: async () => ({ data: {}, error: null }) }) }),
                update: () => ({ eq: async () => ({ error: null }) }),
                upsert: () => ({ select: () => ({ single: async () => ({ data: {}, error: null }) }) })
            }
        }
    }
}

// Logic: Use Real Client if keys exist AND are not placeholders, otherwise force Mock Client
const shouldUseMock = !supabaseUrl || 
                      !supabaseKey || 
                      supabaseUrl.includes('YOUR_SUPABASE_URL') ||
                      import.meta.env.VITE_USE_MOCK === 'true'

export const supabase = shouldUseMock ? createMockClient() : createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})
