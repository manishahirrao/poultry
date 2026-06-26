import type { WebTokens as WebTokensType } from './types';
/**
 * Brand Colour Tokens (UI/UX §1.2)
 * Updated based on PoultrySense logo - warm orange/red rooster as primary brand color
 */
export declare const colors: {
    readonly brandOrange700: "#D4551A";
    readonly brandOrange500: "#E86A2A";
    readonly brandOrange50: "#FDF0E8";
    readonly brandOrange25: "#FEF7F2";
    readonly brandGreen700: "#1A6B3C";
    readonly brandGreen500: "#2E8653";
    readonly brandGreen50: "#E8F5EE";
    readonly brandGreen25: "#F4FAF6";
    readonly saffronOrange: "#E8621A";
    readonly saffronLight: "#FDF0E8";
    readonly amber500: "#F5A623";
    readonly amberLight: "#FEF8EC";
    readonly red600: "#C0392B";
    readonly redLight: "#FDF0EF";
    readonly neutral900: "#2B1D15";
    readonly neutral700: "#4A3528";
    readonly neutral500: "#7A5A4A";
    readonly neutral400: "#9A7A6A";
    readonly neutral200: "#D4C4BC";
    readonly neutral100: "#F2E8E2";
    readonly neutral50: "#FAF5F2";
    readonly white: "#FFFFFF";
    readonly cardSurface: "#FFFFFF";
    readonly glassWhite10: "rgba(255,255,255,0.10)";
    readonly glassWhite15: "rgba(255,255,255,0.15)";
    readonly opacity10: "rgba(255,255,255,0.10)";
    readonly opacity15: "rgba(255,255,255,0.15)";
    readonly opacity20: "rgba(255,255,255,0.20)";
    readonly opacity30: "rgba(255,255,255,0.30)";
    readonly opacity60: "rgba(255,255,255,0.60)";
    readonly opacity70: "rgba(255,255,255,0.70)";
    readonly opacity85: "rgba(255,255,255,0.85)";
    readonly opacity90: "rgba(255,255,255,0.90)";
};
/**
 * Gradient Definitions
 */
export declare const gradients: {
    heroGradient: string;
    accentGradient: string;
    trustGradient: string;
};
/**
 * Typography Tokens (Mobile/App - Hindi-First)
 * Noto Sans Devanagari for all text - verified for correct rendering at 13sp (caption scale) for all conjuncts
 * Font weights: Regular (400), SemiBold (600), Bold (700) - streamlined for consistency
 * Modular scale: 1.25 ratio for clear hierarchy
 */
export declare const mobileTypography: {
    readonly displayPrice: {
        readonly fontFamily: "NotoSansDevanagari-Bold";
        readonly fontSize: 56;
        readonly fontWeight: "700";
        readonly lineHeight: 1.14;
    };
    readonly displayLabel: {
        readonly fontFamily: "NotoSansDevanagari-SemiBold";
        readonly fontSize: 20;
        readonly fontWeight: "600";
        readonly lineHeight: 1.2;
    };
    readonly heading1: {
        readonly fontFamily: "NotoSansDevanagari-Bold";
        readonly fontSize: 28;
        readonly fontWeight: "700";
        readonly lineHeight: 1.25;
    };
    readonly heading2: {
        readonly fontFamily: "NotoSansDevanagari-SemiBold";
        readonly fontSize: 22;
        readonly fontWeight: "600";
        readonly lineHeight: 1.3;
    };
    readonly heading3: {
        readonly fontFamily: "NotoSansDevanagari-SemiBold";
        readonly fontSize: 18;
        readonly fontWeight: "600";
        readonly lineHeight: 1.33;
    };
    readonly bodyLarge: {
        readonly fontFamily: "NotoSansDevanagari-Regular";
        readonly fontSize: 17;
        readonly fontWeight: "400";
        readonly lineHeight: 1.53;
    };
    readonly body: {
        readonly fontFamily: "NotoSansDevanagari-Regular";
        readonly fontSize: 16;
        readonly fontWeight: "400";
        readonly lineHeight: 1.5;
    };
    readonly bodySmall: {
        readonly fontFamily: "NotoSansDevanagari-Regular";
        readonly fontSize: 14;
        readonly fontWeight: "400";
        readonly lineHeight: 1.43;
    };
    readonly caption: {
        readonly fontFamily: "NotoSansDevanagari-Regular";
        readonly fontSize: 13;
        readonly fontWeight: "400";
        readonly lineHeight: 1.38;
    };
    readonly button: {
        readonly fontFamily: "NotoSansDevanagari-Bold";
        readonly fontSize: 18;
        readonly fontWeight: "700";
        readonly lineHeight: 1;
    };
    readonly badge: {
        readonly fontFamily: "NotoSansDevanagari-SemiBold";
        readonly fontSize: 12;
        readonly fontWeight: "600";
        readonly lineHeight: 1;
    };
    readonly overline: {
        readonly fontFamily: "NotoSansDevanagari-SemiBold";
        readonly fontSize: 11;
        readonly fontWeight: "600";
        readonly lineHeight: 1.45;
        readonly textTransform: "uppercase";
        readonly letterSpacing: "0.05em";
    };
};
/**
 * ERP Brand Colour Tokens (from specs/account.md - Integration Company ERP)
 * Used for FlockIQ ERP modules
 */
export declare const erpColors: {
    readonly brand700: "#1A5C34";
    readonly brand400: "#3DAE72";
    readonly brand50: "#EDF7F1";
    readonly signal: "#E8611A";
    readonly amber: "#D97706";
    readonly red: "#DC2626";
    readonly sidebar: "#0D1F16";
    readonly pageBg: "#F4F7F5";
    readonly cardBg: "#FFFFFF";
    readonly border: "#E3EDE7";
    readonly textPrimary: "#111827";
    readonly textSecondary: "#6B7280";
    readonly whatsapp: "#25D366";
};
/**
 * Brand Colour Tokens (Inherited from UI/UX v2.0 + Extended for Web)
 */
export declare const WebTokens: WebTokensType;
/**
 * Typography System (Web - Hindi-First with Agricultural Precision)
 * Space Grotesk for English (geometric, technical, matches "agricultural precision")
 * Noto Sans Devanagari for Hindi (verified for correct rendering)
 * Modular scale: 1.25 ratio for clear hierarchy
 * Font weights: Regular (400), SemiBold (600), Bold (700) - streamlined
 */
export declare const typography: {
    readonly displayHero: {
        readonly fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif";
        readonly fontSize: "clamp(2.5rem, 5vw + 1rem, 4.5rem)";
        readonly fontWeight: 700;
        readonly lineHeight: 1.1;
        readonly letterSpacing: "-0.02em";
    };
    readonly displayLarge: {
        readonly fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif";
        readonly fontSize: "clamp(2rem, 3.5vw + 0.75rem, 3.5rem)";
        readonly fontWeight: 700;
        readonly lineHeight: 1.15;
        readonly letterSpacing: "-0.015em";
    };
    readonly heading1: {
        readonly fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif";
        readonly fontSize: "clamp(1.75rem, 2.5vw + 0.5rem, 2.75rem)";
        readonly fontWeight: 700;
        readonly lineHeight: 1.2;
        readonly letterSpacing: "-0.015em";
    };
    readonly heading2: {
        readonly fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif";
        readonly fontSize: "clamp(1.375rem, 1.5vw + 0.5rem, 2rem)";
        readonly fontWeight: 600;
        readonly lineHeight: 1.3;
        readonly letterSpacing: "-0.01em";
    };
    readonly heading3: {
        readonly fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif";
        readonly fontSize: "clamp(1.125rem, 1vw + 0.5rem, 1.5rem)";
        readonly fontWeight: 600;
        readonly lineHeight: 1.35;
        readonly letterSpacing: "-0.005em";
    };
    readonly hindiDisplay: {
        readonly fontFamily: "'Noto Sans Devanagari', sans-serif";
        readonly fontSize: "clamp(1.25rem, 2vw + 0.5rem, 2rem)";
        readonly fontWeight: 700;
        readonly lineHeight: 1.4;
    };
    readonly hindiBody: {
        readonly fontFamily: "'Noto Sans Devanagari', sans-serif";
        readonly fontSize: "clamp(1rem, 1vw + 0.25rem, 1.25rem)";
        readonly fontWeight: 400;
        readonly lineHeight: 1.6;
    };
    readonly bodyLarge: {
        readonly fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif";
        readonly fontSize: "clamp(1.0625rem, 0.5vw + 0.875rem, 1.25rem)";
        readonly fontWeight: 400;
        readonly lineHeight: 1.6;
        readonly maxWidth: "65ch";
    };
    readonly bodyBase: {
        readonly fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif";
        readonly fontSize: "1rem";
        readonly fontWeight: 400;
        readonly lineHeight: 1.6;
        readonly maxWidth: "65ch";
    };
    readonly bodySmall: {
        readonly fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif";
        readonly fontSize: "0.875rem";
        readonly fontWeight: 400;
        readonly lineHeight: 1.5;
        readonly maxWidth: "70ch";
    };
    readonly eyebrow: {
        readonly fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif";
        readonly fontSize: "0.6875rem";
        readonly fontWeight: 600;
        readonly lineHeight: 1;
        readonly letterSpacing: "0.1em";
        readonly textTransform: "uppercase";
    };
    readonly priceHero: {
        readonly fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif";
        readonly fontSize: "clamp(3rem, 6vw, 5rem)";
        readonly fontWeight: 700;
        readonly lineHeight: 1;
        readonly letterSpacing: "-0.03em";
        readonly fontVariantNumeric: "tabular-nums";
    };
    readonly statNumber: {
        readonly fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif";
        readonly fontSize: "clamp(2rem, 3.5vw, 3rem)";
        readonly fontWeight: 700;
        readonly lineHeight: 1;
        readonly letterSpacing: "-0.02em";
        readonly fontVariantNumeric: "tabular-nums";
    };
};
/**
 * Typography System (Web — Fluid Scale)
 */
