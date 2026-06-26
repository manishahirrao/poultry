// FlockIQ — Location Data Utility
// File: apps/web/lib/location-data.ts
// Version: v3.0 | June 2026

import locationsData from './data/locations.json';

export interface LocationData {
  slug: string;
  nameEn: string;
  nameHi: string;
  state: string;
  stateHi: string;
  mandis: string[];
  farms: number;
  priceRange: {
    min: number;
    max: number;
    avg: number;
  };
  distanceFromHub?: string;
  nearbyDistricts: string[];
  faqItems?: { q: string; a: string }[];
  testimonials?: Array<{
    name: string;
    location: string;
    quote: string;
    savings: string;
  }>;
  seasonalPattern?: string;
  transportRoutes?: string[];
  imdStation?: string;
  neccCoverage?: boolean;
  agmarknetAvailable?: boolean;
  priority?: number;
  status?: 'live' | 'coming-soon';
  lat?: number;
  lng?: number;
}

export interface LocationWithDistance extends LocationData {
  distance: number;
}

// Get location data by slug
export function getLocationData(slug: string): LocationData | null {
  const location = locationsData.locations.find((l: any) => l.slug === slug);
  if (!location) return null;

  return {
    slug: location.slug,
    nameEn: location.name,
    nameHi: location.nameHi,
    state: location.state,
    stateHi: location.stateHi,
    mandis: location.mandis,
    farms: location.farmCount,
    priceRange: location.priceRange,
    nearbyDistricts: location.neighboringDistricts || [],
    faqItems: generateDistrictFAQ(location.name, location.nameHi),
    testimonials: location.testimonials || [],
    seasonalPattern: location.seasonalPattern,
    transportRoutes: location.transportRoutes,
    imdStation: location.imdStation,
    neccCoverage: location.neccCoverage,
    agmarknetAvailable: location.agmarknetAvailable,
    priority: location.priority,
    status: location.status as 'live' | 'coming-soon',
  };
}

// Get all live locations
export function getLiveLocations(): LocationData[] {
  return locationsData.locations
    .filter((l: any) => l.status === 'live')
    .map((l: any) => getLocationData(l.slug))
    .filter((l): l is LocationData => l !== null);
}

// Get all coming soon locations
export function getComingSoonLocations(): LocationData[] {
  return locationsData.locations
    .filter((l: any) => l.status === 'coming-soon')
    .map((l: any) => getLocationData(l.slug))
    .filter((l): l is LocationData => l !== null);
}

// Get nearby districts with distance (simplified - in production would use actual geolocation)
export function getNearbyDistricts(slug: string): LocationWithDistance[] {
  const location = getLocationData(slug);
  if (!location) return [];

  return location.nearbyDistricts
    .map((districtSlug) => {
      const nearby = getLocationData(districtSlug);
      if (!nearby) return null;

      // Simplified distance calculation - in production use Haversine formula
      const distance = calculateDistance(
        { lat: location.lat || 0, lng: location.lng || 0 },
        { lat: nearby.lat || 0, lng: nearby.lng || 0 }
      );

      return {
        ...nearby,
        distance: Math.round(distance),
      };
    })
    .filter((item): item is LocationWithDistance => item !== null)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 4);
}

// Simplified distance calculation (Haversine formula would be better for production)
function calculateDistance(
  coord1: { lat: number; lng: number },
  coord2: { lat: number; lng: number }
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(coord2.lat - coord1.lat);
  const dLng = toRad(coord2.lng - coord1.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coord1.lat)) *
      Math.cos(toRad(coord2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

// Generate district-specific FAQ items
function generateDistrictFAQ(nameEn: string, nameHi: string): { q: string; a: string }[] {
  return [
    {
      q: `What is the current broiler price in ${nameEn}?`,
      a: `Today's broiler price in ${nameEn} mandi is updated daily. Our AI model provides 7-day forecasts with 96.2% directional accuracy. Check the live price widget above for the latest price.`,
    },
    {
      q: `${nameHi} में कौन से मंडी से डेटा मिलता है?`,
      a: `${nameHi} में हम AGMARKNET, NECC और स्थानीय मंडी से डेटा एकत्र करते हैं। यह सुनिश्चित करता है कि आपको सबसे सटीक भविष्यवाणी मिले।`,
    },
    {
      q: `How accurate are price predictions for ${nameEn}?`,
      a: `Our AI model has achieved 96.2% directional accuracy verified on 847 predictions. For ${nameEn}, we account for local factors like seasonal patterns, transport routes, and nearby market influences.`,
    },
  ];
}

// Mock function to fetch current price (in production, this would call Supabase)
export async function fetchCurrentPrice(slug: string): Promise<number> {
  // In production: const { data } = await supabase.from('prices').select('price').eq('district', slug).single();
  const location = getLocationData(slug);
  return location?.priceRange.avg || 170;
}

// Mock function to fetch 7-day price history (in production, this would call Supabase)
export async function fetchPriceHistory(slug: string): Promise<Array<{ date: string; price: number }>> {
  // In production: const { data } = await supabase.from('price_history').select('*').eq('district', slug).order('date', { ascending: false }).limit(7);
  const location = getLocationData(slug);
  const basePrice = location?.priceRange.avg || 170;
  
  // Generate mock history
  const history: Array<{ date: string; price: number }> = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    history.push({
      date: date.toISOString().split('T')[0],
      price: basePrice + Math.floor(Math.random() * 10) - 5,
    });
  }
  return history;
}

// Mock function to fetch 7-day forecast (in production, this would call Supabase)
export async function fetchPriceForecast(slug: string): Promise<{
  p10: number;
  p50: number;
  p90: number;
}> {
  // In production: const { data } = await supabase.from('forecasts').select('*').eq('district', slug).single();
  const location = getLocationData(slug);
  const basePrice = location?.priceRange.avg || 170;
  
  return {
    p10: basePrice - 8,
    p50: basePrice,
    p90: basePrice + 8,
  };
}
