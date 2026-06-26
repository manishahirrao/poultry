// FlockIQ — Features Configuration Library
// File: apps/web/app/(marketing)/lib/features.ts
// Version: v1.0 | May 2026
// Task Reference: TASK-WEB-014
// Requirements: REQ-WEB-002

export interface Feature {
  id: string;
  name: string;
  description: string;
  benefit: string;
  tier: 'PulsePro' | 'PulseEnterprise' | 'Both';
  icon?: string; // Emoji icon
}

export interface FeatureModule {
  id: string;
  anchorId: string;
  title: string;
  description: string;
  features: Feature[];
}

export interface ComparisonRow {
  feature: string;
  manual: 'included' | 'partial' | 'excluded' | string;
  genericErp: 'included' | 'partial' | 'excluded' | string;
  FlockIQ: 'included' | 'partial' | 'excluded' | string;
}

export const FEATURE_MODULES: FeatureModule[] = [
  {
    id: 'price-intelligence',
    anchorId: '#price-intelligence',
    title: 'Price Intelligence (Coming Soon)',
    description: 'AI-powered price forecasting with confidence bands and historical data analysis',
    features: [
      {
        id: 'price-forecast',
        name: '30-Day Price Forecast',
        description: 'AI-powered broiler price forecast with P10/P50/P90 confidence bands for the next 30 days. Updated daily at 06:00 for your district with accuracy decay visualization.',
        benefit: '✅ Know the price range: Sell when prices are in the top 20% of forecast',
        tier: 'Both',
        icon: '📊',
      },
      {
        id: 'sell-signal',
        name: 'Daily Sell Signal',
        description: 'WhatsApp message every morning at 06:30 with SELL NOW / HOLD / CAUTION recommendation based on AI analysis of market conditions.',
        benefit: '✅ Never miss the optimal sell window: Average ₹1.50/bird gain',
        tier: 'Both',
        icon: '✅',
      },
      {
        id: 'price-drivers',
        name: 'AI Price Drivers',
        description: 'SHAP-based analysis showing why prices are moving - maize cost, festivals, demand signals, and seasonal factors.',
        benefit: '✅ Understand market dynamics: Make informed selling decisions',
        tier: 'PulsePro',
        icon: '🔍',
      },
      {
        id: 'district-map',
        name: 'District Price Map',
        description: 'Multi-district price comparison map showing real-time prices across Gorakhpur, Lucknow, Varanasi, and neighboring districts.',
        benefit: '✅ Identify arbitrage opportunities: Sell in the highest-paying district',
        tier: 'PulseEnterprise',
        icon: '🗺️',
      },
      {
        id: 'historical-data',
        name: 'Historical Price Data',
        description: 'Access 2 years of historical price data with trend analysis, seasonal patterns, and festival impact visualization.',
        benefit: '✅ Spot seasonal patterns: Plan your harvest around price peaks',
        tier: 'Both',
        icon: '📈',
      },
      {
        id: 'price-alerts',
        name: 'Price Alert Panel',
        description: 'Set custom price alerts for above/below thresholds or sell signal activation. Get notified via WhatsApp, email, or in-app.',
        benefit: '✅ Never miss target prices: Automate your selling strategy',
        tier: 'PulsePro',
        icon: '🔔',
      },
      {
        id: 'api-access',
        name: 'Price Forecast API',
        description: 'RESTful API to integrate price forecasts into your ERP, procurement systems, or custom applications.',
        benefit: '✅ Automate procurement: Get forecasts in your existing systems',
        tier: 'PulseEnterprise',
        icon: '🔌',
      },
    ],
  },
  {
    id: 'sell-intelligence',
    anchorId: '#sell-intelligence',
    title: 'Sell Intelligence (Coming Soon)',
    description: 'Daily sell signals with financial impact analysis and negotiation support',
    features: [
      {
        id: 'sell-signal',
        name: 'Daily Sell Signal',
        description: 'WhatsApp message every morning at 06:30 with SELL NOW / HOLD / CAUTION recommendation based on AI analysis.',
        benefit: '✅ Never miss the optimal sell window: Average ₹1.50/bird gain',
        tier: 'Both',
        icon: '✅',
      },
      {
        id: 'batch-roi',
        name: 'Batch ROI Optimizer',
        description: 'Compare exact ₹ profit: sell today vs wait 3/7/14 days. Shows financial impact with flock size and weight calculations.',
        benefit: '✅ Data-driven sell decisions: Know the exact ₹ impact of waiting',
        tier: 'Both',
        icon: '🧮',
      },
      {
        id: 'middleman-check',
        name: 'Middleman Check',
        description: 'Verify if trader offers are fair. Get counter-offer scripts in Hindi to negotiate better prices.',
        benefit: '✅ Stop information asymmetry: Save ₹2–4/kg per batch',
        tier: 'Both',
        icon: '🤝',
      },
      {
        id: 'negotiation-script',
        name: 'Negotiation Script Generator',
        description: 'Auto-generate Hindi negotiation scripts based on current market data and your specific batch details.',
        benefit: '✅ Negotiate with confidence: Scripts backed by real market data',
        tier: 'Both',
        icon: '💬',
      },
    ],
  },
  {
    id: 'farm-operations',
    anchorId: '#farm-operations',
    title: 'Farm Operations',
    description: 'Complete batch lifecycle management from DOC to harvest with performance tracking',
    features: [
      {
        id: 'batch-management',
        name: 'Batch Lifecycle Management',
        description: 'Track each batch from DOC placement to harvest with status boards, performance history, and milestone tracking.',
        benefit: '✅ Centralized batch tracking: All data in one place, no spreadsheets',
        tier: 'Both',
        icon: '📋',
      },
      {
        id: 'fcr-analytics',
        name: 'FCR Analytics',
        description: 'Daily feed logging with automatic FCR calculation, trend analysis, and breed-standard benchmarking.',
        benefit: '✅ Reduce feed costs: Identify FCR deviations early, save ₹5–10/bird',
        tier: 'Both',
        icon: '🌾',
      },
      {
        id: 'mortality-tracking',
        name: 'Daily Mortality Tracking',
        description: 'Log daily deaths with cause categorization. AI detects abnormal patterns and alerts you within 60 seconds.',
        benefit: '✅ Early disease detection: Save ₹20K–₹80K per batch with quick intervention',
        tier: 'Both',
        icon: '📉',
      },
      {
        id: 'weight-gain',
        name: 'Weight Gain Tracking',
        description: 'Track weekly weight gain against breed standards with visual charts and deviation alerts.',
        benefit: '✅ Optimize growth: Identify underperforming batches early',
        tier: 'Both',
        icon: '⚖️',
      },
      {
        id: 'benchmarking',
        name: 'Performance Benchmarking',
        description: 'Compare your farm performance against regional averages and top performers in your district.',
        benefit: '✅ Know where you stand: Identify improvement opportunities',
        tier: 'Both',
        icon: '🎯',
      },
    ],
  },
  {
    id: 'health-biosecurity',
    anchorId: '#health-biosecurity',
    title: 'Health & Biosecurity',
    description: 'Vaccination scheduling, medication records, and compliance documentation',
    features: [
      {
        id: 'vaccination-scheduler',
        name: 'Vaccination Scheduler',
        description: 'Auto-schedule UP broiler vaccination protocol with WhatsApp reminders 24 hours before each dose.',
        benefit: '✅ Never miss a vaccine: Automated reminders prevent disease outbreaks',
        tier: 'Both',
        icon: '💉',
      },
      {
        id: 'medication-records',
        name: 'Medication Records',
        description: 'Complete medication log with withdrawal period tracking. Enforces legal holds before sell dates.',
        benefit: '✅ Compliance by design: Withdrawal periods automatically enforced',
        tier: 'Both',
        icon: '💊',
      },
      {
        id: 'health-checklist',
        name: 'Daily Health Checklist',
        description: 'Digital daily health checklist with symptom tracking, water consumption monitoring, and feed intake logging.',
        benefit: '✅ Proactive health management: Catch issues before they become outbreaks',
        tier: 'Both',
        icon: '🔍',
      },
      {
        id: 'biosecurity-audit',
        name: 'Biosecurity Audit',
        description: 'Fortnightly biosecurity checklist with scoring, trend tracking, and improvement recommendations.',
        benefit: '✅ Measurable biosecurity: Track and improve your scores over time',
        tier: 'Both',
        icon: '🔒',
      },
      {
        id: 'traceability',
        name: 'FSSAI Traceability',
        description: 'One-click batch traceability PDF generation for compliance audits with complete vaccination and medication history.',
        benefit: '✅ Audit-ready in 5 seconds: Generate compliance reports instantly',
        tier: 'PulseEnterprise',
        icon: '📋',
      },
    ],
  },
  {
    id: 'alerts-intelligence',
    anchorId: '#alerts-intelligence',
    title: 'Alerts Intelligence',
    description: 'Real-time alerts for disease, weather, price crashes, and operational anomalies',
    features: [
      {
        id: 'hpai-alerts',
        name: 'HPAI + Disease Alerts',
        description: 'Real-time HPAI outbreak alerts with zone mapping. Personalized based on your district and flock proximity.',
        benefit: '✅ Early outbreak warning: Get alerts 48 hours before government declarations',
        tier: 'Both',
        icon: '🦠',
      },
      {
        id: 'weather-alerts',
        name: 'Heat/Cold Wave Alerts',
        description: 'Extreme weather warnings with impact assessment on your flock and recommended mitigation actions.',
        benefit: '✅ Weather-proof your flock: Prepare for heat stress before it hits',
        tier: 'Both',
        icon: '🌡️',
      },
      {
        id: 'price-crash-alerts',
        name: 'Price Crash Alerts',
        description: 'Early warning for price crashes based on market analysis, demand signals, and supply chain disruptions.',
        benefit: '✅ Sell before crashes: Get 3–7 day advance warning of price drops',
        tier: 'Both',
        icon: '📉',
      },
      {
        id: 'feed-cost-alerts',
        name: 'Feed Cost Alerts',
        description: 'Monitor maize and soy commodity prices with alerts on significant changes affecting your feed costs.',
        benefit: '✅ Time your feed purchases: Buy before price spikes, save 5–10%',
        tier: 'PulseEnterprise',
        icon: '🌾',
      },
      {
        id: 'abnormal-mortality',
        name: 'Abnormal Mortality Detection',
        description: 'AI-powered anomaly detection on daily mortality logs. Alerts you when patterns indicate disease risk.',
        benefit: '✅ AI-powered disease detection: Identify risks humans miss',
        tier: 'Both',
        icon: '🚨',
      },
      {
        id: 'iot-alerts',
        name: 'IoT Device Alerts',
        description: 'Real-time alerts from connected IoT devices: weighing scales, water meters, environment sensors.',
        benefit: '✅ Automated monitoring: Get alerts without manual checks',
        tier: 'PulseEnterprise',
        icon: '📡',
      },
    ],
  },
  {
    id: 'integrations',
    anchorId: '#integrations',
    title: 'Integrations',
    description: 'Connect with ERP systems, IoT devices, and third-party services',
    features: [
      {
        id: 'whatsapp',
        name: 'WhatsApp Integration',
        description: 'Native WhatsApp integration for daily signals, reminders, and alerts. Works in Hindi and English.',
        benefit: '✅ No app needed: Get critical info on WhatsApp, works offline',
        tier: 'Both',
        icon: '💬',
      },
      {
        id: 'iot-devices',
        name: 'IoT Device Integration',
        description: 'Connect automatic weighing scales, water meters, temperature sensors, and ammonia detectors.',
        benefit: '✅ Automated data collection: Eliminate manual entry errors',
        tier: 'PulseEnterprise',
        icon: '🔌',
      },
      {
        id: 'erp-tally',
        name: 'ERP Integration (Tally, Zoho)',
        description: 'Two-way sync with Tally and Zoho for accounting, inventory, and purchase order management.',
        benefit: '✅ Zero double-entry: Data syncs automatically with your ERP',
        tier: 'PulseEnterprise',
        icon: '🔗',
      },
      {
        id: 'erp-sap',
        name: 'SAP/Oracle Integration',
        description: 'Enterprise-grade integration with SAP and Oracle systems for large-scale operations.',
        benefit: '✅ Enterprise-ready: Integrates with your existing tech stack',
        tier: 'PulseEnterprise',
        icon: '🏢',
      },
      {
        id: 'api-webhooks',
        name: 'API & Webhooks',
        description: 'RESTful API with webhooks for real-time data push to your custom systems and applications.',
        benefit: '✅ Build custom workflows: Integrate with any system via API',
        tier: 'PulseEnterprise',
        icon: '⚡',
      },
    ],
  },
];

