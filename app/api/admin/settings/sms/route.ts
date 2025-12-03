import { NextRequest, NextResponse } from 'next/server'
import { adminFirestore } from '@/lib/firebase-admin'
import { isAuthorizedAdmin } from '@/lib/admin-authorized-emails'

const ADMIN_SMS_SETTINGS_COLLECTION = 'admin_sms_settings'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split('Bearer ')[1]
    
    // Verify token and get user email
    const { adminAuth } = await import('@/lib/firebase-admin')
    if (!adminAuth) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const decodedToken = await adminAuth.verifyIdToken(token)
    const userEmail = decodedToken.email

    if (!userEmail || !(await isAuthorizedAdmin(userEmail))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Check if Firestore is initialized
    if (!adminFirestore) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    // Fetch SMS settings for this admin
    const docRef = adminFirestore.collection(ADMIN_SMS_SETTINGS_COLLECTION).doc(userEmail.toLowerCase())
    const doc = await docRef.get()

    if (!doc.exists) {
      return NextResponse.json({
        phoneNumber: '',
        enabled: false
      })
    }

    const data = doc.data()
    return NextResponse.json({
      phoneNumber: data?.phoneNumber || '',
      enabled: data?.enabled || false
    })
  } catch (error: any) {
    console.error('Error fetching SMS settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch SMS settings', message: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split('Bearer ')[1]
    
    // Verify token and get user email
    const { adminAuth } = await import('@/lib/firebase-admin')
    if (!adminAuth) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const decodedToken = await adminAuth.verifyIdToken(token)
    const userEmail = decodedToken.email

    if (!userEmail || !(await isAuthorizedAdmin(userEmail))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const { phoneNumber, enabled } = body

    // Validate phone number format (basic validation)
    if (phoneNumber && !phoneNumber.match(/^\+?[1-9]\d{1,14}$/)) {
      return NextResponse.json(
        { error: 'Invalid phone number format. Please include country code (e.g., +15551234567)' },
        { status: 400 }
      )
    }

    // Check if Firestore is initialized
    if (!adminFirestore) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    // Save SMS settings
    const docRef = adminFirestore.collection(ADMIN_SMS_SETTINGS_COLLECTION).doc(userEmail.toLowerCase())
    await docRef.set({
      email: userEmail.toLowerCase(),
      phoneNumber: phoneNumber || '',
      enabled: enabled === true,
      updatedAt: new Date().toISOString()
    }, { merge: true })

    return NextResponse.json({
      success: true,
      phoneNumber: phoneNumber || '',
      enabled: enabled === true
    })
  } catch (error: any) {
    console.error('Error saving SMS settings:', error)
    return NextResponse.json(
      { error: 'Failed to save SMS settings', message: error.message },
      { status: 500 }
    )
  }
}

