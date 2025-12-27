import { useEffect, useState } from 'react'
import Auth from '../components/Auth'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [balance, setBalance] = useState(0)
  const [supabase, setSupabase] = useState(null)

  useEffect(() => {
    const loadSupabase = async () => {
      const { createClient } = await import('@supabase/supabase-js')
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      const client = createClient(supabaseUrl, supabaseAnonKey)
      setSupabase(client)

      const { data: { user } } = await client.auth.getUser()
      setUser(user)
      if (user) {
        const { data } = await client.from('profiles').select('wallet_balance').eq('id', user.id).single()
        setBalance(data?.wallet_balance || 0)
      }
    }
    loadSupabase()
  }, [])

  if (!supabase) return <p className="text-center mt-20">Loading...</p>

  if (!user) return <Auth onSuccess={() => window.location.reload()} />

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-4xl font-bold text-center mb-8 text-primary">My Dashboard</h1>
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
        <p className="text-xl mb-4">Welcome back!</p>
        <p className="text-lg text-gray-600 mb-8">Email: {user.email}</p>
        <div className="bg-accent text-white p-6 rounded-xl text-3xl font-bold mb-8">
          Wallet Balance: ₦{balance}
        </div>
        <button onClick={() => supabase.auth.signOut()} className="w-full bg-red-500 text-white py-4 rounded-lg text-xl font-bold">
          Logout
        </button>
      </div>
    </div>
  )
        }
