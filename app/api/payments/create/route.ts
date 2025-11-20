import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: Request) {
  try {
    // Check environment variable
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      console.error("❌ Missing STRIPE_SECRET_KEY in environment variables.");
      return NextResponse.json({ error: "Missing Stripe secret key." }, { status: 500 });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const body = await req.json();

    console.log("📦 Incoming request body:", body);

    const { amount, connectedAccountId, description, metadata } = body;

    if (!amount || isNaN(amount)) {
      console.error("❌ Invalid or missing amount:", amount);
      return NextResponse.json({ error: "Invalid or missing amount." }, { status: 400 });
    }

    // Convert USD to cents
    const amountInCents = Math.round(amount * 100);
    
    // Stripe minimum amount is $0.50 (50 cents)
    if (amountInCents < 50) {
      console.error("❌ Amount too small:", amountInCents);
      return NextResponse.json({ 
        error: "Amount must be at least $0.50",
        code: "amount_too_small"
      }, { status: 400 });
    }
    
    // Validate connected account ID format
    const accountId = connectedAccountId || "acct_1SK6dd1lscTKUkb9";
    if (!accountId.startsWith("acct_")) {
      console.error("❌ Invalid connected account ID format:", accountId);
      return NextResponse.json({ 
        error: "Invalid connected account ID format",
        code: "invalid_account_id"
      }, { status: 400 });
    }
    
    // Calculate 0.5% platform fee (rounded)
    const applicationFeeAmount = Math.round(amountInCents * 0.005);

    // Determine payment type and metadata
    const paymentType = metadata?.type || 'investment';
    
    // Format metadata - Stripe requires all values to be strings and keys/values have length limits
    const paymentMetadata: Record<string, string> = {
      type: String(paymentType),
      client: 'femileasing', // Mark as Femi Leasing payment
      project: 'femi-leasing', // Project identifier
    };
    
    // Add all metadata fields, ensuring all values are strings and within limits
    if (metadata) {
      for (const [key, value] of Object.entries(metadata)) {
        // Stripe metadata keys must be <= 40 chars, values <= 500 chars
        const keyStr = String(key).substring(0, 40);
        const valueStr = String(value).substring(0, 500);
        paymentMetadata[keyStr] = valueStr;
      }
    }

    // Build PaymentIntent parameters - ALWAYS transfer to Femi Leasing connected account
    const params: Stripe.PaymentIntentCreateParams = {
      amount: amountInCents,
      currency: "usd",
      description: description || "Femi Leasing Investment",
      automatic_payment_methods: { enabled: true },
      metadata: paymentMetadata,
      // Always transfer to Femi Leasing connected account
      transfer_data: { 
        destination: accountId
      },
      // Always apply 0.5% platform fee
      application_fee_amount: applicationFeeAmount,
    };

    console.log("🧮 PaymentIntent params:", params);

    // Attempt to create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create(params);
    console.log("✅ PaymentIntent created:", paymentIntent.id);

    return NextResponse.json({ 
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (err: any) {
    console.error("🚨 Stripe PaymentIntent creation failed:", {
      message: err.message,
      type: err.type,
      code: err.code,
      statusCode: err.statusCode,
      raw: err.raw,
      stack: err.stack,
    });

    // Return detailed error info for debugging
    const errorMessage = err.message || "PaymentIntent creation failed";
    const errorCode = err.code || err.type || "unknown_error";
    
    return NextResponse.json(
      {
        error: "PaymentIntent creation failed",
        message: errorMessage,
        code: errorCode,
        // Include more details in development
        ...(process.env.NODE_ENV === 'development' && {
          details: {
            type: err.type,
            statusCode: err.statusCode,
            declineCode: err.decline_code,
            param: err.param,
          }
        }),
      },
      { status: 500 }
    );
  }
}
