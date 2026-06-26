// FlockIQ — Design System Tokens (v2.0)
// Brand rename: FlockIQ → FlockIQ
// 
// WHY: Centralized design tokens ensure consistent branding across the entire application.
// This file contains all color constants used throughout the UI, making it easy to update
// the brand colors in one place without hunting through component files.

export const FlockIQTokens = {
  // Brand colors - Primary green palette representing agricultural growth and trust
  brand700:        '#1A5C34', // Darkest brand green - used for primary actions, headers
  brand600:        '#1F7040', // Dark brand green - used for hover states
  brand500:        '#25874D', // Medium brand green - used for secondary actions
  brand400:        '#3DAE72', // Light brand green - used for accents, highlights
  brand100:        '#D4EFDE', // Very light brand green - used for backgrounds
  brand50:         '#EDF7F1', // Lightest brand green - used for subtle backgrounds
  
  // Signal colors - Used for buy/sell/hold indicators in price intelligence
  signalSell:      '#16A34A', // Green - indicates optimal selling opportunity
  signalHold:      '#D97706', // Amber - indicates wait/hold position
  signalCaution:   '#DC2626', // Red - indicates caution/not ideal time
  signalInfo:      '#2563EB', // Blue - used for informational states
  
  // FCR (Feed Conversion Ratio) color coding - Helps farmers quickly identify performance
  fcrExcellent:    '#16A34A', // Green - FCR < 1.70 (excellent efficiency)
  fcrGood:         '#65A30D', // Lime - FCR 1.70-1.90 (good efficiency)
  fcrWatch:        '#D97706', // Amber - FCR 1.90-2.10 (needs attention)
  fcrAlert:        '#DC2626', // Red - FCR > 2.10 (critical inefficiency)
  
  // Mortality rate color coding - Critical health indicator for farmers
  mortalityOk:     '#16A34A', // Green - Mortality < 2.5% (healthy)
  mortalityWatch:  '#D97706', // Amber - Mortality 2.5-4.0% (monitor)
  mortalityAlert:  '#DC2626', // Red - Mortality > 4.0% (critical)
  
  // Sidebar colors - Dark theme for navigation to reduce eye strain
  sidebarBg:       '#0D1F16', // Very dark green background
  sidebarText:     '#9BBDA8', // Muted green text for readability
  sidebarActive:   '#FFFFFF', // White for active navigation item
  sidebarHover:    'rgba(255,255,255,0.07)', // Subtle hover effect
  
  // Layout colors - Neutral backgrounds for content areas
  contentBg:       '#F4F7F5', // Light green-tinted background
  cardBg:          '#FFFFFF', // White card backgrounds
  cardBorder:      '#E3EDE7', // Subtle green-tinted borders
  divider:         '#E3EDE7', // Divider lines matching card borders
  
  // WhatsApp integration colors - Match WhatsApp brand for familiarity
  whatsappGreen:   '#25D366', // Official WhatsApp green
  whatsappBg:      '#ECF8F1', // Light background for WhatsApp sections
  
  // Alert colors - Used for system notifications and warnings
  alertYellow:     '#FEF9C3', // Yellow background for warnings
  alertRed:        '#FEE2E2', // Red background for errors/critical alerts
  alertGreen:      '#DCFCE7', // Green background for success states
  alertBlue:       '#DBEAFE', // Blue background for informational alerts
  
  // Utility colors
  neutralGray:     '#9CA3AF', // Gray for neutral/disabled states
  actualPrice:     '#E8611A', // Orange for actual price data points on charts
  festivalPurple:  '#7C3AED', // Purple for festival annotations on price charts
} as const;

// Helper: FCR colour picker
// WHY: Provides consistent color coding for FCR values across all components.
// FCR is a critical metric for farmers - color coding enables quick visual assessment.
export function fcrColour(fcr: number): string {
  if (fcr < 1.70) return FlockIQTokens.fcrExcellent;
  if (fcr < 1.90) return FlockIQTokens.fcrGood;
  if (fcr < 2.10) return FlockIQTokens.fcrWatch;
  return FlockIQTokens.fcrAlert;
}

// Helper: mortality colour picker
// WHY: Provides consistent color coding for mortality rates across all components.
// Mortality is a critical health indicator - color coding enables quick visual assessment.
export function mortalityColour(pct: number): string {
  if (pct < 2.5) return FlockIQTokens.mortalityOk;
  if (pct < 4.0) return FlockIQTokens.mortalityWatch;
  return FlockIQTokens.mortalityAlert;
}
