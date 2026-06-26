# Hindi Copy Priority Sections — TASK-WEB-026
**Document Type:** Priority Section Identification  
**Version:** 1.0 · May 2026  
**Purpose:** Identify sections requiring special attention from native speaker reviewer

---

## Critical Priority: Farmer-Facing Copy (Conversion-Critical)

These sections directly address S1 farmers (10K-50K birds) - the primary conversion target. These MUST be reviewed first as they directly impact conversion rates.

### 1. Home Page Hero Section
**Path:** `home.problemSection.*`

**Why Critical:** This is the first thing farmers see when they arrive from WhatsApp links. The Hindi quotes must sound authentic and relatable.

**Keys to Review:**
- `home.problemSection.title` - "गोरखपुर के 80% किसान हर बैच में पैसे गंवाते हैं"
- `home.problemSection.subtitle` - "तीन समस्याएं जो हर बैच में आपको हजारों का नुकसान देती हैं"
- `home.problemSection.cards[0].hindiQuote` - "बेचते हैं भरोसे पर, और हर बार ₹2–4/kg का नुकसान होता है"
- `home.problemSection.cards[1].hindiQuote` - "HPAI alert का पता लगता है जब ट्रांसपोर्ट पहले से बंद हो चुका होता है"
- `home.problemSection.cards[2].hindiQuote` - "बिचौलिया ₹8 देता है जब लखनऊ में ₹10 है — आपको नहीं पता"

**Review Focus:**
- Do these quotes sound like something a Gorakhpur farmer would actually say?
- Are the pain points expressed in language farmers use?
- Is the emotional tone appropriate (not too formal, not too casual)?

---

### 2. Feature Tab Preview - Tab Labels
**Path:** `home.featureTabPreview.tabs.*.label`

**Why Critical:** These are the main navigation elements within the home page. Farmers need to understand what each tab represents instantly.

**Keys to Review:**
- `home.featureTabPreview.tabs.priceIntelligence.label` - "भाव बुद्धि"
- `home.featureTabPreview.tabs.sellSignal.label` - "Sell Signal" (currently English)
- `home.featureTabPreview.tabs.farmOperations.label` - "Farm Ops" (currently English)
- `home.featureTabPreview.tabs.healthCompliance.label` - "Health" (currently English)
- `home.featureTabPreview.tabs.smartAlerts.label` - "Alerts" (currently English)

**Review Focus:**
- Should these be translated to Hindi or kept in English?
- If translated, what are the appropriate Hindi terms?
- "भाव बुद्धि" - is this too formal? Would "भाव जानकारी" be better?
- For English labels: Do farmers understand these terms, or should they be Hindi?

---

### 3. Feature Descriptions
**Path:** `home.featureGrid.features[*].description`

**Why Critical:** These are the 12 core features that farmers need to understand to see value in the product.

**Keys to Review:**
All 12 feature descriptions are currently in English and need Hindi translations:
- `home.featureGrid.features[0].description` - "7-day AI forecast with P10/P50/P90 confidence bands"
- `home.featureGrid.features[1].description` - "Daily SELL NOW / HOLD / CAUTION with ₹ impact"
- `home.featureGrid.features[2].description` - "Exact ₹ profit comparison: sell today vs wait N days"
- `home.featureGrid.features[3].description` - "Is the trader's offer fair? Counter-offer in Hindi"
- `home.featureGrid.features[4].description` - "Track feed efficiency, get daily allocation recommendations"
- `home.featureGrid.features[5].description` - "Log daily deaths, detect abnormal patterns automatically"
- `home.featureGrid.features[6].description` - "Auto-schedule UP broiler protocol, WhatsApp reminders"
- `home.featureGrid.features[7].description` - "Fortnightly checklist with scoring and trend tracking"
- `home.featureGrid.features[8].description` - "Real-time outbreak alerts personalised to your district"
- `home.featureGrid.features[9].description` - "Connect weighing scales, water meters, environment sensors"
- `home.featureGrid.features[10].description` - "One-click batch traceability PDF for compliance audits"
- `home.featureGrid.features[11].description` - "Sync with Tally, Zoho, SAP — zero double-entry"

**Review Focus:**
- Translate each description to simple, clear Hindi
- Keep technical terms (P10/P50/P90, FCR, HPAI) but explain them if needed
- Focus on benefit language, not feature language
- Use short sentences suitable for mobile reading

---

### 4. Login Page - User-Facing Copy
**Path:** `login.*`

**Why Critical:** This is where farmers convert to users. Error messages and instructions must be crystal clear.

**Keys to Review:**
- `login.title` - "Login या Sign Up"
- `login.subtitle` - "शुरू करने के लिए अपना WhatsApp number डालें"
- `login.otpErrorHindi` - "गलत OTP। फिर से कोशिश करें।"
- `login.otpAttemptsExceeded` - "अधिकतम प्रयास पूरे हो गए। कृपया बाद में try करें।"

**Review Focus:**
- Are error messages clear and actionable?
- Is the tone helpful, not frustrating?
- Do farmers understand what "OTP" means?
- Should "Login" and "Sign Up" be translated or kept in English?

---

## High Priority: Secondary Farmer-Facing Pages

### 5. Accuracy Page - Technical Explanations
**Path:** `accuracy.methodology.questions[*]`

**Why Important:** Farmers need to trust the accuracy claims, but the explanations must be in language they understand.

