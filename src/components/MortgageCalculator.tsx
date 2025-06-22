import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface CalculationResult {
  monthlyPayment: number;
  totalInterest: number;
  totalCost: number;
  loanAmount: number;
}

const MortgageCalculator: React.FC = () => {
  const { user } = useAuth();
  
  const [homePrice, setHomePrice] = useState(500000);
  const [downPayment, setDownPayment] = useState(100000);
  const [interestRate, setInterestRate] = useState(5.25);
  const [amortizationYears, setAmortizationYears] = useState(25);
  const [paymentFrequency, setPaymentFrequency] = useState<'monthly' | 'bi-weekly'>('monthly');
  const [province, setProvince] = useState<'ontario' | 'bc'>('ontario');
  const [city, setCity] = useState<'toronto' | 'vancouver'>('toronto');
  const [isFirstTimeBuyer, setIsFirstTimeBuyer] = useState(false);
  
  const [result, setResult] = useState<CalculationResult | null>(null);

  const calculateMortgage = () => {
    console.log('🧮 Starting mortgage calculation...');
    console.log('📊 Calculation inputs:', {
      homePrice,
      downPayment,
      interestRate,
      amortizationYears,
      paymentFrequency,
      province,
      city,
      isFirstTimeBuyer
    });

    const loanAmount = homePrice - downPayment;
    const monthlyRate = interestRate / 100 / 12;
    const totalPayments = amortizationYears * 12;
    
    let monthlyPayment = 0;
    if (monthlyRate > 0) {
      monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
                      (Math.pow(1 + monthlyRate, totalPayments) - 1);
    } else {
      monthlyPayment = loanAmount / totalPayments;
    }
    
    const totalCost = monthlyPayment * totalPayments + downPayment;
    const totalInterest = totalCost - homePrice;
    
    if (paymentFrequency === 'bi-weekly') {
      monthlyPayment = monthlyPayment / 2;
    }
    
    const calculatedResult = {
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
      totalInterest: Math.round(totalInterest * 100) / 100,
      totalCost: Math.round(totalCost * 100) / 100,
      loanAmount: Math.round(loanAmount * 100) / 100
    };

    console.log('✅ Calculation completed:', calculatedResult);
    setResult(calculatedResult);
  };

  useEffect(() => {
    calculateMortgage();
  }, [homePrice, downPayment, interestRate, amortizationYears, paymentFrequency]);

  const downPaymentPercent = Math.round((downPayment / homePrice) * 100);

  return (
    <div className="p-6 space-y-8">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">Mortgage Details</h2>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Home Price
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={homePrice}
                  onChange={(e) => setHomePrice(Number(e.target.value))}
                  className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="500,000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Down Payment
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={downPayment}
                  onChange={(e) => setDownPayment(Number(e.target.value))}
                  className="w-full pl-8 pr-16 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="100,000"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                  {downPaymentPercent}%
                </span>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interest Rate
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full pr-8 pl-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="5.25"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amortization Period
              </label>
              <select
                value={amortizationYears}
                onChange={(e) => setAmortizationYears(Number(e.target.value))}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {[15, 20, 25, 30].map(years => (
                  <option key={years} value={years}>{years} years</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Frequency
              </label>
              <select
                value={paymentFrequency}
                onChange={(e) => setPaymentFrequency(e.target.value as 'monthly' | 'bi-weekly')}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="monthly">Monthly</option>
                <option value="bi-weekly">Bi-weekly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <select
                value={province === 'ontario' ? 'toronto' : 'vancouver'}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === 'toronto') {
                    setProvince('ontario');
                    setCity('toronto');
                  } else {
                    setProvince('bc');
                    setCity('vancouver');
                  }
                }}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              checked={isFirstTimeBuyer}
              onChange={(e) => setIsFirstTimeBuyer(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="first-time-buyer" className="ml-2 block text-sm text-gray-700">
              First-time homebuyer
            </label>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">Payment Breakdown</h2>
          
          {result && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-6 rounded-lg">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    ${result.monthlyPayment.toLocaleString()}
                  </div>
                  <div className="text-sm text-blue-700">
                    {paymentFrequency === 'monthly' ? 'Monthly' : 'Bi-weekly'} Payment
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-lg font-semibold text-gray-900">
                    ${result.loanAmount.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Loan Amount</div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-lg font-semibold text-gray-900">
                    ${result.totalInterest.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Total Interest</div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-lg font-semibold text-gray-900">
                  ${result.totalCost.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Cost of Home</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MortgageCalculator;