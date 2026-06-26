"""
PoultryPulse AI — Scraper 03: Mobile Poultry Expert App on Desktop
===================================================================
This file has two parts:

PART A — Setup Guide: How to run an Android/iOS poultry expert app
         on your desktop computer (Windows/Mac/Linux)

PART B — Desktop Scraper: Automatically captures price and advisory
         data from the mobile app running on desktop, saves to Supabase

Target apps:
  - Poultry Pro (Google Play)
  - KisanSuvidha (government app — poultry advisory)
  - Pashudhan Praharee (animal disease alerts)
  - NECC App (egg/broiler prices)
  - AgroStar (poultry advisory, Hindi)
  - VetConnect India (veterinary disease alerts)

Data collected:
  - Live broiler prices shown in the app
  - Disease alerts and advisories
  - Feed price indices
  - Regional poultry news

Supabase table: mobile_app_data

How to run:
  pip install requests supabase pyautogui pillow pytesseract opencv-python
  python scraper_03_mobile_app_desktop.py

Schedule:
  0 7,12,18 * * *  python scraper_03_mobile_app_desktop.py
"""

import os
import sys
import time
import json
import logging
import subprocess
import platform
from datetime import datetime, date
from typing import Optional, Dict, List
from pathlib import Path

from supabase import create_client

# ── Logging ───────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ── Configuration ─────────────────────────────────────────────────────────
SUPABASE_URL = os.environ.get('SUPABASE_URL', 'https://YOUR_PROJECT.supabase.co')
SUPABASE_KEY = os.environ.get('SUPABASE_KEY', 'YOUR_ANON_KEY')

# ADB configuration (Android Debug Bridge — used to talk to emulator)
ADB_PATH        = os.environ.get('ADB_PATH', 'adb')  # 'adb' if in PATH
EMULATOR_PORT   = '5554'                              # Default AVD port
DEVICE_ID       = f'emulator-{EMULATOR_PORT}'

# Screenshot save directory
SCREENSHOT_DIR  = Path('./screenshots')
SCREENSHOT_DIR.mkdir(exist_ok=True)

# App package names (Android)
TARGET_APPS = {
    'kisansuvidha': {
        'package'     : 'com.nic.kisansuvidha',
        'launch_activity': 'com.nic.kisansuvidha.MainActivity',
        'description' : 'Government Kisan Suvidha — poultry advisory',
        'price_screen': False,  # No price screen — advisory only
        'disease_screen': True,
    },
    'pashudhan': {
        'package'     : 'in.gov.dahd.pashudhanpraharee',
        'launch_activity': '.MainActivity',
        'description' : 'DAHD Pashudhan Praharee — animal disease alerts',
        'price_screen': False,
        'disease_screen': True,
    },
    'agrostar': {
        'package'     : 'com.agrostar.android',
        'launch_activity': 'com.agrostar.android.ui.SplashActivity',
        'description' : 'AgroStar — poultry advisory and prices',
        'price_screen': True,
        'disease_screen': True,
    },
}


# =============================================================================
# PART A — DESKTOP SETUP GUIDE
# =============================================================================
SETUP_GUIDE = """
╔══════════════════════════════════════════════════════════════════════════════╗
║     HOW TO RUN A MOBILE POULTRY APP ON YOUR DESKTOP COMPUTER               ║
║     (Step-by-step for beginners — Windows, Mac, or Linux)                  ║
╚══════════════════════════════════════════════════════════════════════════════╝

WHAT YOU NEED
─────────────
You will install Android Studio, which includes an Android Emulator —
a virtual Android phone that runs inside your computer.
Once the emulator is running, you install the poultry apps on it,
just like you would on a real phone.

This scraper then reads data from those running apps automatically.

═══════════════════════════════════════════════════════════════════════════════
STEP 1 — Install Android Studio (15 minutes)
═══════════════════════════════════════════════════════════════════════════════

1. Go to: https://developer.android.com/studio
2. Click "Download Android Studio" — the big green button
3. Run the installer (it is about 1 GB download)
4. Accept all defaults during installation
5. At the end, Android Studio opens automatically

STEP 2 — Create a Virtual Device (Android Emulator) (10 minutes)
═══════════════════════════════════════════════════════════════════════════════

In Android Studio:
1. Click "More Actions" → "Virtual Device Manager"
   OR go to: Tools → Device Manager
2. Click the "+" button → "Create Virtual Device"
3. Choose: Phone → Pixel 6 → Next
4. Choose system image: API 33 (Android 13) → Download if needed → Next
5. Name it: "PoultryPulse_Device"
6. Click Finish

STEP 3 — Start the Emulator (2 minutes)
═══════════════════════════════════════════════════════════════════════════════

In Device Manager, click the ▶ (Play) button next to your device.
An Android phone window will appear on your screen.
Wait for it to fully boot (home screen appears) — takes 1-3 minutes.

STEP 4 — Install ADB (Android Debug Bridge)
═══════════════════════════════════════════════════════════════════════════════

ADB is the tool that lets this Python script talk to the emulator.
It is already installed inside Android Studio.

Add ADB to your system PATH:

  Windows:
    Open File Explorer → navigate to:
    C:\\Users\\YOUR_NAME\\AppData\\Local\\Android\\Sdk\\platform-tools\\
    Copy that path.
    Search "Environment Variables" → System Variables → Path → Edit → New
    Paste the path → OK → OK

  Mac/Linux:
    echo 'export PATH=$PATH:~/Library/Android/sdk/platform-tools' >> ~/.zshrc
    source ~/.zshrc

Verify: Open a new terminal and type:
  adb version
You should see: Android Debug Bridge version 1.x.xx

STEP 5 — Connect ADB to the Emulator
═══════════════════════════════════════════════════════════════════════════════

In your terminal:
  adb connect localhost:5554

You should see: "connected to localhost:5554"

Verify the emulator is visible:
  adb devices
You should see: "emulator-5554  device"

STEP 6 — Install Poultry Apps on the Emulator
═══════════════════════════════════════════════════════════════════════════════

METHOD A — Google Play Store (recommended for KisanSuvidha, AgroStar):
  1. In the emulator, open Google Play Store (sign in with a Google account)
  2. Search for the app and install it normally
  3. The app installs just like on a real phone

METHOD B — Direct APK install (for apps not on Play Store):
  1. Download the APK file from the app's official website or APKPure.com
  2. In your terminal: adb install path/to/app.apk
  3. The app will appear in the emulator's app drawer

APPS TO INSTALL:
  ┌─────────────────────────────────────┬────────────────────────────────────┐
  │ App Name                            │ Where to find it                   │
  ├─────────────────────────────────────┼────────────────────────────────────┤
  │ KisanSuvidha                        │ Google Play Store                  │
  │ Pashudhan Praharee (DAHD)           │ Google Play Store                  │
  │ AgroStar                            │ Google Play Store                  │
  │ NECC App                            │ necc.co.in → Download section      │
  │ Poultry Pro / Poultry Manager       │ Google Play Store                  │
  └─────────────────────────────────────┴────────────────────────────────────┘

STEP 7 — Install Tesseract OCR (reads text from screenshots)
═══════════════════════════════════════════════════════════════════════════════

This Python script takes screenshots of the running apps and uses
Tesseract OCR to read the prices and alerts from them.

  Windows: Download installer from https://github.com/UB-Mannheim/tesseract/wiki
           Install it → note the install path (usually C:\\Program Files\\Tesseract-OCR)
           Add to PATH (same way as ADB above)

  Mac:     brew install tesseract
           brew install tesseract-lang  (for Hindi support)

  Linux:   sudo apt install tesseract-ocr tesseract-ocr-hin

Verify: tesseract --version

STEP 8 — Install Python dependencies
═══════════════════════════════════════════════════════════════════════════════

In your terminal:
  pip install pyautogui pillow pytesseract opencv-python supabase requests

STEP 9 — Run this scraper
═══════════════════════════════════════════════════════════════════════════════

Set your Supabase credentials as environment variables:

  Windows (PowerShell):
    $env:SUPABASE_URL="https://your-project.supabase.co"
    $env:SUPABASE_KEY="your-anon-key"

  Mac/Linux:
    export SUPABASE_URL="https://your-project.supabase.co"
    export SUPABASE_KEY="your-anon-key"

Then run:
  python scraper_03_mobile_app_desktop.py

The script will:
  1. Connect to the running emulator
  2. Launch each installed app
  3. Take screenshots
  4. Extract text using OCR
  5. Parse prices, disease alerts, and advisories
  6. Save to Supabase

STEP 10 — Automate daily (Windows Task Scheduler / Mac launchd / Linux cron)
═══════════════════════════════════════════════════════════════════════════════

Windows Task Scheduler:
  1. Search "Task Scheduler" → Create Basic Task
  2. Name: "PoultryPulse Mobile Scraper"
  3. Trigger: Daily → 07:00, 12:00, 18:00
  4. Action: Start a program → python
  5. Arguments: C:\\path\\to\\scraper_03_mobile_app_desktop.py

Linux/Mac cron:
  crontab -e
  Add:  0 7,12,18 * * * /usr/bin/python3 /path/to/scraper_03_mobile_app_desktop.py

TROUBLESHOOTING
═══════════════════════════════════════════════════════════════════════════════

Problem: "adb: command not found"
Fix: ADB is not in your PATH. See Step 4.

Problem: "no devices/emulators found"
Fix: Emulator is not running. Start it in Android Studio (Device Manager → ▶)
     Then run: adb connect localhost:5554

Problem: OCR reads gibberish
Fix: Install Hindi language pack for Tesseract (tesseract-ocr-hin)
     In the scraper, use lang='hin+eng' parameter

Problem: App crashes on emulator
Fix: Some apps (especially banking/security-heavy ones) detect emulators.
     Try: adb shell settings put global development_settings_enabled 1
     Or use a physical Android device connected via USB instead.

Problem: Emulator is very slow
Fix: Enable hardware acceleration in Android Studio:
     SDK Manager → SDK Tools → Intel x86 Emulator Accelerator (HAXM) → Install

"""


# =============================================================================
# PART B — THE ACTUAL SCRAPER
# =============================================================================

class ADBController:
    """
    Controls the Android emulator via ADB commands.
    ADB (Android Debug Bridge) is the standard Android developer tool
    for sending commands to Android devices and emulators.
    """

    def __init__(self, device_id: str = DEVICE_ID):
        self.device_id = device_id

    def _run(self, cmd: List[str]) -> subprocess.CompletedProcess:
        """Run an ADB command and return the result."""
        full_cmd = [ADB_PATH, '-s', self.device_id] + cmd
        try:
            result = subprocess.run(
                full_cmd, capture_output=True, text=True, timeout=30)
            return result
        except subprocess.TimeoutExpired:
            logger.warning(f"ADB command timed out: {cmd}")
            return subprocess.CompletedProcess(cmd, 1, '', 'timeout')
        except FileNotFoundError:
            logger.error(
                "ADB not found. Install Android Studio and add ADB to PATH. "
                "See the setup guide at the top of this file.")
            raise

    def is_connected(self) -> bool:
        """Check if emulator is connected and ready."""
        result = self._run(['shell', 'echo', 'ok'])
        return result.returncode == 0 and 'ok' in result.stdout

    def launch_app(self, package: str, activity: str) -> bool:
        """Launch an app on the emulator."""
        result = self._run([
            'shell', 'am', 'start', '-n', f'{package}/{activity}'
        ])
        success = result.returncode == 0
        if success:
            logger.info(f"Launched {package}")
            time.sleep(4)  # Wait for app to load
        else:
            logger.warning(f"Failed to launch {package}: {result.stderr}")
        return success

    def take_screenshot(self, save_path: Path) -> bool:
        """Take a screenshot of the emulator screen."""
        # Capture to device temp file
        self._run(['shell', 'screencap', '-p', '/sdcard/screenshot.png'])
        time.sleep(0.5)
        # Pull to desktop
        result = self._run(['pull', '/sdcard/screenshot.png', str(save_path)])
        return result.returncode == 0

    def scroll_down(self):
        """Scroll down in the current app screen."""
        self._run(['shell', 'input', 'swipe', '500', '800', '500', '300', '300'])
        time.sleep(1)

    def press_back(self):
        """Press the Android back button."""
        self._run(['shell', 'input', 'keyevent', '4'])
        time.sleep(0.5)

    def press_home(self):
        """Press the Android home button."""
        self._run(['shell', 'input', 'keyevent', '3'])
        time.sleep(1)

    def connect(self) -> bool:
        """Connect ADB to emulator."""
        result = subprocess.run(
            [ADB_PATH, 'connect', f'localhost:{EMULATOR_PORT}'],
            capture_output=True, text=True, timeout=10
        )
        connected = 'connected' in result.stdout.lower()
        logger.info(f"ADB connection: {'OK' if connected else 'FAILED'}")
        return connected


class ScreenOCR:
    """
    Reads text from screenshots using Tesseract OCR.
    Handles both English and Hindi text.
    """

    def __init__(self):
        self._check_tesseract()

    def _check_tesseract(self):
        try:
            import pytesseract
            # On Windows, set the path if not in PATH
            if platform.system() == 'Windows':
                tesseract_path = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
                if Path(tesseract_path).exists():
                    pytesseract.pytesseract.tesseract_cmd = tesseract_path
            self.pytesseract = pytesseract
            logger.info("Tesseract OCR ready")
        except ImportError:
            logger.error(
                "pytesseract not installed. Run: pip install pytesseract\n"
                "Also install Tesseract: https://github.com/UB-Mannheim/tesseract/wiki"
            )
            self.pytesseract = None

    def extract_text(self, image_path: Path, lang: str = 'eng+hin') -> str:
        """
        Extract all text from a screenshot.
        lang='eng+hin' reads both English and Hindi text.
        """
        if self.pytesseract is None:
            return ''
        try:
            from PIL import Image
            import cv2, numpy as np

            # Load and preprocess image for better OCR accuracy
            img = cv2.imread(str(image_path))
            if img is None:
                return ''

            # Convert to grayscale
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

            # Apply threshold to improve contrast
            _, thresh = cv2.threshold(
                gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

            # Convert back to PIL for pytesseract
            pil_img = Image.fromarray(thresh)

            # Extract text — use page segmentation mode 6 (single block of text)
            text = self.pytesseract.image_to_string(
                pil_img, lang=lang, config='--psm 6')
            return text.strip()

        except Exception as e:
            logger.warning(f"OCR failed for {image_path}: {e}")
            return ''

    def extract_price(self, text: str) -> Optional[float]:
        """
        Find a broiler/chicken price in OCR-extracted text.
        Looks for patterns like "Rs 158", "₹162.50", "158.00/kg"
        """
        import re

        # Patterns for prices in Indian format
        patterns = [
            r'(?:Rs\.?|₹|INR)\s*(\d{2,3}(?:\.\d{1,2})?)',  # Rs 158 or ₹158.50
            r'(\d{2,3}(?:\.\d{1,2})?)\s*(?:Rs\.?|₹|/kg)',  # 158/kg
            r'(?:price|rate|bhav|daam|भाव|दाम)[:\s]*(\d{2,3}(?:\.\d{1,2})?)',
            r'(?:broiler|chicken|murga|मुर्गा)[:\s]*(\d{2,3}(?:\.\d{1,2})?)',
        ]

        for pattern in patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                try:
                    price = float(match)
                    # Validate price range (Training Guide §3.2)
                    if 80 <= price <= 250:
                        return price
                except ValueError:
                    continue
        return None

    def extract_disease_alert(self, text: str) -> Optional[Dict]:
        """Extract disease alert information from OCR text."""
        import re

        disease_keywords = [
            'bird flu', 'avian influenza', 'HPAI', 'H5N1',
            'disease alert', 'outbreak', 'disease warning',
            'बर्ड फ्लू', 'रोग चेतावनी', 'प्रकोप',
        ]

        text_lower = text.lower()
        detected   = [kw for kw in disease_keywords if kw.lower() in text_lower]

        if not detected:
            return None

        # Extract state/district mentions
        state_pattern = '|'.join(
            re.escape(s) for s in
            ['Uttar Pradesh', 'UP', 'Bihar', 'Madhya Pradesh', 'Maharashtra',
             'Punjab', 'Haryana', 'Andhra Pradesh', 'Telangana'])
        states = re.findall(state_pattern, text, re.IGNORECASE)

        return {
            'disease_keywords_found': detected,
            'states_mentioned'      : list(set(states)),
            'is_hpai'               : any('flu' in kw.lower() or 'hpai' in kw.lower()
                                          or 'h5' in kw.lower() or 'influenza' in kw.lower()
                                          for kw in detected),
            'raw_text_excerpt'      : text[:300],
        }


class AppScraper:
    """
    Main scraper that orchestrates launching apps,
    taking screenshots, extracting data, and saving to Supabase.
    """

    def __init__(self):
        self.adb     = ADBController()
        self.ocr     = ScreenOCR()
        self.results = []

    def scrape_app(self, app_key: str, app_config: Dict) -> Optional[Dict]:
        """Scrape data from one installed app."""
        logger.info(f"\nScraping app: {app_key} ({app_config['description']})")

        # Launch the app
        launched = self.adb.launch_app(
            app_config['package'], app_config['launch_activity'])
        if not launched:
            logger.warning(f"Could not launch {app_key} — app may not be installed")
            return None

        time.sleep(3)  # Wait for app to fully load
        collected = {
            'app'           : app_key,
            'date'          : date.today().isoformat(),
            'scraped_at'    : datetime.now().isoformat(),
            'prices'        : [],
            'disease_alerts': [],
            'raw_texts'     : [],
        }

        # Take up to 3 screenshots (scrolling through the app)
        for screen_num in range(3):
            ts           = datetime.now().strftime('%Y%m%d_%H%M%S')
            img_path     = SCREENSHOT_DIR / f'{app_key}_screen{screen_num}_{ts}.png'

            if self.adb.take_screenshot(img_path):
                # Extract text from screenshot
                text = self.ocr.extract_text(img_path)
                if text:
                    collected['raw_texts'].append(text[:500])

                    # Try to extract price
                    price = self.ocr.extract_price(text)
                    if price:
                        collected['prices'].append({
                            'price_per_kg' : price,
                            'screen'       : screen_num,
                            'context'      : text[:100],
                        })
                        logger.info(f"  Screen {screen_num}: Price Rs {price}/kg detected")

                    # Try to extract disease alert
                    alert = self.ocr.extract_disease_alert(text)
                    if alert:
                        collected['disease_alerts'].append(alert)
                        logger.warning(
                            f"  Screen {screen_num}: Disease alert detected! "
                            f"Keywords: {alert['disease_keywords_found']}"
                        )

            # Scroll down for next screen
            if screen_num < 2:
                self.adb.scroll_down()

        # Go back to home for next app
        self.adb.press_home()
        time.sleep(2)

        logger.info(
            f"  {app_key}: {len(collected['prices'])} prices, "
            f"{len(collected['disease_alerts'])} disease alerts found"
        )
        return collected

    def scrape_all_apps(self) -> List[Dict]:
        """Scrape all configured apps."""
        if not self.adb.connect():
            logger.error(
                "Cannot connect to Android emulator.\n"
                "Make sure the emulator is running in Android Studio.\n"
                "See the setup guide at the top of this file."
            )
            return []

        if not self.adb.is_connected():
            logger.error("Emulator connected but not responding. Try restarting it.")
            return []

        logger.info("Emulator connected and ready.")
        all_data = []

        for app_key, app_config in TARGET_APPS.items():
            try:
                data = self.scrape_app(app_key, app_config)
                if data:
                    all_data.append(data)
            except Exception as e:
                logger.error(f"Error scraping {app_key}: {e}")

        return all_data


class SupabaseMobileWriter:
    """
    Saves mobile app scraped data to Supabase.

    Required Supabase table:

    CREATE TABLE IF NOT EXISTS mobile_app_data (
        id              BIGSERIAL PRIMARY KEY,
        date            DATE NOT NULL,
        app_name        TEXT NOT NULL,
        price_per_kg    NUMERIC(8,2),
        disease_alert   BOOLEAN DEFAULT FALSE,
        disease_details JSONB,
        raw_text        TEXT,
        screenshot_count INTEGER,
        source          TEXT DEFAULT 'mobile_app_ocr',
        scraped_at      TIMESTAMPTZ,
        created_at      TIMESTAMPTZ DEFAULT NOW()
    );
    """

    def __init__(self):
        if 'YOUR_' in SUPABASE_URL or 'YOUR_' in SUPABASE_KEY:
            logger.warning("Supabase not configured — DRY RUN mode")
            self.client = None
        else:
            self.client = create_client(SUPABASE_URL, SUPABASE_KEY)

    def save(self, app_data_list: List[Dict]) -> int:
        rows = []
        for data in app_data_list:
            # Use first detected price as the main price
            price = data['prices'][0]['price_per_kg'] if data['prices'] else None

            rows.append({
                'date'             : data['date'],
                'app_name'         : data['app'],
                'price_per_kg'     : price,
                'disease_alert'    : len(data['disease_alerts']) > 0,
                'disease_details'  : json.dumps(data['disease_alerts']) if data['disease_alerts'] else None,
                'raw_text'         : ' | '.join(data['raw_texts'])[:2000],
                'screenshot_count' : len(data['raw_texts']),
                'source'           : 'mobile_app_ocr',
                'scraped_at'       : data['scraped_at'],
            })

        if not rows:
            return 0

        if self.client is None:
            logger.info(f"DRY RUN: Would save {len(rows)} mobile app records")
            for r in rows:
                logger.info(
                    f"  {r['app_name']}: price={r['price_per_kg']} "
                    f"disease_alert={r['disease_alert']}"
                )
            return 0

        resp = self.client.table('mobile_app_data').insert(rows).execute()
        saved = len(resp.data) if resp.data else 0
        logger.info(f"Saved {saved} mobile app records to Supabase")
        return saved


# ── Main ──────────────────────────────────────────────────────────────────

def print_setup_guide():
    """Print the setup guide for first-time users."""
    print(SETUP_GUIDE)


def run_scraper():
    """Main entry point for the mobile app scraper."""
    logger.info(f"\n{'='*60}\nMobile App Scraper — {date.today()}\n{'='*60}")

    scraper = AppScraper()
    writer  = SupabaseMobileWriter()

    # Scrape all apps
    all_data = scraper.scrape_all_apps()

    if not all_data:
        logger.warning(
            "No data collected. "
            "Make sure the Android emulator is running with apps installed.\n"
            "Run: python scraper_03_mobile_app_desktop.py --setup\n"
            "to see the full setup guide."
        )
        return

    # Save to Supabase
    writer.save(all_data)

    # Summary
    logger.info(f"\n{'='*60}\nSUMMARY\n{'='*60}")
    for data in all_data:
        price_str = (f"Rs {data['prices'][0]['price_per_kg']}/kg"
                     if data['prices'] else "no price detected")
        alert_str = (f"DISEASE ALERT: {data['disease_alerts'][0]['disease_keywords_found']}"
                     if data['disease_alerts'] else "no alerts")
        logger.info(f"  {data['app']:20s}: {price_str} | {alert_str}")


if __name__ == '__main__':
    if '--setup' in sys.argv or '--guide' in sys.argv:
        print_setup_guide()
        sys.exit(0)

    if '--dry-run' in sys.argv:
        SUPABASE_URL = 'YOUR_DRY_RUN'
        SUPABASE_KEY = 'YOUR_DRY_RUN'

    run_scraper()
