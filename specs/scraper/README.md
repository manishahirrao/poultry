# PoultryPulse AI — Data Scrapers

Three scrapers that feed live data into your ML pipeline daily.

## Files

| File | What it does | Schedule |
|---|---|---|
| `scraper_01_agmarknet_commodities.py` | Maize + Soybean prices from agmarknet.gov.in | Daily 17:00 IST |
| `scraper_02_disease_news.py` | HPAI/disease alerts from DAHD + 6 news sources | Daily 08:00 + 20:00 IST |
| `scraper_03_mobile_app_desktop.py` | Prices + alerts from mobile apps on desktop emulator | Daily 07:00, 12:00, 18:00 IST |
| `supabase_setup.sql` | All required Supabase tables + helper views | Run once before first scrape |

## Quick Start

### Step 1 — Run Supabase SQL setup
Copy `supabase_setup.sql` → paste into Supabase SQL Editor → Run

### Step 2 — Set environment variables
```bash
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_KEY="your-anon-key"
```

### Step 3 — Install dependencies
```bash
pip install requests beautifulsoup4 supabase tenacity
# For scraper 03 (mobile app):
pip install pyautogui pillow pytesseract opencv-python
```

### Step 4 — Test each scraper (dry run)
```bash
python scraper_01_agmarknet_commodities.py --dry-run
python scraper_02_disease_news.py
python scraper_03_mobile_app_desktop.py --setup   # shows emulator setup guide
python scraper_03_mobile_app_desktop.py --dry-run
```

### Step 5 — Run for real
```bash
python scraper_01_agmarknet_commodities.py
python scraper_02_disease_news.py
python scraper_03_mobile_app_desktop.py
```

### Step 6 — Backfill historical data (Scraper 01 only)
```bash
# Backfill last 30 days of commodity prices
python scraper_01_agmarknet_commodities.py --backfill 30
```

## Training Guide Alignment

| Scraper | Training Guide Section | Feature Generated |
|---|---|---|
| 01 — Maize | §2.5, §4.1 Rank #1 | `feed_cost_ratio_lag42`, `maize_price_current` |
| 01 — Soybean | §2.5, §4.1 Rank #2 | `soy_price_lag42`, `soy_price_current` |
| 02 — Disease | §2.4, §4.2 | `hpai_district_flag`, `hpai_adjacent_district_flag` |
| 03 — Mobile App | §2.2 (NECC cross-check) | Cross-validation of AGMARKNET prices |

## Validation Rules (Training Guide §3.2)

All scrapers enforce these before saving to Supabase:

| Field | Rule | On Failure |
|---|---|---|
| `maize_price_per_quintal` | Rs 1,200 – Rs 4,000 | Reject row, log warning |
| `soy_price_per_quintal` | Rs 3,000 – Rs 8,000 | Reject row, log warning |
| `broiler_price_per_kg` | Rs 80 – Rs 250 | Reject row, log warning |
| `hpai_district_flag` | 0 or 1 only, never null | Default to 0 (safe) |
| Commodity price missing | Forward-fill max 5 days | Alert if gap > 5 days |
