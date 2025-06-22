import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { CalculationProvider, useCalculations } from '../CalculationContext'
import { mockUser, mockCalculation } from '../../test/utils'

// Mock AuthContext
vi.mock('../AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: mockUser,
    loading: false
  }))
}))

// Mock Supabase
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn()
  }))
}

vi.mock('../../lib/supabase', () => ({
  supabase: mockSupabase
}))

describe('CalculationContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should provide initial calculation state', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CalculationProvider>{children}</CalculationProvider>
    )

    const { result } = renderHook(() => useCalculations(), { wrapper })

    expect(result.current.calculations).toEqual([])
    expect(result.current.isLoading).toBe(false)
    expect(typeof result.current.saveCalculation).toBe('function')
    expect(typeof result.current.deleteCalculation).toBe('function')
  })

  it('should save calculation for authenticated user', async () => {
    mockSupabase.from.mockReturnValue({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: mockCalculation,
        error: null
      })
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CalculationProvider>{children}</CalculationProvider>
    )

    const { result } = renderHook(() => useCalculations(), { wrapper })

    const calculationData = {
      home_price: 500000,
      down_payment: 100000,
      interest_rate: 5.25,
      amortization_years: 25,
      payment_frequency: 'monthly' as const,
      province: 'ontario' as const,
      city: 'toronto' as const,
      is_first_time_buyer: false,
      monthly_payment: 2500,
      total_interest: 250000,
      notes: {},
      comments: null
    }

    const id = await result.current.saveCalculation(calculationData)

    expect(id).toBe(mockCalculation.id)
    expect(mockSupabase.from).toHaveBeenCalledWith('mortgage_calculation')
  })

  it('should save calculation for anonymous user', async () => {
    // Mock no user
    vi.mocked(require('../AuthContext').useAuth).mockReturnValue({
      user: null,
      loading: false
    })

    mockSupabase.from.mockReturnValue({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { ...mockCalculation, user_id: null },
        error: null
      })
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CalculationProvider>{children}</CalculationProvider>
    )

    const { result } = renderHook(() => useCalculations(), { wrapper })

    const calculationData = {
      home_price: 500000,
      down_payment: 100000,
      interest_rate: 5.25,
      amortization_years: 25,
      payment_frequency: 'monthly' as const,
      province: 'ontario' as const,
      city: 'toronto' as const,
      is_first_time_buyer: false,
      monthly_payment: 2500,
      total_interest: 250000,
      notes: {},
      comments: null
    }

    const id = await result.current.saveCalculation(calculationData)

    expect(id).toBeDefined()
  })

  it('should delete calculation', async () => {
    mockSupabase.from.mockReturnValue({
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        error: null
      })
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CalculationProvider>{children}</CalculationProvider>
    )

    const { result } = renderHook(() => useCalculations(), { wrapper })

    await result.current.deleteCalculation('test-id')

    expect(mockSupabase.from).toHaveBeenCalledWith('mortgage_calculation')
  })

  it('should fetch calculations for authenticated user', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [mockCalculation],
        error: null
      })
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CalculationProvider>{children}</CalculationProvider>
    )

    const { result } = renderHook(() => useCalculations(), { wrapper })

    await waitFor(() => {
      expect(result.current.calculations).toHaveLength(1)
    })
  })

  it('should handle localStorage operations', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CalculationProvider>{children}</CalculationProvider>
    )

    const { result } = renderHook(() => useCalculations(), { wrapper })

    const testData = { test: 'data' }
    
    result.current.saveToLocalStorage(testData)
    expect(localStorage.setItem).toHaveBeenCalledWith('mortgage_calculation', JSON.stringify(testData))

    localStorage.getItem = vi.fn().mockReturnValue(JSON.stringify(testData))
    const retrieved = result.current.getFromLocalStorage()
    expect(retrieved).toEqual(testData)
  })

  it('should update calculation notes for premium users', async () => {
    // Mock premium user
    vi.mocked(require('../AuthContext').useAuth).mockReturnValue({
      user: { ...mockUser, tier: 'premium' },
      loading: false
    })

    mockSupabase.from.mockReturnValue({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { ...mockCalculation, notes: { mortgage: 'test note' } },
        error: null
      })
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CalculationProvider>{children}</CalculationProvider>
    )

    const { result } = renderHook(() => useCalculations(), { wrapper })

    await result.current.updateCalculationNotes('test-id', 'mortgage', 'test note')

    expect(mockSupabase.from).toHaveBeenCalledWith('mortgage_calculation')
  })

  it('should reject notes update for non-premium users', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CalculationProvider>{children}</CalculationProvider>
    )

    const { result } = renderHook(() => useCalculations(), { wrapper })

    await expect(
      result.current.updateCalculationNotes('test-id', 'mortgage', 'test note')
    ).rejects.toThrow('Premium subscription required')
  })
})