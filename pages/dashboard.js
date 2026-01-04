import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { getSupabase } from '../lib/supabaseClient'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState([])
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
      const { data: profileData, error: balanceError } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', user.id)
        .single()

      if (!balanceError && profileData) {
        setBalance(profileData.wallet_balance || 0)
      }

      // Fetch recent transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      if (!transactionsError && transactionsData) {
        setTransactions(transactionsData)
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
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-4xl font-bold">DuduData Dashboard</h1>
          <button 
            onClick={handleSignOut}
            className="bg-red-500 hover:bg-red-600 px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            Sign Out
          </button>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Welcome Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
            <h2 className="text-2xl font-bold mb-2">Welcome back!</h2>
            <p className="text-lg opacity-90">
              <span className="font-semibold">Email:</span> {user.email}
            </p>
          </div>

          {/* Wallet Balance Card */}
          <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl p-8 shadow-2xl mb-8">
            <p className="text-white/80 text-lg mb-2">Wallet Balance</p>
            <p className="text-5xl font-bold text-white mb-4">
              ₦{balance.toLocaleString()}
            </p>
            <button 
              onClick={() => router.push('/fund-wallet')}
              className="bg-white text-green-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              + Fund Wallet
            </button>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <button 
              onClick={() => router.push('/data')}
              className="bg-white/10 backdrop-blur-lg hover:bg-white/20 rounded-xl p-8 border border-white/20 transition-all group"
            >
              <div className="text-5xl mb-3">📱</div>
              <div className="text-xl font-bold mb-2">Buy Data</div>
              <div className="text-white/70 text-sm">MTN, Airtel, Glo, 9mobile</div>
            </button>
            
            <button 
              onClick={() => router.push('/airtime')}
              className="bg-white/10 backdrop-blur-lg hover:bg-white/20 rounded-xl p-8 border border-white/20 transition-all group"
            >
              <div className="text-5xl mb-3">📞</div>
              <div className="text-xl font-bold mb-2">Buy Airtime</div>
              <div className="text-white/70 text-sm">All networks available</div>
            </button>
            
            <button 
              onClick={() => router.push('/bills')}
              className="bg-white/10 backdrop-blur-lg hover:bg-white/20 rounded-xl p-8 border border-white/20 transition-all group"
            >
              <div className="text-5xl mb-3">💡</div>
              <div className="text-xl font-bold mb-2">Pay Bills</div>
              <div className="text-white/70 text-sm">Electricity, Cable TV, etc</div>
            </button>
          </div>

          {/* Recent Transactions */}
          {transactions.length > 0 && (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h3 className="text-2xl font-bold mb-4">Recent Transactions</h3>
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div 
                    key={transaction.id} 
                    className="bg-white/5 rounded-lg p-4 flex justify-between items-center"
                  >
                    <div>
                      <div className="font-semibold">
                        {transaction.type === 'data' && '📱'} 
                        {transaction.type === 'airtime' && '📞'}
                        {transaction.type === 'bills' && '💡'}
                        {transaction.type === 'funding' && '💰'}
                        {' '}
                        {transaction.type.toUpperCase()} - {transaction.network}
                      </div>
                      <div className="text-sm text-white/70">
                        {transaction.phone_number || 'N/A'} • {transaction.bundle_size || ''}
                      </div>
                      <div className="text-xs text-white/50">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">₦{transaction.amount}</div>
                      <div className={`text-sm ${
                        transaction.status === 'completed' ? 'text-green-400' :
                        transaction.status === 'failed' ? 'text-red-400' :
                        'text-yellow-400'
                      }`}>
                        {transaction.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => router.push('/transactions')}
                className="w-full mt-4 text-center text-white/70 hover:text-white transition-colors"
              >
                View All Transactions →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
          }
