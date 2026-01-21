export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600 mb-8">Your main control panel</p>
        
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Wallet Status</h2>
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">
              ⚠️ Wallet features are being configured. Check back soon.
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="font-bold mb-2">Account</h3>
            <p className="text-gray-600 text-sm">Manage your profile</p>
            <a href="/profile" className="text-blue-600 text-sm mt-2 block">View Profile →</a>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="font-bold mb-2">Payments</h3>
            <p className="text-gray-600 text-sm">Coming soon</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="font-bold mb-2">Settings</h3>
            <p className="text-gray-600 text-sm">Configure your account</p>
          </div>
        </div>
      </div>
    </div>
  )
}
