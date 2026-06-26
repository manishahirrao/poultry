'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function LeadMagnetPage() {
  const [email, setEmail] = useState('')
  const [district, setDistrict] = useState('')
  const [magnetType, setMagnetType] = useState<'template' | 'checklist' | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await fetch('/api/lead-magnet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          district,
          magnetType,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Submission failed')
      }

      setSubmitted(true)
    } catch (error) {
      console.error('Submission error:', error)
      alert('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="text-6xl mb-4">📧</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Check Your Inbox!
            </h1>
            <p className="text-lg text-gray-600 mb-4">
              We've sent your free resource to:
            </p>
            <p className="text-xl font-semibold text-green-600 mb-6">{email}</p>
            <p className="text-sm text-gray-500 mb-6">
              If you don't see it within 5 minutes, check your spam folder.
            </p>
            <div className="bg-green-50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Next Steps:</h3>
              <ul className="text-left text-sm text-gray-600 space-y-2">
                <li>✅ Download your free resource</li>
                <li>✅ Try our 14-day free trial (Gorakhpur belt farmers)</li>
                <li>✅ Get 95%+ accurate price predictions via WhatsApp</li>
              </ul>
            </div>
            <Link
              href="/"
              className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg text-lg"
            >
              Start Free Trial
            </Link>
            <p className="mt-4 text-sm text-gray-500">
              No credit card required • Cancel anytime
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Stop Losing ₹50,000 Per Batch to Bad Timing
          </h1>
          <p className="text-lg text-gray-600">
            बुरे समय से ₹50,000 की हानि रोकें
          </p>
        </div>

        {/* Magnet Selection */}
        {!magnetType && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Template Card */}
            <div
              onClick={() => setMagnetType('template')}
              className="bg-white rounded-2xl shadow-xl p-8 cursor-pointer hover:shadow-2xl transition-shadow border-2 border-transparent hover:border-green-500"
            >
              <div className="text-5xl mb-4">📊</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                7-Day Price Forecast Template
              </h2>
              <p className="text-gray-600 mb-4">
                Excel/Google Sheets template to track prices, calculate profits, and plan your selling strategy
              </p>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  Pre-built formulas for profit calculation
                </div>
                <div className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  7-day forecast tracking
                </div>
                <div className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  What-if scenario analysis
                </div>
                <div className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  Hindi + English labels
                </div>
              </div>
              <div className="mt-6 text-center">
                <span className="bg-green-100 text-green-800 text-sm font-semibold px-4 py-2 rounded-full">
                  Best for: Planning & Analysis
                </span>
              </div>
            </div>

            {/* Checklist Card */}
            <div
              onClick={() => setMagnetType('checklist')}
              className="bg-white rounded-2xl shadow-xl p-8 cursor-pointer hover:shadow-2xl transition-shadow border-2 border-transparent hover:border-green-500"
            >
              <div className="text-5xl mb-4">✅</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Broiler Price Swing Checklist
              </h2>
              <p className="text-gray-600 mb-4">
                1-page PDF checklist with 10 warning signs and 5 green flags to time your sales perfectly
              </p>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  10 warning signs before price crashes
                </div>
                <div className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  5 indicators of price uptrends
                </div>
                <div className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  Weekly monitoring routine
                </div>
                <div className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  Middleman behavior patterns
                </div>
              </div>
              <div className="mt-6 text-center">
                <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-4 py-2 rounded-full">
                  Best for: Quick Decisions
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        {magnetType && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <button
              onClick={() => setMagnetType(null)}
              className="text-sm text-gray-500 hover:text-gray-700 mb-6"
            >
              ← Back to selection
            </button>

            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
              Get Your Free {magnetType === 'template' ? 'Price Forecast Template' : 'Price Swing Checklist'}
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Enter your email to receive instant download
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address / ईमेल पता
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  District / जिला (Optional)
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select District (Optional)</option>
                  <option value="gorakhpur">Gorakhpur / गोराखपुर</option>
                  <option value="deoria">Deoria / देवरिया</option>
                  <option value="kushinagar">Kushinagar / कुशीनगर</option>
                  <option value="basti">Basti / बस्ती</option>
                  <option value="maharajganj">Maharajganj / महाराजगंज</option>
                  <option value="other">Other / अन्य</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Get Free Download'}
              </button>

              <p className="text-xs text-gray-500 text-center">
                No spam. Unsubscribe anytime. We respect your privacy.
              </p>
            </form>
          </div>
        )}

        {/* Social Proof */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Trusted by 200+ Farmers in Gorakhpur Belt
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">95.2%</div>
              <p className="text-sm text-gray-600">Prediction Accuracy</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">₹50K+</div>
              <p className="text-sm text-gray-600">Saved Per Batch</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">7 Days</div>
              <p className="text-sm text-gray-600">Forward Forecast</p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-4">
            <div className="border-b pb-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                Is this really free?
              </h3>
              <p className="text-gray-600 text-sm">
                Yes, 100% free. No credit card required. Just enter your email and get instant access.
              </p>
            </div>
            
            <div className="border-b pb-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                What format are the files?
              </h3>
              <p className="text-gray-600 text-sm">
                Template is Excel/Google Sheets compatible. Checklist is PDF. Both work on mobile and desktop.
              </p>
            </div>
            
            <div className="border-b pb-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                Is Hindi support included?
              </h3>
              <p className="text-gray-600 text-sm">
                Yes, both resources include Hindi labels and instructions alongside English.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Can I share this with other farmers?
              </h3>
              <p className="text-gray-600 text-sm">
                Absolutely! Please share with fellow farmers. We want to help everyone stop losing money to bad timing.
              </p>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="mt-8 text-center text-gray-600 text-sm">
          <p className="mb-2">
            <strong>Questions?</strong> Contact us at partnerships@flockiq.com or +91 XXXXX XXXXX
          </p>
        </div>
      </div>
    </div>
  )
}
