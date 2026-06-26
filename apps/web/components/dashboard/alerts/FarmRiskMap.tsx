'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface FarmRiskMapProps {
  farmLat: number;
  farmLng: number;
  alertLat: number;
  alertLng: number;
  proximityKm: number;
}

export default function FarmRiskMap({ farmLat, farmLng, alertLat, alertLng, proximityKm }: FarmRiskMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map
    if (mapRef.current === null) {
      mapRef.current = L.map(mapContainerRef.current).setView([farmLat, farmLng], 8);

      // Add tile layer (OpenStreetMap)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(mapRef.current);

      // Custom icons
      const farmIcon = L.divIcon({
        className: 'custom-farm-icon',
        html: `<div style="background-color: #22c55e; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const alertIcon = L.divIcon({
        className: 'custom-alert-icon',
        html: `<div style="background-color: #dc2626; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      // Add markers
      const farmMarker = L.marker([farmLat, farmLng], { icon: farmIcon })
        .addTo(mapRef.current)
        .bindPopup('<b>Your Farm</b>');

      const alertMarker = L.marker([alertLat, alertLng], { icon: alertIcon })
        .addTo(mapRef.current)
        .bindPopup('<b>Alert Epicentre</b>');

      // Draw line between markers
      const polyline = L.polyline([[farmLat, farmLng], [alertLat, alertLng]], {
        color: '#dc2626',
        weight: 2,
        dashArray: '5, 10',
      }).addTo(mapRef.current);

      // Add distance label
      const midPoint: [number, number] = [(farmLat + alertLat) / 2, (farmLng + alertLng) / 2];
      const distanceLabel = L.marker(midPoint, {
        icon: L.divIcon({
          className: 'distance-label',
          html: `<div style="background-color: white; padding: 4px 8px; border-radius: 4px; border: 1px solid #dc2626; font-size: 12px; font-weight: 600; color: #dc2626; white-space: nowrap;">${proximityKm.toFixed(1)} km</div>`,
          iconSize: [80, 30],
          iconAnchor: [40, 15],
        }),
      }).addTo(mapRef.current);

      // Fit bounds to show both markers
      const bounds = L.latLngBounds([[farmLat, farmLng], [alertLat, alertLng]]);
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });

      // Cleanup function
      return () => {
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
      };
    }
  }, [farmLat, farmLng, alertLat, alertLng, proximityKm]);

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-[300px] rounded-lg border border-neutral-200"
      style={{ zIndex: 1 }}
    />
  );
}
