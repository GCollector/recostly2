import React from 'react';
import { Calculator, Home, BarChart3, TrendingUp } from 'lucide-react';

interface Tab {
  id: 'mortgage' | 'closing' | 'amortization' | 'investment';
  name: string;
  shortName: string;
  description: string;
  icon: React.ComponentType<any>;
}

interface ResultsTabNavigationProps {
  activeTab: string;
  onTabChange: (tabId: 'mortgage' | 'closing' | 'amortization' | 'investment') => void;
  enableInvestmentAnalysis: boolean;
}

const ResultsTabNavigation: React.FC<ResultsTabNavigationProps> = ({
  activeTab,
  onTabChange,
  enableInvestmentAnalysis
}) => {
  const tabs: Tab[] = [
    { 
      id: 'mortgage', 
      name: 'Mortgage Summary', 
      shortName: 'Summary',
      description: 'Payment details and breakdown',
      icon: Calculator 
    },
    { 
      id: 'closing', 
      name: 'Closing Costs', 
      shortName: 'Closing',
      description: 'Fees and closing expenses',
      icon: Home 
    },
    { 
      id: 'amortization', 
      name: 'Amortization', 
      shortName: 'Amortization',
      description: 'Payment schedule and charts',
      icon: BarChart3 
    },
    ...(enableInvestmentAnalysis ? [{ 
      id: 'investment' as const, 
      name: 'Investment Analysis', 
      shortName: 'Investment',
      description: 'ROI and cash flow metrics',
      icon: TrendingUp 
    }] : [])
  ];

  return (
    <nav className="bg-white rounded-xl shadow-sm border border-slate-200 p-4" aria-label="Results tabs">
      <div className={`grid gap-1 ${enableInvestmentAnalysis ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3'}`}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center p-4 rounded-lg text-center transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
              aria-label={`Switch to ${tab.name}`}
            >
              <Icon className="h-6 w-6 mb-2" />
              <span className="text-sm font-medium hidden sm:block">{tab.name}</span>
              <span className="text-sm font-medium sm:hidden">{tab.shortName}</span>
              <span className="text-xs text-slate-500 mt-1 hidden lg:block">{tab.description}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default ResultsTabNavigation;