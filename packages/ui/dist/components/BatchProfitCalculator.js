import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// PoultryPulse AI — Batch Profit Calculator Component
// File: packages/ui/src/components/BatchProfitCalculator.tsx
// Platform: React Native
// Design Reference: PoultryPulse_UIUX_Design_v1.md §3.3 (Sell Signal Screen)
import { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, } from 'react-native';
import { colors, spacing, radius } from '../tokens';
const BatchProfitCalculator = ({ initialFlockSize = 10000, initialAvgWeight = 2.5, currentPrice = 0, onProfitChange, }) => {
    const [flockSize, setFlockSize] = useState(initialFlockSize.toString());
    const [avgWeight, setAvgWeight] = useState(initialAvgWeight.toString());
    const [pricePerKg, setPricePerKg] = useState(currentPrice.toString());
    // Calculate profit
    const calculateProfit = () => {
        const flock = parseFloat(flockSize) || 0;
        const weight = parseFloat(avgWeight) || 0;
        const price = parseFloat(pricePerKg) || 0;
        return flock * weight * price;
    };
    const profit = calculateProfit();
    // Notify parent of profit changes
    useEffect(() => {
        if (onProfitChange) {
            onProfitChange(profit);
        }
    }, [profit, onProfitChange]);
    const formatIndianCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };
    return (_jsxs(ScrollView, { style: styles.container, keyboardShouldPersistTaps: "handled", children: [_jsx(Text, { style: styles.title, children: "\u0932\u093E\u092D \u0915\u0948\u0932\u0915\u0941\u0932\u0947\u091F\u0930" }), _jsxs(View, { style: styles.inputGroup, children: [_jsx(Text, { style: styles.label, children: "\u092A\u0915\u094D\u0937\u093F\u092F\u094B\u0902 \u0915\u0940 \u0938\u0902\u0916\u094D\u092F\u093E" }), _jsx(TextInput, { style: styles.input, value: flockSize, onChangeText: setFlockSize, keyboardType: "numeric", placeholder: "10000", placeholderTextColor: colors.neutral400 }), _jsx(Text, { style: styles.unit, children: "\u092A\u0915\u094D\u0937\u0940" })] }), _jsxs(View, { style: styles.inputGroup, children: [_jsx(Text, { style: styles.label, children: "\u0914\u0938\u0924 \u0935\u091C\u0928 (kg)" }), _jsx(TextInput, { style: styles.input, value: avgWeight, onChangeText: setAvgWeight, keyboardType: "decimal-pad", placeholder: "2.5", placeholderTextColor: colors.neutral400 }), _jsx(Text, { style: styles.unit, children: "kg" })] }), _jsxs(View, { style: styles.inputGroup, children: [_jsx(Text, { style: styles.label, children: "\u092D\u093E\u0935 (\u20B9/kg)" }), _jsx(TextInput, { style: styles.input, value: pricePerKg, onChangeText: setPricePerKg, keyboardType: "decimal-pad", placeholder: "0.00", placeholderTextColor: colors.neutral400 }), _jsx(Text, { style: styles.unit, children: "\u20B9/kg" })] }), _jsxs(View, { style: styles.profitContainer, children: [_jsx(Text, { style: styles.profitLabel, children: "\u0905\u0928\u0941\u092E\u093E\u0928\u093F\u0924 \u0915\u0941\u0932 \u0932\u093E\u092D:" }), _jsx(Text, { style: styles.profitValue, children: formatIndianCurrency(profit) })] }), _jsxs(View, { style: styles.breakdownContainer, children: [_jsx(Text, { style: styles.breakdownTitle, children: "\u0917\u0923\u0928\u093E \u0935\u093F\u0935\u0930\u0923:" }), _jsxs(View, { style: styles.breakdownRow, children: [_jsx(Text, { style: styles.breakdownLabel, children: "\u0915\u0941\u0932 \u0935\u091C\u0928:" }), _jsxs(Text, { style: styles.breakdownValue, children: [((parseFloat(flockSize) || 0) * (parseFloat(avgWeight) || 0)).toFixed(2), " kg"] })] }), _jsxs(View, { style: styles.breakdownRow, children: [_jsx(Text, { style: styles.breakdownLabel, children: "\u092D\u093E\u0935:" }), _jsxs(Text, { style: styles.breakdownValue, children: ["\u20B9", pricePerKg, "/kg"] })] })] })] }));
};
const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.cardSurface,
        borderRadius: radius.lg,
        padding: spacing.mobileCardPadding,
    },
    title: {
        fontFamily: 'NotoSansDevanagari-Bold',
        fontSize: 18,
        fontWeight: '700',
        color: colors.neutral900,
        marginBottom: spacing.mobileGap,
    },
    inputGroup: {
        marginBottom: spacing.mobileGap,
        position: 'relative',
    },
    label: {
        fontFamily: 'NotoSansDevanagari-Regular',
        fontSize: 14,
        color: colors.neutral700,
        marginBottom: 8,
    },
    input: {
        fontFamily: 'NotoSansDevanagari-Regular',
        fontSize: 16,
        color: colors.neutral900,
        backgroundColor: colors.neutral50,
        borderWidth: 1,
        borderColor: colors.neutral200,
        borderRadius: radius.md,
        padding: 12,
        paddingRight: 60,
    },
    unit: {
        position: 'absolute',
        right: 12,
        top: 44,
        fontFamily: 'NotoSansDevanagari-Regular',
        fontSize: 12,
        color: colors.neutral500,
    },
    profitContainer: {
        backgroundColor: colors.brandGreen50,
        borderRadius: radius.md,
        padding: spacing.mobilePadding,
        marginTop: spacing.mobileGap,
        alignItems: 'center',
    },
    profitLabel: {
        fontFamily: 'NotoSansDevanagari-Regular',
        fontSize: 14,
        color: colors.neutral700,
        marginBottom: 4,
    },
    profitValue: {
        fontFamily: 'NotoSansDevanagari-Bold',
        fontSize: 28,
        fontWeight: '800',
        color: colors.brandGreen700,
    },
    breakdownContainer: {
        marginTop: spacing.mobileGap,
        paddingTop: spacing.mobileGap,
        borderTopWidth: 1,
        borderTopColor: colors.neutral200,
    },
    breakdownTitle: {
        fontFamily: 'NotoSansDevanagari-Bold',
        fontSize: 14,
        fontWeight: '600',
        color: colors.neutral900,
        marginBottom: 8,
    },
    breakdownRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    breakdownLabel: {
        fontFamily: 'NotoSansDevanagari-Regular',
        fontSize: 13,
        color: colors.neutral500,
    },
    breakdownValue: {
        fontFamily: 'NotoSansDevanagari-Bold',
        fontSize: 13,
        fontWeight: '600',
        color: colors.neutral900,
    },
});
export default BatchProfitCalculator;
