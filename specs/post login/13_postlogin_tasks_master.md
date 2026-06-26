# PoultryPulse AI — Post-Login Dashboard Task Master
# File: 13_postlogin_tasks_master.md
# Kiro Compatibility: ✅ Full Kiro Agent Implementation Ready
# Version: v1.0 | May 2026 | CONFIDENTIAL

---

## AGENT CONTEXT BLOCK
```
ROLE: Senior Full-Stack Engineer (Next.js 15 + TypeScript + Recharts + Supabase + Realtime)
FOUNDATION: 04_postlogin_design_master.md + 05_postlogin_requirements_tasks.md + PRD v3.0 + Architecture v1.0
STACK: Next.js 15 App Router, TypeScript strict, Tailwind CSS v3, Recharts, Framer Motion, Supabase SSR + Realtime
AUTH: Supabase Phone OTP + middleware-enforced RLS
ACCESS_MODEL: S1=mobile-only, S2/S3/S4=dashboard no admin pages, S5/S6=dashboard + API, Admin=full access
NON_NEGOTIABLE:
  - P10/P50/P90 bands ALWAYS visible on every forecast chart
  - NEVER blank screens — skeleton → data → empty state (never null render)
  - NEVER raw errors — always human-friendly Hindi messages
  - Accuracy gate: if directional < 95% → admin critical banner, customer data paused
  - SUPABASE_SERVICE_ROLE_KEY must NEVER appear in client components
OUTPUT FORMAT: Standard Kiro task block — file_path, purpose, dependencies, exports, code, qa_checks
```

---

## OUTPUT FORMAT (all code tasks)

```json
{
  "file_path": "apps/web/path/to/file.tsx",
  "purpose": "One-sentence description",
  "dependencies": ["package-name"],
  "exports": ["ComponentName"],
  "code": "// Full implementation here",
  "qa_checks": [
    "Check 1",
    "Check 2"
  ]
}
```

---

## TASK GROUP DA: DASHBOARD FOUNDATION

### DA-01 — Dashboard Root Layout

**File:** `apps/web/app/(dashboard)/layout.tsx`
**Priority:** 🔴 P0
**Dependencies:** `@supabase/ssr`, `next/navigation`
**Est:** 8h

```typescript
// PURPOSE: Root layout for all /dashboard/* routes.
// Enforces auth, role-based sidebar, persistent top header.
// Uses CSS Grid: [sidebar 240px] [main content flex-1]

import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  // Auth guard — server-side
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect('/login?redirect=/dashboard/overview');
  }

  // Fetch customer profile for role + segment
  const { data: customer } = await supabase
    .from('customers')
    .select('id, name, segment, role, plan, subscription_expires_at, district')
    .eq('phone', session.user.phone)
    .single();

  if (!customer) redirect('/login');

  // S1 → mobile-only redirect
  if (customer.segment === 'S1') {
    redirect('/dashboard/mobile-only');
  }

  return (
    <div className="flex h-screen bg-[#F7FAF8] overflow-hidden">
      {/* Skip links */}
      <a
        href="#main-dashboard-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4
                   focus:z-[100] focus:bg-brandGreen700 focus:text-white
                   focus:px-4 focus:py-2 focus:rounded-lg"
      >
        Main content पर जाएं
      </a>

      {/* Sidebar — server-rendered, client for interactivity */}
      <Sidebar customer={customer} />

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <DashboardHeader customer={customer} />
        <main
          id="main-dashboard-content"
          className="flex-1 overflow-y-auto p-6"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
```

**QA Checks:**
- [ ] S1 customer redirects to /dashboard/mobile-only (not 403)
- [ ] Unauthenticated user redirects to /login with correct ?redirect= param
- [ ] Skip link becomes visible on Tab keypress
- [ ] Layout renders correctly at 1024px, 1280px, 1440px
- [ ] Sidebar does NOT flash on SSR (no hydration mismatch)
- [ ] customer.name undefined: sidebar shows fallback "+91-XXXXX" (last 5 digits)

---

### DA-02 — Sidebar Navigation Component

**File:** `apps/web/components/dashboard/Sidebar.tsx`
**Priority:** 🔴 P0
**Dependencies:** `framer-motion`, `next/navigation`, `@phosphor-icons/react`
**Est:** 5h

