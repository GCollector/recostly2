import React from 'react';
import { MortgageData } from '../../pages/Calculator';

interface InvestmentAnalysisTabProps {
  data: MortgageData;
  investmentMetrics: {
    monthlyCashFlow: number;
    capRate: number;
    roi: number;
    breakEvenRent: number;
    totalMonthlyExpenses: number;
    netOperatingIncome: number;
  } | null;
}

const InvestmentAnalysisTab: React.FC<InvestmentAnalysisTabProps> = ({ data, investmentMetrics }) => {
  if (!investmentMetrics) return null;

  return (
    <div className="space-y-8">
      {/* Investment Summary Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className={`p-6 rounded-xl ${investmentMetrics.monthlyCashFlow >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className="text-center">
            <div className={`text-3xl font-bold mb-2 ${investmentMetrics.monthlyCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${investmentMetrics.monthlyCashFlow.toLocaleString()}
            </div>
            <div className={`text-sm ${investmentMetrics.monthlyCashFlow >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              Monthly Cash Flow
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl ${investmentMetrics.capRate >= 6 ? 'bg-green-50' : 'bg-yellow-50'}`}>
          <div className="text-center">
            <div className={`text-3xl font-bold mb-2 ${investmentMetrics.capRate >= 6 ? 'text-green-600' : 'text-yellow-600'}`}>
              {investmentMetrics.capRate}%
            </div>
            <div className={`text-sm ${investmentMetrics.capRate >= 6 ? 'text-green-700' : 'text-yellow-700'}`}>
              Cap Rate
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-6 rounded-xl">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {investmentMetrics.roi}%
            </div>
            <div className="text-sm text-blue-700">ROI</div>
            <div className="text-xs text-blue-600 mt-1">
              Annual: ${(investmentMetrics.monthlyCashFlow * 12).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Investment Analysis */}
      <div className="bg-white p-6 rounded-xl border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Financial Breakdown</h3>
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Monthly Rental Income</span>
            <span className="font-medium text-slate-900">
              ${data.monthlyRent?.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Total Monthly Expenses</span>
            <span className="font-medium text-slate-900">
              ${investmentMetrics.totalMonthlyExpenses.toLocaleString()}
            </span>
          </div>

          <div className="border-t border-slate-200 pt-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Net Operating Income (Annual)</span>
              <span className="font-medium text-slate-900">
                ${investmentMetrics.netOperatingIncome.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Break-even Rent</span>
            <span className="font-medium text-slate-900">
              ${investmentMetrics.breakEvenRent.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Investment Warnings */}
      {(investmentMetrics.monthlyCashFlow < 0 || investmentMetrics.capRate < 6) && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg">
          <h4 className="font-medium mb-2">Investment Warnings:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            {investmentMetrics.monthlyCashFlow < 0 && (
              <li>Negative cash flow - property expenses exceed rental income</li>
            )}
            {investmentMetrics.capRate < 6 && (
              <li>Low cap rate (under 6%) - property may not generate adequate returns</li>
            )}
          </ul>
        </div>
      )}

      {/* Investment Tips */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Investment Tips</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Consider vacancy rates (typically 5-10% of annual rent)</li>
          <li>• Factor in potential rent increases over time</li>
          <li>• Account for major repairs and capital improvements</li>
          <li>• Research local rental market trends and regulations</li>
          <li>• Consider property management costs if needed</li>
        </ul>
      </div>
    </div>
  );
};

export default InvestmentAnalysisTab;