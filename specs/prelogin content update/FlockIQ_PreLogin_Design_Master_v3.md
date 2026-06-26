# FlockIQ — Pre-Login Website UI/UX Design Master (v3.0)
# Supersedes: 01_prelogin_design_master.md | PoultryPulse_Website_Design_v1.md
# Version: v3.0 | June 2026 | CONFIDENTIAL
# Brand: FlockIQ (formerly PoultryPulse AI / PoultrySense)
# Strategic Pivot: Poultry Management Platform — Global + Pan-India
# Primary Audience: Commercial Integrators (50K–5M birds) + Poultry Farms (10K–500K birds)

---

## STRATEGIC CONTEXT

```
PIVOT SUMMARY:
  OLD FOCUS:  Price forecasting tool for UP farmers
  NEW FOCUS:  Full poultry management platform for integrators + farms globally
              Price intelligence is ONE module — not the headline product

  POSITIONING: "The operating system for commercial poultry operations"
  COMPETING WITH:
    - PoultryPlan OptiLink / OptibroilerS (Netherlands)
    - Poultry.care Broiler Management (UK)
    - PigCHAMP Poultry, Hendrix Genetics flock tools
    - PORPHYRIO, Optifarm, Hubbard
  DIFFERENTIATOR:
    - AI-native, mobile-first, WhatsApp-native
    - Built for emerging markets (India, SE Asia, MENA, Sub-Saharan Africa)
    - WhatsApp Daily Log Automation (patent-pending workflow — flagship)
    - Price intelligence EMBEDDED (not bolted on)
    - Works offline on Android, 200ms cache load

  BRAND:
    Name:            FlockIQ
    Tagline:         "Smarter Flocks. Smarter Returns."
    Sub-tagline:     "The Poultry Management Platform Built for the Real World"
    Logo:            Dark forest green chicken silhouette + upward-trending arrow
    Brand colours:   Primary #1A5C34 (forest green) | Accent #3DAE72 (mid-green)
    Secondary:       #E8611A (saffron orange — alerts/signals only)

  PAGES TO BUILD (Complete List):
    Marketing / SEO:
      /                         → Homepage (full redesign)
      /solutions/integrators    → For Integrators page (NEW)
      /solutions/farms          → For Farms page (NEW)
      /features                 → All Features (updated)
      /features/farm-management → Farm Management Feature (NEW)
      /features/whatsapp-log    → WhatsApp Log Automation (NEW — flagship)
      /features/price-intel     → Price Intelligence feature (updated — secondary)
      /how-it-works             → How It Works (updated)
      /pricing                  → Pricing page (updated)
      /accuracy                 → Accuracy page (updated)
      /about                    → About page (updated)
      /case-studies             → Case Studies (updated)
      /blog                     → Blog (updated)
      /contact                  → Contact (updated)
      /faq                      → FAQ (updated)
      /enterprise               → Enterprise (updated)
      /press                    → Press + Media assets (updated)
      /free-disease-alerts      → Free Disease Alerts (kept)
      /glossary                 → Glossary (updated)
      /locations                → All Locations (updated)
      /locations/[slug]         → Individual mandi/district pages
      /loss-calculator          → Loss Calculator (updated)
      /try-whatsapp             → WhatsApp Demo (updated)
      /demo                     → Request Demo (updated)
      /case-studies/[slug]      → Individual case study pages

    Auth:
      /login                    → Login (OTP + Email)
      /signup                   → Signup (onboarding funnel start)
      /onboarding               → 4-step onboarding wizard

    Legal:
      /privacy                  → Privacy Policy
      /terms                    → Terms of Service
      /refund-policy            → Refund Policy
      /compliance               → Compliance (DPDP, FSSAI, HACCP)
```

---

## 1. DESIGN SYSTEM

### 1.1 Brand Colour Tokens

```typescript
export const FlockIQWebTokens = {
  // PRIMARY BRAND — Forest Green (darker, premium, global)
  brand900:        '#0D3B21',  // Deepest green — dark overlay, footer
  brand800:        '#144D2B',  // Dark variant
  brand700:        '#1A5C34',  // ★ PRIMARY: CTAs, nav active, sidebars, badges
  brand600:        '#1F7040',  // Hover on brand700
  brand500:        '#25874D',  // Body links, icon fill
  brand400:        '#3DAE72',  // ★ ACCENT: Interactive highlights, progress, active
  brand300:        '#68C690',  // Light accent — tag backgrounds
  brand200:        '#A3DBBA',  // Very light accent
  brand100:        '#D4EFDE',  // Tint backgrounds
  brand50:         '#EDF7F1',  // Subtle page section backgrounds

  // SAFFRON ORANGE — Alert/Signal (use sparingly — max 5% of screen area)
  signal700:       '#C4490E',  // Dark saffron
  signal500:       '#E8611A',  // ★ Signal: SELL, urgency CTAs, alerts
  signal300:       '#F5A044',  // Mild warning
  signalLight:     '#FDF0E8',  // Alert card backgrounds

  // NEUTRAL SCALE (warm-tinted, not cool grey)
  neutral950:      '#0F1A12',  // Almost black — hero text
  neutral900:      '#1C2B22',  // Primary headings
  neutral800:      '#263D2F',  // Secondary headings
  neutral700:      '#334D3E',  // Body text
  neutral600:      '#4A6556',  // Secondary body
  neutral500:      '#5A7A68',  // Tertiary text, captions
  neutral400:      '#7A9C8A',  // Disabled text
  neutral300:      '#A0BAA9',  // Placeholder
  neutral200:      '#C8DDD2',  // Borders, dividers
  neutral150:      '#DDE9E2',  // Light borders
  neutral100:      '#EAF1ED',  // Subtle backgrounds
  neutral50:       '#F4F8F5',  // Page background sections

  // SURFACES
  white:           '#FFFFFF',
  pageBg:          '#F7FAF8',  // Warm off-white page background
  cardBg:          '#FFFFFF',
  heroGradient:    'linear-gradient(135deg, #1A5C34 0%, #0F4A28 55%, #0D3B21 100%)',
  heroGradientLt:  'linear-gradient(180deg, #EDF7F1 0%, #FFFFFF 100%)',
  greenGlow:       '0 0 60px rgba(61,174,114,0.15)',  // Subtle glow for hero elements

  // SEMANTIC
  success500:      '#16A34A',
  warning500:      '#D97706',
  error500:        '#DC2626',
  info500:         '#2563EB',

  // WHATSAPP
  whatsappGreen:   '#25D366',
  whatsappBg:      '#ECF8F1',
  whatsappDark:    '#075E54',

  // GLASS / OVERLAY
  glass10:         'rgba(255,255,255,0.10)',
  glass15:         'rgba(255,255,255,0.15)',
  glass20:         'rgba(255,255,255,0.20)',
  overlayDark:     'rgba(13,59,33,0.85)',
} as const;
```

### 1.2 Typography System

```typescript
export const FlockIQTypography = {
  // DISPLAY — Hero headlines (fluid scale for global market)
  displayHero: {
    fontFamily:    "'Sora', 'Plus Jakarta Sans', system-ui",
    fontSize:      "clamp(2.75rem, 5.5vw + 0.5rem, 5rem)",  // 44px → 80px
    fontWeight:    800,
    lineHeight:    1.0,
    letterSpacing: '-0.035em',
  },
  displayLarge: {
    fontFamily:    "'Sora', 'Plus Jakarta Sans', system-ui",
    fontSize:      "clamp(2.25rem, 4vw + 0.5rem, 3.75rem)",  // 36px → 60px
    fontWeight:    700,
    lineHeight:    1.08,
    letterSpacing: '-0.028em',
  },
  displayMedium: {
    fontFamily:    "'Sora', system-ui",
    fontSize:      "clamp(1.875rem, 3vw + 0.25rem, 3rem)",
    fontWeight:    700,
    lineHeight:    1.12,
    letterSpacing: '-0.022em',
  },

  // SECTION HEADINGS
  h1: {
    fontFamily:    "'Plus Jakarta Sans', 'Sora', system-ui",
    fontSize:      "clamp(1.75rem, 2.5vw + 0.5rem, 2.5rem)",
    fontWeight:    700,
    lineHeight:    1.2,
    letterSpacing: '-0.02em',
  },
  h2: {
    fontFamily:    "'Plus Jakarta Sans', system-ui",
    fontSize:      "clamp(1.375rem, 1.75vw + 0.375rem, 2rem)",
    fontWeight:    600,
    lineHeight:    1.3,
    letterSpacing: '-0.015em',
  },
  h3: {
    fontFamily:    "'Plus Jakarta Sans', system-ui",
    fontSize:      "clamp(1.125rem, 1vw + 0.375rem, 1.5rem)",
    fontWeight:    600,
    lineHeight:    1.35,
    letterSpacing: '-0.01em',
  },

  // BODY
  bodyLarge: {
    fontFamily:  "'Plus Jakarta Sans', system-ui",
    fontSize:    "clamp(1rem, 0.5vw + 0.875rem, 1.25rem)",
    fontWeight:  400,
    lineHeight:  1.75,
    maxWidth:    '65ch',
  },
  bodyBase: {
    fontFamily:  "'Plus Jakarta Sans', system-ui",
    fontSize:    "1rem",
    fontWeight:  400,
    lineHeight:  1.65,
  },
  bodySmall: {
    fontFamily:  "'Plus Jakarta Sans', system-ui",
    fontSize:    "0.875rem",
    fontWeight:  400,
    lineHeight:  1.55,
  },

  // SPECIAL — Hindi/Devanagari
  hindiDisplay: {
    fontFamily:  "'Noto Sans Devanagari', 'Mangal', sans-serif",
    fontSize:    "clamp(1.375rem, 2.5vw + 0.5rem, 2.25rem)",
    fontWeight:  700,
    lineHeight:  1.45,
  },
  hindiBody: {
    fontFamily:  "'Noto Sans Devanagari', 'Mangal', sans-serif",
    fontSize:    "clamp(0.9375rem, 0.75vw + 0.75rem, 1.125rem)",
    fontWeight:  400,
    lineHeight:  1.7,
  },
  hindiSmall: {
    fontFamily:  "'Noto Sans Devanagari', 'Mangal', sans-serif",
    fontSize:    "0.875rem",
    fontWeight:  400,
    lineHeight:  1.6,
  },

  // NUMBERS — Tabular (for prices, stats)
  priceHero: {
    fontFamily:         "'Sora', system-ui",
    fontSize:           "clamp(3rem, 7vw, 6rem)",
    fontWeight:         800,
    lineHeight:         1.0,
    letterSpacing:      '-0.045em',
    fontVariantNumeric: 'tabular-nums',
  },
  statNumber: {
    fontFamily:         "'Sora', system-ui",
    fontSize:           "clamp(2rem, 4vw, 3.5rem)",
    fontWeight:         800,
    lineHeight:         1.0,
    letterSpacing:      '-0.03em',
    fontVariantNumeric: 'tabular-nums',
  },

  // EYEBROW / LABEL
  eyebrow: {
    fontFamily:    "'Plus Jakarta Sans', system-ui",
    fontSize:      "0.6875rem",
    fontWeight:    700,
    letterSpacing: '0.18em',
    textTransform: 'uppercase' as const,
    lineHeight:    1.0,
  },
  label: {
    fontFamily:    "'Plus Jakarta Sans', system-ui",
    fontSize:      "0.8125rem",
    fontWeight:    600,
    letterSpacing: '0.04em',
    lineHeight:    1.4,
  },

  // MONOSPACE — code, API samples
  mono: {
    fontFamily: "'Geist Mono', 'JetBrains Mono', 'Fira Code', monospace",
    fontSize:   "0.875rem",
    fontWeight: 400,
    lineHeight: 1.6,
  },
} as const;
```

### 1.3 Spacing & Layout System

```
LAYOUT RULES:
  Container max-width:    1280px (content) | 1440px (full-width sections)
  Container side padding: clamp(1rem, 5vw, 4rem)
  Section vertical pad:   clamp(5rem, 8vw, 9rem)  (generous — premium feel)
  Section smaller pad:    clamp(3rem, 5vw, 5rem)
  Card gap:               clamp(1.25rem, 2vw, 2rem)
  Card padding:           clamp(1.5rem, 2.5vw, 2.5rem)
  Card border-radius:     16px (cards) | 12px (inner components) | 999px (pills)
  Button height:          52px (standard) | 60px (hero CTA) | 44px (small)
  Button border-radius:   10px (standard) | 999px (pill — hero/primary CTAs only)
  Input height:           52px
  Input border-radius:    10px

GRID SYSTEM:
  Desktop (≥1280px): 12-col grid, 32px gap
  Tablet (768–1279px): 8-col grid, 24px gap
  Mobile (<768px): 4-col grid, 16px gap

SHADOW SYSTEM (elevation scale):
  shadow-xs:  0 1px 2px rgba(0,0,0,0.05)
  shadow-sm:  0 1px 6px rgba(0,0,0,0.07)
  shadow-md:  0 4px 16px rgba(0,0,0,0.08)
  shadow-lg:  0 8px 32px rgba(0,0,0,0.10)
  shadow-xl:  0 16px 48px rgba(0,0,0,0.12)
  shadow-green: 0 8px 32px rgba(26,92,52,0.18)  (for primary CTAs)
```

### 1.4 Component Design Tokens

