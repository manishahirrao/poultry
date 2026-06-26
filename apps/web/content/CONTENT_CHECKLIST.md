# PoultryPulse AI — Content Quality Checklist (Pre-Publication)
# File: apps/web/content/CONTENT_CHECKLIST.md
# Version: v1.0 | May 2026
# Reference: 06_content_seo_master.md §9

---

## Purpose
This checklist ensures all published content meets PoultryPulse AI's quality standards for SEO, accuracy, and user experience. Use this before publishing any blog post, case study, or landing page copy.

---

## Pre-Publication Checklist

### Fact Checking
- [ ] **Every statistic has a cited source**
  - Source must be authoritative (DADF, AGMARKNET, NABARD, IMD, IBEF, UP AHD)
  - Source must be linked or referenced in "Sources & References" section
  - Estimates must be clearly labeled as estimates, not facts
  - No invented numbers — all data from verified sources

### Hindi Copy Quality
- [ ] **Hindi copy reviewed by UP native speaker**
  - Grammar and syntax correct for Hindi
  - Appropriate use of Devanagari script
  - Natural phrasing (not direct English translation)
  - Cultural context appropriate for UP farmers
  - Technical terms explained in simple Hindi where needed

### Answer Box (Featured Snippet Optimization)
- [ ] **Answer box ≤60 words**
  - Direct answer to implied question
  - No fluff or filler
  - Front-load key information
  - Targets Google featured snippet
  - Hindi answer for Hindi articles

### Definition Block (AI SEO)
- [ ] **Definition block present in first 200 words**
  - 2-3 sentences defining what article covers
  - Who it's for (target audience)
  - What they'll learn (key takeaways)
  - Entity clarity for AI search engines

### Schema Markup
- [ ] **Correct JSON-LD for page type**
  - Blog posts: BlogPosting schema
  - Case studies: Article schema
  - Homepage: Organization + WebSite + FAQPage + HowTo
  - District pages: LocalBusiness + FAQPage
  - Pricing page: Product schema (3 plans)
  - Accuracy page: Dataset schema
  - FAQ page: FAQPage schema
  - Validate at https://validator.schema.org

### Internal Linking
- [ ] **Minimum 2 internal links to other PoultryPulse pages**
  - Contextual links (not forced)
  - Relevant to user journey
  - Descriptive anchor text (not "click here")
  - Links to related blog posts, pricing, accuracy, etc.

### External Linking
- [ ] **At least 1 authoritative source linked**
  - Government sources: DADF, AGMARKNET, NABARD, IMD
  - Industry bodies: NECC, IBEF
  - Academic sources (if applicable)
  - Links should be dofollow for authority building

### Image Alt Text
- [ ] **All images described in Hindi + English**
  - Descriptive alt text (not "image1")
  - Hindi description for Hindi content
  - English description for English content
  - Includes context and relevance to article

### Call-to-Action (CTA)
- [ ] **Minimum 1 contextual CTA per 600 words**
  - Natural fit with content (not forced)
  - Relevant to article topic
  - Clear value proposition
  - Specific action (e.g., "14 दिन मुफ़्त शुरू करें")

### Last Updated Date
- [ ] **Visible date on all posts**
  - PublishedAt date in frontmatter
  - UpdatedAt date if content modified
  - Date visible to users (not hidden in metadata)
  - Format: YYYY-MM-DD (ISO standard)

### Mobile Preview
- [ ] **Renders correctly on 390px viewport**
  - Text readable without zooming
  - Images responsive
  - Tables scrollable if needed
  - No horizontal scroll
  - Touch targets ≥44×44px

### Read Time Accuracy
- [ ] **Accurate read time (250 words/minute for Hindi)**
  - Count words in article body
  - Divide by 250 for Hindi, 300 for English
  - Round to nearest minute
  - Display in frontmatter and UI

### Plagiarism Check
- [ ] **Original content only, all quotes attributed**
  - No plagiarism (check with tool like Copyscape)
  - All direct quotes in quotation marks
  - All paraphrased content properly attributed
  - No copying from competitors

### AI Search Optimization (AEO)
- [ ] **Entity definitions clear**
  - What is PoultryPulse AI? (software product)
  - Who makes it? (PoultryPulse AI Technologies Pvt. Ltd.)
  - Who is it for? (commercial poultry farmers, 10,000+ birds, UP/Gorakhpur)
  - What problem does it solve? (timing losses from price uncertainty)
  - What is the key differentiator? (95%+ accuracy, 7-day forecast, Hindi-first)

- [ ] **Comparison coverage present**
  - PoultryPulse AI vs WhatsApp groups
  - PoultryPulse AI vs Manual mandi calling
  - PoultryPulse AI vs No tool
  - Shows up in AI answers to "best way to track poultry prices India"

### Robots.txt Check
- [ ] **Page is indexable (not blocked)**
  - Check robots.txt — page not in disallow list
  - No noindex meta tag
  - Canonical URL set correctly

