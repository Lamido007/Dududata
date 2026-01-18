import { createClient } from '@supabase/supabase-js'

/**
 * Create a pending transaction and return a unique reference and the public Paystack key.
 *
 * Notes:
 * - This endpoint accepts Authorization: Bearer <access_token> (recommended).
 * - The server uses SUPABASE_SERVICE_ROLE_KEY to write to the transactions table.
 * - Ensure SUPABASE_SERVICE_ROLE_KEY is set in your environment (server only).
 * - Ensure NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY is also set so we can return the public key to the client.
 */

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase server env vars')
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
})

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  try {
    const { amount } = req.body
    const parsed = parseInt(amount, 10)
    if (!parsed || parsed < 100) {
      return res.status(400).json({ message: 'Invalid amount. Minimum is 100' })
    }

    // Identify user (recommended)
    const authHeader = req.headers.authorization || ''
    const accessToken = authHeader.split(' ')[1] || null

    let userId = null
    if (accessToken) {
      // getUser(token) returns the user tied to the token
      const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(accessToken)
      if (userError || !userData?.user) {
        console.warn('Could not validate access token for create-transaction:', userError?.message || 'no user')
      } else {
        userId = userData.user.id
      }
    } else {
      // Optionally require authentication by returning 401 here.
      // return res.status(401).json({ message: 'Authentication required' })
      console.warn('Creating pending transaction without authenticated user')
    }

    // Generate unique reference
    const reference = `dududata_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`

    // Insert pending transaction
    const insertPayload = {
      user_id: userId,
      type: 'funding',
      amount: parsed,
      status: 'pending',
      reference,
      created_at: new Date().toISOString()
    }

    const { error: insertError } = await supabaseAdmin.from('transactions').insert([insertPayload])

    if (insertError) {
      console.error('Failed to create pending transaction:', insertError)
      return res.status(500).json({ message: 'Failed to create transaction' })
    }

    // Return reference and Paystack public key for client checkout
    return res.status(200).json({
      reference,
      paystack_public_key: PAYSTACK_PUBLIC_KEY || ''
    })
  } catch (err) {
    console.error('create-transaction error:', err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}