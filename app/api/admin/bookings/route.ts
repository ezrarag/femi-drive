import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminFirestore } from "@/lib/firebase-admin";

const BOOKINGS_COLLECTION = "bookings";
const VEHICLES_COLLECTION = "vehicles";

/**
 * GET /api/admin/bookings
 * Fetch all bookings from Firebase
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

    // Fetch bookings from Firestore
    const bookingsSnapshot = await adminFirestore
      .collection(BOOKINGS_COLLECTION)
      .orderBy('created_at', 'desc')
      .get();

    // Fetch vehicles for reference
    const vehiclesSnapshot = await adminFirestore.collection(VEHICLES_COLLECTION).get();
    const vehiclesMap = new Map();
    vehiclesSnapshot.docs.forEach(doc => {
      vehiclesMap.set(doc.id, { id: doc.id, ...doc.data() });
    });

    const bookings = await Promise.all(
      bookingsSnapshot.docs.map(async (doc) => {
        const data = doc.data();
        const vehicle = vehiclesMap.get(data.vehicle_id);
        
        return {
          id: doc.id,
          user_id: data.user_id || '',
          vehicle_id: data.vehicle_id || '',
          start_date: data.start_date || '',
          end_date: data.end_date || '',
          total_price: data.total_price || 0,
          status: data.status || 'pending',
          created_at: data.created_at?.toDate?.()?.toISOString() || data.created_at || new Date().toISOString(),
          updated_at: data.updated_at?.toDate?.()?.toISOString() || data.updated_at || null,
          vehicle: vehicle ? {
            make: vehicle.make,
            model: vehicle.model,
            year: vehicle.year,
          } : null,
          // Try to get user info from metadata if available
          user: data.customer_name ? {
            name: data.customer_name,
            email: data.customer_email || '',
          } : null,
        };
      })
    );

    return NextResponse.json({
      bookings,
      count: bookings.length,
    });
  } catch (error: any) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings', message: error.message },
      { status: 500 }
    );
  }
}

