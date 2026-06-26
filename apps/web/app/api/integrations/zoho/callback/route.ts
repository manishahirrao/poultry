import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { exchangeCodeForTokens, getZohoOAuthConfig, getAndRemoveOAuthState } from '@/lib/zohoIntegration';

/**
 * Zoho OAuth 2.0 Callback Handler
 * GET /api/integrations/zoho/callback
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Handle OAuth errors
    if (error) {
      return NextResponse.redirect(
        new URL('/dashboard/settings?tab=integrations&error=zoho_oauth_error', request.url)
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/dashboard/settings?tab=integrations&error=missing_oauth_params', request.url)
      );
    }

    // Validate state parameter
    const storedState = getAndRemoveOAuthState();
    if (!storedState || state !== storedState) {
      return NextResponse.redirect(
        new URL('/dashboard/settings?tab=integrations&error=invalid_state', request.url)
      );
    }

    // Exchange code for tokens
    const config = getZohoOAuthConfig();
    const tokens = await exchangeCodeForTokens(code, config);

    // Get user session
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: { user }, error: sessionError } = await supabase.auth.getUser();
    if (sessionError || !user) {
      return NextResponse.redirect(
        new URL('/login?error=unauthorized', request.url)
      );
    }

    // Fetch organizations from Zoho
    const organizationsResponse = await fetch(
      `${tokens.api_domain}/books/v3/organizations`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Zoho-oauthtoken ${tokens.access_token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const organizationsData = await organizationsResponse.json();
    const organizations = organizationsData.organizations || [];

    // Store integration in database
    const { error: insertError } = await supabase
      .from('customer_integrations')
      .upsert({
        customer_id: user.id,
        integration_type: 'zoho_books',
        status: 'active',
        oauth_access_token: tokens.access_token,
        oauth_refresh_token: tokens.refresh_token,
        oauth_token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
        oauth_scope: config.scope,
        config: {
          api_domain: tokens.api_domain
        },
        zoho_organization_id: organizations[0]?.organization_id,
        zoho_organization_name: organizations[0]?.name,
        last_test_connection_at: new Date().toISOString(),
        last_test_connection_status: 'success',
        is_active: true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'customer_id,integration_type'
      });

    if (insertError) {
      console.error('Failed to store Zoho integration:', insertError);
      return NextResponse.redirect(
        new URL('/dashboard/settings?tab=integrations&error=storage_failed', request.url)
      );
    }

    // Redirect to settings page with success
    return NextResponse.redirect(
      new URL('/dashboard/settings?tab=integrations&success=zoho_connected', request.url)
    );

  } catch (error) {
    console.error('Zoho OAuth callback error:', error);
    return NextResponse.redirect(
      new URL('/dashboard/settings?tab=integrations&error=oauth_failed', request.url)
    );
  }
}
