import React from 'react';
import { Home, Calculator } from 'lucide-react';
import { MortgageData } from '../../pages/Calculator';
import ClosingCostsToggle from './ClosingCostsToggle';
import ClosingCostsFields from './ClosingCostsFields';

interface ClosingCostsSectionProps {
  data: MortgageData;
  onInputChange: (field: keyof MortgageData, value: any) => void;
  onClosingCostChange: (field: keyof NonNullable<MortgageData['closingCosts']>, value: number) => void;
}

const ClosingCostsSection: React.FC<ClosingCostsSectionProps> = ({
  data,
  onInputChange,
  onClosingCostChange
}) => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
            <Home className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold font-heading text-slate-900">Closing Costs Analysis</h3>
            <p className="text-sm font-sans text-slate-600">Customize closing costs and fees for accurate calculations</p>
          </div>
        </div>
        
        <ClosingCostsToggle
          enabled={data.enableClosingCosts}
          onToggle={(enabled) => onInputChange('enableClosingCosts', enabled)}
        />
      </div>

      {data.enableClosingCosts && (
        <ClosingCostsFields
          data={data}
          onClosingCostChange={onClosingCostChange}
        />
      )}
    </div>
  );
};

export default ClosingCostsSection;