```typescript
'use client';

import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';
import {
  ChartBar, BellRinging, Calculator, Key,
  CheckCircle, Users, Gear, SignOut, X, List
} from '@phosphor-icons/react';

interface CustomerProfile {
  id: string;
  name?: string;
  segment: string;
  role: string;
  plan: string;
  subscription_expires_at: string;
  district: string;
}

interface NavItem {
  label: string;
  labelHi: string;
  href: string;
  icon: React.ElementType;
  segments: string[];  // which segments can see this
  roles: string[];     // which roles can see this ('all' = everyone)
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Overview',
    labelHi: 'Overview',
    href: '/dashboard/overview',
    icon: ChartBar,
    segments: ['S2','S3','S4','S5','S6','admin'],
    roles: ['all'],
  },
  {
    label: 'Price Intelligence',
    labelHi: 'भाव Intelligence',
    href: '/dashboard/price-intelligence',
    icon: ChartBar,
    segments: ['S2','S3','S4','S5','S6','admin'],
    roles: ['all'],
  },
  {
    label: 'Alerts',
    labelHi: 'चेतावनी',
    href: '/dashboard/alerts',
    icon: BellRinging,
    segments: ['S2','S3','S4','S5','S6','admin'],
    roles: ['all'],
  },
  {
    label: 'Calculator',
    labelHi: 'Calculator',
    href: '/dashboard/calculator',
    icon: Calculator,
    segments: ['S2','S3','S4','admin'],
    roles: ['all'],
  },
  {
    label: 'API Access',
    labelHi: 'API Access',
    href: '/dashboard/api',
    icon: Key,
    segments: ['S5','S6','admin'],
    roles: ['all'],
  },
  {
    label: 'Accuracy',
    labelHi: 'सटीकता',
    href: '/dashboard/accuracy',
    icon: CheckCircle,
    segments: ['admin'],
    roles: ['admin'],
  },
  {
    label: 'Customers',
    labelHi: 'Customers',
    href: '/dashboard/customers',
    icon: Users,
    segments: ['admin'],
    roles: ['admin'],
  },
  {
    label: 'Settings',
    labelHi: 'Settings',
    href: '/dashboard/settings',
    icon: Gear,
    segments: ['S2','S3','S4','S5','S6','admin'],
    roles: ['all'],
  },
];

interface SidebarProps {
  customer: CustomerProfile;
}

export function Sidebar({ customer }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Expiry warning: < 30 days remaining
  const daysLeft = Math.ceil(
    (new Date(customer.subscription_expires_at).getTime() - Date.now()) / 86_400_000
  );
  const showExpiryWarning = daysLeft > 0 && daysLeft <= 30;

  // Filter nav items by customer segment/role
  const visibleItems = NAV_ITEMS.filter(item =>
    item.segments.includes(customer.segment) ||
    item.segments.includes(customer.role)
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#0F1E15] text-[#A8C5B0]">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brandGreen500 flex items-center
                          justify-center text-white text-xs font-bold flex-shrink-0">
            PP
          </div>
          <div>
            <p className="text-white text-sm font-semibold leading-none">
              PoultryPulse AI
            </p>
            <p className="text-[#A8C5B0] text-[10px] mt-0.5">Phase 0 Beta</p>
          </div>
        </div>
      </div>

      {/* User block */}
      <div className="px-4 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-brandGreen700 flex items-center
                          justify-center text-white text-sm font-bold flex-shrink-0">
            {customer.name?.charAt(0).toUpperCase() ?? 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">
              {customer.name ?? `+91-XXXXX`}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] bg-white/10 text-[#A8C5B0]
                               px-2 py-0.5 rounded-full capitalize">
                {customer.plan}
              </span>
            </div>
          </div>
        </div>

        {/* Expiry warning */}
        {showExpiryWarning && (
          <div className="mt-3 bg-amber-500/10 border border-amber-500/20
                          rounded-lg px-3 py-2">
            <p className="text-amber-400 text-[11px]">
              ⚠️ Trial {daysLeft} दिन में expire होगा
            </p>
            <Link
              href="/dashboard/settings?tab=billing"
              className="text-amber-300 text-[11px] underline"
            >
              Renew करें →
            </Link>
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto" aria-label="Dashboard navigation">
        <ul role="list" className="space-y-0.5">
          {visibleItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/dashboard/overview' && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <li key={item.href} role="listitem">
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg
                    text-sm transition-colors duration-150
                    focus-visible:outline-none focus-visible:ring-2
                    focus-visible:ring-brandGreen500
                    ${isActive
                      ? 'bg-white/8 text-white border-l-[3px] border-brandGreen500 pl-[calc(0.75rem-3px)]'
                      : 'text-[#A8C5B0] hover:bg-white/[0.06] hover:text-white border-l-[3px] border-transparent pl-[calc(0.75rem-3px)]'
                    }
                  `}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon
                    size={18}
                    weight="light"
                    aria-hidden="true"
                    className="flex-shrink-0"
                  />
                  <span className="truncate">{item.labelHi}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/5 space-y-1">
        {/* WhatsApp support */}
        <a
          href="https://wa.me/91XXXXXXXXXX?text=Support%20chahiye"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-[#A8C5B0]
                     hover:bg-white/[0.06] hover:text-white text-xs transition-colors"
        >
          <span aria-hidden="true">💬</span>
          WhatsApp Support
        </a>

        {/* Logout */}
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg
                       text-[#A8C5B0] hover:bg-white/[0.06] hover:text-red-400
                       text-xs transition-colors text-left"
          >
            <SignOut size={16} weight="light" aria-hidden="true" />
            Logout
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar — always visible at lg+ */}
      <aside
        className="hidden lg:flex w-[240px] flex-shrink-0 h-screen flex-col"
        aria-label="Sidebar navigation"
        id="sidebar-nav"
      >
        <SidebarContent />
      </aside>

      {/* Mobile: hamburger button (in header — rendered here for z-index) */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 w-10 h-10 flex items-center
                   justify-center bg-white rounded-xl shadow-md
                   focus-visible:ring-2 focus-visible:ring-brandGreen500"
        aria-label="Navigation menu खोलें"
        aria-expanded={mobileOpen}
        aria-controls="mobile-sidebar"
      >
        <List size={20} weight="bold" aria-hidden="true" />
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed inset-0 bg-black/60 z-40"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />

            {/* Drawer */}
            <motion.aside
              key="drawer"
              id="mobile-sidebar"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-[240px] z-50"
              aria-label="Mobile sidebar navigation"
            >
              {/* Close button */}
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center
                           justify-center text-white/60 hover:text-white z-10"
                aria-label="Navigation बंद करें"
              >
                <X size={20} aria-hidden="true" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
```

**QA Checks:**
- [ ] Admin-only items (Accuracy, Customers) not visible to S2 customers
- [ ] Active nav item shows left green border + white text
- [ ] Mobile drawer slides in from left, closes on backdrop click
- [ ] Mobile drawer closes on nav link click
- [ ] Expiry warning shows only when ≤ 30 days remain
- [ ] Logout POST fires correctly
- [ ] All nav links: aria-current="page" on active
- [ ] Keyboard: Tab through all items, Enter activates

---

### DA-03 — Dashboard Header Component

**File:** `apps/web/components/dashboard/DashboardHeader.tsx`
**Priority:** 🔴 P0
**Dependencies:** `@phosphor-icons/react`, `@supabase/ssr`, `framer-motion`
**Est:** 5h

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Bell, ArrowClockwise, CaretDown } from '@phosphor-icons/react';
import { usePathname } from 'next/navigation';
import { useSWRConfig } from 'swr';
import Link from 'next/link';

// Page title map (pathname → title in Hindi)
const PAGE_TITLES: Record<string, string> = {
  '/dashboard/overview':           'Overview',
  '/dashboard/price-intelligence': 'भाव Intelligence',
  '/dashboard/alerts':             'चेतावनी',
  '/dashboard/calculator':         'Calculator',
  '/dashboard/api':                'API Access',
  '/dashboard/accuracy':           'Model Accuracy',
  '/dashboard/customers':          'Customers',
  '/dashboard/settings':           'Settings',
};

interface DashboardHeaderProps {
  customer: {
    name?: string;
    district: string;
    role: string;
  };
}

export function DashboardHeader({ customer }: DashboardHeaderProps) {
  const pathname = usePathname();
  const { mutate } = useSWRConfig();
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [unreadAlerts, setUnreadAlerts] = useState(0);

  const pageTitle = PAGE_TITLES[pathname] ?? 'Dashboard';

  // Stale check: data is stale if > 24h old
  const dataIsStale = Date.now() - lastUpdated.getTime() > 86_400_000;

  // Manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Invalidate all SWR keys (global refresh)
    await mutate(() => true, undefined, { revalidate: true });
    setLastUpdated(new Date());
    setIsRefreshing(false);
  };

  // Format last updated time
  const formatLastUpdated = (date: Date): string => {
    const diffMinutes = Math.floor((Date.now() - date.getTime()) / 60_000);
    if (diffMinutes < 1) return 'अभी';
    if (diffMinutes < 60) return `${diffMinutes} मिनट पहले`;
    return `${Math.floor(diffMinutes / 60)} घंटे पहले`;
  };

  return (
    <header className="h-[60px] bg-white border-b border-[#E2EBE6] px-6
                       flex items-center justify-between gap-4 flex-shrink-0 z-20">
      {/* Page title (left) */}
      <h1 className="text-[17px] font-semibold text-neutral-900 truncate lg:ml-0 ml-12">
        {pageTitle}
      </h1>

      {/* Right controls */}
      <div className="flex items-center gap-3 flex-shrink-0">

        {/* Stale data warning */}
        {dataIsStale && (
          <span className="hidden sm:flex items-center gap-1.5 text-amber-600
                           bg-amber-50 border border-amber-200 rounded-lg
                           px-3 py-1 text-xs font-medium">
            <span aria-hidden="true">⚠️</span>
            डेटा पुराना है
          </span>
        )}

        {/* Last updated */}
        {!dataIsStale && (
          <span className="hidden md:block text-xs text-neutral-400">
            Updated {formatLastUpdated(lastUpdated)}
          </span>
        )}

        {/* Refresh button */}
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="w-9 h-9 flex items-center justify-center rounded-lg
                     text-neutral-500 hover:text-brandGreen700 hover:bg-brandGreen50
                     transition-colors focus-visible:ring-2 focus-visible:ring-brandGreen500
                     disabled:opacity-50"
          aria-label="Data refresh करें"
          title="Refresh data"
        >
          <ArrowClockwise
            size={18}
            weight="regular"
            aria-hidden="true"
            className={isRefreshing ? 'animate-spin' : ''}
          />
        </button>

        {/* Notification bell */}
        <Link
          href="/dashboard/alerts"
          className="relative w-9 h-9 flex items-center justify-center rounded-lg
                     text-neutral-500 hover:text-brandGreen700 hover:bg-brandGreen50
                     transition-colors focus-visible:ring-2 focus-visible:ring-brandGreen500"
          aria-label={`Alerts — ${unreadAlerts} unread`}
        >
          <Bell size={18} weight="regular" aria-hidden="true" />
          {unreadAlerts > 0 && (
            <span
              className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white
                         text-[9px] font-bold rounded-full flex items-center justify-center"
              aria-hidden="true"
            >
              {unreadAlerts > 9 ? '9+' : unreadAlerts}
            </span>
          )}
        </Link>

        {/* User menu */}
        <div className="relative">
          <button
            className="flex items-center gap-2 h-9 pl-3 pr-2 rounded-lg
                       hover:bg-neutral-50 transition-colors
                       focus-visible:ring-2 focus-visible:ring-brandGreen500"
            aria-label="User menu"
            aria-haspopup="true"
          >
            <div className="w-6 h-6 rounded-full bg-brandGreen700 flex items-center
                            justify-center text-white text-[10px] font-bold flex-shrink-0">
              {customer.name?.charAt(0).toUpperCase() ?? 'U'}
            </div>
            <span className="hidden sm:block text-sm font-medium text-neutral-700 max-w-[100px] truncate">
              {customer.name ?? 'Account'}
            </span>
            <CaretDown size={12} weight="bold" aria-hidden="true" className="text-neutral-400" />
          </button>
        </div>
      </div>
    </header>
  );
}
```

**QA Checks:**
- [ ] Page title updates correctly on route change
- [ ] Stale warning shows when data is >24h old
- [ ] Refresh button triggers SWR global revalidation
- [ ] Notification bell shows unread count badge
- [ ] Refresh spinner animation runs correctly
- [ ] All buttons: 36×36px minimum touch target
- [ ] Mobile: hamburger space accounted for (ml-12)

---

### DA-04 — Supabase Dashboard Query Utilities

**File:** `apps/web/utils/supabase/dashboard.ts`
**Priority:** 🔴 P0
**Est:** 4h

```typescript
// Server-side only — never import in 'use client' files
import { createClient } from '@/utils/supabase/server';

export type MandiSlug = 'gorakhpur' | 'deoria' | 'kushinagar' | 'basti' | 'maharajganj';

export interface PredictionRow {
  id: string;
  mandi: MandiSlug;
  predicted_at: string;
  p10: number;
  p50: number;
  p90: number;
  sell_signal: 'SELL_NOW' | 'HOLD' | 'CAUTION';
  actual_price: number | null;
  confidence: number;
  drivers: string[];
  is_demo: boolean;
}

export interface AccuracyMetrics {
  directional_accuracy_30d: number;
  mape_30d: number;
  conformal_coverage_30d: number;
  prediction_count_30d: number;
  last_updated: string;
  is_demo: boolean;
}

export interface AlertRow {
  id: string;
  type: 'HPAI' | 'WEATHER' | 'PRICE_WARNING' | 'POLICY';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  title_hi: string;
  body: string;
  body_hi: string;
  district: string;
  expires_at: string;
  created_at: string;
  external_url: string | null;
}

// --- Predictions ---

export async function getLatestPredictions(
  mandis: MandiSlug[] = ['gorakhpur','deoria','kushinagar','basti','maharajganj']
): Promise<PredictionRow[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('predictions')
    .select('*')
    .in('mandi', mandis)
    .order('predicted_at', { ascending: false })
    .limit(mandis.length * 2); // latest 2 per mandi for trend calc

  if (error || !data || data.length === 0) {
    // Return demo data — NEVER return null/empty (never-blank rule)
    return mandis.map(mandi => generateDemoPrediction(mandi));
  }

  // Deduplicate: keep only latest per mandi
  const latestByMandi = new Map<string, PredictionRow>();
  for (const row of data) {
    if (!latestByMandi.has(row.mandi)) {
      latestByMandi.set(row.mandi, row as PredictionRow);
    }
  }
  return Array.from(latestByMandi.values());
}

export async function getPredictionHistory(
  mandi: MandiSlug,
  days: number = 30
): Promise<PredictionRow[]> {
  const supabase = createClient();
  const from = new Date(Date.now() - days * 86_400_000).toISOString();

  const { data, error } = await supabase
    .from('predictions')
    .select('*')
    .eq('mandi', mandi)
    .gte('predicted_at', from)
    .order('predicted_at', { ascending: true });

  if (error || !data) return generateDemoHistory(mandi, days);
  return data as PredictionRow[];
}

// --- Accuracy ---

export async function getAccuracyMetrics(): Promise<AccuracyMetrics> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('mv_accuracy_dashboard')
    .select('*')
    .single();

  if (error || !data) {
    return {
      directional_accuracy_30d: 95.2,
      mape_30d: 4.8,
      conformal_coverage_30d: 80.1,
      prediction_count_30d: 150,
      last_updated: new Date().toISOString(),
      is_demo: true,
    };
  }

  return { ...data, is_demo: false } as AccuracyMetrics;
}

// --- Alerts ---

export async function getActiveAlerts(district: string): Promise<AlertRow[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('alerts')
    .select('*')
    .or(`district.eq.${district},district.eq.all`)
    .gt('expires_at', new Date().toISOString())
    .order('severity', { ascending: true }) // critical first
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) return [];
  return (data ?? []) as AlertRow[];
}

// --- Admin: Model Registry ---

export async function getModelRegistry() {
  const supabase = createClient();

  const { data } = await supabase
    .from('model_registry')
    .select('*')
    .order('promoted_at', { ascending: false })
    .limit(10);

  return data ?? [];
}

// --- Admin: Customer list (service_role only) ---

export async function getCustomerList(filters: {
  segment?: string;
  status?: string;
  district?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}) {
  // NOTE: This function should only be called from admin-gated server components
  // Uses anon key with RLS — admin policy allows SELECT on customers table
  const supabase = createClient();
  const { page = 1, pageSize = 25 } = filters;
  const from = (page - 1) * pageSize;

  let query = supabase
    .from('customers')
    .select('*', { count: 'exact' })
    .range(from, from + pageSize - 1);

  if (filters.segment) query = query.eq('segment', filters.segment);
  if (filters.status) query = query.eq('status', filters.status);
  if (filters.district) query = query.eq('district', filters.district);
  if (filters.search) query = query.ilike('phone', `%${filters.search}%`);

  const { data, count, error } = await query;
  return { customers: data ?? [], total: count ?? 0, error };
}

// --- Demo data generators ---

function generateDemoPrediction(mandi: MandiSlug): PredictionRow {
  const base = { gorakhpur: 168, deoria: 165, kushinagar: 163, basti: 164, maharajganj: 162 };
  const p50 = base[mandi];
  return {
    id: `demo-${mandi}`,
    mandi,
    predicted_at: new Date().toISOString(),
    p10: p50 - 8,
    p50,
    p90: p50 + 8,
    sell_signal: 'SELL_NOW',
    actual_price: null,
    confidence: 0.89,
    drivers: ['मांग अधिक', 'आवक कम', 'मौसम सामान्य'],
    is_demo: true,
  };
}

function generateDemoHistory(mandi: MandiSlug, days: number): PredictionRow[] {
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(Date.now() - (days - i) * 86_400_000);
    const p50 = 165 + Math.sin(i * 0.3) * 8 + Math.random() * 4;
    return {
      id: `demo-hist-${mandi}-${i}`,
      mandi,
      predicted_at: date.toISOString(),
      p10: p50 - 8,
      p50: Math.round(p50),
      p90: p50 + 8,
      sell_signal: i % 3 === 0 ? 'HOLD' : 'SELL_NOW',
      actual_price: Math.round(p50 + (Math.random() - 0.5) * 6),
      confidence: 0.87 + Math.random() * 0.08,
      drivers: [],
      is_demo: true,
    };
  });
}
```

**QA Checks:**
- [ ] All functions return demo data on Supabase error (never null)
- [ ] Demo data marked with `is_demo: true`
- [ ] getCustomerList only called from server components (lint rule enforced)
- [ ] getLatestPredictions deduplicates correctly (one row per mandi)
- [ ] TypeScript: no any types, all return types explicit

---

### DA-05 — Recharts Configuration

**File:** `apps/web/lib/charts/config.ts`
**Priority:** 🔴 P0
**Est:** 3h

```typescript
// Shared Recharts config for all dashboard charts
// P10/P50/P90 rule: ALL THREE always visible — never hidden

export const CHART_COLOURS = {
  p50:    '#1A6B3C',  // brandGreen700
  p10:    '#7CC49A',  // light green
  p90:    '#0F4A28',  // dark green
  actual: '#E8621A',  // saffronOrange
  good:   '#16A34A',  // within 5% error
  warn:   '#D97706',  // 5-10% error
  bad:    '#DC2626',  // >10% error
  grid:   '#E2EBE6',
  axis:   '#5A7A68',
} as const;

// Standard chart margins
export const CHART_MARGIN = { top: 8, right: 16, bottom: 8, left: 0 };

// Standard tooltip style (shared across all charts)
export const tooltipStyle = {
  contentStyle: {
    background: '#FFFFFF',
    border: '1px solid #E2EBE6',
    borderRadius: '8px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
    fontSize: '13px',
    fontFamily: "'Plus Jakarta Sans', system-ui",
    padding: '8px 12px',
  },
  labelStyle: { color: '#334D3E', fontWeight: 600 },
  itemStyle: { color: '#5A7A68' },
};

// Standard axis props
export const xAxisProps = {
  tickLine: false,
  axisLine: false,
  tick: { fill: CHART_COLOURS.axis, fontSize: 11, fontFamily: "'Plus Jakarta Sans', system-ui" },
  dy: 8,
};

export const yAxisProps = {
  tickLine: false,
  axisLine: false,
  tick: { fill: CHART_COLOURS.axis, fontSize: 11 },
  width: 52,
  tickFormatter: (v: number) => `₹${v}`,
};

// P10/P50/P90 Area definitions (use in AreaChart)
// RULE: All three MUST be present in every price forecast chart
export const P50_AREA_PROPS = {
  type: 'monotone' as const,
  dataKey: 'p50',
  stroke: CHART_COLOURS.p50,
  strokeWidth: 2,
  fill: 'none',
  dot: false,
  activeDot: { r: 4, fill: CHART_COLOURS.p50 },
};

export const P10_AREA_PROPS = {
  type: 'monotone' as const,
  dataKey: 'p10',
  stroke: CHART_COLOURS.p10,
  strokeWidth: 1,
  strokeDasharray: '4 4',
  fill: 'none',
  dot: false,
};

export const P90_AREA_PROPS = {
  type: 'monotone' as const,
  dataKey: 'p90',
  stroke: CHART_COLOURS.p90,
  strokeWidth: 1,
  strokeDasharray: '4 4',
  fill: 'none',
  dot: false,
};

export const ACTUAL_SCATTER_PROPS = {
  type: 'monotone' as const,
  dataKey: 'actual_price',
  stroke: CHART_COLOURS.actual,
  strokeWidth: 0,
  dot: { r: 3, fill: CHART_COLOURS.actual, strokeWidth: 0 },
  activeDot: { r: 5, fill: CHART_COLOURS.actual },
};

// Accuracy gate colour helper
export function getAccuracyColour(value: number, metric: 'directional' | 'mape' | 'coverage'): string {
  if (metric === 'directional') {
    return value >= 95 ? CHART_COLOURS.good : value >= 90 ? CHART_COLOURS.warn : CHART_COLOURS.bad;
  }
  if (metric === 'mape') {
    return value < 6 ? CHART_COLOURS.good : value < 8 ? CHART_COLOURS.warn : CHART_COLOURS.bad;
  }
  if (metric === 'coverage') {
    return value >= 78 && value <= 82 ? CHART_COLOURS.good : CHART_COLOURS.warn;
  }
  return CHART_COLOURS.good;
}
```

**QA Checks:**
- [ ] P10/P50/P90 constants exported and used in all forecast charts
- [ ] `getAccuracyColour` returns correct colour for all threshold cases
- [ ] TypeScript: all constants typed as const, no magic strings

---

### DA-06 — Loading Skeleton Components

**File:** `apps/web/components/dashboard/skeletons/index.tsx`
**Priority:** 🔴 P0
**Est:** 4h

```typescript
// Skeleton components — shapes match content they replace (never generic spinner)
// All use skeleton-shimmer CSS animation from styles/animations.css

import React from 'react';

// Base skeleton element
function SkeletonBox({ className = '' }: { className?: string }) {
  return (
    <div
      className={`skeleton-shimmer rounded-lg ${className}`}
      aria-hidden="true"
    />
  );
}

// 4 KPI metric cards
export function MetricCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="bg-white rounded-2xl p-6 border border-neutral-100">
          <SkeletonBox className="h-3 w-24 mb-4" />
          <SkeletonBox className="h-8 w-32 mb-2" />
          <SkeletonBox className="h-3 w-20" />
        </div>
      ))}
    </div>
  );
}

// Forecast AreaChart skeleton
export function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div
      className="bg-white rounded-2xl p-6 border border-neutral-100"
      style={{ height: height + 48 }}
    >
      <SkeletonBox className="h-4 w-40 mb-4" />
      {/* Chart bands skeleton */}
      <div className="relative" style={{ height }}>
        <SkeletonBox className="absolute top-0 left-0 right-0 h-2 opacity-40 rounded-full" style={{ top: '20%' }} />
        <SkeletonBox className="absolute left-0 right-0 h-2 rounded-full" style={{ top: '50%' }} />
        <SkeletonBox className="absolute left-0 right-0 h-2 opacity-40 rounded-full" style={{ top: '75%' }} />
      </div>
    </div>
  );
}

// Mandi price table skeleton (5 rows)
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-neutral-100 flex gap-4">
        {[40, 24, 24, 20, 30].map((w, i) => (
          <SkeletonBox key={i} className="h-3" style={{ width: `${w}%` }} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className={`px-6 py-4 flex gap-4 items-center ${i % 2 === 0 ? '' : 'bg-neutral-50'}`}
        >
          {[40, 24, 24, 20, 30].map((w, j) => (
            <SkeletonBox key={j} className="h-4" style={{ width: `${w}%` }} />
          ))}
        </div>
      ))}
    </div>
  );
}

// Alert cards skeleton (3 cards)
export function AlertCardsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="bg-white rounded-xl p-4 border-l-4 border-neutral-200 border border-neutral-100">
          <SkeletonBox className="h-4 w-48 mb-2" />
          <SkeletonBox className="h-3 w-full mb-1" />
          <SkeletonBox className="h-3 w-3/4" />
        </div>
      ))}
    </div>
  );
}

// Customer table row skeleton
export function CustomerTableSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
      <div className="px-6 py-3 border-b border-neutral-100 flex gap-3">
        {[15,12,10,10,10,10,15,10].map((w, i) => (
          <SkeletonBox key={i} className="h-3" style={{ width: `${w}%` }} />
        ))}
      </div>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className={`px-6 py-4 flex gap-3 items-center ${i%2===0 ? '' : 'bg-neutral-50'}`}>
          {[15,12,10,10,10,10,15,10].map((w, j) => (
            <SkeletonBox key={j} className="h-4" style={{ width: `${w}%` }} />
          ))}
        </div>
      ))}
    </div>
  );
}
```

**QA Checks:**
- [ ] Skeleton widths visually match their content counterparts
- [ ] shimmer animation plays at correct speed (1.5s)
- [ ] No spinners used anywhere — all skeletons are shape-based
- [ ] aria-hidden="true" on all skeleton containers

---

### DA-07 — Empty State Components

**File:** `apps/web/components/dashboard/EmptyState.tsx`
**Priority:** 🔴 P0
**Est:** 4h

```typescript
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

type EmptyVariant =
  | 'no-alerts'
  | 'no-customers'
  | 'no-data'
  | 'no-api-key'
  | 'loading-prediction'
  | 'no-history'
  | 'no-referrals';

interface EmptyStateProps {
  variant: EmptyVariant;
  ctaLabel?: string;
  ctaHref?: string;
  onCtaClick?: () => void;
}

const EMPTY_CONTENT: Record<EmptyVariant, {
  emoji: string;
  headingHi: string;
  messageHi: string;
  ctaDefault?: { label: string; href: string };
}> = {
  'no-alerts': {
    emoji: '☀️',
    headingHi: 'सब ठीक है! ✓',
    messageHi: 'अभी कोई active alert नहीं है। HPAI, मौसम, या भाव की चेतावनी आने पर यहाँ दिखेगी।',
  },
  'no-customers': {
    emoji: '👋',
    headingHi: 'अभी कोई Customer नहीं है',
    messageHi: 'Phase 0 launch होते ही customers यहाँ दिखाई देंगे।',
    ctaDefault: { label: 'Accuracy Gate देखें', href: '/dashboard/accuracy' },
  },
  'no-data': {
    emoji: '📊',
    headingHi: 'डेटा आ रहा है...',
    messageHi: 'Daily forecast pipeline 06:00 AM पर चलती है। कल की prediction आज रात तक available होगी।',
  },
  'no-api-key': {
    emoji: '🔑',
    headingHi: 'अभी तक कोई API Key नहीं',
    messageHi: 'पहली API key बनाएं — अपने system में PoultryPulse data integrate करें।',
    ctaDefault: { label: 'API Key बनाएं', href: '/dashboard/api' },
  },
  'loading-prediction': {
    emoji: '🐔',
    headingHi: 'भाव अनुमान तैयार हो रहा है',
    messageHi: 'आज का signal 6:30 AM पर मिलेगा। कृपया थोड़ा इंतज़ार करें।',
  },
  'no-history': {
    emoji: '📅',
    headingHi: 'अभी कोई history नहीं',
    messageHi: 'कुछ दिनों में यहाँ price history दिखेगी।',
  },
  'no-referrals': {
    emoji: '👥',
    headingHi: 'अभी कोई referral नहीं',
    messageHi: 'दोस्तों को refer करें — ₹500 पाएं।',
    ctaDefault: { label: 'Refer करें', href: '/refer' },
  },
};

export function EmptyState({ variant, ctaLabel, ctaHref, onCtaClick }: EmptyStateProps) {
  const content = EMPTY_CONTENT[variant];
  const cta = ctaLabel && (ctaHref || onCtaClick)
    ? { label: ctaLabel, href: ctaHref }
    : content.ctaDefault;

  return (
    <div
      className="flex flex-col items-center justify-center py-16 px-8 text-center"
      role="status"
      aria-live="polite"
    >
      <span className="text-5xl mb-4" aria-hidden="true">{content.emoji}</span>
      <h3 className="text-base font-semibold text-neutral-900 mb-2">
        {content.headingHi}
      </h3>
      <p className="text-sm text-neutral-500 max-w-xs leading-relaxed mb-4">
        {content.messageHi}
      </p>
      {cta && (
        cta.href
          ? <Button variant="secondary" size="sm" href={cta.href}>{cta.label}</Button>
          : <Button variant="secondary" size="sm" onClick={onCtaClick}>{cta.label}</Button>
      )}
    </div>
  );
}
```

**QA Checks:**
- [ ] All 7 variants render without errors
- [ ] role="status" + aria-live="polite" announces to screen reader
- [ ] CTA renders when provided, absent when not
- [ ] Never renders a blank div (always has heading + message)

---

### DA-08 — Error State Component

**File:** `apps/web/components/dashboard/ErrorState.tsx`
**Priority:** 🔴 P0
**Est:** 3h

```typescript
'use client';

type ErrorVariant =
  | 'network-error'
  | 'data-stale'
  | 'accuracy-gate-failed'
  | 'forbidden'
  | 'session-expired';

interface ErrorStateProps {
  variant: ErrorVariant;
  onRetry?: () => void;
  requiredPlan?: string;
}

const ERROR_CONTENT: Record<ErrorVariant, {
  icon: string;
  headingHi: string;
  messageHi: string;
  isCritical?: boolean;
}> = {
  'network-error': {
    icon: '🌐',
    headingHi: 'Internet से जुड़ने में समस्या',
    messageHi: 'अपना internet connection check करें और दोबारा कोशिश करें।',
  },
  'data-stale': {
    icon: '⏱',
    headingHi: 'डेटा 24+ घंटे पुराना है',
    messageHi: 'ताज़ा data के लिए Refresh करें।',
  },
  'accuracy-gate-failed': {
    icon: '⚠️',
    headingHi: 'CRITICAL: Model Accuracy Below 95%',
    messageHi: 'Customer notifications paused automatically. तत्काल investigate करें।',
    isCritical: true,
  },
  'forbidden': {
    icon: '🔒',
    headingHi: 'यह Page आपके plan में नहीं है',
    messageHi: 'इस section को access करने के लिए higher plan की ज़रूरत है।',
  },
  'session-expired': {
    icon: '🔑',
    headingHi: 'Session Expire हो गया',
    messageHi: 'सुरक्षा के लिए session बंद हो गया — दोबारा login करें।',
  },
};

export function ErrorState({ variant, onRetry, requiredPlan }: ErrorStateProps) {
  const content = ERROR_CONTENT[variant];

  if (content.isCritical) {
    return (
      <div
        role="alert"
        aria-live="assertive"
        className="bg-red-600 text-white px-6 py-4 rounded-xl mb-6 flex items-start gap-3"
      >
        <span className="text-2xl flex-shrink-0" aria-hidden="true">⚠️</span>
        <div>
          <p className="font-bold">{content.headingHi}</p>
          <p className="text-red-100 text-sm mt-1">{content.messageHi}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      role="alert"
      className="flex flex-col items-center py-12 px-8 text-center"
    >
      <span className="text-4xl mb-3" aria-hidden="true">{content.icon}</span>
      <h3 className="font-semibold text-neutral-900 mb-1">{content.headingHi}</h3>
      <p className="text-sm text-neutral-500 max-w-xs mb-4">{content.messageHi}</p>
      {requiredPlan && (
        <p className="text-xs text-neutral-400 mb-3">Required: {requiredPlan} plan</p>
      )}
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm text-brandGreen700 underline font-medium"
        >
          दोबारा कोशिश करें
        </button>
      )}
      {variant === 'forbidden' && (
        <a href="/dashboard/settings?tab=billing"
          className="text-sm bg-brandGreen700 text-white px-4 py-2 rounded-lg mt-2">
          Upgrade करें →
        </a>
      )}
      {variant === 'session-expired' && (
        <a href="/login?redirect=/dashboard/overview"
          className="text-sm bg-brandGreen700 text-white px-4 py-2 rounded-lg mt-2">
          Login करें →
        </a>
      )}
    </div>
  );
}
```

---

## TASK GROUP DB: DASHBOARD PAGES

### DB-01 — Overview Page

**File:** `apps/web/app/(dashboard)/overview/page.tsx`
**Priority:** 🔴 P0
**Est:** 16h (split across 5 sub-components)

```typescript
// Server Component — SSR data fetch, passes to client sub-components

import { Suspense } from 'react';
import { createClient } from '@/utils/supabase/server';
import { getLatestPredictions, getAccuracyMetrics, getActiveAlerts } from '@/utils/supabase/dashboard';
import { KPICards } from '@/components/dashboard/overview/KPICards';
import { ForecastChart } from '@/components/dashboard/overview/ForecastChart';
import { AlertsFeed } from '@/components/dashboard/overview/AlertsFeed';
import { MandiPriceTable } from '@/components/dashboard/overview/MandiPriceTable';
import { MetricCardsSkeleton, ChartSkeleton, AlertCardsSkeleton, TableSkeleton } from '@/components/dashboard/skeletons';

export const revalidate = 600; // ISR: revalidate every 10 minutes

export default async function OverviewPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  // Fetch customer profile
  const { data: customer } = await supabase
    .from('customers')
    .select('district, segment, role')
    .eq('phone', session!.user.phone)
    .single();

  const district = customer?.district ?? 'gorakhpur';

  // Parallel data fetch
  const [predictions, accuracy, alerts] = await Promise.allSettled([
    getLatestPredictions(),
    getAccuracyMetrics(),
    getActiveAlerts(district),
  ]);

  const predictionsData = predictions.status === 'fulfilled' ? predictions.value : [];
  const accuracyData = accuracy.status === 'fulfilled' ? accuracy.value : null;
  const alertsData = alerts.status === 'fulfilled' ? alerts.value : [];

  // Gorakhpur prediction for primary KPI card
  const primaryPrediction = predictionsData.find(p => p.mandi === district)
    ?? predictionsData[0]
    ?? null;

  return (
    <div className="space-y-6">
      {/* Row 1: KPI Cards */}
      <Suspense fallback={<MetricCardsSkeleton />}>
        <KPICards
          primaryPrediction={primaryPrediction}
          accuracy={accuracyData}
          alertCount={alertsData.length}
          customer={customer}
        />
      </Suspense>

      {/* Row 2: Chart + Alerts (2-column grid) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-8">
          <Suspense fallback={<ChartSkeleton height={280} />}>
            <ForecastChart
              predictions={predictionsData}
              primaryMandi={(district as any)}
            />
          </Suspense>
        </div>

        <div className="xl:col-span-4">
          <Suspense fallback={<AlertCardsSkeleton count={3} />}>
            <AlertsFeed initialAlerts={alertsData.slice(0, 5)} district={district} />
          </Suspense>
        </div>
      </div>

      {/* Row 3: Mandi Price Table */}
      <Suspense fallback={<TableSkeleton rows={5} />}>
        <MandiPriceTable predictions={predictionsData} />
      </Suspense>
    </div>
  );
}
```

**Sub-component: KPICards.tsx** (`'use client'`)

```typescript
// apps/web/components/dashboard/overview/KPICards.tsx
'use client';

import { CountUp } from '@/components/motion/CountUp';
import { getAccuracyColour } from '@/lib/charts/config';

// 4 metric cards — see 04_postlogin_design_master.md §D-01 Row 1 for full spec
// Implementation: Card component (double-bezel) wrapping each metric
// Gate rule: if process.env.NEXT_PUBLIC_ACCURACY_GATE_CLEARED !== 'true' → show "Validating..."
```

**Sub-component: ForecastChart.tsx** (`'use client'`)

```typescript
// apps/web/components/dashboard/overview/ForecastChart.tsx
'use client';

import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  CartesianGrid, ReferenceLine, ResponsiveContainer, Legend
} from 'recharts';
import { P50_AREA_PROPS, P10_AREA_PROPS, P90_AREA_PROPS,
         ACTUAL_SCATTER_PROPS, CHART_MARGIN, tooltipStyle,
         xAxisProps, yAxisProps } from '@/lib/charts/config';

// MANDATORY: P10, P50, P90 ALL rendered — never remove any band
// Chart height: 280px fixed
// Today reference line: vertical dashed saffronOrange
// aria-label on ResponsiveContainer
// Hidden data table: <table className="sr-only"> with all data points
```

**QA Checks:**
- [ ] All 3 P10/P50/P90 bands visible in ForecastChart
- [ ] KPI card 3 shows "Validating..." when gate not cleared
- [ ] AlertsFeed empty state shows illustration (not blank)
- [ ] Mandi table has th scope="col" on all headers
- [ ] All Suspense fallbacks match content shape
- [ ] Page revalidates at ISR 600s
- [ ] Demo data shown with "(Demo)" label

---

### DB-02 — Price Intelligence Page

**File:** `apps/web/app/(dashboard)/price-intelligence/page.tsx`
**Priority:** 🔴 P0
**Est:** 16h

**Key requirements:**
- Tabbed UI: Forecast | Historical | Download
- URL-synced tab: `?tab=forecast` persisted via `useSearchParams`
- Mandi + date range selectors synced to URL params
- Forecast chart: full-size (400px height), P10/P50/P90 + actual + annotations
- Historical table: sortable, colour-coded by error %, paginated (30/page)
- Download tab: streaming CSV via `/api/export/predictions`
- Price drivers panel (collapsible, below chart)
- `'use client'` for tab state, mandi selector, chart interactivity

**Critical chart annotations:**
```typescript
// HPAI events: red vertical ReferenceArea
// Weather events: amber vertical ReferenceArea
// Source: fetch from alerts table with type in ['HPAI','WEATHER'] + date overlap
{hpaiEvents.map(event => (
  <ReferenceArea
    key={event.id}
    x1={event.start_date}
    x2={event.end_date}
    fill="#FEF2F2"
    stroke="#FCA5A5"
    label={{ value: 'HPAI', fill: '#DC2626', fontSize: 10 }}
  />
))}
```

**QA Checks:**
- [ ] Tab state persisted in URL (browser back/forward works)
- [ ] Historical table: colour-coded rows (green <5%, amber 5-10%, red >10% error)
- [ ] CSV download: Content-Disposition header present, file opens correctly
- [ ] Chart: all 3 bands visible, annotations rendered
- [ ] Mandi selector change: chart re-fetches data
- [ ] S1 customers: redirect to /dashboard/403 (access gate)

---

### DB-03 — Alerts Page

**File:** `apps/web/app/(dashboard)/alerts/page.tsx`
**Priority:** 🟡 P1
**Est:** 12h

**Key requirements:**
- Tabs: Active | History | Settings
- Supabase Realtime subscription on `alerts` table (`INSERT` events)
- New alert: toast notification + automatic feed update (SWR mutate)
- Alert cards: type-specific visual treatment (see design doc §D-03)
- Acknowledge action: optimistic UI (mark read instantly, confirm server-side)
- Alert settings: per-type WhatsApp/email/in-app toggles
- Empty state: Pullu illustration + "सब ठीक है!"

```typescript
// Realtime hook usage in AlertsFeed component:
// useRealtimeAlerts(district) — from hooks/useRealtimeAlerts.ts
// On new alert INSERT: toast + mutate SWR cache

// HPAI alert card requires:
// - Red left border (4px)
// - Critical badge
// - "Advisory पढ़ें" → external govt link
// - "Sell Signal देखें" → /dashboard/price-intelligence
// - alert-critical CSS animation on mount
```

**QA Checks:**
- [ ] New alert appears within 3 seconds via Realtime
- [ ] Toast notification fires on Realtime insert
- [ ] Acknowledge marks alert as read (optimistic UI)
- [ ] Empty state renders correctly (no blank div)
- [ ] History table: filterable by type + date range
- [ ] Settings toggles save correctly to Supabase

---

### DB-04 — Calculator Page

**File:** `apps/web/app/(dashboard)/calculator/page.tsx`
**Priority:** 🟡 P1
**Est:** 12h

**Access gate:**
```typescript
// Server-side check at top of page:
if (!['S2','S3','S4','admin'].includes(customer.segment)) {
  redirect('/dashboard/403');
}
```

**Batch profit calculator (live update, no submit):**
```typescript
// All inputs controlled, calculations update on every keystroke/slider change
// Formula:
const grossRevenue = flockSize * avgWeightKg * (p50Price / 1000); // ₹/g → ₹/kg
const netProfit = grossRevenue - totalFeedCost - otherCosts;
const profitPerBird = netProfit / flockSize;

// 14-day projection: calculate net profit for each of next 14 days
// using forecast P50 values from Supabase predictions table
// Colour bars: green (SELL_NOW days), amber (HOLD), red (CAUTION/avoid)
```

**QA Checks:**
- [ ] S1 access redirect to /dashboard/403 (not a blank page)
- [ ] Profit calculation updates instantly on every input change
- [ ] 14-day bar chart: colour matches sell signal for each day
- [ ] Feed cost commodity prices: fetched from Supabase macro_data table
- [ ] Multi-farm view (S2): shows up to 20 farm cards

---

### DB-05 — Accuracy Page (Admin Gate)

**File:** `apps/web/app/(dashboard)/accuracy/page.tsx`
**Priority:** 🔴 P0 (mission-critical admin tool)
**Est:** 16h

```typescript
// CRITICAL: Admin only
// Server-side role check:
if (customer.role !== 'admin') redirect('/dashboard/403');

// CRITICAL BANNER logic:
// If any gate fails → red banner, aria-live="assertive", non-dismissable
// All gates pass → green success banner

// Three accuracy gates (large, prominent at top):
// Gate 1: Directional Accuracy ≥ 95% (PASS/FAIL badge)
// Gate 2: MAPE < 6% (PASS/FAIL badge)
// Gate 3: Conformal Coverage 78-82% (PASS/FAIL badge)

// Supabase Realtime: subscribe to accuracy_log INSERT events
// New record: re-fetch gates, update banner, aria-live announcement if gate breached
```

**Gate component:**
```typescript
// GateIndicator.tsx
interface GateIndicatorProps {
  label: string;
  value: number;
  target: string;
  status: 'pass' | 'fail' | 'warn';
}
// Large Sora font number, colour-coded, PASS/FAIL badge
// CountUp animation on mount
// Trend sparkline (7-day rolling)
```

**QA Checks:**
- [ ] Non-admin access redirects to /dashboard/403
- [ ] Critical banner non-dismissable when gate fails
- [ ] Supabase Realtime updates gates within 5 seconds
- [ ] aria-live="assertive" fires on gate breach (screen reader)
- [ ] Manual retrain button requires 2-click confirmation
- [ ] Rollback action: double confirmation modal, irreversible warning

---

### DB-06 — Customers Page (Admin Gate)

**File:** `apps/web/app/(dashboard)/customers/page.tsx`
**Priority:** 🟡 P1
**Est:** 14h

```typescript
// Admin only — server-side role check
// Pagination: 25 rows/page, server-side (not client-side)
// URL-synced: page, segment, status, district, search filters

// Phone masking:
// Default: "+91-XXXXX" (last 5 digits shown)
// Hover on masked phone: reveal full number (admin permission)
// Implementation: CSS hover + data-phone attribute + JS reveal
// DPDP: full phone only visible to admin role, logged to admin_audit_log

// Row expansion (click row):
// Animate: expand-row CSS keyframe (see 07_motion_animation_master.md)
// Shows: subscription details, 30-day usage stats, WhatsApp delivery log
```

**QA Checks:**
- [ ] Phone masking works (only last 5 digits by default)
- [ ] Full phone reveal logged to admin_audit_log
- [ ] Pagination works server-side (not client-side filtering)
- [ ] CSV export streams correctly (large datasets)
- [ ] Edit plan action logged to admin_audit_log

---

### DB-07 — Settings Page

**File:** `apps/web/app/(dashboard)/settings/page.tsx`
**Priority:** 🟡 P1
**Est:** 12h

```typescript
// Tab structure: Profile | Notifications | Team | Billing | Data & Privacy
// URL-synced: ?tab=profile

// Delete account (Data & Privacy tab):
// Step 1: "Account delete करें?" confirmation button (red)
// Step 2: Modal: type "DELETE" to confirm
// Step 3: Email OTP confirmation
// On confirmed: POST /api/account/delete
//   → Sets customer.deleted_at = now() + 30-day grace period
//   → Queues DPDP data erasure workflow
//   → Sends confirmation email
// NEVER hard delete immediately — 30-day grace per DPDP

// Cancel subscription (Billing tab):
// Retention modal: show before processing cancellation
// Offer: "1 महीना मुफ़्त" if good standing customer
// Cancellation: sets subscription_ends_at = end of current period
// NOT immediate termination

// Language switch (Profile tab):
// Immediate effect: POST /api/account/update {language: 'hi'|'en'}
// Also sets cookie for SSR language detection
// Page reloads after save
```

**QA Checks:**
- [ ] Account delete: 3-step confirmation required
- [ ] Cancel: retention modal shown before processing
- [ ] Language change: immediate effect on page
- [ ] Team tab (S2+): only visible to qualifying segments
- [ ] Data download: triggers ZIP generation of customer data

---

### DB-08 — API Access Page

**File:** `apps/web/app/(dashboard)/api/page.tsx`
**Priority:** 🟢 P2
**Est:** 10h

```typescript
// Access gate: plan === 'PULSE_INTEL' only
if (customer.plan !== 'PULSE_INTEL') redirect('/dashboard/403');

// API key: stored as bcrypt hash in Supabase
// Display: "pp_live_XXXXXXXXXXXXXXXXXXXXX" (prefix plain + masked rest)
// Copy: reveals full key for 30 seconds, then re-masks
// SECURITY: key never stored in client state after copy timeout
```

**QA Checks:**
- [ ] Non-PulseIntel plan redirects to /dashboard/403
- [ ] Key display masked by default
- [ ] Copy reveals key for 30 seconds only
- [ ] Key rotation requires confirmation modal
- [ ] Usage chart fetches from Supabase api_usage_logs table

---

### DB-09 — 403 Forbidden Page (Dashboard)

**File:** `apps/web/app/(dashboard)/403/page.tsx`
**Priority:** 🟡 P1
**Est:** 2h

```typescript
// No sidebar for this page? Actually keep sidebar — user is still authenticated
// Just show friendly error in main content area

export default function ForbiddenPage({
  searchParams
}: {
  searchParams: { required?: string }
}) {
  const required = searchParams.required ?? 'higher';

  return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="text-center max-w-sm">
        <span className="text-5xl mb-4 block">🔒</span>
        <h1 className="text-xl font-bold text-neutral-900 mb-2">
          यह Page आपके plan में नहीं है
        </h1>
        <p className="text-sm text-neutral-500 mb-6">
          इस section को access करने के लिए{' '}
          <span className="font-semibold capitalize">{required}</span> plan की
          ज़रूरत है।
        </p>
        <div className="flex flex-col gap-3">
          <a
            href="/dashboard/settings?tab=billing"
            className="bg-brandGreen700 text-white px-6 py-3 rounded-xl text-sm font-semibold"
          >
            Upgrade करें →
          </a>
          <a
            href="/dashboard/overview"
            className="text-sm text-neutral-500 underline"
          >
            ← Overview पर वापस जाएं
          </a>
        </div>
      </div>
    </div>
  );
}
```

---

### DB-10 — Mobile-Only Redirect Page

**File:** `apps/web/app/(dashboard)/mobile-only/page.tsx`
**Priority:** 🟡 P1
**Est:** 2h

```typescript
// Shown to S1 farmers who access web dashboard
// No sidebar (public-style layout wrapper)
// Clear message: this dashboard is for S2+ plans

// QA: S1 customer login → redirects here (not 403)
// QA: App Store + Play Store links correct
// QA: Upgrade teaser links to /pricing
```

---

## TASK GROUP DC: DASHBOARD API ROUTES

### DC-01 — Predictions Public API

**File:** `apps/web/app/api/public/predictions/route.ts`
**Priority:** 🟡 P1 | **Est:** 3h

```typescript
// GET /api/public/predictions?mandi=gorakhpur
// No auth required (public price widget on district pages)
// Rate limit: 30 req/min per IP
// Returns: latest PredictionRow for specified mandi
// Cache: Cache-Control: public, max-age=300 (5 min)
// Never returns null — demo data on Supabase error
```

### DC-02 — CSV Export Endpoint

**File:** `apps/web/app/api/export/predictions/route.ts`
**Priority:** 🟡 P1 | **Est:** 4h

```typescript
// GET /api/export/predictions?mandi=gorakhpur,deoria&from=2026-04-01&to=2026-05-01
// Auth: Supabase session, S2+ only
// Validation: max 90 day range, valid mandi slugs
// Response: streaming CSV via ReadableStream
// Headers: Content-Disposition: attachment; filename="poultrypulse-predictions-YYYYMMDD.csv"
// Columns: date, mandi, p10, p50, p90, actual_price, sell_signal, error_pct
// Rate limit: 10 downloads per customer per day
```

### DC-03 — Alert Acknowledge Endpoint

**File:** `apps/web/app/api/alerts/acknowledge/route.ts`
**Priority:** 🟡 P1 | **Est:** 2h

```typescript
// POST { alert_id: string }
// Auth: Supabase session required
// Inserts to alert_acknowledgements: { alert_id, customer_id, acknowledged_at }
// Returns updated alert + acknowledgement status
```

### DC-04 — Notification Settings Endpoint

**File:** `apps/web/app/api/customers/[id]/notification-settings/route.ts`
**Priority:** 🟡 P1 | **Est:** 2h

```typescript
// PATCH { whatsapp_hpai: boolean, whatsapp_weather: boolean, ... }
// Auth: customer can only update own settings (session.user.id check)
// Validates: id matches authenticated customer
// Updates: customer_notification_settings table
```

### DC-05 — Admin: Update Customer Plan

**File:** `apps/web/app/api/admin/customers/[id]/plan/route.ts`
**Priority:** 🟡 P1 | **Est:** 3h

```typescript
// PATCH { plan: 'PULSE_FARM'|'PULSE_PRO'|'PULSE_INTEL', expires_at?: string }
// Auth: admin role required (check customer.role === 'admin')
// Logs to admin_audit_log: { admin_id, action: 'plan_change', target_customer_id, old_plan, new_plan }
// Returns: updated customer record
```

### DC-06 — Manual Retrain Trigger

**File:** `apps/web/app/api/admin/retrain/route.ts`
**Priority:** 🟡 P1 | **Est:** 3h

```typescript
// POST {} — no body required
// Auth: admin role required
// Rate limit: 1 per 6 hours (prevent runaway)
// Triggers: Airflow DAG via REST API (POST to Astronomer.io endpoint)
// Logs to retrain_requests: { triggered_by, triggered_at, dag_run_id }
// Returns: { triggered: true, dag_run_id, estimated_completion: '2 hours' }
```

### DC-07 — Account Delete (DPDP Erasure)

**File:** `apps/web/app/api/account/delete/route.ts`
**Priority:** 🟡 P1 | **Est:** 4h

```typescript
// POST { confirm_text: 'DELETE', otp: string }
// Auth: valid session required
// Step 1: Verify OTP matches recently sent OTP for this phone
// Step 2: Set customers.deleted_at = now(), status = 'pending_deletion'
// Step 3: Queue DPDP erasure: delete PII within 30 days (scheduled job)
// Step 4: Revoke Supabase session
// Step 5: Send confirmation WhatsApp message
// Returns: { success: true, erasure_scheduled_at: [30 days from now] }
// NEVER hard deletes immediately — DPDP requires 30-day grace
```

---

## TASK GROUP DD: REALTIME HOOKS

### DD-01 — useRealtimeAlerts Hook

**File:** `apps/web/hooks/useRealtimeAlerts.ts`
**Priority:** 🟡 P1 | **Est:** 3h

```typescript
'use client';

import { useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useSWRConfig } from 'swr';
import toast from 'react-hot-toast'; // or custom toast

export function useRealtimeAlerts(district: string) {
  const { mutate } = useSWRConfig();
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel(`alerts:${district}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'alerts',
          filter: `district=eq.${district}`,
        },
        (payload) => {
          const alert = payload.new;
          // Show toast notification
          toast.custom((t) => (
            <div className={`bg-white shadow-lg rounded-xl p-4 border-l-4 
              ${alert.severity === 'critical' ? 'border-red-500' : 'border-amber-400'}`}>
              <p className="font-semibold text-sm">{alert.title_hi}</p>
              <p className="text-xs text-neutral-500 mt-1">{alert.body_hi.slice(0, 80)}...</p>
            </div>
          ), { duration: 6000, position: 'top-right' });

          // Revalidate alerts SWR cache
          mutate((key) => typeof key === 'string' && key.includes('/api/alerts'));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [district, mutate]);
}
```

### DD-02 — useAccuracyGateMonitor Hook

**File:** `apps/web/hooks/useAccuracyGateMonitor.ts`
**Priority:** 🟡 P1 | **Est:** 3h

```typescript
// Admin-only Realtime hook
// Subscribes to accuracy_log INSERT events
// On new record: check if any gate breached
// If breached: aria-live="assertive" announcement + update critical banner
// Returns: { gateStatus: 'pass'|'fail'|'warn', latestMetrics }
```

---

## TASK GROUP DE: TESTING (Dashboard)

### DE-01 — Auth Middleware Tests

**File:** `apps/web/__tests__/middleware/auth.test.ts`
**Priority:** 🔴 P0 | **Est:** 4h

```
Test cases:
□ S1 customer → /dashboard/* redirects to /dashboard/mobile-only
□ S2 customer → /dashboard/accuracy redirects to /dashboard/403
□ S2 customer → /dashboard/customers redirects to /dashboard/403
□ Unauthenticated → /dashboard/* redirects to /login?redirect=[path]
□ Session expiry: modal shown (not silent redirect)
□ Admin → all pages accessible
```

### DE-02 — Dashboard E2E Tests

**File:** `apps/web/e2e/dashboard.spec.ts`
**Priority:** 🟡 P1 | **Est:** 12h

```typescript
// Playwright tests:

test('Overview page renders with all 3 P10/P50/P90 chart bands', async ({ page }) => {
  await loginAs(page, 'S2_customer');
  await page.goto('/dashboard/overview');
  // Check all 3 Recharts Area elements rendered
  await expect(page.locator('[data-testid="chart-p10"]')).toBeVisible();
  await expect(page.locator('[data-testid="chart-p50"]')).toBeVisible();
  await expect(page.locator('[data-testid="chart-p90"]')).toBeVisible();
});

test('Accuracy page: gate fails → critical banner shown', async ({ page }) => {
  await loginAs(page, 'admin');
  // Simulate failed accuracy gate via Supabase test data
  await page.goto('/dashboard/accuracy');
  await expect(page.locator('[role="alert"]')).toBeVisible();
  await expect(page.locator('[role="alert"]')).toContainText('CRITICAL');
});

test('S1 customer: dashboard redirects to mobile-only', async ({ page }) => {
  await loginAs(page, 'S1_customer');
  await page.goto('/dashboard/overview');
  await expect(page).toHaveURL('/dashboard/mobile-only');
});

test('CSV export: download completes with correct filename', async ({ page }) => {
  await loginAs(page, 'S2_customer');
  await page.goto('/dashboard/price-intelligence?tab=download');
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.click('[data-testid="csv-download-btn"]'),
  ]);
  expect(download.suggestedFilename()).toMatch(/poultrypulse-predictions-\d{8}\.csv/);
});

test('Empty state: alerts feed shows illustration not blank', async ({ page }) => {
  await loginAs(page, 'S2_customer_no_alerts');
  await page.goto('/dashboard/alerts');
  await expect(page.locator('[role="status"]')).toBeVisible();
  await expect(page.locator('[role="status"]')).toContainText('सब ठीक है');
});
```

### DE-03 — Dashboard Accessibility Tests

**File:** `apps/web/__tests__/a11y/dashboard.test.ts`
**Priority:** 🟡 P1 | **Est:** 6h

```
Test cases:
□ Sidebar: all nav links have aria-current="page" on active
□ Charts: aria-label present on all ResponsiveContainer wrappers
□ Charts: hidden data table alternative present for screen readers
□ Tables: all th elements have scope="col"
□ Modals: focus trap works (Tab stays within modal)
□ Realtime alerts: aria-live="polite" fires on new alert
□ Accuracy critical banner: aria-live="assertive" fires on gate breach
□ Empty states: role="status" present
□ Error states: role="alert" present
□ All touch targets: ≥ 44×44px (check with axe-core)
```

---

## IMPLEMENTATION SEQUENCE (Dashboard Critical Path)

```
WEEK 1: Foundation
  Day 1–2: DA-01 (layout) → DA-02 (sidebar) → DA-03 (header)
  Day 3: DA-04 (Supabase utils) → DA-05 (chart config)
  Day 4: DA-06 (skeletons) → DA-07 (empty states) → DA-08 (error states)
  Day 5: DC-01 (public predictions API) → DC-03 (alert acknowledge)

WEEK 2: Core Pages
  Day 6–7: DB-01 (overview — largest page, 5 sub-components)
  Day 8: DB-05 (accuracy — mission-critical admin gate)
  Day 9: DB-03 (alerts + realtime)
  Day 10: DB-09 (403) → DB-10 (mobile-only)

WEEK 3: Functional Pages
  Day 11–12: DB-02 (price intelligence + chart + CSV download)
  Day 13: DB-04 (calculator — S2 access gate)
  Day 14: DB-06 (customers — admin gate)
  Day 15: DB-07 (settings — all 5 tabs)

WEEK 4: APIs + Realtime
  Day 16: DC-02 (CSV export streaming)
  Day 17: DC-04 → DC-05 (notification + plan update APIs)
  Day 18: DC-06 (retrain trigger) → DC-07 (account delete DPDP)
  Day 19: DD-01 (realtime alerts hook) → DD-02 (accuracy gate monitor)
  Day 20: DB-08 (API access page — P2)

WEEK 5: Testing
  Day 21–22: DE-01 (auth middleware tests)
  Day 23–24: DE-02 (E2E tests)
  Day 25: DE-03 (accessibility audit)
```

**P0 Launch Blockers (dashboard):**
- DA-01, DA-02, DA-03, DA-04, DA-05 (Foundation)
- DB-01 (Overview), DB-05 (Accuracy gate — mission-critical)
- DB-09 (403 page), DB-10 (Mobile-only page)
- DE-01 (Auth middleware tests — must pass before launch)
- DC-01 (Public predictions API — used on pre-login district pages too)

---

## TOTAL DASHBOARD TASK SUMMARY

| Group | Tasks | P0 | P1 | P2 | Total Hours |
|-------|-------|----|----|-----|------------|
| DA (Foundation) | 8 | 8 | 0 | 0 | ~34h |
| DB (Pages) | 10 | 4 | 5 | 1 | ~108h |
| DC (APIs) | 7 | 1 | 6 | 0 | ~24h |
| DD (Realtime) | 2 | 0 | 2 | 0 | ~6h |
| DE (Testing) | 3 | 1 | 2 | 0 | ~22h |
| **Total** | **30** | **14** | **15** | **1** | **~194h** |

---

*Document: 13_postlogin_tasks_master.md*
*PoultryPulse AI — Post-Login Dashboard Complete Task Specification*
*© 2026 PoultryPulse AI Technologies Pvt. Ltd. | CONFIDENTIAL*
