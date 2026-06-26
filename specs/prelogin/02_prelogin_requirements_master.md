# PoultryPulse AI — Pre-Login Website Requirements Master
# File: 02_prelogin_requirements_master.md
# Kiro Compatibility: ✅ Full Kiro Agent Implementation Ready
# Version: v1.0 | May 2026 | CONFIDENTIAL
# Derived from: 01_prelogin_design_master.md + 03_prelogin_tasks_master.md

---

## AGENT CONTEXT BLOCK
```
ROLE: Requirements Authority — Pre-Login Marketing Website
STACK: Next.js 15 App Router · TypeScript strict · Tailwind CSS v3 · Framer Motion · Supabase SSR · Vercel Edge
AUDIENCE: Indian commercial poultry farmers (10K+ birds), Hindi-speaking, Android-first, UP/Gorakhpur belt
CONVERSION_GOAL: Free trial sign-up → ₹2,000–5,000/month paid subscription
DESIGN_FOUNDATION: 01_prelogin_design_master.md
TASK_FOUNDATION: 03_prelogin_tasks_master.md
ACCURACY_GATE: NEVER display live pricing data or sell signals until 95%+ directional accuracy is confirmed
```

---

## 1. REQUIREMENT CONVENTIONS

### 1.1 Requirement ID Format

```
FR-[GROUP]-[SEQ]       → Functional Requirement
NFR-[GROUP]-[SEQ]      → Non-Functional Requirement
```

Groups: `HOME`, `PRICING`, `ACCURACY`, `GORAKHPUR`, `CASESTUDIES`, `BLOG`, `ABOUT`, `ENTERPRISE`,
`WHATSAPP-DEMO`, `FAQ-PAGE`, `LEGAL`, `POPUP`, `LEADS`, `REFERRAL`, `COPY`, `SEO`, `TECH`, `PSYCH`

### 1.2 Priority Levels

| Priority | Label    | Description                              |
|----------|----------|------------------------------------------|
| P0       | Blocker  | Must ship before any customer onboarded  |
| P1       | High     | Must ship at Phase 0 launch              |
| P2       | Medium   | Ship within 4 weeks post-launch          |
| P3       | Low      | Phase 1 or later                         |

### 1.3 Acceptance Criteria Format

Each requirement lists acceptance criteria as testable, deterministic checks.
Every criterion maps to at least one QA check in `03_prelogin_tasks_master.md`.

---

## 2. HOMEPAGE REQUIREMENTS

### FR-HOME-001 — Hero Section (P0)
**Description:** The hero section must communicate the core value proposition above the fold on all target devices and drive primary CTA clicks.

**Acceptance Criteria:**
- [ ] Eyebrow badge renders in Hindi with `brandGreen50` background and `brandGreen700` text
- [ ] H1 text renders in Noto Sans Devanagari for Hindi locale and Plus Jakarta Sans for English locale
- [ ] Phone mockup cycles through three price-state cards (green/amber/red) at 3-second intervals with cross-dissolve animation
- [ ] Primary CTA ("14 दिन मुफ़्त शुरू करें") fires `hero_cta_click` analytics event with `source='hero'` and current UTM params
- [ ] Secondary CTA ("Live Demo देखें") opens the Demo Modal (FR-POPUP-001)
- [ ] Social proof strip customer count is fetched server-side (RSC/SSR); shows "गणना हो रही है..." during hydration
- [ ] Trust micro-text below CTAs is visible at every breakpoint
- [ ] Hero uses `min-h-[100dvh]` (not `h-screen`) to fix iOS Safari viewport bug
- [ ] All hero entrance animations are disabled when `prefers-reduced-motion: reduce` is set
- [ ] Hero gradient is implemented as CSS (`heroGradient` token), not as an image asset

**Design Reference:** `01_prelogin_design_master.md §H-01`
**Task Reference:** `B-01`

---

### FR-HOME-002 — Pain Amplification Section + Loss Calculator (P0)
**Description:** Quantify the financial pain caused by bad timing decisions. Provide an interactive calculator so farmers can self-identify their potential annual losses.

