# Calculator Page Requirements - UPDATED VERSION

## CRITICAL: Two-Step Process Structure

The Calculator page MUST follow this exact two-step process:

### Step 1: Input Form
- Single page with all input fields
- Step indicator showing "1 Input Details" (active) and "2 View Results" (inactive)
- Sections:
  - **Mortgage Details** header with subtitle
  - **Property & Financing** section with responsive grid layout (md:grid-cols-2)
  - **Premium Affordability Estimator** section with toggle switch and purple gradient background (PREMIUM ONLY)
  - **Closing Costs Analysis** section with toggle switch and blue gradient background (OPTIONAL)
  - **Investment Property Analysis** section with toggle switch and emerald gradient background (OPTIONAL)
  - **Marketing Control** section for premium users with amber gradient background
- **Calculate Results** button at bottom with icon and hover effects
- NO tabs, NO separate calculator components

### Step 2: Results Display
- Completely separate view (MortgageResults component)
- **Edit** button to return to Step 1 (NOT "Back to Input" or "Back")
- Tab-based results with responsive design:
  - **Mortgage Summary** - Featured monthly payment + supporting cards + charts + affordability results banner
  - **Closing Costs** - Detailed provincial/municipal tax breakdown (only shown if enabled in Step 1)
  - **Amortization** - Payment schedule with interactive charts
  - **Investment Analysis** - ROI, cash flow, cap rate (only shown if enabled in Step 1)
  - **Rent vs Buy** - Long-term cost comparison analysis (PREMIUM ONLY, only shown if enabled)

## NEW: Closing Cost Presets System (Premium Feature)

### Comprehensive Preset Coverage
- **All Regions**: Presets must include all possible closing cost fees for all supported regions (Ontario/Toronto, BC/Vancouver)
- **Complete Fee Structure**: Each preset includes all fee types:
  - Land Transfer Tax (provincial)
  - Additional Tax (municipal - Toronto only)
  - Legal Fees
  - Title Insurance
  - Home Inspection
  - Property Appraisal
  - Survey Fee
  - First-Time Buyer Rebate
- **Regional Variations**: Presets can be created for different property types and regions
- **Professional Use**: Designed for real estate professionals to quickly apply standard fee structures

### Preset Application
- **Dropdown Selector**: Premium users see preset dropdown in Closing Costs section
- **Complete Override**: Selecting a preset updates ALL closing cost fields
- **Maintains Calculations**: Auto-calculated fields (land transfer tax, municipal tax, rebates) are overridden but can be manually adjusted
- **Visual Feedback**: Clear indication when preset is applied

### Preset Management (Settings Page)
- **Premium Only**: Preset management only available to premium users
- **CRUD Operations**: Create, read, update, delete presets
- **Categorization**: Optional tags for organizing presets (e.g., "Condo", "Freehold", "Commercial")
- **Validation**: Ensure all required fields are present
- **Export/Import**: Future consideration for sharing presets between team members

## NEW: Calculation Update System

### Update vs Create Logic
- **Existing Calculations**: When editing a saved calculation, updates should modify the existing record
- **New Calculations**: Only create new records when explicitly saving a new calculation
- **State Management**: Track whether calculation is new or existing based on presence of calculationId
- **User Intent**: Clear distinction between "Save" (update existing) and "Save As New" (create copy)

### Update Workflow
1. **Edit Existing**: When user clicks "View" from dashboard, loads calculation in edit mode
2. **Modify Values**: User can change any input values
3. **Save Changes**: "Save" button updates the existing calculation record
4. **Preserve History**: Maintain created_at timestamp, update updated_at timestamp
5. **Notes Preservation**: Existing notes and comments are preserved unless explicitly changed

### Database Operations
- **UPDATE queries**: Use UPDATE instead of INSERT when calculationId exists
- **Optimistic Updates**: Update UI immediately, handle conflicts gracefully
- **Validation**: Ensure user owns the calculation before allowing updates
- **Audit Trail**: Track when calculations are modified

## NEW: Clone Functionality

### Clone Feature Requirements
- **Tier-Based Access**: Clone functionality respects user tier limits
- **Free Users**: Cannot clone (would exceed 1 calculation limit)
- **Basic Users**: Can clone unlimited calculations
- **Premium Users**: Can clone unlimited calculations
- **Visual Indication**: Clone button only shown when user can clone

### Clone Workflow
1. **Clone Button**: Available in dashboard for each saved calculation
2. **Tier Check**: Verify user can save additional calculations
3. **Data Duplication**: Copy all calculation data except ID and timestamps
4. **Name Modification**: Append "Copy" or timestamp to distinguish from original
5. **Immediate Edit**: Redirect to calculator with cloned data for editing
6. **Save Prompt**: User must explicitly save the cloned calculation

### Clone Restrictions
- **Save Limits**: Cloning respects tier-based save limits
- **Free User Message**: Clear explanation why free users cannot clone
- **Upgrade Prompt**: Encourage free users to upgrade for clone functionality
- **Error Handling**: Graceful handling when clone would exceed limits

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

## NEW: CMHC Insurance Requirements

### CMHC Insurance Calculation
- **Automatically calculate CMHC insurance** when down payment is less than 20%
- **Display CMHC information** in the Property & Financing section
- **Include CMHC premium** in the total loan amount for payment calculations
- **Show warning** about CMHC insurance requirement
- **Display premium rate** based on down payment percentage
- **Update mortgage payment** to include CMHC premium in loan amount

### CMHC Insurance Rates
- **Down payment 15-19.99%**: 2.8% of loan amount
- **Down payment 10-14.99%**: 3.1% of loan amount
- **Down payment 5-9.99%**: 4.0% of loan amount
- **Down payment < 5%**: Not allowed (minimum 5% required)

### CMHC UI Requirements
- **Warning box** with amber background when CMHC is required
- **Clear explanation** of why CMHC is required
- **Show premium amount** and percentage
- **Show base loan amount and total loan amount** in a single card with clear labeling
- **Update all calculations** to use the total loan amount including CMHC

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
- **Preset Override**: Presets can override automatic calculations

### Closing Costs Dependencies
- **Property price changes** must trigger recalculation of land transfer tax
- **Location changes** must trigger recalculation of applicable taxes
- **First-time buyer status** must trigger recalculation of rebates
- **Automatic updates**: Changes to dependent fields must happen in real-time
- **Manual overrides**: Non-dependent fields remain editable
- **Preset Application**: Presets override all fields including auto-calculated ones

### Closing Costs UI Requirements
- **Readonly styling**: Gray background for auto-calculated fields
- **Helper text**: Explain which fields are automatically calculated
- **Total calculation**: Show running total of all closing costs
- **Visual feedback**: Clearly indicate which fields are dependent on mortgage details
- **Preset Selector**: Dropdown for premium users to apply presets

## NEW: Premium Affordability Estimator

### Affordability Analysis (Premium Only)
- **Income-Based Calculation**: Calculate maximum affordable home price based on annual income
- **Debt Service Ratios**: Apply Canadian lending guidelines (GDS ≤32%, TDS ≤40%)
- **Real-Time Updates**: Instant calculation as user inputs data
- **Apply to Calculator**: Button to apply affordability results to main mortgage inputs
- **Visual Feedback**: Clear indication of budget compliance

### Affordability Inputs
- **Annual Income**: Gross annual household income
- **Monthly Debts**: Existing monthly debt obligations
- **Down Payment**: Available down payment amount
- **Interest Rate**: Mortgage interest rate for calculations

### Affordability Results
- **Maximum Affordable Price**: Highest home price within budget guidelines
- **Maximum Monthly Payment**: Highest sustainable mortgage payment
- **GDS Ratio**: Gross Debt Service ratio with visual indicators
- **TDS Ratio**: Total Debt Service ratio with visual indicators
- **Budget Compliance**: Clear pass/fail indication with explanations

