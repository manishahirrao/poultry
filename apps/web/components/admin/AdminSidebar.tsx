'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChartLineUp, Key, Users, House, SignOut
} from '@phosphor-icons/react';
import { FlockIQTokens } from '@/lib/design-tokens';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

interface CustomerProfile {
  id: string;
  name?: string;
  segment: string;
  role: string;
}

const ADMIN_NAV_ITEMS = [
  {
    label: 'Platform Overview',
    href: '/dashboard',
    icon: House,
    roles: ['admin'],
  },
  {
    label: 'Sales Performance',
    href: '/admin/sales-performance',
    icon: ChartLineUp,
    roles: ['admin'],
  },
  {
    label: 'Generate Licenses',
    href: '/admin/licenses',
    icon: Key,
    roles: ['admin', 'agent'],
  },
  {
    label: 'My Customers',
    href: '/admin/sales/my-customers',
    icon: Users,
    roles: ['admin', 'agent'],
  },
];

export function AdminSidebar({ customer }: { customer: CustomerProfile }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    router.push('/login');
  };

  const visibleItems = ADMIN_NAV_ITEMS.filter(item => item.roles.includes(customer.role));

  return (
    <aside className="w-64 bg-[#0A1710] flex flex-col flex-shrink-0 transition-all duration-300">
      {/* Logo */}
      <div className="h-[60px] flex items-center px-4 border-b border-white/5 flex-shrink-0">
        <Image
          src="/images/logo-white.png"
          alt="FlockIQ Admin"
          width={130}
          height={40}
          className="h-10 w-auto object-contain"
          priority
        />
        <span className="ml-2 text-xs font-bold text-[#3DAE72] uppercase tracking-wider">PORTAL</span>
      </div>

      {/* User Info */}
      <div className="px-4 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
               style={{ backgroundColor: FlockIQTokens.brand400 }}>
            {customer.name?.charAt(0).toUpperCase() ?? 'A'}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold truncate">
              {customer.name ?? 'Admin User'}
            </p>
            <p className="text-[#9BBDA8] text-[11px] uppercase tracking-wider">
              {customer.role}
            </p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-4 py-4 overflow-y-auto">
        <ul className="space-y-1">
          <li className="px-1 pt-2 pb-2 text-[10.5px] font-semibold tracking-[0.2em] uppercase text-[#5A7A68]">
            SALES & LICENSING
          </li>
          {visibleItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    group flex items-center gap-3 px-3 py-2.5 rounded-lg
                    text-[13px] font-medium transition-all duration-200
                    ${isActive
                      ? 'bg-[#3DAE72]/20 text-white shadow-md'
                      : 'text-[#9BBDA8] hover:bg-white/[0.08] hover:text-white'
                    }
                  `}
                >
                  <Icon size={20} weight="regular" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/5">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium text-[#9BBDA8] hover:bg-white/[0.08] hover:text-white transition-colors"
        >
          <SignOut size={20} weight="regular" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
