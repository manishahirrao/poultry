// FlockIQ — Step Connector Component (v3.0)
// File: apps/web/components/ui/StepConnector.tsx
// Version: v3.0 | June 2026
// Task Reference: HOME-003
// Design Reference: FlockIQ_PreLogin_Design_Master_v3.md §3.6 (Section H-06)

'use client';

import { motion } from 'framer-motion';

interface StepConnectorProps {
  delay?: number;
  className?: string;
}

export function StepConnector({ delay = 0, className }: StepConnectorProps) {
  return (
    <motion.div
      initial={{ width: 0 }}
      whileInView={{ width: '100%' }}
      viewport={{ once: true, margin: '-8% 0px' }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      <svg
        width="48"
        height="12"
        viewBox="0 0 48 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-12 h-3"
        aria-hidden="true"
      >
        <motion.path
          d="M0 6H40"
          stroke="#3DAE72"
          strokeWidth="2"
          strokeDasharray="4 4"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
        />
        <motion.path
          d="M40 6L44 3M40 6L44 9"
          stroke="#3DAE72"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: delay + 0.4 }}
        />
      </svg>
    </motion.div>
  );
}
