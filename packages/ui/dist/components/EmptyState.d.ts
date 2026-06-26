import React from 'react';
type EmptyStateVariant = 'no-data' | 'offline' | 'error' | 'loading';
interface EmptyStateProps {
    variant: EmptyStateVariant;
    title: string;
    message?: string;
    actionLabel?: string;
    onAction?: () => void;
}
declare const EmptyState: React.FC<EmptyStateProps>;
export default EmptyState;
//# sourceMappingURL=EmptyState.d.ts.map