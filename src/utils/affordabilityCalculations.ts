import { AffordabilityData, AffordabilityResults } from '../types/premium';

export const calculateAffordability = (data: AffordabilityData): AffordabilityResults => {
  const { annualIncome, monthlyDebts, downPayment, interestRate } = data;
  const monthlyIncome = annualIncome / 12;
  
  // Canadian mortgage qualification rules
  // GDS (Gross Debt Service) ratio should not exceed 32%
  // TDS (Total Debt Service) ratio should not exceed 40%
  
  const maxGDSPayment = monthlyIncome * 0.32; // 32% for housing costs
  const maxTDSPayment = monthlyIncome * 0.40; // 40% for total debt service
  
  // Maximum monthly payment considering existing debts
  const maxMonthlyPayment = Math.min(maxGDSPayment, maxTDSPayment - monthlyDebts);
  
  // Calculate maximum affordable home price
  // Using the mortgage payment formula in reverse
  const monthlyRate = interestRate / 100 / 12;
  const totalPayments = 25 * 12; // Assuming 25-year amortization
  
  let maxLoanAmount = 0;
  if (monthlyRate > 0) {
    maxLoanAmount = maxMonthlyPayment * (Math.pow(1 + monthlyRate, totalPayments) - 1) / 
                   (monthlyRate * Math.pow(1 + monthlyRate, totalPayments));
  } else {
    maxLoanAmount = maxMonthlyPayment * totalPayments;
  }
  
  const maxAffordablePrice = maxLoanAmount + downPayment;
  
  // Calculate actual ratios
  const housingCosts = maxMonthlyPayment;
  const gdsRatio = (housingCosts / monthlyIncome) * 100;
  const tdsRatio = ((housingCosts + monthlyDebts) / monthlyIncome) * 100;
  
  const isWithinBudget = gdsRatio <= 32 && tdsRatio <= 40;
  
  return {
    maxAffordablePrice: Math.round(maxAffordablePrice),
    gdsRatio: Math.round(gdsRatio * 100) / 100,
    tdsRatio: Math.round(tdsRatio * 100) / 100,
    isWithinBudget,
    maxMonthlyPayment: Math.round(maxMonthlyPayment)
  };
};