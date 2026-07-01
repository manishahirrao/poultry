'use client';

// WHY: This is the main navigation sidebar for the FlockIQ dashboard.
// It provides role-based and segment-based navigation, ensuring users only see relevant menu items.
// The sidebar supports collapsible states (icon rail mode) and persistent storage of user preferences.
// It also displays farm count badges, trial banners, and WhatsApp support links.
//
// DESIGN NOTES (v2): Visual layer refined for a calmer, more deliberate "system app" feel —
// a single sliding active-state indicator (shared layout animation) replaces per-item background
// snapping, icon glyphs replace emoji, focus states are visible and consistent, and motion
// respects prefers-reduced-motion. No data flow, permission gating, or routing logic was touched.

import React from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChartBar, BellRinging, Calculator, Key,
  CheckCircle, Users, SignOut, X, List,
  House, ChartLine, FileText, MapPin,
  ChartLineUp, Handshake, MagnifyingGlass,
  CaretLeft, CaretRight, ShieldCheck, Package,
  ClockCounterClockwise, Buildings,
  Tag, Warehouse, Truck, ArrowsLeftRight, GearSix, ClipboardText,
  Bird, ShoppingCart,
  Calendar, Warning, Folder, Books, CreditCard, CurrencyDollar,
  Swap, Notebook, Bank, Scales, TrendUp, User,
  Receipt, FolderOpen, ChartPie, Factory,
  Crown, ChatCircleDots,
} from '@phosphor-icons/react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { createClient } from '@/utils/supabase/client';
import { FlockIQTokens } from '@/lib/design-tokens';
import { useEntitlements } from '@/lib/plans/useEntitlements';
import { LifetimeDealStatus } from '@/components/plans/LifetimeDealStatus';
import { useLanguage } from '@/providers/LanguageProvider';

