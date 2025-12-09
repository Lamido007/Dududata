export default function Airtime() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-4xl font-bold text-center mb-8 text-primary">Airtime Top-Up (VTU)</h1>
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
        <select className="w-full p-4 mb-6 border-2 border-gray-300 rounded-lg text-lg text-black">
          <option>MTN</option>
          <option>Glo</option>
          <option>Airtel</option>
          <option>9mobile</option>
        </select>
        <input placeholder="Phone Number (e.g., 08012345678)" className="w-full p-4 mb-6 border-2 border-gray-300 rounded-lg text-lg text-black" />
        <input placeholder="Amount (₦50 min)" type="number" className="w-full p-4 mb-8 border-2 border-gray-300 rounded-lg text-lg text-black" />
        <button className="w-full bg-accent text-white py-4 rounded-lg text-xl font-bold hover:bg-green-600">
          Buy Airtime Now
        </button>
        <p className="text-center text-sm text-gray-600 mt-4">Up to 5% discount on all networks!</p>
      </div>
    </div>
  );
}
