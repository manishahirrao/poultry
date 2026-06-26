# STEP 1: DISCOVERY — PROJECT MAPPING
# Poultry Integration Company Management Software — All Dashboard Features & Screens

**Date:** June 11, 2026  
**Purpose:** Complete project structure mapping for backend calculation accuracy, metrics integrity & frontend-backend connection audit

---

## TECH STACK OVERVIEW

### Frontend
- **Framework:** Next.js 15 (React)
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **State Management:** SWR, React hooks
- **UI Components:** Custom component library (packages/ui)
- **Internationalization:** next-intl

### Backend
- **API Framework:** FastAPI (Python)
- **Database:** PostgreSQL (Supabase)
- **ORM:** Direct SQL with migrations
- **Authentication:** JWT, OTP-based phone auth
- **ML/Inference:** ONNX models, Python inference pipeline

### Infrastructure
- **Monorepo:** Turborepo
- **Deployment:** Vercel (frontend), Railway (backend API)
- **Database:** Supabase (PostgreSQL)
- **Message Queue:** MQTT for IoT
- **Analytics:** PostHog

---

## PROJECT STRUCTURE

```
poutrysense/
├── apps/
│   ├── web/              # Next.js frontend application
│   │   ├── app/         # Next.js 15 app router
│   │   │   ├── dashboard/  # Dashboard screens
│   │   │   └── api/        # API route handlers
│   │   ├── components/  # React components
│   │   └── lib/         # Utility functions & calculators
│   ├── api/             # FastAPI backend
│   │   ├── main.py      # Main FastAPI application
│   │   ├── inference/   # ML inference modules
│   │   └── *.py         # Business logic modules
│   ├── db/              # Database migrations
│   │   └── migrations/  # SQL migration files
│   ├── mobile/          # Expo mobile app
│   └── pipeline/        # ML training pipeline
├── packages/
│   ├── ui/              # Shared UI components
│   ├── i18n/            # Internationalization
│   └── types/           # Shared TypeScript types
└── workers/             # Background workers
    └── mqtt-worker.ts   # MQTT IoT worker
```

---

## SCREEN INVENTORY

### Dashboard Overview Screens

| Screen Name | Route/Path | Primary Component File | API Endpoint(s) Used | Calculation Files Used |
|---|---|---|---|---|
| Dashboard Overview | `/dashboard` | `app/dashboard/page.tsx` | `/api/dashboard/summary` | `lib/roiCalculator.ts` |
| Dashboard Home | `/dashboard/overview` | `app/dashboard/overview/page.tsx` | `/api/metrics/summary` | `lib/fcrCalculator.ts` |
| Price Intelligence | `/dashboard/price-intelligence` | `app/dashboard/price-intelligence/page.tsx` | `/api/price-intelligence/*` | `lib/roiCalculator.ts` |
| Calculator | `/dashboard/calculator` | `app/dashboard/calculator/page.tsx` | `/api/batch/calculator` | `lib/roiCalculator.ts` |
| Batch Optimizer | `/dashboard/batch-optimizer` | `app/dashboard/batch-optimizer/page.tsx` | `/api/batch/optimizer` | `lib/roiCalculator.ts` |

### Batch Management Screens

| Screen Name | Route/Path | Primary Component File | API Endpoint(s) Used | Calculation Files Used |
|---|---|---|---|---|
| Batches List | `/dashboard/batches` | `app/dashboard/batches/page.tsx` | `/api/batches` | `lib/fcrCalculator.ts` |
| Batch Detail | `/dashboard/batches/[id]` | `components/batch/BatchDetailDrawer.tsx` | `/api/batches/[id]` | `lib/fcrCalculator.ts` |
| Batch Registration | `/dashboard/batches/register` | `components/batch/BatchRegistrationForm.tsx` | `/api/batches` | N/A |
| Batch P&L | `/dashboard/batches/[id]/pnl` | `components/batch/BatchPnL.tsx` | `/api/batches/[id]/pnl` | `lib/roiCalculator.ts` |
| Mortality Dashboard | `/dashboard/batches/[id]/mortality` | `components/batch/MortalityDashboard.tsx` | `/api/batches/[id]/mortality` | N/A |
| Weight Log | `/dashboard/batches/[id]/weight` | `components/batch/WeightLogForm.tsx` | `/api/weight-logs` | N/A |
| Input Cost Projection | `/dashboard/batches/[id]/projection` | `components/batch/InputCostProjection.tsx` | `/api/batches/[id]/projection` | `lib/roiCalculator.ts` |

### Farm Management Screens

| Screen Name | Route/Path | Primary Component File | API Endpoint(s) Used | Calculation Files Used |
|---|---|---|---|---|
| Farms List | `/dashboard/farms` | `app/dashboard/farms/page.tsx` | `/api/farms` | N/A |
| Farm Detail | `/dashboard/farms/[farmId]` | `components/farms/detail/FarmDetailDrawer.tsx` | `/api/farms/[farmId]` | `lib/fcrCalculator.ts` |
| Farm Daily Log | `/dashboard/farms/[farmId]/daily-log` | `app/dashboard/farms/[farmId]/daily-log/page.tsx` | `/api/daily-logs` | `lib/fcrCalculator.ts` |
| Farm Metrics | `/dashboard/farms/[farmId]/metrics` | `components/farms/detail/tabs/MetricsTab.tsx` | `/api/farms/[farmId]/metrics` | `lib/fcrCalculator.ts` |
| Farm Health | `/dashboard/farms/[farmId]/health` | `components/farms/detail/tabs/HealthTab.tsx` | `/api/farms/[farmId]/health` | N/A |
| Farm Sales | `/dashboard/farms/[farmId]/sales` | `components/farms/detail/tabs/SalesTab.tsx` | `/api/farms/[farmId]/sales` | N/A |
| Farm P&L | `/dashboard/farms/[farmId]/pl` | `components/farms/detail/tabs/PLTab.tsx` | `/api/farms/[farmId]/pl` | `lib/roiCalculator.ts` |

### Broiler Integration Screens

| Screen Name | Route/Path | Primary Component File | API Endpoint(s) Used | Calculation Files Used |
|---|---|---|---|---|
| Broiler Home | `/dashboard/broiler` | `app/dashboard/broiler/page.tsx` | `/api/broiler/summary` | `lib/fcrCalculator.ts` |
| Bird Sale | `/dashboard/broiler/bird-sale` | `app/dashboard/broiler/bird-sale/page.tsx` | `/api/broiler/bird-sales` | N/A |
| Body Weight | `/dashboard/broiler/body-weight` | `app/dashboard/broiler/body-weight/page.tsx` | `/api/broiler/body-weight` | N/A |
| Incentive Calculation | `/dashboard/broiler/incentive` | `app/dashboard/broiler/incentive/page.tsx` | `/api/broiler/incentives` | `components/broiler/IncentiveCalculation.tsx` |
| Chick Allocation | `/dashboard/broiler/integration/chick-alloc` | `app/dashboard/broiler/integration/chick-alloc/page.tsx` | `/api/broiler/chick-allocations` | N/A |
| Feed Allocation | `/dashboard/broiler/integration/feed-alloc` | `app/dashboard/broiler/integration/feed-alloc/page.tsx` | `/api/broiler/feed-allocations` | `lib/fcrCalculator.ts` |
| Shed Ready | `/dashboard/broiler/integration/shed-ready` | `app/dashboard/broiler/integration/shed-ready/page.tsx` | `/api/broiler/shed-ready` | N/A |
| Monthly Closing | `/dashboard/broiler/monthly-closing` | `app/dashboard/broiler/monthly-closing/page.tsx` | `/api/broiler/monthly-closing` | `components/broiler/MonthlyClosing.tsx` |
| Supervisor Report | `/dashboard/broiler/supervisor/report-entry` | `app/dashboard/broiler/supervisor/report-entry/page.tsx` | `/api/broiler/supervisor-report` | N/A |
| Travel | `/dashboard/broiler/travel` | `app/dashboard/broiler/travel/page.tsx` | `/api/broiler/travel` | N/A |
| Vehicles | `/dashboard/broiler/vehicles` | `app/dashboard/broiler/vehicles/page.tsx` | `/api/broiler/vehicles` | N/A |

### Broiler Reports Screens

| Screen Name | Route/Path | Primary Component File | API Endpoint(s) Used | Calculation Files Used |
|---|---|---|---|---|
| Batch Report | `/dashboard/broiler/reports/batch` | `app/dashboard/broiler/reports/batch/page.tsx` | `/api/broiler/reports/batch` | `lib/fcrCalculator.ts` |
| Daily Report | `/dashboard/broiler/reports/daily` | `app/dashboard/broiler/reports/daily/page.tsx` | `/api/broiler/reports/daily` | N/A |
| Farm Stock Report | `/dashboard/broiler/reports/farm-stock` | `app/dashboard/broiler/reports/farm-stock/page.tsx` | `/api/broiler/reports/farm-stock` | N/A |
| Feed Med Register | `/dashboard/broiler/reports/feed-med-register` | `app/dashboard/broiler/reports/feed-med-register/page.tsx` | `/api/broiler/reports/feed-med-register` | N/A |
| Feed Transfer | `/dashboard/broiler/reports/feed-transfer` | `app/dashboard/broiler/reports/feed-transfer/page.tsx` | `/api/broiler/reports/feed-transfer` | N/A |
| Live Birds Report | `/dashboard/broiler/reports/live-birds` | `app/dashboard/broiler/reports/live-birds/page.tsx` | `/api/broiler/reports/live-birds` | N/A |
| Monthly P&L | `/dashboard/broiler/reports/monthly-pl` | `app/dashboard/broiler/reports/monthly-pl/page.tsx` | `/api/broiler/reports/monthly-pl` | `lib/roiCalculator.ts` |
| Mortality Report | `/dashboard/broiler/reports/mortality` | `app/dashboard/broiler/reports/mortality/page.tsx` | `/api/broiler/reports/mortality` | N/A |
| Payroll Report | `/dashboard/broiler/reports/payroll` | `app/dashboard/broiler/reports/payroll/page.tsx` | `/api/broiler/reports/payroll` | N/A |
| Travel Report | `/dashboard/broiler/reports/travel` | `app/dashboard/broiler/reports/travel/page.tsx` | `/api/broiler/reports/travel` | N/A |

### Feed Management Screens

| Screen Name | Route/Path | Primary Component File | API Endpoint(s) Used | Calculation Files Used |
|---|---|---|---|---|
| Feed Intelligence | `/dashboard/feed-intelligence` | `app/dashboard/feed-intelligence/page.tsx` | `/api/feed-intelligence/*` | `lib/fcrCalculator.ts` |
| Feed Cost Dashboard | `/dashboard/feed/cost` | `components/feed/FeedCostDashboard.tsx` | `/api/feed/cost` | `lib/fcrCalculator.ts` |

### Inventory Screens

| Screen Name | Route/Path | Primary Component File | API Endpoint(s) Used | Calculation Files Used |
|---|---|---|---|---|
| Inventory Overview | `/dashboard/inventory` | `app/dashboard/inventory/page.tsx` | `/api/inventory/*` | N/A |
| Stock Overview | `/dashboard/inventory/stock` | `components/inventory/StockOverview.tsx` | `/api/inventory/stock` | N/A |
| Purchase Orders | `/dashboard/inventory/po` | `components/inventory/PurchaseOrderList.tsx` | `/api/inventory/po` | N/A |
| Vendors | `/dashboard/inventory/vendors` | `components/inventory/VendorManagement.tsx` | `/api/inventory/vendors` | N/A |

### Accounts/ERP Screens

| Screen Name | Route/Path | Primary Component File | API Endpoint(s) Used | Calculation Files Used |
|---|---|---|---|---|
| Accounts Overview | `/dashboard/accounts` | `app/dashboard/accounts/page.tsx` | `/api/accounts/*` | N/A |
| Bank Reconciliation | `/dashboard/accounts/bank-recon` | `app/dashboard/accounts/bank-recon/page.tsx` | `/api/accounts/bank-reconciliation` | N/A |
| Account Groups | `/dashboard/accounts/groups` | `app/dashboard/accounts/groups/page.tsx` | `/api/accounts/account-groups` | N/A |
| Ledgers | `/dashboard/accounts/ledgers` | `app/dashboard/accounts/ledgers/page.tsx` | `/api/accounts/ledgers` | N/A |
| Vouchers | `/dashboard/accounts/vouchers` | `app/dashboard/accounts/vouchers/[type]/page.tsx` | `/api/accounts/vouchers` | N/A |
| GST GSTR1 | `/dashboard/accounts/gst/gstr1` | `app/dashboard/accounts/gst/gstr1/page.tsx` | `/api/accounts/gst/gstr1` | N/A |
| GST GSTR3B | `/dashboard/accounts/gst/gstr3b` | `app/dashboard/accounts/gst/gstr3b/page.tsx` | `/api/accounts/gst/gstr3b` | N/A |
| Balance Sheet | `/dashboard/accounts/reports/balance-sheet` | `app/dashboard/accounts/reports/balance-sheet/page.tsx` | `/api/accounts/reports/balance-sheet` | N/A |
| Day Book | `/dashboard/accounts/reports/daybook` | `app/dashboard/accounts/reports/daybook/page.tsx` | `/api/accounts/reports/daybook` | N/A |
| Ledger Statement | `/dashboard/accounts/reports/ledger` | `app/dashboard/accounts/reports/ledger/page.tsx` | `/api/accounts/reports/ledger` | N/A |
| Profit & Loss | `/dashboard/accounts/reports/pl` | `app/dashboard/accounts/reports/pl/page.tsx` | `/api/accounts/reports/pl` | N/A |
| Trial Balance | `/dashboard/accounts/reports/trial-balance` | `app/dashboard/accounts/reports/trial-balance/page.tsx` | `/api/accounts/reports/trial-balance` | N/A |

### Alerts Screens

| Screen Name | Route/Path | Primary Component File | API Endpoint(s) Used | Calculation Files Used |
|---|---|---|---|---|
| Alerts Overview | `/dashboard/alerts` | `app/dashboard/alerts/page.tsx` | `/api/alerts/*` | N/A |
| Risk Assessment | `/dashboard/alerts/risk/[farmId]` | `app/dashboard/alerts/risk/[farmId]/page.tsx` | `/api/alerts/risk/[farmId]` | `lib/risk-calculation.ts` |

### Metrics Screens

| Screen Name | Route/Path | Primary Component File | API Endpoint(s) Used | Calculation Files Used |
|---|---|---|---|---|
| Metrics Overview | `/dashboard/metrics` | `app/dashboard/metrics/page.tsx` | `/api/metrics/*` | `lib/fcrCalculator.ts` |
| Accuracy Dashboard | `/dashboard/accuracy` | `app/dashboard/accuracy/page.tsx` | `/api/model-accuracy` | N/A |
| Admin Accuracy | `/dashboard/admin-accuracy` | `app/dashboard/admin-accuracy/page.tsx` | `/api/admin/accuracy` | N/A |

### Employee Management Screens

| Screen Name | Route/Path | Primary Component File | API Endpoint(s) Used | Calculation Files Used |
|---|---|---|---|---|
| Employees Overview | `/dashboard/employees` | `app/dashboard/employees/page.tsx` | `/api/employees/*` | N/A |
| Employee Expenses | `/dashboard/employees/expenses` | `app/dashboard/employees/expenses/page.tsx` | `/api/employees/expenses` | N/A |
| Employee Salary | `/dashboard/employees/salary` | `app/dashboard/employees/salary/page.tsx` | `/api/employees/salary` | N/A |

### Other Screens

| Screen Name | Route/Path | Primary Component File | API Endpoint(s) Used | Calculation Files Used |
|---|---|---|---|---|
| District Map | `/dashboard/district-map` | `app/dashboard/district-map/page.tsx` | `/api/map/district` | N/A |
| Customers | `/dashboard/customers` | `app/dashboard/customers/page.tsx` | `/api/customers` | N/A |
| Sales | `/dashboard/sales` | `app/dashboard/sales/page.tsx` | `/api/sales` | N/A |
| Settings | `/dashboard/settings` | `app/dashboard/settings/page.tsx` | `/api/settings` | N/A |
| Masters | `/dashboard/masters` | `app/dashboard/masters/page.tsx` | `/api/masters/*` | N/A |
| Reports | `/dashboard/reports` | `app/dashboard/reports/page.tsx` | `/api/reports` | N/A |
| API Documentation | `/dashboard/api` | `app/dashboard/api/page.tsx` | N/A | N/A |
| Watermark Audit | `/dashboard/watermark-audit` | `app/dashboard/watermark-audit/page.tsx` | `/api/watermark/*` | N/A |
| WhatsApp Analytics | `/dashboard/whatsapp-analytics` | `app/dashboard/whatsapp-analytics/page.tsx` | `/api/whatsapp/analytics/*` | N/A |
| Middleman Check | `/dashboard/middleman-check` | `app/dashboard/middleman-check/page.tsx` | `/api/middleman/*` | N/A |
| HACCP | `/dashboard/haccp` | `app/dashboard/haccp/page.tsx` | `/api/haccp` | N/A |
| Biosecurity | `/dashboard/biosecurity` | N/A | `/api/biosecurity` | N/A |

---

## METRIC INVENTORY

### Flock / Bird Metrics

| Metric Name | Screen | Expected Formula | Where Calculated (file:line) | Where Displayed (file:line) |
|---|---|---|---|---|
| Total Birds Placed | Farm Detail, Batch Detail | SUM(doc_count) per batch | DB: batches table | `components/farms/detail/FarmHeader.tsx` |
| Current Live Birds | Farm Detail, Batch Detail | placed - cumulative_deaths | DB: batches.current_bird_count | `components/farms/detail/FarmHeader.tsx` |
| Cumulative Mortality Count | Farm Detail, Batch Detail | SUM(deaths_today) | DB: mortality_logs aggregation | `components/batch/MortalityDashboard.tsx` |
| Cumulative Mortality Rate % | Farm Detail, Batch Detail | (cumulative_deaths / placed) × 100 | DB: batches.cumulative_mortality_pct | `components/farms/MortalityBadge.tsx` |
| Daily Mortality | Farm Daily Log | deaths_today | DB: daily_logs.deaths_today | `components/farms/detail/tabs/DailyLogTab.tsx` |
| Mortality Rate % | Farm Daily Log | (cumulative_deaths / placed) × 100 | DB: daily_logs.cumulative_mortality_pct | `components/farms/MortalityBadge.tsx` |
| Survivability Rate % | Farm Detail | 100 - mortality_rate | Calculated from mortality | `components/farms/detail/tabs/MetricsTab.tsx` |
| Bird Age (days) | Farm Detail, Batch Detail | CURRENT_DATE - placement_date | DB: computed field | `components/farms/FarmMetricCard.tsx` |
| Days to Target Weight | Batch Detail | target_harvest_age_days - current_age | DB: batches.target_harvest_age_days | `components/batch/BatchCard.tsx` |

### Feed Metrics

| Metric Name | Screen | Expected Formula | Where Calculated (file:line) | Where Displayed (file:line) |
|---|---|---|---|---|
| Total Feed Consumed (kg) | Farm Detail, Batch Detail | SUM(morning_feed + evening_feed - refusal) | DB: feed_logs aggregation | `components/farms/detail/tabs/FeedTab.tsx` |
| Daily Feed Intake per Bird | Farm Daily Log | feed_consumed_kg / current_birds | DB: daily_logs.feed_per_bird_g | `components/farms/detail/tabs/DailyLogTab.tsx` |
| Cumulative Feed Cost per Bird | Batch P&L | total_feed_cost / birds_placed | DB: batch_costs aggregation | `components/batch/BatchPnL.tsx` |
| Feed Cost per kg of Gain | Batch P&L | total_feed_cost / total_weight_gain | Calculated in P&L | `components/batch/BatchPnL.tsx` |
| Feed Conversion Ratio (FCR) | Farm Detail, Batch Detail | total_feed_kg / total_weight_gain_kg | `lib/fcrCalculator.ts:62` | `components/farms/FCRBadge.tsx` |
| FCR with Breed Standard | Farm Detail | FCR compared to breed standard | `lib/fcrCalculator.ts:103` | `components/feed/FcrGauge.tsx` |
| Feed Allocation Recommendation | Feed Intelligence | target_weight_gain × flock_size × FCR | `lib/fcrCalculator.ts:298` | `components/feed/FeedAllocationCard.tsx` |
| Feed-Water Ratio | Farm Daily Log | water_litres / total_feed_kg | `lib/fcrCalculator.ts:165` | `components/farms/detail/tabs/DailyLogTab.tsx` |

### Weight / Growth Metrics

| Metric Name | Screen | Expected Formula | Where Calculated (file:line) | Where Displayed (file:line) |
|---|---|---|---|---|
| Average Body Weight (ABW) | Farm Detail, Batch Detail | avg_weight_kg from weight_logs | DB: weight_logs.avg_weight_kg | `components/farms/WeightSparkline.tsx` |
| Daily Weight Gain | Farm Detail | (current_abw - previous_abw) / days | Calculated from weight logs | `components/farms/detail/tabs/charts/ADGChart.tsx` |
| Total Live Weight | Farm Detail, Batch Detail | current_birds × current_abw | Calculated in metrics tab | `components/farms/detail/tabs/MetricsTab.tsx` |
| Target Weight vs Actual | Farm Detail | actual_weight - target_weight | DB: batches.target_harvest_weight_kg | `components/farms/detail/tabs/charts/WeightProgressionChart.tsx` |
| Weight Uniformity % | Farm Detail | % within ±10% of average | Calculated from weight_logs | `components/farms/detail/tabs/MetricsTab.tsx` |
| Growth Rate vs Standard | Farm Detail | actual_adg vs breed_standard_adg | Calculated from weight curve | `components/farms/detail/tabs/charts/ADGChart.tsx` |

### Financial Metrics

| Metric Name | Screen | Expected Formula | Where Calculated (file:line) | Where Displayed (file:line) |
|---|---|---|---|---|
| Revenue per Batch | Batch P&L, Sales | birds_sold × price_per_kg × avg_weight | DB: batch_sales.gross_revenue | `components/batch/BatchPnL.tsx` |
| Total Revenue | Dashboard Overview | SUM(batch_revenue) | DB: aggregation | `components/dashboard/overview/KPICards.tsx` |
| Cost of Goods Sold (COGS) | Batch P&L | feed_cost + chick_cost + medicine + utilities | DB: batch_costs aggregation | `components/batch/BatchPnL.tsx` |
| Gross Profit | Batch P&L | revenue - cogs | Calculated in P&L | `components/batch/BatchPnL.tsx` |
| Gross Margin % | Batch P&L | (gross_profit / revenue) × 100 | Calculated in P&L | `components/batch/BatchPnL.tsx` |
| Net Profit per Bird | Batch P&L | (revenue - total_costs) / birds_sold | Calculated in P&L | `components/batch/BatchPnL.tsx` |
| Cost per kg of Meat | Batch P&L | total_costs / total_weight_kg | Calculated in P&L | `components/batch/BatchPnL.tsx` |
| Revenue per House | Farm Detail | SUM(batch_revenue) per farm | DB: aggregation | `components/farms/detail/tabs/PLTab.tsx` |
| Revenue per Farm | Dashboard Overview | SUM(batch_revenue) per farm | DB: aggregation | `components/dashboard/overview/KPICards.tsx` |
| Break-Even Price | Calculator | total_costs / (birds × weight) | `lib/roiCalculator.ts:157` | `components/dashboard/calculator/BatchProfitCalculator.tsx` |
| ROI % | Calculator | (net_profit / total_investment) × 100 | `lib/roiCalculator.ts:215` | `components/dashboard/calculator/BatchRoiOptimizer.tsx` |

### House / Farm Metrics

| Metric Name | Screen | Expected Formula | Where Calculated (file:line) | Where Displayed (file:line) |
|---|---|---|---|---|
| Stocking Density | Farm Detail | current_birds / floor_area | DB: farms.total_capacity | `components/farms/detail/tabs/MetricsTab.tsx` |
| Houses Active vs Empty | Farm Portfolio | COUNT(sheds) by status | DB: sheds aggregation | `components/farms/portfolio/FarmCardsGrid.tsx` |
| House Utilization Rate | Farm Detail | (active_birds / total_capacity) × 100 | Calculated from capacity | `components/farms/detail/FarmHeader.tsx` |
| Environmental Score | Farm Detail | Computed from temp, humidity, ammonia | DB: iot_readings aggregation | `components/dashboard/iot/EnvironmentScoreCard.tsx` |
| Temperature (°C) | Farm Daily Log | temp_min_c, temp_max_c | DB: daily_logs.temp_* | `components/farms/detail/tabs/charts/TempHumidityChart.tsx` |
| Humidity (%) | Farm Daily Log | humidity_pct | DB: daily_logs.humidity_pct | `components/farms/detail/tabs/charts/TempHumidityChart.tsx` |
| Ammonia Level | Farm Detail | From IoT sensors | DB: iot_readings | `components/farms/detail/tabs/charts/AmmoniaChart.tsx` |

### Performance Index Metrics

| Metric Name | Screen | Expected Formula | Where Calculated (file:line) | Where Displayed (file:line) |
|---|---|---|---|---|
| European Production Efficiency Factor (EPEF) | Farm Detail | (survivability% × weight_kg / (FCR × age_days)) × 100 | Calculated in metrics tab | `components/farms/detail/tabs/MetricsTab.tsx` |
| Production Efficiency Factor (PEF) | Farm Detail | Variant of EPEF | Calculated in metrics tab | `components/farms/detail/tabs/MetricsTab.tsx` |
| Batch Performance Score | Batch Detail | Composite score vs historical | Calculated from metrics | `components/batch/PerformanceBenchmarkChart.tsx` |

