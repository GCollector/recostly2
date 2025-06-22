import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface MortgageRequest {
  homePrice: number
  downPayment: number
  interestRate: number
  amortizationYears: number
  paymentFrequency: 'monthly' | 'bi-weekly'
  province: 'ontario' | 'bc'
  city: 'toronto' | 'vancouver'
  isFirstTimeBuyer: boolean
}

interface MortgageResult {
  monthlyPayment: number
  totalInterest: number
  totalCost: number
  loanAmount: number
  biWeeklyPayment?: number
  paymentSchedule?: {
    year: number
    principalPayment: number
    interestPayment: number
    balance: number
    totalPayment: number
    cumulativeInterest: number
  }[]
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const {
      homePrice,
      downPayment,
      interestRate,
      amortizationYears,
      paymentFrequency,
      province,
      city,
      isFirstTimeBuyer
    }: MortgageRequest = await req.json()

    // Input validation
    if (!homePrice || !downPayment || !interestRate || !amortizationYears) {
      throw new Error('Missing required calculation parameters')
    }

    if (homePrice <= 0 || downPayment <= 0 || interestRate <= 0 || amortizationYears <= 0) {
      throw new Error('All values must be greater than zero')
    }

    if (downPayment >= homePrice) {
      throw new Error('Down payment cannot be greater than or equal to home price')
    }

    // Proprietary calculation logic (server-side only)
    const loanAmount = homePrice - downPayment
    const monthlyRate = interestRate / 100 / 12
    const totalPayments = amortizationYears * 12
    
    let monthlyPayment = 0
    if (monthlyRate > 0) {
      // Standard mortgage payment formula with proprietary adjustments
      const basePayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
                         (Math.pow(1 + monthlyRate, totalPayments) - 1)
      
      // Apply proprietary adjustments based on location and buyer type
      let adjustmentFactor = 1.0
      
      // Location-based adjustments (proprietary logic)
      if (province === 'ontario' && city === 'toronto') {
        adjustmentFactor *= 1.002 // Toronto market adjustment
      } else if (province === 'bc' && city === 'vancouver') {
        adjustmentFactor *= 1.0015 // Vancouver market adjustment
      }
      
      // First-time buyer adjustments (proprietary logic)
      if (isFirstTimeBuyer) {
        adjustmentFactor *= 0.9995 // Slight benefit for first-time buyers
      }
      
      // Payment frequency adjustments
      if (paymentFrequency === 'bi-weekly') {
        // Bi-weekly payments reduce total interest (proprietary calculation)
        adjustmentFactor *= 0.9985
      }
      
      monthlyPayment = basePayment * adjustmentFactor
    } else {
      monthlyPayment = loanAmount / totalPayments
    }
    
    const totalCost = monthlyPayment * totalPayments + downPayment
    const totalInterest = totalCost - homePrice
    
    // Calculate bi-weekly payment if requested
    let biWeeklyPayment: number | undefined
    if (paymentFrequency === 'bi-weekly') {
      biWeeklyPayment = monthlyPayment / 2
    }
    
    // Generate payment schedule (proprietary amortization logic)
    const paymentSchedule: MortgageResult['paymentSchedule'] = []
    let remainingBalance = loanAmount
    let cumulativeInterest = 0
    
    for (let year = 1; year <= amortizationYears; year++) {
      let yearlyPrincipal = 0
      let yearlyInterest = 0
      
      for (let month = 1; month <= 12; month++) {
        const interestPayment = remainingBalance * monthlyRate
        const principalPayment = monthlyPayment - interestPayment
        
        yearlyInterest += interestPayment
        yearlyPrincipal += principalPayment
        remainingBalance -= principalPayment
        cumulativeInterest += interestPayment
        
        if (remainingBalance <= 0) {
          remainingBalance = 0
          break
        }
      }
      
      paymentSchedule.push({
        year,
        principalPayment: Math.round(yearlyPrincipal * 100) / 100,
        interestPayment: Math.round(yearlyInterest * 100) / 100,
        balance: Math.round(Math.max(0, remainingBalance) * 100) / 100,
        totalPayment: Math.round((yearlyPrincipal + yearlyInterest) * 100) / 100,
        cumulativeInterest: Math.round(cumulativeInterest * 100) / 100
      })
      
      if (remainingBalance <= 0) break
    }
    
    const result: MortgageResult = {
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
      totalInterest: Math.round(totalInterest * 100) / 100,
      totalCost: Math.round(totalCost * 100) / 100,
      loanAmount: Math.round(loanAmount * 100) / 100,
      biWeeklyPayment,
      paymentSchedule
    }

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Mortgage calculation error:', error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Calculation failed' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})