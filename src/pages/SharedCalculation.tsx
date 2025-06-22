import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calculator, Home, MapPin, Percent, Calendar, MessageCircle, User, ArrowLeft, AlertTriangle } from 'lucide-react';
import { useCalculations } from '../contexts/CalculationContext';
import { supabase } from '../lib/supabase';
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
            return;
          }
          
          calc = data;
        }
        
        if (!calc) {
          setError('Calculation not found. The link may be invalid or the calculation may have been deleted.');
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

  // Calculate derived values
  const monthlyRate = calculation.interest_rate / 100 / 12;
  const totalPayments = calculation.amortization_years * 12;
  const loanAmount = calculation.home_price - calculation.down_payment;
  
  let monthlyPayment = 0;
  if (monthlyRate > 0) {
    monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
                    (Math.pow(1 + monthlyRate, totalPayments) - 1);
  } else {
    monthlyPayment = loanAmount / totalPayments;
  }

  const totalCost = monthlyPayment * totalPayments + calculation.down_payment;
  const totalInterest = totalCost - calculation.home_price;
  const downPaymentPercent = Math.round((calculation.down_payment / calculation.home_price) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
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
            Mortgage Calculation Summary
          </h1>
          <p className="text-lg font-sans text-slate-600">
            Detailed breakdown for ${calculation.home_price.toLocaleString()} property
          </p>
          <div className="flex items-center justify-center text-sm font-sans text-slate-500">
            <Calendar className="h-4 w-4 mr-1" />
            Created on {new Date(calculation.created_at).toLocaleDateString()}
          </div>
        </div>

        {/* Main Results Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 lg:p-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Payment Information */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold font-heading text-slate-900 flex items-center">
                <Calculator className="h-6 w-6 mr-3 text-blue-600" />
                Payment Details
              </h2>
              
              <div className="bg-blue-50 p-6 rounded-xl">
                <div className="text-center">
                  <div className="text-4xl font-bold font-heading text-blue-600 mb-2">
                    ${Math.round(monthlyPayment).toLocaleString()}
                  </div>
                  <div className="text-sm font-sans text-blue-700">
                    {calculation.payment_frequency === 'monthly' ? 'Monthly' : 'Bi-weekly'} Payment
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="text-lg font-semibold font-heading text-slate-900">
                    ${loanAmount.toLocaleString()}
                  </div>
                  <div className="text-sm font-sans text-slate-600">Loan Amount</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="text-lg font-semibold font-heading text-slate-900">
                    ${Math.round(totalInterest).toLocaleString()}
                  </div>
                  <div className="text-sm font-sans text-slate-600">Total Interest</div>
                </div>
              </div>
            </div>

            {/* Property Information */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold font-heading text-slate-900 flex items-center">
                <Home className="h-6 w-6 mr-3 text-emerald-600" />
                Property Details
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-slate-200">
                  <span className="font-sans text-slate-600">Purchase Price</span>
                  <span className="font-semibold font-heading text-slate-900">
                    ${calculation.home_price.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-slate-200">
                  <span className="font-sans text-slate-600">Down Payment</span>
                  <span className="font-semibold font-heading text-slate-900">
                    ${calculation.down_payment.toLocaleString()} 
                    <span className="text-sm font-sans text-slate-500 ml-1">
                      ({downPaymentPercent}%)
                    </span>
                  </span>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-slate-200">
                  <span className="font-sans text-slate-600 flex items-center">
                    <Percent className="h-4 w-4 mr-1" />
                    Interest Rate
                  </span>
                  <span className="font-semibold font-heading text-slate-900">{calculation.interest_rate}%</span>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-slate-200">
                  <span className="font-sans text-slate-600">Amortization</span>
                  <span className="font-semibold font-heading text-slate-900">{calculation.amortization_years} years</span>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-slate-200">
                  <span className="font-sans text-slate-600 flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    Location
                  </span>
                  <span className="font-semibold font-heading text-slate-900">
                    {calculation.city === 'toronto' ? 'Toronto, ON' : 'Vancouver, BC'}
                  </span>
                </div>
                
                {calculation.is_first_time_buyer && (
                  <div className="bg-green-50 p-3 rounded-lg">
                    <span className="font-medium font-sans text-green-800">✓ First-Time Homebuyer</span>
                  </div>
                )}
              </div>
            </div>
          </div>
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

        {/* Financial Summary */}
        <div className="bg-slate-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold font-heading text-slate-900 mb-4">Financial Summary</h3>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold font-heading text-slate-900">
                ${Math.round(totalCost).toLocaleString()}
              </div>
              <div className="text-sm font-sans text-slate-600">Total Cost of Home</div>
            </div>
            <div>
              <div className="text-2xl font-bold font-heading text-slate-900">
                ${Math.round(totalInterest).toLocaleString()}
              </div>
              <div className="text-sm font-sans text-slate-600">Total Interest Paid</div>
            </div>
            <div>
              <div className="text-2xl font-bold font-heading text-slate-900">
                {downPaymentPercent}%
              </div>
              <div className="text-sm font-sans text-slate-600">Down Payment Ratio</div>
            </div>
          </div>
        </div>

        {/* Marketing Content (Premium Feature) */}
        {owner && owner.tier === 'premium' && (owner.marketing_image || owner.marketing_copy) && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
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
        {(!owner || owner.tier !== 'premium' || (!owner.marketing_image && !owner.marketing_copy)) && (
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
    </div>
  );
};

export default SharedCalculation;