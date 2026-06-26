'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { WhatsappLogo, Clock, CheckCircle, Warning, ChatCircleText, Trash } from '@phosphor-icons/react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface WhatsAppTabProps {
  farmId: string;
  batchId?: string;
}

interface WhatsAppConfig {
  whatsapp_number: string | null;
  whatsapp_reminders_enabled: boolean;
  whatsapp_reminders_paused: boolean;
  whatsapp_reminder_hour: number;
  whatsapp_language: string;
  whatsapp_connected_at: string | null;
}

interface LogSubmission {
  id: string;
  date: string;
  birds_dead: number;
  feed_kg: number;
  source: 'manual' | 'whatsapp';
  status: 'synced' | 'needs_review';
  created_at: string;
}

interface WhatsAppMessage {
  id: string;
  direction: 'sent' | 'received';
  message: string;
  created_at: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function WhatsAppTab({ farmId, batchId }: WhatsAppTabProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [reminderHour, setReminderHour] = useState(18);
  const [language, setLanguage] = useState('hindi');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testSent, setTestSent] = useState(false);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);

  // Fetch WhatsApp configuration
  const { data: whatsappConfig, isLoading: configLoading, mutate: mutateConfig } = useSWR<WhatsAppConfig>(
    `/api/farms/${farmId}/whatsapp/config`,
    fetcher
  );

  // Fetch recent submissions with 5-minute revalidation interval
  const { data: submissions, isLoading: submissionsLoading } = useSWR<LogSubmission[]>(
    `/api/farms/${farmId}/logs?source=all&limit=20`,
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  // Fetch conversation history
  const { data: messages, isLoading: messagesLoading } = useSWR<WhatsAppMessage[]>(
    `/api/farms/${farmId}/whatsapp/messages?limit=5`,
    fetcher
  );

  const isConnected = whatsappConfig?.whatsapp_number && whatsappConfig?.whatsapp_connected_at;
  const maskedPhone = isConnected && whatsappConfig?.whatsapp_number
    ? whatsappConfig.whatsapp_number.replace(/(\+91)(\d{5})(\d{5})/, '$1-$2-$3')
    : null;

  const handleSendTestMessage = async () => {
    setIsSendingTest(true);
    try {
      const response = await fetch(`/api/farms/${farmId}/whatsapp/setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 'test',
          phone: phoneNumber,
          reminder_hour: reminderHour,
          language,
        }),
      });

      if (response.ok) {
        setTestSent(true);
      }
    } catch (error) {
      console.error('Failed to send test message:', error);
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleConfirmConnection = async () => {
    try {
      const response = await fetch(`/api/farms/${farmId}/whatsapp/setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 'confirm',
          phone: phoneNumber,
          reminder_hour: reminderHour,
          language,
        }),
      });

      if (response.ok) {
        mutateConfig();
        setCurrentStep(0);
      }
    } catch (error) {
      console.error('Failed to confirm connection:', error);
    }
  };

  const handleDisconnect = async () => {
    try {
      const response = await fetch(`/api/farms/${farmId}/whatsapp/disconnect`, {
        method: 'POST',
      });

      if (response.ok) {
        mutateConfig();
        setShowDisconnectConfirm(false);
      }
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  };

  const handleUpdateTime = async (newHour: number) => {
    try {
      const response = await fetch(`/api/farms/${farmId}/whatsapp/config`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reminder_hour: newHour }),
      });

      if (response.ok) {
        mutateConfig();
        setShowTimeModal(false);
      }
    } catch (error) {
      console.error('Failed to update time:', error);
    }
  };

  const handleTestReminder = async () => {
    try {
      await fetch(`/api/farms/${farmId}/whatsapp/test-reminder`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Failed to send test reminder:', error);
    }
  };

  // SETUP WIZARD STEPS
  const setupSteps = [
    {
      title: 'Phone Number',
      content: (
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Farmer's WhatsApp Number
          </label>
          <div className="flex">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
              +91
            </span>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="9876543210"
              className="flex-1 min-w-0 block w-full px-3 py-2 rounded-r-md border border-gray-300 focus:ring-[#1A5C34] focus:border-[#1A5C34] sm:text-sm"
            />
          </div>
          <p className="text-xs text-gray-500">
            Enter the 10-digit mobile number linked to WhatsApp
          </p>
        </div>
      ),
    },
    {
      title: 'Reminder Time',
      content: (
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Daily Reminder Time
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[17, 18, 19, 20].map((hour) => (
              <button
                key={hour}
                onClick={() => setReminderHour(hour)}
                className={`py-2 px-4 rounded-md border text-sm font-medium transition-colors ${
                  reminderHour === hour
                    ? 'bg-[#1A5C34] text-white border-[#1A5C34]'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {hour === 17 ? '5 PM' : hour === 18 ? '6 PM' : hour === 19 ? '7 PM' : '8 PM'}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500">
            Choose when to send the daily log reminder
          </p>
        </div>
      ),
    },
    {
      title: 'Language',
      content: (
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Message Language
          </label>
          <div className="grid grid-cols-2 gap-2">
            {['hindi', 'english'].map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`py-2 px-4 rounded-md border text-sm font-medium transition-colors ${
                  language === lang
                    ? 'bg-[#1A5C34] text-white border-[#1A5C34]'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {lang === 'hindi' ? 'हिंदी' : 'English'}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500">
            Language for WhatsApp messages
          </p>
        </div>
      ),
    },
    {
      title: 'Test & Confirm',
      content: (
        <div className="space-y-4">
          {!testSent ? (
            <>
              <p className="text-sm text-gray-600">
                We'll send a test message to verify the connection.
              </p>
              <button
                onClick={handleSendTestMessage}
                disabled={isSendingTest || !phoneNumber}
                className="w-full px-4 py-2 bg-[#1A5C34] text-white rounded-md text-sm font-medium hover:bg-[#1F7040] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSendingTest ? 'Sending...' : 'Send Test Message 📤'}
              </button>
            </>
          ) : (
            <div className="space-y-4">
              <div className="bg-[#DCFCE7] border border-[#16A34A] rounded-lg p-4">
                <div className="flex items-center gap-2 text-[#16A34A]">
                  <CheckCircle size={20} weight="fill" />
                  <span className="font-semibold">Test sent! Check your WhatsApp</span>
                </div>
              </div>
              <Button onClick={handleConfirmConnection} className="w-full">
                Confirm Connection ✓
              </Button>
            </div>
          )}
        </div>
      ),
    },
  ];

  if (configLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1A5C34]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!isConnected ? (
        /* SETUP WIZARD */
        <Card className="p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <WhatsappLogo size={24} className="text-[#25D366]" weight="fill" />
              WhatsApp Daily Log Setup
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Set up automated daily log reminders via WhatsApp
            </p>
          </div>

          {/* Stepper */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {setupSteps.map((step, index) => (
                <div key={index} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        index <= currentStep
                          ? 'bg-[#1A5C34] text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {index < currentStep ? '✓' : index + 1}
                    </div>
                    <span className="text-xs mt-2 text-gray-600">{step.title}</span>
                  </div>
                  {index < setupSteps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 ${
                        index < currentStep ? 'bg-[#1A5C34]' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="mb-6">{setupSteps[currentStep].content}</div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back
            </button>
            <button
              onClick={() => setCurrentStep(Math.min(setupSteps.length - 1, currentStep + 1))}
              disabled={
                currentStep === setupSteps.length - 1 ||
                (currentStep === 0 && !phoneNumber) ||
                (currentStep === 3 && isSendingTest)
              }
              className="px-4 py-2 bg-[#1A5C34] text-white rounded-md text-sm font-medium hover:bg-[#1F7040] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentStep === setupSteps.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </Card>
      ) : (
        /* CONNECTED STATE */
        <>
          {/* Status Card */}
          <Card className="p-5 border border-[#E3EDE7]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#ECF8F1] flex items-center justify-center">
                  <WhatsappLogo size={20} className="text-[#25D366]" weight="fill" />
                </div>
                <div>
                  <p className="font-semibold">WhatsApp Daily Log Automation</p>
                  <p className="text-sm text-[#25D366]">● Connected — {maskedPhone}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowTimeModal(true)}
                  className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Clock size={16} />
                  Change Time
                </button>
                <button
                  onClick={handleTestReminder}
                  className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Test Reminder 📤
                </button>
                <button
                  onClick={() => setShowDisconnectConfirm(true)}
                  className="flex items-center gap-1 px-3 py-1.5 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50"
                >
                  <Trash size={16} />
                  Disconnect
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-3">
              Daily reminder at {reminderHour === 17 ? '5 PM' : reminderHour === 18 ? '6 PM' : reminderHour === 19 ? '7 PM' : '8 PM'} · Language: {language === 'hindi' ? 'हिंदी' : 'English'} · Active since {whatsappConfig?.whatsapp_connected_at ? new Date(whatsappConfig.whatsapp_connected_at).toLocaleDateString() : 'N/A'}
            </p>
          </Card>

          {/* How It Works */}
          <Card className="p-5 bg-[#EDF7F1] border-[#3DAE72]">
            <h3 className="font-semibold text-[#1A5C34] mb-3">How It Works</h3>
            <ol className="space-y-2 text-sm text-gray-700">
              <li className="flex gap-2">
                <span className="font-semibold text-[#1A5C34]">1.</span>
                FlockIQ sends you a WhatsApp message at your configured time every day
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-[#1A5C34]">2.</span>
                The message asks for today's data (birds dead, feed kg, weight)
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-[#1A5C34]">3.</span>
                You reply with the numbers — even just "5 bird dead 1200 kg feed"
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-[#1A5C34]">4.</span>
                FlockIQ automatically fills your daily log — no app needed!
              </li>
            </ol>
          </Card>

          {/* Recent Submissions */}
          <Card className="p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Recent Log Submissions</h3>
            {submissionsLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1A5C34]"></div>
              </div>
            ) : submissions && submissions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Source
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Birds Dead
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Feed kg
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {submissions.map((submission) => (
                      <tr key={submission.id}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {new Date(submission.date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {submission.source === 'whatsapp' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#DCFCE7] text-[#16A34A]">
                              📱 WhatsApp
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              ✏ Manual
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {submission.birds_dead}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {submission.feed_kg}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {submission.source === 'whatsapp' && submission.status === 'synced' ? (
                            <span className="inline-flex items-center text-xs text-[#16A34A]">
                              <CheckCircle size={14} className="mr-1" />
                              ✓ Log via WhatsApp
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-xs text-[#D97706]">
                              <Warning size={14} className="mr-1" />
                              ⚠ Pending
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">No submissions yet</p>
            )}
          </Card>

          {/* Conversation Preview */}
          <Card className="p-5">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ChatCircleText size={20} />
              Conversation Preview
            </h3>
            {messagesLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1A5C34]"></div>
              </div>
            ) : messages && messages.length > 0 ? (
              <div className="space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.direction === 'sent' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                        msg.direction === 'sent'
                          ? 'bg-[#DCF8C6] rounded-tl-xl'
                          : 'bg-white rounded-tr-xl border border-gray-200'
                      }`}
                    >
                      <p className="text-sm text-gray-900">{msg.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(msg.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">No messages yet</p>
            )}
          </Card>
        </>
      )}

      {/* Disconnect Confirmation Modal */}
      {showDisconnectConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Disconnect WhatsApp?</h3>
            <p className="text-sm text-gray-600 mb-4">
              This will stop daily log reminders for this farm. You can set it up again anytime.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDisconnectConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDisconnect}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
              >
                Disconnect
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Time Selection Modal */}
      {showTimeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Reminder Time</h3>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[17, 18, 19, 20].map((hour) => (
                <button
                  key={hour}
                  onClick={() => handleUpdateTime(hour)}
                  className={`py-2 px-4 rounded-md border text-sm font-medium transition-colors ${
                    reminderHour === hour
                      ? 'bg-[#1A5C34] text-white border-[#1A5C34]'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {hour === 17 ? '5 PM' : hour === 18 ? '6 PM' : hour === 19 ? '7 PM' : '8 PM'}
                </button>
              ))}
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowTimeModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
