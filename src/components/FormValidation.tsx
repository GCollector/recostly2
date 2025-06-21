import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';

export interface ValidationError {
  field: string;
  message: string;
  type: 'error' | 'warning';
}

export interface MortgageValidationRules {
  homePrice: number;
  downPayment: number;
  interestRate: number;
  amortizationYears: number;
  isFirstTimeBuyer: boolean;
  province: 'ontario' | 'bc';
}

export const validateMortgageInputs = (inputs: MortgageValidationRules): ValidationError[] => {
  const errors: ValidationError[] = [];
  const { homePrice, downPayment, interestRate, amortizationYears, isFirstTimeBuyer, province } = inputs;

  // Home Price Validations
  if (homePrice <= 0) {
    errors.push({
      field: 'homePrice',
      message: 'Home price must be greater than $0',
      type: 'error'
    });
  } else if (homePrice < 25000) {
    errors.push({
      field: 'homePrice',
      message: 'Home price seems unusually low. Please verify the amount.',
      type: 'warning'
    });
  } else if (homePrice > 10000000) {
    errors.push({
      field: 'homePrice',
      message: 'Home price exceeds typical mortgage limits. Consider jumbo loan options.',
      type: 'warning'
    });
  }

  // Down Payment Validations
  if (downPayment <= 0) {
    errors.push({
      field: 'downPayment',
      message: 'Down payment must be greater than $0',
      type: 'error'
    });
  } else if (downPayment >= homePrice) {
    errors.push({
      field: 'downPayment',
      message: 'Down payment cannot be equal to or greater than the home price',
      type: 'error'
    });
  } else {
    const downPaymentPercent = (downPayment / homePrice) * 100;
    
    // Canadian minimum down payment rules
    if (homePrice <= 500000) {
      // Homes $500K and under: minimum 5%
      if (downPaymentPercent < 5) {
        errors.push({
          field: 'downPayment',
          message: 'Minimum down payment is 5% for homes $500,000 and under',
          type: 'error'
        });
      }
    } else if (homePrice <= 1000000) {
      // Homes $500K-$1M: 5% on first $500K + 10% on remainder
      const requiredDownPayment = 25000 + ((homePrice - 500000) * 0.10);
      if (downPayment < requiredDownPayment) {
        errors.push({
          field: 'downPayment',
          message: `Minimum down payment is $${requiredDownPayment.toLocaleString()} (5% on first $500K + 10% on remainder)`,
          type: 'error'
        });
      }
    } else {
      // Homes over $1M: minimum 20%
      if (downPaymentPercent < 20) {
        errors.push({
          field: 'downPayment',
          message: 'Minimum down payment is 20% for homes over $1,000,000',
          type: 'error'
        });
      }
    }

    // CMHC insurance requirements
    if (downPaymentPercent < 20 && homePrice > 1000000) {
      errors.push({
        field: 'downPayment',
        message: 'Mortgage insurance is not available for homes over $1,000,000',
        type: 'error'
      });
    }

    // First-time buyer considerations
    if (isFirstTimeBuyer && downPaymentPercent < 5) {
      errors.push({
        field: 'downPayment',
        message: 'First-time buyers can qualify with as little as 5% down payment',
        type: 'warning'
      });
    }

    // High down payment warning
    if (downPaymentPercent > 50) {
      errors.push({
        field: 'downPayment',
        message: 'Consider keeping some funds for closing costs and emergency reserves',
        type: 'warning'
      });
    }
  }

  // Interest Rate Validations
  if (interestRate <= 0) {
    errors.push({
      field: 'interestRate',
      message: 'Interest rate must be greater than 0%',
      type: 'error'
    });
  } else if (interestRate > 20) {
    errors.push({
      field: 'interestRate',
      message: 'Interest rate seems unusually high. Please verify the rate.',
      type: 'warning'
    });
  } else if (interestRate < 1) {
    errors.push({
      field: 'interestRate',
      message: 'Interest rate seems unusually low. Please verify the rate.',
      type: 'warning'
    });
  }

  // Stress Test Validation (Canadian B-20 Guidelines)
  const stressTestRate = Math.max(interestRate + 2, 5.25); // Bank of Canada qualifying rate
  const loanAmount = homePrice - downPayment;
  const monthlyStressRate = stressTestRate / 100 / 12;
  const totalPayments = amortizationYears * 12;
  
  let stressTestPayment = 0;
  if (monthlyStressRate > 0) {
    stressTestPayment = loanAmount * (monthlyStressRate * Math.pow(1 + monthlyStressRate, totalPayments)) / 
                      (Math.pow(1 + monthlyStressRate, totalPayments) - 1);
  }

  // Amortization Period Validations
  if (amortizationYears < 5) {
    errors.push({
      field: 'amortizationYears',
      message: 'Minimum amortization period is typically 5 years',
      type: 'error'
    });
  } else if (amortizationYears > 30) {
    errors.push({
      field: 'amortizationYears',
      message: 'Maximum amortization period is 30 years for insured mortgages',
      type: 'error'
    });
  } else if (amortizationYears > 25 && (downPayment / homePrice) < 0.20) {
    errors.push({
      field: 'amortizationYears',
      message: 'Amortization over 25 years requires minimum 20% down payment',
      type: 'error'
    });
  }

  // Provincial Considerations
  if (province === 'bc' && homePrice > 750000) {
    errors.push({
      field: 'homePrice',
      message: 'BC homes over $750,000 may be subject to additional property transfer tax',
      type: 'warning'
    });
  }

  if (province === 'ontario' && homePrice > 400000) {
    errors.push({
      field: 'homePrice',
      message: 'Ontario homes over $400,000 may have higher land transfer tax in some municipalities',
      type: 'warning'
    });
  }

  return errors;
};

interface ValidationDisplayProps {
  errors: ValidationError[];
  className?: string;
}

export const ValidationDisplay: React.FC<ValidationDisplayProps> = ({ errors, className = '' }) => {
  if (errors.length === 0) return null;

  const errorMessages = errors.filter(e => e.type === 'error');

  return (
    <div className={`space-y-3 ${className}`}>
      {errorMessages.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800 mb-2">
                Please fix the following errors:
              </h3>
              <ul className="text-sm text-red-700 space-y-1">
                {errorMessages.map((error, index) => (
                  <li key={index} className="flex items-start">
                    <span className="inline-block w-1 h-1 bg-red-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    {error.message}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to get field-specific errors
export const getFieldErrors = (errors: ValidationError[], fieldName: string): ValidationError[] => {
  return errors.filter(error => error.field === fieldName);
};

// Helper function to check if form has any errors
export const hasErrors = (errors: ValidationError[]): boolean => {
  return errors.some(error => error.type === 'error');
};

// Helper function to get error class for input fields
export const getInputErrorClass = (errors: ValidationError[], fieldName: string): string => {
  const fieldErrors = getFieldErrors(errors, fieldName);
  const hasError = fieldErrors.some(error => error.type === 'error');
  const hasWarning = fieldErrors.some(error => error.type === 'warning');
  
  if (hasError) {
    return 'border-red-300 focus:ring-red-500 focus:border-red-500';
  } else if (hasWarning) {
    return 'border-amber-300 focus:ring-amber-500 focus:border-amber-500';
  }
  
  return 'border-gray-300 focus:ring-blue-500 focus:border-transparent';
};