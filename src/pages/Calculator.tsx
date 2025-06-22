import React, { useState, useEffect } from 'react';
import { Calculator as CalculatorIcon, ArrowRight, TrendingUp, Home, DollarSign, AlertTriangle, Save, Share2, Copy, CheckCircle, Crown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCalculations } from '../contexts/CalculationContext';
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

interface CalculationResult {
  monthlyPayment: number;
  totalInterest: number;
  totalCost: number;
  loanAmount: number;
}

interface InvestmentResult {
  monthlyCashFlow: number;
  capRate: number;
  roi: number;
  breakEvenRent: number;
  totalMonthlyExpenses: number;
  netOperatingIncome: number;
}

const Calculator: React.FC = () => {
  const { user } = useAuth();
  const { saveCalculation } = useCalculations();
  
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

  const [result, setResult] = useState<CalculationResult | null>(null);
  const [investmentResult, setInvestmentResult] = useState<InvestmentResult | null>(null);
  const [calculationId, setCalculationId] = useState<string>('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

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

  const calculateMortgage = () => {
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
    
    if (inputs.paymentFrequency === 'bi-weekly') {
      monthlyPayment = monthlyPayment / 2;
    }
    
    const calculationResult = {
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
      totalInterest: Math.round(totalInterest * 100) / 100,
      totalCost: Math.round(totalCost * 100) / 100,
      loanAmount: Math.round(loanAmount * 100) / 100
    };

    setResult(calculationResult);

    // Calculate investment metrics if enabled
    if (inputs.includeInvestment) {
      const totalExpenses = Object.values(inputs.monthlyExpenses).reduce((sum, expense) => sum + expense, 0);
      const totalMonthlyExpenses = totalExpenses + monthlyPayment;
      const monthlyCashFlow = inputs.monthlyRent - totalMonthlyExpenses;
      const netOperatingIncome = (inputs.monthlyRent - totalExpenses) * 12;
      const capRate = (netOperatingIncome / inputs.homePrice) * 100;
      const roi = ((monthlyCashFlow * 12) / inputs.downPayment) * 100;
      const breakEvenRent = totalMonthlyExpenses;

      setInvestmentResult({
        monthlyCashFlow: Math.round(monthlyCashFlow),
        capRate: Math.round(capRate * 100) / 100,
        roi: Math.round(roi * 100) / 100,
        breakEvenRent: Math.round(breakEvenRent),
        totalMonthlyExpenses: Math.round(totalMonthlyExpenses),
        netOperatingIncome: Math.round(netOperatingIncome)
      });
    } else {
      setInvestmentResult(null);
    }
  };

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

    calculateMortgage();
    setStage('results');
  };

  const handleEditInputs = () => {
    setStage('form');
  };

  const handleSave = async () => {
    if (!user) {
      // Show signup prompt for non-authenticated users
      window.location.href = '/signup';
      return;
    }

    if (!result) {
      setSaveError('Please calculate a mortgage first');
      return;
    }
    
    setSaveError('');
    setIsSaving(true);
    
    try {
      const calculationData = {
        home_price: inputs.homePrice,
        down_payment: inputs.downPayment,
        interest_rate: inputs.interestRate,
        amortization_years: inputs.amortizationYears,
        payment_frequency: inputs.paymentFrequency,
        province: inputs.province,
        city: inputs.city,
        is_first_time_buyer: inputs.isFirstTimeBuyer,
        monthly_payment: result.monthlyPayment,
        total_interest: result.totalInterest,
        notes: {},
        comments: null
      };
      
      const id = await saveCalculation(calculationData);
      
      setCalculationId(id);
      setSaveError('');
      setShowShareModal(true);
      
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to save calculation. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    if (!result) {
      setSaveError('Please calculate a mortgage first');
      return;
    }

    setSaveError('');

    if (calculationId) {
      setShowShareModal(true);
      return;
    }

    // For sharing, create a temporary shareable calculation
    try {
      setIsSaving(true);
      const calculationData = {
        home_price: inputs.homePrice,
        down_payment: inputs.downPayment,
        interest_rate: inputs.interestRate,
        amortization_years: inputs.amortizationYears,
        payment_frequency: inputs.paymentFrequency,
        province: inputs.province,
        city: inputs.city,
        is_first_time_buyer: inputs.isFirstTimeBuyer,
        monthly_payment: result.monthlyPayment,
        total_interest: result.totalInterest,
        notes: {},
        comments: null
      };
      
      const id = await saveCalculation(calculationData);
      setCalculationId(id);
      setShowShareModal(true);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to create shareable link.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyLink = async () => {
    if (!calculationId) return;
    
    const shareUrl = `${window.location.origin}/shared/${calculationId}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      alert(`Share this link: ${shareUrl}`);
    }
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
                    Minimum: 5% for homes ≤$500K, 5%+10% for $500K-$1M, 20% for &gt;$1M
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

            {/* Investment Analysis Toggle - Visually Prominent */}
            <div className="border-t border-gray-200 pt-8">
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-xl p-8 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-emerald-900 flex items-center">
                      <TrendingUp className="h-6 w-6 mr-3 text-emerald-600" />
                      Investment Property Analysis
                    </h2>
                    <p className="text-emerald-700 mt-2 text-lg">
                      Turn your home purchase into a profitable investment opportunity
                    </p>
                  </div>
                  <div className="flex items-center bg-white rounded-lg p-4 shadow-md">
                    <input
                      id="include-investment"
                      type="checkbox"
                      checked={inputs.includeInvestment}
                      onChange={(e) => updateInput('includeInvestment', e.target.checked)}
                      className="h-5 w-5 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                    />
                    <label htmlFor="include-investment" className="ml-3 block text-lg font-semibold text-emerald-800">
                      Include Investment Analysis
                    </label>
                  </div>
                </div>

                {inputs.includeInvestment && (
                  <div className="space-y-6 bg-white/80 backdrop-blur-sm p-6 rounded-lg border border-emerald-200/50">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-emerald-800 mb-2">
                          Monthly Rental Income
                        </label>
                        <CurrencyInput
                          value={inputs.monthlyRent}
                          onChange={(value) => updateInput('monthlyRent', value)}
                          placeholder="2,500"
                          className="focus:ring-emerald-500 focus:border-emerald-500 border-emerald-200"
                        />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-emerald-900 mb-4">Monthly Operating Expenses</h3>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-emerald-800 mb-2">
                            Property Taxes
                          </label>
                          <CurrencyInput
                            value={inputs.monthlyExpenses.taxes}
                            onChange={(value) => updateExpense('taxes', value)}
                            className="py-2 focus:ring-emerald-500 focus:border-emerald-500 border-emerald-200"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-emerald-800 mb-2">
                            Insurance
                          </label>
                          <CurrencyInput
                            value={inputs.monthlyExpenses.insurance}
                            onChange={(value) => updateExpense('insurance', value)}
                            className="py-2 focus:ring-emerald-500 focus:border-emerald-500 border-emerald-200"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-emerald-800 mb-2">
                            Condo Fees
                          </label>
                          <CurrencyInput
                            value={inputs.monthlyExpenses.condoFees}
                            onChange={(value) => updateExpense('condoFees', value)}
                            className="py-2 focus:ring-emerald-500 focus:border-emerald-500 border-emerald-200"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-emerald-800 mb-2">
                            Maintenance & Repairs
                          </label>
                          <CurrencyInput
                            value={inputs.monthlyExpenses.maintenance}
                            onChange={(value) => updateExpense('maintenance', value)}
                            className="py-2 focus:ring-emerald-500 focus:border-emerald-500 border-emerald-200"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-emerald-800 mb-2">
                            Other Expenses
                          </label>
                          <CurrencyInput
                            value={inputs.monthlyExpenses.other}
                            onChange={(value) => updateExpense('other', value)}
                            placeholder="Property management, etc."
                            className="py-2 focus:ring-emerald-500 focus:border-emerald-500 border-emerald-200"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-emerald-100/70 border border-emerald-300 rounded-lg p-6">
                      <h4 className="font-semibold text-emerald-900 mb-3 text-lg">🎯 Investment Analysis Benefits</h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        <ul className="text-sm text-emerald-800 space-y-2">
                          <li className="flex items-center">
                            <span className="w-2 h-2 bg-emerald-600 rounded-full mr-3"></span>
                            Calculate cap rate and ROI
                          </li>
                          <li className="flex items-center">
                            <span className="w-2 h-2 bg-emerald-600 rounded-full mr-3"></span>
                            Determine monthly cash flow
                          </li>
                        </ul>
                        <ul className="text-sm text-emerald-800 space-y-2">
                          <li className="flex items-center">
                            <span className="w-2 h-2 bg-emerald-600 rounded-full mr-3"></span>
                            Find break-even rental rate
                          </li>
                          <li className="flex items-center">
                            <span className="w-2 h-2 bg-emerald-600 rounded-full mr-3"></span>
                            Compare investment scenarios
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {!inputs.includeInvestment && (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">🏠💰</div>
                    <h3 className="text-xl font-semibold text-emerald-900 mb-2">
                      Maximize Your Property's Potential
                    </h3>
                    <p className="text-emerald-700 mb-4 max-w-2xl mx-auto">
                      Discover if your property could generate rental income. Our investment analysis 
                      calculates cash flow, cap rates, and return on investment to help you make informed decisions.
                    </p>
                    <button
                      onClick={() => updateInput('includeInvestment', true)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg"
                    >
                      Enable Investment Analysis
                    </button>
                  </div>
                )}
              </div>
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
                <CalculatorIcon className="h-5 w-5 mr-3" />
                {canCalculate ? 
                  (inputs.includeInvestment ? 'Calculate Mortgage & Investment' : 'Calculate Mortgage') : 
                  'Please Fix Errors Above'
                }
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
          onClick={handleEditInputs}
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
            <span className="text-sm font-medium text-blue-700">
              {inputs.paymentFrequency === 'monthly' ? 'Monthly' : 'Bi-weekly'} Payment
            </span>
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {result && formatCurrency(result.monthlyPayment)}
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <div className="flex items-center mb-2">
            <Home className="h-5 w-5 text-gray-600 mr-2" />
            <span className="text-sm font-medium text-gray-700">Total Interest</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {result && formatCurrency(result.totalInterest)}
          </div>
          <div className="text-sm text-gray-600">Over {inputs.amortizationYears} years</div>
        </div>

        {investmentResult && (
          <>
            <div className={`p-6 rounded-lg border ${
              investmentResult.monthlyCashFlow >= 0 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center mb-2">
                <TrendingUp className={`h-5 w-5 mr-2 ${
                  investmentResult.monthlyCashFlow >= 0 ? 'text-green-600' : 'text-red-600'
                }`} />
                <span className={`text-sm font-medium ${
                  investmentResult.monthlyCashFlow >= 0 ? 'text-green-700' : 'text-red-700'
                }`}>Cash Flow</span>
              </div>
              <div className={`text-2xl font-bold ${
                investmentResult.monthlyCashFlow >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(investmentResult.monthlyCashFlow)}
              </div>
              <div className={`text-sm ${
                investmentResult.monthlyCashFlow >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>Per month</div>
            </div>

            <div className={`p-6 rounded-lg border ${
              investmentResult.capRate >= 6 
                ? 'bg-green-50 border-green-200' 
                : 'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex items-center mb-2">
                <TrendingUp className={`h-5 w-5 mr-2 ${
                  investmentResult.capRate >= 6 ? 'text-green-600' : 'text-yellow-600'
                }`} />
                <span className={`text-sm font-medium ${
                  investmentResult.capRate >= 6 ? 'text-green-700' : 'text-yellow-700'
                }`}>Cap Rate</span>
              </div>
              <div className={`text-2xl font-bold ${
                investmentResult.capRate >= 6 ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {investmentResult.capRate.toFixed(2)}%
              </div>
              <div className={`text-sm ${
                investmentResult.capRate >= 6 ? 'text-green-600' : 'text-yellow-600'
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
          
          {result && (
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
                <span className="font-semibold text-gray-900">{formatCurrency(result.loanAmount)}</span>
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
                <span className="font-semibold text-gray-900">{formatCurrency(result.totalCost)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Investment Analysis */}
        {investmentResult && (
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg shadow-sm border border-emerald-200 p-6">
            <h2 className="text-xl font-semibold text-emerald-900 mb-6 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-emerald-600" />
              Investment Analysis
            </h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-emerald-200">
                <span className="text-emerald-700">Monthly Rental Income</span>
                <span className="font-semibold text-emerald-900">{formatCurrency(inputs.monthlyRent)}</span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-emerald-200">
                <span className="text-emerald-700">Total Monthly Expenses</span>
                <span className="font-semibold text-emerald-900">{formatCurrency(investmentResult.totalMonthlyExpenses)}</span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-emerald-200">
                <span className="text-emerald-700">Net Operating Income (Annual)</span>
                <span className="font-semibold text-emerald-900">{formatCurrency(investmentResult.netOperatingIncome)}</span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-emerald-200">
                <span className="text-emerald-700">Return on Investment (ROI)</span>
                <span className="font-semibold text-emerald-900">{investmentResult.roi.toFixed(2)}%</span>
              </div>
              
              <div className="flex justify-between items-center py-3">
                <span className="text-emerald-700">Break-even Rent</span>
                <span className="font-semibold text-emerald-900">{formatCurrency(investmentResult.breakEvenRent)}</span>
              </div>
            </div>

            {/* Investment Warnings */}
            {(investmentResult.monthlyCashFlow < 0 || investmentResult.capRate < 6) && (
              <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h3 className="font-medium text-amber-800 mb-2">Investment Considerations:</h3>
                <ul className="text-sm text-amber-700 space-y-1">
                  {investmentResult.monthlyCashFlow < 0 && (
                    <li>• Negative cash flow - expenses exceed rental income</li>
                  )}
                  {investmentResult.capRate < 6 && (
                    <li>• Low cap rate (under 6%) - consider if returns meet your goals</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error Display */}
      {saveError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
          <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Success Message */}
      {calculationId && !saveError && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            <span>Calculation saved successfully! You can now share it with others.</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {user ? (
          <button
            onClick={handleSave}
            disabled={!result || isSaving}
            className={`flex items-center justify-center px-8 py-3 rounded-lg font-semibold transition-colors shadow-lg ${
              (!result || isSaving)
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <Save className="h-5 w-5 mr-2" />
            {isSaving ? 'Saving...' : 'Save Calculation'}
          </button>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center max-w-md mx-auto">
            <Crown className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-blue-900 mb-2">Save Your Calculations</h3>
            <p className="text-sm text-blue-700 mb-4">
              Create a free account to save unlimited calculations and access them anywhere.
            </p>
            <button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Sign Up to Save
            </button>
          </div>
        )}
        
        <button
          onClick={handleShare}
          disabled={!result || isSaving}
          className={`flex items-center justify-center px-8 py-3 rounded-lg font-semibold transition-colors shadow-lg ${
            (!result || isSaving)
              ? 'bg-gray-100 border border-gray-300 text-gray-400 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          }`}
        >
          <Share2 className="h-5 w-5 mr-2" />
          {isSaving ? 'Creating Link...' : 'Share Results'}
        </button>
      </div>

      {/* Share Modal */}
      {showShareModal && calculationId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Share Calculation</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shareable Link
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={`${window.location.origin}/shared/${calculationId}`}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg bg-gray-50 text-sm"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-r-lg transition-colors"
                  >
                    {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
                {copied && (
                  <p className="text-sm text-green-600 mt-1">Copied to clipboard!</p>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowShareModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calculator;