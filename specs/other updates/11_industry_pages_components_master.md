# PoultryPulse AI — Industry Pages, Components & Implementation Master
# File: 11_industry_pages_components_master.md
# Kiro Compatibility: ✅ Full Kiro Agent Implementation Ready
# Version: v1.0 | May 2026 | CONFIDENTIAL

---

## AGENT CONTEXT BLOCK
```
ROLE: Senior UI Engineer + Content Strategist (Kaleigh Moore SaaS/E-commerce framework)
PURPOSE: Complete specification for industry-segment landing pages (S2–S6) + 
         all reusable component implementations
PHILOSOPHY: "Each segment page must speak the exact language of its reader" (Ann Handley)
DATA_ACCURACY: All market sizes and statistics verified from DADF/NABARD/IBEF (see §06)
FOUNDATION: PRD v3.0 §3 (Segments S1–S6) + 01_prelogin_design_master.md + 
            02_prelogin_requirements_master.md
```

---

## 1. SEGMENT-SPECIFIC LANDING PAGES

### 1.1 S2 Integrator Page (`/solutions/integrators`)

**Target:** Contract farming companies managing 20–500+ farms, 50K–50L birds total
**Primary Pain:** Lack of consolidated real-time intelligence across all farms simultaneously

```
PAGE HEADLINE:
  Hi: "20+ farms एक जगह — हर farm का सही sell signal"
  En: "Manage 20+ Farms From One Dashboard — With Sell Signals for Every Farm"
  Style: displayLarge, neutral-900

HERO STAT BAR (4 numbers, branching from S2 context):
  "₹50L+" — combined batch value under management (typical integrator)
  "20 farms" — max farms in PulsePro dashboard  
  "1 dashboard" — single view across all
  "6:30 AM" — daily consolidated signal

PAIN SECTION (integrator-specific):
  Headline: "20 farms को manually track करना असंभव है"
  Pain points:
    • "हर farm manager अलग-अलग information लेकर आता है"
    • "एक farm में sell करो, दूसरे में rate miss हो जाता है"
    • "Bulk sales में timing of even ₹1/kg = ₹50,000+ difference"
    • "Feed procurement: 5 lakh quintals? When to buy?"

SOLUTION FEATURES (S2-specific, Kaleigh Moore SaaS feature copy):
  Feature 1: Multi-Farm Command Centre
    Visual: Dashboard screenshot showing 5 farm cards
    Copy: "सभी 20 farms का status एक screen पर। Each farm: batch age, 
           current signal, harvest window, estimated revenue. No phone calls."
           
  Feature 2: Consolidated Revenue Forecasting
    Visual: Combined revenue chart across all farms
    Copy: "अगले 30 दिनों में आपके total portfolio से expected revenue: ₹X.
           AI-driven, per-mandi, per-batch. Enterprise CFO level accuracy."
           
  Feature 3: Bulk Feed Procurement Timing
    Visual: Feed cost alert + commodity chart
    Copy: "50,000 quintals maize को सही time पर buy करने का signal।
           ₹100/qtl × 50,000 = ₹50 लाख savings potential in good years."
           
  Feature 4: Farm-wise Performance Analytics
    Visual: Farm comparison table
    Copy: "कौन सी farm best performing है? कौन सी farm underperforming?
           AI-identified factors: breed, shed type, feed mix, sell timing."

PRICING (S2-specific):
  Highlight PulsePro at ₹8,000/month
  "Per farm: ₹400/farm/month when managing 20 farms" framing
  ROI: "1 correct bulk sell signal on 50,000 birds = ₹1,00,000+ → covers 12 months"
  
CTA: "Integrator Demo बुक करें →" → /contact?type=integrator-demo
```

---

### 1.2 S3 Feed Manufacturer Page (`/solutions/feed-manufacturers`)

**Target:** Commercial poultry feed manufacturers in UP/Bihar/MP
**Primary Pain:** Demand unpredictability → overproduction or stockout

