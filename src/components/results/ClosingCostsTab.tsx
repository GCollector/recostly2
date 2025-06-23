import React from 'react';
import { MortgageData } from '../../pages/Calculator';
import NotesSection from '../shared/NotesSection';

interface ClosingCostsTabProps {
  data: MortgageData;
  closingCosts?: {
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
  calculationId?: string;
  currentNotes?: Record<string, string>;
  readonly?: boolean;
}

const ClosingCostsTab: React.FC<ClosingCostsTabProps> = ({ 
  data, 
  closingCosts, 
  calculationId, 
  currentNotes = {},
  readonly = false
}) => {
  // Use custom closing costs if available, otherwise calculate defaults
  const finalClosingCosts = closingCosts || {
    landTransferTax: data.closingCosts?.landTransferTax ?? 8475,
    additionalTax: data.closingCosts?.additionalTax ?? (data.city === 'toronto' ? 8475 : 0),
    legalFees: data.closingCosts?.legalFees ?? 2000,
    titleInsurance: data.closingCosts?.titleInsurance ?? 400,
    homeInspection: data.closingCosts?.homeInspection ?? 500,
    appraisal: data.closingCosts?.appraisal ?? 400,
    surveyFee: data.closingCosts?.surveyFee ?? 1000,
    firstTimeBuyerRebate: data.closingCosts?.firstTimeBuyerRebate ?? (data.isFirstTimeBuyer ? 4000 : 0),
    total: 0
  };

  // Ensure all properties are numbers with fallback to 0
  const safeFinalClosingCosts = {
    landTransferTax: finalClosingCosts.landTransferTax ?? 0,
    additionalTax: finalClosingCosts.additionalTax ?? 0,
    legalFees: finalClosingCosts.legalFees ?? 0,
    titleInsurance: finalClosingCosts.titleInsurance ?? 0,
    homeInspection: finalClosingCosts.homeInspection ?? 0,
    appraisal: finalClosingCosts.appraisal ?? 0,
    surveyFee: finalClosingCosts.surveyFee ?? 0,
    firstTimeBuyerRebate: finalClosingCosts.firstTimeBuyerRebate ?? 0,
    total: 0
  };

  // Calculate total with safe values
  safeFinalClosingCosts.total = safeFinalClosingCosts.landTransferTax + 
    safeFinalClosingCosts.additionalTax + 
    safeFinalClosingCosts.legalFees + 
    safeFinalClosingCosts.titleInsurance + 
    safeFinalClosingCosts.homeInspection + 
    safeFinalClosingCosts.appraisal + 
    safeFinalClosingCosts.surveyFee - 
    safeFinalClosingCosts.firstTimeBuyerRebate;

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-emerald-50 p-6 rounded-xl">
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-600 mb-2">
              ${safeFinalClosingCosts.total.toLocaleString()}
            </div>
            <div className="text-sm text-emerald-700">Total Estimated Closing Costs</div>
            <div className="text-xs text-emerald-600 mt-1">Fees and expenses at closing</div>
          </div>
        </div>

        <div className="bg-blue-50 p-6 rounded-xl">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              ${((data.downPayment ?? 0) + safeFinalClosingCosts.total).toLocaleString()}
            </div>
            <div className="text-sm text-blue-700">Cash Required at Closing</div>
            <div className="text-xs text-blue-600 mt-1">Down payment + closing costs</div>
          </div>
        </div>
      </div>

      {/* Premium Notes Section */}
      {!readonly && (
        <NotesSection
          calculationId={calculationId || 'temp'}
          section="closing"
          sectionTitle="Closing Costs"
          currentNotes={currentNotes.closing}
        />
      )}

      {/* Readonly Notes Section for shared pages */}
      {readonly && currentNotes.closing && (
        <NotesSection
          calculationId={calculationId || ''}
          section="closing"
          sectionTitle="Closing Costs"
          currentNotes={currentNotes.closing}
          readonly={true}
        />
      )}

      {/* Closing Cost Breakdown */}
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Closing Cost Breakdown</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-slate-200">
            <span className="text-slate-700">
              {data.province === 'ontario' ? 'Ontario Land Transfer Tax' : 'BC Property Transfer Tax'}
            </span>
            <span className="font-semibold text-slate-900">
              ${safeFinalClosingCosts.landTransferTax.toLocaleString()}
            </span>
          </div>

          {data.city === 'toronto' && safeFinalClosingCosts.additionalTax > 0 && (
            <div className="flex justify-between items-center py-3 border-b border-slate-200">
              <span className="text-slate-700">Toronto Municipal Land Transfer Tax</span>
              <span className="font-semibold text-slate-900">
                ${safeFinalClosingCosts.additionalTax.toLocaleString()}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center py-3 border-b border-slate-200">
            <span className="text-slate-700">Legal Fees & Disbursements</span>
            <span className="font-semibold text-slate-900">
              ${safeFinalClosingCosts.legalFees.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between items-center py-3 border-b border-slate-200">
            <span className="text-slate-700">Title Insurance</span>
            <span className="font-semibold text-slate-900">
              ${safeFinalClosingCosts.titleInsurance.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between items-center py-3 border-b border-slate-200">
            <span className="text-slate-700">Home Inspection</span>
            <span className="font-semibold text-slate-900">
              ${safeFinalClosingCosts.homeInspection.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between items-center py-3 border-b border-slate-200">
            <span className="text-slate-700">Property Appraisal</span>
            <span className="font-semibold text-slate-900">
              ${safeFinalClosingCosts.appraisal.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between items-center py-3 border-b border-slate-200">
            <span className="text-slate-700">Survey Fee</span>
            <span className="font-semibold text-slate-900">
              ${safeFinalClosingCosts.surveyFee.toLocaleString()}
            </span>
          </div>

          {safeFinalClosingCosts.firstTimeBuyerRebate > 0 && (
            <div className="flex justify-between items-center py-3 border-b border-slate-200">
              <span className="text-green-700">First-Time Buyer Rebate</span>
              <span className="font-semibold text-green-600">
                -${safeFinalClosingCosts.firstTimeBuyerRebate.toLocaleString()}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center py-4 bg-slate-100 px-4 rounded-lg">
            <span className="font-semibold text-slate-900">Total Closing Costs</span>
            <span className="text-xl font-bold text-slate-900">
              ${safeFinalClosingCosts.total.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClosingCostsTab;