'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import LineItemList from './LineItemList'
import AddConfigModal from './AddConfigModal'
import FieldRow from '@/components/ui/FieldRow'
import CurrencyInput from '@/components/ui/CurrencyInput'
import type { LoanQuote, Prepaids, EscrowPayment } from '@/lib/types'
import { ORIGINATION_CHARGE_TYPES, SERVICE_TYPES, CANNOT_SHOP_TYPES, GOVT_FEE_TYPES } from '@/lib/rules'
import { formatCurrency } from '@/lib/defaults'
import { computeClosingCostTotals } from '@/lib/calculations'

interface Props {
  quote:    LoanQuote
  onChange: (field: keyof LoanQuote, value: unknown) => void
}

// ─── SectionHeader ────────────────────────────────────────────────────────────

function SectionHeader({
  letter,
  title,
  total,
  canAdd,
  onAdd,
}: {
  letter: string
  title:  string
  total:  number
  canAdd?: boolean
  onAdd?:  () => void
}) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <span className="w-6 h-6 flex items-center justify-center rounded bg-teal-900/50 text-teal-400 text-xs font-bold border border-teal-800/40 shrink-0">
        {letter}
      </span>
      <span className="flex-1 text-xs font-semibold text-gray-300 leading-tight">{title}</span>
      <span className="text-xs font-mono text-gray-400 shrink-0">{formatCurrency(total)}</span>
      {canAdd && (
        <button
          onClick={onAdd}
          className="w-5 h-5 flex items-center justify-center rounded bg-[#2a2a2a] text-gray-400 hover:text-white hover:bg-blue-600/40 transition shrink-0"
          title="Add item"
        >
          <Plus size={11} />
        </button>
      )}
    </div>
  )
}

// ─── Prepaid / Escrow row helpers ─────────────────────────────────────────────

function PrepaidRow({
  label,
  monthlyAmount,
  period,
  onPeriodChange,
}: {
  label:          string
  monthlyAmount:  number
  period:         number
  onPeriodChange: (v: number) => void
}) {
  return (
    <div className="grid grid-cols-[1fr_70px] gap-1.5 items-end">
      <div>
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        <div className="px-2 py-1.5 rounded bg-[#111] border border-[#2a2a2a] text-xs text-gray-500 font-mono">
          {formatCurrency(monthlyAmount)}/mo
        </div>
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-1">Mo.</p>
        <input
          type="number"
          min={0}
          value={period}
          onChange={e => onPeriodChange(Number(e.target.value))}
          className="w-full px-2 py-1.5 rounded bg-[#1a1a1a] border border-[#3a3a3a] text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="0"
        />
      </div>
    </div>
  )
}