```typescript
export const FlockIQComponentTokens = {
  // NAV
  navHeight:        '72px',
  navBg:            'rgba(255,255,255,0.95)',
  navBgScrolled:    '#FFFFFF',
  navBorder:        '1px solid rgba(26,92,52,0.08)',
  navBackdropBlur:  'blur(20px)',
  navLogoHeight:    '36px',

  // BUTTONS
  btnPrimary: {
    bg:           '#1A5C34',
    bgHover:      '#1F7040',
    bgActive:     '#144D2B',
    text:         '#FFFFFF',
    shadow:       '0 4px 16px rgba(26,92,52,0.25)',
    shadowHover:  '0 6px 24px rgba(26,92,52,0.35)',
  },
  btnAccent: {
    bg:      '#E8611A',  // Signal orange — for urgency CTAs only
    bgHover: '#C4490E',
    text:    '#FFFFFF',
    shadow:  '0 4px 16px rgba(232,97,26,0.25)',
  },
  btnSecondary: {
    bg:        'transparent',
    bgHover:   '#EDF7F1',
    border:    '1.5px solid #1A5C34',
    text:      '#1A5C34',
  },
  btnGhost: {
    bg:        'transparent',
    bgHover:   'rgba(26,92,52,0.06)',
    text:      '#334D3E',
  },
  btnWhatsApp: {
    bg:        '#25D366',
    bgHover:   '#1DA85A',
    text:      '#FFFFFF',
    shadow:    '0 4px 16px rgba(37,211,102,0.30)',
  },

  // CARDS
  cardBg:         '#FFFFFF',
  cardBorder:     '1px solid #E3EDE7',
  cardRadius:     '16px',
  cardPadding:    '28px',
  cardShadow:     '0 2px 8px rgba(0,0,0,0.06)',
  cardHoverShadow:'0 8px 32px rgba(0,0,0,0.10)',
  cardHoverBg:    '#FAFCFB',
  cardHoverBorderColor: '#3DAE72',

  // FEATURE CARDS (feature list items)
  featureIconBg:   '#EDF7F1',
  featureIconColor:'#1A5C34',
  featureIconSize: '48px',
  featureIconRadius:'12px',

  // TESTIMONIAL CARDS
  testimonialBg:         '#FFFFFF',
  testimonialBorderLeft: '4px solid #3DAE72',
  testimonialAvatarBg:   '#1A5C34',
  testimonialAvatarText: '#FFFFFF',
  verifiedBadgeBg:       '#EDF7F1',
  verifiedBadgeColor:    '#1A5C34',

  // PRICING CARDS
  pricingCardBg:        '#FFFFFF',
  pricingCardFeaturedBg:'#0D3B21',  // Dark hero card for "Most Popular"
  pricingCardFeaturedText:'#FFFFFF',
  pricingPopularBadgeBg:'#3DAE72',
  pricingBorder:        '2px solid #E3EDE7',
  pricingBorderPopular: '2px solid #3DAE72',

  // PILLS / BADGES
  pillBrandBg:     '#EDF7F1',
  pillBrandText:   '#1A5C34',
  pillBrandBorder: '1px solid #D4EFDE',
  pillOrangeBg:    '#FDF0E8',
  pillOrangeText:  '#C4490E',
  pillGreyBg:      '#F0F4F1',
  pillGreyText:    '#5A7A68',
  pillSuccessBg:   '#DCFCE7',
  pillSuccessText: '#16A34A',

  // SECTION LABELS (eyebrow)
  eyebrowBg:       '#EDF7F1',
  eyebrowColor:    '#1A5C34',
  eyebrowPadding:  '6px 14px',
  eyebrowRadius:   '999px',
  eyebrowBorder:   '1px solid #D4EFDE',

  // ANNOUNCEMENT BAR
  announcementBg:    '#1A5C34',
  announcementText:  '#FFFFFF',
  announcementHeight:'44px',
} as const;
```

---

## 2. GLOBAL NAV (All Pages)

### 2.1 Announcement Bar (Top)

```
POSITION: Fixed top, z-index 100, height 44px
BACKGROUND: #1A5C34 (brand700)
TEXT: white, 13px, center-aligned

CONTENT (A/B rotate every 24h):
  Variant A: "🚀 New: WhatsApp Daily Log Automation — Farmers submit data via WhatsApp. Zero manual entry. [See how →]"
  Variant B: "🌍 Now available globally — India, Indonesia, Vietnam, Thailand & 12+ countries. [Explore →]"
  Variant C: "✅ 96.2% directional accuracy — verified on 847 predictions. [View live dashboard →]"
  Variant D: "🆓 14-day free trial — no credit card. Start today. [Get started →]"

DISMISS: [×] button right-aligned — stores in sessionStorage, hides for rest of session

MOBILE: Same bar, shorter text (truncate with "→ Learn more" if needed)
```

### 2.2 Navigation Bar

```
HEIGHT: 72px
BACKGROUND: rgba(255,255,255,0.95) + backdrop-blur(20px) on scroll
BORDER: 1px solid rgba(26,92,52,0.08) on scroll
TRANSITION: background + border on scroll, 200ms ease

LEFT SECTION:
  FlockIQ Logo SVG (brand name with logo mark)
  Logo mark: chicken silhouette + upward arrow in brand400
  Text: "Flock" (brand700, 700wt) + "IQ" (brand400, 700wt)
  Height: 36px

NAVIGATION LINKS (desktop only, hidden on mobile):
  Products ▾     → Mega-dropdown (see 2.3)
  Solutions ▾    → Dropdown: [For Integrators] [For Farms] [For Enterprises]
  Features       → /features
  Pricing        → /pricing
  Resources ▾    → Dropdown: [Blog] [Case Studies] [Accuracy] [Docs]

  SPACING: 28px between nav items
  STYLE: body text, 15px, #334D3E, 500 weight
  HOVER: color → #1A5C34, transition 150ms

RIGHT SECTION:
  [EN / हि] Language toggle → small pill button (EN highlighted/active by default on load)
  [Login] → ghost button (14px, #334D3E)
  [Start Free Trial →] → primary pill button (brand700, 52px height)
  Separator: 1px #E3EDE7 between Login and CTA

MOBILE (<768px):
  Logo (left) + [Hamburger ☰] (right, 44×44 touch target)
  Mobile menu: full-screen overlay with all nav items stacked
  Background: #0D3B21 (brand900) — immersive dark
  Animation: slide-in from right, 350ms spring
  Mobile nav items: 20px font, 64px height each
  Mobile CTA: full-width primary button at bottom
```

### 2.3 Products Mega-Dropdown

```
TRIGGER: "Products ▾" nav item
ANIMATION: fade-in + slide-down 4px, 200ms easeOut
BACKGROUND: #FFFFFF
SHADOW: 0 16px 48px rgba(0,0,0,0.10)
BORDER-RADIUS: 0 0 16px 16px
WIDTH: 720px, centered below Products link
PADDING: 32px

LAYOUT (3 columns):
  Column 1 — PLATFORM                      Column 2 — BY ROLE
  ───────────────────────────────────────────────────────────
  📋 Farm Management                        🏭 For Integrators
     Complete batch lifecycle tracking         50K–5M birds
                                            🏠 For Farms
  📊 Analytics & Reporting                     10K–500K birds
     FCR, mortality, benchmark reports
                                            🌐 Enterprise API
  📱 WhatsApp Log Automation                   Data API & white-label
     ★ NEW — Auto-collect daily data

  📈 Price Intelligence                     Column 3 — FEATURED
     7-day AI price forecasts              ┌──────────────────────┐
                                           │ 🆕 WhatsApp Log      │
  🔔 Alerts & Notifications                │    Automation        │
     Disease, weather, market alerts       │                      │
                                           │ Zero manual data     │
                                           │ entry. Farmer types  │
                                           │ on WhatsApp.         │
                                           │                      │
                                           │ [See how it works →] │
                                           └──────────────────────┘

BOTTOM STRIP (full-width inside dropdown):
  "200+ farms across 3 continents trust FlockIQ"
  Logo strip: small greyscale logos of data partners (AGMARKNET, NECC, IMD, etc)
```

---

## 3. PAGE DESIGNS

---

### PAGE 01: Homepage (`/`)

**Purpose:** Convert visitors into trial sign-ups. Lead with poultry management platform value, secondary price intelligence.

---

#### Section H-01: Hero

```
LAYOUT: Full-screen (min-height: 100dvh)
BACKGROUND: heroGradient (#1A5C34 → #0F4A28 → #0D3B21)
              + subtle grain texture overlay (3% opacity SVG noise)
              + animated floating particles (5–8 small green orbs, slow drift)

CONTENT STRUCTURE (two-column, 60/40 split on desktop):

LEFT COLUMN (text):

  [EYEBROW PILL]
  ┌──────────────────────────────────────────────────────┐
  │  🌍 Used in 15+ countries across 4 continents       │
  └──────────────────────────────────────────────────────┘
  Pill: white/8% bg, white text, 12px, pill border-radius

  [HEADLINE - English default]
  Run Your Poultry Operation
  Like a Fortune 500 Company.

  [HEADLINE - Hindi toggle - behind toggle only, not in default page HTML]
  अपना Poultry Farm चलाएं
  एक बड़े कॉर्पोरेट की तरह।

  HEADLINE STYLE:
    Font: displayHero (clamp 44px → 80px)
    Colour: #FFFFFF
    Line 1: regular weight 700
    Line 2: font-weight 800, slight green tint (#A3DBBA) on last word
    Max-width: 600px

  [SUBHEADLINE]
  "FlockIQ gives integrators and farm managers complete visibility over
   every batch — FCR, mortality, weight, health — with daily data collected
   automatically via WhatsApp. No spreadsheets. No manual calls."

  Style: bodyLarge, white/85%, max-width 520px, margin-top 20px

  [CTA BUTTONS - stacked on mobile, side-by-side on desktop]
  Primary:   [Start Free Trial — 14 Days →]
             Brand: signalOrange (#E8611A) — warm, urgent, contrast on dark
             Width: 220px | Height: 60px | Pill shape
             Shadow: 0 8px 32px rgba(232,97,26,0.40)
             Hover: scale(1.02) + shadow increase

  Secondary: [📹 See a 3-Min Demo]
             Brand: white/15% glass background, white text
             Width: 200px | Height: 60px | Pill shape
             Hover: white/20% background

  [TRUST MICRO-TEXT below CTAs]
  "✓ Free 14 days  ✓ No credit card  ✓ Works on WhatsApp  ✓ Cancel anytime"
  Style: 13px, white/60%, flex row with dividers

  [DATA PARTNERS strip]
  "Powered by verified data:"
  Logo tiles: AGMARKNET · NECC · IMD · DAHDF · NCDEX
  Style: white/40%, 11px, greyscale logos, flex gap 16px

RIGHT COLUMN (product demo):

  LAYOUT: Floating phone mockup (iOS-style, dark bezel)
  ANIMATION: subtle float up-down (6px amplitude, 4s period, CSS transform)
  ASPECT: approx 280×560px mockup frame

  INNER SCREENS — auto-cycle 4 screens, 3s each:

  Screen 1: Dashboard Overview
  ┌────────────────────────┐
  │ ● FlockIQ 9:41 AM      │
  │ Good morning, Ramesh ✓ │
  │ ─────────────────────  │
  │ Today's Operations     │
  │ 3 Farms Active         │
  │ 📊 Avg FCR: 1.82 ✓    │
  │ 💀 Mortality: 2.1% ✓  │
  │ ⏳ 1 Log Pending       │
  │ ─────────────────────  │
  │ 🐔 Shivaji Farm D-21  │
  │ 1250kg feed logged ✓  │
  │ [via WhatsApp 6:14PM] │
  └────────────────────────┘

  Screen 2: WhatsApp Log
  ┌────────────────────────┐
  │ 💬 WhatsApp            │
  │ FlockIQ Daily Log      │
  │ ─────────────────────  │
  │ 🐔 Shivaji Farm D-21  │
  │ Day 21 data bhejein:  │
  │ [deaths] [feed kg]    │
  │                        │
  │ "2 1250 1680"         │← Farmer reply
  │ ─────────────────────  │
  │ ✅ Log saved!         │
  │ Deaths: 2 | Feed:1250 │
  │ FCR est: 1.82 ✓       │
  └────────────────────────┘

  Screen 3: Price Signal
  ┌────────────────────────┐
  │ 📈 Price Intelligence  │
  │ ─────────────────────  │
  │ Today: ₹168/kg        │
  │ ↑ +₹4 vs yesterday   │
  │ ─────────────────────  │
  │ 7-Day Forecast:       │
  │ ₹161 — ₹175 range    │
  │ P50: ₹168/kg          │
  │ ─────────────────────  │
  │ 🟢 SELL NOW           │
  │ Optimal window: 2-4d  │
  └────────────────────────┘

  Screen 4: FCR Trend
  ┌────────────────────────┐
  │ 📊 FCR Analytics       │
  │ ─────────────────────  │
  │ Portfolio Avg FCR: 1.77│
  │ Industry avg: 1.90     │
  │ ✓ 7% better           │
  │ ─────────────────────  │
  │ [mini area chart]      │
  │ Trend: ↓ improving    │
  │ ─────────────────────  │
  │ Best farm: Raj Farm   │
  │ FCR: 1.69 (top 10%)   │
  └────────────────────────┘

TRANSITION between screens: cross-dissolve, 400ms ease

BOTTOM DECORATION:
  Thin curved divider (SVG wave) at bottom of hero
  Colour: #F7FAF8 (matches next section background)
  Height: 64px

MOBILE LAYOUT:
  Left column stacks on top, right column (mockup) below
  Mockup: 80% of screen width, centered
  Mockup: static (no animation — performance)
```

#### Section H-02: Social Proof Numbers Strip

```
BACKGROUND: #FFFFFF
PADDING: 48px vertical

LAYOUT: 4 stat blocks, equal width, separated by vertical dividers

[BLOCK 1]     [BLOCK 2]     [BLOCK 3]     [BLOCK 4]
 500+          15+           97%           ₹50K–1.5L
 Farms          Countries     Log           Avg Annual
 Active         Served        Compliance    Savings

STAT NUMBER STYLE:
  Font: statNumber (Sora, 48px–56px, 800wt)
  Colour: #1A5C34
  Animation: count-up from 0 on intersection (1.2s, easeOutExpo)
  prefers-reduced-motion: skip animation, show final value

SUB-LABEL STYLE:
  Font: bodyBase, 15px, neutral600
  Margin-top: 6px

DIVIDERS: 1px vertical, neutral200, 40% height centred

BORDER: 1px solid neutral150 on container, border-radius 16px, light shadow

MOBILE: 2×2 grid, no dividers, gap 24px
```

#### Section H-03: The Problem (Pain Amplification)

```
BACKGROUND: #F7FAF8
PADDING: sectionVertical

[EYEBROW]
THE PROBLEM

[H2 HEADLINE]
Most Poultry Operations Run
on WhatsApp Groups and Gut Feel.

[BODY]
"Integrators managing 20+ farms lose hours every day calling farmers for
 data. Batch decisions are made on incomplete information. The result: 
 underperforming flocks, timing losses, and missed opportunities."

LAYOUT: 3-column bento grid on desktop, 1-column on mobile

CARD 1 (span 1):
  Icon: clock (orange)
  Title: "2 Hours/Day Lost"
  Body: "Integration managers spend 2+ hours daily calling farmers to
         collect mortality, feed, and weight data. It's manual, error-prone,
         and slows down decisions."
  Stat: "2 hrs × 250 farming days = 500 hours/year wasted"
  Style: white card, orange left border

CARD 2 (span 1):
  Icon: trending-down (red)
  Title: "₹50K–1.5L Lost Per Batch"
  Body: "Selling at the wrong time — even by 3–4 days — costs ₹2–4/kg on
         a 25,000-bird flock. Compounded over 3 batches/year: over ₹1L gone."
  Stat: Interactive slider: drag to see your farm's annual timing loss
  Slider: [10K birds ←————●————→ 2L birds]
  Output: "At 25,000 birds: ₹1.5 lakh/year potential loss"
  Style: white card, red left border

CARD 3 (span 1):
  Icon: virus (amber)
  Title: "Disease Alerts Arrive Too Late"
  Body: "By the time HPAI news reaches a farm, transport bans are already
         in place. A 48-hour early warning means the difference between
         selling and losing an entire batch."
  Stat: "₹3–5 lakh total loss risk per HPAI outbreak"
  Style: white card, amber left border

CARD 4 (span 2 — wide):
  LAYOUT: Left text + right visual
  Title: "The Data Collection Problem"
  Body: "A farm manager with 8 farms makes 8 phone calls every evening.
         Sometimes the farmer doesn't pick up. Sometimes they forget the
         exact numbers. The data that arrives is incomplete, delayed, wrong.
         And yet decisions worth lakhs are made on this data."

  RIGHT SIDE: Animated conversation mock showing the "old way":
  ┌──────────────────────────────────┐
  │ Manager: "Ramesh bhai, aaj kitni │
  │           muri? Khaana kitna?"  │
  │ [No response at 7 PM...]         │
  │ [Retry at 8 PM...]               │
  │ Ramesh: "3 muri, 1200 kilo"     │
  │ [Data entered manually: 9:22 PM] │
  │ Manager: "Daily loss estimate:   │
  │           unavailable today"     │
  └──────────────────────────────────┘
  Then arrow → "FlockIQ way":
  ┌──────────────────────────────────┐
  │ FlockIQ: "Day 21 log: reply with │
  │           [deaths] [feed kg]"   │
  │ Ramesh: "2 1250 1680"           │← 6:03 PM
  │ ✅ Log auto-saved. FCR: 1.82 ✓  │← 6:03 PM (instant)
  │ Manager sees: all 8 farms logged │← 6:10 PM
  └──────────────────────────────────┘

  Style: white card, subtle green gradient on right side
```

