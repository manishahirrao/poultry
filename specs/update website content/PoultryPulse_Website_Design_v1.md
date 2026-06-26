# PoultryPulse AI — Pre-Login Website Design Specification
**Document Type:** Website Design Specification (Kiro-Compatible)  
**Version:** 1.0 · May 2026  
**Classification:** CONFIDENTIAL — Engineering & Design Use  
**Author:** Senior Software Head · Apple Design Philosophy + B2B SaaS Growth Layer  
**References:** Website Requirements v1.0, UI/UX Design v1.0, Dashboard Design v1.0  
**Platform:** Next.js 15 App Router · Tailwind CSS · Framer Motion

---

## 1. Design Philosophy — The B2B SaaS Marketing Standard

The pre-login website must look like it belongs in the same conversation as Stripe, Linear, and Vercel — not like an agri-tech startup from 2019. That aesthetic gap is a positioning gap. Enterprise buyers (S5) judge credibility from the website before reading a single word. The design must signal: *precision, trust, and technical sophistication* — while remaining instantly comprehensible to a Hindi-speaking farmer on a ₹12,000 Android phone.

This is a dual-audience design problem. The solution is not a compromise — it is a hierarchy:

> **Mobile-first structure. Premium B2B aesthetic. Hindi-first copy. Data-forward trust signals.**

Every design decision is evaluated against this hierarchy in order.

### 1.1 Design Principles (Website-Specific)

| Principle | Rule | Never |
|---|---|---|
| **Data builds trust** | Show live accuracy numbers above the fold | Hide accuracy behind a CTA click |
| **Rupees over features** | Lead with ₹ ROI, not feature names | Open with a feature list |
| **Hindi voice, not Hindi translation** | Copy sounds like a Gorakhpur farmer, not a textbook | Use formal Shuddh Hindi that farmers don't use |
| **Premium restraint** | White space > decoration | Fill every section with graphics |
| **Proof over claim** | Show the 30-day prediction history table | Just say "95% accurate" |
| **One next step per section** | Every section ends with exactly one CTA | Offer 3 competing CTAs |

### 1.2 Website Design Token Extensions

The website extends the existing UI/UX Design v1.0 token system with marketing-specific additions:

```css
/* WEBSITE-SPECIFIC DESIGN TOKENS */

/* Hero & Marketing Sections */
--hero-gradient-start: #FFFFFF;
--hero-gradient-end: #E8F5EE;          /* brand-green-50 */
--hero-headline-size: clamp(40px, 5vw, 72px);  /* Fluid typography */
--hero-sub-size: clamp(18px, 2vw, 24px);

/* Dark Sections (accuracy strip, CTAs) */
--section-dark-bg: #1C2B22;            /* neutral-900 */
--section-dark-text: #FFFFFF;
--section-dark-accent: #4CAF82;        /* lighter green for dark bg */

/* Card Variants */
--card-feature-bg: #FFFFFF;
--card-feature-border: rgba(26,107,60,0.12);
--card-feature-hover-border: #1A6B3C;
--card-problem-bg: #FFF8F8;
--card-problem-accent: #C0392B;        /* red-600 */

/* Testimonial Cards */
--card-testimonial-bg: #F7FDFB;
--card-testimonial-border: #E8F5EE;
--card-testimonial-quote-color: rgba(26,107,60,0.15);

/* Navigation */
--nav-height: 72px;
--nav-bg-transparent: rgba(255,255,255,0);
--nav-bg-scrolled: rgba(255,255,255,0.92);
--nav-backdrop-blur: blur(12px);
--nav-border-scrolled: rgba(26,107,60,0.1);

/* Section Spacing */
--section-padding-y: clamp(64px, 8vw, 120px);
--section-padding-x: clamp(20px, 5vw, 80px);
--section-max-width: 1280px;

/* Typography — Marketing Scale */
--text-display: clamp(48px, 6vw, 80px);   /* Hero headlines */
--text-h1: clamp(36px, 4vw, 56px);
--text-h2: clamp(28px, 3vw, 40px);
--text-h3: clamp(22px, 2.5vw, 32px);
--text-body-lg: clamp(17px, 1.5vw, 20px);
--text-body: 16px;
--text-caption: 14px;

/* Animation */
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
--ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
--duration-fast: 150ms;
--duration-standard: 250ms;
--duration-slow: 400ms;
--duration-feature-tab: 300ms;
```

### 1.3 Typography System (Website)

Marketing copy uses the same Noto Sans Devanagari for Hindi but adds IBM Plex Sans for English B2B sections (consistent with Dashboard Design v1.0 §1.3):

| Style | Hindi Font | English Font | Size | Weight | Use |
|---|---|---|---|---|---|
| `display` | Noto Sans Devanagari | IBM Plex Sans | clamp(48–80px) | 800 | Hero headline |
| `h1` | Noto Sans Devanagari | IBM Plex Sans | clamp(36–56px) | 700 | Page titles |
| `h2` | Noto Sans Devanagari | IBM Plex Sans | clamp(28–40px) | 600 | Section titles |
| `h3` | Noto Sans Devanagari | IBM Plex Sans | clamp(22–32px) | 600 | Card titles |
| `body-lg` | Noto Sans Devanagari | IBM Plex Sans | clamp(17–20px) | 400 | Hero sub-copy |
| `body` | Noto Sans Devanagari | IBM Plex Sans | 16px | 400 | General copy |
| `caption` | Noto Sans Devanagari | IBM Plex Sans | 14px | 400 | Labels, meta |
| `mono` | — | IBM Plex Mono | 14px | 400 | Code blocks, API |
| `badge` | Noto Sans Devanagari | IBM Plex Sans | 13px | 500 | Badges, pills |

---

## 2. Global Layout Components

### 2.1 Navigation Bar

**File:** `src/app/(marketing)/components/Navigation.tsx`

