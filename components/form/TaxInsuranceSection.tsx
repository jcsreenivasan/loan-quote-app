'use client'

import CurrencyInput from '@/components/ui/CurrencyInput'
import ToggleSwitch from '@/components/ui/ToggleSwitch'
import type { LoanQuote, EstimateIncludes } from '@/lib/types'

interface Props {
  quote: LoanQuote
  onChange: (field: keyof LoanQuote, value: unknown) => void
}

interface RowConfig {
  infoKey:   keyof EstimateIncludes
  boolKey:   string
  label:     string
  hasEscrow: boolean
}

const MAIN_ROWS: RowConfig[] = [
  { infoKey: 'propertyTaxesInfo',      boolKey: 'propertyTaxes',     label: 'Property Taxes',       hasEscrow: true  },
  { infoKey: 'homeOwnerInsuranceInfo', boolKey: 'homeOwnerInsurance', label: "Homeowner's",           hasEscrow: true  },
  { infoKey: 'floodInsuranceInfo',     boolKey: 'floodInsurance',     label: 'Flood Insurance',       hasEscrow: true  },
  { infoKey: 'HOAInsuranceInfo',       boolKey: 'HOAInsurance',       label: 'HOA',                   hasEscrow: true  },
]

const OTHER_ROW: RowConfig = {
  infoKey: 'other', boolKey: 'other', label: 'Other', hasEscrow: false,
}

export default function TaxInsuranceSection({ quote, onChange }: Props) {
  const ei = quote.estimateIncludes

  function updateInfo(infoKey: keyof EstimateIncludes, patch: Record<string, unknown>) {
    onChange('estimateIncludes', {
      ...ei,
      [infoKey]: { ...(ei[infoKey] as object), ...patch },
    })
  }

  const otherInfo     = ei[OTHER_ROW.infoKey] as Record<string, unknown>
  const otherIncluded = Boolean(otherInfo[OTHER_ROW.boolKey])
  const otherAmount   = Number(otherInfo.amount) || 0

  return (
    <div>
      <p className="text-xs text-gray-500 mb-3">
        Estimated taxes, Insurance &amp; Assessments (monthly)
      </p>

      {/* 4-column grid for main items */}
      <div className="grid grid-cols-4 gap-3 mb-3">
        {MAIN_ROWS.map(row => {
          const info     = ei[row.infoKey] as Record<string, unknown>
          const included = Boolean(info[row.boolKey])
          const amount   = Number(info.amount) || 0
          const inEscrow = row.hasEscrow ? Boolean(info.inEscrow) : false

          return (
            <div
              key={row.infoKey}
              className={`rounded border border-[#2a2a2a] p-3 transition ${
                included ? 'bg-[#1e1e1e]' : 'bg-[#181818] opacity-60'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={included}
                  onChange={e => updateInfo(row.infoKey, { [row.boolKey]: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-600 bg-[#1a1a1a] accent-blue-500 cursor-pointer"
                />
                <span className="text-xs text-gray-300 font-medium">{row.label}</span>
              </div>
              <CurrencyInput
                value={amount}
                onChange={v => updateInfo(row.infoKey, { amount: v })}
                disabled={!included}
                placeholder="0.00"
              />
              {row.hasEscrow && (
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">In escrow?</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-500">{inEscrow ? 'Yes' : 'No'}</span>
                    <ToggleSwitch
                      value={inEscrow}
                      onChange={v => updateInfo(row.infoKey, { inEscrow: v })}
                      disabled={!included}
                    />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Other row */}
      <div
        className={`flex items-center gap-3 rounded border border-[#2a2a2a] p-3 transition ${
          otherIncluded ? 'bg-[#1e1e1e]' : 'bg-[#181818] opacity-60'
        }`}
      >
        <input
          type="checkbox"
          checked={otherIncluded}
          onChange={e => updateInfo(OTHER_ROW.infoKey, { [OTHER_ROW.boolKey]: e.target.checked })}
          className="w-4 h-4 rounded border-gray-600 bg-[#1a1a1a] accent-blue-500 cursor-pointer"
        />
        <span className="text-xs text-gray-300 font-medium">Other</span>
        <div className="w-40">
          <CurrencyInput
            value={otherAmount}
            onChange={v => updateInfo(OTHER_ROW.infoKey, { amount: v })}
            disabled={!otherIncluded}
            placeholder="0.00"
          />
        </div>
      </div>
    </div>
  )
}