function EscrowRow({
  label,
  monthlyAmount,
  period,
  onPeriodChange,
}: {
  label:          string
  monthlyAmount:  number
  period:         number
  onPeriodChange: (v: number) => void
}) {
  return (
    <div className="grid grid-cols-[1fr_70px] gap-1.5 items-end">
      <div>
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        <div className="px-2 py-1.5 rounded bg-[#111] border border-[#2a2a2a] text-xs text-gray-500 font-mono">
          {formatCurrency(monthlyAmount)}/mo
        </div>
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-1">Mo.</p>
        <input
          type="number"
          min={0}
          value={period}
          onChange={e => onPeriodChange(Number(e.target.value))}
          className="w-full px-2 py-1.5 rounded bg-[#1a1a1a] border border-[#3a3a3a] text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="0"
        />
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ClosingCostsSection({ quote, onChange }: Props) {
  const totals     = computeClosingCostTotals(quote)
  const ei         = quote.estimateIncludes
  const monthlyMI  = Number(quote.mortgageInsurance) || 0
  const hoMonthly  = Number(ei.homeOwnerInsuranceInfo.amount) / 12
  const floodMonthly = Number(ei.floodInsuranceInfo.amount) / 12
  const taxMonthly = Number(ei.propertyTaxesInfo.amount) / 12

  const [showModalA, setShowModalA] = useState(false)
  const [showModalB, setShowModalB] = useState(false)
  const [showModalC, setShowModalC] = useState(false)
  const [showModalE, setShowModalE] = useState(false)

  function updatePrepaids(patch: Partial<Prepaids>) {
    onChange('prepaids', { ...quote.prepaids, ...patch })
  }
  function updatePrepaidsItem(key: string, patch: Record<string, unknown>) {
    onChange('prepaids', {
      ...quote.prepaids,
      [key]: { ...(quote.prepaids[key as keyof Prepaids] as object), ...patch },
    })
  }
  function updateEscrow(key: string, patch: Record<string, unknown>) {
    onChange('escrowPayment', {
      ...quote.escrowPayment,
      [key]: { ...(quote.escrowPayment[key as keyof EscrowPayment] as object), ...patch },
    })
  }

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center gap-1 mb-3 mt-6">
        <span className="text-blue-400 font-medium">Closing</span>
        <span className="text-white font-bold">Cost Details</span>
      </div>
      <div className="border-b border-[#3a3a3a] mb-4" />

      {/* Sub-headers */}
      <div className="grid grid-cols-2 gap-6 mb-2">
        <span className="text-xs font-semibold text-blue-400 uppercase tracking-wide">Loan Costs</span>
        <span className="text-xs font-semibold text-blue-400 uppercase tracking-wide">Other Costs</span>
      </div>

      {/* 2-column layout */}
      <div className="grid grid-cols-2 gap-6">

        {/* ── LEFT: Loan Costs ── */}
        <div className="space-y-4">

          {/* Section A: Origination Charges */}
          <div>
            <SectionHeader
              letter="A"
              title="Origination Charges"
              total={totals.sectionA}
              canAdd
              onAdd={() => setShowModalA(true)}
            />
            <LineItemList
              items={quote.originationCharges}
              onChange={v => onChange('originationCharges', v)}
              lockedCount={0}
              typeOptions={ORIGINATION_CHARGE_TYPES}
              hideCopy
            />
            {showModalA && (
              <AddConfigModal
                onSave={item => { onChange('originationCharges', [...quote.originationCharges, item]); setShowModalA(false) }}
                onClose={() => setShowModalA(false)}
              />
            )}
          </div>

          {/* Section A1: Other Credits */}
          <div className="pt-3 border-t border-[#2a2a2a]">
            <h4 className="text-xs font-semibold text-gray-500 mb-2">Other Credits</h4>
            <div className="grid grid-cols-3 gap-2">
              <FieldRow label="Seller Credit">
                <CurrencyInput
                  value={quote.otherCredits.sellerCredits}
                  onChange={v => onChange('otherCredits', { ...quote.otherCredits, sellerCredits: v })}
                />
              </FieldRow>
              <FieldRow label="Lender Credit">
                <CurrencyInput
                  value={quote.otherCredits.lenderCredits}
                  onChange={v => onChange('otherCredits', { ...quote.otherCredits, lenderCredits: v })}
                />
              </FieldRow>
              <FieldRow label="Funds for Borrower">
                <CurrencyInput
                  value={quote.otherCredits.fundsForBorrower}
                  onChange={v => onChange('otherCredits', { ...quote.otherCredits, fundsForBorrower: v })}
                />
              </FieldRow>
            </div>
          </div>

          {/* Section B: Cannot Shop */}
          <div className="pt-3 border-t border-[#2a2a2a]">
            <SectionHeader
              letter="B"
              title="Services You Cannot Shop For"
              total={totals.sectionB}
              canAdd
              onAdd={() => setShowModalB(true)}
            />
            <LineItemList
              items={quote.cannotShopFor}
              onChange={v => onChange('cannotShopFor', v)}
              lockedCount={0}
              hideCopy
              typeOptions={CANNOT_SHOP_TYPES}
              onAddNew={() => setShowModalB(true)}
            />
            {showModalB && (
              <AddConfigModal
                onSave={item => { onChange('cannotShopFor', [...quote.cannotShopFor, item]); setShowModalB(false) }}
                onClose={() => setShowModalB(false)}
                title="Add Cannot Shop For Item"
              />
            )}
          </div>

          {/* Section C: Can Shop */}
          <div className="pt-3 border-t border-[#2a2a2a]">
            <SectionHeader
              letter="C"
              title="Services You Can Shop For"
              total={totals.sectionC}
              canAdd
              onAdd={() => setShowModalC(true)}
            />
            <LineItemList
              items={quote.canShopFor}
              onChange={v => onChange('canShopFor', v)}
              lockedCount={0}
              typeOptions={SERVICE_TYPES}
            />
            {showModalC && (
              <AddConfigModal
                onSave={item => { onChange('canShopFor', [...quote.canShopFor, item]); setShowModalC(false) }}
                onClose={() => setShowModalC(false)}
              />
            )}
          </div>

          {/* Section D: Total Loan Costs */}
          <div className="flex items-center justify-between pt-3 border-t-2 border-[#555]">
            <span className="text-xs font-bold text-gray-200">D. Total Loan Costs (A + B + C)</span>
            <span className="text-xs font-bold font-mono text-white">{formatCurrency(totals.sectionD)}</span>
          </div>
        </div>

        {/* ── RIGHT: Other Costs ── */}
        <div className="space-y-4">

          {/* Section E: Tax & Government Fees */}
          <div>
            <SectionHeader
              letter="E"
              title="Tax and Other Government Fees"
              total={totals.sectionE}
              canAdd
              onAdd={() => setShowModalE(true)}
            />
            <LineItemList
              items={quote.taxesOtherGovtFees}
              onChange={v => onChange('taxesOtherGovtFees', v)}
              lockedCount={0}
              hideCopy
              typeOptions={GOVT_FEE_TYPES}
              onAddNew={() => setShowModalE(true)}
            />
            {showModalE && (
              <AddConfigModal
                onSave={item => { onChange('taxesOtherGovtFees', [...quote.taxesOtherGovtFees, item]); setShowModalE(false) }}
                onClose={() => setShowModalE(false)}
              />
            )}
          </div>

          {/* Section F: Prepaids */}
          <div className="pt-3 border-t border-[#2a2a2a]">
            <SectionHeader letter="F" title="Prepaid" total={totals.sectionF} />
            <div className="space-y-2 mt-1">
              {ei.homeOwnerInsuranceInfo.homeOwnerInsurance && ei.homeOwnerInsuranceInfo.inEscrow && (
                <PrepaidRow
                  label="Homeowner's Insurance"
                  monthlyAmount={hoMonthly}
                  period={Number(quote.prepaids.homeOwnerInsurance.period)}
                  onPeriodChange={v => updatePrepaidsItem('homeOwnerInsurance', { period: v })}
                />
              )}
              <PrepaidRow
                label="Mortgage Insurance"
                monthlyAmount={monthlyMI}
                period={Number(quote.prepaids.mortgageInsurance.period)}
                onPeriodChange={v => updatePrepaidsItem('mortgageInsurance', { period: v })}
              />
              {ei.floodInsuranceInfo.floodInsurance && (
                <PrepaidRow
                  label="Flood Insurance"
                  monthlyAmount={floodMonthly}
                  period={Number(quote.prepaids.floodInsurance.period)}
                  onPeriodChange={v => updatePrepaidsItem('floodInsurance', { period: v })}
                />
              )}
              {ei.propertyTaxesInfo.propertyTaxes && ei.propertyTaxesInfo.inEscrow && (
                <PrepaidRow
                  label="Property Taxes"
                  monthlyAmount={taxMonthly}
                  period={Number(quote.prepaids.propertyTaxes.period)}
                  onPeriodChange={v => updatePrepaidsItem('propertyTaxes', { period: v })}
                />
              )}
              {/* Prepaid Interest */}
              <div className="grid grid-cols-[1fr_70px] gap-1.5 items-end">
                <FieldRow label="Prepaid Interest (per-day rate)">
                  <CurrencyInput
                    value={quote.prepaids.prepaidInterest.interestRate}
                    onChange={v => updatePrepaids({
                      prepaidInterest: { ...quote.prepaids.prepaidInterest, interestRate: v },
                    })}
                  />
                </FieldRow>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Days</p>
                  <input
                    type="number"
                    min={0}
                    value={Number(quote.prepaids.prepaidInterest.period)}
                    onChange={e => updatePrepaids({
                      prepaidInterest: { ...quote.prepaids.prepaidInterest, period: Number(e.target.value) },
                    })}
                    className="w-full px-2 py-1.5 rounded bg-[#1a1a1a] border border-[#3a3a3a] text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section G: Initial Escrow */}
          <div className="pt-3 border-t border-[#2a2a2a]">
            <SectionHeader letter="G" title="Initial Escrow Payment at Closing" total={totals.sectionG} />
            <div className="space-y-2 mt-1">
              <EscrowRow
                label="Homeowner's Insurance"
                monthlyAmount={hoMonthly}
                period={Number(quote.escrowPayment.homeOwnerInsurance.period)}
                onPeriodChange={v => updateEscrow('homeOwnerInsurance', { period: v })}
              />
              <EscrowRow
                label="Mortgage Insurance"
                monthlyAmount={monthlyMI}
                period={Number(quote.escrowPayment.mortgageInsurance.period)}
                onPeriodChange={v => updateEscrow('mortgageInsurance', { period: v })}
              />
              <EscrowRow
                label="Flood Insurance"
                monthlyAmount={floodMonthly}
                period={Number(quote.escrowPayment.floodInsurance.period)}
                onPeriodChange={v => updateEscrow('floodInsurance', { period: v })}
              />
              <EscrowRow
                label="Property Taxes"
                monthlyAmount={taxMonthly}
                period={Number(quote.escrowPayment.propertyTaxes.period)}
                onPeriodChange={v => updateEscrow('propertyTaxes', { period: v })}
              />
            </div>
          </div>

          {/* Section H: Other */}
          <div className="pt-3 border-t border-[#2a2a2a]">
            <SectionHeader letter="H" title="Other" total={0} />
          </div>

          {/* I, J totals */}
          <div className="space-y-1.5 pt-3 border-t-2 border-[#555]">
            <div className="flex justify-between text-xs text-gray-300">
              <span>I. Total Other Costs (E + F + G)</span>
              <span className="font-mono">{formatCurrency(totals.sectionI)}</span>
            </div>
            <div className="flex justify-between text-xs font-bold text-white">
              <span>J. Total Closing Costs (D + I)</span>
              <span className="font-mono">{formatCurrency(totals.sectionJ)}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>Lender Credits</span>
              <span className="font-mono text-green-400">−{formatCurrency(totals.lenderCredits)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Calculating Cash to Close ── */}
      <div className="mt-8">
        <div className="flex items-center gap-1 mb-3">
          <span className="text-blue-400 font-medium">Calculating</span>
          <span className="text-white font-bold">Cash to Close</span>
        </div>
        <div className="border-b border-[#3a3a3a] mb-4" />

        <div className="rounded bg-[#1a1a1a] border border-[#2a2a2a] divide-y divide-[#2a2a2a]">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-gray-300">Total Closing Costs (J)</span>
            <span className="text-sm font-mono text-gray-100">{formatCurrency(totals.sectionJ)}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-gray-300">Total Loan Amount</span>
            <span className="text-sm font-mono text-gray-100">{formatCurrency(quote.totalLoanAmount)}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-gray-300">Estimated Cash to Close (From) Borrower</span>
            <span className="text-sm font-mono font-bold text-blue-300">{formatCurrency(totals.cashToClose)}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-gray-300">Total Closing Costs Financed</span>
            <span className="text-sm font-mono text-gray-100">
              {formatCurrency(quote.isClosingCostFinanced ? totals.sectionJ : quote.closingCostFinanced)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