**Acceptance Criteria:**
- [ ] Section renders four pain-point cards in bento layout (2-col-span + 1-col-span pattern)
- [ ] `LossCalculator` sub-component includes a bird-count slider (10K → 200K) and a batch-frequency selector (2, 3, or 4 batches/year)
- [ ] Calculator output uses `formatIndianCurrency` utility (`F-08`) — values ≥ 1,00,000 display as "₹X लाख"
- [ ] Calculator CTA ("यह रोकने के लिए → PoultryPulse AI") links to `/signup`
- [ ] Formula: `birds × ₹2 (avg_loss_per_bird) × batches_per_year`
- [ ] Section animates in via IntersectionObserver scroll-reveal on first entry only
- [ ] All card copy renders in Hindi by default; switches to English on language toggle

**Design Reference:** `§H-02`
**Task Reference:** `B-02`

---

### FR-HOME-003 — Accuracy Proof Section (P0)
**Description:** Display verified accuracy metrics to build the trust required for conversion. Must never show inflated or unverified data.

**Acceptance Criteria:**
- [ ] Fetches live metrics from Supabase `mv_accuracy_dashboard` view via ISR (revalidate: 600s)
- [ ] Falls back to hardcoded demo data (clearly labelled "(Demo)") when Supabase is unreachable
- [ ] Four stat blocks display: Directional Accuracy (95.2%), MAPE (4.8%), Conformal Coverage (80.1%), Prediction Window (7 days)
- [ ] Counter animations are triggered by IntersectionObserver and disabled under `prefers-reduced-motion`
- [ ] Recharts `AreaChart` shows 30-day rolling P50 predicted vs. actual prices; colour bands: green ≥ 95%, amber 90–95%, red < 90%
- [ ] Chart provides an `aria-label` and a visually-hidden data table for screen readers
- [ ] "पूरी Accuracy रिपोर्ट देखें →" link routes to `/accuracy`
- [ ] Accuracy guarantee statement is visible and includes the refund trigger condition
- [ ] Section is suppressed (shows "Validating...") until the 95%+ accuracy gate is cleared in production

**Design Reference:** `§H-04`
**Task Reference:** `B-04`

---

### FR-HOME-004 — Testimonials & Press Section (P1)
**Description:** Display social proof through farmer testimonials with verified financial outcomes and press/credibility logos.

**Acceptance Criteria:**
- [ ] Three testimonial cards render with farmer name, location, flock size, Hindi quote, and financial outcome badge
- [ ] Primary testimonial card carries a "✓ Gorakhpur APMC records से सत्यापित" verified marker
- [ ] Fallback avatar renders initials when no photo is present (no broken image icons)
- [ ] Press logo strip renders as greyscale SVG tiles; transitions to colour on hover/focus
- [ ] Press logos are placeholder SVG text tiles (real logos require written permission)
- [ ] Cards use Z-axis cascade layout (varying `box-shadow` depth), not a flat list

**Design Reference:** `§H-05`
**Task Reference:** `B-05`

---

### FR-HOME-005 — Pricing Teaser + ROI Calculator (P0)
**Description:** Present the three pricing plans with a framing that emphasises return on investment, not cost.

**Acceptance Criteria:**
- [ ] Three pricing cards render: PulseFarm (₹2,000/mo), PulsePro (₹8,000/mo), PulseIntel (Custom)
- [ ] "Most Popular" badge renders on PulsePro in `amber500` background
- [ ] Annual/Monthly toggle switches prices without a page reload
- [ ] PulseFarm price is accompanied by "₹67/day" micro-framing copy
- [ ] Feature list rows use green checkmark (✓) and red cross (✗) icons
- [ ] ROI calculator outputs: potential annual loss, plan cost, and net benefit — formatted in Indian currency
- [ ] Primary CTA per plan fires an analytics event with `plan` and `billing_cycle` properties
- [ ] "14 दिन मुफ़्त शुरू करें" CTA on PulseFarm links to `/signup` with `?plan=pulsefarm` query param
- [ ] PulsePro CTA ("Demo बुक करें") opens Demo Modal (FR-POPUP-001)

**Design Reference:** `§H-06`
**Task Reference:** `B-06`
**Psychology Reference:** FR-PSYCH-001

---

### FR-HOME-006 — FAQ Accordion Section (P0)
**Description:** Proactively handle the eight most common objections and questions in an accessible, SEO-friendly accordion.