### Inventory / Supply Chain Metrics

| Metric Name | Screen | Expected Formula | Where Calculated (file:line) | Where Displayed (file:line) |
|---|---|---|---|---|
| Feed Inventory Remaining | Inventory Overview | current_stock from inventory_items | DB: inventory_items.current_stock | `components/inventory/StockOverview.tsx` |
| Days of Feed Supply | Inventory Overview | current_stock / daily_consumption | Calculated from stock & consumption | `components/feed/FarmsNeedingRestock.tsx` |
| Medicine Inventory | Inventory Overview | current_stock from inventory_items | DB: inventory_items.current_stock | `components/inventory/StockOverview.tsx` |
| Vaccine Inventory | Inventory Overview | current_stock from inventory_items | DB: inventory_items.current_stock | `components/inventory/StockOverview.tsx` |

### Contract / Integration Metrics

| Metric Name | Screen | Expected Formula | Where Calculated (file:line) | Where Displayed (file:line) |
|---|---|---|---|---|
| Grower Payment Calculation | Broiler Incentive | Base pay + FCR bonus - mortality penalty | `components/broiler/IncentiveCalculation.tsx` | `app/dashboard/broiler/incentive/page.tsx` |
| FCR Bonus Amount | Broiler Incentive | (target_FCR - actual_FCR) × rate_per_0.01 | Calculated in incentive | `components/broiler/IncentiveCalculation.tsx` |
| Mortality Penalty | Broiler Incentive | (actual_mortality - threshold) × rate_per_1% | Calculated in incentive | `components/broiler/IncentiveCalculation.tsx` |
| Weight Bonus | Broiler Incentive | (actual_weight - target) × rate_per_100g | Calculated in incentive | `components/broiler/IncentiveCalculation.tsx` |
| Settlement Amount | Broiler Monthly Closing | Total payment - deductions | Calculated in closing | `components/broiler/MonthlyClosing.tsx` |

### Price Intelligence Metrics

| Metric Name | Screen | Expected Formula | Where Calculated (file:line) | Where Displayed (file:line) |
|---|---|---|---|---|
| P10 Price Forecast | Price Intelligence | 10th percentile prediction | Python ML model | `components/dashboard/price-intelligence/ForecastTab.tsx` |
| P50 Price Forecast | Price Intelligence | 50th percentile prediction | Python ML model | `components/dashboard/price-intelligence/ForecastTab.tsx` |
| P90 Price Forecast | Price Intelligence | 90th percentile prediction | Python ML model | `components/dashboard/price-intelligence/ForecastTab.tsx` |
| Price Trend | Price Intelligence | Current vs previous price | Calculated from history | `components/feed/CommodityPriceChart.tsx` |
| Demand Signal | Feed Intelligence | Aggregated demand indicators | Calculated from multiple sources | `components/feed/DemandSignalPanel.tsx` |

### Accuracy Metrics (Admin Only)

| Metric Name | Screen | Expected Formula | Where Calculated (file:line) | Where Displayed (file:line) |
|---|---|---|---|---|
| MAPE (Mean Absolute Percentage Error) | Admin Accuracy | AVG(|actual - predicted| / actual) × 100 | Python: accuracy_log aggregation | `components/admin/AccuracyDashboard.tsx` |
| Directional Accuracy | Admin Accuracy | % of correct direction predictions | Python: accuracy_log aggregation | `components/admin/AccuracyDashboard.tsx` |
| Conformal Coverage | Admin Accuracy | % of actuals within prediction interval | Python: accuracy_log aggregation | `components/admin/AccuracyDashboard.tsx` |
| Model Version | Admin Accuracy | Current champion model version | DB: model_registry | `components/admin/ModelTimeline.tsx` |

---

## CALCULATION FILES INVENTORY

### Frontend Calculation Files (TypeScript)

| File | Purpose | Key Functions |
|---|---|---|
| `apps/web/lib/fcrCalculator.ts` | FCR calculations, breed standards, feed allocation | `calculateFCR()`, `calculateFCRWithStandard()`, `getBreedStandardFCR()`, `calculateFeedAllocation()` |
| `apps/web/lib/roiCalculator.ts` | ROI optimization, sell-hold analysis, break-even | `calculateBreakEvenPrice()`, `calculateSellHoldMatrix()`, `isBelowBreakEven()` |
| `apps/web/lib/risk-calculation.ts` | Farm risk assessment scoring | Risk calculation functions |
| `apps/web/lib/formatCurrency.ts` | Currency formatting utilities | `formatCurrency()` |
| `apps/web/lib/tallyExporter.ts` | Tally ERP integration | Export functions |

### Backend Calculation Files (Python)

| File | Purpose | Key Functions |
|---|---|---|
| `apps/api/inference/predictor.py` | ML model inference | `predict()` |
| `apps/api/inference/sell_signal.py` | Sell signal computation | `compute_sell_signal()` |
| `apps/api/batch_costs.py` | Batch cost calculations | `get_batch_costs()`, `create_batch_cost()` |
| `apps/api/batch_sales.py` | Batch sales calculations | `get_batch_sales()`, `create_batch_sale()` |
| `apps/api/batch_treatments.py` | Treatment cost calculations | `get_batch_treatments()`, `create_batch_treatment()` |
| `apps/api/benchmark.py` | Benchmark data & insights | `get_benchmark_data()`, `generate_benchmark_insights()` |
| `apps/api/health_intelligence.py` | Health checklist calculations | `handle_health_checklist_insert()` |
| `apps/api/mortality_pattern.py` | Mortality pattern analysis | `analyze_mortality_pattern()` |

### Database Calculation Functions (SQL)

| Migration | Function | Purpose |
|---|---|---|
| `20260503_batches.sql` | `update_batch_status()` | Auto-update batch status based on age |
| `20260503_batches.sql` | `update_bird_count_on_mortality()` | Update current bird count on mortality log |
| `20260504_inventory_management.sql` | `update_inventory_stock()` | Update inventory stock on movement |
| `20260504_inventory_management.sql` | `check_low_stock_alert()` | Create alert when stock below minimum |
| `20260504_inventory_management.sql` | `auto_decrement_feed_stock()` | Auto-decrement feed on feed log |
| `20260504_inventory_management.sql` | `auto_decrement_vaccine_stock()` | Auto-decrement vaccine on vaccination |
| `20260504_inventory_management.sql` | `auto_decrement_medicine_stock()` | Auto-decrement medicine on medication |
| `20260523_farm_management.sql` | `compute_daily_log_metrics()` | Compute daily log metrics (FCR, mortality, etc.) |
| `20260523_farm_management.sql` | `refresh_farm_metrics_summary()` | Refresh materialized view |

---

## API ENDPOINT INVENTORY

### Frontend API Routes (Next.js)

| Route | Method | Purpose | Backend Endpoint |
|---|---|---|---|
| `/api/account/delete` | POST | Delete account | Supabase |
| `/api/accounts/*` | Various | Accounts/ERP operations | Supabase |
| `/api/alerts/*` | Various | Alert management | Supabase |
| `/api/analytics/*` | Various | Analytics events | PostHog |
| `/api/auth/otp/*` | POST | OTP authentication | Supabase |
| `/api/benchmark/*` | GET | Benchmark data | Supabase |
| `/api/broiler/*` | Various | Broiler integration operations | Supabase |
| `/api/customers/*` | Various | Customer management | Supabase |
| `/api/dashboard/*` | GET | Dashboard summary data | Supabase |
| `/api/employees/*` | Various | Employee management | Supabase |
| `/api/expenses/*` | Various | Expense tracking | Supabase |
| `/api/farms/*` | Various | Farm management | Supabase |
| `/api/feed/*` | GET | Feed intelligence | Supabase |
| `/api/integrations/*` | POST | ERP integrations | External APIs |
| `/api/inventory/*` | Various | Inventory management | Supabase |
| `/api/iot/*` | POST | IoT device data | MQTT/Supabase |
| `/api/metrics/*` | GET | Metrics data | Supabase |
| `/api/middleman/*` | GET | Middleman checks | External APIs |
| `/api/model-accuracy/*` | GET | Model accuracy metrics | Python API |
| `/api/notifications/*` | POST | Notification management | Supabase |
| `/api/payment/*` | POST | Payment processing | Payment Gateway |
| `/api/payroll/*` | Various | Payroll calculations | Supabase |
| `/api/price-intelligence/*` | GET | Price forecasts | Python API |
| `/api/public/*` | GET | Public data | Supabase |
| `/api/reports/*` | GET | Report generation | Supabase |
| `/api/setup/*` | POST | Onboarding setup | Supabase |
| `/api/subscription/*` | POST | Subscription management | Payment Gateway |
| `/api/supervisors/*` | Various | Supervisor management | Supabase |
| `/api/v1/*` | Various | API v1 endpoints | Python API |
| `/api/v2/*` | Various | API v2 endpoints | Python API |

### Backend API Endpoints (FastAPI/Python)

| Route | Method | Purpose |
|---|---|---|
| `/health` | GET | Health check with P95 latency |
| `/v1/predict` | POST | ML price prediction |
| `/v1/accuracy` | GET | Model accuracy metrics |
| `/admin/reload-model` | POST | Hot-swap ML model |
| `/webhooks/twilio/inbound` | POST | Twilio WhatsApp inbound |
| `/api/v1/webhooks/twilio/delivery` | POST | Twilio delivery status |
| `/api/v1/webhooks/whatsapp/daily-log` | POST | WhatsApp daily log |
| `/v1/referrals` | POST | Create referral |
| `/v1/referrals/{code}` | GET | Get referral |
| `/v1/referrals/{id}/status` | PUT | Update referral status |
| `/v1/referrers/{id}/stats` | GET | Referrer statistics |
| `/v1/referrals/message` | POST | Generate referral message |
| `/v1/free-alerts/subscribe` | POST | Subscribe to free alerts |
| `/v1/free-alerts/unsubscribe` | POST | Unsubscribe from free alerts |
| `/v1/free-alerts/broadcast` | POST | Broadcast disease alert |
| `/v1/free-alerts/convert` | POST | Convert free subscriber |
| `/v1/free-alerts/stats` | GET | Free alert statistics |
| `/api/v1/whatsapp/analytics/summary` | GET | WhatsApp analytics summary |
| `/api/v1/whatsapp/analytics/heatmap` | GET | WhatsApp engagement heatmap |
| `/api/v1/whatsapp/analytics/churn-risk` | GET | WhatsApp churn risk customers |
| `/api/v1/watermark/events` | GET | Watermark audit events |
| `/api/v1/watermark/coverage` | GET | Watermark coverage metrics |
| `/api/v1/watermark/decode-metrics` | GET | Watermark decode success rate |
| `/api/v1/watermark/events/{id}/action` | POST | Handle watermark event action |
| `/api/v1/auth/otp-request` | POST | Request OTP |
| `/api/v1/auth/otp-verify` | POST | Verify OTP |
| `/api/v1/batch/calculator` | POST | Batch profit calculator |

