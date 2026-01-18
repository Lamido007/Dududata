import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function ProfilePage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      setUser(currentUser)
    } catch (error) {
      console.error('Error:', error)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-md text-center">
          <h1 className="text-2xl font-bold mb-4">Profile</h1>
          <p className="text-gray-600 mb-6">You need to be logged in to view your profile.</p>
          <a 
            href="/login" 
            className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Go to Login
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Profile</h1>
          <button
            onClick={handleLogout}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg transition font-medium"
          >
            Logout
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user.email?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="text-xl font-bold">{user.email}</h2>
              <p className="text-gray-600 text-sm">
                Joined {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-bold mb-4">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">User ID</p>
                <p className="font-mono text-sm truncate">{user.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Account Created</p>
                <p className="font-medium">
                  {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email Status</p>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  user.email_confirmed_at ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {user.email_confirmed_at ? 'Verified' : 'Pending'}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t mt-8 pt-6">
            <h3 className="text-lg font-bold mb-4">Go to Dashboard</h3>
            <p className="text-gray-600 mb-4">
              Your wallet and payment features are available on the dashboard page.
            </p>
            <a 
              href="/dashboard" 
              className="inline-block bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Open Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  )
    }
