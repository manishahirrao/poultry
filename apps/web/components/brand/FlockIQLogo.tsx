// FlockIQ — Logo Component (v3.1)
// File: apps/web/components/brand/FlockIQLogo.tsx
// Version: v3.1 | June 2026
// Task Reference: NAV-002
// Design Reference: FlockIQ_PreLogin_Design_Master_v3.md §2.2

import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface FlockIQLogoProps {
  className?: string;
  variant?: 'full' | 'icon';
}

export function FlockIQLogo({ className, variant = 'full' }: FlockIQLogoProps) {
  if (variant === 'icon') {
    return (
      <Link href="/" className={cn('flex-shrink-0', className)}>
        <Image
          src="/logo.png"
          alt="FlockIQ Logo"
          width={36}
          height={36}
          className="h-9 w-9 object-contain"
          priority
        />
      </Link>
    );
  }

  return (
    <Link href="/" className={cn('flex-shrink-0 flex items-center', className)}>
      <div className="flex items-center gap-3">
        <Image
          src="/logo.png"
          alt="FlockIQ Logo"
          width={160}
          height={44}
          className="h-11 w-auto object-contain"
          priority
        />
        <Image
          src="/brand-name.png"
          alt="PoultrySense"
          width={120}
          height={44}
          className="h-11 w-auto object-contain"
          priority
        />
      </div>
    </Link>
  );
}

export default FlockIQLogo;
