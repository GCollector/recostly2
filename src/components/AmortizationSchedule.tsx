import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface AmortizationData {
  year: number;
  principalPayment: number;
  interestPayment: number;
  balance: number;
  totalPayment: number;
  cumulativeInterest: number;
}

const AmortizationSchedule: React.FC = () => {
  const [homePrice, setHomePrice] = useState(500000);
  const [downPayment, setDownPayment] = useState(100000);
  const [interestRate, setInterestRate] = useState(5.25);
  const [amortizationYears, setAmortizationYears] = useState(25);
  const [schedule, setSchedule] = useState<AmortizationData[]>([]);
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');

  const calculateAmortization = () => {
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

    const yearlyData: AmortizationData[] = [];
    let remainingBalance = loanAmount;
    let cumulativeInterest = 0;

    for (let year = 1; year <= amortizationYears; year++) {
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

  useEffect(() => {
    calculateAmortization();
  }, [homePrice, downPayment, interestRate, amortizationYears]);

  const totalInterest = schedule.reduce((sum, year) => sum + year.interestPayment, 0);
  const totalPrincipal = schedule.reduce((sum, year) => sum + year.principalPayment, 0);

  return (
    <div className="p-6 space-y-8">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">Loan Details</h2>
          
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

          {/* Summary Cards */}
          <div className="space-y-3">
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
          </div>
        </div>

        {/* Visualization Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900">Amortization Schedule</h2>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('chart')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'chart' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Chart View
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'table' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Table View
              </button>
            </div>
          </div>

          {viewMode === 'chart' ? (
            <div className="space-y-8">
              {/* Balance Over Time */}
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Remaining Balance Over Time</h3>
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
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Annual Principal vs Interest Payments</h3>
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
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Year
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Principal
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Interest
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Payment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Balance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cumulative Interest
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {schedule.map((year) => (
                      <tr key={year.year} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {year.year}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${year.principalPayment.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${year.interestPayment.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${year.totalPayment.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${year.balance.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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

export default AmortizationSchedule;