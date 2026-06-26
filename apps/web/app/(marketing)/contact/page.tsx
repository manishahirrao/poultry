// FlockIQ — Contact Page (v3.0)
// File: apps/web/app/(marketing)/contact/page.tsx
// Version: v3.0 | June 2026
// Task Reference: CONTENT-PAGE-007
// Design Reference: FlockIQ_PreLogin_Design_Master_v3.md §PAGE 08
// Requirements Reference: FlockIQ_PreLogin_Requirements_v3.md §FR-CONTACT-001

import { Metadata } from 'next';
import ContactPageClient from './ContactPageClient';
import ContactSchema from './ContactSchema';

export const metadata: Metadata = {
  title: 'Contact Us — Get in Touch | FlockIQ',
  description: 'Contact FlockIQ for support, sales inquiries, or partnership opportunities. Reach us via WhatsApp, email, or phone.',
  openGraph: {
    title: 'Contact Us — Get in Touch',
    description: 'Contact FlockIQ for support, sales inquiries, or partnership opportunities.',
    url: 'https://flockiq.com/contact',
  },
  alternates: {
    canonical: 'https://flockiq.com/contact',
    languages: {
      'hi-IN': 'https://flockiq.com/contact',
      'en-IN': 'https://flockiq.com/contact?lang=en',
      'x-default': 'https://flockiq.com/contact',
    },
  },
};

export default function ContactPage() {
  return (
    <>
      <ContactSchema />
      <ContactPageClient />
    </>
  );
}
