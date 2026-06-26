import { embedTextWatermark } from '@/lib/watermark'

interface ForecastDisclaimerProps {
  language: string
  userId: string
}

const DISCLAIMER_HI = (mape_d3: string, mape_d14: string, mape_d30: string) =>
  `पूर्वानुमान की सटीकता दूर की तारीखों के लिए कम होती है। D+1-3: उच्च विश्वास (<${mape_d3}% MAPE)। D+7-14: मध्यम (<${mape_d14}%)। D+15-30: केवल संकेत (<${mape_d30}%)। FlockIQ व्यापार निर्णयों के लिए जिम्मेदार नहीं है। लेन-देन से पहले स्थानीय मंडी से सत्यापित करें।`

const DISCLAIMER_EN = (mape_d3: string, mape_d14: string, mape_d30: string) =>
  `Forecast accuracy decreases with prediction horizon. Day 1–3: high confidence (<${mape_d3}% MAPE). Day 7–14: moderate (<${mape_d14}%). Day 15–30: indicative only (<${mape_d30}%). FlockIQ is not liable for trading decisions. Verify with local mandi before transacting.`

export function ForecastDisclaimer({ language, userId }: ForecastDisclaimerProps) {
  // These values should ideally come from model_accuracy table
  // For now: hardcoded with clear constants (update when model retrains)
  const MAPE_D3 = '6'
  const MAPE_D14 = '10'
  const MAPE_D30 = '15'

  const rawText = language === 'hi'
    ? DISCLAIMER_HI(MAPE_D3, MAPE_D14, MAPE_D30)
    : DISCLAIMER_EN(MAPE_D3, MAPE_D14, MAPE_D30)

  // Embed invisible watermark in text (zero-width chars after first word)
  const watermarkedText = embedTextWatermark(rawText, userId)

  return (
    <div
      className="mx-6 mb-0 mt-2 flex items-start gap-2 rounded-lg border"
      style={{ background: '#FFFBEB', borderColor: '#D97706', padding: '7px 12px' }}
      role="note"
      aria-label="Forecast accuracy disclaimer"
      // NEVER add: hidden, display:none, or any collapsible logic here
    >
      {/* Warning icon */}
      <svg
        width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        className="mt-0.5 flex-shrink-0" aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>

      {/* Text — watermarked */}
      <p
        className="text-[11px] leading-relaxed"
        style={{ color: '#92400E' }}
        lang={language === 'hi' ? 'hi' : 'en'}
        // dangerouslySetInnerHTML used ONLY to preserve zero-width chars
        // These chars are safe — no HTML, just Unicode text
        dangerouslySetInnerHTML={{ __html: watermarkedText }}
      />
    </div>
  )
}

// CRITICAL: This component must NOT have:
//   - onClick handlers that hide it
//   - CSS class that adds display:none
//   - User preference override
//   - Print: none in CSS
//
// If any developer tries to add collapsibility: reject in code review