```
Desktop (≥1024px):
┌──────────────────────────────────────────────────────────────────────────┐
│  🐔 PoultryPulse  │ Products ▾  Solutions ▾  Features  Pricing  Accuracy │  EN/हिं  │  [Request Demo]  [Login] │
└──────────────────────────────────────────────────────────────────────────┘

Mobile (<1024px):
┌──────────────────────────────────────────────────────────────────┐
│  🐔 PoultryPulse                    [Request Demo]  ☰            │
└──────────────────────────────────────────────────────────────────┘
```

**Scroll Behaviour:**
```css
/* Transparent → frosted glass transition */
.nav-transparent {
  background: transparent;
  border-bottom: 1px solid transparent;
}

.nav-scrolled {
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(26, 107, 60, 0.10);
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.04);
  transition: all 250ms ease-smooth;
}
```

**Products Dropdown Design:**
```
┌────────────────────────────────────────────────────────┐
│  PRODUCTS                                              │
│  ─────────────────────────────────────────────────    │
│  🌾 PulsePro                                          │
│     For commercial farms (10K–50K birds)              │
│     ₹2,000–5,000/month · 14-day free trial           │
│                                                        │
│  🏢 PulseEnterprise                                   │
│     For integrators, feed companies & QSR             │
│     Custom pricing · Demo required                    │
│                                                        │
│  ─────────────────────────────────────────────────    │
│  ✅ 96.2% Directional Accuracy · Live                 │
└────────────────────────────────────────────────────────┘
```

**Mobile Navigation Drawer (full-screen, from right):**
```
[✕ Close]
──────────────────────────
🏠 Home
📊 Features
💰 Pricing
✅ Accuracy
──────────────────────────
Solutions:
   Commercial Farms
   Integrators
   Feed Companies
   Enterprise
──────────────────────────
🌾 Farm Intelligence
👨‍💻 Developers
📋 Compliance
📰 Blog
ℹ️ About
──────────────────────────
[EN] [हिं]
──────────────────────────
[Request Demo]
[Login]
```

**Implementation Notes:**
- Nav is a Server Component except for: scroll state (client), language toggle (client), mobile drawer (client)
- Dropdown menus use CSS `:hover` with a `group-hover` Tailwind pattern — no JS for desktop
- Mobile drawer uses `Framer Motion AnimatePresence` for slide-in/out

---

### 2.2 Global Footer

**File:** `src/app/(marketing)/components/Footer.tsx`

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│  Live Accuracy Strip (scrolling marquee, dark green background):              │
│  मॉडल सटीकता: 96.2% दिशात्मक · MAPE: 4.8% · 847 पूर्वानुमान · आज 06:15 IST │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                                                               │
│  🐔 PoultryPulse AI          Product          Solutions        Company        │
│  सटीक भाव, सही फ़ैसला         PulsePro          Commercial Farms  About        │
│  ─────────────────            PulseEnterprise   Integrators       Blog         │
│  [App Store] [Play Store]     Features          Feed Companies    Developers   │
│                               Pricing           Enterprise        Compliance   │
│                               Accuracy          ──────────────    Contact      │
│  📞 WhatsApp: +91-XXXXX-XXXXX                   Legal                          │
│  📧 hello@poulse.ai           Privacy Policy · Terms · DPDP 2023 Notice       │
│                                                                               │
│  © 2026 PoultryPulse AI Pvt. Ltd. · Gorakhpur, Uttar Pradesh, India         │
│  Data hosted in AWS Mumbai (ap-south-1) · DPDP Act 2023 Compliant            │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Accuracy Marquee Component:**
```tsx
// Scrolling marquee — pure CSS animation, no JS
.marquee-track {
  display: flex;
  animation: marquee-scroll 30s linear infinite;
  gap: 64px;
}

@keyframes marquee-scroll {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
```
Duplicated content (2× for seamless loop). Pauses on hover.

---

## 3. Home Page Design Specification (`/`)

**File:** `src/app/(marketing)/page.tsx`

### 3.1 Hero Section

**Layout (Desktop):** 2-column grid, 60/40 split. Left: text + CTAs. Right: product mockup.  
**Layout (Mobile):** Single column. Text first, mockup below.

```
DESKTOP HERO:
┌──────────────────────────────────────────────────────────────────────────┐
│ [Navigation Bar — Transparent]                                           │
├──────────────────────────────────┬───────────────────────────────────────┤
│                                  │                                       │
│  [ACCURACY BADGE PILL]           │    ┌──────────────────────────────┐   │
│  ✅ Live: 96.2% Accurate · MAPE 4.8%  │    │    Phone Mockup (left)      │   │
│                                  │    │  ₹ 162.40                   │   │
│  ₹30,000 ज़्यादा                │    │  ↑ +2.3% · ⭐ SELL NOW      │   │
│  कमाएं हर बैच में।             │    │  ────────────────────────    │   │
│                                  │    │  Range: ₹158 – ₹168         │   │
│  AI-powered broiler price        │    └──────────────────────────────┘   │
│  forecast. 95%+ accuracy.        │                                       │
│  Know exactly when to sell.      │    ┌──────────────────────────────┐   │
│                                  │    │  Browser Dashboard (right)  │   │
│  [14 दिन मुफ़्त शुरू करें →]   │    │  [Chart + KPI cards mockup] │   │
│                                  │    └──────────────────────────────┘   │
│  [See How It Works]              │                                       │
│                                  │  "Join 150+ farms in Gorakhpur belt" │
│                                  │                                       │
└──────────────────────────────────┴───────────────────────────────────────┘
```

**Headline Render Rules:**
- Hindi: `"₹30,000 ज़्यादा कमाएं हर बैच में।"` — splits into 2 lines naturally
- English: `"Earn ₹30,000 More Per Batch."` — single line on desktop
- The rupee symbol ₹ is always larger (font-size + 8px) than surrounding text, using a `<span class="text-brand-green">₹</span>` highlight
- Headline animates in: words fade-up sequentially (staggered 100ms per word) on first mount

**Accuracy Badge Design:**
```
┌────────────────────────────────────────────────────────────┐
│ 🟢 Live  96.2% Directional Accuracy  ·  MAPE 4.8%         │
└────────────────────────────────────────────────────────────┘
```
- Green pulsing dot animation (CSS, not GIF)
- Pill shape: `border-radius: 999px`, `border: 1px solid rgba(26,107,60,0.3)`, `background: rgba(26,107,60,0.06)`
- Updates daily — ISR with 24-hour revalidation

**Product Mockup Component:**
```tsx
// src/app/(marketing)/components/ProductMockup.tsx
// CSS-only mockup — no images, no rasterization
// Renders as actual HTML/CSS that mirrors the real dashboard widget
// This means it loads instantly even on 3G
const ProductMockup = () => (
  <div className="mockup-phone">
    <div className="mockup-screen">
      <div className="price-display">
        <CountUp end={162.40} prefix="₹" decimals={2} duration={1.2} />
        <span className="price-unit">/kg</span>
      </div>
      <div className="direction-badge">↑ +2.3% vs कल</div>
      <div className="sell-badge sell">⭐ SELL NOW</div>
    </div>
  </div>
);
```

**CTA Button Hierarchy:**
```
Primary:   [14 दिन मुफ़्त शुरू करें →]
           bg: brand-green-700, text: white
           width: 100% mobile / 280px desktop
           height: 56px, radius: 999px (pill)
           font: 18px bold
           
Secondary: [See How It Works]
           text only, neutral-400, 16px
           underline on hover, chevron-right icon
           margin-top: 16px from primary
```

**Hero Social Proof (Partner Logo Row):**
```tsx
// Greyscale logos, 32px height, centered
// "Data Partners" label above in caption style
const DataPartners = () => (
  <div className="partner-strip">
    <p className="caption">Powered by verified government data</p>
    <div className="logo-row">
      <Logo name="AGMARKNET" />
      <Logo name="IMD" />
      <Logo name="NECC" />
      <Logo name="DAHDF" />
      <Logo name="NCDEX" />
    </div>
  </div>
);
```

---

### 3.2 Problem Section Design

**3-card grid** — each card uses a distinct problem color:

```
┌──────────────────────────────────────────────────────────────────────────┐
│  Why 80% of Gorakhpur farmers leave money on the table every batch        │
├────────────────────┬────────────────────┬──────────────────────────────  │
│  🕐                │  🦠                │  🤝                            │
│  ₹2–4/kg          │  HPAI Alert        │  ₹2/kg Stolen                 │
│  Lost Every Batch  │  Reaches You Late  │  By Middleman                 │
│                    │                    │                                │
│  "आप सुबह 3       │  "ट्रांसपोर्ट      │  "गोरखपुर में ₹8,          │
│  ट्रेडर को फ़ोन   │  बंद हो जाता है    │  लखनऊ में ₹10 —            │
│  करते हैं। वो भाव │  और तब पता        │  यह फ़र्क आपकी             │
│  बताते हैं।       │  चलता है।"        │  जेब से जाता है।"          │
│  कोई डेटा नहीं।"  │                    │                                │
│                    │  At 25K birds:     │  At 25K birds × 4kg:          │
│  At 25K birds:     │  ₹1L–5L total     │  ₹2L per batch lost           │
│  ₹30K–80K/batch   │  loss risk         │  to information gap           │
└────────────────────┴────────────────────┴──────────────────────────────  │
└──────────────────────────────────────────────────────────────────────────┘
```

Card design:
- Top accent bar: 4px solid (card 1: amber, card 2: red-600, card 3: amber)
- Large emoji: 48px
- Bold metric in brand-green-700: the ₹ loss number
- Hindi quote in italic body-1
- Financial impact line in caption at bottom: brand-green-700 color

---

### 3.3 Feature Tab Preview Section

**File:** `src/app/(marketing)/components/FeatureTabPreview.tsx`

```
SECTION HEADER:
  "Everything you need. Nothing you don't."
  "सब कुछ जो चाहिए। कुछ भी फालतू नहीं।"

TAB BAR:
  [📊 Price Intelligence] [✅ Sell Signal] [🌾 Farm Ops] [💊 Health] [🚨 Alerts]
  ─────────────────────────────────────────────────────────────────────────────
  Active tab: brand-green-700 border-bottom, brand-green-700 text
  Inactive: neutral-400 text, transparent
  
TAB CONTENT AREA (animates on tab change):
  Left: Feature description + 3 bullet benefits
  Right: Product screenshot/CSS mockup of that feature
```

**Tab 1: Price Intelligence**
```
Left:
  Headline: "95%+ Accurate. Every Day."
  "हमारा AI मॉडल 45 signals से आने वाले 7 दिन का ब्रॉयलर 
   भाव predict करता है — Gorakhpur मंडी के लिए, हर रात 
   06:00 बजे।"
  ✅ P10/P50/P90 confidence bands — always know the range
  ✅ Festival demand spikes predicted 7 days ahead
  ✅ HPAI zone impact modelled automatically
  [See Accuracy Report →]

Right: Price Trajectory Chart mockup (CSS-rendered Recharts-style chart)
       Shows 7-day actual + 7-day forecast with confidence band
       Animated: chart line draws itself on tab activation
```

**Tab 2: Sell Signal**
```
Left:
  Headline: "SELL, HOLD, or CAUTION. Every morning."
  "WhatsApp पर रोज़ सुबह 06:30 बजे: आज बेचें या रुकें।
   Financial impact आपके झुंड के size के हिसाब से।"
  ✅ SELL signal shows exact ₹ impact: "आज ₹43.2L"
  ✅ HOLD signal shows: "7 दिन रुकें = ₹2.8L ज़्यादा"
  ✅ Withdrawal period enforced — legal holds respected
  [Try the Batch Calculator →]

Right: Sell vs Hold matrix card mockup
       4 cards: Today/+3D/+7D/+14D with revenue estimates
       Optimal card highlighted in green
```

**Tab 3: Farm Operations**
```
Left:
  Headline: "DOC to harvest. Every data point."
  "बैच registration से harvest तक — FCR, mortality, 
   weight gain, vaccination — सब एक जगह।
   Manual entry से 3× तेज़। Offline भी काम करता है।"
  ✅ FCR auto-computed from daily feed logs
  ✅ Abnormal mortality alert fires in 60 seconds
  ✅ Vaccination reminders 24h before — WhatsApp + push
  [Explore Farm Intelligence →]

Right: Batch Status Board mockup (Kanban cards)
       3 cards in different columns, animated slide-in
```

**Tab 4: Health & Compliance**
```
Left:
  Headline: "FSSAI-ready. One click."
  "Vaccination schedule, medication records, FSSAI 
   traceability report — सब automatically generate होता है।
   Antibiotic-free certification tracking built-in।"
  ✅ FSSAI batch report PDF in < 5 seconds
  ✅ Antibiotic-free badge automatically tracked
  ✅ Biosecurity audit score with trend history
  [See Compliance Features →]

Right: FSSAI traceability report PDF mockup
       Shows batch details, vaccination records, AB-Free badge
```

**Tab 5: Smart Alerts**
```
Left:
  Headline: "Alerts that know your farm's impact."
  "HPAI alert 200km दूर है — ठीक है।
   लेकिन आपके झुंड में respiratory symptoms + HPAI nearby
   = तुरंत Critical alert सिर्फ आपके लिए।"
  ✅ Financial impact on YOUR flock: "~₹40K–₹80K risk"
  ✅ 8 alert types: Disease, weather, price, feed, mortality...
  ✅ Personalised thresholds — you decide what matters

Right: Alert card stack mockup
       3 stacked alert cards with severity colors
       Top card shows critical HPAI + financial impact
```

**Animation Pattern:**
```tsx
// Framer Motion tab transition
const tabVariants = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, x: -40, transition: { duration: 0.2 } }
};
```

---

### 3.4 Live Accuracy Strip (Dark Section)

**File:** `src/app/(marketing)/components/AccuracyStrip.tsx`

```
┌──────────────────────────────────────────────────────────────────────────┐
│ (Background: #1C2B22 — neutral-900)                                      │
│                                                                           │
│  MODEL ACCURACY — VERIFIED LIVE DATA        [See Full Report →]          │
│  ──────────────────────────────────────────────────────────────          │
│                                                                           │
│  96.2%              4.8%              80.1%           847                 │
│  Directional        MAPE              Conformal       Predictions         │
│  Accuracy           < 6% target ✅    Coverage        Verified            │
│                                                                           │
│  ──────────────────────────────────────────────────────────────          │
│  "Our model predicted the correct direction 96.2% of the time             │
│   across 847 verified daily predictions. We publish this live             │
│   because we have nothing to hide."                                       │
│                                                                           │
│  ⏱ Last updated: Today 06:15 IST                                        │
└──────────────────────────────────────────────────────────────────────────┘
```

**Counter Animation:**
```tsx
// Count-up animation on scroll into viewport (Intersection Observer)
// Numbers count from 0 to final value over 1.5 seconds
// Uses requestAnimationFrame for smooth performance
const AnimatedStat = ({ value, suffix, prefix }: StatProps) => {
  const { ref, inView } = useInView({ triggerOnce: true });
  return (
    <div ref={ref}>
      {inView && <CountUp start={0} end={value} suffix={suffix} duration={1.5} />}
    </div>
  );
};
```

**Typography in dark section:**
- Stat numbers: IBM Plex Mono, `var(--text-h1)`, white
- Stat labels: IBM Plex Sans, 14px, `rgba(255,255,255,0.6)`
- Quote: Noto Sans Devanagari / IBM Plex Sans, 18px italic, `rgba(255,255,255,0.85)`

---

### 3.5 Feature Grid Section

**12-card grid (3×4 desktop, 2×6 tablet, 1×12 mobile):**

```tsx
const featureCards = [
  { icon: "📊", title: "Price Forecast", desc: "7-day AI forecast with P10/P50/P90 confidence bands", badge: "Both" },
  { icon: "✅", title: "Sell Signal", desc: "Daily SELL NOW / HOLD / CAUTION with ₹ impact", badge: "Both" },
  { icon: "🧮", title: "Batch ROI Optimizer", desc: "Exact ₹ profit: sell today vs wait N days", badge: "Both" },
  // ...12 total
];
```

**Card Design:**
```
┌────────────────────────────────┐
│  📊                    [Pro]  │  ← Badge: green pill "PulsePro" or "Enterprise"
│                               │
│  Price Forecast               │  ← h3, neutral-900
│                               │
│  7-day AI forecast with       │  ← body, neutral-400, 2 lines max
│  P10/P50/P90 confidence bands │
│                               │
│  → Learn more                 │  ← Link, appears on hover only
└────────────────────────────────┘
```

Card interaction:
```css
.feature-card {
  border: 1px solid var(--card-feature-border);
  border-radius: 16px;
  padding: 24px;
  transition: all 200ms ease;
  cursor: pointer;
}

.feature-card:hover {
  border-color: var(--card-feature-hover-border);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(26, 107, 60, 0.12);
}
```

---

### 3.6 ROI Calculator Component

**File:** `src/app/(marketing)/components/RoiCalculator.tsx`

```
LAYOUT (Two-panel on desktop, stacked on mobile):
┌─────────────────────────────────────────────────────────────────┐
│  INPUT PANEL (Left, 45%)    │  RESULT PANEL (Right, 55%)       │
│                              │                                  │
│  मेरे पास:                  │  PoultryPulse से आपकी            │
│  [25,000 ▾] पक्षी हैं       │  अतिरिक्त कमाई:                 │
│                              │                                  │
│  औसत वज़न:                  │  ₹ 1,08,000                    │
│  [2.0 kg ▾]                  │  प्रति वर्ष                     │
│                              │                                  │
│  बिक्री:                    │  कैसे:                          │
│  [2 बार/महीना ▾]            │  ₹1.50/bird avg improvement     │
│                              │  × 25,000 birds                 │
│                              │  × 3 batches/year               │
│                              │  = ₹1,12,500/year               │
│                              │  − ₹36,000 subscription         │
│                              │  = ₹76,500 net ROI              │
│                              │                                  │
│                              │  ROI: 2.1×                      │
│                              │                                  │
│                              │  [14 दिन मुफ़्त शुरू करें →]  │
└─────────────────────────────────────────────────────────────────┘
```

