# PoultryPulse AI — Pre-Login Website Requirements Specification
**Document Type:** Website Requirements (Kiro-Compatible)  
**Version:** 1.0 · May 2026  
**Classification:** CONFIDENTIAL — Engineering, Marketing & Investor Use  
**Author:** Senior Software Head + SaaS Growth Strategy (Lemkin · Rachitsky · Gerhardt Layer)  
**References:** PRD v3.0, UI/UX Design v1.0, Dashboard Requirements v1.0, Dashboard Requirements Addendum v1.0  
**Platform:** Next.js 15 App Router (same codebase as web dashboard)  
**Scope:** All public-facing pages at poulse.ai — pre-login only

---

## Strategic Context — Why the Website Matters as Much as the Product

The pre-login website is the first and most important sales rep PoultryPulse will ever have. It works 24 hours a day, converts cold traffic from WhatsApp farmer groups, Google searches, and investor decks — and it must close a ₹2,000–2,00,000/month purchase decision. Every page is a sales argument.

The current website has no formal design or content specification. This document fixes that.

Three SaaS truths that govern every requirement here:

**Jason Lemkin truth:** "The website is the SDR that never sleeps." Every page must answer: *who is this for, what is the exact ROI, and what do I do next?* No ambiguity on any of these three questions on any page.

**Lenny Rachitsky truth:** "Your first 1,000 users come from one channel." For PoultryPulse, that channel is WhatsApp farmer groups in Gorakhpur. The home page must convert a farmer who received a WhatsApp link while standing in a shed — on a ₹12,000 Android phone, in Hindi, in 8 seconds.

**Dave Gerhardt truth:** "Positioning is not what your product does. It is who it is for, and what they believe after reading one sentence." PoultryPulse's one sentence: *"95%+ accurate AI price forecast for broiler farmers — know exactly when to sell."* Every page reinforces this, never dilutes it.

---

## Website Architecture — Complete Page Inventory

| # | Route | Page Name | Priority | Audience |
|---|---|---|---|---|
| 1 | `/` | Home | P0 | All segments, Hindi + English |
| 2 | `/features` | All Features | P0 | S1, S2, S3 |
| 3 | `/pricing` | Pricing | P0 | S1, S2, S3, S5 |
| 4 | `/accuracy` | Accuracy & Proof | P0 | All — especially enterprise/investor |
| 5 | `/solutions/commercial-farms` | For Commercial Farms | P0 | S1 |
| 6 | `/solutions/integrators` | For Integrators | P0 | S2 |
| 7 | `/solutions/feed-companies` | For Feed Companies | P1 | S3 |
| 8 | `/solutions/enterprise` | For Enterprise & QSR | P1 | S5 |
| 9 | `/farm-intelligence` | Farm Intelligence | P1 | S1, S2 |
| 10 | `/developers` | API & Developers | P1 | S5 technical buyers |
| 11 | `/compliance` | Compliance & Traceability | P2 | S2, S5 exporters |
| 12 | `/about` | About PoultryPulse | P1 | All — investors, press |
| 13 | `/blog` | Blog & Resources | P2 | SEO, content marketing |
| 14 | `/demo` | Request Demo | P0 | S2, S3, S5 |
| 15 | `/login` | Login / Sign Up | P0 | Returning users, new signups |

---

## Global Website Requirements

### GWEB-001 · Navigation (Sticky Header)

**Functional Requirements:**

GW-1.1 The navigation shall be sticky (fixed to top) on scroll on all pages, with a background that transitions from transparent (on page top) to white/blurred (on scroll, `backdrop-filter: blur(12px)`).

GW-1.2 Navigation structure:
```
Logo | Products ▾ | Solutions ▾ | Features | Pricing | Accuracy | Blog | [EN/हिं] | [Request Demo] | [Login]
```

GW-1.3 Products dropdown:
- PulsePro — For commercial farms
- PulseEnterprise — For integrators & enterprise

GW-1.4 Solutions dropdown:
- Commercial Farms (10K–50K birds)
- Integrators (50K+ birds)
- Feed Companies
- Enterprise & QSR

GW-1.5 The `[Request Demo]` button shall be the primary CTA: brand-green-700 background, white text, rounded-full. Present on every page in the navigation.

GW-1.6 `[EN/हिं]` language toggle switches the page language between English and Hindi. The selected language persists via `localStorage` and is applied to all subsequent pages in the session.

GW-1.7 On mobile (< 768px): navigation collapses to a hamburger menu. The `[Request Demo]` button remains visible in the navigation bar even on mobile (does not collapse). `[Login]` collapses into the hamburger menu.

**Non-Functional Requirements:**

GW-1.8 Navigation renders server-side (Next.js Server Component) for SEO. Language toggle is the only client-side element.

GW-1.9 Navigation background on scroll transition: 200ms ease-in-out.

---

### GWEB-002 · Global Footer

**Functional Requirements:**

GW-2.1 Footer structure (4-column grid):
```
Column 1: Logo + tagline + app download badges (App Store + Play Store)
Column 2: Product — PulsePro, PulseEnterprise, Features, Pricing, Accuracy
Column 3: Solutions — Commercial Farms, Integrators, Feed Companies, Enterprise
Column 4: Company — About, Blog, Developers, Compliance, Contact
Column 5: Legal — Privacy Policy, Terms of Service, Cookie Policy, DPDP Act Notice
```