## NEW: Rent vs Buy Analysis (Premium Only)

### Long-Term Comparison
- **Time Horizon**: Configurable comparison period (1-30 years)
- **Rent Escalation**: Annual rent increase assumptions
- **Total Cost Analysis**: Cumulative costs over time for both scenarios
- **Break-Even Analysis**: Point where buying becomes more cost-effective
- **Interactive Charts**: Visual representation of cost comparison over time

### Rent vs Buy Inputs
- **Monthly Rent**: Current market rent for comparable property
- **Annual Rent Increase**: Expected yearly rent escalation percentage
- **Comparison Period**: Number of years for analysis

### Rent vs Buy Results
- **Total Rent Paid**: Cumulative rent over comparison period
- **Total Ownership Cost**: Down payment plus mortgage payments
- **Net Benefit**: Financial advantage of buying vs renting
- **Year-by-Year Breakdown**: Annual comparison with charts

## NEW: Optional Sections System

### Four Optional Sections
1. **Affordability Estimator** (premium only, disabled by default)
2. **Closing Costs Analysis** (enabled by default with reasonable values)
3. **Investment Property Analysis** (disabled by default)
4. **Rent vs Buy Analysis** (premium only, disabled by default)

### Visual Separation
- Each optional section separated by `border-t border-slate-200 pt-12`
- Clear visual hierarchy with proper spacing
- Gradient backgrounds to distinguish sections
- Toggle switches for enable/disable functionality
- **Improved spacing** between section header elements
- **Responsive layout** for section headers (stacks on mobile)

### Default Values
- **Affordability**: Standard income and debt assumptions
- **Closing Costs**: Reasonable defaults based on location and property price
- **Investment Analysis**: Standard rental market values for the selected city
- **Rent vs Buy**: Market rent assumptions for the area
- **Marketing Control**: Show marketing content by default for premium users

### Section State Persistence
- **Remember section state** between steps (enabled/disabled)
- **Only show tabs** for enabled sections in results
- **Show message** when trying to access disabled section tab
- **Preserve section state** when navigating back to input form

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
- **Premium tier** ($29/month): Can save unlimited calculations plus access to notes, comments, marketing control, affordability estimator, rent vs buy analysis, and closing cost presets

### Save Limit Implementation
- Server-side validation in database trigger function
- Client-side validation in CalculationContext
- Clear error messages for users hitting limits
- Upgrade prompts for free users
- Delete existing calculation option for free users
- Clone restrictions based on tier limits

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
- Prevent clone operations that would exceed limits

## NEW: Premium Notes and Comments System

### Notes Feature (Premium Only)
- **Notes**: Available in each results tab (Mortgage Summary, Closing Costs, Amortization, Investment Analysis, Rent vs Buy)
- **Section-specific**: Each tab has its own notes section
- **Premium Gating**: Non-premium users see upgrade prompts
- **Visual Design**: Neutral slate gradient background (NOT yellow/amber)
- **Functionality**:
  - Add/Edit/Save notes for each section
  - Notes are preserved when calculation is saved
  - Rich text editing with proper formatting
  - **No save requirement**: Premium users can add notes without saving calculation first

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
  - **No save requirement**: Premium users can add comments without saving calculation first

### Notes/Comments Integration
- **Always Visible**: Notes and comments sections appear for all logged-in users
- **Contextual Display**: Show appropriate upgrade prompts for non-premium users
- **Save Integration**: Notes and comments saved with calculation data
- **Dashboard Indicators**: Show badges when calculations have notes/comments
- **Temporary Storage**: Notes and comments can be added before saving calculation
- **Update Preservation**: Notes and comments preserved when updating existing calculations

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
- **Section State Respected**: Only show tabs for sections that were enabled in the original calculation

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
  - ✅ `closing_cost_preset` (not `closing_cost_presets`)
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
- **Affordability Estimator Section**: `bg-gradient-to-r from-purple-50 to-blue-50` with purple border
- **Closing Costs Section**: `bg-gradient-to-r from-blue-50 to-indigo-50` with blue border
- **Investment Analysis Section**: `bg-gradient-to-r from-emerald-50 to-blue-50` with emerald border
- **Marketing Control Section**: `bg-gradient-to-r from-amber-50 to-orange-50` with amber border
- **Visual Separation**: `border-t border-slate-200 pt-12` between sections
- **Toggle Switches**: Custom styled with section-appropriate colors when active
- **Icons**: Appropriate icons in gradient circles for each section
- **Section Headers**: Improved spacing between icon, text, and toggle
- **Responsive Layout**: Stack header elements on mobile, side-by-side on desktop

