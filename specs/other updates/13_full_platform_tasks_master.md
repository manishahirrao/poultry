# PoultryPulse AI — Full Platform Tasks Master
# File: 13_full_platform_tasks_master.md
# Kiro Compatibility: ✅ Primary Kiro Task Execution File
# Version: v1.0 | May 2026 | CONFIDENTIAL
# Derived from: 06_content_seo_master.md · 07_motion_animation_master.md ·
#               08_external_assets_press_master.md · 09_kiro_implementation_manifest.md ·
#               10_auth_onboarding_design_master.md · 11_industry_pages_components_master.md ·
#               12_implementation_quick_reference.md

---

## AGENT CONTEXT BLOCK

```
ROLE: Lead Full-Stack Engineer — PoultryPulse AI Complete Platform
STACK: Next.js 15 App Router · TypeScript strict · Tailwind CSS v3 · Framer Motion ·
       Supabase SSR · Vercel Edge · Recharts · Zod · SWR · Twilio WhatsApp API
EXECUTION_MODEL: Parallel where dependency-free; sequential for dependent tasks
ACCURACY_GATE: Absolute P0 blocker — no customer-facing deployment until 95%+ confirmed
OUTPUT_FORMAT: Standard Kiro task JSON — file_path, purpose, dependencies, exports, code, qa_checks
NON_NEGOTIABLE: See §10 — violations trigger full stop
FOUNDATION_DOCS:
  01_prelogin_design_master.md      → Pre-login UI/UX visual spec
  02_prelogin_requirements_master.md → Functional requirements + SEO + DPDP
  03_prelogin_tasks_master.md       → Core pre-login task scaffolds
  06_content_seo_master.md          → SEO strategy + content briefs
  07_motion_animation_master.md     → Animation components + performance rules
  08_external_assets_press_master.md → Press + psychology + CRO + referral
  09_kiro_implementation_manifest.md → Monorepo structure + master task index
  10_auth_onboarding_design_master.md → Auth flows + 10-state onboarding
  11_industry_pages_components_master.md → S2–S6 pages + reusable components
  12_implementation_quick_reference.md → Kiro prompts + code patterns
```

---

## 1. TASK CONVENTIONS

### 1.1 Priority Legend

| Icon | Priority | Definition |
|------|----------|------------|
| 🔴 P0 | Launch Blocker | Must complete before any customer is onboarded |
| 🟡 P1 | Phase 0 Launch | Must complete within 2 weeks of first customer |
| 🟢 P2 | Phase 1 Target | Month 2–3 post-launch |
| ⚪ P3 | Backlog | Phase 2 or later |

### 1.2 Task JSON Format

Every code-producing task outputs in this format:

```json
{
  "file_path": "apps/web/relative/path.tsx",
  "purpose": "One-sentence description of what this file does",
  "dependencies": ["npm-package-1", "npm-package-2"],
  "exports": ["NamedExport1", "NamedExport2"],
  "code": "// Full implementation — no TODOs, no placeholders",
  "qa_checks": [
    "Hindi text renders without clipping at 16px",
    "CTA fires analytics event on click",
    "Reduced motion variant works"
  ]
}
```

### 1.3 Non-Negotiable Coding Rules (All Tasks)

```
RULE 1 — ACCURACY GATE:
  Never display live price data, signals, or accuracy numbers until
  NEXT_PUBLIC_ACCURACY_GATE_CLEARED=true. Show "(Demo)" label otherwise.

RULE 2 — NEVER BLANK:
  Skeleton → data OR skeleton → empty state. Never null, never undefined rendered.

RULE 3 — DPDP COMPLIANCE:
  No PII captured without explicit unchecked consent checkbox + purpose description.
  All PII stored in Supabase ap-south-1 (Mumbai). IPs hashed before storage.

RULE 4 — NO RAW ERRORS:
  No HTTP codes, stack traces, or English technical messages in UI.
  Always: Hindi human-friendly message + actionable recovery.

RULE 5 — P10/P50/P90 ALWAYS TOGETHER:
  No price chart may show P50 only. All three bands visible always.

RULE 6 — HINDI MINIMUM:
  All user-facing copy in Hindi (default) + English (toggle). No launch without
  Hindi copy reviewed by native UP speaker.

RULE 7 — REDUCED MOTION:
  Every animation respects @media (prefers-reduced-motion: reduce). No exceptions.

RULE 8 — MOBILE FIRST:
  Every component tested at 390px. Touch targets ≥ 44×44px. Text ≥ 14px.

RULE 9 — SERVICE ROLE KEY:
  SUPABASE_SERVICE_ROLE_KEY must never appear in 'use client' files.

RULE 10 — FAKE URGENCY BANNED:
  No countdown timers unless real. No "X people viewing" unless verified.
```

---

## 2. TASK GROUP F — FOUNDATION & MONOREPO

### F-01 — Turborepo Monorepo Setup 🔴 P0

```json
{
  "file_path": "package.json (root) + turbo.json + packages/* scaffolds",
  "purpose": "Initialise Turborepo monorepo with apps/web and packages/ui, packages/types, packages/config",
  "dependencies": ["turbo", "typescript"],
  "exports": [],
  "qa_checks": [
    "turbo build runs successfully from root",
    "packages/ui resolves from apps/web imports",
    "TypeScript strict mode on all packages"
  ]
}
```

**Directory skeleton to create:**
```
poultrypulse-ai/
├── apps/web/
├── packages/ui/src/
├── packages/types/src/
├── packages/config/eslint/ tailwind/ typescript/
├── turbo.json
└── package.json (workspaces: ["apps/*", "packages/*"])
```

---

### F-02 — Web Design Token Package 🔴 P0

**File:** `packages/ui/src/web-tokens.ts`

**Purpose:** Single source of truth for all design tokens used across the web app.

**Implementation spec:**

```typescript
// WebTokens — brand colours, gradients, surfaces
export const WebTokens = {
  brandGreen700:   '#1A6B3C',
  brandGreen500:   '#2E8653',
  brandGreen50:    '#E8F5EE',
  brandGreen25:    '#F4FAF6',
  saffronOrange:   '#E8621A',
  saffronLight:    '#FDF0E8',
  amber500:        '#F5A623',
  amberLight:      '#FEF8EC',
  red600:          '#C0392B',
  neutral900:      '#1C2B22',
  neutral700:      '#334D3E',
  neutral500:      '#5A7A68',
  neutral400:      '#7A9C8A',
  neutral200:      '#C8DDD2',
  neutral100:      '#EAF1ED',
  neutral50:       '#F7FAF8',
  white:           '#FFFFFF',
  heroGradient:    'linear-gradient(135deg, #1A6B3C 0%, #0F4A28 60%, #1C2B22 100%)',
  accentGradient:  'linear-gradient(90deg, #E8621A 0%, #F5A623 100%)',
  trustGradient:   'linear-gradient(180deg, #E8F5EE 0%, #FFFFFF 100%)',
} as const;

// DashboardTokens — post-login dashboard specific
export const DashboardTokens = {
  sidebarBg:       '#0F1E15',
  sidebarActive:   '#1A6B3C',
  sidebarHover:    'rgba(255,255,255,0.06)',
  sidebarText:     'rgba(255,255,255,0.70)',
  sidebarTextActive: '#FFFFFF',
  headerBg:        '#FFFFFF',
  headerBorder:    '#EAF1ED',
  contentBg:       '#F4FAF6',
  cardBg:          '#FFFFFF',
  tableRowHover:   '#F0F7F3',
  chartGreen:      '#1A6B3C',
  chartAmber:      '#F5A623',
  chartRed:        '#C0392B',
  chartBlue:       '#2563EB',
  statusSellNow:   '#166534',
  statusHold:      '#92400E',
  statusCaution:   '#991B1B',
} as const;

// WebTypography — fluid type scale (all values clamp-based)
export const WebTypography = {
  displayHero:  { fontFamily: "'Sora','Plus Jakarta Sans',system-ui", fontSize: 'clamp(2.5rem,5vw+1rem,4.5rem)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.03em' },
  displayLarge: { fontFamily: "'Sora','Plus Jakarta Sans',system-ui", fontSize: 'clamp(2rem,3.5vw+0.75rem,3.5rem)', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.025em' },
  heading1:     { fontFamily: "'Plus Jakarta Sans','Sora',system-ui", fontSize: 'clamp(1.75rem,2.5vw+0.5rem,2.75rem)', fontWeight: 700, lineHeight: 1.2 },
  heading2:     { fontFamily: "'Plus Jakarta Sans',system-ui", fontSize: 'clamp(1.375rem,1.5vw+0.5rem,2rem)', fontWeight: 600, lineHeight: 1.3 },
  heading3:     { fontFamily: "'Plus Jakarta Sans',system-ui", fontSize: 'clamp(1.125rem,1vw+0.5rem,1.5rem)', fontWeight: 600, lineHeight: 1.35 },
  hindiDisplay: { fontFamily: "'Noto Sans Devanagari',sans-serif", fontSize: 'clamp(1.25rem,2vw+0.5rem,2rem)', fontWeight: 700, lineHeight: 1.4 },
  hindiBody:    { fontFamily: "'Noto Sans Devanagari',sans-serif", fontSize: 'clamp(1rem,1vw+0.25rem,1.25rem)', fontWeight: 400, lineHeight: 1.6 },
  bodyLarge:    { fontFamily: "'Plus Jakarta Sans',system-ui", fontSize: 'clamp(1.0625rem,0.5vw+0.875rem,1.25rem)', fontWeight: 400, lineHeight: 1.7, maxWidth: '65ch' },
  bodyBase:     { fontFamily: "'Plus Jakarta Sans',system-ui", fontSize: '1rem', fontWeight: 400, lineHeight: 1.6 },
  eyebrow:      { fontFamily: "'Plus Jakarta Sans',system-ui", fontSize: '0.6875rem', fontWeight: 600, lineHeight: 1.0, letterSpacing: '0.15em', textTransform: 'uppercase' as const },
  priceHero:    { fontFamily: "'Sora',system-ui", fontSize: 'clamp(3rem,6vw,5rem)', fontWeight: 800, lineHeight: 1.0, fontVariantNumeric: 'tabular-nums' },
  statNumber:   { fontFamily: "'Sora',system-ui", fontSize: 'clamp(2rem,3.5vw,3rem)', fontWeight: 800, lineHeight: 1.0, fontVariantNumeric: 'tabular-nums' },
} as const;

// WebSpacing — macro rhythm + component sizing
export const WebSpacing = {
  sectionVertical:  'clamp(5rem,8vw,8rem)',
  sectionSmall:     'clamp(3rem,5vw,5rem)',
  containerMax:     '1280px',
  containerPadding: 'clamp(1rem,4vw,3rem)',
  cardPadding:      '2rem',
  cardPaddingLg:    '2.5rem',
  cardGap:          '1.5rem',
  buttonHeight:     '52px',
  buttonHeightLg:   '60px',
  inputHeight:      '52px',
} as const;

// WebMotion — easing + duration tokens
export const WebMotion = {
  easeOutQuart:  'cubic-bezier(0.25, 1, 0.5, 1)',
  easeOutExpo:   'cubic-bezier(0.16, 1, 0.3, 1)',
  easeOutQuint:  'cubic-bezier(0.22, 1, 0.36, 1)',
  instant:       '100ms',
  quick:         '200ms',
  standard:      '300ms',
  enter:         '500ms',
  elaborate:     '800ms',
  springSnappy:  { type: 'spring', stiffness: 400, damping: 30 },
  springSmooth:  { type: 'spring', stiffness: 200, damping: 25 },
  springHeavy:   { type: 'spring', stiffness: 100, damping: 20 },
} as const;

export default { WebTokens, DashboardTokens, WebTypography, WebSpacing, WebMotion };
```

**QA Checks:**
- [ ] All colour values render correctly in Tailwind via CSS variables
- [ ] TypeScript `as const` prevents any mutation
- [ ] `packages/ui` resolves correctly from `apps/web` imports via workspace alias

---

### F-03 — Database Types Package 🔴 P0

**File:** `packages/types/src/database.ts`

**Purpose:** Shared Supabase-generated TypeScript types for all tables and views.

**Tables to type:**
```typescript
export interface Database {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string;
          phone: string;
          plan: 'PULSE_FARM' | 'PULSE_PRO' | 'PULSE_INTEL' | null;
          plan_locked_at: string | null;
          segment: 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'S6';
          district: string | null;
          flock_range: string | null;
          batches_per_year: number | null;
          farm_type: 'independent' | 'integrator' | null;
          trial_ends_at: string | null;
          trial_duration_days: 14 | 30;
          whatsapp_verified: boolean;
          referral_code: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['customers']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['customers']['Insert']>;
      };
      leads: {
        Row: {
          id: string;
          phone: string;
          source: string;
          district: string | null;
          plan: string | null;
          consent_given: boolean;
          utm_source: string | null;
          utm_medium: string | null;
          utm_campaign: string | null;
          ip_hash: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      predictions: {
        Row: {
          id: string;
          mandi: string;
          predicted_at: string;
          prediction_date: string;
          p10: number;
          p50: number;
          p90: number;
          sell_signal: 'SELL_NOW' | 'HOLD' | 'CAUTION';
          confidence: number;
          model_version: string;
          is_demo: boolean;
          created_at: string;
        };
      };
      alerts: {
        Row: {
          id: string;
          type: 'HPAI' | 'WEATHER' | 'PRICE' | 'POLICY';
          severity: 'HIGH' | 'MEDIUM' | 'LOW';
          districts: string[];
          title_hi: string;
          title_en: string;
          body_hi: string;
          body_en: string;
          source_url: string | null;
          expires_at: string | null;
          created_at: string;
        };
      };
      referral_codes: {
        Row: {
          id: string;
          customer_id: string;
          code: string;
          uses_count: number;
          created_at: string;
        };
      };
      referral_credits: {
        Row: {
          id: string;
          referrer_id: string;
          referred_id: string;
          amount: number;
          status: 'PENDING' | 'CREDITED' | 'EXPIRED';
          created_at: string;
        };
      };
      customer_onboarding_state: {
        Row: {
          customer_id: string;
          current_step: string;
          completed_steps: string[];
          district: string | null;
          flock_range: string | null;
          batches_per_year: number | null;
          farm_type: string | null;
          plan_confirmed: string | null;
          plan_locked_at: string | null;
          whatsapp_verified: boolean;
          app_downloaded: boolean;
          referral_source: string | null;
          referral_code: string | null;
          trial_duration_days: number;
          started_at: string;
          completed_at: string | null;
        };
      };
    };
    Views: {
      mv_accuracy_dashboard: {
        Row: {
          directional_accuracy: number;
          directional_accuracy_30d: number;
          mape: number;
          conformal_coverage: number;
          model_version: string;
          gate_status: 'PASS' | 'FAIL' | 'PENDING';
          last_computed: string;
        };
      };
    };
  };
}
```

**QA Checks:**
- [ ] All table Row types match actual Supabase schema
- [ ] View types match mv_accuracy_dashboard columns
- [ ] Insert/Update helpers prevent illegal field overrides

---

### F-04 — Tailwind Config Extension 🔴 P0

**File:** `apps/web/tailwind.config.ts`

**Full config spec:**

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brandGreen: {
          700: '#1A6B3C', 600: '#1E7D44', 500: '#2E8653',
          300: '#7CC49A', 100: '#C8DDD2', 50: '#E8F5EE', 25: '#F4FAF6',
        },
        saffron:   { DEFAULT: '#E8621A', light: '#FDF0E8' },
        amber500:  '#F5A623',
        neutral:   {
          900: '#1C2B22', 700: '#334D3E', 500: '#5A7A68',
          400: '#7A9C8A', 200: '#C8DDD2', 100: '#EAF1ED', 50: '#F7FAF8',
        },
        dashboard: {
          sidebar:  '#0F1E15',
          content:  '#F4FAF6',
          header:   '#FFFFFF',
        },
      },
      fontFamily: {
        sora:       ['var(--font-sora)', 'system-ui'],
        jakarta:    ['var(--font-jakarta)', 'system-ui'],
        devanagari: ['var(--font-devanagari)', 'sans-serif'],
      },
      animation: {
        'fade-up':     'fade-up 0.7s cubic-bezier(0.16,1,0.3,1) both',
        'fade-in':     'fade-in 0.5s ease-out both',
        'shimmer':     'shimmer 1.5s ease-in-out infinite',
        'price-pulse': 'price-pulse 1s ease-out 1',
        'alert-enter': 'alert-enter 0.4s cubic-bezier(0.25,1,0.5,1) forwards',
        'form-shake':  'shake 0.4s ease-in-out 1',
        'float':       'float 3s ease-in-out infinite',
      },
      keyframes: {
        'fade-up':     { '0%': { opacity:'0', transform:'translateY(24px)', filter:'blur(4px)' }, '100%': { opacity:'1', transform:'translateY(0)', filter:'blur(0)' } },
        'fade-in':     { '0%': { opacity:'0' }, '100%': { opacity:'1' } },
        'shimmer':     { '0%': { backgroundPosition:'-200% 0' }, '100%': { backgroundPosition:'200% 0' } },
        'price-pulse': { '0%': { boxShadow:'0 0 0 0 rgba(26,107,60,0.4)' }, '70%': { boxShadow:'0 0 0 8px rgba(26,107,60,0)' }, '100%': { boxShadow:'0 0 0 0 rgba(26,107,60,0)' } },
        'alert-enter': { from:{ transform:'translateX(calc(100% + 1rem))', opacity:'0' }, to:{ transform:'translateX(0)', opacity:'1' } },
        'shake':       { '0%,100%': { transform:'translateX(0)' }, '20%,60%': { transform:'translateX(-6px)' }, '40%,80%': { transform:'translateX(6px)' } },
        'float':       { '0%,100%': { transform:'translateY(0)' }, '50%': { transform:'translateY(-8px)' } },
      },
      transitionTimingFunction: {
        'out-expo':  'cubic-bezier(0.16, 1, 0.3, 1)',
        'out-quart': 'cubic-bezier(0.25, 1, 0.5, 1)',
        'out-quint': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
    },
  },
  plugins: [],
};

export default config;
```

**QA Checks:**
- [ ] All custom colour classes generate correctly (e.g., `bg-brandGreen-700`)
- [ ] Custom animations apply via Tailwind class names
- [ ] Font family variables resolve from `next/font` CSS vars

---

### F-05 — CSS Animation Files 🔴 P0

**Files:** `apps/web/styles/animations.css` + `apps/web/styles/reduced-motion.css`

**`animations.css` — keyframes + utility classes:**
```css
/* Shimmer skeleton */
.skeleton-shimmer {
  background: linear-gradient(90deg, #f0f4f1 0%, #e0ede5 50%, #f0f4f1 100%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}

/* Price update pulse — triggered via JS on data refresh */
.price-update-pulse { animation: price-pulse 1s ease-out 1; }

/* Alert variants */
.alert-enter   { animation: alert-slide-in 0.4s cubic-bezier(0.25,1,0.5,1) forwards; }
.alert-critical { animation: alert-slide-in 0.4s cubic-bezier(0.25,1,0.5,1) forwards,
                              alert-attention 0.5s ease-in-out 0.5s 1; }

/* Form error shake */
.input-error-shake { animation: shake 0.4s ease-in-out 1; border-color: #C0392B !important; }

/* Hero word reveal (Latin only — Devanagari uses .hero-word-devanagari) */
.hero-word           { display: inline-block; animation: word-reveal 0.6s cubic-bezier(0.16,1,0.3,1) both; }
.hero-word-devanagari { animation: fade-only 0.7s ease-out both; }

/* CSS scroll-driven progress bar */
@supports (animation-timeline: scroll()) {
  .scroll-progress-bar {
    animation: scroll-progress linear;
    animation-timeline: scroll();
    animation-range: 0% 100%;
  }
  @keyframes scroll-progress { from { transform: scaleX(0); } to { transform: scaleX(1); } }
}
```

**`reduced-motion.css` — comprehensive motion kill switch:**
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 1ms !important;
    animation-delay: 1ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 1ms !important;
    transition-delay: 1ms !important;
    scroll-behavior: auto !important;
  }
  .skeleton-shimmer         { background: #e0ede5 !important; animation: none !important; }
  .scroll-progress-bar      { animation: none !important; }
  .price-ticker-animated    { animation: none !important; }
  [data-framer-motion]      { transform: none !important; opacity: 1 !important; filter: none !important; }
}
```

**QA Checks:**
- [ ] `prefers-reduced-motion` disables ALL custom animations
- [ ] `skeleton-shimmer` renders as static grey under reduced motion
- [ ] Scroll-driven progress bar has `@supports` feature detection

---

### F-06 — Supabase Client Setup (SSR) 🔴 P0

**Files:** `apps/web/utils/supabase/server.ts` + `client.ts` + `dashboard.ts`

**`server.ts` (RSC / Server Actions):**
```typescript
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@repo/types';

export function createClient() {
  const cookieStore = cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options));
        },
      },
    }
  );
}
```

**`dashboard.ts` — typed query helpers for dashboard pages:**
```typescript
// getLatestPredictions(mandis: string[]): Promise<PredictionData[]>
// getAccuracyMetrics(): Promise<AccuracyMetrics>
// getActiveAlerts(district?: string): Promise<Alert[]>
// getCustomerProfile(customerId: string): Promise<CustomerProfile>
// All functions: explicit return types, error handled with fallback
```

**QA Checks:**
- [ ] Server client never leaks `service_role` key into client bundle
- [ ] Client component client uses `anon` key only (RLS protected)
- [ ] All query helpers have typed return values matching `Database` types

---

### F-07 — Auth Middleware 🔴 P0

**File:** `apps/web/middleware.ts`

**Responsibilities:**
1. Supabase session refresh on every request
2. Auth guard: redirect unauthenticated users away from `/dashboard/*` and `/onboarding`
3. Segment guard: redirect S1 customers from `/dashboard/overview` → `/dashboard/mobile-only`
4. UTM parameter capture: persist UTM params in `sessionStorage` cookie on first visit
5. Language preference: read `Accept-Language` header if no `pp-locale` cookie, set `hi` default

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  // 1. Supabase session management
  // 2. Protected route checks
  // 3. UTM propagation
  // 4. Language defaults
  // Full implementation — no auth bypass possible
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/og).*)'],
};
```

**QA Checks:**
- [ ] Unauthenticated request to `/dashboard/overview` → `302 /login?redirect=/dashboard/overview`
- [ ] S1 customer at `/dashboard/overview` → `302 /dashboard/mobile-only`
- [ ] UTM params from first landing page persist across /signup flow
- [ ] Hindi default set when no locale cookie and Accept-Language header has no `en`

---

### F-08 — Environment Variables 🔴 P0

**File:** `apps/web/.env.example`

```bash
# Supabase (ap-south-1 Mumbai — DPDP requirement)
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]        # safe to expose — RLS protected
SUPABASE_SERVICE_ROLE_KEY=[service-key]          # NEVER in 'use client' files

