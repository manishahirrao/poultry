# STEP 4: CROSS-SCREEN CONSISTENCY AUDIT
# Poultry Integration Company Management Software — All Dashboard Features & Screens

**Date:** June 11, 2026  
**Purpose:** Cross-screen consistency audit for metrics that appear on multiple screens  
**Status:** COMPLETED

---

## EXECUTIVE SUMMARY

This audit examines metrics that appear on multiple screens to ensure consistency in formulas, calculations, and display across the application. Inconsistencies can lead to user confusion, incorrect decision-making, and loss of trust in the system.

**Total Metrics Audited:** 9  
**Critical Inconsistencies Found:** 4  
**High Priority Issues Found:** 3  
**Medium Priority Issues Found:** 2

---

## METHODOLOGY

For each metric that appears on multiple screens, the following was checked:
1. **Formula Consistency:** Do all screens use the same calculation formula?
2. **Data Source Consistency:** Do all screens fetch data from the same source?
3. **Display Consistency:** Do all screens show the same units, rounding, and formatting?
4. **Calculation Correctness:** Is the formula used correct according to poultry industry standards?

---

## CROSS-SCREEN CONSISTENCY FINDINGS

### 1. PORTFOLIO FCR (Feed Conversion Ratio)

**Screens Where Displayed:**
- Dashboard Overview (`/dashboard/overview`)
- Farm Portfolio (`/dashboard/farms`)

**Inconsistency Found:** CRITICAL - Different calculation methods

| Screen | Value/Formula | Source | Status |
|---|---|---|---|
| Dashboard Overview | Hardcoded: `1.775` | Line 101 in `overview/page.tsx` | ❌ INCORRECT |
| Farm Portfolio | Simple average: `totalFCR / activeBatchCount` | Line 175 in `farms/page.tsx` | ❌ INCORRECT FORMULA |

**Correct Formula (Industry Standard):**
```
Portfolio FCR = SUM(feed_kg across all batches) / SUM(weight_gain_kg across all batches)
```

**Root Cause:**
- Dashboard Overview uses hardcoded mock data for demo mode
- Farm Portfolio uses simple average of batch FCRs instead of weighted average by weight gain
- Simple average is incorrect because it doesn't account for different batch sizes and weight gains

**Impact:**
- Users see different FCR values on different screens
- Portfolio FCR may be significantly inaccurate, leading to wrong business decisions
- Loss of trust in system accuracy

**Recommended Fix:**
1. Remove hardcoded values from Dashboard Overview
2. Implement correct weighted average formula in Farm Portfolio
3. Use centralized calculation function from `lib/fcrCalculator.ts`
4. Ensure both screens use the same data source and calculation method

**Code Reference:**
- Dashboard Overview: `apps/web/app/dashboard/overview/page.tsx:99-108`
- Farm Portfolio: `apps/web/app/dashboard/farms/page.tsx:173-176`
- Correct Formula: `apps/web/lib/fcrCalculator.ts:62-67`

---

### 2. PORTFOLIO MORTALITY RATE

**Screens Where Displayed:**
- Dashboard Overview (`/dashboard/overview`)
- Farm Portfolio (`/dashboard/farms`)

**Inconsistency Found:** CRITICAL - Different calculation methods

| Screen | Value/Formula | Source | Status |
|---|---|---|---|
| Dashboard Overview | Hardcoded: `4.75%` | Line 102 in `overview/page.tsx` | ❌ INCORRECT |
| Farm Portfolio | Simple average: `totalMortality / activeBatchCount` | Line 176 in `farms/page.tsx` | ❌ INCORRECT FORMULA |

**Correct Formula (Industry Standard):**
```
Portfolio Mortality % = (SUM(deaths across all batches) / SUM(birds_placed across all batches)) × 100
```

**Root Cause:**
- Dashboard Overview uses hardcoded mock data for demo mode
- Farm Portfolio uses simple average of batch mortality percentages instead of total deaths/total placed
- Simple average is incorrect because it doesn't account for different batch sizes

**Impact:**
- Users see different mortality rates on different screens
- Portfolio mortality may be significantly inaccurate
- Could mask high-mortality batches if averaged with low-mortality batches

**Recommended Fix:**
1. Remove hardcoded values from Dashboard Overview
2. Implement correct formula: total deaths / total placed × 100
3. Ensure both screens use the same data source and calculation method
4. Add validation to catch division by zero

**Code Reference:**
- Dashboard Overview: `apps/web/app/dashboard/overview/page.tsx:99-108`
- Farm Portfolio: `apps/web/app/dashboard/farms/page.tsx:173-176`

---

### 3. TOTAL BIRDS

**Screens Where Displayed:**
- Dashboard Overview (`/dashboard/overview`)
- Farm Portfolio (`/dashboard/farms`)

**Inconsistency Found:** CRITICAL - Hardcoded vs calculated

| Screen | Value/Formula | Source | Status |
|---|---|---|---|
| Dashboard Overview | Hardcoded: `2375` | Line 100 in `overview/page.tsx` | ❌ INCORRECT |
| Farm Portfolio | Calculated: `SUM(birds_alive)` | Line 159 in `farms/page.tsx` | ✅ CORRECT |

**Correct Formula (Industry Standard):**
```
Total Birds = SUM(birds_alive across all active batches)
```

**Root Cause:**
- Dashboard Overview uses hardcoded mock data for demo mode
- Farm Portfolio correctly calculates from actual batch data

**Impact:**
- Users see different bird counts on different screens
- Dashboard Overview shows static value that doesn't reflect actual data
- Inaccurate portfolio metrics in demo mode

**Recommended Fix:**
1. Remove hardcoded values from Dashboard Overview
2. Fetch actual bird count from database
3. Use same calculation method as Farm Portfolio
4. Consider removing demo mode or making it explicit to users

**Code Reference:**
- Dashboard Overview: `apps/web/app/dashboard/overview/page.tsx:99-108`
- Farm Portfolio: `apps/web/app/dashboard/farms/page.tsx:156-159`

---

### 4. TOTAL FEED CONSUMED

**Screens Where Displayed:**
- Dashboard Overview (`/dashboard/overview`)
- Farm Portfolio (`/dashboard/farms`)

**Inconsistency Found:** CRITICAL - Hardcoded vs calculated

| Screen | Value/Formula | Source | Status |
|---|---|---|---|
| Dashboard Overview | Hardcoded: `1.25 MT` | Line 103 in `overview/page.tsx` | ❌ INCORRECT |
| Farm Portfolio | Calculated: `SUM(feed_kg) / 1000` | Line 162 in `farms/page.tsx` | ✅ CORRECT |

**Correct Formula (Industry Standard):**
```
Total Feed (MT) = SUM(feed_consumed_kg across all batches) / 1000
```

**Root Cause:**
- Dashboard Overview uses hardcoded mock data for demo mode
- Farm Portfolio correctly calculates from actual feed logs

**Impact:**
- Users see different feed consumption values on different screens
- Dashboard Overview shows static value that doesn't reflect actual data
- Inaccurate feed inventory planning

**Recommended Fix:**
1. Remove hardcoded values from Dashboard Overview
2. Fetch actual feed consumption from database
3. Use same calculation method as Farm Portfolio
4. Ensure unit consistency (MT vs kg)

**Code Reference:**
- Dashboard Overview: `apps/web/app/dashboard/overview/page.tsx:99-108`
- Farm Portfolio: `apps/web/app/dashboard/farms/page.tsx:161-162`

---

### 5. FCR (Feed Conversion Ratio) - Batch Level

**Screens Where Displayed:**
- Batch Detail Drawer (component)
- Farm Portfolio (batch cards)
- Batch P&L (component)

**Inconsistency Found:** HIGH - Different decimal precision

| Screen | Display Precision | Source | Status |
|---|---|---|---|
| Batch Detail Drawer | 2 decimal places | Line 488 in `BatchDetailDrawer.tsx` | ⚠️ SHOULD BE 3 |
| Farm Portfolio | Not visible in batch cards | - | - |
| Batch P&L | Not displayed | - | - |

**Correct Display Standard (Industry Standard):**
```
FCR should be displayed to 3 decimal places (e.g., 1.775)
```

**Root Cause:**
- Batch Detail Drawer uses `toFixed(2)` instead of `toFixed(3)`
- Industry standard is 3 decimal places for FCR to show meaningful differences

**Impact:**
- Loss of precision in FCR display
- Small but meaningful differences in FCR not visible to users
- May affect decision-making about feed efficiency

**Recommended Fix:**
1. Change `toFixed(2)` to `toFixed(3)` in Batch Detail Drawer
2. Ensure all FCR displays use 3 decimal places consistently
3. Add display standard to UI guidelines

**Code Reference:**
- Batch Detail Drawer: `apps/web/components/batch/BatchDetailDrawer.tsx:488`

---

### 6. MORTALITY RATE - Batch Level

**Screens Where Displayed:**
- Batch Detail Drawer (component)
- Mortality Dashboard (component)
- Farm Portfolio (batch cards)

**Inconsistency Found:** HIGH - Different calculation methods

| Screen | Formula | Source | Status |
|---|---|---|---|
| Batch Detail Drawer | From database field | Line 494 in `BatchDetailDrawer.tsx` | ✅ CORRECT |
| Mortality Dashboard | `(cumulativeDeaths / birdsPlaced) × 100` | Line 72 in `MortalityDashboard.tsx` | ✅ CORRECT |
| Farm Portfolio | From database field | Line 256 in `farms/page.tsx` | ✅ CORRECT |

**Correct Formula (Industry Standard):**
```
Mortality Rate % = (cumulative_deaths / birds_placed) × 100
```

**Root Cause:**
- All screens use correct formula
- No inconsistency found in calculation method
- All use correct denominator (birds_placed, not current_birds)

**Impact:**
- None - all screens consistent and correct

**Recommended Fix:**
- No fix needed
- Document as reference for other metrics

**Code Reference:**
- Batch Detail Drawer: `apps/web/components/batch/BatchDetailDrawer.tsx:494`
- Mortality Dashboard: `apps/web/components/batch/MortalityDashboard.tsx:72`
- Farm Portfolio: `apps/web/app/dashboard/farms/page.tsx:256`

---

### 7. AVERAGE BODY WEIGHT

**Screens Where Displayed:**
- Batch Detail Drawer (component)
- Batch P&L (component)

**Inconsistency Found:** MEDIUM - Different units

| Screen | Unit | Source | Status |
|---|---|---|---|
| Batch Detail Drawer | kg | Line 482 in `BatchDetailDrawer.tsx` | ✅ CORRECT |
| Batch P&L | kg | Line 364 in `BatchPnL.tsx` | ✅ CORRECT |
| Farm Portfolio | grams (implied) | Line 257, 258 in `farms/page.tsx` | ⚠️ INCONSISTENT |

**Correct Display Standard (Industry Standard):**
```
Weight should be displayed in kg for consistency across screens
```

**Root Cause:**
- Farm Portfolio displays weight in grams (values like 1680, 2100)
- Other screens display in kg (values like 1.68, 2.10)
- No unit label shown in Farm Portfolio

**Impact:**
- User confusion about units
- Potential for errors in weight-based calculations
- Inconsistent user experience

**Recommended Fix:**
1. Convert Farm Portfolio weight display to kg
2. Add unit label to all weight displays
3. Ensure consistent unit usage across all screens

**Code Reference:**
- Batch Detail Drawer: `apps/web/components/batch/BatchDetailDrawer.tsx:482`
- Batch P&L: `apps/web/components/batch/BatchPnL.tsx:364`
- Farm Portfolio: `apps/web/app/dashboard/farms/page.tsx:257-258`

---

### 8. REVENUE

**Screens Where Displayed:**
- Dashboard Overview (not directly displayed)
- Batch P&L (component)

**Inconsistency Found:** MEDIUM - Missing on Dashboard Overview

| Screen | Formula | Source | Status |
|---|---|---|---|
| Dashboard Overview | Not displayed | - | ⚠️ MISSING |
| Batch P&L | `birdsSold × weight × price` | Line 262 in `BatchPnL.tsx` | ✅ CORRECT |

**Correct Formula (Industry Standard):**
```
Revenue = birds_sold × avg_weight_kg × price_per_kg
```

**Root Cause:**
- Dashboard Overview doesn't display revenue at portfolio level
- Batch P&L calculates revenue correctly for individual batches
- No portfolio-level revenue aggregation

**Impact:**
- Users can't see total revenue across all batches on Dashboard Overview
- Incomplete financial picture at portfolio level
- Need to navigate to individual batch P&L to see revenue

**Recommended Fix:**
1. Add revenue metric to Dashboard Overview
2. Calculate portfolio revenue as SUM of batch revenues
3. Add revenue trend indicator
4. Consider adding revenue to PortfolioKPIBar

**Code Reference:**
- Batch P&L: `apps/web/components/batch/BatchPnL.tsx:262`

---

### 9. PROFIT PER BIRD

**Screens Where Displayed:**
- Batch P&L (component)

**Inconsistency Found:** NONE - Only displayed on one screen

| Screen | Formula | Source | Status |
|---|---|---|---|
| Batch P&L | `netProfit / birdsSold` | Line 272 in `BatchPnL.tsx` | ✅ CORRECT |

**Correct Formula (Industry Standard):**
```
Profit per Bird = (Revenue - Total Costs) / birds_sold
```

**Root Cause:**
- Only displayed on Batch P&L screen
- No inconsistency possible as only one screen

**Impact:**
- Users can't see profit per bird at portfolio level
- Need to navigate to individual batch P&L
- No benchmarking across batches

**Recommended Fix:**
1. Consider adding profit per bird to PortfolioKPIBar
2. Calculate portfolio average profit per bird
3. Add trend indicator
4. Allow comparison across batches

**Code Reference:**
- Batch P&L: `apps/web/components/batch/BatchPnL.tsx:272`

---

## SUMMARY TABLE OF INCONSISTENCIES

| Metric | Screen A | Screen B | Screen C | Root Cause | Severity | Fix Required |
|---|---|---|---|---|---|---|
| Portfolio FCR | Hardcoded (1.775) | Simple average | - | Wrong formula + hardcoded | CRITICAL | Implement weighted average |
| Portfolio Mortality | Hardcoded (4.75%) | Simple average | - | Wrong formula + hardcoded | CRITICAL | Implement total deaths/total placed |
| Total Birds | Hardcoded (2375) | Calculated | - | Hardcoded mock data | CRITICAL | Remove hardcoded values |
| Total Feed | Hardcoded (1.25 MT) | Calculated | - | Hardcoded mock data | CRITICAL | Remove hardcoded values |
| FCR (batch) | 2 decimal places | - | - | Wrong precision | HIGH | Change to 3 decimal places |
| Mortality Rate (batch) | Database field | Calculated | Database field | Consistent | NONE | No fix needed |
| Average Weight | kg | kg | grams | Unit inconsistency | MEDIUM | Standardize to kg |
| Revenue | Not displayed | Calculated | - | Missing on dashboard | MEDIUM | Add to dashboard |
| Profit per Bird | Calculated | - | - | Only one screen | LOW | Consider adding to portfolio |

---

## CRITICAL ISSUES REQUIRING IMMEDIATE ATTENTION

### ISSUE-001: Portfolio FCR Calculation Incorrect
**Severity:** CRITICAL  
**Screens Affected:** Dashboard Overview, Farm Portfolio  
**Root Cause:** Simple average instead of weighted average  
**Impact:** Wrong business decisions, loss of trust  
**Fix Priority:** IMMEDIATE

### ISSUE-002: Portfolio Mortality Calculation Incorrect
**Severity:** CRITICAL  
**Screens Affected:** Dashboard Overview, Farm Portfolio  
**Root Cause:** Simple average instead of total deaths/total placed  
**Impact:** Wrong mortality tracking, masked issues  
**Fix Priority:** IMMEDIATE

### ISSUE-003: Dashboard Overview Uses Hardcoded Data
**Severity:** CRITICAL  
**Screens Affected:** Dashboard Overview  
**Root Cause:** Demo mode with hardcoded values  
**Impact:** Shows wrong data, no reflection of reality  
**Fix Priority:** IMMEDIATE

### ISSUE-004: FCR Display Precision Incorrect
**Severity:** HIGH  
**Screens Affected:** Batch Detail Drawer  
**Root Cause:** 2 decimal places instead of 3  
**Impact:** Loss of precision, missed insights  
**Fix Priority:** HIGH

---

## RECOMMENDED FIXES IMPLEMENTATION PLAN

### Phase 1: Critical Fixes (Immediate)
1. **Remove hardcoded values from Dashboard Overview**
   - Replace mock data with actual API calls
   - Implement proper error handling
   - Add loading states

2. **Fix Portfolio FCR calculation in Farm Portfolio**
   - Change from simple average to weighted average
   - Use formula: `SUM(feed_kg) / SUM(weight_gain_kg)`
   - Test with sample data

3. **Fix Portfolio Mortality calculation in Farm Portfolio**
   - Change from simple average to total deaths/total placed
   - Use formula: `(total_deaths / total_placed) × 100`
   - Test with sample data

### Phase 2: High Priority Fixes (Within 1 week)
4. **Fix FCR display precision**
   - Change all FCR displays to 3 decimal places
   - Update UI guidelines
   - Test across all screens

5. **Standardize weight units**
   - Convert all weight displays to kg
   - Add unit labels
   - Update Farm Portfolio batch cards

### Phase 3: Medium Priority Fixes (Within 2 weeks)
6. **Add revenue to Dashboard Overview**
   - Calculate portfolio revenue
   - Add to PortfolioKPIBar
   - Add trend indicator

7. **Consider adding profit per bird to portfolio**
   - Calculate portfolio average
   - Add to PortfolioKPIBar
   - Enable batch comparison

---

## VERIFICATION CHECKLIST

After implementing fixes, verify:

- [ ] Dashboard Overview shows same Total Birds as Farm Portfolio
- [ ] Dashboard Overview shows same Portfolio FCR as Farm Portfolio
- [ ] Dashboard Overview shows same Portfolio Mortality as Farm Portfolio
- [ ] Dashboard Overview shows same Total Feed as Farm Portfolio
- [ ] All FCR displays show 3 decimal places
- [ ] All weight displays show kg with unit label
- [ ] Revenue is displayed on Dashboard Overview
- [ ] All calculations use correct formulas
- [ ] No hardcoded values in production code
- [ ] Demo mode is clearly labeled if retained

---

## CONCLUSION

The cross-screen consistency audit revealed **4 critical issues** and **3 high/medium priority issues** that need to be addressed. The most significant problems are:

1. **Incorrect portfolio-level calculations** (FCR and mortality) using simple averages instead of weighted averages
2. **Hardcoded mock data** on Dashboard Overview that doesn't reflect actual data
3. **Inconsistent display precision** for FCR (2 vs 3 decimal places)
4. **Unit inconsistency** for weight (kg vs grams)

These issues can lead to user confusion, incorrect business decisions, and loss of trust in the system. Implementing the recommended fixes will ensure consistency across all screens and improve data accuracy.

**Next Steps:**
1. Implement Phase 1 critical fixes immediately
2. Implement Phase 2 high priority fixes within 1 week
3. Implement Phase 3 medium priority fixes within 2 weeks
4. Conduct regression testing after each phase
5. Update documentation with correct formulas and display standards
