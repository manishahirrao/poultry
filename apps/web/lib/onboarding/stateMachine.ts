// FlockIQ — Onboarding State Machine
// File: apps/web/lib/onboarding/stateMachine.ts
// Version: v1.0 | May 2026
// Task Reference: AUTH-05 — Onboarding State Machine

export type OnboardingStep =
  | 'OB-01'  // Welcome + Farm Profile (combined location, flock size, farm type)
  | 'OB-02'  // Plan confirmation
  | 'OB-03'  // WhatsApp verification
  | 'OB-04'  // Success

// Legacy step names for backward compatibility
export type LegacyOnboardingStep =
  | 'OB-01'
  | 'OB-02'
  | 'OB-03'
  | 'OB-04'
  | 'OB-05'
  | 'OB-06'
  | 'OB-07'
  | 'OB-08'
  | 'OB-09'
  | 'OB-10';

export interface OnboardingState {
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  data: {
    district?: string;
    flockRange?: string;
    batchesPerYear?: 2 | 3 | 4;
    farmType?: 'independent' | 'integrator';
    integratorName?: string;
    planConfirmed?: 'PULSE_FARM' | 'PULSE_PRO' | 'PULSE_INTEL';
    whatsappVerified?: boolean;
    appDownloaded?: boolean;
    referralSource?: string;
    referralCode?: string;
    email?: string;
    emailOptIn?: boolean;
  };
  trialDurationDays: 14 | 30;
  startedAt: string;
  completedAt?: string;
}

const STEPS: OnboardingStep[] = [
  'OB-01',
  'OB-02',
  'OB-03',
  'OB-04',
];

/**
 * Get the next step in the onboarding flow
 */
export function getNextStep(current: OnboardingStep): OnboardingStep {
  const currentIndex = STEPS.indexOf(current);
  if (currentIndex === -1 || currentIndex === STEPS.length - 1) {
    return 'OB-04';
  }
  return STEPS[currentIndex + 1];
}

/**
 * Get the previous step in the onboarding flow
 */
export function getPreviousStep(current: OnboardingStep): OnboardingStep | null {
  const currentIndex = STEPS.indexOf(current);
  if (currentIndex <= 0) {
    return null;
  }
  return STEPS[currentIndex - 1];
}

/**
 * Check if a step is complete based on the onboarding state
 */
export function isStepComplete(step: OnboardingStep, state: OnboardingState): boolean {
  return state.completedSteps.includes(step);
}

/**
 * Check if a step can be skipped (OB-03 is skippable)
 */
export function isStepSkippable(step: OnboardingStep): boolean {
  return step === 'OB-03';
}

/**
 * Check if the onboarding is complete
 */
export function isOnboardingComplete(state: OnboardingState): boolean {
  return state.currentStep === 'OB-04' && state.completedSteps.includes('OB-04');
}

/**
 * Get the step number (1-10) for display
 */
export function getStepNumber(step: OnboardingStep): number {
  return STEPS.indexOf(step) + 1;
}

/**
 * Get total number of steps
 */
export function getTotalSteps(): number {
  return STEPS.length;
}

/**
 * Calculate progress percentage
 */
export function getProgressPercentage(state: OnboardingState): number {
  const completed = state.completedSteps.length;
  return Math.round((completed / getTotalSteps()) * 100);
}

/**
 * Validate step data before proceeding
 */
export function validateStepData(step: OnboardingStep, data: OnboardingState['data']): { valid: boolean; error?: string } {
  switch (step) {
    case 'OB-01':
      // Welcome step - only collects email (optional)
      // No required validation for current simplified flow
      return { valid: true };
    
    case 'OB-02':
      // Plan confirmation
      if (!data.planConfirmed) {
        return { valid: false, error: 'कृपया अपना plan confirm करें' };
      }
      return { valid: true };
    
    case 'OB-03':
      // WhatsApp verification is optional (can be skipped)
      return { valid: true };
    
    case 'OB-04':
      // Success step has no data requirements
      return { valid: true };
    
    default:
      return { valid: true };
  }
}

