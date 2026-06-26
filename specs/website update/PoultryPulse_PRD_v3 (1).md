PoultryPulse AI — PRD v3.0 · Gorakhpur Launch Edition	**CONFIDENTIAL**

**PoultryPulse AI**

Product Requirements Document — Enterprise Edition v3.0

*B2B Price Intelligence Platform · Gorakhpur District Launch · Pre-Live 95%+ Accuracy Mandate*

|<p>Version</p><p>**v3.0 — Strategic Reboot**</p>|<p>Date</p><p>**May 2026**</p>|<p>Classification</p><p>**CONFIDENTIAL — Investor & Engineering**</p>|<p>Authored by</p><p>**Senior Architect, 30+ yr Experience**</p>|
| :-: | :-: | :-: | :-: |


# **Table of Contents**





# **1. Strategic Reboot — Key Decisions & Rationale**
Senior Architect's Note (v3.0): This version makes four fundamental strategic changes from v2.0. Each change is backed by first-principles reasoning, not preference. Investors and engineers must understand WHY these changes were made before reading the rest of the document.

|**Decision**|**v2.0 (Old)**|**v3.0 (New)**|**Why Changed**|
| :- | :- | :- | :- |
|Business Model|Free for all farmers|Paid-only, no free tier|Farmers with fewer than 10K birds cannot demonstrate ROI. Free tier creates support burden with zero revenue. Focus on quality customers who feel the pain acutely.|
|Target Customer|7M+ smallholders|Commercial farmers 10K+ birds AND mid-size integrators|10K+ bird operators have measurable losses (₹10L+/year in timing mistakes). They have phones, bank accounts, and business orientation. They will pay.|
|Launch Geography|Andhra Pradesh / Telangana|Gorakhpur district + adjacent districts (UP)|Gorakhpur is India's fastest-growing poultry hub. High density of commercial farms. Manageable for manual validation. Expansion path to entire UP belt is clear.|
|Go-Live Accuracy|70% directional at launch|95%+ accuracy MANDATORY before any commercial launch|Launching with 70% destroys trust permanently. One wrong prediction shared on WhatsApp kills the product. 95% validated offline before Day 1.|
# **2. Executive Summary**
PoultryPulse AI is a B2B-first AI-powered poultry price intelligence platform targeting commercial-scale farmers (10,000+ birds) and mid-size integrators across India. Unlike the failed 'free-for-all farmers' model that every agri-tech startup has attempted, PoultryPulse is built on a fundamentally different premise: the customer must feel the pain of price opacity so acutely that paying ₹2,000–15,000/month is an obvious, immediate decision.

**VISION**

PoultryPulse AI becomes the essential operating intelligence layer for every commercial poultry operation in India — the tool that tells you exactly when to sell, when to buy feed, and when to hold, with verified accuracy that earns the right to charge a premium.

**MARKET SNAPSHOT**

|<p>**₹8,433B**</p><p>**India poultry market by 2034**</p><p>*CAGR 13.8%*</p>|<p>**10K+**</p><p>**Minimum bird count to target**</p><p>*~85,000 such farms in India*</p>|<p>**95%+**</p><p>**Accuracy required before launch**</p><p>*Non-negotiable gate*</p>|<p>**Gorakhpur**</p><p>**Launch district — Phase 0**</p><p>*Highest poultry density in UP*</p>|
| :- | :- | :- | :- |

**THE CORE INSIGHT**

|**What Everyone Else Does**|**What We Do Differently**|
| :- | :- |
|Target all 7M farmers → zero willingness to pay → no revenue|Target 10K+ bird commercial farms → clear ROI → immediate willingness to pay|
|Launch with 70% accuracy → one wrong viral WhatsApp prediction → product is dead|Achieve 95%+ accuracy on public data BEFORE launch → first prediction builds trust|
|Free tier subsidises B2B → creates support burden, confuses positioning|Zero free tier → every customer is a revenue customer → clean unit economics|
|National launch → spread thin → validation impossible → model doesn't improve|Gorakhpur first → deep local validation → expand with proof → compounding moat|

**REVENUE TIMELINE (CONSERVATIVE)**

|**Phase**|**Timeframe**|**Revenue**|**Customer Type**|**Milestone**|
| :- | :- | :- | :- | :- |
|0|Months 0–4|₹0|None (training + validation)|95%+ accuracy achieved on public data. Not one rupee taken before this gate.|
|1|Months 4–8|₹60K–2L/mo|5–15 paying commercial farms|Gorakhpur + 2 adjacent districts. Paid pilots at ₹2,000–5,000/mo.|
|2|Months 8–18|₹5L–15L/mo|30–80 B2B clients|UP belt expansion. Integrators + feed companies. API contracts.|
|3|Months 18–36|₹25L–75L/mo|200+ B2B clients|National expansion. Enterprise QSR + insurer tier. Series A.|
# **3. Problem & Market Opportunity**
## **3.1 Why 10,000+ Birds is the Right Minimum**
This is the most important sizing decision in the document. Every farmer with fewer than 10,000 birds:

- Cannot afford a ₹2,000+/month subscription even if they want to — their total monthly profit margin is often less than ₹15,000.
- Cannot generate enough transaction volume for our prediction to create measurable ROI within their cognitive horizon.
- Has no procurement infrastructure — they sell to one local aggregator regardless of our prediction.
- Creates enormous support burden (WhatsApp calls, language issues, onboarding) with zero revenue.

**A farmer with 10,000 birds selling monthly at even ₹2/bird improvement = ₹20,000/month benefit from our service. Paying ₹3,000/month for that is a 6.7x ROI. The conversation sells itself.**

|**Farm Size**|**Monthly Revenue Range**|**Potential Benefit/Month**|**Willingness to Pay**|**Our Target?**|
| :- | :- | :- | :- | :- |
|<500 birds|₹20K–80K|₹500–1,000|₹0 (cannot pay)|❌ No|
|500–5K birds|₹80K–4L|₹2,000–8,000|₹200–500 max|❌ No|
|5K–10K birds|₹4L–8L|₹8,000–16,000|₹500–1,500|⚠️ Marginal|
|10K–50K birds|₹8L–40L|₹16,000–80,000|₹2,000–8,000|✅ YES — Core target|
|50K–500K birds (integrators)|₹40L–4Cr|₹80K–8L|₹10,000–50,000|✅ YES — Premium target|
|>500K birds (major integrators)|₹4Cr+|₹8L+|₹50,000–2,00,000|✅ YES — Enterprise|

## **3.2 Gorakhpur — Why This District First**
Gorakhpur district and the surrounding Purvanchal belt in eastern Uttar Pradesh is one of the most underserved yet fastest-growing poultry markets in India. The choice is not arbitrary — it is the result of applying six selection criteria simultaneously:

|**Selection Criterion**|**Gorakhpur Score**|**Why It Matters**|
| :- | :- | :- |
|Commercial farm density (10K+ birds)|★★★★★|Eastern UP has the highest concentration of mid-size commercial farms outside AP/Telangana. NABARD estimates 8,000+ commercial farms within 150km radius of Gorakhpur.|
|Price volatility (= pain = willingness to pay)|★★★★★|UP broiler prices swing ±35% seasonally. No organised price reporting mechanism. Farmers completely reliant on middlemen. Maximum pain = maximum willingness to pay.|
|Digital infrastructure|★★★☆☆|4G penetration >65% in Gorakhpur district. WhatsApp-native farmers. Hindi fluency = single language needed for Phase 0.|
|Validation feasibility|★★★★★|Manageable geographic radius (150km). Allows manual ground-truth validation by visiting mandis. Can confirm prediction accuracy physically before trusting the model.|
|Government support (UP agri-tech)|★★★★☆|UP Digital Agriculture Mission actively seeks tech pilots. UPCB (UP Cooperative Bank) has active agri-lending in district. NABARD UP regional office in Lucknow (200km).|
|Competition vacuum|★★★★★|Zero organised digital price intelligence in Gorakhpur. Not a single competitor. First-mover advantage with full local trust-building period.|

## **3.3 Gorakhpur Poultry Market Profile**

|**Parameter**|**Detail**|**Source**|
| :- | :- | :- |
|Estimated commercial farms (10K+ birds within 150km)|~1,200–1,800 farms (Gorakhpur, Deoria, Kushinagar, Maharajganj, Sant Kabir Nagar, Basti districts)|NABARD UP district survey, AHIDF applicants database|
|Primary commodity|Broiler live weight (dominant). Some egg layers in Basti/Deoria.|Field observation + AGMARKNET Gorakhpur mandi data|
|Typical sell cycle|35–42 day grow-out. Harvest 2–3 batches/year per shed.|Industry standard for Cobb/Ross breeds in UP climate|
|Current price discovery method|Phone calls to 2–3 local traders morning of sale. No forward visibility whatsoever.|Primary research — farmer interviews (June 2025 data)|
|Average loss from mistimed selling|₹1.50–₹4.00/bird. At 20,000 birds, this is ₹30,000–80,000 per batch.|Engormix UP farmer forum, estimated from price crash data|
|Key mandis|Gorakhpur APMC, Deoria Mandi, Basti Mandi, Kushinagar mandi|AGMARKNET UP records|
|Nearest feed mills|3 major (Godrej Agrovet Gorakhpur depot, Amrit Feeds Varanasi, local Purvanchal mills)|Trade directory, CLFMA membership list|
|Addressable Phase 0 revenue (1,200 farms × ₹3,000/mo × 5% penetration)|₹1.8L/month within 12 months of launch|Conservative 5% penetration of Phase 0 target market|

## **3.4 The Five Root Problems (Validated for Gorakhpur)**

|**Problem**|**Gorakhpur Manifestation**|**Financial Impact per Farm**|**Severity**|
| :- | :- | :- | :- |
|Price Opacity|100% of broilers sold live to local traders. Farmer gets price quoted morning of sale — no advance knowledge. No NECC equivalent for UP broiler.|₹30K–80K/batch at 20K birds from suboptimal sell timing|Critical|
|No Forward Visibility|Prices crashed Nov–Mar 2024 in UP due to oversupply from AP/Telangana transport. Gorakhpur farmers held birds 2 extra weeks and lost ₹3–5/bird across entire district.|₹60K–1L extra loss per farm during the 2024 crash|Critical|
|Feed Cost Volatility|Maize/soya prices in UP spike faster than national average due to procurement delays from Madhya Pradesh. No early warning mechanism.|₹20K–50K/batch from poorly-timed feed procurement|High|
|Disease Outbreak Blind Spot|HPAI zone declarations have hit Gorakhpur belt (2023, 2024). Farmers had zero advance warning — heard about it when transport was already blocked.|₹1L–5L total loss when outbreak hits a 20K-bird shed|High|
|Middleman Exploitation|Local trader in Gorakhpur pays ₹8/kg when Lucknow wholesale is ₹10/kg. Farmer has no price benchmark to negotiate. Difference = pure middleman margin.|₹1.6L/batch at 20K birds × ₹2/kg × 4 kg avg live weight|Medium|
# **4. Target Customer Segments**
No free tier exists in this product. Every customer segment pays from Day 1 of their use. This is a deliberate, non-negotiable strategic decision. If an operator cannot pay ₹2,000/month, they are not our customer — they are a future customer who needs to grow their farm first.

|**Segment**|**Profile**|**Farm Size**|**Monthly Pricing**|**Pain Acuity**|**Phase**|
| :- | :- | :- | :- | :- | :- |
|S1: Commercial Farm (Core)|10K–50K bird independent farmer. Own shed. Sells via local traders. Hindi-speaking. Basic smartphone.|10K–50K birds|₹2,000–5,000/mo|Lost ₹50K–1.5L last batch from timing. Will pay ₹3K to avoid it.|Phase 0|
|S2: Mid-Size Integrator|50K–500K birds managed via contract farming. Has operations team, accountant. Data-driven decisions.|50K–500K birds|₹8,000–25,000/mo|Harvest timing optimisation across 20+ farms = ₹10L+ monthly impact.|Phase 1|
|S3: Feed Manufacturer (Regional)|Regional feed mill serving Gorakhpur/UP belt. Needs demand forecasting to plan production runs and raw material procurement.|Serves 200–2000 farms|₹10,000–30,000/mo|Feed overstock/stockout cost = ₹20L+/quarter. Price intelligence has immediate ROI.|Phase 1|
|S4: Poultry Trader/Commission Agent|Licensed APMC trader buying from farms and selling to processors. Needs price intelligence edge vs competitors.|Handles 1L–10L birds/month|₹5,000–15,000/mo|Profit margin = ₹0.50–2/kg. Better price intelligence = direct profit.|Phase 1|
|S5: QSR / Processor (Enterprise)|KFC India, McDonald's, Licious, Rebel Foods procurement teams. Need 30–60 day forward pricing for contract lock-in.|National scale|₹50,000–2,00,000/mo|1% COGS reduction = crores. Willing to pay enterprise rates for verified accuracy.|Phase 2|
|S6: Livestock Insurer|Bajaj Allianz, HDFC Ergo crop & livestock insurance. Need actuarial price volatility data and disease risk scoring.|Underwrites 1M+ birds|₹15,000–80,000/mo (data licensing)|Mis-priced premium risk = multi-crore loss exposure. Data has direct underwriting value.|Phase 2|

## **4.1 Primary Persona — Commercial Farm Operator (S1)**

|**Attribute**|**Detail**|
| :- | :- |
|Name / Profile|Rajesh Yadav, Gorakhpur. 35 years old. Runs 25,000-bird broiler shed on family land. Annual revenue ~₹90L. Net margin ~₹12–18L in good years.|
|Current pain (verbatim equivalent)|'Main soch ke raha tha 2 aur hafte, kyunki price thodi upar jaayegi — lekin gayi neeche aur mujhe ₹2.5 /kg nuksaan hua.' (I waited 2 more weeks thinking price would rise — it fell and I lost ₹2.5/kg.)|
|Tech comfort|WhatsApp daily. YouTube farming videos. Has Android phone (₹8,000–15,000 range). No laptop. Manages farm via WhatsApp groups.|
|Decision making|Calls 3 local traders every morning. Sells when price feels 'right'. Zero data. Pure gut. Has lost money 3 out of last 5 batches.|
|Willingness to pay|Will pay ₹3,000/month without negotiation if the first prediction saves him ₹20,000. Will pay ₹5,000/month after 2 correct predictions in a row.|
|Acquisition channel|WhatsApp farmer groups (Gorakhpur Poultry Farmers — 2,300 members). Local poultry vet referral. Feed dealer referral (they know every commercial farmer).|
|Success metric|'Batch mein ₹30,000 zyada mila' (Made ₹30,000 more per batch). If he can say this to his wife, he renews for life.|
|Churn trigger|Two consecutive wrong predictions with significant financial consequence. One wrong prediction he forgives. Two, he leaves and tells everyone.|
# **5. Public Data Sources & ML Training Architecture**
Architect's Mandate: The model will be trained EXCLUSIVELY on publicly available data sources until go-live. No proprietary data, no paid data feeds, no scraped private sources. This is both a cost constraint and a legal protection. Every data source listed below is either a government API, a publicly displayed web page, or a legally downloadable dataset.

## **5.1 Complete Public Data Source Inventory**

|**Source**|**Data Provided**|**Access Method**|**URL**|**Legal Status**|**Cost**|**Frequency**|
| :- | :- | :- | :- | :- | :- | :- |
|AGMARKNET (Govt. of India)|Daily mandi arrival prices for broiler, egg, feed grains across 3,000+ mandis including Gorakhpur, Deoria, Basti, Kushinagar|Official REST API via data.gov.in|data.gov.in/resource/agmarknet — register for free API key|Government open data. API use explicitly permitted for commercial and research purposes.|Free|Daily|
|NECC (National Egg Co-ordination Committee)|Daily egg prices by zone and city. Weekly production statistics. Historical price archive since 2015.|Web scraping from necc.co.in/daily-rates. HTML table parsing.|necc.co.in/daily-rates|Public website. No ToS restriction found on data use. Best practice: contact NECC for official data partnership (they welcome it).|Free|Daily|
|IMD (India Meteorological Dept.)|District-level daily rainfall, temperature, min/max, humidity, heat wave/cold wave alerts. 5-day forecast per district.|Official REST API — no authentication required|api.imd.gov.in/api/v1/districtnowcast and /api/v1/districtforecast|Government public service. Explicitly free for all uses.|Free|Daily|
|DAHDF (Dept. of Animal Husbandry)|HPAI outbreak alerts by state/district, livestock census data, disease surveillance reports, poultry production statistics|PDF scraping from dahd.gov.in/en/nodal-officers. Weekly disease bulletin.|dahd.gov.in/en/disease-surveillance|Public government reports. Fair use for research and commercial application. Cite department in product.|Free|Weekly|
|NCDEX (Commodity Exchange)|Maize and soybean meal spot and futures prices. 15-minute delayed data publicly displayed. Historical via CSV download.|Web scraping delayed price page + CSV historical download|ncdex.com/trading/reports|Delayed data is publicly displayed — legal to read and use. Real-time data requires subscription (evaluate at Month 12 if needed).|Free (15-min delay)|Daily|
|MCX (Multi Commodity Exchange)|Crude palm oil, soybean oil futures — feed cost proxy|Web scraping public market watch page|mcxindia.com/market-data/market-watch|Same as NCDEX — delayed publicly displayed data is usable.|Free (15-min delay)|Daily|
|Kaggle / UCI ML Repository|Historical time-series of Indian commodity and poultry prices. Pre-cleaned datasets for model bootstrapping.|Direct dataset download (public license)|kaggle.com — search 'India poultry prices', 'AGMARKNET historical'|CC0 / open license datasets. Always verify license per dataset. Cite Kaggle source in model card.|Free|One-time + periodic|
|FAO (Food and Agriculture Organisation)|Global poultry production, feed cost indices, Indian market reports. Monthly/annual data.|Download from fao.org/faostat|fao.org/faostat/en/#data/QCL|Public domain. Explicitly free for all use.|Free|Monthly|
|USDA FAS (Foreign Agricultural Service)|India poultry market reports, GAIN reports (Global Agricultural Information Network). Rich qualitative and quantitative data.|PDF download from fas.usda.gov|fas.usda.gov/data/india-poultry-and-products|US government public domain data.|Free|Monthly/Quarterly|
|UP Agriculture Dept. (State)|State-level production statistics, mandi records for UP districts, farmer registration data.|Web scraping upagripardarshi.gov.in|upagripardarshi.gov.in|State government public data. Permission can be formally requested from Commissioner Agriculture UP.|Free|Monthly|
|Google Trends (via pytrends)|Search volume proxy for 'chicken price Gorakhpur', 'murga rate UP', 'broiler price today' — demand signal.|pytrends Python library (unofficial but well-known)|trends.google.com / pytrends.request.TrendReq|Public data. Google allows access via web. Use responsibly — cache results, don't over-call.|Free|Weekly|
|Meat & Livestock Australia (MLA)|Global poultry market intelligence, price indices, trade flow data — contextual global signal.|PDF download and web scraping|mla.com.au/prices-markets|Public reports. Free for commercial use with attribution.|Free|Monthly|

## **5.2 Data Pipeline Architecture — Step by Step**
Every engineer on the team must understand this pipeline. There is no black box here:

