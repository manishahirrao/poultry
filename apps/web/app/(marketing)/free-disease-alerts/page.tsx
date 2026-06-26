'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function FreeDiseaseAlertsPage() {
  const [phone, setPhone] = useState('')
  const [district, setDistrict] = useState('gorakhpur')
  const [referralCode, setReferralCode] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await fetch('/api/free-alerts/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, district, referral_code: referralCode })
      })
      
      if (response.ok) {
        setSubmitted(true)
      }
    } catch (error) {
      console.error('Subscription failed', error)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              You're Subscribed!
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              आप FREE disease alerts से subscribe हो गए!
            </p>
            <p className="text-gray-600 mb-8">
              You'll receive HPAI and disease alerts 48 hours before public news.
            </p>
            <Link
              href="/signup"
              className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg text-lg"
            >
              Get 7-Day Price Predictions Too
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            ⚠️ FREE Disease Alerts
          </h1>
          <p className="text-lg text-gray-600">
            Get HPAI alerts 48 hours before public news
            <br />
            <span className="text-sm">HPAI alerts 48 घंटे पहले मुफ़्त में पाएं</span>
          </p>
        </div>

        {/* Benefits Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            What You'll Get / आपको क्या मिलेगा
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="text-3xl">🦠</div>
              <div>
                <h3 className="font-semibold text-gray-900">HPAI Alerts</h3>
                <p className="text-gray-600">48 hours before public news</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="text-3xl">📱</div>
              <div>
                <h3 className="font-semibold text-gray-900">WhatsApp Delivery</h3>
                <p className="text-gray-600">Instant alerts on your phone</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="text-3xl">🆓</div>
              <div>
                <h3 className="font-semibold text-gray-900">100% Free</h3>
                <p className="text-gray-600">No subscription required</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="text-3xl">🎯</div>
              <div>
                <h3 className="font-semibold text-gray-900">District-Specific</h3>
                <p className="text-gray-600">Alerts relevant to your location</p>
              </div>
            </div>
          </div>
        </div>

        {/* Signup Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Subscribe Now / अभी subscribe करें
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number / फोन नंबर
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 XXXXX XXXXX"
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                District / जिला
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="gorakhpur">Gorakhpur / गोराखपुर</option>
                <option value="deoria">Deoria / देवरिया</option>
                <option value="kushinagar">Kushinagar / कुशीनगर</option>
                <option value="basti">Basti / बस्ती</option>
                <option value="maharajganj">Maharajganj / महाराजगंज</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Referral Code (Optional) / रेफर कोड (वैकल्पिक)
              </label>
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                placeholder="ABCD1234"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-lg text-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Subscribing...' : 'Subscribe Free / मुफ़्त subscribe करें'}
            </button>
          </form>
        </div>

        {/* Upgrade CTA */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl shadow-xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-4 text-center">
            Want More? / और चाहिए?
          </h3>
          <p className="text-center mb-6 text-green-100">
            Get 7-day price predictions with 95%+ accuracy
            <br />
            95%+ सटीकता के साथ 7 दिन का भाव अनुमान पाएं
          </p>
          <Link
            href="/signup"
            className="block w-full bg-white text-green-600 font-bold py-4 px-6 rounded-lg text-center text-lg hover:bg-green-50 transition-colors"
          >
            Start 14-Day Free Trial / 14 दिन मुफ़्त ट्रायल शुरू करें
          </Link>
        </div>

        {/* Info */}
        <div className="mt-8 text-center text-gray-600 text-sm">
          <p className="mb-2">
            <strong>Why disease alerts matter:</strong> HPAI can cause ₹3-5 lakh losses if transport gets blocked. 
            Early alerts give you time to sell before restrictions.
          </p>
          <p>
            <strong>क्यों disease alerts ज़रूरी हैं:</strong> HPAI से ₹3-5 लाख का नुकसान हो सकता है अगर transport बंद हो जाए। 
            Early alerts आपको sell करने का समय देते हैं।
          </p>
        </div>
      </div>
    </div>
  )
}
