'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function PartnerWithUsPage() {
  const [companyName, setCompanyName] = useState('')
  const [contactName, setContactName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [district, setDistrict] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      setSubmitted(true)
      setLoading(false)
    }, 1000)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="text-6xl mb-4">🤝</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Thank You for Your Interest!
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              We'll contact you within 24 hours to discuss partnership opportunities.
            </p>
            <Link
              href="/"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-lg"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            फीड कंपनी पार्टनरशिप प्रोग्राम
          </h1>
          <p className="text-lg text-gray-600">
            Feed Company Partnership Program
            <br />
            <span className="text-sm">20% commission, exclusive territory</span>
          </p>
        </div>

        {/* Partnership Benefits */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Partnership Benefits / पार्टनरशिप लाभ
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-green-50 rounded-lg p-6">
              <div className="text-3xl mb-3">💰</div>
              <h3 className="font-semibold text-gray-900 mb-2">20% Commission</h3>
              <p className="text-gray-600 text-sm">
                First-year subscription revenue का 20% commission कमाएं
              </p>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-6">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="font-semibold text-gray-900 mb-2">Exclusive Territory</h3>
              <p className="text-gray-600 text-sm">
                हर district का first partner 6-month exclusivity पाता है
              </p>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-6">
              <div className="text-3xl mb-3">📈</div>
              <h3 className="font-semibold text-gray-900 mb-2">Qualified Leads</h3>
              <p className="text-gray-600 text-sm">
                आपके customer base से 50-100 warm leads/month मिलेंगे
              </p>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-6">
              <div className="text-3xl mb-3">🎨</div>
              <h3 className="font-semibold text-gray-900 mb-2">Co-Branded Materials</h3>
              <p className="text-gray-600 text-sm">
                आपके logo और branding के साथ marketing materials
              </p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            How It Works / यह कैसे काम करता है
          </h2>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Bundle Offer</h3>
                <p className="text-gray-600">
                  ₹50K+ feed orders के साथ 14-day free FlockIQ trial offer करें
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Customer Activation</h3>
                <p className="text-gray-600">
                  Help customers activate trial at checkout (2-minute process)
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Conversion</h3>
                <p className="text-gray-600">
                  15-20% of trial users convert to paid subscriptions
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                4
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Earn Commission</h3>
                <p className="text-gray-600">
                  Receive 20% commission on first-year revenue, paid monthly
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Calculator */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Revenue Calculator / राजस्व कैलकुलेटर
          </h2>
          
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6">
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-green-600 mb-1">40</div>
                <p className="text-sm text-gray-600">Leads/Month</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600 mb-1">20%</div>
                <p className="text-sm text-gray-600">Conversion Rate</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600 mb-1">₹4.6L</div>
                <p className="text-sm text-gray-600">Your Commission/Year</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4 text-center">
              *Based on 40 leads/month, 20% conversion, ₹2,000/month subscription
            </p>
          </div>
        </div>

        {/* Partnership Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Apply for Partnership / पार्टनरशिप के लिए आवेदन करें
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Company Name / कंपनी का नाम
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Contact Name / संपर्क व्यक्ति का नाम
              </label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email / ईमेल
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone / फोन
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 XXXXX XXXXX"
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Primary District / मुख्य जिला
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select District</option>
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
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg text-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'आवेदन जमा करें'}
            </button>
          </form>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Frequently Asked Questions / अक्सर पूछे जाने वाले सवाल
          </h2>
          
          <div className="space-y-4">
            <div className="border-b pb-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                What's the minimum commitment?
              </h3>
              <p className="text-gray-600 text-sm">
                12-month initial term. No minimum sales requirement, but exclusivity requires meeting lead targets.
              </p>
            </div>
            
            <div className="border-b pb-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                How do I track my commissions?
              </h3>
              <p className="text-gray-600 text-sm">
                You'll have access to a partner dashboard showing all referrals, conversions, and commission calculations in real-time.
              </p>
            </div>
            
            <div className="border-b pb-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                What marketing materials do you provide?
              </h3>
              <p className="text-gray-600 text-sm">
                Co-branded one-pagers, QR code stands, WhatsApp templates, sales scripts, and training for your staff.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Can I partner if I'm not a feed company?
              </h3>
              <p className="text-gray-600 text-sm">
                Yes! We partner with integrators, veterinary suppliers, and other agri-businesses serving poultry farmers.
              </p>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="mt-8 text-center text-gray-600 text-sm">
          <p className="mb-2">
            <strong>Questions?</strong> Contact us at partnerships@FlockIQ.ai or +91 XXXXX XXXXX
          </p>
          <p>
            <strong>सवाल हैं?</strong> हमसे संपर्क करें: partnerships@FlockIQ.ai या +91 XXXXX XXXXX
          </p>
        </div>
      </div>
    </div>
  )
}