|**Step**|**Component**|**Technology**|**Runs**|**Output**|**Failure Handling**|
| :- | :- | :- | :- | :- | :- |
|1|Raw Ingestion|Apache Airflow DAGs on Astronomer.io free tier|Daily 5am IST|Raw CSV + JSON in Supabase storage bucket (Mumbai region)|Retry 3× with exponential backoff. Slack alert if 2 consecutive failures. Fallback: previous day's data with staleness flag.|
|2|Validation|Python pandas + Great Expectations library|Daily after Step 1|Validated dataset or failure report|Flag outliers (>3σ from 30-day rolling mean). Auto-reject if >15% missing values. Human review queue for borderline cases.|
|3|Feature Engineering|Custom Python module, scheduled post-validation|Daily after Step 2|Feature matrix (40+ columns) as Parquet in S3|Idempotent pipeline — can re-run without side effects. Unit-tested feature functions. MAPE impact score logged per feature weekly.|
|4|Model Retraining|LightGBM + TFT ensemble, Railway.app + AWS Spot GPU burst|Weekly (Sunday 2am IST)|New model artifacts (.pkl, .onnx) in versioned S3 bucket|Champion/challenger framework. New model must beat champion MAPE by >2% to be promoted. Automatic rollback if new model degrades.|
|5|Accuracy Validation|Automated backtesting on 90-day rolling holdout|Weekly post-retraining|MAPE report, directional accuracy, conformal interval coverage|If MAPE >8% or directional accuracy <90% → BLOCK promotion. Alert to CTO. Manual review required before any model goes to production.|
|6|Inference API|FastAPI on Railway.app, ONNX quantised model for CPU speed|Real-time on demand|JSON: {p10, p50, p90, drivers[3], confidence, model\_version}|Circuit breaker: if inference fails 3× → serve last known forecast with staleness warning. Never serve stale forecast >24h without explicit flag.|
# **6. ML Architecture: The 95%+ Pre-Launch Accuracy Mandate**
NON-NEGOTIABLE: The product does NOT go live until the model achieves 95%+ directional accuracy on a 6-month out-of-sample holdout of Gorakhpur district broiler prices AND the founding team has manually verified 30+ consecutive daily predictions by visiting Gorakhpur mandis and comparing to actual prices. No exceptions. No investors. No customers. No press. Nothing before this gate is cleared.

## **6.1 What '95%+ Accuracy' Means — Precise Definition**
To avoid ambiguity between engineer, investor, and customer interpretations, we define accuracy with three simultaneous metrics. ALL THREE must be met:

|**Metric**|**Definition**|**Target**|**Why This Number**|**Measurement Formula**|
| :- | :- | :- | :- | :- |
|Directional Accuracy (Primary)|For a given day's forecast, did the model correctly predict whether price would RISE or FALL vs the prior day?|>95%|Below 95%, a farmer following our sell-signal will make the wrong decision more than 1 in 20 days — across a 40-day grow cycle, that is 2 wrong signals per batch. Unacceptable.|sign(forecast\_t - forecast\_{t-1}) == sign(actual\_t - actual\_{t-1}) → 1, else 0. Average over test period.|
|MAPE (Secondary)|Mean Absolute Percentage Error of the point forecast vs actual price|<6%|Sub-6% MAPE means our ₹/kg estimate is within ₹1 on a ₹160 price — well within the farmer's decision tolerance. Karnataka ARIMA paper achieved 3.27% on monthly data. We target 6% on daily.|Mean(|actual - forecast| / actual) × 100, computed on 90-day rolling holdout.|
|Conformal Interval Coverage|When we say '80% confidence interval ₹155–₹165', actual price falls in that range 80% ± 2% of the time|78–82% for 80% intervals|Mis-calibrated intervals destroy trust. If we say 80% confidence but only 55% of actuals fall in range, the farmer learns not to trust our confidence levels.|Count(actuals within stated interval) / Count(total predictions). Target: stated\_coverage ± 2%.|

## **6.2 Pre-Launch Accuracy Roadmap — 16 Weeks to 95%+**

|**Week**|**Activity**|**Deliverable**|**MAPE Target**|**Directional Accuracy**|**Blocker to Next Week**|
| :- | :- | :- | :- | :- | :- |
|1–2|Data pipeline setup: AGMARKNET Gorakhpur mandi, NECC UP zone, IMD Gorakhpur district, NCDEX maize/soya. Collect and clean 36 months of historical data.|Clean dataset: 36-month daily prices × 12 features. 95%+ completeness validated.|—|—|<95% data completeness blocks Week 3.|
|3–4|Feature engineering v1: 20 core features. Lag features, rolling stats, feed cost ratio (42-day lag), festival dummies (major Hindu/Muslim festivals for UP), heat stress index.|Feature matrix v1. SHAP importance analysis showing top 5 features.|Baseline only|Baseline only|SHAP must show feed\_cost\_lag42 in top 3 features. If not, data alignment issue.|
|5–6|ARIMA baseline: ARIMA(0,1,4) per Karnataka paper spec. Prophet seasonality baseline. Validate both on 6-month holdout (NOT random split — strict time split).|Baseline MAPE + directional accuracy on holdout. Document exact model config.|<18%|>65%|If baseline MAPE >25%, data quality problem — revisit Week 1–2 before proceeding.|
|7–9|LightGBM causal model. 40+ features. TimeSeriesSplit 5-fold. Hyperparameter grid search. SHAP analysis. Ensemble v1: ARIMA + LightGBM weighted average (tune weights on validation).|LightGBM model artifacts. Ensemble v1 MAPE. Feature importance documented.|<12%|>80%|If directional accuracy <80% after LightGBM, add 5 more features (see Section 6.3) before Week 10.|
|10–12|Temporal Fusion Transformer (TFT). Quantile forecasts (P10/P50/P90). Full ensemble: ARIMA + Prophet + LightGBM + TFT with learned stacking weights. Conformal prediction calibration on separate calibration set.|TFT model artifacts. Full ensemble MAPE. Conformal coverage validated.|<8%|>90%|If TFT fails to improve on LightGBM alone, investigate data leakage. TFT must see improvement.|
|13–14|Stress testing: (a) simulate Nov–Mar 2024 UP price crash — does model predict direction? (b) simulate HPAI district alert — does supply shock feature fire correctly? (c) Diwali demand spike — does festival feature contribute?|Stress test report. Model performance on 3 historical shock events documented.|<7%|>93%|All 3 stress tests must show directional accuracy. Any failure = add specific features for that scenario.|
|15|Manual ground-truth validation: CTO + Data Head spend 5 days in Gorakhpur mandis. Record actual daily prices. Compare to model forecast. 10 consecutive days manually validated.|Manual validation report. 10-day prediction log vs actual. Signed off by CTO.|<6%|>94%|Physical validation must show >90% directional match on those 10 specific days.|
|16|Final accuracy certification. Run model on 6-month holdout not seen during any training. Compute all 3 metrics. If ALL targets met → green light for launch. If any metric fails → return to Week 9 with diagnosis.|Accuracy Certification Report. Signed by CTO and CEO. Filed in data room for investors.|<6%|>95% ✅|ALL THREE metrics must simultaneously pass. No partial credit. No compromises.|

## **6.3 Feature Engineering — Complete Specification**
These 45 features are the result of reviewing every published agri-commodity ML paper, the Karnataka ARIMA study, and Expana's disclosed methodology. Each has documented causal reason for inclusion:

|**Feature Name**|**Formula / Construction**|**Causal Reason**|**Importance Rank**|
| :- | :- | :- | :- |
|feed\_cost\_ratio\_lag42|broiler\_price[t] / maize\_price[t-42]|Broiler grow-out is 38–42 days. Feed = 65–70% of cost. Feed price 42 days ago determines today's supply-side cost pressure.|#1|
|soy\_price\_lag42|soybean\_meal\_price[t-42]|Soya = 25–30% of feed mix. Directly drives production cost 42 days ahead of market.|#2|
|price\_lag\_7d|broiler\_price[t-7]|Price momentum: last week's price is strongest near-term predictor.|#3|
|price\_ma\_7d|rolling\_mean(price, 7)|Smoothed trend removes daily noise, captures underlying direction.|#4|
|festival\_7d\_flag|1 if within 7 days of: Diwali, Eid-ul-Fitr, Eid-ul-Adha, Holi, Navratri end, Christmas|Demand spikes ±₹8–15/kg around festivals in UP. Non-negotiable feature for North India.|#5|
|heat\_stress\_7d|count(days where temp>35°C in rolling 7-day window, Gorakhpur district)|Heat stress reduces feed conversion ratio, increases mortality, reduces supply.|#6|
|price\_lag\_1d|broiler\_price[t-1]|Day-before price: strongest single-day autocorrelation signal.|#7|
|monsoon\_phase|categorical: pre/active/peak/retreat|Monsoon affects feed supply, transport, bird health. Encoded as ordinal 0–3.|#8|
|price\_std\_30d|rolling\_std(price, 30)|Volatility regime: high volatility → model is less certain → wider confidence interval.|#9|
|hpai\_district\_flag|1 if DADF reports HPAI alert within 200km of Gorakhpur in past 14 days|Disease supply shock. Binary flag with 14-day trailing window.|#10|
|doc\_placement\_lag42|day\_old\_chick placements[t-42] (from integrator data or DADF hatchery stats)|Supply leading indicator: chick placements 42 days ago = birds entering market today.|#11|
|rainfall\_7d\_mm|cumulative IMD district rainfall last 7 days|Heavy rain disrupts transport, temporarily reduces supply to mandi.|#12|
|price\_lag\_30d|broiler\_price[t-30]|Monthly cycle: captures recurring 30-day patterns.|#13|
|fuel\_price\_delta|diesel\_price[t] - diesel\_price[t-30]|Transport cost proxy. Higher fuel → higher mandi price gap vs farm gate.|#14|
|cold\_wave\_binary|1 if IMD issues cold wave alert for Gorakhpur|Cold waves affect bird health and slow growth — supply reduction signal.|#15|
|price\_momentum\_14d|(price[t] - price[t-14]) / price[t-14]|14-day price momentum: captures medium-term trend direction.|#16|
|weekend\_flag|1 if Saturday or Sunday|Mandi closures and trading pattern changes on weekends affect reported prices.|#17|
|month\_sin|sin(2π × month / 12)|Circular encoding of month — avoids treating Dec→Jan as discontinuous jump.|#18|
|month\_cos|cos(2π × month / 12)|Pair with month\_sin for complete circular month encoding.|#19|
|necc\_zone\_price\_delta|UP\_zone\_egg\_price[t] - national\_avg\_egg\_price[t]|Regional arbitrage signal: UP vs national price gap drives inter-state trade.|#20|

