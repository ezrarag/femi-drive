import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminFirestore } from "@/lib/firebase-admin";
import { isAuthorizedAdmin } from "@/lib/admin-authorized-emails";

const BOOKINGS_COLLECTION = "bookings";
const VEHICLES_COLLECTION = "vehicles";

/**
 * POST /api/admin/bookings/create
 * Create a new booking manually
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { 
      vehicle_id, 
      start_date, 
      end_date, 
      total_price, 
      customer_name, 
      customer_email, 
      customer_phone,
      status = 'pending',
      notes 
    } = body;

    // Validate required fields
    if (!vehicle_id || !start_date || !end_date || !total_price || !customer_name || !customer_email) {
      return NextResponse.json(
        { error: 'Missing required fields: vehicle_id, start_date, end_date, total_price, customer_name, customer_email' },
        { status: 400 }
      );
    }

    // Verify vehicle exists
    const vehicleDoc = await adminFirestore.collection(VEHICLES_COLLECTION).doc(vehicle_id).get();
    if (!vehicleDoc.exists) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    // Create booking
    const bookingData = {
      vehicle_id,
      start_date,
      end_date,
      total_price: parseFloat(total_price),
      customer_name,
      customer_email: customer_email.toLowerCase(),
      customer_phone: customer_phone || '',
      status,
      notes: notes || '',
      created_at: new Date(),
      updated_at: new Date(),
      created_by: userEmail,
    };

    const bookingRef = await adminFirestore.collection(BOOKINGS_COLLECTION).add(bookingData);

    // Update vehicle availability if booking is confirmed/approved
    if (status === 'confirmed' || status === 'approved') {
      await adminFirestore.collection(VEHICLES_COLLECTION).doc(vehicle_id).update({
        available: false,
        updated_at: new Date(),
      });
    }

    // Log activity
    try {
      await adminFirestore.collection('admin_activity').add({
        admin_email: userEmail,
        admin_name: decodedToken.name || userEmail.split('@')[0],
        action: 'created',
        entity_type: 'booking',
        entity_id: bookingRef.id,
        details: {
          vehicle_id,
          customer_name,
          customer_email,
          start_date,
          end_date,
          total_price: bookingData.total_price,
        },
        timestamp: new Date(),
      });
    } catch (logError) {
      console.error('Failed to log activity:', logError);
    }

    return NextResponse.json({
      success: true,
      booking: {
        id: bookingRef.id,
        ...bookingData,
      },
    });
  } catch (error: any) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking', message: error.message },
      { status: 500 }
    );
  }
}

