import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminFirestore } from "@/lib/firebase-admin";

const ALLOCATIONS_COLLECTION = "clients/femileasing/admin/allocationSettings";

/**
 * GET /api/admin/wallet/allocations
 * Fetch allocation settings
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const idToken = authHeader.replace('Bearer ', '');
    const decodedToken = await adminAuth.verifyIdToken(idToken);

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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const doc = await adminFirestore.doc(ALLOCATIONS_COLLECTION).get();
    
    if (doc.exists) {
      return NextResponse.json({ allocations: doc.data() });
    } else {
      // Return default allocations
      const defaultAllocations = {
        vehicleManagement: 30,
        marketing: 20,
        operations: 10,
        maintenance: 10,
        insurance: 10,
        savings: 10,
        taxes: 10,
      };
      return NextResponse.json({ allocations: defaultAllocations });
    }
  } catch (error: any) {
    console.error('Error fetching allocations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch allocations', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/wallet/allocations
 * Save allocation settings
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const idToken = authHeader.replace('Bearer ', '');
    const decodedToken = await adminAuth.verifyIdToken(idToken);

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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { allocations } = body;

    // Validate total is 100%
    const total = Object.values(allocations).reduce((sum: number, val: any) => sum + val, 0);
    if (total !== 100) {
      return NextResponse.json(
        { error: 'Total allocation must equal 100%' },
        { status: 400 }
      );
    }

    await adminFirestore.doc(ALLOCATIONS_COLLECTION).set({
      ...allocations,
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error saving allocations:', error);
    return NextResponse.json(
      { error: 'Failed to save allocations', message: error.message },
      { status: 500 }
    );
  }
}

