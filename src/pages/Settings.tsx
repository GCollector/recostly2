import React, { useState } from 'react';
import { Save, Upload, Eye, User, Crown, CreditCard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import SubscriptionManager from '../components/SubscriptionManager';

const Settings: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [marketingImage, setMarketingImage] = useState(user?.marketing_image || '');
  const [marketingCopy, setMarketingCopy] = useState(user?.marketing_copy || '');
  const [previewUrl, setPreviewUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'subscription' | 'marketing'>('profile');

  if (!user) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h1>
        <p className="text-gray-600 mb-8">You need to be signed in to access settings.</p>
      </div>
    );
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setMarketingImage(result);
        setPreviewUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      await updateProfile({ name, email });
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveMarketing = async () => {
    setIsLoading(true);
    try {
      await updateProfile({ 
        marketing_image: marketingImage, 
        marketing_copy: marketingCopy 
      });
      alert('Marketing content saved successfully!');
    } catch (error) {
      console.error('Error saving marketing content:', error);
      alert('Failed to save marketing content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'subscription', name: 'Subscription', icon: CreditCard },
    ...(user.tier === 'premium' ? [{ id: 'marketing', name: 'Marketing', icon: Crown }] : []),
  ] as const;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-lg text-gray-600">
          Manage your account preferences and subscription.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
        <nav className="flex space-x-1" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {activeTab === 'profile' && (
          <div className="p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Account Status</h3>
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  user.tier === 'premium' ? 'bg-amber-100 text-amber-800' :
                  user.tier === 'basic' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {user.tier.charAt(0).toUpperCase() + user.tier.slice(1)} Plan
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
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={isLoading}
              className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        )}

        {activeTab === 'subscription' && (
          <div className="p-6">
            <SubscriptionManager />
          </div>
        )}

        {activeTab === 'marketing' && user.tier === 'premium' && (
          <div className="p-6 space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Marketing Content</h2>
              <p className="text-gray-600">
                Customize your marketing content that appears on shared calculation pages.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Settings Form */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Marketing Image
                  </label>
                  <div className="space-y-4">
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-4 text-gray-500" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Click to upload</span> your marketing image
                          </p>
                          <p className="text-xs text-gray-500">PNG, JPG or GIF (MAX. 2MB)</p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageUpload}
                        />
                      </label>
                    </div>
                    
                    {previewUrl && (
                      <div className="relative">
                        <img
                          src={previewUrl}
                          alt="Marketing preview"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marketing Copy
                  </label>
                  <textarea
                    value={marketingCopy}
                    onChange={(e) => setMarketingCopy(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    rows={6}
                    placeholder="Enter your marketing message that will appear on shared calculation pages. This could include your contact information, services offered, or a call-to-action."
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    This text will appear below shared calculations to promote your services.
                  </p>
                </div>

                <button
                  onClick={handleSaveMarketing}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Saving...' : 'Save Marketing Content'}
                </button>
              </div>

              {/* Preview */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Preview</h3>
                  <Eye className="h-5 w-5 text-gray-500" />
                </div>
                
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    This is how your marketing content will appear at the bottom of shared calculation pages:
                  </p>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <div className="border-t border-gray-200 pt-6">
                        <div className="text-center space-y-4">
                          {previewUrl ? (
                            <img
                              src={previewUrl}
                              alt="Marketing"
                              className="w-24 h-24 object-cover rounded-full mx-auto"
                            />
                          ) : (
                            <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto flex items-center justify-center">
                              <span className="text-gray-400 text-sm">Your Logo</span>
                            </div>
                          )}
                          
                          <div className="space-y-2">
                            {marketingCopy ? (
                              <p className="text-gray-700 whitespace-pre-wrap">{marketingCopy}</p>
                            ) : (
                              <p className="text-gray-400 italic">Your marketing message will appear here...</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 p-4 rounded-lg">
                  <h4 className="font-medium text-amber-800 mb-2">Tips for effective marketing content:</h4>
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li>• Keep your message concise and professional</li>
                    <li>• Include your contact information</li>
                    <li>• Highlight your expertise and services</li>
                    <li>• Use a high-quality, professional headshot or logo</li>
                    <li>• Include a clear call-to-action</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;