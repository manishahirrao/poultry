# PoultryPulse AI — Kiro Implementation Manifest & Master Index
# File: 09_kiro_implementation_manifest.md
# Kiro Compatibility: ✅ Primary Kiro Orchestration File
# Version: v1.0 | May 2026 | CONFIDENTIAL

---

## AGENT CONTEXT BLOCK
```
ROLE: Lead Architect — Anand Mohideen framework (25+ yr LLM prompt engineering precision)
PURPOSE: Single source of truth for all Kiro agents executing the PoultryPulse AI website build
EXECUTION_MODEL: Parallel where dependency-free, sequential for dependent tasks
ACCURACY_GATE: Absolute blocker — no customer-facing deployment until 95%+ confirmed
NON_NEGOTIABLE_RULES: See §7 below — violations trigger full stop
```

---

## 1. PROJECT OVERVIEW

### 1.1 What We Are Building

PoultryPulse AI is India's first AI-powered broiler price intelligence platform for commercial poultry farmers in the Gorakhpur belt of Uttar Pradesh. The website consists of:

```
PRE-LOGIN WEBSITE (Marketing + Conversion):
  17 pages covering all conversion stages (see full inventory in 02_prelogin_requirements_master.md §2)
  Technologies: Next.js 15 App Router, TypeScript strict, Tailwind CSS v3, Framer Motion
  Deployment: Vercel Edge Network
  Database: Supabase (PostgreSQL, ap-south-1 Mumbai)
  Auth: Supabase Phone OTP

POST-LOGIN WEB DASHBOARD (B2B Analytics):
  9 dashboard pages for S2 integrators and admin
  Role-gated: S1 farmers → mobile app only, S2+ → web dashboard
  Same tech stack as pre-login

SHARED INFRASTRUCTURE:
  packages/ui: Design tokens, shared components
  packages/config: ESLint, TypeScript, Tailwind configs
  apps/web: Full Next.js application (monorepo)
```

### 1.2 Document Dependency Map

```
Core Documents (Kiro must read before executing any task):
  01_prelogin_design_master.md      → UI/UX spec for all pre-login pages
  02_prelogin_requirements_master.md → Functional requirements + SEO + DPDP
  03_prelogin_tasks_master.md       → Specific task list with code scaffolds
  04_postlogin_design_master.md     → Dashboard UI/UX design spec
  05_postlogin_requirements_tasks.md → Dashboard requirements + task list
  06_content_seo_master.md          → All content, SEO, keyword strategy
  07_motion_animation_master.md     → Animation components + performance rules
  08_external_assets_press_master.md → Press, psychology, CRO, referral
  09_kiro_implementation_manifest.md → THIS FILE — orchestration manifest
  
Supporting Documents (reference as needed):
  PoultryPulse_PRD_v3.pdf           → Product requirements, personas, business rules
  PoultryPulse_TRD_v1.pdf           → Technical architecture, Supabase schema
  PoultryPulse_UIUX_Design_v1.pdf   → Base design system (app-level)
  PoultryPulse_Architecture_v1.pdf  → AWS infrastructure, data pipeline
```

---

## 2. MONOREPO STRUCTURE

