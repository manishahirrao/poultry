'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { WhatsappLogo, CheckCircle, Star, ArrowRight, X } from '@phosphor-icons/react';
import { trackDemoRequested } from '@/lib/posthog-analytics';

interface DemoFormData {
  name: string;
  company: string;
  phone: string;
  segment: string;
  flockSize: string;
  message: string;
  language: string;
}

export default function DemoPageClient() {
  const [formData, setFormData] = useState<DemoFormData>({
    name: '',
    company: '',
    phone: '',
    segment: '',
    flockSize: '',
    message: '',
    language: 'en',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const segmentOptions = [
    { value: 'commercial_farm', label: 'Commercial Farm (10K-50K birds)', labelHi: 'वाणिज्यिक फार्म (10K-50K पक्षी)' },
    { value: 'integrator', label: 'Integrator (50K+ birds)', labelHi: 'इंटीग्रेटर (50K+ पक्षी)' },
    { value: 'feed_company', label: 'Feed Company', labelHi: 'फीड कंपनी' },
    { value: 'enterprise', label: 'Enterprise & QSR', labelHi: 'एंटरप्राइज और QSR' },
    { value: 'other', label: 'Other', labelHi: 'अन्य' },
  ];

  const flockSizeOptions = [
    { value: '10k-25k', label: '10K-25K birds', labelHi: '10K-25K पक्षी' },
    { value: '25k-50k', label: '25K-50K birds', labelHi: '25K-50K पक्षी' },
    { value: '50k-1l', label: '50K-1L birds', labelHi: '50K-1L पक्षी' },
    { value: '1l+', label: '1L+ birds', labelHi: '1L+ पक्षी' },
    { value: 'multi-farm', label: 'Multi-farm (Integrator)', labelHi: 'मल्टी-फार्म (इंटीग्रेटर)' },
  ];

  const validatePhone = (phone: string): boolean => {
    return /^[6-9]\d{9}$/.test(phone);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    // Client-side validation
    const newFieldErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newFieldErrors.name = formData.language === 'hi' ? 'नाम आवश्यक है' : 'Name is required';
    }

    if (!formData.company.trim()) {
      newFieldErrors.company = formData.language === 'hi' ? 'कंपनी/फार्म का नाम आवश्यक है' : 'Company/Farm name is required';
    }

    if (!formData.phone) {
      newFieldErrors.phone = formData.language === 'hi' ? 'फोन नंबर आवश्यक है' : 'Phone number is required';
    } else if (!validatePhone(formData.phone)) {
      newFieldErrors.phone = formData.language === 'hi' ? 'कृपया सही 10-अंकीय मोबाइल नंबर दर्ज करें' : 'Please enter a valid 10-digit mobile number';
    }

    if (!formData.segment) {
      newFieldErrors.segment = formData.language === 'hi' ? 'सेगमेंट चुनें' : 'Please select a segment';
    }

    if (!formData.flockSize) {
      newFieldErrors.flockSize = formData.language === 'hi' ? 'झुंड का आकार चुनें' : 'Please select flock size';
    }

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/public/demo-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Submission failed');
      }

      // Track PostHog event
      trackDemoRequested(
        formData.segment,
        formData.flockSize,
        formData.language
      );

      // Redirect to thank-you page
      window.location.href = '/demo/thank-you';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const whatsappNumber = '919876543210'; // Replace with actual number
  const whatsappMessage = encodeURIComponent(
    formData.language === 'hi'
      ? 'नमस्ते, मैं FlockIQ के बारे में जानना चाहता हूं।'
      : 'Hello, I would like to know more about FlockIQ.'
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-brandGreen-50 to-white">
      {/* Hero Section */}
      <div className="bg-brandGreen-700 text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-space-grotesk mb-4">
              {formData.language === 'hi' ? 'डेमो बुक करें' : 'Request a Demo'}
            </h1>
            <p className="text-xl text-brandGreen-100 mb-2">
              {formData.language === 'hi'
                ? 'हमारी टीम 2 घंटे में WhatsApp पर संपर्क करेगी'
                : 'Our team will contact you on WhatsApp within 2 hours'}
            </p>
            <p className="text-base text-brandGreen-200">
              95%+ सटीकता • 7-दिन भविष्यवाणी • गोरखपुर बेल्ट
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left: Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-neutral-900 mb-6 font-space-grotesk">
                {formData.language === 'hi' ? 'अपनी जानकारी भरें' : 'Fill in your details'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Language Toggle */}
                <div className="flex gap-2 mb-6">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, language: 'en' })}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                      formData.language === 'en'
                        ? 'bg-brandGreen-700 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, language: 'hi' })}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                      formData.language === 'hi'
                        ? 'bg-brandGreen-700 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    हिंदी
                  </button>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    {formData.language === 'hi' ? 'नाम *' : 'Name *'}
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brandGreen-500 focus:border-transparent outline-none transition-all ${
                      fieldErrors.name ? 'border-red-500' : 'border-neutral-300'
                    }`}
                    placeholder={formData.language === 'hi' ? 'आपका नाम' : 'Your name'}
                  />
                  {fieldErrors.name && (
                    <p className="text-red-600 text-sm mt-1">{fieldErrors.name}</p>
                  )}
                </div>

                {/* Company/Farm Name */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    {formData.language === 'hi' ? 'कंपनी/फार्म का नाम *' : 'Company/Farm Name *'}
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brandGreen-500 focus:border-transparent outline-none transition-all ${
                      fieldErrors.company ? 'border-red-500' : 'border-neutral-300'
                    }`}
                    placeholder={formData.language === 'hi' ? 'आपकी कंपनी/फार्म का नाम' : 'Your company/farm name'}
                  />
                  {fieldErrors.company && (
                    <p className="text-red-600 text-sm mt-1">{fieldErrors.company}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    {formData.language === 'hi' ? 'WhatsApp नंबर *' : 'WhatsApp Number *'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                      maxLength={10}
                      className={`w-full pl-16 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-brandGreen-500 focus:border-transparent outline-none transition-all ${
                        fieldErrors.phone ? 'border-red-500' : 'border-neutral-300'
                      }`}
                      placeholder="9876543210"
                    />
                  </div>
                  {fieldErrors.phone && (
                    <p className="text-red-600 text-sm mt-1">{fieldErrors.phone}</p>
                  )}
                </div>

                {/* Segment */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    {formData.language === 'hi' ? 'सेगमेंट *' : 'Segment *'}
                  </label>
                  <select
                    value={formData.segment}
                    onChange={(e) => setFormData({ ...formData, segment: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brandGreen-500 focus:border-transparent outline-none transition-all bg-white ${
                      fieldErrors.segment ? 'border-red-500' : 'border-neutral-300'
                    }`}
                  >
                    <option value="">
                      {formData.language === 'hi' ? 'सेगमेंट चुनें' : 'Select segment'}
                    </option>
                    {segmentOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {formData.language === 'hi' ? option.labelHi : option.label}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.segment && (
                    <p className="text-red-600 text-sm mt-1">{fieldErrors.segment}</p>
                  )}
                </div>

                {/* Flock Size */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    {formData.language === 'hi' ? 'झुंड का आकार / फार्म *' : 'Flock Size / Farms *'}
                  </label>
                  <select
                    value={formData.flockSize}
                    onChange={(e) => setFormData({ ...formData, flockSize: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brandGreen-500 focus:border-transparent outline-none transition-all bg-white ${
                      fieldErrors.flockSize ? 'border-red-500' : 'border-neutral-300'
                    }`}
                  >
                    <option value="">
                      {formData.language === 'hi' ? 'झुंड का आकार चुनें' : 'Select flock size'}
                    </option>
                    {flockSizeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {formData.language === 'hi' ? option.labelHi : option.label}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.flockSize && (
                    <p className="text-red-600 text-sm mt-1">{fieldErrors.flockSize}</p>
                  )}
                </div>

                {/* Message (Optional) */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    {formData.language === 'hi' ? 'संदेश (वैकल्पिक)' : 'Message (Optional)'}
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={3}
                    maxLength={500}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brandGreen-500 focus:border-transparent outline-none transition-all resize-none"
                    placeholder={formData.language === 'hi' ? 'कोई विशेष प्रश्न?' : 'Any specific questions?'}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.message.length}/500
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-brandGreen-700 hover:bg-brandGreen-800 text-white font-semibold py-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    formData.language === 'hi' ? 'जमा हो रहा है...' : 'Submitting...'
                  ) : (
                    <>
                      {formData.language === 'hi' ? 'डेमो अनुरोध भेजें' : 'Submit Demo Request'}
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>

                {/* WhatsApp Direct */}
                <div className="text-center pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-3">
                    {formData.language === 'hi' ? 'या सीधे WhatsApp करें:' : 'Or WhatsApp us directly:'}
                  </p>
                  <a
                    href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-full font-semibold hover:bg-green-600 transition-colors"
                  >
                    <WhatsappLogo size={20} />
                    {formData.language === 'hi' ? 'WhatsApp पर संपर्क करें' : 'Contact on WhatsApp'}
                  </a>
                </div>
              </form>
            </div>
          </motion.div>

          {/* Right: Social Proof */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Social Proof Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="text-brandGreen-700" size={32} weight="fill" />
                <h3 className="text-2xl font-bold text-neutral-900 font-space-grotesk">
                  {formData.language === 'hi' ? '150+ फार्म्स भरोसा करते हैं' : '150+ Farms Trust Us'}
                </h3>
              </div>
              <p className="text-gray-600 mb-4">
                {formData.language === 'hi'
                  ? 'गोरखपुर बेल्ट में FlockIQ का उपयोग कर रहे हैं'
                  : 'Using FlockIQ in the Gorakhpur belt'}
              </p>
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="text-yellow-400" size={24} weight="fill" />
                ))}
                <span className="ml-2 text-gray-700 font-semibold">4.9/5</span>
              </div>
              <p className="text-sm text-gray-500">
                {formData.language === 'hi'
                  ? 'औसत रेटिंग • 150+ समीक्षाएं'
                  : 'Average rating • 150+ reviews'}
              </p>
            </div>

            {/* Benefits */}
            <div className="bg-brandGreen-50 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-neutral-900 mb-4 font-space-grotesk">
                {formData.language === 'hi' ? 'डेमो में क्या मिलेगा:' : 'What you will see in the demo:'}
              </h3>
              <ul className="space-y-3">
                {[
                  formData.language === 'hi'
                    ? '7-दिन की सटीक भविष्यवाणी'
                    : '7-day accurate price forecast',
                  formData.language === 'hi'
                    ? 'SELL NOW / HOLD सिग्नल'
                    : 'SELL NOW / HOLD signals',
                  formData.language === 'hi'
                    ? 'आपके फार्म के लिए व्यक्तिगत अलर्ट'
                    : 'Personalized alerts for your farm',
                  formData.language === 'hi'
                    ? 'ROI कैलकुलेटर'
                    : 'ROI calculator',
                  formData.language === 'hi'
                    ? 'WhatsApp इंटीग्रेशन'
                    : 'WhatsApp integration',
                ].map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="text-brandGreen-700 mt-0.5" size={20} weight="fill" />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Testimonial */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="text-yellow-400" size={20} weight="fill" />
                ))}
              </div>
              <p className="text-gray-700 italic mb-4">
                {formData.language === 'hi'
                  ? '"पहले बिचौलिया जो भाव बोलता था, वो मान लेता था। अब FlockIQ देखकर ₹4/kg ज़्यादा माँगते हैं।"'
                  : '"Before, we accepted whatever price the trader offered. Now with FlockIQ, we demand ₹4/kg more."'}
              </p>
              <p className="text-sm text-gray-600 font-semibold">
                — R.Y., Gorakhpur (25,000 bird farm)
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
