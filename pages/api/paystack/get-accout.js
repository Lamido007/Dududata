import { createClient } from '@supabase/supabase-js'

// Use SERVICE ROLE key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { userId } = req.query
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' })
    }

    // Get virtual account
    const { data: account, error: accountError } = await supabaseAdmin
      .from('user_virtual_accounts')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (accountError && accountError.code !== 'PGRST116') {
      throw accountError
    }

    // Get recent transactions
    let transactions = []
    if (account) {
      const { data: txData } = await supabaseAdmin
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10)
      
      transactions = txData || []
    }

    res.status(200).json({
      success: true,
      account: account || null,
      transactions: transactions,
      message: account ? 'Account found' : 'No virtual account created yet'
    })

  } catch (error) {
    console.error('Error fetching account:', error)
    res.status(500).json({ 
      error: 'Failed to fetch account details',
      details: error.message 
    })
  }
        }
