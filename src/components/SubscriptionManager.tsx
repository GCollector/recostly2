import React, { useState } from 'react';
import { Crown, Check, Loader2, CreditCard, AlertCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { STRIPE_PRICES, PLAN_DETAILS, isStripeConfigured } from '../lib/stripe';

const SubscriptionManager: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = async (priceId: string) => {
    if (!user) return;

    if (!isStripeConfigured()) {
      setError('Payment system is not configured. Please contact support.');
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
            cancelUrl: `${window.location.origin}/dashboard?canceled=true`,
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

  const handleManageSubscription = async () => {
    if (!user?.stripe_customer_id) return;

    setIsLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.functions.invoke(
        'create-portal-session',
        {
          body: {
            customerId: user.stripe_customer_id,
            returnUrl: `${window.location.origin}/dashboard`,
          },
          headers: {
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
        }
      );

      if (error) throw error;

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      console.error('Portal error:', err);
      setError(err.message || 'Failed to open subscription management.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  const isPremium = user.tier === 'premium';
  const isBasic = user.tier === 'basic';
  const isFree = user.tier === 'free';
  const hasActiveSubscription = user.subscription_status === 'active';
  const stripeConfigured = isStripeConfigured();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center mb-6">
        <Crown className="h-6 w-6 text-amber-500 mr-3" />
        <h2 className="text-xl font-semibold text-gray-900">Subscription Management</h2>
      </div>

      {!stripeConfigured && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg mb-6 flex items-start">
          <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Payment System Configuration Required</p>
            <p className="text-sm mt-1">
              Stripe integration needs to be configured. You can still use all calculator features for free.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-6">
        {/* Current Plan */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Current Plan</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                isPremium ? 'bg-amber-100 text-amber-800' :
                isBasic ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {user.tier.charAt(0).toUpperCase() + user.tier.slice(1)}
              </span>
              {user.subscription_status && (
                <span className={`text-sm px-2 py-1 rounded-full ${
                  user.subscription_status === 'active' ? 'bg-green-100 text-green-800' :
                  user.subscription_status === 'past_due' ? 'bg-yellow-100 text-yellow-800' :
                  user.subscription_status === 'canceled' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {user.subscription_status}
                </span>
              )}
            </div>
            {hasActiveSubscription && user.stripe_subscription_id && stripeConfigured && (
              <button
                onClick={handleManageSubscription}
                disabled={isLoading}
                className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-50"
              >
                <CreditCard className="h-4 w-4 mr-1" />
                Manage Billing
              </button>
            )}
          </div>
        </div>

        {/* Subscription Status Messages */}
        {user.subscription_status === 'past_due' && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>Your payment is past due. Please update your payment method to continue using premium features.</span>
            </div>
          </div>
        )}

        {user.subscription_status === 'canceled' && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>Your subscription has been canceled. You can resubscribe below to regain access to premium features.</span>
            </div>
          </div>
        )}

        {/* Upgrade Options */}
        {!isPremium && stripeConfigured && (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Available Plans</h3>
            
            {!isBasic && (
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{PLAN_DETAILS.basic.name}</h4>
                    <p className="text-sm text-gray-600">Perfect for serious homebuyers</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      ${PLAN_DETAILS.basic.price}
                      <span className="text-sm font-normal text-gray-600">/{PLAN_DETAILS.basic.interval}</span>
                    </div>
                  </div>
                </div>
                <ul className="text-sm text-gray-600 space-y-2 mb-6">
                  {PLAN_DETAILS.basic.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleSubscribe(STRIPE_PRICES.basic_monthly)}
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Upgrade to Basic
                </button>
              </div>
            )}

            <div className="border-2 border-amber-300 rounded-lg p-6 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-amber-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{PLAN_DETAILS.premium.name}</h4>
                  <p className="text-sm text-gray-600">For real estate professionals</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    ${PLAN_DETAILS.premium.price}
                    <span className="text-sm font-normal text-gray-600">/{PLAN_DETAILS.premium.interval}</span>
                  </div>
                </div>
              </div>
              <ul className="text-sm text-gray-600 space-y-2 mb-6">
                {PLAN_DETAILS.premium.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSubscribe(STRIPE_PRICES.premium_monthly)}
                disabled={isLoading}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {isBasic ? 'Upgrade to Premium' : 'Get Premium'}
              </button>
            </div>
          </div>
        )}

        {isPremium && hasActiveSubscription && (
          <div className="bg-amber-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Crown className="h-5 w-5 text-amber-600 mr-2" />
              <span className="font-medium text-amber-800">
                You're on the Premium plan! Enjoy all features including notes, comments, and marketing content.
              </span>
            </div>
          </div>
        )}

        {/* Features Comparison */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">What's included in each plan?</h4>
          <div className="text-sm text-gray-600 space-y-2">
            <div className="flex items-center justify-between">
              <span>Unlimited calculations</span>
              <div className="flex space-x-4">
                <span className="w-16 text-center">Basic+</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>Save & share calculations</span>
              <div className="flex space-x-4">
                <span className="w-16 text-center">Basic+</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>Private notes & comments</span>
              <div className="flex space-x-4">
                <span className="w-16 text-center text-amber-600">Premium</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>Marketing content</span>
              <div className="flex space-x-4">
                <span className="w-16 text-center text-amber-600">Premium</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionManager;