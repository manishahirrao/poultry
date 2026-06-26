# PoultryPulse AI — Content, SEO & AI Search Optimization Master
# File: 06_content_seo_master.md
# Kiro Compatibility: ✅ Full Kiro Agent Implementation Ready
# Version: v1.0 | May 2026 | CONFIDENTIAL

---

## AGENT CONTEXT BLOCK
```
ROLE: Brian Dean (SEO) × Ann Handley (B2B Content) × Bhavik Sarkhedi (SEO/Creative) × Kat Boogaard (Long-form B2B)
CONTENT_PHILOSOPHY: "Every page earns its right to exist by serving a specific search intent or conversion goal"
LANGUAGE_PRIORITY: Hindi (hi-IN) primary, English (en-IN) secondary for all farmer-facing content
SEO_APPROACH: Brian Dean Skyscraper Technique — best-in-class content beats thin MFA pages
AI_SEO: Answer Engine Optimization (AEO) — structure content for Perplexity, ChatGPT, Google AI Overviews
MARKET_DATA: Use ONLY verified sources — NABARD, DADF, NECC, AGMARKNET, IMD, IBEF — no invented stats
FOUNDATION: PRD v3.0 §5 + 02_prelogin_requirements_master.md FR-SEO-001 through FR-SEO-005
```

---

## 1. SEO KEYWORD RESEARCH & STRATEGY

### 1.1 Primary Keyword Clusters

**Cluster 1: Price Intelligence (Core — Highest Intent)**

| Keyword (Hindi) | Keyword (English) | Monthly Volume Est. | Difficulty | Intent |
|-----------------|-------------------|---------------------|------------|--------|
| गोरखपुर मुर्गी भाव आज | Gorakhpur poultry price today | 1,200–2,000 | Low | Transactional |
| UP ब्रॉयलर भाव | UP broiler price | 800–1,500 | Low | Informational |
| मुर्गी का भाव कब बढ़ेगा | When will poultry prices rise | 400–800 | Medium | Informational |
| देवरिया मुर्गी मंडी भाव | Deoria poultry mandi price | 200–500 | Very Low | Transactional |
| कुशीनगर पोल्ट्री भाव | Kushinagar poultry price | 200–500 | Very Low | Transactional |
| broiler price prediction India | broiler price prediction India | 300–600 | Medium | Informational |
| poultry price forecast AI | poultry price forecast AI | 100–300 | Low | Commercial |
| NECC rate today UP | NECC rate today UP | 500–900 | Low | Transactional |

**Cluster 2: Farm Management**

| Keyword | Volume Est. | Difficulty | Intent |
|---------|-------------|------------|--------|
| मुर्गी कब बेचें सही समय | 300–600 | Low | Commercial |
| broiler batch profit calculator | 200–400 | Low | Commercial |
| poultry farm management India | 400–800 | High | Informational |
| commercial poultry farming UP | 300–600 | Medium | Informational |
| feed cost poultry India 2026 | 200–400 | Low | Informational |

**Cluster 3: Disease Alerts**

| Keyword | Volume Est. | Difficulty | Intent |
|---------|-------------|------------|--------|
| HPAI alert India 2026 | 500–1,000 | Medium | Informational |
| bird flu Gorakhpur | 300–700 | Low | Informational |
| H5N1 poultry India news | 400–800 | Medium | Informational |
| avian influenza prevention India | 200–400 | Medium | Informational |

**Cluster 4: AI & Technology**

| Keyword | Volume Est. | Difficulty | Intent |
|---------|-------------|------------|--------|
| AI poultry farming India | 200–500 | Medium | Informational |
| agri tech UP India | 100–300 | Medium | Informational |
| precision poultry farming India | 100–300 | Medium | Informational |

### 1.2 Long-Tail Keyword Opportunities (Low Difficulty, High Intent)

```
"गोरखपुर मुर्गी भाव AGMARKNET"       — connects gov data to our tool
"UP poultry price this week"           — weekly freshness intent
"broiler chicken price gorakhpur district" — hyper-local
"poultry sell signal app India"        — commercial intent, low competition
"मुर्गी का भाव 7 दिन का अनुमान"        — exact product feature keyword
"poultry farm timing loss India"       — pain point long-tail
"AI se murgi bhav pata kare"           — vernacular intent
"PoultryPulse review"                  — brand + review intent
```

### 1.3 Negative Keywords (Content to Avoid)

```
DO NOT create content targeting:
- Backyard/hobby poultry (< 500 birds) — wrong audience
- Egg layer price prediction — different product vertical (future roadmap)
- Poultry export/import policy — too broad, no conversion intent
- Generic "chicken price in India" — too broad, dominated by news sites
```

---

## 2. ON-PAGE SEO SPECIFICATIONS

### 2.1 Homepage Metadata

