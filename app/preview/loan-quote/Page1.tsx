import type { LoanQuote, ClosingCostTotals } from '@/lib/types'
import { formatCurrency, formatDate } from '@/lib/defaults'

interface Props { quote: LoanQuote; totals: ClosingCostTotals }

const LOAN_TYPE_LABELS: Record<string, string> = {
  Conventional: 'Conventional',
  FHA:          'FHA',
  VA:           'VA',
  USDA:         'USDA Rural Development',
}

function Checkbox({ checked }: { checked: boolean }) {
  return <span className="mr-1">{checked ? '☑' : '☐'}</span>
}

export default function Page1({ quote, totals }: Props) {
  const issuedDate  = formatDate(quote.updatedOn || new Date().toISOString())
  const addr        = quote.propertyAddress
  const stateLabel  = addr.state?.code || ''
  const loanType    = quote.productType.type
  const termYears   = Math.round(quote.loanTerm / 12)
  const rateDisplay = `${Number(quote.interestRate.rate).toFixed(3)}%`

  return (
    <div className="page page-1">
      {/* ── Header ── */}
      <div className="header-grid">
        <div>
          <h1 className="doc-title">Loan Quote</h1>
          <table className="header-table">
            <tbody>
              <tr><td className="label">DATE ISSUED</td><td>{issuedDate}</td></tr>
              <tr>
                <td className="label">APPLICANTS</td>
                <td>{quote.borrowerName}{quote.coBorrowerName ? ` / ${quote.coBorrowerName}` : ''}</td>
              </tr>
              <tr>
                <td className="label">PROPERTY</td>
                <td>{addr.city}{stateLabel ? `, ${stateLabel}` : ''}{addr.zip ? ` ${addr.zip}` : ''}</td>
              </tr>
              <tr>
                <td className="label">EST. PROP. VALUE</td>
                <td>{formatCurrency(Number(quote.noteAmount) || 0)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div>
          <table className="header-table">
            <tbody>
              <tr><td className="label">LOAN TERM</td><td>{termYears} years</td></tr>
              <tr>
                <td className="label">PURPOSE</td>
                <td>{quote.purpose.type}</td>
              </tr>
              <tr>
                <td className="label">PRODUCT</td>
                <td>{quote.loanProduct === 'FR' ? 'Fixed Rate' : quote.loanProduct === 'IO' ? 'Interest Only' : quote.loanProduct}</td>
              </tr>
              <tr>
                <td className="label">LOAN TYPE</td>
                <td>
                  {(['Conventional','FHA','VA','USDA'] as const).map(t => (
                    <span key={t} className="mr-3">
                      <Checkbox checked={loanType === t} />
                      {LOAN_TYPE_LABELS[t]}
                    </span>
                  ))}
                </td>
              </tr>
              <tr><td className="label">LOAN ID #</td><td>{quote._id.slice(0, 8).toUpperCase()}</td></tr>
              <tr>
                <td className="label">RATE LOCK</td>
                <td>
                  <Checkbox checked={!quote.isRateLock} />No
                  <span className="ml-3"><Checkbox checked={quote.isRateLock} />Yes</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <hr className="section-rule" />

      {/* ── Loan Terms ── */}
      <table className="data-table">
        <thead>
          <tr>
            <th className="section-header" colSpan={2}>Loan Terms</th>
            <th className="section-header right">Can this amount increase after closing?</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="field-label">Loan Amount</td>
            <td className="field-value">{formatCurrency(quote.totalLoanAmount)}</td>
            <td className="right bold">NO</td>
          </tr>
          <tr>
            <td className="field-label">Interest Rate</td>
            <td className="field-value">{rateDisplay}</td>
            <td className="right bold">NO</td>
          </tr>
          <tr>
            <td className="field-label">
              Monthly Principal &amp; Interest
              <div className="sub-label">See Projected Payments below for your Estimated Total Monthly Payment</div>
            </td>
            <td className="field-value">{formatCurrency(quote.monthlyPayment)}</td>
            <td className="right bold">NO</td>
          </tr>
          <tr>
            <td colSpan={2} />
            <td className="section-subhead right">Does the loan have these features?</td>
          </tr>
          <tr>
            <td className="field-label">Prepayment Penalty</td>
            <td />
            <td className="right bold">{quote.prepaymentPenalty ? 'YES' : 'NO'}</td>
          </tr>
          <tr>
            <td className="field-label">Balloon Payment</td>
            <td />
            <td className="right bold">{quote.balloonPayment ? 'YES' : 'NO'}</td>
          </tr>
        </tbody>
      </table>

      {/* ── Projected Payments ── */}
      <table className="data-table mt-section">
        <thead>
          <tr>
            <th className="section-header">Projected Payments</th>
            <th className="section-header right" colSpan={2}>Years 1–{termYears}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="field-label">Principal &amp; Interest</td>
            <td className="field-value right" colSpan={2}>{formatCurrency(quote.monthlyPayment)}</td>
          </tr>
          <tr>
            <td className="field-label">Mortgage Insurance</td>
            <td className="field-value right" colSpan={2}>{formatCurrency(Number(quote.mortgageInsurance) || 0)}</td>
          </tr>
          <tr>
            <td className="field-label">
              Estimated Escrow
              <div className="sub-label">Amount can increase over time</div>
            </td>
            <td className="field-value right" colSpan={2}>{formatCurrency(quote.estimatedEscrow)}</td>
          </tr>
          <tr className="total-row">
            <td className="field-label bold">Estimated Total Monthly Payment</td>
            <td className="field-value right bold" colSpan={2}>{formatCurrency(quote.estimatedTotalPayment)}</td>
          </tr>

          {/* Taxes & Insurance */}
          <tr>
            <td className="field-label" rowSpan={2}>
              <strong>Estimated Taxes, Insurance &amp; Assessments</strong>
              <div className="sub-label">Amount can increase over time</div>
              <div className="mt-2 bold">{formatCurrency(quote.estimatedEscrow)} <span className="font-normal">a month</span></div>
            </td>
            <td colSpan={2}>
              <div className="escrow-grid">
                <span className="escrow-label">This estimate includes</span>
                <span className="escrow-label right">In escrow?</span>
                {/* Property Taxes */}
                <span>
                  <Checkbox checked={quote.estimateIncludes.propertyTaxesInfo.propertyTaxes} />
                  Property Taxes
                </span>
                <span className="right">
                  {quote.estimateIncludes.propertyTaxesInfo.propertyTaxes && quote.estimateIncludes.propertyTaxesInfo.inEscrow ? 'YES' : ''}
                </span>
                {/* Homeowner's Insurance */}
                <span>
                  <Checkbox checked={quote.estimateIncludes.homeOwnerInsuranceInfo.homeOwnerInsurance} />
                  Homeowner&apos;s Insurance
                </span>
                <span className="right">
                  {quote.estimateIncludes.homeOwnerInsuranceInfo.homeOwnerInsurance && quote.estimateIncludes.homeOwnerInsuranceInfo.inEscrow ? 'YES' : ''}
                </span>
                {/* Flood Insurance */}
                <span>
                  <Checkbox checked={quote.estimateIncludes.floodInsuranceInfo.floodInsurance} />
                  Flood Insurance
                </span>
                <span className="right">
                  {quote.estimateIncludes.floodInsuranceInfo.floodInsurance && quote.estimateIncludes.floodInsuranceInfo.inEscrow ? 'YES' : ''}
                </span>
                {/* HOA */}
                <span>
                  <Checkbox checked={quote.estimateIncludes.HOAInsuranceInfo.HOAInsurance} />
                  HOA Insurance
                </span>
                <span className="right">
                  {quote.estimateIncludes.HOAInsuranceInfo.HOAInsurance && quote.estimateIncludes.HOAInsuranceInfo.inEscrow ? 'YES' : ''}
                </span>
                <span className="escrow-note" style={{ gridColumn: '1/-1', fontSize: '8pt', color: '#666', marginTop: 4 }}>
                  See Section G on page 2 for escrowed property costs.
                </span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ── Costs at Closing ── */}
      <table className="data-table mt-section">
        <thead>
          <tr><th className="section-header" colSpan={3}>Costs at Closing</th></tr>
        </thead>
        <tbody>
          <tr>
            <td className="field-label">Estimated Closing Costs</td>
            <td className="field-value">{formatCurrency(totals.totalClosingCosts)}</td>
            <td className="sub-label">
              Includes {formatCurrency(totals.sectionD)} in Loan Costs + {formatCurrency(totals.sectionI)} in Other Costs − {formatCurrency(totals.lenderCredits)} in Lender Credits. See page 2 for details.
            </td>
          </tr>
          <tr>
            <td className="field-label">Estimated Cash to Close</td>
            <td className="field-value">{formatCurrency(totals.cashToClose)}</td>
            <td className="sub-label">Includes Closing Costs. See Calculating Cash to Close on page 2 for details.</td>
          </tr>
        </tbody>
      </table>

      <div className="page-footer">
        LOAN QUOTE &nbsp;&nbsp; PAGE 1 OF 3 • LOAN ID # {quote._id.slice(0, 8).toUpperCase()}
      </div>
    </div>
  )
}