```
PAGE HEADLINE:
  Hi: "जब किसान बेचेगा — तब चारे की मांग बढ़ेगी। पहले जानें।"
  En: "Know When Farmers Will Sell — Before They Increase Feed Demand"

KEY VALUE PROPOSITION:
  "Farmer sell signals = your demand forecast.
   When PoultryPulse AI predicts a 'sell now' signal across Gorakhpur belt,
   it means 100,000+ birds selling in the next 7 days.
   Which means: feed demand drops for 2 weeks, then spikes as new batches start."

FEED MANUFACTURER INTELLIGENCE FEATURES:
  1. Regional Sell-Signal Aggregation
     "5 mandis × average flock size × PoultryPulse customer coverage =
      district-level batch activity forecast. 14-day forward view."
      
  2. Feed Demand Curve Prediction
     "Post-sale lull: 5-7 days. New batch start signal: 10-14 days after bulk sell.
      Plan your production schedule. Reduce waste. Prevent stockout."
      
  3. Raw Material Timing Intelligence
     "Maize + soybean procurement: same 47-source data used for farmer signals,
      now available for your procurement team. API or CSV."
      
  4. Custom District Coverage
     "Enterprise API: choose your distribution districts.
      Build your own demand forecasting on top of our signals."

DATA PRODUCT SPEC (for enterprise tech team):
  API endpoint: GET /v1/aggregate/district-sell-signals
  Data: {district, date_range, estimated_birds_selling, confidence_interval}
  Refresh: daily at 06:00 AM IST
  History: 12-month historical (PulseIntel plan)
  Format: JSON or CSV
  SLA: 99.9% uptime

CTA: "Enterprise API Demo →" → /enterprise
```

---

### 1.3 S4 Trader/Broker Page (`/solutions/traders`)

**Target:** Poultry traders and brokers who buy from farmers and sell to processors
**Primary Pain:** Margin compression from price uncertainty on both sides

```
PAGE HEADLINE:
  Hi: "खरीदने का सही वक्त, बेचने का सही वक्त — दोनों AI से"
  En: "Know When to Buy From Farmers. Know When to Sell to Processors."

TRADER INTELLIGENCE VALUE PROP:
  "Farmers don't know the 7-day forecast. You will.
   Buy when signals show a 5-day hold recommendation (farmers will hold, 
   prices may dip 1-2 days before reversing). Sell when signals say sell.
   That's the arbitrage window — ethically, using public data."

FEATURES FOR TRADERS:
  1. Farmer Sell-Signal Intelligence
     "See which mandis will see high sell pressure today vs this week.
      High supply = price pressure. Low supply = buying opportunity."
      
  2. District-Level Supply Forecast
     "Gorakhpur vs Deoria vs Kushinagar — where is supply peaking?
      Where is it thin? Routing intelligence for truck procurement."
      
  3. Price Negotiation Intelligence
     "When farmer offers ₹162, but our P50 forecast is ₹168 in 3 days —
      that's negotiation data. When forecast shows drop, offer accordingly."
      
  4. Interstate Arbitrage Signal
     "Gorakhpur vs Hyderabad/Vijayawada price differential.
      When AP surplus moves north, it depresses UP prices 3-5 days later.
      We track the differential daily."

NOTE (ethical framing — Ann Handley honesty principle):
  "This is public data used intelligently. AGMARKNET records prices for everyone.
   We simply analyze faster. Using market intelligence is standard practice
   in commodity trading globally."

CTA: "Trader Intelligence Plan →" → /pricing (highlight PulsePro) or /enterprise
```

---

### 1.4 S5 QSR Chain Page (`/solutions/qsr`)

**Target:** Quick service restaurant chains, meat processors, institutional buyers
**Primary Pain:** Procurement cost volatility → menu pricing instability

```
PAGE HEADLINE:
  En: "Lock In Your Poultry Procurement Costs — With 7-Day Price Intelligence"
  Hi: "7 दिन पहले जानें — chicken कब सस्ता मिलेगा"

QSR-SPECIFIC CONTENT:
  Context: "India's QSR chicken segment: ₹8,000+ Cr (IBEF 2025).
            Chicken is 35-45% of food cost for most QSR brands.
            A ₹5/kg swing on 10,000 kg/month procurement = ₹50,000/month variance."

VALUE PROPOSITION:
  "PoultryPulse AI's 7-day forecast lets your procurement team:
   • Time spot purchases when our model shows price peaks in 3-5 days
   • Avoid over-procurement when model shows 7-day decline
   • Build procurement hedging calendar based on seasonal patterns
   • Reduce 20-30% of procurement cost variance"

FEATURES:
  1. Procurement Calendar Intelligence
     API-powered: GET /v1/procurement/7-day-window
     Output: buy/hold/reduce signals with P10/P50/P90 price bands
     
  2. Seasonal Pattern Reports
     Annual PDF + API: festival peaks, post-Eid lulls, summer disease risk
     
  3. Multi-City Coverage (Phase 2 roadmap)
     "Now: UP belt. Phase 2: AP/Telangana, Maharashtra, Karnataka"
     
  4. Supplier Intelligence
     "Identify supplier districts where prices are below national average —
      sourcing intelligence for procurement managers"

COMPLIANCE & INTEGRATION:
  "Data available via REST API for integration into your ERP/procurement system.
   Standard authentication. JSON responses. 99.9% SLA (PulseIntel plan)."

CTA: "Enterprise Procurement Demo →" → Calendly booking for enterprise team
```

