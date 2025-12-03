import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { isAuthorizedAdmin } from "@/lib/admin-authorized-emails";
import Stripe from "stripe";

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia',
    })
  : null

const FEMI_LEASING_ACCOUNT_ID = "acct_1SK6dd1IscTKUkb9";

/**
 * GET /api/admin/customers
 * Fetch all customers who have made payments to Femi Leasing
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
    
    if (!userEmail || !(await isAuthorizedAdmin(userEmail))) {
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

    // Fetch all payment intents destined for Femi Leasing
    // Use pagination to get all payments, not just the first 100
    let allPaymentIntents: Stripe.PaymentIntent[] = [];
    let hasMore = true;
    let startingAfter: string | undefined = undefined;
    
    try {
      while (hasMore) {
        const params: Stripe.PaymentIntentListParams = {
          limit: 100,
          expand: ['data.charges'],
        };
        
        if (startingAfter) {
          params.starting_after = startingAfter;
        }
        
        const paymentIntents = await stripe.paymentIntents.list(params);
        allPaymentIntents = allPaymentIntents.concat(paymentIntents.data);
        
        hasMore = paymentIntents.has_more;
        if (paymentIntents.data.length > 0) {
          startingAfter = paymentIntents.data[paymentIntents.data.length - 1].id;
        } else {
          hasMore = false;
        }
        
        // Limit to prevent timeout (max 1000 payments)
        if (allPaymentIntents.length >= 1000) {
          hasMore = false;
        }
      }
    } catch (stripeError: any) {
      console.error('Stripe API error:', stripeError);
      return NextResponse.json(
        { 
          error: 'Failed to fetch payment intents from Stripe', 
          message: stripeError.message,
          details: stripeError.type || 'unknown'
        },
        { status: 500 }
      );
    }

    // Filter payments for Femi Leasing (exclude subscription payments)
    const femiPayments = allPaymentIntents.filter(payment => {
      // Must be a payment TO FemiLeasing (has transfer_data destination)
      const isToFemiLeasing = payment.transfer_data?.destination === FEMI_LEASING_ACCOUNT_ID;
      
      // Exclude subscription payments (these are FROM FemiLeasing TO ReadyAimGo)
      const isSubscriptionPayment = 
        payment.metadata?.type === 'subscription' ||
        payment.metadata?.subscription === 'true' ||
        payment.metadata?.subscription_payment === 'true' ||
        (payment.metadata?.from === 'femileasing' && payment.metadata?.to === 'readyaimgo') ||
        payment.description?.toLowerCase().includes('readyaimgo') ||
        payment.description?.toLowerCase().includes('subscription');
      
      // Include booking and direct payment types
      const isBookingOrPayment = 
        payment.metadata?.type === 'booking' ||
        payment.metadata?.type === 'direct_payment' ||
        payment.metadata?.type === 'investment' ||
        payment.metadata?.project === "femi-leasing" ||
        payment.metadata?.client === "femileasing";
      
      return isToFemiLeasing && !isSubscriptionPayment && (isBookingOrPayment || !payment.metadata?.type);
    });

    // Extract unique customers from payments
    const customersMap = new Map<string, {
      email: string
      name: string
      totalSpent: number
      paymentCount: number
      lastPayment: string
      firstPayment: string
    }>();

    femiPayments.forEach(payment => {
      // Get customer email from various sources
      // Handle charges as both expanded list object and array
      let chargeEmail = '';
      let chargeName = '';
      
      if (payment.charges) {
        // Charges can be a list object (when expanded) or an array
        const charges = Array.isArray(payment.charges) 
          ? payment.charges 
          : (payment.charges as any).data || [];
        
        if (charges.length > 0 && charges[0]) {
          const firstCharge = charges[0] as Stripe.Charge;
          chargeEmail = firstCharge.billing_details?.email || '';
          chargeName = firstCharge.billing_details?.name || '';
        }
      }
      
      const email = 
        payment.receipt_email ||
        payment.metadata?.customer_email ||
        payment.metadata?.customerEmail ||
        payment.metadata?.investor_email ||
        chargeEmail ||
        '';

      if (!email) return;

      const name = 
        payment.metadata?.customer_name ||
        payment.metadata?.customerName ||
        chargeName ||
        email.split('@')[0];

      const amount = payment.amount / 100; // Convert from cents
      const paymentDate = new Date(payment.created * 1000).toISOString();

      if (customersMap.has(email)) {
        const customer = customersMap.get(email)!;
        customer.totalSpent += amount;
        customer.paymentCount += 1;
        if (paymentDate > customer.lastPayment) {
          customer.lastPayment = paymentDate;
        }
        if (paymentDate < customer.firstPayment) {
          customer.firstPayment = paymentDate;
        }
      } else {
        customersMap.set(email, {
          email,
          name,
          totalSpent: amount,
          paymentCount: 1,
          lastPayment: paymentDate,
          firstPayment: paymentDate,
        });
      }
    });

    // Convert map to array and sort by last payment date
    const customers = Array.from(customersMap.values())
      .sort((a, b) => new Date(b.lastPayment).getTime() - new Date(a.lastPayment).getTime());

    return NextResponse.json({
      customers,
      count: customers.length,
    });
  } catch (error: any) {
    console.error('Error fetching customers:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { 
        error: 'Failed to fetch customers', 
        message: error.message || 'Unknown error',
        type: error.type || 'unknown',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

