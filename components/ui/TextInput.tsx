'use client'

interface Props {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  placeholder?: string
  disabled?: boolean
  error?: string
  type?: string
  className?: string
}

export default function TextInput({ value, onChange, onBlur, placeholder, disabled, error, type = 'text', className = '' }: Props) {
  return (
    <div className={className}>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        onBlur={onBlur}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full px-3 py-2 rounded bg-[#1a1a1a] border text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 transition disabled:opacity-50
          ${error ? 'border-red-500' : 'border-[#3a3a3a] hover:border-[#555]'}`}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  )
}
