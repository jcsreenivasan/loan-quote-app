// ─── Config-Driven Rules ─────────────────────────────────────────────────────
// All business logic lives here. UI components read from this file only.
// To change fee defaults, rates, or behavior — edit this file, not components.

import type { LoanProductType, LineItem } from './types'

// ─── VA Funding Fee Table ────────────────────────────────────────────────────

export interface VAFeeRow {
  minDownPct: number
  maxDownPct: number
  rate: number
}

export const VA_FUNDING_FEE_TABLE: Record<string, VAFeeRow[]> = {
  first_time_use: [
    { minDownPct: 0,   maxDownPct: 4.99,  rate: 0.0215 },
    { minDownPct: 5,   maxDownPct: 9.99,  rate: 0.015  },
    { minDownPct: 10,  maxDownPct: 100,   rate: 0.0125 },
  ],
  subsequent_use: [
    { minDownPct: 0,   maxDownPct: 4.99,  rate: 0.033  },
    { minDownPct: 5,   maxDownPct: 9.99,  rate: 0.015  },
    { minDownPct: 10,  maxDownPct: 100,   rate: 0.0125 },
  ],
  exempt: [
    { minDownPct: 0,   maxDownPct: 100,   rate: 0      },
  ],
}

export const FLAT_FUNDING_FEES: Partial<Record<LoanProductType, number>> = {
  FHA:          0.0175,
  USDA:         0.01,
  Conventional: 0,
}

// ─── Loan Type Behavior ──────────────────────────────────────────────────────

export interface LoanTypeBehavior {
  showFundingFee: boolean
  fundingFeeLabel: string | null
  showMI: boolean
  showVAFields: boolean
}

export const LOAN_TYPE_CONFIG: Partial<Record<LoanProductType, LoanTypeBehavior>> = {
  Conventional: {
    showFundingFee:  false,
    fundingFeeLabel: null,
    showMI:          true,
    showVAFields:    false,
  },
  FHA: {
    showFundingFee:  true,
    fundingFeeLabel: 'Funding Fee (1.75% of Loan Amount)',
    showMI:          true,
    showVAFields:    false,
  },
  VA: {
    showFundingFee:  true,
    fundingFeeLabel: 'VA Funding Fee',
    showMI:          false,
    showVAFields:    true,
  },
  USDA: {
    showFundingFee:  true,
    fundingFeeLabel: 'Funding Fee (1% of Loan Amount)',
    showMI:          false,
    showVAFields:    false,
  },
}

// ─── Default Line Items ──────────────────────────────────────────────────────
// _id is assigned in createDefaultQuote(); use placeholder here.

export const DEFAULT_ORIGINATION_CHARGES: Omit<LineItem, '_id'>[] = [
  { type: 'Underwriting Fee', amount: 1075, isAmountLockOpen: false },
]

export const DEFAULT_CANNOT_SHOP: Omit<LineItem, '_id'>[] = [
  { type: 'Mortgage Insurance Premium',  amount: 0,   isAmountLockOpen: false },
  { type: 'Appraisal Fee',               amount: 635, isAmountLockOpen: false },
  { type: 'Flood Certification Fee',     amount: 7,   isAmountLockOpen: false },
  { type: 'Tax Monitoring Fee',          amount: 86,  isAmountLockOpen: false },
  { type: 'Undisclosed Debt Monitoring', amount: 7,   isAmountLockOpen: false },
  { type: 'Credit Report Fee',           amount: 160, isAmountLockOpen: false },
  { type: 'VOE Fee',                     amount: 209, isAmountLockOpen: false },
]

export const DEFAULT_CAN_SHOP: Omit<LineItem, '_id'>[] = [
  { type: 'Aggregated Title Fees', amount: 0, isAmountLockOpen: false },
]

export const DEFAULT_TAXES_GOVT_FEES: Omit<LineItem, '_id'>[] = [
  { type: 'Recording Fee — Mortgage', amount: 64, isAmountLockOpen: false },
]

// ─── APR Fee Rules ───────────────────────────────────────────────────────────

export type APRInclusion = 'include' | 'exclude'

export const APR_FEE_RULES: Record<string, APRInclusion> = {
  originationCharges:        'include',
  fundingFee:                'include',
  mortgageInsurancePremium:  'include',
  lenderCredits:             'include',
  appraisalFee:              'exclude',
  titleInsurance:            'exclude',
  floodCertificationFee:     'exclude',
  taxMonitoringFee:          'exclude',
  propertyTaxes:             'exclude',
  homeownersInsurance:       'exclude',
  sellerCredits:             'exclude',
  recordingFees:             'exclude',
  prepaidInterest:           'exclude',
}

// ─── Validation Bounds ───────────────────────────────────────────────────────

export const VALIDATION = {
  purchasePrice:       { min: 1,     max: 50_000_000 },
  downPayment:         { min: 0,     max: 50_000_000 },
  interestRate:        { min: 0.1,   max: 25 },         // percent (stored as string "6.544")
  allFeeAmounts:       { min: 0,     max: 999_999 },
  conformingLoanLimit: 806_500,
  highLTVWarningPct:   97,
  highRateWarningPct:  12,
}

// ─── Dropdown Options ────────────────────────────────────────────────────────

export const US_STATES: { value: string; label: string }[] = [
  { value: 'AL', label: 'Alabama' },         { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },         { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },      { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },     { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },         { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },          { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },        { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },            { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },        { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },           { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },   { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },       { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },        { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },        { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },   { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },      { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },            { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },          { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },    { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },    { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },           { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },         { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },      { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },       { value: 'WY', label: 'Wyoming' },
  { value: 'DC', label: 'District of Columbia' },
]

// Loan terms: value = months stored, label = display
export const LOAN_TERMS: { value: number; label: string }[] = [
  { value: 120, label: '10 years' },
  { value: 180, label: '15 years' },
  { value: 240, label: '20 years' },
  { value: 300, label: '25 years' },
  { value: 360, label: '30 years' },
]

export const PRODUCTS: { value: string; label: string }[] = [
  { value: 'FR',  label: 'Fixed Rate' },
  { value: 'ARM', label: 'ARM' },
  { value: 'IO',  label: 'Interest Only' },
]

export const REFINANCE_TYPES: { value: string; label: string }[] = [
  { value: 'CashOut',   label: 'Cash Out' },
  { value: 'NoCashOut', label: 'No Cash Out' },
]

export const ORIGINATION_CHARGE_TYPES = [
  'Origination Fee',
  'Discount Points',
  'Processing Fee',
  'Underwriting Fee',
  'Admin Fee',
  'Other',
]

export const SERVICE_TYPES = [
  'Title Service',
  'Settlement Service',
  'Inspection',
  'Survey',
  'Other',
]

export const CANNOT_SHOP_TYPES = [
  'Mortgage Insurance Premium',
  'Appraisal Fee',
  'Flood Certification Fee',
  'Tax Monitoring Fee',
  'Undisclosed Debt Monitoring',
  'Credit Report Fee',
  'VOE Fee',
  'Other',
]

export const GOVT_FEE_TYPES = [
  'Recording Fee — Mortgage',
  'Recording Fee — Deed',
  'Transfer Tax',
  'City/County Tax',
  'State Tax',
  'Stamp Tax',
  'Other',
]
