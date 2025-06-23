import React, { useState } from 'react';
import { Calculator, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { MortgageData } from '../../pages/Calculator';
import { AffordabilityData, AffordabilityResults } from '../../types/premium';
import { calculateAffordability } from '../../utils/affordabilityCalculations';
import CurrencyInput from '../shared/CurrencyInput';

interface AffordabilitySectionProps {
  data: MortgageData;
  onInputChange: (field: keyof MortgageData, value: any) => void;
  onAffordabilityCalculated: (results: AffordabilityResults) => void;
}

const AffordabilitySection: React.FC<AffordabilitySectionProps> = ({
  data,
  onInputChange,
  onAffordabilityCalculated
}) => {
  const [affordabilityData, setAffordabilityData] = useState<AffordabilityData>({
    annualIncome: 80000,
    monthlyDebts: 500,
    downPayment: data.downPayment,
    interestRate: data.interestRate
  });
  
  const [results, setResults] = useState<AffordabilityResults | null>(null);

  const handleAffordabilityChange = (field: keyof AffordabilityData, value: number) => {
    const newData = { ...affordabilityData, [field]: value };
    setAffordabilityData(newData);
    
    // Auto-calculate when all fields are filled
    if (newData.annualIncome > 0 && newData.monthlyDebts >= 0) {
      const calculatedResults = calculateAffordability(newData);
      setResults(calculatedResults);
      onAffordabilityCalculated(calculatedResults);
    }
  };

  const handleApplyAffordability = () => {
    if (results) {
      onInputChange('homePrice', results.maxAffordablePrice);
      onInputChange('downPayment', affordabilityData.downPayment);
      onInputChange('interestRate', affordabilityData.interestRate);
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center shadow-sm">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold font-heading text-slate-900">Affordability Estimator</h3>
            <p className="text-sm font-sans text-slate-600 mt-1">Calculate maximum affordable home price based on income</p>
          </div>
        </div>
      </div>

      <div className="space-y-6 mt-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium font-sans text-slate-700 mb-2">
              Annual Income
            </label>
            <CurrencyInput
              value={affordabilityData.annualIncome}
              onChange={(value) => handleAffordabilityChange('annualIncome', value)}
              prefix="$"
              placeholder="80,000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium font-sans text-slate-700 mb-2">
              Monthly Debts
            </label>
            <CurrencyInput
              value={affordabilityData.monthlyDebts}
              onChange={(value) => handleAffordabilityChange('monthlyDebts', value)}
              prefix="$"
              placeholder="500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium font-sans text-slate-700 mb-2">
              Available Down Payment
            </label>
            <CurrencyInput
              value={affordabilityData.downPayment}
              onChange={(value) => handleAffordabilityChange('downPayment', value)}
              prefix="$"
              placeholder="100,000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium font-sans text-slate-700 mb-2">
              Interest Rate
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                value={affordabilityData.interestRate}
                onChange={(e) => handleAffordabilityChange('interestRate', Number(e.target.value))}
                className="w-full pr-8 pl-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-sans"
                placeholder="5.25"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500">%</span>
            </div>
          </div>
        </div>

        {results && (
          <div className="bg-white/80 backdrop-blur-sm border border-purple-300 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-purple-900 mb-4 flex items-center">
              <Calculator className="h-5 w-5 mr-2" />
              Affordability Results
            </h4>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  ${results.maxAffordablePrice.toLocaleString()}
                </div>
                <div className="text-sm text-purple-700">Max Affordable Price</div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  ${results.maxMonthlyPayment.toLocaleString()}
                </div>
                <div className="text-sm text-blue-700">Max Monthly Payment</div>
              </div>
              
              <div className={`p-4 rounded-lg ${results.gdsRatio <= 32 ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className={`text-2xl font-bold ${results.gdsRatio <= 32 ? 'text-green-600' : 'text-red-600'}`}>
                  {results.gdsRatio}%
                </div>
                <div className={`text-sm ${results.gdsRatio <= 32 ? 'text-green-700' : 'text-red-700'}`}>
                  GDS Ratio (≤32%)
                </div>
              </div>
              
              <div className={`p-4 rounded-lg ${results.tdsRatio <= 40 ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className={`text-2xl font-bold ${results.tdsRatio <= 40 ? 'text-green-600' : 'text-red-600'}`}>
                  {results.tdsRatio}%
                </div>
                <div className={`text-sm ${results.tdsRatio <= 40 ? 'text-green-700' : 'text-red-700'}`}>
                  TDS Ratio (≤40%)
                </div>
              </div>
            </div>

            <div className={`flex items-center p-4 rounded-lg mb-4 ${
              results.isWithinBudget ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              {results.isWithinBudget ? (
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              )}
              <span className={`font-medium ${results.isWithinBudget ? 'text-green-800' : 'text-red-800'}`}>
                {results.isWithinBudget 
                  ? 'This price is within your budget based on Canadian lending guidelines'
                  : 'This price exceeds recommended debt-to-income ratios'
                }
              </span>
            </div>

            <button
              onClick={handleApplyAffordability}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Apply to Calculator
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AffordabilitySection;