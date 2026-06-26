**PoultryPulse AI — System Architecture Document**    |    CONFIDENTIAL    |    v1.0 · May 2026

**PoultryPulse AI**

**System Architecture Document**

For Engineers · Zero-Cost Pre-Revenue Architecture · v1.0 · May 2026

|**Author**|**Coverage**|**Infra Budget**|**Status**|
| :- | :- | :- | :- |
|Senior Architect — 25+ yr|Phase 0 (M0–4) + Phase 1 (M4–8)|₹5,180/mo (Phase 0)|DRAFT — Engineering Use|

**CONFIDENTIAL — Engineering & Investor Use Only**


# **1. Architecture Overview — Principles & Layers**
This document is the authoritative technical reference for PoultryPulse AI infrastructure. Every technology choice passes three filters: (1) zero or near-zero cost at zero users, (2) sub-linear cost scaling with revenue, (3) no vendor lock-in before Series A. Familiarity or comfort are not selection criteria.

## **1.1 The Six Architectural Layers**

|**Layer**|**Name**|**Technology**|**Monthly Cost (Phase 0)**|**Phase**|
| :- | :- | :- | :- | :- |
|L1|Data Ingestion|Apache Airflow on Astronomer.io Free Tier|₹0 (free tier)|0|
|L2|Data Store|Supabase PostgreSQL (Mumbai — ap-south-1)|₹0 → ₹2,100 (at 500MB+)|0|
|L3|ML Training|Railway.app CPU + AWS Spot g4dn.xlarge GPU burst|~₹2,500/mo (3 runs)|0|
|L4|ML Serving|FastAPI + ONNX Runtime on Railway.app Hobby|~₹415/mo (always-on)|0|
|L5|Application|Next.js 15 on Vercel Edge + React Native (Expo)|₹0 (free tier)|0|
|L6|Comms & Security|Twilio WhatsApp + Cloudflare WAF + FingerprintJS Pro|~₹2,400/mo|0–1|

## **1.2 Architecture Decision Record (ADR) Summary**
Each technology decision has a documented rationale and explicit escape hatch. Engineers must read this before questioning a technology choice.

|**Decision**|**Chosen**|**Alternatives Considered**|**Why Chosen**|**Escape Hatch**|
| :- | :- | :- | :- | :- |
|Orchestration|Astronomer.io (Airflow)|Prefect Cloud, Dagster Cloud, cron + Lambda|Free tier = 10 DAGs. Phase 0 needs 9 DAGs. Industry standard. No retraining required.|Self-hosted Airflow on Railway.app (~₹750/mo) if >10 DAGs needed at Month 3.|
|Database|Supabase PostgreSQL|PlanetScale, Neon, Railway.app Postgres, Firebase|Built-in Auth, RLS, PostGIS for geo queries, Realtime push. ap-south-1 region. DPDP compliant.|Managed PostgreSQL on Railway.app or Neon — schema is standard Postgres, zero migration needed.|
|Frontend|Next.js 15 + Vercel|Remix + Cloudflare Pages, SvelteKit, CRA|SSR + ISR for SEO. Edge functions for serverless API. Free tier = 100K req/month. OG team familiarity.|Cloudflare Pages (free) + self-hosted API on Railway.app if Vercel pricing increases.|
|Mobile|React Native (Expo)|Flutter, native Swift/Kotlin, Ionic|Single JS codebase for iOS + Android. OTA updates via Expo EAS. Large ecosystem for poultry data viz.|Rewrite to Flutter for Phase 2 if performance issues arise (not expected at Phase 0 scale).|
|ML Serving|FastAPI + ONNX on CPU|TorchServe + GPU, Triton Inference Server, BentoML|ONNX INT8 quantisation: TFT inference <200ms on CPU. Railway.app Hobby = ₹415/mo vs ₹4,100+ for GPU.|Fly.io (similar cost) or Render.com. Both support Docker. Migration = redeploy same container.|
|Comms|Twilio WhatsApp Business API|Meta Business API direct, Gupshup, Wati|Reliable delivery, ₹1.20/msg, webhooks for delivery receipts. Fastest to production.|Meta Business API direct at >10K msg/month — cost drops significantly at volume.|
|Security/WAF|Cloudflare WAF + FingerprintJS Pro|AWS WAF (expensive), Vercel Firewall (limited)|Cloudflare free tier: unlimited bandwidth, WAF, DDoS. FingerprintJS Pro: 99.5% device accuracy.|Vercel Firewall (free) for WAF if Cloudflare has issues. FingerprintJS → custom device ID if cost rises.|

|**RULE**|No architecture decision is final until it has a documented escape hatch. "We are locked into X" is a red flag that must be escalated. Every vendor must be replaceable within 2 weeks of engineering effort.|
| :-: | :- |


# **2. Data Ingestion & Pipeline Architecture**
All data is sourced from public, zero-cost APIs and web scraping. The pipeline runs daily on Astronomer.io free tier using Apache Airflow DAGs. No proprietary data, no paid feeds, no dark patterns.

## **2.1 Airflow DAG Inventory**

|**DAG Name**|**Schedule (IST)**|**Runtime**|**Depends On**|**Output**|**Phase 0 Limit Risk**|
| :- | :- | :- | :- | :- | :- |
|dag\_raw\_ingest|04:30 daily|8–12 min|None (root)|Raw JSON/CSV → Supabase raw\_prices/ bucket|LOW — runs once/day|
|dag\_validate|05:00 daily|3–5 min|dag\_raw\_ingest|Validated dataset or failure report|LOW|
|dag\_feature\_eng|05:15 daily|5–8 min|dag\_validate|45-col Parquet feature matrix|LOW|
|dag\_model\_infer|06:00 daily|2–3 min|dag\_feature\_eng|Prediction JSON → Supabase predictions table|LOW|
|dag\_accuracy\_monitor|06:30 daily|2 min|dag\_model\_infer|MAPE/directional accuracy update to accuracy\_log|LOW|
|dag\_model\_retrain|02:00 Sunday|45–90 min|dag\_feature\_eng|New model artifacts → versioned S3 + eval report|MEDIUM — longest running|
|dag\_watermark\_audit|08:00 daily|5 min|None (independent)|Scan WhatsApp feeds for watermark matches|LOW|
|dag\_necc\_weekly|Sun 05:00|3 min|None|NECC weekly production stats → necc\_weekly table|LOW|
|dag\_monthly\_reports|1st of month 08:00|15 min|None|FAO + USDA + UP Agri download → macro\_data table|LOW|

|**LIMIT**|Astronomer.io Free Tier: 5 workers, 10 DAGs, 20 concurrent tasks. Phase 0 uses 9 DAGs — within limit. Plan migration to self-hosted at Month 3 before Phase 1 adds district DAGs. Migration = 2-hour operation. All DAG code lives in Git.|
| :-: | :- |

## **2.2 Data Source Technical Specs**

|**Source**|**Method**|**Airflow DAG**|**Rate Limit**|**Error Strategy**|
| :- | :- | :- | :- | :- |
|AGMARKNET (data.gov.in)|REST API — free key via data.gov.in registration. JSON response.|dag\_raw\_ingest: hits /agmarknet, filters Gorakhpur/Deoria/Basti/Kushinagar mandis at 04:30 IST|500 req/day (free key). No commercial restriction.|Retry 3× (exp backoff: 30s, 90s, 270s). Failure: serve T-1 with staleness=True. Slack alert on 2 consecutive fails.|
|NECC (necc.co.in)|Web scraping: BeautifulSoup4 + requests. HTML table parse. CSS selector versioning in DB.|dag\_raw\_ingest: 05:00 IST. Parse /daily-rates HTML. Validate price range ₹3–₹12/egg.|No explicit limit. Cache 24h. Never >10 req/day.|If HTML structure changes: fallback T-1, alert. CSS selector patterns stored in DB — alert if selector returns empty.|
|IMD (api.imd.gov.in)|REST API. No auth required. JSON.|dag\_raw\_ingest: 06:00 IST. /districtnowcast and /districtforecast for Gorakhpur. Extract temp, humidity, rainfall, heat wave flag.|Officially free, unlimited. Government service.|Retry 5× (10s intervals). Fallback: OpenWeatherMap free tier (1K calls/day) using Gorakhpur lat/lon.|
|DAHDF (dahd.gov.in)|PDF scraping: tabula-py for table extraction. Weekly disease bulletin.|dag\_dahdf\_weekly: Monday 07:00 IST. Download latest bulletin PDF. Extract HPAI alert table.|Public government PDFs. No ToS restriction.|PDF structure change → manual review. hpai\_district\_flag defaults to 0 on parse failure (conservative — avoids false positive).|
|NCDEX / MCX|Web scraping delayed prices page + CSV historical download.|dag\_raw\_ingest: 16:30 IST (after market close). Maize/soya (NCDEX) + palm oil/soya oil futures (MCX).|15-min delayed data is publicly displayed. Respect robots.txt.|CAPTCHA detection → switch MCX as proxy for NCDEX + alert. Random delay 2–5s between requests.|
|Google Trends (pytrends)|pytrends Python library (unofficial). Queries: "chicken price Gorakhpur", "murga rate UP".|dag\_trends\_weekly: Sunday 09:00 IST. 7-day interest score. Cache aggressively.|Unofficial API. Max 10 calls/day. 429 backoff.|Exponential backoff on 429. If blocked: use 5-day rolling cache value with staleness flag.|

## **2.3 Data Validation Spec (Great Expectations)**

|**Field**|**Expectation**|**Fail Action**|**Criticality**|
| :- | :- | :- | :- |
|broiler\_price\_per\_kg|Between ₹80–₹250. Not null.|Reject row. Interpolate from rolling median if <3 consecutive missing (pandas ffill, limit=3).|CRITICAL|
|mandi\_name|In allowlist: [Gorakhpur, Deoria, Basti, Kushinagar, Maharajganj]. Not null.|Reject entire record. Log to anomaly\_log.|HIGH|
|date|Not null. Not future. Not older than T-2 (stale data gate).|Reject. Alert if date gap >2 days for any mandi.|CRITICAL|
|maize\_price\_per\_quintal|Between ₹1,200–₹4,000. Not null for feature computation dates.|Interpolate from NCDEX historical. Set maize\_price\_imputed=True flag.|HIGH|
|temperature\_celsius|Between -5 and 55 (Gorakhpur district). Not null.|Use IMD forecast value for that day if actual missing.|MEDIUM|
|hpai\_district\_flag|Boolean 0 or 1. Not null.|Default to 0 on parse failure (conservative).|HIGH|
|completeness\_overall|>95% non-null across full feature matrix before feature engineering.|BLOCK feature engineering. Alert Slack. Do not serve stale predictions.|CRITICAL|


# **3. ML Architecture — 95%+ Pre-Launch Accuracy System**
The model must achieve ALL THREE accuracy gates simultaneously before any customer is onboarded: (1) Directional Accuracy >95%, (2) MAPE <6%, (3) Conformal Interval Coverage 78–82% for stated 80% intervals. Missing one gate = not live.

## **3.1 Model Ensemble Stack**

|**Model**|**Library**|**Compute**|**Cost/Run**|**Output**|**Role in Ensemble**|
| :- | :- | :- | :- | :- | :- |
|ARIMA(0,1,4)|statsmodels|Railway.app CPU (1 vCPU, 512MB)|~₹12/run|.pkl artifact|Trend baseline. Handles first-order differencing. Config from Karnataka paper.|
|Facebook Prophet|prophet|Railway.app CPU (1 vCPU, 512MB)|~₹15/run|.pkl artifact|Seasonality baseline. UP festivals + India holidays calendar. Confidence intervals.|
|LightGBM|lightgbm|Railway.app CPU (2 vCPU, 1GB)|~₹25/run|.pkl + .onnx|Causal feature model. 45 features. 50-trial Optuna tuning. TimeSeriesSplit n=5.|
|Temporal Fusion Transformer|pytorch-forecasting|AWS Spot g4dn.xlarge (1× T4 GPU)|~₹800/run (spot)|.pt → .onnx|P10/P50/P90 quantile outputs. Attention weights as explainability. Primary model.|
|Ensemble Stacking (Meta-learner)|sklearn Ridge regression|Railway.app CPU|~₹10/run|Blend weights JSON|Learns optimal per-season weights. Input: base model predictions on validation set.|
|Conformal Calibration|MAPIE library|Railway.app CPU|~₹8/run|Calibration scalars|Validates coverage: 78–82% for 80% intervals. Block promotion if coverage fails.|

## **3.2 Champion / Challenger Framework**
Every new model artifact must beat the current production champion before deployment. This prevents model regression — the most common cause of accuracy degradation in live systems.

|**Stage**|**Condition**|**Action**|**Implementation Detail**|
| :- | :- | :- | :- |
|Champion Load|Always — production model is champion.|Load current champion from S3 versioned artifact.|S3 key: models/champion/latest.onnx. Metadata in Supabase model\_registry table (mape, directional, version).|
|Challenger Train|Weekly Sunday retrain DAG completes.|New artifacts generated. Evaluation begins.|Stored at: models/challenger/{run\_id}/model.onnx. Never overwrites champion until promotion.|
|Promotion Eval|Challenger MAPE < champion MAPE - 2%.|Check all three gates simultaneously.|If challenger\_mape > (champion\_mape - 0.02): discard. Slack alert: "Challenger rejected — champion retained."|
|Promotion Gate|ALL: MAPE <6%, Directional >95%, Conformal 78–82%.|Challenger replaces champion. Hot-reload inference.|Copy challenger ONNX to models/champion/latest.onnx. Update model\_registry. POST /admin/reload-model on Railway.app.|
|Rollback Trigger|Production MAPE >8% OR directional <90% for 3 consecutive days.|Automatic rollback to previous champion. Alert CTO.|Copy models/champion/previous.onnx to latest.onnx. Update model\_registry. Investigate root cause before next promotion.|

## **3.3 ONNX Quantisation Pipeline**

|**COST IMPACT**|Without quantisation: TFT requires GPU → Railway.app GPU tier ~₹4,100/mo always-on. With INT8 ONNX quantisation: CPU inference <180ms P95 on Railway.app Hobby ~₹415/mo. Saving: ₹3,685/month = ₹44,220/year before first customer.|
| :-: | :- |

|**Step**|**Tool / Command**|**Runtime**|**Output**|**Validation Gate**|
| :- | :- | :- | :- | :- |
|1\. PyTorch → ONNX Export|torch.onnx.export(model, dummy\_input, "model.onnx", opset\_version=17)|~2 min|model.onnx (full precision, ~120MB)|onnxruntime inference matches PyTorch output within 1e-5 tolerance on 100 test inputs.|
|2\. INT8 Dynamic Quantisation|onnxruntime.quantization.quantize\_dynamic("model.onnx", "model\_quant.onnx", weight\_type=QuantType.QInt8)|~5 min|model\_quant.onnx (~36MB, 70% smaller)|Quantised MAPE within 0.5% of full-precision on validation set. If degradation >0.5%: use static quantisation with calibration dataset.|
|3\. Accuracy Regression Test|Run quantised model on 30-day holdout. Compare MAPE + directional accuracy vs full-precision baseline.|~3 min|Regression report (PASS/FAIL)|MUST PASS: |quant\_mape - fp\_mape| < 0.5%. |quant\_directional - fp\_directional| < 1%. Block deployment if either fails.|
|4\. Deploy to Railway.app|railway up --detach. Model loaded from S3 URL at container startup (not bundled in image).|~3 min|Inference endpoint live at /v1/predict|Health check: GET /health → {model\_version, mape\_30d, quantised: true}. Load test: 100 concurrent requests <200ms P95.|

## **3.4 Feature Engineering — 45-Feature Specification**

|**Feature Name**|**Computation**|**Source**|**Null Policy**|**Unit Test**|
| :- | :- | :- | :- | :- |
|feed\_cost\_ratio\_lag42|broiler\_price[t] / maize\_price[t-42]. Requires maize from 42 trading days prior.|dag\_ncdex\_daily|Forward-fill ≤3 days. Error if >3 consecutive missing.|test\_feed\_ratio\_lag: ratio=1.0 when prices equal. Verify lag=42 on known dates.|
|festival\_7d\_flag|If within 7 days of 12 UP Hindu/Muslim festivals: 1, else 0. (Diwali, Eid×2, Holi, Navratri, Christmas, Muharram, Raksha Bandhan + 4 UP-specific)|Static calendar (updated annually)|Never null — always 0 or 1.|test\_festival\_flag: Diwali 2024 → 1 for 7-day window. Non-festival → 0.|
|heat\_stress\_7d|Count of days in 7-day rolling window where temp\_max >35°C.|dag\_imd\_daily|Use IMD forecast if actual missing. Default 0 if both unavailable.|test\_heat\_stress: count=7 when all days >35°C. count=0 for December dates.|
|hpai\_district\_flag|1 if DAHDF reports HPAI within 200km of Gorakhpur APMC (lat 26.76, lon 83.37) in past 14 days. Uses PostGIS ST\_Distance.|dag\_dahdf\_weekly|Default 0 on parse failure. Never null.|test\_hpai\_geo: 2023 UP outbreak → 1. Tamil Nadu outbreak → 0.|
|price\_ma\_7d|rolling\_mean(broiler\_price, window=7, min\_periods=4).|dag\_agmarknet\_daily|NaN if <4 of 7 days available. Feature dropped for those rows.|test\_ma\_7d: verify vs pandas rolling().mean() on known sequence.|
|month\_sin / month\_cos|sin(2π × month/12) and cos(2π × month/12). Circular encoding avoids Dec→Jan discontinuity.|Derived from date column|Never null.|test\_circular: Jan and Dec numerically close. June maximally distant from December.|
|lag\_1/3/7/14/21/30|broiler\_price[t-N] for N in [1,3,7,14,21,30].|dag\_agmarknet\_daily|NaN for first N rows in series (handled by TimeSeriesSplit).|test\_lag\_N: verify using known time series with manual calculation.|
|trend\_slope\_14d|Linear regression slope on 14-day rolling price window. scipy.stats.linregress.|Derived|NaN if <10 of 14 days available.|test\_trend\_slope: monotonically increasing sequence → slope > 0.|


# **4. Application Architecture — Backend & Frontend**
## **4.1 Backend API — Vercel Edge Functions**
All business logic runs as Vercel Edge Functions (serverless). Zero idle cost. Free tier: 100K requests/month — sufficient for Phase 0 and Phase 1. Every endpoint is documented below.

|**Endpoint**|**Method**|**Auth**|**Core Logic**|**SLA**|
| :- | :- | :- | :- | :- |
|/api/v1/forecast|GET|JWT Bearer|1\. Validate JWT. 2. Check subscription tier. 3. Call ML inference service. 4. Apply ZWC watermark. 5. Return watermarked prediction JSON.|<300ms P95|
|/api/v1/auth/otp-request|POST|None (public)|1\. Validate phone format (+91 + 10 digits). 2. Hash phone (SHA-256 + salt). 3. Generate 6-digit OTP. 4. Send via Twilio. 5. Store OTP hash in Supabase (10-min TTL).|<3s P95|
|/api/v1/auth/otp-verify|POST|None (pre-auth)|1\. Fetch OTP hash. 2. Verify bcrypt match. 3. If match: generate JWT (HS256, 7-day). 4. Delete OTP record. 5. Log new session.|<500ms P95|
|/api/v1/batch/calculator|POST|JWT Bearer|Input: {flock\_size, age\_days, avg\_weight\_kg, feed\_cost\_per\_kg}. Compute projected profit using cached forecast. Stateless — no user data stored.|<200ms P95|
|/api/v1/middleman/check|POST|JWT Bearer|Input: {offered\_price\_per\_kg, district}. Compare vs 7-day AGMARKNET mandi benchmark. Returns: fair/low/high + recommended range.|<200ms P95|
|/api/v2/forecast/enterprise|GET|HMAC-SHA256 API Key|30-day P10/P50/P90 forecast. Multi-district. Drivers array. Rate limited per API key (1K calls/day base, 10K enterprise).|<500ms P95|
|/api/v1/admin/accuracy|GET|Admin JWT only|Returns: 30-day rolling MAPE, directional accuracy, conformal coverage, champion model version, last retrain timestamp.|<1s P95|

## **4.2 Database Schema — Supabase PostgreSQL**
Schema is DPDP Act 2023 compliant from Day 1: phone numbers hashed, RLS on all customer tables, PostGIS for geospatial HPAI distance calculation. Mumbai (ap-south-1) region mandatory.

|**Table**|**Key Columns**|**RLS Policy**|**Indexes**|**Governance**|
| :- | :- | :- | :- | :- |
|customers|id (UUID PK), phone\_hash (SHA256+salt), tier, district, flock\_size, consent\_given, consent\_given\_at, device\_fingerprint\_hash|auth.uid() = id. Customers read own row only.|UNIQUE(phone\_hash), IDX(district)|Phone never stored raw. Erasure: DELETE cascades all FKs. Right to erasure via /api/v1/account DELETE endpoint.|
|predictions|id, district, commodity, prediction\_date, p10, p50, p90, drivers (JSONB), model\_version, created\_at|Public READ. No customer data in this table.|IDX(district, prediction\_date) composite|Shared predictions — no customer-specific data. Watermarking at API layer only. Retained 2 years.|
|customer\_predictions\_served|id, customer\_id (FK), prediction\_id (FK), served\_at, device\_fingerprint\_hash, watermark\_token|customer\_id = auth.uid(). Admin reads all.|IDX(customer\_id), IDX(watermark\_token) for leak detection|Immutable audit log. RLS blocks DELETE (USING false). Retained 3 years.|
|accuracy\_log|id, prediction\_id (FK), actual\_price, mape\_pct, directional\_correct (bool), evaluated\_at|Admin only.|IDX(prediction\_id), IDX(evaluated\_at)|Populated daily by dag\_accuracy\_monitor. Source of truth for MAPE dashboard and investor KPIs.|
|model\_registry|id, version, mape\_30d, directional\_accuracy, conformal\_coverage, promoted\_at, is\_champion (bool), s3\_artifact\_path|Admin only. ML service reads via service role.|UNIQUE partial IDX ON is\_champion WHERE is\_champion=true|Exactly one champion at any time, enforced by partial unique index. Version history preserved — never delete.|
|watermark\_events|id, watermark\_token, detected\_at, platform, customer\_id (FK), action\_taken, resolved\_at|Admin only.|IDX(watermark\_token), IDX(customer\_id)|States: DETECTED → WARNING\_SENT → ACCOUNT\_REVIEWED → RESOLVED. Legal evidence — immutable.|
|raw\_prices|id, source, district, commodity, price, price\_date, fetched\_at, validated (bool), staleness\_flag|Admin + ML service only.|IDX(district, price\_date) composite, IDX(source)|Partitioned by month. Retained 5 years. Partition pruning accelerates feature queries.|
|sessions|id, customer\_id (FK), device\_fingerprint\_hash, created\_at, last\_active\_at, is\_active|customer\_id = auth.uid().|IDX(customer\_id), IDX(is\_active)|Max 2 active sessions per customer enforced at login. Oldest invalidated on new login if ≥2.|

## **4.3 Mobile Architecture — React Native (Expo)**

|**Concern**|**Library / Approach**|**Offline Behaviour**|**Notes**|
| :- | :- | :- | :- |
|State Management|Zustand — single store: {auth, forecast, calculator, alerts}. Persisted to AsyncStorage.|Full state available offline. Hydrated from AsyncStorage on launch.|Zero overhead vs Redux. No provider tree.|
|Local Database|expo-sqlite. Schema: batches(id, flock\_size, age, feed\_cost, district). Pre-loaded with 7-day price cache.|Calculator fully offline using cached prices. Staleness timestamp shown.|Included in Expo SDK — zero cost.|
|Price Cache|AsyncStorage. TTL: 24h. Stale warning shown prominently after 24h.|Last cached forecast displayed with staleness banner. No API call attempted offline.|Reduces Vercel function invocations ~70%.|
|OTA Updates|Expo EAS Update. Critical bug fixes deployed in <5 min without App Store review. JS bundle only.|OTA not applicable offline. Applied on next connection.|Free tier: unlimited OTA updates.|
|Deep Linking|WhatsApp sell signal message contains: poulse://forecast?date=YYYY-MM-DD. Opens directly to forecast detail.|Falls back to browser if app not installed — shows unauthenticated preview + login prompt.|Expo handles routing. Zero cost.|
|Device Security|FingerprintJS Pro SDK (₹1,200/mo shared with web). SHA-256 hash stored in JWT + Supabase. New device requires OTP re-verification.|Not applicable offline. Login requires connection.|99\.5% accuracy cross-device.|
|Push Notifications|Expo Notifications + FCM (Android) + APNs (iOS). HPAI + weather alerts triggered by dag\_dahdf\_weekly.|Queued by FCM/APNs when device is offline. Delivered on reconnect.|Free tier: unlimited push via Expo.|


# **5. Security Architecture — OWASP & DPDP Compliance**
## **5.1 API Security Controls**

|**Control**|**Standard**|**Implementation**|**Technical Detail**|
| :- | :- | :- | :- |
|Authentication|OWASP API1: Broken Object Level Auth|Supabase Auth (phone OTP) + JWT HS256. 7-day sliding expiry.|JWT payload: {sub: customer\_id, tier, device\_fp\_hash, iat, exp}. All routes validate signature, expiry, and device\_fp\_hash against current request fingerprint. Supabase RLS enforces row-level isolation beyond JWT.|
|Transport Security|PCI-DSS TLS requirements|TLS 1.3 minimum. HSTS headers. Cloudflare terminates TLS.|HSTS: Strict-Transport-Security: max-age=31536000; includeSubDomains. Certificate: Cloudflare-managed, auto-renewed.|
|Request Signing (B2B)|AWS Signature V4 pattern|HMAC-SHA256 of (timestamp + endpoint + body\_hash). 5-minute window.|Canonical string: "{timestamp}\n{endpoint}\n{sha256(body)}". Vercel Edge rejects: missing/invalid signature, timestamp >5min old. Prevents replay attacks.|
|Secrets Management|OWASP A2: Cryptographic Failures|Vercel encrypted env vars. Supabase Vault for DB secrets. Pre-commit hook blocks secret patterns.|git-secrets library: blocks commits containing API key patterns. All secrets in Vercel Dashboard (AES-256 at rest). Zero secrets in code or plaintext CI.|
|SQL Injection|OWASP A3: Injection|Supabase JS client uses parameterised queries exclusively. No raw SQL concatenation.|Code review checklist: flag any string interpolation in DB queries. PR blocked if raw SQL concatenation detected.|
|Input Validation|OWASP A3: Injection|Zod schema on all API inputs. Reject before business logic.|Phone: /^\+91[6-9]\d{9}$/. Price: number between 50–500. Invalid input: 400 with field-level errors.|
|Rate Limiting|OWASP API4: Rate Limiting|Upstash Redis token bucket. Base: 1,000 calls/day, 60/min burst. Enterprise: 10,000/day.|Upstash free tier: 10K commands/day. Key: ratelimit:{api\_key}:{date}. Return 429 with Retry-After (RFC 6585) + X-RateLimit-Remaining header.|

## **5.2 IP Protection — Watermarking System**
Every prediction is watermarked with an invisible, unique identifier before delivery. This enables attribution of any leaked prediction to the exact customer. Watermarking must be applied to 100% of predictions with no exceptions.

|**Layer**|**Technique**|**Payload (128-bit)**|**Implementation**|
| :- | :- | :- | :- |
|Text Watermark|Zero-width Unicode characters (U+200B, U+200C, U+200D, U+FEFF) interspersed throughout prediction text.|customer\_id (32-bit) + timestamp (32-bit, hour precision) + device\_fp\_hash (32-bit) + HMAC-SHA256 truncated (32-bit)|Encoding: map each payload bit to ZWC character. Intersperse after every 5th visible character. Decoder: strip visible chars, decode ZWC sequence, verify HMAC. Applied via FastAPI middleware before response serialisation.|
|Numeric Watermark|Micro-perturbation of forecast price: ±0.5% unique per customer. Visually identical to human (rounds to same ₹/kg display).|Unique price value identifies source. e.g., Customer A: ₹162.4/kg, Customer B: ₹162.6/kg.|Perturbation table in Supabase: watermark\_perturbations(customer\_id, date, perturbation\_amount). Lookup at serve time. Always within model confidence interval.|
|WhatsApp Watermark|ZWC encoding in WhatsApp message text. ZWC characters survive WhatsApp delivery and OCR.|Same 128-bit payload as text watermark.|Twilio WhatsApp API accepts Unicode. ZWC survives delivery. Decoder processes OCR output (pytesseract) — regex extracts ZWC as Unicode. HMAC verification rejects forged watermarks.|
|Watermark Audit DAG|Automated OCR + ZWC decode pipeline. Runs daily in dag\_watermark\_audit at 08:00 IST.|Input: screenshot image OR text. Output: customer\_id + timestamp if watermark found.|OCR: pytesseract on detected prediction screenshots. ZWC extraction: regex. HMAC verification. <200ms per decode. Results → watermark\_events table.|

## **5.3 DPDP Act 2023 Compliance**

|**Requirement**|**Implementation**|**Technical Detail**|**Verification**|
| :- | :- | :- | :- |
|Explicit Consent|Consent checkbox + Hindi summary at onboarding. Stored in DB.|customers.consent\_given (bool) + consent\_given\_at (timestamp) + consent\_text\_version (FK to consent\_versions). Hindi + English text stored.|SELECT \* FROM customers WHERE consent\_given = false → should be empty for active customers.|
|Right to Erasure|DELETE /api/v1/account (authenticated). Cascades all FK tables. OTP-confirmed before deletion.|CASCADE DELETE removes customer\_predictions\_served, sessions, watermark\_events linked to customer\_id. Phone hash deleted. Irreversible.|Test: create customer → delete → verify zero residual PII in any table.|
|Data Minimisation|Collect only: phone\_hash, district, flock\_size, tier. No name (optional), no aadhaar, no bank details.|Onboarding: 3 fields only — phone (hashed immediately), district (dropdown), flock size (dropdown). Name is optional, never required.|grep for "aadhaar", "pan", "bank" in DB schema → must not exist as required fields.|
|Data Localisation|All Supabase data in ap-south-1 (Mumbai). No cross-border personal data transfer.|Third parties receive: Twilio (phone hash only), FingerprintJS (device hash only), Anthropic API (prediction values only — zero personal data).|Supabase dashboard confirms region = ap-south-1. DPA signed with all processors confirming India data handling.|
|Data Processor Agreements|DPA signed with: Supabase, Vercel, Twilio, Anthropic, Cloudflare, Railway.app.|DPAs stored in legal/ Google Drive (CTO + CEO access only). Each confirms: no data sale, deletion on request, breach notification within 72h.|Checklist: all processors have signed DPA before any personal data flows. Review annually.|


# **6. Infrastructure Cost — Phase 0 to Phase 1**
## **6.1 Month-by-Month Cost Breakdown**

|**Service**|**Plan**|**Phase 0/mo**|**Phase 1/mo**|**Upgrade Trigger**|
| :- | :- | :- | :- | :- |
|Astronomer.io (Airflow)|Free tier (≤10 DAGs)|₹0|₹0 → ₹12,500 if >10 DAGs|Phase 1 adds district DAGs. Plan self-hosted migration at Month 3.|
|Supabase PostgreSQL|Free (500MB, 50K MAU)|₹0|₹0 → ₹2,100|~40 active Phase 1 customers hits limit.|
|Railway.app — ML Serving|Hobby Plan (always-on FastAPI)|₹415|₹415|CPU >80% saturation → upgrade to Pro.|
|Railway.app — Airflow Worker|Hobby Plan (triggered only)|₹200|₹200|Multiple workers needed for parallel DAGs.|
|AWS Spot GPU (TFT Training)|g4dn.xlarge Spot, ~4 runs/month|₹2,500|₹2,500|More frequent retraining → increase run budget.|
|Twilio WhatsApp|Pay-per-message (~₹1.20/msg)|₹600 (500 msgs)|₹1,200 (1K msgs)|Switch to Meta Business API at >10K msg/month.|
|Anthropic Claude API (Hindi)|Pay-per-token|₹800|₹1,500|Scales with customers. Cached 24h per district.|
|Cloudflare WAF|Free tier|₹0|₹0|Enterprise features at Phase 2 only.|
|FingerprintJS Pro|Pay-per-ID (~$0.002/ID)|₹600|₹1,200|Volume-based. ~2,250 IDs/month at 15 customers.|
|Vercel (Frontend + API)|Hobby (free)|₹0|₹0 → ₹1,700|>100K Edge Function invocations/month.|
|Upstash Redis (Rate Limit)|Free (10K commands/day)|₹0|₹0|Scale beyond 10K commands/day.|
|Sentry + PostHog|Free tiers|₹0|₹0|Free tier generous for Phase 0–1.|
|Domain + SSL|Cloudflare Registrar (~₹800/yr)|₹65 (amortised)|₹65|No upgrade needed.|
|Expo EAS (Mobile Builds)|Free tier (30 builds/month)|₹0|₹0|Phase 2+ only if high build volume.|

|**Metric**|**Phase 0**|**Phase 1 (15 customers)**|**Gross Margin at ₹1.5L MRR**|**Break-Even (PulsePro ₹3K)**|
| :- | :- | :- | :- | :- |
|Total Infra Cost/mo|~₹5,180|~₹9,680|~93.5%|~4 customers|


# **7. Deployment, CI/CD & Monitoring**
## **7.1 Deployment Pipeline**

|**Stage**|**Trigger**|**Tool**|**Steps**|**Gate**|
| :- | :- | :- | :- | :- |
|Lint + Type Check|Every PR commit|GitHub Actions|ESLint, TypeScript compiler, Zod schema validation|Block merge if any lint error or type error|
|Unit Tests|Every PR commit|Jest + Pytest|Feature engineering unit tests, API endpoint tests, ZWC watermark encoder/decoder tests|Block merge if coverage <80% or any test fails|
|Integration Tests|PR to main branch|Playwright (web) + Detox (mobile)|Critical user flows: onboarding, price view, offline mode, OTP verify|Block merge if any critical flow fails|
|Performance Budget Check|PR to main|Lighthouse CI (web) + custom Detox perf test (mobile)|LCP <3s, FID <100ms, CLS <0.1 (web). Launch-to-price <200ms (mobile).|Block merge if any budget breached|
|Preview Deploy|PR to main|Vercel preview deploy (web) + Expo Preview build (mobile)|Automatic preview URL in PR comment. QA testing on preview.|Manual QA sign-off required before merge to main|
|Production Deploy (Web)|Merge to main|Vercel automatic deploy|Edge Function deploy, CDN invalidation, Sentry release|Automatic. Rollback: Vercel instant rollback in dashboard.|
|Production Deploy (ML)|dag\_model\_retrain promotion gate|Railway CLI + Airflow trigger|Copy ONNX to S3 champion path → POST /admin/reload-model on Railway.app → health check|Railway health check must pass within 60s. Automatic rollback if fails.|
|Mobile Release|Manual — sprint milestone|Expo EAS Build + App Store Connect / Google Play|EAS Build → TestFlight (iOS) / Internal Testing (Android) → manual QA → store submit|QA on TestFlight/Internal track required. Min 2 engineer sign-off.|

