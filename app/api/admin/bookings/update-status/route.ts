import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminFirestore } from "@/lib/firebase-admin";
import { isAuthorizedAdmin } from "@/lib/admin-authorized-emails";

const BOOKINGS_COLLECTION = "bookings";
const VEHICLES_COLLECTION = "vehicles";

/**
 * PUT /api/admin/bookings/update-status
 * Update booking status and automatically update vehicle availability
 */
export async function PUT(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized. Missing or invalid authorization header.' },
        { status: 401 }
      );
    }

    const idToken = authHeader.replace('Bearer ', '');

    let decodedToken;
    try {
      if (!adminAuth) {
        return NextResponse.json(
          { error: 'Server configuration error. Firebase Admin not initialized.' },
          { status: 500 }
        );
      }
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch (error: any) {
      return NextResponse.json(
        { error: 'Unauthorized. Invalid token.', details: error.message },
        { status: 401 }
      );
    }

    if (!isAuthorizedAdmin(decodedToken.email)) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    if (!adminFirestore) {
      return NextResponse.json(
        { error: 'Server configuration error. Firebase Firestore not initialized.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { bookingId, status } = body;

    if (!bookingId || !status) {
      return NextResponse.json(
        { error: 'Missing bookingId or status' },
        { status: 400 }
      );
    }

    // Get booking to find vehicle_id
    const bookingDoc = await adminFirestore.collection(BOOKINGS_COLLECTION).doc(bookingId).get();
    if (!bookingDoc.exists) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    const bookingData = bookingDoc.data();
    const vehicleId = bookingData?.vehicle_id;

    // Update booking status
    await adminFirestore.collection(BOOKINGS_COLLECTION).doc(bookingId).update({
      status,
      updated_at: new Date().toISOString(),
    });

    // Update vehicle availability based on booking status
    if (vehicleId) {
      // If booking is approved or in progress, make vehicle unavailable
      // If booking is cancelled, rejected, or completed, make vehicle available
      const shouldBeAvailable = ['cancelled', 'rejected', 'completed'].includes(status);
      
      await adminFirestore.collection(VEHICLES_COLLECTION).doc(vehicleId).update({
        available: shouldBeAvailable,
        updated_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Booking status updated and vehicle availability updated',
    });
  } catch (error: any) {
    console.error('Error updating booking status:', error);
    return NextResponse.json(
      { error: 'Failed to update booking status', message: error.message },
      { status: 500 }
    );
  }
}

