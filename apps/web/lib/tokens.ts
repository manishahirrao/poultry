// FlockIQ — Design System Tokens (v3.0)
// Brand: FlockIQ (formerly FlockIQ / FlockIQ)
// Reference: FlockIQ_PreLogin_Design_Master_v3.md §1.1–1.4
// This is the single source of truth for all colours, typography, spacing, components

export const FlockIQWebTokens = {
  // PRIMARY BRAND — Forest Green (darker, premium, global)
  brand900:        '#0D3B21',  // Deepest green — dark overlay, footer
  brand800:        '#144D2B',  // Dark variant
  brand700:        '#1A5C34',  // ★ PRIMARY: CTAs, nav active, sidebars, badges
  brand600:        '#1F7040',  // Hover on brand700
  brand500:        '#25874D',  // Body links, icon fill
  brand400:        '#3DAE72',  // ★ ACCENT: Interactive highlights, progress, active
  brand300:        '#68C690',  // Light accent — tag backgrounds
  brand200:        '#A3DBBA',  // Very light accent
  brand100:        '#D4EFDE',  // Tint backgrounds
  brand50:         '#EDF7F1',  // Subtle page section backgrounds

  // SAFFRON ORANGE — Alert/Signal (use sparingly — max 5% of screen area)
  signal700:       '#C4490E',  // Dark saffron
  signal500:       '#E8611A',  // ★ Signal: SELL, urgency CTAs, alerts
  signal300:       '#F5A044',  // Mild warning
  signalLight:     '#FDF0E8',  // Alert card backgrounds

  // NEUTRAL SCALE (warm-tinted, not cool grey)
  neutral950:      '#0F1A12',  // Almost black — hero text
  neutral900:      '#1C2B22',  // Primary headings
  neutral800:      '#263D2F',  // Secondary headings
  neutral700:      '#334D3E',  // Body text
  neutral600:      '#4A6556',  // Secondary body
  neutral500:      '#5A7A68',  // Tertiary text, captions
  neutral400:      '#7A9C8A',  // Disabled text
  neutral300:      '#A0BAA9',  // Placeholder
  neutral200:      '#C8DDD2',  // Borders, dividers
  neutral150:      '#DDE9E2',  // Light borders
  neutral100:      '#EAF1ED',  // Subtle backgrounds
  neutral50:       '#F4F8F5',  // Page background sections

  // SURFACES
  white:           '#FFFFFF',
  pageBg:          '#F7FAF8',  // Warm off-white page background
  cardBg:          '#FFFFFF',
  heroGradient:    'linear-gradient(135deg, #1A5C34 0%, #0F4A28 55%, #0D3B21 100%)',
  heroGradientLt:  'linear-gradient(180deg, #EDF7F1 0%, #FFFFFF 100%)',
  greenGlow:       '0 0 60px rgba(61,174,114,0.15)',  // Subtle glow for hero elements

  // SEMANTIC
  success500:      '#16A34A',
  warning500:      '#D97706',
  error500:        '#DC2626',
  info500:         '#2563EB',

  // WHATSAPP
  whatsappGreen:   '#25D366',
  whatsappBg:      '#ECF8F1',
  whatsappDark:    '#075E54',

  // GLASS / OVERLAY
  glass10:         'rgba(255,255,255,0.10)',
  glass15:         'rgba(255,255,255,0.15)',
  glass20:         'rgba(255,255,255,0.20)',
  overlayDark:     'rgba(13,59,33,0.85)',
} as const;

