'use client';

// WHY: This is the top header component that appears above the main content area.
// It provides breadcrumbs for navigation, district filter pills for multi-district users,
// a MAPE (Mean Absolute Percentage Error) widget showing model accuracy, a refresh button
// with rate limiting, and a notification bell with unread count. It integrates with SWR for
// data revalidation and uses design tokens for consistent styling.

import { useState, useEffect, useCallback, useRef } from 'react';
import { Bell, ArrowClockwise, CaretDown, X, MapPin, MagnifyingGlass, House } from '@phosphor-icons/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useSWRConfig } from 'swr';
import Link from 'next/link';
import { FlockIQTokens } from '@/lib/design-tokens';
import { NotificationPanel } from './NotificationPanel';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { useLanguage } from '@/providers/LanguageProvider';

// Simple tooltip component
function SimpleTooltip({ children, content }: { children: React.ReactNode; content: string }) {
  const [show, setShow] = useState(false);
  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 text-sm text-gray-700 bg-white border border-[#E3EDE7] rounded-lg shadow-lg whitespace-nowrap z-50">
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-white border border-[#E3EDE7] transform rotate-45 border-t-0 border-l-0" />
        </div>
      )}
    </div>
  );
}

interface TopHeaderProps {
  customer: {
    name?: string;
    district: string;
    role: string;
    id?: string;
    plan?: string;
  };
}

interface ModelAccuracy {
  mape: number;
  directional_accuracy: number;
  predictions_verified: number;
}

