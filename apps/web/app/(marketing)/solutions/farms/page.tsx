// FlockIQ — For Farms Page
// File: apps/web/app/(marketing)/solutions/farms/page.tsx
// Version: v3.0 | June 2026
// Task Reference: SOL-PAGE-002 (Phase 9)
// Design Reference: FlockIQ_PreLogin_Design_Master_v3.md §PAGE 03
// Requirements Reference: FlockIQ_PreLogin_Requirements_v3.md §FR-SOL-002

import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Play, Check, X, Clock, TrendingUp, AlertTriangle, Home, Phone, MessageSquare, BarChart3, Shield, FileText, Zap, Bell, DollarSign, Heart } from 'lucide-react'
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
    title: 'Poultry Farm Management for Individual Farmers | FlockIQ',
    description: 'Complete batch management, price intelligence, and WhatsApp automation for individual farm owners. 10K–500K birds. Track FCR, mortality, and sell at the right time.',
    keywords: ['poultry farm management', 'individual farmer software', 'batch tracking', 'FCR calculator', 'poultry price signals', 'WhatsApp farm automation', 'farm management app'],
    openGraph: {
      type: 'website',
      locale: 'en_IN',
      url: 'https://flockiq.com/solutions/farms',
      siteName: 'FlockIQ',
      title: 'Poultry Farm Management for Individual Farmers | FlockIQ',
      description: 'Complete batch management, price intelligence, and WhatsApp automation for individual farm owners. Track FCR, mortality, and sell at the right time.',
      images: [
        {
          url: '/og-farms.png',
          width: 1200,
          height: 630,
          alt: 'FlockIQ for Farms',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Poultry Farm Management for Individual Farmers | FlockIQ',
      description: 'Complete batch management, price intelligence, and WhatsApp automation for individual farm owners.',
      images: ['/og-farms.png'],
    },
    alternates: {
      canonical: 'https://flockiq.com/solutions/farms',
    },
  };
}

// JSON-LD Structured Data
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      name: 'FlockIQ for Farms',
      description: 'Poultry farm management platform for individual farmers with WhatsApp automation and AI-powered insights',
      url: 'https://flockiq.com/solutions/farms',
    },
    {
      '@type': 'SoftwareApplication',
      name: 'FlockIQ Farm Platform',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web, iOS, Android',
      offers: {
        '@type': 'Offer',
        price: '2000',
        priceCurrency: 'INR',
        priceValidUntil: '2027-12-31',
      },
      description: 'AI-powered platform for managing individual poultry farms with WhatsApp automation, price intelligence, and batch tracking',
      provider: {
        '@type': 'Organization',
        name: 'FlockIQ',
        url: 'https://flockiq.com',
      },
      featureList: [
        'Batch lifecycle management',
        'FCR tracking',
        'Price intelligence',
        'WhatsApp log automation',
        'HPAI disease alerts',
        'Vaccination scheduler',
        'Batch P&L tracking',
      ],
    },
  ],
};

