import { createClient } from '@supabase/supabase-js'

// Create admin client with service role key
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

    // Get user's virtual account
    const { data: account, error: accountError } = await supabaseAdmin
      .from('user_virtual_accounts')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (accountError) {
      // If no account found, return empty response
      if (accountError.code === 'PGRST116') {
        return res.status(200).json({
          success: true,
          account: null,
          transactions: [],
          message: 'No virtual account found'
        })
      }
      throw accountError
    }

    // Get recent transactions for this user
    const { data: transactions, error: txError } = await supabaseAdmin
      .from('wallet_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)

    if (txError) {
      console.error('Error fetching transactions:', txError)
      // Continue with account data even if transactions fail
    }

    // Format response
    const response = {
      success: true,
      account: {
        id: account.id,
        account_number: account.account_number,
        account_name: account.account_name,
        bank_name: account.bank_name,
        balance: account.balance,
        currency: account.currency,
        is_active: account.is_active,
        created_at: account.created_at
      },
      transactions: transactions || [],
      summary: {
        total_deposits: calculateTotalDeposits(transactions),
        total_withdrawals: calculateTotalWithdrawals(transactions),
        recent_activity: transactions?.length || 0
      }
    }

    res.status(200).json(response)

  } catch (error) {
    console.error('Error in get-account API:', error)
    res.status(500).json({ 
      error: 'Failed to fetch account details',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

// Helper functions
function calculateTotalDeposits(transactions) {
  if (!transactions) return 0
  return transactions
    .filter(tx => tx.transaction_type === 'deposit' && tx.status === 'success')
    .reduce((sum, tx) => sum + parseFloat(tx.amount), 0)
}

function calculateTotalWithdrawals(transactions) {
  if (!transactions) return 0
  return transactions
    .filter(tx => tx.transaction_type === 'withdrawal' && tx.status === 'success')
    .reduce((sum, tx) => sum + parseFloat(tx.amount), 0)
    }
