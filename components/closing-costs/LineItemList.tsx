'use client'

import { X, Copy } from 'lucide-react'
import CurrencyInput from '@/components/ui/CurrencyInput'
import type { LineItem } from '@/lib/types'

interface Props {
  items:       LineItem[]
  onChange:    (items: LineItem[]) => void
  lockedCount?: number
  typeOptions?: string[]
}

export default function LineItemList({
  items,
  onChange,
  lockedCount,
  typeOptions,
}: Props) {
  const defaultCount = lockedCount ?? 0

  function updateType(_id: string, type: string) {
    onChange(items.map(i => i._id === _id ? { ...i, type } : i))
  }

  function updateAmount(_id: string, amount: number) {
    onChange(items.map(i => i._id === _id ? { ...i, amount } : i))
  }

  function copyItem(_id: string) {
    const item = items.find(i => i._id === _id)
    if (!item) return
    const newItem: LineItem = { ...item, _id: crypto.randomUUID() }
    const idx = items.findIndex(i => i._id === _id)
    const next = [...items]
    next.splice(idx + 1, 0, newItem)
    onChange(next)
  }

  function removeItem(_id: string) {
    onChange(items.filter(i => i._id !== _id))
  }

  return (
    <div className="space-y-1">
      {items.map((item, idx) => {
        const isLocked = idx < defaultCount
        return (
          <div key={item._id} className="flex items-center gap-1.5 group">
            {/* Type: select dropdown if options provided, else read-only text */}
            {typeOptions ? (
              <select
                value={item.type ?? ''}
                onChange={e => updateType(item._id, e.target.value)}
                className="flex-1 px-2 py-1.5 rounded bg-[#1a1a1a] border border-[#3a3a3a] text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-0"
              >
                <option value="">— select type —</option>
                {typeOptions.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            ) : (
              <span className="flex-1 text-sm text-gray-300 truncate">{item.type || '—'}</span>
            )}

            {/* Amount */}
            <div className="w-36 shrink-0">
              <CurrencyInput
                value={item.amount}
                onChange={v => updateAmount(item._id, v)}
              />
            </div>

            {/* Copy button */}
            <button
              onClick={() => copyItem(item._id)}
              className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-blue-400 transition p-0.5"
              title="Duplicate"
            >
              <Copy size={13} />
            </button>

            {/* Delete button */}
            {!isLocked ? (
              <button
                onClick={() => removeItem(item._id)}
                className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition p-0.5"
                title="Remove"
              >
                <X size={13} />
              </button>
            ) : (
              <div className="w-[22px]" />
            )}
          </div>
        )
      })}
    </div>
  )
}