# Twilio WhatsApp Business API
TWILIO_ACCOUNT_SID=[sid]
TWILIO_AUTH_TOKEN=[token]
TWILIO_WHATSAPP_NUMBER=whatsapp:+91XXXXXXXXXX

# Application
NEXT_PUBLIC_APP_URL=https://poultrypulse.ai
NEXT_PUBLIC_APP_VERSION=0.1.0

# Feature flags
NEXT_PUBLIC_ACCURACY_GATE_CLEARED=false   # Set true ONLY when model ≥ 95%
NEXT_PUBLIC_PHASE=0                        # 0, 1, or 2

# Analytics
NEXT_PUBLIC_ANALYTICS_ENABLED=true
```

---

## 3. TASK GROUP M — MOTION & ANIMATION COMPONENTS

### M-01 — FadeUp Component 🔴 P0

**File:** `apps/web/components/motion/FadeUp.tsx`

**Purpose:** Primary scroll-triggered entrance animation for all page sections.

**Implementation:** Full component as specified in `07_motion_animation_master.md §2.1`

**Key specs:**
- Uses `useInView` from Framer Motion with `margin: '-10% 0px'` and `once: true`
- Props: `delay`, `duration`, `distance`, `blur`, `once`, `className`
- Default: opacity 0 + translateY 24px + blur 4px → animate in with `easeOutExpo`
- `prefers-reduced-motion`: instantly shows final state (no animation)

**QA Checks:**
- [ ] Animation triggers when element enters viewport at 10% threshold
- [ ] Does not re-trigger on scroll up (`once: true`)
- [ ] Under reduced motion: element immediately visible, no FOUC
- [ ] Hindi/Devanagari text inside FadeUp: use `blur=false` to avoid Devanagari rendering issues

---

### M-02 — StaggerGroup Component 🔴 P0

**File:** `apps/web/components/motion/StaggerGroup.tsx`

**Purpose:** Staggered entrance for lists of sibling elements (cards, features, stats).

**Key specs:**
- Props: `staggerDelay` (default 0.08s), `initialDelay`, `distance`, `className`
- Max effective stagger: 5 children at 0.08s; for 6+ reduce to 0.04s automatically
- `children`: handles both arrays and single child correctly
- Under reduced motion: `staggerDelay: 0`, all children appear instantly

**QA Checks:**
- [ ] 3 pain-point cards stagger correctly at 0, 80, 160ms
- [ ] Single child renders without errors (no array access on non-array)
- [ ] Reduced motion: all children visible immediately with no delay

---

### M-03 — CountUp Component 🔴 P0

**File:** `apps/web/components/motion/CountUp.tsx`

**Purpose:** Animated number counter with Indian currency formatting and reduced-motion support.

**Key specs — full implementation from `07_motion_animation_master.md §2.3`:**
- `easeOutExpo` easing via `requestAnimationFrame`
- Props: `end`, `duration` (1500ms), `decimals`, `prefix`, `suffix`, `useIndianFormat`, `locale`
- `useIndianFormat: true`: routes through `formatIndian()` — lakhs/crores in Hindi or English
- `aria-label` always set to final value (screen readers read correct number regardless of animation)
- Reduced motion: `setValue(end)` immediately, no RAF loop

**QA Checks:**
- [ ] `95.2` renders as "95.2%" with correct decimal on accuracy cards
- [ ] `1240000` with `useIndianFormat` + `locale='hi'` renders "₹12.4 लाख"
- [ ] `aria-label` shows final value not animated value
- [ ] Reduced motion: final value shown on mount with no transition

---

### M-04 — PriceTickerMockup (Hero Phone) 🔴 P0

**File:** `apps/web/components/motion/PriceTickerMockup.tsx`

**Purpose:** Animated phone mockup in hero section cycling through 3 price signal states.

**Key specs — full implementation from `07_motion_animation_master.md §2.4`:**
- 3 `TickerState` objects: SELL_NOW (green), HOLD (amber), CAUTION (red)
- `AnimatePresence mode="wait"` — exit before enter prevents double-render
- `setInterval` 3000ms; cleanup on unmount
- Phone shell: `perspective: 1000px, rotateY: -5deg, rotateX: 2deg` subtle 3D tilt
- Floating WhatsApp badge: `animate={{ y: [0, -4, 0] }}` float loop (3s)
- Reduced motion: static first state, no cycling, no float animation
- `role="img"` + `aria-label` on phone container

**QA Checks:**
- [ ] States cycle correctly: sell → hold → caution → sell
- [ ] Cross-dissolve at 400ms with no layout shift
- [ ] Reduced motion: first state (SELL_NOW) shown statically
- [ ] Floating badge animation paused under reduced motion
- [ ] 60fps on mid-range Android (Snapdragon 665) — test in Chrome DevTools CPU throttle 4×

---

### M-05 — StickyScrollSteps 🟡 P1

**File:** `apps/web/components/motion/StickyScrollSteps.tsx`

**Purpose:** Sticky scroll stack for "How It Works" section — content changes as user scrolls past each step.

**Key specs — full implementation from `07_motion_animation_master.md §2.5`:**
- Container height: `steps.length × 100vh`
- Inner: `position: sticky, top: 0, height: 100vh`
- `useScroll` tracks progress; `scrollYProgress` subdivided by step count
- Step indicator: 3 pills — completed (short green), active (long green), upcoming (grey)
- Step content transitions: `AnimatePresence mode="wait"` on title + body
- Visual slot: `motion.div` with `scale + opacity + blur` transition
- Reduced motion: all steps visible in static linear layout (not sticky)

**QA Checks:**
- [ ] Step changes correctly at 33.3% and 66.6% scroll progress for 3 steps
- [ ] Reduced motion: linear stacked layout (no sticky behaviour)
- [ ] Step indicator pills update correctly with active/completed styles
- [ ] Content transitions use `mode="wait"` to prevent overlap

---

### M-06 — DataFlowTicker 🟡 P1

**File:** `apps/web/components/motion/DataFlowTicker.tsx`

**Purpose:** Animated data source feed for "How It Works — Step 1" visual.

**Key specs — full implementation from `07_motion_animation_master.md §2.7`:**
- Shows 4 data sources at a time, cycling through 7 total at 1.2s interval
- Sources: AGMARKNET, NECC, IMD Weather, Maize APM, Gorakhpur APMC, Deoria Mandi, Soybean MCX
- Direction icons: ↑ (emerald), ↓ (red), → (amber)
- Dark terminal aesthetic: `bg-neutral-900`, green "LIVE DATA FEED — 4:30 AM" header
- Pulse dot: `animate-pulse` on live indicator dot

**QA Checks:**
- [ ] 4 items visible at all times; cycles smoothly without jump
- [ ] Reduced motion: static list of first 4 sources, no cycling
- [ ] All 7 source names render correctly in Hindi

---

### M-07 — ScrollProgress Component 🟢 P2

**File:** `apps/web/components/motion/ScrollProgress.tsx`

**Purpose:** CSS scroll-driven reading progress bar for blog posts.

**Key specs:**
- CSS `animation-timeline: scroll()` (zero JS overhead)
- `@supports` feature detection — JS fallback for Firefox via `scroll` event
- `role="progressbar"` with `aria-label="Reading progress"`
- Fixed top bar, height `h-1`, `brandGreen700` background
- `origin-left` + `scaleX` transform for progress indication

**QA Checks:**
- [ ] Renders in Chrome/Safari via CSS scroll-driven API
- [ ] Firefox fallback: JS-based `scaleX` update on scroll event
- [ ] Hidden on non-blog pages (component only used in blog post layout)
- [ ] Reduced motion: bar hidden entirely

---

### M-08 — Reduced Motion Hook 🔴 P0

**File:** `apps/web/hooks/useReducedMotion.ts`

**Purpose:** Unified hook providing motion configuration based on user system preference.

```typescript
import { useReducedMotion as useFramerReducedMotion } from 'framer-motion';

