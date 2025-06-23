import React from 'react';
import { MortgageData } from '../../pages/Calculator';
import CurrencyInput from '../shared/CurrencyInput';

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
          <CurrencyInput
            value={data.monthlyRent || 0}
            onChange={(value) => onInputChange('monthlyRent', value)}
            prefix="$"
            placeholder="2,500"
          />
        </div>
      </div>

      <div>
        <h4 className="text-md font-semibold font-heading text-slate-900 mb-4">Monthly Operating Expenses</h4>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium font-sans text-slate-700 mb-2">
              Property Taxes
            </label>
            <CurrencyInput
              value={data.monthlyExpenses?.taxes || 0}
              onChange={(value) => onExpenseChange('taxes', value)}
              prefix="$"
              placeholder="400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium font-sans text-slate-700 mb-2">
              Insurance
            </label>
            <CurrencyInput
              value={data.monthlyExpenses?.insurance || 0}
              onChange={(value) => onExpenseChange('insurance', value)}
              prefix="$"
              placeholder="150"
            />
          </div>

          <div>
            <label className="block text-sm font-medium font-sans text-slate-700 mb-2">
              Condo Fees
            </label>
            <CurrencyInput
              value={data.monthlyExpenses?.condoFees || 0}
              onChange={(value) => onExpenseChange('condoFees', value)}
              prefix="$"
              placeholder="300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium font-sans text-slate-700 mb-2">
              Maintenance
            </label>
            <CurrencyInput
              value={data.monthlyExpenses?.maintenance || 0}
              onChange={(value) => onExpenseChange('maintenance', value)}
              prefix="$"
              placeholder="200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium font-sans text-slate-700 mb-2">
              Other Expenses
            </label>
            <CurrencyInput
              value={data.monthlyExpenses?.other || 0}
              onChange={(value) => onExpenseChange('other', value)}
              prefix="$"
              placeholder="100"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestmentFields;