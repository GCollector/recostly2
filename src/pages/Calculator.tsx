import React, { useState, useEffect } from 'react';
import { Calculator as CalculatorIcon, ArrowRight, TrendingUp, Home, DollarSign, AlertTriangle, Save, Share2, Copy, CheckCircle, Crown, PieChart, BarChart3, LineChart, Info, MapPin, Calendar, Percent } from 'lucide-react';
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
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart as RechartsBarChart, Bar, PieChart as RechartsPieChart, Cell, Pie, AreaChart, Area } from 'recharts';

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

interface AmortizationData {
  year: number;
  principalPayment: number;
  interestPayment: number;
  balance: number;
  totalPayment: number;
  cumulativeInterest: number;
}

const Calculator: React.FC = () => {
  const { user } = useAuth();
  const { saveCalculation, calculations } = useCalculations();
  
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
  const [amortizationSchedule, setAmortizationSchedule] = useState<AmortizationData[]>([]);
  const [calculationId, setCalculationId] = useState<string>('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [activeSection, setActiveSection] = useState<'overview' | 'breakdown' | 'amortization' | 'investment' | 'comparison'>('overview');

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

  const calculateAmortizationSchedule = (loanAmount: number, monthlyPayment: number, monthlyRate: number, totalPayments: number) => {
    const schedule: AmortizationData[] = [];
    let remainingBalance = loanAmount;
    let cumulativeInterest = 0;

    for (let year = 1; year <= inputs.amortizationYears; year++) {
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
        principalPayment: Math.round(yearlyPrincipal),
        interestPayment: Math.round(yearlyInterest),
        balance: Math.round(Math.max(0, remainingBalance)),
        totalPayment: Math.round(yearlyPrincipal + yearlyInterest),
        cumulativeInterest: Math.round(cumulativeInterest)
      });

      if (remainingBalance <= 0) break;
    }

    return schedule;
  };

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

    // Calculate amortization schedule
    const schedule = calculateAmortizationSchedule(loanAmount, monthlyPayment, monthlyRate, totalPayments);
    setAmortizationSchedule(schedule);

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
    setActiveSection('overview');
  };

  const handleEditInputs = () => {
    setStage('form');
  };

  const canSaveCalculation = () => {
    if (!user) return false;
    
    // Free users (basic tier) can only save 1 calculation
    if (user.tier === 'basic' && calculations.length >= 1) {
      return false;
    }
    
    return true;
  };

  const handleSave = async () => {
    if (!user) {
      // Show signup prompt for non-authenticated users
      window.location.href = '/signup';
      return;
    }

    // Check save limits for free users
    if (!canSaveCalculation()) {
      setSaveError('Free users can only save 1 calculation. Upgrade to save unlimited calculations.');
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

  // Chart colors
  const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

  // Prepare chart data
  const costBreakdownData = result ? [
    { name: 'Principal', value: result.loanAmount, color: '#3b82f6' },
    { name: 'Interest', value: result.totalInterest, color: '#8b5cf6' },
    { name: 'Down Payment', value: inputs.downPayment, color: '#10b981' }
  ] : [];

  const monthlyBreakdownData = result && investmentResult ? [
    { name: 'Mortgage Payment', value: result.monthlyPayment, color: '#3b82f6' },
    { name: 'Property Taxes', value: inputs.monthlyExpenses.taxes, color: '#f59e0b' },
    { name: 'Insurance', value: inputs.monthlyExpenses.insurance, color: '#ef4444' },
    { name: 'Condo Fees', value: inputs.monthlyExpenses.condoFees, color: '#8b5cf6' },
    { name: 'Maintenance', value: inputs.monthlyExpenses.maintenance, color: '#10b981' },
    { name: 'Other', value: inputs.monthlyExpenses.other, color: '#6b7280' }
  ] : [];

  if (stage === 'form') {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold font-heading text-slate-900">Mortgage Calculator</h1>
          <p className="text-lg font-sans text-slate-600">
            Enter your property details to calculate mortgage payments and investment metrics
          </p>
        </div>

        {/* Validation Messages */}
        <ValidationDisplay errors={validationErrors} />

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <div className="space-y-8">
            {/* Property Information */}
            <div>
              <h2 className="text-xl font-semibold font-heading text-slate-900 mb-6 flex items-center">
                <Home className="h-5 w-5 mr-2 text-blue-600" />
                Property Information
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium font-sans text-slate-700 mb-2">
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
                  <label className="block text-sm font-medium font-sans text-slate-700 mb-2">
                    Down Payment *
                  </label>
                  <CurrencyInput
                    value={inputs.downPayment}
                    onChange={(value) => updateInput('downPayment', value)}
                    placeholder="100,000"
                    suffix={`${downPaymentPercent}%`}
                    className={getInputErrorClass(validationErrors, 'downPayment')}
                  />
                  <p className="text-xs font-sans text-slate-500 mt-1">
                    Minimum: 5% for homes ≤$500K, 5%+10% for $500K-$1M, 20% for >$1M
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium font-sans text-slate-700 mb-2">
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
                      className={`w-full pr-8 pl-3 py-3 border rounded-lg focus:ring-2 font-sans ${getInputErrorClass(validationErrors, 'interestRate')}`}
                      placeholder="5.25"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500">%</span>
                  </div>
                  <p className="text-xs font-sans text-slate-500 mt-1">
                    Current rates typically range from 3% to 7%
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium font-sans text-slate-700 mb-2">
                    Amortization Period *
                  </label>
                  <select
                    value={inputs.amortizationYears}
                    onChange={(e) => updateInput('amortizationYears', Number(e.target.value))}
                    className={`w-full px-3 py-3 border rounded-lg focus:ring-2 font-sans ${getInputErrorClass(validationErrors, 'amortizationYears')}`}
                  >
                    {[15, 20, 25, 30].map(years => (
                      <option key={years} value={years}>{years} years</option>
                    ))}
                  </select>
                  <p className="text-xs font-sans text-slate-500 mt-1">
                    Maximum 25 years for down payments under 20%
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium font-sans text-slate-700 mb-2">
                    Payment Frequency
                  </label>
                  <select
                    value={inputs.paymentFrequency}
                    onChange={(e) => updateInput('paymentFrequency', e.target.value as 'monthly' | 'bi-weekly')}
                    className="w-full px-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-sans"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="bi-weekly">Bi-weekly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium font-sans text-slate-700 mb-2">
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
                    className="w-full px-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-sans"
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
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                  />
                  <label htmlFor="first-time-buyer" className="ml-2 block text-sm font-sans text-slate-700">
                    First-time homebuyer (eligible for rebates and incentives)
                  </label>
                </div>
              </div>
            </div>

            {/* Investment Analysis Toggle */}
            <div className="border-t border-slate-200 pt-8">
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-xl p-8 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold font-heading text-emerald-900 flex items-center">
                      <TrendingUp className="h-6 w-6 mr-3 text-emerald-600" />
                      Investment Property Analysis
                    </h2>
                    <p className="font-sans text-emerald-700 mt-2 text-lg">
                      Turn your home purchase into a profitable investment opportunity
                    </p>
                  </div>
                  <button
                    onClick={() => updateInput('includeInvestment', !inputs.includeInvestment)}
                    className={`px-6 py-3 rounded-lg font-semibold font-sans transition-all duration-200 transform hover:scale-105 shadow-lg ${
                      inputs.includeInvestment
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-white hover:bg-emerald-50 text-emerald-700 border-2 border-emerald-600'
                    }`}
                  >
                    {inputs.includeInvestment ? 'Investment Enabled' : 'Enable Investment Analysis'}
                  </button>
                </div>

                {inputs.includeInvestment && (
                  <div className="space-y-6 bg-white/80 backdrop-blur-sm p-6 rounded-lg border border-emerald-200/50">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium font-sans text-emerald-800 mb-2">
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
                      <h3 className="text-lg font-semibold font-heading text-emerald-900 mb-4">Monthly Operating Expenses</h3>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium font-sans text-emerald-800 mb-2">
                            Property Taxes
                          </label>
                          <CurrencyInput
                            value={inputs.monthlyExpenses.taxes}
                            onChange={(value) => updateExpense('taxes', value)}
                            className="py-2 focus:ring-emerald-500 focus:border-emerald-500 border-emerald-200"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium font-sans text-emerald-800 mb-2">
                            Insurance
                          </label>
                          <CurrencyInput
                            value={inputs.monthlyExpenses.insurance}
                            onChange={(value) => updateExpense('insurance', value)}
                            className="py-2 focus:ring-emerald-500 focus:border-emerald-500 border-emerald-200"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium font-sans text-emerald-800 mb-2">
                            Condo Fees
                          </label>
                          <CurrencyInput
                            value={inputs.monthlyExpenses.condoFees}
                            onChange={(value) => updateExpense('condoFees', value)}
                            className="py-2 focus:ring-emerald-500 focus:border-emerald-500 border-emerald-200"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium font-sans text-emerald-800 mb-2">
                            Maintenance & Repairs
                          </label>
                          <CurrencyInput
                            value={inputs.monthlyExpenses.maintenance}
                            onChange={(value) => updateExpense('maintenance', value)}
                            className="py-2 focus:ring-emerald-500 focus:border-emerald-500 border-emerald-200"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium font-sans text-emerald-800 mb-2">
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
                      <h4 className="font-semibold font-heading text-emerald-900 mb-3 text-lg">🎯 Investment Analysis Benefits</h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        <ul className="text-sm font-sans text-emerald-800 space-y-2">
                          <li className="flex items-center">
                            <span className="w-2 h-2 bg-emerald-600 rounded-full mr-3"></span>
                            Calculate cap rate and ROI
                          </li>
                          <li className="flex items-center">
                            <span className="w-2 h-2 bg-emerald-600 rounded-full mr-3"></span>
                            Determine monthly cash flow
                          </li>
                        </ul>
                        <ul className="text-sm font-sans text-emerald-800 space-y-2">
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
                  <div className="bg-emerald-100/50 border border-emerald-200 rounded-lg p-6 text-center">
                    <TrendingUp className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold font-heading text-emerald-900 mb-2">Ready to Analyze Your Investment?</h3>
                    <p className="font-sans text-emerald-700 mb-4">
                      Enable investment analysis to calculate cap rates, cash flow, ROI, and break-even metrics for your property.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4 text-sm font-sans text-emerald-800">
                      <ul className="space-y-2">
                        <li>• Monthly cash flow analysis</li>
                        <li>• Cap rate calculations</li>
                      </ul>
                      <ul className="space-y-2">
                        <li>• Return on investment (ROI)</li>
                        <li>• Break-even rental rates</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Calculate Button */}
            <div className="border-t border-slate-200 pt-8">
              <button
                onClick={handleCalculate}
                disabled={!canCalculate}
                className={`w-full flex items-center justify-center px-8 py-4 rounded-lg text-lg font-semibold font-sans transition-colors shadow-lg ${
                  canCalculate
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
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
                <p className="text-sm font-sans text-slate-500 text-center mt-2">
                  Please correct the validation errors above to proceed with the calculation.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Stage 2: Results Page with Enhanced Visuals
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header with Property Summary */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold font-heading mb-2">Calculation Results</h1>
            <div className="flex flex-wrap items-center gap-4 text-blue-100">
              <div className="flex items-center">
                <Home className="h-5 w-5 mr-2" />
                <span className="font-sans">{formatCurrency(inputs.homePrice)} Property</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                <span className="font-sans">{inputs.city === 'toronto' ? 'Toronto, ON' : 'Vancouver, BC'}</span>
              </div>
              <div className="flex items-center">
                <Percent className="h-5 w-5 mr-2" />
                <span className="font-sans">{inputs.interestRate}% Interest</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                <span className="font-sans">{inputs.amortizationYears} Year Term</span>
              </div>
              {inputs.includeInvestment && (
                <div className="bg-emerald-500/20 px-3 py-1 rounded-full">
                  <span className="font-sans text-sm">Investment Analysis</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleEditInputs}
              className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg font-medium font-sans transition-colors backdrop-blur-sm"
            >
              Edit Inputs
            </button>
            <button
              onClick={handleShare}
              disabled={!result || isSaving}
              className={`px-6 py-3 rounded-lg font-medium font-sans transition-colors ${
                (!result || isSaving)
                  ? 'bg-white/10 text-white/50 cursor-not-allowed'
                  : 'bg-white text-blue-600 hover:bg-blue-50'
              }`}
            >
              <Share2 className="h-4 w-4 mr-2 inline" />
              {isSaving ? 'Creating Link...' : 'Share Results'}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2">
        <nav className="flex space-x-1" aria-label="Tabs">
          {[
            { id: 'overview', name: 'Overview', icon: PieChart },
            { id: 'breakdown', name: 'Cost Breakdown', icon: BarChart3 },
            { id: 'amortization', name: 'Amortization', icon: LineChart },
            ...(investmentResult ? [{ id: 'investment', name: 'Investment Analysis', icon: TrendingUp }] : []),
            { id: 'comparison', name: 'Scenarios', icon: DollarSign }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id as any)}
                className={`flex-1 flex items-center justify-center px-3 py-3 text-sm font-medium font-sans rounded-lg transition-colors ${
                  activeSection === tab.id
                    ? 'bg-blue-100 text-blue-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Overview Section */}
      {activeSection === 'overview' && result && (
        <div className="space-y-8">
          {/* Key Metrics Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 transform hover:scale-105 transition-transform duration-200">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium font-sans text-blue-700">
                    {inputs.paymentFrequency === 'monthly' ? 'Monthly' : 'Bi-weekly'} Payment
                  </p>
                </div>
              </div>
              <div className="text-3xl font-bold font-heading text-blue-900">
                {formatCurrency(result.monthlyPayment)}
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200 transform hover:scale-105 transition-transform duration-200">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <Home className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium font-sans text-purple-700">Total Interest</p>
                </div>
              </div>
              <div className="text-3xl font-bold font-heading text-purple-900">
                {formatCurrency(result.totalInterest)}
              </div>
              <div className="text-sm font-sans text-purple-600 mt-1">Over {inputs.amortizationYears} years</div>
            </div>

            {investmentResult && (
              <>
                <div className={`p-6 rounded-xl border transform hover:scale-105 transition-transform duration-200 ${
                  investmentResult.monthlyCashFlow >= 0 
                    ? 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200' 
                    : 'bg-gradient-to-br from-red-50 to-red-100 border-red-200'
                }`}>
                  <div className="flex items-center mb-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                      investmentResult.monthlyCashFlow >= 0 ? 'bg-emerald-600' : 'bg-red-600'
                    }`}>
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className={`text-sm font-medium font-sans ${
                        investmentResult.monthlyCashFlow >= 0 ? 'text-emerald-700' : 'text-red-700'
                      }`}>Monthly Cash Flow</p>
                    </div>
                  </div>
                  <div className={`text-3xl font-bold font-heading ${
                    investmentResult.monthlyCashFlow >= 0 ? 'text-emerald-900' : 'text-red-900'
                  }`}>
                    {formatCurrency(investmentResult.monthlyCashFlow)}
                  </div>
                </div>

                <div className={`p-6 rounded-xl border transform hover:scale-105 transition-transform duration-200 ${
                  investmentResult.capRate >= 6 
                    ? 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200' 
                    : 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200'
                }`}>
                  <div className="flex items-center mb-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                      investmentResult.capRate >= 6 ? 'bg-emerald-600' : 'bg-amber-600'
                    }`}>
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className={`text-sm font-medium font-sans ${
                        investmentResult.capRate >= 6 ? 'text-emerald-700' : 'text-amber-700'
                      }`}>Cap Rate</p>
                    </div>
                  </div>
                  <div className={`text-3xl font-bold font-heading ${
                    investmentResult.capRate >= 6 ? 'text-emerald-900' : 'text-amber-900'
                  }`}>
                    {investmentResult.capRate.toFixed(2)}%
                  </div>
                  <div className={`text-sm font-sans mt-1 ${
                    investmentResult.capRate >= 6 ? 'text-emerald-600' : 'text-amber-600'
                  }`}>Annual return</div>
                </div>
              </>
            )}
          </div>

          {/* Cost Breakdown Pie Chart */}
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-xl font-semibold font-heading text-slate-900 mb-6 flex items-center">
                <PieChart className="h-5 w-5 mr-2 text-blue-600" />
                Total Cost Breakdown
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={costBreakdownData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={800}
                    >
                      {costBreakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-xl font-semibold font-heading text-slate-900 mb-6">Payment Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="font-sans text-slate-600">Purchase Price</span>
                  <span className="font-semibold font-heading text-slate-900">{formatCurrency(inputs.homePrice)}</span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="font-sans text-slate-600">Down Payment</span>
                  <span className="font-semibold font-heading text-slate-900">
                    {formatCurrency(inputs.downPayment)} 
                    <span className="text-sm font-sans text-slate-500 ml-1">
                      ({Math.round((inputs.downPayment / inputs.homePrice) * 100)}%)
                    </span>
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="font-sans text-slate-600">Loan Amount</span>
                  <span className="font-semibold font-heading text-slate-900">{formatCurrency(result.loanAmount)}</span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="font-sans text-slate-600">Interest Rate</span>
                  <span className="font-semibold font-heading text-slate-900">{inputs.interestRate}%</span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="font-sans text-slate-600">Amortization</span>
                  <span className="font-semibold font-heading text-slate-900">{inputs.amortizationYears} years</span>
                </div>
                
                <div className="flex justify-between items-center py-3 bg-blue-50 px-4 rounded-lg">
                  <span className="font-sans text-blue-700 font-medium">Total Cost</span>
                  <span className="font-bold font-heading text-blue-900 text-lg">{formatCurrency(result.totalCost)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cost Breakdown Section */}
      {activeSection === 'breakdown' && result && (
        <div className="space-y-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Principal vs Interest Over Time */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-xl font-semibold font-heading text-slate-900 mb-6 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                Principal vs Interest by Year
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={amortizationSchedule.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value, name) => [
                      formatCurrency(Number(value)), 
                      name === 'principalPayment' ? 'Principal' : 'Interest'
                    ]} />
                    <Legend />
                    <Bar dataKey="principalPayment" stackId="a" fill="#3b82f6" name="Principal" />
                    <Bar dataKey="interestPayment" stackId="a" fill="#8b5cf6" name="Interest" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Monthly Expense Breakdown (if investment enabled) */}
            {investmentResult && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-xl font-semibold font-heading text-slate-900 mb-6 flex items-center">
                  <PieChart className="h-5 w-5 mr-2 text-emerald-600" />
                  Monthly Expense Breakdown
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={monthlyBreakdownData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        animationBegin={0}
                        animationDuration={800}
                      >
                        {monthlyBreakdownData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* Detailed Cost Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-xl font-semibold font-heading text-slate-900 mb-6">Detailed Cost Analysis</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium font-sans text-slate-500 uppercase tracking-wider">
                      Component
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium font-sans text-slate-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium font-sans text-slate-500 uppercase tracking-wider">
                      Percentage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium font-sans text-slate-500 uppercase tracking-wider">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium font-heading text-slate-900">
                      Down Payment
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-sans text-slate-900">
                      {formatCurrency(inputs.downPayment)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-sans text-slate-900">
                      {((inputs.downPayment / result.totalCost) * 100).toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 text-sm font-sans text-slate-500">
                      Initial payment at purchase
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium font-heading text-slate-900">
                      Principal Payments
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-sans text-slate-900">
                      {formatCurrency(result.loanAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-sans text-slate-900">
                      {((result.loanAmount / result.totalCost) * 100).toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 text-sm font-sans text-slate-500">
                      Loan amount paid over {inputs.amortizationYears} years
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium font-heading text-slate-900">
                      Interest Payments
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-sans text-slate-900">
                      {formatCurrency(result.totalInterest)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-sans text-slate-900">
                      {((result.totalInterest / result.totalCost) * 100).toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 text-sm font-sans text-slate-500">
                      Total interest at {inputs.interestRate}% over {inputs.amortizationYears} years
                    </td>
                  </tr>
                  <tr className="bg-blue-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold font-heading text-blue-900">
                      Total Cost
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold font-heading text-blue-900">
                      {formatCurrency(result.totalCost)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold font-heading text-blue-900">
                      100%
                    </td>
                    <td className="px-6 py-4 text-sm font-sans text-blue-700">
                      Complete cost of homeownership
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Amortization Section */}
      {activeSection === 'amortization' && result && (
        <div className="space-y-8">
          {/* Balance Over Time Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-xl font-semibold font-heading text-slate-900 mb-6 flex items-center">
              <LineChart className="h-5 w-5 mr-2 text-blue-600" />
              Remaining Balance Over Time
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={amortizationSchedule}>
                  <defs>
                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Remaining Balance']} />
                  <Area 
                    type="monotone" 
                    dataKey="balance" 
                    stroke="#3b82f6" 
                    fillOpacity={1} 
                    fill="url(#colorBalance)"
                    strokeWidth={3}
                    animationBegin={0}
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Amortization Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-xl font-semibold font-heading text-slate-900 mb-6">Amortization Schedule</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium font-sans text-slate-500 uppercase tracking-wider">
                      Year
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium font-sans text-slate-500 uppercase tracking-wider">
                      Principal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium font-sans text-slate-500 uppercase tracking-wider">
                      Interest
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium font-sans text-slate-500 uppercase tracking-wider">
                      Total Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium font-sans text-slate-500 uppercase tracking-wider">
                      Balance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium font-sans text-slate-500 uppercase tracking-wider">
                      Cumulative Interest
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {amortizationSchedule.map((year) => (
                    <tr key={year.year} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium font-heading text-slate-900">
                        {year.year}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-sans text-slate-900">
                        {formatCurrency(year.principalPayment)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-sans text-slate-900">
                        {formatCurrency(year.interestPayment)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-sans text-slate-900">
                        {formatCurrency(year.totalPayment)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-sans text-slate-900">
                        {formatCurrency(year.balance)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-sans text-slate-900">
                        {formatCurrency(year.cumulativeInterest)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Investment Analysis Section */}
      {activeSection === 'investment' && investmentResult && (
        <div className="space-y-8">
          {/* Investment Metrics Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl border border-emerald-200">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center mr-3">
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium font-sans text-emerald-700">Monthly Cash Flow</p>
                </div>
              </div>
              <div className="text-3xl font-bold font-heading text-emerald-900">
                {formatCurrency(investmentResult.monthlyCashFlow)}
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium font-sans text-blue-700">Cap Rate</p>
                </div>
              </div>
              <div className="text-3xl font-bold font-heading text-blue-900">
                {investmentResult.capRate.toFixed(2)}%
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium font-sans text-purple-700">ROI</p>
                </div>
              </div>
              <div className="text-3xl font-bold font-heading text-purple-900">
                {investmentResult.roi.toFixed(2)}%
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-xl border border-amber-200">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-amber-600 rounded-lg flex items-center justify-center mr-3">
                  <Home className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium font-sans text-amber-700">Break-even Rent</p>
                </div>
              </div>
              <div className="text-3xl font-bold font-heading text-amber-900">
                {formatCurrency(investmentResult.breakEvenRent)}
              </div>
            </div>
          </div>

          {/* Investment Analysis Details */}
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-xl font-semibold font-heading text-slate-900 mb-6">Investment Breakdown</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="font-sans text-slate-600">Monthly Rental Income</span>
                  <span className="font-semibold font-heading text-emerald-600">{formatCurrency(inputs.monthlyRent)}</span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="font-sans text-slate-600">Total Monthly Expenses</span>
                  <span className="font-semibold font-heading text-red-600">{formatCurrency(investmentResult.totalMonthlyExpenses)}</span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="font-sans text-slate-600">Net Operating Income (Annual)</span>
                  <span className="font-semibold font-heading text-slate-900">{formatCurrency(investmentResult.netOperatingIncome)}</span>
                </div>
                
                <div className="flex justify-between items-center py-3 bg-emerald-50 px-4 rounded-lg">
                  <span className="font-sans text-emerald-700 font-medium">Monthly Cash Flow</span>
                  <span className={`font-bold font-heading text-lg ${
                    investmentResult.monthlyCashFlow >= 0 ? 'text-emerald-900' : 'text-red-900'
                  }`}>
                    {formatCurrency(investmentResult.monthlyCashFlow)}
                  </span>
                </div>
              </div>
            </div>

            {/* Investment Warnings/Tips */}
            <div className="space-y-6">
              {(investmentResult.monthlyCashFlow < 0 || investmentResult.capRate < 6) && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div className="text-sm font-sans text-amber-800">
                      <p className="font-medium mb-1">Investment Considerations:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {investmentResult.monthlyCashFlow < 0 && (
                          <li>Negative cash flow - expenses exceed rental income</li>
                        )}
                        {investmentResult.capRate < 6 && (
                          <li>Low cap rate (under 6%) - consider if returns meet your goals</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h4 className="font-medium font-heading text-blue-900 mb-2 flex items-center">
                  <Info className="h-4 w-4 mr-2" />
                  Investment Tips
                </h4>
                <ul className="text-sm font-sans text-blue-800 space-y-1">
                  <li>• Consider vacancy rates (typically 5-10% of annual rent)</li>
                  <li>• Factor in potential rent increases over time</li>
                  <li>• Account for major repairs and capital improvements</li>
                  <li>• Research local rental market trends and regulations</li>
                  <li>• Consider property management costs if needed</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scenario Comparison Section */}
      {activeSection === 'comparison' && result && (
        <div className="space-y-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-xl font-semibold font-heading text-slate-900 mb-6 flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-blue-600" />
              Payment Frequency Comparison
            </h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h4 className="font-semibold font-heading text-blue-900 mb-4">Monthly Payments</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-sans text-blue-700">Payment Amount</span>
                    <span className="font-bold font-heading text-blue-900">{formatCurrency(result.monthlyPayment)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-sans text-blue-700">Total Interest</span>
                    <span className="font-bold font-heading text-blue-900">{formatCurrency(result.totalInterest)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-sans text-blue-700">Payoff Time</span>
                    <span className="font-bold font-heading text-blue-900">{inputs.amortizationYears} years</span>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50 p-6 rounded-lg">
                <h4 className="font-semibold font-heading text-emerald-900 mb-4">Bi-weekly Payments</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-sans text-emerald-700">Payment Amount</span>
                    <span className="font-bold font-heading text-emerald-900">{formatCurrency(result.monthlyPayment / 2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-sans text-emerald-700">Total Interest</span>
                    <span className="font-bold font-heading text-emerald-900">{formatCurrency(result.totalInterest * 0.85)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-sans text-emerald-700">Payoff Time</span>
                    <span className="font-bold font-heading text-emerald-900">~{Math.round(inputs.amortizationYears * 0.85)} years</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-slate-50 rounded-lg">
              <p className="text-sm font-sans text-slate-600">
                <strong>Bi-weekly advantage:</strong> By making 26 bi-weekly payments per year (equivalent to 13 monthly payments), 
                you can save approximately {formatCurrency(result.totalInterest * 0.15)} in interest and pay off your mortgage 
                {Math.round(inputs.amortizationYears * 0.15)} years earlier.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {saveError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
          <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <span className="font-sans">{saveError}</span>
        </div>
      )}

      {/* Success Message */}
      {calculationId && !saveError && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            <span className="font-sans">Calculation saved successfully! You can now share it with others.</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {user ? (
          <button
            onClick={handleSave}
            disabled={!result || isSaving || !canSaveCalculation()}
            className={`flex items-center justify-center px-8 py-3 rounded-lg font-semibold font-sans transition-colors shadow-lg ${
              (!result || isSaving || !canSaveCalculation())
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <Save className="h-5 w-5 mr-2" />
            {isSaving ? 'Saving...' : 'Save Calculation'}
          </button>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center max-w-md mx-auto">
            <Crown className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold font-heading text-blue-900 mb-2">Save Your Calculations</h3>
            <p className="text-sm font-sans text-blue-700 mb-4">
              Create a free account to save unlimited calculations and access them anywhere.
            </p>
            <button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium font-sans transition-colors"
            >
              Sign Up to Save
            </button>
          </div>
        )}
      </div>

      {/* Free User Save Limit Warning */}
      {user && user.tier === 'basic' && calculations.length >= 1 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center max-w-md mx-auto">
          <Crown className="h-8 w-8 text-amber-600 mx-auto mb-3" />
          <h3 className="font-semibold font-heading text-amber-900 mb-2">Save Limit Reached</h3>
          <p className="text-sm font-sans text-amber-700 mb-4">
            Free users can save 1 calculation. Upgrade to save unlimited calculations and unlock premium features.
          </p>
          <button
            onClick={() => window.location.href = '/pricing'}
            className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg font-medium font-sans transition-colors"
          >
            Upgrade Now
          </button>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && calculationId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold font-heading text-slate-900 mb-4">Share Calculation</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium font-sans text-slate-700 mb-2">
                  Shareable Link
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={`${window.location.origin}/shared/${calculationId}`}
                    readOnly
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-l-lg bg-slate-50 text-sm font-sans"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-r-lg transition-colors"
                  >
                    {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
                {copied && (
                  <p className="text-sm font-sans text-emerald-600 mt-1">Copied to clipboard!</p>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowShareModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-300 hover:bg-slate-400 text-slate-700 rounded-lg transition-colors font-sans"
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