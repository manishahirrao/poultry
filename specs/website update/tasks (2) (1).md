# Implementation Plan: PoultryPulse AI Platform

## Overview

Build a full-stack AI-powered poultry price intelligence platform for commercial farmers (10,000+ birds) in the Gorakhpur district. The system is composed of three surfaces: a React Native mobile app (primary), a Next.js 15 web dashboard (B2B/admin), and a WhatsApp notification channel. The backend is a serverless-first data pipeline on Astronomer.io (Airflow) + Supabase + Railway.app, with a LightGBM + TFT ensemble ML model served via FastAPI + ONNX. All data sources are public and zero-cost. Tasks are ordered so each step produces runnable, integrated code. **No customer is onboarded until the 95%+ accuracy gate is cleared.**

## System Prompt Context

Before generating any code for PoultryPulse, the implementation agent MUST internalize all four source documents:

1. **PRD v3.0** — Business logic, customer segments (S1–S6), 95%+ accuracy mandate, revenue phases, Gorakhpur market profile, persona (Rajesh Yadav), public data source inventory
2. **TRD v1.0** — Zero-cost architecture constraints, six-layer stack (L1–L6), Airflow DAG specs, data validation rules (Great Expectations), champion/challenger framework, ₹7,330/mo Phase 0 budget
3. **Architecture v1.0** — ADR decisions, escape hatches, ML ensemble stack, feature engineering spec, ONNX quantisation strategy, Supabase schema, Railway.app deployment
4. **UI/UX Design v1.0** — Design tokens (DS object), Hindi-first typography (Noto Sans Devanagari), 4-tab mobile IA, Apple Design principles, WCAG 2.1 AA requirements, component specs

### Design Principles (Non-Negotiable)

- **Niklas Bubori**: Micro-interactions + clean navigation for the sell-signal flow — every transition ≤220ms, `cubic-bezier(0.4,0,0.2,1)`
- **Aidan Murphy**: B2B dashboard density + data hierarchy for PulsePro flock management — P10/P50/P90 bands always visible
- **Jessica Lin**: Accessibility-first implementation (WCAG 2.1 AA) as non-negotiable baseline — VoiceOver + TalkBack support mandatory
- **Leo Natsume**: Illustrative empty states + onboarding for low-literacy farmer users — no blank screens ever
- **Don Norman**: Human-centered error messages in Hindi — never show raw error codes to S1 farmers

### Output Format

For every code task, output:

```json
{
  "file_path": "relative/path/from/repo/root.ts",
  "purpose": "One-sentence description of this file's responsibility",
  "dependencies": ["list", "of", "npm", "packages"],
  "exports": ["named", "exports", "provided"],
  "code": "```typescript\n// Full implementation here\n```",
  "qa_checks": [
    "Offline mode renders cached data without spinner",
    "Hindi script displays without truncation at 14px",
    "VoiceOver announces sell signal change via aria-live"
  ]
}
```

### Output Constraints

1. **File Separation**: Every logical unit → separate file with clear interface boundary
2. **Type Safety**: All TypeScript files must use strict mode + Zod validation at all API boundaries
3. **Offline-First**: Every data-fetching hook must implement stale-while-revalidate + SQLite (WatermelonDB) fallback
4. **i18n Ready**: No hardcoded strings; all UI text must use i18next keys (`hi` namespace primary, `en` secondary)
5. **Performance Budget**:
   - PulseFarm mobile: FCP <2s on Slow 3G, JS bundle <500KB gzipped
   - PulsePro web: TTI <3s on desktop broadband
6. **ES Modules Only**: No CommonJS. Top-level await allowed. Import aliases via `tsconfig` paths. No `dynamic require()`

---

## Tasks

- [x] 1. Monorepo setup and configuration
  - Scaffold Turborepo monorepo: `npx create-turbo@latest poultrypulse --package-manager pnpm`
  - Create workspace packages: `apps/mobile` (Expo React Native), `apps/web` (Next.js 15), `apps/api` (FastAPI — Python), `packages/ui`, `packages/types`, `packages/i18n`, `packages/config`
  - Configure root `turbo.json` with `build`, `test`, `lint`, `typecheck` pipelines
  - Configure `pnpm-workspace.yaml` and root `package.json` with shared dev dependencies
  - Configure shared `tsconfig.base.json`: strict mode, `verbatimModuleSyntax`, path aliases (`@pp/types`, `@pp/ui`, `@pp/i18n`, `@pp/config`)
  - Set up ESLint + Prettier with shared configs in `packages/config/eslint` and `packages/config/prettier`
  - Configure Husky + lint-staged: typecheck + lint + test on pre-commit
  - Create `.env.example` with all required environment variables (Supabase URL/anon key, Railway API URL, Twilio credentials, FingerprintJS key)
  - _Requirements: TRD §2, Architecture §1_

- [x] 2. Type definitions and shared data layer (`packages/types`)
  - [x] 2.1 Create `packages/types/src/domain.ts` with all domain interfaces
    - `CustomerSegment` union (`'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'S6'`)
    - `MandiSlug` union (`'gorakhpur' | 'deoria' | 'basti' | 'kushinagar' | 'maharajganj'`)
    - `PredictionResult`: `{ p10: number; p50: number; p90: number; drivers: PriceDriver[]; confidence: number; model_version: string; staleness_flag: boolean; predicted_at: string }`
    - `PriceDriver`: `{ factor: string; impact: 'positive' | 'negative'; magnitude: number; description_hi: string }`
    - `SellSignal`: `'SELL_NOW' | 'HOLD' | 'SELL_SOON'` with `signal_strength: number`
    - `AlertType`: `'HPAI_OUTBREAK' | 'WEATHER_EXTREME' | 'PRICE_CRASH' | 'PRICE_SPIKE' | 'FEED_COST_ALERT'`
    - `Alert`: full interface with `id`, `type`, `severity`, `title_hi`, `body_hi`, `district`, `issued_at`, `expires_at`
    - `Subscription`: `{ tier: 'PULSE_FARM' | 'PULSE_PRO' | 'PULSE_INTEL'; status: 'active' | 'trial' | 'expired'; expires_at: string }`
    - `BatchRecord`: `{ batch_id: string; bird_count: number; grow_start: string; expected_harvest_range: [string, string]; feed_cost_total: number }`
    - _Requirements: PRD §4, TRD §3_

  - [x] 2.2 Create `packages/types/src/api.ts` with all API request/response schemas using Zod
    - `PredictionRequestSchema`, `PredictionResponseSchema` (with Zod `.parse()` validation)
    - `AccuracyReportSchema`: `{ mape_30d: number; directional_accuracy_30d: number; conformal_coverage_80: number; as_of: string }`
    - `WebhookPayloadSchema` for Twilio WhatsApp inbound messages
    - Export all Zod schemas + inferred TypeScript types
    - _Requirements: TRD §4, Architecture §3_

  - [x] 2.3 Create `packages/types/src/db.ts` with Supabase database row types (auto-generated shape, manually annotated)
    - `PredictionRow`, `AccuracyLogRow`, `CustomerRow`, `AlertRow`, `BatchRow`, `ModelRegistryRow`
    - _Requirements: Architecture §2_

- [x] 3. Internationalisation layer (`packages/i18n`)
  - [x] 3.1 Create `packages/i18n/src/locales/hi.json` with all Hindi UI strings
    - Namespaces: `common`, `forecast`, `sell_signal`, `alerts`, `calculator`, `onboarding`, `errors`, `subscription`
    - Every key maps to a Hindi string; no English copy in this file
    - Include pluralisation rules for bird counts (`{{count}} पक्षी`)
    - _Requirements: UI/UX §1.1 (Hindi-Primary principle)_

  - [x] 3.2 Create `packages/i18n/src/locales/en.json` with English fallback strings
    - Mirrors `hi.json` key structure exactly; used for B2B web dashboard
    - _Requirements: UI/UX §2.2 (Web Dashboard for integrators)_

  - [x] 3.3 Create `packages/i18n/src/index.ts` configuring i18next
    - Language detection: device locale first, stored preference second, `hi` default
    - Lazy-load locale bundles (never bundle both simultaneously)
    - Export `useTranslation` hook re-export and `i18n` instance
    - _Requirements: TRD Output Constraints §4_

- [ ] 4. Design system (`packages/ui`)
  - [ ] 4.1 Create `packages/ui/src/tokens.ts` exporting the DS design token object
    - All tokens from UI/UX §1.2: `brandGreen700`, `brandGreen50`, `amber500`, `red600`, `neutral900`, `neutral400`
    - Typography scale from UI/UX §1.3 (all 9 styles with font, size, weight, lineHeight)
    - Spacing, radius, elevation, motion tokens
    - _Requirements: UI/UX §1.2, §1.3_

  - [ ] 4.2 Create `packages/ui/src/components/PriceHero.tsx` (React Native)
    - Props: `prediction: PredictionResult`, `isStale: boolean`, `mandiName: string`
    - Renders the 56sp `display-price` number (Noto Sans Devanagari Bold), unit label, confidence band strip (P10–P90 visual range bar)
    - Stale data: amber banner with timestamp (`"यह डेटा {{hours}} घंटे पुराना है"`)
    - Accessible: `accessibilityLabel` on price number, `aria-live="polite"` on price change
    - _Requirements: UI/UX §1.1 (ONE primary number), §3.1 (Price Forecast Hero)_

  - [ ] 4.3 Create `packages/ui/src/components/SellSignalCard.tsx` (React Native)
    - Props: `signal: SellSignal`, `optimalWindowStart: string`, `optimalWindowEnd: string`, `profitEstimate: number`
    - Three states: `SELL_NOW` (amber background, pulsing dot), `HOLD` (green background), `SELL_SOON` (yellow warning)
    - Micro-interaction: signal strength bar animates in on mount (Niklas Bubori principle)
    - `accessibilityRole="status"`, `accessibilityLiveRegion="polite"` for VoiceOver
    - _Requirements: UI/UX §3.2 (Sell Signal Screen), PRD §4.1_

  - [ ] 4.4 Create `packages/ui/src/components/AlertCard.tsx` (React Native + Web)
    - Props: `alert: Alert`, `onDismiss?: () => void`
    - Severity-coded left border: red (HPAI, CRITICAL), amber (weather), green (price opportunity)
    - Hindi title + body text, district badge, time-ago label
    - _Requirements: UI/UX §3.3 (Alert Feed)_

  - [ ] 4.5 Create `packages/ui/src/components/BatchProfitCalculator.tsx` (React Native)
    - Props: `birdCount: number`, `currentPrice: number`, `feedCostPerBird: number`, `daysToHarvest: number`
    - Computes gross revenue, net margin, break-even price
    - All inputs use `KeyboardType='numeric'`, labels in Hindi
    - _Requirements: UI/UX §2.1 (Tab 2: When to Sell?), PRD §4.1_

  - [ ] 4.6 Create `packages/ui/src/components/EmptyState.tsx` (React Native + Web)
    - Props: `variant: 'no-data' | 'offline' | 'error' | 'loading-first'`, `onRetry?: () => void`
    - Illustrative SVG for each variant (Leo Natsume principle — never blank)
    - Hindi copy for each state; retry button for `error` and `offline`
    - _Requirements: UI/UX §1.1 (Offline-First), Design principles_

  - [ ] 4.7 Create `packages/ui/src/components/ConfidenceIntervalBar.tsx` (React Native + Web)
    - Props: `p10: number`, `p50: number`, `p90: number`, `currency?: string`
    - Visual range bar showing P10–P90 spread with P50 marker
    - Tooltip/press reveals: `"80% संभावना है कि भाव ₹{{p10}}–₹{{p90}} के बीच रहेगा"`
    - _Requirements: PRD §6.1 (Conformal Interval Coverage), UI/UX §1.1 (Trust Through Precision)_

  - [ ] 4.8 Create `packages/ui/src/components/OnboardingFlow.tsx` (React Native)
    - 4-step flow: Welcome → Farm Details (bird count, mandi) → Subscription Selection → First Forecast
    - Step 1: Illustrative hero (Leo Natsume), Hindi headline, "शुरू करें" CTA
    - Step 2: Bird count picker (numeric), mandi selector (MandiSlug dropdown)
    - Step 3: Tier cards (PulseFarm ₹2,000/mo, PulsePro ₹8,000/mo) with feature lists
    - Step 4: Live forecast preview — never show empty; use last cached prediction
    - Progress indicator (4 dots), back navigation, skip-to-login link
    - _Requirements: PRD §4 (No free tier), UI/UX §1.1 (Friction = Revenue Loss)_

