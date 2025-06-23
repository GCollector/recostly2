# Calculator Page Requirements - UPDATED VERSION

## CRITICAL: Two-Step Process Structure

The Calculator page MUST follow this exact two-step process:

### Step 1: Input Form
- Single page with all input fields
- Step indicator showing "1 Input Details" (active) and "2 View Results" (inactive)
- Sections:
  - **Mortgage Details** header with subtitle
  - **Property & Financing** section with responsive grid layout (md:grid-cols-2)
  - **Closing Costs Analysis** section with toggle switch and blue gradient background (OPTIONAL)
  - **Investment Property Analysis** section with toggle switch and emerald gradient background (OPTIONAL)
  - **Marketing Control** section for premium users with amber gradient background
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

## NEW: Currency Formatting Requirements

### Real-Time Currency Formatting
- **ALL money input fields** must display values with commas as the user types
- **CurrencyInput component** must be used for all monetary inputs
- **Format**: Numbers should be formatted with commas for thousands (e.g., 1,000,000)
- **Prefix**: Dollar sign ($) should be shown as a prefix
- **Suffix**: Percentage (%) should be shown as a suffix where appropriate
- **Parsing**: Component must handle removing commas and converting to numbers for calculations
- **Validation**: Only numeric input should be allowed
- **Accessibility**: Full keyboard support including arrow keys, backspace, delete
- **Responsive**: Works on all screen sizes and devices

### CurrencyInput Features
- Real-time formatting as user types
- Support for prefix and suffix
- Support for placeholder text
- Support for disabled and readonly states
- Support for min/max constraints
- Proper focus and blur handling
- Keyboard navigation support
- Consistent styling with other form elements

## NEW: Dynamic Closing Costs Requirements

### Automatic Calculation
- **Land transfer tax** must be automatically calculated based on:
  - Property price
  - Province (Ontario vs BC)
  - City (Toronto vs Vancouver)
- **Municipal tax** (Toronto only) must be automatically calculated
- **First-time buyer rebate** must be automatically applied when eligible
- **Readonly fields**: Tax fields that are automatically calculated should be readonly
- **Visual distinction**: Readonly fields should have a different background color
- **Explanatory text**: Small helper text should explain automatic calculations

### Closing Costs Dependencies
- **Property price changes** must trigger recalculation of land transfer tax
- **Location changes** must trigger recalculation of applicable taxes
- **First-time buyer status** must trigger recalculation of rebates
- **Automatic updates**: Changes to dependent fields must happen in real-time
- **Manual overrides**: Non-dependent fields remain editable

### Closing Costs UI Requirements
- **Readonly styling**: Gray background for auto-calculated fields
- **Helper text**: Explain which fields are automatically calculated
- **Total calculation**: Show running total of all closing costs
- **Visual feedback**: Clearly indicate which fields are dependent on mortgage details

## NEW: Optional Sections System

### Two Optional Sections
1. **Closing Costs Analysis** (enabled by default with reasonable values)
2. **Investment Property Analysis** (disabled by default)

### Visual Separation
- Each optional section separated by `border-t border-slate-200 pt-8`
- Clear visual hierarchy with proper spacing
- Gradient backgrounds to distinguish sections
- Toggle switches for enable/disable functionality

### Default Values
- **Closing Costs**: Reasonable defaults based on location and property price
- **Investment Analysis**: Standard rental market values for the selected city
- **Marketing Control**: Show marketing content by default for premium users

## NEW: Premium Marketing Control

### Marketing Control Section (Premium Only)
- **Visibility**: Only shown to premium users in input form
- **Purpose**: Control whether professional services appear on shared calculations
- **Default**: Marketing content shown by default (`showMarketingOnShare: true`)
- **Toggle**: Premium users can hide their marketing content on shared pages
- **Visual Design**: Amber gradient background with Crown icon
- **Clear Explanation**: Describes impact of toggle on shared calculation visibility

