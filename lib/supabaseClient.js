import { createClient } from '@supabase/supabase-js'

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
            single: async () => ({ data: null, error: null })
          }),
          order: () => ({
            limit: async () => ({ data: [], error: null })
          })
        }),
        insert: async () => ({ data: null, error: null }),
        update: async () => ({ data: null, error: null }),
        delete: async () => ({ data: null, error: null })
      }),
      rpc: async () => ({ data: null, error: null })
    }
  }

  // Get environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Check if environment variables are set
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Supabase environment variables are missing!')
    console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing')
    console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Set' : '❌ Missing')
    return null
  }

  // Validate URL format
  if (!supabaseUrl.startsWith('https://')) {
    console.error('❌ Invalid Supabase URL format. Should start with https://')
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