### Results Page Design

#### Navigation Elements
- **Edit Button**: Simple "Edit" text with ArrowLeft icon (NOT "Back to Input" or "Back")
- **Button Styling**: `text-slate-600 hover:text-slate-900 transition-colors`
- **Position**: Left side of header, aligned with Results title

#### Tab Navigation
- **Container**: `bg-white rounded-xl shadow-sm border border-slate-200 p-4`
- **Grid Layout**: 
  - Dynamic columns based on enabled sections
  - Responsive grid that adapts to number of tabs (2-5 tabs)
- **Active Tab**: `bg-blue-100 text-blue-700`
- **Tab Content**: Icons, full names (hidden on mobile), short names (mobile only), descriptions (desktop only)
- **Only show tabs** for sections that were enabled in Step 1

#### Mortgage Summary Layout
- **Affordability Banner**: Show affordability results at top if available
- **Featured Payment Card**: 
  - `bg-gradient-to-br from-blue-50 to-blue-100`
  - `border-2 border-blue-200 shadow-lg`
  - Large payment amount with blue styling
  - Calculator icon in blue circle
- **Supporting Cards**: 2x2 grid with consistent styling
  - All amounts in `text-slate-900` for consistency
  - Smaller descriptive text in `text-slate-600`
  - Additional context in `text-slate-500`
- **Loan Amount Card**: Combined card showing total loan amount with CMHC premium included
  - Amber background when CMHC is required
  - Clear labeling to indicate CMHC premium is included

#### Chart Requirements
- **Pie Chart**: Total cost breakdown with custom labels showing percentages
- **Bar Chart**: Interest vs Principal comparison (no percentage text)
- **Line Chart**: Remaining balance over time (amortization)
- **Rent vs Buy Chart**: Cumulative cost comparison over time
- **Responsive**: All charts in ResponsiveContainer
- **Colors**: Consistent color scheme (emerald, blue, red, purple)
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
- **Compact Design**: Smaller, more concise sections with less padding
- **Simplified Controls**: Shorter button text ("Add"/"Edit" instead of "Add Notes"/"Edit Notes")

#### Shared Page Readonly Design
- **Readonly Notes**: Muted slate background (`from-slate-50 to-slate-100`) with eye icon
- **Readonly Comments**: Muted blue background (`from-blue-25 to-indigo-25`) with eye icon
- **No Edit Controls**: Remove all buttons and form elements
- **Clear Indicators**: "View Only" text and appropriate icons
- **Professional Appearance**: Maintain visual hierarchy while clearly showing readonly state

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
- `ClosingCostsSection.tsx` - Closing costs analysis container with preset selector
- `ClosingCostsToggle.tsx` - Reusable toggle switch for closing costs
- `ClosingCostsFields.tsx` - Closing costs input fields
- `InvestmentAnalysisSection.tsx` - Investment analysis container
- `InvestmentToggle.tsx` - Reusable toggle switch for investment
- `InvestmentFields.tsx` - Investment-specific fields
- `MarketingControlSection.tsx` - Premium marketing control (premium only)

#### Premium Components (`src/components/premium/`)
- `AffordabilitySection.tsx` - Affordability estimator (premium only)
- `ClosingCostPresets.tsx` - Preset management and selection (premium only)

