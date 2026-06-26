# Hindi Copy Review Tracking — TASK-WEB-026
**Document Type:** Review Tracking Log  
**Version:** 1.0 · May 2026  
**File Being Reviewed:** `apps/web/app/(marketing)/i18n/hi.json`

---

## Technical Analysis Summary

### File Structure Status
- **File Path:** `apps/web/app/(marketing)/i18n/hi.json`
- **File Size:** 29,228 bytes
- **Total Keys:** ~150+ translation keys
- **Sections:** 8 main sections (home, accuracy, features, farmIntelligence, compliance, login, blog)
- **JSON Format:** ✅ Valid JSON
- **Structure:** ✅ Matches en.json structure

### Technical Issues Found
- ✅ No missing keys (all en.json keys have hi.json equivalents)
- ✅ No syntax errors
- ✅ Proper JSON formatting
- ⚠️ Some keys contain English text that should be translated (feature descriptions)
- ⚠️ Number format inconsistencies (some use Indian format, some use Western)

---

## Review Log

### Priority 1: Home Page (`home.*`)

#### Hero Section
| Location | Current Text | Issue | Suggested Fix | Status |
|----------|-------------|-------|---------------|--------|
| home.problemSection.title | "गोरखपुर के 80% किसान हर बैच में पैसे गंवाते हैं" | Pending review | | ⏳ |
| home.problemSection.subtitle | "तीन समस्याएं जो हर बैच में आपको हजारों का नुकसान देती हैं" | Pending review | | ⏳ |
| home.problemSection.cards[0].hindiQuote | "बेचते हैं भरोसे पर, और हर बार ₹2–4/kg का नुकसान होता है" | Pending review | | ⏳ |
| home.problemSection.cards[1].hindiQuote | "HPAI alert का पता लगता है जब ट्रांसपोर्ट पहले से बंद हो चुका होता है" | Pending review | | ⏳ |
| home.problemSection.cards[2].hindiQuote | "बिचौलिया ₹8 देता है जब लखनऊ में ₹10 है — आपको नहीं पता" | Pending review | | ⏳ |

#### Feature Grid
| Location | Current Text | Issue | Suggested Fix | Status |
|----------|-------------|-------|---------------|--------|
| home.featureGrid.title | "57 features — 6 intelligence modules में" | Mixed English/Hindi | "57 features — 6 intelligence modules में" | ⏳ |
| home.featureGrid.features[0].description | "7-day AI forecast with P10/P50/P90 confidence bands" | English only | Needs Hindi translation | ⚠️ |
| home.featureGrid.features[1].description | "Daily SELL NOW / HOLD / CAUTION with ₹ impact" | English only | Needs Hindi translation | ⚠️ |
| home.featureGrid.features[2].description | "Exact ₹ profit comparison: sell today vs wait N days" | English only | Needs Hindi translation | ⚠️ |
| home.featureGrid.features[3].description | "Is the trader's offer fair? Counter-offer in Hindi" | English only | Needs Hindi translation | ⚠️ |
| home.featureGrid.features[4].description | "Track feed efficiency, get daily allocation recommendations" | English only | Needs Hindi translation | ⚠️ |
| home.featureGrid.features[5].description | "Log daily deaths, detect abnormal patterns automatically" | English only | Needs Hindi translation | ⚠️ |
| home.featureGrid.features[6].description | "Auto-schedule UP broiler protocol, WhatsApp reminders" | English only | Needs Hindi translation | ⚠️ |
| home.featureGrid.features[7].description | "Fortnightly checklist with scoring and trend tracking" | English only | Needs Hindi translation | ⚠️ |
| home.featureGrid.features[8].description | "Real-time outbreak alerts personalised to your district" | English only | Needs Hindi translation | ⚠️ |
| home.featureGrid.features[9].description | "Connect weighing scales, water meters, environment sensors" | English only | Needs Hindi translation | ⚠️ |
| home.featureGrid.features[10].description | "One-click batch traceability PDF for compliance audits" | English only | Needs Hindi translation | ⚠️ |
| home.featureGrid.features[11].description | "Sync with Tally, Zoho, SAP — zero double-entry" | English only | Needs Hindi translation | ⚠️ |

#### Feature Tab Preview
| Location | Current Text | Issue | Suggested Fix | Status |
|----------|-------------|-------|---------------|--------|
| home.featureTabPreview.sectionTitle | "सब कुछ जो चाहिए। कुछ भी फालतू नहीं।" | Pending review | | ⏳ |
| home.featureTabPreview.tabs.priceIntelligence.label | "भाव बुद्धि" | Pending review | | ⏳ |
| home.featureTabPreview.tabs.priceIntelligence.headline | "95%+ सटीक। हर दिन।" | Pending review | | ⏳ |
| home.featureTabPreview.tabs.priceIntelligence.description | "हमारा AI मॉडल 45 signals से आने वाले 7 दिन का ब्रॉयलर भाव predict करता है — Gorakhpur मंडी के लिए, हर रात 06:00 बजे।" | Mixed English/Hindi | | ⏳ |
| home.featureTabPreview.tabs.sellSignal.label | "Sell Signal" | English only | Needs Hindi translation | ⚠️ |
| home.featureTabPreview.tabs.sellSignal.headline | "SELL, HOLD, या CAUTION। हर सुबह।" | Mixed English/Hindi | | ⏳ |
| home.featureTabPreview.tabs.farmOperations.label | "Farm Ops" | English only | Needs Hindi translation | ⚠️ |
| home.featureTabPreview.tabs.healthCompliance.label | "Health" | English only | Needs Hindi translation | ⚠️ |
| home.featureTabPreview.tabs.smartAlerts.label | "Alerts" | English only | Needs Hindi translation | ⚠️ |

---

### Priority 2: Accuracy Page (`accuracy.*`)

| Location | Current Text | Issue | Suggested Fix | Status |
|----------|-------------|-------|---------------|--------|
| accuracy.hero.title | "भारतीय कृषि-तकनीक में सबसे पारदर्शी AI" | Pending review | | ⏳ |
| accuracy.hero.subtitle | "हम अपनी सटीकता लाइव प्रकाशित करते हैं। हर दिन।" | Pending review | | ⏳ |
| accuracy.methodology.questions[0].question | "MAPE क्या है?" | Technical term | May need explanation | ⏳ |
| accuracy.methodology.questions[1].question | "दिशात्मक सटीकता क्या है?" | Formal term | May need simplification | ⏳ |
| accuracy.methodology.questions[3].answer | "champion/challenger फ्रेमवर्क" | English technical term | Needs Hindi explanation | ⚠️ |

---

### Priority 3: Features Page (`features.*`)

| Location | Current Text | Issue | Suggested Fix | Status |
|----------|-------------|-------|---------------|--------|
| features.hero.title | "सभी Features" | Mixed English/Hindi | "सभी Features" or "सभी विशेषताएं" | ⏳ |
| features.hero.subtitle | "57 features — 6 intelligence modules में" | Mixed English/Hindi | | ⏳ |

---

### Priority 4: Farm Intelligence Page (`farmIntelligence.*`)

| Location | Current Text | Issue | Suggested Fix | Status |
|----------|-------------|-------|---------------|--------|
| farmIntelligence.hero.title | "Price Intelligence से परे — पूरे Farm Operations एक Platform में" | Mixed English/Hindi | | ⏳ |
| farmIntelligence.narrativeBox.dataMoat | "Data Moat: आपके द्वारा लॉग किया गया हर operational data point" | English technical terms | Needs Hindi explanation | ⚠️ |
| farmIntelligence.narrativeBox.compoundIntelligence | "Compound Intelligence: पूर्ण operational data वाले farms" | English technical terms | Needs Hindi explanation | ⚠️ |

---

### Priority 5: Compliance Page (`compliance.*`)

