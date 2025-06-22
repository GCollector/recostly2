import React, { useState } from 'react';
import { Calculator as CalculatorIcon } from 'lucide-react';
import MortgageCalculator from '../components/MortgageCalculator';
import ClosingCosts from '../components/ClosingCosts';
import AmortizationSchedule from '../components/AmortizationSchedule';
import InvestmentCalculator from '../components/InvestmentCalculator';
import SimpleTest from '../components/SimpleTest';

const Calculator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'mortgage' | 'closing' | 'amortization' | 'investment'>('mortgage');

  console.log('🚀 Calculator page rendered');

  const tabs = [
    { id: 'mortgage', name: 'Mortgage Calculator', icon: CalculatorIcon },
    { id: 'closing', name: 'Closing Costs', icon: CalculatorIcon },
    { id: 'amortization', name: 'Amortization', icon: CalculatorIcon },
    { id: 'investment', name: 'Investment', icon: CalculatorIcon },
  ] as const;

  return (
    <div className="space-y-8">
      {/* EMERGENCY TEST COMPONENT */}
      <SimpleTest />

      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Mortgage & Real Estate Calculators</h1>
        <p className="text-lg text-gray-600">
          Professional tools for Canadian real estate calculations
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
                onClick={() => {
                  console.log('🔥 TAB CLICKED:', tab.id);
                  setActiveTab(tab.id);
                }}
                className={`flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">{tab.name}</span>
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

export default Calculator;