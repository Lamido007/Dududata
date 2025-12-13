import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Auth from '../components/Auth'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [balance, setBalance] = useState(0)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        // Get wallet balance (we'll add real query later)
        setBalance(5000) // mock for now
      }
    }
    getUser()
  }, [])

  if (!user) return <Auth onLogin={() => window.location.reload()} />

  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold mb-6">Dashboard</h1>
      <p>Welcome, {user.email}!</p>
      <div className="bg-accent text-white p-6 rounded-xl my-6 text-3xl font-bold">
        Wallet Balance: ₦{balance}
      </div>
      <button className="w-full bg-primary text-white py-4 rounded-lg text-xl font-bold">
        Fund Wallet (Paystack coming soon)
      </button>
    </div>
  )
            }