GW-2.2 Footer shall include: WhatsApp contact button (`wa.me/[number]`), email contact, registered address in Gorakhpur/UP.

GW-2.3 Footer social proof strip immediately above footer: scrolling marquee of live accuracy stat — `"मॉडल सटीकता: 96.2% दिशात्मक | MAPE: 4.8% | 847 पूर्वानुमान सत्यापित"` — updated daily from the `accuracy_log` API.

GW-2.4 Footer language: same as selected site language (EN/Hindi toggle).

---

### GWEB-003 · SEO & Performance Standards

**Functional Requirements:**

GW-3.1 Every page shall have unique, keyword-optimised `<title>` and `<meta description>` tags in both English and Hindi (served via hreflang for the selected language).

GW-3.2 Primary SEO keywords to target:
- "broiler price forecast India" (EN)
- "गोरखपुर ब्रॉयलर भाव" (HI)
- "poultry price prediction AI India"
- "poultry farm management software India"
- "FSSAI batch traceability poultry"
- "broiler price today UP"

GW-3.3 All blog posts and accuracy pages shall implement JSON-LD structured data (Article, FAQPage, Organization, Product schemas).

GW-3.4 All images shall have descriptive `alt` text in English. Hindi `alt` text on language toggle.

**Non-Functional Requirements:**

GW-3.5 Lighthouse Performance score ≥ 90 on all public pages (measured monthly).

GW-3.6 Core Web Vitals: LCP ≤ 2.5s, CLS ≤ 0.1, FID ≤ 100ms — enforced via Lighthouse CI in CI/CD.

GW-3.7 All pages are statically generated (Next.js `generateStaticParams`) or ISR with 1-hour revalidation. No SSR for public pages (performance).

---

## Page-by-Page Requirements

### REQ-WEB-001 · Home Page (`/`)

**Priority:** P0 — Must Have  
**Audience:** All segments; primary = S1 Hindi-speaking farmer arriving via WhatsApp link on mobile  
**Lenny Rachitsky First-1,000-Users Test:** A farmer receives this URL in a WhatsApp group. He has 8 seconds before he closes the tab. Can he understand: what this is, if it's for him, and what to do? The home page must pass this test.

**Section 1 — Hero (Above the Fold)**

W1.1 The hero section shall be the most important design element on the entire website. It renders without any scroll on all devices. It contains exactly 5 elements:

- **Headline (Hindi):** `"₹30,000 ज़्यादा कमाएं हर बैच में"` (Earn ₹30,000 more per batch)  
  **Headline (English):** `"Earn ₹30,000 More Per Batch."` — font: `heading-display`, size: 64px desktop / 40px mobile, weight: 800, color: neutral-900
- **Sub-headline:** `"AI-powered broiler price forecast with 95%+ accuracy. Know exactly when to sell."` (English) / `"AI-powered ब्रॉयलर भाव पूर्वानुमान — 95%+ सटीकता। जानें ठीक कब बेचें।"` (Hindi)
- **Live Accuracy Badge:** A pill badge showing `"✅ Live MAPE: 4.8% · 96.2% Directional Accuracy"` — fetched from the public accuracy API, updated daily. This is the single most trust-building element on the page.
- **Primary CTA:** `"Start Free Trial — 14 Days"` / `"14 दिन मुफ़्त आज़माएं"` — brand-green-700, full-width on mobile, 280px on desktop
- **Secondary CTA:** `"See How It Works →"` — text link, neutral-400, below the primary CTA

W1.2 The hero shall include a **product screenshot/mockup** showing the Price Signal Hero widget (dashboard design) on both a phone (mobile mockup) and a browser window (web dashboard). The mockup shall show real-looking data: `₹162.40/kg · ↑ +2.3% · ⭐ SELL NOW`. Rendered as a CSS/HTML mockup, not a rasterized image — it animates on page load with a count-up animation on the price number.

W1.3 The hero background: subtle animated gradient (`brand-green-50` to white), not a photo. No stock photos of chickens or farmers — they are clichéd and reduce perceived B2B credibility.

W1.4 Social proof row immediately below hero (no scroll required on desktop):
```
[NABARD Gorakhpur] [UP Agriculture Dept] [AGMARKNET Data Partner] [IMD Weather Data]
```
Logos rendered as greyscale SVGs with the label "Data Partners". Conveys institutional credibility without claiming endorsement.

**Section 2 — The Problem (Pain Agitation)**

W1.5 A 3-card problem statement section:
```
Card 1: 🕐 "बेचते हैं भरोसे पर, और हर बार ₹2–4/kg का नुकसान होता है"
         (You sell on gut feel, and lose ₹2–4/kg every time)
         
Card 2: 🦠 "HPAI alert का पता लगता है जब ट्रांसपोर्ट पहले से बंद हो चुका होता है"
         (You learn about HPAI when transport is already blocked)
         
Card 3: 🤝 "बिचौलिया ₹8 देता है जब लखनऊ में ₹10 है — आपको नहीं पता"
         (Trader pays ₹8 when Lucknow wholesale is ₹10 — you don't know)
```
Each card: white background, relevant emoji, bold Hindi problem statement, English subtitle. Mobile: vertical stack. Desktop: 3-column grid.

