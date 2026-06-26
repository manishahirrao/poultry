"""
PoultryPulse AI — Scraper 02: Poultry Disease Outbreak News
=============================================================
Scrapes daily disease alerts and news from:
  1. DAHD (dahd.gov.in)          — official government disease bulletins (PDF + HTML)
  2. Hindustan Times             — Hindi/English poultry disease news
  3. The Hindu                   — credible national coverage
  4. Times of India              — national news
  5. Indian Express              — national news
  6. Deccan Herald               — south India (AP/Telangana poultry belt)
  7. Krishi Jagran               — agriculture-specific news (Hindi)

Data goes to Supabase table: disease_alerts

Training Guide Reference:
  Section 2.4 — Source 4: DAHDF Disease Alerts (HPAI)
  Section 4.2 — Feature: hpai_district_flag (#10), hpai_adjacent_district_flag
  Section 3.2 — Validation: hpai_district_flag must be 0 or 1. Default 0 on parse failure.

Critical Note from Training Guide §2.4:
  "A single HPAI alert within 200km of Gorakhpur can crash broiler prices
   by Rs 15-30/kg within 48 hours."

Schedule: Run daily at 08:00 IST and 20:00 IST (news cycle peaks)

How to run:
  pip install requests beautifulsoup4 supabase tenacity newspaper3k geopy
  python scraper_02_disease_news.py

How to schedule:
  0 8,20 * * *  python scraper_02_disease_news.py
"""

import os
import re
import time
import logging
import hashlib
import json
from datetime import datetime, timedelta, date
from typing import Optional, Dict, List, Tuple
from pathlib import Path

import requests
from bs4 import BeautifulSoup
from tenacity import retry, stop_after_attempt, wait_exponential
from supabase import create_client, Client

# ── Logging ───────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ── Configuration ─────────────────────────────────────────────────────────
SUPABASE_URL = os.environ.get('SUPABASE_URL', 'https://YOUR_PROJECT.supabase.co')
SUPABASE_KEY = os.environ.get('SUPABASE_KEY', 'YOUR_ANON_KEY')

# Gorakhpur coordinates for distance calculation
GORAKHPUR_LAT = 26.7606
GORAKHPUR_LON = 83.3732
ALERT_RADIUS_KM = 200  # Training Guide §2.4: flag if within 200km

# Request headers
HEADERS = {
    'User-Agent': (
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
        'AppleWebKit/537.36 (KHTML, like Gecko) '
        'Chrome/120.0.0.0 Safari/537.36'
    ),
    'Accept'         : 'text/html,application/xhtml+xml,*/*;q=0.8',
    'Accept-Language': 'en-IN,en;q=0.9,hi;q=0.8',
}

REQUEST_DELAY = 4  # seconds between requests — polite crawling

# ── Disease Keywords ──────────────────────────────────────────────────────
# English keywords
DISEASE_KEYWORDS_EN = [
    'bird flu', 'avian influenza', 'HPAI', 'H5N1', 'H5N8', 'H9N2',
    'Newcastle disease', 'poultry disease', 'chicken disease',
    'poultry outbreak', 'broiler disease', 'layer disease',
    'culling poultry', 'poultry cull', 'poultry death',
    'avian disease', 'salmonella poultry', 'Marek disease',
    'infectious bronchitis', 'poultry ban', 'poultry alert',
]

# Hindi keywords (transliterated + Devanagari)
DISEASE_KEYWORDS_HI = [
    'बर्ड फ्लू', 'एवियन इन्फ्लूएंजा', 'मुर्गी की बीमारी',
    'पोल्ट्री रोग', 'मुर्गे की मौत', 'पक्षी रोग',
    'मुर्गी फार्म बंद', 'मुर्गी प्रतिबंध',
    'bird flu', 'murgi rog', 'poulti rog',
]

ALL_KEYWORDS = DISEASE_KEYWORDS_EN + DISEASE_KEYWORDS_HI

# Disease type classification
DISEASE_PATTERNS = {
    'HPAI': ['bird flu', 'avian influenza', 'hpai', 'h5n1', 'h5n8',
             'बर्ड फ्लू', 'एवियन इन्फ्लूएंजा'],
    'Newcastle': ['newcastle', 'ranikheta'],
    'Salmonella': ['salmonella'],
    'IBD': ['gumboro', 'infectious bursal'],
    'IB': ['infectious bronchitis'],
    'Marek': ["marek"],
    'General': [],  # fallback
}

