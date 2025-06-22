import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { AmortizationData } from '../pages/Calculator';

interface AmortizationResultsProps {
  data: AmortizationData;
  onBack: () => void;
}

interface AmortizationScheduleData {
  year: number;
  principalPayment: number;
  interestPayment: number;
  balance: number;
  totalPayment: number;
  cumulativeInterest: number;
}

const AmortizationResults: React.FC<AmortizationResultsProps> = ({ data, onBack }) => {
  const [schedule, setSchedule] = useState<AmortizationScheduleData[]>([]);
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');

  useEffect(() => {
    calculateAmortization();
  }, [data]);

  const calculateAmortization = () => {
    const loanAmount = data.homePrice - data.downPayment;
    const monthlyRate = data.interestRate / 100 / 12;
    const totalPayments = data.amortizationYears * 12;
    
    let monthlyPayment = 0;
    if (monthlyRate > 0) {
      monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
                      (Math.pow(1 + monthlyRate, totalPayments) - 1);
    } else {
      monthlyPayment = loanAmount / totalPayments;
    }

    const yearlyData: AmortizationScheduleData[] = [];
    let remainingBalance = loanAmount;
    let cumulativeInterest = 0;

    for (let year = 1; year <= data.amortizationYears; year++) {
      let yearlyPrincipal = 0;
      let yearlyInterest = 0;

      for (let month = 1; month <= 12; month++) {
        const interestPayment = remainingBalance * monthlyRate;
        const principalPayment = monthlyPayment - interestPayment;
        
        yearlyInterest += interestPayment;
        yearlyPrincipal += principalPayment;
        remainingBalance -= principalPayment;
        cumulativeInterest += interestPayment;

        if (remainingBalance <= 0) {
          remainingBalance = 0;
          break;
        }
      }

      yearlyData.push({
        year,
        principalPayment: Math.round(yearlyPrincipal),
        interestPayment: Math.round(yearlyInterest),
        balance: Math.round(Math.max(0, remainingBalance)),
        totalPayment: Math.round(yearlyPrincipal + yearlyInterest),
        cumulativeInterest: Math.round(cumulativeInterest)
      });

      if (remainingBalance <= 0) break;
    }

    setSchedule(yearlyData);
  };

  const totalInterest = schedule.reduce((sum, year) => sum + year.interestPayment, 0);
  const totalPrincipal = schedule.reduce((sum, year) => sum + year.principalPayment, 0);

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
        <h2 className="text-2xl font-bold text-slate-900">Amortization Schedule</h2>
        <div className="w-24"></div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Summary Cards */}
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-lg font-semibold text-blue-900">
              ${totalPrincipal.toLocaleString()}
            </div>
            <div className="text-sm text-blue-700">Total Principal</div>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-lg font-semibold text-red-900">
              ${totalInterest.toLocaleString()}
            </div>
            <div className="text-sm text-red-700">Total Interest</div>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg">
            <div className="text-lg font-semibold text-slate-900">
              ${(totalPrincipal + totalInterest).toLocaleString()}
            </div>
            <div className="text-sm text-slate-600">Total Payments</div>
          </div>
        </div>

        {/* Visualization Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-slate-900">Payment Breakdown</h3>
            <div className="flex bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('chart')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'chart' 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Chart View
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'table' 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Table View
              </button>
            </div>
          </div>

          {viewMode === 'chart' ? (
            <div className="space-y-8">
              {/* Balance Over Time */}
              <div className="bg-white p-4 rounded-lg border border-slate-200">
                <h4 className="text-lg font-medium text-slate-900 mb-4">Remaining Balance Over Time</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={schedule}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Remaining Balance']} />
                    <Line 
                      type="monotone" 
                      dataKey="balance" 
                      stroke="#3B82F6" 
                      strokeWidth={3}
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Principal vs Interest */}
              <div className="bg-white p-4 rounded-lg border border-slate-200">
                <h4 className="text-lg font-medium text-slate-900 mb-4">Annual Principal vs Interest Payments</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={schedule}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value, name) => [
                      `$${Number(value).toLocaleString()}`, 
                      name === 'principalPayment' ? 'Principal' : 'Interest'
                    ]} />
                    <Legend />
                    <Bar dataKey="principalPayment" stackId="a" fill="#10B981" name="Principal" />
                    <Bar dataKey="interestPayment" stackId="a" fill="#EF4444" name="Interest" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Year
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Principal
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Interest
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Total Payment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Balance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Cumulative Interest
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {schedule.map((year) => (
                      <tr key={year.year} className="hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                          {year.year}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                          ${year.principalPayment.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                          ${year.interestPayment.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                          ${year.totalPayment.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                          ${year.balance.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                          ${year.cumulativeInterest.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AmortizationResults;