import React, { useState } from 'react';
import { Calculator as CalculatorIcon, ArrowRight, ArrowLeft, TrendingUp } from 'lucide-react';
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

  const handleCalculateResults = () => {
    setCurrentStep(2);
  };

  const handleBackToForm = () => {
    setCurrentStep(1);
  };

  const downPaymentPercent = Math.round((mortgageData.downPayment / mortgageData.homePrice) * 100);

  if (currentStep === 2) {
    return <MortgageResults data={mortgageData} onBack={handleBackToForm} />;
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="text-center space-y-3 sm:space-y-4 px-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-heading text-slate-900">
          Canadian Mortgage Calculator
        </h1>
        <p className="text-base sm:text-lg font-sans text-slate-600 max-w-3xl mx-auto">
          Professional mortgage calculations with optional investment analysis for Canadian real estate.
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center space-x-3 sm:space-x-4 px-4">
        <div className="flex items-center space-x-2">
          <span className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-600 text-white text-sm font-medium">
            1
          </span>
          <span className="text-sm font-medium font-sans text-slate-900">Input Details</span>
        </div>
        <ArrowRight className="h-4 w-4 text-slate-400" />
        <div className="flex items-center space-x-2">
          <span className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-400 text-white text-sm font-medium">
            2
          </span>
          <span className="text-sm font-medium font-sans text-slate-600">View Results</span>
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[600px] mx-4 sm:mx-0" data-testid="calculator-content">
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
          {/* Mortgage Details Section */}
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold font-heading text-slate-900 mb-3 sm:mb-4">Mortgage Details</h2>
            <p className="text-slate-600 font-sans mb-4 sm:mb-6">Enter your property and financing information</p>
            
            <div className="space-y-6 sm:space-y-8">
              {/* Property & Financing */}
              <div>
                <h3 className="text-lg font-semibold font-heading text-slate-900 mb-4">Property & Financing</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium font-sans text-slate-700 mb-2">
                      Home Price
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">$</span>
                      <input
                        type="number"
                        value={mortgageData.homePrice}
                        onChange={(e) => handleInputChange('homePrice', Number(e.target.value))}
                        className="w-full pl-8 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-sans text-base"
                        placeholder="500,000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium font-sans text-slate-700 mb-2">
                      Down Payment
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">$</span>
                      <input
                        type="number"
                        value={mortgageData.downPayment}
                        onChange={(e) => handleInputChange('downPayment', Number(e.target.value))}
                        className="w-full pl-8 pr-16 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-sans text-base"
                        placeholder="100,000"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm font-sans text-slate-500">
                        {downPaymentPercent}%
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium font-sans text-slate-700 mb-2">
                      Interest Rate
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        value={mortgageData.interestRate}
                        onChange={(e) => handleInputChange('interestRate', Number(e.target.value))}
                        className="w-full pr-8 pl-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-sans text-base"
                        placeholder="5.25"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500">%</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium font-sans text-slate-700 mb-2">
                      Amortization Period
                    </label>
                    <select
                      value={mortgageData.amortizationYears}
                      onChange={(e) => handleInputChange('amortizationYears', Number(e.target.value))}
                      className="w-full px-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-sans text-base"
                    >
                      {[15, 20, 25, 30].map(years => (
                        <option key={years} value={years}>{years} years</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium font-sans text-slate-700 mb-2">
                      Payment Frequency
                    </label>
                    <select
                      value={mortgageData.paymentFrequency}
                      onChange={(e) => handleInputChange('paymentFrequency', e.target.value as 'monthly' | 'bi-weekly')}
                      className="w-full px-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-sans text-base"
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
                      value={mortgageData.province === 'ontario' ? 'toronto' : 'vancouver'}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === 'toronto') {
                          handleInputChange('province', 'ontario');
                          handleInputChange('city', 'toronto');
                        } else {
                          handleInputChange('province', 'bc');
                          handleInputChange('city', 'vancouver');
                        }
                      }}
                      className="w-full px-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-sans text-base"
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
                      checked={mortgageData.isFirstTimeBuyer}
                      onChange={(e) => handleInputChange('isFirstTimeBuyer', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                    />
                    <label htmlFor="first-time-buyer" className="ml-2 block text-sm font-sans text-slate-700">
                      First-time homebuyer
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Investment Property Analysis */}
          <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl p-4 sm:p-6 border border-emerald-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div className="flex items-start sm:items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-semibold font-heading text-slate-900">Investment Property Analysis</h3>
                  <p className="text-sm font-sans text-slate-600 mt-1">Turn your home purchase into a profitable investment opportunity</p>
                </div>
              </div>
              
              {/* Toggle Switch */}
              <div className="flex items-center space-x-3 flex-shrink-0">
                <span className="text-sm font-medium text-slate-700">
                  {mortgageData.enableInvestmentAnalysis ? 'Enabled' : 'Enable'}
                </span>
                <button
                  onClick={() => handleInputChange('enableInvestmentAnalysis', !mortgageData.enableInvestmentAnalysis)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                    mortgageData.enableInvestmentAnalysis ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                  role="switch"
                  aria-checked={mortgageData.enableInvestmentAnalysis}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      mortgageData.enableInvestmentAnalysis ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {mortgageData.enableInvestmentAnalysis && (
              <div className="space-y-6 mt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium font-sans text-slate-700 mb-2">
                      Expected Monthly Rent
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">$</span>
                      <input
                        type="number"
                        value={mortgageData.monthlyRent}
                        onChange={(e) => handleInputChange('monthlyRent', Number(e.target.value))}
                        className="w-full pl-8 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-sans bg-white text-base"
                        placeholder="2,500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-semibold font-heading text-slate-900 mb-4">Monthly Operating Expenses</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium font-sans text-slate-700 mb-2">
                        Property Taxes
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">$</span>
                        <input
                          type="number"
                          value={mortgageData.monthlyExpenses?.taxes}
                          onChange={(e) => handleExpenseChange('taxes', Number(e.target.value))}
                          className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-sans bg-white text-base"
                          placeholder="400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium font-sans text-slate-700 mb-2">
                        Insurance
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">$</span>
                        <input
                          type="number"
                          value={mortgageData.monthlyExpenses?.insurance}
                          onChange={(e) => handleExpenseChange('insurance', Number(e.target.value))}
                          className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-sans bg-white text-base"
                          placeholder="150"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium font-sans text-slate-700 mb-2">
                        Condo Fees
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">$</span>
                        <input
                          type="number"
                          value={mortgageData.monthlyExpenses?.condoFees}
                          onChange={(e) => handleExpenseChange('condoFees', Number(e.target.value))}
                          className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-sans bg-white text-base"
                          placeholder="300"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium font-sans text-slate-700 mb-2">
                        Maintenance
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">$</span>
                        <input
                          type="number"
                          value={mortgageData.monthlyExpenses?.maintenance}
                          onChange={(e) => handleExpenseChange('maintenance', Number(e.target.value))}
                          className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-sans bg-white text-base"
                          placeholder="200"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium font-sans text-slate-700 mb-2">
                        Other Expenses
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">$</span>
                        <input
                          type="number"
                          value={mortgageData.monthlyExpenses?.other}
                          onChange={(e) => handleExpenseChange('other', Number(e.target.value))}
                          className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-sans bg-white text-base"
                          placeholder="100"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Calculate Button */}
          <div className="flex justify-center pt-4 sm:pt-6">
            <button
              onClick={handleCalculateResults}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-medium font-sans transition-all duration-200 transform hover:scale-105 shadow-lg w-full sm:w-auto justify-center"
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