---

### 1.5 S6 Insurer/Bank Page (`/solutions/insurers`)

**Target:** Agri insurers, NABARD, regional co-operative banks offering livestock insurance
**Primary Pain:** Actuarial uncertainty in poultry insurance pricing

```
PAGE HEADLINE:
  En: "Actuarially Sound Poultry Price Data — For Parametric Insurance Design"
  Hi: "Verified poultry price data for parametric insurance products"

INSURER VALUE PROPOSITION:
  "Traditional poultry insurance pays out on mortality.
   Parametric poultry insurance can pay out on price movements.
   For that, you need: reliable, auditable district-level price history.
   That's exactly what PoultryPulse AI provides."

DATA PRODUCT FOR INSURERS:
  1. Historical Price Database (12 months)
     District-level: Gorakhpur, Deoria, Kushinagar, Basti, Maharajganj
     AGMARKNET-validated: every data point cross-checked
     Format: CSV, JSON, via API
     Coverage: daily data, 5 mandis, 12 months
     
  2. Price Volatility Analytics
     Monthly MAPE, standard deviation, seasonal pattern analysis
     Useful for: actuarial table construction, premium pricing
     
  3. HPAI Event Attribution
     Historical HPAI events mapped to price impact
     Data: event date, affected zone, price impact (₹/kg), recovery timeline
     Useful for: event-triggered insurance product design
     
  4. Forward-Looking Risk Indicator
     7-day P10 (downside) as risk signal for claim likelihood estimation
     
NABARD ALIGNMENT:
  "PoultryPulse AI data aligns with NABARD's Digital Agriculture Mission
   objective of data-driven agri-financial products.
   We support data licensing for NABARD empanelled insurer products."

CTA: "Data Partnership Enquiry →" → /contact?type=insurer-partnership
```

---

## 2. BLOG COMPONENT IMPLEMENTATIONS

### 2.1 Blog Post MDX Components

```typescript
// apps/web/components/blog/mdx/
// Custom MDX components for blog posts and case studies

// CalloutBox.tsx — for important notes, warnings, sources
interface CalloutBoxProps {
  type: 'info' | 'warning' | 'source' | 'tip' | 'result';
  title?: string;
  children: React.ReactNode;
}

export function CalloutBox({ type, title, children }: CalloutBoxProps) {
  const styles = {
    info:    { bg: 'bg-blue-50',    border: 'border-blue-200',  icon: 'ℹ️' },
    warning: { bg: 'bg-amber-50',   border: 'border-amber-200', icon: '⚠️' },
    source:  { bg: 'bg-neutral-50', border: 'border-neutral-200', icon: '📋' },
    tip:     { bg: 'bg-brandGreen50', border: 'border-brandGreen200', icon: '💡' },
    result:  { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: '✅' },
  };
  const s = styles[type];
  return (
    <div className={`${s.bg} ${s.border} border rounded-xl p-4 my-6`}>
      {title && <p className="font-semibold text-sm mb-2">{s.icon} {title}</p>}
      <div className="text-sm text-neutral-700">{children}</div>
    </div>
  );
}

// StatBlock.tsx — for data-heavy callouts in articles
export function ArticleStatBlock({
  value, label, source, sourceUrl 
}: { value: string; label: string; source?: string; sourceUrl?: string }) {
  return (
    <div className="bg-brandGreen50 border border-brandGreen200 rounded-xl p-6 my-6 text-center">
      <p className="text-4xl font-bold text-brandGreen700 font-[Sora]">{value}</p>
      <p className="text-neutral-700 font-medium mt-1">{label}</p>
      {source && (
        <p className="text-xs text-neutral-400 mt-2">
          Source: {sourceUrl 
            ? <a href={sourceUrl} className="underline" target="_blank" rel="noopener noreferrer">{source}</a>
            : source
          }
        </p>
      )}
    </div>
  );
}

// FarmerQuote.tsx — styled testimonial block in articles
export function FarmerQuote({ 
  quote, quoteHi, name, location, outcome 
}: { quote: string; quoteHi: string; name: string; location: string; outcome?: string }) {
  return (
    <blockquote className="border-l-4 border-brandGreen700 pl-6 py-2 my-6">
      <p className="text-lg italic text-neutral-800 font-[Noto_Sans_Devanagari]">
        "{quoteHi}"
      </p>
      <p className="text-sm text-neutral-500 mt-2 italic">"{quote}"</p>
      <footer className="mt-3">
        <p className="font-semibold text-neutral-900">{name}</p>
        <p className="text-sm text-neutral-500">{location}</p>
        {outcome && (
          <span className="inline-block mt-1 bg-emerald-100 text-emerald-800 
                           text-xs font-semibold px-3 py-1 rounded-full">
            {outcome}
          </span>
        )}
      </footer>
    </blockquote>
  );
}

// ComparisonTable.tsx — standard vs PoultryPulse comparison
export function ComparisonTable({ 
  rows 
}: { rows: { feature: string; without: string; with: string }[] }) {
  return (
    <div className="my-6 overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-brandGreen700 text-white">
            <th className="p-3 text-left rounded-tl-xl">Feature</th>
            <th className="p-3 text-center">Without PoultryPulse</th>
            <th className="p-3 text-center rounded-tr-xl">With PoultryPulse AI</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-neutral-50'}>
              <td className="p-3 font-medium text-neutral-900">{row.feature}</td>
              <td className="p-3 text-center text-neutral-500">{row.without}</td>
              <td className="p-3 text-center text-brandGreen700 font-semibold">{row.with}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### 2.2 Case Study Detail Page Components

```typescript
// apps/web/components/case-studies/

