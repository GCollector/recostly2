import React from 'react';
import { TrendingUp } from 'lucide-react';
import { MortgageData } from '../../pages/Calculator';
import InvestmentToggle from './InvestmentToggle';
import InvestmentFields from './InvestmentFields';

interface InvestmentAnalysisSectionProps {
  data: MortgageData;
  onInputChange: (field: keyof MortgageData, value: any) => void;
  onExpenseChange: (field: keyof NonNullable<MortgageData['monthlyExpenses']>, value: number) => void;
}

const InvestmentAnalysisSection: React.FC<InvestmentAnalysisSectionProps> = ({
  data,
  onInputChange,
  onExpenseChange
}) => {
  return (
    <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl p-6 border border-emerald-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg flex items-center justify-center shadow-sm">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold font-heading text-slate-900">Investment Property Analysis</h3>
            <p className="text-sm font-sans text-slate-600 mt-1">Turn your home purchase into a profitable investment opportunity</p>
          </div>
        </div>
        
        <InvestmentToggle
          enabled={data.enableInvestmentAnalysis}
          onToggle={(enabled) => onInputChange('enableInvestmentAnalysis', enabled)}
        />
      </div>

      {data.enableInvestmentAnalysis && (
        <InvestmentFields
          data={data}
          onInputChange={onInputChange}
          onExpenseChange={onExpenseChange}
        />
      )}
    </div>
  );
};

export default InvestmentAnalysisSection;