import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  return (
    <>
      <Head>
        <title>DuduData - Cheapest Data, Airtime & Bills in Nigeria</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-primary to-blue-900 text-white">
        <nav className="flex justify-between items-center p-6">
          <div className="flex items-center space-x-3">
            <Image src="/logo.svg" alt="DuduData" width={60} height={60} />
            <h1 className="text-3xl font-bold">DuduData</h1>
          </div>
          <a href="https://wa.me/2348106650796" className="bg-accent px-6 py-3 rounded-full font-bold hover:bg-green-600">
            Chat on WhatsApp
          </a>
        </nav>

        <main className="text-center pt-20 px-6">
          <h2 className="text-5xl font-bold mb-6">Cheapest Data, Airtime & Bills in Nigeria</h2>
          <p className="text-xl mb-12">MTN • Glo • Airtel • 9mobile • Electricity • DSTV • WAEC/NECO</p>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Link href="/data" className="bg-white text-primary p-10 rounded-2xl shadow-2xl hover:scale-105 transition">
              <h3 className="text-3xl font-bold mb-4">Buy Data</h3>
              <p className="text-5xl font-bold text-accent">From ₦75/GB</p>
            </Link>
            <Link href="/airtime" className="bg-white text-primary p-10 rounded-2xl shadow-2xl hover:scale-105 transition">
              <h3 className="text-3xl font-bold mb-4">Airtime VTU</h3>
              <p className="text-5xl font-bold text-accent">Up to 5% Off</p>
            </Link>
            <Link href="/bills" className="bg-white text-primary p-10 rounded-2xl shadow-2xl hover:scale-105 transition">
              <h3 className="text-3xl font-bold mb-4">Pay Bills</h3>
              <p className="text-5xl font-bold text-accent">Instant Delivery</p>
            </Link>
          </div>

          <div className="mt-16 bg-white text-primary p-10 rounded-2xl max-w-2xl mx-auto">
            <h3 className="text-3xl font-bold mb-4">Refer & Earn ₦100 Instantly!</h3>
            <p className="text-xl">Both you and your friend get ₦100 when they sign up</p>
          </div>
        </main>
      </div>
    </>
  )
}