## **6.4 Model Ensemble Architecture**

|**Model**|**Role in Ensemble**|**Weight (initial)**|**Tune Condition**|**Library**|
| :- | :- | :- | :- | :- |
|ARIMA(0,1,4)|Seasonality and trend baseline per Karnataka paper specification. Handles non-stationary price series via first differencing.|15%|Fixed unless data distribution shifts significantly (ADF test quarterly).|statsmodels.tsa.arima.model.ARIMA|
|Facebook Prophet|Holiday and seasonal decomposition. Handles Indian festival calendar natively. Trend changepoint detection for structural breaks (policy changes).|20%|Re-tune changepoint\_prior\_scale monthly via cross-validation.|prophet (PyPI)|
|LightGBM (Causal)|Primary causal model. 45 engineered features. Handles missing values natively. SHAP explainability for prediction reasons.|35%|Weekly hyperparameter re-tune via Optuna on latest 90-day window.|lightgbm + shap|
|Temporal Fusion Transformer|Multi-horizon quantile forecasting (1–30 days). Captures non-linear sequence patterns. Provides P10/P50/P90 natively.|25%|Weekly fine-tune on new data. Full retrain monthly.|pytorch-forecasting|
|DoWhy Causal Layer (Phase 2+)|Causal inference for intervention questions: 'If feed cost rises 10%, what is the price impact in 42 days?' Adds interpretability for B2B clients.|Augments TFT|Re-calibrate when new confounding variables identified.|dowhy|
|Stacking Meta-Learner|Linear regression on base model predictions. Learns optimal weights per season, per district, per commodity. Outperforms fixed weights.|Replaces fixed weights at Month 8|Re-train when any base model is updated.|sklearn.linear\_model.Ridge|

## **6.5 Validation Protocol — The 'Never Cheat' Rules**
These rules are non-negotiable. Every ML engineer on this team signs off on them:

- Rule 1 — Time Split Always: NEVER use random train/test split on time series data. Always use temporal split: train on [start → cutoff], test on [cutoff → end]. Shuffling creates data leakage and produces fraudulently optimistic MAPE numbers.
- Rule 2 — Holdout Never Touched: The 6-month final holdout (most recent 6 months of data) is NEVER used during feature engineering, hyperparameter tuning, or model selection. It is unsealed ONCE for the final accuracy certification report. If it fails, we do not 'try one more thing' — we go back to Week 9.
- Rule 3 — TimeSeriesSplit for Cross-Validation: Use sklearn.model\_selection.TimeSeriesSplit with n\_splits=5 for all cross-validation. This simulates production deployment (train on past, predict future) accurately.
- Rule 4 — No Future Features: Every feature must be causally available at prediction time. If we predict tomorrow's price, we can only use data available today. The 42-day feed lag is valid (we know today's maize price, predict its effect 42 days out). Yesterday's crowdsourced prices are valid. Next week's weather forecast from IMD is valid.
- Rule 5 — Stress Test Mandatory: Before final certification, the model MUST be backtested on three historical shock events: (a) the Nov–Mar 2024 UP price crash, (b) the most recent HPAI zone declaration in UP, (c) the Diwali 2023 demand spike. If the model gets any of these wrong directionally, it does not pass.
- Rule 6 — Manual Ground Truth: 10+ consecutive days of model predictions must be manually compared against physical mandi visits before launch. This is not optional. The CTO or Data Head must physically be at Gorakhpur APMC for those 10 days.
# **7. Prediction IP Protection & Security Architecture**
Senior Security Architect's Note: This section addresses the most commonly underestimated risk in B2B intelligence products — the 'friend sharing' problem. One customer shares a screenshot of the prediction with a non-customer. That non-customer never pays. This compounds: within 3 months of launch, if not addressed, 40–60% of your market is getting the value for free via screenshots and WhatsApp forwards. This section details the layered defence system that prevents this at the technical, contractual, and product levels.

## **7.1 The 'Friend Sharing' Problem — Anatomy**

|**Scenario**|**How It Happens**|**Revenue Impact**|**Without Protection**|
| :- | :- | :- | :- |
|Screenshot sharing|Customer Rajesh takes a screenshot of '7-day broiler price forecast for Gorakhpur' and shares it in his WhatsApp farmer group of 200 people.|200 people get the value. 0 pay. Rajesh has no reason to stop — it builds his reputation in the group.|Within 6 months, every Gorakhpur farmer has seen our predictions. Nobody pays because 'I can get it from Rajesh's group.'|
|Verbal relay|Customer calls his cousin and says 'PoultryPulse says price will drop Thursday, sell Tuesday.' Cousin acts on it.|No payment, but also harder to prevent. Volume is limited by human communication bandwidth.|Lower volume than screenshot, but still meaningful. Concentrated in close networks.|
|Account sharing|Two feed dealers share one login to split the cost.|Half the revenue. Undetected unless checked.|If not monitored, small operators will pool subscriptions. 5 customers sharing = 5× revenue loss.|
|Screenshot reselling|Aggregator pays one customer, re-sells prediction to 50 non-customers at ₹500/prediction.|Arbitrage on our value. Undermines pricing entirely.|Creates organised market for stolen predictions. Happened to Bloomberg terminals — they have 50+ years of solutions. We need them from Day 1.|

## **7.2 Layer 1 — Prediction Watermarking (Most Important)**
Every single prediction served by PoultryPulse must contain an invisible, unique, customer-specific watermark. This is the technical foundation of all IP protection. Without it, nothing else works.

Implementation — Steganographic Text Watermarking:

- Every prediction response includes a unique token embedded in the forecast text using zero-width Unicode characters (U+200B, U+200C, U+200D, U+FEFF). These are invisible to the human eye but survive screenshot OCR and copy-paste.
- The watermark encodes: customer\_id, timestamp (hour-precision), device\_fingerprint hash, and a HMAC signature. Total payload: 128 bits, encoded in invisible characters interspersed throughout the prediction text.
- Example: The visible text reads 'Broiler price likely to rise ₹3–5/kg by Thursday.' The invisible watermark (interspersed between characters) encodes [customer:RY-2041][time:2026-05-16T09:00][device:a3f9][sig:b7c2d1].
- Decoder: when a screenshot is forwarded, our monitoring system can OCR the image and decode the watermark within 200ms, identifying the exact customer who leaked it.
- Implementation: Python library 'stegano' or custom zero-width character encoding. Applied at the API response layer before any prediction is served.

Numeric Watermarking (for forecast numbers):

- All price forecasts are personalised with micro-perturbations: instead of serving '₹162.50/kg', Customer A sees '₹162.4/kg', Customer B sees '₹162.6/kg'. The difference is invisible to the customer (both round to ₹162–163) but uniquely identifies the source.
- Perturbation is ±0.5% of the price value, always within model confidence interval, so accuracy is unaffected.
- Database records the exact perturbation per customer per prediction. When a screenshot circulates with '₹162.4', we know it came from Customer A.
- For the sharing detector: build a Telegram/WhatsApp bot that monitors poultry farmer groups. When a price prediction matching our pattern appears, trigger watermark decode.

## **7.3 Layer 2 — Access Control & Session Management**

|**Control**|**Implementation**|**What It Prevents**|
| :- | :- | :- |
|Device binding|Each login session is bound to a device fingerprint (browser fingerprint via FingerprintJS Pro, or device UUID on mobile). Login from new device triggers OTP re-verification + CRM alert.|Account sharing: two people on different phones cannot share one account without triggering verification.|
|Concurrent session limit|Maximum 2 active sessions per account (mobile + web dashboard). Third session invalidates the oldest. Session list visible to account holder in settings.|Prevents credential sharing across offices or across farmer groups.|
|IP geofencing (soft)|Log IP addresses. If a single account accesses from 3+ distinct geographic IP clusters in 24 hours, flag for review. Soft alert (does not block) — presents 'suspicious activity' notice.|Catches credential sharing across geographically distributed users (e.g., a trader sharing with associates in different cities).|
|API rate limiting|B2B API: 1,000 calls/day per API key at base tier. 10,000/day at enterprise. Per-minute burst limit: 60 calls/minute. Implemented via Upstash Redis token bucket.|Prevents API key sharing or automated resale of prediction data.|
|Prediction access log|Every forecast served is logged: customer\_id, timestamp, IP, device\_fingerprint, prediction\_hash. Immutable log stored in Supabase with row-level security. Accessible by admin only.|Full audit trail. If a customer disputes a leak accusation, we can show exact access log. If they deny accessing at that time, log contradicts them.|
|Session expiry|Mobile sessions: 7-day sliding expiry. Web dashboard: 24-hour idle timeout. B2B API tokens: 90-day rotation mandatory with email reminder at 75 days.|Reduces window for stolen credentials to be used without detection.|

## **7.4 Layer 3 — Contractual & Legal Protection**

