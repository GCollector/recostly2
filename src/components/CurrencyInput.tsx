import React, { useState, useEffect } from 'react';

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
  prefix?: string;
  suffix?: string;
}

const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value,
  onChange,
  placeholder,
  className = '',
  prefix = '$',
  suffix = ''
}) => {
  const [displayValue, setDisplayValue] = useState('');

  // Format number with commas while preserving cursor position
  const formatWithCommas = (str: string): string => {
    // Remove all non-digits
    const digits = str.replace(/\D/g, '');
    
    // Add commas
    if (digits === '') return '';
    
    // Convert to number and back to get proper formatting
    const number = parseInt(digits, 10);
    return number.toLocaleString('en-US');
  };

  // Remove commas and convert to number
  const parseNumber = (str: string): number => {
    const cleaned = str.replace(/[^\d]/g, '');
    return cleaned === '' ? 0 : parseInt(cleaned, 10);
  };

  // Update display value when value prop changes
  useEffect(() => {
    const formatted = value === 0 ? '' : value.toLocaleString('en-US');
    setDisplayValue(formatted);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const cursorPosition = e.target.selectionStart || 0;
    
    // Get the numeric value
    const numericValue = parseNumber(inputValue);
    
    // Format with commas
    const formattedValue = formatWithCommas(inputValue);
    
    // Update display value
    setDisplayValue(formattedValue);
    
    // Call onChange with the numeric value
    onChange(numericValue);
    
    // Restore cursor position after formatting
    setTimeout(() => {
      const input = e.target;
      const oldLength = inputValue.length;
      const newLength = formattedValue.length;
      const lengthDiff = newLength - oldLength;
      
      // Adjust cursor position based on added/removed commas
      let newCursorPosition = cursorPosition + lengthDiff;
      
      // Make sure cursor position is valid
      newCursorPosition = Math.max(0, Math.min(newCursorPosition, formattedValue.length));
      
      input.setSelectionRange(newCursorPosition, newCursorPosition);
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow: backspace, delete, tab, escape, enter, home, end, left, right
    if ([8, 9, 27, 13, 46, 35, 36, 37, 39].indexOf(e.keyCode) !== -1 ||
        // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+Z
        (e.ctrlKey && [65, 67, 86, 88, 90].indexOf(e.keyCode) !== -1)) {
      return;
    }
    
    // Ensure that it is a number and stop the keypress
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
      e.preventDefault();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const numericValue = parseNumber(pastedText);
    onChange(numericValue);
  };

  return (
    <div className="relative">
      {prefix && (
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10">
          {prefix}
        </span>
      )}
      <input
        type="text"
        value={displayValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        placeholder={placeholder}
        className={`w-full ${prefix ? 'pl-8' : 'pl-3'} ${suffix ? 'pr-16' : 'pr-3'} py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
      />
      {suffix && (
        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 z-10">
          {suffix}
        </span>
      )}
    </div>
  );
};

export default CurrencyInput;