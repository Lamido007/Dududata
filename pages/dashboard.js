import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { getSupabase } from '../lib/supabaseClient'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState([])
  const [notifications, setNotifications] = useState([])
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

      // Fetch profile with new fields
      const { data: profileData, error: balanceError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (!balanceError && profileData) {
        setProfile(profileData)
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

      // Fetch unread notifications
      const { data: notifData } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(3)

      if (notifData) {
        setNotifications(notifData)
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

  const getLevelBadge = (level) => {
    switch(level) {
      case 'platinum': return '💎'
      case 'gold': return '🥇'
      case 'silver': return '🥈'
      default: return '⭐'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              DuduData Dashboard
              {profile?.user_level && (
                <span className="text-2xl">{getLevelBadge(profile.user_level)}</span>
              )}
            </h1>
            <p className="text-white/70 mt-1">
              Welcome back, {profile?.full_name || user.email?.split('@')[0]}!
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => router.push('/support')}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              💬 Support
            </button>
            <button 
              onClick={() => router.push('/notifications')}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-semibold transition-colors relative"
            >
              🔔 Notifications
              {notifications.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>
            <button 
              onClick={() => router.push('/profile')}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              👤 Profile
            </button>
            <button 
              onClick={handleSignOut}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Notification Banner */}
          {notifications.length > 0 && (
            <div className="bg-blue-500/20 border border-blue-500/50 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🔔</span>
                  <div>
                    <div className="font-bold">{notifications[0].title}</div>
                    <div className="text-sm text-white/80">{notifications[0].message}</div>
                  </div>
                </div>
                <button 
                  onClick={() => router.push('/notifications')}
                  className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                >
                  View All
                </button>
              </div>
            </div>
          )}

          {/* Wallet Balance Card */}
          <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl p-8 shadow-2xl mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white/80 text-lg mb-2">Wallet Balance</p>
                <p className="text-5xl font-bold text-white">
                  ₦{balance.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <div className="text-white/80 text-sm mb-1">Referral Earnings</div>
                <div className="text-2xl font-bold text-white">
                  ₦{profile?.referral_earnings?.toLocaleString() || 0}
                </div>
              </div>
            </div>
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
              className="bg-white/10 backdrop-blur-lg hover:bg-white/20 rounded-xl p-8 border border-white/20 transition-all group text-left"
            >
              <div className="text-5xl mb-3">📱</div>
              <div className="text-xl font-bold mb-2">Buy Data</div>
              <div className="text-white/70 text-sm">Up to 18% discount</div>
            </button>
            
            <button 
              onClick={() => router.push('/airtime')}
              className="bg-white/10 backdrop-blur-lg hover:bg-white/20 rounded-xl p-8 border border-white/20 transition-all group text-left"
            >
              <div className="text-5xl mb-3">📞</div>
              <div className="text-xl font-bold mb-2">Buy Airtime</div>
              <div className="text-white/70 text-sm">All networks available</div>
            </button>
            
            <button 
              onClick={() => router.push('/bills')}
              className="bg-white/10 backdrop-blur-lg hover:bg-white/20 rounded-xl p-8 border border-white/20 transition-all group text-left"
            >
              <div className="text-5xl mb-3">💡</div>
              <div className="text-xl font-bold mb-2">Pay Bills</div>
              <div className="text-white/70 text-sm">Electricity, Cable TV</div>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="text-white/70 text-sm mb-1">Member Level</div>
              <div className="text-2xl font-bold">
                {getLevelBadge(profile?.user_level)} {profile?.user_level?.toUpperCase() || 'REGULAR'}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="text-white/70 text-sm mb-1">Total Spent</div>
              <div className="text-2xl font-bold">₦{profile?.total_spent?.toLocaleString() || 0}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="text-white/70 text-sm mb-1">Transactions</div>
              <div className="text-2xl font-bold">{transactions.length}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="text-white/70 text-sm mb-1">Referral Code</div>
              <div className="text-xl font-bold">{profile?.referral_code || 'N/A'}</div>
            </div>
          </div>

          {/* Recent Transactions */}
          {transactions.length > 0 && (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold">Recent Transactions</h3>
                <button 
                  onClick={() => router.push('/transactions')}
                  className="text-white/70 hover:text-white text-sm"
                >
                  View All →
                </button>
              </div>
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div 
                    key={transaction.id} 
                    className="bg-white/5 rounded-lg p-4 flex justify-between items-center hover:bg-white/10 transition-colors"
                  >
                    <div>
                      <div className="font-semibold">
                        {transaction.type === 'data' && '📱'} 
                        {transaction.type === 'airtime' && '📞'}
                        {transaction.type === 'bills' && '💡'}
                        {transaction.type === 'funding' && '💰'}
                        {' '}
                        {transaction.type.toUpperCase()} {transaction.network && `- ${transaction.network}`}
                      </div>
                      <div className="text-sm text-white/70">
                        {transaction.phone_number || 'N/A'} {transaction.bundle_size && `• ${transaction.bundle_size}`}
                      </div>
                      <div className="text-xs text-white/50">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">
                        {transaction.type === 'funding' ? '+' : '-'}₦{parseFloat(transaction.amount).toLocaleString()}
                      </div>
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
            </div>
          )}
        </div>
      </div>
    </div>
  )
        }
