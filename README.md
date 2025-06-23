# Canadian Mortgage Calculator

A professional, full-featured mortgage calculator designed specifically for the Canadian real estate market. Built with React, TypeScript, Tailwind CSS, and integrated with Supabase and Stripe.

## 🚀 Live Demo

[View Live Application](https://spiffy-crisp-18ad46.netlify.app)

## ✨ Features

### Core Calculators
- **Two-Step Mortgage Calculator**: Professional input form with comprehensive results analysis
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
- **Modular Architecture**: Clean, maintainable component structure

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
├── components/
│   ├── mortgage/            # Input form components
│   │   ├── MortgageInputForm.tsx
│   │   ├── PropertyFinancingSection.tsx
│   │   ├── InvestmentAnalysisSection.tsx
│   │   ├── InvestmentToggle.tsx
│   │   └── InvestmentFields.tsx
│   ├── results/             # Results display components
│   │   ├── MortgageSummaryTab.tsx
│   │   ├── ClosingCostsTab.tsx
│   │   ├── AmortizationTab.tsx
│   │   ├── InvestmentAnalysisTab.tsx
│   │   ├── ResultsTabNavigation.tsx
│   │   └── ResultsActionButtons.tsx
│   ├── shared/              # Reusable components
│   │   └── ShareModal.tsx
│   ├── MortgageResults.tsx  # Main results container
│   ├── PricingSection.tsx
│   ├── SubscriptionManager.tsx
│   └── Layout.tsx
├── contexts/               # React Context providers
│   ├── AuthContext.tsx
│   └── CalculationContext.tsx
├── pages/                  # Page components
│   ├── Home.tsx
│   ├── Calculator.tsx      # Two-step calculator process
│   ├── Dashboard.tsx
│   ├── Settings.tsx
│   ├── Pricing.tsx
│   ├── Login.tsx
│   ├── Signup.tsx
│   └── SharedCalculation.tsx
├── utils/                  # Utility functions
│   └── mortgageCalculations.ts
└── lib/                    # Configurations
    ├── supabase.ts
    └── stripe.ts

supabase/
├── functions/              # Edge Functions
│   ├── create-checkout-session/
│   ├── create-portal-session/
│   ├── create-stripe-customer/
│   └── stripe-webhook/
└── migrations/             # Database schema
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
   - Run the migration files in `supabase/migrations/` to set up the database schema
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

The application uses a singular table naming convention with two main tables:

- **profile**: User account information and subscription status
- **mortgage_calculation**: Saved mortgage calculations with investment analysis

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

## 🏛️ Application Structure

### Two-Step Calculator Process

The calculator follows a carefully designed two-step process:

1. **Step 1: Input Form**
   - Comprehensive mortgage details input
   - Property and financing information
   - Optional investment analysis with toggle
   - Professional form validation

2. **Step 2: Results Analysis**
   - Tabbed results interface with responsive design
   - Featured monthly payment display
   - Detailed breakdowns and interactive charts
   - Save and share functionality

### Component Architecture

The application follows a modular component architecture:

- **Maximum 200-300 lines per component** for maintainability
- **Single Responsibility Principle** for each component
- **Reusable components** in the shared directory
- **Clear separation** between input, results, and utility components

### Database Design

- **Singular table naming** convention throughout
- **Row Level Security** for all user data
- **Optimized indexes** for performance
- **Automatic profile creation** on user signup

## 🚀 Deployment

The application is configured for easy deployment on Netlify:

1. Connect your GitHub repository to Netlify
2. Set environment variables in Netlify dashboard
3. Deploy automatically on git push

Build command: `npm run build`
Publish directory: `dist`

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
npm run test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

The application includes comprehensive tests for:
- Component functionality and integration
- Calculator structure and workflow
- Chart rendering and data validation
- Responsive design requirements
- Database operations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the two-step calculator structure
- Maintain component size limits (200-300 lines)
- Use singular table naming convention
- Include tests for new features
- Follow the established design system

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for the Canadian real estate market
- Designed with real estate professionals in mind
- Optimized for Toronto and Vancouver markets
- Follows modern React and TypeScript best practices

## 📞 Support

For support, email support@mortgagecalc.ca or create an issue in this repository.

## 🔄 Recent Updates

### Version 2.0 - Major Architecture Overhaul
- **Two-Step Calculator Process**: Redesigned from tabbed interface to professional two-step workflow
- **Modular Component Architecture**: Broke down large components into maintainable, focused modules
- **Enhanced User Experience**: Improved navigation with "Edit" button and step indicators
- **Database Optimization**: Migrated to singular table naming convention for better performance
- **Background Authentication**: Removed loading screens for better UX
- **Responsive Design**: Enhanced mobile and desktop experiences
- **Chart Improvements**: Fixed rendering issues and improved data visualization
- **Dashboard Navigation**: Direct links to calculation results from saved calculations

### Technical Improvements
- **Component Size Limits**: All components under 300 lines for better maintainability
- **Testing Coverage**: Comprehensive test suite including regression tests
- **Performance Optimization**: Background profile loading and optimized database queries
- **Error Handling**: Improved error boundaries and graceful failure handling
- **Accessibility**: Enhanced ARIA labels and keyboard navigation

---

**Made with ❤️ for Canadian homebuyers and real estate professionals**