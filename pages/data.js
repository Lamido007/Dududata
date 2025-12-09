export default function DataPlans() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-4xl font-bold text-center mb-8 text-blue-800">Buy Data Plans</h1>
      <div className="max-w-4xl mx-auto">
        <select className="w-full p-4 mb-6 border rounded-lg text-black text-lg">
          <option>MTN</option>
          <option>Glo</option>
          <option>Airtel</option>
          <option>9mobile</option>
        </select>
        <input placeholder="Phone Number" className="w-full p-4 mb-8 border rounded-lg text-black" />
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow text-center">
            <p className="text-3xl font-bold text-green-500">1GB</p>
            <p className="text-2xl font-bold text-blue-800">₦450</p>
            <p className="text-gray-600 mb-4">30 days</p>
            <button className="bg-blue-800 text-white w-full py-3 rounded-lg font-bold">Buy Now</button>
          </div>
          <div className="bg-white p-6 rounded-xl shadow text-center">
            <p className="text-3xl font-bold text-green-500">2GB</p>
            <p className="text-2xl font-bold text-blue-800">₦900</p>
            <p className="text-gray-600 mb-4">30 days</p>
            <button className="bg-blue-800 text-white w-full py-3 rounded-lg font-bold">Buy Now</button>
          </div>
          <div className="bg-white p-6 rounded-xl shadow text-center">
            <p className="text-3xl font-bold text-green-500">5GB</p>
            <p className="text-2xl font-bold text-blue-800">₦2,250</p>
            <p className="text-gray-600 mb-4">30 days</p>
            <button className="bg-blue-800 text-white w-full py-3 rounded-lg font-bold">Buy Now</button>
          </div>
        </div>
      </div>
    </div>
  );
}
