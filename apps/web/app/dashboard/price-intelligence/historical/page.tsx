'use client'

import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { ChartLine, ClockCounterClockwise, Download } from '@phosphor-icons/react'
import { useRouter, usePathname } from 'next/navigation'
import { PageHeader } from '@/components/layout/PageHeader'
import { useLanguage } from '@/providers/LanguageProvider'

// Mock historical data for demonstration
const mockHistoricalData = [
  { date: '2026-05-01', mandi: 'Gorakhpur', price: 155.50 },
  { date: '2026-05-02', mandi: 'Gorakhpur', price: 156.25 },
  { date: '2026-05-03', mandi: 'Gorakhpur', price: 157.00 },
  { date: '2026-05-04', mandi: 'Gorakhpur', price: 156.75 },
  { date: '2026-05-05', mandi: 'Gorakhpur', price: 158.00 },
  { date: '2026-05-06', mandi: 'Gorakhpur', price: 158.50 },
  { date: '2026-05-07', mandi: 'Gorakhpur', price: 159.25 },
  { date: '2026-05-08', mandi: 'Gorakhpur', price: 159.00 },
  { date: '2026-05-09', mandi: 'Gorakhpur', price: 160.25 },
  { date: '2026-05-10', mandi: 'Gorakhpur', price: 161.00 },
  { date: '2026-05-11', mandi: 'Gorakhpur', price: 160.75 },
  { date: '2026-05-12', mandi: 'Gorakhpur', price: 159.50 },
  { date: '2026-05-13', mandi: 'Gorakhpur', price: 158.75 },
  { date: '2026-05-14', mandi: 'Gorakhpur', price: 159.00 },
  { date: '2026-05-15', mandi: 'Gorakhpur', price: 159.50 },
]

export default function HistoricalPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { language } = useLanguage()

  // ── Subsection navigation tabs ───────────────────────────────────────────────
  const subsectionTabs = [
    { id: 'forecast', label: 'Forecast', labelHi: 'पूर्वानुमान', href: '/dashboard/price-intelligence/forecast', icon: ChartLine },
    { id: 'historical', label: 'Historical', labelHi: 'ऐतिहासिक', href: '/dashboard/price-intelligence/historical', icon: ClockCounterClockwise },
    { id: 'download', label: 'Download', labelHi: 'डाउनलोड', href: '/dashboard/price-intelligence/download', icon: Download },
  ]

  const activeTab = subsectionTabs.find(tab => pathname === tab.href)?.id || 'historical'

  return (
    <div className="min-h-screen bg-[#F4F7F5]">
      {/* Page header with title, subtitle, and action buttons */}
      <PageHeader
        title={language === 'hi' ? 'ऐतिहासिक भाव' : 'Historical Prices'}
        subtitle={language === 'hi' ? 'विभिन्न मंडियों में ऐतिहासिक ब्रॉयलर भाव डेटा और रुझान देखें' : 'View historical broiler price data and trends across mandis'}
        actions={[]}
        breadcrumb={['Price Intelligence', language === 'hi' ? 'ऐतिहासिक भाव' : 'Historical Prices']}
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
                <span>{language === 'hi' ? tab.labelHi : tab.label}</span>
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brandGreen700" />
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* ── HISTORICAL PRICES CONTENT ── */}
      <div className="px-6 pb-8 max-w-[1200px] mx-auto">
        <div className="bg-white rounded-b-xl p-8 border border-neutral-200 border-t-0">
          {/* Historical Price Table */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">
              {language === 'hi' ? 'ऐतिहासिक भाव डेटा' : 'Historical Price Data'}
            </h3>
            <p className="text-sm text-neutral-600 mb-6">
              {language === 'hi' ? 'गोरखपुर मंडी के लिए पिछले 15 दिनों का भाव डेटा' : 'Price data for the last 15 days for Gorakhpur mandi'}
            </p>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-900">
                      {language === 'hi' ? 'तारीख' : 'Date'}
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-900">
                      {language === 'hi' ? 'मंडी' : 'Mandi'}
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-neutral-900">
                      {language === 'hi' ? 'भाव (₹/किग्रा)' : 'Price (₹/kg)'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {mockHistoricalData.map((row, index) => (
                    <tr key={index} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="py-3 px-4 text-sm text-neutral-700">{row.date}</td>
                      <td className="py-3 px-4 text-sm text-neutral-700">{row.mandi}</td>
                      <td className="py-3 px-4 text-sm text-neutral-700 text-right font-medium">₹{row.price.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-neutral-200">
            <div className="bg-neutral-50 rounded-lg p-4">
              <p className="text-xs text-neutral-600 mb-1">{language === 'hi' ? 'औसत भाव' : 'Average Price'}</p>
              <p className="text-lg font-semibold text-neutral-900">₹{(mockHistoricalData.reduce((sum, row) => sum + row.price, 0) / mockHistoricalData.length).toFixed(2)}</p>
            </div>
            <div className="bg-neutral-50 rounded-lg p-4">
              <p className="text-xs text-neutral-600 mb-1">{language === 'hi' ? 'उच्चतम भाव' : 'Highest Price'}</p>
              <p className="text-lg font-semibold text-neutral-900">₹{Math.max(...mockHistoricalData.map(row => row.price)).toFixed(2)}</p>
            </div>
            <div className="bg-neutral-50 rounded-lg p-4">
              <p className="text-xs text-neutral-600 mb-1">{language === 'hi' ? 'न्यूनतम भाव' : 'Lowest Price'}</p>
              <p className="text-lg font-semibold text-neutral-900">₹{Math.min(...mockHistoricalData.map(row => row.price)).toFixed(2)}</p>
            </div>
            <div className="bg-neutral-50 rounded-lg p-4">
              <p className="text-xs text-neutral-600 mb-1">{language === 'hi' ? 'मूल्य श्रेणी' : 'Price Range'}</p>
              <p className="text-lg font-semibold text-neutral-900">₹{(Math.max(...mockHistoricalData.map(row => row.price)) - Math.min(...mockHistoricalData.map(row => row.price))).toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
