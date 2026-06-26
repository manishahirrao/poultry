'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';

interface Step {
  id: string;
  title: string;
  description: string;
  content: React.ReactNode;
}

interface StickyScrollStepsProps {
  steps: Step[];
  className?: string;
}

export function StickyScrollSteps({ steps, className }: StickyScrollStepsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);
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

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  useEffect(() => {
    if (shouldReduceMotion) return;

    const handleScroll = () => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const containerTop = containerRect.top;
      const stepHeight = containerRect.height / steps.length;

      const scrollPosition = window.scrollY;
      const relativeScroll = scrollPosition - containerTop + window.innerHeight * 0.5;
      
      const stepIndex = Math.min(
        Math.max(Math.floor(relativeScroll / stepHeight), 0),
        steps.length - 1
      );
      
      setActiveStep(stepIndex);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [steps.length, shouldReduceMotion]);

  if (shouldReduceMotion) {
    return (
      <div ref={containerRef} className={className}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="sticky top-8">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`mb-6 p-4 rounded-lg ${
                    index === activeStep ? 'bg-brandGreen100 ring-2 ring-brandGreen500' : 'bg-neutral-100'
                  }`}
                >
                  <div className="font-semibold text-sm">{step.title}</div>
                  <div className="text-xs text-neutral-600 mt-1">{step.description}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="md:col-span-3">
            {steps.map((step) => (
              <div key={step.id} className="min-h-[100dvh] py-12">
                {step.content}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={className}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sticky sidebar with step indicators */}
        <div className="md:col-span-1">
          <motion.div
            className="sticky top-8"
            style={{ opacity: useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [0, 1, 1, 0]) }}
          >
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`mb-6 p-4 rounded-lg cursor-pointer transition-all ${
                  index === activeStep
                    ? 'bg-brandGreen100 ring-2 ring-brandGreen500 scale-105'
                    : 'bg-neutral-100 hover:bg-neutral-200'
                }`}
                onClick={() => {
                  const element = document.getElementById(step.id);
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === activeStep
                        ? 'bg-brandGreen500 text-white'
                        : 'bg-neutral-300 text-neutral-600'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="font-semibold text-sm">{step.title}</div>
                </div>
                <div className="text-xs text-neutral-600 mt-2 ml-11">{step.description}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Content sections */}
        <div className="md:col-span-3">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              id={step.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10% 0px' }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="min-h-[100dvh] py-12"
            >
              {step.content}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
