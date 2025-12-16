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
      if (user) {
        setBalance(5000) // Mock balance — real one later
      }
    }
    checkUser()
  }, [])

  if (!user) {
    return <Auth onSuccess={() => window.location.reload()} />
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-4xl font-bold text-center mb-8 text-primary">My Dashboard</h1>
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
        <p className="text-xl mb-4">Welcome back!</p>
        <p className="text-lg text-gray-600 mb-8">Email: {user.email}</p>
        <div className="bg-accent text-white p-6 rounded-xl text-3xl font-bold mb-8">
          Wallet Balance: ₦{balance}
        </div>
        <button className="w-full bg-primary text-white py-4 rounded-lg text-xl font-bold">
          Fund Wallet
        </button>
      </div>
    </div>
  )
      }
