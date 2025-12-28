let supabaseClient = null

export function getSupabaseClient() {
  if (supabaseClient) return supabaseClient

  if (typeof window === 'undefined') {
    // During build (server-side), return a dummy to avoid error
    return { auth: { getUser: () => ({ data: { user: null } }) } }
  }

  const { createClient } = require('@supabase/supabase-js')
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
  return supabaseClient
}
