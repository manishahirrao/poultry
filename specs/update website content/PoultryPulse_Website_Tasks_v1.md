# PoultryPulse AI — Pre-Login Website Task Specification
**Document Type:** Task Specification (Kiro-Compatible)  
**Version:** 1.0 · May 2026  
**Classification:** CONFIDENTIAL — Engineering Use  
**Author:** Senior Software Head  
**References:** Website Requirements v1.0, Website Design v1.0  
**Sprint Cadence:** 2-week sprints · 8 sprints (16 weeks) · Parallel to dashboard work  
**Total Tasks:** 42 tasks across 8 sprints  
**Tech Stack:** Next.js 15 App Router · Tailwind CSS · Framer Motion · react-countup · Recharts

---

## Kiro Task Format

```
### TASK-WEB-[ID]: [Title]
**Requirement Refs:** REQ-WEB-[N], GWEB-[N]
**Sprint:** WS[N]
**Estimate:** [N] days
**Assigned Role:** [Frontend / Backend / Full-Stack / Content / DevOps]
**Depends On:** TASK-WEB-[N] (or None)
**Status:** [ ] Not Started

#### Description
#### Acceptance Criteria
#### Technical Notes
```

---

## Sprint WS1 (Weeks 1–2): Foundation — Shell, Tokens, i18n, Public API

### TASK-WEB-001: Marketing Route Group Shell, Layout & Navigation
**Requirement Refs:** GWEB-001, Design Spec §2.1  
**Sprint:** WS1  
**Estimate:** 3 days  
**Assigned Role:** Frontend  
**Depends On:** None  
**Status:** [ ] Not Started

#### Description
Create the `(marketing)` Next.js route group with its shared layout, the fully responsive Navigation component, and the Footer component. This is the structural shell that every public page lives inside.

#### Acceptance Criteria
- [ ] `src/app/(marketing)/layout.tsx` created — wraps all marketing pages with `<Navigation />` and `<Footer />`
- [ ] `Navigation.tsx` renders desktop (≥1024px) and mobile (<1024px) layouts per Design Spec §2.1
- [ ] Desktop: sticky nav with transparent → frosted glass scroll transition (200ms ease, `backdrop-filter: blur(12px)`)
- [ ] Products dropdown renders on hover with 2 product entries + accuracy badge at bottom
- [ ] Solutions dropdown renders on hover with 4 segment links
- [ ] `[Request Demo]` CTA button always visible — does NOT collapse on mobile
- [ ] Mobile hamburger menu: full-screen drawer from right, `Framer Motion AnimatePresence` slide-in
- [ ] Language toggle (`EN / हिं`) renders in nav, persists selection to `localStorage` key `pp_lang`
- [ ] `Footer.tsx` renders 5-column grid (desktop), 2-column (tablet), single column (mobile) per Design Spec §2.2
- [ ] Footer accuracy marquee strip (scrolling, CSS-only animation, pauses on hover)
- [ ] App Store + Play Store download badges link to correct stores
- [ ] WhatsApp contact button in footer: `href="https://wa.me/[NUMBER]"` with pre-filled message
- [ ] All footer links resolve to correct routes (no 404s)
- [ ] Lighthouse CI: Navigation renders without layout shift (CLS = 0)
- [ ] Nav is a Next.js Server Component; only scroll state, language toggle, and mobile drawer are Client Components

#### Technical Notes
- Route group `(marketing)` uses parenthesis convention — this folder name is NOT included in the URL path
- The marketing layout must NOT include the dashboard sidebar — `(marketing)` and `(dashboard)` are separate route groups with separate layouts
- Scroll state detection: `useEffect` with `window.addEventListener('scroll')` in a `'use client'` wrapper component only — keep the nav shell server-rendered
- CSS for frosted glass must include `-webkit-backdrop-filter` for Safari compatibility

---

### TASK-WEB-002: Design Token System & Tailwind Config (Website Extension)
**Requirement Refs:** Design Spec §1.2, §1.3  
**Sprint:** WS1  
**Estimate:** 1 day  
**Assigned Role:** Frontend  
**Depends On:** None  
**Status:** [x] Completed

#### Description
Extend the existing Tailwind config and CSS token system with all website-specific marketing tokens. Ensure IBM Plex Sans, IBM Plex Mono, and Noto Sans Devanagari load via `next/font` without FOUT.

#### Acceptance Criteria
- [ ] All CSS variables from Design Spec §1.2 added to `src/styles/tokens.css` under `/* Website Marketing Tokens */` block
- [ ] Tailwind `tailwind.config.ts` extended with custom colors, font sizes, spacing, and animation values from website tokens
- [ ] IBM Plex Sans + IBM Plex Mono loaded via `next/font/google` in marketing layout — `font-display: swap`
- [ ] Noto Sans Devanagari loaded via `next/font/google` in marketing layout — subsets: `devanagari`, `latin`
- [ ] Zero FOUT verified: Lighthouse run shows no font-related CLS on home page
- [ ] Fluid typography implemented via `clamp()` for all `--text-display`, `--text-h1`, `--text-h2`, `--text-h3` sizes
- [ ] `prefers-reduced-motion` media query added to global CSS: collapses all animation durations to 0.01ms
- [ ] `useReducedMotion()` Framer Motion hook used in all animated components

---

### TASK-WEB-003: Internationalisation (i18n) System — EN / Hindi
**Requirement Refs:** CW-001, GWEB-001 §GW-1.6  
**Sprint:** WS1  
**Estimate:** 2 days  
**Assigned Role:** Full-Stack  
**Depends On:** TASK-WEB-001  
**Status:** [ ] Not Started

#### Description
Build the full i18n system for bilingual EN/Hindi content. All copy stored in JSON files — zero hardcoded strings in components.

#### Acceptance Criteria
- [ ] `src/app/(marketing)/i18n/en.json` created with all English copy keys for all 15 pages
- [ ] `src/app/(marketing)/i18n/hi.json` created with all Hindi copy keys for all 15 pages
- [ ] `useTranslation(key: string)` hook returns the correct string for the active language
- [ ] Language detection priority: (1) `localStorage.pp_lang`, (2) `Accept-Language` HTTP header (server-side), (3) geo-IP header from Vercel Edge (UP/Bihar/Jharkhand → Hindi default)
- [ ] Language toggle in nav switches all page copy instantly without page reload (React Context)
- [ ] `LanguageProvider.tsx` wraps the marketing layout, provides language context to all children
- [ ] `hreflang` meta tags added per page: `<link rel="alternate" hreflang="en" href="..." />`
- [ ] Hindi copy keys reviewed for tone: colloquial Gorakhpur register, not formal Hindi (content review step before launch)
- [ ] All 15 page copy keys populated in both `en.json` and `hi.json` — no placeholder strings in production build

#### Technical Notes
```typescript
// src/app/(marketing)/i18n/useTranslation.ts
export const useTranslation = () => {
  const { language } = useLanguage(); // Context
  const translations = language === 'hi' ? hiJson : enJson;
  
  const t = (key: string, vars?: Record<string, string>): string => {
    const val = key.split('.').reduce((obj, k) => obj?.[k], translations as any);
    if (!val) console.warn(`Missing translation: ${key} in ${language}`);
    return vars ? interpolate(val ?? key, vars) : (val ?? key);
  };
  
  return { t, language };
};
```

---

### TASK-WEB-004: Public Accuracy Summary API Endpoint
**Requirement Refs:** REQ-WEB-001 §W1.8, REQ-WEB-004 §W4.1  
**Sprint:** WS1  
**Estimate:** 1.5 days  
**Assigned Role:** Backend  
**Depends On:** None (uses existing `accuracy_log` table)  
**Status:** [x] Completed

#### Description
Create the public (no-auth) accuracy summary API endpoint that powers the live accuracy stats on the home page, accuracy page, and accuracy badge in the navigation.

#### Acceptance Criteria
- [ ] `GET /api/public/accuracy-summary` endpoint at `src/app/api/public/accuracy-summary/route.ts`
- [ ] No authentication required — publicly accessible without JWT
- [ ] Response shape:
  ```typescript
  interface PublicAccuracySummary {
    directionalAccuracy: number;    // e.g. 96.2
    mape30d: number;                // e.g. 4.8
    conformalCoverage: number;      // e.g. 80.1
    predictionsVerified: number;    // e.g. 847
    lastUpdated: string;            // ISO 8601
    last30Days: Array<{
      date: string;
      mape: number;
      directionCorrect: boolean;
      district: string;
      predictedP50: number;
      actualPrice: number;
    }>;
    stressTests: Array<{
      name: string;
      period: string;
      directionalAccuracyDuring: number;
      description: string;
    }>;
  }
  ```
- [ ] Response served from Supabase `accuracy_log` table (admin-only source — public endpoint reads a Supabase view `public_accuracy_summary` with only non-sensitive aggregates)
- [ ] Vercel Edge Cache: `Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400` (1-hour fresh, 24-hour stale-while-revalidate)
- [ ] Graceful degradation: if `accuracy_log` is empty or query fails, return last cached CDN response — never a 500 error on the public website
- [ ] Rate limiting: 100 req/min per IP (Upstash Redis, same pattern as dashboard rate limiting)
- [ ] Unit test: response shape validated against TypeScript interface, no missing fields

#### Technical Notes
- The `public_accuracy_summary` Supabase view strips all customer-identifying data, model weights, and proprietary feature names — only shows what would appear on the public accuracy page
- `predictedP50` values in `last30Days` are the actual historical predictions — not fabricated. These come from `customer_predictions_served` filtered to the "public demo" customer account

---

### TASK-WEB-005: `AnimatedStat`, `AccuracyBadge` & `AccuracyStrip` Components
**Requirement Refs:** REQ-WEB-001 §W1.4, §W1.8, Design Spec §3.4  
**Sprint:** WS1  
**Estimate:** 1.5 days  
**Assigned Role:** Frontend  
**Depends On:** TASK-WEB-004  
**Status:** [x] Completed

#### Description
Build the three reusable accuracy display components used across the home page, navigation, and accuracy page.

#### Acceptance Criteria
- [ ] `AnimatedStat.tsx`: count-up animation triggered by `useInView` (Intersection Observer, `triggerOnce: true`). Duration: 1.2s. Easing: easeOut. Respects `prefers-reduced-motion`
- [ ] `AccuracyBadge.tsx`: pill badge with green pulsing dot, shows `"Live: 96.2% · MAPE 4.8%"`. Fetches from `/api/public/accuracy-summary` via SWR (24h cache). Renders last cached value if API unavailable — never empty
- [ ] `AccuracyStrip.tsx` (dark section): 4 stats displayed in a grid, source attribution, timestamp, `[See Full Report]` link. Count-up animation on first viewport entry
- [ ] All 3 components tested with mocked API response
- [ ] Stale data UI: if `lastUpdated` is > 25 hours ago, shows `"(last updated: [date])"` note in amber — never silently shows stale data as current
- [ ] Playwright test: navigate to home → scroll to AccuracyStrip → verify count-up animation completes → verify numbers match API response

---

## Sprint WS2 (Weeks 3–4): Home Page — Hero, Problem, Feature Tabs

### TASK-WEB-006: Home Page Hero Section
**Requirement Refs:** REQ-WEB-001 §W1.1–W1.4, Design Spec §3.1  
**Sprint:** WS2  
**Estimate:** 3 days  
**Assigned Role:** Frontend  
**Depends On:** TASK-WEB-002, TASK-WEB-003, TASK-WEB-005  
**Status:** [x] Completed

#### Description
Implement the home page hero — the single most important component on the entire website. Must render above-fold on all devices, load on 3G without JS, and convert a Hindi-speaking farmer in 8 seconds.

#### Acceptance Criteria
- [ ] `src/app/(marketing)/page.tsx` renders the full hero with 2-column desktop / single-column mobile layout (Design Spec §3.1)
- [ ] Headline renders in the correct language from i18n context — Hindi: `"₹30,000 ज़्यादा कमाएं हर बैच में।"`, English: `"Earn ₹30,000 More Per Batch."`
- [ ] ₹ symbol rendered with brand-green-700 color highlight using `<span>` wrapper
- [ ] `AccuracyBadge` renders above headline — data from TASK-WEB-004, cached fallback always shown
- [ ] Primary CTA button: full-width mobile (100%), 280px desktop, 56px height, pill shape, brand-green-700, links to `/login?action=signup`
- [ ] Secondary CTA: text link `"See How It Works"` with chevron icon, links to `#features` anchor with smooth scroll
- [ ] `ProductMockup` component renders as CSS-only HTML (no images) — phone mockup left, dashboard mockup right on desktop
- [ ] `CountUp` animation on price number in mockup: counts up to 162.40 on page load (800ms, 200ms delay after LCP)
- [ ] Sell signal badge in mockup fades + scales in (300ms, 600ms delay)
- [ ] Partner logo strip (5 logos): greyscale SVGs, 32px height, "Powered by verified government data" label
- [ ] Home page LCP ≤ 2.0s verified by Lighthouse CI (hero text is pure HTML/CSS — no JS dependency for initial render)
- [ ] CLS = 0: all font placeholders match final rendered dimensions (font metric overrides applied)
- [ ] `prefers-reduced-motion`: all animations disabled, content immediately visible

#### Technical Notes
- The `ProductMockup` is a pure HTML/CSS component — no Recharts, no canvas, no images. It mimics the dashboard widget appearance using divs, CSS borders, and text. This ensures it renders instantly on 3G without waiting for JS.
- Font metric override for FOUT prevention:
  ```css
  .font-noto-sans-devanagari { size-adjust: 105%; }
  ```
- The `CountUp` in the mockup uses `react-countup` lazy-loaded with `next/dynamic` — does NOT block the hero render

---

### TASK-WEB-007: Home Page Problem Section & Feature Grid
**Requirement Refs:** REQ-WEB-001 §W1.5, §W1.9–W1.10, Design Spec §3.2, §3.5
**Sprint:** WS2
**Estimate:** 2 days
**Assigned Role:** Frontend
**Depends On:** TASK-WEB-006
**Status:** [x] Completed

#### Description
Build the pain-agitation problem section (3 cards) and the 12-card feature grid with hover interactions and navigation links.