**Calculator Logic (pure TypeScript, no API):**
```typescript
const calculateRoi = (flockSize: number, avgWeightKg: number, batchesPerYear: number): RoiResult => {
  const improvementPerBird = 1.50;  // ₹/bird conservative estimate
  const annualRevenueGain = flockSize * avgWeightKg * improvementPerBird * batchesPerYear;
  const subscriptionCost = getSubscriptionCost(flockSize) * 12;
  const netRoi = annualRevenueGain - subscriptionCost;
  const roiMultiple = annualRevenueGain / subscriptionCost;
  return { annualRevenueGain, subscriptionCost, netRoi, roiMultiple };
};
```

Result panel **animates** on input change:
- Numbers count up/down with `CountUp` (100ms duration for interactive updates)
- "ROI: X×" badge pulses green briefly when ROI > 2×

---

### 3.7 Testimonials Section

**File:** `src/app/(marketing)/components/Testimonials.tsx`

```
LAYOUT: 3-column grid (desktop), carousel (mobile, swipeable)

┌──────────────────────────────────────────────────────────────────────────┐
│  "What farmers in Gorakhpur are saying"                                   │
│  "गोरखपुर के किसान क्या कह रहे हैं"                                    │
├─────────────────────┬───────────────────────┬─────────────────────────  │
│  [LARGE QUOTE MARK] │  [LARGE QUOTE MARK]   │  [LARGE QUOTE MARK]       │
│                     │                       │                           │
│  "पहले बिचौलिया     │  "3 batches mein      │  "Feed cost timing        │
│   जो भाव बोलता था, │   ₹1.8 lakh extra     │   se ek batch mein        │
│   वो मान लेता था।  │   kamaaya. Sub ka     │   ₹45,000 bachaye.        │
│   अब ₹4/kg         │   50x return pehle    │   Pehle aisa koi tool     │
│   ज़्यादा माँगते   │   saal mein hi."      │   nahi tha."              │
│   हैं।"            │                       │                           │
│                     │  ★★★★★               │  ★★★★★                   │
│  ★★★★★             │  M.S., Deoria        │  S.K., Kushinagar          │
│  R.Y., Gorakhpur    │  40,000 bird farm     │  Integrator, 8 farms       │
│  25,000 bird farm   │                       │                           │
└─────────────────────┴───────────────────────┴─────────────────────────  │
└──────────────────────────────────────────────────────────────────────────┘
```

Card design:
- `background: var(--card-testimonial-bg)` (very light green tint)
- Large opening quotation mark: 80px, `color: var(--card-testimonial-quote-color)`
- Quote text: body-lg, neutral-900
- Attribution: caption, neutral-400, bold name
- Star rating: amber-500 stars
- Bottom border: 2px solid brand-green-700 on the left (decorative)

Mobile carousel: `Framer Motion` drag-to-scroll with snap points, dot indicators below.

---

### 3.8 Segment CTA Section

**File:** `src/app/(marketing)/components/SegmentCards.tsx`

```
SECTION HEADER: "Built for every link in the poultry chain"

┌─────────────────────┬─────────────────────┬─────────────────────┬─────────────────────┐
│  🐓 Commercial Farm │  🏭 Integrator       │  🌾 Feed Company     │  🏢 Enterprise      │
│  10K–50K birds      │  50K+ birds          │  Regional mills      │  QSR & Processors   │
│                     │                      │                      │                     │
│  Lost ₹2–4/kg on   │  20 farms, no        │  Demand forecasting  │  30-day forward     │
│  timing this batch? │  central dashboard?  │  for production      │  pricing. API-first │
│                     │                      │  runs.               │                     │
│  ₹2,000–5,000/mo   │  ₹8,000–25,000/mo   │  ₹10,000+/mo        │  Custom pricing     │
│                     │                      │                      │                     │
│  [Free Trial →]     │  [Request Demo →]    │  [Talk to Sales →]  │  [Request Demo →]  │
└─────────────────────┴─────────────────────┴─────────────────────┴─────────────────────┘
```

Card hover: brand-green-700 top border (4px) slides down from hidden to visible (200ms ease-in-out). Card lifts 4px.

---

### 3.9 Final CTA Section

Full-width, `brand-green-700` background:

```
┌──────────────────────────────────────────────────────────────────────────┐
│ (Background: brand-green-700)                                            │
│                                                                           │
│         शुरू करें — पहले 14 दिन मुफ़्त                               │
│         Get Started — First 14 Days Free                                 │
│                                                                           │
│         "आज शाम 06:30 बजे, आपको पहला price signal                      │
│          WhatsApp पर मिलेगा।"                                           │
│                                                                           │
│         [अभी शुरू करें  →]                                             │
│         (white button, brand-green-700 text)                             │
│                                                                           │
│         ✅ No credit card required  ✅ Cancel anytime                    │
│         ✅ Setup in 3 minutes       ✅ First forecast tonight            │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Pricing Page Design Specification (`/pricing`)

**File:** `src/app/(marketing)/pricing/page.tsx`

### 4.1 Pricing Tier Cards

```
LAYOUT: 2 cards + compare matrix below

