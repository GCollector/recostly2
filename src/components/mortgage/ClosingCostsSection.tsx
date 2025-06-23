import React from 'react';
import { Home } from 'lucide-react';
import { MortgageData } from '../../pages/Calculator';
import { useAuth } from '../../contexts/AuthContext';
import ClosingCostsToggle from './ClosingCostsToggle';
import ClosingCostsFields from './ClosingCostsFields';
import ClosingCostPresets from '../premium/ClosingCostPresets';
import { ClosingCostPreset } from '../../types/premium';

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
  const { user } = useAuth();

  const handlePresetSelected = (preset: ClosingCostPreset) => {
    // Apply all preset values to the closing costs
    onClosingCostChange('landTransferTax', preset.landTransferTax);
    onClosingCostChange('additionalTax', preset.additionalTax);
    onClosingCostChange('legalFees', preset.legalFees);
    onClosingCostChange('titleInsurance', preset.titleInsurance);
    onClosingCostChange('homeInspection', preset.homeInspection);
    onClosingCostChange('appraisal', preset.appraisal);
    onClosingCostChange('surveyFee', preset.surveyFee);
    onClosingCostChange('firstTimeBuyerRebate', preset.firstTimeBuyerRebate);
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-sm">
            <Home className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold font-heading text-slate-900">Closing Costs Analysis</h3>
            <p className="text-sm font-sans text-slate-600 mt-1">Customize closing costs and fees for accurate calculations</p>
          </div>
        </div>
        
        <ClosingCostsToggle
          enabled={data.enableClosingCosts}
          onToggle={(enabled) => onInputChange('enableClosingCosts', enabled)}
        />
      </div>

      {data.enableClosingCosts && (
        <div className="space-y-6">
          {/* Premium Preset Selector */}
          {user?.tier === 'premium' && (
            <ClosingCostPresets
              onPresetSelected={handlePresetSelected}
              showSelector={true}
            />
          )}

          <ClosingCostsFields
            data={data}
            onClosingCostChange={onClosingCostChange}
          />
        </div>
      )}
    </div>
  );
};

export default ClosingCostsSection;