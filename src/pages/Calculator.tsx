import React, { useState } from 'react';
import MortgageCalculator from '../components/MortgageCalculator';
import ClosingCosts from '../components/ClosingCosts';
import AmortizationSchedule from '../components/AmortizationSchedule';
import InvestmentCalculator from '../components/InvestmentCalculator';
import { Calculator, Home, TrendingUp, FileText } from 'lucide-react';

const CalculatorPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'mortgage' | 'closing' | 'amortization' | 'investment'>('mortgage');
  
  const tabs = [
    { id: 'mortgage', name: 'Mortgage', icon: Calculator },
    { id: 'closing', name: 'Closing Costs', icon: Home },
    { id: 'amortization', name: 'Amortization', icon: FileText },
    { id: 'investment', name: 'Investment', icon: TrendingUp },
  ] as const;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Mortgage Calculator</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Professional tools for calculating mortgage payments, closing costs, amortization schedules, and investment metrics.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
        <nav className="flex space-x-1" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">{tab.name}</span>
                <span className="sm:hidden">{tab.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {activeTab === 'mortgage' && <MortgageCalculator />}
        {activeTab === 'closing' && <ClosingCosts />}
        {activeTab === 'amortization' && <AmortizationSchedule />}
        {activeTab === 'investment' && <InvestmentCalculator />}
      </div>
    </div>
  );
};

export default CalculatorPage;