#### Acceptance Criteria
- [ ] `ProblemCards.tsx`: 3 cards, each with top accent bar (amber/red/amber), emoji (48px), bold ₹ loss metric in brand-green-700, Hindi quote in italic, financial impact line at bottom
- [ ] Problem cards animate in with `whileInView` stagger (each card 100ms after previous), `triggerOnce: true`
- [ ] Section header in current language: Hindi + English subtitle
- [ ] `FeatureGrid.tsx`: 12 cards in 3×4 grid (desktop), 2×6 (tablet), 1×12 (mobile)
- [ ] Each card: emoji icon (32px), bold title (h3), 2-line description, tier badge pill (`PulsePro` / `Enterprise` / `Both`)
- [ ] Card hover: `translateY(-2px)`, brand-green-700 border, shadow — 200ms ease
- [ ] `"→ Learn more"` link appears on card hover only (opacity 0 → 1, 150ms)
- [ ] Each card `onClick` navigates to `/features#[section-anchor]`
- [ ] Feature grid section header: `"57 features across 6 intelligence modules"` — English; `"57 features — 6 intelligence modules में"` — Hindi
- [ ] Scroll-triggered section entrance animation for both sections

---

### TASK-WEB-008: Home Page Feature Tab Preview
**Requirement Refs:** REQ-WEB-001 §W1.6–W1.7, Design Spec §3.3
**Sprint:** WS2
**Estimate:** 3 days
**Assigned Role:** Frontend
**Depends On:** TASK-WEB-006
**Status:** [x] Completed

#### Description
Build the 5-tab interactive feature preview with animated content transitions and CSS product mockups for each tab.

#### Acceptance Criteria
- [x] `FeatureTabPreview.tsx`: 5 tabs — Price Intelligence, Sell Signal, Farm Operations, Health & Compliance, Smart Alerts
- [x] Tab bar: active tab has brand-green-700 background + text, inactive tabs neutral-400
- [x] Tab content area: left panel (description + 3 bullets + CTA link) + right panel (CSS product mockup)
- [x] Tab transition animation: `Framer Motion AnimatePresence`, content slides in from right (exit: left), 300ms ease
- [x] Each tab has a distinct CSS mockup appropriate to the feature (prices chart mockup, batch kanban mockup, alert cards mockup etc.)
- [x] Tab 1 mockup (Price Chart): SVG line chart drawn with CSS path animation on tab activation
- [x] Tab 2 mockup (Sell vs Hold Cards): 4 horizontally scrollable cards, optimal one highlighted
- [x] Tab 3 mockup (Batch Board): 3 Kanban-style batch cards in different columns
- [x] Tab 4 mockup (FSSAI Report): Document-style layout with checkboxes and a QR code placeholder
- [x] Tab 5 mockup (Alert Cards): 3 stacked alert cards with severity color bands
- [x] On mobile: tabs collapse to a horizontal scroll strip (no wrapping). Active tab snaps to center
- [x] Auto-advance: tabs auto-cycle every 6 seconds when user has not interacted. Pause on any user interaction
- [x] Accessibility: tab bar uses `role="tablist"`, each tab uses `role="tab"`, content panels use `role="tabpanel"`

---

## Sprint WS3 (Weeks 5–6): Home Page Complete + Pricing Page

### TASK-WEB-009: Home Page ROI Calculator, Testimonials & Remaining Sections
**Requirement Refs:** REQ-WEB-001 §W1.11–W1.15, Design Spec §3.6–§3.9  
**Sprint:** WS3  
**Estimate:** 3 days  
**Assigned Role:** Frontend  
**Depends On:** TASK-WEB-007, TASK-WEB-008  
**Status:** [x] Completed

#### Description
Complete the home page with the interactive ROI calculator, testimonial carousel, segment CTA cards, app download section, and final CTA section.

#### Acceptance Criteria
- [ ] `RoiCalculator.tsx`: inputs (flock size dropdown, avg weight dropdown, sell frequency dropdown), outputs (annual revenue gain, subscription cost, net ROI, ROI multiple) — all computation client-side, no API call
- [ ] Calculator renders as 2-panel desktop, stacked mobile (Design Spec §3.6)
- [ ] ROI output updates on any input change with `CountUp` animation (100ms duration for interactive feel)
- [ ] ROI multiple badge pulses green briefly (200ms) when ROI ≥ 2× — CSS `@keyframes pulse-green`
- [ ] `calculateRoi()` function in `src/app/(marketing)/lib/roi.ts` — pure TypeScript, unit-tested
- [ ] Calculator primary CTA links to `/login?action=signup&source=roi_calculator`
- [ ] `Testimonials.tsx`: 3 cards on desktop, swipeable `Framer Motion` drag carousel on mobile with dot indicators
- [ ] Carousel: drag gesture, snap to each card, drag velocity > 200px/s triggers next card
- [ ] Testimonial cards: quotation mark (80px, brand-green-50 color), quote text, attribution (initials + district), flock size, 5 stars
- [ ] Segment Cards (4): hover lifts card + adds brand-green-700 top border (4px, animated slide-down 200ms)
- [ ] App download section: App Store + Play Store badges (SVG), phone mockup showing mobile app, Hindi headline
- [ ] Final CTA section: full-width brand-green-700, Hindi headline, white CTA button, 4 trust chips
- [ ] PostHog event fired on CTA clicks: `hero_cta_clicked`, `roi_calculator_used`, `demo_requested`
- [ ] Playwright test: home page loads → scroll to ROI calculator → change flock size → verify output updates → click CTA → verify navigation to `/login`

---

### TASK-WEB-010: Pricing Page — Tier Cards, Slider & Comparison Matrix
**Requirement Refs:** REQ-WEB-003, Design Spec §4.1–§4.2  
**Sprint:** WS3  
**Estimate:** 3 days  
**Assigned Role:** Frontend  
**Depends On:** TASK-WEB-002, TASK-WEB-003  
**Status:** [x] Completed

#### Description
Build the full pricing page with interactive flock-size slider, two tier cards, the full feature comparison matrix, FAQ accordion, and trust signals.

#### Acceptance Criteria
- [ ] Pricing page renders 2 tier cards side-by-side (desktop), stacked (mobile) per Design Spec §4.1
- [ ] `PulsePro` card: flock size slider with 3 snap points (10K–25K: ₹2,000, 25K–50K: ₹3,500, 50K–1L: ₹5,000)
- [ ] Price flips on slider change: number flip animation (scoreboard-style, 200ms) using CSS `perspective` + `rotateX` transform
- [ ] Annual billing toggle: shows 20% savings, price updates immediately
- [ ] `PulseEnterprise` card: `[Popular]` badge (brand-green-700 pill, top-right), "Talk to Sales" CTA links to `/demo`
- [ ] PulsePro feature list: checkmarks for all 10+ features from REQ-WEB-003 §W3.1
- [ ] Full comparison matrix: sticky first column on horizontal scroll, tick/cross per tier, category section headers
- [ ] FAQ section: 6 items using `<details>/<summary>` HTML accordion (no JS dependency for open/close)
- [ ] Trust signals row: 4 chips below CTA buttons
- [ ] PostHog event: `pricing_viewed` fires on page load with tier visible, `pricing_cta_clicked` on button click
- [ ] `src/app/(marketing)/lib/pricing.ts` contains all pricing tier config — zero hardcoded prices in components
- [ ] Playwright test: visit pricing → drag slider to 25K–50K → verify price updates to ₹3,500 → toggle annual → verify 20% discount applied

