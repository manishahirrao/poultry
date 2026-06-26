// FlockIQ — District Page Template Component
// File: apps/web/components/districts/DistrictPage.tsx
// Version: v1.0 | May 2026
// Task Reference: CP-04
// Design Reference: 11_industry_pages_components_master.md §3.1

'use client';

import { motion } from 'framer-motion';
import { TrendUp, MapPin, Users, Check, ArrowRight, ChartLine, Question } from '@phosphor-icons/react';
import { PriceIntelligenceWidget, type MandiSlug } from '@/components/widgets/PriceIntelligenceWidget';

interface DistrictPageProps {
  districtName: string;
  districtSlug: string; // Accept string for backward compatibility
  price?: number;
  p10?: number;
  p50?: number;
  p90?: number;
  signal?: 'sell' | 'hold';
  confidence?: 'high' | 'medium' | 'low';
  farmerCount: number;
  mandiCount: number;
  distanceFromGorakhpur: string;
  lastUpdated?: string;
  priceHistory?: { date: string; price: number }[];
  testimonials?: Array<{
    name: string;
    location: string;
    quote: string;
    quoteHi: string;
    outcome: string;
  }>;
  faqs?: Array<{ question: string; answer: string; questionHi?: string; answerHi?: string }>;
  adjacentDistricts?: Array<{ name: string; slug: string; distance: string }>;
}

export default function DistrictPage({
  districtName,
  districtSlug,
  price,
  p10,
  p50,
  p90,
  signal,
  confidence,
  farmerCount,
  mandiCount,
  distanceFromGorakhpur,
  lastUpdated,
  priceHistory,
  testimonials,
  faqs,
  adjacentDistricts,
}: DistrictPageProps) {
  return (
    <div className="min-h-[100dvh]">
      {/* Hero Section */}
      <section className="py-section-vertical bg-brandGreen700 text-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <p className="text-brandGreen100 font-semibold text-sm tracking-widest uppercase mb-4">
              {districtName} मंडी भाव सलाहकार
            </p>
            <h1 className="font-space-grotesk font-bold text-[clamp(2rem,3.5vw+0.75rem,3.5rem)] leading-[1.1] mb-4">
              {districtName} Broiler Price — 7 दिन पहले जानें
            </h1>
            <p className="font-space-grotesk text-lg text-brandGreen100 max-w-3xl mx-auto mb-8">
              Get accurate 7-day broiler price predictions for {districtName} mandi
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/signup"
                className="px-8 py-4 bg-white text-brandGreen700 font-semibold rounded-full hover:bg-brandGreen50 transition-all"
              >
                14 दिन मुफ़्त शुरू करें
              </a>
              <a
                href="/try-whatsapp"
                className="px-8 py-4 border-2 border-white text-white font-semibold rounded-full hover:bg-white/10 transition-all"
              >
                WhatsApp Demo आज़माएं
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Live Price Widget - Using PriceIntelligenceWidget */}
      <section className="py-section-vertical bg-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <PriceIntelligenceWidget mandi={districtSlug as MandiSlug} showChart={false} />
            <div className="text-center mt-6">
              <a
                href="/signup"
                className="inline-block px-6 py-3 bg-brandGreen700 text-white font-semibold rounded-full hover:bg-brandGreen500 transition-all"
              >
                Daily Alerts पाएं →
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Local Market Profile */}
      <section className="py-section-vertical bg-neutral50">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="font-space-grotesk font-bold text-[clamp(1.75rem,2.5vw+0.5rem,2.75rem)] text-neutral900 mb-4">
              {districtName} Poultry Market Profile
            </h2>
            <p className="font-space-grotesk text-lg text-neutral700">
              {districtName} का poultry market समझें
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
              <Users size={32} className="text-brandGreen700 mb-4" />
              <h3 className="font-semibold text-neutral900 mb-2">{farmerCount}+ Farmers</h3>
              <p className="text-sm text-neutral700">
                Commercial poultry farmers using FlockIQ in {districtName} district
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 shadow-sm"
            >
              <MapPin size={32} className="text-brandGreen700 mb-4" />
              <h3 className="font-semibold text-neutral900 mb-2">{mandiCount} Major Mandis</h3>
              <p className="text-sm text-neutral700">
                Key mandis covered in {districtName} district
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-6 shadow-sm"
            >
              <TrendUp size={32} className="text-brandGreen700 mb-4" />
              <h3 className="font-semibold text-neutral900 mb-2">95%+ Accuracy</h3>
              <p className="text-sm text-neutral700">
                Verified accuracy on regional holdout data
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Price History Section */}
      {priceHistory && priceHistory.length > 0 && (
        <section className="py-section-vertical bg-white">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-8"
            >
              <h2 className="font-space-grotesk font-bold text-[clamp(1.75rem,2.5vw+0.5rem,2.75rem)] text-neutral900 mb-4">
                Recent {districtName} Price History
              </h2>
              <p className="font-space-grotesk text-lg text-neutral700">
                Last 7 days actual prices from AGMARKNET
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-neutral50 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ChartLine size={24} className="text-brandGreen700" />
                  <span className="font-semibold text-neutral900">7-Day Price Trend</span>
                </div>
                <span className="text-xs text-neutral500">Data: AGMARKNET {districtName} APMC</span>
              </div>

              {/* Simple bar chart visualization */}
              <div className="flex items-end gap-2 h-32 mt-4">
                {priceHistory.map((item, index) => {
                  const maxPrice = Math.max(...priceHistory.map((p) => p.price));
                  const height = (item.price / maxPrice) * 100;
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-brandGreen200 rounded-t hover:bg-brandGreen300 transition-colors relative group"
                        style={{ height: `${height}%` }}
                      >
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-neutral900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          ₹{item.price}/kg
                        </div>
                      </div>
                      <span className="text-xs text-neutral500 mt-2">
                        {new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 text-center">
                <a href="/accuracy" className="text-sm text-brandGreen700 hover:text-brandGreen500 font-semibold underline">
                  पूरी history →
                </a>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Local Testimonials Section */}
      {testimonials && testimonials.length > 0 && (
        <section className="py-section-vertical bg-neutral50">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <h2 className="font-space-grotesk font-bold text-[clamp(1.75rem,2.5vw+0.5rem,2.75rem)] text-neutral900 mb-4">
                {districtName} के किसानों की कहानियां
              </h2>
              <p className="font-space-grotesk text-lg text-neutral700">
                Local poultry farmers के real results
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-sm"
                >
                  <div className="mb-4">
                    <Check size={24} className="text-brandGreen700" />
                  </div>
                  <p className="text-lg italic text-neutral800 font-[Noto_Sans_Devanagari] mb-3">
                    "{testimonial.quoteHi}"
                  </p>
                  <p className="text-sm text-neutral500 italic mb-4">"{testimonial.quote}"</p>
                  <div className="border-t border-neutral200 pt-4">
                    <p className="font-semibold text-neutral900">{testimonial.name}</p>
                    <p className="text-sm text-neutral500">{testimonial.location}</p>
                    {testimonial.outcome && (
                      <span className="inline-block mt-2 bg-emerald-100 text-emerald-800 text-xs font-semibold px-3 py-1 rounded-full">
                        {testimonial.outcome}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Local FAQ Section */}
      {faqs && faqs.length > 0 && (
        <section className="py-section-vertical bg-white">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <h2 className="font-space-grotesk font-bold text-[clamp(1.75rem,2.5vw+0.5rem,2.75rem)] text-neutral900 mb-4">
                {districtName} FAQ
              </h2>
              <p className="font-space-grotesk text-lg text-neutral700">
                Common questions about {districtName} poultry market
              </p>
            </motion.div>

            <div className="max-w-3xl mx-auto space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-neutral50 rounded-xl p-6"
                >
                  <div className="flex items-start gap-3">
                    <Question size={20} className="text-brandGreen700 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-neutral900 mb-2">
                        {faq.questionHi || faq.question}
                      </p>
                      <p className="text-sm text-neutral700">
                        {faq.answerHi || faq.answer}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Adjacent Districts Grid */}
      {adjacentDistricts && adjacentDistricts.length > 0 && (
        <section className="py-section-vertical bg-neutral50">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <h2 className="font-space-grotesk font-bold text-[clamp(1.75rem,2.5vw+0.5rem,2.75rem)] text-neutral900 mb-4">
                Nearby Districts
              </h2>
              <p className="font-space-grotesk text-lg text-neutral700">
                Nearby mandis के लिए price predictions check करें
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {adjacentDistricts.map((district, index) => (
                <motion.a
                  key={index}
                  href={`/${district.slug}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl p-4 hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin size={16} className="text-brandGreen700" />
                    <span className="font-semibold text-neutral900 text-sm">{district.name}</span>
                  </div>
                  <p className="text-xs text-neutral500">{district.distance}</p>
                  <ArrowRight size={16} className="text-brandGreen700 mt-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Link back to Gorakhpur */}
      <section className="py-section-vertical bg-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <a
              href="/gorakhpur"
              className="flex items-center justify-between bg-brandGreen50 rounded-2xl p-6 hover:bg-brandGreen100 transition-colors group"
            >
              <div>
                <p className="font-semibold text-neutral900 mb-1">Gorakhpur District</p>
                <p className="text-sm text-neutral500">{distanceFromGorakhpur} from {districtName}</p>
              </div>
              <ArrowRight size={24} className="text-brandGreen700 group-hover:translate-x-1 transition-transform" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-section-vertical bg-brandGreen700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-space-grotesk font-bold text-[clamp(1.75rem,2.5vw+0.5rem,2.75rem)] mb-4">
              {districtName} के किसान बेहतर फैसले ले रहे हैं
            </h2>
            <p className="font-space-grotesk text-lg text-brandGreen100 mb-8">
              Join {farmerCount}+ farmers already using FlockIQ in {districtName}
            </p>
            <a
              href="/signup"
              className="inline-block px-8 py-4 bg-white text-brandGreen700 font-semibold rounded-full hover:bg-brandGreen50 transition-all"
            >
              14 दिन मुफ़्त शुरू करें
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
