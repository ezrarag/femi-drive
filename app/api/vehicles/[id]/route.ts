import { NextRequest, NextResponse } from "next/server";
import { adminFirestore } from "@/lib/firebase-admin";

const VEHICLES_COLLECTION = "vehicles";

/**
 * GET /api/vehicles/[id]
 * Public API to fetch a single vehicle by ID
 * No authentication required - this is for public viewing
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check if Firestore is initialized
    if (!adminFirestore) {
      return NextResponse.json(
        { error: 'Server configuration error. Firebase Firestore not initialized.' },
        { status: 500 }
      );
    }

    // Fetch vehicle from Firestore
    try {
      const vehicleDoc = await adminFirestore
        .collection(VEHICLES_COLLECTION)
        .doc(id)
        .get();

      if (!vehicleDoc.exists) {
        return NextResponse.json(
          { error: 'Vehicle not found' },
          { status: 404 }
        );
      }

      const vehicle = {
        id: vehicleDoc.id,
        ...vehicleDoc.data(),
      };

      return NextResponse.json({
        vehicle,
      });
    } catch (firestoreError: any) {
      console.error('Firestore error fetching vehicle:', firestoreError);
      
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
    console.error('Error fetching vehicle:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch vehicle', 
        message: error.message || 'Unknown error',
        code: error.code,
      },
      { status: 500 }
    );
  }
}


