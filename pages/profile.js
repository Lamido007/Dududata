import { useState, useEffect } from 'react'

// Simple supabase client initialization
const initializeSupabase = () => {
  // Only run on client side
  if (typeof window === 'undefined') return null
  
  try {
    const { createClient } = require('@supabase/supabase-js')
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Supabase environment variables not found')
      return null
    }
    
    return createClient(supabaseUrl, supabaseAnonKey)
  } catch (error) {
    console.error('Failed to initialize Supabase:', error)
    return null
  }
}

export default function ProfilePage() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [supabase, setSupabase] = useState(null)

  useEffect(() => {
    // Initialize Supabase client
    const client = initializeSupabase()
    setSupabase(client)
    
    if (client) {
      fetchUserProfile(client)
    } else {
      setLoading(false)
    }
  }, [])

  async function fetchUserProfile(client) {
    try {
      // Get current user
      const { data: { user: currentUser }, error: userError } = await client.auth.getUser()
      
      if (userError || !currentUser) {
        console.log('No user found, please log in')
        setLoading(false)
        return
      }

      setUser(currentUser)

      // Try to get user profile from database
      const { data: profileData, error: profileError } = await client
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single()

      if (!profileError && profileData) {
        setProfile(profileData)
      } else {
        // Create basic profile data from auth
        const basicProfile = {
          id: currentUser.id,
          email: currentUser.email,
          full_name: currentUser.user_metadata?.full_name || currentUser.email.split('@')[0],
          created_at: new Date().toISOString()
        }
        setProfile(basicProfile)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    if (!supabase) return
    
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      window.location.href = '/login'
    } catch (error) {
      console.error('Error logging out:', error)
      alert('Failed to logout. Please try again.')
    }
  }

  // Simple loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  // Not logged in state
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-md text-center">
          <h1 className="text-2xl font-bold mb-4">Profile Access Required</h1>
          <p className="text-gray-600 mb-6">You need to be logged in to view your profile.</p>
          <a 
            href="/login" 
            className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Go to Login
          </a>
          <p className="mt-4 text-sm text-gray-500">
            Don't have an account? <a href="/register" className="text-blue-600 hover:underline">Register here</a>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
              <p className="text-gray-600 text-sm">Manage your account</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg transition font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-start space-x-6 mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                  {profile?.full_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    {profile?.full_name || 'User'}
                  </h2>
                  <p className="text-gray-600 mb-1">{user.email}</p>
                  <div className="flex items-center space-x-4 mt-4">
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                      Active User
                    </span>
                    <span className="text-sm text-gray-500">
                      Joined {new Date(user.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* User Details */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Account Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Email Address</p>
                    <p className="text-gray-800">{user.email}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">User ID</p>
                    <p className="text-gray-800 font-mono text-sm truncate">{user.id}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Account Created</p>
                    <p className="text-gray-800">{new Date(user.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Email Verified</p>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${user.email_confirmed_at ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {user.email_confirmed_at ? 'Verified' : 'Pending Verification'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Wallet Section */}
              <div className="border-t mt-8 pt-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Wallet Setup</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
                  <div className="flex items-start">
                    <div className="mr-4 text-blue-600 text-2xl">💰</div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800 mb-2">Paystack Virtual Account</h4>
                      <p className="text-gray-600 mb-4">
                        Set up your dedicated bank account to receive payments and fund your wallet.
                      </p>
                      <div className="space-y-3">
                        <a 
                          href="/dashboard" 
                          className="inline-block bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium"
                        >
                          Go to Dashboard for Wallet
                        </a>
                        <p className="text-sm text-gray-500">
                          Your wallet dashboard is available on the main dashboard page.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Quick Links & Info */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="font-bold text-gray-800 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600">Account Status</span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    Active
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600">User Role</span>
                  <span className="font-medium">Standard</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Last Active</span>
                  <span className="font-medium">Just now</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="font-bold text-gray-800 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <a 
                  href="/dashboard" 
                  className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition group"
                >
                  <div className="mr-3 text-gray-600 group-hover:text-blue-600">📊</div>
                  <div>
                    <span className="font-medium block">Dashboard</span>
                    <span className="text-sm text-gray-500">Main dashboard</span>
                  </div>
                </a>
                <a 
                  href="/transactions" 
                  className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition group"
                >
                  <div className="mr-3 text-gray-600 group-hover:text-green-600">📝</div>
                  <div>
                    <span className="font-medium block">Transactions</span>
                    <span className="text-sm text-gray-500">View history</span>
                  </div>
                </a>
                <a 
                  href="/support" 
                  className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition group"
                >
                  <div className="mr-3 text-gray-600 group-hover:text-purple-600">🛟</div>
                  <div>
                    <span className="font-medium block">Support</span>
                    <span className="text-sm text-gray-500">Get help</span>
                  </div>
                </a>
              </div>
            </div>

            {/* App Features */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
              <h3 className="font-bold text-gray-800 mb-3">Available Features</h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-700">Airtime Purchase</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-700">Bill Payments</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-700">Data Bundles</span>
                </li>
                <li className="flex items-center">
                  <span className="text-blue-500 mr-2">⏳</span>
                  <span className="text-gray-700">Wallet Funding (Coming Soon)</span>
                </li>
              </ul>
              <p className="mt-4 text-sm text-gray-600">
                More features are being added regularly. Check back soon!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="text-center text-gray-600 text-sm">
            <p>Need assistance? Contact support at <span className="font-medium">help@dududata.com</span></p>
            <p className="mt-1">© {new Date().getFullYear()} Dududata. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
