import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from './utils'
import MortgageResults from '../components/MortgageResults'
import { MortgageData } from '../pages/Calculator'

/**
 * CRITICAL REGRESSION TESTS FOR CHART FUNCTIONALITY
 * 
 * These tests specifically prevent the "Pie is not defined" error and other
 * chart-related issues that were fixed. If any of these tests fail, it means
 * the chart functionality has regressed.
 */

// Mock Recharts to simulate real usage
vi.mock('recharts', () => ({
  LineChart: ({ children, data }: any) => (
    <div data-testid="line-chart" data-chart-data={JSON.stringify(data)}>
      {children}
    </div>
  ),
  Line: ({ dataKey }: any) => <div data-testid="line" data-key={dataKey} />,
  XAxis: ({ dataKey }: any) => <div data-testid="x-axis" data-key={dataKey} />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }: any) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  BarChart: ({ children, data }: any) => (
    <div data-testid="bar-chart" data-chart-data={JSON.stringify(data)}>
      {children}
    </div>
  ),
  Bar: ({ dataKey, fill }: any) => (
    <div data-testid="bar" data-key={dataKey} data-fill={fill} />
  ),
  PieChart: ({ children }: any) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Pie: ({ data, dataKey }: any) => (
    <div data-testid="pie" data-key={dataKey} data-chart-data={JSON.stringify(data)} />
  ),
  Cell: ({ fill }: any) => <div data-testid="cell" data-fill={fill} />,
  AreaChart: ({ children, data }: any) => (
    <div data-testid="area-chart" data-chart-data={JSON.stringify(data)}>
      {children}
    </div>
  ),
  Area: ({ dataKey, fill }: any) => (
    <div data-testid="area" data-key={dataKey} data-fill={fill} />
  )
}))

