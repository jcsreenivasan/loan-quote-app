'use client'

import { useState, useCallback } from 'react'

interface Props {
  value: number      // stored as decimal e.g. 0.065
  onChange: (value: number) => void
  placeholder?: string
  disabled?: boolean
  error?: string
  warning?: string
  decimals?: number
  className?: string
}

export default function PercentInput({ value, onChange, placeholder = '0.000', disabled, error, warning, decimals = 3, className = '' }: Props) {
  const [focused, setFocused] = useState(false)
  const [raw, setRaw] = useState('')

  const displayValue = focused
    ? raw
    : value === 0
    ? ''
    : (value * 100).toFixed(decimals)

  const handleFocus = useCallback(() => {
    setFocused(true)
    setRaw(value === 0 ? '' : (value * 100).toFixed(decimals))
  }, [value, decimals])

  const handleBlur = useCallback(() => {
    setFocused(false)
    const parsed = parseFloat(raw)
    onChange(isNaN(parsed) ? 0 : parsed / 100)
  }, [raw, onChange])

  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={e => setRaw(e.target.value.replace(/[^0-9.]/g, ''))}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full pl-3 pr-7 py-2 rounded bg-[#1a1a1a] border text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 transition disabled:opacity-50
          ${error ? 'border-red-500' : warning ? 'border-yellow-500' : 'border-[#3a3a3a] hover:border-[#555]'}`}
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">%</span>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
      {!error && warning && <p className="mt-1 text-xs text-yellow-400">{warning}</p>}
    </div>
  )
}
