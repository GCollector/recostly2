import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock environment variables
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      })),
      getUser: vi.fn()
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
      order: vi.fn().mockReturnThis()
    }))
  }
}))

// Mock Stripe
vi.mock('../lib/stripe', () => ({
  stripe: null,
  STRIPE_PRICES: {
    basic_monthly: 'price_test_basic',
    premium_monthly: 'price_test_premium'
  },
  PLAN_DETAILS: {
    basic: {
      name: 'Basic',
      price: 9,
      interval: 'month',
      features: ['Feature 1', 'Feature 2']
    },
    premium: {
      name: 'Premium', 
      price: 29,
      interval: 'month',
      features: ['Feature 1', 'Feature 2', 'Feature 3']
    }
  },
  isStripeConfigured: vi.fn(() => false)
}))

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(() => Promise.resolve())
  }
})

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    origin: 'http://localhost:3000',
    href: 'http://localhost:3000'
  },
  writable: true
})

// Mock alert and confirm
global.alert = vi.fn()
global.confirm = vi.fn(() => true)

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock
})