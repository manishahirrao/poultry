# Hindi Copy Review Checklist — TASK-WEB-026
**Document Type:** Native Speaker Review Checklist  
**Version:** 1.0 · May 2026  
**Reviewer:** Native Hindi/Bhojpuri Speaker from Gorakhpur  
**Target:** All Hindi copy in `apps/web/app/(marketing)/i18n/hi.json`

---

## Review Instructions

This checklist is for a native Hindi/Bhojpuri speaker from the Gorakhpur farming community to review all Hindi copy in the PoultryPulse website. The goal is to ensure the copy uses the correct register, tone, and terminology that local farmers actually use.

**Review Process:**
1. Read each Hindi translation in context (compare with English version)
2. Check against the criteria below
3. Mark issues in the "Review Tracking" document
4. Provide suggested corrections
5. Sign off when all issues are resolved

---

## Section-by-Section Review Criteria

### 1. Language Register & Tone

**Criteria:** The Hindi should sound like a Gorakhpur farmer speaking, not formal textbook Hindi.

- [ ] **No "Shuddh Hindi"** - Avoid overly formal Sanskritized Hindi that farmers won't recognize
  - ❌ Bad: "पशु आहार" (formal)
  - ✅ Good: "चारा" (what farmers actually say)
  
- [ ] **Colloquial Register** - Use the everyday language of the Gorakhpur region
  - Include appropriate Hinglish (Hindi-English mix) where farmers use it
  - Use local idioms and expressions familiar to the community
  
- [ ] **Direct & Simple** - Short, direct sentences preferred
  - Farmers read on mobile in poor light conditions
  - Avoid complex sentence structures
  - One idea per sentence

### 2. Number Format

**Criteria:** All numbers must use Indian numbering format (lakhs, crores).

- [ ] **Indian Number System** - Use ₹1,00,000 format, not ₹100,000
  - ❌ Bad: "₹100,000"
  - ✅ Good: "₹1,00,000" or "₹1 लाख"
  
- [ ] **Lakh/Crore Notation** - Use lakh/crore where appropriate
  - 1 lakh = 1,00,000
  - 10 lakh = 10,00,000
  - 1 crore = 1,00,00,000
  
- [ ] **Consistent Formatting** - All monetary values should follow the same pattern

### 3. Agricultural Terminology

**Criteria:** Use the actual terms farmers use, not formal agricultural terms.

- [ ] **Feed Terms** - Use what farmers call feed
  - ❌ Bad: "पशु आहार" (formal)
  - ✅ Good: "चारा" (common term)
  
- [ ] **Bird Terms** - Use local terminology for poultry
  - Check if "मुर्गी" vs "पक्षी" vs "ब्रॉयलर" is appropriate
  - Use what farmers actually say in conversation
  
- [ ] **Disease Terms** - Use common names, not scientific names
  - HPAI: Is "HPAI" understood or should it be "बर्ड फ्लू"?
  - Use the term farmers recognize
  
- [ ] **Operations Terms** - Use everyday farming language
  - "बैच" vs "झुंड" - which is more common?
  - "बिक्री" vs "बेचना" - which sounds more natural?

### 4. Abbreviations & Technical Terms

**Criteria:** Only use abbreviations that farmers actually understand.

- [ ] **FCR (Feed Conversion Ratio)** - Is this understood?
  - If not, add explanation: "FCR (चारा रूपांतरण अनुपात)"
  - Or use simpler term if available
  
- [ ] **HPAI** - Is this understood?
  - Consider using "बर्ड फ्लू" if more recognizable
  - Or keep HPAI with explanation
  
- [ ] **Other Technical Terms** - Review all abbreviations:
  - MAPE - needs explanation?
  - P10/P50/P90 - needs simpler explanation?
  - DOC (Day Old Chick) - understood?
  
- [ ] **English Words in Hindi** - Keep Hinglish where natural
  - "WhatsApp" - keep as is (universally understood)
  - "app" - keep as is
  - "online" - keep as is
  - Remove English words where Hindi equivalent is more natural

### 5. Sentence Structure & Readability

**Criteria:** Sentences should be short and easy to read on mobile.

- [ ] **Sentence Length** - Maximum 15-20 words per sentence
  - Long sentences should be broken into 2-3 shorter ones
  - Use bullet points for lists instead of long sentences
  