- [ ] 5. Checkpoint — All `packages/*` build without errors. Type-check passes. i18n keys validated (no missing keys between `hi.json` and `en.json`). Ask the user if questions arise.

- [ ] 6. Data ingestion layer (`apps/pipeline`)
  - [ ] 6.1 Create `apps/pipeline/dags/dag_raw_ingest.py`
    - Airflow DAG: schedule `04:30 IST` daily, `max_active_runs=1`
    - Tasks: `ingest_agmarknet`, `ingest_necc`, `ingest_imd`, `ingest_ncdex_mcx` (parallel fan-out), then `mark_ingestion_complete`
    - `ingest_agmarknet`: calls `data.gov.in` API with free key, filters mandis `['Gorakhpur', 'Deoria', 'Basti', 'Kushinagar', 'Maharajganj']`, writes raw JSON to Supabase `raw_prices/` storage bucket
    - `ingest_necc`: BeautifulSoup4 HTML parse of `necc.co.in/daily-rates`, CSS selector versioning stored in Supabase `scraper_config` table, sanity-check ₹3–₹12/egg range
    - `ingest_imd`: hits `/api/v1/districtnowcast?district=gorakhpur` + `/districtforecast`, fallback to OpenWeatherMap on failure
    - Retry policy: 3 retries, exponential backoff `[30, 90, 270]` seconds; Slack alert on 2 consecutive failures
    - _Requirements: TRD §3.1, Architecture §2.2_

  - [ ] 6.2 Create `apps/pipeline/dags/dag_validate.py`
    - Airflow DAG: schedule `05:00 IST` daily, triggered after `dag_raw_ingest` success
    - Runs Great Expectations checkpoint `daily_completeness` against Supabase raw data
    - Validates all 7 fields per TRD §3.3: `broiler_price_per_kg`, `mandi_name`, `date`, `maize_price_per_quintal`, `temperature_celsius`, `hpai_district_flag`, `completeness_overall`
    - `completeness_overall <95%` → raises `AirflowFailException`, blocks downstream DAGs, Slack alert
    - Rolling median interpolation for `<3 consecutive` missing price values (`pandas fillna(method='ffill', limit=3)`)
    - _Requirements: TRD §3.3 (Data Validation Spec)_

  - [ ] 6.3 Create `apps/pipeline/dags/dag_feature_eng.py`
    - Airflow DAG: schedule `05:15 IST` daily, triggered after `dag_validate` success
    - Computes 45-feature Parquet matrix per TRD §4.3:
      - Lag features: `price_lag_1d`, `price_lag_7d`, `price_lag_14d`, `price_lag_42d`
      - Rolling statistics: `price_rolling_mean_7d`, `price_rolling_std_7d`, `price_rolling_mean_30d`
      - Feed cost ratio: `feed_cost_ratio_42d` (maize price lagged 42 days / broiler price)
      - Festival dummies: major Hindu/Muslim festivals for UP calendar, `is_festival_week`, `days_to_next_festival`
      - Heat stress index: computed from IMD temperature + humidity
      - HPAI flag: `hpai_district_flag`, `hpai_adjacent_district_flag`
      - Google Trends: `search_interest_7d_avg` (chicken/murga queries)
      - NECC weekly: `egg_price_weekly_change`, `national_egg_production_index`
    - Idempotent: re-running for same input date produces identical output
    - All feature functions unit-tested in `tests/test_features.py`
    - _Requirements: TRD §4.3, PRD §6.2 (Week 3–4 feature engineering)_

  - [ ] 6.4 Create `apps/pipeline/dags/dag_model_infer.py`
    - Airflow DAG: schedule `06:00 IST` daily, triggered after `dag_feature_eng` success
    - Calls FastAPI inference endpoint `POST /v1/predict` with feature matrix
    - Writes `PredictionResult` JSON to Supabase `predictions` table
    - Circuit breaker: 3 consecutive inference failures → serve `T-1` prediction with `staleness_flag=True`, never serve stale >24h without explicit flag
    - Sanity check: reject predictions outside `[₹100, ₹250]` range, alert Slack
    - Triggers WhatsApp dispatch via Twilio for all active S1 subscribers
    - _Requirements: TRD §3.2 (dag_model_infer), PRD §6.1_

  - [ ] 6.5 Create `apps/pipeline/dags/dag_accuracy_monitor.py`
    - Airflow DAG: schedule `06:30 IST` daily
    - Compares `T-1` prediction vs today's actual `broiler_price_per_kg`
    - Updates `accuracy_log` table: `mape_1d`, `directional_correct` (boolean), `30d_rolling_mape`, `30d_directional_accuracy`
    - Alert conditions: `30d_rolling_mape >8%` OR `30d_directional_accuracy <90%` → Slack alert to CTO channel
    - _Requirements: TRD §3.2 (dag_accuracy_monitor), PRD §6.1_

  - [ ] 6.6 Create `apps/pipeline/dags/dag_model_retrain.py`
    - Airflow DAG: schedule `02:00 IST Sunday`, `max_active_runs=1`
    - Trains all four models sequentially: ARIMA → Prophet → LightGBM → TFT (Spot GPU burst)
    - Champion/challenger framework per TRD §4.2: new model must beat champion MAPE by >2% to be promoted
    - All three accuracy gates must pass simultaneously before promotion: MAPE <6%, Directional >95%, Conformal Coverage 78–82%
    - Automatic rollback: production MAPE >8% OR directional <90% for 3 consecutive days
    - Model artifacts stored at `models/champion/latest.onnx` and `models/challenger/{run_id}/model.onnx` in versioned S3
    - _Requirements: TRD §4.2 (Champion/Challenger Framework), PRD §6.2_

  - [ ] 6.7 Create `apps/pipeline/dags/dag_watermark_audit.py`
    - Airflow DAG: schedule `08:00 IST` daily
    - Scans 15 configured WhatsApp group monitoring feeds for prediction screenshots
    - Runs steganographic watermark decoder on detected images
    - Any positive watermark match → Slack alert with customer ID for IP enforcement
    - _Requirements: TRD §3.2 (dag_watermark_audit)_

  - [ ] 6.8 Create `apps/pipeline/great_expectations/expectations/daily_completeness.json`
    - Great Expectations suite with all 7 field expectations from TRD §3.3
    - `DataContextV3` checkpoint configuration
    - _Requirements: TRD §3.3_

  - [ ] 6.9 Create `apps/pipeline/tests/test_features.py`
    - Unit tests for every feature computation function in `dag_feature_eng.py`
    - Property test: same input date always produces identical feature matrix (idempotency)
    - Boundary tests: `hpai_district_flag` defaults to 0 on parse failure
    - Feed cost ratio test: `feed_cost_ratio_42d` uses 42-day-lagged maize price, not current
    - _Requirements: TRD §4.3 (All feature functions unit-tested)_