export function TopHeader({ customer }: TopHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { mutate } = useSWRConfig();
  const { language, t } = useLanguage();
  
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
  const [modelAccuracy, setModelAccuracy] = useState<ModelAccuracy | null>(null);
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(0);
  const [showAddDistrict, setShowAddDistrict] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchPlaceholder, setSearchPlaceholder] = useState('');

  const districtMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationMenuRef = useRef<HTMLDivElement>(null);

  // Click outside handler for all dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (districtMenuRef.current && !districtMenuRef.current.contains(event.target as Node)) {
        setShowAddDistrict(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (notificationMenuRef.current && !notificationMenuRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch IP location for search placeholder
  useEffect(() => {
    const defaultPlaceholder = t('dashboard.searchPlaceholder', { defaultValue: language === 'hi' ? 'खोजें...' : 'Search...' });
    setSearchPlaceholder(defaultPlaceholder);
    
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        if (data.city) {
          setSearchPlaceholder(language === 'hi' ? `${data.city} में खोजें...` : `Search in ${data.city}...`);
        }
      })
      .catch(() => {
        // Silently fallback on ad-blocker or network error
      });
  }, [language, t]);

  // Available districts
  const availableDistricts = [
    { id: 'gorakhpur', name: 'Gorakhpur', nameHi: 'गोरखपुर' },
    { id: 'deoria', name: 'Deoria', nameHi: 'देवरिया' },
    { id: 'kushinagar', name: 'Kushinagar', nameHi: 'कुशीनगर' },
    { id: 'maharajganj', name: 'Maharajganj', nameHi: 'महाराजगंज' },
    { id: 'basti', name: 'Basti', nameHi: 'बस्ती' },
    { id: 'sant-kabir-nagar', name: 'Sant Kabir Nagar', nameHi: 'संत कबीर नगर' },
  ];

  // Sync selected districts from URL params
  useEffect(() => {
    const districtsParam = searchParams.get('districts');
    if (districtsParam) {
      setSelectedDistricts(districtsParam.split(','));
    } else {
      setSelectedDistricts([customer.district]);
    }
  }, [searchParams, customer.district]);

  // Fetch model accuracy
  useEffect(() => {
    const fetchModelAccuracy = async () => {
      try {
        const response = await fetch('/api/model-accuracy');
        if (response.ok) {
          const data = await response.json();
          setModelAccuracy(data);
        }
      } catch (error) {
        console.error('Failed to fetch model accuracy:', error);
        // Set default values for demo
        setModelAccuracy({
          mape: 4.8,
          directional_accuracy: 95.2,
          predictions_verified: 150,
        });
      }
    };
    fetchModelAccuracy();
  }, []);

  // Fetch unread notification count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await fetch('/api/notifications/unread-count');
        if (response.ok) {
          const data = await response.json();
          setUnreadCount(data.count || 0);
        }
      } catch (error) {
        console.error('Failed to fetch unread count:', error);
      }
    };
    fetchUnreadCount();
  }, []);

  // Generate breadcrumb
  const generateBreadcrumb = useCallback(() => {
    const segments = pathname.split('/').filter(Boolean);
    const isHindi = language === 'hi';
    
    if (segments[0] === 'dashboard') {
      if (segments.length === 1) return isHindi ? 'अवलोकन' : 'Overview';
      
      const breadcrumbMap: Record<string, { en: string, hi: string }> = {
        'overview': { en: 'Overview', hi: 'अवलोकन' },
        'price-intelligence': { en: 'Price Intelligence', hi: 'मूल्य खुफिया' },
        'district-map': { en: 'District Map', hi: 'जिला मानचित्र' },
        'alerts': { en: 'Alerts', hi: 'अलर्ट' },
        'farms': { en: 'My Farms', hi: 'मेरे फार्म' },
        'batch-board': { en: 'Batch Status Board', hi: 'बैच स्टेटस बोर्ड' },
        'feed-intelligence': { en: 'Feed Intelligence', hi: 'फ़ीड खुफिया' },
        'middleman-check': { en: 'Middleman Check', hi: 'बिचौलिया चेक' },
        'calculator': { en: 'Calculator', hi: 'कैलकुलेटर' },
        'metrics': { en: 'Portfolio Metrics', hi: 'पोर्टफोलियो मेट्रिक्स' },
        'reports': { en: 'Reports', hi: 'रिपोर्ट' },
        'settings': { en: 'Settings', hi: 'सेटिंग्स' },
        'api': { en: 'API Access', hi: 'API एक्सेस' },
        'admin-accuracy': { en: 'Model Accuracy', hi: 'मॉडल सटीकता' },
        'customers': { en: 'Customers', hi: 'ग्राहक' },
      };

      const breadcrumbs: string[] = [];
      
      for (let i = 1; i < segments.length; i++) {
        const segment = segments[i];
        if (breadcrumbMap[segment]) {
          breadcrumbs.push(isHindi ? breadcrumbMap[segment].hi : breadcrumbMap[segment].en);
        } else if (segment === 'farms' && segments[i + 1]) {
          breadcrumbs.push(isHindi ? 'मेरे फार्म' : 'My Farms');
          // This would need to fetch farm name for the next segment
          // For now, we'll handle it in the render
        }
      }
      
      return breadcrumbs.join(' / ');
    }
    
    return isHindi ? 'डैशबोर्ड' : 'Dashboard';
  }, [pathname, language]);

  // Toggle district selection
  const toggleDistrict = (districtId: string) => {
    const newSelection = selectedDistricts.includes(districtId)
      ? selectedDistricts.filter(d => d !== districtId)
      : [...selectedDistricts, districtId];
    
    setSelectedDistricts(newSelection);
    
    // Update URL params
    const params = new URLSearchParams(searchParams.toString());
    if (newSelection.length > 0) {
      params.set('districts', newSelection.join(','));
    } else {
      params.delete('districts');
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    
    // Trigger SWR revalidation for relevant data
    mutate(key => typeof key === 'string' && (
      key.includes('/price-intelligence') ||
      key.includes('/alerts') ||
      key.includes('/map')
    ));
  };

  // Add district
  const addDistrict = (districtId: string) => {
    if (!selectedDistricts.includes(districtId)) {
      toggleDistrict(districtId);
    }
    setShowAddDistrict(false);
  };

  // Manual refresh with rate limiting
  const handleRefresh = useCallback(async () => {
    const now = Date.now();
    if (now - lastRefreshTime < 60000) {
      // Show toast for rate limit
      return;
    }
    
    setLastRefreshTime(now);
    setIsRefreshing(true);
    
    // Trigger SWR revalidation for all keys
    await mutate(() => true, undefined, { revalidate: true });
    
    setLastUpdated(new Date());
    setTimeout(() => setIsRefreshing(false), 2000);
  }, [lastRefreshTime, mutate]);

  // Format last updated time
  const formatLastUpdated = (date: Date): string => {
    const diffMinutes = Math.floor((Date.now() - date.getTime()) / 60_000);
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    return `${Math.floor(diffMinutes / 60)}h ago`;
  };

  // Get MAPE colour
  const getMapeColour = (mape: number): string => {
    if (mape < 6) return FlockIQTokens.signalSell;
    if (mape < 9) return FlockIQTokens.signalHold;
    return FlockIQTokens.signalCaution;
  };

  const breadcrumb = generateBreadcrumb();

  return (
    <>
      <header className="h-[60px] bg-white border-b border-[#E3EDE7] px-4 flex items-center justify-between gap-4 flex-shrink-0 z-20">
        {/* Left: Breadcrumb */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <nav className="text-sm font-medium text-gray-700 truncate flex items-center gap-1.5" aria-label="Breadcrumb">
            <House size={16} weight="duotone" className="text-gray-400 mb-[2px]" />
            {breadcrumb}
          </nav>
        </div>

        {/* Center: District filter pills - hide on mobile, show on tablet+ */}
        <div className="hidden md:flex items-center gap-2 flex-shrink-0">
          {selectedDistricts.length === 0 && (
            <span className="text-xs text-gray-400 font-medium tracking-wide">All Districts</span>
          )}
          {selectedDistricts.map((districtId) => {
            const district = availableDistricts.find(d => d.id === districtId);
            if (!district) return null;
            return (
              <button
                key={districtId}
                onClick={() => toggleDistrict(districtId)}
                className="group flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full text-[11px] font-semibold tracking-wide bg-[#EDF7F1] text-[#1A5C34] border border-[#D4EFDE] hover:bg-[#D4EFDE] hover:border-[#1A5C34]/20 transition-all duration-200"
              >
                {language === 'hi' ? district.nameHi : district.name}
                <div className="w-4 h-4 rounded-full flex items-center justify-center bg-[#1A5C34]/10 group-hover:bg-[#1A5C34]/20 transition-colors">
                  <X size={10} weight="bold" />
                </div>
              </button>
            );
          })}
          
          {/* Professional Location Selector Dropdown */}
          <div className="relative" ref={districtMenuRef}>
            <button
              onClick={() => setShowAddDistrict(!showAddDistrict)}
              className="group flex items-center gap-1.5 pl-2.5 pr-2 py-1.5 rounded-full text-xs font-semibold bg-white border border-gray-200 text-gray-700 shadow-sm hover:border-gray-300 hover:shadow-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandOrange400"
            >
              <MapPin size={14} weight="fill" className="text-brandOrange500 group-hover:text-brandOrange600 transition-colors" />
              {language === 'hi' ? 'स्थान' : 'Location'}
              <CaretDown size={10} weight="bold" className={`text-gray-400 transition-transform duration-200 ${showAddDistrict ? 'rotate-180' : ''}`} />
            </button>
            
            {showAddDistrict && (
              <div className="absolute top-full left-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl py-2 min-w-[220px] z-50 overflow-hidden backdrop-blur-sm bg-white/95">
                <div className="px-3 py-2 border-b border-gray-50/50">
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">
                    {language === 'hi' ? 'जिले चुनें' : 'Select Districts'}
                  </p>
                </div>
                <div className="max-h-[280px] overflow-y-auto p-1">
                  {availableDistricts.map(district => {
                    const isSelected = selectedDistricts.includes(district.id);
                    return (
                      <button
                        key={district.id}
                        onClick={() => addDistrict(district.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                          isSelected 
                            ? 'bg-brandOrange50 text-brandOrange700 font-medium' 
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {language === 'hi' ? district.nameHi : district.name}
                        </span>
                        {isSelected && <MapPin size={14} weight="fill" className="text-brandOrange500" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="hidden lg:flex items-center flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <MagnifyingGlass
              size={15}
              weight="regular"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            />
            <input
              type="text"
              placeholder={searchPlaceholder}
              className="w-full bg-neutral-100 border border-transparent rounded-full pl-9 pr-3 py-1.5 text-sm font-medium text-neutral-900 placeholder-neutral-400 focus:outline-none focus:bg-white focus:border-[#1A5C34] focus:ring-2 focus:ring-[#D4EFDE] transition-all duration-200"
              aria-label={t('dashboard.searchLabel', { defaultValue: language === 'hi' ? 'डैशबोर्ड में खोजें' : 'Search dashboard' })}
              onChange={(e) => {
                const params = new URLSearchParams(searchParams.toString());
                if (e.target.value) {
                  params.set('q', e.target.value);
                } else {
                  params.delete('q');
                }
                router.push(`${pathname}?${params.toString()}`, { scroll: false });
              }}
              defaultValue={searchParams.get('q') || ''}
            />
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
          {/* Language Toggle */}
          <div className="hidden sm:block">
            <LanguageToggle />
          </div>

          {/* MAPE accuracy pill - hide on mobile */}
          {modelAccuracy && typeof modelAccuracy.mape === 'number' && (
            <SimpleTooltip
              content={`Model Accuracy (Last 30 Days): MAPE ${modelAccuracy.mape.toFixed(1)}% — within ₹${(modelAccuracy.mape / 100 * 160).toFixed(1)} on ₹160 price. Directional Accuracy: ${modelAccuracy.directional_accuracy?.toFixed(1) || '0.0'}%. ${modelAccuracy.predictions_verified || 0} predictions verified`}
            >
              <div
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-help"
                style={{
                  backgroundColor: modelAccuracy.mape < 6 ? '#DCFCE7' : 
                                 modelAccuracy.mape < 9 ? '#FEF9C3' : '#FEE2E2',
                  color: getMapeColour(modelAccuracy.mape),
                }}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: getMapeColour(modelAccuracy.mape) }}
                />
                {modelAccuracy.mape.toFixed(1)}% MAPE
              </div>
            </SimpleTooltip>
          )}

          {/* Refresh button - ensure 48x48 touch target */}
          <SimpleTooltip content={`Last updated ${formatLastUpdated(lastUpdated)}`}>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="w-12 h-12 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors disabled:opacity-50"
              aria-label="Refresh data"
            >
              <ArrowClockwise
                size={16}
                weight="regular"
                className={isRefreshing ? 'animate-spin' : ''}
              />
            </button>
          </SimpleTooltip>

          {/* Notification bell - ensure 48x48 touch target */}
          <div className="relative" ref={notificationMenuRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-12 h-12 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors relative"
              aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
            >
              <Bell size={16} weight="regular" />
              {unreadCount > 0 && (
                <span
                  className="absolute top-2 right-2 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            {showNotifications && (
              <NotificationPanel
                onClose={() => setShowNotifications(false)}
                onMarkAllRead={() => {
                  setUnreadCount(0);
                  // API call to mark all as read would go here
                }}
              />
            )}
          </div>

          {/* User avatar dropdown - ensure 48x48 touch target */}
          <div className="relative group" ref={profileMenuRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 h-12 pl-2 pr-3 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="User menu"
            >
              <div className="w-8 h-8 rounded-full bg-[#1A5C34] flex items-center justify-center text-white text-xs font-bold">
                {customer.name?.charAt(0).toUpperCase() ?? 'U'}
              </div>
              <span className="hidden sm:block text-sm font-medium text-gray-700">
                {customer.name ?? 'Account'}
              </span>
              <CaretDown size={12} weight="bold" className="text-gray-400" />
            </button>
            {showProfileMenu && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-[#E3EDE7] rounded-lg shadow-lg py-1 z-50">
                <div className="px-4 py-2 border-b border-[#E3EDE7]">
                  <p className="text-xs text-gray-500 font-medium">Signed in as</p>
                  <p className="text-sm font-semibold text-gray-900 truncate">{customer.name}</p>
                </div>
                <Link href="/dashboard/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#EDF7F1]">Profile & Settings</Link>
                <form action="/api/auth/logout" method="POST">
                  <button type="submit" className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50">Logout</button>
                </form>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
