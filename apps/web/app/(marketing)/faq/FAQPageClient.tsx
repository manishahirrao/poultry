// FlockIQ — FAQ Page Client Component
// File: apps/web/app/(marketing)/faq/FAQPageClient.tsx
// Version: v3.0 | June 2026
// Task Reference: CONTENT-PAGE-006
// Requirements: FR-FAQ-001

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, X } from 'lucide-react'
import { AlertTriangle as Warning } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FadeUp } from '@/components/motion/FadeUp';
import { Card } from '@/components/ui/Card';

// FAQ data from v3 specs
const faqData: {
  all: Array<{ id: string; question: string; answer: string }>;
  accuracy: Array<{ id: string; question: string; answer: string }>;
  price: Array<{ id: string; question: string; answer: string }>;
  technical: Array<{ id: string; question: string; answer: string }>;
  privacy: Array<{ id: string; question: string; answer: string }>;
  farmManagement: Array<{ id: string; question: string; answer: string }>;
} = {
  all: [], // Will be populated dynamically from all categories
  accuracy: [
    {
      id: 'accuracy-1',
      question: 'How accurate is FlockIQ?',
      answer: 'FlockIQ achieves 95%+ directional accuracy — meaning it correctly predicts price direction (up/down) 95+ times out of 100. MAPE is 4.8% — average error under ₹8/kg when price is ₹160. This is based on 6-month holdout test data from Gorakhpur.',
    },
    {
      id: 'accuracy-2',
      question: 'How do you measure accuracy?',
      answer: 'We measure directional accuracy — whether prices will go up or down. On 6-month holdout data from Gorakhpur, our accuracy is 95.2%. MAPE (Mean Absolute Percentage Error) is 4.8%.',
    },
    {
      id: 'accuracy-3',
      question: 'What if accuracy falls below 95%?',
      answer: 'If accuracy ever falls below 95%, we will refund that month\'s payment in full. This is our guarantee.',
    },
    {
      id: 'accuracy-4',
      question: 'Can I view the live accuracy dashboard?',
      answer: 'Yes! Our live accuracy dashboard is public. You can visit /accuracy page to see real-time metrics. We hide nothing.',
    },
  ],
  price: [
    {
      id: 'price-1',
      question: 'Is the 14-day trial really free?',
      answer: 'Yes. No credit card required. Full access to all features for 14 days. After 14 days, you can choose to upgrade or your account will be paused.',
    },
    {
      id: 'price-2',
      question: 'Can I switch plans mid-trial?',
      answer: 'Yes. You can upgrade or downgrade at any time. Pro-rated adjustments will be applied to your billing.',
    },
    {
      id: 'price-3',
      question: 'What happens after the trial ends?',
      answer: 'After 14 days, you\'ll be prompted to choose a plan. If you don\'t choose, your account will be paused. No automatic charges without your confirmation.',
    },
    {
      id: 'price-4',
      question: 'What\'s included in FlockIQ FARM?',
      answer: 'FlockIQ FARM (₹5,000/month) includes: Live today\'s mandi price, 7-day price forecast, Daily sell signal (WhatsApp), Batch ROI calculator, Middleman check, HPAI/disease alerts, Weather warnings, and Farm management (3 farms).',
    },
    {
      id: 'price-5',
      question: 'What\'s the difference between FlockIQ PRO and FlockIQ FARM?',
      answer: 'FlockIQ PRO (₹8,000/month) includes everything in FlockIQ FARM plus: 30-day AI forecast (P10/P50/P90), Multi-farm dashboard, Unlimited farms & batches, Optimal sell window analysis, Price driver analysis (SHAP), Employee management, and API access.',
    },
    {
      id: 'price-6',
      question: 'Can I get an annual plan?',
      answer: 'Yes. Annual plans give you 2 months free. FlockIQ FARM annual: ₹50,000/year (₹5,000 × 10 months), FlockIQ PRO annual: ₹80,000/year (₹8,000 × 10 months).',
    },
    {
      id: 'price-7',
      question: 'Is there a setup fee?',
      answer: 'No. No setup fee, hidden charges, or long-term contracts. You can pay month-to-month. Cancel anytime.',
    },
    {
      id: 'price-8',
      question: 'How does Enterprise pricing work?',
      answer: 'Enterprise pricing is custom based on your needs. Contact our sales team for a quote tailored to your organization size and requirements.',
    },
  ],
  technical: [
    {
      id: 'technical-1',
      question: 'Do I need to learn a new app?',
      answer: 'Not at all. Our primary delivery is WhatsApp — which you already use. The app is optional and very simple.',
    },
    {
      id: 'technical-2',
      question: 'Can I export my data?',
      answer: 'FlockIQ FARM has basic export. FlockIQ PRO includes CSV export (30-day history) and API access.',
    },
    {
      id: 'technical-3',
      question: 'Is there an offline mode?',
      answer: 'Yes. The app always shows the last cached forecast with timestamp. Even without internet, you can see what the last prediction was.',
    },
    {
      id: 'technical-4',
      question: 'Does it work on both iPhone and Android?',
      answer: 'Yes. Both iOS and Android. Even if you have a basic Android phone (₹8,000–15,000 range), it works perfectly. The app loads in 2 seconds even on slow 3G.',
    },
  ],
  privacy: [
    {
      id: 'privacy-1',
      question: 'Do you sell my data?',
      answer: 'No, never. Your data is never sold to third parties. We are DPDP Act 2023 compliant. Full details in our privacy policy.',
    },
    {
      id: 'privacy-2',
      question: 'Can I delete my data?',
      answer: 'Yes. You can delete your account and data anytime. Through the app or by emailing support. Full deletion within 30 days.',
    },
    {
      id: 'privacy-3',
      question: 'Is my data secure?',
      answer: 'Your mobile number and farm profile are stored on Supabase (AWS ap-south-1, Mumbai region). DPDP Act 2023 compliant. Your data is never sold to third parties.',
    },
    {
      id: 'privacy-4',
      question: 'Who can see my farm data?',
      answer: 'Only you can see your farm data. For integrators, only authorized team members can access data. We never share individual farm data with anyone else.',
    },
    {
      id: 'privacy-5',
      question: 'What data do you collect?',
      answer: 'We collect: mobile number, farm location (district), flock size, and daily WhatsApp logs (mortality, feed, weight). We do not collect financial data or bank details.',
    },
  ],
  farmManagement: [
    {
      id: 'farm-1',
      question: 'How does the WhatsApp Daily Log work for my farmers?',
      answer: 'FlockIQ sends a WhatsApp message to each farmer at your chosen time (default 6 PM). They reply with 3 numbers: birds dead, feed given (kg), and optionally the latest weight. The system auto-parses their reply, calculates FCR, and updates your dashboard within 60 seconds. No app install required for the farmer.',
    },
    {
      id: 'farm-2',
      question: 'Can I track medication withdrawal periods to prevent FSSAI violations?',
      answer: 'Yes. When you log a treatment — say, Tylosin for 4 days starting Day 5 — FlockIQ calculates the withdrawal period end date and alerts you if you try to schedule a sale before it clears. This prevents food safety violations and keeps your batches FSSAI-compliant.',
    },
    {
      id: 'farm-3',
      question: 'How do I track the full profit/loss of a batch including all costs?',
      answer: 'FlockIQ has a dedicated Batch P&L tab on each farm. You enter costs as they occur: DOC purchase price, daily feed (auto-linked from your feed logs), medicine costs (linked from treatment records), labour, and overhead. The system calculates your live cost-per-bird at any moment. At batch close, you get a complete P&L statement.',
    },
    {
      id: 'farm-4',
      question: 'What happens when I sell birds? How do I record partial harvests?',
      answer: 'Use the "Record Sale / Lift" button on your batch. Enter birds sold, live weight, price per kg, buyer, and transport details. FlockIQ supports partial harvests — you can record multiple lift events before closing the batch. Revenue from each lift is tracked separately and rolls up into the final batch P&L.',
    },
    {
      id: 'farm-5',
      question: 'What environment metrics should I track beyond temperature?',
      answer: 'FlockIQ tracks humidity (%), ammonia (ppm), light hours per day, and ventilation level. Humidity above 70% triggers a respiratory disease risk alert. Ammonia above 25 ppm triggers a ventilation action alert. These are the two most common causes of respiratory disease in broilers — often missed when only tracking temperature.',
    },
    {
      id: 'farm-6',
      question: 'How does breed-matched benchmarking work?',
      answer: 'FlockIQ compares your Cobb 430 farm\'s FCR against other Cobb 430 farms in the same region — not against all farms. You can filter by breed (Cobb 430, Ross 308, Hubbard Flex, Arbor Acres), region (UP, India, Global), and batch size range. The benchmark shows your percentile rank and is fully anonymised — no individual farm names are visible.',
    },
    {
      id: 'farm-7',
      question: 'What is the per-farm disease risk score?',
      answer: 'When an HPAI outbreak is reported, FlockIQ calculates a risk score (1–10) for each of your farms based on: distance to the outbreak, your flock\'s age (day 15–35 is most vulnerable), vaccination status, biosecurity audit score, and wind direction. A score of 7+ triggers a pre-sell recommendation to consider harvesting before potential transport bans.',
    },
    {
      id: 'farm-8',
      question: 'Can I attach documents to a batch (invoices, lab reports, vaccination certificates)?',
      answer: 'Yes. Each batch has a Document Library tab where you can upload PDF, JPG, or PNG files (max 10MB each). Categorise them as DOC Invoice, Lab Report, Vaccination Certificate, Movement Permit, Buyer Invoice, or Other. Documents are included in FSSAI traceability exports. Integrators get 5GB storage; individual farm accounts get 1GB.',
    },
  ],
};