- [ ] 7. ML inference API (`apps/api`)
  - [ ] 7.1 Create `apps/api/main.py` — FastAPI application entry point
    - Lifespan handler: load ONNX model from `models/champion/latest.onnx` on startup
    - Routes: `POST /v1/predict`, `GET /v1/accuracy`, `GET /v1/health`, `POST /admin/reload-model`
    - CORS: allow Vercel web domain + Railway.app internal network only
    - Structured logging with `structlog`: every request logs `model_version`, `inference_latency_ms`, `mandi`
    - _Requirements: TRD §2 (L4 ML Serving), Architecture §3_

  - [ ] 7.2 Create `apps/api/inference/predictor.py`
    - `Predictor` class wrapping ONNX Runtime `InferenceSession`
    - `predict(feature_matrix: pd.DataFrame) -> PredictionResult`: runs ensemble inference, returns `{p10, p50, p90, drivers, confidence, model_version}`
    - ONNX INT8 quantised model: target <200ms P95 latency on Railway.app CPU (1 vCPU)
    - `reload_model()`: hot-swaps champion ONNX without restarting the process
    - _Requirements: TRD §2 (L4 ONNX quantised), Architecture §3.1_

  - [ ] 7.3 Create `apps/api/inference/sell_signal.py`
    - `compute_sell_signal(prediction: PredictionResult, batch: BatchRecord) -> SellSignal`
    - `SELL_NOW`: P50 within 3 days of peak, directional confidence >90%
    - `SELL_SOON`: upward trend forecast, harvest window ≤7 days out
    - `HOLD`: P50 trending up, harvest window >7 days, confidence >80%
    - Signal strength: `float` 0.0–1.0 based on directional confidence × interval tightness
    - _Requirements: PRD §4.1 (Rajesh persona — sell signal is the core value)_

  - [ ] 7.4 Create `apps/api/tests/test_predictor.py`
    - Unit test: predictor returns valid `PredictionResult` with all required fields
    - Unit test: `p10 <= p50 <= p90` invariant always holds
    - Unit test: `reload_model()` updates model version without raising
    - Integration test: end-to-end latency <200ms on test feature matrix
    - _Requirements: TRD §4.2 (Accuracy Gates)_

