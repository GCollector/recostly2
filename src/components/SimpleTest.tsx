import React from 'react';

const SimpleTest: React.FC = () => {
  console.log('🚀 SimpleTest component rendered');

  const handleClick = () => {
    console.log('🔥 BUTTON CLICKED - THIS SHOULD WORK');
    alert('Button clicked! JavaScript is working!');
  };

  return (
    <div className="bg-red-100 border-2 border-red-500 p-4 rounded-lg m-4">
      <h2 className="text-red-800 font-bold mb-2">🚨 EMERGENCY JAVASCRIPT TEST</h2>
      <p className="text-red-700 mb-3">
        If this button doesn't work, there's a fundamental JavaScript/React issue:
      </p>
      <button
        onClick={handleClick}
        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
      >
        CLICK ME - TEST JAVASCRIPT
      </button>
      <div className="mt-2 text-sm text-red-600">
        Check the browser console (F12) for log messages.
      </div>
    </div>
  );
};

export default SimpleTest;