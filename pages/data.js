import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'

const DATA_BUNDLES = {
  MTN: [
    { id: 'mtn_500mb', size: '500MB', duration: '30 Days', price: 150, discount: 5 },
    { id: 'mtn_1gb', size: '1GB', duration: '30 Days', price: 280, discount: 8 },
    { id: 'mtn_2gb', size: '2GB', duration: '30 Days', price: 560, discount: 10 },
    { id: 'mtn_3gb', size: '3GB', duration: '30 Days', price: 840, discount: 12 },
    { id: 'mtn_5gb', size: '5GB', duration: '30 Days', price: 1400, discount: 15 },
    { id: 'mtn_10gb', size: '10GB', duration: '30 Days', price: 2800, discount: 18 }
  ],
  AIRTEL: [
    { id: 'airtel_500mb', size: '500MB', duration: '30 Days', price: 145, discount: 5 },
    { id: 'airtel_1gb', size: '1GB', duration: '30 Days', price: 275, discount: 8 },
    { id: 'airtel_2gb', size: '2GB', duration: '30 Days', price: 550, discount: 10 },
    { id: 'airtel_5gb', size: '5GB', duration: '30 Days', price: 1375, discount: 15 },
    { id: 'airtel_10gb', size: '10GB', duration: '30 Days', price: 2750, discount: 18 }
  ],
  GLO: [
    { id: 'glo_500mb', size: '500MB', duration: '30 Days', price: 140, discount: 5 },
    { id: 'glo_1gb', size: '1GB', duration: '30 Days', price: 270, discount: 8 },
    { id: 'glo_2gb', size: '2GB', duration: '30 Days', price: 540, discount: 10 },
    { id: 'glo_5gb', size: '5GB', duration: '30 Days', price: 1350, discount: 15 },
    { id: 'glo_10gb', size: '10GB', duration: '30 Days', price: 2700, discount: 18 }
  ],
  '9MOBILE': [
    { id: '9mobile_500mb', size: '500MB', duration: '30 Days', price: 145, discount: 5 },
    { id: '9mobile_1gb', size: '1GB', duration: '30 Days', price: 280, discount: 8 },
    { id: '9mobile_2gb', size: '2GB', duration: '30 Days', price: 560, discount: 10 },
    { id: '9mobile_5gb', size: '5GB', duration: '30 Days', price: 1400, discount: 15 }
  ]
}

export default function DataPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selectedNetwork, setSelectedNetwork] = useState('MTN')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [selectedBundle, setSelectedBundle] = useState(null)
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

  const handlePurchase = async () => {
    if (!phoneNumber) {
      alert('Please enter a phone number')
      return
    }

    if (phoneNumber.length !== 11) {
      alert('Please enter a valid 11-digit phone number')
      return
    }

    if (!selectedBundle) {
      alert('Please select a data bundle')
      return
    }

    if (balance < selectedBundle.price) {
      alert(`Insufficient balance. You need ₦${selectedBundle.price} but have ₦${balance}`)
      return
    }

    setPurchasing(true)

    try {
      const supabase = getSupabase()

      // Deduct from wallet
      const newBalance = balance - selectedBundle.price
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
            type: 'data',
            network: selectedNetwork,
            phone_number: phoneNumber,
            bundle_size: selectedBundle.size,
            amount: selectedBundle.price,
            status: 'completed',
            created_at: new Date().toISOString()
          }
        ])

      if (transactionError) {
        console.error('Transaction record error:', transactionError)
      }

      setBalance(newBalance)
      alert(`Success! ${selectedBundle.size} data has been sent to ${phoneNumber}`)
      setPhoneNumber('')
      setSelectedBundle(null)
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

  const bundles = DATA_BUNDLES[selectedNetwork] || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Buy Data</h1>
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
              {Object.keys(DATA_BUNDLES).map((network) => (
                <button
                  key={network}
                  onClick={() => {
                    setSelectedNetwork(network)
                    setSelectedBundle(null)
                  }}
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

          {/* Data Bundles */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold mb-4">Select Data Bundle</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bundles.map((bundle) => (
                <button
                  key={bundle.id}
                  onClick={() => setSelectedBundle(bundle)}
                  className={`p-6 rounded-lg text-left transition-all ${
                    selectedBundle?.id === bundle.id
                      ? 'bg-white text-blue-600 shadow-lg'
                      : 'bg-white/20 hover:bg-white/30'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-2xl font-bold">{bundle.size}</div>
                    {bundle.discount > 0 && (
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                        {bundle.discount}% OFF
                      </span>
                    )}
                  </div>
                  <div className={selectedBundle?.id === bundle.id ? 'text-blue-600' : 'text-white/80'}>
                    {bundle.duration}
                  </div>
                  <div className="text-2xl font-bold mt-2">₦{bundle.price}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Purchase Button */}
          {selectedBundle && (
            <button
              onClick={handlePurchase}
              disabled={purchasing}
              className="w-full mt-6 bg-green-500 hover:bg-green-600 text-white py-4 px-6 rounded-lg font-bold text-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                `Buy ${selectedBundle.size} for ₦${selectedBundle.price}`
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
     }