// CaseStudyHero.tsx — top of each case study page
interface CaseStudyHeroProps {
  farmerName: string;
  location: string;
  birdCount: string;
  farmType: string;
  financialOutcome: string;
  outcomeType: 'saved' | 'earned';
  coverImageAlt: string;
}

export function CaseStudyHero({
  farmerName, location, birdCount, farmType, financialOutcome, outcomeType
}: CaseStudyHeroProps) {
  return (
    <div className="bg-brandGreen700 text-white rounded-3xl p-8 mb-8">
      <div className="flex flex-wrap gap-3 mb-4">
        <span className="bg-white/10 text-white text-xs px-3 py-1 rounded-full">
          Case Study
        </span>
        <span className="bg-white/10 text-white text-xs px-3 py-1 rounded-full">
          {location}
        </span>
      </div>
      <h1 className="text-2xl font-bold mb-2">{farmerName}</h1>
      <div className="flex flex-wrap gap-4 text-white/70 text-sm mb-6">
        <span>📍 {location}</span>
        <span>🐔 {birdCount} birds</span>
        <span>🏢 {farmType}</span>
      </div>
      <div className="bg-white/10 rounded-2xl p-4 inline-block">
        <p className="text-white/70 text-xs mb-1">Financial Outcome</p>
        <p className="text-3xl font-bold font-[Sora]">{financialOutcome}</p>
        <p className="text-white/70 text-sm">
          {outcomeType === 'saved' ? 'saved in losses' : 'in additional revenue'}
        </p>
      </div>
    </div>
  );
}

// CaseStudyTimeline.tsx — visual timeline of events
interface TimelineEvent {
  day: number | string;
  title: string;
  description: string;
  signal?: 'sell' | 'hold' | 'caution' | 'alert';
}

