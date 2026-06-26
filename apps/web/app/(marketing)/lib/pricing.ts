// FlockIQ — Pricing Configuration Library
// File: apps/web/app/(marketing)/lib/pricing.ts
// Version: v1.0 | May 2026
// Task Reference: TASK-WEB-010
// Requirements: REQ-WEB-003

export interface PricingTier {
  id: 'flockiq_farm' | 'flockiq_pro';
  name: string;
  targetAudience: string;
  flockSizeRange: string;
  basePrice: number; // Monthly base price
  features: string[];
  isPopular?: boolean;
  cta: {
    text: string;
    link: string;
  };
}

export interface FlockSizePricing {
  label: string;
  minBirds: number;
  maxBirds: number;
  monthlyPrice: number;
  note?: string;
}

export interface FeatureComparison {
  category: string;
  features: {
    name: string;
    flockiq_farm: 'included' | 'partial' | 'excluded' | string;
    flockiq_pro: 'included' | 'partial' | 'excluded' | string;
  }[];
}

export const FLOCK_SIZE_PRICING: FlockSizePricing[] = [
  {
    label: '10K–25K birds',
    minBirds: 10000,
    maxBirds: 25000,
    monthlyPrice: 5000,
  },
  {
    label: '25K–50K birds',
    minBirds: 25000,
    maxBirds: 50000,
    monthlyPrice: 5000,
  },
  {
    label: '50K–1L birds',
    minBirds: 50000,
    maxBirds: 100000,
    monthlyPrice: 8000,
    note: 'Integrator tier starts',
  },
];

export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'flockiq_farm',
    name: 'FlockIQ FARM',
    targetAudience: 'For individual farmers',
    flockSizeRange: '10K–50K birds',
    basePrice: 5000, // Monthly price
    features: [
      'Live today\'s mandi price',
      '7-day price forecast (Soon)',
      'Daily sell signal (Soon)',
      'Batch ROI calculator',
      'Middleman check',
      'FCR analytics',
      'Daily mortality tracking',
      'Vaccination scheduler',
      'Health checklist',
      'HPAI + disease alerts',
      'Full Batch P&L (chick, feed, medicine, labour)',
      'Bird Lifting & Sales Management',
      'Medication & Withdrawal Tracking',
      'Environment Monitoring (humidity, ammonia)',
      'Breed-Matched Network Benchmarking',
      'Per-Farm Calamity Risk Score',
      'Batch Document Library',
      'Works offline (Hindi-first)',
    ],
    cta: {
      text: 'Start 14-Day Free Trial',
      link: '/login?action=signup&source=pricing',
    },
  },
  {
    id: 'flockiq_pro',
    name: 'FlockIQ PRO',
    targetAudience: 'For integrators, feed companies & QSR',
    flockSizeRange: '50K+ birds managed',
    basePrice: 8000, // Monthly price
    features: [
      'Everything in FlockIQ FARM',
      '30-day AI forecast (P10/P50/P90) (Soon)',
      'Multi-farm dashboard',
      'Unlimited farms & batches',
      'Optimal sell window analysis',
      'Price driver analysis (SHAP)',
      'API access',
      'ERP integrations (Tally, Zoho, SAP)',
      'IoT device integration',
      'FSSAI traceability',
      'Field worker supervisor app',
      'HACCP compliance',
      'Dedicated account manager',
      'SLA: 99.9% uptime',
    ],
    isPopular: true,
    cta: {
      text: 'Start 14-Day Free Trial',
      link: '/login?action=signup&source=pricing',
    },
  },
];

export const FEATURE_COMPARISON: FeatureComparison[] = [
  {
    category: 'PRICE INTELLIGENCE',
    features: [
      { name: '7-day price forecast (Soon)', flockiq_farm: 'included', flockiq_pro: 'included' },
      { name: '30-day forward intelligence (Soon)', flockiq_farm: 'excluded', flockiq_pro: 'included' },
      { name: 'Multi-district price map', flockiq_farm: 'excluded', flockiq_pro: 'included' },
      { name: 'API access', flockiq_farm: 'excluded', flockiq_pro: 'included' },
    ],
  },
  {
    category: 'SELL INTELLIGENCE',
    features: [
      { name: 'Daily sell signal (Soon)', flockiq_farm: 'included', flockiq_pro: 'included' },
      { name: 'Batch ROI Optimizer', flockiq_farm: 'included', flockiq_pro: 'included' },
      { name: 'Multi-farm harvest queue', flockiq_farm: 'excluded', flockiq_pro: 'included' },
      { name: 'Middleman check + Hindi script', flockiq_farm: 'included', flockiq_pro: 'included' },
    ],
  },
  {
    category: 'FARM OPERATIONS',
    features: [
      { name: 'Batch lifecycle management', flockiq_farm: 'included', flockiq_pro: 'included' },
      { name: 'FCR analytics', flockiq_farm: 'included', flockiq_pro: 'included' },
      { name: 'Daily mortality tracking', flockiq_farm: 'included', flockiq_pro: 'included' },
      { name: 'Weight gain tracking', flockiq_farm: 'included', flockiq_pro: 'included' },
      { name: 'Full Batch P&L (all cost types)', flockiq_farm: 'included', flockiq_pro: 'included' },
      { name: 'Bird Lifting & Sales Management', flockiq_farm: 'included', flockiq_pro: 'included' },
      { name: 'Medication & Withdrawal Tracking', flockiq_farm: 'included', flockiq_pro: 'included' },
      { name: 'Environment Monitoring (humidity, ammonia)', flockiq_farm: 'included', flockiq_pro: 'included' },
      { name: 'Breed-Matched Network Benchmarking', flockiq_farm: 'included', flockiq_pro: 'included' },
      { name: 'Per-Farm Calamity Risk Score', flockiq_farm: 'included', flockiq_pro: 'included' },
      { name: 'Batch Document Library', flockiq_farm: 'included', flockiq_pro: 'included' },
      { name: 'Inventory management', flockiq_farm: 'excluded', flockiq_pro: 'included' },
    ],
  },
  {
    category: 'HEALTH & BIOSECURITY',
    features: [
      { name: 'Vaccination scheduler', flockiq_farm: 'included', flockiq_pro: 'included' },
      { name: 'Treatment journal with dosage records', flockiq_farm: 'included', flockiq_pro: 'included' },
      { name: 'Withdrawal period auto-calculation', flockiq_farm: 'included', flockiq_pro: 'included' },
      { name: 'AB-Free certification tracking', flockiq_farm: 'included', flockiq_pro: 'included' },
      { name: 'Health checklist', flockiq_farm: 'included', flockiq_pro: 'included' },
      { name: 'Biosecurity audit', flockiq_farm: 'included', flockiq_pro: 'included' },
      { name: 'FSSAI traceability', flockiq_farm: 'excluded', flockiq_pro: 'included' },
      { name: 'HACCP compliance', flockiq_farm: 'excluded', flockiq_pro: 'included' },
    ],
  },
  {
    category: 'ALERTS & NOTIFICATIONS',
    features: [
      { name: 'HPAI + disease alerts', flockiq_farm: 'included', flockiq_pro: 'included' },
      { name: 'Weather warnings', flockiq_farm: 'included', flockiq_pro: 'included' },
      { name: 'Price crash alerts', flockiq_farm: 'included', flockiq_pro: 'included' },
      { name: 'Feed cost alerts', flockiq_farm: 'excluded', flockiq_pro: 'included' },
      { name: 'IoT device alerts', flockiq_farm: 'excluded', flockiq_pro: 'included' },
    ],
  },
  {
    category: 'INTEGRATIONS',
    features: [
      { name: 'WhatsApp integration', flockiq_farm: 'included', flockiq_pro: 'included' },
      { name: 'IoT device integration', flockiq_farm: 'excluded', flockiq_pro: 'included' },
      { name: 'ERP integrations (Tally, Zoho)', flockiq_farm: 'excluded', flockiq_pro: 'included' },
      { name: 'SAP/Oracle integration', flockiq_farm: 'excluded', flockiq_pro: 'included' },
      { name: 'API access', flockiq_farm: 'excluded', flockiq_pro: 'included' },
    ],
  },
];

