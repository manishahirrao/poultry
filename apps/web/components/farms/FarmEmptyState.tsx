import { clsx } from 'clsx';

interface FarmEmptyStateProps {
  variant: 'no_farms' | 'no_batch' | 'no_data' | 'no_logs' | 'compare_need_more';
  heading?: string;
  sub?: string;
  ctaText?: string;
  ctaHref?: string;
  className?: string;
}

const emptyStateContent = {
  no_farms: {
    heading: 'पहला Farm जोड़ें',
    sub: 'अपना पहला farm onboard करें और daily metrics track करना शुरू करें।',
    ctaText: 'Farm जोड़ें →',
    illustration: '🐔',
  },
  no_batch: {
    heading: 'कोई Active Batch नहीं है',
    sub: 'इस farm में कोई active batch नहीं है। नया batch start करें।',
    ctaText: 'Batch Start करें →',
    illustration: '📋',
  },
  no_data: {
    heading: 'कोई Data नहीं है',
    sub: 'अभी तक कोई data available नहीं है।',
    illustration: '📊',
  },
  no_logs: {
    heading: 'कोई Daily Log नहीं है',
    sub: 'अभी तक कोई daily log नहीं है। पहला log enter करें।',
    ctaText: 'Log Enter करें →',
    illustration: '📝',
  },
  compare_need_more: {
    heading: 'और Farms जोड़ें',
    sub: 'Compare करने के लिए कम से कम 2 farms होने चाहिए।',
    ctaText: 'Farm जोड़ें →',
    illustration: '📊',
  },
} as const;

export function FarmEmptyState({
  variant,
  heading,
  sub,
  ctaText,
  ctaHref,
  className,
}: FarmEmptyStateProps) {
  const content = emptyStateContent[variant];
  const displayHeading = heading || content.heading;
  const displaySub = sub || content.sub;
  const displayCtaText = ctaText || ('ctaText' in content ? content.ctaText : undefined);

  return (
    <div className={clsx('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      <div className="text-6xl mb-4" role="img" aria-label="Empty state illustration">
        {content.illustration}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{displayHeading}</h3>
      <p className="text-sm text-gray-600 mb-6 max-w-md">{displaySub}</p>
      {ctaHref && displayCtaText && (
        <a
          href={ctaHref}
          className="inline-flex items-center px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors font-semibold"
        >
          {displayCtaText}
        </a>
      )}
    </div>
  );
}