```
poultrypulse-ai/
├── apps/
│   └── web/                          # Next.js 15 website
│       ├── app/
│       │   ├── (marketing)/          # Pre-login route group
│       │   │   ├── page.tsx          # Homepage
│       │   │   ├── pricing/
│       │   │   ├── accuracy/
│       │   │   ├── gorakhpur/
│       │   │   ├── deoria/
│       │   │   ├── kushinagar/
│       │   │   ├── basti/
│       │   │   ├── maharajganj/
│       │   │   ├── case-studies/
│       │   │   ├── blog/
│       │   │   ├── about/
│       │   │   ├── enterprise/
│       │   │   ├── faq/
│       │   │   ├── press/
│       │   │   ├── contact/
│       │   │   ├── try-whatsapp/
│       │   │   ├── refer/
│       │   │   ├── privacy/
│       │   │   ├── terms/
│       │   │   └── refund/
│       │   ├── (dashboard)/          # Post-login route group
│       │   │   ├── layout.tsx        # Dashboard shell (sidebar + header)
│       │   │   ├── overview/
│       │   │   ├── price-intelligence/
│       │   │   ├── alerts/
│       │   │   ├── calculator/
│       │   │   ├── api/
│       │   │   ├── accuracy/
│       │   │   ├── customers/
│       │   │   ├── settings/
│       │   │   ├── 403/
│       │   │   └── mobile-only/
│       │   ├── (auth)/               # Auth pages
│       │   │   ├── login/
│       │   │   ├── signup/
│       │   │   └── onboarding/
│       │   ├── api/                  # API routes
│       │   │   ├── leads/
│       │   │   ├── demo-requests/
│       │   │   ├── health/
│       │   │   ├── export/
│       │   │   ├── alerts/
│       │   │   ├── admin/
│       │   │   ├── referral/
│       │   │   └── og/
│       │   ├── not-found.tsx
│       │   ├── robots.ts
│       │   └── sitemap.ts
│       ├── components/
│       │   ├── home/                 # Homepage sections (B-01 to B-10)
│       │   ├── nav/                  # FloatingNav
│       │   ├── layout/               # Footer, AnnouncementBanner
│       │   ├── dashboard/            # Sidebar, DashboardHeader, skeletons, empty states
│       │   ├── popups/               # ExitIntentPopup, DemoModal, BlogScrollPopup
│       │   ├── motion/               # FadeUp, StaggerGroup, CountUp, PriceTicker, etc.
│       │   ├── illustrations/        # Pullu SVG characters
│       │   ├── seo/                  # Schema components
│       │   └── ui/                   # Shared UI: Button, Card, Badge, etc.
│       ├── hooks/                    # useRealtimeAlerts, useAccuracyGate, useMotionConfig
│       ├── lib/
│       │   ├── analytics.ts          # Event tracking
│       │   ├── formatCurrency.ts     # Indian number formatting
│       │   ├── charts/               # Recharts config
│       │   ├── schemas/              # JSON-LD generators
│       │   ├── seo/                  # Metadata utilities
│       │   └── content/              # Blog/case study MDX utilities
│       ├── providers/                # PopupProvider, LanguageProvider
│       ├── styles/
│       │   ├── globals.css
│       │   ├── animations.css
│       │   └── reduced-motion.css
│       ├── utils/
│       │   └── supabase/
│       │       ├── server.ts         # RSC server client
│       │       ├── client.ts         # Client component client
│       │       └── dashboard.ts      # Dashboard-specific queries
│       ├── content/
│       │   ├── blog/                 # MDX blog posts
│       │   └── case-studies/         # MDX case studies
│       ├── public/
│       │   ├── og/                   # Static OG images
│       │   ├── press/                # Press kit, PDFs
│       │   └── fonts/                # Self-hosted fallback fonts
│       ├── middleware.ts             # Auth + UTM + language middleware
│       ├── next.config.ts
│       └── tailwind.config.ts
├── packages/
│   ├── ui/
│   │   └── src/
│   │       ├── web-tokens.ts
│   │       └── index.ts
│   ├── config/
│   │   ├── eslint/
│   │   ├── typescript/
│   │   └── tailwind/
│   └── types/
│       └── src/
│           ├── database.ts           # Supabase generated types
│           └── api.ts                # API request/response types
├── .github/
│   └── workflows/
│       ├── ci.yml                    # Build, test, Lighthouse CI
│       └── deploy.yml                # Vercel deploy
└── package.json                      # Turborepo root
```

---

## 3. FULL TASK EXECUTION LIST (Cross-Document Master)

### Priority Legend
```
🔴 P0 — Launch Blocker (must complete before any customer)
🟡 P1 — Required for Phase 0 launch (complete within 2 weeks of first customer)
🟢 P2 — Phase 1 target (Month 2-3)
⚪ P3 — Backlog
```

### FOUNDATION TASKS