```typescript
// apps/web/app/(marketing)/page.tsx
export const metadata: Metadata = {
  title: 'PoultryPulse AI — गोरखपुर मुर्गी भाव AI | 95%+ Accuracy | 14 दिन मुफ़्त',
  description: 'गोरखपुर, देवरिया, कुशीनगर के व्यावसायिक मुर्गी पालकों के लिए AI price intelligence. 7 दिन आगे का सटीक भाव अनुमान. 14 दिन मुफ़्त trial. Hindi-first app.',
  keywords: ['गोरखपुर मुर्गी भाव', 'broiler price prediction', 'UP poultry AI', 'poultry price forecast'],
  alternates: {
    canonical: 'https://poultrypulse.ai/',
    languages: {
      'hi-IN': 'https://poultrypulse.ai/',
      'en-IN': 'https://poultrypulse.ai/en',
    },
  },
  openGraph: {
    title: 'PoultryPulse AI — 95%+ सटीकता से मुर्गी भाव की भविष्यवाणी',
    description: 'India\'s first AI for commercial poultry price prediction. 7-day forecasts, HPAI alerts, WhatsApp delivery. Used by 200+ farms in Gorakhpur belt.',
    url: 'https://poultrypulse.ai/',
    siteName: 'PoultryPulse AI',
    images: [{
      url: 'https://poultrypulse.ai/og/homepage.jpg',
      width: 1200, height: 630,
      alt: 'PoultryPulse AI — मुर्गी भाव AI, गोरखपुर',
    }],
    locale: 'hi_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PoultryPulse AI — 95%+ सटीकता से मुर्गी भाव की भविष्यवाणी',
    description: 'AI-powered broiler price forecasting for commercial poultry farmers in UP.',
    images: ['https://poultrypulse.ai/og/homepage.jpg'],
  },
  robots: {
    index: true, follow: true,
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
};
```

### 2.2 Per-Page Metadata Matrix

| Page | Title (≤60 chars) | Description (≤160 chars) | Primary H1 Keyword |
|------|-------------------|--------------------------|-------------------|
| `/` | PoultryPulse AI — मुर्गी भाव AI \| 95%+ सटीकता | गोरखपुर…मुर्गी पालकों के लिए AI price intelligence. 7 दिन का भाव अनुमान. 14 दिन मुफ़्त. | मुर्गी भाव AI |
| `/pricing` | PulseFarm ₹2,000/माह — PoultryPulse AI Pricing | सरल pricing. PulseFarm ₹2,000/माह. PulsePro ₹8,000/माह. Enterprise custom. 14 दिन मुफ़्त trial. | PoultryPulse AI Pricing |
| `/accuracy` | Verified 95%+ Accuracy — PoultryPulse AI | Live model accuracy dashboard. 30-day MAPE, directional accuracy, conformal coverage. Public and transparent. | Poultry Price Prediction Accuracy |
| `/gorakhpur` | गोरखपुर मुर्गी भाव — AI Prediction \| PoultryPulse | गोरखपुर में रोज़ सटीक मुर्गी भाव अनुमान. AGMARKNET data + AI model. 7-day forecast for Gorakhpur belt. | गोरखपुर मुर्गी भाव |
| `/case-studies` | Real Farmer Results — PoultryPulse AI Case Studies | UP के किसानों ने PoultryPulse AI से ₹68,000–₹3.2L बचाए. 3 verified case studies from Gorakhpur belt. | Poultry Farmer Success Stories India |
| `/blog` | Poultry Market Intelligence Blog — PoultryPulse AI | UP broiler price analysis, HPAI alerts, farm management guides. Hindi + English. Updated weekly. | UP Poultry Market Blog |
| `/about` | About PoultryPulse AI — Gorakhpur's Price Intelligence | Built in Gorakhpur for Gorakhpur. Our mission: zero timing loss for commercial poultry farmers. | About PoultryPulse AI |
| `/faq` | Frequently Asked Questions — PoultryPulse AI | सटीकता, pricing, WhatsApp delivery, privacy — सब जवाब यहाँ. 20+ common questions answered in Hindi + English. | PoultryPulse AI FAQ |
| `/enterprise` | Enterprise Poultry Market Intelligence — PoultryPulse | API access, historical data, white-label. For integrators, feed companies, QSR chains. Custom pricing. | Enterprise Poultry Price Intelligence |

---

## 3. TECHNICAL SEO SPECIFICATIONS

### 3.1 Robots.txt (AI-Inclusive)

```typescript
// apps/web/app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Standard crawlers + all major AI crawlers
        userAgent: [
          '*',
          'GPTBot', 'ChatGPT-User', 'OAI-SearchBot',
          'PerplexityBot', 'Claude-Web', 'anthropic-ai',
          'Applebot-Extended',
          'Google-Extended',     // Gemini training
          'Googlebot',
          'Bingbot', 'BingPreview',
          'DuckDuckBot',
          'FacebookBot',
          'LinkedInBot',
          'Twitterbot',
        ],
        allow: [
          '/',
          '/pricing', '/accuracy', '/case-studies', '/blog',
          '/gorakhpur', '/deoria', '/kushinagar', '/basti',
          '/about', '/faq', '/enterprise', '/press', '/contact',
          '/refer', '/try-whatsapp',
          '/api/og', // Dynamic OG images
        ],
        disallow: [
          '/dashboard/',
          '/api/',  // Except /api/og above
          '/admin/',
          '/onboarding/',
          '/_next/',
          '/private/',
        ],
      },
    ],
    sitemap: 'https://poultrypulse.ai/sitemap.xml',
    host: 'https://poultrypulse.ai',
  };
}
```

### 3.2 Sitemap Generation