export function useMotionConfig() {
  const shouldReduce = useFramerReducedMotion();
  return {
    fadeUp: shouldReduce ? { initial: { opacity: 1, y: 0 }, animate: { opacity: 1, y: 0 } } : undefined,
    countUpDuration: shouldReduce ? 0 : 1500,
    transition: shouldReduce ? { duration: 0, delay: 0 } : undefined,
    staggerDelay: shouldReduce ? 0 : 0.08,
    shouldAnimate: !shouldReduce,
  };
}
```

**QA Checks:**
- [ ] Returns `shouldAnimate: false` when system preference is set
- [ ] `countUpDuration: 0` causes CountUp to show final value immediately
- [ ] Hook reads live system preference (re-renders if user changes preference)

---

### M-09 — Illustration System (Pullu SVG Characters) 🟡 P1

**Files:** `apps/web/components/illustrations/` directory

**Characters to create as inline SVG components:**
- `HappyPullu.tsx` — success states, testimonials
- `ThinkingPullu.tsx` — loading/validating states
- `AlertPullu.tsx` — warning states
- `ContentPullu.tsx` — empty state (no alerts)
- `ConfusedPullu.tsx` — 404 / error states
- `PointingPullu.tsx` — onboarding tips
- `CelebratingPullu.tsx` — conversion success + confetti

**Design system from `07_motion_animation_master.md §5.1`:**
- Rounded shapes, no sharp edges, 2–3 colour fills
- Brand palette: green body, saffron beak accent
- `aria-hidden="true"` always (adjacent text provides context)
- SVG format, inline (no network request, CSS colourable)
- Sizes: 40px (loading), 80px (success modal), 120px (empty state), 180px (404)

**QA Checks:**
- [ ] All 7 SVG characters render without distortion at each target size
- [ ] `CelebratingPullu` confetti animation respects `prefers-reduced-motion`
- [ ] No external image requests — all inline SVG
- [ ] Color fills use CSS variables so dark mode is possible later

---

## 4. TASK GROUP UI — SHARED UI COMPONENTS

### UI-01 — Button Component 🔴 P0

**File:** `apps/web/components/ui/Button.tsx`

**Full implementation from `11_industry_pages_components_master.md §5.1`**

**Variants:** `primary` | `secondary` | `ghost` | `cta` | `destructive`
**Sizes:** `sm` (h-9) | `md` (h-[52px]) | `lg` (h-[60px])

**Critical specs:**
- `trailingArrow`: nested `motion.span` with `whileHover={{ x: 2 }}`
- Loading: spinner inside button, NOT full-page overlay
- `href` prop: renders as `<Link>` component (not `<a>`)
- `forwardRef` for form integration
- `whileHover: scale(1.01)`, `whileTap: scale(0.98)` via Framer Motion
- Focus ring: `focus-visible:ring-2 focus-visible:ring-brandGreen-500`
- Disabled: `opacity-50 cursor-not-allowed` (no hover/tap effects)

**QA Checks:**
- [ ] `href` renders as Next.js `<Link>` not `<a>` (important for prefetch)
- [ ] Loading state: spinner visible, button disabled, `aria-busy="true"`
- [ ] Trailing arrow moves 4px right on hover
- [ ] All variants pass AA contrast ratio

---

### UI-02 — Card Component (Double-Bezel) 🔴 P0

**File:** `apps/web/components/ui/Card.tsx`

**Full implementation from `11_industry_pages_components_master.md §5.2`**

**Architecture:** Two nested `div`s — outer shell + inner core
- Outer: `rounded-[2rem]` + variant background + optional padding
- Inner: `rounded-[calc(2rem-0.375rem)]` for inset bezel effect
- Variants: `default` | `elevated` | `glass` | `tinted` | `dark`
- `hover` prop: `hover:-translate-y-0.5 hover:shadow-green`
- `as` prop: supports `div` | `article` | `section` | `li`

**QA Checks:**
- [ ] Double-bezel visible with correct radius difference on `elevated` variant
- [ ] `glass` variant: backdrop-blur renders correctly in supported browsers
- [ ] `hover` lift: 2px translateY, shadow increases, 250ms `easeOutQuart`
- [ ] `as="article"` renders semantic HTML for case study cards

---

### UI-03 — Section Wrapper 🔴 P0

**File:** `apps/web/components/ui/Section.tsx`

**Purpose:** Consistent vertical rhythm + container width across all page sections.

**Full implementation from `11_industry_pages_components_master.md §5.3`**

- `background` prop: `white` | `tinted` | `dark` | `gradient`
- `size` prop: `sm` (py-12→20) | `md` (py-16→24) | `lg` (py-20→32)
- Container: `max-w-[1280px] px-4 sm:px-6 lg:px-8 xl:px-12`
- `as` prop: `section` | `div` | `article`

**QA Checks:**
- [ ] Container never exceeds 1280px on large screens
- [ ] `dark` background has white text applied via inherited CSS
- [ ] Section padding is clamp-based (not fixed) — verify at 320px, 768px, 1440px

---

### UI-04 — EyebrowBadge 🔴 P0

**File:** `apps/web/components/ui/EyebrowBadge.tsx`

```typescript
interface EyebrowBadgeProps {
  text: string;
  variant?: 'default' | 'white' | 'saffron';
  icon?: React.ReactNode;
}
// Pill shape, uppercase, tracking-widest, 11px
// default: brandGreen50 bg, brandGreen700 text
// white: white/20 bg, white text (for use on dark bg hero)
// saffron: saffronLight bg, saffronOrange text
```

**QA Checks:**
- [ ] `white` variant passes WCAG AA on `heroGradient` background
- [ ] Text never wraps — always single line (add `whitespace-nowrap`)
- [ ] Optional icon aligns correctly with text baseline

---

### UI-05 — StatBlock 🔴 P0

**File:** `apps/web/components/ui/StatBlock.tsx`

```typescript
interface StatBlockProps {
  value: number | string;
  label: string;
  labelHi: string;
  prefix?: string;
  suffix?: string;
  sub?: string;
  subHi?: string;
  animate?: boolean;        // triggers CountUp, default true
  colourVariant?: 'green' | 'amber' | 'red' | 'neutral';
  accuracy?: number;        // if set, auto-colours: ≥95 green, 90-95 amber, <90 red
}
```

- Stat value: `priceHero` or `statNumber` typography token
- Label: `eyebrow` token, neutral-500
- Optional `CountUp` integration when `animate: true`
- Left border `3px` with colour variant

**QA Checks:**
- [ ] `accuracy={94.8}` auto-applies amber colour
- [ ] `accuracy={95.2}` auto-applies green colour
- [ ] Reduced motion: final value shown without counter animation

---

### UI-06 — Language Toggle 🔴 P0

**File:** `apps/web/components/ui/LanguageToggle.tsx`

**Purpose:** Switch between Hindi (`hi`) and English (`en`) without page reload.

```typescript
// Stores preference in: localStorage + cookie ('pp-locale') for SSR hydration
// Context: useLanguage() hook from LanguageProvider
// UI: "हिंदी | English" segmented button
// Active locale: bold weight, brandGreen700 colour
// Transition: 200ms colour change
```

**QA Checks:**
- [ ] Toggle switches content language without full page reload
- [ ] Cookie set with `SameSite=Lax; Path=/; Max-Age=31536000`
- [ ] Server renders Hindi by default when no cookie present
- [ ] On toggle: `<html lang>` attribute updates to `hi` or `en`

---

### UI-07 — WhatsApp Share Button 🟡 P1

**File:** `apps/web/components/ui/WhatsAppShare.tsx`

```typescript
interface WhatsAppShareProps {
  message: string;           // pre-composed message
  label?: string;            // button label (default: "WhatsApp पर Share करें")
  className?: string;
  trackingEvent?: string;    // analytics event name
}
// Deep link: https://wa.me/?text=encodeURIComponent(message)
// Opens in new tab on desktop, WhatsApp app on mobile
// WhatsApp green (#25D366), white text
// Fire trackingEvent on click via trackEvent()
```

---

### UI-08 — Price Display Component 🟡 P1

**File:** `apps/web/components/ui/PriceDisplay.tsx`

```typescript
interface PriceDisplayProps {
  p10: number;
  p50: number;
  p90: number;
  signal: 'SELL_NOW' | 'HOLD' | 'CAUTION';
  mandi: string;
  predictedAt: string;
  isDemo?: boolean;
  isStale?: boolean;         // true if predictedAt > 24h ago
  compact?: boolean;
}
// Main price: p50 in priceHero typography (Sora, 800 weight)
// Band: "₹P10 – ₹P90/kg" in smaller text
// Signal badge: colour-coded pill
// Stale indicator: amber warning icon + "डेटा पुराना है" if isStale
// aria-label: "₹{p50} per kilogram, {signalLabel} signal"
```

**QA Checks:**
- [ ] `isStale: true` shows amber warning, does not hide price
- [ ] `isDemo: true` appends "(Demo)" to signal badge
- [ ] All three bands always visible (never omit P10 or P90)

---

### UI-09 — Analytics Event Tracker 🔴 P0

**File:** `apps/web/lib/analytics.ts`

**Full implementation:**
```typescript
type TrackingEvent =
  | 'hero_cta_click'   | 'demo_modal_open'   | 'exit_popup_shown'
  | 'exit_popup_converted' | 'lead_submitted' | 'signup_started'
  | 'signup_completed' | 'otp_requested'     | 'otp_verified'
  | 'onboarding_started' | 'onboarding_completed' | 'plan_confirmed'
  | 'trial_started'    | 'whatsapp_verified' | 'app_download_initiated'
  | 'language_toggled' | 'pricing_viewed'    | 'referral_shared';

export function trackEvent(
  event: TrackingEvent,
  properties?: Record<string, string | number | boolean | null>
): void {
  if (typeof window === 'undefined') return; // SSR safe

  // Auto-attach standard properties
  const enriched = {
    ...properties,
    page_path: window.location.pathname,
    device_type: window.innerWidth < 768 ? 'mobile' : 'desktop',
    locale: localStorage.getItem('pp-locale') ?? 'hi',
    // UTM from sessionStorage (set by middleware)
    utm_source: sessionStorage.getItem('utm_source'),
    utm_medium: sessionStorage.getItem('utm_medium'),
    utm_campaign: sessionStorage.getItem('utm_campaign'),
  };

  // Fire to Vercel Analytics (automatic from @vercel/analytics)
  // Fire to Supabase events table (async, non-blocking)
  queueMicrotask(async () => {
    try {
      await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, properties: enriched }),
        keepalive: true,   // survives page unload
      });
    } catch { /* silent fail — never block user */ }
  });
}
```

**QA Checks:**
- [ ] Server-safe: no-op if `window` is undefined
- [ ] Never `await` in component code — fire-and-forget
- [ ] UTM params attached automatically from sessionStorage
- [ ] `keepalive: true` on fetch — fires even during page navigation

---

### UI-10 — Indian Currency Formatter 🔴 P0

**File:** `apps/web/lib/formatCurrency.ts`

**Full implementation from `11_industry_pages_components_master.md §5.4`**

```typescript
// formatINR(amount, {locale, compact}):
//   50000    → "₹50,000"
//   150000   → hi: "₹1.5 लाख" | en: "₹1.5 L"
//   1200000  → hi: "₹12 लाख"  | en: "₹12 L"
//   10000000 → hi: "₹1 करोड़" | en: "₹1 Cr"
//
// formatKgPrice(price): "₹168/kg"
// formatPriceBand(p10, p90): "₹161–₹175/kg"
// formatLossCalc(birds, batches, locale): annual loss estimate
// formatROI(potentialLoss, planCost): "₹8" (per ₹1 invested)
```

**QA Checks:**
- [ ] `formatINR(99999, {compact:true, locale:'hi'})` → "₹99,999" (below lakh threshold)
- [ ] `formatINR(100000, {compact:true, locale:'hi'})` → "₹1 लाख"
- [ ] `formatINR(10000000, {compact:true, locale:'en'})` → "₹1 Cr"
- [ ] No space between "₹" and number

---

## 5. TASK GROUP G — SEO COMPONENTS

### G-01 — Base Metadata Factory 🔴 P0

**File:** `apps/web/lib/seo/metadata.ts`

```typescript
import { Metadata } from 'next';

interface PageMetadataInput {
  title?: string;
  description?: string;
  ogImage?: string;
  canonical?: string;
  noIndex?: boolean;
  keywords?: string[];
}

export function generatePageMetadata(input: PageMetadataInput = {}): Metadata {
  // Returns full Metadata object with all OG, Twitter, robots fields
  // title template: '%s | PoultryPulse AI'
  // default OG: /og/homepage.jpg
  // canonical: always set (prevents duplicate content issues)
}
```

Per-page metadata values from `06_content_seo_master.md §2.2` (full table of titles, descriptions, H1 keywords for all 17 pages).

**QA Checks:**
- [ ] Title template applied correctly: "Pricing | PoultryPulse AI" not "PoultryPulse AI | Pricing"
- [ ] Canonical URL always absolute (not relative)
- [ ] `og:locale` set to `hi_IN` for Hindi pages, `en_IN` for English

---

### G-02 — JSON-LD Schema Library 🔴 P0

**File:** `apps/web/lib/schemas/index.ts`

**All schemas from `06_content_seo_master.md §3.3` and `09_kiro_implementation_manifest.md`:**

```typescript
// generateOrganizationSchema(): JSON-LD object — used in root layout
// generateWebSiteSchema(): JSON-LD with SearchAction — used in root layout
// generateFAQSchema(faqs: {question:string, answer:string}[]): FAQPage schema
// generateHowToSchema(steps: {name:string, text:string}[]): HowTo schema
// generateLocalBusinessSchema(district: string): LocalBusiness for district pages
// generateBlogPostingSchema(post: BlogPost): BlogPosting + BreadcrumbList
// generateProductSchema(plan: Plan): Product with Offer for pricing page
// generateDatasetSchema(): Dataset for /accuracy page
// generateArticleSchema(caseStudy: CaseStudy): Article for case study pages
// generateServiceSchema(): Service for /enterprise page

