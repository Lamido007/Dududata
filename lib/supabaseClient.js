import { createClient } from '@supabase/supabase-js'

// Your Supabase credentials
const SUPABASE_URL = 'https://kamqzwgzftpxchwmokxp.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthbXF6d2d6ZnRweGNod21va3hwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5NzA5NzYsImV4cCI6MjA4MDU0Njk3Nn0.W8_rKf3ZjgH09-cuMXiTQLr_hxoa2-T_TaQglrD0I3M'

let supabaseInstance = null

export const getSupabase = () => {
  // Return existing instance if available
  if (supabaseInstance) return supabaseInstance

  // Check if we're on the server side
  if (typeof window === 'undefined') {
    // During SSR/build, return a mock client to prevent errors
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        signUp: async () => ({ data: null, error: null }),
        signInWithPassword: async () => ({ data: null, error: null }),
        signOut: async () => ({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: async () => ({ data: null, error: null }),
            limit: async () => ({ data: [], error: null })
          }),
          order: () => ({
            limit: async () => ({ data: [], error: null })
          }),
          limit: async () => ({ data: [], error: null })
        }),
        insert: async () => ({ data: null, error: null }),
        update: async () => ({ data: null, error: null }),
        delete: async () => ({ data: null, error: null })
      }),
      rpc: async () => ({ data: null, error: null })
    }
  }

  // Try to use environment variables first, fallback to hardcoded
  let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_URL
  let supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY

  // Validate URL format
  if (!supabaseUrl.startsWith('https://')) {
    console.error('❌ Invalid Supabase URL format')
    return null
  }

  try {
    // Create the Supabase client
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })

    console.log('✅ Supabase client initialized successfully')
    return supabaseInstance
  } catch (error) {
    console.error('❌ Failed to create Supabase client:', error)
    return null
  }
        }
