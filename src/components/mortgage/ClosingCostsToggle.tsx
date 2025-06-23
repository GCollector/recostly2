import React from 'react';

interface ClosingCostsToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

const ClosingCostsToggle: React.FC<ClosingCostsToggleProps> = ({ enabled, onToggle }) => {
  return (
    <div className="flex items-center space-x-3">
      <span className="text-sm font-medium text-slate-700">
        {enabled ? 'Enabled' : 'Enable'}
      </span>
      <button
        onClick={() => onToggle(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          enabled ? 'bg-blue-600' : 'bg-slate-300'
        }`}
        role="switch"
        aria-checked={enabled}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
};

export default ClosingCostsToggle;