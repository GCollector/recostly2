import React from 'react';
import { TrendingUp, Home, Settings } from 'lucide-react';
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
}

const MortgageInputForm: React.FC<MortgageInputFormProps> = ({
  data,
  onInputChange,
  onExpenseChange,
  onClosingCostChange
}) => {
  const { user } = useAuth();

  return (
    <div className="space-y-12">
      {/* Mortgage Details Section */}
      <div>
        <h2 className="text-2xl font-semibold font-heading text-slate-900 mb-4">Mortgage Details</h2>
        <p className="text-slate-600 font-sans mb-6">Enter your property and financing information</p>
        
        <div className="space-y-8">
          <PropertyFinancingSection 
            data={data}
            onInputChange={onInputChange}
          />
        </div>
      </div>

      {/* Optional Sections with Visual Separation */}
      <div className="space-y-12">
        {/* Closing Costs Analysis */}
        <div className="border-t border-slate-200 pt-8">
          <ClosingCostsSection
            data={data}
            onInputChange={onInputChange}
            onClosingCostChange={onClosingCostChange}
          />
        </div>

        {/* Investment Property Analysis */}
        <div className="border-t border-slate-200 pt-8">
          <InvestmentAnalysisSection
            data={data}
            onInputChange={onInputChange}
            onExpenseChange={onExpenseChange}
          />
        </div>

        {/* Premium Marketing Control */}
        {user?.tier === 'premium' && (
          <div className="border-t border-slate-200 pt-8">
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