export default function FarmsPage() {
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
                🏠 Built for Farm Owners — 10K to 500K birds
              </Badge>
            </FadeUp>

            <FadeUp delay={0.1}>
              <h1
                className="font-sora font-extrabold text-white leading-[1.02] tracking-[-0.035em] mb-6"
                style={{ fontSize: 'clamp(2.5rem, 5vw + 0.5rem, 4.5rem)' }}
              >
                Run Your Farm Like a Pro. From Your Phone.
              </h1>
            </FadeUp>

            <FadeUp delay={0.2}>
              <p
                className="text-white/80 leading-[1.75] mb-8 font-jakarta text-lg"
                style={{ maxWidth: '600px' }}
              >
                Complete batch management, price intelligence, and daily log automation — all in one app that works on WhatsApp. No spreadsheets. No manual calls.
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
                  <Link href="/signup?segment=farm">Start Free Trial — 14 Days</Link>
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
                  <Link href="#day-in-life">See How It Works</Link>
                </Button>
              </div>
            </FadeUp>

            <FadeUp delay={0.4}>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-white/60 text-sm">
                {['Batch tracking', 'FCR calculator', 'Price signals', 'WhatsApp automation'].map((item) => (
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

      {/* SECTION 2: A Day With FlockIQ on Your Farm */}
      <section id="day-in-life" className="py-24 bg-white" aria-label="A day with FlockIQ">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <FadeUp>
            <div className="text-center mb-16">
              <Badge variant="brand" className="mb-4">A DAY WITH FLOCKIQ</Badge>
              <h2 className="font-sora font-bold text-neutral-900 text-4xl md:text-5xl mb-4">
                How FlockIQ Guides Your Entire Day
              </h2>
              <p className="text-neutral-600 text-lg max-w-2xl mx-auto">
                From morning price signals to evening WhatsApp logs, FlockIQ is with you every step of the way.
              </p>
            </div>
          </FadeUp>

          <div className="max-w-4xl mx-auto space-y-6">
            {[
              {
                time: '6:30 AM',
                icon: <Bell className="w-6 h-6 text-brand-700" />,
                title: 'Price Signal Arrives on WhatsApp',
                description: '"Today: HOLD. Wait 2 days. Expected price: ₹168/kg → ₹172/kg"',
                highlight: true,
              },
              {
                time: 'Day 15',
                icon: <Shield className="w-6 h-6 text-brand-700" />,
                title: 'Vaccination Reminder Sent',
                description: '"Tomorrow: IBD vaccine due. ✓ Confirm when done"',
                highlight: false,
              },
              {
                time: 'Day 22',
                icon: <AlertTriangle className="w-6 h-6 text-orange-600" />,
                title: 'Mortality Anomaly Detected',
                description: '"3 deaths today vs avg 0.5. Check shed ventilation."',
                highlight: false,
              },
              {
                time: 'Day 38',
                icon: <TrendingUp className="w-6 h-6 text-green-600" />,
                title: 'Harvest Signal — Time to Sell',
                description: '"SELL NOW — ₹172/kg | Profit: ₹68,000"',
                highlight: true,
              },
              {
                time: '6:00 PM',
                icon: <MessageSquare className="w-6 h-6 text-whatsappDark" />,
                title: 'WhatsApp Reminder Arrives',
                description: '"Day 38: Please send [deaths] [feed kg]"',
                highlight: false,
              },
              {
                time: '6:03 PM',
                icon: <Check className="w-6 h-6 text-green-600" />,
                title: 'Auto-Logged in Seconds',
                description: '"✓ Logged: 1 death, 1380 kg feed | FCR est: 1.72"',
                highlight: true,
              },
            ].map((item, i) => (
              <FadeUp key={i} delay={i * 0.08}>
                <Card className={`p-6 ${item.highlight ? 'border-2 border-brand-400 highlighted' : ''}`}>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center">
                        {item.icon}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-semibold text-brand-600">{item.time}</span>
                        <h3 className="font-semibold text-neutral-900">{item.title}</h3>
                      </div>
                      <p className="text-neutral-700">{item.description}</p>
                    </div>
                  </div>
                </Card>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: Pain Points for Individual Farm Owners */}
      <section className="py-24 bg-neutral-50" aria-label="Pain points for farm owners">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <FadeUp>
            <div className="text-center mb-16">
              <Badge variant="orange" className="mb-4">THE PROBLEM</Badge>
              <h2 className="font-sora font-bold text-neutral-900 text-4xl md:text-5xl mb-4">
                Running a Farm Without Data is Like Flying Blind
              </h2>
              <p className="text-neutral-600 text-lg max-w-2xl mx-auto">
                Most farm owners make decisions worth ₹50,000–₹1.5 lakh based on gut feel and incomplete information.
              </p>
            </div>
          </FadeUp>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Clock className="w-8 h-8 text-orange-600" />,
                title: 'Manual Data Entry',
                description: 'Every evening, you spend 30 minutes logging feed, deaths, and weight in a notebook. Data is scattered, hard to analyse, and prone to errors.',
                stat: '30 min/day × 250 days = 125 hours/year wasted',
              },
              {
                icon: <TrendingUp className="w-8 h-8 text-red-600" />,
                title: 'Selling at the Wrong Time',
                description: 'Without price forecasts, you sell when you think the time is right — often 3–4 days too early or too late, losing ₹2–4/kg on your entire flock.',
                stat: '₹50K–₹1.5L lost per batch from timing alone',
              },
              {
                icon: <AlertTriangle className="w-8 h-8 text-amber-600" />,
                title: 'Disease Alerts Arrive Too Late',
                description: 'By the time HPAI news reaches you, transport bans are already in place. A 48-hour early warning means the difference between selling and losing an entire batch.',
                stat: '₹3–5 lakh total loss risk per HPAI outbreak',
              },
            ].map((item, i) => (
              <FadeUp key={i} delay={i * 0.1}>
                <Card hover className="p-6">
                  <div className="mb-4">{item.icon}</div>
                  <h3 className="font-semibold text-neutral-900 text-lg mb-2">{item.title}</h3>
                  <p className="text-neutral-600 text-sm mb-4">{item.description}</p>
                  <div className="p-3 bg-red-50 rounded-lg">
                    <p className="text-red-700 font-medium text-sm">{item.stat}</p>
                  </div>
                </Card>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: Features for Single-Farm Owners */}
      <section className="py-24 bg-white" aria-label="Features for farm owners">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <FadeUp>
            <div className="text-center mb-16">
              <Badge variant="brand" className="mb-4">FEATURES</Badge>
              <h2 className="font-sora font-bold text-neutral-900 text-4xl md:text-5xl mb-4">
                Everything You Need to Run Your Farm
              </h2>
              <p className="text-neutral-600 text-lg max-w-2xl mx-auto">
                7 powerful features designed specifically for individual farm owners managing 10K–500K birds.
              </p>
            </div>
          </FadeUp>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <BarChart3 className="w-6 h-6 text-brand-700" />,
                title: 'Batch Lifecycle Management',
                description: 'Track every batch from DOC placement to harvest. See daily progress, FCR trends, and mortality at a glance.',
              },
              {
                icon: <TrendingUp className="w-6 h-6 text-brand-700" />,
                title: 'FCR Tracking & Benchmarks',
                description: 'Auto-calculate FCR from daily feed logs. Compare against breed benchmarks (Cobb 430, Ross 308, Hubbard Flex).',
              },
              {
                icon: <DollarSign className="w-6 h-6 text-brand-700" />,
                title: 'Price Intelligence',
                description: '7-day AI price forecast with daily SELL/HOLD/WAIT signals on WhatsApp. Know the right time to sell.',
              },
              {
                icon: <AlertTriangle className="w-6 h-6 text-brand-700" />,
                title: 'HPAI Disease Alerts',
                description: 'Early warning system for disease outbreaks in your district. 48-hour head start on transport bans.',
              },
              {
                icon: <MessageSquare className="w-6 h-6 text-brand-700" />,
                title: 'WhatsApp Log Automation',
                description: 'Log your daily data via WhatsApp reply. No app needed. Works in Hindi and English.',
              },
              {
                icon: <Shield className="w-6 h-6 text-brand-700" />,
                title: 'Vaccination Scheduler',
                description: 'UP broiler protocol reminders sent via WhatsApp. Never miss a vaccine date again.',
              },
              {
                icon: <FileText className="w-6 h-6 text-brand-700" />,
                title: 'Batch P&L Tracking',
                description: 'Track every cost: chick cost, feed, medicine, labour. See live cost-per-bird and projected profit.',
              },
              {
                icon: <Heart className="w-6 h-6 text-brand-700" />,
                title: 'FSSAI Traceability',
                description: 'One-click traceability report for audits. AB-Free certification when you meet withdrawal periods.',
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

      {/* SECTION 5: ROI Calculator */}
      <RoiCalculator />

      {/* SECTION 6: PulseFarm Pricing */}
      <section className="py-24 bg-white" aria-label="PulseFarm pricing">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <FadeUp>
            <div className="text-center mb-16">
              <Badge variant="brand" className="mb-4">PRICING</Badge>
              <h2 className="font-sora font-bold text-neutral-900 text-4xl md:text-5xl mb-4">
                PulseFarm — Built for Individual Farms
              </h2>
              <p className="text-neutral-600 text-lg max-w-2xl mx-auto">
                ₹2,000/month = ₹67/day — less than a cup of chai. 14-day free trial, no credit card required.
              </p>
            </div>
          </FadeUp>

          <FadeUp delay={0.1}>
            <div className="max-w-lg mx-auto">
              <Card className="p-8 border-2 border-brand-400 highlighted relative">
                <Badge variant="brand" className="absolute -top-3 left-8">FOR FARMS</Badge>
                <h3 className="font-sora font-bold text-3xl text-neutral-900 mb-2">PulseFarm</h3>
                <p className="text-neutral-600 mb-4">For individual farms, 10K–25K birds</p>
                <div className="mb-6">
                  <span className="text-5xl font-bold text-neutral-900">₹2,000</span>
                  <span className="text-neutral-600">/month</span>
                  <p className="text-sm text-neutral-500 mt-1">₹24,000/year (2 months free with annual)</p>
                </div>
                <ul className="space-y-3 mb-8">
                  {[
                    'Batch lifecycle management (1 farm)',
                    'FCR tracking + breed benchmarks',
                    '7-day price forecast (1 mandi)',
                    'Daily SELL/HOLD/WAIT signal on WhatsApp',
                    'Daily mortality tracking',
                    'Vaccination scheduler',
                    'HPAI disease alerts',
                    'WhatsApp delivery of all alerts',
                    'Hindi + English supported',
                    '14-day free trial',
                    'WhatsApp log automation (add-on ₹500/mo)',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-neutral-700">
                      <Check className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button variant="primary" size="lg" className="w-full" asChild>
                  <Link href="/signup?plan=pulsefarm">Start 14-Day Free Trial</Link>
                </Button>
              </Card>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* SECTION 7: Testimonials from Farm Owners */}
      <section className="py-24 bg-neutral-50" aria-label="Testimonials from farm owners">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <FadeUp>
            <div className="text-center mb-16">
              <Badge variant="brand" className="mb-4">TESTIMONIALS</Badge>
              <h2 className="font-sora font-bold text-neutral-900 text-4xl md:text-5xl mb-4">
                Farm Owners Saving ₹50K–₹1.5L Per Batch
              </h2>
            </div>
          </FadeUp>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Ramesh Yadav',
                location: 'Gorakhpur, UP',
                birds: '25K birds',
                outcome: '₹1,24,000 saved in 3 batches',
                quote: 'The price signal told me to wait 3 days. I sold at ₹172 instead of ₹168. That\'s ₹1,000 per bird extra — ₹25,000 on one batch. The app paid for itself 10 times over.',
              },
              {
                name: 'Sunita Devi',
                location: 'Deoria, UP',
                birds: '15K birds',
                outcome: '₹67,000 saved in 2 batches',
                quote: 'I used to guess when to sell. Now FlockIQ tells me exactly when. The WhatsApp reminders are so easy — I just reply with 3 numbers and my data is logged.',
              },
              {
                name: 'Vijay Singh',
                location: 'Bareilly, UP',
                birds: '20K birds',
                outcome: '₹92,000 saved in 4 batches',
                quote: 'The FCR tracking showed me I was overfeeding. I adjusted and saved ₹8,000 on feed in one batch. The vaccination reminders also saved me from missing a critical IBD dose.',
              },
            ].map((item, i) => (
              <FadeUp key={i} delay={i * 0.1}>
                <Card className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold">
                      {item.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="font-semibold text-neutral-900">{item.name}</h4>
                      <p className="text-sm text-neutral-600">{item.location}</p>
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
        </div>
      </section>

      <PainSection />

      {/* SECTION 8: Final CTA */}
      <section className="py-24" style={{ background: 'var(--hero-gradient)' }} aria-label="Final CTA">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <FadeUp>
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="font-sora font-bold text-white text-4xl md:text-5xl mb-6">
                Start Managing Your Farm Like a Pro Today
              </h2>
              <p className="text-white/80 text-lg mb-8">
                Join 500+ farm owners already using FlockIQ. 14-day free trial, no credit card required. Cancel anytime.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Button
                  variant="accent"
                  size="hero"
                  pill
                  icon={<ArrowRight size={18} />}
                  asChild
                >
                  <Link href="/signup?segment=farm">Start Free Trial — 14 Days</Link>
                </Button>

                <Button
                  variant="ghost"
                  size="hero"
                  pill
                  icon={<MessageSquare size={18} />}
                  className="text-white bg-white/15 hover:bg-white/20"
                  asChild
                >
                  <Link href="/try-whatsapp">Try WhatsApp Demo</Link>
                </Button>
              </div>

              <div className="flex flex-wrap justify-center gap-6 text-white/60 text-sm">
                {['Free 14 days', 'No credit card', 'Works on WhatsApp', 'Cancel anytime'].map((item) => (
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
