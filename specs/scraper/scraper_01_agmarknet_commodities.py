"""
PoultryPulse AI — Scraper 01: AGMARKNET Commodity Prices
=========================================================
Scrapes daily Maize and Soybean prices from the filter/search table at
https://agmarknet.gov.in/home

Data goes to Supabase table: commodity_prices

Training Guide Reference:
  Section 2.5 — Source 5: NCDEX/MCX Feed Costs (Second Most Important)
  Feature: feed_cost_ratio_lag42 (#1 ranked feature), soy_price_lag42 (#2)

Validation Rules (Section 3.2 of Training Guide):
  maize_price_per_quintal  : Rs 1,200 — Rs 4,000
  soy_price_per_quintal    : Rs 3,000 — Rs 8,000 (Training Guide §4.2 soy_price_lag42)

Schedule: Run daily at 17:00 IST (after market close at 16:30)

How to run:
  pip install requests beautifulsoup4 selenium webdriver-manager supabase tenacity
  python scraper_01_agmarknet_commodities.py

How to schedule (Astronomer.io / cron):
  0 17 * * 1-6  python scraper_01_agmarknet_commodities.py
  (Monday-Saturday, markets are closed Sunday)
"""

import os
import time
import logging
import json
from datetime import datetime, timedelta
from typing import Optional, Dict, List
import requests
from bs4 import BeautifulSoup
from tenacity import retry, stop_after_attempt, wait_exponential
from supabase import create_client, Client

# ── Logging ────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ── Configuration ─────────────────────────────────────────────────────────
SUPABASE_URL = os.environ.get('SUPABASE_URL', 'https://YOUR_PROJECT.supabase.co')
SUPABASE_KEY = os.environ.get('SUPABASE_KEY', 'YOUR_ANON_KEY')

# AGMARKNET base URL and search endpoint
AGMARKNET_BASE   = 'https://agmarknet.gov.in'
AGMARKNET_SEARCH = 'https://agmarknet.gov.in/SearchCmmMkt.aspx'

# Commodities to track (AGMARKNET names — exact match required)
COMMODITIES = {
    'Maize': {
        'agmarknet_name'    : 'Maize',
        'supabase_column'   : 'maize_price_per_quintal',
        'unit'              : 'quintal',
        'valid_min'         : 1200.0,
        'valid_max'         : 4000.0,
        'states'            : ['Uttar Pradesh', 'Punjab', 'Andhra Pradesh'],
    },
    'Soyabean': {
        'agmarknet_name'    : 'Soyabean(Yellow)',
        'supabase_column'   : 'soy_price_per_quintal',
        'unit'              : 'quintal',
        'valid_min'         : 3000.0,
        'valid_max'         : 8000.0,
        'states'            : ['Madhya Pradesh', 'Maharashtra', 'Rajasthan'],
    },
}

# Request headers — polite browser identification
HEADERS = {
    'User-Agent': (
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
        'AppleWebKit/537.36 (KHTML, like Gecko) '
        'Chrome/120.0.0.0 Safari/537.36'
    ),
    'Accept'         : 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-IN,en;q=0.9,hi;q=0.8',
    'Referer'        : AGMARKNET_BASE,
}

# Delay between requests — be polite to government servers
REQUEST_DELAY_SECONDS = 3


# ── Data Validation (Training Guide §3.2) ─────────────────────────────────

def validate_price(commodity_key: str, price: float) -> bool:
    """
    Validates commodity price against Training Guide Section 3.2 rules.
    Returns True if valid, False if should be rejected.
    """
    cfg = COMMODITIES[commodity_key]
    if price < cfg['valid_min'] or price > cfg['valid_max']:
        logger.warning(
            f"VALIDATION FAIL: {commodity_key} price Rs {price}/quintal "
            f"outside range [{cfg['valid_min']}, {cfg['valid_max']}]. Rejecting."
        )
        return False
    return True


