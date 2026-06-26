// FlockIQ — Particle Field Component (v3.0)
// File: apps/web/components/marketing/hero/ParticleField.tsx
// Version: v3.0 | June 2026
// Task Reference: HOME-001
// Design Reference: FlockIQ_PreLogin_Design_Master_v3.md §3.1

'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface ParticleFieldProps {
  count?: number;
}

export function ParticleField({ count = 6 }: ParticleFieldProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; delay: number }>>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 4 + Math.random() * 8,
      delay: Math.random() * 2,
    }));
    setParticles(newParticles);
  }, [count]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-brand-400/20"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            x: [0, 20, -10, 0],
            y: [0, -15, 10, 0],
            scale: [1, 1.1, 0.9, 1],
            opacity: [0.15, 0.2, 0.12, 0.15],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: particle.delay,
          }}
        />
      ))}
    </div>
  );
}

