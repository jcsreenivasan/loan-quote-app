'use client'

interface Props {
  value: boolean
  onChange: (value: boolean) => void
  disabled?: boolean
  label?: string
}

export default function ToggleSwitch({ value, onChange, disabled, label }: Props) {
  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-xs text-gray-400">{label}</span>}
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => !disabled && onChange(!value)}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#2a2a2a] disabled:opacity-50
          ${value ? 'bg-blue-600' : 'bg-[#444]'}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform
            ${value ? 'translate-x-6' : 'translate-x-1'}`}
        />
      </button>
      <span className={`text-xs font-medium ${value ? 'text-blue-400' : 'text-gray-500'}`}>
        {value ? 'Yes' : 'No'}
      </span>
    </div>
  )
}
