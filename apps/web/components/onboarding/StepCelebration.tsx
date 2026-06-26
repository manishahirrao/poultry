'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface StepCelebrationProps {
  show: boolean;
  stepNumber: number;
  totalSteps: number;
  onComplete: () => void;
}

export function StepCelebration({ show, stepNumber, totalSteps, onComplete }: StepCelebrationProps) {
  const [confettiPieces, setConfettiPieces] = useState<Array<{ id: number; x: number; y: number; rotation: number; color: string }>>([]);

  useEffect(() => {
    if (show) {
      // Generate confetti pieces
      const colors = ['#22c55e', '#16a34a', '#15803d', '#86efac', '#4ade80'];
      const pieces = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        rotation: Math.random() * 360,
        color: colors[Math.floor(Math.random() * colors.length)],
      }));
      setConfettiPieces(pieces);

      // Auto-dismiss after 1.5 seconds
      const timer = setTimeout(() => {
        onComplete();
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
        >
          {/* Confetti */}
          {confettiPieces.map((piece) => (
            <motion.div
              key={piece.id}
              initial={{
                x: '50%',
                y: '50%',
                scale: 0,
                rotate: 0
              }}
              animate={{
                x: `${piece.x}%`,
                y: `${piece.y}%`,
                scale: 1,
                rotate: piece.rotation
              }}
              exit={{
                opacity: 0,
                scale: 0
              }}
              transition={{
                duration: 0.8,
                ease: [0.25, 1, 0.5, 1]
              }}
              className="absolute w-3 h-3 rounded-full"
              style={{ backgroundColor: piece.color }}
            />
          ))}

          {/* Success Message */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ 
              duration: 0.4,
              ease: [0.25, 1, 0.5, 1] 
            }}
            className="bg-white rounded-2xl shadow-2xl p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                delay: 0.2,
                type: 'spring',
                stiffness: 200,
                damping: 10 
              }}
              className="text-6xl mb-4"
            >
              🎉
            </motion.div>
            <motion.h3
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-neutral-900 font-space-grotesk mb-2"
            >
              बढ़िया!
            </motion.h3>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-neutral-600"
            >
              Step {stepNumber} of {totalSteps} complete
            </motion.p>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(stepNumber / totalSteps) * 100}%` }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mt-4 h-2 bg-brandGreen-200 rounded-full overflow-hidden"
            >
              <motion.div
                className="h-full bg-brandGreen-600"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ delay: 0.5, duration: 0.6 }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
