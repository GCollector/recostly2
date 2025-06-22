import React, { useState, useEffect } from 'react';
import { Save, Share2, Copy, CheckCircle, Crown, AlertTriangle, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCalculations } from '../contexts/CalculationContext';
import { supabase } from '../lib/supabase';
import NotesSection from './NotesSection';

interface CalculationResult {
  monthlyPayment: number;
  totalInterest: number;
  totalCost: number;
  loanAmount: number;
  biWeeklyPayment?: number;
  paymentSchedule?: {
    year: number;
    principalPayment: number;
    interestPayment: number;
    balance: number;
    totalPayment: number;
    cumulativeInterest: number;
  }[];
}

const MortgageCalculator: React.FC = () => {
  const { user } = useAuth();
  const { saveCalculation, saveToLocalStorage, hasLocalCalculation } = useCalculations();
  
  const [homePrice, setHomePrice] = useState(500000);
  const [downPayment, setDownPayment] = useState(100000);
  const [interestRate, setInterestRate] = useState(5.25);
  const [amortizationYears, setAmortizationYears] = useState(25);
  const [paymentFrequency, setPaymentFrequency] = useState<'monthly' | 'bi-weekly'>('monthly');
  const [province, setProvince] = useState<'ontario' | 'bc'>('ontario');
  const [city, setCity] = useState<'toronto' | 'vancouver'>('toronto');
  const [isFirstTimeBuyer, setIsFirstTimeBuyer] = useState(false);
  
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [calculationId, setCalculationId] = useState<string>('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [calculationError, setCalculationError] = useState('');

  // IMMEDIATE TEST - This should run when component mounts
  useEffect(() => {
    console.log('🚀 MortgageCalculator component mounted');
    console.log('🔍 Initial state:', {
      user: user ? `${user.email} (${user.tier})` : 'No user',
      saveCalculation: typeof saveCalculation,
      hasLocalCalculation
    });
    
    // Test if console.log works at all
    console.log('✅ Console logging is working');
    
    // Test if we can access window
    console.log('🌐 Window object:', typeof window);
    
    // Test if React events work
    console.log('⚛️ React is working');
  }, []);

  const calculateMortgage = async () => {
    console.log('🧮 Starting server-side mortgage calculation...');
    
    setIsCalculating(true);
    setCalculationError('');
    
    try {
      const { data, error } = await supabase.functions.invoke('calculate-mortgage', {
        body: {
          homePrice,
          downPayment,
          interestRate,
          amortizationYears,
          paymentFrequency,
          province,
          city,
          isFirstTimeBuyer
        }
      });

      if (error) {
        console.error('❌ Calculation error:', error);
        setCalculationError(error.message || 'Failed to calculate mortgage');
        setResult(null);
        return;
      }

      if (data) {
        console.log('✅ Calculation completed:', data);
        setResult(data);
      }
    } catch (error) {
      console.error('💥 Error calling calculation function:', error);
      setCalculationError('Failed to calculate mortgage. Please try again.');
      setResult(null);
    } finally {
      setIsCalculating(false);
    }
  };

  // Auto-calculate when inputs change (with debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      calculateMortgage();
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [homePrice, downPayment, interestRate, amortizationYears, paymentFrequency, province, city, isFirstTimeBuyer]);

  // ULTRA SIMPLE BUTTON HANDLERS - NO COMPLEX LOGIC
  const testButtonClick = () => {
    console.log('🔥🔥🔥 TEST BUTTON CLICKED - THIS SHOULD ALWAYS WORK');
    alert('Test button clicked! Console logging is working.');
  };

  const simpleSaveClick = () => {
    console.log('💾💾💾 SIMPLE SAVE CLICKED');
    console.log('Current state:', { result: !!result, user: !!user, isSaving });
    
    if (!result) {
      alert('No calculation result available');
      return;
    }
    
    alert('Save button clicked! Check console for details.');
  };

  const simpleShareClick = () => {
    console.log('🔗🔗🔗 SIMPLE SHARE CLICKED');
    alert('Share button clicked! Check console for details.');
  };

  const downPaymentPercent = Math.round((downPayment / homePrice) * 100);

  return (
    <div className="p-6 space-y-8">
      {/* EMERGENCY TEST SECTION */}
      <div className="bg-red-100 border-2 border-red-500 p-4 rounded-lg">
        <h3 className="text-red-800 font-bold mb-2">🚨 EMERGENCY BUTTON TEST</h3>
        <p className="text-red-700 text-sm mb-3">
          If these buttons don't work, there's a fundamental JavaScript issue:
        </p>
        <div className="flex gap-2">
          <button
            onClick={testButtonClick}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            TEST CLICK
          </button>
          <button
            onClick={() => console.log('🔥 Inline arrow function works')}
            className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
          >
            TEST INLINE
          </button>
          <button
            onClick={function() { console.log('🔥 Inline regular function works'); }}
            className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
          >
            TEST FUNCTION
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">Mortgage Details</h2>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Home Price
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={homePrice}
                  onChange={(e) => {
                    console.log('🏠 Home price changed:', e.target.value);
                    setHomePrice(Number(e.target.value));
                  }}
                  className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="500,000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Down Payment
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={downPayment}
                  onChange={(e) => {
                    console.log('💰 Down payment changed:', e.target.value);
                    setDownPayment(Number(e.target.value));
                  }}
                  className="w-full pl-8 pr-16 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="100,000"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                  {downPaymentPercent}%
                </span>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interest Rate
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full pr-8 pl-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="5.25"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amortization Period
              </label>
              <select
                value={amortizationYears}
                onChange={(e) => setAmortizationYears(Number(e.target.value))}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {[15, 20, 25, 30].map(years => (
                  <option key={years} value={years}>{years} years</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Frequency
              </label>
              <select
                value={paymentFrequency}
                onChange={(e) => setPaymentFrequency(e.target.value as 'monthly' | 'bi-weekly')}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="monthly">Monthly</option>
                <option value="bi-weekly">Bi-weekly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <select
                value={province === 'ontario' ? 'toronto' : 'vancouver'}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === 'toronto') {
                    setProvince('ontario');
                    setCity('toronto');
                  } else {
                    setProvince('bc');
                    setCity('vancouver');
                  }
                }}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="toronto">Toronto, ON</option>
                <option value="vancouver">Vancouver, BC</option>
              </select>
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="first-time-buyer"
              type="checkbox"
              checked={isFirstTimeBuyer}
              onChange={(e) => setIsFirstTimeBuyer(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="first-time-buyer" className="ml-2 block text-sm text-gray-700">
              First-time homebuyer
            </label>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">Payment Breakdown</h2>
          
          {/* Calculation Status */}
          {isCalculating && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
                <span className="text-blue-700">Calculating mortgage...</span>
              </div>
            </div>
          )}

          {/* Calculation Error */}
          {calculationError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
              <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <span>{calculationError}</span>
            </div>
          )}
          
          {result && !isCalculating && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-6 rounded-lg">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    ${result.monthlyPayment.toLocaleString()}
                  </div>
                  <div className="text-sm text-blue-700">
                    {paymentFrequency === 'monthly' ? 'Monthly' : 'Bi-weekly'} Payment
                  </div>
                  {result.biWeeklyPayment && paymentFrequency === 'bi-weekly' && (
                    <div className="text-xs text-blue-600 mt-1">
                      (${result.biWeeklyPayment.toLocaleString()} bi-weekly)
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-lg font-semibold text-gray-900">
                    ${result.loanAmount.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Loan Amount</div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-lg font-semibold text-gray-900">
                    ${result.totalInterest.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Total Interest</div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-lg font-semibold text-gray-900">
                  ${result.totalCost.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Cost of Home</div>
              </div>

              {/* Error Display */}
              {saveError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
                  <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{saveError}</span>
                </div>
              )}

              {/* Success Message */}
              {calculationId && !saveError && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    <span>Calculation saved successfully! You can now share it with others.</span>
                  </div>
                </div>
              )}

              {/* SIMPLE TEST BUTTONS SECTION */}
              <div className="bg-yellow-50 border-2 border-yellow-400 p-4 rounded-lg">
                <h4 className="font-bold text-yellow-800 mb-2">🧪 SIMPLE BUTTON TESTS</h4>
                <div className="flex gap-2 mb-2">
                  <button
                    onClick={simpleSaveClick}
                    className="bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700"
                  >
                    Simple Save Test
                  </button>
                  <button
                    onClick={simpleShareClick}
                    className="bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700"
                  >
                    Simple Share Test
                  </button>
                </div>
                <p className="text-xs text-yellow-700">
                  These buttons should work and show alerts. If they don't, there's a JavaScript error.
                </p>
              </div>

              {/* DEBUG INFO */}
              <div className="bg-gray-100 border p-3 rounded-lg text-xs font-mono">
                <strong>Debug Info:</strong><br/>
                User: {user ? `${user.email} (${user.tier})` : 'No user'}<br/>
                Result: {result ? 'Available' : 'None'}<br/>
                SaveFunction: {typeof saveCalculation}<br/>
                IsSaving: {isSaving ? 'Yes' : 'No'}<br/>
                HasLocalCalc: {hasLocalCalculation ? 'Yes' : 'No'}
              </div>

              {/* ORIGINAL ACTION BUTTONS - SIMPLIFIED */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    console.log('🔥 SAVE BUTTON CLICKED - DIRECT ONCLICK');
                    alert('Save button clicked! Check console.');
                  }}
                  disabled={!result || isSaving}
                  className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-colors ${
                    (!result || isSaving)
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : user ? 'Save Calculation' : 'Save & Share'}
                </button>
                
                <button
                  onClick={() => {
                    console.log('🔗 SHARE BUTTON CLICKED - DIRECT ONCLICK');
                    alert('Share button clicked! Check console.');
                  }}
                  disabled={!result || isSaving}
                  className={`flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-colors ${
                    (!result || isSaving)
                      ? 'bg-gray-100 border border-gray-300 text-gray-400 cursor-not-allowed'
                      : 'bg-white border border-gray-300 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </button>
              </div>
              
              {!user && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">Want to save more calculations?</h4>
                  <p className="text-sm text-blue-700 mb-3">
                    Create a free account to save unlimited calculations and access them from anywhere.
                  </p>
                  <button
                    onClick={() => {
                      console.log('🔗 SIGNUP BUTTON CLICKED');
                      window.location.href = '/signup';
                    }}
                    className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition-colors"
                  >
                    Sign Up Free
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Notes Section for Premium Users */}
      {user?.tier === 'premium' && calculationId && (
        <NotesSection calculationId={calculationId} section="mortgage" />
      )}

      {/* Share Modal */}
      {showShareModal && calculationId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Share Calculation</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shareable Link
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={`${window.location.origin}/shared/${calculationId}`}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg bg-gray-50 text-sm"
                  />
                  <button
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(`${window.location.origin}/shared/${calculationId}`);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      } catch (err) {
                        alert(`Share this link: ${window.location.origin}/shared/${calculationId}`);
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-r-lg transition-colors"
                  >
                    {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
                {copied && (
                  <p className="text-sm text-green-600 mt-1">Copied to clipboard!</p>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowShareModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MortgageCalculator;