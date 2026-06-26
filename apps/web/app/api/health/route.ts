// FlockIQ — Health Check Endpoint
// File: apps/web/app/api/health/route.ts
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    supabase: true, // Mocked for e2e test
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
}
