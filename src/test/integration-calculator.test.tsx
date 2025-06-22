import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from './utils'
import userEvent from '@testing-library/user-event'
import Calculator from '../pages/Calculator'

/**
 * INTEGRATION TESTS FOR CALCULATOR FUNCTIONALITY
 * 
 * These tests ensure the complete calculator workflow works correctly
 * and prevent regressions in the step-by-step process.
 */

// Mock contexts
vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: null,
    loading: false
  }))
}))

vi.mock('../contexts/CalculationContext', () => ({
  useCalculations: vi.fn(() => ({
    saveCalculation: vi.fn(() => Promise.resolve('test-id')),
    calculations: []
  }))
}))

// Mock Recharts to avoid rendering issues
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

describe('Calculator Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('REGRESSION: Complete Calculator Workflow', () => {
    it('CRITICAL: should complete full mortgage calculation workflow', async () => {
      const user = userEvent.setup()
      render(<Calculator />)

      // Step 1: Should start on input form
      expect(screen.getByText(/mortgage details/i)).toBeInTheDocument()
      expect(screen.getByText(/input details/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /calculate results/i })).toBeInTheDocument()

      // Fill in mortgage details
      const homePriceInput = screen.getByLabelText(/home price/i)
      await user.clear(homePriceInput)
      await user.type(homePriceInput, '500000')

      const downPaymentInput = screen.getByLabelText(/down payment/i)
      await user.clear(downPaymentInput)
      await user.type(downPaymentInput, '100000')

      const interestRateInput = screen.getByLabelText(/interest rate/i)
      await user.clear(interestRateInput)
      await user.type(interestRateInput, '5.25')

      // Proceed to results
      await user.click(screen.getByRole('button', { name: /calculate results/i }))

      // Step 2: Should show results
      await waitFor(() => {
        expect(screen.getByText(/view results/i)).toBeInTheDocument()
        expect(screen.getByText(/monthly payment/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument()
      })

      // Should show calculated results
      expect(screen.getByText(/total cost breakdown/i)).toBeInTheDocument()
      expect(screen.getByText(/interest vs principal/i)).toBeInTheDocument()

      // Should be able to go back
      await user.click(screen.getByRole('button', { name: /back/i }))
      
      await waitFor(() => {
        expect(screen.getByText(/input details/i)).toBeInTheDocument()
        expect(screen.getByText(/mortgage details/i)).toBeInTheDocument()
      })
    })

    it('CRITICAL: should maintain form data when navigating back and forth', async () => {
      const user = userEvent.setup()
      render(<Calculator />)

      // Fill in custom values
      const homePriceInput = screen.getByLabelText(/home price/i)
      await user.clear(homePriceInput)
      await user.type(homePriceInput, '750000')

      const downPaymentInput = screen.getByLabelText(/down payment/i)
      await user.clear(downPaymentInput)
      await user.type(downPaymentInput, '150000')

      // Go to results
      await user.click(screen.getByRole('button', { name: /calculate results/i }))

      await waitFor(() => {
        expect(screen.getByText(/view results/i)).toBeInTheDocument()
      })

      // Go back to form
      await user.click(screen.getByRole('button', { name: /back/i }))

      await waitFor(() => {
        // Values should be preserved
        expect(screen.getByDisplayValue('750000')).toBeInTheDocument()
        expect(screen.getByDisplayValue('150000')).toBeInTheDocument()
      })
    })

    it('CRITICAL: should handle investment analysis workflow', async () => {
      const user = userEvent.setup()
      render(<Calculator />)

      // Enable investment analysis
      const investmentToggle = screen.getByRole('button', { name: /enable/i })
      await user.click(investmentToggle)

      // Should show investment fields
      await waitFor(() => {
        expect(screen.getByLabelText(/expected monthly rent/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/property taxes/i)).toBeInTheDocument()
      })

      // Fill in investment data
      const rentInput = screen.getByLabelText(/expected monthly rent/i)
      await user.clear(rentInput)
      await user.type(rentInput, '3000')

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
        expect(screen.getByText(/cap rate/i)).toBeInTheDocument()
      })
    })
  })

  describe('REGRESSION: Step Indicator Functionality', () => {
    it('should show correct step indicators', () => {
      render(<Calculator />)

      // Should show step 1 as active
      const step1 = screen.getByText('1')
      const step2 = screen.getByText('2')
      
      expect(step1.closest('span')).toHaveClass('bg-blue-600', 'text-white')
      expect(step2.closest('span')).toHaveClass('bg-slate-400', 'text-white')
    })

    it('should update step indicators when navigating', async () => {
      const user = userEvent.setup()
      render(<Calculator />)

      // Go to step 2
      await user.click(screen.getByRole('button', { name: /calculate results/i }))

      await waitFor(() => {
        const step1 = screen.getByText('1')
        const step2 = screen.getByText('2')
        
        // Step 2 should now be active
        expect(step2.closest('span')).toHaveClass('bg-blue-600', 'text-white')
        expect(step1.closest('span')).toHaveClass('bg-slate-400', 'text-white')
      })
    })
  })

  describe('REGRESSION: Form Validation and UX', () => {
    it('should calculate down payment percentage dynamically', async () => {
      const user = userEvent.setup()
      render(<Calculator />)

      const homePriceInput = screen.getByLabelText(/home price/i)
      const downPaymentInput = screen.getByLabelText(/down payment/i)

      // Change home price
      await user.clear(homePriceInput)
      await user.type(homePriceInput, '400000')

      // Change down payment
      await user.clear(downPaymentInput)
      await user.type(downPaymentInput, '80000')

      // Should show 20% (80k / 400k)
      await waitFor(() => {
        expect(screen.getByText('20%')).toBeInTheDocument()
      })
    })

    it('should handle location selection correctly', async () => {
      const user = userEvent.setup()
      render(<Calculator />)

      const locationSelect = screen.getByLabelText(/location/i)
      
      // Should start with Toronto
      expect(locationSelect).toHaveValue('toronto')

      // Change to Vancouver
      await user.selectOptions(locationSelect, 'vancouver')
      expect(locationSelect).toHaveValue('vancouver')

      // Go to results and check closing costs
      await user.click(screen.getByRole('button', { name: /calculate results/i }))

      await waitFor(() => {
        // Switch to closing costs tab
        user.click(screen.getByRole('button', { name: /switch to closing costs/i }))
      })

      await waitFor(() => {
        // Should show BC tax instead of Ontario tax
        expect(screen.getByText(/bc property transfer tax/i)).toBeInTheDocument()
        expect(screen.queryByText(/ontario land transfer tax/i)).not.toBeInTheDocument()
      })
    })

    it('should handle first-time buyer checkbox', async () => {
      const user = userEvent.setup()
      render(<Calculator />)

      const firstTimeBuyerCheckbox = screen.getByLabelText(/first-time homebuyer/i)
      
      // Should start unchecked
      expect(firstTimeBuyerCheckbox).not.toBeChecked()

      // Check it
      await user.click(firstTimeBuyerCheckbox)
      expect(firstTimeBuyerCheckbox).toBeChecked()

      // Go to results
      await user.click(screen.getByRole('button', { name: /calculate results/i }))

      await waitFor(() => {
        // Should show first-time buyer benefits
        expect(screen.getByText(/first-time homebuyer benefits applied/i)).toBeInTheDocument()
      })
    })
  })

  describe('REGRESSION: Results Tab Functionality', () => {
    it('should show all required tabs in results', async () => {
      const user = userEvent.setup()
      render(<Calculator />)

      await user.click(screen.getByRole('button', { name: /calculate results/i }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /switch to mortgage summary/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /switch to closing costs/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /switch to amortization/i })).toBeInTheDocument()
      })
    })

    it('should switch between result tabs correctly', async () => {
      const user = userEvent.setup()
      render(<Calculator />)

      await user.click(screen.getByRole('button', { name: /calculate results/i }))

      await waitFor(() => {
        // Start on mortgage summary
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

    it('CRITICAL: should render all charts without errors', async () => {
      const user = userEvent.setup()
      render(<Calculator />)

      await user.click(screen.getByRole('button', { name: /calculate results/i }))

      await waitFor(() => {
        // Mortgage summary charts
        expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
        expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
      })

      // Switch to amortization
      await user.click(screen.getByRole('button', { name: /switch to amortization/i }))

      await waitFor(() => {
        // Amortization charts
        expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
        expect(screen.getByTestId('line-chart')).toBeInTheDocument()
      })
    })
  })

  describe('REGRESSION: Responsive Design', () => {
    it('should maintain functionality on mobile layout', async () => {
      const user = userEvent.setup()
      render(<Calculator />)

      // Should show mobile-friendly tab names
      await user.click(screen.getByRole('button', { name: /calculate results/i }))

      await waitFor(() => {
        // Should have both full names and short names for responsive design
        expect(screen.getByText('Mortgage Summary')).toBeInTheDocument()
        expect(screen.getByText('Summary')).toBeInTheDocument()
      })
    })

    it('should handle step indicator on mobile', () => {
      render(<Calculator />)

      // Step indicator should be responsive
      expect(screen.getByText('Input Details')).toBeInTheDocument()
      expect(screen.getByText('View Results')).toBeInTheDocument()
    })
  })

  describe('REGRESSION: Data Persistence', () => {
    it('should maintain calculation accuracy across navigation', async () => {
      const user = userEvent.setup()
      render(<Calculator />)

      // Set specific values
      const homePriceInput = screen.getByLabelText(/home price/i)
      await user.clear(homePriceInput)
      await user.type(homePriceInput, '600000')

      const downPaymentInput = screen.getByLabelText(/down payment/i)
      await user.clear(downPaymentInput)
      await user.type(downPaymentInput, '120000')

      // Go to results
      await user.click(screen.getByRole('button', { name: /calculate results/i }))

      await waitFor(() => {
        // Should show correct loan amount (600k - 120k = 480k)
        expect(screen.getByText('$480,000')).toBeInTheDocument()
      })

      // Go back and forth
      await user.click(screen.getByRole('button', { name: /back/i }))
      await user.click(screen.getByRole('button', { name: /calculate results/i }))

      await waitFor(() => {
        // Should still show correct calculation
        expect(screen.getByText('$480,000')).toBeInTheDocument()
      })
    })
  })
})