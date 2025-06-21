import { loadStripe } from '@stripe/stripe-js'

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

if (!stripePublishableKey) {
  console.warn('Stripe publishable key not found. Stripe features will be disabled.')
}

export const stripe = stripePublishableKey ? loadStripe(stripePublishableKey) : null

// These need to be replaced with your actual Stripe price IDs from your Stripe Dashboard
export const STRIPE_PRICES = {
  basic_monthly: 'prod_SXY4I87Xnc7zg8', // Replace with actual Stripe price ID for Basic Monthly
  premium_monthly: 'prod_SXEpTlnMRbHpRZ', // Replace with actual Stripe price ID for Premium Monthly
  premium_yearly: 'prod_SXY51SrzMqJqNq', // Replace with actual Stripe price ID for Premium Yearly
}

export const PLAN_DETAILS = {
  basic: {
    name: 'Basic',
    price: 9,
    interval: 'month',
    features: [
      'Unlimited calculations',
      'Save & manage calculations',
      'Dashboard access',
      'Advanced sharing'
    ]
  },
  premium: {
    name: 'Premium',
    price: 29,
    interval: 'month',
    features: [
      'Everything in Basic',
      'Private notes & comments',
      'Marketing content on shared pages',
      'White-label sharing',
      'Priority support'
    ]
  }
}

// Check if Stripe is properly configured
export const isStripeConfigured = () => {
  return !!(stripePublishableKey && 
    STRIPE_PRICES.basic_monthly !== 'price_1234567890' && 
    STRIPE_PRICES.premium_monthly !== 'price_0987654321')
}