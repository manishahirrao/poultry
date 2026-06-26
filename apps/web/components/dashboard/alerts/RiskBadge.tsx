'use client';

interface RiskBadgeProps {
  score: number;
  level: 'LOW' | 'MEDIUM' | 'HIGH';
  size?: 'sm' | 'md';
}

export function RiskBadge({ score, level, size = 'md' }: RiskBadgeProps) {
  const colours = {
    LOW: 'bg-green-100 text-green-800 border-green-200',
    MEDIUM: 'bg-amber-100 text-amber-800 border-amber-200',
    HIGH: 'bg-red-100 text-red-800 border-red-200'
  };
  const emojis = { LOW: '🟢', MEDIUM: '🟡', HIGH: '🔴' };
  
  const sizeClasses = size === 'sm' 
    ? 'px-2 py-0.5 text-xs' 
    : 'px-2.5 py-0.5 text-xs font-semibold';
  
  return (
    <span className={`inline-flex items-center rounded-full border ${colours[level]} ${sizeClasses}`}>
      {emojis[level]} {level} {score.toFixed(1)}/10
    </span>
  );
}

export default RiskBadge;
