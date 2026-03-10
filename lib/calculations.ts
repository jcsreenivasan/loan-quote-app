// ─── Calculation Engine ──────────────────────────────────────────────────────
// Pure functions only — no React, no UI, no side effects.

import type { LoanQuote, LineItem, ClosingCostTotals, Prepaids, EscrowPayment, EstimateIncludes } from './types'
import { VA_FUNDING_FEE_TABLE, FLAT_FUNDING_FEES } from './rules'

// ─── Loan Amounts ────────────────────────────────────────────────────────────

export function calcBaseLoanAmount(
  propertyValue: number,
  downPayment: number
): number {
  return Math.max(0, propertyValue - downPayment)
}

export function calcFundingFeeRate(
  loanProductType: string,   // 'Conventional' | 'FHA' | 'VA' | 'USDA'
  vaType: string,            // 'first_time_use' | 'subsequent_use' | 'exempt'
  downPaymentPct: number
): number {
  if (loanProductType === 'VA') {
    const table = VA_FUNDING_FEE_TABLE[vaType] ?? VA_FUNDING_FEE_TABLE.exempt
    const row = table.find(
      (r) => downPaymentPct >= r.minDownPct && downPaymentPct <= r.maxDownPct
    )
    return row?.rate ?? 0
  }
  return FLAT_FUNDING_FEES[loanProductType as keyof typeof FLAT_FUNDING_FEES] ?? 0
}

export function calcFundingFeeAmount(baseLoanAmount: number, rate: number): number {
  return baseLoanAmount * rate
}

export function calcTotalLoanAmount(baseLoanAmount: number, fundingFeeAmount: number): number {
  return baseLoanAmount + fundingFeeAmount
}

// ─── Monthly Payment ─────────────────────────────────────────────────────────

export function calcMonthlyPI(
  totalLoanAmount: number,
  annualRate: number,
  termMonths: number          // stored in months (e.g. 360 for 30yr)
): number {
  if (totalLoanAmount <= 0 || annualRate <= 0 || termMonths <= 0) return 0
  const r = annualRate / 12
  const n = termMonths
  return totalLoanAmount * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
}

export function calcEstimatedEscrow(ei: EstimateIncludes): number {
  const monthly = (amount: number | string, included: boolean, inEscrow: boolean) =>
    included && inEscrow ? Number(amount) / 12 : 0

  return (
    monthly(ei.propertyTaxesInfo.amount,      ei.propertyTaxesInfo.propertyTaxes,           ei.propertyTaxesInfo.inEscrow) +
    monthly(ei.homeOwnerInsuranceInfo.amount,  ei.homeOwnerInsuranceInfo.homeOwnerInsurance, ei.homeOwnerInsuranceInfo.inEscrow) +
    monthly(ei.floodInsuranceInfo.amount,      ei.floodInsuranceInfo.floodInsurance,         ei.floodInsuranceInfo.inEscrow) +
    monthly(ei.HOAInsuranceInfo.amount,        ei.HOAInsuranceInfo.HOAInsurance,             ei.HOAInsuranceInfo.inEscrow)
  )
}

// ─── Closing Cost Section Totals ─────────────────────────────────────────────

function sumItems(items: LineItem[]): number {
  return items.reduce((s, i) => s + (i.amount || 0), 0)
}

export function calcSectionA(originationCharges: LineItem[]): number {
  return sumItems(originationCharges)
}

export function calcSectionB(cannotShopFor: LineItem[]): number {
  return sumItems(cannotShopFor)
}

export function calcSectionC(canShopFor: LineItem[]): number {
  return sumItems(canShopFor)
}

export function calcSectionD(a: number, b: number, c: number): number {
  return a + b + c
}

export function calcSectionE(taxesOtherGovtFees: LineItem[]): number {
  return sumItems(taxesOtherGovtFees)
}

export function calcSectionF(
  prepaids: Prepaids,
  ei: EstimateIncludes,
  monthlyMI: number
): number {
  const hoMonthly    = Number(ei.homeOwnerInsuranceInfo.amount) / 12
  const floodMonthly = Number(ei.floodInsuranceInfo.amount) / 12
  const taxMonthly   = Number(ei.propertyTaxesInfo.amount) / 12

  return (
    hoMonthly    * Number(prepaids.homeOwnerInsurance.period) +
    floodMonthly * Number(prepaids.floodInsurance.period) +
    monthlyMI    * Number(prepaids.mortgageInsurance.period) +
    taxMonthly   * Number(prepaids.propertyTaxes.period) +
    prepaids.prepaidInterest.interestRate * Number(prepaids.prepaidInterest.period)
  )
}