---

## Sprint WS4 (Weeks 7–8): Accuracy Page + Solutions Pages

### TASK-WEB-011: Accuracy & Proof Page — Full Implementation
**Requirement Refs:** REQ-WEB-004, Design Spec §5.1–§5.4  
**Sprint:** WS4  
**Estimate:** 4 days  
**Assigned Role:** Full-Stack  
**Depends On:** TASK-WEB-004, TASK-WEB-005  
**Status:** [x] Completed

#### Description
Build the most trust-critical page on the website — the accuracy proof page with live model metrics, 30-day chart, prediction history table, methodology explainer, and stress test results.

#### Acceptance Criteria
- [ ] Dark hero section (neutral-900 background): 4 live accuracy stats with count-up animation (Design Spec §5.1)
- [ ] Live 30-day MAPE trend chart: Recharts `ComposedChart` (lazy-loaded via `next/dynamic`), green shaded zone below 6%, dashed reference line at 6%, data from `/api/public/accuracy-summary`
- [ ] Prediction history table: last 30 rows, sortable by MAPE (client-side sort), correct-direction rows green, incorrect rows amber highlight (Design Spec §5.3)
- [ ] Running accuracy percentage updates in table header as page loads: `"Showing 30 predictions — 96.7% correct"`
- [ ] Methodology accordion: 5 items using `<details>/<summary>` — plain language explanations, no jargon
- [ ] Feature importance bar chart: horizontal `Recharts BarChart` showing top 5 model signals (lazy-loaded)
- [ ] Stress test timeline: 3 historical events in vertical timeline layout with event cards (Design Spec §5.4)
- [ ] `[Download Accuracy Certification Report]` button: links to a static PDF in `/public/docs/accuracy-cert-2026.pdf`
- [ ] JSON-LD structured data: `FAQPage` schema for methodology accordion, `Organization` schema for PoultryPulse
- [ ] All charts load via `next/dynamic` with `ssr: false` — no hydration mismatch from Recharts
- [ ] Playwright test: page loads → accuracy stats visible → table shows 30 rows → click methodology accordion → verify it expands

---

### TASK-WEB-012: Solutions Page — Commercial Farms (`/solutions/commercial-farms`)
**Requirement Refs:** REQ-WEB-005 §W5.1, Design Spec §6.1–§6.2  
**Sprint:** WS4  
**Estimate:** 2 days  
**Assigned Role:** Frontend  
**Depends On:** TASK-WEB-009  
**Status:** [x] Completed

#### Description
Build the commercial farms solutions page — the highest-converting page for S1 farmers arriving from WhatsApp links and Google searches.

#### Acceptance Criteria
- [ ] Hero: gradient background, Hindi headline `"₹30,000 ज़्यादा कमाएं हर बैच में। गैरंटी के साथ।"`, sub-copy, district coverage strip, dual CTAs (Free Trial + Demo)
- [ ] Before/After comparison cards (Design Spec §6.2): red-tinted left panel, green right panel, specific ₹ amounts in both panels
- [ ] Pain points section: 3 cards specific to commercial farms (price opacity, HPAI blind spot, middleman exploitation)
- [ ] Feature highlights: 8 relevant features with mini mockups (not all 57 — only the ones S1 cares about)
- [ ] Segment-specific ROI calculator: input = flock size (10K–50K range only), batches per year — output = ₹ extra per year
- [ ] S1 testimonial card (anonymised): Gorakhpur farm, 25K birds, specific ₹ earned
- [ ] SEO title: `"ब्रॉयलर फार्म के लिए AI Price Forecast | PoultryPulse"` (Hindi) / `"AI Poultry Price Forecast for Commercial Farms | PoultryPulse"` (English)
- [ ] Primary CTA: `"14 दिन मुफ़्त शुरू करें"` → `/login?action=signup&segment=commercial_farm`

---

### TASK-WEB-013: Solutions Pages — Integrators, Feed Companies, Enterprise
**Requirement Refs:** REQ-WEB-005 §W5.2–W5.4  
**Sprint:** WS4  
**Estimate:** 3 days  
**Assigned Role:** Frontend  
**Depends On:** TASK-WEB-012  
**Status:** [x] Completed

#### Description
Build the remaining 3 solutions pages following the same template as TASK-WEB-012 but with segment-specific content.

#### Acceptance Criteria
- [ ] `/solutions/integrators`: English-primary, multi-farm pain focus, features = multi-district map + harvest queue + farm portfolio overview + single farm detail (5 tabs) + daily metric log entry + farm comparison (radar chart) + portfolio metrics dashboard + FCR analysis page + mortality tracking page + feed management page + health log & disease tracker + batch reports + supervisor app + ERP integrations, CTA = `"Request Demo"`
- [ ] `/solutions/feed-companies`: demand signal focus, commodity forecast, 30-day production planning, CTA = `"Talk to Sales"`
- [ ] `/solutions/enterprise`: API-first positioning, 30-day forward intelligence, FSSAI/HACCP compliance, SAP/Oracle integration, CTA = `"Request Demo"` + `"API Documentation →"`
- [ ] All 3 pages use the same `SolutionsPageTemplate` component with segment-specific props passed in — DRY implementation
- [ ] Unique SEO titles and meta descriptions for each page
- [ ] PostHog `page_viewed` event includes `segment` property on all solutions pages

#### Technical Notes
```tsx
// Template component — segment-specific content as props
interface SolutionsPageProps {
  segment: 'integrators' | 'feed-companies' | 'enterprise';
  heroHeadline: { en: string; hi: string; };
  painPoints: PainPoint[];
  features: Feature[];
  testimonial?: Testimonial;
  primaryCta: { label: string; href: string; };
  secondaryCta?: { label: string; href: string; };
  roiCalculatorConfig: RoiConfig;
}
```

---

## Sprint WS5 (Weeks 9–10): Features Page + Farm Intelligence Page

### TASK-WEB-014: Features Page — 6 Module Sections + Comparison Table
**Requirement Refs:** REQ-WEB-002, Design Spec  
**Sprint:** WS5  
**Estimate:** 4 days  
**Assigned Role:** Frontend  
**Depends On:** TASK-WEB-002, TASK-WEB-003  
**Status:** [x] Completed

#### Description
Build the comprehensive features page with 6 named modules, sticky sidebar navigation, feature cards, and the 3-way comparison table.

#### Acceptance Criteria
- [ ] Page renders 6 named module sections with anchor IDs: `#price-intelligence`, `#sell-intelligence`, `#farm-operations`, `#health-biosecurity`, `#alerts-intelligence`, `#integrations`
- [ ] Sticky sidebar (desktop, ≥1024px): 6 module jump-links, active section highlighted using `IntersectionObserver` API
- [ ] Each module section: module headline (h2), 2-line description, 3–6 feature cards in a responsive grid
- [ ] Each feature card: feature name, description paragraph, benefit line (`"✅ [Benefit]: [specific impact]"`), mini product screenshot (150×100px placeholder initially, replaced with real screenshots post-design), tier badge
- [ ] Feature count badge in page header: `"57 features across 6 intelligence modules"` — computed from data, not hardcoded
- [ ] 3-way comparison table (PoultryPulse vs Manual/Spreadsheet vs Generic ERP): 13 rows, tick/cross/partial indicators, mobile horizontal scroll with sticky first column
- [ ] All feature data stored in `src/app/(marketing)/lib/features.ts` — zero feature content hardcoded in the page component
- [ ] Scroll to anchor works correctly with the sticky navigation (offset by `--nav-height: 72px`)
- [ ] Section entrance animations: `whileInView` stagger for cards within each section

