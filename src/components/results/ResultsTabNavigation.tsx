import React from 'react';
import { Calculator, Home, BarChart3, TrendingUp, Building } from 'lucide-react';

interface Tab {
  id: 'mortgage' | 'closing' | 'amortization' | 'investment' | 'rentVsBuy';
  name: string;
  shortName: string;
  description: string;
  icon: React.ComponentType<any>;
}

interface ResultsTabNavigationProps {
  activeTab: string;
  onTabChange: (tabId: 'mortgage' | 'closing' | 'amortization' | 'investment' | 'rentVsBuy') => void;
  enableInvestmentAnalysis: boolean;
  enableClosingCosts: boolean;
  enableRentVsBuy?: boolean;
}

const ResultsTabNavigation: React.FC<ResultsTabNavigationProps> = ({
  activeTab,
  onTabChange,
  enableInvestmentAnalysis,
  enableClosingCosts,
  enableRentVsBuy = false
}) => {
  const baseTabs: Tab[] = [
    { 
      id: 'mortgage', 
      name: 'Mortgage Summary', 
      shortName: 'Summary',
      description: 'Payment details and breakdown',
      icon: Calculator 
    },
    { 
      id: 'amortization', 
      name: 'Amortization', 
      shortName: 'Amortization',
      description: 'Payment schedule and charts',
      icon: BarChart3 
    }
  ];
  
  const closingCostsTab: Tab = { 
    id: 'closing', 
    name: 'Closing Costs', 
    shortName: 'Closing',
    description: 'Fees and closing expenses',
    icon: Home 
  };
  
  const investmentTab: Tab = { 
    id: 'investment', 
    name: 'Investment Analysis', 
    shortName: 'Investment',
    description: 'ROI and cash flow metrics',
    icon: TrendingUp 
  };

  const rentVsBuyTab: Tab = {
    id: 'rentVsBuy',
    name: 'Rent vs Buy',
    shortName: 'Rent vs Buy',
    description: 'Long-term cost comparison',
    icon: Building
  };
  
  let tabs = [...baseTabs];
  
  if (enableClosingCosts) {
    tabs.splice(1, 0, closingCostsTab);
  }
  
  if (enableInvestmentAnalysis) {
    tabs.push(investmentTab);
  }

  if (enableRentVsBuy) {
    tabs.push(rentVsBuyTab);
  }

  const getGridCols = () => {
    const tabCount = tabs.length;
    if (tabCount === 5) return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5';
    if (tabCount === 4) return 'grid-cols-2 sm:grid-cols-4';
    if (tabCount === 3) return 'grid-cols-3';
    return 'grid-cols-2';
  };

  return (
    <nav className="bg-white rounded-xl shadow-sm border border-slate-200 p-4" aria-label="Results tabs">
      <div className={`grid gap-1 ${getGridCols()}`}>
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