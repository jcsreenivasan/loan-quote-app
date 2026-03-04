'use client'

import { Eye, FileText, ArrowLeft } from 'lucide-react'
import type { LoanQuote } from '@/lib/types'
import { BRAND } from '@/lib/brand'

interface Props {
  quote: LoanQuote
  activeTab: string
  onTabChange: (tab: string) => void
  onPreviewLoanQuote: () => void
}

const TABS = ['Loan Quote', 'Pre Approvals', 'Contacts']

export default function TopNav({ quote, activeTab, onTabChange, onPreviewLoanQuote }: Props) {
  return (
    <div className="bg-[#1e1e1e] border-b border-[#3a3a3a]">
      {/* Upper bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-[#2e2e2e]">
        <div className="flex items-center gap-4">
          <div>
            <div className="text-white font-semibold text-sm">
              {quote.borrowerName || 'New Borrower'}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              {BRAND.loanOfficerName} · {BRAND.loanOfficerEmail} · {BRAND.loanOfficerPhone}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onPreviewLoanQuote}
            className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#2a2a2a] border border-[#3a3a3a] text-xs text-gray-300 hover:bg-[#333] hover:text-white transition"
          >
            <Eye size={13} />
            Preview Loan Quote
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#2a2a2a] border border-[#3a3a3a] text-xs text-gray-300 hover:bg-[#333] hover:text-white transition"
          >
            <FileText size={13} />
            Preview Fee Sheet
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#2a2a2a] border border-[#3a3a3a] text-xs text-gray-300 hover:bg-[#333] hover:text-white transition">
            <ArrowLeft size={13} />
            Back to list
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex items-center px-6 gap-1">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`px-4 py-2.5 text-sm border-b-2 transition-colors font-medium
              ${activeTab === tab
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  )
}