- [x] 8. Supabase schema and migrations (`apps/db`)
  - [x] 8.1 Create `apps/db/migrations/001_initial_schema.sql`
    - Tables: `customers`, `predictions`, `accuracy_log`, `alerts`, `batches`, `model_registry`, `scraper_config`, `anomaly_log`, `necc_weekly`, `macro_data`
    - `customers`: `id uuid pk`, `phone text unique`, `segment CustomerSegment`, `mandi MandiSlug`, `bird_count int`, `subscription jsonb`, `device_fingerprint text`, `created_at timestamptz`
    - `predictions`: `id uuid pk`, `mandi MandiSlug`, `predicted_for date`, `p10 numeric`, `p50 numeric`, `p90 numeric`, `drivers jsonb`, `confidence numeric`, `model_version text`, `staleness_flag bool`, `created_at timestamptz`
    - `accuracy_log`: `id uuid pk`, `prediction_id uuid fk`, `actual_price numeric`, `mape_1d numeric`, `directional_correct bool`, `evaluated_at timestamptz`
    - Row Level Security: `customers` — users can only read/write their own row; `predictions` — all authenticated reads; `accuracy_log` — admin-only write
    - PostGIS: `customers` table adds `farm_location geography(Point, 4326)` for geo queries
    - _Requirements: TRD §2 (L2 Supabase), Architecture §2_

  - [x] 8.2 Create `apps/db/migrations/002_accuracy_functions.sql`
    - PostgreSQL function `compute_rolling_mape(days int)` → returns rolling MAPE for last N days
    - PostgreSQL function `compute_directional_accuracy(days int)` → returns directional accuracy %
    - Materialized view `mv_accuracy_dashboard`: refreshed daily, used by web dashboard
    - _Requirements: TRD §3.2 (dag_accuracy_monitor)_

  - [x] 8.3 Create `apps/db/seed/dev_seed.sql`
    - 30 days of synthetic predictions for `gorakhpur` mandi (realistic ₹140–₹175 range)
    - 3 test customer accounts (S1, S2, admin)
    - Sample alerts (1 HPAI, 1 weather, 1 price spike)
    - _Requirements: Development setup_

- [x] 9. Checkpoint — Database migrations apply cleanly. API health check returns 200. Pipeline DAGs load without import errors. Ask the user if questions arise.

- [ ] 10. Mobile app — Foundation (`apps/mobile`)
  - [ ] 10.1 Create `apps/mobile/app/_layout.tsx` — root Expo Router layout
    - Font loading: `useFonts` for Noto Sans Devanagari (400, 500, 600, 700) — mandatory, blocks render
    - i18next initialisation: language detection from device locale, `hi` default
    - Supabase auth state listener: unauthenticated → redirect to `/onboarding`
    - WatermelonDB initialisation: SQLite offline database for cached predictions and alerts
    - Global error boundary with Hindi error message + retry button (Don Norman principle)
    - _Requirements: UI/UX §1.1 (Hindi-Primary, Offline-First), TRD Output Constraints_

  - [ ] 10.2 Create `apps/mobile/app/(auth)/onboarding.tsx`
    - Renders `OnboardingFlow` component from `@pp/ui`
    - On completion: writes farm profile to Supabase `customers` table, navigates to `/(tabs)/forecast`
    - Handles Supabase auth OTP via phone number (SMS/WhatsApp OTP)
    - _Requirements: UI/UX §3.4 (Onboarding), PRD §4 (no free tier — subscription selection in step 3)_

  - [ ] 10.3 Create `apps/mobile/app/(tabs)/_layout.tsx` — bottom tab navigator
    - 4 tabs matching UI/UX §2.1: आज का भाव · बेचें कब? · बाज़ार समाचार · मेरा खाता
    - Tab bar: `brandGreen700` background, white active icon, `neutral400` inactive
    - Haptic feedback on tab switch (`expo-haptics`)
    - Active subscription gate: expired subscription → show paywall modal over any tab
    - _Requirements: UI/UX §2.1 (4-tab navigation)_

  - [ ] 10.4 Create `apps/mobile/app/(tabs)/forecast.tsx` — Tab 1: आज का भाव
    - Server-state: `useForecast(mandi)` hook (see task 10.8) returning `PredictionResult`
    - Renders `PriceHero`, `ConfidenceIntervalBar`, price driver list (top 3 factors), 30-day chart (`react-native-gifted-charts`)
    - Pull-to-refresh triggers fresh fetch; stale indicator shown if offline
    - District selector: bottom sheet with `MandiSlug` options (Gorakhpur pre-selected for S1)
    - `aria-live="polite"` on price — VoiceOver announces updates
    - _Requirements: UI/UX §3.1 (Price Forecast Hero Screen), PRD §4.1_

  - [ ] 10.5 Create `apps/mobile/app/(tabs)/sell-signal.tsx` — Tab 2: बेचें कब?
    - Renders `SellSignalCard`, optimal harvest window picker, `BatchProfitCalculator`
    - Batch data: loaded from WatermelonDB `batches` table (user-entered)
    - "बैच जोड़ें" FAB → modal to add new batch (bird count, grow start date, feed cost)
    - _Requirements: UI/UX §3.2 (Sell Signal Screen)_

  - [ ] 10.6 Create `apps/mobile/app/(tabs)/alerts.tsx` — Tab 3: बाज़ार समाचार
    - Alert feed sorted by severity then `issued_at`; renders `AlertCard` for each
    - Filter chips: सभी (All) · बीमारी (Disease) · मौसम (Weather) · भाव (Price)
    - Middleman Check tool: enter trader's quoted price → shows spread vs AGMARKNET mandi price → `"आपका व्यापारी ₹{{spread}}/kg कम दे रहा है"`
    - Feed price tracker: NCDEX maize + soya 7-day chart
    - _Requirements: UI/UX §2.1 (Tab 3), PRD §3.4 (Middleman Exploitation problem)_

  - [ ] 10.7 Create `apps/mobile/app/(tabs)/account.tsx` — Tab 4: मेरा खाता
    - Subscription status card: tier badge, expiry date, days remaining, "नवीनीकृत करें" (Renew) CTA
    - Notification preferences: WhatsApp toggle, push notification toggle, alert type selection
    - Accuracy scorecard: model's last-30-day directional accuracy shown to user as trust signal
    - Support: WhatsApp CTA deep-link to support number
    - Logout with confirmation dialog
    - _Requirements: UI/UX §2.1 (Tab 4), PRD §4.1 (Willingness to pay reinforcement)_

  - [ ] 10.8 Create `apps/mobile/hooks/useForecast.ts`
    - `useForecast(mandi: MandiSlug): { data: PredictionResult | null; isLoading: boolean; isStale: boolean; error: Error | null; refetch: () => void }`
    - Stale-while-revalidate: serve WatermelonDB cached prediction immediately, fetch fresh in background
    - Offline detection: `@react-native-community/netinfo`; if offline, serve cache with `isStale=true`
    - Never show spinner if cache exists — empty state only on first-ever load (`EmptyState variant="loading-first"`)
    - Cache TTL: 4 hours; `isStale=true` if cache >4h old
    - _Requirements: TRD Output Constraints §3 (Offline-First), UI/UX §1.1_

  - [ ] 10.9 Create `apps/mobile/hooks/useAlerts.ts`
    - `useAlerts(filters?: AlertType[]): { alerts: Alert[]; unreadCount: number; markRead: (id: string) => void }`
    - Supabase Realtime subscription for new alerts; falls back to polling (30s interval) if WebSocket fails
    - WatermelonDB persistence: alerts synced locally, survive app restart
    - _Requirements: UI/UX §3.3 (Alert Feed)_

  - [ ]* 10.10 Write E2E tests for mobile critical paths (`apps/mobile/e2e/`)
    - Test: forecast screen shows cached price within 1s on Slow 3G simulation
    - Test: sell signal card announces signal change via accessibility label
    - Test: alert with HPAI type shows red border and correct Hindi text
    - Test: offline mode shows stale banner, not empty state
    - _Requirements: UI/UX §1.1, TRD Output Constraints_

- [x] 11. Checkpoint — Mobile app builds for both iOS and Android. All 4 tabs render with mock data. Hindi font displays correctly at all type scales. Offline mode verified. Ask the user if questions arise.

- [ ] 12. WhatsApp notification channel
  - [ ] 12.1 Create `apps/api/whatsapp/dispatcher.py`
    - `dispatch_daily_forecast(customer_id: str, prediction: PredictionResult, sell_signal: SellSignal) -> None`
    - Twilio WhatsApp API call to `whatsapp:+91{{phone}}`
    - Message template (Hindi): `"🐔 आज का भाव — {{mandi}}\n\n₹{{p50}}/kg (₹{{p10}}–₹{{p90}} संभावित)\n\nसंकेत: {{signal_text}}\n\nकारण: {{driver_1}}\n\n—PoultryPulse AI"`
    - Steganographic watermark: embeds `customer_id` in message metadata for IP audit trail
    - Delivery receipt webhook: updates `whatsapp_delivery_log` table
    - Rate limiting: max 1 message per customer per day; idempotency key = `customer_id + date`
    - _Requirements: TRD §2 (L6 Comms), Architecture §1.2 (Twilio ADR)_

  - [ ] 12.2 Create `apps/api/whatsapp/inbound_handler.py`
    - Handles Twilio inbound webhook `POST /webhooks/twilio/inbound`
    - Parses `WebhookPayloadSchema` with Zod-equivalent Pydantic model
    - Intent detection: "भाव" / "price" → send current forecast; "मदद" / "help" → send menu; "बंद" / "stop" → unsubscribe
    - Responds within Twilio's 5-second webhook timeout
    - _Requirements: TRD §2 (L6 WhatsApp), UI/UX §2.3 (WhatsApp Channel)_

- [ ] 13. Web dashboard — Foundation (`apps/web`)
  - [ ] 13.1 Create `apps/web/app/layout.tsx` — root Next.js 15 layout
    - Supabase SSR auth via `@supabase/ssr`
    - Left sidebar navigation matching UI/UX §2.2 (8 nav sections)
    - Auth guard: unauthenticated → `/login`; S1 customer (no web access) → `/mobile-only` page
    - Noto Sans Devanagari + Inter fonts via `next/font/google`
    - Skip link `<a href="#main-content">` as first focusable element (WCAG 2.1 AA)
    - _Requirements: UI/UX §2.2, Architecture §1.2 (Next.js 15 ADR)_

  - [ ] 13.2 Create `apps/web/app/(dashboard)/overview/page.tsx`
    - Server component: fetches accuracy metrics from Supabase materialized view `mv_accuracy_dashboard`
    - Renders: MRR summary card, 30-day directional accuracy widget (% with trend arrow), district coverage map (Leaflet.js with Gorakhpur + adjacent districts highlighted), active customer count
    - Accuracy widget: green if >95%, amber if 90–95%, red if <90% — trust signal for admin
    - _Requirements: UI/UX §2.2 (Overview nav section)_

  - [ ] 13.3 Create `apps/web/app/(dashboard)/price-intelligence/page.tsx`
    - Client component; fetches 30-day prediction history
    - Recharts `AreaChart` with P10/P50/P90 bands (Aidan Murphy density principle — all three bands always visible)
    - Overlay: actual prices as scatter dots vs predicted P50 line
    - CSV export: `GET /api/export/predictions?mandi={{mandi}}&from={{date}}&to={{date}}`
    - Mandi selector: dropdown for S2+ users (S1 locked to their registered mandi)
    - _Requirements: UI/UX §2.2 (Price Intelligence nav section)_

  - [ ] 13.4 Create `apps/web/app/(dashboard)/accuracy/page.tsx` — admin only
    - 30-day rolling MAPE chart, directional accuracy trend, conformal coverage gauge
    - Three accuracy gate indicators: MAPE <6% ✓/✗, Directional >95% ✓/✗, Coverage 78–82% ✓/✗
    - Model log: champion version, promoted_at, challenger run history
    - Alert banner if any gate is red: `"चेतावनी: मॉडल सटीकता लक्ष्य से नीचे है"`
    - Access control: `role === 'admin'` check via Supabase RLS; redirect to 403 otherwise
    - _Requirements: TRD §4.2 (Champion/Challenger), PRD §6.1 (95%+ mandate)_

  - [ ] 13.5 Create `apps/web/app/(dashboard)/customers/page.tsx` — admin only
    - Server component: paginated customer list from Supabase
    - Columns: phone (masked), segment, mandi, bird_count, subscription tier, last active, WhatsApp delivery rate
    - Row actions: view detail, toggle subscription, export usage
    - _Requirements: UI/UX §2.2 (Customers nav section)_

  - [ ] 13.6 Create `apps/web/app/api/export/predictions/route.ts`
    - `GET /api/export/predictions` — streams CSV of prediction history
    - Auth: Supabase session check; S2+ access only
    - Parameters: `mandi`, `from`, `to` (max 90-day range)
    - Sets `Content-Disposition: attachment; filename="poultrypulse_forecast_{{mandi}}_{{date}}.csv"`
    - _Requirements: UI/UX §2.2 (Price Intelligence → Download)_

  - [ ] 13.7 Create `apps/web/app/(auth)/login/page.tsx`
    - Phone OTP login (Supabase Auth)
    - Hindi copy: `"अपना मोबाइल नंबर दर्ज करें"`
    - After login: redirect to `/overview` for B2B roles, `/mobile-only` for S1
    - _Requirements: Architecture §2 (Supabase Auth)_

