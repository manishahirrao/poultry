# PoultryPulse AI — Implementation Quick Reference & Kiro Prompt Library
# File: 12_implementation_quick_reference.md
# Kiro Compatibility: ✅ Primary Kiro Execution Prompts
# Version: v1.0 | May 2026 | CONFIDENTIAL

---

## AGENT CONTEXT BLOCK
```
ROLE: Anand Mohideen Prompt Engineering Framework (25+ yr LLM precision)
PURPOSE: Ready-to-execute Kiro prompts for every major task group
APPROACH: Atomic, specific, context-complete prompts — no ambiguity
FORMAT: Each prompt is self-contained — Kiro agent needs no prior context
QUALITY: Every prompt specifies output format, validation rules, error handling
```

---

## 1. KIRO EXECUTION PROMPTS — FOUNDATION

### Prompt F-01: Web Token Package

```
KIRO TASK: Create the web design token package for PoultryPulse AI.

Create file: packages/ui/src/web-tokens.ts

Requirements:
1. Export const WebTokens with brand colours:
   - brandGreen700: '#1A6B3C', brandGreen500: '#2E8653', brandGreen50: '#E8F5EE'
   - saffronOrange: '#E8621A', amber500: '#F5A623'
   - neutral900: '#1C2B22' through neutral50: '#F7FAF8'
   - heroGradient, accentGradient, trustGradient CSS strings
   - DashboardTokens with sidebarBg: '#0F1E15', chart colours, status colours

2. Export const WebTypography with:
   - displayHero: clamp(2.5rem, 5vw + 1rem, 4.5rem), Sora, weight 800
   - displayLarge, heading1-3, hindiDisplay, hindiBody (Noto Sans Devanagari)
   - bodyLarge, bodyBase, bodySmall, eyebrow, priceHero, statNumber

3. Export const WebSpacing with:
   - sectionVertical: clamp(5rem, 8vw, 8rem), containerMax: 1280px
   - cardPadding, cardGap, buttonHeight variants

4. Export const WebMotion with:
   - easing curves: easeOutQuart, easeOutExpo, easeOutQuint
   - durations: instant(100ms), quick(200ms), standard(300ms), enter(500ms)
   - springSnappy, springSmooth, springHeavy Framer Motion configs

5. All as TypeScript const with "as const" assertion
6. Single named export + default object export

Output: Complete TypeScript file, no TODOs, strict types, JSDoc on each token group.
```

---

### Prompt F-04: Next.js 15 App Router Init

```
KIRO TASK: Configure Next.js 15 App Router for PoultryPulse AI pre-login website.

Create/update: apps/web/app/layout.tsx

Requirements:
1. Root metadata object (generateMetadata):
   - title: { template: '%s | PoultryPulse AI', default: 'PoultryPulse AI — गोरखपुर मुर्गी भाव AI | 95%+ Accuracy' }
   - description: 'India's first AI for commercial poultry price intelligence...'
   - metadataBase: new URL('https://poultrypulse.ai')
   - themeColor: '#1A6B3C'
   - viewport with mobile optimisation

2. Google Fonts via next/font/google:
   - Sora: weight ['400','700','800'], subset ['latin','latin-ext']
   - Plus_Jakarta_Sans: weight ['400','500','600','700']
   - Noto_Sans_Devanagari: weight ['400','500','700'], subset ['devanagari']
   - Apply as CSS variables: --font-sora, --font-jakarta, --font-devanagari
   - font-display: swap on all

3. HTML element: lang="hi" by default
   (Client-side LanguageProvider will switch this dynamically)

4. Body classes: antialiased + font variables applied

5. Include:
   - <SkipToContent /> component (first element in body)
   - <AnnouncementBanner /> (above nav)
   - <FloatingNav /> 
   - {children}
   - <Footer />
   - <PopupProvider>{children}</PopupProvider>
   - <Analytics /> from @vercel/analytics

6. Import global CSS: styles/globals.css, styles/animations.css, styles/reduced-motion.css

Output: Complete layout.tsx file. TypeScript strict. No any types.
```

---

## 2. KIRO EXECUTION PROMPTS — HOMEPAGE SECTIONS

### Prompt B-01: Hero Section

```
KIRO TASK: Build the PoultryPulse AI homepage hero section component.

Create file: apps/web/components/home/HeroSection.tsx
Mark as 'use client' (needs Framer Motion + state for price ticker).

VISUAL DESIGN:
- Full-viewport-height (min-h-[100dvh]), heroGradient background
- CSS noise overlay: fixed, pointer-events-none, opacity-[0.025], 
  background-image repeating noise pattern

LEFT COLUMN (content):
1. Eyebrow badge component:
   Hindi: "गोरखपुर का नं. 1 मुर्गी भाव सलाहकार"
   Style: pill, brandGreen50/20 bg, white text, 11px, tracking-widest, uppercase

2. H1 (two-line, white):
   Hindi: "जानें बिल्कुल सही वक्त — कब बेचें अपना झुंड"
   English: "Know Exactly When to Sell Your Flock"
   Font: Sora 800 weight, clamp(2.5rem, 5vw+1rem, 4.5rem)
   Word-reveal entrance animation (FadeUp with 100ms stagger between words)
   NOTE: Use opacity-only animation for Hindi (no transform — Devanagari safety rule)

3. Sub-headline (white/85):
   Hindi: "भारत का पहला AI जो 7 दिन पहले बताता है ब्रॉयलर का भाव — 95% से ज़्यादा सटीकता"
   Font: Plus Jakarta Sans, clamp(1.0625rem, 0.5vw+0.875rem, 1.25rem)
   Max-width: 520px

4. CTA block (flex row, gap-3, flex-wrap on mobile):
   Primary: Button variant="primary" size="lg" trailingArrow href="/signup?utm_source=homepage&utm_medium=hero"
     Text: "14 दिन मुफ़्त शुरू करें"
   Secondary: Button variant="secondary" size="lg" (white border on dark bg)
     Text: "Live Demo देखें" + play icon
     onClick: opens DemoModal via usePopup() hook
   
5. Trust micro-text (white/60, 12px, mt-3):
   "कोई credit card नहीं • कभी भी रद्द करें • 14 दिन मुफ़्त"

6. Social proof strip:
   5 overlapping circular avatars (40px each, -ml-3 for overlap)
   Text: "200+ किसान पहले से जुड़े हैं"
   Customer count: fetch server-side from Supabase, pass as prop
   Fallback: hardcoded "200+" if fetch fails

RIGHT COLUMN (phone mockup):
- Import and render <PriceTickerMockup /> component 
  (from apps/web/components/motion/PriceTickerMockup.tsx)
- Wrap in FadeUp delay=0.4s

ENTRANCE ANIMATION:
- Left column: FadeUp stagger (eyebrow → h1 → sub → CTAs → social proof)
  Delays: 0, 0.15, 0.3, 0.45, 0.6 seconds
- Right column: FadeUp delay=0.4s

RESPONSIVE:
- Desktop (lg+): 2-column grid (7:5 ratio)
- Mobile (<lg): single column, phone mockup below text
- Phone mockup: hidden on xs, shown from sm+

ANALYTICS: 
- Primary CTA click → trackEvent('hero_cta_click', {source:'hero', variant:'primary'})
- Secondary CTA click → trackEvent('demo_modal_open', {source:'hero'})

ACCESSIBILITY:
- H1 is the page's only H1
- Decorative noise overlay: aria-hidden="true"
- Phone mockup: role="img" aria-label="PoultryPulse AI price signal demonstration"
- Trust strip avatars: aria-hidden="true"

Output: Complete component file. TypeScript strict. All edge cases handled. No placeholder comments.
```

---

### Prompt B-04: Accuracy Section

```
KIRO TASK: Build the accuracy proof section for PoultryPulse AI homepage.

Create file: apps/web/components/home/AccuracySection.tsx
Split into: Server Component (data fetch) + Client sub-components (chart, counters)

DATA FETCHING (server-side):
- Import createClient from @/utils/supabase/server
- Query: SELECT * FROM mv_accuracy_dashboard LIMIT 1
- On error/null: return demo data object with is_demo: true flag

COMPONENT STRUCTURE:
'use server' parent that passes data to client children.

LAYOUT:
Background: brandGreen700 (dark green)
Padding: section-vertical
Inner: max-width 1280px, 2 columns (content left, chart right) on desktop

LEFT COLUMN:
1. EyebrowBadge: "सत्यापित सटीकता" — white/70 text on transparent bg
2. H2: "95%+ सटीकता — लॉन्च से पहले सिद्ध" — white, displayLarge
3. 4 stat metric cards (2×2 grid):
   
   Card 1: CountUp end={data.directional_accuracy} suffix="%" decimals={1}
   Label: "Directional Accuracy"
   Sub: "6 महीने के Gorakhpur data पर"
   Colour: green if ≥95%, amber if 90-95%, red if <95%
   
   Card 2: CountUp end={data.mape} suffix="%" decimals={1}
   Label: "Mean Absolute % Error"
   Sub: "Target था <6% — हम पहुँचे"
   Colour: green if <6%, amber if 6-8%, red if >8%
   
   Card 3: CountUp end={data.conformal_coverage} suffix="%" decimals={1}
   Label: "Conformal Coverage (P10–P90)"
   Sub: "Actual price within confidence range"
   
   Card 4: Static "7 दिन"
   Label: "Forward Prediction Window"
   Sub: "Industry standard is 1-2 days"
   
   When is_demo=true: append "(Demo)" to each stat label

4. Methodology 4-point list (white/80 text):
   Each: green checkmark icon + brief statement
   
5. Guarantee statement:
   "अगर कभी 95% से नीचे जाए accuracy, हम उस महीने का पूरा पैसा वापस करेंगे।"
   Style: large white text, green underline decoration (CSS, not SVG)
   
6. Link: "पूरी Accuracy Report →" → /accuracy

RIGHT COLUMN:
<AccuracyChartClient data={chartData} /> — separate client component
Recharts AreaChart, last 30 days predicted P50 vs actual
When is_demo: shows simulated data with demo label

ACCURACY GATE RULE:
If NEXT_PUBLIC_ACCURACY_GATE_CLEARED !== 'true':
  - Replace CountUp stats with "Validating..." text (pulsing dots)
  - Show: "95% accuracy gate validation in progress — launching soon"
  - Do NOT show any live accuracy numbers

ACCESSIBILITY:
- Chart: aria-label="30-day accuracy chart showing predicted vs actual prices"
- Hidden <table> with chart data for screen readers
- Counter animations: instant with prefers-reduced-motion
- All text on brandGreen700: verify passes AA contrast

Output: Server component + AccuracyChartClient.tsx client component.
TypeScript strict. Demo fallback tested. Gate condition handled.
```

---

## 3. KIRO EXECUTION PROMPTS — API ROUTES

### Prompt E-01: Lead Capture API