#### Section H-04: Solution — How FlockIQ Works

```
BACKGROUND: #FFFFFF
PADDING: sectionVertical

[EYEBROW]
THE SOLUTION

[H2]
One Platform. Every Decision.
Automated Data Collection.

[BODY]
"FlockIQ connects your farms, your WhatsApp, and your price data into one
 operational command centre — built for integrators and farm managers who
 need clarity, not complexity."

LAYOUT: Alternating left-right feature blocks (3 blocks)

BLOCK 1 (text left, visual right):
  EYEBROW: Farm Operations
  TITLE: "Complete Batch Lifecycle — From DOC to Harvest"
  BODY: "Track every batch across every farm on a single dashboard. FCR,
         daily mortality, weight gain, vaccination schedule, feed consumption
         — all in one place, updated automatically."

  FEATURE BULLETS (with icons):
    ✓ Batch progress board — see every flock's status at a glance
    ✓ FCR tracking vs breed benchmarks (Cobb 430, Ross 308, Hubbard Flex)
    ✓ AI-powered anomaly detection — alerts in 60 seconds
    ✓ Health & vaccination scheduler with WhatsApp reminders
    ✓ FSSAI traceability report — one click, audit-ready

  CTA: [Explore Farm Management →] → /features/farm-management

  RIGHT VISUAL:
    Screenshot-style dashboard mockup (1200×800px viewport)
    Shows: Batch Status Board with 5 farm cards, colour-coded by health
    All data is realistic: Gorakhpur Broilers D-22, FCR 1.84, Mort 2.1%
    Lazy-load as user scrolls (IntersectionObserver)

BLOCK 2 (visual left, text right):
  EYEBROW: WhatsApp Log Automation ★ NEW
  TITLE: "Farmers Reply on WhatsApp. You See the Data Instantly."
  BODY: "FlockIQ sends your farmer a structured WhatsApp reminder every
         evening. They reply with 3 numbers. The system does the rest —
         parses the reply, calculates FCR, flags anomalies, and updates
         the dashboard. No app for the farmer. No calls for you."

  FEATURE BULLETS:
    ✓ Works on any WhatsApp number — no app install required
    ✓ Hindi and English supported — English default, Hindi opt-in per farm
    ✓ Auto-calculates FCR, cumulative mortality, daily gain
    ✓ Smart parsing: understands natural language replies
    ✓ Escalation: if no reply by 8 PM, reminder + manager alert

  CTA: [See WhatsApp Automation →] → /features/whatsapp-log

  LEFT VISUAL:
    WhatsApp conversation mockup (mobile screen, realistic UI)
    Shows the full flow: reminder → farmer reply → confirmation
    Use FlockIQ branding on the confirmation message
    Subtle WhatsApp green background (#ECF8F1)

BLOCK 3 (text left, visual right):
  EYEBROW: Price Intelligence
  TITLE: "Know the Right Time to Sell — 7 Days Ahead."
  BODY: "Our AI analyses 47 data sources — mandi prices, feed costs,
         weather, disease alerts — and tells you when to sell for maximum
         profit. 96.2% directional accuracy, verified on 847 predictions."

  FEATURE BULLETS:
    ✓ 7-day price forecast with P10/P50/P90 confidence bands
    ✓ Daily SELL / HOLD / WAIT signal at 6:30 AM on WhatsApp
    ✓ Batch ROI Optimizer: compare sell-today vs wait-3-days profit
    ✓ Middleman check: verify if trader offer is fair
    ✓ Coverage: India, Indonesia, Vietnam, Thailand (more coming)

  CTA: [View Price Intelligence →] → /features/price-intel
```

#### Section H-05: Key Stats / Trust Strip

```
BACKGROUND: #0D3B21 (dark brand)
PADDING: 64px vertical

LAYOUT: 4 stats with subtle glass card backgrounds

[STAT 1]
  Number: 96.2%
  Label: Directional Accuracy
  Sub: "Verified on 847 predictions | Last updated daily"
  Colour: white number, brand400 accent

[STAT 2]
  Number: 500+
  Label: Farms Onboarded
  Sub: "Across India, Indonesia, Vietnam"
  Colour: white number, brand400 accent

[STAT 3]
  Number: 97%
  Label: WhatsApp Log Compliance
  Sub: "vs 42% with manual data collection"
  Colour: white number, brand400 accent

[STAT 4]
  Number: ₹1.8L
  Label: Avg Annual Savings
  Sub: "Per farm, from timing + FCR improvements"
  Colour: white number, signal500 accent

DIVIDERS: glass20 vertical lines between stats
ANIMATION: counter-up on scroll (disabled with prefers-reduced-motion)
```

#### Section H-06: WhatsApp Log Automation (Flagship Feature Deep-Dive)

```
BACKGROUND: #F7FAF8
PADDING: sectionVertical

[EYEBROW pill - WhatsApp green]
★ FLAGSHIP FEATURE

[H2]
The WhatsApp Daily Log.
Your Farms Run Themselves.

[BODY]
"No other platform on earth does this. Your farmer gets a WhatsApp
 reminder. They type 2–3 numbers. Your dashboard is updated. You never
 make another data-collection call."

LAYOUT: 3-step process visual

STEP 1 (icon: bell):
  Title: "FlockIQ Sends a Daily Reminder"
  Body: "At your chosen time (default 6 PM), FlockIQ sends each farmer
         a structured WhatsApp message for their active batch."
  Visual: WhatsApp message screenshot — outbound message from FlockIQ

STEP 2 (icon: phone):
  Title: "Farmer Replies in 10 Seconds"
  Body: "The farmer types 3 numbers: birds dead, feed kg, optional weight.
         In Hindi or English. On any Android. No app needed."
  Visual: Farmer hand on phone, WhatsApp reply typed

STEP 3 (icon: check-circle):
  Title: "Data Auto-Logged. FCR Calculated."
  Body: "Within 60 seconds, the reply is parsed, validated, and saved to
         the farm's daily log. FCR is auto-calculated. Anomalies are flagged."
  Visual: Dashboard screenshot showing log submitted badge

STEP CONNECTORS: animated dashed arrow between steps (CSS animation, 2s loop)

BELOW STEPS — Evidence Box:

  ┌───────────────────────────────────────────────────────────────┐
  │  Before FlockIQ                   After FlockIQ               │
  │  ─────────────────                ───────────────────────     │
  │  📞 8 calls/evening     →         0 calls/evening            │
  │  📋 42% log compliance  →         97% log compliance         │
  │  ⏰ Data by 9:30 PM     →         Data by 6:15 PM            │
  │  ❌ Manual FCR calc     →         Automatic, instant         │
  │  😤 2 hrs/day admin     →         8 minutes/day              │
  └───────────────────────────────────────────────────────────────┘

  CTA: [Set Up WhatsApp Log Automation →] → /features/whatsapp-log
```

#### Section H-07: Testimonials

```
BACKGROUND: #FFFFFF
PADDING: sectionVertical

[EYEBROW]
REAL RESULTS

[H2]
Farms That Made the Switch

LAYOUT: 3 cards on desktop, horizontal scroll on mobile

CARD 1 (primary — large):
  Farm: "Shivaji Poultry Farm"
  Owner: Ramesh Yadav
  Location: Gorakhpur, Uttar Pradesh
  Flock: 25,000 Cobb 400
  Outcome badge: "₹1,24,000 saved — last 6 months"
  Verification: "✓ Verified against Gorakhpur APMC records"

  Quote (English):
  "Before, I called 3 traders every morning to guess prices. Now FlockIQ
   tells me. My last Cobb 400 batch sold at ₹172/kg — perfectly timed.
   4 out of 4 batches sold at the right moment this year."

  Quote (Hindi - shown on [हि] toggle):
  "पहले मैं 3 व्यापारियों को फोन करता था हर सुबह — अब FlockIQ बताता है।
   मेरे Cobb 400 बैच 38 दिन में 2.3 kg हो गए, और मैंने ₹172/kg पर बेचा
   — बिल्कुल सही समय पर। पिछले 4 batch में से 4 सही समय पर बेचे।"

  FCR Badge: "FCR 1.68 — Top 10% nationally"
  WhatsApp Badge: "Daily logs via WhatsApp ✓"

CARD 2:
  Farm: "Kumar Poultry Integrations"
  Owner: Suresh Kumar Patel
  Location: Deoria, UP — 8 farms managed
  Outcome badge: "₹3.2L saved from HPAI early warning"

  Quote:
  "HPAI alert aaya 48 ghante pahle — humne Ross 308 flock sell kar liya
   transport block se pehle. ₹3.2 lakh ki sambhavit hani se bache."

CARD 3:
  Farm: "Global Poultry Co."
  Manager: David Chen
  Location: Jakarta, Indonesia
  Flock: 120,000 birds (integrator)
  Outcome badge: "FCR improved 0.12 in 3 months"

  Quote (English):
  "We manage 12 farms across West Java. FlockIQ's WhatsApp log automation
   saved us from hiring 2 additional data collectors. The benchmark
   comparison shows exactly which farms need intervention."

BELOW CARDS:
  Press logos (greyscale → colour on hover):
  "As featured in:" Krishi Jagran | AgroStar | Economic Times | NABARD

  CTA: [Read All Case Studies →] → /case-studies
```

#### Section H-08: For Integrators vs For Farms

```
BACKGROUND: #EDF7F1
PADDING: sectionVertical

[EYEBROW]
BUILT FOR YOUR ROLE

[H2]
Whether You Manage 1 Farm
or 50 — FlockIQ Scales With You.

LAYOUT: 2 column cards (50/50)

LEFT CARD — For Integrators:
  Icon: building (brand700)
  Title: "For Integrators"
  Sub: "50,000 – 5,000,000 birds across multiple farms"

  Features:
    ✓ Multi-farm dashboard — all farms at a glance
    ✓ WhatsApp log automation — zero manual data collection
    ✓ Cross-farm FCR benchmarking + rankings
    ✓ Portfolio analytics — identify your best and worst performers
    ✓ Alert management — HPAI, weather, price crash across all farms
    ✓ Harvest queue optimizer — who to sell first, and when
    ✓ Field supervisor app — limited access for on-ground teams

  Pricing: "From ₹5,000/month"
  CTA: [Built for Integrators →] → /solutions/integrators

RIGHT CARD — For Farms:
  Icon: home (brand400)
  Title: "For Farm Owners"
  Sub: "10,000 – 500,000 birds on your own farm"

  Features:
    ✓ Single-farm batch management
    ✓ Daily log via WhatsApp (works for farmer directly)
    ✓ FCR tracking vs breed standard
    ✓ Price intelligence + sell signal
    ✓ HPAI disease alerts — 48h early warning
    ✓ Batch profit calculator
    ✓ FSSAI traceability reports

  Pricing: "From ₹2,000/month"
  CTA: [Built for Farms →] → /solutions/farms
```

#### Section H-09: Global Reach

```
BACKGROUND: #FFFFFF
PADDING: sectionVertical

[EYEBROW]
GLOBAL PLATFORM

[H2]
From Gorakhpur to Jakarta.
FlockIQ Works Everywhere.

[BODY]
"Built on local insights, deployed globally. Our AI adapts to regional
 mandi data, breed standards, and local regulations — so it works
 the same whether you're in UP, Java, or the Mekong Delta."

LAYOUT: World map SVG (stylized, brand colours) with location markers

MARKERS (with tooltip cards on hover/click):
  🇮🇳 India — Gorakhpur, Deoria, Kushinagar, Basti, Maharajganj
              + 8 more districts coming Q3 2026
  🇮🇩 Indonesia — West Java, East Java (pilot 2026)
  🇻🇳 Vietnam — Mekong Delta region (pilot 2026)
  🇹🇭 Thailand — Chiang Mai province (pilot 2026)
  🌍 Coming soon: Kenya, Nigeria, Bangladesh, Pakistan

BELOW MAP:
  3 trust logos: NABARD | DADF (India) | FAO (global)
  "Operating under DPDP Act 2023 (India) · GDPR-compatible data handling"
```

#### Section H-10: Pricing Teaser

```
BACKGROUND: #F7FAF8
PADDING: sectionVertical

[EYEBROW]
SIMPLE PRICING

[H2]
Start Free. Scale as You Grow.

[ROI ANCHOR - shown BEFORE prices]:
  "Based on 500+ farms: average annual savings of ₹1.8 lakh.
   FlockIQ pays for itself in the first batch."

LAYOUT: 3 pricing cards

CARD 1 — PulseFarm (₹2,000/month):
  For: Individual farms (10K–25K birds)
  Highlight: ₹67/day
  Features (5 bullets, most impactful)

CARD 2 — PulsePro (₹5,000/month) — MOST POPULAR:
  Badge: "Most Popular — Integrators"
  For: Integrators with up to 20 farms
  Includes: WhatsApp log automation + multi-farm dashboard

CARD 3 — Enterprise (Custom):
  For: Large integrators, feed companies, QSR chains
  Includes: API, white-label, dedicated support

BELOW CARDS:
  ROI Calculator strip:
  "Your farm size: [slider 10K → 200K birds]
   Your potential annual savings: ₹1,50,000
   PulseFarm annual cost: ₹24,000
   Net benefit: ₹1,26,000 — ROI: 525%"

  CTA: [See All Plans & Pricing →] → /pricing
```

#### Section H-11: Final CTA (Before Footer)

```
BACKGROUND: heroGradient (#1A5C34 → #0D3B21)
PADDING: 96px vertical

LAYOUT: Centered

[HEADLINE]
"Your Next Batch Starts Tomorrow.
 Will You Know When to Sell?"

[BODY — white/80%]
"Join 500+ farms already using FlockIQ across 15 countries.
 Free for 14 days. No credit card. Set up in 5 minutes on WhatsApp."

[CTA BUTTONS]
Primary:   [Start Your Free Trial →]  — signal orange, pill
Secondary: [📱 Try WhatsApp Demo]    — glass white

[TRUST STRIP below CTAs]
Security badges: DPDP Act 2023 | AWS Mumbai | ISO 27001 (if applicable) | 256-bit SSL

DECORATIVE: Subtle floating chicken silhouette icons (brand400, low opacity) in background
```

---

### PAGE 02: Solutions — For Integrators (`/solutions/integrators`)

**Purpose:** Convert integrator prospects. Speak directly to their pain of managing multiple farms with no unified visibility.**

```
HERO SECTION:
  BACKGROUND: Same dark green gradient as homepage
  HEADLINE: "Manage 20 Farms Like You Manage 1."
  SUBHEADLINE: "FlockIQ gives integrators a single command centre for
                 every farm in their network — with daily data collected
                 automatically via WhatsApp. No more morning phone calls."
  CTA: [Request Integrator Demo →] [See How It Works]

REFERENCE: Poultry.care broiler-management and PoultryPlan OptibroilerS
  Acknowledge these exist globally; position FlockIQ as better for India + SE Asia + MENA

SECTION: The Integrator's Daily Chaos
  Visual timeline of a manager's day WITHOUT FlockIQ:
  6 AM: Check WhatsApp groups (incomplete data)
  7 AM–9 AM: Call each farm (8 calls × 10 min = 80 min)
  9 AM: Enter data into Excel (error-prone)
  10 AM: Try to generate batch summary (another hour)
  Result: "By the time you have data, the market window has already moved."

  vs WITH FlockIQ:
  6:15 PM: All 8 farms log via WhatsApp automatically
  6:20 PM: Dashboard shows FCR, mortality, pending actions
  Morning: Price signal already on your phone at 6:30 AM

SECTION: Multi-Farm Dashboard (Product screenshots)
  Show: Portfolio overview with 8 farm cards
  Show: FCR comparison chart (your farms vs industry)
  Show: Harvest queue — which farms to sell first
  Show: Pending logs indicator (red badge if farmer hasn't replied)

SECTION: WhatsApp Log Automation — Deep Dive
  Full breakdown of how the automation works
  Show: sample outbound message, sample reply, confirmation
  Testimonial from an integrator about time saved

SECTION: Pricing for Integrators
  PulsePro: ₹5,000/month (up to 20 farms)
  PulseEnterprise: Custom (20+ farms)

  Feature table specific to integrators:
  | Feature                        | PulsePro | Enterprise |
  | Multi-farm dashboard           | ✓ 20     | Unlimited  |
  | WhatsApp log automation        | ✓        | ✓          |
  | Field supervisor access        | ✓ 5 users| Unlimited  |
  | Cross-farm FCR benchmarking    | ✓        | ✓          |
  | Harvest queue optimizer        | ✓        | ✓          |
  | Price intelligence (all mandis)| ✓        | ✓          |
  | API access                     | ✗        | ✓          |
  | White-label option             | ✗        | ✓          |
  | Dedicated account manager      | ✗        | ✓          |
  | Custom integrations (ERP/SAP)  | ✗        | ✓          |

CTA SECTION:
  Headline: "See how 3 integrators saved 500+ hours/year"
  CTA: [Request Integrator Demo] → /demo?segment=integrator
```

---

### PAGE 03: Solutions — For Farms (`/solutions/farms`)

```
HERO:
  HEADLINE: "Run Your Farm Like a Pro. From Your Phone."
  SUBHEADLINE: "Complete batch management, price intelligence, and daily
                 log automation — all in one app that works on WhatsApp."

SECTIONS:
  1. Pain points for individual farm owners
  2. How FlockIQ helps (batch lifecycle, FCR, price signal)
  3. WhatsApp log overview (farmer perspective)
  4. Pricing — PulseFarm ₹2,000/month
  5. Testimonials from farm owners
  6. CTA: Start free trial
```

---

### PAGE 04: Features — WhatsApp Log Automation (`/features/whatsapp-log`)

**This is the flagship feature page. Give it the most detail.**

```
HERO:
  BACKGROUND: WhatsApp-green gradient (#075E54 → #128C7E)
  HEADLINE: "Your Farmers Type 3 Numbers. You See Everything."
  SUBHEADLINE: "FlockIQ's WhatsApp Daily Log Automation is the first
                 system in the world that automatically collects farm data
                 via WhatsApp — no app, no training, no phone calls."
  CTA: [Set Up WhatsApp Automation → Free Trial]

SECTION: How It Works (3 steps, animated)
  Full visual walkthrough with WhatsApp UI mockups
  Step 1: FlockIQ sends the daily reminder (show exact message template)
  Step 2: Farmer replies (show natural language variations accepted)
  Step 3: Data auto-logged (show dashboard confirmation)

SECTION: What Farmers Actually Type (Examples)
  Box showing 10 different valid inputs:
    "2 1250 1680"      → accepted ✓
    "2 murgi mri, 1250 kg khaana" → accepted ✓
    "all good 1350"    → accepted ✓ (0 deaths assumed)
    "sab theek 1200kg" → accepted ✓
    etc.

SECTION: What Managers See (Dashboard screenshots)
  Farm card with "✓ Logged via WhatsApp — 6:14 PM"
  Daily log entry with source: WhatsApp indicator

SECTION: The Compliance Improvement
  Big stat: 42% → 97% log compliance
  Chart showing daily compliance before/after
  Quote from integrator

SECTION: Technical Details (for enterprise buyers)
  Powered by: Meta WhatsApp Business API
  Parser: NLP-based (Claude API optional tier)
  Validation: server-side range checking with anomaly detection
  Audit log: every message stored with timestamp + parsed values
  GDPR/DPDP compliant: explicit consent at onboarding
  Uptime: 99.9% SLA

SECTION: Pricing
  Included in: PulsePro + PulseEnterprise
  Add-on for: PulseFarm (₹500/month per farm)

CTA: Full-width green CTA section
  "Set Up WhatsApp Automation for Your Farms Today"
  [Start Free Trial] [Request Demo]
```

---

### PAGE 05: Features — Farm Management (`/features/farm-management`)

```
Reference: https://www.poultry.care/broiler-management
           https://www.poultryplan.com/solutions/optibroilers

HERO:
  HEADLINE: "Complete Poultry Farm Management. One Platform."
  SUBHEADLINE: "From DOC placement to harvest, FlockIQ tracks every
                 metric that matters — automatically."

SECTIONS (each with product screenshot):

1. Batch Lifecycle Management
   Screenshot: Batch status board (all batches, colour-coded)
   Features: DOC placement, milestone tracking, batch close, history

2. FCR & Feed Efficiency (reference OptibroilerS FCR module)
   Screenshot: FCR trend chart vs breed benchmark
   Features: Daily feed logging, auto FCR calc, benchmark comparison
   Breeds: Cobb 430, Ross 308, Hubbard Flex, Arbor Acres

3. Mortality Intelligence
   Screenshot: Mortality timeline + AI anomaly detection
   Features: Daily logging, cause categorization, AI pattern detection

4. Weight & Growth Tracking (reference poultry.care weight module)
   Screenshot: Weight gain curve vs target
   Features: Weekly weighing, growth curve overlay, deviation alerts

5. Health & Vaccination (reference poultry.care health events)
   Screenshot: Vaccination schedule + reminder
   Features: UP broiler protocol, WhatsApp reminders, withdrawal tracking

6. Inventory & Costing
   Screenshot: Batch P&L dashboard
   Features: Feed stock, medicine stock, real-time P&L

7. FSSAI Traceability (India-specific)
   Screenshot: One-click traceability PDF
   Features: AB-Free certification, HACCP compliance

COMPARISON TABLE vs competitors:
  | Feature                    | FlockIQ | Poultry.care | PoultryPlan | Spreadsheet |
  | Batch lifecycle management | ✓       | ✓            | ✓           | Manual      |
  | WhatsApp log automation    | ✓ UNIQUE| ✗            | ✗           | ✗           |
  | AI anomaly detection       | ✓       | Partial      | ✓           | ✗           |
  | Price intelligence         | ✓       | ✗            | ✓           | ✗           |
  | Works offline (mobile)     | ✓       | Partial      | ✗           | N/A         |
  | Hindi support              | ✓       | ✗            | ✗           | ✗           |
  | FSSAI traceability         | ✓       | ✗            | ✗           | Manual      |
  | WhatsApp delivery          | ✓       | ✗            | ✗           | ✗           |
  | India mandi price data     | ✓       | ✗            | ✗           | ✗           |

CTA: [Start Managing Your Farm with FlockIQ →]
```

---

### PAGE 06: Pricing (`/pricing`)

```
HERO:
  HEADLINE: "Invest ₹2,000/Month. Save ₹1.8L/Year."
  SUBHEADLINE: "Simple, transparent pricing. 14-day free trial.
                 Cancel anytime. No credit card required."

ROI ANCHOR (before prices):
  Interactive calculator:
  "Your farm: [slider: 10K–200K birds]"
  "Potential annual loss from timing: ₹1,50,000"
  "PulseFarm annual cost: ₹24,000"
  "Net ROI: ₹1,26,000 — 5.25× return"

PLANS (3 cards, annual/monthly toggle at top):

  PULSEFARM — ₹2,000/month (₹20,000/year with 2 months free):
    For: Individual farms, 10K–25K birds
    Highlight: "₹67/day — less than a cup of chai"
    Features:
      ✓ 7-day price forecast (1 mandi)
      ✓ Daily SELL/HOLD/WAIT signal on WhatsApp
      ✓ Batch lifecycle management (1 farm)
      ✓ FCR tracking + breed benchmarks
      ✓ Daily mortality tracking
      ✓ Vaccination scheduler
      ✓ HPAI disease alerts
      ✓ WhatsApp delivery of all alerts
      ✓ Hindi + English supported
      ✓ 14-day free trial
      ✗ Multi-farm dashboard
      ✗ WhatsApp log automation (add-on ₹500/mo)
      ✗ API access
    CTA: [Start 14-Day Free Trial]

  PULSEPRO — ₹5,000/month (₹50,000/year) — MOST POPULAR badge:
    For: Integrators, up to 20 farms, 25K–500K birds
    Features:
      Everything in PulseFarm, plus:
      ✓ Multi-farm dashboard (up to 20 farms)
      ✓ WhatsApp log automation (all farms included)
      ✓ Cross-farm FCR benchmarking
      ✓ Harvest queue optimizer
      ✓ Portfolio analytics + reports
      ✓ Field supervisor access (5 users)
      ✓ Price intelligence (all covered mandis)
      ✓ P10/P50/P90 band charts
      ✓ Priority support (4-hour response)
      ✗ API access
      ✗ White-label
    CTA: [Start Free Trial] [Book a Demo]

  PULSEENTERPRISE — Custom:
    For: Large integrators (500K+ birds), feed companies, QSR chains
    Features:
      Everything in PulsePro, plus:
      ✓ Unlimited farms
      ✓ REST API access (rate-limited or unlimited)
      ✓ 12 months historical data
      ✓ Custom district/country coverage
      ✓ ERP integrations (Tally, Zoho, SAP)
      ✓ IoT device integration
      ✓ FSSAI traceability suite
      ✓ White-label option
      ✓ HACCP compliance module
      ✓ Dedicated account manager
      ✓ SLA: 99.9% uptime
    CTA: [Talk to Sales]

FULL FEATURE COMPARISON TABLE (collapsible, click to expand):
  Rows: All features grouped by category
  Columns: PulseFarm | PulsePro | Enterprise
  (Full detailed table — see requirements doc for complete list)

FAQ (accordion, 6 questions):
  - Is there really no credit card for the free trial?
  - Can I upgrade or downgrade my plan?
  - How does billing work?
  - What happens after the trial ends?
  - Is my data secure?
  - Can I get a refund?
```

---

### PAGE 07: Accuracy (`/accuracy`)

```
HERO (dark background):
  HEADLINE: "The Most Transparent AI in Poultry."
  SUBHEADLINE: "Every prediction. Every error. Published publicly.
                 We never hide bad days. Because farmers deserve truth."

LIVE METRICS STRIP:
  ● 96.2% Directional Accuracy (target: 95%+) [green]
  ● 4.8% MAPE (target: <6%) [green]
  ● 80.1% Conformal Coverage (target: 78–82%) [green]
  ● 847 Predictions Verified
  "Updated daily — last: June 1, 2026 10:43 AM IST"

SECTIONS:
  1. 30-Day MAPE Trend Chart (live from Supabase)
  2. Prediction History Table (filterable by date/district)
  3. Methodology accordion
  4. Feature Importance chart (top 5 SHAP features)
  5. Stress Test Results (how model performed during HPAI Nov 2025)
  6. Manual Validation Attestation (10-day APMC physical validation story)
  7. Expert Endorsements (Dr. Rajesh Kumar, Dr. Sunita Verma, Prof. Anil Sharma)

ACCURACY GUARANTEE BOX:
  "If our rolling 30-day accuracy drops below 95%, you get that month free.
   Automatically. No claim needed."
  Style: brand green bg, white text, prominent

  NOTE FOR ENGINEER: Update all references from "PoultryPulse" to "FlockIQ"
                     Update meta title to FlockIQ branding
```

---

### PAGE 08: About (`/about`)

```
HERO:
  HEADLINE: "Built in Gorakhpur. Deployed Globally."
  SUBHEADLINE: "We believe every poultry farmer — from UP to Jakarta —
                 deserves the same information advantage that large
                 processors have had for decades."

SECTIONS:
  1. Our Impact (numbers — 500+ farms, 15+ countries, ₹500+ Cr in advised sales)
  2. Our Mission (the mission statement, founder quote)
  3. Our Story (narrative — started as price forecasting, pivoted to full platform)
  4. The 10 Days at Gorakhpur APMC (physical validation story)
  5. Our Values (Farmer-First, Transparency, Accuracy First, Global Mindset)
  6. Our Team (CTO, Head Data, Head Product, Head Agriculture)
  7. Data Partners (AGMARKNET, IMD, NECC, DAHDF, NCDEX)
  8. Our Journey (Phase 0 launch → Phase 1 UP Expansion → Phase 2 Pan-India → Phase 3 Global)
  9. Press & Media (media kit download)
  10. Investor Information (Investor Data Room link, password-protected)

DESIGN NOTE:
  Section 3 (Our Story) should clearly explain the pivot from price-forecasting-only
  to full poultry management platform. This is important for brand authenticity.
  The story arc: "We started solving price timing. Then farmers asked us to
  help them manage their flocks. Then integrators asked for multi-farm tools.
  FlockIQ is what emerged."
```

---

### PAGE 09: Login (`/login`)

