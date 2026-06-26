**🐔 PoultryPulse AI**

**Complete ML Training & Implementation Guide**

*Step-by-Step Guide for Non-Technical Users to Train a 95%+ Accuracy ML Model*

|  |  |
|----|----|
| **Version** | v1.0 --- May 2026 |
| **Classification** | CONFIDENTIAL --- Engineering & Investor Use |
| **Project** | PoultryPulse AI --- Gorakhpur District Launch |
| **ML Training Duration** | 16 Weeks (1 Year of Data Required) |
| **Target Accuracy** | 95%+ Directional \| \<6% MAPE \| 78--82% Conformal |
| **Author** | Senior ML Architect (Based on PRD v3.0, TRD v1.0, Architecture v1.0) |

> **ABSOLUTE RULE: This guide follows the PRD v3.0 mandate --- NO customer is onboarded, NO subscription enabled, NO press or investor communication before ALL THREE accuracy gates are simultaneously cleared: Directional \>95%, MAPE \<6%, Conformal Coverage 78--82%.**

# How to Use This Guide

This document is written for someone who has NEVER trained a machine learning model. You do not need to be a developer. You do not need to know Python deeply. Every step tells you exactly what platform to use, what website to go to, what to click, and what the result should look like.

> *Think of training an ML model like teaching a student. You show them historical exam questions and answers (your 1+ year of price data), they learn the patterns, and then they predict future answers (tomorrow\'s broiler price). Your job is to collect the right study material, clean it, and run the training process in the right order.*

**Reading Guide:**

- Each STEP has a coloured box showing the platform and estimated time

- Green boxes = you must do this exactly right

- Orange boxes = important warnings

- Red boxes = if this fails, STOP and fix it before continuing

- Tables with source names have direct URLs --- do not guess, use the exact link

## What is in This Guide

| **Section** | **What You Will Do** | **Time Needed** |
|----|----|----|
| Section 1: Setup | Create all accounts and install tools | 1--2 days |
| Section 2: Data Collection | Download 1+ year of price data from 12 sources | 1--2 weeks |
| Section 3: Data Cleaning | Check data quality with automated tools | 3--5 days |
| Section 4: Feature Engineering | Create 45 prediction features from raw data | 1 week |
| Section 5: Baseline Models | Train ARIMA and Prophet starter models | 1 week |
| Section 6: LightGBM Model | Train the main causal ML model | 2 weeks |
| Section 7: TFT Model | Train the deep learning model (GPU required) | 2 weeks |
| Section 8: Ensemble | Combine all 4 models into one prediction | 1 week |
| Section 9: Accuracy Testing | Validate that all 3 accuracy gates are cleared | 2 weeks |
| Section 10: Deployment | Go live on Railway.app with ONNX model | 3--5 days |
| Section 11: Monitoring | Set up daily accuracy monitoring | 2 days |
| Section 12: Task Script Checklist | Full task.md alignment --- every script verified | Ongoing |

# Section 0: What You Need Before Starting

Before collecting a single data point, make sure you have all of these. Missing even one will block you later.

## 0.1 Accounts to Create (All Free) {#accounts-to-create-all-free}

| **Service** | **What It Does** | **Create Account At** | **Cost** |
|----|----|----|----|
| Supabase | Your main database --- stores all prices, predictions, accuracy | supabase.com --- click \'Start for Free\' | Free (500MB) |
| Astronomer.io | Runs your data pipeline automatically every day at set times | astronomer.io --- click \'Try Astro Free\' | Free (10 DAGs) |
| Railway.app | Hosts your ML inference API (always running) | railway.app --- \'Start a New Project\' | \~₹415/mo |
| AWS | GPU compute for TFT model training (weekly burst only) | aws.amazon.com --- create account | \~₹800/run |
| GitHub | Stores all your code in one place, connects to Railway.app | github.com --- \'Sign Up\' | Free |
| data.gov.in | Official Government API for AGMARKNET mandi prices | data.gov.in --- register for API key | Free |
| Kaggle | Download historical Indian commodity datasets | kaggle.com --- \'Register\' | Free |
| Vercel | Hosts your Next.js web dashboard | vercel.com --- \'Sign Up\' | Free |
| Twilio | Sends WhatsApp messages to farmers | twilio.com --- \'Sign Up\' | \~₹1.20/msg |

## 0.2 Software to Install on Your Computer {#software-to-install-on-your-computer}

| **Software** | **Purpose** | **Download Link** | **How to Verify Install** |
|----|----|----|----|
| Python 3.11 | Runs all data scripts and ML training | python.org/downloads | Open terminal, type: python \--version |
| VS Code | Code editor --- write and run Python scripts | code.visualstudio.com | Just open the application |
| Git | Manages your code versions | git-scm.com/downloads | Terminal: git \--version |
| Node.js 20 | Required for Next.js web dashboard | nodejs.org/en/download | Terminal: node \--version |
| PNPM | Fast package manager for Node.js | Terminal: npm install -g pnpm | Terminal: pnpm \--version |
| Railway CLI | Deploys your API to Railway.app from terminal | docs.railway.app/develop/cli | Terminal: railway \--version |

## 0.3 Python Libraries to Install {#python-libraries-to-install}

Open your terminal (or VS Code terminal) and run this single command to install everything at once:

pip install pandas numpy scikit-learn lightgbm statsmodels prophet pytorch-forecasting onnx onnxruntime mapie great_expectations supabase pytrends beautifulsoup4 requests tabula-py shap optuna structlog fastapi uvicorn torch torchvision

> *If you see \'pip not found\' --- try \'pip3\' instead. If Python is not installed yet, install Python 3.11 first from python.org.*

# Section 1: Project Setup --- Monorepo and Configuration {#section-1-project-setup-monorepo-and-configuration}

This section follows Task 1 from your tasks.md. It sets up the complete project structure so every team member and every tool knows where everything lives.

<table style="width:93%;">
<colgroup>
<col style="width: 11%" />
<col style="width: 81%" />
</colgroup>
<tbody>
<tr>
<td style="text-align: center;"><p>STEP</p>
<p><strong>1</strong></p></td>
<td><p><strong>Create the Monorepo (Project Folder)</strong></p>
<p><strong>Platform:</strong> Terminal on Your Computer <strong>| Estimated Time:</strong> 45 minutes</p></td>
</tr>
</tbody>
</table>

What is a monorepo? It is one folder that contains all parts of your project --- mobile app, web dashboard, ML API, and data pipeline --- all in one place, with shared code between them.

Run these commands one by one in your terminal:

- **npx create-turbo@latest poultrypulse \--package-manager pnpm**

- Choose \'pnpm workspaces\' when asked

- cd poultrypulse

- mkdir -p apps/mobile apps/web apps/api apps/pipeline packages/ui packages/types packages/i18n packages/config apps/db

> *After this, your folder structure should look like: poultrypulse/ → apps/ (mobile, web, api, pipeline) + packages/ (ui, types, i18n, config) + apps/db/. This matches TRD §2 and Architecture §1.*

Verify it worked: open the poultrypulse folder in VS Code. You should see all these folders on the left side.

## 1.1 Configure Environment Variables {#configure-environment-variables}

Create a file called .env.example at the root of your project. This file lists every secret the project needs. You will fill in the real values from the accounts you created in Section 0:

| **Variable Name** | **Where to Get It** | **Example Format** |
|----|----|----|
| SUPABASE_URL | Supabase dashboard → Project Settings → API | https://xxx.supabase.co |
| SUPABASE_ANON_KEY | Supabase dashboard → Project Settings → API → anon public key | eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\... |
| RAILWAY_API_URL | Railway.app → your project → Settings → Domain | https://poultrypulse-api.railway.app |
| TWILIO_ACCOUNT_SID | Twilio Console → Account Info | ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx |
| TWILIO_AUTH_TOKEN | Twilio Console → Account Info | xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx |
| DATA_GOV_IN_API_KEY | data.gov.in → My Account → API Keys | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| AWS_ACCESS_KEY_ID | AWS Console → IAM → Users → Security Credentials | AKIAIOSFODNN7EXAMPLE |
| AWS_SECRET_ACCESS_KEY | AWS Console → IAM → Users → Security Credentials | wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY |

> **NEVER commit your .env file to GitHub. The .gitignore file (automatically created by Turborepo) already blocks this. Double-check by running: cat .gitignore \| grep .env**

# Section 2: Data Collection --- Your 1-Year Training Dataset {#section-2-data-collection-your-1-year-training-dataset}

This is the most important section. Your ML model is only as good as the data you feed it. You need at least 12 months of daily data from all sources listed below. More is better --- 36 months (3 years) gives you the best model accuracy.

> **PRD Rule: Collect data from ALL 12 sources listed below. Do NOT skip any source. Each one captures a different signal. Missing the HPAI flag alone could cause 5--10% accuracy loss. Missing feed cost lag can cause 15--20% loss. Every source matters.**

## 2.1 Source 1 --- AGMARKNET (Most Important!) {#source-1-agmarknet-most-important}

<table style="width:93%;">
<colgroup>
<col style="width: 11%" />
<col style="width: 81%" />
</colgroup>
<tbody>
<tr>
<td style="text-align: center;"><p>STEP</p>
<p><strong>2</strong></p></td>
<td><p><strong>Download Daily Broiler Prices — AGMARKNET</strong></p>
<p><strong>Platform:</strong> data.gov.in + Python Script <strong>| Estimated Time:</strong> 3–5 days to collect, then daily automatic</p></td>
</tr>
</tbody>
</table>

What data: Daily broiler/chicken mandi arrival prices for Gorakhpur, Deoria, Basti, Kushinagar, and Maharajganj mandis. This is your PRIMARY training target --- what you are trying to predict.

How to get it (Step by Step):

1.  Go to data.gov.in --- click \'Sign In\' top right, create a free account

2.  Search \'agmarknet\' in the search bar --- click the first result

3.  Click \'API Access\' → \'Get API Key\' → fill the form → you get a key in your email (takes 1--2 days)

4.  Once you have the key, create a Python file: apps/pipeline/scripts/download_agmarknet.py

5.  Paste the script from Section 12.1 of this guide → run it → it downloads all historical data

> *The API gives you up to 500 requests per day. To download 3 years of data, you will need to run the script in batches over 3--4 days. The script in Section 12 handles this automatically.*

What good data looks like:

| **Column Name** | **Example Value** | **What It Means** | **Acceptable Range** |
|----|----|----|----|
| date | 2024-03-15 | Date of price recording | Not future, not older than data start |
| mandi_name | Gorakhpur | Which market | Only: Gorakhpur, Deoria, Basti, Kushinagar, Maharajganj |
| broiler_price_per_kg | 162.50 | Live broiler price ₹/kg | ₹80 to ₹250 only --- reject outside this |
| arrivals_kg | 45000 | How many kg sold that day | Used as volume signal --- can be zero |

## 2.2 Source 2 --- NECC (Egg Price Proxy) {#source-2-necc-egg-price-proxy}

<table style="width:93%;">
<colgroup>
<col style="width: 11%" />
<col style="width: 81%" />
</colgroup>
<tbody>
<tr>
<td style="text-align: center;"><p>STEP</p>
<p><strong>3</strong></p></td>
<td><p><strong>Scrape Egg Prices from NECC Website</strong></p>
<p><strong>Platform:</strong> Python + BeautifulSoup4 <strong>| Estimated Time:</strong> 2–3 hours</p></td>
</tr>
</tbody>
</table>

Website: necc.co.in/daily-rates --- this page updates every day with egg prices by zone. Go there in your browser --- you will see a table. The UP zone price is your target.

Why egg prices matter for broiler: Both broiler and eggs follow feed costs and seasonal demand. When egg prices rise, broiler prices usually follow in 3--7 days. This is a leading indicator.

How to get it:

6.  Open apps/pipeline/dags/dag_raw_ingest.py

7.  The ingest_necc task uses BeautifulSoup4 to parse the HTML table every day at 05:00 IST

8.  For historical data: you need to manually visit archive.org and load necc.co.in/daily-rates pages for past dates --- OR contact NECC directly at their email on the website and request a historical data export. This is the PRD recommendation and they usually say yes.

9.  Store in format: date, zone, egg_price_per_dozen --- validate range ₹3--₹12/egg

## 2.3 Source 3 --- IMD Weather Data (Critical for Accuracy) {#source-3-imd-weather-data-critical-for-accuracy}

<table style="width:93%;">
<colgroup>
<col style="width: 11%" />
<col style="width: 81%" />
</colgroup>
<tbody>
<tr>
<td style="text-align: center;"><p>STEP</p>
<p><strong>4</strong></p></td>
<td><p><strong>Download Weather Data from IMD API</strong></p>
<p><strong>Platform:</strong> api.imd.gov.in (No Login Required) <strong>| Estimated Time:</strong> 1 hour</p></td>
</tr>
</tbody>
</table>

IMD (India Meteorological Department) provides a free, open API. No registration required. You can call it directly.

What data to collect for Gorakhpur district:

- Daily temperature (min/max/avg) in degrees Celsius

- Daily rainfall in mm

- Humidity percentage

- Heat wave alerts (binary flag --- was there a heat wave today?)

- Cold wave alerts (binary flag)

- 5-day forecast (used for feature engineering)

API endpoints to use (call these daily):

| **Endpoint** | **Data Returned** | **Gorakhpur District Code** |
|----|----|----|
| api.imd.gov.in/api/v1/districtnowcast?district=gorakhpur | Today\'s actual temp, rain, humidity | Use \'gorakhpur\' as the district code |
| api.imd.gov.in/api/v1/districtforecast?district=gorakhpur | 5-day ahead forecast | Same code |

> *If the IMD API is down, the system automatically falls back to OpenWeatherMap free tier. Set this up as backup: openweathermap.org/api --- free account gives 1,000 calls/day. Gorakhpur lat/lon: 26.7606, 83.3732*

## 2.4 Source 4 --- DAHDF Disease Alerts (HPAI) {#source-4-dahdf-disease-alerts-hpai}

<table style="width:93%;">
<colgroup>
<col style="width: 11%" />
<col style="width: 81%" />
</colgroup>
<tbody>
<tr>
<td style="text-align: center;"><p>STEP</p>
<p><strong>5</strong></p></td>
<td><p><strong>Download Disease Alerts from DAHDF</strong></p>
<p><strong>Platform:</strong> dahd.gov.in (PDF Scraping) <strong>| Estimated Time:</strong> 2 hours setup, then weekly automatic</p></td>
</tr>
</tbody>
</table>

DAHDF = Department of Animal Husbandry and Dairying & Fisheries. They publish a weekly disease bulletin as a PDF. This is your source for HPAI (Bird Flu) outbreak alerts.

Why this matters so much: A single HPAI alert within 200km of Gorakhpur can crash broiler prices by ₹15--30/kg within 48 hours. If your model does not see this signal, it will miss the most dramatic price events.

How to get it:

10. Go to: dahd.gov.in/en/disease-surveillance

11. Download the weekly bulletin PDF (published every Monday)

12. The script uses tabula-py to extract the table of district-wise alerts

13. Parse: district name, disease type (HPAI / ND / Salmonella etc.), date reported, status

14. Convert to a binary flag: hpai_district_flag = 1 if any HPAI alert within 200km of Gorakhpur in past 14 days

> **If the PDF fails to parse (DAHDF sometimes changes format), default hpai_district_flag to 0 (no alert) --- this is safer than defaulting to 1, which would cause false panic predictions.**

## 2.5 Source 5 --- NCDEX/MCX Feed Costs (Second Most Important) {#source-5-ncdexmcx-feed-costs-second-most-important}

<table style="width:93%;">
<colgroup>
<col style="width: 11%" />
<col style="width: 81%" />
</colgroup>
<tbody>
<tr>
<td style="text-align: center;"><p>STEP</p>
<p><strong>6</strong></p></td>
<td><p><strong>Scrape Commodity Prices from NCDEX and MCX</strong></p>
<p><strong>Platform:</strong> Web Scraping (15-min delayed public data) <strong>| Estimated Time:</strong> 3 hours</p></td>
</tr>
</tbody>
</table>

Maize (makka) and soybean meal are the two main ingredients in poultry feed. Their price today determines broiler production cost 42 days from now --- because that is how long a batch takes to grow out.

This 42-day lag is THE most important feature in your model (Rank \#1 in PRD Section 6.3). Getting this right alone can give you 10--15% accuracy improvement.

| **Source** | **What to Collect** | **URL** | **Update Time** |
|----|----|----|----|
| NCDEX | Maize spot price (₹/quintal), Soybean Meal spot price | ncdex.com/trading/reports | After 16:30 IST daily |
| MCX | Soybean Oil futures, Crude Palm Oil futures (feed cost proxy) | mcxindia.com/market-data/market-watch | After 16:30 IST daily |
| NCDEX Historical | 3 years of maize/soya historical data (CSV download) | ncdex.com → Reports → Historical Data | One-time download |

> *Both websites show 15-minute delayed prices publicly. This is legal to scrape and use commercially --- you are reading publicly displayed information. Follow good practices: add 2--5 seconds delay between requests, never scrape more than 10 times per day.*

## 2.6 Source 6 --- Google Trends (Search Interest Signal) {#source-6-google-trends-search-interest-signal}

<table style="width:93%;">
<colgroup>
<col style="width: 11%" />
<col style="width: 81%" />
</colgroup>
<tbody>
<tr>
<td style="text-align: center;"><p>STEP</p>
<p><strong>7</strong></p></td>
<td><p><strong>Download Google Search Trends with pytrends</strong></p>
<p><strong>Platform:</strong> Python + pytrends library <strong>| Estimated Time:</strong> 30 minutes</p></td>
</tr>
</tbody>
</table>

When people in Gorakhpur start searching \'chicken price today\' or \'murga rate\' on Google, it means demand is rising. This is a real-time demand signal that captures consumer intent 1--3 days before prices move.

How to use it (example Python code):

from pytrends.request import TrendReq pytrend = TrendReq(hl=\'hi\', tz=330) kw_list = \[\'chicken price Gorakhpur\', \'murga rate UP\', \'broiler price today\'\] pytrend.build_payload(kw_list, cat=0, timeframe=\'today 3-m\', geo=\'IN-UP\') interest_df = pytrend.interest_over_time()

> **pytrends is an unofficial library. Google can block it if you call too many times. Maximum 10 calls per day. Cache results for 7 days. Never call more than needed.**

## 2.7 Sources 7--12 --- Monthly/Historical Reference Data {#sources-712-monthlyhistorical-reference-data}

These sources update monthly or are one-time downloads. They provide global context and help the model understand macro trends.

| **Source** | **What to Download** | **URL** | **Frequency** | **How to Get** |
|----|----|----|----|----|
| Kaggle | Indian poultry price historical dataset + AGMARKNET historical CSVs | kaggle.com --- search \'India poultry prices\' | One-time + quarterly check | Create Kaggle account → download datasets (CC0 license --- free to use) |
| FAO | India poultry production statistics, feed cost indices | fao.org/faostat/en/#data/QCL | Monthly (1st of month) | Direct CSV download, no login needed |
| USDA FAS | India poultry market GAIN reports (qualitative + data) | fas.usda.gov/data/india-poultry-and-products | Monthly/Quarterly | PDF download, no login needed |
| UP Agriculture Dept. | UP state mandi records, farmer production data | upagripardarshi.gov.in | Monthly | Web scrape + send formal data request letter (recommended in PRD) |
| MLA Australia | Global poultry price indices, trade flow data | mla.com.au/prices-markets | Monthly | Public PDF reports --- download and parse |
| World Bank | India commodity price indices, inflation data | data.worldbank.org/indicator | Monthly | Direct CSV download via API |

# Section 3: Data Cleaning & Validation {#section-3-data-cleaning-validation}

Raw data is messy. Government APIs have missing days. Websites have wrong values. Before you train any model, every data point must be validated. This section uses Great Expectations --- an automated data quality tool.

<table style="width:93%;">
<colgroup>
<col style="width: 11%" />
<col style="width: 81%" />
</colgroup>
<tbody>
<tr>
<td style="text-align: center;"><p>STEP</p>
<p><strong>8</strong></p></td>
<td><p><strong>Set Up Great Expectations Data Validation</strong></p>
<p><strong>Platform:</strong> Python + Great Expectations library <strong>| Estimated Time:</strong> 1 day</p></td>
</tr>
</tbody>
</table>

Great Expectations checks your data automatically and tells you exactly which records fail quality rules. Think of it as an automatic proofreader for your data.

## 3.1 Install and Initialise Great Expectations {#install-and-initialise-great-expectations}

15. In your terminal: pip install great_expectations

16. Navigate to: cd apps/pipeline

17. Run: great_expectations init --- this creates the configuration folder

18. Create a new expectation suite: great_expectations suite new

19. Name it: daily_completeness

## 3.2 The 7 Validation Rules (from TRD §3.3) {#the-7-validation-rules-from-trd-3.3}

These are the EXACT rules required by your TRD. ALL SEVEN must pass before feature engineering runs. If any rule fails, the entire day\'s data is blocked from reaching the model.

| **Field** | **Rule** | **What to Do If It Fails** | **Severity** |
|----|----|----|----|
| broiler_price_per_kg | Must be between ₹80 and ₹250. Cannot be empty. | Reject the row. Use rolling median of last 3 days instead (max 3 consecutive days). If 4+ days missing → Slack alert, block pipeline. | CRITICAL |
| mandi_name | Must be one of: Gorakhpur, Deoria, Basti, Kushinagar, Maharajganj | Reject entire record. Log to anomaly_log table in Supabase. | HIGH |
| date | Must be a valid date. Cannot be in the future. Cannot be older than 2 days from today. | Reject. Send Slack alert if date gap \>2 days for any mandi. | CRITICAL |
| maize_price_per_quintal | Must be between ₹1,200 and ₹4,000 | Interpolate from NCDEX historical. Mark as imputed with flag column. | HIGH |
| temperature_celsius | Must be between -5 and 55 degrees (Gorakhpur range) | Use IMD 5-day forecast value for that day instead. | MEDIUM |
| hpai_district_flag | Must be 0 or 1 only. Cannot be empty. | Default to 0 (no alert) on any parse failure. Never null. | HIGH |
| completeness_overall | At least 95% of all fields must be non-empty in the full feature matrix | BLOCK all downstream steps. Do not train model. Send Slack alert. Investigate manually. | CRITICAL |

## 3.3 How to Handle Missing Data {#how-to-handle-missing-data}

You will have missing data. This is normal. Here is exactly what to do for each case:

| **Situation** | **What to Do** | **Python Code Pattern** | **Max Allowed** |
|----|----|----|----|
| 1 or 2 consecutive days missing price | Use forward-fill (carry forward last known value) | df\[\'price\'\].fillna(method=\'ffill\', limit=2) | 2 days auto-filled |
| 3 or more days missing price | Alert Slack, check AGMARKNET API, fill manually if possible | Raise AirflowFailException after 3 days gap | Never more than 3 auto-filled |
| Weekend / market holiday | Expected --- forward-fill is correct | Same as above | 2 days (weekend) |
| Weather data missing | Use IMD forecast from previous call as backup | df\[\'temp\'\].fillna(df\[\'temp_forecast\'\]) | Unlimited if forecast available |
| HPAI flag parse error | Default to 0 (conservative --- no false panic) | Hardcoded in exception handler | Always safe to default 0 |
| Maize price missing | Interpolate from NCDEX CSV historical download | df\[\'maize\'\].interpolate(method=\'time\', limit=5) | 5 days max interpolation |

> Your data is ready to proceed if: overall completeness \>95%, no CRITICAL validation failures, and no mandi has \>3 consecutive missing days. Run Great Expectations checkpoint: great_expectations checkpoint run daily_completeness

# Section 4: Feature Engineering --- Creating the 45 Prediction Features {#section-4-feature-engineering-creating-the-45-prediction-features}

Raw prices alone cannot predict future prices well. You need to create derived features that capture the patterns a good trader would know. This section creates all 45 features from PRD Section 6.3 and TRD Section 4.3.

> **This is where most beginners make the fatal mistake of data leakage. Rule: Every feature you use to predict tomorrow must use ONLY data available TODAY. Never use tomorrow\'s data to predict tomorrow. Your pipeline enforces this automatically if you follow the lag rules exactly.**

<table style="width:93%;">
<colgroup>
<col style="width: 11%" />
<col style="width: 81%" />
</colgroup>
<tbody>
<tr>
<td style="text-align: center;"><p>STEP</p>
<p><strong>9</strong></p></td>
<td><p><strong>Run the Feature Engineering Pipeline</strong></p>
<p><strong>Platform:</strong> Python (dag_feature_eng.py) <strong>| Estimated Time:</strong> 5–8 minutes per day, automatic</p></td>
</tr>
</tbody>
</table>

## 4.1 The Top 10 Features (Most Important for 95% Accuracy) {#the-top-10-features-most-important-for-95-accuracy}

| **Rank** | **Feature Name** | **What It Captures** | **How to Compute** | **Data Source** |
|----|----|----|----|----|
| \#1 | feed_cost_ratio_lag42 | Broiler cost pressure --- feed price 42 days ago determines today\'s supply cost | broiler_price\[today\] ÷ maize_price\[today-42\] | NCDEX maize price |
| \#2 | soy_price_lag42 | Soya meal = 25--30% of feed. Today\'s soya price determines cost 42 days ahead | soybean_meal_price\[today-42\] | NCDEX soya price |
| \#3 | price_lag_7d | Last week\'s price --- strongest near-term momentum signal | broiler_price\[today-7\] | AGMARKNET daily price |
| \#4 | price_ma_7d | 7-day average smooths out daily noise, shows underlying direction | average of last 7 days price | AGMARKNET |
| \#5 | festival_7d_flag | Demand spike signal --- UP festivals can push price ₹8--15/kg higher | 1 if within 7 days of Diwali/Eid/Holi/Navratri/Christmas/Muharram/Raksha Bandhan | Static calendar (hardcode the dates) |
| \#6 | heat_stress_7d | Heat kills birds, reduces supply --- temperature above 35°C counts | count of days in last 7 where temp \> 35°C | IMD API |
| \#7 | price_lag_1d | Yesterday\'s price --- strongest single autocorrelation | broiler_price\[today-1\] | AGMARKNET |
| \#8 | monsoon_phase | Monsoon affects transport, feed supply, bird health | 0=pre-monsoon, 1=active, 2=peak, 3=retreat (based on IMD dates) | IMD data + calendar |
| \#9 | price_std_30d | Volatility --- tells model how uncertain to be about predictions | standard deviation of prices over last 30 days | AGMARKNET |
| \#10 | hpai_district_flag | Disease shock --- single most extreme price event possible | 1 if HPAI alert within 200km of Gorakhpur in last 14 days | DAHDF weekly bulletin |

## 4.2 Complete List of All 45 Features {#complete-list-of-all-45-features}

| **Feature Group** | **Features** | **Count** |
|----|----|----|
| Price Lags (past price signals) | price_lag_1d, price_lag_3d, price_lag_7d, price_lag_14d, price_lag_21d, price_lag_30d, price_lag_42d | 7 |
| Rolling Statistics (trend) | price_ma_7d, price_ma_14d, price_ma_30d, price_std_7d, price_std_30d, price_momentum_14d, trend_slope_14d | 7 |
| Feed Cost Features (42-day lag) | feed_cost_ratio_lag42, soy_price_lag42, palm_oil_lag42, maize_price_current, soy_price_current | 5 |
| Weather Features | temperature_max, temperature_min, heat_stress_7d, cold_wave_binary, rainfall_7d_mm, monsoon_phase | 6 |
| Disease Features | hpai_district_flag, hpai_adjacent_district_flag | 2 |
| Festival & Calendar | festival_7d_flag, days_to_next_festival, weekend_flag, month_sin, month_cos, day_of_week_sin, day_of_week_cos | 7 |
| Market Demand Signals | necc_zone_price_delta, egg_price_weekly_change, google_trends_7d_avg, national_egg_production_index | 4 |
| Supply Signals | doc_placement_lag42, fuel_price_delta, transport_disruption_flag | 3 |
| External Market | ncdex_maize_futures_spread, mcx_palm_oil_delta, mla_global_price_index | 3 |
| Derived Interaction | feed_weather_stress_combo, festival_hpai_overlap_flag | 2 |

Total: 45 features exactly --- matching TRD §4.3. All features are stored as a Parquet file (fast data format) in your Supabase storage bucket, updated daily by dag_feature_eng.

## 4.3 Critical: Festival Calendar for UP Region {#critical-festival-calendar-for-up-region}

This is one of the most impactful features and the one most teams get wrong. You must include ALL of these festivals for the UP region --- not just the national ones:

| **Festival** | **Typical Month (UP)** | **Price Impact** | **Direction** |
|----|----|----|----|
| Diwali | October/November | ₹10--15/kg spike for 7--10 days | UP ↑ |
| Eid-ul-Fitr | March/April (lunar) | ₹8--12/kg spike | UP ↑ |
| Eid-ul-Adha | June/July (lunar) | ₹5--10/kg spike | UP ↑ |
| Holi | March | ₹5--8/kg spike | UP ↑ |
| Navratri (both) | April and October | ₹3--8/kg DROP (Hindu fasting) | UP ↓ |
| Christmas & New Year | December | ₹5--8/kg spike | UP ↑ |
| Muharram | Variable (lunar) | ₹3--5/kg spike | UP ↑ |
| Raksha Bandhan | August | ₹3--5/kg spike | UP ↑ |
| UP Poultry Industry Fair (local) | Variable | Supply increase --- slight drop | UP ↓ |

> *Navratri is special --- it causes a PRICE DROP because many Hindus avoid non-vegetarian food during this period, reducing demand. This is why the direction flag must capture both UP and DOWN festivals separately.*

# Section 5: Baseline Models --- ARIMA and Prophet {#section-5-baseline-models-arima-and-prophet}

Before training the complex models, you build two simple baseline models. These tell you the minimum accuracy your complex models must beat. They also serve as safety nets --- if the complex model fails, the ensemble falls back to these baselines.

<table style="width:93%;">
<colgroup>
<col style="width: 11%" />
<col style="width: 81%" />
</colgroup>
<tbody>
<tr>
<td style="text-align: center;"><p>STEP</p>
<p><strong>10</strong></p></td>
<td><p><strong>Train ARIMA Baseline Model</strong></p>
<p><strong>Platform:</strong> Python + statsmodels library on Railway.app CPU <strong>| Estimated Time:</strong> 15–20 minutes to train</p></td>
</tr>
</tbody>
</table>

## 5.1 ARIMA Model --- What It Does {#arima-model-what-it-does}

ARIMA stands for AutoRegressive Integrated Moving Average. In plain language: it looks at how prices changed in the past and predicts how they will change next. It is the most studied model for commodity price forecasting.

The exact configuration to use (from Karnataka paper cited in PRD):

- Model: ARIMA(0, 1, 4) --- these 3 numbers are the model settings

- The \'1\' in the middle means it uses the difference between consecutive prices (handles non-constant mean)

- The \'4\' at the end means it uses the last 4 error terms to improve prediction

- Library to use: statsmodels.tsa.arima.model.ARIMA

Run this in Python:

from statsmodels.tsa.arima.model import ARIMA import pandas as pd \# Load your cleaned price data df = pd.read_parquet(\'gorakhpur_prices_clean.parquet\') train = df\[df\[\'date\'\] \< \'2024-01-01\'\]\[\'broiler_price_per_kg\'\] \# time split \# Train ARIMA model = ARIMA(train, order=(0, 1, 4)) model_fit = model.fit() \# Save results model_fit.save(\'arima_model.pkl\') print(f\'ARIMA trained. AIC: {model_fit.aic}\')

> *Expected baseline results at Week 5--6 of your 16-week roadmap: MAPE around 15--20%, Directional Accuracy around 60--65%. These are your starting numbers. The final ensemble will reach \<6% MAPE and \>95% directional.*

## 5.2 Prophet Model --- Festival-Aware Forecasting {#prophet-model-festival-aware-forecasting}

<table style="width:93%;">
<colgroup>
<col style="width: 11%" />
<col style="width: 81%" />
</colgroup>
<tbody>
<tr>
<td style="text-align: center;"><p>STEP</p>
<p><strong>11</strong></p></td>
<td><p><strong>Train Facebook Prophet Model</strong></p>
<p><strong>Platform:</strong> Python + prophet library <strong>| Estimated Time:</strong> 20–30 minutes to train</p></td>
</tr>
</tbody>
</table>

Prophet is a model created by Facebook. It is designed specifically for time series data with seasonal patterns and holiday effects. For your UP poultry data, the festival calendar makes Prophet very effective.

Key settings for Prophet:

- changepoint_prior_scale: 0.05 (start here --- controls how quickly trend changes)

- seasonality_mode: \'multiplicative\' (better for prices that fluctuate percentage-wise, not absolute)

- Add Indian festivals: use the make_holidays function with country=\'IN\' and add UP-specific festivals manually

Python code:

from prophet import Prophet import pandas as pd \# Prophet needs columns named \'ds\' and \'y\' df_prophet = df\[\[\'date\', \'broiler_price_per_kg\'\]\].rename(columns={\'date\':\'ds\', \'broiler_price_per_kg\':\'y\'}) \# Custom UP festivals up_festivals = pd.DataFrame({ \'holiday\': \[\'diwali\',\'eid_fitr\',\'eid_adha\',\'holi\'\], \'ds\': pd.to_datetime(\[\'2023-11-12\',\'2024-04-10\',\'2024-06-17\',\'2024-03-25\'\]), \'lower_window\': -3, \'upper_window\': 7 }) model = Prophet(changepoint_prior_scale=0.05, seasonality_mode=\'multiplicative\', holidays=up_festivals) model.add_country_holidays(country_name=\'IN\') model.fit(df_prophet) model.save(\'prophet_model.pkl\')

# Section 6: LightGBM --- The Main Causal Model {#section-6-lightgbm-the-main-causal-model}

LightGBM is the most important model in your ensemble. It handles all 45 engineered features, finds complex relationships between them, and provides SHAP explanations --- which tell you exactly WHY the model made each prediction. This is what generates the \'price driver\' bullets shown to farmers.

<table style="width:93%;">
<colgroup>
<col style="width: 11%" />
<col style="width: 81%" />
</colgroup>
<tbody>
<tr>
<td style="text-align: center;"><p>STEP</p>
<p><strong>12</strong></p></td>
<td><p><strong>Train LightGBM Model with Optuna Hyperparameter Tuning</strong></p>
<p><strong>Platform:</strong> Python + lightgbm + optuna + shap on Railway.app CPU (2 vCPU) <strong>| Estimated Time:</strong> 15–20 minutes per training run</p></td>
</tr>
</tbody>
</table>

## 6.1 Time-Series Cross Validation --- The Critical Rule {#time-series-cross-validation-the-critical-rule}

> **NEVER use random train/test split for time series data. This is the \#1 mistake that produces artificially high accuracy numbers that will fail in production. Always use TimeSeriesSplit --- it trains on the past and tests on the future, exactly like your real use case.**

How TimeSeriesSplit works --- with n_splits=5 on 3 years of data:

| **Split \#** | **Training Data (Past)** | **Test Data (Future)** | **What This Tests** |
|----|----|----|----|
| Split 1 | Jan 2021 -- Dec 2021 (12 months) | Jan 2022 -- Mar 2022 (3 months) | Does the model generalise to the next quarter? |
| Split 2 | Jan 2021 -- Mar 2022 (15 months) | Apr 2022 -- Jun 2022 (3 months) | Does it still work 3 months later? |
| Split 3 | Jan 2021 -- Jun 2022 (18 months) | Jul 2022 -- Sep 2022 (3 months) | Can it predict through monsoon season? |
| Split 4 | Jan 2021 -- Sep 2022 (21 months) | Oct 2022 -- Dec 2022 (3 months) | Does it handle Diwali demand spike? |
| Split 5 | Jan 2021 -- Dec 2022 (24 months) | Jan 2023 -- Mar 2023 (3 months) | Final cross-validation test |

## 6.2 Hyperparameter Tuning with Optuna {#hyperparameter-tuning-with-optuna}

LightGBM has many settings that affect accuracy. Optuna automatically finds the best settings by trying 50 different combinations and picking the one with the lowest MAPE on validation data.

This process runs automatically. You start it and come back in 20--30 minutes:

import optuna import lightgbm as lgb from sklearn.model_selection import TimeSeriesSplit def objective(trial): params = { \'num_leaves\': trial.suggest_int(\'num_leaves\', 20, 300), \'learning_rate\': trial.suggest_float(\'learning_rate\', 0.01, 0.3, log=True), \'feature_fraction\': trial.suggest_float(\'feature_fraction\', 0.5, 1.0), \'bagging_fraction\': trial.suggest_float(\'bagging_fraction\', 0.5, 1.0), \'min_child_samples\': trial.suggest_int(\'min_child_samples\', 10, 200), \'objective\': \'regression\', \'metric\': \'mape\' } tscv = TimeSeriesSplit(n_splits=5) mapes = \[\] for train_idx, val_idx in tscv.split(X): model = lgb.train(params, lgb.Dataset(X\[train_idx\], y\[train_idx\]), valid_sets=\[lgb.Dataset(X\[val_idx\], y\[val_idx\])\], num_boost_round=500, callbacks=\[lgb.early_stopping(50)\]) pred = model.predict(X\[val_idx\]) mapes.append(np.mean(np.abs((y\[val_idx\]-pred)/y\[val_idx\]))) return np.mean(mapes) study = optuna.create_study(direction=\'minimize\') study.optimize(objective, n_trials=50) \# try 50 combinations print(\'Best MAPE:\', study.best_value) print(\'Best params:\', study.best_params)

## 6.3 SHAP Analysis --- Why the Model Predicts What It Predicts {#shap-analysis-why-the-model-predicts-what-it-predicts}

After training LightGBM, you run SHAP analysis. This creates the \'Price Drivers\' section that farmers see in the app --- the top 3 reasons why the price is predicted to move up or down.

For example: \'Feed cost rising (impact: +₹8/kg)\' or \'Heat stress reducing supply (impact: +₹5/kg)\' or \'Festival demand spike (impact: +₹12/kg)\'.

> *The top 3 SHAP features for your prediction are stored in the \'drivers\' JSONB column in the Supabase predictions table. They are displayed in the mobile app as Hindi text using the description_hi field defined in the PriceDriver type.*

| **Expected MAPE at this stage** | **Expected Directional Accuracy** | **If you see worse than this** | **What to do** |
|----|----|----|----|
| \<12% | \>80% | MAPE \>15% | Add more features from PRD Section 6.3. Check if maize lag is correctly set to 42 days. |
|  |  | Directional \<75% | Check festival calendar is complete. Add the monsoon phase feature if missing. |
|  |  | Model trains in \<2 min | Your dataset is too small. You need at least 2 years of data. Add Kaggle historical datasets. |

# Section 7: Temporal Fusion Transformer (TFT) --- Deep Learning Model {#section-7-temporal-fusion-transformer-tft-deep-learning-model}

TFT is the most powerful model in your ensemble. It uses deep learning (many layers of neural networks) to capture complex non-linear patterns that ARIMA and LightGBM cannot see. It also natively produces P10/P50/P90 quantile predictions --- the confidence interval range your farmers see in the app.

<table style="width:93%;">
<colgroup>
<col style="width: 11%" />
<col style="width: 81%" />
</colgroup>
<tbody>
<tr>
<td style="text-align: center;"><p>STEP</p>
<p><strong>13</strong></p></td>
<td><p><strong>Train TFT Model on AWS Spot GPU</strong></p>
<p><strong>Platform:</strong> AWS g4dn.xlarge (T4 GPU) + pytorch-forecasting <strong>| Estimated Time:</strong> 30–45 minutes per training run, ~₹800/run</p></td>
</tr>
</tbody>
</table>

## 7.1 Setting Up the AWS Spot GPU Instance {#setting-up-the-aws-spot-gpu-instance}

A GPU instance runs your deep learning model 10--20x faster than a regular CPU. AWS Spot instances let you use GPU compute at 65--80% discount. You only pay when the instance is running.

Step by step to launch your spot instance:

20. Log into AWS Console at console.aws.amazon.com

21. Go to EC2 → Instances → Launch Instances

22. Search for g4dn.xlarge in the instance type search --- this has 1 NVIDIA T4 GPU with 16GB memory

23. Under \'Purchasing Options\' --- check \'Spot Instances\' --- price drops from ₹1,200/hr to ₹400/hr

24. Choose Amazon Linux 2 or Ubuntu 22.04 as the operating system

25. Add 50GB storage (gp3 SSD type)

26. Create a key pair --- download the .pem file --- keep it safe

27. Launch the instance --- wait 2--3 minutes for it to start

28. SSH into it: ssh -i your-key.pem ubuntu@YOUR_AWS_PUBLIC_IP

29. Install dependencies: pip install pytorch-forecasting torch torchvision onnx onnxruntime mapie

> *You only need to run this GPU instance on Sunday nights (2:00 AM IST per TRD). Total monthly cost: \~₹800 × 3 runs = \~₹2,400/month. Always STOP the instance after training is done --- an idle GPU still charges you!*

## 7.2 TFT Model Architecture {#tft-model-architecture}

You do not need to understand the inner workings. You only need to set the right configuration parameters:

| **Parameter** | **Value to Use** | **What It Controls** |
|----|----|----|
| max_encoder_length | 90 | How many days of past data the model looks at |
| max_prediction_length | 14 | How many days ahead to predict |
| learning_rate | 0.03 | How fast the model learns (start here, tune if needed) |
| batch_size | 128 | How many examples to train on at once (T4 GPU can handle this) |
| hidden_size | 64 | Size of internal neural network layers |
| attention_head_size | 4 | Number of attention heads (captures different time patterns) |
| dropout | 0.1 | Regularisation to prevent overfitting |
| hidden_continuous_size | 8 | Size of layers for continuous features |
| quantiles | \[0.1, 0.5, 0.9\] | P10, P50, P90 output --- these become your confidence interval |

## 7.3 ONNX Export and Quantisation {#onnx-export-and-quantisation}

After TFT training, you convert the model to ONNX format and apply INT8 quantisation. This shrinks the model size by 70% and makes it 4x faster on CPU --- so you can run inference on Railway.app\'s cheap CPU server instead of an expensive GPU server.

The 4-step export process (all automated in dag_model_retrain.py):

30. Export PyTorch model to ONNX: torch.onnx.export(model, dummy_input, \'model.onnx\', opset_version=17)

31. Quantise to INT8: onnxruntime.quantization.quantize_dynamic(\'model.onnx\', \'model_quant.onnx\', weight_type=QuantType.QInt8)

32. Accuracy regression test: run quantised model on 30-day holdout --- MAPE must be within 0.5% of full precision

33. Deploy to Railway.app: railway up \--detach --- model loads from S3 at startup

> Monthly infrastructure saving from ONNX quantisation: ₹3,685/month (₹44,220/year) compared to always-on GPU inference. This is documented in TRD §4.4.

# Section 8: Building the Ensemble --- Combining All 4 Models {#section-8-building-the-ensemble-combining-all-4-models}

An ensemble combines multiple models to produce a better prediction than any single model alone. Think of it as asking 4 different expert farmers for their price opinion and averaging them --- weighted by who has been more accurate recently.

<table style="width:93%;">
<colgroup>
<col style="width: 11%" />
<col style="width: 81%" />
</colgroup>
<tbody>
<tr>
<td style="text-align: center;"><p>STEP</p>
<p><strong>14</strong></p></td>
<td><p><strong>Build and Train the Ensemble Meta-Learner</strong></p>
<p><strong>Platform:</strong> Python + sklearn Ridge Regression <strong>| Estimated Time:</strong> 5–10 minutes</p></td>
</tr>
</tbody>
</table>

## 8.1 Initial Ensemble Weights {#initial-ensemble-weights}

Start with these weights (from PRD Section 6.4). These are based on typical performance. You will tune them in Week 10--12:

| **Model** | **Initial Weight** | **Rationale** | **When to Increase Weight** |
|----|----|----|----|
| ARIMA(0,1,4) | 15% | Seasonality and non-stationary trend baseline | When market is in a stable, predictable trend |
| Facebook Prophet | 20% | Festival and holiday effects --- strong UP signal | During festival seasons (Diwali, Eid weeks) |
| LightGBM | 35% | Primary causal model with 45 features --- highest accuracy | When feed cost / disease signals are driving prices |
| Temporal Fusion Transformer | 25% | Quantile forecasting --- captures complex non-linear patterns | When price is in a volatile, non-seasonal period |
| TOTAL | 95% | 5% reserved for conformal prediction calibration |  |

## 8.2 Meta-Learner (Replaces Fixed Weights at Month 8) {#meta-learner-replaces-fixed-weights-at-month-8}

After 4+ months of production data, replace the fixed weights with a Ridge regression meta-learner that automatically learns the optimal weights per season. This is the \'Stacking Meta-Learner\' in PRD Section 6.4.

How it works: you feed the meta-learner the predictions from all 4 models as inputs, and the actual prices as output. It learns: \'In summer (April--June), TFT is 5% more accurate than LightGBM. In festival weeks, Prophet is 12% more accurate.\' These are the weights it learns automatically.

## 8.3 Conformal Calibration --- The Confidence Interval {#conformal-calibration-the-confidence-interval}

After building the ensemble, you calibrate the confidence intervals using the MAPIE library. This ensures when you say \'80% confidence the price will be ₹155--₹165\', it is ACTUALLY true 80% of the time (within ±2%).

This is what the 3rd accuracy gate measures (Conformal Coverage 78--82%). Without this calibration, you might say 80% confidence but only achieve 55% --- which destroys farmer trust the moment they notice.

from mapie.regression import MapieRegressor from sklearn.linear_model import Ridge \# Calibrate on a separate calibration set (10% of training data, most recent) calibration_data = X_calib \# recent data not used in training mapie = MapieRegressor(estimator=ensemble_model, method=\'conformal_prediction\', cv=\'prefit\') mapie.fit(calibration_data, y_calib) \# Predict with 80% confidence interval y_pred, y_pis = mapie.predict(X_test, alpha=0.2) \# alpha=0.2 means 80% coverage p10 = y_pis\[:, 0, 0\] \# lower bound p90 = y_pis\[:, 1, 0\] \# upper bound p50 = y_pred \# point forecast \# Validate coverage coverage = np.mean((y_test \>= p10) & (y_test \<= p90)) print(f\'Actual coverage: {coverage:.1%}\') \# must be 78-82%

# Section 9: Accuracy Testing --- Clearing the Three Gates {#section-9-accuracy-testing-clearing-the-three-gates}

This is the most important section. Your model CANNOT go live until all three accuracy gates are cleared simultaneously. There is no partial credit. There are no exceptions.

<table style="width:93%;">
<colgroup>
<col style="width: 11%" />
<col style="width: 81%" />
</colgroup>
<tbody>
<tr>
<td style="text-align: center;"><p>STEP</p>
<p><strong>15</strong></p></td>
<td><p><strong>Run the Complete Accuracy Validation</strong></p>
<p><strong>Platform:</strong> Python backtesting on 6-month holdout <strong>| Estimated Time:</strong> 2–3 days for full validation</p></td>
</tr>
</tbody>
</table>

## 9.1 The Three Accuracy Gates {#the-three-accuracy-gates}

| **Gate \#** | **Metric** | **Target** | **What Failure Means** | **How to Measure** |
|----|----|----|----|----|
| Gate 1 (PRIMARY) | Directional Accuracy --- did the model predict price would go UP or DOWN correctly? | \>95% | Farmer follows wrong sell signal more than 1 in 20 days. Loses money. Churns. | sign(forecast_today - forecast_yesterday) == sign(actual_today - actual_yesterday) → correct. Average over 6-month holdout. |
| Gate 2 | MAPE --- how close was the ₹/kg number to the actual price? | \<6% | ₹/kg estimate is off by more than ₹10 on a ₹160 price. Farmer cannot use for profit calculation. | mean(\|actual - forecast\| / actual) × 100 on 90-day rolling holdout. |
| Gate 3 | Conformal Interval Coverage --- when you say \'80% confidence ₹155--₹165\', does actual fall in range 80% of the time? | 78--82% | Confidence intervals are lies. Farmers notice within 2 weeks. Trust destroyed. | Count actuals within stated interval / total predictions. Must be 80% ± 2%. |

## 9.2 The 16-Week Accuracy Roadmap {#the-16-week-accuracy-roadmap}

This is your exact milestone plan from PRD Section 6.2:

| **Week** | **Activity** | **MAPE Target** | **Directional Target** | **What Blocks You from Continuing** |
|----|----|----|----|----|
| 1--2 | Data pipeline: collect 36 months of historical data. Achieve 95%+ completeness. | --- | --- | \<95% data completeness blocks Week 3 |
| 3--4 | Feature engineering v1: 20 core features. SHAP analysis --- feed_cost_lag42 must appear in top 3. | Baseline only | Baseline only | If feed_cost_lag42 not in top 3 --- data alignment issue to fix |
| 5--6 | ARIMA + Prophet baselines on 6-month holdout (time split --- NOT random split). | \<18% | \>65% | If MAPE \>25% --- data quality problem. Go back to Weeks 1--2. |
| 7--9 | LightGBM + Ensemble v1. ARIMA + LightGBM weighted average. Tune weights on validation. | \<12% | \>80% | If directional \<80% --- add 5 more features (monsoon, NECC delta, trends) |
| 10--12 | TFT deep learning model. Full ensemble: all 4 models + stacking weights. Conformal calibration. | \<8% | \>90% | If TFT does not improve on LightGBM alone --- check for data leakage |
| 13--14 | Stress test 3 historical shocks: Nov--Mar 2024 crash, HPAI alert, Diwali 2023 spike. All must pass direction. | \<7% | \>93% | Any shock test failure --- add specific feature for that scenario |
| 15 | Manual validation: CTO + Data Head visit Gorakhpur mandis for 5 days. Record actual prices. Compare. | \<6% | \>94% | Physical validation must show \>90% directional match on those 10 days |
| 16 | Final certification. Run model on 6-month holdout NEVER seen during training. Compute all 3 metrics. | \<6% ✅ | \>95% ✅ | ALL THREE must pass simultaneously. Any failure → back to Week 9 with diagnosis. |

## 9.3 Stress Tests --- The Three Historical Shocks You Must Pass {#stress-tests-the-three-historical-shocks-you-must-pass}

> **The model MUST correctly predict the direction of these three historical events before launch clearance. If it gets even one wrong --- go back to Week 9.**

| **Shock Event** | **When It Happened** | **What the Model Must Predict** | **Feature That Should Fire** |
|----|----|----|----|
| Nov--Mar 2024 UP Price Crash | November 2023 -- March 2024: Gorakhpur broiler prices fell ₹20--30/kg due to AP/Telangana oversupply | Model must predict DOWNWARD direction for this period. If it predicts UP during the crash period --- failure. | price_ma_7d trend declining + national oversupply signal from FAO/USDA data |
| HPAI Zone Declaration in UP | Most recent HPAI district alert near Gorakhpur (check DAHDF records for 2023--2024) | Model must predict SHARP DROP within 48 hours of HPAI flag turning on | hpai_district_flag = 1, hpai_adjacent_district_flag = 1 |
| Diwali 2023 Demand Spike | October/November 2023: Diwali demand spike in UP, prices rose ₹8--15/kg for 7--10 days | Model must predict UPWARD direction starting 5--7 days before Diwali | festival_7d_flag = 1 for Diwali window |

## 9.4 Manual Ground Truth Validation (Week 15) {#manual-ground-truth-validation-week-15}

This step is non-negotiable per PRD Section 6.5, Rule 6. The CTO or Data Head must physically visit Gorakhpur APMC mandi for 5+ consecutive days and record actual prices. These are compared against what the model predicted.

| **Day** | **What to Record at Mandi** | **Compare Against** | **Document In** |
|----|----|----|----|
| Each day | Arrival price per kg (from APMC board or trader quotes) | Model\'s prediction from the night before (stored in Supabase predictions table) | Manual Validation Log (create a shared Google Sheet) |
| Each day | Main price drivers (what are traders saying is pushing price?) | SHAP driver explanations from model | Same validation log |
| Each day | Any supply disruptions, disease rumors, festival effects | Model\'s confidence interval width | Same log |
| After 10 days | Calculate manual directional accuracy: how many days was model\'s UP/DOWN correct? | Target: \>90% of those 10 days correct | docs/accuracy_validation_report.md --- signed by CTO |

# Section 10: Production Deployment on Railway.app {#section-10-production-deployment-on-railway.app}

Once all three accuracy gates are cleared and manual validation is complete, you deploy the model to production. The inference API runs on Railway.app and responds to requests in \<200ms.

<table style="width:93%;">
<colgroup>
<col style="width: 11%" />
<col style="width: 81%" />
</colgroup>
<tbody>
<tr>
<td style="text-align: center;"><p>STEP</p>
<p><strong>16</strong></p></td>
<td><p><strong>Deploy FastAPI + ONNX Inference Service to Railway.app</strong></p>
<p><strong>Platform:</strong> Railway.app Hobby Plan (~₹415/mo) <strong>| Estimated Time:</strong> 3–4 hours first time, then automatic</p></td>
</tr>
</tbody>
</table>

## 10.1 What Gets Deployed {#what-gets-deployed}

| **Component** | **File Location** | **What It Does** | **How It is Deployed** |
|----|----|----|----|
| FastAPI Main App | apps/api/main.py | Entry point --- loads ONNX model on startup, defines all API routes | Railway.app CLI: railway up |
| ONNX Inference | apps/api/inference/predictor.py | Loads model from S3, runs prediction, returns P10/P50/P90 | Part of the same Railway deployment |
| Sell Signal Logic | apps/api/inference/sell_signal.py | Computes SELL_NOW / HOLD / SELL_SOON based on prediction | Same deployment |
| WhatsApp Dispatcher | apps/api/whatsapp/dispatcher.py | Sends daily prediction to farmers via Twilio | Triggered by Airflow dag_model_infer at 06:00 IST |

## 10.2 The Champion/Challenger System {#the-championchallenger-system}

Every Sunday, the pipeline automatically trains a new model (challenger) and tests it against the current production model (champion). The challenger only replaces the champion if it is better.

| **Stage** | **What Happens Automatically** | **When It Triggers** | **What You Need to Do** |
|----|----|----|----|
| Champion Load | Pipeline loads current best model from S3: models/champion/latest.onnx | Every day at inference time | Nothing --- fully automatic |
| Challenger Train | Weekly retrain DAG trains new model on latest data | Sunday 2:00 AM IST | Check Slack alert that says \'retrain complete\' |
| Promotion Test | Challenger MAPE must be 2% better than champion to be promoted | Sunday after retrain | Check Slack: \'Challenger promoted\' or \'Challenger rejected\' |
| Rollback | If production MAPE \>8% OR directional \<90% for 3 consecutive days, auto-rollback to previous champion | Real-time monitoring by dag_accuracy_monitor | Investigate root cause --- was it a data pipeline failure? New data source change? |

## 10.3 API Endpoints After Deployment {#api-endpoints-after-deployment}

| **Endpoint** | **Method** | **What It Returns** | **Who Uses It** |
|----|----|----|----|
| POST /v1/predict | POST with feature matrix JSON | PredictionResult: {p10, p50, p90, drivers, confidence, model_version} | Called by Airflow dag_model_infer every day at 06:00 IST |
| GET /v1/accuracy | GET with admin auth | AccuracyReport: {mape_30d, directional_accuracy_30d, conformal_coverage_80, as_of} | Web dashboard accuracy page, CTO monitoring |
| GET /v1/health | GET (public) | Health status, model version, quantised: true, last inference timestamp | Railway.app health checks, monitoring |
| POST /admin/reload-model | POST (internal only) | Hot-swaps ONNX model without restarting the server | Called by champion promotion script |

# Section 11: Daily Monitoring --- Staying at 95%+ After Launch {#section-11-daily-monitoring-staying-at-95-after-launch}

Training the model once is not enough. Markets change. New competitors emerge. Disease patterns shift. You must monitor accuracy every day and retrain every week. This section explains exactly what to watch and what to do when things go wrong.

<table style="width:93%;">
<colgroup>
<col style="width: 11%" />
<col style="width: 81%" />
</colgroup>
<tbody>
<tr>
<td style="text-align: center;"><p>STEP</p>
<p><strong>17</strong></p></td>
<td><p><strong>Set Up Daily Accuracy Monitoring Dashboard</strong></p>
<p><strong>Platform:</strong> Supabase + Web Dashboard (apps/web/app/(dashboard)/accuracy/) <strong>| Estimated Time:</strong> 2 days to set up</p></td>
</tr>
</tbody>
</table>

## 11.1 The Daily Monitoring Checklist {#the-daily-monitoring-checklist}

| **Time** | **What to Check** | **Where to Check** | **Action if Red** |
|----|----|----|----|
| 06:30 IST daily | Did dag_raw_ingest complete? All 5 mandis have today\'s price? | Astronomer.io dashboard → DAG runs → dag_raw_ingest | Check AGMARKNET API status. Manually enter price from mandi phone call if API is down. |
| 07:00 IST daily | Did dag_model_infer complete? Was prediction stored in Supabase? | Supabase dashboard → predictions table → filter today\'s date | Check Railway.app inference API health endpoint. Check Slack alerts. |
| 07:30 IST daily | Did WhatsApp messages send to all active customers? | Twilio Console → Messaging → Logs | Check Twilio account balance. Check Slack delivery alerts. |
| Daily | 30-day rolling MAPE --- should be \<6% | Web dashboard → Accuracy page | If \>8% for 3 days: automatic rollback triggers. Manual investigation required. |
| Daily | 30-day directional accuracy --- should be \>95% | Same accuracy page | If \<90% for 3 days: alert sent to CTO Slack channel. Model review meeting. |
| Weekly (Monday) | Did Sunday retrain complete? Was challenger evaluated? | Astronomer.io → dag_model_retrain run | If retrain failed: run manually. Check AWS Spot availability. |

## 11.2 Slack Alert Configuration {#slack-alert-configuration}

The pipeline sends automatic Slack alerts for the following conditions. Set up a \#poultrypulse-alerts Slack channel and configure the webhook URL in your environment variables:

- AGMARKNET API fails 2 consecutive times: \'ALERT: AGMARKNET down for \[date\]. Using T-1 data with staleness flag.\'

- 30-day MAPE exceeds 8%: \'ALERT: Model MAPE at \[X\]% --- above 8% threshold. Rollback may trigger.\'

- Directional accuracy drops below 90%: \'ALERT: Directional accuracy at \[X\]% for 3 consecutive days. CTO review required.\'

- Challenger beats champion: \'INFO: Challenger model \[version\] promoted. New MAPE: \[X\]%. Previous: \[Y\]%.\'

- Challenger rejected: \'INFO: Challenger \[version\] rejected. Did not beat champion by 2%. Champion retained.\'

- Watermark leak detected: \'SECURITY: Prediction watermark match --- Customer \[ID\] prediction detected on \[platform\].\'

# Section 12: Task Script Alignment --- Full tasks.md Verification {#section-12-task-script-alignment-full-tasks.md-verification}

This section cross-references every task from your tasks.md with the implementation steps in this guide and confirms whether the code already exists or needs to be written.

<table style="width:93%;">
<colgroup>
<col style="width: 11%" />
<col style="width: 81%" />
</colgroup>
<tbody>
<tr>
<td style="text-align: center;"><p>STEP</p>
<p><strong>18</strong></p></td>
<td><p><strong>Verify All Pipeline Scripts Against tasks.md</strong></p>
<p><strong>Platform:</strong> Review + Terminal <strong>| Estimated Time:</strong> 1 day verification</p></td>
</tr>
</tbody>
</table>

| **Task \#** | **Task Description (from tasks.md)** | **Script Location** | **Status** | **Notes for Non-Technical Person** |
|----|----|----|----|----|
| 1 | Monorepo setup | Root package.json + turbo.json | Must Create | Run: npx create-turbo@latest poultrypulse. Then create folder structure as described in Section 1. |
| 2.1 | Domain type definitions | packages/types/src/domain.ts | Must Create | Copy interface definitions from TRD §3 into this TypeScript file. Or hire a TS developer for 2 hours. |
| 2.2 | API Zod schemas | packages/types/src/api.ts | Must Create | Defines the shape of every API request and response. Required for TypeScript strict mode. |
| 2.3 | Supabase DB types | packages/types/src/db.ts | Must Create | Auto-generate using: supabase gen types typescript \--project-id YOUR_ID \> packages/types/src/db.ts |
| 3.1--3.3 | Hindi + English i18n strings | packages/i18n/src/locales/hi.json + en.json | Must Create | All Hindi UI strings. Start with Section 4.1 strings from UIUX doc. Every key must exist in both files. |
| 4.1--4.8 | UI component library | packages/ui/src/components/ | Must Create | 8 components: PriceHero, SellSignalCard, AlertCard, BatchProfitCalculator, EmptyState, ConfidenceIntervalBar, OnboardingFlow. Each a separate .tsx file. |
| 6.1 | dag_raw_ingest.py | apps/pipeline/dags/dag_raw_ingest.py | Must Create | This is the core data collection DAG. Runs daily at 04:30 IST. Collects from AGMARKNET, NECC, IMD, NCDEX in parallel. |
| 6.2 | dag_validate.py | apps/pipeline/dags/dag_validate.py | Must Create | Runs Great Expectations daily at 05:00 IST. All 7 validation rules from Section 3.2 of this guide. |
| 6.3 | dag_feature_eng.py | apps/pipeline/dags/dag_feature_eng.py | Must Create | Computes all 45 features from Section 4 of this guide. Stores as Parquet in Supabase. |
| 6.4 | dag_model_infer.py | apps/pipeline/dags/dag_model_infer.py | Must Create | Calls FastAPI /v1/predict at 06:00 IST with today\'s feature matrix. Stores result. Triggers WhatsApp. |
| 6.5 | dag_accuracy_monitor.py | apps/pipeline/dags/dag_accuracy_monitor.py | Must Create | Compares T-1 prediction vs actual price. Updates accuracy_log table. Fires Slack alert if \>8% MAPE. |
| 6.6 | dag_model_retrain.py | apps/pipeline/dags/dag_model_retrain.py | Must Create | Sunday 2 AM. Trains all 4 models. Champion/challenger evaluation. Promotes if all 3 gates pass. |
| 6.7 | dag_watermark_audit.py | apps/pipeline/dags/dag_watermark_audit.py | Must Create | Scans 15 WhatsApp group feeds for screenshots. Decodes zero-width character watermarks. Alerts on match. |
| 6.8 | Great Expectations suite | apps/pipeline/great_expectations/ | Must Create | Configuration for all 7 validation rules. Run: great_expectations init inside apps/pipeline/ |
| 6.9 | Feature unit tests | apps/pipeline/tests/test_features.py | Must Create | Tests every feature function. feed_cost_ratio uses 42-day lag (not current). hpai defaults to 0 on failure. |
| 7.1 | FastAPI main.py | apps/api/main.py | Must Create | Entry point for ML inference API. Loads ONNX model on startup. Defines all routes from Section 10.3. |
| 7.2 | predictor.py | apps/api/inference/predictor.py | Must Create | Wraps ONNX Runtime. Runs inference in \<200ms on CPU. Hot-swaps model without restart. |
| 7.3 | sell_signal.py | apps/api/inference/sell_signal.py | Must Create | Computes SELL_NOW/HOLD/SELL_SOON logic based on P50 trend and farmer\'s batch harvest window. |
| 7.4 | Predictor tests | apps/api/tests/test_predictor.py | Must Create | Tests: p10 \<= p50 \<= p90 always true. reload_model() works. End-to-end latency \<200ms. |
| 8.1 | Initial DB schema | apps/db/migrations/001_initial_schema.sql | Must Create | All Supabase tables from Architecture §4.2. Run via Supabase dashboard → SQL Editor. |
| 8.2 | Accuracy SQL functions | apps/db/migrations/002_accuracy_functions.sql | Must Create | PostgreSQL functions for rolling MAPE calculation. Materialized view for dashboard. |
| 8.3 | Dev seed data | apps/db/seed/dev_seed.sql | Must Create | 30 days synthetic Gorakhpur prices + 3 test users + sample alerts for development testing. |
| 10.1--10.10 | Mobile app screens | apps/mobile/app/ | Must Create | 4 tab screens + hooks + auth + onboarding. Detailed specs in UIUX doc Section 3. |
| 12.1--12.2 | WhatsApp dispatcher/handler | apps/api/whatsapp/ | Must Create | Sends daily forecast via Twilio at 06:30 IST. Handles inbound \'bhav\'/\'help\'/\'band\' intents. |
| 13.1--13.7 | Web dashboard pages | apps/web/app/ | Must Create | Overview, Price Intelligence, Accuracy, Customer pages for B2B admin use. |
| 18 | 95%+ Accuracy Gate | docs/accuracy_validation_report.md | ABSOLUTE BLOCKER | Run automated backtesting. Manual Gorakhpur mandi validation. CTO signature required. NO customers before this. |

# Section 13: Document Coverage Audit --- What Your Files Contain {#section-13-document-coverage-audit-what-your-files-contain}

This section confirms what each of your 4 source documents covers and cross-checks against this guide to confirm all details are present.

| **Your Document** | **Key Content Covered** | **Verified in This Guide** | **Any Gaps Found?** |
|----|----|----|----|
| PRD v3.0 | Business model, customer segments S1--S6, 95% accuracy mandate, revenue timeline, Gorakhpur market profile, public data source inventory (12 sources), feature engineering spec (45 features), model ensemble architecture, IP watermarking, validation protocol rules | Sections 2 (data sources), 4 (features), 5--8 (models), 9 (accuracy gates), 12 (tasks) | None --- all 12 data sources, all 45 features, and all 3 accuracy gates are fully covered in this guide. |
| TRD v1.0 | Six-layer architecture (L1--L6), infrastructure costs (₹7,330/mo), Airflow DAG specs (9 DAGs), data validation rules (7 fields), champion/challenger framework, ONNX quantisation pipeline, API endpoints with SLAs, Supabase schema with RLS | Sections 1 (setup), 3 (validation), 7 (TFT/ONNX), 8 (ensemble), 10 (deployment), 11 (monitoring) | None --- all 9 DAGs, all 7 validation rules, and full champion/challenger logic are covered. |
| Architecture v1.0 | ADR decisions with escape hatches, 6 architecture layers with costs, React Native mobile architecture, security controls (OWASP), DPDP compliance, watermarking system, IP protection layers | Sections 0 (setup/accounts), 10 (deployment), 11 (monitoring) | Watermarking implementation (zero-width Unicode) is in PRD §7.2 --- confirm implementation in dag_watermark_audit.py (Task 6.7). |
| UI/UX Design v1.0 | Design tokens (DS object), Hindi typography (Noto Sans Devanagari), 4-tab mobile IA, 8-section web dashboard nav, WhatsApp message architecture, screen-by-screen specifications with all states and edge cases, WCAG 2.1 AA requirements | Covered in tasks.md Tasks 4.1--4.8 and 10.1--10.10 (UI components and mobile screens) | UIUX doc is complete. UI implementation is a separate front-end task --- not ML training. Reference this doc when building packages/ui/ components. |
| tasks.md | 19 task groups with 50+ subtasks, all referenced to PRD/TRD/Architecture/UIUX, TypeScript strict mode, offline-first constraints, i18n requirements, performance budgets, ES modules only, output format spec for every code file | Full cross-reference in Section 12 of this guide --- all tasks mapped to scripts and status | None --- all tasks accounted for. Task 18 (95% gate) confirmed as absolute blocker. |

> **One gap identified: The watermark decoding logic in dag_watermark_audit.py is referenced in TRD but the actual zero-width character decoder implementation is specified in PRD §7.2. When building Task 6.7, read PRD §7.2 carefully for the Python \'stegano\' library usage and the exact Unicode characters: U+200B, U+200C, U+200D, U+FEFF.**

# Section 14: Common Mistakes and How to Fix Them

Based on every agri-commodity ML project that has been reviewed, these are the most common failure points. Read this before you hit them.

| **Mistake** | **How to Spot It** | **How to Fix It** |
|----|----|----|
| Using random train/test split instead of time split | MAPE looks amazing (\<3%) during development but then the live model is way off (\>20%) | ALWAYS use sklearn TimeSeriesSplit. Never shuffle time series data. Rerun all cross-validation with proper time split. |
| Not using the 42-day feed lag correctly | SHAP shows feed_cost_ratio is not in top 5 features. LightGBM accuracy does not improve over ARIMA. | Verify: df\[\'maize_price_lag42\'\] = df\[\'maize_price\'\].shift(42). Check that shift is 42 TRADING days, not calendar days (account for weekends). |
| Missing UP-specific festivals in Prophet | MAPE is high during October--November (Diwali) and March--April (Holi/Eid) --- model systematically under-predicts demand spikes | Add all 8 festivals from Section 4.3 manually. Use Prophet\'s holidays dataframe, not just add_country_holidays(\'IN\') --- national holidays miss UP timing. |
| TFT running out of GPU memory | CUDA out of memory error during TFT training on AWS g4dn.xlarge | Reduce batch_size from 128 to 64. Reduce max_encoder_length from 90 to 60. If still failing, reduce hidden_size from 64 to 32. |
| ONNX quantisation degrading accuracy by \>1% | Quantised model MAPE is \>0.5% worse than full precision model | Switch from dynamic to static INT8 quantisation. Run: quantize_static() with a calibration dataset of 500+ samples. |
| Conformal coverage outside 78--82% range | Coverage check shows 55% (under-confident) or 95% (over-confident) | Recalibrate MAPIE on a larger calibration set (at least 200 samples, most recent). Check calibration set does not overlap training set. |
| AGMARKNET API returning stale data | All 5 mandis showing the exact same price for multiple days. Real prices should vary. | Check data.gov.in API status page. Increase API request retry count. Contact data.gov.in support --- the free tier key has request limits. |
| Airflow DAG failing silently | No Slack alerts, but Supabase predictions table has no new rows for today | Check Astronomer.io DAG runs --- click on the failed run to see the error log. Most common cause: Python package version mismatch. |
| Testing on data you used for training | Your MAPE reports look great but manual Gorakhpur mandi visits show model is way off | Enforce Rule 2 from PRD §6.5: the 6-month holdout must NEVER be touched until final certification. Use separate test sets. |
| Not doing the physical mandi visit | Skipping Week 15 manual validation to save time --- seems unnecessary | This is non-negotiable. PRD Rule 6 is explicit. The CTO signature on the validation report is required before any commercial activity. The mandi visit catches sensor drift that automated tests miss. |

# Section 15: Infrastructure Cost Breakdown --- Phase 0 {#section-15-infrastructure-cost-breakdown-phase-0}

Total Phase 0 infrastructure budget: ₹7,330/month --- as specified in TRD §1 and Architecture §1.1. Here is every rupee accounted for:

| **Layer** | **Service** | **Monthly Cost** | **What You Get** | **When It Becomes Paid** |
|----|----|----|----|----|
| L1: Data Ingestion | Astronomer.io Free Tier | ₹0 | 10 DAGs, 5 workers. Phase 0 uses 9 DAGs. | Month 3 if Phase 1 adds \>10 DAGs → self-host on Railway.app (₹750/mo) |
| L2: Data Store | Supabase Free Tier → Pro | ₹0 → ₹2,100 | 500MB storage, 50K MAU free. Pro at 500MB+. | When data exceeds 500MB (probably Month 2--3 with 3 years of price history) |
| L3: ML Training | Railway.app CPU + AWS Spot GPU | \~₹2,500/mo | CPU: ARIMA/Prophet/LightGBM. GPU: TFT (3 runs/month) | Cost stays flat --- only runs weekly |
| L4: ML Serving | Railway.app Hobby (1 vCPU always-on) | \~₹415/mo | Always-on FastAPI. \<200ms P95 inference. ONNX quantised. | No change needed until 10K+ requests/day |
| L5: Application | Vercel Edge + Expo EAS (both free tiers) | ₹0 | 100K requests/month. OTA mobile updates unlimited. | When API calls exceed 100K/month --- probably Month 6+ |
| L6: Comms + Security | Twilio WhatsApp + Cloudflare WAF + FingerprintJS Pro | \~₹2,400/mo | WhatsApp messages, DDoS protection, device fingerprinting | Scales with message volume. At 1,000 customers: \~₹9,600/mo |
| Total | Phase 0 (zero customers) | \~₹5,180--7,330/mo | Full production-grade stack before first rupee of revenue | Phase 1 target: infrastructure \<10% of MRR |

> At Phase 1 with 30 paying customers at ₹3,000/month average: MRR = ₹90,000. Infrastructure = ₹10,000--15,000 (11--17% of MRR). This is within acceptable SaaS unit economics.

# Quick Reference: The 16-Step Summary

If you need to explain what to do to a team member in 5 minutes, use this summary:

| **Step \#** | **What to Do** | **Platform** | **Time** | **Success Signal** |
|----|----|----|----|----|
| 1 | Create accounts: Supabase, Astronomer.io, Railway.app, AWS, data.gov.in, Kaggle, GitHub | Web browser | 1--2 days | All accounts active, API keys received |
| 2 | Set up monorepo with Turborepo, configure environment variables, connect GitHub to Railway.app | Terminal + VS Code | 1 day | pnpm build runs without errors |
| 3 | Download 3 years of historical AGMARKNET price data for 5 Gorakhpur area mandis | Python + data.gov.in API | 3--5 days | CSV with 95%+ completeness for all mandis |
| 4 | Download NECC egg prices, IMD weather, DAHDF disease alerts, NCDEX/MCX feed costs, Google Trends | Python scripts | 1 week | 6+ data sources in Supabase raw_prices table |
| 5 | Download Kaggle historical + FAO/USDA monthly reports for training bootstrap | Kaggle API + direct download | 2--3 hours | 3+ years of combined historical dataset |
| 6 | Set up Great Expectations, run 7 validation rules, fix any data quality issues | Python + great_expectations | 2--3 days | Checkpoint passes: \>95% completeness |
| 7 | Run feature engineering pipeline to create all 45 features, store as Parquet | Python + Airflow | 1 week | 45-column Parquet file, all features non-null \>95% |
| 8 | Train ARIMA baseline, train Prophet baseline, measure on 6-month time-split holdout | Python + statsmodels + prophet | 1 week | ARIMA MAPE \<18%, Directional \>65% |
| 9 | Train LightGBM with Optuna, run SHAP analysis, build ensemble v1 (ARIMA + LightGBM) | Python + lightgbm + optuna + shap | 2 weeks | LightGBM MAPE \<12%, Directional \>80% |
| 10 | Launch AWS Spot GPU, train TFT model, export to ONNX, quantise to INT8 | AWS EC2 g4dn.xlarge + pytorch-forecasting | 2 weeks | MAPE \<8%, Directional \>90%, Coverage 78--82% |
| 11 | Run 3 stress tests (2024 crash, HPAI alert, Diwali spike). All must pass direction. | Python backtesting scripts | 3--5 days | All 3 historical shocks predicted correctly |
| 12 | CTO/Data Head visit Gorakhpur mandis for 5 days, record actual prices, compare to model | Physical mandi visit | 1 week | 10-day manual validation: \>90% directional accuracy |
| 13 | Run final accuracy certification on 6-month holdout. Get CTO signature. | Python + docs/accuracy_validation_report.md | 2--3 days | MAPE \<6%, Directional \>95%, Coverage 78--82% --- all three simultaneously |
| 14 | Deploy FastAPI + ONNX to Railway.app, deploy 9 Airflow DAGs to Astronomer.io | Railway CLI + Astronomer.io | 3--4 hours | /v1/health returns {model_version, mape_30d, quantised: true} |
| 15 | Deploy Supabase schema, run migrations, configure Twilio WhatsApp Business API | Supabase dashboard + Twilio console | 1 day | Test WhatsApp message received successfully |
| 16 | ALL THREE gates cleared, manual validation signed off → NOW AND ONLY NOW onboard first customer | All systems | Milestone | No customer before this. This is the only rule that matters above all others. |

PoultryPulse AI --- ML Training Guide \| *Confidential \|* v1.0 · May 2026 \| *Based on PRD v3.0 + TRD v1.0 + Architecture v1.0 + UIUX v1.0 + tasks.md*