- [x] 14. SEO and metadata (`apps/web`)
  - All dashboard pages export `generateMetadata` with descriptive titles (English for B2B)
  - `app/robots.ts`: disallow all crawling of `/dashboard` routes; allow `/` (marketing page if added)
  - Open Graph tags on any public-facing pages
  - _Requirements: Architecture §1.2 (Next.js 15 ADR)_

- [x] 15. Checkpoint — All three accuracy gates validated on 90-day holdout data. Web dashboard loads with real Supabase data. WhatsApp dispatch sends test message. Ask the user if questions arise.

- [ ] 16. Accessibility audit and polish
  - Mobile app: verify VoiceOver (iOS) and TalkBack (Android) announce price changes via `accessibilityLiveRegion`
  - Mobile app: verify all touchable elements have `accessibilityLabel` in Hindi
  - Mobile app: verify minimum touch target 44×44dp on all interactive elements (WCAG 2.1 AA)
  - Web dashboard: verify skip link is first focusable element and becomes visible on focus
  - Web dashboard: verify `focus-visible` outline on all interactive elements
  - Web dashboard: verify all table columns have `<th scope="col">` and screen-reader accessible headers
  - Hindi typography: verify Noto Sans Devanagari renders correctly for all conjuncts at 13sp (caption scale)
  - Offline: verify stale banner appears (never silent staleness), never shows raw spinner if cache exists
  - _Requirements: UI/UX §1.1, Design principles (Jessica Lin)_

- [ ] 17. Performance audit and optimisation
  - Mobile: measure FCP on Slow 3G via React Native performance monitor; target <2s
  - Mobile: measure JS bundle size; target <500KB gzipped; use `expo-bundle-analyzer`
  - Web: measure TTI on desktop broadband via Lighthouse; target <3s
  - ONNX inference: measure P95 latency on Railway.app CPU; target <200ms; optimise if needed
  - Image optimisation: all mobile images in WebP format, max 200KB per image
  - _Requirements: TRD Output Constraints §5 (Performance Budget)_

- [x] 18. 95%+ Accuracy gate — Pre-launch validation
  - Run automated backtesting on 6-month out-of-sample Gorakhpur holdout
  - Generate accuracy gate report: Directional >95% ✓/✗, MAPE <6% ✓/✗, Conformal Coverage 78–82% ✓/✗
  - Founding team manually validates 30+ consecutive daily predictions against Gorakhpur mandi visits
  - Document validation results in `docs/accuracy_validation_report.md`
  - **BLOCKER**: No customer is onboarded, no subscription is enabled, no press/investor communication before all three gates are cleared and manual validation is complete
  - _Requirements: PRD §6 (NON-NEGOTIABLE accuracy mandate)_

- [x] 19. Final checkpoint — All tests pass. Accuracy gate cleared. Mobile app submitted to App Store and Play Store. WhatsApp Business API number verified. Supabase production environment configured with RLS. Railway.app production deployment live. Ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements from PRD v3.0, TRD v1.0, Architecture v1.0, and UI/UX Design v1.0
- Checkpoints ensure incremental validation at logical milestones
- **Task 18 (Accuracy Gate) is an absolute blocker** — no commercial activity before all three gates pass. This is the single most important constraint in the entire plan.
- The inquiry/sell-signal flow has zero human intervention — all signals are model-generated, watermarked, and audited automatically
- Phase 0 total infrastructure cost target: ₹7,330/month (per TRD §1)
- Gorakhpur district launch only in Phase 0; expansion to adjacent districts begins Phase 1 (Month 4–8) only after 5+ paying S1 customers
