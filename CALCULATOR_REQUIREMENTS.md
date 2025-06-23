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

## NEW: User Tier System and Save Limits

### Tier Definitions
- **Public (unregistered users)**: Cannot save calculations, must create an account
- **Free registered user**: Can save maximum of 1 calculation. They should be informed of this wherever necessary. Encouraged to buy basic membership or delete existing calculation to save a new one.
- **Basic tier** ($9/month): Can save unlimited calculations
- **Premium tier** ($29/month): Can save unlimited calculations plus access to notes and comments

### Save Limit Implementation
- Server-side validation in database trigger function
- Client-side validation in CalculationContext
- Clear error messages for users hitting limits
- Upgrade prompts for free users
- Delete existing calculation option for free users

### Database Trigger Requirements
```sql
-- Free users (tier = 'free' in database) can only save 1 calculation
IF user_tier = 'free' AND calculation_count >= 1 THEN
  RAISE EXCEPTION 'Free users can only save 1 calculation. Upgrade to Basic plan for unlimited calculations, or delete your existing calculation to save a new one.';
END IF;
```

### Client-side Error Handling
- Show clear error messages when save limits are reached
- Provide upgrade options
- Allow deletion of existing calculations for free users
- Inform users about tier limitations upfront

## NEW: Premium Notes and Comments System

### Notes Feature (Premium Only)
- **Private Notes**: Available in each results tab (Mortgage Summary, Closing Costs, Amortization, Investment Analysis)
- **Section-specific**: Each tab has its own notes section
- **Premium Gating**: Non-premium users see upgrade prompts
- **Visual Design**: Amber gradient background with Crown icon
- **Functionality**:
  - Add/Edit/Save notes for each section
  - Notes are private to the user
  - Preserved when calculation is saved
  - Rich text editing with proper formatting

### Comments Feature (Premium Only)
- **Shareable Comments**: Visible to anyone viewing shared calculation
- **Global Comments**: Apply to entire calculation, not section-specific
- **Premium Gating**: Non-premium users see upgrade prompts
- **Visual Design**: Blue gradient background with Crown icon
- **Functionality**:
  - Add/Edit/Save comments for entire calculation
  - Comments appear on shared calculation pages
  - Perfect for explaining assumptions to clients
  - Professional presentation

### Notes/Comments Integration
- **Always Visible**: Notes and comments sections appear for all logged-in users
- **Contextual Display**: Show appropriate upgrade prompts for non-premium users
- **Save Integration**: Notes and comments saved with calculation data
- **Dashboard Indicators**: Show badges when calculations have notes/comments

## NEW: Navigation System Updates

### Home Page Behavior
- **Logged-out users**: See marketing home page at `/`
- **Logged-in users**: Automatically redirected from `/` to `/dashboard`
- **Seamless Experience**: No loading screens or flickers during redirect

### Header Navigation Changes
- **Removed "Dashboard" link** from header navigation
- **"Home" serves dual purpose**:
  - For logged-out users: Takes to marketing home page
  - For logged-in users: Takes to dashboard
- **Active State Logic**: Properly highlights "Home" when user is on dashboard
- **Mobile Navigation**: Same logic applied to mobile menu

### Navigation Structure
```typescript
// Logged-out users
const loggedOutNavigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Calculator', href: '/calculator', icon: Calculator },
];

// Logged-in users  
const loggedInNavigation = [
  { name: 'Home', href: '/dashboard', icon: Home }, // Points to dashboard
  { name: 'Calculator', href: '/calculator', icon: Calculator },
];
```

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

