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
      <div className="space-modern">
        {/* Welcome Header */}
        <div className="text-center space-y-6 animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold text-neutral-900">
            Welcome back, <span className="text-gradient">{user.name}</span>!
          </h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            Your mortgage calculations and real estate analysis tools are ready to use.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/calculator"
              className="btn btn-primary btn-lg animate-bounce-in"
            >
              New Calculation
            </Link>
            <Link
              to="/dashboard"
              className="btn btn-outline btn-lg animate-bounce-in"
              style={{ animationDelay: '0.1s' }}
            >
              View Dashboard
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 animate-slide-up">
          <div className="card card-gradient hover:scale-105 transition-transform duration-300">
            <div className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mr-4 shadow-colored-primary">
                  <Calculator className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-neutral-900">{calculations.length}</div>
                  <div className="text-sm text-neutral-600">Saved Calculations</div>
                </div>
              </div>
            </div>
          </div>

          <div className="card card-gradient hover:scale-105 transition-transform duration-300">
            <div className="p-6">
              <div className="flex items-center">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 shadow-lg ${
                  user.tier === 'premium' ? 'bg-gradient-warning' : 
                  user.tier === 'basic' ? 'bg-gradient-primary' : 'bg-gradient-neutral'
                }`}>
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-lg font-bold text-neutral-900 capitalize">{user.tier} Plan</div>
                  <div className="text-sm text-neutral-600">Account Type</div>
                </div>
              </div>
            </div>
          </div>

          <div className="card card-gradient hover:scale-105 transition-transform duration-300">
            <div className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-accent rounded-xl flex items-center justify-center mr-4 shadow-colored-accent">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-neutral-900">
                    {calculations.reduce((sum, calc) => sum + calc.home_price, 0).toLocaleString('en-CA', { 
                      style: 'currency', 
                      currency: 'CAD',
                      maximumFractionDigits: 0 
                    })}
                  </div>
                  <div className="text-sm text-neutral-600">Total Property Value</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Calculations */}
        <div className="card animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="p-6 border-b border-neutral-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-neutral-900">Recent Calculations</h2>
              <Link
                to="/dashboard"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors"
              >
                View All
              </Link>
            </div>
          </div>

          {calculations.length > 0 ? (
            <div className="divide-y divide-neutral-100">
              {calculations.slice(0, 3).map((calc, index) => (
                <div 
                  key={calc.id} 
                  className="p-6 hover:bg-gradient-primary-subtle transition-all duration-200 animate-fade-in"
                  style={{ animationDelay: `${0.1 * index}s` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <h3 className="text-lg font-medium text-neutral-900">
                          ${calc.home_price.toLocaleString()} Home
                        </h3>
                        <span className={`badge ${
                          calc.city === 'toronto' ? 'badge-error' : 'badge-primary'
                        }`}>
                          {calc.city === 'toronto' ? 'Toronto' : 'Vancouver'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-neutral-600">
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
                        className="p-2 text-neutral-400 hover:text-primary-600 transition-colors rounded-lg hover:bg-white/50"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleShare(calc.id)}
                        className="p-2 text-neutral-400 hover:text-primary-600 transition-colors rounded-lg hover:bg-white/50"
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
              <Calculator className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-900 mb-2">No calculations yet</h3>
              <p className="text-neutral-600 mb-6">
                Start by creating your first mortgage calculation.
              </p>
              <Link
                to="/calculator"
                className="btn btn-primary"
              >
                Create Your First Calculation
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          {[
            {
              title: 'Mortgage Calculator',
              description: 'Calculate payments and amortization schedules',
              icon: Calculator,
              gradient: 'bg-gradient-primary',
              href: '/calculator'
            },
            {
              title: 'Closing Costs',
              description: 'Calculate province-specific closing costs',
              icon: HomeIcon,
              gradient: 'bg-gradient-accent',
              href: '/calculator'
            },
            {
              title: 'Investment Analysis',
              description: 'Analyze rental property investments',
              icon: TrendingUp,
              gradient: 'bg-gradient-warning',
              href: '/calculator'
            },
            {
              title: 'Upgrade Plan',
              description: 'Unlock premium features and tools',
              icon: Shield,
              gradient: 'bg-gradient-error',
              href: '/pricing'
            }
          ].map((action, index) => (
            <Link
              key={action.title}
              to={action.href}
              className="card group hover:scale-105 transition-all duration-300 animate-bounce-in"
              style={{ animationDelay: `${0.1 * index}s` }}
            >
              <div className="p-6">
                <div className={`w-12 h-12 ${action.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200 shadow-lg`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">{action.title}</h3>
                <p className="text-neutral-600">{action.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  // Show marketing content for non-logged-in users
  return (
    <div className="space-modern">
      {/* Hero Section */}
      <div className="text-center space-y-8 animate-fade-in">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-neutral-900 mb-6">
            Professional
            <span className="text-gradient block">Mortgage Calculator</span>
          </h1>
          <p className="text-xl text-neutral-600 mb-8 leading-relaxed">
            Complete mortgage calculations for Canadian real estate. Calculate payments, closing costs, 
            amortization schedules, and investment metrics for Toronto and Vancouver properties.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/calculator"
              className="btn btn-primary btn-lg animate-bounce-in shadow-colored-primary"
            >
              Start Calculating
            </Link>
            <Link
              to="/signup"
              className="btn btn-outline btn-lg animate-bounce-in"
              style={{ animationDelay: '0.1s' }}
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 animate-slide-up">
        {[
          {
            title: 'Mortgage Calculator',
            description: 'Calculate monthly payments, total interest, and detailed amortization schedules.',
            icon: Calculator,
            gradient: 'bg-gradient-primary'
          },
          {
            title: 'Closing Costs',
            description: 'Province-specific closing cost calculations for Toronto and Vancouver markets.',
            icon: HomeIcon,
            gradient: 'bg-gradient-accent'
          },
          {
            title: 'Investment Metrics',
            description: 'Calculate cap rates, cash flow, ROI, and break-even analysis for rental properties.',
            icon: TrendingUp,
            gradient: 'bg-gradient-warning'
          },
          {
            title: 'Save & Share',
            description: 'Save calculations, generate shareable links, and access your data anywhere.',
            icon: Shield,
            gradient: 'bg-gradient-error'
          }
        ].map((feature, index) => (
          <div 
            key={feature.title}
            className="card group hover:scale-105 transition-all duration-300 animate-bounce-in"
            style={{ animationDelay: `${0.1 * index}s` }}
          >
            <div className="p-6">
              <div className={`w-12 h-12 ${feature.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200 shadow-lg`}>
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">{feature.title}</h3>
              <p className="text-neutral-600">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Social Proof */}
      <div className="text-center space-y-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <h2 className="text-3xl font-bold text-neutral-900">Trusted by Canadian Real Estate Professionals</h2>
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
          ].map((testimonial, index) => (
            <div 
              key={testimonial.name}
              className="card animate-scale-in"
              style={{ animationDelay: `${0.1 * index}s` }}
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-warning-400 fill-current" />
                  ))}
                </div>
                <p className="text-neutral-600 mb-4">"{testimonial.quote}"</p>
                <div className="text-sm">
                  <div className="font-semibold text-neutral-900">{testimonial.name}</div>
                  <div className="text-neutral-600">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="card card-gradient text-center animate-scale-in" style={{ animationDelay: '0.4s' }}>
        <div className="p-8 md:p-12">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-neutral-600 mb-8 max-w-2xl mx-auto">
            Join thousands of Canadians who trust our calculator for their real estate decisions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/calculator"
              className="btn btn-primary btn-lg shadow-colored-primary"
            >
              Calculate Now
            </Link>
            <Link
              to="/signup"
              className="btn btn-secondary btn-lg shadow-colored-accent"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;