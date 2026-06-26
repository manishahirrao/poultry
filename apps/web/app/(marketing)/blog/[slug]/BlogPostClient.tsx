// FlockIQ — Blog Post Client Component
// File: apps/web/app/(marketing)/blog/[slug]/BlogPostClient.tsx
// Version: v3.0 | June 2026
// Task Reference: CONTENT-PAGE-004
// Requirements: FR-BLOG-001

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, ArrowLeft, TrendUp, List, WhatsappLogo, Globe, ShareNetwork } from '@phosphor-icons/react';
import Link from 'next/link';
import { useLanguage } from '@/providers/LanguageProvider';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/Card';
import type { BlogPostWithContent, BlogPost } from '../lib/blog-types';

interface BlogPostClientProps {
  post: BlogPostWithContent;
  relatedPosts: BlogPost[];
}

export default function BlogPostClient({ post, relatedPosts }: BlogPostClientProps) {
  const { language, setLanguage } = useLanguage();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeHeading, setActiveHeading] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Extract headings from content for TOC
  const headings = post.content.match(/^##\s+(.+)$/gm)?.map((h: string) => h.replace('## ', '')) || [];

  // Scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const winScroll = document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      setScrollProgress(scrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const shareOnWhatsApp = () => {
    const url = window.location.href;
    const title = language === 'hi' && post.titleHi ? post.titleHi : (post.titleEn || post.title);
    const text = title;
    window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  const getDisplayTitle = () => {
    if (language === 'hi' && post.titleHi) return post.titleHi;
    if (language === 'en' && post.titleEn) return post.titleEn;
    return post.title;
  };

  const getDisplayExcerpt = () => {
    if (language === 'hi' && post.excerptHi) return post.excerptHi;
    if (language === 'en' && post.excerptEn) return post.excerptEn;
    return post.excerpt;
  };

  // Insert CTA after every 3 paragraphs
  const insertCTAs = (content: string) => {
    const paragraphs = content.split('</p>');
    let modifiedContent = '';
    let paragraphCount = 0;

    paragraphs.forEach((para, index) => {
      modifiedContent += para;
      if (para.trim() && !para.includes('<')) {
        paragraphCount++;
        if (paragraphCount % 3 === 0 && index < paragraphs.length - 1) {
          modifiedContent += `
            <div className="my-8 p-6 bg-brand-50 rounded-xl border border-brand-100">
              <p className="text-sm text-neutral-700 mb-3">
                ${language === 'hi' ? 'इन अंतर्दृष्टि को वास्तविक डेटा के साथ लागू करें।' : 'Apply these insights with real data.'}
              </p>
              <a href="/signup" className="inline-flex items-center text-brand-700 font-semibold hover:underline">
                ${language === 'hi' ? '14 दिन मुफ़्त शुरू करें →' : 'Start 14-day free trial →'}
              </a>
            </div>
          `;
        }
      }
      if (index < paragraphs.length - 1) {
        modifiedContent += '</p>';
      }
    });

    return modifiedContent;
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen">
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-neutral-200 z-50">
        <div
          className="h-full bg-brand-700 transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Fixed WhatsApp Share Button (Mobile) */}
      <button
        onClick={shareOnWhatsApp}
        className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-[#25D366] text-white rounded-full shadow-lg flex items-center justify-center z-40 hover:bg-[#1DA85A] transition-colors"
        aria-label="Share on WhatsApp"
      >
        <WhatsappLogo size={28} />
      </button>

      {/* Header */}
      <section className="py-section-small bg-brand-50">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link
              href="/blog"
              className="inline-flex items-center text-brand-700 font-semibold hover:underline"
            >
              <ArrowLeft size={20} className="mr-2" />
              {language === 'hi' ? 'ब्लॉग पर वापस' : 'Back to Blog'}
            </Link>
            
            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === 'hi' ? 'en' : 'hi')}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-200 hover:border-brand-400 transition-colors"
            >
              <Globe size={20} className="text-brand-700" />
              <span className="font-semibold text-neutral-700">{language === 'hi' ? 'EN' : 'हिं'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Hero */}
      <section className="py-section-vertical bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="brand" size="sm">
                {post.category}
              </Badge>
            </div>

            <h1 className="font-sora font-bold text-[clamp(2rem,3.5vw+0.75rem,3.5rem)] text-neutral-900 leading-[1.1] mb-4">
              {getDisplayTitle()}
            </h1>
            <p className="font-jakarta text-lg text-neutral-700 mb-8">{getDisplayExcerpt()}</p>

            <div className="flex items-center gap-6 text-sm text-neutral-500 mb-6">
              <div className="flex items-center gap-2">
                <User size={20} />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={20} />
                <span>{new Date(post.publishedAt).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={20} />
                <span>{post.readTime}</span>
              </div>
            </div>

            {/* Share Buttons */}
            <div className="flex items-center gap-3">
              <Button
                variant="whatsapp"
                size="md"
                onClick={shareOnWhatsApp}
                icon={<WhatsappLogo size={20} />}
              >
                {language === 'hi' ? 'WhatsApp पर शेयर करें' : 'Share on WhatsApp'}
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={copyLink}
                icon={<ShareNetwork size={20} />}
              >
                {language === 'hi' ? 'लिंक कॉपी करें' : 'Copy Link'}
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Author Bio */}
      <section className="py-section-small bg-brand-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-4"
          >
            <div className="w-16 h-16 bg-brand-700 rounded-full flex items-center justify-center">
              <User size={32} className="text-white" />
            </div>
            <div>
              <p className="font-semibold text-neutral-900">{post.author}</p>
              <p className="text-sm text-neutral-700">{post.authorCredentials || 'FlockIQ Team — Experts in poultry management and market intelligence'}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content with TOC Sidebar */}
      <section className="py-section-vertical bg-neutral-50">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Table of Contents */}
            {headings.length > 0 && (
              <motion.aside
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="hidden lg:block lg:col-span-1"
              >
                <div className="sticky top-24 bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                    <List size={20} className="text-brand-700" />
                    {language === 'hi' ? 'विषय सूची' : 'Table of Contents'}
                  </h3>
                  <nav className="space-y-2">
                    {headings.map((heading: string, index: number) => (
                      <a
                        key={index}
                        href={`#${heading.toLowerCase().replace(/\s+/g, '-')}`}
                        className="block text-sm text-neutral-700 hover:text-brand-700 transition-colors"
                      >
                        {heading}
                      </a>
                    ))}
                  </nav>
                </div>
              </motion.aside>
            )}

            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-3"
            >
              <div className="prose prose-lg max-w-none bg-white rounded-2xl p-8 shadow-sm prose-headings:font-sora prose-headings:font-bold prose-headings:text-neutral-900 prose-p:leading-relaxed prose-p:text-neutral-700 prose-strong:text-neutral-900 prose-ul:text-neutral-700 prose-ol:text-neutral-700 prose-li:text-neutral-700 prose-blockquote:text-neutral-600 prose-code:text-neutral-900 prose-pre:text-neutral-900 prose-a:text-brand-700">
                <div dangerouslySetInnerHTML={{ __html: insertCTAs(post.content) }} />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="py-section-vertical bg-white">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-8"
            >
              <h2 className="font-sora font-bold text-2xl text-neutral-900 mb-2">
                {language === 'hi' ? 'संबंधित लेख' : 'Related Articles'}
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((related, index) => (
                <motion.div
                  key={related.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card hover className="h-full">
                    <Link href={`/blog/${related.slug}`} className="block h-full">
                      <div className="p-6">
                        <h3 className="font-jakarta font-semibold text-neutral-900 mb-2 line-clamp-2">
                          {language === 'hi' && related.titleHi ? related.titleHi : (related.titleEn || related.title)}
                        </h3>
                        <div className="flex items-center text-brand-700 font-semibold">
                          {language === 'hi' ? 'और पढ़ें' : 'Read more'}
                          <TrendUp size={20} className="ml-2" />
                        </div>
                      </div>
                    </Link>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-section-vertical bg-brand-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-sora font-bold text-[clamp(1.75rem,2.5vw+0.5rem,2.75rem)] mb-4">
              {language === 'hi' ? 'आज इन अंतर्दृष्टि को लागू करें' : 'Apply These Insights Today'}
            </h2>
            <p className="font-jakarta text-lg text-brand-100 mb-8">
              {language === 'hi' ? 'अपना 14-दिन का मुफ्त परीक्षण शुरू करें और दैनिक मूल्य पूर्वानुमान प्राप्त करें' : 'Start your 14-day free trial and get daily price predictions'}
            </p>
            <Button variant="secondary" size="lg" pill asChild>
              <Link href="/signup">
                {language === 'hi' ? '14 दिन मुफ़्त शुरू करें' : 'Start 14-day free trial'}
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
