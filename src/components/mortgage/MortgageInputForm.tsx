import React from 'react';
import { TrendingUp, Home, Settings, Calculator } from 'lucide-react';
import { MortgageData } from '../../pages/Calculator';
import { useAuth } from '../../contexts/AuthContext';
import PropertyFinancingSection from './PropertyFinancingSection';
import InvestmentAnalysisSection from './InvestmentAnalysisSection';
import ClosingCostsSection from './ClosingCostsSection';
import MarketingControlSection from './MarketingControlSection';

interface MortgageInputFormProps {
  data: MortgageData;
  onInputChange: (field: keyof MortgageData, value: any) => void;
  onExpenseChange: (field: keyof NonNullable<MortgageData['monthlyExpenses']>, value: number) => void;
  onClosingCostChange: (field: keyof NonNullable<MortgageData['closingCosts']>, value: number) => void;
  loanCalculation?: {
    baseLoanAmount: number;
    cmhcPremium: number;
    totalLoanAmount: number;
  };
}

const MortgageInputForm: React.FC<MortgageInputFormProps> = ({
  data,
  onInputChange,
  onExpenseChange,
  onClosingCostChange,
  loanCalculation
}) => {
  const { user } = useAuth();

  return (
    <div className="space-y-12">
      {/* Mortgage Details Section */}
      <div>
        <h2 className="text-2xl font-semibold font-heading text-slate-900 mb-4">Mortgage Details</h2>
        <p className="text-slate-600 font-sans mb-8">Enter your property and financing information</p>
        
        <div className="space-y-8">
          <PropertyFinancingSection 
            data={data}
            onInputChange={onInputChange}
            loanCalculation={loanCalculation}
          />
        </div>
      </div>

      {/* Premium Features Toggle Section */}
      {user?.tier === 'premium' && (
        <div className="border-t border-slate-200 pt-12">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center shadow-sm">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold font-heading text-slate-900">Premium Features</h3>
                <p className="text-sm font-sans text-slate-600 mt-1">Enable advanced analysis tools for your clients</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 bg-white/70 rounded-lg border border-purple-200">
                <div className="flex items-center space-x-3">
                  <Calculator className="h-5 w-5 text-purple-600" />
                  <span className="font-medium text-slate-900">Affordability Estimator</span>
                </div>
                <button
                  onClick={() => onInputChange('enableAffordabilityEstimator', !data.enableAffordabilityEstimator)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                    data.enableAffordabilityEstimator ? 'bg-purple-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      data.enableAffordabilityEstimator ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/70 rounded-lg border border-purple-200">
                <div className="flex items-center space-x-3">
                  <Home className="h-5 w-5 text-purple-600" />
                  <span className="font-medium text-slate-900">Rent vs Buy Analysis</span>
                </div>
                <button
                  onClick={() => onInputChange('enableRentVsBuy', !data.enableRentVsBuy)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                    data.enableRentVsBuy ? 'bg-purple-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      data.enableRentVsBuy ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Optional Sections with Visual Separation and Better Spacing */}
      <div className="space-y-16">
        {/* Closing Costs Analysis */}
        <div className="border-t border-slate-200 pt-12">
          <ClosingCostsSection
            data={data}
            onInputChange={onInputChange}
            onClosingCostChange={onClosingCostChange}
          />
        </div>

        {/* Investment Property Analysis */}
        <div className="border-t border-slate-200 pt-12">
          <InvestmentAnalysisSection
            data={data}
            onInputChange={onInputChange}
            onExpenseChange={onExpenseChange}
          />
        </div>

        {/* Premium Marketing Control */}
        {user?.tier === 'premium' && (
          <div className="border-t border-slate-200 pt-12">
            <MarketingControlSection
              data={data}
              onInputChange={onInputChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MortgageInputForm;