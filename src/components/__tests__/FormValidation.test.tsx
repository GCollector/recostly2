import { describe, it, expect } from 'vitest'
import { validateMortgageInputs, hasErrors } from '../FormValidation'

describe('FormValidation', () => {
  const validInputs = {
    homePrice: 500000,
    downPayment: 100000,
    interestRate: 5.25,
    amortizationYears: 25,
    isFirstTimeBuyer: false,
    province: 'ontario' as const
  }

  describe('validateMortgageInputs', () => {
    it('should pass validation for valid inputs', () => {
      const errors = validateMortgageInputs(validInputs)
      expect(errors).toHaveLength(0)
    })

    it('should validate home price', () => {
      const errors = validateMortgageInputs({
        ...validInputs,
        homePrice: 0
      })
      
      expect(errors).toHaveLength(1)
      expect(errors[0].field).toBe('homePrice')
      expect(errors[0].type).toBe('error')
    })

    it('should validate down payment minimum requirements', () => {
      // Test insufficient down payment for home under $500k
      const errors = validateMortgageInputs({
        ...validInputs,
        homePrice: 400000,
        downPayment: 15000 // 3.75%, should be 5%
      })
      
      expect(errors.some(e => e.field === 'downPayment' && e.type === 'error')).toBe(true)
    })

    it('should validate down payment for homes $500k-$1M', () => {
      const errors = validateMortgageInputs({
        ...validInputs,
        homePrice: 750000,
        downPayment: 30000 // Insufficient
      })
      
      expect(errors.some(e => e.field === 'downPayment' && e.type === 'error')).toBe(true)
    })

    it('should validate down payment for homes over $1M', () => {
      const errors = validateMortgageInputs({
        ...validInputs,
        homePrice: 1200000,
        downPayment: 180000 // 15%, should be 20%
      })
      
      expect(errors.some(e => e.field === 'downPayment' && e.type === 'error')).toBe(true)
    })

    it('should validate interest rate', () => {
      const errors = validateMortgageInputs({
        ...validInputs,
        interestRate: 0
      })
      
      expect(errors.some(e => e.field === 'interestRate' && e.type === 'error')).toBe(true)
    })

    it('should warn about unusual interest rates', () => {
      const highRateErrors = validateMortgageInputs({
        ...validInputs,
        interestRate: 25
      })
      
      expect(highRateErrors.some(e => e.field === 'interestRate' && e.type === 'warning')).toBe(true)
      
      const lowRateErrors = validateMortgageInputs({
        ...validInputs,
        interestRate: 0.5
      })
      
      expect(lowRateErrors.some(e => e.field === 'interestRate' && e.type === 'warning')).toBe(true)
    })

    it('should validate amortization years', () => {
      const errors = validateMortgageInputs({
        ...validInputs,
        amortizationYears: 3
      })
      
      expect(errors.some(e => e.field === 'amortizationYears' && e.type === 'error')).toBe(true)
    })

    it('should validate amortization vs down payment rules', () => {
      const errors = validateMortgageInputs({
        ...validInputs,
        homePrice: 500000,
        downPayment: 50000, // 10%, less than 20%
        amortizationYears: 30
      })
      
      expect(errors.some(e => e.field === 'amortizationYears' && e.type === 'error')).toBe(true)
    })

    it('should provide provincial warnings', () => {
      const bcErrors = validateMortgageInputs({
        ...validInputs,
        homePrice: 800000,
        province: 'bc'
      })
      
      expect(bcErrors.some(e => e.field === 'homePrice' && e.type === 'warning')).toBe(true)
      
      const ontarioErrors = validateMortgageInputs({
        ...validInputs,
        homePrice: 500000,
        province: 'ontario'
      })
      
      expect(ontarioErrors.some(e => e.field === 'homePrice' && e.type === 'warning')).toBe(true)
    })
  })

  describe('hasErrors', () => {
    it('should return true when there are error-type validations', () => {
      const errors = [
        { field: 'homePrice', message: 'Error', type: 'error' as const },
        { field: 'downPayment', message: 'Warning', type: 'warning' as const }
      ]
      
      expect(hasErrors(errors)).toBe(true)
    })

    it('should return false when there are only warnings', () => {
      const errors = [
        { field: 'homePrice', message: 'Warning', type: 'warning' as const },
        { field: 'downPayment', message: 'Warning', type: 'warning' as const }
      ]
      
      expect(hasErrors(errors)).toBe(false)
    })

    it('should return false when there are no errors', () => {
      expect(hasErrors([])).toBe(false)
    })
  })
})