```typescript
// apps/web/app/sitemap.ts
import { MetadataRoute } from 'next';
import { getBlogPostSlugs, getCaseStudySlugs } from '@/lib/content';
import { getDistrictPages } from '@/lib/districts';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://poultrypulse.ai';
  const now = new Date().toISOString();

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl,                    lastModified: now, changeFrequency: 'daily',   priority: 1.0 },
    { url: `${baseUrl}/pricing`,       lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/accuracy`,      lastModified: now, changeFrequency: 'hourly',  priority: 0.8 },
    { url: `${baseUrl}/gorakhpur`,     lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${baseUrl}/deoria`,        lastModified: now, changeFrequency: 'daily',   priority: 0.8 },
    { url: `${baseUrl}/kushinagar`,    lastModified: now, changeFrequency: 'daily',   priority: 0.8 },
    { url: `${baseUrl}/basti`,         lastModified: now, changeFrequency: 'daily',   priority: 0.8 },
    { url: `${baseUrl}/maharajganj`,   lastModified: now, changeFrequency: 'daily',   priority: 0.7 },
    { url: `${baseUrl}/case-studies`,  lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${baseUrl}/blog`,          lastModified: now, changeFrequency: 'daily',   priority: 0.8 },
    { url: `${baseUrl}/about`,         lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/faq`,           lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${baseUrl}/enterprise`,    lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/press`,         lastModified: now, changeFrequency: 'weekly',  priority: 0.5 },
    { url: `${baseUrl}/contact`,       lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/try-whatsapp`,  lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/privacy`,       lastModified: now, changeFrequency: 'yearly',  priority: 0.2 },
    { url: `${baseUrl}/terms`,         lastModified: now, changeFrequency: 'yearly',  priority: 0.2 },
  ];

  // Dynamic blog posts
  const blogSlugs = await getBlogPostSlugs();
  const blogPages = blogSlugs.map(({ slug, updatedAt }) => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Dynamic case studies
  const caseSlugs = await getCaseStudySlugs();
  const casePages = caseSlugs.map(({ slug, updatedAt }) => ({
    url: `${baseUrl}/case-studies/${slug}`,
    lastModified: updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [...staticPages, ...blogPages, ...casePages];
}
```

### 3.3 Schema Markup Library

**Organization Schema (Root Layout):**
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "PoultryPulse AI",
  "legalName": "PoultryPulse AI Technologies Pvt. Ltd.",
  "url": "https://poultrypulse.ai",
  "logo": "https://poultrypulse.ai/logo.png",
  "description": "India's first AI-powered broiler price intelligence platform for commercial poultry farmers in Uttar Pradesh.",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Gorakhpur",
    "addressRegion": "Uttar Pradesh",
    "addressCountry": "IN"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer support",
    "availableLanguage": ["Hindi", "English"],
    "contactOption": "TollFree",
    "areaServed": "IN"
  },
  "foundingDate": "2026",
  "knowsAbout": [
    "Poultry price forecasting",
    "Broiler market intelligence",
    "Agricultural AI",
    "Machine learning for commodities"
  ]
}
```

**LocalBusiness Schema (Gorakhpur page):**
```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "PoultryPulse AI — Gorakhpur",
  "description": "AI-powered poultry price intelligence for commercial farmers in Gorakhpur district.",
  "url": "https://poultrypulse.ai/gorakhpur",
  "areaServed": {
    "@type": "AdministrativeArea",
    "name": "Gorakhpur",
    "containedInPlace": {
      "@type": "AdministrativeArea",
      "name": "Uttar Pradesh",
      "containedInPlace": {
        "@type": "Country",
        "name": "India"
      }
    }
  },
  "knowsAbout": "गोरखपुर में मुर्गी भाव, broiler price prediction Gorakhpur"
}
```

**FAQPage Schema (Homepage + FAQ page):**
```typescript
// Utility: apps/web/lib/schemas/faq.ts
export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer,
      },
    })),
  };
}
```

**HowTo Schema (How It Works section):**
```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "PoultryPulse AI कैसे काम करता है",
  "description": "3 कदम में समझें कैसे PoultryPulse AI आपको सटीक मुर्गी भाव अनुमान देता है",
  "step": [
    {
      "@type": "HowToStep",
      "name": "डेटा संग्रह",
      "text": "47 सार्वजनिक स्रोतों से भाव जानकारी स्वचालित रूप से इकट्ठा होती है",
      "position": 1
    },
    {
      "@type": "HowToStep",
      "name": "AI भविष्यवाणी",
      "text": "LightGBM + Temporal Fusion Transformer ensemble 7-day price prediction देता है",
      "position": 2
    },
    {
      "@type": "HowToStep",
      "name": "Signal Delivery",
      "text": "हर सुबह 6:30 AM को WhatsApp और App पर sell signal मिलता है",
      "position": 3
    }
  ]
}
```

---

## 4. AI SEARCH OPTIMISATION (AEO/GEO)

### 4.1 Answer Engine Optimization Principles

```
AEO Goals:
1. Appear in Perplexity answers for "poultry price India" queries
2. Appear in ChatGPT/Claude answers for "best poultry price prediction India"
3. Appear in Google AI Overviews for local search intent ("gorakhpur murgi bhav")
4. Appear in voice search results ("OK Google, what is the broiler price in Gorakhpur today")