#### Results Components (`src/components/results/`)
- `MortgageSummaryTab.tsx` - Featured payment + charts + summary + notes + affordability banner
- `ClosingCostsTab.tsx` - Closing costs breakdown + notes (supports custom values)
- `AmortizationTab.tsx` - Amortization schedule with charts + notes
- `InvestmentAnalysisTab.tsx` - Investment metrics + notes
- `RentVsBuyTab.tsx` - Rent vs buy analysis + notes (premium only)
- `ResultsTabNavigation.tsx` - Tab navigation component (supports 2-5 tabs)
- `ResultsActionButtons.tsx` - Save, update, clone, and share buttons

#### Shared Components (`src/components/shared/`)
- `CurrencyInput.tsx` - Reusable currency input with formatting
- `ShareModal.tsx` - Reusable modal for sharing
- `NotesSection.tsx` - Premium notes functionality for each tab (supports readonly mode)
- `CommentsSection.tsx` - Premium comments functionality for calculations (supports readonly mode)
- Other reusable UI components as needed

#### Utilities (`src/utils/`)
- `mortgageCalculations.ts` - Pure calculation functions
- `affordabilityCalculations.ts` - Affordability calculation functions
- `rentVsBuyCalculations.ts` - Rent vs buy calculation functions
- Other utility functions as needed

### Component Design Principles
- **Props Interface**: Each component must have a clear TypeScript interface
- **Error Boundaries**: Components should handle errors gracefully
- **Loading States**: Components should show appropriate loading states
- **Accessibility**: All components must be accessible (ARIA labels, keyboard navigation)
- **Testing**: Each component should be testable in isolation
- **Readonly Support**: Notes and Comments components must support readonly mode for shared pages
- **Chart Integration**: All result components must include interactive charts
- **Tier Awareness**: Components must respect user tier limitations

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
- Creating new calculations when updating existing ones

❌ **NEVER** remove:
- Step indicator with proper styling
- Two-step workflow
- MortgageResults component
- Optional sections (affordability, closing costs, investment analysis, rent vs buy)
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
- Closing cost presets system
- Update vs create logic
- Clone functionality with tier restrictions

❌ **NEVER** change:
- Font colors for consistency (all supporting amounts in slate-900)
- Tab structure with full/short names for responsive design
- Optional sections gradient backgrounds (purple for affordability, blue for closing costs, emerald for investment)
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
- Update logic for existing calculations
- Clone restrictions based on tier

## Required File Structure