export const FAQ_ITEMS = [
  {
    id: 'free-trial',
    question: {
      en: 'Is there a free trial?',
      hi: 'क्या कोई free trial है?',
    },
    answer: {
      en: 'Yes, 14 days free trial. No credit card required.',
      hi: 'हाँ, 14 दिन का free trial। कोई credit card की जरूरत नहीं।',
    },
  },
  {
    id: 'cancellation',
    question: {
      en: 'What is the cancellation process?',
      hi: 'रद्द करने की प्रक्रिया क्या है?',
    },
    answer: {
      en: 'Cancel anytime from Settings. No lock-in period.',
      hi: 'Settings से कभी भी cancel करें। कोई lock-in period नहीं।',
    },
  },
  {
    id: 'enterprise-pricing',
    question: {
      en: 'Is Enterprise pricing custom?',
      hi: 'क्या Enterprise pricing custom होती है?',
    },
    answer: {
      en: 'Yes, Enterprise pricing is custom. Contact sales for a quote.',
      hi: 'हाँ, Enterprise pricing custom होती है। Quote के लिए sales से संपर्क करें।',
    },
  },
  {
    id: 'data-security',
    question: {
      en: 'Is my data secure?',
      hi: 'क्या मेरा data secure है?',
    },
    answer: {
      en: 'Yes, DPDP Act 2023 compliant. Encrypted at rest. Data stays in India (AWS Mumbai).',
      hi: 'हाँ, DPDP Act 2023 compliant। Encrypted at rest। Data India में रहता है (AWS Mumbai)।',
    },
  },
  {
    id: 'whatsapp-alerts',
    question: {
      en: 'Are WhatsApp alerts included in all plans?',
      hi: 'WhatsApp alerts सभी plans में हैं?',
    },
    answer: {
      en: 'Yes, WhatsApp alerts are included in all plans.',
      hi: 'हाँ, WhatsApp alerts सभी plans में शामिल हैं।',
    },
  },
  {
    id: 'multi-user',
    question: {
      en: 'When is multi-user access available?',
      hi: 'Multi-user access कब से?',
    },
    answer: {
      en: 'Available with Team add-on from ₹500/user/month.',
      hi: 'Team add-on से ₹500/user/month से available है।',
    },
  },
];

export const TRUST_SIGNALS = [
  {
    id: 'no-credit-card',
    text: {
      en: 'No credit card required for trial',
      hi: 'Trial के लिए कोई credit card नहीं',
    },
  },
  {
    id: 'cancel-anytime',
    text: {
      en: 'Cancel anytime — no lock-in',
      hi: 'कभी भी cancel करें — कोई lock-in नहीं',
    },
  },
  {
    id: 'data-in-india',
    text: {
      en: 'Data stays in India (AWS Mumbai)',
      hi: 'Data India में रहता है (AWS Mumbai)',
    },
  },
  {
    id: 'dpdp-compliant',
    text: {
      en: 'DPDP Act 2023 compliant',
      hi: 'DPDP Act 2023 compliant',
    },
  },
];

// Helper function to get price based on flock size
export function getPriceForFlockSize(birdCount: number): number {
  for (const tier of FLOCK_SIZE_PRICING) {
    if (birdCount >= tier.minBirds && birdCount <= tier.maxBirds) {
      return tier.monthlyPrice;
    }
  }
  // Default to highest tier if above max
  return FLOCK_SIZE_PRICING[FLOCK_SIZE_PRICING.length - 1].monthlyPrice;
}

// Helper function to calculate annual price with 20% discount
export function getAnnualPrice(monthlyPrice: number): number {
  return Math.round(monthlyPrice * 12 * 0.8);
}

// Helper function to format Indian currency
export function formatIndianCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}
