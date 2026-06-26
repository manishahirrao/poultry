'use client';

import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

interface TickerState {
  price: number;
  change: number;
  timestamp: string;
}

interface PriceTickerMockupProps {
  duration?: number;      // cycle duration in seconds, default 3
  className?: string;
}

const mockStates: TickerState[] = [
  { price: 185.5, change: +2.3, timestamp: '10:30 AM' },
  { price: 187.8, change: +2.3, timestamp: '10:31 AM' },
  { price: 186.2, change: -1.6, timestamp: '10:32 AM' },
];

export function PriceTickerMockup({ duration = 3, className }: PriceTickerMockupProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setShouldReduceMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setShouldReduceMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (!inView || shouldReduceMotion) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % mockStates.length);
    }, duration * 1000);
    return () => clearInterval(interval);
  }, [inView, duration, shouldReduceMotion]);

  const currentState = mockStates[currentIndex];
  const isPositive = currentState.change >= 0;

  const phoneVariants = {
    hidden: { opacity: 0, rotateY: -15, scale: 0.9 },
    visible: {
      opacity: 1,
      rotateY: 0,
      scale: 1,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const tickerVariants = {
    enter: { opacity: 0, y: 20 },
    center: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  if (shouldReduceMotion) {
    return (
      <div className={className}>
        <div className="relative bg-neutral-900 rounded-3xl p-6 shadow-2xl">
          <div className="text-white">
            <div className="text-3xl font-bold">₹{currentState.price}</div>
            <div className={`text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {isPositive ? '+' : ''}{currentState.change}%
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className={className}>
      <motion.div
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        variants={phoneVariants}
        className="relative bg-neutral-900 rounded-3xl p-6 shadow-2xl"
        style={{ perspective: 1000 }}
      >
        {/* Phone notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-neutral-800 rounded-b-2xl" />
        
        {/* Ticker content */}
        <div className="pt-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              variants={tickerVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="text-white"
            >
              <div className="text-3xl font-bold">₹{currentState.price}</div>
              <div className={`text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {isPositive ? '+' : ''}{currentState.change}%
              </div>
              <div className="text-xs text-neutral-500 mt-1">{currentState.timestamp}</div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Floating WhatsApp badge */}
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-3 -right-3 bg-green-500 rounded-full p-3 shadow-lg"
        >
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </motion.div>
      </motion.div>
    </div>
  );
}
