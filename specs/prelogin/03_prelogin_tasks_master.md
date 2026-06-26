# PoultryPulse AI — Pre-Login Website Task Master
# File: 03_prelogin_tasks_master.md
# Kiro Compatibility: ✅ Full Kiro Agent Implementation Ready
# Version: v1.0 | May 2026 | CONFIDENTIAL

---

## AGENT CONTEXT BLOCK
```
ROLE: Senior Full-Stack Engineer (Next.js 15 + TypeScript + Tailwind + Supabase)
FOUNDATION: 01_prelogin_design_master.md + 02_prelogin_requirements_master.md + PRD v3.0 + Architecture v1.0
STACK: Next.js 15 App Router, TypeScript strict, Tailwind CSS v3, Framer Motion, Supabase SSR, Vercel Edge
OUTPUT FORMAT: Standard Kiro task JSON with file_path, purpose, dependencies, exports, code, qa_checks
ACCURACY GATE: NEVER display live pricing data or sell signals on public site without 95%+ accuracy confirmed
```

---

## OUTPUT FORMAT (for every code task)

```json
{
  "file_path": "apps/web/relative/path.tsx",
  "purpose": "One-sentence description",
  "dependencies": ["list", "of", "npm", "packages"],
  "exports": ["named", "exports"],
  "code": "// Full implementation",
  "qa_checks": [
    "Hindi text renders without clipping at 16px",
    "CTA fires analytics event on click",
    "Popup does not appear on mobile"
  ]
}
```

---

## TASK GROUP A: FOUNDATION & DESIGN SYSTEM

- [ ] **A-01** — Web token package extension
  - Extend `packages/ui/src/tokens.ts` with `WebTokens` object from design doc §1.1
  - Add `WebTypography`, `WebSpacing`, `WebMotion` objects
  - Export as named exports + default object
  - _Requirements: Design §1.1–1.4_

- [ ] **A-02** — Google Fonts integration
  - In `apps/web/app/layout.tsx`: add `next/font/google` for Sora, Plus Jakarta Sans, Noto Sans Devanagari
  - Subset: `latin,latin-ext,devanagari` for Noto Sans; `latin,latin-ext` for Sora/Plus Jakarta Sans
  - Font weights: Sora (400,700,800), Plus Jakarta Sans (400,500,600,700), Noto Sans Devanagari (400,500,700)
  - `font-display: swap` on all
  - Apply CSS variables: `--font-sora`, `--font-jakarta`, `--font-devanagari`
  - _Requirements: FR-TECH-001, Design §1.2_

- [ ] **A-03** — Base layout and metadata configuration
  - `apps/web/app/layout.tsx` — pre-login shell (no auth guard on root)
  - Root metadata: title template `%s | PoultryPulse AI`, default title, default OG image
  - Vercel Analytics component
  - Announcement banner (dismissable, sessionStorage)
  - Skip-to-content link as first focusable element
  - Language `<html lang="hi">` by default with toggle mechanism
  - _Requirements: FR-HOME-001, FR-SEO-002, FR-TECH-003_

- [ ] **A-04** — Tailwind config extension
  - Extend `apps/web/tailwind.config.ts` with brand colours, font families, spacing scale, animation keyframes
  - Custom keyframes: `fade-up`, `fade-in`, `blur-in`, `count-up`
  - Custom animation durations matching `WebMotion` tokens
  - `brandGreen`, `saffron`, `amber` colour scales
  - _Requirements: Design §1.1_

- [ ] **A-05** — Navigation component
  - `apps/web/components/nav/FloatingNav.tsx` — floating glass pill nav
  - Scroll-aware: shrink padding after 50px scroll
  - Desktop: all nav items + CTAs
  - Mobile: hamburger → morph to X → full-screen overlay with staggered links
  - Language toggle (hi/en) in overlay
  - `'use client'` — interactive
  - _Requirements: Design §2.1, FR-TECH-001_
  
  ```typescript
  // QA checks:
  // - Hamburger morphs correctly at 768px breakpoint
  // - Focus trap works in mobile overlay
  // - Nav CTA fires hero_cta_click event with source='nav'
  // - Backdrop blur only on nav element, not scrolling content
  ```

