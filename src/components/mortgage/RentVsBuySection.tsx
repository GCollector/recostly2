import React, { useState } from 'react';
import { Building } from 'lucide-react';
import { MortgageData } from '../../pages/Calculator';
import CurrencyInput from '../shared/CurrencyInput';

interface RentVsBuySectionProps {
  data: MortgageData;
  onInputChange: (field: keyof MortgageData, value: any) => void;
}

const RentVsBuySection: React.FC<RentVsBuySectionProps> = ({
  data,
  onInputChange
}) => {
  const [rentData, setRentData] = useState({
    monthlyRent: 2500,
    annualRentIncrease: 3,
    comparisonYears: 10
  });

  const handleRentDataChange = (field: string, value: number) => {
    setRentData(prev => ({ ...prev, [field]: value }));
    
    // Store rent vs buy data in the main data object
    onInputChange('rentVsBuyData' as any, { ...rentData, [field]: value });
  };

  const handleToggle = (enabled: boolean) => {
    onInputChange('enableRentVsBuy', enabled);
  };

  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-sm">
            <Building className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold font-heading text-slate-900">Rent vs Buy Analysis</h3>
            <p className="text-sm font-sans text-slate-600 mt-1">Compare the long-term costs of renting versus buying</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium text-slate-700">
            {data.enableRentVsBuy ? 'Enabled' : 'Enable'}
          </span>
          <button
            onClick={() => handleToggle(!data.enableRentVsBuy)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
              data.enableRentVsBuy ? 'bg-purple-600' : 'bg-slate-300'
            }`}
            role="switch"
            aria-checked={data.enableRentVsBuy}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                data.enableRentVsBuy ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {data.enableRentVsBuy && (
        <div className="space-y-6 mt-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium font-sans text-slate-700 mb-2">
                Monthly Rent
              </label>
              <CurrencyInput
                value={rentData.monthlyRent}
                onChange={(value) => handleRentDataChange('monthlyRent', value)}
                prefix="$"
                placeholder="2,500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium font-sans text-slate-700 mb-2">
                Annual Rent Increase
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={rentData.annualRentIncrease}
                  onChange={(e) => handleRentDataChange('annualRentIncrease', Number(e.target.value))}
                  className="w-full pr-8 pl-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-sans"
                  placeholder="3"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500">%</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium font-sans text-slate-700 mb-2">
                Comparison Period
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={rentData.comparisonYears}
                  onChange={(e) => handleRentDataChange('comparisonYears', Number(e.target.value))}
                  className="w-full pr-16 pl-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-sans"
                  placeholder="10"
                  min="1"
                  max="30"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500">years</span>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm border border-purple-300 rounded-lg p-4">
            <h4 className="font-medium text-purple-900 mb-2">Analysis Preview</h4>
            <p className="text-sm text-purple-800">
              Compare ${rentData.monthlyRent.toLocaleString()}/month rent with {rentData.annualRentIncrease}% annual increases 
              over {rentData.comparisonYears} years against buying this property.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RentVsBuySection;