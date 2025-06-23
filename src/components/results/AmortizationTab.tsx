import React from 'react';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, LineChart, Line } from 'recharts';
import NotesSection from '../shared/NotesSection';

interface AmortizationTabProps {
  loanAmount: number;
  totalInterest: number;
  amortizationYears: number;
  amortizationSchedule: Array<{
    year: number;
    principal: number;
    interest: number;
    balance: number;
    cumulativeInterest: number;
  }>;
  calculationId?: string;
  currentNotes?: Record<string, string>;
}

const AmortizationTab: React.FC<AmortizationTabProps> = ({
  loanAmount,
  totalInterest,
  amortizationYears,
  amortizationSchedule,
  calculationId,
  currentNotes = {}
}) => {
  const amortizationChartData = amortizationSchedule.map(year => ({
    year: `Year ${year.year}`,
    principal: year.principal,
    interest: year.interest,
    balance: year.balance
  }));

  const balanceChartData = amortizationSchedule.map(year => ({
    year: year.year,
    balance: year.balance
  }));

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-blue-50 p-6 rounded-xl">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              ${loanAmount.toLocaleString()}
            </div>
            <div className="text-sm text-blue-700">Total Principal</div>
            <div className="text-xs text-blue-600 mt-1">Amount borrowed</div>
          </div>
        </div>

        <div className="bg-red-50 p-6 rounded-xl">
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600 mb-2">
              ${Math.round(totalInterest).toLocaleString()}
            </div>
            <div className="text-sm text-red-700">Total Interest</div>
            <div className="text-xs text-red-600 mt-1">Over {amortizationYears} years</div>
          </div>
        </div>
      </div>

      {/* Premium Notes Section - Always visible for logged in users */}
      <NotesSection
        calculationId={calculationId || 'temp'}
        section="amortization"
        sectionTitle="Amortization"
        currentNotes={currentNotes.amortization}
      />

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Principal vs Interest Over Time */}
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Principal vs Interest Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={amortizationChartData.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value, name) => [
                `$${Number(value).toLocaleString()}`, 
                name === 'principal' ? 'Principal' : 'Interest'
              ]} />
              <Legend />
              <Bar dataKey="principal" stackId="a" fill="#10B981" name="Principal" />
              <Bar dataKey="interest" stackId="a" fill="#EF4444" name="Interest" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Remaining Balance */}
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Remaining Balance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={balanceChartData}>
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
      </div>
    </div>
  );
};

export default AmortizationTab;