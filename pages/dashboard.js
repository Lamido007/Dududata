import { useEffect, useState } from 'react'
import Auth from '../components/Auth'
import { getSupabase } from '../lib/supabaseClient'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [balance, setBalance] = useState(0)

  useEffect(() => {
    const supabase = getSupabase()

    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        const { data } = await supabase.from('profiles').select('wallet_balance').eq('id', user.id).single()
        setBalance(data?.wallet_balance || 0)
      }
    }
    checkUser()
  }, [])

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
      </div>
    </div>
  )
        }
