import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
// PoultryPulse AI — Confidence Interval Bar Component (React Native)
// File: packages/ui/src/components/ConfidenceIntervalBar.native.tsx
// Platform: React Native
// Design Reference: PoultryPulse_UIUX_Design_v1.md §3.2 (Price Forecast Hero Screen)
import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, } from 'react-native';
import { colors, spacing, radius } from '../tokens';
const ConfidenceIntervalBar = ({ p10, p50, p90, confidence = 80, showTooltip = true, }) => {
    const [showTooltipState, setShowTooltipState] = useState(false);
    // Calculate positions for the bar
    const range = p90 - p10;
    const p10Position = 0;
    const p50Position = ((p50 - p10) / range) * 100;
    const p90Position = 100;
    const formatPrice = (price) => {
        return price.toFixed(2);
    };
    return (_jsxs(View, { style: styles.container, children: [_jsxs(Text, { style: styles.label, children: ["\u20B9", formatPrice(p10), " \u2013 \u20B9", formatPrice(p90), " \u0915\u0947 \u092C\u0940\u091A (", confidence, "% \u0938\u0902\u092D\u093E\u0935\u0928\u093E)"] }), _jsxs(TouchableOpacity, { style: styles.barContainer, onPress: () => setShowTooltipState(!showTooltipState), activeOpacity: 0.8, accessible: true, accessibilityLabel: `Price range from ₹${formatPrice(p10)} to ₹${formatPrice(p90)} with ${confidence}% confidence. Median price ₹${formatPrice(p50)}`, children: [_jsx(View, { style: styles.backgroundBar }), _jsx(View, { style: styles.rangeBar }), _jsx(View, { style: [
                            styles.p50Marker,
                            {
                                left: `${p50Position}%`,
                            },
                        ] }), showTooltip && showTooltipState && (_jsxs(View, { style: styles.tooltip, children: [_jsxs(Text, { style: styles.tooltipText, children: ["P50 (\u092E\u093E\u0927\u094D\u092F): \u20B9", formatPrice(p50)] }), _jsxs(Text, { style: styles.tooltipSubtext, children: [confidence, "% \u0938\u0902\u092D\u093E\u0935\u0928\u093E \u0907\u0938 \u0938\u0940\u092E\u093E \u092E\u0947\u0902"] })] }))] }), _jsxs(View, { style: styles.legend, children: [_jsxs(View, { style: styles.legendItem, children: [_jsx(View, { style: [styles.legendDot, { backgroundColor: colors.brandGreen500 }] }), _jsx(Text, { style: styles.legendText, children: "P10-P90 \u0938\u0940\u092E\u093E" })] }), _jsxs(View, { style: styles.legendItem, children: [_jsx(View, { style: [styles.legendDot, { backgroundColor: colors.neutral900 }] }), _jsx(Text, { style: styles.legendText, children: "P50 (\u092E\u093E\u0927\u094D\u092F)" })] })] })] }));
};
const styles = StyleSheet.create({
    container: {
        padding: spacing.mobilePadding,
    },
    label: {
        fontFamily: 'NotoSansDevanagari-Regular',
        fontSize: 13,
        color: colors.neutral400,
        marginBottom: 8,
        textAlign: 'center',
    },
    barContainer: {
        height: 24,
        position: 'relative',
        marginBottom: spacing.mobileGap,
    },
    backgroundBar: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: colors.neutral100,
        borderRadius: radius.sm,
    },
    rangeBar: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: colors.brandGreen500,
        borderRadius: radius.sm,
        opacity: 0.6,
    },
    p50Marker: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: 3,
        backgroundColor: colors.neutral900,
        transform: [{ translateX: -1.5 }],
    },
    tooltip: {
        position: 'absolute',
        bottom: 32,
        left: '50%',
        transform: [{ translateX: -75 }],
        backgroundColor: colors.neutral900,
        borderRadius: radius.md,
        padding: 8,
        minWidth: 150,
        zIndex: 10,
    },
    tooltipText: {
        fontFamily: 'NotoSansDevanagari-Bold',
        fontSize: 12,
        fontWeight: '600',
        color: colors.white,
        textAlign: 'center',
        marginBottom: 2,
    },
    tooltipSubtext: {
        fontFamily: 'NotoSansDevanagari-Regular',
        fontSize: 10,
        color: colors.neutral400,
        textAlign: 'center',
    },
    legend: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: spacing.mobileGap,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    legendText: {
        fontFamily: 'NotoSansDevanagari-Regular',
        fontSize: 11,
        color: colors.neutral500,
    },
});
export default ConfidenceIntervalBar;
