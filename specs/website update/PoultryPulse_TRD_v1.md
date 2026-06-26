**PoultryPulse AI - Technical Requirements Document v1.0	CONFIDENTIAL**

**POULTRYPULSE AI**

**Technical Requirements Document (TRD)**

**ZERO-TO-LOW-COST ARCHITECTURE  ·  PRE-REVENUE PHASE 0 & PHASE 1  ·  v1.0**

|**Version**|**Date**|**Author**|**Status**|
| :-: | :-: | :-: | :-: |
|TRD v1.0|May 2026|Senior Architect (25+ yr)|**DRAFT - Pre-Revenue**|

|**PRD Ref**|**Phase Coverage**|**Total Infra Cost (Phase 0)**|**Paying Customers Req'd**|
| :-: | :-: | :-: | :-: |
|PoultryPulse PRD v3.0|Phase 0 (Month 0-4) + Phase 1 (Month 4-8)|**~Rs7,330/month**|**ZERO - Full stack runs before first rupee**|

*CONFIDENTIAL - Engineering & Investor Use Only*


# **1. Architect's Mandate - Build for Zero, Scale for Revenue**
This TRD is authored from the perspective of a senior systems architect who has designed infrastructure at scale for hundreds of millions of users. The single hardest lesson from that experience: the most expensive mistake in early-stage product engineering is over-engineering before product-market fit.

PoultryPulse PRD v3.0 is explicit: Rs0 revenue until 95%+ model accuracy is certified. This TRD enforces that discipline at the infrastructure layer. Every architecture decision below passes three filters before acceptance:

- Free or near-free at zero users - no fixed cost that bleeds cash during Phase 0 training
- Scales sub-linearly - cost grows slower than revenue once paying customers arrive
- No vendor lock-in that creates switching cost before Series A - escape hatch always available

|<p>**NON-NEGOTIABLE ARCHITECTURAL PRINCIPLE**</p><p>The infrastructure must cost Rs0 when no user is active. Every rupee of idle infrastructure cost is a rupee that reduces runway.</p><p>Serverless-first. Event-driven. No always-on compute except the ML inference service (unavoidable for <200ms response SLA).</p><p>Phase 0 total infra budget: Rs7,330/month (matching PRD Section 9). This TRD details exactly how every rupee is spent and how to reduce it further if needed.</p>|
| :- |


# **2. System Architecture Overview**
## **2.1 Architecture Layers**
The system is decomposed into six functional layers. Each layer has an explicit technology choice justified by cost, capability, and escape-hatch considerations.

|**Layer**|**Technology**|**Monthly Cost**|**Rationale**|**Escape Hatch**|**Phase**|
| :-: | :-: | :-: | :-: | :-: | :-: |
|**L1: Data Ingestion**|Apache Airflow on Astronomer.io Free + Python|**Rs0 (free tier)**|DAG-based scheduling. 12 public data sources. Retry logic. Free tier = 10 DAGs, sufficient for Phase 0.|Self-hosted Airflow on EC2 t3.micro (~Rs750/mo) if free tier exceeded|**0**|
|**L2: Data Store**|Supabase PostgreSQL (Mumbai ap-south-1)|**Rs0 -> Rs2,100 (Pro at 500MB+)**|Built-in auth, RLS, PostGIS, real-time. DPDP compliant (India region). Free: 500MB + 50K MAU.|Managed PostgreSQL on Railway.app or PlanetScale if Supabase pricing jumps post-Series A|**0**|
|**L3: ML Training**|Railway.app CPU + AWS Spot GPU (g4dn.xlarge) burst|**~Rs2,500/mo**|Spot GPU for TFT: Rs800/run x ~3 runs/month. Railway.app for Airflow worker. 65% cheaper than on-demand.|Google Colab Pro+ (Rs1,900/mo) as emergency training fallback if AWS access disrupted|**0**|
|**L4: ML Serving**|FastAPI + ONNX on Railway.app Hobby|**~Rs415/mo**|Always-on CPU inference. ONNX quantised: 4x faster, 70% smaller. <200ms P95. Only always-on cost.|Fly.io (similar cost, multi-region) or Render.com if Railway pricing changes|**0**|
|**L5: Application**|Next.js 15 on Vercel Edge + React Native (Expo)|**Rs0 (free tier)**|Serverless. 100K requests/month free. SSR + ISR for dashboard. OTA mobile updates via Expo EAS.|Cloudflare Pages (free) + self-hosted API if Vercel costs increase at scale|**0**|
|**L6: Comms & Security**|Twilio WhatsApp + Cloudflare WAF + FingerprintJS Pro|**~Rs2,400/mo**|WhatsApp-native channel for farmers. WAF for DDoS/bot protection. Device binding for IP protection.|Meta Business API direct when >10K msg/mo (cost drops). Alternative WAF: Vercel firewall (free tier)|**0-1**|

## **2.2 Zero-Cost Design Principles**
Every architectural decision in this document follows these six principles, in order of priority:

- Serverless-first: compute only runs when requests arrive. No idle VM cost.
- Free-tier maximisation: Supabase, Vercel, Astronomer.io, Sentry, PostHog - all free at Phase 0 scale.
- Spot/preemptible for batch: ML training is batch workload - always use AWS Spot or Google Preemptible (65-80% cheaper).
- ONNX quantisation for inference: 4x speed improvement + 70% size reduction = same Railway.app plan handles 10x more throughput.
- Public data only: zero data licensing cost. All 12 sources are government APIs or public web - legally free.
- One-person DevOps: Vercel + Supabase + Railway.app = full production stack manageable by 1 engineer without dedicated DevOps hire.


# **3. Data Ingestion & Pipeline Architecture**
## **3.1 Public Data Source Technical Specifications**
All 12 data sources from PRD Section 5.1 are accessed at zero cost. Below is the complete technical specification for each, including the exact API call pattern, error handling strategy, and fallback behaviour.

|**Source**|**Method**|**Format**|**Airflow DAG**|**Rate Limit / ToS**|**Error Handling**|
| :-: | :-: | :-: | :-: | :-: | :-: |
|**AGMARKNET (data.gov.in)**|REST API (free key via data.gov.in registration)|**JSON**|dag\_agmarknet\_daily: runs 04:30 IST, hits /agmarknet endpoint, filters Gorakhpur/Deoria/Basti/Kushinagar mandis|500 req/day (free key). No commercial restriction. Govt open data.|Retry 3x (exp backoff: 30s, 90s, 270s). On failure: serve previous day's data with staleness=True flag. Slack alert if 2 consecutive failures.|
|**NECC (necc.co.in)**|Web scraping via BeautifulSoup4 + requests. HTML table parsing.|**HTML -> CSV**|dag\_necc\_daily: 05:00 IST. Parse /daily-rates HTML. Extract UP zone table. Validate price range (sanity check Rs3-Rs12/egg).|No explicit rate limit. Cache 24h. Avoid >10 req/day. Contact NECC for formal data partnership (PRD recommends - do this Month 1).|If HTML structure changes: fallback to previous day + alert. Use CSS selector versioning: store selector patterns in DB, alert if selector returns empty.|
|**IMD (api.imd.gov.in)**|REST API. No auth required.|**JSON**|dag\_imd\_daily: 06:00 IST. Hits /api/v1/districtnowcast?district=gorakhpur and /districtforecast. Extracts temp, humidity, rainfall, heat wave flag.|Officially free, unlimited for public use. Government service.|IMD API has occasional downtime. Retry 5x (10s intervals). Fallback: OpenWeatherMap free tier (1K calls/day free) for Gorakhpur lat/lon coordinates.|
|**DAHDF (dahd.gov.in)**|PDF scraping: weekly disease bulletin. tabula-py for table extraction.|**PDF -> structured JSON**|dag\_dahdf\_weekly: Monday 07:00 IST. Download latest bulletin PDF. Extract HPAI alert table. Parse district + severity.|Public government PDFs. No ToS restriction. PDF URL may change with new bulletins - use link discovery.|If PDF structure changes: flag for manual review. hpai\_district\_flag defaults to 0 (no alert) on parse failure - safer than false positive.|
|**NCDEX (ncdex.com)**|Web scraping delayed prices page + CSV historical download.|**HTML + CSV**|dag\_ncdex\_daily: 16:30 IST (after market close). Scrape delayed maize/soya prices. CSV historical download weekly.|15-min delayed data is publicly displayed. Legal for commercial use. Respect robots.txt.|CAPTCHA detection: if scraper blocked, switch to MCX as proxy + alert. Implement random delay 2-5s between requests.|
|**MCX (mcxindia.com)**|Web scraping public market watch.|**HTML**|dag\_mcx\_daily: 16:30 IST. Palm oil + soya oil futures as feed cost proxy.|Same as NCDEX. Public delayed data.|Secondary to NCDEX. On failure, use previous day data. Both failing simultaneously is extremely rare.|
|**Google Trends (pytrends)**|pytrends Python library. Search: 'chicken price Gorakhpur', 'murga rate UP', 'broiler price today'.|**JSON**|dag\_trends\_weekly: Sunday 09:00 IST. Fetch 7-day interest score. Cache result - avoid over-calling.|Unofficial API. Google may throttle. Never call more than 10x/day. Cache results aggressively (7-day validity).|pytrends is unofficial - implement exponential backoff if 429 received. If blocked, use 5-day rolling cache value with staleness flag.|
|**FAO / USDA FAS**|PDF + CSV download from public datasets.|**PDF/CSV**|dag\_fao\_monthly: 1st of each month 08:00 IST. Download FAOSTAT poultry CSV. USDA GAIN report PDF scrape monthly.|Public domain, free for all use.|Monthly data - low criticality if single month fails. Retry next day. Store last 12 months locally in Supabase.|
|**Kaggle / UCI**|Kaggle API (free account) one-time + periodic download. CC0 licensed datasets.|**CSV**|Manual download for initial model bootstrap. dag\_kaggle\_refresh: quarterly check for new datasets.|Free API with Kaggle account. CC0 license - no restrictions.|One-time operation for Phase 0 bootstrap. After initial load, not on critical path.|
|**UP Agri Dept.**|Web scraping upagripardarshi.gov.in + formal data request letter.|**HTML/PDF**|dag\_up\_agri\_monthly: scrape monthly statistics page.|State government public data. Send formal data request letter Month 1 (PRD recommends).|Low-frequency source - monthly. Failure has minimal impact on daily model. Manual fallback acceptable.|