**Section 3 — The Solution (Feature Preview)**

W1.6 A tabbed feature preview section showing 5 tabs. Each tab shows a product screenshot/mockup:
- Tab 1: **Price Intelligence** — "95%+ accurate 7-day broiler price forecast"
- Tab 2: **Sell Signal** — "Know exactly when to sell. SELL NOW / HOLD / CAUTION"
- Tab 3: **Farm Operations** — "Track FCR, mortality, weight gain from one dashboard"
- Tab 4: **Health & Compliance** — "Vaccination schedules, FSSAI traceability, antibiotic-free certification"
- Tab 5: **Smart Alerts** — "HPAI zone alerts, heat stress warnings, abnormal mortality detection"

W1.7 Each tab mockup shall be animated: the active tab mockup slides in from the right (300ms ease-out). Product numbers in the mockups shall be realistic (not placeholder lorem ipsum).

**Section 4 — Accuracy Proof Strip**

W1.8 A full-width dark section (neutral-900 background) showing live model performance:
```
┌──────────────────────────────────────────────────────────────────────────┐
│  MODEL ACCURACY — LIVE DATA                                               │
│  ────────────────────────────────────────────────────────────────────── │
│  96.2%               4.8%              80.1%              847            │
│  Directional         MAPE             Conformal           Predictions    │
│  Accuracy            (< 6% target)    Coverage            Verified       │
│                                                                           │
│  "Our model has been right 96.2% of the time on direction — sell or hold"│
│  Last updated: Today 06:15 IST  ·  [See Full Accuracy Report →]          │
└──────────────────────────────────────────────────────────────────────────┘
```
Numbers fetch from `GET /api/public/accuracy-summary` (new public endpoint, no auth). Count-up animation on first scroll into viewport. Update daily.

**Section 5 — Feature Grid (What You Get)**

W1.9 A 3×4 grid of feature cards (12 features) — the most comprehensive feature display on the home page:

| Feature | Icon | One-line description |
|---|---|---|
| Price Forecast | 📊 | 7-day AI forecast with P10/P50/P90 confidence bands |
| Sell Signal | ✅ | Daily SELL NOW / HOLD / CAUTION with financial impact |
| Batch ROI Optimizer | 🧮 | Exact ₹ profit comparison: sell today vs wait N days |
| Middleman Check | 🤝 | Is the trader's offer fair? Counter-offer in Hindi |
| FCR Analytics | 🌾 | Track feed efficiency, get daily allocation recommendations |
| Mortality Tracking | 📉 | Log daily deaths, detect abnormal patterns automatically |
| Vaccination Scheduler | 💉 | Auto-schedule UP broiler protocol, WhatsApp reminders |
| Biosecurity Audit | 🔒 | Fortnightly checklist with scoring and trend tracking |
| HPAI + Disease Alerts | 🦠 | Real-time outbreak alerts personalised to your district |
| IoT Integration | 🌡️ | Connect weighing scales, water meters, environment sensors |
| FSSAI Traceability | 📋 | One-click batch traceability PDF for compliance audits |
| ERP Integration | 🔗 | Sync with Tally, Zoho, SAP — zero double-entry |
| Farm Portfolio | 🏠 | Multi-farm overview with portfolio KPIs and health scan |
| Single Farm Detail | 📋 | Complete operational picture with 5 tabs (Metrics, Daily Log, Health, Feed, Batch History) |
| Daily Metric Log | ✏️ | Fast-entry form for mortality, feed, weight, environment, health observations |
| Farm Comparison | 📊 | Side-by-side radar chart comparison across 2–5 farms |
| Portfolio Metrics | 📈 | Aggregated dashboard with FCR trends, mortality timeline, performance league table |
| FCR Analysis | 🌾 | Portfolio FCR trends, farm ranking, rule-based recommendations |
| Mortality Analysis | 📉 | Cumulative mortality charts, cause donut, HPAI correlation |
| Feed Management | 🌾 | Consumption charts, cost tables, low-stock alerts, WhatsApp ordering |
| Health Tracker | 💊 | Health status grid, vaccination compliance, disease event timeline |
| Batch Reports | 📄 | 7-section batch closure reports with PDF export and WhatsApp sharing |

W1.10 Each feature card: icon (emoji), bold title, one-line description. Hover: brand-green-700 left border slides in (200ms). Click: navigates to `/features#[section]`.

**Section 6 — ROI Calculator (Interactive)**

W1.11 An interactive ROI calculator embedded directly on the home page — no click required to access:
```
┌──────────────────────────────────────────────────────────┐
│  आपकी कमाई की गणना करें  ·  Calculate Your Earnings    │
│                                                          │
│  मेरे पास [25,000 ▾] पक्षी हैं                          │
│  औसत वज़न [2.0 kg ▾]                                   │
│  बिक्री [महीने में 2 बार ▾]                             │
│                                                          │
│  ─────────────────────────────────────────────────────  │
│  PoultryPulse से अनुमानित अतिरिक्त कमाई:              │
│                                                          │
│  ₹ 72,000 प्रति वर्ष                                   │
│  (बेहतर sell timing से: ₹1.50/bird avg improvement)    │
│                                                          │
│  सदस्यता लागत: ₹36,000/वर्ष                           │
│  शुद्ध ROI: ₹36,000/वर्ष (2.0x)                       │
│                                                          │
│  [14 दिन मुफ़्त शुरू करें →]                          │
└──────────────────────────────────────────────────────────┘
```
The calculator is a React client component. Inputs: flock size (dropdown), avg weight (dropdown), sell frequency (dropdown). Output: estimated additional earnings, subscription cost, net ROI. All computation client-side (no API call). The output updates instantly as inputs change.

