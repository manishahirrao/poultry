// FlockIQ — S1 Commercial Farms Page
// File: apps/web/app/(marketing)/solutions/commercial-farms/page.tsx
// Version: v1.0 | May 2026
// Task Reference: TASK-WEB-012
// Requirements: REQ-WEB-005 §W5.1
// Design Reference: Design Spec §6.1–§6.2

import type { Metadata } from 'next';
import Link from 'next/link';
import { Section } from '../../../../components/ui/Section';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import StatBlock from '../../../../components/ui/StatBlock';

// Generate metadata for SEO
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'ब्रॉयलर फार्म के लिए AI Price Forecast | FlockIQ',
    description: 'गोरखपुर के commercial farmers (10K–50K birds) के लिए AI-powered broiler price forecast — 95%+ accuracy। ₹30,000 ज़्यादा कमाएं हर बैच में। 14 दिन मुफ़्त trial।',
    keywords: ['broiler price forecast India', 'poultry price prediction AI', 'गोरखपुर ब्रॉयलर भाव', 'commercial farm management', 'poultry sell signal'],
    openGraph: {
      type: 'website',
      locale: 'hi_IN',
      alternateLocale: ['en_IN'],
      url: 'https://FlockIQ.ai/solutions/commercial-farms',
      siteName: 'FlockIQ',
      title: 'ब्रॉयलर फार्म के लिए AI Price Forecast | FlockIQ',
      description: 'गोरखपुर के commercial farmers के लिए AI-powered broiler price forecast — 95%+ accuracy। ₹30,000 ज़्यादा कमाएं हर बैच में।',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: 'FlockIQ for Commercial Farms',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'ब्रॉयलर फार्म के लिए AI Price Forecast | FlockIQ',
      description: 'गोरखपुर के commercial farmers के लिए AI-powered broiler price forecast — 95%+ accuracy। ₹30,000 ज़्यादा कमाएं हर बैच में।',
      images: ['/og-image.png'],
    },
    alternates: {
      canonical: 'https://FlockIQ.ai/solutions/commercial-farms',
      languages: {
        'hi-IN': 'https://FlockIQ.ai/solutions/commercial-farms',
        'en-IN': 'https://FlockIQ.ai/solutions/commercial-farms?lang=en',
        'x-default': 'https://FlockIQ.ai/solutions/commercial-farms',
      },
    },
  };
}

// JSON-LD Schema for Commercial Farms Page
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      name: 'FlockIQ for Commercial Farms',
      description: 'AI-powered broiler price forecast for commercial farmers with 10K-50K birds',
      url: 'https://FlockIQ.ai/solutions/commercial-farms',
    },
    {
      '@type': 'Service',
      name: 'Commercial Farm Price Intelligence Service',
      description: 'AI-powered broiler price forecast and sell signals for commercial poultry farms',
      provider: {
        '@type': 'Organization',
        name: 'FlockIQ',
      },
      serviceType: 'Price Intelligence',
      areaServed: {
        '@type': 'Place',
        name: 'Gorakhpur, Uttar Pradesh, India',
      },
      offers: {
        '@type': 'Offer',
        price: '2000',
        priceCurrency: 'INR',
        billingDuration: 'P1M',
      },
    },
  ],
};

