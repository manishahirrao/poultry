'use client';

import { useState, useRef, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendUp, TrendDown, Minus, Download, Calendar, ArrowUUpRight } from '@phosphor-icons/react';

type MandiSlug = 'gorakhpur' | 'deoria' | 'kushinagar' | 'basti' | 'maharajganj' | 'sant_kabir_nagar';

interface PriceData {
  date: string;
  price: number;
}

interface PriceTrendsResponse {
  mandi: MandiSlug;
  days: number;
  data: PriceData[];
  metrics: {
    avgPrice: number;
    minPrice: number;
    maxPrice: number;
    volatility: number;
  };
}

const MANDI_NAMES: Record<MandiSlug, { hi: string; en: string }> = {
  gorakhpur: { hi: 'गोरखपुर', en: 'Gorakhpur' },
  deoria: { hi: 'देवरिया', en: 'Deoria' },
  kushinagar: { hi: 'कुशीनगर', en: 'Kushinagar' },
  basti: { hi: 'बस्ती', en: 'Basti' },
  maharajganj: { hi: 'महाराजगंज', en: 'Maharajganj' },
  sant_kabir_nagar: { hi: 'संत कबीर नगर', en: 'Sant Kabir Nagar' },
};

export default function PriceTrendsVisualizer() {
  const [selectedMandi, setSelectedMandi] = useState<MandiSlug>('gorakhpur');
  const [selectedDays, setSelectedDays] = useState(30);
  const [language, setLanguage] = useState<'hi' | 'en'>('en');
  const [priceData, setPriceData] = useState<PriceTrendsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  const fetchPriceData = async (mandi: MandiSlug, days: number) => {
    setLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const response = await fetch(`${baseUrl}/api/public/price-trends?mandi=${mandi}&days=${days}`);
      const data = await response.json();
      setPriceData(data);
    } catch (error) {
      console.error('Error fetching price data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMandiChange = (mandi: MandiSlug) => {
    setSelectedMandi(mandi);
    fetchPriceData(mandi, selectedDays);
  };

  const handleDaysChange = (days: number) => {
    // Check if user is trying to access extended views (60/90 days)
    if (days > 30 && !showLeadModal) {
      setShowLeadModal(true);
      return;
    }
    setSelectedDays(days);
    fetchPriceData(selectedMandi, days);
  };

  const handleLeadCapture = async (email: string) => {
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          source: 'price-trends-tool',
          mandi: selectedMandi,
          metadata: {
            requestedDays: selectedDays === 30 ? 60 : selectedDays,
          },
        }),
      });

      if (response.ok) {
        setShowLeadModal(false);
        setSelectedDays(selectedDays === 30 ? 60 : selectedDays);
        fetchPriceData(selectedMandi, selectedDays === 30 ? 60 : selectedDays);
      } else {
        console.error('Failed to capture lead');
      }
    } catch (error) {
      console.error('Error capturing lead:', error);
    }
  };

  const handleExport = () => {
    if (!priceData) return;
    
    // Export as CSV
    const csvContent = [
      ['Date', 'Price (₹/kg)'],
      ...priceData.data.map(d => [d.date, d.price])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `price-trends-${selectedMandi}-${selectedDays}days.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Fetch initial data
  useEffect(() => {
    fetchPriceData(selectedMandi, selectedDays);
  }, []);

  const t = {
    hi: {
      title: 'ब्रॉयलर भाव रुझान',
      subtitle: 'गोरखपुर बेल्ट के लिए ऐतिहासिक मूल्य डेटा',
      selectDistrict: 'जिला चुनें',
      selectDays: 'समय अवधि चुनें',
      avgPrice: 'औसत मूल्य',
      priceRange: 'मूल्य सीमा',
      volatility: 'अस्थिरता',
      export: 'एक्सपोर्ट करें',
      days30: '30 दिन',
      days60: '60 दिन',
      days90: '90 दिन',
      unlockExtended: 'विस्तारित डेटा अनलॉक करें',
      leadModalTitle: '90-दिन का भाव रुझान प्राप्त करें',
      leadModalSubtitle: 'अपना ईमेल डालें और विस्तारित ऐतिहासिक डेटा तक पहुंचें',
      emailPlaceholder: 'आपका ईमेल',
      submit: 'अनलॉक करें',
      rupee: '₹',
      perKg: '/किग्रा',
    },
    en: {
      title: 'Broiler Price Trends',
      subtitle: 'Historical price data for Gorakhpur belt',
      selectDistrict: 'Select District',
      selectDays: 'Select Time Range',
      avgPrice: 'Average Price',
      priceRange: 'Price Range',
      volatility: 'Volatility',
      export: 'Export',
      days30: '30 Days',
      days60: '60 Days',
      days90: '90 Days',
      unlockExtended: 'Unlock Extended Data',
      leadModalTitle: 'Get 90-Day Price Trends',
      leadModalSubtitle: 'Enter your email to access extended historical data',
      emailPlaceholder: 'Your email',
      submit: 'Unlock',
      rupee: '₹',
      perKg: '/kg',
    },
  };

  const text = t[language];

  return (
    <div className="min-h-screen bg-gradient-to-b from-brandGreen25 to-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{text.title}</h1>
          <p className="text-lg text-gray-600">{text.subtitle}</p>
          
          {/* Language Toggle */}
          <div className="mt-4 flex justify-center gap-2">
            <button
              onClick={() => setLanguage('hi')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                language === 'hi' 
                  ? 'bg-brandGreen text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              हिंदी
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                language === 'en' 
                  ? 'bg-brandGreen text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              English
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* District Selector */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {text.selectDistrict}
              </label>
              <select
                value={selectedMandi}
                onChange={(e) => handleMandiChange(e.target.value as MandiSlug)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brandGreen focus:border-transparent"
              >
                {Object.entries(MANDI_NAMES).map(([slug, names]) => (
                  <option key={slug} value={slug}>
                    {language === 'hi' ? names.hi : names.en}
                  </option>
                ))}
              </select>
            </div>

            {/* Time Range Selector */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {text.selectDays}
              </label>
              <div className="flex gap-2">
                {[30, 60, 90].map((days) => (
                  <button
                    key={days}
                    onClick={() => handleDaysChange(days)}
                    className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-colors ${
                      selectedDays === days
                        ? 'bg-brandGreen text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {language === 'hi' ? `${days} दिन` : `${days} Days`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Metrics Cards */}
        {priceData && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <MetricCard
              title={text.avgPrice}
              value={`${text.rupee}${priceData.metrics.avgPrice}${text.perKg}`}
              icon={<Calendar className="w-6 h-6" />}
            />
            <MetricCard
              title={text.priceRange}
              value={`${text.rupee}${priceData.metrics.minPrice} - ${text.rupee}${priceData.metrics.maxPrice}${text.perKg}`}
              icon={<TrendUp className="w-6 h-6" />}
            />
            <MetricCard
              title={text.volatility}
              value={`${priceData.metrics.volatility}%`}
              icon={priceData.metrics.volatility > 5 ? <TrendUp className="w-6 h-6" /> : <Minus className="w-6 h-6" />}
            />
          </div>
        )}

        {/* Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {language === 'hi' ? MANDI_NAMES[selectedMandi].hi : MANDI_NAMES[selectedMandi].en}
            </h2>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Download className="w-5 h-5" />
              {text.export}
            </button>
          </div>

          {loading ? (
            <div className="h-[400px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brandGreen"></div>
            </div>
          ) : priceData ? (
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={priceData.data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', {
                        day: 'numeric',
                        month: 'short',
                      });
                    }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`₹${value}`, language === 'hi' ? 'भाव' : 'Price']}
                    labelFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      });
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#16a34a" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[400px] flex items-center justify-center text-gray-500">
              {language === 'hi' ? 'डेटा लोड हो रहा है...' : 'Loading data...'}
            </div>
          )}
        </div>

        {/* Lead Capture Modal */}
        {showLeadModal && (
          <LeadCaptureModal
            title={text.leadModalTitle}
            subtitle={text.leadModalSubtitle}
            emailPlaceholder={text.emailPlaceholder}
            submitText={text.submit}
            onSubmit={handleLeadCapture}
            onClose={() => setShowLeadModal(false)}
          />
        )}


      </div>
    </div>
  );
}

function MetricCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-2">
        <div className="text-brandGreen">{icon}</div>
        <span className="text-2xl font-bold text-gray-900">{value}</span>
      </div>
      <p className="text-sm text-gray-600">{title}</p>
    </div>
  );
}

function LeadCaptureModal({
  title,
  subtitle,
  emailPlaceholder,
  submitText,
  onSubmit,
  onClose,
}: {
  title: string;
  subtitle: string;
  emailPlaceholder: string;
  submitText: string;
  onSubmit: (email: string) => void;
  onClose: () => void;
}) {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{subtitle}</p>
        
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={emailPlaceholder}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brandGreen focus:border-transparent mb-4"
          />
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-brandGreen hover:bg-brandGreen600 text-white rounded-lg font-semibold transition-colors"
            >
              {submitText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
