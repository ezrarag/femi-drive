import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/calculate-distance
 * Calculate driving distance between origin and destination using Google Maps Distance Matrix API
 */
export async function POST(request: NextRequest) {
  try {
    const { origin, destination } = await request.json();

    if (!origin || !destination) {
      return NextResponse.json(
        { error: 'Origin and destination are required' },
        { status: 400 }
      );
    }

    // Use Google Maps Distance Matrix API
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      // Fallback: Calculate approximate distance using Haversine formula
      // This is a rough estimate and doesn't account for actual roads
      const distance = calculateHaversineDistance(origin, destination);
      return NextResponse.json({
        distance: Math.round(distance),
        unit: 'miles',
        method: 'approximate'
      });
    }

    // Use Google Maps Distance Matrix API
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&units=imperial&key=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.rows[0]?.elements[0]?.status === 'OK') {
      const distanceInMeters = data.rows[0].elements[0].distance.value;
      const distanceInMiles = distanceInMeters / 1609.34; // Convert meters to miles
      
      return NextResponse.json({
        distance: Math.round(distanceInMiles),
        unit: 'miles',
        method: 'google_maps',
        duration: data.rows[0].elements[0].duration?.text
      });
    } else {
      // Fallback to Haversine if Google Maps fails
      const distance = calculateHaversineDistance(origin, destination);
      return NextResponse.json({
        distance: Math.round(distance),
        unit: 'miles',
        method: 'approximate',
        error: 'Google Maps API error, using approximate distance'
      });
    }
  } catch (error: any) {
    console.error('Error calculating distance:', error);
    return NextResponse.json(
      { error: 'Failed to calculate distance', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * Calculate approximate distance using Haversine formula
 * This is a fallback when Google Maps API is not available
 */
function calculateHaversineDistance(origin: string, destination: string): number {
  // Try to extract coordinates from address strings
  // This is a simplified version - in production, you'd want to geocode first
  const originCoords = geocodeAddress(origin);
  const destCoords = geocodeAddress(destination);

  if (!originCoords || !destCoords) {
    return 0; // Return 0 if we can't parse addresses
  }

  const R = 3959; // Earth's radius in miles
  const dLat = toRadians(destCoords.lat - originCoords.lat);
  const dLon = toRadians(destCoords.lon - originCoords.lon);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(originCoords.lat)) * Math.cos(toRadians(destCoords.lat)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Simple geocoding - extracts coordinates from known addresses
 * For production, use Google Geocoding API
 */
function geocodeAddress(address: string): { lat: number; lon: number } | null {
  // Newark Airport coordinates
  if (address.toLowerCase().includes('newark') && address.toLowerCase().includes('airport')) {
    return { lat: 40.6895, lon: -74.1745 };
  }
  
  // Default Newark coordinates if address contains Newark
  if (address.toLowerCase().includes('newark')) {
    return { lat: 40.7357, lon: -74.1724 };
  }
  
  // Default NYC coordinates
  if (address.toLowerCase().includes('new york') || address.toLowerCase().includes('nyc')) {
    return { lat: 40.7128, lon: -74.0060 };
  }
  
  // Return null if we can't determine coordinates
  return null;
}




