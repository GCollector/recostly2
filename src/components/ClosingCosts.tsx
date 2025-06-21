import React, { useState, useEffect } from 'react';
import { Calculator, Info } from 'lucide-react';

interface ClosingCostBreakdown {
  landTransferTax: number;
  additionalTax: number;
  legalFees: number;
  titleInsurance: number;
  homeInspection: number;
  appraisal: number;
  surveyFee: number;
  firstTimeBuyerRebate: number;
  total: number;
}

const ClosingCosts: React.FC = () => {
  const [homePrice, setHomePrice] = useState(500000);
  const [location, setLocation] = useState<'toronto' | 'vancouver'>('toronto');
  const [isFirstTimeBuyer, setIsFirstTimeBuyer] = useState(false);
  const [breakdown, setBreakdown] = useState<ClosingCostBreakdown | null>(null);

  const calculateOntarioLandTransferTax = (price: number) => {
    let tax = 0;
    if (price <= 55000) {
      tax = price * 0.005;
    } else if (price <= 250000) {
      tax = 275 + (price - 55000) * 0.01;
    } else if (price <= 400000) {
      tax = 2225 + (price - 250000) * 0.015;
    } else if (price <= 2000000) {
      tax = 4475 + (price - 400000) * 0.02;
    } else {
      tax = 36475 + (price - 2000000) * 0.025;
    }
    return Math.round(tax);
  };

  const calculateTorontoLandTransferTax = (price: number) => {
    let tax = 0;
    if (price <= 55000) {
      tax = price * 0.005;
    } else if (price <= 400000) {
      tax = 275 + (price - 55000) * 0.01;
    } else if (price <= 2000000) {
      tax = 3725 + (price - 400000) * 0.02;
    } else {
      tax = 35725 + (price - 2000000) * 0.025;
    }
    return Math.round(tax);
  };

  const calculateBCPropertyTransferTax = (price: number) => {
    let tax = 0;
    if (price <= 200000) {
      tax = price * 0.01;
    } else if (price <= 2000000) {
      tax = 2000 + (price - 200000) * 0.02;
    } else if (price <= 3000000) {
      tax = 38000 + (price - 2000000) * 0.03;
    } else {
      tax = 68000 + (price - 3000000) * 0.05;
    }
    
    // Additional tax on properties over $3M
    if (price > 3000000) {
      tax += (price - 3000000) * 0.02;
    }
    
    return Math.round(tax);
  };

  const calculateFirstTimeBuyerRebate = (price: number, location: string) => {
    if (!isFirstTimeBuyer) return 0;
    
    if (location === 'toronto') {
      // Ontario rebate: maximum $4,000 for homes under $368,000
      if (price <= 368000) {
        return Math.min(calculateOntarioLandTransferTax(price), 4000);
      }
      return 0;
    } else {
      // BC rebate: up to $8,000 for homes under $500,000
      if (price <= 500000) {
        return Math.min(calculateBCPropertyTransferTax(price), 8000);
      }
      return 0;
    }
  };

  const calculateClosingCosts = () => {
    let landTransferTax = 0;
    let additionalTax = 0;
    
    if (location === 'toronto') {
      landTransferTax = calculateOntarioLandTransferTax(homePrice);
      additionalTax = calculateTorontoLandTransferTax(homePrice);
    } else {
      landTransferTax = calculateBCPropertyTransferTax(homePrice);
    }
    
    const legalFees = Math.round(homePrice * 0.001) + 1500; // ~0.1% + $1500 base
    const titleInsurance = Math.min(Math.max(homePrice * 0.0005, 250), 1500);
    const homeInspection = 500;
    const appraisal = 400;
    const surveyFee = 1000;
    const firstTimeBuyerRebate = calculateFirstTimeBuyerRebate(homePrice, location);
    
    const total = landTransferTax + additionalTax + legalFees + titleInsurance + 
                  homeInspection + appraisal + surveyFee - firstTimeBuyerRebate;
    
    setBreakdown({
      landTransferTax,
      additionalTax,
      legalFees,
      titleInsurance,
      homeInspection,
      appraisal,
      surveyFee,
      firstTimeBuyerRebate,
      total: Math.round(total)
    });
  };

  useEffect(() => {
    calculateClosingCosts();
  }, [homePrice, location, isFirstTimeBuyer]);

  return (
    <div className="p-6 space-y-8">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">Closing Cost Calculator</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Home Purchase Price
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={homePrice}
                onChange={(e) => setHomePrice(Number(e.target.value))}
                className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="500,000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value as 'toronto' | 'vancouver')}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="toronto">Toronto, Ontario</option>
              <option value="vancouver">Vancouver, BC</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              id="first-time-buyer-closing"
              type="checkbox"
              checked={isFirstTimeBuyer}
              onChange={(e) => setIsFirstTimeBuyer(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="first-time-buyer-closing" className="ml-2 block text-sm text-gray-700">
              First-time homebuyer (eligible for rebates)
            </label>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Important Note:</p>
                <p>
                  Closing costs can vary significantly based on your specific situation. 
                  These estimates are based on typical scenarios and should be used as a 
                  general guide. Consult with your lawyer and real estate professional 
                  for accurate estimates.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">Closing Cost Breakdown</h2>
          
          {breakdown && (
            <div className="space-y-4">
              <div className="bg-emerald-50 p-6 rounded-lg">
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600 mb-2">
                    ${breakdown.total.toLocaleString()}
                  </div>
                  <div className="text-sm text-emerald-700">
                    Total Estimated Closing Costs
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-700">
                    {location === 'toronto' ? 'Ontario Land Transfer Tax' : 'BC Property Transfer Tax'}
                  </span>
                  <span className="font-semibold text-gray-900">
                    ${breakdown.landTransferTax.toLocaleString()}
                  </span>
                </div>

                {location === 'toronto' && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-700">Toronto Municipal Land Transfer Tax</span>
                    <span className="font-semibold text-gray-900">
                      ${breakdown.additionalTax.toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-700">Legal Fees & Disbursements</span>
                  <span className="font-semibold text-gray-900">
                    ${breakdown.legalFees.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-700">Title Insurance</span>
                  <span className="font-semibold text-gray-900">
                    ${breakdown.titleInsurance.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-700">Home Inspection</span>
                  <span className="font-semibold text-gray-900">
                    ${breakdown.homeInspection.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-700">Property Appraisal</span>
                  <span className="font-semibold text-gray-900">
                    ${breakdown.appraisal.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-700">Survey Fee</span>
                  <span className="font-semibold text-gray-900">
                    ${breakdown.surveyFee.toLocaleString()}
                  </span>
                </div>

                {breakdown.firstTimeBuyerRebate > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-green-700">First-Time Buyer Rebate</span>
                    <span className="font-semibold text-green-600">
                      -${breakdown.firstTimeBuyerRebate.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">
                  <p className="mb-2">
                    <strong>Additional costs to consider:</strong> Moving expenses, utility connections, 
                    property taxes (prorated), condo fees (if applicable), home insurance, 
                    and immediate repairs or improvements.
                  </p>
                  <p>
                    <strong>Cash required at closing:</strong> Down payment + closing costs = 
                    <span className="font-semibold text-gray-900">
                      {' '}${(homePrice * 0.2 + breakdown.total).toLocaleString()}
                    </span> (assuming 20% down)
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClosingCosts;