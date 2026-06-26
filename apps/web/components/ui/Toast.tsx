'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, WarningCircle, X } from '@phosphor-icons/react';

interface ToastProps {
  type?: 'success' | 'error' | 'info';
  message: string;
  duration?: number;
  onClose?: () => void;
}

export function Toast({ 
  type = 'success', 
  message, 
  duration = 3000, 
  onClose 
}: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onClose?.(), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle size={20} weight="fill" className="text-green-600" />,
    error: <WarningCircle size={20} weight="fill" className="text-red-600" />,
    info: <WarningCircle size={20} weight="fill" className="text-blue-600" />,
  };

  const bgColors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: -20, x: '-50%' }}
          className={`fixed top-4 left-1/2 z-50 px-4 py-3 rounded-lg border shadow-lg flex items-center gap-3 ${bgColors[type]}`}
          style={{ transform: 'translateX(-50%)' }}
        >
          {icons[type]}
          <span className="text-sm font-medium text-neutral-900">{message}</span>
          {onClose && (
            <button
              onClick={() => {
                setVisible(false);
                setTimeout(() => onClose(), 300);
              }}
              className="ml-2 text-neutral-400 hover:text-neutral-600"
            >
              <X size={16} />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Toast container for managing multiple toasts
interface ToastContainerProps {
  children: React.ReactNode;
}

export function ToastContainer({ children }: ToastContainerProps) {
  return (
    <div className="fixed top-4 left-1/2 z-50" style={{ transform: 'translateX(-50%)' }}>
      {children}
    </div>
  );
}
