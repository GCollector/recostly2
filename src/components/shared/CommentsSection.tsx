import React, { useState } from 'react';
import { MessageCircle, Save, X, Crown, Lock, Edit3, Eye } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCalculations } from '../../contexts/CalculationContext';

interface CommentsSectionProps {
  calculationId: string;
  currentComments?: string;
  className?: string;
  readonly?: boolean; // New prop for shared pages
}

const CommentsSection: React.FC<CommentsSectionProps> = ({
  calculationId,
  currentComments = '',
  className = '',
  readonly = false
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
    if (!user || !isPremium || readonly) return;

    // If we're working with a temporary calculation (not yet saved)
    // just update the local state and don't try to save to the database
    if (calculationId === 'temp') {
      setIsEditing(false);
      return;
    }

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

  // Don't show comments section on shared pages if no comments exist
  if (readonly && !hasComments) {
    return null;
  }

  if (!user && !readonly) return null;

  // Readonly styling for shared pages
  const backgroundClass = readonly 
    ? 'bg-gradient-to-br from-blue-25 to-indigo-25 border border-blue-200' 
    : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200';

  return (
    <div className={`${backgroundClass} rounded-xl p-4 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm ${
            readonly 
              ? 'bg-gradient-to-r from-blue-400 to-indigo-400' 
              : 'bg-gradient-to-r from-blue-500 to-indigo-500'
          }`}>
            {readonly ? (
              <Eye className="h-4 w-4 text-white" />
            ) : (
              <MessageCircle className="h-4 w-4 text-white" />
            )}
          </div>
          <div>
            <h3 className="text-base font-semibold font-heading text-blue-900">
              {readonly ? 'Comments' : 'Shareable Comments'}
            </h3>
            <div className="flex items-center space-x-2">
              {readonly ? (
                <>
                  <Eye className="h-3 w-3 text-blue-600" />
                  <span className="text-xs font-medium text-blue-700">View Only</span>
                </>
              ) : (
                <>
                  <Crown className="h-3 w-3 text-blue-600" />
                  <span className="text-xs font-medium text-blue-700">Premium Feature</span>
                </>
              )}
            </div>
          </div>
        </div>

        {!readonly && isPremium && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-sm"
          >
            <Edit3 className="h-3 w-3" />
            <span>{hasComments ? 'Edit' : 'Add'}</span>
          </button>
        )}
      </div>

      {readonly && hasComments ? (
        // Readonly display for shared pages
        <div className="bg-white/80 backdrop-blur-sm border border-blue-300 rounded-lg p-3 mt-2">
          <div className="prose prose-blue max-w-none">
            <div className="whitespace-pre-wrap text-blue-900 font-sans leading-relaxed text-sm">
              {comments}
            </div>
          </div>
        </div>
      ) : !readonly && !isPremium ? (
        <div className="bg-white/70 backdrop-blur-sm border border-blue-300 rounded-lg p-3 text-center mt-2">
          <Lock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <p className="text-blue-800 text-sm mb-2">
            Add shareable comments with a Premium subscription.
          </p>
          <button
            onClick={() => window.location.href = '/pricing'}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
          >
            Upgrade
          </button>
        </div>
      ) : !readonly && isEditing ? (
        <div className="space-y-3 mt-2">
          <div>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full h-24 p-3 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-sans bg-white/90 backdrop-blur-sm text-sm"
              placeholder="Add comments that will be visible to viewers of your shared calculation..."
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center space-x-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              <Save className="h-3 w-3" />
              <span>{isSaving ? 'Saving...' : 'Save'}</span>
            </button>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="flex items-center space-x-1 px-3 py-1 bg-slate-300 hover:bg-slate-400 text-slate-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              <X className="h-3 w-3" />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      ) : !readonly && hasComments ? (
        <div className="bg-white/90 backdrop-blur-sm border border-blue-300 rounded-lg p-3 mt-2">
          <div className="prose prose-blue max-w-none">
            <div className="whitespace-pre-wrap text-blue-900 font-sans leading-relaxed text-sm">
              {comments}
            </div>
          </div>
        </div>
      ) : !readonly ? (
        <div className="bg-white/70 backdrop-blur-sm border border-blue-300 rounded-lg p-3 text-center mt-2">
          <MessageCircle className="h-6 w-6 text-blue-600 mx-auto mb-1" />
          <p className="text-blue-800 text-sm">
            Click "Add" to include shareable comments.
          </p>
        </div>
      ) : null}
    </div>
  );
};

export default CommentsSection;