#### Notes and Comments Design
- **Notes Sections**: Amber gradient background (`from-amber-50 to-orange-50`)
- **Comments Section**: Blue gradient background (`from-blue-50 to-indigo-50`)
- **Premium Indicators**: Crown icons and "Premium Feature" labels
- **Upgrade Prompts**: Lock icons with clear upgrade calls-to-action
- **Edit States**: Proper form controls with save/cancel buttons

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
- `MortgageSummaryTab.tsx` - Featured payment + charts + summary + notes
- `ClosingCostsTab.tsx` - Closing costs breakdown + notes
- `AmortizationTab.tsx` - Amortization schedule with charts + notes
- `InvestmentAnalysisTab.tsx` - Investment metrics + notes
- `ResultsTabNavigation.tsx` - Tab navigation component
- `ResultsActionButtons.tsx` - Save and share buttons

#### Shared Components (`src/components/shared/`)
- `ShareModal.tsx` - Reusable modal for sharing
- `NotesSection.tsx` - Premium notes functionality for each tab
- `CommentsSection.tsx` - Premium comments functionality for calculations
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
- Dashboard link in header navigation

❌ **NEVER** remove:
- Step indicator with proper styling
- Two-step workflow
- MortgageResults component
- Investment analysis toggle
- Featured monthly payment card layout
- Responsive tab design
- Component modularity
- Tier-based save limits
- Notes and comments functionality
- Home → Dashboard redirect for logged-in users

❌ **NEVER** change:
- Font colors for consistency (all supporting amounts in slate-900)
- Tab structure with full/short names for responsive design
- Investment toggle gradient background
- Step indicator active/inactive states
- Singular table naming convention
- Edit button text (must be "Edit", not "Back" or "Back to Input")
- User tier system and save limits
- Premium gating for notes and comments
- Navigation behavior for logged-in vs logged-out users

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
│   │   ├── ShareModal.tsx
│   │   ├── NotesSection.tsx
│   │   └── CommentsSection.tsx
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
- Notes stored as JSONB object with section keys
- Comments stored as text field

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
- Notes/comments: Full-width on mobile with proper touch targets

### Desktop Enhancements
- Tab descriptions visible on large screens
- Full section names and detailed layouts
- Optimal chart sizing and spacing
- Enhanced hover states and transitions
- Notes/comments: Side-by-side layouts where appropriate

## NEW: Shared Calculation Page Requirements

### Shared Calculation Display
- No step indicator on shared calculation page
- Same tab-based results display as step 2 of the calculator
- No ability to edit the calculation
- Clear "Create Your Own" link to start a new calculation
- Proper display of all calculation details and charts
- Comments visible to all viewers (if added by premium user)

### Marketing Content for Premium Users
- Premium users can add marketing content to shared calculations
- Marketing content includes profile image and custom text
- Marketing content is shown by default but can be hidden by viewers
- Non-premium users see generic calculator branding

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
9. **Notes Sections**: Amber gradient with Crown icons and premium gating
10. **Comments Section**: Blue gradient with Crown icons and premium gating
11. **Navigation**: Home redirects to dashboard for logged-in users

## Code Structure Requirements