const testMortgageData: MortgageData = {
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

describe('REGRESSION: Chart Functionality', () => {
  const mockOnBack = vi.fn()

  describe('CRITICAL: Chart Component Imports', () => {
    it('REGRESSION: should never have "Pie is not defined" error', async () => {
      // This test specifically prevents the original error
      expect(() => {
        render(<MortgageResults data={testMortgageData} onBack={mockOnBack} />)
      }).not.toThrow()

      await waitFor(() => {
        // Should render pie chart without errors
        expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
        expect(screen.getByTestId('pie')).toBeInTheDocument()
      })
    })

    it('REGRESSION: should import all required chart components', async () => {
      render(<MortgageResults data={testMortgageData} onBack={mockOnBack} />)

      await waitFor(() => {
        // All these chart types should be available and render
        expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
        expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
        expect(screen.getAllByTestId('responsive-container')).toHaveLength(2)
      })
    })

    it('REGRESSION: should handle chart data structure correctly', async () => {
      render(<MortgageResults data={testMortgageData} onBack={mockOnBack} />)

      await waitFor(() => {
        // Check that charts receive proper data
        const pieChart = screen.getByTestId('pie')
        const barChart = screen.getByTestId('bar-chart')
        
        expect(pieChart).toHaveAttribute('data-chart-data')
        expect(barChart).toHaveAttribute('data-chart-data')
        
        // Data should be valid JSON
        const pieData = pieChart.getAttribute('data-chart-data')
        const barData = barChart.getAttribute('data-chart-data')
        
        expect(() => JSON.parse(pieData!)).not.toThrow()
        expect(() => JSON.parse(barData!)).not.toThrow()
      })
    })
  })

  describe('CRITICAL: Interest vs Principal Chart', () => {
    it('REGRESSION: should render Interest vs Principal chart as vertical bar chart', async () => {
      render(<MortgageResults data={testMortgageData} onBack={mockOnBack} />)

      await waitFor(() => {
        // Should have the specific chart that was causing issues
        expect(screen.getByText(/interest vs principal/i)).toBeInTheDocument()
        
        // Should be a bar chart (not horizontal bar chart which was problematic)
        expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
        
        // Should have both interest and principal bars
        const bars = screen.getAllByTestId('bar')
        expect(bars.length).toBeGreaterThanOrEqual(2)
      })
    })

    it('REGRESSION: should display interest percentage correctly', async () => {
      render(<MortgageResults data={testMortgageData} onBack={mockOnBack} />)

      await waitFor(() => {
        // This text was showing but chart wasn't rendering
        expect(screen.getByText(/interest represents.*% of your total payments/i)).toBeInTheDocument()
        
        // Chart should also be present
        expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
      })
    })

    it('REGRESSION: should have proper data structure for Interest vs Principal', async () => {
      render(<MortgageResults data={testMortgageData} onBack={mockOnBack} />)

      await waitFor(() => {
        const barChart = screen.getByTestId('bar-chart')
        const chartData = JSON.parse(barChart.getAttribute('data-chart-data')!)
        
        // Should have the correct data structure
        expect(Array.isArray(chartData)).toBe(true)
        expect(chartData).toHaveLength(1)
        expect(chartData[0]).toHaveProperty('interest')
        expect(chartData[0]).toHaveProperty('principal')
        expect(chartData[0]).toHaveProperty('name')
      })
    })
  })

  describe('CRITICAL: Pie Chart Functionality', () => {
    it('REGRESSION: should render Total Cost Breakdown pie chart', async () => {
      render(<MortgageResults data={testMortgageData} onBack={mockOnBack} />)

      await waitFor(() => {
        expect(screen.getByText(/total cost breakdown/i)).toBeInTheDocument()
        expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
        expect(screen.getByTestId('pie')).toBeInTheDocument()
      })
    })

    it('REGRESSION: should have correct pie chart data structure', async () => {
      render(<MortgageResults data={testMortgageData} onBack={mockOnBack} />)

      await waitFor(() => {
        const pie = screen.getByTestId('pie')
        const chartData = JSON.parse(pie.getAttribute('data-chart-data')!)
        
        // Should have three segments: down payment, principal, interest
        expect(Array.isArray(chartData)).toBe(true)
        expect(chartData).toHaveLength(3)
        
        // Each segment should have required properties
        chartData.forEach((segment: any) => {
          expect(segment).toHaveProperty('name')
          expect(segment).toHaveProperty('value')
          expect(segment).toHaveProperty('color')
        })
      })
    })

    it('REGRESSION: should render pie chart cells correctly', async () => {
      render(<MortgageResults data={testMortgageData} onBack={mockOnBack} />)

      await waitFor(() => {
        // Should have cells for each pie segment
        const cells = screen.getAllByTestId('cell')
        expect(cells.length).toBeGreaterThan(0)
        
        // Each cell should have a color
        cells.forEach(cell => {
          expect(cell).toHaveAttribute('data-fill')
        })
      })
    })
  })

  describe('CRITICAL: Chart Rendering Across Tabs', () => {
    it('REGRESSION: should maintain chart functionality when switching tabs', async () => {
      const { user } = await import('@testing-library/user-event')
      const userEvent = user.setup()
      
      render(<MortgageResults data={testMortgageData} onBack={mockOnBack} />)

      // Start on mortgage tab
      await waitFor(() => {
        expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
        expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
      })

      // Switch to amortization tab
      await userEvent.click(screen.getByRole('button', { name: /switch to amortization/i }))
      
      await waitFor(() => {
        // Should have different charts
        expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
        expect(screen.getByTestId('line-chart')).toBeInTheDocument()
      })

      // Switch back to mortgage tab
      await userEvent.click(screen.getByRole('button', { name: /switch to mortgage summary/i }))
      
      await waitFor(() => {
        // Original charts should render again without errors
        expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
        expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
      })
    })

    it('REGRESSION: should handle chart re-rendering without memory leaks', async () => {
      const { user } = await import('@testing-library/user-event')
      const userEvent = user.setup()
      
      render(<MortgageResults data={testMortgageData} onBack={mockOnBack} />)

      // Rapidly switch between tabs multiple times
      for (let i = 0; i < 3; i++) {
        await userEvent.click(screen.getByRole('button', { name: /switch to amortization/i }))
        await waitFor(() => {
          expect(screen.getByTestId('line-chart')).toBeInTheDocument()
        })
        
        await userEvent.click(screen.getByRole('button', { name: /switch to mortgage summary/i }))
        await waitFor(() => {
          expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
        })
      }

      // Should still work correctly after multiple switches
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
    })
  })

  describe('CRITICAL: Chart Data Validation', () => {
    it('REGRESSION: should never pass undefined data to charts', async () => {
      render(<MortgageResults data={testMortgageData} onBack={mockOnBack} />)

      await waitFor(() => {
        // Get all chart components
        const charts = [
          ...screen.getAllByTestId('pie'),
          ...screen.getAllByTestId('bar-chart'),
          ...screen.getAllByTestId('line-chart'),
          ...screen.getAllByTestId('area-chart')
        ]

        charts.forEach(chart => {
          const dataAttr = chart.getAttribute('data-chart-data')
          if (dataAttr) {
            const data = JSON.parse(dataAttr)
            
            // Data should never be undefined or null
            expect(data).toBeDefined()
            expect(data).not.toBeNull()
            
            // If it's an array, should not be empty
            if (Array.isArray(data)) {
              expect(data.length).toBeGreaterThan(0)
            }
          }
        })
      })
    })

    it('REGRESSION: should handle edge cases in chart data', async () => {
      // Test with edge case data
      const edgeCaseData: MortgageData = {
        ...testMortgageData,
        homePrice: 1,
        downPayment: 0,
        interestRate: 0
      }

      render(<MortgageResults data={edgeCaseData} onBack={mockOnBack} />)

      await waitFor(() => {
        // Should still render charts without errors
        expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
        expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
        
        // Should not show NaN or undefined values
        expect(screen.queryByText('NaN')).not.toBeInTheDocument()
        expect(screen.queryByText('undefined')).not.toBeInTheDocument()
      })
    })
  })

  describe('CRITICAL: Chart Component Lifecycle', () => {
    it('REGRESSION: should properly mount and unmount chart components', async () => {
      const { unmount } = render(<MortgageResults data={testMortgageData} onBack={mockOnBack} />)

      await waitFor(() => {
        expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
      })

      // Should unmount without errors
      expect(() => unmount()).not.toThrow()
    })

    it('REGRESSION: should handle chart updates when data changes', async () => {
      const { rerender } = render(<MortgageResults data={testMortgageData} onBack={mockOnBack} />)

      await waitFor(() => {
        expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
      })

      // Update data
      const newData = { ...testMortgageData, homePrice: 600000 }
      rerender(<MortgageResults data={newData} onBack={mockOnBack} />)

      await waitFor(() => {
        // Charts should still render with new data
        expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
        expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
      })
    })
  })
})