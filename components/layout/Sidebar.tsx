'use client'

import { LayoutDashboard, FileText, Users, Settings, HelpCircle, ChevronRight } from 'lucide-react'

const NAV = [
  { icon: LayoutDashboard, label: 'Dashboard' },
  { icon: FileText,         label: 'Loan Details', active: true },
  { icon: FileText,         label: 'Forms' },
  { icon: Users,            label: 'My Team' },
  { icon: Settings,         label: 'Settings' },
  { icon: HelpCircle,       label: 'Support' },
]

export default function Sidebar() {
  return (
    <aside className="w-56 min-h-screen bg-[#1a1a1a] border-r border-[#3a3a3a] flex flex-col py-4 shrink-0">
      {/* Logo area */}
      <div className="px-4 mb-6">
        <div className="text-white font-bold text-lg tracking-tight">LoanQuote</div>
        <div className="text-xs text-gray-500 mt-0.5">Mortgage Tool</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 space-y-0.5">
        {NAV.map(({ icon: Icon, label, active }) => (
          <button
            key={label}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors group
              ${active
                ? 'bg-blue-600/20 text-blue-400 font-medium'
                : 'text-gray-400 hover:bg-[#2a2a2a] hover:text-gray-200'
              }`}
          >
            <Icon size={16} className="shrink-0" />
            <span className="flex-1 text-left">{label}</span>
            {active && <ChevronRight size={14} className="text-blue-400 opacity-60" />}
          </button>
        ))}
      </nav>
    </aside>
  )
}
