import type { Metadata } from 'next';
import PriceTrendsVisualizer from './PriceTrendsVisualizer';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Broiler Price Trends — Gorakhpur, Deoria, Kushinagar | Historical Price Data',
    description: 'View 30-90 day historical broiler price trends for Gorakhpur belt. Track price volatility, average rates, and market patterns. Free tool for commercial poultry farmers.',
    keywords: ['broiler price trends', 'poultry price history', 'Gorakhpur broiler rates', 'मुर्गी भाव इतिहास', 'poultry price volatility'],
    alternates: {
      canonical: 'https://FlockIQ.ai/tools/price-trends',
    },
    openGraph: {
      title: 'Broiler Price Trends — Historical Price Data',
      description: 'Track 30-90 day historical broiler price trends for Gorakhpur belt. Free tool for commercial poultry farmers.',
      url: 'https://FlockIQ.ai/tools/price-trends',
      siteName: 'FlockIQ',
      images: [{
        url: 'https://FlockIQ.ai/og/price-trends.jpg',
        width: 1200, height: 630,
        alt: 'Broiler Price Trends Tool',
      }],
      locale: 'hi_IN',
      type: 'website',
    },
  };
}

export default function PriceTrendsPage() {
  return <PriceTrendsVisualizer />;
}