```
LAYOUT: Split screen (50/50 on desktop, full screen form on mobile)

LEFT PANEL (brand):
  Background: heroGradient
  Content:
    FlockIQ logo (white, large)
    Tagline: "Smarter Flocks. Smarter Returns."
    3 testimonial quotes (auto-rotating, 5s interval)
    Trust badges at bottom (DPDP, SSL, AWS Mumbai)

RIGHT PANEL (form):
  Background: white
  Max-width: 440px, centered

  HEADING: "Welcome back to FlockIQ"
  SUB: "Enter your WhatsApp number to continue"

  TABS (two login methods):
    [📱 Phone OTP ●] [✉ Email]

  PHONE OTP TAB:
    "+91" dropdown + 10-digit input
    [Send OTP →] button (brand green, full width)
    Language switch: [English ●] [हिंदी] (pill toggle, English default)
    OTP verification: 6-box OTP entry, 2-minute countdown
    "Didn't receive OTP?" resend link (active after 60s)

  EMAIL TAB:
    Email input
    Password input (with show/hide toggle)
    [Login →] button
    Forgot password link

  BELOW FORM:
    Divider: "or"
    [📲 Continue with Google] (if implemented)
    "Don't have an account? Start free trial →" link

  LEGAL: "By continuing, you agree to our Terms of Service and Privacy Policy."
  Font: 12px, neutral500

  MOBILE: Full screen, no split; logo top-centered; same form
```

---

### PAGE 10: Signup / Onboarding (`/signup` → `/onboarding`)

```
FLOW: 4-step wizard on green background

STEP INDICATOR: "Step N of 4" + progress bar (brand400)
BACKGROUND: #0D3B21 → #1A5C34 gradient
CARD: white, max-width 540px, centered, border-radius 24px, shadow-xl

STEP 1: Welcome + Phone
  Content from current design — KEEP (works well)
  IMPROVEMENT: Add country selector ABOVE phone input (for global market)
    Flag + Country: [🇮🇳 India (+91) ▾]
    Supports: India, Indonesia (+62), Vietnam (+84), Thailand (+66), Other (+XX)
  IMPROVEMENT: Show what happens next as checklist (already designed well)
  IMPROVEMENT: Background shows animated data stream visual (subtle, CSS)

STEP 2: Plan Confirmation
  Content from current design — KEEP
  IMPROVEMENT: Remove warning about "plan lock" — this is anxiety-inducing
  IMPROVEMENT: Add "What's included today (free trial)" list
  IMPROVEMENT: Reassurance: "Switch plans anytime in Settings"

STEP 3: WhatsApp Verification
  Content from current design — KEEP
  IMPROVEMENT: Make "Test Message" flow more prominent
  IMPROVEMENT: Add language selector (Hindi/English) for WhatsApp messages

STEP 4: Completion
  Content from current design — KEEP
  IMPROVEMENT: 3 distinct next-step buttons:
    Primary:   [Go to Dashboard →]
    Secondary: [📱 Download App]
    Tertiary:  [Set Up WhatsApp Log for My Farm →] ← highlight this for integrators
  IMPROVEMENT: Add "Share with a friend — earn ₹500" referral section

MOBILE DESIGN:
  Same card-based wizard, full-screen on mobile
  Back button top-left (← Previous)
  Progress indicator top-right (X/4)
```

---

## 4. NAVIGATION — FOOTER

```
FOOTER LAYOUT:
  BACKGROUND: #0D1F16 (near-black green)
  PADDING: 80px top, 40px bottom
  MAX-WIDTH: 1280px centered

SECTION 1 — BRAND (leftmost, 1.5 columns):
  FlockIQ logo (white)
  Tagline: "Smarter Flocks. Smarter Returns."
  Description: "The poultry management platform for integrators and farms —
                 from India to Southeast Asia."
  Social icons: LinkedIn | Twitter/X | YouTube | WhatsApp
  App store badges: App Store | Google Play

SECTION 2 — PRODUCT:
  How It Works
  Features
  WhatsApp Log Automation ← highlight
  Price Intelligence
  Accuracy
  Pricing

SECTION 3 — SOLUTIONS:
  For Integrators
  For Farms
  Enterprise
  Free Disease Alerts
  Loss Calculator
  Book Demo

SECTION 4 — RESOURCES:
  Blog
  Case Studies
  Glossary
  FAQ
  Developers / API Docs
  Changelog

SECTION 5 — LOCATIONS (India):
  Gorakhpur
  Deoria
  Kushinagar
  Basti
  Maharajganj
  All Locations →

SECTION 6 — LEGAL:
  Privacy Policy
  Terms of Service
  Compliance (DPDP)
  Refund Policy

BOTTOM BAR (separated by divider):
  LEFT: © 2026 FlockIQ Technologies Pvt. Ltd. | CIN: U01404UP2026PTC123456
  CENTER: [🇮🇳 India] [🇮🇩 Indonesia] [🌍 Global] (country selector)
  RIGHT: DPDP Act 2023 | IT Act 2000 | AWS Mumbai 🔒

TYPOGRAPHY: all footer text 14px, #9BBDA8 (muted green)
LINK HOVER: colour → #FFFFFF, transition 150ms
```

---

## 5. MOTION & ANIMATION SYSTEM

### 5.1 Core Animation Principles

```
PHILOSOPHY: "Animation communicates — it is never decoration."

MOTION BUDGET PER SECTION:
  Hero:              High (8/10) — brand first impression
  Problem section:   Medium (5/10) — make pain feel real
  How It Works:      High (7/10) — step-by-step guidance
  WhatsApp Feature:  High (8/10) — show the magic
  Stats strip:       Low (4/10) — trust, not flash
  Testimonials:      Medium (5/10) — human warmth
  Pricing:           Low (3/10) — clarity above all
  FAQ:               Low (2/10) — functional only
  Footer:            None (0/10)

SPRING PHYSICS (Framer Motion):
  Entrance: type:'spring', stiffness:100, damping:20
  Exit:     type:'tween', duration:0.2, ease:'easeIn'
  Hover:    duration:0.15, ease:'easeOut'

EASING FUNCTIONS:
  Entrance: cubic-bezier(0.16, 1, 0.3, 1) — easeOutExpo
  Exit:     cubic-bezier(0.4, 0, 1, 1) — easeIn
  Hover:    cubic-bezier(0.0, 0, 0.2, 1) — easeOutCirc

DEVANAGARI TEXT RULE:
  NEVER animate transform + opacity simultaneously on Hindi text blocks
  (Noto Sans Devanagari is heavy — this causes jank on mid-range Android)
  Animate OPACITY ONLY for Hindi text
  All other animations: English text only
```

### 5.2 Component-Level Animation Specs

```typescript
// FadeUp (primary entrance — use for all section content)
const fadeUp = {
  hidden: { opacity: 0, y: 24, filter: 'blur(4px)' },
  visible: {
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] }
  }
};

// StaggerChildren (for card grids, feature lists)
const staggerContainer = {
  visible: { transition: { staggerChildren: 0.08 } }
};

// Counter (for stat numbers)
// Triggered by IntersectionObserver
// Duration: 1.2s easeOutExpo
// prefers-reduced-motion: skip to final value immediately

// HeroPhoneMockup (floating)
const phoneFloat = {
  animate: {
    y: [0, -8, 0],
    transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' }
  }
};

// Card hover
const cardHover = {
  scale: 1.015,
  boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
  transition: { duration: 0.15, ease: [0, 0, 0.2, 1] }
};

// WhatsApp message bubble (typing indicator → message appear)
// Step 1: 3 dots typing indicator (800ms)
// Step 2: fade-in message bubble (400ms)
// Step 3: green tick appears (200ms)
// Uses CSS @keyframes, not Framer (performance)

// Step-by-step reveal (How It Works section)
// Each step: FadeUp with 0.15s delay increment
// Connector line: grows from 0% to 100% width, 600ms, after preceding step

// Counter animation (stat numbers)
// startValue: 0
// endValue: the target number
// duration: 1200ms
// easing: easeOutExpo
// IMPORTANT: decimals → always show 1 decimal place during animation
```

### 5.3 Page Transition

```
Navigation between pages:
  Outgoing page: fade out (opacity 0, 200ms)
  Incoming page: fade in + slide up 16px (300ms, easeOutExpo)
  Total: 400ms (barely noticeable, feels snappy)

Implemented in: Next.js layout.tsx with AnimatePresence
```

---

## 6. EXTERNAL ASSETS & ILLUSTRATIONS

### 6.1 Illustration Style

```
STYLE: Semi-abstract, isometric-influenced line art
       Modern but approachable — not Silicon Valley generic
       Characters: South Asian / global representation
       Colour palette: limited to brand token colours (brand50–brand700)

ILLUSTRATIONS NEEDED:
  - Hero: abstract farm/data visualization (SVG, animated particles)
  - Empty state (no farms): isometric farm with WhatsApp icon
  - Empty state (no alerts): green checkmark with farm scene
  - Empty state (no blog posts): writing desk illustration
  - 404 page: confused chicken + map pin illustration
  - Case study thumbnails: minimalist farm illustrations
  - Blog category icons: 4 custom SVG icons

SOURCE: Custom-designed or from undraw.co (customize colours to FlockIQ tokens)
FORMAT: SVG only (no PNG/JPG for UI illustrations — scalable + smaller)
LAZY LOAD: All illustrations loaded with loading="lazy" attribute
```

### 6.2 Photography Direction

```
IF using real photos:
  - Actual farm settings (real sheds, real birds, real farmers)
  - Not stock photo farmers with perfect lighting
  - Gorakhpur/UP context: mustard fields, morning light, mobile phones
  - Farmer using phone = always Android (target audience)
  - No staged "happy farmer with laptop" shots

Format: WebP with AVIF first-choice, JPEG fallback
Sizes: 400w, 800w, 1200w (responsive srcset)
Lazy loading: loading="lazy" on all below-fold images
Alt text: always meaningful, bilingual preferred
```

### 6.3 Icon System

```
LIBRARY: Phosphor Icons (React version) — consistent, rounded, professional
ALTERNATIVE: Lucide React (for components that need Lucide compatibility)

CUSTOM ICONS needed (as SVG components):
  - FlockIQ logo mark (chicken + arrow)
  - WhatsApp log automation flow icon
  - Mandi (market) icon
  - Broiler chicken silhouette (for empty states)
  - FCR meter icon (gauge-style)
  - Batch lifecycle icon (timeline arc)

ICON SIZING:
  Navigation: 20px
  Feature cards: 32px
  Empty states: 80px
  Toast/alerts: 16px
```

---

## 7. SEO & META DESIGN

### 7.1 OG Image Design System

```
ALL OG images: 1200×630px, generated dynamically via /api/og
FONT: Sora (pre-loaded in edge function)
BACKGROUND: dark green gradient (heroGradient)

TEMPLATE VARIABLES per page:
  - Page title (white, 48px Sora 800)
  - Page subtitle (white/70%, 24px Plus Jakarta Sans)
  - FlockIQ logo (white, top-left)
  - Relevant icon/illustration (top-right)
  - Trust stats at bottom (accuracy %, farms count)

PAGES with custom OG:
  Homepage, Pricing, Accuracy, Features, WhatsApp Log, About,
  each Blog post, each Case Study, each Location page
```

### 7.2 Structured Data

```
All pages: Organization schema (FlockIQ)
Homepage: WebSite + SearchAction schema
Pricing: Product schema (each plan)
Blog posts: Article schema
Case Studies: Article + Review schema
FAQ page: FAQPage schema
Location pages: LocalBusiness schema + Place schema
How It Works: HowTo schema
Accuracy: Dataset schema

JSON-LD injected via Next.js metadata API in each page's layout
```

---

## 8. ACCESSIBILITY (WCAG 2.1 AA)

```
CONTRAST RATIOS (all must pass 4.5:1 for text):
  Body text (#334D3E on #FFFFFF): 7.2:1 ✓
  Brand button text (#FFFFFF on #1A5C34): 7.1:1 ✓
  Accent text (#3DAE72 on #FFFFFF): 3.1:1 ✗ — never use as text colour
  Accent text (#3DAE72 on #0D3B21): 5.8:1 ✓ — use on dark backgrounds only

KEYBOARD NAVIGATION:
  All interactive elements: Tab order logical
  Custom dropdowns: arrow keys navigate, Enter selects, Escape closes
  Modal/overlay: focus trap while open, restore focus on close
  Skip to main content: visually hidden, visible on focus

SCREEN READER:
  All images: meaningful alt text
  Charts: data table alternative (toggle "View as table")
  Form fields: aria-label or associated <label>
  Error messages: aria-live="assertive"
  Loading states: aria-busy="true" on loading containers

HINDI TEXT ACCESSIBILITY:
  lang="hi" attribute on all Hindi text blocks
  Font: Noto Sans Devanagari (renders correctly on all OS)
  Min font size: 15px for Hindi (Latin can go to 13px)
  Line height: 1.7 minimum for Devanagari

MOBILE TOUCH:
  All touch targets: minimum 44×44px
  Tap highlights: visible (not hidden with -webkit-tap-highlight-color: transparent)
```

---

## 9. RESPONSIVE BREAKPOINTS

```
Breakpoints:
  mobile-sm:   320px  (iPhone SE — minimum supported)
  mobile:      375px  (iPhone 12/13/14 standard)
  mobile-lg:   428px  (iPhone Plus / large Android)
  tablet:      768px  (iPad portrait, large Android tablet)
  tablet-lg:   1024px (iPad landscape, small laptops)
  desktop:     1280px (standard laptop)
  desktop-xl:  1440px (large monitor)
  desktop-2xl: 1920px (full HD — max content width 1440px, sides blank)

GRID BEHAVIOR:
  <768px:   1-column (most content), 2-column (some cards)
  768–1023px: 2-column (most), 3-column (where appropriate)
  1024–1279px: 3-column (most), 4-column (stat strips)
  ≥1280px:  Full multi-column as designed

FONT SCALING:
  All fonts use clamp() — scale smoothly, no sudden jumps
  Minimum font size: 13px (body small) — never smaller
  Maximum font size: bounded by upper clamp value

IMAGE RESPONSIVE:
  All images: srcset with 400w, 800w, 1200w variants
  sizes attribute: appropriate for container width
  Loading: eager for above-fold, lazy for below-fold
```

---

*End of FlockIQ Pre-Login Website Design Master v3.0*
*Companion documents:*
*  - FlockIQ_PreLogin_Requirements_v3.md*
*  - FlockIQ_PreLogin_Tasks_v3.md*

---

## APPENDIX A: GAP-FILLED FEATURE ADDITIONS TO PRE-LOGIN WEBSITE

The following 7 competitive gaps (identified vs PoultryPlan OptibroilerS + Poultry.care) are now solved
features in FlockIQ. Each gap has corresponding pre-login marketing content.

---

### A.1 Batch P&L — Full Cost Tracking (GAP 1)

**Where on pre-login website:**
  - /features/farm-management → new subsection "Batch P&L & Cost Tracking"
  - /pricing → add "Full Batch P&L" as feature row in all plans
  - Homepage Section H-04 Block 1 → add bullet: "✓ Full batch P&L — chick cost, feed, medicine, labour"

**Marketing copy:**
  Headline: "Know Your True Batch Profit to the Rupee."
  Body: "FlockIQ tracks every cost: chick purchase price, feed, medicine, vaccines,
         labour, electricity, and litter. See your running live cost-per-bird at any
         moment. At batch close, get a complete P&L statement — not an estimate."