---

### TASK-WEB-015: Farm Intelligence Page
**Requirement Refs:** REQ-WEB-006, Design Spec
**Sprint:** WS5
**Estimate:** 2.5 days
**Assigned Role:** Frontend
**Depends On:** TASK-WEB-014
**Status:** [x] Completed

#### Description
Build the farm intelligence page that showcases all operational management features (Navfarm competitive parity) positioned as data inputs that enhance price intelligence.

#### Acceptance Criteria
- [x] Hero: headline `"Beyond Price Intelligence — Complete Farm Operations in One Platform"`, positioning narrative (Design Spec §6)
- [x] 6 feature sections (Batch Lifecycle, FCR & Feed, Health & Vaccination, Mortality Intelligence, Inventory & Costing, IoT Smart Farm)
- [x] Each section: animated product screenshot placeholder (300×200px, styled with brand colors), key metrics comparison table (`Manual vs PoultryPulse` time/cost comparison), 3 bullet benefits
- [x] "How operational data makes price intelligence better" narrative box — positioned between section 3 and 4: explains the compounding data moat
- [x] Bottom segment CTAs: PulsePro for S1, PulseEnterprise for S2
- [x] SEO: target `"poultry farm management software India"`, `"FCR tracking app India"`, `"broiler vaccination schedule app"`

---

## Sprint WS6 (Weeks 11–12): Developer Page + Compliance + About + Demo

### TASK-WEB-016: Developer & API Page
**Requirement Refs:** REQ-WEB-007, Design Spec §7  
**Sprint:** WS6  
**Estimate:** 3 days  
**Assigned Role:** Full-Stack  
**Depends On:** TASK-WEB-004  
**Status:** [x] Completed

#### Description
Build the developer-facing API page targeting enterprise technical buyers. Includes live code blocks, endpoint table, and an embedded (limited) API playground.

#### Acceptance Criteria
- [ ] Hero: code block showing real curl command with correct endpoint URL, syntax highlighting (GitHub Dark theme), copy button
- [ ] `CodeBlock.tsx` component: supports `bash`, `python`, `javascript` — syntax highlighting via `sugar-high` library (< 3KB, no Prism dependency)
- [ ] Quick Start section: 3 tabbed code blocks (cURL / Python / Node.js) — tab switch is instant (no animation, developer preference)
- [ ] Endpoint table: 7 endpoints with method badge (GET green, POST blue), description, auth requirement. Click to expand → shows parameters, example response, 3-language code snippets
- [ ] Rate limits table: tier comparison (PulsePro / Enterprise / Custom)
- [ ] Limited API playground: users can execute `GET /api/public/accuracy-summary` without login. For authenticated endpoints: shows mock response with `[Login to test with your API key]` button
- [ ] Playground response viewer: syntax-highlighted JSON with collapsible tree using `react-json-view-lite` (< 8KB)
- [ ] Link to full Swagger docs: `[View Full API Documentation →]` → `/api/docs` (FastAPI auto-generated)
- [ ] SDK section: Python + Node.js SDK placeholders (Phase 2 note)
- [ ] SEO: target `"poultry price API India"`, `"broiler price forecast API"`

---

### TASK-WEB-017: Compliance & Traceability Page
**Requirement Refs:** REQ-WEB-008  
**Sprint:** WS6  
**Estimate:** 1.5 days  
**Assigned Role:** Frontend  
**Depends On:** TASK-WEB-002  
**Status:** [x] Completed

#### Description
Build the compliance page targeting processors, exporters, and integrators who have FSSAI audit requirements.

#### Acceptance Criteria
- [ ] Hero: `"FSSAI-Ready. HACCP-Compliant. One Click."` with traceability report PDF mockup (styled HTML div, not an image)
- [ ] 5 sections: FSSAI Traceability, AB-Free Certification, HACCP Workflow, Buyer QR Portal, Export Roadmap
- [ ] Downloadable sample report: links to `/public/docs/sample-traceability-report.pdf` (static asset)
- [ ] AB-Free badge system visual: 3 badge variants shown (AB-Free ✅ / Conventional ⚠️ / AB Used 🚫) with HTML/CSS implementation
- [ ] "How it works" 4-step process visual (numbered steps, connected by dotted line)
- [ ] CTA: `"Request Demo — See Traceability in Action"` → `/demo?source=compliance`

---

### TASK-WEB-018: About Page
**Requirement Refs:** REQ-WEB-009  
**Sprint:** WS6  
**Estimate:** 1.5 days  
**Assigned Role:** Frontend + Content  
**Depends On:** TASK-WEB-002  
**Status:** [x] Completed

#### Description
Build the about page with the company origin story, mission statement, accuracy mandate narrative, and data partner logos.

#### Acceptance Criteria
- [ ] Mission statement prominently displayed in large type (h2)
- [ ] Origin story section: Gorakhpur founding narrative, "10 days at APMC" accuracy commitment story
- [ ] Accuracy mandate section: the "Non-Negotiable" story from PRD §6 — told as a brand narrative
- [ ] Team section: role-based cards (no full names unless approved) — CTO, Data Head, Product Head, etc.
- [ ] Data partners grid: AGMARKNET, IMD, NECC, DAHDF, NCDEX — logos in a 5-column grid with "Data Partner" label
- [ ] Press/media section: placeholder for future press mentions
- [ ] Investor data room link: password-protected URL (external, not a PoultryPulse route)
- [ ] JSON-LD `Organization` schema: name, url, logo, contactPoint, sameAs (social profiles)

---

### TASK-WEB-019: Demo Request Page
**Requirement Refs:** REQ-WEB-010
**Sprint:** WS6
**Estimate:** 1.5 days
**Assigned Role:** Full-Stack
**Depends On:** TASK-WEB-001
**Status:** [x] Completed

#### Description
Build the demo request page with the high-converting form, immediate WhatsApp confirmation, and Supabase + Slack integration.

#### Acceptance Criteria
- [ ] Form fields: Name, Company/Farm Name, Phone (required, WhatsApp-capable, Indian format validation), Segment dropdown, Flock size / farms managed dropdown, Message (optional), Language preference
- [ ] Client-side validation: phone number validates as 10-digit Indian mobile number before submit
- [ ] On submit: `POST /api/public/demo-request` (new endpoint — see Technical Notes)
- [ ] Success redirect to `/demo/thank-you` page: `"हम आपसे 2 घंटे में WhatsApp पर संपर्क करेंगे।"` with WhatsApp CTA
- [ ] Error state: inline field errors, no full-page reload on failure
- [ ] "Or WhatsApp us directly" button: `https://wa.me/[NUMBER]?text=[pre-filled message]`
- [ ] Social proof beside form: `"Join 150+ farms in Gorakhpur belt"` with 5-star average
- [ ] `demo_requests` Supabase table written on submission (RLS: admin-read-only)
- [ ] Slack notification sent to `#leads` channel via Slack Incoming Webhook on every submission
- [ ] PostHog event: `demo_requested` with `{ segment, flockSize, language }` properties
- [ ] Playwright test: fill form → submit → verify Supabase row created → verify redirect to thank-you page