|**Clause**|**What It Says (Plain Language)**|**Enforcement Mechanism**|
| :- | :- | :- |
|Non-redistribution clause|'You may not share, forward, publish, or communicate prediction data (in any form — text, screenshot, audio, or verbal relay) to any individual not covered by this subscription. Each subscription covers one named business entity and its employees listed in the account.'|Watermark identifies leaker → legal letter → subscription termination → civil suit for damages if pattern continues.|
|Liquidated damages clause|'Each verified instance of redistribution constitutes liquidated damages of ₹50,000 per incident, acknowledged by the subscriber as a genuine pre-estimate of harm.'|Pre-agreed damages means no court argument about quantum. Just prove the leak (watermark does that) and invoice.|
|Named user addendum (enterprise)|For integrators with teams: subscription covers up to N named users listed in Schedule A. Adding users requires upgrading the subscription tier.|Audit user list quarterly. Compare to access log device fingerprints. Unrecognised devices trigger addendum review.|
|Data use restriction|'Prediction data may be used internally for business decisions only. It may not be incorporated into any commercial service, resold, or used to train any competing ML model.'|Prevents our data being used to train a competitor's model on our predictions (model inversion attack).|
|Audit right|'PoultryPulse AI reserves the right to conduct a data use audit with 24-hour notice. Customer must produce evidence of data handling practices if requested.'|Rarely invoked but critically important. Presence of clause changes customer behaviour.|

## **7.5 Layer 4 — Product Design to Reduce Sharing Incentive**
The best security is making it less useful to share than to subscribe. These product design principles reduce sharing incentive at the root:

- Personalisation by farm: predictions are displayed as 'For your farm: 25,000 birds, Gorakhpur, Batch #7 — Recommended sell window: Tuesday 14–17 Oct.' A shared screenshot is clearly personalised and therefore less useful to someone with a different farm profile.
- Short-lived predictions: forecasts expire and update daily. A screenshot from yesterday's prediction is already 25% stale. We display 'Updated 6 hours ago' prominently. By the time a screenshot is shared and seen, it may be out of date.
- Action layer (not just data): predictions are paired with 'Your action for today:' recommendations specific to the customer's registered flock size and location. This part is invisible on screenshots because it requires logging in to generate it.
- Gamification of accuracy tracking: each customer sees their personal 'accuracy score' — how many of our predictions they acted on correctly vs incorrectly. This is logged to their account. A screenshot recipient cannot see their own accuracy history.
- Community reputation system: customers who report shared predictions (i.e., 'I got this from a non-subscriber') receive a 1-month subscription credit. This creates a distributed monitoring network where our own customer base becomes our detection system.

## **7.6 Layer 5 — Monitoring & Detection System**

|**Detection Method**|**How It Works**|**Response Protocol**|
| :- | :- | :- |
|Watermark scanning bot|Automated bot monitors 15 target WhatsApp groups (farmer groups, feed dealer groups, trader groups in Gorakhpur region) via group monitoring tools. Scans for price prediction screenshots. Decodes watermark via OCR + decoder API.|First instance: automated warning email to identified customer. Second instance: CTO notified, account review initiated. Third instance: account suspended, legal process begins.|
|Price pattern anomaly|Our model generates unique price sequences. Monitor social media and messaging for exact price sequences matching our output. Even without watermark, 3-day price sequences are sufficiently unique to identify our predictions.|Flag for watermark cross-check. If match confirmed, follow watermark protocol.|
|Referral pattern analysis|Monitor new customer acquisition source. If Customer B signs up and says 'Rajesh showed me your prediction' — flag Rajesh's account for review. Legitimate referrals are fine; systematic sharing is not.|If pattern shows systematic sharing (5+ referred customers citing same sharer), review sharer's account for upgrade to group/team plan.|
|Login anomaly detection|Machine learning model on access logs: flag logins from unusual times, unusual locations, unusual browsing patterns relative to customer baseline.|Soft alert: email to customer 'We noticed unusual access — was this you?' Hard alert: CAPTCHA on next login. Lock: if 3 hard alerts, OTP required on every session.|
|Competitor intelligence|Monitor competitor product releases for features that suspiciously mirror our predictions. If a competitor's 7-day forecast for Gorakhpur broiler prices tracks ours closely, investigate model inversion.|Engage legal counsel. Our training data is public but our model weights and ensemble architecture are proprietary. Document divergence from any public source.|

## **7.7 API Security Architecture (For B2B PulseIntel Clients)**

|**Security Control**|**Implementation**|**Standard**|
| :- | :- | :- |
|Authentication|JWT tokens with 24-hour expiry. API keys use PBKDF2-SHA256 hashing at rest. Keys displayed only once at creation — we never store plaintext keys.|OWASP API Security Top 10 compliance|
|Transport security|TLS 1.3 minimum on all API endpoints. HSTS headers. Certificate pinning on mobile app. All traffic through Cloudflare with WAF enabled.|PCI-DSS Transport Layer Security requirements|
|Request signing|All B2B API requests must include HMAC-SHA256 signature of (timestamp + endpoint + body). Requests older than 5 minutes are rejected (replay attack prevention).|AWS Signature V4 pattern|
|Rate limiting|Upstash Redis token bucket: 1,000 requests/day default, 60/minute burst. Quota headers returned: X-RateLimit-Remaining, X-RateLimit-Reset. 429 response with retry-after header.|RFC 6585 (HTTP 429)|
|Data minimisation|API responses include only fields necessary for the declared use case. Bulk historical export requires separate elevated permission level and 24h approval.|DPDP Act 2023 data minimisation principle|
|Audit logging|Every API call logged: key\_id, endpoint, timestamp, IP, response\_code, bytes\_returned, prediction\_hash. Logs immutable in Supabase. Retained 3 years.|SOC 2 Type II audit log requirements|
|Penetration testing|Annual third-party penetration test by CERT-IN empanelled firm. Bug bounty programme (private, by invitation) for enterprise clients' security teams. Findings remediated within 30 days (critical: 48 hours).|ISO 27001 vulnerability management|

## **7.8 Infrastructure Security**

|**Area**|**Control**|**Implementation**|
| :- | :- | :- |
|Secrets management|No secrets in code or environment variables in code repo|All secrets in Vercel environment variables (encrypted at rest) + Supabase Vault. Zero secrets in GitHub. Pre-commit hook blocks any string matching API key pattern.|
|Database security|Row-level security on all sensitive tables|Supabase RLS policies: farmers can only read their own data, B2B clients can only read their org's data, admin role required for cross-customer queries.|
|Model weight protection|ML model artifacts are proprietary IP|Model weights stored in private S3 bucket with bucket policy (no public access). IAM role with least-privilege access — only Railway.app inference service can read. Not accessible via any API.|
|Data encryption|Encrypt farmer personal data at rest|Farmer phone numbers hashed (SHA-256 + salt) before storage. Only the hash is stored. Original phone number used only for OTP, then discarded. Cannot be reverse-engineered.|
|Third-party access review|Control what Twilio, Vercel, Anthropic, Supabase can see|Data Processing Agreements (DPA) signed with all processors. Review annually. Anthropic API: send prediction summaries only — never raw farmer data. Twilio: phone hashes only.|
|Incident response|Defined process for security incidents|24-hour breach notification to affected customers (DPDP Act requirement). Runbook: isolate → assess → notify → remediate → post-mortem. CTO is incident commander.|
# **8. Solution & Feature Specification**
Two product tiers only. No free tier. Every feature serves a paying customer with 10,000+ birds or an integrator/feed company.

|**Tier**|**Name**|**Target**|**Pricing**|**Core Value Proposition**|
| :- | :- | :- | :- | :- |
|T1|PulsePro|Commercial farmers 10K–50K birds, traders|₹2,000–8,000/month|7-day price forecast, sell-signal alert, batch profit calculator, middleman price checker|
|T2|PulseEnterprise|Integrators 50K+ birds, feed companies, QSR, insurers|₹10,000–2,00,000/month|30-day forward intelligence, multi-farm dashboard, feed hedge alerts, API access, supply shock warning|

## **8.1 PulsePro Features**

|**Feature**|**Priority**|**Description**|**Security Control**|**Success KPI**|
| :- | :- | :- | :- | :- |
|7-Day Price Forecast|P0|AI ensemble forecast for broiler live weight price for customer's district. P10/P50/P90 confidence bands. 3 plain-language drivers in Hindi. Updated daily at 6am IST.|Watermarked with invisible text + numeric perturbation. Expires after 24h — stale flag shown after.|MAPE <6% on rolling 30-day actual vs predicted|
|Sell-Signal Alert|P0|Daily WhatsApp message (6am): 'Aaj beche ya ruke? [Sell or hold today?]' with binary recommendation + confidence level + one-line reason.|Watermarked in WhatsApp message text using zero-width characters. Device-bound session required to view full forecast.|70%+ of customers act on recommendation within 24h|
|Batch Profit Calculator|P0|Input: flock size, age, avg weight, feed cost/kg. Output: projected profit for selling today vs +3 days vs +7 days, in ₹ and ₹/bird. Works offline.|No prediction data in offline mode — uses last cached price. Watermark on any exported PDF.|D7 retention >50% for users who complete first calculation|
|Middleman Price Checker|P0|Enter price offered by local trader → app shows: fair/low/high vs district mandi benchmark + recommended counter-offer range.|API call required (not offline). Response watermarked. Shows customer's name in response header.|>30% of users report successfully negotiating higher price|
|District Price History|P1|30-day rolling history of broker, mandi, and our predicted vs actual prices. Side-by-side accuracy track record.|Customer-specific chart. If screenshot, chart header shows account name.|Builds trust — customers who see accuracy track record have 2× renewal rate|
|Disease Risk Alert|P1|SMS + WhatsApp if HPAI alert within 150km of customer's registered district. Graded severity: Watch / Warning / Emergency.|Mass alert — not individually watermarked (public safety priority overrides IP protection for disease alerts).|Alert delivered within 2h of DADF report publication|
|Feed Procurement Alert|P2|When maize or soya price drops significantly from 30-day average, alert: 'Good time to bulk-buy feed — price down 8% from last month.'|Watermarked. Requires active session to view full recommendation.|Customer-reported feed cost savings vs prior batch|

## **8.2 PulseEnterprise Features**

