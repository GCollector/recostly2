import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Share2, Copy, CheckCircle, Crown, AlertTriangle, Calculator, Home, BarChart3, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { useCalculations } from '../contexts/CalculationContext';
import { MortgageData } from '../pages/Calculator';
import NotesSection from './NotesSection';

interface MortgageResultsProps {
  data: MortgageData;
  onBack: () => void;
}

const MortgageResults: React.FC<MortgageResultsProps> = ({ data, onBack }) => {
  const { user } = useAuth();
  const { saveCalculation } = useCalculations();
  
  const [activeTab, setActiveTab] = useState<'mortgage' | 'closing' | 'amortization' | 'investment'>('mortgage');
  const [calculationId, setCalculationId] = useState<string>('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Calculate mortgage values
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
  const downPaymentPercent = Math.round((data.downPayment / data.homePrice) * 100);

  // Calculate closing costs
  const calculateClosingCosts = () => {
    let landTransferTax = 0;
    let additionalTax = 0;
    
    if (data.province === 'ontario') {
      // Ontario Land Transfer Tax
      if (data.homePrice <= 55000) {
        landTransferTax = data.homePrice * 0.005;
      } else if (data.homePrice <= 250000) {
        landTransferTax = 275 + (data.homePrice - 55000) * 0.01;
      } else if (data.homePrice <= 400000) {
        landTransferTax = 2225 + (data.homePrice - 250000) * 0.015;
      } else if (data.homePrice <= 2000000) {
        landTransferTax = 4475 + (data.homePrice - 400000) * 0.02;
      } else {
        landTransferTax = 36475 + (data.homePrice - 2000000) * 0.025;
      }
      
      // Toronto Municipal Land Transfer Tax
      if (data.city === 'toronto') {
        if (data.homePrice <= 55000) {
          additionalTax = data.homePrice * 0.005;
        } else if (data.homePrice <= 400000) {
          additionalTax = 275 + (data.homePrice - 55000) * 0.01;
        } else if (data.homePrice <= 2000000) {
          additionalTax = 3725 + (data.homePrice - 400000) * 0.02;
        } else {
          additionalTax = 35725 + (data.homePrice - 2000000) * 0.025;
        }
      }
    } else {
      // BC Property Transfer Tax
      if (data.homePrice <= 200000) {
        landTransferTax = data.homePrice * 0.01;
      } else if (data.homePrice <= 2000000) {
        landTransferTax = 2000 + (data.homePrice - 200000) * 0.02;
      } else if (data.homePrice <= 3000000) {
        landTransferTax = 38000 + (data.homePrice - 2000000) * 0.03;
      } else {
        landTransferTax = 68000 + (data.homePrice - 3000000) * 0.05;
      }
    }
    
    const legalFees = Math.round(data.homePrice * 0.001) + 1500;
    const titleInsurance = Math.min(Math.max(data.homePrice * 0.0005, 250), 1500);
    const homeInspection = 500;
    const appraisal = 400;
    const surveyFee = 1000;
    
    let firstTimeBuyerRebate = 0;
    if (data.isFirstTimeBuyer) {
      if (data.province === 'ontario' && data.homePrice <= 368000) {
        firstTimeBuyerRebate = Math.min(landTransferTax, 4000);
      } else if (data.province === 'bc' && data.homePrice <= 500000) {
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

  // Calculate amortization schedule
  const calculateAmortizationSchedule = () => {
    const schedule = [];
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

      schedule.push({
        year: `Year ${year}`,
        principal: Math.round(yearlyPrincipal),
        interest: Math.round(yearlyInterest),
        balance: Math.round(Math.max(0, remainingBalance)),
        totalPayment: Math.round(yearlyPrincipal + yearlyInterest),
        cumulativeInterest: Math.round(cumulativeInterest)
      });

      if (remainingBalance <= 0) break;
    }

    return schedule;
  };

  // Calculate investment metrics
  const calculateInvestmentMetrics = () => {
    if (!data.enableInvestmentAnalysis || !data.monthlyRent || !data.monthlyExpenses) {
      return null;
    }

    const totalExpenses = Object.values(data.monthlyExpenses).reduce((sum, expense) => sum + expense, 0);
    const totalMonthlyExpenses = totalExpenses + monthlyPayment;
    const monthlyCashFlow = data.monthlyRent - totalMonthlyExpenses;
    const annualCashFlow = monthlyCashFlow * 12;
    
    const netOperatingIncome = (data.monthlyRent - totalExpenses) * 12;
    const capRate = (netOperatingIncome / data.homePrice) * 100;
    const roi = (annualCashFlow / data.downPayment) * 100;
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

  const closingCosts = calculateClosingCosts();
  const amortizationSchedule = calculateAmortizationSchedule();
  const investmentMetrics = calculateInvestmentMetrics();

  // Chart data
  const pieChartData = [
    { name: 'Down Payment', value: data.downPayment, color: '#10B981' },
    { name: 'Principal', value: loanAmount, color: '#3B82F6' },
    { name: 'Interest', value: totalInterest, color: '#EF4444' }
  ];

  const interestVsPrincipalData = [
    { 
      name: 'Interest vs Principal',
      interest: totalInterest, 
      principal: loanAmount 
    }
  ];

  const interestPercentage = Math.round((totalInterest / (totalInterest + loanAmount)) * 100);

  const handleSave = async () => {
    if (!monthlyPayment) {
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
        monthly_payment: monthlyPayment,
        total_interest: totalInterest,
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
    if (!monthlyPayment) {
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

  // Determine which tabs to show
  const tabs = [
    { id: 'mortgage', name: 'Mortgage Summary', shortName: 'Summary', icon: Calculator },
    { id: 'closing', name: 'Closing Costs', shortName: 'Closing', icon: Home },
    { id: 'amortization', name: 'Amortization', shortName: 'Schedule', icon: BarChart3 },
    ...(data.enableInvestmentAnalysis ? [{ id: 'investment', name: 'Investment Analysis', shortName: 'Investment', icon: TrendingUp }] : [])
  ] as const;

  const gridCols = data.enableInvestmentAnalysis ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3';

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="font-sans">Back</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900">Results</h1>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-slate-50 rounded-xl p-2">
        <nav className={`grid gap-1 ${gridCols}`} aria-label="Results tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-lg text-center transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
                aria-label={`Switch to ${tab.name}`}
              >
                <Icon className="h-5 w-5 sm:h-6 sm:w-6 mb-1 sm:mb-2" />
                <span className="text-xs sm:text-sm font-medium font-sans hidden sm:block">{tab.name}</span>
                <span className="text-xs font-medium font-sans sm:hidden">{tab.shortName}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[500px]">
        {activeTab === 'mortgage' && (
          <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-900">Mortgage Summary</h2>
            
            {/* Main Payment Display */}
            <div className="bg-blue-50 p-6 rounded-xl">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold font-heading text-blue-600 mb-2">
                  ${Math.round(monthlyPayment).toLocaleString()}
                </div>
                <div className="text-sm sm:text-base font-sans text-blue-700">
                  {data.paymentFrequency === 'monthly' ? 'Monthly' : 'Bi-weekly'} Payment
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
              {/* Total Cost Breakdown Pie Chart */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold font-heading text-slate-900">Total Cost Breakdown</h3>
                <div className="h-64 sm:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Interest vs Principal Bar Chart */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold font-heading text-slate-900">Interest vs Principal</h3>
                <div className="h-64 sm:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={interestVsPrincipalData} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                      <YAxis type="category" dataKey="name" hide />
                      <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                      <Bar dataKey="principal" stackId="a" fill="#3B82F6" name="Principal" />
                      <Bar dataKey="interest" stackId="a" fill="#EF4444" name="Interest" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-sm font-sans text-slate-600 text-center">
                  Interest represents <span className="font-semibold text-red-600">{interestPercentage}%</span> of your total payments
                </p>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="text-lg sm:text-xl font-bold font-heading text-slate-900">
                  ${loanAmount.toLocaleString()}
                </div>
                <div className="text-sm font-sans text-slate-600">Loan Amount</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="text-lg sm:text-xl font-bold font-heading text-slate-900">
                  ${Math.round(totalInterest).toLocaleString()}
                </div>
                <div className="text-sm font-sans text-slate-600">Total Interest</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="text-lg sm:text-xl font-bold font-heading text-slate-900">
                  ${data.downPayment.toLocaleString()}
                </div>
                <div className="text-sm font-sans text-slate-600">{downPaymentPercent}% Down</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="text-lg sm:text-xl font-bold font-heading text-slate-900">
                  ${Math.round(totalCost).toLocaleString()}
                </div>
                <div className="text-sm font-sans text-slate-600">Total Cost</div>
              </div>
            </div>

            {/* Property Summary */}
            <div className="bg-slate-50 p-4 sm:p-6 rounded-lg">
              <h3 className="text-lg font-semibold font-heading text-slate-900 mb-4">Property Summary</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm font-sans">
                <div>
                  <span className="text-slate-600">Purchase Price:</span>
                  <div className="font-semibold text-slate-900">${data.homePrice.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-slate-600">Interest Rate:</span>
                  <div className="font-semibold text-slate-900">{data.interestRate}%</div>
                </div>
                <div>
                  <span className="text-slate-600">Amortization:</span>
                  <div className="font-semibold text-slate-900">{data.amortizationYears} years</div>
                </div>
                <div>
                  <span className="text-slate-600">Location:</span>
                  <div className="font-semibold text-slate-900">
                    {data.city === 'toronto' ? 'Toronto, ON' : 'Vancouver, BC'}
                  </div>
                </div>
              </div>
              {data.isFirstTimeBuyer && (
                <div className="mt-4 bg-green-50 p-3 rounded-lg">
                  <span className="font-medium font-sans text-green-800">✓ First-time homebuyer benefits applied</span>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'closing' && (
          <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-900">Closing Costs</h2>
            
            <div className="bg-emerald-50 p-6 rounded-xl">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold font-heading text-emerald-600 mb-2">
                  ${closingCosts.total.toLocaleString()}
                </div>
                <div className="text-sm sm:text-base font-sans text-emerald-700">
                  Total Estimated Closing Costs
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-slate-200">
                <span className="font-sans text-slate-700">
                  {data.province === 'ontario' ? 'Ontario Land Transfer Tax' : 'BC Property Transfer Tax'}
                </span>
                <span className="font-semibold font-heading text-slate-900">
                  ${closingCosts.landTransferTax.toLocaleString()}
                </span>
              </div>

              {data.city === 'toronto' && (
                <div className="flex justify-between items-center py-3 border-b border-slate-200">
                  <span className="font-sans text-slate-700">Toronto Municipal Land Transfer Tax</span>
                  <span className="font-semibold font-heading text-slate-900">
                    ${closingCosts.additionalTax.toLocaleString()}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center py-3 border-b border-slate-200">
                <span className="font-sans text-slate-700">Legal Fees & Disbursements</span>
                <span className="font-semibold font-heading text-slate-900">
                  ${closingCosts.legalFees.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center py-3 border-b border-slate-200">
                <span className="font-sans text-slate-700">Title Insurance</span>
                <span className="font-semibold font-heading text-slate-900">
                  ${closingCosts.titleInsurance.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center py-3 border-b border-slate-200">
                <span className="font-sans text-slate-700">Home Inspection</span>
                <span className="font-semibold font-heading text-slate-900">
                  ${closingCosts.homeInspection.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center py-3 border-b border-slate-200">
                <span className="font-sans text-slate-700">Property Appraisal</span>
                <span className="font-semibold font-heading text-slate-900">
                  ${closingCosts.appraisal.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center py-3 border-b border-slate-200">
                <span className="font-sans text-slate-700">Survey Fee</span>
                <span className="font-semibold font-heading text-slate-900">
                  ${closingCosts.surveyFee.toLocaleString()}
                </span>
              </div>

              {closingCosts.firstTimeBuyerRebate > 0 && (
                <div className="flex justify-between items-center py-3 border-b border-slate-200">
                  <span className="font-sans text-green-700">First-Time Buyer Rebate</span>
                  <span className="font-semibold font-heading text-green-600">
                    -${closingCosts.firstTimeBuyerRebate.toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            <div className="bg-slate-50 p-4 sm:p-6 rounded-lg">
              <div className="text-sm font-sans text-slate-600">
                <p className="mb-2">
                  <strong>Cash required at closing:</strong> Down payment + closing costs = 
                  <span className="font-semibold text-slate-900">
                    {' '}${(data.downPayment + closingCosts.total).toLocaleString()}
                  </span>
                </p>
                <p>
                  <strong>Additional costs to consider:</strong> Moving expenses, utility connections, 
                  property taxes (prorated), condo fees (if applicable), home insurance, 
                  and immediate repairs or improvements.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'amortization' && (
          <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-900">Amortization Schedule</h2>
            
            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-blue-50 p-4 sm:p-6 rounded-lg">
                <div className="text-2xl sm:text-3xl font-bold font-heading text-blue-600">
                  ${loanAmount.toLocaleString()}
                </div>
                <div className="text-sm font-sans text-blue-700">Total Principal</div>
              </div>
              
              <div className="bg-red-50 p-4 sm:p-6 rounded-lg">
                <div className="text-2xl sm:text-3xl font-bold font-heading text-red-600">
                  ${Math.round(totalInterest).toLocaleString()}
                </div>
                <div className="text-sm font-sans text-red-700">Total Interest</div>
              </div>
            </div>

            {/* Principal vs Interest Over Time */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold font-heading text-slate-900">Principal vs Interest Over Time</h3>
              <div className="h-64 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={amortizationSchedule}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                    <Legend />
                    <Bar dataKey="principal" stackId="a" fill="#10B981" name="Principal" />
                    <Bar dataKey="interest" stackId="a" fill="#EF4444" name="Interest" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Remaining Balance Over Time */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold font-heading text-slate-900">Remaining Balance</h3>
              <div className="h-64 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={amortizationSchedule}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                    <Line 
                      type="monotone" 
                      dataKey="balance" 
                      stroke="#3B82F6" 
                      strokeWidth={3}
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'investment' && investmentMetrics && (
          <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-900">Investment Analysis</h2>
            
            {/* Investment Warnings */}
            {(investmentMetrics.monthlyCashFlow < 0 || investmentMetrics.capRate < 6) && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="text-sm font-sans text-amber-800">
                    <p className="font-medium mb-1">Investment Warnings:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {investmentMetrics.monthlyCashFlow < 0 && (
                        <li>Negative cash flow - property expenses exceed rental income</li>
                      )}
                      {investmentMetrics.capRate < 6 && (
                        <li>Low cap rate (under 6%) - property may not generate adequate returns</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Key Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className={`p-4 sm:p-6 rounded-lg ${investmentMetrics.monthlyCashFlow >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="text-2xl sm:text-3xl font-bold font-heading">
                  <span className={investmentMetrics.monthlyCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}>
                    ${investmentMetrics.monthlyCashFlow.toLocaleString()}
                  </span>
                </div>
                <div className="text-sm font-sans text-slate-600">Monthly Cash Flow</div>
              </div>

              <div className={`p-4 sm:p-6 rounded-lg ${investmentMetrics.capRate >= 6 ? 'bg-green-50' : 'bg-yellow-50'}`}>
                <div className="text-2xl sm:text-3xl font-bold font-heading">
                  <span className={investmentMetrics.capRate >= 6 ? 'text-green-600' : 'text-yellow-600'}>
                    {investmentMetrics.capRate}%
                  </span>
                </div>
                <div className="text-sm font-sans text-slate-600">Cap Rate</div>
              </div>

              <div className="bg-blue-50 p-4 sm:p-6 rounded-lg">
                <div className="text-2xl sm:text-3xl font-bold font-heading text-blue-600">
                  {investmentMetrics.roi}%
                </div>
                <div className="text-sm font-sans text-slate-600">ROI</div>
              </div>
            </div>

            {/* Financial Breakdown */}
            <div className="bg-slate-50 p-4 sm:p-6 rounded-lg space-y-3">
              <h3 className="font-medium font-heading text-slate-900">Financial Breakdown</h3>
              
              <div className="flex justify-between text-sm font-sans">
                <span className="text-slate-600">Monthly Rental Income</span>
                <span className="font-medium text-slate-900">
                  ${data.monthlyRent?.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between text-sm font-sans">
                <span className="text-slate-600">Total Monthly Expenses</span>
                <span className="font-medium text-slate-900">
                  ${investmentMetrics.totalMonthlyExpenses.toLocaleString()}
                </span>
              </div>

              <div className="border-t border-slate-300 pt-2">
                <div className="flex justify-between text-sm font-sans">
                  <span className="text-slate-600">Net Operating Income (Annual)</span>
                  <span className="font-medium text-slate-900">
                    ${investmentMetrics.netOperatingIncome.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex justify-between text-sm font-sans">
                <span className="text-slate-600">Break-even Rent</span>
                <span className="font-medium text-slate-900">
                  ${investmentMetrics.breakEvenRent.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Investment Tips */}
            <div className="bg-blue-50 p-4 sm:p-6 rounded-lg">
              <h3 className="font-medium font-heading text-blue-900 mb-2">Investment Tips</h3>
              <ul className="text-sm font-sans text-blue-800 space-y-1">
                <li>• Consider vacancy rates (typically 5-10% of annual rent)</li>
                <li>• Factor in potential rent increases over time</li>
                <li>• Account for major repairs and capital improvements</li>
                <li>• Research local rental market trends and regulations</li>
                <li>• Consider property management costs if needed</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        {/* Error Display */}
        {saveError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start mb-4">
            <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <span className="font-sans">{saveError}</span>
          </div>
        )}

        {/* Success Message */}
        {calculationId && !saveError && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span className="font-sans">Calculation saved successfully! You can now share it with others.</span>
            </div>
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={!monthlyPayment || isSaving}
          className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg font-medium font-sans transition-colors ${
            (!monthlyPayment || isSaving)
              ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : user ? 'Save Calculation' : 'Save & Share'}
        </button>
        
        <button
          onClick={handleShare}
          disabled={!monthlyPayment || isSaving}
          className={`flex items-center justify-center px-4 py-3 rounded-lg font-medium font-sans transition-colors ${
            (!monthlyPayment || isSaving)
              ? 'bg-slate-100 border border-slate-300 text-slate-400 cursor-not-allowed'
              : 'bg-white border border-slate-300 hover:bg-slate-50 text-slate-700'
          }`}
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </button>
      </div>
      
      {!user && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium font-heading text-blue-800 mb-2">Want to save more calculations?</h4>
          <p className="text-sm font-sans text-blue-700 mb-3">
            Create a free account to save unlimited calculations and access them from anywhere.
          </p>
          <button
            onClick={() => window.location.href = '/signup'}
            className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition-colors font-sans"
          >
            Sign Up Free
          </button>
        </div>
      )}

      {/* Notes Section for Premium Users */}
      {user?.tier === 'premium' && calculationId && (
        <NotesSection calculationId={calculationId} section="mortgage" />
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
                  <p className="text-sm font-sans text-green-600 mt-1">Copied to clipboard!</p>
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

export default MortgageResults;