export declare const WebTypography: {
    readonly displayHero: {
        readonly fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif";
        readonly fontSize: "clamp(2.5rem, 5vw + 1rem, 4.5rem)";
        readonly fontWeight: 700;
        readonly lineHeight: 1.1;
        readonly letterSpacing: "-0.02em";
    };
    readonly displayLarge: {
        readonly fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif";
        readonly fontSize: "clamp(2rem, 3.5vw + 0.75rem, 3.5rem)";
        readonly fontWeight: 700;
        readonly lineHeight: 1.15;
        readonly letterSpacing: "-0.015em";
    };
    readonly heading1: {
        readonly fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif";
        readonly fontSize: "clamp(1.75rem, 2.5vw + 0.5rem, 2.75rem)";
        readonly fontWeight: 700;
        readonly lineHeight: 1.2;
        readonly letterSpacing: "-0.015em";
    };
    readonly heading2: {
        readonly fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif";
        readonly fontSize: "clamp(1.375rem, 1.5vw + 0.5rem, 2rem)";
        readonly fontWeight: 600;
        readonly lineHeight: 1.3;
        readonly letterSpacing: "-0.01em";
    };
    readonly heading3: {
        readonly fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif";
        readonly fontSize: "clamp(1.125rem, 1vw + 0.5rem, 1.5rem)";
        readonly fontWeight: 600;
        readonly lineHeight: 1.35;
        readonly letterSpacing: "-0.005em";
    };
    readonly hindiDisplay: {
        readonly fontFamily: "'Noto Sans Devanagari', sans-serif";
        readonly fontSize: "clamp(1.25rem, 2vw + 0.5rem, 2rem)";
        readonly fontWeight: 700;
        readonly lineHeight: 1.4;
    };
    readonly hindiBody: {
        readonly fontFamily: "'Noto Sans Devanagari', sans-serif";
        readonly fontSize: "clamp(1rem, 1vw + 0.25rem, 1.25rem)";
        readonly fontWeight: 400;
        readonly lineHeight: 1.6;
    };
    readonly bodyLarge: {
        readonly fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif";
        readonly fontSize: "clamp(1.0625rem, 0.5vw + 0.875rem, 1.25rem)";
        readonly fontWeight: 400;
        readonly lineHeight: 1.6;
        readonly maxWidth: "65ch";
    };
    readonly bodyBase: {
        readonly fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif";
        readonly fontSize: "1rem";
        readonly fontWeight: 400;
        readonly lineHeight: 1.6;
        readonly maxWidth: "65ch";
    };
    readonly bodySmall: {
        readonly fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif";
        readonly fontSize: "0.875rem";
        readonly fontWeight: 400;
        readonly lineHeight: 1.5;
        readonly maxWidth: "70ch";
    };
    readonly eyebrow: {
        readonly fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif";
        readonly fontSize: "0.6875rem";
        readonly fontWeight: 600;
        readonly lineHeight: 1;
        readonly letterSpacing: "0.1em";
        readonly textTransform: "uppercase";
    };
    readonly priceHero: {
        readonly fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif";
        readonly fontSize: "clamp(3rem, 6vw, 5rem)";
        readonly fontWeight: 700;
        readonly lineHeight: 1;
        readonly letterSpacing: "-0.03em";
        readonly fontVariantNumeric: "tabular-nums";
    };
    readonly statNumber: {
        readonly fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif";
        readonly fontSize: "clamp(2rem, 3.5vw, 3rem)";
        readonly fontWeight: 700;
        readonly lineHeight: 1;
        readonly letterSpacing: "-0.02em";
        readonly fontVariantNumeric: "tabular-nums";
    };
};
/**
 * Spacing System (UI/UX §1.2)
 */
