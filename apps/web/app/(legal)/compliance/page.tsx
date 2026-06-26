// FlockIQ — Compliance Page
// File: apps/web/app/(legal)/compliance/page.tsx
// Version: v3.0 | June 2026
// Task Reference: LEGAL-PAGES-001

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Compliance — FlockIQ',
  description: 'FlockIQ compliance information including DPDP Act 2023, GDPR, FSSAI, HACCP, and international data protection standards.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CompliancePage() {
  const lastUpdated = 'June 1, 2026';

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <p className="text-sm text-neutral500 mb-2">Last Updated: {lastUpdated}</p>
          <h1 className="font-sora font-extrabold text-4xl text-neutral900 mb-4">
            Compliance Overview
          </h1>
          <p className="text-lg text-neutral700">
            FlockIQ is committed to full compliance with data protection laws, food safety regulations, and industry standards across all markets we serve.
          </p>
        </div>

        {/* Table of Contents - Mobile */}
        <div className="lg:hidden mb-8 p-4 bg-neutral50 rounded-xl">
          <h2 className="font-sora font-semibold text-neutral900 mb-3">Table of Contents</h2>
          <ul className="space-y-2 text-sm">
            <li><a href="#section-1" className="text-brand-700 hover:underline">1. DPDP Act 2023 (India)</a></li>
            <li><a href="#section-2" className="text-brand-700 hover:underline">2. GDPR Compatibility (EU)</a></li>
            <li><a href="#section-3" className="text-brand-700 hover:underline">3. Indonesia UU PDP</a></li>
            <li><a href="#section-4" className="text-brand-700 hover:underline">4. Vietnam Decree 13/2023</a></li>
            <li><a href="#section-5" className="text-brand-700 hover:underline">5. WhatsApp Business API ToS</a></li>
            <li><a href="#section-6" className="text-brand-700 hover:underline">6. FSSAI Compliance</a></li>
            <li><a href="#section-7" className="text-brand-700 hover:underline">7. HACCP Principles</a></li>
            <li><a href="#section-8" className="text-brand-700 hover:underline">8. Data Security Standards</a></li>
            <li><a href="#section-9" className="text-brand-700 hover:underline">9. Contact Us</a></li>
          </ul>
        </div>

        <div className="flex gap-12">
          {/* Sidebar Navigation - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-8 h-fit">
            <nav className="space-y-1">
              <a href="#section-1" className="block px-4 py-2 text-sm text-neutral700 hover:bg-neutral50 rounded-lg transition-colors">1. DPDP Act 2023 (India)</a>
              <a href="#section-2" className="block px-4 py-2 text-sm text-neutral700 hover:bg-neutral50 rounded-lg transition-colors">2. GDPR Compatibility (EU)</a>
              <a href="#section-3" className="block px-4 py-2 text-sm text-neutral700 hover:bg-neutral50 rounded-lg transition-colors">3. Indonesia UU PDP</a>
              <a href="#section-4" className="block px-4 py-2 text-sm text-neutral700 hover:bg-neutral50 rounded-lg transition-colors">4. Vietnam Decree 13/2023</a>
              <a href="#section-5" className="block px-4 py-2 text-sm text-neutral700 hover:bg-neutral50 rounded-lg transition-colors">5. WhatsApp Business API ToS</a>
              <a href="#section-6" className="block px-4 py-2 text-sm text-neutral700 hover:bg-neutral50 rounded-lg transition-colors">6. FSSAI Compliance</a>
              <a href="#section-7" className="block px-4 py-2 text-sm text-neutral700 hover:bg-neutral50 rounded-lg transition-colors">7. HACCP Principles</a>
              <a href="#section-8" className="block px-4 py-2 text-sm text-neutral700 hover:bg-neutral50 rounded-lg transition-colors">8. Data Security Standards</a>
              <a href="#section-9" className="block px-4 py-2 text-sm text-neutral700 hover:bg-neutral50 rounded-lg transition-colors">9. Contact Us</a>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <div className="prose prose-lg max-w-none">
              <section id="section-1" className="mb-12 scroll-mt-8">
                <h2 className="font-sora font-bold text-2xl text-neutral900 mb-4">1. DPDP Act 2023 (India)</h2>
                <p className="text-neutral700 mb-4">FlockIQ is fully compliant with the Digital Personal Data Protection Act, 2023 of India. Our compliance includes:</p>
                <ul className="list-disc pl-6 space-y-2 text-neutral700">
                  <li><strong>Data Principal Rights:</strong> Full implementation of all data principal rights (access, correction, erasure, portability, grievance redressal)</li>
                  <li><strong>Consent Management:</strong> Explicit, informed, and freely given consent for all data processing activities</li>
                  <li><strong>Data Fiduciary Obligations:</strong> We act as a Data Fiduciary with all statutory obligations</li>
                  <li><strong>Data Localization:</strong> All personal data is stored within India (AWS ap-south-1, Mumbai region)</li>
                  <li><strong>Grievance Officer:</strong> Designated Grievance Officer as required by DPDP Act 2023</li>
                  <li><strong>Consent Manager:</strong> Registered Consent Manager for verifiable consent tracking</li>
                </ul>
                <div className="bg-brand-50 border-l-4 border-brand-700 p-6 rounded-r-xl mt-4">
                  <p className="font-sora font-semibold text-neutral900 mb-2">Data Storage Location</p>
                  <p className="text-neutral700">All personal data is stored on Supabase (AWS ap-south-1, Mumbai region) within India, in full compliance with DPDP Act 2023 data localization requirements.</p>
                </div>
              </section>

              <section id="section-2" className="mb-12 scroll-mt-8">
                <h2 className="font-sora font-bold text-2xl text-neutral900 mb-4">2. GDPR Compatibility (EU)</h2>
                <p className="text-neutral700 mb-4">While FlockIQ primarily operates in India, our data handling practices are GDPR-compatible for EU users:</p>
                <ul className="list-disc pl-6 space-y-2 text-neutral700">
                  <li><strong>Lawful Basis:</strong> All processing has a lawful basis (consent, contract, legitimate interest)</li>
                  <li><strong>Data Minimization:</strong> We collect only data necessary for our services</li>
                  <li><strong>Purpose Limitation:</strong> Data is used only for stated purposes</li>
                  <li><strong>Security Measures:</strong> State-of-the-art encryption and access controls</li>
                  <li><strong>Data Subject Rights:</strong> All GDPR data subject rights are honored</li>
                  <li><strong>International Transfers:</strong> Data transfers use Standard Contractual Clauses (SCCs)</li>
                </ul>
                <p className="text-neutral700 mt-4">EU users can exercise GDPR rights by contacting privacy@flockiq.com. We respond within 30 days as required by GDPR.</p>
              </section>

              <section id="section-3" className="mb-12 scroll-mt-8">
                <h2 className="font-sora font-bold text-2xl text-neutral900 mb-4">3. Indonesia UU PDP</h2>
                <p className="text-neutral700 mb-4">For users in Indonesia, we comply with the Personal Data Protection Law (UU PDP):</p>
                <ul className="list-disc pl-6 space-y-2 text-neutral700">
                  <li><strong>Explicit Consent:</strong> Clear consent for all personal data processing</li>
                  <li><strong>Data Retention:</strong> Data retention periods aligned with Indonesian law</li>
                  <li><strong>Data Breach Notification:</strong> Prompt notification of any data breaches</li>
                  <li><strong>Cross-Border Transfers:</strong> Appropriate safeguards for international data transfers</li>
                  <li><strong>Data Subject Rights:</strong> Full implementation of data subject rights under UU PDP</li>
                </ul>
                <p className="text-neutral700 mt-4">Indonesian users can contact privacy@flockiq.com for UU PDP-related inquiries.</p>
              </section>

              <section id="section-4" className="mb-12 scroll-mt-8">
                <h2 className="font-sora font-bold text-2xl text-neutral900 mb-4">4. Vietnam Decree 13/2023</h2>
                <p className="text-neutral700 mb-4">For users in Vietnam, we comply with Decree 13/2023/ND-CP on Personal Data Protection:</p>
                <ul className="list-disc pl-6 space-y-2 text-neutral700">
                  <li><strong>Consent Requirements:</strong> Explicit consent for sensitive personal data</li>
                  <li><strong>Data Processing Purposes:</strong> Clear, specific, and lawful processing purposes</li>
                  <li><strong>Data Security:</strong> Technical and organizational security measures</li>
                  <li><strong>Data Transfer:</strong> Compliance with cross-border data transfer requirements</li>
                  <li><strong>Data Subject Rights:</strong> Rights to access, correct, and delete personal data</li>
                </ul>
                <p className="text-neutral700 mt-4">Vietnamese users can contact privacy@flockiq.com for Decree 13/2023-related inquiries.</p>
              </section>

              <section id="section-5" className="mb-12 scroll-mt-8">
                <h2 className="font-sora font-bold text-2xl text-neutral900 mb-4">5. WhatsApp Business API ToS</h2>
                <p className="text-neutral700 mb-4">FlockIQ uses the WhatsApp Business API and complies with Meta's Terms of Service:</p>
                <ul className="list-disc pl-6 space-y-2 text-neutral700">
                  <li><strong>Opt-in Consent:</strong> All users explicitly opt-in to receive WhatsApp messages</li>
                  <li><strong>Message Templates:</strong> Use of approved message templates for business-initiated messages</li>
                  <li><strong>Opt-out Mechanism:</strong> Clear opt-out mechanism (STOP keyword) available to all users</li>
                  <li><strong>Message Quality:</strong> High-quality, relevant messages with no spam or promotional abuse</li>
                  <li><strong>Rate Limits:</strong> Compliance with WhatsApp rate limits and messaging policies</li>
                  <li><strong>Data Privacy:</strong> No sharing of user data with Meta beyond what is required for API functionality</li>
                </ul>
                <p className="text-neutral700 mt-4">Users can opt out of WhatsApp messages at any time by replying "STOP" to any message or through the app settings.</p>
              </section>

              <section id="section-6" className="mb-12 scroll-mt-8">
                <h2 className="font-sora font-bold text-2xl text-neutral900 mb-4">6. FSSAI Compliance</h2>
                <p className="text-neutral700 mb-4">FlockIQ supports FSSAI (Food Safety and Standards Authority of India) compliance for poultry farmers:</p>
                <ul className="list-disc pl-6 space-y-2 text-neutral700">
                  <li><strong>Medication Tracking:</strong> Automated tracking of medication treatments and withdrawal periods</li>
                  <li><strong>Withdrawal Alerts:</strong> Alerts when medication withdrawal periods have not elapsed before sale</li>
                  <li><strong>Document Management:</strong> Storage of vaccination certificates, lab reports, and movement permits</li>
                  <li><strong>Traceability:</strong> FSSAI-compliant traceability exports for batch tracking</li>
                  <li><strong>Food Safety:</strong> Prevention of food safety violations through withdrawal period enforcement</li>
                </ul>
                <p className="text-neutral700 mt-4">Our medication withdrawal period alerts help farmers comply with FSSAI regulations and prevent food safety violations.</p>
              </section>

              <section id="section-7" className="mb-12 scroll-mt-8">
                <h2 className="font-sora font-bold text-2xl text-neutral900 mb-4">7. HACCP Principles</h2>
                <p className="text-neutral700 mb-4">FlockIQ incorporates HACCP (Hazard Analysis and Critical Control Points) principles:</p>
                <ul className="list-disc pl-6 space-y-2 text-neutral700">
                  <li><strong>Hazard Identification:</strong> Disease risk scoring identifies potential hazards</li>
                  <li><strong>Critical Control Points:</strong> Medication withdrawal periods are critical control points</li>
                  <li><strong>Monitoring:</strong> Daily monitoring of flock health and environmental conditions</li>
                  <li><strong>Corrective Actions:</strong> Alerts and recommendations for corrective actions</li>
                  <li><strong>Record Keeping:</strong> Comprehensive records for traceability and compliance</li>
                  <li><strong>Verification:</strong> Regular accuracy verification and system audits</li>
                </ul>
              </section>

              <section id="section-8" className="mb-12 scroll-mt-8">
                <h2 className="font-sora font-bold text-2xl text-neutral900 mb-4">8. Data Security Standards</h2>
                <p className="text-neutral700 mb-4">FlockIQ maintains enterprise-grade security standards:</p>
                <ul className="list-disc pl-6 space-y-2 text-neutral700">
                  <li><strong>Encryption:</strong> AES-256 encryption at rest, TLS 1.3 in transit</li>
                  <li><strong>Access Control:</strong> Role-based access control (RBAC) with least privilege</li>
                  <li><strong>Authentication:</strong> Multi-factor authentication for admin access</li>
                  <li><strong>Auditing:</strong> Comprehensive audit logs for all data access</li>
                  <li><strong>Penetration Testing:</strong> Regular security audits and penetration testing</li>
                  <li><strong>Vulnerability Management:</strong> Prompt patching of security vulnerabilities</li>
                </ul>
              </section>

              <section id="section-9" className="mb-12 scroll-mt-8">
                <h2 className="font-sora font-bold text-2xl text-neutral900 mb-4">9. Contact Us</h2>
                <p className="text-neutral700 mb-4">For compliance-related inquiries, contact us:</p>
                <div className="bg-neutral50 rounded-xl p-6">
                  <p className="text-neutral700 mb-2"><strong>Compliance Email:</strong> compliance@flockiq.com</p>
                  <p className="text-neutral700 mb-2"><strong>Privacy Email:</strong> privacy@flockiq.com</p>
                  <p className="text-neutral700 mb-2"><strong>Grievance Officer:</strong> grievance@flockiq.com</p>
                  <p className="text-neutral700"><strong>Address:</strong> FlockIQ Technologies Pvt. Ltd., Gorakhpur, Uttar Pradesh, India</p>
                </div>
                <p className="text-neutral700 mt-4">For DPDP-related grievances, you may also contact the Data Protection Board of India directly.</p>
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