## **3.2 Airflow DAG Architecture**
### **3.2.1 DAG Dependency Graph**
The pipeline runs as a directed acyclic graph. Dependencies are strict - downstream tasks only execute if upstream validation passes. This prevents partial data from contaminating the feature matrix.

|<p>**CRITICAL: Astronomer.io Free Tier Limits**</p><p>Free tier allows: 5 workers, 10 DAGs, 20 concurrent tasks. Phase 0 uses 9 DAGs - within limit.</p><p>When Phase 1 adds 3+ new district DAGs, upgrade to Astronomer Paid (~$150/mo) OR self-host on Railway.app (~Rs750/mo). Plan this migration at Month 3.</p><p>All DAG code lives in Git. Zero config stored on Astronomer. Migration is a 2-hour operation.</p>|
| :- |

|**DAG Name**|**Schedule**|**Runtime (avg)**|**Depends On**|**Output**|**Alert Condition**|
| :-: | :-: | :-: | :-: | :-: | :-: |
|**dag\_raw\_ingest**|04:30 IST daily|8-12 min|None (root DAG)|Raw JSON/CSV -> Supabase storage bucket (raw\_prices/)|Any source fails 2x consecutive|
|**dag\_validate**|05:00 IST daily|3-5 min|dag\_raw\_ingest (success)|Validation report. Reject rows with >3sigma deviation or >15% missing.|Validation failure rate >10% in any single source|
|**dag\_feature\_eng**|05:15 IST daily|5-8 min|dag\_validate (success)|Feature matrix Parquet: 45 columns, 1 row per mandi per day|Feature coverage <90% for any critical feature|
|**dag\_model\_infer**|06:00 IST daily|2-3 min|dag\_feature\_eng (success)|Prediction JSON -> Supabase predictions table. Triggers WhatsApp dispatch.|Inference latency >30s or prediction outside [Rs100, Rs250] range|
|**dag\_accuracy\_monitor**|06:30 IST daily|2 min|dag\_model\_infer (T-1)|Compares yesterday's prediction vs today's actual. Updates rolling MAPE table.|30-day rolling MAPE >8% OR directional accuracy <90%|
|**dag\_model\_retrain**|02:00 IST Sunday|45-90 min|dag\_feature\_eng (weekly snapshot)|New model artifacts (.pkl, .onnx) in versioned S3. Triggers champion/challenger eval.|New model fails to beat champion MAPE by >2%|
|**dag\_watermark\_audit**|08:00 IST daily|5 min|None (independent)|Scans 15 WhatsApp group monitoring feeds for prediction screenshots. Runs watermark decoder.|Any positive watermark match detected|
|**dag\_necc\_weekly**|Sunday 05:00 IST|3 min|None (independent)|NECC weekly production statistics. Stored in necc\_weekly table.|Data not updated for >8 days|
|**dag\_monthly\_reports**|1st of month 08:00 IST|15 min|None (independent)|FAO + USDA + UP Agri data download. Stored in macro\_data table.|Download failure for 2nd consecutive month|

## **3.3 Data Validation Spec (Great Expectations)**
Every data record passes through automated validation before entering the feature engineering pipeline. Validation rules are defined as Great Expectations suites stored in Git.

|**Field**|**Expectation**|**Fail Action**|**Criticality**|**Technical Implementation**|
| :-: | :-: | :-: | :-: | :-: |
|**broiler\_price\_per\_kg**|Between Rs80 and Rs250 inclusive. Not null.|Reject row. Use interpolated value from rolling median if <3 consecutive missing.|**CRITICAL**|expect\_column\_values\_to\_be\_between(min=80, max=250). expect\_column\_values\_to\_not\_be\_null. Rolling median interpolation via pandas fillna(method='ffill', limit=3).|
|**mandi\_name**|In allowlist: ['Gorakhpur', 'Deoria', 'Basti', 'Kushinagar', 'Maharajganj']. Not null.|Reject entire record. Log to anomaly\_log table.|**HIGH**|expect\_column\_values\_to\_be\_in\_set(value\_set=[...]). Any mandi name outside allowlist = data quality issue.|
|**date**|Is date. Not null. Not future date. Not older than T-2 (stale data gate).|Reject. Alert if date gap >2 days for any mandi.|**CRITICAL**|expect\_column\_values\_to\_be\_of\_type('datetime64'). expect\_column\_values\_to\_be\_between(min=today-2, max=today).|
|**maize\_price\_per\_quintal**|Between Rs1,200 and Rs4,000. Not null for feature computation dates.|Interpolate from NCDEX historical. Flag as imputed.|**HIGH**|expect\_column\_values\_to\_be\_between(min=1200, max=4000). Imputed values marked with maize\_price\_imputed=True column.|
|**temperature\_celsius**|Between -5 and 55 for Gorakhpur district. Not null.|Use IMD forecast value for that day if actual missing.|**MEDIUM**|expect\_column\_values\_to\_be\_between(min=-5, max=55). IMD /districtforecast as fallback.|
|**hpai\_district\_flag**|Boolean 0 or 1. Not null.|Default to 0 on parse failure (conservative - avoids false panic).|**HIGH**|expect\_column\_values\_to\_be\_in\_set([0, 1]). Default=0 coded in DAHDF scraper exception handler.|
|**completeness\_overall**|>95% non-null across full feature matrix before feature engineering runs.|BLOCK feature engineering. Alert Slack. Do not serve stale predictions.|**CRITICAL**|Great Expectations checkpoint: DataContextV3.run\_checkpoint(checkpoint\_name='daily\_completeness'). Fail = DAG raises AirflowFailException.|


# **4. ML Architecture - 95%+ Pre-Launch Accuracy System**
## **4.1 Model Training Environment (Cost-Optimised)**
ML training is a batch workload - it runs once weekly (Sunday 02:00 IST) and takes 45-90 minutes. This is the only workload that justifies burst GPU compute. The architecture uses AWS Spot instances for this burst, with a full fallback to CPU-only training if spot capacity is unavailable.

