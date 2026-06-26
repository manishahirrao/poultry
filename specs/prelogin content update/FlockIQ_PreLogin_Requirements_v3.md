# FlockIQ — Pre-Login Website Requirements Master (v3.0)
# Supersedes: 02_prelogin_requirements_master.md | PoultryPulse_Website_Requirements_v1.md
# Version: v3.0 | June 2026 | CONFIDENTIAL
# Brand: FlockIQ (formerly PoultryPulse AI / PoultrySense)
# Design Reference: FlockIQ_PreLogin_Design_Master_v3.md
# Stack: Next.js 15 App Router · TypeScript strict · Tailwind CSS v4 · Framer Motion v11
#        Supabase SSR · Vercel Edge · Meta WhatsApp Business API

---

## 1. CONVENTIONS

### 1.1 Requirement ID Format

```
FR-[GROUP]-[SEQ]   → Functional Requirement
NFR-[GROUP]-[SEQ]  → Non-Functional Requirement
```

Groups:
`HOME` `NAV` `SOLUTIONS` `FEATURES` `PRICING` `ACCURACY` `ABOUT` `BLOG`
`CASESTUDIES` `FAQ` `CONTACT` `ENTERPRISE` `LEGAL` `AUTH` `ONBOARDING`
`SEO` `MOTION` `PERF` `A11Y` `GAP` `WHATSAPP` `GLOBAL`

### 1.2 Priority Levels

| Priority | Label   | Meaning                                                     |
|----------|---------|-------------------------------------------------------------|
| P0       | Blocker | Must ship before any paying customer can be onboarded       |
| P1       | High    | Must ship at public launch (Phase 0)                        |
| P2       | Medium  | Ship within 4 weeks of launch                               |
| P3       | Future  | Phase 1 or later; design must accommodate future addition   |

### 1.3 Acceptance Criteria Convention

Every requirement lists testable criteria as `[ ]` checkboxes.
Each maps to at least one task in `FlockIQ_PreLogin_Tasks_v3.md`.

---

## 2. BRAND & GLOBAL REQUIREMENTS

### FR-GLOBAL-001 — Brand Rename: Complete FlockIQ Migration
**Priority:** P0
**Description:** All pre-login website surfaces must reflect "FlockIQ" branding.

**Acceptance Criteria:**
- [ ] Every page title (HTML `<title>`) contains "FlockIQ" — no "PoultryPulse", "PoultrySense"
- [ ] All `og:site_name` values read "FlockIQ"
- [ ] All WhatsApp sender names updated to "FlockIQ"
- [ ] Logo SVG renders FlockIQ brand (chicken silhouette + upward arrow + text)
- [ ] Footer copyright reads "© 2026 FlockIQ Technologies Pvt. Ltd."
- [ ] No legacy brand name appears in any user-visible string, meta tag, or structured data
- [ ] `CODEOWNERS` and `.env` references updated (no user-visible impact but prevents accidental leaks)

### FR-GLOBAL-002 — Language Toggle (Hindi / English)
**Priority:** P0

**Acceptance Criteria:**
- [ ] Language toggle rendered in nav (pill style: `[EN | हि]`)
- [ ] Default language: English for ALL users, everywhere, always
- [ ] flockiq_lang cookie: always initialised to 'en' — never set from Accept-Language
- [ ] Server component renders correct language based on `lang` cookie (SSR-friendly)
- [ ] All marketing copy has both `hi-IN` and `en` translations in `/messages/*.json`
- [ ] `<html lang="hi">` or `<html lang="en">` matches active language
- [ ] Switching language does NOT trigger full page reload (React context swap)
- [ ] Numbers always rendered in Hindu-Arabic numerals (1,2,3 — not Devanagari digits) in Hindi mode

### FR-GLOBAL-003 — Country/Region Detection
**Priority:** P1

**Acceptance Criteria:**
- [ ] IP geolocation (Vercel Edge) detects user country on first visit
- [ ] India users: default English, INR currency, India-specific content shown
- [ ] Non-India users: English, USD currency, global content shown
- [ ] Country can be manually overridden in nav or footer selector
- [ ] Country setting persists via `localStorage` key `flockiq_region`
- [ ] No EU GDPR cookie consent required for functional cookies (IP detection only — no tracking)

### FR-GLOBAL-004 — Announcement Bar
**Priority:** P1

**Acceptance Criteria:**
- [ ] Fixed top bar, 44px height, z-index 100, brand700 background
- [ ] 4 content variants rotate every 24 hours (tied to server timestamp, not client)
- [ ] Dismiss [×] button stores dismissal in `sessionStorage` — bar stays hidden for session
- [ ] Bar is keyboard-accessible: [×] has `aria-label="Dismiss announcement"`
- [ ] CTA link in bar fires `announcement_bar_click` analytics event with `variant` property
- [ ] On mobile: text truncates after 80 characters with "→" suffix if needed

---

## 3. NAVIGATION REQUIREMENTS

### FR-NAV-001 — Primary Navigation Bar
**Priority:** P0

**Acceptance Criteria:**
- [ ] Nav height: 72px, position sticky (not fixed — sticky is more performant)
- [ ] Background: transparent on page load, transitions to `rgba(255,255,255,0.95)` + `backdrop-filter:blur(20px)` on first scroll (threshold: 10px)
- [ ] Logo: SVG, links to `/`, max-height 36px, renders at 1× and 2× DPR
- [ ] Nav links: Products▾, Solutions▾, Features, Pricing, Resources▾
- [ ] Right section: Language toggle, Login link, "Start Free Trial" CTA
- [ ] All nav links fire `nav_click` with `label` and `destination` properties
- [ ] "Start Free Trial" fires `nav_trial_click` analytics event
- [ ] Active page: nav link shows brand700 colour (derived from pathname)
- [ ] `aria-current="page"` on active nav link

### FR-NAV-002 — Products Mega-Dropdown
**Priority:** P1

**Acceptance Criteria:**
- [ ] Triggered by hover (200ms delay to prevent accidental triggers) + click
- [ ] Keyboard: Tab into "Products" → Enter opens dropdown; arrow keys navigate items; Escape closes
- [ ] Dropdown: 3-column layout (Platform, By Role, Featured)
- [ ] Featured column shows WhatsApp Log Automation with special highlight treatment
- [ ] Bottom strip: partner logo strip (AGMARKNET, IMD, NECC) + farm count
- [ ] Closes on Escape, click outside, or focus leaving the dropdown
- [ ] `aria-expanded`, `aria-haspopup="true"` on trigger button
- [ ] Animated: fade-in + 4px slide-down, 200ms easeOut

### FR-NAV-003 — Mobile Navigation
**Priority:** P0

**Acceptance Criteria:**
- [ ] Hamburger button visible at `<768px` (44×44px touch target)
- [ ] Mobile menu: full-screen overlay, brand900 background, z-index 200
- [ ] All nav items visible in mobile menu (no items hidden on mobile)
- [ ] Mobile CTA: full-width "Start Free Trial" button at bottom of menu
- [ ] Opens with slide-in from right, 350ms spring (Framer Motion)
- [ ] Scroll locked when menu open (`overflow:hidden` on `<body>`)
- [ ] Closes on: back button, Escape key, clicking overlay outside menu, nav link click
- [ ] Focus trap: Tab cycles only within open menu

### FR-NAV-004 — Footer
**Priority:** P1

**Acceptance Criteria:**
- [ ] 6-column layout desktop, 2-column tablet, 1-column mobile (accordion on mobile)
- [ ] Columns: Brand, Product, Solutions, Resources, Locations (India), Legal
- [ ] Brand column: logo, tagline, description, social icons, app store badges
- [ ] Social icons: LinkedIn, Twitter/X, YouTube, WhatsApp (each links to correct URL)
- [ ] App badges: App Store + Google Play (link to respective stores when app is live; show "Coming Soon" pill otherwise)
- [ ] Locations column: 5 India districts + "All Locations →" link
- [ ] Bottom bar: copyright, country selector, legal badges
- [ ] Country selector in footer changes `flockiq_region` setting
- [ ] Mobile accordion: each column is collapsible (details/summary element, CSS only)
- [ ] All footer links tested for correct destinations

---

## 4. HOMEPAGE REQUIREMENTS

### FR-HOME-001 — Hero Section
**Priority:** P0

