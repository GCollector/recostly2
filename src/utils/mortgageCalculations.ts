export const calculateMonthlyPayment = (
  loanAmount: number,
  interestRate: number,
  amortizationYears: number
): number => {
  const monthlyRate = interestRate / 100 / 12;
  const totalPayments = amortizationYears * 12;
  
  if (monthlyRate === 0) {
    return loanAmount / totalPayments;
  }
  
  return loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
         (Math.pow(1 + monthlyRate, totalPayments) - 1);
};

export const calculateCMHCInsurance = (
  homePrice: number,
  downPayment: number
): { premium: number; rate: number; isRequired: boolean } => {
  const downPaymentPercent = (downPayment / homePrice) * 100;
  
  // CMHC insurance is required when down payment is less than 20%
  if (downPaymentPercent >= 20) {
    return { premium: 0, rate: 0, isRequired: false };
  }
  
  // CMHC insurance rates based on down payment percentage
  let rate = 0;
  if (downPaymentPercent >= 15) {
    rate = 0.028; // 2.8%
  } else if (downPaymentPercent >= 10) {
    rate = 0.031; // 3.1%
  } else if (downPaymentPercent >= 5) {
    rate = 0.04; // 4.0%
  } else {
    // Less than 5% down payment is not allowed
    rate = 0.04;
  }
  
  const loanAmount = homePrice - downPayment;
  const premium = loanAmount * rate;
  
  return { premium, rate, isRequired: true };
};

export const calculateTotalLoanAmount = (
  homePrice: number,
  downPayment: number
): { baseLoanAmount: number; cmhcPremium: number; totalLoanAmount: number } => {
  const baseLoanAmount = homePrice - downPayment;
  const cmhcInsurance = calculateCMHCInsurance(homePrice, downPayment);
  const totalLoanAmount = baseLoanAmount + cmhcInsurance.premium;
  
  return {
    baseLoanAmount,
    cmhcPremium: cmhcInsurance.premium,
    totalLoanAmount
  };
};

export const calculateClosingCosts = (
  homePrice: number,
  province: 'ontario' | 'bc',
  city: 'toronto' | 'vancouver',
  isFirstTimeBuyer: boolean
) => {
  let landTransferTax = 0;
  let additionalTax = 0;
  
  if (province === 'ontario') {
    // Ontario Land Transfer Tax
    if (homePrice <= 55000) {
      landTransferTax = homePrice * 0.005;
    } else if (homePrice <= 250000) {
      landTransferTax = 275 + (homePrice - 55000) * 0.01;
    } else if (homePrice <= 400000) {
      landTransferTax = 2225 + (homePrice - 250000) * 0.015;
    } else if (homePrice <= 2000000) {
      landTransferTax = 4475 + (homePrice - 400000) * 0.02;
    } else {
      landTransferTax = 36475 + (homePrice - 2000000) * 0.025;
    }

    // Toronto Municipal Land Transfer Tax
    if (city === 'toronto') {
      if (homePrice <= 55000) {
        additionalTax = homePrice * 0.005;
      } else if (homePrice <= 400000) {
        additionalTax = 275 + (homePrice - 55000) * 0.01;
      } else if (homePrice <= 2000000) {
        additionalTax = 3725 + (homePrice - 400000) * 0.02;
      } else {
        additionalTax = 35725 + (homePrice - 2000000) * 0.025;
      }
    }
  } else {
    // BC Property Transfer Tax
    if (homePrice <= 200000) {
      landTransferTax = homePrice * 0.01;
    } else if (homePrice <= 2000000) {
      landTransferTax = 2000 + (homePrice - 200000) * 0.02;
    } else if (homePrice <= 3000000) {
      landTransferTax = 38000 + (homePrice - 2000000) * 0.03;
    } else {
      landTransferTax = 68000 + (homePrice - 3000000) * 0.05;
    }
  }

  const legalFees = Math.round(homePrice * 0.001) + 1500;
  const titleInsurance = Math.min(Math.max(homePrice * 0.0005, 250), 1500);
  const homeInspection = 500;
  const appraisal = 400;
  const surveyFee = 1000;

  // First-time buyer rebate
  let firstTimeBuyerRebate = 0;
  if (isFirstTimeBuyer) {
    if (province === 'ontario' && homePrice <= 368000) {
      firstTimeBuyerRebate = Math.min(landTransferTax, 4000);
    } else if (province === 'bc' && homePrice <= 500000) {
      firstTimeBuyerRebate = Math.min(landTransferTax, 8000);
    }
  }

  const total = landTransferTax + additionalTax + legalFees + titleInsurance + 
                homeInspection + appraisal + surveyFee - firstTimeBuyerRebate;

  return {
    landTransferTax: Math.round(landTransferTax),
    additionalTax: Math.round(additionalTax),
    legalFees,
    titleInsurance: Math.round(titleInsurance),
    homeInspection,
    appraisal,
    surveyFee,
    firstTimeBuyerRebate: Math.round(firstTimeBuyerRebate),
    total: Math.round(total)
  };
};

export const generateAmortizationSchedule = (
  loanAmount: number,
  monthlyPayment: number,
  monthlyRate: number,
  amortizationYears: number
) => {
  const schedule = [];
  let remainingBalance = loanAmount;
  let cumulativeInterest = 0;

  for (let year = 1; year <= amortizationYears; year++) {
    let yearlyPrincipal = 0;
    let yearlyInterest = 0;

    for (let month = 1; month <= 12; month++) {
      const interestPayment = remainingBalance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      
      yearlyInterest += interestPayment;
      yearlyPrincipal += principalPayment;
      remainingBalance -= principalPayment;
      cumulativeInterest += interestPayment;

      if (remainingBalance <= 0) {
        remainingBalance = 0;
        break;
      }
    }

    schedule.push({
      year,
      principal: Math.round(yearlyPrincipal),
      interest: Math.round(yearlyInterest),
      balance: Math.round(Math.max(0, remainingBalance)),
      cumulativeInterest: Math.round(cumulativeInterest)
    });

    if (remainingBalance <= 0) break;
  }

  return schedule;
};

export const calculateInvestmentMetrics = (
  homePrice: number,
  downPayment: number,
  monthlyPayment: number,
  monthlyRent: number,
  monthlyExpenses: {
    taxes: number;
    insurance: number;
    condoFees: number;
    maintenance: number;
    other: number;
  }
) => {
  const totalExpenses = Object.values(monthlyExpenses).reduce((sum, expense) => sum + expense, 0);
  const totalMonthlyExpenses = totalExpenses + monthlyPayment;
  const monthlyCashFlow = monthlyRent - totalMonthlyExpenses;
  const annualCashFlow = monthlyCashFlow * 12;
  
  const netOperatingIncome = (monthlyRent - totalExpenses) * 12;
  const capRate = (netOperatingIncome / homePrice) * 100;
  const roi = (annualCashFlow / downPayment) * 100;
  const breakEvenRent = totalMonthlyExpenses;

  return {
    monthlyCashFlow: Math.round(monthlyCashFlow),
    capRate: Math.round(capRate * 100) / 100,
    roi: Math.round(roi * 100) / 100,
    breakEvenRent: Math.round(breakEvenRent),
    totalMonthlyExpenses: Math.round(totalMonthlyExpenses),
    netOperatingIncome: Math.round(netOperatingIncome)
  };
};