// FlockIQ — Terms of Service Page
// File: apps/web/app/(legal)/terms/page.tsx
// Version: v3.0 | June 2026
// Task Reference: LEGAL-PAGES-001

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service — FlockIQ',
  description: 'FlockIQ Terms of Service. Read our terms and conditions for using the FlockIQ platform.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function TermsOfServicePage() {
  const lastUpdated = 'June 1, 2026';

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <p className="text-sm text-neutral500 mb-2">Last Updated: {lastUpdated}</p>
          <h1 className="font-sora font-extrabold text-4xl text-neutral900 mb-4">
            Terms of Service
          </h1>
          <p className="text-lg text-neutral700">
            These Terms of Service ("Terms") govern your use of the FlockIQ platform, services, and mobile application. By accessing or using FlockIQ, you agree to be bound by these Terms.
          </p>
        </div>

        {/* Table of Contents - Mobile */}
        <div className="lg:hidden mb-8 p-4 bg-neutral50 rounded-xl">
          <h2 className="font-sora font-semibold text-neutral900 mb-3">Table of Contents</h2>
          <ul className="space-y-2 text-sm">
            <li><a href="#section-1" className="text-brand-700 hover:underline">1. Acceptance of Terms</a></li>
            <li><a href="#section-2" className="text-brand-700 hover:underline">2. Description of Service</a></li>
            <li><a href="#section-3" className="text-brand-700 hover:underline">3. User Accounts</a></li>
            <li><a href="#section-4" className="text-brand-700 hover:underline">4. Subscription Plans and Payment</a></li>
            <li><a href="#section-5" className="text-brand-700 hover:underline">5. Accuracy Guarantee</a></li>
            <li><a href="#section-6" className="text-brand-700 hover:underline">6. User Responsibilities</a></li>
            <li><a href="#section-7" className="text-brand-700 hover:underline">7. Intellectual Property</a></li>
            <li><a href="#section-8" className="text-brand-700 hover:underline">8. Limitation of Liability</a></li>
            <li><a href="#section-9" className="text-brand-700 hover:underline">9. Termination</a></li>
            <li><a href="#section-10" className="text-brand-700 hover:underline">10. Dispute Resolution</a></li>
            <li><a href="#section-11" className="text-brand-700 hover:underline">11. Governing Law</a></li>
            <li><a href="#section-12" className="text-brand-700 hover:underline">12. Contact Us</a></li>
          </ul>
        </div>

        <div className="flex gap-12">
          {/* Sidebar Navigation - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-8 h-fit">
            <nav className="space-y-1">
              <a href="#section-1" className="block px-4 py-2 text-sm text-neutral700 hover:bg-neutral50 rounded-lg transition-colors">1. Acceptance of Terms</a>
              <a href="#section-2" className="block px-4 py-2 text-sm text-neutral700 hover:bg-neutral50 rounded-lg transition-colors">2. Description of Service</a>
              <a href="#section-3" className="block px-4 py-2 text-sm text-neutral700 hover:bg-neutral50 rounded-lg transition-colors">3. User Accounts</a>
              <a href="#section-4" className="block px-4 py-2 text-sm text-neutral700 hover:bg-neutral50 rounded-lg transition-colors">4. Subscription Plans and Payment</a>
              <a href="#section-5" className="block px-4 py-2 text-sm text-neutral700 hover:bg-neutral50 rounded-lg transition-colors">5. Accuracy Guarantee</a>
              <a href="#section-6" className="block px-4 py-2 text-sm text-neutral700 hover:bg-neutral50 rounded-lg transition-colors">6. User Responsibilities</a>
              <a href="#section-7" className="block px-4 py-2 text-sm text-neutral700 hover:bg-neutral50 rounded-lg transition-colors">7. Intellectual Property</a>
              <a href="#section-8" className="block px-4 py-2 text-sm text-neutral700 hover:bg-neutral50 rounded-lg transition-colors">8. Limitation of Liability</a>
              <a href="#section-9" className="block px-4 py-2 text-sm text-neutral700 hover:bg-neutral50 rounded-lg transition-colors">9. Termination</a>
              <a href="#section-10" className="block px-4 py-2 text-sm text-neutral700 hover:bg-neutral50 rounded-lg transition-colors">10. Dispute Resolution</a>
              <a href="#section-11" className="block px-4 py-2 text-sm text-neutral700 hover:bg-neutral50 rounded-lg transition-colors">11. Governing Law</a>
              <a href="#section-12" className="block px-4 py-2 text-sm text-neutral700 hover:bg-neutral50 rounded-lg transition-colors">12. Contact Us</a>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <div className="prose prose-lg max-w-none">
              <section id="section-1" className="mb-12 scroll-mt-8">
                <h2 className="font-sora font-bold text-2xl text-neutral900 mb-4">1. Acceptance of Terms</h2>
                <p className="text-neutral700 mb-4">By accessing or using FlockIQ, you acknowledge that you have read, understood, and agree to be bound by these Terms. If you do not agree to these Terms, you may not use our service.</p>
                <p className="text-neutral700">FlockIQ reserves the right to modify these Terms at any time. Continued use of the service after modifications constitutes acceptance of the updated Terms.</p>
              </section>

              <section id="section-2" className="mb-12 scroll-mt-8">
                <h2 className="font-sora font-bold text-2xl text-neutral900 mb-4">2. Description of Service</h2>
                <p className="text-neutral700 mb-4">FlockIQ provides an AI-powered poultry management platform that includes:</p>
                <ul className="list-disc pl-6 space-y-2 text-neutral700">
                  <li>Broiler price forecasting (7-day predictions)</li>
                  <li>Daily WhatsApp sell signals</li>
                  <li>Farm management tools (feed logs, mortality tracking, batch P&L)</li>
                  <li>Medication withdrawal period alerts</li>
                  <li>Breed-matched benchmarking</li>
                  <li>Disease risk scoring</li>
                </ul>
                <p className="text-neutral700 mt-4">The service is provided "as is" and may include features in beta or preview mode.</p>
              </section>

              <section id="section-3" className="mb-12 scroll-mt-8">
                <h2 className="font-sora font-bold text-2xl text-neutral900 mb-4">3. User Accounts</h2>
                <p className="text-neutral700 mb-4">To use FlockIQ, you must create an account and provide accurate information. You are responsible for:</p>
                <ul className="list-disc pl-6 space-y-2 text-neutral700">
                  <li>Maintaining the confidentiality of your account credentials</li>
                  <li>All activities that occur under your account</li>
                  <li>Notifying us immediately of unauthorized access</li>
                  <li>Providing accurate and complete information</li>
                </ul>
                <p className="text-neutral700 mt-4">You must be at least 18 years old to create an account. By creating an account, you represent that you meet this requirement.</p>
              </section>

              <section id="section-4" className="mb-12 scroll-mt-8">
                <h2 className="font-sora font-bold text-2xl text-neutral900 mb-4">4. Subscription Plans and Payment</h2>
                <p className="text-neutral700 mb-4">FlockIQ offers the following subscription plans:</p>
                <ul className="list-disc pl-6 space-y-2 text-neutral700">
                  <li><strong>PulseFarm:</strong> ₹2,000/month - Basic features for individual farmers</li>
                  <li><strong>PulsePro:</strong> ₹8,000/month - Advanced features for multi-farm operations</li>
                  <li><strong>PulseEnterprise:</strong> Custom pricing - Enterprise solutions</li>
                </ul>
                <p className="text-neutral700 mt-4 mb-4">Payment terms:</p>
                <ul className="list-disc pl-6 space-y-2 text-neutral700">
                  <li>Monthly billing unless annual plan is selected</li>
                  <li>Payment via UPI, credit card, or bank transfer</li>
                  <li>14-day free trial for new users</li>
                  <li>No automatic charges after trial without explicit consent</li>
                  <li>Pro-rated refunds for mid-plan cancellations</li>
                </ul>
              </section>

              <section id="section-5" className="mb-12 scroll-mt-8">
                <h2 className="font-sora font-bold text-2xl text-neutral900 mb-4">5. Accuracy Guarantee</h2>
                <p className="text-neutral700 mb-4">FlockIQ guarantees 95%+ directional accuracy on price forecasts. If our rolling 30-day directional accuracy drops below 95%, you will receive that month's subscription free. This refund is automatic and requires no claim.</p>
                <p className="text-neutral700">Accuracy is measured as the percentage of correct directional predictions (price up vs. down) over a 30-day rolling period. Detailed methodology is available on our public accuracy dashboard.</p>
              </section>

              <section id="section-6" className="mb-12 scroll-mt-8">
                <h2 className="font-sora font-bold text-2xl text-neutral900 mb-4">6. User Responsibilities</h2>
                <p className="text-neutral700 mb-4">As a user of FlockIQ, you agree to:</p>
                <ul className="list-disc pl-6 space-y-2 text-neutral700">
                  <li>Use the service for lawful purposes only</li>
                  <li>Not attempt to reverse-engineer or compromise our systems</li>
                  <li>Not share your account credentials with others</li>
                  <li>Provide accurate farm data for accurate predictions</li>
                  <li>Not use the service for any illegal or unauthorized purpose</li>
                  <li>Comply with all applicable laws and regulations</li>
                </ul>
              </section>

              <section id="section-7" className="mb-12 scroll-mt-8">
                <h2 className="font-sora font-bold text-2xl text-neutral900 mb-4">7. Intellectual Property</h2>
                <p className="text-neutral700 mb-4">All content, features, and functionality of FlockIQ are owned by FlockIQ Technologies Pvt. Ltd. and are protected by intellectual property laws.</p>
                <ul className="list-disc pl-6 space-y-2 text-neutral700">
                  <li>You may not copy, modify, or distribute our proprietary algorithms</li>
                  <li>You may not use our trademarks without permission</li>
                  <li>Your farm data remains your property</li>
                  <li>We retain rights to anonymized data for model improvement</li>
                </ul>
              </section>

              <section id="section-8" className="mb-12 scroll-mt-8">
                <h2 className="font-sora font-bold text-2xl text-neutral900 mb-4">8. Limitation of Liability</h2>
                <p className="text-neutral700 mb-4">To the maximum extent permitted by law, FlockIQ shall not be liable for:</p>
                <ul className="list-disc pl-6 space-y-2 text-neutral700">
                  <li>Any indirect, incidental, special, or consequential damages</li>
                  <li>Loss of profits, revenue, or business opportunities</li>
                  <li>Decisions made based on our price forecasts</li>
                  <li>Service interruptions or downtime</li>
                </ul>
                <p className="text-neutral700 mt-4">Our total liability is limited to the amount you paid for the service in the 12 months preceding the claim.</p>
              </section>

              <section id="section-9" className="mb-12 scroll-mt-8">
                <h2 className="font-sora font-bold text-2xl text-neutral900 mb-4">9. Termination</h2>
                <p className="text-neutral700 mb-4">Either party may terminate these Terms at any time:</p>
                <ul className="list-disc pl-6 space-y-2 text-neutral700">
                  <li><strong>By You:</strong> Cancel your subscription at any time through the app or by contacting support</li>
                  <li><strong>By FlockIQ:</strong> If you violate these Terms or engage in fraudulent activity</li>
                </ul>
                <p className="text-neutral700 mt-4">Upon termination, your account will be deactivated and your data will be retained per our data retention policy.</p>
              </section>

              <section id="section-10" className="mb-12 scroll-mt-8">
                <h2 className="font-sora font-bold text-2xl text-neutral900 mb-4">10. Dispute Resolution</h2>
                <p className="text-neutral700 mb-4">Any disputes arising from these Terms shall be resolved through:</p>
                <ul className="list-disc pl-6 space-y-2 text-neutral700">
                  <li>Good faith negotiation between the parties</li>
                  <li>Mediation if negotiation fails</li>
                  <li>Arbitration in Gorakhpur, Uttar Pradesh as a final resort</li>
                </ul>
              </section>

              <section id="section-11" className="mb-12 scroll-mt-8">
                <h2 className="font-sora font-bold text-2xl text-neutral900 mb-4">11. Governing Law</h2>
                <p className="text-neutral700">These Terms are governed by the laws of India, specifically the state of Uttar Pradesh. Any legal proceedings shall be conducted in the courts of Gorakhpur, Uttar Pradesh.</p>
              </section>

              <section id="section-12" className="mb-12 scroll-mt-8">
                <h2 className="font-sora font-bold text-2xl text-neutral900 mb-4">12. Contact Us</h2>
                <p className="text-neutral700 mb-4">For questions about these Terms, contact us:</p>
                <div className="bg-neutral50 rounded-xl p-6">
                  <p className="text-neutral700 mb-2"><strong>Email:</strong> legal@flockiq.com</p>
                  <p className="text-neutral700 mb-2"><strong>Address:</strong> FlockIQ Technologies Pvt. Ltd., Gorakhpur, Uttar Pradesh, India</p>
                  <p className="text-neutral700"><strong>Phone:</strong> +91-XXXXXXXXXX</p>
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