┌──────────────────────────────────┬──────────────────────────────────────┐
│  PulsePro                        │  PulseEnterprise           [Popular] │
│  ──────────────────────────────  │  ──────────────────────────────────  │
│  For commercial farms            │  For integrators, feed cos & QSR     │
│  10K–50K birds                   │  50K+ birds managed                  │
│                                  │                                      │
│  [════════ Flock Size ═════════] │  Custom Pricing                      │
│  10K   25K   50K                 │  ₹10,000 – ₹2,00,000/month          │
│  ─────────────────────────────   │                                      │
│  ₹2,000 / month                  │  Everything in PulsePro, plus:       │
│                                  │  ✅ Multi-farm dashboard             │
│  or ₹1,600/mo billed annually   │  ✅ 30-day forward intelligence      │
│  (Save 20%)                      │  ✅ API access (10K calls/day)       │
│                                  │  ✅ ERP integrations (Tally, Zoho,   │
│  ✅ 7-day price forecast         │     SAP)                             │
│  ✅ Daily sell signal (WhatsApp) │  ✅ IoT device integration           │
│  ✅ Batch ROI optimizer          │  ✅ FSSAI traceability               │
│  ✅ Middleman check              │  ✅ Field worker supervisor app       │
│  ✅ FCR analytics                │  ✅ HACCP compliance                 │
│  ✅ Vaccination scheduler        │  ✅ Dedicated account manager        │
│  ✅ Daily mortality tracking     │  ✅ SLA: 99.9% uptime               │
│  ✅ Health checklist             │                                      │
│  ✅ HPAI + disease alerts        │  [Request Demo →]                   │
│  ✅ Works offline (Hindi-first)  │                                      │
│                                  │  "Includes a paid pilot at fixed     │
│  [Start 14-Day Free Trial]       │   price before full contract."       │
│  No credit card required         │                                      │
└──────────────────────────────────┴──────────────────────────────────────┘
```

**PulseEnterprise card visual treatment:**
- Slightly larger card
- Brand-green-700 top border (3px)
- `[Popular]` badge in top-right corner: brand-green-700 background, white text, rounded-full

**Flock Size Slider (PulsePro):**
```tsx
const PRICING_TIERS = [
  { label: "10K–25K birds", price: 2000 },
  { label: "25K–50K birds", price: 3500 },
  { label: "50K–1L birds",  price: 5000, note: "Integrator tier starts" },
];
```
Slider snaps to 3 positions. Price updates with a flip animation (numbers flip like a scoreboard, 200ms).

---

### 4.2 Feature Comparison Matrix

Full-width table below tier cards. First column = feature name, columns 2–3 = tier tick/cross:

```
Feature                          PulsePro    PulseEnterprise
──────────────────────────────────────────────────────────────
PRICE INTELLIGENCE
  7-day price forecast              ✅              ✅
  30-day forward intelligence       ❌              ✅
  Multi-district price map          ❌              ✅
  API access                        ❌         ✅ 10K calls/day

SELL INTELLIGENCE
  Daily sell signal (WhatsApp)      ✅              ✅
  Batch ROI Optimizer               ✅              ✅
  Multi-farm harvest queue          ❌              ✅
  Middleman check + Hindi script    ✅              ✅

FARM OPERATIONS
  Batch lifecycle management        ✅              ✅
  FCR analytics                     ✅              ✅
  Daily mortality tracking          ✅              ✅
  Weight gain tracking              ✅              ✅
  Performance benchmarking          ✅              ✅
  Inventory management              ❌              ✅
  Farm portfolio overview           ❌              ✅
  Single farm detail (5 tabs)       ❌              ✅
  Daily metric log entry            ❌              ✅
  Farm comparison (radar chart)     ❌              ✅
  Portfolio metrics dashboard        ❌              ✅
  FCR analysis page                 ❌              ✅
  Mortality tracking page           ❌              ✅
  Feed management page              ❌              ✅
  Health log & disease tracker      ❌              ✅
  Batch reports (7-section PDF)    ❌              ✅

INTEGRATOR-SPECIFIC
  Multi-farm harvest queue          ❌              ✅
  Multi-shed performance grid       ❌              ✅
  DOC supplier registry             ❌              ✅
  Feed-water ratio deviation alert  ❌              ✅
  FCR forecasting (ML)              ❌              ✅
  Multi-farm FCR comparison         ❌              ✅
  Health-to-price intelligence     ❌              ✅
  Withdrawal period enforcement     ❌              ✅
  Weight gain prediction (ML)       ❌              ✅
  Mortality pattern detection       ❌              ✅
  Vendor management & POs           ❌              ✅
  Batch-wise full P&L               ❌              ✅
  Automated consumption updates     ❌              ✅

IOT & FIELD OPERATIONS
  IoT device registry               ❌              ✅
  Environment sensor dashboard      ❌              ✅
  Auto-weighing scale integration   ❌              ✅
  Water meter integration           ❌              ✅
  Climate controller integration    ❌              ✅
  Field worker supervisor app       ❌              ✅
  Offline-first data capture        ❌              ✅

COMPLIANCE & TRACEABILITY
  FSSAI traceability                ✅              ✅
  HACCP compliance                  ❌              ✅
  Batch-to-buyer traceability       ❌              ✅
  Antibiotic-free certification      ❌              ✅
  Export documentation              ❌              ✅

...etc.
```

Sticky first column on horizontal scroll (mobile).

---

## 5. Accuracy Page Design Specification (`/accuracy`)

**File:** `src/app/(marketing)/accuracy/page.tsx`

### 5.1 Hero

Dark green hero (`neutral-900` background, white text):

```
┌──────────────────────────────────────────────────────────────────────────┐
│  The Most Transparent AI in Indian Agri-Tech                             │
│  ─────────────────────────────────────────────────────────────────────   │
│  We publish our accuracy live. Every day.                                 │
│  Because we built this product for farmers, not for investors.            │
│                                                                           │
│  96.2%        4.8%         80.1%        847                              │
│  Directional  MAPE         Conformal    Predictions                       │
│  Accuracy     < 6% ✅      Coverage     Verified                         │
│                                                                           │
│  ⏱ Updated daily · Last: Today 06:15 IST                                │
└──────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Live 30-Day MAPE Trend Chart

Same Recharts design as internal accuracy dashboard — publicly accessible read-only version:

```
MAPE %
  9 │
  8 │─────────────── Red Zone (> 8%)
  7 │
  6 │─ ─ ─ ─ ─ ─ ─ Target Line (6%)
  5 │        ·  ·
  4 │ ·  · ·    ·  ·  ·  · ·
  3 │   ·  ·          · ·
  2 │
  1 │
    └────────────────────────────────── Date
     May 1       May 15       May 28
     
Green shaded region: < 6% (target zone)
```

### 5.3 Prediction History Table

Publicly visible last-30-days predictions table:

