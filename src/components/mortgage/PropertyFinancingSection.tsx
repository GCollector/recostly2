import React from 'react';
import { MortgageData } from '../../pages/Calculator';
import { calculateCMHCInsurance } from '../../utils/mortgageCalculations';
import CurrencyInput from '../shared/CurrencyInput';

interface PropertyFinancingSectionProps {
  data: MortgageData;
  onInputChange: (field: keyof MortgageData, value: any) => void;
  loanCalculation?: {
    baseLoanAmount: number;
    cmhcPremium: number;
    totalLoanAmount: number;
  };
}

const PropertyFinancingSection: React.FC<PropertyFinancingSectionProps> = ({
  data,
  onInputChange,
  loanCalculation
}) => {
  const downPaymentPercent = Math.round((data.downPayment / data.homePrice) * 100);
  const cmhcInsurance = calculateCMHCInsurance(data.homePrice, data.downPayment);

  return (
    <div>
      <h3 className="text-lg font-semibold font-heading text-slate-900 mb-6">Property & Financing</h3>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium font-sans text-slate-700 mb-2">
            Home Price
          </label>
          <CurrencyInput
            value={data.homePrice}
            onChange={(value) => onInputChange('homePrice', value)}
            prefix="$"
            placeholder="500,000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium font-sans text-slate-700 mb-2">
            Down Payment
          </label>
          <CurrencyInput
            value={data.downPayment}
            onChange={(value) => onInputChange('downPayment', value)}
            prefix="$"
            suffix={`${downPaymentPercent}%`}
            placeholder="100,000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium font-sans text-slate-700 mb-2">
            Interest Rate
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              value={data.interestRate}
              onChange={(e) => onInputChange('interestRate', Number(e.target.value))}
              className="w-full pr-8 pl-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-sans"
              placeholder="5.25"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500">%</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium font-sans text-slate-700 mb-2">
            Amortization Period
          </label>
          <select
            value={data.amortizationYears}
            onChange={(e) => onInputChange('amortizationYears', Number(e.target.value))}
            className="w-full px-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-sans"
          >
            {[15, 20, 25, 30].map(years => (
              <option key={years} value={years}>{years} years</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium font-sans text-slate-700 mb-2">
            Payment Frequency
          </label>
          <select
            value={data.paymentFrequency}
            onChange={(e) => onInputChange('paymentFrequency', e.target.value as 'monthly' | 'bi-weekly')}
            className="w-full px-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-sans"
          >
            <option value="monthly">Monthly</option>
            <option value="bi-weekly">Bi-weekly</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium font-sans text-slate-700 mb-2">
            Location
          </label>
          <select
            value={data.province === 'ontario' ? 'toronto' : 'vancouver'}
            onChange={(e) => {
              const value = e.target.value;
              if (value === 'toronto') {
                onInputChange('province', 'ontario');
                onInputChange('city', 'toronto');
              } else {
                onInputChange('province', 'bc');
                onInputChange('city', 'vancouver');
              }
            }}
            className="w-full px-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-sans"
          >
            <option value="toronto">Toronto, ON</option>
            <option value="vancouver">Vancouver, BC</option>
          </select>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center">
          <input
            id="first-time-buyer"
            type="checkbox"
            checked={data.isFirstTimeBuyer}
            onChange={(e) => onInputChange('isFirstTimeBuyer', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
          />
          <label htmlFor="first-time-buyer" className="ml-2 block text-sm font-sans text-slate-700">
            First-time homebuyer
          </label>
        </div>
      </div>

      {/* CMHC Insurance Information */}
      {cmhcInsurance.isRequired && (
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-amber-800 mb-2">CMHC Insurance Required</h4>
          <div className="text-sm text-amber-700 space-y-1">
            <p>Down payment is {downPaymentPercent}% (less than 20%), so CMHC insurance is required.</p>
            <p><strong>Insurance Premium:</strong> ${cmhcInsurance.premium.toLocaleString()} ({(cmhcInsurance.rate * 100).toFixed(1)}% of loan amount)</p>
            <p><strong>Base Loan Amount:</strong> ${loanCalculation?.baseLoanAmount.toLocaleString()}</p>
            <p><strong>Total Loan Amount:</strong> ${loanCalculation?.totalLoanAmount.toLocaleString()} (includes CMHC premium)</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyFinancingSection;