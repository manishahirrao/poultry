# Hindi Copy Implementation Guide — TASK-WEB-026
**Document Type:** Native Speaker Implementation Guide  
**Version:** 1.0 · May 2026  
**Target File:** `apps/web/app/(marketing)/i18n/hi.json`  
**Reference File:** `apps/web/app/(marketing)/i18n/en.json`

---

## Overview

This guide provides a complete list of all keys in `hi.json` that require Hindi translation or review by a native Hindi/Bhojpuri speaker from Gorakhpur. Each entry includes:
- **JSON Path** - Location in the file
- **Current Hindi Text** - What's currently in hi.json
- **English Reference** - The original English text from en.json
- **Action Required** - What needs to be done

---

## Priority 1: Feature Descriptions (English-Only Text)

These 12 feature descriptions in `home.featureGrid.features` are currently in English and need Hindi translation.

### 1. Price Forecast
- **JSON Path:** `home.featureGrid.features[0].description`
- **Current Hindi:** `7-day AI forecast with P10/P50/P90 confidence bands`
- **English Reference:** `7-day AI forecast with P10/P50/P90 confidence bands`
- **Action Required:** Translate to Hindi. Keep technical terms like P10/P50/P90 as-is.

### 2. Sell Signal
- **JSON Path:** `home.featureGrid.features[1].description`
- **Current Hindi:** `Daily SELL NOW / HOLD / CAUTION with ₹ impact`
- **English Reference:** `Daily SELL NOW / HOLD / CAUTION with ₹ impact`
- **Action Required:** Translate to Hindi. Keep SELL NOW / HOLD / CAUTION in English (these are signal labels).

### 3. Batch ROI Optimizer
- **JSON Path:** `home.featureGrid.features[2].description`
- **Current Hindi:** `Exact ₹ profit comparison: sell today vs wait N days`
- **English Reference:** `Exact ₹ profit comparison: sell today vs wait N days`
- **Action Required:** Translate to Hindi.

### 4. Middleman Check
- **JSON Path:** `home.featureGrid.features[3].description`
- **Current Hindi:** `Is the trader's offer fair? Counter-offer in Hindi`
- **English Reference:** `Is the trader's offer fair? Counter-offer in Hindi`
- **Action Required:** Translate to Hindi. Note: "Counter-offer in Hindi" means the app provides Hindi counter-offers.

### 5. FCR Analytics
- **JSON Path:** `home.featureGrid.features[4].description`
- **Current Hindi:** `Track feed efficiency, get daily allocation recommendations`
- **English Reference:** `Track feed efficiency, get daily allocation recommendations`
- **Action Required:** Translate to Hindi. Use "चारा" for feed (not formal "पशु आहार").

### 6. Mortality Tracking
- **JSON Path:** `home.featureGrid.features[5].description`
- **Current Hindi:** `Log daily deaths, detect abnormal patterns automatically`
- **English Reference:** `Log daily deaths, detect abnormal patterns automatically`
- **Action Required:** Translate to Hindi. Use appropriate term for "deaths" in poultry context.

### 7. Vaccination Scheduler
- **JSON Path:** `home.featureGrid.features[6].description`
- **Current Hindi:** `Auto-schedule UP broiler protocol, WhatsApp reminders`
- **English Reference:** `Auto-schedule UP broiler protocol, WhatsApp reminders`
- **Action Required:** Translate to Hindi. Keep "WhatsApp" as-is.

### 8. Biosecurity Audit
- **JSON Path:** `home.featureGrid.features[7].description`
- **Current Hindi:** `Fortnightly checklist with scoring and trend tracking`
- **English Reference:** `Fortnightly checklist with scoring and trend tracking`
- **Action Required:** Translate to Hindi. "Fortnightly" = every 15 days.

### 9. HPAI + Disease Alerts
- **JSON Path:** `home.featureGrid.features[8].description`
- **Current Hindi:** `Real-time outbreak alerts personalised to your district`
- **English Reference:** `Real-time outbreak alerts personalised to your district`
- **Action Required:** Translate to Hindi. Consider if "HPAI" should be "बर्ड फ्लू" or kept as HPAI.

### 10. IoT Integration
- **JSON Path:** `home.featureGrid.features[9].description`
- **Current Hindi:** `Connect weighing scales, water meters, environment sensors`
- **English Reference:** `Connect weighing scales, water meters, environment sensors`
- **Action Required:** Translate to Hindi. Use simple terms farmers understand.

### 11. FSSAI Traceability
- **JSON Path:** `home.featureGrid.features[10].description`
- **Current Hindi:** `One-click batch traceability PDF for compliance audits`
- **English Reference:** `One-click batch traceability PDF for compliance audits`
- **Action Required:** Translate to Hindi. Keep "FSSAI" and "PDF" as-is.