# Indian states with coordinates (for distance calculation)
STATE_CENTERS = {
    'Uttar Pradesh'      : (26.8467, 80.9462),
    'Bihar'              : (25.0961, 85.3131),
    'Madhya Pradesh'     : (22.9734, 78.6569),
    'Jharkhand'          : (23.6102, 85.2799),
    'Uttarakhand'        : (30.0668, 79.0193),
    'West Bengal'        : (22.9868, 87.8550),
    'Andhra Pradesh'     : (15.9129, 79.7400),
    'Telangana'          : (18.1124, 79.0193),
    'Maharashtra'        : (19.7515, 75.7139),
    'Punjab'             : (31.1471, 75.3412),
    'Haryana'            : (29.0588, 76.0856),
    'Rajasthan'          : (27.0238, 74.2179),
    'Gujarat'            : (22.2587, 71.1924),
    'Karnataka'          : (15.3173, 75.7139),
    'Tamil Nadu'         : (11.1271, 78.6569),
    'Kerala'             : (10.8505, 76.2711),
    'Odisha'             : (20.9517, 85.0985),
    'Chhattisgarh'       : (21.2787, 81.8661),
    'Assam'              : (26.2006, 92.9376),
    'Himachal Pradesh'   : (31.1048, 77.1734),
    'Delhi'              : (28.7041, 77.1025),
}


# ── Distance Calculator ───────────────────────────────────────────────────

def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance in km between two lat/lon points."""
    import math
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat/2)**2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon/2)**2)
    return R * 2 * math.asin(math.sqrt(a))


def classify_distance_from_gorakhpur(state: str, district: str = None) -> Tuple[float, str]:
    """
    Estimate distance from Gorakhpur for a state/district.
    Returns (distance_km, proximity_label).
    """
    # UP districts close to Gorakhpur (within 100km)
    up_close_districts = [
        'gorakhpur', 'deoria', 'basti', 'kushinagar', 'maharajganj',
        'sant kabir nagar', 'siddharthnagar', 'azamgarh', 'mau'
    ]

    if district:
        dist_lower = district.lower()
        if 'gorakhpur' in dist_lower:
            return 0.0, 'district_itself'
        if any(d in dist_lower for d in up_close_districts):
            return 80.0, 'within_100km'

    coords = STATE_CENTERS.get(state)
    if coords:
        dist = haversine_km(GORAKHPUR_LAT, GORAKHPUR_LON, coords[0], coords[1])
        label = 'within_200km' if dist <= 200 else 'adjacent_state' if dist <= 400 else 'distant'
        return dist, label

    return 999.0, 'unknown'


def classify_disease(text: str) -> str:
    """Identify disease type from article text."""
    text_lower = text.lower()
    for disease, keywords in DISEASE_PATTERNS.items():
        if disease == 'General':
            continue
        if any(kw.lower() in text_lower for kw in keywords):
            return disease
    return 'General'


def compute_hpai_flag(distance_km: float, disease_type: str) -> int:
    """
    Training Guide §3.2:
    hpai_district_flag = 1 if HPAI alert within 200km of Gorakhpur in last 14 days.
    Default to 0 on any uncertainty (conservative — no false panic).
    """
    if disease_type == 'HPAI' and distance_km <= ALERT_RADIUS_KM:
        return 1
    return 0


def compute_adjacent_flag(distance_km: float, disease_type: str) -> int:
    """hpai_adjacent_district_flag = 1 if HPAI within 200-400km."""
    if disease_type == 'HPAI' and 200 < distance_km <= 400:
        return 1
    return 0


# ── Source 1: DAHD Official Bulletins ────────────────────────────────────

class DAHDScraper:
    """
    Scrapes the official disease bulletins from dahd.gov.in.
    Both the main English site and the Hindi site (dahd.gov.in/hi).

    DAHD publishes:
    1. Weekly disease situation report (PDF — Monday)
    2. State-wise disease alerts (HTML table — updated as events occur)
    3. Bird Flu situation map (HTML)
    """

    BASE_URL     = 'https://dahd.gov.in'
    DISEASE_PAGE = 'https://dahd.gov.in/en/disease-surveillance'
    HINDI_PAGE   = 'https://dahd.gov.in/hi'
    ALERTS_PAGE  = 'https://dahd.gov.in/en/about-us/divisions/animal-husbandry/animal-health/disease-control'

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update(HEADERS)

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(min=3, max=20))
    def fetch_disease_alerts(self) -> List[Dict]:
        """
        Fetch current disease alerts from the DAHD disease surveillance page.
        Parses both the alert table and any downloadable bulletins listed.
        """
        alerts = []
        today  = date.today().isoformat()

        # ── Fetch disease surveillance page ───────────────────────────────
        try:
            resp = self.session.get(self.DISEASE_PAGE, timeout=25)
            resp.raise_for_status()
            soup = BeautifulSoup(resp.text, 'html.parser')

            # Look for tables with state/district/disease data
            tables = soup.find_all('table')
            for table in tables:
                rows = table.find_all('tr')
                if len(rows) < 2:
                    continue

                headers = [th.get_text(strip=True).lower()
                           for th in rows[0].find_all(['th', 'td'])]

                # Only process tables that look like disease tables
                if not any(kw in ' '.join(headers) for kw in
                           ['disease', 'state', 'district', 'species']):
                    continue

                for row in rows[1:]:
                    cols = [td.get_text(strip=True) for td in row.find_all('td')]
                    if not cols or len(cols) < 3:
                        continue

                    raw_text = ' '.join(cols)
                    if not any(kw.lower() in raw_text.lower() for kw in
                               DISEASE_KEYWORDS_EN):
                        continue

                    # Try to extract state and district
                    state    = cols[0] if len(cols) > 0 else 'Unknown'
                    district = cols[1] if len(cols) > 1 else None
                    disease  = classify_disease(raw_text)
                    dist_km, proximity = classify_distance_from_gorakhpur(
                        state, district)

                    alert = self._build_alert(
                        source='dahd_surveillance_table',
                        title=f"Disease Alert: {disease} in {district or state}",
                        description=raw_text[:500],
                        state=state,
                        district=district,
                        disease_type=disease,
                        distance_km=dist_km,
                        proximity=proximity,
                        date_str=today,
                        url=self.DISEASE_PAGE,
                    )
                    alerts.append(alert)

        except Exception as e:
            logger.warning(f"DAHD surveillance page error: {e}")

        time.sleep(REQUEST_DELAY)

        # ── Fetch Hindi page for additional coverage ───────────────────────
        try:
            resp = self.session.get(self.HINDI_PAGE, timeout=25)
            soup = BeautifulSoup(resp.text, 'html.parser')

            # Look for news blocks / alerts with disease keywords
            news_blocks = soup.find_all(['div', 'li', 'p'],
                                        string=lambda t: t and any(
                                            kw in t for kw in DISEASE_KEYWORDS_HI))
            for block in news_blocks[:10]:
                text = block.get_text(strip=True)
                if len(text) < 20:
                    continue
                alert = self._build_alert(
                    source='dahd_hindi',
                    title=text[:120],
                    description=text[:500],
                    state='Unknown',
                    district=None,
                    disease_type=classify_disease(text),
                    distance_km=999.0,
                    proximity='unknown',
                    date_str=today,
                    url=self.HINDI_PAGE,
                )
                alerts.append(alert)

        except Exception as e:
            logger.warning(f"DAHD Hindi page error: {e}")

        # ── Look for PDF bulletin links ────────────────────────────────────
        try:
            resp = self.session.get(self.ALERTS_PAGE, timeout=25)
            soup = BeautifulSoup(resp.text, 'html.parser')
            pdf_links = soup.find_all('a', href=lambda h: h and h.endswith('.pdf'))

            for link in pdf_links[:5]:
                href  = link.get('href', '')
                title = link.get_text(strip=True)
                if any(kw.lower() in title.lower() for kw in
                       ['disease', 'bulletin', 'alert', 'hpai', 'bird flu']):
                    full_url = href if href.startswith('http') else self.BASE_URL + href
                    logger.info(f"Found DAHD bulletin PDF: {title} — {full_url}")
                    alerts.append(self._build_alert(
                        source='dahd_pdf_bulletin',
                        title=title,
                        description=f'PDF bulletin available at: {full_url}',
                        state='All India',
                        district=None,
                        disease_type=classify_disease(title),
                        distance_km=999.0,
                        proximity='national',
                        date_str=today,
                        url=full_url,
                    ))
        except Exception as e:
            logger.warning(f"DAHD PDF link fetch error: {e}")

        logger.info(f"DAHD: Found {len(alerts)} alerts")
        return alerts

    def _build_alert(self, **kwargs) -> Dict:
        text_for_hash = f"{kwargs.get('url','')}{kwargs.get('title','')}{kwargs.get('date_str','')}"
        return {
            'id'                        : hashlib.md5(text_for_hash.encode()).hexdigest(),
            'date'                      : kwargs.get('date_str'),
            'source'                    : kwargs.get('source'),
            'title'                     : kwargs.get('title', '')[:300],
            'description'               : kwargs.get('description', '')[:1000],
            'state'                     : kwargs.get('state'),
            'district'                  : kwargs.get('district'),
            'disease_type'              : kwargs.get('disease_type', 'General'),
            'distance_from_gorakhpur_km': kwargs.get('distance_km', 999.0),
            'proximity_label'           : kwargs.get('proximity', 'unknown'),
            'hpai_district_flag'        : compute_hpai_flag(
                kwargs.get('distance_km', 999.0), kwargs.get('disease_type', 'General')),
            'hpai_adjacent_flag'        : compute_adjacent_flag(
                kwargs.get('distance_km', 999.0), kwargs.get('disease_type', 'General')),
            'source_url'                : kwargs.get('url', '')[:500],
            'scraped_at'                : datetime.now().isoformat(),
        }


# ── Source 2-7: News Scrapers ─────────────────────────────────────────────

class NewsScraper:
    """
    Scrapes poultry disease news from credible Indian news outlets.
    Searches each outlet's search/tag page for disease-related articles.
    """

    # Search URLs for each news source — using their internal search
    NEWS_SOURCES = {
        'hindustan_times': {
            'search_url' : 'https://www.hindustantimes.com/search?q={query}&start=0',
            'article_sel': 'div.cartHolder, article.media-body, div.storyDetail',
            'title_sel'  : 'h3, h2, .hdg3',
            'link_sel'   : 'a',
            'date_sel'   : 'span.dateTime, time',
            'language'   : 'en',
        },
        'the_hindu': {
            'search_url' : 'https://www.thehindu.com/search/?q={query}',
            'article_sel': 'div.article-section, li.element, div.search-result-item',
            'title_sel'  : 'h3, h2, .title',
            'link_sel'   : 'a',
            'date_sel'   : 'span.dateline, time',
            'language'   : 'en',
        },
        'times_of_india': {
            'search_url' : 'https://timesofindia.indiatimes.com/topic/{query}',
            'article_sel': 'div.uwU81, li.vQLyze, div.row.gutter-16',
            'title_sel'  : 'span, h2, h3',
            'link_sel'   : 'a',
            'date_sel'   : 'span.byline, time, .timeStamp',
            'language'   : 'en',
        },
        'indian_express': {
            'search_url' : 'https://indianexpress.com/?s={query}',
            'article_sel': 'div.articles, article, div.nation',
            'title_sel'  : 'h2, h3, .title',
            'link_sel'   : 'a',
            'date_sel'   : 'time, .date',
            'language'   : 'en',
        },
        'deccan_herald': {
            'search_url' : 'https://www.deccanherald.com/search?q={query}',
            'article_sel': 'div.story-card, article, div.listing-item',
            'title_sel'  : 'h2, h3, .card-title',
            'link_sel'   : 'a',
            'date_sel'   : 'time, span.time',
            'language'   : 'en',
        },
        'krishi_jagran': {
            'search_url' : 'https://krishijagran.com/?s={query}',
            'article_sel': 'article, div.post-item, div.jeg_post',
            'title_sel'  : 'h2, h3, .entry-title',
            'link_sel'   : 'a',
            'date_sel'   : 'time, span.date, .jeg_meta_date',
            'language'   : 'hi_en',
        },
        'agrostar_news': {
            'search_url' : 'https://www.agrostar.in/blog/search?q={query}',
            'article_sel': 'article, div.blog-post, div.post-card',
            'title_sel'  : 'h2, h3',
            'link_sel'   : 'a',
            'date_sel'   : 'time, span.date',
            'language'   : 'hi_en',
        },
    }

    # Search queries to use
    SEARCH_QUERIES = [
        'bird flu India',
        'avian influenza outbreak',
        'poultry disease alert',
        'HPAI India state',
        'broiler chicken disease India',
    ]

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update(HEADERS)

    @retry(stop=stop_after_attempt(2), wait=wait_exponential(min=3, max=15))
    def _fetch_page(self, url: str) -> Optional[BeautifulSoup]:
        try:
            resp = self.session.get(url, timeout=20)
            resp.raise_for_status()
            return BeautifulSoup(resp.text, 'html.parser')
        except Exception as e:
            logger.warning(f"Failed to fetch {url}: {e}")
            return None

    def scrape_source(self, source_key: str) -> List[Dict]:
        """Scrape one news source for disease-related articles."""
        cfg     = self.NEWS_SOURCES[source_key]
        results = []
        seen_urls = set()

        for query in self.SEARCH_QUERIES[:3]:  # Limit queries per source
            safe_query = query.replace(' ', '+')
            url        = cfg['search_url'].format(query=safe_query)
            soup       = self._fetch_page(url)
            if not soup:
                continue

            articles = soup.select(cfg['article_sel'])
            logger.info(f"  {source_key}: query='{query}' found {len(articles)} elements")

            for article in articles[:15]:  # Max 15 articles per query
                # Extract title
                title_tag = article.select_one(cfg['title_sel'])
                if not title_tag:
                    continue
                title = title_tag.get_text(strip=True)

                # Check relevance — must contain a disease keyword
                if not any(kw.lower() in title.lower() for kw in ALL_KEYWORDS):
                    continue

                # Extract URL
                link_tag = article.select_one(cfg['link_sel'])
                art_url  = link_tag.get('href', '') if link_tag else url
                if not art_url.startswith('http'):
                    art_url = 'https://' + art_url.lstrip('/')

                if art_url in seen_urls:
                    continue
                seen_urls.add(art_url)

                # Extract date
                date_tag  = article.select_one(cfg['date_sel'])
                date_text = date_tag.get_text(strip=True) if date_tag else ''
                art_date  = self._parse_date(date_text)

                # Only include articles from last 30 days
                if art_date:
                    delta = (date.today() - art_date).days
                    if delta > 30:
                        continue

                # Extract description
                desc_tags = article.find_all(['p', 'span'])
                desc      = ' '.join(t.get_text(strip=True) for t in desc_tags[:3])[:500]

                # Classify disease and geography
                full_text    = f"{title} {desc}"
                disease_type = classify_disease(full_text)
                state, dist  = self._extract_geography(full_text)
                dist_km, proximity = classify_distance_from_gorakhpur(state, dist)

                record = {
                    'id'                        : hashlib.md5(art_url.encode()).hexdigest(),
                    'date'                      : art_date.isoformat() if art_date
                                                  else date.today().isoformat(),
                    'source'                    : source_key,
                    'title'                     : title[:300],
                    'description'               : desc[:1000],
                    'state'                     : state,
                    'district'                  : dist,
                    'disease_type'              : disease_type,
                    'distance_from_gorakhpur_km': dist_km,
                    'proximity_label'           : proximity,
                    'hpai_district_flag'        : compute_hpai_flag(dist_km, disease_type),
                    'hpai_adjacent_flag'        : compute_adjacent_flag(dist_km, disease_type),
                    'source_url'                : art_url[:500],
                    'scraped_at'                : datetime.now().isoformat(),
                }
                results.append(record)

            time.sleep(REQUEST_DELAY)

        logger.info(f"  {source_key}: {len(results)} relevant articles found")
        return results

    def _extract_geography(self, text: str) -> Tuple[str, Optional[str]]:
        """
        Try to extract Indian state and district from article text.
        Returns (state, district).
        """
        text_lower = text.lower()

        # Check for state mentions
        found_state = 'Unknown'
        for state in STATE_CENTERS:
            if state.lower() in text_lower:
                found_state = state
                break

        # Check for UP district mentions
        up_districts = [
            'gorakhpur', 'lucknow', 'varanasi', 'deoria', 'basti',
            'kushinagar', 'maharajganj', 'azamgarh', 'mau', 'agra',
            'mathura', 'allahabad', 'prayagraj', 'kanpur', 'bareilly'
        ]
        found_district = None
        for dist in up_districts:
            if dist in text_lower:
                found_district = dist.title()
                if found_state == 'Unknown':
                    found_state = 'Uttar Pradesh'
                break

        return found_state, found_district

    def _parse_date(self, date_str: str) -> Optional[date]:
        """Try multiple date formats used by Indian news sites."""
        if not date_str:
            return None

        formats = [
            '%d %B %Y', '%B %d, %Y', '%Y-%m-%d',
            '%d/%m/%Y', '%d-%m-%Y', '%b %d, %Y',
            '%d %b %Y', '%B %d %Y',
        ]
        # Clean up date string
        date_str = re.sub(r'\s+', ' ', date_str.strip())
        date_str = re.sub(r'(st|nd|rd|th),?', '', date_str)

        for fmt in formats:
            try:
                return datetime.strptime(date_str.strip(), fmt).date()
            except ValueError:
                continue

        # Try extracting year-month-day from any ISO substring
        iso_match = re.search(r'(\d{4}-\d{2}-\d{2})', date_str)
        if iso_match:
            try:
                return datetime.strptime(iso_match.group(1), '%Y-%m-%d').date()
            except ValueError:
                pass

        return None

    def scrape_all_sources(self) -> List[Dict]:
        """Scrape all configured news sources."""
        all_results = []
        for source_key in self.NEWS_SOURCES:
            logger.info(f"\nScraping {source_key}...")
            try:
                results = self.scrape_source(source_key)
                all_results.extend(results)
            except Exception as e:
                logger.error(f"Error scraping {source_key}: {e}")
            time.sleep(REQUEST_DELAY * 2)

        # Deduplicate by ID
        seen = set()
        unique = []
        for r in all_results:
            if r['id'] not in seen:
                seen.add(r['id'])
                unique.append(r)

        logger.info(f"\nTotal unique disease news articles: {len(unique)}")
        return unique


# ── Supabase Storage ──────────────────────────────────────────────────────

class SupabaseDiseaseWriter:
    """
    Writes disease alerts to Supabase.

    Required Supabase tables (run in SQL Editor):

    CREATE TABLE IF NOT EXISTS disease_alerts (
        id                          TEXT PRIMARY KEY,
        date                        DATE NOT NULL,
        source                      TEXT NOT NULL,
        title                       TEXT NOT NULL,
        description                 TEXT,
        state                       TEXT,
        district                    TEXT,
        disease_type                TEXT,
        distance_from_gorakhpur_km  NUMERIC(8,2),
        proximity_label             TEXT,
        hpai_district_flag          SMALLINT DEFAULT 0 CHECK (hpai_district_flag IN (0,1)),
        hpai_adjacent_flag          SMALLINT DEFAULT 0 CHECK (hpai_adjacent_flag IN (0,1)),
        source_url                  TEXT,
        scraped_at                  TIMESTAMPTZ,
        created_at                  TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS hpai_daily_flags (
        date                    DATE PRIMARY KEY,
        hpai_district_flag      SMALLINT DEFAULT 0,
        hpai_adjacent_flag      SMALLINT DEFAULT 0,
        active_alert_count      INTEGER DEFAULT 0,
        nearest_alert_km        NUMERIC(8,2),
        nearest_state           TEXT,
        computed_at             TIMESTAMPTZ DEFAULT NOW()
    );
    """

    def __init__(self):
        if 'YOUR_' in SUPABASE_URL or 'YOUR_' in SUPABASE_KEY:
            logger.warning("Supabase not configured — DRY RUN mode")
            self.client = None
        else:
            self.client = create_client(SUPABASE_URL, SUPABASE_KEY)

    def save_alerts(self, alerts: List[Dict]) -> int:
        if not alerts:
            return 0
        if self.client is None:
            logger.info(f"DRY RUN: Would save {len(alerts)} disease alerts")
            hpai = [a for a in alerts if a['hpai_district_flag'] == 1]
            if hpai:
                logger.warning(f"DRY RUN: {len(hpai)} HPAI district alerts detected!")
                for a in hpai:
                    logger.warning(
                        f"  HPAI: {a['state']}/{a['district']} "
                        f"({a['distance_from_gorakhpur_km']:.0f}km) — {a['title'][:60]}"
                    )
            return 0

        resp = (
            self.client.table('disease_alerts')
            .upsert(alerts, on_conflict='id')
            .execute()
        )
        saved = len(resp.data) if resp.data else 0
        logger.info(f"Saved {saved} disease alert records")
        return saved

    def compute_and_save_daily_flags(self, alerts: List[Dict], target_date: str) -> Dict:
        """
        Aggregate all alerts into a single daily flag row.
        This is what the ML feature pipeline reads.
        Training Guide §3.2: hpai_district_flag must be 0 or 1.
        """
        today_alerts = [a for a in alerts if a['date'] == target_date]

        hpai_district = max(
            (a['hpai_district_flag'] for a in today_alerts), default=0)
        hpai_adjacent = max(
            (a['hpai_adjacent_flag'] for a in today_alerts), default=0)
        active_count  = sum(
            1 for a in today_alerts if a['hpai_district_flag'] == 1)

        # Find nearest alert
        nearest_km    = 999.0
        nearest_state = None
        for a in today_alerts:
            if a['hpai_district_flag'] == 1:
                if a['distance_from_gorakhpur_km'] < nearest_km:
                    nearest_km    = a['distance_from_gorakhpur_km']
                    nearest_state = a['state']

        daily_flag = {
            'date'               : target_date,
            'hpai_district_flag' : hpai_district,
            'hpai_adjacent_flag' : hpai_adjacent,
            'active_alert_count' : active_count,
            'nearest_alert_km'   : nearest_km if nearest_km < 999 else None,
            'nearest_state'      : nearest_state,
            'computed_at'        : datetime.now().isoformat(),
        }

        if self.client:
            self.client.table('hpai_daily_flags').upsert(
                daily_flag, on_conflict='date').execute()

        logger.info(
            f"Daily flags for {target_date}: "
            f"hpai_district={hpai_district} "
            f"hpai_adjacent={hpai_adjacent} "
            f"active_alerts={active_count}"
        )

        if hpai_district == 1:
            logger.critical(
                f"CRITICAL ALERT: HPAI within 200km of Gorakhpur detected! "
                f"Nearest: {nearest_state} ({nearest_km:.0f}km). "
                f"Price impact expected: Rs 15-30/kg DROP within 48 hours."
            )

        return daily_flag


# ── Main ──────────────────────────────────────────────────────────────────

def run_scraper():
    """Main entry point."""
    today     = date.today().isoformat()
    logger.info(f"\n{'='*60}\nDisease News Scraper — {today}\n{'='*60}")

    writer = SupabaseDiseaseWriter()
    all_alerts = []

    # ── 1. DAHD Official Alerts ───────────────────────────────────────────
    logger.info("\n[1/2] Fetching DAHD official disease alerts...")
    dahd = DAHDScraper()
    try:
        dahd_alerts = dahd.fetch_disease_alerts()
        all_alerts.extend(dahd_alerts)
        logger.info(f"DAHD: {len(dahd_alerts)} alerts")
    except Exception as e:
        logger.error(f"DAHD scraper failed: {e}")
        # Training Guide §3.2: default hpai_district_flag to 0 on parse failure
        logger.info("Defaulting hpai_district_flag to 0 (no alert) — safe default")

    # ── 2. News Sources ───────────────────────────────────────────────────
    logger.info("\n[2/2] Scraping news sources...")
    news = NewsScraper()
    try:
        news_alerts = news.scrape_all_sources()
        all_alerts.extend(news_alerts)
    except Exception as e:
        logger.error(f"News scraper failed: {e}")

    logger.info(f"\nTotal alerts collected: {len(all_alerts)}")

    # ── 3. Save to Supabase ───────────────────────────────────────────────
    writer.save_alerts(all_alerts)

    # ── 4. Compute daily flags ────────────────────────────────────────────
    daily_flags = writer.compute_and_save_daily_flags(all_alerts, today)

    # ── 5. Summary ────────────────────────────────────────────────────────
    logger.info(f"\n{'='*60}\nSUMMARY\n{'='*60}")
    logger.info(f"Total alerts: {len(all_alerts)}")
    logger.info(f"HPAI district flag (today): {daily_flags['hpai_district_flag']}")
    logger.info(f"HPAI adjacent flag (today): {daily_flags['hpai_adjacent_flag']}")
    logger.info(f"Active HPAI alerts        : {daily_flags['active_alert_count']}")
    if daily_flags['nearest_alert_km']:
        logger.info(
            f"Nearest alert             : {daily_flags['nearest_state']} "
            f"({daily_flags['nearest_alert_km']:.0f}km)"
        )

    return daily_flags


if __name__ == '__main__':
    run_scraper()
