'use client';

import { motion } from 'framer-motion';

interface PulluCharacterProps {
  variant?: 'default' | 'happy' | 'thinking' | 'working' | 'celebrating';
  size?: number;
  className?: string;
  animate?: boolean;
}

export function PulluCharacter({
  variant = 'default',
  size = 120,
  className,
  animate = true,
}: PulluCharacterProps) {
  // Illustration colors - using brand palette
  const variants = {
    default: {
      eyeColor: '#4A5568', // Neutral gray for eyes (illustration detail)
      mouthPath: 'M 35 75 Q 50 80 65 75',
      eyebrowRotation: 0,
    },
    happy: {
      eyeColor: '#4A5568',
      mouthPath: 'M 35 75 Q 50 85 65 75',
      eyebrowRotation: -5,
    },
    thinking: {
      eyeColor: '#4A5568',
      mouthPath: 'M 40 75 Q 50 72 60 75',
      eyebrowRotation: 10,
    },
    working: {
      eyeColor: '#4A5568',
      mouthPath: 'M 40 75 Q 50 75 60 75',
      eyebrowRotation: 0,
    },
    celebrating: {
      eyeColor: '#4A5568',
      mouthPath: 'M 30 75 Q 50 90 70 75',
      eyebrowRotation: -10,
    },
  };

  const currentVariant = variants[variant];

  const characterVariants = {
    idle: {
      y: [0, -5, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
    static: {},
  };

  return (
    <motion.div
      animate={animate ? 'idle' : 'static'}
      variants={characterVariants}
      className={className}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        {/* Body - Brand green variant for illustration */}
        <ellipse cx="50" cy="55" rx="35" ry="40" fill="#22C55E" />

        {/* Head */}
        <circle cx="50" cy="35" r="25" fill="#22C55E" />

        {/* Eyes */}
        <ellipse cx="40" cy="32" rx="5" ry="6" fill="white" />
        <ellipse cx="60" cy="32" rx="5" ry="6" fill="white" />
        <circle cx="41" cy="33" r="2.5" fill={currentVariant.eyeColor} />
        <circle cx="61" cy="33" r="2.5" fill={currentVariant.eyeColor} />

        {/* Eyebrows */}
        <motion.g
          animate={{ rotate: currentVariant.eyebrowRotation }}
          style={{ transformOrigin: '40px 25px' }}
        >
          <line x1="35" y1="25" x2="45" y2="23" stroke="#166534" strokeWidth="2" strokeLinecap="round" />
        </motion.g>
        <motion.g
          animate={{ rotate: -currentVariant.eyebrowRotation }}
          style={{ transformOrigin: '60px 25px' }}
        >
          <line x1="55" y1="23" x2="65" y2="25" stroke="#166534" strokeWidth="2" strokeLinecap="round" />
        </motion.g>

        {/* Beak - Brand amber variant */}
        <path d="M 50 40 L 45 48 L 50 46 L 55 48 Z" fill="#F59E0B" />

        {/* Mouth */}
        <path
          d={currentVariant.mouthPath}
          stroke="#166534"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />

        {/* Wings - Darker green variant */}
        <ellipse cx="20" cy="55" rx="8" ry="15" fill="#16A34A" />
        <ellipse cx="80" cy="55" rx="8" ry="15" fill="#16A34A" />

        {/* Feet */}
        <ellipse cx="40" cy="92" rx="6" ry="3" fill="#F59E0B" />
        <ellipse cx="60" cy="92" rx="6" ry="3" fill="#F59E0B" />
      </svg>
    </motion.div>
  );
}
