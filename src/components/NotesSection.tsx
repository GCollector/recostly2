import React, { useState } from 'react';
import { Edit3, Save, X } from 'lucide-react';
import { useCalculations } from '../contexts/CalculationContext';

interface NotesSectionProps {
  calculationId: string;
  section: string;
}

const NotesSection: React.FC<NotesSectionProps> = ({ calculationId, section }) => {
  const { getCalculation, updateCalculationNotes, updateCalculationComments } = useCalculations();
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isEditingComments, setIsEditingComments] = useState(false);
  const [notesText, setNotesText] = useState('');
  const [commentsText, setCommentsText] = useState('');

  const calculation = getCalculation(calculationId);
  const existingNotes = calculation?.notes?.[section] || '';
  const existingComments = calculation?.comments || '';

  const handleEditNotes = () => {
    setNotesText(existingNotes);
    setIsEditingNotes(true);
  };

  const handleSaveNotes = async () => {
    try {
      await updateCalculationNotes(calculationId, section, notesText);
      setIsEditingNotes(false);
    } catch (error) {
      console.error('Error saving notes:', error);
      alert('Failed to save notes. Please try again.');
    }
  };

  const handleEditComments = () => {
    setCommentsText(existingComments);
    setIsEditingComments(true);
  };

  const handleSaveComments = async () => {
    try {
      await updateCalculationComments(calculationId, commentsText);
      setIsEditingComments(false);
    } catch (error) {
      console.error('Error saving comments:', error);
      alert('Failed to save comments. Please try again.');
    }
  };

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 space-y-6">
      <div className="flex items-center">
        <div className="bg-amber-500 w-8 h-8 rounded-lg flex items-center justify-center mr-3">
          <Edit3 className="h-4 w-4 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-amber-800">Premium Features</h3>
      </div>

      {/* Private Notes */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-amber-800">Private Notes</h4>
          {!isEditingNotes && (
            <button
              onClick={handleEditNotes}
              className="text-amber-600 hover:text-amber-700 text-sm font-medium"
            >
              {existingNotes ? 'Edit' : 'Add Notes'}
            </button>
          )}
        </div>

        {isEditingNotes ? (
          <div className="space-y-3">
            <textarea
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              rows={4}
              placeholder="Add your private notes about this calculation..."
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveNotes}
                className="flex items-center px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <Save className="h-4 w-4 mr-1" />
                Save
              </button>
              <button
                onClick={() => setIsEditingNotes(false)}
                className="flex items-center px-3 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white p-3 rounded-lg border border-amber-200">
            {existingNotes ? (
              <p className="text-amber-800 whitespace-pre-wrap">{existingNotes}</p>
            ) : (
              <p className="text-amber-600 italic">No notes added yet. Click "Add Notes" to get started.</p>
            )}
          </div>
        )}
      </div>

      {/* Comments */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-amber-800">Comments</h4>
          {!isEditingComments && (
            <button
              onClick={handleEditComments}
              className="text-amber-600 hover:text-amber-700 text-sm font-medium"
            >
              {existingComments ? 'Edit' : 'Add Comments'}
            </button>
          )}
        </div>

        {isEditingComments ? (
          <div className="space-y-3">
            <textarea
              value={commentsText}
              onChange={(e) => setCommentsText(e.target.value)}
              className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              rows={3}
              placeholder="Add comments that will be visible to others when you share this calculation..."
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveComments}
                className="flex items-center px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <Save className="h-4 w-4 mr-1" />
                Save
              </button>
              <button
                onClick={() => setIsEditingComments(false)}
                className="flex items-center px-3 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white p-3 rounded-lg border border-amber-200">
            {existingComments ? (
              <p className="text-amber-800 whitespace-pre-wrap">{existingComments}</p>
            ) : (
              <p className="text-amber-600 italic">No comments added yet. Click "Add Comments" to get started.</p>
            )}
          </div>
        )}
      </div>

      <div className="text-sm text-amber-700 bg-amber-100 p-3 rounded-lg">
        <p><strong>Premium Feature:</strong> Private notes are only visible to you, while comments are shared with others when you share this calculation.</p>
      </div>
    </div>
  );
};

export default NotesSection;