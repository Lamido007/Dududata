import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { getSupabase } from '../lib/supabaseClient'

const FAQ_DATA = [
  {
    question: 'How do I fund my wallet?',
    answer: 'Click on the "Fund Wallet" button from your dashboard, enter the amount you want to add, and complete the payment using your card, bank transfer, or USSD. Your wallet will be credited instantly.'
  },
  {
    question: 'What networks do you support?',
    answer: 'We support all major Nigerian networks: MTN, Airtel, Glo, and 9mobile for both data bundles and airtime recharge.'
  },
  {
    question: 'How long does it take to receive data/airtime?',
    answer: 'Data bundles and airtime are delivered instantly (within 1-5 minutes) after successful payment. If you don\'t receive it within 10 minutes, please contact support.'
  },
  {
    question: 'Can I get a refund if I enter the wrong number?',
    answer: 'Unfortunately, once data or airtime is delivered to a number, we cannot reverse it. Please double-check the phone number before completing your purchase.'
  },
  {
    question: 'How does the referral system work?',
    answer: 'Share your unique referral code with friends. When they sign up using your code, you earn 2% commission on every purchase they make. Your earnings will be added to your referral balance.'
  },
  {
    question: 'What are the user levels?',
    answer: 'We have 4 levels: Regular (₦0+), Silver (₦20,000+), Gold (₦50,000+), and Platinum (₦100,000+). Higher levels may receive special discounts and benefits.'
  },
  {
    question: 'Is my payment information secure?',
    answer: 'Yes! All payments are processed securely through Paystack with 256-bit SSL encryption. We never store your card details.'
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept Debit/Credit cards (Visa, Mastercard, Verve), Bank Transfer, and USSD payments through Paystack.'
  }
]

export default function SupportPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedFaq, setSelectedFaq] = useState(null)
  const [ticketSubject, setTicketSubject] = useState('')
  const [ticketMessage, setTicketMessage] = useState('')
  const [ticketCategory, setTicketCategory] = useState('general')
  const [submitting, setSubmitting] = useState(false)
  const [tickets, setTickets] = useState([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const supabase = getSupabase()
      
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        router.push('/login')
        return
      }

      setUser(user)

      // Load user's tickets
      const { data: ticketsData } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (ticketsData) {
        setTickets(ticketsData)
      }
    } catch (err) {
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitTicket = async (e) => {
    e.preventDefault()

    if (!ticketSubject || !ticketMessage) {
      alert('Please fill in all fields')
      return
    }

    setSubmitting(true)

    try {
      const supabase = getSupabase()

      const { error } = await supabase
        .from('support_tickets')
        .insert([
          {
            user_id: user.id,
            subject: ticketSubject,
            message: ticketMessage,
            category: ticketCategory,
            status: 'open'
          }
        ])

      if (error) {
        alert('Failed to submit ticket. Please try again.')
      } else {
        alert('Ticket submitted successfully! We will respond within 24 hours.')
        setTicketSubject('')
        setTicketMessage('')
        setTicketCategory('general')
        loadData()
      }
    } catch (err) {
      console.error('Error submitting ticket:', err)
      alert('An error occurred. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Help & Support</h1>
          <button 
            onClick={() => router.push('/dashboard')}
            className="bg-white/20 hover:bg-white/30 px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            ← Back
          </button>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Quick Contact Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 text-center">
              <div className="text-4xl mb-3">📧</div>
              <div className="font-bold mb-2">Email Support</div>
              <div className="text-white/70 text-sm mb-3">support@dududata.com</div>
              <div className="text-xs text-white/50">Response within 24 hours</div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 text-center">
              <div className="text-4xl mb-3">💬</div>
              <div className="font-bold mb-2">WhatsApp</div>
              <div className="text-white/70 text-sm mb-3">+234 XXX XXX XXXX</div>
              <div className="text-xs text-white/50">24/7 Support</div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 text-center">
              <div className="text-4xl mb-3">⏰</div>
              <div className="font-bold mb-2">Working Hours</div>
              <div className="text-white/70 text-sm mb-3">24/7 Available</div>
              <div className="text-xs text-white/50">Fast response time</div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-8">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {FAQ_DATA.map((faq, index) => (
                <div 
                  key={index}
                  className="bg-white/5 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => setSelectedFaq(selectedFaq === index ? null : index)}
                    className="w-full p-4 text-left flex justify-between items-center hover:bg-white/10 transition-colors"
                  >
                    <span className="font-semibold">{faq.question}</span>
                    <span className="text-2xl">{selectedFaq === index ? '−' : '+'}</span>
                  </button>
                  {selectedFaq === index && (
                    <div className="p-4 bg-white/5 border-t border-white/10">
                      <p className="text-white/80">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit Ticket Form */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-8">
            <h2 className="text-2xl font-bold mb-6">Submit a Support Ticket</h2>
            <form onSubmit={handleSubmitTicket} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                  disabled={submitting}
                >
                  <option value="general">General Inquiry</option>
                  <option value="technical">Technical Issue</option>
                  <option value="payment">Payment Issue</option>
                  <option value="refund">Refund Request</option>
                  <option value="account">Account Issue</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Subject</label>
                <input
                  type="text"
                  placeholder="Brief description of your issue"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                  disabled={submitting}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <textarea
                  placeholder="Provide detailed information about your issue..."
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  rows={5}
                  className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                  disabled={submitting}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit Ticket'}
              </button>
            </form>
          </div>

          {/* User's Tickets */}
          {tickets.length > 0 && (
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold mb-6">Your Support Tickets</h2>
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <div 
                    key={ticket.id}
                    className="bg-white/5 rounded-lg p-5"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="font-bold text-lg mb-1">{ticket.subject}</div>
                        <div className="text-sm text-white/70">
                          Category: {ticket.category} • {new Date(ticket.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        ticket.status === 'open' ? 'bg-yellow-500/20 text-yellow-300' :
                        ticket.status === 'closed' ? 'bg-gray-500/20 text-gray-300' :
                        'bg-green-500/20 text-green-300'
                      }`}>
                        {ticket.status}
                      </span>
                    </div>
                    <p className="text-white/80 mb-3">{ticket.message}</p>
                    {ticket.admin_response && (
                      <div className="bg-white/10 rounded p-3 border-l-4 border-blue-500">
                        <div className="text-sm font-semibold mb-1">Admin Response:</div>
                        <p className="text-white/90">{ticket.admin_response}</p>
                      </div>
                    )}
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