**Acceptance Criteria:**
- [ ] Eight FAQ items from the design doc render with Hindi question and Hindi answer by default
- [ ] Accordion is single-expand (opening one item closes others)
- [ ] Height transition animates in 300ms on open/close
- [ ] Each item uses `aria-expanded`, `aria-controls`, `id` pairing for screen reader compatibility
- [ ] Keyboard: Enter/Space toggle; up/down arrows navigate between items
- [ ] `FAQPage` JSON-LD schema is injected into `<head>` via a `<script type="application/ld+json">` tag
- [ ] All eight questions and answers are indexable (not rendered client-only)

**Design Reference:** `§H-09`
**Task Reference:** `B-09`

---

### FR-HOME-007 — Exit Intent Popup (P1)
**Description:** Capture high-intent visitors before they leave by offering a single free WhatsApp price signal as the lead magnet.

**Acceptance Criteria:**
- [ ] Popup triggers on `mouseleave` from `document.documentElement` (desktop only; suppressed on `window.innerWidth < 768`)
- [ ] Does not appear within the first 30 seconds of page load
- [ ] Shows once per session; 7-day cooldown stored in `localStorage`
- [ ] Form accepts a 10-digit Indian mobile number with `+91` prefix; validates against `/^[6-9]\d{9}$/`
- [ ] DPDP consent checkbox is required before submission
- [ ] On submit, POSTs to `/api/leads` with `source: 'exit_intent'`
- [ ] Success state replaces the form with a confirmation message
- [ ] Decline copy is non-manipulative: "नहीं, मुझे daily price नहीं चाहिए"

**Design Reference:** `§5.1`
**Task Reference:** `D-01`

---

## 3. POPUP & OVERLAY REQUIREMENTS

### FR-POPUP-001 — Demo Request Modal (P0)
**Description:** Capture qualified leads for human-led demos via a contextual modal triggered from the Nav and Hero.

**Acceptance Criteria:**
- [ ] Modal is triggered globally via a `PopupProvider` React Context (`D-04`); any component can open it
- [ ] Form fields: Name (text), WhatsApp number (+91), District (dropdown), Flock size (segmented), Preferred time (datetime picker)
- [ ] District dropdown options: Gorakhpur, Deoria, Kushinagar, Basti, Maharajganj
- [ ] On submit, POSTs to `/api/demo-requests`; rate-limited to 2 submissions per phone per day
- [ ] Focus is trapped inside the modal while open; Escape key closes it and returns focus to trigger element
- [ ] Click-outside-the-modal closes it
- [ ] `aria-modal="true"`, `role="dialog"`, and descriptive `aria-labelledby` are set

**Design Reference:** `§5.3`
**Task Reference:** `D-02`

---

### FR-POPUP-002 — Blog Scroll Popup (P2)
**Description:** Capture leads from engaged blog readers at the 50% scroll mark.

**Acceptance Criteria:**
- [ ] Popup only activates on blog post pages (`/blog/[slug]`)
- [ ] IntersectionObserver fires when the reader reaches 50% of the article body
- [ ] Renders as a bottom-right slide-in on desktop and full-bottom sheet on mobile
- [ ] Single input field: WhatsApp number
- [ ] Dismissed state stored in `sessionStorage`; does not re-appear after dismiss in the same session

**Design Reference:** `§5.x` (implied from blog section)
**Task Reference:** `D-03`

---

## 4. SECONDARY PAGE REQUIREMENTS

### FR-PRICING-001 — Full Pricing Page (P0)
**Description:** Provide a dedicated pricing page with full feature comparison, annual/monthly toggle, and enterprise enquiry.

**Acceptance Criteria:**
- [ ] Feature comparison table lists ≥ 15 features across all three plans
- [ ] Annual/Monthly toggle persists in the URL (`?billing=annual`)
- [ ] Pricing FAQ section contains at least 5 questions
- [ ] Enterprise plan row includes a Calendly embed or an enquiry form
- [ ] Three `Product` JSON-LD schemas (one per plan) are injected into `<head>`
- [ ] `generateMetadata` returns pricing-specific `<title>` and `<meta name="description">`

**Task Reference:** `C-01`

---

### FR-ACCURACY-001 — Accuracy Dashboard Page (P0)
**Description:** Public accuracy transparency page — live model performance metrics, methodology, and validation approach.

**Acceptance Criteria:**
- [ ] Page uses ISR with `revalidate: 600`
- [ ] Displays: rolling 30-day directional accuracy, MAPE, conformal coverage, and model version string
- [ ] 90-day MAPE trend line chart (Recharts)
- [ ] 30-day actual vs. predicted scatter chart (Recharts)
- [ ] Three accuracy gate status indicators (green tick / amber warning / red fail) visible
- [ ] Methodology section lists all data sources, model architecture, and validation dataset details
- [ ] `Dataset` JSON-LD schema injected

