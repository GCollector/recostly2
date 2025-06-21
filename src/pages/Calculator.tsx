import React, { useState, useEffect } from 'react';
import { Calculator, ArrowRight, TrendingUp, Home, DollarSign, AlertTriangle } from 'lucide-react';
import CurrencyInput from '../components/CurrencyInput';
import { 
  validateMortgageInputs, 
  ValidationDisplay, 
  hasErrors, 
  getInputErrorClass,
  type ValidationError 
} from '../components/FormValidation';

interface CalculationInputs {
  // Property Details
  homePrice: number;
  downPayment: number;
  interestRate: number;
  amortizationYears: number;
  paymentFrequency: 'monthly' | 'bi-weekly';
  province: 'ontario' | 'bc';
  city: 'toronto' | 'vancouver';
  isFirstTimeBuyer: boolean;
  
  // Investment Details (optional)
  includeInvestment: boolean;
  monthlyRent: number;
  monthlyExpenses: {
    taxes: number;
    insurance: number;
    condoFees: number;
    maintenance: number;
    other: number;
  };
}

const CalculatorPage: React.FC = () => {
  const [stage, setStage] = useState<'form' | 'results'>('form');
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [inputs, setInputs] = useState<CalculationInputs>({
    homePrice: 500000,
    downPayment: 100000,
    interestRate: 5.25,
    amortizationYears: 25,
    paymentFrequency: 'monthly',
    province: 'ontario',
    city: 'toronto',
    isFirstTimeBuyer: false,
    includeInvestment: false,
    monthlyRent: 2500,
    monthlyExpenses: {
      taxes: 400,
      insurance: 150,
      condoFees: 300,
      maintenance: 200,
      other: 100
    }
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const updateInput = (key: keyof CalculationInputs, value: any) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  const updateExpense = (key: keyof typeof inputs.monthlyExpenses, value: number) => {
    setInputs(prev => ({
      ...prev,
      monthlyExpenses: { ...prev.monthlyExpenses, [key]: value }
    }));
  };

  // Validate inputs whenever they change
  useEffect(() => {
    const errors = validateMortgageInputs({
      homePrice: inputs.homePrice,
      downPayment: inputs.downPayment,
      interestRate: inputs.interestRate,
      amortizationYears: inputs.amortizationYears,
      isFirstTimeBuyer: inputs.isFirstTimeBuyer,
      province: inputs.province
    });
    setValidationErrors(errors);
  }, [inputs.homePrice, inputs.downPayment, inputs.interestRate, inputs.amortizationYears, inputs.isFirstTimeBuyer, inputs.province]);

  const handleCalculate = () => {
    // Final validation before proceeding
    const errors = validateMortgageInputs({
      homePrice: inputs.homePrice,
      downPayment: inputs.downPayment,
      interestRate: inputs.interestRate,
      amortizationYears: inputs.amortizationYears,
      isFirstTimeBuyer: inputs.isFirstTimeBuyer,
      province: inputs.province
    });

    if (hasErrors(errors)) {
      // Scroll to top to show errors
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setStage('results');
  };

  const handleEditInputs = () => {
    setStage('form');
  };

  const downPaymentPercent = inputs.homePrice > 0 ? Math.round((inputs.downPayment / inputs.homePrice) * 100) : 0;
  const canCalculate = !hasErrors(validationErrors);

  if (stage === 'form') {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">Mortgage Calculator</h1>
          <p className="text-lg text-gray-600">
            Enter your property details to calculate mortgage payments and investment metrics
          </p>
        </div>

        {/* Validation Messages */}
        <ValidationDisplay errors={validationErrors} />

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="space-y-8">
            {/* Property Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Home className="h-5 w-5 mr-2 text-blue-600" />
                Property Information
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Home Purchase Price *
                  </label>
                  <CurrencyInput
                    value={inputs.homePrice}
                    onChange={(value) => updateInput('homePrice', value)}
                    placeholder="500,000"
                    className={getInputErrorClass(validationErrors, 'homePrice')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Down Payment *
                  </label>
                  <CurrencyInput
                    value={inputs.downPayment}
                    onChange={(value) => updateInput('downPayment', value)}
                    placeholder="100,000"
                    suffix={`${downPaymentPercent}%`}
                    className={getInputErrorClass(validationErrors, 'downPayment')}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum: 5% for homes ≤$500K, 5%+10% for $500K-$1M, 20% for >$1M
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Interest Rate * (Annual)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      max="20"
                      value={inputs.interestRate}
                      onChange={(e) => updateInput('interestRate', Number(e.target.value))}
                      className={`w-full pr-8 pl-3 py-3 border rounded-lg focus:ring-2 ${getInputErrorClass(validationErrors, 'interestRate')}`}
                      placeholder="5.25"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Current rates typically range from 3% to 7%
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amortization Period *
                  </label>
                  <select
                    value={inputs.amortizationYears}
                    onChange={(e) => updateInput('amortizationYears', Number(e.target.value))}
                    className={`w-full px-3 py-3 border rounded-lg focus:ring-2 ${getInputErrorClass(validationErrors, 'amortizationYears')}`}
                  >
                    {[15, 20, 25, 30].map(years => (
                      <option key={years} value={years}>{years} years</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum 25 years for down payments under 20%
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Frequency
                  </label>
                  <select
                    value={inputs.paymentFrequency}
                    onChange={(e) => updateInput('paymentFrequency', e.target.value as 'monthly' | 'bi-weekly')}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="bi-weekly">Bi-weekly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <select
                    value={inputs.province === 'ontario' ? 'toronto' : 'vancouver'}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === 'toronto') {
                        updateInput('province', 'ontario');
                        updateInput('city', 'toronto');
                      } else {
                        updateInput('province', 'bc');
                        updateInput('city', 'vancouver');
                      }
                    }}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="toronto">Toronto, ON</option>
                    <option value="vancouver">Vancouver, BC</option>
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center">
                  <input
                    id="first-time-buyer"
                    type="checkbox"
                    checked={inputs.isFirstTimeBuyer}
                    onChange={(e) => updateInput('isFirstTimeBuyer', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="first-time-buyer" className="ml-2 block text-sm text-gray-700">
                    First-time homebuyer (eligible for rebates and incentives)
                  </label>
                </div>
              </div>
            </div>

            {/* Stress Test Information */}
            {inputs.homePrice > 0 && inputs.downPayment > 0 && inputs.interestRate > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">Canadian Stress Test (B-20 Guidelines)</h3>
                <p className="text-sm text-blue-800">
                  Your mortgage will be qualified at {Math.max(inputs.interestRate + 2, 5.25).toFixed(2)}% 
                  (your rate + 2% or 5.25%, whichever is higher) to ensure you can handle rate increases.
                </p>
              </div>
            )}

            {/* Investment Analysis Toggle */}
            <div className="border-t border-gray-200 pt-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-emerald-600" />
                    Investment Analysis
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Optional: Add rental income details for investment property analysis
                  </p>
                </div>
                <div className="flex items-center">
                  <input
                    id="include-investment"
                    type="checkbox"
                    checked={inputs.includeInvestment}
                    onChange={(e) => updateInput('includeInvestment', e.target.checked)}
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                  />
                  <label htmlFor="include-investment" className="ml-2 block text-sm text-gray-700">
                    Include investment analysis
                  </label>
                </div>
              </div>

              {inputs.includeInvestment && (
                <div className="space-y-6 bg-emerald-50 p-6 rounded-lg border border-emerald-200">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Monthly Rental Income
                      </label>
                      <CurrencyInput
                        value={inputs.monthlyRent}
                        onChange={(value) => updateInput('monthlyRent', value)}
                        placeholder="2,500"
                        className="focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Expenses</h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Property Taxes
                        </label>
                        <CurrencyInput
                          value={inputs.monthlyExpenses.taxes}
                          onChange={(value) => updateExpense('taxes', value)}
                          className="py-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Insurance
                        </label>
                        <CurrencyInput
                          value={inputs.monthlyExpenses.insurance}
                          onChange={(value) => updateExpense('insurance', value)}
                          className="py-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Condo Fees
                        </label>
                        <CurrencyInput
                          value={inputs.monthlyExpenses.condoFees}
                          onChange={(value) => updateExpense('condoFees', value)}
                          className="py-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Maintenance
                        </label>
                        <CurrencyInput
                          value={inputs.monthlyExpenses.maintenance}
                          onChange={(value) => updateExpense('maintenance', value)}
                          className="py-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Other Expenses
                        </label>
                        <CurrencyInput
                          value={inputs.monthlyExpenses.other}
                          onChange={(value) => updateExpense('other', value)}
                          placeholder="Property management, etc."
                          className="py-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Calculate Button */}
            <div className="border-t border-gray-200 pt-8">
              <button
                onClick={handleCalculate}
                disabled={!canCalculate}
                className={`w-full flex items-center justify-center px-8 py-4 rounded-lg text-lg font-semibold transition-colors shadow-lg ${
                  canCalculate
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {!canCalculate && <AlertTriangle className="h-5 w-5 mr-3" />}
                <Calculator className="h-5 w-5 mr-3" />
                {canCalculate ? 'Calculate Mortgage & Investment' : 'Please Fix Errors Above'}
                {canCalculate && <ArrowRight className="h-5 w-5 ml-3" />}
              </button>
              
              {!canCalculate && (
                <p className="text-sm text-gray-500 text-center mt-2">
                  Please correct the validation errors above to proceed with the calculation.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Stage 2: Results Page
  return (
    <CalculationResults 
      inputs={inputs} 
      onEdit={handleEditInputs}
      formatCurrency={formatCurrency}
    />
  );
};

// Results Component
interface CalculationResultsProps {
  inputs: CalculationInputs;
  onEdit: () => void;
  formatCurrency: (amount: number) => string;
}

const CalculationResults: React.FC<CalculationResultsProps> = ({ inputs, onEdit, formatCurrency }) => {
  // Mortgage Calculations
  const loanAmount = inputs.homePrice - inputs.downPayment;
  const monthlyRate = inputs.interestRate / 100 / 12;
  const totalPayments = inputs.amortizationYears * 12;
  
  let monthlyPayment = 0;
  if (monthlyRate > 0) {
    monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
                    (Math.pow(1 + monthlyRate, totalPayments) - 1);
  } else {
    monthlyPayment = loanAmount / totalPayments;
  }
  
  const totalCost = monthlyPayment * totalPayments + inputs.downPayment;
  const totalInterest = totalCost - inputs.homePrice;

  // Investment Calculations
  let investmentResults = null;
  if (inputs.includeInvestment) {
    const totalExpenses = Object.values(inputs.monthlyExpenses).reduce((sum, expense) => sum + expense, 0);
    const totalMonthlyExpenses = totalExpenses + monthlyPayment;
    const monthlyCashFlow = inputs.monthlyRent - totalMonthlyExpenses;
    const netOperatingIncome = (inputs.monthlyRent - totalExpenses) * 12;
    const capRate = (netOperatingIncome / inputs.homePrice) * 100;
    const roi = ((monthlyCashFlow * 12) / inputs.downPayment) * 100;
    const breakEvenRent = totalMonthlyExpenses;

    investmentResults = {
      monthlyCashFlow,
      capRate,
      roi,
      breakEvenRent,
      totalMonthlyExpenses,
      netOperatingIncome
    };
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header with Edit Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calculation Results</h1>
          <p className="text-lg text-gray-600">
            {formatCurrency(inputs.homePrice)} property in {inputs.city === 'toronto' ? 'Toronto' : 'Vancouver'}
          </p>
        </div>
        <button
          onClick={onEdit}
          className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
        >
          Edit Inputs
        </button>
      </div>

      {/* Key Summary Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <div className="flex items-center mb-2">
            <DollarSign className="h-5 w-5 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-blue-700">Monthly Payment</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {formatCurrency(monthlyPayment)}
          </div>
          <div className="text-sm text-blue-600">
            {inputs.paymentFrequency === 'monthly' ? 'Monthly' : 'Bi-weekly'}
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <div className="flex items-center mb-2">
            <Home className="h-5 w-5 text-gray-600 mr-2" />
            <span className="text-sm font-medium text-gray-700">Total Interest</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(totalInterest)}
          </div>
          <div className="text-sm text-gray-600">Over {inputs.amortizationYears} years</div>
        </div>

        {investmentResults && (
          <>
            <div className={`p-6 rounded-lg border ${
              investmentResults.monthlyCashFlow >= 0 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center mb-2">
                <TrendingUp className={`h-5 w-5 mr-2 ${
                  investmentResults.monthlyCashFlow >= 0 ? 'text-green-600' : 'text-red-600'
                }`} />
                <span className={`text-sm font-medium ${
                  investmentResults.monthlyCashFlow >= 0 ? 'text-green-700' : 'text-red-700'
                }`}>Cash Flow</span>
              </div>
              <div className={`text-2xl font-bold ${
                investmentResults.monthlyCashFlow >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(investmentResults.monthlyCashFlow)}
              </div>
              <div className={`text-sm ${
                investmentResults.monthlyCashFlow >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>Per month</div>
            </div>

            <div className={`p-6 rounded-lg border ${
              investmentResults.capRate >= 6 
                ? 'bg-green-50 border-green-200' 
                : 'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex items-center mb-2">
                <TrendingUp className={`h-5 w-5 mr-2 ${
                  investmentResults.capRate >= 6 ? 'text-green-600' : 'text-yellow-600'
                }`} />
                <span className={`text-sm font-medium ${
                  investmentResults.capRate >= 6 ? 'text-green-700' : 'text-yellow-700'
                }`}>Cap Rate</span>
              </div>
              <div className={`text-2xl font-bold ${
                investmentResults.capRate >= 6 ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {investmentResults.capRate.toFixed(2)}%
              </div>
              <div className={`text-sm ${
                investmentResults.capRate >= 6 ? 'text-green-600' : 'text-yellow-600'
              }`}>Annual return</div>
            </div>
          </>
        )}
      </div>

      {/* Detailed Results */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Mortgage Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Mortgage Breakdown</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-gray-600">Purchase Price</span>
              <span className="font-semibold text-gray-900">{formatCurrency(inputs.homePrice)}</span>
            </div>
            
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-gray-600">Down Payment</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(inputs.downPayment)} 
                <span className="text-sm text-gray-500 ml-1">
                  ({Math.round((inputs.downPayment / inputs.homePrice) * 100)}%)
                </span>
              </span>
            </div>
            
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-gray-600">Loan Amount</span>
              <span className="font-semibold text-gray-900">{formatCurrency(loanAmount)}</span>
            </div>
            
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-gray-600">Interest Rate</span>
              <span className="font-semibold text-gray-900">{inputs.interestRate}%</span>
            </div>
            
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-gray-600">Amortization</span>
              <span className="font-semibold text-gray-900">{inputs.amortizationYears} years</span>
            </div>
            
            <div className="flex justify-between items-center py-3">
              <span className="text-gray-600">Total Cost</span>
              <span className="font-semibold text-gray-900">{formatCurrency(totalCost)}</span>
            </div>
          </div>
        </div>

        {/* Investment Analysis */}
        {investmentResults && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Investment Analysis</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <span className="text-gray-600">Monthly Rental Income</span>
                <span className="font-semibold text-gray-900">{formatCurrency(inputs.monthlyRent)}</span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <span className="text-gray-600">Total Monthly Expenses</span>
                <span className="font-semibold text-gray-900">{formatCurrency(investmentResults.totalMonthlyExpenses)}</span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <span className="text-gray-600">Net Operating Income (Annual)</span>
                <span className="font-semibold text-gray-900">{formatCurrency(investmentResults.netOperatingIncome)}</span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <span className="text-gray-600">Return on Investment (ROI)</span>
                <span className="font-semibold text-gray-900">{investmentResults.roi.toFixed(2)}%</span>
              </div>
              
              <div className="flex justify-between items-center py-3">
                <span className="text-gray-600">Break-even Rent</span>
                <span className="font-semibold text-gray-900">{formatCurrency(investmentResults.breakEvenRent)}</span>
              </div>
            </div>

            {/* Investment Warnings */}
            {(investmentResults.monthlyCashFlow < 0 || investmentResults.capRate < 6) && (
              <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h3 className="font-medium text-amber-800 mb-2">Investment Considerations:</h3>
                <ul className="text-sm text-amber-700 space-y-1">
                  {investmentResults.monthlyCashFlow < 0 && (
                    <li>• Negative cash flow - expenses exceed rental income</li>
                  )}
                  {investmentResults.capRate < 6 && (
                    <li>• Low cap rate (under 6%) - consider if returns meet your goals</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <button className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
          Save Calculation
        </button>
        <button className="flex items-center px-6 py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors">
          Share Results
        </button>
      </div>
    </div>
  );
};

export default CalculatorPage;