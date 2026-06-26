'use client'
import { useState } from 'react'

interface NegotiationScriptCardProps {
  mandiP50: number;
  middlemanPrice: number;
  spread: number;
  spreadPct: number;
  verdict: 'fair' | 'caution' | 'exploit';
}

export function NegotiationScriptCard({
  mandiP50, middlemanPrice, spread, spreadPct, verdict
}: NegotiationScriptCardProps) {
  const [script, setScript] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function generateScript() {
    setLoading(true)
    try {
      const res = await fetch('/api/middleman/negotiation-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mandiP50, middlemanPrice, spread, spreadPct, verdict }),
      })
      const data = await res.json()
      setScript(data.script)
    } finally {
      setLoading(false)
    }
  }

  // WhatsApp share
  function shareScript() {
    const encoded = encodeURIComponent(script || '')
    window.open(`https://wa.me/?text=${encoded}`, '_blank')
  }

  return (
    <div className="border border-[#E3EDE7] rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">Negotiation Script</h3>
        {!script && (
          <button
            onClick={generateScript}
            disabled={loading}
            className="text-sm text-[#1A5C34] border border-[#3DAE72] rounded-lg px-3 py-1.5
                       hover:bg-[#EDF7F1] transition-colors disabled:opacity-50"
          >
            {loading ? 'Generating...' : '✨ Generate Script'}
          </button>
        )}
      </div>

      {script ? (
        <>
          <div className="bg-[#F4F7F5] rounded-lg p-4 text-sm leading-relaxed
                          font-[Noto_Sans_Devanagari] whitespace-pre-line">
            {script}
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => navigator.clipboard.writeText(script)}
              className="text-xs text-gray-500 border border-[#E3EDE7] rounded px-3 py-1.5
                         hover:bg-gray-50"
            >
              📋 Copy
            </button>
            <button
              onClick={shareScript}
              className="text-xs text-[#25D366] border border-[#25D366] rounded px-3 py-1.5
                         hover:bg-[#ECF8F1]"
            >
              📤 Share on WhatsApp
            </button>
            <button
              onClick={() => setScript(null)}
              className="text-xs text-gray-400 hover:text-gray-600 ml-auto"
            >
              Regenerate
            </button>
          </div>
        </>
      ) : (
        <p className="text-sm text-gray-400">
          Generate a Hindi negotiation script to use when talking to your middleman.
        </p>
      )}
    </div>
  )
}
