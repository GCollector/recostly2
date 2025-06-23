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
    <div className={`${backgroundClass} rounded-xl p-6 shadow-lg ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md ${
            readonly 
              ? 'bg-gradient-to-r from-slate-500 to-slate-600' 
              : 'bg-gradient-to-r from-slate-600 to-slate-700'
          }`}>
            {readonly ? (
              <Eye className="h-5 w-5 text-white" />
            ) : (
              <MessageSquare className="h-5 w-5 text-white" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold font-heading text-slate-900">
              {sectionTitle} Notes
            </h3>
            <div className="flex items-center space-x-2">
              {readonly ? (
                <>
                  <Eye className="h-4 w-4 text-slate-600" />
                  <span className="text-sm font-medium text-slate-700">View Only</span>
                </>
              ) : (
                <>
                  <Crown className="h-4 w-4 text-slate-600" />
                  <span className="text-sm font-medium text-slate-700">Premium Feature</span>
                </>
              )}
            </div>
          </div>
        </div>

        {!readonly && isPremium && !isEditing && calculationId !== 'temp' && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-md"
          >
            <Edit3 className="h-4 w-4" />
            <span>{hasNotes ? 'Edit Notes' : 'Add Notes'}</span>
          </button>
        )}
      </div>

      {readonly && hasNotes ? (
        // Readonly display for shared pages
        <div className="bg-white/80 backdrop-blur-sm border border-slate-400 rounded-lg p-4">
          <div className="prose prose-slate max-w-none">
            <div className="whitespace-pre-wrap text-slate-900 font-sans leading-relaxed">
              {notes}
            </div>
          </div>
        </div>
      ) : !readonly && !isPremium ? (
        <div className="bg-white/70 backdrop-blur-sm border border-slate-400 rounded-lg p-6 text-center">
          <Lock className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h4 className="text-lg font-semibold font-heading text-slate-900 mb-2">
            Premium Feature
          </h4>
          <p className="text-slate-800 mb-4">
            Add private notes to each section of your calculations. Perfect for tracking 
            assumptions, reminders, and important details.
          </p>
          <button
            onClick={() => window.location.href = '/pricing'}
            className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Upgrade to Premium
          </button>
        </div>
      ) : !readonly && calculationId === 'temp' ? (
        <div className="bg-white/70 backdrop-blur-sm border border-slate-400 rounded-lg p-6 text-center">
          <MessageSquare className="h-8 w-8 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-800 mb-4">
            Save your calculation first to add private notes to this section.
          </p>
        </div>
      ) : !readonly && isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Your private notes for {sectionTitle.toLowerCase()}:
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-32 p-4 border-2 border-slate-400 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent resize-none font-sans bg-white/90 backdrop-blur-sm"
              placeholder={`Add your private notes about ${sectionTitle.toLowerCase()}... 

Examples:
• Key assumptions made
• Important considerations
• Follow-up items
• Personal reminders`}
            />
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
              <span>{isSaving ? 'Saving...' : 'Save Notes'}</span>
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
      ) : !readonly && hasNotes ? (
        <div className="bg-white/90 backdrop-blur-sm border border-slate-400 rounded-lg p-4">
          <div className="prose prose-slate max-w-none">
            <div className="whitespace-pre-wrap text-slate-900 font-sans leading-relaxed">
              {notes}
            </div>
          </div>
        </div>
      ) : !readonly ? (
        <div className="bg-white/70 backdrop-blur-sm border border-slate-400 rounded-lg p-6 text-center">
          <MessageSquare className="h-8 w-8 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-800 mb-4">
            No notes added yet. Click "Add Notes" to include your private thoughts and reminders for this section.
          </p>
        </div>
      ) : null}
    </div>
  );
};

export default NotesSection;