// Calculate total feature count
export const TOTAL_FEATURE_COUNT = FEATURE_MODULES.reduce(
  (total, module) => total + module.features.length,
  0
);

// 3-way comparison table data (FlockIQ vs Manual/Spreadsheet vs Generic ERP)
export const COMPARISON_TABLE: ComparisonRow[] = [
  { feature: 'Price forecast (7-day)', manual: '❌', genericErp: '❌', FlockIQ: '✅ 95%+ accuracy' },
  { feature: 'AI sell signal', manual: '❌', genericErp: '❌', FlockIQ: '✅ Daily SELL/HOLD/CAUTION' },
  { feature: 'Batch ROI Optimizer', manual: '❌', genericErp: 'Partial', FlockIQ: '✅ Real-time ₹ calculation' },
  { feature: 'FCR tracking', manual: 'Manual', genericErp: '✅', FlockIQ: '✅ + AI recommendations' },
  { feature: 'Vaccination scheduler', manual: 'Manual', genericErp: '✅', FlockIQ: '✅ + WhatsApp reminders' },
  { feature: 'HPAI disease alerts', manual: '❌', genericErp: '❌', FlockIQ: '✅ Real-time, personalised' },
  { feature: 'Middleman negotiation', manual: '❌', genericErp: '❌', FlockIQ: '✅ Hindi script generator' },
  { feature: 'FSSAI traceability', manual: 'Manual', genericErp: 'Partial', FlockIQ: '✅ One-click PDF' },
  { feature: 'IoT integration', manual: '❌', genericErp: 'Some', FlockIQ: '✅ Weighing, water, environment' },
  { feature: 'ERP integration (Tally/Zoho)', manual: 'Manual export', genericErp: '✅', FlockIQ: '✅ Auto-sync' },
  { feature: 'Works offline (mobile)', manual: 'N/A', genericErp: 'Sometimes', FlockIQ: '✅ Always' },
  { feature: 'Hindi-first interface', manual: '❌', genericErp: '❌', FlockIQ: '✅ Native Devanagari' },
  { feature: 'District-specific forecasts', manual: '❌', genericErp: '❌', FlockIQ: '✅ Gorakhpur mandi data' },
];

// Helper function to get tier badge color
export function getTierBadgeColor(tier: string): string {
  switch (tier) {
    case 'PulsePro':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'PulseEnterprise':
      return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'Both':
      return 'bg-green-100 text-green-700 border-green-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
}
