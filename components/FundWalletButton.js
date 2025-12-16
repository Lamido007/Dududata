import { useState } from 'react'

export default function FundWalletButton({ onSuccess }) {
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)

  const handleFund = () => {
    if (!amount || amount < 100) {
      alert('Minimum ₦100')
      return
    }

    setLoading(true)

    const handler = PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_KEY, // Your public key
      email: 'user@example.com', // Replace with real user email later
      amount: amount * 100, // in kobo
      currency: 'NGN',
      ref: 'dudu_' + Math.floor((Math.random() * 1000000000) + 1),
      onClose: () => {
        alert('Payment cancelled')
        setLoading(false)
      },
      callback: (response) => {
        alert('Payment successful! Ref: ' + response.reference)
        if (onSuccess) onSuccess(amount)
        setLoading(false)
      }
    })

    handler.openIframe()
  }

  return (
    <div className="mt-8">
      <input
        type="number"
        placeholder="Amount (₦100 min)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full p-4 mb-4 border rounded text-black"
      />
      <button
        onClick={handleFund}
        disabled={loading}
        className="w-full bg-primary text-white py-4 rounded-lg font-bold text-xl hover:bg-blue-700"
      >
        {loading ? 'Processing...' : 'Fund Wallet with Paystack'}
      </button>
      <p className="text-center mt-4 text-sm text-gray-600">
        Card • Bank Transfer • USSD • Apple Pay
      </p>
    </div>
  )
          }
