import React, { useState } from 'react';
import { Check, Crown, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { STRIPE_PRICES, PLAN_DETAILS } from '../lib/stripe';

interface PricingSectionProps {
  showTitle?: boolean;
  compact?: boolean;
}

const PricingSection: React.FC<PricingSectionProps> = ({ showTitle = true, compact = false }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = async (priceId: string) => {
    if (!user) {
      // Redirect to signup if not logged in
      window.location.href = '/signup';
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // First, ensure user has a Stripe customer ID
      const { data: customerData, error: customerError } = await supabase.functions.invoke(
        'create-stripe-customer',
        {
          headers: {
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
        }
      );

      if (customerError) throw customerError;

      // Create checkout session
      const { data: sessionData, error: sessionError } = await supabase.functions.invoke(
        'create-checkout-session',
        {
          body: {
            priceId,
            successUrl: `${window.location.origin}/dashboard?success=true`,
            cancelUrl: `${window.location.origin}/?canceled=true`,
          },
          headers: {
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
        }
      );

      if (sessionError) throw sessionError;

      // Redirect to Stripe Checkout
      if (sessionData.url) {
        window.location.href = sessionData.url;
      }
    } catch (err: any) {
      console.error('Subscription error:', err);
      setError(err.message || 'Failed to start subscription process. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isPremium = user?.tier === 'premium';
  const isBasic = user?.tier === 'basic';

  return (
    <div className={compact ? 'space-y-6' : 'space-y-8'}>
      {showTitle && (
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Plan</h2>
          <p className="text-lg text-gray-600">Get started for free or unlock premium features</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className={`grid gap-6 max-w-5xl mx-auto ${compact ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
        {/* Free Tier */}
        {!compact && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Free</h3>
              <div className="text-3xl font-bold text-gray-900 mb-2">$0</div>
              <p className="text-gray-600">Perfect for one-time calculations</p>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center text-gray-600">
                <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                One calculation per session
              </li>
              <li className="flex items-center text-gray-600">
                <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                All calculator features
              </li>
              <li className="flex items-center text-gray-600">
                <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                Basic sharing
              </li>
            </ul>
            <button
              onClick={() => window.location.href = '/calculator'}
              className="block w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold transition-colors"
            >
              Start Free
            </button>
          </div>
        )}

        {/* Basic Tier */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{PLAN_DETAILS.basic.name}</h3>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              ${PLAN_DETAILS.basic.price}
              <span className="text-lg text-gray-600">/{PLAN_DETAILS.basic.interval}</span>
            </div>
            <p className="text-gray-600">For serious homebuyers</p>
          </div>
          <ul className="space-y-3 mb-8">
            {PLAN_DETAILS.basic.features.map((feature, index) => (
              <li key={index} className="flex items-center text-gray-600">
                <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
          <button
            onClick={() => handleSubscribe(STRIPE_PRICES.basic_monthly)}
            disabled={isLoading || isBasic || isPremium}
            className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {isBasic ? 'Current Plan' : isPremium ? 'Downgrade' : 'Get Started'}
          </button>
        </div>

        {/* Premium Tier */}
        <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-amber-300 relative">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <span className="bg-amber-500 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center">
              <Crown className="h-4 w-4 mr-1" />
              Most Popular
            </span>
          </div>
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{PLAN_DETAILS.premium.name}</h3>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              ${PLAN_DETAILS.premium.price}
              <span className="text-lg text-gray-600">/{PLAN_DETAILS.premium.interval}</span>
            </div>
            <p className="text-gray-600">For real estate professionals</p>
          </div>
          <ul className="space-y-3 mb-8">
            {PLAN_DETAILS.premium.features.map((feature, index) => (
              <li key={index} className="flex items-center text-gray-600">
                <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
          <button
            onClick={() => handleSubscribe(STRIPE_PRICES.premium_monthly)}
            disabled={isLoading || isPremium}
            className="block w-full text-center bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {isPremium ? 'Current Plan' : 'Go Premium'}
          </button>
        </div>
      </div>

      {/* Additional Info */}
      <div className="text-center text-sm text-gray-600 max-w-2xl mx-auto">
        <p>
          All plans include a 14-day free trial. Cancel anytime. 
          Need help choosing? <a href="mailto:support@mortgagecalc.ca" className="text-blue-600 hover:text-blue-700">Contact us</a>.
        </p>
      </div>
    </div>
  );
};

export default PricingSection;