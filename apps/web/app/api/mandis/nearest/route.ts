import { NextRequest, NextResponse } from 'next/server';

// Sample mandi data with coordinates (in production, this would come from database)
const MANDIS = [
  { name: 'Gorakhpur', lat: 26.7606, lng: 83.3732 },
  { name: 'Deoria', lat: 26.4919, lng: 83.4769 },
  { name: 'Kushinagar', lat: 26.7833, lng: 83.8833 },
  { name: 'Basti', lat: 26.8167, lng: 82.7333 },
  { name: 'Maharajganj', lat: 27.1333, lng: 83.5833 },
  { name: 'Sant Kabir Nagar', lat: 26.7833, lng: 83.0833 },
  { name: 'Azamgarh', lat: 26.0667, lng: 83.1833 },
  { name: 'Mau', lat: 25.9333, lng: 83.5667 },
  { name: 'Ballia', lat: 25.7667, lng: 84.1333 },
  { name: 'Ghazipur', lat: 25.5833, lng: 83.5833 },
  { name: 'Varanasi', lat: 25.3167, lng: 82.9833 },
  { name: 'Jaunpur', lat: 25.7333, lng: 82.7167 },
  { name: 'Mirzapur', lat: 25.1500, lng: 82.5667 },
  { name: 'Sonbhadra', lat: 24.6833, lng: 83.0333 },
  { name: 'Chandauli', lat: 25.2667, lng: 83.2833 },
  { name: 'Prayagraj', lat: 25.4333, lng: 81.8667 },
  { name: 'Kaushambi', lat: 25.5333, lng: 81.3667 },
  { name: 'Fatehpur', lat: 25.9333, lng: 80.8000 },
  { name: 'Kanpur Nagar', lat: 26.4667, lng: 80.3500 },
  { name: 'Kanpur Dehat', lat: 26.3833, lng: 79.9167 },
  { name: 'Unnao', lat: 26.5333, lng: 80.4833 },
  { name: 'Lucknow', lat: 26.8467, lng: 80.9462 },
  { name: 'Barabanki', lat: 27.0833, lng: 81.1333 },
  { name: 'Sitapur', lat: 27.5667, lng: 80.6833 },
  { name: 'Hardoi', lat: 27.4167, lng: 80.1167 },
  { name: 'Lakhimpur Kheri', lat: 27.9167, lng: 80.7833 },
  { name: 'Pilibhit', lat: 28.6500, lng: 79.8000 },
  { name: 'Shahjahanpur', lat: 27.8833, lng: 79.9167 },
  { name: 'Bareilly', lat: 28.3667, lng: 79.4167 },
  { name: 'Budaun', lat: 28.0333, lng: 79.1333 },
  { name: 'Moradabad', lat: 28.8333, lng: 78.7833 },
  { name: 'Sambhal', lat: 28.4667, lng: 78.8333 },
  { name: 'Rampur', lat: 28.8000, lng: 79.0333 },
  { name: 'Amroha', lat: 28.8833, lng: 78.7833 },
  { name: 'Meerut', lat: 28.9833, lng: 77.7000 },
  { name: 'Baghpat', lat: 28.9333, lng: 77.2333 },
  { name: 'Ghaziabad', lat: 28.6667, lng: 77.4333 },
  { name: 'Gautam Buddha Nagar', lat: 28.4667, lng: 77.5000 },
  { name: 'Hapur', lat: 28.7167, lng: 77.7667 },
  { name: 'Bulandshahr', lat: 28.4000, lng: 77.8500 },
  { name: 'Aligarh', lat: 27.8833, lng: 78.0833 },
  { name: 'Mathura', lat: 27.4917, lng: 77.6737 },
  { name: 'Agra', lat: 27.1767, lng: 78.0081 },
  { name: 'Firozabad', lat: 27.1500, lng: 78.4000 },
  { name: 'Mainpuri', lat: 27.2333, lng: 79.0333 },
  { name: 'Etawah', lat: 26.7667, lng: 79.0167 },
  { name: 'Auraiya', lat: 26.4667, lng: 79.5167 },
  { name: 'Kannauj', lat: 27.0500, lng: 79.9167 },
  { name: 'Kanpur Rural', lat: 26.2833, lng: 80.3500 },
];

// Haversine formula to calculate distance between two coordinates in kilometers
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'Missing lat or lng parameter' },
        { status: 400 }
      );
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);

    if (isNaN(userLat) || isNaN(userLng)) {
      return NextResponse.json(
        { error: 'Invalid lat or lng parameter' },
        { status: 400 }
      );
    }

    // Find the nearest mandi
    let nearestMandi = null;
    let minDistance = Infinity;

    for (const mandi of MANDIS) {
      const distance = haversineDistance(userLat, userLng, mandi.lat, mandi.lng);
      if (distance < minDistance) {
        minDistance = distance;
        nearestMandi = {
          name: mandi.name,
          distanceKm: Math.round(distance * 10) / 10, // Round to 1 decimal place
        };
      }
    }

    if (!nearestMandi) {
      return NextResponse.json(
        { error: 'No mandis found' },
        { status: 404 }
      );
    }

    return NextResponse.json(nearestMandi);
  } catch (error) {
    console.error('Error finding nearest mandi:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