| ID | Task | File | Priority | Dependencies | Est. Hours |
|----|------|------|----------|--------------|-----------|
| F-01 | Monorepo setup (Turborepo) | packages/ | 🔴 P0 | None | 4h |
| F-02 | packages/ui: Web tokens | packages/ui/src/web-tokens.ts | 🔴 P0 | F-01 | 2h |
| F-03 | packages/types: Database types | packages/types/src/database.ts | 🔴 P0 | F-01 | 3h |
| F-04 | Next.js 15 app init | apps/web/ | 🔴 P0 | F-01 | 2h |
| F-05 | Tailwind config extension | apps/web/tailwind.config.ts | 🔴 P0 | F-04 | 2h |
| F-06 | Google Fonts integration | apps/web/app/layout.tsx | 🔴 P0 | F-04 | 2h |
| F-07 | Supabase client setup (SSR) | apps/web/utils/supabase/ | 🔴 P0 | F-04 | 3h |
| F-08 | Middleware (auth + UTM + lang) | apps/web/middleware.ts | 🔴 P0 | F-07 | 4h |
| F-09 | CSS animations global | apps/web/styles/ | 🔴 P0 | F-05 | 2h |
| F-10 | Environment config + .env.example | apps/web/ | 🔴 P0 | None | 1h |

### PRE-LOGIN WEBSITE TASKS

| ID | Task | Component/File | Priority | Doc Ref | Est. Hours |
|----|------|----------------|----------|---------|-----------|
| A-05 | FloatingNav | components/nav/FloatingNav.tsx | 🔴 P0 | Design §2.1 | 6h |
| A-06 | Footer | components/layout/Footer.tsx | 🔴 P0 | Design §H-11 | 4h |
| A-07 | AnnouncementBanner | components/layout/AnnouncementBanner.tsx | 🟡 P1 | Design §5.2 | 2h |
| B-01 | Hero section | components/home/HeroSection.tsx | 🔴 P0 | Design §H-01 | 12h |
| B-02 | Pain + Calculator | components/home/PainSection.tsx | 🔴 P0 | Design §H-02 | 8h |
| B-03 | How It Works | components/home/HowItWorksSection.tsx | 🔴 P0 | Design §H-03 | 8h |
| B-04 | Accuracy section | components/home/AccuracySection.tsx | 🔴 P0 | Design §H-04 | 8h |
| B-05 | Testimonials | components/home/TestimonialsSection.tsx | 🔴 P0 | Design §H-05 | 6h |
| B-06 | Pricing teaser | components/home/PricingTeaserSection.tsx | 🔴 P0 | Design §H-06 | 8h |
| B-07 | Feature tabs | components/home/FeatureTabsSection.tsx | 🟡 P1 | Design §H-07 | 8h |
| B-08 | Trust section | components/home/TrustSection.tsx | 🔴 P0 | Design §H-08 | 4h |
| B-09 | FAQ accordion | components/home/FAQSection.tsx | 🔴 P0 | Design §H-09 | 4h |
| B-10 | Final CTA | components/home/FinalCTASection.tsx | 🔴 P0 | Design §H-10 | 2h |
| B-11 | Homepage assembly | app/(marketing)/page.tsx | 🔴 P0 | Req §FR-SEO-002 | 4h |
| C-01 | Pricing page | app/(marketing)/pricing/ | 🔴 P0 | Req §FR-PRICING-001 | 10h |
| C-02 | Accuracy page | app/(marketing)/accuracy/ | 🟡 P1 | Req §FR-ACCURACY-001 | 8h |
| C-03 | Gorakhpur page | app/(marketing)/gorakhpur/ | 🟡 P1 | Req §FR-GORAKHPUR-001 | 6h |
| C-03a | District sub-pages (4) | app/(marketing)/[district]/ | 🟡 P1 | Req §FR-GORAKHPUR-001 | 8h |
| C-04 | Case studies | app/(marketing)/case-studies/ | 🟡 P1 | Req §FR-CASESTUDIES-001 | 10h |
| C-05 | Blog index | app/(marketing)/blog/ | 🟢 P2 | Req §FR-BLOG-001 | 8h |
| C-05a | Blog post template | app/(marketing)/blog/[slug]/ | 🟢 P2 | Req §FR-BLOG-001 | 8h |
| C-06 | About page | app/(marketing)/about/ | 🟢 P2 | Req §FR-ABOUT-001 | 6h |
| C-07 | Enterprise page | app/(marketing)/enterprise/ | 🟢 P2 | Req §FR-ENTERPRISE-001 | 8h |
| C-08 | WhatsApp demo page | app/(marketing)/try-whatsapp/ | 🟡 P1 | Req §FR-WHATSAPP-DEMO-001 | 6h |
| C-09 | FAQ page | app/(marketing)/faq/ | 🟡 P1 | — | 4h |
| C-10 | Press page | app/(marketing)/press/ | 🟢 P2 | — | 4h |
| C-11 | Legal pages (3) | app/(marketing)/privacy+terms+refund/ | 🔴 P0 | Req §FR-TECH-004 | 6h |
| C-12 | 404 page | app/not-found.tsx | 🔴 P0 | — | 3h |

