'use client'

import { useEffect, useState } from 'react'
import { Printer, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { LoanQuote } from '@/lib/types'
import { loadQuote, createDefaultQuote } from '@/lib/defaults'
import { computeClosingCostTotals, recalculateQuote } from '@/lib/calculations'
import Page1 from './Page1'
import Page2 from './Page2'
import Page3 from './Page3'
import './print.css'

export default function PreviewPage() {
  const router = useRouter()
  const [quote, setQuote] = useState<LoanQuote | null>(null)

  useEffect(() => {
    const loaded = loadQuote()
    const q = loaded ?? createDefaultQuote()
    setQuote(recalculateQuote(q))
  }, [])

  if (!quote) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading quote…</div>
      </div>
    )
  }

  const totals = computeClosingCostTotals(quote)

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Print toolbar — hidden when printing */}
      <div className="no-print sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition"
        >
          <ArrowLeft size={16} />
          Back to Quote
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Loan ID: {quote._id.slice(0, 8).toUpperCase()}</span>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-500 transition font-medium"
          >
            <Printer size={15} />
            Print / Save PDF
          </button>
        </div>
      </div>

      {/* Document */}
      <div className="preview-root">
        <Page1 quote={quote} totals={totals} />
        <Page2 quote={quote} totals={totals} />
        <Page3 quote={quote} totals={totals} />
      </div>
    </div>
  )
}