// All schemas: validated JSON-LD (no undefined, no trailing commas)
// Inject via: <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
```

**QA Checks:**
- [ ] All schemas pass Google Rich Results Test validator
- [ ] No `undefined` values in any schema output
- [ ] `FAQPage` schema includes all 8 FAQ items from design doc
- [ ] `LocalBusiness` schema includes correct `areaServed` hierarchy for each district

---

### G-03 — Robots.txt 🔴 P0

**File:** `apps/web/app/robots.ts`

Full implementation from `06_content_seo_master.md §3.1` — allows all AI crawlers (GPTBot, PerplexityBot, Claude-Web, anthropic-ai, Google-Extended, Bingbot, etc.) plus all standard crawlers. Disallows `/dashboard/`, `/api/` (except `/api/og`), `/admin/`, `/onboarding/`.

---

### G-04 — Sitemap Generation 🔴 P0

**File:** `apps/web/app/sitemap.ts`

Full implementation from `06_content_seo_master.md §3.2` — all 18 static pages with priorities + changeFrequencies, plus dynamic blog posts and case studies fetched from Supabase/MDX. Priority `1.0` for homepage, `0.9` for district pages, `0.7` for blog posts.

---

### G-05 — Hreflang Meta Component 🔴 P0

**File:** `apps/web/components/seo/HreflangMeta.tsx`

```typescript
// Outputs: <link rel="alternate" hreflang="x-default" href="..." />
//          <link rel="alternate" hreflang="hi-IN" href="..." />
//          <link rel="alternate" hreflang="en-IN" href="https://poultrypulse.ai/en{path}" />
// Used in layout.tsx via Next.js alternates metadata field
```

---

### G-06 — OG Image Generation 🟢 P2

**File:** `apps/web/app/api/og/route.tsx`

Dynamic OG images via `next/og`. Parameters: `title`, `category`, `author`. Branded: `heroGradient` background, Sora white text, logo. Supports Devanagari via Noto Sans. Output: 1200×630px JPEG.

---

## 6. TASK GROUP AUTH — AUTHENTICATION & ONBOARDING

### AUTH-01 — Phone Input Component 🔴 P0

**File:** `apps/web/components/auth/PhoneInput.tsx`

```typescript
// Features:
// - Fixed "+91" prefix pill inside input left side
// - inputMode="numeric" for numeric keyboard on mobile
// - Auto-format: space inserted after 5th digit as user types
// - Validates /^[6-9]\d{9}$/ on blur + on submit
// - Error: "कृपया सही 10-digit mobile number दर्ज करें" inline, role="alert"
// - focus: ring-2 ring-brandGreen-500
// - height: 52px, rounded-xl
// - Ref forwarded for form integration
```

**QA Checks:**
- [ ] Space auto-inserts: "98765" → "98765 43210" as typed
- [ ] Invalid: "55123" (starts with 5) → error shown on blur
- [ ] Paste of "9876543210" → formatted correctly as "98765 43210"
- [ ] Numeric keyboard opens on mobile (not full keyboard)

---

### AUTH-02 — OTP Input Component (6 Boxes) 🔴 P0

**File:** `apps/web/components/auth/OTPInput.tsx`

```typescript
// 6 separate input boxes, each 52×56px, rounded-xl
// Framer Motion: on complete fill → all boxes turn green briefly (200ms pulse)
// Auto-advance: on digit entry, focus moves to next box
// Backspace: clears current box AND moves focus to previous
// Paste: distributes 6-digit code across all boxes
// Auto-submit: fires onChange with complete code when last digit entered
// role="group" aria-label="6-अंकीय OTP code"
// Each input: aria-label="OTP अंक 1" through "OTP अंक 6"
// Error: .input-error-shake class applied to container, boxes turn red
// After error: inputs auto-clear so user can retype immediately
```

**QA Checks:**
- [ ] Paste "123456" → fills all 6 boxes instantly, fires onComplete
- [ ] Backspace on box 3 → clears box 3, focuses box 2
- [ ] 5 wrong attempts → all boxes disabled, "30 मिनट बाद try करें" shown
- [ ] Tab order: box1 → box2 → ... → box6 → resend link

---

### AUTH-03 — Signup Page 🔴 P0

**File:** `apps/web/app/(auth)/signup/page.tsx`

**Full spec from `10_auth_onboarding_design_master.md §1.1 + §1.2`:**

- Background: `heroGradient` (continuity from homepage)
- Centered card: max-w-[440px], white, `rounded-[2rem]`, `p-8 sm:p-10`
- Plan banner (if `?plan=` query param present): `brandGreen50` bg, `brandGreen700` text
- PhoneInput component + DPDP unchecked checkbox (required)
- CTA: "OTP भेजें →" — disabled until phone valid AND consent checked
- Social proof: "200+ किसान पहले से जुड़े हैं"
- Step transition: phone entry slides left, OTP entry slides in from right (400ms `easeOutQuart`)
- Post-OTP: fire `signup_completed` event, redirect to `/onboarding`
- OTP screen: countdown timer 2:00 → resend, max 3 resends, 5-attempt lockout

**QA Checks:**
- [ ] DPDP: consent checkbox unchecked by default, submit blocked until checked
- [ ] Plan banner appears when `?plan=pulsepro` param present
- [ ] Slide transition between phone and OTP screens has no layout shift
- [ ] Rate limit: >5 OTP requests → 429 response with Hindi error
- [ ] `signup_completed` analytics event fires exactly once on successful OTP

---

### AUTH-04 — Login Page 🔴 P0

**File:** `apps/web/app/(auth)/login/page.tsx`

Identical to Signup except: no consent checkbox, headline "वापस आएं", bottom link "Account नहीं है? → Free trial". Post-login redirect logic:
- `onboarding_completed = false` → `/onboarding`
- Segment S1 → `/dashboard/mobile-only`
- Segment S2+ → `/dashboard/overview`
- Admin → `/dashboard/accuracy`
- `?redirect=` param → that URL (same-origin validation required)

---

### AUTH-05 — Onboarding State Machine 🔴 P0

**File:** `apps/web/lib/onboarding/stateMachine.ts`

**Full implementation from `10_auth_onboarding_design_master.md §3.1`:**

```typescript
// 10 states: OB-01 through OB-10
// State persisted in: Supabase customer_onboarding_state table + localStorage
// getNextStep(current, data): OnboardingStep
// getPreviousStep(current): OnboardingStep
// isStepComplete(step, data): boolean
// CURRENCY IMMUTABILITY GATE:
//   When OB-05 is submitted → plan_locked_at set in Supabase
//   Once set: customer plan field LOCKED, no API can change it without admin override
//   Plan upgrade/downgrade via separate flow (not direct field update)
// Resume: on /onboarding load, fetch Supabase state → resume from last incomplete step
// If OB-10 completed → redirect to /dashboard
```

---

### AUTH-06 — Onboarding Root Page 🔴 P0

**File:** `apps/web/app/(auth)/onboarding/page.tsx`

```typescript
// 'use client'
// Structure:
// <OnboardingProvider>
//   <OnboardingLayout>       (progress bar + card + back button)
//     <AnimatePresence mode="wait">
//       {step === 'OB-01' && <WelcomeStep />}
//       ...
//     </AnimatePresence>
//   </OnboardingLayout>
// </OnboardingProvider>
// Step transition: slide+fade — forward=left→right, back=right→left
// Browser back button: intercepted → in-page back (popstate event)
```

---

### AUTH-07 — Onboarding Step Components 🔴 P0

**Files:** `apps/web/components/onboarding/` directory

**All 10 steps from `10_auth_onboarding_design_master.md §2.2`:**

| Component | Step | Priority |
|-----------|------|----------|
| `WelcomeStep.tsx` | OB-01 | 🔴 P0 |
| `LocationStep.tsx` | OB-02 — District card grid | 🔴 P0 |
| `FlockSizeStep.tsx` | OB-03 — Segmented flock + batch selector | 🔴 P0 |
| `FarmTypeStep.tsx` | OB-04 — Independent vs Integrator | 🔴 P0 |
| `PlanConfirmStep.tsx` | OB-05 — **Currency Immutability Gate** | 🔴 P0 |
| `WhatsAppStep.tsx` | OB-06 — Test message + vCard | 🔴 P0 |
| `PreviewStep.tsx` | OB-07 — Demo signal + P10/P50/P90 explainer | 🔴 P0 |
| `AppDownloadStep.tsx` | OB-08 — Skippable, Play Store + QR | 🟡 P1 |
| `ReferralSourceStep.tsx` | OB-09 — Skippable, referral code field | 🟡 P1 |
| `SuccessStep.tsx` | OB-10 — Celebrating Pullu + timeline | 🔴 P0 |

**PlanConfirmStep special rules:**
- Shows currency immutability warning callout (amber, `role="alert"`)
- On confirm: calls `POST /api/onboarding/state` → `plan_locked_at` set in Supabase
- After `plan_locked_at` set: `/api/customers/[id]/plan` rejects changes without admin override

**SuccessStep special rules:**
- Confetti animation: Framer Motion particles, runs exactly once (3s), then stops
- Confetti disabled under `prefers-reduced-motion`
- Referral teaser: "दोस्तों को बताएं — ₹500 पाएं →" subtle link (not primary CTA)

---

### AUTH-08 — Onboarding API Routes 🔴 P0

**Files:**
- `apps/web/app/api/onboarding/state/route.ts` — GET/POST/PATCH onboarding state
- `apps/web/app/api/onboarding/whatsapp-test/route.ts` — Trigger Twilio test message

**Onboarding state API:**
```typescript
// GET: returns current OnboardingState for authenticated user
// POST: upserts step data, marks step completed, handles plan_locked_at gate
// PATCH: updates single field (e.g., whatsapp_verified: true)
// All routes: session check first → 401 if no session
// plan_locked_at immutability: once set, POST to OB-05 is idempotent (no re-lock)
```

---

### AUTH-09 — Session Expiry Modal 🔴 P0

**File:** `apps/web/components/auth/SessionExpiryModal.tsx`

- Triggered when SWR returns 401 response
- NOT a full-page redirect (preserves user's dashboard work)
- Shows `ThinkingPullu` illustration
- Hindi copy: "आपका session expire हो गया है"
- CTA: "Login करें →" opens same tab with `?redirect=currentURL`
- Cancel: closes modal, shows sticky "session expired" banner in dashboard header
- Escape key closes modal

---

## 7. TASK GROUP E — API ROUTES

### E-01 — Lead Capture API 🔴 P0

**File:** `apps/web/app/api/leads/route.ts`

**Runtime:** `edge`

**Full Zod schema from `12_implementation_quick_reference.md §3 Prompt E-01`:**
```typescript
const LeadSchema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/, { message: 'कृपया सही 10-digit mobile number दर्ज करें' }),
  source: z.enum(['exit_intent','whatsapp_demo','blog_scroll','hero','pricing','faq','nav','homepage_cta']),
  district: z.enum(['gorakhpur','deoria','kushinagar','basti','maharajganj','sant_kabir_nagar']).optional(),
  plan: z.enum(['pulsefarm','pulsepro','pulseintel']).optional(),
  consent_given: z.literal(true, { errorMap: () => ({ message: 'DPDP consent आवश्यक है' }) }),
  utm: z.object({ source: z.string().max(100).optional(), medium: z.string().max(100).optional(), campaign: z.string().max(100).optional() }).optional(),
});
```

Rate limiting: 5 per IP per hour (in-memory Map with hashed IP key). Supabase upsert on phone conflict. DPDP: IP hashed before storage. On success: trigger Supabase Edge Function for WhatsApp welcome.

**QA Checks:**
- [ ] Phone "55123" → 400 with Hindi error message
- [ ] `consent_given: false` → 400 with "DPDP consent आवश्यक है"
- [ ] 6th request same IP within 1 hour → 429 with Hindi rate limit message
- [ ] Supabase upsert: second submission with same phone updates `source`, not duplicates

---

### E-02 — Demo Request API 🔴 P0

**File:** `apps/web/app/api/demo-requests/route.ts`

- Edge Runtime, Zod validation
- Fields: name, phone, district, flock_size, preferred_time, source
- Rate limited: 2 per phone per day
- Supabase insert to `demo_requests` table
- Email notification to team (Resend or Supabase Edge Function)

---

### E-03 — Health Check API 🔴 P0

**File:** `apps/web/app/api/health/route.ts`

```typescript
// Returns: { status: 'ok' | 'degraded', supabase: boolean, version: string, timestamp: string }
// Supabase ping: SELECT 1 via server client
// If Supabase fails: status='degraded', supabase:false, still returns 200
// Used by uptime monitoring (Better Uptime)
```

---

### E-04 — Public Predictions API 🟡 P1

**File:** `apps/web/app/api/public/predictions/route.ts`

```typescript
// GET /api/public/predictions?mandi=gorakhpur
// Returns latest prediction for specified mandi
// Cache-Control: max-age=600 (10 min)
// ACCURACY GATE: if NEXT_PUBLIC_ACCURACY_GATE_CLEARED !== 'true'
//   → returns demo data with is_demo: true flag
// Used by PriceIntelligenceWidget on district pages
```

---

## 8. TASK GROUP C — SECONDARY PAGES

### C-01 — Pricing Page 🔴 P0

**File:** `apps/web/app/(marketing)/pricing/page.tsx`

Full spec from `02_prelogin_requirements_master.md FR-PRICING-001`:
- 3 plan cards: PulseFarm (₹2,000), PulsePro (₹8,000), PulseIntel (Custom)
- Annual/Monthly toggle: URL persistence `?billing=annual`
- Feature comparison table: ≥15 features, checkmarks and crosses
- ROI calculator inline (client component)
- Pricing FAQ: 5 questions
- `Product` JSON-LD schemas (3) injected into `<head>`
- `generateMetadata` with pricing-specific SEO

**QA Checks:**
- [ ] Annual toggle persists in URL without page reload
- [ ] PulsePro "Most Popular" badge visible in amber500
- [ ] "₹67/day" micro-framing visible under PulseFarm monthly price
- [ ] ROI calculator: input 25000 birds → output "₹1.5 लाख नुकसान रोकें"
- [ ] 3 Product schemas valid per Rich Results Test

---

### C-02 — Accuracy Dashboard Page 🟡 P1

**File:** `apps/web/app/(marketing)/accuracy/page.tsx`

Full spec from `02_prelogin_requirements_master.md FR-ACCURACY-001`:
- ISR: `revalidate: 600`
- Live metrics from `mv_accuracy_dashboard`
- 90-day MAPE trend chart (Recharts LineChart)
- 30-day actual vs predicted scatter (Recharts ScatterChart)
- 3 accuracy gate status indicators: ✓ PASS / ⚠ WARN / ✗ FAIL
- Methodology section: all data sources, model names, validation dataset
- `Dataset` JSON-LD schema

---

### C-03 — Gorakhpur Local SEO Page 🟡 P1

**File:** `apps/web/app/(marketing)/gorakhpur/page.tsx`

Full spec from `11_industry_pages_components_master.md §3.1`:
- Section 1: Live price widget (SSR fetched)
- Section 2: Gorakhpur market profile with AGMARKNET-verified stats
- Section 3: 7-day price history mini chart
- Section 4: Gorakhpur-specific testimonials
- Section 5: 3 local FAQs (schema-tagged)
- Section 6: Adjacent district grid (4 cards)
- Section 7: Local-copy free trial CTA
- `?utm_source=gorakhpur_page` on all CTAs for tracking

**District sub-pages (4):** Deoria, Kushinagar, Basti, Maharajganj — same `DistrictPage` template component, parameterised by district slug.

---

### C-04 through C-12 — Additional Pages

| ID | Page | File | Priority |
|----|------|------|----------|
| C-04 | Case Studies Index + Detail | `app/(marketing)/case-studies/` | 🟡 P1 |
| C-05 | Blog Index | `app/(marketing)/blog/` | 🟢 P2 |
| C-05a | Blog Post Template | `app/(marketing)/blog/[slug]/` | 🟢 P2 |
| C-06 | About Page | `app/(marketing)/about/` | 🟢 P2 |
| C-07 | Enterprise Page | `app/(marketing)/enterprise/` | 🟢 P2 |
| C-08 | WhatsApp Demo Page | `app/(marketing)/try-whatsapp/` | 🟡 P1 |
| C-09 | FAQ Page | `app/(marketing)/faq/` | 🟡 P1 |
| C-10 | Press/Media Page | `app/(marketing)/press/` | 🟢 P2 |
| C-11 | Legal Pages (3) | `privacy/` + `terms/` + `refund/` | 🔴 P0 |
| C-12 | 404 Page | `app/not-found.tsx` | 🔴 P0 |

**Blog post template extras (C-05a):**
- MDX rendering with custom components: `CalloutBox`, `ArticleStatBlock`, `FarmerQuote`, `ComparisonTable`
- Table of contents sidebar (auto-generated from headings)
- `ScrollProgress` bar (M-07)
- `BlogScrollPopup` (D-03)
- Dynamic OG image via `next/og` (G-06)
- ISR: `revalidate: 3600`

---

## 9. TASK GROUP D — POPUPS & OVERLAYS

### D-01 — Exit Intent Popup 🟡 P1

**File:** `apps/web/components/popups/ExitIntentPopup.tsx`

From `10_auth_onboarding_design_master.md` + `02_prelogin_requirements_master.md FR-HOME-007`:
- Triggers on `mouseleave` from `document.documentElement` (desktop only)
- Suppressed: `window.innerWidth < 768` (mobile)
- 30-second initial delay before activating
- Frequency: sessionStorage + 7-day localStorage cooldown
- DPDP consent checkbox (unchecked, required)
- On submit: POST `/api/leads` with `source: 'exit_intent'`
- Decline copy: "नहीं, मुझे daily price नहीं चाहिए" (non-manipulative)

**QA Checks:**
- [ ] Does NOT appear on mobile (window.innerWidth check)
- [ ] Does NOT appear within first 30 seconds
- [ ] Does NOT appear twice in same session (sessionStorage check)
- [ ] Consent checkbox unchecked; submit blocked until checked
- [ ] Decline link closes popup without submitting

---

### D-02 — Demo Request Modal 🔴 P0

**File:** `apps/web/components/popups/DemoModal.tsx`

From `02_prelogin_requirements_master.md FR-POPUP-001`:
- Triggered by `usePopup()` hook (global context)
- Full form: name, phone (+91), district dropdown, flock size, preferred time
- Focus trap while open; Escape closes and returns focus to trigger element
- Click-outside closes
- `aria-modal="true"`, `role="dialog"`, `aria-labelledby`
- POST to `/api/demo-requests`
- Rate limited: 2 per phone per day

---

### D-03 — Blog Scroll Popup 🟢 P2

**File:** `apps/web/components/popups/BlogScrollPopup.tsx`

- Only on `/blog/[slug]` pages
- IntersectionObserver fires at 50% of article body
- Bottom-right slide-in (desktop), full-bottom sheet (mobile)
- Single WhatsApp field
- `sessionStorage` dismissal (once per session)

---

### D-04 — Popup Context Provider 🔴 P0

**File:** `apps/web/providers/PopupProvider.tsx`

```typescript
// Context: { activePopup, openPopup, closePopup }
// Prevents multiple popups simultaneously
// Exports: usePopup() hook
// 'use client'
```

---

## 10. TASK GROUP IP — INDUSTRY PAGES (S2–S6)

### IP-01 — Solutions Index Page 🟢 P2

**File:** `apps/web/app/(marketing)/solutions/page.tsx`

5 segment cards in 2-row grid from `11_industry_pages_components_master.md §7`:
- Row 1: Integrators, Feed Manufacturers, Traders
- Row 2: QSR Chains, Insurers/Banks (centred)
- Hover: card lifts + brandGreen border
- Below: "S1 किसानों के लिए →" link to homepage

---

### IP-02 — S2 Integrator Page 🟢 P2

**File:** `apps/web/app/(marketing)/solutions/integrators/page.tsx`

From `11_industry_pages_components_master.md §1.1`:
- Hero stat bar: ₹50L+, 20 farms, 1 dashboard, 6:30 AM
- 4 integrator-specific features: Multi-Farm Command Centre, Revenue Forecasting, Feed Procurement, Farm Analytics
- Pricing framing: "₹400/farm/month at 20 farms"
- CTA: "Integrator Demo बुक करें →"

---

### IP-03 — S3 Feed Manufacturer Page 🟢 P2
### IP-04 — S4 Trader/Broker Page 🟢 P2
### IP-05 — S5 QSR Chain Page 🟢 P2
### IP-06 — S6 Insurer/Bank Page 🟢 P2

All from `11_industry_pages_components_master.md §1.2–1.5`. Each has segment-specific headline, pain section, feature list, and CTA routing.

---

## 11. TASK GROUP CP — CONTENT COMPONENTS

### CP-01 — Price Intelligence Widget 🟡 P1

**File:** `apps/web/components/widgets/PriceIntelligenceWidget.tsx`

**Full implementation from `11_industry_pages_components_master.md §4.1`:**
- Props: `mandi`, `showChart`, `compact`, `initialData`
- SWR with SSR fallback, `refreshInterval: 600_000`
- Signal config: SELL_NOW (green), HOLD (amber), CAUTION (red)
- Stale warning: if `predictedAt > 24h` → amber banner "डेटा पुराना है"
- Demo badge: shows "(Demo)" when `ACCURACY_GATE_CLEARED !== 'true'`
- Skeleton: `PriceWidgetSkeleton` component (shimmer)
- Error: `PriceWidgetError` component with retry

**QA Checks:**
- [ ] `is_demo: true` → "(Demo)" badge visible, no missing data
- [ ] `isStale: true` → amber warning, price still shown
- [ ] P10, P50, P90 all visible — never omit any band
- [ ] Skeleton matches widget dimensions (no layout shift on data load)

---

### CP-02 — MDX Blog Components 🟢 P2

**Files:** `apps/web/components/blog/mdx/`

From `11_industry_pages_components_master.md §2.1`:
- `CalloutBox.tsx` — info / warning / source / tip / result variants
- `ArticleStatBlock.tsx` — large stat + source citation
- `FarmerQuote.tsx` — styled blockquote with Hindi + English quote, financial outcome badge
- `ComparisonTable.tsx` — "Without PoultryPulse vs With PoultryPulse" standard table

---

### CP-03 — Case Study Components 🟡 P1

**Files:** `apps/web/components/case-studies/`

From `11_industry_pages_components_master.md §2.2`:
- `CaseStudyHero.tsx` — dark green hero with farmer name, outcome badge
- `CaseStudyTimeline.tsx` — vertical timeline with signal-coloured event cards

---

### CP-04 — District Page Template 🟡 P1

**File:** `apps/web/components/districts/DistrictPage.tsx`

Parameterised by district slug. Renders all 7 sections from `11_industry_pages_components_master.md §3.1` with district-specific data: live price widget, market profile, testimonials, adjacent district grid.

---

## 12. TASK GROUP H — REFERRAL PROGRAM

### H-01 — Refer Page 🟢 P2

**File:** `apps/web/app/(marketing)/refer/page.tsx`

Auth-gated (redirect to `/login` if unauthenticated). From `08_external_assets_press_master.md §6.2`:
- Large referral code display (copyable)
- WhatsApp share button with pre-composed message (editable by user)
- QR code download for in-person sharing
- Referrals table: friend phone (masked) | status | credit amount
- T&C accordion

**WhatsApp pre-composed message:**
```
"नमस्ते! मैं PoultryPulse AI इस्तेमाल कर रहा हूँ —
रोज़ सुबह 6:30 बजे मुर्गी का भाव और कब बेचना है यह WhatsApp पर आता है।
मेरे referral code से join करो, 30 दिन मुफ़्त मिलेगा:
poultrypulse.ai/r/[CODE]"
```

---

### H-02 — Referral Code Generation API 🟢 P2

**File:** `apps/web/app/api/referral/generate/route.ts`

From `08_external_assets_press_master.md §6.1`:
- Code format: 8-char alphanumeric uppercase, no 0/O/1/I
- Alphabet: `ABCDEFGHJKLMNPQRSTUVWXYZ23456789`
- Idempotent: returns existing code if already generated for this customer
- Stores in `referral_codes` table with customer_id

---

### H-03 — Referral Attribution API 🟢 P2

**File:** `apps/web/app/api/referral/apply/route.ts`

Fraud rules from `08_external_assets_press_master.md §6.1`:
- Referrer ≠ referred (no self-referral)
- Same phone number check
- Max 10 pending referrals per account
- Velocity: >5 referrals in 7 days → manual review flag
- Credit created only on paid subscription activation (not trial start)

---

## 13. TASK GROUP T — TESTING & QA

### T-01 — Lighthouse CI Workflow 🔴 P0

**File:** `.github/workflows/ci.yml`

```yaml
# Runs on every PR targeting main
# Lighthouse budgets:
#   mobile LCP < 2.5s, INP < 200ms, CLS < 0.1
#   Performance score: fail if < 85
#   Accessibility score: fail if < 90
# Pages tested: /, /pricing, /accuracy
```

---

### T-02 — Accessibility Tests 🟡 P1

**Files:** `apps/web/__tests__/a11y/`

Using Vitest + Testing Library + axe-core:
- `nav.a11y.test.tsx`: keyboard navigation, hamburger ARIA states, focus trap in mobile overlay
- `faq.a11y.test.tsx`: `aria-expanded`, keyboard controls (Enter/Space, arrow keys), single-expand
- `modal.a11y.test.tsx`: focus trap, Escape key, focus return on close
- `forms.a11y.test.tsx`: label associations, error announcements with `role="alert"`
- `otp.a11y.test.tsx`: group role, individual box labels, keyboard navigation between boxes

---

### T-03 — E2E Critical Path (Playwright) 🔴 P0

**Files:** `apps/web/e2e/`

```typescript
// critical-path.spec.ts:
// Test 1: Homepage loads + hero renders in < 2s on 3G throttling
// Test 2: Language toggle switches from Hindi to English
// Test 3: Loss calculator: slider change → Indian currency output updates
// Test 4: Exit popup appears after 30s (time manipulation via page.clock)
// Test 5: Lead form submit → success state shown, no page reload
// Test 6: Signup flow: phone → OTP → onboarding (mocked Supabase)
// Test 7: All nav links return 200 status (no broken links)
// Test 8: /api/health returns { status: 'ok', supabase: true }
// Viewports tested: 390px (mobile) + 1440px (desktop)
```

---

### T-04 — Hindi Text Rendering Validation 🟡 P1

**Files:** `apps/web/__tests__/typography/`

```typescript
// Verify Noto Sans Devanagari renders correctly:
// - Conjunct consonants: क्ष, त्र, ज्ञ
// - Devanagari numerals: ०, १, २
// - Matra combining characters (ि, ी, ु, ू, े, ै, ो, ौ)
// - Body text minimum 16px (never below)
// - Caption minimum 14px
// - Heading line-height ≥ 1.375 (matras need space)
// Test at: 390px, 768px, 1440px viewports
```

---

## 14. TASK GROUP J — DEPLOYMENT & MONITORING

### J-01 — Vercel Configuration 🔴 P0

**File:** `vercel.json`

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains" },
        { "key": "Content-Security-Policy", "value": "default-src 'self'; script-src 'self' 'unsafe-inline' vercel.live; ..." }
      ]
    }
  ],
  "redirects": [
    { "source": "/home", "destination": "/", "permanent": true },
    { "source": "/:path*", "has": [{"type": "host", "value": "www.poultrypulse.ai"}], "destination": "https://poultrypulse.ai/:path*", "permanent": true }
  ]
}
```

