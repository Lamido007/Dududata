import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function WalletDashboard() {
  const [account, setAccount] = useState(null)
  const [loading, setLoading] = useState(true)
  const [creatingAccount, setCreatingAccount] = useState(false)

  useEffect(() => {
    fetchAccountDetails()
  }, [])

  async function fetchAccountDetails() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setLoading(false)
        return
      }

      // Simple check - in real app, call your API
      setAccount(null) // No account yet
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  async function createVirtualAccount() {
    try {
      setCreatingAccount(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        alert('Please log in to create a virtual account')
        setCreatingAccount(false)
        return
      }

      // Call your API
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
        alert(`Error: ${result.error || 'Failed to create account'}`)
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
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Your Wallet</h2>
      
      {!account ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">💰</div>
          <h3 className="text-xl font-bold mb-2">No Virtual Account Yet</h3>
          <p className="text-gray-600 mb-6">
            Create a Paystack virtual account to receive payments and fund your wallet.
          </p>
          <button
            onClick={createVirtualAccount}
            disabled={creatingAccount}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {creatingAccount ? 'Creating Account...' : 'Create Virtual Account'}
          </button>
          <p className="text-sm text-gray-500 mt-4">
            You'll get a dedicated bank account number for deposits
          </p>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Balance</p>
              <p className="text-2xl font-bold">₦0.00</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Account Number</p>
              <p className="text-xl font-mono font-bold">Not created yet</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Bank</p>
              <p className="text-lg font-semibold">Paystack</p>
            </div>
          </div>
          
          <div className="border-t pt-6">
            <h3 className="text-lg font-bold mb-4">How to Use</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-600">
              <li>Create your virtual account</li>
              <li>Transfer money to your account number</li>
              <li>Use your balance for airtime, data, and bills</li>
              <li>Track all transactions here</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  )
}
