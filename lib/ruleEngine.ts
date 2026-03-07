// ─── Rule Engine ─────────────────────────────────────────────────────────────
// Interprets rules.ts config to drive field visibility, labels, and validation.

import type { LoanQuote, ValidationResult } from './types'
import { LOAN_TYPE_CONFIG, VALIDATION } from './rules'

// ─── Visibility ──────────────────────────────────────────────────────────────

export function shouldShowField(fieldKey: string, quote: Partial<LoanQuote>): boolean {
  const purposeType   = quote.purpose?.type
  const loanType      = quote.productType?.type
  const isRateLock    = quote.isRateLock

  switch (fieldKey) {
    case 'purchasePrice':
      return purposeType === 'Purchase'
    case 'estimatedPropertyValue':
      return purposeType === 'Refinance'
    case 'refinanceType':
      return purposeType === 'Refinance'
    case 'isClosingCostFinanced':
      return purposeType === 'Refinance'
    case 'vaType':
      return loanType === 'VA'
    case 'rateLock':
      return loanType === 'VA'
    case 'rateLockDate':
      return loanType === 'VA' && isRateLock === true
    case 'fundingFee':
      return loanType ? (LOAN_TYPE_CONFIG[loanType as keyof typeof LOAN_TYPE_CONFIG]?.showFundingFee ?? false) : false
    case 'mortgageInsurance':
      return loanType ? (LOAN_TYPE_CONFIG[loanType as keyof typeof LOAN_TYPE_CONFIG]?.showMI ?? false) : false
    default:
      return true
  }
}

// ─── Labels ──────────────────────────────────────────────────────────────────

export function getFundingFeeLabel(loanType: string, vaType?: string): string {
  if (!loanType) return 'Funding Fee'
  if (loanType === 'VA') {
    if (vaType === 'first_time_use') return 'Funding Fee (2.15 % of Loan Amount)'
    if (vaType === 'subsequent_use') return 'Funding Fee (3.3 % of Loan Amount)'
    return 'Funding Fee (0 % of Loan Amount)'
  }
  return LOAN_TYPE_CONFIG[loanType as keyof typeof LOAN_TYPE_CONFIG]?.fundingFeeLabel ?? 'Funding Fee'
}

export function getPropertyValueLabel(purposeType: string): string {
  return purposeType === 'Refinance' ? 'Estimated Property Value' : 'Purchase Price'
}

// ─── Validation ──────────────────────────────────────────────────────────────

export function validateQuote(quote: Partial<LoanQuote>): ValidationResult {
  const errors: Record<string, string> = {}
  const warnings: Record<string, string> = {}

  const purposeType  = quote.purpose?.type
  const loanType     = quote.productType?.type
  const noteAmt      = Number(quote.noteAmount) || 0
  const downPmt      = Number(quote.downPayment) || 0
  const rateStr      = Number(quote.interestRate?.rate) || 0

  // Required fields
  if (!quote.borrowerName?.trim()) errors.borrowerName = 'Borrower name is required'
  if (!purposeType)                errors.purpose      = 'Purpose is required'
  if (!loanType)                   errors.loanType     = 'Loan type is required'
  if (!quote.loanTerm)             errors.loanTerm     = 'Loan term is required'
  if (!quote.loanProduct)          errors.loanProduct  = 'Product is required'

  if (purposeType === 'Purchase' && noteAmt <= 0) {
    errors.noteAmount = 'Purchase price is required'
  }
  if (purposeType === 'Refinance' && noteAmt <= 0) {
    errors.noteAmount = 'Estimated property value is required'
  }
  if (purposeType === 'Refinance' && !quote.refinanceType) {
    errors.refinanceType = 'Refinance type is required'
  }

  // Down payment
  if (purposeType === 'Purchase') {
    if (downPmt < 0) {
      errors.downPayment = 'Down payment cannot be negative'
    }
    if (downPmt >= noteAmt && noteAmt > 0) {
      errors.downPayment = 'Down payment cannot exceed purchase price'
    }
  }

  // Interest rate (stored as percent string "6.544")
  if (!rateStr || rateStr <= 0) {
    errors.interestRate = 'Interest rate is required'
  } else {
    if (rateStr < VALIDATION.interestRate.min) {
      errors.interestRate = 'Interest rate is too low'
    }
    if (rateStr > VALIDATION.interestRate.max) {
      errors.interestRate = 'Interest rate cannot exceed 25%'
    }
    if (rateStr > VALIDATION.highRateWarningPct) {
      warnings.interestRate = `Rate seems high (${rateStr.toFixed(3)}%) — please confirm`
    }
  }

  // VA-specific
  if (loanType === 'VA' && !quote.VAType) {
    errors.VAType = 'VA Type is required for VA loans'
  }
  if (loanType === 'VA' && quote.isRateLock === true && !quote.rateLockDate) {
    errors.rateLockDate = 'Rate lock date is required'
  }

  // LTV warnings
  const baseLoan = Math.max(0, noteAmt - downPmt)
  const ltv      = noteAmt > 0 ? (baseLoan / noteAmt) * 100 : 0
  if (ltv > VALIDATION.highLTVWarningPct) {
    warnings.downPayment = `LTV is ${ltv.toFixed(1)}% — verify loan program eligibility`
  }
  if (baseLoan > VALIDATION.conformingLoanLimit) {
    warnings.noteAmount = `Loan amount exceeds conforming limit ($${VALIDATION.conformingLoanLimit.toLocaleString()}) — may be jumbo`
  }

  return { errors, warnings }
}

export function validateField(
  fieldKey: string,
  value: unknown,
  quote: Partial<LoanQuote>
): { error?: string; warning?: string } {
  const full = validateQuote({ ...quote, [fieldKey]: value })
  return {
    error: full.errors[fieldKey],
    warning: full.warnings[fieldKey],
  }
}
