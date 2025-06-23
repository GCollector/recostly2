import React from 'react';
import { Save, Share2 } from 'lucide-react';

interface ResultsActionButtonsProps {
  onSave: () => void;
  onShare: () => void;
  isSaving: boolean;
  user: any;
}

const ResultsActionButtons: React.FC<ResultsActionButtonsProps> = ({
  onSave,
  onShare,
  isSaving,
  user
}) => {
  return (
    <div className="flex gap-3">
      <button
        onClick={onSave}
        disabled={isSaving}
        className="flex-1 flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
      >
        <Save className="h-4 w-4 mr-2" />
        {isSaving ? 'Saving...' : user ? 'Save Calculation' : 'Save & Share'}
      </button>
      
      <button
        onClick={onShare}
        disabled={isSaving}
        className="flex items-center justify-center px-4 py-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-medium transition-colors disabled:opacity-50"
      >
        <Share2 className="h-4 w-4 mr-2" />
        Share
      </button>
    </div>
  );
};

export default ResultsActionButtons;