import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { getSupabase } from '../lib/supabaseClient'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  
  // Form states
  const [fullName, setFullName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [referralCode, setReferralCode] = useState('')
  const [stats, setStats] = useState(null)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const supabase = getSupabase()
      
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        router.push('/login')
        return
      }

      setUser(user)

      // Get profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData) {
        setProfile(profileData)
        setFullName(profileData.full_name || '')
        setPhoneNumber(profileData.phone_number || '')
        setReferralCode(profileData.referral_code || '')
      }

      // Get statistics using the function
      const { data: statsData } = await supabase
        .rpc('get_user_stats', { user_uuid: user.id })

      if (statsData) {
        setStats(statsData)
      }
    } catch (err) {
      console.error('Error loading profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const supabase = getSupabase()

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone_number: phoneNumber
        })
        .eq('id', user.id)

      if (error) {
        alert('Failed to update profile')
      } else {
        alert('Profile updated successfully!')
        loadProfile()
      }
    } catch (err) {
      console.error('Error saving profile:', err)
      alert('An error occurred')
    } finally {
      setSaving(false)
    }
  }

  const copyReferralLink = () => {
    const link = `${window.location.origin}/register?ref=${referralCode}`
    navigator.clipboard.writeText(link)
    alert('Referral link copied to clipboard!')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    )
  }

  const getLevelColor = (level) => {
    switch(level) {
      case 'platinum': return 'from-purple-400 to-pink-400'
      case 'gold': return 'from-yellow-400 to-orange-400'
      case 'silver': return 'from-gray-300 to-gray-400'
      default: return 'from-blue-400 to-indigo-400'
    }
  }

  const getLevelBadge = (level) => {
    switch(level) {
      case 'platinum': return '💎'
      case 'gold': return '🥇'
      case 'silver': return '🥈'
      default: return '⭐'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">My Profile</h1>
          <button 
            onClick={() => router.push('/dashboard')}
            className="bg-white/20 hover:bg-white/30 px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            ← Back
          </button>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* User Level Card */}
          <div className={`bg-gradient-to-r ${getLevelColor(profile?.user_level)} rounded-2xl p-8 mb-8 shadow-2xl`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white/80 mb-2">Member Status</div>
                <div className="text-4xl font-bold text-white flex items-center gap-3">
                  {getLevelBadge(profile?.user_level)}
                  {profile?.user_level?.toUpperCase() || 'REGULAR'} MEMBER
                </div>
                <div className="text-white/90 mt-2">
                  Total Spent: ₦{profile?.total_spent?.toLocaleString() || 0}
                </div>
              </div>
              <div className="text-6xl">{getLevelBadge(profile?.user_level)}</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl mb-6 border border-white/20">
            <div className="flex gap-2 p-2">
              {['profile', 'referrals', 'statistics'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                    activeTab === tab
                      ? 'bg-white text-blue-600 shadow-lg'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <h2 className="text-2xl font-bold mb-6">Account Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Email Address</label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white"
                    />
                    <p className="text-xs text-white/60 mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name</label>
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="08012345678"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 11))}
                      className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                      maxLength={11}
                    />
                  </div>

                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-lg font-bold transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <h2 className="text-2xl font-bold mb-4">Wallet Information</h2>
                <div className="space-y-3">
                  <div className="flex justify-between text-lg">
                    <span className="text-white/80">Current Balance:</span>
                    <span className="font-bold text-2xl">₦{profile?.wallet_balance?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/80">Referral Earnings:</span>
                    <span className="font-bold text-green-400">₦{profile?.referral_earnings?.toLocaleString() || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Referrals Tab */}
          {activeTab === 'referrals' && (
            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <h2 className="text-2xl font-bold mb-4">Your Referral Code</h2>
                <div className="bg-white/10 rounded-lg p-6 mb-4">
                  <div className="text-center">
                    <div className="text-sm text-white/70 mb-2">Your Referral Code</div>
                    <div className="text-4xl font-bold mb-4">{referralCode}</div>
                    <button
                      onClick={copyReferralLink}
                      className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-2 rounded-lg font-semibold transition-colors"
                    >
                      📋 Copy Referral Link
                    </button>
                  </div>
                </div>
                <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
                  <p className="text-green-100 text-sm">
                    💰 Earn 2% commission on every purchase made by users who sign up with your referral code!
                  </p>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <h2 className="text-2xl font-bold mb-4">Referral Earnings</h2>
                <div className="text-center py-8">
                  <div className="text-5xl font-bold text-green-400 mb-2">
                    ₦{profile?.referral_earnings?.toLocaleString() || 0}
                  </div>
                  <div className="text-white/70">Total Earned from Referrals</div>
                </div>
              </div>
            </div>
          )}

          {/* Statistics Tab */}
          {activeTab === 'statistics' && stats && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                  <div className="text-white/70 mb-2">Total Transactions</div>
                  <div className="text-4xl font-bold">{stats.total_transactions}</div>
                </div>

                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                  <div className="text-white/70 mb-2">Total Spent</div>
                  <div className="text-4xl font-bold">₦{parseFloat(stats.total_spent).toLocaleString()}</div>
                </div>

                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                  <div className="text-white/70 mb-2">Total Funded</div>
                  <div className="text-4xl font-bold text-green-400">₦{parseFloat(stats.total_funded).toLocaleString()}</div>
                </div>

                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                  <div className="text-white/70 mb-2">This Month</div>
                  <div className="text-4xl font-bold">₦{parseFloat(stats.this_month_spent).toLocaleString()}</div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <h3 className="text-2xl font-bold mb-4">Purchase Breakdown</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">📱</div>
                      <div>Data Purchases</div>
                    </div>
                    <div className="text-2xl font-bold">{stats.data_purchases}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">📞</div>
                      <div>Airtime Purchases</div>
                    </div>
                    <div className="text-2xl font-bold">{stats.airtime_purchases}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">💡</div>
                      <div>Bill Payments</div>
                    </div>
                    <div className="text-2xl font-bold">{stats.bill_payments}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