### Canonical URL
- [ ] **Self-referencing canonical set**
  - Canonical tag points to page itself
  - No redirect chains
  - HTTPS URL
  - No parameters in canonical (clean URL)

---

## Additional Quality Checks

### SEO Meta Tags
- [ ] **Title tag ≤60 characters**
- [ ] **Meta description ≤160 characters**
- [ ] **Primary keyword in title**
- [ ] **Primary keyword in first 100 words**
- [ ] **H1 tag present and unique**
- [ ] **H2/H3 structure logical**

### Content Structure
- [ ] **Introduction hooks reader**
- [ ] **Key takeaways section present**
- [ ] **Scannable with bullet points/numbered lists**
- [ ] **Short paragraphs (max 3-4 sentences)**
- [ ] **Subheadings every 300 words**

### User Experience
- [ ] **Content answers user's question**
- [ ] **Actionable advice provided**
- [ ] **Examples and case studies included**
- [ ] **Technical jargon explained**
- [ ] **Conclusion summarizes key points**

### Technical Performance
- [ ] **Page load speed <3 seconds**
- [ ] **Images optimized (WebP format, compressed)**
- [ ] **No broken links**
- [ ] **SSL certificate valid**
- [ ] **Mobile-friendly test passes**

---

## Publication Approval Process

### Before Publishing
1. **Writer Self-Review**: Complete this checklist
2. **Editor Review**: Hindi copy check by native speaker
3. **SEO Review**: Schema validation and meta tags check
4. **Technical Review**: Links, images, performance check
5. **Final Approval**: Content team lead sign-off

### After Publishing
1. **Monitor Performance**: Track analytics (traffic, engagement, conversions)
2. **Check Indexing**: Verify page indexed in Google Search Console
3. **User Feedback**: Collect and address user comments/questions
4. **Update as Needed**: Refresh content if data becomes outdated

---

## Common Mistakes to Avoid

### Content Quality
- ❌ Publishing without Hindi native speaker review
- ❌ Using statistics without sources
- ❌ Forgetting answer box (misses featured snippet opportunity)
- ❌ No internal linking (poor user journey)
- ❌ No external authoritative links (low authority)

### SEO Mistakes
- ❌ Keyword stuffing (unnatural keyword repetition)
- ❌ Missing or incorrect schema markup
- ❌ No canonical URL (duplicate content issues)
- ❌ Blocking page in robots.txt accidentally
- ❌ Title tag too long (>60 characters)

### Technical Mistakes
- ❌ Broken links (404 errors)
- ❌ Unoptimized images (slow page load)
- ❌ Missing alt text (accessibility issue)
- ❌ Not mobile-responsive (poor UX)
- ❌ No SSL certificate (security warning)

---

## Quick Reference: Authoritative Sources

### Government Sources (Highest Authority)
- **DADF**: Department of Animal Husbandry & Dairying (dahd.nic.in)
- **AGMARKNET**: Agricultural Marketing Information Network (agmarknet.gov.in)
- **NABARD**: National Bank for Agriculture and Rural Development (nabard.org)
- **IMD**: India Meteorological Department (mausam.imd.gov.in)
- **UP AHD**: Uttar Pradesh Animal Husbandry Department (ahd.up.gov.in)

### Industry Bodies
- **NECC**: National Egg Coordination Committee (necc.in)
- **IBEF**: India Brand Equity Foundation (ibef.org)
- **BAI**: Broiler Association of India (if applicable)

### Academic Sources
- **ICAR**: Indian Council of Agricultural Research (icar.org.in)
- **Veterinary Colleges**: Research papers (peer-reviewed)

### Commercial Sources (Use with Caution)
- **Feed company reports** (may be biased)
- **Integrator data** (may not be public)
- **WhatsApp groups** (unverified, not authoritative)

---

## Template for New Content

```markdown
---
title: "Article Title in Hindi"
slug: "article-slug"
publishedAt: "YYYY-MM-DD"
updatedAt: "YYYY-MM-DD"
author: "Author Name"
authorCredentials: "Author credentials"
category: "category-name"
readTime: "X min"
language: "hi"
keywords: ["keyword1", "keyword2", "keyword3"]
excerpt: "Brief excerpt (≤160 characters)"
---

## संक्षेप में:
[Direct answer to implied question in ≤60 words]

## Definition Block
[2-3 sentences defining what this article covers, who it's for, what they'll learn]

---

## मुख्य बातें
- [Key takeaway 1 with specific number]
- [Key takeaway 2]
- [Key takeaway 3]

---

[Main content with proper H2/H3 structure]

---

## Sources & References
- [Source 1 with URL]
- [Source 2 with URL]
- [Source 3 with URL]
```

---

*Document: CONTENT_CHECKLIST.md*
*Version: v1.0 | May 2026*
*Next Review: July 2026*