**Section 7 — Testimonials / Social Proof**

W1.12 3 testimonial cards (anonymised with initials + district until real testimonials are available):
```
"पहले बिचौलिया जो भाव बोलता था, वो मान लेता था।
 अब PoultryPulse देखकर ₹4/kg ज़्यादा माँगते हैं।"
— R.Y., Gorakhpur  (25,000 bird farm)  ★★★★★

"3 batches में ₹1.8 lakh extra kamaaya.
 Subscription ka 50x return pehle saal mein hi."
— M.S., Deoria  (40,000 bird farm)  ★★★★★

"Feed cost timing alerts se ek batch mein ₹45,000 bachaye.
 Pehle kabhi aisa koi tool nahi tha."
— S.K., Kushinagar  (Integrator, 8 farms)  ★★★★★
```
Each card: quote in Hindi/Hinglish (authentic voice), name initials + district, flock size, star rating. Design: white card, light border, quotation mark icon in brand-green-50.

**Section 8 — Segment CTAs (Who Is This For?)**

W1.13 4 segment cards linking to solutions pages:
```
[Commercial Farm (10K-50K birds) →]  [Integrator (50K+ birds) →]
[Feed Company →]                     [Enterprise & QSR →]
```
Each card: segment name in bold, 2-line pain statement, monthly price range, CTA button.

**Section 9 — App Download**

W1.14 Mobile app download section:
- App Store badge + Play Store badge
- Phone mockup showing the mobile app (Hindi, real data)
- Headline: `"खेत में भी, घर में भी — हर जगह आपके साथ"` (In the field, at home — always with you)
- Sub-copy: "Works offline. Hindi-first. 200ms price load from cache."

**Section 10 — Final CTA**

W1.15 Full-width brand-green-700 CTA section:
- Headline: `"शुरू करें — पहले 14 दिन मुफ़्त"` (Get Started — First 14 Days Free)
- Sub: "No credit card required. Setup in 3 minutes."
- Button: `"अभी शुरू करें"` (Start Now) — white background, brand-green-700 text

**Non-Functional Requirements:**

W1.16 Home page LCP ≤ 2.0s (stricter than global target — this is the highest-traffic page).

W1.17 Home page is fully functional on a 3G connection (images lazy-loaded, hero text above-fold is pure CSS/HTML — no JS dependency for initial render).

W1.18 Home page Hindi content verified by a native Hindi speaker before launch. Grammar and tone reviewed: farmers speak colloquially (Awadhi/Bhojpuri influence) — copy should match their register, not formal government Hindi.

W1.19 The live accuracy stat (W1.8) degrades gracefully: if the public accuracy API is unavailable, show the last cached value with a `(last updated: [date])` label. Never show a broken/empty stat.

---

### REQ-WEB-002 · Features Page (`/features`)

**Priority:** P0 — Must Have  
**Audience:** All segments exploring before buying

**Functional Requirements:**

W2.1 The features page is organized into 6 named modules, each with its own anchor section:
- `#price-intelligence` — Price Forecast, District Map, Historical Data, API
- `#sell-intelligence` — Sell Signal, Batch ROI Optimizer, Middleman Check, Negotiation Script
- `#farm-operations` — Batch Management, FCR Analytics, Mortality Tracking, Weight Gain, Benchmarking, Farm Portfolio, Single Farm Detail, Daily Metric Log, Farm Comparison, Portfolio Metrics, FCR Analysis, Mortality Analysis, Feed Management, Health Tracker, Batch Reports
- `#health-biosecurity` — Vaccination Scheduler, Medication Records, Health Checklist, Biosecurity Audit, Traceability
- `#alerts-intelligence` — HPAI Alerts, Heat/Cold Wave, Price Crash, Feed Cost, Abnormal Mortality, IoT Alerts
- `#integrations` — IoT Devices, ERP (Tally, Zoho, SAP), WhatsApp, API, Webhook

W2.2 Each module section has: a module headline, 2-line description, and 3–6 feature cards within it.

W2.3 Each feature card contains: feature name, one-paragraph description, one specific customer benefit (formatted as `"✅ [Benefit]: [specific ₹ or % impact]"`), a small product screenshot (150×100px), and a "Who gets this?" badge (PulsePro / PulseEnterprise / Both).

W2.4 A sticky sidebar (desktop) shows the 6 module names with jump-links. Active section highlighted as user scrolls (Intersection Observer API).

W2.5 Feature count badge in the page header: `"57 features across 6 intelligence modules"`.

W2.6 Comparison link at the bottom: `"See how PoultryPulse compares to traditional methods →"` — links to a comparison table within the page.

W2.7 **Feature Comparison Table** (PoultryPulse vs Manual/Spreadsheet vs Navfarm-style ERP):

