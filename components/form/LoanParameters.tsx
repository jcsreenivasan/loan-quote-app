'use client'

import SectionCard from '@/components/ui/SectionCard'
import FieldRow from '@/components/ui/FieldRow'
import SelectDropdown from '@/components/ui/SelectDropdown'
import ToggleSwitch from '@/components/ui/ToggleSwitch'
import TextInput from '@/components/ui/TextInput'
import type { LoanQuote, LoanProductType } from '@/lib/types'
import { LOAN_TERMS, PRODUCTS, REFINANCE_TYPES } from '@/lib/rules'
import { shouldShowField } from '@/lib/ruleEngine'

interface Props {
  quote: LoanQuote
  errors: Record<string, string>
  onChange: (field: keyof LoanQuote, value: unknown) => void
}

const LOAN_TYPES: { value: LoanProductType; label: string }[] = [
  { value: 'Conventional', label: 'Conventional' },
  { value: 'FHA',          label: 'FHA' },
  { value: 'VA',           label: 'VA' },
  { value: 'USDA',         label: 'USDA Rural Development' },
]

const VA_TYPES = [
  { value: 'first_time_use', label: 'First Time Use' },
  { value: 'subsequent_use', label: 'Subsequent Use' },
  { value: 'exempt',         label: 'Exempt' },
]

export default function LoanParameters({ quote, errors, onChange }: Props) {
  const loanTermOptions = LOAN_TERMS.map(t => ({ value: String(t.value), label: t.label }))
  const productOptions  = PRODUCTS.map(p => ({ value: p.value, label: p.label }))
  const refinanceOptions = REFINANCE_TYPES.map(r => ({ value: r.value, label: r.label }))

  return (
    <SectionCard title="Loan Parameters">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <FieldRow label="Loan Type" required>
            <SelectDropdown
              value={quote.productType.type}
              onChange={v => onChange('productType', { ...quote.productType, type: v as LoanProductType })}
              options={LOAN_TYPES}
            />
          </FieldRow>
          <FieldRow label="Product" required>
            <SelectDropdown
              value={quote.loanProduct}
              onChange={v => onChange('loanProduct', v)}
              options={productOptions}
            />
          </FieldRow>
          <FieldRow label="Loan Term" required>
            <SelectDropdown
              value={String(quote.loanTerm)}
              onChange={v => onChange('loanTerm', Number(v))}
              options={loanTermOptions}
            />
          </FieldRow>
          {shouldShowField('refinanceType', quote) && (
            <FieldRow label="Refinance Type" required error={errors.refinanceType}>
              <SelectDropdown
                value={quote.refinanceType}
                onChange={v => onChange('refinanceType', v)}
                options={refinanceOptions}
                placeholder="Select Type"
                error={errors.refinanceType}
              />
            </FieldRow>
          )}
        </div>

        {/* VA-specific fields */}
        {shouldShowField('vaType', quote) && (
          <div className="space-y-3 p-3 rounded bg-[#1a1a1a] border border-[#333]">
            <p className="text-xs text-blue-400 font-medium uppercase tracking-wide">VA Loan Details</p>
            <div className="grid grid-cols-2 gap-3">
              <FieldRow label="VA Type" required error={errors.VAType}>
                <SelectDropdown
                  value={quote.VAType}
                  onChange={v => onChange('VAType', v)}
                  options={VA_TYPES}
                  error={errors.VAType}
                />
              </FieldRow>
              <FieldRow label="Rate Lock">
                <div className="flex items-center h-9 mt-1">
                  <ToggleSwitch
                    value={quote.isRateLock}
                    onChange={v => onChange('isRateLock', v)}
                  />
                </div>
              </FieldRow>
            </div>
            {shouldShowField('rateLockDate', quote) && (
              <FieldRow label="Rate Lock Date" required error={errors.rateLockDate}>
                <TextInput
                  type="date"
                  value={quote.rateLockDate || ''}
                  onChange={v => onChange('rateLockDate', v || null)}
                  error={errors.rateLockDate}
                />
              </FieldRow>
            )}
          </div>
        )}
      </div>
    </SectionCard>
  )
}
