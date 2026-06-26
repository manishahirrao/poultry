// FlockIQ — WhatsApp Demo Client Component
// File: apps/web/app/(marketing)/try-whatsapp/WhatsAppDemoClient.tsx
// Version: v1.0 | May 2026
// Task Reference: C-08
// Requirements: FR-WHATSAPP-DEMO-001

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Phone, ChatCircleDots } from '@phosphor-icons/react';

export default function WhatsAppDemoClient() {
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('gorakhpur');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [remainingFreeSignals, setRemainingFreeSignals] = useState(23);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-brand-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-lg"
        >
          <div className="bg-green100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green600" />
          </div>
          <h2 className="font-sora font-bold text-2xl text-neutral-900 mb-4">
            Demo Requested!
          </h2>
          <p className="text-neutral-700 mb-6">
            You'll receive a free WhatsApp price signal for {district} within 24 hours.
          </p>
          <a
            href="/signup"
            className="inline-flex items-center px-6 py-3 bg-brand-700 text-white font-semibold rounded-full hover:bg-brand-500 transition-all"
          >
            Start Full Trial
            <ArrowRight size={20} className="ml-2" />
          </a>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-section-vertical bg-brand-700 text-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <ChatCircleDots size={40} className="text-[#25D366]" weight="fill" />
              <p className="font-jakarta font-bold text-[11px] text-brand-100 tracking-[0.16em] uppercase">
                No Signup Required
              </p>
            </div>
            <h1 className="font-sora font-bold text-[clamp(2rem,3.5vw+0.75rem,3.5rem)] leading-[1.1] mb-4">
              1 Free WhatsApp Signal — No Credit Card Required
            </h1>
            <p className="font-jakarta text-[clamp(1rem,0.5vw+0.875rem,1.0625rem)] text-brand-100 max-w-3xl mx-auto mb-8">
              Get a free WhatsApp price signal for your district. {remainingFreeSignals} free signals remaining this month.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Demo Form */}
      <section className="py-section-vertical bg-white">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-brand-50 rounded-2xl p-8 shadow-lg"
          >
            <h2 className="font-sora font-bold text-2xl text-neutral-900 mb-2 text-center">
              Get Your Free Signal
            </h2>
            <p className="text-sm text-neutral-500 text-center mb-6">
              {remainingFreeSignals} free signals remaining this month
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  WhatsApp Number
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-4 bg-neutral-100 border border-r-0 border-neutral-200 rounded-l-lg text-neutral600">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="XXXXXXXXXX"
                    className="flex-1 px-4 py-3 border border-neutral-200 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    pattern="[0-9]{10}"
                    required
                  />
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  10-digit mobile number without leading zero
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  District
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                >
                  <option value="gorakhpur">Gorakhpur</option>
                  <option value="deoria">Deoria</option>
                  <option value="kushinagar">Kushinagar</option>
                  <option value="basti">Basti</option>
                  <option value="maharajganj">Maharajganj</option>
                </select>
              </div>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="consent"
                  required
                  className="mt-1 w-4 h-4 text-brand-700 border-neutral300 rounded focus:ring-brand-500"
                />
                <label htmlFor="consent" className="text-sm text-neutral-700">
                  I agree to receive WhatsApp messages from FlockIQ. My data will be used only for price alerts as per DPDP Act 2023.
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-brand-700 text-white font-semibold rounded-full hover:bg-brand-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ChatCircleDots size={20} />
                    Send Free Signal
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                      {remainingFreeSignals} left
                    </span>
                  </>
                )}
              </button>
            </form>

            <p className="text-xs text-neutral-500 text-center mt-6">
              One free signal per phone number. No spam, ever. Only {remainingFreeSignals} free signals left this month.
            </p>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-section-vertical bg-neutral-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="font-sora font-bold text-[clamp(1.75rem,2.5vw+0.5rem,2.75rem)] text-neutral-900 mb-4">
              How It Works
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Submit Your Number',
                desc: 'Enter your WhatsApp number and district above',
              },
              {
                step: '2',
                title: 'Receive Your Signal',
                desc: 'Get a free price signal on WhatsApp within 24 hours',
              },
              {
                step: '3',
                title: 'Experience the Value',
                desc: 'See how accurate predictions help you sell at the right time',
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="bg-brand-700 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 font-bold text-xl">
                  {item.step}
                </div>
                <h3 className="font-semibold text-neutral-900 mb-2">{item.title}</h3>
                <p className="text-sm text-neutral-700">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-section-vertical bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-sora font-bold text-[clamp(1.75rem,2.5vw+0.5rem,2.75rem)] text-neutral-900 mb-4">
              Like What You See?
            </h2>
            <p className="font-jakarta text-[clamp(1rem,0.5vw+0.875rem,1.0625rem)] text-neutral-700 mb-8">
              Start your 14-day free trial and get daily signals. Without it, you'll lose ₹50,000+ per batch to bad timing.
            </p>
            <a
              href="/signup"
              className="inline-flex items-center px-8 py-4 bg-brand-700 text-white font-semibold rounded-full hover:bg-brand-500 transition-all relative"
            >
              <ChatCircleDots size={20} className="mr-2" weight="fill" />
              Start 14-Day Free Trial
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                47 spots left
              </span>
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
