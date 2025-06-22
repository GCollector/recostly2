import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Share2, Copy, CheckCircle, Crown, AlertTriangle, TrendingUp, DollarSign, Calculator, Home, BarChart3, PieChart } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell, AreaChart, Area, Pie } from 'recharts';
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

const MortgageResults: React.FC<MortgageResultsProps> = ({ data, onBack }) => {
  const { user } = useAuth();
  const { saveCalculation } = useCalculations();
  
  const [activeTab, setActiveTab] = useState<'mortgage' | 'closing' | 'amortization' | 'investment'>('mortgage');
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [investmentResult, setInvestmentResult] = useState<InvestmentResult | null>(null);
  const [amortizationSchedule, setAmortizationSchedule] = useState<AmortizationData[]>([]);
  const [closingCosts, setClosingCosts] = useState<ClosingCostBreakdown | null>(null);
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
    calculateClosingCosts();
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
      if (!data.isFirstTimeBuyer) return 0;
      
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
    
    if (data.city === 'toronto') {
      landTransferTax = calculateOntarioLandTransferTax(data.homePrice);
      additionalTax = calculateTorontoLandTransferTax(data.homePrice);
    } else {
      landTransferTax = calculateBCPropertyTransferTax(data.homePrice);
    }
    
    const legalFees = Math.round(data.homePrice * 0.001) + 1500;
    const titleInsurance = Math.min(Math.max(data.homePrice * 0.0005, 250), 1500);
    const homeInspection = 500;
    const appraisal = 400;
    const surveyFee = 1000;
    const firstTimeBuyerRebate = calculateFirstTimeBuyerRebate(data.homePrice, data.city);
    
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

  const tabs = [
    {
      id: 'mortgage' as const,
      name: 'Mortgage Summary',
      shortName: 'Summary',
      icon: Calculator,
      description: 'Payment details and breakdown'
    },
    {
      id: 'closing' as const,
      name: 'Closing Costs',
      shortName: 'Closing',
      icon: Home,
      description: 'Fees and closing expenses'
    },
    {
      id: 'amortization' as const,
      name: 'Amortization',
      shortName: 'Schedule',
      icon: BarChart3,
      description: 'Payment schedule and charts'
    },
    ...(data.enableInvestmentAnalysis ? [{
      id: 'investment' as const,
      name: 'Investment Analysis',
      shortName: 'Investment',
      icon: TrendingUp,
      description: 'ROI and cash flow analysis'
    }] : [])
  ];

  // Chart data for mortgage summary - Fixed data structure
  const costBreakdownData = [
    { name: 'Down Payment', value: data.downPayment, color: '#10B981' },
    { name: 'Principal', value: result.loanAmount, color: '#3B82F6' },
    { name: 'Interest', value: result.totalInterest, color: '#EF4444' }
  ];

  // Interest vs Principal comparison - FIXED: Use vertical bar chart instead
  const interestVsPrincipalData = [
    { 
      name: 'Interest vs Principal',
      interest: result.totalInterest, 
      principal: result.loanAmount 
    }
  ];

  // Payment over time data (first 10 years) - Ensure data exists
  const paymentOverTimeData = amortizationSchedule.length > 0 
    ? amortizationSchedule.slice(0, 10).map(year => ({
        year: `Year ${year.year}`,
        principal: year.principalPayment,
        interest: year.interestPayment,
        balance: year.balance
      }))
    : [];

  const COLORS = ['#10B981', '#3B82F6', '#EF4444', '#F59E0B', '#8B5CF6'];

  // Custom label function for mobile-friendly pie chart
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
    // Only show labels for segments larger than 5%
    if (percent < 0.05) return null;
    
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
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'mortgage':
        return (
          <div className="space-y-6 lg:space-y-8">
            {/* Top Summary Cards */}
            <div className="grid lg:grid-cols-3 gap-4 lg:gap-6">
              {/* Main Payment Card */}
              <div className="lg:col-span-1">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 sm:p-6 rounded-xl border-2 border-blue-200 shadow-lg">
                  <div className="text-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <Calculator className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-700 mb-2">
                      ${result.monthlyPayment.toLocaleString()}
                    </div>
                    <div className="text-sm sm:text-base lg:text-lg font-semibold text-blue-800">
                      {data.paymentFrequency === 'monthly' ? 'Monthly' : 'Bi-weekly'} Payment
                    </div>
                    <div className="text-xs sm:text-sm text-blue-600 mt-2">
                      {data.interestRate}% • {data.amortizationYears} years
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="lg:col-span-2 grid grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-slate-50 p-3 sm:p-4 rounded-lg border border-slate-200">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">
                    ${result.loanAmount.toLocaleString()}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-600">Loan Amount</div>
                  <div className="text-xs text-slate-500 mt-1">
                    {Math.round((result.loanAmount / data.homePrice) * 100)}% of home price
                  </div>
                </div>

                <div className="bg-slate-50 p-3 sm:p-4 rounded-lg border border-slate-200">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">
                    ${result.totalInterest.toLocaleString()}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-600">Total Interest</div>
                  <div className="text-xs text-slate-500 mt-1">
                    Over {data.amortizationYears} years
                  </div>
                </div>

                <div className="bg-slate-50 p-3 sm:p-4 rounded-lg border border-slate-200">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">
                    ${data.downPayment.toLocaleString()}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-600">Down Payment</div>
                  <div className="text-xs text-slate-500 mt-1">
                    {Math.round((data.downPayment / data.homePrice) * 100)}% down
                  </div>
                </div>

                <div className="bg-slate-50 p-3 sm:p-4 rounded-lg border border-slate-200">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">
                    ${result.totalCost.toLocaleString()}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-600">Total Cost</div>
                  <div className="text-xs text-slate-500 mt-1">
                    Including all interest
                  </div>
                </div>
              </div>
            </div>

            {/* Beautiful Charts Section - MOBILE OPTIMIZED */}
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
              {/* Total Cost Breakdown Pie Chart - MOBILE FRIENDLY */}
              <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
                <h4 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4 flex items-center">
                  <PieChart className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-600" />
                  Total Cost Breakdown
                </h4>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPieChart>
                    <Pie
                      data={costBreakdownData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {costBreakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`$${Number(value).toLocaleString()}`, '']} 
                      contentStyle={{ fontSize: '12px' }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="mt-3 sm:mt-4 grid grid-cols-3 gap-2 text-xs">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div>
                    <span>Down Payment</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                    <span>Principal</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                    <span>Interest</span>
                  </div>
                </div>
                <div className="mt-3 sm:mt-4 text-center">
                  <div className="text-xs sm:text-sm text-slate-600">
                    Interest represents <span className="font-semibold text-red-600">
                      {Math.round((result.totalInterest / result.totalCost) * 100)}%
                    </span> of your total payments
                  </div>
                </div>
              </div>

              {/* Interest vs Principal Comparison - MOBILE OPTIMIZED */}
              <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
                <h4 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4 flex items-center">
                  <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-600" />
                  Interest vs Principal
                </h4>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={interestVsPrincipalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      fontSize={12}
                      interval={0}
                      angle={0}
                      textAnchor="middle"
                    />
                    <YAxis 
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                      fontSize={12}
                    />
                    <Tooltip 
                      formatter={(value, name) => [
                        `$${Number(value).toLocaleString()}`, 
                        name === 'interest' ? 'Total Interest' : 'Principal Amount'
                      ]}
                      contentStyle={{ fontSize: '12px' }}
                    />
                    <Legend fontSize={12} />
                    <Bar dataKey="principal" fill="#3B82F6" name="Principal Amount" />
                    <Bar dataKey="interest" fill="#EF4444" name="Total Interest" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Payment Progression Over Time - Only show if data exists and on larger screens */}
              {paymentOverTimeData.length > 0 && (
                <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm hidden lg:block">
                  <h4 className="text-lg font-semibold text-slate-900 mb-4">
                    Payment Breakdown Over Time (First 10 Years)
                  </h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={paymentOverTimeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(value, name) => [
                        `$${Number(value).toLocaleString()}`, 
                        name === 'principal' ? 'Principal' : 'Interest'
                      ]} />
                      <Area 
                        type="monotone" 
                        dataKey="interest" 
                        stackId="1" 
                        stroke="#EF4444" 
                        fill="#EF4444" 
                        fillOpacity={0.6}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="principal" 
                        stackId="1" 
                        stroke="#10B981" 
                        fill="#10B981" 
                        fillOpacity={0.6}
                      />
                      <Legend />
                    </AreaChart>
                  </ResponsiveContainer>
                  <div className="mt-4 text-center text-sm text-slate-600">
                    Notice how principal payments increase while interest decreases over time
                  </div>
                </div>
              )}

              {/* Mortgage Balance Decline - Only show if data exists and on larger screens */}
              {paymentOverTimeData.length > 0 && (
                <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm hidden lg:block">
                  <h4 className="text-lg font-semibold text-slate-900 mb-4">
                    Remaining Balance Over Time
                  </h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={paymentOverTimeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Remaining Balance']} />
                      <Area 
                        type="monotone" 
                        dataKey="balance" 
                        stroke="#3B82F6" 
                        fill="#3B82F6" 
                        fillOpacity={0.3}
                        strokeWidth={3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                  <div className="mt-4 text-center text-sm text-slate-600">
                    Your mortgage balance decreases faster in later years
                  </div>
                </div>
              )}
            </div>

            {/* Property Details Summary */}
            <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-4 sm:p-6 rounded-xl border border-slate-200">
              <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-3 sm:mb-4">Property Summary</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="text-center">
                  <div className="text-sm sm:text-base lg:text-lg font-bold text-slate-900">${data.homePrice.toLocaleString()}</div>
                  <div className="text-xs sm:text-sm text-slate-600">Purchase Price</div>
                </div>
                <div className="text-center">
                  <div className="text-sm sm:text-base lg:text-lg font-bold text-slate-900">{data.interestRate}%</div>
                  <div className="text-xs sm:text-sm text-slate-600">Interest Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-sm sm:text-base lg:text-lg font-bold text-slate-900">{data.amortizationYears} years</div>
                  <div className="text-xs sm:text-sm text-slate-600">Amortization</div>
                </div>
                <div className="text-center">
                  <div className="text-sm sm:text-base lg:text-lg font-bold text-slate-900">
                    {data.city === 'toronto' ? 'Toronto, ON' : 'Vancouver, BC'}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-600">Location</div>
                </div>
              </div>
              
              {data.isFirstTimeBuyer && (
                <div className="mt-3 sm:mt-4 text-center">
                  <div className="inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                    ✓ First-Time Homebuyer Benefits Applied
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'closing':
        return closingCosts ? (
          <div className="space-y-6 lg:space-y-8">
            {/* Highlighted Top Section - Two Key Totals */}
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
              {/* Total Estimated Closing Costs */}
              <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-2 border-emerald-300 p-6 sm:p-8 rounded-xl shadow-lg">
                <div className="text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Home className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-emerald-700 mb-2">
                    ${closingCosts.total.toLocaleString()}
                  </div>
                  <div className="text-sm sm:text-base lg:text-lg font-semibold text-emerald-800">
                    Total Estimated Closing Costs
                  </div>
                  <div className="text-xs sm:text-sm text-emerald-600 mt-2">
                    Fees and expenses at closing
                  </div>
                </div>
              </div>

              {/* Cash Required at Closing */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 p-6 sm:p-8 rounded-xl shadow-lg">
                <div className="text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-700 mb-2">
                    ${(data.downPayment + closingCosts.total).toLocaleString()}
                  </div>
                  <div className="text-sm sm:text-base lg:text-lg font-semibold text-blue-800">
                    Cash Required at Closing
                  </div>
                  <div className="text-xs sm:text-sm text-blue-600 mt-2">
                    Down payment + closing costs
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="max-w-4xl mx-auto">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 sm:mb-6 text-center">Closing Cost Breakdown</h3>
              
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 sm:p-6">
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex justify-between items-center py-2 sm:py-3 border-b border-slate-200">
                      <span className="text-sm sm:text-base text-slate-700 font-medium">
                        {data.city === 'toronto' ? 'Ontario Land Transfer Tax' : 'BC Property Transfer Tax'}
                      </span>
                      <span className="text-sm sm:text-base lg:text-lg font-semibold text-slate-900">
                        ${closingCosts.landTransferTax.toLocaleString()}
                      </span>
                    </div>

                    {data.city === 'toronto' && (
                      <div className="flex justify-between items-center py-2 sm:py-3 border-b border-slate-200">
                        <span className="text-sm sm:text-base text-slate-700 font-medium">Toronto Municipal Land Transfer Tax</span>
                        <span className="text-sm sm:text-base lg:text-lg font-semibold text-slate-900">
                          ${closingCosts.additionalTax.toLocaleString()}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-center py-2 sm:py-3 border-b border-slate-200">
                      <span className="text-sm sm:text-base text-slate-700 font-medium">Legal Fees & Disbursements</span>
                      <span className="text-sm sm:text-base lg:text-lg font-semibold text-slate-900">
                        ${closingCosts.legalFees.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2 sm:py-3 border-b border-slate-200">
                      <span className="text-sm sm:text-base text-slate-700 font-medium">Title Insurance</span>
                      <span className="text-sm sm:text-base lg:text-lg font-semibold text-slate-900">
                        ${closingCosts.titleInsurance.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2 sm:py-3 border-b border-slate-200">
                      <span className="text-sm sm:text-base text-slate-700 font-medium">Home Inspection</span>
                      <span className="text-sm sm:text-base lg:text-lg font-semibold text-slate-900">
                        ${closingCosts.homeInspection.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2 sm:py-3 border-b border-slate-200">
                      <span className="text-sm sm:text-base text-slate-700 font-medium">Property Appraisal</span>
                      <span className="text-sm sm:text-base lg:text-lg font-semibold text-slate-900">
                        ${closingCosts.appraisal.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2 sm:py-3 border-b border-slate-200">
                      <span className="text-sm sm:text-base text-slate-700 font-medium">Survey Fee</span>
                      <span className="text-sm sm:text-base lg:text-lg font-semibold text-slate-900">
                        ${closingCosts.surveyFee.toLocaleString()}
                      </span>
                    </div>

                    {closingCosts.firstTimeBuyerRebate > 0 && (
                      <div className="flex justify-between items-center py-2 sm:py-3 border-b border-slate-200">
                        <span className="text-sm sm:text-base text-green-700 font-medium">First-Time Buyer Rebate</span>
                        <span className="text-sm sm:text-base lg:text-lg font-semibold text-green-600">
                          -${closingCosts.firstTimeBuyerRebate.toLocaleString()}
                        </span>
                      </div>
                    )}

                    {/* Total Row */}
                    <div className="flex justify-between items-center py-3 sm:py-4 bg-slate-50 rounded-lg px-3 sm:px-4 border-2 border-slate-300">
                      <span className="text-base sm:text-lg font-bold text-slate-900">Total Closing Costs</span>
                      <span className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">
                        ${closingCosts.total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="mt-6 sm:mt-8 bg-slate-50 p-4 sm:p-6 rounded-xl">
                <h4 className="font-semibold text-slate-900 mb-3">Additional Costs to Consider</h4>
                <div className="text-sm text-slate-600 space-y-2">
                  <p>• Moving expenses and utility connections</p>
                  <p>• Property taxes (prorated) and home insurance</p>
                  <p>• Condo fees (if applicable) and immediate repairs</p>
                  <p>• Emergency fund for unexpected expenses</p>
                </div>
              </div>
            </div>
          </div>
        ) : null;

      case 'amortization':
        return (
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
              {/* Summary Cards */}
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-lg font-semibold text-blue-900">
                    ${amortizationSchedule.reduce((sum, year) => sum + year.principalPayment, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-blue-700">Total Principal</div>
                </div>
                
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-lg font-semibold text-red-900">
                    ${amortizationSchedule.reduce((sum, year) => sum + year.interestPayment, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-red-700">Total Interest</div>
                </div>
              </div>

              {/* Charts */}
              <div className="lg:col-span-2 space-y-6">
                {amortizationSchedule.length > 0 && (
                  <>
                    <div className="bg-white p-4 rounded-lg border border-slate-200">
                      <h4 className="text-base sm:text-lg font-medium text-slate-900 mb-4">Principal vs Interest Over Time</h4>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={amortizationSchedule.slice(0, 10)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="year" fontSize={12} />
                          <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} fontSize={12} />
                          <Tooltip formatter={(value, name) => [
                            `$${Number(value).toLocaleString()}`, 
                            name === 'principalPayment' ? 'Principal' : 'Interest'
                          ]} />
                          <Legend fontSize={12} />
                          <Bar dataKey="principalPayment" stackId="a" fill="#10B981" name="Principal" />
                          <Bar dataKey="interestPayment" stackId="a" fill="#EF4444" name="Interest" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-slate-200">
                      <h4 className="text-base sm:text-lg font-medium text-slate-900 mb-4">Remaining Balance</h4>
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={amortizationSchedule}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="year" fontSize={12} />
                          <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} fontSize={12} />
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
                  </>
                )}
              </div>
            </div>
          </div>
        );

      case 'investment':
        if (!data.enableInvestmentAnalysis || !investmentResult) return null;
        
        const isNegativeCashFlow = investmentResult.cashFlow < 0;
        const isLowCapRate = investmentResult.capRate < 6;

        return (
          <div className="space-y-6">
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
            <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
              <div className={`p-4 sm:p-6 rounded-lg ${investmentResult.cashFlow >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="flex items-center mb-2">
                  <DollarSign className={`h-5 w-5 sm:h-6 sm:w-6 mr-3 ${investmentResult.cashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                  <span className="text-sm sm:text-base lg:text-lg font-medium text-slate-700">Monthly Cash Flow</span>
                </div>
                <div className={`text-2xl sm:text-3xl font-bold ${investmentResult.cashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${investmentResult.cashFlow.toLocaleString()}
                </div>
              </div>

              <div className={`p-4 sm:p-6 rounded-lg ${investmentResult.capRate >= 6 ? 'bg-green-50' : 'bg-yellow-50'}`}>
                <div className="flex items-center mb-2">
                  <TrendingUp className={`h-5 w-5 sm:h-6 sm:w-6 mr-3 ${investmentResult.capRate >= 6 ? 'text-green-600' : 'text-yellow-600'}`} />
                  <span className="text-sm sm:text-base lg:text-lg font-medium text-slate-700">Cap Rate</span>
                </div>
                <div className={`text-2xl sm:text-3xl font-bold ${investmentResult.capRate >= 6 ? 'text-green-600' : 'text-yellow-600'}`}>
                  {investmentResult.capRate}%
                </div>
              </div>

              <div className="bg-blue-50 p-4 sm:p-6 rounded-lg">
                <div className="text-sm sm:text-base lg:text-lg font-medium text-blue-700 mb-2">ROI</div>
                <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                  {investmentResult.roi}%
                </div>
                <div className="text-xs sm:text-sm text-blue-600 mt-1">
                  Annual: ${(investmentResult.cashFlow * 12).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="bg-slate-50 p-4 sm:p-6 rounded-lg">
              <h3 className="text-base sm:text-lg font-medium text-slate-900 mb-3 sm:mb-4">Financial Breakdown</h3>
              
              <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Monthly Rental Income</span>
                    <span className="font-medium text-slate-900">
                      ${data.monthlyRent?.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Total Monthly Expenses</span>
                    <span className="font-medium text-slate-900">
                      ${investmentResult.totalMonthlyExpenses.toLocaleString()}
                    </span>
                  </div>

                  <div className="border-t border-slate-300 pt-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Net Operating Income (Annual)</span>
                      <span className="font-medium text-slate-900">
                        ${investmentResult.netOperatingIncome.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Break-even Rent</span>
                    <span className="font-medium text-slate-900">
                      ${investmentResult.breakEvenRent.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Purchase Price</span>
                    <span className="font-medium text-slate-900">
                      ${data.homePrice.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Down Payment</span>
                    <span className="font-medium text-slate-900">
                      ${data.downPayment.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Investment Tips */}
            <div className="bg-blue-50 p-4 sm:p-6 rounded-lg">
              <h3 className="text-base sm:text-lg font-medium text-blue-900 mb-3">Investment Tips</h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>• Consider vacancy rates (typically 5-10% of annual rent)</li>
                <li>• Factor in potential rent increases over time</li>
                <li>• Account for major repairs and capital improvements</li>
                <li>• Research local rental market trends and regulations</li>
                <li>• Consider property management costs if needed</li>
                <li>• Evaluate the neighborhood's growth potential</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="hidden sm:inline">Back to Form</span>
          <span className="sm:hidden">Back</span>
        </button>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 text-center">Results</h2>
        <div className="w-16 sm:w-24"></div> {/* Spacer for centering */}
      </div>

      {/* Perfect Responsive Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1">
        <nav 
          className={`grid gap-1 ${
            tabs.length === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'
          }`} 
          aria-label="Results tabs"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-lg text-center transition-all duration-200 min-h-[80px] sm:min-h-[100px] ${
                  isActive
                    ? 'bg-blue-100 text-blue-700 shadow-sm scale-[1.02]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
                aria-label={`Switch to ${tab.name}`}
              >
                <Icon className="h-5 w-5 sm:h-6 sm:w-6 mb-1 sm:mb-2 flex-shrink-0" />
                
                {/* Show full name on larger screens, short name on mobile */}
                <span className="text-xs sm:text-sm font-medium font-sans leading-tight hidden sm:block">
                  {tab.name}
                </span>
                <span className="text-xs font-medium font-sans leading-tight sm:hidden">
                  {tab.shortName}
                </span>
                
                {/* Description only on larger screens */}
                <span className="text-xs font-sans text-slate-500 mt-1 hidden lg:block leading-tight">
                  {tab.description}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content - Full Height */}
      <div className="min-h-[400px] sm:min-h-[500px]">
        {renderTabContent()}
      </div>

      {/* Error Display */}
      {saveError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
          <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <span className="text-sm">{saveError}</span>
        </div>
      )}

      {/* Success Message */}
      {calculationId && !saveError && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            <span className="text-sm">Calculation saved successfully! You can now share it with others.</span>
          </div>
        </div>
      )}

      {/* Action Buttons - Responsive */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
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
          <span className="text-sm sm:text-base">
            {isSaving ? 'Saving...' : user ? 'Save Calculation' : 'Save & Share'}
          </span>
        </button>
        
        <button
          onClick={handleShare}
          disabled={!result || isSaving}
          className={`flex-1 sm:flex-none flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-colors ${
            (!result || isSaving)
              ? 'bg-slate-100 border border-slate-300 text-slate-400 cursor-not-allowed'
              : 'bg-white border border-slate-300 hover:bg-slate-50 text-slate-700'
          }`}
        >
          <Share2 className="h-4 w-4 mr-2" />
          <span className="text-sm sm:text-base">Share</span>
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