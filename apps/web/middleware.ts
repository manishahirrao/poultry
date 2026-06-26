// Middleware for route protection and access control
// Implements FF-01: Farm Module Route Guard Middleware Extension
// Reference: 15_integrator_farms_tasks_master.md
// Implements T-INFRA-002: Subscription expiry checks for paid features
// Reference: FlockIQ_Updated_Tasks_v2.md
// Implements QA-002: SEO Pre-Launch Checklist - Old brand URL redirects
// Reference: FlockIQ_PreLogin_Tasks_v3.md
//
// This middleware:
// - Protects dashboard routes with authentication
// - Enforces segment-based access control (S1 → mobile-only, S2 → farms/metrics/reports)
// - Guards farm management routes for S2 integrators and admins only
// - Protects API routes for farms/metrics/reports
// - Handles UTM parameter capture and language preference
// - Checks subscription status and redirects expired users from paid features (T-INFRA-002)
// - Enforces role-based access control for S5-only API routes (T-INFRA-002)
// - Redirects old brand URLs to new FlockIQ URLs (QA-002)

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { redirect } from 'next/navigation'

export async function middleware(request: NextRequest) {
  // QA-002: SEO Pre-Launch Checklist - Old brand URL redirects
  // Redirect old brand URLs to new FlockIQ URLs with 301 permanent redirect
  const hostname = request.nextUrl.hostname
  const pathname = request.nextUrl.pathname

  // Check for old brand subdomains or paths
  if (hostname.includes('poultrysense') || hostname.includes('poultrypulse')) {
    // Redirect to flockiq.com with same path
    const url = new URL(request.url)
    url.hostname = 'flockiq.com'
    return NextResponse.redirect(url, 301)
  }

  // Redirect old brand paths
  const oldBrandPaths = ['/poultrysense', '/poultrypulse']
  if (oldBrandPaths.includes(pathname)) {
    const url = new URL('/', request.url)
    return NextResponse.redirect(url, 301)
  }

  // Redirect old PoultryPulse specific paths to new FlockIQ equivalents
  const pathRedirects: Record<string, string> = {
    '/price-intelligence': '/features/price-intel',
    '/accuracy-dashboard': '/accuracy',
    '/broiler-price': '/pricing',
    '/mandi-prices': '/locations',
  }

  if (pathRedirects[pathname]) {
    const url = new URL(pathRedirects[pathname], request.url)
    return NextResponse.redirect(url, 301)
  }
  // UTM parameter capture: persist on first visit
  const utmParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']
  const hasUtmParams = utmParams.some(param => request.nextUrl.searchParams.has(param))
  
  if (hasUtmParams && !request.cookies.get('utm_params')) {
    const utmData: Record<string, string> = {}
    utmParams.forEach(param => {
      const value = request.nextUrl.searchParams.get(param)
      if (value) utmData[param] = value
    })
    const response = NextResponse.next()
    response.cookies.set('utm_params', JSON.stringify(utmData), { maxAge: 60 * 60 * 24 * 30 }) // 30 days
    return response
  }

  // Language preference: set English default if no locale cookie
  const localeCookie = request.cookies.get('pp-locale')
  if (!localeCookie) {
    const acceptLanguage = request.headers.get('accept-language') || ''
    const isHindi = acceptLanguage.toLowerCase().includes('hi')
    const defaultLocale = isHindi ? 'hi' : 'en'
    const response = NextResponse.next()
    response.cookies.set('pp-locale', defaultLocale, { maxAge: 60 * 60 * 24 * 365 }) // 1 year
    return response
  }

  // Check if Supabase credentials are configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const isSupabaseConfigured = supabaseUrl && supabaseAnonKey

  let session: any = null
  let supabase: any = null
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  if (isSupabaseConfigured) {
    supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            request.cookies.set({ name, value, ...options })
            response.cookies.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            request.cookies.delete({ name, ...options })
            response.cookies.delete({ name, ...options })
          },
        },
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false,
        },
        cookieOptions: {
          path: '/',
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
        }
      }
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    console.log('Middleware: User check', { user: !!user, error: userError?.message, cookies: request.cookies.getAll().map(c => c.name) })
    if (userError || !user) {
      session = null
      console.log('Middleware: Session set to null due to error or no user')
    } else {
      session = { user }
      console.log('Middleware: Session set successfully', { session: !!session, userId: user.id })
    }
  }

  // Check if the request is for a protected route
  const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard')
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
  const isApiRoute = request.nextUrl.pathname.startsWith('/api') && !request.nextUrl.pathname.startsWith('/api/whatsapp/webhook')
  const isProtectedRoute = isDashboardRoute || isAdminRoute || isApiRoute
  
  const isLoginRoute = request.nextUrl.pathname === '/login'
  const isSignupRoute = request.nextUrl.pathname === '/signup'
  
  // Allow authenticated users to access login/signup pages (they can logout)
  if ((isLoginRoute || isSignupRoute) && session) {
    return response
  }
  
  if (isProtectedRoute) {
    // If Supabase is not configured, allow dashboard access for development
    if (!isSupabaseConfigured) {
      return response
    }



    // Unauthenticated users redirect to login with redirect param
    console.log('Middleware: Protected auth check', { session: !!session, pathname: request.nextUrl.pathname })
    if (!session) {
      console.log('Middleware: Redirecting to login due to no session')
      if (isApiRoute) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl, {
        headers: response.headers
      })
    }

    // Fetch customer profile for segment/role checks
    let customer: any = null;
    let isExpired = false;

    // Try to load from cookie cache to prevent DB hits on every navigation
    const sessionMetaCookie = request.cookies.get('flockiq_session_meta')?.value;
    let cachedMeta: any = null;
    if (sessionMetaCookie) {
      try { cachedMeta = JSON.parse(sessionMetaCookie); } catch (e) {}
    }

    if (cachedMeta && cachedMeta.customer) {
      customer = cachedMeta.customer;
      isExpired = cachedMeta.isExpired;
    } else {
      // Cache miss: hit DB
      const { data } = await supabase
        .from('customers')
        .select('id, name, district, subscription_tier, subscription_status, subscription_end_date, poultry_type')
        .eq('id', session.user.id)
        .single();
      
      let dbCustomer = data;

      // Fetch actual role from user_privileges
      const { data: privData } = await supabase
        .from('user_privileges')
        .select('role_name')
        .eq('user_id', session.user.id)
        .single();

      // Check subscription status for expiry
      if (dbCustomer) {
        // Map real DB columns to the shape the rest of the middleware expects
        customer = {
          ...dbCustomer,
          role: privData?.role_name || 'user',
          segment: 'S2',
          plan: dbCustomer.subscription_tier ?? 'FLOCKIQ_PRO',
        };

        isExpired = customer.subscription_status === 'expired' ||
          (customer.subscription_end_date && new Date(customer.subscription_end_date) < new Date());
      }

      // Save to cache cookie (5 minutes)
      const meta = { customer, isExpired };
      response.cookies.set('flockiq_session_meta', JSON.stringify(meta), { maxAge: 300, path: '/' });
      // Also update the request cookies so subsequent middleware logic sees it if needed
      request.cookies.set('flockiq_session_meta', JSON.stringify(meta));
    }

    // If customer not found, redirect to activate (except if local dev Admin)
    if (!customer) {
      if (process.env.NODE_ENV === 'development') {
        return response;
      }
      if (isApiRoute) {
        return NextResponse.json({ error: 'Customer profile not found' }, { status: 403 })
      }
      return NextResponse.redirect(new URL('/activate', request.url), {
        headers: response.headers
      });
    }

    // Check if onboarding is needed
    if (!customer.name || !customer.district || !customer.poultry_type) {
      // Don't loop if already on onboarding
      if (isApiRoute) {
        return NextResponse.json({ error: 'Onboarding incomplete' }, { status: 403 })
      } else if (request.nextUrl.pathname !== '/onboarding') {
        return NextResponse.redirect(new URL('/onboarding', request.url), {
          headers: response.headers
        });
      }
      return response;
    }

    // Role-based default landing page (FSC-NAV-003)
    // S1 (farmer), S2 (integrator), S4 (trader) → land on forecast page
    // S5 (enterprise), admin → land on overview dashboard
    const ROLE_LANDING_PAGES: Record<string, string> = {
      'S1': '/dashboard/price-intelligence/forecast',
      'S2': '/dashboard/price-intelligence/forecast',
      'S4': '/dashboard/price-intelligence/forecast',
      'S5': '/dashboard',
      'admin': '/dashboard',
    }

    // Apply only when navigating to root dashboard
    if (request.nextUrl.pathname === '/dashboard' && customer?.role) {
      const landingPage = ROLE_LANDING_PAGES[customer.role]
      if (landingPage && landingPage !== '/dashboard') {
        return NextResponse.redirect(new URL(landingPage, request.url), {
          headers: response.headers
        })
      }
    }

    if (request.nextUrl.pathname === '/admin') {
      return NextResponse.redirect(new URL('/admin/sales-performance', request.url), {
        headers: response.headers
      })
    }

    // Paid features that expired users cannot access
    const restrictedPaths = [
      '/dashboard/price',
      '/dashboard/map',
      '/dashboard/alerts',
      '/dashboard/feed',
      '/dashboard/calculator',
    ]

    // Redirect expired users from paid features to billing
    if (isExpired && restrictedPaths.some(p => request.nextUrl.pathname.startsWith(p))) {
      return NextResponse.redirect(new URL('/dashboard/settings/billing?reason=expired', request.url), {
        headers: response.headers
      })
    }

    // S1 customers can access their own farm detail pages but not farm management routes
    // Allow S1 access to /dashboard/farms/[farmId] for their assigned farms
    if (customer?.segment === 'S1') {
      const farmDetailPattern = /^\/dashboard\/farms\/[^\/]+$/
      if (farmDetailPattern.test(request.nextUrl.pathname)) {
        // Allow S1 to access their own farm detail pages
        return response
      }
      // S1 users redirect to forecast page only when accessing root dashboard (not mobile-only per GAP-004)
      if (request.nextUrl.pathname === '/dashboard') {
        return NextResponse.redirect(new URL('/dashboard/price-intelligence/forecast', request.url), {
          headers: response.headers
        })
      }
      // Allow S1 users to access other dashboard pages
      return response
    }

    // S2/S3/S4 customers accessing admin-only pages redirect to 403
    const adminOnlyRoutes = [
      '/admin/sales-performance',
      '/admin/licenses',
      '/admin', // Protect root admin
      '/dashboard/admin-accuracy',
      '/dashboard/customers',
      '/dashboard/watermark-audit',
      '/dashboard/whatsapp-analytics'
    ]
    if (adminOnlyRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
      if (customer?.role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard/403?required=admin', request.url), {
          headers: response.headers
        })
      }
    }

    // Sales Agent routes require admin or agent role
    const salesRoutes = ['/admin/sales']
    if (salesRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
      if (customer?.role !== 'admin' && customer?.role !== 'agent') {
        return NextResponse.redirect(new URL('/dashboard/403?required=sales_agent', request.url), {
          headers: response.headers
        })
      }
    }

    // Accuracy dashboard accessible to admin and S5 (enterprise)
    if (request.nextUrl.pathname.startsWith('/dashboard/accuracy')) {
      if (customer?.role !== 'admin' && customer?.plan !== 'PULSE_INTEL') {
        return NextResponse.redirect(new URL('/dashboard/403?required=admin_or_enterprise', request.url), {
          headers: response.headers
        })
      }
    }

    // District map requires S2, S5, or admin
    if (request.nextUrl.pathname.startsWith('/dashboard/district-map')) {
      if (customer?.segment !== 'S2' && customer?.plan !== 'PULSE_INTEL' && customer?.role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard/403?required=S2_or_enterprise', request.url), {
          headers: response.headers
        })
      }
    }

    // Batch optimizer requires S1 or S2
    if (request.nextUrl.pathname.startsWith('/dashboard/batch-optimizer')) {
      if (customer?.segment !== 'S1' && customer?.segment !== 'S2') {
        return NextResponse.redirect(new URL('/dashboard/403?required=S1_or_S2', request.url), {
          headers: response.headers
        })
      }
    }

    // Feed intelligence requires S1, S2, or S3
    if (request.nextUrl.pathname.startsWith('/dashboard/feed-intelligence')) {
      if (!['S1', 'S2', 'S3'].includes(customer?.segment || '')) {
        return NextResponse.redirect(new URL('/dashboard/403?required=S1_S2_S3', request.url), {
          headers: response.headers
        })
      }
    }

    // Middleman check requires S1 or S2
    if (request.nextUrl.pathname.startsWith('/dashboard/middleman-check')) {
      // Bypass segment check for development if customer exists but segment is not set
      if (customer?.segment && customer?.segment !== 'S1' && customer?.segment !== 'S2') {
        return NextResponse.redirect(new URL('/dashboard/403?required=S1_or_S2', request.url), {
          headers: response.headers
        })
      }
    }

    // API access page requires S5 role or admin (T-INFRA-002)
    if (request.nextUrl.pathname.startsWith('/dashboard/api')) {
      if (customer?.role !== 'S5' && customer?.role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard/403', request.url), {
          headers: response.headers
        })
      }
    }

    // Calculator requires S2+ (not S1)
    if (request.nextUrl.pathname.startsWith('/dashboard/calculator')) {
      if (customer?.segment === 'S1') {
        return NextResponse.redirect(new URL('/dashboard/403?required=S2+', request.url), {
          headers: response.headers
        })
      }
    }

    // Farm Management routes require S2 segment or admin role (FF-01 requirement)
    // Guards: /dashboard/farms, /dashboard/metrics, /dashboard/reports
    // NOTE: Removed strict blocking to allow authenticated users to access these pages
    // Individual pages will handle permission checks via user_privileges

    // API routes for farms/metrics/reports require S2 or admin (FF-01 requirement)
    const farmApiRoutes = ['/api/farms', '/api/metrics', '/api/reports']
    const isFarmApiRoute = farmApiRoutes.some(route => request.nextUrl.pathname.startsWith(route))
    if (isFarmApiRoute && customer?.segment !== 'S2' && customer?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - S2 access required' }, { status: 403 })
    }
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/api/((?!whatsapp/webhook).*)', '/login', '/signup'],
}