---

### J-02 — Uptime Monitoring 🔴 P0

Configure Better Uptime monitors for: `/` , `/api/health`, `/pricing`, `/accuracy`. Alert channel: Slack webhook. SLA target: 99.5% uptime.

---

## 15. TASK GROUP SEO-CONTENT — CONTENT IMPLEMENTATION

### SEO-01 — Homepage Metadata & Schemas 🔴 P0

**File:** Update `apps/web/app/(marketing)/page.tsx`

From `06_content_seo_master.md §2.1` + `12_implementation_quick_reference.md §6`:

Full `metadata` export with title, description, keywords, alternates, openGraph, twitter, robots. Plus 4 JSON-LD schemas injected: Organization, WebSite+SearchAction, FAQPage (8 items), HowTo (3 steps).

---

### SEO-02 — Blog Article Content Briefs 🟢 P2

**Files:** `apps/web/content/blog/*.mdx`

From `06_content_seo_master.md §5.2` — 5 priority articles with full copy briefs:

| Slug | Target Keyword | Word Count | Priority |
|------|----------------|------------|----------|
| `gorakhpur-murgi-bhav-kaise-tay-hota-hai` | गोरखपुर मुर्गी भाव कैसे तय होता है | 1,800–2,200 | 🟢 P2 |
| `up-poultry-timing-loss-2024-analysis` | UP poultry farm loss 2024 | 2,200–2,500 | 🟢 P2 |
| `hpai-bird-flu-gorakhpur-early-warning` | HPAI alert Gorakhpur | 1,600–1,800 | 🟢 P2 |
| `ai-poultry-price-prediction-lightgbm-explained` | AI broiler price prediction India | 2,000–2,400 | 🟢 P2 |
| `murgi-kab-bechein-broiler-batch-timing-guide` | मुर्गी कब बेचें | 1,800–2,200 | 🟢 P2 |

