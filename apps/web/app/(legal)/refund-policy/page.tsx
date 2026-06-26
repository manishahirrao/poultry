// FlockIQ — Refund Policy Page
// File: apps/web/app/(legal)/refund-policy/page.tsx
// Version: v3.0 | June 2026
// Task Reference: LEGAL-PAGES-001

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Refund Policy — FlockIQ',
  description: 'FlockIQ Refund Policy. Learn about our accuracy guarantee and refund terms.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function RefundPolicyPage() {
  const lastUpdated = 'June 1, 2026';

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <p className="text-sm text-neutral500 mb-2">Last Updated: {lastUpdated}</p>
          <h1 className="font-sora font-extrabold text-4xl text-neutral900 mb-4">
            Refund Policy
          </h1>
          <p className="text-lg text-neutral700">
            FlockIQ stands behind the accuracy of our price forecasts. This Refund Policy outlines our accuracy guarantee and refund terms.
          </p>
        </div>

        {/* Table of Contents - Mobile */}
        <div className="lg:hidden mb-8 p-4 bg-neutral50 rounded-xl">
          <h2 className="font-sora font-semibold text-neutral900 mb-3">Table of Contents</h2>
          <ul className="space-y-2 text-sm">
            <li><a href="#section-1" className="text-brand-700 hover:underline">1. Accuracy Guarantee</a></li>
            <li><a href="#section-2" className="text-brand-700 hover:underline">2. How Accuracy is Measured</a></li>
            <li><a href="#section-3" className="text-brand-700 hover:underline">3. Automatic Refund Process</a></li>
            <li><a href="#section-4" className="text-brand-700 hover:underline">4. Other Refund Situations</a></li>
            <li><a href="#section-5" className="text-brand-700 hover:underline">5. Trial Period Refunds</a></li>
            <li><a href="#section-6" className="text-brand-700 hover:underline">6. Pro-rated Refunds</a></li>
            <li><a href="#section-7" className="text-brand-700 hover:underline">7. Refund Method</a></li>
            <li><a href="#section-8" className="text-brand-700 hover:underline">8. Contact Us</a></li>
          </ul>
        </div>

        <div className="flex gap-12">
          {/* Sidebar Navigation - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-8 h-fit">
            <nav className="space-y-1">
              <a href="#section-1" className="block px-4 py-2 text-sm text-neutral700 hover:bg-neutral50 rounded-lg transition-colors">1. Accuracy Guarantee</a>
              <a href="#section-2" className="block px-4 py-2 text-sm text-neutral700 hover:bg-neutral50 rounded-lg transition-colors">2. How Accuracy is Measured</a>
              <a href="#section-3" className="block px-4 py-2 text-sm text-neutral700 hover:bg-neutral50 rounded-lg transition-colors">3. Automatic Refund Process</a>
              <a href="#section-4" className="block px-4 py-2 text-sm text-neutral700 hover:bg-neutral50 rounded-lg transition-colors">4. Other Refund Situations</a>
              <a href="#section-5" className="block px-4 py-2 text-sm text-neutral700 hover:bg-neutral50 rounded-lg transition-colors">5. Trial Period Refunds</a>
              <a href="#section-6" className="block px-4 py-2 text-sm text-neutral700 hover:bg-neutral50 rounded-lg transition-colors">6. Pro-rated Refunds</a>
              <a href="#section-7" className="block px-4 py-2 text-sm text-neutral700 hover:bg-neutral50 rounded-lg transition-colors">7. Refund Method</a>
              <a href="#section-8" className="block px-4 py-2 text-sm text-neutral700 hover:bg-neutral50 rounded-lg transition-colors">8. Contact Us</a>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <div className="prose prose-lg max-w-none">
              <section id="section-1" className="mb-12 scroll-mt-8">
                <h2 className="font-sora font-bold text-2xl text-neutral900 mb-4">1. Accuracy Guarantee</h2>
                <div className="bg-brand-50 border-l-4 border-brand-700 p-6 rounded-r-xl mb-4">
                  <p className="font-sora font-semibold text-neutral900 mb-2">
                    Our Commitment
                  </p>
                  <p className="text-neutral700">
                    If our rolling 30-day directional accuracy drops below 95%, you get that month free. Automatically. No claim required.
                  </p>
                </div>
                <p className="text-neutral700 mb-4">This is a contractual commitment. The exact wording above matches our internal policy and is binding on FlockIQ Technologies Pvt. Ltd.</p>
                <p className="text-neutral700">This guarantee applies to all paid subscription plans (PulseFarm, PulsePro, PulseEnterprise) and covers all districts where FlockIQ provides price forecasts.</p>
              </section>

              <section id="section-2" className="mb-12 scroll-mt-8">
                <h2 className="font-sora font-bold text-2xl text-neutral900 mb-4">2. How Accuracy is Measured</h2>
                <p className="text-neutral700 mb-4">Directional accuracy is calculated as follows:</p>
                <ul className="list-disc pl-6 space-y-2 text-neutral700">
                  <li><strong>Directional Prediction:</strong> Whether the forecast correctly predicts price direction (up vs. down)</li>
                  <li><strong>Rolling 30-Day Window:</strong> Accuracy is calculated over the most recent 30 days of forecasts</li>
                  <li><strong>Daily Measurement:</strong> Each day's forecast is compared to the actual closing price</li>
                  <li><strong>Public Dashboard:</strong> Real-time accuracy metrics are displayed on our public /accuracy page</li>
                </ul>
                <p className="text-neutral700 mt-4">Example: If we make 30 directional predictions in a month and 28 are correct, accuracy is 93.3%. If this drops below 95%, you receive a full refund for that month.</p>
              </section>

              <section id="section-3" className="mb-12 scroll-mt-8">
                <h2 className="font-sora font-bold text-2xl text-neutral900 mb-4">3. Automatic Refund Process</h2>
                <p className="text-neutral700 mb-4">Refunds under the accuracy guarantee are processed automatically:</p>
                <ul className="list-disc pl-6 space-y-2 text-neutral700">
                  <li>Our system monitors accuracy daily</li>
                  <li>If rolling 30-day accuracy drops below 95%, a refund is triggered automatically</li>
                  <li>You will receive a WhatsApp and email notification of the refund</li>
                  <li>Refund is processed within 5 business days</li>
                  <li>No claim form or support ticket is required</li>
                </ul>
                <p className="text-neutral700 mt-4">This is a "no questions asked" guarantee. We do not require you to prove losses or demonstrate impact.</p>
              </section>

              <section id="section-4" className="mb-12 scroll-mt-8">
                <h2 className="font-sora font-bold text-2xl text-neutral900 mb-4">4. Other Refund Situations</h2>
                <p className="text-neutral700 mb-4">Beyond the accuracy guarantee, refunds may be available in the following situations:</p>
                <ul className="list-disc pl-6 space-y-2 text-neutral700">
                  <li><strong>Service Outage:</strong> If the service is unavailable for more than 48 consecutive hours, you may request a pro-rated refund for the affected period</li>
                  <li><strong>Billing Error:</strong> If you are incorrectly charged, we will refund the overcharge immediately</li>
                  <li><strong>Duplicate Charges:</strong> Any duplicate charges will be refunded within 24 hours</li>
                </ul>
                <p className="text-neutral700 mt-4">To request a refund for these situations, contact support@flockiq.com with your account details and the reason for the request.</p>
              </section>

              <section id="section-5" className="mb-12 scroll-mt-8">
                <h2 className="font-sora font-bold text-2xl text-neutral900 mb-4">5. Trial Period Refunds</h2>
                <p className="text-neutral700 mb-4">Our 14-day free trial includes:</p>
                <ul className="list-disc pl-6 space-y-2 text-neutral700">
                  <li>Full access to all features</li>
                  <li>No credit card required to start</li>
                  <li>No automatic charges after trial ends</li>
                  <li>Explicit consent required before any payment</li>
                </ul>
                <p className="text-neutral700 mt-4">Since the trial is free and requires no payment, no refunds are applicable during the trial period.</p>
              </section>

              <section id="section-6" className="mb-12 scroll-mt-8">
                <h2 className="font-sora font-bold text-2xl text-neutral900 mb-4">6. Pro-rated Refunds</h2>
                <p className="text-neutral700 mb-4">If you cancel your subscription mid-month:</p>
                <ul className="list-disc pl-6 space-y-2 text-neutral700">
                  <li>You will receive a pro-rated refund for unused days</li>
                  <li>Calculation: (Monthly fee / 30) × Remaining days in billing cycle</li>
                  <li>Refund is processed within 5 business days of cancellation</li>
                </ul>
                <p className="text-neutral700 mt-4">Example: If you cancel on day 15 of a ₹2,000/month plan, you receive ₹1,000 refund (₹2,000 ÷ 30 × 15 days).</p>
              </section>

              <section id="section-7" className="mb-12 scroll-mt-8">
                <h2 className="font-sora font-bold text-2xl text-neutral900 mb-4">7. Refund Method</h2>
                <p className="text-neutral700 mb-4">Refunds are processed using the original payment method:</p>
                <ul className="list-disc pl-6 space-y-2 text-neutral700">
                  <li><strong>UPI:</strong> Refunded to the original UPI ID</li>
                  <li><strong>Credit Card:</strong> Refunded to the original card (may take 5-7 business days to appear on statement)</li>
                  <li><strong>Bank Transfer:</strong> Refunded to the original bank account</li>
                </ul>
                <p className="text-neutral700 mt-4">If the original payment method is no longer available, we will contact you to arrange an alternative refund method.</p>
              </section>

              <section id="section-8" className="mb-12 scroll-mt-8">
                <h2 className="font-sora font-bold text-2xl text-neutral900 mb-4">8. Contact Us</h2>
                <p className="text-neutral700 mb-4">For questions about refunds or the accuracy guarantee, contact us:</p>
                <div className="bg-neutral50 rounded-xl p-6">
                  <p className="text-neutral700 mb-2"><strong>Email:</strong> support@flockiq.com</p>
                  <p className="text-neutral700 mb-2"><strong>WhatsApp:</strong> +91-XXXXXXXXXX</p>
                  <p className="text-neutral700"><strong>Address:</strong> FlockIQ Technologies Pvt. Ltd., Gorakhpur, Uttar Pradesh, India</p>
                </div>
                <p className="text-neutral700 mt-4">Refund requests are typically processed within 5 business days. For urgent matters, please contact us via WhatsApp.</p>
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
