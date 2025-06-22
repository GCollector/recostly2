import { describe, it, expect } from 'vitest'

/**
 * CHART DATA VALIDATION UTILITIES AND TESTS
 * 
 * These utilities and tests ensure chart data is always valid and prevent
 * the chart rendering errors that occurred previously.
 */

// Chart data validation utilities
export const validateChartData = (data: any[], requiredFields: string[]): boolean => {
  if (!Array.isArray(data)) return false
  if (data.length === 0) return false
  
  return data.every(item => {
    if (typeof item !== 'object' || item === null) return false
    
    return requiredFields.every(field => {
      const value = item[field]
      return value !== undefined && value !== null && !Number.isNaN(value)
    })
  })
}

export const validatePieChartData = (data: any[]): boolean => {
  return validateChartData(data, ['name', 'value']) &&
         data.every(item => typeof item.value === 'number' && item.value >= 0)
}

export const validateBarChartData = (data: any[], dataKeys: string[]): boolean => {
  return validateChartData(data, dataKeys) &&
         data.every(item => 
           dataKeys.every(key => typeof item[key] === 'number')
         )
}

export const validateLineChartData = (data: any[], xKey: string, yKeys: string[]): boolean => {
  return validateChartData(data, [xKey, ...yKeys]) &&
         data.every(item => 
           yKeys.every(key => typeof item[key] === 'number')
         )
}

// Safe chart data creators
export const createSafePieChartData = (
  downPayment: number,
  loanAmount: number,
  totalInterest: number
) => {
  const data = [
    { name: 'Down Payment', value: Math.max(0, downPayment || 0), color: '#10B981' },
    { name: 'Principal', value: Math.max(0, loanAmount || 0), color: '#3B82F6' },
    { name: 'Interest', value: Math.max(0, totalInterest || 0), color: '#EF4444' }
  ]
  
  return validatePieChartData(data) ? data : []
}

export const createSafeBarChartData = (
  totalInterest: number,
  loanAmount: number
) => {
  const data = [
    { 
      name: 'Interest vs Principal',
      interest: Math.max(0, totalInterest || 0), 
      principal: Math.max(0, loanAmount || 0) 
    }
  ]
  
  return validateBarChartData(data, ['interest', 'principal']) ? data : []
}

export const createSafeAmortizationData = (
  amortizationSchedule: any[]
) => {
  if (!Array.isArray(amortizationSchedule) || amortizationSchedule.length === 0) {
    return []
  }
  
  const data = amortizationSchedule.map(year => ({
    year: `Year ${year.year || 0}`,
    principal: Math.max(0, year.principalPayment || 0),
    interest: Math.max(0, year.interestPayment || 0),
    balance: Math.max(0, year.balance || 0)
  }))
  
  return validateBarChartData(data, ['principal', 'interest', 'balance']) ? data : []
}

