export default async function handler(req, res) {
  try {
    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
    
    if (!PAYSTACK_SECRET_KEY) {
      return res.status(500).json({ 
        error: 'PAYSTACK_SECRET_KEY is missing in environment variables'
      });
    }
    
    // Test Paystack API connection
    const response = await fetch('https://api.paystack.co/bank', {
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`
      }
    });
    
    const data = await response.json();
    
    res.status(200).json({
      hasPaystackKey: !!PAYSTACK_SECRET_KEY,
      paystackKeyPrefix: PAYSTACK_SECRET_KEY ? PAYSTACK_SECRET_KEY.substring(0, 10) + '...' : 'none',
      paystackApiStatus: response.status,
      message: data.message || 'Test completed'
    });
    
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      hasPaystackKey: !!process.env.PAYSTACK_SECRET_KEY
    });
  }
}
