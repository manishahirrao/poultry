import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { colors, spacing, radius } from '../tokens';
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
    return (_jsxs("div", { className: "alert-card", style: styles.container, onClick: onPress, role: "alert", "aria-live": "assertive", "aria-label": `${alert.title}. ${alert.message}`, children: [_jsx("div", { style: Object.assign(Object.assign({}, styles.leftBorder), { backgroundColor: alertStyle.borderColor }) }), _jsx("div", { style: styles.iconContainer, children: _jsx("span", { style: styles.icon, children: alertStyle.icon }) }), _jsxs("div", { style: styles.contentContainer, children: [_jsx("h3", { style: styles.title, children: alert.title }), _jsx("p", { style: styles.message, children: alert.message }), alert.source && _jsxs("p", { style: styles.source, children: ["\u0938\u094D\u0930\u094B\u0924: ", alert.source] })] }), _jsx("div", { style: styles.timestampContainer, children: _jsx("span", { style: styles.timestamp, children: new Date(alert.timestamp).toLocaleDateString('hi-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                    }) }) })] }));
};
const styles = {
    container: {
        display: 'flex',
        flexDirection: 'row',
        backgroundColor: colors.cardSurface,
        borderRadius: `${radius.lg}px`,
        borderWidth: '1px',
        borderColor: 'transparent',
        padding: spacing.cardPadding,
        marginBottom: spacing.cardGap,
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        position: 'relative',
    },
    leftBorder: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: '4px',
        borderTopLeftRadius: `${radius.lg}px`,
        borderBottomLeftRadius: `${radius.lg}px`,
    },
    iconContainer: {
        width: '40px',
        height: '40px',
        borderRadius: '20px',
        backgroundColor: colors.neutral50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.cardGap,
        flexShrink: 0,
    },
    icon: {
        fontSize: '20px',
    },
    contentContainer: {
        flex: 1,
    },
    title: {
        fontFamily: "'Noto Sans Devanagari', sans-serif",
        fontSize: '16px',
        fontWeight: 700,
        color: colors.neutral900,
        margin: '0 0 4px 0',
    },
    message: {
        fontFamily: "'Noto Sans Devanagari', sans-serif",
        fontSize: '14px',
        color: colors.neutral700,
        margin: '0 0 4px 0',
    },
    source: {
        fontFamily: "'Noto Sans Devanagari', sans-serif",
        fontSize: '12px',
        color: colors.neutral400,
        margin: 0,
    },
    timestampContainer: {
        marginLeft: spacing.cardGap,
    },
    timestamp: {
        fontFamily: "'Noto Sans Devanagari', sans-serif",
        fontSize: '11px',
        color: colors.neutral400,
    },
};
export default AlertCard;
