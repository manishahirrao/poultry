// FlockIQ — Blog Index Client Component
// File: apps/web/app/(marketing)/blog/BlogIndexClient.tsx
// Version: v3.0 | June 2026
// Task Reference: CONTENT-PAGE-004
// Requirements: FR-BLOG-001

'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, TrendUp, MagnifyingGlass, WhatsappLogo, Globe } from '@phosphor-icons/react';
import Link from 'next/link';
import { useLanguage } from '@/providers/LanguageProvider';
import { BLOG_CATEGORIES, type BlogPost } from './lib/blog-types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/Card';

interface BlogIndexClientProps {
  posts: BlogPost[];
}

export default function BlogIndexClient({ posts }: BlogIndexClientProps) {
  const { language, setLanguage } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState<'both' | 'en' | 'hi'>('both');
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    setMounted(true);
  }, []);

  const categories = ['All', ...BLOG_CATEGORIES.map(c => c.name)];

  const filteredPosts = posts.filter((post) => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesLanguage = selectedLanguage === 'both' || post.language === selectedLanguage;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.titleEn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.titleHi?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerptEn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerptHi?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesLanguage && matchesSearch;
  });

  const shareOnWhatsApp = (slug: string, title: string) => {
    const url = `${window.location.origin}/blog/${slug}`;
    const text = title;
    window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
  };

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 6);
  };

  if (!mounted) {
    return null;
  }

  const getDisplayTitle = (post: BlogPost) => {
    if (language === 'hi' && post.titleHi) return post.titleHi;
    if (language === 'en' && post.titleEn) return post.titleEn;
    return post.title;
  };

  const getDisplayExcerpt = (post: BlogPost) => {
    if (language === 'hi' && post.excerptHi) return post.excerptHi;
    if (language === 'en' && post.excerptEn) return post.excerptEn;
    return post.excerpt;
  };

  const visiblePosts = filteredPosts.slice(0, visibleCount);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-section-vertical bg-brand-700 text-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <Badge variant="glass" className="mb-6">
              🌍 Knowledge & Insights
            </Badge>
            <h1 className="font-sora font-extrabold text-[clamp(2rem,3.5vw+0.75rem,3.5rem)] leading-[1.1] mb-4">
              Poultry Management Insights
            </h1>
            <p className="font-jakarta text-lg text-brand-100 max-w-3xl mx-auto">
              Expert insights on poultry farm management, WhatsApp automation, price intelligence, 
              and best practices for integrators and farms globally.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="py-section-small bg-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full lg:w-96">
              <MagnifyingGlass size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder={language === 'hi' ? 'लेख खोजें...' : 'Search articles...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-neutral-200 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              {/* Category Tabs */}
              <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full font-semibold whitespace-nowrap transition-all ${
                      selectedCategory === category
                        ? 'bg-brand-700 text-white'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    {category === 'All' ? (language === 'hi' ? 'सभी' : 'All') : category}
                  </button>
                ))}
              </div>

              {/* Language Filter */}
              <div className="flex gap-2">
                {[
                  { value: 'both' as const, label: 'Both' },
                  { value: 'en' as const, label: 'English' },
                  { value: 'hi' as const, label: 'हिंदी' },
                ].map((lang) => (
                  <button
                    key={lang.value}
                    onClick={() => setSelectedLanguage(lang.value)}
                    className={`px-3 py-2 rounded-full text-sm font-semibold transition-all ${
                      selectedLanguage === lang.value
                        ? 'bg-brand-700 text-white'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-section-vertical bg-neutral-50">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {visiblePosts.map((post, index) => (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="group"
              >
                <Card hover className="overflow-hidden h-full">
                  {/* Image Placeholder */}
                  <div className="aspect-video bg-brand-100 flex items-center justify-center relative">
                    <TrendUp size={48} className="text-brand-400" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        shareOnWhatsApp(post.slug, getDisplayTitle(post));
                      }}
                      className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:bg-brand-50 transition-colors"
                      aria-label="Share on WhatsApp"
                    >
                      <WhatsappLogo size={20} className="text-brand-700" />
                    </button>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="brand" size="sm">
                        {post.category}
                      </Badge>
                    </div>

                    <Link href={`/blog/${post.slug}`}>
                      <h2 className="font-jakarta font-bold text-xl text-neutral-900 mb-2 group-hover:text-brand-700 transition-colors line-clamp-2">
                        {getDisplayTitle(post)}
                      </h2>
                    </Link>
                    <p className="text-sm text-neutral-700 mb-4 line-clamp-3">{getDisplayExcerpt(post)}</p>

                    <div className="flex items-center gap-4 text-xs text-neutral-500">
                      <div className="flex items-center gap-1">
                        <Calendar size={16} />
                        <span>{new Date(post.publishedAt).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={16} />
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-neutral-500">
                {language === 'hi' ? 'आपकी खोज से मेल खाने वाला कोई लेख नहीं मिला।' : 'No articles found matching your search.'}
              </p>
            </div>
          )}

          {/* Load More Button */}
          {visiblePosts.length < filteredPosts.length && (
            <div className="text-center mt-12">
              <Button
                variant="secondary"
                size="lg"
                onClick={handleLoadMore}
              >
                Load More Articles
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Signup Section */}
      <section className="py-section-vertical bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-sora font-bold text-[clamp(1.75rem,2.5vw+0.5rem,2.75rem)] text-neutral-900 mb-4">
              {language === 'hi' ? 'नवीनतम अंतर्दृष्टि के साथ अपडेट रहें' : 'Stay Updated with Latest Insights'}
            </h2>
            <p className="font-jakarta text-lg text-neutral-700 mb-8">
              {language === 'hi' 
                ? 'साप्ताहिक पोल्ट्री फार्मिंग टिप्स के लिए हमारे न्यूज़लेटर की सदस्यता लें'
                : 'Subscribe to our newsletter for weekly poultry farming tips'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder={language === 'hi' ? 'आपका ईमेल' : 'Your email'}
                className="flex-1 px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
              <Button variant="primary" size="md">
                {language === 'hi' ? 'सदस्यता लें' : 'Subscribe'}
              </Button>
            </div>
            <p className="text-xs text-neutral-500 mt-4">
              {language === 'hi' ? 'हम स्पैम नहीं करते। किसी भी समय अनसब्सक्राइब करें।' : 'No spam. Unsubscribe anytime.'}
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
