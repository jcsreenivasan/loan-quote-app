// ─── Core Data Model ─────────────────────────────────────────────────────────
// Field names and structure match the MLOFlo API (verified from HAR traffic).

export type LoanPurposeType = 'Purchase' | 'Refinance'
export type LoanProductType = 'Conventional' | 'FHA' | 'VA' | 'USDA'
export type LoanProduct     = 'FR' | 'ARM' | 'IO'   // Fixed Rate, ARM, Interest Only
export type VATypeValue      = 'first_time_use' | 'subsequent_use' | 'exempt'
export type RefinanceType    = 'CashOut' | 'NoCashOut'
export type DownPaymentType  = 'doller' | 'percentage'
// LoanTerm stored in months (e.g. 360 = 30yr, 180 = 15yr)
export type LoanTermMonths = 60 | 120 | 180 | 240 | 300 | 360

// ─── Sub-types ───────────────────────────────────────────────────────────────

export interface StateObj {
  code: string    // e.g. "AZ"
  name: string    // e.g. "Arizona"
  _id:  string
}

export interface PropertyAddress {
  street:        string
  unit:          string
  unitType:      string
  city:          string
  zip:           string
  state:         StateObj | null
  county:        string
  country:       string
  numberOfUnits: string
}

export interface PurposeObj {
  type: LoanPurposeType
  _id:  string
}

export interface ProductTypeObj {
  type: LoanProductType
  _id:  string
}

export interface LoanAmountObj {
  amount: number
  _id:    string
}

export interface InterestRateObj {
  rate: string   // string decimal e.g. "6.544"
  _id:  string
}

// ─── Line Items ───────────────────────────────────────────────────────────────

export interface LineItem {
  _id:                   string
  type:                  string | null
  amount:                number
  isAmountLockOpen:      boolean
  isAmountTypePercentage?: boolean   // origination charges only
  percentage?:           number       // origination charges only
}

// ─── Escrow / Insurance ───────────────────────────────────────────────────────

export interface EstimateIncludesItem {
  included:        boolean    // named per field (propertyTaxes, floodInsurance, etc.)
  amount:          number | string
  inEscrow:        boolean
  isAmountLocked:  boolean
  _id:             string
}

export interface EstimateIncludes {
  propertyTaxesInfo:      { propertyTaxes:      boolean; amount: number | string; inEscrow: boolean; isAmountLocked: boolean; _id: string }
  floodInsuranceInfo:     { floodInsurance:      boolean; amount: number | string; inEscrow: boolean; isAmountLocked: boolean; _id: string }
  HOAInsuranceInfo:       { HOAInsurance:        boolean; amount: number | string; inEscrow: boolean; isAmountLocked: boolean; _id: string }
  homeOwnerInsuranceInfo: { homeOwnerInsurance:  boolean; amount: number | string; inEscrow: boolean; isAmountLocked: boolean; _id: string }
  other:                  { other:               boolean; amount: number | string; isAmountLocked: boolean; _id: string }
  _id: string
}

export interface PrepaidPeriod {
  period: string | number
  _id:    string
}

export interface PrepaidInterestPeriod {
  period:       string | number
  interestRate: number
  _id:          string
}

export interface Prepaids {
  homeOwnerInsurance: PrepaidPeriod
  floodInsurance:     PrepaidPeriod
  mortgageInsurance:  PrepaidPeriod
  propertyTaxes:      PrepaidPeriod
  prepaidInterest:    PrepaidInterestPeriod
  _id:                string
}

export interface EscrowPayment {
  homeOwnerInsurance: PrepaidPeriod
  floodInsurance:     PrepaidPeriod
  mortgageInsurance:  PrepaidPeriod
  propertyTaxes:      PrepaidPeriod
  _id:                string
}

export interface OtherCredits {
  lenderCredits:     number    // plural — matches API
  sellerCredits:     number    // plural — matches API
  fundsForBorrower:  number
  _id:               string
}

export interface EstimateCashToClose {
  closingCostFinanced: number
  _id:                 string
}

// ─── Top-Level Quote ──────────────────────────────────────────────────────────

export interface LoanQuote {
  // System fields
  _id:          string
  fileId:       string
  createdOn:    string
  updatedOn:    string
  updatedBy:    string
  configurationID: string
  status:       string | null

  // Borrower / officer (stored on the file, not the quote — kept here for UI)
  borrowerName:       string
  borrowerEmail:      string
  borrowerPhone:      string
  coBorrowerName:     string
  loanOfficerName:    string
  loanOfficerNMLS:    string
  loanOfficerEmail:   string
  loanOfficerPhone:   string

  // Property
  propertyAddress: PropertyAddress

  // Loan parameters
  purpose:        PurposeObj
  productType:    ProductTypeObj
  loanProduct:    LoanProduct          // "FR" | "ARM" | "IO"
  loanTerm:       LoanTermMonths       // stored in months
  isRateLock:     boolean
  rateLockDate:   string | null
  rateLockTime:   string | null
  VAType:         VATypeValue          // uppercase V — matches API
  refinanceType:  RefinanceType | ''

  // Loan amounts
  loanAmount:       LoanAmountObj
  downPayment:      number | string
  downPaymentType:  DownPaymentType
  interestRate:     InterestRateObj
  noteAmount:       string | number
  cashOutAmount:    number

  // Computed / calculated
  monthlyPayment:           number
  fundingFee:               number
  totalLoanAmount:          number
  taxesInsuranceAssessment: number
  estimatedTotalPayment:    number
  estimatedClosingCost:     number
  estimatedEscrow:          number
  mortgageInsurance:        number | string
  isMIRate:                 boolean
  isClosingCostFinanced:    boolean
  closingCostFinanced:      number

  // Loan features
  balloonPayment:        null | number
  prepaymentPenalty:     null | number
  canIncreaseMonthlyRate: null | boolean

  // Fee sections
  originationCharges: LineItem[]     // Section A
  cannotShopFor:      LineItem[]     // Section B
  canShopFor:         LineItem[]     // Section C
  taxesOtherGovtFees: LineItem[]     // Section E
  otherCost:          LineItem[]     // Section H (usually empty)
  other:              LineItem[]     // Misc

  // Credits
  otherCredits:        OtherCredits

  // Insurance / escrow
  estimateIncludes:    EstimateIncludes
  prepaids:            Prepaids
  escrowPayment:       EscrowPayment
  estimateCashToClose: EstimateCashToClose
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface ValidationResult {
  errors:   Record<string, string>
  warnings: Record<string, string>
}

// ─── Closing Cost Totals ──────────────────────────────────────────────────────

export interface ClosingCostTotals {
  sectionA: number   // Origination Charges
  sectionB: number   // Services Cannot Shop
  sectionC: number   // Services Can Shop
  sectionD: number   // Total Loan Costs (A+B+C)
  sectionE: number   // Taxes & Gov Fees
  sectionF: number   // Prepaids
  sectionG: number   // Initial Escrow
  sectionH: number   // Other (always 0 in V1)
  sectionI: number   // Total Other Costs (E+F+G+H)
  sectionJ: number   // Total Closing Costs (D+I)
  lenderCredits:    number
  totalClosingCosts: number
  cashToClose:       number
  totalPaidIn5Years:       number
  principalPaidIn5Years:   number
  tip:               number
}