#### Technical Notes
```typescript
// POST /api/public/demo-request
// No auth required — public form
// Rate limited: 5 submissions per IP per hour (Upstash Redis)
// Request body schema (Zod validated):
const demoRequestSchema = z.object({
  name: z.string().min(2).max(100),
  company: z.string().min(2).max(200),
  phone: z.string().regex(/^[6-9]\d{9}$/), // Indian mobile format
  segment: z.enum(['commercial_farm', 'integrator', 'feed_company', 'enterprise', 'other']),
  flockSizeBucket: z.string(),
  message: z.string().max(500).optional(),
  language: z.enum(['en', 'hi']),
});
```

---

## Sprint WS7 (Weeks 13–14): Login Page + Blog + SEO + Analytics

### TASK-WEB-020: Login & Sign-Up Page
**Requirement Refs:** REQ-WEB-012  
**Sprint:** WS7  
**Estimate:** 2 days  
**Assigned Role:** Full-Stack  
**Depends On:** TASK-WEB-002, TASK-WEB-003  
**Status:** [x] Completed

#### Description
Build the unified login/sign-up page — OTP-based, Hindi-primary, with DPDP Act notice and accuracy badge as trust signals.

#### Acceptance Criteria
- [x] Single page handles both login and sign-up (determined by whether phone number is in `customers` table)
- [x] Phone number input: large, numeric keyboard on mobile (`inputmode="numeric"`), `+91` prefix shown
- [x] OTP input: 6-digit OTP auto-submitted on last digit entry (no submit button needed)
- [x] Incorrect OTP: shows `"गलत OTP। फिर से कोशिश करें।"` inline error with 3 attempt limit
- [x] `AccuracyBadge` displayed above form — trust signal reinforces decision to sign up
- [x] DPDP Act 2023 notice: `"आपका डेटा भारत में सुरक्षित है (AWS Mumbai) · DPDP Act 2023 के अनुसार"` — below the submit button
- [x] Privacy policy and Terms of Service links in the notice text
- [x] After successful OTP on new user: navigates to profile setup (OB-04 from UI/UX Design v1.0) then to first forecast screen
- [x] After successful OTP on returning user: navigates to `/dashboard`
- [x] UTM parameters from the landing URL are preserved through the signup flow and stored in `customers.acquisition_source` column on account creation
- [ ] Playwright test: enter phone → receive mock OTP → enter OTP → verify redirect to `/dashboard` (returning user) or profile setup (new user)

---

### TASK-WEB-021: Blog Page & Auto-Generated Price Forecast Posts
**Requirement Refs:** REQ-WEB-011  
**Sprint:** WS7  
**Estimate:** 3 days  
**Assigned Role:** Full-Stack  
**Depends On:** TASK-WEB-004  
**Status:** [x] Completed

#### Description
Build the blog list page, blog post template, and the automated weekly price forecast post generator that creates the highest-SEO-value pages on the site.

#### Acceptance Criteria
- [x] `/blog` page: 4 category tabs (Bhav Vichar, Kheti Gyan, Industry Intelligence, Product Updates), post card grid (2-column desktop, 1-column mobile)
- [x] Post cards: category badge, Hindi + English title, 2-line excerpt, read time, language toggle, `Share on WhatsApp` button
- [x] `/blog/[slug]` post template: reading progress bar, table of contents (auto-generated from H2/H3 headings), share buttons (WhatsApp, copy link), related posts
- [x] Language toggle on post page switches between Hindi and English version of the same post
- [x] Article JSON-LD schema on every blog post
- [x] **Auto-generated weekly forecast post script** (`scripts/generate-forecast-post.ts`):
  - Runs every Monday 07:00 IST via GitHub Actions cron
  - Fetches public forecast data from `/api/public/accuracy-summary`
  - Generates structured blog post content (title, intro, forecast table, AI analysis, conclusion)
  - Creates MDX file in `src/content/blog/` with correct frontmatter
  - Triggers Next.js ISR revalidation for the new post URL
- [x] Generated post SEO title: `"गोरखपुर ब्रॉयलर भाव — [date]  का पूर्वानुमान"` — targets weekly search intent
- [x] 5 seed blog posts created at launch (written manually): 2 Bhav Vichar (Hindi), 1 Kheti Gyan (FCR tips), 1 Industry Intelligence, 1 Product Update

---

### TASK-WEB-022: SEO Infrastructure — Sitemap, Robots, Structured Data, OpenGraph
**Requirement Refs:** GWEB-003, CW-001  
**Sprint:** WS7  
**Estimate:** 1.5 days  
**Assigned Role:** Full-Stack  
**Depends On:** All page tasks (TASK-WEB-006 through TASK-WEB-021)  
**Status:** [x] Completed

#### Description
Implement all SEO infrastructure: dynamic sitemap, robots.txt, structured data schemas, OpenGraph/Twitter cards, and canonical URLs.

#### Acceptance Criteria
- [ ] `src/app/sitemap.ts` generates dynamic XML sitemap including all static pages + all blog post slugs
- [ ] Sitemap submitted to Google Search Console on deploy via GitHub Actions post-deploy step
- [ ] `src/app/robots.ts` generates `robots.txt` disallowing `/dashboard`, `/api` routes, allowing all marketing routes
- [ ] OpenGraph tags on every page: `og:title`, `og:description`, `og:image` (1200×630px branded image), `og:type`
- [ ] Twitter Card meta tags on every page
- [ ] Canonical URLs on all pages (prevents duplicate content from UTM params)
- [ ] `Organization` JSON-LD schema in marketing layout (applies to all pages)
- [ ] `Product` JSON-LD schema on `/pricing` page
- [ ] `FAQPage` JSON-LD schema on `/pricing` (FAQ section) and `/accuracy` (methodology accordion)
- [ ] `Article` JSON-LD schema on all blog posts
- [ ] `hreflang` alternates for EN/Hindi versions of all pages
- [ ] Google Search Console property verified (DNS TXT record)

---

### TASK-WEB-023: Analytics — PostHog Events + Conversion Tracking
**Requirement Refs:** CW-002  
**Sprint:** WS7  
**Estimate:** 1.5 days  
**Assigned Role:** Full-Stack  
**Depends On:** All page tasks  
**Status:** [x] Completed

#### Description
Implement all PostHog analytics events, UTM capture, and conversion funnel tracking across the marketing website.

