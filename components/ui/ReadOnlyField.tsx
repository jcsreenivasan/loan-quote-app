import { formatCurrency } from '@/lib/defaults'

interface Props {
  label: string
  value: number
  highlight?: boolean
  sublabel?: string
}

export default function ReadOnlyField({ label, value, highlight, sublabel }: Props) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[#333] last:border-0">
      <div>
        <span className="text-sm text-gray-300">{label}</span>
        {sublabel && <p className="text-xs text-gray-600 mt-0.5">{sublabel}</p>}
      </div>
      <span className={`text-sm font-mono ${highlight ? 'text-blue-300 font-semibold' : 'text-gray-200'}`}>
        {formatCurrency(value)}
      </span>
    </div>
  )
}
