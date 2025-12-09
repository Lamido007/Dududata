export default function Airtime() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-4xl font-bold text-primary mb-8">Airtime Top-Up</h1>
      <div className="max-w-md mx-auto bg-white rounded-xl shadow p-8">
        <select className="w-full p-3 border mb-4 text-black">
          <option>MTN</option><option>Glo</option><option>Airtel</option><option>9mobile</option>
        </select>
        <input placeholder="Phone Number" className="w-full p-3 border mb-4 text-black" />
        <input placeholder="Amount (₦)" className="w-full p-3 border mb-6 text-black" />
        <button className="w-full bg-accent text-white py-4 rounded-lg text-xl font-bold">
          Buy Airtime
        </button>
      </div>
    </div>
  )
}