### Shared Page Marketing Logic
- **Premium users with marketing enabled**: Show professional services section prominently
- **Premium users with marketing disabled**: Show default calculator branding
- **Non-premium users**: Always show default calculator branding
- **Viewer control removed**: Viewers cannot hide/show marketing content

## NEW: User Tier System and Save Limits

### Tier Definitions
- **Public (unregistered users)**: Cannot save calculations, must create an account
- **Free registered user**: Can save maximum of 1 calculation. They should be informed of this wherever necessary. Encouraged to buy basic membership or delete existing calculation to save a new one.
- **Basic tier** ($9/month): Can save unlimited calculations
- **Premium tier** ($29/month): Can save unlimited calculations plus access to notes, comments, and marketing control

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
- **Visual Design**: Neutral slate gradient background (NOT yellow/amber)
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

## NEW: Shared Calculation Page Requirements

### Shared Page Display Rules
- **No Edit Capabilities**: All notes and comments are readonly on shared pages
- **Visual Distinction**: Readonly styling to clearly indicate view-only mode
- **No Navigation Elements**: Remove "Create Your Own" buttons and links
- **Clean Presentation**: Focus entirely on calculation results and content
- **Comments Visibility**: Show shareable comments if added by premium user (readonly)
- **Notes Privacy**: Private notes are NEVER shown on shared pages
- **Interactive Charts**: MUST include all interactive charts from main calculator
- **Professional Services Above Tabs**: Marketing content positioned above tab navigation for better visibility
- **Marketing Control Respected**: Only show marketing if premium user enabled it

### Shared Page Layout Structure
1. **Header**: Title, property price, creation date
2. **Professional Services Section**: Premium user marketing content (if enabled) OR default calculator branding
3. **Tab Navigation**: Same responsive tab system as main calculator
4. **Tab Content**: Full interactive charts and data displays
5. **Readonly Notes/Comments**: Show existing content in readonly mode
6. **NO "Create Your Own" elements**: Completely removed

### Interactive Charts on Shared Pages
- **MUST include all charts**: Pie charts, bar charts, line charts from main calculator
- **Full interactivity**: Tooltips, legends, responsive containers
- **Consistent styling**: Same colors, formatting, and layout as main calculator
- **Chart data validation**: Proper error handling for missing or invalid data
- **Responsive design**: Charts adapt to different screen sizes

### Readonly Notes/Comments Styling
- **Notes Sections**: Display with neutral slate background and "View Only" indicator
- **Comments Section**: Display with muted blue background and "View Only" indicator
- **No Edit Controls**: Remove all edit buttons, save buttons, and form controls
- **Lock Icons**: Use lock or eye icons to indicate readonly state
- **Professional Layout**: Maintain visual hierarchy while clearly showing readonly state

### Removed Elements on Shared Pages
- **Top Navigation**: No "Create Your Own" button in header area
- **Bottom CTA**: Remove entire "Create Your Own Calculation" section at bottom
- **Edit Controls**: No edit buttons or form controls for notes/comments
- **Action Buttons**: No save, share, or edit buttons
- **Viewer Controls**: No hide/show toggle for marketing content

### Professional Services Marketing Enhancement
- **Positioned Above Tabs**: Marketing content now appears above tab navigation for maximum visibility
- **Premium User Control**: Marketing only shows if premium user enabled it in calculator
- **No Viewer Control**: Viewers cannot hide marketing content
- **Default Branding**: Non-premium calculations or disabled marketing show professional calculator branding
- **Enhanced Visibility**: Better positioning for premium users to market their services

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

### Optional Sections Design
- **Closing Costs Section**: `bg-gradient-to-r from-blue-50 to-indigo-50` with blue border
- **Investment Analysis Section**: `bg-gradient-to-r from-emerald-50 to-blue-50` with emerald border
- **Marketing Control Section**: `bg-gradient-to-r from-amber-50 to-orange-50` with amber border
- **Visual Separation**: `border-t border-slate-200 pt-8` between sections
- **Toggle Switches**: Custom styled with section-appropriate colors when active
- **Icons**: Appropriate icons in gradient circles for each section

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
- **CRITICAL**: All charts MUST be interactive on shared pages
- **Tooltips**: Proper formatting for currency values
- **Legends**: Clear color indicators and labels

