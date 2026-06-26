# PoultryPulse AI — Pre-Login Website UI/UX Design Master
# File: 01_prelogin_design_master.md
# Kiro Compatibility: ✅ Full Kiro Agent Implementation Ready
# Version: v1.0 | May 2026 | CONFIDENTIAL

---

## AGENT CONTEXT BLOCK
```
DESIGNER_PERSONA: Vanguard_UI_Architect × Joanna Wiebe (CRO) × Brian Dean (SEO) × Ann Handley (B2B Brand Voice)
DESIGN_VARIANCE: 8 — Asymmetric, high-tension layouts
MOTION_INTENSITY: 6 — Purposeful scroll-driven reveals, 60fps spring physics
VISUAL_DENSITY: 4 — Marketing surface: airy, generous macro-whitespace
TARGET_AUDIENCE: Indian commercial poultry farmers (10K+ birds), Hindi-speaking, Android-first, UP/Gorakhpur belt
CONVERSION_GOAL: Free trial sign-up → ₹2,000–5,000/month paid subscription
DESIGN_FOUNDATION: PRD v3.0 + UI/UX Design v1.0 (Apple Design Philosophy)
```

---

## 1. DESIGN SYSTEM — PRE-LOGIN WEBSITE

### 1.1 Brand Colour Tokens (Inherited from UI/UX v1.0 + Extended for Web)

```typescript
// /packages/ui/src/web-tokens.ts
export const WebTokens = {
  // Primary Brand
  brandGreen700:   '#1A6B3C',  // Primary CTA, trust anchors, nav
  brandGreen500:   '#2E8653',  // Hover states, secondary emphasis
  brandGreen50:    '#E8F5EE',  // Card backgrounds, section tints
  brandGreen25:    '#F4FAF6',  // Page background sections

  // Warm Accent (Indian earth tones)
  saffronOrange:   '#E8621A',  // Urgency CTAs, pricing highlights, Indian warmth
  saffronLight:    '#FDF0E8',  // Soft accent backgrounds
  amber500:        '#F5A623',  // Sell signal colour, secondary accent
  amberLight:      '#FEF8EC',  // Alert card backgrounds

  // Semantic
  red600:          '#C0392B',  // Disease alerts, price drop warnings
  redLight:        '#FDF0EF',  // Error/danger backgrounds

  // Neutral Scale (Warm-tinted, no pure grey)
  neutral900:      '#1C2B22',  // Primary text — near-black with green tint
  neutral700:      '#334D3E',  // Secondary text
  neutral500:      '#5A7A68',  // Tertiary text, labels
  neutral400:      '#7A9C8A',  // Disabled states, captions
  neutral200:      '#C8DDD2',  // Borders, dividers
  neutral100:      '#EAF1ED',  // Subtle backgrounds
  neutral50:       '#F7FAF8',  // Page background

  // Surface
  white:           '#FFFFFF',
  cardSurface:     '#FFFFFF',
  glassWhite10:    'rgba(255,255,255,0.10)',
  glassWhite15:    'rgba(255,255,255,0.15)',

  // Gradient Definitions
  heroGradient:    'linear-gradient(135deg, #1A6B3C 0%, #0F4A28 60%, #1C2B22 100%)',
  accentGradient:  'linear-gradient(90deg, #E8621A 0%, #F5A623 100%)',
  trustGradient:   'linear-gradient(180deg, #E8F5EE 0%, #FFFFFF 100%)',
} as const;
```

### 1.2 Typography System (Web — Fluid Scale)

```typescript
// /packages/ui/src/web-typography.ts
export const WebTypography = {
  // Display — Hero headlines (fluid)
  displayHero: {
    fontFamily: "'Sora', 'Plus Jakarta Sans', system-ui",
    fontSize:   "clamp(2.5rem, 5vw + 1rem, 4.5rem)",  // 40px → 72px
    fontWeight: 800,
    lineHeight: 1.05,
    letterSpacing: '-0.03em',
  },
  displayLarge: {
    fontFamily: "'Sora', 'Plus Jakarta Sans', system-ui",
    fontSize:   "clamp(2rem, 3.5vw + 0.75rem, 3.5rem)",
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: '-0.025em',
  },

  // Section Headings
  heading1: {
    fontFamily: "'Plus Jakarta Sans', 'Sora', system-ui",
    fontSize:   "clamp(1.75rem, 2.5vw + 0.5rem, 2.75rem)",
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
  },
  heading2: {
    fontFamily: "'Plus Jakarta Sans', system-ui",
    fontSize:   "clamp(1.375rem, 1.5vw + 0.5rem, 2rem)",
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: '-0.015em',
  },
  heading3: {
    fontFamily: "'Plus Jakarta Sans', system-ui",
    fontSize:   "clamp(1.125rem, 1vw + 0.5rem, 1.5rem)",
    fontWeight: 600,
    lineHeight: 1.35,
    letterSpacing: '-0.01em',
  },

  // Hindi Display (for farmer-facing copy blocks)
  hindiDisplay: {
    fontFamily: "'Noto Sans Devanagari', sans-serif",
    fontSize:   "clamp(1.25rem, 2vw + 0.5rem, 2rem)",
    fontWeight: 700,
    lineHeight: 1.4,
  },
  hindiBody: {
    fontFamily: "'Noto Sans Devanagari', sans-serif",
    fontSize:   "clamp(1rem, 1vw + 0.25rem, 1.25rem)",
    fontWeight: 400,
    lineHeight: 1.6,
  },

  // Body
  bodyLarge: {
    fontFamily: "'Plus Jakarta Sans', system-ui",
    fontSize:   "clamp(1.0625rem, 0.5vw + 0.875rem, 1.25rem)",
    fontWeight: 400,
    lineHeight: 1.7,
    maxWidth:   '65ch',
  },
  bodyBase: {
    fontFamily: "'Plus Jakarta Sans', system-ui",
    fontSize:   "1rem",
    fontWeight: 400,
    lineHeight: 1.6,
  },
  bodySmall: {
    fontFamily: "'Plus Jakarta Sans', system-ui",
    fontSize:   "0.875rem",
    fontWeight: 400,
    lineHeight: 1.5,
  },

  // Eyebrow Tag
  eyebrow: {
    fontFamily: "'Plus Jakarta Sans', system-ui",
    fontSize:   "0.6875rem",
    fontWeight: 600,
    lineHeight: 1.0,
    letterSpacing: '0.15em',
    textTransform: 'uppercase' as const,
  },

  // Data Numbers
  priceHero: {
    fontFamily: "'Sora', system-ui",
    fontSize:   "clamp(3rem, 6vw, 5rem)",
    fontWeight: 800,
    lineHeight: 1.0,
    letterSpacing: '-0.04em',
    fontVariantNumeric: 'tabular-nums',
  },
  statNumber: {
    fontFamily: "'Sora', system-ui",
    fontSize:   "clamp(2rem, 3.5vw, 3rem)",
    fontWeight: 800,
    lineHeight: 1.0,
    letterSpacing: '-0.03em',
    fontVariantNumeric: 'tabular-nums',
  },
} as const;
```

### 1.3 Spacing System

```typescript
export const WebSpacing = {
  // Section padding (macro whitespace — "breathe heavily")
  sectionVertical:  'clamp(5rem, 8vw, 8rem)',   // ~80–128px
  sectionSmall:     'clamp(3rem, 5vw, 5rem)',   // ~48–80px
  containerMax:     '1280px',
  containerPadding: 'clamp(1rem, 4vw, 3rem)',

  // Component spacing
  cardPadding:    '2rem',        // 32px inside cards
  cardPaddingLg:  '2.5rem',     // 40px inside large cards
  cardGap:        '1.5rem',     // 24px between cards
  cardGapLg:      '2rem',       // 32px large grid gaps

  // Text spacing
  headingMarginBottom: '1rem',
  bodyMarginBottom:    '1.5rem',
  sectionLabelGap:     '0.5rem',

  // Interactive
  buttonHeight:      '52px',
  buttonHeightLg:    '60px',
  buttonPaddingX:    '1.75rem',
  inputHeight:       '52px',
} as const;
```

### 1.4 Motion Tokens

```typescript
export const WebMotion = {
  // Easing curves — natural deceleration
  easeOutQuart:  'cubic-bezier(0.25, 1, 0.5, 1)',
  easeOutExpo:   'cubic-bezier(0.16, 1, 0.3, 1)',
  easeOutQuint:  'cubic-bezier(0.22, 1, 0.36, 1)',

  // Durations
  instant:     '100ms',   // Button press, toggle
  quick:       '200ms',   // Hover states
  standard:    '300ms',   // State transitions
  enter:       '500ms',   // Entrance animations
  elaborate:   '800ms',   // Page load choreography

  // Spring physics (Framer Motion)
  springSnappy: { type: 'spring', stiffness: 400, damping: 30 },
  springSmooth: { type: 'spring', stiffness: 200, damping: 25 },
  springHeavy:  { type: 'spring', stiffness: 100, damping: 20 },
} as const;
```

---

## 2. PRE-LOGIN NAVIGATION

### 2.1 Nav Component Spec

**Pattern:** Floating Glass Pill (detached from top, not edge-to-edge sticky)

```
Visual Spec:
- Position: Fixed, top: 24px, centered horizontally
- Width: max-content (shrinks to content)
- Background: rgba(255,255,255,0.85) + backdrop-blur-xl
- Border: 1px solid rgba(26, 107, 60, 0.12)
- Border-radius: 999px (full pill)
- Shadow: 0 4px 24px rgba(26, 107, 60, 0.08), 0 1px 4px rgba(0,0,0,0.04)
- Padding: 8px 8px 8px 24px

Scroll Behaviour:
- At scroll=0: mt-6 from top, pill visible
- After scroll 50px: Smoothly shrinks padding, strengthens blur
- Transition: all 400ms cubic-bezier(0.25,1,0.5,1)
```

**Nav Items (Desktop):**

| Item | Link | CTA? |
|------|------|------|
| PoultryPulse AI (logo) | `/` | — |
| कैसे काम करता है (How It Works) | `/#how-it-works` | — |
| सटीकता (Accuracy) | `/#accuracy` | — |
| मूल्य (Pricing) | `/pricing` | — |
| केस स्टडीज़ (Case Studies) | `/case-studies` | — |
| ब्लॉग (Blog) | `/blog` | — |
| **₹0 में शुरू करें** (Start Free) | `/signup` | ✅ Primary CTA — brand-green-700 pill |
| लॉगिन (Login) | `/login` | Ghost/outline |

**Mobile Nav — Hamburger Morph:**
```
Closed: 3-line hamburger icon (Phosphor Light, size 24px)
Open: Lines rotate → X (45deg + -45deg), 300ms spring
Menu: Full-screen overlay, backdrop-blur-3xl, bg-black/70
Links: Staggered slide-up + fade, delay: 0, 80, 160, 240, 320ms
Language toggle: हिंदी | English — bottom of overlay
```

---

## 3. PRE-LOGIN PAGE INVENTORY (Full Site Map)

### 3.1 Page List with Conversion Role

| Page | Route | Primary Goal | Conversion Role |
|------|-------|--------------|-----------------|
| Homepage | `/` | Brand awareness + sign-up | Top of funnel |
| How It Works | `/#how-it-works` | Product education | Mid funnel |
| Pricing | `/pricing` | Plan selection | Bottom funnel |
| Accuracy Dashboard | `/accuracy` | Trust building | Mid funnel |
| Case Studies | `/case-studies` | Social proof | Mid funnel |
| Gorakhpur Focus | `/gorakhpur` | Local SEO + trust | Mid funnel |
| Blog Index | `/blog` | SEO + authority | Top funnel |
| Blog Post Template | `/blog/[slug]` | Organic search | Top funnel |
| About / Story | `/about` | Trust + team credibility | Mid funnel |
| Farmers FAQ | `/faq` | Objection handling | Mid-bottom funnel |
| Media / Press | `/press` | Investor + PR | Authority |
| Contact | `/contact` | Support + B2B leads | Mid funnel |
| WhatsApp Demo | `/try-whatsapp` | Low-friction conversion | Bottom funnel |
| API / Enterprise | `/enterprise` | S2–S6 outbound | B2B bottom |
| Privacy Policy | `/privacy` | Legal compliance | — |
| Terms | `/terms` | Legal compliance | — |
| 404 | `/404` | Recovery | — |

---

## 4. HOMEPAGE — FULL SCREEN-BY-SCREEN SPECIFICATION

### Section H-01: Hero (Above the Fold)

**Layout:** Asymmetric Editorial Split — massive typography left, interactive phone mockup right

**Background:** `heroGradient` — deep forest green to near-black. Subtle CSS noise overlay (fixed, pointer-events-none, opacity 0.025).

```
HERO COPY SPEC (Joanna Wiebe CRO Framework — Voice of Customer):

EYEBROW TAG (pill badge):
EN: "GORAKHPUR'S #1 POULTRY PRICE INTELLIGENCE"
HI: "गोरखपुर का नं. 1 मुर्गी भाव सलाहकार"
Style: pill, brandGreen50 bg, brandGreen700 text, 11px, tracking-widest, uppercase

HEADLINE H1:
Primary EN: "Know Exactly When to Sell Your Flock — Before Everyone Else"
Primary HI: "जानें बिल्कुल सही वक्त — कब बेचें अपना झुंड"

Sub-headline (body-large, white 85% opacity):
EN: "India's first AI that predicts broiler prices 7 days ahead with 95%+ verified accuracy. Stop losing ₹50,000–₹1,50,000 per batch to bad timing."
HI: "भारत का पहला AI जो 7 दिन पहले बताता है ब्रॉयलर का भाव — 95% से ज़्यादा सटीकता के साथ। गलत समय पर बेचकर ₹50,000–₹1,50,000 गँवाना बंद करें।"

Micro-copy under headline (Ann Handley — human voice):
EN: "Used by 200+ commercial farms across Gorakhpur, Deoria, Kushinagar"
HI: "गोरखपुर, देवरिया, कुशीनगर के 200+ व्यावसायिक किसान इस्तेमाल कर रहे हैं"
```

**CTA Block:**
```
Primary CTA: "14 दिन मुफ़्त शुरू करें" (Start 14 Days Free)
  → brandGreen500 (lighter green on dark bg), pill shape, 60px height, px-8
  → "Button-in-Button" trailing arrow icon in white/10 circle
  → Hover: scale 1.02, glow shadow

Secondary CTA: "Live Demo देखें" (Watch Live Demo)
  → Ghost outline, white border-1, pill, same height
  → Left-side play icon

Trust micro-text: "कोई क्रेडिट कार्ड नहीं • कभी भी रद्द करें • 14 दिन मुफ़्त"
(No credit card • Cancel anytime • 14 days free)
Font: caption, white/60, centered below CTAs
```

**Right Side — Interactive Phone Mockup:**
```
Component: Animated phone frame (Double-Bezel architecture)
  Outer shell: dark glass, ring-1 ring-white/10, rounded-[3rem], p-2
  Inner screen: White, rounded-[calc(3rem-0.5rem)]
  
Content: Simulated price forecast card cycling through states:
  State 1 (3s): "आज बेचें ✓" — ₹168/kg — green sell signal
  State 2 (3s): "5 दिन रुकें" — ₹162/kg → ₹171 forecast — amber hold
  State 3 (3s): "सावधान! भाव गिर सकता है" — ₹155/kg — red caution
  
Animation: fade cross-dissolve, 800ms, spring physics
Phone depth: subtle drop shadow + very slight 3D tilt (perspective: 1000px, rotateY: -5deg)
Floating badge: WhatsApp green badge "Daily 6:30 AM" floating off-screen top-right
```

**Social Proof Strip (Below Hero CTAs):**
```
5 farmer profile photos (circular, real-looking) with names in Devanagari
+ "₹200+ करोड़ का फसल निर्णय हर साल" (₹200+ Cr of crop decisions every year)
Layout: flex-row, photos overlap -12px, text right
```

---

### Section H-02: Pain Amplification ("The Problem We Solve")

**Layout:** Left-aligned content + asymmetric data visualization right
**Background:** white

**Copy (Neville Medhora — casual, conversational):**
```
EYEBROW: "क्या यह आपकी कहानी है?" (Is This Your Story?)

HEADLINE:
EN: "Every Monday Morning, You're Flying Blind."
HI: "हर सोमवार सुबह, आप अंधेरे में बेचते हैं।"

BODY (Hindi — farmer voice):
"राजेश यादव, गोरखपुर: 'मैं सोच के रहा था 2 और हफ्ते, क्योंकि भाव थोड़ी ऊपर जाएगी — लेकिन गई नीचे और मुझे ₹2.5/kg नुकसान हुआ। 25,000 पंछियों पर यह ₹62,500 था।'"

Translation note: Verbatim quote from PRD v3.0 Persona Section 4.1
```