**Keys to Review:**
- `accuracy.methodology.questions[0].question` - "MAPE क्या है?"
- `accuracy.methodology.questions[0].answer` - Explanation of MAPE
- `accuracy.methodology.questions[1].question` - "दिशात्मक सटीकता क्या है?"
- `accuracy.methodology.questions[1].answer` - Explanation of directional accuracy
- `accuracy.methodology.questions[3].answer` - Contains "champion/challenger फ्रेमवर्क" (English technical term)

**Review Focus:**
- Are the explanations simple enough for a non-technical farmer?
- Should "MAPE" be kept as is or explained with a simpler term?
- "दिशात्मक सटीकता" - is this too formal? Would "सही दिशा" be better?
- "champion/challenger framework" - needs Hindi explanation or removal

---

### 6. Farm Intelligence Page - Narrative Box
**Path:** `farmIntelligence.narrativeBox.*`

**Why Important:** This explains the value proposition of combining operations data with price intelligence.

**Keys to Review:**
- `farmIntelligence.narrativeBox.dataMoat` - Contains "Data Moat", "operational data point" (English)
- `farmIntelligence.narrativeBox.compoundIntelligence` - Contains "Compound Intelligence", "operational data" (English)
- `farmIntelligence.narrativeBox.precisionEngine` - Contains "Precision Decision Engine" (English)

**Review Focus:**
- These are English technical/marketing terms - should they be translated?
- If translated, what are appropriate Hindi equivalents?
- Or should they be kept in English with Hindi explanations?

---

## Medium Priority: B2B/Enterprise Pages

### 7. Compliance Page - Regulatory Terms
**Path:** `compliance.*`

**Why Important:** This page targets integrators and processors who may expect formal terminology.

**Keys to Review:**
- `compliance.hero.title` - "FSSAI-Ready। HACCP-Compliant। One Click।"
- `compliance.haccpWorkflow.steps[*]` - Contains English HACCP terminology

**Review Focus:**
- FSSAI, HACCP are regulatory acronyms - should be kept as is
- These are B2B terms, so formal language may be appropriate
- Verify that the Hindi explanations are accurate

---

## Low Priority: Navigation & UI Elements

### 8. Navigation Labels
**Path:** Various navigation labels throughout

**Why Less Critical:** These are UI elements that farmers will learn through use.

**Keys to Review:**
- Page titles, section headers, button labels
- Category names in blog

**Review Focus:**
- Consistency in terminology
- Clarity and brevity

---

## Special Attention: Number Format

### Indian Number System Check

**Requirement:** All monetary values must use Indian numbering format (lakhs, crores).

**Current State Analysis:**
- ✅ Some values use Indian format: "₹1L–5L", "₹2L"
- ⚠️ Some values use Western format: "₹30K–80K" (should be "₹30,000–80,000" or "₹30 हजार–80 हजार")
- ⚠️ Inconsistent usage of "K" vs "हजार"

**Keys to Review:**
- `home.problemSection.cards[0].financialValue` - "₹30K–80K/बैच" → Should be "₹30,000–80,000/बैच" or "₹30 हजार–80 हजार/बैच"
- `home.problemSection.cards[1].financialValue` - "₹1L–5L कुल नुकसान का जोखिम" → Good, uses lakh format
- `home.problemSection.cards[2].financialValue` - "₹2L प्रति बैच" → Good, uses lakh format

**Recommendation:** Standardize to use full Indian format with Hindi words (हजार, लाख) for farmer-facing copy.

---

## Special Attention: Technical Terms

### Terms That Need Explanation

**FCR (Feed Conversion Ratio)**
- Current: Used without explanation in feature descriptions
- Question: Do Gorakhpur farmers understand "FCR"?
- Recommendation: Add explanation or use simpler term if available

**HPAI**
- Current: Used in problem section and alerts
- Question: Is "HPAI" understood or should it be "बर्ड फ्लू"?
- Recommendation: Use "HPAI (बर्ड फ्लू)" initially, then "HPAI" thereafter

**P10/P50/P90**
- Current: Used in price forecast descriptions
- Question: Is this too technical?
- Recommendation: Keep but add simple explanation: "P10/P50/P90 (न्यूनतम/संभावित/अधिकतम भाव)"

**MAPE**
- Current: Used in accuracy page with explanation
- Question: Is the explanation clear enough?
- Recommendation: Review the Hindi explanation for clarity

---

## Review Order Recommendation

### Phase 1: Critical Conversion Copy (Day 1)
1. Home page problem section quotes (3 cards)
2. Feature tab labels (5 tabs)
3. Login page error messages
4. Number format standardization

### Phase 2: Feature Descriptions (Day 1-2)
5. All 12 feature descriptions in feature grid
6. Feature tab descriptions (5 tabs)

### Phase 3: Technical Explanations (Day 2)
7. Accuracy page methodology questions
8. Farm intelligence narrative box
9. Technical term explanations

### Phase 4: Secondary Pages (Day 2)
10. Compliance page
11. Features page
12. Blog page

---

## Output Format for Reviewer

For each section reviewed, provide:

1. **Section Name** - e.g., "Home Page Problem Section"
2. **Keys Reviewed** - List of JSON paths
3. **Issues Found** - Number and type of issues
4. **Specific Changes** - Table with current text → suggested text
5. **Rationale** - Why changes are needed
6. **Priority** - Critical/High/Medium/Low

---

## Next Steps

1. Reviewer uses this document to prioritize review work
2. Reviewer completes review following the order above
3. Reviewer documents all findings in "Hindi_Copy_Review_Tracking.md"
4. Reviewer provides suggested fixes for all issues
5. Development team implements approved changes
6. Reviewer performs final review of updated hi.json
7. Final sign-off completed
