# PoultryPulse AI — Auth, Onboarding & Conversion Flow Design Master
# File: 10_auth_onboarding_design_master.md
# Kiro Compatibility: ✅ Full Kiro Agent Implementation Ready
# Version: v1.0 | May 2026 | CONFIDENTIAL

---

## AGENT CONTEXT BLOCK
```
DESIGNER_PERSONA: Jessica Lin (accessibility-first) × Joanna Wiebe (zero-friction CRO) × Don Norman (human-centered)
CONVERSION_TARGET: Homepage visitor → Trial activation < 3 minutes
FRICTION_TARGET: Phone number only for Phase 0 sign-up — no email, no password
AUTH_METHOD: Supabase Phone OTP
LANGUAGE: Hindi-first, English toggle available
MOBILE: Optimised for mid-range Android (₹8,000–15,000 segment)
FOUNDATION: PRD v3.0 §4 + TRD v1.0 + UI/UX Design v1.0 §2.1
```

---

## 1. SIGN-UP FLOW (`/signup`)

### 1.1 Phone Entry Screen

**Layout:** Centered card, max-width 440px, vertical centre on viewport
**Background:** heroGradient (continuity from homepage hero)
**Card:** White, rounded-[2rem], p-8 sm:p-10

```
COPY SPEC:

HEADLINE:
  Hi: "शुरू करते हैं — बस एक step"
  En: "Let's begin — just one step"
  Style: heading-2, neutral-900, text-center

SUB-COPY:
  Hi: "अपना WhatsApp number डालें — OTP आएगा"
  En: "Enter your WhatsApp number — we'll send an OTP"
  Style: body-base, neutral-500, text-center

PLAN BANNER (shown when ?plan= query param exists):
  Hi: "आपने [PulseFarm] plan चुना है — 14 दिन मुफ़्त"
  Background: brandGreen50, text: brandGreen700, rounded-lg, px-4 py-2
  Position: above headline

PHONE INPUT:
  Label (visually hidden, screen reader): "WhatsApp Number"
  Prefix: "+91" — fixed pill inside input left side
  Input: 10-digit numeric, inputmode="numeric", pattern="[6-9][0-9]{9}"
  Placeholder: "XXXXX XXXXX" (space after 5th digit)
  Auto-format: space inserted after 5th digit as user types
  Height: 52px, rounded-xl, border neutral-200
  Focus: ring-2 ring-brandGreen500
  
ERROR STATES (inline, below input, role="alert"):
  Invalid format: "कृपया सही 10-digit mobile number दर्ज करें"
  Rate limited: "बहुत ज़्यादा कोशिशें — 1 घंटे बाद try करें"
  Network error: "Internet connection check करें और दोबारा try करें"
  
DPDP CONSENT CHECKBOX (required):
  "मैं PoultryPulse AI की Privacy Policy से सहमत हूँ और daily price alerts
   WhatsApp पर पाने के लिए तैयार हूँ।"
  Link: "Privacy Policy" opens /privacy in new tab
  Default: UNCHECKED (DPDP requirement — never pre-ticked)
  Submit blocked until checked

PRIMARY CTA:
  Text: "OTP भेजें →"
  Loading: spinner inside button (not full-page overlay)
  Disabled state: opacity-50 when phone invalid OR consent unchecked
  Width: 100%, Height: 52px, brandGreen700 fill, white text

SOCIAL PROOF MICRO-COPY:
  "200+ किसान पहले से जुड़े हैं • Gorakhpur, Deoria, Kushinagar"
  Style: 12px, neutral-400, text-center, mt-4

EXISTING ACCOUNT LINK:
  "पहले से account है? → Login करें"
  → /login (preserves ?redirect= param if present)
```

### 1.2 OTP Verification Screen

**Trigger:** After OTP send succeeds → same page, Framer Motion slide transition (no page reload)