- [ ] **A-06** — Footer component
  - `apps/web/components/layout/Footer.tsx` — 5-column grid desktop, 2-column mobile
  - All links from design doc §H-11
  - Language-aware copy
  - Social links (WhatsApp, email)
  - Legal: © notice, DPDP compliance note, CIN
  - _Requirements: Design §H-11_

- [ ] **A-07** — Announcement banner component
  - `apps/web/components/layout/AnnouncementBanner.tsx`
  - sessionStorage dismissal
  - Phase 0 launch copy (Hindi + English)
  - CTA links to `/signup`
  - 44px touch target on dismiss X
  - _Requirements: Design §5.2, FR-POPUP-001_

---

## TASK GROUP B: HOMEPAGE SECTIONS

- [ ] **B-01** — Hero section
  - `apps/web/components/home/HeroSection.tsx`
  - `'use client'` for phone mockup animation
  - Eyebrow badge, H1 (Hindi/English), sub-headline, CTA block
  - Phone mockup with 3-state price cycle (Framer Motion `AnimatePresence`)
  - Social proof strip with Supabase customer count (SSR)
  - Trust micro-text below CTAs
  - Entrance animation: staggered fade-up (100ms delays)
  - Hero gradient background (CSS, not image)
  - _Requirements: FR-HOME-001, Design §H-01_

  ```json
  {
    "dependencies": ["framer-motion", "@supabase/ssr"],
    "qa_checks": [
      "Phone mockup animation runs at 60fps on mid-range Android (via Chrome DevTools)",
      "H1 renders in Noto Sans Devanagari for Hindi version",
      "Primary CTA fires hero_cta_click event with utm params",
      "Social proof count shows 'गणना हो रही है...' during SSR hydration, then real count",
      "min-h-[100dvh] used on hero section, not h-screen",
      "Animation respects prefers-reduced-motion"
    ]
  }
  ```

- [ ] **B-02** — Pain amplification section + loss calculator
  - `apps/web/components/home/PainSection.tsx`
  - `'use client'` for interactive calculator
  - Pain point cards (4 cards, bento layout)
  - `LossCalculator` sub-component with slider + batch segmented control
  - Indian number formatting utility (lakhs/crores)
  - Scroll-reveal animation via IntersectionObserver
  - _Requirements: FR-HOME-002, Design §H-02_

  ```typescript
  // formatIndianCurrency(amount: number): string
  // 50000 → "₹50,000"  
  // 150000 → "₹1.5 लाख"
  // 1200000 → "₹12 लाख"
  // 10000000 → "₹1 करोड़"
  ```

- [ ] **B-03** — How It Works section (sticky scroll steps)
  - `apps/web/components/home/HowItWorksSection.tsx`
  - `'use client'` for sticky scroll + step animation
  - 3 steps with sticky cards
  - Data source ticker animation (Step 1)
  - WhatsApp message mockup (Step 3)
  - "WhatsApp Demo आज़माएं →" CTA in Step 3
  - IntersectionObserver for step activation
  - _Requirements: Design §H-03_

- [ ] **B-04** — Accuracy proof section
  - `apps/web/components/home/AccuracySection.tsx`
  - Server component fetching `mv_accuracy_dashboard` from Supabase
  - 4 stat metric blocks with counter animations (client sub-component)
  - `AccuracyChart` client sub-component (Recharts AreaChart)
  - Methodology transparency block
  - Guarantee statement
  - Fallback: demo data when Supabase unavailable
  - _Requirements: FR-HOME-003, Design §H-04_

  ```json
  {
    "dependencies": ["recharts", "@supabase/ssr"],
    "qa_checks": [
      "Renders demo data with (Demo) label when Supabase times out",
      "Chart has aria-label and hidden data table for screen readers",
      "Colour coding: green ≥95%, amber 90-95%, red <90%",
      "Counter animation disabled with prefers-reduced-motion",
      "Live accuracy not shown if accuracy gate not cleared (shows 'Validating...')"
    ]
  }
  ```

- [ ] **B-05** — Testimonials + press section
  - `apps/web/components/home/TestimonialsSection.tsx`
  - Hardcoded testimonial data (3 cards)
  - Z-axis cascade layout (varying card depths)
  - Financial outcome badge on each card
  - Verified marker on primary testimonial
  - Fallback avatar component (initials-based)
  - Press logos strip (SVG, greyscale → colour on hover)
  - _Requirements: FR-HOME-004, Design §H-05_

- [ ] **B-06** — Pricing teaser section with ROI calculator
  - `apps/web/components/home/PricingTeaserSection.tsx`
  - `'use client'` for ROI calculator
  - 3 pricing cards (PulseFarm, PulsePro, PulseIntel)
  - "Most Popular" badge on PulsePro
  - Feature lists with check/cross marks
  - Annual/Monthly toggle (inline, no page reload)
  - ROI calculator with farm size selector
  - Indian currency formatting
  - "₹67/day framing" shown below PulseFarm price
  - _Requirements: FR-HOME-005, Design §H-06, FR-PSYCH-001_

- [ ] **B-07** — Feature deep-dive tabbed section
  - `apps/web/components/home/FeatureTabsSection.tsx`
  - `'use client'` for tab state
  - 4 tabs: Today's Price, When to Sell, Alerts, WhatsApp
  - Keyboard accessible (arrow key navigation)
  - Each tab panel with feature visual + copy
  - Tab indicator: animated slide with Framer Motion `layoutId`
  - WhatsApp message mockup in Tab 4
  - _Requirements: Design §H-07_

- [ ] **B-08** — Trust & transparency section
  - `apps/web/components/home/TrustSection.tsx`
  - 4 transparency point columns
  - Team credibility block
  - All claims with specific data backing
  - Link to `/accuracy` page
  - _Requirements: Design §H-08_

- [ ] **B-09** — FAQ accordion section
  - `apps/web/components/home/FAQSection.tsx`
  - 8 FAQ items from requirements doc
  - Accessible accordion (`role="list"`, `aria-expanded`, `aria-hidden`)
  - Smooth height animation (300ms)
  - Single-expand mode
  - FAQ JSON-LD schema injected via `<script type="application/ld+json">`
  - _Requirements: FR-HOME-006, FR-SEO-003, Design §H-09_

- [ ] **B-10** — Final CTA section
  - `apps/web/components/home/FinalCTASection.tsx`
  - Dark green background section
  - Main headline + sub-copy (Hindi/English)
  - Large CTA button
  - 3 trust badges (data safe, DPDP, star rating)
  - _Requirements: Design §H-10_

- [ ] **B-11** — Homepage assembly
  - `apps/web/app/(marketing)/page.tsx`
  - Assemble all section components
  - `generateMetadata` function with full SEO metadata (FR-SEO-002)
  - Organization + WebSite + FAQPage JSON-LD schemas
  - Supabase SSR client in RSC for customer count + accuracy data
  - _Requirements: FR-SEO-002, FR-SEO-003_

---

## TASK GROUP C: SECONDARY PAGES

- [ ] **C-01** — Pricing page (`/pricing`)
  - `apps/web/app/(marketing)/pricing/page.tsx`
  - Full pricing page with comparison table (15+ features)
  - Annual/monthly toggle with URL persistence (`?billing=annual`)
  - Enterprise plan enquiry form or Calendly embed
  - Pricing FAQ (5 questions)
  - Product schema JSON-LD for each plan
  - `generateMetadata` with pricing-specific title/description
  - _Requirements: FR-PRICING-001_

- [ ] **C-02** — Accuracy dashboard page (`/accuracy`)
  - `apps/web/app/(marketing)/accuracy/page.tsx`
  - Server component with ISR (`revalidate: 600`)
  - Live accuracy metrics from Supabase
  - 90-day MAPE trend chart
  - 30-day actual vs predicted scatter
  - 3 accuracy gate indicators
  - Model version display
  - Methodology section
  - Dataset JSON-LD schema
  - _Requirements: FR-ACCURACY-001_

