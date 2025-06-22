import React from 'react';
import { Link } from 'react-router-dom';
import { Calculator, TrendingUp, Shield, Users, Star, Calendar, Eye, Share2 } from 'lucide-react';
import { Home as HomeIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCalculations } from '../contexts/CalculationContext';

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const { calculations } = useCalculations();

  const handleShare = async (calculationId: string) => {
    const shareUrl = `${window.location.origin}/shared/${calculationId}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('Share link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  // Show dashboard-style content for logged-in users
  if (user) {
    return (
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900">
            Welcome back, {user.name}!
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your mortgage calculations and real estate analysis tools are ready to use.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/calculator"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              New Calculation
            </Link>
            <Link
              to="/dashboard"
              className="bg-white hover:bg-gray-50 text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 transform hover:scale-105"
            >
              View Dashboard
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
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
                user.tier === 'premium' ? 'bg-amber-100' : 
                user.tier === 'basic' ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                <Shield className={`h-6 w-6 ${
                  user.tier === 'premium' ? 'text-amber-600' : 
                  user.tier === 'basic' ? 'text-blue-600' : 'text-gray-600'
                }`} />
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900 capitalize">{user.tier}</div>
                <div className="text-sm text-gray-600">Account Type</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="bg-emerald-100 w-12 h-12 rounded-lg flex items-center justify-center mr-4">
                <TrendingUp className="h-6 w-6 text-emerald-600" />
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

        {/* Recent Calculations */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Recent Calculations</h2>
              <Link
                to="/dashboard"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View All
              </Link>
            </div>
          </div>

          {calculations.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {calculations.slice(0, 3).map((calc) => (
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
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Payment:</span> ${calc.monthly_payment.toLocaleString()}/{calc.payment_frequency}
                        </div>
                        <div>
                          <span className="font-medium">Rate:</span> {calc.interest_rate}%
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(calc.created_at).toLocaleDateString()}
                        </div>
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
                Start by creating your first mortgage calculation.
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

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            to="/calculator"
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
          >
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
              <Calculator className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Mortgage Calculator</h3>
            <p className="text-gray-600">Calculate payments and amortization schedules</p>
          </Link>

          <Link
            to="/calculator"
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
          >
            <div className="bg-emerald-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-emerald-200 transition-colors">
              <HomeIcon className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Closing Costs</h3>
            <p className="text-gray-600">Calculate province-specific closing costs</p>
          </Link>

          <Link
            to="/calculator"
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
          >
            <div className="bg-amber-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-amber-200 transition-colors">
              <TrendingUp className="h-6 w-6 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Investment Analysis</h3>
            <p className="text-gray-600">Analyze rental property investments</p>
          </Link>

          <Link
            to="/pricing"
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
          >
            <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
              <Shield className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Upgrade Plan</h3>
            <p className="text-gray-600">Unlock premium features and tools</p>
          </Link>
        </div>
      </div>
    );
  }

  // Show marketing content for non-logged-in users
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <div className="text-center space-y-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Professional
            <span className="text-blue-600 block">Mortgage Calculator</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Complete mortgage calculations for Canadian real estate. Calculate payments, closing costs, 
            amortization schedules, and investment metrics for Toronto and Vancouver properties.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/calculator"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Start Calculating
            </Link>
            <Link
              to="/signup"
              className="bg-white hover:bg-gray-50 text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 transform hover:scale-105"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
            <Calculator className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Mortgage Calculator</h3>
          <p className="text-gray-600">
            Calculate monthly payments, total interest, and detailed amortization schedules.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="bg-emerald-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
            <HomeIcon className="h-6 w-6 text-emerald-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Closing Costs</h3>
          <p className="text-gray-600">
            Province-specific closing cost calculations for Toronto and Vancouver markets.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="bg-amber-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
            <TrendingUp className="h-6 w-6 text-amber-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Investment Metrics</h3>
          <p className="text-gray-600">
            Calculate cap rates, cash flow, ROI, and break-even analysis for rental properties.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
            <Shield className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Save & Share</h3>
          <p className="text-gray-600">
            Save calculations, generate shareable links, and access your data anywhere.
          </p>
        </div>
      </div>

      {/* Social Proof */}
      <div className="text-center space-y-8">
        <h2 className="text-3xl font-bold text-gray-900">Trusted by Canadian Real Estate Professionals</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
              ))}
            </div>
            <p className="text-gray-600 mb-4">
              "This calculator has become an essential tool for my real estate practice. The accuracy and detailed breakdowns help me provide better service to my clients."
            </p>
            <div className="text-sm">
              <div className="font-semibold text-gray-900">Sarah Chen</div>
              <div className="text-gray-600">Real Estate Agent, Toronto</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
              ))}
            </div>
            <p className="text-gray-600 mb-4">
              "The investment calculator features are incredibly detailed. It's helped me analyze dozens of properties and make informed investment decisions."
            </p>
            <div className="text-sm">
              <div className="font-semibold text-gray-900">Michael Rodriguez</div>
              <div className="text-gray-600">Property Investor, Vancouver</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
              ))}
            </div>
            <p className="text-gray-600 mb-4">
              "As a first-time homebuyer, this tool helped me understand all the costs involved. The closing cost calculator was especially helpful."
            </p>
            <div className="text-sm">
              <div className="font-semibold text-gray-900">Emily Johnson</div>
              <div className="text-gray-600">Homebuyer, Toronto</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 rounded-2xl p-8 md:p-12 text-center text-white">
        <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          Join thousands of Canadians who trust our calculator for their real estate decisions.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/calculator"
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 transform hover:scale-105 inline-block"
          >
            Calculate Now
          </Link>
          <Link
            to="/signup"
            className="bg-blue-700 hover:bg-blue-800 text-white border-2 border-blue-400 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 transform hover:scale-105 inline-block"
          >
            Start Free Trial
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;