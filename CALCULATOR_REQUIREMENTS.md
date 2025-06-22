# Calculator Page Requirements - DO NOT CHANGE

## CRITICAL: Two-Step Process Structure

The Calculator page MUST follow this exact two-step process:

### Step 1: Input Form
- Single page with all input fields
- Step indicator showing "1 Input Details" (active) and "2 View Results" (inactive)
- Sections:
  - **Mortgage Details** header
  - **Property & Financing** section with grid layout
  - **Investment Property Analysis** section (optional toggle)
- **Calculate Results** button at bottom
- NO tabs, NO separate calculator components

### Step 2: Results Display
- Completely separate view (MortgageResults component)
- **Back** button to return to Step 1
- Tab-based results with:
  - Mortgage Summary (charts and metrics)
  - Closing Costs (detailed breakdown)
  - Amortization (payment schedule)
  - Investment Analysis (if enabled)

## FORBIDDEN CHANGES

❌ **NEVER** revert to:
- Tabbed calculator interface (MortgageCalculator, ClosingCosts, etc. as separate tabs)
- Single-page calculator without steps
- Multiple calculator components on one page

❌ **NEVER** remove:
- Step indicator
- Two-step workflow
- MortgageResults component
- Investment analysis toggle

## Required File Structure

```
src/pages/Calculator.tsx - Main component with two-step logic
src/components/MortgageResults.tsx - Results display with tabs
```

## Visual Reference

The screenshots provided show the EXACT layout required:
1. Input form with step indicator
2. Results page with tabbed interface
3. Investment toggle in input form
4. Comprehensive results with charts

## Code Structure Requirements

```typescript
// Calculator.tsx MUST have:
const [currentStep, setCurrentStep] = useState<1 | 2>(1);

// Step 1: Input form
if (currentStep === 1) {
  return (
    // Form with Calculate Results button
  );
}

// Step 2: Results
if (currentStep === 2) {
  return <MortgageResults data={mortgageData} onBack={handleBackToForm} />;
}
```

## Testing Requirements

Any changes MUST pass these tests:
- ✅ Shows step indicator with correct active state
- ✅ Input form has all required sections
- ✅ Calculate Results button advances to step 2
- ✅ Results page shows tabbed interface
- ✅ Back button returns to input form
- ✅ Investment toggle works correctly

## Regression Prevention

Before making ANY changes to Calculator.tsx:
1. Read this requirements document
2. Verify the change maintains the two-step structure
3. Test the complete workflow
4. Ensure no tabbed calculator interface is introduced

**REMEMBER: The user has specifically requested this two-step process multiple times. Do not deviate from it.**