'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';
import { FCRBadge, MortalityBadge, FarmStatusBadge } from '@/components/farms';

interface Farm {
  id: string;
  name: string;
  district: string;
  status: string;
  activeBatch?: {
    id: string;
    batchNumber: number;
    birdsPlaced: number;
    birdsAlive: number;
    placementDate: string;
    fcr: number;
    mortality: number;
    feedConsumedKg: number;
  };
}

interface FarmDetailDrawerProps {
  farm: Farm;
  isOpen: boolean;
  onClose: () => void;
}

export function FarmDetailDrawer({ farm, isOpen, onClose }: FarmDetailDrawerProps) {
  const router = useRouter();

  // Handle escape key to close drawer
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when drawer is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Focus trap
  useEffect(() => {
    if (isOpen) {
      const focusableElements = document.querySelectorAll(
        '#farm-drawer button, #farm-drawer a, #farm-drawer input'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      if (firstElement) {
        firstElement.focus();
      }
    }
  }, [isOpen]);

  const handleViewFarm = () => {
    router.push(`/dashboard/farms/${farm.id}`);
    onClose();
  };

  const batch = farm.activeBatch;
  const daysSincePlacement = batch?.placementDate
    ? Math.floor((Date.now() - new Date(batch.placementDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
          />

          {/* Drawer */}
          <motion.div
            id="farm-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 overflow-y-auto"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{farm.name}</h2>
                  <p className="text-sm text-gray-600 mt-1">{farm.district}</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Close drawer"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Status Badge */}
              <div className="mb-6">
                <FarmStatusBadge status={farm.status as any} />
              </div>

              {/* Batch Info */}
              {batch && (
                <div className="space-y-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Current Batch</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-600">Batch Number</p>
                        <p className="text-sm font-semibold text-gray-900">#{batch.batchNumber}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Day</p>
                        <p className="text-sm font-semibold text-gray-900">{daysSincePlacement}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Birds Placed</p>
                        <p className="text-sm font-semibold text-gray-900">{batch.birdsPlaced.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Birds Alive</p>
                        <p className="text-sm font-semibold text-gray-900">{batch.birdsAlive.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <p className="text-xs text-gray-600 mb-1">FCR</p>
                      <FCRBadge fcr={batch.fcr} />
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <p className="text-xs text-gray-600 mb-1">Mortality</p>
                      <MortalityBadge mortalityPct={batch.mortality} />
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Links */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>
                <button
                  onClick={handleViewFarm}
                  className="w-full text-left px-4 py-3 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg text-sm font-semibold text-green-800 transition-colors"
                >
                  View Full Farm Details
                </button>
                {batch && (
                  <button
                    onClick={() => {
                      router.push(`/dashboard/farms/${farm.id}/daily-log`);
                      onClose();
                    }}
                    className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-sm font-semibold text-blue-800 transition-colors"
                  >
                    Log Today's Data
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
