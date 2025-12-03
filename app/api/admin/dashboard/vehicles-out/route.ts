import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminFirestore } from "@/lib/firebase-admin";
import { isAuthorizedAdmin } from "@/lib/admin-authorized-emails";

const BOOKINGS_COLLECTION = "bookings";
const VEHICLES_COLLECTION = "vehicles";

/**
 * GET /api/admin/dashboard/vehicles-out
 * Fetch vehicles currently out/rented
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const idToken = authHeader.replace('Bearer ', '');
    
    if (!adminAuth) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const userEmail = decodedToken.email;

    if (!userEmail || !(await isAuthorizedAdmin(userEmail))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (!adminFirestore) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Fetch all active bookings
    const bookingsSnapshot = await adminFirestore
      .collection(BOOKINGS_COLLECTION)
      .where('status', 'in', ['confirmed', 'approved', 'active'])
      .get();

    // Get unique vehicle IDs that are currently out
    const vehiclesOutSet = new Set<string>();
    const vehicleBookingMap = new Map<string, any>();

    bookingsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const startDate = data.start_date ? new Date(data.start_date) : null;
      const endDate = data.end_date ? new Date(data.end_date) : null;
      
      // Vehicle is out if booking is active (start <= today <= end)
      if (startDate && endDate && startDate <= today && endDate >= today) {
        const vehicleId = data.vehicle_id;
        if (vehicleId) {
          vehiclesOutSet.add(vehicleId);
          vehicleBookingMap.set(vehicleId, {
            booking_id: doc.id,
            start_date: data.start_date,
            end_date: data.end_date,
            customer_name: data.customer_name || 'Unknown',
            customer_email: data.customer_email || '',
            total_price: data.total_price || 0,
          });
        }
      }
    });

    // Fetch vehicle details and filter out unavailable vehicles
    const vehiclesSnapshot = await adminFirestore.collection(VEHICLES_COLLECTION).get();
    const vehiclesOut = Array.from(vehiclesOutSet)
      .map(vehicleId => {
        const vehicleDoc = vehiclesSnapshot.docs.find(doc => doc.id === vehicleId);
        if (!vehicleDoc) return null;

        const vehicleData = vehicleDoc.data();
        
        // Only include vehicles that are available (or have active bookings)
        // If vehicle is marked unavailable, don't show it as "out" unless it has an active booking
        const isAvailable = vehicleData.available === true || vehicleData.available === undefined || vehicleData.available === null;
        if (!isAvailable && !vehicleBookingMap.has(vehicleId)) {
          return null; // Skip unavailable vehicles without bookings
        }
        
        const bookingInfo = vehicleBookingMap.get(vehicleId);

        return {
          id: vehicleId,
          make: vehicleData.make || '',
          model: vehicleData.model || '',
          year: vehicleData.year || '',
          price_per_day: vehicleData.price_per_day || 0,
          available: isAvailable,
          booking: bookingInfo || null,
        };
      })
      .filter(Boolean);

    return NextResponse.json({
      vehicles: vehiclesOut,
      count: vehiclesOut.length,
    });
  } catch (error: any) {
    console.error('Error fetching vehicles out:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vehicles out', message: error.message },
      { status: 500 }
    );
  }
}

