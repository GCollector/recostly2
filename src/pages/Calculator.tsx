import React, { useState } from 'react';
import { Calculator as CalculatorIcon, Home, DollarSign, TrendingUp, BarChart3, ArrowRight, ArrowLeft } from 'lucide-react';
import MortgageForm from '../components/MortgageForm';
import MortgageResults from '../components/MortgageResults';
import ClosingCostsForm from '../components/ClosingCostsForm';
import ClosingCostsResults from '../components/ClosingCostsResults';
import AmortizationForm from '../components/AmortizationForm';
import AmortizationResults from '../components/AmortizationResults';
import InvestmentForm from '../components/InvestmentForm';
import InvestmentResults from '../components/InvestmentResults';

export interface MortgageData {
  homePrice: number;
  downPayment: number;
  interestRate: number;
  amortizationYears: number;
  paymentFrequency: 'monthly' | 'bi-weekly';
  province: 'ontario' | 'bc';
  city: 'toronto' | 'vancouver';
  isFirstTimeBuyer: boolean;
  // Investment analysis fields
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

export interface ClosingCostsData {
  homePrice: number;
  location: 'toronto' | 'vancouver';
  isFirstTimeBuyer: boolean;
}

export interface AmortizationData {
  homePrice: number;
  downPayment: number;
  interestRate: number;
  amortizationYears: number;
}

export interface InvestmentData {
  purchasePrice: number;
  downPayment: number;
  monthlyRent: number;
  monthlyExpenses: {
    taxes: number;
    insurance: number;
    condoFees: number;
    maintenance: number;
    other: number;
  };
  interestRate: number;
}

const Calculator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'mortgage' | 'closing' | 'amortization' | 'investment'>('mortgage');
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  
  // Form data states
  const [mortgageData, setMortgageData] = useState<MortgageData>({
    homePrice: 500000,
    downPayment: 100000,
    interestRate: 5.25,
    amortizationYears: 25,
    paymentFrequency: 'monthly',
    province: 'ontario',
    city: 'toronto',
    isFirstTimeBuyer: false,
    enableInvestmentAnalysis: false,
    monthlyRent: 2500,
    monthlyExpenses: {
      taxes: 400,
      insurance: 150,
      condoFees: 300,
      maintenance: 200,
      other: 100
    }
  });

  const [closingCostsData, setClosingCostsData] = useState<ClosingCostsData>({
    homePrice: 500000,
    location: 'toronto',
    isFirstTimeBuyer: false
  });

  const [amortizationData, setAmortizationData] = useState<AmortizationData>({
    homePrice: 500000,
    downPayment: 100000,
    interestRate: 5.25,
    amortizationYears: 25
  });

  const [investmentData, setInvestmentData] = useState<InvestmentData>({
    purchasePrice: 500000,
    downPayment: 100000,
    monthlyRent: 2500,
    monthlyExpenses: {
      taxes: 400,
      insurance: 150,
      condoFees: 300,
      maintenance: 200,
      other: 100
    },
    interestRate: 5.25
  });

  const tabs = [
    {
      id: 'mortgage' as const,
      name: 'Mortgage Calculator',
      icon: CalculatorIcon,
      description: 'Calculate monthly payments and total costs'
    },
    {
      id: 'closing' as const,
      name: 'Closing Costs',
      icon: Home,
      description: 'Estimate closing costs and fees'
    },
    {
      id: 'amortization' as const,
      name: 'Amortization',
      icon: BarChart3,
      description: 'View payment schedule and charts'
    },
    {
      id: 'investment' as const,
      name: 'Investment',
      icon: TrendingUp,
      description: 'Analyze rental property returns'
    }
  ];

  const handleTabChange = (tabId: typeof activeTab) => {
    setActiveTab(tabId);
    setCurrentStep(1); // Reset to step 1 when changing tabs
  };

  const handleNext = () => {
    setCurrentStep(2);
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const renderStepContent = () => {
    if (currentStep === 1) {
      // Step 1: Forms
      switch (activeTab) {
        case 'mortgage':
          return (
            <MortgageForm 
              data={mortgageData} 
              onChange={setMortgageData}
              onNext={handleNext}
            />
          );
        case 'closing':
          return (
            <ClosingCostsForm 
              data={closingCostsData} 
              onChange={setClosingCostsData}
              onNext={handleNext}
            />
          );
        case 'amortization':
          return (
            <AmortizationForm 
              data={amortizationData} 
              onChange={setAmortizationData}
              onNext={handleNext}
            />
          );
        case 'investment':
          return (
            <InvestmentForm 
              data={investmentData} 
              onChange={setInvestmentData}
              onNext={handleNext}
            />
          );
        default:
          return null;
      }
    } else {
      // Step 2: Results
      switch (activeTab) {
        case 'mortgage':
          return (
            <MortgageResults 
              data={mortgageData}
              onBack={handleBack}
            />
          );
        case 'closing':
          return (
            <ClosingCostsResults 
              data={closingCostsData}
              onBack={handleBack}
            />
          );
        case 'amortization':
          return (
            <AmortizationResults 
              data={amortizationData}
              onBack={handleBack}
            />
          );
        case 'investment':
          return (
            <InvestmentResults 
              data={investmentData}
              onBack={handleBack}
            />
          );
        default:
          return null;
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold font-heading text-slate-900">
          Mortgage & Real Estate Calculators
        </h1>
        <p className="text-lg font-sans text-slate-600 max-w-3xl mx-auto">
          Professional tools for Canadian real estate calculations. Calculate payments, closing costs, 
          amortization schedules, and investment metrics.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2">
        <nav className="grid grid-cols-2 lg:grid-cols-4 gap-2" aria-label="Calculator tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex flex-col items-center p-4 rounded-lg text-center transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
                aria-label={`Switch to ${tab.name}`}
                data-testid={`tab-${tab.id}`}
              >
                <Icon className="h-6 w-6 mb-2" />
                <span className="text-sm font-medium font-sans">{tab.name}</span>
                <span className="text-xs font-sans text-slate-500 mt-1 hidden sm:block">
                  {tab.description}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center space-x-4">
        <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
          currentStep === 1 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
        }`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
            currentStep === 1 ? 'bg-blue-600 text-white' : 'bg-slate-400 text-white'
          }`}>
            1
          </span>
          <span className="text-sm font-medium">Input Details</span>
        </div>
        
        <ArrowRight className="h-4 w-4 text-slate-400" />
        
        <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
          currentStep === 2 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
        }`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
            currentStep === 2 ? 'bg-blue-600 text-white' : 'bg-slate-400 text-white'
          }`}>
            2
          </span>
          <span className="text-sm font-medium">View Results</span>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[600px]" data-testid="calculator-content">
        {renderStepContent()}
      </div>
    </div>
  );
};

export default Calculator;