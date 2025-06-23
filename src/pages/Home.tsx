import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calculator, TrendingUp, Shield, Star, Calendar, Eye, Share2, CreditCard, ChevronRight } from 'lucide-react';
import { Home as HomeIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCalculations } from '../contexts/CalculationContext';

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const { calculations } = useCalculations();
  const navigate = useNavigate();

  const handleViewCalculation = (calc: any) => {
    // Navigate to calculator with the saved calculation data
    // We'll pass the calculation data via state so it can be loaded in step 2
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
          enableInvestmentAnalysis: false, // Default to false, can be enhanced later
          monthlyRent: 2500, // Default values
          monthlyExpenses: {
            taxes: 400,
            insurance: 150,
            condoFees: 300,
            maintenance: 200,
            other: 100
          }
        },
        startAtStep: 2 // Tell calculator to start at step 2 (results)
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

  // Show dashboard-style content for logged-in users
  if (user) {
    return (
      <div className="space-y-8 md:space-y-12">
        {/* Welcome Header */}
        <div className="text-center space-y-6">
          <h1 className="text-3xl md:text-6xl font-bold font-heading text-slate-900">
            Welcome back, <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{user.name}</span>!
          </h1>
          <p className="text-lg md:text-xl font-sans text-slate-600 max-w-2xl mx-auto">
            Your mortgage calculations and real estate analysis tools are ready to use.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/calculator"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 md:px-8 py-3 md:py-4 rounded-lg text-base md:text-lg font-medium font-sans transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              New Calculation
            </Link>
            <Link
              to="/dashboard"
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-6 md:px-8 py-3 md:py-4 rounded-lg text-base md:text-lg font-medium font-sans transition-all duration-200 transform hover:scale-105"
            >
              View Dashboard
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mr-4 md:mr-6 shadow-sm">
                <Calculator className="h-6 w-6 md:h-8 md:w-8 text-white" />
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold font-heading text-slate-900">{calculations.length}</div>
                <div className="text-sm md:text-base font-sans text-slate-600">Saved Calculations</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl flex items-center justify-center mr-4 md:mr-6 shadow-sm ${
                user.tier === 'premium' ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 
                user.tier === 'basic' ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gradient-to-r from-slate-500 to-slate-600'
              }`}>
                <Shield className="h-6 w-6 md:h-8 md:w-8 text-white" />
              </div>
              <div>
                <div className="text-lg md:text-xl font-bold font-heading text-slate-900 capitalize">{user.tier} Plan</div>
                <div className="text-sm md:text-base font-sans text-slate-600">Account Type</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
            <div className="flex items-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mr-4 md:mr-6 shadow-sm">
                <TrendingUp className="h-6 w-6 md:h-8 md:w-8 text-white" />
              </div>
              <div>
                <div className="text-xl md:text-3xl font-bold font-heading text-slate-900">
                  {calculations.reduce((sum, calc) => sum + calc.home_price, 0).toLocaleString('en-CA', { 
                    style: 'currency', 
                    currency: 'CAD',
                    maximumFractionDigits: 0 
                  })}
                </div>
                <div className="text-sm md:text-base font-sans text-slate-600">Total Property Value</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Calculations */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-6 md:p-8 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl md:text-2xl font-semibold font-heading text-slate-900">Recent Calculations</h2>
              <Link
                to="/dashboard"
                className="text-blue-600 hover:text-blue-700 text-sm md:text-base font-medium font-sans transition-colors flex items-center"
              >
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>

          {calculations.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {calculations.slice(0, 3).map((calc) => (
                <div key={calc.id} className="p-6 md:p-8 hover:bg-slate-50 transition-colors">
                  <div className="space-y-4">
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <button
                            onClick={() => handleViewCalculation(calc)}
                            className="text-lg md:text-xl font-semibold font-heading text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                          >
                            ${calc.home_price.toLocaleString()} Home
                          </button>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs md:text-sm font-medium ${
                            calc.city === 'toronto' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {calc.city === 'toronto' ? 'Toronto' : 'Vancouver'}
                          </span>
                        </div>
                        
                        {/* Date */}
                        <div className="flex items-center text-sm md:text-base text-slate-500 mb-4">
                          <Calendar className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                          {new Date(calc.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <button
                          onClick={() => handleViewCalculation(calc)}
                          className="p-3 md:p-4 text-slate-400 hover:text-blue-600 transition-colors rounded-xl hover:bg-blue-50"
                          title="View Results"
                        >
                          <Eye className="h-5 w-5 md:h-6 md:w-6" />
                        </button>
                        <button
                          onClick={() => handleShare(calc.id)}
                          className="p-3 md:p-4 text-slate-400 hover:text-blue-600 transition-colors rounded-xl hover:bg-blue-50"
                          title="Share"
                        >
                          <Share2 className="h-5 w-5 md:h-6 md:w-6" />
                        </button>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                      <div className="space-y-2">
                        <div className="text-sm md:text-base font-medium text-slate-700">Payment</div>
                        <div className="text-lg md:text-xl font-bold text-slate-900">
                          ${calc.monthly_payment.toLocaleString()}
                        </div>
                        <div className="text-xs md:text-sm text-slate-500 capitalize">
                          {calc.payment_frequency}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-sm md:text-base font-medium text-slate-700">Down Payment</div>
                        <div className="text-lg md:text-xl font-bold text-slate-900">
                          ${calc.down_payment.toLocaleString()}
                        </div>
                        <div className="text-xs md:text-sm text-slate-500">
                          {Math.round((calc.down_payment / calc.home_price) * 100)}%
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-sm md:text-base font-medium text-slate-700">Interest Rate</div>
                        <div className="text-lg md:text-xl font-bold text-slate-900">
                          {calc.interest_rate}%
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-sm md:text-base font-medium text-slate-700">Term</div>
                        <div className="text-lg md:text-xl font-bold text-slate-900">
                          {calc.amortization_years} years
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 md:p-16 text-center">
              <Calculator className="h-12 w-12 md:h-16 md:w-16 text-slate-400 mx-auto mb-6" />
              <h3 className="text-lg md:text-xl font-medium font-heading text-slate-900 mb-3">No calculations yet</h3>
              <p className="text-base md:text-lg font-sans text-slate-600 mb-8">
                Start by creating your first mortgage calculation.
              </p>
              <Link
                to="/calculator"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium font-sans transition-colors"
              >
                Create Your First Calculation
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show marketing content for non-logged-in users
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <div className="text-center space-y-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold font-heading text-slate-900 mb-6">
            Professional
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">Mortgage Calculator</span>
          </h1>
          <p className="text-xl font-sans text-slate-600 mb-8 leading-relaxed">
            Complete mortgage calculations for Canadian real estate. Calculate payments, closing costs, 
            amortization schedules, and investment metrics for Toronto and Vancouver properties.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/calculator"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-medium font-sans transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Start Calculating
            </Link>
            <Link
              to="/signup"
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-lg text-lg font-medium font-sans transition-all duration-200 transform hover:scale-105"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          {
            title: 'Mortgage Calculator',
            description: 'Calculate monthly payments, total interest, and detailed amortization schedules.',
            icon: Calculator,
            gradient: 'from-blue-600 to-purple-600'
          },
          {
            title: 'Closing Costs',
            description: 'Province-specific closing cost calculations for Toronto and Vancouver markets.',
            icon: HomeIcon,
            gradient: 'from-emerald-500 to-teal-500'
          },
          {
            title: 'Investment Metrics',
            description: 'Calculate cap rates, cash flow, ROI, and break-even analysis for rental properties.',
            icon: TrendingUp,
            gradient: 'from-amber-500 to-orange-500'
          },
          {
            title: 'Save & Share',
            description: 'Save calculations, generate shareable links, and access your data anywhere.',
            icon: Shield,
            gradient: 'from-rose-500 to-pink-500'
          }
        ].map((feature) => (
          <div 
            key={feature.title}
            className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200 transform hover:scale-105 group"
          >
            <div className={`w-12 h-12 bg-gradient-to-r ${feature.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200 shadow-sm`}>
              <feature.icon className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold font-heading text-slate-900 mb-2">{feature.title}</h3>
            <p className="font-sans text-slate-600">{feature.description}</p>
          </div>
        ))}
      </div>

      {/* Social Proof */}
      <div className="text-center space-y-8">
        <h2 className="text-3xl font-bold font-heading text-slate-900">Trusted by Canadian Real Estate Professionals</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[
            {
              name: 'Sarah Chen',
              role: 'Real Estate Agent, Toronto',
              quote: 'This calculator has become an essential tool for my real estate practice. The accuracy and detailed breakdowns help me provide better service to my clients.'
            },
            {
              name: 'Michael Rodriguez',
              role: 'Property Investor, Vancouver',
              quote: 'The investment calculator features are incredibly detailed. It\'s helped me analyze dozens of properties and make informed investment decisions.'
            },
            {
              name: 'Emily Johnson',
              role: 'Homebuyer, Toronto',
              quote: 'As a first-time homebuyer, this tool helped me understand all the costs involved. The closing cost calculator was especially helpful.'
            }
          ].map((testimonial) => (
            <div 
              key={testimonial.name}
              className="bg-white p-6 rounded-xl shadow-sm border border-slate-200"
            >
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-amber-400 fill-current" />
                ))}
              </div>
              <p className="font-sans text-slate-600 mb-4">"{testimonial.quote}"</p>
              <div className="text-sm">
                <div className="font-semibold font-heading text-slate-900">{testimonial.name}</div>
                <div className="font-sans text-slate-600">{testimonial.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Link Section for Non-Logged-In Users */}
      <div className="bg-white rounded-2xl p-8 md:p-12 text-center border border-slate-200 shadow-sm">
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <CreditCard className="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-bold font-heading text-slate-900 mb-4">Flexible Pricing Plans</h2>
        <p className="text-xl font-sans text-slate-600 mb-8 max-w-2xl mx-auto">
          Choose the plan that works best for you. From free calculations to premium features for real estate professionals.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/pricing"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-medium font-sans transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            View Pricing Plans
          </Link>
          <Link
            to="/calculator"
            className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-lg text-lg font-medium font-sans transition-all duration-200 transform hover:scale-105"
          >
            Try Free Calculator
          </Link>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 md:p-12 text-center text-white">
        <h2 className="text-3xl font-bold font-heading mb-4">Ready to Get Started?</h2>
        <p className="text-xl font-sans text-blue-100 mb-8 max-w-2xl mx-auto">
          Join thousands of Canadians who trust our calculator for their real estate decisions.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/calculator"
            className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-lg text-lg font-medium font-sans transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            Calculate Now
          </Link>
          <Link
            to="/signup"
            className="bg-blue-700 hover:bg-blue-800 text-white border-2 border-blue-400 px-8 py-4 rounded-lg text-lg font-medium font-sans transition-all duration-200 transform hover:scale-105"
          >
            Start Free Trial
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;