// FlockIQ — FAQ JSON-LD Schema
// File: apps/web/app/(marketing)/faq/FAQSchema.tsx
// Version: v3.0 | June 2026
// Task Reference: CONTENT-PAGE-006
// Requirements: FR-FAQ-001

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    // Accuracy Questions
    {
      '@type': 'Question',
      name: 'How accurate is FlockIQ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'FlockIQ achieves 95%+ directional accuracy — meaning it correctly predicts price direction (up/down) 95+ times out of 100. MAPE is 4.8% — average error under ₹8/kg when price is ₹160. This is based on 6-month holdout test data from Gorakhpur.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do you measure accuracy?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We measure directional accuracy — whether prices will go up or down. On 6-month holdout data from Gorakhpur, our accuracy is 95.2%. MAPE (Mean Absolute Percentage Error) is 4.8%.',
      },
    },
    {
      '@type': 'Question',
      name: 'What if accuracy falls below 95%?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'If accuracy ever falls below 95%, we will refund that month\'s payment in full. This is our guarantee.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I view the live accuracy dashboard?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes! Our live accuracy dashboard is public. You can visit /accuracy page to see real-time metrics. We hide nothing.',
      },
    },
    // Price Questions
    {
      '@type': 'Question',
      name: 'Is the 14-day trial really free?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. No credit card required. Full access to all features for 14 days. After 14 days, you can choose to upgrade or your account will be paused.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I switch plans mid-trial?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. You can upgrade or downgrade at any time. Pro-rated adjustments will be applied to your billing.',
      },
    },
    {
      '@type': 'Question',
      name: 'What happens after the trial ends?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'After 14 days, you\'ll be prompted to choose a plan. If you don\'t choose, your account will be paused. No automatic charges without your confirmation.',
      },
    },
    {
      '@type': 'Question',
      name: 'What\'s included in FlockIQ FARM?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'FlockIQ FARM (₹5,000/month) includes: Live today\'s mandi price, 7-day price forecast, Daily sell signal (WhatsApp), Batch ROI calculator, Middleman check, HPAI/disease alerts, Weather warnings, and Farm management (3 farms).',
      },
    },
    {
      '@type': 'Question',
      name: 'What\'s the difference between FlockIQ PRO and FlockIQ FARM?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'FlockIQ PRO (₹8,000/month) includes everything in FlockIQ FARM plus: 30-day AI forecast (P10/P50/P90), Multi-farm dashboard, Unlimited farms & batches, Optimal sell window analysis, Price driver analysis (SHAP), Employee management, and API access.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I get an annual plan?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Annual plans give you 2 months free. FlockIQ FARM annual: ₹50,000/year (₹5,000 × 10 months), FlockIQ PRO annual: ₹80,000/year (₹8,000 × 10 months).',
      },
    },
    {
      '@type': 'Question',
      name: 'Is there a setup fee?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. No setup fee, hidden charges, or long-term contracts. You can pay month-to-month. Cancel anytime.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does Enterprise pricing work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Enterprise pricing is custom based on your needs. Contact our sales team for a quote tailored to your organization size and requirements.',
      },
    },
    // Technical Questions
    {
      '@type': 'Question',
      name: 'Do I need to learn a new app?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Not at all. Our primary delivery is WhatsApp — which you already use. The app is optional and very simple.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I export my data?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'FlockIQ FARM has basic export. FlockIQ PRO includes CSV export (30-day history) and API access.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is there an offline mode?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. The app always shows the last cached forecast with timestamp. Even without internet, you can see what the last prediction was.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does it work on both iPhone and Android?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Both iOS and Android. Even if you have a basic Android phone (₹8,000–15,000 range), it works perfectly. The app loads in 2 seconds even on slow 3G.',
      },
    },
    // Privacy Questions
    {
      '@type': 'Question',
      name: 'Do you sell my data?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No, never. Your data is never sold to third parties. We are DPDP Act 2023 compliant. Full details in our privacy policy.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I delete my data?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. You can delete your account and data anytime. Through the app or by emailing support. Full deletion within 30 days.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is my data secure?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Your mobile number and farm profile are stored on Supabase (AWS ap-south-1, Mumbai region). DPDP Act 2023 compliant. Your data is never sold to third parties.',
      },
    },
    // Farm Management Questions (NEW)
    {
      '@type': 'Question',
      name: 'How does the WhatsApp Daily Log work for my farmers?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'FlockIQ sends a WhatsApp message to each farmer at your chosen time (default 6 PM). They reply with 3 numbers: birds dead, feed given (kg), and optionally the latest weight. The system auto-parses their reply, calculates FCR, and updates your dashboard within 60 seconds. No app install required for the farmer.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I track medication withdrawal periods to prevent FSSAI violations?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. When you log a treatment — say, Tylosin for 4 days starting Day 5 — FlockIQ calculates the withdrawal period end date and alerts you if you try to schedule a sale before it clears. This prevents food safety violations and keeps your batches FSSAI-compliant.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I track the full profit/loss of a batch including all costs?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'FlockIQ has a dedicated Batch P&L tab on each farm. You enter costs as they occur: DOC purchase price, daily feed (auto-linked from your feed logs), medicine costs (linked from treatment records), labour, and overhead. The system calculates your live cost-per-bird at any moment. At batch close, you get a complete P&L statement.',
      },
    },
    {
      '@type': 'Question',
      name: 'What happens when I sell birds? How do I record partial harvests?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Use the "Record Sale / Lift" button on your batch. Enter birds sold, live weight, price per kg, buyer, and transport details. FlockIQ supports partial harvests — you can record multiple lift events before closing the batch. Revenue from each lift is tracked separately and rolls up into the final batch P&L.',
      },
    },
    {
      '@type': 'Question',
      name: 'What environment metrics should I track beyond temperature?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'FlockIQ tracks humidity (%), ammonia (ppm), light hours per day, and ventilation level. Humidity above 70% triggers a respiratory disease risk alert. Ammonia above 25 ppm triggers a ventilation action alert. These are the two most common causes of respiratory disease in broilers — often missed when only tracking temperature.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does breed-matched benchmarking work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'FlockIQ compares your Cobb 430 farm\'s FCR against other Cobb 430 farms in the same region — not against all farms. You can filter by breed (Cobb 430, Ross 308, Hubbard Flex, Arbor Acres), region (UP, India, Global), and batch size range. The benchmark shows your percentile rank and is fully anonymised — no individual farm names are visible.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the per-farm disease risk score?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'When an HPAI outbreak is reported, FlockIQ calculates a risk score (1–10) for each of your farms based on: distance to the outbreak, your flock\'s age (day 15–35 is most vulnerable), vaccination status, biosecurity audit score, and wind direction. A score of 7+ triggers a pre-sell recommendation to consider harvesting before potential transport bans.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I attach documents to a batch (invoices, lab reports, vaccination certificates)?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Each batch has a Document Library tab where you can upload PDF, JPG, or PNG files (max 10MB each). Categorise them as DOC Invoice, Lab Report, Vaccination Certificate, Movement Permit, Buyer Invoice, or Other. Documents are included in FSSAI traceability exports. Integrators get 5GB storage; individual farm accounts get 1GB.',
      },
    },
  ],
};

export default function FAQSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
    />
  );
}
