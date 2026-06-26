# PoultryPulse AI — Accuracy Gate Checklist
## Pre-Launch Validation Checklist

**Checklist Version:** 1.0
**Purpose:** Final verification of all three accuracy gates before commercial launch
**Authority:** PRD §6, TRD §4, Architecture v1.0 §8
**Status:** NON-NEGOTIABLE — All items must pass before launch

---

## Instructions

**How to Use This Checklist:**
1. Complete each item in order
2. Mark each item as ✓ (PASS) or ✗ (FAIL)
3. For FAIL items, document root cause and remediation plan
4. All items must be PASS before proceeding to next section
5. Final sign-off required from CTO and CEO

**BLOCKER:** If any item fails, commercial launch is BLOCKED until remediated.

---

## Section 1: Automated Backtesting (Gate 1, 2, 3)

### 1.1 Holdout Dataset Preparation

| Item | Description | Owner | Status | Date Completed |
|------|-------------|-------|--------|----------------|
| 1.1.1 | 6-month holdout period defined (most recent 6 months) | Data Head | ⬜ PASS / ✗ FAIL | ___________ |
| 1.1.2 | Gorakhpur district data extracted from Supabase predictions table | Data Head | ⬜ PASS / ✗ FAIL | ___________ |
| 1.1.3 | Adjacent districts data extracted (Deoria, Kushinagar, Basti, Maharajganj) | Data Head | ⬜ PASS / ✗ FAIL | ___________ |
| 1.1.4 | Actual prices verified against AGMARKNET records | Data Head | ⬜ PASS / ✗ FAIL | ___________ |
| 1.1.5 | Data completeness >95% (no gaps >2 consecutive days) | Data Head | ⬜ PASS / ✗ FAIL | ___________ |
| 1.1.6 | Holdout dataset sealed (no training data leakage) | CTO | ⬜ PASS / ✗ FAIL | ___________ |

**Section 1.1 Pass/Fail:** ⬜ ALL PASS / ✗ SECTION FAIL

---

### 1.2 Gate 1: Directional Accuracy (>95%)

| Item | Description | Target | Actual | Status | Date Completed |
|------|-------------|--------|--------|--------|----------------|
| 1.2.1 | Run backtest script: `python apps/pipeline/tests/backtest_accuracy.py` | — | — | ⬜ PASS / ✗ FAIL | ___________ |
| 1.2.2 | Directional accuracy calculated | >95% | ___% | ⬜ PASS / ✗ FAIL | ___________ |
| 1.2.3 | Total predictions evaluated | 180 | ___ | ⬜ PASS / ✗ FAIL | ___________ |
| 1.2.4 | Correct directional predictions | ≥171 | ___ | ⬜ PASS / ✗ FAIL | ___________ |
| 1.2.5 | Incorrect directional predictions | ≤9 | ___ | ⬜ PASS / ✗ FAIL | ___________ |
| 1.2.6 | Directional accuracy verified by manual code review | — | — | ⬜ PASS / ✗ FAIL | ___________ |

**Gate 1 Decision:** ⬜ PASS (>95%) / ✗ FAIL (<95%)

**If FAIL:**
- Root cause: _________________________________________________________
- Remediation plan: ____________________________________________________
- Target completion date: ___________

---

### 1.3 Gate 2: MAPE (<6%)

| Item | Description | Target | Actual | Status | Date Completed |
|------|-------------|--------|--------|--------|----------------|
| 1.3.1 | MAPE (30-day rolling) calculated | <6% | ___% | ⬜ PASS / ✗ FAIL | ___________ |
| 1.3.2 | MAPE (90-day rolling) calculated | <6% | ___% | ⬜ PASS / ✗ FAIL | ___________ |
| 1.3.3 | MAPE (full holdout period) calculated | <6% | ___% | ⬜ PASS / ✗ FAIL | ___________ |
| 1.3.4 | Worst daily MAPE documented | <15% | ___% | ⬜ PASS / ✗ FAIL | ___________ |
| 1.3.5 | Best daily MAPE documented | <1% | ___% | ⬜ PASS / ✗ FAIL | ___________ |
| 1.3.6 | MAPE calculation verified against manual spot-check | — | — | ⬜ PASS / ✗ FAIL | ___________ |

