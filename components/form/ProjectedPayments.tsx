'use client'

import type { LoanQuote } from '@/lib/types'
import { shouldShowField } from '@/lib/ruleEngine'
import { formatCurrency } from '@/lib/defaults'
import TaxInsuranceSection from './TaxInsuranceSection'

interface Props {
  quote: LoanQuote
  onChange: (field: keyof LoanQuote, value: unknown) => void
}

export default function ProjectedPayments({ quote, onChange }: Props) {
  const showMI = shouldShowField('mortgageInsurance', quote)

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center gap-1 mb-3 mt-6">
        <span className="text-blue-400 font-medium">Projected</span>
        <span className="text-white font-bold">Payments</span>
      </div>
      <div className="border-b border-[#3a3a3a] mb-4" />

      {/* 4-column read-only grid */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        <div>
          <p className="text-xs text-gray-500 mb-1.5">P&amp;I</p>
          <div className="px-3 py-2 rounded bg-[#111] border border-[#2a2a2a] text-sm text-gray-400 font-mono">
            {formatCurrency(quote.monthlyPayment)}
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1.5">Mortgage Insurance</p>
          <div className="px-3 py-2 rounded bg-[#111] border border-[#2a2a2a] text-sm text-gray-400 font-mono">
            {showMI ? formatCurrency(Number(quote.mortgageInsurance) || 0) : '—'}
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1.5">Estimated Escrow</p>
          <div className="px-3 py-2 rounded bg-[#111] border border-[#2a2a2a] text-sm text-gray-400 font-mono">
            {formatCurrency(quote.estimatedEscrow)}
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1.5">Est. Total Monthly Payment</p>
          <div className="px-3 py-2 rounded bg-[#111] border border-[#2a2a2a] text-sm font-bold text-blue-300 font-mono">
            {formatCurrency(quote.estimatedTotalPayment)}
          </div>
        </div>
      </div>

      {/* Tax & Insurance inline */}
      <TaxInsuranceSection quote={quote} onChange={onChange} />
    </div>
  )
}