def validate_date(date_str: str) -> bool:
    """Date must not be in the future and not older than 3 days (Training Guide §3.2)."""
    try:
        record_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        today       = datetime.now().date()
        delta       = (today - record_date).days
        if delta < 0:
            logger.warning(f"VALIDATION FAIL: Date {date_str} is in the future. Rejecting.")
            return False
        if delta > 3:
            logger.warning(f"VALIDATION WARN: Date {date_str} is {delta} days old — stale data.")
        return True
    except ValueError:
        logger.error(f"VALIDATION FAIL: Could not parse date '{date_str}'")
        return False


# ── AGMARKNET Scraper ──────────────────────────────────────────────────────

class AGMARKNETCommodityScraper:
    """
    Scrapes the AGMARKNET price filter table for maize and soybean.

    AGMARKNET uses ASP.NET WebForms with ViewState — a standard session-based
    form submission pattern. We:
      1. GET the search page to collect ViewState tokens
      2. POST the search form with commodity + state filters
      3. Parse the HTML results table
      4. Validate and store to Supabase

    Note: AGMARKNET publishes end-of-day modal (most common) prices.
    We use modal_price as it represents actual trade price.
    """

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update(HEADERS)

    def _get_viewstate(self) -> Dict[str, str]:
        """
        Fetch the search page and extract ASP.NET form tokens.
        Required for all subsequent POST requests.
        """
        resp = self.session.get(AGMARKNET_SEARCH, timeout=20)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, 'html.parser')

        tokens = {}
        for field in ['__VIEWSTATE', '__VIEWSTATEGENERATOR', '__EVENTVALIDATION']:
            tag = soup.find('input', {'id': field})
            if tag:
                tokens[field] = tag.get('value', '')

        logger.info(f"ViewState tokens fetched: {list(tokens.keys())}")
        return tokens

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(min=2, max=15))
    def fetch_commodity_prices(
        self,
        commodity_key: str,
        target_date: datetime.date = None
    ) -> List[Dict]:
        """
        Search AGMARKNET for a commodity's daily prices.
        Returns list of price records for the target date.
        """
        if target_date is None:
            target_date = datetime.now().date()

        cfg           = COMMODITIES[commodity_key]
        date_str      = target_date.strftime('%d-%b-%Y')  # AGMARKNET format: 25-May-2026
        results       = []

        logger.info(f"Fetching {commodity_key} prices for {date_str} ...")
        tokens = self._get_viewstate()
        time.sleep(REQUEST_DELAY_SECONDS)

        # Build the POST form data — matches AGMARKNET search form fields
        form_data = {
            '__EVENTTARGET'         : '',
            '__EVENTARGUMENT'       : '',
            '__VIEWSTATE'           : tokens.get('__VIEWSTATE', ''),
            '__VIEWSTATEGENERATOR'  : tokens.get('__VIEWSTATEGENERATOR', ''),
            '__EVENTVALIDATION'     : tokens.get('__EVENTVALIDATION', ''),
            'ddlCommodity'          : cfg['agmarknet_name'],
            'ddlState'              : '0',  # All states
            'ddlDistrict'           : '0',
            'ddlMarket'             : '0',
            'txtDate'               : date_str,
            'btnGo'                 : 'Go',
            'cboArrivedOrReported'  : 'A',
            'ddlGrade'              : 'F',
        }

        resp = self.session.post(AGMARKNET_SEARCH, data=form_data, timeout=30)
        resp.raise_for_status()
        time.sleep(REQUEST_DELAY_SECONDS)

        soup = BeautifulSoup(resp.text, 'html.parser')

        # Find the results table — AGMARKNET uses class 'tableagmark_new'
        table = soup.find('table', {'class': 'tableagmark_new'})
        if not table:
            # Also try finding by ID pattern
            table = soup.find('table', {'id': lambda x: x and 'grid' in x.lower()})

        if not table:
            logger.warning(f"No results table found for {commodity_key} on {date_str}")
            return []

        rows = table.find_all('tr')
        if len(rows) < 2:
            logger.info(f"No data rows for {commodity_key} on {date_str} (market closed?)")
            return []

        # Parse header row to find column indices
        headers_row = rows[0].find_all(['th', 'td'])
        headers     = [h.get_text(strip=True).lower() for h in headers_row]

        # Map column names — AGMARKNET table has these columns
        col_map = {
            'state'   : next((i for i, h in enumerate(headers) if 'state'    in h), 0),
            'district': next((i for i, h in enumerate(headers) if 'district' in h), 1),
            'market'  : next((i for i, h in enumerate(headers) if 'market'   in h), 2),
            'variety' : next((i for i, h in enumerate(headers) if 'variety'  in h), 3),
            'min'     : next((i for i, h in enumerate(headers) if 'min'      in h), 4),
            'max'     : next((i for i, h in enumerate(headers) if 'max'      in h), 5),
            'modal'   : next((i for i, h in enumerate(headers) if 'modal'    in h), 6),
            'arrivals': next((i for i, h in enumerate(headers) if 'arrival'  in h), 7),
        }

        # Parse data rows
        for row in rows[1:]:
            cols = row.find_all('td')
            if not cols or len(cols) < 6:
                continue

            def cell(idx):
                try:
                    return cols[idx].get_text(strip=True).replace(',', '')
                except IndexError:
                    return ''

            try:
                modal_price = float(cell(col_map['modal']))
            except (ValueError, TypeError):
                continue

            # Validate price
            if not validate_price(commodity_key, modal_price):
                continue

            record = {
                'date'          : target_date.isoformat(),
                'commodity'     : commodity_key,
                'state'         : cell(col_map['state']),
                'district'      : cell(col_map['district']),
                'market'        : cell(col_map['market']),
                'variety'       : cell(col_map['variety']),
                'min_price'     : self._parse_float(cell(col_map['min'])),
                'max_price'     : self._parse_float(cell(col_map['max'])),
                'modal_price'   : modal_price,
                'arrivals_tonnes': self._parse_float(cell(col_map['arrivals'])),
                'unit'          : cfg['unit'],
                'source'        : 'agmarknet_scrape',
                'scraped_at'    : datetime.now().isoformat(),
            }
            results.append(record)

        logger.info(f"Fetched {len(results)} {commodity_key} records for {date_str}")
        return results

    def _parse_float(self, value: str) -> Optional[float]:
        try:
            return float(value.replace(',', '').strip()) if value else None
        except (ValueError, TypeError):
            return None

    def compute_national_modal(
        self, records: List[Dict], commodity_key: str
    ) -> Optional[Dict]:
        """
        Compute a single national modal price from all-India records.
        Uses arrivals-weighted average for major producing states.
        This is what goes into the 45-feature vector (feed_cost_ratio_lag42).

        Training Guide §4.1: Use the 42-day lagged national modal price.
        """
        cfg             = COMMODITIES[commodity_key]
        priority_states = cfg['states']

        # Filter to priority states first
        priority = [r for r in records if r['state'] in priority_states]
        pool      = priority if priority else records

        if not pool:
            return None

        # Arrivals-weighted modal price
        total_arrivals = sum(r['arrivals_tonnes'] or 0 for r in pool)
        if total_arrivals > 0:
            weighted_price = sum(
                r['modal_price'] * (r['arrivals_tonnes'] or 0) for r in pool
            ) / total_arrivals
        else:
            # Simple mean if no arrivals data
            weighted_price = sum(r['modal_price'] for r in pool) / len(pool)

        return {
            'date'              : pool[0]['date'],
            'commodity'         : commodity_key,
            'national_modal'    : round(weighted_price, 2),
            'sample_size'       : len(pool),
            'total_arrivals'    : total_arrivals,
            'priority_states'   : priority_states,
            'source'            : 'agmarknet_weighted',
            'computed_at'       : datetime.now().isoformat(),
        }


