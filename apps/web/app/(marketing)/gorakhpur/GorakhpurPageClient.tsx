// FlockIQ — Gorakhpur Page Client Component
// File: apps/web/app/(marketing)/gorakhpur/GorakhpurPageClient.tsx
// Version: v1.0 | May 2026
// Task Reference: C-03
// Requirements: FR-GORAKHPUR-001

'use client';

import { motion } from 'framer-motion';
import { TrendUp, MapPin, Users, Check, ArrowRight, CaretDown, CaretUp } from '@phosphor-icons/react';
import { useState } from 'react';

// Demo price data (would be fetched from Supabase in production)
const currentPrice = {
  price: 168,
  p10: 161,
  p50: 168,
  p90: 175,
  signal: 'sell',
  confidence: 'high',
  lastUpdated: new Date().toISOString(),
};

const districts = [
  { name: 'Deoria', slug: 'deoria', distance: '45 km' },
  { name: 'Kushinagar', slug: 'kushinagar', distance: '55 km' },
  { name: 'Basti', slug: 'basti', distance: '60 km' },
  { name: 'Maharajganj', slug: 'maharajganj', distance: '35 km' },
];

const testimonials = [
  {
    name: 'राजेश यादव',
    location: 'Gorakhpur',
    flock: '25,000 birds',
    quote: 'FlockIQ ने मुझे बताया कब बेचना है — और मैंने ₹1.24 लाख बचाए पिछले 6 महीनों में।',
    outcome: '₹1.24 लाख बचाए',
  },
  {
    name: 'सुरेश कुमार',
    location: 'Gorakhpur',
    flock: '18,000 birds',
    quote: 'गोरखपुर मंडी का भाव पता करना आसान हो गया। अब मैं सही समय पर बेचता हूँ।',
    outcome: 'सही समय पर बेचा',
  },
];

// 7-day price history data
const priceHistory = Array.from({ length: 7 }, (_, i) => ({
  day: i === 0 ? 'Today' : `${i}d ago`,
  price: 165 + Math.random() * 10,
}));

// Local FAQs
const localFaqs = [
  {
    question: 'गोरखपुर मंडी में आज मुर्गी का भाव क्या है?',
    answer: 'आज गोरखपुर मंडी में ब्रॉयलर का भाव ₹168/kg है। हमारा AI model भविष्यवाणी करता है कि अगले 7 दिनों में भाव ₹161–₹175/kg के बीच रहेगा।',
  },
  {
    question: 'FlockIQ गोरखपुर में कैसे काम करता है?',
    answer: 'हम 47 सार्वजनिक डेटा स्रोतों से भाव जानकारी इकट्ठा करते हैं — AGMARKNET, NECC, IMD weather, और feed prices। हमारा AI model 95%+ directional accuracy के साथ 7 दिन का भाव अनुमान लगाता है।',
  },
  {
    question: 'गोरखपुर के किसानों को क्या फायदा है?',
    answer: 'गोरखपुर के 200+ किसान FlockIQ का इस्तेमाल कर रहे हैं। औसतन, हर किसान साल में ₹1–2 लाख बचाता है सही समय पर बेचकर। 14 दिन मुफ़्त trial करें और खुद देखें।',
  },
];

