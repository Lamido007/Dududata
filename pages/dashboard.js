import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { getSupabase } from '../lib/supabaseClient'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const supabase = getSupabase()
      
      if (!supabase) {
        router.push('/login')
        return
      }

      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        router.push('/login')
        return
      }

      setUser(user)

      // Fetch user's wallet balance 
      const { data, error: balanceError } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', user.id)
        .single()

      if (!balanceError && data) {
        setBalance(data.wallet_balance || 0)
      }
    } catch (err) {
      console.error('Error checking user:', err)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      const supabase = getSupabase()
      await supabase.auth.signOut()
      router.push('/login')
    } catch (err) {
      console.error('Error signing out:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null // Router will redirect to login
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">DuduData Dashboard</h1>
          <button 
            onClick={handleSignOut}
            className="bg-red-500 hover:bg-red-600 px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            Sign Out
          </button>
        </div>

        {/* Welcome Card */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-6 border border-white/20">
            <h2 className="text-2xl font-bold mb-4">Welcome back!</h2>
            <p className="text-lg opacity-90 mb-2">
              <span className="font-semibold">Email:</span> {user.email}
            </p>
          </div>

          {/* Wallet Balance Card */}
          <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl p-8 shadow-2xl mb-6">
            <p className="text-white/80 text-lg mb-2">Wallet Balance</p>
            <p className="text-5xl font-bold text-white">
              ₦{balance.toLocaleString()}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="bg-white/10 backdrop-blur-lg hover:bg-white/20 rounded-xl p-6 border border-white/20 transition-all">
              <div className="text-3xl mb-2">📱</div>
              <div className="font-semibold">Buy Data</div>
            </button>
            <button className="bg-white/10 backdrop-blur-lg hover:bg-white/20 rounded-xl p-6 border border-white/20 transition-all">
              <div className="text-3xl mb-2">📞</div>
              <div className="font-semibold">Buy Airtime</div>
            </button>
            <button className="bg-white/10 backdrop-blur-lg hover:bg-white/20 rounded-xl p-6 border border-white/20 transition-all">
              <div className="text-3xl mb-2">💰</div>
              <div className="font-semibold">Fund Wallet</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
        }
