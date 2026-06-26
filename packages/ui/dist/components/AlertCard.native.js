import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View, Text, StyleSheet, TouchableOpacity, Platform, } from 'react-native';
import { colors, spacing, radius, elevation } from '../tokens';
const AlertCard = ({ alert, onPress }) => {
    // Get visual treatment based on alert type
    const getAlertStyle = () => {
        switch (alert.type) {
            case 'HPAI':
            case 'PRICE_CRASH':
                return {
                    backgroundColor: colors.redLight,
                    borderColor: colors.red600,
                    icon: '🚨',
                };
            case 'HEAT_WAVE':
            case 'FEED_COST':
                return {
                    backgroundColor: colors.amberLight,
                    borderColor: colors.amber500,
                    icon: '🌡️',
                };
            case 'POLICY':
                return {
                    backgroundColor: '#E8F4FD',
                    borderColor: '#2563EB',
                    icon: '⚖️',
                };
            default:
                return {
                    backgroundColor: colors.neutral50,
                    borderColor: colors.neutral400,
                    icon: 'ℹ️',
                };
        }
    };
    const alertStyle = getAlertStyle();
    // Get severity indicator
    const getSeverityColor = () => {
        switch (alert.severity) {
            case 'high':
                return colors.red600;
            case 'medium':
                return colors.amber500;
            case 'low':
                return colors.brandGreen700;
            default:
                return colors.neutral500;
        }
    };
    return (_jsxs(TouchableOpacity, { style: [styles.container, { borderColor: alertStyle.borderColor }], onPress: onPress, activeOpacity: 0.8, accessible: true, accessibilityRole: "alert", accessibilityLiveRegion: "assertive", accessibilityLabel: `${alert.title}. ${alert.message}`, children: [_jsx(View, { style: [styles.leftBorder, { backgroundColor: alertStyle.borderColor }] }), _jsx(View, { style: styles.iconContainer, children: _jsx(Text, { style: styles.icon, children: alertStyle.icon }) }), _jsxs(View, { style: styles.contentContainer, children: [_jsx(Text, { style: styles.title, children: alert.title }), _jsx(Text, { style: styles.message, children: alert.message }), alert.source && (_jsxs(Text, { style: styles.source, children: ["\u0938\u094D\u0930\u094B\u0924: ", alert.source] }))] }), _jsx(View, { style: styles.timestampContainer, children: _jsx(Text, { style: styles.timestamp, children: new Date(alert.timestamp).toLocaleDateString('hi-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                    }) }) })] }));
};
const styles = StyleSheet.create({
    container: Object.assign({ flexDirection: 'row', backgroundColor: colors.cardSurface, borderRadius: radius.lg, borderWidth: 1, padding: spacing.mobileCardPadding, marginBottom: spacing.mobileGap }, Platform.select({
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
    leftBorder: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 4,
        borderTopLeftRadius: radius.lg,
        borderBottomLeftRadius: radius.lg,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.neutral50,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.mobileGap,
    },
    icon: {
        fontSize: 20,
    },
    contentContainer: {
        flex: 1,
    },
    title: {
        fontFamily: 'NotoSansDevanagari-Bold',
        fontSize: 16,
        fontWeight: '700',
        color: colors.neutral900,
        marginBottom: 4,
    },
    message: {
        fontFamily: 'NotoSansDevanagari-Regular',
        fontSize: 14,
        color: colors.neutral700,
        marginBottom: 4,
    },
    source: {
        fontFamily: 'NotoSansDevanagari-Regular',
        fontSize: 12,
        color: colors.neutral400,
    },
    timestampContainer: {
        marginLeft: spacing.mobileGap,
    },
    timestamp: {
        fontFamily: 'NotoSansDevanagari-Regular',
        fontSize: 11,
        color: colors.neutral400,
    },
});
export default AlertCard;
