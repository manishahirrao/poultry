'use client';

import { useState } from 'react';
import { Download, Trash, Warning, Check } from '@phosphor-icons/react';

interface DataPrivacyTabProps {
  customer: any;
}

export function DataPrivacyTab({ customer }: DataPrivacyTabProps) {
  const [deleteStep, setDeleteStep] = useState<0 | 1 | 2>(0);
  const [deleting, setDeleting] = useState(false);
  const [otp, setOtp] = useState('');
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await fetch('/api/account/data-download', { method: 'POST' });
      // Trigger file download
    } catch (error) {
      console.error('Error downloading data:', error);
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = async () => {
    if (deleteStep === 0) {
      setDeleteStep(1);
    } else if (deleteStep === 1) {
      setDeleteStep(2);
    } else {
      setDeleting(true);
      try {
        await fetch('/api/account/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ confirm_text: 'DELETE', otp }),
        });
        // Redirect to login after successful deletion
        window.location.href = '/login';
      } catch (error) {
        console.error('Error deleting account:', error);
      } finally {
        setDeleting(false);
      }
    }
  };

  const cancelDelete = () => {
    setDeleteStep(0);
    setOtp('');
  };

  return (
    <div className="space-y-6">
      {/* Data Download */}
      <div className="bg-white rounded-2xl border border-neutral-100 p-6">
        <h3 className="text-base font-semibold text-neutral-900 mb-4">Download Your Data</h3>

        <p className="text-sm text-neutral-600 mb-4">
          Download a copy of all your personal data, including profile information, subscription history, and usage data.
        </p>

        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center gap-2 px-4 py-2 bg-brandGreen700 text-white rounded-lg text-sm font-semibold hover:bg-brandGreen800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {downloading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Preparing Download...
            </>
          ) : (
            <>
              <Download size={16} />
              Download Data (ZIP)
            </>
          )}
        </button>
      </div>

      {/* Account Deletion */}
      <div className="bg-white rounded-2xl border border-neutral-100 p-6">
        <h3 className="text-base font-semibold text-neutral-900 mb-4">Delete Account</h3>

        <p className="text-sm text-neutral-600 mb-4">
          Permanently delete your account and all associated data. This action is irreversible and will:
        </p>

        <ul className="text-sm text-neutral-600 mb-4 space-y-2 ml-4 list-disc">
          <li>Delete your profile and personal information</li>
          <li>Delete all subscription and billing data</li>
          <li>Delete all usage history and preferences</li>
          <li>Revoke access to all features</li>
        </ul>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
          <div className="flex items-start gap-3">
            <Warning size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800 mb-1">
                30-Day Grace Period
              </p>
              <p className="text-xs text-amber-700">
                Your data will be retained for 30 days before permanent deletion, in case you change your mind.
              </p>
            </div>
          </div>
        </div>

        {deleteStep === 0 && (
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
          >
            <Trash size={16} />
            Delete Account
          </button>
        )}

        {deleteStep === 1 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Warning size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-800 mb-2">
                  Are you sure you want to delete your account?
                </p>
                <p className="text-xs text-red-700 mb-3">
                  This action cannot be undone. Your data will be permanently deleted after a 30-day grace period.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleDelete}
                    className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors"
                  >
                    Yes, Delete Account
                  </button>
                  <button
                    onClick={cancelDelete}
                    className="px-3 py-1.5 border border-red-300 text-red-800 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {deleteStep === 2 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Warning size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-800 mb-2">
                  Final confirmation required
                </p>
                <p className="text-xs text-red-700 mb-2">
                  Type "DELETE" and enter the OTP sent to your phone to confirm account deletion.
                </p>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="DELETE"
                    className="flex-1 px-3 py-1.5 border border-red-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleDelete}
                    disabled={deleting || otp !== 'DELETE'}
                    className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {deleting ? 'Deleting...' : 'Confirm Deletion'}
                  </button>
                  <button
                    onClick={cancelDelete}
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

      {/* Privacy Policy */}
      <div className="bg-white rounded-2xl border border-neutral-100 p-6">
        <h3 className="text-base font-semibold text-neutral-900 mb-4">Privacy Policy</h3>

        <div className="text-sm text-neutral-600 space-y-3">
          <p>
            We collect and process your personal data in accordance with the Digital Personal Data Protection Act (DPDP) 2023.
          </p>
          <p>
            Your data is used to provide price predictions, alerts, and other services. We do not sell your data to third parties.
          </p>
          <p>
            You have the right to access, correct, or delete your personal data at any time through this settings page.
          </p>
          <a
            href="/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-brandGreen700 hover:text-brandGreen800 font-semibold"
          >
            Read full Privacy Policy →
          </a>
        </div>
      </div>
    </div>
  );
}
