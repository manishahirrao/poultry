// FlockIQ — Navigation Component
// File: apps/web/components/nav/FloatingNav.tsx
// Version: v3.0 | June 2026
// Task Reference: TASK-WEB-001
// Requirements: Design Spec §2.1, GWEB-001
// Enhanced with Products/Solutions/Company/Resources dropdowns

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  List, 
  X,
  CaretDown,
  CheckCircle
} from '@phosphor-icons/react';
import { useViewTransition } from '@/components/animations/ViewTransition';
import { trackHeroCtaClicked } from '@/lib/posthog-analytics';

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [language, setLanguage] = useState<'hi' | 'en'>('en');
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { triggerTransition } = useViewTransition();

  // Load language preference from localStorage on mount
  useEffect(() => {
    const savedLang = localStorage.getItem('pp_lang') as 'hi' | 'en' | null;
    if (savedLang) {
      setLanguage(savedLang);
    }
    setMounted(true);
  }, []);

  // Persist language preference to localStorage
  const handleLanguageChange = (newLang: 'hi' | 'en') => {
    setLanguage(newLang);
    localStorage.setItem('pp_lang', newLang);
  };

  // Scroll-aware nav transition (transparent → frosted glass)
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // Handle navigation with view transition
  const handleNavigation = (href: string) => {
    triggerTransition(() => {
      router.push(href);
    });
  };

  // Main nav items (no dropdown)
  const mainNavItems = [
    { label: { hi: 'फीचर्स', en: 'Features' }, href: '/features' },
    { label: { hi: 'फार्म इंटेलिजेंस', en: 'Farm Intelligence' }, href: '/farm-intelligence' },
    { label: { hi: 'मूल्य निर्धारण', en: 'Pricing' }, href: '/pricing' },
    { label: { hi: 'सटीकता', en: 'Accuracy' }, href: '/accuracy' },
  ];

  // Products dropdown items
  const productsItems = [
    { 
      title: { hi: 'PulsePro', en: 'PulsePro' },
      subtitle: { hi: 'व्यावसायिक फार्मों के लिए (10K–50K पक्षी)', en: 'For commercial farms (10K–50K birds)' },
      price: '₹2,000–5,000/month · 14-day free trial',
      href: '/pricing'
    },
    { 
      title: { hi: 'PulseEnterprise', en: 'PulseEnterprise' },
      subtitle: { hi: 'इंटीग्रेटर, फीड कंपनियां और QSR के लिए', en: 'For integrators, feed companies & QSR' },
      price: 'Custom pricing · Demo required',
      href: '/demo'
    },
  ];

  // Solutions dropdown items
  const solutionsItems = [
    { label: { hi: 'फार्मों के लिए', en: 'For Farms' }, href: '/solutions/farms' },
    { label: { hi: 'व्यावसायिक फार्म (10K–50K)', en: 'Commercial Farms (10K–50K)' }, href: '/solutions/commercial-farms' },
    { label: { hi: 'इंटीग्रेटर (50K+)', en: 'Integrators (50K+)' }, href: '/solutions/integrators' },
    { label: { hi: 'फीड कंपनियां', en: 'Feed Companies' }, href: '/solutions/feed-companies' },
    { label: { hi: 'व्यापारी', en: 'For Traders' }, href: '/solutions/traders' },
    { label: { hi: 'एंटरप्राइज और QSR', en: 'Enterprise & QSR' }, href: '/solutions/enterprise' },
    { label: { hi: 'डेवलपर्स / API', en: 'Developers / API' }, href: '/developers' },
  ];

  // Company dropdown items
  const companyItems = [
    { label: { hi: 'हमारे बारे में', en: 'About Us' }, href: '/about' },
    { label: { hi: 'ब्लॉग', en: 'Blog' }, href: '/blog' },
    { label: { hi: 'केस स्टडीज', en: 'Case Studies' }, href: '/case-studies' },
    { label: { hi: 'प्रेस', en: 'Press' }, href: '/press' },
    { label: { hi: 'पार्टनर बनें', en: 'Partner With Us' }, href: '/partner-with-us' },
    { label: { hi: 'रेफर और कमाएं', en: 'Refer & Earn' }, href: '/refer' },
    { label: { hi: 'संपर्क', en: 'Contact' }, href: '/contact' },
    { label: { hi: 'डेमो बुक करें', en: 'Book Demo' }, href: '/demo' },
  ];

  // Resources dropdown items
  const resourcesItems = [
    { label: { hi: 'यह कैसे काम करता है', en: 'How It Works' }, href: '/how-it-works' },
    { label: { hi: 'मुफ्त बीमारी अलर्ट', en: 'Free Disease Alerts' }, href: '/free-disease-alerts' },
    { label: { hi: 'WhatsApp डेमो', en: 'WhatsApp Demo' }, href: '/try-whatsapp' },
    { label: { hi: 'नुकसान कैलकुलेटर', en: 'Loss Calculator' }, href: '/loss-calculator' },
    { label: { hi: 'FAQ', en: 'FAQ' }, href: '/faq' },
    { label: { hi: 'शब्दावली', en: 'Glossary' }, href: '/glossary' },
    { label: { hi: 'टेम्पलेट्स', en: 'Templates' }, href: '/templates' },
    { label: { hi: 'मूल्य रुझान', en: 'Price Trends' }, href: '/tools/price-trends' },
    { label: { hi: 'मंडी इवेंट्स', en: 'Mandi Events' }, href: '/mandi-events' },
    { label: { hi: 'रिसर्च', en: 'Research' }, href: '/research/up-poultry-timing-loss-report-2025' },
    { label: { hi: 'डायरेक्टरी', en: 'Directory' }, href: '/directory' },
    { label: { hi: 'सभी स्थान', en: 'All Locations' }, href: '/locations' },
  ];

  // Mobile menu items (full structure)
  const mobileNavItems = [
    { label: { hi: 'होम', en: 'Home' }, href: '/' },
    { label: { hi: 'फीचर्स', en: 'Features' }, href: '/features' },
    { label: { hi: 'फार्म इंटेलिजेंस', en: 'Farm Intelligence' }, href: '/farm-intelligence' },
    { label: { hi: 'मूल्य निर्धारण', en: 'Pricing' }, href: '/pricing' },
    { label: { hi: 'सटीकता', en: 'Accuracy' }, href: '/accuracy' },
    { type: 'divider' },
    { label: { hi: 'समाधान:', en: 'Solutions:' }, type: 'header' },
    { label: { hi: 'फार्मों के लिए', en: 'For Farms' }, href: '/solutions/farms', indent: true },
    { label: { hi: 'व्यावसायिक फार्म', en: 'Commercial Farms' }, href: '/solutions/commercial-farms', indent: true },
    { label: { hi: 'इंटीग्रेटर', en: 'Integrators' }, href: '/solutions/integrators', indent: true },
    { label: { hi: 'फीड कंपनियां', en: 'Feed Companies' }, href: '/solutions/feed-companies', indent: true },
    { label: { hi: 'व्यापारी', en: 'For Traders' }, href: '/solutions/traders', indent: true },
    { label: { hi: 'एंटरप्राइज', en: 'Enterprise & QSR' }, href: '/solutions/enterprise', indent: true },
    { label: { hi: 'डेवलपर्स / API', en: 'Developers / API' }, href: '/developers', indent: true },
    { type: 'divider' },
    { label: { hi: 'कंपनी:', en: 'Company:' }, type: 'header' },
    { label: { hi: 'हमारे बारे में', en: 'About Us' }, href: '/about', indent: true },
    { label: { hi: 'ब्लॉग', en: 'Blog' }, href: '/blog', indent: true },
    { label: { hi: 'केस स्टडीज', en: 'Case Studies' }, href: '/case-studies', indent: true },
    { label: { hi: 'पार्टनर बनें', en: 'Partner With Us' }, href: '/partner-with-us', indent: true },
    { label: { hi: 'संपर्क', en: 'Contact' }, href: '/contact', indent: true },
    { type: 'divider' },
    { label: { hi: 'रिसोर्स:', en: 'Resources:' }, type: 'header' },
    { label: { hi: 'यह कैसे काम करता है', en: 'How It Works' }, href: '/how-it-works', indent: true },
    { label: { hi: 'मुफ्त बीमारी अलर्ट', en: 'Free Disease Alerts' }, href: '/free-disease-alerts', indent: true },
    { label: { hi: 'नुकसान कैलकुलेटर', en: 'Loss Calculator' }, href: '/loss-calculator', indent: true },
    { label: { hi: 'FAQ', en: 'FAQ' }, href: '/faq', indent: true },
    { label: { hi: 'डायरेक्टरी', en: 'Directory' }, href: '/directory', indent: true },
    { type: 'divider' },
    { label: { hi: 'कंप्लायंस', en: 'Compliance' }, href: '/compliance' },
  ];

  const mobileMenuVariants = {
    closed: { opacity: 0 },
    open: { opacity: 1 },
  };

  const linkVariants = {
    closed: { opacity: 0, y: 20 },
    open: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
        ease: [0.25, 1, 0.5, 1],
      },
    }),
  };

  const dropdownVariants = {
    hidden: { opacity: 0, y: -4 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <>
      {/* Desktop Nav */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-[200ms] ease-smooth ${
          isScrolled 
            ? 'bg-white/92 backdrop-blur-[12px] border-b border-brandOrange700/10 shadow-sm' 
            : 'bg-transparent border-b-transparent'
        }`}
        style={{
          WebkitBackdropFilter: isScrolled ? 'blur(12px)' : 'none',
        }}
      >
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[72px]">
            {/* Logo */}
            <Link href="/" className="font-space-grotesk font-bold text-xl text-brandOrange700 hover:text-brandOrange500 transition-colors">
              FlockIQ
            </Link>

            {/* Desktop Nav Items */}
            <div className="hidden lg:flex items-center gap-6">

              {/* Products Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setOpenDropdown('products')}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button className="flex items-center gap-1 text-sm font-semibold text-neutral700 hover:text-brandGreen500 transition-colors py-6">
                  {mounted ? (language === 'hi' ? 'उत्पाद' : 'Products') : 'Products'}
                  <CaretDown
                    size={14}
                    weight="bold"
                    className={`transition-transform duration-200 ${openDropdown === 'products' ? 'rotate-180' : ''}`}
                  />
                </button>
                <AnimatePresence>
                  {openDropdown === 'products' && (
                    <motion.div
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      variants={dropdownVariants}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 w-80 bg-white shadow-lg border border-neutral200 overflow-hidden rounded-b-xl"
                    >
                      {productsItems.map((item, idx) => (
                        <Link
                          key={idx}
                          href={item.href}
                          className="block px-5 py-4 hover:bg-brandGreen50 transition-colors border-b border-neutral200 last:border-b-0"
                        >
                          <div className="font-semibold text-neutral900">{item.title[language]}</div>
                          <div className="text-sm text-neutral500 mt-1">{item.subtitle[language]}</div>
                          <div className="text-xs text-brandGreen700 mt-1">{item.price}</div>
                        </Link>
                      ))}
                      <div className="px-5 py-3 bg-brandGreen50 border-t border-neutral200">
                        <div className="flex items-center gap-2 text-sm text-brandGreen700">
                          <CheckCircle size={16} weight="fill" />
                          <span className="font-medium">96.2% Directional Accuracy · Live</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Solutions Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setOpenDropdown('solutions')}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button className="flex items-center gap-1 text-sm font-semibold text-neutral700 hover:text-brandGreen500 transition-colors py-6">
                  {mounted ? (language === 'hi' ? 'समाधान' : 'Solutions') : 'Solutions'}
                  <CaretDown
                    size={14}
                    weight="bold"
                    className={`transition-transform duration-200 ${openDropdown === 'solutions' ? 'rotate-180' : ''}`}
                  />
                </button>
                <AnimatePresence>
                  {openDropdown === 'solutions' && (
                    <motion.div
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      variants={dropdownVariants}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 w-64 bg-white shadow-lg border border-neutral200 overflow-hidden rounded-b-xl"
                    >
                      {solutionsItems.map((item, idx) => (
                        <Link
                          key={idx}
                          href={item.href}
                          className="block px-5 py-3 hover:bg-brandGreen50 transition-colors text-sm text-neutral700 hover:text-brandGreen500 border-b border-neutral200 last:border-b-0"
                        >
                          {item.label[language]}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Company Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setOpenDropdown('company')}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button className="flex items-center gap-1 text-sm font-semibold text-neutral700 hover:text-brandGreen500 transition-colors py-6">
                  {mounted ? (language === 'hi' ? 'कंपनी' : 'Company') : 'Company'}
                  <CaretDown
                    size={14}
                    weight="bold"
                    className={`transition-transform duration-200 ${openDropdown === 'company' ? 'rotate-180' : ''}`}
                  />
                </button>
                <AnimatePresence>
                  {openDropdown === 'company' && (
                    <motion.div
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      variants={dropdownVariants}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 w-56 bg-white shadow-lg border border-neutral200 overflow-hidden rounded-b-xl"
                    >
                      {companyItems.map((item, idx) => (
                        <Link
                          key={idx}
                          href={item.href}
                          className="block px-5 py-3 hover:bg-brandGreen50 transition-colors text-sm text-neutral700 hover:text-brandGreen500 border-b border-neutral200 last:border-b-0"
                        >
                          {item.label[language]}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Resources Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setOpenDropdown('resources')}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button className="flex items-center gap-1 text-sm font-semibold text-neutral700 hover:text-brandGreen500 transition-colors py-6">
                  {mounted ? (language === 'hi' ? 'रिसोर्स' : 'Resources') : 'Resources'}
                  <CaretDown
                    size={14}
                    weight="bold"
                    className={`transition-transform duration-200 ${openDropdown === 'resources' ? 'rotate-180' : ''}`}
                  />
                </button>
                <AnimatePresence>
                  {openDropdown === 'resources' && (
                    <motion.div
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      variants={dropdownVariants}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 w-56 bg-white shadow-lg border border-neutral200 overflow-hidden rounded-b-xl"
                    >
                      {resourcesItems.map((item, idx) => (
                        <Link
                          key={idx}
                          href={item.href}
                          className="block px-5 py-3 hover:bg-brandGreen50 transition-colors text-sm text-neutral700 hover:text-brandGreen500 border-b border-neutral200 last:border-b-0"
                        >
                          {item.label[language]}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Static Nav Items */}
              {mainNavItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => handleNavigation(item.href)}
                  className="text-sm font-semibold text-neutral700 hover:text-brandGreen500 transition-colors"
                  suppressHydrationWarning
                >
                  {mounted ? item.label[language] : item.label.en}
                </button>
              ))}
            </div>

            {/* Right Side: Language + CTAs */}
            <div className="flex items-center gap-4">
              {/* Language Toggle */}
              <div className="hidden lg:flex items-center gap-1">
                <button
                  onClick={() => handleLanguageChange('en')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    language === 'en' 
                      ? 'text-brandGreen700 bg-brandGreen50' 
                      : 'text-neutral500 hover:text-neutral700'
                  }`}
                >
                  EN
                </button>
                <span className="text-neutral300">/</span>
                <button
                  onClick={() => handleLanguageChange('hi')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    language === 'hi' 
                      ? 'text-brandGreen700 bg-brandGreen50' 
                      : 'text-neutral500 hover:text-neutral700'
                  }`}
                >
                  हिं
                </button>
              </div>

              {/* Request Demo CTA */}
              <Link
                href="/demo"
                onClick={() => trackHeroCtaClicked(language === 'hi' ? 'डेमो अनुरोध करें' : 'Request Demo', 'navigation', 'navigation')}
                className="hidden sm:inline-flex items-center px-5 py-2.5 bg-brandGreen700 text-white text-sm font-semibold rounded-full hover:bg-brandGreen600 transition-colors shadow-brand-tint"
              >
                {mounted ? (language === 'hi' ? 'डेमो अनुरोध करें' : 'Request Demo') : 'Request Demo'}
              </Link>

              {/* Login Button */}
              <Link
                href="/login"
                className="hidden lg:inline-flex px-4 py-2.5 text-sm font-semibold text-neutral700 hover:text-brandGreen500 transition-colors"
              >
                {mounted ? (language === 'hi' ? 'लॉगिन' : 'Login') : 'Login'}
              </Link>

              {/* Mobile Hamburger */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 text-neutral700 hover:text-brandGreen500 transition-colors"
                aria-label="Open menu"
              >
                <List size={24} weight="light" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={mobileMenuVariants}
            className="fixed inset-0 z-50 lg:hidden overflow-y-auto"
            style={{
              background: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(32px)',
            }}
          >
            <div className="flex flex-col min-h-full p-6">
              {/* Close Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-3 text-white hover:text-brandGreen500 transition-colors"
                  aria-label="Close menu"
                >
                  <X size={24} weight="light" />
                </button>
              </div>

              {/* Mobile Links */}
              <div className="flex flex-col gap-3 mt-4">
                {mobileNavItems.map((item, i) => {
                  if (item.type === 'divider') {
                    return (
                      <motion.div
                        key={`divider-${i}`}
                        custom={i}
                        variants={linkVariants}
                        initial="closed"
                        animate="open"
                        className="border-t border-white/20 my-1"
                      />
                    );
                  }
                  if (item.type === 'header') {
                    return (
                      <motion.div
                        key={`header-${i}`}
                        custom={i}
                        variants={linkVariants}
                        initial="closed"
                        animate="open"
                        className="text-base font-semibold text-white/50 uppercase tracking-wider mt-2"
                      >
                        {item.label ? item.label[language] : ''}
                      </motion.div>
                    );
                  }
                  return (
                    <motion.div
                      key={item.href}
                      custom={i}
                      variants={linkVariants}
                      initial="closed"
                      animate="open"
                    >
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          handleNavigation(item.href!);
                        }}
                        className={`text-lg font-semibold text-white hover:text-brandGreen400 transition-colors text-left ${
                          item.indent ? 'pl-5 text-base font-medium text-white/80' : ''
                        }`}
                        suppressHydrationWarning
                      >
                        {mounted 
                          ? (item.label ? item.label[language] : '') 
                          : (item.label ? item.label.en : '')}
                      </button>
                    </motion.div>
                  );
                })}
              </div>

              {/* Mobile CTAs */}
              <motion.div
                custom={mobileNavItems.length}
                variants={linkVariants}
                initial="closed"
                animate="open"
                className="flex flex-col gap-4 pt-8 pb-8 mt-auto"
              >
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleNavigation('/signup');
                  }}
                  className="w-full py-4 bg-brandGreen500 text-white font-semibold rounded-full text-center hover:bg-brandGreen700 transition-colors"
                  suppressHydrationWarning
                >
                  {mounted ? (language === 'hi' ? '₹0 में शुरू करें' : 'Start at ₹0') : 'Start at ₹0'}
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleNavigation('/login');
                  }}
                  className="w-full py-4 text-white font-semibold text-center hover:text-brandGreen400 transition-colors"
                  suppressHydrationWarning
                >
                  {mounted ? (language === 'hi' ? 'लॉगिन' : 'Login') : 'Login'}
                </button>

                {/* Language Toggle */}
                <div className="flex items-center justify-center gap-4 pt-2">
                  <button
                    onClick={() => handleLanguageChange('en')}
                    className={`px-4 py-2 rounded-full transition-colors ${
                      language === 'en' ? 'bg-brandGreen500 text-white' : 'text-white/70 hover:text-white'
                    }`}
                  >
                    EN
                  </button>
                  <button
                    onClick={() => handleLanguageChange('hi')}
                    className={`px-4 py-2 rounded-full transition-colors ${
                      language === 'hi' ? 'bg-brandGreen500 text-white' : 'text-white/70 hover:text-white'
                    }`}
                  >
                    हिं
                  </button>
                </div>

                <Link
                  href="/demo"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    trackHeroCtaClicked(language === 'hi' ? 'डेमो अनुरोध करें' : 'Request Demo', 'navigation', 'navigation');
                  }}
                  className="w-full py-4 bg-brandGreen500 text-white font-semibold rounded-full text-center hover:bg-brandGreen700 transition-colors"
                >
                  {mounted ? (language === 'hi' ? 'डेमो अनुरोध करें' : 'Request Demo') : 'Request Demo'}
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
