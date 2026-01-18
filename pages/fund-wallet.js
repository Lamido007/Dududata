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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadPaystackScript = () => {
    if (typeof window === 'undefined') return
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

      const { data, error } = await supabase.auth.getUser()
      if (error || !data?.user) {
        router.push('/login')
        return
      }

      const currentUser = data.user
      setUser(currentUser)

      const { data: profile, error: balanceError } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', currentUser.id)
        .single()

      if (!balanceError && profile) {
        setBalance(profile.wallet_balance || 0)
      }
    } catch (err) {
      console.error('Error checking user:', err)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async () => {
    // parse amount safely
    const parsed = parseInt(amount || '', 10)
    const finalAmount = selectedAmount || (Number.isFinite(parsed) ? parsed : 0)

    if (!finalAmount || finalAmount < 100) {
      alert('Please enter an amount (minimum ₦100)')
      return
    }

    if (!paystackLoaded) {
      alert('Payment system is still loading. Please wait a moment and try again.')
      return
    }

    if (typeof window === 'undefined' || !window.PaystackPop) {
      alert('Payment system not available. Please refresh the page.')
      return
    }

    setProcessing(true)

    try {
      const supabase = getSupabase()
      // Get client session access token so server can verify user identity
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData?.session?.access_token

      // 1) Create a pending transaction on server which returns a unique reference
      const createResp = await fetch('/api/create-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
        },
        body: JSON.stringify({ amount: finalAmount })
      })

      if (!createResp.ok) {
        const err = await createResp.json().catch(() => ({}))
        throw new Error(err?.message || 'Failed to create transaction')
      }

      const { reference, paystack_public_key } = await createResp.json()

      if (!reference || !paystack_public_key) {
        throw new Error('Server did not return a valid transaction reference or Paystack key')
      }

      // 2) Launch Paystack using the server-generated reference and public key
      const handler = window.PaystackPop.setup({
        key: paystack_public_key,
        email: user.email,
        amount: finalAmount * 100,
        currency: 'NGN',
        ref: reference,
        metadata: {
          user_id: user.id
        },
        onClose: function () {
          setProcessing(false)
          console.log('Payment window closed')
        },
        callback: async function (response) {
          console.log('Paystack callback response:', response)
          try {
            // 3) After Paystack callback, call server to verify with secret key and finalize DB updates
            const verifyResp = await fetch('/api/verify-transaction', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
              },
              body: JSON.stringify({ reference: response.reference })
            })

            if (!verifyResp.ok) {
              const err = await verifyResp.json().catch(() => ({}))
              console.error('Verification failed:', err)
              alert('Payment processed, but verification failed. Please contact support with reference: ' + response.reference)
              setProcessing(false)
              return
            }

            const { success, new_balance, message } = await verifyResp.json()
            if (success) {
              setBalance(new_balance)
              setAmount('')
              setSelectedAmount(null)
              alert(`Success! Your wallet has been funded. New balance: ₦${new_balance.toLocaleString()}`)
            } else {
              console.error('Verification response not successful:', message)
              alert('Payment processed, but verification failed. Please contact support with reference: ' + response.reference)
            }
          } catch (err) {
            console.error('Post-payment verification error:', err)
            alert('Payment processed, but an error occurred during verification. Please contact support with reference: ' + response.reference)
          } finally {
            setProcessing(false)
          }
        }
      })

      handler.openIframe()
    } catch (err) {
      console.error('Payment initialization error:', err)
      alert(err.message || 'Failed to initialize payment. Please try again.')
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

  if (!user) return null

  const finalAmountDisplay = selectedAmount || parseInt(amount || '', 10) || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Fund Wallet</h1>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-white/20 hover:bg-white/30 px-6 py-2 rounded-lg font-semibold transition-colors"
            aria-label="Back to dashboard"
          >
            ← Back
          </button>
        </div>

        <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl p-8 shadow-2xl mb-8 max-w-2xl mx-auto">
          <p className="text-white/80 text-lg mb-2">Current Balance</p>
          <p className="text-5xl font-bold text-white">
            ₦{balance.toLocaleString()}
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-6 border border-white/20">
            <h2 className="text-2xl font-bold mb-4">Quick Amounts</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {QUICK_AMOUNTS.map((qa) => (
                <button
                  key={qa}
                  onClick={() => {
                    setSelectedAmount(qa)
                    setAmount('')
                  }}
                  className={`p-6 rounded-lg transition-all ${
                    selectedAmount === qa
                      ? 'bg-white text-blue-600 shadow-lg scale-105'
                      : 'bg-white/20 hover:bg-white/30'
                  }`}
                >
                  <div className="text-2xl font-bold">₦{qa.toLocaleString()}</div>
                </button>
              ))}
            </div>
          </div>

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

          {finalAmountDisplay > 0 && (
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-6 border border-white/20">
              <h2 className="text-2xl font-bold mb-4">Payment Summary</h2>
              <div className="space-y-3 text-lg">
                <div className="flex justify-between">
                  <span className="text-white/80">Amount to Fund:</span>
                  <span className="font-bold text-2xl">₦{finalAmountDisplay.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/80">Current Balance:</span>
                  <span className="font-bold">₦{balance.toLocaleString()}</span>
                </div>
                <div className="border-t border-white/20 pt-3 flex justify-between text-green-400">
                  <span className="font-bold">New Balance:</span>
                  <span className="font-bold text-2xl">₦{(balance + finalAmountDisplay).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

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

          <button
            onClick={handlePayment}
            disabled={processing || finalAmountDisplay <= 0 || !paystackLoaded}
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
              finalAmountDisplay ? `Fund Wallet - ₦${finalAmountDisplay.toLocaleString()}` : 'Enter Amount'
            )}
          </button>

          <div className="mt-6 text-center text-white/70 text-sm space-y-2">
            <p>🔒 Your payment is secured with 256-bit SSL encryption</p>
            <p>Powered by Paystack • Instant Credit • 24/7 Support</p>
          </div>
        </div>
      </div>
    </div>
  )
}