// FlockIQ — Refund Policy Page
// File: apps/web/app/(marketing)/refund/page.tsx
// Version: v3.0 | June 2026
// Task Reference: LEGAL-001, TEST-001
// Requirements: 30-day accuracy guarantee refund policy

import { Metadata } from 'next';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import EyebrowBadge from '@/components/ui/EyebrowBadge';

// Generate metadata for SEO
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Refund Policy — रिफंड नीति | FlockIQ',
    description: 'FlockIQ refund policy — 30-day accuracy guarantee. Full refund if accuracy drops below 95%.',
    keywords: ['refund policy', 'money back guarantee', 'accuracy guarantee'],
    openGraph: {
      type: 'website',
      locale: 'hi_IN',
      alternateLocale: ['en_IN'],
      url: 'https://flockiq.com/refund',
      siteName: 'FlockIQ',
      title: 'Refund Policy — FlockIQ',
      description: '30-day accuracy guarantee refund policy.',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: 'FlockIQ — Refund Policy',
        },
      ],
    },
    alternates: {
      canonical: 'https://flockiq.com/refund',
      languages: {
        'hi-IN': 'https://flockiq.com/refund',
        'en-IN': 'https://flockiq.com/refund?lang=en',
        'x-default': 'https://flockiq.com/refund',
      },
    },
  };
}