#### Notes and Comments Design
- **Notes Sections**: Neutral slate gradient background (`from-slate-50 to-slate-100`)
- **Comments Section**: Blue gradient background (`from-blue-50 to-indigo-50`)
- **Premium Indicators**: Crown icons and "Premium Feature" labels
- **Upgrade Prompts**: Lock icons with clear upgrade calls-to-action
- **Edit States**: Proper form controls with save/cancel buttons
- **Readonly States**: Muted backgrounds with eye/lock icons for shared pages

#### Shared Page Readonly Design
- **Readonly Notes**: Muted slate background (`from-slate-50 to-slate-100`) with eye icon
- **Readonly Comments**: Muted blue background (`from-blue-25 to-indigo-25`) with eye icon
- **No Edit Controls**: Remove all buttons and form elements
- **Clear Indicators**: "View Only" text and appropriate icons
- **Professional Appearance**: Maintain visual hierarchy while showing readonly state

#### Shared Page Marketing Enhancement
- **Professional Services Above Tabs**: Marketing content positioned prominently above tab navigation
- **Enhanced Visibility**: Better positioning for premium users to showcase their services
- **Clean Integration**: Marketing content flows naturally into calculation results
- **No Viewer Control**: Viewers cannot hide/show marketing content (premium user controls this)

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
- `ClosingCostsSection.tsx` - Closing costs analysis container
- `ClosingCostsToggle.tsx` - Reusable toggle switch for closing costs
- `ClosingCostsFields.tsx` - Closing costs input fields
- `InvestmentAnalysisSection.tsx` - Investment analysis container
- `InvestmentToggle.tsx` - Reusable toggle switch for investment
- `InvestmentFields.tsx` - Investment-specific fields
- `MarketingControlSection.tsx` - Premium marketing control (premium only)

#### Results Components (`src/components/results/`)
- `MortgageSummaryTab.tsx` - Featured payment + charts + summary + notes
- `ClosingCostsTab.tsx` - Closing costs breakdown + notes (supports custom values)
- `AmortizationTab.tsx` - Amortization schedule with charts + notes
- `InvestmentAnalysisTab.tsx` - Investment metrics + notes
- `ResultsTabNavigation.tsx` - Tab navigation component
- `ResultsActionButtons.tsx` - Save and share buttons

#### Shared Components (`src/components/shared/`)
- `CurrencyInput.tsx` - Reusable currency input with formatting
- `ShareModal.tsx` - Reusable modal for sharing
- `NotesSection.tsx` - Premium notes functionality for each tab (supports readonly mode)
- `CommentsSection.tsx` - Premium comments functionality for calculations (supports readonly mode)
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
- **Readonly Support**: Notes and Comments components must support readonly mode for shared pages
- **Chart Integration**: All result components must include interactive charts

## FORBIDDEN CHANGES

❌ **NEVER** revert to:
- Tabbed calculator interface (MortgageCalculator, ClosingCosts, etc. as separate tabs)
- Single-page calculator without steps
- Multiple calculator components on one page
- Old single-form calculator structure
- Monolithic components over 300 lines
- Dashboard link in header navigation
- Editable notes/comments on shared pages
- "Create Your Own" elements on shared pages
- Static charts or missing charts on shared pages
- Marketing content below tabs on shared pages
- Yellow/amber styling for notes sections
- Viewer control over marketing content visibility

❌ **NEVER** remove:
- Step indicator with proper styling
- Two-step workflow
- MortgageResults component
- Optional sections (closing costs and investment analysis)
- Featured monthly payment card layout
- Responsive tab design
- Component modularity
- Tier-based save limits
- Notes and comments functionality
- Home → Dashboard redirect for logged-in users
- Readonly state for shared page notes/comments
- Interactive charts on shared pages
- Professional services marketing section
- Premium marketing control functionality

