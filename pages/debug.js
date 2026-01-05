import { getSupabase } from '../lib/supabaseClient'

export default function DebugPage() {
  const supabase = getSupabase()

  const checkEnvVars = () => {
    return {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'MISSING',
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
        ? `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}...` 
        : 'MISSING',
      supabaseUrlLength: process.env.NEXT_PUBLIC_SUPABASE_URL?.length || 0,
      supabaseKeyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
      supabaseClient: supabase ? 'INITIALIZED' : 'NULL',
      nodeEnv: process.env.NODE_ENV,
      isClient: typeof window !== 'undefined'
    }
  }

  const envCheck = checkEnvVars()

  const testConnection = async () => {
    if (!supabase) {
      alert('❌ Supabase client is NULL')
      return
    }

    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) {
        alert('❌ Error: ' + error.message)
      } else {
        alert('✅ Connection successful!')
      }
    } catch (err) {
      alert('❌ Exception: ' + err.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">🔍 Environment Debug</h1>

        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Environment Variables</h2>
          <div className="space-y-2 font-mono text-sm">
            <div className={`p-3 rounded ${envCheck.supabaseUrl !== 'MISSING' ? 'bg-green-900' : 'bg-red-900'}`}>
              <div className="font-bold">NEXT_PUBLIC_SUPABASE_URL:</div>
              <div>{envCheck.supabaseUrl}</div>
              <div className="text-xs text-gray-400">Length: {envCheck.supabaseUrlLength}</div>
            </div>

            <div className={`p-3 rounded ${envCheck.supabaseKey !== 'MISSING' ? 'bg-green-900' : 'bg-red-900'}`}>
              <div className="font-bold">NEXT_PUBLIC_SUPABASE_ANON_KEY:</div>
              <div>{envCheck.supabaseKey}</div>
              <div className="text-xs text-gray-400">Length: {envCheck.supabaseKeyLength}</div>
            </div>

            <div className={`p-3 rounded ${envCheck.supabaseClient === 'INITIALIZED' ? 'bg-green-900' : 'bg-red-900'}`}>
              <div className="font-bold">Supabase Client:</div>
              <div>{envCheck.supabaseClient}</div>
            </div>

            <div className="p-3 rounded bg-gray-700">
              <div className="font-bold">Environment:</div>
              <div>NODE_ENV: {envCheck.nodeEnv}</div>
              <div>Is Client: {envCheck.isClient ? 'Yes' : 'No'}</div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Test Connection</h2>
          <button
            onClick={testConnection}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-bold"
          >
            Test Supabase Connection
          </button>
        </div>

        <div className="bg-yellow-900 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">⚠️ Common Issues</h2>
          <ul className="space-y-2 text-sm">
            <li>✓ Variables must start with <code className="bg-gray-700 px-2 py-1 rounded">NEXT_PUBLIC_</code></li>
            <li>✓ Supabase URL should start with <code className="bg-gray-700 px-2 py-1 rounded">https://</code></li>
            <li>✓ Anon key should be around 200+ characters (JWT token)</li>
            <li>✓ After changing env vars, you MUST redeploy in Vercel</li>
            <li>✓ Env vars must be set for Production, Preview, AND Development</li>
          </ul>
        </div>

        <div className="mt-6 text-center">
          <a 
            href="/login"
            className="text-blue-400 hover:text-blue-300 underline"
          >
            ← Back to Login
          </a>
        </div>
      </div>
    </div>
  )
      }
