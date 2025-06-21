import React from 'react';
import { Link } from 'react-router-dom';
import { Calculator, TrendingUp, Shield, Users, Star } from 'lucide-react';
import { Home as HomeIcon } from 'lucide-react';
import PricingSection from '../components/PricingSection';

const HomePage: React.FC = () => {
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

      {/* Pricing Section */}
      <div className="bg-gray-100 rounded-2xl p-8 md:p-12">
        <PricingSection />
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