import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
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

interface MortgageResultsProps {
  data: MortgageData;
  onBack: () => void;
}

const MortgageResults: React.FC<MortgageResultsProps> = ({ data, onBack }) => {
  const { user } = useAuth();
  const { saveCalculation } = useCalculations();
  const [activeTab, setActiveTab] = useState<'mortgage' | 'closing' | 'amortization' | 'investment'>('mortgage');
  const [showShareModal, setShowShareModal] = useState(false);
  const [calculationId, setCalculationId] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

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
        notes: {},
        comments: null
      };
      
      const id = await saveCalculation(calculationData);
      setCalculationId(id);
      setShowShareModal(true);
    } catch (error) {
      console.error('Error saving calculation:', error);
      alert('Failed to save calculation. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    if (calculationId) {
      setShowShareModal(true);
      return;
    }
    await handleSave();
  };

  const handleCopyLink = async () => {
    if (!calculationId) return;
    
    const shareUrl = `${window.location.origin}/shared/${calculationId}`;
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
          />
        );

      case 'closing':
        return (
          <ClosingCostsTab
            data={data}
            closingCosts={closingCosts}
          />
        );

      case 'amortization':
        return (
          <AmortizationTab
            loanAmount={loanAmount}
            totalInterest={totalInterest}
            amortizationYears={data.amortizationYears}
            amortizationSchedule={amortizationSchedule}
          />
        );

      case 'investment':
        return (
          <InvestmentAnalysisTab
            data={data}
            investmentMetrics={investmentMetrics}
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
          <span>Back to Input</span>
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

      {/* Action Buttons */}
      <ResultsActionButtons
        onSave={handleSave}
        onShare={handleShare}
        isSaving={isSaving}
        user={user}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal && !!calculationId}
        onClose={() => setShowShareModal(false)}
        calculationId={calculationId}
        onCopyLink={handleCopyLink}
        copied={copied}
      />
    </div>
  );
};

export default MortgageResults;