```tsx
<table className="prediction-history">
  <thead>
    <tr>
      <th>Date</th>
      <th>District</th>
      <th>Predicted P50</th>
      <th>Actual Price</th>
      <th>Direction ✓?</th>
      <th>MAPE</th>
    </tr>
  </thead>
  <tbody>
    {predictions.map(p => (
      <tr key={p.date}>
        <td>{format(p.date, 'dd MMM')}</td>
        <td>{p.district}</td>
        <td>₹{p.p50.toFixed(2)}</td>
        <td>₹{p.actual.toFixed(2)}</td>
        <td>
          {p.directionCorrect 
            ? <span className="text-green">✅</span>
            : <span className="text-red">❌</span>}
        </td>
        <td className={p.mape < 6 ? 'text-green' : 'text-amber'}>
          {p.mape.toFixed(2)}%
        </td>
      </tr>
    ))}
  </tbody>
</table>
```

The table is sorted latest-first. Row with `directionCorrect = false` has a subtle amber row highlight. Running accuracy % shown in the table header updates as you scroll ("Showing X predictions — Y% correct").

### 5.4 Stress Test Visualisation

3 historical event cards in a timeline layout:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📉  Nov–Mar 2024 Price Crash
    "UP broiler prices fell 22% over 6 weeks."
    Our prediction: Downtrend predicted 4 days before crash onset
    Directional accuracy during crash period: 89%
    [See Price Chart →]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🦠  HPAI Gorakhpur Zone — 2024
    "Government declared HPAI zone in adjacent district."
    Our prediction: Confidence band widened 48h before declaration
    Model correctly reduced P50 forecast and flagged uncertainty
    [See Model Log →]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉  Diwali 2023 Demand Spike
    "Broiler prices rose ₹10/kg in the week before Diwali."
    Our prediction: ₹8–12/kg rise forecast. Actual: ₹10/kg.
    MAPE during spike: 2.1%
    [See Festival Model →]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 6. Solutions Page Design (Template)

**File:** `src/app/(marketing)/solutions/[segment]/page.tsx`

### 6.1 Hero Design (Segment-specific)

```
Commercial Farms Hero:
┌──────────────────────────────────────────────────────────────────────────┐
│  (Background: white → brand-green-50 gradient)                           │
│                                                                           │
│  ₹30,000 ज़्यादा कमाएं                                                  │
│  हर बैच में।                                                            │
│  गैरंटी के साथ।                                                         │
│                                                                           │
│  Gorakhpur के 150+ commercial farmers अब                                │
│  PoultryPulse की 95%+ accurate AI forecast से                           │
│  timing decide करते हैं — guesswork नहीं।                              │
│                                                                           │
│  [14 दिन मुफ़्त शुरू करें]    [Demo देखें]                            │
│                                                                           │
│  📍 Serving Gorakhpur · Deoria · Kushinagar · Maharajganj · Basti       │
└──────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Pain → Solution Mapping Cards

```
┌──────────────────────────────────┬──────────────────────────────────────┐
│  ❌ Before PoultryPulse          │  ✅ After PoultryPulse               │
│  ─────────────────────────────── │  ─────────────────────────────────── │
│  "Call 3 traders every morning.  │  "Open PoultryPulse at 6:30 AM.     │
│   Take their word for price."    │   See: ⭐ SELL NOW — ₹162.40/kg"    │
│                                  │                                      │
│  Lost: ₹30K–80K per batch       │  Gained: ₹30K–40K per batch         │
│        from mistimed selling     │         from data-driven timing      │
└──────────────────────────────────┴──────────────────────────────────────┘
```

Before/After layout — green right column, slightly red-tinted left column. Most emotionally resonant section on the page.

---

## 7. Developer Page Design Specification (`/developers`)

**File:** `src/app/(marketing)/developers/page.tsx`

### 7.1 Code Block Design

```tsx
// Hero code block — syntax highlighted, copy button
const CodeBlock = ({ code, language }: CodeBlockProps) => (
  <div className="code-block">
    <div className="code-header">
      <span className="language-badge">{language}</span>
      <button className="copy-btn" onClick={() => navigator.clipboard.writeText(code)}>
        Copy
      </button>
    </div>
    <pre className="code-content">
      <code dangerouslySetInnerHTML={{ __html: highlightedCode }} />
    </pre>
  </div>
);
```

Code block styling:
- Background: `#0D1117` (GitHub dark)
- Font: IBM Plex Mono, 14px
- Line height: 1.6
- Syntax colors: strings=green-400, keywords=blue-400, values=amber-300
- Border-radius: 12px
- Copy button: appears on hover, top-right corner

### 7.2 Endpoint Table Design

```
Method   Endpoint                          Description              Auth
────────────────────────────────────────────────────────────────────────
GET      /v2/forecast/enterprise           7–30 day price forecast  API Key
GET      /v2/prices/live                   Real-time mandi prices   API Key
GET      /v2/batch/{id}/traceability       FSSAI traceability PDF   API Key
POST     /v2/webhooks                      Register event webhook   API Key
GET      /v2/feed-intel                    Feed commodity forecast  API Key
GET      /v2/flock/dashboard              Multi-farm overview      API Key
GET      /api/public/accuracy-summary     Live accuracy stats      None
```

Each row is clickable → expands to show: request parameters, example response, code snippet in 3 languages.

---

## 8. Blog Page Design (`/blog`)

**File:** `src/app/(marketing)/blog/page.tsx`

### 8.1 Blog Post Card

```
┌────────────────────────────────────────────────────────────────┐
│  [Category Badge]  [Date]                                       │
│                                                                 │
│  गोरखपुर ब्रॉयलर भाव — 2 जून 2026 का पूर्वानुमान           │
│  Gorakhpur Broiler Price — 2 June 2026 Forecast                │
│                                                                 │
│  "AI model के अनुसार अगले 7 दिन में भाव..."                  │
│                                                                 │
│  5 min read  ·  [Hindi] [English]  ·  Share on WhatsApp 📤    │
└────────────────────────────────────────────────────────────────┘
```

### 8.2 Auto-Generated Weekly Price Blog Posts

