'use client';

import { useState, useRef, useId } from 'react';
import { ChevronDown } from 'lucide-react'
import { AlertTriangle as Warning } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface AccordionItem {
  question: string;
  answer: string;
}

interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
}

export function Accordion({ items, allowMultiple = false }: AccordionProps) {
  const [openIndices, setOpenIndices] = useState<Set<number>>(new Set());
  const baseId = useId();

  const toggle = (index: number) => {
    setOpenIndices((prev) => {
      const next = new Set(allowMultiple ? prev : new Set<number>());
      if (prev.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <div className="divide-y divide-neutral-150" role="list">
      {items.map((item, i) => {
        const isOpen = openIndices.has(i);
        const triggerId = `${baseId}-trigger-${i}`;
        const contentId = `${baseId}-content-${i}`;

        return (
          <div key={i} role="listitem">
            <button
              id={triggerId}
              aria-expanded={isOpen}
              aria-controls={contentId}
              onClick={() => toggle(i)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') { e.preventDefault(); toggle(Math.min(i + 1, items.length - 1)); }
                if (e.key === 'ArrowUp') { e.preventDefault(); toggle(Math.max(i - 1, 0)); }
              }}
              className="w-full flex items-center justify-between gap-4 py-5 text-left font-jakarta font-semibold text-neutral-900 text-[15px] hover:text-brand-700 transition-colors"
            >
              {item.question}
              <ChevronDown
                size={18}
                className={`flex-shrink-0 text-neutral-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={contentId}
                  role="region"
                  aria-labelledby={triggerId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <p className="pb-5 text-neutral-600 font-jakarta text-[15px] leading-relaxed pr-8">
                    {item.answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