```
src/
├── pages/
│   ├── Calculator.tsx - Main component with two-step logic and update/create handling
│   ├── Dashboard.tsx - Includes clone functionality with tier restrictions
│   └── SharedCalculation.tsx - Shared page with full chart functionality
├── components/
│   ├── mortgage/
│   │   ├── MortgageInputForm.tsx
│   │   ├── PropertyFinancingSection.tsx
│   │   ├── ClosingCostsSection.tsx (includes preset selector)
│   │   ├── ClosingCostsToggle.tsx
│   │   ├── ClosingCostsFields.tsx
│   │   ├── InvestmentAnalysisSection.tsx
│   │   ├── InvestmentToggle.tsx
│   │   ├── InvestmentFields.tsx
│   │   └── MarketingControlSection.tsx
│   ├── premium/
│   │   ├── AffordabilitySection.tsx (premium only)
│   │   └── ClosingCostPresets.tsx (premium only)
│   ├── results/
│   │   ├── MortgageSummaryTab.tsx (supports readonly mode + affordability banner)
│   │   ├── ClosingCostsTab.tsx (supports readonly mode and custom values)
│   │   ├── AmortizationTab.tsx (supports readonly mode)
│   │   ├── InvestmentAnalysisTab.tsx (supports readonly mode)
│   │   ├── RentVsBuyTab.tsx (supports readonly mode, premium only)
│   │   ├── ResultsTabNavigation.tsx (supports 2-5 tabs)
│   │   └── ResultsActionButtons.tsx (includes clone functionality)
│   ├── shared/
│   │   ├── CurrencyInput.tsx - Reusable currency input with formatting
│   │   ├── ShareModal.tsx
│   │   ├── NotesSection.tsx (supports readonly mode, neutral styling)
│   │   └── CommentsSection.tsx (supports readonly mode)
│   └── MortgageResults.tsx - Results display with tabs and update logic
├── utils/
│   ├── mortgageCalculations.ts
│   ├── affordabilityCalculations.ts
│   └── rentVsBuyCalculations.ts
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
  enableClosingCosts: boolean;
  showMarketingOnShare: boolean;
  enableAffordabilityEstimator: boolean; // Premium only
  enableRentVsBuy: boolean; // Premium only
  monthlyRent?: number;
  monthlyExpenses?: {
    taxes: number;
    insurance: number;
    condoFees: number;
    maintenance: number;
    other: number;
  };
  closingCosts?: {
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
- Marketing control preference stored in notes as `showMarketingOnShare` boolean
- Section state (enabled/disabled) stored in notes
- Closing cost presets stored in `closing_cost_preset` table
- Update operations preserve created_at, modify updated_at

### Optional Sections Requirements
- **Affordability Estimator**: Purple gradient background, premium only, disabled by default
- **Closing Costs**: Blue gradient background, enabled by default with reasonable values
- **Investment Analysis**: Emerald gradient background, disabled by default
- **Rent vs Buy**: Purple gradient background, premium only, disabled by default
- **Marketing Control**: Amber gradient background, premium users only, enabled by default
- **Visual Separation**: Clear borders and spacing between sections
- **Toggle Switches**: Section-appropriate colors when active
- **Default Values**: Reasonable defaults for all optional fields
- **Section State Persistence**: Remember which sections were enabled/disabled

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
- Section headers: Stack on mobile, side-by-side on desktop
- Tab navigation: Adapts to 2-5 tabs with appropriate grid layouts

### Desktop Enhancements
- Tab descriptions visible on large screens
- Full section names and detailed layouts
- Optimal chart sizing and spacing
- Enhanced hover states and transitions
- Notes/comments: Side-by-side layouts where appropriate
- Marketing content: Enhanced visibility and professional presentation
- Optional sections: Proper grid layouts with visual hierarchy
- Section headers: Horizontal layout with proper spacing
- Clone buttons: Clearly visible with appropriate spacing

## NEW: Shared Calculation Page Requirements

### Shared Calculation Display
- **No step indicator** on shared calculation page
- **Same tab-based results display** as step 2 of the calculator
- **No ability to edit** the calculation or any content
- **NO "Create Your Own" elements** anywhere on the page
- **Proper display** of all calculation details and charts
- **Comments visibility**: Show shareable comments if added by premium user (readonly)
- **Notes privacy**: Private notes are NEVER shown on shared pages
- **Interactive charts**: MUST include all interactive charts with full interactivity
- **Professional services above tabs**: Marketing content positioned prominently (if enabled)
- **Marketing control respected**: Only show marketing if premium user enabled it
- **Section state respected**: Only show tabs for sections that were enabled in the original calculation

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
- **Action buttons**: No save, share, edit, or clone buttons
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
3. **Optional Sections**: Purple gradient for affordability, blue gradient for closing costs, emerald for investment, amber for marketing control
4. **Results Tabs**: Responsive grid with icons and descriptions (2-5 tabs)
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
17. **Section Headers**: Proper spacing between icon, text, and toggle
18. **CMHC Insurance**: Warning box with details when required
19. **Loan Amount Display**: Combined card showing total loan amount with CMHC premium included
20. **Notes/Comments UI**: Compact, concise design with smaller padding and text
21. **Action Buttons**: Appropriately sized buttons (not too wide)
22. **Dashboard Indicators**: Only show notes/comments badges when actual content exists
23. **Affordability Banner**: Clear indication of budget compliance in mortgage summary
24. **Preset Selector**: Dropdown for premium users in closing costs section
25. **Clone Buttons**: Visible for eligible users with tier-appropriate restrictions
26. **Update vs Create**: Clear distinction in UI between updating existing and creating new

## Code Structure Requirements

```typescript
// Calculator.tsx MUST have:
const [currentStep, setCurrentStep] = useState<1 | 2>(1);
const [mortgageData, setMortgageData] = useState<MortgageData>({...});
const [savedCalculationId, setSavedCalculationId] = useState<string>('');
const [currentNotes, setCurrentNotes] = useState<Record<string, string>>({});
const [currentComments, setCurrentComments] = useState<string>('');
const [affordabilityResults, setAffordabilityResults] = useState<AffordabilityResults | null>(null);

