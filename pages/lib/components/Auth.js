import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Auth({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)

  const handleAuth = async () => {
    setLoading(true)
    const { error } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password })

    if (error) alert(error.message)
    else {
      alert(isSignUp ? 'Check your email for confirmation!' : 'Logged in!')
      onLogin()
    }
    setLoading(false)
  }

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6">{isSignUp ? 'Register' : 'Login'}</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-3 mb-4 border rounded text-black"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full p-3 mb-6 border rounded text-black"
      />
      <button
        onClick={handleAuth}
        disabled={loading}
        className="w-full bg-accent text-white py-3 rounded font-bold"
      >
        {loading ? 'Loading...' : isSignUp ? 'Register' : 'Login'}
      </button>
      <p className="text-center mt-4">
        {isSignUp ? 'Already have account?' : "Don't have account?"}{' '}
        <button onClick={() => setIsSignUp(!isSignUp)} className="text-primary font-bold">
          {isSignUp ? 'Login' : 'Register'}
        </button>
      </p>
    </div>
  )
    }
