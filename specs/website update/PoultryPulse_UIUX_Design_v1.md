**PoultryPulse AI — UI/UX Design Specification**    |    CONFIDENTIAL    |    v1.0 · May 2026

**🐔 PoultryPulse AI**

**UI/UX Design Specification**

For Engineers & Designers · v1.0 · May 2026

|<p>**Author**</p><p>Senior Developer — 25+ yr (Apple Design Philosophy)</p>|<p>**Phase**</p><p>Phase 0 → Phase 1</p>|<p>**Platform**</p><p>Mobile-First (iOS/Android) + Web Dashboard</p>|<p>**Status**</p><p>DRAFT — Engineering Use</p>|
| :- | :- | :- | :- |

**CONFIDENTIAL — Engineering & Investor Use Only**


# **1. Design Philosophy — The Apple Lens**
PoultryPulse is built for a farmer managing ₹40–90L of annual business from an Android smartphone on a slow 4G connection while standing in a shed. Every design decision must survive that context. The following principles govern every screen, every interaction, every word of copy.

## **1.1 Core Design Principles**

|**Principle**|**Constraint**|**Design Rule**|
| :- | :- | :- |
|Clarity Over Density|Farmer scans UI in 3 seconds max|ONE primary number per screen. No dashboards. The price is the product.|
|Offline-First|UP rural 4G = 2–8 Mbps, drops frequently|Every critical screen works offline. Stale data shown with timestamp, never silently.|
|Hindi-Primary|Target user is Hindi-speaking, non-tech|All UI copy in Hindi. English only for technical admin/B2B screens.|
|Thumb-Reachable|Single-hand phone use in fields|All primary actions within bottom 60% of screen. No top-corner critical buttons.|
|Trust Through Precision|One wrong prediction = churn|Confidence intervals always shown. Never display a number without context.|
|Friction = Revenue Loss|Farmer will not retry if confused|Max 2 taps to reach today's price forecast from app launch.|

## **1.2 Design System Tokens**
All components reference these tokens. No hardcoded colours or sizes in any component file.

|**Token Category**|**Token Name**|**Value**|**Usage**|
| :- | :- | :- | :- |
|Colour|brand-green-700|#1A6B3C|Primary CTA, active states, trust indicators|
|Colour|brand-green-50|#E8F5EE|Background tints, info cards|
|Colour|amber-500|#F5A623|Sell signal, alert highlights|
|Colour|red-600|#C0392B|Disease alerts, price drops, critical warnings|
|Colour|neutral-900|#1C2B22|Primary text|
|Colour|neutral-400|#7A9C8A|Secondary text, labels|
|Colour|white|#FFFFFF|Card backgrounds, screen backgrounds|
|Typography|font-display|Noto Sans Devanagari Bold|Headlines, price numbers (Hindi)|
|Typography|font-body|Noto Sans Devanagari Regular|Body copy (Hindi)|
|Typography|font-mono|SF Mono / Roboto Mono|API responses, dev/admin screens|
|Spacing|space-4|16dp|Standard card padding|
|Spacing|space-6|24dp|Section margins|
|Spacing|space-2|8dp|Tight internal padding|
|Radius|radius-card|12dp|All cards and panels|
|Radius|radius-pill|999dp|Tags, badges, small chips|
|Elevation|shadow-card|0 2px 12px rgba(0,0,0,0.08)|Card lift above background|
|Motion|ease-standard|cubic-bezier(0.4,0,0.2,1)|All transitions — 220ms max|

## **1.3 Typography Scale (Hindi-First)**
Noto Sans Devanagari is mandatory for all Hindi text — it is the only font with verified rendering for Devanagari numerals and conjuncts on Android 8+. Do not substitute.

