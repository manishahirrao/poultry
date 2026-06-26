// FlockIQ — Public Accuracy Summary API Endpoint
// File: apps/web/app/api/public/accuracy-summary/route.ts
// Version: v1.0 | May 2026
// Task Reference: TASK-WEB-004
// Requirements: GWEB-004, Public API with caching and rate limiting

import { NextResponse } from 'next/server';

// Rate limiting configuration
const RATE_LIMIT = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60, // 60 requests per minute
};

// In-memory rate limit store (for production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Accuracy data (in production, this would come from your database)
const accuracyData = {
  directionalAccuracy: 96.2,
  mape30d: 4.8,
  conformalCoverage: 80.1,
  predictionsVerified: 847,
  lastUpdated: new Date().toISOString(),
  last30Days: generateLast30DaysData(),
  stressTests: [
    {
      name: 'Nov–Mar 2024 UP Price Crash',
      period: 'November 2024 – March 2024',
      directionalAccuracyDuring: 89,
      description: 'UP broiler prices fell 22% over 6 weeks. Our model predicted the downtrend 4 days before crash onset.',
    },
    {
      name: 'HPAI Gorakhpur Zone 2024',
      period: 'March 2024',
      directionalAccuracyDuring: 92,
      description: 'Government declared HPAI zone in adjacent district. Model correctly reduced forecast prices and widened confidence bands 48 hours before declaration.',
    },
    {
      name: 'Diwali 2023 Demand Spike',
      period: 'November 2023',
      directionalAccuracyDuring: 96,
      description: 'Broiler prices rose ₹10/kg in the week before Diwali. Model predicted ₹8–12/kg rise. Actual: ₹10/kg. MAPE during spike: 2.1%.',
    },
  ],
};

// Generate mock last 30 days data
function generateLast30DaysData() {
  const data = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const mape = 3 + Math.random() * 4; // Random MAPE between 3-7%
    const directionCorrect = Math.random() > 0.1; // 90% correct direction
    data.push({
      date: date.toISOString().split('T')[0],
      mape: parseFloat(mape.toFixed(2)),
      directionCorrect,
      district: ['Gorakhpur', 'Deoria', 'Kushinagar', 'Basti', 'Maharajganj'][Math.floor(Math.random() * 5)],
      predictedP50: 160 + Math.random() * 10,
      actualPrice: 160 + Math.random() * 10,
    });
  }
  return data;
}

// Rate limiting middleware
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT.windowMs });
    return true;
  }

  if (now > record.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT.windowMs });
    return true;
  }

  if (record.count >= RATE_LIMIT.maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

// Clean up expired rate limit entries
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(ip);
    }
  }
}, 60000); // Clean up every minute

export async function GET(request: Request) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown';

    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { 
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Limit': RATE_LIMIT.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
          }
        }
      );
    }

    // Get remaining requests count for headers
    const record = rateLimitStore.get(ip);
    const remaining = record ? RATE_LIMIT.maxRequests - record.count : RATE_LIMIT.maxRequests;

    // Return accuracy data with caching headers
    const response = NextResponse.json(accuracyData, {
      status: 200,
      headers: {
        // Cache for 5 minutes
        'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=600',
        // CORS headers for public access
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
        // Rate limit headers
        'X-RateLimit-Limit': RATE_LIMIT.maxRequests.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        // API version
        'X-API-Version': 'v1',
      }
    });

    return response;
  } catch (error) {
    console.error('Error in accuracy-summary API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
      }
    }
  );
}
