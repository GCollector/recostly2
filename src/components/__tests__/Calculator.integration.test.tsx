import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../../test/utils'
import userEvent from '@testing-library/user-event'
import Calculator from '../../pages/Calculator'

// Integration test with real components (no mocking)
describe('Calculator Page Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render real mortgage calculator component when mortgage tab is active', () => {
    render(<Calculator />)
    
    // Should show real mortgage calculator content
    expect(screen.getByText(/mortgage details/i)).toBeInTheDocument()
    expect(screen.getByText(/home price/i)).toBeInTheDocument()
    expect(screen.getByText(/down payment/i)).toBeInTheDocument()
  })

  it('should render real closing costs component when closing tab is clicked', async () => {
    const user = userEvent.setup()
    render(<Calculator />)
    
    // Click closing costs tab
    const closingTab = screen.getByRole('button', { name: /closing costs/i })
    await user.click(closingTab)
    
    // Should show real closing costs content
    await waitFor(() => {
      expect(screen.getByText(/closing cost calculator/i)).toBeInTheDocument()
      expect(screen.getByText(/home purchase price/i)).toBeInTheDocument()
    })
  })

  it('should render real amortization component when amortization tab is clicked', async () => {
    const user = userEvent.setup()
    render(<Calculator />)
    
    // Click amortization tab
    const amortizationTab = screen.getByRole('button', { name: /amortization/i })
    await user.click(amortizationTab)
    
    // Should show real amortization content
    await waitFor(() => {
      expect(screen.getByText(/loan details/i)).toBeInTheDocument()
      expect(screen.getByText(/amortization schedule/i)).toBeInTheDocument()
    })
  })

  it('should render real investment component when investment tab is clicked', async () => {
    const user = userEvent.setup()
    render(<Calculator />)
    
    // Click investment tab
    const investmentTab = screen.getByRole('button', { name: /investment/i })
    await user.click(investmentTab)
    
    // Should show real investment content
    await waitFor(() => {
      expect(screen.getByText(/investment property analysis/i)).toBeInTheDocument()
      expect(screen.getByText(/purchase price/i)).toBeInTheDocument()
    })
  })

  it('should maintain component state when switching between tabs', async () => {
    const user = userEvent.setup()
    render(<Calculator />)
    
    // Modify mortgage calculator input
    const homePriceInput = screen.getByLabelText(/home price/i)
    await user.clear(homePriceInput)
    await user.type(homePriceInput, '600000')
    
    // Switch to closing costs
    await user.click(screen.getByRole('button', { name: /closing costs/i }))
    
    // Switch back to mortgage
    await user.click(screen.getByRole('button', { name: /mortgage calculator/i }))
    
    // Input should maintain its value (component state preserved)
    await waitFor(() => {
      const homePriceInputAfter = screen.getByLabelText(/home price/i)
      expect(homePriceInputAfter).toHaveValue(600000)
    })
  })

  it('should prevent regression: ensure all calculator components are functional', async () => {
    const user = userEvent.setup()
    render(<Calculator />)
    
    // Test mortgage calculator functionality
    expect(screen.getByText(/payment breakdown/i)).toBeInTheDocument()
    
    // Test closing costs functionality
    await user.click(screen.getByRole('button', { name: /closing costs/i }))
    await waitFor(() => {
      expect(screen.getByText(/closing cost breakdown/i)).toBeInTheDocument()
    })
    
    // Test amortization functionality
    await user.click(screen.getByRole('button', { name: /amortization/i }))
    await waitFor(() => {
      expect(screen.getByText(/chart view|table view/i)).toBeInTheDocument()
    })
    
    // Test investment functionality
    await user.click(screen.getByRole('button', { name: /investment/i }))
    await waitFor(() => {
      expect(screen.getByText(/investment analysis/i)).toBeInTheDocument()
    })
  })
})