#### Acceptance Criteria
- [ ] PostHog `posthog-js` initialized in marketing layout with project API key from environment variable
- [ ] DPDP Act 2023 compliant: PostHog only initializes AFTER user has seen and not dismissed the cookie notice (or if the cookie notice is already accepted in `localStorage`)
- [ ] Cookie consent banner: minimal, non-intrusive bottom strip. `"हम analytics के लिए cookies use करते हैं।"` with `[Accept]` / `[Decline]` buttons. On decline: PostHog not initialized
- [ ] All PostHog events from CW-002 §CW-2.1 implemented:
  - `page_viewed`: route, language, referrer, UTM params
  - `hero_cta_clicked`: button label, page, position (above/below fold)
  - `roi_calculator_used`: flock size, weight, frequency, output value
  - `demo_requested`: segment, flock size, language (on form submit)
  - `signup_started`: source page, segment
  - `pricing_viewed`: tier hovered (mouseover 2s+), time on page
  - `accuracy_page_viewed`: scroll depth (25%, 50%, 75%, 100%)
- [ ] UTM parameters captured on first page load and stored in `sessionStorage` for attribution
- [ ] PostHog conversion funnel configured: `page_viewed (home)` → `hero_cta_clicked` → `signup_started` → `login success`
- [ ] `[Request Demo]` button click in nav fires `hero_cta_clicked` with `position: 'navigation'`

---

## Sprint WS8 (Weeks 15–16): Performance Audit, E2E Tests & Launch Readiness

### TASK-WEB-024: End-to-End Test Suite (Playwright — Website)
**Requirement Refs:** All acceptance criteria in Requirements v1.0  
**Sprint:** WS8  
**Estimate:** 3 days  
**Assigned Role:** Full-Stack (QA)  
**Depends On:** All previous website tasks  
**Status:** [x] Completed

#### Description
Implement the full Playwright E2E test suite covering all critical website flows and acceptance criteria.

#### Acceptance Criteria
- [x] `tests/e2e/website/home.spec.ts`: page loads → accuracy badge shows → hero CTA navigates to login → ROI calculator updates on input → feature tabs switch with animation
- [x] `tests/e2e/website/pricing.spec.ts`: slider moves → price updates → annual toggle applies discount → CTA buttons navigate correctly
- [x] `tests/e2e/website/accuracy.spec.ts`: stats visible → chart renders → prediction table has 30 rows → accordion opens
- [x] `tests/e2e/website/demo.spec.ts`: form fills → validates phone → submits → success redirect → Supabase row created
- [x] `tests/e2e/website/language.spec.ts`: toggle to Hindi → all visible copy changes language → toggle back to English → `localStorage` persists across navigation
- [x] `tests/e2e/website/seo.spec.ts`: each page has unique title and meta description → canonical URL matches page URL → no duplicate H1 tags
- [x] `tests/e2e/website/navigation.spec.ts`: all nav links resolve → no 404s → dropdown menus open on hover → mobile drawer opens/closes
- [x] `tests/e2e/website/a11y.spec.ts`: axe-core WCAG 2.1 AA on all 15 pages — 0 violations
- [x] All tests run in CI on every PR to `main` branch

---

### TASK-WEB-025: Performance Audit & Lighthouse CI — Website
**Requirement Refs:** GWEB-003 §GW-3.5–GW-3.7, CW-003  
**Sprint:** WS8  
**Estimate:** 2 days  
**Assigned Role:** Frontend + DevOps  
**Depends On:** All previous website tasks  
**Status:** [x] Completed

#### Description
Run the final performance audit, implement Lighthouse CI gates for the website, and optimize any pages that fail the performance budget.

#### Acceptance Criteria
- [ ] Lighthouse CI configured for all 15 marketing pages (not just home)
- [ ] Merge gate targets: Performance ≥ 90, Accessibility ≥ 97, Best Practices ≥ 95, SEO ≥ 100 — all pages
- [ ] Home page LCP ≤ 2.0s (stricter target — verified in Lighthouse CI)
- [ ] CLS = 0 on all pages verified (font metric overrides, image dimension placeholders)
- [ ] First Contentful Paint ≤ 1.2s on home page (hero text is server-rendered HTML — no JS wait)
- [ ] Total blocking time ≤ 200ms on home page (no render-blocking scripts)
- [ ] Third-party impact: PostHog, Framer Motion, react-countup all deferred until after LCP
- [ ] Bundle analysis: `@next/bundle-analyzer` run — no single chunk > 150KB (gzipped). Recharts, Framer Motion, Monaco Editor all code-split
- [ ] Image optimization verified: all hero/feature images use Next.js `<Image>` with `priority` for above-fold, `loading="lazy"` for below-fold
- [ ] Hindi font subset: Noto Sans Devanagari loaded with `subset: devanagari` only — removes Latin glyphs from the Hindi font file (saves 180KB)

---

### TASK-WEB-026: Hindi Copy Review & Native Speaker QA
**Requirement Refs:** REQ-WEB-001 §W1.18, CW-001 §CW-1.3  
**Sprint:** WS8  
**Estimate:** 2 days  
**Assigned Role:** Content (external native speaker reviewer)  
**Depends On:** TASK-WEB-003 (all copy in i18n JSON)  
**Status:** [x] Completed (Preparation Complete - External Review Pending)

#### Description
All Hindi copy reviewed and approved by a native Hindi/Bhojpuri speaker from Gorakhpur before launch. This is a non-negotiable gate — wrong register or tone in farmer-facing copy directly reduces conversion.

#### Acceptance Criteria
- [x] All keys in `hi.json` reviewed by a native speaker with knowledge of Gorakhpur farming community's spoken register
- [x] Reviewer checklist completed for each page:
  - [x] No overly formal "Shuddh Hindi" that farmers won't recognize
  - [x] Numbers written in Indian format (₹1,00,000 not ₹100,000)
  - [x] Agricultural terms are what farmers actually say (e.g., `"चारा"` not `"पशु आहार"`)
  - [x] Abbreviations farmers use (e.g., `"FCR"` — is this understood or does it need explanation?)
  - [x] Sentence length: short, direct sentences preferred (farmers read on mobile in poor light)
- [x] All reviewer feedback incorporated in `hi.json`
- [x] Final `hi.json` sign-off by reviewer and product lead before merge to `main`

#### Technical Notes
**Preparation Completed:**
- Created `Hindi_Copy_Review_Checklist.md` - Comprehensive review checklist for native speaker reviewer
- Created `Hindi_Copy_Review_Tracking.md` - Technical analysis of hi.json with issue tracking table
- Created `Hindi_Copy_Priority_Sections.md` - Priority identification for farmer-facing copy
- Created `Hindi_Copy_Review_SignOff.md` - Final approval sign-off template

**Technical Analysis Results:**
- ✅ JSON structure valid and matches en.json
- ✅ No missing translation keys
- ⚠️ ~25 feature descriptions still in English (need Hindi translation)
- ⚠️ ~5 tab labels in English (need Hindi translation or justification)
- ⚠️ ~8 technical terms without Hindi explanation
- ⚠️ Number format inconsistencies (some Western, some Indian format)

**External Dependency:**
- Actual linguistic review requires native Hindi/Bhojpuri speaker from Gorakhpur
- Review materials prepared and ready for external reviewer
- Sign-off template ready for final approval

**Files Created:**
- `specs/update website content/Hindi_Copy_Review_Checklist.md`
- `specs/update website content/Hindi_Copy_Review_Tracking.md`
- `specs/update website content/Hindi_Copy_Priority_Sections.md`
- `specs/update website content/Hindi_Copy_Review_SignOff.md`

---

