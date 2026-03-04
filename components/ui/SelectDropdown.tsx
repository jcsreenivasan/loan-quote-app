'use client'

import { ChevronDown } from 'lucide-react'

interface Props {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[] | string[]
  placeholder?: string
  disabled?: boolean
  error?: string
  className?: string
}

export default function SelectDropdown({ value, onChange, options, placeholder = 'Select', disabled, error, className = '' }: Props) {
  const normalized = options.map(o =>
    typeof o === 'string' ? { value: o, label: o } : o
  )

  return (
    <div className={className}>
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          disabled={disabled}
          className={`w-full px-3 py-2 pr-8 rounded bg-[#1a1a1a] border text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition disabled:opacity-50 appearance-none cursor-pointer
            ${error ? 'border-red-500' : 'border-[#3a3a3a] hover:border-[#555]'}
            ${!value ? 'text-gray-500' : 'text-white'}`}
        >
          <option value="" disabled>{placeholder}</option>
          {normalized.map(o => (
            <option key={o.value} value={o.value} className="bg-[#2a2a2a] text-white">{o.label}</option>
          ))}
        </select>
        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
      </div>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  )
}