Each article follows the template from `06_content_seo_master.md §5.1`: answer box (≤60 words), definition block, key takeaways, structured H2/H3 sections, inline CTA, sources section.

---

### SEO-03 — Content Quality Checklist (Pre-Publication) 🟢 P2

**File:** `apps/web/content/CONTENT_CHECKLIST.md`

Publish the checklist from `06_content_seo_master.md §9` as a content team reference:
- Fact check: every stat has cited source
- Hindi copy: reviewed by UP native speaker
- Answer box: ≤60 words, direct answer
- Schema markup: correct JSON-LD for page type
- Internal links: minimum 2 per article
- Alt text: all images in Hindi + English
- CTA: minimum 1 per 600 words
- Plagiarism: original content only

---

## 16. IMPLEMENTATION SEQUENCE & CRITICAL PATH

### 16.1 P0 Sprint (6 Weeks — 3 Engineers)

```
WEEK 1 — Infrastructure (F group)
  Day 1–2:  F-01 (monorepo) → F-02 (tokens) → F-03 (types) → F-04 (Next.js)
  Day 3–4:  F-04 (Tailwind) → F-05 (CSS) → F-06 (Supabase) → F-07 (middleware)
  Day 5:    F-08 (env vars) + UI-08 (currency) + UI-09 (analytics) + G-01 (metadata)

WEEK 2 — Motion + Core UI (M + UI groups)
  Day 6–7:  M-01 → M-02 → M-03 → M-04 → M-08 (motion components)
  Day 8:    UI-01 → UI-02 → UI-03 → UI-04 → UI-05 → UI-06 (shared UI)
  Day 9–10: G-02 → G-03 → G-04 → G-05 (schemas + robots + sitemap)

WEEK 3 — Homepage (B group from 03_prelogin_tasks_master.md + Motion)
  Day 11:   A-05 (FloatingNav) + A-06 (Footer) + A-07 (AnnouncementBanner)
  Day 12:   B-01 (Hero — needs M-04 PriceTicker)
  Day 13:   B-02 (Pain + Calculator)
  Day 14:   B-03 (How It Works — needs M-05 StickyScroll)
  Day 15:   B-04 (Accuracy — needs Supabase + CountUp)
  Day 16:   B-05 + B-08 (Testimonials + Trust)
  Day 17:   B-06 (Pricing teaser + ROI calc)
  Day 18:   B-09 + B-10 + B-11 (FAQ + Final CTA + Assembly)

WEEK 4 — APIs + Popups + Auth (E + D + AUTH groups)
  Day 19:   E-01 → E-02 → E-03 (lead + demo + health APIs)
  Day 20:   D-02 → D-04 (demo modal + popup provider)
  Day 21:   AUTH-01 → AUTH-02 (phone + OTP components)
  Day 22:   AUTH-03 → AUTH-04 (signup + login pages)
  Day 23:   AUTH-05 → AUTH-06 → AUTH-07 (onboarding state + pages)
  Day 24:   AUTH-08 → AUTH-09 (onboarding APIs + session modal)

WEEK 5 — Pages + Vercel (C + J groups)
  Day 25:   C-01 (Pricing page) + SEO-01 (schemas on homepage)
  Day 26:   C-08 (WhatsApp Demo) + C-09 (FAQ page)
  Day 27:   C-11 (Legal: privacy + terms + refund) — DPDP blocker
  Day 28:   C-12 (404 page) + J-01 (Vercel config) + J-02 (uptime monitors)
  Day 29:   E-04 (sitemap) + E-05 (robots)

WEEK 6 — Testing + QA
  Day 30–31: T-03 (E2E critical path)
  Day 32:    T-01 (Lighthouse CI)
  Day 33:    T-04 (Hindi text validation)
  Day 34:    Full pre-launch audit + bug fixes
  Day 35:    Accuracy gate validation

=== ACCURACY GATE CHECKPOINT ===
Before first customer onboarded, verify ALL:
  □ Directional accuracy ≥ 95% on Gorakhpur 30-day holdout
  □ MAPE < 6%
  □ Conformal coverage 78–82%
  □ All P0 tasks complete
  □ TypeScript: npx tsc --noEmit passes with 0 errors
  □ ESLint: 0 errors
  □ Lighthouse mobile Performance ≥ 85, Accessibility ≥ 90
  □ E2E tests all passing
  □ Legal pages live (/privacy, /terms, /refund)
  □ DPDP compliance verified
  □ WhatsApp Business API approved by Meta
  □ All 3 WhatsApp message templates approved
  □ /api/health → { status:'ok', supabase:true }
  □ Uptime monitors configured and alerting
  □ NEXT_PUBLIC_ACCURACY_GATE_CLEARED=true set in Vercel production env
=== ONLY THEN: FIRST CUSTOMER ONBOARDED ===
```

### 16.2 P1 Sprint (Weeks 7–10)

```
WEEK 7:  C-02 (Accuracy page) + C-03 (Gorakhpur page) + C-03a (District sub-pages)
WEEK 8:  C-04 (Case studies) + CP-01 (Price widget) + CP-03 (Case study components)
WEEK 9:  M-05 (StickyScroll) + M-06 (DataFlow) + M-09 (Illustrations)
         DA-01 through DB-10 (Dashboard — from 05_postlogin_requirements_tasks.md)
WEEK 10: D-01 (Exit intent) + C-08 (WhatsApp Demo) + T-02 (A11y tests)
```

