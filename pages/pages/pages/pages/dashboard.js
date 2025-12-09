export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-4xl font-bold text-primary mb-6">Dashboard</h1>
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <p className="text-gray-600">Wallet Balance</p>
        <p className="text-5xl font-bold text-accent">₦5,000</p>
      </div>
      <button className="w-full bg-primary text-white py-4 rounded-lg text-xl font-bold">
        Fund Wallet
      </button>
    </div>
  )
    }
