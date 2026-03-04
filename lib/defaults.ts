// ─── Default Quote State ──────────────────────────────────────────────────────

import { v4 as uuidv4 } from 'uuid'
import type { LoanQuote } from './types'
import {
  DEFAULT_ORIGINATION_CHARGES,
  DEFAULT_CANNOT_SHOP,
  DEFAULT_CAN_SHOP,
  DEFAULT_TAXES_GOVT_FEES,
} from './rules'
import { BRAND } from './brand'

function nid(): string { return uuidv4() }

export function createDefaultQuote(): LoanQuote {
  const now = new Date().toISOString()

  return {
    _id: nid(),
    fileId: '',
    createdOn: now,
    updatedOn: now,
    updatedBy: '',
    configurationID: '',
    status: null,

    borrowerName: '',
    borrowerEmail: '',
    borrowerPhone: '',
    coBorrowerName: '',
    loanOfficerName: BRAND.loanOfficerName,
    loanOfficerNMLS: BRAND.loanOfficerNMLS,
    loanOfficerEmail: BRAND.loanOfficerEmail,
    loanOfficerPhone: BRAND.loanOfficerPhone,

    propertyAddress: {
      street: '',
      unit: '',
      unitType: '',
      city: '',
      zip: '',
      state: null,
      county: '',
      country: 'US',
      numberOfUnits: '1',
    },

    purpose: { type: 'Purchase', _id: nid() },
    productType: { type: 'Conventional', _id: nid() },
    loanProduct: 'FR',
    loanTerm: 360,
    isRateLock: false,
    rateLockDate: null,
    rateLockTime: null,
    VAType: 'first_time_use',
    refinanceType: '',

    loanAmount: { amount: 0, _id: nid() },
    downPayment: 0,
    downPaymentType: 'doller',
    interestRate: { rate: '0', _id: nid() },
    noteAmount: 0,
    cashOutAmount: 0,

    monthlyPayment: 0,
    fundingFee: 0,
    totalLoanAmount: 0,
    taxesInsuranceAssessment: 0,
    estimatedTotalPayment: 0,
    estimatedClosingCost: 0,
    estimatedEscrow: 0,
    mortgageInsurance: 0,
    isMIRate: false,
    isClosingCostFinanced: false,
    closingCostFinanced: 0,

    balloonPayment: null,
    prepaymentPenalty: null,
    canIncreaseMonthlyRate: null,

    originationCharges: DEFAULT_ORIGINATION_CHARGES.map(i => ({ ...i, _id: nid() })),
    cannotShopFor:       DEFAULT_CANNOT_SHOP.map(i => ({ ...i, _id: nid() })),
    canShopFor:          DEFAULT_CAN_SHOP.map(i => ({ ...i, _id: nid() })),
    taxesOtherGovtFees:  DEFAULT_TAXES_GOVT_FEES.map(i => ({ ...i, _id: nid() })),
    otherCost: [],
    other: [],

    otherCredits: {
      lenderCredits:    0,
      sellerCredits:    0,
      fundsForBorrower: 0,
      _id: nid(),
    },

    estimateIncludes: {
      propertyTaxesInfo:      { propertyTaxes:     true,  amount: 0, inEscrow: true,  isAmountLocked: false, _id: nid() },
      homeOwnerInsuranceInfo: { homeOwnerInsurance: true,  amount: 0, inEscrow: true,  isAmountLocked: false, _id: nid() },
      floodInsuranceInfo:     { floodInsurance:     false, amount: 0, inEscrow: false, isAmountLocked: false, _id: nid() },
      HOAInsuranceInfo:       { HOAInsurance:       false, amount: 0, inEscrow: false, isAmountLocked: false, _id: nid() },
      other:                  { other:              false, amount: 0,                  isAmountLocked: false, _id: nid() },
      _id: nid(),
    },

    prepaids: {
      homeOwnerInsurance: { period: 0, _id: nid() },
      floodInsurance:     { period: 0, _id: nid() },
      mortgageInsurance:  { period: 0, _id: nid() },
      propertyTaxes:      { period: 0, _id: nid() },
      prepaidInterest:    { period: 0, interestRate: 0, _id: nid() },
      _id: nid(),
    },

    escrowPayment: {
      homeOwnerInsurance: { period: 0, _id: nid() },
      floodInsurance:     { period: 0, _id: nid() },
      mortgageInsurance:  { period: 0, _id: nid() },
      propertyTaxes:      { period: 0, _id: nid() },
      _id: nid(),
    },

    estimateCashToClose: {
      closingCostFinanced: 0,
      _id: nid(),
    },
  }
}

// ─── localStorage Helpers ────────────────────────────────────────────────────

const STORAGE_KEY = 'loan_quote_v2'

export function saveQuote(quote: LoanQuote): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...quote, updatedOn: new Date().toISOString() }))
}

export function loadQuote(): LoanQuote | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearQuote(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}

// ─── Formatters ──────────────────────────────────────────────────────────────

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value || 0)
}

export function formatPercent(value: number, decimals = 3): string {
  return `${(value).toFixed(decimals)}%`
}

export function formatDate(iso: string): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', {
    month: '2-digit', day: '2-digit', year: 'numeric',
  })
}