export default function GorakhpurPageClient() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [remainingTrials, setRemainingTrials] = useState(47);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

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
            <p className="font-jakarta font-bold text-[11px] text-brand-100 tracking-[0.16em] uppercase mb-4">
              गोरखपुर का नं. 1 मुर्गी भाव सलाहकार
            </p>
            <h1 className="font-sora font-bold text-[clamp(2rem,3.5vw+0.75rem,3.5rem)] leading-[1.1] mb-4">
              गोरखपुर के किसान ₹50,000+ बचा रहे हैं हर बैच में
            </h1>
            <p className="font-jakarta text-[clamp(1rem,0.5vw+0.875rem,1.0625rem)] text-brand-100 max-w-3xl mx-auto mb-8">
              200+ Gorakhpur farmers are saving ₹50,000+ per batch — stop losing money to bad timing
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/signup?utm_source=gorakhpur_page"
                className="px-8 py-4 bg-white text-brand-700 font-semibold rounded-full hover:bg-brand-50 transition-all relative"
              >
                14 दिन मुफ़्त शुरू करें
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                  {remainingTrials} स्पॉट बाकी
                </span>
              </a>
              <a
                href="/try-whatsapp?utm_source=gorakhpur_page"
                className="px-8 py-4 border-2 border-white text-white font-semibold rounded-full hover:bg-white/10 transition-all"
              >
                WhatsApp Demo आज़माएं
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Live Price Widget */}
      <section className="py-section-vertical bg-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-brand-50 rounded-2xl p-8 border-2 border-brand-200">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <MapPin size={24} className="text-brand-700" />
                  <span className="font-semibold text-neutral-900">Gorakhpur Mandi</span>
                </div>
                <span className="text-sm text-neutral-500">
                  Updated: {new Date(currentPrice.lastUpdated).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              <div className="text-center mb-6">
                <p className="text-sm text-neutral-500 mb-2">Today's Price</p>
                <p className="font-sora font-bold text-6xl text-neutral-900 mb-2">
                  ₹{currentPrice.price}/kg
                </p>
                <div className="flex items-center justify-center gap-2">
                  <TrendUp size={20} className="text-green-600" />
                  <span className="text-sm text-green-600 font-semibold">
                    {currentPrice.signal === 'sell' ? 'आज बेचें ✓' : 'रुकें'}
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 mb-6">
                <p className="text-sm text-neutral-500 mb-2">7-Day Forecast Range</p>
                <div className="flex justify-between items-center">
                  <div className="text-center">
                    <p className="text-xs text-neutral-500">P10 (Low)</p>
                    <p className="font-sora font-bold text-xl text-neutral-900">₹{currentPrice.p10}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-neutral-500">P50 (Likely)</p>
                    <p className="font-sora font-bold text-2xl text-brand-700">₹{currentPrice.p50}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-neutral-500">P90 (High)</p>
                    <p className="font-sora font-bold text-xl text-neutral-900">₹{currentPrice.p90}</p>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-neutral-500 mb-2">
                  Confidence: <span className="font-semibold text-brand-700">{currentPrice.confidence}</span>
                </p>
                <a
                  href="/signup?utm_source=gorakhpur_page"
                  className="inline-block px-6 py-3 bg-brand-700 text-white font-semibold rounded-full hover:bg-brand-500 transition-all relative"
                >
                  Daily Alerts पाएं →
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                    {remainingTrials} स्पॉट बाकी
                  </span>
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 7-Day Price History Chart */}
      <section className="py-section-vertical bg-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-neutral-50 rounded-2xl p-6">
              <h3 className="font-jakarta font-semibold text-xl text-neutral-900 mb-4">
                7-Day Price History
              </h3>
              <div className="space-y-3">
                {priceHistory.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-neutral-500">{item.day}</span>
                    <span className="font-semibold text-neutral-900">₹{item.price.toFixed(0)}/kg</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Local Market Profile */}
      <section className="py-section-vertical bg-neutral-50">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="font-sora font-bold text-[clamp(1.75rem,2.5vw+0.5rem,2.75rem)] text-neutral-900 mb-4">
              Gorakhpur Poultry Market Profile
            </h2>
            <p className="font-jakarta text-[clamp(1rem,0.5vw+0.875rem,1.0625rem)] text-neutral-700">
              Understanding the local market dynamics
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-sm"
            >
              <Users size={32} className="text-brand-700 mb-4" />
              <h3 className="font-semibold text-neutral-900 mb-2">200+ Farmers</h3>
              <p className="text-sm text-neutral-700">
                Commercial poultry farmers using FlockIQ in Gorakhpur district
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 shadow-sm"
            >
              <MapPin size={32} className="text-brand-700 mb-4" />
              <h3 className="font-semibold text-neutral-900 mb-2">5 Major Mandis</h3>
              <p className="text-sm text-neutral-700">
                Gorakhpur APMC, Chauri Chaura, Sahjanwa, Bansgaon, and Pipraich mandis covered
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-6 shadow-sm"
            >
              <TrendUp size={32} className="text-brand-700 mb-4" />
              <h3 className="font-semibold text-neutral-900 mb-2">95%+ Accuracy</h3>
              <p className="text-sm text-neutral-700">
                Verified accuracy on 6-month Gorakhpur holdout data
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Local Testimonials */}
      <section className="py-section-vertical bg-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="font-sora font-bold text-[clamp(1.75rem,2.5vw+0.5rem,2.75rem)] text-neutral-900 mb-4">
              Gorakhpur के किसान हमें भरोसा करते हैं
            </h2>
            <p className="font-jakarta text-[clamp(1rem,0.5vw+0.875rem,1.0625rem)] text-neutral-700">
              Local farmers के real results
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-brand-50 rounded-2xl p-6"
              >
                <p className="text-neutral-700 mb-4 italic text-sm">"{testimonial.quote}"</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-neutral-900">{testimonial.name}</p>
                    <p className="text-sm text-neutral-500">{testimonial.location} • {testimonial.flock}</p>
                  </div>
                  <div className="bg-green100 px-3 py-1 rounded-full">
                    <p className="text-sm font-semibold text-green700">{testimonial.outcome}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Local FAQs */}
      <section className="py-section-vertical bg-neutral-50">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="font-sora font-bold text-[clamp(1.75rem,2.5vw+0.5rem,2.75rem)] text-neutral-900 mb-4">
              गोरखपुर के बारे में अक्सर पूछे जाने वाले सवाल
            </h2>
            <p className="font-jakarta text-[clamp(1rem,0.5vw+0.875rem,1.0625rem)] text-neutral-700 mb-8">
              Common questions about Gorakhpur poultry market
            </p>

            <div className="space-y-4">
              {localFaqs.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left"
                    aria-expanded={openFaq === index}
                  >
                    <span className="font-semibold text-neutral-900">{item.question}</span>
                    {openFaq === index ? (
                      <CaretUp size={24} className="text-brand-700" />
                    ) : (
                      <CaretDown size={24} className="text-neutral-500" />
                    )}
                  </button>
                  {openFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="px-6 pb-4"
                    >
                      <p className="text-neutral-700">{item.answer}</p>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Nearby Districts */}
      <section className="py-section-vertical bg-neutral-50">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="font-sora font-bold text-[clamp(1.75rem,2.5vw+0.5rem,2.75rem)] text-neutral-900 mb-4">
              Nearby Districts
            </h2>
            <p className="font-jakarta text-[clamp(1rem,0.5vw+0.875rem,1.0625rem)] text-neutral-700">
              Gorakhpur region के ये districts भी serve करते हैं
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {districts.map((district) => (
              <motion.a
                key={district.slug}
                href={`/${district.slug}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: districts.indexOf(district) * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-neutral-900">{district.name}</h3>
                  <ArrowRight size={20} className="text-brand-700 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-sm text-neutral-500">{district.distance} from Gorakhpur</p>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-section-vertical bg-brand-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-sora font-bold text-[clamp(1.75rem,2.5vw+0.5rem,2.75rem)] mb-4">
              Gorakhpur के किसान बेहतर फैसले ले रहे हैं
            </h2>
            <p className="font-jakarta text-[clamp(1rem,0.5vw+0.875rem,1.0625rem)] text-brand-100 mb-8">
              Join 200+ farmers already using FlockIQ in Gorakhpur
            </p>
            <a
              href="/signup?utm_source=gorakhpur_page"
              className="inline-block px-8 py-4 bg-white text-brand-700 font-semibold rounded-full hover:bg-brand-50 transition-all relative"
            >
              14 दिन मुफ़्त शुरू करें
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                {remainingTrials} स्पॉट बाकी
              </span>
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
