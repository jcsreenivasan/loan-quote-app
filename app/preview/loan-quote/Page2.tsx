import type { LoanQuote, ClosingCostTotals } from '@/lib/types'
import { formatCurrency } from '@/lib/defaults'

interface Props { quote: LoanQuote; totals: ClosingCostTotals }

function SectionHeader({ label, total }: { label: string; total: number }) {
  return (
    <tr className="section-header-row">
      <td className="section-label">{label}</td>
      <td className="amount-col bold">{formatCurrency(total)}</td>
    </tr>
  )
}

function LineRow({ label, amount }: { label: string; amount: number }) {
  return (
    <tr>
      <td className="item-label">{label}</td>
      <td className="amount-col">{formatCurrency(amount)}</td>
    </tr>
  )
}

export default function Page2({ quote, totals }: Props) {
  const ei        = quote.estimateIncludes
  const prepaids  = quote.prepaids
  const escrow    = quote.escrowPayment
  const monthlyMI = Number(quote.mortgageInsurance) || 0

  // Monthly amounts from estimateIncludes
  const hoMonthly    = Number(ei.homeOwnerInsuranceInfo.amount) / 12
  const floodMonthly = Number(ei.floodInsuranceInfo.amount) / 12
  const taxMonthly   = Number(ei.propertyTaxesInfo.amount) / 12

  // Prepaid totals
  const hoPrepaidTotal    = hoMonthly * Number(prepaids.homeOwnerInsurance.period)
  const floodPrepaidTotal = floodMonthly * Number(prepaids.floodInsurance.period)
  const miPrepaidTotal    = monthlyMI * Number(prepaids.mortgageInsurance.period)
  const taxPrepaidTotal   = taxMonthly * Number(prepaids.propertyTaxes.period)
  const interestTotal     = prepaids.prepaidInterest.interestRate * Number(prepaids.prepaidInterest.period)

  // Escrow totals
  const hoEscrowTotal    = hoMonthly * Number(escrow.homeOwnerInsurance.period)
  const floodEscrowTotal = floodMonthly * Number(escrow.floodInsurance.period)
  const miEscrowTotal    = monthlyMI * Number(escrow.mortgageInsurance.period)
  const taxEscrowTotal   = taxMonthly * Number(escrow.propertyTaxes.period)

  const noteAmt = Number(quote.noteAmount) || 0

  return (
    <div className="page page-2">
      <h2 className="page-section-title">Closing Cost Details</h2>

      <div className="two-col-grid">
        {/* ── LEFT: Loan Costs ── */}
        <div>
          <table className="cost-table">
            <tbody>
              <tr><td colSpan={2} className="col-header">Loan Costs</td></tr>

              <SectionHeader label="A. Origination Charges" total={totals.sectionA} />
              {quote.originationCharges.map(i => (
                <LineRow key={i._id} label={i.type || ''} amount={i.amount} />
              ))}

              <tr><td colSpan={2} style={{ paddingTop: 12 }} /></tr>

              <SectionHeader label="B. Services You Cannot Shop For" total={totals.sectionB} />
              {quote.cannotShopFor.map(i => (
                <LineRow key={i._id} label={i.type || ''} amount={i.amount} />
              ))}

              <tr><td colSpan={2} style={{ paddingTop: 12 }} /></tr>

              <SectionHeader label="C. Services You Can Shop For" total={totals.sectionC} />
              {quote.canShopFor.map(i => (
                <LineRow key={i._id} label={i.type || ''} amount={i.amount} />
              ))}

              <tr><td colSpan={2} style={{ paddingTop: 12 }} /></tr>

              <tr className="grand-total-row">
                <td className="bold">D. TOTAL LOAN COSTS (A + B + C)</td>
                <td className="amount-col bold">{formatCurrency(totals.sectionD)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ── RIGHT: Other Costs ── */}
        <div>
          <table className="cost-table">
            <tbody>
              <tr><td colSpan={2} className="col-header">Other Costs</td></tr>

              <SectionHeader label="E. Taxes and Other Government Fees" total={totals.sectionE} />
              {quote.taxesOtherGovtFees.map(i => (
                <LineRow key={i._id} label={i.type || ''} amount={i.amount} />
              ))}

              <tr><td colSpan={2} style={{ paddingTop: 12 }} /></tr>

              <SectionHeader label="F. Prepaids" total={totals.sectionF} />
              <LineRow
                label={`Homeowner's Insurance ( ${Number(prepaids.homeOwnerInsurance.period)} months )`}
                amount={hoPrepaidTotal}
              />
              <LineRow
                label={`Mortgage Insurance ( ${Number(prepaids.mortgageInsurance.period)} months )`}
                amount={miPrepaidTotal}
              />
              <LineRow
                label={`Flood Insurance ( ${Number(prepaids.floodInsurance.period)} months )`}
                amount={floodPrepaidTotal}
              />
              <LineRow
                label={`Prepaid Interest ( $${prepaids.prepaidInterest.interestRate.toFixed(2)}/day for ${Number(prepaids.prepaidInterest.period)} days @ ${Number(quote.interestRate.rate).toFixed(3)}% )`}
                amount={interestTotal}
              />
              <LineRow
                label={`Property Taxes ( ${Number(prepaids.propertyTaxes.period)} months )`}
                amount={taxPrepaidTotal}
              />

              <tr><td colSpan={2} style={{ paddingTop: 12 }} /></tr>

              <SectionHeader label="G. Initial Escrow Payment at Closing" total={totals.sectionG} />
              <LineRow
                label={`Homeowner's Insurance ( ${formatCurrency(hoMonthly)}/mo × ${Number(escrow.homeOwnerInsurance.period)} mo. )`}
                amount={hoEscrowTotal}
              />
              <LineRow
                label={`Mortgage Insurance ( ${formatCurrency(monthlyMI)}/mo × ${Number(escrow.mortgageInsurance.period)} mo. )`}
                amount={miEscrowTotal}
              />
              <LineRow
                label={`Flood Insurance ( ${formatCurrency(floodMonthly)}/mo × ${Number(escrow.floodInsurance.period)} mo. )`}
                amount={floodEscrowTotal}
              />
              <LineRow
                label={`Property Taxes ( ${formatCurrency(taxMonthly)}/mo × ${Number(escrow.propertyTaxes.period)} mo. )`}
                amount={taxEscrowTotal}
              />

              <tr><td colSpan={2} style={{ paddingTop: 12 }} /></tr>
              <SectionHeader label="H. Other" total={0} />

              <tr><td colSpan={2} style={{ paddingTop: 12 }} /></tr>
              <tr className="grand-total-row">
                <td className="bold">I. TOTAL OTHER COSTS (E + F + G + H)</td>
                <td className="amount-col bold">{formatCurrency(totals.sectionI)}</td>
              </tr>

              <tr><td colSpan={2} style={{ paddingTop: 16 }} /></tr>

              {/* J */}
              <tr className="grand-total-row">
                <td className="bold">J. TOTAL CLOSING COSTS</td>
                <td />
              </tr>
              <tr>
                <td className="item-label">D + I</td>
                <td className="amount-col">{formatCurrency(totals.sectionJ)}</td>
              </tr>
              <tr>
                <td className="item-label">Lender Credits</td>
                <td className="amount-col">−{formatCurrency(totals.lenderCredits)}</td>
              </tr>

              <tr><td colSpan={2} style={{ paddingTop: 16 }} /></tr>

              {/* Cash to Close box */}
              <tr>
                <td colSpan={2}>
                  <table className="cash-to-close-box">
                    <thead>
                      <tr><th colSpan={2} className="ctc-header">Calculating Cash to Close</th></tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Total Closing Costs (J)</td>
                        <td className="amount-col">{formatCurrency(totals.sectionJ)}</td>
                      </tr>
                      <tr>
                        <td>Estimated Total Payoffs and Payments</td>
                        <td className="amount-col">
                          {formatCurrency(quote.purpose.type === 'Refinance' ? noteAmt : 0)}
                        </td>
                      </tr>
                      <tr>
                        <td>Total Loan Amount</td>
                        <td className="amount-col">{formatCurrency(quote.totalLoanAmount)}</td>
                      </tr>
                      <tr>
                        <td>Estimated Cash to Close (From) Borrower</td>
                        <td className="amount-col">{formatCurrency(totals.cashToClose)}</td>
                      </tr>
                      <tr>
                        <td>Total Closing Costs Financed</td>
                        <td className="amount-col">
                          {formatCurrency(quote.isClosingCostFinanced ? totals.totalClosingCosts : 0)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="page-footer">
        LOAN QUOTE &nbsp;&nbsp; PAGE 2 OF 3 • LOAN ID # {quote._id.slice(0, 8).toUpperCase()}
      </div>
    </div>
  )
}