**Feature list for /features/farm-management:**
  ✓ Chick (DOC) cost entry at placement
  ✓ Running live cost-per-bird (auto-calculated daily)
  ✓ Medicine & vaccine cost journal (per treatment event)
  ✓ Labour cost (daily or weekly entry)
  ✓ Overhead entry (electricity, litter, water — batch or monthly)
  ✓ Batch close P&L statement with full cost breakdown
  ✓ Gross margin % and ROI per batch
  ✓ Compare P&L across batches (is your profitability improving?)

**Comparison table addition (already in features page):**
  | Full Batch P&L (all cost types) | FlockIQ ✓ | Poultry.care ✓ | PoultryPlan ✓ | Spreadsheet Manual |

---

### A.2 Bird Lifting / Sales Management (GAP 2)

**Where on pre-login website:**
  - /features/farm-management → new subsection "Bird Lifting & Sales"
  - /solutions/integrators → add in harvest workflow section

**Marketing copy:**
  Headline: "From Harvest Decision to Final Invoice — Managed in FlockIQ."
  Body: "Record every sale event — full flock or partial lift. Log live weight,
         buyer name, price per kg, transport details. FlockIQ auto-closes the
         batch and calculates final P&L from actual sale price, not estimates."

**Feature list:**
  ✓ Sale event recording (date, birds sold, live weight, price/kg, buyer)
  ✓ Partial harvest support (sell 30% now, rest in 3 days)
  ✓ Actual vs estimated live weight comparison
  ✓ Buyer/trader contact book (reuse contacts across batches)
  ✓ Transport lifting details (vehicle, driver, departure time, destination)
  ✓ Auto batch-close on final lift (locks batch data, generates P&L)
  ✓ Harvest timing integration with price signal (sell today vs wait N days)

**Integrators page addition:**
  Section: "Harvest Queue Optimizer"
  "FlockIQ shows you every farm approaching harvest-ready age with current
   price signals. Decide the sell order across all farms from one screen.
   Record each lift with buyer, weight, and price — FlockIQ handles the P&L."

---

### A.3 Medication & Treatment Tracking (GAP 3)

**Where on pre-login website:**
  - /features/farm-management → expand Health & Biosecurity subsection
  - /features/whatsapp-log → add: farmers can log medicine intake via WhatsApp reply
  - Compliance page → FSSAI traceability section

**Marketing copy:**
  Headline: "Never Miss a Withdrawal Period. Stay FSSAI-Compliant."
  Body: "FlockIQ tracks every medicine given — dosage, duration, withdrawal period.
         If birds are approaching sale-date but withdrawal hasn't cleared, FlockIQ
         alerts you. Automatically. Before it becomes a legal problem."

**Feature list:**
  ✓ Medicine name, brand, batch number logging
  ✓ Dosage per bird or per litre of water
  ✓ Treatment duration (Day 5 to Day 8 — schedule view)
  ✓ Withdrawal period auto-calculation from treatment end date
  ✓ ⚠ Alert if harvest date is before withdrawal period clears
  ✓ AB-Free batch certification (auto-generated when zero antibiotic use)
  ✓ Treatment cost tracking (integrates into Batch P&L)
  ✓ Vet recommendation logging (who prescribed, when)
  ✓ FSSAI traceability PDF includes full medication history

**WhatsApp integration:**
  Farmers can report medicine administration via WhatsApp reply:
  "MEDICINE Tylosin 2ml/L Day-5 to Day-8"
  System parses and records; integration manager sees update on dashboard

---

### A.4 Environment Data Tracking (GAP 4)

**Where on pre-login website:**
  - /features/farm-management → new subsection "Environment Monitoring"
  - /features/farm-management → IoT section → mention humidity + ammonia sensors

**Marketing copy:**
  Headline: "Temperature Is Not Enough. Track What Actually Causes Disease."
  Body: "Humidity above 70% and ammonia above 25 ppm are the two biggest
         drivers of respiratory disease in broilers. FlockIQ tracks both — via
         manual entry or connected IoT sensors — and alerts you before your
         flock's lungs do."

**Feature list:**
  ✓ Temperature (min/max/current) — manual or IoT
  ✓ Humidity % — manual or IoT sensor
  ✓ Ammonia level (ppm) — manual or IoT sensor
  ✓ Light programme (hours of light per day)
  ✓ Ventilation settings (fan speed %, curtain position)
  ✓ Environment score (composite: temp + humidity + ammonia)
  ✓ Alert: humidity >70% → "Respiratory disease risk elevated"
  ✓ Alert: ammonia >25ppm → "Reduce stocking density / improve ventilation"
  ✓ Correlation analysis: environment score vs FCR vs mortality (see patterns)
  ✓ IoT integration: automatic logging from compatible sensors (Enterprise)

**Comparison table addition:**
  | Humidity + Ammonia Monitoring | FlockIQ ✓ | Poultry.care ✓ | PoultryPlan ✓ | Spreadsheet ✗ |

---

### A.5 Flock Benchmarking vs Breed + Region Group (GAP 5)

**Where on pre-login website:**
  - /features/farm-management → "Network Benchmarking" subsection
  - /solutions/integrators → data-driven management section
  - Homepage Section H-05 stats strip → update "Platform Average" to "Breed-Matched Average"

**Marketing copy:**
  Headline: "Compare Yourself to Farms Like Yours — Not a Random Average."
  Body: "FlockIQ benchmarks your Cobb 430 farm in UP against other Cobb 430 farms
         in UP — same breed, same region, same conditions. See if your FCR is in
         the top 25% or bottom 25% of your peer group. Then understand why."

**Feature list:**
  ✓ Breed-filtered benchmarking (Cobb 430 vs Cobb 430 peers)
  ✓ Region-filtered benchmarking (UP belt vs all-India)
  ✓ Batch-size peer matching (similar flock sizes only)
  ✓ Metrics compared: FCR, mortality %, daily gain, harvest age
  ✓ Percentile ranking: "Your FCR puts you in the top 23% of Cobb 430 farms"
  ✓ Historical trend: "You were bottom 40% 6 months ago — now top 23%"
  ✓ Anonymous — no farm names, only aggregate benchmarks visible
  ✓ Integrator portfolio: see each farm's breed-matched percentile ranking

**Integrators page section addition:**
  "Cross-Farm Performance Intelligence"
  "See not just how your farms compare to each other, but how they rank
   against the FlockIQ network of similar farms. Breed-matched. Region-matched.
   This tells you which farms have a structural performance problem vs just
   a bad batch."

---

### A.6 Calamity Warning System — Per-Farm Risk Score (GAP 6)

**Where on pre-login website:**
  - /features/farm-management → new section "Farm-Level Disease Risk Intelligence"
  - Homepage H-03 (Pain section) → update HPAI pain card
  - /free-disease-alerts → upgrade the value proposition
  - /solutions/integrators → risk management section

**Marketing copy:**
  Headline: "Not Just 'HPAI Nearby' — But 'Your Farm's Risk Score Is 8/10'."
  Body: "When HPAI is detected 80km away, FlockIQ calculates a personalized
         risk score for each of your farms — factoring proximity, flock age,
         vaccination status, biosecurity rating, and wind direction. You get
         the right alert for the right farm, with the right urgency."

**Feature list:**
  ✓ Per-farm HPAI proximity risk score (1–10)
  ✓ Risk factors: distance to outbreak, flock age, vaccination status, biosecurity score
  ✓ Wind-direction-adjusted proximity (HPAI aerosol spread risk)
  ✓ Farm-level recommended action (different for each risk level)
  ✓ Disease risk score history (track risk over time per farm)
  ✓ "Pre-sell recommendation" when risk score > 7 (sell before transport ban)
  ✓ For integrators: risk heatmap showing all farms colour-coded by risk score
  ✓ Integration with harvest decision: FlockIQ recommends accelerating sale if risk high

**Free Disease Alerts page upgrade:**
  Old value prop: "Get HPAI alerts 48 hours before public news"
  New value prop: "Know your farm's specific disease risk score — not just a district alert"
  Add tier comparison:
    Free: District-level disease alerts (48hr early)
    PulseFarm: Farm-level risk score + biosecurity recommendations
    PulsePro: Risk score across all farms + harvest decision integration

---

### A.7 Document Library per Flock/Batch (GAP 7)

**Where on pre-login website:**
  - /features/farm-management → new subsection "Batch Document Library"
  - /features/farm-management → FSSAI Traceability section (link documents)
  - /solutions/integrators → compliance & audit readiness section

**Marketing copy:**
  Headline: "Every Batch. Every Document. Always Findable."
  Body: "DOC purchase invoice, lab reports, vaccination certificates, movement
         permits, buyer invoices — all attached to the batch they belong to.
         When the auditor comes, you're ready in 30 seconds, not 3 days."

**Feature list:**
  ✓ Document upload per batch (PDF, JPG, PNG — max 10MB per file)
  ✓ Document categories: DOC Invoice | Lab Report | Vaccination Certificate | Movement Permit | Buyer Invoice | Other
  ✓ Search across all documents by batch, date, type
  ✓ Document preview in-app (no download required)
  ✓ Auto-include in FSSAI traceability PDF export
  ✓ Share document via WhatsApp or email (secure link, 24h expiry)
  ✓ Storage: 5GB per integrator account, 1GB per farm account
  ✓ DPDP-compliant storage (AWS Mumbai, encrypted at rest)
  ✓ Audit log: every document view/download logged with timestamp

**Integrators page addition:**
  "Audit-Ready in 30 Seconds"
  "Government inspection? Insurance claim? Loan application?
   Every document for every batch is organised and searchable.
   Generate a complete batch dossier — all documents + P&L + health records
   — with one click."


---

## APPENDIX B: COMPLETE PAGE DESIGNS — REMAINING PAGES

---

### PAGE B-01: WhatsApp Log Automation (`/features/whatsapp-log`) — Full Design

```
HERO SECTION:
  BACKGROUND: WhatsApp-green gradient (#075E54 → #128C7E)
               + subtle hexagonal grid pattern overlay (SVG, 4% opacity white)
  MIN-HEIGHT: 80vh (not full-screen — this is a feature page, not homepage)

  EYEBROW PILL (WhatsApp green variant):
  ┌─────────────────────────────────┐
  │  💬 Powered by WhatsApp Business │
  └─────────────────────────────────┘

  HEADLINE (white):
  "Your Farmers Type 3 Numbers.
   You See Everything."

  SUBHEADLINE (white/80%):
  "The only poultry platform that automatically collects daily farm data
   via WhatsApp — no app install for the farmer, no phone calls for you."

  CTAs:
  Primary:   [Set Up WhatsApp Log — Free →] → /signup
             Style: white bg, #075E54 text, pill shape (inverted — stands out on green)
  Secondary: [See it in 60 seconds] → plays inline demo video

  TRUST PROOF below CTAs:
  "97% log compliance rate | 500+ farms across 15 countries | <60s parse time"

  HERO VISUAL (right side):
  Animated WhatsApp conversation (CSS animation, not video):
  Frame 1 (0–2s): FlockIQ sends reminder
    ┌──────────────────────────────┐
    │ 🐔 FlockIQ — Shivaji Farm   │ (left bubble — FlockIQ)
    │ Day 21 daily log:           │
    │ Reply: [deaths] [feed kg]   │
    │ Example: 2 1350             │
    └──────────────────────────────┘
  Frame 2 (2–3s): typing indicator appears (right side)
    • • • (animated dots)
  Frame 3 (3–4s): Farmer reply appears
    ┌──────────────────┐
    │ 2 1250 1680      │ (right bubble — farmer, WhatsApp blue)
    └──────────────────┘
  Frame 4 (4–5s): "Sending..." → double tick → blue tick
  Frame 5 (5–7s): Confirmation
    ┌──────────────────────────────────┐
    │ ✅ Log saved — Day 21           │ (left bubble — FlockIQ)
    │ Deaths: 2 | Feed: 1250 kg       │
    │ FCR (est): 1.82 ✓ On target    │
    └──────────────────────────────────┘
  Frame 6 (7–8s): Dashboard notification appears (floating card)
    ┌───────────────────────────────┐
    │ ✓ Shivaji Farm — Day 21 logged │
    │ Via WhatsApp — 6:03 PM        │
    └───────────────────────────────┘
  Loop back to Frame 1 after 2s pause

SECTION B-01-02: How It Works (3 Steps)
  BACKGROUND: white
  STEP LAYOUT: 3-column grid, centered, with connecting dashed arrows

  Step numbering style:
    Large "01" in brand100 (#D4EFDE) as background element
    Icon overlaid on number (32px, brand700)
    Title below (h3, neutral900)
    Body text (bodyBase, neutral600)

  CONNECTOR STYLE (between steps):
    Dashed line: 2px dashed brand300
    Arrow head at right end: brand400
    Animation: line draws left-to-right, 600ms, after preceding step fades in

SECTION B-01-03: Farmer Input Examples
  BACKGROUND: #0D3B21 (brand900, dark)
  TITLE: "Every Way a Farmer Can Reply" (white)
  SUBTITLE: "FlockIQ understands all of these" (white/70%)

  TERMINAL CARD (dark card, monospace font):
  BACKGROUND: #0F2218 (slightly lighter than section bg)
  BORDER: 1px solid rgba(61,174,114,0.25)
  BORDER-RADIUS: 16px
  PADDING: 32px

  Each row:
  [Input type badge] [Farmer input in brand400 monospace] → [Parsed result in white/60%]

  TYPE BADGES:
    Standard → grey pill
    Hindi → saffron pill  
    Shorthand → brand pill
    Medicine → amber pill

  ROW EXAMPLES:
  [Standard]  "2 1250"                          → Deaths: 2 | Feed: 1250 kg
  [Standard]  "2 1250 1680"                     → Deaths: 2 | Feed: 1250 kg | Weight: 1680g
  [Hindi]     "2 murgi mri, 1250 kg khaana"     → Deaths: 2 | Feed: 1250 kg
  [Hindi]     "sab theek 1200"                  → Deaths: 0 | Feed: 1200 kg
  [Shorthand] "all good 1350"                   → Deaths: 0 | Feed: 1350 kg
  [Shorthand] "ok d:1 f:1380 w:1690"            → Deaths: 1 | Feed: 1380 kg | Weight: 1690g
  [Standard]  "3 deaths 1450 kilo"              → Deaths: 3 | Feed: 1450 kg
  [Minimal]   "1200"                             → Deaths: 0 | Feed: 1200 kg
  [Medicine]  "MEDICINE Tylosin 2ml/L Day5-8"   → Treatment logged ✓ Withdrawal: Day 15
  [Hindi]     "ek muri, 1300"                   → Deaths: 1 | Feed: 1300 kg

SECTION B-01-04: Compliance Improvement
  BACKGROUND: white
  LAYOUT: Large stat on left, explanation on right

  LEFT STAT:
    "42%"  → "97%"
    Visual: animated counter/progress bar comparison
    Label: "Log compliance rate"
    Sub: "Before FlockIQ → After FlockIQ"

  RIGHT TEXT:
    "When data collection is a phone call, compliance depends on farmers
     picking up. When it's a WhatsApp reply, compliance jumps to 97%."

    Mini-chart: 30-day compliance rate bar chart (placeholder — actual data from Supabase)

SECTION B-01-05: Medicine Reporting via WhatsApp
  BACKGROUND: #EDF7F1 (brand50)
  BADGE: "GAP 3 — Now Solved" (amber pill — internal reference, remove before launch)
  TITLE: "Farmers Can Also Report Medicine Via WhatsApp"
  BODY: "When a vet prescribes treatment, the farmer types the medicine name and
          dose on WhatsApp. FlockIQ parses it, calculates the withdrawal period,
          and alerts you if birds are approaching sale-date before it clears."

  SHOW: Two-column — WhatsApp message example on left, dashboard treatment card on right

SECTION B-01-06: Technical Details (Collapsible, for Enterprise)
  BACKGROUND: neutral50
  TITLE: "Built for Enterprise-Grade Operations"
  BUTTON: "See Technical Details ↓" (expands section)
  WHEN EXPANDED: 6-row table with tech specs (see FR-FEAT-002)

SECTION B-01-07: Pricing Inclusion
  BACKGROUND: #0D3B21 (dark)
  3-column comparison:
    PulseFarm: WhatsApp Log = Add-on (₹500/month per farm)
    PulsePro: WhatsApp Log = ✓ Included
    Enterprise: WhatsApp Log = ✓ Included (unlimited farms)
  CTA: [Start Free Trial — Includes WhatsApp Automation]
```