### MOTION & ANIMATION TASKS

| ID | Task | Component | Priority | Doc Ref | Est. Hours |
|----|------|-----------|----------|---------|-----------|
| M-01 | FadeUp component | components/motion/FadeUp.tsx | 🔴 P0 | Motion §2.1 | 2h |
| M-02 | StaggerGroup component | components/motion/StaggerGroup.tsx | 🔴 P0 | Motion §2.2 | 2h |
| M-03 | CountUp component | components/motion/CountUp.tsx | 🔴 P0 | Motion §2.3 | 3h |
| M-04 | PriceTickerMockup | components/motion/PriceTickerMockup.tsx | 🔴 P0 | Motion §2.4 | 4h |
| M-05 | StickyScrollSteps | components/motion/StickyScrollSteps.tsx | 🟡 P1 | Motion §2.5 | 5h |
| M-06 | ScrollProgress | components/motion/ScrollProgress.tsx | 🟢 P2 | Motion §2.6 | 2h |
| M-07 | DataFlowTicker | components/motion/DataFlowTicker.tsx | 🟡 P1 | Motion §2.7 | 3h |
| M-08 | Reduced motion hook | hooks/useReducedMotion.ts | 🔴 P0 | Motion §6.2 | 2h |
| M-09 | Illustration system | components/illustrations/ | 🟡 P1 | Motion §5.1 | 8h |

### POPUP & CRO TASKS

| ID | Task | Component | Priority | Doc Ref | Est. Hours |
|----|------|-----------|----------|---------|-----------|
| D-01 | Exit intent popup | components/popups/ExitIntentPopup.tsx | 🟡 P1 | Req §FR-HOME-007 | 6h |
| D-02 | Demo request modal | components/popups/DemoModal.tsx | 🔴 P0 | Req §FR-POPUP-001 | 5h |
| D-03 | Blog scroll popup | components/popups/BlogScrollPopup.tsx | 🟢 P2 | Req §FR-POPUP-002 | 4h |
| D-04 | Popup provider | providers/PopupProvider.tsx | 🔴 P0 | Req §FR-POPUP-001 | 2h |

### API ROUTES

| ID | Task | File | Priority | Doc Ref | Est. Hours |
|----|------|------|----------|---------|-----------|
| E-01 | Lead capture API | app/api/leads/route.ts | 🔴 P0 | Req §FR-LEADS-001 | 4h |
| E-02 | Demo request API | app/api/demo-requests/route.ts | 🔴 P0 | Req §FR-POPUP-001 | 3h |
| E-03 | Health check | app/api/health/route.ts | 🔴 P0 | Req §FR-TECH-005 | 1h |
| E-04 | Sitemap | app/sitemap.ts | 🔴 P0 | Req §FR-SEO-001 | 3h |
| E-05 | Robots.txt | app/robots.ts | 🔴 P0 | Req §FR-SEO-001 | 1h |
| E-06 | OG image generation | app/api/og/route.tsx | 🟢 P2 | Req §FR-BLOG-001 | 4h |

### SHARED UI COMPONENTS

