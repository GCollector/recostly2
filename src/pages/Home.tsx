import React from 'react';
import { Link } from 'react-router-dom';
import { Calculator, TrendingUp, Shield, Star, Calendar, Eye, Share2 } from 'lucide-react';
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
      <div className="space-y-12">
        {/* Welcome Header */}
        <div className="text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold font-heading text-slate-900">
            Welcome back, <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{user.name}</span>!
          </h1>
          <p className="text-xl font-sans text-slate-600 max-w-2xl mx-auto">
            Your mortgage calculations and real estate analysis tools are ready to use.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/calculator"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-medium font-sans transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              New Calculation
            </Link>
            <Link
              to="/dashboard"
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-lg text-lg font-medium font-sans transition-all duration-200 transform hover:scale-105"
            >
              View Dashboard
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mr-4 shadow-sm">
                <Calculator className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold font-heading text-slate-900">{calculations.length}</div>
                <div className="text-sm font-sans text-slate-600">Saved Calculations</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 shadow-sm ${
                user.tier === 'premium' ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 
                user.tier === 'basic' ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gradient-to-r from-slate-500 to-slate-600'
              }`}>
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-lg font-bold font-heading text-slate-900 capitalize">{user.tier} Plan</div>
                <div className="text-sm font-sans text-slate-600">Account Type</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mr-4 shadow-sm">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold font-heading text-slate-900">
                  {calculations.reduce((sum, calc) => sum + calc.home_price, 0).toLocaleString('en-CA', { 
                    style: 'currency', 
                    currency: 'CAD',
                    maximumFractionDigits: 0 
                  })}
                </div>
                <div className="text-sm font-sans text-slate-600">Total Property Value</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Calculations */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold font-heading text-slate-900">Recent Calculations</h2>
              <Link
                to="/dashboard"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium font-sans transition-colors"
              >
                View All
              </Link>
            </div>
          </div>

          {calculations.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {calculations.slice(0, 3).map((calc) => (
                <div key={calc.id} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <h3 className="text-lg font-medium font-heading text-slate-900">
                          ${calc.home_price.toLocaleString()} Home
                        </h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium font-sans ${
                          calc.city === 'toronto' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {calc.city === 'toronto' ? 'Toronto' : 'Vancouver'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm font-sans text-slate-600">
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
                        className="p-2 text-slate-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-white"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleShare(calc.id)}
                        className="p-2 text-slate-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-white"
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
              <Calculator className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium font-heading text-slate-900 mb-2">No calculations yet</h3>
              <p className="font-sans text-slate-600 mb-6">
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

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: 'Mortgage Calculator',
              description: 'Calculate payments and amortization schedules',
              icon: Calculator,
              gradient: 'from-blue-600 to-purple-600',
              href: '/calculator'
            },
            {
              title: 'Closing Costs',
              description: 'Calculate province-specific closing costs',
              icon: HomeIcon,
              gradient: 'from-emerald-500 to-teal-500',
              href: '/calculator'
            },
            {
              title: 'Investment Analysis',
              description: 'Analyze rental property investments',
              icon: TrendingUp,
              gradient: 'from-amber-500 to-orange-500',
              href: '/calculator'
            },
            {
              title: 'Upgrade Plan',
              description: 'Unlock premium features and tools',
              icon: Shield,
              gradient: 'from-rose-500 to-pink-500',
              href: '/pricing'
            }
          ].map((action) => (
            <Link
              key={action.title}
              to={action.href}
              className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200 transform hover:scale-105 group"
            >
              <div className={`w-12 h-12 bg-gradient-to-r ${action.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200 shadow-sm`}>
                <action.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold font-heading text-slate-900 mb-2">{action.title}</h3>
              <p className="font-sans text-slate-600">{action.description}</p>
            </Link>
          ))}
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