export const FlockIQTypography = {
  // DISPLAY — Hero headlines (fluid scale for global market)
  displayHero: {
    fontFamily:    "'Sora', 'Plus Jakarta Sans', system-ui",
    fontSize:      "clamp(2.75rem, 5.5vw + 0.5rem, 5rem)",  // 44px → 80px
    fontWeight:    800,
    lineHeight:    1.0,
    letterSpacing: '-0.035em',
  },
  displayLarge: {
    fontFamily:    "'Sora', 'Plus Jakarta Sans', system-ui",
    fontSize:      "clamp(2.25rem, 4vw + 0.5rem, 3.75rem)",  // 36px → 60px
    fontWeight:    700,
    lineHeight:    1.08,
    letterSpacing: '-0.028em',
  },
  displayMedium: {
    fontFamily:    "'Sora', system-ui",
    fontSize:      "clamp(1.875rem, 3vw + 0.25rem, 3rem)",
    fontWeight:    700,
    lineHeight:    1.12,
    letterSpacing: '-0.022em',
  },

  // SECTION HEADINGS
  h1: {
    fontFamily:    "'Plus Jakarta Sans', 'Sora', system-ui",
    fontSize:      "clamp(1.75rem, 2.5vw + 0.5rem, 2.5rem)",
    fontWeight:    700,
    lineHeight:    1.2,
    letterSpacing: '-0.02em',
  },
  h2: {
    fontFamily:    "'Plus Jakarta Sans', system-ui",
    fontSize:      "clamp(1.375rem, 1.75vw + 0.375rem, 2rem)",
    fontWeight:    600,
    lineHeight:    1.3,
    letterSpacing: '-0.015em',
  },
  h3: {
    fontFamily:    "'Plus Jakarta Sans', system-ui",
    fontSize:      "clamp(1.125rem, 1vw + 0.375rem, 1.5rem)",
    fontWeight:    600,
    lineHeight:    1.35,
    letterSpacing: '-0.01em',
  },

  // BODY
  bodyLarge: {
    fontFamily:  "'Plus Jakarta Sans', system-ui",
    fontSize:    "clamp(1rem, 0.5vw + 0.875rem, 1.25rem)",
    fontWeight:  400,
    lineHeight:  1.75,
    maxWidth:    '65ch',
  },
  bodyBase: {
    fontFamily:  "'Plus Jakarta Sans', system-ui",
    fontSize:    "1rem",
    fontWeight:  400,
    lineHeight:  1.65,
  },
  bodySmall: {
    fontFamily:  "'Plus Jakarta Sans', system-ui",
    fontSize:    "0.875rem",
    fontWeight:  400,
    lineHeight:  1.55,
  },

  // SPECIAL — Hindi/Devanagari
  hindiDisplay: {
    fontFamily:  "'Noto Sans Devanagari', 'Mangal', sans-serif",
    fontSize:    "clamp(1.375rem, 2.5vw + 0.5rem, 2.25rem)",
    fontWeight:  700,
    lineHeight:  1.45,
  },
  hindiBody: {
    fontFamily:  "'Noto Sans Devanagari', 'Mangal', sans-serif",
    fontSize:    "clamp(0.9375rem, 0.75vw + 0.75rem, 1.125rem)",
    fontWeight:  400,
    lineHeight:  1.7,
  },
  hindiSmall: {
    fontFamily:  "'Noto Sans Devanagari', 'Mangal', sans-serif",
    fontSize:    "0.875rem",
    fontWeight:  400,
    lineHeight:  1.6,
  },

  // NUMBERS — Tabular (for prices, stats)
  priceHero: {
    fontFamily:         "'Sora', system-ui",
    fontSize:           "clamp(3rem, 7vw, 6rem)",
    fontWeight:         800,
    lineHeight:         1.0,
    letterSpacing:      '-0.045em',
    fontVariantNumeric: 'tabular-nums',
  },
  statNumber: {
    fontFamily:         "'Sora', system-ui",
    fontSize:           "clamp(2rem, 4vw, 3.5rem)",
    fontWeight:         800,
    lineHeight:         1.0,
    letterSpacing:      '-0.03em',
    fontVariantNumeric: 'tabular-nums',
  },

  // EYEBROW / LABEL
  eyebrow: {
    fontFamily:    "'Plus Jakarta Sans', system-ui",
    fontSize:      "0.6875rem",
    fontWeight:    700,
    letterSpacing: '0.18em',
    textTransform: 'uppercase' as const,
    lineHeight:    1.0,
  },
  label: {
    fontFamily:    "'Plus Jakarta Sans', system-ui",
    fontSize:      "0.8125rem",
    fontWeight:    600,
    letterSpacing: '0.04em',
    lineHeight:    1.4,
  },

  // MONOSPACE — code, API samples
  mono: {
    fontFamily: "'Geist Mono', 'JetBrains Mono', 'Fira Code', monospace",
    fontSize:   "0.875rem",
    fontWeight: 400,
    lineHeight: 1.6,
  },
} as const;

