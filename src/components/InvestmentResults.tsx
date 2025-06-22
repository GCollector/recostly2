import React, { useState, useEffect } from 'react';
import { ArrowLeft, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';
import { InvestmentData } from '../pages/Calculator';

interface InvestmentResultsProps {
  data: InvestmentData;
  onBack: () => void;
}

interface InvestmentResult {
  capRate: number;
  cashFlow: number;
  roi: number;
  breakEvenRent: number;
  totalMonthlyExpenses: number;
  netOperatingIncome: number;
}

const InvestmentResults: React.FC<InvestmentResultsProps> = ({ data, onBack }) => {
  const [result, setResult] = useState<InvestmentResult | null>(null);

  useEffect(() => {
    calculateInvestment();
  }, [data]);

  const calculateInvestment = () => {
    const loanAmount = data.purchasePrice - data.downPayment;
    const monthlyRate = data.interestRate / 100 / 12;
    const totalPayments = 25 * 12; // 25 year amortization
    
    // Calculate monthly mortgage payment
    let monthlyMortgage = 0;
    if (monthlyRate > 0) {
      monthlyMortgage = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
                      (Math.pow(1 + monthlyRate, totalPayments) - 1);
    } else {
      monthlyMortgage = loanAmount / totalPayments;
    }

    const totalExpenses = Object.values(data.monthlyExpenses).reduce((sum, expense) => sum + expense, 0);
    const totalMonthlyExpenses = totalExpenses + monthlyMortgage;
    const monthlyCashFlow = data.monthlyRent - totalMonthlyExpenses;
    const annualCashFlow = monthlyCashFlow * 12;
    
    // Net Operating Income (before mortgage payments)
    const netOperatingIncome = (data.monthlyRent - totalExpenses) * 12;
    
    // Cap Rate = Net Operating Income / Property Value
    const capRate = (netOperatingIncome / data.purchasePrice) * 100;
    
    // ROI = Annual Cash Flow / Down Payment
    const roi = (annualCashFlow / data.downPayment) * 100;
    
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

  if (!result) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-slate-600">Analyzing investment...</p>
      </div>
    );
  }

  const isNegativeCashFlow = result.cashFlow < 0;
  const isLowCapRate = result.capRate < 6;

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Form</span>
        </button>
        <h2 className="text-2xl font-bold text-slate-900">Investment Analysis</h2>
        <div className="w-24"></div>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
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
        <div className="grid md:grid-cols-2 gap-6">
          <div className={`p-6 rounded-lg ${result.cashFlow >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
            <div className="flex items-center mb-2">
              <DollarSign className={`h-6 w-6 mr-3 ${result.cashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              <span className="text-lg font-medium text-slate-700">Monthly Cash Flow</span>
            </div>
            <div className={`text-3xl font-bold ${result.cashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${result.cashFlow.toLocaleString()}
            </div>
          </div>

          <div className={`p-6 rounded-lg ${result.capRate >= 6 ? 'bg-green-50' : 'bg-yellow-50'}`}>
            <div className="flex items-center mb-2">
              <TrendingUp className={`h-6 w-6 mr-3 ${result.capRate >= 6 ? 'text-green-600' : 'text-yellow-600'}`} />
              <span className="text-lg font-medium text-slate-700">Cap Rate</span>
            </div>
            <div className={`text-3xl font-bold ${result.capRate >= 6 ? 'text-green-600' : 'text-yellow-600'}`}>
              {result.capRate}%
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-6 rounded-lg">
          <div className="text-lg font-medium text-blue-700 mb-2">Return on Investment (ROI)</div>
          <div className="text-3xl font-bold text-blue-600">
            {result.roi}%
          </div>
          <div className="text-sm text-blue-600 mt-1">
            Annual cash flow: ${(result.cashFlow * 12).toLocaleString()}
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="bg-slate-50 p-6 rounded-lg space-y-4">
          <h3 className="text-lg font-medium text-slate-900">Financial Breakdown</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Monthly Rental Income</span>
                <span className="font-medium text-slate-900">
                  ${data.monthlyRent.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Total Monthly Expenses</span>
                <span className="font-medium text-slate-900">
                  ${result.totalMonthlyExpenses.toLocaleString()}
                </span>
              </div>

              <div className="border-t border-slate-300 pt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Net Operating Income (Annual)</span>
                  <span className="font-medium text-slate-900">
                    ${result.netOperatingIncome.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Break-even Rent</span>
                <span className="font-medium text-slate-900">
                  ${result.breakEvenRent.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Purchase Price</span>
                <span className="font-medium text-slate-900">
                  ${data.purchasePrice.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Down Payment</span>
                <span className="font-medium text-slate-900">
                  ${data.downPayment.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Investment Tips */}
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-blue-900 mb-3">Investment Tips</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• Consider vacancy rates (typically 5-10% of annual rent)</li>
            <li>• Factor in potential rent increases over time</li>
            <li>• Account for major repairs and capital improvements</li>
            <li>• Research local rental market trends and regulations</li>
            <li>• Consider property management costs if needed</li>
            <li>• Evaluate the neighborhood's growth potential</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default InvestmentResults;