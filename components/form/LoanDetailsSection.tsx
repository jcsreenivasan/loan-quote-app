'use client'

import FieldRow from '@/components/ui/FieldRow'
import TextInput from '@/components/ui/TextInput'
import SelectDropdown from '@/components/ui/SelectDropdown'
import CurrencyInput from '@/components/ui/CurrencyInput'
import ToggleSwitch from '@/components/ui/ToggleSwitch'
import type { LoanQuote, LoanProductType } from '@/lib/types'
import { US_STATES, LOAN_TERMS, PRODUCTS, REFINANCE_TYPES } from '@/lib/rules'
import { shouldShowField } from '@/lib/ruleEngine'

interface Props {
  quote: LoanQuote
  errors: Record<string, string>
  onChange: (field: keyof LoanQuote, value: unknown) => void
}

const PURPOSES = [
  { value: 'Purchase',  label: 'Purchase' },
  { value: 'Refinance', label: 'Refinance' },
]

const LOAN_TYPES: { value: LoanProductType; label: string }[] = [
  { value: 'Conventional', label: 'Conventional' },
  { value: 'FHA',          label: 'FHA' },
  { value: 'VA',           label: 'VA' },
  { value: 'USDA',         label: 'USDA Rural Development' },
  { value: 'Other',        label: 'Other' },
]

const VA_TYPES = [
  { value: 'first_time_use', label: 'First Time Use' },
  { value: 'subsequent_use', label: 'Subsequent Use' },
  { value: 'exempt',         label: 'Exempt' },
]

function getStateName(code: string): string {
  return US_STATES.find(s => s.value === code)?.label || code
}

export default function LoanDetailsSection({ quote, errors, onChange }: Props) {
  const addr = quote.propertyAddress
  const stateCode = addr.state?.code || ''
  const loanTermOptions = LOAN_TERMS.map(t => ({ value: String(t.value), label: t.label }))
  const productOptions  = PRODUCTS.map(p => ({ value: p.value, label: p.label }))

  function updateAddr(patch: Partial<typeof addr>) {
    onChange('propertyAddress', { ...addr, ...patch })
  }

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center gap-1 mb-3 mt-6">
        <span className="text-blue-400 font-medium">Loan</span>
        <span className="text-white font-bold">Details</span>
      </div>
      <div className="border-b border-[#3a3a3a] mb-4" />

      {/* Row 1: Address (4-col) */}
      <div className="grid grid-cols-4 gap-3 mb-3">
        <FieldRow label="Street">
          <TextInput
            value={addr.street}
            onChange={v => updateAddr({ street: v })}
            placeholder="123 Main St"
          />
        </FieldRow>
        <FieldRow label="City">
          <TextInput value={addr.city} onChange={v => updateAddr({ city: v })} placeholder="City" />
        </FieldRow>
        <FieldRow label="Zip Code">
          <TextInput value={addr.zip} onChange={v => updateAddr({ zip: v })} placeholder="00000" />
        </FieldRow>
        <FieldRow label="State">
          <SelectDropdown
            value={stateCode}
            onChange={v => updateAddr({ state: v ? { code: v, name: getStateName(v), _id: addr.state?._id || '' } : null })}
            options={US_STATES}
            placeholder="Select State"
          />
        </FieldRow>
      </div>

      {/* Row 2: Purchase Price / Est. Property Value | Loan Term | Purpose | Product (4-col) */}
      <div className="grid grid-cols-4 gap-3 mb-3">
        {shouldShowField('purchasePrice', quote) ? (
          <FieldRow label="Purchase Price" required error={errors.noteAmount}>
            <CurrencyInput
              value={Number(quote.noteAmount) || 0}
              onChange={v => onChange('noteAmount', v)}
              error={errors.noteAmount}
            />
          </FieldRow>
        ) : (
          <FieldRow label="Estimated Property Value" required error={errors.noteAmount}>
            <CurrencyInput
              value={Number(quote.noteAmount) || 0}
              onChange={v => onChange('noteAmount', v)}
              error={errors.noteAmount}
            />
          </FieldRow>
        )}
        <FieldRow label="Loan Term" required>
          <SelectDropdown
            value={String(quote.loanTerm)}
            onChange={v => onChange('loanTerm', Number(v))}
            options={loanTermOptions}
          />
        </FieldRow>
        <FieldRow label="Purpose" required>
          <SelectDropdown
            value={quote.purpose.type}
            onChange={v => onChange('purpose', { ...quote.purpose, type: v })}
            options={PURPOSES}
          />
        </FieldRow>
        <FieldRow label="Product" required>
          <SelectDropdown
            value={quote.loanProduct}
            onChange={v => onChange('loanProduct', v)}
            options={productOptions}
          />
        </FieldRow>
      </div>

      {/* Row 3: Loan Type | Rate Lock (and conditionals) */}
      <div className="grid grid-cols-4 gap-3 mb-3">
        <FieldRow label="Loan Type" required>
          <SelectDropdown
            value={quote.productType.type}
            onChange={v => onChange('productType', { ...quote.productType, type: v as LoanProductType })}
            options={LOAN_TYPES}
          />
        </FieldRow>
        {shouldShowField('rateLock', quote) ? (
          <FieldRow label="Rate Lock">
            <div className="flex items-center h-9 mt-1">
              <ToggleSwitch
                value={quote.isRateLock}
                onChange={v => onChange('isRateLock', v)}
              />
            </div>
          </FieldRow>
        ) : (
          <div /> /* empty column placeholder */
        )}
        {shouldShowField('vaType', quote) && (
          <FieldRow label="VA Type" required error={errors.VAType}>
            <SelectDropdown
              value={quote.VAType}
              onChange={v => onChange('VAType', v)}
              options={VA_TYPES}
              error={errors.VAType}
            />
          </FieldRow>
        )}
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
        {shouldShowField('refinanceType', quote) && (
          <FieldRow label="Refinance Type" required error={errors.refinanceType}>
            <SelectDropdown
              value={quote.refinanceType}
              onChange={v => onChange('refinanceType', v)}
              options={REFINANCE_TYPES}
              placeholder="Select Type"
              error={errors.refinanceType}
            />
          </FieldRow>
        )}
      </div>

      {/* Closing Cost Financed toggle (Refinance only) */}
      {shouldShowField('isClosingCostFinanced', quote) && (
        <div className="flex items-center gap-4 py-2 px-3 rounded bg-[#1a1a1a] border border-[#333] mb-3">
          <span className="text-sm text-gray-300 flex-1">Is Closing Cost Financed?</span>
          <ToggleSwitch
            value={quote.isClosingCostFinanced}
            onChange={v => onChange('isClosingCostFinanced', v)}
          />
        </div>
      )}
    </div>
  )
}
