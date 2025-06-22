import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ClosingCostsData } from '../pages/Calculator';

interface ClosingCostsFormProps {
  data: ClosingCostsData;
  onChange: (data: ClosingCostsData) => void;
  onNext: () => void;
}

const ClosingCostsForm: React.FC<ClosingCostsFormProps> = ({ data, onChange, onNext }) => {
  const handleChange = (field: keyof ClosingCostsData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="p-8 space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold font-heading text-slate-900">Closing Cost Calculator</h2>
        <p className="text-slate-600 font-sans">Calculate your estimated closing costs and fees</p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-slate-50 rounded-xl p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Home Purchase Price
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">$</span>
              <input
                type="number"
                value={data.homePrice}
                onChange={(e) => handleChange('homePrice', Number(e.target.value))}
                className="w-full pl-8 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="500,000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Location
            </label>
            <select
              value={data.location}
              onChange={(e) => handleChange('location', e.target.value as 'toronto' | 'vancouver')}
              className="w-full px-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="toronto">Toronto, Ontario</option>
              <option value="vancouver">Vancouver, BC</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              id="first-time-buyer-closing"
              type="checkbox"
              checked={data.isFirstTimeBuyer}
              onChange={(e) => handleChange('isFirstTimeBuyer', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
            />
            <label htmlFor="first-time-buyer-closing" className="ml-2 block text-sm text-slate-700">
              First-time homebuyer (eligible for rebates)
            </label>
          </div>
        </div>

        <div className="flex justify-center pt-6">
          <button
            onClick={onNext}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <span>Calculate Closing Costs</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClosingCostsForm;