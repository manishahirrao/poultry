// PoultrySense — Design System Tokens
// File: packages/ui/src/tokens.ts
// Version: v2.0 | May 2026
// Design Reference: PoultrySense_UIUX_Design_v2.md §1.2–1.4

import type { WebTokens as WebTokensType } from './types';

/**
 * Brand Colour Tokens (UI/UX §1.2)
 * Updated based on PoultrySense logo - warm orange/red rooster as primary brand color
 */
export const colors = {
  // Primary Brand (from logo rooster color)
  brandOrange700: '#D4551A', // Primary CTA, trust anchors, nav (warm orange-red)
  brandOrange500: '#E86A2A', // Hover states, secondary emphasis
  brandOrange50: '#FDF0E8', // Card backgrounds, section tints
  brandOrange25: '#FEF7F2', // Page background sections

  // Secondary Brand (forest green for agricultural context)
  brandGreen700: '#1A6B3C', // Secondary CTAs, trust elements
  brandGreen500: '#2E8653', // Hover states, secondary emphasis
  brandGreen50: '#E8F5EE', // Card backgrounds, section tints
  brandGreen25: '#F4FAF6', // Page background sections

  // Warm Accent (Indian earth tones)
  saffronOrange: '#E8621A', // Urgency CTAs, pricing highlights, Indian warmth
  saffronLight: '#FDF0E8', // Soft accent backgrounds
  amber500: '#F5A623', // Sell signal colour, secondary accent
  amberLight: '#FEF8EC', // Alert card backgrounds

  // Semantic
  red600: '#C0392B', // Disease alerts, price drop warnings
  redLight: '#FDF0EF', // Error/danger backgrounds

  // Neutral Scale (Warm-tinted toward orange, no pure grey)
  neutral900: '#2B1D15', // Primary text — near-black with orange tint
  neutral700: '#4A3528', // Secondary text
  neutral500: '#7A5A4A', // Tertiary text, labels
  neutral400: '#9A7A6A', // Disabled states, captions
  neutral200: '#D4C4BC', // Borders, dividers
  neutral100: '#F2E8E2', // Subtle backgrounds
  neutral50: '#FAF5F2', // Page background

  // Surface
  white: '#FFFFFF',
  cardSurface: '#FFFFFF',
  glassWhite10: 'rgba(255,255,255,0.10)',
  glassWhite15: 'rgba(255,255,255,0.15)',

  // Opacity tokens for consistent transparency
  opacity10: 'rgba(255,255,255,0.10)',
  opacity15: 'rgba(255,255,255,0.15)',
  opacity20: 'rgba(255,255,255,0.20)',
  opacity30: 'rgba(255,255,255,0.30)',
  opacity60: 'rgba(255,255,255,0.60)',
  opacity70: 'rgba(255,255,255,0.70)',
  opacity85: 'rgba(255,255,255,0.85)',
  opacity90: 'rgba(255,255,255,0.90)',
} as const;

/**
 * Gradient Definitions
 */
export const gradients = {
  heroGradient: 'linear-gradient(135deg, #D4551A 0%, #A84010 60%, #2B1D15 100%)',
  accentGradient: 'linear-gradient(90deg, #D4551A 0%, #F5A623 100%)',
  trustGradient: 'linear-gradient(180deg, #FDF0E8 0%, #FFFFFF 100%)',
};

/**
 * Typography Tokens (Mobile/App - Hindi-First)
 * Noto Sans Devanagari for all text - verified for correct rendering at 13sp (caption scale) for all conjuncts
 * Font weights: Regular (400), SemiBold (600), Bold (700) - streamlined for consistency
 * Modular scale: 1.25 ratio for clear hierarchy
 */
