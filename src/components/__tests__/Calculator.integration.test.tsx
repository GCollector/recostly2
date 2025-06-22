import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '../../test/utils'
import userEvent from '@testing-library/user-event'
import Calculator from '../../pages/Calculator'

/**
 * INTEGRATION TESTS FOR CALCULATOR PAGE
 * 
 * These tests ensure the Calculator page maintains its step-by-step workflow
 * and prevent regressions to older single-page calculator versions.
 */

// Mock contexts
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

// Mock Recharts
vi.mock('recharts', () => ({
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
  Area: () => <div data-testid="area" />
}))

describe('Calculator Page Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('REGRESSION: Step-by-Step Workflow', () => {
    it('CRITICAL: should never revert to single-page calculator', () => {
      render(<Calculator />)
      
      // Must have step-by-step workflow
      expect(screen.getByText(/input details/i)).toBeInTheDocument()
      expect(screen.getByText(/view results/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /calculate results/i })).toBeInTheDocument()
      
      // Should NOT have old single-page elements
      expect(screen.queryByText(/property information/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/turn your home purchase into a profitable investment/i)).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /calculate mortgage & investment/i })).not.toBeInTheDocument()
    })

    it('CRITICAL: should maintain two-step structure', () => {
      render(<Calculator />)
      
      // Should have exactly 2 steps
      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.queryByText('3')).not.toBeInTheDocument()
      
      // Step 1 should be active initially
      const step1 = screen.getByText('1')
      expect(step1.closest('span')).toHaveClass('bg-blue-600', 'text-white')
    })

    it('CRITICAL: should show form on step 1', () => {
      render(<Calculator />)
      
      // Should show mortgage form
      expect(screen.getByText(/mortgage details/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/home price/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/down payment/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/interest rate/i)).toBeInTheDocument()
      
      // Should NOT show results
      expect(screen.queryByText(/total cost breakdown/i)).not.toBeInTheDocument()
      expect(screen.queryByTestId('pie-chart')).not.toBeInTheDocument()
    })

    it('CRITICAL: should show results on step 2', async () => {
      const user = userEvent.setup()
      render(<Calculator />)
      
      // Navigate to step 2
      await user.click(screen.getByRole('button', { name: /calculate results/i }))
      
      await waitFor(() => {
        // Should show results
        expect(screen.getByText(/results/i)).toBeInTheDocument()
        expect(screen.getByText(/total cost breakdown/i)).toBeInTheDocument()
        expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
        
        // Should NOT show form
        expect(screen.queryByText(/mortgage details/i)).not.toBeInTheDocument()
        expect(screen.queryByLabelText(/home price/i)).not.toBeInTheDocument()
      })
    })
  })

  describe('REGRESSION: Navigation Between Steps', () => {
    it('should navigate forward correctly', async () => {
      const user = userEvent.setup()
      render(<Calculator />)
      
      // Start on step 1
      expect(screen.getByText(/input details/i)).toBeInTheDocument()
      
      // Navigate to step 2
      await user.click(screen.getByRole('button', { name: /calculate results/i }))
      
      await waitFor(() => {
        expect(screen.getByText(/view results/i)).toBeInTheDocument()
        
        // Step 2 should be active
        const step2 = screen.getByText('2')
        expect(step2.closest('span')).toHaveClass('bg-blue-600', 'text-white')
      })
    })

    it('should navigate backward correctly', async () => {
      const user = userEvent.setup()
      render(<Calculator />)
      
      // Go to step 2
      await user.click(screen.getByRole('button', { name: /calculate results/i }))
      
      await waitFor(() => {
        expect(screen.getByText(/view results/i)).toBeInTheDocument()
      })
      
      // Go back to step 1
      await user.click(screen.getByRole('button', { name: /back/i }))
      
      await waitFor(() => {
        expect(screen.getByText(/input details/i)).toBeInTheDocument()
        expect(screen.getByText(/mortgage details/i)).toBeInTheDocument()
        
        // Step 1 should be active again
        const step1 = screen.getByText('1')
        expect(step1.closest('span')).toHaveClass('bg-blue-600', 'text-white')
      })
    })

    it('CRITICAL: should preserve form data during navigation', async () => {
      const user = userEvent.setup()
      render(<Calculator />)
      
      // Fill in form data
      const homePriceInput = screen.getByLabelText(/home price/i)
      await user.clear(homePriceInput)
      await user.type(homePriceInput, '600000')
      
      const downPaymentInput = screen.getByLabelText(/down payment/i)
      await user.clear(downPaymentInput)
      await user.type(downPaymentInput, '120000')
      
      // Navigate to results
      await user.click(screen.getByRole('button', { name: /calculate results/i }))
      
      await waitFor(() => {
        expect(screen.getByText(/view results/i)).toBeInTheDocument()
      })
      
      // Navigate back
      await user.click(screen.getByRole('button', { name: /back/i }))
      
      await waitFor(() => {
        // Data should be preserved
        expect(screen.getByDisplayValue('600000')).toBeInTheDocument()
        expect(screen.getByDisplayValue('120000')).toBeInTheDocument()
      })
    })
  })

  describe('REGRESSION: Investment Analysis Integration', () => {
    it('should handle investment analysis toggle', async () => {
      const user = userEvent.setup()
      render(<Calculator />)
      
      // Should start disabled
      expect(screen.getByText(/enable/i)).toBeInTheDocument()
      expect(screen.queryByLabelText(/expected monthly rent/i)).not.toBeInTheDocument()
      
      // Enable investment analysis
      await user.click(screen.getByRole('button', { name: /enable/i }))
      
      await waitFor(() => {
        expect(screen.getByText(/enabled/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/expected monthly rent/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/property taxes/i)).toBeInTheDocument()
      })
    })

    it('should show investment tab when enabled', async () => {
      const user = userEvent.setup()
      render(<Calculator />)
      
      // Enable investment analysis
      await user.click(screen.getByRole('button', { name: /enable/i }))
      
      // Go to results
      await user.click(screen.getByRole('button', { name: /calculate results/i }))
      
      await waitFor(() => {
        // Should have investment tab
        expect(screen.getByRole('button', { name: /switch to investment analysis/i })).toBeInTheDocument()
      })
      
      // Click investment tab
      await user.click(screen.getByRole('button', { name: /switch to investment analysis/i }))
      
      await waitFor(() => {
        expect(screen.getByText(/monthly cash flow/i)).toBeInTheDocument()
      })
    })

    it('should not show investment tab when disabled', async () => {
      const user = userEvent.setup()
      render(<Calculator />)
      
      // Go to results without enabling investment
      await user.click(screen.getByRole('button', { name: /calculate results/i }))
      
      await waitFor(() => {
        // Should NOT have investment tab
        expect(screen.queryByRole('button', { name: /switch to investment analysis/i })).not.toBeInTheDocument()
      })
    })
  })

  describe('REGRESSION: Form Functionality', () => {
    it('should handle all form inputs correctly', async () => {
      const user = userEvent.setup()
      render(<Calculator />)
      
      // Test all inputs
      const homePriceInput = screen.getByLabelText(/home price/i)
      await user.clear(homePriceInput)
      await user.type(homePriceInput, '750000')
      
      const downPaymentInput = screen.getByLabelText(/down payment/i)
      await user.clear(downPaymentInput)
      await user.type(downPaymentInput, '150000')
      
      const interestRateInput = screen.getByLabelText(/interest rate/i)
      await user.clear(interestRateInput)
      await user.type(interestRateInput, '4.5')
      
      const amortizationSelect = screen.getByLabelText(/amortization period/i)
      await user.selectOptions(amortizationSelect, '30')
      
      const frequencySelect = screen.getByLabelText(/payment frequency/i)
      await user.selectOptions(frequencySelect, 'bi-weekly')
      
      const locationSelect = screen.getByLabelText(/location/i)
      await user.selectOptions(locationSelect, 'vancouver')
      
      const firstTimeBuyerCheckbox = screen.getByLabelText(/first-time homebuyer/i)
      await user.click(firstTimeBuyerCheckbox)
      
      // Verify all values
      expect(homePriceInput).toHaveValue(750000)
      expect(downPaymentInput).toHaveValue(150000)
      expect(interestRateInput).toHaveValue(4.5)
      expect(amortizationSelect).toHaveValue('30')
      expect(frequencySelect).toHaveValue('bi-weekly')
      expect(locationSelect).toHaveValue('vancouver')
      expect(firstTimeBuyerCheckbox).toBeChecked()
    })

    it('should calculate down payment percentage dynamically', async () => {
      const user = userEvent.setup()
      render(<Calculator />)
      
      const homePriceInput = screen.getByLabelText(/home price/i)
      const downPaymentInput = screen.getByLabelText(/down payment/i)
      
      // Set 25% down payment
      await user.clear(homePriceInput)
      await user.type(homePriceInput, '400000')
      
      await user.clear(downPaymentInput)
      await user.type(downPaymentInput, '100000')
      
      // Should show 25%
      await waitFor(() => {
        expect(screen.getByText('25%')).toBeInTheDocument()
      })
    })
  })

  describe('REGRESSION: Results Tab Functionality', () => {
    it('CRITICAL: should render all result tabs correctly', async () => {
      const user = userEvent.setup()
      render(<Calculator />)
      
      await user.click(screen.getByRole('button', { name: /calculate results/i }))
      
      await waitFor(() => {
        // Should have all required tabs
        expect(screen.getByRole('button', { name: /switch to mortgage summary/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /switch to closing costs/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /switch to amortization/i })).toBeInTheDocument()
      })
    })

    it('CRITICAL: should render charts without errors', async () => {
      const user = userEvent.setup()
      render(<Calculator />)
      
      await user.click(screen.getByRole('button', { name: /calculate results/i }))
      
      await waitFor(() => {
        // Should have charts on mortgage summary
        expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
        expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
        expect(screen.getAllByTestId('responsive-container')).toHaveLength(2)
      })
    })

    it('should switch between result tabs', async () => {
      const user = userEvent.setup()
      render(<Calculator />)
      
      await user.click(screen.getByRole('button', { name: /calculate results/i }))
      
      // Start on mortgage summary
      await waitFor(() => {
        expect(screen.getByText(/total cost breakdown/i)).toBeInTheDocument()
      })
      
      // Switch to closing costs
      await user.click(screen.getByRole('button', { name: /switch to closing costs/i }))
      
      await waitFor(() => {
        expect(screen.getByText(/total estimated closing costs/i)).toBeInTheDocument()
      })
      
      // Switch to amortization
      await user.click(screen.getByRole('button', { name: /switch to amortization/i }))
      
      await waitFor(() => {
        expect(screen.getByText(/total principal/i)).toBeInTheDocument()
      })
    })
  })

  describe('REGRESSION: Responsive Design', () => {
    it('should maintain step indicator on all screen sizes', () => {
      render(<Calculator />)
      
      // Should have responsive step indicator
      expect(screen.getByText('Input Details')).toBeInTheDocument()
      expect(screen.getByText('View Results')).toBeInTheDocument()
    })

    it('should handle responsive tab layout in results', async () => {
      const user = userEvent.setup()
      render(<Calculator />)
      
      await user.click(screen.getByRole('button', { name: /calculate results/i }))
      
      await waitFor(() => {
        // Should have responsive tab names
        expect(screen.getByText('Mortgage Summary')).toBeInTheDocument()
        expect(screen.getByText('Summary')).toBeInTheDocument()
        expect(screen.getByText('Closing Costs')).toBeInTheDocument()
        expect(screen.getByText('Closing')).toBeInTheDocument()
      })
    })
  })

  describe('REGRESSION: Data Accuracy', () => {
    it('should calculate results accurately', async () => {
      const user = userEvent.setup()
      render(<Calculator />)
      
      // Set specific values for predictable calculation
      const homePriceInput = screen.getByLabelText(/home price/i)
      await user.clear(homePriceInput)
      await user.type(homePriceInput, '500000')
      
      const downPaymentInput = screen.getByLabelText(/down payment/i)
      await user.clear(downPaymentInput)
      await user.type(downPaymentInput, '100000')
      
      // Go to results
      await user.click(screen.getByRole('button', { name: /calculate results/i }))
      
      await waitFor(() => {
        // Should show correct loan amount
        expect(screen.getByText('$400,000')).toBeInTheDocument() // 500k - 100k
        
        // Should show monthly payment
        expect(screen.getByText(/monthly payment/i)).toBeInTheDocument()
      })
    })
  })
})