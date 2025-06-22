import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../../test/utils'
import userEvent from '@testing-library/user-event'
import MortgageResults from '../MortgageResults'
import { MortgageData } from '../../pages/Calculator'

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

// Mock Recharts components to avoid rendering issues in tests
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

const mockMortgageData: MortgageData = {
  homePrice: 500000,
  downPayment: 100000,
  interestRate: 5.25,
  amortizationYears: 25,
  paymentFrequency: 'monthly',
  province: 'ontario',
  city: 'toronto',
  isFirstTimeBuyer: false,
  enableInvestmentAnalysis: false,
  monthlyRent: 2500,
  monthlyExpenses: {
    taxes: 400,
    insurance: 150,
    condoFees: 300,
    maintenance: 200,
    other: 100
  }
}

const mockMortgageDataWithInvestment: MortgageData = {
  ...mockMortgageData,
  enableInvestmentAnalysis: true
}

describe('MortgageResults', () => {
  const mockOnBack = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('should render all main components', () => {
      render(<MortgageResults data={mockMortgageData} onBack={mockOnBack} />)
      
      expect(screen.getByText('Results')).toBeInTheDocument()
      expect(screen.getByText('Back')).toBeInTheDocument()
      expect(screen.getByRole('navigation', { name: /results tabs/i })).toBeInTheDocument()
    })

    it('should show correct number of tabs based on investment analysis setting', () => {
      const { rerender } = render(<MortgageResults data={mockMortgageData} onBack={mockOnBack} />)
      
      // Without investment analysis - should have 3 tabs
      const tabsWithoutInvestment = screen.getAllByRole('button').filter(button => 
        button.getAttribute('aria-label')?.includes('Switch to')
      )
      expect(tabsWithoutInvestment).toHaveLength(3)
      
      // With investment analysis - should have 4 tabs
      rerender(<MortgageResults data={mockMortgageDataWithInvestment} onBack={mockOnBack} />)
      const tabsWithInvestment = screen.getAllByRole('button').filter(button => 
        button.getAttribute('aria-label')?.includes('Switch to')
      )
      expect(tabsWithInvestment).toHaveLength(4)
    })

    it('should start with mortgage summary tab active', () => {
      render(<MortgageResults data={mockMortgageData} onBack={mockOnBack} />)
      
      const mortgageTab = screen.getByRole('button', { name: /switch to mortgage summary/i })
      expect(mortgageTab).toHaveClass('bg-blue-100', 'text-blue-700')
    })
  })

  describe('Mortgage Summary Tab', () => {
    it('should display calculated mortgage payment', async () => {
      render(<MortgageResults data={mockMortgageData} onBack={mockOnBack} />)
      
      // Wait for calculations to complete
      await waitFor(() => {
        // Should show a monthly payment (approximate calculation)
        expect(screen.getByText(/monthly payment/i)).toBeInTheDocument()
        // Should show dollar amounts
        expect(screen.getByText(/\$[\d,]+/)).toBeInTheDocument()
      })
    })

    it('should show all required financial metrics', async () => {
      render(<MortgageResults data={mockMortgageData} onBack={mockOnBack} />)
      
      await waitFor(() => {
        expect(screen.getByText(/loan amount/i)).toBeInTheDocument()
        expect(screen.getByText(/total interest/i)).toBeInTheDocument()
        expect(screen.getByText(/down payment/i)).toBeInTheDocument()
        expect(screen.getByText(/total cost/i)).toBeInTheDocument()
      })
    })

    it('REGRESSION: should render all charts without errors', async () => {
      render(<MortgageResults data={mockMortgageData} onBack={mockOnBack} />)
      
      await waitFor(() => {
        // Check for chart components that were causing issues
        expect(screen.getByText(/total cost breakdown/i)).toBeInTheDocument()
        expect(screen.getByText(/interest vs principal/i)).toBeInTheDocument()
        
        // Verify chart containers are rendered
        expect(screen.getAllByTestId('responsive-container')).toHaveLength(2) // At least 2 charts
        expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
        expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
      })
    })

    it('REGRESSION: should display interest percentage correctly', async () => {
      render(<MortgageResults data={mockMortgageData} onBack={mockOnBack} />)
      
      await waitFor(() => {
        // Should show interest percentage in the summary
        expect(screen.getByText(/interest represents/i)).toBeInTheDocument()
        expect(screen.getByText(/% of your total payments/i)).toBeInTheDocument()
      })
    })

    it('should show property summary information', async () => {
      render(<MortgageResults data={mockMortgageData} onBack={mockOnBack} />)
      
      await waitFor(() => {
        expect(screen.getByText(/property summary/i)).toBeInTheDocument()
        expect(screen.getByText('$500,000')).toBeInTheDocument() // Purchase price
        expect(screen.getByText('5.25%')).toBeInTheDocument() // Interest rate
        expect(screen.getByText('25 years')).toBeInTheDocument() // Amortization
        expect(screen.getByText('Toronto, ON')).toBeInTheDocument() // Location
      })
    })

    it('should show first-time buyer indicator when applicable', async () => {
      const firstTimeBuyerData = { ...mockMortgageData, isFirstTimeBuyer: true }
      render(<MortgageResults data={firstTimeBuyerData} onBack={mockOnBack} />)
      
      await waitFor(() => {
        expect(screen.getByText(/first-time homebuyer benefits applied/i)).toBeInTheDocument()
      })
    })
  })

  describe('Tab Navigation', () => {
    it('should switch between tabs correctly', async () => {
      const user = userEvent.setup()
      render(<MortgageResults data={mockMortgageData} onBack={mockOnBack} />)
      
      // Start on mortgage tab
      expect(screen.getByText(/total cost breakdown/i)).toBeInTheDocument()
      
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

    it('should show investment tab only when enabled', async () => {
      const user = userEvent.setup()
      const { rerender } = render(<MortgageResults data={mockMortgageData} onBack={mockOnBack} />)
      
      // Should not have investment tab
      expect(screen.queryByRole('button', { name: /switch to investment analysis/i })).not.toBeInTheDocument()
      
      // Enable investment analysis
      rerender(<MortgageResults data={mockMortgageDataWithInvestment} onBack={mockOnBack} />)
      
      // Should now have investment tab
      expect(screen.getByRole('button', { name: /switch to investment analysis/i })).toBeInTheDocument()
      
      // Should be able to click it
      await user.click(screen.getByRole('button', { name: /switch to investment analysis/i }))
      await waitFor(() => {
        expect(screen.getByText(/monthly cash flow/i)).toBeInTheDocument()
      })
    })
  })

  describe('Closing Costs Tab', () => {
    it('should calculate and display closing costs', async () => {
      const user = userEvent.setup()
      render(<MortgageResults data={mockMortgageData} onBack={mockOnBack} />)
      
      await user.click(screen.getByRole('button', { name: /switch to closing costs/i }))
      
      await waitFor(() => {
        expect(screen.getByText(/total estimated closing costs/i)).toBeInTheDocument()
        expect(screen.getByText(/cash required at closing/i)).toBeInTheDocument()
        expect(screen.getByText(/ontario land transfer tax/i)).toBeInTheDocument()
        expect(screen.getByText(/toronto municipal land transfer tax/i)).toBeInTheDocument()
      })
    })

    it('should show different taxes for different provinces', async () => {
      const user = userEvent.setup()
      const bcData = { ...mockMortgageData, province: 'bc' as const, city: 'vancouver' as const }
      render(<MortgageResults data={bcData} onBack={mockOnBack} />)
      
      await user.click(screen.getByRole('button', { name: /switch to closing costs/i }))
      
      await waitFor(() => {
        expect(screen.getByText(/bc property transfer tax/i)).toBeInTheDocument()
        expect(screen.queryByText(/toronto municipal land transfer tax/i)).not.toBeInTheDocument()
      })
    })

    it('should show first-time buyer rebate when applicable', async () => {
      const user = userEvent.setup()
      const firstTimeBuyerData = { ...mockMortgageData, isFirstTimeBuyer: true }
      render(<MortgageResults data={firstTimeBuyerData} onBack={mockOnBack} />)
      
      await user.click(screen.getByRole('button', { name: /switch to closing costs/i }))
      
      await waitFor(() => {
        expect(screen.getByText(/first-time buyer rebate/i)).toBeInTheDocument()
      })
    })
  })

  describe('Amortization Tab', () => {
    it('should display amortization schedule and charts', async () => {
      const user = userEvent.setup()
      render(<MortgageResults data={mockMortgageData} onBack={mockOnBack} />)
      
      await user.click(screen.getByRole('button', { name: /switch to amortization/i }))
      
      await waitFor(() => {
        expect(screen.getByText(/total principal/i)).toBeInTheDocument()
        expect(screen.getByText(/total interest/i)).toBeInTheDocument()
        expect(screen.getByText(/principal vs interest over time/i)).toBeInTheDocument()
        expect(screen.getByText(/remaining balance/i)).toBeInTheDocument()
      })
    })

    it('REGRESSION: should render amortization charts without errors', async () => {
      const user = userEvent.setup()
      render(<MortgageResults data={mockMortgageData} onBack={mockOnBack} />)
      
      await user.click(screen.getByRole('button', { name: /switch to amortization/i }))
      
      await waitFor(() => {
        // Should have chart components
        expect(screen.getAllByTestId('responsive-container').length).toBeGreaterThan(0)
        expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
        expect(screen.getByTestId('line-chart')).toBeInTheDocument()
      })
    })
  })

  describe('Investment Analysis Tab', () => {
    it('should display investment metrics when enabled', async () => {
      const user = userEvent.setup()
      render(<MortgageResults data={mockMortgageDataWithInvestment} onBack={mockOnBack} />)
      
      await user.click(screen.getByRole('button', { name: /switch to investment analysis/i }))
      
      await waitFor(() => {
        expect(screen.getByText(/monthly cash flow/i)).toBeInTheDocument()
        expect(screen.getByText(/cap rate/i)).toBeInTheDocument()
        expect(screen.getByText(/roi/i)).toBeInTheDocument()
        expect(screen.getByText(/financial breakdown/i)).toBeInTheDocument()
      })
    })

    it('should show investment warnings for poor investments', async () => {
      const user = userEvent.setup()
      const poorInvestmentData = {
        ...mockMortgageDataWithInvestment,
        monthlyRent: 1500, // Low rent relative to expenses
        homePrice: 800000 // High price
      }
      render(<MortgageResults data={poorInvestmentData} onBack={mockOnBack} />)
      
      await user.click(screen.getByRole('button', { name: /switch to investment analysis/i }))
      
      await waitFor(() => {
        expect(screen.getByText(/investment warnings/i)).toBeInTheDocument()
      })
    })

    it('should display investment tips', async () => {
      const user = userEvent.setup()
      render(<MortgageResults data={mockMortgageDataWithInvestment} onBack={mockOnBack} />)
      
      await user.click(screen.getByRole('button', { name: /switch to investment analysis/i }))
      
      await waitFor(() => {
        expect(screen.getByText(/investment tips/i)).toBeInTheDocument()
        expect(screen.getByText(/consider vacancy rates/i)).toBeInTheDocument()
      })
    })
  })

  describe('Action Buttons', () => {
    it('should render save and share buttons', () => {
      render(<MortgageResults data={mockMortgageData} onBack={mockOnBack} />)
      
      expect(screen.getByRole('button', { name: /save calculation|save & share/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument()
    })

    it('should handle back button click', async () => {
      const user = userEvent.setup()
      render(<MortgageResults data={mockMortgageData} onBack={mockOnBack} />)
      
      await user.click(screen.getByRole('button', { name: /back/i }))
      expect(mockOnBack).toHaveBeenCalled()
    })

    it('should handle save button click', async () => {
      const user = userEvent.setup()
      const mockSaveCalculation = vi.fn(() => Promise.resolve('test-id'))
      
      vi.mocked(require('../../contexts/CalculationContext').useCalculations).mockReturnValue({
        saveCalculation: mockSaveCalculation,
        calculations: []
      })
      
      render(<MortgageResults data={mockMortgageData} onBack={mockOnBack} />)
      
      await user.click(screen.getByRole('button', { name: /save calculation|save & share/i }))
      
      await waitFor(() => {
        expect(mockSaveCalculation).toHaveBeenCalled()
      })
    })
  })

  describe('Responsive Design', () => {
    it('should show appropriate tab names on different screen sizes', () => {
      render(<MortgageResults data={mockMortgageData} onBack={mockOnBack} />)
      
      // Should have both full names (hidden on mobile) and short names (hidden on desktop)
      expect(screen.getByText('Mortgage Summary')).toBeInTheDocument()
      expect(screen.getByText('Summary')).toBeInTheDocument()
      expect(screen.getByText('Closing Costs')).toBeInTheDocument()
      expect(screen.getByText('Closing')).toBeInTheDocument()
    })

    it('should have proper grid layout for tabs', () => {
      render(<MortgageResults data={mockMortgageData} onBack={mockOnBack} />)
      
      const tabNavigation = screen.getByRole('navigation', { name: /results tabs/i })
      const tabContainer = tabNavigation.firstElementChild
      expect(tabContainer).toHaveClass('grid', 'grid-cols-3') // 3 tabs without investment
    })

    it('should adjust grid layout when investment analysis is enabled', () => {
      render(<MortgageResults data={mockMortgageDataWithInvestment} onBack={mockOnBack} />)
      
      const tabNavigation = screen.getByRole('navigation', { name: /results tabs/i })
      const tabContainer = tabNavigation.firstElementChild
      expect(tabContainer).toHaveClass('grid', 'grid-cols-2', 'sm:grid-cols-4') // 4 tabs with investment
    })
  })

  describe('REGRESSION: Chart Functionality', () => {
    it('CRITICAL: should never have undefined chart components', async () => {
      render(<MortgageResults data={mockMortgageData} onBack={mockOnBack} />)
      
      await waitFor(() => {
        // These specific chart types caused the original error
        expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
        expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
        
        // Verify no undefined components are being rendered
        expect(screen.queryByText('undefined')).not.toBeInTheDocument()
      })
    })

    it('CRITICAL: should render Interest vs Principal chart correctly', async () => {
      render(<MortgageResults data={mockMortgageData} onBack={mockOnBack} />)
      
      await waitFor(() => {
        // This specific chart was causing the "Pie is not defined" error
        expect(screen.getByText(/interest vs principal/i)).toBeInTheDocument()
        expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
        
        // Should show the percentage text
        expect(screen.getByText(/interest represents.*% of your total payments/i)).toBeInTheDocument()
      })
    })

    it('CRITICAL: should handle chart data correctly', async () => {
      render(<MortgageResults data={mockMortgageData} onBack={mockOnBack} />)
      
      await waitFor(() => {
        // Charts should render with proper data structure
        const charts = screen.getAllByTestId('responsive-container')
        expect(charts.length).toBeGreaterThan(0)
        
        // Should not throw errors when rendering
        expect(() => screen.getByText(/total cost breakdown/i)).not.toThrow()
        expect(() => screen.getByText(/interest vs principal/i)).not.toThrow()
      })
    })

    it('CRITICAL: should maintain chart functionality across tab switches', async () => {
      const user = userEvent.setup()
      render(<MortgageResults data={mockMortgageData} onBack={mockOnBack} />)
      
      // Start on mortgage tab with charts
      await waitFor(() => {
        expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
      })
      
      // Switch to amortization tab
      await user.click(screen.getByRole('button', { name: /switch to amortization/i }))
      await waitFor(() => {
        expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
        expect(screen.getByTestId('line-chart')).toBeInTheDocument()
      })
      
      // Switch back to mortgage tab
      await user.click(screen.getByRole('button', { name: /switch to mortgage summary/i }))
      await waitFor(() => {
        // Charts should still render correctly
        expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
        expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
      })
    })
  })

  describe('Data Accuracy', () => {
    it('should calculate mortgage payment correctly', async () => {
      render(<MortgageResults data={mockMortgageData} onBack={mockOnBack} />)
      
      await waitFor(() => {
        // With $400k loan at 5.25% for 25 years, payment should be around $2,400
        const paymentElements = screen.getAllByText(/\$2,\d{3}/)
        expect(paymentElements.length).toBeGreaterThan(0)
      })
    })

    it('should calculate loan amount correctly', async () => {
      render(<MortgageResults data={mockMortgageData} onBack={mockOnBack} />)
      
      await waitFor(() => {
        // $500k home - $100k down = $400k loan
        expect(screen.getByText('$400,000')).toBeInTheDocument()
      })
    })

    it('should calculate down payment percentage correctly', async () => {
      render(<MortgageResults data={mockMortgageData} onBack={mockOnBack} />)
      
      await waitFor(() => {
        // $100k down on $500k home = 20%
        expect(screen.getByText('20% down')).toBeInTheDocument()
      })
    })
  })
})