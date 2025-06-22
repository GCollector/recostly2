import React, { useState } from 'react';
import { Calculator as CalculatorIcon, Home, DollarSign, TrendingUp, BarChart3 } from 'lucide-react';
import MortgageCalculator from '../components/MortgageCalculator';
import ClosingCosts from '../components/ClosingCosts';
import AmortizationSchedule from '../components/AmortizationSchedule';
import InvestmentCalculator from '../components/InvestmentCalculator';

const Calculator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'mortgage' | 'closing' | 'amortization' | 'investment'>('mortgage');

  const tabs = [
    {
      id: 'mortgage' as const,
      name: 'Mortgage Calculator',
      icon: CalculatorIcon,
      description: 'Calculate monthly payments and total costs'
    },
    {
      id: 'closing' as const,
      name: 'Closing Costs',
      icon: Home,
      description: 'Estimate closing costs and fees'
    },
    {
      id: 'amortization' as const,
      name: 'Amortization',
      icon: BarChart3,
      description: 'View payment schedule and charts'
    },
    {
      id: 'investment' as const,
      name: 'Investment',
      icon: TrendingUp,
      description: 'Analyze rental property returns'
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'mortgage':
        return <MortgageCalculator />;
      case 'closing':
        return <ClosingCosts />;
      case 'amortization':
        return <AmortizationSchedule />;
      case 'investment':
        return <InvestmentCalculator />;
      default:
        return <MortgageCalculator />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold font-heading text-slate-900">
          Mortgage & Real Estate Calculators
        </h1>
        <p className="text-lg font-sans text-slate-600 max-w-3xl mx-auto">
          Professional tools for Canadian real estate calculations. Calculate payments, closing costs, 
          amortization schedules, and investment metrics.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2">
        <nav className="grid grid-cols-2 lg:grid-cols-4 gap-2" aria-label="Calculator tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center p-4 rounded-lg text-center transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
                aria-label={`Switch to ${tab.name}`}
                data-testid={`tab-${tab.id}`}
              >
                <Icon className="h-6 w-6 mb-2" />
                <span className="text-sm font-medium font-sans">{tab.name}</span>
                <span className="text-xs font-sans text-slate-500 mt-1 hidden sm:block">
                  {tab.description}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[600px]" data-testid="tab-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default Calculator;