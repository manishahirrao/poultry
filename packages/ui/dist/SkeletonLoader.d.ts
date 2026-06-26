import React from 'react';
interface SkeletonProps {
    width?: number | string;
    height?: number;
    style?: any;
}
/**
 * Skeleton component for loading states
 * Provides a shimmering placeholder while content loads
 */
export declare function Skeleton({ width, height, style }: SkeletonProps): React.JSX.Element;
interface SkeletonCardProps {
    style?: any;
}
/**
 * Skeleton card component mimicking the PriceHero card structure
 */
export declare function SkeletonCard({ style }: SkeletonCardProps): React.JSX.Element;
interface SkeletonListProps {
    count?: number;
    style?: any;
}
/**
 * Skeleton list component for loading list items
 */
export declare function SkeletonList({ count, style }: SkeletonListProps): React.JSX.Element;
export {};
//# sourceMappingURL=SkeletonLoader.d.ts.map