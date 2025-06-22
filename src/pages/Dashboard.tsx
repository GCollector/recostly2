import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Calculator, Trash2, Share2, Eye, Calendar, Crown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCalculations } from '../contexts/CalculationContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { calculations, deleteCalculation } = useCalculations();
  const [searchParams] = useSearchParams();
  const [showSuccess, setShowSuccess] = useState(false);

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

  return (
    <div className="space-y-8">
      {/* Success Message */}
      {showSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <Crown className="h-5 w-5 mr-2" />
            <span>Subscription updated successfully! Your new features are now available.</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">My Calculations</h1>
        <p className="text-lg text-gray-600">
          View and manage all your saved mortgage calculations.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mr-4">
              <Calculator className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{calculations.length}</div>
              <div className="text-sm text-gray-600">Saved Calculations</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 ${
              user.tier === 'premium' ? 'bg-amber-100' : 'bg-blue-100'
            }`}>
              <Crown className={`h-6 w-6 ${
                user.tier === 'premium' ? 'text-amber-600' : 'text-blue-600'
              }`} />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900 capitalize">{user.tier} Plan</div>
              <div className="text-sm text-gray-600">Account Type</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="bg-emerald-100 w-12 h-12 rounded-lg flex items-center justify-center mr-4">
              <Calculator className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {calculations.reduce((sum, calc) => sum + calc.home_price, 0).toLocaleString('en-CA', { 
                  style: 'currency', 
                  currency: 'CAD',
                  maximumFractionDigits: 0 
                })}
              </div>
              <div className="text-sm text-gray-600">Total Property Value</div>
            </div>
          </div>
        </div>
      </div>

      {/* Saved Calculations */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Saved Calculations</h2>
            <Link
              to="/calculator"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              New Calculation
            </Link>
          </div>
        </div>

        {calculations.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {calculations.map((calc) => (
              <div key={calc.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        ${calc.home_price.toLocaleString()} Home
                      </h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        calc.city === 'toronto' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {calc.city === 'toronto' ? 'Toronto' : 'Vancouver'}
                      </span>
                      {calc.is_first_time_buyer && (
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                          First-Time Buyer
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Payment:</span> ${calc.monthly_payment.toLocaleString()}/{calc.payment_frequency}
                      </div>
                      <div>
                        <span className="font-medium">Down Payment:</span> ${calc.down_payment.toLocaleString()}
                      </div>
                      <div>
                        <span className="font-medium">Rate:</span> {calc.interest_rate}%
                      </div>
                      <div>
                        <span className="font-medium">Term:</span> {calc.amortization_years} years
                      </div>
                    </div>
                    <div className="flex items-center mt-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(calc.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/shared/${calc.id}`}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleShare(calc.id)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Share"
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(calc.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No calculations yet</h3>
            <p className="text-gray-600 mb-6">
              Start by creating your first mortgage calculation to see it appear here.
            </p>
            <Link
              to="/calculator"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Create Your First Calculation
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;