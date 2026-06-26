'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

export function AdminHeader() {
  const pathname = usePathname();
  
  // Simple breadcrumb logic
  const getBreadcrumb = () => {
    if (pathname.includes('/licenses')) return 'Sales & Licenses / Generate License';
    if (pathname.includes('/sales-performance')) return 'Sales & Licenses / Performance Dashboard';
    if (pathname.includes('/my-customers')) return 'Sales & Licenses / My Customers';
    return 'Admin Portal';
  };

  return (
    <header className="h-[60px] bg-white border-b border-[#E3EDE7] px-6 flex items-center justify-between flex-shrink-0 z-20">
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-semibold text-gray-900">
          {getBreadcrumb()}
        </h1>
      </div>
      <div className="flex items-center gap-4">
        {/* Can add date/time or environment indicators here */}
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
          Internal Tools
        </span>
      </div>
    </header>
  );
}