export function CaseStudyTimeline({ events }: { events: TimelineEvent[] }) {
  const signalColours = {
    sell: 'bg-emerald-100 border-emerald-400',
    hold: 'bg-amber-100 border-amber-400',
    caution: 'bg-red-100 border-red-400',
    alert: 'bg-red-100 border-red-600',
  };
  return (
    <div className="relative my-8">
      {/* Vertical line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-neutral-200" />
      <div className="space-y-6">
        {events.map((event, i) => (
          <div key={i} className="flex gap-4 relative">
            {/* Dot */}
            <div className="w-12 h-12 rounded-full bg-brandGreen700 text-white 
                           flex items-center justify-center text-xs font-bold 
                           flex-shrink-0 z-10">
              {typeof event.day === 'number' ? `D${event.day}` : event.day}
            </div>
            {/* Content */}
            <div className={`flex-1 rounded-xl p-4 border ${
              event.signal ? signalColours[event.signal] : 'bg-neutral-50 border-neutral-200'
            }`}>
              <p className="font-semibold text-neutral-900 mb-1">{event.title}</p>
              <p className="text-sm text-neutral-600">{event.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 3. GORAKHPUR DISTRICT PAGE — FULL SPEC

### 3.1 Local SEO Page (`/gorakhpur`)

```
PAGE TITLE: "गोरखपुर मुर्गी भाव — रोज़ सटीक AI अनुमान | PoultryPulse"
META DESC: "गोरखपुर APMC मंडी का ताज़ा ब्रॉयलर भाव। 7 दिन का AI forecast। 
            AGMARKNET + NECC data से। 14 दिन मुफ़्त trial।"
H1: "गोरखपुर मुर्गी भाव — आज और अगले 7 दिन"

SECTION 1: LIVE PRICE WIDGET (Above the fold)
  Fetches latest Supabase prediction for Gorakhpur mandi
  Displays: Today's P50 | P10–P90 range | Sell signal
  "अंतिम update: आज 06:12 AM" timestamp
  "14 दिन मुफ़्त trial →" CTA below widget

SECTION 2: GORAKHPUR MARKET PROFILE
  Headline: "गोरखपुर मुर्गी बाज़ार — एक परिचय"
  Content (data-backed, AGMARKNET verified):
    • Gorakhpur APMC: primary mandi for eastern UP poultry
    • Price range 2024-25: ₹155–₹195/kg (AGMARKNET data)
    • Key trading days: Monday and Friday (highest volume, AGMARKNET patterns)
    • Transport corridor: Delhi-Varanasi NH27 — major interstate route
    • Seasonal peak: Oct–Jan (festival demand), trough: Feb–Mar
  
  5-MANDI MAP (Leaflet.js):
    Markers: Gorakhpur APMC, Deoria Mandi, Kushinagar, Basti, Maharajganj
    Click marker: shows latest P50 for that mandi + link to district page

SECTION 3: RECENT GORAKHPUR PRICE HISTORY (7 days)
  Mini AreaChart (Recharts) — last 7 days actual prices
  Source attribution: "Data: AGMARKNET Gorakhpur APMC"
  Link: "पूरी history → /accuracy"

SECTION 4: LOCAL TESTIMONIALS (Gorakhpur-specific farmers)
  Same testimonial card design as homepage
  Only farmers from Gorakhpur district shown on this page

SECTION 5: LOCAL FAQ (Gorakhpur-specific)
  Q: "गोरखपुर में मुर्गी का भाव कहाँ check करें?"
  A: "AGMARKNET पर Gorakhpur APMC का daily arrival & price data available है।
      PoultryPulse AI AGMARKNET का data daily 4:30 AM पर collect करता है
      और 7 दिन का AI forecast 6:30 AM तक WhatsApp पर भेजता है।"
      
  Q: "गोरखपुर में मुर्गी का भाव कब सबसे ज़्यादा होता है?"
  A: "AGMARKNET 2024-25 data के अनुसार: Gorakhpur belt में अक्टूबर–जनवरी
      (त्योहारों का सीजन) में सबसे ज़्यादा demand और भाव। 
      June–August में heat wave और HPAI risk के कारण demand कम होती है।"
      
  Q: "NECC rate और AGMARKNET rate में क्या फ़र्क है?"
  A: "NECC (National Egg Coordination Committee) poultry producers की
      recommended rate है — एक guide price। AGMARKNET actual mandi 
      transaction prices record करता है। AGMARKNET rate ज़्यादा local
      और accurate होती है।"

SECTION 6: ADJACENT DISTRICTS GRID
  4 cards: Deoria | Kushinagar | Basti | Maharajganj
  Each: latest P50, sell signal badge, link to district page
  Copy: "आस-पास के जिलों का भाव भी देखें"

SECTION 7: FREE TRIAL CTA (local copy)
  Headline: "गोरखपुर के किसान — 14 दिन मुफ़्त आज़माएं"
  Sub: "₹0 में 14 दिन का access। कल सुबह 6:30 AM को पहला signal।"
  CTA: "अभी शुरू करें →" → /signup?district=gorakhpur&utm_source=gorakhpur_page

Schema: LocalBusiness + FAQPage + BreadcrumbList JSON-LD
```

---

## 4. SHARED COMPONENT: PRICE INTELLIGENCE WIDGET

### 4.1 PriceIntelligenceWidget (used on Gorakhpur + district pages)

```typescript
// apps/web/components/widgets/PriceIntelligenceWidget.tsx
// Used on: district pages, homepage accuracy section, accuracy page
// Data: fetched server-side (SSR) + client-side SWR refresh

interface PriceIntelligenceWidgetProps {
  mandi: 'gorakhpur' | 'deoria' | 'kushinagar' | 'basti' | 'maharajganj';
  showChart?: boolean;   // show 7-day sparkline, default true
  compact?: boolean;     // compact version for grid cells, default false
  initialData?: PredictionData | null;  // SSR pre-fetched
}

interface PredictionData {
  mandi: string;
  predicted_at: string;
  p10: number;
  p50: number;
  p90: number;
  sell_signal: 'SELL_NOW' | 'HOLD' | 'CAUTION';
  confidence: number;
  is_demo: boolean;
}

// Signal display config
const SIGNAL_CONFIG = {
  SELL_NOW: {
    labelHi: '✅ आज बेचें',
    labelEn: '✅ Sell Today',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-800',
    icon: '📈',
  },
  HOLD: {
    labelHi: '⏳ रुकें',
    labelEn: '⏳ Hold',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-800',
    icon: '📊',
  },
  CAUTION: {
    labelHi: '⚠️ सावधान',
    labelEn: '⚠️ Caution',
    bg: 'bg-red-50',
    border: 'border-red-200',
    badge: 'bg-red-100 text-red-800',
    icon: '📉',
  },
};

export function PriceIntelligenceWidget({ 
  mandi, showChart = true, compact = false, initialData 
}: PriceIntelligenceWidgetProps) {
  // SWR with SSR initial data
  const { data, error, isLoading } = useSWR<PredictionData>(
    `/api/public/predictions?mandi=${mandi}`,
    fetcher,
    { fallbackData: initialData, refreshInterval: 600_000 }
  );
  
  if (isLoading && !initialData) return <PriceWidgetSkeleton compact={compact} />;
  if (error && !data) return <PriceWidgetError mandi={mandi} />;
  if (!data) return <PriceWidgetEmpty />;
  
  const signal = SIGNAL_CONFIG[data.sell_signal];
  const isStale = new Date().getTime() - new Date(data.predicted_at).getTime() > 86_400_000;
  
  return (
    <div className={`${signal.bg} ${signal.border} border rounded-2xl 
                     ${compact ? 'p-4' : 'p-6'} relative`}>
      {/* Demo badge */}
      {data.is_demo && (
        <span className="absolute top-3 right-3 text-[10px] bg-neutral-200 
                         text-neutral-600 px-2 py-0.5 rounded-full">
          Demo
        </span>
      )}
      
      {/* Stale warning */}
      {isStale && (
        <div className="bg-amber-100 border border-amber-200 rounded-lg px-3 py-1.5 
                        mb-3 flex items-center gap-2">
          <span className="text-amber-600 text-xs">⚠️</span>
          <span className="text-amber-700 text-xs">
            डेटा पुराना है — अगला update 6:30 AM पर
          </span>
        </div>
      )}
      
      {/* Mandi label */}
      <p className="text-xs font-medium text-neutral-500 mb-1">
        {MANDI_NAMES[mandi]} · {formatRelativeTime(data.predicted_at)}
      </p>
      
      {/* Price */}
      <div className="flex items-baseline gap-2 mb-2">
        <span className={`font-bold text-neutral-900 font-[Sora] 
                          ${compact ? 'text-2xl' : 'text-3xl'}`}>
          ₹{data.p50}
        </span>
        <span className="text-sm text-neutral-500">/kg</span>
      </div>
      
      {/* P10–P90 range */}
      <p className="text-xs text-neutral-500 mb-3">
        Range: ₹{data.p10} – ₹{data.p90}/kg (P10–P90)
      </p>
      
      {/* Signal badge */}
      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${signal.badge}`}>
        {signal.labelHi}
      </span>
      
      {/* Confidence */}
      {!compact && (
        <p className="text-xs text-neutral-400 mt-2">
          Confidence: {Math.round(data.confidence * 100)}%
        </p>
      )}
      
      {/* Sparkline chart */}
      {showChart && !compact && (
        <div className="mt-4" aria-hidden="true">
          <PriceSparkline mandi={mandi} />
        </div>
      )}
    </div>
  );
}
```

---

## 5. COMPLETE REUSABLE UI COMPONENT IMPLEMENTATIONS

### 5.1 Button Component (Full Implementation)

```typescript
// apps/web/components/ui/Button.tsx
'use client';