| ID | Task | Component | Priority | Doc Ref | Est. Hours |
|----|------|-----------|----------|---------|-----------|
| UI-01 | Button component | components/ui/Button.tsx | 🔴 P0 | Design §1.3 | 3h |
| UI-02 | Card component | components/ui/Card.tsx | 🔴 P0 | Design §1.3 | 2h |
| UI-03 | Eyebrow badge | components/ui/EyebrowBadge.tsx | 🔴 P0 | Design §4C | 1h |
| UI-04 | Stat metric block | components/ui/StatBlock.tsx | 🔴 P0 | — | 2h |
| UI-05 | Language toggle | components/ui/LanguageToggle.tsx | 🔴 P0 | Req §FR-COPY-001 | 3h |
| UI-06 | WhatsApp share button | components/ui/WhatsAppShare.tsx | 🟡 P1 | Req §FR-REFERRAL-001 | 1h |
| UI-07 | Price display | components/ui/PriceDisplay.tsx | 🟡 P1 | — | 3h |
| UI-08 | Currency formatter | lib/formatCurrency.ts | 🔴 P0 | Req §FR-HOME-002 | 2h |
| UI-09 | Analytics tracker | lib/analytics.ts | 🔴 P0 | Req §FR-TECH-003 | 3h |
| UI-10 | Scroll progress | components/ui/ScrollProgress.tsx | 🟢 P2 | Motion §2.6 | 2h |

### SEO COMPONENTS

| ID | Task | Component | Priority | Doc Ref | Est. Hours |
|----|------|-----------|----------|---------|-----------|
| G-01 | Base metadata | lib/seo/metadata.ts | 🔴 P0 | SEO §2.1 | 2h |
| G-02 | Organization schema | components/seo/OrganizationSchema.tsx | 🔴 P0 | SEO §3.3 | 1h |
| G-03 | FAQ schema | components/seo/FAQSchema.tsx | 🔴 P0 | SEO §3.3 | 1h |
| G-04 | BlogPosting schema | components/seo/BlogPostingSchema.tsx | 🟢 P2 | SEO §3.3 | 1h |
| G-05 | Pricing schema | components/seo/PricingSchema.tsx | 🟡 P1 | SEO §3.3 | 1h |
| G-06 | Hreflang meta | components/seo/HreflangMeta.tsx | 🔴 P0 | SEO §3.1 | 1h |

### DASHBOARD TASKS

| ID | Task | File | Priority | Doc Ref | Est. Hours |
|----|------|------|----------|---------|-----------|
| DA-01 | Dashboard root layout | app/(dashboard)/layout.tsx | 🟡 P1 | Dashboard §2 | 8h |
| DA-02 | Sidebar component | components/dashboard/Sidebar.tsx | 🟡 P1 | Dashboard §2.1 | 5h |
| DA-03 | Dashboard header | components/dashboard/DashboardHeader.tsx | 🟡 P1 | Dashboard §2.2 | 4h |
| DA-04 | Supabase dashboard utils | utils/supabase/dashboard.ts | 🟡 P1 | Dashboard §1 | 4h |
| DA-05 | Recharts config | lib/charts/config.ts | 🟡 P1 | Dashboard §1.4 | 3h |
| DA-06 | Loading skeletons | components/dashboard/skeletons/ | 🟡 P1 | Dashboard §6 | 4h |
| DA-07 | Empty states | components/dashboard/EmptyState.tsx | 🟡 P1 | Dashboard §4 | 4h |
| DA-08 | Error states | components/dashboard/ErrorState.tsx | 🟡 P1 | Dashboard §5 | 3h |
| DB-01 | Overview page | app/(dashboard)/overview/ | 🟡 P1 | Dashboard §D-01 | 16h |
| DB-02 | Price intelligence | app/(dashboard)/price-intelligence/ | 🟡 P1 | Dashboard §D-02 | 16h |
| DB-03 | Alerts page | app/(dashboard)/alerts/ | 🟡 P1 | Dashboard §D-03 | 12h |
| DB-04 | Calculator page | app/(dashboard)/calculator/ | 🟢 P2 | Dashboard §D-04 | 12h |
| DB-05 | Accuracy page | app/(dashboard)/accuracy/ | 🟡 P1 | Dashboard §D-06 | 16h |
| DB-06 | Customers page | app/(dashboard)/customers/ | 🟡 P1 | Dashboard §D-07 | 14h |
| DB-07 | Settings page | app/(dashboard)/settings/ | 🟡 P1 | Dashboard §D-08 | 12h |
| DB-08 | API access page | app/(dashboard)/api/ | 🟢 P2 | Dashboard §D-05 | 10h |
| DB-09 | 403 page | app/(dashboard)/403/ | 🟡 P1 | Dashboard §5 | 2h |
| DB-10 | Mobile-only page | app/(dashboard)/mobile-only/ | 🟡 P1 | Post-login §3 | 2h |