|**Training Component**|**Compute**|**Cost/Run**|**Implementation**|**Fallback if Unavailable**|
| :-: | :-: | :-: | :-: | :-: |
|**ARIMA(0,1,4) Baseline**|Railway.app CPU (1 vCPU, 512MB RAM)|**~Rs12/run**|statsmodels ARIMA. Training time: <2 min. Run on Railway.app worker triggered by Airflow DAG. Model artifact .pkl -> S3.|No fallback needed - CPU training is primary and sufficient for ARIMA.|
|**Facebook Prophet**|Railway.app CPU (1 vCPU, 512MB RAM)|**~Rs15/run**|prophet library. Holiday calendar: India public holidays + Gorakhpur-specific festivals. Training: <5 min on 36-month dataset.|CPU-only. No GPU needed. Same fallback as ARIMA.|
|**LightGBM (45 features)**|Railway.app CPU (2 vCPU, 1GB RAM)|**~Rs25/run**|lightgbm. Hyperparameter tuning via Optuna (50 trials). TimeSeriesSplit n=5. Training: 15-20 min on CPU. SHAP analysis post-training.|CPU training is standard for LightGBM. Reduce Optuna trials to 20 if time-constrained.|
|**Temporal Fusion Transformer**|AWS Spot g4dn.xlarge (1x T4 GPU, 16GB RAM)|**~Rs800/run (spot)**|pytorch-forecasting TFT. Quantile outputs: P10/P50/P90. Full training: 30-45 min on GPU. Model -> ONNX export post-training.|Google Colab Pro+ T4 GPU (Rs1,900/mo unlimited, ~Rs475/run equivalent). Manual trigger via Colab notebook. Acceptable for Phase 0 weekly retrain.|
|**Ensemble Stacking**|Railway.app CPU|**~Rs10/run**|sklearn Ridge meta-learner. Trains on base model predictions from validation set. Learns optimal per-season weights.|CPU-only. <1 min training time. No fallback needed.|
|**Conformal Calibration**|Railway.app CPU|**~Rs8/run**|MAPIE library (pip install mapie). Calibrate on separate calibration set (10% of training data). Validates coverage: 78-82% for 80% intervals.|CPU-only. Critical step - never skip. If calibration fails coverage test, block model promotion.|

## **4.2 Champion / Challenger Framework**
Every new model artifact must beat the current production model (champion) before deployment. This prevents model regression in production - the most common cause of accuracy degradation in live systems.

|**Stage**|**Condition**|**Action**|**Implementation**|
| :-: | :-: | :-: | :-: |
|**Champion Load**|Always: production model is the champion.|**Load current champion from S3 versioned artifact.**|S3 key: models/champion/latest.onnx. Metadata: champion\_mape, champion\_directional, champion\_version in Supabase model\_registry table.|
|**Challenger Train**|Weekly Sunday retrain DAG completes successfully.|**New model artifacts generated. Evaluation begins.**|Challenger stored at: models/challenger/{run\_id}/model.onnx. Never overwrites champion.|
|**Challenger Eval**|Challenger MAPE < champion MAPE - 2%.|**Challenger promoted to champion. Old champion archived.**|If challenger\_mape > (champion\_mape - 0.02): log result, discard challenger, continue with champion. Slack alert: 'Challenger did not beat champion - champion retained.'|
|**Promotion Gate**|ALL THREE simultaneously: MAPE <6%, Directional >95%, Conformal coverage 78-82%.|**Challenger replaces champion. Railway.app inference service hot-reloaded.**|Champion promotion: copy challenger ONNX to models/champion/latest.onnx. Update model\_registry: promoted\_at, mape, directional, version. Railway.app: POST /admin/reload-model (internal endpoint).|
|**Rollback Trigger**|Production MAPE >8% OR directional accuracy <90% for 3 consecutive days.|**Automatic rollback to previous champion. Alert CTO.**|Rollback: copy models/champion/previous.onnx to latest.onnx. Update model\_registry. Investigate challenger root cause before next promotion attempt.|

## **4.3 Feature Engineering - Technical Implementation**
45 features are computed from 12 raw data sources. The feature computation is idempotent - re-running produces identical output for the same input date. All features are unit-tested.

|**Feature**|**Computation**|**Source DAG**|**Null Policy**|**Unit Test**|
| :-: | :-: | :-: | :-: | :-: |
|**feed\_cost\_ratio\_lag42**|broiler\_price[t] / maize\_price[t-42]. Requires maize price from 42 trading days prior.|dag\_ncdex\_daily|Forward-fill up to 3 days. Error if >3 consecutive missing.|test\_feed\_ratio\_lag: verify ratio = 1.0 when prices equal. Verify lag=42 using known historical dates.|
|**festival\_7d\_flag**|Encode 12 annual Hindu/Muslim festivals for UP region. If within 7 days of any festival: 1, else 0. Includes: Diwali, Eid x2, Holi, Navratri, Christmas, Muharram, Raksha Bandhan.|Static calendar (hardcoded in feature module, updated annually)|Never null - always 0 or 1.|test\_festival\_flag: verify Diwali 2024 date returns 1 for 7-day window. Verify non-festival date returns 0.|
|**heat\_stress\_7d**|Count of days in rolling 7-day window where temp\_max > 35 deg C. IMD district data.|dag\_imd\_daily|Use IMD forecast if actual missing. Default 0 if both unavailable.|test\_heat\_stress: verify count=7 for a week where all days >35 deg C. Verify count=0 for December dates.|
|**hpai\_district\_flag**|1 if DAHDF reports HPAI alert with centroid within 200km of Gorakhpur APMC (lat 26.76, lon 83.37) in the past 14 days. Uses PostGIS ST\_Distance.|dag\_dahdf\_weekly|Default 0 on parse failure. Never null.|test\_hpai\_geo: verify 2023 UP outbreak correctly returns 1. Verify Tamil Nadu outbreak correctly returns 0.|
|**price\_ma\_7d**|rolling\_mean(broiler\_price, window=7, min\_periods=4). Minimum 4 of 7 days required.|dag\_agmarknet\_daily|NaN if <4 days available. Feature dropped from model for those rows.|test\_ma\_7d: verify against pandas rolling().mean() on known sequence.|
|**month\_sin / month\_cos**|sin(2pi x month/12) and cos(2pi x month/12). Circular encoding avoids Dec->Jan discontinuity.|Derived from date column|Never null - derived from date.|test\_circular\_encode: verify Jan and Dec are numerically close. Verify June is maximally distant from December.|

## **4.4 ONNX Quantisation Pipeline (Cost Reduction)**
ONNX quantisation is the primary technique for serving the TFT model on Railway.app CPU without requiring GPU inference. This eliminates the most significant ongoing infrastructure cost.

|<p>**QUANTISATION IMPACT AT RAILWAY.APP**</p><p>Without quantisation: TFT inference requires GPU -> Railway.app GPU tier (~Rs4,100/mo always-on).</p><p>With INT8 ONNX quantisation: CPU inference <180ms P95 on Railway.app Hobby (~Rs415/mo).</p><p>Net saving: Rs3,685/month = Rs44,220/year saved before first customer.</p><p>Implementation: torch.onnx.export() -> onnxruntime.quantization.quantize\_dynamic(). 3-line addition to training pipeline.</p>|
| :- |

|**Step**|**Tool**|**Runtime**|**Output**|**Validation**|
| :-: | :-: | :-: | :-: | :-: |
|**PyTorch -> ONNX Export**|torch.onnx.export() with opset\_version=17|~2 min|model.onnx (full precision)|onnxruntime inference matches PyTorch output within 1e-5 tolerance on 100 test inputs.|
|**INT8 Dynamic Quantisation**|onnxruntime.quantization.quantize\_dynamic(model.onnx, model\_quant.onnx, weight\_type=QuantType.QInt8)|~5 min|model\_quant.onnx (70% smaller)|Quantised model MAPE within 0.5% of full-precision model on validation set. If degradation >0.5%: use static quantisation with calibration dataset.|
|**Accuracy Regression Test**|Run quantised model on 30-day holdout sample. Compare MAPE and directional accuracy vs full-precision baseline.|~3 min|Regression report (pass/fail)|Must pass: |quant\_mape - fp\_mape| < 0.5%. |quant\_directional - fp\_directional| < 1%. Block deployment if either fails.|
|**Deploy to Railway.app**|Railway CLI: railway up --detach. Model loaded from S3 URL at container startup. No model stored in container image.|~3 min|Inference endpoint live at /v1/predict|Health check: GET /health returns {model\_version, mape\_30d, quantised: true}. Load test: 100 concurrent requests <200ms P95.|


# **5. Application Architecture**
## **5.1 Backend API - Vercel Edge Functions**
All business logic runs as Vercel Edge Functions (serverless). Zero idle cost - functions spin up on request and shut down immediately. The free tier covers 100,000 requests/month, sufficient for Phase 0 and Phase 1.

|**API Endpoint**|**Method**|**Auth**|**Core Logic**|**Implementation Notes**|
| :-: | :-: | :-: | :-: | :-: |
|**/api/v1/forecast**|**GET**|JWT Bearer|1\. Validate JWT. 2. Check subscription tier. 3. Call ML inference service. 4. Apply watermarking middleware. 5. Return watermarked prediction JSON.|Watermarking is applied BEFORE caching. Each customer gets a unique watermarked response. Cache TTL: 1 hour (prediction updates at 06:00 IST). Cloudflare cache key: customer\_id + date.|
|**/api/v1/auth/otp-request**|**POST**|None (public)|1\. Validate phone number format (+91 + 10 digits). 2. Hash phone number (SHA-256 + salt). 3. Generate 6-digit OTP. 4. Send via Twilio. 5. Store OTP hash in Supabase with 10-min TTL.|OTP stored as bcrypt hash, not plaintext. Rate limit: 3 OTP requests per phone number per hour (Upstash Redis). DPDP compliant: phone not stored raw.|
|**/api/v1/auth/otp-verify**|**POST**|None (pre-auth)|1\. Fetch OTP hash from Supabase. 2. Verify bcrypt match. 3. If match: generate JWT (HS256, 7-day expiry) + set httpOnly cookie. 4. Delete OTP record. 5. Log new session.|JWT payload: {customer\_id, tier, device\_fingerprint\_hash, iat, exp}. Device fingerprint bound at first login. New device = OTP re-verification required.|
|**/api/v1/batch/calculator**|**POST**|JWT Bearer|Input: {flock\_size, age\_days, avg\_weight\_kg, feed\_cost\_per\_kg}. Compute: projected profit for T+0, T+3, T+7 using cached price forecast. Return Rs values.|Offline capable - uses last cached forecast if ML service unavailable. Cache staleness displayed prominently. No user data stored - calculation is stateless.|
|**/api/v1/middleman/check**|**POST**|JWT Bearer|Input: {offered\_price\_per\_kg, district}. Compare vs district mandi benchmark from AGMARKNET (last 7-day avg). Return: fair/low/high classification + recommended range.|Benchmark computed from validated price table in Supabase. Refresh daily after dag\_agmarknet\_daily completes. +-10% from 7-day avg = 'fair'.|
|**/api/v2/forecast/enterprise**|**GET**|API Key (HMAC-signed)|30-day forecast with P10/P50/P90. Multi-district support. Drivers array (weekly). Rate limited per API key.|HMAC-SHA256 signature verification: reject if timestamp delta >5 min (replay prevention). Response includes X-Watermark-Token header (unique per request). Logged to audit\_log table.|
|**/api/v1/admin/accuracy**|**GET**|Admin JWT only|Returns: 30-day rolling MAPE, directional accuracy, conformal coverage, champion model version, last retrain timestamp.|Admin role only. Used by Data Head for daily accuracy monitoring dashboard. Data sourced from model\_registry and accuracy\_log tables.|

## **5.2 Database Schema - Supabase PostgreSQL**
Schema is designed for DPDP Act compliance from Day 1: phone numbers hashed, row-level security on all customer tables, no cross-customer data access.

|**Table**|**Key Columns**|**RLS Policy**|**Indexes**|**Data Governance Notes**|
| :-: | :-: | :-: | :-: | :-: |
|**customers**|id (UUID PK), phone\_hash (SHA256+salt), tier, district, flock\_size, created\_at, subscription\_start, subscription\_end|auth.uid() = id. Customers can only read their own row.|idx\_customers\_phone\_hash (unique). idx\_customers\_district.|Phone number hashed pre-insert. Raw phone never stored. Erasure: DELETE FROM customers WHERE id = $1 cascades to all FK tables.|
|**predictions**|id, district, commodity, prediction\_date, p10, p50, p90, drivers (JSONB), model\_version, created\_at|Public READ for validated predictions. No customer data in this table.|idx\_predictions\_district\_date (composite). idx\_predictions\_model\_version.|Shared predictions table - no customer-specific data. Watermarking applied at API layer, not stored here. Retained 2 years per PRD.|
|**customer\_predictions\_served**|id, customer\_id (FK), prediction\_id (FK), served\_at, device\_fingerprint\_hash, ip\_address, watermark\_token|customer\_id = auth.uid(). Admin can read all.|idx\_cps\_customer\_id. idx\_cps\_served\_at. idx\_cps\_watermark\_token (for leak detection).|Immutable audit log. No UPDATE or DELETE permitted (Supabase RLS: USING (false) for DELETE). Retained 3 years.|
|**accuracy\_log**|id, prediction\_id (FK), actual\_price, mape\_pct, directional\_correct (bool), evaluated\_at|Admin only.|idx\_accuracy\_prediction\_id. idx\_accuracy\_evaluated\_at.|Populated by dag\_accuracy\_monitor daily. Source of truth for MAPE dashboard and investor KPI reporting.|
|**model\_registry**|id, version, mape\_30d, directional\_accuracy, conformal\_coverage, promoted\_at, archived\_at, is\_champion (bool), s3\_artifact\_path|Admin only. READ by ML inference service (service role).|idx\_model\_registry\_is\_champion. idx\_model\_registry\_promoted\_at.|Single row where is\_champion=true at any time. Enforced via partial unique index: CREATE UNIQUE INDEX ON model\_registry(is\_champion) WHERE is\_champion=true.|
|**watermark\_events**|id, watermark\_token, detected\_at, platform (WhatsApp/Telegram/etc), customer\_id (FK, resolved), action\_taken, resolved\_at|Admin only.|idx\_watermark\_token. idx\_watermark\_customer\_id.|Populated by dag\_watermark\_audit. customer\_id resolved via watermark\_token lookup. Action states: DETECTED -> WARNING\_SENT -> ACCOUNT\_REVIEWED -> RESOLVED.|
|**raw\_prices**|id, source, district, commodity, price, price\_date, fetched\_at, validated (bool), staleness\_flag (bool)|Admin + ML service only. No customer access.|idx\_raw\_prices\_district\_date (composite). idx\_raw\_prices\_source.|Partitioned by month (Supabase PostgreSQL table partitioning). Retained 5 years per PRD. Partition pruning accelerates feature queries.|

## **5.3 Mobile App - React Native (Expo)**
Single codebase for iOS + Android. Offline-first architecture with local SQLite for the batch profit calculator. OTA updates via Expo EAS eliminate app store review delays for bug fixes.

|**Component**|**Implementation**|**Offline Behaviour**|**Cost Impact**|
| :-: | :-: | :-: | :-: |
|**State Management**|Zustand (lightweight Redux alternative). Single store: {auth, forecast, calculator, alerts}. Persisted to AsyncStorage for session continuity.|Full state available offline. Hydrated from AsyncStorage on app launch.|Zero cost. Zustand is open source.|
|**Local Database**|expo-sqlite for offline profit calculator. Schema: batches (id, flock\_size, age, feed\_cost, district). Pre-loaded with last 7-day price cache.|Calculator works fully offline using cached prices. Timestamp shown: 'Price data from [date]'.|Zero cost. expo-sqlite is part of Expo SDK.|
|**Price Cache**|Forecasts cached in AsyncStorage after first fetch. TTL: 24 hours. Stale warning shown prominently after 24h.|Last cached forecast displayed with staleness banner. No API call attempted offline.|Reduces API calls (and Vercel function invocations) by ~70%.|
|**OTA Updates**|Expo EAS Update. Critical bug fixes deployed within 5 minutes without App Store review. Only JS bundle updated - native code requires store submission.|OTA not applicable offline. Applied on next connection.|Free tier: unlimited OTA updates. App Store/Play Store submission: one-time $99 (Apple) + $25 (Google).|
|**WhatsApp Deep Link**|Sell signal WhatsApp message contains deep link: poulse://forecast?date=2026-05-16. App opens directly to today's forecast detail.|Deep link falls back to browser if app not installed. Browser shows unauthenticated preview with login prompt.|Zero cost. Expo handles deep link routing.|
|**FingerprintJS Pro**|Device fingerprint computed on first launch. Sent to /api/v1/auth/otp-verify on login. Stored as hash in JWT payload and Supabase customers table.|Not applicable offline. Login requires connection.|~Rs1,200/mo for FingerprintJS Pro API (shared with web dashboard). 99.5% accuracy cross-browser/device.|


# **6. Prediction IP Protection - Technical Implementation**
## **6.1 Zero-Width Character Watermarking**
Every prediction served by the API is watermarked with a unique, invisible identifier before delivery. This is the most critical security system in the product - it enables attribution of any leaked prediction to the exact customer who leaked it.

|<p>**WATERMARKING IS NON-NEGOTIABLE**</p><p>The watermark must be applied to 100% of predictions. No exceptions. No performance optimisations that bypass it.</p><p>Watermarking overhead: <5ms per prediction. This is negligible.</p><p>The watermark is applied in the API middleware layer - BEFORE the response is serialised. It cannot be bypassed by calling the ML inference service directly (that service is not publicly accessible).</p>|
| :- |