describe('Chart Data Validation', () => {
  describe('validateChartData', () => {
    it('should validate correct chart data', () => {
      const validData = [
        { name: 'A', value: 100 },
        { name: 'B', value: 200 }
      ]
      
      expect(validateChartData(validData, ['name', 'value'])).toBe(true)
    })
    
    it('should reject invalid chart data', () => {
      expect(validateChartData([], ['name', 'value'])).toBe(false)
      expect(validateChartData([{ name: 'A' }], ['name', 'value'])).toBe(false)
      expect(validateChartData([{ name: 'A', value: null }], ['name', 'value'])).toBe(false)
      expect(validateChartData([{ name: 'A', value: NaN }], ['name', 'value'])).toBe(false)
    })
  })
  
  describe('validatePieChartData', () => {
    it('should validate pie chart data', () => {
      const validData = [
        { name: 'Segment 1', value: 100 },
        { name: 'Segment 2', value: 200 }
      ]
      
      expect(validatePieChartData(validData)).toBe(true)
    })
    
    it('should reject negative values', () => {
      const invalidData = [
        { name: 'Segment 1', value: -100 }
      ]
      
      expect(validatePieChartData(invalidData)).toBe(false)
    })
  })
  
  describe('validateBarChartData', () => {
    it('should validate bar chart data', () => {
      const validData = [
        { name: 'Bar 1', value1: 100, value2: 200 }
      ]
      
      expect(validateBarChartData(validData, ['value1', 'value2'])).toBe(true)
    })
    
    it('should reject non-numeric values', () => {
      const invalidData = [
        { name: 'Bar 1', value1: '100', value2: 200 }
      ]
      
      expect(validateBarChartData(invalidData, ['value1', 'value2'])).toBe(false)
    })
  })
  
  describe('createSafePieChartData', () => {
    it('should create valid pie chart data', () => {
      const data = createSafePieChartData(100000, 400000, 200000)
      
      expect(data).toHaveLength(3)
      expect(data[0]).toEqual({
        name: 'Down Payment',
        value: 100000,
        color: '#10B981'
      })
      expect(validatePieChartData(data)).toBe(true)
    })
    
    it('should handle invalid inputs safely', () => {
      const data = createSafePieChartData(NaN, -100, null as any)
      
      expect(data).toEqual([])
    })
    
    it('should handle zero values', () => {
      const data = createSafePieChartData(0, 400000, 200000)
      
      expect(data).toHaveLength(3)
      expect(data[0].value).toBe(0)
      expect(validatePieChartData(data)).toBe(true)
    })
  })
  
  describe('createSafeBarChartData', () => {
    it('should create valid bar chart data', () => {
      const data = createSafeBarChartData(200000, 400000)
      
      expect(data).toHaveLength(1)
      expect(data[0]).toEqual({
        name: 'Interest vs Principal',
        interest: 200000,
        principal: 400000
      })
      expect(validateBarChartData(data, ['interest', 'principal'])).toBe(true)
    })
    
    it('should handle invalid inputs safely', () => {
      const data = createSafeBarChartData(NaN, undefined as any)
      
      expect(data).toEqual([])
    })
  })
  
  describe('createSafeAmortizationData', () => {
    it('should create valid amortization data', () => {
      const schedule = [
        { year: 1, principalPayment: 10000, interestPayment: 20000, balance: 390000 },
        { year: 2, principalPayment: 11000, interestPayment: 19000, balance: 379000 }
      ]
      
      const data = createSafeAmortizationData(schedule)
      
      expect(data).toHaveLength(2)
      expect(data[0]).toEqual({
        year: 'Year 1',
        principal: 10000,
        interest: 20000,
        balance: 390000
      })
      expect(validateBarChartData(data, ['principal', 'interest', 'balance'])).toBe(true)
    })
    
    it('should handle empty schedule', () => {
      const data = createSafeAmortizationData([])
      expect(data).toEqual([])
    })
    
    it('should handle invalid schedule data', () => {
      const invalidSchedule = [
        { year: 1, principalPayment: NaN, interestPayment: null, balance: -100 }
      ]
      
      const data = createSafeAmortizationData(invalidSchedule)
      expect(data).toEqual([])
    })
  })
})

describe('REGRESSION: Chart Data Edge Cases', () => {
  it('CRITICAL: should handle zero mortgage scenarios', () => {
    const pieData = createSafePieChartData(0, 0, 0)
    const barData = createSafeBarChartData(0, 0)
    
    // Should return empty arrays for invalid data rather than crash
    expect(pieData).toEqual([])
    expect(barData).toEqual([])
  })
  
  it('CRITICAL: should handle extremely large numbers', () => {
    const largeNumber = 999999999999
    const pieData = createSafePieChartData(largeNumber, largeNumber, largeNumber)
    
    expect(validatePieChartData(pieData)).toBe(true)
    expect(pieData.every(item => item.value === largeNumber)).toBe(true)
  })
  
  it('CRITICAL: should handle floating point precision', () => {
    const preciseNumber = 123456.789123
    const pieData = createSafePieChartData(preciseNumber, preciseNumber, preciseNumber)
    
    expect(validatePieChartData(pieData)).toBe(true)
    expect(pieData.every(item => item.value === preciseNumber)).toBe(true)
  })
  
  it('CRITICAL: should never allow NaN or undefined in chart data', () => {
    const testValues = [NaN, undefined, null, Infinity, -Infinity]
    
    testValues.forEach(value => {
      const pieData = createSafePieChartData(value as any, 100000, 200000)
      const barData = createSafeBarChartData(value as any, 100000)
      
      // Should either be valid data or empty array, never invalid data
      if (pieData.length > 0) {
        expect(validatePieChartData(pieData)).toBe(true)
      }
      if (barData.length > 0) {
        expect(validateBarChartData(barData, ['interest', 'principal'])).toBe(true)
      }
    })
  })
})