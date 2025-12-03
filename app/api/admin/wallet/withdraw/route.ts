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
 * POST /api/admin/wallet/withdraw
 * Create a payout from Femi Leasing account to bank
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

    // Create payout from connected account
    const payout = await stripe.payouts.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      description: 'Wallet Withdrawal',
    }, {
      stripeAccount: FEMI_LEASING_ACCOUNT_ID,
    });

    // Record transaction in Firestore
    await adminFirestore.collection(TRANSACTIONS_COLLECTION).add({
      type: 'withdrawal',
      amount: amount,
      date: new Date().toISOString(),
      payoutId: payout.id,
      status: payout.status,
    });

    return NextResponse.json({
      success: true,
      payoutId: payout.id,
    });
  } catch (error: any) {
    console.error('Error withdrawing:', error);
    return NextResponse.json(
      { error: 'Failed to withdraw', message: error.message },
      { status: 500 }
    );
  }
}