|**Watermark Layer**|**Technique**|**Payload**|**Technical Implementation**|
| :-: | :-: | :-: | :-: |
|**Text Watermark**|Zero-width Unicode character encoding (U+200B, U+200C, U+200D, U+FEFF) interspersed throughout prediction text.|128-bit payload: customer\_id (32-bit) + timestamp (32-bit, hour precision) + device\_fingerprint\_hash (32-bit) + HMAC-SHA256 signature (32-bit truncated).|Encoding: map each bit of payload to a ZWC character. Intersperse after every 5th visible character. Decoder: strip visible chars, decode ZWC sequence to bits, verify HMAC. Python: custom ZWC encoder in watermark\_service.py. Applied via FastAPI middleware before response.|
|**Numeric Watermark**|Micro-perturbation of forecast prices. +-0.5% of price value, unique per customer.|Unique price value identifies source. E.g., Customer A: Rs162.4/kg, Customer B: Rs162.6/kg.|Perturbation table stored in Supabase: watermark\_perturbations (customer\_id, date, perturbation\_amount). Lookup at prediction serve time. Perturbation always within model confidence interval. Visually indistinguishable to human (rounds to same Rs/kg display).|
|**WhatsApp Message Watermark**|ZWC encoding in WhatsApp message text. Applied to sell-signal daily message.|Same 128-bit payload as text watermark.|Twilio WhatsApp API accepts Unicode. ZWC characters survive WhatsApp message delivery. OCR of WhatsApp screenshot captures ZWC characters. Decoder processes OCR'd text and extracts payload.|
|**Watermark Decoder**|Automated OCR + ZWC decode pipeline. Runs in dag\_watermark\_audit daily.|Input: image screenshot OR text string. Output: customer\_id + timestamp if watermark found.|OCR: pytesseract on detected prediction screenshots. ZWC extraction: regex on OCR output (ZWC characters survive OCR as Unicode). HMAC verification to reject forged watermarks. <200ms per decode.|

## **6.2 Session & Device Binding Architecture**

|**Control**|**Implementation**|**Storage**|**Enforcement Logic**|
| :-: | :-: | :-: | :-: |
|**Device Fingerprint Binding**|FingerprintJS Pro (web) + Expo unique device ID (mobile). Computed on first login.|Hash (SHA-256) stored in customers.device\_fingerprint\_hash column. Raw fingerprint never stored.|On each request: compute current fingerprint, compare hash to stored value. If mismatch: return 403 + trigger OTP re-verification flow. Alert to CRM.|
|**Concurrent Session Limit**|Maximum 2 active sessions per customer (mobile + web). Implemented via Supabase sessions table.|sessions table: id, customer\_id, device\_fingerprint\_hash, created\_at, last\_active\_at, is\_active.|On new login: count active sessions for customer\_id. If >=2: invalidate oldest (UPDATE sessions SET is\_active=false WHERE customer\_id=$1 ORDER BY last\_active\_at ASC LIMIT 1). New session inserted.|
|**IP Geofencing (Soft)**|Log IP per request. Flag if 3+ distinct geographic clusters in 24h. Uses ip-api.com (free, 45 req/min).|access\_log table: customer\_id, ip, city, country, timestamp. Computed column: distinct\_city\_count\_24h.|Soft alert only - do not block (legitimate use case: farmer + accountant + field manager). Notify CRM: 'Unusual access pattern - review for account sharing.'|
|**API Rate Limiting**|Upstash Redis token bucket. Base: 1,000 calls/day per API key, 60/min burst. Enterprise: 10,000/day.|Upstash Redis (free tier: 10K commands/day). Key: ratelimit:{api\_key}:{date}. TTL: 24h.|Vercel Edge Middleware: check Redis token bucket before routing to function. Return 429 with Retry-After header (RFC 6585) if bucket exhausted. X-RateLimit-Remaining header on all responses.|


# **7. Security Architecture - OWASP & DPDP Compliance**
## **7.1 API Security Controls**

|**Control**|**Standard**|**Implementation**|**Technical Detail**|
| :-: | :-: | :-: | :-: |
|**Authentication**|OWASP API1: Broken Object Level Auth|Supabase Auth (phone OTP). JWT HS256. 7-day sliding expiry.|JWT payload: {sub: customer\_id, tier, device\_fp\_hash, iat, exp}. All API routes: validate JWT signature, check expiry, verify device\_fp\_hash matches current request fingerprint. Supabase RLS enforces row-level auth beyond JWT validation.|
|**Transport Security**|PCI-DSS TLS requirements|TLS 1.3 minimum. HSTS headers. Cloudflare terminates TLS.|Cloudflare WAF: Universal SSL with TLS 1.3. HSTS: Strict-Transport-Security: max-age=31536000; includeSubDomains. Certificate: Cloudflare-managed, auto-renewed. No self-signed certs in any environment.|
|**Request Signing (B2B API)**|AWS Signature V4 pattern|HMAC-SHA256 of (timestamp + endpoint + body\_hash). 5-minute window.|B2B clients sign requests: HMAC-SHA256(secret\_key, canonical\_string). Canonical string: '{timestamp}\n{endpoint}\n{sha256(body)}'. Vercel Edge rejects: missing signature, invalid signature, timestamp >5min old. Prevents replay attacks.|
|**Secrets Management**|OWASP A2: Cryptographic Failures|Vercel encrypted env vars. Supabase Vault for DB secrets. Pre-commit hook blocks secret patterns.|Pre-commit hook (git-secrets library): blocks commits containing patterns matching API keys, DB passwords, JWT secrets. All secrets in Vercel Dashboard (AES-256 encrypted at rest). No secrets in application code or GitHub Actions plaintext.|
|**SQL Injection Prevention**|OWASP A3: Injection|Supabase client library uses parameterised queries exclusively. No raw SQL concatenation.|Never use string concatenation for SQL. All DB access via Supabase JS client (parameterised) or pg\_safe\_query. Code review checklist item: flag any string interpolation in DB queries.|
|**Input Validation**|OWASP A3: Injection|Zod schema validation on all API inputs. Reject before business logic.|Every API endpoint defines a Zod schema. Invalid input: 400 response with field-level error messages. Example: phone number must match /^\+91[6-9]\d{9}$/. Price must be number between 50 and 500.|

## **7.2 DPDP Act 2023 Compliance Implementation**

|**DPDP Requirement**|**Our Implementation**|**Technical Detail**|**Verification Method**|
| :-: | :-: | :-: | :-: |
|**Explicit Consent**|Consent checkbox + Hindi summary at onboarding. Consent record stored.|Supabase: customers.consent\_given (bool), customers.consent\_given\_at (timestamp), customers.consent\_text\_version (FK to consent\_versions table). Consent text stored in both Hindi and English.|Audit: SELECT \* FROM customers WHERE consent\_given = false - should be empty for active customers.|
|**Right to Erasure**|DELETE /api/v1/account (authenticated). Cascades to all FK tables.|customers DELETE cascade: removes customer\_predictions\_served, sessions, watermark\_events linked to customer\_id. Phone hash deleted. Irreversible - confirmed with OTP re-verification.|Test: create test customer, delete, verify all FK records removed, verify no residual PII in any table.|
|**Data Minimisation**|Collect only: phone\_hash, district, flock\_size, tier. No name, no aadhaar, no bank.|Onboarding form has 3 fields: phone number (hashed immediately on submit), district (dropdown), approximate flock size (dropdown: 10K-25K, 25K-50K, 50K+). Name is optional and never required.|Code review: grep for 'name', 'aadhaar', 'pan', 'bank' in schema - should not exist as required fields.|
|**Data Localisation**|All Supabase data in ap-south-1 (Mumbai). No cross-border transfer of personal data.|Supabase project: ap-south-1. Third parties receive: Twilio (phone hash only), Anthropic Claude API (prediction values only - never personal data), FingerprintJS (device hash only).|Verify: Supabase dashboard shows region = ap-south-1. DPA signed with all processors confirming India data handling.|
|**Data Processor Agreements**|DPA signed with: Supabase, Vercel, Twilio, Anthropic, Cloudflare, Railway.app.|DPA files stored in legal/ folder in Google Drive (access: CTO + CEO only). Review annually. Each DPA confirms: no data sale, deletion on request, breach notification within 72h.|Checklist: all processors have signed DPA before any personal data flows to them. Verify annually.|


