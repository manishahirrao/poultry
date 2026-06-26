import React from 'react';
interface OnboardingFlowProps {
    onComplete?: (profile: FarmProfile) => void;
    onPhoneSubmit?: (phone: string) => Promise<void>;
    onOtpSubmit?: (otp: string) => Promise<void>;
    onProfileSubmit?: (profile: FarmProfile) => Promise<void>;
}
interface FarmProfile {
    district: string;
    flockSize: string;
    poultryType: string;
    name?: string;
}
declare const OnboardingFlow: React.FC<OnboardingFlowProps>;
export default OnboardingFlow;
//# sourceMappingURL=OnboardingFlow.d.ts.map