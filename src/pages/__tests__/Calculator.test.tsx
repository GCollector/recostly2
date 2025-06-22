import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../../test/utils'
import userEvent from '@testing-library/user-event'
import Calculator from '../Calculator'

// Mock the calculator components
vi.mock('../../components/MortgageCalculator', () => ({
  default: () => <div data-testid="mortgage-calculator">Mortgage Calculator Component</div>
}))

vi.mock('../../components/ClosingCosts', () => ({
  default: () => <div data-testid="closing-costs">Closing Costs Component</div>
}))

vi.mock('../../components/AmortizationSchedule', () => ({
  default: () => <div data-testid="amortization-schedule">Amortization Schedule Component</div>
}))

vi.mock('../../components/InvestmentCalculator', () => ({
  default: () => <div data-testid="investment-calculator">Investment Calculator Component</div>
}))

describe('Calculator Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render the page header correctly', () => {
    render(<Calculator />)
    
    expect(screen.getByText(/mortgage & real estate calculators/i)).toBeInTheDocument()
    expect(screen.getByText(/professional tools for canadian real estate calculations/i)).toBeInTheDocument()
  })

  it('should render all four calculator tabs', () => {
    render(<Calculator />)
    
    // Check all tabs are present
    expect(screen.getByTestId('tab-mortgage')).toBeInTheDocument()
    expect(screen.getByTestId('tab-closing')).toBeInTheDocument()
    expect(screen.getByTestId('tab-amortization')).toBeInTheDocument()
    expect(screen.getByTestId('tab-investment')).toBeInTheDocument()
    
    // Check tab labels
    expect(screen.getByText('Mortgage Calculator')).toBeInTheDocument()
    expect(screen.getByText('Closing Costs')).toBeInTheDocument()
    expect(screen.getByText('Amortization')).toBeInTheDocument()
    expect(screen.getByText('Investment')).toBeInTheDocument()
  })

  it('should show mortgage calculator by default', () => {
    render(<Calculator />)
    
    // Mortgage tab should be active
    const mortgageTab = screen.getByTestId('tab-mortgage')
    expect(mortgageTab).toHaveClass('bg-blue-100', 'text-blue-700')
    
    // Mortgage calculator component should be rendered
    expect(screen.getByTestId('mortgage-calculator')).toBeInTheDocument()
    
    // Other components should not be rendered
    expect(screen.queryByTestId('closing-costs')).not.toBeInTheDocument()
    expect(screen.queryByTestId('amortization-schedule')).not.toBeInTheDocument()
    expect(screen.queryByTestId('investment-calculator')).not.toBeInTheDocument()
  })

  it('should switch to closing costs tab when clicked', async () => {
    const user = userEvent.setup()
    render(<Calculator />)
    
    // Click on closing costs tab
    const closingTab = screen.getByTestId('tab-closing')
    await user.click(closingTab)
    
    // Closing costs tab should be active
    expect(closingTab).toHaveClass('bg-blue-100', 'text-blue-700')
    
    // Closing costs component should be rendered
    expect(screen.getByTestId('closing-costs')).toBeInTheDocument()
    
    // Other components should not be rendered
    expect(screen.queryByTestId('mortgage-calculator')).not.toBeInTheDocument()
    expect(screen.queryByTestId('amortization-schedule')).not.toBeInTheDocument()
    expect(screen.queryByTestId('investment-calculator')).not.toBeInTheDocument()
  })

  it('should switch to amortization tab when clicked', async () => {
    const user = userEvent.setup()
    render(<Calculator />)
    
    // Click on amortization tab
    const amortizationTab = screen.getByTestId('tab-amortization')
    await user.click(amortizationTab)
    
    // Amortization tab should be active
    expect(amortizationTab).toHaveClass('bg-blue-100', 'text-blue-700')
    
    // Amortization component should be rendered
    expect(screen.getByTestId('amortization-schedule')).toBeInTheDocument()
    
    // Other components should not be rendered
    expect(screen.queryByTestId('mortgage-calculator')).not.toBeInTheDocument()
    expect(screen.queryByTestId('closing-costs')).not.toBeInTheDocument()
    expect(screen.queryByTestId('investment-calculator')).not.toBeInTheDocument()
  })

  it('should switch to investment tab when clicked', async () => {
    const user = userEvent.setup()
    render(<Calculator />)
    
    // Click on investment tab
    const investmentTab = screen.getByTestId('tab-investment')
    await user.click(investmentTab)
    
    // Investment tab should be active
    expect(investmentTab).toHaveClass('bg-blue-100', 'text-blue-700')
    
    // Investment component should be rendered
    expect(screen.getByTestId('investment-calculator')).toBeInTheDocument()
    
    // Other components should not be rendered
    expect(screen.queryByTestId('mortgage-calculator')).not.toBeInTheDocument()
    expect(screen.queryByTestId('closing-costs')).not.toBeInTheDocument()
    expect(screen.queryByTestId('amortization-schedule')).not.toBeInTheDocument()
  })

  it('should maintain tab state when switching between tabs', async () => {
    const user = userEvent.setup()
    render(<Calculator />)
    
    // Start with mortgage (default)
    expect(screen.getByTestId('mortgage-calculator')).toBeInTheDocument()
    
    // Switch to closing costs
    await user.click(screen.getByTestId('tab-closing'))
    expect(screen.getByTestId('closing-costs')).toBeInTheDocument()
    
    // Switch to investment
    await user.click(screen.getByTestId('tab-investment'))
    expect(screen.getByTestId('investment-calculator')).toBeInTheDocument()
    
    // Switch back to mortgage
    await user.click(screen.getByTestId('tab-mortgage'))
    expect(screen.getByTestId('mortgage-calculator')).toBeInTheDocument()
  })

  it('should have proper accessibility attributes', () => {
    render(<Calculator />)
    
    // Check navigation has proper aria-label
    const nav = screen.getByRole('navigation')
    expect(nav).toHaveAttribute('aria-label', 'Calculator tabs')
    
    // Check tabs have proper aria-labels
    expect(screen.getByTestId('tab-mortgage')).toHaveAttribute('aria-label', 'Switch to Mortgage Calculator')
    expect(screen.getByTestId('tab-closing')).toHaveAttribute('aria-label', 'Switch to Closing Costs')
    expect(screen.getByTestId('tab-amortization')).toHaveAttribute('aria-label', 'Switch to Amortization')
    expect(screen.getByTestId('tab-investment')).toHaveAttribute('aria-label', 'Switch to Investment')
  })

  it('should render tab content container with proper styling', () => {
    render(<Calculator />)
    
    const tabContent = screen.getByTestId('tab-content')
    expect(tabContent).toBeInTheDocument()
    expect(tabContent).toHaveClass('bg-white', 'rounded-xl', 'shadow-sm', 'border', 'border-slate-200', 'min-h-[600px]')
  })

  it('should handle keyboard navigation', async () => {
    const user = userEvent.setup()
    render(<Calculator />)
    
    // Focus on first tab
    const mortgageTab = screen.getByTestId('tab-mortgage')
    mortgageTab.focus()
    
    // Tab should be focusable
    expect(mortgageTab).toHaveFocus()
    
    // Should be able to activate with Enter key
    await user.keyboard('{Enter}')
    expect(screen.getByTestId('mortgage-calculator')).toBeInTheDocument()
  })

  it('should show tab descriptions on larger screens', () => {
    render(<Calculator />)
    
    // Check that descriptions are present but hidden on small screens
    expect(screen.getByText('Calculate monthly payments and total costs')).toBeInTheDocument()
    expect(screen.getByText('Estimate closing costs and fees')).toBeInTheDocument()
    expect(screen.getByText('View payment schedule and charts')).toBeInTheDocument()
    expect(screen.getByText('Analyze rental property returns')).toBeInTheDocument()
    
    // Descriptions should have hidden class for small screens
    const descriptions = screen.getAllByText(/Calculate monthly payments|Estimate closing costs|View payment schedule|Analyze rental property/)
    descriptions.forEach(desc => {
      expect(desc).toHaveClass('hidden', 'sm:block')
    })
  })

  it('should render icons for each tab', () => {
    render(<Calculator />)
    
    // Each tab should have an icon (we can't test the specific icon, but we can test the structure)
    const tabs = [
      screen.getByTestId('tab-mortgage'),
      screen.getByTestId('tab-closing'),
      screen.getByTestId('tab-amortization'),
      screen.getByTestId('tab-investment')
    ]
    
    tabs.forEach(tab => {
      // Each tab should have an SVG icon
      const icon = tab.querySelector('svg')
      expect(icon).toBeInTheDocument()
      expect(icon).toHaveClass('h-6', 'w-6', 'mb-2')
    })
  })

  it('should prevent regression: ensure tabbed interface is always present', () => {
    render(<Calculator />)
    
    // This test specifically prevents regression to the old single-page calculator
    // The tabbed interface should ALWAYS be present
    
    // Check that we have multiple tabs (not a single calculator)
    const tabs = screen.getAllByRole('button')
    expect(tabs.length).toBeGreaterThanOrEqual(4)
    
    // Check that tab navigation exists
    expect(screen.getByRole('navigation')).toBeInTheDocument()
    
    // Check that we have the tab content container
    expect(screen.getByTestId('tab-content')).toBeInTheDocument()
    
    // Ensure we're not showing the old single-page calculator structure
    expect(screen.queryByText(/property information/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/investment property analysis/i)).not.toBeInTheDocument()
  })
})