export default function FAQPageClient() {
  const [activeCategory, setActiveCategory] = useState<keyof typeof faqData>('all');
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  // Populate "all" category dynamically
  useEffect(() => {
    faqData.all = [
      ...faqData.accuracy,
      ...faqData.price,
      ...faqData.technical,
      ...faqData.privacy,
      ...faqData.farmManagement,
    ];
  }, []);

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'accuracy', label: 'Accuracy' },
    { id: 'price', label: 'Price' },
    { id: 'technical', label: 'Technical' },
    { id: 'privacy', label: 'Privacy' },
    { id: 'farmManagement', label: 'Farm Management' },
  ];

  const toggleItem = (id: string) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };

  // Filter FAQs based on search query
  const filteredFAQs = searchQuery
    ? Object.values(faqData).flat().filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqData[activeCategory];

  // Analytics event for FAQ item open
  const handleToggle = (id: string) => {
    const isOpening = !openItems.has(id);
    toggleItem(id);
    
    if (isOpening && typeof window !== 'undefined' && (window as any).posthog) {
      (window as any).posthog.capture('faq_item_open', {
        question_id: id,
        page: 'faq',
      });
    }
  };

  return (
    <div className="min-h-screen bg-pageBg py-section-vertical">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <FadeUp className="mb-16 text-center">
          <h1 className="font-sora font-extrabold text-[clamp(2rem, 4vw, 3rem)] text-neutral900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-neutral700 max-w-2xl mx-auto mb-6">
            Everything you need to know about FlockIQ — accuracy, pricing, technical details, privacy, and farm management features.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm font-semibold text-brand-700">
            <span>95%+ Accuracy</span>
            <span>•</span>
            <span>7-Day Forecasts</span>
            <span>•</span>
            <span>WhatsApp Automation</span>
          </div>
        </FadeUp>

        {/* Search */}
        <FadeUp delay={0.1} className="mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral400" />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-neutral200 bg-white px-12 py-4 text-base text-neutral900 placeholder:text-neutral400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral400 hover:text-neutral600"
                aria-label="Clear search"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </FadeUp>

        {/* Category Tabs */}
        {!searchQuery && (
          <FadeUp delay={0.2} className="mb-12">
            <div className="flex flex-wrap gap-3 border-b border-neutral200 pb-4 overflow-x-auto">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setActiveCategory(category.id as keyof typeof faqData);
                    setOpenItems(new Set());
                  }}
                  className={`rounded-full px-6 py-2 text-sm font-semibold transition-colors whitespace-nowrap ${
                    activeCategory === category.id
                      ? 'bg-brand-700 text-white'
                      : 'bg-white text-neutral700 hover:bg-neutral50 border border-neutral200'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </FadeUp>
        )}

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredFAQs.map((faq, index) => (
            <FadeUp key={faq.id} delay={index * 0.05}>
              <Card className="p-6">
                <button
                  onClick={() => handleToggle(faq.id)}
                  className="flex w-full items-center justify-between text-left"
                  aria-expanded={openItems.has(faq.id)}
                  aria-controls={`answer-${faq.id}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleToggle(faq.id);
                    }
                  }}
                >
                  <span className="flex-1 pr-8 font-sora font-semibold text-lg text-neutral900">
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: openItems.has(faq.id) ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-shrink-0"
                  >
                    <ChevronDown className="h-6 w-6 text-neutral500" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openItems.has(faq.id) && (
                    <motion.div
                      id={`answer-${faq.id}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 pt-4 text-neutral700 leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </FadeUp>
          ))}
        </div>

        {/* CTA */}
        {!searchQuery && (
          <FadeUp delay={0.3} className="mt-16">
            <Card className="bg-brand-900 p-8 text-center text-white">
              <h2 className="font-sora font-bold text-2xl mb-4">
                Still have questions?
              </h2>
              <p className="mb-6 text-white/90 max-w-lg mx-auto">
                Our team is here to help. Reach out via WhatsApp or email and we'll get back to you within 2 business hours.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="accent"
                  size="lg"
                  pill
                  asChild
                >
                  <a href="https://wa.me/91XXXXXXXXXX" target="_blank" rel="noopener noreferrer">
                    Contact on WhatsApp
                  </a>
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  pill
                  className="text-white bg-white/15 hover:bg-white/20"
                  asChild
                >
                  <a href="/signup">Start Free Trial</a>
                </Button>
              </div>
            </Card>
          </FadeUp>
        )}
      </div>
    </div>
  );
}
