let supabase = null

export const getSupabase = () => {
  if (supabase) return supabase

  if (typeof window === 'undefined') {
    // During build, return dummy client to avoid error
    return {
      auth: {
        getUser: async () => ({ data: { user: null } }),
        signUp: async () => ({ error: null }),
        signInWithPassword: async () => ({ error: null }),
        signOut: async () => ({})
      },
      from: () => ({
        select: () => ({
          single: async () => ({ data: { wallet_balance: 0 } })
        })
      })
    }
  }

  const { createClient } = require('@supabase/supabase-js')
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  supabase = createClient(url, key)
  return supabase
        }