function PlanBadge({ planName, subscriptionType }: { planName: string; subscriptionType: string }) {
  // Map old plan names to new plan names for backward compatibility
  const planMapping: Record<string, 'FLOCKIQ_FARM' | 'FLOCKIQ_PRO'> = {
    'PULSE_FARM': 'FLOCKIQ_FARM',
    'PULSE_PRO': 'FLOCKIQ_PRO',
    'PULSE_INTEL': 'FLOCKIQ_PRO',
    'FLOCKIQ_FARM': 'FLOCKIQ_FARM',
    'FLOCKIQ_PRO': 'FLOCKIQ_PRO',
  };

  const normalizedPlan = planMapping[planName] || 'FLOCKIQ_FARM';
  const displayName = normalizedPlan === 'FLOCKIQ_FARM' ? 'Farm' : 'Pro';
  const isLifetime = subscriptionType === 'lifetime';
  const isPro = normalizedPlan === 'FLOCKIQ_PRO';

  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-semibold tracking-wide px-2 py-[3px] rounded-full border transition-colors
        ${isPro
          ? 'bg-[#3DAE72]/15 border-[#3DAE72]/40 text-[#5FCB8F]'
          : 'bg-white/[0.06] border-white/10 text-white/55'}`}
    >
      {isLifetime && <Crown size={10} weight="fill" className="text-amber-400" />}
      {displayName}
    </span>
  );
}

interface CustomerProfile {
  id: string;
  name?: string;
  segment: string;
  role: string;
  plan: string;
  subscription_expires_at: string;
  district: string;
}

interface UserPrivileges {
  can_view_dashboard: boolean;
  can_view_farms: boolean;
  can_edit_farms: boolean;
  can_view_inventory: boolean;
  can_edit_inventory: boolean;
  can_view_accounts: boolean;
  can_edit_accounts: boolean;
  can_view_payroll: boolean;
  can_edit_payroll: boolean;
  can_view_reports: boolean;
  can_manage_users: boolean;
  can_approve_payments: boolean;
}

interface NavItem {
  label: string;
  labelHi: string;
  href: string;
  icon: React.ElementType;
  segments: string[];  // which segments can see this
  roles: string[];     // which roles can see this ('all' = everyone)
  section?: string | null;  // section header for grouping
  showBadge?: boolean;  // show active farms count badge
  permissionKey?: keyof UserPrivileges;  // access gate from user_privileges
  subItems?: Array<{
    label: string;
    labelHi: string;
    href: string;
    icon: React.ElementType;
    permissionKey?: keyof UserPrivileges;
  }>;
}

const NAV_ITEMS: NavItem[] = [
  // OVERVIEW SECTION
  {
    label: 'Dashboard',
    labelHi: 'डैशबोर्ड',
    href: '/dashboard',
    icon: House,
    segments: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'admin'],
    roles: ['all'],
    section: 'OVERVIEW',
    permissionKey: 'can_view_dashboard',
  },
  // FARMS & FLOCKS SECTION
  {
    label: 'My Farms',
    labelHi: 'मेरे Farms',
    href: '/dashboard/farms',
    icon: House,
    segments: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'admin'],
    roles: ['all'],
    section: 'FARMS & FLOCKS',
    showBadge: true,
    permissionKey: 'can_view_farms',
  },
  {
    label: 'Daily Metrics',
    labelHi: 'दैनिक Metrics',
    href: '/dashboard/metrics',
    icon: ChartLine,
    segments: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'admin'],
    roles: ['all'],
    section: 'FARMS & FLOCKS',
    permissionKey: 'can_view_reports',
    subItems: [
      {
        label: 'FCR',
        labelHi: 'FCR',
        href: '/dashboard/metrics/fcr',
        icon: ChartBar,
        permissionKey: 'can_view_reports',
      },
      {
        label: 'Feed',
        labelHi: 'फीड',
        href: '/dashboard/metrics/feed',
        icon: Package,
        permissionKey: 'can_view_reports',
      },
      {
        label: 'Health',
        labelHi: 'स्वास्थ्य',
        href: '/dashboard/metrics/health',
        icon: ShieldCheck,
        permissionKey: 'can_view_reports',
      },
      {
        label: 'Mortality',
        labelHi: 'मृत्यु दर',
        href: '/dashboard/metrics/mortality',
        icon: Warning,
        permissionKey: 'can_view_reports',
      },
    ],
  },
  {
    label: 'Benchmark',
    labelHi: 'बेंचमार्क',
    href: '/dashboard/metrics/benchmark',
    icon: ChartBar,
    segments: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'admin'],
    roles: ['all'],
    section: 'FARMS & FLOCKS',
    permissionKey: 'can_view_reports',
  },
  {
    label: 'Reports',
    labelHi: 'Reports',
    href: '/dashboard/reports',
    icon: FileText,
    segments: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'admin'],
    roles: ['all'],
    section: 'FARMS & FLOCKS',
    permissionKey: 'can_view_reports',
  },
  // ANALYTICS SECTION
  {
    label: 'GC / लागत',
    labelHi: 'GC / लागत',
    href: '/dashboard/reports/gc-calculation',
    icon: Calculator,
    segments: ['S2', 'S3', 'S4', 'S5', 'S6', 'admin'],
    roles: ['all'],
    section: 'ANALYTICS',
    permissionKey: 'can_view_reports',
  },
  {
    label: 'Employees',
    labelHi: 'कर्मचारी',
    href: '/dashboard/employees',
    icon: Users,
    segments: ['S2', 'S3', 'S4', 'S5', 'S6', 'admin'],
    roles: ['all'],
    section: 'ANALYTICS',
    permissionKey: 'can_view_payroll',
    subItems: [
      {
        label: 'Expenses',
        labelHi: 'व्यय',
        href: '/dashboard/employees/expenses',
        icon: CurrencyDollar,
        permissionKey: 'can_view_payroll',
      },
      {
        label: 'Salary',
        labelHi: 'वेतन',
        href: '/dashboard/employees/salary',
        icon: CurrencyDollar,
        permissionKey: 'can_edit_payroll',
      },
    ],
  },
  {
    label: 'Price Intelligence',
    labelHi: 'भाव Intelligence',
    href: '/dashboard/price-intelligence',
    icon: ChartLineUp,
    segments: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'admin'],
    roles: ['all'],
    section: 'ANALYTICS',
    permissionKey: 'can_view_reports',
    subItems: [
      {
        label: 'Forecast',
        labelHi: 'पूर्वानुमान',
        href: '/dashboard/price-intelligence/forecast',
        icon: ChartLine,
        permissionKey: 'can_view_reports',
      },
      {
        label: 'Historical',
        labelHi: 'ऐतिहासिक',
        href: '/dashboard/price-intelligence/historical',
        icon: ClockCounterClockwise,
        permissionKey: 'can_view_reports',
      },
    ],
  },
  {
    label: 'Feed Intelligence',
    labelHi: 'फीड Intelligence',
    href: '/dashboard/feed-intelligence',
    icon: ChartBar,
    segments: ['S2', 'S3', 'S4', 'S5', 'S6', 'admin'],
    roles: ['all'],
    section: 'ANALYTICS',
    permissionKey: 'can_view_reports',
  },
  {
    label: 'Alerts',
    labelHi: 'चेतावनी',
    href: '/dashboard/alerts',
    icon: BellRinging,
    segments: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'admin'],
    roles: ['all'],
    section: 'ANALYTICS',
    permissionKey: 'can_view_dashboard',
  },
  {
    label: 'District Map',
    labelHi: 'जिला मानचित्र',
    href: '/dashboard/district-map',
    icon: MapPin,
    segments: ['S2', 'S3', 'S4', 'S5', 'S6', 'admin'],
    roles: ['all'],
    section: 'ANALYTICS',
    permissionKey: 'can_view_reports',
  },
  {
    label: 'Batch Optimizer',
    labelHi: 'बैच ऑप्टिमाइज़र',
    href: '/dashboard/batch-optimizer',
    icon: ChartPie,
    segments: ['S2', 'S3', 'S4', 'S5', 'S6', 'admin'],
    roles: ['all'],
    section: 'ANALYTICS',
    permissionKey: 'can_view_reports',
  },
  {
    label: 'Calculator',
    labelHi: 'कैलकुलेटर',
    href: '/dashboard/calculator',
    icon: Calculator,
    segments: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'admin'],
    roles: ['all'],
    section: 'ANALYTICS',
    permissionKey: 'can_view_reports',
  },
  {
    label: 'HACCP',
    labelHi: 'HACCP',
    href: '/dashboard/haccp',
    icon: ShieldCheck,
    segments: ['S2', 'S3', 'S4', 'S5', 'S6', 'admin'],
    roles: ['all'],
    section: 'ANALYTICS',
    permissionKey: 'can_view_reports',
  },
  // MASTERS SECTION
  {
    label: 'Company',
    labelHi: 'कंपनी',
    href: '/dashboard/masters/company',
    icon: Buildings,
    segments: ['S2', 'S3', 'S4', 'S5', 'S6', 'admin'],
    roles: ['all'],
    section: 'MASTERS',
    permissionKey: 'can_view_dashboard',
  },
  {
    label: 'Suppliers',
    labelHi: 'सप्लायर्स',
    href: '/dashboard/masters/suppliers',
    icon: Package,
    segments: ['S2', 'S3', 'S4', 'S5', 'S6', 'admin'],
    roles: ['all'],
    section: 'MASTERS',
    permissionKey: 'can_view_inventory',
  },
  {
    label: 'Farmers',
    labelHi: 'किसान',
    href: '/dashboard/masters/farmers',
    icon: Users,
    segments: ['S2', 'S3', 'S4', 'S5', 'S6', 'admin'],
    roles: ['all'],
    section: 'MASTERS',
    permissionKey: 'can_view_farms',
  },
  {
    label: 'Traders',
    labelHi: 'ट्रेडर्स',
    href: '/dashboard/masters/traders',
    icon: Handshake,
    segments: ['S2', 'S3', 'S4', 'S5', 'S6', 'admin'],
    roles: ['all'],
    section: 'MASTERS',
    permissionKey: 'can_view_accounts',
  },
  {
    label: 'Users & Privileges',
    labelHi: 'उपयोगकर्ता और विशेषाधिकार',
    href: '/dashboard/masters/users',
    icon: ShieldCheck,
    segments: ['S2', 'S3', 'S4', 'S5', 'S6', 'admin'],
    roles: ['all'],
    section: 'MASTERS',
    permissionKey: 'can_manage_users',
  },
  {
    label: 'Customers',
    labelHi: 'ग्राहक',
    href: '/dashboard/masters/customers',
    icon: Users,
    segments: ['S2', 'S3', 'S4', 'S5', 'S6', 'admin'],
    roles: ['all'],
    section: 'MASTERS',
    permissionKey: 'can_view_accounts',
  },
  // INVENTORY SECTION
  {
    label: 'Inventory',
    labelHi: 'इन्वेंटरी',
    href: '/dashboard/inventory',
    icon: Warehouse,
    segments: ['S2', 'S3', 'S4', 'S5', 'S6', 'admin'],
    roles: ['all'],
    section: 'INVENTORY',
    permissionKey: 'can_view_inventory',
  },
  {
    label: 'Products',
    labelHi: 'उत्पाद',
    href: '/dashboard/inventory/products',
    icon: Package,
    segments: ['S2', 'S3', 'S4', 'S5', 'S6', 'admin'],
    roles: ['all'],
    section: 'INVENTORY',
    permissionKey: 'can_view_inventory',
    subItems: [
      {
        label: 'Categories',
        labelHi: 'श्रेणियां',
        href: '/dashboard/inventory/categories',
        icon: Tag,
        permissionKey: 'can_view_inventory',
      },
      {
        label: 'Adjustments',
        labelHi: 'समायोजन',
        href: '/dashboard/inventory/adjustments',
        icon: Swap,
        permissionKey: 'can_edit_inventory',
      },
      {
        label: 'Chick Purchase',
        labelHi: 'चिक खरीद',
        href: '/dashboard/inventory/chick-purchase',
        icon: Bird,
        permissionKey: 'can_edit_inventory',
      },
    ],
  },
  {
    label: 'Stock Opening',
    labelHi: 'स्टॉक ओपनिंग',
    href: '/dashboard/inventory/branch-opening',
    icon: Warehouse,
    segments: ['S2', 'S3', 'S4', 'S5', 'S6', 'admin'],
    roles: ['all'],
    section: 'INVENTORY',
    permissionKey: 'can_edit_inventory',
  },
  {
    label: 'Purchase Orders',
    labelHi: 'PO',
    href: '/dashboard/inventory/po',
    icon: ClipboardText,
    segments: ['S2', 'S3', 'S4', 'S5', 'S6', 'admin'],
    roles: ['all'],
    section: 'INVENTORY',
    permissionKey: 'can_edit_inventory',
  },
  {
    label: 'Purchases',
    labelHi: 'खरीद',
    href: '/dashboard/inventory/direct-purchase',
    icon: ShoppingCart,
    segments: ['S2', 'S3', 'S4', 'S5', 'S6', 'admin'],
    roles: ['all'],
    section: 'INVENTORY',
    permissionKey: 'can_edit_inventory',
  },
  {
    label: 'Transfers',
    labelHi: 'ट्रांसफर',
    href: '/dashboard/inventory/transfers',
    icon: ArrowsLeftRight,
    segments: ['S2', 'S3', 'S4', 'S5', 'S6', 'admin'],
    roles: ['all'],
    section: 'INVENTORY',
    permissionKey: 'can_edit_inventory',
  },
  {
    label: 'Stock Reports',
    labelHi: 'स्टॉक रिपोर्ट',
    href: '/dashboard/inventory/reports',
    icon: FileText,
    segments: ['S2', 'S3', 'S4', 'S5', 'S6', 'admin'],
    roles: ['all'],
    section: 'INVENTORY',
    permissionKey: 'can_view_reports',
  },
  {
    label: 'Farmer Opening',
    labelHi: 'किसान ओपनिंग',
    href: '/dashboard/inventory/farmer-opening',
    icon: FolderOpen,
    segments: ['S2', 'S3', 'S4', 'S5', 'S6', 'admin'],
    roles: ['all'],
    section: 'INVENTORY',
    permissionKey: 'can_edit_inventory',
  },
  // BROILER SECTION
  {
    label: 'Shed Ready',
    labelHi: 'शेड रेडी',
    href: '/dashboard/broiler/integration/shed-ready',
    icon: CheckCircle,
    segments: ['S2', 'S3', 'S4', 'S5', 'S6', 'admin'],
    roles: ['all'],
    section: 'BROILER',
    permissionKey: 'can_view_farms',
  },
  {
    label: 'Chick Allocation',
    labelHi: 'चिक एलोकेशन',
    href: '/dashboard/broiler/integration/chick-alloc',
    icon: Bird,
    segments: ['S2', 'S3', 'S4', 'S5', 'S6', 'admin'],
    roles: ['all'],
    section: 'BROILER',
    permissionKey: 'can_view_farms',
  },
  {
    label: 'Feed Allocation',
    labelHi: 'फीड एलोकेशन',
    href: '/dashboard/broiler/integration/feed-alloc',
    icon: Package,
    segments: ['S2', 'S3', 'S4', 'S5', 'S6', 'admin'],
    roles: ['all'],
    section: 'BROILER',
    permissionKey: 'can_view_inventory',
  },
  {
    label: 'Bird Sales',
    labelHi: 'पक्षी बिक्री',
    href: '/dashboard/broiler/bird-sale',
    icon: ShoppingCart,
    segments: ['S2', 'S3', 'S4', 'S5', 'S6', 'admin'],
    roles: ['all'],
    section: 'BROILER',
    permissionKey: 'can_view_accounts',
  },
  {
    label: 'Supervisor Reports',
    labelHi: 'सुपरवाइजर रिपोर्ट',
    href: '/dashboard/broiler/supervisor/report-entry',
    icon: ClipboardText,
    segments: ['S2', 'S3', 'S4', 'S5', 'S6', 'admin'],
    roles: ['all'],
    section: 'BROILER',
    permissionKey: 'can_view_payroll',
  },
  {
    label: 'Incentives',
    labelHi: 'प्रोत्साहन',
    href: '/dashboard/broiler/incentive',
    icon: ChartBar,
    segments: ['S2', 'S3', 'S4', 'S5', 'S6', 'admin'],
    roles: ['all'],
    section: 'BROILER',
    permissionKey: 'can_view_payroll',
  },
  {
    label: 'Monthly Closing',
    labelHi: 'मासिक बंद',
    href: '/dashboard/broiler/monthly-closing',
    icon: Calendar,
    segments: ['S2', 'S3', 'S4', 'S5', 'S6', 'admin'],
    roles: ['all'],
    section: 'BROILER',
    permissionKey: 'can_view_payroll',
  },
  {
    label: 'Body Weight',
    labelHi: 'शरीर का वजन',
    href: '/dashboard/broiler/operations/body-weight',
    icon: Scales,
    segments: ['S2', 'S3', 'S4', 'S5', 'S6', 'admin'],
    roles: ['all'],
    section: 'BROILER',
    permissionKey: 'can_view_farms',
  },
  {
    label: 'Vehicles',
    labelHi: 'वाहन',
    href: '/dashboard/broiler/operations/vehicles',
    icon: Truck,
    segments: ['S2', 'S3', 'S4', 'S5', 'S6', 'admin'],
    roles: ['all'],
    section: 'BROILER',
    permissionKey: 'can_view_farms',
  },
  {
    label: 'Travel',
    labelHi: 'यात्रा',
    href: '/dashboard/broiler/operations/travel',
    icon: MapPin,
    segments: ['S2', 'S3', 'S4', 'S5', 'S6', 'admin'],
    roles: ['all'],
    section: 'BROILER',
    permissionKey: 'can_view_farms',
  },
  {
    label: 'Broiler Reports',
    labelHi: 'ब्रॉयलर रिपोर्ट',
    href: '/dashboard/broiler/reports/daily',
    icon: FileText,
    segments: ['S2', 'S3', 'S4', 'S5', 'S6', 'admin'],
    roles: ['all'],
    section: 'BROILER',
    permissionKey: 'can_view_reports',
    subItems: [
      {
        label: 'Batch Reports',
        labelHi: 'बैच रिपोर्ट',
        href: '/dashboard/broiler/reports/batch',
        icon: ClipboardText,
        permissionKey: 'can_view_reports',
      },
      {
        label: 'Farm Stock',
        labelHi: 'फार्म स्टॉक',
        href: '/dashboard/broiler/reports/stock',
        icon: Warehouse,
        permissionKey: 'can_view_reports',
      },
      {
        label: 'Mortality Reports',
        labelHi: 'मृत्यु दर रिपोर्ट',
        href: '/dashboard/broiler/reports/mortality',
        icon: Warning,
        permissionKey: 'can_view_reports',
      },
      {
        label: 'Monthly P&L',
        labelHi: 'मासिक P&L',
        href: '/dashboard/broiler/reports/monthly-pl',
        icon: TrendUp,
        permissionKey: 'can_view_reports',
      },
      {
        label: 'Feed & Medicine Register',
        labelHi: 'फीड और दवा रजिस्टर',
        href: '/dashboard/broiler/reports/feed-med-register',
        icon: ClipboardText,
        permissionKey: 'can_view_reports',
      },
      {
        label: 'Feed Transfer',
        labelHi: 'फीड ट्रांसफर',
        href: '/dashboard/broiler/reports/feed-transfer',
        icon: ArrowsLeftRight,
        permissionKey: 'can_view_reports',
      },
      {
        label: 'Live Birds',
        labelHi: 'लाइव बर्ड्स',
        href: '/dashboard/broiler/reports/live-birds',
        icon: Bird,
        permissionKey: 'can_view_reports',
      },
      {
        label: 'Payroll Reports',
        labelHi: 'पेयरोल रिपोर्ट',
        href: '/dashboard/broiler/reports/payroll',
        icon: CurrencyDollar,
        permissionKey: 'can_view_reports',
      },
      {
        label: 'Travel Reports',
        labelHi: 'यात्रा रिपोर्ट',
        href: '/dashboard/broiler/reports/travel',
        icon: MapPin,
        permissionKey: 'can_view_reports',
      },
    ],
  },
  {
    label: 'Travel Management',
    labelHi: 'यात्रा प्रबंधन',
    href: '/dashboard/broiler/travel',
    icon: MapPin,
    segments: ['S2', 'S3', 'S4', 'S5', 'S6', 'admin'],
    roles: ['all'],
    section: 'BROILER',
    permissionKey: 'can_view_farms',
  },
  {
    label: 'Vehicle Management',
    labelHi: 'वाहन प्रबंधन',
    href: '/dashboard/broiler/vehicles',
    icon: Truck,
    segments: ['S2', 'S3', 'S4', 'S5', 'S6', 'admin'],
    roles: ['all'],
    section: 'BROILER',
    permissionKey: 'can_view_farms',
  },
  // ACCOUNTS SECTION
  {
    label: 'Ledgers',
    labelHi: 'लेजर',
    href: '/dashboard/accounts/ledgers',
    icon: Books,
    segments: ['S2', 'S3', 'S4', 'S5', 'S6', 'admin'],
    roles: ['all'],
    section: 'ACCOUNTS',
    permissionKey: 'can_view_accounts',
    subItems: [
      {
        label: 'Groups',
        labelHi: 'समूह',
        href: '/dashboard/accounts/groups',
        icon: Folder,
        permissionKey: 'can_view_accounts',
      },
    ],
  },
  {
    label: 'Vouchers',
    labelHi: 'वाउचर',
    href: '/dashboard/accounts/vouchers/payment',
    icon: CreditCard,
    segments: ['S2', 'S3', 'S4', 'S5', 'S6', 'admin'],
    roles: ['all'],
    section: 'ACCOUNTS',
    permissionKey: 'can_edit_accounts',
    subItems: [
      {
        label: 'Contra',
        labelHi: 'कॉन्ट्रा',
        href: '/dashboard/accounts/vouchers/contra',
        icon: Swap,
        permissionKey: 'can_edit_accounts',
      },
      {
        label: 'Journal',
        labelHi: 'जर्नल',
        href: '/dashboard/accounts/vouchers/journal',
        icon: Notebook,
        permissionKey: 'can_edit_accounts',
      },
      {
        label: 'Receipt',
        labelHi: 'रसीद',
        href: '/dashboard/accounts/vouchers/receipt',
        icon: Receipt,
        permissionKey: 'can_edit_accounts',
      },
      {
        label: 'Employee',
        labelHi: 'कर्मचारी',
        href: '/dashboard/accounts/vouchers/employee',
        icon: Users,
        permissionKey: 'can_edit_accounts',
      },
    ],
  },
  {
    label: 'Bank Recon',
    labelHi: 'बैंक समाधान',
    href: '/dashboard/accounts/bank-recon',
    icon: Bank,
    segments: ['S2', 'S3', 'S4', 'S5', 'S6', 'admin'],
    roles: ['all'],
    section: 'ACCOUNTS',
    permissionKey: 'can_view_accounts',
  },
  {
    label: 'GST Reports',
    labelHi: 'GST रिपोर्ट',
    href: '/dashboard/accounts/gst/gstr1',
    icon: FileText,
    segments: ['S2', 'S3', 'S4', 'S5', 'S6', 'admin'],
    roles: ['all'],
    section: 'ACCOUNTS',
    permissionKey: 'can_view_accounts',
    subItems: [
      {
        label: 'GSTR-3B',
        labelHi: 'GSTR-3B',
        href: '/dashboard/accounts/gst/gstr3b',
        icon: FileText,
        permissionKey: 'can_view_accounts',
      },
    ],
  },
  {
    label: 'Trial Balance',
    labelHi: 'ट्रायल बैलेंस',
    href: '/dashboard/accounts/reports/trial-balance',
    icon: Scales,
    segments: ['S2', 'S3', 'S4', 'S5', 'S6', 'admin'],
    roles: ['all'],
    section: 'ACCOUNTS',
    permissionKey: 'can_view_reports',
  },
  {
    label: 'P & L',
    labelHi: 'लाभ और हानि',
    href: '/dashboard/accounts/reports/pl',
    icon: TrendUp,
    segments: ['S2', 'S3', 'S4', 'S5', 'S6', 'admin'],
    roles: ['all'],
    section: 'ACCOUNTS',
    permissionKey: 'can_view_reports',
    subItems: [
      {
        label: 'Balance Sheet',
        labelHi: 'बैलेंस शीट',
        href: '/dashboard/accounts/reports/balance-sheet',
        icon: FileText,
        permissionKey: 'can_view_reports',
      },
      {
        label: 'Daybook',
        labelHi: 'डेबुक',
        href: '/dashboard/accounts/reports/daybook',
        icon: Notebook,
        permissionKey: 'can_view_reports',
      },
      {
        label: 'Ledger Report',
        labelHi: 'लेजर रिपोर्ट',
        href: '/dashboard/accounts/reports/ledger',
        icon: Books,
        permissionKey: 'can_view_reports',
      },
    ],
  },
  // PAYROLL SECTION
  {
    label: 'Employees',
    labelHi: 'कर्मचारी',
    href: '/dashboard/employees',
    icon: Users,
    segments: ['S2', 'S3', 'S4', 'S5', 'S6', 'admin'],
    roles: ['all'],
    section: 'PAYROLL',
    permissionKey: 'can_view_payroll',
  },
  {
    label: 'Leave',
    labelHi: 'छुट्टी',
    href: '/dashboard/employees?tab=leave',
    icon: Calendar,
    segments: ['S2', 'S3', 'S4', 'S5', 'S6', 'admin'],
    roles: ['all'],
    section: 'PAYROLL',
    permissionKey: 'can_view_payroll',
  },
  {
    label: 'Salary',
    labelHi: 'वेतन',
    href: '/dashboard/employees?tab=salary',
    icon: CurrencyDollar,
    segments: ['S2', 'S3', 'S4', 'S5', 'S6', 'admin'],
    roles: ['all'],
    section: 'PAYROLL',
    permissionKey: 'can_edit_payroll',
  },
  // SETTINGS SECTION
  {
    label: 'Setup',
    labelHi: 'सेटअप',
    href: '/dashboard/setup',
    icon: GearSix,
    segments: ['S2', 'S3', 'S4', 'S5', 'S6', 'admin'],
    roles: ['all'],
    section: 'SETTINGS',
    permissionKey: 'can_manage_users',
  },
  {
    label: 'Billing',
    labelHi: 'बिलिंग',
    href: '/dashboard/settings/billing',
    icon: CreditCard,
    segments: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'admin'],
    roles: ['all'],
    section: 'SETTINGS',
  },
  {
    label: 'Profile',
    labelHi: 'प्रोफाइल',
    href: '/dashboard/settings/profile',
    icon: User,
    segments: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'admin'],
    roles: ['all'],
    section: 'SETTINGS',
  },
  {
    label: 'Password',
    labelHi: 'पासवर्ड',
    href: '/dashboard/settings/password',
    icon: Key,
    segments: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'admin'],
    roles: ['all'],
    section: 'SETTINGS',
  },
  // REPORTS SECTION
  {
    label: 'GC Calculation',
    labelHi: 'GC गणना',
    href: '/dashboard/reports/gc-calculation',
    icon: Calculator,
    segments: ['S2', 'S3', 'S4', 'S5', 'S6', 'admin'],
    roles: ['all'],
    section: 'REPORTS',
    permissionKey: 'can_view_reports',
  },
  {
    label: 'Integrator Reports',
    labelHi: 'इंटीग्रेटर रिपोर्ट',
    href: '/dashboard/reports/integrator',
    icon: Factory,
    segments: ['S2', 'S3', 'S4', 'S5', 'S6', 'admin'],
    roles: ['all'],
    section: 'REPORTS',
    permissionKey: 'can_view_reports',
  },
];

interface SidebarProps {
  customer: CustomerProfile;
}

export function Sidebar({ customer }: SidebarProps) {
  const pathname = usePathname();
  const { entitlements } = useEntitlements();
  const { language } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeFarmsCount, setActiveFarmsCount] = useState<number>(0);
  const [userPrivileges, setUserPrivileges] = useState<UserPrivileges | null>(null);

  // Persist collapsed state to localStorage
  useEffect(() => {
    const savedCollapsed = localStorage.getItem('sidebar-collapsed');
    if (savedCollapsed !== null) {
      setIsCollapsed(savedCollapsed === 'true');
    }
  }, []);

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebar-collapsed', String(newState));
  };

  // Fetch user privileges from user_privileges table
  useEffect(() => {
    const fetchUserPrivileges = async () => {
      try {
        const supabase = createClient();
        if (!supabase) {
          // Demo mode - grant all permissions
          setUserPrivileges({
            can_view_dashboard: true,
            can_view_farms: true,
            can_edit_farms: true,
            can_view_inventory: true,
            can_edit_inventory: true,
            can_view_accounts: true,
            can_edit_accounts: true,
            can_view_payroll: true,
            can_edit_payroll: true,
            can_view_reports: true,
            can_manage_users: true,
            can_approve_payments: true,
          });
          return;
        }
        const { data, error } = await supabase
          .from('user_privileges')
          .select('*')
          .eq('integrator_id', customer.id)
          .eq('user_id', customer.id)
          .single();

        if (!error && data) {
          setUserPrivileges({
            can_view_dashboard: data.can_view_dashboard ?? true,
            can_view_farms: data.can_view_farms ?? true,
            can_edit_farms: data.can_edit_farms ?? false,
            can_view_inventory: data.can_view_inventory ?? false,
            can_edit_inventory: data.can_edit_inventory ?? false,
            can_view_accounts: data.can_view_accounts ?? false,
            can_edit_accounts: data.can_edit_accounts ?? false,
            can_view_payroll: data.can_view_payroll ?? false,
            can_edit_payroll: data.can_edit_payroll ?? false,
            can_view_reports: data.can_view_reports ?? true,
            can_manage_users: data.can_manage_users ?? false,
            can_approve_payments: data.can_approve_payments ?? false,
          });
        } else {
          // Default privileges if no record exists
          setUserPrivileges({
            can_view_dashboard: true,
            can_view_farms: true,
            can_edit_farms: false,
            can_view_inventory: false,
            can_edit_inventory: false,
            can_view_accounts: false,
            can_edit_accounts: false,
            can_view_payroll: false,
            can_edit_payroll: false,
            can_view_reports: true,
            can_manage_users: false,
            can_approve_payments: false,
          });
        }
      } catch (error) {
        console.error('Error fetching user privileges:', error);
        // Default privileges on error
        setUserPrivileges({
          can_view_dashboard: true,
          can_view_farms: true,
          can_edit_farms: false,
          can_view_inventory: false,
          can_edit_inventory: false,
          can_view_accounts: false,
          can_edit_accounts: false,
          can_view_payroll: false,
          can_edit_payroll: false,
          can_view_reports: true,
          can_manage_users: false,
          can_approve_payments: false,
        });
      }
    };

    fetchUserPrivileges();
  }, [customer.id]);

  // Fetch active farms count for S2 integrators
  useEffect(() => {
    if (customer.segment === 'S2' || customer.role === 'admin') {
      const fetchActiveFarmsCount = async () => {
        try {
          const supabase = createClient();
          if (!supabase) {
            // Demo mode - use mock count
            setActiveFarmsCount(3);
            return;
          }
          const { count, error } = await supabase
            .from('farms')
            .select('*', { count: 'exact', head: true })
            .eq('integrator_id', customer.id)
            .eq('status', 'active');

          if (!error && count !== null) {
            setActiveFarmsCount(count);
          }
        } catch (error) {
          // Demo mode - use mock count on error
          console.error('Error fetching active farms count:', error);
          setActiveFarmsCount(3);
        }
      };

      fetchActiveFarmsCount();
    }
  }, [customer.id, customer.segment, customer.role]);

  // Expiry warning: < 30 days remaining
  const daysLeft = Math.ceil(
    (new Date(customer.subscription_expires_at).getTime() - Date.now()) / 86_400_000
  );
  const showExpiryWarning = daysLeft > 0 && daysLeft <= 30;
  const showExpiryUrgent = daysLeft > 0 && daysLeft <= 7;
  const isExpired = daysLeft <= 0;

  // Filter nav items by customer segment/role and user privileges
  const visibleItems = NAV_ITEMS.filter(item => {
    // Check segment/role access
    const hasSegmentAccess = item.segments.includes(customer.segment) ||
      item.segments.includes(customer.role);

    if (!hasSegmentAccess) return false;

    // Check permission access gate
    if (item.permissionKey && userPrivileges) {
      return userPrivileges[item.permissionKey] === true;
    }

    // If no permission key, allow access (backward compatibility)
    return true;
  });

  // variant scopes the shared layoutId so the desktop rail and the mobile
  // drawer (both rendered from this same function) never fight over one
  // animated element when both are mounted at once.
  const SidebarContent = ({ variant }: { variant: 'desktop' | 'mobile' }) => (
    <Tooltip.Provider>
      <div
        style={{ '--brand': FlockIQTokens.brand400 } as React.CSSProperties}
        className={`relative flex flex-col h-full bg-gradient-to-b from-[#1E1E20] to-[#1A1A1C] text-white/60 border-r border-white/[0.06] transition-[width] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none ${isCollapsed ? 'w-[64px]' : 'w-[240px]'}`}
      >
        {/* Logo */}
        <div className={`px-5 py-5 border-b border-white/[0.06] h-[73px] flex items-center relative ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className={`flex items-center gap-3 ${isCollapsed ? 'hidden' : ''}`}>
            <Image
              src="/images/logo.png"
              alt="FlockIQ Icon"
              width={32}
              height={32}
              className="h-8 w-8 object-contain bg-white rounded-md p-0.5"
              priority
            />
            <span className="text-white font-bold text-[17px] tracking-tight">FlockIQ</span>
          </div>
          
          {isCollapsed && (
            <Image
              src="/images/logo.png"
              alt="FlockIQ"
              width={32}
              height={32}
              className="h-8 w-8 object-contain bg-white rounded-md p-0.5 cursor-pointer"
              onClick={toggleCollapse}
              priority
            />
          )}

          {/* Collapse toggle - floating top right */}
          <button
            onClick={toggleCollapse}
            className={`hidden lg:flex items-center justify-center w-6 h-6 rounded-md text-white/45 hover:bg-white/10 hover:text-white transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]/50 ${isCollapsed ? 'absolute -right-3 top-[24px] bg-[#1C1C1E] border border-white/10 rounded-full z-10 w-6 h-6 hover:bg-[#2A2A2C]' : ''}`}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <CaretRight size={12} weight="bold" aria-hidden="true" />
            ) : (
              <CaretLeft size={16} weight="bold" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* User block (Avatar removed, leaving only expiry warnings) */}
        {!isCollapsed && (showExpiryWarning || isExpired) && (
          <div className="px-4 pb-4 pt-2 border-b border-white/[0.06]">            {/* Expiry warning */}
            {showExpiryWarning && (
              <div className={`mt-3 border rounded-xl px-3 py-2 flex items-start gap-2 ${showExpiryUrgent
                  ? 'bg-red-500/[0.08] border-red-500/20'
                  : 'bg-amber-500/[0.08] border-amber-500/20'
                }`}>
                <Warning
                  size={14}
                  weight="fill"
                  className={`mt-[1px] flex-shrink-0 ${showExpiryUrgent ? 'text-red-400' : 'text-amber-400'}`}
                />
                <div className="min-w-0">
                  <p className={`text-[11px] font-medium leading-snug ${showExpiryUrgent ? 'text-red-400' : 'text-amber-400'
                    }`}>
                    Trial expires in {daysLeft} {daysLeft === 1 ? 'day' : 'days'}
                  </p>
                  <Link
                    href="/dashboard/settings/billing"
                    className={`text-[11px] font-medium underline underline-offset-2 hover:opacity-80 transition-opacity ${showExpiryUrgent ? 'text-red-300' : 'text-amber-300'
                      }`}
                  >
                    Renew now →
                  </Link>
                </div>
              </div>
            )}
            {isExpired && (
              <div className="mt-3 bg-red-500/[0.08] border border-red-500/20 rounded-xl px-3 py-2 flex items-start gap-2">
                <Warning size={14} weight="fill" className="mt-[1px] flex-shrink-0 text-red-400" />
                <div className="min-w-0">
                  <p className="text-red-400 text-[11px] font-medium leading-snug">
                    Trial expired
                  </p>
                  <Link
                    href="/dashboard/settings/billing"
                    className="text-red-300 text-[11px] font-medium underline underline-offset-2 hover:opacity-80 transition-opacity"
                  >
                    Renew now →
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Lifetime Deal Status Widget - shown below user block for lifetime customers */}
        {!isCollapsed && <LifetimeDealStatus />}


        {/* Nav items */}
        <nav
          className="flex-1 px-4 py-4 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.12)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20"
          aria-label="Dashboard navigation"
        >
          <ul role="list" className="space-y-0.5">
            {visibleItems.map((item, index) => {
              const isActive = pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href));
              const Icon = item.icon;
              const showSectionHeader = item.section && (index === 0 || visibleItems[index - 1]?.section !== item.section);
              const hasSubItems = item.subItems && item.subItems.length > 0;
              const isParentActive = hasSubItems && pathname.startsWith(item.href);
              const isHighlighted = isActive || isParentActive;
              const iconWeight = isHighlighted ? 'fill' : 'regular';

              return (
                <React.Fragment key={item.href}>
                  {showSectionHeader && !isCollapsed && (
                    <li
                      className={`px-2 pb-1.5 text-[10px] font-bold tracking-[0.12em] uppercase text-white/30 ${index === 0 ? 'pt-1' : 'pt-5 mt-3 border-t border-white/[0.05]'
                        }`}
                    >
                      {item.section}
                    </li>
                  )}
                  <li role="listitem">
                    {isCollapsed ? (
                      <Tooltip.Root delayDuration={0}>
                        <Tooltip.Trigger asChild>
                          <Link
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className={`
                              group relative flex items-center justify-center px-2 py-2 rounded-xl
                              text-[13px] transition-colors duration-150 ease-out
                              focus-visible:outline-none focus-visible:ring-2
                              focus-visible:ring-[var(--brand)]/50 min-h-[36px]
                              ${isHighlighted ? 'text-white' : 'text-white/55 hover:text-white'}
                            `}
                            aria-current={isActive ? 'page' : undefined}
                          >
                            {isHighlighted && (
                              <motion.span
                                layoutId={`active-pill-${variant}`}
                                className="absolute inset-0 rounded-xl bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                                transition={shouldReduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 38 }}
                              />
                            )}
                            <span className="absolute inset-0 rounded-xl group-hover:bg-white/5 transition-colors duration-150" />
                            <Icon
                              size={20}
                              weight={iconWeight}
                              aria-hidden="true"
                              className="relative flex-shrink-0"
                            />
                          </Link>
                        </Tooltip.Trigger>
                        <Tooltip.Portal>
                          <Tooltip.Content
                            className="bg-white text-gray-900 px-3 py-1.5 rounded-md text-[12px] font-medium shadow-lg border border-black/5"
                            sideOffset={8}
                          >
                            {language === 'hi' ? item.labelHi : item.label}
                            <Tooltip.Arrow className="fill-white" />
                          </Tooltip.Content>
                        </Tooltip.Portal>
                      </Tooltip.Root>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`
                          group relative flex items-center gap-3 px-3 py-1.5 rounded-xl
                          text-[13px] transition-colors duration-150 ease-out
                          focus-visible:outline-none focus-visible:ring-2
                          focus-visible:ring-[var(--brand)]/50 min-h-[36px] leading-tight
                          ${isHighlighted ? 'text-white font-semibold' : 'text-white/60 font-normal hover:text-white'}
                        `}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        {isHighlighted && (
                          <motion.span
                            layoutId={`active-pill-${variant}`}
                            className="absolute inset-0 rounded-xl bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                            transition={shouldReduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 38 }}
                          />
                        )}
                        <span className="absolute inset-0 rounded-xl group-hover:bg-white/5 transition-colors duration-150" />
                        <Icon
                          size={20}
                          weight={iconWeight}
                          aria-hidden="true"
                          className="relative flex-shrink-0"
                        />
                        <span className="relative truncate">{language === 'hi' ? item.labelHi : item.label}</span>
                        {item.showBadge && activeFarmsCount > 0 && (
                          <span className="relative ml-auto text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#3DAE72] text-white shadow-sm">
                            {activeFarmsCount}
                          </span>
                        )}
                      </Link>
                    )}
                  </li>
                  {/* Sub-items - shown when parent is active and not collapsed */}
                  <AnimatePresence initial={false}>
                    {hasSubItems && isParentActive && !isCollapsed && (
                      <motion.li
                        role="list"
                        className="ml-6 overflow-hidden"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.2, ease: 'easeOut' }}
                      >
                        <div className="space-y-0.5 pt-0.5">
                          {item.subItems!.map((subItem) => {
                            const isSubActive = pathname === subItem.href;
                            const SubIcon = subItem.icon;
                            return (
                              <Link
                                key={subItem.href}
                                href={subItem.href}
                                onClick={() => setMobileOpen(false)}
                                className={`
                                  flex items-center gap-3 px-3 py-1.5 rounded-lg
                                  text-[12.5px] font-medium transition-colors duration-150 ease-out
                                  focus-visible:outline-none focus-visible:ring-2
                                  focus-visible:ring-[var(--brand)]/50 relative min-h-[32px] leading-tight
                                  ${isSubActive
                                    ? 'text-white bg-white/[0.06] before:content-[""] before:absolute before:left-[-13px] before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-[14px] before:rounded-full before:bg-[var(--brand)]'
                                    : 'text-white/45 hover:text-white hover:bg-white/[0.04]'
                                  }
                                `}
                                aria-current={isSubActive ? 'page' : undefined}
                              >
                                <SubIcon size={15} weight={isSubActive ? 'fill' : 'regular'} aria-hidden="true" className="flex-shrink-0" />
                                <span className="truncate">{language === 'hi' ? subItem.labelHi : subItem.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      </motion.li>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-white/[0.06] space-y-0.5">

          {/* WhatsApp support - hidden when collapsed */}
          {!isCollapsed && (
            <a
              href="https://wa.me/91XXXXXXXXXX?text=Support%20chahiye"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-1.5 rounded-xl text-white/45
                         hover:bg-white/5 hover:text-white text-[13px] font-medium transition-colors duration-150 min-h-[36px]
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]/50"
            >
              <ChatCircleDots size={16} weight="regular" aria-hidden="true" className="flex-shrink-0" />
              {language === 'hi' ? 'व्हाट्सएप सपोर्ट' : 'WhatsApp Support'}
            </a>
          )}

          {/* Logout - hidden when collapsed */}
          {!isCollapsed && (
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="w-full flex items-center gap-3 px-3 py-1.5 rounded-xl
                           text-white/45 hover:bg-red-500/10 hover:text-red-400
                           text-[13px] font-medium transition-colors duration-150 text-left min-h-[36px]
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/50"
              >
                <SignOut size={16} weight="regular" aria-hidden="true" />
                {language === 'hi' ? 'लॉग आउट' : 'Logout'}
              </button>
            </form>
          )}
        </div>
      </div>
    </Tooltip.Provider>
  );

  return (
    <>
      {/* Desktop sidebar — always visible at lg+ */}
      <aside
        className={`hidden lg:flex flex-shrink-0 h-[100dvh] flex-col transition-[width] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none ${isCollapsed ? 'w-[64px]' : 'w-[240px]'}`}
        aria-label="Sidebar navigation"
        id="sidebar-nav"
      >
        <SidebarContent variant="desktop" />
      </aside>

      {/* Mobile: hamburger button (in header — rendered here for z-index) */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 w-12 h-12 flex items-center
                   justify-center bg-white rounded-2xl shadow-lg
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandOrange500
                   active:scale-95 transition-transform duration-150"
        aria-label="Navigation menu खोलें"
        aria-expanded={mobileOpen}
        aria-controls="mobile-sidebar"
      >
        <List size={20} weight="bold" aria-hidden="true" />
      </button>

      {/* Mobile overlay */}
      <AnimatePresence mode="wait">
        {mobileOpen && (
          <div className="lg:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-40"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />

            {/* Drawer */}
            <motion.aside
              id="mobile-sidebar"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
              className="fixed left-0 top-0 bottom-0 w-[240px] z-50 shadow-2xl"
              aria-label="Mobile sidebar navigation"
            >
              {/* Close button */}
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 w-10 h-10 flex items-center
                           justify-center rounded-full text-white/60 hover:text-white
                           hover:bg-white/10 transition-colors duration-150 z-10
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                aria-label="Navigation बंद करें"
              >
                <X size={18} aria-hidden="true" />
              </button>
              <SidebarContent variant="mobile" />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}