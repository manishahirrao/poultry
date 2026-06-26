/**
 * Zoho Books Integration
 * 
 * OAuth 2.0 flow and API integration for Zoho Books
 * Requirements: REQ-019 §19.2, TASK-053
 */

export interface ZohoOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope: string;
  accountsUrl: string;
}

export interface ZohoOAuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  api_domain: string;
}

export interface ZohoOrganization {
  organization_id: string;
  name: string;
  contact_name: string;
  email: string;
  phone: string;
  currency_code: string;
}

export interface ZohoInvoice {
  invoice_id: string;
  invoice_number: string;
  customer_id: string;
  customer_name: string;
  date: string;
  due_date: string;
  total: number;
  status: string;
}

export interface ZohoBill {
  bill_id: string;
  bill_number: string;
  vendor_id: string;
  vendor_name: string;
  date: string;
  due_date: string;
  total: number;
  status: string;
  purchaseorder_id?: string;
}

export interface ZohoSyncResult {
  success: boolean;
  invoiceId?: string;
  billIds?: string[];
  error?: string;
}

/**
 * Generate Zoho OAuth authorization URL
 */
export function generateZohoAuthUrl(config: ZohoOAuthConfig): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: config.scope,
    state: generateState()
  });

  return `${config.accountsUrl}/oauth/v2/auth?${params.toString()}`;
}

/**
 * Generate a random state parameter for OAuth security
 */
