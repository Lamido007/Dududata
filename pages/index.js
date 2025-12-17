import Head from 'next/head'

export default function Home() {
  return (
    <>
      <Head>
        <title>DuduData - Cheapest Data, Airtime & Bills in Nigeria</title>
        <meta name="description" content="Cheapest Data, Airtime VTU, Electricity, Cable TV, Betting Funding & Exam PINs in Nigeria" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-primary to-blue-900 text-white">
        <nav className="flex justify-between items-center p-6 max-w-6xl mx-auto">
          <div className="flex items-center space-x-4">
            <div className="bg-white text-primary w-16 h-16 rounded-full flex items-center justify-center text-3xl font-bold">
              DD
            </div>
            <h1 className="text-4xl font-bold">DuduData</h1>
          </div>
          <a 
            href="https://wa.me/2348106650796" 
            className="bg-accent px-8 py-4 rounded-full text-xl font-bold hover:bg-green-600 transition"
          >
            Chat on WhatsApp
          </a>
        </nav>

        <main className="text-center px-6 py-12">
          <h2 className="text-5xl md:text-6xl font-bold mb-8">
            Cheapest Data & Airtime in Nigeria
          </h2>
          <p className="text-xl md:text-2xl mb-16 opacity-90">
            Instant delivery • Lowest prices • 24/7 support
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-20">
            <a 
              href="/data" 
              className="bg-white text-primary p-10 rounded-3xl shadow-2xl hover:scale-105 transition transform"
            >
              <h3 className="text-3xl font-bold mb-6">Buy Data</h3>
              <p className="text-5xl font-bold text-accent mb-4">From ₦75/GB</p>
              <p className="text-lg opacity-80">MTN • Glo • Airtel • 9mobile</p>
            </a>

            <a 
              href="/airtime" 
              className="bg-white text-primary p-10 rounded-3xl shadow-2xl hover:scale-105 transition transform"
            >
              <h3 className="text-3xl font-bold mb-6">Airtime VTU</h3>
              <p className="text-5xl font-bold text-accent mb-4">Up to 5% Off</p>
              <p className="text-lg opacity-80">All networks • Instant credit</p>
            </a>

            <a 
              href="/bills" 
              className="bg-white text-primary p-10 rounded-3xl shadow-2xl hover:scale-105 transition transform"
            >
              <h3 className="text-3xl font-bold mb-6">Pay Bills</h3>
              <p className="text-5xl font-bold text-accent mb-4">Instant Delivery</p>
              <p className="text-lg opacity-80">Electricity • DSTV • Betting • Exam PINs</p>
            </a>
          </div>

          <div className="text-center">
            <a 
              href="/dashboard" 
              className="bg-white text-primary px-10 py-5 rounded-full text-2xl font-bold hover:scale-105 transition inline-block"
            >
              Login / My Wallet
            </a>
            <p className="mt-6 text-xl opacity-90">
              New users get ₦100 bonus on first funding!
            </p>
          </div>
        </main>
      </div>
    </>
  )
    }
