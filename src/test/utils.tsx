import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../contexts/AuthContext'
import { CalculationProvider } from '../contexts/CalculationContext'

// Custom render function that includes providers
const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CalculationProvider>
          {children}
        </CalculationProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Mock user data for tests
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  tier: 'basic' as const,
  stripe_customer_id: null,
  stripe_subscription_id: null,
  subscription_status: null,
  marketing_image: null,
  marketing_copy: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  supabaseUser: {
    id: 'test-user-id',
    email: 'test@example.com'
  } as any
}

export const mockCalculation = {
  id: 'test-calc-id',
  user_id: 'test-user-id',
  home_price: 500000,
  down_payment: 100000,
  interest_rate: 5.25,
  amortization_years: 25,
  payment_frequency: 'monthly' as const,
  province: 'ontario' as const,
  city: 'toronto' as const,
  is_first_time_buyer: false,
  monthly_payment: 2500,
  total_interest: 250000,
  notes: {},
  comments: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
}