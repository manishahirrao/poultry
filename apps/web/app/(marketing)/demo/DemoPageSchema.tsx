import { Metadata } from 'next';

export default function DemoPageSchema() {
  const metadata: Metadata = {
    title: 'Request Demo - FlockIQ | 95%+ Accurate Price Forecast',
    description: 'Schedule a personalized demo of FlockIQ. See how our 95%+ accurate broiler price forecast can help you earn ₹30,000 more per batch. Free demo for commercial farms, integrators, and enterprises.',
    openGraph: {
      title: 'Request Demo - FlockIQ',
      description: 'Schedule a personalized demo of FlockIQ. See how our 95%+ accurate broiler price forecast can help you earn ₹30,000 more per batch.',
      type: 'website',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ContactPage',
            name: 'Request Demo - FlockIQ',
            description: 'Schedule a personalized demo of FlockIQ price forecasting system',
            url: 'https://FlockIQ.ai/demo',
            mainEntity: {
              '@type': 'Organization',
              name: 'FlockIQ',
              url: 'https://FlockIQ.ai',
              contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'sales',
                areaServed: 'IN',
                availableLanguage: ['Hindi', 'English'],
              },
            },
          }),
        }}
      />
    </>
  );
}