export default function RefundPage() {
  const lastUpdated = 'May 20, 2026';

  return (
    <div className="min-h-screen bg-neutral50 py-section-vertical">
      <div className="mx-auto max-w-4xl px-containerPadding">
        {/* Header */}
        <div className="mb-12 text-center">
          <EyebrowBadge>Legal</EyebrowBadge>
          <h1 className="mt-4 font-heading1 text-neutral900">
            रिफंड नीति (Refund Policy)
          </h1>
          <p className="mt-4 font-bodyLarge text-neutral500">
            30-Day Accuracy Guarantee — Last updated: {lastUpdated}
          </p>
        </div>

        {/* Accuracy Guarantee Banner */}
        <div className="mb-12 rounded-2xl bg-brandGreen700 p-8 text-center text-white">
          <h2 className="font-heading2 mb-4">
            95%+ Accuracy Guarantee
          </h2>
          <p className="mb-6 font-bodyLarge text-white/90">
            अगर कभी हमारी accuracy 95% से नीचे जाती है, तो हम उस month का पूरा पैसा वापस कर देंगे।
            No questions asked, automatically processed।
          </p>
          <div className="font-statNumber text-white">
            100% Money Back
          </div>
        </div>

        <div className="prose prose-lg max-w-none space-y-8 rounded-2xl bg-white p-8 shadow-sm">
          {/* Accuracy Guarantee Details */}
          <section>
            <h2 className="font-heading2 text-neutral900">1. Accuracy Guarantee (Accuracy guarantee)</h2>
            <p className="font-bodyBase text-neutral700">
              <strong>What We Guarantee:</strong> हम guarantee करते हैं कि हमारी AI model की
              <strong>directional accuracy</strong> कम से कम 95% रहेगी। Directional accuracy मतलब:
              क्या भाव ऊपर जाएगा या नीचे — correct direction prediction।
            </p>
            <p className="font-bodyBase text-neutral700">
              <strong>How We Measure:</strong> हम accuracy measure करते हैं Gorakhpur के 6-month holdout data पर।
              Live accuracy dashboard public है — आप कभी भी check कर सकते हैं।
            </p>
          </section>

          {/* Refund Trigger */}
          <section>
            <h2 className="font-heading2 text-neutral900">2. Refund Trigger (Refund trigger)</h2>
            <p className="font-bodyBase text-neutral700">
              Refund automatically trigger होता है अगर:
            </p>
            <ul className="ml-6 list-disc font-bodyBase text-neutral700">
              <li>Rolling 30-day directional accuracy 95% से नीचे गिरती है</li>
              <li>यह measurement हमारे live accuracy dashboard पर visible है</li>
              <li>Customer को WhatsApp पर notification भेजा जाता है</li>
            </ul>
            <p className="font-bodyBase text-neutral700">
              <strong>Automatic Processing:</strong> Refund automatically processed होता है —
              कोई claim file करने की ज़रूरत नहीं। Payment method में 7 business days में refund आ जाएगा।
            </p>
          </section>

          {/* Refund Amount */}
          <section>
            <h2 className="font-heading2 text-neutral900">3. Refund Amount (Refund amount)</h2>
            <p className="font-bodyBase text-neutral700">
              <strong>Full Month Refund:</strong> Accuracy drop होने वाले month का पूरा amount refund होगा।
            </p>
            <p className="font-bodyBase text-neutral700">
              <strong>Example:</strong> अगर आप PulseFarm (₹2,000/माह) use कर रहे हैं और March में accuracy 94% रही,
              तो March का पूरा ₹2,000 refund होगा।
            </p>
          </section>

          {/* 14-Day Free Trial */}
          <section>
            <h2 className="font-heading2 text-neutral900">4. 14-Day Free Trial (14-day free trial)</h2>
            <p className="font-bodyBase text-neutral700">
              <strong>No Credit Card Required:</strong> 14-day free trial में कोई credit card नहीं चाहिए।
              आप fully explore कर सकते हैं।
            </p>
            <p className="font-bodyBase text-neutral700">
              <strong>Auto-Renewal:</strong> 14 दिन बाद, आप automatically PulseFarm plan पर switch हो जाएंगे —
              लेकिन सिर्फ तभी जब आप manually confirm करें। हम बिना permission के charge नहीं करते।
            </p>
          </section>

          {/* Cancellation Policy */}
          <section>
            <h2 className="font-heading2 text-neutral900">5. Cancellation Policy (Cancellation policy)</h2>
            <p className="font-bodyBase text-neutral700">
              <strong>Anytime Cancellation:</strong> आप कभी भी cancel कर सकते हैं — no questions asked।
            </p>
            <p className="font-bodyBase text-neutral700">
              <strong>Prorated Refund:</strong> Mid-month cancel करने पर, remaining days का prorated refund नहीं मिलता।
              Service current billing period के end तक continue रहेगी।
            </p>
            <p className="font-bodyBase text-neutral700">
              <strong>Annual Plans:</strong> Annual plan cancel करने पर, unused months का prorated refund मिल सकता है
              (accuracy guarantee के अलावा)।
            </p>
          </section>

          {/* Non-Refundable Cases */}
          <section>
            <h2 className="font-heading2 text-neutral900">6. Non-Refundable Cases (Non-refundable cases)</h2>
            <p className="font-bodyBase text-neutral700">
              Refund नहीं मिलेगा अगर:
            </p>
            <ul className="ml-6 list-disc font-bodyBase text-neutral700">
              <li>Accuracy 95% या उससे ऊपर है (आपके opinion से अलग हो सकता है, लेकिन data यही बोलता है)</li>
              <li>आपने service use नहीं किया (यह आपकी choice है)</li>
              <li>Market conditions की वजह से loss हुआ (predictions advisory हैं, financial advice नहीं)</li>
              <li>Account violation या fraud की वजह से termination हुआ</li>
            </ul>
          </section>

          {/* How to Request Refund */}
          <section>
            <h2 className="font-heading2 text-neutral900">7. How to Request Refund (Refund कैसे request करें)</h2>
            <p className="font-bodyBase text-neutral700">
              <strong>Accuracy Guarantee:</strong> Automatic — कोई request की ज़रूरत नहीं।
            </p>
            <p className="font-bodyBase text-neutral700">
              <strong>Other Cases:</strong> अगर आपको लगता है कि special circumstances हैं,
              तो हमसे contact करें:
            </p>
            <ul className="ml-6 list-disc font-bodyBase text-neutral700">
              <li><strong>Email:</strong> refunds@FlockIQ.ai</li>
              <li><strong>WhatsApp:</strong> +91-XXXXXXXXXX</li>
            </ul>
            <p className="font-bodyBase text-neutral700">
              हम 48 घंटे में respond करेंगे और case-by-case basis पर consider करेंगे।
            </p>
          </section>

          {/* Refund Processing Time */}
          <section>
            <h2 className="font-heading2 text-neutral900">8. Refund Processing Time (Refund processing time)</h2>
            <p className="font-bodyBase text-neutral700">
              <strong>Accuracy Guarantee:</strong> 7 business days में automatic refund।
            </p>
            <p className="font-bodyBase text-neutral700">
              <strong>Manual Requests:</strong> Approval के बाद 7-10 business days में refund।
            </p>
            <p className="font-bodyBase text-neutral700">
              <strong>Payment Method:</strong> Refund original payment method में जाएगा (UPI, card, या bank transfer)।
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="font-heading2 text-neutral900">9. Contact Us (संपर्क करें)</h2>
            <p className="font-bodyBase text-neutral700">
              Refund policy से related कोई questions के लिए:
            </p>
            <ul className="ml-6 list-disc font-bodyBase text-neutral700">
              <li><strong>Email:</strong> refunds@FlockIQ.ai</li>
              <li><strong>WhatsApp:</strong> +91-XXXXXXXXXX</li>
            </ul>
          </section>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="mb-6 font-bodyLarge text-neutral500">
            हमारी service risk-free try करें — 14-day free trial, no credit card required।
          </p>
          <Link 
            href="/try-whatsapp"
            className="inline-flex items-center justify-center rounded-full bg-brandGreen600 px-8 py-4 text-base font-semibold text-white hover:bg-brandGreen700 transition-colors"
          >
            14 दिन मुफ़्त शुरू करें
          </Link>
        </div>
      </div>
    </div>
  );
}
