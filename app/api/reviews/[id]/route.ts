import { NextRequest, NextResponse } from 'next/server'
import { adminFirestore } from '@/lib/firebase-admin'

// DELETE - Delete a review (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Add admin authentication check
    const db = adminFirestore
    await db.collection('reviews').doc(params.id).delete()

    return NextResponse.json({ success: true, message: 'Review deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting review:', error)
    return NextResponse.json(
      { error: 'Failed to delete review', message: error.message },
      { status: 500 }
    )
  }
}

// PATCH - Update review (e.g., approve/reject)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Add admin authentication check
    const body = await request.json()
    const db = adminFirestore
    
    await db.collection('reviews').doc(params.id).update({
      ...body,
      updatedAt: adminFirestore.FieldValue.serverTimestamp(),
    })

    return NextResponse.json({ success: true, message: 'Review updated successfully' })
  } catch (error: any) {
    console.error('Error updating review:', error)
    return NextResponse.json(
      { error: 'Failed to update review', message: error.message },
      { status: 500 }
    )
  }
}