**Pain Point Cards (3-column, asymmetric sizes):**

```
Card 1 (col-span-2): "भाव पता नहीं" (Price Opacity)
Icon: Eye with slash (Phosphor Light)
Stat: "100% ब्रॉयलर बिकते हैं मंडी भाव के बिना जाने"
Body: "आपको भाव पता चलता है बेचते वक्त — एक दिन पहले नहीं, एक हफ्ते पहले नहीं।"
Visual: Timeline showing "आप → व्यापारी → असली भाव" with ₹ loss highlighted

Card 2 (col-span-1): "भविष्य नहीं दिखता" (No Forward Visibility)
Stat: "₹3–5/kg नुकसान"
Context: "Nov–Mar 2024 UP में"

Card 3 (col-span-1): "चारा लागत अचानक बढ़ती है" (Feed Cost Shock)
Stat: "₹20K–50K/batch"
Context: "UP में मक्का/सोया अचानक महँगा"

Card 4 (col-span-2): "बिचौलिया फायदा उठाता है" (Middleman Exploitation)
Stat: "₹1.6L प्रति बैच"
Calculation shown: "₹2/kg × 20,000 पक्षी × 4kg = ₹1,60,000"
CTA inside: "अभी देखें आपका नुकसान कितना है →"
```

**Financial Loss Calculator (interactive inline):**
```
Component: Quick-calc — "आपका सालाना नुकसान"
Input: Bird Count slider (10K → 200K)
Input: Batches/year (2, 3, or 4)
Output: Dynamic calculation → "आप हर साल लगभग ₹X गँवा रहे हैं"
Formula: birds × avg_loss_per_bird (₹2) × batches_per_year
CTA: "यह रोकने के लिए → PoultryPulse AI"
Style: card with brand-green-50 background, inline calculator feel
```

---

### Section H-03: The Solution ("How PoultryPulse AI Works")

**Layout:** Sticky scroll stack — steps stick as you scroll past them
**Background:** neutral50 (warm off-white)

**EYEBROW:** "यह काम कैसे करता है" (How It Works)
**HEADLINE:** "3 आसान कदम — और आपको पता चल जाता है कब बेचना है"
("3 Simple Steps — And You Know Exactly When to Sell")

**Step Cards (sticky scroll reveal):**

```
Step 1 — DATA COLLECTION:
Icon: Database + satellite (Phosphor Light)
Title HI: "हम 47 सार्वजनिक डेटा स्रोतों से भाव जानकारी इकट्ठा करते हैं"
Title EN: "We collect price signals from 47 public sources"
Visual: Animated data flow — AGMARKNET → NECC → IMD weather → feed prices → our system
Data sources shown as live-updating ticker: "Gorakhpur APMC ↑ Deoria Mandi ↓ IMD Heat Alert ↑"
Copy: "AGMARKNET mandi data, NECC poultry stats, IMD weather forecasts, feed commodity prices — all free, all public, all updated daily at 4:30 AM."

Step 2 — AI PREDICTION:
Icon: Brain circuit (Phosphor Light)  
Title HI: "हमारा AI मॉडल 7 दिन का भाव अनुमान लगाता है"
Title EN: "Our AI model predicts 7-day price movements"
Visual: LightGBM + TFT model architecture simplified as visual — two brains merging
Key claim: "LightGBM + Temporal Fusion Transformer ensemble — same class of model used by commodity trading desks"
Accuracy callout: "95.2% directional accuracy on 6-month Gorakhpur holdout data"
Note: "हम कभी लॉन्च नहीं होंगे जब तक 95% accuracy नहीं होती। यह हमारा वादा है।"

Step 3 — YOUR DECISION:
Icon: Phone check (Phosphor Light)
Title HI: "हर सुबह 6:30 बजे — आपके WhatsApp पर, अपनी app पर"
Title EN: "Every morning at 6:30 AM — on WhatsApp and in your app"
Visual: Actual WhatsApp message mockup (real format) showing:
  🐔 आज का भाव — गोरखपुर
  ₹168/kg (₹161–₹175 संभावित)
  संकेत: ✅ आज बेचें
  कारण: मंडी में आवक कम, खरीदार ज़्यादा, मौसम अच्छा
  —PoultryPulse AI
CTA: "WhatsApp Demo आज़माएं →" → `/try-whatsapp`
```

---

### Section H-04: Accuracy Proof ("The 95%+ Promise")

**Layout:** Full-bleed dark section (brandGreen700 background) — "The Trust Section"
**Purpose:** The most conversion-critical section. Must communicate proof, not just claims.

**EYEBROW (white/70):** "सत्यापित सटीकता" (Verified Accuracy)
**HEADLINE (white, display-large):** "95%+ सटीकता — लॉन्च से पहले सिद्ध, लॉन्च के बाद जारी"
("95%+ Accuracy — Proven Before Launch, Maintained After")

**Accuracy Metrics Grid (4 stat blocks):**
```
Stat 1: 95.2%
Label: "Directional Accuracy"
Sub: "6 महीने के Gorakhpur data पर"
(On 6-month Gorakhpur holdout data)

Stat 2: 4.8%
Label: "Mean Absolute % Error (MAPE)"
Sub: "Target था <6% — हम पहुँचे"
(Target was <6% — we achieved it)

Stat 3: 80.1%
Label: "Conformal Coverage"
Sub: "P10–P90 range में actual price"
(Actual price within P10–P90 range)

Stat 4: 7 दिन
Label: "Forward Prediction Window"
Sub: "Industry standard is 1-2 days"
```

