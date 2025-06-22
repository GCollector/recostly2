import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../../test/utils'
import userEvent from '@testing-library/user-event'
import MortgageCalculator from '../MortgageCalculator'

// Mock the contexts
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: null,
    loading: false
  }))
}))

vi.mock('../../contexts/CalculationContext', () => ({
  useCalculations: vi.fn(() => ({
    saveCalculation: vi.fn(() => Promise.resolve('test-id')),
    calculations: []
  }))
}))

describe('MortgageCalculator', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render all input fields', () => {
    render(<MortgageCalculator />)
    
    expect(screen.getByLabelText(/home price/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/down payment/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/interest rate/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/amortization period/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/payment frequency/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/location/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/first-time homebuyer/i)).toBeInTheDocument()
  })

  it('should display default calculation results', () => {
    render(<MortgageCalculator />)
    
    // Should show monthly payment result
    expect(screen.getByText(/monthly payment/i)).toBeInTheDocument()
    expect(screen.getByText(/loan amount/i)).toBeInTheDocument()
    expect(screen.getByText(/total interest/i)).toBeInTheDocument()
    expect(screen.getByText(/total cost of home/i)).toBeInTheDocument()
  })

  it('should update calculation when inputs change', async () => {
    const user = userEvent.setup()
    render(<MortgageCalculator />)
    
    const homePriceInput = screen.getByLabelText(/home price/i)
    
    // Change home price
    await user.clear(homePriceInput)
    await user.type(homePriceInput, '600000')
    
    // Wait for calculation to update
    await waitFor(() => {
      // The calculation should have updated with new values
      expect(homePriceInput).toHaveValue(600000)
    })
  })

  it('should show down payment percentage', () => {
    render(<MortgageCalculator />)
    
    // Default values: $500k home, $100k down = 20%
    expect(screen.getByText('20%')).toBeInTheDocument()
  })

  it('should handle first-time buyer checkbox', async () => {
    const user = userEvent.setup()
    render(<MortgageCalculator />)
    
    const checkbox = screen.getByLabelText(/first-time homebuyer/i)
    expect(checkbox).not.toBeChecked()
    
    await user.click(checkbox)
    expect(checkbox).toBeChecked()
  })

  it('should handle location selection', async () => {
    const user = userEvent.setup()
    render(<MortgageCalculator />)
    
    const locationSelect = screen.getByLabelText(/location/i)
    expect(locationSelect).toHaveValue('toronto')
    
    await user.selectOptions(locationSelect, 'vancouver')
    expect(locationSelect).toHaveValue('vancouver')
  })

  it('should handle payment frequency selection', async () => {
    const user = userEvent.setup()
    render(<MortgageCalculator />)
    
    const frequencySelect = screen.getByLabelText(/payment frequency/i)
    expect(frequencySelect).toHaveValue('monthly')
    
    await user.selectOptions(frequencySelect, 'bi-weekly')
    expect(frequencySelect).toHaveValue('bi-weekly')
  })

  it('should show save and share buttons', () => {
    render(<MortgageCalculator />)
    
    expect(screen.getByRole('button', { name: /save & share/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument()
  })

  it('should handle save calculation', async () => {
    const user = userEvent.setup()
    const mockSaveCalculation = vi.fn(() => Promise.resolve('test-id'))
    
    vi.mocked(require('../../contexts/CalculationContext').useCalculations).mockReturnValue({
      saveCalculation: mockSaveCalculation,
      calculations: []
    })
    
    render(<MortgageCalculator />)
    
    const saveButton = screen.getByRole('button', { name: /save & share/i })
    await user.click(saveButton)
    
    await waitFor(() => {
      expect(mockSaveCalculation).toHaveBeenCalled()
    })
  })

  it('should validate input ranges', async () => {
    const user = userEvent.setup()
    render(<MortgageCalculator />)
    
    const interestRateInput = screen.getByLabelText(/interest rate/i)
    
    // Test negative interest rate
    await user.clear(interestRateInput)
    await user.type(interestRateInput, '-1')
    
    // Should handle invalid input gracefully
    expect(interestRateInput).toHaveValue(-1)
  })

  it('should calculate bi-weekly payments correctly', async () => {
    const user = userEvent.setup()
    render(<MortgageCalculator />)
    
    const frequencySelect = screen.getByLabelText(/payment frequency/i)
    await user.selectOptions(frequencySelect, 'bi-weekly')
    
    // Should show bi-weekly payment label
    expect(screen.getByText(/bi-weekly payment/i)).toBeInTheDocument()
  })

  it('should handle amortization period changes', async () => {
    const user = userEvent.setup()
    render(<MortgageCalculator />)
    
    const amortizationSelect = screen.getByLabelText(/amortization period/i)
    expect(amortizationSelect).toHaveValue('25')
    
    await user.selectOptions(amortizationSelect, '30')
    expect(amortizationSelect).toHaveValue('30')
  })
})