# ── Supabase Storage ──────────────────────────────────────────────────────

class SupabaseCommodityWriter:
    """
    Writes scraped commodity prices to Supabase.

    Required Supabase tables (run in SQL Editor before first use):

    CREATE TABLE IF NOT EXISTS commodity_prices (
        id                  BIGSERIAL PRIMARY KEY,
        date                DATE NOT NULL,
        commodity           TEXT NOT NULL,
        state               TEXT,
        district            TEXT,
        market              TEXT,
        variety             TEXT,
        min_price           NUMERIC(10,2),
        max_price           NUMERIC(10,2),
        modal_price         NUMERIC(10,2) NOT NULL,
        arrivals_tonnes     NUMERIC(12,2),
        unit                TEXT DEFAULT 'quintal',
        source              TEXT,
        scraped_at          TIMESTAMPTZ,
        created_at          TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(date, commodity, state, market)
    );

    CREATE TABLE IF NOT EXISTS commodity_national_modal (
        id                  BIGSERIAL PRIMARY KEY,
        date                DATE NOT NULL,
        commodity           TEXT NOT NULL,
        national_modal      NUMERIC(10,2) NOT NULL,
        sample_size         INTEGER,
        total_arrivals      NUMERIC(14,2),
        source              TEXT,
        computed_at         TIMESTAMPTZ,
        created_at          TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(date, commodity)
    );
    """

    def __init__(self):
        if 'YOUR_' in SUPABASE_URL or 'YOUR_' in SUPABASE_KEY:
            logger.warning("Supabase credentials not set — running in DRY RUN mode")
            self.client = None
        else:
            self.client = create_client(SUPABASE_URL, SUPABASE_KEY)
            logger.info("Supabase client connected")

    def save_prices(self, records: List[Dict]) -> int:
        """Upsert price records. Returns number of records saved."""
        if not records:
            return 0
        if self.client is None:
            logger.info(f"DRY RUN: Would save {len(records)} records")
            for r in records[:3]:
                logger.info(f"  Sample: {r}")
            return 0

        resp = (
            self.client.table('commodity_prices')
            .upsert(records, on_conflict='date,commodity,state,market')
            .execute()
        )
        saved = len(resp.data) if resp.data else 0
        logger.info(f"Saved {saved} commodity price records to Supabase")
        return saved

    def save_national_modal(self, modal: Dict) -> bool:
        """Save the computed national modal price."""
        if self.client is None:
            logger.info(f"DRY RUN: National modal = {modal}")
            return True

        resp = (
            self.client.table('commodity_national_modal')
            .upsert(modal, on_conflict='date,commodity')
            .execute()
        )
        return bool(resp.data)

    def get_last_recorded_date(self, commodity: str) -> Optional[str]:
        """Check last date stored — used for gap detection."""
        if self.client is None:
            return None
        try:
            resp = (
                self.client.table('commodity_national_modal')
                .select('date')
                .eq('commodity', commodity)
                .order('date', desc=True)
                .limit(1)
                .execute()
            )
            return resp.data[0]['date'] if resp.data else None
        except Exception as e:
            logger.warning(f"Could not fetch last date: {e}")
            return None


