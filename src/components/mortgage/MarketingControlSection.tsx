import React from 'react';
import { Crown, Eye, EyeOff } from 'lucide-react';
import { MortgageData } from '../../pages/Calculator';

interface MarketingControlSectionProps {
  data: MortgageData;
  onInputChange: (field: keyof MortgageData, value: any) => void;
}

const MarketingControlSection: React.FC<MarketingControlSectionProps> = ({
  data,
  onInputChange
}) => {
  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
            <Crown className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold font-heading text-slate-900">Marketing Control</h3>
            <p className="text-sm font-sans text-slate-600">Control how your professional services appear on shared calculations</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium text-slate-700">
            {data.showMarketingOnShare ? 'Show Marketing' : 'Hide Marketing'}
          </span>
          <button
            onClick={() => onInputChange('showMarketingOnShare', !data.showMarketingOnShare)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
              data.showMarketingOnShare ? 'bg-amber-600' : 'bg-slate-300'
            }`}
            role="switch"
            aria-checked={data.showMarketingOnShare}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                data.showMarketingOnShare ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur-sm border border-amber-300 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          {data.showMarketingOnShare ? (
            <Eye className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          ) : (
            <EyeOff className="h-5 w-5 text-slate-500 mt-0.5 flex-shrink-0" />
          )}
          <div>
            <h4 className="font-medium text-amber-900 mb-1">
              {data.showMarketingOnShare ? 'Marketing Content Visible' : 'Marketing Content Hidden'}
            </h4>
            <p className="text-sm text-amber-800">
              {data.showMarketingOnShare 
                ? 'Your professional services section will appear prominently above the calculation results when shared. This helps market your services to potential clients.'
                : 'Your professional services section will be hidden on shared calculations. Only the calculation results will be visible to viewers.'
              }
            </p>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-amber-200">
          <p className="text-xs text-amber-700">
            <strong>Note:</strong> You can update your marketing content (profile image and description) in your account settings.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MarketingControlSection;