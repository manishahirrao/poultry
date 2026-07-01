'use client';

import { useState, useEffect } from 'react';
import { X, CheckCircle, Circle } from '@phosphor-icons/react';
import { useLanguage } from '@/providers/LanguageProvider';

interface OnboardingProgress {
  step_1_farm_added: boolean;
  step_2_whatsapp_setup: boolean;
  step_3_gc_costs_entered: boolean;
  step_4_employees_added: boolean;
  step_5_price_alerts_configured: boolean;
  dismissed: boolean;
}

interface OnboardingChecklistProps {
  customerId: string;
}

const steps = [
  { id: 'step_1_farm_added', label: 'Add your first farm', labelHi: 'अपना पहला फार्म जोड़ें', href: '/dashboard/farms/new' },
  { id: 'step_2_whatsapp_setup', label: 'Set up WhatsApp daily log', labelHi: 'व्हाट्सएप दैनिक लॉग सेट करें', href: '/dashboard/farms' },
  { id: 'step_3_gc_costs_entered', label: 'Enter GC costs (DOC cost, feed costs)', labelHi: 'जीसी लागत दर्ज करें (DOC लागत, फीड लागत)', href: '/dashboard/farms' },
  { id: 'step_4_employees_added', label: 'Add your employees', labelHi: 'अपने कर्मचारी जोड़ें', href: '/dashboard/employees' },
  { id: 'step_5_price_alerts_configured', label: 'Configure price alerts', labelHi: 'मूल्य अलर्ट कॉन्फ़िगर करें', href: '/dashboard/alerts' },
];

export function OnboardingChecklist({ customerId }: OnboardingChecklistProps) {
  const { language } = useLanguage();
  const [progress, setProgress] = useState<OnboardingProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetchProgress();
  }, [customerId]);

  const fetchProgress = async () => {
    try {
      const response = await fetch(`/api/onboarding/progress`);
      if (response.ok) {
        const data = await response.json();
        setProgress(data.progress);
        setDismissed(data.progress?.dismissed || false);
      }
    } catch (error) {
      console.error('Error fetching onboarding progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = async () => {
    try {
      await fetch('/api/onboarding/progress', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dismissed: true }),
      });
      setDismissed(true);
    } catch (error) {
      console.error('Error dismissing onboarding:', error);
    }
  };

  const completedSteps = progress ? steps.filter(s => progress[s.id as keyof OnboardingProgress] === true).length : 0;
  const totalSteps = steps.length;
  const isComplete = completedSteps === totalSteps;

  if (loading || dismissed || isComplete || !progress) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-[#1A5C34] to-[#2D7A4E] rounded-xl p-6 text-white mb-6 relative">
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
        title="Skip onboarding"
      >
        <X size={20} />
      </button>

      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-1">{language === 'hi' ? 'FlockIQ में आपका स्वागत है! 🎉' : 'Welcome to FlockIQ! 🎉'}</h3>
        <p className="text-sm text-white/90">{language === 'hi' ? 'आरंभ करने के लिए ये 5 चरण पूरे करें:' : 'Complete these 5 steps to get started:'}</p>
      </div>

      <div className="space-y-3">
        {steps.map((step) => {
          const isCompleted = progress[step.id as keyof OnboardingProgress] as boolean;
          return (
            <a
              key={step.id}
              href={step.href}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                isCompleted
                  ? 'bg-white/20 cursor-default'
                  : 'bg-white/10 hover:bg-white/20'
              }`}
              onClick={(e) => {
                if (isCompleted) e.preventDefault();
              }}
            >
              {isCompleted ? (
                <CheckCircle size={20} className="text-green-300 flex-shrink-0" />
              ) : (
                <Circle size={20} className="text-white/50 flex-shrink-0" />
              )}
              <span className={`text-sm ${isCompleted ? 'line-through text-white/70' : ''}`}>
                {language === 'hi' ? step.labelHi : step.label}
              </span>
              {isCompleted && <span className="ml-auto text-xs text-green-300">✓</span>}
            </a>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-white/20">
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/90">{language === 'hi' ? 'प्रगति:' : 'Progress:'} {completedSteps}/{totalSteps} {language === 'hi' ? 'चरण' : 'steps'}</span>
          <div className="w-32 bg-white/20 rounded-full h-2">
            <div
              className="bg-white rounded-full h-2 transition-all"
              style={{ width: `${(completedSteps / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