|**Feature**|**Priority**|**Description**|**API Contract**|**Revenue Potential**|
| :- | :- | :- | :- | :- |
|30-Day Forward Price Intelligence|P0|Extended 30-day forecast with weekly confidence bands. Regional demand/supply modelling. Benchmark vs futures. Used for contract pricing with processors.|GET /v2/forecast?district=gorakhpur&horizon=30&commodity=broiler → JSON {dates[], p10[], p50[], p90[], drivers\_weekly[]}|₹10K–30K/mo per integrator|
|Multi-Farm Flock Dashboard|P0|Dashboard for integrators managing 20+ contract farms. Each farm: age, estimated live weight, batch readiness score (0–100), optimal harvest window, projected price at harvest.|Data ingestion: POST /v2/flock/update with farm\_id, placement\_date, breed, current\_count. Dashboard: GET /v2/flock/dashboard?org\_id=X|₹15K–50K/mo for integrators managing 100+ farms|
|Feed Cost Hedge Alerts|P1|Maize and soya 42-day forward cost model. Alert when buying now vs waiting has >5% cost impact. 'Buy 30 tonnes maize today — price forecast up 12% in 6 weeks.'|GET /v2/feed-intel?commodity=maize&region=UP&horizon=42 → {action, confidence, price\_now, price\_forecast, savings\_estimate}|₹10K–30K/mo per feed company|
|Commodity Price API|P0|Real-time + historical + forward price data for broiler, egg, maize, soya across 15+ mandis. WebSocket for live updates. Excel export.|REST: GET /v2/prices/live?mandis=gorakhpur,deoria,basti. WS: wss://api.poulse.ai/v2/stream. Rate limit: 1K calls/day base.|₹25K–2L/mo enterprise|
|Supply Shock Early Warning|P1|AI detection of supply shocks 4–6 weeks ahead via HPAI spatial model + flock placement data + weather confluence. Slack/email webhook integration.|POST /v2/webhooks/supply-shock-alert with callback URL. Payload: {district, severity, lead\_days, confidence, drivers[]}|₹50K+/mo for QSR chains|
|FSSAI Traceability Report|P2|Automated batch-level traceability: origin farm, feed inputs, grow-out period, harvest date, transport chain. PDF export for retail/export audits.|GET /v2/batch/{batch\_id}/traceability-report → signed PDF with digital stamp|₹5K–15K add-on per integrator|
# **9. Technical Architecture**

|**Layer**|**Technology**|**Tier/Monthly Cost**|**Rationale**|
| :- | :- | :- | :- |
|Mobile App|React Native (Expo) + offline SQLite|Free|Single codebase iOS + Android. Offline-first with local SQLite for profit calculator and cached forecasts. OTA updates via Expo EAS.|
|Web Dashboard (Enterprise)|Next.js 15 on Vercel Edge|Free tier|Server-side rendering. Incremental static regeneration for price dashboard. Enterprise B2B clients prefer browser-based access over mobile.|
|Backend API|Vercel Edge Functions (Next.js API routes)|Free (100K req/mo)|Serverless. Zero idle cost. Auto-scales. Handles auth, business logic, watermarking middleware layer.|
|Database|Supabase PostgreSQL (Mumbai ap-south-1)|Free → ₹2,100 (Pro)|Built-in OTP auth (phone number), row-level security, real-time subscriptions, PostGIS for geo queries. India data sovereignty.|
|ML Model Serving|FastAPI + ONNX quantised models on Railway.app|~₹415/mo|Always-on CPU inference. ONNX quantisation: 4× faster inference, 70% smaller model. <200ms p95 response time.|
|ML Training|Astronomer.io (Airflow) + AWS Spot GPU (g4dn.xlarge)|~₹2,500/mo|Airflow orchestration on free tier. GPU burst for TFT: ~₹800/run × 4 runs/month. Spot instances reduce cost 65%.|
|WhatsApp / SMS|Twilio WhatsApp Business API|~₹1,200/mo|Farmer-native channel. Watermarked messages. Upgrade to Meta Business API direct when >10K messages/month.|
|LLM (Hindi summaries)|Claude Sonnet 4.6 via Anthropic API|~₹1,500/mo|Generate plain-Hindi prediction explanations ('Kyunki maize ka bhav badh raha hai...'). Never send raw farmer data — only prediction values.|
|Watermarking Service|Custom Python microservice on Railway.app|~₹415/mo|Applies zero-width char watermarks + numeric perturbation to every prediction before serving. <5ms overhead.|
|Monitoring|Sentry + PostHog + Uptime Robot|Free tiers|Error tracking, product analytics, uptime monitoring. Zero cost at MVP scale.|
|Security|Cloudflare WAF + FingerprintJS Pro (device binding)|~₹1,200/mo|DDoS, bot, WAF protection. Device fingerprinting for account binding. FingerprintJS Pro: 99.5% accuracy.|
|Secrets|Vercel encrypted env vars + Supabase Vault|Free|Zero secrets in code. Pre-commit hook blocks accidental secret commits.|

**PHASE 0 TOTAL INFRASTRUCTURE COST**

|<p>**~₹7,330**</p><p>**Total monthly infra (Phase 0)**</p><p>*Full production-ready stack*</p>|<p>**₹0**</p><p>**Idle cost at zero users**</p><p>*True serverless design*</p>|<p>**~₹12K**</p><p>**At 100 active B2B clients**</p><p>*Scales sub-linearly*</p>|<p>**78–85%**</p><p>**Target gross margin (SaaS)**</p><p>*After infra + support*</p>|
| :- | :- | :- | :- |
# **10. Revenue Model & Unit Economics**

|**Revenue Stream**|**Type**|**Pricing**|**Y1 Projection**|**Y2 Projection**|**Y3 Projection**|
| :- | :- | :- | :- | :- | :- |
|PulsePro Subscriptions (10K–50K bird farms)|Recurring SaaS|₹2,000–8,000/mo|₹8–25L ARR|₹50L–1.2Cr ARR|₹2–5Cr ARR|
|PulseEnterprise (Integrators + Feed)|Recurring SaaS|₹10,000–50,000/mo|₹12–40L ARR|₹80L–3Cr ARR|₹5–15Cr ARR|
|API Data Licensing (QSR, Insurer)|Recurring data|₹25K–2L/mo|₹5–20L|₹40L–1.5Cr|₹2–6Cr|
|Government / AHIDF Grants|Non-dilutive|₹25L–2Cr/grant|₹25–75L|₹50L–1.5Cr|Ongoing|
|Input Procurement Referrals (Feed, Vaccine)|Referral 3–5%|% of GMV|₹3–10L|₹20–50L|₹1–3Cr|

**UNIT ECONOMICS**

|<p>**₹5K–15K**</p><p>**CAC (direct B2B sales)**</p><p>*Conference + direct visits*</p>|<p>**₹1.4L–6L**</p><p>**LTV (PulsePro, 3-yr avg)**</p><p>*₹4K/mo × 36 months*</p>|<p>**10:1–40:1**</p><p>**LTV : CAC ratio**</p><p>*Target >10:1 minimum*</p>|<p>**3–5 mo**</p><p>**Payback period (B2B)**</p><p>*Best-in-class agri-SaaS*</p>|
| :- | :- | :- | :- |

Pricing Rationale: A commercial farm with 25,000 birds losing ₹2/bird from timing = ₹50,000 loss per batch. Paying ₹5,000/month for a tool that recovers ₹25,000/month net = 5:1 ROI. The product sells itself when the first prediction is correct. Every sales conversation starts with: 'How much did you lose on your last batch from selling at the wrong time?' — then we calculate the ROI together.
# **11. Product Roadmap — Phase by Phase**
## **Phase 0: Pre-Launch — Training & Validation — Months 1–4**
Entry Criteria: Founding team assembled. DPIIT registration filed. Not a single customer onboarded.
### **Deliverables:**
1. Collect 36 months of public data: AGMARKNET Gorakhpur/Deoria/Basti/Kushinagar/Maharajganj mandis, NECC UP zone, IMD Gorakhpur district, NCDEX maize/soya, DADF disease bulletins.
1. Build automated Airflow data pipeline: daily ingestion, validation (Great Expectations), feature engineering (45 features), versioned Parquet output. 95%+ completeness gate.
1. Train ARIMA(0,1,4) baseline. Validate on 6-month holdout. Document exact MAPE.
1. Train LightGBM causal model. 45 features. TimeSeriesSplit cross-validation. SHAP analysis. Ensemble v1.
1. Train Temporal Fusion Transformer. Full ensemble: ARIMA + Prophet + LightGBM + TFT. Conformal prediction calibration.
1. Stress test: backtest Nov–Mar 2024 UP price crash, HPAI zone alert 2023, Diwali 2023 spike. All three must pass directionally.
1. Physical validation: CTO + Data Head in Gorakhpur for 10 consecutive trading days. Manual price recording vs model prediction.
1. Accuracy Certification Report: all three metrics met simultaneously. Signed by CTO + CEO. Filed in investor data room.
1. Build watermarking service (zero-width char + numeric perturbation). Test on 100 predictions.
1. AHIDF grant application + BIRAC BIG application submitted.
1. Onboard 0 paying customers. Collect 0 rupees. This phase has one job: 95%+ accuracy.
### **Exit Gate:**
Accuracy Certification Report signed. MAPE <6%, Directional >95%, Conformal coverage 78–82%.

## **Phase 1: Gorakhpur Launch — Months 4–8**
Entry Criteria: Phase 0 exit criteria fully met. Watermarking live. Contracts drafted. Sales person hired.
### **Deliverables:**
1. Sign first 5 PulsePro customers in Gorakhpur district. Target: farms with 10K–30K birds. Referral via local vet + feed dealer network.
1. PulsePro app live: 7-day forecast, sell-signal, batch profit calculator, middleman price checker. Hindi UI only.
1. Daily manual accuracy monitoring: Data Head compares predictions vs actual Gorakhpur APMC prices every day. Any deviation >8% MAPE triggers model review.
1. Expand to 3 adjacent districts: Deoria, Kushinagar, Maharajganj. Validate model accuracy holds (expect slight MAPE increase — acceptable if <10%).
1. First PulseEnterprise contract: 1 mid-size integrator with 3–5 contract farms in Gorakhpur belt. ₹10,000–15,000/month.
1. Deploy device binding + session management. Test watermark detection on simulated sharing scenarios.
1. File DPDP Act compliance documentation. DPAs signed with all data processors.
1. Target: 15 paying customers, ₹60,000–1,50,000 MRR, MAPE sustained <8% on new districts.
### **Exit Gate:**
15+ paying customers. ₹1L+ MRR. MAPE <8% across all 4 districts. 0 verified IP breaches unresolved.

