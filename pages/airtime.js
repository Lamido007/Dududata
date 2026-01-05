import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { getSupabase } from '../lib/supabaseClient'

const AIRTIME_OPTIONS = [
  { amount: 50, discount: 2 },
  { amount: 100, discount: 2 },
  { amount: 200, discount: 3 },
  { amount: 500, discount: 3 },
  { amount: 1000, discount: 4 },
  { amount: 2000, discount: 5 },
  { amount: 5000, discount: 5 },
  { amount: 10000, discount: 6 }
]

const NETWORKS = ['MTN', 'AIRTEL', 'GLO', '9MOBILE']

export default function AirtimePage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selectedNetwork, setSelectedNetwork] = useState('MTN')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [selectedAmount, setSelectedAmount] = useState(null)
  const [customAmount, setCustomAmount] = useState('')
  const [purchasing, setPurchasing] = useState(false)

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

  const calculatePrice = (amount) => {
    const option = AIRTIME_OPTIONS.find(o => o.amount === amount)
    const discount = option ? option.discount : 2
    return amount - (amount * discount / 100)
  }

  const handlePurchase = async () => {
    const finalAmount = selectedAmount || parseInt(customAmount)

    if (!phoneNumber) {
      alert('Please enter a phone number')
      return
    }

    if (phoneNumber.length !== 11) {
      alert('Please enter a valid 11-digit phone number')
      return
    }

    if (!finalAmount || finalAmount < 50) {
      alert('Please select or enter an amount (minimum ₦50)')
      return
    }

    const price = calculatePrice(finalAmount)

    if (balance < price) {
      alert(`Insufficient balance. You need ₦${price} but have ₦${balance}`)
      return
    }

    setPurchasing(true)

    try {
      const supabase = getSupabase()

      // Deduct from wallet
      const newBalance = balance - price
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ wallet_balance: newBalance })
        .eq('id', user.id)

      if (updateError) {
        alert('Failed to process payment. Please try again.')
        setPurchasing(false)
        return
      }

      // Record transaction
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert([
          {
            user_id: user.id,
            type: 'airtime',
            network: selectedNetwork,
            phone_number: phoneNumber,
            bundle_size: `₦${finalAmount}`,
            amount: price,
            status: 'completed',
            created_at: new Date().toISOString()
          }
        ])

      if (transactionError) {
        console.error('Transaction record error:', transactionError)
      }

      setBalance(newBalance)
      alert(`Success! ₦${finalAmount} airtime has been sent to ${phoneNumber}`)
      setPhoneNumber('')
      setSelectedAmount(null)
      setCustomAmount('')
    } catch (err) {
      console.error('Purchase error:', err)
      alert('An error occurred. Please try again.')
    } finally {
      setPurchasing(false)
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

  const finalAmount = selectedAmount || parseInt(customAmount) || 0
  const finalPrice = finalAmount ? calculatePrice(finalAmount) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Buy Airtime</h1>
          <button 
            onClick={() => router.push('/dashboard')}
            className="bg-white/20 hover:bg-white/30 px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            ← Back
          </button>
        </div>

        {/* Balance Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-8 border border-white/20">
          <p className="text-white/80 mb-2">Wallet Balance</p>
          <p className="text-3xl font-bold">₦{balance.toLocaleString()}</p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Network Selection */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-6 border border-white/20">
            <h2 className="text-2xl font-bold mb-4">Select Network</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {NETWORKS.map((network) => (
                <button
                  key={network}
                  onClick={() => setSelectedNetwork(network)}
                  className={`p-4 rounded-lg font-bold text-lg transition-all ${
                    selectedNetwork === network
                      ? 'bg-white text-blue-600 shadow-lg'
                      : 'bg-white/20 hover:bg-white/30'
                  }`}
                >
                  {network}
                </button>
              ))}
            </div>
          </div>

          {/* Phone Number Input */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-6 border border-white/20">
            <h2 className="text-2xl font-bold mb-4">Phone Number</h2>
            <input
              type="tel"
              placeholder="08012345678"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 11))}
              className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
              maxLength={11}
            />
          </div>

          {/* Amount Selection */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-6 border border-white/20">
            <h2 className="text-2xl font-bold mb-4">Select Amount</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {AIRTIME_OPTIONS.map((option) => (
                <button
                  key={option.amount}
                  onClick={() => {
                    setSelectedAmount(option.amount)
                    setCustomAmount('')
                  }}
                  className={`p-6 rounded-lg text-left transition-all ${
                    selectedAmount === option.amount
                      ? 'bg-white text-blue-600 shadow-lg'
                      : 'bg-white/20 hover:bg-white/30'
                  }`}
                >
                  <div className="text-2xl font-bold mb-1">₦{option.amount}</div>
                  <div className={`text-sm ${selectedAmount === option.amount ? 'text-blue-600' : 'text-white/70'}`}>
                    Pay ₦{calculatePrice(option.amount)}
                  </div>
                  <div className="text-xs mt-1">
                    <span className="bg-green-500 text-white px-2 py-1 rounded">
                      {option.discount}% OFF
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <div className="border-t border-white/20 pt-6">
              <h3 className="text-lg font-semibold mb-3">Or Enter Custom Amount</h3>
              <input
                type="number"
                placeholder="Enter amount (min ₦50)"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value)
                  setSelectedAmount(null)
                }}
                className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                min="50"
              />
            </div>
          </div>

          {/* Summary & Purchase */}
          {finalAmount > 0 && (
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-6">
              <h2 className="text-2xl font-bold mb-4">Purchase Summary</h2>
              <div className="space-y-3 text-lg">
                <div className="flex justify-between">
                  <span className="text-white/80">Network:</span>
                  <span className="font-bold">{selectedNetwork}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/80">Phone Number:</span>
                  <span className="font-bold">{phoneNumber || '---'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/80">Airtime Amount:</span>
                  <span className="font-bold">₦{finalAmount}</span>
                </div>
                <div className="flex justify-between text-green-400">
                  <span>Discount:</span>
                  <span className="font-bold">-₦{finalAmount - finalPrice}</span>
                </div>
                <div className="border-t border-white/20 pt-3 flex justify-between text-2xl">
                  <span className="font-bold">You Pay:</span>
                  <span className="font-bold">₦{finalPrice}</span>
                </div>
              </div>
            </div>
          )}

          {/* Purchase Button */}
          <button
            onClick={handlePurchase}
            disabled={purchasing || !finalAmount}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-4 px-6 rounded-lg font-bold text-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {purchasing ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              finalAmount ? `Buy ₦${finalAmount} Airtime for ₦${finalPrice}` : 'Select Amount'
            )}
          </button>
        </div>
      </div>
    </div>
  )
    }
