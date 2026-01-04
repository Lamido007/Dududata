import { createClient } from '@supabase/supabase-js'

let supabaseInstance = null

export const getSupabase = () => {
  // Return existing instance if available
  if (supabaseInstance) return supabaseInstance

  // During SSR/build, return a mock client to prevent errors
  if (typeof window === 'undefined') {
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
          })
        }),
        insert: async () => ({ data: null, error: null }),
        update: async () => ({ data: null, error: null })
      })
    }
  }

  // Create real client on browser
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables')
    return null
  }

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
  return supabaseInstance
}
