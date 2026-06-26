# PoultryPulse AI — Motion, Animation & Visual Design Master
# File: 07_motion_animation_master.md
# Kiro Compatibility: ✅ Full Kiro Agent Implementation Ready
# Version: v1.0 | May 2026 | CONFIDENTIAL

---

## AGENT CONTEXT BLOCK
```
DESIGNER_PERSONA: Zhenya Rynzhuk (innovative layouts/animations) × Niklas Bubori (animation + clean nav) × Leo Natsume (illustrative UI)
MOTION_PHILOSOPHY: "Animation is not decoration — it is communication. Every motion has a reason."
MOTION_INTENSITY: Pre-login website=6, Dashboard=4, Mobile app screens=5
PERFORMANCE: 60fps target on mid-range Android (Snapdragon 665 equivalent). Never at expense of data.
ACCESSIBILITY: prefers-reduced-motion MUST disable all non-essential animation
TOOLS: Framer Motion (React), CSS @keyframes, CSS scroll-driven animations, Lottie (app only)
FOUNDATION: 01_prelogin_design_master.md §6 + UI/UX Design v1.0 §3 (animation principles)
```

---

## 1. MOTION DESIGN PHILOSOPHY

### 1.1 The Five Laws of PoultryPulse Motion

```
LAW 1 — MOTION SERVES MEANING
Every animation must communicate something:
  ✓ "This section just appeared — read it" (entrance reveal)
  ✓ "This number is live data updating" (counter pulse)
  ✓ "This button is clickable" (hover state)
  ✓ "This form has an error" (shake/jiggle)
  ✗ "This is cool" (motion for aesthetic only — BANNED)

LAW 2 — DECELERATION, NOT ACCELERATION
Natural objects decelerate as they arrive (easeOut family).
Never use linear or easeIn for entrance animations.
  ✓ easeOutExpo: cubic-bezier(0.16, 1, 0.3, 1)
  ✓ easeOutQuart: cubic-bezier(0.25, 1, 0.5, 1)
  ✗ linear: mechanical, robotic
  ✗ easeIn: exits only (moving away from user)

LAW 3 — STAGGER, DON'T DUMP
Multiple elements entering simultaneously is visual noise.
Stagger related items: 60–100ms delay between siblings.
Max stagger: 5 items (after 5, reduce delay to 40ms to avoid "slow drip")

LAW 4 — RESPECT USER PREFERENCE
@media (prefers-reduced-motion: reduce) {
  /* All transitions → 1ms (effectively instant, but still functional) */
  /* Static versions of all animations */
  /* Counter: show final value immediately */
  /* Parallax: disabled */
}

LAW 5 — HINDI TEXT = EXTRA CARE
Noto Sans Devanagari renders slower than Latin on older devices.
Never animate opacity + transform simultaneously on large Hindi text blocks.
Animate opacity only for Devanagari — no transform-based entrance.
```

### 1.2 Motion Budget per Page Section

```
SECTION                    MOTION BUDGET    RATIONALE
Hero (above fold)          High (8/10)      First impression, brand personality
Pain section               Medium (5/10)    Data-driven, not decorative
How It Works               High (7/10)      Step-by-step needs guidance
Accuracy section           Low (3/10)       Trust — serious, no flashiness
Testimonials               Medium (5/10)    Human warmth
Pricing                    Low (3/10)       Clarity > animation
FAQ                        Low (2/10)       Functional, just accordion
Final CTA                  Medium (5/10)    Re-engagement pulse
Dashboard (all pages)      Low (3/10)       Data density > animation
404 page                   Medium (5/10)    Recovery, friendly
```

---

## 2. ANIMATION COMPONENT LIBRARY

### 2.1 FadeUp (Primary Entrance Animation)

```typescript
// apps/web/components/motion/FadeUp.tsx
'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

interface FadeUpProps {
  children: React.ReactNode;
  delay?: number;         // seconds, default 0
  duration?: number;      // seconds, default 0.7
  distance?: number;      // px, default 24
  blur?: boolean;         // add blur-in, default true
  once?: boolean;         // animate only once, default true
  className?: string;
}

export function FadeUp({
  children,
  delay = 0,
  duration = 0.7,
  distance = 24,
  blur = true,
  once = true,
  className,
}: FadeUpProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, margin: '-10% 0px' });

  const variants = {
    hidden: {
      opacity: 0,
      y: distance,
      filter: blur ? 'blur(4px)' : 'blur(0px)',
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1], // easeOutExpo
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
}
```

### 2.2 StaggerGroup (Staggered Child Animations)

```typescript
// apps/web/components/motion/StaggerGroup.tsx
'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

interface StaggerGroupProps {
  children: React.ReactNode;
  staggerDelay?: number;   // seconds between children, default 0.08
  initialDelay?: number;   // before first child, default 0
  distance?: number;
  className?: string;
}

const containerVariants = (staggerDelay: number, initialDelay: number) => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren: staggerDelay,
      delayChildren: initialDelay,
    },
  },
});

const childVariants = (distance: number) => ({
  hidden: { opacity: 0, y: distance },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 1, 0.5, 1] }, // easeOutQuart
  },
});

export function StaggerGroup({
  children,
  staggerDelay = 0.08,
  initialDelay = 0,
  distance = 16,
  className,
}: StaggerGroupProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px' });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={containerVariants(staggerDelay, initialDelay)}
      className={className}
    >
      {Array.isArray(children)
        ? children.map((child, i) => (
            <motion.div key={i} variants={childVariants(distance)}>
              {child}
            </motion.div>
          ))
        : <motion.div variants={childVariants(distance)}>{children}</motion.div>
      }
    </motion.div>
  );
}
```

### 2.3 CountUp (Number Counter Animation)

```typescript
// apps/web/components/motion/CountUp.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

interface CountUpProps {
  end: number;
  duration?: number;          // ms, default 1500
  decimals?: number;          // decimal places, default 0
  prefix?: string;            // e.g. '₹', '%'
  suffix?: string;            // e.g. '+', 'K'
  separator?: string;         // thousands separator, default ','
  useIndianFormat?: boolean;  // format as lakhs/crores
  locale?: 'hi' | 'en';
  className?: string;
}

function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function formatIndian(n: number, locale: 'hi' | 'en'): string {
  if (n >= 10_000_000) {
    const cr = (n / 10_000_000).toFixed(1);
    return locale === 'hi' ? `${cr} करोड़` : `${cr} Cr`;
  }
  if (n >= 100_000) {
    const l = (n / 100_000).toFixed(1);
    return locale === 'hi' ? `${l} लाख` : `${l} L`;
  }
  return n.toLocaleString('en-IN');
}

export function CountUp({
  end,
  duration = 1500,
  decimals = 0,
  prefix = '',
  suffix = '',
  separator = ',',
  useIndianFormat = false,
  locale = 'hi',
  className,
}: CountUpProps) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const startTime = useRef<number | null>(null);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    // Respect prefers-reduced-motion
    if (typeof window !== 'undefined' && 
        window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(end);
      return;
    }

    if (!inView) return;

    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      const easedProgress = easeOutExpo(progress);
      setValue(easedProgress * end);
      if (progress < 1) {
        rafId.current = requestAnimationFrame(animate);
      } else {
        setValue(end);
      }
    };

    rafId.current = requestAnimationFrame(animate);
    return () => { if (rafId.current) cancelAnimationFrame(rafId.current); };
  }, [inView, end, duration]);

  const displayValue = useIndianFormat
    ? formatIndian(value, locale)
    : value.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, separator);

  return (
    <span ref={ref} className={className} aria-label={`${prefix}${end}${suffix}`}>
      {prefix}{displayValue}{suffix}
    </span>
  );
}
```

### 2.4 PriceTickerMockup (Hero Phone Animation)