### 16.3 P2 Sprint (Weeks 11–14)

```
WEEK 11: C-05, C-05a (Blog) + SEO-02 (Article content)
WEEK 12: C-06, C-07, C-10 (About, Enterprise, Press)
WEEK 13: IP-01 through IP-06 (Industry pages) + CP-02 (MDX components)
WEEK 14: H-01, H-02, H-03 (Referral program) + G-06 (OG images)
```

---

## 17. COMPLETE TASK REFERENCE TABLE

| ID | Task | Priority | Group | Est. Hours | Doc Source |
|----|------|----------|-------|------------|------------|
| F-01 | Turborepo monorepo setup | 🔴 P0 | Foundation | 4h | 09_manifest |
| F-02 | Web token package | 🔴 P0 | Foundation | 2h | 01_design + 07_motion |
| F-03 | Database types package | 🔴 P0 | Foundation | 3h | 09_manifest |
| F-04 | Tailwind config extension | 🔴 P0 | Foundation | 2h | 07_motion |
| F-05 | CSS animation files | 🔴 P0 | Foundation | 2h | 07_motion |
| F-06 | Supabase SSR client setup | 🔴 P0 | Foundation | 3h | 09_manifest |
| F-07 | Auth + UTM middleware | 🔴 P0 | Foundation | 4h | 10_auth |
| F-08 | Environment variables | 🔴 P0 | Foundation | 1h | 09_manifest |
| M-01 | FadeUp component | 🔴 P0 | Motion | 2h | 07_motion §2.1 |
| M-02 | StaggerGroup component | 🔴 P0 | Motion | 2h | 07_motion §2.2 |
| M-03 | CountUp component | 🔴 P0 | Motion | 3h | 07_motion §2.3 |
| M-04 | PriceTickerMockup | 🔴 P0 | Motion | 4h | 07_motion §2.4 |
| M-05 | StickyScrollSteps | 🟡 P1 | Motion | 5h | 07_motion §2.5 |
| M-06 | DataFlowTicker | 🟡 P1 | Motion | 3h | 07_motion §2.7 |
| M-07 | ScrollProgress | 🟢 P2 | Motion | 2h | 07_motion §2.6 |
| M-08 | Reduced motion hook | 🔴 P0 | Motion | 2h | 07_motion §6.2 |
| M-09 | Illustration system (7 SVGs) | 🟡 P1 | Motion | 8h | 07_motion §5 |
| UI-01 | Button component | 🔴 P0 | UI | 3h | 11_components §5.1 |
| UI-02 | Card component (double-bezel) | 🔴 P0 | UI | 2h | 11_components §5.2 |
| UI-03 | Section wrapper | 🔴 P0 | UI | 1h | 11_components §5.3 |
| UI-04 | EyebrowBadge | 🔴 P0 | UI | 1h | 01_design |
| UI-05 | StatBlock | 🔴 P0 | UI | 2h | 09_manifest |
| UI-06 | Language toggle | 🔴 P0 | UI | 3h | 02_requirements |
| UI-07 | WhatsApp share button | 🟡 P1 | UI | 1h | 08_press §6 |
| UI-08 | Price display component | 🟡 P1 | UI | 3h | 11_components |
| UI-09 | Analytics event tracker | 🔴 P0 | UI | 3h | 12_quickref |
| UI-10 | Indian currency formatter | 🔴 P0 | UI | 2h | 11_components §5.4 |
| G-01 | Base metadata factory | 🔴 P0 | SEO | 2h | 06_seo §2 |
| G-02 | JSON-LD schema library | 🔴 P0 | SEO | 3h | 06_seo §3.3 |
| G-03 | Robots.txt | 🔴 P0 | SEO | 1h | 06_seo §3.1 |
| G-04 | Sitemap generation | 🔴 P0 | SEO | 3h | 06_seo §3.2 |
| G-05 | Hreflang meta component | 🔴 P0 | SEO | 1h | 02_requirements |
| G-06 | OG image generation | 🟢 P2 | SEO | 4h | 02_requirements |
| AUTH-01 | Phone input component | 🔴 P0 | Auth | 3h | 10_auth §1.1 |
| AUTH-02 | OTP input (6 boxes) | 🔴 P0 | Auth | 4h | 10_auth §1.2 |
| AUTH-03 | Signup page | 🔴 P0 | Auth | 4h | 10_auth §1.1-1.2 |
| AUTH-04 | Login page | 🔴 P0 | Auth | 3h | 10_auth §4 |
| AUTH-05 | Onboarding state machine | 🔴 P0 | Auth | 6h | 10_auth §3.1 |
| AUTH-06 | Onboarding root page | 🔴 P0 | Auth | 4h | 10_auth §3.3 |
| AUTH-07 | Onboarding step components (10) | 🔴 P0 | Auth | 28h | 10_auth §2.2 |
| AUTH-08 | Onboarding API routes | 🔴 P0 | Auth | 6h | 10_auth §3.2 |
| AUTH-09 | Session expiry modal | 🔴 P0 | Auth | 2h | 10_auth §6.2 |
| E-01 | Lead capture API | 🔴 P0 | APIs | 4h | 12_quickref §3 |
| E-02 | Demo request API | 🔴 P0 | APIs | 3h | 02_requirements |
| E-03 | Health check API | 🔴 P0 | APIs | 1h | 02_requirements |
| E-04 | Public predictions API | 🟡 P1 | APIs | 3h | 11_components |
| D-01 | Exit intent popup | 🟡 P1 | Popups | 6h | 02_requirements |
| D-02 | Demo request modal | 🔴 P0 | Popups | 5h | 02_requirements |
| D-03 | Blog scroll popup | 🟢 P2 | Popups | 4h | 02_requirements |
| D-04 | Popup context provider | 🔴 P0 | Popups | 2h | 02_requirements |
| C-01 | Pricing page | 🔴 P0 | Pages | 10h | 02_requirements |
| C-02 | Accuracy page | 🟡 P1 | Pages | 8h | 02_requirements |
| C-03 | Gorakhpur page | 🟡 P1 | Pages | 6h | 11_components §3 |
| C-03a | District sub-pages (4) | 🟡 P1 | Pages | 8h | 11_components |
| C-04 | Case studies | 🟡 P1 | Pages | 10h | 02_requirements |
| C-05 | Blog index | 🟢 P2 | Pages | 8h | 02_requirements |
| C-05a | Blog post template | 🟢 P2 | Pages | 8h | 02_requirements |
| C-06 | About page | 🟢 P2 | Pages | 6h | 02_requirements |
| C-07 | Enterprise page | 🟢 P2 | Pages | 8h | 02_requirements |
| C-08 | WhatsApp demo page | 🟡 P1 | Pages | 6h | 02_requirements |
| C-09 | FAQ page | 🟡 P1 | Pages | 4h | 02_requirements |
| C-10 | Press/media page | 🟢 P2 | Pages | 4h | 08_press §2 |
| C-11 | Legal pages (3) | 🔴 P0 | Pages | 6h | 02_requirements |
| C-12 | 404 page | 🔴 P0 | Pages | 3h | 09_manifest |
| IP-01 | Solutions index page | 🟢 P2 | Industry | 4h | 11_components §7 |
| IP-02 | S2 Integrators page | 🟢 P2 | Industry | 8h | 11_components §1.1 |
| IP-03 | S3 Feed manufacturers page | 🟢 P2 | Industry | 6h | 11_components §1.2 |
| IP-04 | S4 Traders page | 🟢 P2 | Industry | 6h | 11_components §1.3 |
| IP-05 | S5 QSR chains page | 🟢 P2 | Industry | 6h | 11_components §1.4 |
| IP-06 | S6 Insurers page | 🟢 P2 | Industry | 6h | 11_components §1.5 |
| CP-01 | Price intelligence widget | 🟡 P1 | Components | 8h | 11_components §4.1 |
| CP-02 | MDX blog components (4) | 🟢 P2 | Components | 6h | 11_components §2.1 |
| CP-03 | Case study components | 🟡 P1 | Components | 8h | 11_components §2.2 |
| CP-04 | District page template | 🟡 P1 | Components | 6h | 11_components §3.1 |
| H-01 | Refer page | 🟢 P2 | Referral | 6h | 08_press §6 |
| H-02 | Code generation API | 🟢 P2 | Referral | 3h | 08_press §6.1 |
| H-03 | Attribution API | 🟢 P2 | Referral | 3h | 08_press §6.1 |
| SEO-01 | Homepage schemas + metadata | 🔴 P0 | Content | 3h | 06_seo + 12_quickref |
| SEO-02 | Blog article content (5) | 🟢 P2 | Content | 30h | 06_seo §5.2 |
| SEO-03 | Content checklist doc | 🟢 P2 | Content | 1h | 06_seo §9 |
| T-01 | Lighthouse CI workflow | 🔴 P0 | Testing | 3h | 09_manifest |
| T-02 | Accessibility tests | 🟡 P1 | Testing | 8h | 09_manifest |
| T-03 | E2E critical path (Playwright) | 🔴 P0 | Testing | 12h | 09_manifest |
| T-04 | Hindi text validation tests | 🟡 P1 | Testing | 4h | 07_motion §1.1 |
| J-01 | Vercel configuration | 🔴 P0 | Deploy | 2h | 09_manifest |
| J-02 | Uptime monitoring | 🔴 P0 | Deploy | 1h | 09_manifest |

**Total P0 tasks:** 47 tasks · ~220 hours
**Total P1 tasks:** 22 tasks · ~130 hours
**Total P2 tasks:** 28 tasks · ~170 hours
**Grand total:** 97 tasks · ~520 hours

---

## 18. DEPENDENCY MANIFEST

### 18.1 NPM Packages

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@supabase/ssr": "^0.4.0",
    "@supabase/supabase-js": "^2.45.0",
    "framer-motion": "^11.0.0",
    "recharts": "^2.12.0",
    "swr": "^2.2.5",
    "zod": "^3.23.0",
    "leaflet": "^1.9.0",
    "react-leaflet": "^4.2.0",
    "fuse.js": "^7.0.0",
    "@phosphor-icons/react": "^2.1.0",
    "@vercel/analytics": "^1.3.0",
    "next-mdx-remote": "^5.0.0",
    "gray-matter": "^4.0.3",
    "sharp": "^0.33.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "@types/react": "^19.0.0",
    "@types/leaflet": "^1.9.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "vitest": "^1.6.0",
    "@testing-library/react": "^16.0.0",
    "axe-core": "^4.9.0",
    "@axe-core/react": "^4.9.0",
    "playwright": "^1.44.0",
    "@playwright/test": "^1.44.0",
    "turbo": "^2.0.0"
  }
}
```

---

*Document: 13_full_platform_tasks_master.md*
*Synthesised from: 06_content_seo_master.md · 07_motion_animation_master.md ·*
*08_external_assets_press_master.md · 09_kiro_implementation_manifest.md ·*
*10_auth_onboarding_design_master.md · 11_industry_pages_components_master.md ·*
*12_implementation_quick_reference.md*
*Previous: 12_implementation_quick_reference.md*
*Complete PoultryPulse AI Implementation Suite — 13 documents*
*© 2026 PoultryPulse AI Technologies Pvt. Ltd. | CONFIDENTIAL*
