import { describe, it, expect } from 'vitest'
import { render, screen } from './utils'
import Calculator from '../pages/Calculator'
import MortgageResults from '../components/MortgageResults'
import { MortgageData } from '../pages/Calculator'

/**
 * VISUAL REGRESSION TESTS
 * 
 * These tests ensure the visual structure and layout never regress
 * to older versions or lose important UI elements.
 */

const mockMortgageData: MortgageData = {
  homePrice: 500000,
  downPayment: 100000,
  interestRate: 5.25,
  amortizationYears: 25,
  paymentFrequency: 'monthly',
  province: 'ontario',
  city: 'toronto',
  isFirstTimeBuyer: false,
  enableInvestmentAnalysis: false
}

describe('Visual Regression Tests', () => {
  describe('REGRESSION: Calculator Page Layout', () => {
    it('CRITICAL: should maintain step-by-step layout structure', () => {
      render(<Calculator />)
      
      // Header structure
      expect(screen.getByText(/canadian mortgage calculator/i)).toBeInTheDocument()
      expect(screen.getByText(/professional mortgage calculations/i)).toBeInTheDocument()
      
      // Step indicator structure
      const stepIndicator = screen.getByText('Input Details').closest('div')
      expect(stepIndicator).toHaveClass('flex', 'items-center', 'space-x-2')
      
      // Content container
      expect(screen.getByTestId('calculator-content')).toHaveClass(
        'bg-white', 'rounded-xl', 'shadow-sm', 'border', 'border-slate-200', 'min-h-[600px]'
      )
    })

    it('REGRESSION: should never show old single-page layout', () => {
      render(<Calculator />)
      
      // Should NOT have old layout elements
      expect(screen.queryByText(/property information/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/investment property analysis/i)).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /calculate mortgage & investment/i })).not.toBeInTheDocument()
      
      // Should have new layout elements
      expect(screen.getByText(/input details/i)).toBeInTheDocument()
      expect(screen.getByText(/view results/i)).toBeInTheDocument()
    })

    it('REGRESSION: should maintain proper form layout', () => {
      render(<Calculator />)
      
      // Form should be properly structured
      expect(screen.getByText(/mortgage details/i)).toBeInTheDocument()
      expect(screen.getByText(/property & financing/i)).toBeInTheDocument()
      expect(screen.getByText(/investment property analysis/i)).toBeInTheDocument()
      
      // Form inputs should be in grid layout
      const homePriceInput = screen.getByLabelText(/home price/i)
      expect(homePriceInput.closest('div')).toHaveClass('relative')
      
      // Should have proper spacing and styling
      expect(screen.getByRole('button', { name: /calculate results/i })).toHaveClass(
        'flex', 'items-center', 'space-x-2', 'bg-blue-600'
      )
    })
  })

  describe('REGRESSION: Results Page Layout', () => {
    it('CRITICAL: should maintain tabbed results layout', () => {
      const mockOnBack = vi.fn()
      render(<MortgageResults data={mockMortgageData} onBack={mockOnBack} />)
      
      // Header with back button
      expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument()
      expect(screen.getByText('Results')).toBeInTheDocument()
      
      // Tab navigation
      const tabNavigation = screen.getByRole('navigation', { name: /results tabs/i })
      expect(tabNavigation).toBeInTheDocument()
      expect(tabNavigation.firstElementChild).toHaveClass('grid')
      
      // Tab content area
      expect(screen.getByText(/total cost breakdown/i)).toBeInTheDocument()
    })

    it('REGRESSION: should maintain responsive tab layout', () => {
      const mockOnBack = vi.fn()
      render(<MortgageResults data={mockMortgageData} onBack={mockOnBack} />)
      
      // Tabs should have responsive grid
      const tabContainer = screen.getByRole('navigation').firstElementChild
      expect(tabContainer).toHaveClass('grid', 'grid-cols-3') // 3 tabs without investment
      
      // Tabs should have proper structure
      const mortgageTab = screen.getByRole('button', { name: /switch to mortgage summary/i })
      expect(mortgageTab).toHaveClass('flex', 'flex-col', 'items-center')
      
      // Should have both full and short names for responsive design
      expect(screen.getByText('Mortgage Summary')).toBeInTheDocument()
      expect(screen.getByText('Summary')).toBeInTheDocument()
    })

    it('REGRESSION: should maintain chart layout structure', () => {
      const mockOnBack = vi.fn()
      render(<MortgageResults data={mockMortgageData} onBack={mockOnBack} />)
      
      // Should have chart sections
      expect(screen.getByText(/total cost breakdown/i)).toBeInTheDocument()
      expect(screen.getByText(/interest vs principal/i)).toBeInTheDocument()
      
      // Charts should be in proper grid layout
      const chartSections = screen.getAllByText(/breakdown|vs|over time/i)
      expect(chartSections.length).toBeGreaterThan(0)
    })
  })

  describe('REGRESSION: Component Styling', () => {
    it('should maintain consistent button styling', () => {
      render(<Calculator />)
      
      const calculateButton = screen.getByRole('button', { name: /calculate results/i })
      expect(calculateButton).toHaveClass(
        'flex', 'items-center', 'space-x-2', 'bg-blue-600', 'hover:bg-blue-700',
        'text-white', 'px-8', 'py-4', 'rounded-lg', 'font-medium'
      )
    })

    it('should maintain consistent input styling', () => {
      render(<Calculator />)
      
      const homePriceInput = screen.getByLabelText(/home price/i)
      expect(homePriceInput).toHaveClass(
        'w-full', 'pl-8', 'pr-3', 'py-3', 'border', 'border-slate-300',
        'rounded-lg', 'focus:ring-2', 'focus:ring-blue-500'
      )
    })

    it('should maintain consistent card styling', () => {
      render(<Calculator />)
      
      const contentCard = screen.getByTestId('calculator-content')
      expect(contentCard).toHaveClass(
        'bg-white', 'rounded-xl', 'shadow-sm', 'border', 'border-slate-200'
      )
    })

    it('should maintain consistent typography', () => {
      render(<Calculator />)
      
      const mainHeading = screen.getByText(/canadian mortgage calculator/i)
      expect(mainHeading).toHaveClass(
        'text-3xl', 'md:text-4xl', 'font-bold', 'font-heading', 'text-slate-900'
      )
    })
  })

  describe('REGRESSION: Investment Analysis Layout', () => {
    it('should maintain investment toggle layout', () => {
      render(<Calculator />)
      
      // Investment section should have proper styling
      const investmentSection = screen.getByText(/investment property analysis/i).closest('div')
      expect(investmentSection).toHaveClass(
        'bg-gradient-to-r', 'from-emerald-50', 'to-blue-50', 'rounded-xl'
      )
      
      // Toggle button should be properly styled
      const toggleButton = screen.getByRole('button', { name: /enable/i })
      expect(toggleButton).toHaveClass('flex', 'items-center', 'space-x-2')
    })

    it('should show investment fields with proper layout when enabled', async () => {
      const { user } = await import('@testing-library/user-event')
      const userEvent = user.setup()
      
      render(<Calculator />)
      
      await userEvent.click(screen.getByRole('button', { name: /enable/i }))
      
      // Investment fields should appear with proper grid layout
      expect(screen.getByLabelText(/expected monthly rent/i)).toBeInTheDocument()
      expect(screen.getByText(/monthly operating expenses/i)).toBeInTheDocument()
      
      // Should have grid layout for expenses
      const expensesContainer = screen.getByText(/monthly operating expenses/i).closest('div')
      const expensesGrid = expensesContainer?.querySelector('.grid')
      expect(expensesGrid).toHaveClass('grid', 'md:grid-cols-2', 'lg:grid-cols-3')
    })
  })

  describe('REGRESSION: Responsive Design Elements', () => {
    it('should maintain responsive step indicator', () => {
      render(<Calculator />)
      
      // Step indicator should be responsive
      const stepContainer = screen.getByText('Input Details').closest('div')?.parentElement
      expect(stepContainer).toHaveClass('flex', 'items-center', 'justify-center', 'space-x-4')
    })

    it('should maintain responsive form grid', () => {
      render(<Calculator />)
      
      // Form should have responsive grid
      const formSection = screen.getByText(/property & financing/i).closest('div')
      const gridContainer = formSection?.querySelector('.grid')
      expect(gridContainer).toHaveClass('grid', 'md:grid-cols-2')
    })

    it('should maintain responsive results tabs', () => {
      const mockOnBack = vi.fn()
      render(<MortgageResults data={mockMortgageData} onBack={mockOnBack} />)
      
      // Tab container should be responsive
      const tabContainer = screen.getByRole('navigation').firstElementChild
      expect(tabContainer).toHaveClass('grid', 'gap-1', 'grid-cols-3')
      
      // Individual tabs should have responsive content
      const tabs = screen.getAllByRole('button', { 
        name: /switch to/i 
      })
      
      tabs.forEach(tab => {
        expect(tab).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center')
      })
    })
  })

  describe('REGRESSION: Color Scheme and Branding', () => {
    it('should maintain consistent color scheme', () => {
      render(<Calculator />)
      
      // Primary blue colors
      const calculateButton = screen.getByRole('button', { name: /calculate results/i })
      expect(calculateButton).toHaveClass('bg-blue-600', 'hover:bg-blue-700')
      
      // Slate colors for text
      const subtitle = screen.getByText(/professional mortgage calculations/i)
      expect(subtitle).toHaveClass('text-slate-600')
    })

    it('should maintain investment section colors', () => {
      render(<Calculator />)
      
      // Investment section should have emerald/blue gradient
      const investmentSection = screen.getByText(/investment property analysis/i).closest('div')
      expect(investmentSection).toHaveClass('bg-gradient-to-r', 'from-emerald-50', 'to-blue-50')
    })

    it('should maintain consistent spacing system', () => {
      render(<Calculator />)
      
      // Should use consistent spacing classes
      const mainContainer = screen.getByTestId('calculator-content').parentElement
      expect(mainContainer).toHaveClass('space-y-8')
      
      // Form sections should have consistent spacing
      const formContainer = screen.getByText(/mortgage details/i).closest('div')
      expect(formContainer).toHaveClass('space-y-8')
    })
  })
})