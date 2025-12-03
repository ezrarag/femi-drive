import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminFirestore } from "@/lib/firebase-admin";
import { isAuthorizedAdmin } from "@/lib/admin-authorized-emails";

const BOOKINGS_COLLECTION = "bookings";
const VEHICLES_COLLECTION = "vehicles";

/**
 * GET /api/admin/dashboard/active-bookings
 * Fetch active bookings for today
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

    // Get today's date range (start and end of today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Fetch bookings that are active today
    // Active means: start_date <= today AND end_date >= today AND status is confirmed/approved
    const bookingsSnapshot = await adminFirestore
      .collection(BOOKINGS_COLLECTION)
      .where('status', 'in', ['confirmed', 'approved', 'active'])
      .get();

    // Filter bookings that are active today
    const activeBookings = bookingsSnapshot.docs
      .map(doc => {
        const data = doc.data();
        const startDate = data.start_date ? new Date(data.start_date) : null;
        const endDate = data.end_date ? new Date(data.end_date) : null;
        
        // Check if booking is active today
        const isActiveToday = startDate && endDate && 
          startDate <= tomorrow && 
          endDate >= today;

        if (!isActiveToday) return null;

        return {
          id: doc.id,
          vehicle_id: data.vehicle_id || '',
          start_date: data.start_date || '',
          end_date: data.end_date || '',
          total_price: data.total_price || 0,
          status: data.status || 'pending',
          customer_name: data.customer_name || 'Unknown',
          customer_email: data.customer_email || '',
          created_at: data.created_at?.toDate?.()?.toISOString() || data.created_at || '',
        };
      })
      .filter(Boolean);

    // Fetch vehicle details for each booking
    const vehiclesSnapshot = await adminFirestore.collection(VEHICLES_COLLECTION).get();
    const vehiclesMap = new Map();
    vehiclesSnapshot.docs.forEach(doc => {
      vehiclesMap.set(doc.id, { id: doc.id, ...doc.data() });
    });

    const bookingsWithVehicles = activeBookings.map(booking => ({
      ...booking,
      vehicle: vehiclesMap.get(booking.vehicle_id) ? {
        make: vehiclesMap.get(booking.vehicle_id).make,
        model: vehiclesMap.get(booking.vehicle_id).model,
        year: vehiclesMap.get(booking.vehicle_id).year,
      } : null,
    }));

    return NextResponse.json({
      bookings: bookingsWithVehicles,
      count: bookingsWithVehicles.length,
      date: today.toISOString(),
    });
  } catch (error: any) {
    console.error('Error fetching active bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch active bookings', message: error.message },
      { status: 500 }
    );
  }
}

