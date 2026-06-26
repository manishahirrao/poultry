import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../tokens';
const EmptyState = ({ variant, title, message, actionLabel, onAction, }) => {
    // Get icon/illustration based on variant
    const getIcon = () => {
        switch (variant) {
            case 'no-data':
                return '📊';
            case 'offline':
                return '📡';
            case 'error':
                return '⚠️';
            case 'loading':
                return '⏳';
            default:
                return 'ℹ️';
        }
    };
    // Get background color based on variant
    const getBackgroundColor = () => {
        switch (variant) {
            case 'offline':
                return colors.amberLight;
            case 'error':
                return colors.redLight;
            default:
                return colors.neutral50;
        }
    };
    return (_jsxs(View, { style: [styles.container, { backgroundColor: getBackgroundColor() }], children: [_jsx(View, { style: styles.iconContainer, children: _jsx(Text, { style: styles.icon, children: getIcon() }) }), _jsx(Text, { style: styles.title, children: title }), message && _jsx(Text, { style: styles.message, children: message }), actionLabel && onAction && (_jsx(View, { style: styles.actionContainer, children: _jsx(Text, { style: styles.actionLabel, children: actionLabel }) }))] }));
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        borderRadius: radius.lg,
        padding: spacing.mobileCardPadding,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 200,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.mobileGap,
    },
    icon: {
        fontSize: 40,
    },
    title: {
        fontFamily: 'NotoSansDevanagari-Bold',
        fontSize: 18,
        fontWeight: '700',
        color: colors.neutral900,
        textAlign: 'center',
        marginBottom: 8,
    },
    message: {
        fontFamily: 'NotoSansDevanagari-Regular',
        fontSize: 14,
        color: colors.neutral500,
        textAlign: 'center',
        marginBottom: spacing.mobileGap,
    },
    actionContainer: {
        marginTop: spacing.mobileGap,
    },
    actionLabel: {
        fontFamily: 'NotoSansDevanagari-Bold',
        fontSize: 14,
        fontWeight: '600',
        color: colors.brandGreen700,
        textAlign: 'center',
    },
});
export default EmptyState;
