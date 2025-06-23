export interface RentVsBuyData {
  monthlyRent: number;
  annualRentIncrease: number;
  comparisonYears: number;
}

export interface RentVsBuyResults {
  totalRentPaid: number;
  totalOwnershipCost: number;
  netBenefit: number;
  yearlyComparison: Array<{
    year: number;
    cumulativeRent: number;
    cumulativeOwnership: number;
    difference: number;
  }>;
}

export interface ClosingCostPreset {
  id: string;
  name: string;
  tag: string;
  landTransferTax: number;
  additionalTax: number;
  legalFees: number;
  titleInsurance: number;
  homeInspection: number;
  appraisal: number;
  surveyFee: number;
  firstTimeBuyerRebate: number;
  created_at: string;
  updated_at: string;
}

export interface AffordabilityData {
  annualIncome: number;
  monthlyDebts: number;
  downPayment: number;
  interestRate: number;
}

export interface AffordabilityResults {
  maxAffordablePrice: number;
  gdsRatio: number;
  tdsRatio: number;
  isWithinBudget: boolean;
  maxMonthlyPayment: number;
}

export interface PremiumSettings {
  enableRentVsBuy: boolean;
  enableAffordabilityEstimator: boolean;
  collectLeadInfo: boolean;
}