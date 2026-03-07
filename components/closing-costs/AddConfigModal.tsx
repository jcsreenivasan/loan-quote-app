'use client'

import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { X } from 'lucide-react'
import type { LineItem } from '@/lib/types'

interface Props {
  onSave: (item: LineItem) => void
  onClose: () => void
  title?: string
}

export default function AddConfigModal({ onSave, onClose, title = 'Add Configuration' }: Props) {
  const [name,   setName]   = useState('')
  const [amount, setAmount] = useState('')

  function handleSave() {
    if (!name.trim()) return
    onSave({
      _id:             uuidv4(),
      type:            name.trim(),   // type serves as the display label
      amount:          parseFloat(amount) || 0,
      isAmountLockOpen: false,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Fee name"
              className="w-full px-3 py-2 rounded bg-[#1a1a1a] border border-[#3a3a3a] text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={e => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                placeholder="0.00"
                className="w-full pl-7 pr-3 py-2 rounded bg-[#1a1a1a] border border-[#3a3a3a] text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded text-sm text-gray-400 hover:text-white hover:bg-[#333] transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="px-4 py-2 rounded bg-blue-600 text-sm text-white font-medium hover:bg-blue-500 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
