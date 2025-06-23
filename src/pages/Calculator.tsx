import React, { useState, useEffect } from 'react';
import { Calculator as CalculatorIcon, ArrowRight, ArrowLeft } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import MortgageInputForm from '../components/mortgage/MortgageInputForm';
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
  enableInvestmentAnalysis: boolean;
  enableClosingCosts: boolean;
  showMarketingOnShare: boolean; // New field for premium users
  monthlyRent?: number;
  monthlyExpenses?: {
    taxes: number;
    insurance: number;
    condoFees: number;
    maintenance: number;
    other: number;
  };
  closingCosts?: {
    landTransferTax: number;
    additionalTax: number;
    legalFees: number;
    titleInsurance: number;
    homeInspection: number;
    appraisal: number;
    surveyFee: number;
    firstTimeBuyerRebate: number;
  };
}

const Calculator: React.FC = () => {
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [savedCalculationId, setSavedCalculationId] = useState<string>('');
  const [currentNotes, setCurrentNotes] = useState<Record<string, string>>({});
  const [currentComments, setCurrentComments] = useState<string>('');
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
    enableClosingCosts: true, // Default to enabled with reasonable values
    showMarketingOnShare: true, // Default to show marketing content
    monthlyRent: 2500,
    monthlyExpenses: {
      taxes: 400,
      insurance: 150,
      condoFees: 300,
      maintenance: 200,
      other: 100
    },
    closingCosts: {
      landTransferTax: 8475,
      additionalTax: 8475, // Toronto municipal tax
      legalFees: 2000,
      titleInsurance: 400,
      homeInspection: 500,
      appraisal: 400,
      surveyFee: 1000,
      firstTimeBuyerRebate: 0
    }
  });

  // Check if we're coming from dashboard with saved calculation data
  useEffect(() => {
    if (location.state?.calculationData && location.state?.startAtStep) {
      setMortgageData(location.state.calculationData);
      setCurrentStep(location.state.startAtStep);
      
      // If coming from a saved calculation, set the ID and existing notes/comments
      if (location.state.calculationId) {
        setSavedCalculationId(location.state.calculationId);
        setCurrentNotes(location.state.notes || {});
        setCurrentComments(location.state.comments || '');
      }
    }
  }, [location.state]);

  // Scroll to top when step changes - this is the hack that works
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentStep]);

  const handleInputChange = (field: keyof MortgageData, value: any) => {
    setMortgageData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleExpenseChange = (field: keyof NonNullable<MortgageData['monthlyExpenses']>, value: number) => {
    setMortgageData(prev => ({
      ...prev,
      monthlyExpenses: {
        ...prev.monthlyExpenses!,
        [field]: value
      }
    }));
  };

  const handleClosingCostChange = (field: keyof NonNullable<MortgageData['closingCosts']>, value: number) => {
    setMortgageData(prev => ({
      ...prev,
      closingCosts: {
        ...prev.closingCosts!,
        [field]: value
      }
    }));
  };

  const handleCalculateResults = () => {
    setCurrentStep(2);
  };

  const handleBackToForm = () => {
    setCurrentStep(1);
  };

  const handleCalculationSaved = (calculationId: string) => {
    setSavedCalculationId(calculationId);
  };

  if (currentStep === 2) {
    return (
      <MortgageResults 
        data={mortgageData} 
        onBack={handleBackToForm}
        calculationId={savedCalculationId}
        currentNotes={currentNotes}
        currentComments={currentComments}
        onCalculationSaved={handleCalculationSaved}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold font-heading text-slate-900">
          Canadian Mortgage Calculator
        </h1>
        <p className="text-lg font-sans text-slate-600 max-w-3xl mx-auto">
          Professional mortgage calculations with optional investment analysis and closing costs for Canadian real estate.
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center space-x-4">
        <div className="flex items-center space-x-2">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-medium">
            1
          </span>
          <span className="text-sm font-medium font-sans text-slate-900">Input Details</span>
        </div>
        <ArrowRight className="h-4 w-4 text-slate-400" />
        <div className="flex items-center space-x-2">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-400 text-white text-sm font-medium">
            2
          </span>
          <span className="text-sm font-medium font-sans text-slate-600">View Results</span>
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[600px]" data-testid="calculator-content">
        <div className="p-8 space-y-8">
          <MortgageInputForm
            data={mortgageData}
            onInputChange={handleInputChange}
            onExpenseChange={handleExpenseChange}
            onClosingCostChange={handleClosingCostChange}
          />

          {/* Calculate Button */}
          <div className="flex justify-center pt-6">
            <button
              onClick={handleCalculateResults}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-medium font-sans transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <CalculatorIcon className="h-5 w-5" />
              <span>Calculate Results</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calculator;