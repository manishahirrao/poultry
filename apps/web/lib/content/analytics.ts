// FlockIQ — Blog Performance Tracking
// File: apps/web/lib/content/analytics.ts
// Version: v1.0 | May 2026
// Purpose: Track blog article performance to refine content strategy

import { trackEvent } from '../analytics';

export interface BlogPerformanceMetrics {
  slug: string;
  title: string;
  category: string;
  publishedAt: string;
  views: number;
  readTime: number;
  scrollDepth: number;
  ctaClicks: number;
  shares: number;
  conversions: number;
  avgTimeOnPage: number;
  bounceRate: number;
}

/**
 * Track blog post view
 */
export function trackBlogPostView(slug: string, title: string, category: string): void {
  trackEvent('blog_post_view', {
    blog_slug: slug,
    blog_title: title,
    blog_category: category,
  });
}

/**
 * Track blog post read complete (user scrolled to bottom)
 */
export function trackBlogPostReadComplete(slug: string, readTimeSeconds: number): void {
  trackEvent('blog_post_read_complete', {
    blog_slug: slug,
    read_time_seconds: readTimeSeconds,
  });
}

/**
 * Track blog CTA click
 */
export function trackBlogCTAClick(slug: string, ctaText: string, ctaLocation: string): void {
  trackEvent('blog_cta_click', {
    blog_slug: slug,
    cta_text: ctaText,
    cta_location: ctaLocation, // 'inline', 'end_of_article', 'sidebar'
  });
}

/**
 * Track blog share click
 */
export function trackBlogShareClick(slug: string, platform: string): void {
  trackEvent('blog_share_click', {
    blog_slug: slug,
    share_platform: platform, // 'whatsapp', 'facebook', 'twitter', 'copy_link'
  });
}

/**
 * Track blog category filter
 */
export function trackBlogCategoryFilter(category: string): void {
  trackEvent('blog_category_filter', {
    category: category,
  });
}

/**
 * Track blog search
 */
export function trackBlogSearch(query: string, resultCount: number): void {
  trackEvent('blog_search', {
    search_query: query,
    result_count: resultCount,
  });
}

/**
 * Calculate content pillar performance
 * Use this data to refine content strategy
 */
export interface PillarPerformance {
  pillar: string;
  totalViews: number;
  avgReadTime: number;
  conversionRate: number;
  topArticle: string;
  articleCount: number;
}

/**
 * Group blog metrics by content pillar
 */
export function getPillarPerformance(metrics: BlogPerformanceMetrics[]): PillarPerformance[] {
  const pillarMap = new Map<string, {
    views: number;
    readTime: number;
    conversions: number;
    articles: string[];
  }>();

  for (const metric of metrics) {
    const pillar = categoryToPillar(metric.category);
    
    if (!pillarMap.has(pillar)) {
      pillarMap.set(pillar, {
        views: 0,
        readTime: 0,
        conversions: 0,
        articles: [],
      });
    }

    const data = pillarMap.get(pillar)!;
    data.views += metric.views;
    data.readTime += metric.avgTimeOnPage;
    data.conversions += metric.conversions;
    data.articles.push(metric.title);
  }

  const performance: PillarPerformance[] = [];

  for (const [pillar, data] of pillarMap.entries()) {
    performance.push({
      pillar,
      totalViews: data.views,
      avgReadTime: data.readTime / data.articles.length,
      conversionRate: data.views > 0 ? (data.conversions / data.views) * 100 : 0,
      topArticle: data.articles[0], // Simplified - should find actual top performer
      articleCount: data.articles.length,
    });
  }

  return performance.sort((a, b) => b.totalViews - a.totalViews);
}

/**
 * Map category to content pillar
 */
function categoryToPillar(category: string): string {
  const pillarMap: Record<string, string> = {
    'farm-management': 'Farm Profitability & ROI',
    'भाव विश्लेषण': 'Price Intelligence & Market Timing',
    'comparison': 'Price Intelligence & Market Timing',
    'risk-management': 'Risk Management & Disease Alerts',
    'technology': 'Technology & Trust',
  };

  return pillarMap[category] || 'Other';
}

/**
 * Content strategy recommendations based on performance
 */
export interface ContentStrategyRecommendation {
  pillar: string;
  status: 'double_down' | 'maintain' | 'pivot' | 'launch';
  reasoning: string;
  suggestedActions: string[];
}

/**
 * Generate content strategy recommendations
 */
export function generateStrategyRecommendations(
  pillarPerformance: PillarPerformance[]
): ContentStrategyRecommendation[] {
  const recommendations: ContentStrategyRecommendation[] = [];

  for (const pillar of pillarPerformance) {
    let status: ContentStrategyRecommendation['status'];
    let reasoning: string;
    let suggestedActions: string[] = [];

    if (pillar.totalViews > 1000 && pillar.conversionRate > 5) {
      status = 'double_down';
      reasoning = `High performing pillar with ${pillar.totalViews} views and ${pillar.conversionRate.toFixed(1)}% conversion rate.`;
      suggestedActions = [
        `Create 3-5 more articles for ${pillar} pillar`,
        `Expand subtopic clusters within ${pillar}`,
        `Consider creating a dedicated hub page for ${pillar}`,
      ];
    } else if (pillar.totalViews > 500 && pillar.conversionRate > 2) {
      status = 'maintain';
      reasoning = `Moderate performance with ${pillar.totalViews} views and ${pillar.conversionRate.toFixed(1)}% conversion rate.`;
      suggestedActions = [
        `Continue publishing 1-2 articles/month for ${pillar}`,
        `Optimize existing articles for better conversion`,
        `Test different CTA placements`,
      ];
    } else if (pillar.totalViews < 200) {
      status = 'pivot';
      reasoning = `Low engagement with only ${pillar.totalViews} views. May need topic refinement.`;
      suggestedActions = [
        `Review keyword targeting for ${pillar} articles`,
        `Consider merging ${pillar} with higher-performing pillar`,
        `Test different content formats (video, infographics)`,
      ];
    } else {
      status = 'launch';
      reasoning = `New pillar with ${pillar.articleCount} articles. Needs more content to evaluate.`;
      suggestedActions = [
        `Publish 3-5 foundational articles for ${pillar}`,
        `Promote initial articles through WhatsApp/direct outreach`,
        `Monitor performance for 30 days before deciding strategy`,
      ];
    }

    recommendations.push({
      pillar: pillar.pillar,
      status,
      reasoning,
      suggestedActions,
    });
  }

  return recommendations;
}

/**
 * Track buyer stage progression through content
 */
export interface BuyerStageMetrics {
  stage: 'awareness' | 'consideration' | 'decision' | 'implementation';
  articleCount: number;
  totalViews: number;
  avgConversionRate: number;
}

/**
 * Map article to buyer stage based on content analysis
 */
export function mapArticleToBuyerStage(
  title: string,
  category: string,
  keywords: string[]
): 'awareness' | 'consideration' | 'decision' | 'implementation' {
  const awarenessKeywords = ['what is', 'how to', 'guide to', 'introduction', 'कैसे', 'क्या है'];
  const considerationKeywords = ['best', 'top', 'vs', 'alternatives', 'comparison', 'comparison'];
  const decisionKeywords = ['pricing', 'reviews', 'demo', 'trial', 'buy', 'मूल्य', 'समीक्षा'];
  const implementationKeywords = ['tutorial', 'setup', 'how to use', 'template', 'examples'];

  const allText = `${title} ${category} ${keywords.join(' ')}`.toLowerCase();

  if (implementationKeywords.some(kw => allText.includes(kw))) {
    return 'implementation';
  }
  if (decisionKeywords.some(kw => allText.includes(kw))) {
    return 'decision';
  }
  if (considerationKeywords.some(kw => allText.includes(kw))) {
    return 'consideration';
  }
  return 'awareness';
}

/**
 * Track content funnel performance
 */
export function trackContentFunnel(
  metrics: BlogPerformanceMetrics[]
): BuyerStageMetrics[] {
  const stageMap = new Map<'awareness' | 'consideration' | 'decision' | 'implementation', {
    count: number;
    views: number;
    conversions: number;
  }>();

  for (const metric of metrics) {
    const stage = mapArticleToBuyerStage(
      metric.title,
      metric.category,
      [] // Would need keywords from full post data
    );

    if (!stageMap.has(stage)) {
      stageMap.set(stage, { count: 0, views: 0, conversions: 0 });
    }

    const data = stageMap.get(stage)!;
    data.count++;
    data.views += metric.views;
    data.conversions += metric.conversions;
  }

  const funnelMetrics: BuyerStageMetrics[] = [];

  for (const [stage, data] of stageMap.entries()) {
    funnelMetrics.push({
      stage,
      articleCount: data.count,
      totalViews: data.views,
      avgConversionRate: data.views > 0 ? (data.conversions / data.views) * 100 : 0,
    });
  }

  return funnelMetrics;
}
