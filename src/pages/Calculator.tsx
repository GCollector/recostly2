import React, { useState, useEffect } from 'react';
import { Calculator, Home, TrendingUp, FileText, MessageSquare, Save, Share2, Crown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCalculations } from '../contexts/CalculationContext';

interface MortgageResult {
  monthlyPayment: number;
  totalInterest: number;
  totalCost: number;
  loanAmount: number;
}

interface ClosingCostBreakdown {
  landTransferTax: number;
  additionalTax: number;
  legalFees: number;
  titleInsurance: number;
  homeInspection: number;
  appraisal: number;
  surveyFee: number;
  firstTimeBuyerRebate: number;
  total: number;
}

interface InvestmentResult {
  capRate: number;
  cashFlow: number;
  roi: number;
  breakEvenRent: number;
  totalMonthlyExpenses: number;
  netOperatingIncome: number;
}

interface AmortizationData {
  year: number;
  principalPayment: number;
  interestPayment: number;
  balance: number;
  totalPayment: number;
  cumulativeInterest: number;
}

interface SectionComments {
  mortgage: string;
  closing: string;
  investment: string;
  amortization: string;
}

const CalculatorPage: React.FC = () => {
  const { user } = useAuth();
  const { saveCalculation } = useCalculations();

  // Mortgage Calculator State
  const [homePrice, setHomePrice] = useState(500000);
  const [downPayment, setDownPayment] = useState(100000);
  const [interestRate, setInterestRate] = useState(5.25);
  const [amortizationYears, setAmortizationYears] = useState(25);
  const [paymentFrequency, setPaymentFrequency] = useState<'monthly' | 'bi-weekly'>('monthly');
  const [province, setProvince] = useState<'ontario' | 'bc'>('ontario');
  const [city, setCity] = useState<'toronto' | 'vancouver'>('toronto');
  const [isFirstTimeBuyer, setIsFirstTimeBuyer] = useState(false);

  // Investment Calculator State
  const [monthlyRent, setMonthlyRent] = useState(2500);
  const [monthlyExpenses, setMonthlyExpenses] = useState({
    taxes: 400,
    insurance: 150,
    condoFees: 300,
    maintenance: 200,
    other: 100
  });

  // Results State
  const [mortgageResult, setMortgageResult] = useState<MortgageResult | null>(null);
  const [closingCosts, setClosingCosts] = useState<ClosingCostBreakdown | null>(null);
  const [investmentResult, setInvestmentResult] = useState<InvestmentResult | null>(null);
  const [amortizationSchedule, setAmortizationSchedule] = useState<AmortizationData[]>([]);

  // Comments State
  const [comments, setComments] = useState<SectionComments>({
    mortgage: '',
    closing: '',
    investment: '',
    amortization: ''
  });

  const [editingComment, setEditingComment] = useState<string | null>(null);

  // Format currency with commas
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format number with commas
  const formatNumber = (amount: number): string => {
    return new Intl.NumberFormat('en-CA').format(Math.round(amount));
  };

  // Calculate mortgage payments
  const calculateMortgage = () => {
    const loanAmount = homePrice - downPayment;
    const monthlyRate = interestRate / 100 / 12;
    const totalPayments = amortizationYears * 12;
    
    let monthlyPayment = 0;
    if (monthlyRate > 0) {
      monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
                      (Math.pow(1 + monthlyRate, totalPayments) - 1);
    } else {
      monthlyPayment = loanAmount / totalPayments;
    }
    
    const totalCost = monthlyPayment * totalPayments + downPayment;
    const totalInterest = totalCost - homePrice;
    
    if (paymentFrequency === 'bi-weekly') {
      monthlyPayment = monthlyPayment / 2;
    }
    
    setMortgageResult({
      monthlyPayment: monthlyPayment,
      totalInterest: totalInterest,
      totalCost: totalCost,
      loanAmount: loanAmount
    });
  };

  // Calculate closing costs
  const calculateClosingCosts = () => {
    const calculateOntarioLandTransferTax = (price: number) => {
      let tax = 0;
      if (price <= 55000) {
        tax = price * 0.005;
      } else if (price <= 250000) {
        tax = 275 + (price - 55000) * 0.01;
      } else if (price <= 400000) {
        tax = 2225 + (price - 250000) * 0.015;
      } else if (price <= 2000000) {
        tax = 4475 + (price - 400000) * 0.02;
      } else {
        tax = 36475 + (price - 2000000) * 0.025;
      }
      return Math.round(tax);
    };

    const calculateTorontoLandTransferTax = (price: number) => {
      let tax = 0;
      if (price <= 55000) {
        tax = price * 0.005;
      } else if (price <= 400000) {
        tax = 275 + (price - 55000) * 0.01;
      } else if (price <= 2000000) {
        tax = 3725 + (price - 400000) * 0.02;
      } else {
        tax = 35725 + (price - 2000000) * 0.025;
      }
      return Math.round(tax);
    };

    const calculateBCPropertyTransferTax = (price: number) => {
      let tax = 0;
      if (price <= 200000) {
        tax = price * 0.01;
      } else if (price <= 2000000) {
        tax = 2000 + (price - 200000) * 0.02;
      } else if (price <= 3000000) {
        tax = 38000 + (price - 2000000) * 0.03;
      } else {
        tax = 68000 + (price - 3000000) * 0.05;
      }
      
      if (price > 3000000) {
        tax += (price - 3000000) * 0.02;
      }
      
      return Math.round(tax);
    };

    const calculateFirstTimeBuyerRebate = (price: number, location: string) => {
      if (!isFirstTimeBuyer) return 0;
      
      if (location === 'toronto') {
        if (price <= 368000) {
          return Math.min(calculateOntarioLandTransferTax(price), 4000);
        }
        return 0;
      } else {
        if (price <= 500000) {
          return Math.min(calculateBCPropertyTransferTax(price), 8000);
        }
        return 0;
      }
    };

    let landTransferTax = 0;
    let additionalTax = 0;
    
    if (city === 'toronto') {
      landTransferTax = calculateOntarioLandTransferTax(homePrice);
      additionalTax = calculateTorontoLandTransferTax(homePrice);
    } else {
      landTransferTax = calculateBCPropertyTransferTax(homePrice);
    }
    
    const legalFees = Math.round(homePrice * 0.001) + 1500;
    const titleInsurance = Math.min(Math.max(homePrice * 0.0005, 250), 1500);
    const homeInspection = 500;
    const appraisal = 400;
    const surveyFee = 1000;
    const firstTimeBuyerRebate = calculateFirstTimeBuyerRebate(homePrice, city);
    
    const total = landTransferTax + additionalTax + legalFees + titleInsurance + 
                  homeInspection + appraisal + surveyFee - firstTimeBuyerRebate;
    
    setClosingCosts({
      landTransferTax,
      additionalTax,
      legalFees,
      titleInsurance,
      homeInspection,
      appraisal,
      surveyFee,
      firstTimeBuyerRebate,
      total: Math.round(total)
    });
  };

  // Calculate investment metrics
  const calculateInvestment = () => {
    if (!mortgageResult) return;

    const loanAmount = homePrice - downPayment;
    const monthlyRate = interestRate / 100 / 12;
    const totalPayments = 25 * 12;
    
    let monthlyMortgage = 0;
    if (monthlyRate > 0) {
      monthlyMortgage = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
                      (Math.pow(1 + monthlyRate, totalPayments) - 1);
    } else {
      monthlyMortgage = loanAmount / totalPayments;
    }

    const totalExpenses = Object.values(monthlyExpenses).reduce((sum, expense) => sum + expense, 0);
    const totalMonthlyExpenses = totalExpenses + monthlyMortgage;
    const monthlyCashFlow = monthlyRent - totalMonthlyExpenses;
    const annualCashFlow = monthlyCashFlow * 12;
    
    const netOperatingIncome = (monthlyRent - totalExpenses) * 12;
    const capRate = (netOperatingIncome / homePrice) * 100;
    const roi = (annualCashFlow / downPayment) * 100;
    const breakEvenRent = totalMonthlyExpenses;

    setInvestmentResult({
      capRate: Math.round(capRate * 100) / 100,
      cashFlow: monthlyCashFlow,
      roi: Math.round(roi * 100) / 100,
      breakEvenRent: breakEvenRent,
      totalMonthlyExpenses: totalMonthlyExpenses,
      netOperatingIncome: netOperatingIncome
    });
  };

  // Calculate amortization schedule
  const calculateAmortization = () => {
    if (!mortgageResult) return;

    const loanAmount = homePrice - downPayment;
    const monthlyRate = interestRate / 100 / 12;
    const totalPayments = amortizationYears * 12;
    
    let monthlyPayment = 0;
    if (monthlyRate > 0) {
      monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
                      (Math.pow(1 + monthlyRate, totalPayments) - 1);
    } else {
      monthlyPayment = loanAmount / totalPayments;
    }

    const yearlyData: AmortizationData[] = [];
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

      yearlyData.push({
        year,
        principalPayment: yearlyPrincipal,
        interestPayment: yearlyInterest,
        balance: Math.max(0, remainingBalance),
        totalPayment: yearlyPrincipal + yearlyInterest,
        cumulativeInterest: cumulativeInterest
      });

      if (remainingBalance <= 0) break;
    }

    setAmortizationSchedule(yearlyData);
  };

  // Update expense
  const updateExpense = (key: keyof typeof monthlyExpenses, value: number) => {
    setMonthlyExpenses(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Handle comment save
  const handleCommentSave = (section: keyof SectionComments) => {
    setEditingComment(null);
    // In a real app, this would save to the database
  };

  // Calculate all results when inputs change
  useEffect(() => {
    calculateMortgage();
    calculateClosingCosts();
  }, [homePrice, downPayment, interestRate, amortizationYears, paymentFrequency, city, isFirstTimeBuyer]);

  useEffect(() => {
    if (mortgageResult) {
      calculateInvestment();
      calculateAmortization();
    }
  }, [mortgageResult, monthlyRent, monthlyExpenses]);

  const downPaymentPercent = Math.round((downPayment / homePrice) * 100);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900">
          Complete Real Estate Analysis
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Professional mortgage calculations, closing costs, investment analysis, and amortization schedules 
          for Canadian real estate markets.
        </p>
      </div>

      {/* Key Results Summary */}
      {mortgageResult && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-6 text-center">Summary Results</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">
                {formatCurrency(mortgageResult.monthlyPayment)}
              </div>
              <div className="text-blue-100">
                {paymentFrequency === 'monthly' ? 'Monthly' : 'Bi-weekly'} Payment
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">
                {closingCosts ? formatCurrency(closingCosts.total) : '—'}
              </div>
              <div className="text-blue-100">Closing Costs</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">
                {investmentResult ? formatCurrency(investmentResult.cashFlow) : '—'}
              </div>
              <div className="text-blue-100">Monthly Cash Flow</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">
                {investmentResult ? `${investmentResult.capRate}%` : '—'}
              </div>
              <div className="text-blue-100">Cap Rate</div>
            </div>
          </div>
        </div>
      )}

      {/* Input Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
          <Calculator className="h-6 w-6 mr-3 text-blue-600" />
          Property & Loan Details
        </h2>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Basic Property Info */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Property Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Home Price
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={homePrice}
                  onChange={(e) => setHomePrice(Number(e.target.value))}
                  className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Down Payment
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={downPayment}
                  onChange={(e) => setDownPayment(Number(e.target.value))}
                  className="w-full pl-8 pr-16 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                  {downPaymentPercent}%
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <select
                value={province === 'ontario' ? 'toronto' : 'vancouver'}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === 'toronto') {
                    setProvince('ontario');
                    setCity('toronto');
                  } else {
                    setProvince('bc');
                    setCity('vancouver');
                  }
                }}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="toronto">Toronto, ON</option>
                <option value="vancouver">Vancouver, BC</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                id="first-time-buyer"
                type="checkbox"
                checked={isFirstTimeBuyer}
                onChange={(e) => setIsFirstTimeBuyer(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="first-time-buyer" className="ml-2 block text-sm text-gray-700">
                First-time homebuyer
              </label>
            </div>
          </div>

          {/* Mortgage Details */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Mortgage Terms</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interest Rate
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full pr-8 pl-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amortization Period
              </label>
              <select
                value={amortizationYears}
                onChange={(e) => setAmortizationYears(Number(e.target.value))}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {[15, 20, 25, 30].map(years => (
                  <option key={years} value={years}>{years} years</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Frequency
              </label>
              <select
                value={paymentFrequency}
                onChange={(e) => setPaymentFrequency(e.target.value as 'monthly' | 'bi-weekly')}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="monthly">Monthly</option>
                <option value="bi-weekly">Bi-weekly</option>
              </select>
            </div>
          </div>

          {/* Investment Details */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-emerald-600" />
              Investment Analysis
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Rent
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={monthlyRent}
                  onChange={(e) => setMonthlyRent(Number(e.target.value))}
                  className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Property Taxes
                </label>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                  <input
                    type="number"
                    value={monthlyExpenses.taxes}
                    onChange={(e) => updateExpense('taxes', Number(e.target.value))}
                    className="w-full pl-6 pr-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Insurance
                </label>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                  <input
                    type="number"
                    value={monthlyExpenses.insurance}
                    onChange={(e) => updateExpense('insurance', Number(e.target.value))}
                    className="w-full pl-6 pr-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Condo Fees
                </label>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                  <input
                    type="number"
                    value={monthlyExpenses.condoFees}
                    onChange={(e) => updateExpense('condoFees', Number(e.target.value))}
                    className="w-full pl-6 pr-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maintenance
                </label>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                  <input
                    type="number"
                    value={monthlyExpenses.maintenance}
                    onChange={(e) => updateExpense('maintenance', Number(e.target.value))}
                    className="w-full pl-6 pr-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Other Expenses
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={monthlyExpenses.other}
                  onChange={(e) => updateExpense('other', Number(e.target.value))}
                  className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Property management, utilities, etc."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Comments for Input Section */}
        {user?.tier === 'premium' && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900 flex items-center">
                <MessageSquare className="h-4 w-4 mr-2 text-amber-600" />
                Property Notes
              </h4>
              {editingComment !== 'mortgage' && (
                <button
                  onClick={() => setEditingComment('mortgage')}
                  className="text-amber-600 hover:text-amber-700 text-sm font-medium"
                >
                  {comments.mortgage ? 'Edit' : 'Add Notes'}
                </button>
              )}
            </div>

            {editingComment === 'mortgage' ? (
              <div className="space-y-3">
                <textarea
                  value={comments.mortgage}
                  onChange={(e) => setComments(prev => ({ ...prev, mortgage: e.target.value }))}
                  className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  rows={3}
                  placeholder="Add notes about this property and mortgage terms..."
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCommentSave('mortgage')}
                    className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingComment(null)}
                    className="px-3 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                {comments.mortgage ? (
                  <p className="text-amber-800 whitespace-pre-wrap">{comments.mortgage}</p>
                ) : (
                  <p className="text-amber-600 italic">No notes added yet.</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Investment Analysis - Prominent Section */}
      {investmentResult && (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg border-2 border-emerald-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
            <TrendingUp className="h-6 w-6 mr-3 text-emerald-600" />
            Investment Property Analysis
            <span className="ml-3 px-3 py-1 bg-emerald-100 text-emerald-800 text-sm font-medium rounded-full">
              Key Metrics
            </span>
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className={`p-6 rounded-lg ${investmentResult.cashFlow >= 0 ? 'bg-green-100 border-green-200' : 'bg-red-100 border-red-200'} border-2`}>
              <div className="text-center">
                <div className={`text-3xl font-bold mb-2 ${investmentResult.cashFlow >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {formatCurrency(investmentResult.cashFlow)}
                </div>
                <div className="text-sm text-gray-600">Monthly Cash Flow</div>
              </div>
            </div>

            <div className={`p-6 rounded-lg ${investmentResult.capRate >= 6 ? 'bg-green-100 border-green-200' : 'bg-yellow-100 border-yellow-200'} border-2`}>
              <div className="text-center">
                <div className={`text-3xl font-bold mb-2 ${investmentResult.capRate >= 6 ? 'text-green-700' : 'text-yellow-700'}`}>
                  {investmentResult.capRate}%
                </div>
                <div className="text-sm text-gray-600">Cap Rate</div>
              </div>
            </div>

            <div className="bg-blue-100 border-blue-200 border-2 p-6 rounded-lg">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-700 mb-2">
                  {investmentResult.roi}%
                </div>
                <div className="text-sm text-gray-600">ROI</div>
              </div>
            </div>

            <div className="bg-purple-100 border-purple-200 border-2 p-6 rounded-lg">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-700 mb-2">
                  {formatCurrency(investmentResult.breakEvenRent)}
                </div>
                <div className="text-sm text-gray-600">Break-even Rent</div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-medium text-gray-900 mb-4">Monthly Income vs Expenses</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Rental Income</span>
                  <span className="font-medium text-green-600">{formatCurrency(monthlyRent)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Expenses</span>
                  <span className="font-medium text-red-600">{formatCurrency(investmentResult.totalMonthlyExpenses)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900">Net Cash Flow</span>
                    <span className={`font-bold ${investmentResult.cashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(investmentResult.cashFlow)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-medium text-gray-900 mb-4">Annual Returns</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Net Operating Income</span>
                  <span className="font-medium">{formatCurrency(investmentResult.netOperatingIncome)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Annual Cash Flow</span>
                  <span className="font-medium">{formatCurrency(investmentResult.cashFlow * 12)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Down Payment</span>
                  <span className="font-medium">{formatCurrency(downPayment)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Investment Warnings */}
          {(investmentResult.cashFlow < 0 || investmentResult.capRate < 6) && (
            <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="font-medium text-amber-800 mb-2">Investment Considerations:</h4>
              <ul className="text-sm text-amber-700 space-y-1">
                {investmentResult.cashFlow < 0 && (
                  <li>• Negative cash flow - property expenses exceed rental income</li>
                )}
                {investmentResult.capRate < 6 && (
                  <li>• Low cap rate (under 6%) - property may not generate adequate returns</li>
                )}
                <li>• Consider vacancy rates (typically 5-10% of annual rent)</li>
                <li>• Factor in potential rent increases and major repairs</li>
              </ul>
            </div>
          )}

          {/* Comments for Investment Section */}
          {user?.tier === 'premium' && (
            <div className="mt-8 pt-6 border-t border-emerald-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900 flex items-center">
                  <MessageSquare className="h-4 w-4 mr-2 text-amber-600" />
                  Investment Notes
                </h4>
                {editingComment !== 'investment' && (
                  <button
                    onClick={() => setEditingComment('investment')}
                    className="text-amber-600 hover:text-amber-700 text-sm font-medium"
                  >
                    {comments.investment ? 'Edit' : 'Add Notes'}
                  </button>
                )}
              </div>

              {editingComment === 'investment' ? (
                <div className="space-y-3">
                  <textarea
                    value={comments.investment}
                    onChange={(e) => setComments(prev => ({ ...prev, investment: e.target.value }))}
                    className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    rows={3}
                    placeholder="Add notes about this investment analysis..."
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCommentSave('investment')}
                      className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingComment(null)}
                      className="px-3 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                  {comments.investment ? (
                    <p className="text-amber-800 whitespace-pre-wrap">{comments.investment}</p>
                  ) : (
                    <p className="text-amber-600 italic">No investment notes added yet.</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Mortgage Payment Breakdown */}
      {mortgageResult && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
            <Calculator className="h-6 w-6 mr-3 text-blue-600" />
            Mortgage Payment Breakdown
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {formatCurrency(mortgageResult.monthlyPayment)}
                </div>
                <div className="text-sm text-blue-700">
                  {paymentFrequency === 'monthly' ? 'Monthly' : 'Bi-weekly'} Payment
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  {formatCurrency(mortgageResult.loanAmount)}
                </div>
                <div className="text-sm text-gray-600">Loan Amount</div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  {formatCurrency(mortgageResult.totalInterest)}
                </div>
                <div className="text-sm text-gray-600">Total Interest</div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  {formatCurrency(mortgageResult.totalCost)}
                </div>
                <div className="text-sm text-gray-600">Total Cost</div>
              </div>
            </div>
          </div>

          {/* Comments for Mortgage Section */}
          {user?.tier === 'premium' && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900 flex items-center">
                  <MessageSquare className="h-4 w-4 mr-2 text-amber-600" />
                  Mortgage Notes
                </h4>
                {editingComment !== 'mortgage' && (
                  <button
                    onClick={() => setEditingComment('mortgage')}
                    className="text-amber-600 hover:text-amber-700 text-sm font-medium"
                  >
                    {comments.mortgage ? 'Edit' : 'Add Notes'}
                  </button>
                )}
              </div>

              {editingComment === 'mortgage' ? (
                <div className="space-y-3">
                  <textarea
                    value={comments.mortgage}
                    onChange={(e) => setComments(prev => ({ ...prev, mortgage: e.target.value }))}
                    className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    rows={3}
                    placeholder="Add notes about this mortgage calculation..."
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCommentSave('mortgage')}
                      className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingComment(null)}
                      className="px-3 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                  {comments.mortgage ? (
                    <p className="text-amber-800 whitespace-pre-wrap">{comments.mortgage}</p>
                  ) : (
                    <p className="text-amber-600 italic">No mortgage notes added yet.</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Closing Costs */}
      {closingCosts && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
            <Home className="h-6 w-6 mr-3 text-emerald-600" />
            Closing Costs Breakdown
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="bg-emerald-50 p-6 rounded-lg mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600 mb-2">
                    {formatCurrency(closingCosts.total)}
                  </div>
                  <div className="text-sm text-emerald-700">
                    Total Estimated Closing Costs
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">
                  <p className="mb-2">
                    <strong>Cash required at closing:</strong>
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    Down payment + closing costs = {formatCurrency(downPayment + closingCosts.total)}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-700">
                  {city === 'toronto' ? 'Ontario Land Transfer Tax' : 'BC Property Transfer Tax'}
                </span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(closingCosts.landTransferTax)}
                </span>
              </div>

              {city === 'toronto' && (
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-700">Toronto Municipal Land Transfer Tax</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(closingCosts.additionalTax)}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-700">Legal Fees & Disbursements</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(closingCosts.legalFees)}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-700">Title Insurance</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(closingCosts.titleInsurance)}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-700">Home Inspection</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(closingCosts.homeInspection)}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-700">Property Appraisal</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(closingCosts.appraisal)}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-700">Survey Fee</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(closingCosts.surveyFee)}
                </span>
              </div>

              {closingCosts.firstTimeBuyerRebate > 0 && (
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-green-700">First-Time Buyer Rebate</span>
                  <span className="font-semibold text-green-600">
                    -{formatCurrency(closingCosts.firstTimeBuyerRebate)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Comments for Closing Costs Section */}
          {user?.tier === 'premium' && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900 flex items-center">
                  <MessageSquare className="h-4 w-4 mr-2 text-amber-600" />
                  Closing Costs Notes
                </h4>
                {editingComment !== 'closing' && (
                  <button
                    onClick={() => setEditingComment('closing')}
                    className="text-amber-600 hover:text-amber-700 text-sm font-medium"
                  >
                    {comments.closing ? 'Edit' : 'Add Notes'}
                  </button>
                )}
              </div>

              {editingComment === 'closing' ? (
                <div className="space-y-3">
                  <textarea
                    value={comments.closing}
                    onChange={(e) => setComments(prev => ({ ...prev, closing: e.target.value }))}
                    className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    rows={3}
                    placeholder="Add notes about closing costs..."
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCommentSave('closing')}
                      className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingComment(null)}
                      className="px-3 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                  {comments.closing ? (
                    <p className="text-amber-800 whitespace-pre-wrap">{comments.closing}</p>
                  ) : (
                    <p className="text-amber-600 italic">No closing costs notes added yet.</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Amortization Schedule */}
      {amortizationSchedule.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
            <FileText className="h-6 w-6 mr-3 text-purple-600" />
            Amortization Schedule (First 10 Years)
          </h2>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Year
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Principal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Interest
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Balance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cumulative Interest
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {amortizationSchedule.slice(0, 10).map((year) => (
                  <tr key={year.year} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {year.year}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(year.principalPayment)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(year.interestPayment)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(year.totalPayment)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(year.balance)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(year.cumulativeInterest)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {amortizationSchedule.length > 10 && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Showing first 10 years of {amortizationSchedule.length} year amortization schedule
              </p>
            </div>
          )}

          {/* Comments for Amortization Section */}
          {user?.tier === 'premium' && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900 flex items-center">
                  <MessageSquare className="h-4 w-4 mr-2 text-amber-600" />
                  Amortization Notes
                </h4>
                {editingComment !== 'amortization' && (
                  <button
                    onClick={() => setEditingComment('amortization')}
                    className="text-amber-600 hover:text-amber-700 text-sm font-medium"
                  >
                    {comments.amortization ? 'Edit' : 'Add Notes'}
                  </button>
                )}
              </div>

              {editingComment === 'amortization' ? (
                <div className="space-y-3">
                  <textarea
                    value={comments.amortization}
                    onChange={(e) => setComments(prev => ({ ...prev, amortization: e.target.value }))}
                    className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    rows={3}
                    placeholder="Add notes about the amortization schedule..."
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCommentSave('amortization')}
                      className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingComment(null)}
                      className="px-3 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                  {comments.amortization ? (
                    <p className="text-amber-800 whitespace-pre-wrap">{comments.amortization}</p>
                  ) : (
                    <p className="text-amber-600 italic">No amortization notes added yet.</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => {
              // Handle save functionality
              console.log('Saving calculation...');
            }}
            className="flex-1 flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <Save className="h-5 w-5 mr-2" />
            {user ? 'Save Calculation' : 'Sign Up to Save'}
          </button>
          
          <button
            onClick={() => {
              // Handle share functionality
              console.log('Sharing calculation...');
            }}
            className="flex items-center justify-center px-6 py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors"
          >
            <Share2 className="h-5 w-5 mr-2" />
            Share Results
          </button>

          {!user?.tier || user.tier === 'public' ? (
            <button
              onClick={() => window.location.href = '/pricing'}
              className="flex items-center justify-center px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors"
            >
              <Crown className="h-5 w-5 mr-2" />
              Upgrade for Notes
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default CalculatorPage;