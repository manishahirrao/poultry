import React from 'react';
import type { SellSignal } from '../types';
interface SellSignalCardProps {
    signal: SellSignal;
    optimalWindowStart: string;
    optimalWindowEnd: string;
    profitEstimate: number;
    onPress?: () => void;
}
declare const SellSignalCard: React.FC<SellSignalCardProps>;
export default SellSignalCard;
//# sourceMappingURL=SellSignalCard.d.ts.map