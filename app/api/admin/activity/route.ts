import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminFirestore } from "@/lib/firebase-admin";
import { isAuthorizedAdmin } from "@/lib/admin-authorized-emails";

const ACTIVITY_COLLECTION = "admin_activity";

/**
 * GET /api/admin/activity
 * Fetch admin activity log
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

    // Fetch activity log
    const activitySnapshot = await adminFirestore
      .collection(ACTIVITY_COLLECTION)
      .orderBy('timestamp', 'desc')
      .limit(100)
      .get();

    const activities = activitySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate?.()?.toISOString() || doc.data().timestamp || new Date().toISOString(),
    }));

    return NextResponse.json({
      activities,
      count: activities.length,
    });
  } catch (error: any) {
    console.error('Error fetching activity log:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity log', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/activity
 * Log admin activity
 */
export async function POST(request: NextRequest) {
  try {
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
    const { action, entity_type, entity_id, details } = body;

    // Log activity
    await adminFirestore.collection(ACTIVITY_COLLECTION).add({
      admin_email: decodedToken.email,
      admin_name: decodedToken.name || decodedToken.email.split('@')[0],
      action, // 'created', 'updated', 'deleted'
      entity_type, // 'vehicle', 'booking', etc.
      entity_id,
      details: details || {},
      timestamp: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error logging activity:', error);
    return NextResponse.json(
      { error: 'Failed to log activity', message: error.message },
      { status: 500 }
    );
  }
}

