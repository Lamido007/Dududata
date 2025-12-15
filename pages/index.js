import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  return (
    <>
      <Head>
        <title>DuduData - Cheapest Data & Airtime in Nigeria</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-primary to-blue-900 text-white">
        <nav className="flex justify-between items-center p-6">
          <div className="flex items-center space-x-3">
            <Image src="/logo.svg" alt="DuduData" width={60} height={60} />
            <h1 className="text-3xl font-bold">DuduData</h1>
          </div>
          <a href="https://wa.me/2348106650796" className="bg-green-500 px-6 py-3 rounded-full font-bold">
            WhatsApp Chat
          </a>
        </nav>
        <main className="text-center pt-20 px-6">
          <h2 className="text-5xl font-bold mb-6">Cheapest Data & Airtime in Nigeria</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-12">
            <Link href="/data" className="bg-white text-primary p-10 rounded-2xl shadow-2xl">
              <h3 className="text-3xl font-bold mb-4">Buy Data</h3>
              <p className="text-5xl font-bold text-green-500">From ₦75</p>
            </Link>
            <Link href="/airtime" className="bg-white text-primary p-10 rounded-2xl shadow-2xl">
              <h3 className="text-3xl font-bold mb-4">Airtime VTU</h3>
              <p className="text-5xl font-bold text-green-500">5% Off</p>
            </Link>
            <Link href="/bills" className="bg-white text-primary p-10 rounded-2xl shadow-2xl">
              <h3 className="text-3xl font-bold mb-4">Pay Bills</h3>
              <p className="text-5xl font-bold text-green-500">Instant</p>
            </Link>
          </div>
        </main>
               <div className="text-center mt-12">
        <a href="/dashboard" className="bg-accent text-white px-8 py-4 rounded-full text-xl font-bold hover:bg-green-600">
          Login / View Wallet
        </a>
        <p className="mt-4 text-lg">New user? Register inside</p>
      </div>
      </div>
    </>
  )
    }