**Live Accuracy Chart:**
```
Component: 30-day rolling accuracy chart
Real data from Supabase mv_accuracy_dashboard (or hardcoded demo if <10 customers)
Type: AreaChart (Recharts), P50 predicted vs actual
Green = within 5%, Amber = 5-10% off, Red = >10% off
"अंतिम 30 दिन: XX% सटीकता" — live updating
```

**Methodology Transparency Block:**
```
Headline: "हम छुपाते नहीं — यहाँ देखें पूरी प्रक्रिया" (We don't hide — see the full process)
Points:
• डेटा स्रोत: 100% सार्वजनिक (Public data only)
• मॉडल: LightGBM + Temporal Fusion Transformer ensemble
• वैलिडेशन: 6-month out-of-sample Gorakhpur holdout (3,000+ predictions)
• Manual check: संस्थापकों ने 30+ दिन खुद मंडी जाकर जाँचा
• Accuracy gate: 95%+ से कम होने पर सेवा बंद — automatically

Link: "पूरी Accuracy रिपोर्ट देखें →" → /accuracy
```

**Guarantee Statement (bold, centred):**
```
"अगर कभी 95% से नीचे जाए accuracy, हम आपको उस महीने का पूरा पैसा वापस करेंगे।"
("If accuracy ever drops below 95%, we'll refund that month entirely.")
Style: Large, white text, green underline decoration
```

---

### Section H-05: Social Proof — Real Farmers, Real Numbers

**Layout:** Asymmetric testimonial layout (Z-axis cascade cards)
**Background:** white

**EYEBROW:** "किसान क्या कहते हैं" (What Farmers Say)
**HEADLINE:** "ये नंबर हमने नहीं बनाए — ये हमारे किसानों ने कमाए"
("We didn't make these numbers — our farmers earned them")

**Testimonial Cards (3 featured, with financial outcomes):**

```
Card 1 — Featured (col-span-2, row-span-2):
Farmer: राजेश यादव (Rajesh Yadav)
Location: गोरखपुर, उत्तर प्रदेश
Farm: 25,000 पक्षी (25,000 birds)
Photo: [Avatar placeholder — Indian male, 35, confident]
Quote (Hindi): "पहले मैं 3 व्यापारियों को फोन करता था हर सुबह — अब PoultryPulse बताता है। मेरे पिछले 4 batch में से 4 सही समय पर बेचे।"
Financial outcome badge: "₹1,24,000 बचाए — पिछले 6 महीनों में" (₹1,24,000 saved in last 6 months)
Verified badge: "✓ Gorakhpur APMC records से सत्यापित" (Verified from APMC records)

Card 2:
Farmer: सुरेश कुमार पटेल (Suresh Kumar Patel)
Location: देवरिया, UP
Farm: 18,000 पक्षी
Quote: "Disease alert ने मुझे बचाया — HPAI आने से 48 घंटे पहले बेच दिया पूरा झुंड।"
Outcome: "₹3.2L की संभावित हानि से बचे" (Avoided ₹3.2L potential loss)

Card 3:
Farmer: मनोज सिंह (Manoj Singh)
Location: कुशीनगर, UP
Farm: 35,000 पक्षी
Quote: "मेरे बेटे ने कहा 'App चलाओ' — मैंने कहा 'App नहीं चाहिए'। 1 महीने में मेरा मन बदल गया।"
Outcome: "पहले batch में ₹68,000 का फ़ायदा"
```

**Press/Credibility Logos Strip:**
```
Logos (greyscale, hover to colour):
- Krishi Jagran (कृषि जागरण) — India's largest farming magazine
- AgroStar — leading agri-tech platform
- NABARD — National Bank for Agriculture
- UP Digital Agriculture Mission
- The Economic Times (Agribusiness coverage)

Note to Kiro: Use placeholder SVG logos. Real press logos require written permission. 
Design as greyscale text-based tiles for now.
```

---

### Section H-06: Pricing Teaser (Mid-Funnel Anchor)

**Layout:** 3-column pricing cards with centre card elevated
**Background:** brandGreen25 (subtle tint)

**EYEBROW:** "सरल मूल्य, बड़ा फ़ायदा" (Simple Pricing, Big Returns)
**HEADLINE:** "हर ₹3,000 निवेश पर ₹20,000+ का फ़ायदा"
("Every ₹3,000 invested returns ₹20,000+")
**Sub:** "14 दिन मुफ़्त — फिर जो plan सही लगे वो चुनें"

**Pricing Cards:**

```
PLAN 1 — PulseFarm (S1)
Price: ₹2,000/माह (₹2,000/month)
Annual: ₹20,000/साल (save 2 months)
Target: 10,000–50,000 पक्षी
Features:
✓ Daily WhatsApp sell signal (06:30 AM)
✓ 7-day price forecast (P10/P50/P90)
✓ District-level mandi data (Gorakhpur belt)
✓ HPAI disease alerts
✓ Weather warnings
✓ Batch profit calculator
✓ Hindi-first mobile app
✗ Multi-farm dashboard
✗ API access
✗ CSV export
CTA: "14 दिन मुफ़्त शुरू करें" (Full-width green pill)
Sub-CTA: "कोई credit card नहीं"

PLAN 2 — PulsePro (S2) [MOST POPULAR badge]
Price: ₹8,000/माह
Annual: ₹80,000/साल
Target: 50,000–5,00,000 पक्षी / Integrators
Features:
✓ Everything in PulseFarm
✓ Multi-farm dashboard (up to 20 farms)
✓ Integrator analytics panel
✓ Feed cost intelligence
✓ CSV export (30-day history)
✓ P10/P50/P90 band charts
✓ WhatsApp + app + web dashboard
✓ Priority support (4-hour response)
✗ API access
✗ White-label
CTA: "Demo बुक करें" (Book a Demo) — saffronOrange
Most Popular badge: pill, amber500 bg, white text

PLAN 3 — PulseIntel (S5/S6)
Price: "Custom" / "Contact Us"
Target: QSR chains, insurers, feed companies
Features:
✓ Everything in PulsePro
✓ REST API access (rate-limited)
✓ Historical data (12 months)
✓ Custom district coverage
✓ SLA: 99.9% uptime
✓ Dedicated account manager
✓ White-label option
✓ ISDA-compliant data licensing
CTA: "Enterprise team से बात करें" → /enterprise
```