```typescript
// apps/web/components/motion/PriceTickerMockup.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

type SignalState = 'sell' | 'hold' | 'caution';

interface TickerState {
  signal: SignalState;
  priceHi: string;    // Hindi price label
  price: string;      // ₹168/kg
  forecast?: string;  // optional forecast direction
  labelHi: string;    // Hindi signal label
  colour: string;     // Tailwind colour class for badge
  bgColour: string;   // Card background tint
}

const TICKER_STATES: TickerState[] = [
  {
    signal: 'sell',
    priceHi: 'आज का भाव',
    price: '₹168/kg',
    labelHi: '✅ आज बेचें',
    colour: 'bg-emerald-100 text-emerald-800',
    bgColour: 'bg-emerald-50',
    forecast: '↑ ₹4 कल से ज़्यादा',
  },
  {
    signal: 'hold',
    priceHi: 'आज का भाव',
    price: '₹162/kg',
    labelHi: '⏳ 5 दिन रुकें',
    colour: 'bg-amber-100 text-amber-800',
    bgColour: 'bg-amber-50',
    forecast: '↑ ₹171 अनुमान (+5 दिन)',
  },
  {
    signal: 'caution',
    priceHi: 'आज का भाव',
    price: '₹158/kg',
    labelHi: '⚠️ भाव गिर सकता है',
    colour: 'bg-red-100 text-red-800',
    bgColour: 'bg-red-50',
    forecast: '↓ ₹148–₹155 अनुमान',
  },
];

export function PriceTickerMockup() {
  const [index, setIndex] = useState(0);
  const state = TICKER_STATES[index];

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex(prev => (prev + 1) % TICKER_STATES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    // Phone outer shell
    <div
      className="relative w-[280px] h-[560px] rounded-[3rem] p-2 
                 bg-neutral-900 ring-1 ring-white/10
                 shadow-[0_32px_64px_rgba(0,0,0,0.4)]"
      style={{ perspective: '1000px', transform: 'rotateY(-5deg) rotateX(2deg)' }}
      aria-label="PoultryPulse AI price signal demo"
      role="img"
    >
      {/* Screen */}
      <div className="w-full h-full rounded-[calc(3rem-0.5rem)] bg-white overflow-hidden">
        
        {/* Status bar */}
        <div className="flex justify-between items-center px-4 pt-3 pb-1">
          <span className="text-[11px] font-semibold text-neutral-900">9:41</span>
          <div className="flex gap-1 items-center">
            <div className="w-4 h-2 border border-neutral-400 rounded-sm">
              <div className="w-3/4 h-full bg-emerald-500 rounded-sm" />
            </div>
          </div>
        </div>

        {/* App header */}
        <div className="px-4 py-2 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            {/* Logo mark */}
            <div className="w-6 h-6 rounded-md bg-brandGreen700 flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">PP</span>
            </div>
            <span className="text-[13px] font-semibold text-neutral-900">PoultryPulse AI</span>
          </div>
        </div>

        {/* Dynamic price card */}
        <div className="p-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
              className={`rounded-2xl p-4 ${state.bgColour}`}
            >
              {/* District label */}
              <p className="text-[10px] font-medium text-neutral-500 mb-1">
                गोरखपुर मंडी — आज सुबह 6:30 AM
              </p>

              {/* Price */}
              <p className="text-[10px] text-neutral-500 mb-0.5">{state.priceHi}</p>
              <p className="text-2xl font-bold text-neutral-900 mb-2 font-[Sora]">
                {state.price}
              </p>

              {/* Signal badge */}
              <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-semibold ${state.colour}`}>
                {state.labelHi}
              </span>

              {/* Forecast */}
              {state.forecast && (
                <p className="text-[10px] text-neutral-500 mt-2">{state.forecast}</p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom mini-chart (static) */}
        <div className="px-4 pb-4">
          <p className="text-[10px] font-medium text-neutral-500 mb-2">7-दिन का अनुमान</p>
          {/* Simplified SVG sparkline */}
          <svg width="100%" height="40" viewBox="0 0 240 40" aria-hidden="true">
            {/* P90 area */}
            <path d="M0,8 Q60,4 120,12 Q180,6 240,10" fill="none" stroke="#7CC49A" strokeWidth="1" strokeDasharray="3 3" />
            {/* P50 line */}
            <path d="M0,20 Q60,16 120,22 Q180,18 240,20" fill="none" stroke="#1A6B3C" strokeWidth="2" />
            {/* P10 area */}
            <path d="M0,30 Q60,28 120,32 Q180,28 240,30" fill="none" stroke="#7CC49A" strokeWidth="1" strokeDasharray="3 3" />
            {/* Today marker */}
            <line x1="0" y1="0" x2="0" y2="40" stroke="#E8621A" strokeWidth="1.5" strokeDasharray="2 2" />
          </svg>
        </div>
      </div>

      {/* Floating WhatsApp badge */}
      <motion.div
        className="absolute -top-3 -right-3 bg-[#25D366] text-white 
                   rounded-full px-3 py-1.5 shadow-lg flex items-center gap-1.5"
        animate={{ y: [0, -4, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        aria-hidden="true"
      >
        <span className="text-[10px] font-semibold">📱 6:30 AM Daily</span>
      </motion.div>
    </div>
  );
}
```

### 2.5 StickyScrollSteps (How It Works Section)

```typescript
// apps/web/components/motion/StickyScrollSteps.tsx
'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface Step {
  number: number;
  titleHi: string;
  titleEn: string;
  bodyHi: string;
  visual: React.ReactNode;
}

interface StickyScrollStepsProps {
  steps: Step[];
}

export function StickyScrollSteps({ steps }: StickyScrollStepsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (v) => {
      const stepSize = 1 / steps.length;
      const step = Math.min(Math.floor(v / stepSize), steps.length - 1);
      setActiveStep(step);
    });
    return () => unsubscribe();
  }, [scrollYProgress, steps.length]);

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{ height: `${steps.length * 100}vh` }}
    >
      {/* Sticky container */}
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left: Step content */}
          <div className="space-y-6">
            {/* Step indicators */}
            <div className="flex gap-2">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    i === activeStep
                      ? 'bg-brandGreen700 w-8'
                      : i < activeStep
                      ? 'bg-brandGreen300 w-4'
                      : 'bg-neutral-200 w-4'
                  }`}
                />
              ))}
            </div>

            {/* Step number */}
            <motion.div
              key={`num-${activeStep}`}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
              className="text-sm font-semibold text-brandGreen500 tracking-wider uppercase"
            >
              कदम {activeStep + 1} / {steps.length}
            </motion.div>

            {/* Title */}
            <motion.h3
              key={`title-${activeStep}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-2xl lg:text-3xl font-bold text-neutral-900 font-[Noto_Sans_Devanagari]"
            >
              {steps[activeStep].titleHi}
            </motion.h3>

            {/* Body */}
            <motion.p
              key={`body-${activeStep}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-lg text-neutral-600 leading-relaxed"
            >
              {steps[activeStep].bodyHi}
            </motion.p>
          </div>

          {/* Right: Visual */}
          <div className="flex items-center justify-center">
            <motion.div
              key={`visual-${activeStep}`}
              initial={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              {steps[activeStep].visual}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 2.6 ScrollProgress (Blog Post Reading Progress)

```typescript
// apps/web/components/motion/ScrollProgress.tsx
// CSS scroll-driven animation — zero JS overhead

// Usage: Add to blog post layout
// <ScrollProgress />

export function ScrollProgress() {
  return (
    <>
      {/* CSS scroll-driven animation (modern browsers) */}
      <style>{`
        @supports (animation-timeline: scroll()) {
          .scroll-progress-bar {
            animation: scroll-progress linear;
            animation-timeline: scroll();
            animation-range: 0% 100%;
          }
          @keyframes scroll-progress {
            from { transform: scaleX(0); }
            to { transform: scaleX(1); }
          }
        }
      `}</style>

      <div className="fixed top-0 left-0 right-0 h-1 z-50 bg-neutral-100">
        <div
          className="scroll-progress-bar h-full bg-brandGreen700 origin-left"
          role="progressbar"
          aria-label="Reading progress"
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </>
  );
}
```

### 2.7 DataFlowTicker (How It Works — Step 1 Visual)

```typescript
// apps/web/components/motion/DataFlowTicker.tsx
'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface DataSource {
  name: string;
  nameHi: string;
  value: string;
  direction: 'up' | 'down' | 'neutral';
}