```
KIRO TASK: Build the lead capture API endpoint for PoultryPulse AI.

Create file: apps/web/app/api/leads/route.ts
Runtime: edge (export const runtime = 'edge')

IMPORTS NEEDED:
- NextRequest, NextResponse from 'next/server'
- createClient from @/utils/supabase/server
- z from 'zod'

REQUEST SCHEMA (Zod):
const LeadSchema = z.object({
  phone: z.string()
    .regex(/^[6-9]\d{9}$/, { message: 'कृपया सही 10-digit mobile number दर्ज करें' }),
  source: z.enum(['exit_intent','whatsapp_demo','blog_scroll','hero','pricing','faq','nav','homepage_cta']),
  district: z.enum(['gorakhpur','deoria','kushinagar','basti','maharajganj','sant_kabir_nagar']).optional(),
  plan: z.enum(['pulsefarm','pulsepro','pulseintel']).optional(),
  consent_given: z.literal(true, { errorMap: () => ({ message: 'DPDP consent आवश्यक है' }) }),
  utm: z.object({
    source: z.string().max(100).optional(),
    medium: z.string().max(100).optional(),
    campaign: z.string().max(100).optional(),
  }).optional(),
});

RATE LIMITING:
- Use in-memory Map for Edge (NOT Redis in Edge — no external connection)
- Key: hashed IP (crypto.subtle.digest SHA-256)
- Limit: 5 requests per IP per hour
- If exceeded: return 429 with { error: 'बहुत ज़्यादा requests — 1 घंटे बाद try करें' }

POST HANDLER:
1. Parse body, validate with LeadSchema
   - On invalid: return 400 with { errors: zodError.flatten().fieldErrors }
   - All error messages in Hindi (use custom error messages in Zod schema)
   
2. Apply rate limit check

3. Supabase upsert:
   Table: 'leads'
   Data: { phone, source, district, plan, consent_given, utm_source, utm_medium, utm_campaign, 
           ip_hash (SHA-256 of IP — DPDP compliance, never store raw IP) }
   Conflict: on_conflict='phone' → update source, updated_at only if source differs
   
4. On success: return 200 with { success: true, message: 'कल सुबह signal मिलेगा' }
5. On Supabase error: log error (don't expose to client), return 500 with generic Hindi message

CORS: Only allow POST method, reject OPTIONS with 405

Output: Complete Edge route.ts. Zod validation. Rate limiting. Hindi error messages. 
DPDP compliance (IP hashing). No any types.
```

---

## 4. KIRO EXECUTION PROMPTS — ONBOARDING

### Prompt OB-07: Plan Confirmation Step (Currency Gate)

```
KIRO TASK: Build the Plan Confirmation step (OB-05) of PoultryPulse AI onboarding.
This step contains the CURRENCY IMMUTABILITY GATE — a P0 launch blocker.

Create file: apps/web/components/onboarding/PlanConfirmStep.tsx
'use client'

PROPS:
interface PlanConfirmStepProps {
  recommendedPlan: 'PULSE_FARM' | 'PULSE_PRO';
  flockRange: string;
  onConfirm: (plan: 'PULSE_FARM' | 'PULSE_PRO' | 'PULSE_INTEL') => void;
  onBack: () => void;
}

UI DESIGN:
1. Headline: "आपका plan confirm करें" (large, neutral-900)
2. Sub-copy: "14 दिन बिल्कुल मुफ़्त — कोई credit card नहीं" (neutral-500)

3. PLAN CARD (large, prominent):
   Show recommendedPlan details:
   
   PulseFarm card:
   - Name: "PulseFarm" (Sora, 24px, bold)
   - Price: "₹2,000/माह" with "14 दिन मुफ़्त" green badge
   - "₹67/दिन — चाय से भी कम" micro-copy below price
   - Feature list (5 items, green checkmarks, Plus Jakarta Sans 14px):
     ✓ Daily WhatsApp sell signal (6:30 AM)
     ✓ 7-day price forecast (P10/P50/P90)  
     ✓ Gorakhpur belt mandi coverage
     ✓ HPAI disease alerts
     ✓ Hindi-first mobile app
   - "After trial: ₹2,000/माह या ₹20,000/साल (2 महीने मुफ़्त)" caption
   
   PulsePro card (if recommended):
   - Show similarly with ₹8,000/माह and integrator features

4. CURRENCY IMMUTABILITY WARNING (important — show clearly):
   Callout box (amber tint):
   "⚠️ एक बार confirm करने के बाद plan lock हो जाएगा।
    Trial में कभी भी upgrade/downgrade हो सकती है — account settings से।
    लेकिन भुगतान setup एक बार set होने के बाद change नहीं होगा।"

5. Downgrade option (if PulsePro shown):
   Text link: "← PulseFarm से शुरू करना चाहते हैं?" (brandGreen700, underline)
   onClick: shows PulseFarm card instead

6. CONFIRM CTA:
   "14 दिन का free trial शुरू करें →" (Button variant="primary" size="lg" fullWidth)
   Sub-CTA text: "कोई payment अभी नहीं — trial के बाद option मिलेगा"
   
7. Back link: "← पिछला" (top of screen, 44px touch target)

CURRENCY IMMUTABILITY GATE IMPLEMENTATION:
On confirm button click:
  1. Call onConfirm(selectedPlan)
  2. Parent OnboardingProvider calls: POST /api/onboarding/state 
     with { step: 'OB-05', plan_confirmed: selectedPlan }
  3. API endpoint sets plan_locked_at: new Date().toISOString() in Supabase
  4. After plan_locked_at is set, the /api/customers/[id]/plan endpoint 
     will REJECT any changes without admin override (check plan_locked_at !== null)
  
ANIMATION:
- Enter: FadeUp from right (slide transition from previous step)
- Plan card: subtle scale-in (0.95 → 1.0, 400ms easeOutQuart)
- Confirm button: no loading spinner — navigate immediately on click

ACCESSIBILITY:
- Plan features list: role="list" with proper li elements
- Warning callout: role="alert" or aria-live="polite"
- CTA: aria-describedby pointing to warning text

Output: Complete component. TypeScript strict. Currency gate logic documented inline.
No placeholder comments. Handles both PulseFarm and PulsePro variants.
```

