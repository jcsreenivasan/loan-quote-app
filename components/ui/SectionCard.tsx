'use client'

interface Props {
  title: string
  children: React.ReactNode
  className?: string
}

export default function SectionCard({ title, children, className = '' }: Props) {
  return (
    <div className={`rounded-lg border border-[#3a3a3a] bg-[#242424] overflow-hidden ${className}`}>
      <div className="px-4 py-3 border-b border-[#3a3a3a] bg-[#2a2a2a]">
        <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wide">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}