## **7.2 Monitoring Stack**

|**Concern**|**Tool**|**Alert Channel**|**Alert Condition**|**Response SLA**|
| :- | :- | :- | :- | :- |
|Error Tracking|Sentry (free: 5K errors/month)|Slack #alerts|Any new error type, error rate >10/hour|30 min acknowledgment|
|Product Analytics|PostHog (free: 1M events/month)|Weekly review in dashboard|No automated alerts — manual weekly review|Weekly|
|Uptime Monitoring|UptimeRobot (free: 50 monitors)|Slack #alerts + SMS to CTO|Any endpoint down for >2 consecutive checks (60s interval)|15 min response|
|ML Accuracy|Custom: dag\_accuracy\_monitor → Supabase accuracy\_log → Grafana (Railway.app)|Slack #ml-alerts|MAPE >8% for 2 consecutive days OR directional accuracy <92%|60 min investigation start|
|Infrastructure Costs|AWS Cost Explorer + Railway.app billing dashboard|Slack #infra weekly|Monthly spend exceeds budget by >20%|Monthly review|
|Data Pipeline|Airflow DAG failure alerts (built-in Slack integration)|Slack #data-alerts|Any DAG failure after 2 retries, or 2 consecutive daily failures for any source|30 min response|
|Security / Watermark|dag\_watermark\_audit → watermark\_events table → PostHog event|Slack #security|Any positive watermark match detected (potential leak)|Immediate — within 30 min|

## **7.3 Environments**

|**Environment**|**Purpose**|**URL Pattern**|**Data**|**Access**|
| :- | :- | :- | :- | :- |
|Local Development|Individual engineer dev|localhost:3000|Local Supabase (supabase start) + mocked ML inference|All engineers|
|Preview / Staging|PR review, QA testing|poulse-[pr-id].vercel.app|Staging Supabase project (separate from prod). Anonymised data.|All engineers + QA|
|Production|Live system|app.poulse.ai (mobile) / dashboard.poulse.ai (web)|Production Supabase (Mumbai). Real customer data.|Automated deploy only. No manual pushes.|
|ML Training|Weekly retraining|Railway.app worker (internal)|Full historical dataset in production Supabase + S3. Read-only access to prod DB during training.|Airflow DAG only. No manual access.|


# **8. 16-Week Technical Execution Plan**
This is the pre-launch execution plan. Every week has a defined deliverable, measurable gate, and explicit blocker action. No week is complete without its gate cleared.

|**Week**|**Engineering Task**|**Deliverable**|**MAPE Gate**|**Directional Gate**|**Blocker Action**|
| :- | :- | :- | :- | :- | :- |
|1–2|Provision all infra: Astronomer.io, Supabase (Mumbai), Railway.app. Build all 9 Airflow DAGs. Collect and clean 36-month historical data.|Clean 36-month dataset. 95%+ completeness per mandi. Data schema documented.|—|—|If AGMARKNET data <80% complete for any target mandi: hire local data collection agent (₹5–8K/mo). Do NOT proceed without 95% completeness.|
|3–4|Feature engineering v1: 20 core features. SHAP analysis on v1 feature set.|Feature matrix v1 (20 features). SHAP importance chart. feed\_cost\_lag42 confirmed as top-3 feature.|Baseline only|Baseline only|If feed\_cost\_lag42 not in top 3: data alignment problem. Verify maize price date alignment with 42-day grow-out. Re-run pipeline.|
|5–6|ARIMA(0,1,4) baseline per Karnataka paper. Prophet seasonality baseline. Validate on 6-month strict time-split holdout.|Baseline MAPE + directional accuracy on holdout. Exact model config documented.|<18%|>65%|If baseline MAPE >25%: data quality problem — revisit Weeks 1–2 before proceeding.|
|7–9|LightGBM causal model. 45 features. TimeSeriesSplit 5-fold. Optuna 50-trial tuning. SHAP analysis. Ensemble v1: ARIMA + LightGBM weighted average.|LightGBM artifacts. Ensemble v1 MAPE. Feature importance documented.|<12%|>80%|If directional <80% after LightGBM: add 5 more features before Week 10.|
|10–12|Temporal Fusion Transformer (TFT). P10/P50/P90 quantile outputs. Full ensemble: ARIMA + Prophet + LightGBM + TFT with learned stacking weights. Conformal calibration.|TFT artifacts. Full ensemble MAPE. Conformal coverage validated.|<8%|>90%|If TFT fails to improve on LightGBM alone: investigate data leakage. TFT must show improvement or there is a pipeline bug.|
|13–14|Stress testing: (a) Nov–Mar 2024 UP price crash simulation. (b) HPAI district alert. (c) Diwali demand spike.|Stress test report. Model performance on 3 historical shock events.|<7%|>93%|All 3 stress tests must show correct directional accuracy. Any failure = add specific features for that scenario.|
|15|ONNX quantisation. FastAPI inference service on Railway.app. Full stack integration: Airflow → Supabase → Railway.app → Vercel → Expo app.|End-to-end inference pipeline live. Load test: 100 concurrent requests <200ms P95.|<6.5%|>94%|If inference latency >200ms P95 on Railway.app Hobby: optimise ONNX export or upgrade plan.|
|16|Manual ground-truth validation: founding team visits Gorakhpur mandis for 30 consecutive days. Compare live predictions to actual mandi prices.|30+ consecutive predictions manually validated. Final accuracy report signed off by CTO.|<6%|>95%|If ANY accuracy gate not met: do NOT go live. Extend Phase 0. Investigate root cause. No exceptions.|


# **9. API Contract Reference**
These are the canonical request/response schemas for all endpoints. Engineers must not deviate from these schemas. Any change requires a version bump and product review.

## **9.1 GET /api/v1/forecast**
Request headers: Authorization: Bearer {JWT}

Response 200 (watermarked):

