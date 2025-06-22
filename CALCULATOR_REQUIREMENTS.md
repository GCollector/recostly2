# Calculator Page Requirements - UPDATED VERSION

## CRITICAL: Two-Step Process Structure

The Calculator page MUST follow this exact two-step process:

### Step 1: Input Form
- Single page with all input fields
- Step indicator showing "1 Input Details" (active) and "2 View Results" (inactive)
- Sections:
  - **Mortgage Details** header with subtitle
  - **Property & Financing** section with responsive grid layout (md:grid-cols-2)
  - **Investment Property Analysis** section with toggle switch and gradient background
- **Calculate Results** button at bottom with icon and hover effects
- NO tabs, NO separate calculator components

### Step 2: Results Display
- Completely separate view (MortgageResults component)
- **Back** button to return to Step 1
- Tab-based results with responsive design:
  - **Mortgage Summary** - Featured monthly payment + supporting cards + charts
  - **Closing Costs** - Detailed provincial/municipal tax breakdown
  - **Amortization** - Payment schedule with interactive charts
  - **Investment Analysis** - ROI, cash flow, cap rate (if enabled)

## NEW: Visual Design Requirements

### Step Indicator
- Two circles with numbers (1, 2)
- Active step: `bg-blue-600 text-white`
- Inactive step: `bg-slate-400 text-white`
- Connected with ArrowRight icon
- Responsive spacing and typography

### Input Form Layout
- **Container**: `bg-white rounded-xl shadow-sm border border-slate-200 min-h-[600px]`
- **Padding**: `p-8 space-y-8`
- **Typography**: Font-heading for headers, font-sans for body text
- **Colors**: Slate color palette throughout

### Investment Analysis Section
- **Background**: `bg-gradient-to-r from-emerald-50 to-blue-50`
- **Border**: `border border-emerald-200`
- **Toggle Switch**: Custom styled with emerald colors when active
- **Icon**: TrendingUp in gradient circle
- **Conditional Fields**: Show/hide based on toggle state

### Results Page Design

#### Tab Navigation
- **Container**: `bg-white rounded-xl shadow-sm border border-slate-200 p-4`
- **Grid Layout**: 
  - 3 columns by default: `grid-cols-3`
  - 4 columns when investment enabled: `grid-cols-2 sm:grid-cols-4`
- **Active Tab**: `bg-blue-100 text-blue-700`
- **Tab Content**: Icons, full names (hidden on mobile), short names (mobile only), descriptions (desktop only)

#### Mortgage Summary Layout
- **Featured Payment Card**: 
  - `bg-gradient-to-br from-blue-50 to-blue-100`
  - `border-2 border-blue-200 shadow-lg`
  - Large payment amount with blue styling
  - Calculator icon in blue circle
- **Supporting Cards**: 2x2 grid with consistent styling
  - All amounts in `text-slate-900` for consistency
  - Smaller descriptive text in `text-slate-600`
  - Additional context in `text-slate-500`

#### Chart Requirements
- **Pie Chart**: Total cost breakdown with custom labels showing percentages
- **Bar Chart**: Interest vs Principal comparison
- **Line Chart**: Remaining balance over time (amortization)
- **Responsive**: All charts in ResponsiveContainer
- **Colors**: Consistent color scheme (emerald, blue, red)

## FORBIDDEN CHANGES

❌ **NEVER** revert to:
- Tabbed calculator interface (MortgageCalculator, ClosingCosts, etc. as separate tabs)
- Single-page calculator without steps
- Multiple calculator components on one page
- Old single-form calculator structure

❌ **NEVER** remove:
- Step indicator with proper styling
- Two-step workflow
- MortgageResults component
- Investment analysis toggle
- Featured monthly payment card layout
- Responsive tab design

❌ **NEVER** change:
- Font colors for consistency (all supporting amounts in slate-900)
- Tab structure with full/short names for responsive design
- Investment toggle gradient background
- Step indicator active/inactive states

## Required File Structure

```
src/pages/Calculator.tsx - Main component with two-step logic
src/components/MortgageResults.tsx - Results display with tabs
src/test/calculator-structure.test.tsx - Structure validation tests
```

## NEW: Data Structure Requirements

### MortgageData Interface
```typescript
export interface MortgageData {
  homePrice: number;
  downPayment: number;
  interestRate: number;
  amortizationYears: number;
  paymentFrequency: 'monthly' | 'bi-weekly';
  province: 'ontario' | 'bc';
  city: 'toronto' | 'vancouver';
  isFirstTimeBuyer: boolean;
  enableInvestmentAnalysis: boolean;
  monthlyRent?: number;
  monthlyExpenses?: {
    taxes: number;
    insurance: number;
    condoFees: number;
    maintenance: number;
    other: number;
  };
}
```