- [ ] **C-03** — Gorakhpur local SEO page (`/gorakhpur`)
  - `apps/web/app/(marketing)/gorakhpur/page.tsx`
  - Live price widget (latest prediction for Gorakhpur mandi)
  - Local market profile
  - District-specific testimonials
  - Internal links to adjacent district pages
  - LocalBusiness + FAQPage JSON-LD schemas
  - Keyword-optimised H1 + meta
  - _Requirements: FR-GORAKHPUR-001_

  - [ ] **C-03a** — District sub-pages (Deoria, Kushinagar, Basti, Maharajganj)
    - Template component: `apps/web/components/districts/DistrictPage.tsx`
    - Pages: `/deoria`, `/kushinagar`, `/basti`, `/maharajganj`
    - Same structure as Gorakhpur, parameterised by district slug
    - District-specific price widget, local market data, mandis

- [ ] **C-04** — Case studies index + detail pages
  - `apps/web/app/(marketing)/case-studies/page.tsx`
  - `apps/web/app/(marketing)/case-studies/[slug]/page.tsx`
  - MDX-based case study content
  - Challenge → Solution → Outcome structure
  - Article JSON-LD schema on detail pages
  - Related case studies sidebar
  - _Requirements: FR-CASESTUDIES-001_

- [ ] **C-05** — Blog index page
  - `apps/web/app/(marketing)/blog/page.tsx`
  - Supabase-powered or MDX-based posts
  - Category filter tabs
  - Search (client-side Fuse.js)
  - Pagination (12 per page)
  - Blog JSON-LD schema
  - `generateMetadata` per page
  - _Requirements: FR-BLOG-001_

  - [ ] **C-05a** — Blog post template
    - `apps/web/app/(marketing)/blog/[slug]/page.tsx`
    - ISR: `revalidate: 3600`
    - MDX rendering with custom components (callout, stat block, farmer quote)
    - Author bio block
    - Table of contents sidebar (auto-generated from headings)
    - Related posts (3, same category)
    - BlogPosting + BreadcrumbList JSON-LD schemas
    - `og:image` dynamic generation via `next/og`
    - Scroll progress indicator (CSS scroll-driven animation)
    - _Requirements: FR-BLOG-001, FR-SEO-004_

- [ ] **C-06** — About page (`/about`)
  - `apps/web/app/(marketing)/about/page.tsx`
  - Founding story (narrative, Ann Handley voice)
  - Team section
  - Timeline component (Phase 0 → Phase 1 → roadmap)
  - Organization JSON-LD schema
  - _Requirements: FR-ABOUT-001_

- [ ] **C-07** — Enterprise page (`/enterprise`)
  - `apps/web/app/(marketing)/enterprise/page.tsx`
  - Segment grid (5 segments: S2–S6)
  - Feature list (API, historical data, white-label, SLA)
  - Demo booking form
  - Service JSON-LD schema
  - _Requirements: FR-ENTERPRISE-001_

- [ ] **C-08** — WhatsApp demo page (`/try-whatsapp`)
  - `apps/web/app/(marketing)/try-whatsapp/page.tsx`
  - Phone + district form
  - Rate-limited submission (1 per phone)
  - Confirmation state
  - Upsell CTA
  - _Requirements: FR-WHATSAPP-DEMO-001_

- [ ] **C-09** — FAQ page (`/faq`)
  - `apps/web/app/(marketing)/faq/page.tsx`
  - All FAQ items (8 homepage + 10 additional)
  - Category groupings: General, Accuracy, Pricing, Technical, Privacy
  - FAQPage JSON-LD schema (all items)
  - Search within FAQ (client-side)

- [ ] **C-10** — Press / media page (`/press`)
  - `apps/web/app/(marketing)/press/page.tsx`
  - Download links: press kit ZIP, one-pager PDF
  - Media mentions (logos + article links)
  - Boilerplate copy (investor/journalist ready)
  - Press contact email

- [ ] **C-11** — Legal pages
  - `apps/web/app/(marketing)/privacy/page.tsx` — DPDP Act 2023 compliant privacy policy
  - `apps/web/app/(marketing)/terms/page.tsx` — Terms of service
  - `apps/web/app/(marketing)/refund/page.tsx` — Refund policy (30-day accuracy guarantee)
  - All in Hindi + English
  - Last-updated date visible