```
TRANSITION:
  Phone entry slides left (translateX -100%, fade out)
  OTP entry slides in from right (translateX 100% → 0, fade in)
  Duration: 400ms, easeOutQuart

BACK LINK (top):
  "← +91-XXXXX XXXXX" — masked number, tap to go back to phone entry
  
HEADLINE:
  Hi: "OTP भेजा गया"
  Sub-copy: "+91-XXXXX XXXXX पर 6-digit OTP भेजा गया"
  (Show only last 5 digits of phone for privacy)

OTP INPUT (6 separate boxes):
  Each box: 52×56px, rounded-xl, border neutral-200
  Gap between boxes: 8px
  Font: Sora, 24px, font-bold, text-center
  
  Behaviour:
  - Auto-advance cursor to next box on digit entry
  - Backspace: clears current + moves to previous
  - Paste: distributes 6-digit code across boxes
  - Auto-submit: fires on last digit fill (no manual submit needed)
  
  Accessibility:
  - role="group" aria-label="6-digit OTP code"
  - Each input: aria-label="OTP digit 1" through "OTP digit 6"
  - Error: role="alert" on error container

COUNTDOWN TIMER:
  "OTP 2:00 में expire होगा" → counts down in MM:SS format
  At 0:00: "OTP expire हो गया"
  Resend activates: "OTP फिर भेजें →" (outlined button, brandGreen700)
  Rate limit: 3 resends max. After 3: "अधिकतम OTP भेज दिए — कल try करें"

ERROR STATE:
  Wrong OTP: boxes shake (form-shake animation), turn red, 
             "गलत OTP — दोबारा try करें (X tries बचे हैं)"
  5 wrong attempts: "बहुत ज़्यादा गलत tries — 30 मिनट बाद try करें"
  Input auto-clears after error so user can retype

SUCCESS STATE:
  All boxes → green briefly (200ms pulse)
  Auto-redirect to /onboarding after 400ms
  Analytics: fire signup_completed event
```

### 1.3 Login Flow (`/login`)

```
IDENTICAL to sign-up except:
- Headline: "वापस आएं" / "Welcome back"
- Sub-copy: "अपना registered WhatsApp number डालें"
- No consent checkbox (already consented at signup)
- No plan banner
- No social proof strip
- Bottom link: "Account नहीं है? → Free trial शुरू करें" → /signup

Post-login redirect:
- If ?redirect= param: redirect to that URL
- If customer segment S1: redirect to /dashboard/mobile-only
- If customer segment S2+: redirect to /dashboard/overview
- If admin: redirect to /dashboard/accuracy (accuracy is admin priority)
- If onboarding incomplete: redirect to /onboarding (resume state)
```

---

## 2. ONBOARDING FLOW (`/onboarding`)

### 2.1 Onboarding Architecture

```
DESIGN PHILOSOPHY (Don Norman):
  "The best onboarding is the one that feels like it isn't happening."
  Every screen has: clear purpose, obvious next action, skip option where safe.
  
10-STATE ONBOARDING MACHINE (from PRD v3.0):
  OB-01: Welcome + what to expect
  OB-02: Farm location (district selector)
  OB-03: Flock size
  OB-04: Farm type (independent / integrator contract)
  OB-05: Plan confirmation (based on ?plan= param or default PulseFarm)
  OB-06: WhatsApp verification (confirm they can receive messages)
  OB-07: First signal preview (show simulated signal)
  OB-08: App download prompt (optional, skippable)
  OB-09: Referral source (how did you hear about us?)
  OB-10: Success + "Your first signal arrives at 6:30 AM tomorrow"

PROGRESS INDICATOR:
  Top of every screen: "X / 10" step counter
  Thin progress bar (10 segments, fill left-to-right as steps complete)
  "X मिनट बचे हैं" estimate (decreases as steps complete)
  
LAYOUT: Same centered card as sign-up (max-width 440px)
BACKGROUND: Gradient transitions from heroGradient → neutral50 across steps
(Hero green for welcome, then lighter for form steps — reduces visual fatigue)

SKIP BEHAVIOUR:
  OB-08 (App download): Skip button visible — "बाद में download करें →"
  OB-09 (Referral source): "Skip →" available — optional data
  All others: no skip (required for service configuration)

BACK NAVIGATION:
  "← पिछला" (Back) on all screens except OB-01
  State preserved: going back keeps entered values
  Browser back button: intercepted, shows in-page back (not browser navigation)
```

