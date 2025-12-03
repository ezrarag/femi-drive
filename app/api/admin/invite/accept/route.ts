import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminFirestore } from "@/lib/firebase-admin";
import { isAuthorizedAdmin } from "@/lib/admin-authorized-emails";

const ADMIN_INVITES_COLLECTION = "admin_invites";
const AUTHORIZED_ADMINS_COLLECTION = "authorized_admins";

/**
 * POST /api/admin/invite/accept
 * Accept an invitation and add email to authorized list
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

    if (!adminFirestore) {
      return NextResponse.json(
        { error: 'Server configuration error. Firebase Firestore not initialized.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Verify invitation (using document ID for faster lookup)
    const inviteDoc = await adminFirestore
      .collection(ADMIN_INVITES_COLLECTION)
      .doc(token)
      .get();

    if (!inviteDoc.exists) {
      return NextResponse.json(
        { error: 'Invalid or expired invitation' },
        { status: 404 }
      );
    }

    const invite = inviteDoc.data()!;
    
    // Check if already used
    if (invite.used === true) {
      return NextResponse.json(
        { error: 'This invitation has already been used' },
        { status: 400 }
      );
    }

    const expiresAt = invite.expires_at?.toDate?.() || new Date(invite.expires_at);

    if (expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Invitation has expired' },
        { status: 400 }
      );
    }

    // Verify the user's email matches the invitation
    if (decodedToken.email?.toLowerCase() !== invite.email.toLowerCase()) {
      return NextResponse.json(
        { error: 'Email does not match invitation' },
        { status: 403 }
      );
    }

    // Add to authorized admins collection (use email as document ID to prevent duplicates)
    await adminFirestore.collection(AUTHORIZED_ADMINS_COLLECTION).doc(invite.email.toLowerCase()).set({
      email: invite.email.toLowerCase(),
      role: invite.role,
      added_by: invite.invited_by,
      added_at: new Date(),
      status: 'active',
    }, { merge: true });

    // Mark invitation as used (using token as document ID)
    await adminFirestore.collection(ADMIN_INVITES_COLLECTION).doc(token).update({
      used: true,
      used_at: new Date(),
      used_by: decodedToken.email,
    });

    return NextResponse.json({
      success: true,
      message: 'Invitation accepted. You now have admin access.',
    });
  } catch (error: any) {
    console.error('Error accepting invitation:', error);
    return NextResponse.json(
      { error: 'Failed to accept invitation', message: error.message },
      { status: 500 }
    );
  }
}

