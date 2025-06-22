import React, { useState, useEffect } from 'react';
import { ArrowLeft, Info } from 'lucide-react';
import { ClosingCostsData } from '../pages/Calculator';

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

interface ClosingCostsResultsProps {
  data: ClosingCostsData;
  onBack: () => void;
}

const ClosingCostsResults: React.FC<ClosingCostsResultsProps> = ({ data, onBack }) => {
  const [breakdown, setBreakdown] = useState<ClosingCostBreakdown | null>(null);

  useEffect(() => {
    calculateClosingCosts();
  }, [data]);

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
    
    if (price > 3000000) {
      tax += (price - 3000000) * 0.02;
    }
    
    return Math.round(tax);
  };

  const calculateFirstTimeBuyerRebate = (price: number, location: string) => {
    if (!data.isFirstTimeBuyer) return 0;
    
    if (location === 'toronto') {
      if (price <= 368000) {
        return Math.min(calculateOntarioLandTransferTax(price), 4000);
      }
      return 0;
    } else {
      if (price <= 500000) {
        return Math.min(calculateBCPropertyTransferTax(price), 8000);
      }
      return 0;
    }
  };

  const calculateClosingCosts = () => {
    let landTransferTax = 0;
    let additionalTax = 0;
    
    if (data.location === 'toronto') {
      landTransferTax = calculateOntarioLandTransferTax(data.homePrice);
      additionalTax = calculateTorontoLandTransferTax(data.homePrice);
    } else {
      landTransferTax = calculateBCPropertyTransferTax(data.homePrice);
    }
    
    const legalFees = Math.round(data.homePrice * 0.001) + 1500;
    const titleInsurance = Math.min(Math.max(data.homePrice * 0.0005, 250), 1500);
    const homeInspection = 500;
    const appraisal = 400;
    const surveyFee = 1000;
    const firstTimeBuyerRebate = calculateFirstTimeBuyerRebate(data.homePrice, data.location);
    
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

  if (!breakdown) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-slate-600">Calculating closing costs...</p>
      </div>
    );
  }

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
        <h2 className="text-2xl font-bold text-slate-900">Closing Cost Breakdown</h2>
        <div className="w-24"></div>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
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

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-slate-200">
              <span className="text-slate-700">
                {data.location === 'toronto' ? 'Ontario Land Transfer Tax' : 'BC Property Transfer Tax'}
              </span>
              <span className="font-semibold text-slate-900">
                ${breakdown.landTransferTax.toLocaleString()}
              </span>
            </div>

            {data.location === 'toronto' && (
              <div className="flex justify-between items-center py-2 border-b border-slate-200">
                <span className="text-slate-700">Toronto Municipal Land Transfer Tax</span>
                <span className="font-semibold text-slate-900">
                  ${breakdown.additionalTax.toLocaleString()}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center py-2 border-b border-slate-200">
              <span className="text-slate-700">Legal Fees & Disbursements</span>
              <span className="font-semibold text-slate-900">
                ${breakdown.legalFees.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-slate-200">
              <span className="text-slate-700">Title Insurance</span>
              <span className="font-semibold text-slate-900">
                ${breakdown.titleInsurance.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-slate-200">
              <span className="text-slate-700">Home Inspection</span>
              <span className="font-semibold text-slate-900">
                ${breakdown.homeInspection.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-slate-200">
              <span className="text-slate-700">Property Appraisal</span>
              <span className="font-semibold text-slate-900">
                ${breakdown.appraisal.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-slate-200">
              <span className="text-slate-700">Survey Fee</span>
              <span className="font-semibold text-slate-900">
                ${breakdown.surveyFee.toLocaleString()}
              </span>
            </div>

            {breakdown.firstTimeBuyerRebate > 0 && (
              <div className="flex justify-between items-center py-2 border-b border-slate-200">
                <span className="text-green-700">First-Time Buyer Rebate</span>
                <span className="font-semibold text-green-600">
                  -${breakdown.firstTimeBuyerRebate.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-lg">
          <div className="flex items-start">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="text-sm text-slate-600">
              <p className="mb-2">
                <strong>Additional costs to consider:</strong> Moving expenses, utility connections, 
                property taxes (prorated), condo fees (if applicable), home insurance, 
                and immediate repairs or improvements.
              </p>
              <p>
                <strong>Cash required at closing:</strong> Down payment + closing costs = 
                <span className="font-semibold text-slate-900">
                  {' '}${(data.homePrice * 0.2 + breakdown.total).toLocaleString()}
                </span> (assuming 20% down)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClosingCostsResults;