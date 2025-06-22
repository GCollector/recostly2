import React from 'react';
import { ArrowRight } from 'lucide-react';
import { InvestmentData } from '../pages/Calculator';

interface InvestmentFormProps {
  data: InvestmentData;
  onChange: (data: InvestmentData) => void;
  onNext: () => void;
}

const InvestmentForm: React.FC<InvestmentFormProps> = ({ data, onChange, onNext }) => {
  const handleChange = (field: keyof InvestmentData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const handleExpenseChange = (field: keyof InvestmentData['monthlyExpenses'], value: number) => {
    onChange({
      ...data,
      monthlyExpenses: {
        ...data.monthlyExpenses,
        [field]: value
      }
    });
  };

  return (
    <div className="p-8 space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold font-heading text-slate-900">Investment Property Analysis</h2>
        <p className="text-slate-600 font-sans">Enter your investment property details</p>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-slate-50 rounded-xl p-6 space-y-6">
          <h3 className="text-lg font-semibold text-slate-900 font-heading">Property Details</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Purchase Price
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">$</span>
                <input
                  type="number"
                  value={data.purchasePrice}
                  onChange={(e) => handleChange('purchasePrice', Number(e.target.value))}
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
                Monthly Rent
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">$</span>
                <input
                  type="number"
                  value={data.monthlyRent}
                  onChange={(e) => handleChange('monthlyRent', Number(e.target.value))}
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
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl p-6 space-y-6">
          <h3 className="text-lg font-semibold text-slate-900 font-heading">Monthly Expenses</h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Property Taxes
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">$</span>
                <input
                  type="number"
                  value={data.monthlyExpenses.taxes}
                  onChange={(e) => handleExpenseChange('taxes', Number(e.target.value))}
                  className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Insurance
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">$</span>
                <input
                  type="number"
                  value={data.monthlyExpenses.insurance}
                  onChange={(e) => handleExpenseChange('insurance', Number(e.target.value))}
                  className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Condo Fees
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">$</span>
                <input
                  type="number"
                  value={data.monthlyExpenses.condoFees}
                  onChange={(e) => handleExpenseChange('condoFees', Number(e.target.value))}
                  className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Maintenance
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">$</span>
                <input
                  type="number"
                  value={data.monthlyExpenses.maintenance}
                  onChange={(e) => handleExpenseChange('maintenance', Number(e.target.value))}
                  className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Other Expenses
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">$</span>
                <input
                  type="number"
                  value={data.monthlyExpenses.other}
                  onChange={(e) => handleExpenseChange('other', Number(e.target.value))}
                  className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center pt-6">
          <button
            onClick={onNext}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <span>Analyze Investment</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvestmentForm;