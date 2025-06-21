import React from 'react';
import PricingSection from '../components/PricingSection';
import { Crown, Check, Users, Star } from 'lucide-react';

const PricingPage: React.FC = () => {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <div className="text-center space-y-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Choose Your
            <span className="text-blue-600 block">Perfect Plan</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Unlock powerful features to save, manage, and share your mortgage calculations. 
            Perfect for homebuyers, investors, and real estate professionals.
          </p>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="bg-gray-100 rounded-2xl p-8 md:p-12">
        <PricingSection showTitle={false} />
      </div>

      {/* Feature Comparison */}
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Compare Plans</h2>
          <p className="text-lg text-gray-600">See what's included in each plan</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Features</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-900">Free</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-900">Basic</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-900 bg-amber-50">
                    <div className="flex items-center justify-center">
                      <Crown className="h-4 w-4 text-amber-600 mr-1" />
                      Premium
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900">One-time calculations</td>
                  <td className="px-6 py-4 text-center">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center bg-amber-50">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900">All calculator features</td>
                  <td className="px-6 py-4 text-center">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center bg-amber-50">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900">Save calculations</td>
                  <td className="px-6 py-4 text-center text-gray-400">—</td>
                  <td className="px-6 py-4 text-center">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center bg-amber-50">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900">Dashboard access</td>
                  <td className="px-6 py-4 text-center text-gray-400">—</td>
                  <td className="px-6 py-4 text-center">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center bg-amber-50">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900">Unlimited calculations</td>
                  <td className="px-6 py-4 text-center text-gray-400">—</td>
                  <td className="px-6 py-4 text-center">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center bg-amber-50">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900">Advanced sharing</td>
                  <td className="px-6 py-4 text-center text-gray-400">—</td>
                  <td className="px-6 py-4 text-center">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center bg-amber-50">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900">Private notes</td>
                  <td className="px-6 py-4 text-center text-gray-400">—</td>
                  <td className="px-6 py-4 text-center text-gray-400">—</td>
                  <td className="px-6 py-4 text-center bg-amber-50">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900">Comments on shares</td>
                  <td className="px-6 py-4 text-center text-gray-400">—</td>
                  <td className="px-6 py-4 text-center text-gray-400">—</td>
                  <td className="px-6 py-4 text-center bg-amber-50">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900">Marketing content</td>
                  <td className="px-6 py-4 text-center text-gray-400">—</td>
                  <td className="px-6 py-4 text-center text-gray-400">—</td>
                  <td className="px-6 py-4 text-center bg-amber-50">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900">White-label sharing</td>
                  <td className="px-6 py-4 text-center text-gray-400">—</td>
                  <td className="px-6 py-4 text-center text-gray-400">—</td>
                  <td className="px-6 py-4 text-center bg-amber-50">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900">Priority support</td>
                  <td className="px-6 py-4 text-center text-gray-400">—</td>
                  <td className="px-6 py-4 text-center text-gray-400">—</td>
                  <td className="px-6 py-4 text-center bg-amber-50">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="text-center space-y-8">
        <h2 className="text-3xl font-bold text-gray-900">What Our Users Say</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
              ))}
            </div>
            <p className="text-gray-600 mb-4">
              "The Premium features have transformed how I present calculations to clients. The marketing content feature is a game-changer."
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
              "Being able to save and organize all my investment calculations in one place has saved me hours of work."
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
              "The Basic plan gives me everything I need to track my home buying journey. Great value for money."
            </p>
            <div className="text-sm">
              <div className="font-semibold text-gray-900">Emily Johnson</div>
              <div className="text-gray-600">Homebuyer, Toronto</div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I change plans anytime?</h3>
            <p className="text-gray-600">
              Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, 
              and you'll be charged or credited on a prorated basis.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Is there a free trial?</h3>
            <p className="text-gray-600">
              All paid plans include a 14-day free trial. You can cancel anytime during the trial 
              period without being charged.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">What happens to my data if I cancel?</h3>
            <p className="text-gray-600">
              Your saved calculations remain accessible for 30 days after cancellation. 
              You can reactivate your subscription anytime to regain full access.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Do you offer refunds?</h3>
            <p className="text-gray-600">
              We offer a 30-day money-back guarantee. If you're not satisfied with your subscription, 
              contact us for a full refund within 30 days of purchase.
            </p>
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
          <a
            href="#pricing"
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 transform hover:scale-105 inline-block"
          >
            Choose Your Plan
          </a>
          <a
            href="/calculator"
            className="bg-blue-700 hover:bg-blue-800 text-white border-2 border-blue-400 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 transform hover:scale-105 inline-block"
          >
            Try Free Calculator
          </a>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;