### 2.2 Each Onboarding Screen — Detailed Spec

**OB-01: Welcome**

```
VISUAL: Full-width illustration — DataFlowTicker mockup at reduced size
Headline (Hi): "नमस्ते! PoultryPulse AI में स्वागत है 🙏"
Sub (Hi): "अगले 2 मिनट में आपका free trial setup हो जाएगा।
            कल सुबह 6:30 बजे आपका पहला price signal WhatsApp पर आएगा।"
            
WHAT-TO-EXPECT MINI-LIST:
  ✓ आज: Setup complete
  ✓ कल 4:30 AM: हम 47 sources से data collect करेंगे
  ✓ कल 6:00 AM: AI prediction तैयार होगा
  ✓ कल 6:30 AM: आपके WhatsApp पर signal

CTA: "शुरू करें →" (large, brandGreen700)
Analytics: fire onboarding_started event
```

**OB-02: Farm Location**

```
Headline: "आपकी farm कहाँ है?"
Sub: "हम आपके जिले का सटीक भाव दिखाएंगे"

DISTRICT SELECTOR:
  Style: Large card-grid (not dropdown) — 6 cards, tap to select
  Districts: Gorakhpur | Deoria | Kushinagar | Basti | Maharajganj | Sant Kabir Nagar
  Card: District name in Hindi + English, subtle icon (map pin)
  Selected: brandGreen700 border (2px) + brandGreen50 background + checkmark
  
  Below cards: "मेरा जिला यहाँ नहीं है →"
    Opens secondary selector with all UP districts (dropdown)
    Note: "Phase 0 में सिर्फ Gorakhpur belt cover है। आपका जिला Phase 1 में आएगा।"
    Allows waitlist registration for out-of-coverage

VALIDATION: District must be selected to proceed
CTA: "आगे →" (disabled until selection made)
```

**OB-03: Flock Size**

```
Headline: "आपके farm में कितने पंछी हैं?"
Sub: "अनुमान ठीक है — exact count ज़रूरी नहीं"

FLOCK SIZE OPTIONS (large segmented cards, radio-group):
  Option 1: "10,000 – 25,000 पंछी"    → S1 PulseFarm
  Option 2: "25,000 – 50,000 पंछी"    → S1 PulseFarm
  Option 3: "50,000 – 1 लाख पंछी"     → S2 PulsePro recommended
  Option 4: "1 लाख – 5 लाख पंछी"     → S2 PulsePro
  Option 5: "5 लाख+ पंछी (Integrator)"→ S2 PulsePro / PulseIntel

Plan recommendation banner (appears after selection):
  If option 3-5 selected: "आपके farm के लिए PulsePro recommend है →"
  "अभी PulseFarm से शुरू कर सकते हैं, बाद में upgrade होगा"

BATCHES-PER-YEAR (secondary input, appears after flock selection):
  "साल में कितने batch?" — segmented: 2 | 3 | 4
  
VALIDATION: Flock range required. Batches optional (default 3).
```

**OB-04: Farm Type**

```
Headline: "आपका farm किस तरह का है?"
Sub: "यह आपके integrator analytics के लिए है"

TWO OPTIONS (large cards):

Card 1: "Independent Farm"
  Icon: single farm house illustration
  Hi desc: "मैं अपना खुद का feed और स्वतंत्र रूप से बेचता हूँ"
  
Card 2: "Contract / Integrator Farm"
  Icon: connected farms illustration
  Hi desc: "मैं एक company/integrator के contract पर काम करता हूँ"
  Sub: "जैसे: Sugna, Venkateshwara, या local integrators"
  
If Card 2 selected: show integrator name field (optional free text)
```