|**Style Name**|**Font**|**Size**|**Weight**|**Line Height**|**Usage**|
| :- | :- | :- | :- | :- | :- |
|display-price|Noto Sans Devanagari|56sp|Bold (700)|1\.0|Today's price — the hero number|
|display-label|Noto Sans Devanagari|20sp|Medium (500)|1\.2|Unit label below price (₹/kg)|
|heading-1|Noto Sans Devanagari|28sp|SemiBold (600)|1\.25|Section titles|
|heading-2|Noto Sans Devanagari|22sp|SemiBold (600)|1\.3|Card headers|
|body-1|Noto Sans Devanagari|17sp|Regular (400)|1\.5|Explanatory text, driver bullets|
|body-2|Noto Sans Devanagari|15sp|Regular (400)|1\.5|Secondary info, timestamps|
|caption|Noto Sans Devanagari|13sp|Regular (400)|1\.4|Data source labels, metadata|
|button|Noto Sans Devanagari|18sp|Bold (700)|1\.0|All interactive buttons|
|badge|Noto Sans Devanagari|12sp|Medium (500)|1\.0|Tags, status chips|


# **2. Information Architecture**
PoultryPulse has three distinct surfaces: the Mobile App (primary), the WhatsApp Channel (secondary/passive), and the Web Dashboard (B2B/admin). Each surface has a strict scope. Features must not bleed across surfaces without explicit product decision.

## **2.1 Mobile App — Navigation Structure**
The mobile app uses a bottom tab bar with exactly 4 tabs. No more — cognitive overload is the enemy. Tabs are gesture-navigable (swipe) and maintain scroll position across tab switches.