const DATA_SOURCES: DataSource[] = [
  { name: 'AGMARKNET', nameHi: 'AGMARKNET मंडी', value: '₹168/kg', direction: 'up' },
  { name: 'NECC', nameHi: 'NECC राष्ट्रीय दर', value: '₹171/kg', direction: 'up' },
  { name: 'IMD Weather', nameHi: 'IMD मौसम', value: '42°C Max', direction: 'neutral' },
  { name: 'Maize APM', nameHi: 'मक्का APM', value: '₹2,140/qtl', direction: 'down' },
  { name: 'Gorakhpur APMC', nameHi: 'गो. APMC', value: '₹166/kg', direction: 'up' },
  { name: 'Deoria Mandi', nameHi: 'देवरिया मंडी', value: '₹164/kg', direction: 'neutral' },
  { name: 'Soybean MCX', nameHi: 'सोयाबीन MCX', value: '₹4,820/qtl', direction: 'down' },
];

const DIRECTION_ICONS = { up: '↑', down: '↓', neutral: '→' };
const DIRECTION_COLOURS = {
  up: 'text-emerald-600',
  down: 'text-red-500',
  neutral: 'text-amber-500',
};

export function DataFlowTicker() {
  const [visibleIndex, setVisibleIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleIndex(prev => (prev + 1) % DATA_SOURCES.length);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  // Show 4 items at a time, cycling
  const visible = Array.from({ length: 4 }, (_, i) =>
    DATA_SOURCES[(visibleIndex + i) % DATA_SOURCES.length]
  );

  return (
    <div className="bg-neutral-900 rounded-2xl p-6 w-full max-w-sm font-mono">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-emerald-400 text-xs font-semibold tracking-wider">
          LIVE DATA FEED — 4:30 AM
        </span>
      </div>

      <div className="space-y-2 overflow-hidden" style={{ height: '7rem' }}>
        {visible.map((source, i) => (
          <motion.div
            key={`${source.name}-${visibleIndex + i}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="flex items-center justify-between py-1"
          >
            <span className="text-neutral-400 text-xs">{source.nameHi}</span>
            <span className={`text-xs font-semibold ${DIRECTION_COLOURS[source.direction]}`}>
              {DIRECTION_ICONS[source.direction]} {source.value}
            </span>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
        <span className="text-neutral-500 text-[10px]">
          47 sources · Updated 4:30 AM IST
        </span>
      </div>
    </div>
  );
}
```

---

## 3. CSS ANIMATION KEYFRAMES (Tailwind Custom)

### 3.1 Shimmer Skeleton Loading

```css
/* apps/web/styles/animations.css */

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton-shimmer {
  background: linear-gradient(
    90deg,
    #f0f4f1 0%,
    #e0ede5 50%,
    #f0f4f1 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}

/* Usage in Tailwind: apply as class="skeleton-shimmer" on skeleton divs */
```

### 3.2 Pulse Glow (Price update indicator)

```css
@keyframes price-pulse {
  0% { box-shadow: 0 0 0 0 rgba(26, 107, 60, 0.4); }
  70% { box-shadow: 0 0 0 8px rgba(26, 107, 60, 0); }
  100% { box-shadow: 0 0 0 0 rgba(26, 107, 60, 0); }
}

.price-update-pulse {
  animation: price-pulse 1s ease-out 1;
}
/* Triggered via JS: element.classList.add('price-update-pulse') after data refresh */
```

### 3.3 Alert Entrance (HPAI / critical alerts)

```css
@keyframes alert-slide-in {
  from {
    transform: translateX(calc(100% + 1rem));
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes alert-attention {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-4px); }
  40% { transform: translateX(4px); }
  60% { transform: translateX(-2px); }
  80% { transform: translateX(2px); }
}

.alert-enter {
  animation: alert-slide-in 0.4s cubic-bezier(0.25, 1, 0.5, 1) forwards;
}

.alert-critical {
  animation: 
    alert-slide-in 0.4s cubic-bezier(0.25, 1, 0.5, 1) forwards,
    alert-attention 0.5s ease-in-out 0.5s 1;
}
```

### 3.4 Form Error Shake

```css
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 50%, 90% { transform: translateX(-6px); }
  30%, 70% { transform: translateX(6px); }
}

.input-error-shake {
  animation: shake 0.4s ease-in-out 1;
  border-color: #C0392B !important;
}
/* Triggered when form validation fails */
```

### 3.5 Hero Text Reveal (Staggered word reveal)

```css
@keyframes word-reveal {
  from {
    opacity: 0;
    transform: translateY(20px) skewY(2deg);
    filter: blur(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0) skewY(0);
    filter: blur(0);
  }
}

/* Applied to individual <span> words in hero headline */
/* JS splits headline into word spans, then applies staggered delays */
.hero-word {
  display: inline-block;
  animation: word-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
}
.hero-word:nth-child(1) { animation-delay: 0.1s; }
.hero-word:nth-child(2) { animation-delay: 0.18s; }
.hero-word:nth-child(3) { animation-delay: 0.26s; }
/* etc. */

/* NOTE: For Devanagari text, use opacity-only animation: */
.hero-word-devanagari {
  animation: fade-only 0.7s ease-out both;
}
@keyframes fade-only {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

---

## 4. HOVER STATES & MICRO-INTERACTIONS

### 4.1 CTA Button Hover System

```typescript
// Framer Motion variants for primary CTA button
const ctaButtonVariants = {
  idle: {
    scale: 1,
    boxShadow: '0 4px 16px rgba(26, 107, 60, 0.3)',
  },
  hover: {
    scale: 1.02,
    boxShadow: '0 8px 32px rgba(26, 107, 60, 0.45)',
    transition: { duration: 0.2, ease: [0.25, 1, 0.5, 1] },
  },
  press: {
    scale: 0.98,
    boxShadow: '0 2px 8px rgba(26, 107, 60, 0.2)',
    transition: { duration: 0.1, ease: 'linear' },
  },
};

// Trailing arrow animate on hover
const arrowVariants = {
  idle: { x: 0 },
  hover: { x: 4, transition: { duration: 0.2 } },
};
```

### 4.2 Card Hover Lift

```css
/* Standard card hover — subtle elevation change */
.card-hover {
  transition: transform 250ms cubic-bezier(0.25, 1, 0.5, 1),
              box-shadow 250ms cubic-bezier(0.25, 1, 0.5, 1);
}

.card-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(26, 107, 60, 0.12);
}

/* Pricing card hover — more pronounced */
.pricing-card-hover {
  transition: transform 300ms cubic-bezier(0.16, 1, 0.3, 1),
              box-shadow 300ms cubic-bezier(0.16, 1, 0.3, 1);
}

.pricing-card-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 48px rgba(26, 107, 60, 0.16);
}
```

### 4.3 Nav Link Hover (Floating Pill)

```css
/* Nav link hover pill effect */
.nav-link {
  position: relative;
  transition: color 200ms ease;
}

.nav-link::after {
  content: '';
  position: absolute;
  inset: -6px -12px;
  border-radius: 999px;
  background: rgba(26, 107, 60, 0.08);
  opacity: 0;
  transition: opacity 200ms ease;
}

.nav-link:hover::after { opacity: 1; }

.nav-link.active {
  color: #1A6B3C;
  font-weight: 600;
}
```

### 4.4 Dashboard Table Row Hover

```css
/* Data table rows — non-distracting, fast */
.table-row {
  transition: background-color 120ms ease;
  cursor: pointer;
}

.table-row:hover {
  background-color: #F0F7F3; /* DashboardTokens.tableRowHover */
}

/* Expanded row reveal */
.row-expanded {
  animation: expand-row 300ms cubic-bezier(0.25, 1, 0.5, 1);
}

@keyframes expand-row {
  from {
    opacity: 0;
    max-height: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    max-height: 500px;
    transform: translateY(0);
  }
}
```

---

## 5. ILLUSTRATION SYSTEM (Leo Natsume Principle)

### 5.1 Character Design Brief

```
CHARACTER: "Pullu" — the PoultryPulse mascot chicken
Design principles (Leo Natsume illustrative style):
  - Rounded, friendly, no sharp edges
  - Minimal detail — 2-3 colour fills max
  - Expression-driven: Pullu shows emotions through eyes + posture
  - NOT: cartoonish/silly (maintains professional credibility)
  - Colour palette: uses brand colours (green feathers, saffron beak accent)
  - Culturally neutral: can work for UP farming audience

Expressions library (SVG, inline):
  1. Happy Pullu (success state, testimonials) — eyes curved up, slight smile
  2. Thinking Pullu (loading/validating state) — single raised eyebrow, thought bubble
  3. Alert Pullu (warning states) — widened eyes, alert posture
  4. Content Pullu (empty state — no alerts) — sitting in sunshine
  5. Confused Pullu (404, error state) — tilted head, question mark
  6. Pointing Pullu (onboarding tips) — wing pointing direction
  7. Celebrating Pullu (conversion success) — wings raised, confetti sparkles

File format: SVG (inline, not external img) for all uses
  → Allows CSS colouring overrides
  → No network request
  → Scales perfectly
  → Accessible via aria-hidden + adjacent text

SIZE GUIDELINES:
  - Empty state: 120×120px (not too large — screen space is precious)
  - 404 page: 180×180px (more prominent)
  - Success modal: 80×80px
  - Loading indicator: 40×40px (simple spin, not full character)
```

### 5.2 Empty State Compositions

```typescript
// apps/web/components/illustrations/EmptyStateIllustration.tsx

type IllustrationType = 
  | 'no-alerts'         // Pullu sitting in sunshine
  | 'no-customers'      // Pullu with welcome sign
  | 'no-data'           // Pullu looking at empty chalkboard
  | 'loading'           // Thinking Pullu
  | 'success'           // Celebrating Pullu
  | 'error'             // Confused Pullu
  | '404';              // Confused Pullu with giant "404"

interface EmptyStateIllustrationProps {
  type: IllustrationType;
  size?: 80 | 120 | 180;
}

// Each illustration is an inline SVG component
// Example: NoAlertsSVG.tsx — Pullu in sunshine, green bg circle
export function NoAlertsSVG({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Background circle */}
      <circle cx="60" cy="60" r="56" fill="#E8F5EE" />
      {/* Sunshine rays */}
      <circle cx="60" cy="38" r="10" fill="#F5A623" opacity="0.3" />
      {/* Pullu body — simplified oval */}
      <ellipse cx="60" cy="70" rx="18" ry="20" fill="#1A6B3C" />
      {/* Pullu head */}
      <circle cx="60" cy="50" r="12" fill="#2E8653" />
      {/* Eyes — happy curved */}
      <path d="M55 48 Q57 46 59 48" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M62 48 Q64 46 66 48" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Beak */}
      <path d="M58 53 L62 53 L60 56 Z" fill="#E8621A" />
      {/* Wings (resting) */}
      <ellipse cx="44" cy="70" rx="8" ry="6" fill="#16A34A" transform="rotate(-20 44 70)" />
      <ellipse cx="76" cy="70" rx="8" ry="6" fill="#16A34A" transform="rotate(20 76 70)" />
      {/* Feet */}
      <line x1="54" y1="88" x2="52" y2="96" stroke="#E8621A" strokeWidth="2" />
      <line x1="66" y1="88" x2="68" y2="96" stroke="#E8621A" strokeWidth="2" />
    </svg>
  );
}
```

---

## 6. REDUCED MOTION IMPLEMENTATION

### 6.1 CSS Reduced Motion Reset

```css
/* apps/web/styles/reduced-motion.css */
/* Import AFTER main stylesheet */

@media (prefers-reduced-motion: reduce) {
  /* Kill all custom animations */
  *,
  *::before,
  *::after {
    animation-duration: 1ms !important;
    animation-delay: 1ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 1ms !important;
    transition-delay: 1ms !important;
    scroll-behavior: auto !important;
  }

  /* Framer Motion: disable via data attribute */
  [data-framer-motion] {
    transform: none !important;
    opacity: 1 !important;
    filter: none !important;
  }

  /* Counter: show final value immediately */
  .count-up-number {
    transition: none !important;
  }

  /* Shimmer: plain grey box */
  .skeleton-shimmer {
    background: #e0ede5 !important;
    animation: none !important;
  }

  /* Scroll-driven animations: disable */
  .scroll-progress-bar {
    animation: none !important;
  }

  /* Hero phone mockup: show static first state */
  .price-ticker-animated {
    animation: none !important;
  }
}
```

### 6.2 Framer Motion Reduced Motion Hook

```typescript
// apps/web/hooks/useReducedMotion.ts
import { useReducedMotion } from 'framer-motion';

export function useMotionConfig() {
  const shouldReduce = useReducedMotion();

  return {
    // Replace animated variants with instant versions
    fadeUp: shouldReduce
      ? { initial: { opacity: 1, y: 0 }, animate: { opacity: 1, y: 0 } }
      : undefined, // use FadeUp default

    // Counter duration
    countUpDuration: shouldReduce ? 0 : 1500,

    // Transition override
    transition: shouldReduce
      ? { duration: 0, delay: 0 }
      : undefined,

    // Stagger: instant when reduced
    staggerDelay: shouldReduce ? 0 : 0.08,
  };
}
```

---

## 7. PERFORMANCE OPTIMISATION (60fps on Android)

### 7.1 Animation Performance Rules

```
RULE 1: ONLY animate transform + opacity (GPU composited layer)
  ✓ transform: translateY, translateX, scale, rotate
  ✓ opacity
  ✗ width, height, padding, margin, top, left (triggers layout)
  ✗ background-color (use opacity overlay instead)
  ✗ box-shadow during animation (apply at end state only)
  ✗ font-size (triggers layout)
  ✗ filter: blur during heavy animations (expensive on mobile)

RULE 2: will-change ONLY when necessary
  Add: will-change: transform to hero phone mockup (persistent animation)
  Add: will-change: opacity to fade-in elements (during animation, remove after)
  NEVER: will-change: * (memory hog)

RULE 3: Framer Motion deferred loading
  Dynamic import: import dynamic from 'next/dynamic'
  const FadeUp = dynamic(() => import('@/components/motion/FadeUp'), { ssr: false });
  Apply to: StickyScrollSteps, PriceTickerMockup (heavy components)
  Do NOT defer: simple CSS transitions (nav hover, button hover)

RULE 4: IntersectionObserver threshold
  threshold: 0.1 (fire when 10% visible, not 100%)
  rootMargin: '-10% 0px' (slight offset for visual comfort)
  once: true (no repeat animations on scroll up — performance + UX)

RULE 5: AnimatePresence mode="wait" for switching content
  In PriceTickerMockup: mode="wait" ensures exit before enter
  Prevents double-rendering of outgoing + incoming simultaneously

RULE 6: Chart rendering
  Recharts ResponsiveContainer: avoid on fixed-size containers
  For fixed-size charts (e.g., 400×280): provide explicit width/height
  LazyLoad: charts below the fold (not mounted until IntersectionObserver fires)
```

### 7.2 Critical Rendering Path — Hero Section

```
Load order for sub-1.8s LCP:
  1. CSS (inlined critical CSS for hero)
  2. HTML + H1 text (LCP element — text, not image = fast)
  3. Fonts: Sora preload via <link rel="preload" as="font">
  4. Noto Sans Devanagari: preload only if hi-IN locale
  5. Hero background: CSS gradient (no image = instant)
  6. Phone mockup: SVG + CSS (no external image)
  7. Framer Motion: dynamic import, deferred past LCP
  8. CountUp: IntersectionObserver — not triggered until stats section visible

LCP element: H1 text
  → No image in hero = LCP in <1.8s guaranteed if fonts preloaded
  → font-display: swap with metric-matched fallback (fallback metrics pre-calculated)
```

---

## 8. TAILWIND ANIMATION EXTENSIONS

```typescript
// apps/web/tailwind.config.ts — animation extensions
import type { Config } from 'tailwindcss';

const config: Config = {
  theme: {
    extend: {
      animation: {
        'fade-up':       'fade-up 0.7s cubic-bezier(0.16,1,0.3,1) both',
        'fade-in':       'fade-in 0.5s ease-out both',
        'shimmer':       'shimmer 1.5s ease-in-out infinite',
        'price-pulse':   'price-pulse 1s ease-out 1',
        'alert-enter':   'alert-enter 0.4s cubic-bezier(0.25,1,0.5,1) forwards',
        'alert-shake':   'alert-attention 0.5s ease-in-out 1',
        'form-shake':    'shake 0.4s ease-in-out 1',
        'float':         'float 3s ease-in-out infinite',
        'pulse-glow':    'pulse-glow 2s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)', filter: 'blur(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)', filter: 'blur(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      transitionTimingFunction: {
        'out-expo':  'cubic-bezier(0.16, 1, 0.3, 1)',
        'out-quart': 'cubic-bezier(0.25, 1, 0.5, 1)',
        'out-quint': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
};

export default config;
```

---

*Document: 07_motion_animation_master.md*
*Next: 08_external_assets_press_master.md*
