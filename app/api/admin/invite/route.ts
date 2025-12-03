import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminFirestore } from "@/lib/firebase-admin";
import { isAuthorizedAdmin } from "@/lib/admin-authorized-emails";
import { sendEmail } from "@/utils/sendEmail";
import { randomUUID } from "crypto";

const ADMIN_INVITES_COLLECTION = "admin_invites";

/**
 * POST /api/admin/invite
 * Create an admin invitation with QR code
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

    // Only allow authorized admins to create invitations
    // Use async version since isAuthorizedAdmin is now async
    const isAuthorized = await isAuthorizedAdmin(decodedToken.email);
    if (!isAuthorized) {
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
    const { email, role = 'admin' } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Generate secure invitation token using UUID
    const inviteToken = randomUUID();
    const baseUrl = process.env.NEXT_PUBLIC_ADMIN_INVITE_URL || 
                    process.env.NEXT_PUBLIC_BASE_URL || 
                    'http://localhost:3000';
    const inviteUrl = `${baseUrl}/admin/accept-invite?token=${inviteToken}`;

    // Store invitation in Firestore (use token as document ID for easy lookup)
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours
    
    await adminFirestore.collection(ADMIN_INVITES_COLLECTION).doc(inviteToken).set({
      email: email.toLowerCase(),
      role,
      token: inviteToken,
      invited_by: decodedToken.email,
      created_at: new Date(),
      expires_at: expiresAt,
      used: false,
    });

    // Send invitation email
    const emailSent = await sendEmail({
      to: email,
      subject: `You've been invited to join Femi Leasing Admin`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h2 style="color: #1f2937; margin-bottom: 20px; font-size: 24px;">Admin Access Invitation</h2>
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 16px;">
              You've been invited to join the <strong>Femi Leasing</strong> Admin team as a <strong style="color: #eab308;">${role}</strong>.
            </p>
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 30px;">
              Click the button below to accept your invitation and sign in to the admin dashboard:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${inviteUrl}" style="background-color: #eab308; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">
                Accept Invitation
              </a>
            </div>
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
              <p style="color: #6b7280; font-size: 14px; margin-bottom: 12px;">
                Or copy and paste this link into your browser:
              </p>
              <p style="background-color: #f3f4f6; padding: 12px; border-radius: 4px; word-break: break-all; font-family: monospace; font-size: 12px; color: #3b82f6;">
                <a href="${inviteUrl}" style="color: #3b82f6; text-decoration: none;">${inviteUrl}</a>
              </p>
            </div>
            <p style="color: #6b7280; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              ⏰ This invitation will expire in <strong>48 hours</strong>.<br>
              🔐 You'll need to sign in with Google using the email address: <strong>${email}</strong>
            </p>
          </div>
          <p style="color: #9ca3af; font-size: 11px; text-align: center; margin-top: 20px;">
            This is an automated message from Femi Leasing Admin System.
          </p>
        </div>
      `,
      text: `You've been invited to join the Femi Leasing Admin team as a ${role}.\n\nAccept your invitation by clicking this link:\n${inviteUrl}\n\n⏰ This invitation expires in 48 hours.\n🔐 Sign in with Google using: ${email}\n\nIf you didn't expect this invitation, you can safely ignore this email.`,
    });

    if (!emailSent.success) {
      console.error('❌ Failed to send invitation email:', {
        error: emailSent.error,
        email: email.toLowerCase(),
        inviteUrl,
      });
      
      // Return success with warning so invitation is still created
      // Admin can share the link manually if needed
      return NextResponse.json({
        success: true,
        warning: true,
        message: 'Invitation created but email failed to send',
        error: emailSent.error,
        inviteUrl, // Return URL for manual sharing
        email: email.toLowerCase(),
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Invitation email sent successfully',
      email: email.toLowerCase(),
      inviteUrl, // Return URL for manual sharing if needed
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error: any) {
    console.error('Error creating invitation:', error);
    return NextResponse.json(
      { error: 'Failed to create invitation', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/invite/[token]
 * Verify invitation token
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    if (!adminFirestore) {
      return NextResponse.json(
        { error: 'Server configuration error. Firebase Firestore not initialized.' },
        { status: 500 }
      );
    }

    // Find invitation by token (using document ID for faster lookup)
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

    return NextResponse.json({
      valid: true,
      email: invite.email,
      role: invite.role,
    });
  } catch (error: any) {
    console.error('Error verifying invitation:', error);
    return NextResponse.json(
      { error: 'Failed to verify invitation', message: error.message },
      { status: 500 }
    );
  }
}

