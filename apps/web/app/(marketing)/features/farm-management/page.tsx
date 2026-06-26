'use client';

// FlockIQ — Farm Management Feature Page
// File: apps/web/app/(marketing)/features/farm-management/page.tsx
// Version: v3.0 | June 2026
// Task Reference: FEAT-PAGE-002 (Phase 9)
// Design Reference: FlockIQ_PreLogin_Design_Master_v3.md
// Requirements Reference: FlockIQ_PreLogin_Requirements_v3.md FR-FEAT-003

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FeatureSubsection } from './_components/FeatureSubsection';
import { Button } from '@/components/ui/Button';
import { FadeUp } from '@/components/motion/FadeUp';
import { 
  ClipboardList, 
  BarChart2, 
  TrendingDown, 
  Scale as ScaleIcon, 
  Syringe, 
  ShoppingBag, 
  DollarSign, 
  Pill, 
  Thermometer, 
  Award, 
  AlertTriangle, 
  FolderOpen, 
  Shield 
} from 'lucide-react'
import { AlertTriangle as Warning } from 'lucide-react';

const FEATURE_SUBSECTIONS = [
  {
    id: 'batch-lifecycle',
    title: 'Batch Lifecycle Management',
    eyebrow: 'Farm Operations',
    icon: <ClipboardList className="w-6 h-6" />,
    body: 'Track every batch across every farm on a single dashboard. From DOC placement to harvest, monitor FCR, daily mortality, weight gain, vaccination schedule, and feed consumption — all in one place, updated automatically.',
    features: [
      'Batch progress board — see every flock\'s status at a glance',
      'FCR tracking vs breed benchmarks (Cobb 430, Ross 308, Hubbard Flex)',
      'AI-powered anomaly detection — alerts in 60 seconds',
      'Health & vaccination scheduler with WhatsApp reminders',
      'FSSAI traceability report — one click, audit-ready',
    ],
    screenshotSide: 'right' as const,
    isNew: false,
    planBadge: 'Both' as const,
  },
  {
    id: 'fcr-feed',
    title: 'FCR & Feed Efficiency',
    eyebrow: 'Performance Metrics',
    icon: <BarChart2 className="w-6 h-6" />,
    body: 'Optimize your feed conversion ratio with real-time tracking. Compare against breed standards and historical performance to identify underperforming flocks instantly.',
    features: [
      'Daily FCR calculation with breed benchmark comparison',
      'Feed consumption tracking by batch and farm',
      'Cost-per-kg feed analysis',
      'Feed efficiency trend charts',
      'Alerts when FCR exceeds breed threshold',
    ],
    screenshotSide: 'left' as const,
    isNew: false,
    planBadge: 'Both' as const,
  },
  {
    id: 'mortality',
    title: 'Mortality Intelligence',
    eyebrow: 'Health Monitoring',
    icon: <TrendingDown className="w-6 h-6" />,
    body: 'Track mortality patterns with precision. Identify disease outbreaks early with anomaly detection and receive proactive alerts before losses escalate.',
    features: [
      'Daily mortality logging via WhatsApp',
      'Cumulative mortality percentage tracking',
      'Cause-of-death categorization',
      'Mortality trend analysis with spike detection',
      'Automated escalation for abnormal patterns',
    ],
    screenshotSide: 'right' as const,
    isNew: false,
    planBadge: 'Both' as const,
  },
  {
    id: 'weight-growth',
    title: 'Weight & Growth Tracking',
    eyebrow: 'Performance',
    icon: <ScaleIcon className="w-6 h-6" />,
    body: 'Monitor growth curves against breed standards. Track weekly weights and daily gain to ensure your flock is on target for optimal harvest timing.',
    features: [
      'Weekly weight recording with WhatsApp',
      'Daily gain calculation',
      'Growth curve vs breed standard comparison',
      'Harvest weight prediction',
      'Weight uniformity analysis',
    ],
    screenshotSide: 'left' as const,
    isNew: false,
    planBadge: 'Both' as const,
  },
  {
    id: 'health-vaccination',
    title: 'Health & Vaccination',
    eyebrow: 'Biosecurity',
    icon: <Syringe className="w-6 h-6" />,
    body: 'Never miss a vaccination again. Schedule all health events, track medication usage, and maintain complete treatment records for compliance and audit readiness.',
    features: [
      'Vaccination schedule with WhatsApp reminders',
      'Health event logging and tracking',
      'Treatment journal with dosage records',
      'Withdrawal period alerts',
      'AB-Free certification tracking',
    ],
    screenshotSide: 'right' as const,
    isNew: false,
    planBadge: 'Both' as const,
  },
  {
    id: 'bird-lifting',
    title: 'Bird Lifting & Sales Management',
    eyebrow: 'Harvest Operations',
    icon: <ShoppingBag className="w-6 h-6" />,
    body: 'Manage partial and full harvests with precision. Record sale events, track buyer information, and maintain complete sales records for revenue tracking.',
    features: [
      'Sale event recording with date and quantity',
      'Partial harvest support (multiple lifts per batch)',
      'Live weight tracking and per-bird weight calculation',
      'Buyer/trader contact management',
      'Transport details logging',
    ],
    screenshotSide: 'left' as const,
    isNew: true,
    planBadge: 'Both' as const,
  },
  {
    id: 'batch-pnl',
    title: 'Full Batch P&L — Every Cost Tracked',
    eyebrow: 'Financial Intelligence',
    icon: <DollarSign className="w-6 h-6" />,
    body: 'Get complete visibility into batch profitability. Track all costs — chick cost, feed, medicine, labour, overhead — in one place. Know exactly how much you earned or lost on every batch.',
    features: [
      'Chick cost tracking with invoice reference',
      'Feed cost auto-linked from daily logs',
      'Medicine and treatment cost logging',
      'Labour and overhead cost allocation',
      'Live cost-per-bird calculation',
      'Batch P&L summary at harvest',
    ],
    screenshotSide: 'right' as const,
    isNew: true,
    planBadge: 'Both' as const,
  },
  {
    id: 'medication',
    title: 'Medication & Withdrawal Tracking',
    eyebrow: 'Treatment Management',
    icon: <Pill className="w-6 h-6" />,
    body: 'Track all medications with withdrawal period alerts. Ensure food safety compliance with automated warnings before harvest and maintain complete treatment records.',
    features: [
      'Medicine logging via WhatsApp reply',
      'Withdrawal period auto-calculation',
      'Pre-harvest withdrawal alerts',
      'Treatment journal with dosage and route',
      'AB-Free badge for antibiotic-free batches',
      'Treatment cost integration with P&L',
    ],
    screenshotSide: 'left' as const,
    isNew: true,
    planBadge: 'Both' as const,
  },
  {
    id: 'environment',
    title: 'Environment Monitoring',
    eyebrow: 'Shed Conditions',
    icon: <Thermometer className="w-6 h-6" />,
    body: 'Monitor shed environment to prevent disease and optimize growth. Track humidity, ammonia levels, light programmes, and ventilation settings with IoT sensor integration.',
    features: [
      'Daily humidity and ammonia logging',
      'Environment score calculation (1-10)',
      'Alert rules for dangerous conditions',
      'Light programme tracking',
      'Ventilation setting records',
      'IoT sensor integration (Enterprise)',
      'Environment vs FCR correlation analysis',
    ],
    screenshotSide: 'right' as const,
    isNew: true,
    planBadge: 'Enterprise' as const,
  },
  {
    id: 'benchmarking',
    title: 'Breed-Matched Network Benchmarking',
    eyebrow: 'Performance Intelligence',
    icon: <Award className="w-6 h-6" />,
    body: 'See how your farm performs against peers. Compare FCR, mortality, daily gain, and harvest age against similar farms using the same breed in your region.',
    features: [
      'Breed-specific benchmarking (Cobb, Ross, Hubbard)',
      'Regional comparison (India, Global)',
      'Percentile ranking (e.g., "Top 23%")',
      'Historical percentile trend over batches',
      'Privacy-protected aggregate data only',
      'Minimum 10-farm threshold for benchmark display',
    ],
    screenshotSide: 'left' as const,
    isNew: true,
    planBadge: 'PulsePro' as const,
  },
  {
    id: 'disease-risk',
    title: 'Farm Disease Risk Score',
    eyebrow: 'Risk Intelligence',
    icon: <AlertTriangle className="w-6 h-6" />,
    body: 'Get per-farm disease risk scores during outbreaks. Factors include distance to outbreak, flock age, vaccination status, biosecurity score, and wind direction.',
    features: [
      'Real-time risk score (1-10) per farm',
      'Risk factors breakdown and explanation',
      'Biosecurity score integration',
      'Pre-sell recommendation for high-risk farms',
      'Integrator portfolio risk heatmap',
      'Escalation alerts for score 7+',
    ],
    screenshotSide: 'right' as const,
    isNew: true,
    planBadge: 'PulsePro' as const,
  },
  {
    id: 'documents',
    title: 'Batch Document Library',
    eyebrow: 'Document Management',
    icon: <FolderOpen className="w-6 h-6" />,
    body: 'Store all batch documents in one secure place. Upload DOC invoices, lab reports, vaccination certificates, movement permits, and buyer invoices. Search, preview, and share with one click.',
    features: [
      'Document upload (PDF, JPG, PNG, max 10MB)',
      'Category-based organization',
      'Full-text search across all documents',
      'In-app PDF and image preview',
      'Secure link generation (24h expiry)',
      'FSSAI traceability report auto-inclusion',
      'DPDP-compliant storage (AWS Mumbai)',
    ],
    screenshotSide: 'left' as const,
    isNew: true,
    planBadge: 'Enterprise' as const,
  },
  {
    id: 'fssai',
    title: 'FSSAI & HACCP Traceability',
    eyebrow: 'Compliance',
    icon: <Shield className="w-6 h-6" />,
    body: 'Generate audit-ready traceability reports in one click. Complete batch history from DOC to harvest, including all health events, treatments, and documents.',
    features: [
      'One-click FSSAI traceability report',
      'Complete batch history timeline',
      'HACCP compliance documentation',
      'Audit-ready document bundles',
      'Movement permit integration',
      'Buyer invoice tracking',
    ],
    screenshotSide: 'right' as const,
    isNew: false,
    planBadge: 'Both' as const,
  },
];

const COMPARISON_TABLE = [
  { feature: 'Batch Lifecycle Tracking', flockiq: '✓', poultryCare: '✓', poultryPlan: '✓', spreadsheet: 'Manual' },
  { feature: 'FCR & Feed Efficiency', flockiq: '✓', poultryCare: '✓', poultryPlan: '✓', spreadsheet: 'Manual' },
  { feature: 'WhatsApp Daily Log Automation', flockiq: '✓', poultryCare: '✗', poultryPlan: '✗', spreadsheet: '✗' },
  { feature: 'Hindi Language Support', flockiq: '✓', poultryCare: '✗', poultryPlan: '✗', spreadsheet: '✗' },
  { feature: 'Full Batch P&L Tracking', flockiq: '✓', poultryCare: 'Limited', poultryPlan: '✓', spreadsheet: 'Manual' },
  { feature: 'Bird Lifting & Sales Management', flockiq: '✓', poultryCare: '✗', poultryPlan: '✓', spreadsheet: 'Manual' },
  { feature: 'Medication & Withdrawal Tracking', flockiq: '✓', poultryCare: '✗', poultryPlan: 'Limited', spreadsheet: '✗' },
  { feature: 'Environment Monitoring', flockiq: '✓', poultryCare: '✗', poultryPlan: '✓', spreadsheet: '✗' },
  { feature: 'Breed-Matched Benchmarking', flockiq: '✓', poultryCare: '✗', poultryPlan: '✗', spreadsheet: '✗' },
  { feature: 'Farm Disease Risk Score', flockiq: '✓', poultryCare: '✗', poultryPlan: '✗', spreadsheet: '✗' },
  { feature: 'Batch Document Library', flockiq: '✓', poultryCare: '✗', poultryPlan: 'Limited', spreadsheet: '✗' },
  { feature: 'FSSAI Traceability Reports', flockiq: '✓', poultryCare: '✗', poultryPlan: '✓', spreadsheet: 'Manual' },
  { feature: 'Price Intelligence (7-day forecast)', flockiq: '✓', poultryCare: '✗', poultryPlan: '✗', spreadsheet: '✗' },
  { feature: 'India Mandi Data Integration', flockiq: '✓', poultryCare: '✗', poultryPlan: '✗', spreadsheet: '✗' },
  { feature: 'Mobile-First Design', flockiq: '✓', poultryCare: '✓', poultryPlan: '✓', spreadsheet: 'Desktop' },
];

