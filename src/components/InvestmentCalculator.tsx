import React, { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';

interface InvestmentResult {
  capRate: number;
  cashFlow: number;
  roi: number;
  breakEvenRent: number;
  totalMonthlyExpenses: number;
  netOperatingIncome: number;
}

const InvestmentCalculator: React.FC = () => {
  const [purchasePrice, setPurchasePrice] = useState(500000);
  const [downPayment, setDownPayment] = useState(100000);
  const [monthlyRent, setMonthlyRent] = useState(2500);
  const [monthlyExpenses, setMonthlyExpenses] = useState({
    taxes: 400,
    insurance: 150,
    condoFees: 300,
    maintenance: 200,
    other: 100
  });
  const [interestRate, setInterestRate] = useState(5.25);
  const [result, setResult] = useState<InvestmentResult | null>(null);

  const calculateInvestment = () => {
    const loanAmount = purchasePrice - downPayment;
    const monthlyRate = interestRate / 100 / 12;
    const totalPayments = 25 * 12; // 25 year amortization
    
    // Calculate monthly mortgage payment
    let monthlyMortgage = 0;
    if (monthlyRate > 0) {
      monthlyMortgage = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
                      (Math.pow(1 + monthlyRate, totalPayments) - 1);
    } else {
      monthlyMortgage = loanAmount / totalPayments;
    }

    const totalExpenses = Object.values(monthlyExpenses).reduce((sum, expense) => sum + expense, 0);
    const totalMonthlyExpenses = totalExpenses + monthlyMortgage;
    const monthlyCashFlow = monthlyRent - totalMonthlyExpenses;
    const annualCashFlow = monthlyCashFlow * 12;
    
    // Net Operating Income (before mortgage payments)
    const netOperatingIncome = (monthlyRent - totalExpenses) * 12;
    
    // Cap Rate = Net Operating Income / Property Value
    const capRate = (netOperatingIncome / purchasePrice) * 100;
    
    // ROI = Annual Cash Flow / Down Payment
    const roi = (annualCashFlow / downPayment) * 100;
    
    // Break-even rent
    const breakEvenRent = totalMonthlyExpenses;

    setResult({
      capRate: Math.round(capRate * 100) / 100,
      cashFlow: Math.round(monthlyCashFlow),
      roi: Math.round(roi * 100) / 100,
      breakEvenRent: Math.round(breakEvenRent),
      totalMonthlyExpenses: Math.round(totalMonthlyExpenses),
      netOperatingIncome: Math.round(netOperatingIncome)
    });
  };

  useEffect(() => {
    calculateInvestment();
  }, [purchasePrice, downPayment, monthlyRent, monthlyExpenses, interestRate]);

  const updateExpense = (key: keyof typeof monthlyExpenses, value: number) => {
    setMonthlyExpenses(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const isNegativeCashFlow = result && result.cashFlow < 0;
  const isLowCapRate = result && result.capRate < 6;

  return (
    <div className="p-6 space-y-8">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">Investment Property Analysis</h2>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Purchase Price
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(Number(e.target.value))}
                  className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Rent
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={monthlyRent}
                  onChange={(e) => setMonthlyRent(Number(e.target.value))}
                  className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

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
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Expenses</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Taxes
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={monthlyExpenses.taxes}
                    onChange={(e) => updateExpense('taxes', Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Insurance
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={monthlyExpenses.insurance}
                    onChange={(e) => updateExpense('insurance', Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Condo Fees
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={monthlyExpenses.condoFees}
                    onChange={(e) => updateExpense('condoFees', Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maintenance
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={monthlyExpenses.maintenance}
                    onChange={(e) => updateExpense('maintenance', Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Other Expenses
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={monthlyExpenses.other}
                    onChange={(e) => updateExpense('other', Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Property management, utilities, etc."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">Investment Analysis</h2>
          
          {result && (
            <div className="space-y-4">
              {/* Warnings */}
              {(isNegativeCashFlow || isLowCapRate) && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div className="text-sm text-amber-800">
                      <p className="font-medium mb-1">Investment Warnings:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {isNegativeCashFlow && (
                          <li>Negative cash flow - property expenses exceed rental income</li>
                        )}
                        {isLowCapRate && (
                          <li>Low cap rate (under 6%) - property may not generate adequate returns</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg ${result.cashFlow >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                  <div className="flex items-center mb-2">
                    <DollarSign className={`h-5 w-5 mr-2 ${result.cashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                    <span className="text-sm font-medium text-gray-700">Monthly Cash Flow</span>
                  </div>
                  <div className={`text-2xl font-bold ${result.cashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${result.cashFlow.toLocaleString()}
                  </div>
                </div>

                <div className={`p-4 rounded-lg ${result.capRate >= 6 ? 'bg-green-50' : 'bg-yellow-50'}`}>
                  <div className="flex items-center mb-2">
                    <TrendingUp className={`h-5 w-5 mr-2 ${result.capRate >= 6 ? 'text-green-600' : 'text-yellow-600'}`} />
                    <span className="text-sm font-medium text-gray-700">Cap Rate</span>
                  </div>
                  <div className={`text-2xl font-bold ${result.capRate >= 6 ? 'text-green-600' : 'text-yellow-600'}`}>
                    {result.capRate}%
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-blue-700 mb-2">Return on Investment (ROI)</div>
                <div className="text-2xl font-bold text-blue-600">
                  {result.roi}%
                </div>
                <div className="text-sm text-blue-600 mt-1">
                  Annual cash flow: ${(result.cashFlow * 12).toLocaleString()}
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <h3 className="font-medium text-gray-900">Financial Breakdown</h3>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Monthly Rental Income</span>
                  <span className="font-medium text-gray-900">
                    ${monthlyRent.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Monthly Expenses</span>
                  <span className="font-medium text-gray-900">
                    ${result.totalMonthlyExpenses.toLocaleString()}
                  </span>
                </div>

                <div className="border-t border-gray-300 pt-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Net Operating Income (Annual)</span>
                    <span className="font-medium text-gray-900">
                      ${result.netOperatingIncome.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Break-even Rent</span>
                  <span className="font-medium text-gray-900">
                    ${result.breakEvenRent.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Investment Tips */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Investment Tips</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Consider vacancy rates (typically 5-10% of annual rent)</li>
                  <li>• Factor in potential rent increases over time</li>
                  <li>• Account for major repairs and capital improvements</li>
                  <li>• Research local rental market trends and regulations</li>
                  <li>• Consider property management costs if needed</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvestmentCalculator;