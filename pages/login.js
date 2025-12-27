import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  the [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)

  const handleAuth = async () => {
    setLoading(true)
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
    else alert(isSignUp ? 'Registered!' : 'Logged in!')
    setLoading(false)
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">{isSignUp ? 'Register' : 'Login'}</h1>
      <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 mb-4 border rounded text-black" />
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 mb-6 border rounded text-black" />
      <button onClick={handleAuth} disabled={loading} className="w-full bg-accent text-white py-3 rounded font-bold">
        {loading ? 'Loading...' : isSignUp ? 'Register' : 'Login'}
      </button>
      <p className="text-center mt-4">
        {isSignUp ? 'Have account?' : 'No account?'}{' '}
        <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="text-primary font-bold">
          {isSignUp ? 'Login' : 'Register'}
        </button>
      </p>
    </div>
  )
}