|<p>{</p><p>`  `"district": "Gorakhpur",</p><p>`  `"commodity": "broiler\_live",</p><p>`  `"prediction\_date": "2026-05-16",</p><p>`  `"p10": 155.2,</p><p>`  `"p50": 161.4,</p><p>`  `"p90": 167.8,</p><p>`  `"direction": "up",</p><p>`  `"direction\_vs\_yesterday\_pct": 1.8,</p><p>`  `"sell\_signal": "sell",</p><p>`  `"confidence\_label": "उच्च विश्वास",</p><p>`  `"drivers": [</p><p>`    `{"icon": "thermometer", "text": "गर्मी के कारण आपूर्ति कम हो रही है"},</p><p>`    `{"icon": "calendar",    "text": "Eid से पहले माँग बढ़ी है"},</p><p>`    `{"icon": "trending-up", "text": "मक्के की कीमत 3% नीचे — लागत कम"}</p><p>`  `],</p><p>`  `"model\_version": "v2.4.1",</p><p>`  `"last\_retrain": "2026-05-11T02:00:00Z",</p><p>`  `"staleness": false,</p><p>`  `"last\_updated": "2026-05-16T06:12:00Z"</p><p>}</p><p></p><p>// Note: ZWC watermark characters are present in all string fields.</p><p>// Response also includes X-Watermark-Token header (unique per request).</p>|
| :- |

## **9.2 POST /api/v1/batch/calculator**
Request body:

|<p>{</p><p>`  `"flock\_size": 25000,</p><p>`  `"age\_days": 38,</p><p>`  `"avg\_weight\_kg": 1.85,</p><p>`  `"feed\_cost\_per\_kg": 32.5,</p><p>`  `"district": "Gorakhpur"</p><p>}</p>|
| :- |

Response 200:

|<p>{</p><p>`  `"total\_birds": 25000,</p><p>`  `"total\_weight\_kg": 46250,</p><p>`  `"forecast\_used\_date": "2026-05-16",</p><p>`  `"forecast\_price\_p50": 161.4,</p><p>`  `"gross\_revenue\_inr": 7464750,</p><p>`  `"total\_feed\_cost\_inr": 5428125,</p><p>`  `"estimated\_gross\_profit\_inr": 2036625,</p><p>`  `"profit\_per\_bird\_inr": 81.47,</p><p>`  `"optimal\_sell\_window": {</p><p>`    `"best\_date": "2026-05-17",</p><p>`    `"best\_date\_price\_p50": 163.8,</p><p>`    `"additional\_profit\_if\_wait": 113750</p><p>`  `},</p><p>`  `"staleness": false,</p><p>`  `"cached": true</p><p>}</p>|
| :- |

## **9.3 Error Response Schema (All Endpoints)**

|<p>{</p><p>`  `"error": {</p><p>`    `"code": "SUBSCRIPTION\_EXPIRED",</p><p>`    `"message": "आपकी सदस्यता समाप्त हो गई है।",</p><p>`    `"message\_en": "Your subscription has expired.",</p><p>`    `"http\_status": 402,</p><p>`    `"action": "RENEW\_SUBSCRIPTION",</p><p>`    `"action\_url": "https://poulse.ai/renew"</p><p>`  `}</p><p>}</p><p></p><p>// Standard error codes:</p><p>// AUTH\_INVALID\_TOKEN       → 401</p><p>// AUTH\_DEVICE\_MISMATCH     → 403 (triggers re-verification flow)</p><p>// SUBSCRIPTION\_EXPIRED     → 402</p><p>// RATE\_LIMIT\_EXCEEDED      → 429 (includes Retry-After header)</p><p>// FORECAST\_UNAVAILABLE     → 503 (includes last\_known\_forecast in body)</p><p>// VALIDATION\_ERROR         → 400 (includes field-level errors array)</p>|
| :- |


# **10. Engineering Readiness Checklist**
This checklist must be completed by the CTO before Phase 0 concludes and Phase 1 customers are onboarded. Each item requires sign-off, not just checkbox.

## **10.1 Infrastructure Readiness**
1. Supabase project confirmed in ap-south-1 (Mumbai). RLS enabled on all customer-facing tables.
1. All 9 Airflow DAGs run successfully for 7 consecutive days with zero unhandled failures.
1. Great Expectations validation suite passing: completeness >95% per mandi per day.
1. Railway.app ML inference service: load tested at 100 concurrent requests, P95 <200ms.
1. S3 versioned model storage: champion/previous/challenger structure verified.
1. ONNX quantisation pipeline: quantised model within 0.5% MAPE of full-precision.
1. Cloudflare WAF: DDoS protection verified. HSTS headers live on all domains.
1. Uptime monitoring: UptimeRobot alerts confirmed on Slack and CTO SMS.

## **10.2 Security Readiness**
1. Pre-commit hooks blocking secret patterns installed on all engineer machines.
1. ZWC watermark: encoder + decoder unit tested. 100% of /api/v1/forecast responses watermarked.
1. Device fingerprint binding: new device flow tested — OTP re-verification triggered correctly.
1. DPDP: Right to Erasure tested end-to-end — zero residual PII after customer DELETE.
1. DPA signed with all 6 processors: Supabase, Vercel, Twilio, Anthropic, Cloudflare, Railway.app.
1. Penetration test: basic OWASP Top 10 scan run on staging environment. Critical findings resolved.

## **10.3 ML Accuracy Readiness**
1. MAPE <6% on 90-day rolling holdout. Verified by Data Head.
1. Directional accuracy >95% on same 90-day holdout. Verified by Data Head.
1. Conformal interval coverage 78–82% for stated 80% intervals. Verified by Data Head.
1. 3 stress tests passed: 2024 UP price crash, HPAI outbreak, Diwali demand spike.
1. Champion/challenger framework: one promotion and one rollback tested end-to-end.
1. 30+ consecutive live predictions manually validated by founding team at Gorakhpur mandis.

|**GO/NO-GO**|All 22 checklist items above must be signed off by CTO before a single customer is onboarded. There is no partial go-live. There is no "mostly ready." The 95%+ accuracy mandate protects the product's entire market position. Compromising on it once destroys it permanently.|
| :-: | :- |

PoultryPulse AI  ·  Engineering Use Only			Page  of 