export default function CommercialFarmsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Section */}
      <Section background="gradient" size="lg">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 font-[Sora] leading-tight mb-6">
            ₹30,000 ज़्यादा कमाएं
            <span className="block text-brandGreen700 mt-2">
              हर बैच में। गैरंटी के साथ।
            </span>
          </h1>
          <p className="text-lg md:text-xl text-neutral-600 mb-8">
            Gorakhpur के 150+ commercial farmers अब FlockIQ की 95%+ accurate AI forecast से
            timing decide करते हैं — guesswork नहीं।
          </p>

          {/* Dual CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button
              variant="primary"
              size="lg"
              asChild
            >
              <Link href="/login?action=signup&segment=commercial_farm">
                14 दिन मुफ़्त शुरू करें →
              </Link>
            </Button>
            <Button
              variant="secondary"
              size="lg"
              asChild
            >
              <Link href="/demo">Demo देखें</Link>
            </Button>
          </div>

          {/* District Coverage Strip */}
          <div className="bg-white rounded-full px-6 py-3 inline-flex items-center gap-2 shadow-sm">
            <span className="text-neutral-600">📍</span>
            <span className="text-sm text-neutral-700">
              Serving Gorakhpur · Deoria · Kushinagar · Maharajganj · Basti
            </span>
          </div>
        </div>
      </Section>

      {/* Before/After Comparison Cards */}
      <Section background="white" size="lg">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 font-[Sora] mb-12 text-center">
            FlockIQ से पहले और बाद में
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Before Card */}
            <Card variant="default" padding="lg" className="bg-red-50/50 border border-red-200">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">❌</span>
                <h3 className="text-xl font-bold text-neutral-900">Before FlockIQ</h3>
              </div>
              <p className="text-neutral-700 mb-4">
                "Call 3 traders every morning. Take their word for price. Sell when they say sell."
              </p>
              <div className="bg-white rounded-lg p-4">
                <p className="text-red-600 font-semibold">
                  Lost: ₹30K–80K per batch from mistimed selling
                </p>
              </div>
            </Card>

            {/* After Card */}
            <Card variant="default" padding="lg" className="bg-green-50/50 border border-green-200">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">✅</span>
                <h3 className="text-xl font-bold text-neutral-900">After FlockIQ</h3>
              </div>
              <p className="text-neutral-700 mb-4">
                "Open FlockIQ at 6:30 AM. See: ⭐ SELL NOW — ₹162.40/kg. Sell with confidence."
              </p>
              <div className="bg-white rounded-lg p-4">
                <p className="text-green-600 font-semibold">
                  Gained: ₹30K–40K per batch from data-driven timing
                </p>
              </div>
            </Card>
          </div>
        </div>
      </Section>

      {/* Pain Points Section */}
      <Section background="tinted" size="lg">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 font-[Sora] mb-12 text-center">
            Commercial farmers की 3 बड़ी problems
          </h2>

          <div className="space-y-6">
            {/* Pain Point 1: Price Opacity */}
            <Card variant="default" padding="lg" className="bg-amber-50/50 border border-amber-200">
              <div className="flex items-start gap-4">
                <span className="text-4xl">🕐</span>
                <div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-2">
                    Price opacity — sell on gut feel
                  </h3>
                  <p className="text-neutral-700 mb-2">
                    "आप सुबह 3 ट्रेडर को फ़ोन करते हैं। वो भिन्न भाव बताते हैं। आप किस पर भरोसा करें? कोई डेटा नहीं।"
                  </p>
                  <p className="text-brandGreen700 font-semibold">
                    At 25K birds: ₹30K–80K/batch lost to timing uncertainty
                  </p>
                </div>
              </div>
            </Card>

            {/* Pain Point 2: HPAI Blind Spot */}
            <Card variant="default" padding="lg" className="bg-red-50/50 border border-red-200">
              <div className="flex items-start gap-4">
                <span className="text-4xl">🦠</span>
                <div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-2">
                    HPAI alert का पता लगता है जब ट्रांसपोर्ट पहले से बंद हो चुका होता है
                  </h3>
                  <p className="text-neutral-700 mb-2">
                    "आपके आस-पास HPAI zone declare होता है, लेकिन आपको पता तब चलता है जब ट्रांसपोर्ट बंद हो चुका होता है।"
                  </p>
                  <p className="text-brandGreen700 font-semibold">
                    At 25K birds: ₹1L–5L total loss risk from delayed information
                  </p>
                </div>
              </div>
            </Card>

            {/* Pain Point 3: Middleman Exploitation */}
            <Card variant="default" padding="lg" className="bg-amber-50/50 border border-amber-200">
              <div className="flex items-start gap-4">
                <span className="text-4xl">🤝</span>
                <div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-2">
                    बिचौलिया ₹8 देता है जब लखनऊ में ₹10 है — आपको नहीं पता
                  </h3>
                  <p className="text-neutral-700 mb-2">
                    "गोरखपुर में ₹8, लखनऊ में ₹10 — यह फ़र्क आपकी जेब से जाता है। आपको real mandi price का पता नहीं।"
                  </p>
                  <p className="text-brandGreen700 font-semibold">
                    At 25K birds × 4kg: ₹2L per batch lost to information gap
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Section>

      {/* Feature Highlights Section */}
      <Section background="white" size="lg">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 font-[Sora] mb-12 text-center">
            Commercial farmers के लिए 8 key features
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Feature 1 */}
            <Card variant="default" padding="lg" hover={true}>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-brandGreen50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-3xl">📊</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 mb-2">Price Forecast</h3>
                  <p className="text-neutral-700 text-sm mb-2">
                    7-day AI forecast with P10/P50/P90 confidence bands — Gorakhpur mandi-specific
                  </p>
                  <p className="text-brandGreen700 text-sm font-semibold">
                    ✅ ₹1.50/bird avg improvement from better timing
                  </p>
                </div>
              </div>
            </Card>

            {/* Feature 2 */}
            <Card variant="default" padding="lg" hover={true}>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-brandGreen50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-3xl">✅</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 mb-2">Sell Signal</h3>
                  <p className="text-neutral-700 text-sm mb-2">
                    Daily SELL NOW / HOLD / CAUTION with exact ₹ impact for your flock
                  </p>
                  <p className="text-brandGreen700 text-sm font-semibold">
                    ✅ WhatsApp alert at 6:30 AM every morning
                  </p>
                </div>
              </div>
            </Card>

            {/* Feature 3 */}
            <Card variant="default" padding="lg" hover={true}>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-brandGreen50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-3xl">🧮</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 mb-2">Batch ROI Optimizer</h3>
                  <p className="text-neutral-700 text-sm mb-2">
                    Exact ₹ profit comparison: sell today vs wait N days with confidence bands
                  </p>
                  <p className="text-brandGreen700 text-sm font-semibold">
                    ✅ Never miss the optimal sell window again
                  </p>
                </div>
              </div>
            </Card>

            {/* Feature 4 */}
            <Card variant="default" padding="lg" hover={true}>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-brandGreen50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-3xl">🤝</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 mb-2">Middleman Check</h3>
                  <p className="text-neutral-700 text-sm mb-2">
                    Is the trader's offer fair? Counter-offer script in Hindi
                  </p>
                  <p className="text-brandGreen700 text-sm font-semibold">
                    ✅ Real-time mandi price comparison across districts
                  </p>
                </div>
              </div>
            </Card>

            {/* Feature 5 */}
            <Card variant="default" padding="lg" hover={true}>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-brandGreen50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-3xl">💉</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 mb-2">Vaccination Scheduler</h3>
                  <p className="text-neutral-700 text-sm mb-2">
                    Auto-schedule UP broiler protocol with WhatsApp reminders 24h before
                  </p>
                  <p className="text-brandGreen700 text-sm font-semibold">
                    ✅ Never miss a vaccination deadline
                  </p>
                </div>
              </div>
            </Card>

            {/* Feature 6 */}
            <Card variant="default" padding="lg" hover={true}>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-brandGreen50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-3xl">📋</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 mb-2">Health Checklist</h3>
                  <p className="text-neutral-700 text-sm mb-2">
                    Daily health logging with abnormal pattern detection
                  </p>
                  <p className="text-brandGreen700 text-sm font-semibold">
                    ✅ Early disease detection saves ₹1L+ per batch
                  </p>
                </div>
              </div>
            </Card>

            {/* Feature 7 */}
            <Card variant="default" padding="lg" hover={true}>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-brandGreen50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-3xl">📉</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 mb-2">Daily Mortality Log</h3>
                  <p className="text-neutral-700 text-sm mb-2">
                    Track daily deaths with AI cause prediction and trend analysis
                  </p>
                  <p className="text-brandGreen700 text-sm font-semibold">
                    ✅ Identify mortality patterns before they become crises
                  </p>
                </div>
              </div>
            </Card>

            {/* Feature 8 */}
            <Card variant="default" padding="lg" hover={true}>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-brandGreen50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-3xl">🚨</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 mb-2">WhatsApp Alerts</h3>
                  <p className="text-neutral-700 text-sm mb-2">
                    HPAI zone alerts, heat stress warnings, price crash alerts — personalised
                  </p>
                  <p className="text-brandGreen700 text-sm font-semibold">
                    ✅ Alerts that know your flock's financial impact
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Section>

      {/* Segment-Specific ROI Calculator */}
      <Section background="tinted" size="lg">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 font-[Sora] mb-12 text-center">
            आपकी कमाई की गणना करें
          </h2>

          <Card variant="elevated" padding="lg">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Input Panel */}
              <div>
                <h3 className="text-xl font-bold text-neutral-900 mb-6">आपके पास:</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                      पक्षियों की संख्या (Flock Size)
                    </label>
                    <select defaultValue="25000" className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brandGreen700 focus:border-transparent">
                      <option value="10000">10,000 birds</option>
                      <option value="15000">15,000 birds</option>
                      <option value="20000">20,000 birds</option>
                      <option value="25000">25,000 birds</option>
                      <option value="30000">30,000 birds</option>
                      <option value="35000">35,000 birds</option>
                      <option value="40000">40,000 birds</option>
                      <option value="45000">45,000 birds</option>
                      <option value="50000">50,000 birds</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                      बैच प्रति वर्ष (Batches Per Year)
                    </label>
                    <select defaultValue="3" className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brandGreen700 focus:border-transparent">
                      <option value="2">2 batches/year</option>
                      <option value="3">3 batches/year</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                      औसत वज़न (Avg Weight)
                    </label>
                    <select defaultValue="2.0" className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brandGreen700 focus:border-transparent">
                      <option value="1.8">1.8 kg</option>
                      <option value="2.0">2.0 kg</option>
                      <option value="2.2">2.2 kg</option>
                      <option value="2.4">2.4 kg</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Result Panel */}
              <div className="bg-brandGreen50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-neutral-900 mb-6">
                  FlockIQ से अनुमानित अतिरिक्त कमाई:
                </h3>

                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-neutral-600 mb-1">प्रति वर्ष</p>
                    <p className="text-3xl font-bold text-brandGreen700">₹ 1,08,000</p>
                  </div>

                  <div className="text-sm text-neutral-700 space-y-2">
                    <p>कैसे:</p>
                    <p>• ₹1.50/bird avg improvement</p>
                    <p>• × 25,000 birds</p>
                    <p>• × 3 batches/year</p>
                    <p>• = ₹1,12,500/year</p>
                    <p>• − ₹36,000 subscription</p>
                    <p>• = ₹76,500 net ROI</p>
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-neutral-600 mb-1">ROI Multiple</p>
                    <p className="text-2xl font-bold text-brandGreen700">2.1×</p>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  asChild
                  className="mt-6"
                >
                  <Link href="/login?action=signup&segment=commercial_farm">
                    14 दिन मुफ़्त शुरू करें
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </Section>

      {/* S1 Testimonial Card */}
      <Section background="white" size="lg">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 font-[Sora] mb-12 text-center">
            Gorakhpur के farmers क्या कह रहे हैं
          </h2>

          <Card variant="elevated" padding="lg" className="bg-brandGreen50/30">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <div className="text-6xl text-brandGreen200 mb-4">"</div>
                <p className="text-xl text-neutral-900 mb-6 italic">
                  पहले बिचौलिया जो भाव बोलता था, वो मान लेता था। अब FlockIQ देखकर ₹4/kg ज़्यादा माँगते हैं। 3 batches में ₹1.8 lakh extra कमाया। Subscription का 50x return पहले साल में ही।
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-brandGreen700 rounded-full flex items-center justify-center text-white font-bold">
                    RY
                  </div>
                  <div>
                    <p className="font-bold text-neutral-900">R.Y.</p>
                    <p className="text-sm text-neutral-600">Gorakhpur · 25,000 bird farm</p>
                    <div className="flex text-amber-500 mt-1">★★★★★</div>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-1/3 bg-white rounded-xl p-6 flex flex-col justify-center">
                <div className="text-center">
                  <p className="text-sm text-neutral-600 mb-2">Extra Earned</p>
                  <p className="text-4xl font-bold text-brandGreen700 mb-2">₹1.8L</p>
                  <p className="text-sm text-neutral-600">3 batches</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </Section>

      {/* Final CTA Section */}
      <Section background="dark" size="lg" className="bg-brandGreen700">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white font-[Sora] mb-4">
            शुरू करें — पहले 14 दिन मुफ़्त
          </h2>
          <p className="text-lg text-white/90 mb-8">
            No credit card required. Setup in 3 minutes. First forecast tonight at 6:30 AM.
          </p>
          <Button
            variant="accent"
            size="lg"
            asChild
          >
            <Link href="/login?action=signup&segment=commercial_farm">
              14 दिन मुफ़्त शुरू करें →
            </Link>
          </Button>
          <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-white/80">
            <span>✅ No credit card required</span>
            <span>✅ Cancel anytime</span>
            <span>✅ Data stays in India</span>
            <span>✅ DPDP Act 2023 compliant</span>
          </div>
        </div>
      </Section>
    </>
  );
}