export const mobileTypography = {
  // Display scale - price hero
  displayPrice: {
    fontFamily: 'NotoSansDevanagari-Bold',
    fontSize: 56,
    fontWeight: '700' as const,
    lineHeight: 1.14,
  },
  displayLabel: {
    fontFamily: 'NotoSansDevanagari-SemiBold',
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 1.2,
  },
  // Heading scale (1.25 modular ratio)
  heading1: {
    fontFamily: 'NotoSansDevanagari-Bold',
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 1.25,
  },
  heading2: {
    fontFamily: 'NotoSansDevanagari-SemiBold',
    fontSize: 22,
    fontWeight: '600' as const,
    lineHeight: 1.3,
  },
  heading3: {
    fontFamily: 'NotoSansDevanagari-SemiBold',
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 1.33,
  },
  // Body scale (1.25 modular ratio)
  bodyLarge: {
    fontFamily: 'NotoSansDevanagari-Regular',
    fontSize: 17,
    fontWeight: '400' as const,
    lineHeight: 1.53,
  },
  body: {
    fontFamily: 'NotoSansDevanagari-Regular',
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 1.5,
  },
  bodySmall: {
    fontFamily: 'NotoSansDevanagari-Regular',
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 1.43,
  },
  // Caption scale - verified for correct Devanagari conjunct rendering at 13sp
  caption: {
    fontFamily: 'NotoSansDevanagari-Regular',
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 1.38,
  },
  // UI elements
  button: {
    fontFamily: 'NotoSansDevanagari-Bold',
    fontSize: 18,
    fontWeight: '700' as const,
    lineHeight: 1,
  },
  badge: {
    fontFamily: 'NotoSansDevanagari-SemiBold',
    fontSize: 12,
    fontWeight: '600' as const,
    lineHeight: 1,
  },
  overline: {
    fontFamily: 'NotoSansDevanagari-SemiBold',
    fontSize: 11,
    fontWeight: '600' as const,
    lineHeight: 1.45,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
} as const;

/**
 * ERP Brand Colour Tokens (from specs/account.md - Integration Company ERP)
 * Used for FlockIQ ERP modules
 */
export const erpColors = {
  brand700: '#1A5C34',   // primary dark green
  brand400: '#3DAE72',   // accent green
  brand50:  '#EDF7F1',   // light green tint
  signal:   '#E8611A',   // saffron/orange — actual prices, alerts
  amber:    '#D97706',   // warning
  red:      '#DC2626',   // danger
  sidebar:  '#0D1F16',   // near-black sidebar
  pageBg:   '#F4F7F5',
  cardBg:   '#FFFFFF',
  border:   '#E3EDE7',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  whatsapp: '#25D366',
} as const;

/**
 * Brand Colour Tokens (Inherited from UI/UX v2.0 + Extended for Web)
 */
export const WebTokens: WebTokensType = {
  brandOrange700: colors.brandOrange700,
  brandOrange500: colors.brandOrange500,
  brandOrange50: colors.brandOrange50,
  brandOrange25: colors.brandOrange25,
  brandGreen700: colors.brandGreen700,
  brandGreen500: colors.brandGreen500,
  brandGreen50: colors.brandGreen50,
  brandGreen25: colors.brandGreen25,
  saffronOrange: colors.saffronOrange,
  saffronLight: colors.saffronLight,
  amber500: colors.amber500,
  amberLight: colors.amberLight,
  red600: colors.red600,
  redLight: colors.redLight,
  neutral900: colors.neutral900,
  neutral700: colors.neutral700,
  neutral500: colors.neutral500,
  neutral400: colors.neutral400,
  neutral200: colors.neutral200,
  neutral100: colors.neutral100,
  neutral50: colors.neutral50,
  white: colors.white,
  cardSurface: colors.cardSurface,
  glassWhite10: colors.glassWhite10,
  glassWhite15: colors.glassWhite15,
  opacity10: colors.opacity10,
  opacity15: colors.opacity15,
  opacity20: colors.opacity20,
  opacity30: colors.opacity30,
  opacity60: colors.opacity60,
  opacity70: colors.opacity70,
  opacity85: colors.opacity85,
  opacity90: colors.opacity90,
  heroGradient: gradients.heroGradient,
  accentGradient: gradients.accentGradient,
  trustGradient: gradients.trustGradient,
} as const;

/**
 * Typography System (Web - Hindi-First with Agricultural Precision)
 * Space Grotesk for English (geometric, technical, matches "agricultural precision")
 * Noto Sans Devanagari for Hindi (verified for correct rendering)
 * Modular scale: 1.25 ratio for clear hierarchy
 * Font weights: Regular (400), SemiBold (600), Bold (700) - streamlined
 */
export const typography = {
  // Display — Hero headlines (fluid for marketing)
  displayHero: {
    fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif",
    fontSize: 'clamp(2.5rem, 5vw + 1rem, 4.5rem)', // 40px → 72px
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
  },
  displayLarge: {
    fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif",
    fontSize: 'clamp(2rem, 3.5vw + 0.75rem, 3.5rem)',
    fontWeight: 700,
    lineHeight: 1.15,
    letterSpacing: '-0.015em',
  },

  // Section Headings (1.25 modular scale)
  heading1: {
    fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif",
    fontSize: 'clamp(1.75rem, 2.5vw + 0.5rem, 2.75rem)',
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.015em',
  },
  heading2: {
    fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif",
    fontSize: 'clamp(1.375rem, 1.5vw + 0.5rem, 2rem)',
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: '-0.01em',
  },
  heading3: {
    fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif",
    fontSize: 'clamp(1.125rem, 1vw + 0.5rem, 1.5rem)',
    fontWeight: 600,
    lineHeight: 1.35,
    letterSpacing: '-0.005em',
  },

  // Hindi Display (for farmer-facing copy blocks)
  hindiDisplay: {
    fontFamily: "'Noto Sans Devanagari', sans-serif",
    fontSize: 'clamp(1.25rem, 2vw + 0.5rem, 2rem)',
    fontWeight: 700,
    lineHeight: 1.4,
  },
  hindiBody: {
    fontFamily: "'Noto Sans Devanagari', sans-serif",
    fontSize: 'clamp(1rem, 1vw + 0.25rem, 1.25rem)',
    fontWeight: 400,
    lineHeight: 1.6,
  },

  // Body (1.25 modular scale with max-width for readability)
  bodyLarge: {
    fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif",
    fontSize: 'clamp(1.0625rem, 0.5vw + 0.875rem, 1.25rem)',
    fontWeight: 400,
    lineHeight: 1.6,
    maxWidth: '65ch',
  },
  bodyBase: {
    fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif",
    fontSize: '1rem',
    fontWeight: 400,
    lineHeight: 1.6,
    maxWidth: '65ch',
  },
  bodySmall: {
    fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif",
    fontSize: '0.875rem',
    fontWeight: 400,
    lineHeight: 1.5,
    maxWidth: '70ch',
  },

  // Eyebrow Tag
  eyebrow: {
    fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif",
    fontSize: '0.6875rem',
    fontWeight: 600,
    lineHeight: 1,
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
  },

  // Data Numbers (tabular for alignment)
  priceHero: {
    fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif",
    fontSize: 'clamp(3rem, 6vw, 5rem)',
    fontWeight: 700,
    lineHeight: 1,
    letterSpacing: '-0.03em',
    fontVariantNumeric: 'tabular-nums',
  },
  statNumber: {
    fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif",
    fontSize: 'clamp(2rem, 3.5vw, 3rem)',
    fontWeight: 700,
    lineHeight: 1,
    letterSpacing: '-0.02em',
    fontVariantNumeric: 'tabular-nums',
  },
} as const;

/**
 * Typography System (Web — Fluid Scale)
 */
export const WebTypography = {
  ...typography,
} as const;

/**
 * Spacing System (UI/UX §1.2)
 */
export const spacing = {
  // Section padding (macro whitespace — "breathe heavily")
  sectionVertical: 'clamp(5rem, 8vw, 8rem)', // ~80–128px
  sectionSmall: 'clamp(3rem, 5vw, 5rem)', // ~48–80px
  containerMax: '1280px',
  containerPadding: 'clamp(1rem, 4vw, 3rem)',

  // Component spacing
  cardPadding: '2rem', // 32px inside cards
  cardPaddingLg: '2.5rem', // 40px inside large cards
  cardGap: '1.5rem', // 24px between cards
  cardGapLg: '2rem', // 32px large grid gaps

  // Text spacing
  headingMarginBottom: '1rem',
  bodyMarginBottom: '1.5rem',
  sectionLabelGap: '0.5rem',

  // Interactive
  buttonHeight: '52px',
  buttonHeightLg: '60px',
  buttonPaddingX: '1.75rem',
  inputHeight: '52px',

  // Mobile-specific spacing (React Native) - 4pt scale with semantic names
  // Scale: 4, 8, 12, 16, 24, 32, 48, 64, 96
  mobile: {
    // Base scale
    xs: 4,   // Micro adjustments
    sm: 8,   // Tight grouping (related elements)
    md: 12,  // Standard gap between siblings
    lg: 16,  // Standard padding, section separation
    xl: 24,  // Generous separation between sections
    xxl: 32, // Major section separation
    xxxl: 48, // Hero spacing, page-level
    xxxxl: 64, // Extra large spacing
    xxxxxl: 96, // Maximum spacing

    // Semantic shortcuts for common patterns
    padding: 16,      // Standard screen padding
    cardPadding: 16, // Card interior padding
    cardPaddingLg: 20, // Large card padding
    sectionGap: 24,  // Gap between sections
    elementGap: 12,  // Gap between related elements
    tightGap: 8,     // Tight grouping
  },

  // Additional mobile spacing properties for compatibility
  mobileCardPadding: 16,
  mobilePadding: 16,
  mobileGap: 12,
} as const;

/**
 * Spacing System (Web)
 */
export const WebSpacing = {
  ...spacing,
} as const;

/**
 * Radius System (UI/UX §1.2)
 */
export const radius = {
  sm: 4, // 4px - small elements
  md: 8, // 8px - buttons, inputs
  lg: 12, // 12px - cards
  xl: 16, // 16px - large cards
  full: 9999, // fully rounded
} as const;

/**
 * Elevation System (UI/UX §1.2)
 */
export const elevation = {
  none: 0,
  sm: 1, // subtle shadow
  md: 2, // card shadow
  lg: 4, // modal shadow
  xl: 8, // dropdown shadow
} as const;

/**
 * Motion Tokens (UI/UX §1.2 + 07_motion_animation_master.md)
 */
export const motion = {
  // Easing curves — natural deceleration
  easeOutQuart: 'cubic-bezier(0.25, 1, 0.5, 1)',
  easeOutExpo: 'cubic-bezier(0.16, 1, 0.3, 1)',
  easeOutQuint: 'cubic-bezier(0.22, 1, 0.36, 1)',

  // Durations
  instant: 100, // Button press, toggle (ms)
  quick: 200, // Hover states (ms)
  standard: 300, // State transitions (ms)
  enter: 500, // Entrance animations (ms)
  elaborate: 800, // Page load choreography (ms)

  // Spring physics (Framer Motion)
  springSnappy: { type: 'spring', stiffness: 400, damping: 30 },
  springSmooth: { type: 'spring', stiffness: 200, damping: 25 },
  springHeavy: { type: 'spring', stiffness: 100, damping: 20 },
} as const;

/**
 * Motion Tokens (Web)
 */
export const WebMotion = {
  easeOutQuart: motion.easeOutQuart,
  easeOutExpo: motion.easeOutExpo,
  easeOutQuint: motion.easeOutQuint,
  instant: `${motion.instant}ms`,
  quick: `${motion.quick}ms`,
  standard: `${motion.standard}ms`,
  enter: `${motion.enter}ms`,
  elaborate: `${motion.elaborate}ms`,
  springSnappy: motion.springSnappy,
  springSmooth: motion.springSmooth,
  springHeavy: motion.springHeavy,
} as const;

// Default export for convenience
export default {
  colors,
  gradients,
  typography,
  mobileTypography,
  spacing,
  radius,
  elevation,
  motion,
  WebTokens,
  WebTypography,
  WebSpacing,
  WebMotion,
};
