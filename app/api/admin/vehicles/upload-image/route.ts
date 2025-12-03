import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminFirestore } from "@/lib/firebase-admin";
import { isAuthorizedAdmin } from "@/lib/admin-authorized-emails";
import { getStorage } from "firebase-admin/storage";

/**
 * POST /api/admin/vehicles/upload-image
 * Upload vehicle image to Firebase Storage
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

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const vehicleId = formData.get('vehicleId') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    // Get Firebase Storage
    const storage = getStorage();
    const bucket = storage.bucket();
    
    // Generate unique filename
    const timestamp = Date.now();
    const filename = `femileasing/vehicles/${vehicleId || 'temp'}/${timestamp}-${file.name}`;
    
    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Upload to Firebase Storage
    const fileRef = bucket.file(filename);
    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type,
      },
    });

    // Make file publicly accessible
    await fileRef.makePublic();

    // Get public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename,
    });
  } catch (error: any) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: 'Failed to upload image', message: error.message },
      { status: 500 }
    );
  }
}

