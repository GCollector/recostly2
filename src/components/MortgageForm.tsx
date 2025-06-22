import React from 'react';
import { ArrowRight, TrendingUp, ToggleLeft, ToggleRight } from 'lucide-react';
import { MortgageData } from '../pages/Calculator';

interface MortgageFormProps {
  data: MortgageData;
  onChange: (data: MortgageData) => void;
  onNext: () => void;
}

const MortgageForm: React.FC<MortgageFormProps> = ({ data, onChange, onNext }) => {
  const handleChange = (field: keyof MortgageData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const handleExpenseChange = (field: keyof NonNullable<MortgageData['monthlyExpenses']>, value: number) => {
    onChange({
      ...data,
      monthlyExpenses: {
        ...data.monthlyExpenses!,
        [field]: value
      }
    });
  };

  const downPaymentPercent = Math.round((data.downPayment / data.homePrice) * 100);

  return (
    <div className="p-8 space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold font-heading text-slate-900">Mortgage Details</h2>
        <p className="text-slate-600 font-sans">Enter your property and financing information</p>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Basic Mortgage Information */}
        <div className="bg-slate-50 rounded-xl p-6 space-y-6">
          <h3 className="text-lg font-semibold text-slate-900 font-heading">Property & Financing</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
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
                  placeholder="500,000"
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
                  className="w-full pl-8 pr-16 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="100,000"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-slate-500">
                  {downPaymentPercent}%
                </span>
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
                  placeholder="5.25"
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

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Payment Frequency
              </label>
              <select
                value={data.paymentFrequency}
                onChange={(e) => handleChange('paymentFrequency', e.target.value as 'monthly' | 'bi-weekly')}
                className="w-full px-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="monthly">Monthly</option>
                <option value="bi-weekly">Bi-weekly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Location
              </label>
              <select
                value={data.province === 'ontario' ? 'toronto' : 'vancouver'}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === 'toronto') {
                    handleChange('province', 'ontario');
                    handleChange('city', 'toronto');
                  } else {
                    handleChange('province', 'bc');
                    handleChange('city', 'vancouver');
                  }
                }}
                className="w-full px-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="toronto">Toronto, ON</option>
                <option value="vancouver">Vancouver, BC</option>
              </select>
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="first-time-buyer"
              type="checkbox"
              checked={data.isFirstTimeBuyer}
              onChange={(e) => handleChange('isFirstTimeBuyer', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
            />
            <label htmlFor="first-time-buyer" className="ml-2 block text-sm text-slate-700">
              First-time homebuyer
            </label>
          </div>
        </div>

        {/* Investment Analysis Toggle */}
        <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl p-6 border border-emerald-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 font-heading">Investment Property Analysis</h3>
                <p className="text-sm text-slate-600">Turn your home purchase into a profitable investment opportunity</p>
              </div>
            </div>
            <button
              onClick={() => handleChange('enableInvestmentAnalysis', !data.enableInvestmentAnalysis)}
              className="flex items-center space-x-2 text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              {data.enableInvestmentAnalysis ? (
                <ToggleRight className="h-8 w-8" />
              ) : (
                <ToggleLeft className="h-8 w-8" />
              )}
              <span className="text-sm font-medium">
                {data.enableInvestmentAnalysis ? 'Enabled' : 'Enable'}
              </span>
            </button>
          </div>

          {data.enableInvestmentAnalysis && (
            <div className="space-y-6 pt-4 border-t border-emerald-200">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Expected Monthly Rent
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">$</span>
                    <input
                      type="number"
                      value={data.monthlyRent}
                      onChange={(e) => handleChange('monthlyRent', Number(e.target.value))}
                      className="w-full pl-8 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="2,500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-md font-medium text-slate-900 mb-4">Monthly Operating Expenses</h4>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Property Taxes
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">$</span>
                      <input
                        type="number"
                        value={data.monthlyExpenses?.taxes}
                        onChange={(e) => handleExpenseChange('taxes', Number(e.target.value))}
                        className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="400"
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
                        value={data.monthlyExpenses?.insurance}
                        onChange={(e) => handleExpenseChange('insurance', Number(e.target.value))}
                        className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="150"
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
                        value={data.monthlyExpenses?.condoFees}
                        onChange={(e) => handleExpenseChange('condoFees', Number(e.target.value))}
                        className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="300"
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
                        value={data.monthlyExpenses?.maintenance}
                        onChange={(e) => handleExpenseChange('maintenance', Number(e.target.value))}
                        className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="200"
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
                        value={data.monthlyExpenses?.other}
                        onChange={(e) => handleExpenseChange('other', Number(e.target.value))}
                        className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="100"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Next Button */}
        <div className="flex justify-center pt-6">
          <button
            onClick={onNext}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <span>Calculate Results</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MortgageForm;