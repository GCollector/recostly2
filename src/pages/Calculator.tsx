import React, { useState } from 'react';
import { Calculator as CalculatorIcon, ArrowRight, ArrowLeft } from 'lucide-react';
import MortgageForm from '../components/MortgageForm';
import MortgageResults from '../components/MortgageResults';

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

const Calculator: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  
  // Form data state
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

  const handleNext = () => {
    setCurrentStep(2);
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold font-heading text-slate-900">
          Canadian Mortgage Calculator
        </h1>
        <p className="text-lg font-sans text-slate-600 max-w-3xl mx-auto">
          Professional mortgage calculations with optional investment analysis for Canadian real estate.
        </p>
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
        {currentStep === 1 ? (
          <MortgageForm 
            data={mortgageData} 
            onChange={setMortgageData}
            onNext={handleNext}
          />
        ) : (
          <MortgageResults 
            data={mortgageData}
            onBack={handleBack}
          />
        )}
      </div>
    </div>
  );
};

export default Calculator;