### REFERRAL PROGRAM TASKS

| ID | Task | File | Priority | Doc Ref | Est. Hours |
|----|------|------|----------|---------|-----------|
| H-01 | Refer page | app/(marketing)/refer/ | 🟢 P2 | Press §6.1 | 6h |
| H-02 | Code generation API | app/api/referral/generate/ | 🟢 P2 | Tasks §H-02 | 3h |
| H-03 | Attribution API | app/api/referral/apply/ | 🟢 P2 | Tasks §H-03 | 3h |

### TESTING & DEPLOYMENT

| ID | Task | File | Priority | Est. Hours |
|----|------|------|----------|-----------|
| T-01 | Lighthouse CI workflow | .github/workflows/ci.yml | 🔴 P0 | 3h |
| T-02 | A11y component tests | __tests__/a11y/ | 🟡 P1 | 8h |
| T-03 | E2E critical path | e2e/ | 🔴 P0 | 12h |
| T-04 | Visual regression | e2e/snapshots/ | 🟡 P1 | 6h |
| T-05 | Hindi text validation | __tests__/typography/ | 🟡 P1 | 4h |
| J-01 | Vercel configuration | vercel.json | 🔴 P0 | 2h |
| J-02 | Env var documentation | .env.example | 🔴 P0 | 1h |

---

## 4. CRITICAL PATH (P0 SPRINT)

```
WEEK 1: Infrastructure
  Day 1-2: F-01 → F-02 → F-03 → F-04 → F-05 (monorepo + tokens + Next.js)
  Day 3-4: F-06 → F-07 → F-08 → F-09 → F-10 (fonts + Supabase + middleware + CSS)
  Day 5: UI-08 → UI-09 → G-01 → G-02 → G-03 → G-06 (utilities + schemas)

WEEK 2: Core Homepage
  Day 6-7: M-01 → M-02 → M-03 → M-04 + M-08 (motion components)
  Day 8: UI-01 → UI-02 → UI-03 → UI-04 → UI-05 (shared UI)
  Day 9-10: A-05 → A-06 (nav + footer — used on all pages)
  Day 11-12: B-01 (hero — most complex pre-login component)

WEEK 3: Homepage Completion
  Day 13: B-02 (pain + calculator)
  Day 14: B-03 (how it works)
  Day 15: B-04 (accuracy — needs Supabase query)
  Day 16: B-05 + B-08 (testimonials + trust)
  Day 17: B-06 (pricing)
  Day 18: B-09 + B-10 (FAQ + final CTA)
  Day 19: B-11 (assembly + metadata)

WEEK 4: APIs + Conversion
  Day 20: E-01 → E-02 → E-03 (lead + demo + health APIs)
  Day 21: D-02 → D-04 (demo modal + popup provider)
  Day 22: E-04 → E-05 (sitemap + robots)
  Day 23: C-11 (legal pages — DPDP P0 blocker)
  Day 24: C-01 (pricing page)
  Day 25: C-12 + J-01 + J-02 (404 + Vercel config + env docs)

WEEK 5: Testing + QA
  Day 26-27: T-03 (E2E critical path)
  Day 28: T-01 (Lighthouse CI)
  Day 29: T-05 (Hindi text validation)
  Day 30: Full pre-launch audit + fixes

=== ACCURACY GATE CHECK ===
Before any customer is onboarded:
  [ ] Model directional accuracy ≥ 95% on Gorakhpur holdout (30-day rolling)
  [ ] MAPE < 6%
  [ ] Conformal coverage 78-82%
  [ ] All P0 tasks complete
  [ ] Legal pages live
  [ ] DPDP compliance verified
  [ ] WhatsApp Business API approved
  [ ] /api/health returns 200
  [ ] Lighthouse mobile ≥ 85
  [ ] Hindi text renders correctly on mid-range Android
  [ ] Exit popup respects consent requirements
=== ONLY THEN: FIRST CUSTOMER ONBOARDED ===
```