---

## 5. KIRO EXECUTION PROMPTS — DASHBOARD

### Prompt DB-01: Overview Dashboard Page

```
KIRO TASK: Build the Overview page for PoultryPulse AI web dashboard.

File structure:
  apps/web/app/(dashboard)/overview/page.tsx  (Server Component — SSR data)
  apps/web/components/dashboard/overview/KPICards.tsx  ('use client' — animations)
  apps/web/components/dashboard/overview/ForecastChart.tsx  ('use client' — Recharts)
  apps/web/components/dashboard/overview/AlertsFeed.tsx  ('use client' — Realtime)
  apps/web/components/dashboard/overview/MandiTable.tsx  (Server Component)

SERVER COMPONENT (page.tsx):
1. Auth check: get session, if no session → redirect('/login?redirect=/dashboard/overview')
2. Role check: if role === 'S1' → redirect('/dashboard/mobile-only')
3. Fetch in parallel (Promise.all):
   - Latest predictions for all 5 mandis (Supabase)
   - Accuracy metrics (mv_accuracy_dashboard)
   - Active alerts count by district
   - Customer's district/plan from profile
4. Pass as props to client sub-components via Server → Client boundary

KPI CARDS (KPICards.tsx, 'use client'):
4 cards in CSS Grid (grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6):

Card 1: "आज का P50 भाव"
- Value: latest P50 for customer's primary mandi (₹168/kg)
- Trend: ± vs yesterday (green up arrow / red down arrow)
- Mandi label below value
- Left border: 3px brandGreen700
- CountUp animation on mount

Card 2: "Sell Signal"
- Value: signal label in Hindi (big, 20px font)
- Signal badge: SELL_NOW=green, HOLD=amber, CAUTION=red
- Signal strength: ●●●●○ (dot indicators from confidence score)
- No CountUp — static label

Card 3: "30-Day Accuracy"
- If NEXT_PUBLIC_ACCURACY_GATE_CLEARED !== 'true': show "Validating..." not a number
- Else: CountUp end={accuracy.directional_accuracy_30d} suffix="%"
- Colour coding: green ≥95%, amber 90-95%, red <95%
- Gate indicator badge: ✓ PASS or ✗ FAIL

Card 4 (admin) / "Coverage" (S2):
- Admin: "Active Customers" count
- S2: "Districts Covered" count
- CountUp on mount

FORECAST CHART (ForecastChart.tsx, 'use client'):
- Recharts AreaChart, height 300px
- Must always show P10, P50, P90 bands (three separate Area components)
- P50: stroke brandGreen700, strokeWidth 2, solid
- P10/P90: stroke brandGreen300, strokeWidth 1, strokeDasharray "4 4"
- Actual prices: Scatter plot, saffronOrange dots
- Today marker: ReferenceLine vertical dashed
- Tooltip: shows all three bands + actual if available
- aria-label on ResponsiveContainer
- Hidden <table> with data for screen readers (visually hidden but accessible)

ALERTS FEED (AlertsFeed.tsx, 'use client'):
- Supabase Realtime subscription on alerts table
- Shows max 5 recent alerts
- Each: coloured left border by type (HPAI=red, weather=amber, price=blue, policy=grey)
- Empty state: Pullu illustration + "सब ठीक है!" (never blank div)
- "सभी Alerts →" link to /dashboard/alerts

MANDI TABLE (MandiTable.tsx, Server Component):
- 5 rows (all mandis), columns: Mandi | P50 | Change (24h) | Signal | Updated
- Signal: colour-coded badge
- Change: red if negative, green if positive
- CSV download button (calls /api/export/predictions)
- th scope="col" on all headers
- Accessible sort: aria-sort attribute
- Striped rows alternating white/neutral-50

DATA REFRESH:
- SWR with refreshInterval: 600_000 (10 minutes) on all client components
- Manual refresh button in DashboardHeader triggers SWR mutate()
- After refresh: price-update-pulse animation on updated P50 value

Output: All 5 files. TypeScript strict. SSR + client split correct. 
P10/P50/P90 always visible. Empty states handled. Real-time alerts working.
```

