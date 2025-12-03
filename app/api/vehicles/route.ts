import { NextResponse } from "next/server";
import { adminFirestore } from "@/lib/firebase-admin";

const VEHICLES_COLLECTION = "vehicles";

/**
 * GET /api/vehicles
 * Public API to fetch all available vehicles for the fleet page
 * No authentication required - this is for public viewing
 */
export async function GET() {
  try {
    // Check if Firestore is initialized
    if (!adminFirestore) {
      return NextResponse.json(
        { error: 'Server configuration error. Firebase Firestore not initialized.' },
        { status: 500 }
      );
    }

    // Fetch vehicles from Firestore
    try {
      // First, get all vehicles to check what we have
      const allVehiclesSnapshot = await adminFirestore
        .collection(VEHICLES_COLLECTION)
        .get();
      
      console.log(`📊 Total vehicles in Firestore: ${allVehiclesSnapshot.docs.length}`);
      
      // Filter for available vehicles (available === true)
      // Also include vehicles where available field is missing/undefined (treat as available)
      const vehicles = allVehiclesSnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter(vehicle => {
          // Include if available is true OR if available field is missing/undefined
          return vehicle.available === true || vehicle.available === undefined || vehicle.available === null;
        });
      
      console.log(`✅ Available vehicles (available=true or missing): ${vehicles.length}`);

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
          },
          { status: 500 }
        );
      }
      
      throw firestoreError; // Re-throw to be caught by outer catch
    }
  } catch (error: any) {
    console.error('Error fetching vehicles:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch vehicles', 
        message: error.message || 'Unknown error',
        code: error.code,
      },
      { status: 500 }
    );
  }
}

