import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { adminAuth } from "@/lib/firebase-admin";
import { updateSubscriptionStatus } from "@/lib/readyaimgo-webhook";

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia',
    })
  : null

const FEMI_LEASING_ACCOUNT_ID = "acct_1SK6dd1IscTKUkb9";

/**
 * GET /api/admin/subscription-payments
 * Fetches subscription payments made FROM Femi Leasing TO ReadyAimGo
 * 
 * These are payments where:
 * - The payment originates from Femi Leasing connected account
 * - The payment is a subscription payment to ReadyAimGo
 * - We look for charges with application_fee (platform fee) or direct charges to platform
 */
export async function GET(request: NextRequest) {
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
    const authorizedEmails = [
      'finance@readyaimgo.biz',
      'ezra@readyaimgo.biz',
      'femileasing@gmail.com',
    ];
    
    const isAuthorized = authorizedEmails.some(email => 
      userEmail?.toLowerCase().includes(email.toLowerCase())
    );

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe is not configured.' },
        { status: 500 }
      );
    }

    console.log('🔍 Fetching subscription payments from Femi Leasing to ReadyAimGo...');

    // Strategy 1: Look for payment intents with subscription metadata
    // These are payments FROM Femi Leasing TO ReadyAimGo (subscription payments)
    let subscriptionPaymentIntents: Stripe.PaymentIntent[] = [];
    
    try {
      // Fetch all payment intents and filter for subscription payments
      const paymentIntents = await stripe.paymentIntents.list({
        limit: 100,
        expand: ['data.charges', 'data.transfer_data'],
      });

      subscriptionPaymentIntents = paymentIntents.data.filter(pi => {
        // Check metadata for subscription indicators
        const metadata = pi.metadata || {};
        
        // Check if metadata explicitly indicates subscription payment FROM femileasing TO readyaimgo
        const isSubscriptionPayment = 
          metadata.type === 'subscription' ||
          metadata.subscription === 'true' ||
          metadata.subscription_payment === 'true' ||
          (metadata.from === 'femileasing' && metadata.to === 'readyaimgo') ||
          (metadata.client === 'femileasing' && metadata.subscription === 'true') ||
          // Also check description for subscription keywords
          (pi.description?.toLowerCase().includes('subscription') && 
           (metadata.client === 'femileasing' || metadata.from === 'femileasing'));
        
        // Also check if it's a payment that goes TO ReadyAimGo platform (not TO Femi Leasing)
        // Subscription payments FROM Femi Leasing TO ReadyAimGo would NOT have transfer_data.destination
        // OR would have transfer_data.destination pointing to ReadyAimGo's platform account
        const isToReadyAimGo = !pi.transfer_data?.destination || 
                                pi.transfer_data.destination !== FEMI_LEASING_ACCOUNT_ID;
        
        return isSubscriptionPayment && isToReadyAimGo;
      });

      console.log(`✅ Found ${subscriptionPaymentIntents.length} subscription payment intents`);
      
      // Log details of found payments for debugging
      subscriptionPaymentIntents.forEach(pi => {
        console.log(`  - Payment ${pi.id}: $${(pi.amount / 100).toFixed(2)}, Status: ${pi.status}, Metadata:`, pi.metadata);
      });
    } catch (error: any) {
      console.error('Error fetching payment intents:', error);
    }

    // Strategy 2: Look for charges with subscription metadata
    // These might be direct charges representing subscription payments
    let subscriptionCharges: Stripe.Charge[] = [];
    
    try {
      const charges = await stripe.charges.list({
        limit: 100,
        expand: ['data.payment_intent'],
      });

      subscriptionCharges = charges.data.filter(charge => {
        const metadata = charge.metadata || {};
        const paymentIntent = charge.payment_intent as Stripe.PaymentIntent | undefined;
        const piMetadata = paymentIntent?.metadata || {};
        
        // Check if charge or its payment intent has subscription metadata
        const isSubscription = 
          metadata.type === 'subscription' ||
          metadata.subscription === 'true' ||
          metadata.subscription_payment === 'true' ||
          piMetadata.type === 'subscription' ||
          piMetadata.subscription === 'true' ||
          (metadata.from === 'femileasing' && metadata.to === 'readyaimgo') ||
          (piMetadata.from === 'femileasing' && piMetadata.to === 'readyaimgo');
        
        return isSubscription;
      });

      console.log(`✅ Found ${subscriptionCharges.length} subscription charges`);
    } catch (error: any) {
      console.error('Error fetching charges:', error);
    }

    // Combine and format all subscription payments
    // Prioritize payment intents as they're the primary source
    const allPayments = [
      ...subscriptionPaymentIntents.map(pi => ({
        id: pi.id,
        type: 'payment_intent',
        amount: pi.amount / 100,
        currency: pi.currency,
        applicationFee: pi.application_fee_amount ? pi.application_fee_amount / 100 : 0,
        status: pi.status,
        description: pi.description || 'Subscription Payment',
        created: new Date(pi.created * 1000).toISOString(),
        receiptUrl: pi.charges?.data?.[0]?.receipt_url || null,
        metadata: pi.metadata,
        paymentIntentId: pi.id,
      })),
      ...subscriptionCharges
        .filter(charge => {
          // Only include charges that don't already have a payment intent in our list
          const piId = typeof charge.payment_intent === 'string' 
            ? charge.payment_intent 
            : (charge.payment_intent as Stripe.PaymentIntent)?.id;
          return !subscriptionPaymentIntents.some(pi => pi.id === piId);
        })
        .map(charge => ({
          id: charge.id,
          type: 'charge',
          amount: charge.amount / 100,
          currency: charge.currency,
          applicationFee: charge.application_fee_amount ? charge.application_fee_amount / 100 : 0,
          status: charge.status,
          description: charge.description || 'Subscription Payment',
          created: new Date(charge.created * 1000).toISOString(),
          receiptUrl: charge.receipt_url,
          metadata: charge.metadata,
          paymentIntentId: typeof charge.payment_intent === 'string' 
            ? charge.payment_intent 
            : (charge.payment_intent as Stripe.PaymentIntent)?.id,
        })),
    ];

    // Sort by most recent first
    allPayments.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());

    // Get the most recent payment
    const lastPayment = allPayments.length > 0 ? allPayments[0] : null;

    // Update subscription status if we have payments
    if (lastPayment && lastPayment.status === 'succeeded') {
      try {
        await updateSubscriptionStatus(
          true, // active
          'active',
          {
            amount: lastPayment.amount,
            currency: lastPayment.currency,
            date: lastPayment.created,
            payment_intent_id: lastPayment.paymentIntentId || lastPayment.id,
          },
          {
            total_payments: allPayments.length,
            total_amount: allPayments.reduce((sum, p) => sum + p.amount, 0),
          }
        );
      } catch (error) {
        console.error('Error updating subscription status:', error);
        // Don't fail the request if webhook fails
      }
    } else if (allPayments.length === 0) {
      // No payments found, mark as inactive
      try {
        await updateSubscriptionStatus(false, 'inactive');
      } catch (error) {
        console.error('Error updating subscription status:', error);
      }
    }

    console.log(`✅ Returning ${allPayments.length} subscription payments`);

    return NextResponse.json({
      payments: allPayments,
      lastPayment,
      totalPayments: allPayments.length,
      totalAmount: allPayments.reduce((sum, p) => sum + p.amount, 0),
    });
  } catch (error: any) {
    console.error('Error fetching subscription payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription payments', message: error.message },
      { status: 500 }
    );
  }
}