# **8. Total Cost of Ownership - Phase 0 to Phase 1**
## **8.1 Month-by-Month Infrastructure Cost**
This is the exact infrastructure cost breakdown for Phase 0 (Month 0-4, no paying customers) and Phase 1 (Month 4-8, first paying customers). Every line item is verifiable against the vendor's public pricing page.

|**Service**|**Plan**|**Phase 0 Cost/mo**|**Phase 1 Cost/mo**|**Trigger to Upgrade**|**Notes**|
| :-: | :-: | :-: | :-: | :-: | :-: |
|**Astronomer.io (Airflow)**|Free tier (up to 10 DAGs)|**Rs0**|**Rs0 -> Rs12,500**|Phase 1 adds >10 DAGs (new districts)|Phase 1: migrate to self-hosted Airflow on Railway.app (~Rs750/mo) OR Astronomer Paid. Plan migration at Month 3.|
|**Supabase PostgreSQL**|Free tier (500MB, 50K MAU)|**Rs0**|**Rs0 -> Rs2,100**|Data exceeds 500MB OR MAU >50K|500MB is generous for Phase 0 (price data is small). Phase 1: expect to hit limit at ~40 active customers.|
|**Railway.app (ML Serving)**|Hobby Plan (always-on FastAPI)|**Rs415/mo**|**Rs415/mo**|CPU saturation >80% (upgrade to Pro)|Hobby: $5/mo. Always-on required for <200ms inference SLA. Only always-on cost in the stack.|
|**Railway.app (Airflow Worker)**|Hobby Plan (triggered only)|**Rs200/mo**|**Rs200/mo**|Multiple workers needed|Worker runs DAGs, idles otherwise. Pay only for execution time.|
|**AWS Spot GPU (TFT Training)**|g4dn.xlarge Spot, 4 runs/month|**Rs2,500/mo**|**Rs2,500/mo**|More frequent retraining needed|~Rs625/run x 4 runs. Spot interruption handled by Airflow retry. Fallback: Google Colab Pro+.|
|**Twilio WhatsApp**|Pay-per-message (~Rs1.20/msg)|**Rs600/mo (500 msgs)**|**Rs1,200/mo (1K msgs)**|Switch to Meta Business API at >10K msg/mo|Phase 0: internal testing only. Phase 1: 15 customers x ~4 messages/day x 30 days ~= 1,800 messages.|
|**Claude Sonnet API (Hindi)**|Pay-per-token (~Rs1,500 at Phase 0 volume)|**Rs800/mo**|**Rs1,500/mo**|Volume-based, scales with customers|3 driver sentences per prediction per district. 4 districts x 1 prediction/day = ~120 API calls/day. Cached for 24h - not regenerated per customer request.|
|**Cloudflare WAF**|Free tier (unlimited bandwidth)|**Rs0**|**Rs0**|Enterprise features needed (Phase 2)|Free tier includes WAF, DDoS protection, CDN. Sufficient for Phase 0-1 scale.|
|**FingerprintJS Pro**|Pay-per-identification (~$0.002/ID)|**Rs600/mo (Phase 0 testing)**|**Rs1,200/mo (Phase 1)**|Volume-based|Phase 1: 15 customers x ~5 identifications/day x 30 = 2,250 IDs/month.|
|**Vercel (Frontend + API)**|Hobby Plan (free)|**Rs0**|**Rs0 -> Rs1,700**|>100K Edge Function invocations/month|Phase 1 at 15 active customers unlikely to hit 100K invocations. Monitor via Vercel Analytics.|
|**Upstash Redis (Rate Limit)**|Free tier (10K commands/day)|**Rs0**|**Rs0**|Scale beyond 10K commands/day|10K commands/day = ~7 commands/minute. Phase 1 easily within free tier.|
|**Sentry + PostHog**|Free tiers|**Rs0**|**Rs0**|Scale beyond free tier event limits|Sentry free: 5K errors/month. PostHog free: 1M events/month. Both sufficient for Phase 0-1.|
|**Domain + SSL**|Cloudflare Registrar (~Rs800/yr)|**Rs65/mo (amortised)**|**Rs65/mo**|No upgrade needed|poulse.ai or poulseai.com. Cloudflare SSL included free.|
|**Expo EAS (Mobile Builds)**|Free tier (30 builds/month)|**Rs0**|**Rs0**|Phase 2+ high build volume|Free tier more than sufficient for Phase 0-1. OTA updates unlimited on free tier.|

|**Phase 0 Total/mo**|**Phase 1 Total/mo (15 customers)**|**Gross Margin at Rs1.5L MRR**|**Break-Even Customers (PulsePro Rs3K)**|
| :-: | :-: | :-: | :-: |
|**~Rs5,180/mo**|**~Rs9,680/mo**|**~93.5%**|**~4 customers**|


# **9. Pre-Launch Accuracy Certification Protocol**
## **9.1 The 16-Week Technical Execution Plan**
This is the engineering execution plan for achieving 95%+ accuracy before a single customer is onboarded. Each week has a defined deliverable, a measurable gate, and a defined action if the gate is not cleared.

|**Wk**|**Engineering Task**|**Deliverable**|**MAPE Gate**|**Direction Gate**|**Blocker Action**|
| :-: | :-: | :-: | :-: | :-: | :-: |
|**1-2**|Provision all infra: Astronomer.io, Supabase (Mumbai), Railway.app. Build 9 Airflow DAGs. Collect and clean 36-month historical data. Completeness validation.|Clean 36-month dataset. 95%+ completeness per mandi. Data schema documented.|**-**|**-**|If AGMARKNET data <80% complete for any target mandi: hire local data collection agent (Rs5-8K/mo). Do NOT proceed to Week 3 without 95% completeness.|
|**3-4**|Feature engineering v1: 20 core features. SHAP analysis on v1 feature set.|Feature matrix v1 (20 features). SHAP importance chart. feed\_cost\_lag42 confirmed as top-3 feature.|**Baseline only**|**Baseline only**|If SHAP shows feed\_cost\_lag42 not in top 3: data alignment problem. Verify maize price date alignment with broiler grow-out. Re-run pipeline.|
|**5-6**|ARIMA(0,1,4) baseline + Prophet seasonality. Train on 30-month split, test on 6-month holdout.|ARIMA model artifact. Baseline MAPE + directional accuracy documented.|**<18%**|**>65%**|If baseline MAPE >25%: data quality problem (not model problem). Return to Weeks 1-2 data cleaning before model work.|
|**7-9**|LightGBM: 45 features, TimeSeriesSplit n=5, Optuna hyperparameter tuning (50 trials). Ensemble v1: ARIMA + LightGBM.|LightGBM model. Ensemble v1. SHAP analysis. Feature importance doc.|**<12%**|**>80%**|If directional accuracy <80% after LightGBM: add 5 additional features from supplementary list (fuel price delta, soya\_lag35, cold\_wave\_lag5, district\_competitor\_price, chicken\_disease\_season\_flag).|
|**10-12**|Temporal Fusion Transformer (pytorch-forecasting). Quantile outputs P10/P50/P90. Full ensemble: ARIMA + Prophet + LightGBM + TFT with Ridge meta-learner. Conformal prediction calibration.|TFT artifacts. Full ensemble MAPE. Conformal coverage on calibration set.|**<8%**|**>90%**|If TFT fails to improve on LightGBM alone (by >1% MAPE): investigate data leakage in TFT. Specifically check: is future data visible in TFT encoder? TFT must see improvement.|
|**13-14**|Stress testing: (a) Nov-Mar 2024 UP crash. (b) HPAI Gorakhpur zone 2023. (c) Diwali 2023 demand spike.|Stress test report. All 3 events: directional accuracy documented.|**<7%**|**>93%**|Any stress test fails directionally: add targeted feature for that specific scenario. Re-train. Do not proceed to Week 15 until all 3 pass.|
|**15**|Manual ground-truth validation: CTO + Data Head in Gorakhpur APMC for 10 consecutive trading days.|Manual validation log: 10 days of model prediction vs physical mandi price. Signed by CTO.|**<6%**|**>94%**|If physical validation shows <90% directional match on those 10 days: extend to 15 days. Diagnose failures. Do NOT proceed to certification.|
|**16**|Final accuracy certification: run model on 6-month holdout (sealed). Compute all 3 metrics simultaneously.|Accuracy Certification Report (PDF). Signed by CTO + CEO. Filed in investor data room.|**<6%**|**>95%**|ANY metric fails: return to Week 9. Add diagnosis section to report explaining root cause. Do NOT launch. Do NOT take any payment.|


# **10. Monitoring, Alerting & Incident Response**
## **10.1 Monitoring Stack (Zero Additional Cost)**