# ── Missing Data Handler (Training Guide §3.3) ────────────────────────────

def handle_missing_data(
    writer: SupabaseCommodityWriter,
    commodity: str,
    target_date
) -> Optional[Dict]:
    """
    Training Guide §3.3: If price missing, interpolate from last known value.
    Max 5 days interpolation for commodity prices.
    """
    logger.warning(
        f"No data for {commodity} on {target_date} — "
        f"attempting forward-fill from last known price (max 5 days)"
    )
    if writer.client is None:
        return None

    try:
        cutoff = (target_date - timedelta(days=6)).isoformat()
        resp = (
            writer.client.table('commodity_national_modal')
            .select('date, national_modal')
            .eq('commodity', commodity)
            .gte('date', cutoff)
            .order('date', desc=True)
            .limit(1)
            .execute()
        )
        if not resp.data:
            logger.error(f"No recent data to forward-fill for {commodity}")
            return None

        last_record = resp.data[0]
        last_date   = datetime.strptime(last_record['date'], '%Y-%m-%d').date()
        gap_days    = (target_date - last_date).days

        if gap_days > 5:
            logger.error(
                f"Gap of {gap_days} days for {commodity} — "
                f"exceeds 5-day interpolation limit. Manual investigation required."
            )
            return None

        filled = {
            'date'           : target_date.isoformat(),
            'commodity'      : commodity,
            'national_modal' : last_record['national_modal'],
            'sample_size'    : 0,
            'total_arrivals' : 0,
            'source'         : f'forward_filled_from_{last_record["date"]}',
            'computed_at'    : datetime.now().isoformat(),
        }
        logger.info(
            f"Forward-filled {commodity}: Rs {filled['national_modal']}/quintal "
            f"from {last_record['date']} (gap: {gap_days} days)"
        )
        return filled

    except Exception as e:
        logger.error(f"Forward-fill failed for {commodity}: {e}")
        return None


