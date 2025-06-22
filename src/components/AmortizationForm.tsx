import React from 'react';
import { ArrowRight } from 'lucide-react';
import { AmortizationData } from '../pages/Calculator';

interface AmortizationFormProps {
  data: AmortizationData;
  onChange: (data: AmortizationData) => void;
  onNext: () => void;
}

const AmortizationForm: React.FC<AmortizationFormProps> = ({ data, onChange, onNext }) => {
  const handleChange = (field: keyof AmortizationData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="p-8 space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold font-heading text-slate-900">Loan Details</h2>
        <p className="text-slate-600 font-sans">Enter your loan information to view the amortization schedule</p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-slate-50 rounded-xl p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Home Price
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">$</span>
              <input
                type="number"
                value={data.homePrice}
                onChange={(e) => handleChange('homePrice', Number(e.target.value))}
                className="w-full pl-8 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Down Payment
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">$</span>
              <input
                type="number"
                value={data.downPayment}
                onChange={(e) => handleChange('downPayment', Number(e.target.value))}
                className="w-full pl-8 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Interest Rate
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                value={data.interestRate}
                onChange={(e) => handleChange('interestRate', Number(e.target.value))}
                className="w-full pr-8 pl-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500">%</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Amortization Period
            </label>
            <select
              value={data.amortizationYears}
              onChange={(e) => handleChange('amortizationYears', Number(e.target.value))}
              className="w-full px-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {[15, 20, 25, 30].map(years => (
                <option key={years} value={years}>{years} years</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-center pt-6">
          <button
            onClick={onNext}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <span>Generate Schedule</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AmortizationForm;