---

### PAGE B-02: Farm Management (`/features/farm-management`) — Sticky Sidebar Design

```
LAYOUT (desktop ≥1024px):
  Left sidebar: 240px fixed/sticky, shows subsection jump-links
  Main content: flex-1, alternating feature blocks
  Right sidebar: none (content is wide enough)

STICKY SIDEBAR:
  STYLE: white bg, thin right border (#E3EDE7), padding 24px
  TOP: 72px + 20px = 92px (below nav)
  MAX-HEIGHT: calc(100vh - 92px)
  OVERFLOW-Y: auto (scrollable if many sections)

  TITLE: "MODULES" (eyebrow style, neutral500)
  LINK LIST:
    Each link: 14px, neutral700, hover → brand700
    Active link (on screen): brand700 + left indicator bar (3px brand400)
    Active detection: IntersectionObserver on each section heading
    
  Links (in order):
    Batch Lifecycle
    FCR & Feed
    Mortality
    Weight & Growth
    Health & Vaccination
    Bird Lifting & Sales ★ New
    Full Batch P&L ★ New
    Medication & Withdrawal ★ New
    Environment Monitoring ★ New
    Breed Benchmarking ★ New
    Disease Risk Score ★ New
    Document Library ★ New
    FSSAI & HACCP

  "★ New" items: brand400 text, smaller size (12px)

MOBILE (<1024px):
  Sticky top bar replaces sidebar
  Horizontal scrollable tabs
  Same items, truncated labels (FCR | Mortality | Batch P&L | etc.)

FEATURE BLOCK TEMPLATE:
  Each subsection follows:
  ┌──────────────────────────────────────────────────────────┐
  │  [EYEBROW: category name]           [Plan badge: Both]  │
  │  [ICON 32px] [H2 title]             [NEW badge if new]  │
  │  [Body text — 2–3 sentences]                            │
  │  ─────────────────────────────────────────────────────  │
  │  Feature bullets (4–6):                                 │
  │    ✓ Specific feature with benefit                      │
  │    ✓ Another specific feature                           │
  │  ─────────────────────────────────────────────────────  │
  │  [Time Comparison table — optional for some sections]   │
  │    Manual: 45 min/day | FlockIQ: 5 min | Saves: 9×     │
  └──────────────────────────────────────────────────────────┘

  RIGHT (or left, alternating): product screenshot
  Size: 580×380px, lazy-loaded, border-radius 16px, shadow-lg
  Caption below: "[Feature name] — Product Screenshot"
  Hover: slight scale 1.02 + shadow increase

GAP SECTIONS DESIGN NOTES:

  "Bird Lifting & Sales" section:
    Icon: ShoppingBag (Lucide)
    Screenshot: Sale event modal with fields visible
    Time comparison:
      Manual: "No systematic recording — Excel or memory"
      FlockIQ: "Full digital record with P&L integration"

  "Full Batch P&L" section:
    Icon: DollarSign (Lucide)
    Screenshot: P&L tab showing cost breakdown donut chart
    Special callout box:
    ┌─────────────────────────────────────────────┐
    │  "Know your cost per bird — right now."    │
    │  Live cost/bird updates as you log data.    │
    │  At harvest: see actual vs target margin.  │
    └─────────────────────────────────────────────┘

  "Medication & Withdrawal" section:
    Icon: Pill (Phosphor)
    Screenshot: Treatment record with withdrawal period countdown
    RED ALERT CALLOUT:
    ┌──────────────────────────────────────────────────────┐
    │  ⚠ Withdrawal Period Protection                    │
    │  If a farmer tries to sell during a withdrawal     │
    │  period, FlockIQ blocks and alerts — preventing    │
    │  food safety violations and FSSAI non-compliance.  │
    └──────────────────────────────────────────────────────┘

  "Environment Monitoring" section:
    Icon: Thermometer (Lucide)
    Screenshot: Environment score card + 7-day trend chart
    Stats row:
      > 70% humidity → respiratory disease risk
      > 25 ppm ammonia → ventilation action required
    Note: "IoT sensor integration available in PulseEnterprise"

  "Breed Benchmarking" section:
    Icon: Award (Lucide)  
    Screenshot: Percentile bar showing "Top 23% — Cobb 430, UP"
    Filter chips shown: [Cobb 430 ✓] [Ross 308] [Hubbard Flex]
    Privacy note: "Benchmarks are fully anonymised — no farm names visible"

  "Disease Risk Score" section:
    Icon: AlertTriangle (Lucide)
    Screenshot: Farm portfolio map with coloured risk bubbles
    Risk scale visual:
      GREEN: 0–3 Normal precautions
      AMBER: 4–6 Enhanced biosecurity
      ORANGE: 7–8 Consider early harvest
      RED: 9–10 Immediate action required

  "Document Library" section:
    Icon: FolderOpen (Lucide)
    Screenshot: Document list with category badges and preview
    Quote card:
    "When the auditor came, I generated a complete batch dossier —
     all documents, P&L, health records — in 30 seconds."
    — S.K., Integrator, Kushinagar (8 farms)
    Storage note: "5GB per integrator | 1GB per farm account"
```

---

### PAGE B-03: Pricing Page — Full Design

```
BACKGROUND: #F7FAF8 for header, white for cards

ANNUAL/MONTHLY TOGGLE (above pricing cards):
  LAYOUT: centered, inline flex
  STYLE: pill-shaped container (brand50 bg), two options
  [Monthly | Annual ●]  ← Annual is default
  Annual option: shows "Save 2 months free" badge in brand400
  Animation: sliding indicator moves between options (200ms ease)

ROI ANCHOR (appears above pricing cards, before them in DOM):
  BACKGROUND: white
  BORDER: 1px solid brand100
  BORDER-RADIUS: 16px
  PADDING: 24px 32px
  LAYOUT: left text + right ROI calculator

  LEFT:
    "Based on 500+ farms: average annual savings of ₹1.8 lakh.
     FlockIQ pays for itself in the first batch."
    Sub: "Calculation: ₹2.5/bird timing improvement × batch size × 3 batches/year"

  RIGHT (interactive calculator):
    Label: "Your farm size:"
    Slider: 10K → 200K birds
    Output table:
      Potential annual loss from timing:  ₹1,50,000
      PulseFarm annual cost:              ₹24,000
      Net benefit:                        ₹1,26,000
      ROI ratio:                          5.25× return
    All values update live as slider moves

PRICING CARDS (3 cards):

  PULSEFARM CARD:
    BACKGROUND: white
    BORDER: 2px solid neutral150
    BORDER-RADIUS: 20px
    PADDING: 36px
    
    Plan name: "PulseFarm" (neutral900, 700wt, 22px)
    For: "Individual farms • 10K–25K birds" (neutral500, 14px)
    
    Price display:
      ₹ (prefix, 22px, neutral700)
      2,000 (large, 56px, Sora 800, brand700)
      /month (suffix, 16px, neutral500)
    Annual sub: "₹20,000/year — saves ₹4,000 vs monthly"
    Daily equivalent: "₹67/day — less than a cup of chai ☕"
    
    Features list (check + x pattern):
      ✓ 7-day price forecast (1 mandi)
      ✓ Daily SELL/HOLD/WAIT signal on WhatsApp
      ✓ Batch lifecycle management (1 farm)
      ✓ FCR tracking + breed benchmarks
      ✓ Daily mortality tracking
      ✓ Vaccination scheduler + reminders
      ✓ HPAI disease alerts (district-level)
      ✓ WhatsApp delivery of all alerts
      ✓ Hindi-first mobile app
      ✓ Full Batch P&L (new)
      ✓ Bird Lifting & Sales (new)
      ✓ Medication tracking (new)
      ✓ Environment monitoring (new)
      ✓ Batch Document Library (new)
      ✗ WhatsApp log automation (add-on ₹500/farm/mo)
      ✗ Multi-farm dashboard
      ✗ API access

    CTA: [Start 14-Day Free Trial →] (brand700, full-width, pill)
    Sub-CTA: "No credit card required • Cancel anytime"

  PULSEPRO CARD (FEATURED — dark):
    BACKGROUND: #0D3B21 (brand900)
    BORDER: 2px solid brand400
    BORDER-RADIUS: 20px
    PADDING: 36px
    POSITION: relative; (for Most Popular badge)

    Most Popular badge:
      POSITION: absolute, top -16px, left 50%, transform: translateX(-50%)
      BACKGROUND: #3DAE72 (brand400)
      TEXT: "Most Popular — For Integrators" (white, 12px, 700wt)
      PADDING: 6px 18px
      BORDER-RADIUS: 999px

    Plan name: "PulsePro" (white, 700wt, 22px)
    For: "Integrators • Up to 20 farms • 25K–500K birds" (white/60%, 14px)
    
    Price: ₹5,000/month (white, Sora 800)
    Annual: "₹50,000/year — saves ₹10,000"

    Features: same format but all text white
    Includes everything in PulseFarm +
      ✓ WhatsApp log automation (all farms included) ← highlight
      ✓ Multi-farm dashboard (up to 20 farms)
      ✓ Cross-farm FCR benchmarking (breed-matched) ← new
      ✓ Harvest queue optimizer
      ✓ Portfolio analytics + reports
      ✓ Field supervisor access (5 users)
      ✓ Price intelligence (all covered mandis)
      ✓ Farm-level disease risk score ← new
      ✓ Priority support (4-hour response)
      ✗ API access (upgrade to Enterprise)
      ✗ White-label

    CTA: [Start Free Trial →] (white bg, brand900 text, pill)
         [Book a Demo] (white/15% bg, white text, secondary)

  PULSEENTERPRISE CARD:
    BACKGROUND: white
    BORDER: 2px solid neutral150
    
    Plan name: "PulseEnterprise" (neutral900)
    For: "Large integrators • Feed companies • QSR chains • API"
    
    Price: "Custom" (brand700, Sora 800, 52px)
    Sub: "Talk to Sales"
    
    Features:
      ✓ Everything in PulsePro
      ✓ Unlimited farms
      ✓ REST API access (10K calls/day — or unlimited)
      ✓ 12 months historical price data
      ✓ Custom district/country coverage
      ✓ ERP integrations (Tally, Zoho, SAP)
      ✓ IoT device integration
      ✓ FSSAI & HACCP traceability suite
      ✓ White-label option
      ✓ Dedicated account manager
      ✓ SLA: 99.9% uptime
      ✓ ISDA-compliant data licensing

    CTA: [Talk to Sales →] (brand700, pill)

COMPARISON TABLE (expandable section below cards):
  TOGGLE: "Compare all features in detail ↓"
  When expanded: full table with sticky header row
  All 7 gap features included as rows (grouped under "FARM MANAGEMENT" section)

BELOW TABLE — Expert quotes section:
  3 quotes from agricultural economists validating the platform value
  (same as /accuracy page expert endorsements)

FAQ (8 items):
  1. Is the 14-day trial really free?
  2. Can I switch plans mid-trial?
  3. What happens after the trial ends?
  4. How does the accuracy refund guarantee work?
  5. Can I cancel anytime?
  6. Is my farm data secure?
  7. How does Enterprise pricing work?
  8. Are WhatsApp alerts included in all plans?
```

---

### PAGE B-04: Error States & Empty States Design

```
404 PAGE:
  BACKGROUND: white
  ILLUSTRATION: Confused chicken looking at a broken road sign
  HEADLINE: "This page flew the coop."
  BODY: "The page you're looking for doesn't exist or has moved."
  CTA: [Go to Homepage →] [View All Features]
  Illustration style: minimal line art, brand colours

500 PAGE:
  BACKGROUND: white
  HEADLINE: "Something went wrong on our end."
  BODY: "We're looking into it. If this persists, please contact us."
  CTA: [Try Again] [Contact Support →]

EMPTY STATES (within dashboard pages, documented here for screenshot accuracy):

  Empty — No Farms:
    Illustration: Isometric empty farm with FlockIQ logo on shed
    Headline: "Add your first farm"
    Body: "Get started by adding a farm and placing your first batch."
    CTA: [+ Add Farm]

  Empty — No Daily Log:
    Illustration: WhatsApp icon with pending indicator
    Headline: "Waiting for today's log"
    Body: "The daily reminder has been sent. Farmer's log will appear here."
    If no reminder sent: [Send Reminder Now →]

  Empty — No Alerts:
    Illustration: Green checkmark with small chicken beside it
    Headline: "All clear"
    Body: "No active alerts for your farms. Check back daily."

  Empty — Batch History (no closed batches):
    Illustration: Egg → chick → chicken sequence
    Headline: "No completed batches yet"
    Body: "Your first batch P&L will appear here at harvest."

  Empty — Document Library:
    Illustration: Open empty folder with document outline
    Headline: "No documents uploaded"
    Body: "Upload DOC invoices, lab reports, vaccination certificates, and buyer invoices."
    CTA: [Upload Document]

LOADING STATES:
  All loading skeletons: rounded-xl, bg-neutral-100, animate-pulse
  Match the shape of the actual content (not generic bars)
  Example — Farm card skeleton:
    Top: 12px bar (60% width) — farm name
    Middle: 8px bar (40%) — location
    Bottom: 3 equal-width blocks — stat columns

TOAST/NOTIFICATION DESIGN:
  POSITION: bottom-right (desktop) | bottom-center (mobile)
  BORDER-RADIUS: 12px
  SHADOW: shadow-xl
  WIDTH: 360px max

  Types:
    Success: brand700 left border, green check icon
    Error: red left border, X icon
    Warning: amber left border, triangle icon
    Info: brand400 left border, info icon

  Content:
    Title: 15px, neutral900, 600wt
    Body: 13px, neutral600, 400wt
    Dismiss: X button right-aligned
    Auto-dismiss: after 5s for success, 8s for error

  WhatsApp log specific:
    "✅ [Farm Name] — Day [N] logged via WhatsApp"
    Shows farm name prominently, body shows FCR estimate
```

