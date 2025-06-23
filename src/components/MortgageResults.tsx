import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Info, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCalculations } from '../contexts/CalculationContext';
import { MortgageData } from '../pages/Calculator';
import { calculateMonthlyPayment, calculateClosingCosts, generateAmortizationSchedule, calculateInvestmentMetrics } from '../utils/mortgageCalculations';
import ResultsTabNavigation from './results/ResultsTabNavigation';
import MortgageSummaryTab from './results/MortgageSummaryTab';
import ClosingCostsTab from './results/ClosingCostsTab';
import AmortizationTab from './results/AmortizationTab';
import InvestmentAnalysisTab from './results/InvestmentAnalysisTab';
import ResultsActionButtons from './results/ResultsActionButtons';
import ShareModal from './shared/ShareModal';
import CommentsSection from './shared/CommentsSection';

interface MortgageResultsProps {
  data: MortgageData;
  onBack: () => void;
  calculationId?: string;
  currentNotes?: Record<string, string>;
  currentComments?: string;
  onCalculationSaved?: (calculationId: string) => void;
}

const MortgageResults: React.FC<MortgageResultsProps> = ({ 
  data, 
  onBack, 
  calculationId, 
  currentNotes = {},
  currentComments = '',
  onCalculationSaved
}) => {
  const { user } = useAuth();
  const { saveCalculation, calculations } = useCalculations();
  const [activeTab, setActiveTab] = useState<'mortgage' | 'closing' | 'amortization' | 'investment'>('mortgage');
  const [showShareModal, setShowShareModal] = useState(false);
  const [savedCalculationId, setSavedCalculationId] = useState<string>(calculationId || '');
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{
    type: 'success' | 'info' | 'warning';
    title: string;
    message: string;
    actions?: Array<{ label: string; action: () => void; variant: 'primary' | 'secondary' }>;
  } | null>(null);

  // Calculate mortgage values
  const loanAmount = data.homePrice - data.downPayment;
  const monthlyRate = data.interestRate / 100 / 12;
  const monthlyPayment = calculateMonthlyPayment(loanAmount, data.interestRate, data.amortizationYears);
  const totalCost = monthlyPayment * data.amortizationYears * 12 + data.downPayment;
  const totalInterest = totalCost - data.homePrice;
  const downPaymentPercent = Math.round((data.downPayment / data.homePrice) * 100);

  // Calculate closing costs
  const closingCosts = calculateClosingCosts(data.homePrice, data.province, data.city, data.isFirstTimeBuyer);

  // Generate amortization schedule
  const amortizationSchedule = generateAmortizationSchedule(loanAmount, monthlyPayment, monthlyRate, data.amortizationYears);

  // Calculate investment metrics
  const investmentMetrics = data.enableInvestmentAnalysis && data.monthlyRent && data.monthlyExpenses
    ? calculateInvestmentMetrics(data.homePrice, data.downPayment, monthlyPayment, data.monthlyRent, data.monthlyExpenses)
    : null;

  const handleSave = async () => {
    setSaveMessage(null);
    setIsSaving(true);
    
    try {
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
        notes: currentNotes,
        comments: currentComments
      };
      
      const id = await saveCalculation(calculationData);
      setSavedCalculationId(id);
      
      // Notify parent component
      if (onCalculationSaved) {
        onCalculationSaved(id);
      }
      
      setSaveMessage({
        type: 'success',
        title: 'Calculation saved successfully!',
        message: 'You can now share it with others or access it from your dashboard.'
      });
      setShowShareModal(true);
    } catch (error: any) {
      console.log('Save attempt result:', error.type, error.message);
      
      if (error.type === 'AUTH_REQUIRED') {
        setSaveMessage({
          type: 'info',
          title: 'Account required to save calculations',
          message: 'Create a free account to save and manage your mortgage calculations.',
          actions: [
            { 
              label: 'Sign Up Free', 
              action: () => window.location.href = '/signup',
              variant: 'primary'
            },
            { 
              label: 'Sign In', 
              action: () => window.location.href = '/login',
              variant: 'secondary'
            }
          ]
        });
      } else if (error.type === 'SAVE_LIMIT_REACHED') {
        setSaveMessage({
          type: 'info',
          title: 'Save limit reached',
          message: 'Free users can save 1 calculation. Upgrade to Basic plan for unlimited saves, or delete your existing calculation.',
          actions: [
            { 
              label: 'Upgrade to Basic ($9/month)', 
              action: () => window.location.href = '/pricing',
              variant: 'primary'
            },
            { 
              label: 'Manage Saved Calculations', 
              action: () => window.location.href = '/dashboard',
              variant: 'secondary'
            }
          ]
        });
      } else {
        // This is an actual unexpected error
        setSaveMessage({
          type: 'warning',
          title: 'Unable to save calculation',
          message: error.message || 'An unexpected error occurred. Please try again.',
          actions: [
            { 
              label: 'Try Again', 
              action: () => setSaveMessage(null),
              variant: 'primary'
            }
          ]
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    if (savedCalculationId) {
      setShowShareModal(true);
      return;
    }
    await handleSave();
  };

  const handleCopyLink = async () => {
    if (!savedCalculationId) return;
    
    const shareUrl = `${window.location.origin}/shared/${savedCalculationId}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      alert(`Share this link: ${shareUrl}`);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'mortgage':
        return (
          <MortgageSummaryTab
            data={data}
            monthlyPayment={monthlyPayment}
            loanAmount={loanAmount}
            totalInterest={totalInterest}
            totalCost={totalCost}
            downPaymentPercent={downPaymentPercent}
            calculationId={savedCalculationId}
            currentNotes={currentNotes}
          />
        );

      case 'closing':
        return (
          <ClosingCostsTab
            data={data}
            closingCosts={closingCosts}
            calculationId={savedCalculationId}
            currentNotes={currentNotes}
          />
        );

      case 'amortization':
        return (
          <AmortizationTab
            loanAmount={loanAmount}
            totalInterest={totalInterest}
            amortizationYears={data.amortizationYears}
            amortizationSchedule={amortizationSchedule}
            calculationId={savedCalculationId}
            currentNotes={currentNotes}
          />
        );

      case 'investment':
        return (
          <InvestmentAnalysisTab
            data={data}
            investmentMetrics={investmentMetrics}
            calculationId={savedCalculationId}
            currentNotes={currentNotes}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold font-heading text-slate-900">
          Canadian Mortgage Calculator
        </h1>
        <p className="text-lg font-sans text-slate-600 max-w-3xl mx-auto">
          Your calculation results with detailed analysis and breakdown.
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center space-x-4">
        <div className="flex items-center space-x-2">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-400 text-white text-sm font-medium">
            1
          </span>
          <span className="text-sm font-medium font-sans text-slate-600">Input Details</span>
        </div>
        <ArrowRight className="h-4 w-4 text-slate-400" />
        <div className="flex items-center space-x-2">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-medium">
            2
          </span>
          <span className="text-sm font-medium font-sans text-slate-900">View Results</span>
        </div>
      </div>

      {/* Back Button and Results Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Edit</span>
        </button>
        <h2 className="text-2xl font-bold text-slate-900">Results</h2>
        <div className="w-24"></div> {/* Spacer for centering */}
      </div>

      {/* Tab Navigation */}
      <ResultsTabNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        enableInvestmentAnalysis={data.enableInvestmentAnalysis}
      />

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 min-h-[600px]">
        {renderTabContent()}
      </div>

      {/* Premium Comments Section - Always visible when user is logged in */}
      {user && (
        <CommentsSection
          calculationId={savedCalculationId || 'temp'}
          currentComments={currentComments}
        />
      )}

      {/* Save Message Display */}
      {saveMessage && (
        <div className={`border rounded-lg p-4 flex items-start ${
          saveMessage.type === 'success' ? 'bg-green-50 border-green-200' :
          saveMessage.type === 'info' ? 'bg-blue-50 border-blue-200' :
          'bg-amber-50 border-amber-200'
        }`}>
          <div className={`h-5 w-5 mr-3 mt-0.5 flex-shrink-0 ${
            saveMessage.type === 'success' ? 'text-green-600' :
            saveMessage.type === 'info' ? 'text-blue-600' :
            'text-amber-600'
          }`}>
            {saveMessage.type === 'warning' ? <AlertTriangle /> : <Info />}
          </div>
          <div className="flex-1">
            <h4 className={`font-medium mb-1 ${
              saveMessage.type === 'success' ? 'text-green-800' :
              saveMessage.type === 'info' ? 'text-blue-800' :
              'text-amber-800'
            }`}>
              {saveMessage.title}
            </h4>
            <p className={`text-sm mb-3 ${
              saveMessage.type === 'success' ? 'text-green-700' :
              saveMessage.type === 'info' ? 'text-blue-700' :
              'text-amber-700'
            }`}>
              {saveMessage.message}
            </p>
            {saveMessage.actions && (
              <div className="flex flex-col sm:flex-row gap-2">
                {saveMessage.actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.action}
                    className={`text-sm px-3 py-1 rounded transition-colors ${
                      action.variant === 'primary' 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300'
                    }`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <ResultsActionButtons
        onSave={handleSave}
        onShare={handleShare}
        isSaving={isSaving}
        user={user}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal && !!savedCalculationId}
        onClose={() => setShowShareModal(false)}
        calculationId={savedCalculationId}
        onCopyLink={handleCopyLink}
        copied={copied}
      />
    </div>
  );
};

export default MortgageResults;