export const FlockIQComponentTokens = {
  // NAV
  navHeight:        '72px',
  navBg:            'rgba(255,255,255,0.95)',
  navBgScrolled:    '#FFFFFF',
  navBorder:        '1px solid rgba(26,92,52,0.08)',
  navBackdropBlur:  'blur(20px)',
  navLogoHeight:    '36px',

  // BUTTONS
  btnPrimary: {
    bg:           '#1A5C34',
    bgHover:      '#1F7040',
    bgActive:     '#144D2B',
    text:         '#FFFFFF',
    shadow:       '0 4px 16px rgba(26,92,52,0.25)',
    shadowHover:  '0 6px 24px rgba(26,92,52,0.35)',
  },
  btnAccent: {
    bg:      '#E8611A',  // Signal orange — for urgency CTAs only
    bgHover: '#C4490E',
    text:    '#FFFFFF',
    shadow:  '0 4px 16px rgba(232,97,26,0.25)',
  },
  btnSecondary: {
    bg:        'transparent',
    bgHover:   '#EDF7F1',
    border:    '1.5px solid #1A5C34',
    text:      '#1A5C34',
  },
  btnGhost: {
    bg:        'transparent',
    bgHover:   'rgba(26,92,52,0.06)',
    text:      '#334D3E',
  },
  btnWhatsApp: {
    bg:        '#25D366',
    bgHover:   '#1DA85A',
    text:      '#FFFFFF',
    shadow:    '0 4px 16px rgba(37,211,102,0.30)',
  },

  // CARDS
  cardBg:         '#FFFFFF',
  cardBorder:     '1px solid #E3EDE7',
  cardRadius:     '16px',
  cardPadding:    '28px',
  cardShadow:     '0 2px 8px rgba(0,0,0,0.06)',
  cardHoverShadow:'0 8px 32px rgba(0,0,0,0.10)',
  cardHoverBg:    '#FAFCFB',
  cardHoverBorderColor: '#3DAE72',

  // FEATURE CARDS (feature list items)
  featureIconBg:   '#EDF7F1',
  featureIconColor:'#1A5C34',
  featureIconSize: '48px',
  featureIconRadius:'12px',

  // TESTIMONIAL CARDS
  testimonialBg:         '#FFFFFF',
  testimonialBorderLeft: '4px solid #3DAE72',
  testimonialAvatarBg:   '#1A5C34',
  testimonialAvatarText: '#FFFFFF',
  verifiedBadgeBg:       '#EDF7F1',
  verifiedBadgeColor:    '#1A5C34',

  // PRICING CARDS
  pricingCardBg:        '#FFFFFF',
  pricingCardFeaturedBg:'#0D3B21',  // Dark hero card for "Most Popular"
  pricingCardFeaturedText:'#FFFFFF',
  pricingPopularBadgeBg:'#3DAE72',
  pricingBorder:        '2px solid #E3EDE7',
  pricingBorderPopular: '2px solid #3DAE72',

  // PILLS / BADGES
  pillBrandBg:     '#EDF7F1',
  pillBrandText:   '#1A5C34',
  pillBrandBorder: '1px solid #D4EFDE',
  pillOrangeBg:    '#FDF0E8',
  pillOrangeText:  '#C4490E',
  pillGreyBg:      '#F0F4F1',
  pillGreyText:    '#5A7A68',
  pillSuccessBg:   '#DCFCE7',
  pillSuccessText: '#16A34A',

  // SECTION LABELS (eyebrow)
  eyebrowBg:       '#EDF7F1',
  eyebrowColor:    '#1A5C34',
  eyebrowPadding:  '6px 14px',
  eyebrowRadius:   '999px',
  eyebrowBorder:   '1px solid #D4EFDE',

  // ANNOUNCEMENT BAR
  announcementBg:    '#1A5C34',
  announcementText:  '#FFFFFF',
  announcementHeight:'44px',
} as const;

// Legacy exports for backward compatibility
export const colors = {
  // Primary Brand (mapped to new FlockIQ tokens)
  brandGreen700: FlockIQWebTokens.brand700,
  brandGreen500: FlockIQWebTokens.brand500,
  brandGreen50: FlockIQWebTokens.brand50,
  brandGreen25: FlockIQWebTokens.brand50,

  // Warm Accent
  saffronOrange: FlockIQWebTokens.signal500,
  saffronLight: FlockIQWebTokens.signalLight,
  amber500: FlockIQWebTokens.signal300,
  amberLight: FlockIQWebTokens.signalLight,

  // Semantic
  red600: FlockIQWebTokens.error500,
  redLight: FlockIQWebTokens.signalLight,

  // Neutral Scale
  neutral900: FlockIQWebTokens.neutral900,
  neutral700: FlockIQWebTokens.neutral700,
  neutral500: FlockIQWebTokens.neutral500,
  neutral400: FlockIQWebTokens.neutral400,
  neutral200: FlockIQWebTokens.neutral200,
  neutral100: FlockIQWebTokens.neutral100,
  neutral50: FlockIQWebTokens.neutral50,

  // Surface
  white: FlockIQWebTokens.white,
  cardSurface: FlockIQWebTokens.cardBg,
  glassWhite10: FlockIQWebTokens.glass10,
  glassWhite15: FlockIQWebTokens.glass15,
} as const;

export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

export const spacing = {
  sectionVertical: 'clamp(5rem, 8vw, 9rem)',
  sectionSmall: 'clamp(3rem, 5vw, 5rem)',
  containerMax: '1280px',
  containerPadding: 'clamp(1rem, 5vw, 4rem)',
  cardPadding: 'clamp(1.5rem, 2.5vw, 2.5rem)',
  cardPaddingLg: '2.5rem',
  cardGap: 'clamp(1.25rem, 2vw, 2rem)',
  cardGapLg: '2rem',
  headingMarginBottom: '1rem',
  bodyMarginBottom: '1.5rem',
  sectionLabelGap: '0.5rem',
  buttonHeight: '52px',
  buttonHeightLg: '60px',
  buttonPaddingX: '1.75rem',
  inputHeight: '52px',
} as const;

export const motion = {
  easeOutQuart: 'cubic-bezier(0.25, 1, 0.5, 1)',
  easeOutExpo: 'cubic-bezier(0.16, 1, 0.3, 1)',
  easeOutQuint: 'cubic-bezier(0.22, 1, 0.36, 1)',
  instant: 100,
  quick: 200,
  standard: 300,
  enter: 500,
  elaborate: 800,
  springSnappy: { type: 'spring', stiffness: 400, damping: 30 },
  springSmooth: { type: 'spring', stiffness: 200, damping: 25 },
  springHeavy: { type: 'spring', stiffness: 100, damping: 20 },
} as const;
