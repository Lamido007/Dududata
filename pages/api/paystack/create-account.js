import { createClient } from '@supabase/supabase-js'

// Use SERVICE ROLE key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { userId } = req.body
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' })
    }

    // Check if account already exists
    const { data: existingAccount } = await supabaseAdmin
      .from('user_virtual_accounts')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (existingAccount) {
      return res.status(200).json({
        success: true,
        message: 'Account already exists',
        account: existingAccount
      })
    }

    // Get user details from Supabase Auth
    const { data: user, error: userError } = await supabaseAdmin
      .auth.admin.getUserById(userId)

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const userEmail = user.user.email
    const firstName = user.user.user_metadata?.first_name || user.user.email.split('@')[0]
    const lastName = user.user.user_metadata?.last_name || 'User'
    const phone = user.user.user_metadata?.phone || ''

    // Create Paystack customer
    const customer = await createPaystackCustomer({
      email: userEmail,
      first_name: firstName,
      last_name: lastName,
      phone: phone
    })

    // Create dedicated virtual account
    const virtualAccount = await createPaystackVirtualAccount(customer.customer_code)

    // Save to database
    const { data: account, error: dbError } = await supabaseAdmin
      .from('user_virtual_accounts')
      .insert({
        user_id: userId,
        paystack_customer_code: customer.customer_code,
        paystack_customer_id: customer.id,
        account_number: virtualAccount.account_number,
        account_name: virtualAccount.account_name,
        bank_name: virtualAccount.bank.name,
        bank_code: virtualAccount.bank.id,
        balance: 0.00
      })
      .select()
      .single()

    if (dbError) {
      throw dbError
    }

    res.status(200).json({
      success: true,
      message: 'Paystack virtual account created successfully',
      account: {
        account_number: account.account_number,
        account_name: account.account_name,
        bank_name: account.bank_name,
        customer_code: account.paystack_customer_code,
        balance: account.balance
      }
    })

  } catch (error) {
    console.error('Error creating Paystack account:', error)
    res.status(500).json({ 
      error: 'Failed to create virtual account',
      details: error.message 
    })
  }
}

async function createPaystackCustomer(customerData) {
  const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY
  
  const response = await fetch('https://api.paystack.co/customer', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`
    },
    body: JSON.stringify(customerData)
  })

  const data = await response.json()
  
  if (!data.status) {
    throw new Error(data.message || 'Failed to create Paystack customer')
  }

  return data.data
}

async function createPaystackVirtualAccount(customerCode) {
  const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY
  
  const response = await fetch('https://api.paystack.co/dedicated_account', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`
    },
    body: JSON.stringify({
      customer: customerCode,
      preferred_bank: "wema-bank"
    })
  })

  const data = await response.json()
  
  if (!data.status) {
    throw new Error(data.message || 'Failed to create virtual account')
  }

  return data.data
      }