| Feature | Manual/Spreadsheet | Generic ERP | PoultryPulse |
|---|---|---|---|
| Price forecast (7-day) | ❌ | ❌ | ✅ 95%+ accuracy |
| AI sell signal | ❌ | ❌ | ✅ Daily SELL/HOLD/CAUTION |
| Batch ROI Optimizer | ❌ | Partial | ✅ Real-time ₹ calculation |
| FCR tracking | Manual | ✅ | ✅ + AI recommendations |
| Vaccination scheduler | Manual | ✅ | ✅ + WhatsApp reminders |
| HPAI disease alerts | ❌ | ❌ | ✅ Real-time, personalised |
| Middleman negotiation | ❌ | ❌ | ✅ Hindi script generator |
| FSSAI traceability | Manual | Partial | ✅ One-click PDF |
| IoT integration | ❌ | Some | ✅ Weighing, water, environment |
| ERP integration (Tally/Zoho) | Manual export | ✅ | ✅ Auto-sync |
| Works offline (mobile) | N/A | Sometimes | ✅ Always |
| Hindi-first interface | ❌ | ❌ | ✅ Native Devanagari |

---

### REQ-WEB-003 · Pricing Page (`/pricing`)

**Priority:** P0 — Must Have

**Functional Requirements:**

W3.1 The pricing page shall display exactly 2 pricing tiers (per PRD §8):

**Tier 1: PulsePro**
- Target: Commercial farms 10K–50K birds
- Price: `₹2,000 – ₹5,000 / month` (variable by flock size — show slider)
- Billing: Monthly or Annual (20% discount on annual)
- Features list: All 7 PulsePro features from PRD §8.1 + all Phase 1 operational features from Dashboard Requirements Addendum
- CTA: `"Start 14-Day Free Trial"`

**Tier 2: PulseEnterprise**
- Target: Integrators (50K+ birds), Feed Companies, QSR, Insurers
- Price: `₹10,000 – ₹2,00,000 / month` (custom — "Talk to Sales")
- Features list: Everything in PulsePro + all PulseEnterprise features + API access + multi-farm dashboard + farm portfolio overview + single farm detail (5 tabs) + daily metric log entry + farm comparison (radar chart) + portfolio metrics dashboard + FCR analysis page + mortality tracking page + feed management page + health log & disease tracker + batch reports + ERP integrations + IoT device integration + field worker supervisor app + FSSAI traceability + HACCP compliance
- CTA: `"Request Demo"`

W3.2 Flock size pricing slider for PulsePro:
- 10K–25K birds: ₹2,000/month
- 25K–50K birds: ₹3,500/month
- 50K–1L birds: ₹5,000/month (integrator tier starts here)
- Slider updates price display in real-time

W3.3 Feature comparison matrix below tier cards: full feature list with tick/cross per tier (same structure as W2.7 but all features, not just selected ones).

W3.4 FAQ section (6 most common pricing questions):
- "क्या कोई free trial है?" (Is there a free trial?) → Yes, 14 days, no credit card
- "रद्द करने की प्रक्रिया क्या है?" (What is the cancellation process?) → Cancel anytime from Settings
- "क्या Enterprise pricing custom होती है?" → Yes, contact sales
- "क्या data secure है?" → DPDP Act 2023 compliant, encrypted at rest
- "WhatsApp alerts सभी plans में हैं?" → Yes, included in all plans
- "Multi-user access कब से?" → Available with Team add-on from ₹500/user/month

W3.5 Trust signals below CTA buttons:
```
✅ No credit card required for trial
✅ Cancel anytime — no lock-in
✅ Data stays in India (AWS Mumbai)
✅ DPDP Act 2023 compliant
```

---

### REQ-WEB-004 · Accuracy & Proof Page (`/accuracy`)

**Priority:** P0 — Must Have (most important trust-building page for B2B)  
**Lenny truth:** The accuracy page IS the sales page for anyone who doesn't convert on the home page. Enterprise and investor audiences go here first.

**Functional Requirements:**

W4.1 The accuracy page shall display **live model metrics** fetched from `GET /api/public/accuracy-summary` (daily cache):
- Directional Accuracy: `96.2%` — with a confidence bar showing the 95% target
- MAPE: `4.8%` — with the "< 6%" target reference
- Conformal Coverage: `80.1%` — with the 78–82% target band
- Predictions verified: `847` — with "manually ground-truthed in Gorakhpur mandis" label

W4.2 Live **30-day MAPE trend chart** (publicly accessible, subset of admin accuracy dashboard). Same Recharts ComposedChart design as the internal accuracy dashboard, but read-only and public. Shows: daily MAPE as a line chart, with 6% target as a dashed reference line, green zone shaded below 6%.

W4.3 **Manual Validation Attestation** section — the most credible trust signal available:
```
"Our CTO and Data Head spent 10 days at Gorakhpur APMC 
 in November 2025, recording actual broker prices manually.
 Our model predicted the correct direction 9 out of 10 days.
 
 This is our baseline before we take a single rupee from customers."
```
With a downloadable "Accuracy Certification Report" PDF (signed document, redacted to protect proprietary model details but showing the validation methodology).

