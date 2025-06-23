import React from 'react';
import { MortgageData } from '../../pages/Calculator';

interface ClosingCostsFieldsProps {
  data: MortgageData;
  onClosingCostChange: (field: keyof NonNullable<MortgageData['closingCosts']>, value: number) => void;
}

const ClosingCostsFields: React.FC<ClosingCostsFieldsProps> = ({
  data,
  onClosingCostChange
}) => {
  return (
    <div className="space-y-6 mt-6">
      <div>
        <h4 className="text-md font-semibold font-heading text-slate-900 mb-4">Closing Cost Details</h4>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium font-sans text-slate-700 mb-2">
              Land Transfer Tax
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">$</span>
              <input
                type="number"
                value={data.closingCosts?.landTransferTax || 0}
                onChange={(e) => onClosingCostChange('landTransferTax', Number(e.target.value))}
                className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-sans bg-white"
                placeholder="8475"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium font-sans text-slate-700 mb-2">
              Municipal Tax
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">$</span>
              <input
                type="number"
                value={data.closingCosts?.additionalTax || 0}
                onChange={(e) => onClosingCostChange('additionalTax', Number(e.target.value))}
                className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-sans bg-white"
                placeholder="8475"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium font-sans text-slate-700 mb-2">
              Legal Fees
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">$</span>
              <input
                type="number"
                value={data.closingCosts?.legalFees || 0}
                onChange={(e) => onClosingCostChange('legalFees', Number(e.target.value))}
                className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-sans bg-white"
                placeholder="2000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium font-sans text-slate-700 mb-2">
              Title Insurance
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">$</span>
              <input
                type="number"
                value={data.closingCosts?.titleInsurance || 0}
                onChange={(e) => onClosingCostChange('titleInsurance', Number(e.target.value))}
                className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-sans bg-white"
                placeholder="400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium font-sans text-slate-700 mb-2">
              Home Inspection
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">$</span>
              <input
                type="number"
                value={data.closingCosts?.homeInspection || 0}
                onChange={(e) => onClosingCostChange('homeInspection', Number(e.target.value))}
                className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-sans bg-white"
                placeholder="500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium font-sans text-slate-700 mb-2">
              Property Appraisal
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">$</span>
              <input
                type="number"
                value={data.closingCosts?.appraisal || 0}
                onChange={(e) => onClosingCostChange('appraisal', Number(e.target.value))}
                className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-sans bg-white"
                placeholder="400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium font-sans text-slate-700 mb-2">
              Survey Fee
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">$</span>
              <input
                type="number"
                value={data.closingCosts?.surveyFee || 0}
                onChange={(e) => onClosingCostChange('surveyFee', Number(e.target.value))}
                className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-sans bg-white"
                placeholder="1000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium font-sans text-slate-700 mb-2">
              First-Time Buyer Rebate
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">$</span>
              <input
                type="number"
                value={data.closingCosts?.firstTimeBuyerRebate || 0}
                onChange={(e) => onClosingCostChange('firstTimeBuyerRebate', Number(e.target.value))}
                className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-sans bg-white"
                placeholder="0"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClosingCostsFields;