'use client'

import FieldRow from '@/components/ui/FieldRow'
import CurrencyInput from '@/components/ui/CurrencyInput'
import PercentInput from '@/components/ui/PercentInput'
import type { LoanQuote } from '@/lib/types'
import { shouldShowField, getFundingFeeLabel } from '@/lib/ruleEngine'
import { formatCurrency } from '@/lib/defaults'

interface Props {
  quote: LoanQuote
  errors: Record<string, string>
  warnings: Record<string, string>
  onChange: (field: keyof LoanQuote, value: unknown) => void
}

export default function LoanAmounts({ quote, errors, warnings, onChange }: Props) {
  const showFundingFee  = shouldShowField('fundingFee', quote)
  const fundingFeeLabel = getFundingFeeLabel(quote.productType.type)
  // interestRate.rate is stored as a percent string "6.544" → PercentInput needs decimal
  const rateDecimal = Number(quote.interestRate.rate) / 100

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center gap-1 mb-3 mt-6">
        <span className="text-blue-400 font-medium">Loan</span>
        <span className="text-white font-bold">Term</span>
      </div>
      <div className="border-b border-[#3a3a3a] mb-4" />

      {/* 4-column grid */}
      <div className="grid grid-cols-4 gap-3">

        {/* Base Loan Amount — read-only */}
        <FieldRow label="Base Loan Amount">
          <div className="px-3 py-2 rounded bg-[#111] border border-[#2a2a2a] text-sm text-gray-400 font-mono">
            {formatCurrency(quote.loanAmount.amount)}
          </div>
        </FieldRow>

        {/* Funding Fee — read-only, shown always but dimmed when N/A */}
        <FieldRow label={showFundingFee ? (fundingFeeLabel ?? 'Funding Fee') : 'Funding Fee'}>
          <div className={`px-3 py-2 rounded bg-[#111] border border-[#2a2a2a] text-sm font-mono ${showFundingFee ? 'text-gray-400' : 'text-gray-600'}`}>
            {showFundingFee ? formatCurrency(quote.fundingFee) : '—'}
          </div>
        </FieldRow>

        {/* Interest Rate */}
        <FieldRow label="Interest Rate" required error={errors.interestRate} warning={warnings.interestRate}>
          <PercentInput
            value={rateDecimal}
            onChange={v => onChange('interestRate', { ...quote.interestRate, rate: String(v * 100) })}
            error={errors.interestRate}
            warning={warnings.interestRate}
          />
        </FieldRow>

        {/* Down Payment with $/% toggle */}
        <FieldRow label="Down Payment" required error={errors.downPayment} warning={warnings.downPayment}>
          <div className="flex gap-1.5">
            <div className="flex rounded border border-[#3a3a3a] overflow-hidden shrink-0">
              <button
                type="button"
                onClick={() => onChange('downPaymentType', 'doller')}
                className={`px-2.5 py-1 text-xs font-semibold transition ${
                  quote.downPaymentType === 'doller'
                    ? 'bg-blue-600 text-white'
                    : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#2a2a2a]'
                }`}
              >
                $
              </button>
              <button
                type="button"
                onClick={() => onChange('downPaymentType', 'percentage')}
                className={`px-2.5 py-1 text-xs font-semibold transition ${
                  quote.downPaymentType === 'percentage'
                    ? 'bg-blue-600 text-white'
                    : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#2a2a2a]'
                }`}
              >
                %
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <CurrencyInput
                value={Number(quote.downPayment) || 0}
                onChange={v => onChange('downPayment', v)}
                error={errors.downPayment}
              />
            </div>
          </div>
          {warnings.downPayment && !errors.downPayment && (
            <p className="mt-1 text-xs text-yellow-400">{warnings.downPayment}</p>
          )}
        </FieldRow>
      </div>

      {warnings.noteAmount && (
        <div className="flex items-start gap-2 p-3 mt-3 rounded bg-yellow-900/20 border border-yellow-700/40">
          <span className="text-yellow-400 text-xs">⚠</span>
          <p className="text-xs text-yellow-300">{warnings.noteAmount}</p>
        </div>
      )}
    </div>
  )
}
