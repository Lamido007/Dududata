import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { getSupabase } from '../lib/supabaseClient'

export default function TransactionsPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, data, airtime, bills, funding

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

      // Fetch all transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

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

  const filteredTransactions = filter === 'all' 
    ? transactions 
    : transactions.filter(t => t.type === filter)

  const getIcon = (type) => {
    switch(type) {
      case 'data': return '📱'
      case 'airtime': return '📞'
      case 'bills': return '💡'
      case 'funding': return '💰'
      default: return '📄'
    }
  }

  const totalSpent = transactions
    .filter(t => t.type !== 'funding')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Transaction History</h1>
          <button 
            onClick={() => router.push('/dashboard')}
            className="bg-white/20 hover:bg-white/30 px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            ← Back
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <p className="text-white/70 mb-2">Total Transactions</p>
            <p className="text-4xl font-bold">{transactions.length}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <p className="text-white/70 mb-2">Total Spent</p>
            <p className="text-4xl font-bold">₦{totalSpent.toLocaleString()}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <p className="text-white/70 mb-2">This Month</p>
            <p className="text-4xl font-bold">
              {transactions.filter(t => {
                const date = new Date(t.created_at)
                const now = new Date()
                return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
              }).length}
            </p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-6 border border-white/20">
          <div className="flex flex-wrap gap-3">
            {['all', 'data', 'airtime', 'bills', 'funding'].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  filter === type
                    ? 'bg-white text-blue-600 shadow-lg'
                    : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <h2 className="text-2xl font-bold mb-6">
            {filter === 'all' ? 'All Transactions' : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Transactions`}
          </h2>

          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-xl text-white/70">No transactions found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTransactions.map((transaction) => (
                <div 
                  key={transaction.id} 
                  className="bg-white/5 rounded-lg p-5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl">{getIcon(transaction.type)}</span>
                        <div>
                          <div className="font-bold text-lg">
                            {transaction.type.toUpperCase()}
                          </div>
                          <div className="text-sm text-white/70">
                            {transaction.network || 'N/A'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="ml-12 space-y-1 text-sm">
                        {transaction.phone_number && (
                          <div className="text-white/70">
                            <span className="font-semibold">Phone:</span> {transaction.phone_number}
                          </div>
                        )}
                        {transaction.bundle_size && (
                          <div className="text-white/70">
                            <span className="font-semibold">Bundle:</span> {transaction.bundle_size}
                          </div>
                        )}
                        {transaction.reference && (
                          <div className="text-white/70 text-xs">
                            <span className="font-semibold">Ref:</span> {transaction.reference}
                          </div>
                        )}
                        <div className="text-white/50 text-xs">
                          {new Date(transaction.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="text-right ml-4">
                      <div className="font-bold text-2xl mb-1">
                        {transaction.type === 'funding' ? '+' : '-'}₦{parseFloat(transaction.amount).toLocaleString()}
                      </div>
                      <div className={`text-sm px-3 py-1 rounded-full inline-block ${
                        transaction.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        transaction.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {transaction.status}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Export Button */}
        {transactions.length > 0 && (
          <div className="mt-6 text-center">
            <button 
              onClick={() => alert('Export feature coming soon!')}
              className="bg-white/20 hover:bg-white/30 px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              📥 Export Transactions
            </button>
          </div>
        )}
      </div>
    </div>
  )
             }