export default function FarmManagementPage() {
  const [activeSection, setActiveSection] = useState('');
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Intersection Observer for active section highlighting
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3, rootMargin: '-100px 0px -70% 0px' }
    );

    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (anchorId: string) => {
    const element = document.querySelector(anchorId);
    if (element) {
      const navHeight = 72;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <FadeUp>
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 mb-6">
              Complete Farm Management
              <span className="text-brand-700"> — From DOC to Harvest</span>
            </h1>
            <p className="text-xl sm:text-2xl text-neutral-600 mb-8">
              Track every batch, optimize FCR, manage health events, and automate daily data collection — all in one platform built for poultry operations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="primary" size="lg" pill asChild>
                <a href="/signup">Start Free Trial — 14 Days</a>
              </Button>
              <Button variant="secondary" size="lg" pill asChild>
                <a href="/pricing">View Pricing</a>
              </Button>
            </div>
          </div>
        </FadeUp>
      </section>

      {/* Main Content with Sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="lg:flex lg:gap-12">
          {/* Sticky Sidebar - Desktop Only */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-24 space-y-1">
              <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-4">
                Features
              </h3>
              <nav className="space-y-1">
                {FEATURE_SUBSECTIONS.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(`#${section.id}`)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeSection === section.id
                        ? 'bg-brand-50 text-brand-700 font-semibold'
                        : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                    }`}
                  >
                    {section.title}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {FEATURE_SUBSECTIONS.map((section, index) => (
              <div
                key={section.id}
                ref={(el: HTMLDivElement | null) => {
                  sectionRefs.current[index] = el;
                }}
              >
                <FeatureSubsection
                  id={section.id}
                  icon={section.icon}
                  eyebrow={section.eyebrow}
                  title={section.title}
                  body={section.body}
                  features={section.features}
                  screenshotSide={section.screenshotSide}
                  isNew={section.isNew}
                  planBadge={section.planBadge}
                  cta={{ label: 'Learn More', href: '/pricing' }}
                />
              </div>
            ))}

            {/* Comparison Table Section */}
            <section id="comparison" className="mt-24 scroll-mt-24">
              <FadeUp>
                <div className="mb-8">
                  <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-3">
                    How FlockIQ Compares
                  </h2>
                  <p className="text-lg text-neutral-600 max-w-3xl">
                    See why 500+ farms choose FlockIQ over manual spreadsheets and generic ERPs.
                  </p>
                </div>

                {/* Comparison Table */}
                <div className="overflow-x-auto rounded-xl border border-neutral-200">
                  <table className="w-full min-w-[700px]">
                    <thead className="bg-neutral-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900 sticky left-0 bg-neutral-50">
                          Feature
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-neutral-900">
                          FlockIQ
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-neutral-900">
                          Poultry.care
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-neutral-900">
                          PoultryPlan
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-neutral-900">
                          Spreadsheet
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      {COMPARISON_TABLE.map((row, index) => (
                        <tr key={index} className="bg-white hover:bg-neutral-50">
                          <td className="px-6 py-4 text-sm text-neutral-900 font-medium sticky left-0 bg-white hover:bg-neutral-50">
                            {row.feature}
                          </td>
                          <td className="px-6 py-4 text-sm text-center text-brand-700 font-semibold bg-brand-50/50">
                            {row.flockiq}
                          </td>
                          <td className="px-6 py-4 text-sm text-center text-neutral-600">
                            {row.poultryCare}
                          </td>
                          <td className="px-6 py-4 text-sm text-center text-neutral-600">
                            {row.poultryPlan}
                          </td>
                          <td className="px-6 py-4 text-sm text-center text-neutral-600">
                            {row.spreadsheet}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* CTA */}
                <div className="mt-8 text-center">
                  <Button variant="primary" size="lg" pill asChild>
                    <a href="/signup">Start Free Trial — 14 Days</a>
                  </Button>
                </div>
              </FadeUp>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
