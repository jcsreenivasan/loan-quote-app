'use client'

import { useState, useCallback } from 'react'

interface Props {
  value: number
  onChange: (value: number) => void
  placeholder?: string
  disabled?: boolean
  error?: string
  className?: string
}

export default function CurrencyInput({ value, onChange, placeholder = '0.00', disabled, error, className = '' }: Props) {
  const [focused, setFocused] = useState(false)
  const [raw, setRaw] = useState('')

  const display = focused
    ? raw
    : value === 0
    ? ''
    : value.toFixed(2)

  const handleFocus = useCallback(() => {
    setFocused(true)
    setRaw(value === 0 ? '' : value.toFixed(2))
  }, [value])

  const handleBlur = useCallback(() => {
    setFocused(false)
    const parsed = parseFloat(raw.replace(/,/g, ''))
    onChange(isNaN(parsed) ? 0 : Math.max(0, parsed))
  }, [raw, onChange])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/[^0-9.]/g, '')
    setRaw(v)
  }, [])

  return (
    <div className={`relative ${className}`}>
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">$</span>
      <input
        type="text"
        inputMode="decimal"
        value={display}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full pl-7 pr-3 py-2 rounded bg-[#1a1a1a] border text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-red-500' : 'border-[#3a3a3a] hover:border-[#555]'}`}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  )
}
