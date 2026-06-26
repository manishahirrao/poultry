// PoultryPulse AI — Web Design Tokens
// File: packages/ui/src/web-tokens.ts
// Version: v1.0 | May 2026
// Design Reference: PoultryPulse_UIUX_Design_v1.md §2.1
// Post-Login Reference: 04_postlogin_design_master.md §1
// Dashboard-specific tokens (post-login)
// Design Reference: 04_postlogin_design_master.md §1.1
export const DashboardTokens = {
    // Chart colours (accessible, colour-blind safe)
    chartP50: '#1A6B3C', // Predicted median — brand green
    chartP10: '#7CC49A', // P10 lower bound — light green
    chartP90: '#0F4A28', // P90 upper bound — dark green
    chartActual: '#E8621A', // Actual price — saffron (high contrast vs green)
    chartGood: '#1A6B3C', // Within 5% error
    chartWarn: '#F5A623', // 5-10% error
    chartBad: '#C0392B', // >10% error
    // Status indicators
    statusGreen: '#16A34A', // Active, connected, healthy
    statusAmber: '#D97706', // Warning, near threshold
    statusRed: '#DC2626', // Critical, gate failed
    statusBlue: '#2563EB', // Info, neutral
    // Sell signal (dashboard)
    sellNow: '#16A34A', // SELL_NOW signal
    holdSignal: '#D97706', // HOLD signal
    cautionSignal: '#DC2626', // CAUTION/SELL_SOON signal
    // Dashboard surface
    sidebarBg: '#0F1E15', // Near-black green sidebar
    sidebarText: '#A8C5B0', // Muted green text in sidebar
    sidebarActive: '#FFFFFF', // Active nav item text
    sidebarHover: 'rgba(255,255,255,0.06)', // Hover state
    contentBg: '#F7FAF8', // Main content area background
    cardBg: '#FFFFFF', // Card background
    tableBg: '#FFFFFF', // Table background
    tableRowHover: '#F0F7F3', // Table row hover
    tableStriped: '#F7FAF8', // Alternating rows
    divider: '#E2EBE6', // Separator lines
};
// Dashboard typography (fixed scale, not fluid)
// Design Reference: 04_postlogin_design_master.md §1.2
export const DashboardTypography = {
    // Page titles
    pageTitle: {
        fontFamily: "'Plus Jakarta Sans', system-ui",
        fontSize: '1.5rem', // 24px
        fontWeight: 700,
        lineHeight: 1.25,
        letterSpacing: '-0.015em',
    },
    // Section headings
    sectionTitle: {
        fontFamily: "'Plus Jakarta Sans', system-ui",
        fontSize: '1.0625rem', // 17px
        fontWeight: 600,
        lineHeight: 1.3,
    },
    // Card titles
    cardTitle: {
        fontFamily: "'Plus Jakarta Sans', system-ui",
        fontSize: '0.9375rem', // 15px
        fontWeight: 600,
        lineHeight: 1.35,
    },
    // Body text
    body: {
        fontFamily: "'Plus Jakarta Sans', system-ui",
        fontSize: '0.875rem', // 14px
        fontWeight: 400,
        lineHeight: 1.5,
    },
    // Data labels
    dataLabel: {
        fontFamily: "'Plus Jakarta Sans', system-ui",
        fontSize: '0.75rem', // 12px
        fontWeight: 500,
        lineHeight: 1.4,
        letterSpacing: '0.02em',
    },
    // Large metric numbers
    metricLarge: {
        fontFamily: "'Sora', 'Plus Jakarta Sans', system-ui",
        fontSize: '2rem', // 32px
        fontWeight: 700,
        lineHeight: 1.0,
        fontVariantNumeric: 'tabular-nums',
        letterSpacing: '-0.02em',
    },
    metricMedium: {
        fontFamily: "'Sora', system-ui",
        fontSize: '1.375rem', // 22px
        fontWeight: 700,
        lineHeight: 1.0,
        fontVariantNumeric: 'tabular-nums',
    },
    // Mono for API keys, timestamps
    mono: {
        fontFamily: "'Geist Mono', 'JetBrains Mono', 'Roboto Mono', monospace",
        fontSize: '0.8125rem', // 13px
        fontWeight: 400,
        lineHeight: 1.5,
    },
    // Hindi in dashboard (error messages, alerts, admin notes)
    hindiUI: {
        fontFamily: "'Noto Sans Devanagari', sans-serif",
        fontSize: '0.875rem',
        fontWeight: 400,
        lineHeight: 1.6,
    },
};
// Dashboard spacing (8px base grid)
// Design Reference: 04_postlogin_design_master.md §1.3
export const DashboardSpacing = {
    xs: '4px', // tight internal spacing
    sm: '8px', // component internal padding
    md: '16px', // standard gap
    lg: '24px', // card padding
    xl: '32px', // section separation
    '2xl': '48px', // page section gap
    '3xl': '64px', // max section padding
    // Layout dimensions
    sidebarWidth: '240px',
    headerHeight: '60px',
    contentMaxWidth: '1440px',
    contentPaddingDesktop: '24px',
    contentPaddingTablet: '16px',
    contentPaddingMobile: '12px',
};
// Chart configuration standards for Recharts
// Design Reference: 04_postlogin_design_master.md §1.4
export const chartDefaults = {
    // All charts use these Recharts props
    margin: { top: 8, right: 16, bottom: 8, left: 0 },
    style: { fontFamily: "'Plus Jakarta Sans', system-ui", fontSize: '12px' },
    // Axis styling
    xAxis: {
        tickLine: false,
        axisLine: false,
        tick: { fill: '#5A7A68', fontSize: 11 },
    },
    yAxis: {
        tickLine: false,
        axisLine: false,
        tick: { fill: '#5A7A68', fontSize: 11 },
        width: 48,
    },
    // Tooltip
    tooltip: {
        contentStyle: {
            background: '#FFFFFF',
            border: '1px solid #E2EBE6',
            borderRadius: '8px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            fontSize: '13px',
        },
    },
    // P10/P50/P90 band always visible (Aidan Murphy rule)
    p50: { stroke: '#1A6B3C', strokeWidth: 2, type: 'monotone' },
    p10: { stroke: '#7CC49A', strokeWidth: 1, strokeDasharray: '4 4', type: 'monotone' },
    p90: { stroke: '#0F4A28', strokeWidth: 1, strokeDasharray: '4 4', type: 'monotone' },
    actual: { stroke: '#E8621A', strokeWidth: 2, dot: { r: 3 }, type: 'monotone' },
};
