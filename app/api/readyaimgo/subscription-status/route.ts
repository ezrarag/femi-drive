import { NextRequest, NextResponse } from "next/server";
import { adminFirestore } from "@/lib/firebase-admin";

const SUBSCRIPTION_COLLECTION = "subscriptions";
const CLIENT_ID = "femileasing";

/**
 * GET /api/readyaimgo/subscription-status
 * Public API endpoint for ReadyAimGo to check FemiLeasing subscription status
 * This endpoint can be called by readyaimgo.biz to verify subscription is active
 */
export async function GET(request: NextRequest) {
  try {
    // Check for API key authentication (optional but recommended)
    const apiKey = request.headers.get('x-api-key') || request.headers.get('authorization')?.replace('Bearer ', '');
    const expectedApiKey = process.env.READYAIMGO_API_KEY;

    // If API key is configured, validate it
    if (expectedApiKey && apiKey !== expectedApiKey) {
      return NextResponse.json(
        { error: 'Unauthorized. Invalid API key.' },
        { status: 401 }
      );
    }

    if (!adminFirestore) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Fetch subscription status from Firestore
    const subscriptionDoc = await adminFirestore
      .collection(SUBSCRIPTION_COLLECTION)
      .doc(CLIENT_ID)
      .get();

    if (!subscriptionDoc.exists) {
      return NextResponse.json({
        client_id: CLIENT_ID,
        active: false,
        status: 'inactive',
        message: 'No subscription found',
        last_payment: null,
        next_payment_due: null,
      });
    }

    const subscriptionData = subscriptionDoc.data();
    const isActive = subscriptionData?.active === true && subscriptionData?.status === 'active';

    return NextResponse.json({
      client_id: CLIENT_ID,
      active: isActive,
      status: subscriptionData?.status || 'inactive',
      plan: subscriptionData?.plan || 'c-suite',
      last_payment: subscriptionData?.last_payment || null,
      next_payment_due: subscriptionData?.next_payment_due || null,
      created_at: subscriptionData?.created_at || null,
      updated_at: subscriptionData?.updated_at || null,
      metadata: subscriptionData?.metadata || {},
    });
  } catch (error: any) {
    console.error('Error fetching subscription status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription status', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/readyaimgo/subscription-status
 * Webhook endpoint for ReadyAimGo to update subscription status
 * This allows readyaimgo.biz to push subscription updates to femileasing
 */
export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature (optional but recommended)
    const apiKey = request.headers.get('x-api-key') || request.headers.get('authorization')?.replace('Bearer ', '');
    const expectedApiKey = process.env.READYAIMGO_API_KEY;

    if (expectedApiKey && apiKey !== expectedApiKey) {
      return NextResponse.json(
        { error: 'Unauthorized. Invalid API key.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { status, active, plan, last_payment, next_payment_due, metadata } = body;

    if (!adminFirestore) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Update subscription status in Firestore
    await adminFirestore
      .collection(SUBSCRIPTION_COLLECTION)
      .doc(CLIENT_ID)
      .set({
        client_id: CLIENT_ID,
        active: active === true,
        status: status || 'inactive',
        plan: plan || 'c-suite',
        last_payment: last_payment || null,
        next_payment_due: next_payment_due || null,
        metadata: metadata || {},
        updated_at: new Date().toISOString(),
        updated_by: 'readyaimgo',
      }, { merge: true });

    return NextResponse.json({
      success: true,
      message: 'Subscription status updated',
      client_id: CLIENT_ID,
    });
  } catch (error: any) {
    console.error('Error updating subscription status:', error);
    return NextResponse.json(
      { error: 'Failed to update subscription status', message: error.message },
      { status: 500 }
    );
  }
}

