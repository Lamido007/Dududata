import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { getSupabase } from '../lib/supabaseClient'

const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000, 20000]

export default function FundWalletPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [amount, setAmount] = useState('')
  const [selectedAmount, setSelectedAmount] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [paystackLoaded, setPaystackLoaded] = useState(false)

  useEffect(() => {
    checkUser()
    loadPaystackScript()
  }, [])

  const loadPaystackScript = () => {
    if (document.getElementById('paystack-script')) {
      setPaystackLoaded(true)
      return
    }

    const script = document.createElement('script')
    script.id = 'paystack-script'
    script.src = 'https://js.paystack.co/v1/inline.js'
    script.async = true
    script.onload = () => setPaystackLoaded(true)
    script.onerror = () => {
      console.error('Failed to load Paystack script')
      alert('Failed to load payment system. Please refresh the page.')
    }
    document.body.appendChild(script)
  }

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

  const handlePayment = async () => {
    const finalAmount = selectedAmount || parseInt(amount)

    if (!finalAmount || finalAmount < 100) {
      alert('Please enter an amount (minimum ₦100)')
      return
    }

    if (!paystackLoaded) {
      alert('Payment system is still loading. Please wait a moment and try again.')
      return
    }

    if (!window.PaystackPop) {
      alert('Payment system not available. Please refresh the page.')
      return
    }

    const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY

    if (!paystackKey || paystackKey.includes('pk_test_') === false && paystackKey.includes('pk_live_') === false) {
      alert('Payment system not configured. Please contact support.')
      console.error('Paystack public key not set or invalid')
      return
    }

    setProcessing(true)

    try {
      const supabase = getSupabase()
      const reference = `dududata_${Date.now()}_${user.id.slice(0, 8)}`

      const handler = window.PaystackPop.setup({
        key: paystackKey,
        email: user.email,
        amount: finalAmount * 100, // Convert to kobo
        currency: 'NGN',
        ref: reference,
        metadata: {
          user_id: user.id,
          custom_fields: [
            {
              display_name: 'User Email',
              variable_name: 'user_email',
              value: user.email
            }
          ]
        },
        onClose: function() {
          setProcessing(false)
          console.log('Payment window closed')
        },
        callback: async function(response) {
          console.log('Payment successful:', response)

          try {
            // Update wallet balance
            const newBalance = balance + finalAmount
            const { error: updateError } = await supabase
              .from('profiles')
              .update({ wallet_balance: newBalance })
              .eq('id', user.id)

            if (updateError) {
              console.error('Balance update error:', updateError)
              alert('Payment successful but failed to update balance. Please contact support with reference: ' + response.reference)
              setProcessing(false)
              return
            }

            // Record transaction
            const { error: transactionError } = await supabase
              .from('transactions')
              .insert([
                {
                  user_id: user.id,
                  type: 'funding',
                  amount: finalAmount,
                  status: 'completed',
                  reference: response.reference,
                  created_at: new Date().toISOString()
                }
              ])

            if (transactionError) {
              console.error('Transaction record error:', transactionError)
            }

            // Create notification
            await supabase
              .from('notifications')
              .insert([
                {
                  user_id: user.id,
                  title: 'Wallet Funded Successfully! 💰',
                  message: `Your wallet has been funded with ₦${finalAmount.toLocaleString()}. Your new balance is ₦${newBalance.toLocaleString()}.`,
                  type: 'success'
                }
              ])

            setBalance(newBalance)
            alert(`Success! Your wallet has been funded with ₦${finalAmount.toLocaleString()}`)
            setAmount('')
            setSelectedAmount(null)
          } catch (err) {
            console.error('Post-payment error:', err)
            alert('Payment successful but an error occurred. Please contact support.')
          } finally {
            setProcessing(false)
          }
        }
      })

      handler.openIframe()
    } catch (err) {
      console.error('Payment error:', err)
      alert('Failed to initialize payment. Please try again.')
      setProcessing(false)
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

  const finalAmount = selectedAmount || parseInt(amount) || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Fund Wallet</h1>
          <button 
            onClick={() => router.push('/dashboard')}
            className="bg-white/20 hover:bg-white/30 px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            ← Back
          </button>
        </div>

        {/* Current Balance Card */}
        <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl p-8 shadow-2xl mb-8 max-w-2xl mx-auto">
          <p className="text-white/80 text-lg mb-2">Current Balance</p>
          <p className="text-5xl font-bold text-white">
            ₦{balance.toLocaleString()}
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Quick Amount Selection */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-6 border border-white/20">
            <h2 className="text-2xl font-bold mb-4">Quick Amounts</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {QUICK_AMOUNTS.map((quickAmount) => (
                <button
                  key={quickAmount}
                  onClick={() => {
                    setSelectedAmount(quickAmount)
                    setAmount('')
                  }}
                  className={`p-6 rounded-lg transition-all ${
                    selectedAmount === quickAmount
                      ? 'bg-white text-blue-600 shadow-lg scale-105'
                      : 'bg-white/20 hover:bg-white/30'
                  }`}
                >
                  <div className="text-2xl font-bold">₦{quickAmount.toLocaleString()}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-6 border border-white/20">
            <h2 className="text-2xl font-bold mb-4">Or Enter Custom Amount</h2>
            <input
              type="number"
              placeholder="Enter amount (min ₦100)"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value)
                setSelectedAmount(null)
              }}
              className="w-full px-4 py-4 text-2xl rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
              min="100"
            />
          </div>

          {/* Payment Summary */}
          {finalAmount > 0 && (
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-6 border border-white/20">
              <h2 className="text-2xl font-bold mb-4">Payment Summary</h2>
              <div className="space-y-3 text-lg">
                <div className="flex justify-between">
                  <span className="text-white/80">Amount to Fund:</span>
                  <span className="font-bold text-2xl">₦{finalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/80">Current Balance:</span>
                  <span className="font-bold">₦{balance.toLocaleString()}</span>
                </div>
                <div className="border-t border-white/20 pt-3 flex justify-between text-green-400">
                  <span className="font-bold">New Balance:</span>
                  <span className="font-bold text-2xl">₦{(balance + finalAmount).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Payment Method Info */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-6 border border-white/20">
            <h3 className="text-xl font-bold mb-3">Payment Methods Available</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-white/5 p-3 rounded-lg text-center">
                💳 <div className="font-semibold mt-1">Debit Card</div>
              </div>
              <div className="bg-white/5 p-3 rounded-lg text-center">
                🏦 <div className="font-semibold mt-1">Bank Transfer</div>
              </div>
              <div className="bg-white/5 p-3 rounded-lg text-center">
                📱 <div className="font-semibold mt-1">USSD</div>
              </div>
              <div className="bg-white/5 p-3 rounded-lg text-center">
                🔒 <div className="font-semibold mt-1">Secured by Paystack</div>
              </div>
            </div>
          </div>

          {/* Fund Button */}
          <button
            onClick={handlePayment}
            disabled={processing || !finalAmount || !paystackLoaded}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-4 px-6 rounded-lg font-bold text-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {processing ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : !paystackLoaded ? (
              'Loading Payment System...'
            ) : (
              finalAmount ? `Fund Wallet - ₦${finalAmount.toLocaleString()}` : 'Enter Amount'
            )}
          </button>

          {/* Security Note */}
          <div className="mt-6 text-center text-white/70 text-sm space-y-2">
            <p>🔒 Your payment is secured with 256-bit SSL encryption</p>
            <p>Powered by Paystack • Instant Credit • 24/7 Support</p>
          </div>
        </div>
      </div>
    </div>
  )
        }