### 12. ERP Integration
- **JSON Path:** `home.featureGrid.features[11].description`
- **Current Hindi:** `Sync with Tally, Zoho, SAP — zero double-entry`
- **English Reference:** `Sync with Tally, Zoho, SAP — zero double-entry`
- **Action Required:** Translate to Hindi. Keep software names (Tally, Zoho, SAP) as-is.

---

## Priority 2: Tab Labels (English-Only)

These 4 tab labels in `home.featureTabPreview.tabs` are in English and need Hindi translation.

### 1. Sell Signal Tab
- **JSON Path:** `home.featureTabPreview.tabs.sellSignal.label`
- **Current Hindi:** `Sell Signal`
- **English Reference:** `Sell Signal`
- **Action Required:** Translate to Hindi. Consider: "बेचने का संकेत" or "सेल सिग्नल" (Hinglish).

### 2. Farm Ops Tab
- **JSON Path:** `home.featureTabPreview.tabs.farmOperations.label`
- **Current Hindi:** `Farm Ops`
- **English Reference:** `Farm Ops`
- **Action Required:** Translate to Hindi. Consider: "फार्म ऑपरेशन" or "फार्म काम" (more colloquial).

### 3. Health Tab
- **JSON Path:** `home.featureTabPreview.tabs.healthCompliance.label`
- **Current Hindi:** `Health`
- **English Reference:** `Health`
- **Action Required:** Translate to Hindi. Consider: "स्वास्थ्य" or "हेल्थ" (Hinglish).

### 4. Alerts Tab
- **JSON Path:** `home.featureTabPreview.tabs.smartAlerts.label`
- **Current Hindi:** `Alerts`
- **English Reference:** `Alerts`
- **Action Required:** Translate to Hindi. Consider: "अलर्ट" (Hinglish) or "सूचनाएं".

---

## Priority 3: Technical Terms (Need Hindi Explanation)

These technical terms are in English and may need Hindi explanations or simpler alternatives.

### 1. Champion/Challenger Framework
- **JSON Path:** `accuracy.methodology.questions[3].answer`
- **Current Hindi:** `मॉडल साप्ताहिक champion/challenger फ्रेमवर्क के साथ retrain होता है।`
- **English Reference:** `The model retrains weekly with a champion/challenger framework.`
- **Action Required:** Either:
  - Keep as-is if farmers understand "champion/challenger"
  - Add Hindi explanation: "champion/challenger फ्रेमवर्क (बेहतर मॉडल चुनने की प्रक्रिया)"
  - Simplify to: "हर हफ्ते बेहतर मॉडल को चुनते हैं"

### 2. Data Moat
- **JSON Path:** `farmIntelligence.narrativeBox.dataMoat`
- **Current Hindi:** `Data Moat: आपके द्वारा लॉग किया गया हर operational data point — FCR, mortality, weight gain, feed costs — आपके specific farm के लिए हमारे price prediction model को मजबूत करता है।`
- **English Reference:** `The Data Moat: Every operational data point you log — FCR, mortality, weight gain, feed costs — strengthens our price prediction model for your specific farm.`
- **Action Required:** Either:
  - Keep "Data Moat" as-is (technical term)
  - Add Hindi explanation: "Data Moat (डेटा सुरक्षा कवच)"
  - Simplify the concept in Hindi

### 3. Compound Intelligence
- **JSON Path:** `farmIntelligence.narrativeBox.compoundIntelligence`
- **Current Hindi:** `Compound Intelligence: पूर्ण operational data वाले farms 12–18% अधिक price prediction accuracy देखते हैं क्योंकि model आपके farm की unique patterns सीखता है।`
- **English Reference:** `Compound Intelligence: Farms with complete operational data see 12–18% higher price prediction accuracy because the model learns your farm's unique patterns.`
- **Action Required:** Either:
  - Keep "Compound Intelligence" as-is (technical term)
  - Add Hindi explanation: "Compound Intelligence (संयुक्त बुद्धिमत्ता)"
  - Simplify to: "ज्यादा डेटा = बेहतर भविष्यवाणी"

---

## Priority 4: Mixed Language Review

These entries mix English and Hindi. Review if the mix sounds natural for Gorakhpur farmers.

### 1. Feature Grid Title
- **JSON Path:** `home.featureGrid.title`
- **Current Hindi:** `57 features — 6 intelligence modules में`
- **English Reference:** `57 features across 6 intelligence modules`
- **Action Required:** Review if "features" and "intelligence modules" should be in Hindi or kept as Hinglish.

### 2. Features Page Title
- **JSON Path:** `features.hero.title`
- **Current Hindi:** `सभी Features`
- **English Reference:** `All Features`
- **Action Required:** Consider: "सभी Features" vs "सभी विशेषताएं" (more formal) vs "सभी फीचर्स" (Hinglish).

