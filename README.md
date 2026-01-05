DuduData - VTU Platform
A modern, full-featured Virtual Top-Up (VTU) platform for buying data bundles, airtime, and paying bills in Nigeria.
🚀 Features
✅ User Authentication - Secure signup/login with Supabase
📱 Data Bundles - MTN, Airtel, Glo, 9mobile
📞 Airtime Purchase - All networks with discounts
💡 Bill Payments - Electricity & Cable TV
💰 Wallet System - Secure wallet with Paystack integration
📊 Transaction History - Complete transaction tracking
🎨 Modern UI - Beautiful, responsive design
📋 Prerequisites
Node.js 16+ installed
Supabase account
Paystack account (for payments)
Vercel account (for deployment)
🛠️ Setup Instructions
1. Clone the Repository
git clone https://github.com/Lamid007/Dududata.git
cd Dududata
2. Install Dependencies
npm install
3. Set Up Supabase
Go to Supabase and create a new project
Go to SQL Editor and run the SQL from the setup guide to create tables
Get your project URL and anon key from Settings > API
4. Set Up Paystack
Go to Paystack and create an account
Get your public key from Settings > API Keys & Webhooks
For testing, use the test public key (starts with pk_test_)
5. Configure Environment Variables
Create a .env.local file in the root directory:
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
6. Run Locally
npm run dev
Visit http://localhost:3000 to see your app.
7. Deploy to Vercel
Push your code to GitHub
Go to Vercel and import your repository
Add environment variables in Vercel project settings
Deploy!
📁 Project Structure
├── components/
│   ├── Auth.js              # Authentication component
│   └── FundWalletButton.js  # Wallet funding button
├── lib/
│   ├── supabaseClient.js    # Supabase configuration
│   └── api.js               # API utilities
├── pages/
│   ├── index.js             # Landing page
│   ├── login.js             # Login/Register page
│   ├── dashboard.js         # User dashboard
│   ├── data.js              # Data bundles
│   ├── airtime.js           # Airtime purchase
│   ├── bills.js             # Bill payments
│   ├── fund-wallet.js       # Wallet funding
│   └── transactions.js      # Transaction history
├── styles/
│   └── globals.css          # Global styles
└── public/
    └── logo.svg             # App logo
🗄️ Database Schema
Tables
profiles - User profiles with wallet balance
id (UUID, primary key)
wallet_balance (numeric)
created_at (timestamp)
updated_at (timestamp)
transactions - Transaction records
id (UUID, primary key)
user_id (UUID, foreign key)
type (text: data/airtime/bills/funding)
network (text)
phone_number (text)
bundle_size (text)
amount (numeric)
status (text: pending/completed/failed)
reference (text)
created_at (timestamp)
💳 Payment Integration
The platform uses Paystack for secure payments:
Card payments
Bank transfers
USSD payments
Automatic wallet updates on successful payment
🔒 Security Features
Row Level Security (RLS) on all tables
Encrypted user authentication
Secure payment processing
Environment variable protection
🎨 Customization
Update Prices
Edit the pricing in each page:
pages/data.js - Data bundle prices
pages/airtime.js - Airtime discount rates
pages/bills.js - Bill payment packages
Change Branding
Update colors in tailwind.config.js
Replace logo in public/logo.svg
Modify text in pages/index.js
📱 Mobile Responsive
The entire platform is fully responsive and works perfectly on:
📱 Mobile phones
📱 Tablets
💻 Desktops
🐛 Troubleshooting
Database Connection Issues
Verify your Supabase URL and keys are correct
Check that all SQL tables were created successfully
Payment Not Working
Ensure Paystack script is loaded
Check that your Paystack public key is correct
For testing, use Paystack test cards
Deployment Errors
Make sure all environment variables are set in Vercel
Check that node version matches (16+)
Clear Vercel cache and redeploy
📞 Support
For issues or questions:
Email: support@dududata.com
GitHub: Report an issue
📄 License
This project is licensed under the MIT License.
🙏 Credits
Built with:
Next.js
Supabase
Paystack
Tailwind CSS
Made with ❤️ in Nigeria 🇳🇬