|**Tab #**|**Tab Label (Hindi)**|**Icon**|**Primary Screen**|**Secondary Screens**|
| :- | :- | :- | :- | :- |
|1|आज का भाव (Today's Price)|chart-line|Price Forecast Hero Screen|Price History (30-day chart), District Selector|
|2|बेचें कब? (When to Sell?)|calendar-check|Sell Signal Screen|Batch Profit Calculator, Optimal Window Picker|
|3|बाज़ार समाचार (Market News)|newspaper|Alert Feed (disease, weather, policy)|Middleman Check Tool, Feed Price Tracker|
|4|मेरा खाता (My Account)|user-circle|Subscription Status, Alerts Settings|Notification Prefs, Support, Logout|

## **2.2 Web Dashboard — Navigation Structure**
The Web Dashboard is for integrators (S2), enterprise (S5), and admin/data-head roles. It uses a left sidebar navigation — standard B2B SaaS pattern. Not accessible to S1 (PulsePro) farmers; they use mobile only.

|**Nav Section**|**Sub-Pages**|**Who Sees It**|**Primary Content**|
| :- | :- | :- | :- |
|Overview|—|All B2B roles|MRR summary, prediction accuracy widget, district coverage map|
|Price Intelligence|Forecast, Historical, Download|All B2B roles|30-day chart, P10/P50/P90 bands, CSV export|
|Alerts|Active Alerts, History|All B2B roles|Disease, weather, policy alerts. Configurable thresholds.|
|Calculator|Batch Profit, Feed Cost|S2 Integrators|Multi-farm batch profit calculator, feed procurement timing|
|API Access|Keys, Usage, Docs|Enterprise (S5)|API key management, rate limit dashboard, Swagger docs link|
|Accuracy|MAPE Dashboard, Model Log|Admin only|30-day rolling MAPE, champion model details, retrain history|
|Customers|List, Usage, Billing|Admin only|Customer list, API call usage, subscription status|
|Settings|Profile, Notifications, Team|All roles|Account settings, alert channels, team member management|

## **2.3 WhatsApp Channel — Message Architecture**
WhatsApp is a passive, outbound channel. It is not a chatbot. It sends one structured message per day per customer at 6:30 AM IST, immediately after inference completes. No customer-initiated conversation handling in Phase 0.

|**Message Type**|**Trigger**|**Content Structure**|**Watermark Applied?**|
| :- | :- | :- | :- |
|Daily Sell Signal|06:30 IST, daily post-inference|Bold price, direction emoji, 3 driver lines (Hindi), confidence range, deep link to app|YES — ZWC in all text fields|
|HPAI Disease Alert|DAG detects new HPAI alert within 200km|RED flag emoji, district name, advisory (do not sell, hold), govt source link|YES — ZWC encoded|
|Weather Warning|IMD heat wave or cold wave alert for district|Heat/cold emoji, temperature, expected duration, protective action tip|YES — ZWC encoded|
|Subscription Expiry|3 days before expiry|Renewal reminder in Hindi, payment link, one-tap WhatsApp reply to renew|NO — no predictions|
|Onboarding Welcome|On successful OTP verification + subscription|Welcome message, what to expect, first forecast time, support contact|NO — no predictions|


# **3. Screen-by-Screen Specifications**
Each screen below is fully specified for engineers. Every element, state, action, and edge case is defined. Designers must produce Figma frames matching these specs before engineering begins. Engineers must not interpret ambiguous specs — raise a design question first.

## **3.1 Onboarding Flow**
### **Screen OB-01: Splash / App Launch**

|**Element**|**Spec**|**Notes**|
| :- | :- | :- |
|Background|brand-green-700 full bleed|Solid colour — no image. Loads instantly even on slow device.|
|Logo|White PoultryPulse wordmark + chicken icon, centred, 120×120dp|SVG asset. No rasterisation.|
|Tagline|"सटीक भाव, सही फ़ैसला" (Accurate price, right decision)|font: display-label, white, centred below logo|
|Duration|1\.5 seconds, then route to OB-02 or Home if token valid|Skip animation if phone is low-battery or reduce-motion enabled|
|Animation|Logo fades in 400ms ease-out. Tagline fades in 600ms with 200ms delay.|No parallax, no particle effects — performance first|

### **Screen OB-02: Phone Number Entry**

|**Element**|**Spec**|**Notes**|
| :- | :- | :- |
|Header|"PoultryPulse में आपका स्वागत है" (Welcome to PoultryPulse)|heading-1, neutral-900, top of content area (not full screen top)|
|Sub-header|"अपना मोबाइल नंबर दर्ज करें" (Enter your mobile number)|body-1, neutral-400|
|Phone Input|+91 prefix (non-editable) + 10-digit field. Numeric keyboard auto-opens.|Regex: /^[6-9]\d{9}$/. Show checkmark icon when valid. No character limit override.|
|CTA Button|"OTP भेजें" (Send OTP). Full-width, height 56dp, radius-pill, brand-green-700.|Disabled (grey) until 10 valid digits entered. Loading spinner on tap.|
|Legal Text|"जारी रखने पर आप हमारी गोपनीयता नीति और उपयोग की शर्तें स्वीकार करते हैं।"|caption, neutral-400, tappable → bottom sheet with full Hindi policy text|
|Error State|Invalid number: red border + "कृपया सही मोबाइल नंबर दर्ज करें" below field.|Error clears on next keypress. Do not show error before first submit attempt.|

### **Screen OB-03: OTP Verification**

|**Element**|**Spec**|**Notes**|
| :- | :- | :- |
|OTP Input|6 individual digit boxes, each 48×56dp, brand-green-700 border on focus.|Auto-advance on each digit. Backspace returns to previous box. Auto-paste from SMS.|
|Timer|"OTP 2:00 में समाप्त होगा" counting down. Turns red at <30s.|On expiry: show "OTP फिर भेजें" (Resend OTP) button. Max 3 resends.|
|Auto-verify|Auto-submit when 6th digit entered. No manual submit button needed.|Show loading state immediately after 6th digit.|
|Error State|Wrong OTP: shake animation on boxes, "गलत OTP. पुनः प्रयास करें" in red.|3 wrong attempts = lock screen for 10 minutes with countdown.|
|Success|Green checkmark fills boxes → 300ms → navigate to OB-04.|Haptic feedback on success (if device supports).|

### **Screen OB-04: Farm Profile Setup**

|**Field**|**Input Type**|**Options**|**Validation**|
| :- | :- | :- | :- |
|जिला (District)|Dropdown|Gorakhpur, Deoria, Kushinagar, Basti, Maharajganj, Sant Kabir Nagar|Required. Determines which mandi forecast is shown.|
|पक्षियों की संख्या (Flock Size)|Segmented control|10K–25K | 25K–50K | 50K–1L | 1L+|Required. Affects batch calculator defaults.|
|मुर्गियों का प्रकार (Poultry Type)|Segmented control|ब्रॉयलर (Broiler) | लेयर (Layer)|Required. Phase 0 is broiler-only; Layer shows "Coming Soon" badge.|
|नाम (Name)|Text field|Free text|Optional. Never required. Stored only in device local storage.|

## **3.2 Home — Price Forecast Hero Screen (Tab 1)**
This is the most important screen in the product. A farmer opens the app for one reason: to know today's price. Everything on this screen serves that goal. Resist the urge to add more information.

|**Zone**|**Content**|**Height (approx)**|**Design Rules**|
| :- | :- | :- | :- |
|Status Bar Zone|System status bar — no custom content|24dp|Use light status bar (white icons) on brand-green-700 backgrounds.|
|District + Date Bar|"गोरखपुर · आज, 16 मई" + district change icon (right)|56dp|Tap district name → bottom sheet district selector. Subtle brand-green-700 background.|
|Price Hero Card|P50 price in display-price. "₹/kg" label below. Direction arrow + % change vs yesterday.|200dp|Card is white on brand-green-50 background. Drop shadow-card. The number must be the biggest element on screen by far.|
|Confidence Range|"₹155 – ₹168 के बीच (80% संभावना)" — shown below price|48dp|body-2, neutral-400. Always visible. Never hide.|
|Sell Signal Badge|"आज बेचें ✓" (Sell Today) or "रुकें" (Wait) or "सावधान" (Caution)|44dp|Green pill for sell, amber for wait, red for caution. Bold font. Tappable → Sell Signal screen.|
|Price Drivers|3 bullet points: top factors driving today's price (Hindi, from Claude API)|120dp|Each bullet = icon + one-line Hindi sentence. No more than 3 lines each. body-2.|
|7-Day Trend Sparkline|Mini line chart: last 7 days actual + next 7 days forecast (dashed)|140dp|Recharts/Victory Native. Actual = solid green. Forecast = dashed amber. Today = vertical marker.|
|Last Updated|"अंतिम अपडेट: आज 06:12 AM" + staleness warning if >24h|32dp|caption, neutral-400. If stale: "⚠ डेटा पुराना है" in amber.|
|Bottom Nav|4 tabs as specified in Section 2.1|60dp|Safe area aware. Tab bar always visible.|

|**CRITICAL**|The price hero card must render within 200ms of screen load using cached data. Never show a loading spinner on the price — show the last cached price immediately and update when fresh data arrives. "No price" state must never be the default experience.|
| :-: | :- |

## **3.3 Sell Signal Screen (Tab 2)**

|**Component**|**Content**|**Interaction**|
| :- | :- | :- |
|Batch Age Selector|"आपके झुंड की उम्र क्या है?" Slider: 28–56 days. Current selection highlighted.|Sliding updates the recommendation in real-time. No submit button needed.|
|Recommendation Card|Large card: "अभी बेचें — अगले 3 दिन में बेहतरीन भाव" OR "5 दिन रुकें — भाव ऊपर जा सकता है"|Tapping card → full explanation bottom sheet|
|Profit Calculator|Quick calc: झुंड × avg weight × today's P50 = estimated gross. Pre-filled from profile.|Editable fields. Updates instantly on change. Shows ₹ value prominently.|
|Optimal Window Chart|14-day forecast bar chart. Green bars = good days to sell. Amber = caution. Red = avoid.|Tapping a bar → that day's forecast detail bottom sheet.|
|Middleman Check|Input: "आपको क्या भाव मिल रहा है?" Tap = compare vs mandi benchmark.|Returns: "उचित भाव है" / "कम भाव है — ₹X ज़्यादा माँगें" / "ज़्यादा भाव है" with context.|

## **3.4 Alert Feed Screen (Tab 3)**

|**Alert Type**|**Visual Treatment**|**Content Fields**|**Action**|
| :- | :- | :- | :- |
|HPAI Disease Alert|Red card, left border 4dp red, bell-alert icon|District, date detected, severity, govt advisory link|Tap → detail bottom sheet with actionable steps|
|Heat Wave Warning|Amber card, thermometer icon|District, expected dates, peak temp, poultry mortality risk note|Tap → shed management tips bottom sheet|
|Price Crash Warning|Red card, trending-down icon|District, expected drop %, cause analysis, recommended action|Tap → sell signal screen with pre-populated analysis|
|Feed Cost Alert|Amber card, wheat icon|Maize/soya price change %, impact on feed cost, procurement advice|Tap → feed cost detail with 30-day trend|
|Policy/Regulatory|Blue card, gavel icon|Policy name, affected area, date effective, source link|Tap → external browser (govt link)|
|No Alerts State|Green card: "आज कोई चेतावनी नहीं — सब ठीक है"|—|Show last checked timestamp|


# **4. Web Dashboard — B2B UI Specification**
The web dashboard is for integrators, enterprise clients, and internal admin. It is desktop-first (1280px minimum) with tablet-responsive layout (768px+). Mobile web is not supported — redirect to the mobile app.

## **4.1 Dashboard Overview Page**

|**Widget**|**Data Source**|**Refresh**|**Display Spec**|
| :- | :- | :- | :- |
|Price Intelligence Hero|ML inference API, cached|Daily 06:15 IST|P10/P50/P90 for next 7 days as area chart. Band width = confidence. Recharts AreaChart.|
|Accuracy KPI Card|model\_registry table|Daily|30-day MAPE + directional accuracy. Green if within target. Red if breached. Prominent font-size 36px.|
|District Coverage Map|predictions table, static GeoJSON|Daily|India map (react-simple-maps), Gorakhpur belt highlighted. Popup on hover: district stats.|
|Active Alerts Banner|alerts table|Real-time (Supabase Realtime)|Dismissible top banner. Red for HPAI, Amber for weather. Z-index above all content.|
|Model Status|model\_registry, accuracy\_log|Daily|Champion model version, last retrain, champion/challenger result. Table widget.|

## **4.2 Price Intelligence Page**

|**Component**|**Library**|**Interaction**|**Data Contract**|
| :- | :- | :- | :- |
|30-Day Historical + Forecast Chart|Recharts ComposedChart|Zoom by drag. Tooltip on hover. Toggle P10/P90 bands.|GET /api/v2/forecast/enterprise. Response: {date, p10, p50, p90, model\_version}[]|
|District Selector|Custom multi-select pill group|Toggle districts on/off. Max 6 in Phase 0.|Filters chart data in-memory after fetch. No new API call per toggle.|
|Date Range Picker|react-day-picker|Presets: Last 7D, 30D, 90D, Custom.|Modifies API query params: ?from=&to=. Max range: 180 days.|
|CSV Export|Client-side (papaparse)|Button triggers download. No API call.|Exports currently displayed data as PoultryPulse\_Forecast\_[date].csv|
|Drivers Panel|Accordion list|Expandable per-week driver summary.|GET /api/v2/forecast/enterprise includes drivers[] array per prediction.|

## **4.3 Accuracy Dashboard (Admin Only)**

|**Component**|**Spec**|**Alert Condition**|
| :- | :- | :- |
|30-Day MAPE Trend|Line chart, daily MAPE value. Green zone <6%, Amber 6–8%, Red >8%.|Slack alert if crosses into Red zone for 2+ consecutive days.|
|Directional Accuracy|Large gauge widget (Recharts RadialBarChart). Target: >95%.|Alert if drops below 92% for 3 consecutive days.|
|Conformal Coverage|Bar chart per stated confidence level. Target: 78–82% for 80% intervals.|Alert if coverage drifts outside 75–85% range.|
|Champion vs Challenger Table|Last 5 challenger evaluations. Promoted/Rejected status badge.|No automated alert — for data head manual review.|
|Feature Importance Chart|Horizontal bar chart, SHAP values. Top 10 features.|Alert if feed\_cost\_lag42 drops out of top-3 features (data alignment signal).|


# **5. Component Library — Engineer Reference**
All components live in /components/ui/ (web) and /components/ (mobile). No duplicated styles. No magic numbers. Every component uses design tokens from Section 1.2.

## **5.1 Mobile Components (React Native / Expo)**

|**Component**|**File**|**Props**|**States**|
| :- | :- | :- | :- |
|PriceHeroCard|PriceHeroCard.tsx|price: number, p10: number, p90: number, direction: "up"|"down"|"flat", lastUpdated: Date|loading | fresh | stale (>24h)|
|SellSignalBadge|SellSignalBadge.tsx|signal: "sell"|"wait"|"caution", label: string|Default | pressed (scale 0.96)|
|DriversAccordion|DriversAccordion.tsx|drivers: {icon: string, text: string}[]|Collapsed (shows 1) | Expanded (shows 3)|
|SparklineChart|SparklineChart.tsx|actual: DataPoint[], forecast: DataPoint[], today: Date|Loading skeleton | Rendered | Error (empty state)|
|AlertCard|AlertCard.tsx|type: AlertType, title: string, body: string, action?: () => void|Unread (bold border) | Read | Dismissed|
|OTPInput|OTPInput.tsx|length: 6, onComplete: (otp: string) => void|Idle | Focused | Error | Success | Locked|
|DistrictSelector|DistrictSelector.tsx|districts: District[], selected: string, onChange: fn|Bottom sheet, searchable|
|ProfitCalculator|ProfitCalculator.tsx|flockSize: number, agedays: number, price: number|Editable | Read-only (cached price)|
|LoadingSkeleton|LoadingSkeleton.tsx|shape: "card"|"list"|"chart", count?: number|Shimmer animation, matches card dimensions|
|EmptyState|EmptyState.tsx|icon, title, body, action?|Used for no-alerts, no-data, error states|

## **5.2 Web Components (React / Next.js)**

|**Component**|**File**|**Library Dependencies**|**Notes**|
| :- | :- | :- | :- |
|ForecastChart|ForecastChart.tsx|Recharts ComposedChart, date-fns|P10/P50/P90 bands. Responsive container. Tooltip custom styled.|
|AccuracyGauge|AccuracyGauge.tsx|Recharts RadialBarChart|Colour thresholds: green <6% MAPE, amber 6–8%, red >8%.|
|DistrictMap|DistrictMap.tsx|react-simple-maps, topojson|India GeoJSON. Choropleth by prediction availability.|
|AlertBanner|AlertBanner.tsx|Supabase Realtime subscription|Dismissible. Z-index: 9999. Auto-dismiss info alerts after 8s.|
|DataTable|DataTable.tsx|TanStack Table v8|Sortable, filterable, paginated. CSV export built in.|
|ModelStatusCard|ModelStatusCard.tsx|SWR for polling|Polls /api/v1/admin/accuracy every 5min. Shows champion model details.|
|ApiKeyManager|ApiKeyManager.tsx|Clipboard API|Key revealed once on generation. Copy button. Rotate/revoke actions.|
|SidebarNav|SidebarNav.tsx|Next.js router|Role-based: admin sees all. Enterprise sees API Access. Farmer sees nothing (mobile only).|

## **5.3 Accessibility Requirements**
PoultryPulse must meet WCAG 2.1 AA as minimum. Specific requirements given the Hindi-primary, lower-literacy audience:

- All interactive elements minimum 48×48dp touch target (WCAG 2.5.5). This is non-negotiable for field use.
- Colour is never the sole indicator — always pair with icon or text label (e.g., "sell signal green" also has ✓ icon and "बेचें" text).
- Font size never below 13sp on mobile. body-2 is the minimum for any content a user needs to act on.
- All chart data available in accessible table format as alt-content (screen reader users).
- OTP input supports SMS auto-fill (iOS/Android system) — do not block clipboard paste.
- Offline state is always communicated with timestamp — never silently serve stale data.


# **6. Critical User Flows**
The following flows are the highest-priority paths in the product. Engineers must implement these exactly as specified. Deviation must be reviewed by product before implementation.

## **6.1 Flow: New User Onboarding → First Price View**

|**Step**|**Screen**|**User Action**|**System Response**|**Max Time**|
| :- | :- | :- | :- | :- |
|1|OB-01 Splash|(Auto)|Show splash 1.5s → navigate to OB-02|1\.5s|
|2|OB-02 Phone Entry|Enter 10-digit number, tap "OTP भेजें"|Validate format, call /api/v1/auth/otp-request, show loading, navigate to OB-03|< 3s|
|3|OB-03 OTP Verify|Enter 6-digit OTP (auto-populated from SMS)|Verify OTP, generate JWT, store in secure storage, navigate to OB-04|< 2s|
|4|OB-04 Farm Profile|Select district, flock size, poultry type. Tap "शुरू करें"|Store profile locally + Supabase customers table. Fetch first forecast.|< 1s submit|
|5|Home — Tab 1|(Auto-navigate)|Render price hero card from fetched forecast. Show sparkline. Show sell signal.|< 200ms render|

## **6.2 Flow: Farmer Checks Price and Makes Sell Decision**

|**Step**|**User Action**|**Screen**|**System Behaviour**|
| :- | :- | :- | :- |
|1|Open app (returning user)|Splash → Home|Render cached price in <200ms. Background refresh if >1h since last fetch.|
|2|Read sell signal badge|Home — Tab 1|Badge shows "आज बेचें", "रुकें", or "सावधान". Farmer reads in 3 seconds.|
|3|Tap sell signal badge|Sell Signal Screen|Navigate to Tab 2. Show sell window chart pre-filled for farmer's district.|
|4|Adjust batch age slider|Sell Signal Screen|Recommendation updates in real-time as slider moves. No API call — computed from cached forecast.|
|5|Check middleman price|Sell Signal Screen|Enter offered price. Tap "जाँचें". Returns benchmark comparison in <500ms.|
|6|Return to WhatsApp|Exit app|App state persisted. Next open resumes at same tab. Background refresh continues.|

## **6.3 Flow: Admin Reviews Model Accuracy**

|**Step**|**Navigation**|**Action**|**System Response**|
| :- | :- | :- | :- |
|1|Web Dashboard → Accuracy|Click Accuracy in sidebar|Load accuracy dashboard. Fetch from /api/v1/admin/accuracy.|
|2|Review MAPE trend chart|Hover over date points|Tooltip shows: date, MAPE%, directional accuracy %, model version for that day.|
|3|Check feature importance|Click "Feature Importance" tab|SHAP bar chart loads. Verify feed\_cost\_lag42 in top 3.|
|4|Review champion/challenger|Scroll to model registry table|Last 5 evaluations: challenger MAPE, champion MAPE, result (promoted/rejected), reason.|
|5|Export accuracy report|Click "Export CSV" button|Download 30-day accuracy log as CSV. No server call.|


# **7. States, Error Handling & Edge Cases**
Every screen must handle every state. Undefined behaviour is a bug. The following table covers every engineer-relevant edge case.

|**Scenario**|**Screen(s) Affected**|**User-Facing Behaviour**|**Technical Handling**|
| :- | :- | :- | :- |
|No internet connection|Home, Sell Signal, Alert Feed|Show cached data with offline banner: "आप ऑफलाइन हैं — अंतिम डेटा दिखाया जा रहा है [time]"|AsyncStorage cache. Check cache age — show stale warning if >24h.|
|ML inference service down|Home, Sell Signal|Show last forecast with: "⚠ आज का भाव अभी उपलब्ध नहीं — कल का भाव दिखाया जा रहा है"|Circuit breaker in FastAPI. API returns 503 with last\_known\_forecast in body.|
|Stale data (>24h)|Home|Amber staleness banner: "डेटा 28 घंटे पुराना है — ताज़ा करें"|AsyncStorage TTL check on app foreground. Background refresh attempt.|
|OTP not received|OB-03 OTP Verify|"OTP नहीं आया? 2 मिनट बाद पुनः भेजें" button appears after 60s.|Twilio delivery receipt monitoring. Max 3 resends.|
|Device fingerprint mismatch|Any authenticated screen|"नया डिवाइस पहचाना गया — OTP से सत्यापित करें" → OTP flow re-triggered.|403 from API. Client catches and routes to OTP re-verification.|
|Subscription expired|Home, Sell Signal|Price blurred/hidden. Renewal CTA: "आपकी सदस्यता समाप्त हो गई है — नवीनीकरण करें"|JWT tier claim = expired. API returns 402 Payment Required.|
|AGMARKNET data missing|Home price card|"आज गोरखपुर मंडी का डेटा उपलब्ध नहीं — कल का भाव दिखाया जा रहा है"|staleness\_flag = true in API response. Client shows warning.|
|Model accuracy below threshold|Admin Accuracy Dashboard|Red alert banner in admin dashboard. No farmer-facing change.|dag\_accuracy\_monitor fires Slack alert. Admin investigates. Farmer service continues with champion.|
|HPAI alert in district|Alert Feed, Home|Red banner on home screen (overrides normal state). Alert feed shows at top.|Supabase Realtime push to mobile client. FCM notification sent via Expo Notifications.|
|Price outside valid range|Home price card|Show prediction with warning: "असामान्य भाव — कृपया स्थानीय मंडी से जाँचें"|API flag: prediction\_outside\_range = true. Client shows caution icon.|


# **8. Performance Budgets — Non-Negotiable**
Performance is a feature. For a farmer on 4G in rural UP, a slow app is an unusable app. These budgets are enforced via CI/CD gates. PRs that breach these budgets are blocked until fixed.

|**Metric**|**Target**|**Measurement Tool**|**CI Gate**|
| :- | :- | :- | :- |
|App Launch to Price Visible (cached)|< 200ms|Flipper / Perfetto trace|Automated UI test: measure time from app foreground to PriceHeroCard render|
|App Launch to Price Visible (fresh fetch)|< 2.5s on 4G|Network throttled Detox test|Throttle to 10 Mbps / 50ms latency. Run on CI.|
|OTP request to OTP received (Twilio)|< 8s P95|Twilio delivery webhook|Alert if P95 exceeds 10s. Not a CI gate (external service).|
|API response time /api/v1/forecast|< 300ms P95|Vercel Analytics / Sentry|Sentry performance alert if P95 exceeds 500ms.|
|ML inference latency|< 200ms P95|FastAPI /health + Railway metrics|Alarm if Railway P95 latency >250ms — auto-scale triggered.|
|Mobile JS bundle size|< 2MB (index bundle)|Expo bundle analyser|CI fails if bundle exceeds 2.5MB. Use dynamic imports for rarely-used screens.|
|Web dashboard initial load|< 3s LCP on 4G|Lighthouse CI|LCP < 3s, FID < 100ms, CLS < 0.1. Run Lighthouse in CI on every PR to main.|
|Offline capability|100% of read screens work offline|Detox offline mode test|Disconnect network mid-session. Verify all screens show cached data with banner.|
|Chart render time (mobile)|< 400ms from data ready to rendered|JS Performance.now() instrumented in SparklineChart|Log to PostHog. Alert if median exceeds 500ms.|


# **9. Design-to-Engineering Handoff Checklist**
Before any screen moves to engineering sprint, design must complete every item on this checklist. Engineering must validate completeness before beginning implementation.

## **9.1 Designer Checklist (per Screen)**
1. Figma frame at 390px width (iPhone 14) AND 412px (Android Pixel 7).
1. All text uses defined typography tokens — no custom font sizes.
1. All colours use design token names in Figma annotation — no hex values.
1. All states defined: default, loading, error, empty, offline, stale.
1. Hindi copy reviewed by native Hindi speaker (non-engineer).
1. Touch targets verified ≥ 48×48dp in Figma constraint view.
1. Prototype interaction defined for all primary tap targets.
1. Accessibility: colour contrast ≥ 4.5:1 for body text (Figma A11y plugin).
1. Dev mode annotations complete: spacing, radius, shadow values.
1. Assets exported: SVG for icons, 1x/2x/3x PNG for illustrations.

## **9.2 Engineering Checklist (before PR opens)**
1. Component uses design tokens from tokens.ts — zero hardcoded values.
1. All 6 states implemented and tested (default, loading, error, empty, offline, stale).
1. Offline mode tested by disabling network in device developer settings.
1. Hindi text renders correctly on Android 8.0 (Noto Sans Devanagari).
1. Touch target size verified programmatically (at least 48dp hit area).
1. Performance budget verified: render time logged with Performance.now().
1. Accessibility: VoiceOver (iOS) and TalkBack (Android) tested for primary flow.
1. Loading state uses LoadingSkeleton component — no blank white screens.
1. Error state uses EmptyState component — no raw error strings shown to user.
1. Stale data scenario tested: disconnect → reconnect → verify cache and refresh logic.

|**NOTE**|This document is a living specification. It will be updated as Phase 0 validation produces learnings. All changes tracked in Git. Engineers must pull latest before starting any new feature. Version: 1.0, May 2026.|
| :-: | :- |

PoultryPulse AI  ·  Engineering Use Only			Page  of 
