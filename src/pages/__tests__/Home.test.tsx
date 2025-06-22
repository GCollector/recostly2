import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../test/utils'
import Home from '../Home'

// Mock AuthContext
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: null,
    loading: false
  }))
}))

// Mock CalculationContext
vi.mock('../../contexts/CalculationContext', () => ({
  useCalculations: vi.fn(() => ({
    calculations: []
  }))
}))

describe('Home Page', () => {
  it('should render marketing content for non-authenticated users', () => {
    render(<Home />)
    
    expect(screen.getByText(/professional mortgage calculator/i)).toBeInTheDocument()
    expect(screen.getByText(/start calculating/i)).toBeInTheDocument()
    expect(screen.getByText(/create account/i)).toBeInTheDocument()
  })

  it('should render dashboard content for authenticated users', () => {
    const mockUser = {
      id: 'test-id',
      name: 'Test User',
      email: 'test@example.com',
      tier: 'basic'
    }

    vi.mocked(require('../../contexts/AuthContext').useAuth).mockReturnValue({
      user: mockUser,
      loading: false
    })

    render(<Home />)
    
    expect(screen.getByText(/welcome back, test user!/i)).toBeInTheDocument()
    expect(screen.getByText(/new calculation/i)).toBeInTheDocument()
    expect(screen.getByText(/view dashboard/i)).toBeInTheDocument()
  })

  it('should display user statistics when authenticated', () => {
    const mockUser = {
      id: 'test-id',
      name: 'Test User',
      email: 'test@example.com',
      tier: 'basic'
    }

    const mockCalculations = [
      { id: '1', home_price: 500000 },
      { id: '2', home_price: 600000 }
    ]

    vi.mocked(require('../../contexts/AuthContext').useAuth).mockReturnValue({
      user: mockUser,
      loading: false
    })

    vi.mocked(require('../../contexts/CalculationContext').useCalculations).mockReturnValue({
      calculations: mockCalculations
    })

    render(<Home />)
    
    expect(screen.getByText('2')).toBeInTheDocument() // Number of calculations
    expect(screen.getByText(/\$1,100,000/)).toBeInTheDocument() // Total property value
  })

  it('should render feature cards', () => {
    render(<Home />)
    
    expect(screen.getByText(/mortgage calculator/i)).toBeInTheDocument()
    expect(screen.getByText(/closing costs/i)).toBeInTheDocument()
    expect(screen.getByText(/investment metrics/i)).toBeInTheDocument()
    expect(screen.getByText(/save & share/i)).toBeInTheDocument()
  })

  it('should render testimonials', () => {
    render(<Home />)
    
    expect(screen.getByText(/trusted by canadian real estate professionals/i)).toBeInTheDocument()
    expect(screen.getByText(/sarah chen/i)).toBeInTheDocument()
    expect(screen.getByText(/michael rodriguez/i)).toBeInTheDocument()
    expect(screen.getByText(/emily johnson/i)).toBeInTheDocument()
  })

  it('should render call-to-action section', () => {
    render(<Home />)
    
    expect(screen.getByText(/ready to get started/i)).toBeInTheDocument()
    expect(screen.getByText(/join thousands of canadians/i)).toBeInTheDocument()
  })
})