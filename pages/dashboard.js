export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-600">Welcome to your dashboard</p>
          </div>
          <a 
            href="/profile" 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            My Profile
          </a>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="font-bold text-lg mb-2">Wallet Balance</h3>
            <p className="text-2xl font-bold">₦0.00</p>
            <p className="text-sm text-gray-500 mt-1">Available funds</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="font-bold text-lg mb-2">Account Status</h3>
            <p className="text-green-600 font-medium">Active</p>
            <p className="text-sm text-gray-500 mt-1">Ready to use</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="font-bold text-lg mb-2">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full text-left text-blue-600 hover:text-blue-800">
                ➕ Add Funds
              </button>
              <button className="w-full text-left text-blue-600 hover:text-blue-800">
                📱 Buy Airtime
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
          <p className="text-gray-500 text-center py-4">No transactions yet</p>
          <div className="text-center">
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
              Start Using Services
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