function generateState(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Exchange authorization code for access tokens
 */
export async function exchangeCodeForTokens(
  code: string,
  config: ZohoOAuthConfig
): Promise<ZohoOAuthTokens> {
  const response = await fetch(`${config.accountsUrl}/oauth/v2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
      grant_type: 'authorization_code'
    })
  });

  if (!response.ok) {
    throw new Error(`Zoho OAuth token exchange failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(
  refreshToken: string,
  config: ZohoOAuthConfig
): Promise<ZohoOAuthTokens> {
  const response = await fetch(`${config.accountsUrl}/oauth/v2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      grant_type: 'refresh_token'
    })
  });

  if (!response.ok) {
    throw new Error(`Zoho token refresh failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

/**
 * Get Zoho organizations for the authenticated user
 */
export async function getZohoOrganizations(
  accessToken: string,
  apiDomain: string
): Promise<ZohoOrganization[]> {
  const response = await fetch(`${apiDomain}/books/v3/organizations`, {
    method: 'GET',
    headers: {
      'Authorization': `Zoho-oauthtoken ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Zoho organizations: ${response.statusText}`);
  }

  const data = await response.json();
  return data.organizations || [];
}

/**
 * Create an invoice in Zoho Books for batch harvest
 */
export async function createZohoInvoice(
  accessToken: string,
  apiDomain: string,
  organizationId: string,
  batchData: any
): Promise<ZohoInvoice> {
  const invoiceData = {
    invoice: {
      customer_id: batchData.customer_id || 'default_customer',
      invoice_number: batchData.invoice_number || `INV-${batchData.batch_id}`,
      date: batchData.harvest_date || new Date().toISOString().split('T')[0],
      due_date: batchData.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      line_items: [
        {
          item_id: batchData.item_id || 'broiler_chicken',
          name: `Batch ${batchData.batch_name} - Broiler Chicken`,
          description: `${batchData.birds_sold} birds @ ${batchData.avg_weight} kg/bird`,
          quantity: batchData.birds_sold,
          rate: batchData.sale_price_per_kg * batchData.avg_weight,
          discount: 0
        }
      ],
      notes: `Batch ID: ${batchData.batch_id}\nBreed: ${batchData.breed}\nPlacement Date: ${batchData.doc_placement_date}`,
      custom_fields: [
        {
          label: 'Batch ID',
          value: batchData.batch_id
        },
        {
          label: 'FlockIQ Integration',
          value: 'true'
        }
      ]
    }
  };

  const response = await fetch(`${apiDomain}/books/v3/invoices?organization_id=${organizationId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Zoho-oauthtoken ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(invoiceData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to create Zoho invoice: ${error.message || response.statusText}`);
  }

  const data = await response.json();
  return data.invoice;
}

/**
 * Create a bill in Zoho Books for feed/medicine costs
 */
export async function createZohoBill(
  accessToken: string,
  apiDomain: string,
  organizationId: string,
  costData: any
): Promise<ZohoBill> {
  const billData = {
    bill: {
      vendor_id: costData.vendor_id || 'default_vendor',
      bill_number: costData.bill_number || `BILL-${costData.batch_id}-${costData.category}`,
      date: costData.date || new Date().toISOString().split('T')[0],
      due_date: costData.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      line_items: [
        {
          item_id: costData.item_id || getZohoItemIdForCategory(costData.category),
          name: costData.name,
          description: `Batch ${costData.batch_name} - ${costData.category}`,
          quantity: costData.quantity || 1,
          rate: costData.amount,
          discount: 0
        }
      ],
      notes: `Batch ID: ${costData.batch_id}\nCategory: ${costData.category}`,
      custom_fields: [
        {
          label: 'Batch ID',
          value: costData.batch_id
        },
        {
          label: 'FlockIQ Integration',
          value: 'true'
        }
      ]
    }
  };

  const response = await fetch(`${apiDomain}/books/v3/purchaseorders?organization_id=${organizationId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Zoho-oauthtoken ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(billData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to create Zoho bill: ${error.message || response.statusText}`);
  }

  const data = await response.json();
  return data.purchaseorder || data.bill;
}

/**
 * Sync batch harvest data to Zoho Books
 * Creates invoice for sale and bills for costs
 */
export async function syncBatchToZoho(
  accessToken: string,
  apiDomain: string,
  organizationId: string,
  batchData: any
): Promise<ZohoSyncResult> {
  try {
    const results: ZohoSyncResult = {
      success: true,
      billIds: []
    };

    // Create invoice for sale (if harvested)
    if (batchData.status === 'harvested' && batchData.revenue > 0) {
      const invoice = await createZohoInvoice(accessToken, apiDomain, organizationId, batchData);
      results.invoiceId = invoice.invoice_id;
    }

    // Create bills for each cost category
    for (const cost of batchData.costs || []) {
      if (cost.amount > 0) {
        const bill = await createZohoBill(accessToken, apiDomain, organizationId, {
          ...cost,
          batch_id: batchData.batch_id,
          batch_name: batchData.batch_name,
          vendor_id: cost.vendor_id
        });
        results.billIds?.push(bill.bill_id || bill.purchaseorder_id || '');
      }
    }

    return results;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Get Zoho item ID for a cost category
 * This maps FlockIQ cost categories to Zoho item IDs
 */
function getZohoItemIdForCategory(category: string): string {
  const itemMap: Record<string, string> = {
    doc: 'day_old_chicks',
    feed: 'feed_stock',
    medicine: 'medicine',
    vaccine: 'vaccine',
    labor: 'labor_service',
    electricity: 'electricity',
    overhead: 'overhead'
  };

  return itemMap[category] || 'miscellaneous';
}

/**
 * Test Zoho connection by fetching organizations
 */
export async function testZohoConnection(
  accessToken: string,
  apiDomain: string
): Promise<{ success: boolean; error?: string; organizations?: ZohoOrganization[] }> {
  try {
    const organizations = await getZohoOrganizations(accessToken, apiDomain);
    return {
      success: true,
      organizations
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Connection test failed'
    };
  }
}

/**
 * Revoke Zoho access token
 */
export async function revokeZohoToken(
  accessToken: string,
  config: ZohoOAuthConfig
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${config.accountsUrl}/oauth/v2/revoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        token: accessToken
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to revoke token: ${response.statusText}`);
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Token revocation failed'
    };
  }
}

/**
 * Get Zoho OAuth configuration from environment variables
 */
export function getZohoOAuthConfig(): ZohoOAuthConfig {
  return {
    clientId: process.env.NEXT_PUBLIC_ZOHO_CLIENT_ID || '',
    clientSecret: process.env.ZOHO_CLIENT_SECRET || '',
    redirectUri: process.env.NEXT_PUBLIC_ZOHO_REDIRECT_URI || `${window.location.origin}/settings/integrations/zoho/callback`,
    scope: process.env.NEXT_PUBLIC_ZOHO_SCOPE || 'ZohoBooks.fullaccess.all',
    accountsUrl: process.env.NEXT_PUBLIC_ZOHO_ACCOUNTS_URL || 'https://accounts.zoho.com'
  };
}

/**
 * Validate Zoho OAuth state parameter
 */
export function validateState(state: string, storedState: string): boolean {
  return state === storedState;
}

/**
 * Store OAuth state in session storage
 */
export function storeOAuthState(state: string): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('zoho_oauth_state', state);
  }
}

/**
 * Retrieve and remove OAuth state from session storage
 */
export function getAndRemoveOAuthState(): string | null {
  if (typeof window !== 'undefined') {
    const state = sessionStorage.getItem('zoho_oauth_state');
    sessionStorage.removeItem('zoho_oauth_state');
    return state;
  }
  return null;
}