**Task Reference:** `C-02`

---

### FR-GORAKHPUR-001 — Gorakhpur Local SEO Page (P1)
**Description:** Landing page optimised for "Gorakhpur broiler price" and related search queries; builds local trust.

**Acceptance Criteria:**
- [ ] Page displays latest Gorakhpur mandi price prediction (server-rendered via ISR)
- [ ] H1 contains "Gorakhpur" and a primary broiler price keyword
- [ ] `LocalBusiness` + `FAQPage` JSON-LD schemas are injected
- [ ] Internal links to Deoria, Kushinagar, Basti, and Maharajganj district sub-pages
- [ ] District sub-pages (`C-03a`) use the same `DistrictPage` template component, parameterised by slug

**Task Reference:** `C-03`, `C-03a`

---

### FR-CASESTUDIES-001 — Case Studies (P1)
**Description:** Detailed farmer case studies demonstrating verified financial outcomes to support mid-funnel conversion.

**Acceptance Criteria:**
- [ ] Case study content is MDX-based (challenge → solution → outcome structure)
- [ ] Detail pages inject `Article` JSON-LD schema
- [ ] Each detail page includes a "Related Case Studies" sidebar (≥ 2 items)
- [ ] Index page lists all published case studies with outcome badges

**Task Reference:** `C-04`

---

### FR-BLOG-001 — Blog Index & Post Template (P2)
**Description:** SEO-driven blog for top-of-funnel organic acquisition.

**Acceptance Criteria:**
- [ ] Index page supports category filter tabs and client-side Fuse.js search
- [ ] Pagination: 12 posts per page
- [ ] Post template uses ISR: `revalidate: 3600`
- [ ] Post template includes: author bio, auto-generated table of contents, 3 related posts, scroll progress indicator
- [ ] `BlogPosting` + `BreadcrumbList` JSON-LD schemas injected on detail pages
- [ ] Dynamic OG image generated via `next/og` for each post (uses `E-06`)
- [ ] Blog scroll popup (`FR-POPUP-002`) activates on post pages

**Task Reference:** `C-05`, `C-05a`

---

### FR-ABOUT-001 — About Page (P2)
**Description:** Build founder and team credibility for mid-funnel trust.

**Acceptance Criteria:**
- [ ] Founding story written in Ann Handley brand voice (human, narrative)
- [ ] Timeline component shows Phase 0 → Phase 1 → roadmap milestones
- [ ] `Organization` JSON-LD schema injected

**Task Reference:** `C-06`

---

### FR-ENTERPRISE-001 — Enterprise Page (P2)
**Description:** Dedicated landing page for B2B segments (S2–S6): integrators, QSR chains, insurers, feed companies.

**Acceptance Criteria:**
- [ ] Five B2B segments displayed with use-case copy
- [ ] Feature list includes: API access, historical data, white-label option, SLA terms
- [ ] Demo booking form present; POSTs to `/api/demo-requests` with `source: 'enterprise'`
- [ ] `Service` JSON-LD schema injected

**Task Reference:** `C-07`

---

### FR-WHATSAPP-DEMO-001 — WhatsApp Demo Page (P0)
**Description:** Lowest-friction conversion path — give visitors a single free WhatsApp price signal to experience the product.

**Acceptance Criteria:**
- [ ] Form accepts phone number and district; validates phone format
- [ ] Submission rate-limited to 1 per phone number (enforced server-side)
- [ ] POST goes to `/api/leads` with `source: 'whatsapp_demo'`
- [ ] Confirmation state is shown after successful submission (no page reload)
- [ ] Post-submission state shows an upsell CTA to `/signup`

**Task Reference:** `C-08`

---

### FR-REFERRAL-001 — Referral Program (P2)
**Description:** Incentivised peer referral system leveraging WhatsApp sharing behaviour.

**Acceptance Criteria:**
- [ ] `/refer` page is auth-gated (redirects unauthenticated users to `/login`)
- [ ] Referral code is 8-character alphanumeric (uppercase, no confusable characters: 0/O, 1/I)
- [ ] Code generation is idempotent — existing code returned if already generated
- [ ] WhatsApp share button pre-composes a share message containing the referral code
- [ ] Page displays: referral count, credits earned, pending credits
- [ ] Self-referral and same-phone fraud checks enforced in `H-03` API route

**Task Reference:** `H-01`, `H-02`, `H-03`

---

## 5. COPY & LOCALISATION REQUIREMENTS

### FR-COPY-001 — Hindi/English Language Toggle (P0)
**Description:** All user-facing copy must be available in Hindi (default) and English, switchable without a page reload.

**Acceptance Criteria:**
- [ ] Language preference stored in `localStorage` and a cookie (for SSR hydration alignment)
- [ ] Default language is Hindi (`hi`)
- [ ] Server-side: `Accept-Language` header used as fallback when no preference cookie is present
- [ ] Language toggle is accessible in the mobile nav overlay and the desktop nav
- [ ] No page reload on toggle; React Context drives copy switching
- [ ] Hindi content uses Noto Sans Devanagari (`--font-devanagari` CSS variable)
- [ ] Body text minimum size is 16px in both languages; captions minimum 14px

**Task Reference:** `F-05`

---

### FR-COPY-002 — Indian Currency Formatting (P0)
**Description:** All monetary amounts must be formatted according to Indian convention using the `formatINR` utility.

**Acceptance Criteria:**
- [ ] `formatINR(amount, locale)` returns: ₹50,000 for amounts < 1,00,000; ₹1.5 लाख for amounts < 1,00,00,000; ₹1.2 करोड़ for amounts ≥ 1,00,00,000
- [ ] Hindi locale uses लाख/करोड़ suffix; English locale uses L/Cr suffix
- [ ] All pricing, calculator outputs, and stat blocks use this utility
- [ ] `formatShort` variant available for compact display contexts

**Task Reference:** `F-08`

---

## 6. SEO REQUIREMENTS

### FR-SEO-001 — Technical SEO Foundation (P0)
**Acceptance Criteria:**
- [ ] `sitemap.ts` generates a dynamic sitemap including all static pages + blog posts + district pages with `lastmod` and `priority`
- [ ] `robots.ts` allows all public pages and major AI crawlers (GPTBot, PerplexityBot, ClaudeBot); disallows `/dashboard/*`, `/api/*`, `/admin/*`
- [ ] Sitemap URL is referenced in `robots.ts`

**Task Reference:** `E-04`, `E-05`

---

### FR-SEO-002 — Page Metadata (P0)
**Acceptance Criteria:**
- [ ] Root layout sets title template `%s | PoultryPulse AI` and default OG image
- [ ] Every page implements `generateMetadata` returning unique `title`, `description`, `og:title`, `og:description`, `og:image`
- [ ] `<html lang="hi">` set by default; updated dynamically on language toggle

**Task Reference:** `A-03`, `G-01`

---

### FR-SEO-003 — Structured Data / JSON-LD (P0)
**Acceptance Criteria:**
- [ ] `Organization` schema in root layout (covers all pages)
- [ ] `WebSite` + `FAQPage` schemas on homepage
- [ ] `FAQPage` schema on `/faq`
- [ ] `Product` schemas (3) on `/pricing`
- [ ] `Dataset` schema on `/accuracy`
- [ ] `LocalBusiness` + `FAQPage` schemas on `/gorakhpur` and district sub-pages
- [ ] `BlogPosting` + `BreadcrumbList` schemas on each blog post
- [ ] `Article` schema on each case study
- [ ] `Service` schema on `/enterprise`
- [ ] All schemas are valid JSON-LD (no trailing commas, no `undefined` values)

**Task Reference:** `G-02` through `G-06`, `B-09`, `B-11`

---

### FR-SEO-004 — Blog SEO (P2)
**Acceptance Criteria:**
- [ ] Dynamic OG images generated via `next/og` for blog posts and case studies (`E-06`)
- [ ] Hreflang tags (`x-default`, `en-IN`, `hi-IN`) on all indexable pages
- [ ] Scroll progress indicator on blog posts (CSS scroll-driven animation with JS fallback)
- [ ] `@supports (animation-timeline: scroll())` feature detection used for scroll progress

**Task Reference:** `C-05a`, `E-06`, `G-06`, `F-10`

---

## 7. TECHNICAL REQUIREMENTS

### FR-TECH-001 — Design Token & Component Architecture (P0)
**Acceptance Criteria:**
- [ ] `packages/ui/src/web-tokens.ts` exports `WebTokens`, `WebTypography`, `WebSpacing`, and `WebMotion` as named exports
- [ ] Tailwind config extended with brand colour scales (`brandGreen`, `saffron`, `amber`), font families, spacing scale, and custom animation keyframes (`fade-up`, `fade-in`, `blur-in`)
- [ ] Fonts loaded via `next/font/google` with correct subsets and `font-display: swap`
- [ ] CSS variables `--font-sora`, `--font-jakarta`, `--font-devanagari` applied to `:root`

**Task Reference:** `A-01`, `A-02`, `A-04`

---

### FR-TECH-002 — Announcement Banner (P0)
**Acceptance Criteria:**
- [ ] Banner renders above the nav, 44px height, `brandGreen700` background
- [ ] Banner is dismissable via an X button with a 44px touch target
- [ ] Dismissed state is stored in `sessionStorage`; banner does not re-appear after dismiss in the same session
- [ ] Phase 0 launch copy is bilingual (Hindi + English)

**Task Reference:** `A-07`

---

### FR-TECH-003 — Analytics Instrumentation (P0)
**Acceptance Criteria:**
- [ ] `trackEvent(event, properties)` utility fires to Vercel Analytics and the Supabase `events` table (async, non-blocking)
- [ ] Auto-attached properties: `page_path`, `session_id`, `device_type`, UTM params from `sessionStorage`
- [ ] Utility is server-safe (no-op when `window` is undefined)
- [ ] CTA clicks, form submissions, popup opens/closes, and language toggles are tracked events

**Task Reference:** `F-09`

---

### FR-TECH-004 — DPDP Act 2023 Compliance (P0)
**Acceptance Criteria:**
- [ ] All lead-capture forms include a DPDP consent checkbox; submission blocked if unchecked
- [ ] API routes (`E-01`, `E-02`) reject requests where `consent_given !== true`
- [ ] Privacy Policy page (`/privacy`) is DPDP-compliant and shows a "Last updated" date
- [ ] Phone numbers stored in Supabase (AWS `ap-south-1`, Mumbai region)
- [ ] Privacy notice text: "आपका नंबर सिर्फ price alerts के लिए" present on all capture forms
- [ ] Terms of Service and Refund Policy pages exist and are linked from the footer

**Task Reference:** `C-11`, `E-01`

---

### FR-TECH-005 — Performance & Uptime (P0)
**Acceptance Criteria:**
- [ ] Core Web Vitals targets: LCP < 1.8s, INP < 150ms, CLS < 0.05 (measured on Lighthouse CI)
- [ ] Total page JS budget: < 800KB gzipped
- [ ] Hero section initial JS: < 200KB
- [ ] All images except the hero are lazy-loaded; served as WebP
- [ ] Farmer testimonial avatars: WebP, max 120 × 120px
- [ ] Icons use `@phosphor-icons/react` (tree-shakeable)
- [ ] `/api/health` endpoint returns `{ status, supabase, version, timestamp }`
- [ ] Lighthouse CI fails PR if Performance < 85 or Accessibility < 90
- [ ] Uptime monitoring on `/`, `/api/health`, `/pricing`, `/accuracy` with Slack alerts

**Task Reference:** `E-03`, `I-01`, `J-03`

---

## 8. ACCESSIBILITY REQUIREMENTS

### NFR-A11Y-001 — WCAG 2.1 AA Compliance (P0)

**Acceptance Criteria:**
- [ ] Body text on white: contrast ratio ≥ 7:1 (AAA)
- [ ] White text on `brandGreen700`: contrast ratio ≥ 4.5:1
- [ ] `amber500` is never used for body text (ratio ~2.8:1); decoration only
- [ ] All interactive elements are keyboard focusable
- [ ] Focus ring: 3px solid offset, `brandGreen500` colour
- [ ] First focusable element in root layout is a "Skip to content" link
- [ ] Modals implement focus trap while open; focus returns to trigger element on close
- [ ] All images have descriptive `alt` text in both Hindi and English
- [ ] Price numbers carry `aria-label` with units (e.g., "₹168 per kilogram")
- [ ] Charts have `aria-label` and a visually-hidden data table alternative
- [ ] Decorative icons use `aria-hidden="true"` with adjacent visible text labels
- [ ] Minimum touch target: 44 × 44px for all tappable elements; hamburger: 48 × 48px; CTAs: full-width on mobile

**Motion Accessibility:**
- [ ] `@media (prefers-reduced-motion: reduce)` disables all scroll animations, hero phone mockup animation, counter animations, and reduces all transitions to ≤ 1ms

**Task Reference:** `I-02`

---

## 9. API REQUIREMENTS

### FR-LEADS-001 — Lead Capture API (`/api/leads`) (P0)
**Description:** Server-side endpoint for all lead-capture form submissions across the pre-login site.

**Acceptance Criteria:**
- [ ] Runtime: Vercel Edge
- [ ] Request validated against `LeadRequestSchema` (Zod):
  - `phone`: Indian mobile regex `/^[6-9]\d{9}$/` — error message in Hindi
  - `source`: enum of all valid capture surfaces
  - `district`: optional, enum of supported districts
  - `consent_given`: must be literal `true`
  - `utm`: optional UTM tracking object
- [ ] Rate limited to 5 submissions per IP per hour
- [ ] Supabase upsert to `leads` table (upsert on `phone` — prevents duplicates)
- [ ] On success, triggers a Supabase Edge Function to send a WhatsApp welcome message
- [ ] Returns HTTP 429 with a Hindi error message on rate limit breach
- [ ] Returns HTTP 400 with field-level validation errors on schema failure

**Task Reference:** `E-01`

---

## 10. PSYCHOLOGICAL / CRO REQUIREMENTS

### FR-PSYCH-001 — Pricing Frame & Anchoring (P1)
**Description:** All pricing presentation must anchor value against potential loss, not against subscription cost.

**Acceptance Criteria:**
- [ ] PulseFarm (₹2,000/mo) is framed as "₹67/day" in the pricing teaser and on the pricing page
- [ ] ROI calculator output leads with potential annual loss (anchor), then plan cost, then net benefit
- [ ] ROI ratio (e.g., "₹8 back for every ₹1 invested") is the visually dominant output
- [ ] Pricing section headline: "हर ₹3,000 निवेश पर ₹20,000+ का फ़ायदा" (as per design doc)

**Task Reference:** `B-06`, `C-01`

---

## 11. NAVIGATION REQUIREMENTS

### FR-NAV-001 — Floating Glass Pill Navigation (P0)

**Acceptance Criteria:**
- [ ] Nav is fixed, horizontally centred, 24px from top
- [ ] Background: `rgba(255,255,255,0.85)` with `backdrop-filter: blur(24px)`
- [ ] Border: `1px solid rgba(26, 107, 60, 0.12)`; border-radius: `999px`
- [ ] After 50px scroll, padding reduces and blur strengthens — transition: 400ms `easeOutQuart`
- [ ] Desktop: all nav items + primary CTA + ghost login link visible
- [ ] Mobile (< 768px): hamburger icon; tap morphs to X via spring animation (300ms); full-screen overlay
- [ ] Mobile overlay: links stagger-animate in at 0, 80, 160, 240, 320ms delays
- [ ] Language toggle (हिंदी | English) placed at bottom of mobile overlay
- [ ] Nav CTA fires `hero_cta_click` with `source='nav'`

**Design Reference:** `§2.1`
**Task Reference:** `A-05`

---

## 12. FOOTER REQUIREMENTS

### FR-FOOTER-001 — Footer (P0)

**Acceptance Criteria:**
- [ ] Five-column grid on desktop; two-column on mobile; single column below 480px
- [ ] All five link columns from design doc `§H-11` are present and link to correct routes
- [ ] Legal bar includes: © notice, CIN, DPDP Act 2023 and IT Act 2000 compliance note
- [ ] Language toggle in footer bottom bar
- [ ] WhatsApp and email contact links present

**Task Reference:** `A-06`

---

## 13. IMPLEMENTATION SEQUENCE & LAUNCH GATE

### 13.1 P0 Launch Blockers (Must complete before any customer onboarded)

```
Group A — Foundation:    A-01 → A-02 → A-03 → A-04 → A-05 → A-06 → A-07
Group B — Homepage:      B-01 → B-02 → B-03 → B-04 → B-05 → B-06 → B-07 → B-08 → B-09 → B-10 → B-11
Group E — APIs & SEO:    E-01 → E-02 → E-03 → E-04 → E-05
Pages:                   C-01 (Pricing), C-08 (WhatsApp Demo)
Compliance:              FR-TECH-004 (DPDP)
Testing:                 I-03 (E2E critical path)
Accuracy Gate:           95%+ directional accuracy validated on Gorakhpur holdout data (absolute blocker — PRD §6)
```

### 13.2 Full Implementation Sequence

| Week | Tasks                                              |
|------|----------------------------------------------------|
| 1    | A-01 – A-07 (Foundation & design system)           |
| 2    | B-01 – B-04 (Hero, Pain, How It Works, Accuracy)   |
| 3    | B-05 – B-11 (Remaining sections + homepage assembly)|
| 4    | E-01 – E-06 (API routes + SEO + OG images)         |
| 5    | D-01 – D-04 (Popups & overlays)                    |
| 6    | C-01, C-02, C-03, C-09 (Pricing, Accuracy, Gorakhpur, FAQ pages) |
| 7    | C-04, C-05, C-05a (Case Studies + Blog)            |
| 8    | C-06, C-07, C-08, C-10, C-11, C-12 (Remaining pages)|
| 9    | F-01 – F-10 (Shared UI components polish)          |
| 10   | G-01 – G-06 (SEO schemas)                          |
| 11   | H-01 – H-03 (Referral program)                     |
| 12   | I-01 – I-05 (Testing & QA)                         |
| 13   | J-01 – J-04 (Deployment & monitoring)              |

---

## 14. REQUIREMENTS TRACEABILITY MATRIX

| Requirement ID     | Design Section  | Task(s)             | Priority |
|--------------------|-----------------|---------------------|----------|
| FR-HOME-001        | §H-01           | B-01                | P0       |
| FR-HOME-002        | §H-02           | B-02                | P0       |
| FR-HOME-003        | §H-04           | B-04                | P0       |
| FR-HOME-004        | §H-05           | B-05                | P1       |
| FR-HOME-005        | §H-06           | B-06                | P0       |
| FR-HOME-006        | §H-09           | B-09                | P0       |
| FR-HOME-007        | §5.1            | D-01                | P1       |
| FR-POPUP-001       | §5.3            | D-02                | P0       |
| FR-POPUP-002       | —               | D-03                | P2       |
| FR-PRICING-001     | §H-06           | C-01                | P0       |
| FR-ACCURACY-001    | §H-04           | C-02                | P0       |
| FR-GORAKHPUR-001   | §3.1            | C-03, C-03a         | P1       |
| FR-CASESTUDIES-001 | §3.1            | C-04                | P1       |
| FR-BLOG-001        | §3.1            | C-05, C-05a         | P2       |
| FR-ABOUT-001       | §3.1            | C-06                | P2       |
| FR-ENTERPRISE-001  | §3.1            | C-07                | P2       |
| FR-WHATSAPP-DEMO-001 | §3.1          | C-08                | P0       |
| FR-REFERRAL-001    | —               | H-01, H-02, H-03    | P2       |
| FR-COPY-001        | §1.2            | F-05                | P0       |
| FR-COPY-002        | §H-02           | F-08                | P0       |
| FR-SEO-001         | —               | E-04, E-05          | P0       |
| FR-SEO-002         | —               | A-03, G-01          | P0       |
| FR-SEO-003         | —               | G-02 – G-06, B-09, B-11 | P0  |
| FR-SEO-004         | —               | C-05a, E-06, G-06, F-10 | P2  |
| FR-TECH-001        | §1.1–1.4        | A-01, A-02, A-04    | P0       |
| FR-TECH-002        | §5.2            | A-07                | P0       |
| FR-TECH-003        | —               | F-09                | P0       |
| FR-TECH-004        | —               | C-11, E-01          | P0       |
| FR-TECH-005        | §9              | E-03, I-01, J-03    | P0       |
| NFR-A11Y-001       | §7              | I-02                | P0       |
| FR-LEADS-001       | §5.1            | E-01                | P0       |
| FR-PSYCH-001       | §H-06           | B-06, C-01          | P1       |
| FR-NAV-001         | §2.1            | A-05                | P0       |
| FR-FOOTER-001      | §H-11           | A-06                | P0       |

---

*Document: 02_prelogin_requirements_master.md*
*Derived from: 01_prelogin_design_master.md + 03_prelogin_tasks_master.md*
*Previous: 01_prelogin_design_master.md*
*Next: 03_prelogin_tasks_master.md*