|**Tool**|**What It Monitors**|**Free Tier Limits**|**Cost**|**Alert Channel**|
| :-: | :-: | :-: | :-: | :-: |
|**Sentry**|Application errors (Python FastAPI + Next.js + React Native). Stack traces. Release tracking.|5,000 errors/month. 1 team member.|**Free**|Slack #errors channel. PagerDuty for P0 errors (free tier: 1 on-call user).|
|**PostHog**|Product analytics: DAU, feature usage, funnel drop-off. Custom events for prediction served, sell-signal opened, calculator used.|1,000,000 events/month. Unlimited users.|**Free**|PostHog dashboard. Weekly digest email to CTO.|
|**Uptime Robot**|API health endpoint uptime: GET /health every 5 minutes. Alerts on downtime.|50 monitors. 5-minute check interval.|**Free**|Email + SMS alert to CTO on downtime. WhatsApp alert if downtime >10 min.|
|**Railway.app Metrics**|CPU, memory, request count, response time for ML inference service. Built-in Railway dashboard.|Included in Railway plan.|**Free (included)**|Railway dashboard. Alert via Railway webhook to Slack if CPU >80%.|
|**Airflow (Astronomer.io)**|DAG run success/failure. Task duration. SLA miss alerts.|Included in free tier.|**Free**|Astronomer built-in alerts. Email on DAG failure.|
|**Supabase Monitoring**|Query performance. DB size. Connection pool. Table bloat.|Included in free tier.|**Free**|Supabase dashboard alerts. Email on DB size >400MB (approaching 500MB free limit).|
|**Custom MAPE Dashboard**|30-day rolling MAPE + directional accuracy. Built as Next.js page at /admin/accuracy (admin auth only).|Self-built. No additional cost.|**Rs0 (built-in)**|Automated Slack post every Monday: weekly MAPE + directional accuracy vs targets.|

## **10.2 Incident Response Runbook**

|**Incident Type**|**Severity**|**Response SLA**|**Immediate Action**|**Root Cause Protocol**|
| :-: | :-: | :-: | :-: | :-: |
|**ML Inference Down**|**P0 - Critical**|15 min|1\. Serve last cached prediction with staleness flag. 2. Alert CTO via PagerDuty. 3. Check Railway.app status page.|Railway.app down: escalate to Railway support. Code crash: check Sentry stack trace. Rollback to previous Docker image (railway rollback). Target: restore within 30 min.|
|**MAPE >8% (rolling 30d)**|**P0 - Critical**|2 hours (diagnosis)|1\. DO NOT serve new predictions without review. 2. Alert CTO + Data Head. 3. Serve previous day prediction with 'Under Review' flag.|Check: new data quality issue (validation logs). Recent distribution shift in Gorakhpur prices. HPAI event not captured. Missing feature values. Initiate emergency retrain with diagnosis. Do not promote until root cause identified.|
|**Watermark Leak Detected**|**P1 - High**|1 hour|1\. Log event to watermark\_events table. 2. Identify customer from watermark token. 3. Send automated warning email to customer.|First offence: warning email + account review. Second: CTO call + account suspension warning. Third: account suspend + legal process per contract.|
|**AGMARKNET API Down >24h**|**P1 - High**|4 hours|1\. Switch to fallback: previous day data with staleness flag. 2. Activate local data collection agent (manual mandi visit). 3. Alert Slack.|AGMARKNET downtime is common. Manual data collection is the designed fallback. Model can operate on T-1 data for up to 5 days without significant accuracy impact.|
|**Data Breach Suspicion**|**P0 - Critical**|Immediate|1\. CTO is incident commander. 2. Isolate affected system immediately. 3. Notify CEO. 4. Preserve all logs.|DPDP Act: notify affected customers within 24h. Follow breach notification runbook (stored in legal/incident-response.md). Engage CERT-IN if >100 records affected.|


# **11. Key Technical Decisions & Rationale**
Every major technology choice in this stack has an alternative that was explicitly considered and rejected. This section documents those decisions to prevent re-litigation in engineering discussions.

|**Decision Area**|**Chosen**|**Rejected Alternative**|**Reason Chosen**|**Condition to Reconsider**|
| :-: | :-: | :-: | :-: | :-: |
|**ML Serving**|**ONNX quantised on Railway.app CPU (Rs415/mo)**|Always-on GPU on EC2 (Rs4,100+/mo)|ONNX INT8 quantisation achieves <200ms P95 on CPU. Saves Rs44K+/year before Series A.|Reconsider if model complexity increases (>500M parameters) or P95 latency >300ms. Neither expected in Phase 0-1.|
|**Database**|**Supabase PostgreSQL (Mumbai, free -> Rs2,100)**|PlanetScale / Neon / AWS RDS|Supabase = auth + DB + RLS + real-time in one. DPDP compliant India region. Built-in phone OTP. Fastest path to working auth.|Reconsider at Series A if Supabase pricing becomes unfavourable at scale (>10TB). Migration to RDS is 4-hour operation - schema is portable SQL.|
|**Frontend Framework**|**Next.js 15 on Vercel (free tier)**|Laravel / Django / Express.js|Next.js = SSR + API routes + Edge Functions in one deploy. Vercel free tier generous. Expo shares React Native component library.|No reason to change before Phase 3. Reconsider if team has no JavaScript expertise (unlikely).|
|**ML Pipeline**|**Airflow on Astronomer.io free tier**|Prefect Cloud / Luigi / cron jobs|Airflow = industry standard for data pipelines. Astronomer.io free tier = managed without DevOps. DAG code is portable - self-host at Rs750/mo when needed.|Migrate to self-hosted at Month 3 when new district DAGs exceed free tier limit.|
|**Watermarking**|**Custom ZWC + numeric perturbation**|Commercial DRM solution (e.g., Verimatrix)|Custom solution: Rs0 cost, full control, purpose-built for text predictions. Commercial DRM: Rs15K+/mo, designed for video/audio, not text.|Reconsider commercial solution only if custom implementation proves insufficient (detected leak rate >20% without successful decode).|
|**WhatsApp Delivery**|**Twilio WhatsApp API**|Meta Business API direct|Twilio: faster to integrate, better developer experience. Meta Business API: cheaper at volume but requires business verification process (4-6 weeks).|Migrate to Meta Business API direct at >10K messages/month (Phase 2). Budget in advance: application process takes 6 weeks.|
|**Hindi Text Generation**|**Claude Sonnet API (Anthropic)**|GPT-4o / Gemini Pro / Local LLM|Claude Sonnet: best Hindi output quality in testing. Anthropic DPA available. ~Rs1,500/mo at Phase 0 volume - acceptable.|Reconsider if Claude Sonnet costs exceed Rs10K/mo (requires 7x volume increase). Could fine-tune a local Hindi model at Phase 2.|
|**Device Fingerprinting**|**FingerprintJS Pro (~Rs1,200/mo)**|Open-source fingerprint.js / device UUID only|FingerprintJS Pro: 99.5% accuracy, bot detection, cross-browser consistency. Essential for account-sharing detection in B2B product.|No reconsideration - this is core to IP protection. Cost scales with identifications, not flat fee.|


# **12. Engineering Hiring - Technical Skillset Requirements**
## **12.1 Founding Team Technical Depth (Must-Have vs Nice-to-Have)**

|**Role**|**Priority**|**Non-Negotiable Skills**|**Nice-to-Have**|**Technical Interview Test**|
| :-: | :-: | :-: | :-: | :-: |
|**CTO / ML Lead**|**FOUNDING**|Python (advanced). LightGBM + SHAP. Time-series validation (TimeSeriesSplit, no data leakage). FastAPI. Supabase. Railway.app. Security-aware (OWASP top 10). Can explain MAPE vs MAE vs RMSE correctly.|pytorch-forecasting TFT. ONNX export. Conformal prediction. AWS Spot.|Given a 3-year daily price time series with known seasonality: design the feature engineering pipeline and explain exactly why random train/test split is wrong. Must answer in <5 minutes.|
|**Head of Data / Field**|**FOUNDING**|Python pandas + numpy. Airflow DAG authorship. AGMARKNET API integration. Can visit Gorakhpur mandi for physical validation. Hindi fluency (written + spoken).|Great Expectations. Parquet + dask for large datasets. PostGIS.|Given the AGMARKNET API response JSON: write a Python function to extract Gorakhpur broiler prices, handle missing values, and detect price outliers. Live coding, 30 minutes.|
|**Full-Stack Engineer #1**|**Month 7-9**|TypeScript. Next.js 14+. React Native (Expo). Supabase client. Vercel deployment. REST API design (OpenAPI). JWT auth implementation.|Edge Functions. ONNX runtime in Node. WebSocket.|Build a working Next.js API route that validates a JWT, checks Supabase RLS, calls a mock ML service, and applies a watermark to the response. 90 minutes.|
|**ML Engineer #2**|**Month 8-10**|pytorch-forecasting TFT. MLOps: Airflow, model registry, champion/challenger. ONNX quantisation. Hyperparameter optimisation (Optuna).|DoWhy causal inference. Conformal prediction (MAPIE).|Explain: why does the TFT need to be quantised? Walk through the exact commands to export a PyTorch model to ONNX INT8 and verify accuracy regression.|

