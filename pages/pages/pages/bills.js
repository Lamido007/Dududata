export default function Bills() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-4xl font-bold text-primary mb-8">Pay Bills</h1>
      <div className="max-w-2xl mx-auto grid gap-6 md:grid-cols-2">
        {['Electricity', 'DSTV/GOTV', 'Startimes', 'WAEC/NECO'].map(item => (
          <div key={item} className="bg-white p-8 rounded-xl shadow text-center">
            <h3 className="text-2xl font-bold mb-4">{item}</h3>
            <button className="bg-accent text-white px-8 py-3 rounded-lg">Pay Now</button>
          </div>
        ))}
      </div>
    </div>
  )
}
