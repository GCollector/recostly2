import React, { useState } from 'react';
import { ArrowLeft, Calculator, Home, BarChart3, TrendingUp, Save, Share2, Copy, CheckCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { useCalculations } from '../contexts/CalculationContext';

export interface MortgageData {
  homePrice: number;
  downPayment: number;
  interestRate: number;
  amortizationYears: number;
  paymentFrequency: 'monthly' | 'bi-weekly';
  province: 'ontario' | 'bc';
  city: 'toronto' | 'vancouver';
  isFirstTimeBuyer: boolean;
  enableInvestmentAnalysis: boolean;
  monthlyRent?: number;
  monthlyExpenses?: {
    taxes: number;
    insurance: number;
    condoFees: number;
    maintenance: number;
    other: number;
  };
}

interface MortgageResultsProps {
  data: MortgageData;
  onBack: () => void;
}

const MortgageResults: React.FC<MortgageResultsProps> = ({ data, onBack }) => {
  const { user } = useAuth();
  const { saveCalculation } = useCalculations();
  const [activeTab, setActiveTab] = useState<'mortgage' | 'closing' | 'amortization' | 'investment'>('mortgage');
  const [showShareModal, setShowShareModal] = useState(false);
  const [calculationId, setCalculationId] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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

    // First-time buyer rebate
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

  const closingCosts = calculateClosingCosts();

  // Generate amortization schedule
  const generateAmortizationSchedule = () => {
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

  const amortizationSchedule = generateAmortizationSchedule();

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

  const investmentMetrics = calculateInvestmentMetrics();

  // FIXED: Chart data with correct percentages
  const totalValue = data.downPayment + loanAmount + totalInterest;
  const pieChartData = [
    { 
      name: 'Down Payment', 
      value: data.downPayment, 
      color: '#10B981'
    },
    { 
      name: 'Principal', 
      value: loanAmount, 
      color: '#3B82F6'
    },
    { 
      name: 'Interest', 
      value: totalInterest, 
      color: '#EF4444'
    }
  ];

  const interestVsPrincipalData = [
    { 
      name: 'Interest vs Principal',
      interest: totalInterest, 
      principal: loanAmount 
    }
  ];

  const amortizationChartData = amortizationSchedule.map(year => ({
    year: `Year ${year.year}`,
    principal: year.principal,
    interest: year.interest,
    balance: year.balance
  }));

  const balanceChartData = amortizationSchedule.map(year => ({
    year: year.year,
    balance: year.balance
  }));

  // FIXED: Custom label function for pie chart - correct percentage calculation
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="600"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const handleSave = async () => {
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
      setShowShareModal(true);
    } catch (error) {
      console.error('Error saving calculation:', error);
      alert('Failed to save calculation. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
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

  const tabs = [
    { 
      id: 'mortgage', 
      name: 'Mortgage Summary', 
      description: 'Payment details and breakdown',
      icon: Calculator 
    },
    { 
      id: 'closing', 
      name: 'Closing Costs', 
      description: 'Fees and closing expenses',
      icon: Home 
    },
    { 
      id: 'amortization', 
      name: 'Amortization', 
      description: 'Payment schedule and charts',
      icon: BarChart3 
    },
    ...(data.enableInvestmentAnalysis ? [{ 
      id: 'investment', 
      name: 'Investment Analysis', 
      description: 'ROI and cash flow metrics',
      icon: TrendingUp 
    }] : [])
  ] as const;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'mortgage':
        return (
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-blue-50 p-6 rounded-xl">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    ${Math.round(monthlyPayment).toLocaleString()}
                  </div>
                  <div className="text-sm text-blue-700">
                    {data.paymentFrequency === 'monthly' ? 'Monthly' : 'Bi-weekly'} Payment
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-xl">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900 mb-2">
                    ${loanAmount.toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-600">Loan Amount</div>
                  <div className="text-xs text-slate-500 mt-1">
                    {100 - downPaymentPercent}% of home price
                  </div>
                </div>
              </div>

              <div className="bg-red-50 p-6 rounded-xl">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600 mb-2">
                    ${Math.round(totalInterest).toLocaleString()}
                  </div>
                  <div className="text-sm text-red-700">Total Interest</div>
                  <div className="text-xs text-red-500 mt-1">Over {data.amortizationYears} years</div>
                </div>
              </div>

              <div className="bg-emerald-50 p-6 rounded-xl">
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600 mb-2">
                    ${Math.round(totalCost).toLocaleString()}
                  </div>
                  <div className="text-sm text-emerald-700">Total Cost</div>
                  <div className="text-xs text-emerald-500 mt-1">Including all interest</div>
                </div>
              </div>
            </div>

            {/* Property Summary */}
            <div className="bg-white p-6 rounded-xl border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Property Summary</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-slate-600">Purchase Price:</span>
                  <div className="font-semibold text-slate-900">${data.homePrice.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-slate-600">Down Payment:</span>
                  <div className="font-semibold text-slate-900">${data.downPayment.toLocaleString()} ({downPaymentPercent}% down)</div>
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
                <div>
                  <span className="text-slate-600">Payment Frequency:</span>
                  <div className="font-semibold text-slate-900 capitalize">{data.paymentFrequency}</div>
                </div>
                {data.isFirstTimeBuyer && (
                  <div className="md:col-span-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ✓ First-time homebuyer benefits applied
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Total Cost Breakdown */}
              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Total Cost Breakdown</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Legend below chart */}
                <div className="flex justify-center items-center space-x-6 mt-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    <span className="text-sm text-slate-600">Down Payment</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-slate-600">Principal</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-slate-600">Interest</span>
                  </div>
                </div>
              </div>

              {/* Interest vs Principal */}
              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Interest vs Principal</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={interestVsPrincipalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value, name) => [
                      `$${Number(value).toLocaleString()}`, 
                      name === 'interest' ? 'Total Interest' : 'Principal Amount'
                    ]} />
                    <Bar dataKey="principal" fill="#3B82F6" name="Principal" />
                    <Bar dataKey="interest" fill="#EF4444" name="Interest" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );

      case 'closing':
        return (
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-emerald-50 p-6 rounded-xl">
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600 mb-2">
                    ${closingCosts.total.toLocaleString()}
                  </div>
                  <div className="text-sm text-emerald-700">Total Estimated Closing Costs</div>
                  <div className="text-xs text-emerald-600 mt-1">Fees and expenses at closing</div>
                </div>
              </div>

              <div className="bg-blue-50 p-6 rounded-xl">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    ${(data.downPayment + closingCosts.total).toLocaleString()}
                  </div>
                  <div className="text-sm text-blue-700">Cash Required at Closing</div>
                  <div className="text-xs text-blue-600 mt-1">Down payment + closing costs</div>
                </div>
              </div>
            </div>

            {/* Closing Cost Breakdown */}
            <div className="bg-white p-6 rounded-xl border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Closing Cost Breakdown</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-slate-200">
                  <span className="text-slate-700">
                    {data.province === 'ontario' ? 'Ontario Land Transfer Tax' : 'BC Property Transfer Tax'}
                  </span>
                  <span className="font-semibold text-slate-900">
                    ${closingCosts.landTransferTax.toLocaleString()}
                  </span>
                </div>

                {data.city === 'toronto' && (
                  <div className="flex justify-between items-center py-3 border-b border-slate-200">
                    <span className="text-slate-700">Toronto Municipal Land Transfer Tax</span>
                    <span className="font-semibold text-slate-900">
                      ${closingCosts.additionalTax.toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center py-3 border-b border-slate-200">
                  <span className="text-slate-700">Legal Fees & Disbursements</span>
                  <span className="font-semibold text-slate-900">
                    ${closingCosts.legalFees.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-slate-200">
                  <span className="text-slate-700">Title Insurance</span>
                  <span className="font-semibold text-slate-900">
                    ${closingCosts.titleInsurance.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-slate-200">
                  <span className="text-slate-700">Home Inspection</span>
                  <span className="font-semibold text-slate-900">
                    ${closingCosts.homeInspection.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-slate-200">
                  <span className="text-slate-700">Property Appraisal</span>
                  <span className="font-semibold text-slate-900">
                    ${closingCosts.appraisal.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-slate-200">
                  <span className="text-slate-700">Survey Fee</span>
                  <span className="font-semibold text-slate-900">
                    ${closingCosts.surveyFee.toLocaleString()}
                  </span>
                </div>

                {closingCosts.firstTimeBuyerRebate > 0 && (
                  <div className="flex justify-between items-center py-3 border-b border-slate-200">
                    <span className="text-green-700">First-Time Buyer Rebate</span>
                    <span className="font-semibold text-green-600">
                      -${closingCosts.firstTimeBuyerRebate.toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center py-4 bg-slate-50 px-4 rounded-lg">
                  <span className="font-semibold text-slate-900">Total Closing Costs</span>
                  <span className="text-xl font-bold text-slate-900">
                    ${closingCosts.total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'amortization':
        return (
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-6 rounded-xl">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    ${loanAmount.toLocaleString()}
                  </div>
                  <div className="text-sm text-blue-700">Total Principal</div>
                  <div className="text-xs text-blue-600 mt-1">Amount borrowed</div>
                </div>
              </div>

              <div className="bg-red-50 p-6 rounded-xl">
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600 mb-2">
                    ${Math.round(totalInterest).toLocaleString()}
                  </div>
                  <div className="text-sm text-red-700">Total Interest</div>
                  <div className="text-xs text-red-600 mt-1">Over {data.amortizationYears} years</div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Principal vs Interest Over Time */}
              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Principal vs Interest Over Time</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={amortizationChartData.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value, name) => [
                      `$${Number(value).toLocaleString()}`, 
                      name === 'principal' ? 'Principal' : 'Interest'
                    ]} />
                    <Legend />
                    <Bar dataKey="principal" stackId="a" fill="#10B981" name="Principal" />
                    <Bar dataKey="interest" stackId="a" fill="#EF4444" name="Interest" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Remaining Balance */}
              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Remaining Balance</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={balanceChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Remaining Balance']} />
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
        );

      case 'investment':
        if (!investmentMetrics) return null;
        
        return (
          <div className="space-y-8">
            {/* Investment Summary Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className={`p-6 rounded-xl ${investmentMetrics.monthlyCashFlow >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="text-center">
                  <div className={`text-3xl font-bold mb-2 ${investmentMetrics.monthlyCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${investmentMetrics.monthlyCashFlow.toLocaleString()}
                  </div>
                  <div className={`text-sm ${investmentMetrics.monthlyCashFlow >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    Monthly Cash Flow
                  </div>
                </div>
              </div>

              <div className={`p-6 rounded-xl ${investmentMetrics.capRate >= 6 ? 'bg-green-50' : 'bg-yellow-50'}`}>
                <div className="text-center">
                  <div className={`text-3xl font-bold mb-2 ${investmentMetrics.capRate >= 6 ? 'text-green-600' : 'text-yellow-600'}`}>
                    {investmentMetrics.capRate}%
                  </div>
                  <div className={`text-sm ${investmentMetrics.capRate >= 6 ? 'text-green-700' : 'text-yellow-700'}`}>
                    Cap Rate
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-6 rounded-xl">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {investmentMetrics.roi}%
                  </div>
                  <div className="text-sm text-blue-700">ROI</div>
                  <div className="text-xs text-blue-600 mt-1">
                    Annual: ${(investmentMetrics.monthlyCashFlow * 12).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Investment Analysis */}
            <div className="bg-white p-6 rounded-xl border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Financial Breakdown</h3>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Monthly Rental Income</span>
                  <span className="font-medium text-slate-900">
                    ${data.monthlyRent?.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Total Monthly Expenses</span>
                  <span className="font-medium text-slate-900">
                    ${investmentMetrics.totalMonthlyExpenses.toLocaleString()}
                  </span>
                </div>

                <div className="border-t border-slate-200 pt-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Net Operating Income (Annual)</span>
                    <span className="font-medium text-slate-900">
                      ${investmentMetrics.netOperatingIncome.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Break-even Rent</span>
                  <span className="font-medium text-slate-900">
                    ${investmentMetrics.breakEvenRent.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Investment Warnings */}
            {(investmentMetrics.monthlyCashFlow < 0 || investmentMetrics.capRate < 6) && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg">
                <h4 className="font-medium mb-2">Investment Warnings:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {investmentMetrics.monthlyCashFlow < 0 && (
                    <li>Negative cash flow - property expenses exceed rental income</li>
                  )}
                  {investmentMetrics.capRate < 6 && (
                    <li>Low cap rate (under 6%) - property may not generate adequate returns</li>
                  )}
                </ul>
              </div>
            )}

            {/* Investment Tips */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Investment Tips</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Consider vacancy rates (typically 5-10% of annual rent)</li>
                <li>• Factor in potential rent increases over time</li>
                <li>• Account for major repairs and capital improvements</li>
                <li>• Research local rental market trends and regulations</li>
                <li>• Consider property management costs if needed</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>
        <h1 className="text-2xl font-bold text-slate-900">Results</h1>
        <div className="w-20"></div> {/* Spacer for centering */}
      </div>

      {/* Tab Navigation */}
      <nav className="bg-white rounded-xl shadow-sm border border-slate-200 p-4" aria-label="Results tabs">
        <div className={`grid gap-6 ${data.enableInvestmentAnalysis ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-3'}`}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center p-4 rounded-lg text-center transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700 border-2 border-blue-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-2 border-transparent'
                }`}
                aria-label={`Switch to ${tab.name}`}
              >
                <Icon className="h-6 w-6 mb-2" />
                <span className="text-sm font-semibold">{tab.name}</span>
                <span className="text-xs text-slate-500 mt-1">{tab.description}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 min-h-[600px]">
        {renderTabContent()}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1 flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : user ? 'Save Calculation' : 'Save & Share'}
        </button>
        
        <button
          onClick={handleShare}
          disabled={isSaving}
          className="flex items-center justify-center px-4 py-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </button>
      </div>

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