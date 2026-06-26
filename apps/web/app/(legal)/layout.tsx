// FlockIQ — Legal Pages Layout
// File: apps/web/app/(legal)/layout.tsx

import { AnnouncementBar } from '@/components/marketing/nav/AnnouncementBar';
import { Navbar } from '@/components/marketing/nav/Navbar';
import Footer from '@/components/layout/Footer';
import { LanguageProvider } from '@/providers/LanguageProvider';
import PostHogProvider from '@/providers/PostHogProvider';
import { PopupProvider } from '@/providers/PopupProvider';

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LanguageProvider>
      <PostHogProvider>
        <PopupProvider>
          <AnnouncementBar />
          <Navbar />
          <main id="main-content">
            {children}
          </main>
          <Footer />
        </PopupProvider>
      </PostHogProvider>
    </LanguageProvider>
  );
}
