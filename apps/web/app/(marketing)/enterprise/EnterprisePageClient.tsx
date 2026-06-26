// FlockIQ — Enterprise Page Client Component
// File: apps/web/app/(marketing)/enterprise/EnterprisePageClient.tsx
// Version: v3.0 | June 2026
// Task Reference: CONTENT-PAGE-005
// Requirements: FR-ENTERPRISE-001

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePopup } from '@/providers/PopupProvider';
import { 
  Code, 
  Database, 
  Globe, 
  Users, 
  Building, 
  ShoppingCart, 
  ShieldCheck, 
  Factory, 
  Server,
  Check,
  X,
  ArrowRight,
  ChevronRight
} from 'lucide-react'
import { AlertTriangle as Warning } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FadeUp } from '@/components/motion/FadeUp';
import { Card } from '@/components/ui/Card';

const segments = [
  {
    id: 's2',
    name: 'Integrators',
    subtitle: '50K–5M birds across multiple locations',
    icon: Building,
    features: [
      'Complete ERP: Masters, Inventory, Broiler Workflow, Accounts, Payroll',
      'Multi-farm dashboard with real-time visibility',
      'WhatsApp Log Automation for all farms',
      'Chick allocation, feed management, supervisor tracking',
      'GST-compliant accounting with ledgers and vouchers',
      'REST API for custom integrations',
    ],
    pricing: 'From ₹5,000/month per farm',
    primary: true,
  },
  {
    id: 's3',
    name: 'QSR Chains',
    subtitle: 'Direct poultry procurement optimization',
    icon: ShoppingCart,
    features: [
      '7-day price forecasting for procurement planning',
      'Supply chain cost modeling',
      'Vendor performance analytics',
    ],
    pricing: 'Custom pricing based on volume',
    primary: false,
  },
  {
    id: 's4',
    name: 'Insurers',
    subtitle: 'Farm risk assessment & claim validation',
    icon: ShieldCheck,
    features: [
      'Per-farm disease risk score (1–10)',
      'Historical mortality & FCR data',
      'Automated claim validation support',
    ],
    pricing: 'Enterprise licensing',
    primary: false,
  },
  {
    id: 's5',
    name: 'Feed Companies',
    subtitle: 'Demand forecasting & market intelligence',
    icon: Factory,
    features: [
      'Regional demand forecasting by breed',
      'Market intelligence & competitor pricing',
      'Customer consumption analytics',
    ],
    pricing: 'Enterprise licensing',
    primary: false,
  },
  {
    id: 's6',
    name: 'Data Platforms',
    subtitle: 'API & white-label data services',
    icon: Server,
    features: [
      'REST API with rate-limited endpoints',
      'White-label solution with your branding',
      'ISDA-compliant data licensing',
    ],
    pricing: 'Enterprise licensing',
    primary: false,
  },
];

const enterpriseFeatures = [
  {
    icon: Code,
    title: 'REST API Access',
    description: 'Rate-limited endpoints for price forecasts, historical data, and analytics',
  },
  {
    icon: Database,
    title: 'Historical Data (12 months)',
    description: 'Access to 12 months of historical price data for all covered districts',
  },
  {
    icon: Globe,
    title: 'Custom District Coverage',
    description: 'Expand coverage to any district with custom data integration',
  },
  {
    icon: Users,
    title: 'Dedicated Account Manager',
    description: 'Personal support from our team for integration and ongoing success',
  },
];

const dataPartners = [
  'AGMARKNET',
  'NECC',
  'IMD',
  'DAHDF',
  'NCDEX',
];

export default function EnterprisePageClient() {
  const { openPopup } = usePopup();
  const [showDemoForm, setShowDemoForm] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    role: '',
    whatsapp: '',
    segment: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Fire analytics event
    if (typeof window !== 'undefined' && (window as any).posthog) {
      (window as any).posthog.capture('enterprise_contact_submit', {
        segment: formData.segment,
        company_size: formData.company,
      });
    }

    // POST to API
    try {
      const response = await fetch('/api/demo-requests?segment=enterprise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        setFormSubmitted(true);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-pageBg">
      {/* Hero Section */}
      <section
        className="relative min-h-[60vh] flex items-center"
        style={{
          background: 'var(--hero-gradient)',
        }}
      >
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 w-full py-20">
          <FadeUp>
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="font-sora font-extrabold text-white leading-[1.1] mb-6" style={{ fontSize: 'clamp(2.25rem, 4vw + 0.5rem, 3.75rem)' }}>
                FlockIQ Enterprise — For the Poultry Value Chain
              </h1>
              <p className="text-white/80 text-lg md:text-xl leading-relaxed mb-8 max-w-3xl mx-auto">
                From integrators managing 500K birds to QSR chains optimizing procurement to insurers assessing farm risk — FlockIQ provides the data layer that modern poultry businesses need.
              </p>
              <Button
                variant="accent"
                size="hero"
                pill
                icon={<ArrowRight size={18} />}
                onClick={() => openPopup('demo_modal')}
              >
                Book Enterprise Demo
              </Button>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* Segment Cards */}
      <section className="py-section-vertical bg-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp className="mb-12">
            <h2 className="font-sora font-bold text-[clamp(1.75rem, 2.5vw + 0.5rem, 2.5rem)] text-neutral-900 mb-4">
              Who We Serve
            </h2>
            <p className="text-neutral-700 text-lg max-w-2xl">
              Tailored solutions for every segment of the poultry value chain
            </p>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {segments.map((segment, index) => (
              <FadeUp key={segment.id} delay={index * 0.1}>
                <Card 
                  hover 
                  highlighted={segment.primary}
                  className={`p-8 h-full ${segment.primary ? 'border-2 border-brand-400' : ''}`}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 rounded-xl bg-brand-50 text-brand-700">
                      <segment.icon size={28} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-sora font-bold text-xl text-neutral-900 mb-1">
                        {segment.name}
                      </h3>
                      <p className="text-sm text-neutral-600">{segment.subtitle}</p>
                    </div>
                  </div>
                  
                  <ul className="space-y-3 mb-6">
                    {segment.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-neutral-700">
                        <Check size={16} className="text-brand-700 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-4 border-t border-neutral-200">
                    <p className="text-sm font-semibold text-brand-700">{segment.pricing}</p>
                  </div>
                </Card>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise Features */}
      <section className="py-section-vertical bg-neutral50">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp className="mb-12">
            <h2 className="font-sora font-bold text-[clamp(1.75rem, 2.5vw + 0.5rem, 2.5rem)] text-neutral-900 mb-4">
              Enterprise Features
            </h2>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {enterpriseFeatures.map((feature, index) => (
              <FadeUp key={index} delay={index * 0.1}>
                <Card className="p-6 h-full">
                  <feature.icon size={32} className="text-brand-700 mb-4" />
                  <h3 className="font-semibold text-neutral-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-neutral-700">{feature.description}</p>
                </Card>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* SLA Strip */}
      <section className="py-section-vertical bg-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="bg-brand-900 rounded-2xl p-8 md:p-12">
              <h2 className="font-sora font-bold text-2xl text-white mb-8 text-center">
                Service Level Agreement
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div>
                  <p className="font-sora font-extrabold text-4xl md:text-5xl text-brand-400 mb-2">99.9%</p>
                  <p className="text-white/80">Uptime Guarantee</p>
                </div>
                <div>
                  <p className="font-sora font-extrabold text-4xl md:text-5xl text-brand-400 mb-2">&lt;100ms</p>
                  <p className="text-white/80">API Response Time</p>
                </div>
                <div>
                  <p className="font-sora font-extrabold text-4xl md:text-5xl text-brand-400 mb-2">24/7</p>
                  <p className="text-white/80">Support Availability</p>
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* Trust Partners */}
      <section className="py-section-vertical bg-neutral50">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp className="text-center mb-8">
            <p className="font-jakarta font-bold text-[11px] text-neutral-500 uppercase tracking-[0.16em] mb-4">
              Powered by verified data
            </p>
            <div className="flex flex-wrap justify-center gap-6 md:gap-8">
              {dataPartners.map((partner) => (
                <span key={partner} className="text-neutral400 font-semibold text-sm md:text-base">
                  {partner}
                </span>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* Contact Sales Form */}
      <section className="py-section-vertical bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp className="text-center mb-8">
            <h2 className="font-sora font-bold text-[clamp(1.75rem, 2.5vw + 0.5rem, 2.5rem)] text-neutral-900 mb-4">
              Talk to Sales
            </h2>
            <p className="text-neutral-700">
              Fill out the form below and our team will get back to you within 2 business hours.
            </p>
          </FadeUp>

          <FadeUp delay={0.2}>
            <Card className="p-8">
              {!formSubmitted ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-neutral-700 mb-2">
                      Name *
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
                      placeholder="Your full name"
                    />
                  </div>

                  <div>
                    <label htmlFor="company" className="block text-sm font-semibold text-neutral-700 mb-2">
                      Company *
                    </label>
                    <input
                      id="company"
                      type="text"
                      required
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
                      placeholder="Company name"
                    />
                  </div>

                  <div>
                    <label htmlFor="role" className="block text-sm font-semibold text-neutral-700 mb-2">
                      Role *
                    </label>
                    <input
                      id="role"
                      type="text"
                      required
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
                      placeholder="Your role (e.g., CEO, Procurement Manager)"
                    />
                  </div>

                  <div>
                    <label htmlFor="whatsapp" className="block text-sm font-semibold text-neutral-700 mb-2">
                      WhatsApp Number *
                    </label>
                    <input
                      id="whatsapp"
                      type="tel"
                      required
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>

                  <div>
                    <label htmlFor="segment" className="block text-sm font-semibold text-neutral-700 mb-2">
                      Segment *
                    </label>
                    <select
                      id="segment"
                      required
                      value={formData.segment}
                      onChange={(e) => setFormData({ ...formData, segment: e.target.value })}
                      className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent bg-white"
                    >
                      <option value="">Select your segment</option>
                      <option value="integrator">Integrator (S2)</option>
                      <option value="qsr">QSR Chain (S3)</option>
                      <option value="insurer">Insurer (S4)</option>
                      <option value="feed">Feed Company (S5)</option>
                      <option value="data">Data Platform (S6)</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-neutral-700 mb-2">
                      Message (Optional)
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent resize-none"
                      placeholder="Tell us about your requirements..."
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    pill
                    className="w-full"
                  >
                    Submit Request
                  </Button>
                </form>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check size={32} className="text-brand-700" />
                  </div>
                  <h3 className="font-sora font-bold text-xl text-neutral-900 mb-2">
                    Request Submitted Successfully
                  </h3>
                  <p className="text-neutral-700 mb-6">
                    Our team will get back to you within 2 business hours.
                  </p>
                  <Button
                    variant="secondary"
                    size="md"
                    pill
                    onClick={() => {
                      setFormSubmitted(false);
                      setShowDemoForm(false);
                      setFormData({ name: '', company: '', role: '', whatsapp: '', segment: '', message: '' });
                    }}
                  >
                    Close
                  </Button>
                </div>
              )}
            </Card>
          </FadeUp>
        </div>
      </section>

      {/* Final CTA */}
      <section
        className="py-section-vertical"
        style={{
          background: 'var(--hero-gradient)',
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeUp>
            <h2 className="font-sora font-extrabold text-white text-[clamp(2rem, 4vw, 3rem)] mb-4">
              Ready to Scale Your Operations?
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
              Join leading poultry businesses using FlockIQ to drive efficiency and profitability.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="accent"
                size="hero"
                pill
                icon={<ArrowRight size={18} />}
                onClick={() => openPopup('demo_modal')}
              >
                Book Enterprise Demo
              </Button>
              <Button
                variant="ghost"
                size="hero"
                pill
                className="text-white bg-white/15 hover:bg-white/20"
                icon={<ChevronRight size={16} />}
                iconPosition="right"
                asChild
              >
                <a href="/pricing">View Pricing</a>
              </Button>
            </div>
          </FadeUp>
        </div>
      </section>
    </div>
  );
}
