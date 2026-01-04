import { useState } from 'react'
import { getSupabase } from '../lib/supabaseClient'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)

  the handleAuth = async () => {
    if (!email || !password) {
      alert('Enter email and password')
      return
    }

    setLoading(true)

    const supabase = getSupabase()

    let error
    if (isSignUp) {
      const { error: signUpError } = await supabase.auth.signUp({ email, password })
      error = signUpError
      if (!error) alert('Check email for confirmation!')
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      error = signInError
    }

    if (error) alert(error.message)
    else {
      alert(isSignUp ? 'Registered!' : 'Logged in!')
      window.location.href = '/dashboard' // Redirect to dashboard
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-center mb-8 text-primary">
          {isSignUp ? 'Register' : 'Login'}
        </h2>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-4 mb-4 border rounded text-black" disabled={loading} />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-4 mb-6 border rounded text-black" disabled={loading} />
        <button onClick={handleAuth} disabled={loading} className="w-full bg-accent text-white py-4 rounded font-bold">
          {loading ? 'Loading...' : isSignUp ? 'Register' : 'Login'}
        </button>
        <p className="text-center mt-6">
          {isSignUp ? 'Have account?' : 'No account?'}{' '}
          <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="text-primary font-bold">
            {isSignUp ? 'Login' : 'Register'}
          </button>
        </p>
      </div>
    </div>
  )
        }
