cat > pages/api/paystack/webhook.js << 'EOF'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Verify Paystack signature
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest('hex')
    
    if (hash !== req.headers['x-paystack-signature']) {
      return res.status(401).json({ error: 'Invalid signature' })
    }

    const event = req.body
    console.log('Paystack webhook event:', event.event)

    // Handle different events
    switch (event.event) {
      case 'charge.success':
        await handleSuccessfulCharge(event.data)
        break
        
      case 'transfer.success':
        await handleSuccessfulTransfer(event.data)
        break
        
      case 'dedicated_account.assign.success':
        await handleDedicatedAccountAssigned(event.data)
        break
        
      case 'dedicated_account.update':
        await handleDedicatedAccountUpdate(event.data)
        break
        
      default:
        console.log(`Unhandled event type: ${event.event}`)
    }

    res.status(200).json({ received: true })
    
  } catch (error) {
    console.error('Webhook error:', error)
    res.status(500).json({ error: error.message })
  }
}

async function handleSuccessfulCharge(chargeData) {
  // Find user by customer code
  const { data: account } = await supabaseAdmin
    .from('user_virtual_accounts')
    .select('user_id, balance')
    .eq('paystack_customer_code', chargeData.customer.customer_code)
    .single()

  if (!account) {
    console.error('Account not found for customer:', chargeData.customer.customer_code)
    return
  }

  const amountInNaira = chargeData.amount / 100
  
  // Update balance
  const newBalance = parseFloat(account.balance) + amountInNaira
  
  await supabaseAdmin
    .from('user_virtual_accounts')
    .update({ 
      balance: newBalance, 
      updated_at: new Date().toISOString() 
    })
    .eq('paystack_customer_code', chargeData.customer.customer_code)

  // Record transaction
  await supabaseAdmin
    .from('wallet_transactions')
    .insert({
      user_id: account.user_id,
      amount: amountInNaira,
      transaction_type: 'deposit',
      status: 'success',
      reference: chargeData.reference,
      paystack_reference: chargeData.id,
      description: `Deposit: ${chargeData.message || 'Payment received'}`,
      metadata: chargeData
    })

  console.log(`Deposited ₦${amountInNaira} for user ${account.user_id}`)
}

async function handleDedicatedAccountAssigned(accountData) {
  await supabaseAdmin
    .from('user_virtual_accounts')
    .update({
      account_number: accountData.account_number,
      account_name: accountData.account_name,
      bank_name: accountData.bank.name,
      bank_code: accountData.bank.id,
      is_active: accountData.active
    })
    .eq('paystack_customer_code', accountData.customer.customer_code)
}
EOF
