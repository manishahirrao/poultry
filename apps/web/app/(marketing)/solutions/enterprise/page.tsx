// FlockIQ — S5 Enterprise Page
// File: apps/web/app/(marketing)/solutions/enterprise/page.tsx
// Version: v1.0 | May 2026
// Task Reference: TASK-WEB-013
// Requirements: REQ-WEB-005 §W5.4

import type { Metadata } from 'next';
import SolutionsPageTemplate, { 
  type SolutionsPageProps, 
  type PainPoint, 
  type Feature 
} from '../components/SolutionsPageTemplate';
import PageViewTracker from '../components/PageViewTracker';

// Generate metadata for SEO
// Task Reference: TASK-WEB-022
// Requirement Refs: GWEB-003
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Enterprise Poultry Intelligence API | FlockIQ for Enterprise',
    description: '30-day forward price intelligence with 95%+ accuracy. API-first platform for QSR, processors, and insurers. FSSAI/HACCP compliance, SAP/Oracle integration.',
    keywords: ['enterprise poultry API', 'poultry price forecast API', 'FSSAI compliance software', 'HACCP poultry traceability', 'SAP poultry integration'],
    openGraph: {
      type: 'website',
      locale: 'en_IN',
      url: 'https://FlockIQ.ai/solutions/enterprise',
      siteName: 'FlockIQ',
      title: 'Enterprise Poultry Intelligence API | FlockIQ for Enterprise',
      description: '30-day forward price intelligence with 95%+ accuracy. API-first platform for enterprise buyers.',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: 'FlockIQ for Enterprise',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Enterprise Poultry Intelligence API | FlockIQ for Enterprise',
      description: '30-day forward price intelligence with 95%+ accuracy. API-first platform for enterprise buyers.',
      images: ['/og-image.png'],
    },
    alternates: {
      canonical: 'https://FlockIQ.ai/solutions/enterprise',
      languages: {
        'hi-IN': 'https://FlockIQ.ai/solutions/enterprise',
        'en-IN': 'https://FlockIQ.ai/solutions/enterprise?lang=en',
        'x-default': 'https://FlockIQ.ai/solutions/enterprise',
      },
    },
  };
}

// JSON-LD Schema for Enterprise Page
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      name: 'FlockIQ for Enterprise',
      description: 'API-first poultry intelligence platform for enterprise buyers with 30-day forward visibility',
      url: 'https://FlockIQ.ai/solutions/enterprise',
    },
    {
      '@type': 'Service',
      name: 'Enterprise Poultry Intelligence API',
      description: '30-day forward price intelligence API with FSSAI/HACCP compliance and ERP integrations',
      provider: {
        '@type': 'Organization',
        name: 'FlockIQ',
      },
      serviceType: 'API Service',
      areaServed: {
        '@type': 'Country',
        name: 'India',
      },
    },
  ],
};