```tsx
// Server-side generation — runs weekly via GitHub Actions
// Queries /api/public/forecast, generates structured blog post
// Published to /blog/gorakhpur-broiler-price-[date]
const generateWeeklyForecastPost = async (): Promise<BlogPost> => ({
  title: `गोरखपुर ब्रॉयलर भाव — ${format(new Date(), 'dd MMM yyyy')} का पूर्वानुमान`,
  slug: `gorakhpur-broiler-price-${format(new Date(), 'yyyy-MM-dd')}`,
  category: 'Bhav Vichar',
  content: await buildForecastPostContent(forecastData),
  jsonLd: buildArticleSchema(forecastData),
});
```

These posts target high-value SEO keywords: `"गोरखपुर ब्रॉयलर भाव आज"`, `"broiler price Gorakhpur"` — each page drives organic farmer acquisition.

---

## 9. Mobile-Responsive Patterns

### 9.1 Breakpoint Strategy

```css
/* Mobile-first breakpoints (Tailwind) */
/* sm: 640px  — large mobile (never used as primary target) */
/* md: 768px  — tablet portrait */
/* lg: 1024px — tablet landscape / small laptop */
/* xl: 1280px — desktop */
/* 2xl: 1536px — wide desktop */
```

The base (no prefix) styles are written for mobile (375–639px). Desktop is the progressive enhancement.

### 9.2 Hero Mobile Layout

```
MOBILE HERO:
┌──────────────────────────────┐
│ [Accuracy badge pill]        │
│                              │
│ ₹30,000 ज़्यादा             │  ← 40px, 2 lines
│ कमाएं हर बैच में।           │
│                              │
│ AI-powered forecast.         │  ← 17px, muted
│ 95%+ accuracy.               │
│                              │
│ [14 दिन मुफ़्त शुरू करें]  │  ← Full width, 56px height
│ [See How It Works]           │  ← Text link, centered
│                              │
│ [Product mockup — phone]     │  ← Full width, 280px height
│                              │
│ [Partner logo strip]         │
└──────────────────────────────┘
```

### 9.3 Thumb-Reachable CTAs on Mobile

All primary CTAs must be in the bottom 60% of the mobile viewport. The hero CTA (`[14 दिन मुफ़्त शुरू करें]`) is positioned at `~65% from top of viewport` on mobile — within comfortable thumb reach.

The sticky navigation `[Request Demo]` button stays in the top bar because it's a secondary, considered action (not an impulse tap).

---

## 10. Animation & Motion Design (Website)

### 10.1 Scroll-Triggered Animations

All below-fold sections animate in on scroll using Framer Motion `whileInView`:

```tsx
const sectionVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: { 
    opacity: 1, y: 0, 
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
  }
};

// Usage on every section
<motion.section
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, margin: "-100px" }}
  variants={sectionVariants}
>
```

`viewport={{ once: true }}` ensures animation fires only once (not on re-scroll) — better perceived performance.

### 10.2 Number Count-Up Animation

All accuracy numbers, ROI calculator results, and pricing figures use count-up animation:
- Trigger: `whileInView` (once)
- Duration: 1.2s for hero stats, 0.8s for calculator updates
- Easing: `easeOut` (fast start, slow finish — feels responsive)
- Implementation: `react-countup` library (< 5KB gzipped)

### 10.3 Product Mockup Animation

The CSS product mockup in the hero animates on load:
1. Phone mockup slides up from `translateY(20px)` to 0 (500ms, spring)
2. Price number counts up to `₹162.40` (800ms, easeOut)
3. Sell signal badge fades in and scales from 0.95 to 1.0 (300ms, 600ms delay)
4. Dashboard mockup (background) fades in (400ms, 200ms delay)

Total perceived animation: 1.1 seconds. Never blocks the user — animations are visual enhancements only.

### 10.4 Reduce Motion Respect

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

All Framer Motion components check `useReducedMotion()` hook and set `transition.duration: 0` when true.

---

## 11. File & Folder Structure (Website)

```
/src/app/(marketing)/           ← Route group — no auth required
  layout.tsx                    ← Marketing layout (nav + footer)
  page.tsx                      ← Home (/)
  /features/
    page.tsx                    ← /features
  /pricing/
    page.tsx                    ← /pricing
  /accuracy/
    page.tsx                    ← /accuracy
  /solutions/
    /commercial-farms/
      page.tsx                  ← /solutions/commercial-farms
    /integrators/
      page.tsx                  ← /solutions/integrators
    /feed-companies/
      page.tsx                  ← /solutions/feed-companies
    /enterprise/
      page.tsx                  ← /solutions/enterprise
  /farm-intelligence/
    page.tsx                    ← /farm-intelligence
  /developers/
    page.tsx                    ← /developers
  /compliance/
    page.tsx                    ← /compliance
  /about/
    page.tsx                    ← /about
  /blog/
    page.tsx                    ← /blog (list)
    /[slug]/
      page.tsx                  ← /blog/[slug] (post)
  /demo/
    page.tsx                    ← /demo
  /components/                  ← Shared marketing components
    Navigation.tsx
    Footer.tsx
    AccuracyStrip.tsx
    AccuracyBadge.tsx
    ProductMockup.tsx
    FeatureTabPreview.tsx
    RoiCalculator.tsx
    Testimonials.tsx
    SegmentCards.tsx
    FeatureGrid.tsx
    ProblemCards.tsx
    StressTestCards.tsx
    PredictionTable.tsx
    CodeBlock.tsx
    AnimatedStat.tsx
    LanguageToggle.tsx
    LanguageProvider.tsx
  /lib/
    accuracy.ts                 ← Fetch /api/public/accuracy-summary
    blog.ts                     ← Blog post fetching + generation
    roi.ts                      ← ROI calculator logic
    pricing.ts                  ← Pricing tier config
  /i18n/
    en.json                     ← All English copy
    hi.json                     ← All Hindi copy
    useTranslation.ts           ← Translation hook

/src/app/api/public/
  accuracy-summary/
    route.ts                    ← GET /api/public/accuracy-summary (no auth)
  forecast-preview/
    route.ts                    ← GET /api/public/forecast-preview (no auth)
```

---

*End of Website Design Specification — PoultryPulse Pre-Login Website v1.0*