---

## DATABASE SCHEMA INVENTORY

### Core Tables

| Table | Purpose | Key Columns |
|---|---|---|
| `customers` | Customer/farmer accounts | id, phone_hash, segment, mandi, subscription |
| `predictions` | ML price predictions | id, mandi, predicted_for, p10, p50, p90, confidence |
| `accuracy_log` | Model accuracy tracking | id, prediction_id, actual_price, mape_1d |
| `alerts` | Disease/weather/price alerts | id, type, severity, title_hi, district |
| `batches` | Batch lifecycle management | id, customer_id, batch_id, doc_count, status, current_fcr |
| `feed_logs` | Daily feed consumption | id, batch_id, log_date, morning_feed_kg, evening_feed_kg |
| `mortality_logs` | Daily mortality records | id, batch_id, log_date, count, cause |
| `vaccination_schedules` | Vaccination schedules | id, batch_id, vaccine_name, scheduled_day, status |
| `medication_logs` | Medication/treatment records | id, batch_id, log_date, drug_name, withdrawal_days |
| `weight_logs` | Weight measurements | id, batch_id, log_date, sample_size, avg_weight_kg |
| `health_checklists` | Daily health checks | id, batch_id, log_date, bird_behaviour, appetite |
| `biosecurity_audits` | Biosecurity compliance | id, batch_id, audit_date, score |
| `inventory_items` | Inventory items | id, customer_id, name, category, current_stock |
| `inventory_movements` | Inventory movement log | id, inventory_item_id, movement_type, quantity |
| `vendors` | Vendor/supplier management | id, customer_id, name, contact_person |
| `purchase_orders` | Purchase orders | id, customer_id, vendor_id, po_number, status |
| `purchase_order_items` | PO line items | id, purchase_order_id, inventory_item_id, quantity |
| `farms` | Farm management (integrators) | id, integrator_id, name, district, status |
| `sheds` | Sheds within farms | id, farm_id, name, capacity, shed_type |
| `daily_logs` | Daily farm logs (integrators) | id, batch_id, log_date, deaths_today, feed_consumed_kg, fcr |
| `vaccinations` | Vaccination records (integrators) | id, batch_id, vaccine_name, scheduled_day, status |
| `feed_purchases` | Feed stock purchases | id, farm_id, purchase_date, qty_kg, supplier |
| `health_checklist_state` | HPAI checklist state | id, farm_id, alert_id, items (JSONB) |
| `batch_costs` | Batch cost tracking | id, batch_id, category (chick, labour, overhead), amount |
| `batch_medicine_costs` | Medicine/vaccine costs | id, batch_id, medicine_name, total_cost, clearance_date |
| `batch_sales` | Bird sales/lifting | id, batch_id, birds_sold, total_weight_kg, rate_per_kg, net_revenue |
| `buyers` | Buyer management | id, integrator_id, name, buyer_type, rating |
| `model_registry` | ML model version tracking | id, version, mape_30d, is_champion |

### Materialized Views

| View | Purpose | Refresh Schedule |
|---|---|---|
| `farm_metrics_summary` | Fast portfolio dashboard metrics | Every 30 minutes (pg_cron) |

---

## DISCOVERY SUMMARY

### Total Screens Identified: 67+
### Total Metrics Identified: 50+
### Total Calculation Files: 13 (TypeScript) + 8 (Python) + 10 (SQL functions)
### Total API Endpoints: 60+ (Frontend) + 30+ (Backend)
### Total Database Tables: 30+
### Total Dashboard Components: 200+

### Key Findings:

1. **Architecture**: Monorepo with Next.js 15 frontend, FastAPI backend, PostgreSQL database
2. **Calculation Distribution**: 
   - Frontend: FCR, ROI, feed allocation calculations in TypeScript
   - Backend: ML inference, batch costs, sales calculations in Python
   - Database: Computed fields, triggers for real-time metrics
3. **Data Flow**: 
   - Frontend → Next.js API routes → Supabase (PostgreSQL)
   - Frontend → Python API (FastAPI) for ML predictions
   - IoT → MQTT worker → Supabase
4. **Calculation Complexity**: 
   - Simple metrics: Database computed fields
   - Medium complexity: TypeScript calculator functions
   - High complexity: Python ML models and business logic
5. **Integration Points**:
   - Supabase for primary data storage
   - Python API for ML predictions
   - External APIs for price intelligence, ERP integrations
   - MQTT for IoT sensor data

---

**Step 1 Complete.** Ready for Step 2: Poultry Domain — Identify All Metrics and Calculations.
