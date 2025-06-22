import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Share2, Copy, CheckCircle, Crown, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { MortgageData } from '../pages/Calculator';
import { useAuth } from '../contexts/AuthContext';
import { useCalculations } from '../contexts/CalculationContext';
import NotesSection from './NotesSection';

interface MortgageResultsProps {
  data: MortgageData;
  onBack: () => void;
}

interface CalculationResult {
  monthlyPayment: number;
  totalInterest: number;
  totalCost: number;
  loanAmount: number;
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

const MortgageResults: React.FC<MortgageResultsProps> = ({ data, onBack }) => {
  const { user } = useAuth();
  const { saveCalculation } = useCalculations();
  
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [investmentResult, setInvestmentResult] = useState<InvestmentResult | null>(null);
  const [amortizationSchedule, setAmortizationSchedule] = useState<AmortizationData[]>([]);
  const [calculationId, setCalculationId] = useState<string>('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    calculateMortgage();
    if (data.enableInvestmentAnalysis) {
      calculateInvestment();
    }
    calculateAmortization();
  }, [data]);

  const calculateMortgage = () => {
    const loanAmount = data.homePrice - data.downPayment;
    const monthlyRate = data.interestRate / 100 / 12;
    const totalPayments = data.amortizationYears * 12;
    
    let monthlyPayment = 0;
    if (monthlyRate > 0) {
      monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
                      (Math.pow(1 + monthlyRate, totalPayments) - 1);
    } else {
      monthlyPayment = loanAmount / totalPayments;
    }
    
    const totalCost = monthlyPayment * totalPayments + data.downPayment;
    const totalInterest = totalCost - data.homePrice;
    
    if (data.paymentFrequency === 'bi-weekly') {
      monthlyPayment = monthlyPayment / 2;
    }
    
    setResult({
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
      totalInterest: Math.round(totalInterest * 100) / 100,
      totalCost: Math.round(totalCost * 100) / 100,
      loanAmount: Math.round(loanAmount * 100) / 100
    });
  };

  const calculateInvestment = () => {
    if (!data.monthlyRent || !data.monthlyExpenses) return;

    const loanAmount = data.homePrice - data.downPayment;
    const monthlyRate = data.interestRate / 100 / 12;
    const totalPayments = 25 * 12; // 25 year amortization
    
    // Calculate monthly mortgage payment
    let monthlyMortgage = 0;
    if (monthlyRate > 0) {
      monthlyMortgage = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
                      (Math.pow(1 + monthlyRate, totalPayments) - 1);
    } else {
      monthlyMortgage = loanAmount / totalPayments;
    }

    const totalExpenses = Object.values(data.monthlyExpenses).reduce((sum, expense) => sum + expense, 0);
    const totalMonthlyExpenses = totalExpenses + monthlyMortgage;
    const monthlyCashFlow = data.monthlyRent - totalMonthlyExpenses;
    const annualCashFlow = monthlyCashFlow * 12;
    
    // Net Operating Income (before mortgage payments)
    const netOperatingIncome = (data.monthlyRent - totalExpenses) * 12;
    
    // Cap Rate = Net Operating Income / Property Value
    const capRate = (netOperatingIncome / data.homePrice) * 100;
    
    // ROI = Annual Cash Flow / Down Payment
    const roi = (annualCashFlow / data.downPayment) * 100;
    
    // Break-even rent
    const breakEvenRent = totalMonthlyExpenses;

    setInvestmentResult({
      capRate: Math.round(capRate * 100) / 100,
      cashFlow: Math.round(monthlyCashFlow),
      roi: Math.round(roi * 100) / 100,
      breakEvenRent: Math.round(breakEvenRent),
      totalMonthlyExpenses: Math.round(totalMonthlyExpenses),
      netOperatingIncome: Math.round(netOperatingIncome)
    });
  };

  const calculateAmortization = () => {
    const loanAmount = data.homePrice - data.downPayment;
    const monthlyRate = data.interestRate / 100 / 12;
    const totalPayments = data.amortizationYears * 12;
    
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

    for (let year = 1; year <= data.amortizationYears; year++) {
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
        principalPayment: Math.round(yearlyPrincipal),
        interestPayment: Math.round(yearlyInterest),
        balance: Math.round(Math.max(0, remainingBalance)),
        totalPayment: Math.round(yearlyPrincipal + yearlyInterest),
        cumulativeInterest: Math.round(cumulativeInterest)
      });