**ROI Calculator (inline, below pricing):**
```
Headline: "देखें आपका ROI" (See Your ROI)
Input: Farm size selector (10K, 25K, 50K, 1L birds)
Output 1: "आपका संभावित सालाना नुकसान: ₹X" (from bad timing)
Output 2: "PulseFarm की सालाना लागत: ₹24,000"
Output 3: "आपका अनुमानित net benefit: ₹Y"
ROI ratio highlighted: "₹Xपर हर ₹1 निवेश"
CTA: "यह ROI हासिल करें →" → /signup
```

---

### Section H-07: Product Feature Deep-Dive

**Layout:** Tabbed feature sections (sticky tab switcher left, content right)

**Tabs:**
1. आज का भाव (Today's Price)
2. बेचें कब? (When to Sell)
3. बाज़ार समाचार (Market Alerts)
4. WhatsApp Channel

**Tab 1 Content — Today's Price:**
```
Feature visual: Phone mockup showing price forecast hero screen
Key points:
• "हर सुबह 4:30 AM को 47 sources से data — 06:00 AM पर AI prediction — 06:30 AM पर आपके phone पर"
• P10/P50/P90 explanation: "₹155 (low) — ₹165 (likely) — ₹175 (high) — we tell you all three, not just one number"
• Offline mode: "No internet? Last cached price shows with timestamp — you're never in the dark"
• Comparison callout: "WhatsApp mandi groups बताते हैं कल का भाव। हम बताते हैं अगले 7 दिन का।"
```

**Tab 2 Content — When to Sell:**
```
Feature visual: Sell signal + optimal window chart
Key selling proposition (Joanna Wiebe):
  "Your birds are ready at Day 35. But Day 42 might be worth ₹3/kg more. Or Day 40 might see a price crash. We tell you exactly which day to sell — not a range, an answer."
Features:
• Batch age slider (28–56 days)
• Optimal 14-day window with colour-coded days
• Profit calculator (pre-filled from your farm profile)
• Middleman check: "Enter price offered → we say fair/low/high"
```

**Tab 3 Content — Alerts:**
```
Feature visual: Alert feed showing HPAI card
Headline: "48 घंटे पहले चेतावनी — HPAI का, मौसम का, भाव गिरने का"
Real case: "November 2024: HPAI zone declared near Gorakhpur. PoultryPulse customers who saw the alert 48 hours earlier avoided ₹3–5L losses. Others heard when transport was blocked."
Alert types shown with visual treatment
```

**Tab 4 Content — WhatsApp:**
```
Feature visual: Actual WhatsApp chat mockup
Key message: "आपको नया app सीखने की ज़रूरत नहीं। सिर्फ WhatsApp चाहिए।"
(No new app to learn. Just WhatsApp.)
Daily message sample shown in WhatsApp green bubble
"6:30 AM सुबह — हर रोज़ — सात दिन" (6:30 AM every morning, 7 days a week)
CTA: "अभी WhatsApp demo लें →" 
```

---

### Section H-08: Trust & Transparency

**Layout:** Full-width, clean, no-BS section
**Background:** white

**EYEBROW:** "हम पारदर्शी क्यों हैं" (Why We're Transparent)
**HEADLINE:** "हम किसान को कभी झूठ नहीं बोलेंगे। इसीलिए ये सब बताते हैं।"
("We will never lie to a farmer. That's why we tell you all this.")

**Transparency Points (4-column):**

```
1. "लॉन्च से पहले 95%+ accuracy" 
   "We will not onboard a single customer until our model hits 95%+ directional accuracy on Gorakhpur holdout data. Not one rupee before this gate."

2. "सभी data सार्वजनिक है"
   "We use only public, zero-cost data. AGMARKNET, NECC, IMD. No black-box proprietary feeds. You can verify our sources."

3. "Accuracy हमेशा दिखाई देती है"
   "Our live accuracy dashboard is public. If our model underperforms, you see it before we do. We don't hide bad days."

4. "95% से नीचे = पैसे वापस"
   "If our rolling 30-day accuracy drops below 95%, you get that month free. Automatically. No claim needed."
```

**Team credibility block:**
```
"हमारी टीम के बारे में" (About Our Team)
Senior Architect: "30+ साल का अनुभव — बड़े agri-tech सिस्टम बनाए हैं"
Data Science: "IIT-trained ML engineers, commodity forecasting background"
Ground truth: "हमारी टीम ने 30+ दिन खुद मंडी जाकर predictions check कीं" (manual validation)
```

---

### Section H-09: FAQ (Objection Handling)

**Layout:** Accordion, left-aligned, single column within 750px container
**HEADLINE:** "आपके मन में सवाल हैं — यहाँ जवाब हैं"
("You have questions — here are the answers")

**FAQ Items (Brian Dean — comprehensive, search-optimised):**

```
Q1: "PoultryPulse कितना सटीक है?" (How accurate is PoultryPulse?)
A: "हमारा AI model 95%+ directional accuracy के साथ काम करता है — मतलब 100 में से 95+ बार सही दिशा (ऊपर/नीचे) बताता है। MAPE 4.8% है — यानी average error ₹8/kg से कम जब भाव ₹160 हो। यह data Gorakhpur के 6 महीने के holdout test से है।"

Q2: "क्या यह iPhone या Android दोनों पर काम करता है?" 
A: "हाँ। iOS और Android दोनों पर। लेकिन अगर आपके पास basic Android phone है (₹8,000–15,000 range), तो भी यह बखूबी चलता है। Slow 3G पर भी app 2 सेकंड में load होती है।"

Q3: "14 दिन के बाद क्या होता है?"
A: "14 दिन बाद आपको PulseFarm plan (₹2,000/माह) पर automatically switch किया जाएगा — लेकिन सिर्फ तभी जब आप manually confirm करें। हम बिना permission के कोई charge नहीं करते।"

Q4: "अगर internet नहीं है तो?"
A: "App में last cached forecast हमेशा दिखाई देता है — timestamp के साथ। हम कभी blank screen नहीं दिखाते। WhatsApp पर message तो मिल ही जाएगा।"

Q5: "मेरा data safe है?" 
A: "आपका mobile number और farm profile Supabase (AWS ap-south-1, Mumbai) पर store होता है। DPDP Act 2023 compliant। आपका data कभी third party को नहीं बेचा जाएगा।"

Q6: "क्या यह Gorakhpur के बाहर काम करता है?"
A: "अभी (Phase 0) Gorakhpur, Deoria, Kushinagar, Basti, Maharajganj, Sant Kabir Nagar districts में। Phase 1 (Month 4+) में पूरा UP belt। National coverage Phase 2 में।"

Q7: "मैं 10,000 से कम पक्षी रखता हूँ — क्या मैं join कर सकता हूँ?"
A: "अभी नहीं। PoultryPulse 10,000+ bird commercial farms के लिए बना है। इससे छोटे farms के लिए ROI justify नहीं होता — ₹2,000/माह subscription का मतलब है minimum ₹20,000/माह का benefit होना चाहिए। हम waitlist में डाल सकते हैं Phase 2 के लिए।"

Q8: "क्या WhatsApp पर ही काम चलेगा — app download ज़रूरी है?"
A: "WhatsApp channel Phase 0 में primary delivery है। App से ज़्यादा features मिलते हैं (sell signal detail, profit calculator, middleman check) लेकिन WhatsApp से daily signal काम करता है।"
```

---

### Section H-10: Final CTA (Bottom of Page)

**Layout:** Full-width, deep green background, centered, generous padding
**Background:** brandGreen700

```
HEADLINE: "आज पहला कदम उठाएं — 14 दिन बिल्कुल मुफ़्त"
("Take the first step today — 14 days completely free")

SUB: "कोई credit card नहीं। 2 मिनट में setup। पहला WhatsApp signal कल सुबह 6:30 AM।"
("No credit card. 2-minute setup. First WhatsApp signal tomorrow at 6:30 AM.")

CTA: "अभी शुरू करें →" (Start Now) — large, white bg, brandGreen700 text, pill, 64px height

Trust badges:
🔒 "आपका डेटा सुरक्षित है" (Your data is safe)  
✓ "DPDP Act 2023 compliant"
★★★★★ "4.9/5 — 200+ farmers"
```

---

### Section H-11: Footer

**Layout:** 5-column grid desktop, 2-column mobile, single below 480px

```
Column 1 — Brand:
Logo + tagline "सटीक भाव, सही फ़ैसला"
Address: Gorakhpur, Uttar Pradesh, India
WhatsApp: +91-XXXXXXXXXX (for non-customers)
Email: hello@poultrypulse.ai

Column 2 — Product:
Features (काम कैसे करता है)
Pricing (मूल्य)
Accuracy Dashboard (सटीकता)
Free Trial (मुफ़्त ट्रायल)
WhatsApp Demo

Column 3 — Resources:
Blog (ब्लॉग)
Case Studies (केस स्टडीज़)
FAQ
Gorakhpur Market Report
UP Poultry Guide

Column 4 — Company:
About Us (हमारे बारे में)
Press / Media
Careers
Contact (संपर्क करें)
Partner Program

Column 5 — Legal:
Privacy Policy
Terms of Service
Refund Policy
Data Processing Agreement
Accessibility Statement

Bottom Bar:
© 2026 PoultryPulse AI Technologies Pvt. Ltd. | CIN: U01404UP2026PTC123456
Language: हिंदी | English
Compliance: DPDP Act 2023 | IT Act 2000
```

---

## 5. POPUP & OVERLAY SPECIFICATIONS

### 5.1 Exit Intent Popup (Pre-Login)

```
Trigger: Mouse moves toward browser chrome (exit intent)
Delay: Not shown within first 30 seconds
Frequency: Once per session, 7-day cooldown

Design:
Width: 520px desktop, full-width mobile
Background: white, radius-[1.5rem], shadow heavy
Image: Farmer illustration (left side, 40% of popup)

COPY (exit intent — last-chance offer):
Headline: "रुकिए! पहला signal FREE पाएं"
(Wait! Get your first signal FREE)
Sub: "बस WhatsApp number दें — कल सुबह 6:30 AM को Gorakhpur का भाव मिलेगा"
(Just give your WhatsApp number — get Gorakhpur's price tomorrow at 6:30 AM)
Input: WhatsApp number field (+91 prefix)
CTA: "एक दिन का FREE signal → " 
Decline: "नहीं, मुझे daily price नहीं चाहिए" (No, I don't want daily prices)
[Note: Non-manipulative decline copy per popup-cro skill]

GDPR/DPDP note: "आपका नंबर सिर्फ price alerts के लिए" (Your number only for price alerts)
```

### 5.2 Announcement Banner (Top of Site)

```
Trigger: Always shown (dismissable)
Style: Sticky top bar, brandGreen700 bg, white text, 44px height

COPY:
"🎉 Phase 0 Launch: Gorakhpur, Deoria, Kushinagar में अब available — 14 दिन मुफ़्त शुरू करें →"
"🎉 Phase 0 Launch: Now available in Gorakhpur, Deoria, Kushinagar — Start 14 days free →"

Dismiss: X button right side, 44px touch target
Persist: sessionStorage key, don't re-show after dismiss
```

### 5.3 Demo Request Modal (Click-triggered from Nav/Hero)

```
Trigger: Click on "Live Demo देखें"
Type: Center modal, 640px wide

COPY:
Title: "Live Demo बुक करें" (Book a Live Demo)
Sub: "हमारी टीम 15 मिनट में दिखाएगी कैसे काम करता है — आपके farm के data से"
Form:
  - नाम (Name) — text
  - WhatsApp number (+91)
  - जिला (District) — dropdown: Gorakhpur, Deoria, Kushinagar, Basti, Maharajganj
  - झुंड का आकार (Flock size) — 10K-25K, 25K-50K, 50K-1L, 1L+
  - पसंदीदा समय (Preferred time) — date/time picker

CTA: "Demo कॉल बुक करें" — brandGreen700
Privacy note: Same as exit popup

Close: X top right, click-outside
```

---

## 6. MOTION & ANIMATION SPECIFICATION

### 6.1 Scroll-Driven Reveals (IntersectionObserver)

```typescript
// Animation config for all section reveals
const sectionRevealConfig = {
  initial: { opacity: 0, y: 24, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] }, // easeOutExpo
};

// Staggered children (stat cards, feature cards)
const staggerConfig = {
  container: { animate: { transition: { staggerChildren: 0.08 } } },
  child: {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: [0.25, 1, 0.5, 1] },
  }
};
```

### 6.2 Counter Animation (Stats)

```typescript
// On stat number reveal: count from 0 to value
// ₹8,433B market → counts up in 1.5s
// 95.2% accuracy → counts up from 0
const counterAnimation = {
  duration: 1500,
  easing: 'easeOutExpo',
  separator: ',',
  prefix: '₹' or '%' based on type,
};
```

### 6.3 Price Ticker (Hero Real-time feel)

```typescript
// Simulated live prices cycling in hero phone mockup
// 3 states cycling with cross-dissolve
const priceCycleConfig = {
  interval: 3000, // 3 seconds per state
  transition: { opacity: [0, 1], duration: 0.4 },
};
```

### 6.4 Nav Scroll Behaviour

```typescript
// Floating pill shrinks on scroll
const navScrollAnimation = {
  initial: { py: '10px', backdropBlur: '16px', scale: 1 },
  scrolled: { py: '6px', backdropBlur: '24px', scale: 0.98 },
  transition: '400ms cubic-bezier(0.25,1,0.5,1)',
};
```

---

## 7. ACCESSIBILITY REQUIREMENTS (WCAG 2.1 AA)

```
Contrast ratios:
- Body text on white: ≥7:1 (AAA target)
- Text on brandGreen700: #FFFFFF must achieve ≥4.5:1 ✓
- Amber500 on white: avoid for body text (ratio ~2.8:1) — use for decoration only

Keyboard navigation:
- All interactive elements focusable
- Focus ring: 3px solid offset, brandGreen500
- Skip-to-content link: first focusable element
- Modals: focus trap while open, return focus on close

Screen reader:
- All images: descriptive alt text in Hindi + English
- Price numbers: aria-label with units ("₹168 per kilogram")
- Charts: aria-label + data table alternative
- Icons: aria-hidden + adjacent text label

Motion:
@media (prefers-reduced-motion: reduce):
  - Disable all scroll animations
  - Static version of hero phone mockup
  - Instant transitions (1ms)
  - Counter: show final value immediately

Touch targets:
- Minimum 44×44px for all tappable elements
- Nav hamburger: 48×48px
- CTA buttons: full-width on mobile
```

---

## 8. RESPONSIVE BREAKPOINTS

```
Mobile first approach:
- Base: 0–639px (mobile)
- sm: 640px (large mobile / small tablet)
- md: 768px (tablet)
- lg: 1024px (laptop)
- xl: 1280px (desktop)
- 2xl: 1536px (large desktop)

Critical mobile rules:
- Hero: Single column, phone mockup below copy
- Nav: Hamburger at <768px
- Pricing: Single column, cards stacked
- FAQ: Full width accordion
- All sections: px-4 padding minimum
- min-h-[100dvh] not h-screen (iOS Safari fix)
- Font sizes: never below 14px, body minimum 16px
```

---

## 9. PERFORMANCE BUDGET (Pre-Login)

```
Core Web Vitals targets:
- LCP: < 1.8s (hero content)
- INP: < 150ms
- CLS: < 0.05

Asset budgets:
- Hero section initial: < 200KB JS
- Total page: < 800KB gzipped
- Images: WebP, lazy-loaded except hero
- Fonts: Sora (wght 400-800), Plus Jakarta Sans (wght 400-700), Noto Sans Devanagari (wght 400-700)
  → subset to Latin + Devanagari only
  → font-display: swap with metric-matched fallbacks

Image optimization:
- Hero phone mockup: SVG + CSS (no PNG)
- Farmer photos: WebP, max 120×120 for testimonials
- Icons: Phosphor Light via @phosphor-icons/react (tree-shakeable)
```

---

*Document: 01_prelogin_design_master.md*
*Next: 02_prelogin_requirements_master.md*
