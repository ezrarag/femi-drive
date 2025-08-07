import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Mock analytics data - in production, this would come from your database
    // You could store call data in Supabase and aggregate it here
    const analytics = {
      totalCalls: 150,
      averageDuration: 45000, // milliseconds
      averageConfidence: 0.85,
      escalationRate: 0.12,
      bookingRate: 0.23
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Failed to get analytics:', error)
    return NextResponse.json({ error: 'Failed to get analytics' }, { status: 500 })
  }
} 