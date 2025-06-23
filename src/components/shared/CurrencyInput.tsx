import React, { useState, useEffect } from 'react';

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  className?: string;
  disabled?: boolean;
  readonly?: boolean;
  min?: number;
  max?: number;
}

const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value,
  onChange,
  placeholder = '',
  prefix = '',
  suffix = '',
  className = '',
  disabled = false,
  readonly = false,
  min,
  max
}) => {
  const [displayValue, setDisplayValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Format number with commas
  const formatWithCommas = (num: number): string => {
    if (num === 0) return '';
    return num.toLocaleString('en-US');
  };

  // Remove commas and convert to number
  const parseValue = (str: string): number => {
    const cleaned = str.replace(/[^\d]/g, '');
    return cleaned === '' ? 0 : parseInt(cleaned, 10);
  };

  // Update display value when prop value changes
  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(formatWithCommas(value));
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const numericValue = parseValue(inputValue);
    
    // Apply min/max constraints
    let constrainedValue = numericValue;
    if (min !== undefined && constrainedValue < min) {
      constrainedValue = min;
    }
    if (max !== undefined && constrainedValue > max) {
      constrainedValue = max;
    }
    
    // Update display with commas in real-time
    setDisplayValue(formatWithCommas(constrainedValue));
    onChange(constrainedValue);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setDisplayValue(formatWithCommas(value));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow: backspace, delete, tab, escape, enter, home, end, left, right
    if ([8, 9, 27, 13, 46, 35, 36, 37, 39].indexOf(e.keyCode) !== -1 ||
        // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        (e.keyCode === 65 && e.ctrlKey === true) ||
        (e.keyCode === 67 && e.ctrlKey === true) ||
        (e.keyCode === 86 && e.ctrlKey === true) ||
        (e.keyCode === 88 && e.ctrlKey === true)) {
      return;
    }
    // Ensure that it is a number and stop the keypress
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
      e.preventDefault();
    }
  };

  return (
    <div className="relative">
      {prefix && (
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 font-sans">
          {prefix}
        </span>
      )}
      <input
        type="text"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readonly}
        className={`w-full ${prefix ? 'pl-8' : 'pl-3'} ${suffix ? 'pr-16' : 'pr-3'} py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-sans ${
          disabled ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'
        } ${readonly ? 'bg-slate-50 cursor-default' : ''} ${className}`}
      />
      {suffix && (
        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 font-sans">
          {suffix}
        </span>
      )}
    </div>
  );
};

export default CurrencyInput;