export declare const spacing: {
    readonly sectionVertical: "clamp(5rem, 8vw, 8rem)";
    readonly sectionSmall: "clamp(3rem, 5vw, 5rem)";
    readonly containerMax: "1280px";
    readonly containerPadding: "clamp(1rem, 4vw, 3rem)";
    readonly cardPadding: "2rem";
    readonly cardPaddingLg: "2.5rem";
    readonly cardGap: "1.5rem";
    readonly cardGapLg: "2rem";
    readonly headingMarginBottom: "1rem";
    readonly bodyMarginBottom: "1.5rem";
    readonly sectionLabelGap: "0.5rem";
    readonly buttonHeight: "52px";
    readonly buttonHeightLg: "60px";
    readonly buttonPaddingX: "1.75rem";
    readonly inputHeight: "52px";
    readonly mobile: {
        readonly xs: 4;
        readonly sm: 8;
        readonly md: 12;
        readonly lg: 16;
        readonly xl: 24;
        readonly xxl: 32;
        readonly xxxl: 48;
        readonly xxxxl: 64;
        readonly xxxxxl: 96;
        readonly padding: 16;
        readonly cardPadding: 16;
        readonly cardPaddingLg: 20;
        readonly sectionGap: 24;
        readonly elementGap: 12;
        readonly tightGap: 8;
    };
    readonly mobileCardPadding: 16;
    readonly mobilePadding: 16;
    readonly mobileGap: 12;
};
/**
 * Spacing System (Web)
 */
export declare const WebSpacing: {
    readonly sectionVertical: "clamp(5rem, 8vw, 8rem)";
    readonly sectionSmall: "clamp(3rem, 5vw, 5rem)";
    readonly containerMax: "1280px";
    readonly containerPadding: "clamp(1rem, 4vw, 3rem)";
    readonly cardPadding: "2rem";
    readonly cardPaddingLg: "2.5rem";
    readonly cardGap: "1.5rem";
    readonly cardGapLg: "2rem";
    readonly headingMarginBottom: "1rem";
    readonly bodyMarginBottom: "1.5rem";
    readonly sectionLabelGap: "0.5rem";
    readonly buttonHeight: "52px";
    readonly buttonHeightLg: "60px";
    readonly buttonPaddingX: "1.75rem";
    readonly inputHeight: "52px";
    readonly mobile: {
        readonly xs: 4;
        readonly sm: 8;
        readonly md: 12;
        readonly lg: 16;
        readonly xl: 24;
        readonly xxl: 32;
        readonly xxxl: 48;
        readonly xxxxl: 64;
        readonly xxxxxl: 96;
        readonly padding: 16;
        readonly cardPadding: 16;
        readonly cardPaddingLg: 20;
        readonly sectionGap: 24;
        readonly elementGap: 12;
        readonly tightGap: 8;
    };
    readonly mobileCardPadding: 16;
    readonly mobilePadding: 16;
    readonly mobileGap: 12;
};
/**
 * Radius System (UI/UX §1.2)
 */
export declare const radius: {
    readonly sm: 4;
    readonly md: 8;
    readonly lg: 12;
    readonly xl: 16;
    readonly full: 9999;
};
/**
 * Elevation System (UI/UX §1.2)
 */
export declare const elevation: {
    readonly none: 0;
    readonly sm: 1;
    readonly md: 2;
    readonly lg: 4;
    readonly xl: 8;
};
/**
 * Motion Tokens (UI/UX §1.2 + 07_motion_animation_master.md)
 */
export declare const motion: {
    readonly easeOutQuart: "cubic-bezier(0.25, 1, 0.5, 1)";
    readonly easeOutExpo: "cubic-bezier(0.16, 1, 0.3, 1)";
    readonly easeOutQuint: "cubic-bezier(0.22, 1, 0.36, 1)";
    readonly instant: 100;
    readonly quick: 200;
    readonly standard: 300;
    readonly enter: 500;
    readonly elaborate: 800;
    readonly springSnappy: {
        readonly type: "spring";
        readonly stiffness: 400;
        readonly damping: 30;
    };
    readonly springSmooth: {
        readonly type: "spring";
        readonly stiffness: 200;
        readonly damping: 25;
    };
    readonly springHeavy: {
        readonly type: "spring";
        readonly stiffness: 100;
        readonly damping: 20;
    };
};
/**
 * Motion Tokens (Web)
 */
