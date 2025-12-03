import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminFirestore } from "@/lib/firebase-admin";
import Stripe from "stripe";

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia',
    })
  : null

const TRANSACTIONS_COLLECTION = "clients/femileasing/transactions";
const FEMI_LEASING_ACCOUNT_ID = "acct_1SK6dd1IscTKUkb9";

/**
 * POST /api/admin/wallet/fund
 * Create a payment intent to fund the wallet (platform → Femi Leasing)
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

    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    const body = await request.json();
    const { amount } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // Create payment intent that transfers to Femi Leasing account
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      description: 'Wallet Funding',
      metadata: {
        type: 'wallet_funding',
        client: 'femileasing',
      },
      transfer_data: {
        destination: FEMI_LEASING_ACCOUNT_ID,
      },
    });

    // Record transaction in Firestore
    await adminFirestore.collection(TRANSACTIONS_COLLECTION).add({
      type: 'funding',
      amount: amount,
      date: new Date().toISOString(),
      paymentIntentId: paymentIntent.id,
      status: 'pending',
    });

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: any) {
    console.error('Error funding wallet:', error);
    return NextResponse.json(
      { error: 'Failed to fund wallet', message: error.message },
      { status: 500 }
    );
  }
}

