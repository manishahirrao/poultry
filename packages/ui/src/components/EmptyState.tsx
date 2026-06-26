// PoultryPulse AI — Empty State Component (Web)
// File: packages/ui/src/components/EmptyState.tsx
// Platform: Web (React)
// Design Reference: PoultryPulse_UIUX_Design_v1.md §5 (Component Library)

import React from 'react';
import { colors, spacing, radius } from '../tokens';

type EmptyStateVariant = 'no-data' | 'offline' | 'error' | 'loading';

interface EmptyStateProps {
  variant: EmptyStateVariant;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  variant,
  title,
  message,
  actionLabel,
  onAction,
}) => {
  // Get icon/illustration based on variant
  const getIcon = (): string => {
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
  const getBackgroundColor = (): string => {
    switch (variant) {
      case 'offline':
        return colors.amberLight;
      case 'error':
        return colors.redLight;
      default:
        return colors.neutral50;
    }
  };

  return (
    <div
      className="empty-state"
      style={{
        ...styles.container,
        backgroundColor: getBackgroundColor(),
      }}
    >
      {/* Icon/Illustration */}
      <div style={styles.iconContainer}>
        <span style={styles.icon}>{getIcon()}</span>
      </div>

      {/* Title */}
      <h3 style={styles.title}>{title}</h3>

      {/* Message */}
      {message && <p style={styles.message}>{message}</p>}

      {/* Action Button */}
      {actionLabel && onAction && (
        <div style={styles.actionContainer}>
          <button
            onClick={onAction}
            style={styles.actionButton}
            className="empty-state-action"
          >
            {actionLabel}
          </button>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
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
    textAlign: 'center' as const,
    margin: '0 0 8px 0',
  },
  message: {
    fontFamily: "'Noto Sans Devanagari', sans-serif",
    fontSize: '14px',
    color: colors.neutral500,
    textAlign: 'center' as const,
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
