// FlockIQ — Auth Session API
// File: apps/web/app/api/auth/session/route.ts
// Version: v1.0 | May 2026
// Task Reference: Basic auth session endpoint
// Note: This is a basic implementation. Replace with proper auth system (e.g., NextAuth, Clerk, Supabase Auth) when ready.

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session');
    
    if (!session) {
      return NextResponse.json(
        { userId: null },
        { status: 200 }
      );
    }
    
    // Parse session cookie (basic implementation)
    try {
      const sessionData = JSON.parse(session.value);
      return NextResponse.json(
        { userId: sessionData.userId || null },
        { status: 200 }
      );
    } catch {
      return NextResponse.json(
        { userId: null },
        { status: 200 }
      );
    }
    
  } catch (error) {
    console.error('Auth session error:', error);
    return NextResponse.json(
      { userId: null },
      { status: 200 }
    );
  }
}