      if (remainingBalance <= 0) break;
    }

    setAmortizationSchedule(yearlyData);
  };

  const handleSave = async () => {
    if (!result) {
      setSaveError('Please calculate a mortgage first');
      return;
    }
    
    setSaveError('');
    setIsSaving(true);
    
    try {
      const calculationData = {
        home_price: data.homePrice,
        down_payment: data.downPayment,
        interest_rate: data.interestRate,
        amortization_years: data.amortizationYears,
        payment_frequency: data.paymentFrequency,
        province: data.province,
        city: data.city,
        is_first_time_buyer: data.isFirstTimeBuyer,
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

    await handleSave();
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

  if (!result) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-slate-600">Calculating results...</p>
      </div>
    );
  }

  const isNegativeCashFlow = investmentResult && investmentResult.cashFlow < 0;
  const isLowCapRate = investmentResult && investmentResult.capRate < 6;

  return (
    <div className="p-8 space-y-8">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Form</span>
        </button>
        <h2 className="text-2xl font-bold text-slate-900">Calculation Results</h2>
        <div className="w-24"></div> {/* Spacer for centering */}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Mortgage Results */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-slate-900">Mortgage Summary</h3>
          
          <div className="bg-blue-50 p-6 rounded-lg">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                ${result.monthlyPayment.toLocaleString()}
              </div>
              <div className="text-sm text-blue-700">
                {data.paymentFrequency === 'monthly' ? 'Monthly' : 'Bi-weekly'} Payment
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-lg">
              <div className="text-lg font-semibold text-slate-900">
                ${result.loanAmount.toLocaleString()}
              </div>
              <div className="text-sm text-slate-600">Loan Amount</div>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg">
              <div className="text-lg font-semibold text-slate-900">
                ${result.totalInterest.toLocaleString()}
              </div>
              <div className="text-sm text-slate-600">Total Interest</div>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg">
            <div className="text-lg font-semibold text-slate-900">
              ${result.totalCost.toLocaleString()}
            </div>
            <div className="text-sm text-slate-600">Total Cost of Home</div>
          </div>
        </div>

        {/* Investment Analysis Results */}
        {data.enableInvestmentAnalysis && investmentResult && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-slate-900 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-emerald-600" />
              Investment Analysis
            </h3>

            {/* Warnings */}
            {(isNegativeCashFlow || isLowCapRate) && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium mb-1">Investment Warnings:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {isNegativeCashFlow && (
                        <li>Negative cash flow - property expenses exceed rental income</li>
                      )}
                      {isLowCapRate && (
                        <li>Low cap rate (under 6%) - property may not generate adequate returns</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${investmentResult.cashFlow >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="flex items-center mb-2">
                  <DollarSign className={`h-5 w-5 mr-2 ${investmentResult.cashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                  <span className="text-sm font-medium text-slate-700">Monthly Cash Flow</span>
                </div>
                <div className={`text-2xl font-bold ${investmentResult.cashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${investmentResult.cashFlow.toLocaleString()}
                </div>
              </div>

              <div className={`p-4 rounded-lg ${investmentResult.capRate >= 6 ? 'bg-green-50' : 'bg-yellow-50'}`}>
                <div className="flex items-center mb-2">
                  <TrendingUp className={`h-5 w-5 mr-2 ${investmentResult.capRate >= 6 ? 'text-green-600' : 'text-yellow-600'}`} />
                  <span className="text-sm font-medium text-slate-700">Cap Rate</span>
                </div>
                <div className={`text-2xl font-bold ${investmentResult.capRate >= 6 ? 'text-green-600' : 'text-yellow-600'}`}>
                  {investmentResult.capRate}%
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-blue-700 mb-2">Return on Investment (ROI)</div>
              <div className="text-2xl font-bold text-blue-600">
                {investmentResult.roi}%
              </div>
              <div className="text-sm text-blue-600 mt-1">
                Annual cash flow: ${(investmentResult.cashFlow * 12).toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Amortization Chart */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-slate-900">Payment Schedule</h3>
        
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <h4 className="text-lg font-medium text-slate-900 mb-4">Principal vs Interest Over Time</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={amortizationSchedule.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value, name) => [
                `$${Number(value).toLocaleString()}`, 
                name === 'principalPayment' ? 'Principal' : 'Interest'
              ]} />
              <Legend />
              <Bar dataKey="principalPayment" stackId="a" fill="#10B981" name="Principal" />
              <Bar dataKey="interestPayment" stackId="a" fill="#EF4444" name="Interest" />
            </BarChart>
          </ResponsiveContainer>
        </div>
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
      <div className="flex gap-3 pt-4">
        <button
          onClick={handleSave}
          disabled={!result || isSaving}
          className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-colors ${
            (!result || isSaving)
              ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : user ? 'Save Calculation' : 'Save & Share'}
        </button>
        
        <button
          onClick={handleShare}
          disabled={!result || isSaving}
          className={`flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-colors ${
            (!result || isSaving)
              ? 'bg-slate-100 border border-slate-300 text-slate-400 cursor-not-allowed'
              : 'bg-white border border-slate-300 hover:bg-slate-50 text-slate-700'
          }`}
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </button>
      </div>

      {/* Notes Section for Premium Users */}
      {user?.tier === 'premium' && calculationId && (
        <NotesSection calculationId={calculationId} section="mortgage" />
      )}

      {/* Share Modal */}
      {showShareModal && calculationId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Share Calculation</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Shareable Link
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={`${window.location.origin}/shared/${calculationId}`}
                    readOnly
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-l-lg bg-slate-50 text-sm"
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
                  className="flex-1 px-4 py-2 bg-slate-300 hover:bg-slate-400 text-slate-700 rounded-lg transition-colors"
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

export default MortgageResults;