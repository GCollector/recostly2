import React, { useEffect } from 'react';
import { MortgageData } from '../../pages/Calculator';
import { calculateClosingCosts } from '../../utils/mortgageCalculations';
import CurrencyInput from '../shared/CurrencyInput';

interface ClosingCostsFieldsProps {
  data: MortgageData;
  onClosingCostChange: (field: keyof NonNullable<MortgageData['closingCosts']>, value: number) => void;
}

const ClosingCostsFields: React.FC<ClosingCostsFieldsProps> = ({
  data,
  onClosingCostChange
}) => {
  // Calculate default closing costs based on property details
  useEffect(() => {
    const defaultClosingCosts = calculateClosingCosts(
      data.homePrice,
      data.province,
      data.city,
      data.isFirstTimeBuyer
    );

    // Update land transfer tax and additional tax (municipal) when property details change
    onClosingCostChange('landTransferTax', defaultClosingCosts.landTransferTax);
    onClosingCostChange('additionalTax', defaultClosingCosts.additionalTax);
    
    // Update first-time buyer rebate when status changes
    onClosingCostChange('firstTimeBuyerRebate', defaultClosingCosts.firstTimeBuyerRebate);
    
  }, [data.homePrice, data.province, data.city, data.isFirstTimeBuyer]);

  return (
    <div className="space-y-6 mt-6">
      <div>
        <h4 className="text-md font-semibold font-heading text-slate-900 mb-4">Closing Cost Details</h4>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium font-sans text-slate-700 mb-2">
              {data.province === 'ontario' ? 'Ontario Land Transfer Tax' : 'BC Property Transfer Tax'}
            </label>
            <CurrencyInput
              value={data.closingCosts?.landTransferTax || 0}
              onChange={(value) => onClosingCostChange('landTransferTax', value)}
              prefix="$"
              placeholder="8475"
              readonly={true}
              className="bg-slate-50"
            />
            <p className="text-xs text-slate-500 mt-1">Automatically calculated based on property price</p>
          </div>

          {data.city === 'toronto' && (
            <div>
              <label className="block text-sm font-medium font-sans text-slate-700 mb-2">
                Toronto Municipal Tax
              </label>
              <CurrencyInput
                value={data.closingCosts?.additionalTax || 0}
                onChange={(value) => onClosingCostChange('additionalTax', value)}
                prefix="$"
                placeholder="8475"
                readonly={true}
                className="bg-slate-50"
              />
              <p className="text-xs text-slate-500 mt-1">Automatically calculated for Toronto properties</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium font-sans text-slate-700 mb-2">
              Legal Fees
            </label>
            <CurrencyInput
              value={data.closingCosts?.legalFees || 0}
              onChange={(value) => onClosingCostChange('legalFees', value)}
              prefix="$"
              placeholder="2000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium font-sans text-slate-700 mb-2">
              Title Insurance
            </label>
            <CurrencyInput
              value={data.closingCosts?.titleInsurance || 0}
              onChange={(value) => onClosingCostChange('titleInsurance', value)}
              prefix="$"
              placeholder="400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium font-sans text-slate-700 mb-2">
              Home Inspection
            </label>
            <CurrencyInput
              value={data.closingCosts?.homeInspection || 0}
              onChange={(value) => onClosingCostChange('homeInspection', value)}
              prefix="$"
              placeholder="500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium font-sans text-slate-700 mb-2">
              Property Appraisal
            </label>
            <CurrencyInput
              value={data.closingCosts?.appraisal || 0}
              onChange={(value) => onClosingCostChange('appraisal', value)}
              prefix="$"
              placeholder="400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium font-sans text-slate-700 mb-2">
              Survey Fee
            </label>
            <CurrencyInput
              value={data.closingCosts?.surveyFee || 0}
              onChange={(value) => onClosingCostChange('surveyFee', value)}
              prefix="$"
              placeholder="1000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium font-sans text-slate-700 mb-2">
              First-Time Buyer Rebate
            </label>
            <CurrencyInput
              value={data.closingCosts?.firstTimeBuyerRebate || 0}
              onChange={(value) => onClosingCostChange('firstTimeBuyerRebate', value)}
              prefix="$"
              placeholder="0"
              readonly={true}
              className="bg-slate-50"
            />
            <p className="text-xs text-slate-500 mt-1">
              {data.isFirstTimeBuyer ? 'Automatically applied based on first-time buyer status' : 'Not eligible (not a first-time buyer)'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-blue-100 p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="font-medium text-blue-800">Total Closing Costs:</span>
          <span className="text-xl font-bold text-blue-900">
            ${(
              (data.closingCosts?.landTransferTax || 0) +
              (data.closingCosts?.additionalTax || 0) +
              (data.closingCosts?.legalFees || 0) +
              (data.closingCosts?.titleInsurance || 0) +
              (data.closingCosts?.homeInspection || 0) +
              (data.closingCosts?.appraisal || 0) +
              (data.closingCosts?.surveyFee || 0) -
              (data.closingCosts?.firstTimeBuyerRebate || 0)
            ).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ClosingCostsFields;