import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Calculator, Home, MapPin, Percent, Calendar, MessageCircle } from 'lucide-react';
import { useCalculations } from '../contexts/CalculationContext';
import type { Database } from '../lib/supabase';

type MortgageCalculation = Database['public']['Tables']['mortgage_calculations']['Row'];

const SharedCalculation: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getCalculationAsync } = useCalculations();
  const [calculation, setCalculation] = useState<MortgageCalculation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCalculation = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const calc = await getCalculationAsync(id);
        setCalculation(calc);
      } catch (error) {
        console.error('Error fetching calculation:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCalculation();
  }, [id, getCalculationAsync]);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading calculation...</p>
      </div>
    );
  }

  if (!calculation) {
    return (
      <div className="text-center py-12">
        <Calculator className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Calculation Not Found</h1>
        <p className="text-gray-600">
          The calculation you're looking for doesn't exist or may have been deleted.
        </p>
      </div>
    );
  }

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

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Mortgage Calculation Summary</h1>
        <p className="text-lg text-gray-600">
          Detailed breakdown for ${calculation.home_price.toLocaleString()} property
        </p>
        <div className="flex items-center justify-center text-sm text-gray-500">
          <Calendar className="h-4 w-4 mr-1" />
          Created on {new Date(calculation.created_at).toLocaleDateString()}
        </div>
      </div>

      {/* Main Results */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Payment Info */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
              <Calculator className="h-6 w-6 mr-3 text-blue-600" />
              Payment Details
            </h2>
            
            <div className="bg-blue-50 p-6 rounded-lg">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  ${Math.round(monthlyPayment).toLocaleString()}
                </div>
                <div className="text-sm text-blue-700">
                  {calculation.payment_frequency === 'monthly' ? 'Monthly' : 'Bi-weekly'} Payment
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-lg font-semibold text-gray-900">
                  ${loanAmount.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Loan Amount</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-lg font-semibold text-gray-900">
                  ${Math.round(totalInterest).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Interest</div>
              </div>
            </div>
          </div>

          {/* Property Info */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
              <Home className="h-6 w-6 mr-3 text-emerald-600" />
              Property Details
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <span className="text-gray-600">Purchase Price</span>
                <span className="font-semibold text-gray-900">
                  ${calculation.home_price.toLocaleString()}
                </span>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <span className="text-gray-600">Down Payment</span>
                <span className="font-semibold text-gray-900">
                  ${calculation.down_payment.toLocaleString()} 
                  <span className="text-sm text-gray-500 ml-1">
                    ({Math.round((calculation.down_payment / calculation.home_price) * 100)}%)
                  </span>
                </span>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <span className="text-gray-600 flex items-center">
                  <Percent className="h-4 w-4 mr-1" />
                  Interest Rate
                </span>
                <span className="font-semibold text-gray-900">{calculation.interest_rate}%</span>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <span className="text-gray-600">Amortization</span>
                <span className="font-semibold text-gray-900">{calculation.amortization_years} years</span>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <span className="text-gray-600 flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  Location
                </span>
                <span className="font-semibold text-gray-900">
                  {calculation.city === 'toronto' ? 'Toronto, ON' : 'Vancouver, BC'}
                </span>
              </div>
              
              {calculation.is_first_time_buyer && (
                <div className="bg-green-50 p-3 rounded-lg">
                  <span className="text-green-800 font-medium">✓ First-Time Homebuyer</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      {calculation.comments && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <MessageCircle className="h-5 w-5 mr-2 text-blue-600" />
            Comments
          </h3>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-800 whitespace-pre-wrap">{calculation.comments}</p>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Summary</h3>
        <div className="grid md:grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">
              ${Math.round(totalCost).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Cost of Home</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              ${Math.round(totalInterest).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Interest Paid</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {Math.round((calculation.down_payment / calculation.home_price) * 100)}%
            </div>
            <div className="text-sm text-gray-600">Down Payment Ratio</div>
          </div>
        </div>
      </div>

      {/* Marketing Content (Premium Feature) */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="border-t border-gray-200 pt-6">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto flex items-center justify-center">
              <span className="text-white font-bold text-xl">MC</span>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-gray-900">Professional Mortgage Services</h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Get expert guidance on your mortgage journey. I help Canadian homebuyers navigate 
                the complex world of real estate financing with personalized advice and competitive rates.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center items-center text-sm text-gray-600">
                <span>📧 contact@mortgagecalc.ca</span>
                <span className="hidden sm:inline">•</span>
                <span>📱 (416) 555-0123</span>
                <span className="hidden sm:inline">•</span>
                <span>🌐 Licensed in ON & BC</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedCalculation;