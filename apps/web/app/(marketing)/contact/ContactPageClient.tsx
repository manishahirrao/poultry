'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Envelope, MapPin, WhatsappLogo, Phone, ChatCircleDots } from '@phosphor-icons/react';

export default function ContactPageClient() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    inquiryType: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brandGreen-50 to-white">
      {/* Hero Section */}
      <div className="bg-brandGreen-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl sm:text-5xl font-bold font-space-grotesk mb-4">
              संपर्क करें
            </h1>
            <p className="text-xl text-brandGreen-100 mb-2">
              हम आपकी मदद के लिए यहाँ हैं
            </p>
            <p className="text-base text-brandGreen-200">
              95%+ सटीकता • 7-दिन भविष्यवाणी • गोरखपुर बेल्ट
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-neutral-900 mb-6 font-space-grotesk">
              हमसे जुड़ें
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-brandGreen-100 p-3 rounded-full">
                  <MapPin className="text-brandGreen-700" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-1">पता</h3>
                  <p className="text-neutral-600">
                    गोरखपुर, उत्तर प्रदेश, भारत
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-brandGreen-100 p-3 rounded-full">
                  <Phone className="text-brandGreen-700" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-1">फोन</h3>
                  <p className="text-neutral-600 mb-2">
                    +91-XXXXXXXXXX
                  </p>
                  <a
                    href="https://wa.me/91XXXXXXXXXX"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-full text-sm font-semibold hover:bg-green-600 transition-colors"
                  >
                    <WhatsappLogo size={16} />
                    WhatsApp पर कॉल करें
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-brandGreen-100 p-3 rounded-full">
                  <WhatsappLogo className="text-brandGreen-700" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-1">WhatsApp</h3>
                  <p className="text-neutral-600 mb-2">
                    +91-XXXXXXXXXX
                  </p>
                  <a
                    href="https://wa.me/91XXXXXXXXXX"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-full text-sm font-semibold hover:bg-green-600 transition-colors"
                  >
                    <WhatsappLogo size={16} />
                    WhatsApp पर message भेजें
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-brandGreen-100 p-3 rounded-full">
                  <Envelope className="text-brandGreen-700" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-1">ईमेल</h3>
                  <p className="text-neutral-600">
                    hello@FlockIQ.ai
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-6 bg-brandGreen-50 rounded-xl">
              <h3 className="font-semibold text-neutral-900 mb-2">कार्य समय</h3>
              <p className="text-neutral-600">
                सोमवार - शनिवार: 9:00 AM - 6:00 PM
              </p>
              <p className="text-neutral-600">
                रविवार: बंद
              </p>
              <p className="text-brandGreen-700 font-semibold mt-3 text-sm">
                ⚡ 24 घंटे के अंदर response की गारंटी
              </p>
            </div>

            {/* Team Photos */}
            <div className="mt-8">
              <h3 className="font-semibold text-neutral-900 mb-4">हमारी टीम</h3>
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-12 h-12 rounded-full bg-brandGreen-200 border-2 border-white flex items-center justify-center text-brandGreen-700 font-semibold text-sm"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <p className="text-sm text-neutral-500 mt-2">Gorakhpur-based team ready to help</p>
            </div>

            {/* Office Map */}
            <div className="mt-8">
              <h3 className="font-semibold text-neutral-900 mb-4">हमारा कार्यालय</h3>
              <div className="bg-neutral100 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <MapPin className="text-brandGreen-700" size={20} />
                  <p className="text-sm text-neutral700">Gorakhpur, Uttar Pradesh, India</p>
                </div>
                <div className="bg-white rounded-lg h-32 flex items-center justify-center border border-neutral200">
                  <p className="text-sm text-neutral500">Map placeholder</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-neutral-900 mb-6 font-space-grotesk">
              संदेश भेजें
            </h2>

            {/* Inquiry Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-neutral-700 mb-3">
                आप किस बारे में बात करना चाहते हैं?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'general', label: 'सामान्य पूछताछ', desc: 'General inquiry' },
                  { id: 'sales', label: 'सेल्स/डेमो', desc: 'Sales & Demo' },
                  { id: 'partnership', label: 'पार्टनरशिप', desc: 'Partnership' },
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, inquiryType: type.id })}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      formData.inquiryType === type.id
                        ? 'border-brandGreen700 bg-brandGreen50'
                        : 'border-neutral200 hover:border-brandGreen300'
                    }`}
                  >
                    <p className="font-semibold text-neutral900">{type.label}</p>
                    <p className="text-sm text-neutral500">{type.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {submitted ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                <div className="text-green-600 text-6xl mb-4">✓</div>
                <h3 className="text-xl font-semibold text-green-800 mb-2">
                  धन्यवाद!
                </h3>
                <p className="text-green-700">
                  आपका संदेश भेज दिया गया है। हम जल्द ही आपसे संपर्क करेंगे।
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    नाम *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brandGreen-500 focus:border-transparent"
                    placeholder="आपका नाम"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    ईमेल *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brandGreen-500 focus:border-transparent"
                    placeholder="आपका ईमेल"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    फोन नंबर
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brandGreen-500 focus:border-transparent"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    संदेश *
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brandGreen-500 focus:border-transparent resize-none"
                    placeholder="आपका संदेश"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-brandGreen-700 text-white font-semibold py-3 rounded-lg hover:bg-brandGreen-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'भेज रहा है...' : 'संदेश भेजें'}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>

      {/* Live Chat Widget */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 bg-brandGreen700 text-white p-4 rounded-full shadow-lg hover:bg-brandGreen600 transition-colors z-50"
        aria-label="Live Chat"
      >
        <ChatCircleDots size={28} weight="fill" />
      </motion.button>
    </div>
  );
}
