// ─── Branding & Firm Configuration ──────────────────────────────────────────
// Edit this file to change the loan officer / broker details that appear
// in the app header and on every page of the printed Loan Quote.

export const BRAND = {
  // Mortgage broker / company
  brokerName: 'Midwest Mortgage Lending LLC',
  brokerNMLS: '2262032',

  // Loan officer
  loanOfficerName: 'Chris Wisinski',
  loanOfficerNMLS: '88003',
  loanOfficerEmail: 'cwisinski@midwestmortgagelending.com',
  loanOfficerPhone: '(616) 323-2020',

  // Visual
  logoPath: '/logo.png',          // place logo at public/logo.png
  primaryColor: '#3b82f6',        // blue-500
  darkBg: '#1a1a1a',
  cardBg: '#2a2a2a',
  borderColor: '#3a3a3a',

  // Legal / disclosure
  lateFeeRate: 0.06,              // 6%
  lateFeeGraceDays: 15,

  // Lender section (left column on Page 3) — leave blank if broker-only
  lenderName: '',
  lenderNMLS: '',
  lenderLicenseId: '',
}
