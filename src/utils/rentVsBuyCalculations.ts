import { RentVsBuyData, RentVsBuyResults } from '../types/premium';

export const calculateRentVsBuy = (
  rentData: RentVsBuyData,
  homePrice: number,
  downPayment: number,
  monthlyPayment: number,
  totalInterest: number
): RentVsBuyResults => {
  const { monthlyRent, annualRentIncrease, comparisonYears } = rentData;
  
  let totalRentPaid = 0;
  let currentMonthlyRent = monthlyRent;
  const yearlyComparison = [];
  
  // Calculate total ownership cost
  const totalMortgagePayments = monthlyPayment * comparisonYears * 12;
  const totalOwnershipCost = downPayment + totalMortgagePayments;
  
  for (let year = 1; year <= comparisonYears; year++) {
    // Calculate rent for this year
    const yearlyRent = currentMonthlyRent * 12;
    totalRentPaid += yearlyRent;
    
    // Calculate cumulative ownership cost for this year
    const yearsElapsed = year;
    const cumulativeOwnership = downPayment + (monthlyPayment * yearsElapsed * 12);
    
    yearlyComparison.push({
      year,
      cumulativeRent: Math.round(totalRentPaid),
      cumulativeOwnership: Math.round(cumulativeOwnership),
      difference: Math.round(cumulativeOwnership - totalRentPaid)
    });
    
    // Increase rent for next year
    currentMonthlyRent *= (1 + annualRentIncrease / 100);
  }
  
  const netBenefit = totalRentPaid - totalOwnershipCost;
  
  return {
    totalRentPaid: Math.round(totalRentPaid),
    totalOwnershipCost: Math.round(totalOwnershipCost),
    netBenefit: Math.round(netBenefit),
    yearlyComparison
  };
};