**Gate 2 Decision:** ⬜ PASS (<6%) / ✗ FAIL (≥6%)

**If FAIL:**
- Root cause: _________________________________________________________
- Remediation plan: ____________________________________________________
- Target completion date: ___________

---

### 1.4 Gate 3: Conformal Coverage (78–82%)

| Item | Description | Target | Actual | Status | Date Completed |
|------|-------------|--------|--------|--------|----------------|
| 1.4.1 | P10-P90 coverage calculated | 78–82% | ___% | ⬜ PASS / ✗ FAIL | ___________ |
| 1.4.2 | Total predictions with intervals | 180 | ___ | ⬜ PASS / ✗ FAIL | ___________ |
| 1.4.3 | Actuals within P10-P90 range | 140–148 | ___ | ⬜ PASS / ✗ FAIL | ___________ |
| 1.4.4 | Actuals below P10 | ≤20 | ___ | ⬜ PASS / ✗ FAIL | ___________ |
| 1.4.5 | Actuals above P90 | ≤20 | ___ | ⬜ PASS / ✗ FAIL | ___________ |
| 1.4.6 | Coverage calculation verified by manual spot-check | — | — | ⬜ PASS / ✗ FAIL | ___________ |

**Gate 3 Decision:** ⬜ PASS (78–82%) / ✗ FAIL (<78% or >82%)

**If FAIL:**
- Root cause: _________________________________________________________
- Remediation plan: ____________________________________________________
- Target completion date: ___________

---

### 1.5 Stress Tests

| Item | Description | Target | Actual | Status | Date Completed |
|------|-------------|--------|--------|--------|----------------|
| 1.5.1 | Stress Test 1: Nov–Mar 2024 UP price crash | Directional >90% | ___% | ⬜ PASS / ✗ FAIL | ___________ |
| 1.5.2 | Stress Test 2: HPAI district alert | Supply shock feature fires | Yes/No | ⬜ PASS / ✗ FAIL | ___________ |
| 1.5.3 | Stress Test 3: Diwali 2023 demand spike | Festival feature fires | Yes/No | ⬜ PASS / ✗ FAIL | ___________ |
| 1.5.4 | All stress tests pass | All 3 pass | — | ⬜ PASS / ✗ FAIL | ___________ |

**Section 1.5 Pass/Fail:** ⬜ ALL PASS / ✗ SECTION FAIL

---

## Section 2: Manual Ground-Truth Validation

### 2.1 Validation Preparation

| Item | Description | Owner | Status | Date Completed |
|------|-------------|-------|--------|----------------|
| 2.1.1 | Trader contact network established (3-5 traders per mandi) | Validator | ⬜ PASS / ✗ FAIL | ___________ |
| 2.1.2 | Validation log templates printed (physical + digital) | Validator | ⬜ PASS / ✗ FAIL | ___________ |
| 2.1.3 | Digital backup system set up (Google Sheets + PDF) | Validator | ⬜ PASS / ✗ FAIL | ___________ |
| 2.1.4 | Transportation logistics confirmed | Validator | ⬜ PASS / ✗ FAIL | ___________ |
| 2.1.5 | Trial run completed (2 test days) | Validator | ⬜ PASS / ✗ FAIL | ___________ |
| 2.1.6 | CTO calibration session completed | CTO | ⬜ PASS / ✗ FAIL | ___________ |

**Section 2.1 Pass/Fail:** ⬜ ALL PASS / ✗ SECTION FAIL

---

### 2.2 30-Day Validation Execution

| Item | Description | Target | Actual | Status | Date Completed |
|------|-------------|--------|--------|--------|----------------|
| 2.2.1 | Consecutive days validated | 30+ days | ___ days | ⬜ PASS / ✗ FAIL | ___________ |
| 2.2.2 | Physical mandi visits completed | ≥25 days | ___ days | ⬜ PASS / ✗ FAIL | ___________ |
| 2.2.3 | Phone-only validation days | ≤5 days | ___ days | ⬜ PASS / ✗ FAIL | ___________ |
| 2.2.4 | Traders interviewed per day | 3 distinct | ___ avg | ⬜ PASS / ✗ FAIL | ___________ |
| 2.2.5 | Daily logs submitted by 8:00 PM | 100% | ___% | ⬜ PASS / ✗ FAIL | ___________ |
| 2.2.6 | Screenshots captured for all days | 100% | ___% | ⬜ PASS / ✗ FAIL | ___________ |
| 2.2.7 | Weekly CTO reviews completed | 4 weeks | ___ weeks | ⬜ PASS / ✗ FAIL | ___________ |

**Section 2.2 Pass/Fail:** ⬜ ALL PASS / ✗ SECTION FAIL

---

### 2.3 Manual Validation Metrics

| Item | Description | Target | Actual | Status | Date Completed |
|------|-------------|--------|--------|--------|----------------|
| 2.3.1 | Directional accuracy (manual) | >90% | ___% | ⬜ PASS / ✗ FAIL | ___________ |
| 2.3.2 | MAPE (manual, 30-day average) | <8% | ___% | ⬜ PASS / ✗ FAIL | ___________ |
| 2.3.3 | Confidence interval coverage (manual) | 75–85% | ___% | ⬜ PASS / ✗ FAIL | ___________ |
| 2.3.4 | Data completeness | 100% | ___% | ⬜ PASS / ✗ FAIL | ___________ |
| 2.3.5 | No systematic bias detected | Yes/No | Yes/No | ⬜ PASS / ✗ FAIL | ___________ |

**Manual Validation Decision:** ⬜ PASS / ✗ FAIL

**If FAIL:**
- Root cause: _________________________________________________________
- Remediation plan: ____________________________________________________
- Target completion date: ___________

---

### 2.4 Audit Trail Verification

| Item | Description | Status | Date Completed |
|------|-------------|--------|----------------|
| 2.4.1 | Digital logs (Google Sheets) complete | ⬜ PASS / ✗ FAIL | ___________ |
| 2.4.2 | Physical logs (scanned PDFs) complete | ⬜ PASS / ✗ FAIL | ___________ |
| 2.4.3 | Screenshots organized and labeled | ⬜ PASS / ✗ FAIL | ___________ |
| 2.4.4 | Trader contact list documented | ⬜ PASS / ✗ FAIL | ___________ |
| 2.4.5 | Transportation records available | ⬜ PASS / ✗ FAIL | ___________ |
| 2.4.6 | Weekly review notes documented | ⬜ PASS / ✗ FAIL | ___________ |

**Section 2.4 Pass/Fail:** ⬜ ALL PASS / ✗ SECTION FAIL

---

## Section 3: Model Registry & Deployment

### 3.1 Champion Model Verification

| Item | Description | Target | Actual | Status | Date Completed |
|------|-------------|--------|--------|--------|----------------|
| 3.1.1 | Champion model version recorded | — | v___.__ | ⬜ PASS / ✗ FAIL | ___________ |
| 3.1.2 | Champion MAPE (30-day) documented | <6% | ___% | ⬜ PASS / ✗ FAIL | ___________ |
| 3.1.3 | Champion directional accuracy documented | >95% | ___% | ⬜ PASS / ✗ FAIL | ___________ |
| 3.1.4 | Champion conformal coverage documented | 78–82% | ___% | ⬜ PASS / ✗ FAIL | ___________ |
| 3.1.5 | Promotion date documented | — | ___________ | ⬜ PASS / ✗ FAIL | ___________ |
| 3.1.6 | S3 artifact path verified | models/champion/latest.onnx | — | ⬜ PASS / ✗ FAIL | ___________ |
| 3.1.7 | Quantisation verified (INT8) | Yes | Yes/No | ⬜ PASS / ✗ FAIL | ___________ |
| 3.1.8 | Inference latency (P95) measured | <200ms | ___ms | ⬜ PASS / ✗ FAIL | ___________ |

**Section 3.1 Pass/Fail:** ⬜ ALL PASS / ✗ SECTION FAIL

---

### 3.2 Model Registry Update

| Item | Description | Status | Date Completed |
|------|-------------|--------|----------------|
| 3.2.1 | model_registry table updated with champion metadata | ⬜ PASS / ✗ FAIL | ___________ |
| 3.2.2 | is_champion flag set to true for champion | ⬜ PASS / ✗ FAIL | ___________ |
| 3.2.3 | Previous champion archived | ⬜ PASS / ✗ FAIL | ___________ |
| 3.2.4 | Challenger artifacts stored in versioned S3 | ⬜ PASS / ✗ FAIL | ___________ |
| 3.2.5 | Accuracy log table updated with latest metrics | ⬜ PASS / ✗ FAIL | ___________ |

**Section 3.2 Pass/Fail:** ⬜ ALL PASS / ✗ SECTION FAIL

---

## Section 4: Documentation & Reporting

### 4.1 Accuracy Validation Report

| Item | Description | Status | Date Completed |
|------|-------------|--------|----------------|
| 4.1.1 | docs/accuracy_validation_report.md created | ⬜ PASS / ✗ FAIL | ___________ |
| 4.1.2 | Automated backtesting results documented | ⬜ PASS / ✗ FAIL | ___________ |
| 4.1.3 | Manual validation results documented | ⬜ PASS / ✗ FAIL | ___________ |
| 4.1.4 | Stress test results documented | ⬜ PASS / ✗ FAIL | ___________ |
| 4.1.5 | Feature importance analysis documented | ⬜ PASS / ✗ FAIL | ___________ |
| 4.1.6 | Model registry information documented | ⬜ PASS / ✗ FAIL | ___________ |
| 4.1.7 | Final gate decision documented | ⬜ PASS / ✗ FAIL | ___________ |

**Section 4.1 Pass/Fail:** ⬜ ALL PASS / ✗ SECTION FAIL

---

### 4.2 Manual Validation Protocol

| Item | Description | Status | Date Completed |
|------|-------------|--------|----------------|
| 4.2.1 | docs/manual_validation_protocol.md created | ⬜ PASS / ✗ FAIL | ___________ |
| 4.2.2 | Validation team responsibilities documented | ⬜ PASS / ✗ FAIL | ___________ |
| 4.2.3 | Daily validation procedure documented | ⬜ PASS / ✗ FAIL | ___________ |
| 4.2.4 | Validation log templates created | ⬜ PASS / ✗ FAIL | ___________ |
| 4.2.5 | Quality control procedures documented | ⬜ PASS / ✗ FAIL | ___________ |
| 4.2.6 | Pass/fail criteria documented | ⬜ PASS / ✗ FAIL | ___________ |
| 4.2.7 | Emergency procedures documented | ⬜ PASS / ✗ FAIL | ___________ |

**Section 4.2 Pass/Fail:** ⬜ ALL PASS / ✗ SECTION FAIL

---

## Section 5: Final Accuracy Gate Decision

### 5.1 Gate Status Summary

| Gate | Target | Actual | Status |
|------|--------|--------|--------|
| **Gate 1: Directional Accuracy** | >95% | ___% | ⬜ PASS / ✗ FAIL |
| **Gate 2: MAPE** | <6% | ___% | ⬜ PASS / ✗ FAIL |
| **Gate 3: Conformal Coverage** | 78–82% | ___% | ⬜ PASS / ✗ FAIL |
| **Manual Validation** | >90% directional | ___% | ⬜ PASS / ✗ FAIL |
| **Stress Tests** | All 3 pass | — | ⬜ PASS / ✗ FAIL |

### 5.2 Overall Decision

**ALL THREE GATES MUST PASS SIMULTANEOUSLY**

- **Decision:** ⬜ ALL PASS / ✗ ONE OR MORE FAIL
- **Authorized By:** 
  - CTO: _______________________  Date: ___________
  - CEO: _______________________  Date: ___________

### 5.3 Go/No-Go Authorization

**IF ALL GATES PASS:**
- [ ] ✅ Green light for Phase 0 commercial launch
- [ ] ✅ Customer onboarding may begin (S1 segment: Gorakhpur belt)
- [ ] ✅ Press and investor communication permitted
- [ ] ✅ Subscription activation enabled
- [ ] ✅ Proceed to Task 19: Final Checkpoint

**IF ANY GATE FAILS:**
- [ ] ❌ BLOCKER — No commercial activity permitted
- [ ] ❌ Return to Week 9 of 16-week execution plan
- [ ] ❌ Investigate root cause
- [ ] ❌ Re-train model with additional features or data
- [ ] ❌ Re-run full validation cycle
- [ ] ❌ DO NOT proceed to Task 19

---

## Section 6: Task 18 Sign-Off

### 6.1 Completion Verification

| Item | Description | Status | Date Completed |
|------|-------------|--------|----------------|
| 6.1.1 | Automated backtesting completed | ⬜ PASS / ✗ FAIL | ___________ |
| 6.1.2 | Accuracy gate metrics generated | ⬜ PASS / ✗ FAIL | ___________ |
| 6.1.3 | Manual validation process documented | ⬜ PASS / ✗ FAIL | ___________ |
| 6.1.4 | Accuracy gate checklist completed | ⬜ PASS / ✗ FAIL | ___________ |
| 6.1.5 | All three gates passed | ⬜ PASS / ✗ FAIL | ___________ |

### 6.2 Final Sign-Off

**I certify that Task 18 (95%+ Accuracy Gate — Pre-launch Validation) has been completed according to PRD §6, TRD §4, and Architecture v1.0 §8. All three accuracy gates have been cleared with documented evidence.**

- **CTO Signature:** _______________________  Date: ___________
- **CEO Signature:** _______________________  Date: ___________

---

## Appendix: Quick Reference

### Pass/Fail Thresholds Summary

| Metric | Pass Threshold | Fail Threshold |
|--------|---------------|----------------|
| Directional Accuracy (Automated) | ≥95% | <95% |
| MAPE (30-day) | <6% | ≥6% |
| MAPE (90-day) | <6% | ≥6% |
| MAPE (Full) | <6% | ≥6% |
| Conformal Coverage | 78–82% | <78% or >82% |
| Directional Accuracy (Manual) | ≥90% | <90% |
| MAPE (Manual) | <8% | ≥8% |
| Conformal Coverage (Manual) | 75–85% | <75% or >85% |

### Contact Information

| Role | Name | Phone | Email |
|------|------|-------|-------|
| CTO | [Name] | [Phone] | [Email] |
| Data Head | [Name] | [Phone] | [Email] |
| Validator | [Name] | [Phone] | [Email] |
| CEO | [Name] | [Phone] | [Email] |

### Document References

- **PRD v3.0 §6:** ML Architecture: The 95%+ Pre-Launch Accuracy Mandate
- **TRD v1.0 §4:** ML Architecture — 95%+ Pre-Launch Accuracy System
- **Architecture v1.0 §3:** ML Architecture — 95%+ Pre-Launch Accuracy System
- **Architecture v1.0 §8:** 16-Week Technical Execution Plan (Week 16)
- **docs/accuracy_validation_report.md:** Full accuracy validation report
- **docs/manual_validation_protocol.md:** Manual validation procedures
- **apps/pipeline/tests/backtest_accuracy.py:** Automated backtesting script

---

**Document Control:**
- **Version:** 1.0
- **Owner:** CTO / Data Head
- **Review Cycle:** Before each accuracy gate validation
- **Distribution:** CTO, CEO, Data Head, Validation Team
