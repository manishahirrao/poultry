// FlockIQ — Morphing Dialog Component
// File: apps/web/components/animations/MorphingDialog.tsx
// Version: v1.0 | May 2026
// Trust-Focused Extraordinary: Dialogs that morph from their trigger buttons

'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MorphingDialogProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function MorphingDialog({ 
  trigger, 
  children, 
  isOpen: controlledIsOpen, 
  onOpenChange 
}: MorphingDialogProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);

  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = onOpenChange || setInternalIsOpen;

  // Capture trigger position when dialog opens
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setTriggerRect(rect);
    }
  }, [isOpen]);

  const handleTriggerClick = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setTriggerRect(rect);
    }
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Trigger */}
      <div 
        ref={triggerRef}
        onClick={handleTriggerClick}
        className="cursor-pointer"
      >
        {trigger}
      </div>

      {/* Morphing Dialog */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={handleClose}
            />

            {/* Dialog */}
            <motion.div
              initial={{ 
                opacity: 0,
                scale: triggerRect ? 
                  Math.min(triggerRect.width / 400, triggerRect.height / 300) : 0.8,
                x: triggerRect ? triggerRect.left + triggerRect.width / 2 - window.innerWidth / 2 : 0,
                y: triggerRect ? triggerRect.top + triggerRect.height / 2 - window.innerHeight / 2 : 0,
                borderRadius: triggerRect ? 8 : 16,
              }}
              animate={{ 
                opacity: 1,
                scale: 1,
                x: 0,
                y: 0,
                borderRadius: 16,
              }}
              exit={{ 
                opacity: 0,
                scale: triggerRect ? 
                  Math.min(triggerRect.width / 400, triggerRect.height / 300) : 0.8,
                x: triggerRect ? triggerRect.left + triggerRect.width / 2 - window.innerWidth / 2 : 0,
                y: triggerRect ? triggerRect.top + triggerRect.height / 2 - window.innerHeight / 2 : 0,
                borderRadius: triggerRect ? 8 : 16,
              }}
              transition={{ 
                duration: 0.3,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div 
                className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-auto pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {children}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
