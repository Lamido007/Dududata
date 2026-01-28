export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">My Profile</h1>
        <p className="text-gray-600 mb-8">Manage your account settings</p>
        
        <div className="bg-white rounded-xl shadow p-6">
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
            <h3 className="text-lg font-bold mb-4">Account Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">user@example.com</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Account Status</p>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  Active
                </span>
              </div>
            </div>
          </div>
          
          <div className="border-t mt-6 pt-6">
            <a 
              href="/dashboard" 
              className="text-blue-600 hover:text-blue-800"
            >
              ← Back to Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
