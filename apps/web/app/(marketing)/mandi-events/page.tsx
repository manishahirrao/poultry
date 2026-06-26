'use client'

import Link from 'next/link'

export default function MandiEventsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🐔 Mandi Day Events
          </h1>
          <p className="text-lg text-gray-600">
            Live prediction verification at local mandis
            <br />
            <span className="text-sm">स्थानीय मंडियों में live prediction verification</span>
          </p>
        </div>

        {/* What to Expect */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            What to Expect / क्या उम्मीद करें
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-green-50 rounded-lg p-6">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="font-semibold text-gray-900 mb-2">Live Prediction Demo</h3>
              <p className="text-gray-600 text-sm">
                See our 7-day price predictions verified in real-time against actual mandi prices
              </p>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-6">
              <div className="text-3xl mb-3">🎤</div>
              <h3 className="font-semibold text-gray-900 mb-2">Farmer Testimonials</h3>
              <p className="text-gray-600 text-sm">
                Hear from farmers who've saved ₹50K-₹1.5L using FlockIQ
              </p>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-6">
              <div className="text-3xl mb-3">📱</div>
              <h3 className="font-semibold text-gray-900 mb-2">WhatsApp Demo</h3>
              <p className="text-gray-600 text-sm">
                Try our WhatsApp demo on the spot - no app download required
              </p>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-6">
              <div className="text-3xl mb-3">🎁</div>
              <h3 className="font-semibold text-gray-900 mb-2">Free Trial Signup</h3>
              <p className="text-gray-600 text-sm">
                Activate 14-day free trial immediately at the event
              </p>
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Upcoming Events / आगामी कार्यक्रम
          </h2>
          
          <div className="space-y-4">
            <div className="border-2 border-green-500 rounded-lg p-6 bg-green-50">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-gray-900">Gorakhpur Mandi</h3>
                  <p className="text-gray-600">गोराखपुर मंडी</p>
                </div>
                <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm">
                  This Monday
                </span>
              </div>
              <p className="text-gray-700 mb-2">
                📅 Monday, [Date] | ⏰ 8:00 AM - 12:00 PM
              </p>
              <p className="text-sm text-gray-600">
                Main mandi entrance, near price board
              </p>
            </div>

            <div className="border rounded-lg p-6">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-gray-900">Deoria Mandi</h3>
                  <p className="text-gray-600">देवरिया मंडी</p>
                </div>
                <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">
                  Next Monday
                </span>
              </div>
              <p className="text-gray-700 mb-2">
                📅 Monday, [Date] | ⏰ 8:00 AM - 12:00 PM
              </p>
              <p className="text-sm text-gray-600">
                Near feed shop entrance
              </p>
            </div>

            <div className="border rounded-lg p-6 opacity-60">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-gray-900">Kushinagar Mandi</h3>
                  <p className="text-gray-600">कुशीनगर मंडी</p>
                </div>
                <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">
                  Coming Soon
                </span>
              </div>
              <p className="text-gray-700 mb-2">
                📅 TBD | ⏰ 8:00 AM - 12:00 PM
              </p>
              <p className="text-sm text-gray-600">
                Location to be announced
              </p>
            </div>
          </div>
        </div>

        {/* Event Materials */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Event Materials / कार्यक्रम सामग्री
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl">📋</div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Event Script</h3>
                <p className="text-sm text-gray-600">Hindi/English talking points for engaging farmers</p>
              </div>
              <span className="text-green-600 font-semibold">Available</span>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl">🎬</div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Video Capture Guide</h3>
                <p className="text-sm text-gray-600">How to film farmer testimonials</p>
              </div>
              <span className="text-green-600 font-semibold">Available</span>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl">✅</div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Verification Checklist</h3>
                <p className="text-sm text-gray-600">Daily prediction verification process</p>
              </div>
              <span className="text-green-600 font-semibold">Available</span>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl">🚚</div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Logistics Checklist</h3>
                <p className="text-sm text-gray-600">Setup, teardown, and follow-up process</p>
              </div>
              <span className="text-green-600 font-semibold">Available</span>
            </div>
          </div>
        </div>

        {/* Success Stories */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Past Event Success / पिछले कार्यक्रम की सफलता
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-green-50 rounded-lg p-6">
              <div className="text-3xl font-bold text-green-600 mb-2">87</div>
              <p className="text-gray-700 font-semibold">Farmers Engaged</p>
              <p className="text-sm text-gray-600">किसानों ने भाग लिया</p>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">34</div>
              <p className="text-gray-700 font-semibold">Trial Signups</p>
              <p className="text-sm text-gray-600">ट्रायल signups</p>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-6">
              <div className="text-3xl font-bold text-purple-600 mb-2">12</div>
              <p className="text-gray-700 font-semibold">Video Testimonials</p>
              <p className="text-sm text-gray-600">वीडियo testimonials</p>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-6">
              <div className="text-3xl font-bold text-orange-600 mb-2">94%</div>
              <p className="text-gray-700 font-semibold">Prediction Accuracy</p>
              <p className="text-sm text-gray-600">Prediction सटीकता</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl shadow-xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-4 text-center">
            Can't Make It? / नहीं आ पा रहे?
          </h3>
          <p className="text-center mb-6 text-green-100">
            Start your 14-day free trial online today
            <br />
            आज ही अपना 14 दिन का मुफ़्त ट्रायल ऑनलाइन शुरू करें
          </p>
          <div className="space-y-3">
            <Link
              href="/signup"
              className="block w-full bg-white text-green-600 font-bold py-4 px-6 rounded-lg text-center text-lg hover:bg-green-50 transition-colors"
            >
              Start Free Trial / मुफ़्त ट्रायल शुरू करें
            </Link>
            <Link
              href="/loss-calculator"
              className="block w-full bg-green-700 text-white font-bold py-4 px-6 rounded-lg text-center text-lg hover:bg-green-800 transition-colors"
            >
              Calculate Your Losses / अपने नुकसान की गणना करें
            </Link>
          </div>
        </div>

        {/* Contact */}
        <div className="mt-8 text-center text-gray-600 text-sm">
          <p className="mb-2">
            <strong>Questions?</strong> Contact us at +91 XXXXX XXXXX or hello@FlockIQ.ai
          </p>
          <p>
            <strong>सवाल हैं?</strong> हमसे संपर्क करें: +91 XXXXX XXXXX या hello@FlockIQ.ai
          </p>
        </div>
      </div>
    </div>
  )
}
