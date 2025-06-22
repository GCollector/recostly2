import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../test/utils'
import userEvent from '@testing-library/user-event'
import Calculator from '../Calculator'

describe('Calculator Page', () => {
  it('should render tab navigation', () => {
    render(<Calculator />)
    
    expect(screen.getByText(/mortgage calculator/i)).toBeInTheDocument()
    expect(screen.getByText(/closing costs/i)).toBeInTheDocument()
    expect(screen.getByText(/amortization/i)).toBeInTheDocument()
    expect(screen.getByText(/investment/i)).toBeInTheDocument()
  })

  it('should switch between tabs', async () => {
    const user = userEvent.setup()
    render(<Calculator />)
    
    // Default should be mortgage calculator
    expect(screen.getByText(/mortgage details/i)).toBeInTheDocument()
    
    // Click on closing costs tab
    const closingCostsTab = screen.getByRole('button', { name: /closing costs/i })
    await user.click(closingCostsTab)
    
    // Should show closing costs calculator
    expect(screen.getByText(/closing cost calculator/i)).toBeInTheDocument()
  })

  it('should render page header', () => {
    render(<Calculator />)
    
    expect(screen.getByText(/mortgage & real estate calculators/i)).toBeInTheDocument()
    expect(screen.getByText(/professional tools for canadian real estate calculations/i)).toBeInTheDocument()
  })

  it('should have active tab styling', () => {
    render(<Calculator />)
    
    const mortgageTab = screen.getByRole('button', { name: /mortgage calculator/i })
    expect(mortgageTab).toHaveClass('bg-blue-100', 'text-blue-700')
  })

  it('should render all tab content components', async () => {
    const user = userEvent.setup()
    render(<Calculator />)
    
    // Test mortgage calculator (default)
    expect(screen.getByText(/mortgage details/i)).toBeInTheDocument()
    
    // Test closing costs
    const closingCostsTab = screen.getByRole('button', { name: /closing costs/i })
    await user.click(closingCostsTab)
    expect(screen.getByText(/closing cost calculator/i)).toBeInTheDocument()
    
    // Test amortization
    const amortizationTab = screen.getByRole('button', { name: /amortization/i })
    await user.click(amortizationTab)
    expect(screen.getByText(/loan details/i)).toBeInTheDocument()
    
    // Test investment
    const investmentTab = screen.getByRole('button', { name: /investment/i })
    await user.click(investmentTab)
    expect(screen.getByText(/investment property analysis/i)).toBeInTheDocument()
  })
})