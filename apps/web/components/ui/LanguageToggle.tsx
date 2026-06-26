// FlockIQ — Language Toggle Component (v3.0)
// File: apps/web/components/ui/LanguageToggle.tsx
// Version: v3.0 | June 2026
// Task Reference: NAV-002
// Design Reference: FlockIQ_PreLogin_Design_Master_v3.md §2.2

'use client';

import { useLanguage } from '@/providers/LanguageProvider';
import { cn } from '@/lib/utils';

export function LanguageToggle({ className }: { className?: string }) {
  const { language, setLanguage } = useLanguage();

  return (
    <div className={cn('inline-flex items-center bg-neutral-100 rounded-full p-1', className)}>
      <button
        onClick={() => setLanguage('en')}
        className={cn(
          'px-3 py-1.5 rounded-full text-xs font-semibold transition-colors duration-200',
          language === 'en'
            ? 'bg-white text-brand-700'
            : 'text-neutral-500 hover:text-neutral-700'
        )}
        aria-label="Switch to English"
        aria-pressed={language === 'en'}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage('hi')}
        className={cn(
          'px-3 py-1.5 rounded-full text-xs font-semibold transition-colors duration-200',
          language === 'hi'
            ? 'bg-white text-brand-700'
            : 'text-neutral-500 hover:text-neutral-700'
        )}
        aria-label="Switch to Hindi"
        aria-pressed={language === 'hi'}
      >
        हि
      </button>
    </div>
  );
}

export default LanguageToggle;
