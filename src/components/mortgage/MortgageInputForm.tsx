import React from 'react';
import { TrendingUp, Home, Settings, Save } from 'lucide-react';
import { MortgageData } from '../../pages/Calculator';
import { useAuth } from '../../contexts/AuthContext';
import { useCalculations } from '../../contexts/CalculationContext';
import { AffordabilityResults } from '../../types/premium';
import { calculateMonthlyPayment } from '../../utils/mortgageCalculations';
import PropertyFinancingSection from './PropertyFinancingSection';
import InvestmentAnalysisSection from './InvestmentAnalysisSection';
import ClosingCostsSection from './ClosingCostsSection';
import MarketingControlSection from './MarketingControlSection';
import RentVsBuySection from './RentVsBuySection';
import AffordabilitySection from '../premium/AffordabilitySection';

interface MortgageInputFormProps {
  data: MortgageData;
  onInputChange: (field: keyof MortgageData, value: any) => void;
  onExpenseChange: (field: keyof NonNullable<MortgageData['monthlyExpenses']>, value: number) => void;
  onClosingCostChange: (field: keyof NonNullable<MortgageData['closingCosts']>, value: number) => void;
  loanCalculation?: {
    baseLoanAmount: number;
    cmhcPremium: number;
    totalLoanAmount: number;
  };
  onAffordabilityCalculated?: (results: AffordabilityResults) => void;
  calculationId?: string;
  currentNotes?: Record<string, string>;
  currentComments?: string;
}

const MortgageInputForm: React.FC<MortgageInputFormProps> = ({
  data,
  onInputChange,
  onExpenseChange,
  onClosingCostChange,
  loanCalculation,
  onAffordabilityCalculated,
  calculationId,
  currentNotes = {},
  currentComments = ''
}) => {
  const { user } = useAuth();
  const { saveCalculation } = useCalculations();
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveMessage, setSaveMessage] = React.useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const handleSave = async () => {
    if (!user) {
      setSaveMessage({
        type: 'error',
        message: 'Please sign in to save calculations.'
      });
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    try {
      // Calculate monthly payment for saving
      const loanAmount = loanCalculation ? loanCalculation.totalLoanAmount : (data.homePrice - data.downPayment);
      const monthlyPayment = calculateMonthlyPayment(loanAmount, data.interestRate, data.amortizationYears);
      const totalInterest = monthlyPayment * data.amortizationYears * 12 - loanAmount;

      // Prepare investment data if enabled
      const investmentData = data.enableInvestmentAnalysis ? {
        monthlyRent: data.monthlyRent,
        monthlyExpenses: data.monthlyExpenses
      } : null;

      // Prepare notes with additional data
      const notesData = {
        ...currentNotes,
        investment_data: investmentData,
        showMarketingOnShare: data.showMarketingOnShare,
        enableInvestmentAnalysis: data.enableInvestmentAnalysis,
        enableClosingCosts: data.enableClosingCosts,
        enableAffordabilityEstimator: data.enableAffordabilityEstimator,
        enableRentVsBuy: data.enableRentVsBuy
      };

      const calculationData = {
        home_price: data.homePrice,
        down_payment: data.downPayment,
        interest_rate: data.interestRate,
        amortization_years: data.amortizationYears,
        payment_frequency: data.paymentFrequency,
        province: data.province,
        city: data.city,
        is_first_time_buyer: data.isFirstTimeBuyer,
        monthly_payment: monthlyPayment,
        total_interest: totalInterest,
        notes: notesData,
        comments: currentComments
      };

      const savedId = await saveCalculation(calculationData, calculationId);
      
      setSaveMessage({
        type: 'success',
        message: calculationId ? 'Calculation updated successfully!' : 'Calculation saved successfully!'
      });

      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000);

    } catch (error: any) {
      console.error('Save error:', error);
      
      if (error.type === 'SAVE_LIMIT_REACHED') {
        setSaveMessage({
          type: 'error',
          message: 'Free users can only save 1 calculation. Upgrade to Basic plan for unlimited saves.'
        });
      } else {
        setSaveMessage({
          type: 'error',
          message: error.message || 'Failed to save calculation. Please try again.'
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* Save Message */}
      {saveMessage && (
        <div className={`p-4 rounded-lg border ${
          saveMessage.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-700' 
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <div className="flex items-center">
            <Save className="h-5 w-5 mr-2" />
            <span className="font-medium">{saveMessage.message}</span>
          </div>
        </div>
      )}

      {/* Save Button - Always visible for logged in users */}
      {user && (
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{isSaving ? 'Saving...' : calculationId ? 'Update Calculation' : 'Save Calculation'}</span>
          </button>
        </div>
      )}

      {/* Mortgage Details Section - Always first */}
      <div>
        <h2 className="text-2xl font-semibold font-heading text-slate-900 mb-4">Mortgage Details</h2>
        <p className="text-slate-600 font-sans mb-8">Enter your property and financing information</p>
        
        <div className="space-y-8">
          <PropertyFinancingSection 
            data={data}
            onInputChange={onInputChange}
            loanCalculation={loanCalculation}
          />
        </div>
      </div>

      {/* Optional Sections with Visual Separation and Better Spacing */}
      <div className="space-y-16">
        {/* Premium Affordability Estimator */}
        {user?.tier === 'premium' && onAffordabilityCalculated && (
          <div className="border-t border-slate-200 pt-12">
            <AffordabilitySection
              data={data}
              onInputChange={onInputChange}
              onAffordabilityCalculated={onAffordabilityCalculated}
            />
          </div>
        )}

        {/* Closing Costs Analysis */}
        <div className="border-t border-slate-200 pt-12">
          <ClosingCostsSection
            data={data}
            onInputChange={onInputChange}
            onClosingCostChange={onClosingCostChange}
          />
        </div>

        {/* Investment Property Analysis */}
        <div className="border-t border-slate-200 pt-12">
          <InvestmentAnalysisSection
            data={data}
            onInputChange={onInputChange}
            onExpenseChange={onExpenseChange}
          />
        </div>

        {/* Rent vs Buy Analysis */}
        <div className="border-t border-slate-200 pt-12">
          <RentVsBuySection
            data={data}
            onInputChange={onInputChange}
          />
        </div>

        {/* Premium Marketing Control */}
        {user?.tier === 'premium' && (
          <div className="border-t border-slate-200 pt-12">
            <MarketingControlSection
              data={data}
              onInputChange={onInputChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MortgageInputForm;