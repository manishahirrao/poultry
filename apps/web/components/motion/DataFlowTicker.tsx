'use client';

import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

interface DataSource {
  id: string;
  name: string;
  value: string;
  status: 'active' | 'syncing' | 'offline';
  lastUpdated: string;
}

interface DataFlowTickerProps {
  duration?: number;      // cycle duration in seconds, default 4
  className?: string;
}

const mockDataSources: DataSource[] = [
  { id: '1', name: 'Mandi Prices', value: '₹185.50/kg', status: 'active', lastUpdated: '2s ago' },
  { id: '2', name: 'Weather API', value: '32°C, Humid', status: 'active', lastUpdated: '5s ago' },
  { id: '3', name: 'Feed Rates', value: '₹45.20/kg', status: 'syncing', lastUpdated: '12s ago' },
  { id: '4', name: 'Disease DB', value: 'No alerts', status: 'active', lastUpdated: '1m ago' },
];

export function DataFlowTicker({ duration = 4, className }: DataFlowTickerProps) {
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
      setCurrentIndex((prev) => (prev + 1) % mockDataSources.length);
    }, duration * 1000);
    return () => clearInterval(interval);
  }, [inView, duration, shouldReduceMotion]);

  const currentSource = mockDataSources[currentIndex];
  const statusColors = {
    active: 'text-green-400',
    syncing: 'text-yellow-400',
    offline: 'text-red-400',
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4, type: 'spring', stiffness: 100, damping: 20 },
    },
  };

  const tickerVariants = {
    enter: { opacity: 0, x: 30 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
  };

  if (shouldReduceMotion) {
    return (
      <div ref={ref} className={className}>
        <div className="bg-neutral-900 rounded-lg p-4 font-mono text-sm border border-neutral-800">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-400 rounded-full" />
            <span className="text-neutral-400">DATA STREAM</span>
          </div>
          <div className="text-white">
            <div className="text-xs text-neutral-500">{currentSource.name}</div>
            <div className="text-lg font-bold">{currentSource.value}</div>
            <div className={`text-xs ${statusColors[currentSource.status]}`}>
              {currentSource.status.toUpperCase()} • {currentSource.lastUpdated}
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
        variants={containerVariants}
        className="bg-neutral-900 rounded-lg p-4 font-mono text-sm border border-neutral-800 shadow-lg"
      >
        {/* Terminal header */}
        <div className="flex items-center gap-2 mb-3 border-b border-neutral-800 pb-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <span className="text-neutral-500 text-xs ml-2">data_stream_monitor</span>
        </div>

        {/* Ticker content */}
        <div className="min-h-[80px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              variants={tickerVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, type: 'spring', stiffness: 100, damping: 20 }}
              className="text-white"
            >
              <div className="flex items-center gap-2 mb-2">
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className={`w-2 h-2 rounded-full ${
                    currentSource.status === 'active' ? 'bg-green-400' :
                    currentSource.status === 'syncing' ? 'bg-yellow-400' :
                    'bg-red-400'
                  }`}
                />
                <span className="text-neutral-400 text-xs">{currentSource.name}</span>
              </div>
              
              <div className="text-lg font-bold mb-1">{currentSource.value}</div>
              
              <div className={`text-xs ${statusColors[currentSource.status]}`}>
                {currentSource.status.toUpperCase()} • {currentSource.lastUpdated}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress indicator */}
        <div className="flex gap-1 mt-3">
          {mockDataSources.map((_, index) => (
            <motion.div
              key={index}
              initial={{ width: '20%' }}
              animate={{ width: index === currentIndex ? '100%' : '20%' }}
              transition={{ duration: 0.3, type: 'spring', stiffness: 100, damping: 20 }}
              className={`h-1 rounded-full ${
                index === currentIndex ? 'bg-green-400' : 'bg-neutral-700'
              }`}
            />
          ))}
        </div>

        {/* Animated data particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-green-400 rounded-full opacity-30"
              initial={{ x: -10, y: Math.random() * 100 }}
              animate={{ x: '110%', y: Math.random() * 100 }}
              transition={{ duration: 2 + i * 0.5, repeat: Infinity, ease: 'linear' }}
              style={{ willChange: 'transform' }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
