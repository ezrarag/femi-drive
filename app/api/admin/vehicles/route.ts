import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminFirestore } from "@/lib/firebase-admin";
import { isAuthorizedAdmin } from "@/lib/admin-authorized-emails";

const VEHICLES_COLLECTION = "vehicles";

/**
 * GET /api/admin/vehicles
 * Fetch all vehicles from Firebase
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
          { error: 'Server configuration error. Firebase Admin not initialized. Please check your FIREBASE_ADMIN_* environment variables.' },
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
    
    if (!isAuthorizedAdmin(userEmail)) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    // Check if Firestore is initialized
    if (!adminFirestore) {
      return NextResponse.json(
        { error: 'Server configuration error. Firebase Firestore not initialized. Please check your FIREBASE_ADMIN_* environment variables.' },
        { status: 500 }
      );
    }

    // Fetch vehicles from Firestore
    try {
      const vehiclesSnapshot = await adminFirestore.collection(VEHICLES_COLLECTION).get();
      const vehicles = vehiclesSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Ensure available is a proper boolean
          available: data.available === true || data.available === 'true' || data.available === 1 || data.available === undefined || data.available === null,
        };
      });

      return NextResponse.json({
        vehicles,
        count: vehicles.length,
      });
    } catch (firestoreError: any) {
      console.error('Firestore error fetching vehicles:', firestoreError);
      
      // Check if it's a Firestore API not enabled error
      if (firestoreError.code === 7 || firestoreError.message?.includes('PERMISSION_DENIED') || firestoreError.message?.includes('API has not been used')) {
        return NextResponse.json(
          { 
            error: 'Firestore API not enabled', 
            message: 'Cloud Firestore API needs to be enabled in your Firebase project.',
            details: firestoreError.message,
            helpUrl: 'https://console.developers.google.com/apis/api/firestore.googleapis.com/overview'
          },
          { status: 500 }
        );
      }
      
      throw firestoreError; // Re-throw to be caught by outer catch
    }
  } catch (error: any) {
    console.error('Error fetching vehicles:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { 
        error: 'Failed to fetch vehicles', 
        message: error.message || 'Unknown error',
        code: error.code,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/vehicles
 * Create a new vehicle in Firebase
 */
