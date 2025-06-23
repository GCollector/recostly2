import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Calculator, Trash2, Share2, Eye, Calendar, Crown, Plus, Copy, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCalculations } from '../contexts/CalculationContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { calculations, deleteCalculation, cloneCalculation } = useCalculations();
  const [searchParams] = useSearchParams();
  const [showSuccess, setShowSuccess] = useState(false);
  const [cloneLoading, setCloneLoading] = useState<string | null>(null);
  const [cloneError, setCloneError] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    }
  }, [searchParams]);

  if (!user) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h1>
        <p className="text-gray-600 mb-8">You need to be signed in to view your calculations.</p>
        <Link
          to="/login"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const handleViewCalculation = (calc: any) => {
    navigate('/calculator', { 
      state: { 
        calculationData: {
          homePrice: calc.home_price,
          downPayment: calc.down_payment,
          interestRate: calc.interest_rate,
          amortizationYears: calc.amortization_years,
          paymentFrequency: calc.payment_frequency,
          province: calc.province,
          city: calc.city,
          isFirstTimeBuyer: calc.is_first_time_buyer,
          enableInvestmentAnalysis: calc.notes?.enableInvestmentAnalysis || false,
          enableClosingCosts: calc.notes?.enableClosingCosts !== false,
          showMarketingOnShare: calc.notes?.showMarketingOnShare !== false,
          enableAffordabilityEstimator: calc.notes?.enableAffordabilityEstimator || false,
          enableRentVsBuy: calc.notes?.enableRentVsBuy || false,
          monthlyRent: calc.notes?.investment_data?.monthlyRent || 2500,
          monthlyExpenses: calc.notes?.investment_data?.monthlyExpenses || {
            taxes: 400,
            insurance: 150,
            condoFees: 300,
            maintenance: 200,
            other: 100
          }
        },
        startAtStep: 2,
        calculationId: calc.id,
        notes: calc.notes || {},
        comments: calc.comments || ''
      }
    });
  };

  const handleShare = async (calculationId: string) => {
    const shareUrl = `${window.location.origin}/shared/${calculationId}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('Share link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const handleDelete = async (calculationId: string) => {
    if (window.confirm('Are you sure you want to delete this calculation?')) {
      try {
        await deleteCalculation(calculationId);
      } catch (error) {
        console.error('Error deleting calculation:', error);
        alert('Failed to delete calculation. Please try again.');
      }
    }
  };

  const handleClone = async (calculationId: string) => {
    setCloneLoading(calculationId);
    setCloneError('');
    
    try {
      const newCalculationId = await cloneCalculation(calculationId);
      
      // Navigate to the cloned calculation for editing
      const originalCalc = calculations.find(calc => calc.id === calculationId);
      if (originalCalc) {
        navigate('/calculator', {
          state: {
            calculationData: {
              homePrice: originalCalc.home_price,
              downPayment: originalCalc.down_payment,
              interestRate: originalCalc.interest_rate,
              amortizationYears: originalCalc.amortization_years,
              paymentFrequency: originalCalc.payment_frequency,
              province: originalCalc.province,
              city: originalCalc.city,
              isFirstTimeBuyer: originalCalc.is_first_time_buyer,
              enableInvestmentAnalysis: originalCalc.notes?.enableInvestmentAnalysis || false,
              enableClosingCosts: originalCalc.notes?.enableClosingCosts !== false,
              showMarketingOnShare: originalCalc.notes?.showMarketingOnShare !== false,
              enableAffordabilityEstimator: originalCalc.notes?.enableAffordabilityEstimator || false,
              enableRentVsBuy: originalCalc.notes?.enableRentVsBuy || false,
              monthlyRent: originalCalc.notes?.investment_data?.monthlyRent || 2500,
              monthlyExpenses: originalCalc.notes?.investment_data?.monthlyExpenses || {
                taxes: 400,
                insurance: 150,
                condoFees: 300,
                maintenance: 200,
                other: 100
              }
            },
            startAtStep: 1, // Start at input form for editing
            calculationId: newCalculationId,
            notes: originalCalc.notes || {},
            comments: originalCalc.comments || ''
          }
        });
      }
    } catch (error: any) {
      console.error('Error cloning calculation:', error);
      
      if (error.type === 'SAVE_LIMIT_REACHED') {
        setCloneError('Free users can only save 1 calculation. Upgrade to Basic plan for unlimited calculations, or delete your existing calculation to clone this one.');
      } else {
        setCloneError('Failed to clone calculation. Please try again.');
      }
    } finally {
      setCloneLoading(null);
    }
  };

  const canClone = (calculationId: string): boolean => {
    if (user.tier === 'free') {
      // Free users can only have 1 calculation, so they can't clone unless they have 0
      return calculations.length === 0;
    }
    // Basic and premium users can clone unlimited
    return true;
  };

  const hasActualNotes = (notes: any) => {
    if (!notes) return false;
    
    return ['mortgage', 'closing', 'amortization', 'investment', 'rentVsBuy'].some(section => {
      return notes[section] && notes[section].trim().length > 0;
    });
  };

  const hasActualComments = (comments: string | null) => {
    return comments && comments.trim().length > 0;
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Success Message */}
      {showSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <Crown className="h-5 w-5 mr-2" />
            <span>Subscription updated successfully! Your new features are now available.</span>
          </div>
        </div>
      )}

      {/* Clone Error Message */}
      {cloneError && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium mb-1">Cannot Clone Calculation</p>
              <p className="text-sm">{cloneError}</p>
              <div className="mt-2">
                <Link
                  to="/pricing"
                  className="text-sm bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded transition-colors"
                >
                  Upgrade Now
                </Link>
              </div>
            </div>
            <button
              onClick={() => setCloneError('')}
              className="text-amber-400 hover:text-amber-600"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Calculations</h1>
        <p className="text-base md:text-lg text-gray-600">
          View and manage all your saved mortgage calculations.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="bg-blue-100 w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center mr-3 md:mr-4">
              <Calculator className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
            </div>
            <div>
              <div className="text-xl md:text-2xl font-bold text-gray-900">{calculations.length}</div>
              <div className="text-xs md:text-sm text-gray-600">Saved Calculations</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center mr-3 md:mr-4 ${
              user.tier === 'premium' ? 'bg-amber-100' : 'bg-blue-100'
            }`}>
              <Crown className={`h-5 w-5 md:h-6 md:w-6 ${
                user.tier === 'premium' ? 'text-amber-600' : 'text-blue-600'
              }`} />
            </div>
            <div>
              <div className="text-base md:text-lg font-bold text-gray-900 capitalize">{user.tier} Plan</div>
              <div className="text-xs md:text-sm text-gray-600">Account Type</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-200 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center">
            <div className="bg-emerald-100 w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center mr-3 md:mr-4">
              <Calculator className="h-5 w-5 md:h-6 md:w-6 text-emerald-600" />
            </div>
            <div>
              <div className="text-lg md:text-2xl font-bold text-gray-900">
                {calculations.reduce((sum, calc) => sum + calc.home_price, 0).toLocaleString('en-CA', { 
                  style: 'currency', 
                  currency: 'CAD',
                  maximumFractionDigits: 0 
                })}
              </div>
              <div className="text-xs md:text-sm text-gray-600">Total Property Value</div>
            </div>
          </div>
        </div>
      </div>

      {/* Saved Calculations */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 md:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">Saved Calculations</h2>
            <Link
              to="/calculator"
              className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Calculation
            </Link>
          </div>
        </div>

        {calculations.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {calculations.map((calc) => (
              <div key={calc.id} className="p-4 md:p-6 hover:bg-gray-50 transition-colors">
                <div className="space-y-4">
                  {/* Header Row */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <button
                          onClick={() => handleViewCalculation(calc)}
                          className="text-base md:text-lg font-medium text-blue-600 hover:text-blue-700 transition-colors cursor-pointer truncate"
                        >
                          ${calc.home_price.toLocaleString()} Home
                        </button>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          calc.city === 'toronto' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {calc.city === 'toronto' ? 'Toronto' : 'Vancouver'}
                        </span>
                        {calc.is_first_time_buyer && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            First-Time Buyer
                          </span>
                        )}
                        {hasActualNotes(calc.notes) && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            Has Notes
                          </span>
                        )}
                        {hasActualComments(calc.comments) && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Has Comments
                          </span>
                        )}
                      </div>
                      
                      {/* Date */}
                      <div className="flex items-center text-xs md:text-sm text-gray-500">
                        <Calendar className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                        {new Date(calc.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                      <button
                        onClick={() => handleViewCalculation(calc)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                        title="View Results"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <Link
                        to={`/shared/${calc.id}`}
                        className="p-2 text-gray-400 hover:text-green-600 transition-colors rounded-lg hover:bg-green-50"
                        title="View Shared Page"
                      >
                        <Calculator className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleShare(calc.id)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                        title="Share"
                      >
                        <Share2 className="h-4 w-4" />
                      </button>
                      {canClone(calc.id) && (
                        <button
                          onClick={() => handleClone(calc.id)}
                          disabled={cloneLoading === calc.id}
                          className="p-2 text-gray-400 hover:text-purple-600 transition-colors rounded-lg hover:bg-purple-50 disabled:opacity-50"
                          title="Clone Calculation"
                        >
                          {cloneLoading === calc.id ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-purple-600 border-t-transparent" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(calc.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs md:text-sm text-gray-600">
                    <div className="space-y-1">
                      <div className="font-medium text-gray-700">Payment</div>
                      <div className="text-gray-900 font-semibold">
                        ${calc.monthly_payment.toLocaleString()}
                      </div>
                      <div className="text-gray-500 capitalize">
                        {calc.payment_frequency}
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="font-medium text-gray-700">Down Payment</div>
                      <div className="text-gray-900 font-semibold">
                        ${calc.down_payment.toLocaleString()}
                      </div>
                      <div className="text-gray-500">
                        {Math.round((calc.down_payment / calc.home_price) * 100)}%
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="font-medium text-gray-700">Interest Rate</div>
                      <div className="text-gray-900 font-semibold">
                        {calc.interest_rate}%
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="font-medium text-gray-700">Term</div>
                      <div className="text-gray-900 font-semibold">
                        {calc.amortization_years} years
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 md:p-12 text-center">
            <Calculator className="h-10 w-10 md:h-12 md:w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">No calculations yet</h3>
            <p className="text-sm md:text-base text-gray-600 mb-6">
              Start by creating your first mortgage calculation to see it appear here.
            </p>
            <Link
              to="/calculator"
              className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Calculation
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;