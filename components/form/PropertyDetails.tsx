'use client'

import SectionCard from '@/components/ui/SectionCard'
import FieldRow from '@/components/ui/FieldRow'
import TextInput from '@/components/ui/TextInput'
import SelectDropdown from '@/components/ui/SelectDropdown'
import CurrencyInput from '@/components/ui/CurrencyInput'
import ToggleSwitch from '@/components/ui/ToggleSwitch'
import type { LoanQuote } from '@/lib/types'
import { US_STATES, REFINANCE_TYPES } from '@/lib/rules'
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

function getStateName(code: string): string {
  return US_STATES.find(s => s.value === code)?.label || code
}

export default function PropertyDetails({ quote, errors, onChange }: Props) {
  const addr     = quote.propertyAddress
  const stateCode = addr.state?.code || ''

  function updateAddr(patch: Partial<typeof addr>) {
    onChange('propertyAddress', { ...addr, ...patch })
  }

  return (
    <SectionCard title="Property & Loan Details">
      <div className="space-y-4">
        {/* Address */}
        <div className="grid grid-cols-2 gap-3">
          <FieldRow label="Street" className="col-span-2">
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
          <FieldRow label="Purpose" required>
            <SelectDropdown
              value={quote.purpose.type}
              onChange={v => onChange('purpose', { ...quote.purpose, type: v })}
              options={PURPOSES}
            />
          </FieldRow>
        </div>

        {/* Conditional: Purchase Price or Est. Property Value */}
        <div className="grid grid-cols-2 gap-3">
          {shouldShowField('purchasePrice', quote) && (
            <FieldRow label="Purchase Price" required error={errors.noteAmount}>
              <CurrencyInput
                value={Number(quote.noteAmount) || 0}
                onChange={v => onChange('noteAmount', v)}
                error={errors.noteAmount}
              />
            </FieldRow>
          )}
          {shouldShowField('estimatedPropertyValue', quote) && (
            <FieldRow label="Estimated Property Value" required error={errors.noteAmount}>
              <CurrencyInput
                value={Number(quote.noteAmount) || 0}
                onChange={v => onChange('noteAmount', v)}
                error={errors.noteAmount}
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

        {shouldShowField('isClosingCostFinanced', quote) && (
          <div className="flex items-center gap-4 py-2 px-3 rounded bg-[#1a1a1a] border border-[#333]">
            <span className="text-sm text-gray-300 flex-1">Is Closing Cost Financed?</span>
            <ToggleSwitch
              value={quote.isClosingCostFinanced}
              onChange={v => onChange('isClosingCostFinanced', v)}
            />
          </div>
        )}
      </div>
    </SectionCard>
  )
}