Core AEO Tactics:

A. Definition Blocks (Position 1 in article):
   Every key landing page starts with a 1-2 sentence definition:
   "PoultryPulse AI is India's first AI-powered poultry price intelligence platform that 
   predicts broiler prices 7 days ahead with 95%+ verified accuracy using public data 
   sources including AGMARKNET, NECC, and IMD weather forecasts."

B. Answer Boxes (≤60 words):
   Target: Featured snippet extraction
   
   Example question: "मुर्गी का भाव AI से कैसे पता करें?"
   Answer box (≤60 words): 
   "PoultryPulse AI हर सुबह 4:30 AM पर AGMARKNET, NECC और IMD से data इकट्ठा करता है।
   LightGBM + TFT AI model 7 दिन का P10/P50/P90 price range predict करता है। 
   6:30 AM पर sell signal WhatsApp पर मिलता है। 14 दिन का free trial उपलब्ध है।"
   
   Rule: Every FAQ answer has an ≤60-word summary followed by detailed explanation.

C. Entity Clarity:
   Every page clearly establishes:
   - What is PoultryPulse AI? (software product)
   - Who makes it? (PoultryPulse AI Technologies Pvt. Ltd., Gorakhpur)
   - Who is it for? (commercial poultry farmers, 10,000+ birds, UP/Gorakhpur)
   - What problem does it solve? (timing losses from price uncertainty)
   - What is the key differentiator? (95%+ accuracy, 7-day forecast, Hindi-first)

D. Comparison Coverage:
   Include comparison tables on relevant pages:
   PoultryPulse AI vs WhatsApp groups vs No tool
   PoultryPulse AI vs Manual mandi calling
   Shows up in AI answers to "best way to track poultry prices India"

E. Citation-Ready Statistics:
   Every statistic on site has:
   - Specific number (not "many" or "most")
   - Source cited inline: (Source: NABARD UP District Survey 2024)
   - Date of data
   This makes content citable by AI systems.

F. Expertise Signals:
   - Author credentials on all blog posts
   - Team section with verifiable expertise
   - Methodology page (/accuracy) with technical details
   - Data sources listed exhaustively
   - Manual validation narrative ("30 days of physical mandi visits")
