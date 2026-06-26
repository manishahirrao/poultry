// PoultryPulse AI — Alert Card Component (Web)
// File: packages/ui/src/components/AlertCard.tsx
// Platform: Web (React)
// Design Reference: PoultryPulse_UIUX_Design_v1.md §3.4 (Alert Feed Screen)

import React from 'react';
import { colors, spacing, radius } from '../tokens';
import type { Alert } from '../types';

interface AlertCardProps {
  alert: Alert;
  onPress?: () => void;
}

const AlertCard: React.FC<AlertCardProps> = ({ alert, onPress }) => {
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

  return (
    <div
      className="alert-card"
      style={styles.container}
      onClick={onPress}
      role="alert"
      aria-live="assertive"
      aria-label={`${alert.title}. ${alert.message}`}
    >
      {/* Left border for severity */}
      <div
        style={{
          ...styles.leftBorder,
          backgroundColor: alertStyle.borderColor,
        }}
      />

      {/* Icon */}
      <div style={styles.iconContainer}>
        <span style={styles.icon}>{alertStyle.icon}</span>
      </div>

      {/* Content */}
      <div style={styles.contentContainer}>
        <h3 style={styles.title}>{alert.title}</h3>
        <p style={styles.message}>{alert.message}</p>
        {alert.source && <p style={styles.source}>स्रोत: {alert.source}</p>}
      </div>

      {/* Timestamp */}
      <div style={styles.timestampContainer}>
        <span style={styles.timestamp}>
          {new Date(alert.timestamp).toLocaleDateString('hi-IN', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'row' as const,
    backgroundColor: colors.cardSurface,
    borderRadius: `${radius.lg}px`,
    borderWidth: '1px',
    borderColor: 'transparent',
    padding: spacing.cardPadding,
    marginBottom: spacing.cardGap,
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    position: 'relative' as const,
  },
  leftBorder: {
    position: 'absolute' as const,
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