export function calcSectionG(
  escrow: EscrowPayment,
  ei: EstimateIncludes,
  monthlyMI: number
): number {
  const hoMonthly    = Number(ei.homeOwnerInsuranceInfo.amount) / 12
  const floodMonthly = Number(ei.floodInsuranceInfo.amount) / 12
  const taxMonthly   = Number(ei.propertyTaxesInfo.amount) / 12

  return (
    hoMonthly    * Number(escrow.homeOwnerInsurance.period) +
    floodMonthly * Number(escrow.floodInsurance.period) +
    monthlyMI    * Number(escrow.mortgageInsurance.period) +
    taxMonthly   * Number(escrow.propertyTaxes.period)
  )
}

export function calcSectionI(e: number, f: number, g: number): number {
  return e + f + g  // Section H is always 0
}

export function calcSectionJ(d: number, i: number): number {
  return d + i
}

export function calcTotalClosingCosts(j: number, lenderCredits: number): number {
  return j - lenderCredits
}

// ─── Cash to Close ───────────────────────────────────────────────────────────

export function calcCashToClose(
  purposeType: string,       // 'Purchase' | 'Refinance'
  downPayment: number,
  sellerCredits: number,
  totalClosingCosts: number,
  noteAmount: number,
  totalLoanAmount: number
): number {
  if (purposeType === 'Purchase') {
    return downPayment + totalClosingCosts - sellerCredits
  }
  // Refinance: payoffs (noteAmount as approximate payoff) − new loan + costs
  return totalClosingCosts + noteAmount - totalLoanAmount
}

// ─── Prepaid Interest ────────────────────────────────────────────────────────

export function calcPrepaidInterestPerDay(
  loanAmount: number,
  annualRate: number,
  daysInYear = 365
): number {
  return (loanAmount * annualRate) / daysInYear
}

// ─── Comparisons (Page 3) ────────────────────────────────────────────────────

export function calcTotalPaidIn5Years(
  monthlyPI: number,
  monthlyMI: number,
  totalLoanCosts: number
): number {
  return 60 * (monthlyPI + monthlyMI) + totalLoanCosts
}

export function calcPrincipalPaidIn5Years(
  totalLoanAmount: number,
  annualRate: number,
  termMonths: number
): number {
  if (totalLoanAmount <= 0 || annualRate <= 0 || termMonths <= 0) return 0
  const r = annualRate / 12
  const n = termMonths
  const payment = totalLoanAmount * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
  let balance = totalLoanAmount
  for (let month = 1; month <= 60; month++) {
    const interestPayment = balance * r
    const principalPayment = payment - interestPayment
    balance -= principalPayment
  }
  return totalLoanAmount - balance
}

export function calcTIP(
  totalLoanAmount: number,
  annualRate: number,
  termMonths: number,
  monthlyMI: number
): number {
  if (totalLoanAmount <= 0 || annualRate <= 0) return 0
  const monthlyPI = calcMonthlyPI(totalLoanAmount, annualRate, termMonths)
  const totalInterest = monthlyPI * termMonths - totalLoanAmount + monthlyMI * termMonths
  return (totalInterest / totalLoanAmount) * 100
}

// ─── Estimated APR ───────────────────────────────────────────────────────────

export function calcEstimatedAPR(
  totalLoanAmount: number,
  financedFees: number,
  monthlyPayment: number,
  termMonths: number
): number {
  if (totalLoanAmount <= 0 || monthlyPayment <= 0 || termMonths <= 0) return 0
  const netProceeds = totalLoanAmount - financedFees

  let r = monthlyPayment / totalLoanAmount
  for (let i = 0; i < 1000; i++) {
    const pv = monthlyPayment * (1 - Math.pow(1 + r, -termMonths)) / r
    const derivative = monthlyPayment * (
      -(termMonths) * Math.pow(1 + r, -termMonths - 1) / r -
      (1 - Math.pow(1 + r, -termMonths)) / (r * r)
    )
    const rNext = r - (pv - netProceeds) / derivative
    if (Math.abs(rNext - r) < 1e-10) { r = rNext; break }
    r = rNext
  }
  return r * 12
}

