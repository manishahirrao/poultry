import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * API endpoint to test integration connection
 * POST /api/integrations/test-connection
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { integrationId, integrationType } = body;

    if (!integrationId || !integrationType) {
      return NextResponse.json(
        { error: 'Missing integrationId or integrationType' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the session
    const { data: { user }, error: sessionError } = await supabase.auth.getUser();
    if (sessionError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch integration details
    const { data: integration, error: integrationError } = await supabase
      .from('customer_integrations')
      .select('*')
      .eq('id', integrationId)
      .eq('customer_id', user.id)
      .single();

    if (integrationError || !integration) {
      return NextResponse.json(
        { error: 'Integration not found' },
        { status: 404 }
      );
    }

    let testResult;

    // Test connection based on integration type
    switch (integrationType) {
      case 'zoho_books':
        testResult = await testZohoConnection(integration);
        break;
      case 'tally':
        testResult = await testTallyConnection(integration);
        break;
      case 'webhook':
        testResult = await testWebhookConnection(integration);
        break;
      default:
        return NextResponse.json(
          { error: 'Unsupported integration type' },
          { status: 400 }
        );
    }

    // Update integration with test results
    await supabase
      .from('customer_integrations')
      .update({
        last_test_connection_at: new Date().toISOString(),
        last_test_connection_status: testResult.success ? 'success' : 'failed',
        last_test_connection_error: testResult.error || null,
        status: testResult.success ? 'active' : 'error'
      })
      .eq('id', integrationId);

    return NextResponse.json(testResult);

  } catch (error) {
    console.error('Test connection error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function testZohoConnection(integration: any) {
  try {
    const accessToken = integration.oauth_access_token;
    const apiDomain = integration.config?.api_domain || 'https://books.zoho.com';

    if (!accessToken) {
      return { success: false, error: 'Missing access token' };
    }

    const response = await fetch(`${apiDomain}/books/v3/organizations`, {
      method: 'GET',
      headers: {
        'Authorization': `Zoho-oauthtoken ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Connection failed' };
    }

    const data = await response.json();
    return {
      success: true,
      organizations: data.organizations || []
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function testTallyConnection(integration: any) {
  try {
    // Tally connection test would typically check if Tally is accessible
    // For now, we'll just verify the configuration is present
    if (!integration.tally_company_name) {
      return { success: false, error: 'Missing Tally company name' };
    }

    // In a real implementation, this would ping the Tally server
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function testWebhookConnection(integration: any) {
  try {
    const webhookUrl = integration.webhook_url;

    if (!webhookUrl) {
      return { success: false, error: 'Missing webhook URL' };
    }

    // Send a test ping to the webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-FlockIQ-Test': 'true'
      },
      body: JSON.stringify({
        test: true,
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      return { success: false, error: `Webhook returned ${response.status}` };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