**OB-05: Plan Confirmation**

```
Headline: "आपका plan confirm करें"
Sub: "14 दिन बिल्कुल मुफ़्त — कोई credit card नहीं"

PLAN DISPLAY CARD:
  Large card showing selected/recommended plan
  
  PulseFarm card:
    Name: "PulseFarm" (large)
    Price: "₹2,000/माह" with "14 दिन मुफ़्त trial" badge
    Features (5 most important, green checkmarks):
      ✓ Daily WhatsApp sell signal (6:30 AM)
      ✓ 7-day price forecast
      ✓ Gorakhpur belt coverage
      ✓ HPAI disease alerts
      ✓ Hindi-first mobile app
    After trial: "₹2,000/माह या ₹20,000/साल (2 महीने मुफ़्त)"

DOWNGRADE LINK (if PulsePro recommended but user wants Farm):
  "PulseFarm से शुरू करना चाहते हैं? →" (text link below card)

CURRENCY GATE (P0 LAUNCH BLOCKER from PRD):
  Once plan selected and confirmed → cannot change currency/billing setup
  Note in UI: "Plan confirm करने के बाद बदला नहीं जा सकता — 
              लेकिन upgrade/downgrade अकाउंट में हो सकती है"
  
CTA: "14 दिन का free trial शुरू करें →"
Sub-CTA: "कोई payment अभी नहीं — trial के बाद option मिलेगा"
```

**OB-06: WhatsApp Verification**

```
Headline: "WhatsApp ready है?"
Sub: "हम आपको daily 6:30 AM पर message भेजेंगे"

ACTION REQUIRED:
  "PoultryPulse AI का number save करें:"
  Large display: "+91-XXXXXXXXXX"
  [Contact Save करें] button → vCard download / link to save contact
  
SEND TEST MESSAGE:
  CTA: "Test WhatsApp Message भेजें →"
  On click: API call sends test message via Twilio
  
  Test message content:
  "नमस्ते! यह PoultryPulse AI का test message है। 🐔
   कल सुबह 6:30 बजे आपका पहला price signal आएगा।
   —PoultryPulse AI Team"
  
  Confirmation: "Message भेजा गया — WhatsApp check करें ✓"
  Error: "Message नहीं गया — check करें कि number सही है"
  
  "Message नहीं मिला?" accordion:
    • Check करें: क्या +91-XXXXXXXXXX आपके contacts में save है?
    • WhatsApp पर Business messages block हैं? Check → Settings → Privacy
    • अभी skip करें और बाद में verify करें

SKIP: "बाद में verify करें →" (text link — not all farmers can verify immediately)
Analytics: fire whatsapp_verification_attempted, whatsapp_verified/failed
```

**OB-07: First Signal Preview**

```
Headline: "ऐसा दिखेगा आपका daily signal"
Sub: "कल सुबह 6:30 AM पर आपके WhatsApp पर यही आएगा"

DEMO SIGNAL CARD:
  Realistic WhatsApp message simulation (using real message template format)
  Customised with:
  - User's selected district (Gorakhpur / Deoria etc.)
  - Tomorrow's date
  - Simulated price data (clearly marked as demo)
  - "आज बेचें ✓" signal (positive for demo — creates positive association)
  
  DEMO badge: "यह Demo है — असली signal कल मिलेगा"
  
  P10/P50/P90 mini-explanation (collapsible):
    "P10/P50/P90 का मतलब?"
    Brief explainer: "P50 = most likely price. P10 = minimum likely. P90 = maximum likely."

WHAT ELSE YOU GET:
  3 mini-cards (icons + labels):
  📊 "App में 7-day chart देखें"
  🧮 "Batch profit calculate करें"  
  🔔 "HPAI alert अगर आए"

CTA: "समझ गया, आगे →"
```

