import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
// PoultryPulse AI — Price Hero Component
// File: packages/ui/src/components/PriceHero.tsx
// Platform: React Native
// Design Reference: PoultryPulse_UIUX_Design_v1.md §3.2 (Price Forecast Hero Screen)
import React from 'react';
import { View, Text, StyleSheet, AccessibilityInfo, Platform, } from 'react-native';
import { colors, spacing, radius, elevation } from '../tokens';
const PriceHero = ({ prediction, isStale, mandiName, }) => {
    const { p50, p10, p90, direction, changePercent, lastUpdated, confidence } = prediction;
    // Calculate staleness hours
    const hoursSinceUpdate = React.useMemo(() => {
        const updateDate = new Date(lastUpdated);
        const now = new Date();
        const diffMs = now.getTime() - updateDate.getTime();
        return Math.floor(diffMs / (1000 * 60 * 60));
    }, [lastUpdated]);
    // Format price with Indian number system
    const formatPrice = (price) => {
        return price.toFixed(2);
    };
    // Get direction icon and color
    const getDirectionIcon = () => {
        switch (direction) {
            case 'up':
                return '↑';
            case 'down':
                return '↓';
            default:
                return '→';
        }
    };
    const getDirectionColor = () => {
        switch (direction) {
            case 'up':
                return colors.brandGreen700;
            case 'down':
                return colors.red600;
            default:
                return colors.neutral500;
        }
    };
    // Announce price change for accessibility using accessibilityLiveRegion
    React.useEffect(() => {
        if (Platform.OS === 'android' || Platform.OS === 'ios') {
            AccessibilityInfo.announceForAccessibility(`Price ${direction === 'up' ? 'increased' : direction === 'down' ? 'decreased' : 'remained stable'} by ${Math.abs(changePercent).toFixed(1)} percent`);
        }
    }, [direction, changePercent]);
    return (_jsxs(View, { style: styles.container, accessible: true, accessibilityLabel: `Current price for ${mandiName} is ₹${formatPrice(p50)} per kilogram`, accessibilityLiveRegion: "polite", children: [isStale && (_jsx(View, { style: styles.staleBanner, children: _jsxs(Text, { style: styles.staleText, children: ["\u092F\u0939 \u0921\u0947\u091F\u093E ", hoursSinceUpdate, " \u0918\u0902\u091F\u0947 \u092A\u0941\u0930\u093E\u0928\u093E \u0939\u0948"] }) })), _jsxs(View, { style: styles.priceContainer, children: [_jsxs(Text, { style: styles.priceText, maxFontSizeMultiplier: 1.2, accessibilityLabel: `Price ${formatPrice(p50)} rupees per kilogram`, children: ["\u20B9", formatPrice(p50)] }), _jsx(Text, { style: styles.unitLabel, children: "\u20B9/kg" })] }), _jsxs(View, { style: styles.changeContainer, children: [_jsxs(Text, { style: [styles.changeText, { color: getDirectionColor() }], children: [getDirectionIcon(), " ", Math.abs(changePercent).toFixed(1), "%"] }), _jsx(Text, { style: styles.changeLabel, children: "vs yesterday" })] }), _jsxs(View, { style: styles.confidenceContainer, children: [_jsxs(Text, { style: styles.confidenceLabel, children: ["\u20B9", formatPrice(p10), " \u2013 \u20B9", formatPrice(p90), " \u0915\u0947 \u092C\u0940\u091A (", confidence, "% \u0938\u0902\u092D\u093E\u0935\u0928\u093E)"] }), _jsxs(View, { style: styles.confidenceBar, children: [_jsx(View, { style: [
                                    styles.confidenceFill,
                                    {
                                        left: `${((p10 - p10) / (p90 - p10)) * 100}%`,
                                        width: '100%',
                                    },
                                ] }), _jsx(View, { style: [
                                    styles.p50Marker,
                                    {
                                        left: `${((p50 - p10) / (p90 - p10)) * 100}%`,
                                    },
                                ] })] })] }), _jsx(View, { style: styles.updatedContainer, children: _jsxs(Text, { style: styles.updatedText, children: ["\u0905\u0902\u0924\u093F\u092E \u0905\u092A\u0921\u0947\u091F: ", new Date(lastUpdated).toLocaleDateString('hi-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                        })] }) })] }));
};
const styles = StyleSheet.create({
    container: Object.assign({ backgroundColor: colors.cardSurface, borderRadius: radius.lg, padding: spacing.mobileCardPadding }, Platform.select({
        ios: {
            shadowColor: colors.neutral900,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
        },
        android: {
            elevation: elevation.md,
        },
    })),
    staleBanner: {
        backgroundColor: colors.amberLight,
        paddingHorizontal: spacing.mobilePadding,
        paddingVertical: 8,
        borderRadius: radius.sm,
        marginBottom: spacing.mobileGap,
    },
    staleText: {
        fontFamily: 'NotoSansDevanagari-Bold',
        fontSize: 12,
        color: colors.amber500,
        textAlign: 'center',
    },
    priceContainer: {
        alignItems: 'center',
        marginVertical: spacing.mobileGap,
    },
    priceText: {
        fontFamily: 'NotoSansDevanagari-Bold',
        fontSize: 56,
        fontWeight: '800',
        color: colors.neutral900,
        lineHeight: 64,
        letterSpacing: -1,
    },
    unitLabel: {
        fontFamily: 'NotoSansDevanagari-Regular',
        fontSize: 14,
        color: colors.neutral500,
        marginTop: 4,
    },
    changeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        marginTop: spacing.mobileGap,
    },
    changeText: {
        fontFamily: 'NotoSansDevanagari-Bold',
        fontSize: 16,
        fontWeight: '600',
    },
    changeLabel: {
        fontFamily: 'NotoSansDevanagari-Regular',
        fontSize: 12,
        color: colors.neutral500,
    },
    confidenceContainer: {
        marginTop: spacing.mobileGap,
    },
    confidenceLabel: {
        fontFamily: 'NotoSansDevanagari-Regular',
        fontSize: 13,
        color: colors.neutral400,
        marginBottom: 8,
        textAlign: 'center',
    },
    confidenceBar: {
        height: 8,
        backgroundColor: colors.neutral100,
        borderRadius: 4,
        position: 'relative',
        overflow: 'hidden',
    },
    confidenceFill: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        backgroundColor: colors.brandGreen500,
        borderRadius: 4,
    },
    p50Marker: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: 2,
        backgroundColor: colors.neutral900,
        transform: [{ translateX: -1 }],
    },
    updatedContainer: {
        marginTop: spacing.mobileGap,
    },
    updatedText: {
        fontFamily: 'NotoSansDevanagari-Regular',
        fontSize: 11,
        color: colors.neutral400,
        textAlign: 'center',
    },
});
export default PriceHero;
