export default function WalletDashboard() {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">Wallet Dashboard</h2>
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
        <p className="text-blue-800">
          ✅ Wallet component loaded successfully!
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="p-4 border rounded-lg">
          <div className="font-medium">Balance</div>
          <div className="text-2xl font-bold mt-1">₦0.00</div>
        </div>
        
        <div className="p-4 border rounded-lg">
          <div className="font-medium">Account Status</div>
          <div className="text-green-600 font-medium mt-1">Ready for setup</div>
        </div>
        
        <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition font-medium">
          Set Up Payment Account
        </button>
      </div>
    </div>
  )
}
