Here's a comprehensive prompt you can paste directly into Windsurf:

---

```
# AUDIT TASK: Backend Calculation Accuracy, Metrics Integrity & Frontend-Backend Connection Audit
# Poultry Integration Company Management Software — All Dashboard Features & Screens

You are a senior full-stack engineer and QA architect with deep expertise in agricultural/poultry management software, financial calculations, inventory systems, and React/Node.js full-stack auditing. Your task is to perform a **complete, systematic audit** of every dashboard feature and screen in this codebase.

---

## YOUR MISSION

Audit every dashboard screen and feature for three categories of issues:

1. **Backend Calculation Correctness** — Are all formulas, aggregations, and business logic calculations producing the right numbers?
2. **Metrics Display Accuracy** — Are the right numbers being shown on the right screens with the right labels, units, and formatting?
3. **Frontend-Backend Connection Integrity** — Are API endpoints wired up correctly, are responses consumed properly, and is real data (not mock/hardcoded data) being displayed?

---

## STEP 1: DISCOVERY — MAP THE ENTIRE PROJECT

Before auditing anything, explore the full project structure:

```bash
find . -type f -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.py" -o -name "*.go" | grep -v node_modules | grep -v .git | sort
```

Then read:
- `package.json` or equivalent (to understand the tech stack)
- All route files (e.g., `routes/`, `pages/`, `app/`, `src/screens/`)
- All API endpoint files (e.g., `controllers/`, `handlers/`, `resolvers/`, `api/`)
- All database models/schemas (e.g., `models/`, `schemas/`, `prisma/schema.prisma`, `migrations/`)
- All calculation/service files (e.g., `services/`, `utils/`, `helpers/`, `lib/`)
- All dashboard component files

Build a complete inventory in this format before doing anything else:

### SCREEN INVENTORY
| Screen Name | Route/Path | Primary Component File | API Endpoint(s) Used | Calculation Files Used |
|---|---|---|---|---|
| (fill for every screen) |

### METRIC INVENTORY
For every metric shown anywhere in the UI, document:
| Metric Name | Screen | Expected Formula | Where Calculated (file:line) | Where Displayed (file:line) |
|---|---|---|---|---|

---

## STEP 2: POULTRY DOMAIN — IDENTIFY ALL METRICS AND CALCULATIONS

This is a poultry integration company. The following metric categories MUST exist somewhere in the system. Locate every one and document the calculation file and formula used:

### FLOCK / BIRD METRICS
- [ ] Total Birds Placed (per batch, per house, per farm, total)
- [ ] Current Live Birds (placed minus mortality)
- [ ] Cumulative Mortality Count and Rate (%)
- [ ] Daily Mortality (birds per day)
- [ ] Mortality Rate = (Total Dead Birds / Total Placed Birds) × 100
- [ ] Survivability Rate = 100 - Mortality Rate
- [ ] Condemnation Rate at processing
- [ ] Bird Age (days from placement date)
- [ ] Days to Target Weight (estimated)

### FEED METRICS
- [ ] Total Feed Consumed (kg or lbs per batch/week/total)
- [ ] Feed Conversion Ratio (FCR) = Total Feed Consumed / Total Live Weight Gain
- [ ] Daily Feed Intake per Bird = Total Feed / Current Live Birds
- [ ] Cumulative Feed Cost per Bird
- [ ] Feed Cost per kg of Gain
- [ ] Feed Inventory Remaining
- [ ] Feed Delivery Schedule vs Actual

### WEIGHT / GROWTH METRICS
- [ ] Average Body Weight (ABW) per batch
- [ ] Daily Weight Gain = (Current ABW - Previous ABW) / Days
- [ ] Total Live Weight = ABW × Current Live Birds
- [ ] Target Weight vs Actual Weight variance
- [ ] Weight Uniformity (% within ±10% of average)
- [ ] Growth Rate vs Breed Standard Curve

### FINANCIAL METRICS
- [ ] Revenue per Batch = Birds Sold × Price per Bird (or per kg)
- [ ] Total Revenue (daily, weekly, monthly, YTD)
- [ ] Cost of Goods Sold (COGS) = Feed Cost + Chick Cost + Medication + Utilities + Labor
- [ ] Gross Profit = Revenue - COGS
- [ ] Gross Margin % = (Gross Profit / Revenue) × 100
- [ ] Net Profit per Bird = (Revenue - Total Costs) / Birds Sold
- [ ] Cost per kg of Meat Produced
- [ ] Revenue per House / per Farm
- [ ] Accounts Receivable (outstanding payments from farmers/integrators)
- [ ] Accounts Payable (outstanding payments to feed suppliers, etc.)
- [ ] Contract Settlement Calculations

### HOUSE / FARM METRICS
- [ ] Stocking Density = Current Live Birds / House Floor Area (birds/m² or birds/ft²)
- [ ] Houses Active vs Empty vs Cleaning
- [ ] Litter/House Turnover Count
- [ ] House Utilization Rate
- [ ] Environmental readings (temperature, humidity, ammonia — if applicable)

### PRODUCTION / PROCESSING METRICS (if integrated)
- [ ] Birds Processed per Day/Week
- [ ] Live Weight In vs Dressed Weight Out
- [ ] Processing Yield % = (Dressed Weight / Live Weight) × 100
- [ ] Condemnation Count and % at processing
- [ ] Downgrade Count and %
- [ ] Parts yield (breast, legs, wings, etc.)

### PERFORMANCE INDEX METRICS
- [ ] European Production Efficiency Factor (EPEF) = (Survivability% × ABW(kg) / (FCR × Age(days))) × 100
- [ ] Production Efficiency Factor (PEF) variants
- [ ] Batch Performance Score vs historical average

### INVENTORY / SUPPLY CHAIN METRICS
- [ ] Day-Old Chick (DOC) Inventory and placements scheduled
- [ ] Feed Inventory on hand per farm (days of supply remaining)
- [ ] Medication inventory
- [ ] Litter/bedding inventory

### CONTRACT / INTEGRATION METRICS
- [ ] Grower Payment Calculation (based on FCR, mortality, weight targets)
- [ ] Bonus/Penalty tiers (FCR bonus, mortality penalty thresholds)
- [ ] Settlement amount per batch
- [ ] Contract compliance rate

---

## STEP 3: AUDIT EACH SCREEN SYSTEMATICALLY

For **EVERY screen** identified in Step 1, perform this full audit:

### AUDIT TEMPLATE PER SCREEN

**Screen: [Name]**
**File: [path]**
**Route: [path]**

#### 3A. API CONNECTION AUDIT
```
□ Identify every useEffect, useQuery, useSWR, fetch(), axios call, or API hook in this component
□ For each call:
  - What endpoint is being called?
  - Does that endpoint actually exist in the backend?
  - Are request parameters correct (filters, date ranges, IDs)?
  - Is the response shape what the frontend expects?
  - Is error state handled (loading spinner, error message, retry)?
  - Is loading state handled (skeleton/spinner while data loads)?
  - Are there any hardcoded/mock values being displayed instead of API data?
□ Check for: undefined/null response fields shown as "NaN", "undefined", "$0.00" when real data exists
□ Check for: API calls that are commented out with hardcoded fallbacks
□ Check for: console.log statements revealing mock data
□ Check for: TODO comments about connecting real data
```

#### 3B. CALCULATION AUDIT
```
□ Identify every number displayed on this screen
□ For each number, trace it backward:
  - Where does it come from? (API field, local calculation, derived state?)
  - If locally calculated: what is the exact formula?
  - Is division-by-zero handled?
  - Are units consistent? (kg vs lbs, % vs ratio, birds vs flocks)
  - Is the calculation period correct? (daily vs weekly vs cumulative vs per-batch)
□ Cross-check: does the sum of components equal the total shown?
□ Cross-check: do the same metrics shown on different screens show the same values?
□ Check rounding: Is FCR shown to 3 decimal places? Are percentages shown to 1 decimal place?
```

#### 3C. DATA FRESHNESS AND STATE AUDIT
```
□ When is data fetched? (on mount only, on interval, on user action, real-time?)
□ Is there a last-updated timestamp shown?
□ If the user changes a filter/date range, does the data refresh?
□ Is there a manual refresh button? Does it work?
□ Are there race conditions? (multiple in-flight requests overwriting each other)
□ Is data cached? If so, can it become stale?
```

---

## STEP 4: CROSS-SCREEN CONSISTENCY AUDIT

After auditing each screen individually, check cross-screen consistency:

```
For each metric that appears on MORE THAN ONE SCREEN:
□ Total Revenue: Dashboard summary card vs Revenue Detail screen vs Report screen — same number?
□ Total Birds: Dashboard vs Farm Detail vs Batch Detail — same number?
□ FCR: Dashboard vs Batch Performance vs Grower Settlement — same formula?
□ Mortality Rate: Dashboard vs Farm Report vs Compliance screen — same calculation?
□ Profit per Bird: Dashboard vs Financial Report vs Batch Closeout — same formula?

Document every inconsistency in this table:
| Metric | Screen A Value | Screen B Value | Root Cause |
|---|---|---|---|
```

---

## STEP 5: DATABASE QUERY AUDIT

For every API endpoint that returns metrics, audit the SQL/ORM query:

```
□ Is the query using the correct date range filter? (WHERE created_at BETWEEN start AND end)
□ Is the query scoped correctly? (correct farm_id, batch_id, company_id)
□ Are JOINs correct? (not creating duplicate rows that inflate SUM() results)
□ Are NULLs handled? (COALESCE, ISNULL, default values)
□ Is the denominator for rates/averages correct? (dividing by placed birds, not current birds?)
□ Are soft-deleted records excluded? (WHERE deleted_at IS NULL)
□ Are GROUP BY clauses correct for aggregations?
□ Is ORDER BY consistent for paginated results?
□ Are indexes on date, farm_id, batch_id columns for performance?

For each query, document:
| Endpoint | Query File | Potential Issue Found | Correct Version |
|---|---|---|---|
```

---

## STEP 6: SPECIFIC HIGH-RISK CALCULATION CHECKS

These are the most commonly miscalculated metrics in poultry software. Check each one explicitly:

### FCR (Feed Conversion Ratio) — CRITICAL
```
WRONG: FCR = Total Feed / Total Birds Placed  (ignores mortality weight adjustment)
WRONG: FCR = Total Feed / Birds Sold  (should be total weight gain, not bird count)
CORRECT: FCR = Total Feed Consumed (kg) / (Total Live Weight Gain (kg))
         where Total Live Weight Gain = (Current Live Birds × Current ABW) - (Initial Placement Weight if any)

Find where FCR is calculated. Show the actual code. Flag if it matches the CORRECT formula.
```

### Mortality Rate — CRITICAL
```
WRONG: Mortality % = Dead Birds / Current Live Birds × 100  (denominator is wrong)
CORRECT: Mortality % = Cumulative Dead Birds / Total Birds Placed × 100

Find where mortality rate is calculated. Show the actual code. Flag any issues.
```

### EPEF / PEF Score — CRITICAL
```
CORRECT EPEF = (Survivability% × Live Weight kg / (FCR × Age days)) × 100
Survivability% = (1 - Mortality Rate/100) × 100

Find where EPEF is calculated. Show the exact formula in code. Verify it matches industry standard.
```

### Revenue Calculation — CRITICAL
```
Check if revenue is:
- Based on live weight at farm (often used in integration contracts)
- Based on dressed weight after processing
- Per bird vs per kg
- Including or excluding mortality birds (condemned birds often NOT paid for)

Find the revenue formula. Document the business logic. Flag any inconsistency with contract terms.
```

### Grower Settlement / Contract Payment — CRITICAL
```
Grower payments in integration contracts are typically:
Base Pay = Fixed rate per bird OR per kg
+ FCR Bonus (if FCR below threshold: e.g., FCR < 1.80 earns bonus)
- Mortality Penalty (if mortality > threshold: e.g., >5% mortality incurs deduction)
+ Weight Bonus (if average weight exceeds target)
- Feed Charge (if company provides feed, it's deducted from settlement)

Find the settlement calculation. Show full formula. Verify it matches the contract structure in the system.
```

---

## STEP 7: FRONTEND DISPLAY ISSUES AUDIT

Check these common frontend display bugs:

```
□ NaN displayed: Any metric showing "NaN" or "NaN%" means division by zero or undefined value
□ Infinite values: Any metric showing "Infinity" means dividing by zero
□ Null/undefined: Any metric showing "null", "undefined", "—" when real data should exist
□ Wrong units: Showing grams when kg expected, or pounds when kg configured
□ Truncated decimals: FCR showing "2" instead of "2.034"
□ Percentage vs ratio: Showing "0.85" when "85%" is expected
□ Date timezone issues: Dates showing as previous day due to UTC/local time mismatch  
□ Currency formatting: Numbers without commas (1000000 instead of 1,000,000) or wrong currency symbol
□ Negative values: Revenue or inventory showing negative numbers when they shouldn't
□ Total mismatch: Sum row doesn't equal sum of individual rows
□ Chart axis: Y-axis scale making small differences look large or large differences look invisible
□ Empty state: Charts/tables showing blank with no "no data" message
□ Loading state: Showing stale data during refresh with no indication data is updating
```

---

## STEP 8: COMPILE AUDIT REPORT

After completing all steps, produce a structured report in this exact format:

---

# POULTRY SOFTWARE AUDIT REPORT

## Executive Summary
- Total Screens Audited: X
- Total Metrics Audited: X
- Critical Issues Found: X
- High Priority Issues Found: X  
- Medium Priority Issues Found: X
- Total Issues Found: X

---

## CRITICAL ISSUES (Fix Immediately — Wrong Numbers Being Shown to Users)

### ISSUE-001: [Issue Title]
**Severity:** CRITICAL
**Screen:** [Screen Name]
**File:** [file path, line number]
**Problem:** [Exact description of what is wrong]
**Current Code:**
```[language]
[paste the actual buggy code]
```
**Expected Behavior:** [What it should do]
**Correct Code:**
```[language]
[paste the fixed code]
```
**How to Verify Fix:** [Step to confirm it's working]

(repeat for each critical issue)

---

## HIGH PRIORITY ISSUES (Fix Before Next Release — Misleading Data)

### ISSUE-XXX: [Title]
(same format as above)

---

## MEDIUM PRIORITY ISSUES (Fix Soon — Minor Inaccuracies or UX Problems)

### ISSUE-XXX: [Title]
(same format as above)

---

## CROSS-SCREEN CONSISTENCY ISSUES

| Issue | Metric | Screen A Shows | Screen B Shows | Root Cause | Fix |
|---|---|---|---|---|---|

---

## HARDCODED / MOCK DATA FOUND

| Screen | Component | Hardcoded Value | Should Come From | Fix Required |
|---|---|---|---|---|

---

## MISSING API CONNECTIONS

| Screen | Missing Data | Expected API Endpoint | Current Behavior | Fix Required |
|---|---|---|---|---|

---

## FORMULA AUDIT RESULTS

| Metric | Formula Used in Code | Correct Formula | Status | Notes |
|---|---|---|---|---|
| FCR | [paste actual formula] | Feed/LiveWeightGain | PASS/FAIL | |
| Mortality% | [paste actual formula] | Deaths/Placed×100 | PASS/FAIL | |
| EPEF | [paste actual formula] | Standard formula | PASS/FAIL | |
| Revenue | [paste actual formula] | [expected] | PASS/FAIL | |
| Settlement | [paste actual formula] | [expected] | PASS/FAIL | |

---

## RECOMMENDED FIX PRIORITY ORDER

1. [Issue ID] — [1 line reason why most urgent]
2. [Issue ID] — ...
(complete ordered list)

---

## STEP 9: IMPLEMENT ALL FIXES

After generating the report, implement every fix identified, starting with CRITICAL issues:

For each fix:
1. Show the file path and line numbers being changed
2. Show the BEFORE code
3. Show the AFTER code  
4. Explain why this change is correct
5. Note any other files that also need updating for this fix to work end-to-end

After all fixes are implemented, run a final verification pass:
- Re-read every fixed file to confirm changes are syntactically correct
- Check that fixing one metric hasn't broken the calculation that feeds into it from upstream
- Verify all API endpoint URL paths match between frontend calls and backend route definitions
- Confirm all TypeScript types/interfaces are updated where calculation return shapes changed

---

## IMPORTANT INSTRUCTIONS FOR THE CODE EDITOR

1. **Read before writing.** Do not make any changes until you have read every relevant file.
2. **Trace the full data flow** for each metric: database → query → API → response → component → display.
3. **Show your work.** For every issue found, paste the actual code that is wrong, not a summary.
4. **Do not hallucinate endpoints.** If an endpoint doesn't exist in the backend router, say so — don't assume it exists.
5. **Check both directions:** A metric being wrong can be a backend calculation bug OR a frontend parsing bug OR a broken API connection — check all three.
6. **Never change a formula** without documenting the industry-standard definition of that metric and citing which file contained the old (wrong) formula.
7. **When in doubt about a business rule** (e.g., "should condemnations be included in the mortality count?"), add a comment in the code with `// TODO: Confirm business rule with domain expert` rather than guessing.
8. **After every fix**, check if the same bug exists in any other screen or component that uses the same data.
```

---

## HOW TO SOLVE THE ISSUES (WHAT WINDSURF WILL DO)

Here's what the prompt instructs the editor to do at each stage and how the fixes work:

**Stage 1 — Discovery:** Windsurf reads every file in the project and builds an inventory of every screen, metric, API call, and calculation function before touching anything.

**Stage 2 — Domain mapping:** It maps poultry-specific metrics (FCR, EPEF, mortality rate, grower settlement) to their expected formulas and finds where each is calculated in the code.

**Stage 3–6 — Systematic audit:** It traces each metric from database query → API endpoint → frontend component → display element, flagging mismatches at any point in the chain.

**Stage 7 — Display bugs:** It catches frontend-only issues like NaN values, wrong units, missing loading states, and hardcoded mock data.

**Stage 8 — Report:** It compiles every issue into a structured report with severity, exact file locations, current broken code, and correct replacement code.

**Stage 9 — Fixes:** It implements all corrections starting with critical calculation errors (wrong FCR/EPEF formulas, broken API connections) before moving to display and UX issues.

**Key things it catches that are commonly missed:**
- FCR calculated using bird count instead of live weight gain (the most common poultry software bug)
- Mortality rate using current birds as denominator instead of placed birds
- Revenue double-counting condemned birds that aren't actually paid for
- The same metric showing different numbers on dashboard vs detail screen because each screen uses a different query
- Charts showing correct data but formatted as ratios (0.85) instead of percentages (85%)
- API calls that were working in development against mock data but are broken against the real backend