❌ **NEVER** change:
- Font colors for consistency (all supporting amounts in slate-900)
- Tab structure with full/short names for responsive design
- Optional sections gradient backgrounds (blue for closing costs, emerald for investment)
- Step indicator active/inactive states
- Singular table naming convention
- Edit button text (must be "Edit", not "Back" or "Back to Input")
- User tier system and save limits
- Premium gating for notes and comments
- Navigation behavior for logged-in vs logged-out users
- Readonly behavior on shared calculation pages
- Chart interactivity and responsiveness
- Marketing content positioning above tabs
- Neutral slate styling for notes sections

## Required File Structure

```
src/
├── pages/
│   ├── Calculator.tsx - Main component with two-step logic
│   └── SharedCalculation.tsx - Shared page with full chart functionality
├── components/
│   ├── mortgage/
│   │   ├── MortgageInputForm.tsx
│   │   ├── PropertyFinancingSection.tsx
│   │   ├── ClosingCostsSection.tsx
│   │   ├── ClosingCostsToggle.tsx
│   │   ├── ClosingCostsFields.tsx
│   │   ├── InvestmentAnalysisSection.tsx
│   │   ├── InvestmentToggle.tsx
│   │   ├── InvestmentFields.tsx
│   │   └── MarketingControlSection.tsx
│   ├── results/
│   │   ├── MortgageSummaryTab.tsx (supports readonly mode)
│   │   ├── ClosingCostsTab.tsx (supports readonly mode and custom values)
│   │   ├── AmortizationTab.tsx (supports readonly mode)
│   │   ├── InvestmentAnalysisTab.tsx (supports readonly mode)
│   │   ├── ResultsTabNavigation.tsx
│   │   └── ResultsActionButtons.tsx
│   ├── shared/
│   │   ├── CurrencyInput.tsx - Reusable currency input with formatting
│   │   ├── ShareModal.tsx
│   │   ├── NotesSection.tsx (supports readonly mode, neutral styling)
│   │   └── CommentsSection.tsx (supports readonly mode)
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
  enableClosingCosts: boolean; // New optional section
  showMarketingOnShare: boolean; // Premium marketing control
  monthlyRent?: number;
  monthlyExpenses?: {
    taxes: number;
    insurance: number;
    condoFees: number;
    maintenance: number;
    other: number;
  };
  closingCosts?: { // Custom closing costs
    landTransferTax: number;
    additionalTax: number;
    legalFees: number;
    titleInsurance: number;
    homeInspection: number;
    appraisal: number;
    surveyFee: number;
    firstTimeBuyerRebate: number;
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
- Marketing control stored in notes as `showMarketingOnShare` boolean

### Optional Sections Requirements
- **Closing Costs**: Blue gradient background, enabled by default with reasonable values
- **Investment Analysis**: Emerald gradient background, disabled by default
- **Marketing Control**: Amber gradient background, premium users only, enabled by default
- **Visual Separation**: Clear borders and spacing between sections
- **Toggle Switches**: Section-appropriate colors when active
- **Default Values**: Reasonable defaults for all optional fields

## NEW: Responsive Design Requirements

### Mobile Adaptations
- Tab names: Show short names on mobile, full names on desktop
- Grid layouts: Responsive breakpoints for all sections
- Step indicator: Maintains readability on small screens
- Featured payment card: Scales appropriately
- Supporting cards: 2x2 grid on mobile, maintains spacing
- Notes/comments: Full-width on mobile with proper touch targets
- Charts: Responsive containers with proper mobile sizing
- Optional sections: Stack vertically on mobile with proper spacing

### Desktop Enhancements
- Tab descriptions visible on large screens
- Full section names and detailed layouts
- Optimal chart sizing and spacing
- Enhanced hover states and transitions
- Notes/comments: Side-by-side layouts where appropriate
- Marketing content: Enhanced visibility and professional presentation
- Optional sections: Proper grid layouts with visual hierarchy

## NEW: Shared Calculation Page Requirements

### Shared Calculation Display
- **No step indicator** on shared calculation page
- **Same tab-based results display** as step 2 of the calculator
- **No ability to edit** the calculation or any content
- **NO "Create Your Own" elements** anywhere on the page
- **Proper display** of all calculation details and charts
- **Comments visibility**: Show shareable comments if added by premium user (readonly)
- **Notes privacy**: Private notes are NEVER shown on shared pages
- **Interactive charts**: MUST include all charts with full interactivity
- **Professional services above tabs**: Marketing content positioned prominently (if enabled)
- **Marketing control respected**: Only show marketing if premium user enabled it

### Chart Requirements for Shared Pages
- **All interactive charts**: Pie charts, bar charts, line charts must be included
- **Full functionality**: Tooltips, legends, responsive behavior
- **Data validation**: Proper error handling for missing data
- **Consistent styling**: Same colors and formatting as main calculator
- **Performance**: Charts load efficiently without blocking page render

### Readonly Notes/Comments Display
- **Notes sections**: Show with readonly styling if they exist, but typically hidden on shared pages
- **Comments section**: Show with readonly styling and "View Only" indicator
- **No edit controls**: Remove all edit buttons, save buttons, and form controls
- **Professional presentation**: Maintain visual hierarchy while clearly indicating readonly state
- **Clear indicators**: Use eye icons and "View Only" text to show readonly state

### Removed Elements on Shared Pages
- **All "Create Your Own" buttons and links**: Completely removed from header and footer
- **Edit controls**: No edit buttons or form controls anywhere
- **Action buttons**: No save, share, or edit buttons
- **Navigation elements**: Minimal navigation, focus on content display
- **Call-to-action sections**: Remove bottom CTA section entirely
- **Viewer controls**: No hide/show toggle for marketing content

### Marketing Content for Premium Users
- **Premium users can control marketing visibility** in calculator input form
- **Marketing content includes** profile image and custom text
- **Marketing content is shown by default** but can be disabled by premium user
- **Non-premium users see** generic calculator branding
- **No viewer control**: Viewers cannot hide/show marketing content
- **Positioned above tabs**: Enhanced visibility for premium user marketing

## Visual Reference Requirements

The design MUST match these specifications:
1. **Step Indicator**: Blue active state, slate inactive state, arrow connector
2. **Input Form**: Clean white card with proper spacing and typography
3. **Optional Sections**: Blue gradient for closing costs, emerald for investment, amber for marketing control
4. **Results Tabs**: Responsive grid with icons and descriptions
5. **Featured Payment**: Prominent blue gradient card
6. **Supporting Cards**: Consistent slate-900 text for all amounts
7. **Charts**: Proper color scheme and responsive containers with full interactivity
8. **Edit Button**: Simple "Edit" text with ArrowLeft icon
9. **Notes Sections**: Neutral slate gradient with Crown icons and premium gating
10. **Comments Section**: Blue gradient with Crown icons and premium gating
11. **Navigation**: Home redirects to dashboard for logged-in users
12. **Shared Page**: Clean, readonly presentation with no "Create Your Own" elements
13. **Readonly Styling**: Muted backgrounds and eye icons for readonly content
14. **Interactive Charts**: All charts functional on shared pages with tooltips and legends
15. **Marketing Above Tabs**: Professional services section positioned prominently above tab navigation
16. **Visual Separation**: Clear borders and spacing between optional sections

## Code Structure Requirements

```typescript
// Calculator.tsx MUST have:
const [currentStep, setCurrentStep] = useState<1 | 2>(1);
const [mortgageData, setMortgageData] = useState<MortgageData>({...});
const [savedCalculationId, setSavedCalculationId] = useState<string>('');
const [currentNotes, setCurrentNotes] = useState<Record<string, string>>({});
const [currentComments, setCurrentComments] = useState<string>('');

