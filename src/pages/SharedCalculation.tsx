import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calculator, Home, MapPin, Percent, Calendar, MessageCircle, User, ArrowLeft, AlertTriangle } from 'lucide-react';
import { useCalculations } from '../contexts/CalculationContext';
import { supabase } from '../lib/supabase';
import { calculateMonthlyPayment, calculateClosingCosts, generateAmortizationSchedule } from '../utils/mortgageCalculations';
import ResultsTabNavigation from '../components/results/ResultsTabNavigation';
import MortgageSummaryTab from '../components/results/MortgageSummaryTab';
import ClosingCostsTab from '../components/results/ClosingCostsTab';
import AmortizationTab from '../components/results/AmortizationTab';
import type { Database } from '../lib/supabase';

type MortgageCalculation = Database['public']['Tables']['mortgage_calculation']['Row'];
type Profile = Database['public']['Tables']['profile']['Row'];

const SharedCalculation: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getCalculationAsync } = useCalculations();
  const [calculation, setCalculation] = useState<MortgageCalculation | null>(null);
  const [owner, setOwner] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'mortgage' | 'closing' | 'amortization'>('mortgage');
  const [showMarketingContent, setShowMarketingContent] = useState(true);

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
      } catch (error) {
        console.error('Error fetching calculation:', error);
        setError('An unexpected error occurred. Please try again later.');
      } finally {
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
          <Link
            to="/calculator"
            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium font-sans transition-colors"
          >
            <Calculator className="h-4 w-4" />
            <span>Create New Calculation</span>
          </Link>
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
          <Link
            to="/calculator"
            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium font-sans transition-colors"
          >
            <Calculator className="h-4 w-4" />
            <span>Create New Calculation</span>
          </Link>
        </div>
      </div>
    );
  }

  // Calculate derived values for display
  const loanAmount = calculation.home_price - calculation.down_payment;
  const monthlyRate = calculation.interest_rate / 100 / 12;
  const monthlyPayment = calculateMonthlyPayment(loanAmount, calculation.interest_rate, calculation.amortization_years);
  const totalCost = monthlyPayment * calculation.amortization_years * 12 + calculation.down_payment;
  const totalInterest = totalCost - calculation.home_price;
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

  // Create MortgageData object for components
  const mortgageData = {
    homePrice: calculation.home_price,
    downPayment: calculation.down_payment,
    interestRate: calculation.interest_rate,
    amortizationYears: calculation.amortization_years,
    paymentFrequency: calculation.payment_frequency,
    province: calculation.province,
    city: calculation.city,
    isFirstTimeBuyer: calculation.is_first_time_buyer,
    enableInvestmentAnalysis: false, // Shared calculations don't show investment analysis
    monthlyRent: 2500,
    monthlyExpenses: {
      taxes: 400,
      insurance: 150,
      condoFees: 300,
      maintenance: 200,
      other: 100
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'mortgage':
        return (
          <MortgageSummaryTab
            data={mortgageData}
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
            data={mortgageData}
            closingCosts={closingCosts}
          />
        );
      case 'amortization':
        return (
          <AmortizationTab
            loanAmount={loanAmount}
            totalInterest={totalInterest}
            amortizationYears={calculation.amortization_years}
            amortizationSchedule={amortizationSchedule}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header with Back Link */}
      <div className="flex items-center space-x-4 mb-6">
        <Link
          to="/calculator"
          className="inline-flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="font-sans">Create Your Own</span>
        </Link>
      </div>

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

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="grid grid-cols-3 gap-1">
          <button
            onClick={() => setActiveTab('mortgage')}
            className={`flex flex-col items-center justify-center p-4 rounded-lg text-center transition-all duration-200 ${
              activeTab === 'mortgage'
                ? 'bg-blue-100 text-blue-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Calculator className="h-6 w-6 mb-2" />
            <span className="text-sm font-medium hidden sm:block">Mortgage Summary</span>
            <span className="text-sm font-medium sm:hidden">Summary</span>
          </button>
          <button
            onClick={() => setActiveTab('closing')}
            className={`flex flex-col items-center justify-center p-4 rounded-lg text-center transition-all duration-200 ${
              activeTab === 'closing'
                ? 'bg-blue-100 text-blue-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Home className="h-6 w-6 mb-2" />
            <span className="text-sm font-medium hidden sm:block">Closing Costs</span>
            <span className="text-sm font-medium sm:hidden">Closing</span>
          </button>
          <button
            onClick={() => setActiveTab('amortization')}
            className={`flex flex-col items-center justify-center p-4 rounded-lg text-center transition-all duration-200 ${
              activeTab === 'amortization'
                ? 'bg-blue-100 text-blue-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Calculator className="h-6 w-6 mb-2" />
            <span className="text-sm font-medium hidden sm:block">Amortization</span>
            <span className="text-sm font-medium sm:hidden">Schedule</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 min-h-[600px]">
        {renderTabContent()}
      </div>

      {/* Comments Section */}
      {calculation.comments && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold font-heading text-slate-900 mb-4 flex items-center">
            <MessageCircle className="h-5 w-5 mr-2 text-blue-600" />
            Comments
          </h3>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="font-sans text-blue-800 whitespace-pre-wrap">{calculation.comments}</p>
          </div>
        </div>
      )}

      {/* Marketing Content (Premium Feature) */}
      {owner && owner.tier === 'premium' && (owner.marketing_image || owner.marketing_copy) && showMarketingContent && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold font-heading text-slate-900">Professional Services</h3>
            <button
              onClick={() => setShowMarketingContent(false)}
              className="text-slate-400 hover:text-slate-600 text-sm"
            >
              Hide
            </button>
          </div>
          <div className="border-t border-slate-200 pt-6">
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
        </div>
      )}

      {/* Default Marketing Content for Non-Premium Users */}
      {(!owner || owner.tier !== 'premium' || (!owner.marketing_image && !owner.marketing_copy) || !showMarketingContent) && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <div className="border-t border-slate-200 pt-6">
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
        </div>
      )}

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-center text-white">
        <h2 className="text-2xl font-bold font-heading mb-4">Create Your Own Calculation</h2>
        <p className="font-sans text-blue-100 mb-6 max-w-2xl mx-auto">
          Use our professional mortgage calculator to explore different scenarios and find the perfect financing solution for your needs.
        </p>
        <Link
          to="/calculator"
          className="inline-flex items-center space-x-2 bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-medium font-sans transition-colors shadow-lg"
        >
          <Calculator className="h-4 w-4" />
          <span>Start New Calculation</span>
        </Link>
      </div>
    </div>
  );
};

export default SharedCalculation;