// FlockIQ — Privacy Policy Page
// File: apps/web/app/(legal)/privacy/page.tsx
// Version: v3.0 | June 2026
// Task Reference: LEGAL-PAGES-001

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — FlockIQ',
  description: 'FlockIQ Privacy Policy compliant with DPDP Act 2023. Learn how we collect, use, and protect your personal data.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function PrivacyPolicyPage() {
  const lastUpdated = 'June 1, 2026';

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <p className="text-sm text-neutral500 mb-2">Last Updated: {lastUpdated}</p>
          <h1 className="font-sora font-extrabold text-4xl text-neutral900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-neutral700">
            FlockIQ Technologies Pvt. Ltd. ("FlockIQ," "we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and protect your personal data in compliance with the Digital Personal Data Protection Act, 2023 (DPDP Act 2023) of India.
          </p>
        </div>

        {/* Table of Contents - Mobile */}
        <div className="lg:hidden mb-8 p-4 bg-neutral50 rounded-xl">
          <h2 className="font-sora font-semibold text-neutral900 mb-3">Table of Contents</h2>
          <ul className="space-y-2 text-sm">
            <li><a href="#section-1" className="text-brand-700 hover:underline">1. Information We Collect</a></li>
            <li><a href="#section-2" className="text-brand-700 hover:underline">2. How We Use Your Information</a></li>
            <li><a href="#section-3" className="text-brand-700 hover:underline">3. Data Sharing and Disclosure</a></li>
            <li><a href="#section-4" className="text-brand-700 hover:underline">4. Data Security</a></li>
            <li><a href="#section-5" className="text-brand-700 hover:underline">5. Your Rights Under DPDP Act 2023</a></li>
            <li><a href="#section-6" className="text-brand-700 hover:underline">6. Data Retention</a></li>
            <li><a href="#section-7" className="text-brand-700 hover:underline">7. International Data Transfers</a></li>
            <li><a href="#section-8" className="text-brand-700 hover:underline">8. Children's Privacy</a></li>
            <li><a href="#section-9" className="text-brand-700 hover:underline">9. Changes to This Policy</a></li>
            <li><a href="#section-10" className="text-brand-700 hover:underline">10. Contact Us</a></li>
          </ul>
        </div>

        <div className="flex gap-12">
          {/* Sidebar Navigation - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-8 h-fit">
            <nav className="space-y-1">
              <a href="#section-1" className="block px-4 py-2 text-sm text-neutral700 hover:bg-neutral50 rounded-lg transition-colors">1. Information We Collect</a>
              <a href="#section-2" className="block px-4 py-2 text-sm text-neutral700 hover:bg-neutral50 rounded-lg transition-colors">2. How We Use Your Information</a>
              <a href="#section-3" className="block px-4 py-2 text-sm text-neutral700 hover:bg-neutral50 rounded-lg transition-colors">3. Data Sharing and Disclosure</a>
              <a href="#section-4" className="block px-4 py-2 text-sm text-neutral700 hover:bg-neutral50 rounded-lg transition-colors">4. Data Security</a>
              <a href="#section-5" className="block px-4 py-2 text-sm text-neutral700 hover:bg-neutral50 rounded-lg transition-colors">5. Your Rights Under DPDP Act 2023</a>
              <a href="#section-6" className="block px-4 py-2 text-sm text-neutral700 hover:bg-neutral50 rounded-lg transition-colors">6. Data Retention</a>
              <a href="#section-7" className="block px-4 py-2 text-sm text-neutral700 hover:bg-neutral50 rounded-lg transition-colors">7. International Data Transfers</a>
              <a href="#section-8" className="block px-4 py-2 text-sm text-neutral700 hover:bg-neutral50 rounded-lg transition-colors">8. Children's Privacy</a>
              <a href="#section-9" className="block px-4 py-2 text-sm text-neutral700 hover:bg-neutral50 rounded-lg transition-colors">9. Changes to This Policy</a>
              <a href="#section-10" className="block px-4 py-2 text-sm text-neutral700 hover:bg-neutral50 rounded-lg transition-colors">10. Contact Us</a>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <div className="prose prose-lg max-w-none">
              <section id="section-1" className="mb-12 scroll-mt-8">
                <h2 className="font-sora font-bold text-2xl text-neutral900 mb-4">1. Information We Collect</h2>
                <p className="text-neutral700 mb-4">We collect the following types of personal data:</p>
                <ul className="list-disc pl-6 space-y-2 text-neutral700">
                  <li><strong>Personal Information:</strong> Mobile number, name, and farm profile details (farm location, flock size, breed type)</li>
                  <li><strong>Usage Data:</strong> App usage patterns, WhatsApp interactions, forecast access logs</li>
                  <li><strong>Technical Data:</strong> Device information, IP address, browser type, operating system</li>
                  <li><strong>Farm Data:</strong> Daily feed logs, mortality records, weight measurements, medication treatments, harvest data</li>
                </ul>
                <p className="text-neutral700 mt-4">We collect this data directly from you when you register for our service, use our mobile app, or communicate with us via WhatsApp.</p>
              </section>

              <section id="section-2" className="mb-12 scroll-mt-8">
                <h2 className="font-sora font-bold text-2xl text-neutral900 mb-4">2. How We Use Your Information</h2>
                <p className="text-neutral700 mb-4">We use your personal data for the following purposes:</p>
                <ul className="list-disc pl-6 space-y-2 text-neutral700">
                  <li><strong>Service Delivery:</strong> To provide price forecasts, WhatsApp sell signals, and farm management features</li>
                  <li><strong>Accuracy Improvement:</strong> To train and improve our AI models using anonymized data</li>
                  <li><strong>Account Management:</strong> To manage your account, process payments, and provide customer support</li>
                  <li><strong>Communication:</strong> To send you service updates, accuracy reports, and relevant agricultural information</li>
                  <li><strong>Compliance:</strong> To comply with legal obligations and regulatory requirements</li>
                </ul>
              </section>

              <section id="section-3" className="mb-12 scroll-mt-8">
                <h2 className="font-sora font-bold text-2xl text-neutral900 mb-4">3. Data Sharing and Disclosure</h2>
                <p className="text-neutral700 mb-4">We do not sell your personal data to third parties. We may share your data only in the following circumstances:</p>
                <ul className="list-disc pl-6 space-y-2 text-neutral700">
                  <li><strong>Service Providers:</strong> With trusted third-party service providers who assist in operating our platform (e.g., cloud hosting, payment processing, WhatsApp Business API)</li>
                  <li><strong>Legal Requirements:</strong> When required by law, court order, or government authority</li>
                  <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                  <li><strong>With Your Consent:</strong> When you explicitly consent to the sharing</li>
                </ul>
                <p className="text-neutral700 mt-4">All third-party service providers are contractually bound to protect your data and use it only for the specified purposes.</p>
              </section>

              <section id="section-4" className="mb-12 scroll-mt-8">
                <h2 className="font-sora font-bold text-2xl text-neutral900 mb-4">4. Data Security</h2>
                <p className="text-neutral700 mb-4">We implement robust security measures to protect your personal data:</p>
                <ul className="list-disc pl-6 space-y-2 text-neutral700">
                  <li><strong>Encryption:</strong> All data is encrypted in transit (TLS 1.3) and at rest (AES-256)</li>
                  <li><strong>Storage:</strong> Data is stored on Supabase (AWS ap-south-1, Mumbai region) within India</li>
                  <li><strong>Access Control:</strong> Strict access controls and authentication mechanisms</li>
                  <li><strong>Regular Audits:</strong> Regular security audits and vulnerability assessments</li>
                </ul>
                <p className="text-neutral700 mt-4">Despite our best efforts, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security.</p>
              </section>

              <section id="section-5" className="mb-12 scroll-mt-8">
                <h2 className="font-sora font-bold text-2xl text-neutral900 mb-4">5. Your Rights Under DPDP Act 2023</h2>
                <p className="text-neutral700 mb-4">Under the DPDP Act 2023, you have the following rights:</p>
                <ul className="list-disc pl-6 space-y-2 text-neutral700">
                  <li><strong>Right to Access:</strong> Request access to your personal data</li>
                  <li><strong>Right to Correction:</strong> Request correction of inaccurate or incomplete data</li>
                  <li><strong>Right to Erasure:</strong> Request deletion of your personal data</li>
                  <li><strong>Right to Data Portability:</strong> Request transfer of your data to another controller</li>
                  <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time</li>
                  <li><strong>Right to Grievance Redressal:</strong> File a complaint with us or the Data Protection Board of India</li>
                </ul>
                <p className="text-neutral700 mt-4">To exercise these rights, contact us at privacy@flockiq.com. We will respond within 30 days.</p>
              </section>

              <section id="section-6" className="mb-12 scroll-mt-8">
                <h2 className="font-sora font-bold text-2xl text-neutral900 mb-4">6. Data Retention</h2>
                <p className="text-neutral700 mb-4">We retain your personal data for the following periods:</p>
                <ul className="list-disc pl-6 space-y-2 text-neutral700">
                  <li><strong>Account Data:</strong> Retained while your account is active and for 3 years after account closure</li>
                  <li><strong>Farm Data:</strong> Retained for 7 years to support accuracy tracking and regulatory compliance</li>
                  <li><strong>Transaction Data:</strong> Retained for 7 years for tax and regulatory purposes</li>
                  <li><strong>Analytics Data:</strong> Retained for 2 years in anonymized form</li>
                </ul>
                <p className="text-neutral700 mt-4">After the retention period, data is securely deleted or anonymized.</p>
              </section>

              <section id="section-7" className="mb-12 scroll-mt-8">
                <h2 className="font-sora font-bold text-2xl text-neutral900 mb-4">7. International Data Transfers</h2>
                <p className="text-neutral700 mb-4">Your data is primarily stored within India in compliance with DPDP Act 2023. We may transfer data internationally only:</p>
                <ul className="list-disc pl-6 space-y-2 text-neutral700">
                  <li>To countries with adequate data protection laws as recognized by the Government of India</li>
                  <li>With appropriate safeguards (standard contractual clauses or binding corporate rules)</li>
                  <li>With your explicit consent</li>
                </ul>
              </section>

              <section id="section-8" className="mb-12 scroll-mt-8">
                <h2 className="font-sora font-bold text-2xl text-neutral900 mb-4">8. Children's Privacy</h2>
                <p className="text-neutral700">Our service is not intended for children under the age of 18. We do not knowingly collect personal data from children. If we become aware that we have collected data from a child, we will take steps to delete it immediately.</p>
              </section>

              <section id="section-9" className="mb-12 scroll-mt-8">
                <h2 className="font-sora font-bold text-2xl text-neutral900 mb-4">9. Changes to This Policy</h2>
                <p className="text-neutral700 mb-4">We may update this Privacy Policy from time to time. We will notify you of significant changes by:</p>
                <ul className="list-disc pl-6 space-y-2 text-neutral700">
                  <li>Emailing you at your registered email address</li>
                  <li>Posting a notice in our mobile app</li>
                  <li>Sending a WhatsApp message</li>
                </ul>
                <p className="text-neutral700 mt-4">Your continued use of our service after changes constitutes acceptance of the updated policy.</p>
              </section>

              <section id="section-10" className="mb-12 scroll-mt-8">
                <h2 className="font-sora font-bold text-2xl text-neutral900 mb-4">10. Contact Us</h2>
                <p className="text-neutral700 mb-4">If you have questions about this Privacy Policy or your data rights, contact us:</p>
                <div className="bg-neutral50 rounded-xl p-6">
                  <p className="text-neutral700 mb-2"><strong>Email:</strong> privacy@flockiq.com</p>
                  <p className="text-neutral700 mb-2"><strong>Address:</strong> FlockIQ Technologies Pvt. Ltd., Gorakhpur, Uttar Pradesh, India</p>
                  <p className="text-neutral700"><strong>Grievance Officer:</strong> Designated as per DPDP Act 2023</p>
                </div>
                <p className="text-neutral700 mt-4">For DPDP-related grievances, you may also contact the Data Protection Board of India.</p>
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
