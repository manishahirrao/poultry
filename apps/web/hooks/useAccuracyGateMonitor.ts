'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export interface AccuracyMetrics {
  directional_accuracy_30d: number;
  mape_30d: number;
  conformal_coverage_30d: number;
  prediction_count_30d: number;
  last_updated: string;
}

export type GateStatus = 'pass' | 'fail' | 'warn';

export interface AccuracyGateState {
  gateStatus: GateStatus;
  latestMetrics: AccuracyMetrics | null;
  breachedGate: string | null;
}

const GATE_THRESHOLDS = {
  directional_accuracy: { pass: 95, warn: 90 },
  mape: { pass: 6, warn: 8 },
  conformal_coverage: { min: 78, max: 82 },
} as const;

export function useAccuracyGateMonitor(): AccuracyGateState {
  const [gateState, setGateState] = useState<AccuracyGateState>({
    gateStatus: 'pass',
    latestMetrics: null,
    breachedGate: null,
  });

  useEffect(() => {
    const supabase = createClient();

    if (!supabase) return;

    // Subscribe to accuracy_log INSERT events
    const channel = supabase
      .channel('accuracy-gate-monitor')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'accuracy_log',
        },
        (payload) => {
          const metrics = payload.new as AccuracyMetrics;
          evaluateGates(metrics);
        }
      )
      .subscribe();

    // Also fetch initial metrics on mount
    fetchInitialMetrics(supabase);

    return () => {
      supabase?.removeChannel(channel);
    };
  }, []);

  const fetchInitialMetrics = async (supabase: any) => {
    try {
      const { data, error } = await supabase
        .from('mv_accuracy_dashboard')
        .select('*')
        .single();

      if (error || !data) {
        console.error('Failed to fetch initial accuracy metrics:', error);
        return;
      }

      evaluateGates(data as AccuracyMetrics);
    } catch (err) {
      console.error('Error fetching initial accuracy metrics:', err);
    }
  };

  const evaluateGates = (metrics: AccuracyMetrics) => {
    const { directional_accuracy_30d, mape_30d, conformal_coverage_30d } = metrics;

    let status: GateStatus = 'pass';
    let breachedGate: string | null = null;

    // Check directional accuracy gate (≥ 95%)
    if (directional_accuracy_30d < GATE_THRESHOLDS.directional_accuracy.warn) {
      status = 'fail';
      breachedGate = 'directional_accuracy';
    } else if (directional_accuracy_30d < GATE_THRESHOLDS.directional_accuracy.pass) {
      status = 'warn';
      breachedGate = 'directional_accuracy';
    }

    // Check MAPE gate (< 6%)
    if (mape_30d > GATE_THRESHOLDS.mape.warn) {
      status = 'fail';
      breachedGate = 'mape';
    } else if (mape_30d > GATE_THRESHOLDS.mape.pass) {
      status = status === 'fail' ? 'fail' : 'warn';
      if (!breachedGate) breachedGate = 'mape';
    }

    // Check conformal coverage gate (78-82%)
    if (
      conformal_coverage_30d < GATE_THRESHOLDS.conformal_coverage.min ||
      conformal_coverage_30d > GATE_THRESHOLDS.conformal_coverage.max
    ) {
      status = 'fail';
      breachedGate = 'conformal_coverage';
    }

    setGateState({
      gateStatus: status,
      latestMetrics: metrics,
      breachedGate,
    });

    // Fire aria-live announcement if gate breached
    if (status === 'fail' || status === 'warn') {
      announceGateBreach(status, breachedGate, metrics);
    }
  };

  return gateState;
}

function announceGateBreach(
  status: GateStatus,
  breachedGate: string | null,
  metrics: AccuracyMetrics
) {
  // Create or update live region for screen readers
  let liveRegion = document.getElementById('accuracy-gate-live-region');
  
  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.id = 'accuracy-gate-live-region';
    liveRegion.setAttribute('role', 'alert');
    liveRegion.setAttribute('aria-live', status === 'fail' ? 'assertive' : 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    document.body.appendChild(liveRegion);
  }

  const messageHi =
    status === 'fail'
      ? `चेतावनी: मॉडल सटीकता लक्ष्य से नीचे है। ${getGateNameHi(breachedGate)} gate fail हो गया है। Customer notifications paused automatically।`
      : `सूचना: मॉडल सटीकता ${getGateNameHi(breachedGate)} gate में warning है। Monitor करें।`;

  liveRegion.textContent = messageHi;

  // Also update critical banner visibility via custom event
  window.dispatchEvent(
    new CustomEvent('accuracy-gate-change', {
      detail: { status, breachedGate, metrics },
    })
  );
}

function getGateNameHi(gate: string | null): string {
  const gateNames: Record<string, string> = {
    directional_accuracy: 'Directional Accuracy',
    mape: 'MAPE',
    conformal_coverage: 'Conformal Coverage',
  };
  return gate ? gateNames[gate] || gate : '';
}