// MortgageData interface MUST include:
export interface MortgageData {
  // ... other fields
  enableInvestmentAnalysis: boolean;
  enableClosingCosts: boolean;
  showMarketingOnShare: boolean;
  enableAffordabilityEstimator: boolean; // Premium only
  enableRentVsBuy: boolean; // Premium only
}

// CalculationContext MUST handle:
// - Update vs create logic based on calculationId
// - Clone functionality with tier restrictions
// - Proper error handling for save limits

// Dashboard MUST include:
// - Clone buttons with tier-based visibility
// - Update existing calculation workflow
// - Clear indicators for calculations with notes/comments

// SharedCalculation.tsx MUST have:
// 1. Professional services section ABOVE tab navigation
// 2. Full tab navigation with ResultsTabNavigation component
// 3. All result tab components with readonly=true prop
// 4. Interactive charts in all tabs
// 5. Readonly notes/comments sections
// 6. NO "Create Your Own" elements anywhere
// 7. Marketing control respected (only show if premium user enabled it)
// 8. Only show tabs for sections that were enabled in the original calculation
```

## NEW: Testing Requirements

Any changes MUST pass these tests:
- ✅ Shows step indicator with correct active state styling
- ✅ Input form has all required sections with proper styling
- ✅ Affordability estimator toggle shows/hides fields correctly (premium only)
- ✅ Investment toggle shows/hides fields correctly
- ✅ Closing costs toggle shows/hides fields correctly
- ✅ Rent vs buy toggle shows/hides fields correctly (premium only)
- ✅ Calculate Results button advances to step 2
- ✅ Results page shows tabbed interface with responsive design (2-5 tabs)
- ✅ Featured payment card displays prominently
- ✅ Supporting cards use consistent font colors
- ✅ Charts render without errors
- ✅ Edit button returns to input form and shows "Edit" text only
- ✅ All optional tabs appear when enabled
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
- ✅ **CRITICAL**: CMHC insurance is calculated and displayed when required
- ✅ **CRITICAL**: Section state (enabled/disabled) is preserved between steps
- ✅ **CRITICAL**: Section headers have proper spacing and responsive layout
- ✅ **CRITICAL**: Dashboard only shows notes/comments badges when actual content exists
- ✅ **CRITICAL**: Premium users can add notes/comments without saving calculation first
- ✅ **CRITICAL**: Notes/comments UI is compact and concise
- ✅ **CRITICAL**: Save button has appropriate width (not too wide)
- ✅ **CRITICAL**: Affordability estimator works correctly for premium users
- ✅ **CRITICAL**: Affordability results appear in mortgage summary
- ✅ **CRITICAL**: Rent vs buy analysis works correctly for premium users
- ✅ **CRITICAL**: Closing cost presets apply correctly for premium users
- ✅ **CRITICAL**: Update existing calculations instead of creating new ones
- ✅ **CRITICAL**: Clone functionality respects tier limitations
- ✅ **CRITICAL**: Clone buttons only appear for eligible users
- ✅ **CRITICAL**: Tab navigation adapts to 2-5 tabs correctly

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
- Rent vs buy comparison over time
- Proper data validation to prevent undefined values
- Responsive height and formatting
- **CRITICAL**: Must be interactive on shared pages

### Line Charts
- Remaining balance over time
- Rent vs buy cumulative costs
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
31. **CRITICAL**: Verify CMHC insurance is calculated correctly
32. **CRITICAL**: Test section state persistence between steps
33. **CRITICAL**: Verify section headers have proper spacing
34. **CRITICAL**: Verify dashboard only shows notes/comments badges when actual content exists
35. **CRITICAL**: Verify premium users can add notes/comments without saving calculation first
36. **CRITICAL**: Verify notes/comments UI is compact and concise
37. **CRITICAL**: Verify save button has appropriate width
38. **CRITICAL**: Test affordability estimator for premium users
39. **CRITICAL**: Verify affordability results display in mortgage summary
40. **CRITICAL**: Test rent vs buy analysis for premium users
41. **CRITICAL**: Verify closing cost presets work correctly
42. **CRITICAL**: Test update vs create logic for calculations
43. **CRITICAL**: Verify clone functionality respects tier limits
44. **CRITICAL**: Test clone button visibility and restrictions

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
- Section state (enabled/disabled) saved with calculation data
- **Update vs Create Logic**: Existing calculations are updated, not duplicated
- **Clone Functionality**: Creates new calculation with copied data

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
- Section state (enabled/disabled) preserved and respected
- **Closing cost presets** stored and retrieved correctly
- **Update operations** preserve created_at, modify updated_at
- **Clone operations** create new records with copied data

**REMEMBER: The user has specifically requested this two-step process with the exact visual design shown. The featured payment card layout, responsive tabs, consistent styling, modular component architecture, singular database table naming, tier-based save limits, premium notes and comments functionality, navigation behavior, readonly shared page behavior, interactive charts on shared pages, professional services positioning above tabs, neutral notes styling, optional sections with proper visual separation, closing cost presets system, update vs create logic, and clone functionality with tier restrictions are critical requirements that must not be changed.**

## Change Log

### Recent Updates:
1. **Closing Cost Presets System**: Added comprehensive preset management for premium users with all possible closing cost fees
2. **Update vs Create Logic**: Implemented proper update functionality for existing calculations instead of always creating new ones
3. **Clone Functionality**: Added clone feature with tier-based restrictions and proper save limit enforcement
4. **Preset Application**: Closing cost presets can override all fields including auto-calculated ones
5. **Database Column Mapping**: Fixed column name mapping between database (lowercase) and UI (camelCase)
6. **Comprehensive Fee Coverage**: Presets include all closing cost types for all supported regions
7. **Settings Integration**: Added preset management tab for premium users
8. **Tier-Based Clone Restrictions**: Clone buttons only appear for users who can save additional calculations
9. **Update Preservation**: Notes, comments, and timestamps properly preserved during updates
10. **Professional Workflow**: Enhanced workflow for real estate professionals with preset and clone capabilities

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
- Added premium features without breaking existing functionality
- Maintained navigation consistency while improving user experience
- Enforced readonly behavior on shared pages
- Removed "Create Your Own" elements from shared pages without affecting main application
- **CRITICAL**: Ensured all charts remain interactive on shared pages
- **CRITICAL**: Enhanced marketing content positioning for better visibility
- **CRITICAL**: Changed notes styling to neutral slate instead of yellow/amber
- **CRITICAL**: Added proper visual separation between optional sections
- **CRITICAL**: Implemented real-time currency formatting for all money fields
- **CRITICAL**: Made closing costs dynamically update based on property details
- **CRITICAL**: Added CMHC insurance calculation and display
- **CRITICAL**: Ensured section state persistence between steps
- **CRITICAL**: Improved section header spacing and responsive layout
- **CRITICAL**: Fixed dashboard to only show notes/comments badges when actual content exists
- **CRITICAL**: Allowed premium users to add notes/comments without saving calculation first
- **CRITICAL**: Made notes and comments sections more concise
- **CRITICAL**: Fixed save button width to be more appropriate
- **CRITICAL**: Added comprehensive closing cost presets system
- **CRITICAL**: Implemented update vs create logic for calculations
- **CRITICAL**: Added clone functionality with proper tier restrictions