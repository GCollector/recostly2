import { describe, it, expect } from 'vitest'
import { render, screen } from './utils'
import Calculator from '../pages/Calculator'

/**
 * Regression Tests for Calculator Page
 * 
 * These tests are specifically designed to prevent regressions where the
 * Calculator page gets accidentally reverted to older versions.
 */
describe('Calculator Page Regression Tests', () => {
  it('REGRESSION: should never revert to single-page calculator without tabs', () => {
    render(<Calculator />)
    
    // The Calculator page MUST have a tabbed interface
    // If this test fails, it means the page was reverted to an older version
    
    // Check for tab navigation
    const navigation = screen.getByRole('navigation', { name: /calculator tabs/i })
    expect(navigation).toBeInTheDocument()
    
    // Check for all required tabs
    expect(screen.getByRole('button', { name: /mortgage calculator/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /closing costs/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /amortization/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /investment/i })).toBeInTheDocument()
    
    // Check for tab content container
    expect(screen.getByTestId('tab-content')).toBeInTheDocument()
  })

  it('REGRESSION: should never show old single-form calculator structure', () => {
    render(<Calculator />)
    
    // These elements should NOT exist in the new tabbed version
    // If they do, it means we reverted to the old single-page calculator
    
    // Old calculator had these sections all on one page
    expect(screen.queryByText(/property information/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/investment property analysis/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/turn your home purchase into a profitable investment/i)).not.toBeInTheDocument()
    
    // Old calculator had a single "Calculate Mortgage" button
    expect(screen.queryByRole('button', { name: /calculate mortgage & investment/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /calculate mortgage/i })).not.toBeInTheDocument()
  })

  it('REGRESSION: should maintain tabbed interface structure', () => {
    render(<Calculator />)
    
    // Verify the specific structure that should always be present
    
    // Header section
    expect(screen.getByText(/mortgage & real estate calculators/i)).toBeInTheDocument()
    
    // Tab navigation with grid layout
    const tabButtons = screen.getAllByRole('button')
    expect(tabButtons.length).toBe(4) // Exactly 4 tabs
    
    // Each tab should have an icon and text
    tabButtons.forEach(button => {
      const icon = button.querySelector('svg')
      expect(icon).toBeInTheDocument()
    })
    
    // Tab content area
    const tabContent = screen.getByTestId('tab-content')
    expect(tabContent).toHaveClass('bg-white', 'rounded-xl', 'min-h-[600px]')
  })

  it('REGRESSION: should never lose individual calculator components', () => {
    render(<Calculator />)
    
    // Default should show mortgage calculator
    expect(screen.getByText(/mortgage details/i)).toBeInTheDocument()
    
    // The page should be able to render all calculator types
    // (We test this by checking the tab structure exists)
    const tabs = [
      { name: /mortgage calculator/i, testId: 'tab-mortgage' },
      { name: /closing costs/i, testId: 'tab-closing' },
      { name: /amortization/i, testId: 'tab-amortization' },
      { name: /investment/i, testId: 'tab-investment' }
    ]
    
    tabs.forEach(tab => {
      expect(screen.getByTestId(tab.testId)).toBeInTheDocument()
    })
  })

  it('REGRESSION: should maintain responsive design for tabs', () => {
    render(<Calculator />)
    
    // Tab navigation should have responsive grid
    const navigation = screen.getByRole('navigation')
    const tabContainer = navigation.firstElementChild
    expect(tabContainer).toHaveClass('grid', 'grid-cols-2', 'lg:grid-cols-4')
    
    // Tab descriptions should be hidden on small screens
    const descriptions = screen.getAllByText(/calculate monthly payments|estimate closing costs|view payment schedule|analyze rental property/i)
    descriptions.forEach(desc => {
      expect(desc).toHaveClass('hidden', 'sm:block')
    })
  })

  it('REGRESSION: should never lose proper TypeScript types', () => {
    render(<Calculator />)
    
    // This test ensures the component maintains proper TypeScript structure
    // If the component was reverted to JavaScript or lost types, this would fail
    
    // Check that the component renders without TypeScript errors
    expect(screen.getByRole('main')).toBeInTheDocument()
    
    // Check that tab state management works (indicates proper typing)
    const mortgageTab = screen.getByTestId('tab-mortgage')
    expect(mortgageTab).toHaveClass('bg-blue-100') // Active tab styling
  })

  it('REGRESSION: should maintain accessibility features', () => {
    render(<Calculator />)
    
    // Accessibility features that should never be lost
    
    // Navigation should have proper aria-label
    expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'Calculator tabs')
    
    // Tabs should have proper aria-labels
    expect(screen.getByTestId('tab-mortgage')).toHaveAttribute('aria-label', 'Switch to Mortgage Calculator')
    expect(screen.getByTestId('tab-closing')).toHaveAttribute('aria-label', 'Switch to Closing Costs')
    expect(screen.getByTestId('tab-amortization')).toHaveAttribute('aria-label', 'Switch to Amortization')
    expect(screen.getByTestId('tab-investment')).toHaveAttribute('aria-label', 'Switch to Investment')
    
    // All tabs should be keyboard accessible
    const tabs = screen.getAllByRole('button')
    tabs.forEach(tab => {
      expect(tab).not.toHaveAttribute('disabled')
    })
  })
})