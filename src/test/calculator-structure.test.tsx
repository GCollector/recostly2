import { describe, it, expect } from 'vitest'
import { render, screen } from './utils'
import Calculator from '../pages/Calculator'

/**
 * CRITICAL STRUCTURE TESTS
 * These tests ensure the Calculator maintains the required two-step structure
 * If any of these fail, the Calculator has been incorrectly modified
 */
describe('Calculator Structure Requirements', () => {
  it('CRITICAL: Must have two-step process with step indicator', () => {
    render(<Calculator />)
    
    // Must show step indicator
    expect(screen.getByText('Input Details')).toBeInTheDocument()
    expect(screen.getByText('View Results')).toBeInTheDocument()
    
    // Step 1 should be active
    const step1 = screen.getByText('1')
    expect(step1.closest('span')).toHaveClass('bg-blue-600')
  })

  it('CRITICAL: Must show input form on step 1', () => {
    render(<Calculator />)
    
    // Must have all required sections
    expect(screen.getByText('Mortgage Details')).toBeInTheDocument()
    expect(screen.getByText('Property & Financing')).toBeInTheDocument()
    expect(screen.getByText('Investment Property Analysis')).toBeInTheDocument()
    
    // Must have Calculate Results button
    expect(screen.getByRole('button', { name: /calculate results/i })).toBeInTheDocument()
  })

  it('CRITICAL: Must NOT have tabbed calculator interface', () => {
    render(<Calculator />)
    
    // Should NOT have calculator tabs
    expect(screen.queryByRole('navigation', { name: /calculator tabs/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /mortgage calculator/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /closing costs/i })).not.toBeInTheDocument()
  })

  it('CRITICAL: Must advance to results on Calculate button click', async () => {
    const { user } = await import('@testing-library/user-event')
    const userEvent = user.setup()
    
    render(<Calculator />)
    
    await userEvent.click(screen.getByRole('button', { name: /calculate results/i }))
    
    // Should show results page
    expect(screen.getByText('Results')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument()
  })
})