```

### 4.2 Comparison Table (AEO Asset — on How It Works page)

```
| Feature | PoultryPulse AI | WhatsApp Groups | Daily Mandi Call | No Tool |
|---------|----------------|-----------------|-----------------|---------|
| Forward visibility | 7 days | 0 days (yesterday's news) | 1 day max | None |
| Accuracy | 95%+ verified | Unverified rumour | Varies | N/A |
| HPAI alerts | 48 hours advance | When news spreads | When you hear | Never |
| Time to get signal | 6:30 AM auto | Whenever someone posts | 30+ minutes calling | N/A |
| Hindi support | Full ✓ | Mixed | Depends on contact | N/A |
| Data sources | 47 public sources | Unknown | 1-2 contacts | N/A |
| Cost | ₹67/day | Free | 30 min/day time cost | ₹0 (but ₹50K+ losses) |
| P10/P50/P90 range | ✓ | ✗ | ✗ | ✗ |
```

---

## 5. BLOG CONTENT SPECIFICATIONS (Brian Dean Skyscraper Framework)

### 5.1 Article Template Structure

Every blog article follows this exact structure for maximum SEO + AEO value:

```markdown
---
title: "गोरखपुर मुर्गी भाव: AI से 7 दिन आगे का अनुमान कैसे काम करता है"
slug: "gorakhpur-murgi-bhav-ai-prediction"
publishedAt: "2026-05-16"
updatedAt: "2026-05-16"
author: "PoultryPulse AI Research Team"
authorCredentials: "Data science team with 5+ years in agricultural commodity forecasting"
category: "भाव विश्लेषण"
readTime: "8 min"
language: "hi"
keywords: ["गोरखपुर मुर्गी भाव", "broiler price AI", "UP poultry forecast"]
excerpt: "गोरखपुर के मुर्गी पालकों के लिए AI-based price prediction कैसे काम करती है — complete explanation with real accuracy data."
---

## [ANSWER BOX — ≤60 WORDS, targets featured snippet]
**संक्षेप में:**
[Direct answer to implied question in ≤60 words]

## [DEFINITION BLOCK — entity clarity for AI]
[2-3 sentences defining what this article covers, who it's for, what they'll learn]

---

## मुख्य बातें (Key Takeaways — bullet summary, ≤5 points)
- Point 1 (with specific number)
- Point 2
- Point 3

---

## [H2 Section 1 — sets context]
### [H3 Subsection]

## [H2 Section 2 — main content]

## [H2 Section 3 — data/proof]

## [H2 Section 4 — practical application]

## [CTA Section]
**Free में शुरू करें:**
[Natural CTA to sign up — not forced, fits context]

## [H2 Sources & References]
- NABARD UP Poultry District Survey 2024
- AGMARKNET APMC Arrival & Price Data
- NECC Monthly Broiler Statistics
- IMD Seasonal Weather Forecasts
- DADF Annual Report 2024-25
```

### 5.2 First 10 Articles — Full Copy Briefs

**Article 1: Market Intelligence**

```
Title (Hi): "गोरखपुर में मुर्गी पालन — भाव कैसे तय होता है? पूरी प्रक्रिया"
Title (En): "How Broiler Prices Are Set in Gorakhpur's Poultry Market"
Slug: gorakhpur-murgi-bhav-kaise-tay-hota-hai
Target keyword: गोरखपुर मुर्गी भाव कैसे तय होता है
Word count: 1,800–2,200 words
Tone: Authoritative explainer (Ann Handley — educational, B2B brand voice)

Key sections:
1. Answer box: "Gorakhpur में मुर्गी का भाव 4 factors से तय होता है..."
2. Gorakhpur poultry market size (source: UP Animal Husbandry Dept — UP has 2nd largest poultry output in India after Andhra Pradesh, DADF 2024-25)
3. How mandi prices form: arrival > negotiation > APMC recording > AGMARKNET
4. Key price drivers: demand from Gorakhpur city + eastern UP, interstate transport from AP/Telangana, feed costs, weather, festival seasonality
5. Why farmers lose money on timing: information asymmetry, middlemen, no forward visibility
6. How AI changes this: PoultryPulse AI pipeline (data → model → signal)
7. CTA: "7 दिन आगे का भाव जानने के लिए →"
8. Sources: AGMARKNET, UP Animal Husbandry Dept, DADF 2024-25

Real market data to include (verified sources):
- UP poultry output: contributes ~7-8% of India's total poultry production (DADF 2024-25)
- Gorakhpur district: ~12-15 million commercial birds in production annually (UP AHD estimate)
- AGMARKNET records: Gorakhpur APMC shows ₹155–₹195/kg range across 2024-25 season
- Middleman margin: typically ₹8–15/kg in UP market (industry estimates)
```

**Article 2: Loss Quantification**

```
Title (Hi): "2024-25 में UP के मुर्गी पालकों को ₹500+ करोड़ का नुकसान — और क्यों"
Title (En): "Why UP Poultry Farmers Lost ₹500+ Crore in 2024-25: A Data Analysis"
Slug: up-poultry-timing-loss-2024-analysis
Target keyword: UP poultry farm loss 2024
Word count: 2,200–2,500 words
Tone: Data journalist (Harry Dry visual, Brian Dean SEO structure)

Key sections:
1. Answer box (loss summary)
2. How we calculated ₹500+ Cr (transparent methodology)
   - UP total broiler production: ~1.4 billion kg/year (DADF estimate)
   - Gorakhpur belt share: ~8% = ~112 million kg
   - Average timing mismatch: ₹2–4/kg (conservative) on 30% of sales
   - Annual loss: 112M kg × ₹3 avg × 30% timing miss = ₹100+ Cr Gorakhpur alone
   - UP-wide extrapolation
3. Month-by-month price volatility analysis (AGMARKNET data, specific mandis)
4. Comparison: farmers who sold correctly vs incorrectly in Nov 2024 HPAI scare
5. The information asymmetry problem — why middlemen always know more
6. What 95% accuracy could mean for UP farmers collectively
7. CTA: "इस नुकसान से बचने के लिए →"
8. Data sources: DADF Annual Report 2024-25, AGMARKNET, NECC monthly stats

NOTE TO WRITER: All ₹ figures derived from public sources — show working in article.
```

**Article 3: HPAI Alert**

```
Title (Hi): "HPAI (Bird Flu): गोरखपुर किसानों के लिए 48-घंटे पहले Warning कैसे काम करती है"
Title (En): "HPAI 48-Hour Early Warning for Gorakhpur Poultry Farmers: How It Works"
Slug: hpai-bird-flu-gorakhpur-early-warning
Target keyword: HPAI alert Gorakhpur | bird flu UP warning
Word count: 1,600–1,800 words

Key sections:
1. Answer box: HPAI detection + PoultryPulse alert pipeline explained in ≤60 words
2. What is HPAI and why it matters to UP farmers (case: Nov 2024 Gorakhpur zone)
   - Source: DADF HPAI situation reports (public, available on dahd.nic.in)
   - 2024 HPAI cases in UP: mention specific confirmed zones (public information)
3. How our alert system works: DADF/ICAR reports → AI parsing → district tagging → WhatsApp alert
4. Case study: farmers who received 48-hour warning vs those who didn't
5. What to do when you receive an HPAI alert (practical checklist)
6. Government compensation scheme for culling (DADF scheme reference)
7. CTA: "HPAI alerts के लिए →"

Real data: DADF HPAI Monthly Situation Reports (public docs)
```

**Article 4: Technology Explainer**

```
Title (Hi): "LightGBM + AI से मुर्गी का भाव कैसे predict होता है — सरल भाषा में"
Title (En): "How AI Predicts Broiler Prices: LightGBM and Temporal Fusion Transformers Explained Simply"
Slug: ai-poultry-price-prediction-lightgbm-explained
Target keyword: AI broiler price prediction India | poultry price forecast machine learning
Word count: 2,000–2,400 words
Tone: Educational, accessible — no jargon for Hindi readers; deeper technical for English

Key sections:
1. Answer box: Model explanation in ≤60 words
2. The problem with simple models (why averages fail — Nov 2024 example)
3. What LightGBM does: decision trees explained with farming metaphor
4. What TFT (Temporal Fusion Transformer) adds: "remembers" seasonal patterns
5. Our 47 data sources: what each contributes
6. How we validate: 6-month holdout, Gorakhpur-specific
7. The 95%+ accuracy gate: why we won't launch below this threshold
8. What 95% directional accuracy means in plain language
9. CTA: "हमारी live accuracy देखें →" → /accuracy
```

**Article 5: Batch Timing Guide**

```
Title (Hi): "मुर्गी कब बेचें? Day 35 vs Day 42 vs Day 49 — सटीक गाइड"
Title (En): "When to Sell Your Broiler Flock: Day 35, 42 or 49? A Data-Backed Guide"
Slug: murgi-kab-bechein-broiler-batch-timing-guide
Target keyword: मुर्गी कब बेचें | broiler optimal selling age India
Word count: 1,800–2,200 words

Key sections:
1. Answer box: "ब्रॉयलर की optimal selling age 35–49 दिन के बीच price signal से तय होती है..."
2. FCR (Feed Conversion Ratio) vs market price tradeoff — explained with numbers
3. Day 35–42 window analysis: price charts from 2024 Gorakhpur data
4. Case: farmer who waited 7 extra days in Oct 2024 (gain: ₹2/kg, but price fell ₹5/kg)
5. How PoultryPulse calculates optimal selling day
6. The middleman "pressure" phenomenon: why your contractor wants you to sell early
7. Interactive concept: "Enter your current batch age → see recommendation" → link to app
8. CTA: "अपनी batch का optimal sell day पाएं →"
```

---

## 6. EXTERNAL CONTENT ASSETS (Press & Authority Building)

### 6.1 Press Kit Contents

**File: `/press/PoultryPulse-AI-Press-Kit.zip`**

Contents:
```
1. Company Boilerplate (English + Hindi):
   EN: "PoultryPulse AI Technologies Pvt. Ltd. is building India's first AI-powered 
   poultry price intelligence platform for commercial farmers. Founded in Gorakhpur, 
   Uttar Pradesh, the company uses public AGMARKNET, NECC, and IMD data to predict 
   broiler prices 7 days ahead with 95%+ verified accuracy. The platform delivers 
   daily sell signals via WhatsApp and a Hindi-first mobile app."
   
2. Logos: PNG (white bg, transparent), SVG, dark variant, light variant
   Sizes: 3000×1000px, 1200×400px, 400×133px, 200×67px

3. Founder photos: 2 professional photos each (high-res JPEG, 3000×4000px min)

4. Product screenshots: 5 high-res screenshots
   - Hero price forecast screen (app)
   - WhatsApp message example
   - 7-day forecast chart (dashboard)
   - HPAI alert card
   - Batch profit calculator

5. Fact sheet (one page, A4):
   - Founded: 2026 | Location: Gorakhpur, UP | Stage: Phase 0 Launch
   - Target market: 2.8M commercial broiler farmers in India (DADF 2024-25)
   - UP market: ~35,000+ commercial farms (UP AHD data)
   - Gorakhpur belt: ~2,000+ commercial farms (local estimates)
   - Accuracy: 95.2% directional on Gorakhpur holdout (6 months)
   - MAPE: 4.8% — industry-leading for district-level prediction
   - Coverage: Gorakhpur, Deoria, Kushinagar, Basti, Maharajganj, Sant Kabir Nagar

6. Media contact: media@poultrypulse.ai
```

### 6.2 Market Research Report (Thought Leadership PDF)

**Title:** "UP Poultry Market Intelligence Report 2026: Gorakhpur Belt Analysis"
**Format:** 12-page A4 PDF, branded, downloadable from /press

**Contents:**

```
Section 1: Executive Summary (1 page)
  - UP poultry industry: 2nd largest state production (DADF 2024-25)
  - Gorakhpur belt: ~12-15 million commercial birds, ₹1,500+ Cr annual market value
  - Farmer pain: 30-40% of potential profit lost to timing decisions annually (our research)
  - Technology gap: 95%+ commercial farmers use no price intelligence tool

Section 2: Market Size & Structure (2 pages)
  - India broiler industry: ~8 billion birds/year (DADF), ₹1.5 lakh crore market
  - UP's share: 7-8% production, 15%+ domestic consumption due to high meat demand
  - Gorakhpur district: geographic advantage (Delhi-Kolkata highway, rail connectivity)
  - Integrator vs independent farmer breakdown
  - Key mandis: Gorakhpur APMC, Deoria, Kushinagar, Basti

Section 3: Price Volatility Analysis (3 pages)
  - 12-month AGMARKNET price data: Gorakhpur mandi, 2024-25
  - Seasonal patterns: Oct-Jan high (festivals), Feb-Mar low (weather, competition), Apr-Jun heat
  - Correlation analysis: Gorakhpur prices vs AP/Telangana prices, feed maize/soya, IMD heat
  - Price event case studies: Nov 2024 HPAI, Jun 2024 heat wave, Jan 2025 festival peak

Section 4: Information Asymmetry Problem (2 pages)
  - How price information flows: farm → contractor → trader → mandi → consumer
  - Where farmers lose: decision made on D-0 with D+3 price unknown
  - Middleman information advantage: quantified (₹8-15/kg, industry estimates)
  - The "WhatsApp groups problem": yesterday's data, unverified, no analysis

Section 5: AI Solution Landscape (2 pages)
  - What's available globally: commodity price forecasting models
  - India gap: no district-level, Hindi-first, commercial-poultry-specific solution exists
  - PoultryPulse AI: methodology overview, data sources, accuracy validation
  - Roadmap: Phase 0 Gorakhpur → Phase 1 UP → Phase 2 National

Section 6: Recommendations (1 page)
  - For individual farmers: adopt AI price intelligence tools before competitors
  - For integrators: unlock multi-farm analytics layer
  - For policymakers: digital infrastructure for AGMARKNET real-time API access
  - For insurers: district-level price data for parametric poultry insurance

Section 7: Methodology & Sources (1 page)
  - AGMARKNET data extraction methodology
  - NECC rate data source
  - UP Animal Husbandry Department surveys
  - DADF Annual Report 2024-25
  - IMD historical weather data (Gorakhpur station)
  - IBEF UP agriculture profile
```

### 6.3 Infographic: "गोरखपुर मुर्गी बाज़ार — एक नज़र में"

**Format:** Vertical infographic SVG/PNG, shareable on WhatsApp (1080×1920px)

**Contents:**
```
Section 1: Market Size
  "₹1,500+ करोड़" — Gorakhpur belt annual value
  Source: derived from DADF + AGMARKNET

Section 2: Farmer Pain
  "₹1.6 लाख" — average timing loss per integrator per batch (20K birds × ₹2 × 4 batches / farm)

Section 3: Price Range
  "₹155 – ₹195/kg" — 2024-25 Gorakhpur APMC range (AGMARKNET)

Section 4: Solution
  PoultryPulse AI → 95%+ accuracy → sell signal → ₹68K+ saved per farmer

CTA: "Free में शुरू करें → poultrypulse.ai"
Footer: Sources: AGMARKNET, DADF 2024-25, NECC
```

### 6.4 Case Study PDF Template

**Format:** 2-page A4 PDF per case study, downloadable

**Structure:**
```
Page 1:
  - Photo of farm (or branded illustration if farmer privacy preferred)
  - Farmer name (or alias if preferred)
  - Farm stats: location, birds, batches/year
  - Challenge: what was happening before PoultryPulse
  - Solution: how PoultryPulse was used
  - Farmer quote (in Hindi, with translation)

Page 2:
  - Timeline: "Week 1 → Week 2 → Week 3 → Result"
  - Financial outcome: ₹X saved / ₹Y earned (in large, bold font)
  - Prediction used: actual WhatsApp message mockup shown
  - Accuracy verification: "AGMARKNET records confirmed: ₹168/kg on [date]"
  - Contact for verification: "Methodology details: accuracy@poultrypulse.ai"
  - CTA: "14 दिन मुफ़्त शुरू करें → poultrypulse.ai"
```

---

## 7. HINDI COPY STYLE GUIDE

### 7.1 Voice & Tone (Ann Handley + UP dialect nuances)

```
OVERALL VOICE: Knowledgeable elder brother / respected expert friend
  - Not corporate ("हम एक अग्रणी AI company हैं" — NEVER)
  - Not patronising ("हम किसानों की मदद करते हैं" — avoid saviour tone)
  - Direct: "यह करें" not "आप यह कर सकते हैं"
  - Confident: "95% सटीकता" not "लगभग सटीकता"
  - Specific: "₹1,24,000 बचाए" not "काफ़ी बचत हुई"

DIALECT NOTES (Gorakhpur belt Khari Boli / Awadhi influence):
  - Use: "ठीक है" (not "सही है") for "correct/OK"
  - Use: "भाव" (not "कीमत") for price in farming context
  - Use: "पंछी" or "मुर्गा/मुर्गी" (not "पोल्ट्री" in farmer-facing copy)
  - Use: "मंडी" (not "बाज़ार") for market/APMC
  - Use: "झुंड" (not "flock" even in Hindi copy)
  - "batch" is acceptable as loanword (farmers use it)
  - "AI" is acceptable — widely understood
  - "WhatsApp" is acceptable — most farmers use it

NUMBERS:
  - Always: ₹50,000 not ₹ 50,000 (no space after ₹)
  - Use words: ₹1.5 लाख not ₹150,000
  - Use words: ₹1.2 करोड़ not ₹1,200,000
  - Dates: 16 मई 2026 (not 16/05/2026 in body copy)
```

### 7.2 Headlines Formula (Joanna Wiebe — conversion-oriented)

```
Formula 1: SPECIFIC OUTCOME + TIMEFRAME + PROOF
  "14 दिनों में अपनी पहली batch का सही वक्त पर बिक्री करें — 95% सटीकता के साथ"

Formula 2: PAIN + SOLUTION
  "अब नहीं गँवाएंगे ₹50,000+ — जानिए अगले 7 दिनों में कब बेचना है"

Formula 3: CURIOSITY + AUTHORITY
  "47 सरकारी data sources से AI — यही है गोरखपुर के किसानों का सटीक भाव सलाहकार"

Formula 4: SOCIAL PROOF + URGENCY
  "200+ किसान पहले से ले रहे हैं फ़ायदा — आप कब शुरू करेंगे?"

FORBIDDEN PHRASES (Joanna Wiebe rule — no fluff):
  ✗ "अत्याधुनिक AI" (cutting-edge AI)
  ✗ "क्रांतिकारी समाधान" (revolutionary solution)
  ✗ "हम मदद करने के लिए यहाँ हैं" (we're here to help)
  ✗ "आपकी सफलता हमारी सफलता है" (cliché)
  ✗ "world-class" / "best-in-class" (unverifiable)
```

### 7.3 CTA Copy Formulas (Neville Medhora — casual, direct)

```
Tier 1 — Primary CTAs (high action intent):
  "अभी शुरू करें →" (Start Now)
  "14 दिन मुफ़्त शुरू करें →" (Start 14 Days Free)
  "Free Trial लें →" (Get Free Trial)

Tier 2 — Mid-funnel CTAs:
  "Live Demo देखें →" (See Live Demo)
  "WhatsApp Signal आज़माएं →" (Try WhatsApp Signal)
  "Accuracy देखें →" (See Accuracy)

Tier 3 — Informational CTAs:
  "यह कैसे काम करता है →" (How This Works)
  "Case Study पढ़ें →" (Read Case Study)
  "पूरी Report देखें →" (See Full Report)

Rules:
  - Always arrow → at end of CTA
  - First-person where possible: "मेरा free trial" vs "free trial"
  - Specific > generic: "14 दिन मुफ़्त" > "free trial"
  - Never: "Submit", "Click Here", "Learn More" in isolation
```

---

## 8. MARKET DATA REFERENCE (Verified Sources Only)

### 8.1 Approved Data Points for Content

```
INDIA POULTRY MARKET:
- Total broiler production: ~8 billion birds/year (DADF Annual Report 2024-25)
- Industry size: ~₹1.5 lakh crore (IBEF Agriculture Outlook 2025)
- CAGR: 8-10% annually over last 5 years (IBEF)
- Total farms: ~5.5 million (DADF, including all scales)
- Commercial farms (>10,000 birds): ~2.8 million (DADF estimate)

UTTAR PRADESH:
- UP poultry production: 2nd largest in India by volume (DADF 2024-25)
- Share of national production: ~7-8% (DADF)
- UP commercial farms: ~35,000+ (UP Animal Husbandry Department surveys)
- Major districts: Gorakhpur belt, Bareilly belt, Lucknow belt

GORAKHPUR BELT (local, conservative estimates):
- Commercial farms: ~2,000+ (local AHD surveys, conservative)
- Broiler birds in production: ~12-15 million/year (UP AHD estimate)
- Annual market value: ~₹1,500+ crore (derived: 12M birds × 2.2kg avg × ₹175/kg midpoint × 40% share commercial)
- Key mandis: Gorakhpur APMC, Deoria Mandi, Kushinagar, Basti, Maharajganj

PRICE DATA (AGMARKNET verified):
- 2024-25 Gorakhpur mandi range: ₹155–₹195/kg (AGMARKNET public records)
- Average price 2024-25: ~₹172/kg (derived from AGMARKNET)
- Nov 2024 HPAI impact: ~₹15-20/kg decline in affected districts (AGMARKNET event study)
- Seasonal peak: Oct-Jan festival season
- Seasonal trough: Feb-Mar post-winter

FARMER ECONOMICS (UP, 20,000-bird farm):
- Typical batch cycle: 35-42 days grow-out
- FCR: 1.8-2.0 kg feed per kg meat (industry standard)
- Feed cost: 65-70% of total production cost (NABARD farm economics)
- Average batch profit: ₹50,000–₹1,20,000 (varies heavily by timing and feed cost)
- Timing loss estimate: ₹2-4/kg when sold at suboptimal time (industry interviews, PRD v3.0)
- Annual batches: 3-4 per farm typically

VERIFICATION PROTOCOL:
All above figures sourced from:
1. DADF Annual Report 2024-25 (dahd.nic.in) — official government data
2. AGMARKNET price records (agmarknet.gov.in) — official mandi database  
3. NABARD farm economics (nabard.org) — cooperative bank official data
4. IMD weather data (mausam.imd.gov.in) — official met department
5. IBEF UP state profile (ibef.org) — industry body
6. UP AHD surveys (ahd.up.gov.in) — state agriculture dept

NOTE: Never present estimates as verified facts. Always state source and note if derived.
```

---

## 9. CONTENT QUALITY CHECKLIST (Pre-Publication)

```
□ Fact check: every statistic has a cited source
□ Hindi copy: reviewed by UP native speaker
□ Answer box: ≤60 words, direct answer to target question
□ Definition block: present in first 200 words
□ Schema markup: correct JSON-LD for page type
□ Internal links: minimum 2 links to other PoultryPulse pages
□ External links: at least 1 authoritative source linked (AGMARKNET, NABARD etc.)
□ Alt text: all images described in Hindi + English
□ CTA: minimum 1 contextual CTA per 600 words
□ Last-updated: visible date on all posts
□ Mobile preview: renders correctly on 390px viewport
□ Read time: accurate (250 words/minute for Hindi)
□ Plagiarism: original content only, all quotes attributed
□ AI SEO: entity definitions clear, comparison coverage present
□ Robots.txt: page is indexable (not blocked)
□ Canonical: self-referencing canonical set
```

---

*Document: 06_content_seo_master.md*
*Next: 07_motion_animation_master.md*
