import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminFirestore } from "@/lib/firebase-admin";

const VEHICLES_COLLECTION = "vehicles";
const BOOKINGS_COLLECTION = "bookings";
const USERS_COLLECTION = "users";

/**
 * GET /api/admin/stats
 * Fetch dashboard statistics (vehicles, bookings, users)
 */
export async function GET(request: NextRequest) {
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

    // Check if user is authorized admin
    const userEmail = decodedToken.email;
    const authorizedEmails = [
      'finance@readyaimgo.biz',
      'ezra@readyaimgo.biz',
      'femileasing@gmail.com',
    ];
    
    const isAuthorized = authorizedEmails.some(email => 
      userEmail?.toLowerCase().includes(email.toLowerCase())
    );

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    // Fetch stats in parallel
    const [vehiclesSnapshot, bookingsSnapshot, usersSnapshot] = await Promise.all([
      adminFirestore.collection(VEHICLES_COLLECTION).get(),
      adminFirestore.collection(BOOKINGS_COLLECTION).get().catch(() => ({ docs: [] })), // Bookings might not exist yet
      adminFirestore.collection(USERS_COLLECTION).get().catch(() => ({ docs: [] })), // Users might not exist yet
    ]);

    const totalVehicles = vehiclesSnapshot.docs.length;
    const totalBookings = bookingsSnapshot.docs.length;
    const totalUsers = usersSnapshot.docs.length;

    // Count available vehicles
    const availableVehicles = vehiclesSnapshot.docs.filter(
      doc => doc.data().available === true
    ).length;

    // Count active bookings (not cancelled or completed)
    const activeBookings = bookingsSnapshot.docs.filter(doc => {
      const status = doc.data().status;
      return status !== 'cancelled' && status !== 'completed';
    }).length;

    return NextResponse.json({
      totalVehicles,
      availableVehicles,
      totalBookings,
      activeBookings,
      totalUsers,
    });
  } catch (error: any) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats', message: error.message },
      { status: 500 }
    );
  }
}