**OB-08: App Download (Skippable)**

```
Headline: "App download करें — और features पाएं"
Sub: "WhatsApp signal तो मिलेगा ही — app से और ज़्यादा मिलेगा"

APP vs WHATSAPP COMPARISON TABLE:
  | Feature | WhatsApp | App |
  |---------|----------|-----|
  | Daily sell signal | ✓ | ✓ |
  | 7-day forecast chart | ✗ | ✓ |
  | Batch profit calculator | ✗ | ✓ |
  | Middleman price check | ✗ | ✓ |
  | Offline access | ✗ | ✓ (cached) |
  | Historical prices | ✗ | ✓ |

APP DOWNLOAD BUTTONS:
  [Google Play Store] (primary — Android dominant in segment)
  [Apple App Store] (secondary)
  
  QR code (for desktop users or sharing)
  
  Deep link fallback: if no Play Store, direct APK download link

SKIP: "WhatsApp ही काफ़ी है → बाद में app लूँगा" — clearly visible, NOT hidden
Analytics: fire app_download_initiated or app_download_skipped
```

**OB-09: Referral Source**

```
Headline: "हमारे बारे में कैसे पता चला?"
Sub: "यह जानकारी optional है — हमें बेहतर बनाने में मदद करती है"

OPTIONS (tap one, radio card style):
  🌾 "किसी किसान दोस्त से" (referral — if so, show referral code field)
  📱 "WhatsApp group / Forward से"
  🔍 "Google / Search से"
  📺 "YouTube / Social Media से"
  🗞️ "Newspaper / Magazine से"
  🏪 "Feed dealer / Vet से"
  📞 "PoultryPulse team से call आई"
  🤔 "याद नहीं"

If "किसी किसान दोस्त से" selected:
  Referral code field appears: "Referral code डालें (optional)"
  Validates against Supabase referral_codes table
  Valid code: "✓ code valid है — आपका trial 30 दिन का हो गया!" (instead of 14)

SKIP: "→ Skip" (text link, always visible)
CTA: "आगे →"
```

**OB-10: Success Screen**

```
VISUAL: Celebrating Pullu illustration (wings raised, confetti sparkles)
        Confetti animation (CSS particles, Framer Motion — 60fps, 3s then stops)

HEADLINE:
  Hi: "🎉 बधाई हो! आप तैयार हैं!"
  En: "Congratulations! You're all set!"
  Style: display-large, brandGreen700, text-center, Sora font

WHAT HAPPENS NEXT (timeline cards):
  Tonight: "हम आपकी farm का data setup कर रहे हैं"
  Tomorrow 4:30 AM: "47 sources से data collection होगा"
  Tomorrow 6:00 AM: "AI prediction तैयार होगा"
  Tomorrow 6:30 AM: "WhatsApp पर आपका पहला signal 🐔"

YOUR SUMMARY CARD (brandGreen50 background):
  Plan: PulseFarm (14-day free trial)
  District: Gorakhpur
  Signal time: 6:30 AM daily
  WhatsApp: +91-XXXXX XXXXX
  Trial ends: [date 14 days from now]

REFERRAL TEASER (subtle, not pushy):
  "दोस्तों को बताएं — ₹500 पाएं →" → /refer
  "आप + आपका दोस्त दोनों को फ़ायदा"

PRIMARY CTA:
  If app downloaded: "App खोलें →" (deep links to app)
  If app NOT downloaded: "Dashboard देखें →" → /dashboard/overview (for S2+)
  If S1 and no app: "App download करें →" → Play Store

SECONDARY:
  "WhatsApp पर जाएं →" (opens WhatsApp)
  
Analytics: fire onboarding_completed, trial_started, plan_activated
```

---

## 3. ONBOARDING TECHNICAL REQUIREMENTS