- [ ] **C-12** — 404 page
  - `apps/web/app/not-found.tsx`
  - Helpful navigation: "Go to homepage", "Try pricing", "Contact support"
  - Leo Natsume: illustrated empty state (chicken character — friendly)
  - No blank screen, no raw error codes

---

## TASK GROUP D: POPUPS & CONVERSION OVERLAYS

- [ ] **D-01** — Exit intent popup
  - `apps/web/components/popups/ExitIntentPopup.tsx`
  - `'use client'`
  - `mouseleave` on `document.documentElement`
  - 30-second initial delay before activating
  - sessionStorage + localStorage frequency capping
  - Mobile suppression (`window.innerWidth < 768`)
  - DPDP consent checkbox
  - Phone validation
  - POST to `/api/leads`
  - _Requirements: FR-POPUP-001, FR-HOME-007_

- [ ] **D-02** — Demo request modal
  - `apps/web/components/popups/DemoModal.tsx`
  - Triggered by "Live Demo देखें" CTA (global state via React Context)
  - Full form (name, phone, district, flock size, preferred time)
  - POST to `/api/demo-requests`
  - Focus trap + Escape to close
  - Analytics events
  - _Requirements: FR-POPUP-001 (Demo variant)_

- [ ] **D-03** — Blog scroll popup (slide-in)
  - `apps/web/components/popups/BlogScrollPopup.tsx`
  - `'use client'`
  - IntersectionObserver at 50% scroll of article body
  - Bottom-right slide-in (desktop), full-bottom (mobile)
  - Single WhatsApp field
  - sessionStorage dismissal
  - Only on blog post pages
  - _Requirements: FR-POPUP-002_

- [ ] **D-04** — Popup context provider
  - `apps/web/providers/PopupProvider.tsx`
  - `'use client'`
  - Manages global popup state (open/close, active popup type)
  - Prevents multiple popups from opening simultaneously
  - Exports: `usePopup` hook

---

## TASK GROUP E: API ROUTES

- [ ] **E-01** — Lead capture API
  - `apps/web/app/api/leads/route.ts`
  - Edge Runtime
  - Zod validation: `LeadRequestSchema`
  - Rate limiting: 5 per IP per hour (Vercel KV or in-memory map)
  - Supabase upsert to `leads` table
  - DPDP consent_given check
  - Trigger WhatsApp welcome via Supabase edge function
  - _Requirements: FR-LEADS-001_

  ```typescript
  // LeadRequestSchema (Zod)
  const LeadRequestSchema = z.object({
    phone: z.string().regex(/^[6-9]\d{9}$/, 'कृपया सही मोबाइल नंबर दर्ज करें'),
    source: z.enum(['exit_intent', 'whatsapp_demo', 'blog_scroll', 'hero', 'pricing', 'faq']),
    district: z.enum(['gorakhpur', 'deoria', 'kushinagar', 'basti', 'maharajganj', 'sant_kabir_nagar']).optional(),
    plan: z.enum(['pulsefarm', 'pulsepro', 'pulseintel']).optional(),
    consent_given: z.literal(true, { errorMap: () => ({ message: 'सहमति आवश्यक है' }) }),
    utm: z.object({
      source: z.string().optional(),
      medium: z.string().optional(),
      campaign: z.string().optional(),
    }).optional(),
  });
  ```

- [ ] **E-02** — Demo request API
  - `apps/web/app/api/demo-requests/route.ts`
  - Edge Runtime
  - Zod validation
  - Supabase insert to `demo_requests` table
  - Email notification to team (Resend or Supabase edge function)
  - Rate limit: 2 per phone per day
  - _Requirements: FR-POPUP-001 (demo variant)_

- [ ] **E-03** — Health check endpoint
  - `apps/web/app/api/health/route.ts`
  - Returns: `{ status: 'ok', supabase: boolean, version: string, timestamp: string }`
  - Supabase ping (simple `SELECT 1` query)
  - Used by uptime monitoring
  - _Requirements: FR-TECH-005_

