import WalletDashboard from '@/components/WalletDashboard'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600 mb-8">Manage your wallet and transactions</p>
        <WalletDashboard />
      </div>
    </div>
  )
}
