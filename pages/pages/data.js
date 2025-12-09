import { useState } from 'react';

export default function Data() {
  const [network] = useState('MTN');

  const plans = [
    { size: '1GB', price: '₦450', validity: '30 days' },
    { size: '2GB', price: '₦900', validity: '30 days' },
    { size: '5GB', price: '₦2,250', validity: '30 days' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-4xl font-bold text-primary mb-8">Buy Data</h1>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow p-8">
          <select className="w-full p-4 border mb-6 text-black text-lg">
            <option>MTN</option><option>Glo</option><option>Airtel</option><option>9mobile</option>
          </select>
          <input placeholder="Phone Number" className="w-full p-4 border mb-6 text-black" />
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map(p => (
              <div key={p.size} className="bg-gray-50 p-6 rounded-lg text-center">
                <p className="text-3xl font-bold text-accent">{p.size}</p>
                <p className="text-2xl font-bold">{p.price}</p>
                <p className="text-gray-600">{p.validity}</p>
                <button className="mt-4 bg-primary text-white w-full py-3 rounded-lg font-bold">
                  Buy Now
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
