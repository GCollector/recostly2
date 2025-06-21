import React, { useState } from 'react';
import { Save, Upload, Eye } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [marketingImage, setMarketingImage] = useState(user?.marketingContent?.image || '');
  const [marketingCopy, setMarketingCopy] = useState(user?.marketingContent?.copy || '');
  const [previewUrl, setPreviewUrl] = useState('');

  if (!user || user.tier !== 'premium') {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Premium Feature</h1>
        <p className="text-gray-600 mb-8">
          Settings page is only available for Premium users. Upgrade your account to access marketing customization features.
        </p>
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

  const handleSave = () => {
    // In a real app, this would make an API call to save the settings
    console.log('Saving marketing content:', { marketingImage, marketingCopy });
    alert('Marketing content saved successfully!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Premium Settings</h1>
        <p className="text-lg text-gray-600">
          Customize your marketing content that appears on shared calculation pages.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Settings Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Marketing Content</h2>
          
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
            onClick={handleSave}
            className="w-full flex items-center justify-center px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Marketing Content
          </button>
        </div>

        {/* Preview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Preview</h2>
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
            <h3 className="font-medium text-amber-800 mb-2">Tips for effective marketing content:</h3>
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
  );
};

export default Settings;