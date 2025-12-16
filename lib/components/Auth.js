import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Auth({ onSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)

  const handleAuth = async () => {
    if (!email || !password) {
      alert('Please enter email and password')
      return
    }

    setLoading(true)

    let error
    if (isSignUp) {
      const { error: signUpError } = await supabase.auth.signUp({ email, password })
      error = signUpError
      if (!error) alert('Check your email for confirmation link!')
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      error = signInError
    }

    if (error) {
      alert(error.message)
    } else {
      if (onSuccess) onSuccess()
      alert(isSignUp ? 'Account created!' : 'Logged in successfully!')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-center mb-8 text-primary">
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h2>

        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-4 mb-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-accent"
          disabled={loading}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-4 mb-6 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-accent"
          disabled={loading}
        />

        <button
          onClick={handleAuth}
          disabled={loading}
          className="w-full bg-accent text-white py-4 rounded-lg font-bold text-xl hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? 'Loading...' : isSignUp ? 'Register' : 'Login'}
        </button>

        <p className="text-center mt-6 text-gray-600">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-primary font-bold hover:underline"
            disabled={loading}
          >
            {isSignUp ? 'Login' : 'Register'}
          </button>
        </p>
      </div>
    </div>
  )
        }
