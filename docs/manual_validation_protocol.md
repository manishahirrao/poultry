# PoultryPulse AI — Manual Ground-Truth Validation Protocol
## 30+ Consecutive Daily Predictions Validation

**Protocol Version:** 1.0
**Purpose:** Physical mandi validation of model predictions before commercial launch
**Authority:** PRD §6.2, Architecture v1.0 §8 (Week 16)
**Status:** NON-NEGOTIABLE — Must complete before any customer onboarding

---

## 1. Protocol Overview

Per PRD §6.2 and Architecture v1.0 §8 (Week 16), the founding team must manually validate **30+ consecutive daily predictions** by physically visiting Gorakhpur mandis and comparing model forecasts to actual mandi prices.

**NON-NEGOTIABLE REQUIREMENT:**
- **Minimum Duration:** 30 consecutive calendar days
- **Validation Method:** Physical mandi visits + phone calls to 3 traders per mandi
- **Validation Team:** CTO / Data Head (or designated senior engineer)
- **Mandi Coverage:** Gorakhpur APMC (primary) + Deoria, Kushinagar, Basti (rotating)
- **Pass Criteria:** Directional accuracy >90% on manual validation

**BLOCKER:** No customer onboarding, no subscription activation, no press/investor communication until manual validation is complete and passes.

---

## 2. Validation Team & Responsibilities

### 2.1 Required Personnel

| Role | Name | Responsibilities |
|------|------|-----------------|
| **Primary Validator** | [CTO / Data Head Name] | Daily mandi visits, data collection, log completion |
| **Secondary Validator** | [Senior Engineer Name] | Backup validator, cross-check on random days |
| **Mandi Contact Network** | [Local Contact Name] | Trader relationships, price verification network |

### 2.2 Validator Qualifications

- Deep understanding of Gorakhpur poultry market dynamics
- Fluent in Hindi (local dialect preferred)
- Established relationships with mandi traders
- Access to reliable transportation for daily visits
- Technical understanding of model outputs (P10/P50/P90, sell signals)

---

## 3. Validation Timeline

### 3.1 Pre-Validation Preparation (Week 15)

**Day -7 to Day -1:**

- [ ] Establish trader contact network at each target mandi
- [ ] Create WhatsApp group with 3-5 traders per mandi for price verification
- [ ] Print manual validation log templates (physical copies)
- [ ] Set up digital backup system (Google Sheets + local PDF backup)
- [ ] Calibrate with CTO: understand model outputs, confidence intervals, sell signals
- [ ] Test data collection workflow on 2 trial days
- [ ] Confirm transportation logistics (vehicle, fuel, backup plan)

### 3.2 Validation Period (30 Consecutive Days)

**Day 1 to Day 30:**

- [ ] Daily mandi visit (Gorakhpur APMC: every day; other mandis: rotating)
- [ ] Collect prices from 3 traders per mandi
- [ ] Record model forecast from PoultryPulse AI app/dashboard
- [ ] Calculate directional match and MAPE
- [ ] Document observations, market conditions, anomalies
- [ ] Submit daily log by 8:00 PM IST
- [ ] Weekly review with CTO (every Sunday)

### 3.3 Post-Validation (Week 16)

**Day 31 to Day 35:**

- [ ] Compile 30-day validation summary
- [ ] Calculate overall directional accuracy and MAPE
- [ ] Identify any systematic prediction errors
- [ ] Document learnings and model improvement recommendations
- [ ] Sign-off by CTO and CEO
- [ ] Update accuracy_validation_report.md with results

---

## 4. Daily Validation Procedure

### 4.1 Morning Routine (6:00 AM – 7:30 AM IST)

**Step 1: Capture Model Forecast (6:00 AM)**

1. Open PoultryPulse AI mobile app or web dashboard
2. Navigate to forecast screen for target mandi
3. Record:
   - P10 price (₹/kg)
   - P50 price (₹/kg)
   - P90 price (₹/kg)
   - Sell signal (SELL_NOW / HOLD / SELL_SOON)
   - Confidence percentage
   - Top 3 price drivers