- [ ] **E-04** — Sitemap generation
  - `apps/web/app/sitemap.ts`
  - All static pages with priorities and change frequencies
  - Dynamic blog posts from Supabase/MDX
  - Dynamic district pages
  - `lastmod` from page file modification time or content updated_at
  - _Requirements: FR-SEO-001_

- [ ] **E-05** — Robots.txt generation
  - `apps/web/app/robots.ts`
  - Allow: all public pages, all AI crawlers (GPTBot, PerplexityBot, ClaudeBot, etc.)
  - Disallow: `/dashboard/*`, `/api/*`, `/admin/*`
  - Sitemap reference
  - _Requirements: FR-SEO-001, FR-SEO-004_

- [ ] **E-06** — OG image generation
  - `apps/web/app/og/route.tsx`
  - Dynamic OG images for blog posts and case studies
  - Parameters: title, category, author
  - Branded: brand-green-700 background, white text, logo
  - Noto Sans Devanagari for Hindi titles
  - 1200×630 output
  - _Requirements: FR-BLOG-001_

---

## TASK GROUP F: SHARED UI COMPONENTS

- [ ] **F-01** — Button component (CTA variants)
  - `apps/web/components/ui/Button.tsx`
  - Variants: `primary` (green fill), `secondary` (ghost outline), `cta` (saffron orange), `ghost` (no border)
  - Sizes: `sm`, `md`, `lg`
  - Button-in-button trailing icon pattern (arrow in circle)
  - Active state: `scale-[0.98]` haptic press
  - Loading state: spinner (not circular generic — skeleton-matched width)
  - `'use client'` for animations
  - _Requirements: Design §1.3 (Nested CTA), Skills: high-end-visual-design §4B_

- [ ] **F-02** — Card component (Double-Bezel architecture)
  - `apps/web/components/ui/Card.tsx`
  - Outer shell + inner core nested architecture
  - Variants: `default`, `elevated`, `glass`, `tinted` (brand-green-50)
  - All cards use `rounded-[2rem]` outer, `rounded-[calc(2rem-0.375rem)]` inner
  - _Requirements: Design skills: high-end-visual-design §4A_

- [ ] **F-03** — Eyebrow badge component
  - `apps/web/components/ui/EyebrowBadge.tsx`
  - Pill shape, `brandGreen50` bg, `brandGreen700` text
  - Uppercase, 11px, letter-spacing 0.15em
  - Optional leading icon
  - _Requirements: Design §4C_

- [ ] **F-04** — Stat metric block
  - `apps/web/components/ui/StatBlock.tsx`
  - Large number (Sora font), label below, optional trend arrow
  - Counter animation (IntersectionObserver-triggered)
  - Indian number formatting
  - Colour variant for accuracy thresholds

- [ ] **F-05** — Hindi/English language toggle
  - `apps/web/components/ui/LanguageToggle.tsx`
  - `'use client'`
  - `hi` / `en` toggle stored in `localStorage` + cookie
  - Switches content language without page reload (React Context)
  - Fallback: `Accept-Language` header detection server-side
  - _Requirements: FR-COPY-001_

