import React, { useState } from 'react';
import { Edit3, Save, X, MessageSquare, Lock, Crown, Eye } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCalculations } from '../../contexts/CalculationContext';

interface NotesSectionProps {
  calculationId: string;
  section: string;
  sectionTitle: string;
  currentNotes?: string;
  className?: string;
  readonly?: boolean;
}

const NotesSection: React.FC<NotesSectionProps> = ({
  calculationId,
  section,
  sectionTitle,
  currentNotes = '',
  className = '',
  readonly = false
}) => {
  const { user } = useAuth();
  const { updateCalculationNotes } = useCalculations();
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(currentNotes);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const isPremium = user?.tier === 'premium';
  const hasNotes = notes.trim().length > 0;

  const handleSave = async () => {
    if (!user || !isPremium || calculationId === 'temp' || readonly) return;

    setIsSaving(true);
    setError('');

    try {
      await updateCalculationNotes(calculationId, section, notes);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to save notes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setNotes(currentNotes);
    setIsEditing(false);
    setError('');
  };

  // Don't show notes section on shared pages if no notes exist
  if (readonly && !hasNotes) {
    return null;
  }

  if (!user && !readonly) return null;

  // Neutral styling instead of yellow/amber
  const backgroundClass = readonly 
    ? 'bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-300' 
    : 'bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-300';

  return (
    <div className={`${backgroundClass} rounded-xl p-4 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm ${
            readonly 
              ? 'bg-gradient-to-r from-slate-500 to-slate-600' 
              : 'bg-gradient-to-r from-slate-600 to-slate-700'
          }`}>
            {readonly ? (
              <Eye className="h-4 w-4 text-white" />
            ) : (
              <MessageSquare className="h-4 w-4 text-white" />
            )}
          </div>
          <div>
            <h3 className="text-base font-semibold font-heading text-slate-900">
              {sectionTitle} Notes
            </h3>
            <div className="flex items-center space-x-2">
              {readonly ? (
                <>
                  <Eye className="h-3 w-3 text-slate-600" />
                  <span className="text-xs font-medium text-slate-700">View Only</span>
                </>
              ) : (
                <>
                  <Crown className="h-3 w-3 text-slate-600" />
                  <span className="text-xs font-medium text-slate-700">Premium Feature</span>
                </>
              )}
            </div>
          </div>
        </div>

        {!readonly && isPremium && !isEditing && calculationId !== 'temp' && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center space-x-1 px-3 py-1 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-sm"
          >
            <Edit3 className="h-3 w-3" />
            <span>{hasNotes ? 'Edit' : 'Add'}</span>
          </button>
        )}
      </div>

      {readonly && hasNotes ? (
        // Readonly display for shared pages
        <div className="bg-white/80 backdrop-blur-sm border border-slate-400 rounded-lg p-3 mt-2">
          <div className="prose prose-slate max-w-none">
            <div className="whitespace-pre-wrap text-slate-900 font-sans leading-relaxed text-sm">
              {notes}
            </div>
          </div>
        </div>
      ) : !readonly && !isPremium ? (
        <div className="bg-white/70 backdrop-blur-sm border border-slate-400 rounded-lg p-3 text-center mt-2">
          <Lock className="h-8 w-8 text-slate-600 mx-auto mb-2" />
          <p className="text-slate-800 text-sm mb-2">
            Add shareable notes to your calculations with a Premium subscription.
          </p>
          <button
            onClick={() => window.location.href = '/pricing'}
            className="bg-slate-600 hover:bg-slate-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
          >
            Upgrade
          </button>
        </div>
      ) : !readonly && calculationId === 'temp' ? (
        <div className="bg-white/70 backdrop-blur-sm border border-slate-400 rounded-lg p-3 text-center mt-2">
          <MessageSquare className="h-6 w-6 text-slate-600 mx-auto mb-1" />
          <p className="text-slate-800 text-sm">
            Save calculation first to add notes.
          </p>
        </div>
      ) : !readonly && isEditing ? (
        <div className="space-y-3 mt-2">
          <div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-24 p-3 border-2 border-slate-400 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent resize-none font-sans bg-white/90 backdrop-blur-sm text-sm"
              placeholder={`Add notes about ${sectionTitle.toLowerCase()}...`}
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
      ) : !readonly && hasNotes ? (
        <div className="bg-white/90 backdrop-blur-sm border border-slate-400 rounded-lg p-3 mt-2">
          <div className="prose prose-slate max-w-none">
            <div className="whitespace-pre-wrap text-slate-900 font-sans leading-relaxed text-sm">
              {notes}
            </div>
          </div>
        </div>
      ) : !readonly ? (
        <div className="bg-white/70 backdrop-blur-sm border border-slate-400 rounded-lg p-3 text-center mt-2">
          <MessageSquare className="h-6 w-6 text-slate-600 mx-auto mb-1" />
          <p className="text-slate-800 text-sm">
            Click "Add" to include notes for this section.
          </p>
        </div>
      ) : null}
    </div>
  );
};

export default NotesSection;