export async function POST(request: NextRequest) {
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
    
    if (!isAuthorizedAdmin(userEmail)) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    // Check if Firestore is initialized
    if (!adminFirestore) {
      return NextResponse.json(
        { error: 'Server configuration error. Firebase Firestore not initialized. Please check your FIREBASE_ADMIN_* environment variables.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const {
      make,
      model,
      year,
      price_per_day,
      available = true,
      image_url,
      description,
      mileage,
      transmission,
      location,
      features = [],
      insurance,
      maintenance,
      size,
      category,
      gigReady = false,
      slug,
      origin_address,
    } = body;

    // Validate required fields
    if (!make || !model || !year || !price_per_day) {
      return NextResponse.json(
        { error: 'Missing required fields: make, model, year, price_per_day' },
        { status: 400 }
      );
    }

    // Create vehicle document
    const vehicleData = {
      make: make.toString(),
      model: model.toString(),
      year: parseInt(year),
      price_per_day: parseFloat(price_per_day),
      available: Boolean(available),
      image_url: image_url || '',
      description: description || '',
      mileage: mileage ? parseInt(mileage) : 0,
      transmission: transmission || 'Automatic',
      location: location || 'Newark, NJ',
      features: Array.isArray(features) ? features : [],
      insurance: insurance || 'Full Coverage',
      maintenance: maintenance || 'Regular Service',
      size: size || 'medium',
      category: category || 'Sedan',
      slug: slug || `${make.toLowerCase()}-${model.toLowerCase()}-${year}`,
      origin_address: origin_address || '3 Brewster Rd, Newark, NJ 07114',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const docRef = await adminFirestore.collection(VEHICLES_COLLECTION).add(vehicleData);

    // Log activity
    try {
      await adminFirestore.collection('admin_activity').add({
        admin_email: userEmail,
        admin_name: decodedToken.name || userEmail.split('@')[0],
        action: 'created',
        entity_type: 'vehicle',
        entity_id: docRef.id,
        details: {
          make: vehicleData.make,
          model: vehicleData.model,
          year: vehicleData.year,
        },
        timestamp: new Date(),
      });
    } catch (logError) {
      console.error('Failed to log activity:', logError);
      // Don't fail the request if logging fails
    }

    return NextResponse.json({
      success: true,
      vehicle: {
        id: docRef.id,
        ...vehicleData,
      },
    });
  } catch (error: any) {
    console.error('Error creating vehicle:', error);
    return NextResponse.json(
      { error: 'Failed to create vehicle', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/vehicles/[id]
 * Update a vehicle in Firebase
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

    // Check if user is authorized admin
    const userEmail = decodedToken.email;
    
    if (!isAuthorizedAdmin(userEmail)) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    // Check if Firestore is initialized
    if (!adminFirestore) {
      return NextResponse.json(
        { error: 'Server configuration error. Firebase Firestore not initialized. Please check your FIREBASE_ADMIN_* environment variables.' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const vehicleId = searchParams.get('id');

    if (!vehicleId) {
      return NextResponse.json(
        { error: 'Missing vehicle ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Prepare update data - ensure proper types
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    // Map all possible fields
    if (body.make !== undefined) updateData.make = body.make.toString();
    if (body.model !== undefined) updateData.model = body.model.toString();
    if (body.year !== undefined) updateData.year = parseInt(body.year);
    if (body.price_per_day !== undefined) updateData.price_per_day = parseFloat(body.price_per_day);
    if (body.available !== undefined) updateData.available = Boolean(body.available);
    if (body.image_url !== undefined) updateData.image_url = body.image_url || '';
    if (body.description !== undefined) updateData.description = body.description || '';
    if (body.mileage !== undefined) updateData.mileage = body.mileage ? parseInt(body.mileage) : 0;
    if (body.transmission !== undefined) updateData.transmission = body.transmission || 'Automatic';
    if (body.location !== undefined) updateData.location = body.location || 'Newark, NJ';
    if (body.origin_address !== undefined) updateData.origin_address = body.origin_address || '3 Brewster Rd, Newark, NJ 07114';
    if (body.features !== undefined) updateData.features = Array.isArray(body.features) ? body.features : [];
    if (body.insurance !== undefined) updateData.insurance = body.insurance || 'Full Coverage';
    if (body.maintenance !== undefined) updateData.maintenance = body.maintenance || 'Regular Service';
    if (body.size !== undefined) updateData.size = body.size || 'medium';
    if (body.category !== undefined) updateData.category = body.category || 'Sedan';
    if (body.gigReady !== undefined) updateData.gigReady = Boolean(body.gigReady);
    if (body.slug !== undefined) updateData.slug = body.slug || '';
    if (body.booking_url !== undefined) updateData.booking_url = body.booking_url || '';
    if (body.security_deposit_enabled !== undefined) updateData.security_deposit_enabled = Boolean(body.security_deposit_enabled);
    if (body.security_deposit_amount !== undefined) updateData.security_deposit_amount = parseFloat(body.security_deposit_amount) || 250;
    if (body.security_deposit_days_before !== undefined) updateData.security_deposit_days_before = parseInt(body.security_deposit_days_before) || 1;
    if (body.security_deposit_release_days !== undefined) updateData.security_deposit_release_days = parseInt(body.security_deposit_release_days) || 7;
    if (body.cancellation_policy !== undefined) updateData.cancellation_policy = body.cancellation_policy || 'Flexible';

    // Remove id from update data if present
    delete updateData.id;

    await adminFirestore.collection(VEHICLES_COLLECTION).doc(vehicleId).update(updateData);

    // Fetch updated vehicle
    const updatedDoc = await adminFirestore.collection(VEHICLES_COLLECTION).doc(vehicleId).get();
    const vehicleData = updatedDoc.data();

    // Ensure boolean values are properly formatted
    const formattedVehicleData = {
      ...vehicleData,
      available: vehicleData?.available === true || vehicleData?.available === 'true' || vehicleData?.available === 1,
    };

    // Log activity
    try {
      await adminFirestore.collection('admin_activity').add({
        admin_email: userEmail,
        admin_name: decodedToken.name || userEmail.split('@')[0],
        action: 'updated',
        entity_type: 'vehicle',
        entity_id: vehicleId,
        details: {
          make: formattedVehicleData?.make,
          model: formattedVehicleData?.model,
          year: formattedVehicleData?.year,
          available: formattedVehicleData?.available,
          changes: Object.keys(updateData).filter(k => k !== 'updated_at'),
        },
        timestamp: new Date(),
      });
    } catch (logError) {
      console.error('Failed to log activity:', logError);
      // Don't fail the request if logging fails
    }

    return NextResponse.json({
      success: true,
      vehicle: {
        id: updatedDoc.id,
        ...formattedVehicleData,
      },
    });
  } catch (error: any) {
    console.error('Error updating vehicle:', error);
    return NextResponse.json(
      { error: 'Failed to update vehicle', message: error.message },
      { status: 500 }
    );
  }
}

