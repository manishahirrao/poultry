'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function LossCalculatorPage() {
  const [flockSize, setFlockSize] = useState<number>(25000)
  const [currentPrice, setCurrentPrice] = useState<number>(165)
  const [timingError, setTimingError] = useState<number>(2.5)
  const [showResult, setShowResult] = useState(false)

  const calculateLoss = () => {
    const avgBirdWeight = 2.0 // kg (standard broiler weight)
    const totalWeight = flockSize * avgBirdWeight
    const lossPerBird = timingError
    const totalLoss = totalWeight * lossPerBird
    
    return {
      totalWeight: totalWeight.toLocaleString(),
      totalLoss: Math.round(totalLoss).toLocaleString('en-IN'),
      lossPerBird: lossPerBird.toFixed(1),
      subscriptionCost: 2000,
      roi: Math.round(totalLoss / 2000)
    }
  }

  const result = showResult ? calculateLoss() : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            आपका सालाना टाइमिंग लॉस कितना है?
          </h1>
          <p className="text-lg text-gray-600">
            गलत समय पर बेचने से कितना नुकसान हो सकता है?
            <br />
            <span className="text-sm">Calculate your annual timing loss</span>
          </p>
        </div>

        {/* Calculator Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="space-y-6">
            {/* Flock Size Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                झुंड का आकार / Flock Size (पक्षी / birds)
              </label>
              <input
                type="number"
                value={flockSize}
                onChange={(e) => setFlockSize(Number(e.target.value))}
                min="10000"
                max="100000"
                step="1000"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
              />
              <p className="text-xs text-gray-500 mt-1">Minimum 10,000 birds</p>
            </div>

            {/* Current Price Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                वर्तमान भाव / Current Price (₹/kg)
              </label>
              <input
                type="number"
                value={currentPrice}
                onChange={(e) => setCurrentPrice(Number(e.target.value))}
                min="100"
                max="250"
                step="1"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
              />
              <p className="text-xs text-gray-500 mt-1">Typical range: ₹150-180/kg</p>
            </div>

            {/* Timing Error Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Timing Error / गलत समय पर बेचने का नुकसान (₹/kg)
              </label>
              <input
                type="number"
                value={timingError}
                onChange={(e) => setTimingError(Number(e.target.value))}
                min="0.5"
                max="10"
                step="0.5"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Common: ₹2-5/kg during price swings (Nov-Mar)
              </p>
            </div>

            {/* Calculate Button */}
            <button
              onClick={() => setShowResult(true)}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg text-lg transition-colors"
            >
              नुकसान की गणना करें
            </button>
          </div>
        </div>

        {/* Results Card */}
        {result && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-4 border-red-500">
            <h2 className="text-2xl font-bold text-red-600 mb-6 text-center">
              ⚠️ आपका सालाना टाइमिंग लॉस
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b">
                <span className="text-gray-600">Total Weight / कुल वजन</span>
                <span className="font-bold text-xl">{result.totalWeight} kg</span>
              </div>

              <div className="flex justify-between items-center py-3 border-b">
                <span className="text-gray-600">Loss per Bird / प्रति पक्षी नुकसान</span>
                <span className="font-bold text-xl">₹{result.lossPerBird}</span>
              </div>

              <div className="flex justify-between items-center py-4 bg-red-50 rounded-lg px-4">
                <span className="text-gray-800 font-semibold">सालाना टाइमिंग लॉस</span>
                <span className="font-bold text-3xl text-red-600">₹{result.totalLoss}</span>
              </div>

              <div className="flex justify-between items-center py-3 border-b">
                <span className="text-gray-600">FlockIQ Subscription / सदस्यता</span>
                <span className="font-bold text-xl">₹{result.subscriptionCost}/month</span>
              </div>

              <div className="flex justify-between items-center py-4 bg-green-50 rounded-lg px-4">
                <span className="text-gray-800 font-semibold">आप बचाएंगे</span>
                <span className="font-bold text-2xl text-green-600">
                  ₹{result.totalLoss}
                </span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Note:</strong> This is based on average ₹{timingError}/kg timing loss. 
                Actual losses vary based on market conditions. FlockIQ helps you 
                avoid these losses with 7-day forward price predictions.
              </p>
            </div>
          </div>
        )}

        {/* CTA Card */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl shadow-xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-4 text-center">
            यह रोकने के लिए → FlockIQ
          </h3>
          <p className="text-center mb-6 text-green-100">
            95.2% सटीकता के साथ 7 दिन का भाव अनुमान पाएं
            <br />
            Get 7-day price predictions with 95.2% accuracy
          </p>
          <div className="space-y-3">
            <Link
              href="/signup"
              className="block w-full bg-white text-green-600 font-bold py-4 px-6 rounded-lg text-center text-lg hover:bg-green-50 transition-colors"
            >
              14 दिन मुफ़्त ट्राई करें
            </Link>
            <Link
              href="/try-whatsapp"
              className="block w-full bg-green-700 text-white font-bold py-4 px-6 rounded-lg text-center text-lg hover:bg-green-800 transition-colors"
            >
              WhatsApp Demo देखें
            </Link>
          </div>
          <p className="text-center mt-4 text-sm text-green-200">
            कोई credit card नहीं • No credit card required
          </p>
        </div>

        {/* Info Section */}
        <div className="mt-8 text-center text-gray-600 text-sm">
          <p className="mb-2">
            <strong>How it works:</strong> Farmers lose ₹50,000-₹1,50,000 per batch from 
            selling at the wrong time. FlockIQ predicts prices 7 days ahead so 
            you can sell at the optimal time.
          </p>
          <p>
            <strong>यह कैसे काम करता है:</strong> किसान गलत समय पर बेचने से 
            ₹50,000-₹1,50,000 प्रति बैच गंवाते हैं। FlockIQ 7 दिन पहले भाव बताता है 
            ताकि आप सही समय पर बेच सकें।
          </p>
        </div>
      </div>
    </div>
  )
}
