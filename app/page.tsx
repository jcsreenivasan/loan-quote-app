'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw, CheckCircle } from 'lucide-react'

import TextInput from '@/components/ui/TextInput'
import LoanDetailsSection from '@/components/form/LoanDetailsSection'
import LoanAmounts from '@/components/form/LoanAmounts'
import ProjectedPayments from '@/components/form/ProjectedPayments'
import ClosingCostsSection from '@/components/closing-costs/ClosingCostsSection'

import type { LoanQuote } from '@/lib/types'
import { createDefaultQuote, loadQuote, saveQuote } from '@/lib/defaults'
import { recalculateQuote } from '@/lib/calculations'
import { validateQuote } from '@/lib/ruleEngine'

function validateEmail(email: string): string {
  if (!email) return ''
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? '' : 'Invalid email address'
}

function validatePhone(phone: string): string {
  if (!phone) return ''
  const digits = phone.replace(/\D/g, '')
  return digits.length >= 10 && digits.length <= 11 ? '' : 'Invalid phone number'
}

export default function Home() {
  const router = useRouter()
  const [quote, setQuote]     = useState<LoanQuote>(createDefaultQuote())
  const [errors, setErrors]   = useState<Record<string, string>>({})
  const [warnings, setWarnings] = useState<Record<string, string>>({})
  const [fieldErrors, setFieldErrors] = useState<{ email: string; phone: string }>({ email: '', phone: '' })

  useEffect(() => {
    const loaded = loadQuote()
    if (loaded) setQuote(recalculateQuote({ ...createDefaultQuote(), ...loaded }))
  }, [])

  function handleChange(field: keyof LoanQuote, value: unknown) {
    setQuote(prev => ({ ...prev, [field]: value }))
  }

  function handleUpdateQuote() {
    const recalculated = recalculateQuote(quote)
    const { errors: errs, warnings: warns } = validateQuote(recalculated)
    setErrors(errs)
    setWarnings(warns)
    setQuote(recalculated)
    saveQuote(recalculated)
  }

  function handleComplete() {
    const recalculated = recalculateQuote(quote)
    saveQuote(recalculated)
    router.push('/preview/loan-quote')
  }

  return (
    <div className="min-h-screen bg-[#161616] text-white flex flex-col">

      {/* ── Header bar ── */}
      <header className="flex items-center justify-between gap-4 px-6 py-3 bg-[#1a1a1a] border-b border-[#2a2a2a] sticky top-0 z-20">
        {/* Left: Name / Email / Phone inputs */}
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xs text-gray-500 shrink-0">Name:</span>
          <div className="w-44">
            <TextInput
              value={quote.borrowerName}
              onChange={v => handleChange('borrowerName', v)}
              placeholder="Borrower name"
            />
          </div>
          {errors.borrowerName && (
            <span className="text-xs text-red-400 shrink-0">{errors.borrowerName}</span>
          )}
          <span className="text-xs text-gray-500 shrink-0">Email:</span>
          <div className="w-44">
            <TextInput
              value={quote.borrowerEmail}
              onChange={v => { handleChange('borrowerEmail', v); setFieldErrors(p => ({ ...p, email: '' })) }}
              onBlur={() => setFieldErrors(p => ({ ...p, email: validateEmail(quote.borrowerEmail) }))}
              error={fieldErrors.email}
              placeholder="email@example.com"
            />
          </div>
          <span className="text-xs text-gray-500 shrink-0">Phone:</span>
          <div className="w-44">
            <TextInput
              value={quote.borrowerPhone}
              onChange={v => { handleChange('borrowerPhone', v); setFieldErrors(p => ({ ...p, phone: '' })) }}
              onBlur={() => setFieldErrors(p => ({ ...p, phone: validatePhone(quote.borrowerPhone) }))}
              error={fieldErrors.phone}
              placeholder="(555) 000-0000"
            />
          </div>
        </div>

        {/* Right: action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            className="px-3 py-1.5 rounded text-xs text-gray-400 border border-[#3a3a3a] hover:bg-[#2a2a2a] transition"
            onClick={() => {/* stub */}}
          >
            Preview Fee Sheet
          </button>
          <button
            className="px-3 py-1.5 rounded text-xs text-gray-200 border border-[#3a3a3a] hover:bg-[#2a2a2a] transition"
            onClick={() => {
              saveQuote(recalculateQuote(quote))
              router.push('/preview/loan-quote')
            }}
          >
            Preview Loan Quote
          </button>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-y-auto pb-20">
        <div className="max-w-6xl mx-auto px-6">
          <LoanDetailsSection quote={quote} errors={errors} onChange={handleChange} />
          <LoanAmounts        quote={quote} errors={errors} warnings={warnings} onChange={handleChange} />
          <ProjectedPayments  quote={quote} onChange={handleChange} />
          <ClosingCostsSection quote={quote} onChange={handleChange} />
          {/* bottom spacing */}
          <div className="h-8" />
        </div>
      </main>

      {/* ── Sticky bottom bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-20 flex items-center justify-end gap-3 px-6 py-3 bg-[#1a1a1a] border-t border-[#2a2a2a]">
        <button
          onClick={handleUpdateQuote}
          className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#2a2a2a] border border-[#3a3a3a] text-sm font-medium text-gray-200 hover:bg-[#333] hover:border-[#555] transition"
        >
          <RefreshCw size={14} />
          Update Quote
        </button>
        <button
          onClick={handleComplete}
          className="flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 text-sm font-semibold text-white hover:bg-blue-500 transition shadow-lg shadow-blue-900/30"
        >
          <CheckCircle size={14} />
          Complete
        </button>
      </div>
    </div>
  )
}
