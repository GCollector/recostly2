import React from 'react';
import { MortgageData } from '../../pages/Calculator';

interface ClosingCostsTabProps {
  data: MortgageData;
  closingCosts: {
    landTransferTax: number;
    additionalTax: number;
    legalFees: number;
    titleInsurance: number;
    homeInspection: number;
    appraisal: number;
    surveyFee: number;
    firstTimeBuyerRebate: number;
    total: number;
  };
}

const ClosingCostsTab: React.FC<ClosingCostsTabProps> = ({ data, closingCosts }) => {
  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-emerald-50 p-6 rounded-xl">
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-600 mb-2">
              ${closingCosts.total.toLocaleString()}
            </div>
            <div className="text-sm text-emerald-700">Total Estimated Closing Costs</div>
            <div className="text-xs text-emerald-600 mt-1">Fees and expenses at closing</div>
          </div>
        </div>

        <div className="bg-blue-50 p-6 rounded-xl">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              ${(data.downPayment + closingCosts.total).toLocaleString()}
            </div>
            <div className="text-sm text-blue-700">Cash Required at Closing</div>
            <div className="text-xs text-blue-600 mt-1">Down payment + closing costs</div>
          </div>
        </div>
      </div>

      {/* Closing Cost Breakdown */}
      <div className="bg-white p-6 rounded-xl border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Closing Cost Breakdown</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-slate-200">
            <span className="text-slate-700">
              {data.province === 'ontario' ? 'Ontario Land Transfer Tax' : 'BC Property Transfer Tax'}
            </span>
            <span className="font-semibold text-slate-900">
              ${closingCosts.landTransferTax.toLocaleString()}
            </span>
          </div>

          {data.city === 'toronto' && (
            <div className="flex justify-between items-center py-3 border-b border-slate-200">
              <span className="text-slate-700">Toronto Municipal Land Transfer Tax</span>
              <span className="font-semibold text-slate-900">
                ${closingCosts.additionalTax.toLocaleString()}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center py-3 border-b border-slate-200">
            <span className="text-slate-700">Legal Fees & Disbursements</span>
            <span className="font-semibold text-slate-900">
              ${closingCosts.legalFees.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between items-center py-3 border-b border-slate-200">
            <span className="text-slate-700">Title Insurance</span>
            <span className="font-semibold text-slate-900">
              ${closingCosts.titleInsurance.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between items-center py-3 border-b border-slate-200">
            <span className="text-slate-700">Home Inspection</span>
            <span className="font-semibold text-slate-900">
              ${closingCosts.homeInspection.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between items-center py-3 border-b border-slate-200">
            <span className="text-slate-700">Property Appraisal</span>
            <span className="font-semibold text-slate-900">
              ${closingCosts.appraisal.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between items-center py-3 border-b border-slate-200">
            <span className="text-slate-700">Survey Fee</span>
            <span className="font-semibold text-slate-900">
              ${closingCosts.surveyFee.toLocaleString()}
            </span>
          </div>

          {closingCosts.firstTimeBuyerRebate > 0 && (
            <div className="flex justify-between items-center py-3 border-b border-slate-200">
              <span className="text-green-700">First-Time Buyer Rebate</span>
              <span className="font-semibold text-green-600">
                -${closingCosts.firstTimeBuyerRebate.toLocaleString()}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center py-4 bg-slate-50 px-4 rounded-lg">
            <span className="font-semibold text-slate-900">Total Closing Costs</span>
            <span className="text-xl font-bold text-slate-900">
              ${closingCosts.total.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClosingCostsTab;