import React from 'react';
import { TrendingUp } from 'lucide-react';
import { MortgageData } from '../../pages/Calculator';
import PropertyFinancingSection from './PropertyFinancingSection';
import InvestmentAnalysisSection from './InvestmentAnalysisSection';

interface MortgageInputFormProps {
  data: MortgageData;
  onInputChange: (field: keyof MortgageData, value: any) => void;
  onExpenseChange: (field: keyof NonNullable<MortgageData['monthlyExpenses']>, value: number) => void;
}

const MortgageInputForm: React.FC<MortgageInputFormProps> = ({
  data,
  onInputChange,
  onExpenseChange
}) => {
  return (
    <div className="space-y-8">
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

      {/* Investment Property Analysis */}
      <InvestmentAnalysisSection
        data={data}
        onInputChange={onInputChange}
        onExpenseChange={onExpenseChange}
      />
    </div>
  );
};

export default MortgageInputForm;