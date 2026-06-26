'use client';

import Link from 'next/link';
import { useState } from 'react';
import useSWR, { mutate } from 'swr';

interface AlertEmptyStateProps {
  district: string;
}

export function AlertEmptyState({ district }: AlertEmptyStateProps) {
  const [sendingTest, setSendingTest] = useState(false);

  const sendTestAlert = async () => {
    setSendingTest(true);
    try {
      const response = await fetch('/api/alerts/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to send test alert');
      }

      // Revalidate alerts data to show the test alert
      mutate('/api/alerts');
      setSendingTest(false);
    } catch (error) {
      console.error('Error sending test alert:', error);
      setSendingTest(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {/* SVG Illustration — green checkmark shield */}
      <div className="w-24 h-24 mb-6 text-[#3DAE72]">
        <svg viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="48" cy="48" r="44" fill="#EDF7F1" stroke="#3DAE72" strokeWidth="2"/>
          <path d="M28 48L42 62L68 36" stroke="#1A5C34" strokeWidth="4"
                strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      <h2 className="text-xl font-semibold text-gray-900 mb-2" style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>
        आपके क्षेत्र में कोई सक्रिय अलर्ट नहीं है
      </h2>
      <p className="text-gray-500 text-sm max-w-md mb-1">
        No active alerts in your area
      </p>
      <p className="text-gray-400 text-xs max-w-sm mb-8">
        FlockIQ HPAI, weather, and price movements in Gorakhpur, Deoria,
        Kushinagar, Basti, Maharajganj, Sant Kabir Nagar
      </p>

      <div className="flex gap-3">
        <button
          onClick={sendTestAlert}
          disabled={sendingTest}
          className="px-4 py-2 border border-[#E3EDE7] rounded-lg text-sm
                     text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sendingTest ? 'Sending...' : 'Send Test Alert →'}
        </button>
        <Link href="/dashboard/alerts?tab=settings"
              className="px-4 py-2 text-sm text-[#1A5C34] hover:underline">
          Configure Alert Radius →
        </Link>
      </div>
    </div>
  );
}