// Segment-specific content for enterprise
const enterpriseContent: SolutionsPageProps = {
  segment: 'enterprise',
  metadata: {
    title: 'Enterprise Poultry Intelligence API | FlockIQ for Enterprise',
    description: '30-day forward price intelligence with 95%+ accuracy. API-first platform for QSR, processors, and insurers.',
    keywords: ['enterprise poultry API', 'poultry price forecast API', 'FSSAI compliance software'],
  },
  hero: {
    headline: {
      en: '30-Day Forward Price Intelligence. Verified at 95%+. API-First.',
    },
    subheadline: {
      en: 'Enterprise-grade API platform for QSR chains, processors, and insurers. FSSAI/HACCP compliance, SAP/Oracle integration, and 99.9% uptime SLA.',
    },
    background: 'white',
  },
  stats: [
    { value: '30-day', label: 'Forward forecast horizon' },
    { value: '95%+', label: 'Directional accuracy' },
    { value: '99.9%', label: 'Uptime SLA' },
    { value: 'REST API', label: 'Standard integration' },
  ],
  painPoints: [
    {
      emoji: '💰',
      title: 'Procurement Contract Pricing Risk',
      description: 'Fixed-price contracts with suppliers expose you to market volatility. Without forward visibility, you cannot hedge effectively or negotiate optimal terms.',
      impact: '₹5-10/kg price swing on 100 MT/month procurement = ₹50L-1Cr monthly variance',
    },
    {
      emoji: '🔗',
      title: 'Supply Chain Disruption Blind Spot',
      description: 'HPAI outbreaks, transport strikes, and demand shifts happen with no warning. By the time you know, your supply chain is already disrupted.',
      impact: '2-3 day reaction time = production stoppages worth ₹1-5Cr for large processors',
    },
    {
      emoji: '📋',
      title: 'FSSAI Audit Burden',
      description: 'Manual traceability documentation is error-prone and time-consuming. Audit preparation takes weeks when it should take hours.',
      impact: '40+ hours per audit vs 4 hours with automated traceability',
    },
  ],
  features: [
    {
      emoji: '🔌',
      title: '30-Day Forecast API',
      description: 'RESTful API providing P10/P50/P90 price forecasts with 30-day forward visibility. JSON responses, standard authentication, 99.9% SLA.',
      benefit: 'Enterprise-grade reliability for mission-critical procurement decisions',
    },
    {
      emoji: '📋',
      title: 'FSSAI Batch Traceability',
      description: 'One-click traceability reports for compliance audits. Complete batch history from DOC to harvest with vaccination, medication, and movement records.',
      benefit: 'Audit preparation time reduced from 40 hours to 4 hours',
    },
    {
      emoji: '✅',
      title: 'HACCP Compliance Workflow',
      description: 'Automated HACCP checklists, critical control point monitoring, and deviation alerts. Built-in corrective action tracking and reporting.',
      benefit: 'Zero compliance violations through proactive monitoring',
    },
    {
      emoji: '🔔',
      title: 'Supply Shock Early Warning Webhooks',
      description: 'Real-time webhooks for HPAI zone alerts, price anomalies, and demand shifts. 48-72 hour advance notice for proactive response.',
      benefit: 'Proactive response prevents ₹1-5Cr in production stoppages',
    },
    {
      emoji: '🔗',
      title: 'SAP/Oracle Integration',
      description: 'Pre-built connectors for SAP and Oracle ERP systems. Two-way data sync for procurement, inventory, and financial systems.',
      benefit: 'Zero manual data entry, seamless enterprise workflow',
    },
    {
      emoji: '🗺️',
      title: 'Multi-District Coverage',
      description: 'Price intelligence across all major poultry-producing districts in India. Single API call for multi-location procurement optimization.',
      benefit: 'Optimal sourcing decisions across your entire supply network',
    },
    {
      emoji: '🔐',
      title: 'Enterprise Security',
      description: 'SOC 2 Type II compliance, data encryption at rest and in transit, role-based access control, and audit logging for enterprise security requirements.',
      benefit: 'Meets enterprise security and compliance standards',
    },
    {
      emoji: '📊',
      title: 'API Playground & Documentation',
      description: 'Interactive API playground for testing endpoints. Comprehensive Swagger documentation with code samples in Python, Node.js, and cURL.',
      benefit: 'Developer-friendly integration with minimal time-to-value',
    },
  ],
  primaryCta: {
    label: 'Request Demo',
    href: '/demo?segment=enterprise',
  },
  secondaryCta: {
    label: 'API Documentation →',
    href: '/developers',
  },
  finalCta: {
    headline: 'Ready to Transform Your Enterprise Procurement?',
    subheadline: 'Schedule a technical consultation to see how our API can integrate with your systems and reduce procurement risk.',
    trustSignals: [
      '✅ 99.9% uptime SLA',
      '✅ SOC 2 Type II compliant',
      '✅ SAP/Oracle connectors included',
      '✅ Dedicated enterprise support',
    ],
  },
};

export default function EnterprisePage() {
  return (
    <>
      <PageViewTracker segment="enterprise" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SolutionsPageTemplate {...enterpriseContent} />
    </>
  );
}
