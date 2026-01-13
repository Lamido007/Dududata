cat > components/WalletDashboard.js << 'EOF'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function WalletDashboard() {
  const [account, setAccount] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [creatingAccount, setCreatingAccount] = useState(false)

  useEffect(() => {
    fetchAccountDetails()
  }, [])

  async function fetchAccountDetails() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      const response = await fetch(`/api/paystack/get-account?userId=${user.id}`)
      const data = await response.json()

      if (response.ok) {
        setAccount(data.account)
        setTransactions(data.transactions || [])
      }
    } catch (error) {
      console.error('Error fetching account:', error)
    } finally {
      setLoading(false)
    }
  }

  async function createVirtualAccount() {
    try {
      setCreatingAccount(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      const response = await fetch('/api/paystack/create-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      })

      const result = await response.json()
      
      if (response.ok) {
        alert('Virtual account created successfully!')
        fetchAccountDetails()
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      alert('Failed to create account. Please try again.')
      console.error('Error:', error)
    } finally {
      setCreatingAccount(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white mb-8 shadow-lg">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold mb-2">Your Wallet</h1>
            <p className="text-blue-100">Manage your virtual account and transactions</p>
          </div>
          {!account && (
            <button
              onClick={createVirtualAccount}
              disabled={creatingAccount}
              className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition disabled:opacity-50"
            >
              {creatingAccount ? 'Creating...' : 'Create Virtual Account'}
            </button>
          )}
        </div>
        
        {account && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/20 p-4 rounded-lg backdrop-blur-sm">
              <p className="text-sm opacity-90">Account Balance</p>
              <p className="text-3xl font-bold">₦{parseFloat(account.balance).toLocaleString()}</p>
            </div>
            <div className="bg-white/20 p-4 rounded-lg backdrop-blur-sm">
              <p className="text-sm opacity-90">Account Number</p>
              <p className="text-2xl font-mono font-bold">{account.account_number}</p>
            </div>
            <div className="bg-white/20 p-4 rounded-lg backdrop-blur-sm">
              <p className="text-sm opacity-90">Bank Name</p>
              <p className="text-xl font-semibold">{account.bank_name}</p>
            </div>
          </div>
        )}
      </div>

      {account && (
        <div className="bg-white rounded-xl p-6 shadow-md mb-8">
          <h2 className="text-xl font-bold mb-4">Virtual Account Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Account Name</p>
              <p className="text-lg font-semibold">{account.account_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Account Number</p>
              <p className="text-lg font-mono font-bold">{account.account_number}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Bank</p>
              <p className="text-lg">{account.bank_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${account.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {account.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl p-6 shadow-md">
        <h2 className="text-xl font-bold mb-4">Recent Transactions</h2>
        {transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td className="px-4 py-3 text-sm">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm capitalize">{tx.transaction_type}</td>
                    <td className="px-4 py-3 text-sm font-medium">
                      ₦{parseFloat(tx.amount).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        tx.status === 'success' 
                          ? 'bg-green-100 text-green-800' 
                          : tx.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No transactions yet</p>
        )}
      </div>
    </div>
  )
}
EOF
