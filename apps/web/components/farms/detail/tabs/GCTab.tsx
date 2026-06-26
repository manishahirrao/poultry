'use client'

import { useState, useEffect } from 'react'
import { Download } from '@phosphor-icons/react'
import { GCSummaryCard } from '@/components/gc/GCSummaryCard'
import { GCInputForm } from '@/components/gc/GCInputForm'
import { GCCostTrendChart } from '@/components/gc/GCCostTrendChart'
import { GCBreakdownPieChart } from '@/components/gc/GCBreakdownPieChart'
import { createClient } from '@/utils/supabase/client'

interface GCTabProps {
  farmId: string
  batchId: string
  birdsPlaced?: number
  language?: string
}

export function GCTab({ farmId, batchId, birdsPlaced = 0, language = 'hi' }: GCTabProps) {
  const [userSegment, setUserSegment] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const isHindi = language === 'hi'

  // Fetch user segment to determine edit permissions
  useEffect(() => {
    const fetchUserSegment = async () => {
      try {
        const supabase = createClient()
        if (!supabase) return

        const { data: { user } } = await supabase.auth.getUser()
        if (!user?.phone) return

        const { data: customer } = await supabase
          .from('customers')
          .select('segment')
          .eq('phone', user.phone)
          .single()

        setUserSegment(customer?.segment || null)
      } catch (error) {
        console.error('Error fetching user segment:', error)
      }
    }

    fetchUserSegment()
  }, [])

  // S1 users can VIEW but not EDIT GC
  // S2 users can VIEW and EDIT GC
  const canEditGC = userSegment === 'S2' || userSegment === 'admin'

  const handleDownloadPDF = async () => {
    setIsDownloading(true)
    try {
      const response = await fetch(`/api/farms/${farmId}/gc/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchId }),
      })

      if (!response.ok) throw new Error('Failed to generate PDF')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `GC-Report-${farmId}-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading PDF:', error)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">
              {isHindi ? 'Growing Cost (GC)' : 'Growing Cost (GC)'}
            </h2>
            <p className="text-sm text-gray-500">
              {isHindi ? 'अपने बैच की प्रति किलो जीवित वजन उत्पादन लागत ट्रैक करें' : 'Track your batch cost per kg live weight produced'}
            </p>
          </div>
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1A5C34] text-white rounded-lg hover:bg-[#1F7040] transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={18} />
            {isDownloading ? 'Generating...' : isHindi ? 'PDF डाउनलोड' : 'Download PDF'}
          </button>
        </div>
        {userSegment === 'S1' && (
          <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-xs text-amber-800">
              {isHindi 
                ? 'नोट: आप GC डेटा देख सकते हैं लेकिन संपादित नहीं कर सकते। GC लागत आपके इंटीग्रेटर द्वारा प्रबंधित की जाती है।'
                : 'Note: You can view GC data but cannot edit it. GC costs are managed by your integrator.'}
            </p>
          </div>
        )}
      </div>

      {/* GC Summary Card */}
      <GCSummaryCard farmId={farmId} size="full" language={language} />

      {/* Two-column layout for charts and form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column: Charts */}
        <div className="space-y-6">
          <GCCostTrendChart farmId={farmId} language={language} />
          <GCBreakdownPieChart farmId={farmId} language={language} />
        </div>

        {/* Right column: Input Form (only for S2/admin) */}
        {canEditGC ? (
          <div>
            <GCInputForm 
              farmId={farmId} 
              language={language} 
              birdsPlaced={birdsPlaced}
              onSaved={() => {
                // Trigger revalidation of GC data
                // SWR will handle this automatically
              }}
            />
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                {isHindi 
                  ? 'GC लागत संपादन केवल इंटीग्रेटर के लिए उपलब्ध है'
                  : 'GC cost editing is only available for integrators'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-[#EDF7F1] border border-[#1A5C34] rounded-lg p-4">
        <h3 className="text-sm font-semibold text-[#1A5C34] mb-2">
          {isHindi ? 'GC कैसे कम करें?' : 'How to reduce GC?'}
        </h3>
        <ul className="text-xs text-gray-700 space-y-1">
          <li>• {isHindi ? 'फीड रूपांतरण दर (FCR) में सुधार करें' : 'Improve feed conversion ratio (FCR)'}</li>
          <li>• {isHindi ? 'उच्च गुणवत्ता वाले DOC और फीड का उपयोग करें' : 'Use high-quality DOC and feed'}</li>
          <li>• {isHindi ? 'मृत्यु दर को कम करें' : 'Reduce mortality rate'}</li>
          <li>• {isHindi ? 'ऊर्जा और पानी की बर्बादी को कम करें' : 'Reduce energy and water waste'}</li>
          <li>• {isHindi ? 'बैच के लिए उचित लिटर प्रबंधन' : 'Proper litter management for the batch'}</li>
        </ul>
      </div>
    </div>
  )
}