### Investment Analysis Requirements
- Toggle switch with emerald color scheme
- Conditional rendering of rent and expense fields
- Grid layout for expense inputs: `md:grid-cols-2 lg:grid-cols-3`
- Fourth tab appears in results when enabled
- Cash flow, cap rate, and ROI calculations
- Investment warnings for negative cash flow or low cap rates

## NEW: Responsive Design Requirements

### Mobile Adaptations
- Tab names: Show short names on mobile, full names on desktop
- Grid layouts: Responsive breakpoints for all sections
- Step indicator: Maintains readability on small screens
- Featured payment card: Scales appropriately
- Supporting cards: 2x2 grid on mobile, maintains spacing

### Desktop Enhancements
- Tab descriptions visible on large screens
- Full section names and detailed layouts
- Optimal chart sizing and spacing
- Enhanced hover states and transitions

## Visual Reference Requirements

The design MUST match these specifications:
1. **Step Indicator**: Blue active state, slate inactive state, arrow connector
2. **Input Form**: Clean white card with proper spacing and typography
3. **Investment Section**: Emerald gradient background with toggle
4. **Results Tabs**: Responsive grid with icons and descriptions
5. **Featured Payment**: Prominent blue gradient card
6. **Supporting Cards**: Consistent slate-900 text for all amounts
7. **Charts**: Proper color scheme and responsive containers

## Code Structure Requirements

```typescript
// Calculator.tsx MUST have:
const [currentStep, setCurrentStep] = useState<1 | 2>(1);
const [mortgageData, setMortgageData] = useState<MortgageData>({...});

// Step 1: Input form
if (currentStep === 1) {
  return (
    <div className="space-y-8">
      {/* Header with title and subtitle */}
      {/* Step indicator */}
      {/* Form with all sections */}
      {/* Calculate Results button */}
    </div>
  );
}

// Step 2: Results
if (currentStep === 2) {
  return <MortgageResults data={mortgageData} onBack={handleBackToForm} />;
}
```

## NEW: Testing Requirements

Any changes MUST pass these tests:
- ✅ Shows step indicator with correct active state styling
- ✅ Input form has all required sections with proper styling
- ✅ Investment toggle shows/hides fields correctly
- ✅ Calculate Results button advances to step 2
- ✅ Results page shows tabbed interface with responsive design
- ✅ Featured payment card displays prominently
- ✅ Supporting cards use consistent font colors
- ✅ Charts render without errors
- ✅ Back button returns to input form
- ✅ Investment analysis tab appears when enabled
- ✅ Mobile responsive design works correctly

## NEW: Chart Data Requirements

### Pie Chart
- Must show correct percentages in labels
- Three segments: Down Payment (emerald), Principal (blue), Interest (red)
- Custom label function with proper percentage calculation
- Legend below chart with color indicators

### Bar Charts
- Interest vs Principal comparison
- Amortization schedule with stacked bars
- Proper data validation to prevent undefined values
- Responsive height and formatting

### Line Charts
- Remaining balance over time
- Smooth curves with proper data points
- Tooltip formatting for currency values

## Regression Prevention

Before making ANY changes to Calculator.tsx or MortgageResults.tsx:
1. Read this requirements document completely
2. Verify the change maintains the two-step structure
3. Check that visual design requirements are preserved
4. Test the complete workflow including responsive design
5. Ensure no tabbed calculator interface is introduced
6. Verify chart functionality remains intact
7. Confirm font color consistency is maintained

## NEW: Database Integration Requirements

### Save Functionality
- Save button in results page
- Integration with CalculationContext
- Proper error handling and loading states
- Share modal with copy-to-clipboard functionality

### Data Persistence
- Form data preserved when navigating between steps
- Investment analysis state maintained
- Calculation results stored with proper structure

**REMEMBER: The user has specifically requested this two-step process with the exact visual design shown. The featured payment card layout, responsive tabs, and consistent styling are critical requirements that must not be changed.**

## Change Log

### Recent Updates:
1. **Visual Design Overhaul**: Added comprehensive styling requirements for step indicator, input form, and results page
2. **Responsive Tab Design**: Full names on desktop, short names on mobile, descriptions on large screens
3. **Featured Payment Card**: Prominent blue gradient card with supporting information grid
4. **Font Color Consistency**: All supporting amounts use slate-900 for visual consistency
5. **Investment Analysis Enhancement**: Improved toggle design and conditional field display
6. **Chart Data Fixes**: Corrected pie chart percentages and data validation
7. **Mobile Optimization**: Enhanced responsive design across all components
8. **Testing Framework**: Added comprehensive structure validation tests

### Breaking Changes Prevented:
- Maintained two-step process structure
- Preserved investment analysis functionality
- Kept responsive design requirements
- Maintained chart rendering capabilities
- Preserved database integration features