## **Phase 2: UP Belt Expansion — Months 8–18**
Entry Criteria: Phase 1 exit criteria. Seed funding raised or MRR covers ops. First enterprise contract live.
### **Deliverables:**
1. Expand to full Purvanchal belt: Varanasi, Azamgarh, Mau, Ballia, Ghazipur districts. Validate model district by district.
1. Lucknow and western UP expansion: Agra, Kanpur, Bareilly (major poultry markets). New district model fine-tuning protocol automated.
1. Launch PulseEnterprise feed company module: CLFMA network introduction. First feed company contract (Amrit Feeds or Godrej Agrovet UP depot).
1. API data licensing v1: sell cleaned historical price data to 1 livestock insurer (Bajaj Allianz or HDFC Ergo). ₹15K–30K/month.
1. Automated onboarding flow for PulsePro: self-serve signup, contract e-sign (DigiSign), auto-provisioning. Reduce sales cycle from 3 weeks to 3 days for SMB.
1. WhatsApp monitoring bot deployed: monitors 15 target Gorakhpur/UP farmer groups for shared predictions. Watermark decode pipeline live.
1. Community referral programme: ₹1,000 account credit for verified referrals. Tracks organic growth without creating free-rider problem.
1. Target: 80 paying customers, ₹8L MRR, 5+ districts validated, 2 enterprise contracts.
1. Raise seed round: ₹3–6Cr from NABARD VC / agri-focused angels. Use for sales team expansion and national roadmap.
### **Exit Gate:**
₹8L+ MRR. 80+ customers. UP-wide coverage. Seed raised. MAPE <7% across all districts.

## **Phase 3: National Expansion — Months 18–36**
Entry Criteria: Phase 2 exit criteria. Series A raised. VP Sales hired. National GTM plan approved.
### **Deliverables:**
1. Andhra Pradesh + Telangana entry: largest poultry markets. Telugu UI development. Partner with local industry body (NEPC).
1. Enterprise QSR contracts: KFC India, McDonald's India procurement teams. PulseEnterprise supply shock early warning as primary value prop.
1. Marketplace alpha: direct farm-gate price discovery for large farms (>50K birds). 1.5% commission. Bypasses middleman entirely.
1. International pilot: Bangladesh (similar supply chain structure). Establish data partnerships, regulatory mapping.
1. Series A raise: ₹20–40Cr for national expansion, ML team, security infrastructure, international.
1. Target: 500+ customers, ₹40L+ MRR, national coverage, international pilot live.
### **Exit Gate:**
₹40L+ MRR. 500+ customers. National. Series A raised. International pilot data.

# **12. Risk Register & Mitigation**

|**Risk**|**Severity**|**Probability**|**Description**|**Mitigation**|
| :- | :- | :- | :- | :- |
|Model fails to reach 95% pre-launch|Critical|Medium|After 16 weeks, model does not clear accuracy certification. All three metrics do not simultaneously pass.|Explicitly budget for this: Phase 0 may take 20–24 weeks, not 16. Add 2 more causal features per failed week. Engage IIT/IISc academic collaboration for architecture review. Do NOT launch at lower accuracy.|
|Gorakhpur data is sparse or dirty|High|Medium|AGMARKNET Gorakhpur mandi data has gaps, delayed reporting, or inconsistent commodity naming. Cannot train on sparse data.|Collect data for 3+ months before training begins. If AGMARKNET is insufficient, hire local data collection partner: a person who physically visits the mandi daily and records prices. ₹5,000–8,000/month. Worthwhile.|
|First customer churns after wrong prediction|Critical|Low-Medium|A 20K-bird farmer follows our sell-signal, loses ₹40,000, and publicly criticises on WhatsApp.|Never launch before 95% accuracy. Even at 95%, offer the first customer a 30-day money-back guarantee. Assign Data Head as dedicated success manager for first 10 customers. Monitor model predictions in real-time for first 60 days.|
|Prediction shared via WhatsApp before watermark catches it|High|High|Customer shares screenshot. By the time watermark is decoded, the prediction has already reached 200 people.|Watermark is detection, not prevention. Contractual clause + liquidated damages is the enforcement. Product personalisation (farm-specific recommendations) reduces usefulness of shared screenshots. Short expiry reduces time-value of shared predictions.|
|Agri-industry player builds competitor using our methodology|Medium|Medium|After reading our PRD or observing our product, an established player (Godrej Agrovet, Suguna, or a VC-backed startup) replicates the approach for Gorakhpur.|Speed to market is our primary moat. First-mover trust in Gorakhpur is hard to displace. The crowdsourced data from our customers becomes a proprietary data advantage they cannot replicate. File method patent on the personalised watermarking + numeric perturbation technique.|
|AGMARKNET / NECC API goes down for >7 days|High|Medium|Government data sources are fragile. Extended downtime means no new data for model.|Multiple redundant data sources per commodity (see Section 5.1 — 12 sources total). Fallback hierarchy documented. Local data collection partner as emergency backup. Model can use 7-day-old data with staleness flag without catastrophic accuracy loss.|
|Integrator adoption cycle >12 months|Medium|High|B2B sales in Indian agriculture take 6–18 months. Decision makers are conservative and require extensive proof.|Start with commercial farmers (simpler sale: 1 person, clear ROI, fast decision). Use farmer adoption and satisfaction data as social proof for integrator sales. Offer 60-day paid pilot with full-money-back guarantee. Target integrators who lost money in 2024 crash — they are motivated.|
|DPDP Act enforcement creates data handling issues|Medium|Low|India's Data Protection Board begins enforcing DPDP Act 2023. Our farmer phone data or prediction logs require compliance overhaul.|Compliance designed in from Day 1: phone hashing, consent flow, erasure API, Mumbai-only data storage, DPAs with all processors. Hire regulatory advisor at Series A. DPDP Act is actually a competitive advantage — we can certify compliance faster than global players entering India.|
# **13. Success Metrics & Investor KPIs**
**NORTH STAR METRIC**

₹ per bird margin improvement for customers using PoultryPulse vs their own prior-year average. Target: ₹2+ per bird improvement within 12 months of subscription start. This is the only metric that matters to the customer — and therefore the only metric that predicts retention.

|**KPI**|**Owner**|**Phase 1 Target**|**Phase 2 Target**|**Phase 3 Target**|**Measurement**|
| :- | :- | :- | :- | :- | :- |
|Pre-Launch MAPE|ML|<6%|<5%|<5%|Automated backtesting pipeline, logged weekly|
|Pre-Launch Directional Accuracy|ML|>95%|>96%|>97%|sign(predicted\_delta) == sign(actual\_delta), 90-day rolling|
|Paying B2B Customers|Revenue|15|80|500|b2b\_clients table, active subscriptions|
|Monthly Recurring Revenue|Revenue|₹1.5L/mo|₹8L/mo|₹40L/mo|Supabase billing table, monthly sum|
|Net Revenue Retention|Revenue|95%|108%|118%|MRR from existing cohort vs prior month|
|B2B Monthly Churn|Revenue|<8%|<4%|<2%|Cancelled contracts / active contracts × 100|
|Customer Margin Improvement (₹/bird)|Product|₹1.5+|₹2.5+|₹3+|Quarterly customer survey + sell-record validation|
|Watermark Leak Events Resolved|Security|<5/month|<2/month|<1/month|Watermark monitoring system dashboard|
|API Uptime (Enterprise SLA)|Engineering|99\.5%|99\.9%|99\.95%|Uptime Robot + internal health endpoint|
|District Coverage|Product|4 (Gorakhpur belt)|15+ (UP)|50+ (National)|Active prediction districts in database|
|Model Retrain Frequency|ML|Weekly|Weekly|Weekly + event-triggered|Airflow DAG run log|

## **13.1 Investor Milestone Gates**

|**Funding Gate**|**Raise Target**|**All Criteria Must Be Met**|**Timeline**|
| :- | :- | :- | :- |
|Pre-Seed / Grants|₹25–75L (non-dilutive)|Accuracy Certification Report signed. MAPE <6%, DA >95%. AHIDF or BIRAC grant letter received. 3+ customer letters of intent (not signed contracts — letters of intent).|Month 3–4|
|Seed Round|₹3–6Cr|15+ paying customers. ₹1.5L+ MRR. MAPE <7% sustained for 60+ days in production. Gorakhpur + 2 adjacent districts validated. 0 unresolved customer churn due to prediction error.|Month 6–8|
|Series A|₹20–40Cr|80+ paying customers. ₹8L+ MRR. NRR >105%. UP-wide coverage (15+ districts). 2+ enterprise contracts (integrator or QSR). International market research complete. MAPE <6% maintained in production.|Month 18|
|Series B|₹80–150Cr|500+ customers. ₹40L+ MRR. National coverage. International revenue >15% of total. NRR >115%. Marketplace GMV live (>₹5Cr/month transacted).|Month 30–36|
# **14. Team Structure & Hiring Plan**
## **14.1 Founding Team — Phase 0 (3 People, Pre-Revenue)**

