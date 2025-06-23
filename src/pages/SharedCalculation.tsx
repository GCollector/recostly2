import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Calculator, Calendar, User, AlertTriangle } from 'lucide-react';
import { useCalculations } from '../contexts/CalculationContext';
import { supabase } from '../lib/supabase';
import { calculateMonthlyPayment, calculateClosingCosts, generateAmortizationSchedule, calculateTotalLoanAmount } from '../utils/mortgageCalculations';
import type { Database } from '../lib/supabase';
import NotesSection from '../components/shared/NotesSection';
import CommentsSection from '../components/shared/CommentsSection';
import ResultsTabNavigation from '../components/results/ResultsTabNavigation';
import MortgageSummaryTab from '../components/results/MortgageSummaryTab';
import ClosingCostsTab from '../components/results/ClosingCostsTab';
import AmortizationTab from '../components/results/AmortizationTab';
import InvestmentAnalysisTab from '../components/results/InvestmentAnalysisTab';
import { calculateInvestmentMetrics } from '../utils/mortgageCalculations';

type MortgageCalculation = Database['public']['Tables']['mortgage_calculation']['Row'];
type Profile = Database['public']['Tables']['profile']['Row'];

const SharedCalculation: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getCalculationAsync } = useCalculations();
  const [calculation, setCalculation] = useState<MortgageCalculation | null>(null);
  const [owner, setOwner] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'mortgage' | 'closing' | 'amortization' | 'investment'>('mortgage');

  useEffect(() => {
    const fetchCalculation = async () => {
      if (!id) {
        setError('No calculation ID provided');
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError('');
      
      try {
        console.log('Fetching calculation with ID:', id);
        
        // Try to get calculation from context first
        let calc = await getCalculationAsync(id);
        
        // If not found in context, try direct database query
        if (!calc) {
          console.log('Not found in context, querying database directly...');
          const { data, error: dbError } = await supabase
            .from('mortgage_calculation')
            .select('*')
            .eq('id', id)
            .single();
          
          if (dbError) {
            console.error('Database error:', dbError);
            if (dbError.code === 'PGRST116') {
              setError('Calculation not found. The link may be invalid or the calculation may have been deleted.');
            } else {
              setError('Failed to load calculation. Please try again later.');
            }
            setIsLoading(false);
            return;
          }
          
          calc = data;
        }
        
        if (!calc) {
          setError('Calculation not found. The link may be invalid or the calculation may have been deleted.');
          setIsLoading(false);
          return;
        }
        
        console.log('Calculation found:', calc);
        setCalculation(calc);

        // If calculation has an owner, fetch their profile for marketing content
        if (calc.user_id) {
          console.log('Fetching owner profile for user:', calc.user_id);
          const { data: profile, error: profileError } = await supabase
            .from('profile')
            .select('*')
            .eq('id', calc.user_id)
            .single();
          
          if (profileError) {
            console.warn('Could not fetch owner profile:', profileError);
          } else if (profile) {
            console.log('Owner profile found:', profile);
            setOwner(profile);
          }
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching calculation:', error);
        setError('An unexpected error occurred. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchCalculation();
  }, [id, getCalculationAsync]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-sans">Loading calculation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold font-heading text-slate-900 mb-4">Calculation Not Found</h1>
          <p className="text-slate-600 font-sans mb-6">{error}</p>
        </div>
      </div>
    );
  }

  if (!calculation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <Calculator className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold font-heading text-slate-900 mb-4">Calculation Not Found</h1>
          <p className="text-slate-600 font-sans mb-6">
            The calculation you're looking for doesn't exist or may have been deleted.
          </p>
        </div>
      </div>
    );
  }

  // Determine if closing costs and investment analysis are enabled
  const enableClosingCosts = calculation.notes?.enableClosingCosts !== false; // Default to true if not specified
  const enableInvestmentAnalysis = !!calculation.notes?.enableInvestmentAnalysis || !!calculation.notes?.investment_data;

  // Calculate loan amounts including CMHC insurance
  const loanCalculation = calculateTotalLoanAmount(calculation.home_price, calculation.down_payment);
  
  // Calculate derived values for display
  const loanAmount = loanCalculation.totalLoanAmount;
  const baseLoanAmount = loanCalculation.baseLoanAmount;
  const cmhcPremium = loanCalculation.cmhcPremium;
  const monthlyRate = calculation.interest_rate / 100 / 12;
  const monthlyPayment = calculation.monthly_payment;
  const totalCost = monthlyPayment * calculation.amortization_years * 12 + calculation.down_payment;
  const totalInterest = calculation.total_interest;
  const downPaymentPercent = Math.round((calculation.down_payment / calculation.home_price) * 100);

  // Calculate closing costs
  const closingCosts = calculateClosingCosts(
    calculation.home_price, 
    calculation.province, 
    calculation.city, 
    calculation.is_first_time_buyer
  );

  // Generate amortization schedule
  const amortizationSchedule = generateAmortizationSchedule(
    loanAmount, 
    monthlyPayment, 
    monthlyRate, 
    calculation.amortization_years
  );

  // Calculate investment metrics if data exists
  const investmentMetrics = calculation.notes && 
    typeof calculation.notes === 'object' && 
    calculation.notes.investment_data ? 
    calculateInvestmentMetrics(
      calculation.home_price,
      calculation.down_payment,
      monthlyPayment,
      calculation.notes.investment_data.monthlyRent || 0,
      calculation.notes.investment_data.monthlyExpenses || {
        taxes: 0,
        insurance: 0,
        condoFees: 0,
        maintenance: 0,
        other: 0
      }
    ) : null;

  // Check if marketing should be shown (default to true if not specified)
  const showMarketingContent = calculation.notes?.showMarketingOnShare !== false;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'mortgage':
        return (
          <MortgageSummaryTab
            data={{
              homePrice: calculation.home_price,
              downPayment: calculation.down_payment,
              interestRate: calculation.interest_rate,
              amortizationYears: calculation.amortization_years,
              paymentFrequency: calculation.payment_frequency,
              province: calculation.province,
              city: calculation.city,
              isFirstTimeBuyer: calculation.is_first_time_buyer,
              enableInvestmentAnalysis: enableInvestmentAnalysis,
              enableClosingCosts: enableClosingCosts,
              showMarketingOnShare: true
            }}
            monthlyPayment={monthlyPayment}
            loanAmount={loanAmount}
            baseLoanAmount={baseLoanAmount}
            cmhcPremium={cmhcPremium}
            totalInterest={totalInterest}
            totalCost={totalCost}
            downPaymentPercent={downPaymentPercent}
            calculationId={calculation.id}
            currentNotes={calculation.notes || {}}
            readonly={true}
          />
        );

      case 'closing':
        return (
          <ClosingCostsTab
            data={{
              homePrice: calculation.home_price,
              downPayment: calculation.down_payment,
              interestRate: calculation.interest_rate,
              amortizationYears: calculation.amortization_years,
              paymentFrequency: calculation.payment_frequency,
              province: calculation.province,
              city: calculation.city,
              isFirstTimeBuyer: calculation.is_first_time_buyer,
              enableInvestmentAnalysis: enableInvestmentAnalysis,
              enableClosingCosts: enableClosingCosts,
              showMarketingOnShare: true
            }}
            closingCosts={closingCosts}
            calculationId={calculation.id}
            currentNotes={calculation.notes || {}}
            readonly={true}
          />
        );

      case 'amortization':
        return (
          <AmortizationTab
            loanAmount={loanAmount}
            totalInterest={totalInterest}
            amortizationYears={calculation.amortization_years}
            amortizationSchedule={amortizationSchedule}
            calculationId={calculation.id}
            currentNotes={calculation.notes || {}}
            readonly={true}
          />
        );

      case 'investment':
        return (
          <InvestmentAnalysisTab
            data={{
              homePrice: calculation.home_price,
              downPayment: calculation.down_payment,
              interestRate: calculation.interest_rate,
              amortizationYears: calculation.amortization_years,
              paymentFrequency: calculation.payment_frequency,
              province: calculation.province,
              city: calculation.city,
              isFirstTimeBuyer: calculation.is_first_time_buyer,
              enableInvestmentAnalysis: true,
              enableClosingCosts: enableClosingCosts,
              showMarketingOnShare: true,
              monthlyRent: calculation.notes?.investment_data?.monthlyRent,
              monthlyExpenses: calculation.notes?.investment_data?.monthlyExpenses
            }}
            investmentMetrics={investmentMetrics}
            calculationId={calculation.id}
            currentNotes={calculation.notes || {}}
            readonly={true}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Main Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold font-heading text-slate-900">
          Mortgage Calculation Results
        </h1>
        <p className="text-lg font-sans text-slate-600">
          Detailed analysis for ${calculation.home_price.toLocaleString()} property
        </p>
        <div className="flex items-center justify-center text-sm font-sans text-slate-500">
          <Calendar className="h-4 w-4 mr-1" />
          Created on {new Date(calculation.created_at).toLocaleDateString()}
        </div>
      </div>

      {/* Professional Services Section - Only show if premium user and enabled */}
      {owner && owner.tier === 'premium' && showMarketingContent && (owner.marketing_image || owner.marketing_copy) && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <div className="text-center space-y-4">
            {owner.marketing_image ? (
              <img
                src={owner.marketing_image}
                alt="Professional"
                className="w-20 h-20 object-cover rounded-full mx-auto"
              />
            ) : (
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto flex items-center justify-center">
                <User className="h-10 w-10 text-white" />
              </div>
            )}
            
            <div className="space-y-2">
              <h3 className="text-xl font-semibold font-heading text-slate-900">{owner.name}</h3>
              {owner.marketing_copy ? (
                <p className="font-sans text-slate-600 max-w-2xl mx-auto whitespace-pre-wrap">
                  {owner.marketing_copy}
                </p>
              ) : (
                <p className="font-sans text-slate-600 max-w-2xl mx-auto">
                  Professional mortgage and real estate services. Contact me for personalized assistance with your home buying journey.
                </p>
              )}
              <div className="text-sm font-sans text-slate-500">
                <span>📧 {owner.email}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Default Marketing Content for Non-Premium Users or when marketing is disabled */}
      {(!owner || owner.tier !== 'premium' || !showMarketingContent || (!owner.marketing_image && !owner.marketing_copy)) && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto flex items-center justify-center">
              <Calculator className="h-10 w-10 text-white" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold font-heading text-slate-900">Professional Mortgage Calculator</h3>
              <p className="font-sans text-slate-600 max-w-2xl mx-auto">
                Get expert guidance on your mortgage journey. Our professional mortgage calculator 
                helps Canadian homebuyers navigate the complex world of real estate financing with 
                accurate calculations and detailed breakdowns.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center items-center text-sm font-sans text-slate-600">
                <span>🏠 Canadian Real Estate Focus</span>
                <span className="hidden sm:inline">•</span>
                <span>📊 Professional Grade Calculations</span>
                <span className="hidden sm:inline">•</span>
                <span>🔒 Secure & Private</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <ResultsTabNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        enableInvestmentAnalysis={enableInvestmentAnalysis}
        enableClosingCosts={enableClosingCosts}
      />

      {/* Tab Content with Interactive Charts */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 min-h-[600px]">
        {renderTabContent()}
      </div>

      {/* Readonly Comments Section - Only show if comments exist */}
      {calculation.comments && (
        <CommentsSection
          calculationId={calculation.id}
          currentComments={calculation.comments}
          readonly={true}
        />
      )}
    </div>
  );
};

export default SharedCalculation;