import { motion } from 'framer-motion';
import { forwardRef } from 'react';
import Link from 'next/link';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'cta' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  trailingArrow?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  'aria-label'?: string;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:     'bg-brandGreen700 text-white hover:bg-brandGreen600 shadow-sm',
  secondary:   'bg-transparent text-brandGreen700 border border-brandGreen700 hover:bg-brandGreen50',
  ghost:       'bg-transparent text-neutral-700 hover:bg-neutral-100',
  cta:         'bg-saffronOrange text-white hover:bg-saffronOrange/90 shadow-sm',
  destructive: 'bg-red-600 text-white hover:bg-red-700',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-sm rounded-xl gap-1.5',
  md: 'h-[52px] px-6 text-base rounded-2xl gap-2',
  lg: 'h-[60px] px-8 text-lg rounded-2xl gap-2.5',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  children,
  href,
  onClick,
  disabled = false,
  loading = false,
  fullWidth = false,
  trailingArrow = false,
  type = 'button',
  className = '',
  'aria-label': ariaLabel,
}, ref) => {
  const baseClasses = `
    inline-flex items-center justify-center font-semibold 
    transition-colors duration-200 focus-visible:outline-none 
    focus-visible:ring-2 focus-visible:ring-brandGreen500 focus-visible:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${fullWidth ? 'w-full' : ''}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  const content = (
    <>
      {loading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent 
                         rounded-full animate-spin" aria-hidden="true" />
      ) : children}
      {trailingArrow && !loading && (
        <motion.span
          className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/20"
          whileHover={{ x: 2 }}
          transition={{ duration: 0.15 }}
          aria-hidden="true"
        >
          →
        </motion.span>
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={baseClasses} aria-label={ariaLabel}>
        {content}
      </Link>
    );
  }

  return (
    <motion.button
      ref={ref}
      type={type}
      className={baseClasses}
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-busy={loading}
      whileHover={!disabled && !loading ? { scale: 1.01 } : undefined}
      whileTap={!disabled && !loading ? { scale: 0.98 } : undefined}
      transition={{ duration: 0.12 }}
    >
      {content}
    </motion.button>
  );
});

Button.displayName = 'Button';
```

### 5.2 Card Component (Double-Bezel Architecture)

```typescript
// apps/web/components/ui/Card.tsx

type CardVariant = 'default' | 'elevated' | 'glass' | 'tinted' | 'dark';

interface CardProps {
  variant?: CardVariant;
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg' | 'none';
  as?: 'div' | 'article' | 'section' | 'li';
}

const outerVariants: Record<CardVariant, string> = {
  default:  'bg-white border border-neutral-100',
  elevated: 'bg-white shadow-[0_4px_24px_rgba(26,107,60,0.08)]',
  glass:    'bg-white/80 backdrop-blur-xl border border-white/20',
  tinted:   'bg-brandGreen50 border border-brandGreen100',
  dark:     'bg-neutral-900 border border-white/10',
};

const paddingClasses = {
  sm: 'p-2',
  md: 'p-3',
  lg: 'p-4',
  none: 'p-0',
};

const innerPaddingClasses = {
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-6',
  none: 'p-0',
};

export function Card({
  variant = 'default',
  children,
  className = '',
  innerClassName = '',
  hover = false,
  padding = 'md',
  as: Tag = 'div',
}: CardProps) {
  const outerClasses = `
    rounded-[2rem] ${outerVariants[variant]} ${paddingClasses[padding]}
    ${hover ? 'transition-all duration-250 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(26,107,60,0.12)] cursor-pointer' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  const innerClasses = `
    bg-transparent rounded-[calc(2rem-0.375rem)] ${innerPaddingClasses[padding]}
    ${innerClassName}
  `.trim().replace(/\s+/g, ' ');

  return (
    <Tag className={outerClasses}>
      <div className={innerClasses}>
        {children}
      </div>
    </Tag>
  );
}
```

### 5.3 Section Wrapper (Consistent section layout)

```typescript
// apps/web/components/ui/Section.tsx
// Provides consistent section vertical rhythm + container

interface SectionProps {
  children: React.ReactNode;
  background?: 'white' | 'tinted' | 'dark' | 'gradient';
  size?: 'sm' | 'md' | 'lg';  // vertical padding
  id?: string;
  className?: string;
  containerClassName?: string;
  as?: 'section' | 'div' | 'article';
}

const bgClasses = {
  white:    'bg-white',
  tinted:   'bg-brandGreen25',
  dark:     'bg-brandGreen700',
  gradient: 'bg-[linear-gradient(135deg,#1A6B3C_0%,#0F4A28_60%,#1C2B22_100%)]',
};

const sizeClasses = {
  sm: 'py-12 md:py-16 lg:py-20',
  md: 'py-16 md:py-20 lg:py-24',
  lg: 'py-20 md:py-24 lg:py-32',
};

export function Section({
  children, background = 'white', size = 'md',
  id, className = '', containerClassName = '', as: Tag = 'section'
}: SectionProps) {
  return (
    <Tag
      id={id}
      className={`${bgClasses[background]} ${sizeClasses[size]} ${className}`}
    >
      <div className={`
        mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 xl:px-12
        ${containerClassName}
      `.trim().replace(/\s+/g, ' ')}>
        {children}
      </div>
    </Tag>
  );
}
```

### 5.4 Complete FormattedCurrency Utility

```typescript
// apps/web/lib/formatCurrency.ts

type Locale = 'hi' | 'en';

interface FormatOptions {
  locale?: Locale;
  showPaise?: boolean;     // show decimals (false = integer only)
  compact?: boolean;       // use lakh/crore abbreviation
  stripTrailingZeros?: boolean;
}

const LAKH = 100_000;
const CRORE = 10_000_000;

export function formatINR(amount: number, options: FormatOptions = {}): string {
  const { locale = 'hi', compact = false, stripTrailingZeros = true } = options;

  if (compact) {
    if (amount >= CRORE) {
      const val = amount / CRORE;
      const formatted = stripTrailingZeros && val % 1 === 0
        ? val.toFixed(0)
        : val.toFixed(1).replace(/\.0$/, '');
      return locale === 'hi'
        ? `₹${formatted} करोड़`
        : `₹${formatted} Cr`;
    }
    if (amount >= LAKH) {
      const val = amount / LAKH;
      const formatted = stripTrailingZeros && val % 1 === 0
        ? val.toFixed(0)
        : val.toFixed(1).replace(/\.0$/, '');
      return locale === 'hi'
        ? `₹${formatted} लाख`
        : `₹${formatted} L`;
    }
  }

  // Indian comma formatting: 1,23,45,678
  const intPart = Math.floor(Math.abs(amount));
  const str = intPart.toString();
  if (str.length <= 3) return `₹${str}`;

  const last3 = str.slice(-3);
  const remaining = str.slice(0, -3);
  const withCommas = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return `₹${withCommas},${last3}`;
}

export function formatKgPrice(price: number): string {
  return `₹${price}/kg`;
}

export function formatPriceBand(p10: number, p90: number): string {
  return `₹${p10}–₹${p90}/kg`;
}

// For loss calculator output
export function formatLossCalc(birds: number, batches: number, locale: Locale = 'hi'): string {
  const annualLoss = birds * 2 * batches; // ₹2/bird avg timing loss
  return formatINR(annualLoss, { compact: true, locale });
}

// For ROI calculation
export function formatROI(potentialLoss: number, planCost: number): string {
  const ratio = potentialLoss / planCost;
  return `₹${ratio.toFixed(0)}`;
}
```

---

## 6. IMPLEMENTATION TASK ADDENDUM

### Additional Tasks from Industry Pages + Components

| ID | Task | File | Priority | Est. Hours |
|----|------|------|----------|-----------|
| IP-01 | S2 Integrator page | app/(marketing)/solutions/integrators/ | 🟢 P2 | 8h |
| IP-02 | S3 Feed manufacturer page | app/(marketing)/solutions/feed-manufacturers/ | 🟢 P2 | 6h |
| IP-03 | S4 Trader page | app/(marketing)/solutions/traders/ | 🟢 P2 | 6h |
| IP-04 | S5 QSR page | app/(marketing)/solutions/qsr/ | 🟢 P2 | 6h |
| IP-05 | S6 Insurer page | app/(marketing)/solutions/insurers/ | 🟢 P2 | 6h |
| IP-06 | Solutions index page | app/(marketing)/solutions/ | 🟢 P2 | 4h |
| CP-01 | MDX blog components | components/blog/mdx/ | 🟢 P2 | 6h |
| CP-02 | Case study components | components/case-studies/ | 🟡 P1 | 8h |
| CP-03 | PriceIntelligenceWidget | components/widgets/PriceIntelligenceWidget.tsx | 🟡 P1 | 8h |
| CP-04 | Button (full implementation) | components/ui/Button.tsx | 🔴 P0 | 3h |
| CP-05 | Card (double-bezel) | components/ui/Card.tsx | 🔴 P0 | 2h |
| CP-06 | Section wrapper | components/ui/Section.tsx | 🔴 P0 | 1h |
| CP-07 | formatCurrency utility | lib/formatCurrency.ts | 🔴 P0 | 2h |
| CP-08 | District page template | components/districts/DistrictPage.tsx | 🟡 P1 | 6h |
| CP-09 | Public predictions API | app/api/public/predictions/route.ts | 🟡 P1 | 3h |

---

## 7. SOLUTIONS INDEX PAGE (`/solutions`)

```
ROUTE: /solutions
PURPOSE: Hub page linking to all segment-specific pages
SEO: Target "poultry intelligence solutions India" + segment keywords

LAYOUT: 5 solution cards in 2-row grid
  Row 1: Integrators, Feed Manufacturers, Traders (3 columns)
  Row 2: QSR Chains, Insurers/Banks (2 columns, centred)

Each card:
  - Segment icon (Phosphor Light)
  - Segment name (Hi + En)
  - One-line pain (Hi)
  - Key metric ("Manage 20+ farms" / "Procurement intelligence")
  - "और जानें →" link
  - Hover: card lifts + brandGreen border
  
Below grid:
  "S1 किसानों के लिए →" with link to homepage
  Copy: "व्यक्तिगत किसान? Homepage पर जाएं — WhatsApp signal free trial"

CTA section:
  "अपने business के लिए सही solution खोजें →"
  "Enterprise team से बात करें →" Calendly link
```

---

*Document: 11_industry_pages_components_master.md*
*Next: 12_implementation_quick_reference.md (final doc)*
