'use client'

import SectionCard from '@/components/ui/SectionCard'
import FieldRow from '@/components/ui/FieldRow'
import TextInput from '@/components/ui/TextInput'
import type { LoanQuote } from '@/lib/types'

interface Props {
  quote: LoanQuote
  errors: Record<string, string>
  onChange: (field: keyof LoanQuote, value: unknown) => void
}

export default function BorrowerInfo({ quote, errors, onChange }: Props) {
  return (
    <SectionCard title="Borrower & Loan Officer">
      <div className="grid grid-cols-2 gap-3">
        <FieldRow label="Borrower Name" required error={errors.borrowerName}>
          <TextInput
            value={quote.borrowerName}
            onChange={v => onChange('borrowerName', v)}
            placeholder="Full name"
            error={errors.borrowerName}
          />
        </FieldRow>
        <FieldRow label="Co-Borrower Name">
          <TextInput
            value={quote.coBorrowerName}
            onChange={v => onChange('coBorrowerName', v)}
            placeholder="Full name (optional)"
          />
        </FieldRow>
        <FieldRow label="Loan Officer Name">
          <TextInput
            value={quote.loanOfficerName}
            onChange={v => onChange('loanOfficerName', v)}
          />
        </FieldRow>
        <FieldRow label="NMLS ID">
          <TextInput
            value={quote.loanOfficerNMLS}
            onChange={v => onChange('loanOfficerNMLS', v)}
            placeholder="000000"
          />
        </FieldRow>
        <FieldRow label="Email">
          <TextInput
            type="email"
            value={quote.loanOfficerEmail}
            onChange={v => onChange('loanOfficerEmail', v)}
          />
        </FieldRow>
        <FieldRow label="Phone">
          <TextInput
            value={quote.loanOfficerPhone}
            onChange={v => onChange('loanOfficerPhone', v)}
          />
        </FieldRow>
      </div>
    </SectionCard>
  )
}
