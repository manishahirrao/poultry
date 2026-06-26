'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, X, Shield, Info, Clock } from '@phosphor-icons/react';
import { createClient } from '@/utils/supabase/client';
import {
  biosecurityAuditItems,
  BiosecurityAuditResponse,
  calculateBiosecurityScore,
  getScoreColor,
  getScoreLabel
} from '@/lib/biosecurityAuditItems';

interface BiosecurityAuditFormProps {
  batchId: string;
  batchIdDisplay: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function BiosecurityAuditForm({
  batchId,
  batchIdDisplay,
  onSuccess,
  onCancel
}: BiosecurityAuditFormProps) {
  const supabase = createClient();

  const [responses, setResponses] = useState<Record<string, BiosecurityAuditResponse>>({});
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [currentScore, setCurrentScore] = useState(0);

  // Calculate live score as responses change
  useEffect(() => {
    const score = calculateBiosecurityScore(responses);
    setCurrentScore(score);
  }, [responses]);

  const handleResponseChange = (itemId: string, response: BiosecurityAuditResponse) => {
    setResponses(prev => ({ ...prev, [itemId]: response }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validate that all items are answered
      const answeredCount = Object.keys(responses).length;
      if (answeredCount < biosecurityAuditItems.length) {
        throw new Error(`Please answer all ${biosecurityAuditItems.length} items before submitting`);
      }

      if (!supabase) throw new Error('Supabase not configured');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const score = calculateBiosecurityScore(responses);

      // Insert biosecurity audit
      const { error: insertError } = await supabase
        .from('biosecurity_audits')
        .insert({
          batch_id: batchId,
          audit_date: new Date().toISOString().split('T')[0],
          responses: responses,
          score: score,
          notes: notes || null,
          logged_by: user.id,
          synced: true
        });

      if (insertError) throw insertError;

      // Check if score triggers alerts
      if (score < 40) {
        // Create critical alert
        if (!supabase) throw new Error('Supabase not configured');
        await supabase
          .from('alerts')
          .insert({
            customer_id: user.id,
            alert_type: 'biosecurity_score_low',
            severity: 'critical',
            title: 'Critical Biosecurity Score',
            message: `Biosecurity audit score is ${score}% - immediate corrective action required`,
            metadata: {
              batch_id: batchId,
              score: score,
              audit_date: new Date().toISOString().split('T')[0]
            },
            is_read: false,
            created_at: new Date().toISOString()
          });
      } else if (score < 60) {
        // Create warning alert
        await supabase
          .from('alerts')
          .insert({
            customer_id: user.id,
            alert_type: 'biosecurity_score_low',
            severity: 'warning',
            title: 'Biosecurity Score Below Target',
            message: `Biosecurity audit score is ${score}% - improvement needed`,
            metadata: {
              batch_id: batchId,
              score: score,
              audit_date: new Date().toISOString().split('T')[0]
            },
            is_read: false,
            created_at: new Date().toISOString()
          });
      }

      setSuccess(true);

      // Call success callback after delay
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 1500);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit biosecurity audit');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl border border-green-200 p-8 text-center"
      >
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} weight="fill" className="text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-neutral-900 mb-2">
          Biosecurity Audit Submitted
        </h3>
        <p className="text-neutral-600 mb-4">
          Audit score: {currentScore}% - {getScoreLabel(currentScore)}
        </p>
        <p className="text-sm text-neutral-500">
          बायोसिक्योरिटी ऑडिट सफल रहा
        </p>
      </motion.div>
    );
  }

