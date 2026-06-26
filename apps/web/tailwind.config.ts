// FlockIQ — Tailwind CSS Configuration (v3.0)
// File: apps/web/tailwind.config.ts
// Brand: FlockIQ (formerly FlockIQ / FlockIQ)
// Reference: FlockIQ_PreLogin_Design_Master_v3.md
// Stack: Next.js 15 App Router · TypeScript strict · Tailwind CSS v4

import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // FlockIQ Brand Colors (Forest Green)
        brand: {
          900: '#0D3B21',
          800: '#144D2B',
          700: '#1A5C34',   // ← primary brand
          600: '#1F7040',
          500: '#25874D',
          400: '#3DAE72',   // ← accent
          300: '#68C690',
          200: '#A3DBBA',
          100: '#D4EFDE',
          50:  '#EDF7F1',
        },
        // Signal Colors (Saffron Orange)
        signal: {
          700: '#C4490E',
          500: '#E8611A',   // ← sell signal orange
          300: '#F5A044',
          light: '#FDF0E8',
        },
        // Neutral Scale (warm-tinted)
        neutral: {
          950: '#0F1A12',
          900: '#1C2B22',
          800: '#263D2F',
          700: '#334D3E',
          600: '#4A6556',
          500: '#5A7A68',
          400: '#7A9C8A',
          300: '#A0BAA9',
          200: '#C8DDD2',
          150: '#DDE9E2',
          100: '#EAF1ED',
          50:  '#F4F8F5',
        },
        // Legacy brand colors (for backward compatibility)
        brandOrange: {
          700: '#D4551A',
          600: '#E86A2A',
          500: '#F0803A',
          300: '#F5B88A',
          100: '#FDE8D8',
          50: '#FDF0E8',
          25: '#FEF7F2',
        },
        brandGreen: {
          700: '#1A6B3C',
          600: '#1E7D44',
          500: '#2E8653',
          300: '#7CC49A',
          100: '#C8DDD2',
          50: '#E8F5EE',
          25: '#F4FAF6',
        },
        saffron: { DEFAULT: '#E8621A', light: '#FDF0E8' },
        // Farm & Metrics Module Design Tokens (from 14_integrator_farms_design_master.md)
        fcrExcellent: '#16A34A',
        fcrGood: '#65A30D',
        fcrWarning: '#D97706',
        fcrCritical: '#DC2626',
        fcrNeutral: '#6B7280',
        mortalityNormal: '#16A34A',
        mortalityElevated: '#D97706',
        mortalityCritical: '#DC2626',
        gainOnTrack: '#1A6B3C',
        gainBehind: '#D97706',
        gainAhead: '#2563EB',
        feedNormal: '#1A6B3C',
        feedHigh: '#D97706',
        feedLow: '#DC2626',
        farmActive: '#16A34A',
        farmBetween: '#6B7280',
        farmOnboarding: '#2563EB',
        farmPaused: '#D97706',
        batchPlacement: '#2563EB',
        batchGrow: '#1A6B3C',
        batchHarvest: '#F5A623',
        batchClosed: '#6B7280',
        healthGreen: '#16A34A',
        healthAmber: '#D97706',
        healthRed: '#DC2626',
        targetLine: '#9CA3AF',
        industryAvg: '#94a3b8',
      },
      fontFamily: {
        // FlockIQ Font Stack (v3.0)
        sora: ['Sora', 'system-ui', 'sans-serif'],
        jakarta: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        devanagari: ['Noto Sans Devanagari', 'Mangal', 'sans-serif'],
        mono: ['Geist Mono', 'JetBrains Mono', 'monospace'],
        // Legacy font stack (for backward compatibility)
        spaceGrotesk: ['var(--font-space-grotesk)', 'system-ui'],
      },
      letterSpacing: {
        'tighter-negative': '-0.05em',
        'tight-negative': '-0.04em',
        'negative': '-0.03em',
        'wide-positive': '0.05em',
      },
      lineHeight: {
        'tight-hero': '1.05',
        'tight-display': '1.1',
        'relaxed-body': '1.75',
        // Website marketing line heights (TASK-WEB-002)
        'marketing-display': '1.1',
        'marketing-body': '1.6',
      },
      fontSize: {
        // Website marketing typography scale (TASK-WEB-002)
        'display': ['clamp(48px, 6vw, 80px)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'h1': ['clamp(36px, 4vw, 56px)', { lineHeight: '1.1', letterSpacing: '-0.01em' }],
        'h2': ['clamp(28px, 3vw, 40px)', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'h3': ['clamp(22px, 2.5vw, 32px)', { lineHeight: '1.3' }],
        'body-lg': ['clamp(17px, 1.5vw, 20px)', { lineHeight: '1.6' }],
        'caption': ['14px', { lineHeight: '1.4' }],
      },
      animation: {
        // FlockIQ Animations (v3.0)
        'float': 'float 4s ease-in-out infinite',
        'particle-drift': 'particleDrift 8s ease-in-out infinite',
        'counter-up': 'counterUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        // Spring physics-based animations (legacy)
        'fade-up': 'fade-up 0.6s cubic-bezier(0.16,1,0.3,1) both',
        'fade-in': 'fade-in 0.4s ease-out both',
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'pulse-subtle': 'pulse-subtle 2s cubic-bezier(0.4,0,0.6,1) infinite',
        'slide-in-right': 'slide-in-right 0.4s cubic-bezier(0.16,1,0.3,1) both',
      },
      keyframes: {
        // FlockIQ Keyframes (v3.0)
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        particleDrift: {
          '0%': { transform: 'translate(0, 0) scale(1)', opacity: '0.15' },
          '33%': { transform: 'translate(20px, -15px) scale(1.1)', opacity: '0.2' },
          '66%': { transform: 'translate(-10px, 10px) scale(0.9)', opacity: '0.12' },
          '100%': { transform: 'translate(0, 0) scale(1)', opacity: '0.15' },
        },
        counterUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        // Legacy keyframes (for backward compatibility)
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-subtle': {
          '0%,100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
      transitionTimingFunction: {
        // Premium spring physics
        'spring': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'out-quart': 'cubic-bezier(0.25, 1, 0.5, 1)',
        'out-quint': 'cubic-bezier(0.23, 1, 0.32, 1)',
      },
      spacing: {
        // Semantic spacing scale (4pt base)
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '32px',
        '3xl': '48px',
        '4xl': '64px',
        '5xl': '96px',
        // Section vertical padding — fluid scale used via py-section-vertical
        'section-vertical': 'clamp(5rem, 8vw, 9rem)',
        // Dashboard-specific spacing
        'section-tight': 'clamp(1rem, 2vw, 1.5rem)',
        'section-normal': 'clamp(1.5rem, 3vw, 2rem)',
        'section-generous': 'clamp(2rem, 4vw, 3rem)',
        'card-compact': '16px',
        'card-standard': '24px',
        'card-spacious': '32px',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
        '2xl': '16px',
        '3xl': '24px',
        // Website marketing border radius (TASK-WEB-002)
        'card': '16px',
        'pill': '999px',
      },
      zIndex: {
        'dropdown': '1000',
        'sticky': '1020',
        'fixed': '1030',
        'modal-backdrop': '1040',
        'modal': '1050',
        'popover': '1060',
        'tooltip': '1070',
      },
      boxShadow: {
        // Diffusion shadows (premium, wide-spreading)
        'diffusion': '0 20px 40px -15px rgba(0,0,0,0.05)',
        'diffusion-lg': '0 25px 50px -12px rgba(0,0,0,0.08)',
        'brand-tint': '0 4px 24px rgba(26, 107, 60, 0.12)',
        'brand-tint-lg': '0 8px 32px rgba(26, 107, 60, 0.16)',
        'saffron-tint': '0 4px 24px rgba(232, 98, 26, 0.12)',
        'neutral-tint': '0 4px 24px rgba(28, 43, 34, 0.08)',
      },
      backgroundImage: {
        'hero-gradient': 'radial-gradient(ellipse at top, #D4551A 0%, #A84010 50%, #2B1D15 100%)',
        'accent-gradient': 'linear-gradient(135deg, #E8621A 0%, #F5A623 100%)',
        'trust-gradient': 'radial-gradient(ellipse at top, #E8F5EE 0%, #FFFFFF 100%)',
        'noise-pattern': 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
        'radial-brand': 'radial-gradient(circle at center, rgba(212, 85, 26, 0.08) 0%, transparent 70%)',
        'radial-saffron': 'radial-gradient(circle at center, rgba(232, 98, 26, 0.06) 0%, transparent 70%)',
        'radial-warm': 'radial-gradient(ellipse at top right, rgba(245, 166, 35, 0.04) 0%, transparent 60%)',
      },
    },
  },
  plugins: [
    function({ addUtilities }: any) {
      addUtilities({
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
      })
    },
  ],
};

export default config;
