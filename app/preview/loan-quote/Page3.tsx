import type { LoanQuote, ClosingCostTotals } from '@/lib/types'
import { BRAND } from '@/lib/brand'
import { formatCurrency } from '@/lib/defaults'

interface Props { quote: LoanQuote; totals: ClosingCostTotals }

export default function Page3({ quote, totals }: Props) {
  const tipFormatted = totals.tip.toFixed(2)

  return (
    <div className="page page-3">
      <h2 className="page-section-title">Additional Information About This Loan</h2>

      {/* Lender / Broker two-column */}
      <div className="two-col-grid party-grid">
        <table className="party-table">
          <tbody>
            <tr><td className="party-label">LENDER</td><td>{BRAND.lenderName || '—'}</td></tr>
            <tr><td className="party-label">NMLS / LICENSE ID</td><td>{BRAND.lenderNMLS || '—'}</td></tr>
            <tr><td className="party-label">LOAN OFFICER</td><td></td></tr>
            <tr><td className="party-label">NMLS / LICENSE ID</td><td></td></tr>
            <tr><td className="party-label">EMAIL</td><td></td></tr>
            <tr><td className="party-label">PHONE</td><td></td></tr>
          </tbody>
        </table>
        <table className="party-table">
          <tbody>
            <tr><td className="party-label">MORTGAGE BROKER</td><td>{BRAND.brokerName}</td></tr>
            <tr><td className="party-label">NMLS / CA LICENSE ID</td><td>{BRAND.brokerNMLS}</td></tr>
            <tr><td className="party-label">LOAN OFFICER</td><td>{quote.loanOfficerName}</td></tr>
            <tr><td className="party-label">NMLS / LICENSE ID</td><td>{quote.loanOfficerNMLS}</td></tr>
            <tr><td className="party-label">EMAIL</td><td>{quote.loanOfficerEmail}</td></tr>
            <tr><td className="party-label">PHONE</td><td>{quote.loanOfficerPhone}</td></tr>
          </tbody>
        </table>
      </div>

      {/* Comparisons */}
      <table className="data-table mt-section">
        <thead>
          <tr>
            <th className="section-header">Comparisons</th>
            <th className="section-header" colSpan={2}>Use these measures to compare this loan with other loans.</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="field-label">In 5 Years</td>
            <td>
              <div className="bold">{formatCurrency(totals.totalPaidIn5Years)}</div>
              <div className="sub-label">Total you will have paid in principal, interest, mortgage insurance, and loan costs.</div>
              <div><span className="bold">{formatCurrency(totals.principalPaidIn5Years)}</span> Principal you will have paid off.</div>
            </td>
            <td />
          </tr>
          <tr>
            <td className="field-label">Total Interest Percentage (TIP)</td>
            <td colSpan={2}>
              <span className="bold">{tipFormatted}%</span>
              <span className="sub-label ml-2">The total amount of interest that you will pay over the loan term as a percentage of your loan amount.</span>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Other Considerations */}
      <table className="data-table mt-section">
        <thead>
          <tr><th className="section-header" colSpan={2}>Other Considerations</th></tr>
        </thead>
        <tbody>
          <tr>
            <td className="field-label" style={{ width: '22%' }}>Appraisal</td>
            <td className="sub-label">We may order an appraisal to determine the property&apos;s value and charge you for this appraisal. We will promptly give you a copy of any appraisal, even if your loan does not close. You can pay for an additional appraisal for your own use at your own cost.</td>
          </tr>
          <tr>
            <td className="field-label">Assumption</td>
            <td>
              <div>If you sell or transfer this property to another person, we</div>
              <div>☑ will allow, under certain conditions, this person to assume this loan on the original terms.</div>
              <div>☑ will not allow assumption of this loan on the original terms.</div>
            </td>
          </tr>
          <tr>
            <td className="field-label">Homeowner&apos;s Insurance</td>
            <td className="sub-label">This loan requires homeowner&apos;s insurance on the property, which you may obtain from a company of your choice that we find acceptable.</td>
          </tr>
          <tr>
            <td className="field-label">Late Payment</td>
            <td className="sub-label">
              If your payment is more than {BRAND.lateFeeGraceDays} days late, we will charge a late fee of {(BRAND.lateFeeRate * 100).toFixed(0)}% of the payment.
            </td>
          </tr>
          <tr>
            <td className="field-label">Refinance</td>
            <td className="sub-label">Refinancing this loan will depend on your future financial situation, the property value, and market conditions. You may not be able to refinance this loan.</td>
          </tr>
          <tr>
            <td className="field-label">Servicing</td>
            <td>
              <div>We intend</div>
              <div>☑ to service your loan. If so, you will make your payments to us.</div>
              <div>☑ to transfer servicing of your loan.</div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Confirm Receipt */}
      <div className="confirm-box mt-section">
        <div className="section-header-box">Confirm Receipt</div>
        <p className="sub-label mt-2">
          By signing, you are only confirming that you have received this form. You do not have to accept this loan because you have signed or received this form.
        </p>
        <div className="sig-grid mt-4">
          <div>
            <div className="sig-line" />
            <div className="sig-label">Applicant Signature</div>
          </div>
          <div>
            <div className="sig-line" />
            <div className="sig-label">Date</div>
          </div>
          <div>
            <div className="sig-line" />
            <div className="sig-label">Co-Applicant Signature</div>
          </div>
          <div>
            <div className="sig-line" />
            <div className="sig-label">Date</div>
          </div>
        </div>
      </div>

      <div className="page-footer">
        LOAN QUOTE &nbsp;&nbsp; PAGE 3 OF 3 • LOAN ID # {quote._id.slice(0, 8).toUpperCase()}
      </div>
    </div>
  )
}