// ─── Full Quote Recalculation ─────────────────────────────────────────────────

export function recalculateQuote(quote: LoanQuote): LoanQuote {
  const q = { ...quote }

  // Interest rate: stored as percent string "6.544" → decimal for calcs
  const annualRate = Number(q.interestRate.rate) / 100
  const noteAmt    = Number(q.noteAmount) || 0
  const downPmt    = Number(q.downPayment) || 0

  // Base loan amount
  // When noteAmount (Purchase Price / Property Value) is provided, derive baseLoan
  // from it. Otherwise respect whatever the user typed into loanAmount.amount directly.
  const baseLoan = noteAmt > 0
    ? calcBaseLoanAmount(noteAmt, downPmt)
    : Number(q.loanAmount.amount) || 0
  q.loanAmount = { ...q.loanAmount, amount: baseLoan }

  // Funding fee
  const downPct = noteAmt > 0 ? (downPmt / noteAmt) * 100 : 0
  const ffRate  = calcFundingFeeRate(q.productType.type, q.VAType, downPct)
  q.fundingFee  = calcFundingFeeAmount(baseLoan, ffRate)

  // Total loan amount
  q.totalLoanAmount = calcTotalLoanAmount(baseLoan, q.fundingFee)

  // Monthly P&I
  q.monthlyPayment = calcMonthlyPI(q.totalLoanAmount, annualRate, q.loanTerm)

  // Mortgage insurance (stored as monthly dollar amount; user enters it directly)
  const monthlyMI = Number(q.mortgageInsurance) || 0

  // Estimated escrow from tax/insurance items
  q.estimatedEscrow        = calcEstimatedEscrow(q.estimateIncludes)
  q.taxesInsuranceAssessment = q.estimatedEscrow

  // Total monthly payment
  q.estimatedTotalPayment = q.monthlyPayment + monthlyMI + q.estimatedEscrow

  return q
}

// ─── Compute All Totals ───────────────────────────────────────────────────────

export function computeClosingCostTotals(quote: LoanQuote): ClosingCostTotals {
  const sectionA = calcSectionA(quote.originationCharges)
  const sectionB = calcSectionB(quote.cannotShopFor)
  const sectionC = calcSectionC(quote.canShopFor)
  const sectionD = calcSectionD(sectionA, sectionB, sectionC)

  const sectionE = calcSectionE(quote.taxesOtherGovtFees)

  const monthlyMI = Number(quote.mortgageInsurance) || 0

  const sectionF = calcSectionF(quote.prepaids, quote.estimateIncludes, monthlyMI)
  const sectionG = calcSectionG(quote.escrowPayment, quote.estimateIncludes, monthlyMI)

  const sectionI = calcSectionI(sectionE, sectionF, sectionG)
  const sectionJ = calcSectionJ(sectionD, sectionI)

  const lenderCredits  = quote.otherCredits.lenderCredits
  const totalClosingCosts = calcTotalClosingCosts(sectionJ, lenderCredits)

  const noteAmt = Number(quote.noteAmount) || 0
  const cashToClose = calcCashToClose(
    quote.purpose.type,
    Number(quote.downPayment) || 0,
    quote.otherCredits.sellerCredits,
    totalClosingCosts,
    noteAmt,
    quote.totalLoanAmount
  )

  const annualRate = Number(quote.interestRate.rate) / 100
  const totalPaidIn5Years    = calcTotalPaidIn5Years(quote.monthlyPayment, monthlyMI, sectionD)
  const principalPaidIn5Years = calcPrincipalPaidIn5Years(quote.totalLoanAmount, annualRate, quote.loanTerm)
  const tip                   = calcTIP(quote.totalLoanAmount, annualRate, quote.loanTerm, monthlyMI)

  return {
    sectionA, sectionB, sectionC, sectionD,
    sectionE, sectionF, sectionG, sectionH: 0,
    sectionI, sectionJ, lenderCredits,
    totalClosingCosts, cashToClose,
    totalPaidIn5Years, principalPaidIn5Years, tip,
  }
}