// MortgageData interface MUST include:
export interface MortgageData {
  // ... other fields
  enableInvestmentAnalysis: boolean;
  enableClosingCosts: boolean;
  showMarketingOnShare: boolean; // For premium users
}

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

// SharedCalculation.tsx MUST have:
// 1. Professional services section ABOVE tab navigation
// 2. Full tab navigation with ResultsTabNavigation component
// 3. All result tab components with readonly=true prop
// 4. Interactive charts in all tabs
// 5. Readonly notes/comments sections
// 6. NO "Create Your Own" elements anywhere
// 7. Marketing control respected (only show if premium user enabled it)
```

## NEW: Testing Requirements

Any changes MUST pass these tests:
- ✅ Shows step indicator with correct active state styling
- ✅ Input form has all required sections with proper styling
- ✅ Investment toggle shows/hides fields correctly
- ✅ Closing costs toggle shows/hides fields correctly
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
- ✅ Shared page shows readonly notes/comments correctly
- ✅ Shared page has no "Create Your Own" elements
- ✅ Shared page has no edit controls for any content
- ✅ **CRITICAL**: All interactive charts render on shared pages
- ✅ **CRITICAL**: Charts have tooltips and legends on shared pages
- ✅ **CRITICAL**: Charts are responsive on shared pages
- ✅ **CRITICAL**: Professional services section appears above tabs
- ✅ **CRITICAL**: Marketing content positioning enhances visibility
- ✅ **CRITICAL**: Marketing control respected on shared pages
- ✅ **CRITICAL**: Notes sections use neutral slate styling (not yellow/amber)
- ✅ **CRITICAL**: Optional sections have proper visual separation
- ✅ **CRITICAL**: All money fields use CurrencyInput with real-time formatting
- ✅ **CRITICAL**: Closing costs automatically update based on property details
- ✅ **CRITICAL**: Dependent closing cost fields are readonly with proper styling

## NEW: Chart Data Requirements

### Pie Chart
- Must show correct percentages in labels
- Three segments: Down Payment (emerald), Principal (blue), Interest (red)
- Custom label function with proper percentage calculation
- Legend below chart with color indicators
- **CRITICAL**: Must be interactive on shared pages

### Bar Charts
- Interest vs Principal comparison
- Amortization schedule with stacked bars
- Proper data validation to prevent undefined values
- Responsive height and formatting
- **CRITICAL**: Must be interactive on shared pages

### Line Charts
- Remaining balance over time
- Smooth curves with proper data points
- Tooltip formatting for currency values
- **CRITICAL**: Must be interactive on shared pages

### Chart Integration Requirements
- All charts MUST use ResponsiveContainer
- Tooltips MUST format currency values correctly
- Charts MUST handle missing or invalid data gracefully
- Charts MUST be responsive across all screen sizes
- Charts MUST maintain consistent color scheme
- **CRITICAL**: Charts MUST be fully interactive on shared pages

## Regression Prevention

Before making ANY changes to Calculator.tsx, MortgageResults.tsx, or SharedCalculation.tsx:
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
18. Verify shared page readonly behavior
19. Confirm no "Create Your Own" elements on shared pages
20. Test readonly styling for notes and comments
21. **CRITICAL**: Verify all charts are interactive on shared pages
22. **CRITICAL**: Test chart responsiveness and tooltips
23. **CRITICAL**: Confirm professional services section is above tabs
24. **CRITICAL**: Test marketing content visibility and positioning
25. **CRITICAL**: Verify marketing control works correctly
26. **CRITICAL**: Confirm notes sections use neutral styling
27. **CRITICAL**: Verify optional sections have proper visual separation
28. **CRITICAL**: Verify all money fields use CurrencyInput component
29. **CRITICAL**: Test automatic closing cost updates based on property details
30. **CRITICAL**: Confirm dependent closing cost fields are readonly

## NEW: Database Integration Requirements

### Save Functionality
- Save button in results page
- Integration with CalculationContext
- Proper error handling and loading states
- Share modal with copy-to-clipboard functionality
- All database operations MUST use singular table names
- Tier-based save limits enforced both client and server-side
- Notes and comments saved with calculation data
- Marketing control preference saved with calculation data

### Data Persistence
- Form data preserved when navigating between steps
- Optional sections state maintained
- Calculation results stored with proper structure
- Database queries MUST target singular table names
- Save limits respected and clearly communicated to users
- Notes and comments preserved across sessions
- Dashboard shows indicators for calculations with notes/comments
- Shared pages display readonly content appropriately
- Chart data properly stored and retrieved for shared pages
- Marketing control preference respected on shared pages

**REMEMBER: The user has specifically requested this two-step process with the exact visual design shown. The featured payment card layout, responsive tabs, consistent styling, modular component architecture, singular database table naming, tier-based save limits, premium notes and comments functionality, navigation behavior, readonly shared page behavior, interactive charts on shared pages, professional services positioning above tabs, neutral notes styling, and optional sections with proper visual separation are critical requirements that must not be changed.**

## Change Log

### Recent Updates:
1. **Currency Formatting**: Added real-time comma formatting for all money fields
2. **Dynamic Closing Costs**: Made closing costs automatically update based on property details
3. **Readonly Fields**: Added readonly styling for auto-calculated closing cost fields
4. **CurrencyInput Component**: Created reusable component for all monetary inputs
5. **Dependent Fields**: Implemented automatic recalculation of dependent closing cost fields
6. **Helper Text**: Added explanatory text for automatically calculated fields
7. **Optional Sections System**: Added two optional sections (Closing Costs and Investment Analysis)
8. **Visual Separation**: Added clear visual separation between optional sections
9. **Closing Costs Section**: Added as optional section with toggle (enabled by default)
10. **Premium Marketing Control**: Added ability for premium users to control marketing visibility
11. **Notes Styling**: Changed from amber/yellow to neutral slate styling
12. **Marketing Control Logic**: Viewers can no longer hide marketing content
13. **Shared Page Chart Requirements**: Added mandatory interactive charts on shared calculation pages
14. **Professional Services Enhancement**: Moved marketing content above tabs for better visibility
15. **Chart Interactivity**: All charts must be fully functional on shared pages with tooltips and legends
16. **Component Readonly Support**: Enhanced all result tab components to support readonly mode
17. **Marketing Positioning**: Professional services section now positioned prominently above tab navigation
18. **Visual Consistency**: Shared pages must maintain same chart styling and functionality as main calculator
19. **Shared Page Readonly Requirements**: Added comprehensive requirements for readonly notes/comments on shared pages
20. **Removed "Create Your Own" Elements**: Specified removal of all "Create Your Own" buttons and CTAs from shared pages
21. **Readonly Styling Guidelines**: Added specific styling requirements for readonly content display
22. **Component Readonly Support**: Required NotesSection and CommentsSection to support readonly mode
23. **Visual Distinction**: Added requirements for clear readonly indicators and muted styling
24. **Navigation System Overhaul**: Home now redirects to dashboard for logged-in users, removed Dashboard from header
25. **Premium Notes System**: Added section-specific private notes for premium users in all result tabs
26. **Premium Comments System**: Added shareable comments for premium users visible on shared calculations

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
- Enforced readonly behavior on shared pages
- Removed "Create Your Own" elements from shared pages without affecting main application
- **CRITICAL**: Ensured all charts remain interactive on shared pages
- **CRITICAL**: Enhanced marketing content positioning for better visibility
- **CRITICAL**: Changed notes styling to neutral slate instead of yellow/amber
- **CRITICAL**: Added proper visual separation between optional sections
- **CRITICAL**: Implemented real-time currency formatting for all money fields
- **CRITICAL**: Made closing costs dynamically update based on property details