q1import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'

const BILL_TYPES = {
  electricity: {
    name: 'Electricity',
    icon: '⚡',
    providers: [
      { id: 'ekedc', name: 'Eko Electricity (EKEDC)' },
      { id: 'ikedc', name: 'Ikeja Electric (IKEDC)' },
      { id: 'aedc', name: 'Abuja Electricity (AEDC)' },
      { id: 'phed', name: 'Port Harcourt Electricity (PHED)' },
      { id: 'ibedc', name: 'Ibadan Electricity (IBEDC)' }
    ]
  },
  tv: {
    name: 'Cable TV',
    icon: '📺',
    providers: [
      { id: 'dstv', name: 'DSTV', packages: [
        { name: 'DSTV Padi', price: 2500 },
        { name: 'DSTV Yanga', price: 3500 },
        { name: 'DSTV Confam', price: 6200 },
        { name: 'DSTV Compact', price: 10500 },
        { name: 'DSTV Premium', price: 24500 }
      ]},
      { id: 'gotv', name: 'GOtv', packages: [
        { name: 'GOtv Smallie', price: 1300 },
        { name: 'GOtv Jinja', price: 2250 },
        { name: 'GOtv Jolli', price: 3300 },
        { name: 'GOtv Max', price: 4850 }
      ]},
      { id: 'startimes', name: 'Startimes', packages: [
        { name: 'Nova', price: 1200 },
        { name: 'Basic', price: 2200 },
        { name: 'Smart', price: 2800 },
        { name: 'Classic', price: 3200 }
      ]}
    ]
  }
}

export default function BillsPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [billType, setBillType] = useState('electricity')
  const [selectedProvider, setSelectedProvider] = useState(null)
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [meterNumber, setMeterNumber] = useState('')
  const [amount, setAmount] = useState('')
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
    if (!meterNumber) {
      alert(billType === 'electricity' ? 'Please enter your meter number' : 'Please enter your smart card number')
      return
    }

    if (!selectedProvider) {
      alert('Please select a provider')
      return
    }

    let finalAmount = 0
    if (billType === 'tv') {
      if (!selectedPackage) {
        alert('Please select a package')
        return
      }
      finalAmount = selectedPackage.price
    } else {
      finalAmount = parseInt(amount)
      if (!finalAmount || finalAmount < 500) {
        alert('Please enter an amount (minimum ₦500)')
        return
      }
    }

    if (balance < finalAmount) {
      alert(`Insufficient balance. You need ₦${finalAmount} but have ₦${balance}`)
      return
    }

    setPurchasing(true)

    try {
      const supabase = getSupabase()

      // Deduct from wallet
      const newBalance = balance - finalAmount
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
            type: 'bills',
            network: `${BILL_TYPES[billType].name} - ${selectedProvider.name}`,
            phone_number: meterNumber,
            bundle_size: selectedPackage ? selectedPackage.name : `₦${finalAmount}`,
            amount: finalAmount,
            status: 'completed',
            created_at: new Date().toISOString()
          }
        ])

      if (transactionError) {
        console.error('Transaction record error:', transactionError)
      }

      setBalance(newBalance)
      alert(`Success! Your ${BILL_TYPES[billType].name} bill has been paid.`)
      setMeterNumber('')
      setAmount('')
      setSelectedPackage(null)
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

  const currentBillType = BILL_TYPES[billType]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Pay Bills</h1>
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
          {/* Bill Type Selection */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-6 border border-white/20">
            <h2 className="text-2xl font-bold mb-4">Select Bill Type</h2>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(BILL_TYPES).map(([key, type]) => (
                <button
                  key={key}
                  onClick={() => {
                    setBillType(key)
                    setSelectedProvider(null)
                    setSelectedPackage(null)
                    setAmount('')
                  }}
                  className={`p-6 rounded-lg transition-all ${
                    billType === key
                      ? 'bg-white text-blue-600 shadow-lg'
                      : 'bg-white/20 hover:bg-white/30'
                  }`}
                >
                  <div className="text-4xl mb-2">{type.icon}</div>
                  <div className="font-bold text-xl">{type.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Provider Selection */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-6 border border-white/20">
            <h2 className="text-2xl font-bold mb-4">Select Provider</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentBillType.providers.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => {
                    setSelectedProvider(provider)
                    setSelectedPackage(null)
                  }}
                  className={`p-4 rounded-lg text-left transition-all ${
                    selectedProvider?.id === provider.id
                      ? 'bg-white text-blue-600 shadow-lg'
                      : 'bg-white/20 hover:bg-white/30'
                  }`}
                >
                  <div className="font-bold text-lg">{provider.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* TV Package Selection */}
          {billType === 'tv' && selectedProvider?.packages && (
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-6 border border-white/20">
              <h2 className="text-2xl font-bold mb-4">Select Package</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedProvider.packages.map((pkg) => (
                  <button
                    key={pkg.name}
                    onClick={() => setSelectedPackage(pkg)}
                    className={`p-4 rounded-lg text-left transition-all ${
                      selectedPackage?.name === pkg.name
                        ? 'bg-white text-blue-600 shadow-lg'
                        : 'bg-white/20 hover:bg-white/30'
                    }`}
                  >
                    <div className="font-bold text-lg mb-1">{pkg.name}</div>
                    <div className={`text-xl font-bold ${selectedPackage?.name === pkg.name ? 'text-blue-600' : ''}`}>
                      ₦{pkg.price.toLocaleString()}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Meter/Card Number */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-6 border border-white/20">
            <h2 className="text-2xl font-bold mb-4">
              {billType === 'electricity' ? 'Meter Number' : 'Smart Card Number'}
            </h2>
            <input
              type="text"
              placeholder={billType === 'electricity' ? 'Enter your meter number' : 'Enter your smart card number'}
              value={meterNumber}
              onChange={(e) => setMeterNumber(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>

          {/* Amount for Electricity */}
          {billType === 'electricity' && (
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-6 border border-white/20">
              <h2 className="text-2xl font-bold mb-4">Enter Amount</h2>
              <input
                type="number"
                placeholder="Enter amount (min ₦500)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                min="500"
              />
            </div>
          )}

          {/* Purchase Button */}
          <button
            onClick={handlePurchase}
            disabled={purchasing}
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
              'Pay Bill'
            )}
          </button>
        </div>
      </div>
    </div>
  )
         }