/**
 * Create initial onboarding state
 */
export function createInitialState(): OnboardingState {
  return {
    currentStep: 'OB-01',
    completedSteps: [],
    data: {},
    trialDurationDays: 14,
    startedAt: new Date().toISOString(),
  };
}

/**
 * Update state with step completion
 */
export function completeStep(
  state: OnboardingState,
  step: OnboardingStep,
  stepData: Partial<OnboardingState['data']>
): OnboardingState {
  const validation = validateStepData(step, { ...state.data, ...stepData });
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const updatedCompletedSteps = state.completedSteps.includes(step)
    ? state.completedSteps
    : [...state.completedSteps, step];

  const nextStep = getNextStep(step);

  // Track individual step completion in analytics
  if (typeof window !== 'undefined' && !state.completedSteps.includes(step)) {
    // Import dynamically to avoid circular dependency
    import('../analytics').then(({ trackEvent }) => {
      trackEvent('onboarding_step_completed', {
        step: step,
        step_number: getStepNumber(step),
        total_steps: getTotalSteps(),
        progress_percentage: Math.round(((updatedCompletedSteps.length) / getTotalSteps()) * 100),
      });
    });
  }

  return {
    ...state,
    currentStep: nextStep,
    completedSteps: updatedCompletedSteps,
    data: { ...state.data, ...stepData },
    completedAt: nextStep === 'OB-04' ? new Date().toISOString() : undefined,
  };
}

/**
 * Go back to previous step
 */
export function goBack(state: OnboardingState): OnboardingState {
  const previousStep = getPreviousStep(state.currentStep);
  if (!previousStep) {
    return state; // Can't go back from first step
  }

  return {
    ...state,
    currentStep: previousStep,
  };
}

/**
 * Resume onboarding from a specific step
 */
export function resumeFromStep(step: OnboardingStep, state: OnboardingState): OnboardingState {
  const stepIndex = STEPS.indexOf(step);
  const completedSteps = STEPS.slice(0, stepIndex);

  return {
    ...state,
    currentStep: step,
    completedSteps,
  };
}

/**
 * Check if plan is locked (currency immutability gate)
 */
export function isPlanLocked(state: OnboardingState): boolean {
  return state.completedSteps.includes('OB-02') && !!state.data.planConfirmed;
}

/**
 * Get recommended plan based on flock size
 */
export function getRecommendedPlan(flockRange?: string): 'PULSE_FARM' | 'PULSE_PRO' | 'PULSE_INTEL' {
  if (!flockRange) return 'PULSE_FARM';

  // Logic from design doc:
  // 10,000 – 25,000 → S1 PulseFarm
  // 25,000 – 50,000 → S1 PulseFarm
  // 50,000 – 1 लाख → S2 PulsePro recommended
  // 1 लाख – 5 लाख → S2 PulsePro
  // 5 लाख+ → S2 PulsePro / PulseIntel

  if (flockRange.includes('5 लाख+')) {
    return 'PULSE_INTEL';
  }
  if (flockRange.includes('1 लाख') || flockRange.includes('50,000')) {
    return 'PULSE_PRO';
  }
  return 'PULSE_FARM';
}

/**
 * Persist state to localStorage
 */
export function persistState(state: OnboardingState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('onboarding_state', JSON.stringify(state));
  } catch (error) {
    console.error('Failed to persist onboarding state:', error);
  }
}

/**
 * Load state from localStorage
 */
export function loadState(): OnboardingState | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem('onboarding_state');
    if (!stored) return null;
    return JSON.parse(stored) as OnboardingState;
  } catch (error) {
    console.error('Failed to load onboarding state:', error);
    return null;
  }
}

/**
 * Clear state from localStorage
 */
export function clearState(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('onboarding_state');
  } catch (error) {
    console.error('Failed to clear onboarding state:', error);
  }
}
