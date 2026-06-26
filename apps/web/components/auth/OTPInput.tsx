'use client';

import { forwardRef, useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  maxAttempts?: number;
  attemptsRemaining?: number;
  onComplete?: (code: string) => void;
  className?: string;
}

export const OTPInput = forwardRef<HTMLDivElement, OTPInputProps>(
  (
    {
      length = 6,
      value,
      onChange,
      error,
      disabled = false,
      maxAttempts = 5,
      attemptsRemaining,
      onComplete,
      className = '',
    },
    ref
  ) => {
    const [isComplete, setIsComplete] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    // Initialize input refs
    useEffect(() => {
      inputRefs.current = inputRefs.current.slice(0, length);
    }, [length]);

    // Handle individual digit input
    const handleDigitChange = useCallback(
      (index: number, digit: string) => {
        if (disabled) return;

        const newValue = value.split('');
        newValue[index] = digit;
        const newCode = newValue.join('');

        onChange(newCode);

        // Auto-advance to next input
        if (digit && index < length - 1) {
          inputRefs.current[index + 1]?.focus();
        }

        // Check if complete
        if (newCode.length === length && !isComplete) {
          setIsComplete(true);
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 200);
          onComplete?.(newCode);
        } else if (newCode.length < length) {
          setIsComplete(false);
        }
      },
      [value, length, disabled, onChange, isComplete, onComplete]
    );

    // Handle keyboard navigation
    const handleKeyDown = useCallback(
      (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (disabled) return;

        // Backspace: clear current and move to previous
        if (e.key === 'Backspace') {
          if (!value[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
          }
        }

        // Arrow navigation
        if (e.key === 'ArrowLeft' && index > 0) {
          inputRefs.current[index - 1]?.focus();
        }
        if (e.key === 'ArrowRight' && index < length - 1) {
          inputRefs.current[index + 1]?.focus();
        }
      },
      [value, length, disabled]
    );

    // Handle paste
    const handlePaste = useCallback(
      (e: React.ClipboardEvent<HTMLInputElement>) => {
        if (disabled) return;
        e.preventDefault();

        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');
        if (pastedData.length === length) {
          onChange(pastedData);
          setIsComplete(true);
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 200);
          onComplete?.(pastedData);
        }
      },
      [length, disabled, onChange, onComplete]
    );

    // Clear all inputs on error
    useEffect(() => {
      if (error && value.length > 0) {
        onChange('');
        setIsComplete(false);
        inputRefs.current[0]?.focus();
      }
    }, [error, onChange]);

    const hasError = Boolean(error);
    const isLocked = maxAttempts > 0 && attemptsRemaining === 0;

    return (
      <div ref={ref} className={`w-full ${className}`}>
        <div
          ref={containerRef}
          role="group"
          aria-label="Enter your 6-digit verification code"
          className={`
            flex gap-2 justify-center
            ${hasError ? 'input-error-shake' : ''}
            ${isLocked ? 'opacity-50 pointer-events-none' : ''}
          `}
        >
          {Array.from({ length }).map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <input
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={value[index] || ''}
                onChange={(e) => {
                  const digit = e.target.value.replace(/\D/g, '');
                  if (digit) handleDigitChange(index, digit);
                }}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                disabled={disabled || isLocked}
                className={`
                  w-[52px] h-[56px]
                  rounded-xl border-2
                  text-center
                  font-space-grotesk font-bold text-2xl
                  transition-all duration-200
                  focus:outline-none
                  ${hasError
                    ? 'border-red-600 bg-red-50 text-red-600'
                    : showSuccess && isComplete
                    ? 'border-green-600 bg-green-50 text-green-600'
                    : 'border-neutral-200 bg-white focus:border-brandGreen-500 focus:ring-2 focus:ring-brandGreen-500'
                  }
                  ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                aria-label={`OTP digit ${index + 1}`}
                autoComplete="one-time-code"
              />
            </motion.div>
          ))}
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {hasError && (
            <motion.div
              role="alert"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="mt-3 text-sm text-red-600 flex items-center justify-center gap-1"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Locked State */}
        {isLocked && (
          <motion.div
            role="alert"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 text-sm text-neutral-600 text-center"
          >
            Too many incorrect attempts — please wait 30 minutes and try again.
          </motion.div>
        )}
      </div>
    );
  }
);

OTPInput.displayName = 'OTPInput';
