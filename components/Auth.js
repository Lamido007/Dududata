import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { getSupabase } from '../lib/supabaseClient'

export default function Auth({ onSuccess }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [referralCode, setReferralCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    // Check for referral code in URL
    const ref = router.query.ref
    if (ref) {
      setReferralCode(ref)
      setIsSignUp(true)
    }
  }, [router.query])

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const handleAuth = async (e) => {
    if (e) e.preventDefault()
    
    // Clear previous messages
    setError('')
    setSuccess('')

    // Validation
    if (!email || !password) {
      setError('Please enter both email and password')
      return
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    // Password confirmation check for signup
    if (isSignUp) {
      if (!confirmPassword) {
        setError('Please confirm your password')
        return
      }
      
      if (password !== confirmPassword) {
        setError('Passwords do not match! Please check and try again.')
        return
      }
    }

    setLoading(true)

    try {
      const supabase = getSupabase()

      if (!supabase) {
        setError('Unable to connect to authentication service')
        setLoading(false)
        return
      }

      if (isSignUp) {
        // Sign up the user
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            emailRedirectTo: window.location.origin + '/dashboard'
          }
        })
        
        if (signUpError) {
          setError(signUpError.message)
          setLoading(false)
          return
        }

        if (signUpData.user) {
          // Check if referral code exists and get referrer ID
          let referrerId = null
          if (referralCode) {
            const { data: referrerData } = await supabase
              .from('profiles')
              .select('id')
              .eq('referral_code', referralCode.toUpperCase())
              .single()

            if (referrerData) {
              referrerId = referrerData.id
            }
          }

          // Manually create profile if trigger doesn't work
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              {
                id: signUpData.user.id,
                wallet_balance: 0,
                referred_by: referrerId
              }
            ])
            .select()

          if (profileError) {
            console.error('Profile creation error:', profileError)
            // Don't show error to user, profile might already exist
          }

          setSuccess('Account created successfully! You can now login.')
          
          // Clear form
          setEmail('')
          setPassword('')
          setConfirmPassword('')
          setReferralCode('')
          
          // Switch to login after 2 seconds
          setTimeout(() => {
            setIsSignUp(false)
            setSuccess('')
          }, 2000)
        }
      } else {
        // Sign in
        const { data, error: signInError } = await supabase.auth.signInWithPassword({ 
          email, 
          password 
        })
        
        if (signInError) {
          setError(signInError.message)
        } else if (data.user) {
          // Check if profile exists, if not create it
          const { data: profileData, error: profileCheckError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single()

          if (profileCheckError || !profileData) {
            // Create profile if it doesn't exist
            await supabase
              .from('profiles')
              .insert([
                {
                  id: data.user.id,
                  wallet_balance: 0
                }
              ])
          }

          setSuccess('Login successful! Redirecting...')
          setTimeout(() => {
            if (onSuccess) onSuccess()
          }, 500)
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      console.error('Auth error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleAuth()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-gray-600">
            {isSignUp ? 'Sign up to get started with DuduData' : 'Sign in to your account'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded">
            <p className="text-red-700 text-sm font-medium">⚠️ {error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 rounded">
            <p className="text-green-700 text-sm font-medium">✅ {success}</p>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password {isSignUp && '(minimum 6 characters)'}
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              required
              minLength={6}
            />
          </div>

          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
                autoComplete="new-password"
                required={isSignUp}
                minLength={6}
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="text-red-500 text-xs mt-1">❌ Passwords do not match</p>
              )}
              {confirmPassword && password === confirmPassword && (
                <p className="text-green-500 text-xs mt-1">✅ Passwords match</p>
              )}
            </div>
          )}

          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Referral Code (Optional)
              </label>
              <input
                type="text"
                placeholder="Enter referral code"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                disabled={loading}
                maxLength={8}
              />
              <p className="text-xs text-gray-500 mt-1">
                Have a referral code? Enter it to give your referrer a commission!
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (isSignUp && password !== confirmPassword)}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold text-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isSignUp ? 'Creating Account...' : 'Signing In...'}
              </span>
            ) : (
              isSignUp ? 'Create Account' : 'Sign In'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError('')
                setSuccess('')
                setPassword('')
                setConfirmPassword('')
              }}
              className="text-blue-600 font-semibold hover:text-blue-700 hover:underline focus:outline-none"
              disabled={loading}
            >
              {isSignUp ? 'Sign in here' : 'Create one here'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
