import { createClient } from '@supabase/supabase-js'

/**
 * Verify Paystack reference with Paystack API, then finalize the pending transaction:
 * - Ensure transaction exists and is pending
 * - If transaction has a user_id, require Authorization: Bearer <access_token> and ensure it matches tx.user_id
 * - Call Paystack verify endpoint with server-side secret key
 * - If successful and amounts match, update transaction to 'completed' and increment user's wallet balance
 *
 * Environment required:
 * - SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 * - PAYSTACK_SECRET_KEY
 *
 * Optional (recommended):
 * - A Postgres RPC named increment_wallet_balance(uid uuid, amt numeric) for atomic increments.
 */

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !PAYSTACK_SECRET_KEY) {
  console.error('Missing server env vars for verify-transaction')
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
})

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  try {
    const { reference } = req.body
    if (!reference) return res.status(400).json({ message: 'Missing reference' })

    // 1) Fetch transaction record
    const { data: tx, error: txError } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .eq('reference', reference)
      .limit(1)
      .single()

    if (txError || !tx) {
      console.error('Transaction lookup error:', txError)
      return res.status(404).json({ message: 'Transaction not found' })
    }

    // If already completed, return current balance
    if (tx.status === 'completed') {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('wallet_balance')
        .eq('id', tx.user_id)
        .single()

      return res.status(200).json({ success: true, new_balance: profile?.wallet_balance ?? null, message: 'Already completed' })
    }

    // If transaction tied to a user, require auth and verify caller matches the tx.user_id
    if (tx.user_id) {
      const authHeader = req.headers.authorization || ''
      const accessToken = authHeader.split(' ')[1] || null
      if (!accessToken) {
        return res.status(401).json({ message: 'Authentication required to verify this transaction' })
      }
      const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(accessToken)
      if (userError || !userData?.user || userData.user.id !== tx.user_id) {
        console.warn('Auth token does not match transaction owner')
        return res.status(403).json({ message: 'Forbidden: token does not match transaction owner' })
      }
    }

    // 2) Verify with Paystack (server-side secret)
    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    })
    const verifyJson = await verifyRes.json()

    if (!verifyJson || !verifyJson.status || verifyJson.data?.status !== 'success') {
      console.error('Paystack verification failed:', verifyJson)
      // Mark as failed for auditing
      await supabaseAdmin.from('transactions').update({ status: 'failed', paystack_response: verifyJson }).eq('reference', reference)
      return res.status(400).json({ success: false, message: 'Payment not successful' })
    }

    // 3) Ensure amounts match (Paystack returns amount in kobo)
    const paidAmountKobo = verifyJson.data.amount
    const expectedKobo = (tx.amount || 0) * 100
    if (paidAmountKobo !== expectedKobo) {
      console.warn('Amount mismatch: expected', expectedKobo, 'got', paidAmountKobo)
      await supabaseAdmin.from('transactions').update({ status: 'disputed', paystack_response: verifyJson }).eq('reference', reference)
      return res.status(400).json({ success: false, message: 'Amount mismatch' })
    }

    // 4) Finalize: update transaction status and increment wallet balance
    const userId = tx.user_id
    if (!userId) {
      // No user attached — mark completed, but no balance update
      await supabaseAdmin.from('transactions').update({ status: 'completed', paystack_response: verifyJson }).eq('reference', reference)
      return res.status(200).json({ success: true, new_balance: null, message: 'Transaction completed for anonymous user' })
    }

    // Try to perform atomic increment via RPC if available
    let newBalance = null
    try {
      // If you created an RPC named increment_wallet_balance(uid, amt) in Postgres, this will call it.
      const { data: rpcResult, error: rpcError } = await supabaseAdmin.rpc('increment_wallet_balance', {
        uid: userId,
        amt: tx.amount
      })
      if (!rpcError && rpcResult) {
        // rpcResult may be an array or scalar depending on function — handle both
        if (Array.isArray(rpcResult) && rpcResult.length > 0) newBalance = rpcResult[0].wallet_balance ?? rpcResult[0]
        else if (typeof rpcResult === 'object' && rpcResult !== null) newBalance = rpcResult.wallet_balance ?? Object.values(rpcResult)[0]
        else newBalance = rpcResult
      } else {
        // RPC not available or failed — fall back to read/update
        throw rpcError || new Error('RPC not available')
      }
    } catch (rpcErr) {
      // Fallback (non-atomic): read -> update
      console.warn('RPC increment failed or not available, falling back to read/update:', rpcErr?.message || rpcErr)

      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('wallet_balance')
        .eq('id', userId)
        .single()

      if (profileError) {
        console.error('Profile lookup error:', profileError)
        return res.status(500).json({ success: false, message: 'Failed to read user profile' })
      }

      const currentBalance = profile?.wallet_balance ?? 0
      newBalance = currentBalance + tx.amount

      const { error: updateProfileError } = await supabaseAdmin
        .from('profiles')
        .update({ wallet_balance: newBalance })
        .eq('id', userId)

      if (updateProfileError) {
        console.error('Failed to update profile balance:', updateProfileError)
        return res.status(500).json({ success: false, message: 'Failed to update balance' })
      }
    }

    // Update transaction status and record Paystack response
    const { error: updateTxError } = await supabaseAdmin
      .from('transactions')
      .update({ status: 'completed', paystack_response: verifyJson })
      .eq('reference', reference)

    if (updateTxError) {
      console.error('Failed to update transaction status:', updateTxError)
      // Continue — balance updated; log for admin investigation
    }

    // Insert notification (best-effort)
    try {
      await supabaseAdmin.from('notifications').insert([
        {
          user_id: userId,
          title: 'Wallet Funded Successfully! 💰',
          message: `Your wallet has been funded with ₦${tx.amount.toLocaleString()}. New balance: ₦${(newBalance ?? '').toLocaleString()}.`,
          type: 'success'
        }
      ])
    } catch (nErr) {
      console.warn('Failed to create notification:', nErr)
    }

    return res.status(200).json({ success: true, new_balance: newBalance })
  } catch (err) {
    console.error('verify-transaction error:', err)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
}