```typescript
// Calculator.tsx MUST have:
const [currentStep, setCurrentStep] = useState<1 | 2>(1);
const [mortgageData, setMortgageData] = useState<MortgageData>({...});
const [savedCalculationId, setSavedCalculationId] = useState<string>('');
const [currentNotes, setCurrentNotes] = useState<Record<string, string>>({});
const [currentComments, setCurrentComments] = useState<string>('');

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
  return <MortgageResults 
    data={mortgageData} 
    onBack={handleBackToForm}
    calculationId={savedCalculationId}
    currentNotes={currentNotes}
    currentComments={currentComments}
    onCalculationSaved={handleCalculationSaved}
  />;
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
- ✅ Save limits work correctly for each tier
- ✅ Error messages are clear and actionable
- ✅ Shared calculation page displays correctly
- ✅ Marketing content shows/hides correctly on shared pages
- ✅ Notes sections appear in all result tabs for logged-in users
- ✅ Comments section appears for logged-in users
- ✅ Premium gating works correctly for notes and comments
- ✅ Home redirects to dashboard for logged-in users
- ✅ Navigation active states work correctly
- ✅ Dashboard indicators show when calculations have notes/comments

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
11. Test tier-based save limits work correctly
12. Verify error messages are clear and helpful
13. Test shared calculation page functionality
14. Verify notes and comments functionality works correctly
15. Test premium gating for notes and comments
16. Confirm navigation behavior for logged-in vs logged-out users
17. Test dashboard redirect functionality

## NEW: Database Integration Requirements

### Save Functionality
- Save button in results page
- Integration with CalculationContext
- Proper error handling and loading states
- Share modal with copy-to-clipboard functionality
- All database operations MUST use singular table names
- Tier-based save limits enforced both client and server-side
- Notes and comments saved with calculation data

### Data Persistence
- Form data preserved when navigating between steps
- Investment analysis state maintained
- Calculation results stored with proper structure
- Database queries MUST target singular table names
- Save limits respected and clearly communicated to users
- Notes and comments preserved across sessions
- Dashboard shows indicators for calculations with notes/comments

**REMEMBER: The user has specifically requested this two-step process with the exact visual design shown. The featured payment card layout, responsive tabs, consistent styling, modular component architecture, singular database table naming, tier-based save limits, premium notes and comments functionality, and navigation behavior are critical requirements that must not be changed.**

## Change Log

### Recent Updates:
1. **Navigation System Overhaul**: Home now redirects to dashboard for logged-in users, removed Dashboard from header
2. **Premium Notes System**: Added section-specific private notes for premium users in all result tabs
3. **Premium Comments System**: Added shareable comments for premium users visible on shared calculations
4. **Dashboard Enhancements**: Added indicators showing which calculations have notes/comments
5. **Component Integration**: Notes and comments integrated into all result tab components
6. **Premium Gating**: Proper upgrade prompts and feature gating for non-premium users
7. **Visual Design**: Amber gradient for notes, blue gradient for comments, Crown icons for premium features
8. **User Tier System**: Updated tier definitions to use 'free', 'basic', and 'premium'
9. **Save Limit Implementation**: Both client-side and server-side validation for free users
10. **Error Handling**: Clear error messages and upgrade prompts for users hitting limits
11. **Database Triggers**: Server-side enforcement of save limits based on user tier
12. **Edit Button Text**: Changed from "Back to Input" to simply "Edit" for cleaner UX
13. **Database Naming Convention**: Added requirement for singular table names across all database operations
14. **Component Architecture**: Added comprehensive requirements for breaking down large components into smaller, manageable pieces
15. **Modular Design**: Established clear file structure and component organization principles
16. **Component Size Limits**: Set maximum file size limits to prevent monolithic components
17. **Testing Isolation**: Added requirements for component-level testing
18. **Visual Design Overhaul**: Added comprehensive styling requirements for step indicator, input form, and results page
19. **Responsive Tab Design**: Full names on desktop, short names on mobile, descriptions on large screens
20. **Featured Payment Card**: Prominent blue gradient card with supporting information grid
21. **Font Color Consistency**: All supporting amounts use slate-900 for visual consistency
22. **Investment Analysis Enhancement**: Improved toggle design and conditional field display
23. **Chart Data Fixes**: Corrected pie chart percentages and data validation
24. **Mobile Optimization**: Enhanced responsive design across all components
25. **Testing Framework**: Added comprehensive structure validation tests
26. **Shared Calculation Page**: Added requirements for shared calculation display
27. **Marketing Content**: Added ability for premium users to customize shared calculation pages

### Breaking Changes Prevented:
- Maintained two-step process structure
- Preserved investment analysis functionality
- Kept responsive design requirements
- Maintained chart rendering capabilities
- Preserved database integration features
- Enforced component modularity
- Established singular table naming convention
- Standardized Edit button text to "Edit" only
- Implemented proper tier-based save limits
- Enhanced shared calculation functionality
- Added premium notes and comments without breaking existing functionality
- Maintained navigation consistency while improving user experience