W4.4 **Prediction History Table** — last 30 predictions (publicly visible subset):
| Date | District | Predicted P50 | Actual Price | Direction Correct? | MAPE |
|---|---|---|---|---|---|
| 27 May 2026 | Gorakhpur | ₹163.40 | ₹164.20 | ✅ | 0.49% |
| 26 May 2026 | Gorakhpur | ₹161.80 | ₹163.40 | ✅ | 0.98% |
...etc.

Note: prices shown are from actual historical records — not fabricated. This table builds massive trust by showing the receipts.

W4.5 **Methodology Explainer** (accordion, expandable):
- "What is MAPE?" — plain language explanation
- "What is directional accuracy?" — plain language, with example
- "What data does the model use?" — public sources listed (AGMARKNET, NECC, IMD, DAHDF, NCDEX)
- "How often does the model retrain?" — weekly, with champion/challenger framework
- "What are conformal prediction intervals?" — why the P10–P90 range is meaningful

W4.6 **Feature Importance Visual** (simplified SHAP — public version): A bar chart showing the top 5 most important factors in today's price forecast:
1. Feed cost 42 days ago (maize price)
2. Last week's average price
3. Festival calendar (Eid +6 days)
4. Heat stress index (last 7 days)
5. HPAI zone status

This demystifies the AI and builds trust. Farmers understand that feed cost drives price — seeing it confirmed by the model is validating.

W4.7 **Stress Test Results** (PRD §6.5 Rule 5 — the 3 historical shocks):
- Nov–Mar 2024 UP Price Crash: "Our model predicted the downtrend 4 days before the crash. Directional accuracy during the crash: 89%."
- HPAI Gorakhpur Zone 2024: "Model correctly reduced forecast prices and widened confidence bands 48 hours before government zone declaration."
- Diwali 2023 Demand Spike: "Model predicted ₹8–12/kg price rise in the 7 days before Diwali. Actual: ₹10/kg rise. MAPE: 2.1% during the spike."

W4.8 Bottom CTA: `"See accuracy in your district — Start Free Trial"` linking to signup.

---

### REQ-WEB-005 · Solutions Pages (4 pages)

**Priority:** P0 — Must Have

Each solutions page follows the same template structure. Requirements are specified per template element, then per page.

**Template Structure (all 4 solutions pages):**
1. Hero (problem statement specific to segment)
2. Pain Points (3 cards, segment-specific)
3. "How PoultryPulse Solves It" (feature mapping to pain)
4. ROI Calculator (segment-specific inputs)
5. Relevant features list (curated for segment)
6. Case study / testimonial (segment-appropriate)
7. CTA (appropriate to segment: trial for S1, demo for S2/S3/S5)

**W5.1 — `/solutions/commercial-farms` (S1: 10K–50K birds)**

Hero: `"₹30,000 ज़्यादा — हर बैच में। गैरंटी के साथ।"` (₹30,000 More — Every Batch. Guaranteed.)

Pain points: Price opacity (sell on gut feel), HPAI blind spot, middleman exploitation

Features featured: Price forecast, Sell signal, Batch ROI Optimizer, Middleman check, Vaccination scheduler, Health checklist, Daily mortality log, WhatsApp alerts

ROI Calculator inputs: Flock size (10K–50K), batches per year (2–3), avg weight (kg)

CTA: `"Start 14-Day Free Trial — No Credit Card"`

**W5.2 — `/solutions/integrators` (S2: Integrators 50K+ birds)**

Hero: `"Manage 20 farms. One dashboard. One decision."` — this page is English-primary

Pain points: Multi-farm harvest timing chaos, no cross-farm benchmarking, manual P&L reconciliation across farms

Features featured: Multi-district price map, Multi-farm harvest queue, Batch Status Board (all farms), Performance benchmarking, Feed cost intelligence, IoT integration, ERP sync (Tally/Zoho), Supervisor field worker app, FSSAI traceability

ROI Calculator inputs: Number of farms, average flock size per farm, batches per year

CTA: `"Request Demo"` — integrators need a sales conversation, not self-serve trial

**W5.3 — `/solutions/feed-companies` (S3)**

Hero: `"Know where feed demand will surge — 6 weeks before it happens."`

Pain points: Feed overstock from demand mis-forecasting, procurement cost from poor timing, no early warning for supply shocks

Features featured: Demand Signal Index (forecasted feed demand by district), Commodity futures dashboard, 30-day broiler price as demand proxy, Multi-district heat map of production concentration

CTA: `"Talk to Sales"` with contact form

**W5.4 — `/solutions/enterprise` (S5: QSR, Processors, Insurers)**

Hero: `"30-day forward price intelligence. Verified at 95%+. API-first."`

Pain points: Procurement contract pricing risk, supply chain disruption visibility, FSSAI audit burden

Features featured: 30-day forecast API, Batch traceability, HACCP compliance, Supply shock early warning webhooks, API playground, ERP integration (SAP/Oracle), Multi-district coverage

CTA: `"Request Demo"` + `"API Documentation →"`

---

### REQ-WEB-006 · Farm Intelligence Page (`/farm-intelligence`)

**Priority:** P1  
**Purpose:** Showcase the operational management features (Navfarm competitive parity) without repositioning PoultryPulse as an ERP.

**Functional Requirements:**

W6.1 Hero headline: `"Beyond Price Intelligence — Complete Farm Operations in One Platform"`