### 3. Farm Intelligence Title
- **JSON Path:** `farmIntelligence.hero.title`
- **Current Hindi:** `Price Intelligence से परे — पूरे Farm Operations एक Platform में`
- **English Reference:** `Beyond Price Intelligence — Complete Farm Operations in One Platform`
- **Action Required:** Review if the English terms should be translated or kept as Hinglish.

---

## Priority 5: Number Format Standardization

Review number formats for consistency. Current usage is mixed between Indian notation (L for lakh, K for thousand) and Western format.

### Current Number Formats in hi.json:
- Line 12: `₹30K–80K/बैच` (K notation)
- Line 19: `₹1L–5L` (L notation)
- Line 26: `₹2L` (L notation)
- Line 266: `₹2,000–5,000/माह` (Indian comma format)
- Line 278: `Custom pricing` (English)

### Action Required:
1. **Standardize to Indian notation:**
   - Use `₹1L` for 1 lakh (1,00,000)
   - Use `₹30K` for 30 thousand (30,000)
   - Use `₹2,000` for smaller amounts (with Indian comma placement)
   
2. **Recommendation:** Keep current format as it's already using appropriate Indian notation (K/L for large amounts, commas for smaller amounts). No changes needed.

---

## Implementation Instructions

### Step 1: Make a Backup
Before editing, create a backup of `hi.json`:
```bash
cp apps/web/app/(marketing)/i18n/hi.json apps/web/app/(marketing)/i18n/hi.json.backup
```

### Step 2: Edit hi.json
Open `apps/web/app/(marketing)/i18n/hi.json` and make the following changes:

1. **Translate Priority 1 items** (12 feature descriptions)
2. **Translate Priority 2 items** (4 tab labels)
3. **Review and adjust Priority 3 items** (3 technical terms)
4. **Review Priority 4 items** (mixed language - adjust if needed)
5. **Verify Priority 5** (number formats - likely no changes needed)

### Step 3: Validate JSON
After editing, validate that the JSON is still valid:
```bash
# Use any JSON validator or:
node -e "console.log(JSON.stringify(JSON.parse(require('fs').readFileSync('apps/web/app/(marketing)/i18n/hi.json', 'utf8'))))"
```

### Step 4: Test in Application
1. Start the development server
2. Navigate to the website
3. Switch language to Hindi
4. Verify all translated text displays correctly
5. Check for any truncation or layout issues

### Step 5: Update Review Tracking
After completing translations, update `Hindi_Copy_Review_Tracking.md`:
- Change status from `⏳` or `⚠️` to `✅` for completed items
- Add notes on any decisions made (e.g., kept technical term in English)
- Update the change log with date and your name

---

## Translation Guidelines

### Language Register
- Use colloquial Hindi that Gorakhpur farmers actually speak
- Avoid formal Sanskritized Hindi (e.g., use "चारा" not "पशु आहार")
- Include appropriate Hinglish where farmers use it naturally
- Keep sentences short and direct (15-20 words max)

### Technical Terms
- Keep universal terms in English: WhatsApp, app, online, PDF, FSSAI, HACCP
- Keep software names: Tally, Zoho, SAP
- Consider if technical abbreviations need explanation: FCR, HPAI, MAPE, P10/P50/P90
- Use local terminology for farming concepts

### Number Format
- Use Indian number system: ₹1,00,000 (not ₹100,000)
- Use lakh/crore notation where appropriate: ₹1L, ₹10L, ₹1Cr
- Keep consistent formatting throughout

### Agricultural Terminology
- Feed: "चारा" (not "पशु आहार")
- Birds: Use what farmers actually say (check if "मुर्गी", "पक्षी", or "ब्रॉयलर")
- Batch: "बैच" (commonly used)
- Disease: Use common names (consider "बर्ड फ्लू" vs HPAI)

---

## Sign-Off

After completing all translations:

### Reviewer Sign-Off
- [ ] All Priority 1 items translated
- [ ] All Priority 2 items translated
- [ ] All Priority 3 items reviewed and adjusted
- [ ] All Priority 4 items reviewed
- [ ] Number formats verified
- [ ] JSON validated
- [ ] Tested in application
- [ ] Review tracking document updated

**Reviewer Name:** _____________________________  
**Date:** _____________________________  
**Total Changes Made:** _________  

### Product Lead Sign-Off
**Name:** _____________________________  
**Date:** _____________________________  
**Approval:** [ ] Approved for merge to main

---

## Questions or Issues?

If you encounter any issues during implementation:
1. Check the Hindi_Copy_Review_Checklist.md for detailed criteria
2. Refer to Hindi_Copy_Review_Tracking.md for the full audit log
3. Contact the product lead for clarification on technical terms