### 3.1 State Machine Implementation

```typescript
// apps/web/lib/onboarding/stateMachine.ts

type OnboardingStep = 
  | 'OB-01' | 'OB-02' | 'OB-03' | 'OB-04' | 'OB-05'
  | 'OB-06' | 'OB-07' | 'OB-08' | 'OB-09' | 'OB-10';

interface OnboardingState {
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  data: {
    district?: string;
    flockRange?: string;
    batchesPerYear?: 2 | 3 | 4;
    farmType?: 'independent' | 'integrator';
    integratorName?: string;
    planConfirmed?: 'PULSE_FARM' | 'PULSE_PRO' | 'PULSE_INTEL';
    whatsappVerified?: boolean;
    appDownloaded?: boolean;
    referralSource?: string;
    referralCode?: string;
  };
  trialDurationDays: 14 | 30; // 30 if valid referral code
}

// State persisted in Supabase customer_onboarding_state table
// AND localStorage (for resume on refresh)

// CURRENCY IMMUTABILITY GATE (P0 BLOCKER from PRD):
// Once planConfirmed is set AND OB-05 submitted:
//   → customer_plan field in Supabase is LOCKED
//   → Cannot be changed via API without admin override
//   → UI shows locked plan in settings

function getNextStep(current: OnboardingStep, data: OnboardingState['data']): OnboardingStep {
  const steps: OnboardingStep[] = ['OB-01','OB-02','OB-03','OB-04','OB-05','OB-06','OB-07','OB-08','OB-09','OB-10'];
  const currentIndex = steps.indexOf(current);
  return steps[currentIndex + 1] ?? 'OB-10';
}

// Resume: on /onboarding load, check Supabase for existing state
// If OB-05 completed → resume from last incomplete step
// If OB-10 completed → redirect to dashboard
```

### 3.2 Data Persistence

```typescript
// apps/web/app/api/onboarding/state/route.ts

// GET: returns current onboarding state for authenticated user
// POST: updates specific step data and marks step completed
// PATCH: update single field (e.g., whatsappVerified=true)

// Table: customer_onboarding_state
// {
//   customer_id: uuid (FK → customers.id)
//   current_step: text
//   completed_steps: text[]
//   district: text
//   flock_range: text
//   batches_per_year: integer
//   farm_type: text
//   plan_confirmed: text
//   plan_locked_at: timestamptz  ← CURRENCY IMMUTABILITY GATE
//   whatsapp_verified: boolean
//   app_downloaded: boolean
//   referral_source: text
//   referral_code: text
//   trial_duration_days: integer (14 or 30)
//   started_at: timestamptz
//   completed_at: timestamptz
// }
```

### 3.3 Onboarding Page Component Architecture

```typescript
// apps/web/app/(auth)/onboarding/page.tsx
// 'use client' — needs full interactivity

// Structure:
// <OnboardingProvider>        ← state + dispatch
//   <OnboardingLayout>        ← card + progress bar + back button
//     <AnimatePresence mode="wait">
//       {currentStep === 'OB-01' && <WelcomeStep />}
//       {currentStep === 'OB-02' && <LocationStep />}
//       {currentStep === 'OB-03' && <FlockSizeStep />}
//       {currentStep === 'OB-04' && <FarmTypeStep />}
//       {currentStep === 'OB-05' && <PlanConfirmStep />}
//       {currentStep === 'OB-06' && <WhatsAppStep />}
//       {currentStep === 'OB-07' && <PreviewStep />}
//       {currentStep === 'OB-08' && <AppDownloadStep />}
//       {currentStep === 'OB-09' && <ReferralSourceStep />}
//       {currentStep === 'OB-10' && <SuccessStep />}
//     </AnimatePresence>
//   </OnboardingLayout>
// </OnboardingProvider>

// Step transition: slide + fade (same as OTP screen transition)
// Direction: forward = slide left→right, back = slide right→left
```