# ── Main Orchestration ────────────────────────────────────────────────────

def run_scraper(target_date=None, backfill_days=0):
    """
    Main entry point.

    Args:
        target_date  : date to scrape (default: today)
        backfill_days: number of past days to also scrape (for initial setup)
    """
    if target_date is None:
        target_date = datetime.now().date()

    scraper = AGMARKNETCommodityScraper()
    writer  = SupabaseCommodityWriter()

    # Build list of dates to process
    dates = [target_date - timedelta(days=i) for i in range(backfill_days + 1)]
    dates.reverse()  # oldest first

    summary = {'dates_processed': 0, 'records_saved': 0, 'errors': []}

    for process_date in dates:
        # Skip Sundays — markets closed
        if process_date.weekday() == 6:
            logger.info(f"Skipping {process_date} (Sunday — market closed)")
            continue

        logger.info(f"\n{'='*60}\nProcessing date: {process_date}\n{'='*60}")

        for commodity_key in COMMODITIES:
            try:
                records = scraper.fetch_commodity_prices(commodity_key, process_date)

                if records:
                    # Save all individual market records
                    writer.save_prices(records)

                    # Compute and save national modal
                    national = scraper.compute_national_modal(records, commodity_key)
                    if national:
                        writer.save_national_modal(national)
                        logger.info(
                            f"National modal {commodity_key} on {process_date}: "
                            f"Rs {national['national_modal']}/quintal "
                            f"(n={national['sample_size']})"
                        )
                        summary['records_saved'] += len(records)
                else:
                    # Apply forward-fill if no data
                    filled = handle_missing_data(writer, commodity_key, process_date)
                    if filled:
                        writer.save_national_modal(filled)

            except Exception as e:
                error_msg = f"{commodity_key} on {process_date}: {e}"
                logger.error(f"Error fetching {error_msg}")
                summary['errors'].append(error_msg)

            # Polite delay between commodity requests
            time.sleep(REQUEST_DELAY_SECONDS)

        summary['dates_processed'] += 1

    logger.info(f"\n{'='*60}\nSCRAPER SUMMARY\n{'='*60}")
    logger.info(f"Dates processed : {summary['dates_processed']}")
    logger.info(f"Records saved   : {summary['records_saved']}")
    logger.info(f"Errors          : {len(summary['errors'])}")
    for err in summary['errors']:
        logger.error(f"  ERROR: {err}")

    return summary


if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(description='AGMARKNET Commodity Price Scraper')
    parser.add_argument('--date',     type=str,  default=None,
                        help='Target date YYYY-MM-DD (default: today)')
    parser.add_argument('--backfill', type=int,  default=0,
                        help='Number of past days to backfill (default: 0)')
    parser.add_argument('--dry-run',  action='store_true',
                        help='Print results without saving to Supabase')
    args = parser.parse_args()

    if args.dry_run:
        SUPABASE_URL = 'YOUR_DRY_RUN'
        SUPABASE_KEY = 'YOUR_DRY_RUN'

    target = datetime.strptime(args.date, '%Y-%m-%d').date() if args.date else None
    run_scraper(target_date=target, backfill_days=args.backfill)
