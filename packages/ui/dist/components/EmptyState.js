import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    return (_jsxs("div", { className: "empty-state", style: Object.assign(Object.assign({}, styles.container), { backgroundColor: getBackgroundColor() }), children: [_jsx("div", { style: styles.iconContainer, children: _jsx("span", { style: styles.icon, children: getIcon() }) }), _jsx("h3", { style: styles.title, children: title }), message && _jsx("p", { style: styles.message, children: message }), actionLabel && onAction && (_jsx("div", { style: styles.actionContainer, children: _jsx("button", { onClick: onAction, style: styles.actionButton, className: "empty-state-action", children: actionLabel }) }))] }));
};
const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: `${radius.lg}px`,
        padding: spacing.cardPadding,
        minHeight: '200px',
    },
    iconContainer: {
        width: '80px',
        height: '80px',
        borderRadius: '40px',
        backgroundColor: colors.white,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.cardGap,
    },
    icon: {
        fontSize: '40px',
    },
    title: {
        fontFamily: "'Noto Sans Devanagari', sans-serif",
        fontSize: '18px',
        fontWeight: 700,
        color: colors.neutral900,
        textAlign: 'center',
        margin: '0 0 8px 0',
    },
    message: {
        fontFamily: "'Noto Sans Devanagari', sans-serif",
        fontSize: '14px',
        color: colors.neutral500,
        textAlign: 'center',
        margin: '0 0 16px 0',
    },
    actionContainer: {
        marginTop: spacing.cardGap,
    },
    actionButton: {
        fontFamily: "'Noto Sans Devanagari', sans-serif",
        fontSize: '14px',
        fontWeight: 600,
        color: colors.brandGreen700,
        backgroundColor: 'transparent',
        border: 'none',
        cursor: 'pointer',
        padding: '8px 16px',
        borderRadius: `${radius.md}px`,
        transition: 'background-color 0.2s ease',
    },
};
export default EmptyState;
