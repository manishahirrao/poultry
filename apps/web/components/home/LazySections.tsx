'use client';

import dynamic from 'next/dynamic';

// Lazy load below-fold sections for performance (code splitting only)
const PainSection = dynamic(() => import('./PainSection'), {
  loading: () => <div className="h-[400px] animate-pulse bg-brand-50" />,
});
const HowItWorksSection = dynamic(() => import('./HowItWorksSection'), {
  loading: () => <div className="h-[500px] animate-pulse bg-white" />,
});
const AccuracySection = dynamic(() => import('./AccuracySection'), {
  loading: () => <div className="h-[600px] animate-pulse bg-brand-50" />,
});
const StatisticsSummaryBox = dynamic(() => import('./StatisticsSummaryBox'), {
  loading: () => <div className="h-[400px] animate-pulse bg-white" />,
});
const ExpertQuotesSection = dynamic(() => import('./ExpertQuotesSection'), {
  loading: () => <div className="h-[500px] animate-pulse bg-white" />,
});
const TestimonialsSection = dynamic(() => import('./TestimonialsSection'), {
  loading: () => <div className="h-[500px] animate-pulse bg-white" />,
});
const PricingTeaserSection = dynamic(() => import('./PricingTeaserSection'), {
  loading: () => <div className="h-[700px] animate-pulse bg-brand-50" />,
});
const FeatureTabsSection = dynamic(() => import('./FeatureTabsSection'), {
  loading: () => <div className="h-[600px] animate-pulse bg-white" />,
});
const TrustSection = dynamic(() => import('./TrustSection'), {
  loading: () => <div className="h-[400px] animate-pulse bg-brand-50" />,
});
const FAQSection = dynamic(() => import('./FAQSection'), {
  loading: () => <div className="h-[600px] animate-pulse bg-white" />,
});
const FinalCTASection = dynamic(() => import('./FinalCTASection'), {
  loading: () => <div className="h-[400px] animate-pulse bg-hero-gradient" />,
});

export default function LazySections() {
  return (
    <>
      <PainSection />
      <HowItWorksSection />
      <AccuracySection />
      <StatisticsSummaryBox />
      <ExpertQuotesSection />
      <div data-scroll-trigger>
        <TestimonialsSection />
      </div>
      <FAQSection />
      <PricingTeaserSection />
      <TrustSection />
      <FinalCTASection />
    </>
  );
}