export declare const WebMotion: {
    readonly easeOutQuart: "cubic-bezier(0.25, 1, 0.5, 1)";
    readonly easeOutExpo: "cubic-bezier(0.16, 1, 0.3, 1)";
    readonly easeOutQuint: "cubic-bezier(0.22, 1, 0.36, 1)";
    readonly instant: "100ms";
    readonly quick: "200ms";
    readonly standard: "300ms";
    readonly enter: "500ms";
    readonly elaborate: "800ms";
    readonly springSnappy: {
        readonly type: "spring";
        readonly stiffness: 400;
        readonly damping: 30;
    };
    readonly springSmooth: {
        readonly type: "spring";
        readonly stiffness: 200;
        readonly damping: 25;
    };
    readonly springHeavy: {
        readonly type: "spring";
        readonly stiffness: 100;
        readonly damping: 20;
    };
};
declare const _default: {
    colors: {
        readonly brandOrange700: "#D4551A";
        readonly brandOrange500: "#E86A2A";
        readonly brandOrange50: "#FDF0E8";
        readonly brandOrange25: "#FEF7F2";
        readonly brandGreen700: "#1A6B3C";
        readonly brandGreen500: "#2E8653";
        readonly brandGreen50: "#E8F5EE";
        readonly brandGreen25: "#F4FAF6";
        readonly saffronOrange: "#E8621A";
        readonly saffronLight: "#FDF0E8";
        readonly amber500: "#F5A623";
        readonly amberLight: "#FEF8EC";
        readonly red600: "#C0392B";
        readonly redLight: "#FDF0EF";
        readonly neutral900: "#2B1D15";
        readonly neutral700: "#4A3528";
        readonly neutral500: "#7A5A4A";
        readonly neutral400: "#9A7A6A";
        readonly neutral200: "#D4C4BC";
        readonly neutral100: "#F2E8E2";
        readonly neutral50: "#FAF5F2";
        readonly white: "#FFFFFF";
        readonly cardSurface: "#FFFFFF";
        readonly glassWhite10: "rgba(255,255,255,0.10)";
        readonly glassWhite15: "rgba(255,255,255,0.15)";
        readonly opacity10: "rgba(255,255,255,0.10)";
        readonly opacity15: "rgba(255,255,255,0.15)";
        readonly opacity20: "rgba(255,255,255,0.20)";
        readonly opacity30: "rgba(255,255,255,0.30)";
        readonly opacity60: "rgba(255,255,255,0.60)";
        readonly opacity70: "rgba(255,255,255,0.70)";
        readonly opacity85: "rgba(255,255,255,0.85)";
        readonly opacity90: "rgba(255,255,255,0.90)";
    };
    gradients: {
        heroGradient: string;
        accentGradient: string;
        trustGradient: string;
    };
    typography: {
        readonly displayHero: {
            readonly fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif";
            readonly fontSize: "clamp(2.5rem, 5vw + 1rem, 4.5rem)";
            readonly fontWeight: 700;
            readonly lineHeight: 1.1;
            readonly letterSpacing: "-0.02em";
        };
        readonly displayLarge: {
            readonly fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif";
            readonly fontSize: "clamp(2rem, 3.5vw + 0.75rem, 3.5rem)";
            readonly fontWeight: 700;
            readonly lineHeight: 1.15;
            readonly letterSpacing: "-0.015em";
        };
        readonly heading1: {
            readonly fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif";
            readonly fontSize: "clamp(1.75rem, 2.5vw + 0.5rem, 2.75rem)";
            readonly fontWeight: 700;
            readonly lineHeight: 1.2;
            readonly letterSpacing: "-0.015em";
        };
        readonly heading2: {
            readonly fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif";
            readonly fontSize: "clamp(1.375rem, 1.5vw + 0.5rem, 2rem)";
            readonly fontWeight: 600;
            readonly lineHeight: 1.3;
            readonly letterSpacing: "-0.01em";
        };
        readonly heading3: {
            readonly fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif";
            readonly fontSize: "clamp(1.125rem, 1vw + 0.5rem, 1.5rem)";
            readonly fontWeight: 600;
            readonly lineHeight: 1.35;
            readonly letterSpacing: "-0.005em";
        };
        readonly hindiDisplay: {
            readonly fontFamily: "'Noto Sans Devanagari', sans-serif";
            readonly fontSize: "clamp(1.25rem, 2vw + 0.5rem, 2rem)";
            readonly fontWeight: 700;
            readonly lineHeight: 1.4;
        };
        readonly hindiBody: {
            readonly fontFamily: "'Noto Sans Devanagari', sans-serif";
            readonly fontSize: "clamp(1rem, 1vw + 0.25rem, 1.25rem)";
            readonly fontWeight: 400;
            readonly lineHeight: 1.6;
        };
        readonly bodyLarge: {
            readonly fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif";
            readonly fontSize: "clamp(1.0625rem, 0.5vw + 0.875rem, 1.25rem)";
            readonly fontWeight: 400;
            readonly lineHeight: 1.6;
            readonly maxWidth: "65ch";
        };
        readonly bodyBase: {
            readonly fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif";
            readonly fontSize: "1rem";
            readonly fontWeight: 400;
            readonly lineHeight: 1.6;
            readonly maxWidth: "65ch";
        };
        readonly bodySmall: {
            readonly fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif";
            readonly fontSize: "0.875rem";
            readonly fontWeight: 400;
            readonly lineHeight: 1.5;
            readonly maxWidth: "70ch";
        };
        readonly eyebrow: {
            readonly fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif";
            readonly fontSize: "0.6875rem";
            readonly fontWeight: 600;
            readonly lineHeight: 1;
            readonly letterSpacing: "0.1em";
            readonly textTransform: "uppercase";
        };
        readonly priceHero: {
            readonly fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif";
            readonly fontSize: "clamp(3rem, 6vw, 5rem)";
            readonly fontWeight: 700;
            readonly lineHeight: 1;
            readonly letterSpacing: "-0.03em";
            readonly fontVariantNumeric: "tabular-nums";
        };
        readonly statNumber: {
            readonly fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif";
            readonly fontSize: "clamp(2rem, 3.5vw, 3rem)";
            readonly fontWeight: 700;
            readonly lineHeight: 1;
            readonly letterSpacing: "-0.02em";
            readonly fontVariantNumeric: "tabular-nums";
        };
    };
    mobileTypography: {
        readonly displayPrice: {
            readonly fontFamily: "NotoSansDevanagari-Bold";
            readonly fontSize: 56;
            readonly fontWeight: "700";
            readonly lineHeight: 1.14;
        };
        readonly displayLabel: {
            readonly fontFamily: "NotoSansDevanagari-SemiBold";
            readonly fontSize: 20;
            readonly fontWeight: "600";
            readonly lineHeight: 1.2;
        };
        readonly heading1: {
            readonly fontFamily: "NotoSansDevanagari-Bold";
            readonly fontSize: 28;
            readonly fontWeight: "700";
            readonly lineHeight: 1.25;
        };
        readonly heading2: {
            readonly fontFamily: "NotoSansDevanagari-SemiBold";
            readonly fontSize: 22;
            readonly fontWeight: "600";
            readonly lineHeight: 1.3;
        };
        readonly heading3: {
            readonly fontFamily: "NotoSansDevanagari-SemiBold";
            readonly fontSize: 18;
            readonly fontWeight: "600";
            readonly lineHeight: 1.33;
        };
        readonly bodyLarge: {
            readonly fontFamily: "NotoSansDevanagari-Regular";
            readonly fontSize: 17;
            readonly fontWeight: "400";
            readonly lineHeight: 1.53;
        };
        readonly body: {
            readonly fontFamily: "NotoSansDevanagari-Regular";
            readonly fontSize: 16;
            readonly fontWeight: "400";
            readonly lineHeight: 1.5;
        };
        readonly bodySmall: {
            readonly fontFamily: "NotoSansDevanagari-Regular";
            readonly fontSize: 14;
            readonly fontWeight: "400";
            readonly lineHeight: 1.43;
        };
        readonly caption: {
            readonly fontFamily: "NotoSansDevanagari-Regular";
            readonly fontSize: 13;
            readonly fontWeight: "400";
            readonly lineHeight: 1.38;
        };
        readonly button: {
            readonly fontFamily: "NotoSansDevanagari-Bold";
            readonly fontSize: 18;
            readonly fontWeight: "700";
            readonly lineHeight: 1;
        };
        readonly badge: {
            readonly fontFamily: "NotoSansDevanagari-SemiBold";
            readonly fontSize: 12;
            readonly fontWeight: "600";
            readonly lineHeight: 1;
        };
        readonly overline: {
            readonly fontFamily: "NotoSansDevanagari-SemiBold";
            readonly fontSize: 11;
            readonly fontWeight: "600";
            readonly lineHeight: 1.45;
            readonly textTransform: "uppercase";
            readonly letterSpacing: "0.05em";
        };
    };
    spacing: {
        readonly sectionVertical: "clamp(5rem, 8vw, 8rem)";
        readonly sectionSmall: "clamp(3rem, 5vw, 5rem)";
        readonly containerMax: "1280px";
        readonly containerPadding: "clamp(1rem, 4vw, 3rem)";
        readonly cardPadding: "2rem";
        readonly cardPaddingLg: "2.5rem";
        readonly cardGap: "1.5rem";
        readonly cardGapLg: "2rem";
        readonly headingMarginBottom: "1rem";
        readonly bodyMarginBottom: "1.5rem";
        readonly sectionLabelGap: "0.5rem";
        readonly buttonHeight: "52px";
        readonly buttonHeightLg: "60px";
        readonly buttonPaddingX: "1.75rem";
        readonly inputHeight: "52px";
        readonly mobile: {
            readonly xs: 4;
            readonly sm: 8;
            readonly md: 12;
            readonly lg: 16;
            readonly xl: 24;
            readonly xxl: 32;
            readonly xxxl: 48;
            readonly xxxxl: 64;
            readonly xxxxxl: 96;
            readonly padding: 16;
            readonly cardPadding: 16;
            readonly cardPaddingLg: 20;
            readonly sectionGap: 24;
            readonly elementGap: 12;
            readonly tightGap: 8;
        };
        readonly mobileCardPadding: 16;
        readonly mobilePadding: 16;
        readonly mobileGap: 12;
    };
    radius: {
        readonly sm: 4;
        readonly md: 8;
        readonly lg: 12;
        readonly xl: 16;
        readonly full: 9999;
    };
    elevation: {
        readonly none: 0;
        readonly sm: 1;
        readonly md: 2;
        readonly lg: 4;
        readonly xl: 8;
    };
    motion: {
        readonly easeOutQuart: "cubic-bezier(0.25, 1, 0.5, 1)";
        readonly easeOutExpo: "cubic-bezier(0.16, 1, 0.3, 1)";
        readonly easeOutQuint: "cubic-bezier(0.22, 1, 0.36, 1)";
        readonly instant: 100;
        readonly quick: 200;
        readonly standard: 300;
        readonly enter: 500;
        readonly elaborate: 800;
        readonly springSnappy: {
            readonly type: "spring";
            readonly stiffness: 400;
            readonly damping: 30;
        };
        readonly springSmooth: {
            readonly type: "spring";
            readonly stiffness: 200;
            readonly damping: 25;
        };
        readonly springHeavy: {
            readonly type: "spring";
            readonly stiffness: 100;
            readonly damping: 20;
        };
    };
    WebTokens: WebTokensType;
    WebTypography: {
        readonly displayHero: {
            readonly fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif";
            readonly fontSize: "clamp(2.5rem, 5vw + 1rem, 4.5rem)";
            readonly fontWeight: 700;
            readonly lineHeight: 1.1;
            readonly letterSpacing: "-0.02em";
        };
        readonly displayLarge: {
            readonly fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif";
            readonly fontSize: "clamp(2rem, 3.5vw + 0.75rem, 3.5rem)";
            readonly fontWeight: 700;
            readonly lineHeight: 1.15;
            readonly letterSpacing: "-0.015em";
        };
        readonly heading1: {
            readonly fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif";
            readonly fontSize: "clamp(1.75rem, 2.5vw + 0.5rem, 2.75rem)";
            readonly fontWeight: 700;
            readonly lineHeight: 1.2;
            readonly letterSpacing: "-0.015em";
        };
        readonly heading2: {
            readonly fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif";
            readonly fontSize: "clamp(1.375rem, 1.5vw + 0.5rem, 2rem)";
            readonly fontWeight: 600;
            readonly lineHeight: 1.3;
            readonly letterSpacing: "-0.01em";
        };
        readonly heading3: {
            readonly fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif";
            readonly fontSize: "clamp(1.125rem, 1vw + 0.5rem, 1.5rem)";
            readonly fontWeight: 600;
            readonly lineHeight: 1.35;
            readonly letterSpacing: "-0.005em";
        };
        readonly hindiDisplay: {
            readonly fontFamily: "'Noto Sans Devanagari', sans-serif";
            readonly fontSize: "clamp(1.25rem, 2vw + 0.5rem, 2rem)";
            readonly fontWeight: 700;
            readonly lineHeight: 1.4;
        };
        readonly hindiBody: {
            readonly fontFamily: "'Noto Sans Devanagari', sans-serif";
            readonly fontSize: "clamp(1rem, 1vw + 0.25rem, 1.25rem)";
            readonly fontWeight: 400;
            readonly lineHeight: 1.6;
        };
        readonly bodyLarge: {
            readonly fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif";
            readonly fontSize: "clamp(1.0625rem, 0.5vw + 0.875rem, 1.25rem)";
            readonly fontWeight: 400;
            readonly lineHeight: 1.6;
            readonly maxWidth: "65ch";
        };
        readonly bodyBase: {
            readonly fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif";
            readonly fontSize: "1rem";
            readonly fontWeight: 400;
            readonly lineHeight: 1.6;
            readonly maxWidth: "65ch";
        };
        readonly bodySmall: {
            readonly fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif";
            readonly fontSize: "0.875rem";
            readonly fontWeight: 400;
            readonly lineHeight: 1.5;
            readonly maxWidth: "70ch";
        };
        readonly eyebrow: {
            readonly fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif";
            readonly fontSize: "0.6875rem";
            readonly fontWeight: 600;
            readonly lineHeight: 1;
            readonly letterSpacing: "0.1em";
            readonly textTransform: "uppercase";
        };
        readonly priceHero: {
            readonly fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif";
            readonly fontSize: "clamp(3rem, 6vw, 5rem)";
            readonly fontWeight: 700;
            readonly lineHeight: 1;
            readonly letterSpacing: "-0.03em";
            readonly fontVariantNumeric: "tabular-nums";
        };
        readonly statNumber: {
            readonly fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif";
            readonly fontSize: "clamp(2rem, 3.5vw, 3rem)";
            readonly fontWeight: 700;
            readonly lineHeight: 1;
            readonly letterSpacing: "-0.02em";
            readonly fontVariantNumeric: "tabular-nums";
        };
    };
    WebSpacing: {
        readonly sectionVertical: "clamp(5rem, 8vw, 8rem)";
        readonly sectionSmall: "clamp(3rem, 5vw, 5rem)";
        readonly containerMax: "1280px";
        readonly containerPadding: "clamp(1rem, 4vw, 3rem)";
        readonly cardPadding: "2rem";
        readonly cardPaddingLg: "2.5rem";
        readonly cardGap: "1.5rem";
        readonly cardGapLg: "2rem";
        readonly headingMarginBottom: "1rem";
        readonly bodyMarginBottom: "1.5rem";
        readonly sectionLabelGap: "0.5rem";
        readonly buttonHeight: "52px";
        readonly buttonHeightLg: "60px";
        readonly buttonPaddingX: "1.75rem";
        readonly inputHeight: "52px";
        readonly mobile: {
            readonly xs: 4;
            readonly sm: 8;
            readonly md: 12;
            readonly lg: 16;
            readonly xl: 24;
            readonly xxl: 32;
            readonly xxxl: 48;
            readonly xxxxl: 64;
            readonly xxxxxl: 96;
            readonly padding: 16;
            readonly cardPadding: 16;
            readonly cardPaddingLg: 20;
            readonly sectionGap: 24;
            readonly elementGap: 12;
            readonly tightGap: 8;
        };
        readonly mobileCardPadding: 16;
        readonly mobilePadding: 16;
        readonly mobileGap: 12;
    };
    WebMotion: {
        readonly easeOutQuart: "cubic-bezier(0.25, 1, 0.5, 1)";
        readonly easeOutExpo: "cubic-bezier(0.16, 1, 0.3, 1)";
        readonly easeOutQuint: "cubic-bezier(0.22, 1, 0.36, 1)";
        readonly instant: "100ms";
        readonly quick: "200ms";
        readonly standard: "300ms";
        readonly enter: "500ms";
        readonly elaborate: "800ms";
        readonly springSnappy: {
            readonly type: "spring";
            readonly stiffness: 400;
            readonly damping: 30;
        };
        readonly springSmooth: {
            readonly type: "spring";
            readonly stiffness: 200;
            readonly damping: 25;
        };
        readonly springHeavy: {
            readonly type: "spring";
            readonly stiffness: 100;
            readonly damping: 20;
        };
    };
};
export default _default;
//# sourceMappingURL=tokens.d.ts.map