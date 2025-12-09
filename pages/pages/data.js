import { useState } from 'react';

export default function Data() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-blue-900 text-white p-8">
      <h1 className="text-5xl font-bold text-center mb-10">Buy Data Plans</h1>
      <div className="max-w-2xl mx-auto bg-white text-gray-800 rounded-2xl p-8 shadow-2xl">
        <select className="w-full p-4 mb-6 border-2 border-gray-300 rounded-lg text-lg">
          <option>MTN</option>
          <option>Glo</option>
          <option>Airtel</option>
          <option>9mobile</option>
        </select>
        <input placeholder="Enter Phone Number" className="w-full p-4 mb-8 border-2 border-gray-300 rounded-lg text-lg" />
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-gray-100 p-6 rounded-xl text-center">
            <p className="text-3xl font-bold text-accent">1GB</p>
            <p className="text-2xl font-bold">₦450</p>
            <button className="mt-4 bg-primary text-white w-full py-3 rounded-lg font-bold">Buy Now</button>
          </div>
          <div className="bg-gray-100 p-6 rounded-xl text-center">
            <p className="text-3xl font-bold text-accent">2GB</p>
            <p className="text-2xl font-bold">₦900</p>
            <button className="mt-4 bg-primary text-white w-full py-3 rounded-lg font-bold">Buy Now</button>
          </div>
          <div className="bg-gray-100 p-6 rounded-xl text-center">
            <p className="text-3xl font-bold text-accent">5GB</p>
            <p className="text-2xl font-bold">₦2,250</p>
            <button className="mt-4 bg-primary text-white w-full py-3 rounded-lg font-bold">Buy Now</button>
          </div>
          <div className="bg-gray-100 p-6 rounded-xl text-center">
            <p className="text-3xl font-bold text-accent">10GB</p>
            <p className="text-2xl font-bold">₦4,400</p>
            <button className="mt-4 bg-primary text-white w-full py-3 rounded-lg font-bold">Buy Now</button>
          </div>
        </div>
      </div>
    </div>
  );
}
