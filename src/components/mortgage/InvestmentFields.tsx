import React from 'react';
import { MortgageData } from '../../pages/Calculator';

interface InvestmentFieldsProps {
  data: MortgageData;
  onInputChange: (field: keyof MortgageData, value: any) => void;
  onExpenseChange: (field: keyof NonNullable<MortgageData['monthlyExpenses']>, value: number) => void;
}

const InvestmentFields: React.FC<InvestmentFieldsProps> = ({
  data,
  onInputChange,
  onExpenseChange
}) => {
  return (
    <div className="space-y-6 mt-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium font-sans text-slate-700 mb-2">
            Expected Monthly Rent
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">$</span>
            <input
              type="number"
              value={data.monthlyRent}
              onChange={(e) => onInputChange('monthlyRent', Number(e.target.value))}
              className="w-full pl-8 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-sans bg-white"
              placeholder="2,500"
            />
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-md font-semibold font-heading text-slate-900 mb-4">Monthly Operating Expenses</h4>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium font-sans text-slate-700 mb-2">
              Property Taxes
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">$</span>
              <input
                type="number"
                value={data.monthlyExpenses?.taxes}
                onChange={(e) => onExpenseChange('taxes', Number(e.target.value))}
                className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-sans bg-white"
                placeholder="400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium font-sans text-slate-700 mb-2">
              Insurance
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">$</span>
              <input
                type="number"
                value={data.monthlyExpenses?.insurance}
                onChange={(e) => onExpenseChange('insurance', Number(e.target.value))}
                className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-sans bg-white"
                placeholder="150"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium font-sans text-slate-700 mb-2">
              Condo Fees
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">$</span>
              <input
                type="number"
                value={data.monthlyExpenses?.condoFees}
                onChange={(e) => onExpenseChange('condoFees', Number(e.target.value))}
                className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-sans bg-white"
                placeholder="300"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium font-sans text-slate-700 mb-2">
              Maintenance
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">$</span>
              <input
                type="number"
                value={data.monthlyExpenses?.maintenance}
                onChange={(e) => onExpenseChange('maintenance', Number(e.target.value))}
                className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-sans bg-white"
                placeholder="200"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium font-sans text-slate-700 mb-2">
              Other Expenses
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">$</span>
              <input
                type="number"
                value={data.monthlyExpenses?.other}
                onChange={(e) => onExpenseChange('other', Number(e.target.value))}
                className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-sans bg-white"
                placeholder="100"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestmentFields;