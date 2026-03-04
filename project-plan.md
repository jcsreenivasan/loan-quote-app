# Mortgage Loan Quote Tool — Full Product Specification

## Context
A designer is reverse-engineering an existing mortgage loan quote tool from 19 UI screenshots.
The goal is a **browser-only V1** (no backend, no database) that a loan officer can use to
generate quotes and preview a fee sheet / loan quote PDF.

---

## 1. Field Inventory

### 1.1 Header / Profile Bar
| Field | Type | Notes |
|---|---|---|
| Borrower Name | Display text | e.g. "Jeyakrishnan Maliyandi" |
| Loan Officer Name | Display text | e.g. "Chris Wasimiski" |
| Email | Display text | |
| Phone | Display text | |

### 1.2 Property / Loan Details
| Field | Type | Notes |
|---|---|---|
| Street | Text input | Property address |
| City | Text input | |
| Zip Code | Text input | |
| State | Dropdown | US states |
| Purpose | Dropdown | **Purchase** / Refinance |
| Purchase Price | Currency input | Visible only when Purpose = Purchase |
| Estimated Property Value | Currency input | Visible only when Purpose = Refinance |
| Refinance Type | Dropdown | Visible only when Purpose = Refinance |
| Is Closing Cost Financed? | Toggle (Yes/No) | Visible only when Purpose = Refinance |
| Loan Term | Dropdown | 10yr / 15yr / 20yr / 25yr / 30yr |
| Product | Dropdown | Fixed Rate / ARM variants |
| Loan Type | Dropdown | Conventional / FHA / VA / USDA / Other |
| Description | Text input | Visible only when Loan Type = Other |

### 1.3 VA-Specific Fields (conditional on Loan Type = VA)
| Field | Type | Notes |
|---|---|---|
| VA Type | Dropdown | First Time Use / Subsequent Use / Exempt |
| Rate Lock | Dropdown | Yes / No |
| Rate Lock Unit | Date input | Visible when Rate Lock = Yes |

### 1.4 Loan Terms / Amounts
| Field | Type | Notes |
|---|---|---|
| Down Payment | Currency input | Manual entry |
| Interest Rate | Percent input | Manual entry |
| Base Loan Amount | Currency (calculated) | Purchase Price − Down Payment |
| Funding Fee | Currency (calculated) | Auto per loan type (see Calc Module §3.2) |

### 1.5 Projected Monthly Payments
| Field | Type | Notes |
|---|---|---|
| Principal & Interest | Currency (calculated) | Standard amortization formula |
| Mortgage Insurance | Currency input or calculated | PMI / MIP depending on loan type |
| Estimated Escrow | Currency (calculated) | Sum of escrowed items ÷ 12 |
| **Total Monthly Payment** | Currency (calculated) | Sum of above three |

### 1.6 Estimated Taxes, Insurance & Assessments
Each line has: **checkbox** (include?), **amount** (annual $), **In Escrow? toggle** (Yes/No).

| Item | Default Included | Notes |
|---|---|---|
| Property Taxes | Yes | Annual amount, monthly = ÷12 |
| Homeowner's Insurance | Yes | Annual amount |
| Flood Insurance | Optional | |
| HOA | Optional | |
| Other | Optional | Free-label + amount |

### 1.7 Closing Cost Details — Loan Costs

#### Origination Charges
- Configurable line items (dropdown label + dollar value)
- Default item: **Underwriting Fee** — $1,050.00
- "+ Add Configuration" opens modal:
  - Name (text), Type (dropdown), Value (currency)
- Line items can be deleted

#### Other Credits
| Field | Type |
|---|---|
| Seller Credit | Currency input |
| Lender Credit | Currency input |
| Funds For Borrower | Currency input |

#### Services You Cannot Shop For
Pre-populated defaults (editable amounts):
| Item | Default |
|---|---|
| Mortgage Insurance Premium | $0.00 |
| Appraisal Fee | $630.00 |
| Flood Certification Fee | $8.00 |
| Flood Monitoring Fee | $5.00 |
| Tax Monitoring Fee | $48.00 |

#### Services You Can Shop For
Configurable line items (same Add Configuration pattern):
| Item | Default |
|---|---|
| Pest Inspection Fee | Optional |
| Survey Fee | Optional |
| Title – Insurance Binder | Optional (example: $910.00 total) |

### 1.8 Prepaid Items & Initial Escrow
| Item | Type | Notes |
|---|---|---|
| Homeowner's Insurance Premium | Currency | Prepaid at closing |
| Mortgage Insurance Premium | Currency | Prepaid at closing |
| Prepaid Interest | Currency | Calculated or manual |
| Initial Escrow Payment | Currency | Typically 2–3 months of escrowed items |

---

## 2. Conditional Logic Map

```
Purpose
├── Purchase
│   └── Show: Purchase Price
│   └── Hide: Estimated Property Value, Refinance Type, Is Closing Cost Financed?
│
└── Refinance
    └── Show: Estimated Property Value
    └── Show: Refinance Type (dropdown)
    └── Show: Is Closing Cost Financed? (toggle)

Loan Type
├── Conventional
│   └── Funding Fee = $0 (not shown or shown as 0)
│   └── Show: PMI if LTV > 80%
│
├── FHA
│   └── Funding Fee label = "Funding Fee (1.75% of Loan Amount)"
│   └── Funding Fee = Base Loan Amount × 1.75%
│   └── Show: Annual MIP field
│
├── VA
│   └── Show: VA Type dropdown (First Time Use / Subsequent Use / Exempt)
│   └── Show: Rate Lock dropdown
│   └── Funding Fee varies by VA Type:
│       ├── First Time Use → 2.15% (no down), 1.5% (5%+ down), 1.25% (10%+ down)
│       ├── Subsequent Use → 3.3% (no down), 1.5% (5%+ down), 1.25% (10%+ down)
│       └── Exempt → 0%
│   └── Rate Lock = Yes → Show: Rate Lock Unit (date)
│
├── USDA
│   └── Funding Fee label = "Funding Fee (1% of Loan Amount)"
│   └── Funding Fee = Base Loan Amount × 1%
│   └── Annual USDA Fee = Base Loan Amount × 0.35%
│
└── Other
    └── Show: Description (text input)

Each Taxes/Insurance line:
└── In Escrow? = Yes → Add to Estimated Escrow calculation
```

---

## 3. Calculation Modules

### 3.1 Base Loan Amount
```
Base Loan Amount = Purchase Price − Down Payment
(or Estimated Property Value − Down Payment for Refinance)
```

### 3.2 Funding Fee
| Loan Type | Rate | Condition |
|---|---|---|
| FHA | 1.75% | Always |
| USDA | 1.00% | Always |
| VA – First Time Use | 2.15% / 1.5% / 1.25% | By down payment % |
| VA – Subsequent Use | 3.30% / 1.5% / 1.25% | By down payment % |
| VA – Exempt | 0% | |
| Conventional | 0% | |
| Other | 0% | |

```
Funding Fee Amount = Base Loan Amount × Funding Fee Rate
Total Loan Amount = Base Loan Amount + Funding Fee Amount
```

### 3.3 Monthly Principal & Interest
Standard amortization:
```
r = Annual Interest Rate / 12
n = Loan Term in months
P&I = Total Loan Amount × [r(1+r)^n] / [(1+r)^n − 1]
```

### 3.4 Mortgage Insurance (MI)
- **Conventional**: PMI ≈ 0.5–1.5% annually if LTV > 80%; drops off at 80% LTV (display only, user inputs rate)
- **FHA**: Annual MIP ≈ 0.55% of loan amount (varies; display as editable field)
- **VA / USDA**: No monthly MI

```
Monthly MI = (Total Loan Amount × Annual MI Rate) / 12
```

### 3.5 Estimated Escrow
```
Estimated Escrow = Sum of all annual escrow items ÷ 12
(Only items where "In Escrow?" = Yes are included)
```

### 3.6 Total Monthly Payment
```
Total Monthly Payment = P&I + Monthly MI + Estimated Escrow
```

### 3.7 APR (approximate)
```
APR ≈ effective rate including financing costs spread over loan term
= function of (Interest Rate, Funding Fee, Origination Charges, other financed costs)
Note: True APR requires Regulation Z calculation — flag as a risk (see §6)
```

### 3.8 Closing Cost Totals
```
Section A (Origination Charges) = Sum of line items
Section B (Services Cannot Shop) = Sum of defaults + custom items
Section C (Services Can Shop) = Sum of configured items
Other Credits = Seller Credit + Lender Credit + Funds for Borrower
Total Loan Costs = A + B + C − Other Credits
Prepaids = Homeowner's Insurance + MI Premium + Prepaid Interest + Initial Escrow
Total Closing Costs = Total Loan Costs + Prepaids
```

---

## 4. UI Component List

### Layout Components
- `AppShell` — sidebar + header + main content area
- `Sidebar` — Dashboard, Loan Details, Forms, My Team, Settings, Support nav items
- `TopNav` — borrower profile, loan officer info, tab switcher
- `TabBar` — Loan Quote / Pre Approvals / Contacts

### Form Components
- `SectionCard` — collapsible/labeled card wrapping each group
- `FieldRow` — two- or three-column row for paired fields
- `CurrencyInput` — formatted with $ and 2 decimal places
- `PercentInput` — formatted with % symbol
- `SelectDropdown` — styled dropdown with "Select" placeholder
- `ToggleSwitch` — Yes / No binary toggle (used for In Escrow?, Is Closing Cost Financed?)
- `CheckboxRow` — checkbox + label + amount + toggle (Taxes & Insurance section)
- `DateInput` — for Rate Lock Unit
- `TextInput` — generic

### Closing Costs Components
- `LineItemRow` — label (dropdown or static) + currency value + delete button
- `AddConfigModal` — modal dialog with Name / Type / Value inputs + Save button
- `SectionSubtotal` — calculated subtotal display per sub-section

### Action Components
- `UpdateQuoteButton` — triggers recalculation of all computed fields
- `CompleteButton` — marks quote as finalized (V1: triggers PDF preview)
- `PreviewFeeSheetButton` — opens printable fee sheet view
- `PreviewLoanQuoteButton` — opens printable loan quote view

### Output Components
- `LoanQuotePrintView` — clean layout of all fields for browser print / PDF
- `FeeSheetPrintView` — closing cost breakdown in disclosure format

---

## 5. Data Model

```typescript
// Top-level quote object (stored in browser localStorage or React state)

interface LoanQuote {
  id: string                        // uuid, generated client-side
  createdAt: string                 // ISO date
  updatedAt: string

  // Borrower & Officer
  borrowerName: string
  loanOfficerName: string
  email: string
  phone: string

  // Property
  street: string
  city: string
  zip: string
  state: string

  // Loan Parameters
  purpose: 'purchase' | 'refinance'
  refinanceType?: string
  isClosingCostFinanced?: boolean
  purchasePrice?: number
  estimatedPropertyValue?: number
  loanTerm: 10 | 15 | 20 | 25 | 30   // years
  product: string                   // 'Fixed Rate' | 'ARM 5/1' | etc.
  loanType: 'conventional' | 'fha' | 'va' | 'usda' | 'other'
  loanTypeDescription?: string      // when loanType = 'other'

  // VA-specific
  vaType?: 'first_time' | 'subsequent' | 'exempt'
  rateLock?: boolean
  rateLockDate?: string

  // Loan Amounts & Rate
  downPayment: number
  interestRate: number              // decimal, e.g. 0.065 for 6.5%

  // Computed (recalculated on "Update Quote")
  baseLoanAmount: number
  fundingFeeRate: number
  fundingFeeAmount: number
  totalLoanAmount: number
  monthlyPI: number
  monthlyMI: number
  estimatedEscrow: number
  totalMonthlyPayment: number

  // Taxes, Insurance, Assessments
  taxInsuranceItems: TaxInsuranceItem[]

  // Closing Costs
  originationCharges: LineItem[]
  otherCredits: OtherCredits
  servicesCannotShop: LineItem[]
  servicesCanShop: LineItem[]
  prepaids: Prepaids
}

interface TaxInsuranceItem {
  label: string                     // 'Property Taxes' | 'Homeowner\'s Insurance' | etc.
  included: boolean
  annualAmount: number
  inEscrow: boolean
}

interface LineItem {
  id: string
  label: string
  type?: string                     // for configurable items
  amount: number
  isDefault: boolean
}

interface OtherCredits {
  sellerCredit: number
  lenderCredit: number
  fundsForBorrower: number
}

interface Prepaids {
  homeownersInsurancePremium: number
  mortgageInsurancePremium: number
  prepaidInterest: number
  initialEscrowPayment: number
}
```

---

## 6. Risks & Unknown Logic Areas

| # | Area | Risk | Mitigation |
|---|---|---|---|
| 1 | **APR calculation** | True Reg Z APR is complex (must include specific fees, exclude others per TILA). Getting this wrong creates legal/compliance risk. | V1: Display interest rate only, label APR as "estimated" or omit |
| 2 | **VA Funding Fee tiers** | Down payment percentage thresholds (0%, 5%, 10%) determine the exact rate. Screenshots don't show down payment % breakpoints. | Implement standard VA fee table; confirm with a loan officer |
| 3 | **FHA Annual MIP** | Rate varies by LTV, loan term, and loan amount (multiple bands). Not a single flat rate. | V1: Make MI rate an editable input; add tooltip explaining it varies |
| 4 | **Conventional PMI** | PMI rate varies by lender, credit score, LTV. Cannot auto-calculate without credit pull. | V1: Manual input field only |
| 5 | **"Product" dropdown options** | Screenshots show "Fixed Rate" but ARM variants (5/1, 7/1, 10/1) are implied. ARM P&I calculation differs. | V1: Fixed rate only; ARM as future feature |
| 6 | **Refinance Type options** | The values inside the Refinance Type dropdown are not visible in screenshots. | Placeholder with: Rate & Term / Cash-Out / Streamline |
| 7 | **Prepaid Interest** | Requires closing date to calculate per-diem interest days. Not shown in screenshots. | V1: Manual input or skip |
| 8 | **"Complete" button behavior** | What does "Complete" do vs "Update Quote"? Could mean finalize, lock, or export. | V1: Treat as "generate PDF preview" |
| 9 | **Multi-quote / list view** | "Back to list" button implies a quote list screen. Scope unclear for V1. | V1: Single quote only; list view is V2 |
| 10 | **Pre Approvals / Contacts tabs** | These tabs exist but their content is not shown in any screenshot. | V1: Stub tabs (empty state with "Coming Soon") |

---

## 7. LOCKED V1 Scope — Frozen ✦

> **Scope freeze date: 2026-02-18**
> This section supersedes all earlier scope references in this document.
> Nothing may be added to V1 without a written scope change. Anything not listed here is deferred to V2.

---

### 7.1 What V1 Is

A **single-page, browser-only loan quoting tool** for a mortgage loan officer.
No login. No database. No server. Runs entirely in the browser.
One active quote at a time, persisted in `localStorage`.
Produces a **3-page printable Loan Quote PDF** matching the reference document exactly.

---

### 7.2 Locked Feature List

#### FORM — Inputs & Sections
| # | Feature | Notes |
|---|---|---|
| F-01 | Property address fields | Street, City, Zip, State |
| F-02 | Purpose selector | Purchase / Refinance |
| F-03 | Purchase Price field | Visible when Purpose = Purchase |
| F-04 | Estimated Property Value field | Visible when Purpose = Refinance |
| F-05 | Refinance Type dropdown | Visible when Purpose = Refinance |
| F-06 | Is Closing Cost Financed? toggle | Visible when Purpose = Refinance |
| F-07 | Loan Term dropdown | 10 / 15 / 20 / 25 / 30 years |
| F-08 | Product dropdown | Fixed Rate only (ARM deferred to V2) |
| F-09 | Loan Type dropdown | Conventional / FHA / VA / USDA / Other |
| F-10 | Loan Type Description field | Visible when Loan Type = Other |
| F-11 | VA Type dropdown | Visible when Loan Type = VA |
| F-12 | Rate Lock toggle | Visible when Loan Type = VA |
| F-13 | Rate Lock Date field | Visible when Rate Lock = Yes |
| F-14 | Down Payment input | Currency, manual entry |
| F-15 | Interest Rate input | Percent, manual entry |
| F-16 | Taxes & Insurance checklist | Property Taxes, Homeowner's Insurance, Flood Insurance, HOA, Other (single row) |
| F-17 | In Escrow? toggle per tax/insurance item | Yes / No per row |
| F-18 | Origination Charges list | Editable line items, default: Underwriting Fee |
| F-19 | Add Configuration modal | Name, Type, Value — for Origination Charges and Services You Can Shop For |
| F-20 | Delete line item button | On all configurable rows |
| F-21 | Other Credits inputs | Seller Credit, Lender Credit, Funds for Borrower |
| F-22 | Services You Cannot Shop For list | Pre-populated defaults, amounts editable |
| F-23 | Services You Can Shop For list | Configurable, same Add Config modal |
| F-24 | Recording Fee field | Section E, single editable amount |
| F-25 | Prepaids inputs | Homeowner's Insurance Premium, MI Premium, Prepaid Interest, Property Taxes prepaid |
| F-26 | Initial Escrow inputs | Per-item monthly amount × months for HO Insurance, MI, Flood, Property Taxes |
| F-27 | Borrower name field | Header display |
| F-28 | Loan Officer info fields | Name, NMLS, Email, Phone — pre-filled from brand config, editable per quote |

#### FORM — Calculated / Read-Only Outputs
| # | Feature | Notes |
|---|---|---|
| C-01 | Base Loan Amount | Auto-calculated |
| C-02 | Funding Fee amount | Auto-calculated by loan type and VA type |
| C-03 | Total Loan Amount | Base + Funding Fee |
| C-04 | Monthly Principal & Interest | Standard amortization |
| C-05 | Monthly Mortgage Insurance | Manual input rate × loan amount / 12 |
| C-06 | Estimated Escrow | Sum of escrowed annual items ÷ 12 |
| C-07 | Estimated Total Monthly Payment | P&I + MI + Escrow |
| C-08 | Section subtotals A, B, C, D, E, F, G, I, J | Auto-summed |
| C-09 | Total Closing Costs | D + I − Lender Credits |
| C-10 | Cash to Close | Calculated from purpose, down payment, payoffs |
| C-11 | In 5 Years total paid | 60 × (P&I + MI) + Section D |
| C-12 | Principal paid off in 5 years | From amortization schedule |
| C-13 | Total Interest Percentage (TIP) | Total interest / loan amount × 100 |

#### FORM — Behavior
| # | Feature | Notes |
|---|---|---|
| B-01 | Conditional field visibility | All rules from §2 implemented |
| B-02 | Update Quote button | Explicit recalculation trigger; all C-01–C-13 refresh |
| B-03 | Inline field validation | On blur + on Update Quote click; errors in red below field |
| B-04 | Soft warnings | High rate, high LTV, conforming limit breach |
| B-05 | localStorage persistence | Auto-saved on every Update Quote click |
| B-06 | Page-load restore | Quote state restored from localStorage on app open |
| B-07 | Complete button | Triggers save + navigates to Preview Loan Quote |

#### PDF OUTPUT — 3-Page Loan Quote
| # | Feature | Notes |
|---|---|---|
| P-01 | Page 1: Header block | Date, Applicant, Property, Est. Value, Term, Purpose, Product, Loan Type checkboxes, Loan ID, Rate Lock |
| P-02 | Page 1: Loan Terms table | Loan Amount, Interest Rate, Monthly P&I, Prepayment Penalty (NO), Balloon Payment (NO), "Can increase?" column |
| P-03 | Page 1: Projected Payments table | P&I, MI, Estimated Escrow, Total Monthly Payment, Taxes & Insurance checklist with In Escrow? YES/NO |
| P-04 | Page 1: Costs at Closing | Estimated Closing Costs with breakdown text, Estimated Cash to Close |
| P-05 | Page 1: Footer | LOAN QUOTE · PAGE 1 OF 3 · LOAN ID # [id] |
| P-06 | Page 2: Closing Cost Details | Two-column layout, Sections A–D (Loan Costs) and E–J (Other Costs) |
| P-07 | Page 2: Calculating Cash to Close box | Total Closing Costs, Payoffs, Total Loan Amount, Cash to Close, Costs Financed |
| P-08 | Page 2: Footer | LOAN QUOTE · PAGE 2 OF 3 · LOAN ID # [id] |
| P-09 | Page 3: Lender / Broker info block | Two-column, broker details from brand config |
| P-10 | Page 3: Comparisons section | In 5 Years, TIP |
| P-11 | Page 3: Other Considerations | Appraisal, Assumption, Homeowner's Insurance, Late Payment, Refinance, Servicing — static boilerplate text |
| P-12 | Page 3: Confirm Receipt | Disclosure text, Applicant + Co-Applicant signature/date lines |
| P-13 | Page 3: Footer | LOAN QUOTE · PAGE 3 OF 3 · LOAN ID # [id] |
| P-14 | Print trigger | `window.print()` from preview page; browser handles PDF save |
| P-15 | Print CSS | White background, correct page breaks, two-column grid on page 2, 9pt font |

#### TECH & INFRASTRUCTURE
| # | Feature | Notes |
|---|---|---|
| T-01 | Next.js 14 App Router | Framework |
| T-02 | Tailwind CSS dark theme | Matches screenshots |
| T-03 | TypeScript strict mode | All files |
| T-04 | `lib/rules.ts` config | All fee tables, defaults, behavior flags |
| T-05 | `lib/calculations.ts` | Pure functions only, no UI deps |
| T-06 | `lib/ruleEngine.ts` | Interprets config, drives visibility and validation |
| T-07 | `lib/brand.ts` | Broker name, NMLS, officer info, colors, logo path |
| T-08 | localStorage state only | No backend, no database, no auth |
| T-09 | Single quote at a time | No list view, no multi-quote management |

---

### 7.3 Explicitly Deferred to V2

The following were considered and **deliberately cut** from V1. They must not be built or partially implemented.

| Deferred Feature | Reason |
|---|---|
| ARM product calculations | Requires separate amortization logic; untested in reference PDF |
| True Regulation Z APR | Legal compliance risk; requires specialist review |
| Multi-quote list / "Back to list" view | Requires data layer; out of scope for browser-only |
| Pre Approvals tab | Content unknown; no screenshots available |
| Contacts tab | Content unknown; no screenshots available |
| User login / authentication | No backend in V1 |
| Database / cloud storage | No backend in V1 |
| Email delivery of quotes | Requires backend |
| Native PDF export (non-print) | Adds heavy dependency (Puppeteer, jsPDF); browser print is sufficient |
| Mobile / responsive layout | Desktop-only tool for loan officers at a workstation |
| Closing Date field | Deferred pending BL-17 answer; prepaid interest entered manually for now |
| Multiple "Other" rows in Taxes & Insurance | Single row only in V1 |
| Co-applicant name field on form | Signature line appears on PDF but name is not collected |
| Section H (Other Costs) configurable items | Shown as $0.00 static in V1 |
| Points as a percentage input | Entered as flat dollar amount only in V1 |

---

### 7.4 Tech Stack (Locked)

| Layer | Choice | Locked? |
|---|---|---|
| Framework | Next.js 14 (App Router) | Yes |
| Language | TypeScript (strict) | Yes |
| Styling | Tailwind CSS | Yes |
| State management | React `useState` + `localStorage` | Yes |
| PDF / print | Browser `window.print()` + `@media print` CSS | Yes |
| Unique IDs | `uuid` npm package (v4, short-sliced to 8 chars) | Yes |
| No backend | No API routes, no database, no auth | Yes |

---

### 7.5 Build Order (Locked)

Phases must be completed in order. Do not begin a phase until the previous phase is verified working.

```
Phase 1 — Foundation
  ├── lib/types.ts          Data model interfaces
  ├── lib/rules.ts          All config, fee tables, defaults
  ├── lib/calculations.ts   Pure calculation functions
  └── lib/ruleEngine.ts     Visibility, label, and validation logic

Phase 2 — Layout Shell
  ├── app/layout.tsx        Root layout, dark background
  ├── AppShell              Sidebar + main area
  ├── Sidebar               Nav links (non-functional stubs OK for now)
  └── TopNav                Borrower name, officer info, tab bar, action buttons

Phase 3 — Primitive UI Components
  ├── CurrencyInput
  ├── PercentInput
  ├── TextInput
  ├── SelectDropdown
  ├── ToggleSwitch
  ├── CheckboxRow
  └── DateInput

Phase 4 — Form Sections (top to bottom)
  ├── PropertyDetails
  ├── LoanParameters        (with all conditional sub-fields)
  ├── LoanAmounts           (read-only calculated outputs)
  ├── ProjectedPayments     (read-only calculated outputs)
  ├── TaxInsuranceSection
  └── ClosingCostSections   (Origination, Credits, Cannot Shop, Can Shop, Prepaids, Recording)

Phase 5 — Interactivity
  ├── AddConfigModal
  ├── Update Quote → triggers full recalc
  ├── Inline validation + warnings
  └── localStorage save/restore

Phase 6 — PDF Preview
  ├── app/preview/loan-quote/Page1.tsx
  ├── app/preview/loan-quote/Page2.tsx
  ├── app/preview/loan-quote/Page3.tsx
  ├── print.css
  └── End-to-end test: fill form → Update Quote → Preview → Print

Phase 7 — Branding & Polish
  ├── lib/brand.ts          Populate with real broker details
  ├── public/logo.png       If supplied
  └── Final dark theme pass matching screenshots pixel-by-pixel
```

---

## 8. User Flow Steps

### Primary Flow: Creating a New Quote

```
Step 1 — Start
  └── Loan officer opens the app
  └── A blank quote is initialized with default closing cost line items
  └── A new UUID is assigned; timestamp recorded

Step 2 — Borrower & Officer Info
  └── Enter borrower name (required to proceed)
  └── Loan officer name, email, phone pre-filled from profile (editable)

Step 3 — Property Details
  └── Enter Street, City, Zip, State
  └── Select Purpose: Purchase or Refinance
      ├── Purchase → enter Purchase Price
      └── Refinance → enter Estimated Property Value
                   → select Refinance Type
                   → toggle Is Closing Cost Financed?

Step 4 — Loan Parameters
  └── Select Loan Term (e.g. 30 years)
  └── Select Product (e.g. Fixed Rate)
  └── Select Loan Type → triggers conditional fields:
      ├── FHA → no extra fields; funding fee auto-calculated
      ├── VA  → select VA Type; toggle Rate Lock; enter Rate Lock date if Yes
      ├── USDA → no extra fields; funding fee auto-calculated
      ├── Conventional → no extra fields
      └── Other → enter Description

Step 5 — Financial Inputs
  └── Enter Down Payment
  └── Enter Interest Rate
  └── System displays (read-only):
      ├── Base Loan Amount
      └── Funding Fee (auto-calculated)

Step 6 — Taxes, Insurance & Assessments
  └── Check/uncheck each item (Property Taxes, Homeowner's Insurance, etc.)
  └── Enter annual dollar amount for each included item
  └── Toggle In Escrow? for each item
  └── Add custom "Other" items as needed

Step 7 — Closing Costs
  └── Review pre-populated defaults in each sub-section
  └── Edit default amounts (e.g. Appraisal Fee)
  └── Add custom line items via "+ Add Configuration" modal
  └── Enter Other Credits (Seller, Lender, Funds for Borrower)
  └── Enter Prepaid items

Step 8 — Update Quote
  └── Click "Update Quote"
  └── All calculated fields refresh:
      ├── Base Loan Amount
      ├── Funding Fee
      ├── Total Loan Amount
      ├── Monthly P&I
      ├── Monthly MI
      ├── Estimated Escrow
      ├── Total Monthly Payment
      └── All closing cost subtotals and totals
  └── Quote auto-saved to localStorage

Step 9 — Preview & Output
  └── Click "Preview Loan Quote" → opens print-ready loan summary page
  └── Click "Preview Fee Sheet" → opens print-ready closing cost disclosure
  └── User prints via browser (Ctrl/Cmd+P) or saves as PDF

Step 10 — Complete
  └── Click "Complete" to mark quote as finalized
  └── V1: locks fields and triggers Preview Loan Quote view
```

### Secondary Flows

**Returning to a saved quote:**
```
App loads → detects existing quote in localStorage → restores all fields → ready to edit
```

**Resetting / starting over:**
```
User clicks "New Quote" (or clears localStorage) → blank form re-initializes with defaults
```

---

## 9. Field Validation Rules

Validation fires on "Update Quote" click and on field blur (leaving a field).
Errors display inline below the field in red.

### 9.1 Required Fields
| Field | Rule |
|---|---|
| Borrower Name | Non-empty string |
| Purpose | Must be selected (not "Select") |
| Loan Type | Must be selected |
| Loan Term | Must be selected |
| Purchase Price / Est. Property Value | Required; depends on Purpose |
| Down Payment | Required (can be $0 for VA/USDA) |
| Interest Rate | Required; > 0 |
| VA Type | Required when Loan Type = VA |
| Rate Lock Date | Required when Rate Lock = Yes |
| Refinance Type | Required when Purpose = Refinance |

### 9.2 Numeric Range Rules
| Field | Min | Max | Notes |
|---|---|---|---|
| Purchase Price | $1 | $50,000,000 | Must be positive |
| Estimated Property Value | $1 | $50,000,000 | |
| Down Payment | $0 | < Purchase Price | Cannot exceed purchase price |
| Interest Rate | 0.001% | 25% | Stored as decimal; display as % |
| Loan Term | 10 | 30 | Must be one of [10, 15, 20, 25, 30] |
| All currency fee fields | $0 | $999,999 | Cannot be negative |
| Annual Tax/Insurance amounts | $0 | $999,999 | |

### 9.3 Format Rules
| Field | Rule |
|---|---|
| Zip Code | 5 digits, or 5+4 format (e.g. 90210 or 90210-1234) |
| State | Valid US state abbreviation (2 letters) |
| Rate Lock Date | Valid calendar date; must be today or future |
| Email | Standard email format (if editable) |
| Phone | 10 digits; displayed as (xxx) xxx-xxxx |

### 9.4 Cross-Field Rules
| Rule | Condition |
|---|---|
| Down Payment < Purchase Price | Always |
| LTV = (Base Loan Amount / Purchase Price) × 100 | Display only; warn if LTV > 97% |
| If Loan Type = VA and VA Type = Exempt | Force Funding Fee = $0, disable field |
| If Loan Type = Conventional and LTV ≤ 80% | Hide / zero out MI field |
| If Is Closing Cost Financed = Yes | Add closing costs to Total Loan Amount in calculations |

### 9.5 Soft Warnings (non-blocking)
| Condition | Warning Message |
|---|---|
| Interest Rate > 12% | "Rate seems high — please confirm" |
| Down Payment = $0 and Loan Type = Conventional | "Conventional loans typically require a down payment" |
| LTV > 97% | "LTV exceeds 97% — verify loan program eligibility" |
| Purchase Price > $1,089,300 (conforming limit) | "Loan may be jumbo — confirm program availability" |

---

## 10. APR Calculation Assumptions

### 10.1 Why True APR Is Deferred
Regulation Z (TILA) APR requires including only specific finance charges as defined by the Fed. Using the wrong fees inflates or deflates the APR, creating compliance risk. V1 displays **Interest Rate** prominently and shows **Estimated APR** as a clearly labeled approximation.

### 10.2 Estimated APR Formula
The estimated APR uses the **actuarial method**: find the monthly rate `r` such that the present value of all monthly payments equals the loan amount net of financed fees.

```
Net Loan Proceeds = Total Loan Amount − Financed Fees Included in APR

Solve for r in:
Net Loan Proceeds = Payment × [1 − (1 + r)^−n] / r

Estimated APR = r × 12
```

### 10.3 Fees Included in APR (V1 Assumption)
Per standard TILA guidance, these are treated as finance charges:

| Fee | Include in APR? | Notes |
|---|---|---|
| Origination Charges (Section A) | Yes | All lender fees |
| Funding Fee (FHA/VA/USDA) | Yes | Government guarantee fees |
| Mortgage Insurance Premium (upfront) | Yes | FHA UFMIP, VA, USDA |
| Discount Points | Yes | If any |
| Lender Credit | Yes (reduces) | Offsets finance charges |

### 10.4 Fees Excluded from APR (V1 Assumption)
| Fee | Exclude Reason |
|---|---|
| Appraisal Fee | Third-party, bona fide service |
| Title Insurance | Third-party |
| Flood / Tax Monitoring | Third-party |
| Property Taxes | Not a finance charge |
| Homeowner's Insurance | Not a finance charge |
| Seller Credits | Not paid by borrower |
| Recording Fees | Government fee |
| Prepaid Interest | Handled separately in payment stream |

### 10.5 Monthly MI in APR
For loans with ongoing MI (FHA, Conventional with PMI), APR should reflect the MI payments in the payment stream until MI drops off. V1 simplification:
- Include monthly MI as a constant payment for the full loan term
- This **overstates** APR slightly for FHA (MIP cancels at 11 years for >10% down)
- Label clearly as "Estimated APR — assumes constant MI over full term"

### 10.6 Display Rules
```
If all required fields are filled:
  → Show "Est. APR: X.XXX%"
  → Show tooltip: "Estimated only. Does not constitute a Loan Estimate or binding disclosure."

If fields are incomplete:
  → Show "Est. APR: —"
```

---

## 11. PDF Layout Structure

The Loan Quote output is a **3-page print document** (letter size, portrait, white background).
It exactly follows the structure of the reference PDF (`Loan Quote example.pdf`).
Triggered by the "Preview Loan Quote" button. Rendered as a separate route (`/preview/loan-quote`)
and printed via `window.print()` / browser print dialog.

---

### PAGE 1 OF 3 — Loan Summary

#### 11.1 Page Header (two-column, full width)

**Left column:**
```
Loan Quote                          ← large bold heading
DATE ISSUED    [date]
APPLICANTS     [borrowerName]
PROPERTY       [city], [zip], [state]
EST. PROP.
VALUE          [estimatedPropertyValue or purchasePrice]
```

**Right column:**
```
LOAN TERM   [loanTerm] years
PURPOSE     [purpose]
PRODUCT     [product]

LOAN TYPE   ☑ Conventional  ☐ FHA  ☐ VA  ☐ USDA Rural Development
            (checkbox filled based on selected loanType)

LOAN ID #   [quoteId]
RATE LOCK   ☑ No  ☐ Yes   (or ☐ No  ☑ Yes based on rateLock)
```

Separated from body by a full-width horizontal rule.

---

#### 11.2 Section: Loan Terms (table, full width)

Two-column table. Left = field/value. Right = "Can this amount increase after closing?" answer.

| Left | Right |
|---|---|
| **Loan Amount** `$[totalLoanAmount]` | NO |
| **Interest Rate** `[interestRate]%` | NO |
| **Monthly Principal & Interest** *(sub-label: "See Projected Payments below for your Estimated Total Monthly Payment")* `$[monthlyPI]` | NO |
| *(divider row)* **Does the loan have these features?** | |
| **Prepayment Penalty** | NO |
| **Balloon Payment** | NO |

---

#### 11.3 Section: Projected Payments (table, full width)

| Column | Content |
|---|---|
| **Payment Calculation** | **Years 1–[loanTerm]** |
| Principal & Interest | `$[monthlyPI]` |
| Mortgage Insurance | `$[monthlyMI]` |
| Estimated Escrow *(sub: "Amount can increase over time")* | `$[estimatedEscrow]` |
| **Estimated Total Monthly Payment** | `$[totalMonthlyPayment]` |

**Estimated Taxes, Insurance & Assessments** sub-row (spans full width):

- Left cell: `$[estimatedEscrow] a month` + sub-label "Amount can increase over time"
- Right cell: checklist with "In escrow?" column:

```
This estimate includes                  In escrow?
☑  Property Taxes                          YES
☑  Homeowner's Insurance                   YES
☐  Flood Insurance                         [YES if in escrow, blank if not]
☐  Others

See Section G on page 2 for escrowed property costs.
You must pay for other property costs separately.
```

Checkboxes filled based on `taxInsuranceItems[].included`.
"In escrow?" YES shown only for items where `inEscrow = true`.

---

#### 11.4 Section: Costs at Closing (table, full width)

| Field | Value | Description |
|---|---|---|
| **Estimated Closing Costs** | `$[totalClosingCosts]` | Includes `$[totalLoanCosts]` in Loan Costs + `$[totalOtherCosts]` in Other Costs - `$[lenderCredit]` in Lender Credits. See page 2 for details. |
| **Estimated Cash to Close** | `$[cashToClose]` | Includes Closing Costs. See Calculating Cash to Close on page 2 for details. |

---

#### 11.5 Page 1 Footer

```
LOAN QUOTE    PAGE 1 OF 3 • LOAN ID # [quoteId]
```

---

### PAGE 2 OF 3 — Closing Cost Details

**Section heading:** "Closing Cost Details" (bold, full width)

Two-column layout: **Loan Costs** (left) | **Other Costs** (right)

---

#### 11.6 Left Column: Loan Costs

**A. Origination Charges** `$[sectionATotal]`

Each configured origination line item:
```
[item.label]          $[item.amount]
```
*(e.g. Underwriting Fee $1,075.00 / Points $7,942.05)*

---

**B. Services You Cannot Shop For** `$[sectionBTotal]`

Each default + configured item:
```
Appraisal Fee                    $[amount]
Flood Certification Fee          $[amount]
Tax Monitoring Fee               $[amount]
Undisclosed Debt Monitoring      $[amount]
Credit Report Fee                $[amount]
VOE Fee                          $[amount]
[any additional configured items]
```

---

**C. Services You Can Shop For** `$[sectionCTotal]`

Each configured item:
```
[item.label]          $[item.amount]
```
*(e.g. Aggregated Title Fees $1,982.40)*

---

**D. TOTAL LOAN COSTS (A + B + C)** `$[totalLoanCosts]`

*(bold, highlighted row)*

---

#### 11.7 Right Column: Other Costs

**E. Taxes and Other Government Fees** `$[sectionETotal]`
```
Recording Fee - mortgage          $[amount]
```

---

**F. Prepaids** `$[sectionFTotal]`
```
Homeowner's Insurance Premium ( [months] months )         $[amount]
Mortgage Insurance Premium ( [months] months )            $[amount]
Flood Insurance Premium ( [months] months )               $[amount]
Prepaid Interest ( $[perDiem] per day for [days] days @ [rate]% )  $[amount]
Property Taxes ( [months] months )                        $[amount]
```

---

**G. Initial Escrow Payment at Closing** `$[sectionGTotal]`
```
Homeowner's Insurance ( $[monthly] per month for [months] mo. )   $[amount]
Mortgage Insurance ( $[monthly] per month for [months] mo. )      $[amount]
Flood Insurance ( $[monthly] per month for [months] mo. )         $[amount]
Property Taxes ( $[monthly] per month for [months] mo. )          $[amount]
```

---

**H. Other** `$[sectionHTotal]`

*(empty by default, shows $0.00)*

---

**I. TOTAL OTHER COSTS (E + F + G + H)** `$[totalOtherCosts]`

---

**J. TOTAL CLOSING COSTS** `$[totalClosingCosts]`
```
D + I                             $[totalClosingCosts]
Lender Credits                   -$[lenderCredit]
```

---

#### 11.8 Calculating Cash to Close (box, right column bottom)

```
┌──────────────────────────────────────────────────┐
│ Calculating Cash to Close                        │
├──────────────────────────────────────────────────┤
│ Total Closing Costs (J)          $[amount]       │
│ Estimated Total Payoffs          $[amount]       │
│   and Payments                                   │
│ Total Loan Amount                $[amount]       │
│ Estimated Cash to Close          $[amount]       │
│   (From) Borrower                                │
│ Total Closing Costs Financed     $[amount]       │
└──────────────────────────────────────────────────┘
```

**Calculations:**
```
Total Closing Costs Financed = totalClosingCosts (when isClosingCostFinanced = true)
Total Loan Amount (on this page) = baseLoanAmount + fundingFee + totalClosingCostsFinanced
Estimated Cash to Close = downPayment − sellerCredit (for Purchase)
                        = totalPayoffsAndPayments − totalLoanAmount (for Refinance)
```

---

#### 11.9 Page 2 Footer

```
LOAN QUOTE    PAGE 2 OF 3 • LOAN ID # [quoteId]
```

---

### PAGE 3 OF 3 — Additional Information

#### 11.10 Section: Additional Information About This Loan (two-column)

**Left column** (lender — blank if not applicable):
```
LENDER
NMLS / ___ LICENSE ID
LOAN OFFICER
NMLS / ___ LICENSE ID
EMAIL
PHONE
```

**Right column** (mortgage broker — pre-filled from profile config):
```
MORTGAGE BROKER    [brokerName]
NMLS / CA LICENSE ID  [brokerNMLS]
LOAN OFFICER       [loanOfficerName]
NMLS / ___ LICENSE ID  [loanOfficerNMLS]
EMAIL              [loanOfficerEmail]
PHONE              [loanOfficerPhone]
```

---

#### 11.11 Section: Comparisons

> "Use these measures to compare this loan with other loans."

| Metric | Value |
|---|---|
| **In 5 Years** | `$[totalPaidIn5Years]` — Total you will have paid in principal, interest, mortgage insurance, and loan costs. `$[principalPaidIn5Years]` Principal you will have paid off. |
| **Total Interest Percentage (TIP)** | `[tip]%` — The total amount of interest that you will pay over the loan term as a percentage of your loan amount. |

**Calculations:**
```
totalPaidIn5Years = sum of 60 monthly payments (P&I + MI) + totalLoanCosts
principalPaidIn5Years = totalLoanAmount − remainingBalance after 60 payments
TIP = totalInterestPaidOverLifeOfLoan / loanAmount × 100
```

---

#### 11.12 Section: Other Considerations

Each item is a row with bold label on the left and paragraph text on the right.

| Label | Content |
|---|---|
| **Appraisal** | "We may order an appraisal to determine the property's value and charge you for this appraisal. We will promptly give you a copy of any appraisal, even if your loan does not close. You can pay for an additional appraisal for your own use at your own cost." |
| **Assumption** | ☑ will allow, under certain conditions, this person to assume this loan on the original terms. ☑ will not allow assumption of this loan on the original terms. |
| **Homeowner's Insurance** | "This loan requires homeowner's insurance on the property, which you may obtain from a company of your choice that we find acceptable." |
| **Late Payment** | "If your payment is more than 15 days late, we will charge a late fee of 6% of the payment." |
| **Refinance** | "Refinancing this loan will depend on your future financial situation, the property value, and market conditions. You may not be able to refinance this loan." |
| **Servicing** | We intend ☑ to service your loan. If so, you will make your payments to us. ☑ to transfer servicing of your loan. |

*(The checkbox states for Assumption and Servicing are static boilerplate in V1.)*

---

#### 11.13 Section: Confirm Receipt

> "By signing, you are only confirming that you have received this form. You do not have to accept this loan because you have signed or received this form."

Four signature/date lines:
```
Applicant Signature ________________  Date ________

Co-Applicant Signature _____________  Date ________
```

---

#### 11.14 Page 3 Footer

```
LOAN QUOTE    PAGE 3 OF 3 • LOAN ID # [quoteId]
```

---

### 11.15 Print CSS Rules

```css
@media print {
  /* Hide app chrome */
  .sidebar, .topnav, .tab-bar, .action-buttons { display: none; }

  /* Letter portrait, 0.75in margins */
  @page { size: letter portrait; margin: 0.75in; }

  /* Force page breaks between the 3 pages */
  .page-1, .page-2 { page-break-after: always; }

  /* Never break inside a section */
  .loan-section { break-inside: avoid; }

  /* White background, black text — overrides dark theme */
  body, .print-view { background: white !important; color: black !important; }

  /* Two-column layout for page 2 closing costs */
  .closing-costs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }

  /* Tables */
  table { width: 100%; border-collapse: collapse; font-size: 9pt; }
  td, th { padding: 3px 6px; border-bottom: 1px solid #ccc; }
  .section-total td { font-weight: bold; border-top: 2px solid black; }

  /* Section headers */
  .section-header { background: #f0f0f0; font-weight: bold; padding: 4px 6px; }

  /* Footer */
  .page-footer { position: fixed; bottom: 0; font-size: 8pt; color: #666; }
}
```

### 11.16 Component File for Print View

```
app/preview/loan-quote/
├── page.tsx          ← reads quote from localStorage, renders all 3 pages
├── Page1.tsx         ← Loan Summary
├── Page2.tsx         ← Closing Cost Details
├── Page3.tsx         ← Additional Information
└── print.css         ← @media print rules above
```

---

## 12. Configuration-Driven Rules Approach

Rather than hard-coding loan rules in component logic, all fee tables, default line items,
and loan-type behavior are stored in a single config file (`lib/rules.ts`).
This means rules can be updated without touching UI components.

### 12.1 Principle
```
UI Component → reads from rules.ts → renders fields / runs calculations
              ↑
         (never hard-coded in JSX)
```

### 12.2 Funding Fee Table (VA)
```typescript
// lib/rules.ts

export const VA_FUNDING_FEE_TABLE = {
  first_time: [
    { minDownPct: 0,    maxDownPct: 4.99,  rate: 0.0215 },
    { minDownPct: 5,    maxDownPct: 9.99,  rate: 0.015  },
    { minDownPct: 10,   maxDownPct: 100,   rate: 0.0125 },
  ],
  subsequent: [
    { minDownPct: 0,    maxDownPct: 4.99,  rate: 0.033  },
    { minDownPct: 5,    maxDownPct: 9.99,  rate: 0.015  },
    { minDownPct: 10,   maxDownPct: 100,   rate: 0.0125 },
  ],
  exempt: [
    { minDownPct: 0,    maxDownPct: 100,   rate: 0      },
  ],
}

export const FLAT_FUNDING_FEES: Record<string, number> = {
  fha:         0.0175,   // 1.75% of loan amount
  usda:        0.01,     // 1.00% of loan amount
  conventional: 0,
  other:        0,
}
```

### 12.3 Loan Type Behavior Config
```typescript
export const LOAN_TYPE_CONFIG = {
  conventional: {
    showFundingFee:   false,
    showMI:           true,    // PMI if LTV > 80%
    miAutoCalc:       false,   // user inputs PMI rate manually
    showVAFields:     false,
    showDescription:  false,
    fundingFeeLabel:  null,
  },
  fha: {
    showFundingFee:   true,
    showMI:           true,
    miAutoCalc:       false,   // MIP rate is editable
    showVAFields:     false,
    showDescription:  false,
    fundingFeeLabel:  'Funding Fee (1.75% of Loan Amount)',
  },
  va: {
    showFundingFee:   true,
    showMI:           false,
    miAutoCalc:       false,
    showVAFields:     true,
    showDescription:  false,
    fundingFeeLabel:  'VA Funding Fee',
  },
  usda: {
    showFundingFee:   true,
    showMI:           false,
    miAutoCalc:       false,
    showVAFields:     false,
    showDescription:  false,
    fundingFeeLabel:  'Funding Fee (1% of Loan Amount)',
  },
  other: {
    showFundingFee:   false,
    showMI:           false,
    miAutoCalc:       false,
    showVAFields:     false,
    showDescription:  true,
    fundingFeeLabel:  null,
  },
}
```

### 12.4 Default Closing Cost Line Items
```typescript
export const DEFAULT_SERVICES_CANNOT_SHOP: LineItem[] = [
  { id: 'mip',   label: 'Mortgage Insurance Premium', amount: 0,   isDefault: true },
  { id: 'appr',  label: 'Appraisal Fee',              amount: 630, isDefault: true },
  { id: 'flood', label: 'Flood Certification Fee',    amount: 8,   isDefault: true },
  { id: 'fmon',  label: 'Flood Monitoring Fee',       amount: 5,   isDefault: true },
  { id: 'taxm',  label: 'Tax Monitoring Fee',         amount: 48,  isDefault: true },
]

export const DEFAULT_ORIGINATION_CHARGES: LineItem[] = [
  { id: 'uw', label: 'Underwriting Fee', amount: 1050, isDefault: true },
]

export const DEFAULT_TAX_INSURANCE_ITEMS: TaxInsuranceItem[] = [
  { label: 'Property Taxes',        included: true,  annualAmount: 0, inEscrow: true  },
  { label: "Homeowner's Insurance", included: true,  annualAmount: 0, inEscrow: true  },
  { label: 'Flood Insurance',       included: false, annualAmount: 0, inEscrow: false },
  { label: 'HOA',                   included: false, annualAmount: 0, inEscrow: false },
]
```

### 12.5 APR Inclusion Rules Config
```typescript
export const APR_FEE_RULES: Record<string, 'include' | 'exclude'> = {
  originationCharges:         'include',
  fundingFee:                 'include',
  mortgageInsurancePremium:   'include',
  discountPoints:             'include',
  lenderCredit:               'include',   // reduces APR
  appraisalFee:               'exclude',
  titleInsurance:             'exclude',
  floodCertificationFee:      'exclude',
  floodMonitoringFee:         'exclude',
  taxMonitoringFee:           'exclude',
  propertyTaxes:              'exclude',
  homeownersInsurance:        'exclude',
  sellerCredit:               'exclude',
  recordingFees:              'exclude',
  prepaidInterest:            'exclude',
}
```

### 12.6 Validation Rules Config
```typescript
export const FIELD_VALIDATION_RULES = {
  purchasePrice:   { min: 1,     max: 50_000_000, required: true  },
  downPayment:     { min: 0,     max: null,        required: true  },  // max = purchasePrice
  interestRate:    { min: 0.001, max: 0.25,        required: true  },  // as decimal
  allFeeAmounts:   { min: 0,     max: 999_999,     required: false },

  conformingLoanLimit: 806_500,    // 2025 FHFA limit; update annually
  highLTVWarningPct:   97,
  highRateWarningPct:  12,
}
```

### 12.7 Benefits of This Approach
| Benefit | Detail |
|---|---|
| **Updateable without code changes** | A non-developer can edit fee defaults in `rules.ts` |
| **Testable in isolation** | Calculation functions only take data + config as input |
| **Extensible** | New loan types or fee structures are added by extending the config |
| **Single source of truth** | No magic numbers scattered across components |
| **Auditable** | All business logic lives in one file, not buried in JSX |

---

## 13. Deliverables Checklist

Each item maps to a file or folder in the project. Check off as built.

---

### 13.1 Config File
> `lib/rules.ts` — single source of truth for all business rules and defaults

- [ ] VA funding fee tier table (by VA type + down payment %)
- [ ] Flat funding fee rates by loan type (FHA 1.75%, USDA 1.00%)
- [ ] Loan type behavior flags (`showFundingFee`, `showMI`, `showVAFields`, etc.)
- [ ] Default origination charge line items (Underwriting Fee $1,050)
- [ ] Default Services You Cannot Shop For line items (Appraisal, Flood Cert, Tax Monitoring, etc.)
- [ ] Default tax/insurance items with escrow defaults (Property Taxes, Homeowner's Insurance)
- [ ] APR fee inclusion/exclusion map
- [ ] Field validation bounds (min, max, conforming loan limit, warning thresholds)
- [ ] Boilerplate disclosure text (Other Considerations paragraphs, Confirm Receipt text)
- [ ] Late fee rate (6%), prepayment penalty flag, balloon payment flag

---

### 13.2 Calculation Engine
> `lib/calculations.ts` — pure functions, no UI dependencies, fully testable

- [ ] `calcBaseLoanAmount(purchasePrice, downPayment)` → number
- [ ] `calcFundingFeeRate(loanType, vaType, downPaymentPct)` → number (rate)
- [ ] `calcFundingFeeAmount(baseLoanAmount, rate)` → number
- [ ] `calcTotalLoanAmount(baseLoanAmount, fundingFeeAmount, isFinanced)` → number
- [ ] `calcMonthlyPI(totalLoanAmount, annualRate, termYears)` → number
- [ ] `calcMonthlyMI(totalLoanAmount, annualMIRate)` → number
- [ ] `calcEstimatedEscrow(taxInsuranceItems)` → number (sum of escrowed annual amounts ÷ 12)
- [ ] `calcTotalMonthlyPayment(pi, mi, escrow)` → number
- [ ] `calcSectionTotals(originationCharges, servicesCannotShop, servicesCanShop)` → { A, B, C, D }
- [ ] `calcOtherCostTotals(recordingFees, prepaids, initialEscrow)` → { E, F, G, H, I }
- [ ] `calcTotalClosingCosts(D, I, lenderCredit)` → number (J)
- [ ] `calcCashToClose(purpose, downPayment, totalPayoffs, totalLoanAmount, sellerCredit)` → number
- [ ] `calcPrepaidInterest(loanAmount, annualRate, days)` → number
- [ ] `calcTotalPaidIn5Years(monthlyPI, monthlyMI, totalLoanCosts)` → number
- [ ] `calcPrincipalPaidIn5Years(loanAmount, annualRate, termYears)` → number
- [ ] `calcTIP(totalInterestOverLife, loanAmount)` → percentage
- [ ] `calcEstimatedAPR(loanAmount, fees, payment, termMonths)` → rate (iterative solve)

---

### 13.3 UI Components
> `components/` — all interactive form elements and layout shells

**Layout**
- [ ] `AppShell` — sidebar + main content wrapper, dark theme
- [ ] `Sidebar` — nav links: Dashboard, Loan Details, Forms, My Team, Settings, Support
- [ ] `TopNav` — borrower name, loan officer info, tab bar, preview/back buttons
- [ ] `TabBar` — Loan Quote (active) / Pre Approvals (stub) / Contacts (stub)

**Primitive Inputs** (`components/ui/`)
- [ ] `CurrencyInput` — `$` prefix, 2 decimal places, comma formatting, no negatives
- [ ] `PercentInput` — `%` suffix, 3 decimal places
- [ ] `TextInput` — generic single-line text
- [ ] `SelectDropdown` — styled select with "Select" placeholder, dark theme
- [ ] `DateInput` — calendar picker, future-date validation
- [ ] `ToggleSwitch` — Yes / No binary, animated, blue when Yes
- [ ] `CheckboxRow` — checkbox + label + currency amount + toggle (Taxes section)

**Form Sections** (`components/form/`)
- [ ] `SectionCard` — collapsible card with labeled header, consistent padding
- [ ] `PropertyDetails` — Street, City, Zip, State, Purpose (with conditional fields)
- [ ] `LoanParameters` — Loan Type, Term, Product, VA sub-fields, Refinance sub-fields
- [ ] `LoanAmounts` — Down Payment, Interest Rate, Base Loan Amount, Funding Fee (read-only)
- [ ] `ProjectedPayments` — P&I, MI, Escrow, Total (all read-only calculated outputs)
- [ ] `TaxInsuranceSection` — dynamic checklist rows with escrow toggles + "Other" custom row

**Closing Costs** (`components/closing-costs/`)
- [ ] `OriginationCharges` — list of line items + Add Configuration + delete buttons
- [ ] `OtherCredits` — Seller Credit, Lender Credit, Funds for Borrower inputs
- [ ] `ServicesCannotShop` — pre-populated editable list
- [ ] `ServicesCanShop` — configurable list + Add Configuration
- [ ] `PrepaidItems` — Homeowner's Insurance Premium, MI Premium, Prepaid Interest, Initial Escrow
- [ ] `RecordingFees` — Recording Fee - mortgage
- [ ] `SectionSubtotal` — bold total row with auto-calculated sum
- [ ] `AddConfigModal` — modal: Name input, Type dropdown, Value currency input, Save / Cancel

**Actions**
- [ ] `UpdateQuoteButton` — triggers full recalculation, saves to localStorage
- [ ] `CompleteButton` — finalizes and navigates to Preview Loan Quote
- [ ] `PreviewLoanQuoteButton` — opens `/preview/loan-quote` in new tab
- [ ] `PreviewFeeSheetButton` — opens `/preview/fee-sheet` in new tab (V2 — stub for now)

---

### 13.4 PDF Generator
> `app/preview/loan-quote/` — 3-page print view matching the reference PDF exactly

- [ ] `page.tsx` — reads quote from `localStorage`, passes to page components
- [ ] `Page1.tsx` — header (two-column), Loan Terms table, Projected Payments table, Costs at Closing
- [ ] `Page2.tsx` — Closing Cost Details two-column layout (sections A–J), Calculating Cash to Close box
- [ ] `Page3.tsx` — Lender/Broker info, Comparisons (In 5 Years, TIP), Other Considerations, Confirm Receipt signatures
- [ ] `print.css` — `@media print` rules: page breaks, two-column grid, white background, section borders, 9pt font
- [ ] Loan ID generated as short UUID, shown in every page footer
- [ ] All checkbox states rendered as ☑ / ☐ characters (not interactive form elements)
- [ ] Page footer: `LOAN QUOTE  PAGE X OF 3 • LOAN ID # [id]`
- [ ] Print triggered via `window.print()` button on preview page

---

### 13.5 Rule Engine
> `lib/ruleEngine.ts` — interprets `rules.ts` config to drive form visibility and behavior

- [ ] `getVisibleFields(loanType, purpose)` → string[] of field keys to show
- [ ] `getFieldLabel(fieldKey, loanType)` → correct label string (e.g. "Funding Fee (1.75% of Loan Amount)")
- [ ] `getFundingFeeRate(loanType, vaType, downPaymentPct)` → rate from VA table or flat rate map
- [ ] `getMIBehavior(loanType, ltv)` → `{ show: boolean, autoCalc: boolean }`
- [ ] `validateField(fieldKey, value, quoteState)` → `{ valid: boolean, error?: string, warning?: string }`
- [ ] `validateQuote(quoteState)` → `{ errors: Record<string, string>, warnings: Record<string, string> }`
- [ ] `getAPRIncludedFees(closingCosts)` → filtered list of finance charges for APR calculation
- [ ] `applyConditionalDefaults(loanType)` → returns default `LineItem[]` for the selected loan type

---

### 13.6 Branding Layer
> `lib/brand.ts` + `public/` — all lender/broker identity values in one place

- [ ] `brand.ts` config object:
  - [ ] `brokerName` — e.g. "Midwest Mortgage Lending LLC"
  - [ ] `brokerNMLS` — e.g. "2262032"
  - [ ] `loanOfficerName` — e.g. "Chris Wisinski"
  - [ ] `loanOfficerNMLS` — e.g. "88003"
  - [ ] `loanOfficerEmail` — e.g. "cwisinski@midwestmortgagelending.com"
  - [ ] `loanOfficerPhone` — e.g. "(616) 323-2020"
  - [ ] `logoPath` — path to logo image in `/public`
  - [ ] `primaryColor` — hex value for button/accent color (default `#2563eb`)
  - [ ] `darkBg` — main background color (default `#1e1e1e`)
  - [ ] `lateFeeRate` — 6%
  - [ ] `lateFeeGraceDays` — 15
- [ ] Logo file in `/public/logo.png` (placeholder until real logo supplied)
- [ ] Logo rendered in PDF header (Page 1, top-left)
- [ ] All brand values referenced from `brand.ts` — never hard-coded in components

---

### 13.7 Deployment Files
> Root-level config and environment files needed to build and run the project

- [ ] `package.json` — dependencies: Next.js 14, React, Tailwind, TypeScript, `uuid`
- [ ] `tsconfig.json` — strict mode enabled, path aliases (`@/lib`, `@/components`)
- [ ] `next.config.js` — base config (no special flags needed for V1)
- [ ] `tailwind.config.ts` — dark theme colors from `brand.ts`, custom font if needed
- [ ] `postcss.config.js` — Tailwind + autoprefixer
- [ ] `.env.local.example` — template for any future environment variables (empty for V1)
- [ ] `.gitignore` — node_modules, .next, .env.local
- [ ] `README.md` — how to install (`npm install`), run (`npm run dev`), and print a quote
- [ ] `start.sh` — convenience script: `npm install && npm run dev`

---

### 13.8 Checklist Summary

| Deliverable | Files | Status |
|---|---|---|
| Config File | `lib/rules.ts` | ☐ Not started |
| Calculation Engine | `lib/calculations.ts` | ☐ Not started |
| UI Components | `components/ui/`, `components/form/`, `components/closing-costs/` | ☐ Not started |
| PDF Generator | `app/preview/loan-quote/` | ☐ Not started |
| Rule Engine | `lib/ruleEngine.ts` | ☐ Not started |
| Branding Layer | `lib/brand.ts`, `public/logo.png` | ☐ Not started |
| Deployment Files | `package.json`, `tailwind.config.ts`, `.gitignore`, `README.md` | ☐ Not started |

---

## 14. Unresolved Business Logic — Must Confirm Before Build

Each item below is a genuine ambiguity found by cross-referencing the UI screenshots against the
reference PDF. None can be safely assumed. Each needs a confirmed answer before the relevant
calculation or component can be coded.

Status key: `[ ]` = unconfirmed · `[x]` = confirmed (fill in answer after)

---

### 14.1 Funding Fee

**BL-01 — Is the funding fee always financed into the loan, or can it be paid at closing?**
- The PDF shows `Total Loan Amount = Base Loan Amount + Funding Fee ($5,911)`, implying it is always financed.
- If it can be paid at closing instead, it must be excluded from the loan amount and added to Section F (Prepaids).
- [ ] **Confirm:** Is the funding fee always rolled into the loan, or is it borrower's choice?

**BL-02 — For FHA, is the 1.75% UFMIP calculated on the base loan amount or the total loan amount?**
- Standard HUD rule: 1.75% × base loan amount (before adding the UFMIP itself).
- Some tools calculate it on the total, which overstates the fee slightly.
- [ ] **Confirm:** Base loan amount × 1.75%, or total?

**BL-03 — Are the VA funding fee down-payment thresholds exactly 0%, 5%, and 10%?**
- The current spec uses: `<5% = 2.15%`, `5–9.99% = 1.5%`, `≥10% = 1.25%` (First Time Use).
- The 2024 VA table uses these exact breakpoints, but confirm the lender hasn't negotiated different tiers.
- [ ] **Confirm:** Are 0/5/10% the correct breakpoints for this tool?

**BL-04 — What is the VA funding fee rate for "Subsequent Use" with no down payment?**
- Standard rate is 3.30%. The reference PDF example uses a Conventional loan, so this case is untested.
- [ ] **Confirm:** Is 3.30% correct for Subsequent Use, 0% down?

---

### 14.2 Mortgage Insurance

**BL-05 — For Conventional loans, is PMI entered manually or auto-calculated?**
- PMI depends on credit score, lender, and LTV — none of which this tool collects.
- The screenshots show a Mortgage Insurance field but no PMI rate input.
- [ ] **Confirm:** Is MI a manual dollar input, a manual % input, or omitted for Conventional in V1?

**BL-06 — What is the FHA annual MIP rate used in this tool?**
- The current rate is 0.55% for most 30-year FHA loans, but it varies by LTV and loan amount.
- The reference PDF shows `$59.58/month` on a `$555,000` loan, implying ≈ 0.129% — unusually low for FHA.
- [ ] **Confirm:** What annual MIP rate (or rate table) should this tool use for FHA?

**BL-07 — Does the tool need to model FHA MIP cancellation?**
- FHA MIP is life-of-loan if down payment < 10%; cancels at 11 years if ≥ 10% down.
- This affects the TIP and In-5-Years calculations on PDF Page 3.
- [ ] **Confirm:** Should MIP be treated as permanent for the full term in all calculations?

**BL-08 — For USDA, is the 0.35% annual fee shown as monthly MI or a separate line item?**
- USDA has no monthly MI label in the standard sense — its annual fee is 0.35% of the outstanding balance.
- The screenshots and PDF do not show this as a distinct field.
- [ ] **Confirm:** Where does the USDA annual fee appear — as "Mortgage Insurance" in Projected Payments, or elsewhere?

---

### 14.3 Refinance Logic

**BL-09 — What are the valid options in the "Refinance Type" dropdown?**
- The screenshots show the field but the dropdown contents are never visible.
- Common options: Rate & Term, Cash-Out, Streamline, IRRRL (VA only).
- [ ] **Confirm:** What are the exact Refinance Type options, and do any trigger additional fields?

**BL-10 — How is "Estimated Total Payoffs and Payments" calculated on PDF Page 2?**
- For the reference PDF it shows `$555,000.00` — which exactly equals the Loan Amount.
- This may mean: current outstanding payoff balance entered manually, or simply equal to loan amount.
- [ ] **Confirm:** Is this field manually entered by the loan officer, or auto-populated from the loan amount?

**BL-11 — How is Estimated Cash to Close calculated for a Refinance?**
- For Purchase: `Cash to Close = Down Payment − Seller Credit`.
- For Refinance: `Cash to Close = Total Payoffs − Total Loan Amount` (borrower receives or owes difference).
- The reference PDF shows `-$542,832.55` which equals `$555,000 − $12,167.45 − $555,000 = −$555,000 + $12,167.45`... this needs clarification.
- [ ] **Confirm:** Provide the exact Cash to Close formula used for Refinance.

**BL-12 — When "Is Closing Cost Financed?" is Yes, does the funding fee recalculate on the new higher base?**
- If closing costs are added to the loan, the new loan amount is larger.
- Some programs calculate the funding fee before adding closing costs; others after.
- [ ] **Confirm:** Is funding fee calculated on (purchase price − down payment), or on (purchase price − down payment + financed closing costs)?

---

### 14.4 Closing Cost Sections

**BL-13 — Which items belong in "Services You Cannot Shop For" by default?**
- The reference PDF includes 6 items not in the form screenshots: `Undisclosed Debt Monitoring ($7)`, `Credit Report Fee ($160)`, `VOE Fee ($209)`.
- The form screenshots only show Appraisal, Flood Cert, Flood Monitoring, Tax Monitoring.
- [ ] **Confirm:** Should Credit Report Fee, VOE Fee, and Undisclosed Debt Monitoring be default line items in Section B?

**BL-14 — Is "Points" in Origination Charges a percentage-based field or a manual dollar amount?**
- The reference PDF shows `Points $7,942.05` alongside `Underwriting Fee $1,075.00` in Section A.
- Points are typically expressed as a % of loan amount (e.g., 1 point = 1% of $555,000 = $5,550).
- [ ] **Confirm:** Is Points entered as a dollar amount, a percentage, or both (% that auto-calculates to $)?

**BL-15 — What belongs in Section H ("Other") under Other Costs?**
- The PDF shows `H. Other $0.00` with no line items.
- This section is not visible in any form screenshot.
- [ ] **Confirm:** Is Section H a user-configurable free-form section, or always $0 and hidden?

**BL-16 — Is the Recording Fee in Section E a fixed default or a user-entered amount?**
- The reference PDF shows `Recording Fee - mortgage $64.00`.
- This amount varies by county and is not visible as an editable field in any screenshot.
- [ ] **Confirm:** Is Recording Fee a manually entered field, a default the officer can override, or a hidden fixed value?

---

### 14.5 Prepaids & Escrow

**BL-17 — Is "Closing Date" a form field, or is prepaid interest always $0 / manual?**
- Prepaid interest = `(loan amount × annual rate / 365) × days remaining in closing month`.
- This requires a closing date, which does not appear in any screenshot.
- The reference PDF shows `$77.54 per day for 0 days @ 4.99%` — 0 days means no closing date was entered.
- [ ] **Confirm:** Should Closing Date be a field on the form? Or is prepaid interest always entered manually?

**BL-18 — Is the per-diem interest rate calculated on 365 days or 360 days?**
- Some lenders use a 360-day year (banker's convention); others use 365.
- `$555,000 × 4.99% / 365 = $75.88/day` vs `/ 360 = $76.93/day`. The PDF shows $77.54/day — closer to 360 but not exact.
- [ ] **Confirm:** Which day-count convention does this lender use — 365 or 360?

**BL-19 — How many months of initial escrow are collected at closing?**
- The reference PDF shows `0 months` for all escrow items — which produces $0.
- In practice, lenders collect 2–3 months upfront as a cushion.
- [ ] **Confirm:** Is the number of escrow months a manual input per item, or a fixed default (e.g., always 2)?

**BL-20 — Is the monthly escrow amount in Section G the same as the Estimated Escrow in Projected Payments?**
- The reference PDF shows `Homeowner's Insurance $64.17/month` and `Property Taxes $400.00/month` in Section G.
- Those sum to `$464.17` — which matches the `Estimated Escrow $464.17` in Projected Payments exactly.
- [ ] **Confirm:** Is Estimated Escrow in Projected Payments always the sum of Section G monthly amounts?

---

### 14.6 Loan Product & ARM

**BL-21 — Are ARM products in scope for V1?**
- The reference PDF uses `PRODUCT: ARM`, yet the P&I shows a flat $2,975.97 for "Years 1-30".
- For a true ARM, the payment changes after the initial fixed period. The flat display suggests either: (a) only the initial rate is shown, or (b) the tool treats ARM the same as Fixed Rate.
- [ ] **Confirm:** Should ARM be treated identically to Fixed Rate in calculations (use initial rate for full term), or is ARM out of scope?

**BL-22 — What are the exact Product dropdown options?**
- Screenshots show "Fixed Rate" selected. The reference PDF shows "ARM".
- Other common options: ARM 3/1, 5/1, 7/1, 10/1, Interest Only.
- [ ] **Confirm:** List all Product dropdown values the tool needs to support at launch.

---

### 14.7 Comparisons (PDF Page 3)

**BL-23 — What is included in the "Total you will have paid in 5 Years" figure?**
- The reference PDF states: "principal, interest, mortgage insurance, and loan costs."
- This implies: `(60 × monthly P&I) + (60 × monthly MI) + total loan costs (Section D)`.
- [ ] **Confirm:** Is this the correct formula? Are escrow payments excluded?

**BL-24 — Is TIP (Total Interest Percentage) calculated on the original loan amount or total loan amount (including financed fees)?**
- TIP = total interest paid over life of loan ÷ loan amount × 100.
- Standard CFPB definition uses the loan amount from the Note (which includes financed fees).
- [ ] **Confirm:** Which loan amount is used as the denominator for TIP?

---

### 14.8 Form Behavior

**BL-25 — Does "Update Quote" autosave, or does the user have to click it explicitly before navigating away?**
- If the user edits a field then immediately clicks "Preview Loan Quote" without clicking "Update Quote", do they see stale or current values in the PDF?
- [ ] **Confirm:** Should field edits trigger immediate recalculation (live), or only on explicit "Update Quote" click?

**BL-26 — What does the "Complete" button do — and can a completed quote be re-edited?**
- The form shows both "Update Quote" and "Complete". The PDF reference does not clarify what Complete triggers.
- Options: (a) locks the form and opens PDF preview, (b) marks quote as final in a list, (c) both.
- [ ] **Confirm:** Exact behavior of "Complete" — does it lock, export, navigate, or all three?

**BL-27 — Can the loan officer add multiple "Other" rows in the Taxes & Insurance section?**
- The screenshot shows one "Other" checkbox row. It's unclear if more can be added.
- [ ] **Confirm:** Is "Other" a single row with a fixed label, or can the officer add and label multiple custom rows?

**BL-28 — Is there a Co-Applicant name field on the form?**
- PDF Page 3 has a "Co-Applicant Signature" line.
- No co-applicant name field is visible in any form screenshot.
- [ ] **Confirm:** Is there a Co-Applicant name field? If not, does the signature line always appear or only when a co-applicant is present?

---

### 14.9 Loan ID & Data

**BL-29 — How is the Loan ID generated?**
- The reference PDF shows `c9gpyjl2` — an 8-character alphanumeric string.
- This could be: random UUID prefix, sequential counter, system-generated from the backend, or officer-entered.
- [ ] **Confirm:** Is Loan ID auto-generated (random), manually entered, or assigned by an external system?

**BL-30 — Should the form support multiple quotes, or only one active quote at a time?**
- The "Back to list" button in the screenshots implies a quote list.
- V1 currently assumes a single quote in localStorage.
- [ ] **Confirm:** For V1, is one quote at a time acceptable, or must the list view be included from day one?

---

### 14.10 PDF / Parties

**BL-31 — Is the Lender section on PDF Page 3 always blank, or does it sometimes get filled in?**
- The reference PDF has an empty LENDER column (left) and a filled MORTGAGE BROKER column (right).
- Some transactions have a direct lender with no broker. Others have both.
- [ ] **Confirm:** Should the Lender column be a configurable field, or permanently blank for this tool?

**BL-32 — Are the Assumption and Servicing checkboxes on Page 3 configurable per quote, or static boilerplate?**
- The reference PDF has both "will allow" and "will not allow" checked under Assumption — which is logically contradictory and suggests these are static placeholder checkboxes.
- [ ] **Confirm:** Should these checkboxes reflect actual loan terms, or remain as static disclosure boilerplate?

**BL-33 — Does the tool need to support a lender logo on the PDF, or is it always logo-free?**
- The reference PDF has no logo. The branding layer spec (`lib/brand.ts`) includes a `logoPath` field.
- [ ] **Confirm:** Should a logo appear on the PDF header, and if so, has a logo file been supplied?

---

### 14.11 Summary Table

| ID | Category | Question | Blocking? |
|---|---|---|---|
| BL-01 | Funding Fee | Is funding fee always financed into loan amount? | Yes — affects Page 2 Cash to Close calc |
| BL-02 | Funding Fee | FHA UFMIP on base or total loan amount? | Yes — affects every FHA quote |
| BL-03 | Funding Fee | VA down-payment breakpoints 0/5/10%? | Yes — affects VA funding fee |
| BL-04 | Funding Fee | VA Subsequent Use rate at 0% down? | Yes — affects VA subsequent use quotes |
| BL-05 | MI | Conventional PMI — manual input or auto? | Yes — affects Projected Payments |
| BL-06 | MI | FHA annual MIP rate used? | Yes — affects every FHA quote |
| BL-07 | MI | Model FHA MIP cancellation? | Partial — affects TIP / 5-Year figures |
| BL-08 | MI | Where does USDA 0.35% annual fee appear? | Yes — affects Projected Payments |
| BL-09 | Refinance | Refinance Type dropdown options? | Yes — affects field rendering |
| BL-10 | Refinance | How is Total Payoffs calculated? | Yes — affects Page 2 Cash to Close |
| BL-11 | Refinance | Cash to Close formula for Refinance? | Yes — affects Page 2 |
| BL-12 | Refinance | Funding fee base when closing costs are financed? | Yes — affects loan amount |
| BL-13 | Closing Costs | Default items in Section B? | Yes — affects default fee sheet |
| BL-14 | Closing Costs | Points — % or dollar input? | Yes — affects Section A |
| BL-15 | Closing Costs | Section H (Other) — configurable or always $0? | Low — rarely used |
| BL-16 | Closing Costs | Recording Fee — fixed default or manual? | Yes — appears on PDF Page 2 |
| BL-17 | Prepaids | Is Closing Date a form field? | Yes — required for prepaid interest |
| BL-18 | Prepaids | Per-diem: 365 or 360 day year? | Yes — affects prepaid interest |
| BL-19 | Prepaids | How many initial escrow months collected? | Yes — affects Section G and cash to close |
| BL-20 | Prepaids | Escrow in Projected Payments = sum of Section G? | Yes — must be consistent |
| BL-21 | Product | ARM treated same as Fixed Rate in calcs? | Yes — affects P&I formula |
| BL-22 | Product | All Product dropdown values? | Yes — affects form render |
| BL-23 | Comparisons | Formula for "In 5 Years" total? | Partial — affects Page 3 |
| BL-24 | Comparisons | TIP denominator — base or total loan amount? | Partial — affects Page 3 |
| BL-25 | Form Behavior | Live recalc vs Update Quote click? | Yes — affects UX architecture |
| BL-26 | Form Behavior | What does "Complete" do exactly? | Yes — affects navigation and state |
| BL-27 | Form Behavior | Multiple "Other" rows in Taxes & Insurance? | Low — edge case |
| BL-28 | Form Behavior | Co-applicant name field exists? | Low — affects PDF signature line |
| BL-29 | Data | Loan ID generation method? | Low — cosmetic |
| BL-30 | Data | Single quote or list view required for V1? | Yes — affects scope |
| BL-31 | PDF | Lender column — configurable or blank? | Low — cosmetic |
| BL-32 | PDF | Assumption/Servicing checkboxes — static or configurable? | Low — boilerplate |
| BL-33 | PDF | Logo on PDF — required? File supplied? | Low — cosmetic |

**Blocking items (must resolve before any code is written):** BL-01 through BL-22, BL-25, BL-26, BL-30
