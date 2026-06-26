// FlockIQ — For Integrators Page
// File: apps/web/app/(marketing)/solutions/integrators/page.tsx
// Version: v3.0 | June 2026
// Task Reference: SOL-PAGE-001 (Phase 9)
// Design Reference: FlockIQ_PreLogin_Design_Master_v3.md §PAGE 02
// Requirements Reference: FlockIQ_PreLogin_Requirements_v3.md §FR-SOL-001

import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Play, Check, X, Clock, TrendingUp, AlertTriangle, Building2, Phone, MessageSquare, BarChart3, Shield, FileText, Zap, Users, Globe, Database, LineChart } from 'lucide-react'
import { AlertTriangle as Warning } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/Card';
import { FadeUp } from '@/components/motion/FadeUp';
import { CountUp } from '@/components/motion/CountUp';
import PainSection from '@/components/home/PainSection';
import RoiCalculator from '@/components/home/RoiCalculator';

// SEO Metadata
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Multi-Farm Poultry Management for Integrators | FlockIQ',
    description: 'Manage 20+ farms from one dashboard. WhatsApp automation, harvest queue optimization, cross-farm benchmarking, and full batch P&L tracking. Built for integrators.',
    keywords: ['poultry integrator software', 'multi-farm management', 'contract farming AI', 'poultry ERP integration', 'harvest queue management', 'WhatsApp farm automation'],
    openGraph: {
      type: 'website',
      locale: 'en_IN',
      url: 'https://flockiq.com/solutions/integrators',
      siteName: 'FlockIQ',
      title: 'Multi-Farm Poultry Management for Integrators | FlockIQ',
      description: 'Manage 20+ farms from one dashboard with WhatsApp automation and AI-powered insights.',
      images: [
        {
          url: '/og-integrators.png',
          width: 1200,
          height: 630,
          alt: 'FlockIQ for Integrators',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Multi-Farm Poultry Management for Integrators | FlockIQ',
      description: 'Manage 20+ farms from one dashboard with WhatsApp automation and AI-powered insights.',
      images: ['/og-integrators.png'],
    },
    alternates: {
      canonical: 'https://flockiq.com/solutions/integrators',
    },
  };
}

// JSON-LD Structured Data
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      name: 'FlockIQ for Integrators',
      description: 'Multi-farm poultry management platform for integrators with WhatsApp automation and AI-powered insights',
      url: 'https://flockiq.com/solutions/integrators',
    },
    {
      '@type': 'SoftwareApplication',
      name: 'FlockIQ Integrator Platform',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web, iOS, Android',
      offers: {
        '@type': 'Offer',
        price: '5000',
        priceCurrency: 'INR',
        priceValidUntil: '2027-12-31',
      },
      description: 'AI-powered platform for managing 20+ poultry farms with WhatsApp automation, harvest optimization, and cross-farm benchmarking',
      provider: {
        '@type': 'Organization',
        name: 'FlockIQ',
        url: 'https://flockiq.com',
      },
      featureList: [
        'Multi-farm dashboard',
        'WhatsApp log automation',
        'Harvest queue optimizer',
        'Cross-farm benchmarking',
        'Full batch P&L tracking',
        'Bird lifting management',
        'Medication tracking',
        'Environment monitoring',
      ],
    },
  ],
};

export default function IntegratorsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* SECTION 1: Hero */}
      <section
        className="relative min-h-[90dvh] flex items-center overflow-hidden"
        style={{
          background: 'var(--hero-gradient)',
        }}
        aria-label="Hero section"
      >
        {/* Grain texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'url(/textures/grain.svg)', backgroundRepeat: 'repeat' }}
          aria-hidden="true"
        />

        {/* Bottom wave divider */}
        <div className="absolute bottom-0 left-0 right-0" aria-hidden="true">
          <svg viewBox="0 0 1440 64" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full">
            <path d="M0 64L480 32L960 48L1440 0V64H0Z" fill="#F7FAF8" />
          </svg>
        </div>

        <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 w-full py-20">
          <div className="max-w-[720px]">
            <FadeUp delay={0}>
              <Badge variant="glass" className="mb-6">
                🏭 Built for Integrators — 50K to 5M birds
              </Badge>
            </FadeUp>

            <FadeUp delay={0.1}>
              <h1
                className="font-sora font-extrabold text-white leading-[1.02] tracking-[-0.035em] mb-6"
                style={{ fontSize: 'clamp(2.5rem, 5vw + 0.5rem, 4.5rem)' }}
              >
                Manage 20 Farms Like You Manage 1.
              </h1>
            </FadeUp>

            <FadeUp delay={0.2}>
              <p
                className="text-white/80 leading-[1.75] mb-8 font-jakarta text-lg"
                style={{ maxWidth: '600px' }}
              >
                FlockIQ gives integrators a single command centre for every farm in your network — with daily data collected automatically via WhatsApp. No more morning phone calls.
              </p>
            </FadeUp>

            <FadeUp delay={0.3}>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button
                  variant="accent"
                  size="hero"
                  pill
                  icon={<ArrowRight size={18} />}
                  asChild
                >
                  <Link href="/demo?segment=integrator">Request Integrator Demo →</Link>
                </Button>

                <Button
                  variant="ghost"
                  size="hero"
                  pill
                  icon={<Play size={16} fill="currentColor" />}
                  iconPosition="left"
                  className="text-white bg-white/15 hover:bg-white/20"
                  asChild
                >
                  <Link href="#how-it-works">See How It Works</Link>
                </Button>
              </div>
            </FadeUp>

            <FadeUp delay={0.4}>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-white/60 text-sm">
                {['WhatsApp automation', 'Multi-farm dashboard', 'Harvest queue optimizer', 'Cross-farm benchmarking'].map((item) => (
                  <span key={item} className="flex items-center gap-2">
                    <Check size={16} className="text-brand-400" />
                    {item}
                  </span>
                ))}
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* SECTION 2: The Integrator's Daily Pain (Timeline) */}
      <section id="how-it-works" className="py-24 bg-white" aria-label="Integrator's daily pain timeline">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <FadeUp>
            <div className="text-center mb-16">
              <Badge variant="brand" className="mb-4">THE PROBLEM</Badge>
              <h2 className="font-sora font-bold text-neutral-900 text-4xl md:text-5xl mb-4">
                The Integrator's Daily Chaos
              </h2>
              <p className="text-neutral-600 text-lg max-w-2xl mx-auto">
                Managing 20+ farms without unified visibility means decisions worth ₹50L are made on incomplete, 5-hour-old data.
              </p>
            </div>
          </FadeUp>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* WITHOUT FlockIQ */}
            <FadeUp delay={0.1}>
              <Card className="p-8 border-2 border-red-200 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 bg-red-50 px-6 py-3 border-b border-red-200">
                  <h3 className="font-semibold text-red-700 flex items-center gap-2">
                    <X className="w-5 h-5" />
                    WITHOUT FlockIQ
                  </h3>
                </div>
                
                <div className="mt-6 space-y-6">
                  {[
                    { time: '6:00 AM', text: 'Check 8 different WhatsApp groups — data is scattered and incomplete' },
                    { time: '7:00–9:00 AM', text: 'Call each farm (8 calls × 12 min = 96 min) — farmers don\'t always pick up' },
                    { time: '9:00 AM', text: 'Manually enter data into Excel spreadsheet — error-prone and slow' },
                    { time: '10:00 AM', text: 'Try to calculate portfolio FCR — another 60 minutes of work' },
                    { time: '11:00 AM', text: 'Decisions worth ₹50L made on incomplete, 5-hour-old data' },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex-shrink-0 w-24 text-sm font-semibold text-red-600">
                        {item.time}
                      </div>
                      <div className="text-neutral-700">{item.text}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-4 bg-red-50 rounded-lg">
                  <p className="text-red-700 font-medium text-sm">
                    Result: By the time you have data, the market window has already moved.
                  </p>
                </div>
              </Card>
            </FadeUp>

            {/* WITH FlockIQ */}
            <FadeUp delay={0.2}>
              <Card className="p-8 border-2 border-brand-400 relative overflow-hidden highlighted">
                <div className="absolute top-0 left-0 right-0 bg-brand-50 px-6 py-3 border-b border-brand-200">
                  <h3 className="font-semibold text-brand-700 flex items-center gap-2">
                    <Check className="w-5 h-5" />
                    WITH FlockIQ
                  </h3>
                </div>
                
                <div className="mt-6 space-y-6">
                  {[
                    { time: '6:15 PM', text: 'All 8 farms log automatically via WhatsApp — no calls needed' },
                    { time: '6:20 PM', text: 'Dashboard shows live portfolio metrics — FCR, mortality, pending actions' },
                    { time: '6:30 AM', text: 'Price signal already on your phone — SELL, HOLD, or WAIT' },
                    { time: '8:00 AM', text: 'Decisions made on real-time data — not 5-hour-old guesses' },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex-shrink-0 w-24 text-sm font-semibold text-brand-600">
                        {item.time}
                      </div>
                      <div className="text-neutral-700">{item.text}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-4 bg-brand-50 rounded-lg">
                  <p className="text-brand-700 font-medium text-sm">
                    Result: 96 minutes saved daily. Decisions made on fresh, accurate data.
                  </p>
                </div>
              </Card>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* SECTION 3: Multi-Farm Dashboard Showcase */}
      <section className="py-24 bg-neutral-50" aria-label="Multi-farm dashboard showcase">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <FadeUp>
            <div className="text-center mb-16">
              <Badge variant="brand" className="mb-4">PRODUCT SHOWCASE</Badge>
              <h2 className="font-sora font-bold text-neutral-900 text-4xl md:text-5xl mb-4">
                One Dashboard. Every Farm. Complete Visibility.
              </h2>
              <p className="text-neutral-600 text-lg max-w-2xl mx-auto">
                See all your farms at a glance — colour-coded by health status, with real-time FCR, mortality, and harvest readiness.
              </p>
            </div>
          </FadeUp>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'Portfolio Overview',
                description: '8 farm cards with health status, FCR, mortality, and days to harvest. Red badges flag farms needing attention.',
                icon: <Building2 className="w-8 h-8 text-brand-700" />,
              },
              {
                title: 'Cross-Farm FCR Comparison',
                description: 'Compare your farms against each other and industry benchmarks. Identify top performers instantly.',
                icon: <BarChart3 className="w-8 h-8 text-brand-700" />,
              },
              {
                title: 'Harvest Queue Optimizer',
                description: 'AI-ranked sell order based on breed, weight, and market conditions. Never miss the optimal window.',
                icon: <LineChart className="w-8 h-8 text-brand-700" />,
              },
            ].map((item, i) => (
              <FadeUp key={i} delay={i * 0.1}>
                <Card hover className="p-6">
                  <div className="mb-4">{item.icon}</div>
                  <h3 className="font-semibold text-neutral-900 text-lg mb-2">{item.title}</h3>
                  <p className="text-neutral-600 text-sm">{item.description}</p>
                </Card>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: WhatsApp Log Automation (Integrator Perspective) */}
      <section className="py-24 bg-white" aria-label="WhatsApp log automation">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <FadeUp>
              <Badge variant="whatsapp" className="mb-4">★ FLAGSHIP FEATURE</Badge>
              <h2 className="font-sora font-bold text-neutral-900 text-4xl md:text-5xl mb-6">
                You Set It Up Once. Your Farmers Send 3 Numbers. You See Everything.
              </h2>
              <p className="text-neutral-600 text-lg mb-8">
                FlockIQ sends your farmers a structured WhatsApp reminder every evening. They reply with 3 numbers. The system parses the reply, calculates FCR, flags anomalies, and updates your dashboard. No app for the farmer. No calls for you.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  'Works on any WhatsApp number — no app install required',
                  'Hindi and English supported — English default, Hindi opt-in per farm',
                  'Auto-calculates FCR, cumulative mortality, daily gain',
                  'Smart parsing: understands natural language replies',
                  'Escalation: if no reply by 8 PM, reminder + manager alert',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
                    <span className="text-neutral-700">{item}</span>
                  </div>
                ))}
              </div>

              <Button variant="whatsapp" size="lg" pill icon={<ArrowRight size={18} />} asChild>
                <Link href="/features/whatsapp-log">See WhatsApp Automation →</Link>
              </Button>
            </FadeUp>

            <FadeUp delay={0.2}>
              <Card className="p-6 bg-whatsappBg border-whatsappDark/20">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <MessageSquare className="w-6 h-6 text-whatsappDark" />
                    <span className="font-semibold text-whatsappDark">Integrator View</span>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-600">Today's Logs</span>
                      <span className="text-neutral-900 font-medium">8 farms</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-600">Logged</span>
                      <span className="text-green-600 font-medium">7 farms ✓</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-600">Pending</span>
                      <span className="text-red-600 font-medium">1 farm — Ramesh hasn't replied</span>
                    </div>
                    <div className="pt-3 border-t border-neutral-200">
                      <Button variant="secondary" size="sm" className="w-full">
                        Send Reminder to Ramesh
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* SECTION 5: GAP FEATURES (All 7) */}
      <section className="py-24 bg-brand-50" aria-label="Gap features for integrators">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <FadeUp>
            <div className="text-center mb-16">
              <Badge variant="brand" className="mb-4">WHAT'S NEW IN FLOCKIQ</Badge>
              <h2 className="font-sora font-bold text-neutral-900 text-4xl md:text-5xl mb-4">
                7 Competitive Gaps Filled. One Platform.
              </h2>
              <p className="text-neutral-600 text-lg max-w-2xl mx-auto">
                Features that competitors don't have — built specifically for integrators managing complex operations.
              </p>
            </div>
          </FadeUp>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <FileText className="w-6 h-6 text-brand-700" />,
                title: 'Full Batch P&L Tracking',
                description: 'Track every cost: chick cost, feed, medicine, labour, overhead. Live cost-per-bird calculation.',
              },
              {
                icon: <TrendingUp className="w-6 h-6 text-brand-700" />,
                title: 'Bird Lifting & Sales Management',
                description: 'Record sale events, partial harvests, buyer contacts, and transport details. Auto-trigger batch-close.',
              },
              {
                icon: <Shield className="w-6 h-6 text-brand-700" />,
                title: 'Medication & Withdrawal Tracking',
                description: 'Treatment journal with withdrawal period alerts. AB-Free certification auto-generated.',
              },
              {
                icon: <Zap className="w-6 h-6 text-brand-700" />,
                title: 'Environment Monitoring',
                description: 'Humidity, ammonia, light programme, ventilation. Alert rules for disease risk indicators.',
              },
              {
                icon: <BarChart3 className="w-6 h-6 text-brand-700" />,
                title: 'Breed-Matched Benchmarking',
                description: 'Compare your farms against peers with same breed (Cobb 430, Ross 308, Hubbard Flex).',
              },
              {
                icon: <AlertTriangle className="w-6 h-6 text-brand-700" />,
                title: 'Per-Farm Calamity Risk Score',
                description: 'Disease risk score (1–10) based on outbreak proximity, flock age, vaccination status.',
              },
              {
                icon: <Database className="w-6 h-6 text-brand-700" />,
                title: 'Batch Document Library',
                description: 'Upload DOC invoices, lab reports, vaccination certificates. FSSAI traceability in one click.',
              },
            ].map((item, i) => (
              <FadeUp key={i} delay={i * 0.05}>
                <Card hover className="p-6">
                  <div className="mb-4">{item.icon}</div>
                  <h3 className="font-semibold text-neutral-900 text-lg mb-2">{item.title}</h3>
                  <p className="text-neutral-600 text-sm">{item.description}</p>
                </Card>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6: Competitive Comparison */}
      <section className="py-24 bg-white" aria-label="Competitive comparison">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <FadeUp>
            <div className="text-center mb-16">
              <Badge variant="brand" className="mb-4">COMPETITIVE COMPARISON</Badge>
              <h2 className="font-sora font-bold text-neutral-900 text-4xl md:text-5xl mb-4">
                Why FlockIQ Beats Poultry.care, PoultryPlan, and Spreadsheets
              </h2>
            </div>
          </FadeUp>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b-2 border-neutral-200">
                  <th className="text-left py-4 px-4 font-semibold text-neutral-900">Feature</th>
                  <th className="text-center py-4 px-4 font-semibold text-brand-700">FlockIQ</th>
                  <th className="text-center py-4 px-4 font-semibold text-neutral-600">Poultry.care</th>
                  <th className="text-center py-4 px-4 font-semibold text-neutral-600">PoultryPlan</th>
                  <th className="text-center py-4 px-4 font-semibold text-neutral-600">Manual/Excel</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'WhatsApp Log Automation', flockiq: '✓', poultrycare: '✗', poultryplan: '✗', manual: '✗' },
                  { feature: 'Hindi Language Support', flockiq: '✓', poultrycare: '✗', poultryplan: '✗', manual: '✓' },
                  { feature: 'India Mandi Price Data', flockiq: '✓', poultrycare: '✗', poultryplan: '✗', manual: '✗' },
                  { feature: 'Multi-Farm Dashboard (20+)', flockiq: '✓', poultrycare: '✓', poultryplan: '✓', manual: '✗' },
                  { feature: 'Harvest Queue Optimizer', flockiq: '✓', poultrycare: '✗', poultryplan: '✗', manual: '✗' },
                  { feature: 'Cross-Farm Benchmarking', flockiq: '✓', poultrycare: '✗', poultryplan: '✓', manual: '✗' },
                  { feature: 'Full Batch P&L Tracking', flockiq: '✓', poultrycare: '✗', poultryplan: '✓', manual: '✗' },
                  { feature: 'Bird Lifting Management', flockiq: '✓', poultrycare: '✗', poultryplan: '✗', manual: '✗' },
                  { feature: 'Medication Withdrawal Alerts', flockiq: '✓', poultrycare: '✗', poultryplan: '✗', manual: '✗' },
                  { feature: 'Environment Monitoring', flockiq: '✓', poultrycare: '✓', poultryplan: '✓', manual: '✗' },
                  { feature: 'Per-Farm Risk Score', flockiq: '✓', poultrycare: '✗', poultryplan: '✗', manual: '✗' },
                  { feature: 'Document Library', flockiq: '✓', poultrycare: '✗', poultryplan: '✗', manual: '✗' },
                  { feature: 'ERP Integrations', flockiq: '✓', poultrycare: '✗', poultryplan: '✓', manual: '✗' },
                  { feature: 'API Access', flockiq: '✓', poultrycare: '✗', poultryplan: '✓', manual: '✗' },
                  { feature: 'Mobile-First Design', flockiq: '✓', poultrycare: '✓', poultryplan: '✗', manual: '✗' },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-neutral-100 hover:bg-neutral-50">
                    <td className="py-4 px-4 text-neutral-700">{row.feature}</td>
                    <td className="py-4 px-4 text-center text-green-600 font-semibold">{row.flockiq}</td>
                    <td className="py-4 px-4 text-center text-neutral-400">{row.poultrycare}</td>
                    <td className="py-4 px-4 text-center text-neutral-400">{row.poultryplan}</td>
                    <td className="py-4 px-4 text-center text-neutral-400">{row.manual}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* SECTION 7: Pricing for Integrators */}
      <section className="py-24 bg-neutral-50" aria-label="Pricing for integrators">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <FadeUp>
            <div className="text-center mb-16">
              <Badge variant="brand" className="mb-4">PRICING</Badge>
              <h2 className="font-sora font-bold text-neutral-900 text-4xl md:text-5xl mb-4">
                Pricing Built for Integrators
              </h2>
              <p className="text-neutral-600 text-lg max-w-2xl mx-auto">
                PulseFarm is for single farms. For integrators, we have PulsePro and Enterprise.
              </p>
            </div>
          </FadeUp>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* PulsePro */}
            <FadeUp delay={0.1}>
              <Card className="p-8 border-2 border-brand-400 highlighted relative">
                <Badge variant="brand" className="absolute -top-3 left-8">MOST POPULAR</Badge>
                <h3 className="font-sora font-bold text-2xl text-neutral-900 mb-2">PulsePro</h3>
                <p className="text-neutral-600 mb-4">For integrators with up to 20 farms</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-neutral-900">₹5,000</span>
                  <span className="text-neutral-600">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {[
                    'Multi-farm dashboard (up to 20 farms)',
                    'WhatsApp log automation',
                    'Field supervisor access (5 users)',
                    'Cross-farm FCR benchmarking',
                    'Harvest queue optimizer',
                    'Price intelligence (all mandis)',
                    'Full batch P&L tracking',
                    'Bird lifting management',
                    'Medication tracking',
                    'Environment monitoring',
                    'Breed-matched benchmarking',
                    'Per-farm risk score',
                    'Document library',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-neutral-700">
                      <Check className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button variant="primary" size="lg" className="w-full" asChild>
                  <Link href="/signup?plan=pulsepro">Start Free Trial</Link>
                </Button>
              </Card>
            </FadeUp>

            {/* Enterprise */}
            <FadeUp delay={0.2}>
              <Card className="p-8">
                <h3 className="font-sora font-bold text-2xl text-neutral-900 mb-2">Enterprise</h3>
                <p className="text-neutral-600 mb-4">For large integrators (20+ farms)</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-neutral-900">Custom</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {[
                    'Everything in PulsePro, plus:',
                    'Unlimited farms',
                    'Unlimited supervisor users',
                    'API access',
                    'White-label option',
                    'Dedicated account manager',
                    'Custom integrations (ERP/SAP)',
                    'Priority support',
                    'Custom reporting',
                    'On-site training',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-neutral-700">
                      <Check className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button variant="secondary" size="lg" className="w-full" asChild>
                  <Link href="/demo?segment=integrator">Talk to Sales</Link>
                </Button>
              </Card>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* SECTION 8: Case Studies from Integrators */}
      <section className="py-24 bg-white" aria-label="Case studies from integrators">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <FadeUp>
            <div className="text-center mb-16">
              <Badge variant="brand" className="mb-4">CASE STUDIES</Badge>
              <h2 className="font-sora font-bold text-neutral-900 text-4xl md:text-5xl mb-4">
                Integrators Saving 500+ Hours/Year
              </h2>
            </div>
          </FadeUp>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                name: 'Rajesh Kumar',
                company: 'Gorakhpur Poultry Integrators',
                birds: '15 farms, 300K birds',
                outcome: '₹12.4L saved in 6 months',
                quote: 'Before FlockIQ, I spent 2 hours every morning calling farmers. Now I check one dashboard at 8 AM and I\'m done. The harvest queue optimizer alone saved us ₹4L on timing.',
              },
              {
                name: 'Suresh Patel',
                company: 'Deoria Agro Farms',
                birds: '22 farms, 450K birds',
                outcome: '₹18.2L saved in 1 year',
                quote: 'The cross-farm benchmarking showed us that Farm #12 was consistently 8% better on FCR. We replicated their practices across all farms and saw immediate results.',
              },
            ].map((item, i) => (
              <FadeUp key={i} delay={i * 0.1}>
                <Card className="p-8">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold">
                      {item.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="font-semibold text-neutral-900">{item.name}</h4>
                      <p className="text-sm text-neutral-600">{item.company}</p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <Badge variant="success">{item.birds}</Badge>
                  </div>
                  <p className="text-neutral-700 mb-4 italic">"{item.quote}"</p>
                  <div className="pt-4 border-t border-neutral-200">
                    <span className="text-green-600 font-semibold">{item.outcome}</span>
                  </div>
                </Card>
              </FadeUp>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button variant="ghost" size="lg" icon={<ArrowRight size={18} />} asChild>
              <Link href="/case-studies">Read All Case Studies →</Link>
            </Button>
          </div>
        </div>
      </section>

      <PainSection />
      <RoiCalculator />

      {/* SECTION 9: Request Demo CTA */}
      <section className="py-24" style={{ background: 'var(--hero-gradient)' }} aria-label="Request demo CTA">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <FadeUp>
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="font-sora font-bold text-white text-4xl md:text-5xl mb-6">
                See How 3 Integrators Saved 500+ Hours/Year
              </h2>
              <p className="text-white/80 text-lg mb-8">
                Schedule a personalized demo to see how FlockIQ can transform your integrator operations.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Button
                  variant="accent"
                  size="hero"
                  pill
                  icon={<ArrowRight size={18} />}
                  asChild
                >
                  <Link href="/demo?segment=integrator">Request Integrator Demo →</Link>
                </Button>
              </div>

              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-white/60 text-sm">
                {['No credit card required', '14-day free trial', 'Dedicated onboarding', 'WhatsApp support'].map((item) => (
                  <span key={item} className="flex items-center gap-2">
                    <Check size={16} className="text-brand-400" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </FadeUp>
        </div>
      </section>
    </>
  );
}