---

## 4. LOGIN PAGE (`/login`)

```
LAYOUT: Identical to sign-up card (440px max-width, centered, green bg)

HEADLINE: "वापस आएं" / "Welcome back"
SUB: "अपना registered WhatsApp number डालें"

PHONE INPUT: Same as signup (no +91 prefix complexity — same component)

NO consent checkbox (already consented at signup — DPDP §7(4) re-use provision)

CTA: "OTP भेजें →" → same OTP screen as signup (reuse component)

BOTTOM LINK: "Account नहीं है? → Free trial शुरू करें" → /signup

POST-LOGIN REDIRECT LOGIC:
  1. onboarding_completed = false → /onboarding (resume from last step)
  2. segment = 'S1' → /dashboard/mobile-only
  3. segment in ['S2','S3','S4','S5','S6'] → /dashboard/overview
  4. role = 'admin' → /dashboard/accuracy
  5. ?redirect= param → that URL (XSS-safe: validate same-origin only)
```

---

## 5. PASSWORD RESET / ACCOUNT RECOVERY

```
NOTE: No passwords in Phase 0 (OTP-only auth). "Reset" = request new OTP.

If user says "I can't receive OTP":
  Support flow → WhatsApp message to support number
  Not automated — manual verification by team
  This is acceptable for Phase 0 scale (<500 customers)

Phase 1: Consider TOTP (authenticator app) as 2FA option for S2+ dashboard access
```

---

## 6. SESSION MANAGEMENT

### 6.1 Session Configuration

```typescript
// Supabase session config
// apps/web/utils/supabase/server.ts

const supabase = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    cookies: {
      // Secure, httpOnly, SameSite=Lax
      // Max age: 7 days for S1 (mobile-primary)
      // Max age: 1 day for admin (security)
    }
  }
);
```

### 6.2 Session Expiry UX

```
Detection: SWR revalidation returns 401 → triggers session expiry modal

MODAL DESIGN:
  NOT a full page redirect (would lose user's work in dashboard)
  
  Modal content:
    Illustration: Thinking Pullu (clock expression)
    Headline: "आपका session expire हो गया है"
    Sub: "सुरक्षा के लिए session बंद हो गया — दोबारा login करें"
    
    CTA: "Login करें →" (opens in same tab, ?redirect=current URL)
    Cancel: "बाद में" (closes modal, user sees stale data with "session expired" banner)
    
  Do NOT: auto-redirect without warning (destroys user trust)
  Do NOT: show raw 401 error text
  
Session expiry banner (if user dismisses modal):
  "⚠ Session expire हो गया — " [Login करें] button
  Sticky at top of dashboard header
```

---

## 7. ONBOARDING TASK LIST (Kiro Tasks)

