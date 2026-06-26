import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View, StyleSheet } from 'react-native';
/**
 * Skeleton component for loading states
 * Provides a shimmering placeholder while content loads
 */
export function Skeleton({ width = '100%', height = 40, style }) {
    return (_jsx(View, { style: [styles.skeleton, { width, height }, style] }));
}
/**
 * Skeleton card component mimicking the PriceHero card structure
 */
export function SkeletonCard({ style }) {
    return (_jsxs(View, { style: [styles.card, style], children: [_jsx(Skeleton, { width: "60%", height: 24, style: styles.marginBottom }), _jsx(Skeleton, { width: "40%", height: 48, style: styles.marginBottom }), _jsx(Skeleton, { width: "100%", height: 8, style: styles.marginBottom }), _jsxs(View, { style: styles.row, children: [_jsx(Skeleton, { width: "30%", height: 16 }), _jsx(Skeleton, { width: "30%", height: 16 })] })] }));
}
/**
 * Skeleton list component for loading list items
 */
export function SkeletonList({ count = 3, style }) {
    return (_jsx(View, { style: style, children: Array.from({ length: count }).map((_, index) => (_jsxs(View, { style: [styles.listItem, index < count - 1 && styles.marginBottom], children: [_jsx(Skeleton, { width: "80%", height: 20, style: styles.marginBottom }), _jsx(Skeleton, { width: "100%", height: 14, style: styles.marginBottom }), _jsx(Skeleton, { width: "60%", height: 14 })] }, index))) }));
}
const styles = StyleSheet.create({
    skeleton: {
        backgroundColor: '#E0E5E3',
        borderRadius: 8,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    marginBottom: {
        marginBottom: 8,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    listItem: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
    },
});