---

### PAGE B-05: Mobile App Design Hints (Pre-login website references)

```
The pre-login website shows screenshots of the mobile app.
These design specs define how app screenshots should look when embedded.

DEVICE FRAMES:
  Style: iOS-style frame (rounded corners, thin bezel, no physical buttons visible)
  Colour: dark (space grey) frame — looks professional on both white and dark backgrounds
  Size: ~280×560px in hero, ~220×440px in feature sections
  Use: Next.js Image component with real screenshots, not placeholder boxes

SCREENSHOT STANDARDS FOR WEB USE:
  Resolution: 2× (@2x) for retina screens → 560×1120px actual file size
  Format: WebP with JPEG fallback
  Border-radius: 40px (to match device frame)
  Shadow when shown without frame: shadow-2xl + slight green glow for hero

APP UI THAT MUST BE ACCURATE IN SCREENSHOTS:
  Dashboard: shows actual FlockIQ brand header, not "App"
  Price card: shows "₹168/kg" with actual brand colours
  WhatsApp log success: shows brand confirmation message
  Farm card: shows correct colour coding (green/amber/red health indicators)
  FCR chart: shows realistic data with Cobb 400 breed label

DO NOT use "Product Screenshot" placeholder text on any screenshot.
All screenshot positions must have actual screenshots ready before launch.
```


---

## APPENDIX C: COLOUR USAGE RULES & ANTI-PATTERNS

### C.1 When to Use Each Colour

```
BRAND700 (#1A5C34) — Forest Green PRIMARY:
  USE FOR:
    ✓ Primary CTA buttons (standard size)
    ✓ Nav active states
    ✓ Sidebar active link indicator
    ✓ Icon fills on white backgrounds
    ✓ Body link text
    ✓ Form focus border colour
    ✓ Pricing "most popular" border
    ✓ Success icon fills
    ✓ Feature bullet check marks
  
  NEVER USE FOR:
    ✗ Hero CTA on dark green background (no contrast)
    ✗ Body text (too dark, use neutral700 instead)
    ✗ Accent/highlight text (use brand400 on dark, brand700 on light)

SIGNAL500 (#E8611A) — Saffron Orange:
  USE FOR:
    ✓ Hero primary CTA button (on dark green hero background)
    ✓ Sell signal indicator (SELL NOW)
    ✓ Urgency badges ("47 spots left")
    ✓ Loss calculator output number
    ✓ "You're losing ₹X/year" pain amplification numbers
    ✓ Exit intent modal CTA
  
  NEVER USE FOR:
    ✗ More than 5% of total screen area
    ✗ General UI elements (not a brand colour — alert colour only)
    ✗ Nav elements or menus
    ✗ Body text or headings (eyestrain)
    ✗ Backgrounds (too visually loud)

BRAND400 (#3DAE72) — Mid Green ACCENT:
  USE FOR:
    ✓ Accent text on dark backgrounds (dark sections, hero)
    ✓ Check icons next to feature lists
    ✓ Progress bar fills
    ✓ Percentage badges (e.g. "96.2% accuracy")
    ✓ Active pill indicator (WhatsApp green-adjacent)
    ✓ Hover state for secondary elements
    ✓ Donut chart segment (positive metrics)
    ✓ Most Popular badge background on dark pricing card
  
  NEVER USE FOR:
    ✗ Body text on white backgrounds (3.1:1 contrast — fails WCAG)
    ✗ Small text below 18px on white (always fails contrast)
    ✗ Primary CTAs (too similar to WhatsApp green — confusing)

NEUTRAL700 (#334D3E) — Warm Dark:
  USE FOR:
    ✓ All body text on white backgrounds
    ✓ Nav link text (default state)
    ✓ Card body text
    ✓ Form labels
    ✓ Ghost button text
    ✓ Table body rows
  
NEUTRAL900 (#1C2B22) — Near Black:
  USE FOR:
    ✓ Page headings (H1, H2)
    ✓ Card titles
    ✓ Modal headings
    ✓ Stat numbers on white sections (not brand700, for dark feel)
  
  NOTE: Never use pure black (#000000) — always use neutral900 or neutral950 for depth

WHITE TEXT on dark backgrounds:
  USE: white (#FFFFFF) or white/80% (rgba(255,255,255,0.80))
  For secondary text on dark: white/60%
  For tertiary: white/40%
  MINIMUM: white/60% — never white/30% or below (fails WCAG on brand700)
```

### C.2 Anti-Patterns to Avoid

```
❌ DO NOT: Use green text on white for body copy below 18px
   WHY: brand400 on white = 3.1:1 contrast ratio — WCAG fail
   FIX: Use neutral700 for body, brand700 for headings only

❌ DO NOT: Use signal orange for non-urgency elements
   WHY: Trains users that orange = urgency; overuse kills the effect
   FIX: Reserve for: sell signal, CTA on dark bg, "X spots left" counters only

❌ DO NOT: Use hero gradient as a card background
   WHY: Too dark for card content; text readability suffers
   FIX: Use brand900 (#0D3B21) for dark cards, brand50 (#EDF7F1) for light tints

❌ DO NOT: Put two brand-coloured CTAs side by side
   WHY: Users don't know which to choose
   FIX: Primary (filled, brand/signal) + Secondary (outline or ghost)

❌ DO NOT: Use brand700 and signal500 in the same component
   WHY: Colour conflict, neither reads as primary
   FIX: One colour dominates per component

❌ DO NOT: Animate colour on hover for buttons
   WHY: Causes CLS if not GPU-accelerated; use opacity or box-shadow instead
   FIX: `transition: box-shadow 150ms, opacity 100ms` — never `transition: background-color`

❌ DO NOT: Use Noto Sans Devanagari for English content
   WHY: The Devanagari font weights don't match the Latin weights — looks inconsistent
   FIX: Strict language-based font assignment via `font-sora` / `font-jakarta` / `font-devanagari`
```

---

## APPENDIX D: COMPONENT SPACING REFERENCE

```
STANDARD GAPS (use these — don't invent new values):
  Between nav items:          28px
  Between CTA buttons:        12px (horizontal), 16px (vertical stack)
  Card internal padding:      28px (standard), 36px (pricing), 20px (compact)
  Card gap in grid:           24px (mobile), 28px (tablet), 32px (desktop)
  Section-to-section:         clamp(5rem, 8vw, 9rem) — large sections
                              clamp(3rem, 5vw, 5rem) — smaller sections
  Hero to first section:      0 (wave SVG handles visual separation)
  Eyebrow to heading:         16px
  Heading to body:            16px (h2), 12px (h3)
  Body to CTA:                32px
  Feature bullet gap:         10px
  Icon to text in feature:    12px
  Step number to step title:  12px
  Between step blocks:        clamp(1.25rem, 2vw, 2rem)

BORDER WIDTHS:
  Card borders:         1px solid neutral150
  Featured card:        2px solid brand400
  Sidebar active:       3px solid brand400 (left border)
  Button borders:       1.5px solid brand700 (secondary buttons)
  Dividers:             1px solid neutral150
  Left-border quotes:   4px solid brand400

ICON SIZES:
  Nav:                  20px
  Feature card header:  32px
  Eyebrow:              16px (if used)
  Toast/alert:          16px
  Button (inline):      16px (small), 18px (standard), 20px (hero)
  Empty state:          80px
  Tab bar:              20px

BORDER RADII:
  Cards:                16px (default), 20px (pricing), 24px (modals, signup wizard)
  Buttons (standard):   10px
  Buttons (pill):       999px (hero CTAs, eyebrow pills)
  Input fields:         10px
  Tags/badges:          999px
  Toast:                12px
  Phone mockup:         40px (inside), 44px (outer frame)
  Progress bar:         999px

Z-INDEX SCALE:
  Base content:         1
  Cards on hover:       2
  Sticky elements:      10
  Sticky sidebar:       10
  Sticky mobile tab:    20
  Sticky bottom CTA:    30
  Sticky nav:           40
  Announcement bar:     50
  Dropdown menus:       60
  Mobile menu overlay:  70
  Modal backdrop:       80
  Modal content:        90
  Toast notifications:  100
```

---

## APPENDIX E: IMAGE & ASSET SPECIFICATIONS

### E.1 Required Image Assets (Production-Ready Before Launch)

```
BRAND ASSETS:
  logo.svg                    FlockIQ full logo (wordmark + icon)
  logo-white.svg              White version for dark backgrounds
  logo-mark.svg               Icon only (for favicon, small sizes)
  favicon.ico                 16×16, 32×32 multi-size ICO
  apple-touch-icon.png        180×180px
  og-default.png              1200×630px (fallback OG image)

PRODUCT SCREENSHOTS (all at 2× — retina quality):
  ss-dashboard-overview.webp   1200×800px — multi-farm portfolio view
  ss-whatsapp-log.webp         560×1120px — WhatsApp conversation flow
  ss-price-signal.webp         560×1120px — price forecast + sell signal
  ss-fcr-trend.webp            1200×800px — FCR analytics chart
  ss-batch-pnl.webp            1200×800px — P&L tab with cost breakdown
  ss-bird-lifting.webp         1200×800px — sale event recording modal
  ss-medication.webp           1200×800px — treatment record with withdrawal
  ss-environment.webp          1200×800px — environment monitoring dashboard
  ss-benchmarking.webp         1200×800px — breed-matched percentile chart
  ss-risk-score.webp           1200×800px — farm portfolio map with risk bubbles
  ss-document-library.webp     1200×800px — document list with categories
  ss-fssai-report.webp         1200×800px — generated traceability PDF

ILLUSTRATIONS (SVG only):
  hero-particles.svg           Animated floating particle field (pure CSS)
  hero-wave.svg                Bottom wave divider for hero section
  hero-hexgrid.svg             Hexagonal grid overlay for WhatsApp feature hero
  empty-no-farms.svg           Isometric empty farm illustration
  empty-no-alerts.svg          Green checkmark with small chicken
  empty-no-documents.svg       Open empty folder
  404-illustration.svg         Confused chicken with broken road sign
  grain-texture.svg            Subtle noise for hero background (3% opacity)

FARMER PHOTOS (only if actual photos available):
  farmer-rajesh-yadav.webp     Square crop, 400×400px, 2× = 800×800px
  farmer-suresh-patel.webp     Same spec
  farmer-manoj-singh.webp      Same spec
  farmer-david-chen.webp       Same spec (for global testimonial)
  FALLBACK: initials-based avatar component (no placeholder photo)
```

### E.2 Screenshot Generation Process

```
HOW TO GENERATE ACCURATE SCREENSHOTS:

1. Build the dashboard with real data (Supabase staging environment)
2. Log in as demo account with pre-populated test data:
   - Farm: "Gorakhpur Broilers" — 25,000 Cobb 400
   - Active batch: Day 22
   - FCR: 1.77 (showing in brand green — at target)
   - Price: ₹168/kg (current day)
   - Sell signal: SELL NOW (green)
   - Latest WhatsApp log: "1 1250 1680" received at 6:03 PM

3. Capture screenshots using Playwright:
   npx playwright screenshot --device="Desktop Chrome" \
     http://localhost:3000/dashboard/farms/demo-farm \
     --output=screenshots/ss-dashboard-overview.png

4. Convert to WebP:
   cwebp -q 82 ss-dashboard-overview.png -o ss-dashboard-overview.webp

5. Move to /public/screenshots/ directory

6. All screenshot positions in JSX use:
   <Image
     src="/screenshots/ss-dashboard-overview.webp"
     alt="FlockIQ dashboard showing multi-farm portfolio with FCR tracking and price signal"
     width={1200}
     height={800}
     loading="lazy"
     className="rounded-2xl shadow-lg"
   />

NEVER: Use "Product Screenshot" placeholder text in production builds
NEVER: Use stock photos of farm dashboards from other products
NEVER: Use screenshots with competitor branding visible
```

---

## APPENDIX F: MOTION REFERENCE CARD

### F.1 Quick Reference for Engineers

```
COMPONENT           ANIMATION              DURATION  DELAY     EASING
─────────────────────────────────────────────────────────────────────────
Section heading     FadeUp (y=24px, blur)  700ms     0         easeOutExpo
Section body text   FadeUp (y=16px)        600ms     100ms     easeOutExpo
Stat numbers        CountUp from 0         1200ms    0         easeOutExpo
Feature cards       FadeUp stagger         600ms     n×80ms    easeOutExpo
Hero headline       FadeUp (y=24px, blur)  700ms     100ms     easeOutExpo
Hero subheadline    FadeUp                 600ms     200ms     easeOutExpo
Hero CTAs           FadeUp                 500ms     300ms     easeOutExpo
Hero trust text     FadeUp                 500ms     400ms     easeOutExpo
Phone mockup        FadeUp (y=32px)        800ms     200ms     easeOutExpo
Phone float         oscillate y±8px        4000ms    ∞ loop    easeInOut
Announcement bar    Slide in from top      300ms     0         easeOut
Mobile menu open    Slide from right       350ms     0         spring(100,20)
Mobile menu close   Fade out               200ms     0         easeIn
Dropdown open       Fade + slide y=4px     200ms     200ms*    easeOut
Dropdown close      Fade                   150ms     0         easeIn
Card hover          Scale 1.015 + shadow   150ms     0         easeOutCirc
Button hover        Scale 1.02             120ms     0         easeOutCirc
Button tap          Scale 0.98             80ms      0         easeIn
Progress bar        Width 0→%              400ms     200ms     easeOut
Step connector      Width 0→100%           600ms     (step+1)×400ms easeOut
WhatsApp bubble     Fade + scale 0.9→1     300ms     typed     easeOut
Confetti            canvas-confetti        1500ms    0         library
Counter increment   setInterval at 16ms    1200ms    inView    easeOutExpo
Accordion open      Height 0→auto          300ms     0         easeOutExpo
Accordion close     Height auto→0          200ms     0         easeIn
Toast appear        Slide from right+fade  300ms     0         spring(120,25)
Toast dismiss       Fade out               200ms     4700ms    easeIn
Tab switch          Underline slide        200ms     0         easeOut
Page transition     Fade in+slide y=16px   300ms     200ms     easeOutExpo

* Dropdown delay: prevents accidental opens on fast mouse movement through nav

Hindi text ONLY:
  All above animations → opacity only (remove y translation and blur)
  Same durations, same easing
  Reason: Noto Sans Devanagari with transform causes compositing issues on mid-range Android

prefers-reduced-motion: all durations → 1ms (instant) globally via CSS
  @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 1ms !important; } }
  Framer Motion auto-respects this when useReducedMotion() hook is used
```

---

*End of FlockIQ Pre-Login Website Design Master v3.0 — COMPLETE*
*Total length: ~3,000 lines | Total sections: 9 main + 6 appendices*
*Pages covered: 28 pre-login pages + 4 auth pages + 5 legal pages = 37 total*
*Companion documents:*
*  - FlockIQ_PreLogin_Requirements_v3.md*
*  - FlockIQ_PreLogin_Tasks_v3.md*