W6.2 This page positions the operational features as *making the price intelligence more powerful*, not as standalone ERP features. The positioning narrative:
```
"Price intelligence without operational data is an estimate.
 Price intelligence combined with your actual FCR, mortality,
 and weight gain is a precise business decision engine."
```

W6.3 Feature sections on this page (6 sections):
1. **Batch Lifecycle Management** — DOC tracking to harvest, status board, performance history
2. **FCR & Feed Efficiency** — Daily feed log, FCR trend, deviation alerts, breed-standard benchmarks
3. **Health & Vaccination** — Schedule manager, medication records, withdrawal period enforcement
4. **Mortality Intelligence** — Daily logging, abnormal pattern detection, AI cause prediction
5. **Inventory & Costing** — Feed/medicine stock, purchase orders, real-time batch P&L
6. **IoT Smart Farm** — Auto-weighing scales, environment sensors, water meters

W6.4 For each section: one animated product screenshot, key metrics table (e.g., "Biosecurity audit takes: Manual = 2 hours | PoultryPulse = 8 minutes"), and 3 bullet benefits.

W6.5 Bottom of page: link to pricing with segment-appropriate CTAs.

---

### REQ-WEB-007 · Developers & API Page (`/developers`)

**Priority:** P1  
**Audience:** S5 enterprise technical buyers, integration engineers

**Functional Requirements:**

W7.1 Hero: `"The Poultry Intelligence API. 95%+ accuracy. Production-ready."` with a code block showing a real API call:
```bash
curl -X GET "https://api.poulse.ai/v2/forecast/enterprise" \
  -H "Authorization: Bearer sk-pp-****" \
  -d "district=gorakhpur&horizon=30&confidence[]=p10&confidence[]=p50&confidence[]=p90"
```

W7.2 Page sections:
- API Overview (what you can do)
- Quick Start (copy-paste code in 3 languages: Python, Node.js, cURL)
- Available Endpoints (table of all `/v2/` endpoints with descriptions)
- Rate Limits table (PulsePro: 1K calls/day, Enterprise: 10K+/day, custom)
- Authentication guide (HMAC signing, API key management)
- Webhooks guide (supply shock alerts, batch events)
- In-browser API Playground (live, embedded — same as the dashboard version)
- SDKs (Python SDK link, Node.js SDK link — Phase 2)

W7.3 Live API playground embedded on the page (not requiring login for read-only endpoints): users can execute `GET /api/public/accuracy-summary` without auth. For forecast endpoints, they see a `[Login to test with your API key]` prompt.

W7.4 Link to full Swagger/OpenAPI documentation (`/api/docs` — FastAPI auto-generated).

---

### REQ-WEB-008 · Compliance & Traceability Page (`/compliance`)

**Priority:** P2  
**Audience:** S2 integrators, S5 processors/exporters, compliance buyers

**Functional Requirements:**

W8.1 Hero: `"FSSAI-Ready. HACCP-Compliant. One Click."` with a mockup of the traceability PDF report.

W8.2 Page sections:
- FSSAI Batch Traceability (what it is, why it matters, what PoultryPulse generates)
- Antibiotic-Free Certification tracking (AB-Free badge system)
- HACCP Workflow (for processors)
- Batch-to-Buyer QR Code portal
- Export documentation roadmap (Phase 3)

W8.3 Downloadable sample traceability report PDF (redacted/sample data, real format).

---

### REQ-WEB-009 · About Page (`/about`)

**Priority:** P1

**Functional Requirements:**

W9.1 Sections: Mission statement, The Gorakhpur origin story, Why 95%+ accuracy before launch, The team (redacted for privacy — show roles, not names if preferred), Data partners, Investor information link (password-protected data room link).

W9.2 Mission statement: `"We believe every Indian poultry farmer deserves the same price intelligence that large processors have had for decades. We built that — and made it accurate enough to stake our company on before charging a single rupee."`

W9.3 The accuracy mandate story (from PRD §6 — "Non-Negotiable: The product does NOT go live until...") — told as a brand narrative, not a technical spec.

---

### REQ-WEB-010 · Request Demo Page (`/demo`)

**Priority:** P0  
**Audience:** S2, S3, S5 — anyone who wants a sales conversation

**Functional Requirements:**

W10.1 Simple, high-converting demo request form:
- Name (required)
- Company/Farm Name (required)
- Phone (required — WhatsApp-capable)
- Segment (dropdown: Commercial Farm / Integrator / Feed Company / QSR / Other)
- Flock size or farms managed (dropdown)
- Message (optional)
- Language preference (Hindi / English)
- `[Request Demo]` submit button

W10.2 On submit: immediate redirect to a "We'll WhatsApp you within 2 hours" confirmation page. Simultaneously: a Supabase record written to `demo_requests` table + Slack notification to the sales channel.

W10.3 Below the form: "Or WhatsApp us directly" → `wa.me/[number]` with a pre-filled message template.

W10.4 Social proof beside the form: "Join 150+ farms already using PoultryPulse in the Gorakhpur belt."

---

### REQ-WEB-011 · Blog & Resources (`/blog`)

**Priority:** P2  
**Audience:** SEO, content marketing, farmer education

**Functional Requirements:**