**Acceptance Criteria:**
- [ ] `min-height: 100dvh` (not `h-screen` — fixes iOS Safari viewport bug)
- [ ] Background: `heroGradient` CSS variable, NOT an image asset
- [ ] Headline: "Run Your Poultry Operation Like a Fortune 500 Company."
- [ ] Hindi headline available via toggle: "अपना Poultry Farm चलाएं एक बड़े कॉर्पोरेट की तरह।" (toggle-only, not default page requirement)
- [ ] Headline renders in `displayHero` type scale (clamp 44px → 80px)
- [ ] Eyebrow pill: "🌍 Used in 15+ countries across 4 continents" — white/8% bg, white text
- [ ] Primary CTA: signal orange (#E8611A) pill button, 60px height, "Start Free Trial → 14 Days"
- [ ] Secondary CTA: glass white button, "📹 See a 3-Min Demo"
- [ ] Trust micro-text: "✓ Free 14 days ✓ No credit card ✓ Works on WhatsApp ✓ Cancel anytime"
- [ ] Data partners strip: "Powered by verified data:" + AGMARKNET, NECC, IMD, DAHDF, NCDEX logos
- [ ] Phone mockup: cycles 4 screens every 3s with cross-dissolve (Dashboard / WhatsApp log / Price signal / FCR trend)
- [ ] Phone mockup: float animation on desktop (CSS transform, 4s cycle)
- [ ] Phone mockup: static on mobile (no animation for performance)
- [ ] Animated floating particles: 5–8 small green orbs, slow CSS drift, brand400/20%
- [ ] All entrance animations disabled when `prefers-reduced-motion: reduce`
- [ ] Hero primary CTA fires `hero_cta_click` event with `{ source: 'hero', lang, device }`

### FR-HOME-002 — Social Proof Numbers Strip
**Priority:** P0

**Acceptance Criteria:**
- [ ] 4 stat blocks: 500+ Farms Active | 15+ Countries | 97% Log Compliance | ₹50K–1.5L Avg Savings
- [ ] Counter animation: count from 0 to final value on first intersection, 1.2s easeOutExpo
- [ ] `prefers-reduced-motion`: skip animation, show final value immediately
- [ ] Customer count (500+) fetched from Supabase SSR (ISR, revalidate: 300s)
- [ ] Fallback: hardcoded value if Supabase unavailable (no blank numbers)
- [ ] Mobile: 2×2 grid (no vertical dividers)

### FR-HOME-003 — Pain Section + Loss Calculator
**Priority:** P0

**Acceptance Criteria:**
- [ ] 5 cards total: 3 standard pain cards + 1 wide card (2-col span) + calculator card
- [ ] Pain Card 1: "2 Hours/Day Lost" — data collection pain
- [ ] Pain Card 2: "₹50K–1.5L Lost Per Batch" — timing loss
- [ ] Pain Card 3: "Disease Alerts Arrive Too Late" — HPAI risk
- [ ] Wide Card: "The Data Collection Problem" — before/after WhatsApp conversation visual
- [ ] Loss Calculator: bird-count slider (10K → 200K), output in `formatIndianCurrency` (₹X लाख)
- [ ] Calculator formula: `birds × ₹2 × batches_per_year`
- [ ] Calculator CTA links to `/signup`
- [ ] Section reveals via IntersectionObserver scroll-reveal, once only
- [ ] All card copy translates between Hindi/English on language toggle

### FR-HOME-004 — How FlockIQ Works (3 Feature Blocks)
**Priority:** P0

**Acceptance Criteria:**
- [ ] 3 alternating left-right feature blocks
- [ ] Block 1: Farm Management — dashboard screenshot, 5 feature bullets
- [ ] Block 2: WhatsApp Log Automation — WhatsApp conversation mockup, 5 feature bullets
- [ ] Block 3: Price Intelligence — price forecast screenshot, 5 feature bullets
- [ ] Product screenshots: lazy-loaded, IntersectionObserver triggered
- [ ] Each block has a CTA link to the relevant feature detail page
- [ ] Screenshots are accurate (reflect current dashboard design, not placeholder text)
- [ ] Mobile: blocks stack vertically, visual above text

### FR-HOME-005 — Key Stats Trust Strip (Dark)
**Priority:** P1

**Acceptance Criteria:**
- [ ] 4 stats on dark (#0D3B21) background
- [ ] Stats: 96.2% Directional Accuracy | 500+ Farms | 97% WhatsApp Log Compliance | ₹1.8L Avg Savings
- [ ] Accuracy stat (96.2%) is live-fetched from Supabase `mv_accuracy_dashboard` (ISR 600s)
- [ ] Accuracy shows "(Demo)" suffix when Supabase is unreachable
- [ ] Counter animation (same as FR-HOME-002)

### FR-HOME-006 — WhatsApp Log Automation Feature Highlight
**Priority:** P0

**Acceptance Criteria:**
- [ ] Eyebrow: "★ FLAGSHIP FEATURE" in WhatsApp green pill
- [ ] 3-step process layout with animated connectors between steps
- [ ] Step connector: CSS dashed line grows left→right, 600ms delay after preceding step renders
- [ ] Before/After comparison table visible (2 columns)
- [ ] Before column: shows the 5-row comparison with red/grey values
- [ ] After column: shows FlockIQ values in green
- [ ] CTA button fires `whatsapp_feature_cta_click` analytics event

### FR-HOME-007 — Testimonials
**Priority:** P1

**Acceptance Criteria:**
- [ ] 3 testimonial cards
- [ ] Card 1: Ramesh Yadav (Gorakhpur, 25K birds) — ₹1,24,000 outcome — verified badge
- [ ] Card 2: Suresh Kumar Patel (Deoria, 8 farms) — ₹3.2L HPAI save
- [ ] Card 3: David Chen (Jakarta, 12 farms) — global user representation
- [ ] Verified badge renders: "✓ Verified against Gorakhpur APMC records" (Card 1 only)
- [ ] Avatar: initials fallback if no photo (never broken img)
- [ ] Financial outcome badge: rendered as green pill with ₹ amount
- [ ] Press logo strip: greyscale default, colour on hover (CSS filter transition)
- [ ] Press logos are SVG/text tiles (no real logos without written permission)
- [ ] CTA: "Read All Case Studies →" links to `/case-studies`

### FR-HOME-008 — For Integrators vs For Farms Cards
**Priority:** P1

**Acceptance Criteria:**
- [ ] 2 cards, equal width, on brand50 (#EDF7F1) background
- [ ] Integrators card: 9 feature bullets including WhatsApp log automation
- [ ] Farms card: 7 feature bullets
- [ ] Each card has a pricing teaser ("From ₹X,000/month") and CTA button
- [ ] CTA fires analytics event with `segment: 'integrator' | 'farm'`

### FR-HOME-009 — Global Reach Section
**Priority:** P2

**Acceptance Criteria:**
- [ ] SVG world map: styled in brand colours, not photorealistic
- [ ] 4 active location markers with tooltip on hover/click: India, Indonesia, Vietnam, Thailand
- [ ] Tooltip: country name + brief coverage description
- [ ] "Coming soon" indicators for Kenya, Nigeria, Bangladesh, Pakistan
- [ ] Trust logos: NABARD, DADF, FAO
- [ ] Compliance statement: "DPDP Act 2023 (India) · GDPR-compatible"
- [ ] Map is accessible: tooltip content also readable via screen reader (aria-describedby)
- [ ] Map is static SVG on mobile (no interaction complexity)

### FR-HOME-010 — Pricing Teaser
**Priority:** P0

**Acceptance Criteria:**
- [ ] ROI anchor shown BEFORE prices (same as FR-PRICING-002)
- [ ] 3 plan cards: PulseFarm (₹2,000), PulsePro (₹5,000), Enterprise (Custom)
- [ ] Annual/monthly toggle at top — prices update without page reload
- [ ] "Most Popular" badge on PulsePro
- [ ] CTA per card fires analytics with `{ plan, billing_cycle }`
- [ ] ROI calculator strip below cards (same component as FR-PRICING-003 — reused)
- [ ] "See All Plans →" link to `/pricing`

### FR-HOME-011 — Final CTA Section
**Priority:** P0

**Acceptance Criteria:**
- [ ] Dark hero gradient background matching Section H-01
- [ ] Headline and body match design spec
- [ ] Primary CTA: signal orange pill, fires `final_cta_click` analytics event
- [ ] Secondary CTA: WhatsApp demo link
- [ ] Trust badges: DPDP, AWS Mumbai, SSL

---

## 5. SOLUTIONS PAGE REQUIREMENTS

### FR-SOL-001 — For Integrators (`/solutions/integrators`)
**Priority:** P0 (Primary new page — core ICP for pivot)

**Acceptance Criteria:**
- [ ] Hero headline and subheadline match design spec
- [ ] "The Integrator's Daily Chaos" timeline: 5 steps, before/after format
- [ ] Multi-farm dashboard screenshots: accurate, lazy-loaded, labelled
- [ ] WhatsApp log section: full flow walkthrough
- [ ] Pricing section: PulsePro + Enterprise comparison table (7 rows minimum)
- [ ] 3 integrator-specific testimonials or case study links
- [ ] Hero CTA fires `integrator_hero_cta_click` with `segment: 'integrator'`
- [ ] Page has own SEO metadata (see FR-SEO-001 matrix)

**Gap Coverage on this page:**
- [ ] GAP 1 (Batch P&L): mention full cost tracking in feature list
- [ ] GAP 2 (Bird Lifting): "Harvest Queue Optimizer" section with lifting management
- [ ] GAP 5 (Benchmarking): "Cross-Farm Performance Intelligence" section
- [ ] GAP 6 (Calamity Risk): per-farm risk score in risk management section
- [ ] GAP 7 (Documents): "Audit-Ready in 30 Seconds" section

### FR-SOL-002 — For Farms (`/solutions/farms`)
**Priority:** P1

**Acceptance Criteria:**
- [ ] Hero, pain section, feature list, pricing (PulseFarm), testimonials, CTA
- [ ] Feature list mentions: batch management, FCR, price signal, WhatsApp log
- [ ] CTA fires `farm_hero_cta_click` with `segment: 'farm'`

---

## 6. FEATURES PAGE REQUIREMENTS

### FR-FEAT-001 — All Features Overview (`/features`)
**Priority:** P1

**Acceptance Criteria:**
- [ ] Sticky left nav (sidebar) listing 6 modules: Price Intelligence, Sell Intelligence, Farm Operations, Health & Biosecurity, Alerts, Integrations
- [ ] Each module section: heading, 3–4 feature cards with screenshot placeholders
- [ ] Feature cards: title, description, 1 benefit bullet, plan badge (Both / Enterprise)
- [ ] Comparison table at bottom vs "Manual/Spreadsheet" and "Generic ERP"
- [ ] Table includes all 7 gap-filling features as rows
- [ ] "57 features across 6 intelligence modules" headline (update count if different)

### FR-FEAT-002 — WhatsApp Log Automation Feature Page (`/features/whatsapp-log`)
**Priority:** P0 (Flagship — most marketing spend goes here)

**Acceptance Criteria:**
- [ ] Hero on WhatsApp-green gradient (#075E54 → #128C7E)
- [ ] 3-step animated walkthrough (see design spec)
- [ ] "What Farmers Actually Type" examples box: minimum 10 valid input variants shown
- [ ] "What Managers See" dashboard screenshot
- [ ] Compliance improvement stat: "42% → 97% log compliance"
- [ ] Technical details section (Meta WhatsApp Business API, NLP parser, audit log)
- [ ] Integration with GAP 3: mention medicine reporting via WhatsApp reply
- [ ] Pricing inclusion: included in PulsePro/Enterprise, add-on for PulseFarm
- [ ] This page gets `HowTo` structured data (JSON-LD)

### FR-FEAT-003 — Farm Management Feature Page (`/features/farm-management`)
**Priority:** P0

**Acceptance Criteria:**
- [ ] 7 subsections, each with screenshot and feature list:
  1. Batch Lifecycle Management
  2. FCR & Feed Efficiency
  3. Mortality Intelligence
  4. Weight & Growth Tracking
  5. Health & Vaccination
  6. **Inventory & Full Batch P&L (GAP 1)** — chick cost, medicine, labour, overhead
  7. FSSAI Traceability
- [ ] GAP 2 (Bird Lifting): dedicated subsection "Bird Lifting & Sales Management"
  - [ ] Feature list: sale event recording, partial harvest, buyer contacts, transport details
- [ ] GAP 3 (Medication): Health subsection expanded with medication tracking features
  - [ ] Withdrawal period alert, treatment journal, AB-Free cert
- [ ] GAP 4 (Environment): new subsection "Environment Monitoring"
  - [ ] Humidity, ammonia, light programme, ventilation features listed
- [ ] GAP 5 (Benchmarking): "Breed-Matched Network Benchmarking" subsection
- [ ] GAP 6 (Calamity): "Farm-Level Disease Risk Score" subsection
- [ ] GAP 7 (Documents): "Batch Document Library" subsection
  - [ ] Upload types, search, preview, FSSAI integration
- [ ] Comparison table: FlockIQ vs Poultry.care vs PoultryPlan vs Spreadsheet (10+ rows)
- [ ] Screenshots: accurate dashboard mockups (not "Product Screenshot" placeholders)

### FR-FEAT-004 — Price Intelligence Feature Page (`/features/price-intel`)
**Priority:** P1

**Acceptance Criteria:**
- [ ] Positioned as secondary feature (not lead product)
- [ ] Feature list: 7-day forecast, sell signal, historical accuracy, middleman check
- [ ] Accuracy call-out: "96.2% directional accuracy — verified on 847 predictions"
- [ ] Link to /accuracy for full details
- [ ] Coverage map: India districts + SE Asia

---

## 7. PRICING PAGE REQUIREMENTS

### FR-PRICING-001 — Hero & Plan Cards
**Priority:** P0

**Acceptance Criteria:**
- [ ] Headline: "Invest ₹2,000/Month. Save ₹1.8L/Year."
- [ ] Annual/monthly toggle: annual default (saves 2 months free)
- [ ] Toggle switch animated (CSS transition, 200ms)
- [ ] 3 plan cards: PulseFarm, PulsePro (featured — dark card), Enterprise
- [ ] PulseFarm: ₹2,000/month annual | ₹2,500/month monthly
- [ ] PulsePro: ₹5,000/month annual | ₹6,000/month monthly
- [ ] Enterprise: "Custom — Talk to Sales"
- [ ] "Most Popular" badge on PulsePro (brand400 background, white text)
- [ ] Feature lists: exactly as specified in design doc
- [ ] CTA per plan: primary button, fires analytics with plan + billing_cycle

### FR-PRICING-002 — ROI Anchor Section
**Priority:** P0

**Acceptance Criteria:**
- [ ] ROI calculation shown ABOVE the plan cards
- [ ] Text: "Based on 500+ farms: average annual savings of ₹1.8 lakh."
- [ ] Text: "FlockIQ pays for itself in the first batch."
- [ ] Interactive slider: 10K–200K birds (range input, styled)
- [ ] Outputs: Potential annual loss | Plan cost | Net benefit | ROI ratio (5.25×)
- [ ] All currency formatted as Indian rupees with lakh notation

### FR-PRICING-003 — Full Feature Comparison Table
**Priority:** P1

**Acceptance Criteria:**
- [ ] Table wrapped in collapsible section ("Compare all features ↓" toggle)
- [ ] Rows grouped by category: Price Intelligence | Sell Intelligence | Farm Operations | Health & Biosecurity | Alerts | Integrations | Support
- [ ] All 7 gap-filling features included as rows:
  - [ ] Full Batch P&L (all cost types)
  - [ ] Bird Lifting / Sales Management
  - [ ] Medication & Withdrawal Tracking
  - [ ] Environment Monitoring (humidity, ammonia)
  - [ ] Breed-Matched Benchmarking
  - [ ] Per-Farm Calamity Risk Score
  - [ ] Batch Document Library
- [ ] ✓ / ✗ icons with colour (green check, red cross)
- [ ] Plan column headers sticky on scroll within table
- [ ] Mobile: horizontal scroll with sticky first column (feature name)

### FR-PRICING-004 — FAQ (Pricing-Specific)
**Priority:** P1

**Acceptance Criteria:**
- [ ] 8 questions in accordion format
- [ ] Questions: free trial terms, credit card, upgrade/downgrade, billing, cancellation, data security, refund policy, enterprise custom pricing
- [ ] Each item: `aria-expanded`, `aria-controls`, `id` pairing
- [ ] Keyboard: Enter/Space toggle, arrow keys navigate
- [ ] `FAQPage` JSON-LD schema injected in `<head>`
- [ ] All answers indexable (server-rendered — no client-only rendering)

---

## 8. ACCURACY PAGE REQUIREMENTS

### FR-ACC-001 — Live Metrics Hero
**Priority:** P0

**Acceptance Criteria:**
- [ ] 4 live KPI tiles: Directional Accuracy | MAPE | Conformal Coverage | Predictions Verified
- [ ] All values fetched from Supabase `mv_accuracy_dashboard` (ISR 600s)
- [ ] "Updated daily — last: [timestamp]" shown below tiles
- [ ] Tiles show "—" (dash) not "NaN" when data unavailable
- [ ] Accuracy Gate indicator: green ≥95%, amber 90–95%, red <90%
- [ ] If accuracy < 95%: banner "Model under revalidation — predictions paused"

### FR-ACC-002 — 30-Day MAPE Trend Chart
**Priority:** P0

**Acceptance Criteria:**
- [ ] Recharts AreaChart, 30 days of data
- [ ] Y-axis: MAPE % (0–15%, with green zone shaded below 6%)
- [ ] Green zone: fill area between 0% and 6% (target)
- [ ] Actual MAPE line: brand700 solid
- [ ] Chart has `aria-label` describing chart purpose
- [ ] "View as table" toggle: shows same data as accessible HTML table
- [ ] Chart never renders blank (shows last available data with staleness notice)

### FR-ACC-003 — Prediction History Table
**Priority:** P0

**Acceptance Criteria:**
- [ ] Columns: Date | District | Predicted P50 | Actual Price | Error% | Direction ✓/✗ | Within Range?
- [ ] Error% column: green <5%, amber 5–9%, red ≥9%
- [ ] Direction column: ✓ (green) or ✗ (red)
- [ ] Filterable by: District (dropdown), Date range (30/60/90 days), Direction (correct/incorrect)
- [ ] Pagination: 25 rows per page, client-side
- [ ] Data sorted newest first by default
- [ ] CSV export button
- [ ] Empty state: "No predictions in selected range" with illustration

### FR-ACC-004 — Methodology & Transparency Section
**Priority:** P1

**Acceptance Criteria:**
- [ ] 5 accordion items: What is MAPE? | Directional accuracy? | Data sources? | Model retrain frequency? | Conformal prediction intervals?
- [ ] Feature Importance chart (top 5 SHAP features) — horizontal bar chart (Recharts)
- [ ] Stress Test Results: shows HPAI Nov 2025 performance
- [ ] Manual Validation Attestation card: 10-day APMC visit story
- [ ] Accuracy Guarantee box: "If accuracy drops below 95%, get that month free — automatically"
- [ ] 3 expert endorsement cards with name, title, institution

---

## 9. GAP-FILLING FEATURE REQUIREMENTS (All 7 Competitive Gaps)

### FR-GAP-001 — Batch P&L Full Cost Tracking
**Priority:** P0

**Pre-login website requirements:**
- [ ] `/features/farm-management`: "Batch P&L & Cost Tracking" subsection with feature list
- [ ] `/pricing`: "Full Batch P&L (all cost types)" row in comparison table (PulseFarm ✓ | PulsePro ✓ | Enterprise ✓)
- [ ] Homepage: `✓ Full batch P&L — chick cost, feed, medicine, labour` in Block 1 feature bullets

**Dashboard requirements (for engineer reference):**
- [ ] Farm Detail page → new "P&L" tab
- [ ] P&L tab: Batch Cost Journal with rows: DOC cost, feed (auto-linked from feed log), medicine (linked from medication log), labour (manual entry), overhead (manual)
- [ ] Live cost-per-bird: auto-calculated, shown as badge on farm card
- [ ] Batch close screen: shows full P&L summary before locking
- [ ] Export P&L: PDF or CSV

### FR-GAP-002 — Bird Lifting / Sales Management
**Priority:** P0

**Pre-login website requirements:**
- [ ] `/features/farm-management`: "Bird Lifting & Sales Management" subsection
- [ ] `/solutions/integrators`: Harvest Queue section mentions lifting management
- [ ] `/pricing`: "Bird Lifting & Sales Recording" row in comparison table

**Dashboard requirements:**
- [ ] Farm Detail → Batch tab → "Record Sale / Lift" button
- [ ] Sale event form: date, birds sold, live weight (total + per bird), price/kg, buyer name, transport details
- [ ] Partial harvest: form supports multiple lift events per batch
- [ ] Buyer/trader contacts: dropdown with option to add new (persists across batches)
- [ ] Final lift triggers batch-close confirmation: "Is this the final lift for this batch?"
- [ ] Actual vs estimated weight comparison shown after each lift

### FR-GAP-003 — Medication & Treatment Tracking with Withdrawal Period
**Priority:** P0

**Pre-login website requirements:**
- [ ] `/features/farm-management`: Health subsection expanded (full medication feature list)
- [ ] `/features/whatsapp-log`: WhatsApp medicine reporting instructions
- [ ] Compliance page: FSSAI section links to medication tracking

**Dashboard requirements:**
- [ ] Farm Detail → Health tab → "Treatments" sub-tab (new)
- [ ] Add Treatment form: medicine name, brand, batch#, dosage, route (water/injection/feed), Day-start to Day-end
- [ ] Auto-calculate withdrawal period end date (from product database or manual entry)
- [ ] ⚠ Alert on harvest screen if any active withdrawal period has not cleared
- [ ] AB-Free badge: auto-applied when batch has zero antibiotic records
- [ ] Treatment cost: optional field, flows into Batch P&L
- [ ] WhatsApp reply parser accepts: "MEDICINE [name] [dosage] Day-[X] to Day-[Y]"

### FR-GAP-004 — Environment Data Tracking
**Priority:** P1

**Pre-login website requirements:**
- [ ] `/features/farm-management`: "Environment Monitoring" subsection
- [ ] `/solutions/farms`: mention humidity/ammonia as leading disease indicators

**Dashboard requirements:**
- [ ] Daily log form: add fields: Humidity % (range 40–100), Ammonia ppm (range 0–100), Light hours/day, Ventilation setting
- [ ] Environment Score card on Farm Detail overview (composite score 1–10)
- [ ] Alert rules: Humidity >70% → "Respiratory disease risk elevated" | Ammonia >25ppm → "Ventilation action required"
- [ ] Environment trend chart: 7-day sparkline on Farm Detail
- [ ] IoT sensor integration (PulseEnterprise): auto-populate fields from sensor API
- [ ] Environment vs FCR correlation section on Portfolio Metrics page

### FR-GAP-005 — Breed-Matched Flock Benchmarking
**Priority:** P1

**Pre-login website requirements:**
- [ ] `/features/farm-management`: "Breed-Matched Network Benchmarking" subsection
- [ ] `/solutions/integrators`: "Cross-Farm Performance Intelligence" section

**Dashboard requirements:**
- [ ] Portfolio Metrics → new "Benchmark" tab
- [ ] Filters: Breed (Cobb 430 / Ross 308 / Hubbard Flex / Arbor Acres), Region (UP / India / Global), Batch Size range
- [ ] Metrics compared: FCR, Mortality %, Daily Gain, Harvest Age, Cost/kg
- [ ] Percentile bars: shows user's position (e.g., "Top 23%") vs filtered peer group
- [ ] Trend comparison: historical percentile rank over last 6 batches
- [ ] Privacy: no individual farm names shown in benchmark — only aggregates
- [ ] Minimum 10 farms required in filter group before benchmark is shown (privacy threshold)

### FR-GAP-006 — Per-Farm Calamity Risk Score
**Priority:** P1

**Pre-login website requirements:**
- [ ] `/features/farm-management`: "Farm-Level Disease Risk Intelligence" section
- [ ] `/free-disease-alerts`: upgrade page to show plan comparison for risk score tiers
- [ ] Homepage Pain Section: HPAI card updated to mention per-farm risk scoring

**Dashboard requirements:**
- [ ] Alerts page → Disease Alerts tab → per-farm risk score column in active alerts
- [ ] Risk score (1–10) shown as coloured badge on farm card when disease alert is active
- [ ] Risk score factors: distance to outbreak, flock age, vaccination status, biosecurity score, wind direction
- [ ] Biosecurity score: collected via fortnightly Biosecurity Audit checklist (GAP 4 from existing design)
- [ ] Farm detail: shows risk score badge in header when alert is active
- [ ] Risk score 7+: trigger "Pre-sell recommendation" — shows harvest decision helper
- [ ] Integrator view: risk heatmap on farm portfolio map (bubble map coloured by risk score)

### FR-GAP-007 — Batch Document Library
**Priority:** P1

**Pre-login website requirements:**
- [ ] `/features/farm-management`: "Batch Document Library" subsection
- [ ] `/solutions/integrators`: "Audit-Ready in 30 Seconds" section
- [ ] `/features/farm-management`: FSSAI section mentions documents auto-included in traceability report

**Dashboard requirements:**
- [ ] Farm Detail → Batch tab → "Documents" sub-tab
- [ ] Upload button: accepts PDF, JPG, PNG (max 10MB/file, max 20 files/batch)
- [ ] Category selector: DOC Invoice | Lab Report | Vaccination Certificate | Movement Permit | Buyer Invoice | Other
- [ ] Document list: filename, category, upload date, uploader, file size
- [ ] Preview: in-app PDF preview (react-pdf) and image preview
- [ ] Search: full-text search across all documents by filename, category, batch
- [ ] Share: secure link generation (24h expiry, view-only)
- [ ] FSSAI export: documents in relevant categories auto-included in traceability PDF
- [ ] Storage quotas: 5GB per integrator, 1GB per farm account
- [ ] DPDP-compliant: AWS Mumbai, encrypted at rest, access log per document

---

## 10. AUTHENTICATION REQUIREMENTS

### FR-AUTH-001 — Login Page (`/login`)
**Priority:** P0

**Acceptance Criteria:**
- [ ] Split-screen layout: brand left panel (hero gradient) + white right panel (form)
- [ ] Left panel: rotating testimonial quotes (3 quotes, 5s interval, fade transition)
- [ ] Left panel: trust badges (DPDP, SSL, AWS Mumbai)
- [ ] Two login methods: Phone OTP + Email/Password (tabs)
- [ ] Phone OTP tab: country selector dropdown (India default) + 10-digit input
- [ ] Country selector supports: India, Indonesia, Vietnam, Thailand, Other
- [ ] [Send OTP →] button: calls `/api/auth/send-otp`
- [ ] OTP input: 6-box auto-advance (pressing digit moves to next box)
- [ ] OTP timer: 2-minute countdown, resend link active after 60s
- [ ] Resend limit: 3 per session; lockout 10 minutes after 3 failures
- [ ] Email tab: email input + password input (show/hide toggle) + forgot password link
- [ ] Language selector: [हिंदी | English] pill within form — English selected by default, Hindi is opt-in
- [ ] "Don't have an account?" link to `/signup`
- [ ] All API calls include CSRF token header
- [ ] Login fires `login_success` analytics event with `method: 'otp'|'email'`

### FR-AUTH-002 — Signup / Onboarding Flow (`/signup` → `/onboarding`)
**Priority:** P0

**Acceptance Criteria:**
- [ ] 4-step wizard on dark green background, white card (max-width 540px)
- [ ] Progress bar: brand400, fills per step (0%, 25%, 50%, 75%, 100% on completion)
- [ ] "Step N of 4" indicator top-right of card

**Step 1 — Welcome + Phone:**
- [ ] Country flag + code selector (same as login, supports 5 countries)
- [ ] Email optional field: saves for email alert delivery
- [ ] "Send me updates" checkbox: unchecked by default (DPDP consent)
- [ ] "What happens next" timeline visible: Today setup | Tomorrow 4:30AM data | 6AM prediction | 6:30AM signal
- [ ] CTA: "शुरू करें →"
- [ ] Fires `signup_step1_complete` event

**Step 2 — Plan Confirmation:**
- [ ] Shows PulseFarm plan (default) with 14-day free trial prominent
- [ ] Feature list (5 items)
- [ ] Reassurance text: "Switch plans anytime in Settings"
- [ ] REMOVE anxiety-inducing "plan lock" warning (UX regression)
- [ ] "After trial: ₹2,000/month or ₹5,000/month" — clear, not scary
- [ ] Back button works, no data loss
- [ ] Fires `signup_step2_complete` event

**Step 3 — WhatsApp Verification:**
- [ ] Shows user's WhatsApp number (from Step 1)
- [ ] [Test WhatsApp Message →] button: sends live test message via API
- [ ] Message arrives: shows "✓ Message received!" confirmation (polling /api/whatsapp/verify)
- [ ] WhatsApp message language selector: English default, Hindi opt-in per farm
- [ ] "Message नहीं मिला?" expandable → troubleshooting steps
- [ ] Back/forward preserves WhatsApp number
- [ ] Fires `signup_step3_complete` event

**Step 4 — Completion:**
- [ ] Celebratory animation: confetti burst (Framer Motion, 1.5s, canvas-based)
- [ ] Summary card: plan, district, signal time, WhatsApp number, trial end date
- [ ] 3 CTA buttons: [Go to Dashboard →] | [📱 Download App] | [Set Up WhatsApp Log →]
- [ ] [Set Up WhatsApp Log →]: prominently styled for integrators
- [ ] Referral section: "Share with a friend — both get ₹500 credit"
- [ ] Referral generates unique link, fires `referral_link_generated` event
- [ ] Fires `signup_complete` event with `{ plan, country, lang, has_whatsapp_verified }`

---

## 11. CONTENT PAGE REQUIREMENTS

### FR-BLOG-001 — Blog Index (`/blog`)
**Priority:** P1

**Acceptance Criteria:**
- [ ] Category filter tabs: All | Bhav Vichar | Kheti Gyan | Industry Intelligence | Product Updates
- [ ] Language filter: [English | हिंदी | Both] toggle (English first, English pre-selected)
- [ ] Search: client-side search on title + excerpt (Fuse.js), debounced 300ms
- [ ] Post cards: thumbnail (WebP, lazy), category label, title, excerpt (2 lines max), date, read time, WhatsApp share icon
- [ ] WhatsApp share: opens wa.me with pre-filled article title + URL
- [ ] Pagination: "Load More" button (not numbered — simpler for mobile)
- [ ] Newsletter signup section at bottom: email + consent checkbox
- [ ] RSS feed available at `/blog/rss.xml`

### FR-CASE-001 — Case Studies (`/case-studies`)
**Priority:** P1

**Acceptance Criteria:**
- [ ] 3 hero case study cards: Rajesh Yadav (₹1.24L), Suresh Kumar Patel (₹3.2L HPAI), Manoj Singh (₹68K first batch)
- [ ] Each card: category badge, title, summary, outcome badge, read time, author location
- [ ] Individual case study page `/case-studies/[slug]`: full story with metrics, timeline, screenshots
- [ ] Each case study: `Article` + `Review` structured data (JSON-LD)
- [ ] Sharing: WhatsApp share button on each case study

### FR-FAQ-001 — FAQ Page (`/faq`)
**Priority:** P1

**Acceptance Criteria:**
- [ ] Category tabs: Accuracy | Price | Technical | Privacy | Farm Management (NEW — covers gap features)
- [ ] "Farm Management" tab includes FAQs about:
  - [ ] WhatsApp log automation setup
  - [ ] Batch P&L cost entry
  - [ ] Medication withdrawal period alerts
  - [ ] Document upload limits
- [ ] FAQ search: filters items by keyword as user types (client-side)
- [ ] Each item: `aria-expanded`, `aria-controls`, keyboard navigable
- [ ] `FAQPage` JSON-LD schema covers all questions

### FR-CONTACT-001 — Contact Page (`/contact`)
**Priority:** P1

**Acceptance Criteria:**
- [ ] Contact form: name, email, phone, inquiry type (General / Sales/Demo / Partnership / Support), message
- [ ] Inquiry type: "Sales/Demo" routes to demo request flow (same as /demo)
- [ ] On submit: POST to `/api/contact`, rate-limited 3/hour/IP
- [ ] Success state: replaces form with confirmation + expected response time (24 hours)
- [ ] Contact info panel: address, phone, WhatsApp direct link, email, office hours
- [ ] Map placeholder: replaced by Google Maps embed (requires API key)
- [ ] Team avatars: initials only (no placeholder images)

---

## 12. SEO REQUIREMENTS

### FR-SEO-001 — Page Metadata Matrix (Updated for FlockIQ Global)

| Page | Title (≤60 chars) | Description (≤160 chars) | Canonical |
|------|-------------------|--------------------------|-----------|
| `/` | FlockIQ — Poultry Management Platform \| Global | The poultry management platform for integrators and farms. Batch tracking, WhatsApp log automation, price intelligence. 500+ farms across 15 countries. | `https://flockiq.com/` |
| `/solutions/integrators` | FlockIQ for Integrators — Manage 20 Farms from One Dashboard | Multi-farm dashboard, WhatsApp log automation, harvest queue, cross-farm FCR benchmarking. Free 14-day trial. | `https://flockiq.com/solutions/integrators` |
| `/solutions/farms` | FlockIQ for Farms — Complete Batch Management on Your Phone | Batch lifecycle, FCR tracking, price intelligence, HPAI alerts. For commercial poultry farms 10K–500K birds. | `https://flockiq.com/solutions/farms` |
| `/features/whatsapp-log` | WhatsApp Daily Log Automation — FlockIQ | Farmers reply on WhatsApp. Dashboard updates automatically. 97% log compliance. Zero calls. Zero spreadsheets. | `https://flockiq.com/features/whatsapp-log` |
| `/features/farm-management` | Poultry Farm Management Software — FlockIQ | Complete batch lifecycle, FCR analytics, mortality tracking, medication records, FSSAI traceability. Global + India. | `https://flockiq.com/features/farm-management` |
| `/pricing` | FlockIQ Pricing — From ₹2,000/month \| Start Free | PulseFarm ₹2,000/mo. PulsePro ₹5,000/mo. Enterprise custom. 14-day free trial, no credit card. | `https://flockiq.com/pricing` |
| `/accuracy` | 96.2% Directional Accuracy — FlockIQ Live Dashboard | Live model accuracy dashboard. 30-day MAPE, prediction history, methodology. Fully transparent. | `https://flockiq.com/accuracy` |
| `/about` | About FlockIQ — Built in Gorakhpur, Deployed Globally | From UP to Southeast Asia — our mission to give every poultry farmer the same tools as large processors. | `https://flockiq.com/about` |

### FR-SEO-002 — Keyword Strategy (Updated: Platform Focus)

**Primary Cluster: Farm Management (new primary)**

| Keyword | Volume | Difficulty | Intent |
|---------|--------|------------|--------|
| poultry farm management software India | 400–800 | High | Commercial |
| broiler batch management software | 200–400 | Medium | Commercial |
| poultry FCR tracking software | 150–300 | Low | Commercial |
| integrator poultry management system | 100–250 | Low | Commercial |
| FSSAI poultry traceability software | 100–200 | Low | Commercial |
| WhatsApp poultry farm management | 50–150 | Very Low | Commercial |

**Secondary Cluster: Price Intelligence (kept)**

| Keyword | Volume | Difficulty | Intent |
|---------|--------|------------|--------|
| गोरखपुर मुर्गी भाव आज | 1,200–2,000 | Low | Transactional |
| broiler price prediction India | 300–600 | Medium | Informational |
| poultry price forecast AI | 100–300 | Low | Commercial |

**Global Cluster (new)**

| Keyword | Volume | Difficulty | Intent |
|---------|--------|------------|--------|
| broiler management software | 500–1,000 | High | Commercial |
| poultry management platform | 300–600 | High | Commercial |
| poultry farm software Indonesia | 200–400 | Low | Commercial |
| chicken farm management app | 300–600 | Medium | Commercial |

### FR-SEO-003 — Structured Data Requirements

- [ ] Homepage: `Organization` + `WebSite` + `SearchAction`
- [ ] Features pages: `SoftwareApplication` schema
- [ ] `/features/whatsapp-log`: `HowTo` schema (3 steps)
- [ ] `/features/farm-management`: `SoftwareApplication` + `ItemList` (features list)
- [ ] Pricing: `Product` schema for each plan
- [ ] Blog posts: `Article` + `BlogPosting` schema
- [ ] Case studies: `Article` + `Review` schema
- [ ] FAQ pages: `FAQPage` schema
- [ ] Location pages: `LocalBusiness` + `Place` schema
- [ ] About page: `Organization` + `AboutPage`
- [ ] All structured data: injected via Next.js `metadata` API, validated against schema.org

### FR-SEO-004 — Technical SEO

- [ ] `robots.txt`: allows all major AI crawlers (GPTBot, Claude-Web, PerplexityBot, Googlebot)
- [ ] `sitemap.xml`: auto-generated, updated on each deploy + ISR revalidation
- [ ] All pages: `hreflang` tags for `hi-IN` and `en` (where content differs)
- [ ] Core Web Vitals: LCP <3s, CLS <0.1, FID <100ms
- [ ] All images: WebP + AVIF format, `srcset` with 400w/800w/1200w
- [ ] All images: explicit `width` + `height` attributes to prevent layout shift
- [ ] Canonical tags: self-referencing canonical on all pages
- [ ] No duplicate content: `noindex` on `/login`, `/signup`, `/onboarding`, `/dashboard/**`
- [ ] Structured data validation: pass Google Rich Results Test before launch

---

## 13. PERFORMANCE REQUIREMENTS

### NFR-PERF-001 — Core Web Vitals Targets

| Metric | Target | Critical Threshold |
|--------|--------|--------------------|
| LCP | ≤ 2.5s (4G) | Fail if > 4s |
| CLS | ≤ 0.05 | Fail if > 0.1 |
| FID / INP | ≤ 100ms | Fail if > 200ms |
| FCP | ≤ 1.5s | — |
| TTFB | ≤ 800ms | — |
| Lighthouse Performance | ≥ 85 | Fail if < 70 |

### NFR-PERF-002 — Asset Optimisation

- [ ] All images: WebP format, AVIF preferred, JPEG fallback
- [ ] Hero image / gradient: CSS only (no image asset)
- [ ] All product screenshots: WebP, `loading="lazy"` for below-fold
- [ ] Font loading: `font-display: optional` for Sora and Plus Jakarta Sans
- [ ] Noto Sans Devanagari: loaded only when Hindi mode active (dynamic import)
- [ ] Framer Motion: code-split, only loaded on pages that use it
- [ ] Recharts: code-split per chart component
- [ ] Total JS bundle (first load): < 150KB gzipped
- [ ] Critical CSS: inlined in `<head>` (Tailwind purge removes unused)

### NFR-PERF-003 — Caching Strategy

| Content Type | Cache Strategy |
|--------------|---------------|
| Static pages (HTML) | ISR, revalidate: 3600s |
| Accuracy metrics | ISR, revalidate: 600s |
| Customer count | ISR, revalidate: 300s |
| Blog posts | ISR, revalidate: 1800s |
| Case studies | ISR, revalidate: 3600s |
| API routes | CDN cache: 60s |
| Images (static) | 1 year, immutable |
| Fonts | 1 year, immutable |

---

## 14. ACCESSIBILITY REQUIREMENTS

### NFR-A11Y-001 — WCAG 2.1 AA Compliance

- [ ] All text: minimum 4.5:1 contrast ratio against background
- [ ] All interactive elements: 3px visible focus outline in brand400 on `focus-visible`
- [ ] Minimum touch targets: 44×44px on all mobile interactive elements
- [ ] Skip to main content link: visible on focus, top of page
- [ ] All images: meaningful `alt` text (not "image" or filename)
- [ ] All charts: "View as table" accessible alternative
- [ ] All forms: `<label>` associated with every input (not placeholder-only)
- [ ] All form errors: `aria-live="assertive"` announcements
- [ ] All modals/overlays: focus trap + `aria-modal="true"` + `role="dialog"`
- [ ] Page language: `<html lang="hi">` or `<html lang="en">` correct per active language
- [ ] Hindi text blocks: `lang="hi"` attribute on container elements

### NFR-A11Y-002 — Reduced Motion

- [ ] `@media (prefers-reduced-motion: reduce)`: all animations → `duration: 1ms` (instant)
- [ ] Counter animations: skip to final value immediately
- [ ] Phone mockup float: disabled
- [ ] Carousel/auto-advance: paused (keyboard-only navigation instead)
- [ ] Page transitions: instant

---

## 15. ANALYTICS REQUIREMENTS

### FR-ANALYTICS-001 — Events Matrix

| Event Name | Trigger | Properties |
|------------|---------|------------|
| `pageview` | Every page load | `{ page, lang, country, device, referrer }` |
| `announcement_bar_click` | Bar CTA clicked | `{ variant, destination }` |
| `nav_click` | Nav link clicked | `{ label, destination }` |
| `nav_trial_click` | "Start Free Trial" in nav | `{ page, lang }` |
| `hero_cta_click` | Primary hero CTA | `{ page, lang, device }` |
| `hero_demo_click` | Demo CTA | `{ page }` |
| `loss_calculator_interact` | Slider moved | `{ birds, calculated_loss }` |
| `pricing_tab_toggle` | Monthly/Annual switch | `{ selection }` |
| `plan_cta_click` | Pricing card CTA | `{ plan, billing_cycle, page }` |
| `whatsapp_feature_cta_click` | WhatsApp feature CTA | `{ page, section }` |
| `signup_step1_complete` | Step 1 done | `{ country, has_email }` |
| `signup_step2_complete` | Step 2 done | `{ plan }` |
| `signup_step3_complete` | WA verified | `{ verified: true/false }` |
| `signup_complete` | Full signup done | `{ plan, country, lang }` |
| `login_success` | Login completed | `{ method: 'otp'/'email' }` |
| `referral_link_generated` | Referral created | `{ step: 4 }` |
| `faq_item_open` | FAQ accordion open | `{ question_id, page }` |
| `exit_intent_shown` | Exit popup triggers | `{}` |
| `exit_intent_submit` | Popup form submitted | `{ has_phone: true }` |

### FR-ANALYTICS-002 — Tool Setup

- [ ] Analytics provider: PostHog (self-hosted or cloud) — preferred over GA4 for DPDP compliance
- [ ] Alternative: Plausible (simpler, GDPR/DPDP cookie-free by default)
- [ ] UTM parameters: captured on all inbound links, stored in session
- [ ] UTM passthrough: persisted to `/signup?utm_source=...` for attribution
- [ ] DPDP compliance: no PII in event properties (no names, emails, phone numbers)
- [ ] India users: consent banner not required for analytics if using privacy-first tool (Plausible)

---

## 16. LEGAL & COMPLIANCE REQUIREMENTS

### FR-LEGAL-001 — DPDP Act 2023 Compliance

- [ ] Privacy Policy page: all 10 sections from design spec (English only at launch; Hindi version P3)
- [ ] Terms of Service page: all 13 sections (English only at launch; Hindi version P3)
- [ ] Refund Policy page: all 9 sections (English only at launch; Hindi version P3)
- [ ] Compliance page: DPDP statement, FSSAI info, HACCP info
- [ ] All forms with personal data: explicit consent checkbox (unchecked by default)
- [ ] Consent language: "I agree to receive WhatsApp messages from FlockIQ. Data used only for price alerts as per DPDP Act 2023."
- [ ] Data stored: AWS Mumbai (ap-south-1)
- [ ] Data deletion: account deletion removes all PII within 30 days
- [ ] Right to erasure: accessible from Settings → Data & Privacy

### FR-LEGAL-002 — WhatsApp Compliance

- [ ] All outbound WhatsApp messages use approved Message Templates (Meta Business API)
- [ ] Template approval obtained before launch
- [ ] STOP command: any WhatsApp reply of "STOP" pauses all messages for that number
- [ ] Opt-in confirmation: first WhatsApp message after signup confirms subscription
- [ ] No promotional messages without explicit opt-in (different from operational messages)

---

*End of FlockIQ Pre-Login Website Requirements Master v3.0*
*Companion documents:*
*  - FlockIQ_PreLogin_Design_Master_v3.md*
*  - FlockIQ_PreLogin_Tasks_v3.md*

---

## 17. REMAINING PAGE REQUIREMENTS

### FR-FEAT-005 — All Features Overview Page (`/features`)
**Priority:** 🟡 P1 | **Complexity:** M

**Acceptance Criteria:**
- [ ] Sticky left sidebar nav (desktop ≥1024px): lists all 6 module categories
- [ ] Active module highlighted in sidebar as user scrolls (IntersectionObserver)
- [ ] Mobile: horizontal scrollable tab bar replaces sidebar
- [ ] Each module section: eyebrow, title, 3–4 feature cards in a grid
- [ ] Feature cards: icon, title, description, one benefit bullet, plan badge (Both/PulsePro/Enterprise)
- [ ] NEW badge shown on all 7 gap-filling features
- [ ] Comparison table at bottom: FlockIQ vs Manual/Spreadsheet vs Generic ERP
- [ ] Table is collapsible on mobile ("See full comparison ↓")
- [ ] "57 features across 6 intelligence modules" stat is accurate (update count if changed)
- [ ] Page has `SoftwareApplication` JSON-LD with full feature set listed

### FR-FEAT-006 — Sticky Sidebar Jump-Links
**Priority:** 🟡 P1 | **Complexity:** S

**Acceptance Criteria:**
- [ ] Sidebar uses `position: sticky; top: 92px` (nav height + offset)
- [ ] Active section detection: IntersectionObserver on each `<section id="...">` heading
- [ ] Threshold: section is "active" when its top edge crosses 30% from top of viewport
- [ ] Click: scrolls to section with `behavior: 'smooth'`, offset for sticky nav height
- [ ] Keyboard: sidebar links are standard `<a href="#section-id">` — Tab-navigable
- [ ] Mobile (< 1024px): horizontal scroll tab bar, `position: sticky; top: 72px`
- [ ] Mobile active tab scrolls into view automatically when section changes

### FR-ENTERPRISE-001 — Enterprise Page (`/enterprise`)
**Priority:** 🟡 P1 | **Complexity:** M

**Acceptance Criteria:**
- [ ] 5 segment cards: Integrators (S2), QSR Chains (S3), Insurers (S4), Feed Companies (S5), Data Platforms (S6)
- [ ] Each segment card: icon, title, subtitle (bird count/context), 3 feature bullets, pricing note
- [ ] Enterprise features strip: REST API | Historical Data | Custom Coverage | Dedicated Manager
- [ ] SLA strip: 99.9% Uptime | <100ms API | 24/7 Support
- [ ] Contact Sales form: all fields required except message; POST to `/api/demo-requests?segment=enterprise`
- [ ] Form success state: confirmation card with expected response time (2 business hours)
- [ ] Form fires `enterprise_contact_submit` analytics event with `{ segment, company_size }`
- [ ] `Organization` + enterprise-focused `SoftwareApplication` structured data

### FR-LOCATIONS-001 — All Locations Index (`/locations`)
**Priority:** 🟡 P1 | **Complexity:** S

**Acceptance Criteria:**
- [ ] Two sections: "Available Now" (5 districts) and "Coming Soon" (8 districts)
- [ ] Available cards: district name (Hindi + English), state, price range, farm count, "View →" link
- [ ] Coming Soon cards: district name, state, farm count, "Notify me →" button
- [ ] "Notify me": captures phone/email for waitlist → POST `/api/waitlist`
- [ ] "How Location-Based Intelligence Works" — 3-step explainer below cards
- [ ] Page has `LocalBusiness` schema for each covered location (as JSON-LD array)

### FR-LOCATIONS-002 — Individual Location Pages (`/locations/[slug]`)
**Priority:** 🟡 P1 | **Complexity:** L

**Acceptance Criteria:**
- [ ] Dynamic metadata: title + description include live price from Supabase
- [ ] Live price widget: ISR revalidate 60 seconds; shows loading skeleton on first render
- [ ] Price widget: today's price, 7-day history, 7-day forecast (P10/P50/P90)
- [ ] Price widget: "Updated: 11:09 AM" timestamp shown
- [ ] Market profile: farmer count, mandi names, accuracy stat
- [ ] Local testimonials: 2 farmers from this specific district
- [ ] FAQ: 3 district-specific questions using `FAQPage` structured data
- [ ] Nearby districts strip: 4 closest districts with km distance, links to their location pages
- [ ] Bilingual: English headings default; Hindi heading shown as subtitle below when toggle active
- [ ] `generateStaticParams`: all 5 current districts pre-generated at build time
- [ ] ISR revalidate: 3600 seconds for most content, 60 seconds for live price widget

### FR-LOSS-CALC-001 — Loss Calculator Page (`/loss-calculator`)
**Priority:** 🟡 P1 | **Complexity:** S

**Acceptance Criteria:**
- [ ] Full-page version of the homepage loss calculator widget
- [ ] 3 inputs: flock size (slider 10K–200K), current price (manual, default ₹165), timing error ₹/kg (default ₹2.5)
- [ ] Output card: annual timing loss in Indian currency format (₹X लाख)
- [ ] Output shown immediately on input change (no submit button needed)
- [ ] Formula shown below output: "Flock size × timing error × batches per year = annual loss"
- [ ] CTA below result: "Stop This Loss — 14-Day Free Trial" → /signup
- [ ] Secondary CTA: "WhatsApp Demo (Free)" → /try-whatsapp
- [ ] Page URL shared via WhatsApp button → pre-filled "आपका टाइमिंग लॉस calculate करें: flockiq.com/loss-calculator"
- [ ] `HowTo` structured data explaining how timing loss is calculated

### FR-WHATSAPP-DEMO-001 — WhatsApp Demo Page (`/try-whatsapp`)
**Priority:** 🔴 P0 | **Complexity:** M

**Acceptance Criteria:**
- [ ] Form: WhatsApp number (10 digits) + district dropdown
- [ ] Consent checkbox: "I agree to receive a demo WhatsApp message from FlockIQ" (must be checked)
- [ ] [Send Free Signal →] button: POST to `/api/whatsapp/send-demo`
- [ ] Rate limit: 1 demo per phone number per 24 hours (server-side)
- [ ] Demo message: sends a real-format sell signal for selected district (uses latest forecast)
- [ ] Success state: "✓ Check your WhatsApp! Demo sent to +91-XXXXX" (shows last 5 digits)
- [ ] "What you'll receive" section: shows exact format of the WhatsApp message
- [ ] Below form: "Like what you see? Start 14-day free trial →"
- [ ] Conversion tracked: `whatsapp_demo_sent` analytics event with `{ district }`
- [ ] Slot counter: "X free demos remaining today" (shows genuine scarcity from DB count)

### FR-DEMO-001 — Book Demo Page (`/demo`)
**Priority:** 🟡 P1 | **Complexity:** M

**Acceptance Criteria:**
- [ ] Form fields: Name, Company/Farm, WhatsApp, Segment (dropdown), Flock Size (dropdown), Message (optional)
- [ ] Segment options: Individual Farm | Integrator (2–10 farms) | Integrator (10+ farms) | Feed Company | QSR Chain | Other
- [ ] Flock Size options: 10K–25K | 25K–50K | 50K–100K | 100K–500K | 500K+
- [ ] Language toggle: form labels switch between Hindi/English
- [ ] Form success: shows summary card "Your demo has been requested — we'll WhatsApp you within 2 hours"
- [ ] Summary includes: plan selected (based on segment + flock size), what they'll see in demo
- [ ] "150+ Farms Trust Us" social proof panel (right side on desktop)
- [ ] Rating: "4.9/5 from 150+ reviews" with star icons
- [ ] "What you will see in the demo" checklist: 5 bullets
- [ ] Testimonial quote card: R.Y., Gorakhpur, 25K bird farm
- [ ] POST to `/api/demo-requests` → also sends team notification to Slack/WhatsApp
- [ ] `?segment=integrator` pre-selects Integrator option in segment dropdown

### FR-DISEASE-ALERTS-001 — Free Disease Alerts Page (`/free-disease-alerts`)
**Priority:** 🟡 P1 | **Complexity:** M

**Acceptance Criteria:**
- [ ] Value prop update: "Your Farm's Disease Risk Score — Not Just a District Alert"
- [ ] Three-tier comparison:
  - Free: District-level HPAI alert (48hr early)
  - PulseFarm: Farm-level risk score + biosecurity recommendations
  - PulsePro: Risk score across all farms + harvest decision integration
- [ ] Form: phone number + district + referral code (optional)
- [ ] Consent checkbox: DPDP-compliant (unchecked by default)
- [ ] [Subscribe Free →] button → POST `/api/disease-alerts/subscribe`
- [ ] Max 23 free subscriptions per month (scarcity badge shown, decrements live from Supabase)
- [ ] Slot counter: "23 left this month" — fetched from Supabase (ISR 300s)
- [ ] Success: confirmation card + instructions to save FlockIQ number on WhatsApp
- [ ] "Why disease alerts matter" callout: ₹3–5 lakh risk per HPAI outbreak
- [ ] Upgrade prompt below form: "Get farm-level risk score → Start Free Trial"

### FR-GLOSSARY-001 — Glossary Page (`/glossary`)
**Priority:** 🟢 P2 | **Complexity:** M

**Acceptance Criteria:**
- [ ] Category filter tabs: All | Production | Disease | Price | Business | Technology
- [ ] Term cards: term name (English), term name (Hindi), category badge, short definition (2 sentences)
- [ ] "Read Full Definition →" link on each card (for future individual term pages)
- [ ] Alphabetical anchor navigation: A–Z buttons at top, jumps to first term starting with that letter
- [ ] Search: client-side, Fuse.js, searches English + Hindi term names and definitions
- [ ] "Popular Terms" strip: 6 most-searched terms shown in sidebar (desktop)
- [ ] All terms have `id` attributes for direct linking: `/glossary#fcr`
- [ ] `DefinedTerm` structured data for each term (enhances Google Knowledge Panel)
- [ ] "Why Understanding These Terms Matters" section: 3 benefit cards (Better Decisions, Track Performance, Protect Flock)
- [ ] Adding more terms: managed via `/content/glossary.json` (not DB — static data)

---

## 18. COMPONENT LIBRARY REQUIREMENTS

### FR-COMP-001 — Eyebrow Component
**Priority:** 🔴 P0 | **Complexity:** XS

**Acceptance Criteria:**
- [ ] `<Eyebrow text="SOLUTION" />` renders: small caps, 11px, brand700, brand50 bg, pill shape, brand100 border
- [ ] Optional `icon` prop: renders icon before text
- [ ] Spacing above: 0 (caller controls via margin/gap)
- [ ] Does NOT include a bottom margin (prevents double-spacing with heading below)

### FR-COMP-002 — Section Wrapper Component
**Priority:** 🔴 P0 | **Complexity:** XS

**Acceptance Criteria:**
- [ ] `<Section bg="white|neutral|brand|dark">` applies correct background token
- [ ] Vertical padding: `py-[clamp(5rem,8vw,9rem)]` for large sections, `py-[clamp(3rem,5vw,5rem)]` for small
- [ ] `<SectionContainer>` inside: max-width 1280px, centered, side padding via Tailwind
- [ ] `as` prop for semantic HTML: default `<section>`, can be `<div>` or `<article>`
- [ ] `aria-labelledby` prop: wires to section heading `id`

### FR-COMP-003 — Feature Bullet List
**Priority:** 🔴 P0 | **Complexity:** XS

**Acceptance Criteria:**
- [ ] `<FeatureList items={string[]} />` renders checklist with brand700 check icons
- [ ] Each item: `✓` icon (brand400, 16px) + text (neutral700, 15px)
- [ ] Gap between items: 10px
- [ ] NEW items: `<FeatureList items={...} newItems={['Bird Lifting & Sales']} />` renders brand400 "NEW" badge after item text
- [ ] Max items before "See all features →" link: configurable prop (default unlimited)

### FR-COMP-004 — Plan Badge Component
**Priority:** 🔴 P0 | **Complexity:** XS

**Acceptance Criteria:**
- [ ] `<PlanBadge plan="Both" />` renders: green pill "Both plans"
- [ ] `<PlanBadge plan="PulsePro" />` renders: darker green pill "PulsePro+"
- [ ] `<PlanBadge plan="Enterprise" />` renders: neutral pill "Enterprise"
- [ ] Used in feature cards to indicate which plans include the feature

### FR-COMP-005 — WhatsApp Chat Mockup Component
**Priority:** 🟡 P1 | **Complexity:** M

**Acceptance Criteria:**
- [ ] `<WhatsAppChatMockup messages={[...]} />` renders a realistic WhatsApp chat UI
- [ ] Supports: outbound (left bubble, grey), inbound (right bubble, WhatsApp green)
- [ ] Typing indicator: animated 3-dot bubble before message appears (optional prop)
- [ ] Timestamp on each message
- [ ] Double-tick → blue-tick animation sequence (optional, triggered by `delivered` + `read` props)
- [ ] Phone frame: rounded corners, status bar (time: 9:41), signal indicators
- [ ] Renders as static HTML if `animated={false}` (for SSR, screenshots)
- [ ] ARIA: `role="log"` on chat container, `aria-live="polite"` when animated

### FR-COMP-006 — Pricing Toggle Component
**Priority:** 🔴 P0 | **Complexity:** S

**Acceptance Criteria:**
- [ ] `<BillingToggle value={billing} onChange={setBilling} />` where billing: 'monthly'|'annual'
- [ ] Visual: pill-shaped container, sliding indicator
- [ ] Annual option shows "Save 2 months" badge in brand400
- [ ] Animation: CSS transition 200ms ease on sliding indicator
- [ ] State is lifted to pricing page — prices update reactively
- [ ] `aria-pressed` on each option button
- [ ] Keyboard: left/right arrow keys switch between options

### FR-COMP-007 — StepConnector (Animated Arrow)
**Priority:** 🟡 P1 | **Complexity:** S

**Acceptance Criteria:**
- [ ] `<StepConnector delay={0.4} />` renders animated dashed arrow between steps
- [ ] Animation: dashed line draws from left to right, 600ms, after `delay` seconds
- [ ] Direction: always horizontal (left → right)
- [ ] Colour: brand300 dashed line, brand400 arrow head
- [ ] `prefers-reduced-motion`: shows static arrow instantly
- [ ] Mobile: hidden (steps stack vertically on mobile — no connector needed)

### FR-COMP-008 — Risk Score Badge
**Priority:** 🟡 P1 | **Complexity:** XS

**Acceptance Criteria:**
- [ ] `<RiskScoreBadge score={7.8} />` renders coloured badge with score
- [ ] 0–3: green background, "LOW RISK" label
- [ ] 4–6: amber background, "MEDIUM RISK" label
- [ ] 7–8: orange background, "HIGH RISK" label
- [ ] 9–10: red background, "CRITICAL RISK" label
- [ ] Score shown: one decimal place (e.g. "7.8")
- [ ] Icon: AlertTriangle (Lucide) for HIGH + CRITICAL, CheckCircle for LOW
- [ ] Used in: Farm cards, Farm Detail header, Portfolio map tooltips

### FR-COMP-009 — Loss Calculator Widget
**Priority:** 🔴 P0 | **Complexity:** S

**Acceptance Criteria:**
- [ ] Reusable component used on: Homepage Pain Section, /loss-calculator page, /solutions pages
- [ ] Props: `showCTA?: boolean`, `defaultBirds?: number`, `compact?: boolean`
- [ ] Inputs: slider (birds) + static ₹2.5/kg timing loss
- [ ] Output: formatted in Indian number system (₹X लाख or ₹X,XX,XXX)
- [ ] Output updates on every slider change (debounced 50ms — instant feel)
- [ ] CTA link (when `showCTA=true`): "यह नुकसान रोकें — 14 दिन मुफ़्त →"
- [ ] Compact mode: smaller typography, used in sidebar or tight spaces

### FR-COMP-010 — Testimonial Card Component
**Priority:** 🟡 P1 | **Complexity:** S

**Acceptance Criteria:**
- [ ] Required props: `name`, `location`, `flock`, `quoteEn`
- [ ] Optional props: `quoteHi`, `outcome`, `verified`, `videoUrl`, `fcrBadge`, `whatsappBadge`
- [ ] Avatar: initials-based (first letter of first and last name), brand700 bg, white text
- [ ] Verified badge: only shown when `verified=true` — "✓ Verified against records"
- [ ] Financial outcome badge: signal-light bg, signal-700 text, rendered as pill
- [ ] Video thumbnail: 16:9 ratio with play button overlay; clicking opens VideoModal
- [ ] VideoModal: Next.js Dialog component, YouTube iframe, lazy-loaded
- [ ] Language toggle: shows Hindi quote when `quoteHi` provided and lang='hi'
- [ ] Card border-left: 4px solid brand400

---

## 19. INTERNATIONALIZATION (i18n) REQUIREMENTS

### FR-I18N-001 — next-intl Setup
**Priority:** 🔴 P0 | **Complexity:** M

**Acceptance Criteria:**
- [ ] next-intl v3+ configured with App Router
- [ ] Locale routing: `/` (default, English) and `/hi` prefix for Hindi OR cookie-based (no prefix — recommended for SEO)
- [ ] **Recommendation:** Use cookie-based locale (no URL prefix) to avoid duplicate content issues
  - Hindi content at same URLs as English (controlled by cookie)
  - `hreflang` tags reference same URL for both languages
  - This avoids having `/hi/pricing` vs `/pricing` duplicate issues
- [ ] `flockiq_lang` cookie: always initialised to 'en' — never set from Accept-Language
- [ ] `useTranslations('namespace')` hook used in all components with user-visible text
- [ ] All translation keys defined in both `en.json` and `hi.json` before use
- [ ] Missing translation fallback: English (never shows raw key in production)
- [ ] Hindi fonts (`Noto Sans Devanagari`) only loaded when `lang === 'hi'`
  - Dynamic import: `const DevanagariStyles = dynamic(() => import('@/styles/devanagari.css'), { ssr: false })`
  - This prevents ~80KB font loading for English-only users

### FR-I18N-002 — Devanagari Typography Rules
**Priority:** 🔴 P0 | **Complexity:** S

**Acceptance Criteria:**
- [ ] All Hindi text uses `font-devanagari` Tailwind class (maps to Noto Sans Devanagari)
- [ ] Hindi text minimum font size: 15px (even for "small" text — Devanagari needs space)
- [ ] Hindi line-height: 1.7 minimum (Devanagari ascenders/descenders need more space)
- [ ] Hindi letter-spacing: 0 (Devanagari does not benefit from letter-spacing)
- [ ] Hindi animations: opacity-only (no transform — causes jank on mid-range Android)
  - Implemented via `devanagari` prop on `<FadeUp devanagari />` component
- [ ] Mixed content (Hindi headline + English sub): each has correct `lang` attribute
  - `<h1 lang="hi">अपना Poultry Farm</h1>` + `<p lang="en">Start free trial</p>`
- [ ] Numbers always in Arabic numerals even in Hindi mode (1,2,3 not Devanagari digits)
- [ ] Currency: ₹ symbol always used regardless of locale

### FR-I18N-003 — Content Translation Coverage
**Priority:** 🔴 P0 | **Complexity:** L

**Acceptance Criteria — Minimum required translations before launch:**
- [ ] All navigation labels (both languages)
- [ ] Homepage: hero, stats strip, pain section, WhatsApp feature, testimonials, CTA
- [ ] Pricing page: all plan names, feature names, CTA buttons
- [ ] Signup wizard: all 4 steps, all labels, all error messages
- [ ] Login page: all labels, error messages
- [ ] Common error messages: network error, validation errors, rate limit messages
- [ ] Footer: all section headings, link labels
- [ ] WhatsApp messages: all templates in both Hindi and English

**Translations NOT required at launch (P2/P3):**
- [ ] Blog post full content (Hindi versions of articles) — P3
- [ ] Case studies full text (Hindi versions) — P3
- [ ] Legal pages (Privacy, Terms, Refund) — Hindi versions P3
- [ ] Glossary term definitions (Hindi) — P3
- [ ] Press page (Hindi) — P3

---

## 20. MONITORING & OBSERVABILITY REQUIREMENTS

### NFR-MON-001 — Error Monitoring
**Priority:** 🔴 P0 | **Complexity:** S

**Acceptance Criteria:**
- [ ] Sentry (or equivalent) installed for both client-side and server-side errors
- [ ] Source maps uploaded to Sentry on each deploy (CI step)
- [ ] Alert: Slack/email notification when error rate > 5% over 5 minutes
- [ ] Alert: Slack notification when any API route returns 500 3+ times in 1 minute
- [ ] WhatsApp webhook errors: separate Sentry project tag `component:whatsapp`
- [ ] Supabase query errors: logged with query context, not raw SQL (no PII in logs)
- [ ] `console.error` replaced with structured logger (pino) in all server code

### NFR-MON-002 — Uptime Monitoring
**Priority:** 🟡 P1 | **Complexity:** XS

**Acceptance Criteria:**
- [ ] Uptime monitoring tool configured (Betteruptime or UptimeRobot — free tier sufficient at launch)
- [ ] Checks every 1 minute: `GET /` (homepage), `GET /api/health` (returns 200 + DB status)
- [ ] Alert: SMS/WhatsApp to on-call team if downtime > 2 minutes
- [ ] Status page: `status.flockiq.com` (Betteruptime provides this automatically)
- [ ] `/api/health` endpoint:
  ```json
  {
    "status": "ok",
    "db": "ok",
    "whatsapp": "ok",
    "accuracy_last_updated": "2026-06-02T10:43:00Z"
  }
  ```

### NFR-MON-003 — Core Web Vitals Monitoring
**Priority:** 🟡 P1 | **Complexity:** XS

**Acceptance Criteria:**
- [ ] Vercel Analytics enabled (free tier — monitors CWV for real users)
- [ ] Alternative: `web-vitals` npm package reporting to PostHog
  ```typescript
  // src/lib/web-vitals.ts
  import { onCLS, onFID, onFCP, onLCP, onTTFB, onINP } from 'web-vitals';
  export function reportWebVitals() {
    onLCP((metric) => posthog.capture('web_vital', { name: 'LCP', value: metric.value }));
    onCLS((metric) => posthog.capture('web_vital', { name: 'CLS', value: metric.value }));
    onINP((metric) => posthog.capture('web_vital', { name: 'INP', value: metric.value }));
  }
  ```
- [ ] Alert when P75 LCP > 4s for more than 10 sessions in 24 hours

---

## 21. CONTENT STRATEGY REQUIREMENTS

### FR-CONTENT-001 — Blog Content Calendar (First 30 Days)
**Priority:** 🟡 P1 | **Complexity:** M

**Required posts before launch:**

| Week | Post Title | Language | Category | SEO Target |
|------|-----------|----------|----------|------------|
| 1 | How FlockIQ WhatsApp Log Automation Saves Integrators 500 Hours/Year | EN + HI | Product | whatsapp poultry management |
| 1 | Gorakhpur Broiler Price Today — AI Forecast [Month] 2026 | HI primary | Bhav Vichar | गोरखपुर मुर्गी भाव |
| 2 | FCR Optimization: 5 Ways to Save Feed in Broiler Farming | EN | Kheti Gyan | FCR optimization broiler |
| 2 | Batch P&L: How to Track Your True Profit Per Batch | EN + HI | Kheti Gyan | poultry batch profit |
| 3 | HPAI Bird Flu: How Your Farm Gets a 48-Hour Early Warning | EN + HI | Disease | HPAI bird flu alert India |
| 3 | FlockIQ vs Spreadsheets: The Real Cost of Manual Data Collection | EN | Industry | poultry farm management software |
| 4 | Medication Withdrawal Periods: Why Missing Them Risks FSSAI Violations | EN | Kheti Gyan | poultry antibiotic withdrawal FSSAI |
| 4 | UP Poultry Market 2026: Trends, Challenges & Opportunities | EN | Industry Intelligence | UP poultry market 2026 |

**Post format requirements:**
- [ ] Every post: meta title, meta description, slug, category, author, date
- [ ] Every post: WhatsApp share button (fixed bottom-right on mobile)
- [ ] Hindi posts: minimum 600 words in Devanagari script (P3 — not required at launch)
- [ ] English posts: minimum 800 words
- [ ] All posts: internal links to 2+ related pages/features
- [ ] All posts: 1 CTA section mid-article ("Want accurate forecasts? Start free trial →")
- [ ] All posts: related posts section (3 cards, same category)

### FR-CONTENT-002 — Case Study Content Requirements
**Priority:** 🟡 P1 | **Complexity:** M

**Required case studies at launch:**

**Case Study 1: Rajesh Yadav — Gorakhpur**
- Format: Long-form (1,200–1,500 words) in English. Hindi version is P3
- Structure: Challenge → What Rajesh tried first → How FlockIQ helped → Results
- Metrics to include: ₹1,24,000 saved, FCR 1.68 achieved, 4/4 batches sold at optimal timing
- Verification note: "Verified against Gorakhpur APMC price records, June 2026"
- Screenshots: WhatsApp signal received, dashboard showing FCR trend

**Case Study 2: Suresh Kumar Patel — Deoria**
- Focus: HPAI early warning, risk management
- Metrics: ₹3.2 lakh in potential losses avoided, 18,000 Ross 308 flock sold before transport block
- Quote: Video or audio testimonial if available

**Case Study 3: Manoj Singh — Kushinagar (Integrator)**
- Focus: First batch with FlockIQ (adoption story), FCR improvement
- Metrics: ₹68,000 profit improvement in first batch, FCR 1.65 achieved
- Integrator angle: Manoj manages 35,000 Hubbard Flex birds

**Case Study 4 (NEW): David Chen — Jakarta, Indonesia (Global)**
- Focus: Global expansion, WhatsApp automation for multi-farm integrator
- Metrics: FCR improved 0.12 in 3 months, eliminated 2 data collector positions
- Language: English only

**Case Study Format Requirements:**
- [ ] Hero section: outcome stat as hero number (e.g. "₹1,24,000")
- [ ] Farmer profile card: name, location, farm size, breed, batch frequency
- [ ] Challenge section: narrative 2–3 paragraphs
- [ ] Solution section: specific FlockIQ features used
- [ ] Results section: 3–5 quantified outcomes with icons
- [ ] Quote card: full blockquote + attribution
- [ ] "Your story could be next" CTA at bottom
- [ ] `Article` + `Review` structured data

---

## 22. SECURITY REQUIREMENTS

### NFR-SEC-001 — API Security
**Priority:** 🔴 P0

**Acceptance Criteria:**
- [ ] All API routes: validate request body with Zod schema before processing
- [ ] All user-authenticated routes: validate Supabase session server-side
- [ ] Rate limiting: implemented on all public API routes using Upstash Redis + `@upstash/ratelimit`
  - `/api/auth/send-otp`: 3 requests per phone number per 15 minutes
  - `/api/contact`: 3 requests per IP per hour
  - `/api/whatsapp/send-demo`: 1 per phone number per 24 hours
  - `/api/demo-requests`: 5 per IP per hour
- [ ] CORS: only `https://flockiq.com` and `https://*.flockiq.com` allowed
- [ ] WhatsApp webhook: HMAC-SHA256 signature verification on every incoming request
- [ ] No sensitive data in client-side code (no service role keys, no admin passwords)
- [ ] All environment variables validated at startup (fail fast if missing)
- [ ] SQL injection: prevented by Supabase parameterized queries (no raw SQL with user input)
- [ ] XSS: all user content rendered via React (auto-escaping), never with `dangerouslySetInnerHTML`
- [ ] CSRF: API routes check `Origin` header for state-changing operations

### NFR-SEC-002 — Data Privacy (DPDP Act 2023)
**Priority:** 🔴 P0

**Acceptance Criteria:**
- [ ] Personal data inventory documented: what data, where stored, retention period, purpose
- [ ] All personal data collection: explicit consent checkbox, purpose stated, unchecked by default
- [ ] Phone numbers: stored hashed in analytics (PostHog), only plaintext in Supabase
- [ ] Right to erasure: `DELETE /api/account` deletes all PII within 30 days
- [ ] Data export: `GET /api/account/export` returns all user data as JSON within 24 hours
- [ ] Data processor agreement: in place with Supabase (AWS Mumbai), Vercel, PostHog
- [ ] WhatsApp messages: raw message bodies NOT stored — only parsed values stored
- [ ] STOP command: immediately halts all messages, recorded in `opt_out_log` table
- [ ] Privacy policy last-updated date: auto-updates when policy content changes

---

## 23. CONVERSION OPTIMISATION REQUIREMENTS

### FR-CRO-001 — Exit Intent Capture
**Priority:** 🟢 P2 | **Complexity:** M

**Acceptance Criteria:**
- [ ] Exit intent detection: mouse moving towards browser top bar (desktop only — `mouseleave` on document)
- [ ] Trigger: only shows once per session (sessionStorage flag)
- [ ] Only on: homepage, /pricing, /features/* pages (not on auth or legal pages)
- [ ] Not triggered if user is already logged in
- [ ] Modal content: 
  - Headline: "Wait — See your farm's potential savings before you go"
  - Sub: "Enter your flock size and get a personalized ROI calculation"
  - Mini loss calculator embedded in modal
  - CTA: "Start Free Trial (14 days)" + "Maybe later" dismiss
- [ ] `exit_intent_shown` + `exit_intent_submit` analytics events
- [ ] Modal: keyboard accessible, Escape to dismiss, focus trap

### FR-CRO-002 — Sticky Trial CTA (Mobile)
**Priority:** 🟢 P2 | **Complexity:** S

**Acceptance Criteria:**
- [ ] Mobile only (`< 768px`): sticky bottom bar appears after scrolling 30% of page
- [ ] Content: "Start Free Trial →" full-width button (signal orange, 56px height)
- [ ] Hides: when user is near footer (IntersectionObserver on footer)
- [ ] Hides: on /login, /signup, /onboarding pages
- [ ] Hides: when user is logged in
- [ ] Animation: slides up from bottom, 300ms ease
- [ ] `z-index: 30` (below nav at 40, above content)
- [ ] Fires `sticky_cta_click` analytics event with `{ page, scroll_depth }`

### FR-CRO-003 — Social Proof Counter (Live)
**Priority:** 🟢 P2 | **Complexity:** S

**Acceptance Criteria:**
- [ ] Real-time farm count: shown in nav announcement bar ("500+ farms already on waitlist")
- [ ] Count fetched from Supabase `platform_stats` table, ISR revalidate 300s
- [ ] Fallback: hardcoded value if Supabase unavailable
- [ ] Display format: rounds down to nearest 50 (499 → "450+", 512 → "500+")
- [ ] Rationale: always slightly understating builds trust (we never overclaim)

### FR-CRO-004 — Referral Programme Integration
**Priority:** 🟢 P2 | **Complexity:** M

**Acceptance Criteria:**
- [ ] Referral link generated at onboarding Step 4 completion
- [ ] Format: `https://flockiq.com/signup?ref=ABC123`
- [ ] WhatsApp share: "FlockIQ ने मेरे फार्म की ₹1.24 लाख बचत की। आप भी try करें: [link]"
- [ ] Referrer reward: ₹500 credit applied after referee completes 14-day trial and converts to paid
- [ ] Referee reward: ₹500 credit applied at trial start
- [ ] Referral tracking: stored in `referral_events` table, attributed to referrer's account
- [ ] Referral link page: shows referrer's first name ("Ramesh invited you to FlockIQ")
- [ ] Abuse prevention: max 50 referral credits per account per month

---

*End of FlockIQ Pre-Login Website Requirements Master v3.0 — COMPLETE*
*Total requirements: 85+ functional requirements, 15+ non-functional requirements*
*Total acceptance criteria: 400+ testable items*
*Companion documents:*
*  - FlockIQ_PreLogin_Design_Master_v3.md*
*  - FlockIQ_PreLogin_Tasks_v3.md*
