import React from 'react';
import { Calculator } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, CartesianGrid, XAxis, YAxis } from 'recharts';
import { MortgageData } from '../../pages/Calculator';
import NotesSection from '../shared/NotesSection';

interface MortgageSummaryTabProps {
  data: MortgageData;
  monthlyPayment: number;
  loanAmount: number;
  totalInterest: number;
  totalCost: number;
  downPaymentPercent: number;
  calculationId?: string;
  currentNotes?: Record<string, string>;
  readonly?: boolean; // New prop for shared pages
}

const MortgageSummaryTab: React.FC<MortgageSummaryTabProps> = ({
  data,
  monthlyPayment,
  loanAmount,
  totalInterest,
  totalCost,
  downPaymentPercent,
  calculationId,
  currentNotes = {},
  readonly = false
}) => {
  // Chart data
  const pieChartData = [
    { 
      name: 'Down Payment', 
      value: data.downPayment, 
      color: '#10B981'
    },
    { 
      name: 'Principal', 
      value: loanAmount, 
      color: '#3B82F6'
    },
    { 
      name: 'Interest', 
      value: totalInterest, 
      color: '#EF4444'
    }
  ];

  const interestVsPrincipalData = [
    { 
      name: 'Interest vs Principal',
      interest: totalInterest, 
      principal: loanAmount 
    }
  ];

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="600"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="space-y-8">
      {/* Featured Monthly Payment + Supporting Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Featured Monthly Payment Card */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl border-2 border-blue-200 shadow-lg">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <Calculator className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-3">
                ${Math.round(monthlyPayment).toLocaleString()}
              </div>
              <div className="text-lg font-semibold text-blue-700 mb-2">
                Monthly Payment
              </div>
              <div className="text-sm text-blue-600">
                {data.interestRate}% • {data.amortizationYears} years
              </div>
            </div>
          </div>
        </div>

        {/* Supporting Information Cards */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900 mb-2">
                ${loanAmount.toLocaleString()}
              </div>
              <div className="text-sm font-medium text-slate-600 mb-1">Loan Amount</div>
              <div className="text-xs text-slate-500">
                {100 - downPaymentPercent}% of home price
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900 mb-2">
                ${data.downPayment.toLocaleString()}
              </div>
              <div className="text-sm font-medium text-slate-600 mb-1">Down Payment</div>
              <div className="text-xs text-slate-500">
                {downPaymentPercent}% down
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900 mb-2">
                ${Math.round(totalInterest).toLocaleString()}
              </div>
              <div className="text-sm font-medium text-slate-600 mb-1">Total Interest</div>
              <div className="text-xs text-slate-500">
                Over {data.amortizationYears} years
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900 mb-2">
                ${Math.round(totalCost).toLocaleString()}
              </div>
              <div className="text-sm font-medium text-slate-600 mb-1">Total Cost</div>
              <div className="text-xs text-slate-500">
                Including all interest
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Notes Section */}
      {!readonly && (
        <NotesSection
          calculationId={calculationId || 'temp'}
          section="mortgage"
          sectionTitle="Mortgage Summary"
          currentNotes={currentNotes.mortgage}
        />
      )}

      {/* Readonly Notes Section for shared pages */}
      {readonly && currentNotes.mortgage && (
        <NotesSection
          calculationId={calculationId || ''}
          section="mortgage"
          sectionTitle="Mortgage Summary"
          currentNotes={currentNotes.mortgage}
          readonly={true}
        />
      )}

      {/* Property Summary */}
      <div className="bg-white p-6 rounded-xl border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Property Summary</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-slate-600">Purchase Price:</span>
            <div className="font-semibold text-slate-900">${data.homePrice.toLocaleString()}</div>
          </div>
          <div>
            <span className="text-slate-600">Down Payment:</span>
            <div className="font-semibold text-slate-900">${data.downPayment.toLocaleString()} ({downPaymentPercent}% down)</div>
          </div>
          <div>
            <span className="text-slate-600">Interest Rate:</span>
            <div className="font-semibold text-slate-900">{data.interestRate}%</div>
          </div>
          <div>
            <span className="text-slate-600">Amortization:</span>
            <div className="font-semibold text-slate-900">{data.amortizationYears} years</div>
          </div>
          <div>
            <span className="text-slate-600">Location:</span>
            <div className="font-semibold text-slate-900">
              {data.city === 'toronto' ? 'Toronto, ON' : 'Vancouver, BC'}
            </div>
          </div>
          <div>
            <span className="text-slate-600">Payment Frequency:</span>
            <div className="font-semibold text-slate-900 capitalize">{data.paymentFrequency}</div>
          </div>
          {data.isFirstTimeBuyer && (
            <div className="md:col-span-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                ✓ First-time homebuyer benefits applied
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Total Cost Breakdown */}
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Total Cost Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Legend below chart */}
          <div className="flex justify-center items-center space-x-6 mt-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              <span className="text-sm text-slate-600">Down Payment</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-slate-600">Principal</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm text-slate-600">Interest</span>
            </div>
          </div>
        </div>

        {/* Interest vs Principal */}
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Interest vs Principal</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={interestVsPrincipalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value, name) => [
                `$${Number(value).toLocaleString()}`, 
                name === 'interest' ? 'Total Interest' : 'Principal Amount'
              ]} />
              <Bar dataKey="principal" fill="#3B82F6" name="Principal" />
              <Bar dataKey="interest" fill="#EF4444" name="Interest" />
            </BarChart>
          </ResponsiveContainer>
          
          {/* Interest percentage display */}
          <div className="mt-4 text-center">
            <p className="text-sm text-slate-600">
              Interest represents <span className="font-semibold text-slate-900">
                {Math.round((totalInterest / (totalInterest + loanAmount)) * 100)}%
              </span> of your total payments
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MortgageSummaryTab;