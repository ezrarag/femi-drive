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
    
    // Calculate 0.5% platform fee (rounded)
    const applicationFeeAmount = Math.round(amountInCents * 0.005);

    // Determine payment type and metadata
    const paymentType = metadata?.type || 'investment';
    const paymentMetadata = {
      type: paymentType,
      description: description || `${paymentType === 'booking' ? 'Booking' : 'Investment'} of $${amount}`,
      ...metadata, // Include all metadata fields
    };

    // Build PaymentIntent parameters - ALWAYS transfer to Femi Leasing connected account
    const params: Stripe.PaymentIntentCreateParams = {
      amount: amountInCents,
      currency: "usd",
      description: description || "Femi Leasing Investment",
      automatic_payment_methods: { enabled: true },
      metadata: paymentMetadata,
      // Always transfer to Femi Leasing connected account
      transfer_data: { 
        destination: connectedAccountId || "acct_1SK6dd1lscTKUkb9" 
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
      stack: err.stack,
    });

    // Return detailed error info for debugging (don't keep this in production)
    return NextResponse.json(
      {
        error: "PaymentIntent creation failed",
        message: err.message,
        type: err.type,
        code: err.code,
      },
      { status: 500 }
    );
  }
}
