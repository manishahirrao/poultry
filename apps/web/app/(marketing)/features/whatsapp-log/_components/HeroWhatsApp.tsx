// FlockIQ — WhatsApp Log Automation Hero Section
// File: apps/web/app/(marketing)/features/whatsapp-log/_components/HeroWhatsApp.tsx
// Version: v3.0 | June 2026
// Task Reference: FEAT-PAGE-001
// Design Reference: FlockIQ_PreLogin_Design_Master_v3.md PAGE B-01 HERO SECTION

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Play, MessageCircle } from 'lucide-react'
import { AlertTriangle as Warning } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FadeUp } from '@/components/motion/FadeUp';

interface ConversationFrame {
  id: number;
  type: 'flockiq' | 'farmer' | 'typing' | 'notification';
  content: string;
  subContent?: string;
}

const CONVERSATION_FRAMES: ConversationFrame[] = [
  {
    id: 1,
    type: 'flockiq',
    content: '🐔 FlockIQ — Shivaji Farm',
    subContent: 'Day 21 daily log:\nReply: [deaths] [feed kg]\nExample: 2 1350',
  },
  {
    id: 2,
    type: 'typing',
    content: '...',
  },
  {
    id: 3,
    type: 'farmer',
    content: '2 1250 1680',
  },
  {
    id: 4,
    type: 'flockiq',
    content: '✅ Log saved — Day 21',
    subContent: 'Deaths: 2 | Feed: 1250 kg\nFCR (est): 1.82 ✓ On target',
  },
  {
    id: 5,
    type: 'notification',
    content: '✓ Shivaji Farm — Day 21 logged\nVia WhatsApp — 6:03 PM',
  },
];

export function HeroWhatsApp() {
  const [currentFrame, setCurrentFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFrame((prev) => {
        if (prev === CONVERSATION_FRAMES.length - 1) {
          return 0; // Loop back to start
        }
        return prev + 1;
      });
    }, 2000); // Change frame every 2 seconds

    return () => clearInterval(interval);
  }, []);

  const frame = CONVERSATION_FRAMES[currentFrame];

  return (
    <section
      className="relative min-h-[80vh] flex items-center overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #075E54 0%, #128C7E 100%)',
      }}
    >
      {/* Hexagonal grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 17.32V51.96L30 69.28L0 51.96V17.32L30 0Z' fill='none' stroke='white' stroke-width='1'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
        aria-hidden="true"
      />

      <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 w-full py-20 grid lg:grid-cols-[1fr_auto] gap-12 lg:gap-16 items-center">
        {/* Left — Text */}
        <div className="max-w-[600px]">
          {/* Eyebrow Pill */}
          <FadeUp delay={0}>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
              <MessageCircle size={16} className="text-white" />
              <span className="text-white text-sm font-medium">
                Powered by WhatsApp Business
              </span>
            </div>
          </FadeUp>

          {/* Headline */}
          <FadeUp delay={0.1}>
            <h1
              className="font-sora font-extrabold text-white leading-[1.02] tracking-[-0.035em] mb-5"
              style={{ fontSize: 'clamp(2.25rem, 4vw + 0.5rem, 3.75rem)' }}
            >
              Your Farmers Type 3 Numbers.
              <br />
              <span className="text-white/90">You See Everything.</span>
            </h1>
          </FadeUp>

          {/* Subheadline */}
          <FadeUp delay={0.2}>
            <p
              className="text-white/80 leading-[1.75] mb-8 font-jakarta"
              style={{ fontSize: 'clamp(1rem, 0.5vw + 0.875rem, 1.25rem)', maxWidth: '520px' }}
            >
              The only poultry platform that automatically collects daily farm data
              via WhatsApp — no app install for the farmer, no phone calls for you.
            </p>
          </FadeUp>

          {/* CTAs */}
          <FadeUp delay={0.3}>
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Button
                variant="primary"
                size="hero"
                pill
                className="bg-white text-[#075E54] hover:bg-white/90 shadow-[0_4px_16px_rgba(0,0,0,0.25)]"
                asChild
              >
                <Link href="/signup">Set Up WhatsApp Log — Free →</Link>
              </Button>

              <Button
                variant="ghost"
                size="hero"
                pill
                icon={<Play size={16} fill="currentColor" />}
                iconPosition="left"
                className="text-white bg-white/15 hover:bg-white/20"
              >
                See it in 60 seconds
              </Button>
            </div>
          </FadeUp>

          {/* Trust Proof */}
          <FadeUp delay={0.4}>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-white/70 text-sm">
              <span className="font-semibold text-white">97% log compliance rate</span>
              <span>•</span>
              <span>500+ farms across 15 countries</span>
              <span>•</span>
              <span>&lt;60s parse time</span>
            </div>
          </FadeUp>
        </div>

        {/* Right — Animated WhatsApp Conversation */}
        <FadeUp delay={0.2} className="hidden lg:block">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative"
          >
            {/* Phone Frame */}
            <div className="relative bg-neutral-900 rounded-[32px] p-3 shadow-2xl w-[320px]">
              {/* Screen */}
              <div className="bg-[#E5DDD5] rounded-[24px] overflow-hidden min-h-[500px] relative">
                {/* WhatsApp Header */}
                <div className="bg-[#075E54] px-4 py-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="text-white text-lg">🐔</span>
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm">FlockIQ</div>
                    <div className="text-white/70 text-xs">Shivaji Farm</div>
                  </div>
                </div>

                {/* Chat Area */}
                <div className="p-4 space-y-3">
                  <AnimatePresence mode="wait">
                    {frame.type === 'flockiq' && (
                      <motion.div
                        key={frame.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="flex justify-start"
                      >
                        <div className="bg-white rounded-lg rounded-tl-none px-4 py-2 max-w-[80%] shadow-sm">
                          <div className="text-neutral-800 text-sm font-medium mb-1">{frame.content}</div>
                          {frame.subContent && (
                            <div className="text-neutral-600 text-xs whitespace-pre-line">{frame.subContent}</div>
                          )}
                          <div className="text-neutral-400 text-[10px] mt-1 text-right">
                            {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {frame.type === 'farmer' && (
                      <motion.div
                        key={frame.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                        className="flex justify-end"
                      >
                        <div className="bg-[#DCF8C6] rounded-lg rounded-tr-none px-4 py-2 max-w-[80%] shadow-sm">
                          <div className="text-neutral-800 text-sm font-medium">{frame.content}</div>
                          <div className="flex items-center justify-end gap-1 mt-1">
                            <div className="text-neutral-400 text-[10px]">
                              {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                            </div>
                            <svg className="w-4 h-4 text-[#34B7F1]" viewBox="0 0 16 11" fill="currentColor">
                              <path d="M1 5.5L5.5 10L15 1" stroke="currentColor" strokeWidth="2" fill="none"/>
                            </svg>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {frame.type === 'typing' && (
                      <motion.div
                        key={frame.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex justify-end"
                      >
                        <div className="bg-[#DCF8C6] rounded-lg rounded-tr-none px-4 py-3 shadow-sm">
                          <div className="flex gap-1">
                            <motion.div
                              animate={{ y: [0, -4, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity }}
                              className="w-2 h-2 bg-neutral-400 rounded-full"
                            />
                            <motion.div
                              animate={{ y: [0, -4, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: 0.1 }}
                              className="w-2 h-2 bg-neutral-400 rounded-full"
                            />
                            <motion.div
                              animate={{ y: [0, -4, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                              className="w-2 h-2 bg-neutral-400 rounded-full"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {frame.type === 'notification' && (
                      <motion.div
                        key={frame.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.3 }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-3 shadow-lg border border-green-200"
                      >
                        <div className="text-green-700 text-sm font-medium whitespace-pre-line text-center">
                          {frame.content}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Floating notification badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="absolute -bottom-4 -right-4 bg-white rounded-xl px-4 py-3 shadow-xl border border-green-200"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-600 text-sm">✓</span>
                </div>
                <div className="text-sm">
                  <div className="font-semibold text-neutral-900">Dashboard Updated</div>
                  <div className="text-neutral-500 text-xs">Instant sync</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </FadeUp>
      </div>
    </section>
  );
}
