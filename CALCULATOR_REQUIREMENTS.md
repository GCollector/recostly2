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
- **Edit** button to return to Step 1 (NOT "Back to Input" or "Back")
- Tab-based results with responsive design:
  - **Mortgage Summary** - Featured monthly payment + supporting cards + charts
  - **Closing Costs** - Detailed provincial/municipal tax breakdown
  - **Amortization** - Payment schedule with interactive charts
  - **Investment Analysis** - ROI, cash flow, cap rate (if enabled)

## NEW: Database Naming Convention

### Table Naming Requirements
- **ALL database tables MUST use singular names**
- Examples:
  - ✅ `profile` (not `profiles`)
  - ✅ `mortgage_calculation` (not `mortgage_calculations`)
  - ✅ `user` (not `users`)
  - ✅ `payment` (not `payments`)

### Migration Standards
- All new tables must follow singular naming
- Existing tables should be renamed to singular form when possible
- Foreign key references must use singular table names
- Index names should reference singular table names

### Code Integration
- TypeScript interfaces should reflect singular table names
- Supabase client calls must use singular table names
- All database queries must target singular table names

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

#### Navigation Elements
- **Edit Button**: Simple "Edit" text with ArrowLeft icon (NOT "Back to Input" or "Back")
- **Button Styling**: `text-slate-600 hover:text-slate-900 transition-colors`
- **Position**: Left side of header, aligned with Results title

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

## NEW: Component Architecture Requirements

### Modular Component Structure
- **Large components MUST be broken down into smaller, manageable components**
- **Maximum file size**: 200-300 lines per component
- **Single Responsibility Principle**: Each component should have one clear purpose
- **Reusability**: Components should be designed for reuse where possible

### Required Component Breakdown

#### Input Form Components (`src/components/mortgage/`)
- `MortgageInputForm.tsx` - Main container for all input sections
- `PropertyFinancingSection.tsx` - Basic mortgage inputs
- `InvestmentAnalysisSection.tsx` - Investment analysis container
- `InvestmentToggle.tsx` - Reusable toggle switch
- `InvestmentFields.tsx` - Investment-specific fields

#### Results Components (`src/components/results/`)
- `MortgageSummaryTab.tsx` - Featured payment + charts + summary
- `ClosingCostsTab.tsx` - Closing costs breakdown
- `AmortizationTab.tsx` - Amortization schedule with charts
- `InvestmentAnalysisTab.tsx` - Investment metrics
- `ResultsTabNavigation.tsx` - Tab navigation component
- `ResultsActionButtons.tsx` - Save and share buttons

#### Shared Components (`src/components/shared/`)
- `ShareModal.tsx` - Reusable modal for sharing
- Other reusable UI components as needed

#### Utilities (`src/utils/`)
- `mortgageCalculations.ts` - Pure calculation functions
- Other utility functions as needed

### Component Design Principles
- **Props Interface**: Each component must have a clear TypeScript interface
- **Error Boundaries**: Components should handle errors gracefully
- **Loading States**: Components should show appropriate loading states
- **Accessibility**: All components must be accessible (ARIA labels, keyboard navigation)
- **Testing**: Each component should be testable in isolation

## FORBIDDEN CHANGES

❌ **NEVER** revert to:
- Tabbed calculator interface (MortgageCalculator, ClosingCosts, etc. as separate tabs)
- Single-page calculator without steps
- Multiple calculator components on one page
- Old single-form calculator structure
- Monolithic components over 300 lines

❌ **NEVER** remove:
- Step indicator with proper styling
- Two-step workflow
- MortgageResults component
- Investment analysis toggle
- Featured monthly payment card layout
- Responsive tab design
- Component modularity

❌ **NEVER** change:
- Font colors for consistency (all supporting amounts in slate-900)
- Tab structure with full/short names for responsive design
- Investment toggle gradient background
- Step indicator active/inactive states
- Singular table naming convention
- Edit button text (must be "Edit", not "Back" or "Back to Input")

## Required File Structure

```
src/
├── pages/
│   └── Calculator.tsx - Main component with two-step logic
├── components/
│   ├── mortgage/
│   │   ├── MortgageInputForm.tsx
│   │   ├── PropertyFinancingSection.tsx
│   │   ├── InvestmentAnalysisSection.tsx
│   │   ├── InvestmentToggle.tsx
│   │   └── InvestmentFields.tsx
│   ├── results/
│   │   ├── MortgageSummaryTab.tsx
│   │   ├── ClosingCostsTab.tsx
│   │   ├── AmortizationTab.tsx
│   │   ├── InvestmentAnalysisTab.tsx
│   │   ├── ResultsTabNavigation.tsx
│   │   └── ResultsActionButtons.tsx
│   ├── shared/
│   │   └── ShareModal.tsx
│   └── MortgageResults.tsx - Results display with tabs
├── utils/
│   └── mortgageCalculations.ts
└── test/
    └── calculator-structure.test.tsx - Structure validation tests
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

### Database Schema Requirements
- All table names MUST be singular
- Foreign key references MUST use singular table names
- Index names MUST reference singular table names
- Migration files MUST follow singular naming convention

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
8. **Edit Button**: Simple "Edit" text with ArrowLeft icon

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
- ✅ Edit button returns to input form and shows "Edit" text only
- ✅ Investment analysis tab appears when enabled
- ✅ Mobile responsive design works correctly
- ✅ All components are under 300 lines
- ✅ Components can be tested in isolation
- ✅ Database uses singular table names

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
8. Ensure components remain modular and under size limits
9. Verify database operations use singular table names
10. Confirm Edit button shows "Edit" text only

## NEW: Database Integration Requirements

### Save Functionality
- Save button in results page
- Integration with CalculationContext
- Proper error handling and loading states
- Share modal with copy-to-clipboard functionality
- All database operations MUST use singular table names

### Data Persistence
- Form data preserved when navigating between steps
- Investment analysis state maintained
- Calculation results stored with proper structure
- Database queries MUST target singular table names

**REMEMBER: The user has specifically requested this two-step process with the exact visual design shown. The featured payment card layout, responsive tabs, consistent styling, modular component architecture, singular database table naming, and "Edit" button text are critical requirements that must not be changed.**

## Change Log

### Recent Updates:
1. **Edit Button Text**: Changed from "Back to Input" to simply "Edit" for cleaner UX
2. **Database Naming Convention**: Added requirement for singular table names across all database operations
3. **Component Architecture**: Added comprehensive requirements for breaking down large components into smaller, manageable pieces
4. **Modular Design**: Established clear file structure and component organization principles
5. **Component Size Limits**: Set maximum file size limits to prevent monolithic components
6. **Testing Isolation**: Added requirements for component-level testing
7. **Visual Design Overhaul**: Added comprehensive styling requirements for step indicator, input form, and results page
8. **Responsive Tab Design**: Full names on desktop, short names on mobile, descriptions on large screens
9. **Featured Payment Card**: Prominent blue gradient card with supporting information grid
10. **Font Color Consistency**: All supporting amounts use slate-900 for visual consistency
11. **Investment Analysis Enhancement**: Improved toggle design and conditional field display
12. **Chart Data Fixes**: Corrected pie chart percentages and data validation
13. **Mobile Optimization**: Enhanced responsive design across all components
14. **Testing Framework**: Added comprehensive structure validation tests

### Breaking Changes Prevented:
- Maintained two-step process structure
- Preserved investment analysis functionality
- Kept responsive design requirements
- Maintained chart rendering capabilities
- Preserved database integration features
- Enforced component modularity
- Established singular table naming convention
- Standardized Edit button text to "Edit" only