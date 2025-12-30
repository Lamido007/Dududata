import { useEffect, useState } from 'react'
import { getSupabase } from '../lib/supabaseClient'
import Auth from '../components/Auth'

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

  if (!user) {
    return <Auth onSuccess={() => window.location.reload()} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-blue-900 text-white p-6">
      <h1 className="text-4xl font-bold text-center mb-8">My Dashboard</h1>
      <div className="max-w-md mx-auto bg-white text-primary rounded-xl shadow-2xl p-8">
        <p className="text-2xl font-bold text-center mb-4">Welcome back!</p>
        <p className="text-lg text-center mb-8 opacity-80">Email: {user.email}</p>
        <div className="bg-accent text-white p-8 rounded-xl text-center text-4xl font-bold mb-8">
          Wallet Balance: ₦{balance}
        </div>
        <button 
          onClick={() => getSupabase().auth.signOut()}
          className="w-full bg-red-600 text-white py-4 rounded-lg text-xl font-bold hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </div>
  )
}