  const answeredCount = Object.keys(responses).length;
  const progress = (answeredCount / biosecurityAuditItems.length) * 100;

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-neutral-900 mb-1">
            Biosecurity Audit
          </h3>
          <p className="text-sm text-neutral-500">
            बायोसिक्योरिटी ऑडिट · Fortnightly Check
          </p>
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X size={20} weight="regular" />
          </button>
        )}
      </div>

      {/* Batch Info */}
      <div className="bg-brand-green-50 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3">
          <Shield size={24} weight="regular" className="text-brand-green-600 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-neutral-900">{batchIdDisplay}</h4>
            <p className="text-sm text-neutral-600">
              12-item biosecurity checklist
            </p>
          </div>
        </div>
      </div>

      {/* Live Score Display */}
      <div className="bg-neutral-50 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm text-neutral-500 mb-1">Current Score</div>
            <div className={`text-4xl font-bold ${getScoreColor(currentScore)}`}>
              {currentScore}%
            </div>
          </div>
          <div className="text-right">
            <div className={`text-lg font-semibold ${getScoreColor(currentScore)}`}>
              {getScoreLabel(currentScore)}
            </div>
            <div className="text-xs text-neutral-500">
              {answeredCount}/{biosecurityAuditItems.length} items answered
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-neutral-200 rounded-full h-2">
          <motion.div
            className={`h-2 rounded-full transition-colors ${
              currentScore >= 80 ? 'bg-green-500' :
              currentScore >= 60 ? 'bg-amber-500' :
              currentScore >= 40 ? 'bg-orange-500' : 'bg-red-500'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg"
        >
          <p className="text-sm text-red-800">{error}</p>
        </motion.div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Audit Items */}
        {biosecurityAuditItems.map((item, index) => (
          <div key={item.id} className="bg-white rounded-lg border border-neutral-200 p-4 hover:border-neutral-300 transition-colors">
            <div className="flex items-start gap-3 mb-3">
              <div className="flex-shrink-0 w-8 h-8 bg-brand-green-100 rounded-full flex items-center justify-center text-brand-green-700 font-semibold text-sm">
                {index + 1}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-neutral-900 mb-1">{item.label}</h4>
                <p className="text-sm text-neutral-500">{item.labelHi}</p>
                <p className="text-xs text-neutral-400 mt-1">{item.description}</p>
              </div>
            </div>

            {/* Response Options */}
            <div className="grid grid-cols-3 gap-2 ml-11">
              {[
                { value: 'yes' as BiosecurityAuditResponse, label: 'Yes', labelHi: 'हाँ', color: 'bg-green-500' },
                { value: 'partial' as BiosecurityAuditResponse, label: 'Partial', labelHi: 'आंशिक', color: 'bg-amber-500' },
                { value: 'no' as BiosecurityAuditResponse, label: 'No', labelHi: 'नहीं', color: 'bg-red-500' }
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleResponseChange(item.id, option.value)}
                  className={`
                    relative px-3 py-2 rounded-lg border-2 font-medium text-sm transition-all
                    ${responses[item.id] === option.value
                      ? `${option.color} border-transparent text-white shadow-md`
                      : 'border-neutral-200 text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50'
                    }
                  `}
                >
                  <div className="flex flex-col items-center gap-0.5">
                    <span>{option.label}</span>
                    <span className="text-xs opacity-80">{option.labelHi}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Notes · नोट्स (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional observations or corrective actions..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-brand-green-500 focus:border-transparent bg-white resize-none text-sm"
            maxLength={300}
          />
          <p className="text-xs text-neutral-400 mt-1 text-right">
            {notes.length}/300
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 rounded-xl border border-neutral-300 text-neutral-700 font-medium hover:bg-neutral-50 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading || answeredCount < biosecurityAuditItems.length}
            className="flex-1 px-6 py-3 rounded-xl bg-brand-green-600 text-white font-medium hover:bg-brand-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle size={18} weight="bold" />
                Submit Audit
              </>
            )}
          </button>
        </div>

        {/* Submission Time Indicator */}
        <div className="flex items-center justify-center gap-2 text-xs text-neutral-500">
          <Clock size={14} weight="regular" />
          <span>Completable in under 3 minutes</span>
        </div>

        {/* Info Note */}
        <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
          <Info size={16} weight="regular" className="text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-800">
            Fortnightly audit: Complete this every 14 days to maintain biosecurity standards. 
            Scores below 60% trigger alerts for improvement.
          </p>
        </div>
      </form>
    </div>
  );
}
