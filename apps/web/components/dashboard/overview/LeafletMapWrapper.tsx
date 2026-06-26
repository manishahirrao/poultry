'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with Next.js
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

interface LeafletMapWrapperProps {
  onDistrictSelect?: (district: string) => void;
  selectedDistrict?: string;
}

const DISTRICTS = [
  { name: 'Gorakhpur', lat: 26.7606, lng: 83.3732, color: '#1A6B3C' },
  { name: 'Deoria', lat: 26.2310, lng: 83.7880, color: '#7CC49A' },
  { name: 'Kushinagar', lat: 26.7820, lng: 83.8960, color: '#7CC49A' },
  { name: 'Basti', lat: 26.8015, lng: 82.7369, color: '#7CC49A' },
  { name: 'Maharajganj', lat: 27.1333, lng: 83.5667, color: '#7CC49A' },
];

export default function LeafletMapWrapper({ onDistrictSelect, selectedDistrict }: LeafletMapWrapperProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const isInitializing = useRef(false);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current || isInitializing.current) return;

    isInitializing.current = true;

    // Initialize map centered on Gorakhpur
    const map = L.map(mapContainerRef.current, {
      center: [26.7606, 83.3732],
      zoom: 8,
      zoomControl: true,
    });

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    mapRef.current = map;
    isInitializing.current = false;

    // Add district markers
    DISTRICTS.forEach((district) => {
      const isSelected = selectedDistrict === district.name.toLowerCase();

      // Create custom marker
      const marker = L.circleMarker([district.lat, district.lng], {
        radius: isSelected ? 12 : 8,
        fillColor: district.color,
        color: isSelected ? '#0F4A28' : '#1A6B3C',
        weight: isSelected ? 3 : 2,
        opacity: 1,
        fillOpacity: 0.7,
      }).addTo(map);

      // Add popup
      marker.bindPopup(`
        <div style="font-family: 'Plus Jakarta Sans', sans-serif;">
          <strong>${district.name}</strong><br/>
          <span style="color: ${district.color};">●</span> Active
        </div>
      `);

      // Add click handler
      marker.on('click', () => {
        if (onDistrictSelect) {
          onDistrictSelect(district.name.toLowerCase());
        }
      });
    });

    return () => {
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (error) {
          // Ignore errors during cleanup (node already removed by React)
          console.warn('Map cleanup error (safe to ignore):', error);
        }
        mapRef.current = null;
      }
      isInitializing.current = false;
    };
  }, [selectedDistrict, onDistrictSelect]);

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-[240px] sm:h-[280px]"
      style={{ minHeight: '240px' }}
      aria-label="District coverage map showing Gorakhpur and surrounding districts"
    />
  );
}
