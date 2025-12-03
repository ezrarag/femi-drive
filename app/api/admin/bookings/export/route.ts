import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminFirestore } from "@/lib/firebase-admin";
import { isAuthorizedAdmin } from "@/lib/admin-authorized-emails";

const BOOKINGS_COLLECTION = "bookings";
const VEHICLES_COLLECTION = "vehicles";

/**
 * GET /api/admin/bookings/export
 * Export bookings to CSV format (compatible with QuickBooks, Excel, etc.)
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

    // Fetch bookings
    const bookingsSnapshot = await adminFirestore
      .collection(BOOKINGS_COLLECTION)
      .orderBy('created_at', 'desc')
      .get();

    const vehiclesSnapshot = await adminFirestore.collection(VEHICLES_COLLECTION).get();
    const vehiclesMap = new Map();
    vehiclesSnapshot.docs.forEach(doc => {
      vehiclesMap.set(doc.id, { id: doc.id, ...doc.data() });
    });

    const bookings = bookingsSnapshot.docs.map(doc => {
      const data = doc.data();
      const vehicle = vehiclesMap.get(data.vehicle_id);
      
      return {
        id: doc.id,
        date: data.created_at?.toDate?.()?.toISOString().split('T')[0] || data.created_at || '',
        customer_name: data.customer_name || 'Unknown',
        customer_email: data.customer_email || '',
        vehicle: vehicle ? `${vehicle.make} ${vehicle.model} ${vehicle.year}` : 'Unknown',
        start_date: data.start_date || '',
        end_date: data.end_date || '',
        days: data.days || 0,
        price_per_day: vehicle?.price_per_day || 0,
        total_price: data.total_price || 0,
        status: data.status || 'pending',
        payment_status: data.payment_status || 'pending',
      };
    });

    // Generate CSV
    const headers = [
      'Date',
      'Customer Name',
      'Customer Email',
      'Vehicle',
      'Start Date',
      'End Date',
      'Days',
      'Price Per Day',
      'Total Price',
      'Status',
      'Payment Status',
    ];

    const csvRows = [
      headers.join(','),
      ...bookings.map(booking => [
        booking.date,
        `"${booking.customer_name}"`,
        booking.customer_email,
        `"${booking.vehicle}"`,
        booking.start_date,
        booking.end_date,
        booking.days,
        booking.price_per_day,
        booking.total_price,
        booking.status,
        booking.payment_status,
      ].join(','))
    ];

    const csv = csvRows.join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="bookings-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error: any) {
    console.error('Error exporting bookings:', error);
    return NextResponse.json(
      { error: 'Failed to export bookings', message: error.message },
      { status: 500 }
    );
  }
}

