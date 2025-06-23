import React, { useState } from 'react';
import { MessageCircle, Save, X, Crown, Lock, Edit3 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCalculations } from '../../contexts/CalculationContext';

interface CommentsSectionProps {
  calculationId: string;
  currentComments?: string;
  className?: string;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({
  calculationId,
  currentComments = '',
  className = ''
}) => {
  const { user } = useAuth();
  const { updateCalculationComments } = useCalculations();
  const [isEditing, setIsEditing] = useState(false);
  const [comments, setComments] = useState(currentComments);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const isPremium = user?.tier === 'premium';
  const hasComments = comments.trim().length > 0;

  const handleSave = async () => {
    if (!user || !isPremium) return;

    setIsSaving(true);
    setError('');

    try {
      await updateCalculationComments(calculationId, comments);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to save comments');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setComments(currentComments);
    setIsEditing(false);
    setError('');
  };

  if (!user) return null;

  return (
    <div className={`bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 shadow-lg ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-md">
            <MessageCircle className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold font-heading text-blue-900">
              Shareable Comments
            </h3>
            <div className="flex items-center space-x-2">
              <Crown className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Premium Feature</span>
            </div>
          </div>
        </div>

        {isPremium && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-md"
          >
            <Edit3 className="h-4 w-4" />
            <span>{hasComments ? 'Edit Comments' : 'Add Comments'}</span>
          </button>
        )}
      </div>

      {!isPremium ? (
        <div className="bg-white/70 backdrop-blur-sm border border-blue-300 rounded-lg p-6 text-center">
          <Lock className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h4 className="text-lg font-semibold font-heading text-blue-900 mb-2">
            Premium Feature
          </h4>
          <p className="text-blue-800 mb-4">
            Add comments that will be visible to anyone who views your shared calculation. 
            Perfect for explaining your assumptions or providing context to clients.
          </p>
          <button
            onClick={() => window.location.href = '/pricing'}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Upgrade to Premium
          </button>
        </div>
      ) : isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-blue-900 mb-2">
              Comments visible to anyone viewing this shared calculation:
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full h-32 p-4 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-sans bg-white/90 backdrop-blur-sm"
              placeholder={`Add comments that will be visible to viewers of your shared calculation...

Examples:
• "Based on current market rates as of [date]"
• "Assumes 5% annual property appreciation"
• "Contact me for personalized advice: your@email.com"
• "This calculation includes estimated closing costs"`}
            />
          </div>

          <div className="bg-blue-100 border border-blue-300 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> These comments will be visible to anyone who views your shared calculation link.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{isSaving ? 'Saving...' : 'Save Comments'}</span>
            </button>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-300 hover:bg-slate-400 text-slate-700 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              <X className="h-4 w-4" />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      ) : hasComments ? (
        <div className="bg-white/90 backdrop-blur-sm border border-blue-300 rounded-lg p-4">
          <div className="prose prose-blue max-w-none">
            <div className="whitespace-pre-wrap text-blue-900 font-sans leading-relaxed">
              {comments}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white/70 backdrop-blur-sm border border-blue-300 rounded-lg p-6 text-center">
          <MessageCircle className="h-8 w-8 text-blue-600 mx-auto mb-3" />
          <p className="text-blue-800 mb-4">
            No comments added yet. Add comments that will be visible to anyone viewing your shared calculation.
          </p>
        </div>
      )}
    </div>
  );
};

export default CommentsSection;