|**Role**|**Critical Skills**|**Non-Negotiable Requirements**|**Equity + Compensation**|
| :- | :- | :- | :- |
|CEO / Business Lead|Poultry industry domain knowledge (direct farm or trade experience), B2B sales track record, Hindi fluency, stakeholder management|Must have personally experienced the pricing problem — ideally ran or managed a poultry farm. Without domain credibility, first integrator meetings will fail.|3–5% equity, vesting 4yr/1yr cliff. ₹40–60K/mo post-grant.|
|CTO / ML Lead|Time-series ML (LightGBM, TFT, Prophet), Python FastAPI, React Native, DevOps (Railway, Vercel, Supabase), security architecture|Must own the 95% accuracy mandate personally. Accountable for Accuracy Certification Report. Cannot outsource this.|3–5% equity, vesting 4yr/1yr cliff. ₹50–80K/mo post-grant.|
|Head of Data / Field Analyst|AGMARKNET + NECC data intimacy, Python data pipelines (Airflow, pandas), Gorakhpur/UP poultry market knowledge, willing to do mandi visits|Must physically visit Gorakhpur mandi for manual validation weeks. No remote-only candidates for this role.|2–3% equity, vesting 4yr/1yr cliff. ₹35–55K/mo post-grant.|

## **14.2 Hiring Roadmap**

|**Month**|**Role**|**Key Requirement**|**Budget**|**Trigger**|
| :- | :- | :- | :- | :- |
|5–6|B2B Sales Executive (Hindi/UP)|Ex-Suguna, Venkys, or feed company. Knows Gorakhpur belt personally. Has existing relationships with commercial farm operators.|₹6–10L/yr|First Gorakhpur customer signed → need dedicated sales for adjacent district expansion.|
|7–9|Full-Stack Engineer|React Native, Next.js, Supabase, TypeScript. Security-conscious — understands watermarking implementation.|₹12–18L/yr|CTO blocked on product velocity by ML obligations.|
|8–10|ML Engineer #2|TFT expertise, MLOps (Airflow, ONNX), time-series validation methodology.|₹15–22L/yr|Weekly retraining pipeline needs dedicated owner.|
|10–12|Customer Success Manager (UP-based)|Hindi/UP dialect. Farm sector empathy. Can visit customers physically. Manages churn.|₹6–10L/yr|When >20 customers and CTO spending >20% time on customer calls.|
|14–18|VP Sales (National)|Enterprise SaaS track record. Food industry network (QSR or FMCG). ₹10L+/yr deal experience.|₹22–35L/yr|Series A closes. National expansion requires senior enterprise seller.|
|15–18|Security Engineer|Application security, OWASP, penetration testing coordination, SIEM implementation.|₹18–28L/yr|Enterprise QSR contracts require security attestation. ISO 27001 roadmap begins.|

## **14.3 Advisory Board — Target Profiles**

|**Profile**|**Strategic Value**|**Approach**|**Compensation**|
| :- | :- | :- | :- |
|Former Suguna Foods / IB Group senior executive|Integrator network for B2B warm intros. Operational knowledge of contract farming pain points. Credibility in industry events.|LinkedIn + NEPC conference. Offer after Phase 1 launch with proof of traction.|0\.25% equity, 2yr vest + ₹15K/month consulting|
|IIT/IISc ML researcher (time-series/agri background)|Model architecture review. Academic paper co-authorship for credibility. PhD pipeline for ML hiring. Independent validation of Accuracy Certification.|Direct approach to IIT Hyderabad (AgriTech group) or IISc CPDM.|0\.25% equity, 2yr vest + research collaboration agreement|
|NABARD Programme Officer (retired)|Grant access. NABARD VC fund introduction. State government pilot introductions. AHIDF application review.|Agri-tech accelerator network. Mutual introduction via NASSCOM FutureSkills AgriTech programme.|0\.15% equity, 2yr vest + ₹10K/month advisory fee|
|Ex-KFC India / McDonald's India Procurement Head|QSR enterprise deal pipeline. Procurement process knowledge. Warm introduction to current procurement team.|LinkedIn outreach + food tech conference circuit.|0\.25% equity, 2yr vest + ₹20K/month + success fee on deal closed|
# **15. Compliance, Security & Data Governance**

|**Area**|**Requirement**|**Implementation**|**Timeline**|**Owner**|
| :- | :- | :- | :- | :- |
|DPDP Act 2023|Explicit consent, right to erasure, data localisation|Consent flow in onboarding (Hindi). Phone hashed pre-storage. Erasure API endpoint. Mumbai-only Supabase. DPAs with all processors.|Day 1|CTO|
|API Security|OWASP API Top 10 compliance|JWT auth, HMAC request signing, rate limiting (Upstash Redis), immutable audit logs, TLS 1.3 minimum.|Before B2B launch (Month 4)|CTO|
|Prediction IP Protection|Watermark all predictions|Zero-width char watermarking + numeric perturbation. Contractual non-redistribution clause. Monitoring bot.|Month 3 (pre-launch)|CTO + Legal|
|Model Bias|Prediction quality parity across farm sizes|Quarterly SHAP analysis by customer segment. Flag if large farms get systematically better MAPE than small ones.|Month 6|ML Lead|
|FSSAI Traceability|Batch records meet FSSAI audit format|Immutable Supabase record. Aadhaar eSign integration for digital stamp. PDF export via Puppeteer.|Month 10 (PulseEnterprise launch)|CTO + Data|
|Penetration Testing|Annual external security audit|CERT-IN empanelled firm. Scope: API, web dashboard, mobile app, watermarking service. Critical findings: 48hr remediation.|Month 12 (before enterprise contracts)|CTO + Security Advisor|
|Data Retention|Define and enforce retention periods|price\_raw: 5yr. price\_forecast: 2yr. farmer profiles: lifetime (hashed). Access logs: 3yr. Automated deletion policy in Supabase.|Month 2|CTO|
# **16. Appendix**
- Honyal et al. (2025). ARIMA-Based Forecasting of Poultry Egg and Meat Prices in Key Markets of Karnataka. Journal of Scientific Research and Reports, 31(1), 563–571. DOI: 10.9734/jsrr/2025/v31i12800 — Primary methodology reference for ARIMA baseline.
- Lim et al. (2021). Temporal Fusion Transformers for Interpretable Multi-Horizon Time Series Forecasting. International Journal of Forecasting, 37(4), 1748–1764 — TFT architecture reference.
- Shalit, Johansson & Sontag (2017). Estimating Individual Treatment Effect: Generalization Bounds and Algorithms. ICML 2017 — Foundation for DoWhy causal inference layer.
- Venn & Shafer (2008). A Well-Calibrated Confidence Distribution is a Sufficient Statistic for Interval Estimation — Theoretical basis for conformal prediction calibration.
- NABARD (2024). Poultry Sector Study — Uttar Pradesh. National Bank for Agriculture and Rural Development, Lucknow Regional Office.
- DADF (2025). 20th Livestock Census — Poultry Segment, Uttar Pradesh. Department of Animal Husbandry & Dairying, Government of India.
- Angelopoulos & Bates (2022). A Gentle Introduction to Conformal Prediction and Distribution-Free Uncertainty Quantification. arXiv:2107.07511 — Practical conformal prediction implementation guide.
## **16.1 Open-Source Libraries — Full Stack**

|**Library**|**Purpose**|**Install Command**|**License**|
| :- | :- | :- | :- |
|lightgbm|Primary causal price model. SHAP integration. Handles missing values natively.|pip install lightgbm shap optuna|MIT|
|statsmodels|ARIMA(0,1,4) baseline per Karnataka paper.|pip install statsmodels|BSD-3|
|prophet|Seasonality baseline. Indian holiday calendar. Trend changepoint detection.|pip install prophet|MIT|
|pytorch-forecasting|Temporal Fusion Transformer. Quantile outputs. Multi-horizon.|pip install pytorch-forecasting pytorch-lightning|MIT|
|dowhy|Causal inference for intervention questions (Phase 2+).|pip install dowhy|MIT|
|great-expectations|Data pipeline validation. Automated data quality assertions.|pip install great-expectations|Apache-2.0|
|apache-airflow|Pipeline orchestration. DAG-based scheduling. Retry logic.|pip install apache-airflow (or Astronomer.io managed)|Apache-2.0|
|fastapi + uvicorn|ML inference API. Async. OpenAPI schema auto-gen.|pip install fastapi uvicorn|MIT|
|tabula-py|PDF table extraction for DADF disease reports.|pip install tabula-py|MIT|
|pytrends|Google Trends access for demand proxy signal.|pip install pytrends|MIT|
|fingerprintjs|Device fingerprinting for session binding (frontend JS library).|npm install @fingerprintjs/fingerprintjs-pro|Commercial (paid API)|
|stegano / custom ZWC|Zero-width character watermarking of prediction text.|pip install stegano (or custom implementation)|MIT / Custom|

## **16.2 Government Funding & Partnership Resources**

|**Resource**|**Type**|**Amount**|**URL / Contact**|**Apply By**|
| :- | :- | :- | :- | :- |
|AHIDF (Animal Husbandry Infrastructure Dev Fund)|Interest subvention + grant|Up to ₹2Cr|dahd.gov.in/ahidf — apply via NABARD nodal branch|Rolling — apply immediately|
|BIRAC BIG Grant|Non-dilutive grant|Up to ₹50L|birac.nic.in/big.php|Twice yearly — check current cycle|
|Startup India Seed Fund|Grant|Up to ₹20L|seedfund.startupindia.gov.in|Rolling applications|
|NABARD Agri-Business Fund|Equity + grant|₹25L–2Cr|nabard.org → agri-business incubation|Rolling — approach regional NABARD Lucknow office|
|UP Digital Agriculture Mission|State pilot partnership|₹5–50L pilot grant|upcb.gov.in / agriculture.up.gov.in|Contact Commissioner Agriculture UP directly|
|YC Application (W2027)|Equity ($500K standard deal)|$500K for ~7% equity|ycombinator.com/apply|Apply August 2026 for Winter 2027 batch|
|SIDBI SAFE (Startup Accelerator)|Debt + equity|₹10L–1Cr|sidbi.in/safe|Rolling — SIDBI Lucknow office for UP startups|

## **16.3 Key Academic References**
© 2026 PoultryPulse AI. All rights reserved. Proprietary & Confidential.	Page  of 
