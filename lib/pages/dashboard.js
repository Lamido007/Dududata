import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Auth from '../components/Auth'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [balance, setBalance] = useState(0)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) setBalance(5000) // Mock for now
    }
    checkUser()
  }, [])

  if (!user) return <Auth onSuccess={() => window.location.reload()} />

  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold mb-4">Dashboard</h1>
      <p>Welcome, {user.email}!</p>
      <div className="bg-green-500 text-white p-6 rounded mt-4 text-2xl">
        Wallet: ₦{balance}
      </div>
    </div>
  )
    }