---

## 6. KIRO EXECUTION PROMPTS — SEO

### Prompt SEO-01: Complete Schema Implementation

```
KIRO TASK: Implement all JSON-LD schema markup for PoultryPulse AI homepage.

Update file: apps/web/app/(marketing)/page.tsx

Add the following schemas as JSON-LD scripts in the page's <head> via Next.js metadata:

1. ORGANIZATION SCHEMA:
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "PoultryPulse AI",
  "legalName": "PoultryPulse AI Technologies Pvt. Ltd.",
  "url": "https://poultrypulse.ai",
  "logo": { "@type": "ImageObject", "url": "https://poultrypulse.ai/logo.png", "width": 400, "height": 133 },
  "description": "India's first AI-powered broiler price intelligence platform for commercial poultry farmers in Uttar Pradesh.",
  "address": { "@type": "PostalAddress", "addressLocality": "Gorakhpur", "addressRegion": "Uttar Pradesh", "addressCountry": "IN" },
  "contactPoint": { "@type": "ContactPoint", "contactType": "customer support", "availableLanguage": ["Hindi", "English"] },
  "foundingDate": "2026",
  "knowsAbout": ["Poultry price forecasting", "Broiler market intelligence", "Agricultural AI", "AGMARKNET data analysis"]
}

2. WEBSITE SCHEMA with SearchAction:
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "PoultryPulse AI",
  "url": "https://poultrypulse.ai",
  "potentialAction": {
    "@type": "SearchAction",
    "target": { "@type": "EntryPoint", "urlTemplate": "https://poultrypulse.ai/blog?q={search_term_string}" },
    "query-input": "required name=search_term_string"
  }
}

3. FAQPAGE SCHEMA (all 8 FAQ items):
Use generateFAQSchema() utility with these exact Q&A pairs:
  Q: "PoultryPulse AI कितना सटीक है?" → A: [full answer from 01_prelogin_design_master.md §H-09 Q1]
  [Include all 8 FAQ items from design doc §H-09]

4. HOWTO SCHEMA (3 steps):
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "PoultryPulse AI कैसे काम करता है",
  "description": "3 कदम में समझें कैसे PoultryPulse AI सटीक मुर्गी भाव अनुमान देता है",
  "step": [
    { "@type": "HowToStep", "name": "डेटा संग्रह", "text": "47 सार्वजनिक स्रोतों से data 4:30 AM पर collect होता है", "position": 1 },
    { "@type": "HowToStep", "name": "AI भविष्यवाणी", "text": "LightGBM + TFT model 7-day P10/P50/P90 prediction बनाता है", "position": 2 },
    { "@type": "HowToStep", "name": "Signal Delivery", "text": "6:30 AM पर WhatsApp और app पर sell signal मिलता है", "position": 3 }
  ]
}

Implementation approach:
- Use Next.js Script component or <script type="application/ld+json"> in page metadata
- Validate all schemas at https://validator.schema.org before PR merge (add to CI notes)
- Create utility: apps/web/lib/schemas/index.ts that exports all schema generators

Output: Updated page.tsx + lib/schemas/index.ts. All 4 schemas valid JSON-LD.
```

