'use client';

import { forwardRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
  onBlur?: () => void;
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value, onChange, error, disabled = false, className = '', onBlur }, ref) => {
    const [touched, setTouched] = useState(false);
    const [internalError, setInternalError] = useState<string>('');

    // Format phone number with space after 5th digit
    const formatPhoneNumber = useCallback((phone: string): string => {
      const digits = phone.replace(/\D/g, '');
      if (digits.length <= 5) return digits;
      return `${digits.slice(0, 5)} ${digits.slice(5)}`;
    }, []);

    // Validate phone number
    const validatePhone = useCallback((phone: string): string | null => {
      const digits = phone.replace(/\D/g, '');
      if (!digits) return null;
      if (!/^[6-9]\d{9}$/.test(digits)) {
        return 'Please enter a valid 10-digit mobile number (must start with 6–9)';
      }
      return null;
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const digits = e.target.value.replace(/\D/g, '');
      if (digits.length <= 10) {
        onChange(formatPhoneNumber(digits));
        if (internalError) setInternalError('');
      }
    };

    const handleBlur = () => {
      setTouched(true);
      const validationError = validatePhone(value);
      setInternalError(validationError || '');
      if (onBlur) onBlur();
    };

    const displayError = error || (touched ? internalError : '');
    const hasError = Boolean(displayError);

    return (
      <div className="relative">
        <div className="relative flex items-center">
          {/* +91 Prefix Pill */}
          <div className="absolute left-0 top-0 bottom-0 flex items-center px-4 bg-neutral-100 rounded-l-xl border border-r-0 border-neutral-200">
            <span className="text-neutral-700 font-semibold text-sm">+91</span>
          </div>

          {/* Input */}
          <input
            ref={ref}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={disabled}
            placeholder="XXXXX XXXXX"
            className={`
              w-full h-[52px] pl-[60px] pr-4
              rounded-xl border
              text-base font-semibold
              placeholder-neutral-400
              transition-all duration-200
              focus:outline-none
              ${hasError
                ? 'border-red-600 focus:ring-2 focus:ring-red-500 bg-red-50'
                : 'border-neutral-200 focus:ring-2 focus:ring-brandGreen-500 focus:border-brandGreen-500 bg-white'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed bg-neutral-50' : ''}
              ${className}
            `}
            aria-invalid={hasError}
            aria-describedby={hasError ? 'phone-error' : undefined}
          />
        </div>

        {/* Error Message */}
        {hasError && (
          <motion.div
            id="phone-error"
            role="alert"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-sm text-red-600 flex items-center gap-1"
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {displayError}
          </motion.div>
        )}
      </div>
    );
  }
);

PhoneInput.displayName = 'PhoneInput';