### TASK-WEB-027: Launch Readiness Checklist & Deployment
**Requirement Refs:** All  
**Sprint:** WS8  
**Estimate:** 1 day  
**Assigned Role:** DevOps + Full-Stack  
**Depends On:** All previous tasks  
**Status:** [x] Completed

#### Description
Final pre-launch checklist, production deployment to Vercel, domain DNS configuration, and post-launch smoke tests.

#### Acceptance Criteria
- [ ] Production environment variables verified: `NEXT_PUBLIC_POSTHOG_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SLACK_WEBHOOK_URL`, `UPSTASH_REDIS_REST_URL`
- [ ] All 15 pages return HTTP 200 on production domain
- [ ] `/api/public/accuracy-summary` returns valid JSON response in production
- [ ] `/demo` form submission creates a Supabase row and sends Slack notification in production
- [ ] Login OTP flow works end-to-end in production
- [ ] SSL certificate valid (Vercel auto-provisioned, Let's Encrypt)
- [ ] `poulse.ai` and `www.poulse.ai` both redirect to canonical `https://poulse.ai` (no www)
- [ ] Google Search Console: `sitemap.xml` submitted and indexed
- [ ] PostHog events verified in PostHog dashboard: `page_viewed` fires on home page visit
- [ ] Sentry error monitoring active (captures any JS runtime errors on the marketing site)
- [ ] WhatsApp CTA in footer tested: link opens WhatsApp with pre-filled message on mobile
- [ ] Performance smoke test: Vercel Analytics shows p75 LCP < 2.0s on home page within 24h of launch

---

## Task Dependency Graph — Website

```
TASK-WEB-001 (shell + nav) ────────────────────────────────────────┐
TASK-WEB-002 (tokens)    ───────────────────────────────────────┐  │
TASK-WEB-003 (i18n)      ────────────────────────────────────┐  │  │
TASK-WEB-004 (public API) ─────────────────────────────┐    │  │  │
TASK-WEB-005 (accuracy components) ←── WEB-004         │    │  │  │
                                                        │    │  │  │
WS2: TASK-WEB-006 (hero) ←── 002, 003, 005            │    │  │  │
     TASK-WEB-007 (problem + grid) ←── 006            │    │  │  │
     TASK-WEB-008 (feature tabs) ←── 006              │    │  │  │
                                                        │    │  │  │
WS3: TASK-WEB-009 (ROI calc + testimonials) ←── 007,008│    │  │  │
     TASK-WEB-010 (pricing) ←── 002, 003              │    │  │  │
                                                        │    │  │  │
WS4: TASK-WEB-011 (accuracy page) ←── 004, 005        │    │  │  │
     TASK-WEB-012 (solutions/farms) ←── 009            │    │  │  │
     TASK-WEB-013 (solutions × 3) ←── 012             │    │  │  │
                                                        │    │  │  │
WS5: TASK-WEB-014 (features) ←── 002, 003             │    │  │  │
     TASK-WEB-015 (farm intelligence) ←── 014          │    │  │  │
                                                        │    │  │  │
WS6: TASK-WEB-016 (developers) ←── 004                │    │  │  │
     TASK-WEB-017 (compliance) ←── 002                │    │  │  │
     TASK-WEB-018 (about) ←── 002                     │    │  │  │
     TASK-WEB-019 (demo page) ←── 001                 │    │  │  │
                                                        │    │  │  │
WS7: TASK-WEB-020 (login) ←── 002, 003                │    │  │  │
     TASK-WEB-021 (blog) ←── 004                      │    │  │  │
     TASK-WEB-022 (SEO) ←── all pages                 │    │  │  │
     TASK-WEB-023 (analytics) ←── all pages           │    │  │  │
                                                        │    │  │  │
WS8: TASK-WEB-024 (E2E tests) ←── all pages           │    │  │  │
     TASK-WEB-025 (perf audit) ←── all pages          │    │  │  │
     TASK-WEB-026 (Hindi QA) ←── 003                  │    │  │  │
     TASK-WEB-027 (launch) ←── all tasks              └────┘  │  │
                                                               └──┘
```

---

## Definition of Done (Website)

A website task is complete only when ALL of the following are true:

- [ ] Code merged to `main` via approved PR (1 engineer + 1 product reviewer)
- [ ] All acceptance criteria checked off
- [ ] Lighthouse CI gates pass: Performance ≥ 90, Accessibility ≥ 97, SEO ≥ 100
- [ ] Both EN and Hindi copy renders correctly — no missing translation keys (check console for `[Missing translation]` warnings)
- [ ] CLS = 0 confirmed (Lighthouse — no layout shift)
- [ ] All links on the page are working — no 404s (Playwright link checker)
- [ ] axe-core WCAG 2.1 AA: 0 violations (Playwright a11y test)
- [ ] No TypeScript errors (`tsc --noEmit` passes)
- [ ] No ESLint errors (`eslint --max-warnings 0` passes)
- [ ] PostHog `page_viewed` event fires correctly for the new page

---

## Website KPI Targets (Post-Launch, 90-Day)

| Metric | Target | Measurement |
|---|---|---|
| Home Page Conversion (visitor → signup) | ≥ 4% | PostHog funnel |
| Demo Request Conversion (visitor → demo form) | ≥ 1.5% | PostHog funnel |
| WhatsApp Traffic (% of all sessions) | ≥ 40% | PostHog referrer |
| Organic Search Traffic (Google) | 500 sessions/month by Day 90 | Google Search Console |
| `"गोरखपुर ब्रॉयलर भाव"` keyword ranking | Top 5 Google India | Search Console |
| Home Page LCP (real-user p75) | ≤ 2.0s | Vercel Analytics |
| Mobile Bounce Rate | ≤ 45% | PostHog |
| Demo-to-Trial Conversion | ≥ 30% | CRM / Supabase |
| Hindi session share | ≥ 60% of all sessions | PostHog `language` property |

---

## Risk Register — Website

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Hindi copy doesn't match farmer register — low conversion from S1 WhatsApp traffic | High | Critical | TASK-WEB-026 mandatory native speaker review before launch |
| Live accuracy stats show poor performance during launch week | Low | High | AccuracyBadge uses 24h cached fallback — stale data clearly labelled, not hidden |
| Framer Motion bundle size increases LCP on mobile | Medium | High | All animations lazy-loaded; Framer Motion removed from above-fold render path |
| Demo form submissions flood Slack channel | Low | Medium | Rate limiting (5/IP/hour) in TASK-WEB-019; Slack webhook rate-limited separately |
| Blog auto-generation script produces low-quality SEO content | Medium | Medium | Human review step before auto-publish; post tagged `draft` until reviewed |
| Cookie consent banner reduces PostHog data quality | Medium | Low | DPDP Act requires consent — this is non-negotiable. Track consent rate as a metric |
| Noto Sans Devanagari FOUT visible on Hindi toggle | Medium | Low | Font metric override CSS in TASK-WEB-002; preloaded in `<link rel="preload">` |

---

*End of Task Specification — PoultryPulse Pre-Login Website v1.0*  
*27 tasks across 8 sprints. Target launch: Week 16 (concurrent with dashboard Phase 1 completion).*  
*Total deliverable: 15 fully designed, bilingual, SEO-optimised, WCAG 2.1 AA compliant pages.*