---

## 7. CRITICAL CODE PATTERNS REFERENCE

### 7.1 Supabase Server vs Client Usage

```typescript
// ✅ CORRECT: Server Component (RSC, no 'use client')
import { createClient } from '@/utils/supabase/server';

export default async function AccuracyPage() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('mv_accuracy_dashboard')
    .select('*')
    .single();
  
  return <AccuracySection data={data} />;
}

// ✅ CORRECT: Client Component (with SWR)
'use client';
import { createClient } from '@/utils/supabase/client';
import useSWR from 'swr';

const fetcher = async (url: string) => {
  const supabase = createClient();
  const { data } = await supabase.from('predictions').select('*');
  return data;
};

// ❌ WRONG: Using service_role in client component
// SUPABASE_SERVICE_ROLE_KEY must NEVER appear in 'use client' files
```

### 7.2 Language-Aware Copy Pattern

```typescript
// ✅ CORRECT: Language context pattern
'use client';
import { useLanguage } from '@/providers/LanguageProvider';

export function HeroHeadline() {
  const { locale } = useLanguage();
  return (
    <h1 className={locale === 'hi' ? 'font-[Noto_Sans_Devanagari] leading-relaxed' : ''}>
      {locale === 'hi'
        ? 'जानें बिल्कुल सही वक्त — कब बेचें अपना झुंड'
        : 'Know Exactly When to Sell Your Flock'}
    </h1>
  );
}

// NOTE for Devanagari: always use leading-relaxed (1.625) minimum
// Never leading-tight with Devanagari text — matras get clipped
```

### 7.3 Analytics Event Pattern

```typescript
// ✅ CORRECT: Event tracking pattern
import { trackEvent } from '@/lib/analytics';

// In component:
const handleCtaClick = () => {
  trackEvent('hero_cta_click', {
    source: 'hero',
    variant: 'primary',
    plan: selectedPlan ?? null,
    locale: currentLocale,
  });
  // Then navigate / open modal
};

// trackEvent is fire-and-forget (async, non-blocking):
// Does NOT await — never block user action on analytics
```

### 7.4 Error Handling Pattern (Don Norman Rule)

```typescript
// ✅ CORRECT: Human-friendly Hindi error
if (error) {
  return (
    <ErrorState
      variant="network-error"
      headingHi="इंटरनेट से जुड़ने में समस्या"
      messageHi="अपना internet connection check करें और दोबारा कोशिश करें।"
      onRetry={() => mutate()}
    />
  );
}

// ❌ WRONG: Raw error exposure
if (error) return <div>Error: {error.message}</div>;
if (error) return <div>500 Internal Server Error</div>;
```

### 7.5 Never-Blank Data Pattern

```typescript
// ✅ CORRECT: Skeleton → data → empty state (never blank)
export function AlertsFeed({ initialData }: { initialData: Alert[] | null }) {
  const { data, isLoading } = useSWR('/api/alerts', fetcher, { fallbackData: initialData });
  
  if (isLoading && !initialData) {
    return <AlertCardSkeleton count={3} />; // Skeleton matches content shape
  }
  
  if (!data || data.length === 0) {
    return <EmptyState variant="no-alerts" />; // Friendly illustration
  }
  
  return <AlertList alerts={data} />;
}

// ❌ WRONG:
if (isLoading) return null;  // blank!
if (!data) return null;       // blank!
```

