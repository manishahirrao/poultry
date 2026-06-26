'use client'
import { useState } from 'react'
import { z } from 'zod'

interface Props {
  isOpen: boolean
  onClose: () => void
  mandiId: string
  mandiName: string
  todayP50: number | null
  language: string
}

const AlertSchema = z.object({
  alertType: z.enum(['above_price', 'below_price', 'signal_sell']),
  thresholdRs: z.number().min(50).max(500).optional(),
  notifyWhatsApp: z.boolean(),
  notifyEmail: z.boolean(),
  notifyInApp: z.boolean(),
})

export function PriceAlertPanel({ isOpen, onClose, mandiId, mandiName, todayP50, language }: Props) {
  const isHindi = language === 'hi'
  const [alertType, setAlertType] = useState<'above_price' | 'below_price' | 'signal_sell'>('signal_sell')
  const [thresholdRs, setThresholdRs] = useState<number>(todayP50 ? Math.round(todayP50 * 1.05) : 180)
  const [notifyWhatsApp, setNotifyWhatsApp] = useState(true)
  const [notifyEmail, setNotifyEmail] = useState(true)
  const [notifyInApp, setNotifyInApp] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setFloppyDiskd] = useState(false)

  async function handleFloppyDisk() {
    setSaving(true)
    try {
      const payload = {
        mandiId,
        alertType,
        thresholdRs: alertType !== 'signal_sell' ? thresholdRs : null,
        notifyWhatsApp,
        notifyEmail,
        notifyInApp,
      }
      const res = await fetch('/api/price-intelligence/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('FloppyDisk failed')
      setFloppyDiskd(true)
      setTimeout(() => { setFloppyDiskd(false); onClose() }, 1500)
    } catch {
      alert(isHindi ? 'अलर्ट सुरक्षित नहीं हो सका। फिर से कोशिश करें।' : 'Could not save alert. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl z-50 flex flex-col"
        role="dialog"
        aria-label={isHindi ? 'मूल्य अलर्ट सेट करें' : 'Set Price Alert'}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E3EDE7]">
          <h2 className="text-sm font-semibold text-gray-900">
            {isHindi ? 'मूल्य अलर्ट सेट करें' : 'Set Price Alert'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Mandi (read-only) */}
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">
              {isHindi ? 'मंडी' : 'Mandi'}
            </p>
            <p className="text-sm font-medium text-gray-900">{mandiName}</p>
          </div>

          {/* Alert type */}
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-2">
              {isHindi ? 'अलर्ट का प्रकार' : 'Alert Type'}
            </p>
            <div className="space-y-2">
              {[
                { key: 'signal_sell', hi: 'जब बिक्री संकेत आए', en: 'When sell signal activates' },
                { key: 'above_price', hi: 'जब कीमत ₹___ से ऊपर', en: 'When price rises above ₹___' },
                { key: 'below_price', hi: 'जब कीमत ₹___ से नीचे', en: 'When price drops below ₹___' },
              ].map(opt => (
                <label key={opt.key} className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="radio"
                    name="alertType"
                    value={opt.key}
                    checked={alertType === opt.key}
                    onChange={() => setAlertType(opt.key as any)}
                    className="accent-[#1A5C34]"
                  />
                  <span className="text-sm text-gray-700">
                    {isHindi ? opt.hi : opt.en}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Threshold input — shown for above/below types */}
          {alertType !== 'signal_sell' && (
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-2">
                {isHindi ? 'मूल्य सीमा (₹/kg)' : 'Price Threshold (₹/kg)'}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-sm">₹</span>
                <input
                  type="number"
                  value={thresholdRs}
                  onChange={e => setThresholdRs(Number(e.target.value))}
                  min={50}
                  max={500}
                  step={1}
                  className="flex-1 text-sm px-3 py-2 border border-[#E3EDE7] rounded-lg
                               focus:outline-none focus:border-[#1A5C34]"
                />
                <span className="text-gray-400 text-sm">/kg</span>
              </div>
              {todayP50 && (
                <p className="text-[10px] text-gray-400 mt-1">
                  {isHindi ? 'आज का P50:' : "Today's P50:"} ₹{todayP50}/kg
                </p>
              )}
            </div>
          )}

          {/* Notification channels */}
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-2">
              {isHindi ? 'सूचना कैसे पाएं' : 'Notify via'}
            </p>
            <div className="space-y-2">
              {[
                { key: 'wa', label: 'WhatsApp', checked: notifyWhatsApp, set: setNotifyWhatsApp },
                { key: 'email', label: 'Email', checked: notifyEmail, set: setNotifyEmail },
                { key: 'app', label: isHindi ? 'App में' : 'In-App', checked: notifyInApp, set: setNotifyInApp },
              ].map(ch => (
                <label key={ch.key} className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ch.checked}
                    onChange={e => ch.set(e.target.checked)}
                    className="accent-[#1A5C34] w-4 h-4"
                  />
                  <span className="text-sm text-gray-700">{ch.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[#E3EDE7]">
          <button
            onClick={handleFloppyDisk}
            disabled={saving || saved}
            className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors ${
              saved
                ? 'bg-[#EDF7F1] text-[#1A5C34]'
                : 'bg-[#1A5C34] text-white hover:bg-[#1F7040] disabled:opacity-60'
            }`}
          >
            {saved ? (isHindi ? '✓ अलर्ट सुरक्षित हो गया' : '✓ Alert FloppyDiskd') :
             saving ? (isHindi ? 'सुरक्षित हो रहा है...' : 'Saving...') :
                      (isHindi ? 'अलर्ट सुरक्षित करें' : 'FloppyDisk Alert')}
          </button>
        </div>
      </div>
    </>
  )
}
