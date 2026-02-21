import { createClient } from '@supabase/supabase-js'

let supabaseInstance = null

export const getSupabase = () => {
  if (supabaseInstance) return supabaseInstance

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

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables')
    return null
  }

  try {
    supabaseInstance = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
    return supabaseInstance
  } catch (error) {
    console.error('Failed to create Supabase client:', error)
    return null
  }
}

// Legacy export for compatibility
export const supabase = getSupabase()
