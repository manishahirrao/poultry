import { Metadata } from 'next';
import { Suspense } from 'react';
import MiddlemanCheckContent from './MiddlemanCheckContent';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Middleman Check — FlockIQ',
  description: 'Price fairness checker and negotiation tools',
};

async function getBenchmarkPrice(district: string = 'gorakhpur') {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/v1/middleman/check?district=${district}`, {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching benchmark price:', error);
    return null;
  }
}

export default async function MiddlemanCheckPage() {
  const benchmarkData = await getBenchmarkPrice();

  return (
    <div className="p-6">
      <Suspense fallback={<div className="text-center py-12">Loading...</div>}>
        <MiddlemanCheckContent benchmarkData={benchmarkData} />
      </Suspense>
    </div>
  );
}
