interface Props {
  label: string
  required?: boolean
  children: React.ReactNode
  hint?: string
  error?: string
  warning?: string
  className?: string
}

export default function FieldRow({ label, required, children, hint, className = '' }: Props) {
  return (
    <div className={className}>
      <label className="block text-xs text-gray-400 mb-1">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-gray-600">{hint}</p>}
    </div>
  )
}