| ID | Task | File | Priority | Est. Hours |
|----|------|------|----------|-----------|
| OB-01 | OnboardingProvider + state machine | lib/onboarding/stateMachine.ts | 🔴 P0 | 6h |
| OB-02 | Onboarding root page + layout | app/(auth)/onboarding/page.tsx | 🔴 P0 | 4h |
| OB-03 | WelcomeStep (OB-01) | components/onboarding/WelcomeStep.tsx | 🔴 P0 | 2h |
| OB-04 | LocationStep (OB-02) | components/onboarding/LocationStep.tsx | 🔴 P0 | 3h |
| OB-05 | FlockSizeStep (OB-03) | components/onboarding/FlockSizeStep.tsx | 🔴 P0 | 3h |
| OB-06 | FarmTypeStep (OB-04) | components/onboarding/FarmTypeStep.tsx | 🔴 P0 | 2h |
| OB-07 | PlanConfirmStep (OB-05) + currency gate | components/onboarding/PlanConfirmStep.tsx | 🔴 P0 | 4h |
| OB-08 | WhatsAppStep (OB-06) + test message API | components/onboarding/WhatsAppStep.tsx | 🔴 P0 | 4h |
| OB-09 | PreviewStep (OB-07) | components/onboarding/PreviewStep.tsx | 🔴 P0 | 3h |
| OB-10 | AppDownloadStep (OB-08) | components/onboarding/AppDownloadStep.tsx | 🟡 P1 | 3h |
| OB-11 | ReferralSourceStep (OB-09) | components/onboarding/ReferralSourceStep.tsx | 🟡 P1 | 3h |
| OB-12 | SuccessStep (OB-10) + confetti | components/onboarding/SuccessStep.tsx | 🔴 P0 | 4h |
| OB-13 | OTP Input (6 boxes) component | components/auth/OTPInput.tsx | 🔴 P0 | 4h |
| OB-14 | Phone input component | components/auth/PhoneInput.tsx | 🔴 P0 | 3h |
| OB-15 | Onboarding state API (GET/POST/PATCH) | app/api/onboarding/state/route.ts | 🔴 P0 | 4h |
| OB-16 | WhatsApp test message API | app/api/onboarding/whatsapp-test/route.ts | 🔴 P0 | 2h |
| OB-17 | Session expiry modal | components/auth/SessionExpiryModal.tsx | 🔴 P0 | 2h |
| OB-18 | Login page | app/(auth)/login/page.tsx | 🔴 P0 | 3h |
| OB-19 | Signup page | app/(auth)/signup/page.tsx | 🔴 P0 | 4h |

**Total: ~63h for auth + onboarding**

---

## 8. QA CHECKLIST — AUTH & ONBOARDING

```
SIGN-UP:
  □ Phone input: accepts only 10-digit starting 6-9
  □ Space auto-inserted after 5th digit
  □ Consent checkbox: unchecked by default
  □ Submit disabled until phone valid + consent checked
  □ OTP sent to correct number (verify via Twilio logs)
  □ OTP boxes: auto-advance, paste, backspace all work
  □ OTP countdown: runs correctly, resend activates at 0:00
  □ Wrong OTP: shake animation + error message + try count
  □ 5 wrong attempts: locked out for 30 minutes
  □ Successful OTP: redirects to /onboarding
  □ Analytics events fire at each stage

ONBOARDING:
  □ All 10 steps render correctly in sequence
  □ Progress bar updates correctly on each step
  □ Back navigation works (state preserved)
  □ Browser back button intercepted (doesn't navigate away)
  □ OB-02: District selection clears and reselects correctly
  □ OB-03: Flock range and batch count save correctly
  □ OB-05: Currency immutability gate triggers on plan confirmation
  □ OB-05: Plan cannot be changed after OB-05 submit via any API call
  □ OB-06: Test WhatsApp message delivers within 30 seconds
  □ OB-09: Valid referral code extends trial to 30 days
  □ OB-10: Confetti animation runs exactly once (not looping)
  □ Full onboarding resumes from correct step on page refresh
  □ Completed onboarding redirects to /dashboard correctly
  □ Hindi text renders without clipping at all steps

ACCESSIBILITY:
  □ Tab order: phone → consent → submit → login link
  □ OTP boxes: keyboard navigable (tab through, backspace goes back)
  □ Error messages announced by screen reader (role="alert")
  □ Focus: returns to first OTP box on error clear
  □ Progress bar: aria-valuenow/valuemax updated on each step
  □ District cards: proper radio group semantics
  □ Flock size options: proper radio group semantics
  □ Success animation: pauses with prefers-reduced-motion

MOBILE (390px viewport):
  □ Card fits without horizontal scroll
  □ Phone keyboard doesn't obscure OTP boxes (scroll into view)
  □ OTP boxes: minimum 44px touch target
  □ All CTAs: minimum 52px height
  □ "Skip" and "Back" links: minimum 44px touch target
```

---

*Document: 10_auth_onboarding_design_master.md*
*Next: 11_industry_pages_design_master.md*
