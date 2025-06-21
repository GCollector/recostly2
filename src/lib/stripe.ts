import { loadStripe } from '@stripe/stripe-js'

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

if (!stripePublishableKey) {
  console.warn('Stripe publishable key not found. Stripe features will be disabled.')
}

export const stripe = stripePublishableKey ? loadStripe(stripePublishableKey) : null

// These will be replaced with your actual Stripe price IDs
export const STRIPE_PRICES = {
  basic_monthly: 'price_1234567890', // Replace with actual Stripe price ID for Basic Monthly
  premium_monthly: 'price_0987654321', // Replace with actual Stripe price ID for Premium Monthly
  premium_yearly: 'price_1122334455', // Replace with actual Stripe price ID for Premium Yearly
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