'use client';

import { useState } from 'react';
import { ArrowClockwise, Warning, X } from '@phosphor-icons/react';

export function RetrainControls() {
  const [retrainStep, setRetrainStep] = useState<0 | 1 | 2>(0);
  const [rollbackStep, setRollbackStep] = useState<0 | 1 | 2>(0);
  const [retraining, setRetraining] = useState(false);
  const [rollingBack, setRollingBack] = useState(false);

  const handleRetrain = async () => {
    if (retrainStep === 0) {
      setRetrainStep(1);
    } else if (retrainStep === 1) {
      setRetrainStep(2);
    } else {
      // Execute retrain
      setRetraining(true);
      try {
        await fetch('/api/admin/retrain', { method: 'POST' });
        setRetrainStep(0);
      } catch (error) {
        console.error('Retrain failed:', error);
      } finally {
        setRetraining(false);
      }
    }
  };

  const handleRollback = async () => {
    if (rollbackStep === 0) {
      setRollbackStep(1);
    } else if (rollbackStep === 1) {
      setRollbackStep(2);
    } else {
      // Execute rollback
      setRollingBack(true);
      try {
        await fetch('/api/admin/rollback', { method: 'POST' });
        setRollbackStep(0);
      } catch (error) {
        console.error('Rollback failed:', error);
      } finally {
        setRollingBack(false);
      }
    }
  };

  const cancelRetrain = () => setRetrainStep(0);
  const cancelRollback = () => setRollbackStep(0);

  return (
    <div className="space-y-4">
      {/* Manual Retrain */}
      <div className="bg-white rounded-2xl border border-neutral-100 p-6">
        <h3 className="text-base font-semibold text-neutral-900 mb-4">Manual Retrain</h3>
        
        <div className="flex items-start gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
            <ArrowClockwise size={16} weight="bold" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-neutral-700 mb-2">
              Trigger a manual model retrain. This will queue a new training job in Airflow.
            </p>
            <div className="text-xs text-neutral-500 space-y-1">
              <div>• Rate limit: 1 retrain per 6 hours</div>
              <div>• Estimated completion: ~2 hours</div>
              <div>• Last retrain: 2 days ago</div>
            </div>
          </div>
        </div>

        {retrainStep === 0 && (
          <button
            onClick={handleRetrain}
            disabled={retraining}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {retraining ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block mr-2" />
                Retraining...
              </>
            ) : (
              'Trigger Retrain'
            )}
          </button>
        )}

        {retrainStep === 1 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Warning size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-800 mb-2">
                  Are you sure you want to trigger a manual retrain?
                </p>
                <p className="text-xs text-amber-700 mb-3">
                  This will queue a new training job and may temporarily affect prediction quality.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleRetrain}
                    className="px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-semibold hover:bg-amber-700 transition-colors"
                  >
                    Yes, Trigger Retrain
                  </button>
                  <button
                    onClick={cancelRetrain}
                    className="px-3 py-1.5 border border-amber-300 text-amber-800 rounded-lg text-xs font-semibold hover:bg-amber-100 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {retrainStep === 2 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Warning size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-800 mb-2">
                  Final confirmation required
                </p>
                <p className="text-xs text-red-700 mb-3">
                  Type "RETRAIN" to confirm this action. This is irreversible.
                </p>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="Type RETRAIN"
                    className="flex-1 px-3 py-1.5 border border-red-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleRetrain}
                    disabled={retraining}
                    className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {retraining ? 'Retraining...' : 'Confirm Retrain'}
                  </button>
                  <button
                    onClick={cancelRetrain}
                    className="px-3 py-1.5 border border-red-300 text-red-800 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Model Rollback */}
      <div className="bg-white rounded-2xl border border-neutral-100 p-6">
        <h3 className="text-base font-semibold text-neutral-900 mb-4">Model Rollback</h3>
        
        <div className="flex items-start gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center flex-shrink-0">
            <X size={16} weight="bold" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-neutral-700 mb-2">
              Rollback to the previous promoted model version.
            </p>
            <div className="text-xs text-neutral-500 space-y-1">
              <div>• Current: v2.3.1</div>
              <div>• Previous: v2.3.0</div>
              <div>• This action is irreversible</div>
            </div>
          </div>
        </div>

        {rollbackStep === 0 && (
          <button
            onClick={handleRollback}
            disabled={rollingBack}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {rollingBack ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block mr-2" />
                Rolling Back...
              </>
            ) : (
              'Rollback to v2.3.0'
            )}
          </button>
        )}

        {rollbackStep === 1 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Warning size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-800 mb-2">
                  Are you sure you want to rollback to v2.3.0?
                </p>
                <p className="text-xs text-amber-700 mb-3">
                  This will immediately replace the current model with the previous version.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleRollback}
                    className="px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-semibold hover:bg-amber-700 transition-colors"
                  >
                    Yes, Rollback
                  </button>
                  <button
                    onClick={cancelRollback}
                    className="px-3 py-1.5 border border-amber-300 text-amber-800 rounded-lg text-xs font-semibold hover:bg-amber-100 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {rollbackStep === 2 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Warning size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-800 mb-2">
                  Final confirmation required
                </p>
                <p className="text-xs text-red-700 mb-3">
                  Type "ROLLBACK" to confirm this action. This is irreversible and will affect all predictions.
                </p>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="Type ROLLBACK"
                    className="flex-1 px-3 py-1.5 border border-red-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleRollback}
                    disabled={rollingBack}
                    className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {rollingBack ? 'Rolling Back...' : 'Confirm Rollback'}
                  </button>
                  <button
                    onClick={cancelRollback}
                    className="px-3 py-1.5 border border-red-300 text-red-800 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