- [ ] **F-06** — WhatsApp share button
  - `apps/web/components/ui/WhatsAppShare.tsx`
  - Pre-composed WhatsApp deep link: `https://wa.me/?text=...`
  - Used in referral program and blog posts
  - WhatsApp green colour (#25D366)
  - "WhatsApp पर Share करें" label
  - _Requirements: FR-REFERRAL-001_

- [ ] **F-07** — Price display component
  - `apps/web/components/ui/PriceDisplay.tsx`
  - Formats price in ₹/kg
  - Shows P10/P50/P90 range
  - Direction arrow (up/down/neutral)
  - Confidence band label in Hindi
  - Stale data indicator (amber warning icon + timestamp)
  - Accessibility: `aria-label` with full reading

- [ ] **F-08** — Indian currency formatter utility
  - `apps/web/lib/formatCurrency.ts`
  - Handles: ₹50,000 / ₹1.5 लाख / ₹12 लाख / ₹1.2 करोड़
  - Bilingual: Hindi (लाख/करोड़) or English (L/Cr) based on locale
  - `formatINR(amount: number, locale: 'hi' | 'en'): string`
  - `formatShort(amount: number, locale: 'hi' | 'en'): string`

- [ ] **F-09** — Analytics event tracker
  - `apps/web/lib/analytics.ts`
  - `trackEvent(event: TrackingEvent, properties?: Record<string, unknown>): void`
  - Fires to Vercel Analytics + Supabase events table (async, non-blocking)
  - Auto-attaches: page_path, session_id, device_type, utm params from sessionStorage
  - Server-safe (no-op if window undefined)
  - _Requirements: FR-TECH-003_

- [ ] **F-10** — Scroll progress indicator
  - `apps/web/components/ui/ScrollProgress.tsx`
  - CSS scroll-driven animation (`animation-timeline: scroll()`)
  - Fallback: JS-based via scroll event for Firefox
  - Used on blog post pages
  - `@supports (animation-timeline: scroll())` feature detection

---

## TASK GROUP G: SEO & METADATA

- [ ] **G-01** — Base metadata configuration
  - `apps/web/lib/seo/metadata.ts`
  - Base metadata factory: `generatePageMetadata(overrides)`
  - Default OG image, Twitter card, robots
  - Viewport, theme-colour

- [ ] **G-02** — Organization JSON-LD schema
  - `apps/web/components/seo/OrganizationSchema.tsx`
  - PoultryPulse AI organization data
  - Logo, URL, contact points, address (Gorakhpur)
  - SameAs: (social profiles when available)
  - Included in root layout

- [ ] **G-03** — FAQ JSON-LD generator
  - `apps/web/components/seo/FAQSchema.tsx`
  - Accepts FAQ items array
  - Outputs FAQPage JSON-LD
  - Used on homepage + FAQ page

- [ ] **G-04** — BlogPosting JSON-LD schema
  - `apps/web/components/seo/BlogPostingSchema.tsx`
  - Accepts blog post metadata
  - author, datePublished, dateModified, image, publisher

- [ ] **G-05** — Product JSON-LD schemas (pricing)
  - `apps/web/components/seo/PricingSchema.tsx`
  - Three Product schemas for PulseFarm, PulsePro, PulseIntel
  - Offer with price, priceCurrency, availability

- [ ] **G-06** — HreflangMeta component
  - `apps/web/components/seo/HreflangMeta.tsx`
  - x-default, en-IN, hi-IN hreflang tags
  - Accepts page path, constructs full URLs

---

## TASK GROUP H: REFERRAL PROGRAM

- [x] **H-01** — Referral page (`/refer`)
  - `apps/web/app/(marketing)/refer/page.tsx`
  - Auth-gated (redirect to login if not authenticated)
  - Referral code display (large, copyable)
  - WhatsApp share button with pre-composed message
  - Referral stats: count referred, credits earned, pending
  - T&C expandable section
  - _Requirements: FR-REFERRAL-001_

- [x] **H-02** — Referral code generation API
  - `apps/web/app/api/referral/generate/route.ts`
  - Generates 8-char alphanumeric code (uppercase, no confusable chars: 0/O, 1/I)
  - Stores in Supabase `referral_codes` table with customer_id
  - One code per customer (idempotent — return existing if already generated)

- [x] **H-03** — Referral attribution API
  - `apps/web/app/api/referral/apply/route.ts`
  - Called on new customer subscription activation
  - Validates referral code, checks fraud rules (same phone, self-referral)
  - Creates credit record in `referral_credits` table
  - Triggers credit notification to referrer

---

## TASK GROUP I: TESTING & QA

- [ ] **I-01** — Lighthouse CI configuration
  - `.github/workflows/lighthouse.yml`
  - Runs on every PR targeting `main`
  - Budget: mobile LCP < 2.5s, INP < 200ms, CLS < 0.1
  - Performance score: fail if < 85
  - Accessibility score: fail if < 90
  - _Requirements: FR-TECH-005_

- [ ] **I-02** — Component accessibility tests (Vitest + Testing Library)
  - `apps/web/__tests__/a11y/`
  - Nav: keyboard navigation, hamburger ARIA
  - FAQ accordion: ARIA states, keyboard controls
  - Modal: focus trap, escape to close
  - Forms: label associations, error announcements
  - All tests run with `axe-core` in CI

- [ ] **I-03** — E2E critical path (Playwright)
  - `apps/web/e2e/`
  - Test: Homepage loads, hero renders in < 2s
  - Test: Language toggle switches content
  - Test: Calculator updates on slider change
  - Test: Exit popup appears after 30s (time manipulation)
  - Test: Lead form submits and shows success state
  - Test: Sign-up flow: phone → OTP → farm profile
  - Test: All nav links are 200 status

- [ ] **I-04** — Visual regression (Playwright screenshots)
  - Baseline screenshots for: Homepage hero, Pricing page, Accuracy page
  - Fail CI if diff > 1%
  - Separate baselines for mobile (390px) and desktop (1440px)

- [ ] **I-05** — Hindi text rendering validation
  - Verify Noto Sans Devanagari renders correctly:
    - Conjunct consonants (क्ष, त्र, ज्ञ)
    - Devanagari numerals (०, १, २...)
    - Matra combining characters
  - Minimum 13px caption size test
  - No text clipping at any standard viewport

---

## TASK GROUP J: DEPLOYMENT & MONITORING

- [ ] **J-01** — Vercel project configuration
  - `vercel.json`: edge config, security headers, redirects
  - Security headers: HSTS, X-Frame-Options DENY, CSP
  - Redirects: www → non-www, /home → /
  - Environment variables: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY

- [ ] **J-02** — Environment variable documentation
  - `apps/web/.env.example` with all required vars
  - `apps/web/.env.local` instructions in README
  - Separation: NEXT_PUBLIC_ (safe to expose) vs private (server-only)

- [ ] **J-03** — Uptime monitoring configuration
  - Better Uptime monitors for: `/`, `/api/health`, `/pricing`, `/accuracy`
  - Alert: Slack webhook on downtime
  - SLA target: 99.5% uptime

- [ ] **J-04** — Analytics dashboard
  - Vercel Analytics: page views, top pages, bounce rate
  - Custom Supabase events dashboard (simple SQL query via Supabase Studio)
  - Weekly automated report: signups, lead captures, demo requests

---

## IMPLEMENTATION SEQUENCE (Critical Path)

```
Week 1: A-01 → A-02 → A-03 → A-04 → A-05 → A-06 (Foundation)
Week 2: B-01 → B-02 → B-03 → B-04 (Hero + Pain + How It Works + Accuracy)
Week 3: B-05 → B-06 → B-07 → B-08 → B-09 → B-10 → B-11 (Remaining sections + assembly)
Week 4: E-01 → E-02 → E-03 → E-04 → E-05 (API routes + SEO tech)
Week 5: D-01 → D-02 → D-03 → D-04 (Popups and overlays)
Week 6: C-01 → C-02 → C-03 → C-09 (Pricing, Accuracy, Gorakhpur, FAQ pages)
Week 7: C-04 → C-05 → C-05a (Case Studies + Blog)
Week 8: C-06 → C-07 → C-08 → C-10 → C-11 → C-12 (Remaining pages)
Week 9: F-01 through F-10 (Shared components polish)
Week 10: G-01 through G-06 (SEO schemas)
Week 11: H-01 → H-02 → H-03 (Referral program)
Week 12: I-01 → I-02 → I-03 → I-04 → I-05 (Testing & QA)
Week 13: J-01 → J-02 → J-03 → J-04 (Deployment & monitoring)
```

**P0 Launch Blockers (must complete before any customer onboarded):**
- A-01 through A-07 (Foundation)
- B-01 through B-11 (Homepage)
- E-01, E-02, E-03, E-04, E-05 (APIs + SEO)
- C-01 (Pricing page)
- FR-TECH-004 (DPDP compliance)
- I-03 (E2E critical path)
- Accuracy gate: 95%+ validated (per PRD §6 — absolute blocker)

---

*Document: 03_prelogin_tasks_master.md*
*Next: 04_postlogin_design_master.md*
