import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    if (supabase) {
      await supabase.auth.signOut();
    }

    // Redirect to login page after logout
    return NextResponse.redirect(new URL('/login', request.url));
  } catch (error) {
    console.error('Logout error:', error);
    // Even if there's an error, try to redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }
}
