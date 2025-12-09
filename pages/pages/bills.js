export default function Bills() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-4xl font-bold text-center mb-8 text-primary">Pay Bills Instantly</h1>
      <div className="max-w-2xl mx-auto grid md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <h3 className="text-2xl font-bold mb-4">Electricity</h3>
          <p className="text-gray-600 mb-4">IKEJA, EKO, AEDC, etc.</p>
          <input placeholder="Meter Number" className="w-full p-4 mb-4 border rounded-lg text-black" />
          <button className="w-full bg-accent text-white py-3 rounded-lg font-bold">Pay Now</button>
        </div>
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <h3 className="text-2xl font-bold mb-4">Cable TV</h3>
          <p className="text-gray-600 mb-4">DSTV, GOTV, Startimes</p>
          <input placeholder="IUC/Smart Card" className="w-full p-4 mb-4 border rounded-lg text-black" />
          <button className="w-full bg-accent text-white py-3 rounded-lg font-bold">Pay Now</button>
        </div>
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <h3 className="text-2xl font-bold mb-4">Betting Wallet</h3>
          <p className="text-gray-600 mb-4">Bet9ja, Sportybet</p>
          <input placeholder="User ID" className="w-full p-4 mb-4 border rounded-lg text-black" />
          <button className="w-full bg-accent text-white py-3 rounded-lg font-bold">Fund Now</button>
        </div>
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <h3 className="text-2xl font-bold mb-4">Exam PINs</h3>
          <p className="text-gray-600 mb-4">WAEC, NECO, JAMB</p>
          <input placeholder="Quantity" type="number" className="w-full p-4 mb-4 border rounded-lg text-black" />
          <button className="w-full bg-accent text-white py-3 rounded-lg font-bold">Buy PIN</button>
        </div>
      </div>
    </div>
  );
}
