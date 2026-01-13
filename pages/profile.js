import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import WalletDashboard from '@/components/WalletDashboard'

export default function ProfilePage() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: ''
  })

  useEffect(() => {
    fetchUserProfile()
  }, [])

  async function fetchUserProfile() {
    try {
      // Get current user
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !currentUser) {
        console.error('No user found')
        setLoading(false)
        return
      }

      setUser(currentUser)

      // Get user profile from database
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single()

      if (!profileError && profileData) {
        setProfile(profileData)
        setFormData({
          full_name: profileData.full_name || '',
          phone: profileData.phone || '',
          address: profileData.address || ''
        })
      } else {
        // If no profile exists, create one
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: currentUser.id,
            email: currentUser.email,
            full_name: currentUser.user_metadata?.full_name || currentUser.email.split('@')[0],
            created_at: new Date().toISOString()
          })
          .select()
          .single()

        if (!createError && newProfile) {
          setProfile(newProfile)
          setFormData({
            full_name: newProfile.full_name || '',
            phone: newProfile.phone || '',
            address: newProfile.address || ''
          })
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  async function updateProfile() {
    try {
      setLoading(true)
      
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          address: formData.address,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error

      // Update local state
      setProfile(prev => ({
        ...prev,
        ...formData
      }))
      
      setEditing(false)
      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      window.location.href = '/login'
    } catch (error) {
      console.error('Error logging out:', error)
      alert('Failed to logout. Please try again.')
    }
  }

  function handleInputChange(e) {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (loading && !user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Profile</h1>
        <p className="text-gray-600 mb-4">You need to be logged in to view your profile.</p>
        <a 
          href="/login" 
          className="block w-full text-center bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
        >
          Go to Login
        </a>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">My Profile</h1>
              <p className="text-blue-100 mt-2">Manage your account and wallet</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1 space-y-8">
            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {profile?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{profile?.full_name || 'User'}</h2>
                  <p className="text-gray-600">{user.email}</p>
                  <p className="text-sm text-gray-500">
                    Joined {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {!editing ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                    <p className="text-lg">{profile?.full_name || 'Not set'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                    <p className="text-lg">{profile?.phone || 'Not set'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Address</h3>
                    <p className="text-lg">{profile?.address || 'Not set'}</p>
                  </div>
                  <button
                    onClick={() => setEditing(true)}
                    className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
                  >
                    Edit Profile
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      rows="3"
                      placeholder="Enter your address"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={updateProfile}
                      disabled={loading}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={() => {
                        setEditing(false)
                        setFormData({
                          full_name: profile?.full_name || '',
                          phone: profile?.phone || '',
                          address: profile?.address || ''
                        })
                      }}
                      className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold mb-4">Account Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Account Status</span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    Active
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Member Since</span>
                  <span className="font-medium">
                    {new Date(user.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Email Verified</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    user.email_confirmed_at 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {user.email_confirmed_at ? 'Verified' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <a 
                  href="/transactions" 
                  className="block w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition"
                >
                  <span className="font-medium">View All Transactions</span>
                  <span className="text-gray-500 text-sm block">See your payment history</span>
                </a>
                <a 
                  href="/support" 
                  className="block w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition"
                >
                  <span className="font-medium">Contact Support</span>
                  <span className="text-gray-500 text-sm block">Need help? Contact us</span>
                </a>
                <a 
                  href="/notifications" 
                  className="block w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition"
                >
                  <span className="font-medium">Notifications</span>
                  <span className="text-gray-500 text-sm block">View your notifications</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Column - Wallet Dashboard */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
              <h2 className="text-2xl font-bold mb-6">My Wallet</h2>
              <WalletDashboard />
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Recent Activity</h2>
                <a 
                  href="/transactions" 
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  View All
                </a>
              </div>
              
              {/* Recent Transactions will be shown by WalletDashboard */}
              <p className="text-gray-500 text-center py-4">
                Your recent transactions will appear here after you make payments.
              </p>
              
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <a 
                  href="/airtime" 
                  className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg hover:from-blue-100 hover:to-blue-200 transition"
                >
                  <div className="text-blue-600 mb-2">📱</div>
                  <h3 className="font-bold">Buy Airtime</h3>
                  <p className="text-sm text-gray-600">Top up any phone</p>
                </a>
                <a 
                  href="/bills" 
                  className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg hover:from-green-100 hover:to-green-200 transition"
                >
                  <div className="text-green-600 mb-2">💡</div>
                  <h3 className="font-bold">Pay Bills</h3>
                  <p className="text-sm text-gray-600">Electricity, TV, etc.</p>
                </a>
                <a 
                  href="/data" 
                  className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg hover:from-purple-100 hover:to-purple-200 transition"
                >
                  <div className="text-purple-600 mb-2">📶</div>
                  <h3 className="font-bold">Buy Data</h3>
                  <p className="text-sm text-gray-600">Mobile internet plans</p>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 border-t border-gray-200 pt-8 pb-6">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>Need help? Contact our support team at support@yourdomain.com</p>
          <p className="mt-2 text-sm">© {new Date().getFullYear()} Your App Name. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