---

## 5. ENVIRONMENT VARIABLES REFERENCE

```bash
# apps/web/.env.local (never commit)

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]   # Safe to expose — RLS protected
SUPABASE_SERVICE_ROLE_KEY=[service-key]    # NEVER expose in client code

# Twilio (WhatsApp delivery)
TWILIO_ACCOUNT_SID=[sid]
TWILIO_AUTH_TOKEN=[token]
TWILIO_WHATSAPP_NUMBER=whatsapp:+91XXXXXXXXXX

# Application
NEXT_PUBLIC_APP_URL=https://poultrypulse.ai
NEXT_PUBLIC_APP_VERSION=0.1.0

# Analytics (optional, Vercel Analytics is automatic)
NEXT_PUBLIC_ANALYTICS_ENABLED=true

# Feature flags
NEXT_PUBLIC_ACCURACY_GATE_CLEARED=false   # Set to true only when model ≥ 95%
NEXT_PUBLIC_PHASE=0                        # 0, 1, or 2 — controls feature visibility
```

---

## 6. CODING STANDARDS

### 6.1 TypeScript Rules

```typescript
// tsconfig.json — strict mode required
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true  // Prevents undefined array access bugs
  }
}

// REQUIRED:
// - All function parameters and return types explicitly typed
// - No `any` — use `unknown` and type-narrow if needed
// - All Supabase query results typed via generated database.ts types
// - Zod validation on ALL API route inputs
// - No implicit any from JSON.parse — always validate with Zod
```

### 6.2 Component Standards

```typescript
// Every component file follows this structure:
// 1. 'use client' or 'use server' directive (if needed)
// 2. Imports (external → internal → local)
// 3. TypeScript interface/type definitions
// 4. Component function (named export preferred)
// 5. Sub-components (if small enough to colocate)
// 6. Default export at bottom (if needed)

// Example:
'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { formatINR } from '@/lib/formatCurrency';

interface StatBlockProps {
  value: number;
  label: string;
  labelHi: string;
  prefix?: string;
  suffix?: string;
}

export function StatBlock({ value, label, labelHi, prefix, suffix }: StatBlockProps) {
  // Implementation
}
```

### 6.3 Hindi Text Handling

```typescript
// ALWAYS provide both Hindi and English versions
// Use language context (not conditional rendering) for switching

// ✓ Correct:
const { locale } = useLanguage();
<h1>{locale === 'hi' ? titleHi : titleEn}</h1>

// ✗ Wrong:
<h1>{titleHi}</h1>  // No English fallback

// Numbers in Hindi text:
// ✓ Correct: "₹1.5 लाख" (use formatINR with locale='hi')
// ✗ Wrong: "₹150000" or "1,50,000"

// Line-height for Devanagari:
// Always: leading-relaxed (1.625) minimum for body text
// Headlines: leading-snug (1.375) minimum
// Never: leading-tight (1.25) with Devanagari — matras get cut off
```

---

## 7. NON-NEGOTIABLE RULES (All Kiro Agents Must Follow)

```
RULE 1 — ACCURACY GATE:
  Never display live price data, sell signals, or accuracy metrics to 
  unauthenticated users with real-time data labels unless accuracy gate 
  is confirmed cleared (NEXT_PUBLIC_ACCURACY_GATE_CLEARED=true).
  When false: show demo data with visible "(Demo)" label.
  
RULE 2 — NEVER BLANK:
  No component may render a blank space where data is expected.
  Always: loading skeleton → data OR loading skeleton → empty state.
  The word "null" must never appear in any rendered output.

RULE 3 — DPDP COMPLIANCE:
  No phone number, name, or farm data collected without:
  a) explicit checkbox (not pre-checked)
  b) description of purpose
  c) storage in Supabase India region (ap-south-1)
  
RULE 4 — NO RAW ERRORS:
  No HTTP error codes, stack traces, or technical error messages in UI.
  Always: human-friendly Hindi message + actionable recovery option.

RULE 5 — P10/P50/P90 ALWAYS VISIBLE:
  In ANY chart showing price predictions, all three bands must be visible.
  No chart may show P50 only without P10 and P90 context bands.
  
RULE 6 — HINDI MINIMUM:
  All user-facing copy available in Hindi.
  No page launches without Hindi copy reviewed by native UP speaker.
  
RULE 7 — REDUCED MOTION:
  All animations respect prefers-reduced-motion.
  No exceptions — this is an accessibility requirement.
  
RULE 8 — FAKE URGENCY BANNED:
  No countdown timers unless counting to a real date.
  No "X people viewing" unless real and accurate.
  No "Last spot" unless genuinely limited.
  
RULE 9 — MOBILE FIRST VALIDATION:
  Every component tested at 390px (iPhone 14) before desktop.
  All touch targets minimum 44×44px.
  No text below 14px on mobile.
  
RULE 10 — SECURITY:
  SUPABASE_SERVICE_ROLE_KEY must never appear in client-side code.
  All admin API routes check role === 'admin' server-side.
  Rate limiting on all public API routes.
```

