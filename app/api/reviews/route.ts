import { NextRequest, NextResponse } from 'next/server'
import { adminFirestore } from '@/lib/firebase-admin'

// GET - Fetch all reviews
export async function GET() {
  try {
    const db = adminFirestore
    const reviewsSnapshot = await db
      .collection('reviews')
      .orderBy('createdAt', 'desc')
      .get()

    const reviews = reviewsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
    }))

    return NextResponse.json({ reviews })
  } catch (error: any) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews', message: error.message },
      { status: 500 }
    )
  }
}

// POST - Create a new review
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      rating,
      bookingStartDate,
      bookingEndDate,
      question1,
      question2,
      question3,
      question4,
      question5,
      comment,
    } = body

    // Validate required fields
    if (!name || !rating || !bookingStartDate || !bookingEndDate) {
      return NextResponse.json(
        { error: 'Missing required fields: name, rating, bookingStartDate, bookingEndDate' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    const db = adminFirestore
    const reviewData = {
      name,
      rating: Number(rating),
      bookingStartDate,
      bookingEndDate,
      question1: question1 || '',
      question2: question2 || '',
      question3: question3 || '',
      question4: question4 || '',
      question5: question5 || '',
      comment: comment || '',
      createdAt: adminFirestore.FieldValue.serverTimestamp(),
      approved: false, // Reviews need admin approval
    }

    const docRef = await db.collection('reviews').add(reviewData)

    return NextResponse.json({
      success: true,
      id: docRef.id,
      message: 'Review submitted successfully. It will be reviewed before being displayed.',
    })
  } catch (error: any) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { error: 'Failed to create review', message: error.message },
      { status: 500 }
    )
  }
}