W11.1 Blog categories:
- **Bhav Vichar** (Price Analysis — Hindi) — weekly price outlook posts for SEO
- **Kheti Gyan** (Farm Knowledge — Hindi) — FCR tips, vaccination guides, biosecurity articles
- **Industry Intelligence** (English) — market analysis, policy updates
- **Product Updates** (English/Hindi) — feature releases, accuracy reports

W11.2 Each blog post has: structured data (Article JSON-LD), Hindi and English language versions (toggle), share to WhatsApp button, author byline, category tag.

W11.3 Featured content for SEO-driven farmer acquisition:
- "Gorakhpur ब्रॉयलर भाव — आज और अगले हफ़्ते का पूर्वानुमान" (weekly, auto-generated from model data)
- "UP में बर्ड फ्लू अलर्ट — ताज़ा जानकारी" (HPAI updates, as they happen)

W11.4 Blog posts from the `Gorakhpur ब्रॉयलर भाव` category auto-generate weekly from the model's public forecast using a server-side script — these are the highest-SEO-value pages on the site.

---

### REQ-WEB-012 · Login & Sign-Up Page (`/login`)

**Priority:** P0  
**Audience:** All users (new + returning)

**Functional Requirements:**

W12.1 Single page handles both login and sign-up (toggled by a tab or auto-detected by whether the phone number is registered).

W12.2 Login flow: Phone number → OTP → JWT → redirect to `/dashboard` (web) or app deeplink (mobile).

W12.3 Sign-up flow: Phone number → OTP → profile setup (OB-04 from UI/UX Design v1.0) → first forecast screen → redirect to `/dashboard`.

W12.4 Page includes: privacy policy link, DPDP Act 2023 notice ("Your data stays in India"), and the accuracy badge (`"96.2% Directional Accuracy — Verified"`) as reassurance above the fold.

W12.5 Language: Hindi-primary (phone number entry prompt in Hindi). English available via toggle.

---

## Cross-Cutting Website Requirements

### CW-001 · Language & Localisation

CW-1.1 All public pages support two languages: English (`en`) and Hindi (`hi`). Default language is determined by: (1) URL parameter `?lang=hi`, (2) browser Accept-Language header, (3) geo-IP (UP/Bihar/Jharkhand = Hindi default).

CW-1.2 All Hindi content is stored in `src/i18n/hi.json` and English in `src/i18n/en.json`. No hardcoded copy in component files.

CW-1.3 Hindi copy must use Devanagari script only — no Roman transliteration (Hinglish is acceptable in testimonials to match authentic voice, but all system copy is Devanagari).

CW-1.4 The language toggle state persists in `localStorage` under key `pp_lang`.

### CW-002 · Analytics & Conversion Tracking

CW-2.1 PostHog events fired on all public pages:
- `page_viewed` (page route, language, referrer source)
- `hero_cta_clicked` (button label, page, position)
- `roi_calculator_used` (inputs, output)
- `demo_requested` (segment, flock size)
- `signup_started` (source page)
- `pricing_viewed` (tier hovered, time spent)
- `accuracy_page_viewed` (section scrolled to)

CW-2.2 UTM parameter tracking: all WhatsApp links to the website include `?utm_source=whatsapp&utm_medium=farmer_group&utm_campaign=[group_name]` — captured in PostHog automatically.

CW-2.3 Hotjar (or similar) session recording on `/pricing` and `/demo` pages to identify conversion friction.

### CW-003 · Mobile Performance

CW-3.1 All pages are mobile-first (375px base viewport). Desktop is an enhancement.

CW-3.2 Cumulative Layout Shift (CLS) = 0 on mobile — no layout jumps as fonts/images load. All font loading uses `font-display: swap` with matching skeleton dimensions.

CW-3.3 All images use Next.js `<Image>` component with `priority` prop on above-the-fold images and `loading="lazy"` on all below-fold images.

CW-3.4 The primary CTA button (`[अभी शुरू करें]`) must be reachable without scrolling on any mobile device ≥ 375px wide.

### CW-004 · Security & Privacy

CW-4.1 No tracking pixels (Facebook Pixel, Google Ads pixel) shall be installed without explicit cookie consent via a DPDP Act 2023-compliant consent banner.

CW-4.2 The demo request form data (`demo_requests` table) is subject to Supabase RLS: only admin role can query it.

CW-4.3 All public pages are served over HTTPS only. HSTS header enforced.

CW-4.4 No user phone numbers are collected on any public page except the login/signup page. The ROI calculator and demo form collect segment/farm info only.

---

## Acceptance Criteria (Website-Level)

| Criterion | Target | Measurement |
|---|---|---|
| Home page LCP | ≤ 2.0s | Lighthouse CI |
| All pages LCP | ≤ 2.5s | Lighthouse CI |
| Hindi copy quality | 0 grammatical errors | Native speaker review |
| Live accuracy stats uptime | 99.9% (cached fallback always shows) | Synthetic monitor |
| ROI calculator computation time | < 50ms on input change | JS performance.now() |
| Demo request form submission | < 300ms response | Playwright test |
| Mobile CLS | 0 | Lighthouse CI |
| SEO: Core Web Vitals | All Green | Google Search Console |
| Language toggle persistence | 100% cross-page | Playwright E2E test |
| PostHog event delivery | > 99% | PostHog pipeline monitor |

---

*End of Website Requirements — PoultryPulse Pre-Login Website v1.0*
