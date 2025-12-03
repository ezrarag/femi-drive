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

// Simple in-memory cache (60 seconds TTL)
let cachedPayments: { data: any[], timestamp: number } | null = null;
const CACHE_TTL = 60 * 1000; // 60 seconds

/**
 * GET /api/admin/stripe/payments
 * Fetch itemized Stripe payments for FemiLeasing connected account
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
    
    if (!isAuthorizedAdmin(userEmail)) {
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

    // Check cache first
    if (cachedPayments && Date.now() - cachedPayments.timestamp < CACHE_TTL) {
      return NextResponse.json({
        payments: cachedPayments.data,
        count: cachedPayments.data.length,
        cached: true,
      });
    }

    // Fetch payment intents for FemiLeasing connected account
    let allPaymentIntents: Stripe.PaymentIntent[] = [];
    let hasMore = true;
    let startingAfter: string | undefined = undefined;
    
    try {
      while (hasMore) {
        const params: Stripe.PaymentIntentListParams = {
          limit: 100,
          expand: ['data.charges', 'data.latest_charge', 'data.customer'],
        };
        
        if (startingAfter) {
          params.starting_after = startingAfter;
        }
        
        const paymentIntents = await stripe.paymentIntents.list(params);
        
        // Filter for FemiLeasing connected account
        const femiPayments = paymentIntents.data.filter(payment => 
          payment.transfer_data?.destination === FEMI_LEASING_ACCOUNT_ID ||
          payment.metadata?.project === "femi-leasing" ||
          payment.metadata?.client === "femileasing"
        );
        
        allPaymentIntents = allPaymentIntents.concat(femiPayments);
        
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

    // Map payment intents to our format
    const payments = allPaymentIntents.map((pi) => {
      // Get payment method details from charges
      let paymentMethod = 'Unknown';
      let customerEmail = '';
      let customerName = '';
      let paymentDate = pi.created; // Default to payment intent created date
      
      // Get customer object if expanded
      const stripeCustomer = (pi.customer && typeof pi.customer === 'object') 
        ? pi.customer as Stripe.Customer 
        : null;
      
      if (pi.charges) {
        const charges = Array.isArray(pi.charges) 
          ? pi.charges 
          : (pi.charges as any).data || [];
        
        if (charges.length > 0 && charges[0]) {
          const charge = charges[0] as Stripe.Charge;
          
          // Use charge created date (more accurate than payment intent)
          paymentDate = charge.created;
          
          paymentMethod = charge.payment_method_details?.type || 
                          charge.payment_method_details?.card?.brand?.toUpperCase() || 
                          'Unknown';
          
          // Format payment method display name
          if (paymentMethod === 'card' && charge.payment_method_details?.card) {
            const brand = charge.payment_method_details.card.brand?.toUpperCase() || 'Card';
            const last4 = charge.payment_method_details.card.last4 || '';
            paymentMethod = `${brand} •••• ${last4}`;
          } else if (paymentMethod === 'cashapp') {
            paymentMethod = 'Cash App Pay';
          } else if (paymentMethod === 'link') {
            paymentMethod = 'Link';
          } else if (paymentMethod === 'affirm') {
            paymentMethod = 'Affirm';
          } else if (paymentMethod === 'klarna') {
            paymentMethod = 'Klarna';
          } else if (paymentMethod === 'us_bank_account') {
            paymentMethod = 'ACH Direct Debit';
          }
          
          // Priority order for customer email:
          // 1. Charge billing details email
          // 2. Stripe Customer email
          // 3. Payment intent receipt email
          // 4. Metadata emails
          customerEmail = charge.billing_details?.email || 
                         (stripeCustomer?.email || '') ||
                         pi.receipt_email || 
                         pi.metadata?.customer_email || 
                         pi.metadata?.customerEmail ||
                         pi.metadata?.investor_email ||
                         '';
          
          // Priority order for customer name:
          // 1. Charge billing details name
          // 2. Stripe Customer name
          // 3. Metadata names
          customerName = charge.billing_details?.name || 
                        (stripeCustomer?.name || '') ||
                        pi.metadata?.customer_name || 
                        pi.metadata?.customerName ||
                        '';
        }
      }
      
      // Fallback to Stripe Customer if charge didn't have info
      if (!customerEmail && stripeCustomer?.email) {
        customerEmail = stripeCustomer.email;
      }
      if (!customerName && stripeCustomer?.name) {
        customerName = stripeCustomer.name;
      }
      
      // Final fallback: extract from email or use Unknown
      if (!customerName && customerEmail) {
        customerName = customerEmail.split('@')[0] || 'Unknown';
      } else if (!customerName) {
        customerName = 'Unknown';
      }

      // Build Stripe dashboard URL
      const stripeUrl = `https://dashboard.stripe.com/payments/${pi.id}`;

      return {
        id: pi.id,
        amount: pi.amount / 100, // Convert from cents
        currency: pi.currency.toUpperCase(),
        status: pi.status.charAt(0).toUpperCase() + pi.status.slice(1), // Capitalize first letter
        paymentMethod,
        description: pi.description || pi.metadata?.description || pi.metadata?.type || 'Payment',
        customerEmail: customerEmail || 'No email',
        customerName,
        createdAt: new Date(paymentDate * 1000).toISOString(),
        stripeUrl,
      };
    }));

    // Sort by date (newest first)
    payments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Cache the results
    cachedPayments = {
      data: payments,
      timestamp: Date.now(),
    };

    return NextResponse.json({
      payments,
      count: payments.length,
      cached: false,
    });
  } catch (error: any) {
    console.error('Error fetching Stripe payments:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch Stripe payments', 
        message: error.message || 'Unknown error',
        type: error.type || 'unknown',
      },
      { status: 500 }
    );
  }
}