4. Take screenshot of forecast screen (for audit trail)
5. Log in validation template (digital + physical)

**Step 2: Travel to Mandi (6:30 AM – 7:00 AM IST)**

1. Depart for Gorakhpur APMC (or designated mandi)
2. Arrive by 7:00 AM (before peak trading hours)
3. Carry validation log template, smartphone, notebook

### 4.2 Mandi Data Collection (7:00 AM – 8:30 AM IST)

**Step 3: Trader Price Collection (7:00 AM – 8:00 AM IST)**

For each of 3 traders at the mandi:

1. **Trader Selection Criteria:**
   - Trader 1: Large volume dealer (handles 10K+ birds/day)
   - Trader 2: Medium volume dealer (5K–10K birds/day)
   - Trader 3: Small volume dealer (1K–5K birds/day)
   
2. **Data Collection per Trader:**
   - Ask: "आज का भाव क्या है?" (What is today's price?)
   - Record quoted price (₹/kg)
   - Ask: "कल से कितना बदलाव है?" (How much change from yesterday?)
   - Record trader's perception of market direction
   - Note any unusual market conditions (supply shortage, excess supply, HPAI rumors, etc.)
   - Thank trader for information

3. **Price Verification:**
   - Cross-check with AGMARKNET app (if available)
   - Cross-check with other traders informally
   - Note any significant discrepancies (>₹2/kg between traders)

**Step 4: Market Observation (8:00 AM – 8:30 AM IST)**

1. **Supply Assessment:**
   - Estimate bird arrival volume (low/medium/high)
   - Note bird quality indicators (size, health)
   - Observe transport vehicle activity (number of trucks)
   
2. **Demand Assessment:**
   - Count active buyers (traders, integrators, direct purchasers)
   - Note buyer urgency (quick purchases vs. negotiation)
   - Observe loading activity (trucks being loaded)
   
3. **External Factors:**
   - Weather conditions (rain, heat wave affecting transport)
   - Festival calendar (is today near a major festival?)
   - Disease rumors (any HPAI concerns in the market?)
   - Feed price chatter (are traders discussing maize/soya costs?)

### 4.3 Evening Analysis (8:30 PM – 9:00 PM IST)

**Step 5: Data Entry & Analysis**

1. **Enter Data into Validation Log:**
   - Model forecast values (from morning screenshot)
   - Trader 1, 2, 3 prices
   - Average mandi price (mean of 3 traders)
   - Market observations
   
2. **Calculate Metrics:**
   - **Directional Match:**
     - Did model predict rise or fall correctly?
     - Compare: sign(model_p50_today - model_p50_yesterday) vs sign(actual_today - actual_yesterday)
     - Mark ✓ or ✗
   
   - **MAPE Calculation:**
     - MAPE = |actual_price - model_p50| / actual_price × 100
     - Example: Model = ₹162, Actual = ₹165 → MAPE = |165-162|/165 × 100 = 1.82%
   
   - **Confidence Interval Check:**
     - Is actual_price within [P10, P90] range?
     - Mark Yes/No

3. **Document Observations:**
   - Any anomalies (price spikes, crashes)
   - Trader comments on market conditions
   - Model performance notes (over/under prediction patterns)

4. **Submit Daily Log:**
   - Upload to Google Sheets (shared with CTO)
   - Email PDF backup to validation team
   - Archive screenshot in organized folder (date-named)

---

## 5. Validation Log Template

### 5.1 Digital Template (Google Sheets)

**Columns:**
- Date
- Mandi
- Model P10 (₹/kg)
- Model P50 (₹/kg)
- Model P90 (₹/kg)
- Model Signal
- Model Confidence (%)
- Trader 1 Price (₹/kg)
- Trader 2 Price (₹/kg)
- Trader 3 Price (₹/kg)
- Average Actual Price (₹/kg)
- Directional Match (✓/✗)
- MAPE (%)
- Within Confidence Interval (Yes/No)
- Supply Volume (Low/Medium/High)
- Demand Level (Low/Medium/High)
- Weather Conditions
- External Factors (Festival, Disease, Feed Price)
- Notes/Observations
- Validator Signature
- Screenshot File Path

### 5.2 Physical Template (Printable)

```markdown
## Daily Validation Log

**Date:** _______________
**Mandi:** _______________
**Validator:** _______________

### Model Forecast (6:00 AM)
- **P10:** ₹_____/kg
- **P50:** ₹_____/kg
- **P90:** ₹_____/kg
- **Signal:** [ ] SELL_NOW  [ ] HOLD  [ ] SELL_SOON
- **Confidence:** ____%

### Trader Prices (7:00–8:00 AM)
- **Trader 1:** ₹_____/kg  (Volume: _____ birds/day)
- **Trader 2:** ₹_____/kg  (Volume: _____ birds/day)
- **Trader 3:** ₹_____/kg  (Volume: _____ birds/day)
- **Average:** ₹_____/kg

### Comparison
- **Directional Match:** [ ] ✓  [ ] ✗
- **MAPE:** ____%
- **Within P10-P90:** [ ] Yes  [ ] No

### Market Conditions
- **Supply Volume:** [ ] Low  [ ] Medium  [ ] High
- **Demand Level:** [ ] Low  [ ] Medium  [ ] High
- **Weather:** _______________
- **External Factors:** _______________

### Notes
_________________________________________________________________________
_________________________________________________________________________
_________________________________________________________________________

### Validator Sign-Off
**Signature:** ___________________
**Time:** _____:_____ AM/PM
```

---

## 6. Quality Control & Audit Trail

### 6.1 Daily Quality Checks

**Validator Self-Check:**
- [ ] Model forecast captured before 6:30 AM
- [ ] 3 distinct traders interviewed (not same person multiple times)
- [ ] Prices recorded accurately (no transcription errors)
- [ ] Calculations verified (directional match, MAPE)
- [ ] Screenshot saved and labeled correctly
- [ ] Log submitted by 8:00 PM IST

**CTO Review Check (Weekly):**
- [ ] All 7 days of logs received
- [ ] No missing data points
- [ ] Calculations verified on random sample (3 days)
- [ ] Screenshots match log entries
- [ ] Anomalies investigated and documented

### 6.2 Audit Trail Requirements

**Required Artifacts:**
1. **Digital Logs:** Google Sheets with all 30+ days of data
2. **Physical Logs:** Scanned PDFs of daily templates
3. **Screenshots:** Organized folder with daily forecast screenshots
4. **Trader Contacts:** List of traders interviewed (with phone numbers for verification)
5. **Transportation Records:** Fuel receipts / travel logs (proof of mandi visits)
6. **Weekly Review Notes:** CTO review minutes for each week

**Retention:** All artifacts retained for 3 years per PRD §7.2 (IP protection audit trail)

---

## 7. Pass/Fail Criteria

### 7.1 Quantitative Criteria

| Metric | Target | Minimum Threshold |
|--------|--------|-------------------|
| **Directional Accuracy** | >90% | ≥27/30 days correct |
| **MAPE (30-day average)** | <8% | <8% |
| **Confidence Interval Coverage** | 75–85% | 75–85% of actuals within P10-P90 |
| **Data Completeness** | 100% | 30/30 days completed (no gaps) |

### 7.2 Qualitative Criteria

**Must Have:**
- [ ] All 30+ days completed consecutively (no gaps)
- [ ] Physical mandi visits for ≥25 days (phone-only validation max 5 days)
- [ ] Minimum 3 distinct traders per day
- [ ] Screenshots captured for all days
- [ ] Observations documented for anomalies

**Red Flags (Investigation Required):**
- Systematic over-prediction or under-prediction bias
- Consistent failure on specific market conditions (e.g., festival days)
- Large discrepancies between traders (>₹5/kg)
- Missing data or incomplete logs

### 7.3 Go/No-Go Decision

**PASS Criteria (ALL must be met):**
- Directional accuracy ≥90%
- MAPE <8%
- Data completeness 100%
- No unexplained red flags
- CTO and CEO sign-off

**FAIL Criteria (ANY triggers failure):**
- Directional accuracy <90%
- MAPE ≥8%
- Data completeness <100%
- Unexplained red flags not resolved
- Missing audit trail artifacts

**IF FAIL:**
- ❌ BLOCKER — No commercial activity permitted
- Return to Week 9 of 16-week execution plan
- Investigate root cause (data quality, model bias, feature engineering)
- Re-train model if necessary
- Re-run manual validation cycle

---

## 8. Emergency Procedures

### 8.1 Validator Unable to Visit Mandi

**Scenario:** Validator sick, vehicle breakdown, or other emergency

**Procedure:**
1. Notify CTO immediately (by 6:00 AM)
2. Activate secondary validator (if available)
3. If secondary unavailable:
   - Conduct phone-only validation (call 5 traders instead of 3)
   - Document reason for phone-only validation in log
   - Note: Phone-only days count toward 30-day total but max 5 such days allowed
4. Resume physical visits next day

### 8.2 Mandi Closed or Disrupted

**Scenario:** Mandi closed due to holiday, strike, HPAI quarantine, etc.

**Procedure:**
1. Document reason in validation log
2. Visit adjacent mandi (e.g., if Gorakhpur closed, visit Deoria)
3. If no mandi accessible:
   - Use AGMARKNET data as fallback (with staleness flag)
   - Call 5 traders for phone verification
   - Document disruption clearly
4. This day still counts toward 30-day total

### 8.3 Model Forecast Not Available

**Scenario:** PoultryPulse AI app/dashboard down, no forecast generated

**Procedure:**
1. Document outage in validation log
2. Collect actual mandi prices as usual
3. This day does NOT count toward 30-day total
4. Extend validation period by 1 day
5. Alert CTO immediately for incident response

---

## 9. Post-Validation Analysis

### 9.1 Summary Report Template

After 30+ days of validation, compile:

**Executive Summary:**
- Validation period: [Start Date] to [End Date]
- Total days validated: ___
- Directional accuracy: ___% (___/___ days correct)
- Average MAPE: ___%
- Confidence interval coverage: ___%

**Performance by Market Condition:**
- Normal days: Directional ___%, MAPE ___%
- Festival days: Directional ___%, MAPE ___%
- HPAI alert days: Directional ___%, MAPE ___%
- Price crash days: Directional ___%, MAPE ___%

**Model Bias Analysis:**
- Over-prediction days: ___ (___%)
- Under-prediction days: ___ (___%)
- Average over-prediction magnitude: ₹___/kg
- Average under-prediction magnitude: ₹___/kg

**Recommendations:**
- [ ] Model approved for launch
- [ ] Model requires retraining before launch
- [ ] Feature engineering improvements needed:
  - _________________________________
  - _________________________________

### 9.2 Sign-Off

**I certify that the above manual validation was conducted by physical mandi visits over 30+ consecutive days. The results accurately reflect actual market conditions.**

- **Primary Validator:** _______________________  Date: ___________
- **CTO Review:** _____________________________  Date: ___________
- **CEO Approval:** ____________________________  Date: ___________

---

## 10. References

- **PRD v3.0 §6.2:** Pre-Launch Accuracy Roadmap — Week 16: Manual Ground-Truth Validation
- **Architecture v1.0 §8:** 16-Week Technical Execution Plan — Week 16
- **TRD v1.0 §4.2:** Champion / Challenger Framework
- **Accuracy Validation Report:** docs/accuracy_validation_report.md

---

**Document Control:**
- **Version:** 1.0
- **Owner:** CTO / Data Head
- **Review Cycle:** Before each validation period
- **Distribution:** Validation team, CTO, CEO