| Location | Current Text | Issue | Suggested Fix | Status |
|----------|-------------|-------|---------------|--------|
| compliance.hero.title | "FSSAI-Ready। HACCP-Compliant। One Click।" | English acronyms | Keep (regulatory terms) | ✅ |
| compliance.haccpWorkflow.steps[0] | "hazard identification और risk assessment" | English technical terms | Keep (HACCP terminology) | ✅ |

---

### Priority 6: Login Page (`login.*`)

| Location | Current Text | Issue | Suggested Fix | Status |
|----------|-------------|-------|---------------|--------|
| login.title | "Login या Sign Up" | Mixed English/Hindi | | ⏳ |
| login.otpErrorHindi | "गलत OTP। फिर से कोशिश करें।" | Pending review | | ⏳ |
| login.dpdpNoticeHindi | "आपका डेटा भारत में सुरक्षित है (AWS Mumbai) · DPDP Act 2023 के अनुसार" | Legal notice | Keep formal | ✅ |

---

### Priority 7: Blog Page (`blog.*`)

| Location | Current Text | Issue | Suggested Fix | Status |
|----------|-------------|-------|---------------|--------|
| blog.hero.title | "पोल्ट्री फार्मिंग अंतर्दृष्टि" | Pending review | | ⏳ |
| blog.categories.bhavVichar | "भाव विचार" | Pending review | | ⏳ |
| blog.categories.khetiGyan | "खेती ज्ञान" | Pending review | | ⏳ |

---

## Summary Statistics

### Total Keys to Review: ~150
- **Priority 1 (Home Page):** ~30 keys
- **Priority 2 (Accuracy):** ~25 keys
- **Priority 3 (Features):** ~10 keys
- **Priority 4 (Farm Intelligence):** ~20 keys
- **Priority 5 (Compliance):** ~30 keys
- **Priority 6 (Login):** ~20 keys
- **Priority 7 (Blog):** ~15 keys

### Issues Identified by Type

| Issue Type | Count | Status |
|------------|-------|--------|
| English-only text (needs translation) | ~25 | ⚠️ High Priority |
| Mixed English/Hindi (may need adjustment) | ~15 | ⏳ Medium Priority |
| Technical terms without explanation | ~8 | ⏳ Medium Priority |
| Number format inconsistencies | ~5 | ⏳ Low Priority |
| Formal register (may need colloquial) | TBD | ⏳ Pending Review |
| Sentence length issues | TBD | ⏳ Pending Review |

---

## Reviewer Notes

### General Observations
1. **Feature Descriptions:** Many feature descriptions in `home.featureGrid.features` are still in English and need Hindi translations
2. **Tab Labels:** Some tab labels in feature preview are in English (Sell Signal, Farm Ops, Health, Alerts)
3. **Technical Terms:** Terms like "champion/challenger framework", "Data Moat", "Compound Intelligence" are in English and may need Hindi explanations
4. **Mixed Language:** Many strings mix English and Hindi naturally (Hinglish), which may be appropriate for the target audience

### Recommendations for Reviewer
1. Focus first on Priority 1 (Home Page) - this is the primary conversion page
2. Review all English-only text and determine if Hindi translation is needed
3. Check if technical terms need Hindi explanations or if English is acceptable
4. Verify that mixed English/Hindi (Hinglish) sounds natural to Gorakhpur farmers
5. Pay special attention to the Hindi quotes in problem section - these should sound authentic

---

## Approval Checklist

### Pre-Approval Requirements
- [ ] All Priority 1 (Home Page) keys reviewed
- [ ] All English-only text addressed (translated or justified)
- [ ] All technical terms have appropriate explanations
- [ ] Number format standardized to Indian format
- [ ] All suggested fixes implemented in hi.json
- [ ] Final review of updated hi.json completed

### Final Approval
- [ ] Reviewer sign-off completed
- [ ] Product lead sign-off completed
- [ ] hi.json ready for merge to main branch

---

## Change Log

| Date | Action | By |
|------|--------|-----|
| 2026-05-30 | Initial review tracking document created | System |
| | | |
| | | |
