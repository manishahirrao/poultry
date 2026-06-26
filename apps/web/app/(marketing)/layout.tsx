import { AnnouncementBar } from '@/components/marketing/nav/AnnouncementBar';
import { Navbar } from '@/components/marketing/nav/Navbar';
import Footer from '@/components/layout/Footer';
import { PopupProvider } from '@/providers/PopupProvider';
import { LanguageProvider } from '@/providers/LanguageProvider';
import PostHogProvider from '@/providers/PostHogProvider';
import { generateOrganizationSchema } from '@/lib/seo/schemas';
import dynamic from 'next/dynamic';

// Lazy load non-critical popups to improve initial page load
const ExitIntentPopup = dynamic(() => import('@/components/popups/ExitIntentPopup'));
const DemoModal = dynamic(() => import('@/components/popups/DemoModal'));
const WaitlistPopup = dynamic(() => import('@/components/popups/WaitlistPopup'));
const CookieConsentBanner = dynamic(() => import('@/components/analytics/CookieConsentBanner'));

// Organization JSON-LD Schema - applies to all marketing pages
// Task Reference: TASK-WEB-022
// Requirement Refs: GWEB-003
const organizationSchema = generateOrganizationSchema();

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LanguageProvider>
      <PostHogProvider>
        <PopupProvider>
          {/* Organization JSON-LD Schema */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
          />
          <AnnouncementBar />
          <Navbar />
          <main id="main-content" className="min-h-screen">
            {children}
          </main>
          <Footer />
          {/* Max 2 popups active globally — ExitIntent + Waitlist.
              DemoModal and FreeTrialPopup are mounted per-page (pricing, features) only.
              BlogScrollPopup is mounted inside the blog layout, not here. */}
          <ExitIntentPopup />
          <WaitlistPopup />
          <CookieConsentBanner />
        </PopupProvider>
      </PostHogProvider>
    </LanguageProvider>
  );
}