---

## 8. LAUNCH READINESS CHECKLIST

```
PRE-LAUNCH TECHNICAL:
  □ Accuracy gate: model ≥ 95% directional, MAPE < 6%
  □ All P0 tasks complete and tested
  □ E2E critical path tests passing
  □ Lighthouse mobile ≥ 85 (performance, accessibility ≥ 90)
  □ No TypeScript errors (npx tsc --noEmit passes)
  □ No ESLint errors
  □ All schemas validated (Google Rich Results Test)
  □ Sitemap submitted to Google Search Console
  □ robots.txt verified (all AI crawlers allowed)
  □ WhatsApp Business API approved (production)
  □ /api/health returns { status: 'ok', supabase: true }
  □ Uptime monitoring configured
  □ Error monitoring configured

PRE-LAUNCH CONTENT:
  □ Hindi copy: reviewed by native UP speaker
  □ All statistics verified with source citations
  □ Legal pages live (privacy, terms, refund)
  □ DPDP compliance reviewed by legal counsel
  □ Case studies with farmer consent/aliases
  □ Press kit uploaded to /press/

PRE-LAUNCH BUSINESS:
  □ WhatsApp Business profile complete
  □ First 3 message templates approved by Meta
  □ Payment gateway configured (Razorpay, Phase 1)
  □ Refund policy clear (30-day accuracy guarantee)
  □ Support phone/WhatsApp staffed

FIRST CUSTOMER ONBOARDING:
  □ Founder does first 10 onboardings personally (validate flow)
  □ Manual accuracy tracking for first 30 days
  □ Customer feedback collected at Day 7 and Day 14
  □ NPS survey at trial end
```

---

*Document: 09_kiro_implementation_manifest.md*

---

## DOCUMENT INDEX SUMMARY

| File | Content | Pages | Status |
|------|---------|-------|--------|
| 01_prelogin_design_master.md | Complete UI/UX for all pre-login pages | 17 pages spec'd | ✅ Complete |
| 02_prelogin_requirements_master.md | All functional requirements, SEO, DPDP | 50+ requirements | ✅ Complete |
| 03_prelogin_tasks_master.md | Kiro task list, code scaffolds, QA | 60+ tasks | ✅ Complete |
| 04_postlogin_design_master.md | Dashboard UI/UX for 9 pages | 9 pages spec'd | ✅ Complete |
| 05_postlogin_requirements_tasks.md | Dashboard requirements + tasks | 8 pages + APIs | ✅ Complete |
| 06_content_seo_master.md | Full SEO strategy, 10 article briefs, keywords | 100+ keyword targets | ✅ Complete |
| 07_motion_animation_master.md | All animations, components, CSS | 20+ components | ✅ Complete |
| 08_external_assets_press_master.md | Press kit, psychology, CRO, referral | Full press + psych | ✅ Complete |
| 09_kiro_implementation_manifest.md | Master index, file structure, launch checklist | Orchestration doc | ✅ Complete |

**Total estimated implementation hours:** ~450–500 hours
**Critical path (P0 only):** ~200 hours / ~6 weeks (3 engineers)
**Full feature complete (P0+P1):** ~350 hours / ~10 weeks (3 engineers)
