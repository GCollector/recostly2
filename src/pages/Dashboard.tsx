import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Calculator, Crown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
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
        <p className="text-gray-600 mb-8">You need to be signed in to view your dashboard.</p>
        <Link
          to="/login"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Sign In
        </Link>
      </div>
    );
  }

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
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-lg text-gray-600">
          Welcome back, {user.name}! Access your mortgage calculator and account settings.
        </p>
      </div>

      {/* Account Overview */}
      <div className="grid md:grid-cols-2 gap-6">
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
              <div className="text-sm text-gray-600">Current subscription</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="bg-emerald-100 w-12 h-12 rounded-lg flex items-center justify-center mr-4">
              <Calculator className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">Ready to Calculate</div>
              <div className="text-sm text-gray-600">All tools available</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            to="/calculator"
            className="bg-blue-50 hover:bg-blue-100 p-6 rounded-lg transition-colors group"
          >
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
              <Calculator className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Mortgage Calculator</h3>
            <p className="text-gray-600">Calculate mortgage payments and analyze your options</p>
          </Link>

          <Link
            to="/settings"
            className="bg-gray-50 hover:bg-gray-100 p-6 rounded-lg transition-colors group"
          >
            <div className="bg-gray-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-gray-200 transition-colors">
              <Crown className="h-6 w-6 text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Account Settings</h3>
            <p className="text-gray-600">Manage your profile and subscription</p>
          </Link>

          <Link
            to="/pricing"
            className="bg-amber-50 hover:bg-amber-100 p-6 rounded-lg transition-colors group"
          >
            <div className="bg-amber-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-amber-200 transition-colors">
              <Crown className="h-6 w-6 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Upgrade Plan</h3>
            <p className="text-gray-600">Unlock premium features and tools</p>
          </Link>
        </div>
      </div>

      {/* Account Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Information</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Profile Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="text-gray-900">{user.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="text-gray-900">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Plan:</span>
                <span className="text-gray-900 capitalize">{user.tier}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-2">Subscription Status</h3>
            <div className="space-y-2 text-sm">
              {user.subscription_status && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`capitalize ${
                    user.subscription_status === 'active' ? 'text-green-600' :
                    user.subscription_status === 'past_due' ? 'text-yellow-600' :
                    user.subscription_status === 'canceled' ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {user.subscription_status}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Member since:</span>
                <span className="text-gray-900">
                  {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;