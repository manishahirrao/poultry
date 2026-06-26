'use client'

import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { ChartLine, ClockCounterClockwise, Download } from '@phosphor-icons/react'
import { useRouter, usePathname } from 'next/navigation'
import { PageHeader } from '@/components/layout/PageHeader'

export default function DownloadPage() {
  const router = useRouter()
  const pathname = usePathname()

  // ── Subsection navigation tabs ───────────────────────────────────────────────
  const subsectionTabs = [
    { id: 'forecast', label: 'Forecast', labelHi: 'पूर्वानुमान', href: '/dashboard/price-intelligence/forecast', icon: ChartLine },
    { id: 'historical', label: 'Historical', labelHi: 'ऐतिहासिक', href: '/dashboard/price-intelligence/historical', icon: ClockCounterClockwise },
    { id: 'download', label: 'Download', labelHi: 'डाउनलोड', href: '/dashboard/price-intelligence/download', icon: Download },
  ]

  const activeTab = subsectionTabs.find(tab => pathname === tab.href)?.id || 'download'

  return (
    <div className="min-h-screen bg-[#F4F7F5]">
      {/* Page header with title, subtitle, and action buttons */}
      <PageHeader
        title="Download Data"
        subtitle="Download broiler price data, forecasts, and reports"
        actions={[]}
        breadcrumb={['Price Intelligence', 'Download']}
      />

      {/* ── SUBSECTION NAVBAR ── */}
      {/* Sub-navigation for Price Intelligence sections */}
      <div className="px-6 max-w-[1200px] mx-auto">
        <nav className="flex items-center gap-1 border-b border-neutral-200 bg-white rounded-t-xl px-4" aria-label="Price Intelligence subsection navigation">
          {subsectionTabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => router.push(tab.href)}
                className={`
                  flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative
                  ${isActive
                    ? 'text-brandGreen700'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                  }
                `}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon size={18} weight={isActive ? 'fill' : 'regular'} />
                <span>{tab.label}</span>
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brandGreen700" />
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* ── DOWNLOAD CONTENT ── */}
      <div className="px-6 pb-8 max-w-[1200px] mx-auto">
        <div className="bg-white rounded-b-xl p-8 border border-neutral-200 border-t-0">
          <div className="text-center py-12">
            <Download size={48} className="mx-auto text-neutral-400 mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Download Center</h3>
            <p className="text-sm text-neutral-600 mb-4">
              Download price data, forecasts, and reports in various formats
            </p>
            <p className="text-xs text-neutral-500 italic">
              Download feature coming soon
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