---

## 8. DEPENDENCY MANIFEST

### 8.1 Required NPM Packages

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
    "@playwright/test": "^1.44.0"
  }
}
```

---

## 9. FINAL LAUNCH CHECKLIST (Quick Reference)

```
TECHNICAL P0 (must pass before first customer):
  □ Accuracy gate: directional ≥95%, MAPE <6% on Gorakhpur 30-day holdout
  □ All P0 tasks complete (see 09_kiro_implementation_manifest.md §3)
  □ TypeScript: npx tsc --noEmit passes with 0 errors
  □ ESLint: 0 errors, 0 warnings
  □ Lighthouse mobile: Performance ≥85, Accessibility ≥90
  □ E2E tests: all passing (npx playwright test)
  □ /api/health: returns {status:'ok', supabase:true}
  □ NEXT_PUBLIC_ACCURACY_GATE_CLEARED=true in Vercel production env

CONTENT P0:
  □ All Hindi copy reviewed by native UP speaker
  □ Legal pages live: /privacy, /terms, /refund
  □ FAQ page live: /faq
  □ Homepage all 11 sections rendering
  □ Pricing page live: /pricing

DPDP/LEGAL P0:
  □ All consent checkboxes unchecked by default
  □ Privacy policy includes DPDP §5 data categories
  □ Data stored only in Supabase ap-south-1 (Mumbai)
  □ IP addresses hashed (not stored raw) in all logs
  □ Right to erasure endpoint functional: /api/account/delete

WHATSAPP P0:
  □ WhatsApp Business API approved by Meta
  □ All 3 message templates approved
  □ Test message delivery working (OB-06 step)
  □ 6:30 AM scheduled job configured and tested

MONITORING P0:
  □ Better Uptime: monitors for /, /api/health, /pricing
  □ Alert channel configured (Slack/email)
  □ Vercel Analytics enabled
  □ Error tracking configured
```

---

## 10. DOCUMENT COMPLETION SUMMARY

All 12 implementation documents are complete. Total output:

| File | Purpose | Pages Covered |
|------|---------|---------------|
| 01_prelogin_design_master.md | Pre-login UI/UX — complete visual spec | 17 pages |
| 02_prelogin_requirements_master.md | Functional requirements + SEO + DPDP | 50+ FRs |
| 03_prelogin_tasks_master.md | Kiro task list + code scaffolds | 90+ tasks |
| 04_postlogin_design_master.md | Dashboard UI/UX — 9 pages | 9 pages |
| 05_postlogin_requirements_tasks.md | Dashboard requirements + tasks | 40+ FRs |
| 06_content_seo_master.md | SEO strategy + 10 article briefs + keywords | 100+ keywords |
| 07_motion_animation_master.md | Complete animation library | 20+ components |
| 08_external_assets_press_master.md | Press, psychology, CRO, referral | Full strategy |
| 09_kiro_implementation_manifest.md | Master orchestration + launch checklist | 100+ tasks indexed |
| 10_auth_onboarding_design_master.md | Auth + 10-state onboarding | 10 screens |
| 11_industry_pages_components_master.md | S2–S6 pages + UI components | 5 segment pages |
| 12_implementation_quick_reference.md | Kiro prompts + code patterns + deps | 8 exec prompts |

**Grand total: ~7,800+ lines of specification, 300KB+ of implementation-ready documentation**
**Estimated implementation: 450–500 engineering hours for complete platform**
**P0 critical path: ~200 hours / 6 weeks (3 engineers)**
```

---

*Document: 12_implementation_quick_reference.md*
*PoultryPulse AI — Full Website Implementation Suite Complete*
*© 2026 PoultryPulse AI Technologies Pvt. Ltd. | CONFIDENTIAL*
