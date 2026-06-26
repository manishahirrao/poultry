import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
// PoultryPulse AI — Confidence Interval Bar Component (Web)
// File: packages/ui/src/components/ConfidenceIntervalBar.tsx
// Platform: Web (React)
// Design Reference: PoultryPulse_UIUX_Design_v1.md §3.2 (Price Forecast Hero Screen)
import { useState } from 'react';
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
    return (_jsxs("div", { className: "confidence-interval-bar", style: styles.container, children: [_jsxs("div", { style: styles.label, children: ["\u20B9", formatPrice(p10), " \u2013 \u20B9", formatPrice(p90), " \u0915\u0947 \u092C\u0940\u091A (", confidence, "% \u0938\u0902\u092D\u093E\u0935\u0928\u093E)"] }), _jsxs("div", { style: styles.barContainer, onClick: () => setShowTooltipState(!showTooltipState), role: "button", tabIndex: 0, "aria-label": `Price range from ₹${formatPrice(p10)} to ₹${formatPrice(p90)} with ${confidence}% confidence. Median price ₹${formatPrice(p50)}`, children: [_jsx("div", { style: styles.backgroundBar }), _jsx("div", { style: styles.rangeBar }), _jsx("div", { style: Object.assign(Object.assign({}, styles.p50Marker), { left: `${p50Position}%` }) }), showTooltip && showTooltipState && (_jsxs("div", { style: styles.tooltip, children: [_jsxs("div", { style: styles.tooltipText, children: ["P50 (\u092E\u093E\u0927\u094D\u092F): \u20B9", formatPrice(p50)] }), _jsxs("div", { style: styles.tooltipSubtext, children: [confidence, "% \u0938\u0902\u092D\u093E\u0935\u0928\u093E \u0907\u0938 \u0938\u0940\u092E\u093E \u092E\u0947\u0902"] })] }))] }), _jsxs("div", { style: styles.legend, children: [_jsxs("div", { style: styles.legendItem, children: [_jsx("div", { style: Object.assign(Object.assign({}, styles.legendDot), { backgroundColor: colors.brandGreen500 }) }), _jsx("div", { style: styles.legendText, children: "P10-P90 \u0938\u0940\u092E\u093E" })] }), _jsxs("div", { style: styles.legendItem, children: [_jsx("div", { style: Object.assign(Object.assign({}, styles.legendDot), { backgroundColor: colors.neutral900 }) }), _jsx("div", { style: styles.legendText, children: "P50 (\u092E\u093E\u0927\u094D\u092F)" })] })] })] }));
};
const styles = {
    container: {
        padding: `${spacing.mobilePadding}px`,
    },
    label: {
        fontFamily: "'Noto Sans Devanagari', sans-serif",
        fontSize: '13px',
        color: colors.neutral400,
        marginBottom: '8px',
        textAlign: 'center',
    },
    barContainer: {
        height: '24px',
        position: 'relative',
        marginBottom: `${spacing.mobileGap}px`,
        cursor: 'pointer',
    },
    backgroundBar: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: colors.neutral100,
        borderRadius: `${radius.sm}px`,
    },
    rangeBar: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: colors.brandGreen500,
        borderRadius: `${radius.sm}px`,
        opacity: 0.6,
    },
    p50Marker: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: '3px',
        backgroundColor: colors.neutral900,
        transform: 'translateX(-1.5px)',
    },
    tooltip: {
        position: 'absolute',
        bottom: '32px',
        left: '50%',
        transform: 'translateX(-75px)',
        backgroundColor: colors.neutral900,
        borderRadius: `${radius.md}px`,
        padding: '8px',
        minWidth: '150px',
        zIndex: 10,
    },
    tooltipText: {
        fontFamily: "'Noto Sans Devanagari', sans-serif",
        fontSize: '12px',
        fontWeight: 600,
        color: colors.white,
        textAlign: 'center',
        marginBottom: '2px',
    },
    tooltipSubtext: {
        fontFamily: "'Noto Sans Devanagari', sans-serif",
        fontSize: '10px',
        color: colors.neutral400,
        textAlign: 'center',
    },
    legend: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: `${spacing.mobileGap}px`,
    },
    legendItem: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendDot: {
        width: '8px',
        height: '8px',
        borderRadius: '4px',
        marginRight: '6px',
    },
    legendText: {
        fontFamily: "'Noto Sans Devanagari', sans-serif",
        fontSize: '11px',
        color: colors.neutral500,
    },
};
export default ConfidenceIntervalBar;
