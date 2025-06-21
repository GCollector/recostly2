# Canadian Mortgage Calculator

A professional, full-featured mortgage calculator designed specifically for the Canadian real estate market. Built with React, TypeScript, Tailwind CSS, and integrated with Supabase and Stripe.

## 🚀 Live Demo

[View Live Application](https://spiffy-crisp-18ad46.netlify.app)

## ✨ Features

### Core Calculators
- **Mortgage Calculator**: Calculate monthly payments, total interest, and amortization schedules
- **Closing Costs Calculator**: Province-specific calculations for Ontario and BC
- **Amortization Schedule**: Detailed year-by-year payment breakdown with interactive charts
- **Investment Property Calculator**: Cap rate, cash flow, ROI, and break-even analysis

### User Management
- **Authentication**: Secure user registration and login with Supabase Auth
- **Subscription Tiers**: Free, Basic ($9/month), and Premium ($29/month) plans
- **Stripe Integration**: Secure payment processing and subscription management
- **Dashboard**: Save, manage, and track calculation history

### Premium Features
- **Private Notes**: Add personal notes to calculations (Premium only)
- **Comments**: Add shareable comments to calculations (Premium only)
- **Marketing Content**: Customize shared calculation pages with your branding (Premium only)
- **White-label Sharing**: Professional sharing with custom marketing content

### Technical Features
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Real-time Calculations**: Instant updates as you modify inputs
- **Data Persistence**: Save calculations to your account
- **Shareable Links**: Generate public links to share calculations
- **Canadian-specific**: Tailored for Toronto and Vancouver markets

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **Payments**: Stripe (Subscriptions, Customer Portal)
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **Deployment**: Netlify
- **Build Tool**: Vite

## 🏗️ Architecture

```
src/
├── components/          # Reusable UI components
│   ├── MortgageCalculator.tsx
│   ├── ClosingCosts.tsx
│   ├── AmortizationSchedule.tsx
│   ├── InvestmentCalculator.tsx
│   ├── PricingSection.tsx
│   └── SubscriptionManager.tsx
├── contexts/           # React Context providers
│   ├── AuthContext.tsx
│   └── CalculationContext.tsx
├── pages/              # Page components
│   ├── Home.tsx
│   ├── Calculator.tsx
│   ├── Dashboard.tsx
│   ├── Settings.tsx
│   └── SharedCalculation.tsx
├── lib/                # Utilities and configurations
│   ├── supabase.ts
│   └── stripe.ts
└── App.tsx             # Main application component

supabase/
├── functions/          # Edge Functions
│   ├── create-checkout-session/
│   ├── create-portal-session/
│   ├── create-stripe-customer/
│   └── stripe-webhook/
└── migrations/         # Database schema
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Stripe account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/canadian-mortgage-calculator.git
   cd canadian-mortgage-calculator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `.env.example` to `.env` and fill in your credentials:
   ```bash
   cp .env.example .env
   ```
   
   Required environment variables:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   ```

4. **Set up Supabase**
   
   - Create a new Supabase project
   - Run the migration file in `supabase/migrations/` to set up the database schema
   - Deploy the edge functions in `supabase/functions/`

5. **Configure Stripe**
   
   - Create products and prices in your Stripe dashboard
   - Update the price IDs in `src/lib/stripe.ts`
   - Set up webhook endpoints for subscription management

6. **Start the development server**
   ```bash
   npm run dev
   ```

## 📊 Database Schema

The application uses three main tables:

- **profiles**: User account information and subscription status
- **mortgage_calculations**: Saved mortgage calculations
- **investment_calculations**: Saved investment property analyses

All tables include Row Level Security (RLS) policies for data protection.

## 💳 Subscription Tiers

| Feature | Free | Basic ($9/mo) | Premium ($29/mo) |
|---------|------|---------------|------------------|
| One-time calculations | ✅ | ✅ | ✅ |
| Save calculations | ❌ | ✅ | ✅ |
| Dashboard access | ❌ | ✅ | ✅ |
| Unlimited calculations | ❌ | ✅ | ✅ |
| Private notes | ❌ | ❌ | ✅ |
| Comments on shares | ❌ | ❌ | ✅ |
| Marketing content | ❌ | ❌ | ✅ |
| White-label sharing | ❌ | ❌ | ✅ |

## 🔧 Configuration

### Stripe Setup

1. Create products in Stripe Dashboard:
   - Basic Monthly ($9/month)
   - Premium Monthly ($29/month)

2. Update price IDs in `src/lib/stripe.ts`:
   ```typescript
   export const STRIPE_PRICES = {
     basic_monthly: 'price_your_basic_price_id',
     premium_monthly: 'price_your_premium_price_id',
   }
   ```

3. Set up webhook endpoint pointing to your Supabase edge function

### Supabase Edge Functions

Deploy the included edge functions for Stripe integration:
- `create-checkout-session`: Creates Stripe checkout sessions
- `create-portal-session`: Creates customer portal sessions
- `create-stripe-customer`: Creates Stripe customers
- `stripe-webhook`: Handles Stripe webhook events

## 🚀 Deployment

The application is configured for easy deployment on Netlify:

1. Connect your GitHub repository to Netlify
2. Set environment variables in Netlify dashboard
3. Deploy automatically on git push

Build command: `npm run build`
Publish directory: `dist`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for the Canadian real estate market
- Designed with real estate professionals in mind
- Optimized for Toronto and Vancouver markets

## 📞 Support

For support, email support@mortgagecalc.ca or create an issue in this repository.

---

**Made with ❤️ for Canadian homebuyers and real estate professionals**