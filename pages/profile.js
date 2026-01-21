import { useState, useEffect } from 'react'

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => {
      setLoading(false)
    }, 500)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">My Profile</h1>
        <p className="text-gray-600 mb-8">Welcome to your profile dashboard</p>
        
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              U
            </div>
            <div>
              <h2 className="text-xl font-bold">User Account</h2>
              <p className="text-gray-600">Logged in successfully</p>
            </div>
          </div>
          
          <div className="border-t pt-6">
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a href="/dashboard" className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition">
                <div className="font-medium">Go to Dashboard</div>
                <div className="text-sm text-gray-600">View your wallet</div>
              </a>
              <a href="/" className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <div className="font-medium">Back to Home</div>
                <div className="text-sm text-gray-600">Return to main page</div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
      }