- [ ] **Mobile-First Reading** - Consider poor light conditions
  - High contrast words (avoid subtle distinctions)
  - Clear, unambiguous language
  - No complex clauses
  
- [ ] **Active Voice** - Use active, direct language
  - ❌ Bad: "द्वारा किया जाता है" (passive)
  - ✅ Good: "करते हैं" (active)

---

## Page-by-Page Priority Review

### Priority 1: Farmer-Facing Pages (Most Critical)

These pages directly address S1 farmers (10K-50K birds) - the primary conversion target.

#### 1. Home Page (`home.*`)
- [ ] Hero headline: "₹30,000 ज़्यादा कमाएं हर बैच में।"
- [ ] Problem section cards (3 cards with Hindi quotes)
- [ ] Feature tab descriptions
- [ ] ROI calculator text
- [ ] Testimonials (Hindi quotes)

#### 2. Solutions/Commercial Farms Page
- [ ] Hero and all section text
- [ ] Pain points descriptions
- [ ] Feature highlights

#### 3. Login Page (`login.*`)
- [ ] All form labels and error messages
- [ ] OTP flow text
- [ ] DPDP notice (legal but must be understandable)

### Priority 2: Secondary Pages

#### 4. Accuracy Page (`accuracy.*`)
- [ ] Technical explanations (should be simplified for farmers)
- [ ] Methodology questions/answers
- [ ] Stress test descriptions

#### 5. Features Page (`features.*`)
- [ ] Feature descriptions
- [ ] Comparison table text

#### 6. Farm Intelligence Page (`farmIntelligence.*`)
- [ ] Narrative box text
- [ ] Feature section descriptions

### Priority 3: Tertiary Pages

#### 7. Compliance Page (`compliance.*`)
- [ ] FSSAI/HACCP terminology (may need to keep formal)
- [ ] Export roadmap text

#### 8. Blog Page (`blog.*`)
- [ ] Category names
- [ ] Post descriptions

---

## Specific Issues to Look For

### Common Problems to Flag

1. **Formal Sanskritized Hindi**
   - Words like "उपयोग" instead of "इस्तेमाल"
   - Words like "विधि" instead of "तरीका"
   
2. **Wrong Number Format**
   - Western format (100,000) instead of Indian (1,00,000)
   
3. **Unnatural Phrasing**
   - Direct English translations that don't sound natural in Hindi
   - Example: "price intelligence" → "मूल्य बुद्धि" (too formal)
   
4. **Missing Context**
   - Technical terms without explanation
   - Abbreviations without expansion
   
5. **Overly Long Sentences**
   - Sentences that are hard to follow on mobile
   - Complex nested clauses

---

## Review Output Format

For each issue found, provide:

1. **Location** - JSON path (e.g., `home.problemSection.cards[0].hindiQuote`)
2. **Current Text** - The current Hindi text
3. **Issue** - What's wrong (register, terminology, format, etc.)
4. **Suggested Fix** - Your recommended Hindi text
5. **Reason** - Why this change is needed

Example:
```
Location: home.problemSection.cards[0].hindiQuote
Current: "बेचते हैं भरोसे पर, और हर बार ₹2–4/kg का नुकसान होता है"
Issue: Too formal, doesn't sound like Gorakhpur farmer
Suggested: "भरोसे पर बेचते हैं, हर बार ₹2-4 का नुकसान हो जाता है"
Reason: More natural, colloquial register
```

---

## Final Sign-Off

After completing the review:

- [ ] All issues documented in Review Tracking document
- [ ] All suggested fixes provided
- [ ] hi.json updated with all approved changes
- [ ] Final review of updated hi.json
- [ ] Sign-off below completed

---

## Reviewer Sign-Off

**Reviewer Name:** _____________________________

**Date:** _____________________________

**Total Issues Found:** _________

**Total Issues Resolved:** _________

**Final Approval:** [ ] Approved [ ] Needs Revision

**Comments:**
___________________________________________________________________________
___________________________________________________________________________
___________________________________________________________________________

**Product Lead Sign-Off:**

**Name:** _____________________________

**Date:** _____________________________

**Approval:** [ ] Approved for merge to main