# **13. Open-Source Library Stack - Complete Technical Reference**

|**Library**|**Version (pin)**|**Layer**|**License**|**Why This, Not Alternative**|
| :-: | :-: | :-: | :-: | :-: |
|**lightgbm**|4\.3.0|ML Training|MIT|Fastest tree-based model for tabular data. SHAP native integration. Handles missing values without imputation. 10-100x faster than XGBoost on this dataset size.|
|**shap**|0\.45.0|ML Explainability|MIT|Industry standard for model explainability. Required for: (a) SHAP feature importance analysis, (b) generating 3 plain-Hindi prediction drivers per forecast.|
|**optuna**|3\.6.1|Hyperparameter Opt|MIT|Best-in-class hyperparameter optimisation. Pruning: stops unpromising trials early (saves 40% GPU time vs grid search). Native LightGBM integration.|
|**statsmodels**|0\.14.2|ML Training (ARIMA)|BSD-3|Definitive Python ARIMA implementation. Used by Karnataka paper referenced in PRD. ARIMA(0,1,4) config exactly as specified.|
|**prophet**|1\.1.5|ML Training (Seasonal)|MIT|Facebook Prophet handles: Indian holiday calendar, seasonal decomposition, structural breaks. Requires pystan backend (install first).|
|**pytorch-forecasting**|1\.0.0|ML Training (TFT)|MIT|Only production-grade TFT implementation in Python. Quantile outputs (P10/P50/P90) native. pytorch-lightning training loop.|
|**onnxruntime**|1\.18.0|ML Serving (CPU)|MIT|Inference runtime for ONNX quantised models. CPU inference <200ms P95 on 1 vCPU. 70% smaller model vs PyTorch.|
|**mapie**|0\.8.3|Conformal Prediction|BSD-3|Clean API for conformal prediction calibration. Required to validate 78-82% coverage for 80% confidence intervals.|
|**dowhy**|0\.11.1|Causal Inference (Phase 2)|MIT|Causal graph + intervention estimation. Required for Phase 2 PulseEnterprise: 'If feed cost rises 10%, what is price impact in 42 days?'|
|**great-expectations**|0\.18.14|Data Validation|Apache-2.0|Industry standard for data pipeline validation. Suite-based expectations: define once, validate on every DAG run. JSON output integrates with Airflow alerting.|
|**apache-airflow**|2\.9.1|Pipeline Orchestration|Apache-2.0|Industry standard DAG orchestration. Astronomer.io managed free tier. Retry logic, SLA miss alerts, task dependencies all built-in.|
|**fastapi**|0\.111.0|ML Inference API|MIT|Async Python API framework. OpenAPI schema auto-generated. <5ms framework overhead vs uvicorn raw. Middleware layer for watermarking.|
|**tabula-py**|2\.9.0|PDF Extraction|MIT|Java-based PDF table extractor. Required for DAHDF disease bulletin weekly PDF parsing. tabula-py is the Python wrapper.|
|**pytrends**|4\.9.2|Google Trends|MIT|Unofficial but widely-used Google Trends API. Cache results aggressively (7-day validity). Demand signal proxy for 'chicken price Gorakhpur'.|
|**stegano**|0\.11.2|Watermarking|MIT|LSB steganography for image watermarking. Combined with custom ZWC encoder for text watermarking. Zero-width character encoder: custom implementation in watermark\_service.py.|
|**fingerprintjs**|3\.4.1 (JS)|Device Binding|BSL 1.1 (free use)|Open-source version for MVP testing. FingerprintJS Pro API for production (99.5% accuracy vs ~60% open-source). Switch to Pro before first paying customer.|


# **14. Pre-Launch Engineering Checklist**
Every item below must be checked before the first paying customer is onboarded. No item is optional. The CTO signs this checklist as part of the Accuracy Certification Report.

|**#**|**Checklist Item**|**Owner**|**Verification Method**|
| :-: | :-: | :-: | :-: |
|**1**|Accuracy Certification Report signed: MAPE <6%, Directional >95%, Conformal coverage 78-82%|**CTO + CEO**|PDF report in investor data room. Signed with Aadhaar eSign.|
|**2**|10 consecutive days of manual mandi validation completed by CTO/Data Head in Gorakhpur APMC.|**CTO + Data Head**|Manual validation log: spreadsheet with date, model\_prediction, actual\_price, directional\_correct. Signed by CTO.|
|**3**|Watermarking service live and tested on 100 predictions. Decode pipeline verified.|**CTO**|Test: create 10 test predictions, screenshot, run through decoder, verify all 10 decode to correct customer\_id.|
|**4**|DPDP Act compliance: phone hashing live, consent flow live, erasure endpoint tested.|**CTO**|Test: create test user, request erasure via API, verify DELETE cascade removes all FK records.|
|**5**|Supabase RLS: no customer can read another customer's data. Cross-customer query returns 0 rows.|**CTO**|Test: login as Customer A, attempt GET /api/v1/forecast with Customer B's customer\_id in query params. Must return 403.|
|**6**|API rate limiting active: 429 returned correctly after 1,001 calls in 24h.|**CTO**|Automated test: make 1,001 API calls in sequence, verify 1001st returns 429 with Retry-After header.|
|**7**|JWT authentication: expired token returns 401, tampered token returns 401, valid token returns 200.|**CTO**|Automated test suite. Must be in CI pipeline - runs on every PR merge.|
|**8**|AGMARKNET fallback tested: DAG fails -> previous day data served with staleness\_flag=True.|**Data Head**|Simulate: disable AGMARKNET DAG, trigger dag\_model\_infer, verify staleness flag in prediction response.|
|**9**|Champion/challenger framework: challenger fails to beat champion -> champion retained.|**ML Lead (CTO)**|Test: train intentionally degraded model (remove top 3 features), run through champion/challenger, verify champion retained.|
|**10**|Stress test passed: Nov-Mar 2024 UP crash, HPAI 2023, Diwali 2023 - all directionally correct.|**ML Lead**|Stress test report in data room. Each event: model\_direction vs actual\_direction for that period.|
|**11**|Mobile app: offline batch calculator works without network. Staleness banner shown.|**Full-Stack**|Test on airplane mode: open app, use calculator, verify result returned. Connect network, verify sync.|
|**12**|Non-redistribution contract clause and liquidated damages clause reviewed by legal counsel.|**CEO + Legal**|Contract signed by legal counsel. Stored in legal/ folder. At least 1 lawyer (IP-focused) has reviewed.|
|**13**|Data Processing Agreements signed with: Supabase, Vercel, Twilio, Anthropic, Cloudflare.|**CTO + CEO**|DPA files in legal/dpa/ folder. Each has signature from vendor + PoultryPulse CEO.|
|**14**|Secrets audit: zero secrets in GitHub repository. Pre-commit hook active on all dev machines.|**CTO**|Run git-secrets --scan-history on entire repo. Zero findings.|
|**15**|Uptime monitoring active: Uptime Robot pinging /health every 5 minutes. Alert goes to CTO's phone.|**CTO**|Uptime Robot dashboard: monitor active. Send test alert. Verify CTO receives SMS.|

|<p>**FINAL ARCHITECT'S NOTE**</p><p>This TRD describes a production-grade system that costs less than a mid-range Android phone per month to operate at zero users.</p><p>The architecture is not a compromise - it is a deliberate choice to invest engineering effort (which is cheap) instead of infrastructure cost (which is continuous).</p><p>ONNX quantisation, serverless design, Spot GPU burst, and free-tier maximisation are not shortcuts - they are the correct engineering decisions for this stage.</p><p>The day you onboard your first paying customer at Rs3,000/month, your infrastructure is already profitable (4 customers = break-even).</p><p>Build for zero. Scale for revenue. Never the other way around.</p>|
| :- |

© 2026 PoultryPulse AI. Technical Requirements Document v1.0. CONFIDENTIAL.
© 2026 PoultryPulse AI · Zero-to-Low-Cost Architecture · Pre-Revenue Phase	Page 
