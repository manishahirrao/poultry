export interface WebTokens {
    brandOrange700: string;
    brandOrange500: string;
    brandOrange50: string;
    brandOrange25: string;
    brandGreen700: string;
    brandGreen500: string;
    brandGreen50: string;
    brandGreen25: string;
    saffronOrange: string;
    saffronLight: string;
    amber500: string;
    amberLight: string;
    red600: string;
    redLight: string;
    neutral900: string;
    neutral700: string;
    neutral500: string;
    neutral400: string;
    neutral200: string;
    neutral100: string;
    neutral50: string;
    white: string;
    cardSurface: string;
    glassWhite10: string;
    glassWhite15: string;
    opacity10: string;
    opacity15: string;
    opacity20: string;
    opacity30: string;
    opacity60: string;
    opacity70: string;
    opacity85: string;
    opacity90: string;
    heroGradient: string;
    accentGradient: string;
    trustGradient: string;
}
export interface TypographyScale {
    fontFamily: string;
    fontSize: string;
    fontWeight: number;
    lineHeight: number | string;
    letterSpacing: string;
    textTransform?: 'uppercase';
    maxWidth?: string;
    fontVariantNumeric?: string;
}
export interface SpacingScale {
    sectionVertical: string;
    sectionSmall: string;
    containerMax: string;
    containerPadding: string;
    cardPadding: string;
    cardPaddingLg: string;
    cardGap: string;
    cardGapLg: string;
    headingMarginBottom: string;
    bodyMarginBottom: string;
    sectionLabelGap: string;
    buttonHeight: string;
    buttonHeightLg: string;
    buttonPaddingX: string;
    inputHeight: string;
}
export interface MotionTokens {
    easeOutQuart: string;
    easeOutExpo: string;
    easeOutQuint: string;
    instant: string;
    quick: string;
    standard: string;
    enter: string;
    elaborate: string;
    springSnappy: {
        type: string;
        stiffness: number;
        damping: number;
    };
    springSmooth: {
        type: string;
        stiffness: number;
        damping: number;
    };
    springHeavy: {
        type: string;
        stiffness: number;
        damping: number;
    };
}
export interface PredictionResult {
    p10: number;
    p50: number;
    p90: number;
    direction: 'up' | 'down' | 'stable';
    changePercent: number;
    lastUpdated: string;
    confidence: number;
}
export interface SellSignal {
    signal: 'SELL_NOW' | 'HOLD' | 'SELL_SOON';
    strength: number;
    reason: string;
}
export interface Alert {
    id: string;
    type: 'HPAI' | 'HEAT_WAVE' | 'PRICE_CRASH' | 'FEED_COST' | 'POLICY';
    severity: 'high' | 'medium' | 'low';
    title: string;
    message: string;
    timestamp: string;
    source?: string;
}
//# sourceMappingURL=types.d.ts.map